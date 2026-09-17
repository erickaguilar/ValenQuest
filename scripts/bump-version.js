#!/usr/bin/env node
/**
 * ValenQuest Version Homologation Script (scripts/bump-version.js)
 *
 * Utilidad automatizada para garantizar la actualización sincronizada y atómica
 * de la versión del proyecto en todos los puntos canónicos:
 * 1. package.json
 * 2. Cargo.toml
 * 3. www/sw.js
 * 4. www/js/components/footer.js
 * 5. www/campaign.html
 * 6. www/story.html
 *
 * Uso:
 *   node scripts/bump-version.js <nueva_versión>
 *   npm run version:bump <nueva_versión>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const targetVersion = process.argv[2];

if (!targetVersion) {
  console.error('❌ Error: Debes especificar una versión SemVer. Ejemplo: node scripts/bump-version.js 2.2.0');
  process.exit(1);
}

// Validación básica de versión semántica (ej. 2.1.0, 2.2.0, 3.0.0-beta.1)
const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$/;
if (!semverRegex.test(targetVersion)) {
  console.error(`❌ Error: La versión "${targetVersion}" no cumple con el formato SemVer (ej. 2.1.0 o 2.2.0).`);
  process.exit(1);
}

console.log(`\n🦄 [ValenQuest] Homologando actualización a versión: v${targetVersion}\n`);

const filesToUpdate = [
  {
    name: 'package.json',
    path: path.join(ROOT_DIR, 'package.json'),
    replace: (content) => content.replace(/"version":\s*"[^"]+"/, `"version": "${targetVersion}"`),
  },
  {
    name: 'Cargo.toml',
    path: path.join(ROOT_DIR, 'Cargo.toml'),
    replace: (content) => content.replace(/(name\s*=\s*"kidslearn-wasm"\s*\nversion\s*=\s*)"[^"]+"/, `$1"${targetVersion}"`),
  },
  {
    name: 'www/sw.js',
    path: path.join(ROOT_DIR, 'www', 'sw.js'),
    replace: (content) => content.replace(/const\s+CACHE_VERSION\s*=\s*'[^']+';/, `const CACHE_VERSION = 'v${targetVersion}';`),
  },
  {
    name: 'www/js/components/footer.js',
    path: path.join(ROOT_DIR, 'www', 'js', 'components', 'footer.js'),
    replace: (content) => content.replace(/ValenQuest\s+v\d+\.\d+\.\d+[^\s<]*/g, `ValenQuest v${targetVersion}`),
  },
  {
    name: 'www/campaign.html',
    path: path.join(ROOT_DIR, 'www', 'campaign.html'),
    replace: (content) => content.replace(/ValenQuest\s+v\d+\.\d+\.\d+[^\s<]*/g, `ValenQuest v${targetVersion}`),
  },
  {
    name: 'www/story.html',
    path: path.join(ROOT_DIR, 'www', 'story.html'),
    replace: (content) => content.replace(/ValenQuest\s+v\d+\.\d+\.\d+[^\s<]*/g, `ValenQuest v${targetVersion}`),
  },
];

let updatedCount = 0;
for (const file of filesToUpdate) {
  if (!fs.existsSync(file.path)) {
    console.warn(`  ⚠️  Archivo omitido (no encontrado): ${file.name}`);
    continue;
  }
  const original = fs.readFileSync(file.path, 'utf8');
  const updated = file.replace(original);
  if (original !== updated) {
    fs.writeFileSync(file.path, updated, 'utf8');
    console.log(`  ✓ ${file.name} actualizado a v${targetVersion}`);
    updatedCount++;
  } else {
    console.log(`  - ${file.name} ya se encontraba en v${targetVersion}`);
  }
}

console.log(`\n✨ ¡Homologación completada en ${updatedCount} archivos!`);
console.log(`👉 Ejecuta \`./scripts/build.sh\` para compilar Rust/WASM y actualizar dist/ con los nuevos hashes.`);
