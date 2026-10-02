import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { SITE_CONFIG } from '../../../core/site-config';

/** API minimale du widget Cloudflare Turnstile telle qu'on l'utilise ici. */
interface TurnstileApi {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      language?: string;
      theme?: 'light' | 'dark' | 'auto';
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/**
 * Vérification anti-spam du formulaire de contact (Cloudflare Turnstile).
 *
 * Choisi plutôt qu'un reCAPTCHA : pas de cookie de pistage, pas de puzzle à
 * résoudre dans la grande majorité des cas, et conforme au RGPD sans bandeau de
 * consentement. Le jeton produit est revérifié côté serverless : le widget seul
 * ne protège rien.
 *
 * Le script n'est chargé que dans le navigateur — le prérendu statique ne doit
 * pas tenter de l'exécuter.
 */
@Component({
  selector: 'app-captcha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="captcha">
      <div #host class="captcha__widget"></div>
      @if (failed()) {
        <p class="captcha__error" role="alert">
          La vérification anti-robot n'a pas pu se charger. Désactivez votre bloqueur pour ce site,
          ou écrivez-nous via le salon Matrix.
        </p>
      }
    </div>
  `,
  styleUrl: './captcha.scss',
})
export class Captcha {
  /** Jeton courant : `null` tant que la vérification n'est pas passée. */
  readonly token = output<string | null>();

  protected readonly failed = signal(false);

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private widgetId: string | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      void this.loadScript()
        .then(() => this.render())
        .catch(() => this.failed.set(true));

      destroyRef.onDestroy(() => {
        if (this.widgetId) {
          window.turnstile?.remove(this.widgetId);
        }
      });
    });
  }

  /** Redemande une vérification (après un envoi, le jeton est consommé). */
  reset(): void {
    if (this.widgetId) {
      window.turnstile?.reset(this.widgetId);
      this.token.emit(null);
    }
  }

  private render(): void {
    const api = window.turnstile;
    if (!api) {
      this.failed.set(true);
      return;
    }

    this.widgetId = api.render(this.host().nativeElement, {
      sitekey: SITE_CONFIG.turnstileSiteKey,
      language: 'fr',
      theme: 'light',
      callback: (token) => this.token.emit(token),
      'expired-callback': () => this.token.emit(null),
      'error-callback': () => {
        this.token.emit(null);
        this.failed.set(true);
      },
    });
  }

  /** Injecte le script une seule fois, même si le composant est recréé. */
  private loadScript(): Promise<void> {
    if (window.turnstile) {
      return Promise.resolve();
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_URL}"]`);
    const script = existing ?? document.createElement('script');

    const ready = new Promise<void>((resolve, reject) => {
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('turnstile')), {
        once: true,
      });
    });

    if (!existing) {
      script.src = `${SCRIPT_URL}?render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return ready;
  }
}
