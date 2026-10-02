import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Partner } from './partner';

/**
 * Rangée de logos de partenaires.
 *
 * Tant qu'un fichier de logo n'a pas été fourni, la structure est citée en
 * toutes lettres dans une pastille : jamais d'image cassée, et le nom reste
 * visible — ce que l'engagement de citation exige de toute façon.
 */
@Component({
  selector: 'app-partner-logos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="partners" [class.partners--compact]="compact()">
      @for (partner of partners(); track partner.name) {
        <li class="partners__item">
          <a
            class="partners__link"
            [href]="partner.url"
            target="_blank"
            rel="noopener"
            [title]="partner.fullName"
          >
            @if (partner.logo) {
              <img
                class="partners__logo"
                [src]="partner.logo"
                [alt]="partner.fullName"
                loading="lazy"
              />
            } @else {
              <span class="partners__fallback">{{ partner.shortName ?? partner.fullName }}</span>
            }
          </a>
        </li>
      }
    </ul>
  `,
  styleUrl: './partner-logos.scss',
})
export class PartnerLogos {
  readonly partners = input.required<readonly Partner[]>();
  /** Variante réduite, pour le pied de page. */
  readonly compact = input(false);
}
