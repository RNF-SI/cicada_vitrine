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

/** Temps restant avant l'échéance, déjà découpé pour l'affichage. */
interface Remaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

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
 */
@Component({
  selector: 'app-release',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './release.html',
  styleUrl: './release.scss',
})
export class Release {
  protected readonly event = RELEASE_EVENT;

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
      const tick = () => this.remaining.set(this.computeRemaining());

      tick();
      const timer = window.setInterval(tick, 1000);
      destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  private computeRemaining(): Remaining | null {
    const milliseconds = new Date(RELEASE_EVENT.date).getTime() - Date.now();
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
