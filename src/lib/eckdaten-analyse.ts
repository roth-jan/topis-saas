import type { ScandatenRecord } from '@/types/scandaten';

/**
 * Eckdaten-Eingabe für den vereinfachten Kunden-Check.
 */
export interface Eckdaten {
  tore: number;
  colliProTag: number;
  flaecheQm: number;
  fte: number;
  hallenName?: string;
  prozessTyp?: 'se' | 'sa';
}

// Nachtumschlag-Stundenprofil (typisch Spedition: Peak 04:00-08:00)
const STUNDEN_GEWICHTE: Record<number, number> = {
  0: 0.02, 1: 0.03, 2: 0.05, 3: 0.08,
  4: 0.12, 5: 0.14, 6: 0.13, 7: 0.11,
  8: 0.08, 9: 0.06, 10: 0.05, 11: 0.04,
  12: 0.03, 13: 0.02, 14: 0.02, 15: 0.01,
  16: 0.01, 17: 0, 18: 0, 19: 0,
  20: 0, 21: 0, 22: 0, 23: 0.01,
};

// AS Gersthofen Sektionsnamen (für Demo)
const AS_SEKTIONEN = [
  'Sektion 1', 'Sektion 1A', 'Sektion 2', 'Sektion 3', 'Sektion EX',
  'Sektion 4', 'Sektion 5', 'Sektion 6', 'Sektion 7', 'Sektion 8',
  'EZ 1', 'EZ 2', 'EZ 3', 'Bereitstellung', 'Paletten',
  'Überzone SE', 'BP1', 'BP2',
];

/**
 * Generiert Dummy-ScandatenRecords aus Eckdaten (1 Tag, Nachtschicht-Profil).
 * Die Records haben realistische Verteilungen für sichtbare Heatmaps.
 */
export function generateRecordsFromEckdaten(eckdaten: Eckdaten): ScandatenRecord[] {
  const { tore, colliProTag, flaecheQm } = eckdaten;
  const sektionen = Math.ceil(tore / 5);
  const datum = '2026-01-15';
  const records: ScandatenRecord[] = [];
  let idCounter = 1;

  // Tor-Gewichte: Top-Tore bekommen ~2x Durchschnitt (Pareto-artig)
  const torGewichte: number[] = [];
  for (let i = 0; i < tore; i++) {
    // Mittlere Tore (20-40% der Position) bekommen mehr Traffic
    const relPos = i / tore;
    const w = relPos > 0.15 && relPos < 0.45 ? 1.8 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
    torGewichte.push(w);
  }
  const sumGewichte = torGewichte.reduce((a, b) => a + b, 0);

  // Für jede Stunde Records generieren
  for (let stunde = 0; stunde < 24; stunde++) {
    const gewicht = STUNDEN_GEWICHTE[stunde] || 0;
    if (gewicht === 0) continue;

    const stundenColli = Math.round(colliProTag * gewicht);
    if (stundenColli === 0) continue;

    // Colli auf Tore verteilen
    for (let t = 0; t < tore; t++) {
      const torColli = Math.max(1, Math.round(stundenColli * (torGewichte[t] / sumGewichte)));
      const sektion = `Sektion ${Math.floor(t / 5) + 1}`;
      const minute = Math.floor(Math.random() * 60);

      records.push({
        id: idCounter++,
        scandatum: datum,
        scanzeit: `${String(stunde).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
        timestamp: new Date(`${datum}T${String(stunde).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`).getTime(),
        stellplatz: `Tor ${t + 1}`,
        messpunkt: t + 1,
        messpunktName: `Tor ${t + 1}`,
        tour: `T${1000 + Math.floor(Math.random() * 200)}`,
        dispogebiet: sektion,
        ausgangsrelation: sektion,
        sendungen: Math.max(1, Math.round(torColli / 3)),
        colli: torColli,
        gewicht: torColli * 18,
      });
    }
  }

  return records;
}

/**
 * Generiert Demo-Records für AS Gersthofen (5 Tage, realistisches Profil).
 * 115 Tore, ~3.970 Colli/Tag (real-Wert Ø Nov25-Feb26 laut Tim Winkler), 18 Relationen.
 * Hotspot auf Tore 10-30 Süd und Tore 65-85 Nord.
 */
export function generateDemoRecords(): { records: ScandatenRecord[]; eckdaten: Eckdaten } {
  const TORE = 115;
  const COLLI_PRO_TAG = 3970;  // Tim Winkler 19.05.2026: real Ø Nov 2025 - Feb 2026
  const TAGE = 5;

  const eckdaten: Eckdaten = {
    tore: TORE,
    colliProTag: COLLI_PRO_TAG,
    flaecheQm: 12470,  // 215 × 58 m mit Anbau
    fte: 55,
    hallenName: 'Demo-Umschlaghalle (Halle 6, mit Anbau)',
    prozessTyp: 'se',
  };

  const records: ScandatenRecord[] = [];
  let idCounter = 1;

  // Tor-Gewichte: Hotspot auf Tore 10-30 (60% des Volumens)
  const torGewichte: number[] = [];
  for (let i = 0; i < TORE; i++) {
    let w: number;
    if (i >= 9 && i <= 29) {
      // Hotspot: ~2.5x Durchschnitt
      w = 2.0 + Math.random() * 1.0;
    } else if (i >= 45 && i <= 65) {
      // Sekundär-Cluster Nordseite
      w = 1.0 + Math.random() * 0.5;
    } else {
      w = 0.3 + Math.random() * 0.4;
    }
    torGewichte.push(w);
  }
  const sumGewichte = torGewichte.reduce((a, b) => a + b, 0);

  // Relation-Zuordnung pro Tor (basierend auf AS-Sektionen)
  function getRelation(torIndex: number): string {
    if (torIndex < 6) return AS_SEKTIONEN[0]; // Sektion 1
    if (torIndex < 12) return AS_SEKTIONEN[1]; // Sektion 1A
    if (torIndex < 18) return AS_SEKTIONEN[2]; // Sektion 2
    if (torIndex < 22) return AS_SEKTIONEN[3]; // Sektion 3
    if (torIndex < 25) return AS_SEKTIONEN[10]; // EZ 1
    if (torIndex < 30) return AS_SEKTIONEN[4]; // Sektion EX
    if (torIndex < 38) return AS_SEKTIONEN[13]; // Bereitstellung
    if (torIndex < 46) return AS_SEKTIONEN[14]; // Paletten (Ost)
    if (torIndex < 52) return AS_SEKTIONEN[9]; // Sektion 8
    if (torIndex < 58) return AS_SEKTIONEN[8]; // Sektion 7
    if (torIndex < 64) return AS_SEKTIONEN[7]; // Sektion 6
    if (torIndex < 70) return AS_SEKTIONEN[6]; // Sektion 5
    if (torIndex < 76) return AS_SEKTIONEN[5]; // Sektion 4
    if (torIndex < 80) return AS_SEKTIONEN[11]; // EZ 2
    return AS_SEKTIONEN[12]; // EZ 3
  }

  // 5 Tage generieren
  for (let tag = 0; tag < TAGE; tag++) {
    const datum = `2026-01-${String(13 + tag).padStart(2, '0')}`;
    // Tägliche Schwankung +-10%
    const tagesFaktor = 0.9 + Math.random() * 0.2;
    const tagesColli = Math.round(COLLI_PRO_TAG * tagesFaktor);

    for (let stunde = 0; stunde < 24; stunde++) {
      const gewicht = STUNDEN_GEWICHTE[stunde] || 0;
      if (gewicht === 0) continue;

      const stundenColli = Math.round(tagesColli * gewicht);
      if (stundenColli === 0) continue;

      // Auf Tore verteilen
      for (let t = 0; t < TORE; t++) {
        const torColli = Math.max(1, Math.round(stundenColli * (torGewichte[t] / sumGewichte)));
        const relation = getRelation(t);
        const minute = Math.floor(Math.random() * 60);
        const sekunde = Math.floor(Math.random() * 60);

        records.push({
          id: idCounter++,
          scandatum: datum,
          scanzeit: `${String(stunde).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(sekunde).padStart(2, '0')}`,
          timestamp: new Date(`${datum}T${String(stunde).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(sekunde).padStart(2, '0')}`).getTime(),
          stellplatz: `Tor ${t + 1}`,
          messpunkt: t + 1,
          messpunktName: `Tor ${t + 1}`,
          tour: `T${1000 + Math.floor(Math.random() * 500)}`,
          dispogebiet: relation,
          ausgangsrelation: relation,
          sendungen: Math.max(1, Math.round(torColli / 3)),
          colli: torColli,
          gewicht: torColli * 18,
        });
      }
    }
  }

  return { records, eckdaten };
}
