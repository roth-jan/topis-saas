import type { GesamtErgebnis } from '@/types/prozessmodell';
import type { ReferenzHalle } from '@/lib/data/referenzhallen';

/**
 * Benchmark-Ergebnis: Vergleich aktuelle Halle vs. Referenzhallen.
 */
export interface BenchmarkErgebnis {
  /** Aktuelle Halle */
  aktuell: {
    minProColliGesamt: number;
    abteilungen: Record<string, number>;
    verteilwegM: number;
    colliProTag: number;
    fte: number;
  };
  /** Rankings pro Abteilung (1 = bester) */
  rankings: AbteilungsRanking[];
  /** Gesamt-Ranking */
  gesamtRanking: number;
  /** Anzahl Hallen im Vergleich */
  anzahlHallen: number;
  /** Delta zum Besten pro Abteilung */
  deltas: AbteilungsDelta[];
  /** Alle Hallen sortiert nach Gesamt Min/Colli */
  hallenRanking: HallenRankingEntry[];
}

export interface AbteilungsRanking {
  abteilung: string;
  label: string;
  rang: number;
  wert: number;
  bester: { name: string; wert: number };
  schlechtester: { name: string; wert: number };
}

export interface AbteilungsDelta {
  abteilung: string;
  label: string;
  delta: number; // Differenz zum Besten (positiv = schlechter)
  deltaProzent: number;
  potential: string; // Beschreibung des Einsparpotentials
}

export interface HallenRankingEntry {
  name: string;
  standort: string;
  minProColliGesamt: number;
  isAktuell: boolean;
}

/**
 * Vergleicht die aktuelle Halle mit Referenzhallen.
 * Abteilungen werden dynamisch aus dem Ergebnis abgeleitet.
 */
export function berechneBenchmark(
  ergebnis: GesamtErgebnis,
  verteilwegM: number,
  referenzHallen: ReferenzHalle[],
  halleName: string = 'Aktuelle Halle'
): BenchmarkErgebnis {
  // Aktuelle Abteilungswerte aus Ergebnis
  const aktuelleAbteilungen: Record<string, number> = {};
  ergebnis.abteilungen.forEach((a) => {
    aktuelleAbteilungen[a.abteilung] = a.minProColli;
  });

  const aktuell = {
    minProColliGesamt: ergebnis.minProColli,
    abteilungen: aktuelleAbteilungen,
    verteilwegM,
    colliProTag: ergebnis.colliProTag,
    fte: ergebnis.fte,
  };

  // Abteilungs-IDs aus dem Ergebnis ableiten
  const abteilungIds = ergebnis.abteilungen.map((a) => a.abteilung);

  // Rankings pro Abteilung
  const rankings: AbteilungsRanking[] = abteilungIds.map((abtId) => {
    const abtErgebnis = ergebnis.abteilungen.find((a) => a.abteilung === abtId)!;
    const werte = referenzHallen
      .filter((h) => h.minProColli[abtId] !== undefined && h.minProColli[abtId] > 0)
      .map((h) => ({
        name: h.name,
        wert: h.minProColli[abtId],
      }));
    werte.push({ name: halleName, wert: aktuelleAbteilungen[abtId] || 0 });

    // Sortiere nach Wert aufsteigend (weniger = besser)
    werte.sort((a, b) => a.wert - b.wert);

    const rang = werte.findIndex((w) => w.name === halleName) + 1;
    const bester = werte[0];
    const schlechtester = werte[werte.length - 1];

    return {
      abteilung: abtId,
      label: abtErgebnis.label,
      rang,
      wert: aktuelleAbteilungen[abtId] || 0,
      bester,
      schlechtester,
    };
  });

  // Gesamt-Ranking
  const gesamtWerte = referenzHallen.map((h) => ({
    name: h.name,
    standort: h.standort,
    wert: h.minProColliGesamt,
  }));
  gesamtWerte.push({ name: halleName, standort: '', wert: ergebnis.minProColli });
  gesamtWerte.sort((a, b) => a.wert - b.wert);
  const gesamtRanking = gesamtWerte.findIndex((w) => w.name === halleName) + 1;

  // Deltas zum Besten
  const deltas: AbteilungsDelta[] = rankings.map((r) => {
    const delta = r.wert - r.bester.wert;
    const deltaProzent = r.bester.wert > 0 ? (delta / r.bester.wert) * 100 : 0;
    const einsparMinProColli = delta;
    const einsparMinProTag = einsparMinProColli * ergebnis.colliProTag;
    const einsparStundenProTag = einsparMinProTag / (ergebnis.arbeitsminProStunde || 52.9);

    return {
      abteilung: r.abteilung,
      label: r.label,
      delta,
      deltaProzent,
      potential:
        delta > 0.001
          ? `${einsparStundenProTag.toFixed(1)} MA-Stunden/Tag einsparbar`
          : 'Bereits Benchmark-Level',
    };
  });

  // Hallen-Ranking
  const hallenRanking: HallenRankingEntry[] = gesamtWerte.map((w) => ({
    name: w.name,
    standort: w.standort,
    minProColliGesamt: w.wert,
    isAktuell: w.name === halleName,
  }));

  return {
    aktuell,
    rankings,
    gesamtRanking,
    anzahlHallen: gesamtWerte.length,
    deltas,
    hallenRanking,
  };
}
