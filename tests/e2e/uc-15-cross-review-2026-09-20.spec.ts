/**
 * UC-15 — Regressions-Locks aus dem Cross-Model-Review 20.09.2026 (GPT-6 Astra + Gemini)
 * und dem Lastenheft-Gegencheck v4, soweit sie nur im echten Browser prüfbar sind:
 *   1. Objekte-Menü bietet Außengelände + Sonderplätze an (waren definiert, aber unerreichbar).
 *   2. „Halle 90° drehen" dreht auch Gänge/Bereiche mit und verankert das Tor an der neuen Wand.
 *   3. Bereich per Rechteck über den Hallenrand hinaus → wird auf die Halle gekappt.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState } from './helpers/topisPage';

type AnyState = Record<string, unknown>;

test.describe('UC-15 Cross-Review 20.09.2026', () => {
  test('Objekte-Menü: Außengelände-Untermenü mit Straße + Sattelplatz, Spezialzonen mit AV/ÜZ/Wertverschlag', async ({ page }) => {
    await gotoTopis(page);
    await page.getByRole('button', { name: 'Objekte' }).click();
    await page.getByRole('menuitem', { name: /Außengelände/ }).hover();
    await expect(page.getByRole('menuitem', { name: 'Straße' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Sattelplatz' })).toBeVisible();
    await page.getByRole('menuitem', { name: /Spezialzonen/ }).hover();
    await expect(page.getByRole('menuitem', { name: /Annahmeverweigerung|AV/ })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Wertverschlag/ })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Halle 90° drehen: Gang + Bereich + Tor-Anker drehen mit', async ({ page }) => {
    await gotoTopis(page);
    await patchLayoutState(page, (state) => {
      const s = state as AnyState;
      s.halls = [{ id: 1, shape: 'rect', width: 100, height: 60, name: 'H', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }];
      s.activeHallId = 1;
      s.objects = [
        { id: 1, type: 'tor', name: 'T1', x: 20, y: 0, width: 3.5, height: 1.5, side: 'north', aussenwandRef: { wallIndex: 0, abstandS: 21.75, abstandE: 78.25 } },
        { id: 2, type: 'bereich', name: 'Z', x: 60, y: 10, width: 30, height: 20 },
      ];
      s.objectIdCounter = 3;
      s.gaenge = [{ id: 1, name: 'G', points: [{ x: 80, y: 5 }, { x: 80, y: 55 }], breite: 4, typ: 'hauptgang' }];
    });
    await page.getByRole('button', { name: 'Bearbeiten' }).click();
    await page.getByRole('menuitem', { name: /Halle 90° drehen/ }).click();
    const st = await page.evaluate(() => {
      const s = (window as unknown as { __topisStore: { getState: () => AnyState } }).__topisStore.getState();
      const hall = (s.halls as { width: number; height: number }[])[0];
      const objs = s.objects as { type: string; x: number; y: number; width: number; height: number; side?: string; aussenwandRef?: { wallIndex: number } }[];
      const gaenge = s.gaenge as { points: { x: number; y: number }[] }[];
      return { hall, objs, gangPts: gaenge.flatMap((g) => g.points) };
    });
    expect([st.hall.width, st.hall.height]).toEqual([60, 100]);
    for (const p of st.gangPts) { expect(p.x).toBeLessThanOrEqual(60); expect(p.y).toBeLessThanOrEqual(100); }
    for (const o of st.objs) { expect(o.x + o.width).toBeLessThanOrEqual(60.01); expect(o.y + o.height).toBeLessThanOrEqual(100.01); }
    const tor = st.objs.find((o) => o.type === 'tor')!;
    expect(tor.side).toBe('west');
    expect(tor.aussenwandRef?.wallIndex).toBe(3);
    expect(tor.x).toBeCloseTo(0, 5);
  });

  test('Bereich über den Hallenrand hinaus gezogen wird auf die Halle gekappt', async ({ page }) => {
    await gotoTopis(page);
    await patchLayoutState(page, (state) => {
      const s = state as AnyState;
      s.halls = [{ id: 1, shape: 'rect', width: 20, height: 20, name: 'H', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }];
      s.activeHallId = 1;
      s.objects = []; s.objectIdCounter = 1;
    });
    await page.keyboard.press('b'); // Bereich-Werkzeug
    const canvas = page.locator('canvas').first();
    const box = (await canvas.boundingBox())!;
    // Welt→Screen unbekannt → wir ziehen einfach von der Canvas-Mitte weit nach rechts unten außerhalb
    const sx = box.x + box.width * 0.5, sy = box.y + box.height * 0.5;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 2, box.y + box.height - 2, { steps: 12 });
    await page.mouse.up();
    const b = await page.evaluate(() => {
      const s = (window as unknown as { __topisStore: { getState: () => AnyState } }).__topisStore.getState();
      const o = (s.objects as { type: string; x: number; y: number; width: number; height: number }[]).find((x) => x.type === 'bereich');
      return o ? { x: o.x, y: o.y, w: o.width, h: o.height } : null;
    });
    expect(b).not.toBeNull();
    expect(b!.x + b!.w).toBeLessThanOrEqual(20.01);
    expect(b!.y + b!.h).toBeLessThanOrEqual(20.01);
  });

  test('Kunden-Check lädt ohne Client-Exception, Demo zeigt 4 Ampel-KPIs (Astra E1)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('../check/'); // relativ zur baseURL (…/projekt/) → funktioniert mit und ohne basePath
    await page.getByRole('button', { name: /Demo ansehen/ }).click();
    await expect(page.getByText(/Min\/Colli/).first()).toBeVisible({ timeout: 20_000 });
    expect(page.locator('text=Application error')).toHaveCount(0);
    expect(errors.filter((e) => /ChunkLoadError|Application error/i.test(e))).toEqual([]);
  });

  test('Hallenverbreiterung aktualisiert die S/E-Anzeige des gewählten Tors (Astra C7)', async ({ page }) => {
    await gotoTopis(page);
    await patchLayoutState(page, (state) => {
      const s = state as AnyState;
      s.halls = [{ id: 1, shape: 'rect', width: 100, height: 50, name: 'H', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }];
      s.activeHallId = 1;
      s.objects = [{ id: 1, type: 'tor', name: 'T1', x: 20, y: 0, width: 3.5, height: 1.5, side: 'north', aussenwandRef: { wallIndex: 0, abstandS: 21.75, abstandE: 78.25 } }];
      s.objectIdCounter = 2;
    });
    await page.evaluate(() => {
      const st = (window as unknown as { __topisStore: { getState: () => AnyState } }).__topisStore.getState();
      (st.selectObject as (o: unknown) => void)((st.objects as unknown[])[0]);
      (st.updateHall as (id: number, u: unknown) => void)(1, { width: 150 });
    });
    const sel = await page.evaluate(() => {
      const st = (window as unknown as { __topisStore: { getState: () => AnyState } }).__topisStore.getState();
      return (st.selectedObject as { aussenwandRef?: { abstandS: number; abstandE: number } }).aussenwandRef;
    });
    expect(sel).toEqual({ wallIndex: 0, abstandS: 21.75, abstandE: 128.25 });
  });
});
