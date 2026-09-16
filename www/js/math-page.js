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

class MathPageController {
  constructor() {
    this.activeHeroineId = 'valen';
    this.isSubmitting = false;
    this.challengeStartTime = Date.now();
    this.streakShieldActive = false;
    this.starMultiplier = 1;
    this.keypadBuffer = '';
  }

  async init() {
    console.log('💎 [ValenQuest] Inicializando Taller Matemático: El Prisma Numérico...');

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
  // Controles de Cabecera (Tema & Audio)
  // =========================================================================
  setupHeaderControls() {
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      theme.bindButton(themeBtn);
    }

    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        muteBtn.innerHTML = isMuted
          ? '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-off"></use></svg>'
          : '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>';
        muteBtn.title = isMuted ? 'Activar sonido' : 'Silenciar sonido';
      });
    }
  }

  syncThemeButton() {
    theme.syncButton();
  }

  renderBalances(profile) {
    const starEl = document.getElementById('math-star-balance');
    if (starEl) starEl.textContent = profile?.stars || 0;

    const diamondEl = document.getElementById('math-diamond-balance');
    if (diamondEl) diamondEl.textContent = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;
  }

  // =========================================================================
  // Selector de Niveles (Chips en Caliente 1..5)
  // =========================================================================
  setupLevelChips() {
    const chips = document.querySelectorAll('.level-chip-btn');
    chips.forEach((chip) => {
      chip.addEventListener('click', async (e) => {
        sound.playClick();
        const lvl = Number(e.currentTarget.dataset.level) || 1;
        await mathPractice.setLevel(lvl);
        this.keypadBuffer = '';
        this.renderChallenge();
        const info = mathPractice.getCurrentLevelInfo();
        speech.speak(`Nivel ${lvl}: ${info.name}. ${info.shortName}.`);
      });
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

    // 3. Sincronizar chips activos
    document.querySelectorAll('.level-chip-btn').forEach((chip) => {
      const chipLvl = Number(chip.dataset.level);
      chip.classList.toggle('active', chipLvl === state.selectedLevel);
    });

    // 4. Sincronizar combo bar
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
  }

  // =========================================================================
  // Envío de Respuestas (Zero-Freeze con try-catch-finally)
  // =========================================================================
  async submitAnswer(userAnswer, buttonEl = null) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const card = document.getElementById('math-challenge-card');
    const previewEl = document.getElementById('math-preview-val');
    const elapsedMs = Date.now() - this.challengeStartTime;

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

        if (res.comboBurst) {
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
      this.keypadBuffer = '';
      if (card) card.classList.remove('correct-flash', 'incorrect-shake');
      if (previewEl) previewEl.className = 'math-input-box empty';
      mathPractice.generateChallenge();
      this.renderChallenge();
    }
  }

  updateDiamondsDisplay(diamonds) {
    const headerDiamonds = document.getElementById('math-diamond-balance');
    if (headerDiamonds) headerDiamonds.textContent = diamonds;

    const arcadeDiamonds = document.getElementById('math-diamonds-val');
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
      modal.hidden = false;
      try { speech.speak('¡Aquí tienes la guía de poderes de Lumiria! Cada princesa te ayuda de una forma mágica.'); } catch (e) {}
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
      const badge = document.getElementById(`badge-${id}`);
      const btn = document.getElementById(`btn-power-${id}`);
      const charges = companions.getCharges(id);
      if (badge) badge.textContent = charges;
      if (btn) {
        btn.disabled = charges <= 0;
        btn.setAttribute('aria-disabled', charges <= 0 ? 'false' : 'true');
      }
    });
  }

  async handlePowerTrigger(heroineId) {
    sound.playClick();
    const result = companions.usePower(heroineId);
    if (!result.success) {
      speech.speak(result.reason || 'El poder aún se está cargando con tu racha.');
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
      // Brisa: Aliento y calma temporal
      if (card) {
        card.classList.add('royal-boost');
        setTimeout(() => card.classList.remove('royal-boost'), 1600);
      }
    } else if (heroineId === 'lia') {
      // Foco: Resalta la pista con destello de cristal
      if (card) {
        card.classList.add('crystal-focus');
        setTimeout(() => card.classList.remove('crystal-focus'), 1600);
      }
      const previewEl = document.getElementById('math-preview-val');
      if (previewEl) {
        previewEl.classList.add('preview');
        setTimeout(() => previewEl.classList.remove('preview'), 2000);
      }
    }

    this.updatePowersBadges();
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
