import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { ContactRequest, ContactResponse } from './contact-request';
import { SITE_CONFIG } from './site-config';

/**
 * Envoi d'une demande de contact.
 *
 * Le client ne connaît ni l'adresse de support ni le token Zammad : il poste sur
 * une fonction serverless (cf. `server/`) qui vérifie le captcha puis crée le
 * ticket. C'est ce qui permet de n'exposer aucune adresse en clair dans le HTML.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  send(request: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(SITE_CONFIG.contactEndpoint, request).pipe(
      map((response) => {
        if (!response?.ok) {
          throw new Error(response?.error ?? 'unknown');
        }
        return response;
      }),
      catchError((error: unknown) => throwError(() => this.toMessage(error))),
    );
  }

  /** Traduit l'échec en message affichable, sans fuiter de détail technique. */
  private toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "Impossible de joindre le service d'envoi. Vérifiez votre connexion puis réessayez.";
      }
      if (error.status === 400 || error.status === 422) {
        return 'Le formulaire a été refusé. Vérifiez la vérification anti-robot puis réessayez.';
      }
      if (error.status === 429) {
        return 'Trop de demandes envoyées depuis cette adresse. Merci de réessayer dans quelques minutes.';
      }
    }
    return "L'envoi a échoué. Merci de réessayer dans quelques instants.";
  }
}
