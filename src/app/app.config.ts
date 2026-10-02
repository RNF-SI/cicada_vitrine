import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Le défilement est entièrement laissé au navigateur et à deux appels
    // explicites (cf. `App` et `Landing`). `withInMemoryScrolling` est
    // volontairement absent : son `anchorScrolling` défile avant que la page,
    // chargée en différé, n'ait rendu ses sections, et son
    // `scrollPositionRestoration` remet la page en haut à la fin de la
    // navigation initiale — écrasant le saut vers l'ancre d'un lien profond.
    // Le décalage dû au bandeau collant est géré par `scroll-padding-top`.
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ],
};
