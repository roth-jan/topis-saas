/**
 * Regressions-Locks für die bestätigten Funde des Cross-Model-Reviews vom 20.09.2026
 * (GPT-6 Astra + Gemini, gefiltert gegen den Code). Jeder Test reproduziert genau das
 * Szenario aus dem Review-Bericht (topis/cross-review-out/review-*-astra.txt).
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useTopisStore } from './store';
import { deriveWalls, reanchorTore } from './wall-anchor';
import type { TopisObject } from '@/types/topis';

function reset() {
  useTopisStore.setState({
    halls: [{ id: 1, shape: 'rect', width: 100, height: 60, name: 'H', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }],
    activeHallId: 1,
    objects: [], paths: [], gaenge: [], pathAreas: [], conveyors: [], kettenWegbereiche: [],
    objectIdCounter: 1, pathIdCounter: 1, pathAreaIdCounter: 1, conveyorIdCounter: 1,
    selectedObject: null, selectedPath: null,
    projektVergleich: { vorher: null, nachher: null, vorherScreenshot: null, nachherScreenshot: null },
  });
}

describe('Astra store #1 — loadSnapshot zieht ID-Zähler nach', () => {
  beforeEach(reset);
  it('nächstes addObject bekommt keine schon vergebene ID', () => {
    const s = useTopisStore.getState();
    s.addObject({ type: 'stellplatz', name: 'SP 1', x: 10, y: 10, width: 3, height: 12 } as Omit<TopisObject, 'id'>);
    s.addObject({ type: 'stellplatz', name: 'SP 2', x: 20, y: 10, width: 3, height: 12 } as Omit<TopisObject, 'id'>);
    const st0 = useTopisStore.getState();
    st0.saveVorher({
      halls: st0.halls, objects: st0.objects, paths: st0.paths, pathAreas: st0.pathAreas,
      gaenge: st0.gaenge, ffz: st0.ffz, conveyors: st0.conveyors,
      avgDistanz: 0, prozesszeit: 0, timestamp: new Date().toISOString(),
    }, '');
    // Zähler künstlich zurückdrehen (entspricht: Snapshot in frischen Store laden)
    useTopisStore.setState({ objects: [], objectIdCounter: 1 });
    useTopisStore.getState().loadSnapshot('vorher');
    const neu = useTopisStore.getState().addObject({ type: 'stellplatz', name: 'SP 3', x: 30, y: 10, width: 3, height: 12 } as Omit<TopisObject, 'id'>);
    const ids = useTopisStore.getState().objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(neu.id).toBeGreaterThan(2);
  });
});

describe('Gemini/Astra store — rotateHall90 dreht ALLE Geometrien + verankert Tore neu', () => {
  beforeEach(reset);
  it('Gang, Wegfläche, Kette und Tor-Anker folgen der Drehung', () => {
    const s = useTopisStore.getState();
    const tor = s.addObject({ type: 'tor', name: 'Tor 1', x: 20, y: 0, width: 3.5, height: 1.5, side: 'north' } as Omit<TopisObject, 'id'>);
    expect(tor.aussenwandRef?.wallIndex).toBe(0); // Nord
    s.addGang({ id: 1, name: 'G', points: [{ x: 80, y: 10 }, { x: 80, y: 50 }], breite: 4, typ: 'hauptgang' });
    s.addPathArea({ name: 'WF', x: 70, y: 5, width: 20, height: 50, color: '#0f0' });
    s.addKette({ name: 'K', punkte: [{ x: 10, y: 30 }, { x: 90, y: 30 }], breite: 1.4, fliessrichtung: 'vorwaerts' });
    useTopisStore.getState().rotateHall90();
    const st = useTopisStore.getState();
    const hall = st.halls[0];
    expect([hall.width, hall.height]).toEqual([60, 100]);
    // Alles innerhalb der neuen 60×100-Halle
    for (const p of st.gaenge.flatMap((g) => g.points)) { expect(p.x).toBeLessThanOrEqual(60); expect(p.y).toBeLessThanOrEqual(100); }
    for (const p of st.kettenWegbereiche.flatMap((k) => k.punkte)) { expect(p.x).toBeLessThanOrEqual(60); expect(p.y).toBeLessThanOrEqual(100); }
    const wf = st.pathAreas[0];
    expect(wf.x! + wf.width!).toBeLessThanOrEqual(60);
    // Nord-Tor (x=20) → nach Drehung an der West-Wand (Index 3), Anker konsistent
    const t = st.objects.find((o) => o.type === 'tor')!;
    expect(t.side).toBe('west');
    expect(t.aussenwandRef?.wallIndex).toBe(3);
    expect(t.x).toBeCloseTo(0, 5);
  });
});

describe('Astra lib #6 — reanchorTore hält abstandE aktuell', () => {
  it('nach Verbreiterung der Nordwand 10 → 20 m ist abstandE = 16', () => {
    const tor: TopisObject = {
      id: 1, type: 'tor', name: 'T', x: 4 - 1.75, y: 0, width: 3.5, height: 1.5, side: 'north',
      aussenwandRef: { wallIndex: 0, abstandS: 4, abstandE: 6 },
    };
    const [r] = reanchorTore([tor], deriveWalls({ width: 20, height: 10 }));
    expect(r.aussenwandRef).toEqual({ wallIndex: 0, abstandS: 4, abstandE: 16 });
    expect(r.x).toBeCloseTo(4 - 1.75);
  });
});

describe('Astra store #4 — Kinder folgen der tatsächlichen Tor-Bewegung', () => {
  beforeEach(reset);
  it('Überladebrücke wandert mit, wenn nur der S/E-Anker geändert wird', () => {
    const s = useTopisStore.getState();
    const tor = s.addObject({ type: 'tor', name: 'Tor 1', x: 20, y: 0, width: 3.5, height: 1.5, side: 'north' } as Omit<TopisObject, 'id'>);
    const bruecke = s.addObject({ type: 'leveller', name: 'ÜB', x: tor.x, y: tor.y + tor.height, width: 3.5, height: 2, parentObjectId: tor.id, parentOffset: { x: 0, y: 1.5 } } as Omit<TopisObject, 'id'>);
    useTopisStore.getState().updateObject(tor.id, { aussenwandRef: { wallIndex: 0, abstandS: 50, abstandE: 50 } });
    const st = useTopisStore.getState();
    const t = st.objects.find((o) => o.id === tor.id)!;
    const b = st.objects.find((o) => o.id === bruecke.id)!;
    expect(t.x).toBeCloseTo(50 - 1.75);
    expect(b.x).toBeCloseTo(t.x); // vorher blieb die Brücke bei x=20 stehen
  });
});
