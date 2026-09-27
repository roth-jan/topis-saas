/**
 * UC-16 — Mehrfachauswahl von Toren.
 *
 * Tester-Feedback Michael Laufenburg (27.09.2026), Halle 6:
 *   „Die Reihentor-Funktion ist gut, aber man kann nur jedes einzelne Tor bearbeiten.
 *    Es wäre gut wenn man bspw. 20 Tore einfügen könnte und über eine ,alle markieren'
 *    Funktion (Maus) diese dann in den Eigenschaften auf eine gleiche Größe bringen und
 *    auch verschieben könnte. — die Abstände zwischen den Toren lassen sich nur mühsam
 *    auf Bauplanmaß bringen."
 *
 * Der Test geht genau diesen Weg: 20 Tore an der Nordwand, mit der Maus einen Rahmen
 * darüber aufziehen, dann gemeinsame Breite, Versatz und Achsmaß setzen.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState, loadHallWithWalls } from './helpers/topisPage';
import { getCanvasMapping, worldToPagePx } from './helpers/canvas';

interface Tor {
  id: number;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side?: string;
  aussenwandRef?: { wallIndex: number; abstandS: number; abstandE: number };
}

/** 20 Tore an der Nordwand, unregelmäßig gesetzt — der Zustand nach dem Einfügen. */
async function seedTorreihe(page: import('@playwright/test').Page, anzahl = 20): Promise<void> {
  await patchLayoutState(page, (state, arg) => {
    const n = arg as number;
    const objs = state.objects as unknown[];
    let id = (state.objectIdCounter as number) || 1;
    for (let i = 0; i < n; i++) {
      const x = 2 + i * 4.5;
      objs.push({
        id,
        type: 'tor',
        name: `Tor ${i + 1}`,
        x,
        y: 0,
        width: 3.5,
        height: 1.5,
        side: 'north',
        aussenwandRef: { wallIndex: 0, abstandS: x + 1.75, abstandE: 100 - (x + 1.75) },
      });
      id++;
    }
    state.objectIdCounter = id;
  }, anzahl);
}

async function tore(page: import('@playwright/test').Page): Promise<Tor[]> {
  const s = await readLayoutState(page);
  return (s.objects as Tor[]).filter((o) => o.type === 'tor').sort((a, b) => a.x - b.x);
}

/** Auswahlrahmen mit der Maus über die Torreihe ziehen. */
async function ziehRahmen(
  page: import('@playwright/test').Page,
  von: { x: number; y: number },
  bis: { x: number; y: number },
): Promise<void> {
  const m = await getCanvasMapping(page);
  const a = worldToPagePx(m, von.x, von.y);
  const b = worldToPagePx(m, bis.x, bis.y);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 5 });
  await page.mouse.move(b.x, b.y, { steps: 5 });
  await page.mouse.up();
}

test.describe('UC-16 Mehrfachauswahl', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
    await loadHallWithWalls(page);
  });

  test('Auswahlrahmen über die Torreihe markiert mehrere Tore', async ({ page }) => {
    await seedTorreihe(page, 20);
    // Rahmen über die ersten Tore: x 0…25 m, y -2…6 m
    await ziehRahmen(page, { x: 0, y: 2 }, { x: 25, y: 6 });

    await expect.poll(async () =>
      page.evaluate(() => (window as unknown as { __topisStore: { getState: () => { selectedIds: number[] } } })
        .__topisStore.getState().selectedIds.length),
    { timeout: 5_000 }).toBeGreaterThan(1);

    // Das Sammel-Panel löst das Einzel-Panel ab
    await expect(page.getByText(/Objekte$/).first()).toBeVisible();
    await expect(page.getByText('Gleiche Größe')).toBeVisible();
  });

  test('„alle markieren" in der Objektliste greift die ganze Tor-Gruppe', async ({ page }) => {
    await seedTorreihe(page, 20);
    await page.getByRole('button', { name: 'alle markieren' }).first().click();

    const anzahl = await page.evaluate(() =>
      (window as unknown as { __topisStore: { getState: () => { selectedIds: number[] } } })
        .__topisStore.getState().selectedIds.length);
    expect(anzahl).toBe(20);
  });

  test('gemeinsame Breite gilt für alle 20 Tore und ist EIN Undo-Schritt', async ({ page }) => {
    await seedTorreihe(page, 20);
    await page.getByRole('button', { name: 'alle markieren' }).first().click();

    await page.getByPlaceholder('3.5').fill('4.2');
    await page.getByRole('button', { name: 'Auf alle anwenden' }).click();

    await expect.poll(async () => (await tore(page)).every((t) => t.width === 4.2), { timeout: 5_000 }).toBe(true);

    // Ein einziges Rückgängig stellt alle 20 wieder her
    await page.keyboard.press('Control+z');
    await expect.poll(async () => (await tore(page)).every((t) => t.width === 3.5), { timeout: 5_000 }).toBe(true);
  });

  test('Achsmaß setzt gleiche Abstände — Tore bleiben an der Wand', async ({ page }) => {
    await seedTorreihe(page, 20);
    await page.getByRole('button', { name: 'alle markieren' }).first().click();

    await page.getByRole('combobox').last().click();
    await page.getByRole('option', { name: /Achsmaß/ }).click();
    await page.locator('input[type="number"]').last().fill('5');
    await page.getByRole('button', { name: 'Verteilen' }).click();

    await expect.poll(async () => {
      const t = await tore(page);
      return t.length > 1 && Math.abs((t[1].x - t[0].x) - 5) < 0.01;
    }, { timeout: 5_000 }).toBe(true);

    const t = await tore(page);
    for (let i = 1; i < t.length; i++) {
      expect(t[i].x - t[i - 1].x).toBeCloseTo(5, 1);
    }
    // Lastenheft 3.1.2: Verankerung darf durch das Verteilen nicht verlorengehen
    for (const tor of t) {
      expect(tor.aussenwandRef?.wallIndex).toBe(0);
      expect(tor.y).toBeCloseTo(0, 1);
      expect(tor.aussenwandRef!.abstandS + tor.aussenwandRef!.abstandE).toBeCloseTo(100, 1);
    }
  });

  test('gemeinsames Verschieben versetzt die ganze Reihe', async ({ page }) => {
    await seedTorreihe(page, 10);
    await page.getByRole('button', { name: 'alle markieren' }).first().click();

    const vorher = await tore(page);
    await page.locator('input[type="number"]').nth(2).fill('10'); // ↔ im Verschieben-Feld
    await page.getByRole('button', { name: 'Auswahl versetzen' }).click();

    await expect.poll(async () => {
      const t = await tore(page);
      return Math.abs(t[0].x - (vorher[0].x + 10)) < 0.05;
    }, { timeout: 5_000 }).toBe(true);

    const nachher = await tore(page);
    // Abstände innerhalb der Reihe bleiben erhalten
    for (let i = 1; i < nachher.length; i++) {
      expect(nachher[i].x - nachher[i - 1].x).toBeCloseTo(vorher[i].x - vorher[i - 1].x, 1);
    }
  });

  test('Strg+A markiert alles, Escape hebt auf', async ({ page }) => {
    await seedTorreihe(page, 20);
    await page.locator('canvas').first().click({ position: { x: 400, y: 300 } });
    await page.keyboard.press('Control+a');

    const nachA = await page.evaluate(() =>
      (window as unknown as { __topisStore: { getState: () => { selectedIds: number[] } } })
        .__topisStore.getState().selectedIds.length);
    expect(nachA).toBe(20);

    await page.keyboard.press('Escape');
    const nachEsc = await page.evaluate(() =>
      (window as unknown as { __topisStore: { getState: () => { selectedIds: number[] } } })
        .__topisStore.getState().selectedIds.length);
    expect(nachEsc).toBe(0);
  });
});
