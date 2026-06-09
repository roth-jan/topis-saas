import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    // App läuft unter basePath /topis-saas, Editor unter /projekt/.
    baseURL: 'http://localhost:3000/topis-saas/projekt/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    // Readiness gegen den echten App-Pfad prüfen (Root 404t wegen basePath).
    url: 'http://localhost:3000/topis-saas/projekt/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
