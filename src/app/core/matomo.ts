import { DestroyRef, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router, TitleStrategy } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from './site-config';

/**
 * File d'attente de Matomo : les commandes y sont empilées avant même que le
 * script ne soit chargé, puis rejouées dans l'ordre à son arrivée. C'est
 * l'interface officielle du traqueur — on ne manipule jamais l'objet
 * `Piwik`/`Matomo` directement.
 */
type MatomoCommand = unknown[];

declare global {
  interface Window {
    _paq?: MatomoCommand[];
  }
}

/**
 * Mesure d'audience du site, confiée à l'instance Matomo de Réserves naturelles
 * de France.
 *
 * Configurée **sans cookie** (`disableCookies`) et respectant l'en-tête « Do
 * Not Track ». C'est ce qui permet au site de rester sans bandeau de
 * consentement : la CNIL exempte la mesure d'audience dès lors qu'elle ne
 * dépose rien sur le poste du visiteur et ne sert qu'à produire des
 * statistiques anonymes. La contrepartie est connue et assumée : un même
 * visiteur revenant un autre jour est compté comme nouveau.
 *
 * L'anonymisation des adresses IP n'a, elle, pas d'équivalent côté navigateur :
 * elle se règle sur l'instance (Administration → Confidentialité → Anonymiser
 * les données) et doit y rester active.
 *
 * Le traqueur ne vit que dans le navigateur : le prérendu statique ne doit ni
 * charger le script, ni compter de visite.
 *
 * Désactivé tant que `matomoUrl` vaut `null` — c'est le cas des builds de
 * développement, qui n'ont rien à faire dans les statistiques de production.
 */
@Injectable({ providedIn: 'root' })
export class Matomo {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleStrategy = inject(TitleStrategy);

  /** Chemin de la dernière page comptée ; `null` tant qu'aucune ne l'a été. */
  private lastTrackedPath: string | null = null;

  /**
   * Démarre le suivi. À n'appeler que depuis le navigateur (`afterNextRender`),
   * une seule fois, au démarrage de l'application.
   */
  start(): void {
    const { matomoUrl, matomoSiteId } = SITE_CONFIG;
    if (!matomoUrl) {
      return;
    }

    const paq = (window._paq ??= []);

    // Réglages de confidentialité AVANT le premier comptage : une commande
    // empilée après `trackPageView` n'aurait plus d'effet sur lui.
    paq.push(['disableCookies']);
    paq.push(['setDoNotTrack', true]);
    paq.push(['setTrackerUrl', `${matomoUrl}/matomo.php`]);
    paq.push(['setSiteId', matomoSiteId]);

    this.loadScript(matomoUrl);

    // Selon que le rendu initial est hydraté ou non, la première navigation
    // peut s'être achevée avant ce point — auquel cas aucun `NavigationEnd` ne
    // passera plus — ou juste après. Les deux cas sont couverts : ce qui est
    // déjà arrivé est compté tout de suite, le reste par l'abonnement.
    if (this.router.lastSuccessfulNavigation()) {
      this.trackCurrentPage(paq);
    }

    // Le site est une application monopage : seul le premier affichage est une
    // vraie requête HTTP. Les suivants — mentions légales, retour à l'accueil —
    // doivent être signalés à la main.
    const subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.trackCurrentPage(paq));

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  /**
   * Compte l'affichage de la page courante, sauf si elle vient de l'être.
   *
   * Les liens du bandeau sont des `routerLink` avec fragment : ils provoquent
   * une navigation à chaque clic alors que la page, elle, ne change pas. Seul
   * le chemin est donc comparé — sans quoi un visiteur parcourant l'accueil
   * section par section compterait pour une dizaine de pages vues.
   */
  private trackCurrentPage(paq: MatomoCommand[]): void {
    const path = window.location.pathname;
    if (path === this.lastTrackedPath) {
      return;
    }

    // Matomo attribue sinon le trafic à la page du premier chargement : sans
    // cela, tout le site semblerait avoir été consulté depuis l'accueil.
    if (this.lastTrackedPath !== null) {
      paq.push(['setReferrerUrl', `${window.location.origin}${this.lastTrackedPath}`]);
    }
    this.lastTrackedPath = path;

    // L'URL et le titre sont donnés explicitement : sans `setCustomUrl`, Matomo
    // retiendrait l'adresse du premier chargement pour toute la session.
    paq.push(['setCustomUrl', window.location.href]);
    // Le titre est demandé au routeur plutôt que lu dans `document.title` :
    // c'est Angular qui le pose sur le document, et il le fait après nous —
    // Matomo recevrait sinon le titre de la page précédente.
    paq.push(['setDocumentTitle', this.currentTitle()]);
    paq.push(['trackPageView']);
    // Comptabilise les clics sortants et les téléchargements de PDF. À réarmer
    // après chaque page : les liens de la nouvelle n'existaient pas avant.
    paq.push(['enableLinkTracking']);
  }

  /** Titre de la page courante, tel que déclaré sur la route. */
  private currentTitle(): string {
    return this.titleStrategy.buildTitle(this.router.routerState.snapshot) ?? document.title;
  }

  /** Injecte `matomo.js`, sans bloquer l'affichage. */
  private loadScript(matomoUrl: string): void {
    const script = document.createElement('script');
    script.src = `${matomoUrl}/matomo.js`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}
