import type { GesamtErgebnis } from '@/types/prozessmodell';
import type { BenchmarkErgebnis } from '@/lib/benchmarking';
import type { ReferenzHalle } from '@/lib/data/referenzhallen';
import { zahl } from '@/lib/format';

/**
 * Ampel-KPI: Ein einzelner Kennwert mit Ampelbewertung.
 */
export interface AmpelKPI {
  id: string;
  label: string;
  wert: string;
  einheit: string;
  referenz: string;
  status: 'gruen' | 'gelb' | 'rot';
  delta: number;       // % über/unter Benchmark
  potenzialText: string;
}

/**
 * Gesamtbewertung aller Ampeln.
 */
export interface AmpelBewertung {
  kpis: AmpelKPI[];
  /** Anzahl rote Ampeln */
  roteAmpeln: number;
  /** Anzahl gelbe Ampeln */
  gelbeAmpeln: number;
  /** Hauptaussage für CTA */
  headline: string;
  /** Begründung in einem Satz unter der Hauptaussage */
  unterzeile: string;
  /** Potenzial in MA-Stunden/Tag */
  potenzialMAStunden: number;
}

/**
 * Schwellenwerte für Ampelbewertung.
 *
 * | KPI            | Grün        | Gelb        | Rot     |
 * |----------------|-------------|-------------|---------|
 * | Min/Colli      | ≤110% Best  | ≤150% Best  | >150%   |
 * | Colli/MA-h     | ≥90% Best   | ≥70% Best   | <70%    |
 * | Rang           | Top 3       | 4-6         | 7+      |
 * | Spitzenfaktor  | ≤1.5        | ≤2.0        | >2.0    |
 */

export function bewerteKPIs(
  ergebnis: GesamtErgebnis,
  benchmarkErgebnis: BenchmarkErgebnis,
  referenzHallen: ReferenzHalle[],
  stundenProfil?: { stunde: number; colli: number }[]
): AmpelBewertung {
  const kpis: AmpelKPI[] = [];

  // Bester Referenzwert (Min/Colli gesamt)
  const bestMinProColli = Math.min(...referenzHallen.map((h) => h.minProColliGesamt));
  const bestColliProMAh = Math.max(
    ...referenzHallen.map((h) => {
      const arbeitsmin = 52.9;
      return arbeitsmin / h.minProColliGesamt;
    })
  );

  // === KPI 1: Prozesszeit (Min/Colli) ===
  {
    const wert = ergebnis.minProColli;
    const ratio = wert / bestMinProColli;
    let status: AmpelKPI['status'] = 'gruen';
    if (ratio > 1.5) status = 'rot';
    else if (ratio > 1.1) status = 'gelb';

    const deltaProzent = ((wert - bestMinProColli) / bestMinProColli) * 100;
    const einsparMin = wert - bestMinProColli;
    const einsparStunden = (einsparMin * ergebnis.colliProTag) / (ergebnis.arbeitsminProStunde || 52.9);

    kpis.push({
      id: 'minProColli',
      label: 'Prozesszeit',
      wert: zahl(wert, 2),
      einheit: 'Min/Colli',
      referenz: `Beste Vergleichshalle: ${zahl(bestMinProColli, 2)}`,
      status,
      delta: deltaProzent,
      // Fachkräftemangel-Logik: Stunden werden FREI für mehr Volumen, nicht „eingespart".
      potenzialText: einsparStunden > 0.5
        ? `Rund ${zahl(einsparStunden)} MA-Stunden pro Tag frei für zusätzliches Volumen`
        : 'Im Bereich der besten Vergleichshallen',
    });
  }

  // === KPI 2: Colli/MA-h (Produktivität) ===
  {
    const arbeitsmin = ergebnis.arbeitsminProStunde || 52.9;
    const colliProMAh = ergebnis.minProColli > 0 ? arbeitsmin / ergebnis.minProColli : 0;
    const ratio = bestColliProMAh > 0 ? colliProMAh / bestColliProMAh : 0;
    let status: AmpelKPI['status'] = 'gruen';
    if (ratio < 0.7) status = 'rot';
    else if (ratio < 0.9) status = 'gelb';

    const deltaProzent = bestColliProMAh > 0 ? ((colliProMAh - bestColliProMAh) / bestColliProMAh) * 100 : 0;

    kpis.push({
      id: 'colliProMAh',
      label: 'Produktivität',
      wert: zahl(colliProMAh),
      einheit: 'Colli/MA-h',
      referenz: `Beste Vergleichshalle: ${zahl(bestColliProMAh)}`,
      status,
      delta: deltaProzent,
      potenzialText: ratio < 0.9
        ? `${zahl((1 - ratio) * 100)} % unter der besten Vergleichshalle`
        : 'Gute Produktivität',
    });
  }

  // === KPI 3: Rang im Benchmark ===
  {
    const rang = benchmarkErgebnis.gesamtRanking;
    const anzahl = benchmarkErgebnis.anzahlHallen;
    let status: AmpelKPI['status'] = 'gruen';
    if (rang >= 7) status = 'rot';
    else if (rang >= 4) status = 'gelb';

    kpis.push({
      id: 'rang',
      label: 'Rang',
      wert: `Platz ${rang}`,
      einheit: `von ${anzahl}`,
      referenz: `${anzahl - 1} Vergleichshallen + Ihre Halle`,
      status,
      delta: 0,
      potenzialText: rang > 3
        ? `${rang - 3} Plätze bis in die Top 3`
        : 'Unter den besten drei',
    });
  }

  // === KPI 4: Spitzenfaktor (max/avg Stundenprofil) ===
  if (stundenProfil && stundenProfil.length > 0) {
    const colliWerte = stundenProfil.filter((s) => s.colli > 0).map((s) => s.colli);
    if (colliWerte.length > 0) {
      const maxColli = Math.max(...colliWerte);
      const avgColli = colliWerte.reduce((sum, c) => sum + c, 0) / colliWerte.length;
      const spitzenFaktor = avgColli > 0 ? maxColli / avgColli : 1;

      let status: AmpelKPI['status'] = 'gruen';
      if (spitzenFaktor > 2.0) status = 'rot';
      else if (spitzenFaktor > 1.5) status = 'gelb';

      kpis.push({
        id: 'spitzenfaktor',
        label: 'Lastverteilung',
        wert: zahl(spitzenFaktor, 1),
        einheit: 'Spitze/Ø',
        referenz: 'Gut bis 1,5',
        status,
        delta: ((spitzenFaktor - 1.5) / 1.5) * 100,
        potenzialText: spitzenFaktor > 1.5
          ? `Die Spitzenstunde liegt ${zahl((spitzenFaktor - 1) * 100)} % über dem Durchschnitt`
          : 'Gleichmäßige Auslastung',
      });
    }
  }

  // Zusammenfassung
  const roteAmpeln = kpis.filter((k) => k.status === 'rot').length;
  const gelbeAmpeln = kpis.filter((k) => k.status === 'gelb').length;

  // Potenzial in MA-Stunden berechnen
  const minProColliDelta = ergebnis.minProColli - bestMinProColli;
  const potenzialMAStunden = minProColliDelta > 0
    ? (minProColliDelta * ergebnis.colliProTag) / (ergebnis.arbeitsminProStunde || 52.9)
    : 0;

  // Headline generieren
  // Botschaft = Fachkräftemangel: Stunden, die das vorhandene Team anders einsetzen kann —
  // nie „Einsparpotenzial" (Personalabbau), das widerspricht der ROTH-Positionierung.
  const deltaProzent = ((ergebnis.minProColli - bestMinProColli) / bestMinProColli) * 100;
  let headline = '';
  let unterzeile = '';
  if (roteAmpeln >= 2 || roteAmpeln === 1 || gelbeAmpeln >= 2) {
    headline = `Ihr Team könnte rund ${zahl(potenzialMAStunden)} MA-Stunden pro Tag anders einsetzen`;
    unterzeile = `Die Prozesszeit liegt ${zahl(deltaProzent)} % über der besten von ${benchmarkErgebnis.anzahlHallen - 1} Vergleichshallen. Wo die Zeit hängen bleibt, zeigt ein Gespräch mit unseren Beratern.`;
  } else {
    headline = 'Ihre Halle liegt im Bereich der besten Vergleichshallen';
    unterzeile = 'Mit monatlichen Daten sehen Sie, ob das so bleibt — und wo die nächsten Minuten pro Colli liegen.';
  }

  return {
    kpis,
    roteAmpeln,
    gelbeAmpeln,
    headline,
    unterzeile,
    potenzialMAStunden,
  };
}
