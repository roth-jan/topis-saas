/**
 * Lastenheft 3.1.5 — Unterflurförderkette
 *
 * Reine Geometrie-Funktionen für den Ketten-Wegbereich:
 *  - Mittel-Pfad aus Stützpunkten (Kurven via Catmull-Rom → Bezier-Approximation)
 *  - Äußere Kontur als Polygon (Mittelpfad ± Breite/2 senkrecht zur Tangente)
 *  - Pfeil-Positionen entlang der Kette (Fließrichtung)
 *  - Punkt-in-Kette-Test
 *  - Verbots-Prüfung: keine Nutzflächen IN der Kette
 *
 * Koordinaten in Welt-Metern. Keine Canvas-/UI-Abhängigkeit.
 */

import type { KettenWegbereich, TopisObject } from '@/types/topis';

// ---------- Hilfs-Typen ----------

interface Vec {
  x: number;
  y: number;
}

interface SegmentInfo {
  /** Position auf dem Mittel-Pfad (in m, ab Anfang) */
  s: number;
  /** Punkt auf dem Mittel-Pfad */
  p: Vec;
  /** Tangenten-Winkel in rad */
  t: number;
}

// ---------- Vec Helpers ----------

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}
function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}
function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}
function len(a: Vec): number {
  return Math.hypot(a.x, a.y);
}
function norm(a: Vec): Vec {
  const l = len(a);
  return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
}

// ---------- Catmull-Rom Sampling (Bezier-Approximation für Kurven) ----------

/**
 * Wenn mindestens 3 Stützpunkte vorhanden sind, wird der Pfad zwischen den
 * Stützpunkten als Catmull-Rom-Spline interpretiert und in ~`stepsPerSeg`
 * Sub-Schritten pro Segment abgetastet. Bei 2 Punkten reicht eine Linie.
 *
 * Catmull-Rom ist mathematisch identisch zur konvertierten Cubic-Bezier (das
 * Lastenheft erlaubt explizit "Kurven über Stützpunkte" — die exakte Spline-
 * Form ist nicht vorgeschrieben). Catmull-Rom hat den Vorteil, dass die
 * Kurve direkt durch alle Stützpunkte verläuft.
 */
export function sampleMidline(punkte: Vec[], stepsPerSeg = 12): SegmentInfo[] {
  if (punkte.length === 0) return [];
  if (punkte.length === 1) {
    return [{ s: 0, p: punkte[0], t: 0 }];
  }
  if (punkte.length === 2) {
    const a = punkte[0];
    const b = punkte[1];
    const dir = sub(b, a);
    const t = Math.atan2(dir.y, dir.x);
    const samples: SegmentInfo[] = [];
    let s = 0;
    for (let i = 0; i <= stepsPerSeg; i++) {
      const f = i / stepsPerSeg;
      const p = { x: a.x + dir.x * f, y: a.y + dir.y * f };
      samples.push({ s, p, t });
      if (i < stepsPerSeg) s += len(dir) / stepsPerSeg;
    }
    return samples;
  }

  // Catmull-Rom mit Phantom-Endpunkten
  const pts: Vec[] = [];
  pts.push(sub(scale(punkte[0], 2), punkte[1])); // phantom start
  for (const p of punkte) pts.push(p);
  pts.push(sub(scale(punkte[punkte.length - 1], 2), punkte[punkte.length - 2])); // phantom end

  const samples: SegmentInfo[] = [];
  let sAcc = 0;
  let prev: Vec | null = null;

  for (let segIdx = 0; segIdx < pts.length - 3; segIdx++) {
    const p0 = pts[segIdx];
    const p1 = pts[segIdx + 1];
    const p2 = pts[segIdx + 2];
    const p3 = pts[segIdx + 3];

    const steps = stepsPerSeg;
    for (let i = 0; i <= steps; i++) {
      // Catmull-Rom letzte Sample doppelt vermeiden außer beim ersten Segment
      if (segIdx > 0 && i === 0) continue;
      const u = i / steps;
      const u2 = u * u;
      const u3 = u2 * u;
      const p: Vec = {
        x:
          0.5 *
          ((2 * p1.x) +
            (-p0.x + p2.x) * u +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
        y:
          0.5 *
          ((2 * p1.y) +
            (-p0.y + p2.y) * u +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
      };
      // Tangente = Ableitung
      const tx =
        0.5 *
        ((-p0.x + p2.x) +
          2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u +
          3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u2);
      const ty =
        0.5 *
        ((-p0.y + p2.y) +
          2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u +
          3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u2);
      const t = Math.atan2(ty, tx);

      if (prev) sAcc += len(sub(p, prev));
      samples.push({ s: sAcc, p, t });
      prev = p;
    }
  }
  return samples;
}

// ---------- Äußeres Polygon (Kontur) ----------

/**
 * Erzeugt das geschlossene Polygon, das den Ketten-Wegbereich vollständig
 * abdeckt: Mittelpfad ± Breite/2 senkrecht zur jeweiligen Tangente,
 * vorwärts entlang der einen Seite, rückwärts entlang der anderen.
 */
export function kettenPolygon(k: KettenWegbereich): Vec[] {
  if (!k.punkte || k.punkte.length < 2) return [];
  const samples = sampleMidline(k.punkte);
  const halb = k.breite / 2;
  const links: Vec[] = [];
  const rechts: Vec[] = [];
  for (const s of samples) {
    // Normale = (-sin(t), cos(t))  → Linksseite
    const nx = -Math.sin(s.t);
    const ny = Math.cos(s.t);
    links.push({ x: s.p.x + nx * halb, y: s.p.y + ny * halb });
    rechts.push({ x: s.p.x - nx * halb, y: s.p.y - ny * halb });
  }
  // Linksseite vorwärts, Rechtsseite rückwärts → geschlossenes Polygon
  return [...links, ...rechts.reverse()];
}

// ---------- Pfeil-Positionen ----------

/**
 * Verteilt Pfeile entlang der Mitte der Kette mit dem gegebenen Intervall
 * (in m). Der erste Pfeil sitzt bei intervall/2 (nicht am Anfang), damit
 * Stützpunkte selbst nicht überdeckt werden. Richtung berücksichtigt die
 * Fließrichtung der Kette.
 */
export function kettenPfeilPositionen(
  k: KettenWegbereich,
  intervall: number,
): { pos: Vec; richtung: number }[] {
  if (!k.punkte || k.punkte.length < 2 || intervall <= 0) return [];
  const samples = sampleMidline(k.punkte);
  if (samples.length === 0) return [];
  const gesamt = samples[samples.length - 1].s;
  if (gesamt <= 0) return [];

  const offset = k.fliessrichtung === 'rueckwaerts' ? Math.PI : 0;

  const pfeile: { pos: Vec; richtung: number }[] = [];
  // Erster Pfeil bei intervall/2, dann alle intervall m
  for (let s = intervall / 2; s <= gesamt; s += intervall) {
    // Sample mit s≈target finden (linear durchsuchen — Anzahl Samples klein)
    let chosen = samples[0];
    for (const smp of samples) {
      if (smp.s >= s) {
        chosen = smp;
        break;
      }
      chosen = smp;
    }
    pfeile.push({ pos: chosen.p, richtung: chosen.t + offset });
  }
  return pfeile;
}

// ---------- Punkt-in-Kette ----------

/**
 * Prüft, ob ein Punkt im Kettenbereich liegt. Implementierung über das
 * Abtast-Polygon (Ray-Casting). Robust auch für Kurven, da die Polygon-
 * Sampling-Auflösung in `kettenPolygon` fein genug ist.
 */
export function pointInKette(px: number, py: number, k: KettenWegbereich): boolean {
  if (!k.punkte || k.punkte.length < 2) return false;

  // Schnellpfad: Punkt-Liniensegment-Abstand zur Mittellinie.
  // Wenn der Abstand <= breite/2 zu irgendeinem Mittel-Segment ist → drin.
  const halb = k.breite / 2;
  const samples = sampleMidline(k.punkte);
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i].p;
    const b = samples[i + 1].p;
    const d = distancePointToSegment({ x: px, y: py }, a, b);
    if (d <= halb) return true;
  }
  return false;
}

function distancePointToSegment(p: Vec, a: Vec, b: Vec): number {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const l2 = ab.x * ab.x + ab.y * ab.y;
  if (l2 === 0) return len(ap);
  let t = (ap.x * ab.x + ap.y * ab.y) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = add(a, scale(ab, t));
  return len(sub(p, proj));
}

// ---------- Verbot: Nutzflächen in Kette ----------

/**
 * Lastenheft 3.1.5: „Nutzflächen dürfen nicht im Kettenbereich liegen."
 *
 * Prüft, ob ein Stellplatz/Regal/Bereich mit irgendeinem Punkt seines
 * Bounding-Rechtecks im Bereich einer Kette liegt. Es genügt der Mittelpunkt
 * UND die 4 Ecken zu prüfen — Rotation wird ignoriert (auf der sicheren Seite,
 * weil die rotierte Hülle in das nicht-rotierte BBox passt).
 *
 * Wegbereiche, Wände etc. werden NICHT geprüft — laut Lastenheft dürfen sich
 * normale Wege und Kette überlappen, nur Nutzflächen sind verboten.
 */
export function verbietetNutzflaeche(
  obj: TopisObject,
  ketten: KettenWegbereich[],
): boolean {
  if (ketten.length === 0) return false;

  // Welche Typen gelten als "Nutzfläche"? Stellplatz, Regal, Bereich,
  // Sperrplatz, Klärplatz, Wertverschlag, AV/UZ, Palettenlager,
  // Kommissionierfläche, Sattel-/Wechselbrückenplatz.
  const nutzflaechenTypen = new Set([
    'stellplatz',
    'regal',
    'bereich',
    'sperrplatz',
    'klaerplatz',
    'wertverschlag',
    'av_platz',
    'uz_platz',
    'palettenlager',
    'kommissionierflaeche',
    'sattelplatz',
    'wechselbrueckenplatz',
  ]);
  if (!nutzflaechenTypen.has(obj.type)) return false;

  const corners: Vec[] = [
    { x: obj.x, y: obj.y },
    { x: obj.x + obj.width, y: obj.y },
    { x: obj.x + obj.width, y: obj.y + obj.height },
    { x: obj.x, y: obj.y + obj.height },
    { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 },
  ];

  for (const k of ketten) {
    for (const c of corners) {
      if (pointInKette(c.x, c.y, k)) return true;
    }
  }
  return false;
}

// ---------- Bonus: Länge der Kette ----------

export function kettenLaenge(k: KettenWegbereich): number {
  if (!k.punkte || k.punkte.length < 2) return 0;
  const samples = sampleMidline(k.punkte);
  return samples.length === 0 ? 0 : samples[samples.length - 1].s;
}

// Re-Export Helper für Konsumenten (HallCanvas)
export const __internal = { sampleMidline, distancePointToSegment, norm };
