import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE_CONFIG } from '../../../../core/site-config';

/**
 * Bandeau d'accueil : le logo CICADA en grand, la promesse de l'outil et les
 * deux portes d'entrée (accéder à l'outil, découvrir le projet).
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly config = SITE_CONFIG;
}
