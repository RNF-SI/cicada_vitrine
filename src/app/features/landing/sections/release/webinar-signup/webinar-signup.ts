import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { WebinarSignupService } from '../../../../../core/webinar-signup.service';
import { RELEASE_EVENT } from '../../../landing-content';
import { CalendarMenu } from '../calendar-menu/calendar-menu';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Formulaire d'inscription au webinaire de lancement, dans une fenêtre modale.
 *
 * Même mécanique que l'aperçu des PDF : l'élément natif `<dialog>` fournit le
 * piégeage du focus, la fermeture par Échap et le fond inerte. La modale ne se
 * ferme pas d'elle-même après l'envoi : la confirmation propose d'ajouter le
 * rendez-vous à son agenda, et c'est le visiteur qui referme.
 *
 * Même vocabulaire de styles et mêmes garde-fous que le formulaire de contact,
 * à une différence près : pas de captcha. Les réponses partent directement
 * vers Grist, sans passer par le serveur du site, et il n'y a donc personne
 * pour vérifier un jeton. Le champ piège reste la seule barrière, comme pour
 * le formulaire Grist d'origine.
 */
@Component({
  selector: 'app-webinar-signup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CalendarMenu],
  templateUrl: './webinar-signup.html',
  styleUrl: './webinar-signup.scss',
})
export class WebinarSignup {
  private readonly service = inject(WebinarSignupService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly formUrl = RELEASE_EVENT.registration?.formUrl ?? null;
  protected readonly status = signal<Status>('idle');
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    lastName: ['', [Validators.required, Validators.maxLength(120)]],
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    organisation: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    consent: [false, [Validators.requiredTrue]],
    /** Champ piège : doit rester vide. Masqué visuellement et aux lecteurs d'écran. */
    website: [''],
  });

  open(): void {
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

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.getRawValue().website !== '') {
      this.status.set('sent');
      return;
    }

    const { lastName, firstName, organisation, email } = this.form.getRawValue();
    this.status.set('sending');

    this.service
      .send({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        organisation: organisation.trim(),
        email: email.trim(),
      })
      .subscribe({
        next: () => {
          this.status.set('sent');
          this.form.reset({ consent: false });
        },
        error: (message: string) => {
          this.errorMessage.set(message);
          this.status.set('error');
        },
      });
  }

  protected invalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }
}
