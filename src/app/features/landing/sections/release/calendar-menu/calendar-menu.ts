import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RELEASE_EVENT } from '../../../landing-content';
import { buildIcs, googleCalendarUrl, outlookCalendarUrl, toDataUrl } from '../calendar-event';

const EVENT_START = new Date(RELEASE_EVENT.date);
const EVENT_END = new Date(EVENT_START.getTime() + RELEASE_EVENT.durationHours * 3_600_000);

/**
 * Menu « Ajouter à mon agenda ».
 *
 * Les services web viennent en premier car ils marchent partout ; le fichier
 * `.ics` suppose une application d'agenda installée, ce qui n'est pas acquis
 * sur tous les postes. Les liens sont calculés une fois : la date ne change
 * pas en cours de visite.
 */
@Component({
  selector: 'app-calendar-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-menu.html',
  styleUrl: './calendar-menu.scss',
})
export class CalendarMenu {
  protected readonly fileName = 'cicada-lancement-v1.ics';

  protected readonly links = (() => {
    const registration = RELEASE_EVENT.registration?.formUrl;
    const event = {
      uid: 'lancement-v1@cicada-vitrine',
      start: EVENT_START,
      end: EVENT_END,
      title: `Cicada — ${RELEASE_EVENT.title}`,
      description: registration
        ? `${RELEASE_EVENT.text} ${RELEASE_EVENT.note}\n\nInscription : ${registration}`
        : RELEASE_EVENT.text,
      location: 'En ligne (webinaire)',
      url: registration ?? undefined,
    };
    return {
      google: googleCalendarUrl(event),
      outlookOffice: outlookCalendarUrl(event, 'office'),
      outlookLive: outlookCalendarUrl(event, 'live'),
      ics: toDataUrl(buildIcs(event)),
    };
  })();
}
