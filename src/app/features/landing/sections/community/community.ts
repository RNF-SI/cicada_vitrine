import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE_CONFIG } from '../../../../core/site-config';

/** Section « Communauté » : où discuter, contribuer, signaler. */
@Component({
  selector: 'app-community',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {
  protected readonly config = SITE_CONFIG;
}
