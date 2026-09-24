// Ergonomía táctil infantil (docs/mobile-standards-spec.md):
// WCAG 2.2 AAA — objetivo mejorado 44×44px mínimo (aspiración 48-60px).
import { test, expect } from '@playwright/test';
import { PAGES } from './pages.js';

const AAA_MIN = 44;
const ASPIRE = 48;

for (const { path, name } of PAGES) {
  test(`${name}: objetivos táctiles ≥ ${AAA_MIN}px`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const small = await page.evaluate((min) => {
      const els = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"]')];
      return els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 60),
            w: Math.round(r.width),
            h: Math.round(r.height),
          };
        })
        .filter((b) => b.w < min || b.h < min);
    }, AAA_MIN);

    // Aspiración 48px: solo informa (no falla) para no bloquear por 1-3px.
    const belowAspire = small.filter((b) => (b.w < ASPIRE || b.h < ASPIRE) && b.w >= AAA_MIN);
    if (belowAspire.length > 0) console.log(`[${name}] bajo aspiración 48px:`, JSON.stringify(belowAspire.slice(0, 10)));

    expect(small, `${name}: elementos < ${AAA_MIN}px`).toEqual([]);
  });
}
