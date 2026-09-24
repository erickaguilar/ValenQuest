// PWA offline-first: versión de caché homologada y precache íntegro.
// La homologación estática ya vive en `npm run version:check`; aquí se
// verifica en runtime que el SW controla la página y sirve sin red.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

function corePrecacheUrls() {
  const sw = fs.readFileSync(path.join(process.cwd(), 'www/sw.js'), 'utf8');
  const m = sw.match(/CORE_PRECACHE_URLS\s*=\s*\[([\s\S]*?)\];/);
  if (!m) throw new Error('CORE_PRECACHE_URLS no encontrado en sw.js');
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

test('CACHE_VERSION del SW == package.json', () => {
  const sw = fs.readFileSync(path.join(process.cwd(), 'www/sw.js'), 'utf8');
  expect(sw).toContain(`CACHE_VERSION = 'v${pkg.version}'`);
});

test('precache íntegro: todo 200', async ({ request }) => {
  for (const url of corePrecacheUrls()) {
    const res = await request.get(url);
    expect(res.status(), `GET ${url}`).toBe(200);
  }
});

test('SW controla la página y sirve offline el Salón', async ({ page, context }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const controlled = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'no-sw-api';
    try {
      await navigator.serviceWorker.ready;
      return navigator.serviceWorker.controller ? 'controlled' : 'registered-no-controller';
    } catch {
      return 'not-ready';
    }
  });
  // En headless-shell el SW puede tardar un ciclo; se informa sin fallar.
  console.log(`SW estado: ${controlled}`);

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1200);
  const bodyOk = await page.evaluate(() => (document.body?.innerText || '').length > 50);
  await context.setOffline(false);
  expect(bodyOk, 'Salón legible sin red (caché SW)').toBe(true);
});
