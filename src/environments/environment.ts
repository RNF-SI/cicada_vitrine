/**
 * Valeurs de production.
 *
 * `environment.development.ts` prend sa place lors d'un build de développement
 * (`ng serve`), grâce au `fileReplacements` déclaré dans `angular.json`.
 */
export const environment = {
  /**
   * Clé publique du widget Cloudflare Turnstile déclaré pour cicada-app.org.
   *
   * Publique par nature : elle est lisible dans le HTML servi. C'est la clé
   * *secrète* correspondante qui doit rester côté serveur, dans
   * `cicada-vitrine-config.php`.
   */
  turnstileSiteKey: '0x4AAAAAAFL8xLrsYqr2TfAe',

  /**
   * Instance Matomo de Réserves naturelles de France, qui héberge la mesure
   * d'audience de la vitrine. Sans slash final : le service y ajoute lui-même
   * `/matomo.php` et `/matomo.js`.
   */
  matomoUrl: 'https://matomo.reserves-naturelles.org' as string | null,

  /** Identifiant du site « vitrine CICADA » dans cette instance. */
  matomoSiteId: '11',
};
