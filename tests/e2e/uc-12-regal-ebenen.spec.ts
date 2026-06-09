/**
 * UC-12 — Regal levels (Ebenen) as an editable array.
 *
 * Lastenheft 3.1.3.2: Regale haben 2-n Ebenen, jede Ebene = eigener Stellplatz
 * mit eigener Bezeichnung, Unterkante, Höhe, Palettenplätzen.
 *
 * Acceptance:
 *  - "Aus Skalaren generieren" button populates regalEbenen[] from scalar Ebenen count.
 *  - Adding a new Ebene appends to the array.
 *  - Deleting a row removes from the array.
 *  - Edits persist across reload.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState } from './helpers/topisPage';

test.describe('UC-12 Regal-Ebenen array', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
    await patchLayoutState(page, (state) => {
      const objs = state.objects as unknown[] || [];
      const id = (state.objectIdCounter as number) || 1;
      const regal = {
        id, type: 'regal', name: 'R-Test', x: 10, y: 10, width: 12, height: 1.2,
        ebenen: 4, unterkante: 0.5, ebenenHoehe: 1.5, palettenPlaetzeProEbene: 10,
      };
      objs.push(regal);
      (state as Record<string, unknown>).objects = objs;
      (state as Record<string, unknown>).objectIdCounter = id + 1;
      (state as Record<string, unknown>).selectedObject = regal;
    });
  });

  test('"Aus Skalaren generieren" creates 4 level rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Aus Skalaren generieren' }).click();
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const r = (s.objects as Array<{ name: string; regalEbenen?: unknown[] }>).find((o) => o.name === 'R-Test');
      return r?.regalEbenen?.length ?? 0;
    }).toBe(4);
  });

  test('+ Ebene adds, × removes', async ({ page }) => {
    await page.getByRole('button', { name: 'Aus Skalaren generieren' }).click();
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const r = (s.objects as Array<{ name: string; regalEbenen?: unknown[] }>).find((o) => o.name === 'R-Test');
      return r?.regalEbenen?.length ?? 0;
    }).toBe(4);

    await page.getByRole('button', { name: '+ Ebene' }).click();
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const r = (s.objects as Array<{ regalEbenen?: unknown[] }>).find((o) => (o as { name?: string }).name === 'R-Test');
      return r?.regalEbenen?.length ?? 0;
    }).toBe(5);

    // Remove the last one (× button on the last row)
    const removeButtons = page.getByRole('button', { name: '×' });
    await removeButtons.last().click();
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const r = (s.objects as Array<{ regalEbenen?: unknown[] }>).find((o) => (o as { name?: string }).name === 'R-Test');
      return r?.regalEbenen?.length ?? 0;
    }).toBe(4);
  });
});
