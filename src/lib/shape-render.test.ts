import { describe, expect, it } from 'vitest';
import {
  pointInFormVariante,
  pathForFormVariante,
  TRAPEZ_TOP_RATIO,
  type ShapeObject,
} from './shape-render';

describe('pointInFormVariante — rect', () => {
  const rect: ShapeObject = { x: 0, y: 0, width: 10, height: 10, formVariante: 'rect' };

  it('Mittelpunkt innerhalb', () => {
    expect(pointInFormVariante(5, 5, rect)).toBe(true);
  });

  it('Ecke (genau auf der Kante) zählt als innen', () => {
    expect(pointInFormVariante(0, 0, rect)).toBe(true);
    expect(pointInFormVariante(10, 10, rect)).toBe(true);
  });

  it('außerhalb rechts → false', () => {
    expect(pointInFormVariante(15, 5, rect)).toBe(false);
  });

  it('außerhalb oben → false', () => {
    expect(pointInFormVariante(5, -1, rect)).toBe(false);
  });

  it('Default (formVariante undefined) verhält sich wie rect', () => {
    const obj: ShapeObject = { x: 0, y: 0, width: 10, height: 10 };
    expect(pointInFormVariante(5, 5, obj)).toBe(true);
    expect(pointInFormVariante(15, 5, obj)).toBe(false);
  });
});

describe('pointInFormVariante — circle (ellipse)', () => {
  // Nicht-quadratische Bounding-Box ⇒ Ellipse, nicht Kreis.
  const ellipse: ShapeObject = { x: 0, y: 0, width: 20, height: 10, formVariante: 'circle' };

  it('Mittelpunkt drin', () => {
    expect(pointInFormVariante(10, 5, ellipse)).toBe(true);
  });

  it('horizontaler Halbachsen-Endpunkt drin (auf Rand)', () => {
    expect(pointInFormVariante(0, 5, ellipse)).toBe(true);
    expect(pointInFormVariante(20, 5, ellipse)).toBe(true);
  });

  it('Ecke der Bounding-Box außerhalb (klassisches Ellipse-vs-Rechteck)', () => {
    expect(pointInFormVariante(0, 0, ellipse)).toBe(false);
    expect(pointInFormVariante(20, 0, ellipse)).toBe(false);
    expect(pointInFormVariante(0, 10, ellipse)).toBe(false);
    expect(pointInFormVariante(20, 10, ellipse)).toBe(false);
  });

  it('Punkt deutlich außerhalb der Bounding-Box → false', () => {
    expect(pointInFormVariante(50, 50, ellipse)).toBe(false);
  });

  it('Quadratischer Kreis: kardinale Achsen drin, Diagonale außen', () => {
    const kreis: ShapeObject = { x: 0, y: 0, width: 10, height: 10, formVariante: 'circle' };
    expect(pointInFormVariante(5, 5, kreis)).toBe(true);
    expect(pointInFormVariante(5, 0, kreis)).toBe(true); // oben mittig
    expect(pointInFormVariante(0, 0, kreis)).toBe(false); // Ecke
  });
});

describe('pointInFormVariante — trapez', () => {
  // Rechteck-Bounding-Box 10×10, Trapez mit oberer Kante 60%=6, also je 2m links/rechts oben fehlen.
  const trapez: ShapeObject = { x: 0, y: 0, width: 10, height: 10, formVariante: 'trapez' };

  it('Mittelpunkt drin', () => {
    expect(pointInFormVariante(5, 5, trapez)).toBe(true);
  });

  it('Untere Kante voll drin (Bottom-Ecke)', () => {
    expect(pointInFormVariante(0.5, 9.5, trapez)).toBe(true);
    expect(pointInFormVariante(9.5, 9.5, trapez)).toBe(true);
  });

  it('Obere äußere Ecke außerhalb (Trapez-Schräge schneidet sie ab)', () => {
    // Bei y=0 (oberste Linie) reicht das Trapez nur von x=2 bis x=8
    expect(pointInFormVariante(0.5, 0.5, trapez)).toBe(false);
    expect(pointInFormVariante(9.5, 0.5, trapez)).toBe(false);
  });

  it('Mitte oben drin', () => {
    expect(pointInFormVariante(5, 0.5, trapez)).toBe(true);
  });

  it('Vollständig außerhalb → false', () => {
    expect(pointInFormVariante(-5, 5, trapez)).toBe(false);
    expect(pointInFormVariante(20, 5, trapez)).toBe(false);
  });

  it('TRAPEZ_TOP_RATIO ist 0.6 (sanity-check)', () => {
    expect(TRAPEZ_TOP_RATIO).toBe(0.6);
  });
});

describe('pointInFormVariante — polygon', () => {
  // Dreieck mit Spitze oben Mitte, Basis unten — Punkte relativ 0..1
  const dreieck: ShapeObject = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    formVariante: 'polygon',
    polygonPunkte: [
      { x: 0.5, y: 0 },   // top center
      { x: 1, y: 1 },     // bottom right
      { x: 0, y: 1 },     // bottom left
    ],
  };

  it('innerer Punkt drin', () => {
    expect(pointInFormVariante(5, 7, dreieck)).toBe(true);
  });

  it('Spitze oben drin', () => {
    expect(pointInFormVariante(5, 0.5, dreieck)).toBe(true);
  });

  it('Ecke oben links außerhalb des Dreiecks (aber in Bounding-Box)', () => {
    expect(pointInFormVariante(0.5, 0.5, dreieck)).toBe(false);
  });

  it('Ecke oben rechts außerhalb', () => {
    expect(pointInFormVariante(9.5, 0.5, dreieck)).toBe(false);
  });

  it('Polygon ohne ausreichende Punkte fällt auf Rect zurück', () => {
    const broken: ShapeObject = {
      x: 0, y: 0, width: 10, height: 10,
      formVariante: 'polygon',
      polygonPunkte: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    };
    expect(pointInFormVariante(5, 5, broken)).toBe(true);
    expect(pointInFormVariante(15, 5, broken)).toBe(false);
  });

  it('Polygon-Punkte fehlen → Rect-Fallback', () => {
    const broken: ShapeObject = {
      x: 0, y: 0, width: 10, height: 10,
      formVariante: 'polygon',
    };
    expect(pointInFormVariante(5, 5, broken)).toBe(true);
  });

  it('Polygon mit Welt-Offset (x≠0, y≠0)', () => {
    const verschoben: ShapeObject = {
      x: 100,
      y: 50,
      width: 10,
      height: 10,
      formVariante: 'polygon',
      polygonPunkte: [
        { x: 0.5, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
    };
    expect(pointInFormVariante(105, 57, verschoben)).toBe(true);
    expect(pointInFormVariante(5, 7, verschoben)).toBe(false);
  });
});

describe('pathForFormVariante — Smoke-Tests', () => {
  /**
   * Minimal-Mock eines CanvasRenderingContext2D, der die Path-Aufrufe protokolliert.
   * Wir prüfen nicht das Pixel-Ergebnis (das macht der Browser-Layer), sondern dass
   * die richtigen Path-Operationen für jede formVariante aufgerufen werden.
   */
  function mockCtx() {
    const calls: string[] = [];
    const ctx = {
      moveTo: () => calls.push('moveTo'),
      lineTo: () => calls.push('lineTo'),
      closePath: () => calls.push('closePath'),
      ellipse: () => calls.push('ellipse'),
      rect: () => calls.push('rect'),
    } as unknown as CanvasRenderingContext2D;
    return { ctx, calls };
  }

  const identityW2S = (x: number, y: number) => ({ x, y });

  it('rect → rect()', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(ctx, { x: 0, y: 0, width: 10, height: 10, formVariante: 'rect' }, identityW2S, 1);
    expect(calls).toEqual(['rect']);
  });

  it('Default (undefined) → rect()', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(ctx, { x: 0, y: 0, width: 10, height: 10 }, identityW2S, 1);
    expect(calls).toEqual(['rect']);
  });

  it('circle → ellipse()', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(ctx, { x: 0, y: 0, width: 10, height: 10, formVariante: 'circle' }, identityW2S, 1);
    expect(calls).toEqual(['ellipse']);
  });

  it('trapez → moveTo + 3× lineTo + closePath', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(ctx, { x: 0, y: 0, width: 10, height: 10, formVariante: 'trapez' }, identityW2S, 1);
    expect(calls).toEqual(['moveTo', 'lineTo', 'lineTo', 'lineTo', 'closePath']);
  });

  it('polygon (3 Punkte) → moveTo + 2× lineTo + closePath', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(
      ctx,
      {
        x: 0, y: 0, width: 10, height: 10,
        formVariante: 'polygon',
        polygonPunkte: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 1 }],
      },
      identityW2S,
      1,
    );
    expect(calls).toEqual(['moveTo', 'lineTo', 'lineTo', 'closePath']);
  });

  it('polygon ohne genug Punkte → fallback rect()', () => {
    const { ctx, calls } = mockCtx();
    pathForFormVariante(
      ctx,
      {
        x: 0, y: 0, width: 10, height: 10,
        formVariante: 'polygon',
        polygonPunkte: [{ x: 0, y: 0 }],
      },
      identityW2S,
      1,
    );
    expect(calls).toEqual(['rect']);
  });
});
