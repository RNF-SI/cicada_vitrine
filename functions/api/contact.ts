/**
 * POST /api/contact — ouvre un ticket Zammad depuis le formulaire de la vitrine.
 *
 * Fonction Cloudflare Pages. Elle existe pour une seule raison : garder hors du
 * navigateur ce qui ne doit pas s'y trouver — le jeton d'API Zammad, la clé
 * secrète du captcha et l'adresse de support. Le client ne connaît que cette
 * route.
 *
 * Variables d'environnement à définir dans le projet Cloudflare Pages
 * (Settings → Environment variables), en « secret » pour les deux tokens :
 *
 * | Variable            | Exemple                          | Rôle                                        |
 * |---------------------|----------------------------------|---------------------------------------------|
 * | `ZAMMAD_URL`        | `https://support.example.org`    | Racine de l'instance Zammad, sans slash final |
 * | `ZAMMAD_TOKEN`      | (secret)                         | Jeton d'API d'un agent autorisé à créer des tickets |
 * | `ZAMMAD_GROUP`      | `Support`                        | Groupe Zammad destinataire (défaut : `Users`) |
 * | `TURNSTILE_SECRET`  | (secret)                         | Clé secrète Cloudflare Turnstile            |
 * | `SUPPORT_EMAIL`     | `support@cicada-app.org`         | Adresse de repli, jamais exposée au client  |
 *
 * Créer le jeton Zammad depuis le profil d'un agent dédié, avec les seules
 * permissions `ticket.agent` sur le groupe visé : si le jeton fuite, la portée
 * reste limitée à la création de tickets.
 */

interface Env {
  ZAMMAD_URL: string;
  ZAMMAD_TOKEN: string;
  ZAMMAD_GROUP?: string;
  TURNSTILE_SECRET: string;
  SUPPORT_EMAIL?: string;
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  organisation?: unknown;
  subject?: unknown;
  message?: unknown;
  captchaToken?: unknown;
}

/** Libellés des objets, repris du formulaire, pour composer le titre du ticket. */
const SUBJECT_LABELS: Record<string, string> = {
  saas: 'Demande d’instance hébergée',
  installation: 'Question sur l’installation autonome',
  bug: 'Signalement de problème',
  partenariat: 'Partenariat / présentation',
  autre: 'Demande diverse',
};

const MAX_LENGTHS = {
  name: 120,
  email: 254,
  organisation: 160,
  message: 4000,
} as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Rien à mettre en cache sur une création de ticket.
      'cache-control': 'no-store',
    },
  });
}

/** Normalise une valeur reçue : chaîne, sans espaces superflus, tronquée. */
function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Validation volontairement souple : on ne cherche pas à valider une adresse
 * selon la RFC, seulement à écarter les saisies qui n'ont aucune chance d'en
 * être une.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Vérifie le jeton Turnstile auprès de Cloudflare. */
async function verifyCaptcha(
  token: string,
  secret: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) {
    body.append('remoteip', remoteIp);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Service de vérification injoignable : on refuse plutôt que d'ouvrir la
    // porte au spam.
    return false;
  }
}

/**
 * Un seul export `onRequest`, qui filtre lui-même la méthode : Pages donne la
 * priorité au gestionnaire générique, un `onRequestPost` exporté à côté de lui
 * ne serait jamais appelé.
 */
export const onRequest = async (context: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }

  if (!env.ZAMMAD_URL || !env.ZAMMAD_TOKEN || !env.TURNSTILE_SECRET) {
    console.error('Configuration incomplète : variables Zammad ou Turnstile absentes.');
    return json({ ok: false, error: 'misconfigured' }, 500);
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = text(payload.name, MAX_LENGTHS.name);
  const email = text(payload.email, MAX_LENGTHS.email).toLowerCase();
  const organisation = text(payload.organisation, MAX_LENGTHS.organisation);
  const message = text(payload.message, MAX_LENGTHS.message);
  const subject = text(payload.subject, 32);
  const captchaToken = text(payload.captchaToken, 2048);

  if (!name || !looksLikeEmail(email) || message.length < 20 || !captchaToken) {
    return json({ ok: false, error: 'invalid_payload' }, 400);
  }

  const captchaOk = await verifyCaptcha(
    captchaToken,
    env.TURNSTILE_SECRET,
    request.headers.get('CF-Connecting-IP'),
  );
  if (!captchaOk) {
    return json({ ok: false, error: 'captcha_failed' }, 400);
  }

  const label = SUBJECT_LABELS[subject] ?? SUBJECT_LABELS['autre'];
  const group = env.ZAMMAD_GROUP ?? 'Users';

  // Corps du ticket en texte brut : lisible dans Zammad comme dans la
  // notification par courriel, et aucun risque d'injection HTML.
  const bodyLines = [
    `Nom : ${name}`,
    `Adresse : ${email}`,
    organisation ? `Structure : ${organisation}` : null,
    `Objet : ${label}`,
    '',
    message,
    '',
    '— Envoyé depuis le formulaire de contact du site de présentation de CICADA.',
  ].filter((line): line is string => line !== null);

  try {
    const response = await fetch(`${env.ZAMMAD_URL.replace(/\/+$/, '')}/api/v1/tickets`, {
      method: 'POST',
      headers: {
        authorization: `Token token=${env.ZAMMAD_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Vitrine] ${label} — ${name}`,
        group,
        // Zammad crée l'utilisateur à la volée s'il ne connaît pas l'adresse,
        // ce qui rattache l'échange au bon demandeur dès le premier message.
        customer_id: `guess:${email}`,
        article: {
          subject: label,
          from: `${name} <${email}>`,
          body: bodyLines.join('\n'),
          type: 'web',
          internal: false,
          content_type: 'text/plain',
        },
      }),
    });

    if (!response.ok) {
      // On journalise le détail côté serveur et on reste muet côté client :
      // la réponse de Zammad peut contenir des informations internes.
      console.error(
        'Zammad a refusé la création du ticket',
        response.status,
        await response.text(),
      );
      return json({ ok: false, error: 'ticket_failed' }, 502);
    }

    const ticket = (await response.json()) as { number?: string };
    return json({ ok: true, ticketNumber: ticket.number });
  } catch (error) {
    console.error('Zammad injoignable', error);
    return json({ ok: false, error: 'ticket_failed' }, 502);
  }
};
