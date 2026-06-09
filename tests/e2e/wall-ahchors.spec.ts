import { test, expect } from '@playwright/test';

test.describe('Stellplatz Wall Anchors (UC-11)', () => {

  test('UC-11 — Verify element snapping and distance anchoring to walls', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const canvas = page.locator('canvas.w-full.h-full');

    // --- STEP 1 ---
    // Load the Andreas Schmid hall geometry to have a realistic environment with walls for anchoring
    await test.step('1. Load Andreas Schmid hall geometry', async () => {
      await page.goto('');
      await page.getByRole('button', { name: 'Daten' }).click();
      await page.getByRole('button', { name: 'Datei' }).click();
      await page.getByRole('menuitem', { name: 'Andreas Schmid — Gersthofen (' }).click();
      await page.waitForLoadState('networkidle'); 
    });

    // Variables to store state values for assertions
    let initialAbstandS: number;
    let initialX: number;

    // --- STEP 2, 3, 4 ---
    // Switch to Layout mode, place a Tor object near the wall, and verify that the Wand-Verankerung card appears in the right panel
    await test.step('2-4. Switch to Layout, place Tor, and verify wall anchoring', async () => {
      await page.getByRole('button', { name: 'Layout' }).click();
      await page.getByRole('button', { name: 'Tor', exact: true }).click();
      
      // Place the Tor onto the canvas at calibrated coordinates
      await canvas.click({ position: { x: 358, y: 176 } });

      // Assert that the Wand-Verankerung card is visible in the right panel
      await expect(page.getByText('Wand-Verankerung (Lastenheft')).toBeVisible();

      // Read initial state from localStorage right after placement
      const localStorageData = await page.evaluate(() => {
        const data = localStorage.getItem('topis-layout');
        return data ? JSON.parse(data) : null;
      });
      
      const torObject = localStorageData.state.objects.find((obj: any) => obj.type === 'tor');
      expect(torObject).toBeDefined();
      
      initialAbstandS = Number(torObject.aussenwandRef.abstandS);
      initialX = Number(torObject.x);
    });

    // --- STEP 5 ---
    await test.step('5. Fine-tune position by decreasing Abstand S (m) by 5 clicks', async () => {
      // Locate the precise input field inside the Abstand S (m) container
      const abstandInput = page.locator('div.space-y-1', { hasText: /^Abstand S \(m\)$/ }).locator('input');
      await expect(abstandInput).toBeVisible({ timeout: 7000 });
      
      // Focus and click the input field
      await abstandInput.click();

      // Emulate user decreasing the value by pressing ArrowDown 5 times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
      }
      await page.keyboard.press('Enter');

      // Blur the input field by clicking on a neutral canvas spot
      await canvas.click({ position: { x: 10, y: 10 } }); 
      await page.waitForTimeout(500); // Allow brief moment for any bounce intervals
    });

    // --- STEP 5.5: PERSISTENCE AND STATE ASSERTION ---
    await test.step('5.5. Assert localStorage persistence and coordinate shift', async () => {
      // Read the updated state from localStorage
      const localStorageData = await page.evaluate(() => {
        const data = localStorage.getItem('topis-layout');
        return data ? JSON.parse(data) : null;
      });

      expect(localStorageData).not.toBeNull();
      const updatedTor = localStorageData.state.objects.find((obj: any) => obj.type === 'tor');
      
      expect(updatedTor).toBeDefined();
      expect(updatedTor.aussenwandRef).not.toBeNull();
      expect(updatedTor.aussenwandRef.wallIndex).toBeDefined();

      const currentAbstandS = Number(updatedTor.aussenwandRef.abstandS);
      const currentX = Number(updatedTor.x);

      console.log(`Initial Abstand S: ${initialAbstandS}, Updated Abstand S: ${currentAbstandS}`);

      // Assert that the Abstand S value has decreased, indicating the Tor moved closer to the wall
      expect.soft(currentAbstandS, 'Abstand S should decrease in localStorage').toBeLessThan(initialAbstandS);
      expect.soft(currentX, 'Tor X coordinate should decrease in localStorage').toBeLessThan(initialX);
    });


    // --- STEP 6 ---
    await test.step('6. Take visual snapshot of the final position', async () => {
      const canvasBounds = await canvas.boundingBox();
      if (!canvasBounds) {
        throw new Error('Canvas element bounding box could not be retrieved');
      }

      // Move mouse to center and scroll to reveal the positioned Tor
      await page.mouse.move(
        canvasBounds.x + canvasBounds.width / 2,
        canvasBounds.y + canvasBounds.height / 2
      );
      await page.mouse.wheel(0, -150);
      await page.waitForTimeout(300);

      // Take a cropped 200x200 screenshot of the Tor position
      await expect(page).toHaveScreenshot('tor-perfect-anchor.png', {
        clip: {
          x: canvasBounds.x + 258,
          y: canvasBounds.y + 50,
          width: 200,
          height: 200
        },
        maxDiffPixels: 0
      });
    });

    expect(consoleErrors).toEqual([]);
  });

});
 