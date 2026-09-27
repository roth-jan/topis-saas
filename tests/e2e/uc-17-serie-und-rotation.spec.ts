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
  test('B3 — Alt+Ziehen legt genau die erwartete Reihe von Kopien an', async ({ page }) => {
    await gotoTopis(page);
    await seedStellplatz(page, 6, 3);
    await setView(page);

    // Sollwerte VORHER aus der Serienregel ausrechnen, nicht hinterher aus dem
    // Ergebnis herleiten — sonst bestätigt der Test sich selbst und bliebe auch
    // dann grün, wenn nur eine einzige Kopie entsteht (Cross-Review Astra 27.09.2026).
    // Regel im Canvas: Schritt = Breite + 1 m Fuge, Anzahl = floor(|dx| / Schritt) + 1,
    // gemessen vom MITTELPUNKT des Originals bis zum Cursor.
    const ORIG_X = 10, ORIG_Y = 20, BREITE = 6, SCHRITT = BREITE + 1;
    const ZIEL_X = 45;
    const dx = ZIEL_X - (ORIG_X + BREITE / 2);
    const erwarteteAnzahl = Math.floor(dx / SCHRITT) + 1;
    const erwartetePositionen = Array.from({ length: erwarteteAnzahl }, (_, i) => ORIG_X + i * SCHRITT);
    expect(erwarteteAnzahl).toBeGreaterThan(2); // der Aufbau muss überhaupt eine Reihe ergeben

    const m = await getCanvasMapping(page);
    const start = worldToPagePx(m, ORIG_X + BREITE / 2, ORIG_Y + 1.5);
    const ende = worldToPagePx(m, ZIEL_X, ORIG_Y + 1.5);
    // Bildausschnitt rechts vom Original — dort müssen die Geister-Kopien erscheinen.
    const vorschauRegion = {
      x: Math.round(start.x + 20), y: Math.round(start.y - 30),
      width: Math.round(ende.x - start.x - 20), height: 60,
    };

    const vorher = await page.screenshot({ clip: vorschauRegion });

    await page.keyboard.down('Alt');
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move((start.x + ende.x) / 2, start.y, { steps: 6 });
    await page.mouse.move(ende.x, ende.y, { steps: 6 });

    // Noch GEHALTEN: die Vorschau muss jetzt sichtbar sein. Ohne diese Prüfung
    // bliebe der Test grün, wenn die Geister-Kopien gar nicht gezeichnet würden.
    const waehrend = await page.screenshot({ clip: vorschauRegion });
    expect(Buffer.compare(vorher, waehrend)).not.toBe(0);
    // Erst nach dem Loslassen liegen die Kopien im Datenbestand
    expect(await objekte(page, 'stellplatz')).toHaveLength(1);

    await page.mouse.up();
    await page.keyboard.up('Alt');

    await expect.poll(async () => (await objekte(page, 'stellplatz')).length, { timeout: 5_000 })
      .toBe(erwarteteAnzahl);

    const plaetze = await objekte(page, 'stellplatz');
    plaetze.forEach((p, i) => {
      expect(p.x).toBeCloseTo(erwartetePositionen[i], 1);
      expect(p.y).toBeCloseTo(ORIG_Y, 1);
      expect(p.width).toBeCloseTo(BREITE, 1);
    });
    // Keine doppelten IDs (der Batch-Import vergibt frische Nummern)
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

    // Konkrete Zielposition prüfen, nicht bloß „irgendwo weiter rechts": Der Greifpunkt
    // sitzt 3 m / 1.5 m innerhalb des Objekts, dieser Versatz muss erhalten bleiben.
    // Ein Drag, der das Objekt auf eine falsche Stelle setzt, fiele sonst nicht auf
    // (Cross-Review Astra 27.09.2026).
    await expect.poll(async () => (await objekte(page, 'stellplatz'))[0].x, { timeout: 5_000 })
      .toBeCloseTo(42, 1);
    const [verschoben] = await objekte(page, 'stellplatz');
    expect(verschoben.y).toBeCloseTo(20, 1);
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

    const vorher = (await objekte(page, 'stellplatz'))[0];

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
    // Auch die POSITION muss wieder stimmen. Ohne diese Prüfung bliebe der Test
    // grün, wenn eine der vier Drehungen das Objekt nebenbei verschiebt
    // (Cross-Review Astra 27.09.2026).
    expect(o.x).toBeCloseTo(vorher.x, 2);
    expect(o.y).toBeCloseTo(vorher.y, 2);
  });
});
