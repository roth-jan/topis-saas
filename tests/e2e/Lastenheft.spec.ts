import { test, expect } from '@playwright/test';

test.describe('End-to-End (E2E) Scenarios', () => {

  test('UC-9 — Lastenheft dropdown opens all five dialogs', async ({ page }) => {
    // 1. Create an array to collect console errors
    const consoleErrors: string[] = [];

    // 2. Enable continuous tracking of browser console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 3. Define the expected dialogs with their corresponding menu item names and heading names
    const dialogs = [
      { menuItemName: 'Hallen-Relations-Plan (3.2.3)', headingName: 'Hallen-Relations-Plan (Lastenheft 3.2.3)' },
      { menuItemName: 'Bereichseinteilung (3.2.5)', headingName: 'Bereichseinteilung (Lastenheft 3.2.5)' },
      { menuItemName: 'Mengen-Modell (3.2.1)', headingName: 'Prozess- und Mengenkategorien (Lastenheft 3.2.1)' },
      { menuItemName: 'Verlader-Modul (Kap. 4)', headingName: 'Verlader-Verwaltung (Lastenheft Kapitel 4)' },
      { menuItemName: 'Unterflurförderkette (3.1.5)', headingName: 'Unterflurförderkette (Lastenheft 3.1.5)' },
    ];

    // Open the base URL once before starting the loop
    await page.goto('');

    // Iterate through each dialog and perform the necessary actions
    for (const dialog of dialogs) {
      await test.step(`Verify dialog: ${dialog.menuItemName}`, async () => {
        // Open the dropdown menu
        await page.getByRole('button', { name: 'Lastenheft' }).click();
        
        // Click on the specific menu item to open the dialog
        await page.getByRole('menuitem', { name: dialog.menuItemName }).click();

        // Verify that the modal dialog has opened
        await expect(page.getByRole('heading', { name: dialog.headingName })).toBeVisible();
      
        // Close the modal dialog
        // await page.getByRole('button', { name: 'Schließen' }).click();   // Close buttom
         await page.getByRole('button', { name: 'Close' }).click();
      });
    }

    // 4. Final assert: verify that the console remained clean during these actions
    expect(consoleErrors).toEqual([]);
  });

});
