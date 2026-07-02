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
import { gotoTopis, inputByLabel, openModulDialog } from './helpers/topisPage';

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
      // Verlader-Modul: seit IA-Pass b30f5cb2 im "Module"-Dropdown (Layout-Phase).
      await openModulDialog(page, 'Verlader-Modul');

      // Bedarfs-Rechner inputs (Labels: "Volumen (Colli/Tag)",
      // "Kapazität pro Verlader (Colli/h)", "Arbeitsstunden pro Tag")
      await inputByLabel(page, /Kapazität pro Verlader/i).fill(String(c.kapProH));
      await inputByLabel(page, /Arbeitsstunden/i).fill(String(c.hours));
      await inputByLabel(page, /Volumen \(Colli/i).fill(String(c.colliProTag));

      // Ergebnis: "Benötigte Verlader: N"
      await expect(page.getByText(/Benötigte Verlader:/i).locator('..')).toContainText(
        new RegExp(`\\b${c.expected}\\b`),
      );
    });
  }
});
