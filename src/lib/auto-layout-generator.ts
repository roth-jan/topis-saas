import type { Hall, TopisObject, Gang } from '@/types/topis';
import type { ScandatenRecord, TorZuordnung, RelationZuordnung } from '@/types/scandaten';
import { OBJECT_DEFAULTS } from '@/types/topis';

/**
 * Auto-Layout-Generator: Erzeugt eine vollständige Halle aus CSV-Scandaten.
 *
 * Logik:
 * 1. Unique Stellplätze → Tor-Objekte entlang Süd- und Nord-Wand
 * 2. Unique Relationen → Bereich-Objekte im Innenraum
 * 3. Hauptgang + Quergänge
 * 4. Automatische TorZuordnungen + RelationZuordnungen
 */

export interface AutoLayoutResult {
  hall: Hall;
  objects: TopisObject[];
  gaenge: Gang[];
  torZuordnungen: TorZuordnung[];
  relationZuordnungen: RelationZuordnung[];
}

/** Stellplatz-Keys wie "Tor 23" nicht erneut prefixen (sonst "Tor Tor 23"). */
const torName = (key: string) => (/^tor\b/i.test(key.trim()) ? key.trim() : `Tor ${key}`);

/**
 * Generiert ein komplettes Hallenlayout aus Scandaten-Records.
 */
export function generateAutoLayout(records: ScandatenRecord[]): AutoLayoutResult {
  // 1. Unique Stellplätze (= Tore) und Relationen (= Bereiche) extrahieren
  const stellplaetze = extractUniqueStellplaetze(records);
  const relationen = extractUniqueRelationen(records);

  // 2. Hallengröße berechnen — Tore verteilen sich auf Süd- UND Nord-Wand,
  // die Breite bemisst sich also an den Toren pro Wand. Tiefe realer
  // Umschlaghallen liegt bei ~30-60m, unabhängig von der Länge.
  const toreAnzahl = stellplaetze.length;
  const bereicheAnzahl = relationen.length;
  const hallWidth = Math.max(60, Math.ceil(toreAnzahl / 2) * 4.5);
  const hallHeight = Math.max(30, Math.min(60, hallWidth * 0.35));

  // 3. Hall erstellen
  const hall: Hall = {
    id: 1,
    shape: 'rect',
    width: hallWidth,
    height: hallHeight,
    name: 'Auto-Layout',
    walls: [],
    offsetX: 0,
    offsetY: 0,
    color: '#26262a',
  };

  const objects: TopisObject[] = [];
  let idCounter = 1;

  // 4. Tore entlang Süd- und Nord-Wand platzieren
  const toreSued = Math.ceil(toreAnzahl / 2);
  const toreNord = toreAnzahl - toreSued;
  const torWidth = OBJECT_DEFAULTS.tor.width;
  const torHeight = OBJECT_DEFAULTS.tor.height;

  // Süd-Wand (y = hallHeight - torHeight)
  const suedSpacing = hallWidth / (toreSued + 1);
  for (let i = 0; i < toreSued; i++) {
    const x = suedSpacing * (i + 1) - torWidth / 2;
    objects.push({
      id: idCounter++,
      type: 'tor',
      x,
      y: hallHeight - torHeight,
      width: torWidth,
      height: torHeight,
      name: torName(stellplaetze[i].key),
      side: 'south',
      torNummer: i + 1,
    });
  }

  // Nord-Wand (y = 0)
  const nordSpacing = hallWidth / (toreNord + 1);
  for (let i = 0; i < toreNord; i++) {
    const stellplatzIdx = toreSued + i;
    const x = nordSpacing * (i + 1) - torWidth / 2;
    objects.push({
      id: idCounter++,
      type: 'tor',
      x,
      y: 0,
      width: torWidth,
      height: torHeight,
      name: torName(stellplaetze[stellplatzIdx].key),
      side: 'north',
      torNummer: toreSued + i + 1,
    });
  }

  // 5. Bereiche im Innenraum platzieren
  const bereichMarginTop = torHeight + 3;
  const bereichMarginBottom = torHeight + 3;
  const verfuegbareHoehe = hallHeight - bereichMarginTop - bereichMarginBottom;
  const bereichHeight = Math.min(
    Math.max(6, verfuegbareHoehe / Math.max(Math.ceil(bereicheAnzahl / 4), 1) - 2),
    12
  );
  const bereichWidth = Math.min(Math.max(8, hallWidth / 6), 18);
  const cols = Math.max(Math.ceil(Math.sqrt(bereicheAnzahl * 1.5)), 2);
  const rows = Math.ceil(bereicheAnzahl / cols);
  const colSpacing = (hallWidth - 4) / (cols + 1);
  const rowSpacing = verfuegbareHoehe / (rows + 1);

  for (let i = 0; i < bereicheAnzahl; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = colSpacing * (col + 1) + 2 - bereichWidth / 2;
    const y = bereichMarginTop + rowSpacing * (row + 1) - bereichHeight / 2;
    objects.push({
      id: idCounter++,
      type: 'bereich',
      x: Math.max(1, Math.min(x, hallWidth - bereichWidth - 1)),
      y: Math.max(bereichMarginTop, Math.min(y, hallHeight - bereichMarginBottom - bereichHeight)),
      width: bereichWidth,
      height: bereichHeight,
      name: `${relationen[i].key}`,
    });
  }

  // 6. Gänge generieren
  const gaenge: Gang[] = [];
  const gangBreite = 3.5;
  const hauptgangY = hallHeight / 2;

  // Hauptgang (horizontal, mittig)
  gaenge.push({
    id: 1,
    name: 'Hauptgang',
    points: [
      { x: 0, y: hauptgangY },
      { x: hallWidth, y: hauptgangY },
    ],
    breite: gangBreite,
    typ: 'hauptgang',
    istHauptgang: true,
  });

  // Quergang links
  gaenge.push({
    id: 2,
    name: 'Quergang Links',
    points: [
      { x: hallWidth * 0.25, y: 0 },
      { x: hallWidth * 0.25, y: hallHeight },
    ],
    breite: gangBreite,
    typ: 'quergang',
  });

  // Quergang rechts
  gaenge.push({
    id: 3,
    name: 'Quergang Rechts',
    points: [
      { x: hallWidth * 0.75, y: 0 },
      { x: hallWidth * 0.75, y: hallHeight },
    ],
    breite: gangBreite,
    typ: 'quergang',
  });

  // 7. TorZuordnungen erstellen
  const torObjects = objects.filter((o) => o.type === 'tor');
  const torZuordnungen: TorZuordnung[] = stellplaetze.map((sp, i) => ({
    stellplatzKey: sp.key,
    objectId: torObjects[i]?.id ?? 0,
    objectName: torObjects[i]?.name ?? '',
    autoMatched: true,
  }));

  // 8. RelationZuordnungen erstellen
  const bereichObjects = objects.filter((o) => o.type === 'bereich');
  const relationZuordnungen: RelationZuordnung[] = relationen.map((rel, i) => ({
    relationKey: rel.key,
    objectId: bereichObjects[i]?.id ?? null,
    objectName: bereichObjects[i]?.name ?? rel.key,
  }));

  return {
    hall,
    objects,
    gaenge,
    torZuordnungen,
    relationZuordnungen,
  };
}

// ============ Hilfsfunktionen ============

interface StellplatzInfo {
  key: string;
  colli: number;
}

interface RelationInfo {
  key: string;
  colli: number;
}

function extractUniqueStellplaetze(records: ScandatenRecord[]): StellplatzInfo[] {
  const map = new Map<string, number>();
  for (const r of records) {
    if (!r.stellplatz) continue;
    map.set(r.stellplatz, (map.get(r.stellplatz) || 0) + r.colli);
  }
  return Array.from(map.entries())
    .map(([key, colli]) => ({ key, colli }))
    .sort((a, b) => {
      // Numerisch sortieren wenn möglich
      const numA = parseInt(a.key);
      const numB = parseInt(b.key);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.key.localeCompare(b.key);
    });
}

function extractUniqueRelationen(records: ScandatenRecord[]): RelationInfo[] {
  const map = new Map<string, number>();
  for (const r of records) {
    if (!r.ausgangsrelation) continue;
    map.set(r.ausgangsrelation, (map.get(r.ausgangsrelation) || 0) + r.colli);
  }
  return Array.from(map.entries())
    .map(([key, colli]) => ({ key, colli }))
    .sort((a, b) => b.colli - a.colli); // Nach Volumen sortiert
}
