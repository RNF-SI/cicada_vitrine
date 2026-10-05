import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PartnerLogos } from '../../../../shared/components/partner-logos/partner-logos';
import {
  ASSOCIATED_PARTNERS,
  FOUNDING_PARTNERS,
} from '../../../../shared/components/partner-logos/partner';
import { SITE_CONFIG } from '../../../../core/site-config';

/**
 * Section « Le projet » : à quoi répond Cicada, qui le porte, qui le finance.
 *
 * La citation des deux têtes de réseau à l'origine du projet et celle du
 * financement européen ne sont pas décoratives : ce sont des engagements.
 */
@Component({
  selector: 'app-project',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PartnerLogos],
  templateUrl: './project.html',
  styleUrl: './project.scss',
})
export class Project {
  protected readonly config = SITE_CONFIG;
  protected readonly foundingPartners = FOUNDING_PARTNERS;
  protected readonly associatedPartners = ASSOCIATED_PARTNERS;
}
