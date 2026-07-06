// Playwright-Konfiguration für die E2E-/Regressionstests.
// Die Tests brauchen einen echten Browser, weil die Blöcke Web Components mit
// Shadow-DOM/<slot> sind und Bug-Klassen wie composed-Events nur dort real
// abbildbar sind (jsdom reicht dafür nicht).
//
// Browser: kein hartkodierter Pfad. Im CI/Remote liegt der Build unter
// PLAYWRIGHT_BROWSERS_PATH; lokal einmalig `npx playwright install chromium`.

import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
