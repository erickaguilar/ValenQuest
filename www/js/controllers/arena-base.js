/**
 * ValenQuest: Arena Base Controller (controllers/arena-base.js)
 * Controlador compartido por las arenas de práctica (math-page, reading-page
 * y la campaña dormida). Centraliza lo idéntico: poderes, cronómetro,
 * insignias, diamantes (billetera única), chips de nivel, modal de
 * coronación, HUD y el esqueleto del envío de respuestas.
 *
 * Las páginas solo aportan:
 * - config (prefijo de ids, servicio, niveles y textos propios),
 * - renderTitle() / renderChallengeBody() / speakChallengeText(),
 * - activateValenVisuals() / activateLiaVisuals() (pistas por forma de reto),
 * - fetchResult() / nextChallenge() / hooks menores.
 */

import { sound } from '../services/audio.js';
import { speech } from '../services/speech.js';
import { db } from '../services/storage.js';
import { companions, HEROINES } from '../services/companions.js';
import { theme } from '../services/theme.js';

/** Ids compartidos por ambas arenas (sin prefijo math-/reading-). */
const SHARED_IDS = new Set([
  'btn-power-valen', 'btn-power-reni', 'btn-power-zoe', 'btn-power-lia',
  'badge-valen', 'badge-reni', 'badge-zoe', 'badge-lia',
  'powers-guide-modal', 'btn-powers-info', 'btn-close-powers-guide', 'btn-powers-guide-ok',
  'level-mastery-modal', 'level-mastery-title', 'level-mastery-subtitle',
  'reward-unlocked-card', 'reward-unlocked-title',
  'btn-mastery-next-level', 'btn-mastery-stay',
  'btn-speak-challenge', 'challenge-prompt-text',
]);

export class ArenaPageController {
  constructor({
    prefix,
    practice,
    levels,
    maxLevel = 5,
    bonusMs = 5000,
    practiceVerb = 'practicando',
    masteryTarget = 50,
    comboBurstSpeech = '¡Súper Combo completado! ¡Diez diamantes para tu ropero!',
    crownedAllText = '¡Has coronado todos los niveles!',
    crownedAllIcon = 'vq-icon-galaxy',
    masteredWithNext = (lvl, next) => `¡Enhorabuena! Has coronado el Nivel ${lvl}. Se ha abierto el Nivel ${next}.`,
    masteredSolo = (lvl) => `¡Extraordinario! Has alcanzado la maestría máxima del Nivel ${lvl}.`,
    lockSpeech = (prevLvl) => `¡Este nivel aún duerme! Corona el Nivel ${prevLvl} para abrirlo.`,
    powerBusySpeech = 'El poder no está disponible.',
    levelIconFallback = 'sparkles',
    starsSelector = '#player-stars-count',
    diamondsSelector = '#player-diamonds-count',
  }) {
    this.prefix = prefix;
    this.practice = practice;
    this.levels = levels;
    this.maxLevel = maxLevel;
    this.bonusMs = bonusMs;
    this.practiceVerb = practiceVerb;
    this.masteryTarget = masteryTarget;
    this.copy = { comboBurstSpeech, crownedAllText, crownedAllIcon, masteredWithNext, masteredSolo, lockSpeech, powerBusySpeech, levelIconFallback };
    this.selectors = { stars: starsSelector, diamonds: diamondsSelector };
    this.activeHeroineId = 'valen';
    this.isSubmitting = false;
    this.challengeStartTime = Date.now();
    this.streakShieldActive = false;
    this.starMultiplier = 1;
    this.isTimerFrozen = false;
    this.timerInterval = null;
    // Billetera única: profile.diamonds es el SSOT.
    this.walletDiamonds = 0;
  }

  /** Resuelve un id con o sin prefijo de arena. */
  el(name) {
    const id = SHARED_IDS.has(name) ? name : `${this.prefix}-${name}`;
    return document.getElementById(id);
  }

  // =========================================================================
  // Controles de Cabecera (Gestionados por el Web Component <vq-header>)
  // =========================================================================
  setupHeaderControls() {
    // Gestionado automáticamente por <vq-header>
  }

  syncThemeButton() {
    theme.syncButton();
  }

  renderBalances(profile) {
    const stars = profile?.stars || 0;
    const diamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;

    document.querySelectorAll(this.selectors.stars).forEach((el) => {
      el.textContent = stars;
    });
    document.querySelectorAll(this.selectors.diamonds).forEach((el) => {
      el.textContent = diamonds;
    });
  }

  /** Carga billetera + guardianas + perfil. Las páginas lo llaman en init(). */
  async loadCompanionsAndWallet() {
    await companions.loadState();
    const profile = await db.getProfile();
    if (profile?.selectedCompanion) {
      this.activeHeroineId = profile.selectedCompanion;
    } else if (companions.activeId) {
      this.activeHeroineId = companions.activeId;
    }
    this.walletDiamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;
    this.renderBalances(profile);
    this.updatePowersBadges();
    return profile;
  }

  // =========================================================================
  // Selector de Niveles (Chips en Caliente con Desbloqueo y Candados)
  // =========================================================================
  setupLevelChips() {
    const chips = document.querySelectorAll('.level-chip-btn');
    chips.forEach((chip) => {
      chip.addEventListener('click', async (e) => {
        // currentTarget se captura ANTES del await: tras la dispatch
        // el navegador lo pone a null (bug latente que rompía el shake).
        const targetBtn = e.currentTarget;
        const lvl = Number(targetBtn?.dataset.level) || 1;
        const res = await this.practice.setLevel(lvl);

        if (!res.success && res.reason === 'locked') {
          sound.playIncorrect();
          targetBtn.classList.add('locked-shake');
          setTimeout(() => targetBtn.classList.remove('locked-shake'), 400);
          const prevLvl = Math.max(1, lvl - 1);
          speech.speak(this.copy.lockSpeech(prevLvl));
          return;
        }

        sound.playClick();
        this.afterLevelChange();
        this.renderChallenge();
        const info = this.practice.getCurrentLevelInfo();
        speech.speak(`Nivel ${lvl}: ${info.name}. ${info.shortName}.`);
      });
    });
  }

  /** Hook tras cambiar de nivel (las páginas limpian buffers propios). */
  afterLevelChange() {}

  // =========================================================================
  // Modal de Coronación de Nivel y Desbloqueo
  // =========================================================================
  setupLevelMasteryModal() {
    const modal = this.el('level-mastery-modal');
    const btnNext = this.el('btn-mastery-next-level');
    const btnStay = this.el('btn-mastery-stay');

    if (btnNext) {
      btnNext.addEventListener('click', async () => {
        sound.playClick();
        if (modal) modal.hidden = true;
        const currentLvl = this.practice.selectedLevel;
        if (currentLvl < this.maxLevel) {
          await this.practice.setLevel(currentLvl + 1);
          this.afterLevelChange();
          this.renderChallenge();
          const info = this.practice.getCurrentLevelInfo();
          speech.speak(`¡Avanzando al Nivel ${info.level}: ${info.name}!`);
        }
      });
    }

    if (btnStay) {
      btnStay.addEventListener('click', () => {
        sound.playClick();
        if (modal) modal.hidden = true;
      });
    }

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        modal.hidden = true;
      }
    });
  }

  showLevelMasteryCelebration(res) {
    const modal = this.el('level-mastery-modal');
    const subtitle = this.el('level-mastery-subtitle');
    const rewardUnlockedCard = this.el('reward-unlocked-card');
    const rewardUnlockedTitle = this.el('reward-unlocked-title');
    const btnNext = this.el('btn-mastery-next-level');

    const currentLevel = this.practice.selectedLevel;
    const currentInfo = this.practice.getCurrentLevelInfo();

    if (subtitle) {
      subtitle.innerHTML = `¡Has dominado el <strong>Nivel ${currentLevel}: ${currentInfo.name}</strong> al 100%!`;
    }

    if (res.newlyUnlockedLevel) {
      const nextInfo = this.levels.find((l) => l.level === res.newlyUnlockedLevel);
      if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
      if (rewardUnlockedTitle && nextInfo) {
        rewardUnlockedTitle.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-${nextInfo.svgIcon || this.copy.levelIconFallback}"></use></svg> <span>Nivel ${nextInfo.level}: ${nextInfo.name}</span>`;
      }
      if (btnNext) btnNext.hidden = false;
    } else {
      if (currentLevel >= this.maxLevel) {
        if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
        if (rewardUnlockedTitle) {
          rewardUnlockedTitle.innerHTML = `<span>${this.copy.crownedAllText}</span> <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-${this.copy.crownedAllIcon}"></use></svg>`;
        }
        if (btnNext) btnNext.hidden = true;
      } else {
        if (rewardUnlockedCard) rewardUnlockedCard.hidden = true;
        if (btnNext) btnNext.hidden = false;
      }
    }

    if (modal) {
      modal.hidden = false;
    }

    try { sound.playLevelUp(); } catch (e) {}
    try { sound.playStreak(); } catch (e) {}
    try {
      const orionMsg = res.newlyUnlockedLevel
        ? this.copy.masteredWithNext(currentLevel, res.newlyUnlockedLevel)
        : this.copy.masteredSolo(currentLevel);
      speech.speak(orionMsg);
    } catch (e) {}
  }

  // =========================================================================
  // HUD compartido (título, racha, diamantes, chips, maestría, combo, voz)
  // =========================================================================
  renderHud(state) {
    const challenge = state.currentChallenge;
    if (!challenge) return false;

    this.challengeStartTime = Date.now();

    // Ocultar banners efímeros de poderes previos
    for (const id of this.powerBannerIds()) {
      const banner = this.el(id);
      if (banner) banner.hidden = true;
    }

    // Escudo de Zoe persistente
    const card = this.el('challenge-card');
    const shieldBadge = this.el('shield-badge');
    const zoeBanner = this.el('zoe-banner');
    if (this.streakShieldActive) {
      if (card) card.classList.add('shield-protected');
      if (shieldBadge) {
        shieldBadge.hidden = false;
        shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>Protegida</span>';
      }
    } else {
      if (card) card.classList.remove('shield-protected', 'shield-absorbed-impact');
      if (shieldBadge) shieldBadge.hidden = true;
      if (zoeBanner && !zoeBanner._isAbsorbing) zoeBanner.hidden = true;
    }

    this.renderTitle(state);

    const streakVal = this.el('streak-val');
    if (streakVal) streakVal.textContent = state.streak;

    const recordVal = this.el('record-val');
    if (recordVal) recordVal.textContent = state.highestStreak;

    const diamondsVal = this.el('diamonds-val');
    if (diamondsVal) diamondsVal.textContent = this.walletDiamonds;

    this.renderLevelChips(state);

    const currentMastery = state.currentMastery || 0;
    const isCurrentMastered = state.isCurrentMastered || currentMastery >= 100;
    this.updateMasteryDisplay(currentMastery, isCurrentMastered);

    const comboPct = this.el('combo-pct');
    const comboFill = this.el('combo-fill');
    const comboBadge = this.el('combo-badge');
    if (comboPct) comboPct.textContent = `${state.combo}%`;
    if (comboFill) comboFill.style.width = `${state.combo}%`;
    if (comboBadge) {
      const comboNum = state.totalCombos > 0 ? state.totalCombos + 1 : 1;
      comboBadge.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg> <span>x${comboNum}</span>`;
    }

    const btnSpeak = this.el('btn-speak-challenge');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        sound.playClick();
        speech.speak(this.speakChallengeText(challenge));
      };
    }

    return true;
  }

  /** Ids de banners a ocultar al renderizar (las páginas los listan). */
  powerBannerIds() {
    return [];
  }

  /** Título del nivel + icono (cada arena lo dibuja). */
  renderTitle(state) {}

  /** Texto para el botón de narración de Orión. */
  speakChallengeText(challenge) {
    return `Resuelve el reto: ${challenge.prompt || ''}`;
  }

  renderLevelChips(state) {
    const unlockedLevels = state.unlockedLevels || [1];
    const masteredLevels = state.masteredLevels || [];
    document.querySelectorAll('.level-chip-btn').forEach((chip) => {
      const chipLvl = Number(chip.dataset.level);
      const isUnlocked = unlockedLevels.includes(chipLvl);
      const isMastered = masteredLevels.includes(chipLvl);
      const isActive = chipLvl === state.selectedLevel;

      chip.classList.toggle('active', isActive);
      chip.classList.toggle('locked', !isUnlocked);
      chip.classList.toggle('mastered', isMastered);
      chip.setAttribute('aria-disabled', !isUnlocked ? 'true' : 'false');

      if (!isUnlocked) {
        chip.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg>';
        chip.title = `Nivel ${chipLvl} (Bloqueado: Corona el Nivel ${Math.max(1, chipLvl - 1)} al 100% para abrir)`;
        chip.setAttribute('aria-label', `Nivel ${chipLvl} bloqueado. Corona el Nivel ${Math.max(1, chipLvl - 1)} para abrirlo.`);
      } else if (isMastered) {
        chip.innerHTML = `${chipLvl}<span class="chip-crown-badge"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-crown"></use></svg></span>`;
        chip.title = `Nivel ${chipLvl} (¡Coronado 100%! Puedes seguir practicando)`;
      } else {
        chip.innerHTML = `${chipLvl}`;
        chip.title = `Nivel ${chipLvl}`;
      }
    });
  }

  updateMasteryDisplay(currentMastery = 0, isCurrentMastered = false) {
    const masteryBadge = this.el('mastery-badge');
    const masteryFill = this.el('mastery-fill');
    const masteryStatus = this.el('mastery-status');
    const target = this.masteryTarget;

    if (masteryBadge) masteryBadge.textContent = `${Math.round(currentMastery)}%`;
    if (masteryFill) {
      masteryFill.style.width = `${currentMastery}%`;
      masteryFill.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', currentMastery);
    }
    if (masteryStatus) {
      const approxCount = Math.min(target, Math.round((currentMastery / 100) * target));
      if (isCurrentMastered || currentMastery >= 100) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-crown"></use></svg> <span>¡Coronado! (${target}/${target})</span>`;
      } else if (currentMastery >= 90) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-flame"></use></svg> <span>${approxCount}/${target} aciertos</span>`;
      } else if (currentMastery >= 60) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg> <span>${approxCount}/${target} aciertos</span>`;
      } else if (currentMastery >= 30) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg> <span>${approxCount}/${target} aciertos</span>`;
      } else if (currentMastery > 0) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg> <span>${approxCount}/${target} aciertos</span>`;
      } else {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>0/${target} aciertos</span>`;
      }
    }
  }

  // =========================================================================
  // Envío de Respuestas (Zero-Freeze con try-catch-finally)
  // =========================================================================
  /** Fuente de respuestas: el servicio de práctica (la campaña lo sustituye). */
  async fetchResult(userAnswer, elapsedMs, wasShieldActive) {
    return this.practice.checkAnswer(userAnswer, elapsedMs, {
      shieldActive: wasShieldActive,
      timerFrozen: this.isTimerFrozen,
    });
  }

  /** Reto siguiente (la campaña lo sustituye cuando hay portal). */
  nextChallenge() {
    this.practice.generateChallenge();
  }

  /** Limpieza de entrada tras responder (el teclado de mate lo sustituye). */
  resetInput() {}

  /** Gancho tras responder correctamente (la campaña abre el portal). */
  async afterSubmit(res) {}

  /** Muestra la respuesta elegida al instante (mate: caja preview). */
  showPendingAnswer(userAnswer) {}

  /** Restaura la visualización de respuesta (mate: caja preview). */
  clearAnswerVisuals() {}

  async submitAnswer(userAnswer, buttonEl = null) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.stopTimer();

    const card = this.el('challenge-card');
    const actualElapsed = Date.now() - this.challengeStartTime;
    const elapsedMs = this.isTimerFrozen ? 1500 : actualElapsed;

    const wasShieldActive = Boolean(this.streakShieldActive);

    this.showPendingAnswer(userAnswer);

    try {
      const res = await this.fetchResult(userAnswer, elapsedMs, wasShieldActive);

      if (res.isCorrect) {
        if (buttonEl) buttonEl.classList.add('correct-choice');
        if (card) card.classList.add('correct-flash');

        // Billetera única: otorgar al perfil y reflejar el saldo real.
        try {
          const newBalance = await db.addDiamonds(res.earnedDiamonds || 1);
          this.walletDiamonds = newBalance;
          this.updateDiamondsDisplay(newBalance);
        } catch (e) {
          console.warn('Error saving diamonds:', e);
        }

        this.updateMasteryDisplay(
          res.currentMastery,
          res.currentMastery >= 100 || (res.masteredLevels && res.masteredLevels.includes(this.practice.selectedLevel))
        );

        const comboPct = this.el('combo-pct');
        const comboFill = this.el('combo-fill');
        const comboBadge = this.el('combo-badge');
        if (comboPct) comboPct.textContent = `${res.combo}%`;
        if (comboFill) comboFill.style.width = `${res.combo}%`;
        if (comboBadge) {
          const comboNum = res.totalCombos > 0 ? res.totalCombos + 1 : 1;
          comboBadge.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg> <span>x${comboNum}</span>`;
        }

        // Ventaja de racha con princesas
        try {
          await companions.rewardStreak(res.streak, true);
          this.updatePowersBadges();
        } catch (e) {}

        if (res.justMastered) {
          if (res.comboBurst) {
            const comboWrapper = this.el('combo-wrapper');
            if (comboWrapper) {
              comboWrapper.classList.add('combo-burst-burst');
              setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
            }
            this.practice.resetCombo();
            if (comboPct) comboPct.textContent = '0%';
            if (comboFill) comboFill.style.width = '0%';
          }
          this.showLevelMasteryCelebration(res);
        } else if (res.comboBurst) {
          const comboWrapper = this.el('combo-wrapper');
          if (comboWrapper) {
            comboWrapper.classList.add('combo-burst-burst');
            setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
          }
          try { sound.playLevelUp(); } catch (e) {}
          try { speech.speak(this.copy.comboBurstSpeech); } catch (e) {}

          await new Promise((resolve) => setTimeout(resolve, 800));
          this.practice.resetCombo();
          if (comboPct) comboPct.textContent = '0%';
          if (comboFill) comboFill.style.width = '0%';
        } else if (res.streak > 0 && res.streak % 3 === 0) {
          try { sound.playStreak(); } catch (e) {}
          try { speech.speakPraise(res.streak); } catch (e) {}
        } else {
          try { sound.playCorrect(); } catch (e) {}
        }
      } else {
        if (buttonEl) buttonEl.classList.add('incorrect-choice');

        // Protección heroica de Raíces de Zoe
        if (res.shieldAbsorbed) {
          this.streakShieldActive = false;
          if (card) {
            card.classList.remove('shield-protected', 'incorrect-shake');
            void card.offsetWidth;
            card.classList.add('shield-absorbed-impact');
            setTimeout(() => card.classList.remove('shield-absorbed-impact'), 1800);
          }

          const shieldBadge = this.el('shield-badge');
          if (shieldBadge) {
            shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>¡Absorbido!</span>';
            setTimeout(() => { if (shieldBadge) shieldBadge.hidden = true; }, 1600);
          }

          const zoeBanner = this.el('zoe-banner');
          const clueText = this.el('zoe-clue-text');
          const icon = this.el('zoe-banner-icon');
          if (zoeBanner && clueText) {
            zoeBanner._isAbsorbing = true;
            if (icon) icon.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-shield"></use></svg>';
            clueText.textContent = `¡El Escudo de Zoe resistió el impacto! Tu racha de ${res.streak} quedó 100% a salvo.`;
            zoeBanner.hidden = false;
            setTimeout(() => {
              zoeBanner._isAbsorbing = false;
              if (!this.streakShieldActive) zoeBanner.hidden = true;
            }, 3200);
          }

          try { sound.playStreak(); } catch (e) {}
          try { sound.playLevelUp(); } catch (e) {}
          try { speech.speak(`¡El Escudo de Raíces de Zoe absorbió el golpe! Tu racha de ${res.streak} continúa a salvo.`); } catch (e) {}
        } else {
          if (card) card.classList.add('incorrect-shake');
          try { sound.playIncorrect(); } catch (e) {}
        }

        const streakVal = this.el('streak-val');
        if (streakVal) streakVal.textContent = res.streak;
        const comboPct = this.el('combo-pct');
        const comboFill = this.el('combo-fill');
        if (comboPct) comboPct.textContent = `${res.combo}%`;
        if (comboFill) comboFill.style.width = `${res.combo}%`;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      await this.afterSubmit(res);
    } catch (err) {
      console.error('Error in submitAnswer:', err);
    } finally {
      this.isSubmitting = false;
      this.isTimerFrozen = false;
      this.resetInput();
      if (card) card.classList.remove('correct-flash', 'incorrect-shake');
      this.clearAnswerVisuals();
      this.nextChallenge();
      this.renderChallenge();
    }
  }

  updateDiamondsDisplay(diamonds) {
    document.querySelectorAll(this.selectors.diamonds).forEach((el) => {
      el.textContent = diamonds;
    });

    const arcadeDiamonds = this.el('diamonds-val');
    if (arcadeDiamonds) arcadeDiamonds.textContent = diamonds;
  }

  // =========================================================================
  // Poderes del Cuarteto de la Armonía (Prisma, Brisa, Escudo, Foco)
  // =========================================================================
  setupPowersBadges() {
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const btn = document.getElementById(`btn-power-${id}`);
      if (btn && !btn._powerBound) {
        btn._powerBound = true;
        btn.addEventListener('click', () => this.handlePowerTrigger(id));
      }
    });

    // Enlazar botones de recarga en el modal de guía de poderes
    document.querySelectorAll('.btn-guide-recharge').forEach((btn) => {
      if (!btn._rechargeBound) {
        btn._rechargeBound = true;
        btn.addEventListener('click', (e) => {
          const heroId = e.currentTarget.dataset.heroine;
          if (heroId) this.handlePowerRecharge(heroId);
        });
      }
    });

    this.setupPowersGuideModal();
    this.updatePowersBadges();
  }

  setupPowersGuideModal() {
    const btnInfo = document.getElementById('btn-powers-info');
    const modal = document.getElementById('powers-guide-modal');
    const btnClose = document.getElementById('btn-close-powers-guide');
    const btnOk = document.getElementById('btn-powers-guide-ok');

    if (!modal || modal._guideBound) return;
    modal._guideBound = true;

    const openModal = () => {
      sound.playClick();
      this.updatePowersBadges();
      modal.hidden = false;
      try { speech.speak('¡Aquí tienes la guía de poderes de Lumiria! Cada princesa te ayuda y puedes recargar sus cargas con 10 diamantes.'); } catch (e) {}
    };

    const closeModal = () => {
      sound.playClick();
      modal.hidden = true;
    };

    if (btnInfo) btnInfo.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnOk) btnOk.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  updatePowersBadges() {
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const heroine = HEROINES[id];
      const badge = document.getElementById(`badge-${id}`);
      const btn = document.getElementById(`btn-power-${id}`);
      const charges = companions.getCharges(id);

      // Actualizar modal de guía de poderes
      const guideLabel = document.getElementById(`guide-charges-${id}`);
      if (guideLabel) guideLabel.textContent = `Cargas: ${charges}/2`;
      const guideBtn = document.querySelector(`.btn-guide-recharge[data-heroine="${id}"]`);
      if (guideBtn) guideBtn.disabled = charges >= 2;

      if (btn) {
        btn.disabled = false; // Siempre interactivo para poder activar o recargar
        btn.setAttribute('aria-disabled', 'false');
        if (charges <= 0) {
          btn.classList.add('power-empty-rechargeable');
          if (badge) badge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>10';
          btn.title = `${heroine?.name || id} (0/2 cargas): ¡Toca para recargar por 10 diamantes!`;
        } else {
          btn.classList.remove('power-empty-rechargeable');
          if (badge) badge.textContent = charges;
          btn.title = `${heroine?.name || id} (${charges}/2 cargas): ${heroine?.powerName || ''}`;
        }
      }
    });
  }

  async handlePowerTrigger(heroineId) {
    sound.playClick();
    const currentCharges = companions.getCharges(heroineId);

    // Si tiene 0 cargas, activar directamente la recarga por 10 diamantes
    if (currentCharges <= 0) {
      return this.handlePowerRecharge(heroineId);
    }

    const result = companions.usePower(heroineId);
    if (!result.success) {
      speech.speak(result.reason || this.copy.powerBusySpeech);
      return;
    }

    sound.playStreak();
    speech.speak(`¡${result.powerName}! ${result.description}`);

    const card = this.el('challenge-card');
    const btn = document.getElementById(`btn-power-${heroineId}`);
    if (btn) {
      btn.classList.add('power-activated');
      setTimeout(() => btn.classList.remove('power-activated'), 700);
    }

    if (heroineId === 'zoe') {
      this.activateZoeVisuals();
    } else if (heroineId === 'valen') {
      this.activateValenVisuals();
    } else if (heroineId === 'reni') {
      this.activateReniVisuals();
    } else if (heroineId === 'lia') {
      this.activateLiaVisuals();
    }

    this.updatePowersBadges();
  }

  activateZoeVisuals() {
    this.streakShieldActive = true;
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('shield-protected');
    }

    const shieldBadge = this.el('shield-badge');
    if (shieldBadge) {
      shieldBadge.hidden = false;
      shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>Protegida</span>';
    }

    const zoeBanner = this.el('zoe-banner');
    const clueText = this.el('zoe-clue-text');
    const icon = this.el('zoe-banner-icon');
    if (zoeBanner && clueText) {
      if (icon) icon.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg>';
      clueText.textContent = '¡Escudo de Raíces de Zoe! Una barrera sagrada protegerá tu racha y combo ante cualquier fallo.';
      zoeBanner.hidden = false;
      if (!zoeBanner._closeBound) {
        zoeBanner._closeBound = true;
        zoeBanner.addEventListener('click', () => { zoeBanner.hidden = true; });
      }
    }

    speech.speak('¡Escudo de Raíces de Zoe activado! Una barrera sagrada protegerá tu racha y combo de cualquier tropiezo.');
  }

  /** Prisma Real: cada arena descarta según su forma de opciones. */
  activateValenVisuals() {}

  /** Brisa Temporal: cada arena congela y muestra su banner (o ninguno). */
  activateReniVisuals() {
    this.freezeTimer();
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => card.classList.remove('royal-boost'), 1600);
    }
    speech.speak('¡Brisa Temporal activada! Reni ha congelado el cronómetro: tus 2 diamantes y bonificación ágil están asegurados.');
  }

  /** Foco de Cristal: cada arena resalta su pista clave. */
  activateLiaVisuals() {}

  /** Muestra un banner de poder con cierre al toque (compartido). */
  showPowerBanner(bannerId, clueId, text) {
    const banner = this.el(bannerId);
    const clueText = this.el(clueId);
    if (banner && clueText) {
      clueText.textContent = text;
      banner.hidden = false;
      if (!banner._closeBound) {
        banner._closeBound = true;
        banner.style.cursor = 'pointer';
        banner.title = 'Toca para cerrar esta pista';
        banner.addEventListener('click', () => {
          banner.hidden = true;
        });
      }
    }
  }

  async handlePowerRecharge(heroineId) {
    sound.playClick();
    const heroine = HEROINES[heroineId];
    if (!heroine) return;

    const currentCharges = companions.getCharges(heroineId);
    if (currentCharges >= 2) {
      speech.speak(`¡${heroine.name} ya tiene sus 2 poderes cargados al máximo!`);
      return;
    }

    const RECHARGE_COST = 10;
    const profile = await db.getProfile();
    const currentDiamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;

    if (currentDiamonds < RECHARGE_COST) {
      sound.playIncorrect();
      const btn = document.getElementById(`btn-power-${heroineId}`);
      if (btn) {
        btn.classList.add('locked-shake');
        setTimeout(() => btn.classList.remove('locked-shake'), 400);
      }
      speech.speak(`¡El poder de ${heroine.name} necesita ${RECHARGE_COST} diamantes para recargarse! Tienes ${currentDiamonds} diamantes. Sigue ${this.practiceVerb} para reunirlos.`);
      return;
    }

    // Descontar 10 diamantes (billetera única)
    const newBalance = await db.addDiamonds(-RECHARGE_COST);
    this.walletDiamonds = newBalance;
    this.updateDiamondsDisplay(newBalance);
    await companions.rechargeHeroine(heroineId, 1);

    sound.playLevelUp();
    sound.playStreak();

    const btn = document.getElementById(`btn-power-${heroineId}`);
    if (btn) {
      btn.classList.add('power-recharged-burst');
      setTimeout(() => btn.classList.remove('power-recharged-burst'), 1000);
    }

    this.updatePowersBadges();
    speech.speak(`¡Amistad renovada! Has recargado el poder de ${heroine.name} con diez diamantes.`);
  }

  startTimer() {
    this.stopTimer();
    this.isTimerFrozen = false;

    const wrap = this.el('timer-bar-wrap');
    if (wrap) wrap.classList.remove('timer-frozen');

    const updateUI = () => {
      const fill = this.el('timer-fill');
      const text = this.el('timer-text');
      const status = this.el('timer-status');
      const icon = this.el('timer-icon');

      if (this.isTimerFrozen) {
        if (fill) fill.style.width = '100%';
        if (wrap) wrap.classList.add('timer-frozen');
        if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg>';
        if (text) text.innerHTML = 'Brisa de Reni (+2 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>)';
        if (status) status.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg> <span>Pausa</span>';
        return;
      }

      const elapsed = Date.now() - this.challengeStartTime;
      const TOTAL_BONUS_MS = this.bonusMs;

      if (elapsed <= TOTAL_BONUS_MS) {
        const remaining = TOTAL_BONUS_MS - elapsed;
        const pct = Math.max(0, (remaining / TOTAL_BONUS_MS) * 100);
        if (fill) fill.style.width = `${pct}%`;
        if (wrap) wrap.classList.remove('timer-frozen');
        if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-timer"></use></svg>';
        if (text) text.innerHTML = 'Brisa Ágil: +2 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>';
        if (status) status.textContent = `${(remaining / 1000).toFixed(1)}s`;
      } else {
        if (fill) fill.style.width = '0%';
        if (wrap) wrap.classList.remove('timer-frozen');
        if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg>';
        if (text) text.innerHTML = 'Modo Calma: +1 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>';
        if (status) status.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg> <span>Sin prisa</span>';
      }
    };

    updateUI();
    this.timerInterval = setInterval(updateUI, 50);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  freezeTimer() {
    this.isTimerFrozen = true;
    const wrap = this.el('timer-bar-wrap');
    const fill = this.el('timer-fill');
    const text = this.el('timer-text');
    const status = this.el('timer-status');
    const icon = this.el('timer-icon');

    if (wrap) wrap.classList.add('timer-frozen');
    if (fill) fill.style.width = '100%';
    if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg>';
    if (text) text.innerHTML = 'Brisa de Reni (+2 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>)';
    if (status) status.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg> <span>Pausa</span>';
  }
}
