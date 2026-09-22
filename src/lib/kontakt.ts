// EINE Stelle für Anbieter- und Kontaktdaten auf allen öffentlichen Seiten
// (Footer, Impressum, Datenschutz, Hallen-Check-CTA).
// Anbieter ist die NTConsult Software & Service GmbH (Jan, 22.09.2026) —
// Daten 1:1 aus dem Impressum auf ntc.software/impressum.html.
// 21.09.2026: vorher stand „info@roth-logistik.de" — die Domain existiert nicht
// (kein MX, kein A-Record), jede Anfrage aus dem Hallen-Check lief ins Leere.
export const KONTAKT_EMAIL = 'info@ntconsult.de';

export const ANBIETER = {
  name: 'NTConsult Software & Service GmbH',
  kurz: 'NTConsult',
  strasse: 'Lanterstraße 9',
  ort: '46539 Dinslaken',
  telefon: '+49 2064 4765-0',
  telefonHref: 'tel:+49206447650',
  email: KONTAKT_EMAIL,
  web: 'ntc.software',
  geschaeftsfuehrer: 'Jan Hendrik Roth und Thorben Roth',
  registergericht: 'Amtsgericht Duisburg',
  hrb: 'HRB 25465',
  ustId: 'DE288147422',
} as const;

export function mailtoLink(betreff: string, text?: string): string {
  const q = [`subject=${encodeURIComponent(betreff)}`];
  if (text) q.push(`body=${encodeURIComponent(text)}`);
  return `mailto:${KONTAKT_EMAIL}?${q.join('&')}`;
}
