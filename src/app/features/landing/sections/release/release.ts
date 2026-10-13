import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { RELEASE_EVENT } from '../../landing-content';
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, toDataUrl } from './calendar-event';

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
 * Le bouton d'accès à la visio n'est actif que pendant le webinaire : un lien
 * cliquable des semaines avant mènerait à une salle vide et ferait douter de
 * la date. Hors créneau, il reste visible mais désactivé, avec le créneau en
 * clair.
 */
@Component({
  selector: 'app-release',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './release.html',
  styleUrl: './release.scss',
})
export class Release {
  protected readonly event = RELEASE_EVENT;

  /**
   * Liens d'ajout à l'agenda, calculés une fois : la date ne change pas en
   * cours de visite. Les services web viennent en premier car ils marchent
   * partout ; le fichier `.ics` suppose une application d'agenda installée,
   * ce qui n'est pas acquis sur tous les postes.
   */
  protected readonly calendar = (() => {
    const event = {
      uid: 'lancement-v1@cicada-vitrine',
      start: new Date(EVENT_START),
      end: new Date(EVENT_END),
      title: `Cicada — ${RELEASE_EVENT.title}`,
      description: `${RELEASE_EVENT.text}\n\nRejoindre la visio : ${RELEASE_EVENT.zoomUrl}`,
      url: RELEASE_EVENT.zoomUrl,
    };
    return {
      google: googleCalendarUrl(event),
      outlookOffice: outlookCalendarUrl(event, 'office'),
      outlookLive: outlookCalendarUrl(event, 'live'),
      ics: toDataUrl(buildIcs(event)),
    };
  })();
  protected readonly calendarFileName = 'cicada-lancement-v1.ics';

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

    afterNextRender(() => {
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
