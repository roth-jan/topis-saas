// Beispiel-Auftrags-Seed für die Planungs-Demo.
//
// 10 realistische Tor → Tor-Cross-Docking-Aufträge über die AS-Halle 6 verteilt:
// LKW kommt an Eingangs-Tor (typisch Süd) an, Colli werden zum Ausgangs-Tor
// (typisch Nord) verschoben für den abgehenden LKW. Plus ein Sondercase
// von der Kopframpe (Tore 53-60).
//
// Beim Laden mappt die Funktion über Tor-Nummer auf die aktuell vorhandenen
// Tor-Objekte. Wenn ein Tor nicht existiert, fällt sie auf das nächste
// verfügbare zurück, damit der Seed auch in anderen Hallen-Layouts läuft.

import type { TopisObject } from '@/types/topis';

export interface BeispielAuftrag {
  vonTorNr: number;
  nachTorNr: number;
  colli: number;
  notiz?: string;
}

export const BEISPIEL_AUFTRAEGE: BeispielAuftrag[] = [
  { vonTorNr: 5,   nachTorNr: 88,  colli: 1200, notiz: 'Süd → Nord, lang' },
  { vonTorNr: 12,  nachTorNr: 102, colli: 800,  notiz: 'Süd → Nord-Ost, mittel' },
  { vonTorNr: 18,  nachTorNr: 75,  colli: 1500, notiz: 'Süd → Nord, kurz' },
  { vonTorNr: 25,  nachTorNr: 67,  colli: 600,  notiz: 'Süd-Mitte → Nord-West' },
  { vonTorNr: 47,  nachTorNr: 95,  colli: 2000, notiz: 'Süd-Ost → Nord, lang' },
  { vonTorNr: 53,  nachTorNr: 78,  colli: 450,  notiz: 'Kopframpe → Nord' },
  { vonTorNr: 8,   nachTorNr: 110, colli: 1100, notiz: 'Süd → Nord-Ost, lang' },
  { vonTorNr: 35,  nachTorNr: 70,  colli: 900,  notiz: 'Süd-Mitte → Nord, mittel' },
  { vonTorNr: 22,  nachTorNr: 82,  colli: 700,  notiz: 'Süd → Nord, mittel' },
  { vonTorNr: 41,  nachTorNr: 105, colli: 1300, notiz: 'Süd-Ost → Nord-Ost' },
];

/**
 * Mappt das BEISPIEL_AUFTRAEGE-Set auf konkrete Tor-Object-IDs des aktuellen Layouts.
 */
export function buildBeispielSimInputs(objects: TopisObject[]): Array<{
  vonObjectId: number;
  nachObjectId: number;
  colli: number;
  notiz?: string;
}> {
  const tore = objects.filter((o) => o.type === 'tor');
  if (tore.length < 2) return [];

  const findTor = (nr: number): TopisObject | null => {
    const exact = tore.find((t) => t.torNummer === nr);
    if (exact) return exact;
    // Fallback: nimm das Tor mit nächstgelegener Nummer
    let best: TopisObject | null = null;
    let bestDiff = Infinity;
    for (const t of tore) {
      if (t.torNummer == null) continue;
      const diff = Math.abs(t.torNummer - nr);
      if (diff < bestDiff) {
        best = t;
        bestDiff = diff;
      }
    }
    return best ?? tore[0] ?? null;
  };

  const inputs: Array<{ vonObjectId: number; nachObjectId: number; colli: number; notiz?: string }> = [];
  for (const b of BEISPIEL_AUFTRAEGE) {
    const von = findTor(b.vonTorNr);
    const nach = findTor(b.nachTorNr);
    if (!von || !nach || von.id === nach.id) continue;
    inputs.push({
      vonObjectId: von.id,
      nachObjectId: nach.id,
      colli: b.colli,
      notiz: b.notiz,
    });
  }
  return inputs;
}
