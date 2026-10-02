import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Document téléchargeable présenté dans la section « Ressources ». */
export interface VitrineDocument {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  /** Chemin public du PDF, ou `null` si le fichier n'est pas encore fourni. */
  readonly file: string | null;
  /** Nom de fichier proposé au téléchargement. */
  readonly downloadName: string;
  /** Poids affiché à l'utilisateur, p. ex. « 261 ko ». */
  readonly size?: string;
}

/**
 * Aperçu d'un PDF dans une fenêtre modale, avec téléchargement optionnel.
 *
 * S'appuie sur l'élément natif `<dialog>` : le piégeage du focus, la fermeture
 * par Échap et le fond inerte sont fournis par le navigateur, sans dépendance ni
 * code d'accessibilité à maintenir. Le rendu du PDF lui-même est confié à la
 * visionneuse intégrée du navigateur via une `<iframe>`.
 */
@Component({
  selector: 'app-pdf-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pdf-dialog.html',
  styleUrl: './pdf-dialog.scss',
})
export class PdfDialog {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly document = signal<VitrineDocument | null>(null);

  /**
   * URL passée à l'`<iframe>`. Le fragment masque la barre d'outils redondante
   * de la visionneuse : la modale fournit déjà ses propres actions.
   */
  protected readonly viewerUrl = computed<SafeResourceUrl | null>(() => {
    const file = this.document()?.file;
    if (!file) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${file}#toolbar=0&navpanes=0&view=FitH`);
  });

  open(document: VitrineDocument): void {
    this.document.set(document);
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /** Un clic sur le fond (hors panneau) ferme la modale. */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }
}
