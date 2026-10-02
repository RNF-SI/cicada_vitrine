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
};
