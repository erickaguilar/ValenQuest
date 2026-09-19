#!/usr/bin/env node
/**
 * Smoke test del cableado campaña JS ↔ FSM (sin navegador ni WASM real).
 * Usa una MathSession simulada que replica el contrato Rust vigente:
 * - submit_answer actualiza EMA y arma portal SIN auto-avance.
 * - advance_tier() avanza y recalibra a 0.65.
 * La persistencia IndexedDB no existe en node: adventure la tolera
 * (try/catch internos) y el flujo se verifica igual.
 */
import { campaignEngine } from '../www/js/services/campaign-engine.js';
import { adventure } from '../www/js/services/adventure.js';

class FakeMathSession {
  constructor(seed, tier) {
    this.tier = Math.max(1, Math.min(10, tier || 1));
    this.mastery = 0.5;
    this.streak = 0;
    this.highest = 0;
    this.consecErr = 0;
    this.answer = this.tier * 10 + 3;
    this.portal = false;
    this.changed = 0;
  }
  force_tier(t) { this.tier = t; this.portal = false; this.changed = 0; this.generate_next_challenge(); }
  advance_tier() {
    this.tier = Math.min(10, this.tier + 1);
    this.changed = 1; this.portal = false; this.mastery = 0.65; this.streak = 0;
    this.generate_next_challenge();
    return this.tier;
  }
  clear_portal_ready() { this.portal = false; }
  generate_next_challenge() { this.changed = 0; this.answer = this.tier * 10 + 3; }
  submit_answer(user, ms) {
    const ok = Number(user) === this.answer;
    let p;
    if (ok) { this.streak++; this.highest = Math.max(this.highest, this.streak); this.consecErr = 0; p = ms <= 4000 ? 1 : ms <= 8000 ? 0.85 : 0.7; }
    else { this.streak = 0; this.consecErr++; p = 0; }
    this.mastery = Math.min(1, Math.max(0, 0.75 * this.mastery + 0.25 * p));
    this.changed = 0;
    if (this.mastery >= 0.82 && this.streak >= 3 && !this.portal) { this.changed = 1; this.portal = true; }
    else if (this.mastery < 0.38 && this.consecErr >= 2 && this.tier > 1) {
      this.tier--; this.changed = -1; this.portal = false; this.mastery = 0.55; this.consecErr = 0;
      this.generate_next_challenge();
    }
    return ok;
  }
  get_state_json() {
    return JSON.stringify({
      tier: this.tier, mastery: this.mastery, mastery_pct: Math.round(this.mastery * 100),
      streak: this.streak, highest_streak: this.highest, total_answered: 0, total_correct: 0,
      last_was_correct: true, tier_changed: this.changed, portal_ready: this.portal,
    });
  }
  get_options_json() { const a = this.answer; return JSON.stringify([a, a + 1, a + 2, a - 1]); }
  get_operand1() { return this.tier; }
  get_operand2() { return 3; }
  get_operator() { return '+'; }
  get_expression() { return ''; }
  get_correct_answer() { return this.answer; }
}

const fakeWasm = { MathSession: FakeMathSession };
let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? ` — ${extra}` : ''}`);
  if (!cond) failures++;
}

// 1. Init anclado al templo 3.
campaignEngine.init(fakeWasm, 3);
check('init en templo 3', campaignEngine.temple === 3);
check('reto con 4 opciones', campaignEngine.currentChallenge.options.length === 4);

// 2. Cuatro aciertos rápidos arman el portal SIN auto-avance.
let res = null;
for (let i = 0; i < 4; i++) {
  res = await campaignEngine.submitAnswer(campaignEngine.currentChallenge.answer, 1200);
  campaignEngine.nextChallenge();
}
check('portal armado', res.portalReady === true);
check('sin auto-avance (templo sigue en 3)', campaignEngine.temple === 3);
check('adventure espeja maestría WASM', adventure.wasmMasteryPct >= 82, `pct=${adventure.wasmMasteryPct}`);

// 3. Completar el portal avanza al templo 4 y cierra el Acto I.
const done = await campaignEngine.completePortal();
check('avanza al templo 4', done.advancedTo === 4 && campaignEngine.temple === 4);
check('cierra Acto I', done.actClosed === 1 && done.beatenTemple === 3);
check('adventure.currentTemple = 4', adventure.currentTemple === 4);

// 4. Regresión: racha de fallos baja el tier y la aventura lo sigue.
campaignEngine.init(fakeWasm, 4);
for (let i = 0; i < 8; i++) {
  await campaignEngine.submitAnswer(-999, 1000);
  campaignEngine.nextChallenge();
}
check('regresión sincronizada', campaignEngine.temple < 4 && adventure.currentTemple === campaignEngine.temple,
  `templo=${campaignEngine.temple}`);

// 5. Victoria: portal del templo 10.
campaignEngine.init(fakeWasm, 10);
for (let i = 0; i < 6; i++) {
  res = await campaignEngine.submitAnswer(campaignEngine.currentChallenge.answer, 1000);
  if (res.portalReady) break;
  campaignEngine.nextChallenge();
}
check('portal final armado', res.portalReady === true);
const victory = await campaignEngine.completePortal();
check('victoria y acto III', victory.victory === true && victory.actClosed === 3);
check('campaña completada persistida', adventure.campaignCompleted === true);

if (failures > 0) { console.error(`\n❌ ${failures} fallo(s)`); process.exit(1); }
console.log('\n✨ Smoke campaña OK: FSM ↔ JS cableados.');
