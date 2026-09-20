import { describe, it, expect } from 'vitest';
import { computeAlignment, type DragRect } from './alignment';

const hall = { width: 100, height: 50 };

describe('computeAlignment — Snapping + Live-Maß', () => {
  it('rastet die linke Kante an die linke Kante eines Nachbarn (innerhalb Toleranz)', () => {
    const nachbar: DragRect = { id: 1, x: 20, y: 5, width: 4, height: 10 };
    const drag: DragRect = { id: 2, x: 20.3, y: 30, width: 4, height: 10 }; // 0.3 m daneben
    const r = computeAlignment(drag, [nachbar], hall, 0.5);
    expect(r.x).toBeCloseTo(20, 6);      // auf x=20 gerastet
    expect(r.vx).toContain(20);          // Führungslinie bei x=20
  });

  it('rastet NICHT, wenn außerhalb der Toleranz', () => {
    const nachbar: DragRect = { id: 1, x: 20, y: 5, width: 4, height: 10 };
    const drag: DragRect = { id: 2, x: 25, y: 30, width: 4, height: 10 };
    const r = computeAlignment(drag, [nachbar], hall, 0.5);
    expect(r.x).toBeCloseTo(25, 6);
    expect(r.vx).toHaveLength(0);
  });

  it('rastet an die Wand (x=0)', () => {
    const drag: DragRect = { id: 2, x: 0.2, y: 10, width: 4, height: 10 };
    const r = computeAlignment(drag, [], hall, 0.5);
    expect(r.x).toBeCloseTo(0, 6);
    expect(r.vx).toContain(0);
  });

  it('Live-Maß: horizontale Lücke zum Nachbarn (gleiche Zeile) in Metern', () => {
    // Nachbar endet bei x=24; drag beginnt bei x=27 → 3,00 m Lücke.
    const nachbar: DragRect = { id: 1, x: 20, y: 10, width: 4, height: 10 };
    const drag: DragRect = { id: 2, x: 27, y: 10, width: 4, height: 10 };
    const r = computeAlignment(drag, [nachbar], hall, 0.1);
    const hMeasure = r.measures.find((m) => m.text.startsWith('3,00'));
    expect(hMeasure).toBeTruthy();
    expect(hMeasure!.x).toBeCloseTo(25.5, 1); // Mitte der Lücke (24..27)
  });

  it('keine horizontale Lücke, wenn keine Y-Überlappung', () => {
    const nachbar: DragRect = { id: 1, x: 20, y: 0, width: 4, height: 4 };   // ganz oben
    const drag: DragRect = { id: 2, x: 27, y: 40, width: 4, height: 4 };     // ganz unten
    const r = computeAlignment(drag, [nachbar], hall, 0.1);
    // kein horizontales Maß (keine Y-Überlappung), evtl. vertikales — hier prüfen wir nur H.
    expect(r.measures.some((m) => Math.abs(m.y - 10) < 1)).toBe(false);
  });
});
