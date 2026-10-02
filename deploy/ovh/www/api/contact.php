<?php

declare(strict_types=1);

/**
 * POST /api/contact.php — ouvre un ticket Zammad depuis le formulaire de la vitrine.
 *
 * Ce fichier est la seule partie dynamique du site : tout le reste est du HTML
 * statique. Il existe pour garder hors du navigateur ce qui ne doit pas s'y
 * trouver — le jeton d'API Zammad, la clé secrète du captcha et l'adresse de
 * support. Le client ne connaît que cette URL.
 *
 * Emplacement : ce fichier vit dans `deploy/ovh/www/api/` et non dans `public/`,
 * car `ng serve` servirait son source en clair et court-circuiterait le proxy du
 * développement. `npm run build` le copie dans `api/` à la racine du build, prêt
 * à être téléversé dans `www/` chez OVH. Les secrets, eux, vivent dans un
 * fichier de configuration placé **au-dessus** de la racine web, donc
 * inatteignable par HTTP — voir `deploy/ovh/README.md`.
 *
 * Une version équivalente pour Cloudflare Pages existe dans
 * `functions/api/contact.ts` ; les deux font exactement la même chose.
 */

// --- Réglages ----------------------------------------------------------------

/** Longueurs maximales acceptées, alignées sur la validation côté navigateur. */
const MAX_LENGTHS = [
    'name' => 120,
    'email' => 254,
    'organisation' => 160,
    'message' => 4000,
];

/** Libellés des objets, pour composer le titre du ticket. */
const SUBJECT_LABELS = [
    'saas' => 'Demande d’instance hébergée',
    'installation' => 'Question sur l’installation autonome',
    'bug' => 'Signalement de problème',
    'partenariat' => 'Partenariat / présentation',
    'autre' => 'Demande diverse',
];

/**
 * Emplacements possibles du fichier de configuration, essayés dans l'ordre.
 * Tous sont situés hors de la racine web : un fichier de secrets servi par
 * Apache serait une fuite immédiate.
 */
const CONFIG_CANDIDATES = [
    __DIR__ . '/../../cicada-vitrine-config.php',
    __DIR__ . '/../../../cicada-vitrine-config.php',
];

// --- Utilitaires -------------------------------------------------------------

/** Répond en JSON et termine. */
function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // Rien à mettre en cache sur une création de ticket.
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Lit la configuration : variables d'environnement d'abord (pratique sur un
 * conteneur ou un VPS), puis fichier de configuration (cas de l'hébergement
 * mutualisé, où l'on ne maîtrise pas l'environnement).
 */
function config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $config = [];
    foreach (CONFIG_CANDIDATES as $path) {
        if (is_readable($path)) {
            $loaded = require $path;
            if (is_array($loaded)) {
                $config = $loaded;
            }
            break;
        }
    }

    foreach (['ZAMMAD_URL', 'ZAMMAD_TOKEN', 'ZAMMAD_GROUP', 'TURNSTILE_SECRET'] as $key) {
        $value = getenv($key);
        if (is_string($value) && $value !== '') {
            $config[$key] = $value;
        }
    }

    return $config;
}

/** Normalise une valeur reçue : chaîne, sans espaces superflus, tronquée. */
function text(mixed $value, int $max): string
{
    return is_string($value) ? mb_substr(trim($value), 0, $max) : '';
}

/**
 * Validation volontairement souple : on ne cherche pas à valider une adresse
 * selon la RFC, seulement à écarter les saisies qui n'ont aucune chance d'en être.
 */
function looks_like_email(string $value): bool
{
    return (bool) filter_var($value, FILTER_VALIDATE_EMAIL);
}

/**
 * Requête HTTP POST. Utilise cURL s'il est disponible — c'est le cas sur la
 * quasi-totalité des hébergements — et retombe sinon sur les flux natifs.
 *
 * @return array{0:int,1:string} Code HTTP (0 si la requête n'a pas abouti) et corps.
 */
function http_post(string $url, string $body, array $headers, int $timeout = 10): array
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        if ($response === false) {
            error_log('cicada-vitrine : échec cURL vers ' . $url . ' — ' . curl_error($curl));
        }
        curl_close($curl);

        return [$status, is_string($response) ? $response : ''];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => $timeout,
            // On veut lire le corps même sur un 4xx, pour le journaliser.
            'ignore_errors' => true,
        ],
    ]);
    $response = @file_get_contents($url, false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $header, $matches) === 1) {
            $status = (int) $matches[1];
        }
    }

    return [$status, is_string($response) ? $response : ''];
}

/** Vérifie le jeton Turnstile auprès de Cloudflare. */
function verify_captcha(string $token, string $secret, ?string $remoteIp): bool
{
    $fields = ['secret' => $secret, 'response' => $token];
    if ($remoteIp !== null && $remoteIp !== '') {
        $fields['remoteip'] = $remoteIp;
    }

    [$status, $body] = http_post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        http_build_query($fields),
        ['Content-Type: application/x-www-form-urlencoded'],
    );

    if ($status !== 200) {
        // Service de vérification injoignable : on refuse plutôt que d'ouvrir
        // la porte au spam.
        error_log('cicada-vitrine : Turnstile injoignable (HTTP ' . $status . ')');
        return false;
    }

    $result = json_decode($body, true);

    return is_array($result) && ($result['success'] ?? false) === true;
}

// --- Traitement --------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$config = config();
foreach (['ZAMMAD_URL', 'ZAMMAD_TOKEN', 'TURNSTILE_SECRET'] as $required) {
    if (empty($config[$required])) {
        error_log('cicada-vitrine : configuration incomplète, ' . $required . ' absent.');
        respond(['ok' => false, 'error' => 'misconfigured'], 500);
    }
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($payload)) {
    respond(['ok' => false, 'error' => 'invalid_json'], 400);
}

$name = text($payload['name'] ?? null, MAX_LENGTHS['name']);
$email = mb_strtolower(text($payload['email'] ?? null, MAX_LENGTHS['email']));
$organisation = text($payload['organisation'] ?? null, MAX_LENGTHS['organisation']);
$message = text($payload['message'] ?? null, MAX_LENGTHS['message']);
$subject = text($payload['subject'] ?? null, 32);
$captchaToken = text($payload['captchaToken'] ?? null, 2048);

if ($name === '' || !looks_like_email($email) || mb_strlen($message) < 20 || $captchaToken === '') {
    respond(['ok' => false, 'error' => 'invalid_payload'], 400);
}

if (!verify_captcha($captchaToken, $config['TURNSTILE_SECRET'], $_SERVER['REMOTE_ADDR'] ?? null)) {
    respond(['ok' => false, 'error' => 'captcha_failed'], 400);
}

$label = SUBJECT_LABELS[$subject] ?? SUBJECT_LABELS['autre'];
$group = $config['ZAMMAD_GROUP'] ?? 'Users';

// Corps du ticket en texte brut : lisible dans Zammad comme dans la
// notification par courriel, et aucun risque d'injection HTML.
$lines = array_filter([
    'Nom : ' . $name,
    'Adresse : ' . $email,
    $organisation !== '' ? 'Structure : ' . $organisation : null,
    'Objet : ' . $label,
    '',
    $message,
    '',
    '— Envoyé depuis le formulaire de contact du site de présentation de CICADA.',
], static fn (?string $line): bool => $line !== null);

[$status, $body] = http_post(
    rtrim($config['ZAMMAD_URL'], '/') . '/api/v1/tickets',
    json_encode([
        'title' => '[Vitrine] ' . $label . ' — ' . $name,
        'group' => $group,
        // Zammad crée l'utilisateur à la volée s'il ne connaît pas l'adresse,
        // ce qui rattache l'échange au bon demandeur dès le premier message.
        'customer_id' => 'guess:' . $email,
        'article' => [
            'subject' => $label,
            'from' => $name . ' <' . $email . '>',
            'body' => implode("\n", $lines),
            'type' => 'web',
            'internal' => false,
            'content_type' => 'text/plain',
        ],
    ], JSON_UNESCAPED_UNICODE),
    [
        'Authorization: Token token=' . $config['ZAMMAD_TOKEN'],
        'Content-Type: application/json',
    ],
    15,
);

if ($status < 200 || $status >= 300) {
    // On journalise le détail côté serveur et on reste muet côté client : la
    // réponse de Zammad peut contenir des informations internes.
    error_log('cicada-vitrine : Zammad a refusé la création du ticket (HTTP ' . $status . ') — ' . $body);
    respond(['ok' => false, 'error' => 'ticket_failed'], 502);
}

$ticket = json_decode($body, true);

respond([
    'ok' => true,
    'ticketNumber' => is_array($ticket) ? ($ticket['number'] ?? null) : null,
]);
