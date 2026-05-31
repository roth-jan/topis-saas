import { describe, expect, it } from 'vitest';
import {
  kettenPolygon,
  kettenPfeilPositionen,
  pointInKette,
  verbietetNutzflaeche,
  kettenLaenge,
} from './kette-geometry';
import type { KettenWegbereich, TopisObject } from '@/types/topis';

function geradeKette(opts?: Partial<KettenWegbereich>): KettenWegbereich {
  return {
    id: 1,
    name: 'K1',
    punkte: [
      { x: 0, y: 10 },
      { x: 100, y: 10 },
    ],
    breite: 4,
    fliessrichtung: 'vorwaerts',
    ...opts,
  };
}

describe('kettenPolygon', () => {
  it('2 Punkte → Polygon mit Mindest-4 Eckpunkten in Breitenrichtung', () => {
    const k = geradeKette();
    const poly = kettenPolygon(k);

    expect(poly.length).toBeGreaterThanOrEqual(4);

    // Bei horizontaler Linie y=10, Breite 4 → Polygon-y-Range muss
    // [8, 12] umfassen.
    const ys = poly.map((p) => p.y);
    expect(Math.min(...ys)).toBeCloseTo(8, 5);
    expect(Math.max(...ys)).toBeCloseTo(12, 5);

    // x-Range muss [0, 100] umfassen.
    const xs = poly.map((p) => p.x);
    expect(Math.min(...xs)).toBeCloseTo(0, 5);
    expect(Math.max(...xs)).toBeCloseTo(100, 5);
  });

  it('Leere/zu kurze Stützpunkte → leeres Polygon', () => {
    expect(kettenPolygon({ ...geradeKette(), punkte: [] })).toEqual([]);
    expect(
      kettenPolygon({ ...geradeKette(), punkte: [{ x: 0, y: 0 }] }),
    ).toEqual([]);
  });

  it('3-Punkt-Kurve liefert geschlossenes Polygon (Hin- und Rückseite)', () => {
    const k: KettenWegbereich = {
      ...geradeKette(),
      punkte: [
        { x: 0, y: 0 },
        { x: 50, y: 20 },
        { x: 100, y: 0 },
      ],
    };
    const poly = kettenPolygon(k);
    expect(poly.length).toBeGreaterThan(8);
  });
});

describe('kettenPfeilPositionen', () => {
  it('Anzahl Pfeile = floor(länge / intervall) bei gerader Linie', () => {
    const k = geradeKette({
      punkte: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    });
    // Länge 100, Intervall 20 → mit Start bei intervall/2=10 sollten 5 Pfeile passen
    const pfeile = kettenPfeilPositionen(k, 20);
    expect(pfeile.length).toBe(5);
  });

  it('Fließrichtung vorwärts: Pfeil zeigt in Linien-Richtung', () => {
    const k = geradeKette({
      punkte: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      fliessrichtung: 'vorwaerts',
    });
    const pfeile = kettenPfeilPositionen(k, 50);
    expect(pfeile.length).toBeGreaterThan(0);
    // Tangenten-Winkel bei horizontaler Linie nach rechts = 0
    expect(Math.cos(pfeile[0].richtung)).toBeCloseTo(1, 3);
    expect(Math.sin(pfeile[0].richtung)).toBeCloseTo(0, 3);
  });

  it('Fließrichtung rückwärts: Pfeil zeigt entgegen', () => {
    const k = geradeKette({
      punkte: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      fliessrichtung: 'rueckwaerts',
    });
    const pfeile = kettenPfeilPositionen(k, 50);
    expect(pfeile.length).toBeGreaterThan(0);
    expect(Math.cos(pfeile[0].richtung)).toBeCloseTo(-1, 3);
  });

  it('Intervall 0 → keine Pfeile (statt Endlosschleife)', () => {
    expect(kettenPfeilPositionen(geradeKette(), 0)).toEqual([]);
  });
});

describe('pointInKette', () => {
  const k = geradeKette({
    punkte: [
      { x: 0, y: 10 },
      { x: 100, y: 10 },
    ],
    breite: 4,
  });

  it('Punkt auf der Mittellinie liegt drin', () => {
    expect(pointInKette(50, 10, k)).toBe(true);
  });

  it('Punkt am Rand (innerhalb der halben Breite) liegt drin', () => {
    expect(pointInKette(50, 11.9, k)).toBe(true);
    expect(pointInKette(50, 8.1, k)).toBe(true);
  });

  it('Punkt 2× Breite entfernt liegt NICHT drin', () => {
    expect(pointInKette(50, 18, k)).toBe(false);
    expect(pointInKette(50, 2, k)).toBe(false);
  });

  it('Punkt vor/hinter der Kette (außerhalb der Pfad-Länge) liegt nicht drin', () => {
    expect(pointInKette(-5, 10, k)).toBe(false);
    expect(pointInKette(110, 10, k)).toBe(false);
  });

  it('Leere Stützpunkte → immer false', () => {
    const leer: KettenWegbereich = { ...k, punkte: [] };
    expect(pointInKette(50, 10, leer)).toBe(false);
  });
});

describe('verbietetNutzflaeche', () => {
  const kette = geradeKette({
    punkte: [
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ],
    breite: 6,
  });

  function stellplatz(opts: Partial<TopisObject>): TopisObject {
    return {
      id: 10,
      type: 'stellplatz',
      x: 0,
      y: 0,
      width: 2,
      height: 2,
      name: 'S1',
      ...opts,
    } as TopisObject;
  }

  it('Stellplatz mittig auf Kette → true', () => {
    const s = stellplatz({ x: 50, y: 49, width: 2, height: 2 });
    expect(verbietetNutzflaeche(s, [kette])).toBe(true);
  });

  it('Stellplatz daneben (außerhalb halber Breite + Toleranz) → false', () => {
    const s = stellplatz({ x: 50, y: 20, width: 2, height: 2 });
    expect(verbietetNutzflaeche(s, [kette])).toBe(false);
  });

  it('Regal mittig auf Kette → true', () => {
    const r = stellplatz({ type: 'regal', x: 80, y: 48, width: 4, height: 4 });
    expect(verbietetNutzflaeche(r, [kette])).toBe(true);
  });

  it('Tor wird nicht als Nutzfläche gewertet (Lastenheft: nur Nutzflächen verboten)', () => {
    const t = stellplatz({ type: 'tor', x: 50, y: 50, width: 3, height: 1 });
    expect(verbietetNutzflaeche(t, [kette])).toBe(false);
  });

  it('Keine Ketten → nie verboten', () => {
    const s = stellplatz({ x: 50, y: 50 });
    expect(verbietetNutzflaeche(s, [])).toBe(false);
  });

  it('Stellplatz tangiert Kette nur mit einer Ecke → true (Ecke prüft mit)', () => {
    // Stellplatz-Ecke (50, 47) liegt in Kette (50, 47..53)
    const s = stellplatz({ x: 50, y: 46, width: 2, height: 2 });
    expect(verbietetNutzflaeche(s, [kette])).toBe(true);
  });
});

describe('kettenLaenge', () => {
  it('Gerade Kette 100m → ungefähr 100m', () => {
    const k = geradeKette({
      punkte: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    });
    expect(kettenLaenge(k)).toBeCloseTo(100, 1);
  });

  it('Kurve ist länger als die direkte Distanz der Endpunkte', () => {
    const k = geradeKette({
      punkte: [
        { x: 0, y: 0 },
        { x: 50, y: 30 },
        { x: 100, y: 0 },
      ],
    });
    const direkt = Math.hypot(100, 0); // 100
    expect(kettenLaenge(k)).toBeGreaterThan(direkt);
  });
});
