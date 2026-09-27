/**
 * UC-17 — Serie ziehen (Alt) und Drehen mit R.
 *
 * Beides stand bisher nur im Abnahme-Testdrehbuch (docs/TESTDREHBUCH-ASTRA-2026-09-20.md,
 * Fälle B3 und B5) und wurde von Hand im Browser durchgeklickt. Hier automatisiert, damit
 * es bei jedem Lauf mitprüft statt einmal pro Abnahme.
 *
 * B3: „Einen Stellplatz mit gehaltener Alt-Taste nach rechts ziehen → während des Ziehens
 *      Geister-Kopien + Zähler, nach dem Loslassen N Stellplätze in einer Reihe. Keine
 *      Kopie fehlt."
 * B5: „Einen Stellplatz 12 × 3 auswählen, Taste R → b = 3, t = 12 (getauscht),
 *      rotation 90; Mittelpunkt bleibt."
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState, selectObjectByName } from './helpers/topisPage';
import { getCanvasMapping, worldToPagePx, setView } from './helpers/canvas';

interface Obj {
  id: number;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

async function objekte(page: import('@playwright/test').Page, typ?: string): Promise<Obj[]> {
  const s = await readLayoutState(page);
  const alle = s.objects as Obj[];
  return (typ ? alle.filter((o) => o.type === typ) : alle).sort((a, b) => a.x - b.x);
}

/** Einzelner Stellplatz in einer 100 × 50-Halle — Ausgangslage beider Fälle. */
async function seedStellplatz(page: import('@playwright/test').Page, breite = 12, tiefe = 3): Promise<void> {
  await patchLayoutState(page, (state, arg) => {
    const { b, t } = arg as { b: number; t: number };
    state.halls = [{ id: 1, shape: 'rect', width: 100, height: 50, name: 'H', walls: [], offsetX: 0, offsetY: 0, color: '#fff' }];
    state.activeHallId = 1;
    state.objects = [{ id: 1, type: 'stellplatz', name: 'SP 1', x: 10, y: 20, width: b, height: t }];
    state.objectIdCounter = 2;
  }, { b: breite, t: tiefe });
}

test.describe('UC-17 Serie ziehen und Drehen', () => {
  test('B3 — Alt+Ziehen legt eine Reihe von Kopien an, ohne Lücke', async ({ page }) => {
    await gotoTopis(page);
    await seedStellplatz(page, 6, 3);
    await setView(page);

    const m = await getCanvasMapping(page);
    // Vom Mittelpunkt des Stellplatzes (13|21.5) nach rechts über mehrere Platzbreiten
    const start = worldToPagePx(m, 13, 21.5);
    const ende = worldToPagePx(m, 45, 21.5);

    await page.keyboard.down('Alt');
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move((start.x + ende.x) / 2, start.y, { steps: 6 });
    await page.mouse.move(ende.x, ende.y, { steps: 6 });
    await page.mouse.up();
    await page.keyboard.up('Alt');

    await expect.poll(async () => (await objekte(page, 'stellplatz')).length, { timeout: 5_000 })
      .toBeGreaterThan(1);

    const plaetze = await objekte(page, 'stellplatz');
    // Alle liegen auf derselben Höhe und in gleichmäßigem Achsabstand (Breite + 1 m Fuge)
    for (const p of plaetze) expect(p.y).toBeCloseTo(20, 1);
    for (let i = 1; i < plaetze.length; i++) {
      expect(plaetze[i].x - plaetze[i - 1].x).toBeCloseTo(7, 1);
    }
    // Keine Kopie fehlt: die Reihe ist lückenlos vom Original bis zum letzten Platz
    const spanne = plaetze[plaetze.length - 1].x - plaetze[0].x;
    expect(plaetze.length).toBe(Math.round(spanne / 7) + 1);
    // Und keine doppelten IDs (der Batch-Import vergibt frische Nummern)
    const ids = plaetze.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('B3 — ohne Alt wird verschoben statt kopiert', async ({ page }) => {
    await gotoTopis(page);
    await seedStellplatz(page, 6, 3);
    await setView(page);

    const m = await getCanvasMapping(page);
    const start = worldToPagePx(m, 13, 21.5);
    const ende = worldToPagePx(m, 45, 21.5);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(ende.x, ende.y, { steps: 8 });
    await page.mouse.up();

    await expect.poll(async () => (await objekte(page, 'stellplatz'))[0].x, { timeout: 5_000 })
      .toBeGreaterThan(20);
    expect(await objekte(page, 'stellplatz')).toHaveLength(1);
  });

  test('B5 — R tauscht Breite und Tiefe, der Mittelpunkt bleibt stehen', async ({ page }) => {
    await gotoTopis(page);
    await seedStellplatz(page, 12, 3);
    await selectObjectByName(page, 'SP 1');

    const vorher = (await objekte(page, 'stellplatz'))[0];
    const mitteX = vorher.x + vorher.width / 2;
    const mitteY = vorher.y + vorher.height / 2;

    await page.keyboard.press('r');

    await expect.poll(async () => (await objekte(page, 'stellplatz'))[0].width, { timeout: 5_000 }).toBe(3);

    const nachher = (await objekte(page, 'stellplatz'))[0];
    expect(nachher.height).toBe(12);
    expect(nachher.rotation).toBe(90);
    expect(nachher.x + nachher.width / 2).toBeCloseTo(mitteX, 1);
    expect(nachher.y + nachher.height / 2).toBeCloseTo(mitteY, 1);
  });

  test('B5 — viermal R führt zurück zum Ausgangszustand', async ({ page }) => {
    await gotoTopis(page);
    await seedStellplatz(page, 12, 3);
    await selectObjectByName(page, 'SP 1');

    // Nach jedem Tastendruck auf den Zustand warten statt auf die Uhr — sonst
    // geht ein 'r' verloren, bevor React die vorige Drehung verarbeitet hat.
    for (let i = 1; i <= 4; i++) {
      await page.keyboard.press('r');
      await expect.poll(async () => (await objekte(page, 'stellplatz'))[0].rotation ?? 0,
        { timeout: 5_000 }).toBe((i * 90) % 360);
    }

    const o = (await objekte(page, 'stellplatz'))[0];
    expect(o.width).toBe(12);
    expect(o.height).toBe(3);
    expect(o.rotation).toBe(0);
  });
});
