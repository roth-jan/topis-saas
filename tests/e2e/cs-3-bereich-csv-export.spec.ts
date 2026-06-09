/**
 * CS-3 — Bereichseinteilung CSV export row counts match in-app dialog.
 *
 * Lastenheft 3.2.5: Tore + Stellplätze zu Bereichen gruppieren. CSV-Export
 * must contain exactly the IDs assigned in the dialog.
 *
 * Acceptance:
 *  - Create Bereich "BlockA", assign 2 gates + 1 Stellplatz.
 *  - CSV export downloads. First non-header row has Tor-Anzahl=2,
 *    Stellplatz-Anzahl=1.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState } from './helpers/topisPage';

test('CS-3 BlockA with 2 gates + 1 Stellplatz → CSV row matches', async ({ page }) => {
  await gotoTopis(page);

  // Seed: 2 Tore + 1 Stellplatz so the dropdown can pick them
  await patchLayoutState(page, (state) => {
    const objs = state.objects as unknown[] || [];
    const id = (state.objectIdCounter as number) || 1;
    objs.push({ id: id,     type: 'tor',        name: 'T-CSV-1', x: 10, y: 0, width: 3.5, height: 1.5, side: 'north' });
    objs.push({ id: id + 1, type: 'tor',        name: 'T-CSV-2', x: 20, y: 0, width: 3.5, height: 1.5, side: 'north' });
    objs.push({ id: id + 2, type: 'stellplatz', name: 'SP-CSV-1', x: 30, y: 20, width: 8, height: 6 });
    (state as Record<string, unknown>).objects = objs;
    (state as Record<string, unknown>).objectIdCounter = id + 3;
  });

  // Open Bereichseinteilung
  await page.getByRole('button', { name: 'Lastenheft' }).click();
  await page.getByRole('menuitem', { name: /Bereichseinteilung/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Create new Bereich "BlockA"
  await page.getByPlaceholder(/z\.B\. Block Nord, EZ 1/).fill('BlockA');
  await page.getByRole('button', { name: 'Anlegen' }).click();

  // Check the two T-CSV checkboxes and the SP-CSV-1 checkbox
  await page.getByLabel('T-CSV-1').check();
  await page.getByLabel('T-CSV-2').check();
  await page.getByLabel('SP-CSV-1').check();

  // Trigger CSV export and capture the download
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV-Export' }).click();
  const download = await downloadPromise;

  // Read CSV
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const text = await fs.readFile(path!, 'utf8');
  const lines = text.trim().split('\n');
  expect(lines[0]).toContain('Tor-Anzahl');
  expect(lines.length).toBeGreaterThanOrEqual(2);
  // Row format: "BlockA";2;1;"<gateIds>";"<stellplatzIds>"
  const row = lines[1];
  expect(row).toMatch(/"BlockA";2;1/);
});
