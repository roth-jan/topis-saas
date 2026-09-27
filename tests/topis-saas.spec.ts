/**
 * Smoke-Suite (Landing + Editor-Grundgerüst).
 *
 * HISTORIE / WARUM neu geschnitten:
 * Diese Datei war die alte "Vergleichstest"-Suite (~40 Tests) aus der Zeit VOR
 * dem großen IA-/Design-Umbau (Apple-Schale + Phasen-Navigation, Commits
 * 204d5a2f…47ad8c85). Sie navigierte mit absoluten Pfaden `page.goto('/')` /
 * `/projekt` OHNE basePath `/topis-saas` → 404, und prüfte eine Menüstruktur,
 * die es nicht mehr gibt:
 *   - Top-Level-Buttons "Datei", "Szenarien", "Showcase", "Simulation",
 *     "Projekt" existieren nicht mehr (in Phasen-Navigation + "Daten"-Phase
 *     aufgegangen).
 *   - Landing-H1 heißt jetzt "Hallenplanung, intelligent optimiert."
 *     (nicht mehr "Logistik-Hallenplanung").
 *   - Sidebar-Tabs / Panel-Labels wurden umbenannt.
 * Damit war nahezu jeder Selektor veraltet — kein basePath-Problem allein,
 * sondern eine komplett andere UI. Die fachlichen Anforderungen deckt heute die
 * gepflegte Referenz-Suite unter tests/e2e/ (uc-*, cs-*) ab. Statt 40 Tests
 * gegen eine vergangene UI neu zu erfinden, bleibt hier bewusst nur schlanke
 * Smoke-Abdeckung, die die e2e/-Suite NICHT bietet: Landing lädt + führt in den
 * Editor, Editor mountet mit Canvas, Kernmenüs öffnen. Alles basePath-relativ.
 */
import { test, expect } from '@playwright/test';
import { ensureWelcomeSuppressed } from './e2e/helpers/topisPage';

// basePath-relativ: baseURL zeigt bereits auf …/topis-saas/projekt/, daher
// führt '../' zur App-Wurzel (…/topis-saas/) und '' auf den Editor.
const LANDING = '../';
const EDITOR = '';

// Der EINSTIEG in den Editor — nicht die Werbetexte.
//
// Diese zwei Tests waren am 27.09.2026 rot, und zwar seit der Neutextung der
// Landingpage: Die Überschrift heißt nicht mehr „Hallenplanung, intelligent
// optimiert", sondern „Ihre Umschlaghalle, in Minuten pro Colli gemessen.", und
// der Knopf heißt „Hallenplan zeichnen" statt „Editor starten". Die App war in
// Ordnung, der Test war veraltet — und niemand hat es gemerkt, weil die Suite
// nicht regelmäßig lief (seit 27.09. nächtlich: ~/rc/klicktests.py).
// Deshalb prüfen sie jetzt das, was wirklich halten muss: Es gibt genau EINEN
// erkennbaren Weg von der Startseite in den Editor, und er führt dorthin. Ein
// neuer Werbetext darf die Suite nicht mehr rot machen.
const EDITOR_LINK = 'a[href$="/topis-saas/projekt/"]';

test.describe('Smoke — Landing', () => {
  test('Landing Page lädt und führt sichtbar in den Editor', async ({ page }) => {
    await page.goto(LANDING);
    // Eine H1 mit Inhalt — leer wäre eine kaputt gerenderte Seite.
    await expect(page.locator('h1').first()).not.toHaveText('');
    await expect(page.locator(EDITOR_LINK).first()).toBeVisible();
  });

  test('Navigation zum Editor funktioniert (basePath-korrekt)', async ({ page }) => {
    await ensureWelcomeSuppressed(page); // Overlay im Editor unterdrücken
    await page.goto(LANDING);
    await page.locator(EDITOR_LINK).first().click();
    await expect(page).toHaveURL(/\/topis-saas\/projekt\/?$/);
    await page.waitForSelector('canvas');
  });
});

test.describe('Smoke — Editor-Grundgerüst', () => {
  test.beforeEach(async ({ page }) => {
    await ensureWelcomeSuppressed(page); // muss VOR goto laufen (addInitScript)
    await page.goto(EDITOR);
    await page.waitForSelector('canvas');
  });

  test('Editor mountet mit Canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('Kern-Toolbar sichtbar (Layout-Phase)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Bearbeiten' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ansicht' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Objekte' }).first()).toBeVisible();
  });

  test('Phasen-Navigation vorhanden', async ({ page }) => {
    for (const phase of ['Daten', 'Layout', 'Wege', 'Auswertung']) {
      await expect(page.getByRole('button', { name: phase })).toBeVisible();
    }
  });

  test('Objekte-Menü öffnet sich', async ({ page }) => {
    await page.getByRole('button', { name: 'Objekte' }).first().click();
    await expect(page.locator('text=Hauptobjekte')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Tor' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Stellplatz' })).toBeVisible();
  });

  test('Ansicht-Menü öffnet sich', async ({ page }) => {
    await page.getByRole('button', { name: 'Ansicht' }).click();
    await expect(page.locator('text=Zoom')).toBeVisible();
  });
});
