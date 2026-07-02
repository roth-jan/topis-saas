/**
 * UC-9 — Die fünf Lastenheft-Dialoge öffnen sich (ohne Console-Fehler).
 *
 * Requirement (ursprünglich): eine "Lastenheft"-Dropdown mit fünf Einträgen.
 * IA-Pass Commit b30f5cb2 hat dieses Sammel-Dropdown aufgelöst:
 *   - Verlader-Modul + Unterflurförderkette  → "Module"-Dropdown (Layout-Phase)
 *   - Mengen-Modell / Relations-Plan / Bereichseinteilung → eigene Buttons in
 *     der Auswertungs-Phase (nur bedienbar, wenn Objekte im Layout sind).
 * Der fachliche Test bleibt: jeder Dialog muss sich fehlerfrei öffnen lassen.
 */
import { expect, test } from '@playwright/test';
import {
  gotoTopis,
  closeAnyDialog,
  patchLayoutState,
  openModulDialog,
  openAuswertungDialog,
} from './helpers/topisPage';
import { MODULE_MENU, AUSWERTUNG_BUTTONS } from './helpers/selectors';

// Ein Objekt seeden, damit die Auswertungs-Buttons bedienbar sind (Container ist
// bei leerem Layout pointer-events-none).
async function seedOneObject(page: import('@playwright/test').Page) {
  await patchLayoutState(page, (state) => {
    const objs = (state.objects as unknown[]) || [];
    const id = (state.objectIdCounter as number) || 1;
    objs.push({ id, type: 'tor', name: 'T-UC9', x: 10, y: 0, width: 3.5, height: 1.5, side: 'north' });
    (state as Record<string, unknown>).objects = objs;
    (state as Record<string, unknown>).objectIdCounter = id + 1;
  });
}

test.describe('UC-9 Lastenheft-Dialoge', () => {
  test('Module-Dropdown enthält Verlader-Modul + Unterflurförderkette', async ({ page }) => {
    await gotoTopis(page);
    await page.getByRole('button', { name: 'Module' }).click();
    await expect(page.getByRole('menuitem', { name: new RegExp(MODULE_MENU.verlader) })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: new RegExp(MODULE_MENU.kette) })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Auswertungs-Phase enthält Mengen-Modell, Relations-Plan, Bereichseinteilung', async ({ page }) => {
    await gotoTopis(page);
    await seedOneObject(page);
    await page.getByRole('button', { name: 'Auswertung' }).click();
    for (const name of Object.values(AUSWERTUNG_BUTTONS)) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  // Module (Layout-Phase) — kein Seed nötig.
  for (const d of [
    { open: MODULE_MENU.verlader, title: /Verlader/ },
    { open: MODULE_MENU.kette,    title: /Unterflurförderkette/ },
  ]) {
    test(`Modul "${d.open}" öffnet ohne Console-Fehler`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      await gotoTopis(page);
      await openModulDialog(page, d.open);
      await expect(page.getByRole('dialog').first()).toContainText(d.title);
      await closeAnyDialog(page);
      expect(consoleErrors, `console errors after opening ${d.open}`).toEqual([]);
    });
  }

  // Analyse-Dialoge (Auswertungs-Phase) — Seed nötig.
  for (const d of [
    { button: AUSWERTUNG_BUTTONS.hallenRelationsPlan, title: /Hallen-Relations-Plan/ },
    { button: AUSWERTUNG_BUTTONS.bereichsEinteilung,  title: /Bereichseinteilung/ },
    { button: AUSWERTUNG_BUTTONS.mengenModell,        title: /Prozess- und Mengenkategorien|Mengen/ },
  ]) {
    test(`Analyse-Dialog "${d.button}" öffnet ohne Console-Fehler`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      await gotoTopis(page);
      await seedOneObject(page);
      await openAuswertungDialog(page, d.button);
      await expect(page.getByRole('dialog').first()).toContainText(d.title);
      await closeAnyDialog(page);
      expect(consoleErrors, `console errors after opening ${d.button}`).toEqual([]);
    });
  }
});
