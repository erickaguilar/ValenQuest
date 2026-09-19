#!/usr/bin/env node
/**
 * ValenQuest Version Homologation Script (scripts/bump-version.js)
 *
 * Fuente única de verdad (SSOT): package.json ("version").
 * - `node scripts/bump-version.js <nueva_versión>` → escribe la versión en
 *   TODOS los puntos canónicos y los deja homologados.
 * - `node scripts/bump-version.js --check` → verifica que todos los puntos
 *   coincidan con package.json. Sale con código 1 si hay deriva (ideal para CI).
 * - `npm run version:bump <ver>` / `npm run version:check` (atajos).
 *
 * Puntos canónicos cubiertos:
 *  1. package.json                        ("version")
 *  2. package-lock.json                   (root + packages[""].version, solo ValenQuest)
 *  3. Cargo.toml                          (kidslearn-wasm version)
 *  4. Cargo.lock                          (bloque kidslearn-wasm únicamente)
 *  5. VERSION                             (texto plano)
 *  6. README.md                           (badge version-X)
 *  7. src/lib.rs                          (get_engine_version)
 *  8. www/js/app.js                       (APP_VERSION)
 *  9. www/sw.js                           (CACHE_VERSION)
 * 10. www/js/components/footer.js         (<vq-footer> visible a padres/educadores)
 * 11. www/js/services/icons.js            (claves de caché vigentes + ?v= cache busting)
 * 12. www/campaign.html / www/story.html  (compat: hoy heredan vía <vq-footer>)
 * 13. docs/versioning-policy-spec.md      (línea "Versión Actual del Ecosistema")
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const CHECK_MODE = args.includes('--check') || args.includes('check');

const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$/;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getSsotVersion() {
  const pkg = readJson(path.join(ROOT_DIR, 'package.json'));
  if (!pkg.version || !semverRegex.test(pkg.version)) {
    console.error(`❌ Error: package.json no contiene una versión SemVer válida ("${pkg.version}").`);
    process.exit(1);
  }
  return pkg.version;
}

function applyFile(filePath, transform) {
  if (!fs.existsSync(filePath)) return { status: 'missing' };
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = transform(original);
  if (updated === null) return { status: 'no-pattern' };
  if (original === updated) return { status: 'ok' };
  fs.writeFileSync(filePath, updated, 'utf8');
  return { status: 'updated' };
}

function checkFile(label, filePath, predicate) {
  if (!fs.existsSync(filePath)) return { label, ok: true, detail: 'omitido (no existe)' };
  const content = fs.readFileSync(filePath, 'utf8');
  const result = predicate(content);
  return { label, ok: result.ok, detail: result.detail };
}

// ---------------------------------------------------------------------------
// Definición de puntos canónicos (escritura + verificación usan lo mismo)
// ---------------------------------------------------------------------------
function canonicalTargets(version) {
  const vUnderscore = version.replace(/\./g, '_');
  return [
    {
      name: 'package.json',
      file: 'package.json',
      write: (c) => c.replace(/"version":\s*"[^"]+"/, `"version": "${version}"`),
      check: (c) => {
        const m = c.match(/"version":\s*"([^"]+)"/);
        return m && m[1] === version
          ? { ok: true, detail: `version=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'package-lock.json',
      file: 'package-lock.json',
      write: (c) => {
        try {
          const lock = JSON.parse(c);
          let touched = false;
          if (lock.version !== version) { lock.version = version; touched = true; }
          if (lock.packages && lock.packages[''] && lock.packages[''].version !== version) {
            lock.packages[''].version = version;
            touched = true;
          }
          return touched ? JSON.stringify(lock, null, 2) + '\n' : c;
        } catch {
          return null;
        }
      },
      check: (c) => {
        try {
          const lock = JSON.parse(c);
          const root = lock.version;
          const pkg = lock.packages?.['']?.version;
          const ok = root === version && pkg === version;
          return ok
            ? { ok: true, detail: `root=${root}` }
            : { ok: false, detail: `root=${root}, packages[""]=${pkg}, esperado ${version}` };
        } catch {
          return { ok: false, detail: 'JSON inválido' };
        }
      },
    },
    {
      name: 'Cargo.toml',
      file: 'Cargo.toml',
      write: (c) => {
        if (!/(name\s*=\s*"kidslearn-wasm"\s*\nversion\s*=\s*)"[^"]+"/.test(c)) return null;
        return c.replace(/(name\s*=\s*"kidslearn-wasm"\s*\nversion\s*=\s*)"[^"]+"/, `$1"${version}"`);
      },
      check: (c) => {
        const m = c.match(/name\s*=\s*"kidslearn-wasm"\s*\nversion\s*=\s*"([^"]+)"/);
        return m && m[1] === version
          ? { ok: true, detail: `version=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'Cargo.lock',
      file: 'Cargo.lock',
      write: (c) => {
        if (!/name = "kidslearn-wasm"\nversion = "[^"]+"/.test(c)) return null;
        return c.replace(/name = "kidslearn-wasm"\nversion = "[^"]+"/, `name = "kidslearn-wasm"\nversion = "${version}"`);
      },
      check: (c) => {
        const m = c.match(/name = "kidslearn-wasm"\nversion = "([^"]+)"/);
        return m && m[1] === version
          ? { ok: true, detail: `kidslearn-wasm=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'VERSION',
      file: 'VERSION',
      write: () => `${version}\n`,
      check: (c) => {
        const v = c.trim();
        return v === version
          ? { ok: true, detail: version }
          : { ok: false, detail: `encontrado ${v}, esperado ${version}` };
      },
    },
    {
      name: 'README.md',
      file: 'README.md',
      write: (c) => {
        if (!/badge\/version-[\d.]+/.test(c)) return null;
        return c.replace(/badge\/version-[\d.]+/, `badge/version-${version}`);
      },
      check: (c) => {
        const m = c.match(/badge\/version-([\d.]+)/);
        return m && m[1] === version
          ? { ok: true, detail: `badge=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'src/lib.rs',
      file: path.join('src', 'lib.rs'),
      write: (c) => {
        if (!/KidsLearn-WASM Engine v[\d.]+/.test(c)) return null;
        return c.replace(/KidsLearn-WASM Engine v[\d.]+/, `KidsLearn-WASM Engine v${version}`);
      },
      check: (c) => {
        const m = c.match(/KidsLearn-WASM Engine v([\d.]+)/);
        return m && m[1] === version
          ? { ok: true, detail: `engine=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'www/js/app.js',
      file: path.join('www', 'js', 'app.js'),
      write: (c) => {
        if (!/APP_VERSION\s*=\s*'[^']+'/.test(c)) return null;
        return c.replace(/(APP_VERSION\s*=\s*')[^']+(')/, `$1${version}$2`);
      },
      check: (c) => {
        const m = c.match(/APP_VERSION\s*=\s*'([^']+)'/);
        return m && m[1] === version
          ? { ok: true, detail: `APP_VERSION=${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
    {
      name: 'www/sw.js',
      file: path.join('www', 'sw.js'),
      write: (c) => {
        if (!/const\s+CACHE_VERSION\s*=\s*'[^']+';/.test(c)) return null;
        return c.replace(/const\s+CACHE_VERSION\s*=\s*'[^']+';/, `const CACHE_VERSION = 'v${version}';`);
      },
      check: (c) => {
        const m = c.match(/const\s+CACHE_VERSION\s*=\s*'v?([^']+)';/);
        return m && m[1] === version
          ? { ok: true, detail: `CACHE_VERSION=v${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[0] : '—'}, esperado v${version}` };
      },
    },
    {
      name: 'www/js/components/footer.js',
      file: path.join('www', 'js', 'components', 'footer.js'),
      write: (c) => {
        if (!/ValenQuest\s+v\d+\.\d+\.\d+/.test(c)) return null;
        return c.replace(/ValenQuest\s+v\d+\.\d+\.\d+/g, `ValenQuest v${version}`);
      },
      check: (c) => {
        const m = c.match(/ValenQuest\s+v(\d+\.\d+\.\d+)/);
        return m && m[1] === version
          ? { ok: true, detail: `footer=v${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[0] : '—'}, esperado v${version}` };
      },
    },
    {
      name: 'www/js/services/icons.js',
      file: path.join('www', 'js', 'services', 'icons.js'),
      write: (c) => {
        let out = c;
        // Solo las claves de caché VIGENTES (líneas *_CACHE_KEY = '...'), nunca la
        // lista histórica de limpieza de versiones obsoletas.
        out = out.split('\n').map((line) => {
          if (/_CACHE_KEY\s*=/.test(line)) {
            return line.replace(/v\d+_\d+_\d+/g, `v${vUnderscore}`);
          }
          return line;
        }).join('\n');
        out = out.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${version}`);
        return out;
      },
      check: (c) => {
        const keyLines = c.split('\n').filter((l) => /_CACHE_KEY\s*=/.test(l));
        const keysOk = keyLines.length > 0 && keyLines.every((l) => l.includes(`v${vUnderscore}`));
        const fetchTags = [...c.matchAll(/\?v=(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
        const fetchOk = fetchTags.length > 0 && fetchTags.every((v) => v === version);
        const ok = keysOk && fetchOk;
        return ok
          ? { ok: true, detail: `cacheKeys=v${vUnderscore}, fetch=?v=${version}` }
          : { ok: false, detail: `claves=${keysOk ? 'ok' : 'desfasadas'}, fetch=[${fetchTags.join(',') || '—'}], esperado ${version}` };
      },
    },
    {
      name: 'www/campaign.html',
      file: path.join('www', 'campaign.html'),
      write: (c) => (/ValenQuest\s+v\d+\.\d+\.\d+/.test(c) ? c.replace(/ValenQuest\s+v\d+\.\d+\.\d+[^\s<]*/g, `ValenQuest v${version}`) : c),
      check: (c) => {
        const m = c.match(/ValenQuest\s+v(\d+\.\d+\.\d+)/);
        if (!m) return { ok: true, detail: 'hereda vía <vq-footer>' };
        return m[1] === version
          ? { ok: true, detail: `v${m[1]}` }
          : { ok: false, detail: `encontrado v${m[1]}, esperado v${version}` };
      },
    },
    {
      name: 'www/story.html',
      file: path.join('www', 'story.html'),
      write: (c) => (/ValenQuest\s+v\d+\.\d+\.\d+/.test(c) ? c.replace(/ValenQuest\s+v\d+\.\d+\.\d+[^\s<]*/g, `ValenQuest v${version}`) : c),
      check: (c) => {
        const m = c.match(/ValenQuest\s+v(\d+\.\d+\.\d+)/);
        if (!m) return { ok: true, detail: 'hereda vía <vq-footer>' };
        return m[1] === version
          ? { ok: true, detail: `v${m[1]}` }
          : { ok: false, detail: `encontrado v${m[1]}, esperado v${version}` };
      },
    },
    {
      name: 'docs/versioning-policy-spec.md',
      file: path.join('docs', 'versioning-policy-spec.md'),
      write: (c) => {
        const lines = c.split('\n');
        let found = false;
        const out = lines.map((line) => {
          if (/Versión Actual del Ecosistema/.test(line) && /`v?[\d.]+`/.test(line)) {
            found = true;
            return line.replace(/`v?[\d.]+`/, '`v' + version + '`');
          }
          return line;
        });
        return found ? out.join('\n') : null;
      },
      check: (c) => {
        const line = c.split('\n').find((l) => /Versión Actual del Ecosistema/.test(l));
        const m = line ? line.match(/`v?([\d.]+)`/) : null;
        return m && m[1] === version
          ? { ok: true, detail: `spec=v${m[1]}` }
          : { ok: false, detail: `encontrado ${m ? m[1] : '—'}, esperado ${version}` };
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Modo --check (solo lectura, ideal para CI)
// ---------------------------------------------------------------------------
if (CHECK_MODE) {
  const expected = getSsotVersion();
  console.log(`\n🔍 [ValenQuest] Verificando homologación contra SSOT package.json v${expected}\n`);
  let failures = 0;
  for (const t of canonicalTargets(expected)) {
    const res = checkFile(t.name, path.join(ROOT_DIR, t.file), t.check);
    const icon = res.ok ? '✓' : '✗';
    console.log(`  ${icon} ${res.label}: ${res.detail}`);
    if (!res.ok) failures++;
  }
  if (failures > 0) {
    console.log(`\n❌ Deriva detectada en ${failures} archivo(s). Ejecuta: npm run version:bump ${expected}\n`);
    process.exit(1);
  }
  console.log(`\n✨ Todo homologado en v${expected}. Sin deriva.\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Modo bump <versión>
// ---------------------------------------------------------------------------
const targetVersion = args[0];

if (!targetVersion) {
  console.error('❌ Error: Debes especificar una versión SemVer o --check.');
  console.error('   Ejemplos: node scripts/bump-version.js 2.2.0 | node scripts/bump-version.js --check');
  process.exit(1);
}

if (!semverRegex.test(targetVersion)) {
  console.error(`❌ Error: La versión "${targetVersion}" no cumple con el formato SemVer (ej. 2.1.0 o 2.2.0).`);
  process.exit(1);
}

console.log(`\n🦄 [ValenQuest] Homologando actualización a versión: v${targetVersion} (SSOT: package.json)\n`);

let updatedCount = 0;
let untouchedCount = 0;
for (const t of canonicalTargets(targetVersion)) {
  const fullPath = path.join(ROOT_DIR, t.file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️  Archivo omitido (no encontrado): ${t.name}`);
    continue;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = t.write(original);
  if (updated === null) {
    console.log(`  - ${t.name}: patrón no encontrado, sin cambios`);
    untouchedCount++;
  } else if (original !== updated) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`  ✓ ${t.name} actualizado a v${targetVersion}`);
    updatedCount++;
  } else {
    console.log(`  - ${t.name} ya se encontraba en v${targetVersion}`);
    untouchedCount++;
  }
}

console.log(`\n✨ ¡Homologación completada! ${updatedCount} actualizados, ${untouchedCount} ya al día.`);
console.log(`👉 Verifica con: npm run version:check`);
console.log(`👉 Luego compila: ./scripts/build.sh (tests + WASM + dist/)\n`);
