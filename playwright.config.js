// ValenQuest E2E (Playwright + axe-core).
// Sirve www/ igual que `npm run serve` y valida consola, táctil, a11y y PWA.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8090',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 8090 --directory www',
    port: 8090,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
