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
    const raw = window.localStorage.getItem('topis-layout');
    const state = raw ? JSON.parse(raw).state : {};
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      zoom: state.zoom ?? 1,
      pan: state.pan ?? { x: 0, y: 0 },
    };
  });
}

/** Convert world (m) -> page pixel for the main hall canvas. */
export function worldToPagePx(m: CanvasMapping, worldX: number, worldY: number): { x: number; y: number } {
  const SCALE = 10;
  return {
    x: m.rect.x + 28 + m.pan.x + worldX * SCALE * m.zoom, // 28 = y-ruler width
    y: m.rect.y + 22 + m.pan.y + worldY * SCALE * m.zoom, // 22 = x-ruler height
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
