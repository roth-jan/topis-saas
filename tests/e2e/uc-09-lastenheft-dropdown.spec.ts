/**
 * UC-9 — Lastenheft dropdown opens all five dialogs.
 *
 * Requirement: top toolbar in Layout phase has a "Lastenheft" dropdown with
 * five entries. Each entry must open its dialog without console errors.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, closeAnyDialog } from './helpers/topisPage';
import { LASTENHEFT_MENU, TOOLBAR } from './helpers/selectors';

const DIALOGS = [
  { menu: LASTENHEFT_MENU.hallenRelationsPlan, dialogTitle: /Hallen-Relations-Plan/ },
  { menu: LASTENHEFT_MENU.bereichsEinteilung,  dialogTitle: /Bereichseinteilung/ },
  { menu: LASTENHEFT_MENU.mengenModell,        dialogTitle: /Prozess- und Mengenkategorien|Mengen/ },
  { menu: LASTENHEFT_MENU.verlader,            dialogTitle: /Verlader/ },
  { menu: LASTENHEFT_MENU.kette,               dialogTitle: /Unterflurförderkette|Kette/ },
];

test.describe('UC-9 Lastenheft dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
  });

  test('button is visible and contains five menuitems', async ({ page }) => {
    await page.getByRole('button', { name: TOOLBAR.lastenheftDropdown }).click();
    for (const d of DIALOGS) {
      await expect(page.getByRole('menuitem', { name: new RegExp(d.menu) })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  for (const d of DIALOGS) {
    test(`opens dialog "${d.menu}" without console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await page.getByRole('button', { name: TOOLBAR.lastenheftDropdown }).click();
      await page.getByRole('menuitem', { name: new RegExp(d.menu) }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog').first()).toContainText(d.dialogTitle);
      await closeAnyDialog(page);
      expect(consoleErrors, `console errors after opening ${d.menu}`).toEqual([]);
    });
  }
});
