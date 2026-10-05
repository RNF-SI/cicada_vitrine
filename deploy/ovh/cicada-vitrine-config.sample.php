<?php

/**
 * Configuration du formulaire de contact de la vitrine Cicada — MODÈLE.
 * =============================================================================
 *
 * MODE D'EMPLOI
 *
 * 1. Copier ce fichier sous le nom exact `cicada-vitrine-config.php`.
 * 2. Remplacer les quatre valeurs ci-dessous.
 * 3. Le déposer **à côté** du dossier `www`, jamais dedans.
 *
 * Chez OVH, l'arborescence doit ressembler à ceci :
 *
 *     /home/<compte>/
 *       ├── cicada-vitrine-config.php   ← CE FICHIER, avec les vraies valeurs
 *       └── www/                        ← contenu de dist/cicada-vitrine/browser
 *           ├── index.html
 *           ├── .htaccess
 *           └── api/
 *               └── contact.php         ← c'est lui qui lit ce fichier
 *
 * Pourquoi au-dessus de `www` : tout ce qui est dans `www` est servi par Apache.
 * Un fichier de secrets déposé là serait téléchargeable par n'importe qui.
 *
 * Ne jamais committer le fichier rempli. Il est déjà dans `.gitignore`, mais la
 * vigilance reste de mise : ce fichier donne un accès en écriture à Zammad.
 */

return [
    /*
     * ZAMMAD_URL — racine de l'instance Zammad.
     *
     * L'adresse à laquelle vous vous connectez à Zammad, SANS slash final et
     * SANS `/api/v1`. Le script ajoute lui-même le chemin de l'API.
     *
     *   correct   : 'https://support.rnfrance.org'
     *   incorrect : 'https://support.rnfrance.org/'
     *   incorrect : 'https://support.rnfrance.org/api/v1'
     */
    'ZAMMAD_URL' => 'https://support.exemple.org',

    /*
     * ZAMMAD_TOKEN — jeton d'API.
     *
     * Où le créer :
     *   1. Admin → Système → API : vérifier que « Token Access » est activé.
     *   2. Créer un agent dédié (par exemple « Formulaire vitrine ») avec la
     *      seule permission `ticket.agent` sur le groupe visé. Pas un compte
     *      personnel : si le jeton fuite, la portée reste limitée à la création
     *      de tickets dans ce groupe.
     *   3. Se connecter avec cet agent → son avatar → Profil → Jetons d'accès
     *      → « Nouveau jeton d'accès personnel », cocher `ticket.agent`.
     *   4. Copier le jeton : il n'est affiché QU'UNE FOIS.
     *
     * Coller le jeton seul, sans le préfixe « Token token= » que le script
     * ajoute de son côté.
     */
    'ZAMMAD_TOKEN' => 'a-remplacer-par-le-jeton',

    /*
     * ZAMMAD_GROUP — groupe destinataire des demandes.
     *
     * Le nom EXACT du groupe tel qu'il apparaît dans Zammad (Admin → Groupes),
     * casse et accents compris. Un nom inexact fait répondre à Zammad
     * « Group not found » : le formulaire affiche alors une erreur générique, et
     * le détail part dans le journal d'erreurs PHP de l'hébergement.
     *
     * L'agent de l'étape précédente doit avoir accès à ce groupe.
     */
    'ZAMMAD_GROUP' => 'Support',

    /*
     * TURNSTILE_SECRET — clé SECRÈTE du captcha.
     *
     * Dans le tableau de bord Cloudflare → Turnstile → le widget → « Secret
     * Key ». À ne pas confondre avec la « Site Key », qui est publique et déjà
     * en place dans `src/environments/environment.ts`.
     *
     * Pour tester l'installation sans mettre le captcha en jeu, Cloudflare
     * fournit des clés de test :
     *   '1x0000000000000000000000000000000AA' → réussit toujours
     *   '2x0000000000000000000000000000000AA' → échoue toujours
     * Ne jamais les laisser en production : elles n'arrêtent aucun robot.
     */
    'TURNSTILE_SECRET' => 'a-remplacer-par-la-cle-secrete',
];
