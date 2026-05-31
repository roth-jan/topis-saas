import type { PathArea, Gang } from '@/types/topis';

/**
 * Pro pathArea-Rechteck die abgeleiteten Mittellinien-Gänge zurückgeben.
 * Wird auch beim Live-Sync (addPathArea/updatePathArea) verwendet.
 */
export function gaengeFuerPathArea(pa: PathArea): Omit<Gang, 'id'>[] {
  if (pa.x == null || pa.y == null || pa.width == null || pa.height == null) return [];
  if (pa.width < 0.5 || pa.height < 0.5) return [];
  const cx = pa.x + pa.width / 2;
  const cy = pa.y + pa.height / 2;
  const isHorizontal = pa.width > pa.height * 1.2;
  const isVertical = pa.height > pa.width * 1.2;
  if (isHorizontal) {
    return [{
      name: `Auto: ${pa.name} (horizontal)`,
      points: [{ x: pa.x, y: cy }, { x: pa.x + pa.width, y: cy }],
      breite: pa.height,
      typ: 'hauptgang',
      farbe: 'rgba(34, 197, 94, 0.4)',
      autoFromPathAreaId: pa.id,
    }];
  }
  if (isVertical) {
    return [{
      name: `Auto: ${pa.name} (vertikal)`,
      points: [{ x: cx, y: pa.y }, { x: cx, y: pa.y + pa.height }],
      breite: pa.width,
      typ: 'hauptgang',
      farbe: 'rgba(34, 197, 94, 0.4)',
      autoFromPathAreaId: pa.id,
    }];
  }
  return [
    {
      name: `Auto: ${pa.name} (horiz.)`,
      points: [{ x: pa.x, y: cy }, { x: pa.x + pa.width, y: cy }],
      breite: pa.height,
      typ: 'quergang',
      farbe: 'rgba(34, 197, 94, 0.4)',
      autoFromPathAreaId: pa.id,
    },
    {
      name: `Auto: ${pa.name} (vert.)`,
      points: [{ x: cx, y: pa.y }, { x: cx, y: pa.y + pa.height }],
      breite: pa.width,
      typ: 'quergang',
      farbe: 'rgba(34, 197, 94, 0.4)',
      autoFromPathAreaId: pa.id,
    },
  ];
}

/**
 * Lastenheft 3.1.4.2: Wege sind „orientiert an Mitte des Wegs".
 * Aus jeder pathArea (Wegfläche-Rechteck) wird eine Gang-Mittellinie abgeleitet:
 * - breiter als hoch → horizontale Mittellinie
 * - höher als breit → vertikale Mittellinie
 * - quadratisch (Toleranz 20%) → Kreuz (zwei Linien)
 *
 * Die generierten Gänge bekommen die volle Breite der pathArea (nicht halbiert),
 * damit FFZ-Mindestbreiten-Filter sinnvoll greift.
 */
export function generateGaengeFromPathAreas(
  pathAreas: PathArea[],
  startId: number = 1,
): Omit<Gang, 'id'>[] & { ids?: number[] } {
  const result: Omit<Gang, 'id'>[] = [];
  for (const pa of pathAreas) {
    if (pa.x == null || pa.y == null || pa.width == null || pa.height == null) continue;
    if (pa.width < 0.5 || pa.height < 0.5) continue;

    const cx = pa.x + pa.width / 2;
    const cy = pa.y + pa.height / 2;
    const isHorizontal = pa.width > pa.height * 1.2;
    const isVertical = pa.height > pa.width * 1.2;

    if (isHorizontal) {
      result.push({
        name: `Auto: ${pa.name} (horizontal)`,
        points: [{ x: pa.x, y: cy }, { x: pa.x + pa.width, y: cy }],
        breite: pa.height,
        typ: 'hauptgang',
        farbe: 'rgba(34, 197, 94, 0.4)',
      });
    } else if (isVertical) {
      result.push({
        name: `Auto: ${pa.name} (vertikal)`,
        points: [{ x: cx, y: pa.y }, { x: cx, y: pa.y + pa.height }],
        breite: pa.width,
        typ: 'hauptgang',
        farbe: 'rgba(34, 197, 94, 0.4)',
      });
    } else {
      // quadratisch → Kreuz
      result.push({
        name: `Auto: ${pa.name} (horiz.)`,
        points: [{ x: pa.x, y: cy }, { x: pa.x + pa.width, y: cy }],
        breite: pa.height,
        typ: 'quergang',
        farbe: 'rgba(34, 197, 94, 0.4)',
      });
      result.push({
        name: `Auto: ${pa.name} (vert.)`,
        points: [{ x: cx, y: pa.y }, { x: cx, y: pa.y + pa.height }],
        breite: pa.width,
        typ: 'quergang',
        farbe: 'rgba(34, 197, 94, 0.4)',
      });
    }
  }
  // ids beigeben für Caller (nur informativ)
  Object.assign(result, { ids: result.map((_, i) => startId + i) });
  return result as Omit<Gang, 'id'>[] & { ids: number[] };
}

/**
 * Markiert Gänge die per Auto-Generator entstanden sind. Wird im Namen
 * mit Präfix „Auto:" geführt — getrennt von User-gezeichneten Gängen.
 */
export function isAutoGang(g: Gang): boolean {
  return g.name.startsWith('Auto:');
}
