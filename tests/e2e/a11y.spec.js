// Accesibilidad con axe-core:
// - Bloqueante: 0 violaciones serious/critical en WCAG 2.0/2.1/2.2 A+AA.
// - Informativo: pasada AAA completa (no bloquea; el legacy pastel puede
//   tener contrastes "large-scale" aceptados por diseño).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './pages.js';

for (const { path, name } of PAGES) {
  test(`${name}: axe A+AA sin serious/critical`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact)
    );
    expect(blocking, `${name}: ${JSON.stringify(blocking.map((v) => v.id), null, 1)}`).toEqual([]);

    // AAA informativo: se reporta, no se falla.
    const aaa = await new AxeBuilder({ page }).withTags(['wcag2aaa']).analyze();
    if (aaa.violations.length > 0) {
      console.log(
        `[${name}] AAA pendientes (${aaa.violations.length}):`,
        aaa.violations.map((v) => `${v.id}(${v.impact})`).join(', ')
      );
    }

    // lang="es" canónico para TTS infantil en español.
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang.startsWith('es'), `${name}: <html lang> español`).toBe(true);
  });
}
