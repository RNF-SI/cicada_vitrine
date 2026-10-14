import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { RELEASE_EVENT } from '../features/landing/landing-content';

export interface WebinarSignup {
  readonly lastName: string;
  readonly firstName: string;
  readonly organisation: string;
  readonly email: string;
}

/** Réponse de l'API Grist à la création d'enregistrements. */
interface GristRecordsResponse {
  readonly records?: readonly { readonly id: number }[];
}

/**
 * Inscription au webinaire, enregistrée dans une table Grist.
 *
 * Grist ouvre, pour chaque formulaire publié, un point d'envoi public sur sa
 * table : c'est celui qu'utilise son propre formulaire, et que l'on appelle ici
 * directement pour garder le formulaire aux couleurs du site. Aucune clé d'API
 * n'est nécessaire, et seule l'écriture est possible : les réponses des autres
 * inscrits ne sont pas lisibles depuis le navigateur.
 *
 * Les noms de colonnes (`Nom`, `Prenom`…) sont ceux de la table Grist : les
 * changer là-bas casse l'envoi ici.
 */
@Injectable({ providedIn: 'root' })
export class WebinarSignupService {
  private readonly http = inject(HttpClient);

  send(signup: WebinarSignup): Observable<void> {
    const registration = RELEASE_EVENT.registration;
    if (!registration) {
      return throwError(() => 'Les inscriptions sont closes.');
    }

    const { gristBaseUrl, shareKey, tableId } = registration;
    const url = `${gristBaseUrl}/api/s/${shareKey}/tables/${tableId}/records`;
    const body = {
      records: [
        {
          fields: {
            Nom: signup.lastName,
            Prenom: signup.firstName,
            Organisme: signup.organisation,
            Email: signup.email,
          },
        },
      ],
    };

    return this.http.post<GristRecordsResponse>(url, body).pipe(
      map((response) => {
        if (!response?.records?.[0]?.id) {
          throw new Error('no-record');
        }
      }),
      catchError((error: unknown) => throwError(() => this.toMessage(error))),
    );
  }

  private toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return "Impossible de joindre le service d'inscription. Vérifiez votre connexion puis réessayez.";
    }
    return "L'inscription a échoué. Merci de réessayer, ou d'utiliser le formulaire en lien ci-dessous.";
  }
}
