import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/site-config';

/**
 * Mentions légales et information sur les données personnelles.
 *
 * Les identifiants des structures (SIREN, SIRET, adresses de siège) ont été
 * relevés dans le répertoire officiel des entreprises
 * (`recherche-entreprises.api.gouv.fr`) et non recopiés de mémoire. Les
 * revérifier si une structure déménage ou change de forme juridique.
 *
 * L'exercice des droits RGPD passe par le formulaire de contact plutôt que par
 * une adresse en clair : c'est le même choix que pour le reste du site, afin de
 * ne pas offrir d'adresse à moissonner.
 */
@Component({
  selector: 'app-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  protected readonly config = SITE_CONFIG;
}
