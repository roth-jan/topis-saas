import { Page } from '@playwright/test';

/** TOPIS canvas uses SCALE = 10 px/m and a configurable zoom. The hall is rendered
 * starting at a left offset of ~28 px (the y-ruler column) and ~22 px top (x-ruler).
 * For deterministic clicks we read the actual canvas BoundingClientRect from the
 * browser and combine it with the current zoom from the Zustand state.
 *
 * NB: The main hall canvas is `document.querySelectorAll('canvas')[0]`. There are
 * also ruler canvases and a minimap canvas. */

export interface CanvasMapping {
  rect: { x: number; y: number; w: number; h: number };
  zoom: number;
  pan: { x: number; y: number };
}

export async function getCanvasMapping(page: Page): Promise<CanvasMapping> {
  return page.evaluate(() => {
    const canvas = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    // zoom/pan aus dem LIVE-Store lesen, nicht aus localStorage: beide stehen
    // NICHT in der persist-partialize, und der Canvas zentriert die Halle beim
    // ersten Mount (setPan). Aus dem Speicher kämen immer zoom 1 / pan 0,0 —
    // damit landen Maus-Koordinaten systematisch neben dem Ziel.
    const store = (window as unknown as {
      __topisStore?: { getState: () => { zoom?: number; pan?: { x: number; y: number } } };
    }).__topisStore;
    if (store) {
      const st = store.getState();
      return {
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        zoom: st.zoom ?? 1,
        pan: st.pan ?? { x: 0, y: 0 },
      };
    }
    const raw = window.localStorage.getItem('topis-layout');
    const state = raw ? JSON.parse(raw).state : {};
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      zoom: state.zoom ?? 1,
      pan: state.pan ?? { x: 0, y: 0 },
    };
  });
}

/**
 * Convert world (m) -> page pixel for the main hall canvas.
 *
 * Die App rechnet `screenToWorld(e.clientX - rect.left, …)` — OHNE Lineal-Zuschlag.
 * Die beiden Lineale sind eigene Canvas-Elemente, die ÜBER dem Hallen-Canvas liegen
 * (gleicher Ursprung, 28 px breit bzw. 22 px hoch). Ein früher hier addierter
 * Zuschlag von 28/22 px verschob deshalb jede Maus-Koordinate um 2,8 m / 2,2 m.
 *
 * Achtung beim Testaufbau: In den linken 28 px und den oberen 22 px des Canvas
 * fangen die Lineale die Maus-Events ab. Punkte dort (Welt-x < ~2.8/zoom bzw.
 * Welt-y < ~2.2/zoom bei pan 0) erreichen den Hallen-Canvas nicht.
 */
export function worldToPagePx(m: CanvasMapping, worldX: number, worldY: number): { x: number; y: number } {
  const SCALE = 10;
  return {
    x: m.rect.x + m.pan.x + worldX * SCALE * m.zoom,
    y: m.rect.y + m.pan.y + worldY * SCALE * m.zoom,
  };
}

/** Convenience: click on the main canvas at world coordinates. Dispatches mousedown
 * + mouseup + click so React handlers wire-through, instead of page.mouse which can
 * trigger drag detection. */
export async function clickWorld(page: Page, worldX: number, worldY: number): Promise<void> {
  const m = await getCanvasMapping(page);
  const p = worldToPagePx(m, worldX, worldY);
  await page.evaluate(({ x, y }) => {
    const canvas = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
    for (const t of ['mousedown', 'mouseup', 'click']) {
      canvas.dispatchEvent(new MouseEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0 }));
    }
  }, p);
}

/**
 * Setzt Zoom und Verschiebung fest, bevor mit der Maus auf dem Canvas gearbeitet wird.
 *
 * Ohne das hängt jede Maus-Koordinate an der Fenstergröße: Der Canvas zentriert die
 * Halle beim ersten Mount, und ist die Halle breiter als die sichtbare Fläche, wird
 * `pan` NEGATIV — dann liegen die linken Meter der Halle außerhalb des Canvas und
 * Klicks landen im Seitenpanel. `pan` ist der Bildschirm-Versatz des Hallen-Ursprungs
 * in Pixeln; 40/80 rückt Welt (0,0) sichtbar nach innen, hinter die Lineale.
 */
export async function setView(
  page: Page,
  view: { zoom?: number; pan?: { x: number; y: number } } = {},
): Promise<void> {
  const zoom = view.zoom ?? 1;
  const pan = view.pan ?? { x: 40, y: 80 };
  await page.waitForFunction(() => !!(window as unknown as { __topisStore?: unknown }).__topisStore);
  await page.evaluate(({ zoom, pan }) => {
    const store = (window as unknown as {
      __topisStore: { getState: () => { setZoom: (z: number) => void; setPan: (p: { x: number; y: number }) => void } };
    }).__topisStore;
    store.getState().setZoom(zoom);
    store.getState().setPan(pan);
  }, { zoom, pan });
  // Ein Frame abwarten, damit der Canvas mit den neuen Werten neu zeichnet.
  await page.waitForTimeout(150);
}
