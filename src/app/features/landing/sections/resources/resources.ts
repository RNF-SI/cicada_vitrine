import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';

import { PdfDialog, VitrineDocument } from '../../../../shared/components/pdf-dialog/pdf-dialog';
import { SITE_CONFIG } from '../../../../core/site-config';
import { DOCUMENTS } from '../../landing-content';

/**
 * Section « Ressources » : documents à consulter puis, éventuellement, à
 * télécharger.
 *
 * L'aperçu passe par une modale plutôt qu'un nouvel onglet : on reste sur la
 * page, et le téléchargement devient un choix fait après lecture.
 */
@Component({
  selector: 'app-resources',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdfDialog],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources {
  protected readonly documents = DOCUMENTS;
  protected readonly config = SITE_CONFIG;

  private readonly dialog = viewChild.required(PdfDialog);

  protected preview(document: VitrineDocument): void {
    this.dialog().open(document);
  }
}
