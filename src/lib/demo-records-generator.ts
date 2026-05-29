import type { ScandatenRecord } from '@/types/scandaten';
import type { TopisObject } from '@/types/topis';

// Stundenprofil Nachtumschlag (typisch Spedition, Peak 04:00-08:00).
const STUNDEN_GEWICHTE: Record<number, number> = {
  0: 0.02, 1: 0.03, 2: 0.05, 3: 0.08,
  4: 0.12, 5: 0.14, 6: 0.13, 7: 0.11,
  8: 0.08, 9: 0.06, 10: 0.05, 11: 0.04,
  12: 0.03, 13: 0.02, 14: 0.02, 15: 0.01,
  16: 0.01, 17: 0, 18: 0, 19: 0,
  20: 0, 21: 0, 22: 0, 23: 0.01,
};

function center(o: TopisObject | { x: number; y: number; width: number; height: number }) {
  return { x: o.x + o.width / 2, y: o.y + o.height / 2 };
}

function nearestBereichName(tor: TopisObject, bereiche: TopisObject[], crossDockTouren: string[] | null): string {
  // Cross-Docking (keine Bereiche): jedes Tor wird einer Tour zugewiesen.
  // Tor-Nummer modulo Touren-Anzahl → deterministisch, gleichmäßige Verteilung.
  if (crossDockTouren && bereiche.length === 0) {
    const idx = (tor.torNummer ?? tor.id) % crossDockTouren.length;
    return crossDockTouren[idx];
  }
  if (bereiche.length === 0) return tor.side === 'north' ? 'Nord' : tor.side === 'south' ? 'Süd' : 'Ost';
  const tc = center(tor);
  let bestDist = Infinity;
  let bestName = bereiche[0].name || 'Bereich';
  for (const b of bereiche) {
    const bc = center(b);
    const dx = tc.x - bc.x;
    const dy = tc.y - bc.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      bestName = b.name || 'Bereich';
    }
  }
  return bestName;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function* iterateDates(startISO: string, tage: number) {
  const [y, m, d] = startISO.split('-').map(Number);
  for (let i = 0; i < tage; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    yield `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
  }
}

export interface DemoGenOpts {
  /** Layout-Objekte aus dem Store (mit x/y/width/height). */
  objects: TopisObject[];
  /** Anzahl Werktage (Wochenende wird übersprungen). */
  tage: number;
  /** Durchschnittliche Colli/Tag. */
  colliProTag: number;
  /** Start-Datum ISO (z.B. "2026-02-01"). */
  datumStart: string;
}

export interface DemoGenResult {
  /** Aggregierte Records (MP × Relation × Tag × Stunde). */
  records: ScandatenRecord[];
  /** Anzahl tatsächlich generierter Arbeitstage (Wochenenden raus). */
  arbeitstage: number;
  /** Erstes/letztes Datum. */
  von: string;
  bis: string;
}

/**
 * Generiert ScandatenRecords aus dem aktuell geladenen Layout — ohne hardcodierte
 * Sektion-Mappings. Jedem Tor wird der nächstgelegene Bereich (Euklid-Distanz
 * Mittelpunkt-zu-Mittelpunkt) als Relation/Dispogebiet zugeordnet.
 *
 * Tor-Gewichtung: Tore mit `meta.gewicht: number` (1.0 = neutral) übernehmen
 * diesen Wert; ansonsten Pareto-artige Default-Verteilung um die Mitte der
 * jeweiligen Seite (Süd/Nord/Ost).
 */
export function generateDemoRecordsFromLayout(opts: DemoGenOpts): DemoGenResult {
  const { objects, tage, colliProTag, datumStart } = opts;
  // Akzeptiere alle Tore — auch selbst gebaute ohne torNummer. Fallback: object.id.
  const tore = objects.filter((o) => o.type === 'tor');
  const bereiche = objects.filter((o) => o.type === 'bereich' && o.name);
  // Cross-Docking-Fallback: wenn keine Bereiche vorhanden, generiere Touren —
  // ungefähr (Tore / 3) viele, mind. 3, max 30. Tore werden modulo verteilt.
  const crossDockTouren = bereiche.length === 0
    ? Array.from({ length: Math.max(3, Math.min(30, Math.ceil(tore.length / 3))) }, (_, i) => `Tour ${i + 1}`)
    : null;

  if (tore.length === 0) {
    return { records: [], arbeitstage: 0, von: datumStart, bis: datumStart };
  }

  // Pro Tor: nächster Bereich + positionsbasiertes Gewicht.
  const torKey = (t: TopisObject) => t.torNummer != null ? t.torNummer : t.id;
  const toreSorted = [...tore].sort((a, b) => torKey(a) - torKey(b));
  const torInfo = toreSorted.map((tor, idx) => {
    const meta = (tor.meta || {}) as { gewicht?: number };
    let gewicht: number;
    if (typeof meta.gewicht === 'number' && meta.gewicht > 0) {
      gewicht = meta.gewicht;
    } else {
      // Pareto: Tore im mittleren Drittel der jeweiligen Seite stärker gewichtet.
      const seite = tor.side || 'south';
      const seitenTore = toreSorted.filter((t) => (t.side || 'south') === seite);
      const seitenIdx = seitenTore.findIndex((t) => torKey(t) === torKey(tor));
      const rel = seitenTore.length > 0 ? seitenIdx / seitenTore.length : 0.5;
      gewicht = rel > 0.15 && rel < 0.55 ? 1.8 + Math.random() * 0.6 : 0.4 + Math.random() * 0.5;
    }
    return {
      tor,
      idx,
      mpCode:
        (tor.meta as { code?: string } | undefined)?.code
        || (tor.torNummer != null ? `MP${tor.torNummer}` : `MP${tor.id}`),
      relation: nearestBereichName(tor, bereiche, crossDockTouren),
      gewicht,
    };
  });
  const sumGewicht = torInfo.reduce((acc, t) => acc + t.gewicht, 0);

  // Buckets pro (MP × Relation × Tag) — Stunden werden zusammenaggregiert,
  // sonst sprengt der Store das localStorage-Quota (115 Tore × 20 Tage × 17h ≈ 39k Records).
  // Stunden-Heatmap berechnet der Store live aus dem Stundenprofil neu.
  type AggKey = string;
  const buckets = new Map<AggKey, ScandatenRecord>();
  const tageSet = new Set<string>();
  let nextId = 1;

  // Vorab Stunden-Gesamtfaktor (alle aktiven Stunden) — Tageswert wird auf
  // diese Stunden verteilt, jeder Tor-Bucket bekommt seinen Anteil.
  const stundenSum = Object.values(STUNDEN_GEWICHTE).reduce((a, b) => a + b, 0);

  for (const datum of iterateDates(datumStart, tage)) {
    // Wochenenden überspringen (Mo-Fr Umschlag).
    const wd = new Date(`${datum}T00:00:00Z`).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    tageSet.add(datum);

    // Tagesschwankung ±10 %.
    const tagesColli = Math.round(colliProTag * (0.9 + Math.random() * 0.2) * stundenSum);

    for (const t of torInfo) {
      const colli = Math.max(0, Math.round(tagesColli * (t.gewicht / sumGewicht)));
      if (colli === 0) continue;
      const sendungen = Math.max(1, Math.round(colli / 3));
      const gewicht = colli * 18;

      const key = `${t.mpCode}|${t.relation}|${datum}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.colli += colli;
        existing.sendungen += sendungen;
        existing.gewicht += gewicht;
      } else {
        buckets.set(key, {
          id: nextId++,
          scandatum: datum,
          scanzeit: '',
          timestamp: 0,
          stellplatz: t.mpCode,
          messpunkt: t.tor.torNummer || 0,
          messpunktName: t.tor.name || t.mpCode,
          tour: '',
          dispogebiet: t.relation,
          ausgangsrelation: t.relation,
          sendungen,
          colli,
          gewicht,
        });
      }
    }
  }

  const records = [...buckets.values()];
  const sorted = [...tageSet].sort();
  return {
    records,
    arbeitstage: tageSet.size,
    von: sorted[0] || datumStart,
    bis: sorted[sorted.length - 1] || datumStart,
  };
}
