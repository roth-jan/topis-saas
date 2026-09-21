// EINE Stelle für die Kontaktadresse auf allen öffentlichen Seiten.
// 21.09.2026: vorher stand an 3 Stellen „info@roth-logistik.de" — diese Domain existiert
// nicht (kein MX, kein A-Record), jede Anfrage aus dem Hallen-Check lief ins Leere.
// Wert von Jan zu bestätigen, bevor das in Produktion geht.
export const KONTAKT_EMAIL = 'info@roth-logistikberatung.de';

export function mailtoLink(betreff: string, text?: string): string {
  const q = [`subject=${encodeURIComponent(betreff)}`];
  if (text) q.push(`body=${encodeURIComponent(text)}`);
  return `mailto:${KONTAKT_EMAIL}?${q.join('&')}`;
}
