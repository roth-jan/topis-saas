import type { GesamtErgebnis } from '@/types/prozessmodell';
import type { BenchmarkErgebnis } from '@/lib/benchmarking';
import type { ReferenzHalle } from '@/lib/data/referenzhallen';

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
      wert: wert.toFixed(2),
      einheit: 'Min/Colli',
      referenz: `Benchmark: ${bestMinProColli.toFixed(2)}`,
      status,
      delta: deltaProzent,
      potenzialText: einsparStunden > 0.5
        ? `${einsparStunden.toFixed(1)} MA-h/Tag einsparbar`
        : 'Im Benchmark-Bereich',
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
      wert: Math.round(colliProMAh).toString(),
      einheit: 'Colli/MA-h',
      referenz: `Benchmark: ${Math.round(bestColliProMAh)}`,
      status,
      delta: deltaProzent,
      potenzialText: ratio < 0.9
        ? `${Math.round((1 - ratio) * 100)}% unter Best Practice`
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
      label: 'Benchmark-Rang',
      wert: `Platz ${rang}`,
      einheit: `von ${anzahl}`,
      referenz: `${anzahl} Vergleichshallen`,
      status,
      delta: 0,
      potenzialText: rang > 3
        ? `${rang - 3} Plätze Verbesserungspotenzial`
        : 'Top 3 im Benchmark',
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
        wert: spitzenFaktor.toFixed(1),
        einheit: 'Spitze/Ø',
        referenz: 'Optimal: ≤ 1.5',
        status,
        delta: ((spitzenFaktor - 1.5) / 1.5) * 100,
        potenzialText: spitzenFaktor > 1.5
          ? `Spitze ${((spitzenFaktor - 1) * 100).toFixed(0)}% über Durchschnitt`
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
  let headline = '';
  if (roteAmpeln >= 2) {
    const deltaProzent = ((ergebnis.minProColli - bestMinProColli) / bestMinProColli) * 100;
    headline = `${Math.round(deltaProzent)}% über Benchmark. Potenzial: ${potenzialMAStunden.toFixed(0)} MA-h/Tag`;
  } else if (roteAmpeln === 1 || gelbeAmpeln >= 2) {
    headline = `Optimierungspotenzial identifiziert: ${potenzialMAStunden.toFixed(1)} MA-h/Tag`;
  } else {
    headline = 'Gute Performance — im Benchmark-Bereich';
  }

  return {
    kpis,
    roteAmpeln,
    gelbeAmpeln,
    headline,
    potenzialMAStunden,
  };
}
