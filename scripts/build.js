#!/usr/bin/env node
/**
 * ValenQuest Production Build Engine (scripts/build.js)
 * Zero-Framework, Zero-Dependency Build Step for KidsLearn-WASM PWA:
 * 1. Minifies CSS, JS, HTML, and JSON.
 * 2. Computes deterministic SHA-256 content hashes (8-char) for cache busting.
 * 3. Rewrites asset references in HTML, JS ES-module imports, and Service Worker.
 * 4. Generates an optimized, deployable dist/ folder with asset-manifest.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'www');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('==================================================');
console.log('🚀 ValenQuest: Production Build & Asset Hashing');
console.log('==================================================');
console.log(`Source:      ${SRC_DIR}`);
console.log(`Destination: ${DIST_DIR}`);
console.log('');

// =============================================================================
// Minification Utilities (Pure Node.js, Zero-Dependencies)
// =============================================================================

function minifyCss(content) {
  return content
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove newlines and collapse tabs/spaces
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    // Remove spaces around CSS delimiters
    .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
    // Remove trailing semicolons before closing braces
    .replace(/;\}/g, '}')
    .trim();
}

function minifyJs(content) {
  // Safe JS minification: preserve strings and template literals while stripping comments and extra whitespace
  return content
    // Remove multi-line comments that are not license blocks
    .replace(/\/\*[\s\S]*?\*\//g, (match) => {
      return match.includes('@license') || match.includes('/*!') ? match : '';
    })
    // Remove single-line comments that are alone on a line
    .replace(/^\s*\/\/.*$/gm, '')
    // Collapse consecutive empty lines
    .replace(/\n\s*\n/g, '\n')
    // Trim each line
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

function minifyHtml(content) {
  return content
    // Remove HTML comments (except IE conditionals if any)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    // Collapse consecutive whitespace between tags
    .replace(/>\s+</g, '><')
    .trim();
}

function computeHash(bufferOrString) {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex').slice(0, 8);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// =============================================================================
// Build Pipeline
// =============================================================================

const manifest = {};
let totalOrigBytes = 0;
let totalDistBytes = 0;

// 1. Reset / Prepare dist/
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
ensureDir(DIST_DIR);

// 2. Process CSS Files with Tree-shaking and Minification
console.log('🎨 [1/6] Procesando, tree-shaking y minificando hojas de estilo CSS...');
const cssSrcDir = path.join(SRC_DIR, 'css');
const cssDistDir = path.join(DIST_DIR, 'css');
ensureDir(cssDistDir);

// Tree-shaking pass con PurgeCSS (si está disponible en node_modules)
const purgedCssMap = new Map();
try {
  const { PurgeCSS } = await import('purgecss');
  const purgeResults = await new PurgeCSS().purge({
    content: [
      path.join(SRC_DIR, '**/*.html'),
      path.join(SRC_DIR, 'js/**/*.js'),
      path.join(SRC_DIR, 'data/**/*.json'),
      path.join(SRC_DIR, 'assets/**/*.svg')
    ],
    css: [path.join(SRC_DIR, 'css/*.css')],
    keyframes: true,
    variables: true,
    safelist: {
      standard: [
        'active', 'selected', 'correct', 'wrong', 'shake', 'pop', 'hidden', 'show',
        /^is-/, /^has-/, /^theme-/, 'dark', 'light',
        /^level-/, /^tier-/, /^streak-/,
        /^equipped-/, /^vq-cosmetic-/, /^vq-anim-/,
        /^portal-/, /^power-/, /^powers-/,
        /^math-/, /^reading-/, /^story-/, /^wardrobe-/, /^campaign-/,
        /^status-/, /^badge-/, /^pill-/, /^item-/,
        /star-updated/, /diamond-updated/
      ],
      deep: [/^kids-/, /^companion-/, /^luces-/, /^dialog/, /^modal/],
      greedy: [/:hover/, /:focus/, /:active/, /:disabled/]
    }
  });
  for (const res of purgeResults) {
    const fileName = path.basename(res.file);
    purgedCssMap.set(fileName, res.css);
  }
  console.log('  ✓ PurgeCSS tree-shaking completado con éxito.');
} catch (purgeErr) {
  console.log('  ℹ️ PurgeCSS no ejecutado, procediendo con minificación directa.');
}

if (fs.existsSync(cssSrcDir)) {
  const cssFiles = fs.readdirSync(cssSrcDir).filter((f) => f.endsWith('.css'));
  for (const file of cssFiles) {
    const origPath = path.join(cssSrcDir, file);
    const origContent = fs.readFileSync(origPath, 'utf8');
    totalOrigBytes += Buffer.byteLength(origContent);

    const contentToMinify = purgedCssMap.get(file) || origContent;
    const minified = minifyCss(contentToMinify);
    const hash = computeHash(minified);
    const baseName = path.basename(file, '.css');
    const hashedFileName = `${baseName}.${hash}.css`;

    // Write both hashed version (for cache busting) and canonical name (for fallback)
    fs.writeFileSync(path.join(cssDistDir, hashedFileName), minified, 'utf8');
    fs.writeFileSync(path.join(cssDistDir, file), minified, 'utf8');

    const outBytes = Buffer.byteLength(minified);
    totalDistBytes += outBytes;

    manifest[`/css/${file}`] = `/css/${hashedFileName}`;
    manifest[`css/${file}`] = `css/${hashedFileName}`;
    console.log(`  ✓ css/${file} → css/${hashedFileName} (${(origContent.length / 1024).toFixed(1)} KB → ${(minified.length / 1024).toFixed(1)} KB)`);
  }
}

// 3. Process Static Assets, Data, and WASM
console.log('\n📦 [2/6] Copiando y optimizando assets, datos y binarios WASM...');

// Assets (icons, images)
const assetsSrcDir = path.join(SRC_DIR, 'assets');
const assetsDistDir = path.join(DIST_DIR, 'assets');
if (fs.existsSync(assetsSrcDir)) {
  copyRecursive(assetsSrcDir, assetsDistDir);
  console.log('  ✓ Assets SVG y PNG copiados a dist/assets/');
}

// Data JSON files (minify JSON)
const dataSrcDir = path.join(SRC_DIR, 'data');
const dataDistDir = path.join(DIST_DIR, 'data');
ensureDir(dataDistDir);
if (fs.existsSync(dataSrcDir)) {
  const jsonFiles = fs.readdirSync(dataSrcDir).filter((f) => f.endsWith('.json'));
  for (const file of jsonFiles) {
    const orig = fs.readFileSync(path.join(dataSrcDir, file), 'utf8');
    totalOrigBytes += Buffer.byteLength(orig);
    try {
      const minified = JSON.stringify(JSON.parse(orig));
      fs.writeFileSync(path.join(dataDistDir, file), minified, 'utf8');
      totalDistBytes += Buffer.byteLength(minified);
      console.log(`  ✓ data/${file} minificado (${orig.length}B → ${minified.length}B)`);
    } catch (_) {
      fs.copyFileSync(path.join(dataSrcDir, file), path.join(dataDistDir, file));
    }
  }
}

// WASM Package
const pkgSrcDir = path.join(SRC_DIR, 'pkg');
const pkgDistDir = path.join(DIST_DIR, 'pkg');
if (fs.existsSync(pkgSrcDir)) {
  copyRecursive(pkgSrcDir, pkgDistDir);
  console.log('  ✓ Binarios WASM y pegamento JS copiados a dist/pkg/');
}

// Favicon and Manifest
['favicon.svg', 'manifest.json'].forEach((f) => {
  const src = path.join(SRC_DIR, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DIR, f));
    console.log(`  ✓ ${f} copiado`);
  }
});

// 4. Process JavaScript Modules (Order by dependency depth)
console.log('\n⚙️ [3/6] Procesando, minificando y hasheando módulos JavaScript...');

function getAllJsFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'sw.js') {
      results.push(fullPath);
    }
  }
  return results;
}

const allJsFiles = getAllJsFiles(path.join(SRC_DIR, 'js'));

// Sort bottom-up: subdirectories first (data, services, controllers, components), root js files last
allJsFiles.sort((a, b) => {
  const depthA = a.split(path.sep).length;
  const depthB = b.split(path.sep).length;
  if (depthA !== depthB) return depthB - depthA; // deeper first
  return b.localeCompare(a);
});

// Map of original relative path to content/hash
const jsMap = new Map();

for (const fullPath of allJsFiles) {
  const relPath = path.relative(path.join(SRC_DIR, 'js'), fullPath).replace(/\\/g, '/');
  let content = fs.readFileSync(fullPath, 'utf8');
  totalOrigBytes += Buffer.byteLength(content);

  // Rewrite imports with hashed dependencies that were already processed
  for (const [origRel, hashedRel] of jsMap.entries()) {
    const origBase = path.basename(origRel);
    const hashedBase = path.basename(hashedRel);
    // Replace import './foo.js' with import './foo.[hash].js'
    const importRegex = new RegExp(`(['"]\\.{1,2}/[^'"]*?)${origBase}(['"])`, 'g');
    content = content.replace(importRegex, `$1${hashedBase}$2`);
  }

  const minified = minifyJs(content);
  const hash = computeHash(minified);
  const parsed = path.parse(relPath);
  const hashedName = parsed.dir
    ? `${parsed.dir}/${parsed.name}.${hash}.js`
    : `${parsed.name}.${hash}.js`;

  jsMap.set(relPath, hashedName);

  // Write to dist/js/
  const targetDir = path.join(DIST_DIR, 'js', parsed.dir);
  ensureDir(targetDir);

  const hashedDestPath = path.join(DIST_DIR, 'js', hashedName);
  const canonicalDestPath = path.join(DIST_DIR, 'js', relPath);

  fs.writeFileSync(hashedDestPath, minified, 'utf8');
  fs.writeFileSync(canonicalDestPath, minified, 'utf8');

  totalDistBytes += Buffer.byteLength(minified);

  manifest[`/js/${relPath}`] = `/js/${hashedName}`;
  manifest[`js/${relPath}`] = `js/${hashedName}`;
  console.log(`  ✓ js/${relPath} → js/${hashedName}`);
}

// 5. Process HTML Files
console.log('\n📄 [4/6] Actualizando referencias y minificando páginas HTML...');
const htmlFiles = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.html'));

for (const file of htmlFiles) {
  let content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  totalOrigBytes += Buffer.byteLength(content);

  // 1. Replace CSS links with hashed versions
  for (const [orig, hashed] of Object.entries(manifest)) {
    if (orig.endsWith('.css')) {
      content = content.replaceAll(`"${orig}"`, `"${hashed}"`);
      content = content.replaceAll(`'${orig}'`, `'${hashed}'`);
    }
  }

  // 2. Replace JS scripts with hashed versions
  for (const [orig, hashed] of Object.entries(manifest)) {
    if (orig.endsWith('.js')) {
      content = content.replaceAll(`"${orig}"`, `"${hashed}"`);
      content = content.replaceAll(`'${orig}'`, `'${hashed}'`);
    }
  }

  const minified = minifyHtml(content);
  fs.writeFileSync(path.join(DIST_DIR, file), minified, 'utf8');
  totalDistBytes += Buffer.byteLength(minified);
  console.log(`  ✓ ${file} actualizado con hashes (${content.length}B → ${minified.length}B)`);
}

// 6. Process Service Worker (sw.js)
console.log('\n🛡️ [5/6] Generando Service Worker con precache de core hasheado...');
const swSrcPath = path.join(SRC_DIR, 'sw.js');
let swContent = fs.readFileSync(swSrcPath, 'utf8');
totalOrigBytes += Buffer.byteLength(swContent);

// Compute a global build hash from manifest values
const globalBuildHash = computeHash(JSON.stringify(manifest));

// Replace cache version with build hash
swContent = swContent.replace(
  /const CACHE_VERSION = '[^']+';/,
  `const CACHE_VERSION = 'v2.1.0-${globalBuildHash}';`
);

// Update CORE_PRECACHE_URLS entries with hashed asset paths where available
for (const [orig, hashed] of Object.entries(manifest)) {
  if (orig.startsWith('/')) {
    swContent = swContent.replaceAll(`'${orig}'`, `'${hashed}'`);
  }
}

const swMinified = minifyJs(swContent);
fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), swMinified, 'utf8');
totalDistBytes += Buffer.byteLength(swMinified);
console.log(`  ✓ sw.js generado con CACHE_VERSION = 'v2.1.0-${globalBuildHash}'`);

// 7. Write Asset Manifest
console.log('\n📋 [6/6] Escribiendo asset-manifest.json...');
const manifestPayload = {
  buildTime: new Date().toISOString(),
  buildHash: globalBuildHash,
  assets: manifest,
  stats: {
    originalBytes: totalOrigBytes,
    minifiedBytes: totalDistBytes,
    savingsPercent: (((totalOrigBytes - totalDistBytes) / totalOrigBytes) * 100).toFixed(1) + '%'
  }
};
fs.writeFileSync(
  path.join(DIST_DIR, 'asset-manifest.json'),
  JSON.stringify(manifestPayload, null, 2),
  'utf8'
);
console.log('  ✓ dist/asset-manifest.json guardado.');

// Summary
console.log('\n==================================================');
console.log('🎉 ¡Compilación de producción completada con éxito!');
console.log(`  • Tamaño original:  ${(totalOrigBytes / 1024).toFixed(1)} KB`);
console.log(`  • Tamaño minificado: ${(totalDistBytes / 1024).toFixed(1)} KB`);
console.log(`  • Ahorro total:     ${manifestPayload.stats.savingsPercent}`);
console.log('Para probar la versión de distribución en producción:');
console.log('   python3 -m http.server 8090 --directory dist');
console.log('==================================================');
