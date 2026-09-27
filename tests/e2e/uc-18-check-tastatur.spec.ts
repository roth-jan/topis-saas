/**
 * UC-18 — Kunden-Check ist mit der Tastatur bedienbar (Testdrehbuch-Fall E2).
 *
 * „Die 3 Karten + Upload-Zone per Tab erreichbar, Enter/Leertaste löst aus,
 *  Fokusring sichtbar."
 *
 * Die drei Einstiegskarten sind <Card>-Elemente mit role="button" und tabIndex={0} —
 * also keine echten <button>, weshalb Tastaturbedienung und Fokusring hier ausdrücklich
 * nachgehalten werden müssen. Genau das prüfte bisher nur ein Mensch von Hand.
 */
import { expect, test } from '@playwright/test';

/** Der Kunden-Check liegt neben /projekt — relativ navigieren, damit es mit und ohne basePath geht. */
async function gotoCheck(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('../check/');
  await expect(page.getByRole('button', { name: /Demo ansehen/ })).toBeVisible({ timeout: 20_000 });
}

/** Tabbt so lange, bis das Element mit diesem aria-label den Fokus hat (oder gibt auf). */
async function tabBisFokus(page: import('@playwright/test').Page, label: RegExp, maxTabs = 25): Promise<boolean> {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    const aktiv = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
    if (label.test(aktiv)) return true;
  }
  return false;
}

test.describe('UC-18 Kunden-Check per Tastatur', () => {
  test('alle drei Einstiegskarten sind per Tab erreichbar', async ({ page }) => {
    await gotoCheck(page);
    await page.locator('body').press('Tab'); // Einstieg in die Tab-Reihenfolge

    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="button"][tabindex="0"]'))
        .map((el) => el.getAttribute('aria-label') ?? ''));

    expect(labels.some((l) => /Scandaten/.test(l))).toBe(true);
    expect(labels.some((l) => /Eckdaten/.test(l))).toBe(true);
    expect(labels.some((l) => /Demo/.test(l))).toBe(true);
  });

  test('Enter auf der Eckdaten-Karte öffnet die Eingabe', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Eckdaten/);
    expect(gefunden).toBe(true);

    await page.keyboard.press('Enter');
    // Eckdaten-Phase zeigt die vier Felder
    await expect(page.getByText(/Anzahl Tore/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Leertaste auf der Scandaten-Karte öffnet den Upload samt Ablagezone', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Scandaten/);
    expect(gefunden).toBe(true);

    await page.keyboard.press(' ');
    // Upload-Phase: die Ablagezone ist selbst wieder per Tastatur bedienbar
    await expect.poll(async () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="button"][tabindex="0"]'))
          .some((el) => /CSV|Datei|hochladen|ablegen/i.test(el.getAttribute('aria-label') ?? el.textContent ?? ''))),
    { timeout: 10_000 }).toBe(true);
  });

  test('die fokussierte Karte zeigt einen sichtbaren Fokusring', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Demo/);
    expect(gefunden).toBe(true);

    // focus-visible:ring-2 muss am fokussierten Element greifen — sonst sieht ein
    // Tastaturnutzer nicht, wo er steht.
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return { klasse: '', schatten: '' };
      return {
        klasse: el.className ?? '',
        schatten: window.getComputedStyle(el).boxShadow,
      };
    });
    expect(ring.klasse).toContain('focus-visible:ring-2');
    expect(ring.schatten).not.toBe('none');
  });

  test('Enter auf der Demo-Karte rechnet die Beispielhalle durch', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Demo/);
    expect(gefunden).toBe(true);

    await page.keyboard.press('Enter');
    await expect(page.getByText(/Min\/Colli/).first()).toBeVisible({ timeout: 25_000 });
  });
});
