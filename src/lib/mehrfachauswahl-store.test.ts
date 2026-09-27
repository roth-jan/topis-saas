/**
 * Mehrfachauswahl im Store — Tester-Feedback Michael Laufenburg (27.09.2026):
 * 20 Tore einfügen, alle markieren, gemeinsam auf eine Größe bringen, verschieben
 * und auf Bauplanmaß verteilen.
 *
 * Der kritische Punkt ist die Wand-Verankerung (Lastenheft 3.1.2): Tore dürfen sich
 * bei keiner Sammelaktion von ihrer Außenwand lösen.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useTopisStore } from './store';
import type { TopisObject } from '@/types/topis';

function reset() {
  useTopisStore.setState({
    halls: [{ id: 1, shape: 'rect', width: 150, height: 40, name: 'Halle 6', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }],
    activeHallId: 1,
    objects: [], paths: [], gaenge: [], pathAreas: [], conveyors: [], kettenWegbereiche: [],
    objectIdCounter: 1, pathIdCounter: 1, pathAreaIdCounter: 1, conveyorIdCounter: 1,
    selectedObject: null, selectedIds: [], selectedPath: null,
  });
}

/** Legt n Tore an der Nordwand an — wie der Serien-Dialog es tut. */
function toreAnNordwand(n: number, startX = 0, abstand = 6): TopisObject[] {
  const s = useTopisStore.getState();
  const tore: TopisObject[] = [];
  for (let i = 0; i < n; i++) {
    tore.push(
      s.addObject({
        type: 'tor',
        name: `Tor ${i + 1}`,
        x: startX + i * abstand,
        y: 0,
        width: 3.75,
        height: 0.5,
        side: 'north',
        aussenwandRef: {
          wallIndex: 0,
          abstandS: startX + i * abstand + 3.75 / 2,
          abstandE: 150 - (startX + i * abstand + 3.75 / 2),
        },
      } as Omit<TopisObject, 'id'>),
    );
  }
  return tore;
}

describe('Auswahl', () => {
  beforeEach(reset);

  it('setSelectedIds markiert mehrere Objekte', () => {
    const tore = toreAnNordwand(5);
    useTopisStore.getState().setSelectedIds(tore.map((t) => t.id));
    expect(useTopisStore.getState().selectedIds).toHaveLength(5);
  });

  it('bei genau einem Treffer bleibt das Einzel-Panel bedient', () => {
    const tore = toreAnNordwand(3);
    useTopisStore.getState().setSelectedIds([tore[1].id]);
    expect(useTopisStore.getState().selectedObject?.id).toBe(tore[1].id);
  });

  it('bei mehreren Treffern gibt es kein Einzelobjekt mehr', () => {
    const tore = toreAnNordwand(3);
    useTopisStore.getState().setSelectedIds(tore.map((t) => t.id));
    expect(useTopisStore.getState().selectedObject).toBeNull();
  });

  it('selectObject hält die Mehrfachauswahl synchron', () => {
    const tore = toreAnNordwand(3);
    useTopisStore.getState().setSelectedIds(tore.map((t) => t.id));
    useTopisStore.getState().selectObject(tore[0]);
    expect(useTopisStore.getState().selectedIds).toEqual([tore[0].id]);
  });

  it('toggleSelectedId nimmt auf und wieder raus', () => {
    const tore = toreAnNordwand(3);
    const s = () => useTopisStore.getState();
    s().setSelectedIds([tore[0].id]);
    s().toggleSelectedId(tore[1].id);
    expect(s().selectedIds).toHaveLength(2);
    s().toggleSelectedId(tore[1].id);
    expect(s().selectedIds).toEqual([tore[0].id]);
  });

  it('gelöschte IDs werden nicht markiert', () => {
    const tore = toreAnNordwand(2);
    useTopisStore.getState().setSelectedIds([tore[0].id, 999]);
    expect(useTopisStore.getState().selectedIds).toEqual([tore[0].id]);
  });

  it('Auswahlrahmen greift alle berührten Tore', () => {
    toreAnNordwand(10); // x = 0, 6, 12 … 54
    const ids = useTopisStore.getState().selectObjectsInRect({ x: 5, y: -1, width: 20, height: 5 });
    // Tore bei x=6, 12, 18 liegen drin; das bei x=0 (Kante 3.75) und x=24 werden berührt geprüft
    expect(ids.length).toBeGreaterThanOrEqual(3);
    const namen = useTopisStore.getState().objects.filter((o) => ids.includes(o.id)).map((o) => o.name);
    expect(namen).toContain('Tor 2');
    expect(namen).toContain('Tor 4');
    expect(namen).not.toContain('Tor 9');
  });
});

describe('updateObjects — gemeinsame Größe', () => {
  beforeEach(reset);

  it('setzt bei allen markierten Toren dieselbe Breite', () => {
    const tore = toreAnNordwand(20);
    const ids = tore.map((t) => t.id);
    useTopisStore.getState().setSelectedIds(ids);
    useTopisStore.getState().updateObjects(ids, { width: 4.2 });
    const breiten = useTopisStore.getState().objects.map((o) => o.width);
    expect(new Set(breiten)).toEqual(new Set([4.2]));
  });

  it('ist ein einziger Undo-Schritt für alle 20 Tore', () => {
    const tore = toreAnNordwand(20);
    const ids = tore.map((t) => t.id);
    useTopisStore.getState().updateObjects(ids, { width: 4.2 });
    useTopisStore.getState().undo();
    const breiten = useTopisStore.getState().objects.map((o) => o.width);
    expect(new Set(breiten)).toEqual(new Set([3.75]));
  });

  it('lässt nicht markierte Objekte unangetastet', () => {
    const tore = toreAnNordwand(4);
    useTopisStore.getState().updateObjects([tore[0].id, tore[1].id], { width: 5 });
    const objs = useTopisStore.getState().objects;
    expect(objs.find((o) => o.id === tore[2].id)!.width).toBe(3.75);
  });
});

describe('moveObjects — gemeinsam verschieben', () => {
  beforeEach(reset);

  it('verschiebt die ganze Auswahl um denselben Betrag', () => {
    const tore = toreAnNordwand(5);
    const ids = tore.map((t) => t.id);
    const vorher = useTopisStore.getState().objects.map((o) => o.x);
    useTopisStore.getState().moveObjects(ids, 10, 0);
    const nachher = useTopisStore.getState().objects.map((o) => o.x);
    nachher.forEach((x, i) => expect(x).toBeCloseTo(vorher[i] + 10));
  });

  it('Tore bleiben an ihrer Wand verankert', () => {
    const tore = toreAnNordwand(5);
    useTopisStore.getState().moveObjects(tore.map((t) => t.id), 12, 0);
    for (const o of useTopisStore.getState().objects) {
      expect(o.aussenwandRef).toBeDefined();
      expect(o.aussenwandRef!.wallIndex).toBe(0);
      expect(o.y).toBeCloseTo(0);
    }
  });

  it('Anker wandert mit: abstandS folgt der neuen x-Position', () => {
    const tore = toreAnNordwand(3);
    useTopisStore.getState().moveObjects(tore.map((t) => t.id), 10, 0);
    const erstes = useTopisStore.getState().objects.find((o) => o.id === tore[0].id)!;
    expect(erstes.aussenwandRef!.abstandS).toBeCloseTo(10 + 3.75 / 2);
  });

  it('am Hallenrand bleibt der Abstand innerhalb der Auswahl erhalten', () => {
    // Letztes Tor liegt bei x=54; Halle ist 150 breit → 100 m nach rechts geht nicht komplett.
    const tore = toreAnNordwand(10);
    const abstandVorher = useTopisStore.getState().objects[1].x - useTopisStore.getState().objects[0].x;
    useTopisStore.getState().moveObjects(tore.map((t) => t.id), 200, 0);
    const objs = useTopisStore.getState().objects;
    expect(objs[1].x - objs[0].x).toBeCloseTo(abstandVorher);
    expect(Math.max(...objs.map((o) => o.x + o.width))).toBeLessThanOrEqual(150 + 1e-6);
  });
});

describe('verteileObjects — Bauplanmaß', () => {
  beforeEach(reset);

  it('Achsabstand setzt gleiche Achsmaße entlang der Wand', () => {
    const tore = toreAnNordwand(6, 0, 7); // unregelmäßig gedacht: 7 m
    useTopisStore.getState().verteileObjects(tore.map((t) => t.id), 'achsabstand', 5);
    const objs = useTopisStore.getState().objects.slice().sort((a, b) => a.x - b.x);
    for (let i = 1; i < objs.length; i++) {
      const dS = objs[i].aussenwandRef!.abstandS - objs[i - 1].aussenwandRef!.abstandS;
      expect(dS).toBeCloseTo(5);
    }
  });

  it('Achsabstand wirkt auch auf die gezeichnete x-Position', () => {
    const tore = toreAnNordwand(4, 0, 9);
    useTopisStore.getState().verteileObjects(tore.map((t) => t.id), 'achsabstand', 5);
    const objs = useTopisStore.getState().objects.slice().sort((a, b) => a.x - b.x);
    for (let i = 1; i < objs.length; i++) {
      expect(objs[i].x - objs[i - 1].x).toBeCloseTo(5);
    }
  });

  it('gleichmäßig lässt erstes und letztes Tor stehen', () => {
    const tore = toreAnNordwand(5, 0, 6);
    const ersteX = useTopisStore.getState().objects[0].x;
    const letzteX = useTopisStore.getState().objects[4].x;
    useTopisStore.getState().verteileObjects(tore.map((t) => t.id), 'gleichmaessig');
    const objs = useTopisStore.getState().objects.slice().sort((a, b) => a.x - b.x);
    expect(objs[0].x).toBeCloseTo(ersteX);
    expect(objs[4].x).toBeCloseTo(letzteX);
  });

  it('Tore bleiben nach dem Verteilen an der Wand', () => {
    const tore = toreAnNordwand(6);
    useTopisStore.getState().verteileObjects(tore.map((t) => t.id), 'luecke', 2);
    for (const o of useTopisStore.getState().objects) {
      expect(o.y).toBeCloseTo(0);
      expect(o.aussenwandRef!.wallIndex).toBe(0);
      // abstandE muss zur Wandlänge passen, sonst driftet die Anzeige im Panel
      expect(o.aussenwandRef!.abstandS + o.aussenwandRef!.abstandE).toBeCloseTo(150);
    }
  });

  it('Tore an verschiedenen Wänden werden getrennt verteilt', () => {
    const nord = toreAnNordwand(3, 0, 8);
    const s = useTopisStore.getState();
    const ost = [0, 1, 2].map((i) =>
      s.addObject({
        type: 'tor', name: `Ost ${i + 1}`, x: 150 - 0.5, y: 5 + i * 9, width: 0.5, height: 3.75,
        side: 'east',
        aussenwandRef: { wallIndex: 1, abstandS: 5 + i * 9 + 3.75 / 2, abstandE: 40 - (5 + i * 9 + 3.75 / 2) },
      } as Omit<TopisObject, 'id'>),
    );
    useTopisStore.getState().verteileObjects([...nord, ...ost].map((t) => t.id), 'achsabstand', 5);
    const objs = useTopisStore.getState().objects;
    const nordObjs = objs.filter((o) => o.side === 'north').sort((a, b) => a.x - b.x);
    const ostObjs = objs.filter((o) => o.side === 'east').sort((a, b) => a.y - b.y);
    expect(nordObjs[1].x - nordObjs[0].x).toBeCloseTo(5);
    expect(ostObjs[1].y - ostObjs[0].y).toBeCloseTo(5);
    // Ost-Tore bleiben an der Ostwand, wandern nicht nach x
    for (const o of ostObjs) expect(o.x).toBeCloseTo(150 - 0.5);
  });

  it('freie Objekte (keine Tore) werden über die dominante Achse verteilt', () => {
    const s = useTopisStore.getState();
    const plaetze = [0, 1, 2].map((i) =>
      s.addObject({ type: 'stellplatz', name: `SP ${i + 1}`, x: i * 11, y: 20, width: 3, height: 12 } as Omit<TopisObject, 'id'>),
    );
    useTopisStore.getState().verteileObjects(plaetze.map((p) => p.id), 'luecke', 1);
    const objs = useTopisStore.getState().objects.slice().sort((a, b) => a.x - b.x);
    expect(objs[1].x).toBeCloseTo(4);
    expect(objs[2].x).toBeCloseTo(8);
    expect(objs.every((o) => o.y === 20)).toBe(true);
  });

  it('unter 2 Objekten passiert nichts', () => {
    const tore = toreAnNordwand(1);
    const vorher = useTopisStore.getState().objects[0].x;
    useTopisStore.getState().verteileObjects([tore[0].id], 'achsabstand', 5);
    expect(useTopisStore.getState().objects[0].x).toBe(vorher);
  });
});

describe('richteObjectsAus', () => {
  beforeEach(reset);

  it('richtet eine Reihe freier Objekte quer bündig aus', () => {
    const s = useTopisStore.getState();
    const plaetze = [
      s.addObject({ type: 'stellplatz', name: 'A', x: 0, y: 20, width: 3, height: 12 } as Omit<TopisObject, 'id'>),
      s.addObject({ type: 'stellplatz', name: 'B', x: 20, y: 23, width: 3, height: 12 } as Omit<TopisObject, 'id'>),
      s.addObject({ type: 'stellplatz', name: 'C', x: 40, y: 18, width: 3, height: 12 } as Omit<TopisObject, 'id'>),
    ];
    useTopisStore.getState().richteObjectsAus(plaetze.map((p) => p.id), 'start');
    const ys = useTopisStore.getState().objects.map((o) => o.y);
    expect(new Set(ys)).toEqual(new Set([18]));
  });
});

describe('deleteObjects', () => {
  beforeEach(reset);

  it('löscht die ganze Auswahl auf einmal und leert die Markierung', () => {
    const tore = toreAnNordwand(5);
    const ids = tore.slice(0, 3).map((t) => t.id);
    useTopisStore.getState().setSelectedIds(ids);
    useTopisStore.getState().deleteObjects(ids);
    expect(useTopisStore.getState().objects).toHaveLength(2);
    expect(useTopisStore.getState().selectedIds).toHaveLength(0);
  });

  it('nimmt gebundene Kinder mit (Parent-Bindung 3.1.2)', () => {
    const tore = toreAnNordwand(2);
    const s = useTopisStore.getState();
    s.addObject({ type: 'rampe', name: 'Brücke', x: 0, y: -3, width: 3.75, height: 3, parentObjectId: tore[0].id } as Omit<TopisObject, 'id'>);
    useTopisStore.getState().deleteObjects([tore[0].id]);
    const namen = useTopisStore.getState().objects.map((o) => o.name);
    expect(namen).toEqual(['Tor 2']);
  });
});
