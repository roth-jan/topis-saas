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

test.describe('Smoke — Landing', () => {
  test('Landing Page lädt', async ({ page }) => {
    await page.goto(LANDING);
    await expect(page.locator('h1')).toContainText(/Hallenplanung/i);
    await expect(page.getByRole('link', { name: 'Editor starten' }).first()).toBeVisible();
  });

  test('Navigation zum Editor funktioniert (basePath-korrekt)', async ({ page }) => {
    await ensureWelcomeSuppressed(page); // Overlay im Editor unterdrücken
    await page.goto(LANDING);
    await page.getByRole('link', { name: 'Editor starten' }).first().click();
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
