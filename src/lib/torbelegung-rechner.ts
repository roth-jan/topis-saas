/**
 * Berechnet KPIs und Analysen für Torbelegung und Verladepläne.
 */

import type { Fahrplan, TorbelegungZelle, TorbelegungKPIs, SpitzenAnalyse } from '@/types/torbelegung';

/**
 * Berechnet Spitzenauslastung aus Torbelegungsdaten.
 */
export function berechneSpitzenauslastung(fahrplan: Fahrplan): SpitzenAnalyse {
  const belegung = fahrplan.torbelegung;

  if (belegung.length === 0) {
    return {
      spitzenStunde: { stunde: 0, minute: 0, auslastung: 0 },
      durchschnittlicheAuslastung: 0,
      maxAuslastungProTor: { tor: '-', auslastung: 0 },
      aktiveTore: 0,
      gesamtFahrzeuge: 0,
    };
  }

  // Aggregiere nach Zeitslot
  const slotMap = new Map<string, number>();
  for (const z of belegung) {
    const key = `${z.stunde}:${z.minute}`;
    slotMap.set(key, (slotMap.get(key) || 0) + z.auslastung);
  }

  // Spitzenstunde finden
  let spitze = { stunde: 0, minute: 0, auslastung: 0 };
  for (const [key, wert] of slotMap) {
    if (wert > spitze.auslastung) {
      const [h, m] = key.split(':').map(Number);
      spitze = { stunde: h, minute: m, auslastung: wert };
    }
  }

  // Max pro Tor
  const torMax = new Map<string, number>();
  for (const z of belegung) {
    torMax.set(z.tor, Math.max(torMax.get(z.tor) || 0, z.auslastung));
  }
  let maxTor = { tor: '-', auslastung: 0 };
  for (const [tor, wert] of torMax) {
    if (wert > maxTor.auslastung) {
      maxTor = { tor, auslastung: wert };
    }
  }

  const totalAuslastung = belegung.reduce((sum, z) => sum + z.auslastung, 0);
  const gesamtFahrzeuge = totalAuslastung;
  const aktiveTore = new Set(belegung.map(z => z.tor)).size;
  const durchschnitt = belegung.length > 0 ? totalAuslastung / belegung.length : 0;

  return {
    spitzenStunde: spitze,
    durchschnittlicheAuslastung: durchschnitt,
    maxAuslastungProTor: maxTor,
    aktiveTore,
    gesamtFahrzeuge: Math.round(gesamtFahrzeuge * 10) / 10,
  };
}

/**
 * Berechnet KPIs für Torbelegung.
 */
export function berechneTorbelegungKPIs(belegung: TorbelegungZelle[]): TorbelegungKPIs {
  if (belegung.length === 0) {
    return {
      durchschnittlicheAuslastung: 0,
      spitzenStunde: { stunde: 0, minute: 0, auslastung: 0 },
      leereTore: 0,
      ueberlasteteTore: [],
      gesamtSlots: 0,
      belegteSlots: 0,
    };
  }

  // Alle Tore ermitteln
  const alleTore = new Set(belegung.map(z => z.tor));

  // Tore mit hoher Last (>= 2.0 Fahrzeuge in irgendeinem Slot)
  const torMaxLast = new Map<string, number>();
  for (const z of belegung) {
    torMaxLast.set(z.tor, Math.max(torMaxLast.get(z.tor) || 0, z.auslastung));
  }
  const ueberlastet = [...torMaxLast.entries()]
    .filter(([, v]) => v >= 2.0)
    .map(([k]) => k);

  // Leere Tore (max < 0.1)
  const leereTore = [...torMaxLast.entries()]
    .filter(([, v]) => v < 0.1)
    .length;

  // Spitzenslot
  const slotSummen = new Map<string, number>();
  for (const z of belegung) {
    const key = `${z.stunde}:${z.minute}`;
    slotSummen.set(key, (slotSummen.get(key) || 0) + z.auslastung);
  }
  let spitze = { stunde: 0, minute: 0, auslastung: 0 };
  for (const [key, wert] of slotSummen) {
    if (wert > spitze.auslastung) {
      const [h, m] = key.split(':').map(Number);
      spitze = { stunde: h, minute: m, auslastung: wert };
    }
  }

  const totalAuslastung = belegung.reduce((sum, z) => sum + z.auslastung, 0);
  const belegteSlots = belegung.filter(z => z.auslastung > 0).length;

  return {
    durchschnittlicheAuslastung: belegung.length > 0 ? totalAuslastung / belegung.length : 0,
    spitzenStunde: spitze,
    leereTore,
    ueberlasteteTore: ueberlastet,
    gesamtSlots: alleTore.size * 12, // 12 Halbstunden (00:00 - 05:30)
    belegteSlots,
  };
}

/**
 * Erzeugt eine vollständige Torbelegungs-Matrix für die Heatmap-Darstellung.
 * Füllt fehlende Tore/Slots mit Auslastung 0.
 */
export function erzeugeVollstaendigeMatrix(
  belegung: TorbelegungZelle[],
  tore: string[],
  halbstunden: { stunde: number; minute: number }[],
): TorbelegungZelle[][] {
  const lookup = new Map<string, number>();
  for (const z of belegung) {
    lookup.set(`${z.tor}-${z.stunde}:${z.minute}`, z.auslastung);
  }

  return tore.map(tor =>
    halbstunden.map(hs => ({
      tor,
      stunde: hs.stunde,
      minute: hs.minute,
      auslastung: lookup.get(`${tor}-${hs.stunde}:${hs.minute}`) || 0,
      relationen: [],
    })),
  );
}

/**
 * Parst eine Zeitangabe im Format "HH:MM" zu Stunden und Minuten.
 */
export function parseZeit(zeit: string): { stunde: number; minute: number } {
  const [h, m] = zeit.split(':').map(Number);
  return { stunde: h || 0, minute: m || 0 };
}

/**
 * Berechnet die zeitliche Verteilung von SE-Ankünften pro Halbstunde.
 */
export function berechneAnkunftsverteilung(
  fahrplan: Fahrplan,
): { zeit: string; anzahl: number; kumuliert: number; prozent: number }[] {
  const slots = new Map<string, number>();
  // Initialisiere alle Halbstunden 00:00 - 23:30
  for (let h = 0; h < 24; h++) {
    slots.set(`${h.toString().padStart(2, '0')}:00`, 0);
    slots.set(`${h.toString().padStart(2, '0')}:30`, 0);
  }

  for (const eintrag of fahrplan.seAnkuenfte) {
    const { stunde, minute } = parseZeit(eintrag.sollZeit);
    const slotMinute = minute < 30 ? 0 : 30;
    const key = `${stunde.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
    slots.set(key, (slots.get(key) || 0) + 1);
  }

  const total = fahrplan.seAnkuenfte.length;
  const result: { zeit: string; anzahl: number; kumuliert: number; prozent: number }[] = [];
  let kumuliert = 0;

  const sortedKeys = [...slots.keys()].sort();
  for (const key of sortedKeys) {
    const anzahl = slots.get(key) || 0;
    if (anzahl > 0 || kumuliert > 0) {
      kumuliert += anzahl;
      result.push({
        zeit: key,
        anzahl,
        kumuliert,
        prozent: total > 0 ? (kumuliert / total) * 100 : 0,
      });
    }
  }

  return result;
}
