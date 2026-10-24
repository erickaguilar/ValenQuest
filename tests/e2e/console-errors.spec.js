// Sin errores de consola ni excepciones no capturadas en las 5 páginas.
// Cubre el hueco "JS/DOM solo tenía smoke-*.mjs": aquí corre el DOM real.
import { test, expect } from '@playwright/test';
import { PAGES, EXTRA_PAGES } from './pages.js';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('vq-skip-onboarding', 'true');
  });
});

for (const { path, name } of [...PAGES, ...EXTRA_PAGES]) {
  test(`${name} (${path}) arranca sin errores`, async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('requestfailed', (req) =>
      errors.push(`requestfailed: ${req.url()} — ${req.failure()?.errorText}`)
    );

    await page.goto(path, { waitUntil: 'domcontentloaded' });
    // Deja respirar a IndexedDB + WASM + TTS diferido.
    await page.waitForTimeout(2500);

    const benign = errors.filter(
      (e) =>
        // Speech/Audio en headless sin voces ni gesto de usuario: esperado.
        !/speechSynthesis|SpeechSynthesis|AudioContext|user gesture|autoplay/i.test(e) &&
        // Favicon servido aparte en algunos entornos: no es regresión JS.
        !/favicon/i.test(e)
    );
    expect(benign, `${name}: errores reales`).toEqual([]);

    // IDs canónicos del contrato DOM (docs/index.md regla de oro #4).
    if (path === '/index.html') {
      for (const id of ['#btn-toggle-theme', '#btn-toggle-mute', '#btn-toggle-speech']) {
        expect(await page.locator(id).count(), `${id} accesible`).toBeGreaterThan(0);
      }
    }
  });
}
