import type { TopisObject, Gang } from '@/types/topis';
import type { ScandatenRecord } from '@/types/scandaten';
import { buildGangGraph, findPath, connectGangsToBounds, generateTorAnbindungsGaenge } from '@/lib/pathfinding';

export interface TorBelegungsVorschlag {
  relation: string;
  altesAusgangsTor: { id: number; name: string } | null;
  neuesAusgangsTor: { id: number; name: string };
  colliProTag: number;
  eingangsToreCount: number;
}

export interface TorBelegungsErgebnis {
  vorschlaege: TorBelegungsVorschlag[];
  verteilwegVorherM: number;
  verteilwegNachherM: number;
  ersparnisProzent: number;
  arbeitstage: number;
  /** Map relation -> Ausgangs-Tor-ID. Diese kann der User später z.B. in Tor-Belegungs-Plan einspielen. */
  zuordnung: Record<string, number>;
}

interface Inputs {
  objects: TopisObject[];
  records: ScandatenRecord[];
  gaenge: Gang[];
  hallWidth: number;
  hallHeight: number;
}

function center(o: { x: number; y: number; width: number; height: number }) {
  return { x: o.x + o.width / 2, y: o.y + o.height / 2 };
}

function torKey(t: TopisObject) {
  return (t.meta as { code?: string } | undefined)?.code
    || (t.torNummer != null ? `MP${t.torNummer}` : `MP${t.id}`);
}

/**
 * Cross-Docking-Optimierung: weist jeder Relation (dispogebiet/Tour) das
 * nächstgelegene freie Ausgangs-Tor zu — gemessen am Colli-gewichteten
 * Schwerpunkt der **Eingangs-Tore** dieser Relation.
 *
 * Annahmen:
 * - Eingangs-Tore = `stellplatz` aus Records (dort wird gescannt)
 * - Ausgangs-Tore = alle anderen Tore mit `side ≠ Eingangs-Seite` ODER
 *   wenn nicht eindeutig: alle Tore minus die häufigsten Eingangs-Tore
 * - 1:1 Zuordnung Relation → Ausgangs-Tor (Greedy, Top-Volumen zuerst)
 */
export function optimizeTorBelegung(inputs: Inputs): TorBelegungsErgebnis {
  const { objects, records, hallWidth, hallHeight } = inputs;
  const tore = objects.filter((o) => o.type === 'tor');
  if (tore.length < 2 || records.length === 0) {
    return { vorschlaege: [], verteilwegVorherM: 0, verteilwegNachherM: 0, ersparnisProzent: 0, arbeitstage: 0, zuordnung: {} };
  }

  // Topologie für A* heilen (generisch für alle Hallen).
  const baseGaenge = inputs.gaenge;
  const maxGangId = baseGaenge.reduce((m, g) => Math.max(m, (g as Gang).id ?? 0), 0);
  const anbindungen = baseGaenge.some((g) => /Anbindung/i.test(g.name || ''))
    ? []
    : generateTorAnbindungsGaenge(tore, hallWidth, hallHeight, maxGangId + 1);
  const gaenge = connectGangsToBounds([...baseGaenge, ...anbindungen], 0, hallHeight, 0, hallWidth);
  const graph = buildGangGraph(gaenge);
  const walls = objects.filter((o) => o.type === 'wand' || o.type === 'bereich' || o.type === 'regal' || o.type === 'hindernis');

  const torByCode = new Map<string, TopisObject>();
  for (const t of tore) torByCode.set(torKey(t), t);
  const torById = new Map<number, TopisObject>();
  for (const t of tore) torById.set(t.id, t);

  // Eingangs-Tore = die mit Records (mp-code Match)
  const eingangsToreSet = new Set<number>();
  for (const r of records) {
    const t = torByCode.get(r.stellplatz) ?? torById.get(r.messpunkt);
    if (t) eingangsToreSet.add(t.id);
  }
  // Ausgangs-Tore: alles was NICHT Eingangs-Tor ist. Falls leer (kleine Hallen),
  // alle Tore zulassen — A* darf gleiche Tore nutzen.
  const ausgangsTore = tore.filter((t) => !eingangsToreSet.has(t.id));
  const ausgangsKandidaten = ausgangsTore.length >= 2 ? ausgangsTore : tore;

  // Pro Relation: aggregiere Eingangs-Tor-Schwerpunkt + Colli + bisheriges Ausgangs-Tor (häufigstes).
  type RelAggr = {
    sumX: number;
    sumY: number;
    sumColli: number;
    tageSet: Set<string>;
    eingangsTore: Set<number>;
    // bisheriges (falls in den Records implizit): wir haben keine echte Belegung,
    // deshalb leeren wir das einfach
  };
  const byRel = new Map<string, RelAggr>();
  for (const r of records) {
    const rel = r.dispogebiet || r.ausgangsrelation;
    if (!rel) continue;
    const t = torByCode.get(r.stellplatz) ?? torById.get(r.messpunkt);
    if (!t) continue;
    const tc = center(t);
    const a = byRel.get(rel) ?? { sumX: 0, sumY: 0, sumColli: 0, tageSet: new Set<string>(), eingangsTore: new Set<number>() };
    a.sumX += tc.x * r.colli;
    a.sumY += tc.y * r.colli;
    a.sumColli += r.colli;
    a.tageSet.add(r.scandatum);
    a.eingangsTore.add(t.id);
    byRel.set(rel, a);
  }

  const arbeitstageAlle = new Set<string>();
  for (const r of records) arbeitstageAlle.add(r.scandatum);
  const arbeitstage = arbeitstageAlle.size || 1;

  // Bisherige (vorher) Zuordnung: bei SimAuftrag-Records ist der Tour-Name das
  // aktuelle Ziel-Tor (Surrogat) — wenn ein Tor mit diesem Namen existiert,
  // nutze es als Vorher. Sonst Fallback auf zufällig.
  const relSorted = [...byRel.entries()].sort((a, b) => b[1].sumColli - a[1].sumColli);
  const vorherZuordnung = new Map<string, TopisObject>();
  for (let i = 0; i < relSorted.length; i++) {
    const [rel] = relSorted[i];
    const matchedByName = tore.find((t) => (t.name || '') === rel);
    if (matchedByName) {
      vorherZuordnung.set(rel, matchedByName);
    } else {
      vorherZuordnung.set(rel, ausgangsKandidaten[i % ausgangsKandidaten.length]);
    }
  }

  // Distanz-Cache Tor↔Tor via A*.
  const distCache = new Map<string, number>();
  function torDist(a: TopisObject, b: TopisObject): number {
    if (a.id === b.id) return 0;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    const c = distCache.get(key);
    if (c !== undefined) return c;
    const ac = center(a);
    const bc = center(b);
    const r = findPath(ac.x, ac.y, bc.x, bc.y, graph, undefined, walls);
    const d = r?.distance ?? Math.sqrt((ac.x - bc.x) ** 2 + (ac.y - bc.y) ** 2);
    distCache.set(key, d);
    return d;
  }

  function gesamtWegFür(zuordnung: Map<string, TopisObject>): number {
    // Σ über alle Records: distanz(eingangs_tor → relation-ausgangs-tor) × colli
    let sumColliMeter = 0;
    let sumColli = 0;
    for (const r of records) {
      const rel = r.dispogebiet || r.ausgangsrelation;
      if (!rel) continue;
      const ein = torByCode.get(r.stellplatz) ?? torById.get(r.messpunkt);
      const aus = zuordnung.get(rel);
      if (!ein || !aus) continue;
      sumColliMeter += torDist(ein, aus) * r.colli;
      sumColli += r.colli;
    }
    return sumColli > 0 ? sumColliMeter / sumColli : 0;
  }

  const verteilwegVorher = gesamtWegFür(vorherZuordnung);

  // Greedy Optimum: Relation mit höchstem Volumen zuerst → das freie Ausgangs-Tor
  // nehmen, das am nächsten am Colli-Schwerpunkt der Eingangs-Tore dieser Relation liegt.
  const verwendet = new Set<number>();
  const nachherZuordnung = new Map<string, TopisObject>();
  const vorschlaege: TorBelegungsVorschlag[] = [];
  for (const [rel, a] of relSorted) {
    if (a.sumColli === 0) continue;
    const targetX = a.sumX / a.sumColli;
    const targetY = a.sumY / a.sumColli;
    // freies Ausgangs-Tor mit minimaler Distanz zum Schwerpunkt
    let best: { tor: TopisObject; dist: number } | null = null;
    for (const t of ausgangsKandidaten) {
      if (verwendet.has(t.id)) continue;
      const tc = center(t);
      const d = (tc.x - targetX) ** 2 + (tc.y - targetY) ** 2;
      if (!best || d < best.dist) best = { tor: t, dist: d };
    }
    if (!best) continue;
    verwendet.add(best.tor.id);
    nachherZuordnung.set(rel, best.tor);
    const altes = vorherZuordnung.get(rel);
    vorschlaege.push({
      relation: rel,
      altesAusgangsTor: altes ? { id: altes.id, name: altes.name || `Tor ${altes.torNummer || altes.id}` } : null,
      neuesAusgangsTor: { id: best.tor.id, name: best.tor.name || `Tor ${best.tor.torNummer || best.tor.id}` },
      colliProTag: a.sumColli / arbeitstage,
      eingangsToreCount: a.eingangsTore.size,
    });
  }

  const verteilwegNachher = gesamtWegFür(nachherZuordnung);

  const zuordnung: Record<string, number> = {};
  for (const [rel, tor] of nachherZuordnung) zuordnung[rel] = tor.id;

  return {
    vorschlaege,
    verteilwegVorherM: verteilwegVorher,
    verteilwegNachherM: verteilwegNachher,
    ersparnisProzent: verteilwegVorher > 0 ? (1 - verteilwegNachher / verteilwegVorher) * 100 : 0,
    arbeitstage,
    zuordnung,
  };
}
