/**
 * UC-11 — Tor is anchored to outer wall and follows wall geometry.
 *
 * Lastenheft 3.1.2: Tore werden auf den Außenwänden positioniert und sind fest
 * mit der Außenwand verankert. Position als Abstand von Eckpunkten S und E.
 *
 * Prerequisite: hall must have walls. Default empty hall has walls: [].
 * Use loadHallWithWalls() to inject 4 outer walls.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState, loadHallWithWalls } from './helpers/topisPage';
import { clickWorld } from './helpers/canvas';

test.describe('UC-11 Tor wall anchor', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
    await loadHallWithWalls(page);
  });

  test('placing a Tor near a wall sets aussenwandRef', async ({ page }) => {
    // Activate Tor tool
    await page.getByRole('button', { name: 'Tor' }).first().click();
    // Click near the north wall (y=0). World (50, 1).
    await clickWorld(page, 50, 1);
    // Verify the new Tor has aussenwandRef set
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const tore = (s.objects as Array<{ type: string; aussenwandRef?: unknown }>)
        .filter((o) => o.type === 'tor');
      const latest = tore[tore.length - 1];
      return latest?.aussenwandRef ? 'yes' : 'no';
    }, { timeout: 5_000 }).toBe('yes');
    const s = await readLayoutState(page);
    const tore = (s.objects as Array<{ type: string; aussenwandRef?: { wallIndex: number; abstandS: number; abstandE: number }; side?: string }>)
      .filter((o) => o.type === 'tor');
    const latest = tore[tore.length - 1];
    expect(latest.aussenwandRef!.wallIndex).toBe(0); // north wall is index 0
    expect(latest.aussenwandRef!.abstandS + latest.aussenwandRef!.abstandE).toBeCloseTo(100, 0);
    expect(latest.side).toBe('north');
  });

  test('changing Abstand S in the panel moves the Tor along the wall', async ({ page }) => {
    // Pre-seed one anchored Tor at S=50
    await patchLayoutState(page, (state) => {
      const objs = state.objects as unknown[] || [];
      const id = (state.objectIdCounter as number) || 1;
      objs.push({
        id, type: 'tor', name: 'T-Test', x: 48.25, y: 0, width: 3.5, height: 1.5, side: 'north',
        aussenwandRef: { wallIndex: 0, abstandS: 50, abstandE: 50 },
      });
      (state as Record<string, unknown>).objectIdCounter = id + 1;
      (state as Record<string, unknown>).selectedObject = objs[objs.length - 1];
    });

    // The right Eigenschaften panel should show Wand-Verankerung card with Abstand S input
    await expect(page.getByText('Wand-Verankerung (Lastenheft 3.1.2)')).toBeVisible();

    // Change Abstand S to 30
    const sInput = page.getByLabel('Abstand S (m)');
    await sInput.fill('30');
    await sInput.press('Tab');

    // Tor x should now be ~28.25 (30 - width/2)
    await expect.poll(async () => {
      const s = await readLayoutState(page);
      const tor = (s.objects as Array<{ name: string; x: number }>).find((o) => o.name === 'T-Test');
      return tor?.x;
    }, { timeout: 3_000 }).toBeCloseTo(28.25, 0);
  });
});
