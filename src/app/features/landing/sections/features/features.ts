import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CROSS_FEATURES, MODULES, ROADMAP } from '../../landing-content';
import { SITE_CONFIG } from '../../../../core/site-config';

/**
 * Section « Fonctionnalités » : les cinq modules de la version 1, ce que l'outil
 * apporte transversalement, puis les modules envisagés.
 */
@Component({
  selector: 'app-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './features.html',
  styleUrl: './features.scss',
})
export class Features {
  protected readonly modules = MODULES;
  protected readonly crossFeatures = CROSS_FEATURES;
  protected readonly roadmap = ROADMAP;
  protected readonly config = SITE_CONFIG;
}
