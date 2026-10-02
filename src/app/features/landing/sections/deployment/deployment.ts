import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE_CONFIG } from '../../../../core/site-config';
import { NETWORK_POINTS, SAAS_POINTS, SELF_HOSTED_POINTS } from '../../landing-content';

/**
 * Section « Déployer CICADA » : les trois voies possibles, présentées à égalité.
 *
 * L'auto-hébergement n'est pas une option de repli — c'est la conséquence
 * directe du choix du logiciel libre — et le service hébergé n'est pas une
 * version « premium » : les trois donnent accès aux mêmes fonctionnalités.
 * Elles sont ordonnées par charge décroissante pour la structure.
 */
@Component({
  selector: 'app-deployment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deployment.html',
  styleUrl: './deployment.scss',
})
export class Deployment {
  protected readonly config = SITE_CONFIG;
  protected readonly selfHostedPoints = SELF_HOSTED_POINTS;
  protected readonly networkPoints = NETWORK_POINTS;
  protected readonly saasPoints = SAAS_POINTS;
}
