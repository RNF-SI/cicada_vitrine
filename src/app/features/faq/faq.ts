import { ChangeDetectionStrategy, Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FAQ_TOPICS } from './faq-content';

/**
 * Questions fréquentes.
 *
 * Les réponses sont développées en clair plutôt que repliées dans des
 * accordéons : la page est prérendue, et un visiteur qui cherche un mot précis
 * doit pouvoir le trouver avec la recherche de son navigateur sans dérouler
 * chaque question. Le sommaire en tête compense la longueur.
 *
 * Tout le contenu vit dans `faq-content.ts` ; le gabarit ne fait que le mettre
 * en page, sommaire compris. Ajouter une question ne demande donc de toucher
 * qu'un seul fichier.
 */
@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  protected readonly topics = FAQ_TOPICS;

  constructor() {
    // Même raison que dans `Landing` : la page est chargée en différé, et le
    // routeur tenterait de rejoindre l'ancre avant que les questions ne soient
    // dans le DOM. On rejoue le défilement une fois la page rendue, ce qui
    // couvre l'ouverture directe d'un lien `/faq#question`.
    afterNextRender(() => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });
  }
}
