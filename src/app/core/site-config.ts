/**
 * Configuration de la vitrine Cicada.
 *
 * Tout ce qui est susceptible de changer au déploiement est regroupé ici afin
 * qu'aucune URL ni aucun libellé ne soit enfoui dans un template.
 *
 * ⚠️ Ce fichier est embarqué dans le bundle servi au navigateur : il ne doit
 * JAMAIS contenir de secret (token API Zammad, clé privée du captcha…). Ces
 * secrets vivent côté fonction serverless, cf. `server/README.md`.
 */
import { environment } from '../../environments/environment';

export const SITE_CONFIG = {
  /**
   * Instances ouvertes par les deux têtes de réseau, proposées en option 2 du
   * déploiement. Elles sont exploitées par RNF et la FCEN, pas par la vitrine :
   * leurs adresses changent indépendamment de celle-ci.
   */
  rnfInstanceUrl: 'https://cicada.reserves-naturelles.org',
  fcenInstanceUrl: 'https://cicada.reseau-cen.org/accueil',

  /** Dépôt public (licence GNU GPL v3). */
  repositoryUrl: 'https://github.com/RNF-SI/Cicada',
  issuesUrl: 'https://github.com/RNF-SI/Cicada/issues',

  /** Salon Matrix des discussions de développement. */
  matrixUrl: 'https://matrix.to/#/#cicada-app:matrix.org',
  matrixRoom: '#cicada-app:matrix.org',

  /**
   * Instance de démonstration / accès à l'outil.
   * TODO à renseigner : URL de l'instance publique (laisser `null` masque le bouton).
   */
  appUrl: null as string | null,

  /**
   * Documentation en ligne.
   * À défaut d'un site dédié, on pointe les guides du dépôt.
   */
  docsUrl: 'https://github.com/RNF-SI/Cicada/blob/main/docs/README.md',
  installGuideUrl: 'https://github.com/RNF-SI/Cicada/blob/main/docs/INSTALLATION_GUIDE.md',
  publicApiDocUrl: 'https://github.com/RNF-SI/Cicada/blob/main/docs/API_PUBLIQUE_PLANS.md',

  /**
   * Endpoint qui crée le ticket Zammad (`deploy/ovh/www/api/contact.php`, copié
   * à la racine du build par `npm run build`). L'adresse de support et le jeton Zammad ne sont connus que de
   * lui : rien de tout cela n'atteint le navigateur.
   *
   * Sur Cloudflare Pages, remplacer par `/api/contact` — l'équivalent y est
   * assuré par `functions/api/contact.ts`.
   */
  contactEndpoint: '/api/contact.php',

  /**
   * Clé publique du widget Cloudflare Turnstile.
   *
   * Vient de `src/environments/` : la vraie clé en production, la clé de test
   * de Cloudflare en développement — la vraie est restreinte au domaine et
   * refuserait `localhost`.
   */
  turnstileSiteKey: environment.turnstileSiteKey,

  /**
   * Mesure d'audience (Matomo), cf. `core/matomo.ts`.
   *
   * Vient de `src/environments/` : l'instance de Réserves naturelles de France
   * en production, `null` en développement — auquel cas aucun script n'est
   * chargé et aucune visite n'est comptée.
   */
  matomoUrl: environment.matomoUrl,
  matomoSiteId: environment.matomoSiteId,
} as const;
