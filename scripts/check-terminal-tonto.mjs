#!/usr/bin/env node
/**
 * ValenQuest: guardrail "terminal tonto" (contrato JS ↔ WASM).
 *
 * REGLAS (SSOT: src/engine/math_fsm.rs + docs/terminal-tonto-contract-spec.md):
 *  R1. Rust es dueño de: generación, distractores, EMA, FSM tiers,
 *      portal_ready (>=0.82 + racha>=3, piedad racha>=8), WPM, silabeo.
 *  R2. JS solo renderiza, persiste el JSON del motor y gestiona economía
 *      arcade (combo/diamantes), poderes, navegación y capítulos.
 *  R3. Prohibido en JS (fuera de allowlist):
 *      - Math.random() para generar retos (solo fallback degradado explícito).
 *      - Reimplementar el umbral del portal (0.82 / 0.95) en JS.
 *      - Decidir el portal por templeProgress / consecutiveCorrect.
 *      - Validar la respuesta arcade sin pasar por submit_answer.
 *
 * Uso: node scripts/check-terminal-tonto.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failures = 0;
const fail = (msg) => { console.error(`✗ ${msg}`); failures++; };
const ok = (msg) => console.log(`✓ ${msg}`);

// --- R3a: Math.random solo permitido dentro de generateFallbackChallenge ---
for (const f of [
  'www/js/services/campaign-engine.js',
  'www/js/services/adventure.js',
]) {
  const src = read(f);
  if (/Math\.random/.test(src)) fail(`${f}: Math.random prohibido (la aleatoriedad es Xorshift64* en Rust)`);
  else ok(`${f}: sin Math.random`);
}
{
  const raw = read('www/js/services/math-practice.js');
  const noComments = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const lines = noComments.split('\n');
  const defFallback = lines.findIndex((l) => /^\s*generateFallbackChallenge\(\)\s*\{/.test(l));
  const defGen = lines.findIndex((l, i) => i > defFallback && /^\s*generateChallenge\(\)\s*\{/.test(l));
  const outside = (defFallback >= 0 && defGen > defFallback)
    ? lines.slice(0, defFallback).concat(lines.slice(defGen)).join('\n')
    : noComments;
  if (/Math\.random/.test(outside)) fail('math-practice.js: Math.random fuera del fallback degradado');
  else ok('math-practice.js: Math.random solo en fallback degradado');
  if (!/submit_answer/.test(noComments)) fail('math-practice.js: checkAnswer debe despachar a session.submit_answer (verdad WASM)');
  else ok('math-practice.js: despacha a submit_answer');
}

// --- R3b: el umbral del portal no vive en JS ---
for (const f of [
  'www/js/services/campaign-engine.js',
  'www/js/services/adventure.js',
  'www/js/services/math-practice.js',
  'www/js/controllers/campaign-arena.js',
]) {
  const src = read(f);
  if (/0\.82|0\.95/.test(src)) fail(`${f}: umbral del portal hardcodeado en JS (vive en math_fsm.rs)`);
  else ok(`${f}: sin umbral portal duplicado`);
}

// --- R3c: el portal solo lo decide portal_ready del WASM ---
{
  const src = read('www/js/services/adventure.js');
  if (/templeProgress\s*>=\s*100/.test(src) && /isPortalReady.*templeProgress/.test(src))
    fail('adventure.js: isPortalReady no debe hacer OR con templeProgress');
  else ok('adventure.js: isPortalReady = portal_ready WASM');
}

// --- R3d: límites de acto centralizados (SSOT levels.json) ---
{
  const eng = read('www/js/services/campaign-engine.js');
  if (!/export function actOf/.test(eng)) fail('campaign-engine.js: falta actOf() centralizado (SSOT levels.json)');
  else ok('campaign-engine.js: actOf() centralizado');
  const arena = read('www/js/controllers/campaign-arena.js');
  if (/beatenTemple\s*===\s*3|beatenTemple\s*===\s*7/.test(arena))
    fail('campaign-arena.js: límites de acto duplicados (usar result.actClosed del engine)');
  else ok('campaign-arena.js: sin límites de acto duplicados');
}

if (failures > 0) { console.error(`\n❌ terminal-tonto: ${failures} violación(es)`); process.exit(1); }
console.log('\n✨ terminal-tonto OK: JS es terminal, Rust decide.');
