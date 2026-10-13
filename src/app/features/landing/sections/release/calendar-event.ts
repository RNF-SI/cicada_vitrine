/**
 * Génère une invitation d'agenda au format iCalendar (RFC 5545), reconnue
 * par Outlook, Thunderbird, Apple Calendar et Google Agenda.
 *
 * Le fichier est construit à partir de `RELEASE_EVENT` plutôt que déposé
 * tel quel dans `public/` : une seule source pour la date, la durée et le lien
 * de visio, impossible de décaler l'une sans l'autre.
 */

export interface CalendarEvent {
  readonly uid: string;
  readonly start: Date;
  readonly end: Date;
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

/** `20261207T130000Z` : date UTC sans séparateurs, comme l'exige le format. */
function formatUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Les virgules, points-virgules et retours à la ligne ont un sens dans un champ texte iCalendar. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/[,;]/g, (c) => `\\${c}`)
    .replace(/\n/g, '\\n');
}

/**
 * Replie les lignes de plus de 75 octets, comme le demande la RFC : certains
 * clients rejettent le fichier sinon. Le comptage se fait en octets UTF-8, pas
 * en caractères, pour ne pas couper un accent en deux.
 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    const prefix = parts.length === 0 ? 0 : 1;
    if (encoder.encode(current + char).length + prefix > 75) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildIcs(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cicada//Vitrine//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatUtc(event.start)}`,
    `DTSTART:${formatUtc(event.start)}`,
    `DTEND:${formatUtc(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.url)}`,
    `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Adresse `data:` prête à poser sur un lien `download`. */
export function toDataUrl(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/** Préremplit un événement dans Google Agenda, sans fichier à ouvrir. */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatUtc(event.start)}/${formatUtc(event.end)}`,
    details: event.description,
    location: event.url,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Préremplit un événement dans Outlook sur le web. `office` vise les comptes
 * professionnels (Microsoft 365), `live` les comptes personnels Outlook.com :
 * les deux services ne partagent pas la même adresse.
 */
export function outlookCalendarUrl(event: CalendarEvent, account: 'office' | 'live'): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description,
    location: event.url,
  });
  return `https://outlook.${account}.com/calendar/0/deeplink/compose?${params}`;
}
