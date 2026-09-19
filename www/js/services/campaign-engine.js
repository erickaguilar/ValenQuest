/**
 * ValenQuest: Campaign Engine (La Gran Aventura de Lumiria)
 * Cableado JS ↔ motor Rust/WASM para el modo campaña de 10 templos.
 *
 * ESTE es el "terminal tonto" del guardrail arquitectónico:
 * - La generación de retos, la maestría EMA, la FSM de tiers y los
 *   distractores viven en `MathSession` (Rust/WASM). Aquí NO se valida
 *   nada ni se calcula ningún avance: solo se despacha
 *   `(respuesta, elapsed_ms)` y se renderiza el estado devuelto.
 * - La economía (diamantes, combos) y los poderes siguen en la capa JS.
 * - El portal y la recompensa los orquesta `portal-controller.js` con
 *   los datos de `data/levels.json`; al vencer, este motor ejecuta
 *   `advance_tier()` + `adventure.completeTemple()`.
 */

import { adventure } from './adventure.js';

export const ACT_FINAL_TEMPLES = { 1: 3, 2: 7, 3: 10 };

export class CampaignEngine {
  constructor() {
    this.wasm = null;
    this.session = null;
    this.temple = 1;
    this.currentChallenge = null;
    this.listeners = [];
  }

  /**
   * Crea la sesión WASM anclada al templo persistido en la aventura.
   * La maestría EMA es por sesión: al recargar, el templo se retoma
   * desde la base (0.50), coherente con el diseño del motor.
   */
  init(wasm, temple = 1) {
    this.wasm = wasm;
    const startTemple = Math.max(1, Math.min(10, Number(temple) || 1));
    this.temple = startTemple;
    const seed = BigInt(Date.now()) + 4242n;
    this.session = new wasm.MathSession(seed, startTemple);
    this.nextChallenge();
    return this.getState();
  }

  get isReady() {
    return Boolean(this.session);
  }

  /** Alinea la sesión WASM con el templo de la aventura (tras regresión o avance). */
  syncTemple(temple) {
    const t = Math.max(1, Math.min(10, Number(temple) || 1));
    if (t !== this.temple && this.session) {
      this.temple = t;
      this.session.force_tier(t);
      this.nextChallenge();
    } else {
      this.temple = t;
    }
    return this.temple;
  }

  nextChallenge() {
    if (!this.session) return null;
    this.session.generate_next_challenge();
    this.currentChallenge = this.readChallenge();
    this.notify();
    return this.currentChallenge;
  }

  readChallenge() {
    let options = [];
    try {
      options = JSON.parse(this.session.get_options_json());
    } catch {
      const answer = this.session.get_correct_answer();
      options = [answer, answer + 1, answer + 2, Math.max(1, answer - 1)];
    }
    const answer = this.session.get_correct_answer();
    if (!options.includes(answer)) {
      options[0] = answer;
    }
    return {
      op1: this.session.get_operand1(),
      op2: this.session.get_operand2(),
      operator: this.session.get_operator(),
      expression: this.session.get_expression(),
      answer,
      options,
    };
  }

  readWasmState() {
    try {
      return JSON.parse(this.session.get_state_json());
    } catch {
      return {
        tier: this.temple,
        mastery: 0.5,
        mastery_pct: 50,
        streak: 0,
        highest_streak: 0,
        total_answered: 0,
        total_correct: 0,
        last_was_correct: false,
        tier_changed: 0,
        portal_ready: false,
      };
    }
  }

  /**
   * Despacha (respuesta, latencia) al motor y persiste el estado devuelto.
   * Si el motor armó el portal, `result.portalReady === true` y la UI debe
   * abrir `portalController.openPortalChallenge(templo)` SIN generar
   * un reto nuevo (el avance ocurre en completePortal()).
   */
  async submitAnswer(userAnswer, elapsedMs = 3000) {
    if (!this.session) {
      throw new Error('CampaignEngine: sesión WASM no inicializada.');
    }
    const isCorrect = this.session.submit_answer(Number(userAnswer), Math.max(0, Math.round(elapsedMs)));
    const wasm = this.readWasmState();

    // El motor es la fuente de verdad del tier: si hubo refuerzo
    // (regresión), la aventura retrocede con él.
    if (wasm.tier !== this.temple) {
      this.temple = wasm.tier;
    }
    await adventure.syncWasm({
      currentTemple: this.temple,
      wasmMasteryPct: wasm.mastery_pct,
      wasmStreak: wasm.streak,
      wasmHighestStreak: wasm.highest_streak,
      portalReady: wasm.portal_ready,
      regressed: wasm.tier_changed === -1,
    });

    const result = { isCorrect, wasm, temple: this.temple, portalReady: wasm.portal_ready };
    this.notify();
    return result;
  }

  /**
   * Tras vencer el Desafío de Portal del templo vigente: avanza el FSM,
   * registra el templo en la aventura (capítulos, cosméticos ya otorgados
   * por el portal-controller) y prepara el reto del siguiente templo.
   * Devuelve `{ actClosed, victory, advancedTo }` para la UI.
   */
  async completePortal() {
    if (!this.session) {
      throw new Error('CampaignEngine: sesión WASM no inicializada.');
    }
    const beatenTemple = this.temple;
    this.session.advance_tier();
    const wasm = this.readWasmState();
    this.temple = wasm.tier;

    const adv = await adventure.completeTemple();
    await adventure.syncWasm({
      currentTemple: this.temple,
      wasmMasteryPct: wasm.mastery_pct,
      wasmStreak: wasm.streak,
      wasmHighestStreak: wasm.highest_streak,
      portalReady: false,
      regressed: false,
      campaignCompleted: beatenTemple >= 10 ? true : undefined,
    });

    this.nextChallenge();
    return {
      beatenTemple,
      advancedTo: this.temple,
      actClosed: beatenTemple === 3 ? 1 : beatenTemple === 7 ? 2 : beatenTemple === 10 ? 3 : 0,
      victory: beatenTemple >= 10,
      newChapterUnlocked: adv.newChapterUnlocked ?? null,
    };
  }

  getState() {
    return {
      ready: this.isReady,
      temple: this.temple,
      currentChallenge: this.currentChallenge,
      wasm: this.session ? this.readWasmState() : null,
    };
  }

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error('CampaignEngine listener error:', err);
      }
    });
  }
}

export const campaignEngine = new CampaignEngine();
