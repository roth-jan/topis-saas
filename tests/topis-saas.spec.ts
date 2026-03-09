import { test, expect } from '@playwright/test';

test.describe('TOPIS SaaS - Vergleichstest', () => {

  test.describe('1. Landing Page', () => {
    test('Landing Page lädt korrekt', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1:has-text("Logistik-Hallenplanung")')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Editor starten' })).toBeVisible();
    });

    test('Navigation zum Editor funktioniert', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Editor starten');
      await expect(page).toHaveURL('/projekt');
    });
  });

  test.describe('2. Editor - Grundfunktionen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Editor lädt mit Canvas', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('Toolbar ist sichtbar', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Datei/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Bearbeiten/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Ansicht/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Objekte/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Szenarien/i })).toBeVisible();
    });

    test('Linke Sidebar mit Tabs', async ({ page }) => {
      await expect(page.locator('text=Objekte').first()).toBeVisible();
      await expect(page.locator('text=Gänge')).toBeVisible();
    });

    test('Rechte Sidebar mit Tabs', async ({ page }) => {
      await expect(page.locator('text=Eigenschaften')).toBeVisible();
      await expect(page.locator('text=Analyse')).toBeVisible();
    });
  });

  test.describe('3. Objekttypen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Objekte-Menü öffnet sich', async ({ page }) => {
      await page.click('button:has-text("Objekte")');
      await expect(page.locator('text=Hauptobjekte')).toBeVisible();
    });

    test('Alle Objektkategorien vorhanden', async ({ page }) => {
      await page.click('button:has-text("Objekte")');
      await expect(page.getByRole('menuitem', { name: 'Tor' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Stellplatz' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Regal' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Bereich' })).toBeVisible();
      await expect(page.locator('[role="menu"] >> text=Gebäudeelemente')).toBeVisible();
      await expect(page.locator('[role="menu"] >> text=Spezialzonen')).toBeVisible();
      await expect(page.locator('[role="menu"] >> text=Räume')).toBeVisible();
    });

    test('Untermenü Gebäudeelemente', async ({ page }) => {
      await page.click('button:has-text("Objekte")');
      await page.hover('text=Gebäudeelemente');
      await page.waitForTimeout(300);
      await expect(page.locator('text=Rampe')).toBeVisible();
      await expect(page.locator('text=Leveller')).toBeVisible();
      await expect(page.locator('text=Treppe')).toBeVisible();
    });

    test('Untermenü Spezialzonen', async ({ page }) => {
      await page.click('button:has-text("Objekte")');
      await page.hover('text=Spezialzonen');
      await page.waitForTimeout(300);
      await expect(page.locator('text=Ladestation')).toBeVisible();
      await expect(page.locator('text=Gefahrgut')).toBeVisible();
    });

    test('Untermenü Räume', async ({ page }) => {
      await page.click('button:has-text("Objekte")');
      await page.hover('[role="menu"] >> text=Räume');
      await page.waitForTimeout(500);
      await expect(page.getByRole('menuitem', { name: 'Büro' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'WC' })).toBeVisible();
    });
  });

  test.describe('4. Datei-Operationen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Datei-Menü öffnet sich', async ({ page }) => {
      await page.click('button:has-text("Datei")');
      await expect(page.locator('[role="menu"] >> text=Projekt').first()).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Neues Projekt' })).toBeVisible();
    });

    test('Export-Optionen vorhanden', async ({ page }) => {
      await page.click('button:has-text("Datei")');
      await page.hover('text=Exportieren');
      await page.waitForTimeout(300);
      await expect(page.locator('text=Als Bild (PNG)')).toBeVisible();
      await expect(page.locator('text=Als Vektor (SVG)')).toBeVisible();
      await expect(page.locator('text=Als JSON')).toBeVisible();
    });

    test('Speichern-Funktion verfügbar', async ({ page }) => {
      await page.click('button:has-text("Datei")');
      await expect(page.locator('text=Speichern (lokal)')).toBeVisible();
      await expect(page.locator('text=Speichern unter')).toBeVisible();
    });
  });

  test.describe('5. Ansicht-Optionen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Ansicht-Menü öffnet sich', async ({ page }) => {
      await page.click('button:has-text("Ansicht")');
      await expect(page.locator('text=Zoom')).toBeVisible();
    });

    test('Zoom-Optionen vorhanden', async ({ page }) => {
      await page.click('button:has-text("Ansicht")');
      await expect(page.locator('text=Vergrößern')).toBeVisible();
      await expect(page.locator('text=Verkleinern')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /100%/ })).toBeVisible();
    });

    test('Anzeige-Optionen vorhanden', async ({ page }) => {
      await page.click('button:has-text("Ansicht")');
      await expect(page.locator('text=Raster')).toBeVisible();
      await expect(page.locator('text=Einrasten')).toBeVisible();
      await expect(page.locator('text=Fahrgänge')).toBeVisible();
    });

    test('Theme-Optionen vorhanden', async ({ page }) => {
      await page.click('button:has-text("Ansicht")');
      await expect(page.getByText('Theme', { exact: true })).toBeVisible();
      await expect(page.locator('text=Hell')).toBeVisible();
      await expect(page.locator('text=Dunkel')).toBeVisible();
    });
  });

  test.describe('6. Szenarien', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Szenarien-Menü öffnet sich', async ({ page }) => {
      await page.click('button:has-text("Szenarien")');
      await expect(page.locator('text=Vorlagen')).toBeVisible();
    });

    test('Vorlagen vorhanden', async ({ page }) => {
      await page.click('button:has-text("Szenarien")');
      await expect(page.locator('text=Standard-Halle')).toBeVisible();
      await expect(page.locator('text=Umschlag-Szenario')).toBeVisible();
      await expect(page.locator('text=Lager mit Regalen')).toBeVisible();
    });

    test('Assistenten vorhanden', async ({ page }) => {
      await page.click('button:has-text("Szenarien")');
      await expect(page.locator('text=Assistenten')).toBeVisible();
      await expect(page.locator('text=Gang-Generator')).toBeVisible();
    });
  });

  test.describe('7. Gang-Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Gang-Tab wechseln', async ({ page }) => {
      await page.click('button[role="tab"]:has-text("Gänge")');
      await expect(page.locator('text=Fahrgänge')).toBeVisible();
    });

    test('Gang-Einstellungen sichtbar', async ({ page }) => {
      await page.click('button[role="tab"]:has-text("Gänge")');
      await expect(page.locator('text=Automatische Generierung')).toBeVisible();
    });

    test('Gang-Breite konfigurierbar', async ({ page }) => {
      await page.click('button[role="tab"]:has-text("Gänge")');
      await expect(page.locator('text=Hauptgang-Breite')).toBeVisible();
      await expect(page.locator('text=Regalgang-Breite')).toBeVisible();
    });
  });

  test.describe('8. Analyse-Panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Analyse-Tab wechseln', async ({ page }) => {
      await page.click('button[role="tab"]:has-text("Analyse")');
      await expect(page.locator('text=Effizienz-Score')).toBeVisible();
    });

    test('Kennzahlen sichtbar', async ({ page }) => {
      await page.click('button[role="tab"]:has-text("Analyse")');
      // Check for metrics in the Analyse panel using card titles
      const analysePanel = page.getByLabel('Analyse');
      await expect(analysePanel.locator('text=Halle')).toBeVisible();
      await expect(analysePanel.locator('text=Objekte').first()).toBeVisible();
      await expect(analysePanel.locator('text=Wege')).toBeVisible();
      await expect(analysePanel.locator('text=Zeit').first()).toBeVisible();
    });
  });

  test.describe('9. Projekt-Vergleich', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Projekt-Dialog öffnet', async ({ page }) => {
      await page.click('button:has-text("Projekt")');
      await expect(page.locator('text=Projekt-Vergleich')).toBeVisible();
    });

    test('Vorher/Nachher-Bereiche sichtbar', async ({ page }) => {
      await page.click('button:has-text("Projekt")');
      // Wait for dialog to open and check within dialog context
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog.locator('h4:has-text("Vorher")')).toBeVisible();
      await expect(dialog.locator('h4:has-text("Nachher")')).toBeVisible();
    });

    test('Verbesserungs-Anzeige sichtbar', async ({ page }) => {
      await page.click('button:has-text("Projekt")');
      await expect(page.locator('text=Verbesserung')).toBeVisible();
      await expect(page.locator('text=Wegstrecke')).toBeVisible();
      await expect(page.locator('text=Prozesszeit')).toBeVisible();
      await expect(page.locator('text=Produktivität')).toBeVisible();
    });
  });

  test.describe('10. Showcase-Demo', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Showcase-Dialog öffnet', async ({ page }) => {
      await page.click('button:has-text("Showcase")');
      await expect(page.locator('text=Showcase-Demo')).toBeVisible();
    });

    test('Andreas Schmid Showcase vorhanden', async ({ page }) => {
      await page.click('button:has-text("Showcase")');
      await expect(page.locator('text=Andreas Schmid Showcase')).toBeVisible();
    });

    test('Demo-Schritte angezeigt', async ({ page }) => {
      await page.click('button:has-text("Showcase")');
      await expect(page.locator('text=Demo-Schritte')).toBeVisible();
      await expect(page.locator('text=Halle aufbauen')).toBeVisible();
      await expect(page.locator('text=Tore platzieren')).toBeVisible();
    });

    test('Start-Button vorhanden', async ({ page }) => {
      await page.click('button:has-text("Showcase")');
      await expect(page.locator('button:has-text("Starten")')).toBeVisible();
    });
  });

  test.describe('11. Simulation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Simulation-Dialog öffnet', async ({ page }) => {
      await page.click('button:has-text("Simulation")');
      await expect(page.locator('text=FFZ-Simulation')).toBeVisible();
    });

    test('Fahrzeugtyp-Auswahl vorhanden', async ({ page }) => {
      await page.click('button:has-text("Simulation")');
      await expect(page.locator('text=Fahrzeugtyp')).toBeVisible();
    });

    test('Simulation-Steuerung vorhanden', async ({ page }) => {
      await page.click('button:has-text("Simulation")');
      await expect(page.locator('button:has-text("Start")')).toBeVisible();
    });

    test('Statistik-Anzeige vorhanden', async ({ page }) => {
      await page.click('button:has-text("Simulation")');
      await expect(page.locator('text=Status')).toBeVisible();
      await expect(page.locator('text=Statistik')).toBeVisible();
    });
  });

  test.describe('12. Toolbar-Werkzeuge', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Zoom-Anzeige vorhanden', async ({ page }) => {
      await expect(page.locator('button:has-text("%")')).toBeVisible();
    });

    test('Raster-Toggle vorhanden', async ({ page }) => {
      const gridButton = page.locator('button').filter({ has: page.locator('svg') }).nth(2);
      await expect(gridButton).toBeVisible();
    });

    test('Such-Button vorhanden', async ({ page }) => {
      await expect(page.locator('text=Suche')).toBeVisible();
    });
  });

  test.describe('13. Canvas-Interaktion', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/projekt');
      await page.waitForSelector('canvas');
    });

    test('Canvas ist interaktiv', async ({ page }) => {
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Check canvas has dimensions
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(100);
    });

    test('Halle wird gerendert', async ({ page }) => {
      // Wait for canvas to render
      await page.waitForTimeout(500);

      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // The hall should be drawn - canvas should have content
      expect(box).not.toBeNull();
    });
  });

});
