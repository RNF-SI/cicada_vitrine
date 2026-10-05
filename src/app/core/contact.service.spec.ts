import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it } from 'vitest';

import { ContactRequest } from './contact-request';
import { ContactService } from './contact.service';
import { SITE_CONFIG } from './site-config';

const REQUEST: ContactRequest = {
  name: 'Camille Durand',
  email: 'camille@exemple.org',
  organisation: 'CEN Exemple',
  subject: 'saas',
  message: 'Nous souhaiterions une instance hébergée pour nos quatre réserves.',
  captchaToken: 'jeton-turnstile',
};

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("poste la demande sur l'endpoint serverless, et nulle part ailleurs", () => {
    service.send(REQUEST).subscribe();

    const request = http.expectOne(SITE_CONFIG.contactEndpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(REQUEST);
    request.flush({ ok: true });
  });

  it('remonte le numéro de ticket quand Zammad le renvoie', async () => {
    const response = service.send(REQUEST);
    const promise = new Promise<string | undefined>((resolve) =>
      response.subscribe((value) => resolve(value.ticketNumber)),
    );

    http.expectOne(SITE_CONFIG.contactEndpoint).flush({
      ok: true,
      ticketNumber: '2026-0042',
    });

    await expect(promise).resolves.toBe('2026-0042');
  });

  it('traite un corps `ok: false` comme un échec, même si le statut HTTP est 200', async () => {
    const promise = rejection(service, () =>
      http.expectOne(SITE_CONFIG.contactEndpoint).flush({ ok: false, error: 'ticket_failed' }),
    );

    await expect(promise).resolves.toContain("L'envoi a échoué");
  });

  it('distingue la panne réseau, qui invite à vérifier la connexion', async () => {
    const promise = rejection(service, () =>
      http.expectOne(SITE_CONFIG.contactEndpoint).error(new ProgressEvent('error')),
    );

    await expect(promise).resolves.toContain('Impossible de joindre');
  });

  it('distingue le refus du captcha, qui invite à refaire la vérification', async () => {
    const promise = rejection(service, () =>
      http
        .expectOne(SITE_CONFIG.contactEndpoint)
        .flush({ ok: false, error: 'captcha_failed' }, { status: 400, statusText: 'Bad Request' }),
    );

    await expect(promise).resolves.toContain('vérification anti-robot');
  });

  it('distingue la limitation de débit, qui invite à patienter', async () => {
    const promise = rejection(service, () =>
      http
        .expectOne(SITE_CONFIG.contactEndpoint)
        .flush({ ok: false }, { status: 429, statusText: 'Too Many Requests' }),
    );

    await expect(promise).resolves.toContain('quelques minutes');
  });
});

/** Déclenche un envoi, laisse le test répondre, et résout avec le message d'erreur. */
function rejection(service: ContactService, respond: () => void): Promise<string> {
  const promise = new Promise<string>((resolve) =>
    service.send(REQUEST).subscribe({ error: resolve }),
  );
  respond();
  return promise;
}
