// Deutsche Zahlen- und Datumsformate für alles, was Kunden sehen.
// Hintergrund (21.09.2026): Der Kunden-Check zeigte „2.105 Min/Colli" (englischer
// Dezimalpunkt) direkt neben „3.983 Colli/Tag" (deutscher Tausenderpunkt) — ein
// Hallenleiter liest das erste als zweitausend. Deshalb überall über diese Helfer.

/** 2.105 → „2,11" (nk = Nachkommastellen, Tausenderpunkt automatisch). */
export function zahl(v: number, nk = 0): string {
  if (!Number.isFinite(v)) return '–';
  return v.toLocaleString('de-DE', { minimumFractionDigits: nk, maximumFractionDigits: nk });
}

/** 0.453 → „45 %" bzw. mit Vorzeichen „+45 %". */
export function prozent(anteil: number, { vorzeichen = false } = {}): string {
  if (!Number.isFinite(anteil)) return '–';
  const p = Math.round(anteil * 100);
  return `${vorzeichen && p > 0 ? '+' : ''}${zahl(p)} %`;
}

/** „2026-01-13" → „13.01.2026". Unbekanntes bleibt unverändert. */
export function datum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}
