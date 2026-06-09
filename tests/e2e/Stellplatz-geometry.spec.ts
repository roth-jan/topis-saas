import { test, expect } from '@playwright/test';

test.describe('Stellplatz Geometry and Shapes', () => {

  test('UC-10 — Verify Stellplatz shapes and canvas rendering', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 0. Initialization
    await page.goto('');
    
    // Canvas coordinate mapping calculation based on instructions:
    // Scale: 10 px/m. Hall top-left corner: (28, 0).
    // Target World (40, 25) -> Canvas X: 28 + (40 * 10) = 428, Canvas Y: 0 + (25 * 10) = 250
    const canvasX = 428;
    const canvasY = 250;

    const canvas = page.locator('canvas.w-full.h-full');

    // --- STEP 1 ---
    await test.step('1. Click Stellplatz tool button', async () => {
      await page.getByRole('button', { name: 'Stellplatz' }).click();
    });

    // --- STEP 2 ---
    await test.step('2. Click on canvas at world coordinates (40, 25)', async () => {
      // Locate the canvas element. Adjust the selector if your canvas has an ID or specific class.
      await canvas.click({ position: { x: canvasX, y: canvasY } });
      
      // Click at the exact pixel position inside the canvas
      await canvas.click({ position: { x: canvasX, y: canvasY } });
    });

    // --- STEP 3 ---
    await test.step('3. Select the placed Stellplatz', async () => {
      // Click the same coordinate again to select the placed object
      await canvas.click({ position: { x: canvasX, y: canvasY } });
    });

        // --- STEP 4 ---
    await test.step('4. Change Form to Kreis', async () => {
      // Select the shape type from the dropdown. Adjust the locator if needed to target the correct dropdown.
      await page.getByRole('combobox').nth(3).selectOption('circle');
    });

    // --- STEP 5 ---
    await test.step('5. Take screenshot and assert Kreis geometry', async () => {
      // Take a screenshot of the canvas and compare it to the expected image. Adjust the path if needed.
      await expect(canvas).toHaveScreenshot('stellplatz-kreis.png', {
        maxDiffPixels: 0, // Strict pixel matching at the box's corner
      });
    });

    // --- STEP 6 ---
    await test.step('6. Repeat with Trapez and Polygon', async () => {
      // Test Trapez from the dropdown
      await page.getByRole('combobox').nth(3).selectOption('trapez');
      await expect(canvas).toHaveScreenshot('stellplatz-trapez.png');

      // Test Polygon from the dropdown
      await page.getByRole('combobox').nth(3).selectOption('polygon');
      await expect(canvas).toHaveScreenshot('stellplatz-polygon.png');
    });


    // Final console log verification
    expect(consoleErrors).toEqual([]);
  });

});
