import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Captcha } from '../../../../shared/components/captcha/captcha';
import { ContactService } from '../../../../core/contact.service';
import { ContactSubject } from '../../../../core/contact-request';
import { SITE_CONFIG } from '../../../../core/site-config';

/** Objets proposés dans le formulaire, dans l'ordre d'affichage. */
const SUBJECTS: readonly { value: ContactSubject; label: string }[] = [
  { value: 'saas', label: 'Demander une instance hébergée' },
  { value: 'installation', label: "Question sur l'installation autonome" },
  { value: 'bug', label: 'Signaler un problème' },
  { value: 'partenariat', label: 'Partenariat ou présentation de l’outil' },
  { value: 'autre', label: 'Autre demande' },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Formulaire de contact.
 *
 * L'adresse de support n'apparaît nulle part dans la page : la demande est
 * postée à une fonction serverless qui ouvre un ticket dans Zammad. Trois
 * barrières contre le spam, complémentaires :
 *
 * 1. aucune adresse à moissonner dans le HTML ;
 * 2. une vérification Turnstile, revalidée côté serveur ;
 * 3. un champ piège invisible — les robots qui remplissent tout se trahissent.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Captcha],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly contactService = inject(ContactService);
  private readonly captcha = viewChild.required(Captcha);

  protected readonly config = SITE_CONFIG;
  protected readonly subjects = SUBJECTS;

  protected readonly status = signal<Status>('idle');
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly ticketNumber = signal<string | null>(null);
  protected readonly captchaToken = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    organisation: ['', [Validators.maxLength(160)]],
    subject: ['saas' as ContactSubject, [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000)]],
    consent: [false, [Validators.requiredTrue]],
    /** Champ piège : doit rester vide. Masqué visuellement et aux lecteurs d'écran. */
    website: [''],
  });

  protected onCaptcha(token: string | null): void {
    this.captchaToken.set(token);
  }

  protected submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.captchaToken();
    if (!token) {
      this.errorMessage.set('Merci de valider la vérification anti-robot avant d’envoyer.');
      return;
    }

    // Un robot a rempli le champ piège : on fait comme si l'envoi avait réussi,
    // sans rien transmettre.
    if (this.form.getRawValue().website !== '') {
      this.status.set('sent');
      return;
    }

    const { name, email, organisation, subject, message } = this.form.getRawValue();
    this.status.set('sending');

    this.contactService
      .send({
        name: name.trim(),
        email: email.trim(),
        organisation: organisation.trim(),
        subject,
        message: message.trim(),
        captchaToken: token,
      })
      .subscribe({
        next: (response) => {
          this.ticketNumber.set(response.ticketNumber ?? null);
          this.status.set('sent');
          this.form.reset({ subject: 'saas', consent: false });
        },
        error: (message: string) => {
          this.errorMessage.set(message);
          this.status.set('error');
          // Le jeton est consommé à chaque tentative : il faut en redemander un.
          this.captchaToken.set(null);
          this.captcha().reset();
        },
      });
  }

  /**
   * Vrai quand le champ doit afficher son message d'erreur : on n'accuse pas
   * l'utilisateur d'une saisie qu'il n'a pas encore faite.
   */
  protected invalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }
}
