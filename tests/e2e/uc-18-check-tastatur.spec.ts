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
  test('alle drei Einstiegskarten bekommen per Tab wirklich den Fokus', async ({ page }) => {
    // Es genügt NICHT, role/tabindex im DOM zu zählen: Eine Karte in einem inert-
    // Container trägt dieselben Attribute und ist trotzdem nicht erreichbar
    // (Cross-Review Astra 27.09.2026). Also jede Karte einzeln antabben.
    for (const karte of [/Scandaten/, /Eckdaten/, /Demo/]) {
      await gotoCheck(page);
      const erreicht = await tabBisFokus(page, karte);
      expect(erreicht, `Karte ${karte} per Tab erreichbar`).toBe(true);
    }
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

    // Erst auf die Upload-Ansicht warten, dann tabben. Ohne dieses Warten startet
    // der Test unter paralleler Last, bevor die Ablagezone im Baum ist, und tabbt
    // an ihr vorbei — der Testfall flackerte dadurch nur im Gesamtlauf.
    await expect(page.locator('[role="button"][tabindex="0"]').filter({ hasText: /CSV|Datei|ablegen|hochladen/i }).first())
      .toBeVisible({ timeout: 15_000 });

    // Die Ablagezone muss per Tastatur nicht nur ERREICHBAR sein, sondern auch
    // AUSLÖSEN. Das Dasein eines Elements mit role/tabindex beweist nichts —
    // ein fehlender Tastaturhandler fiele nicht auf (Cross-Review Astra 27.09.2026).
    // Beleg ist der Dateiauswahl-Dialog des Browsers.
    // Nach dem Phasenwechsel liegt der Fokus auf <body> und die Upload-Ansicht hat
    // nur acht fokussierbare Elemente (nachgemessen gegen die Live-Seite) — ein
    // Durchlauf von 15 Tabs reicht also sicher. NICHT vorher irgendwohin klicken:
    // ein Klick setzt den Fokus je nach getroffenem Element unterschiedlich.
    const zoneErreicht = await tabBisFokus(page, /CSV|Datei|hochladen|Scandaten/, 15);
    expect(zoneErreicht).toBe(true);

    // Geprüft wird die WIRKUNGSKETTE Tastendruck → Handler → Dateiauswahl, nicht der
    // Dialog des Browsers selbst: Chromium öffnet den Dateidialog nur, wenn es den
    // Tastendruck als echte Nutzergeste wertet, und das ist unter Automatisierung
    // nicht verlässlich — der Test flackerte genau daran. Stattdessen horchen wir am
    // versteckten Datei-Feld und unterdrücken den Dialog.
    await page.evaluate(() => {
      const feld = document.querySelector('input[type="file"]');
      (window as unknown as { __dateiAuswahlGeoeffnet?: boolean }).__dateiAuswahlGeoeffnet = false;
      feld?.addEventListener('click', (e) => {
        (window as unknown as { __dateiAuswahlGeoeffnet?: boolean }).__dateiAuswahlGeoeffnet = true;
        e.preventDefault();
      }, { once: true });
    });

    await page.keyboard.press('Enter');

    await expect.poll(
      async () => page.evaluate(() => (window as unknown as { __dateiAuswahlGeoeffnet?: boolean }).__dateiAuswahlGeoeffnet),
      { timeout: 5_000 },
    ).toBe(true);
  });

  test('die fokussierte Karte zeigt einen sichtbaren Fokusring', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Demo/);
    expect(gefunden).toBe(true);

    // Gemessen wird, was der Mensch SIEHT — nicht, was im CSS steht.
    // Ein Klassenname beweist nicht, dass die Regel wirkt, und „irgendein Schatten"
    // bestünde die Prüfung auch bei einer Karte mit dauerhaftem Zierschatten
    // (Cross-Review Astra 27.09.2026). Umgekehrt zeichnet die Karte ihren Ring gar
    // nicht über box-shadow, eine CSS-Prüfung ginge also auch fälschlich schief.
    // Deshalb: Bild der Karte ohne Fokus gegen Bild mit Fokus.
    const karte = page.locator('[aria-label*="Demo ansehen"]');
    const box = await karte.boundingBox();
    expect(box).not.toBeNull();
    const ausschnitt = { x: box!.x - 8, y: box!.y - 8, width: box!.width + 16, height: box!.height + 16 };

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.waitForTimeout(150);
    const ohneFokus = await page.screenshot({ clip: ausschnitt });

    const wieder = await tabBisFokus(page, /Demo/);
    expect(wieder).toBe(true);
    await page.waitForTimeout(150);
    const mitFokus = await page.screenshot({ clip: ausschnitt });

    expect(Buffer.compare(ohneFokus, mitFokus)).not.toBe(0);
  });

  test('Enter auf der Demo-Karte rechnet die Beispielhalle durch', async ({ page }) => {
    await gotoCheck(page);
    const gefunden = await tabBisFokus(page, /Demo/);
    expect(gefunden).toBe(true);

    await page.keyboard.press('Enter');
    await expect(page.getByText(/Min\/Colli/).first()).toBeVisible({ timeout: 25_000 });
  });
});
