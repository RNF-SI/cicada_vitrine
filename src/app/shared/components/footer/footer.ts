import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/site-config';
import { EuFundingNotice } from '../eu-funding-notice/eu-funding-notice';
import { PartnerLogos } from '../partner-logos/partner-logos';
import { ASSOCIATED_PARTNERS, FOUNDING_PARTNERS, FUNDING_PARTNERS } from '../partner-logos/partner';

/** Pied de page : porteurs du projet, financement LIFE, liens et mentions. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EuFundingNotice, PartnerLogos],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly config = SITE_CONFIG;
  protected readonly foundingPartners = FOUNDING_PARTNERS;
  protected readonly associatedPartners = ASSOCIATED_PARTNERS;
  protected readonly fundingPartners = FUNDING_PARTNERS;
  protected readonly currentYear = new Date().getFullYear();
}
