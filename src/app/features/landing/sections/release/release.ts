import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { RELEASE_EVENT } from '../../landing-content';
import { CalendarMenu } from './calendar-menu/calendar-menu';
import { WebinarSignup } from './webinar-signup/webinar-signup';

/**
 * Ancre qui ouvre directement la modale d'inscription : `/#inscription-webinaire`,
 * à diffuser dans les courriels et sur les réseaux. Elle est posée sur le
 * bouton d'inscription, vers lequel la page défile d'abord.
 */
export const SIGNUP_FRAGMENT = 'inscription-webinaire';

/** Temps restant avant l'échéance, déjà découpé pour l'affichage. */
interface Remaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Où l'on en est par rapport au webinaire : avant, pendant, ou après. */
type Phase = 'before' | 'live' | 'after';

const EVENT_START = new Date(RELEASE_EVENT.date).getTime();
const EVENT_END = EVENT_START + RELEASE_EVENT.durationHours * 3_600_000;

/**
 * Compte à rebours jusqu'à la sortie de la version 1 et au webinaire de
 * lancement.
 *
 * L'horloge n'est lancée que dans le navigateur : le prérendu statique figerait
 * sinon dans le HTML un décompte faux dès la minute suivant le build. La valeur
 * initiale est tout de même calculée au constructeur, y compris côté serveur,
 * pour que la page livrée ne contienne pas quatre cases vides.
 *
 * Les chiffres qui défilent sont masqués aux lecteurs d'écran : un compteur
 * annoncé à chaque seconde rendrait la page inutilisable. La date complète est
 * donnée juste à côté, en toutes lettres, et c'est elle qui porte l'information.
 *
 * Pendant le webinaire, le bloc de droite signale qu'il est en cours plutôt
 * que d'annoncer seulement la sortie.
 */
@Component({
  selector: 'app-release',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarMenu, WebinarSignup],
  templateUrl: './release.html',
  styleUrl: './release.scss',
})
export class Release {
  protected readonly event = RELEASE_EVENT;

  /** Modale d'inscription, absente quand les inscriptions sont closes. */
  protected readonly signup = viewChild(WebinarSignup);
  protected readonly signupFragment = SIGNUP_FRAGMENT;

  private readonly phase = signal<Phase>(this.computePhase());
  protected readonly isLive = computed(() => this.phase() === 'live');

  /** `null` une fois l'échéance passée : le bloc bascule alors sur un message. */
  private readonly remaining = signal<Remaining | null>(this.computeRemaining());

  protected readonly countdown = this.remaining;
  protected readonly units = computed(() => {
    const value = this.remaining();
    if (!value) {
      return [];
    }
    return [
      { value: value.days, label: value.days > 1 ? 'jours' : 'jour' },
      { value: value.hours, label: value.hours > 1 ? 'heures' : 'heure' },
      { value: value.minutes, label: value.minutes > 1 ? 'minutes' : 'minute' },
      { value: value.seconds, label: value.seconds > 1 ? 'secondes' : 'seconde' },
    ];
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const router = inject(Router);

    afterNextRender(() => {
      // Lien direct vers l'inscription : à l'arrivée sur la page (le fragment
      // est déjà dans l'adresse) comme lors d'une navigation interne vers
      // l'ancre (le routeur l'annonce). Le défilement vers le bouton, lui,
      // est déjà pris en charge par `Landing` et `App`.
      const openIfRequested = () => {
        if (router.parseUrl(router.url).fragment === SIGNUP_FRAGMENT) {
          this.signup()?.open();
        }
      };
      openIfRequested();
      const subscription = router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(openIfRequested);
      destroyRef.onDestroy(() => subscription.unsubscribe());

      const tick = () => {
        this.remaining.set(this.computeRemaining());
        this.phase.set(this.computePhase());
      };

      tick();
      const timer = window.setInterval(tick, 1000);
      destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  private computePhase(): Phase {
    const now = Date.now();
    if (now < EVENT_START) {
      return 'before';
    }
    return now < EVENT_END ? 'live' : 'after';
  }

  private computeRemaining(): Remaining | null {
    const milliseconds = EVENT_START - Date.now();
    if (milliseconds <= 0) {
      return null;
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor(totalSeconds / 3600) % 24,
      minutes: Math.floor(totalSeconds / 60) % 60,
      seconds: totalSeconds % 60,
    };
  }
}
