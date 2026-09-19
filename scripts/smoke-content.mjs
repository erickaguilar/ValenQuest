#!/usr/bin/env node
/**
 * Smoke test del contenido editorial en JSON + cableado lectura↔Rust.
 * - Verifica los catálogos JSON (130 retos, 8 capítulos, esquemas).
 * - Ejercita reading-practice con una ReadingSession simulada:
 *   QA de silabeo curado vs RAE y WPM real.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures++;
}

// 1. Catálogos JSON íntegros.
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'www/data/reading-challenges.json'), 'utf8'));
const bankTotal = Object.values(bank.levels).reduce((n, arr) => n + arr.length, 0);
check('130 retos en 5 niveles', bankTotal === 130 && Object.keys(bank.levels).length === 5, `total=${bankTotal}`);
let bankOk = true;
for (const [lvl, items] of Object.entries(bank.levels)) {
  for (const ch of items) {
    if (!ch.type || !ch.answer || !Array.isArray(ch.options) || !ch.options.includes(ch.answer)) bankOk = false;
  }
}
check('retos con respuesta incluida en opciones', bankOk);

const story = JSON.parse(fs.readFileSync(path.join(ROOT, 'www/data/story-chapters.json'), 'utf8'));
check('8 capítulos con párrafos', story.chapters.length === 8 && story.chapters.every((c) => c.paragraphs.length > 0));

const levels = JSON.parse(fs.readFileSync(path.join(ROOT, 'www/data/levels.json'), 'utf8'));
check('10 templos con portal completo',
  levels.levels.length === 10 && levels.levels.every((l) => l.microCuento?.length === 4 && l.portalRiddle?.correctAnswer !== undefined));

// 2. Servicio de lectura con motor simulado.
const { readingPractice } = await import('../www/js/services/reading-practice.js');

const fakeWasm = {
  ReadingSession: class {
    parse_text_syllables(text) {
      // Silabeo ingenuo de juguete: una sílaba por grupo vocálico.
      const words = String(text).split(/\s+/).filter(Boolean);
      return JSON.stringify(words.map((w) => {
        const parts = w.split(/(?=[aeiouáéíóúü])/i).filter(Boolean);
        return { raw: w, clean: w, syllables: parts.length ? parts : [w] };
      }));
    }
    static calculate_wpm(words, ms) {
      return Math.round(words / (ms / 60000));
    }
  },
};

readingPractice.init(fakeWasm);
check('motor inyectado', Boolean(readingPractice.readingSession));
const qa = readingPractice.verifyCuratedSplits();
check('QA de silabeo ejecutada sobre el banco', qa.checked > 0, `checked=${qa.checked}`);

// WPM real: 12 palabras en 6 s = 120.
const wpm = readingPractice.measureWpm(12, 6000);
check('WPM vía motor', wpm === 120, `wpm=${wpm}`);

// checkAnswer mide con el texto del reto.
readingPractice.currentChallenge = {
  type: 'sentence', answer: 'Nube', options: ['Nube', 'Luz'],
  sentence: 'La nube rosa vuela alto hoy',
};
const res = readingPractice.checkAnswer('Nube', 6000);
check('checkAnswer devuelve wpm medido', res.isCorrect && res.wpm === 60, `wpm=${res.wpm}`);
check('wordsRead cuenta palabras reales', readingPractice.wordsRead >= 6);

if (failures > 0) { console.error(`\n❌ ${failures} fallo(s)`); process.exit(1); }
console.log('\n✨ Smoke contenido OK: JSON íntegros y lectura↔motor cableados.');
