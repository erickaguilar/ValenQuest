/**
 * ValenQuest: Campaign Arena Controller (controllers/campaign-arena.js)
 * La Gran Aventura de Lumiria: 10 templos gobernados por el FSM WASM.
 *
 * ESTADO: DORMIDO (campaña oculta tras flag). Nada lo instancia en
 * producción; math-page.js arranca práctica por defecto. Al reabrir la
 * campaña, el bootstrap debe instanciar esta clase en vez de
 * MathPageController cuando ?campaign=1 esté presente.
 *
 * Hereda TODA la arena matemática (HUD, poderes, teclado, diamantes) y
 * sustituye la fuente de verdad: campaign-engine (terminal tonto del
 * motor) + portal-controller para los Desafíos de Portal.
 */

import { sound } from '../services/audio.js';
import { speech } from '../services/speech.js';
import { campaignEngine } from '../services/campaign-engine.js';
import { adventure } from '../services/adventure.js';
import { portalController } from './portal-controller.js';
import { loadLevelsData } from '../data/levels-data.js';
import { MathPageController } from '../math-page.js';

export class CampaignArenaController extends MathPageController {
  constructor() {
    super();
    this.portalOpened = false;
    this.campaignCombo = 0;
    this.campaignCombos = 0;
  }

  async init() {
    await super.init();
    if (!this._wasm) {
      try {
        speech.speak('La campaña necesita el motor de Lumiria. Revisa tu conexión y recarga la página.', { deferUntilActivation: true });
      } catch {}
      return;
    }
    try {
      const advState = await adventure.loadState();
      campaignEngine.init(this._wasm, advState.currentTemple || 1);
    } catch (e) {
      console.warn('Campaign engine init:', e?.message || e);
    }
    try {
      await loadLevelsData();
    } catch (e) {
      console.warn('Levels data:', e?.message || e);
    }
    try {
      portalController.init();
    } catch (e) {
      console.warn('Portal controller:', e?.message || e);
    }
    this.syncCampaignUI();
    this.renderChallenge();
    try {
      const t = campaignEngine.temple;
      speech.speak(`¡La Gran Aventura te espera! Templo ${t}: ${adventure.getState().templeName}. Resuelve con calma para abrir el portal.`, { deferUntilActivation: true });
    } catch {}
  }

  /** Reto vigente de la campaña (el FSM manda, no la práctica). */
  getActiveChallenge() {
    if (campaignEngine.isReady && campaignEngine.currentChallenge) {
      return campaignEngine.currentChallenge;
    }
    return super.getActiveChallenge();
  }

  /** Estado con forma arcade pero alimentado por el FSM WASM. */
  getCampaignViewState() {
    const eng = campaignEngine.getState();
    const wasm = eng.wasm || { mastery_pct: 50, streak: 0, highest_streak: 0, portal_ready: false };
    const templeName = adventure.getState().templeName || 'Templo Sagrado';
    return {
      selectedLevel: 0,
      levelInfo: {
        name: `Templo ${eng.temple}: ${templeName}`,
        shortName: `Campaña • Maestría EMA ${wasm.mastery_pct}%`,
        svgIcon: 'sparkles',
      },
      unlockedLevels: [],
      masteredLevels: [],
      currentMastery: wasm.mastery_pct,
      isCurrentMastered: Boolean(wasm.portal_ready),
      streak: wasm.streak,
      highestStreak: wasm.highest_streak,
      combo: this.campaignCombo,
      totalCombos: this.campaignCombos,
      diamondsEarned: this.walletDiamonds,
      inputMode: this.practice.inputMode,
      currentChallenge: eng.currentChallenge,
    };
  }

  syncCampaignUI() {
    try {
      const chipsRow = document.getElementById('math-level-chips');
      if (chipsRow) chipsRow.hidden = true;
      const templePill = document.getElementById('campaign-temple-pill');
      if (templePill) {
        templePill.hidden = false;
        templePill.textContent = `⚔️ Templo ${campaignEngine.temple}: ${adventure.getState().templeName || ''}`;
      }
    } catch {}
  }

  renderChallenge() {
    if (!campaignEngine.isReady) {
      return super.renderChallenge();
    }
    this.syncCampaignUI();
    const state = this.getCampaignViewState();
    const challenge = state.currentChallenge;
    if (!challenge) return;
    if (!this.renderHud(state)) return;
    this.resetChallengeVisuals();
    this.renderChallengeBody(challenge, state);
    this.startTimer();
  }

  // =========================================================================
  // Despacho al FSM WASM + economía JS + portal (fuente: campaign-engine)
  // =========================================================================
  async fetchResult(userAnswer, elapsedMs, wasShieldActive) {
    return this.submitCampaignAnswer(userAnswer, elapsedMs, wasShieldActive);
  }

  async afterSubmit(res) {
    if (res && res.portalReady && !this.portalOpened) {
      await this.openTemplePortal();
    }
  }

  nextChallenge() {
    if (!this.portalOpened) {
      campaignEngine.nextChallenge();
    }
  }

  /**
   * Despacha (respuesta, latencia) al motor WASM y devuelve un resultado
   * con la misma forma que el modo arcade para reutilizar todo el
   * feedback visual. La economía (diamantes/combo) es capa JS por diseño;
   * la maestría, la racha y el portal los dicta el motor.
   */
  async submitCampaignAnswer(userAnswer, elapsedMs, shieldActive) {
    const prev = campaignEngine.getState();
    const prevWasm = prev.wasm || { mastery_pct: 50, streak: 0, highest_streak: 0 };

    // Escudo de Zoe: absorbe el fallo sin manchar la sesión WASM.
    if (!this.isAnswerCorrect(userAnswer) && shieldActive) {
      this.streakShieldActive = false;
      return {
        isCorrect: false,
        shieldAbsorbed: true,
        streak: prevWasm.streak,
        highestStreak: prevWasm.highest_streak,
        combo: this.campaignCombo,
        comboBurst: false,
        totalCombos: this.campaignCombos,
        masteryGain: 0,
        currentMastery: prevWasm.mastery_pct,
        justMastered: false,
        newlyUnlockedLevel: null,
        masteredLevels: [],
        earnedDiamonds: 0,
        totalDiamonds: this.walletDiamonds,
        correctAnswer: prev.currentChallenge ? prev.currentChallenge.answer : userAnswer,
        portalReady: false,
        regressed: false,
        temple: prev.temple,
      };
    }

    const result = await campaignEngine.submitAnswer(userAnswer, elapsedMs);
    const wasm = result.wasm;

    let earnedDiamonds = 0;
    let comboBurst = false;
    if (result.isCorrect) {
      const agile = elapsedMs > 0 && elapsedMs <= 5000;
      earnedDiamonds = (agile ? 2 : 1) + (wasm.streak > 0 && wasm.streak % 3 === 0 ? 1 : 0);
      this.campaignCombo = Math.min(100, this.campaignCombo + (agile ? 25 : 20));
      if (this.campaignCombo >= 100) {
        comboBurst = true;
        this.campaignCombos += 1;
        earnedDiamonds += 10;
        this.campaignCombo = 0;
      }
      // La página suma a la billetera vía db.addDiamonds(res.earnedDiamonds).
    } else {
      this.campaignCombo = 0;
    }

    return {
      isCorrect: result.isCorrect,
      shieldAbsorbed: false,
      streak: wasm.streak,
      highestStreak: wasm.highest_streak,
      combo: this.campaignCombo,
      comboBurst,
      totalCombos: this.campaignCombos,
      masteryGain: 0,
      currentMastery: wasm.mastery_pct,
      justMastered: false,
      newlyUnlockedLevel: null,
      masteredLevels: [],
      earnedDiamonds,
      totalDiamonds: this.walletDiamonds,
      correctAnswer: campaignEngine.currentChallenge ? campaignEngine.currentChallenge.answer : userAnswer,
      portalReady: result.portalReady,
      regressed: wasm.tier_changed === -1,
      temple: result.temple,
    };
  }

  isAnswerCorrect(userAnswer) {
    const ch = this.getActiveChallenge();
    return ch ? Number(userAnswer) === ch.answer : false;
  }

  /** Abre el Desafío de Portal del templo vigente y cablea el avance. */
  async openTemplePortal() {
    const temple = campaignEngine.temple;
    this.portalOpened = true;
    try {
      sound.playLevelUp();
    } catch {}
    try {
      speech.speak(`¡El portal del Templo ${temple} se ha abierto! El guardián te espera.`);
    } catch {}

    portalController.openPortalChallenge(temple, async () => {
      // El portal-controller ya otorgó el cosmético: avanzar el FSM.
      const result = await campaignEngine.completePortal();
      this.portalOpened = false;
      this.renderChallenge();

      if (result.actClosed === 1 || result.actClosed === 2) {
        portalController.showActTransition(result.actClosed, result.advancedTo, async () => {
          this.renderChallenge();
        });
      } else if (result.victory) {
        portalController.showActTransition(3, 10, async () => {
          this.renderChallenge();
          try {
            speech.speak('¡Lumiria está a salvo! Has purificado los diez templos. La Emperatriz Eclipse vuelve a ser la Soberana Astral.');
          } catch {}
        });
      } else {
        try {
          speech.speak(`¡Templo purificado! Avanzas al Templo ${result.advancedTo}.`);
        } catch {}
      }
    });
  }
}
