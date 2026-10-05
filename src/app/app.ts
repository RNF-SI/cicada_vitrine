import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Matomo } from './core/matomo';
import { Footer } from './shared/components/footer/footer';
import { Header } from './shared/components/header/header';

/** Coquille de l'application : bandeau, contenu de la route, pied de page. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <app-header />
    <main id="contenu">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class App {
  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    const matomo = inject(Matomo);

    // Les liens du bandeau et du pied de page sont des `routerLink` avec
    // fragment, car ils doivent ramener à l'accueil depuis les mentions
    // légales. Le défilement vers l'ancre est traité ici plutôt que par
    // `withInMemoryScrolling({ anchorScrolling })` : ce dernier défile à la fin
    // de la navigation, ce qui ne marche ni quand la section est déjà à l'écran
    // (navigation sur la même route) ni quand la page visée est chargée en
    // différé. Ici, la section existe déjà dans le DOM — c'est le cas des
    // navigations au sein de l'accueil. L'arrivée sur une ancre depuis une
    // autre page, elle, est prise en charge par le composant `Landing`, qui
    // sait quand ses sections sont rendues.
    afterNextRender(() => {
      // Mesure d'audience : uniquement dans le navigateur, et après le premier
      // rendu — le prérendu statique ne doit compter aucune visite.
      matomo.start();

      const subscription = router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const fragment = router.parseUrl(router.url).fragment;
          if (fragment) {
            document.getElementById(fragment)?.scrollIntoView({ behavior: 'instant' });
          }
        });

      destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }
}
