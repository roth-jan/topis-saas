/**
 * Shape-Rendering & Hit-Detection für form-varianten Nutzflächen.
 *
 * Lastenheft 3.1.3.1: „Nutzflächen meist rechteckig, müssen jedoch auch
 * individuell gestaltbar sein (Winkel ≠ 90°, Rundung). Form: Rechteck,
 * Kreis, Trapez, Freihand."
 *
 * Convention:
 * - obj.x / obj.y / obj.width / obj.height beschreiben die axis-aligned
 *   Bounding-Box in Welt-Koordinaten (Meter).
 * - `formVariante` wählt die tatsächliche Form innerhalb dieser Box.
 * - `polygonPunkte` sind relativ 0..1 zur Bounding-Box.
 *
 * `pathForFormVariante` setzt nur den Pfad im Context. Fill/Stroke macht
 * der Caller — das matched die bestehende HallCanvas-Aufruf-Konvention
 * (eigene fillStyle/strokeStyle/globalAlpha pro Objekt-Typ).
 */

export type FormVariante = 'rect' | 'circle' | 'trapez' | 'polygon';

export interface ShapeObject {
  x: number;
  y: number;
  width: number;
  height: number;
  formVariante?: FormVariante;
  polygonPunkte?: { x: number; y: number }[];
  rotation?: number; // reserviert — Rotation ist Lastenheft-Future, hier no-op
}

export interface WorldToScreen {
  (x: number, y: number): { x: number; y: number };
}

/**
 * Trapez-Parameter: obere Kante als Anteil der unteren Kante.
 * Lastenheft fordert „Winkel ≠ 90°" — 0.6 ist sinnvoller Default
 * (60% obere Kante = symmetrisches Trapez mit ~22° Schräge).
 */
export const TRAPEZ_TOP_RATIO = 0.6;

/**
 * Erzeugt einen Canvas-Path für ein Objekt entsprechend seiner formVariante.
 * Ruft `ctx.beginPath()` selbst nicht auf — Caller muss das tun.
 * Macht KEIN fill/stroke — Caller wählt Style.
 *
 * @param scale Welt→Pixel-Faktor (typisch SCALE * zoom in HallCanvas).
 *              Wird nur für 'polygon' gebraucht (Punkt-Transform); für
 *              rect/circle/trapez reicht worldToScreen.
 */
export function pathForFormVariante(
  ctx: CanvasRenderingContext2D,
  obj: ShapeObject,
  worldToScreen: WorldToScreen,
  scale: number,
): void {
  const variante = obj.formVariante ?? 'rect';
  const tl = worldToScreen(obj.x, obj.y);
  const br = worldToScreen(obj.x + obj.width, obj.y + obj.height);
  const w = br.x - tl.x;
  const h = br.y - tl.y;

  switch (variante) {
    case 'circle': {
      // Ellipse innerhalb der Bounding-Box (width × height).
      // Bei width===height entsteht ein echter Kreis.
      const cx = tl.x + w / 2;
      const cy = tl.y + h / 2;
      const rx = Math.abs(w) / 2;
      const ry = Math.abs(h) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      return;
    }
    case 'trapez': {
      // Trapez: untere Kante = volle Breite, obere Kante = TRAPEZ_TOP_RATIO × Breite.
      // Symmetrisch zentriert. "Obere Kante" = obj.y (kleineres y im Canvas-Koord).
      const offset = (w * (1 - TRAPEZ_TOP_RATIO)) / 2;
      ctx.moveTo(tl.x + offset, tl.y);            // top-left
      ctx.lineTo(tl.x + w - offset, tl.y);        // top-right
      ctx.lineTo(tl.x + w, tl.y + h);             // bottom-right
      ctx.lineTo(tl.x, tl.y + h);                 // bottom-left
      ctx.closePath();
      return;
    }
    case 'polygon': {
      const punkte = obj.polygonPunkte;
      if (!punkte || punkte.length < 3) {
        // Fallback: Rechteck (sonst hätten wir gar keinen Pfad)
        ctx.rect(tl.x, tl.y, w, h);
        return;
      }
      // Polygon-Punkte sind relativ 0..1 zur Bounding-Box.
      // Wir transformieren über worldToScreen — das vermeidet
      // doppelte zoom-Berechnung und ist konsistent mit anderen Formen.
      // scale-Parameter ist reserviert für künftige Performance-Pfade
      // (z.B. direkt im Screen-Space ohne worldToScreen-Calls).
      void scale;
      const first = worldToScreen(
        obj.x + punkte[0].x * obj.width,
        obj.y + punkte[0].y * obj.height,
      );
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < punkte.length; i++) {
        const p = worldToScreen(
          obj.x + punkte[i].x * obj.width,
          obj.y + punkte[i].y * obj.height,
        );
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      return;
    }
    case 'rect':
    default: {
      ctx.rect(tl.x, tl.y, w, h);
      return;
    }
  }
}

/**
 * Point-in-shape Test in Welt-Koordinaten (Meter).
 *
 * Hit-Detection muss mit dem visuellen Render übereinstimmen: wenn ein
 * Stellplatz als Kreis gerendert wird, darf ein Klick in die Ecke der
 * Bounding-Box ihn NICHT mehr treffen — sonst stimmen Klick-Zonen und
 * sichtbare Form nicht überein.
 */
export function pointInFormVariante(
  px: number,
  py: number,
  obj: ShapeObject,
): boolean {
  const variante = obj.formVariante ?? 'rect';

  switch (variante) {
    case 'rect':
      return pointInRect(px, py, obj.x, obj.y, obj.width, obj.height);

    case 'circle': {
      // Ellipse-Test: ((px-cx)/rx)² + ((py-cy)/ry)² ≤ 1
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const rx = obj.width / 2;
      const ry = obj.height / 2;
      if (rx <= 0 || ry <= 0) return false;
      const dx = (px - cx) / rx;
      const dy = (py - cy) / ry;
      return dx * dx + dy * dy <= 1;
    }

    case 'trapez': {
      // Trapez als 4-Punkt-Polygon konstruieren und punkt-in-polygon testen.
      const offset = (obj.width * (1 - TRAPEZ_TOP_RATIO)) / 2;
      const punkte = [
        { x: obj.x + offset, y: obj.y },
        { x: obj.x + obj.width - offset, y: obj.y },
        { x: obj.x + obj.width, y: obj.y + obj.height },
        { x: obj.x, y: obj.y + obj.height },
      ];
      return pointInPolygon(px, py, punkte);
    }

    case 'polygon': {
      if (!obj.polygonPunkte || obj.polygonPunkte.length < 3) {
        // Fallback wie im Renderer
        return pointInRect(px, py, obj.x, obj.y, obj.width, obj.height);
      }
      // Relative 0..1 → Welt-Koords
      const punkte = obj.polygonPunkte.map(p => ({
        x: obj.x + p.x * obj.width,
        y: obj.y + p.y * obj.height,
      }));
      return pointInPolygon(px, py, punkte);
    }

    default:
      return pointInRect(px, py, obj.x, obj.y, obj.width, obj.height);
  }
}

function pointInRect(
  px: number, py: number,
  x: number, y: number, w: number, h: number,
): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

/**
 * Standard Ray-Casting Point-in-Polygon (ungerader Schnittpunkt-Count).
 * Robust für konvexe + konkave Polygone, beliebige Punkt-Anzahl ≥ 3.
 */
function pointInPolygon(
  px: number, py: number,
  punkte: { x: number; y: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = punkte.length - 1; i < punkte.length; j = i++) {
    const xi = punkte[i].x, yi = punkte[i].y;
    const xj = punkte[j].x, yj = punkte[j].y;
    const intersect =
      (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
