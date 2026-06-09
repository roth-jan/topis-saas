/**
 * UC-14 — Generic Verankerung + Bezeichnungs-Stil properties persist.
 *
 * Lastenheft 3.1.1.2: every element has a Verankerung (starr/verschiebbar),
 * optional Einschränkungen text, and a Bezeichnungs-Stil (font size + bold +
 * italic). All four fields must survive a page reload.
 */
import { expect, test } from '@playwright/test';
import { gotoTopis, patchLayoutState, readLayoutState, inputByLabel, selectObjectByName } from './helpers/topisPage';

test.describe('UC-14 Generic properties persistence', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTopis(page);
    await patchLayoutState(page, (state) => {
      const objs = state.objects as unknown[] || [];
      const id = (state.objectIdCounter as number) || 1;
      const obj = { id, type: 'stellplatz', name: 'SP-Generic', x: 20, y: 20, width: 8, height: 6 };
      objs.push(obj);
      (state as Record<string, unknown>).objects = objs;
      (state as Record<string, unknown>).objectIdCounter = id + 1;
      (state as Record<string, unknown>).selectedObject = obj;
    });
  });

  test('Verankerung, Einschränkungen, Schriftgröße, Fett survive reload', async ({ page }) => {
    // selectedObject wird nicht persistiert → Objekt in der Liste selektieren.
    await selectObjectByName(page, 'SP-Generic');

    // Set Verankerung to "starr"
    await inputByLabel(page, 'Verankerung').selectOption('starr');

    // Einschränkungen text
    const einschr = page.getByPlaceholder('z.B. nur in Verladezone 1, nicht über Säule');
    await einschr.fill('Test note 42');

    // Schriftgröße
    const fontSize = inputByLabel(page, 'Bezeichnung-Schriftgröße');
    await fontSize.fill('18');
    await fontSize.press('Tab');

    // Fett checkbox
    await page.getByText('Fett').click();

    // Reload
    await page.reload();

    // Re-read state
    const s = await readLayoutState(page);
    const sp = (s.objects as Array<{ name: string; verankert?: string; einschraenkungen?: string; bezeichnungStil?: { fontSize?: number; bold?: boolean } }>)
      .find((o) => o.name === 'SP-Generic');
    expect(sp?.verankert).toBe('starr');
    expect(sp?.einschraenkungen).toBe('Test note 42');
    expect(sp?.bezeichnungStil?.fontSize).toBe(18);
    expect(sp?.bezeichnungStil?.bold).toBe(true);
  });
});
