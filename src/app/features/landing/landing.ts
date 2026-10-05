import { ChangeDetectionStrategy, Component, afterNextRender } from '@angular/core';

import { Community } from './sections/community/community';
import { Contact } from './sections/contact/contact';
import { Deployment } from './sections/deployment/deployment';
import { Features } from './sections/features/features';
import { Hero } from './sections/hero/hero';
import { Project } from './sections/project/project';
import { Release } from './sections/release/release';
import { Resources } from './sections/resources/resources';

/**
 * Page unique de la vitrine.
 *
 * L'ordre des sections doit rester celui de `NAV_SECTIONS` (bandeau) : le menu
 * et la détection de section active s'appuient sur les `id` dans cet ordre.
 */
@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero, Release, Project, Features, Deployment, Resources, Community, Contact],
  template: `
    <app-hero />
    <app-release />
    <app-project />
    <app-features />
    <app-deployment />
    <app-resources />
    <app-community />
    <app-contact />
  `,
})
export class Landing {
  constructor() {
    // `anchorScrolling` du routeur ne suffit pas ici : la page est chargée en
    // différé, et le routeur tente de rejoindre l'ancre avant que les sections
    // ne soient dans le DOM. On rejoue donc le défilement une fois la page
    // rendue, ce qui couvre les deux cas d'arrivée sur une ancre : un lien
    // depuis les mentions légales, et une URL `/#section` ouverte directement.
    afterNextRender(() => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        return;
      }
      // Saut immédiat, et non `smooth` : à l'ouverture d'un lien profond, on
      // veut être à la bonne section tout de suite, pas regarder la page
      // défiler sur plusieurs milliers de pixels.
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });
  }
}
