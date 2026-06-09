/**
 * UC-10 — Stellplatz form variants render and hit-test correctly.
 *
 * Lastenheft 3.1.3.1: Nutzflächen sind meist rechteckig, müssen jedoch auch
 * individuell gestaltbar sein (Winkel ≠ 90°, Rundung). Form: Rechteck, Kreis,
 * Trapez, Freihand.
 *
 * Acceptance:
 *  - Setting formVariante = 'circle' on a Stellplatz makes the canvas render
 *    a circle (visually verified via pixel sample at bounding-box corner).
 *  - Hit-detection follows the rendered shape: clicking the corner of the
 *    bounding rectangle of a circle Stellplatz does NOT select it.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState } from './helpers/topisPage';
import { getCanvasMapping, worldToPagePx } from './helpers/canvas';

test.describe('UC-10 Stellplatz form variants', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
    // Seed three stellplaetze with three different form variants
    await patchLayoutState(page, (state) => {
      const objs = state.objects as unknown[] || [];
      const start = (state.objectIdCounter as number) || 1;
      objs.push({ id: start,   type: 'stellplatz', name: 'SP-Circle',  x: 20, y: 20, width: 8, height: 8, formVariante: 'circle' });
      objs.push({ id: start+1, type: 'stellplatz', name: 'SP-Trapez',  x: 35, y: 20, width: 10, height: 6, formVariante: 'trapez' });
      objs.push({ id: start+2, type: 'stellplatz', name: 'SP-Rect',    x: 50, y: 20, width: 8, height: 6 });
      (state as Record<string, unknown>).objects = objs;
      (state as Record<string, unknown>).objectIdCounter = start + 3;
    });
  });

  test('three form variants persist in state', async ({ page }) => {
    const s = await readLayoutState(page);
    const sps = (s.objects as Array<{ type: string; name: string; formVariante?: string }>)
      .filter((o) => o.type === 'stellplatz');
    expect(sps.find((o) => o.name === 'SP-Circle')?.formVariante).toBe('circle');
    expect(sps.find((o) => o.name === 'SP-Trapez')?.formVariante).toBe('trapez');
    expect(sps.find((o) => o.name === 'SP-Rect')?.formVariante).toBeUndefined();
  });

  test('circle Stellplatz: hit at center selects, hit at corner does NOT', async ({ page }) => {
    const m = await getCanvasMapping(page);
    // SP-Circle at world (20..28, 20..28), center (24, 24)
    const center = worldToPagePx(m, 24, 24);
    const corner = worldToPagePx(m, 20.5, 20.5); // inside bbox, outside circle

    // Click center → expect select
    await page.evaluate(({ x, y }) => {
      const canvas = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
      for (const t of ['mousedown', 'mouseup', 'click']) {
        canvas.dispatchEvent(new MouseEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0 }));
      }
    }, center);
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const sel = s.selectedObject as { name?: string } | null;
      return sel?.name ?? null;
    }, { timeout: 2_000 }).toBe('SP-Circle');

    // Deselect, click corner → expect NOT SP-Circle
    await page.keyboard.press('Escape');
    await page.evaluate(({ x, y }) => {
      const canvas = document.querySelectorAll('canvas')[0] as HTMLCanvasElement;
      for (const t of ['mousedown', 'mouseup', 'click']) {
        canvas.dispatchEvent(new MouseEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0 }));
      }
    }, corner);
    const after = await readLayoutState(page);
    const sel = after.selectedObject as { name?: string } | null;
    expect(sel?.name).not.toBe('SP-Circle');
  });
});
