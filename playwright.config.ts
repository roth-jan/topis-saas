import { defineConfig, devices } from '@playwright/test';

// Port konfigurierbar via TOPIS_PORT (Default 3000). Nötig, wenn Port 3000 von
// einem fremden Dev-Server belegt ist — dann z.B. TOPIS_PORT=3100 setzen und
// vorab `next dev --port 3100` starten (reuseExistingServer greift).
const PORT = process.env.TOPIS_PORT || '3000';
// BASE_URL=https://topis.ntc.software/projekt/ (Prod, basePath '') oder
// BASE_URL=https://roth-jan.github.io/topis-saas/projekt/ (Test) → Live-Lauf ohne Dev-Server.
// Vorher stand das nur in der Doku, die Config ignorierte es (bemerkt 20.09.2026).
const LIVE_URL = process.env.BASE_URL;
const APP_URL = LIVE_URL || `http://localhost:${PORT}/topis-saas/projekt/`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    // App läuft unter basePath /topis-saas, Editor unter /projekt/.
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: LIVE_URL ? undefined : {
    command: `npm run dev -- --port ${PORT}`,
    // Readiness gegen den echten App-Pfad prüfen (Root 404t wegen basePath).
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
