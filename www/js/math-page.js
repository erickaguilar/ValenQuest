/**
 * ValenQuest: Controlador del Prisma Numérico (math-page.js)
 * Maneja la sesión independiente de cálculo mental con 5 niveles en caliente,
 * racha, combo astral, recompensas en Diamantes (💎) y poderes de amistad.
 * Homologado con reading-page.js.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { mathPractice, MATH_LEVELS } from './services/math-practice.js';
import { loadWasm, wasmLoader } from './services/wasm-loader.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

class MathPageController {
  constructor() {
    this.activeHeroineId = 'valen';
    this.isSubmitting = false;
    this.challengeStartTime = Date.now();
    this.streakShieldActive = false;
    this.starMultiplier = 1;
    this.keypadBuffer = '';
    this.isTimerFrozen = false;
    this.timerInterval = null;
  }

  async init() {
    console.log('💎 [ValenQuest] Inicializando Taller Matemático: El Prisma Numérico...');
    loadSvgSprites();

    // 1. Renderizar inmediatamente el reto inicial (sin esperar a red/DB/wasm)
    try {
      if (!mathPractice.currentChallenge) {
        mathPractice.generateChallenge();
      }
      this.renderChallenge();
    } catch (err) {
      console.error('MathPage: Error in initial render:', err);
    }

    // 2. Configurar eventos de cabecera y controles interactivos
    try { this.setupHeaderControls(); } catch (err) { console.warn(err); }
    try { this.setupLevelChips(); } catch (err) { console.warn(err); }
    try { this.setupLevelMasteryModal(); } catch (err) { console.warn(err); }
    try { this.setupInputModeToggle(); } catch (err) { console.warn(err); }
    try { this.setupKeypadButtons(); } catch (err) { console.warn(err); }
    try { this.setupPowersBadges(); } catch (err) { console.warn(err); }

    // 4. Cargar estado de las guardianas y perfil desde IndexedDB
    try {
      await companions.loadState();
      const profile = await db.getProfile();
      if (profile?.selectedCompanion) {
        this.activeHeroineId = profile.selectedCompanion;
      } else if (companions.activeId) {
        this.activeHeroineId = companions.activeId;
      }
      this.renderBalances(profile);
      this.updatePowersBadges();
    } catch (err) {
      console.warn('Error loading companions/profile in math page:', err);
    }

    // 5. Cargar estado del módulo de matemáticas
    try {
      await mathPractice.loadState();
      this.renderChallenge();
    } catch (err) {
      console.warn('Error loading math practice state:', err);
    }

    // 6. Cargar motor Rust WASM en segundo plano de manera no bloqueante
    try {
      const wasm = await loadWasm();
      if (wasm) {
        mathPractice.init(wasm);
        this.renderChallenge();
      }
    } catch (err) {
      console.log('Math practice using built-in JS challenge engine:', err?.message || err);
      this.renderChallenge();
    }

    // Saludo inicial de Orión
    speech.speak('¡Bienvenida a El Prisma Numérico! Elige tu nivel de cálculo y que la luz guíe tu camino.');
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

    document.querySelectorAll('#player-stars-count, #math-star-balance').forEach((el) => {
      el.textContent = stars;
    });
    document.querySelectorAll('#player-diamonds-count, #math-diamond-balance').forEach((el) => {
      el.textContent = diamonds;
    });
  }

  // =========================================================================
  // Selector de Niveles (Chips en Caliente 1..5 con Desbloqueo y Candados)
  // =========================================================================
  setupLevelChips() {
    const chips = document.querySelectorAll('.level-chip-btn');
    chips.forEach((chip) => {
      chip.addEventListener('click', async (e) => {
        const lvl = Number(e.currentTarget.dataset.level) || 1;
        const res = await mathPractice.setLevel(lvl);

        if (!res.success && res.reason === 'locked') {
          sound.playIncorrect();
          const targetBtn = e.currentTarget;
          targetBtn.classList.add('locked-shake');
          setTimeout(() => targetBtn.classList.remove('locked-shake'), 400);
          const prevLvl = Math.max(1, lvl - 1);
          speech.speak(`¡Este nivel aún duerme! Corona el Nivel ${prevLvl} al cien por ciento para abrirlo.`);
          return;
        }

        sound.playClick();
        this.keypadBuffer = '';
        this.renderChallenge();
        const info = mathPractice.getCurrentLevelInfo();
        speech.speak(`Nivel ${lvl}: ${info.name}. ${info.shortName}.`);
      });
    });
  }

  // =========================================================================
  // Modal de Coronación de Nivel y Desbloqueo de Santuarios
  // =========================================================================
  setupLevelMasteryModal() {
    const modal = document.getElementById('level-mastery-modal');
    const btnNext = document.getElementById('btn-mastery-next-level');
    const btnStay = document.getElementById('btn-mastery-stay');

    if (btnNext) {
      btnNext.addEventListener('click', async () => {
        sound.playClick();
        if (modal) modal.hidden = true;
        const currentLvl = mathPractice.selectedLevel;
        if (currentLvl < 5) {
          await mathPractice.setLevel(currentLvl + 1);
          this.keypadBuffer = '';
          this.renderChallenge();
          const info = mathPractice.getCurrentLevelInfo();
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

  // =========================================================================
  // Alternador de Modo de Entrada (Opciones vs Teclado)
  // =========================================================================
  setupInputModeToggle() {
    const btnToggle = document.getElementById('btn-toggle-math-mode');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        sound.playClick();
        const nextMode = mathPractice.inputMode === 'choice' ? 'keypad' : 'choice';
        mathPractice.setInputMode(nextMode);
        this.keypadBuffer = '';
        this.renderChallenge();
      });
    }
  }

  setupKeypadButtons() {
    const keypadGrid = document.getElementById('math-keypad-grid');
    if (keypadGrid) {
      keypadGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.math-keypad-btn');
        if (!btn) return;

        sound.playClick();
        const digit = btn.dataset.digit;

        if (digit === 'backspace') {
          this.keypadBuffer = this.keypadBuffer.slice(0, -1);
        } else if (digit === 'clear') {
          this.keypadBuffer = '';
        } else if (digit !== undefined) {
          if (this.keypadBuffer.length < 5) {
            this.keypadBuffer += digit;
          }
        }
        this.updateKeypadDisplay();
      });
    }

    const btnSubmitKeypad = document.getElementById('btn-keypad-submit');
    if (btnSubmitKeypad) {
      btnSubmitKeypad.addEventListener('click', () => {
        if (!this.keypadBuffer) return;
        this.submitAnswer(Number(this.keypadBuffer));
      });
    }
  }

  updateKeypadDisplay() {
    const preview = document.getElementById('math-preview-val');
    if (preview) {
      if (this.keypadBuffer) {
        preview.textContent = this.keypadBuffer;
        preview.className = 'math-input-box preview';
      } else {
        preview.textContent = '?';
        preview.className = 'math-input-box empty';
      }
    }
  }

  // =========================================================================
  // Renderizado del Reto Matemático
  // =========================================================================
  renderChallenge() {
    const state = mathPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    this.challengeStartTime = Date.now();

    // Limpiar efectos visuales y pista del Foco de Lía
    const liaBanner = document.getElementById('math-lia-banner');
    if (liaBanner) liaBanner.hidden = true;
    const opEl = document.getElementById('math-operator');
    if (opEl) opEl.className = 'math-operator';
    const op1El = document.getElementById('math-op1');
    if (op1El) op1El.className = 'math-op1';
    const op2El = document.getElementById('math-op2');
    if (op2El) op2El.className = 'math-op2';
    document.querySelectorAll('.math-choice-btn').forEach((b) => b.classList.remove('crystal-choice-hint'));

    // 1. Sincronizar título e info del nivel (HOMOLOGADO)
    const titleTag = document.getElementById('math-active-title');
    if (titleTag && state.levelInfo) {
      titleTag.textContent = `${state.levelInfo.icon} Nivel ${state.selectedLevel}: ${state.levelInfo.name} (${state.levelInfo.shortName})`;
    }

    // 2. Sincronizar racha, récord y diamantes en barra arcade
    const streakVal = document.getElementById('math-streak-val');
    if (streakVal) streakVal.textContent = state.streak;

    const recordVal = document.getElementById('math-record-val');
    if (recordVal) recordVal.textContent = state.highestStreak;

    const diamondsVal = document.getElementById('math-diamonds-val');
    if (diamondsVal) diamondsVal.textContent = state.diamondsEarned || 0;

    // 3. Sincronizar chips de nivel (bloqueo, coronación y estado activo)
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
        chip.innerHTML = '🔒';
        chip.title = `Nivel ${chipLvl} (Bloqueado: Corona el Nivel ${Math.max(1, chipLvl - 1)} al 100% para abrir)`;
      } else if (isMastered) {
        chip.innerHTML = `${chipLvl}<span>👑</span>`;
        chip.title = `Nivel ${chipLvl} (¡Coronado 100%! Puedes seguir practicando)`;
      } else {
        chip.innerHTML = `${chipLvl}`;
        chip.title = `Nivel ${chipLvl}`;
      }
    });

    // 4. Sincronizar Barra de Maestría del Nivel Actual (Meta: 50 aciertos base)
    const currentMastery = state.currentMastery || 0;
    const isCurrentMastered = state.isCurrentMastered || currentMastery >= 100;
    this.updateMasteryDisplay(currentMastery, isCurrentMastered);

    // 5. Sincronizar combo bar
    const comboPct = document.getElementById('math-combo-pct');
    const comboFill = document.getElementById('math-combo-fill');
    const comboBadge = document.getElementById('math-combo-badge');
    if (comboPct) comboPct.textContent = `${state.combo}%`;
    if (comboFill) comboFill.style.width = `${state.combo}%`;
    if (comboBadge) {
      comboBadge.textContent = state.totalCombos > 0 ? `⚡ x${state.totalCombos + 1}` : '⚡ x1';
    }

    // 5. Botón de narración por voz con Orión
    const btnSpeak = document.getElementById('btn-speak-challenge');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        sound.playClick();
        const speechText = challenge.expression && challenge.expression.length > 0
          ? `¿Cuánto es ${challenge.expression}?`
          : `¿Cuánto es ${challenge.op1} ${challenge.operator || 'más'} ${challenge.op2}?`;
        speech.speak(speechText);
      };
    }

    // 6. Botón de alternancia de modo
    const btnToggleMode = document.getElementById('btn-toggle-math-mode');
    if (btnToggleMode) {
      btnToggleMode.innerHTML = state.inputMode === 'choice'
        ? '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Usar Teclado 🔢</span>'
        : '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Opciones 🔘</span>';
    }

    // 7. Renderizar operación matemática en el display
    const op1El = document.getElementById('math-op1');
    const operatorEl = document.getElementById('math-operator');
    const op2El = document.getElementById('math-op2');
    const previewEl = document.getElementById('math-preview-val');

    if (challenge.expression && challenge.expression.length > 0) {
      if (op1El) op1El.textContent = challenge.expression;
      if (operatorEl) operatorEl.textContent = '';
      if (op2El) op2El.textContent = '';
    } else {
      if (op1El) op1El.textContent = challenge.op1;
      if (operatorEl) operatorEl.textContent = challenge.operator || '+';
      if (op2El) op2El.textContent = challenge.op2;
    }

    if (previewEl) {
      if (state.inputMode === 'keypad' && this.keypadBuffer) {
        previewEl.textContent = this.keypadBuffer;
        previewEl.className = 'math-input-box preview';
      } else {
        previewEl.textContent = '?';
        previewEl.className = 'math-input-box empty';
      }
    }

    // 8. Opciones Múltiples vs Teclado
    const optionsContainer = document.getElementById('math-options-container');
    const keypadContainer = document.getElementById('math-keypad-container');

    if (state.inputMode === 'choice') {
      if (optionsContainer) optionsContainer.hidden = false;
      if (keypadContainer) keypadContainer.hidden = true;

      const grid = document.getElementById('math-options-grid');
      if (grid && Array.isArray(challenge.options)) {
        grid.innerHTML = '';
        challenge.options.forEach((optNum) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'math-choice-btn';
          btn.textContent = optNum;
          btn.setAttribute('aria-label', `Opción ${optNum}`);

          // Preview interactivo al pasar el dedo o cursor
          btn.addEventListener('pointerenter', () => {
            if (!this.isSubmitting && state.inputMode === 'choice' && previewEl) {
              previewEl.textContent = optNum;
              previewEl.className = 'math-input-box preview';
            }
          });
          btn.addEventListener('pointerleave', () => {
            if (!this.isSubmitting && state.inputMode === 'choice' && previewEl) {
              previewEl.textContent = '?';
              previewEl.className = 'math-input-box empty';
            }
          });
          btn.addEventListener('focus', () => {
            if (!this.isSubmitting && state.inputMode === 'choice' && previewEl) {
              previewEl.textContent = optNum;
              previewEl.className = 'math-input-box preview';
            }
          });
          btn.addEventListener('blur', () => {
            if (!this.isSubmitting && state.inputMode === 'choice' && previewEl) {
              previewEl.textContent = '?';
              previewEl.className = 'math-input-box empty';
            }
          });

          btn.addEventListener('click', (e) => this.submitAnswer(optNum, e.currentTarget));
          grid.appendChild(btn);
        });
      }
    } else {
      if (optionsContainer) optionsContainer.hidden = true;
      if (keypadContainer) keypadContainer.hidden = false;
      this.updateKeypadDisplay();
    }

    // Iniciar cronómetro visual del reto actual
    this.startTimer();
  }

  // =========================================================================
  // Envío de Respuestas (Zero-Freeze con try-catch-finally)
  // =========================================================================
  async submitAnswer(userAnswer, buttonEl = null) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.stopTimer();

    const card = document.getElementById('math-challenge-card');
    const previewEl = document.getElementById('math-preview-val');
    const actualElapsed = Date.now() - this.challengeStartTime;
    const elapsedMs = this.isTimerFrozen ? 1500 : actualElapsed;

    // Mostrar inmediatamente el número elegido en la caja de respuesta
    if (previewEl) {
      previewEl.textContent = userAnswer;
      previewEl.className = 'math-input-box';
    }

    try {
      const res = await mathPractice.checkAnswer(userAnswer, elapsedMs);

      if (res.isCorrect) {
        // EFECTO EN VERDE: Caja de resultado, botón de opción y tarjeta
        if (previewEl) {
          previewEl.className = 'math-input-box correct';
        }
        if (buttonEl) buttonEl.classList.add('correct-choice');
        if (card) card.classList.add('correct-flash');

        // Otorgar Diamantes al perfil (IndexedDB)
        try {
          const newBalance = await db.addDiamonds(res.earnedDiamonds || 1);
          this.updateDiamondsDisplay(newBalance);
        } catch (e) {
          console.warn('Error saving diamonds in math:', e);
        }

        // Sincronizar barra arcade
        const diamondsVal = document.getElementById('math-diamonds-val');
        if (diamondsVal) diamondsVal.textContent = res.totalDiamonds;

        // Actualizar barra de maestría en caliente
        this.updateMasteryDisplay(
          res.currentMastery,
          res.currentMastery >= 100 || (res.masteredLevels && res.masteredLevels.includes(mathPractice.selectedLevel))
        );

        const comboPct = document.getElementById('math-combo-pct');
        const comboFill = document.getElementById('math-combo-fill');
        const comboBadge = document.getElementById('math-combo-badge');
        if (comboPct) comboPct.textContent = `${res.combo}%`;
        if (comboFill) comboFill.style.width = `${res.combo}%`;
        if (comboBadge) {
          comboBadge.textContent = res.totalCombos > 0 ? `⚡ x${res.totalCombos + 1}` : '⚡ x1';
        }

        // Ventaja de racha con princesas
        try {
          await companions.rewardStreak(res.streak, true);
          this.updatePowersBadges();
        } catch (e) {}

        if (res.justMastered) {
          if (res.comboBurst) {
            const comboWrapper = document.getElementById('math-combo-wrapper');
            if (comboWrapper) {
              comboWrapper.classList.add('combo-burst-burst');
              setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
            }
            mathPractice.resetCombo();
            if (comboPct) comboPct.textContent = '0%';
            if (comboFill) comboFill.style.width = '0%';
          }
          this.showLevelMasteryCelebration(res);
        } else if (res.comboBurst) {
          const comboWrapper = document.getElementById('math-combo-wrapper');
          if (comboWrapper) {
            comboWrapper.classList.add('combo-burst-burst');
            setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
          }
          try { sound.playLevelUp(); } catch (e) {}
          try { speech.speak('¡Súper Combo Astral completado! ¡Diez diamantes para tu ropero!'); } catch (e) {}

          await new Promise((resolve) => setTimeout(resolve, 800));
          mathPractice.resetCombo();
          if (comboPct) comboPct.textContent = '0%';
          if (comboFill) comboFill.style.width = '0%';
        } else if (res.streak > 0 && res.streak % 3 === 0) {
          try { sound.playStreak(); } catch (e) {}
          try { speech.speakPraise(res.streak); } catch (e) {}
        } else {
          try { sound.playCorrect(); } catch (e) {}
        }
      } else {
        if (previewEl) {
          previewEl.className = 'math-input-box incorrect';
        }
        if (buttonEl) buttonEl.classList.add('incorrect-choice');
        if (card) card.classList.add('incorrect-shake');
        try { sound.playIncorrect(); } catch (e) {}

        // Protección de Raíces de Zoe
        if (this.streakShieldActive) {
          this.streakShieldActive = false;
          try { sound.playStreak(); } catch (e) {}
          try { speech.speak('¡El Escudo de Zoe protegió tu racha de cálculo!'); } catch (e) {}
        }

        const streakVal = document.getElementById('math-streak-val');
        if (streakVal) streakVal.textContent = res.streak;
        const comboPct = document.getElementById('math-combo-pct');
        const comboFill = document.getElementById('math-combo-fill');
        if (comboPct) comboPct.textContent = '0%';
        if (comboFill) comboFill.style.width = '0%';
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.error('Error in math submitAnswer:', err);
    } finally {
      this.isSubmitting = false;
      this.isTimerFrozen = false;
      this.keypadBuffer = '';
      if (card) card.classList.remove('correct-flash', 'incorrect-shake');
      if (previewEl) previewEl.className = 'math-input-box empty';
      mathPractice.generateChallenge();
      this.renderChallenge();
    }
  }

  showLevelMasteryCelebration(res) {
    const modal = document.getElementById('level-mastery-modal');
    const subtitle = document.getElementById('level-mastery-subtitle');
    const rewardUnlockedCard = document.getElementById('reward-unlocked-card');
    const rewardUnlockedTitle = document.getElementById('reward-unlocked-title');
    const btnNext = document.getElementById('btn-mastery-next-level');

    const currentLevel = mathPractice.selectedLevel;
    const currentInfo = mathPractice.getCurrentLevelInfo();

    if (subtitle) {
      subtitle.innerHTML = `¡Has dominado el <strong>Nivel ${currentLevel}: ${currentInfo.name}</strong> al 100%!`;
    }

    if (res.newlyUnlockedLevel) {
      const nextInfo = MATH_LEVELS.find((l) => l.level === res.newlyUnlockedLevel);
      if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
      if (rewardUnlockedTitle && nextInfo) {
        rewardUnlockedTitle.textContent = `Nivel ${nextInfo.level}: ${nextInfo.name}`;
      }
      if (btnNext) btnNext.hidden = false;
    } else {
      if (currentLevel >= 5) {
        if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
        if (rewardUnlockedTitle) {
          rewardUnlockedTitle.textContent = '¡Has coronado todos los niveles del Prisma Numérico! 🌌';
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
        ? `¡Enhorabuena! Has coronado el Nivel ${currentLevel}. Se ha abierto el Nivel ${res.newlyUnlockedLevel} y recibes quince diamantes estelares para tu ropero.`
        : `¡Extraordinario! Has alcanzado la maestría máxima del Nivel ${currentLevel}. ¡Quince diamantes para ti!`;
      speech.speak(orionMsg);
    } catch (e) {}
  }

  updateDiamondsDisplay(diamonds) {
    document.querySelectorAll('#player-diamonds-count, #math-diamond-balance').forEach((el) => {
      el.textContent = diamonds;
    });

    const arcadeDiamonds = document.getElementById('math-diamonds-val');
    if (arcadeDiamonds) arcadeDiamonds.textContent = diamonds;
  }

  updateMasteryDisplay(currentMastery = 0, isCurrentMastered = false) {
    const masteryBadge = document.getElementById('math-mastery-badge');
    const masteryFill = document.getElementById('math-mastery-fill');
    const masteryStatus = document.getElementById('math-mastery-status');

    if (masteryBadge) masteryBadge.textContent = `${currentMastery}%`;
    if (masteryFill) {
      masteryFill.style.width = `${currentMastery}%`;
      masteryFill.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', currentMastery);
    }
    if (masteryStatus) {
      const approxCount = Math.min(50, Math.round(currentMastery / 2));
      if (isCurrentMastered || currentMastery >= 100) {
        masteryStatus.textContent = '👑 ¡Coronado! (50/50)';
      } else if (currentMastery >= 90) {
        masteryStatus.textContent = `🔥 ${approxCount}/50 aciertos`;
      } else if (currentMastery >= 60) {
        masteryStatus.textContent = `⚡ ${approxCount}/50 aciertos`;
      } else if (currentMastery >= 30) {
        masteryStatus.textContent = `🌟 ${approxCount}/50 aciertos`;
      } else if (currentMastery > 0) {
        masteryStatus.textContent = `🌱 ${approxCount}/50 aciertos`;
      } else {
        masteryStatus.textContent = '✨ 0/50 aciertos';
      }
    }
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
          if (badge) badge.textContent = '💎10';
          btn.title = `${heroine?.name || id} (0/2 cargas): ¡Toca para recargar por 10 diamantes 💎!`;
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
      speech.speak(result.reason || 'El poder no está disponible.');
      return;
    }

    sound.playStreak();
    speech.speak(`¡${result.powerName}! ${result.description}`);

    const card = document.getElementById('math-challenge-card');
    const btn = document.getElementById(`btn-power-${heroineId}`);
    if (btn) {
      btn.classList.add('power-activated');
      setTimeout(() => btn.classList.remove('power-activated'), 700);
    }

    if (heroineId === 'zoe') {
      this.streakShieldActive = true;
      if (card) {
        card.classList.add('shield-protect');
        setTimeout(() => card.classList.remove('shield-protect'), 1600);
      }
    } else if (heroineId === 'valen') {
      // Prisma: Descarta hasta dos opciones incorrectas
      if (card) {
        card.classList.add('royal-boost');
        setTimeout(() => card.classList.remove('royal-boost'), 1600);
      }
      const challenge = mathPractice.getState().currentChallenge;
      if (challenge) {
        const optionBtns = document.querySelectorAll('.math-choice-btn');
        let discardedCount = 0;
        optionBtns.forEach((btn) => {
          if (discardedCount < 2 && Number(btn.textContent) !== challenge.answer && !btn.disabled) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.textDecoration = 'line-through';
            discardedCount++;
          }
        });
      }
    } else if (heroineId === 'reni') {
      // Brisa Temporal: Congela el cronómetro y asegura el bono ágil
      this.freezeTimer();
      if (card) {
        card.classList.add('royal-boost');
        setTimeout(() => card.classList.remove('royal-boost'), 1600);
      }
      speech.speak('¡Brisa Temporal activada! Reni ha congelado el cronómetro: tus 2 diamantes y bonificación ágil están asegurados.');
    } else if (heroineId === 'lia') {
      // Foco de Cristal: Resaltado visual intenso en pantalla y banner
      this.activateLiaVisuals();
    }

    this.updatePowersBadges();
  }

  activateLiaVisuals() {
    const card = document.getElementById('math-challenge-card');
    if (card) {
      card.classList.add('crystal-focus');
      setTimeout(() => card.classList.remove('crystal-focus'), 1600);
    }

    const state = mathPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    // 1. Resaltar operador y operandos
    const opEl = document.getElementById('math-operator');
    const op1El = document.getElementById('math-op1');
    const op2El = document.getElementById('math-op2');
    if (opEl) opEl.classList.add('crystal-operator-pulse');
    if (op1El) op1El.classList.add('crystal-operand-glow');
    if (op2El) op2El.classList.add('crystal-operand-glow');

    // 2. Banner interactivo explicativo
    const liaBanner = document.getElementById('math-lia-banner');
    const clueText = document.getElementById('math-lia-clue-text');
    const op = challenge.operator || '+';

    let message = '';
    let speechMessage = '';
    if (op === '+') {
      message = `¡Foco de Lía! Operación SUMA (+): Junta ${challenge.op1} y ${challenge.op2}. ¡Cuenta hacia adelante desde el mayor para hallar el resultado!`;
      speechMessage = `¡Lía enfoca la operación! Es una suma: junta ${challenge.op1} más ${challenge.op2}.`;
    } else if (op === '-') {
      message = `¡Foco de Lía! Operación RESTA (−): A ${challenge.op1} le quitas ${challenge.op2}. ¡Cuenta hacia atrás para hallar la diferencia!`;
      speechMessage = `¡Lía enfoca la operación! Es una resta: a ${challenge.op1} le quitas ${challenge.op2}.`;
    } else if (op === '×' || op === '*') {
      message = `¡Foco de Lía! MULTIPLICACIÓN (×): Son ${challenge.op1} grupos de ${challenge.op2}.`;
      speechMessage = `¡Lía enfoca la operación! Es una multiplicación: son ${challenge.op1} veces ${challenge.op2}.`;
    } else {
      message = `¡Foco de Lía! Observa con calma la expresión: ${challenge.expression || ''}`;
      speechMessage = `¡Lía enfoca la expresión! Observa la pista en pantalla.`;
    }

    if (liaBanner && clueText) {
      clueText.textContent = message;
      liaBanner.hidden = false;
    }

    // 3. En modo opciones, resaltar sutilmente la respuesta correcta con aura de cristal
    if (state.inputMode === 'choice') {
      const optionBtns = document.querySelectorAll('.math-choice-btn');
      optionBtns.forEach((btn) => {
        if (Number(btn.textContent) === challenge.answer) {
          btn.classList.add('crystal-choice-hint');
        }
      });
    }

    speech.speak(speechMessage);
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
      speech.speak(`¡El poder de ${heroine.name} necesita ${RECHARGE_COST} diamantes para recargarse! Tienes ${currentDiamonds} diamantes. Sigue calculando para reunirlos.`);
      return;
    }

    // Descontar 10 diamantes
    const newBalance = await db.addDiamonds(-RECHARGE_COST);
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

    const wrap = document.getElementById('math-timer-bar-wrap');
    if (wrap) wrap.classList.remove('timer-frozen');

    const updateUI = () => {
      const fill = document.getElementById('math-timer-fill');
      const text = document.getElementById('math-timer-text');
      const status = document.getElementById('math-timer-status');
      const icon = document.getElementById('math-timer-icon');

      if (this.isTimerFrozen) {
        if (fill) fill.style.width = '100%';
        if (wrap) wrap.classList.add('timer-frozen');
        if (icon) icon.textContent = '❄️';
        if (text) text.textContent = 'Brisa de Reni: ¡Tiempo congelado! (+2 💎)';
        if (status) status.textContent = '❄️ Pausa';
        return;
      }

      const elapsed = Date.now() - this.challengeStartTime;
      const TOTAL_BONUS_MS = 4000;

      if (elapsed <= TOTAL_BONUS_MS) {
        const remaining = TOTAL_BONUS_MS - elapsed;
        const pct = Math.max(0, (remaining / TOTAL_BONUS_MS) * 100);
        if (fill) fill.style.width = `${pct}%`;
        if (wrap) wrap.classList.remove('timer-frozen');
        if (icon) icon.textContent = '⏱️';
        if (text) text.textContent = 'Brisa Ágil: +2 💎 (+25% combo)';
        if (status) status.textContent = `${(remaining / 1000).toFixed(1)}s`;
      } else {
        if (fill) fill.style.width = '0%';
        if (wrap) wrap.classList.remove('timer-frozen');
        if (icon) icon.textContent = '🍃';
        if (text) text.textContent = 'Modo Calma: +1 💎 (+20% combo)';
        if (status) status.textContent = '🍃 Sin prisa';
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
    const wrap = document.getElementById('math-timer-bar-wrap');
    const fill = document.getElementById('math-timer-fill');
    const text = document.getElementById('math-timer-text');
    const status = document.getElementById('math-timer-status');
    const icon = document.getElementById('math-timer-icon');

    if (wrap) wrap.classList.add('timer-frozen');
    if (fill) fill.style.width = '100%';
    if (icon) icon.textContent = '❄️';
    if (text) text.textContent = 'Brisa de Reni: ¡Tiempo congelado! (+2 💎)';
    if (status) status.textContent = '❄️ Pausa';
  }
}

// Inicialización automática y resiliente
const controller = new MathPageController();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
  });
} else {
  controller.init();
}
