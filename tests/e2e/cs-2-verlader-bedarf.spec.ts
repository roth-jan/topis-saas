/**
 * CS-2 — Verlader Bedarfs-Rechner produces correct minimum Verlader count.
 *
 * Math: minVerlader = ceil(colliProTag / (kapazitaetProH * arbeitsstunden))
 *
 *   500 / (50 * 8) = 1.25 → ceil = 2
 *  1000 / (50 * 8) = 2.5  → ceil = 3
 *  4000 / (50 * 8) = 10   → ceil = 10
 *   100 / (50 * 8) = 0.25 → ceil = 1
 */
import { expect, test } from '@playwright/test';
import { gotoTopis } from './helpers/topisPage';

const CASES = [
  { colliProTag: 500,  kapProH: 50, hours: 8, expected: 2 },
  { colliProTag: 1000, kapProH: 50, hours: 8, expected: 3 },
  { colliProTag: 4000, kapProH: 50, hours: 8, expected: 10 },
  { colliProTag: 100,  kapProH: 50, hours: 8, expected: 1 },
];

test.describe('CS-2 Verlader Bedarfs-Rechner', () => {
  for (const c of CASES) {
    test(`${c.colliProTag} Colli/Tag, ${c.kapProH} Colli/h, ${c.hours}h → ${c.expected} Verlader`, async ({ page }) => {
      await gotoTopis(page);
      await page.getByRole('button', { name: 'Lastenheft' }).click();
      await page.getByRole('menuitem', { name: /Verlader-Modul/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Bedarfs-Rechner inputs at the bottom
      const colliInput = page.getByLabel(/Colli pro Tag/i);
      const hoursInput = page.getByLabel(/Arbeitsstunden/i);
      const kapInput = page.getByLabel(/Kapazität pro Verlader/i);

      await kapInput.fill(String(c.kapProH));
      await hoursInput.fill(String(c.hours));
      await colliInput.fill(String(c.colliProTag));

      // Look for the result text. Could be "Mindestens X Verlader benötigt"
      // or "Bedarf: X" — assert the number is present somewhere within the
      // Bedarfs-Rechner card.
      const bedarfCard = page.getByText(/Bedarfs-Rechner/i).locator('..');
      await expect(bedarfCard).toContainText(new RegExp(`\\b${c.expected}\\b`));
    });
  }
});
