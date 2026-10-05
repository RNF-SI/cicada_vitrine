/**
 * Valeurs de développement, substituées à `environment.ts` par `ng serve`.
 */
export const environment = {
  /**
   * Clé de test officielle de Cloudflare : la vérification réussit toujours et
   * fonctionne sur n'importe quel hôte.
   *
   * La vraie clé est restreinte au domaine `cicada-app.org` et refuserait
   * `localhost` — d'où cette substitution, qui évite d'avoir à jongler avec les
   * clés à la main pendant le développement.
   * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
   */
  turnstileSiteKey: '1x00000000000000000000AA',

  /**
   * Pas de mesure d'audience en développement : les allers-retours de `ng
   * serve` n'ont rien à faire dans les statistiques de production, et `null`
   * suffit à désactiver entièrement le traqueur (cf. `core/matomo.ts`).
   */
  matomoUrl: null as string | null,
  matomoSiteId: '11',
};
