/**
 * UC-13 — Multi-Insert numbering schemes.
 *
 * Lastenheft 3.1.2: Mehrfacheinfügen erlaubt Nummerierungs-Schemata
 *   '1'  : 1, 2, 3
 *   'A1' : A1, A2, A3 (prefix becomes the letter)
 *   '1A' : 1A, 1B, 1C (prefix becomes the number)
 *   'A'  : A, B, C, ..., Z, AA, AB
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, clearStorage, readLayoutState } from './helpers/topisPage';

const CASES = [
  { schema: '1',  prefix: 'T', expected: ['T1', 'T2', 'T3', 'T4', 'T5'] },
  { schema: 'A1', prefix: 'A', expected: ['A1', 'A2', 'A3', 'A4', 'A5'] },
  { schema: '1A', prefix: '1', expected: ['1A', '1B', '1C', '1D', '1E'] },
  { schema: 'A',  prefix: '',  expected: ['A', 'B', 'C', 'D', 'E'] },
];

test.describe('UC-13 Multi-Insert numbering schemes', () => {
  for (const c of CASES) {
    test(`schema "${c.schema}" with prefix "${c.prefix}" produces ${c.expected.join(', ')}`, async ({ page }) => {
      await gotoTopis(page);
      await clearStorage(page);

      // Open Multi-Insert dialog from toolbar
      await page.getByRole('button', { name: 'Multi-Insert' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Anzahl = 5
      await page.getByRole('spinbutton').first().fill('5');

      // Prefix
      const prefixInput = page.getByPlaceholder('z.B. T, SP, R');
      await prefixInput.fill(c.prefix);

      // Schema (Select)
      await page.getByRole('combobox').last().click();
      const optionMap: Record<string, RegExp> = {
        '1':  /numerisch/,
        'A1': /Prefix-Zahl/,
        '1A': /Zahl-Buchstabe/,
        'A':  /alphabetisch/,
      };
      await page.getByRole('option', { name: optionMap[c.schema] }).click();

      // Submit
      await page.getByRole('button', { name: /Objekte einfügen/ }).click();

      // Assert names
      await expect.poll(async () => {
        const s = await readLayoutState(page);
        const tore = (s.objects as Array<{ type: string; name: string }>)
          .filter((o) => o.type === 'tor')
          .map((o) => o.name);
        return tore.slice(-5);
      }, { timeout: 3_000 }).toEqual(c.expected);
    });
  }
});
