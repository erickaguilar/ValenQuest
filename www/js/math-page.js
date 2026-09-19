/**
 * ValenQuest: Controlador del Prisma Numérico (math-page.js)
 * Arena de cálculo mental con 5 niveles en caliente, racha, combo astral,
 * recompensas en Diamantes y poderes de amistad.
 * Extiende ArenaPageController (lógica compartida con lectura).
 * Homologado con reading-page.js.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { mathPractice, MATH_LEVELS } from './services/math-practice.js';
import { loadWasm } from './services/wasm-loader.js';
import { loadSvgSprites } from './services/icons.js';
import { ArenaPageController } from './controllers/arena-base.js';

export class MathPageController extends ArenaPageController {
  constructor() {
    super({
      prefix: 'math',
      practice: mathPractice,
      levels: MATH_LEVELS,
      maxLevel: 5,
      bonusMs: 5000,
      practiceVerb: 'calculando',
      masteryTarget: 50,
      comboBurstSpeech: '¡Súper Combo Astral completado! ¡Diez diamantes para tu ropero!',
      crownedAllText: '¡Has coronado todos los niveles del Prisma Numérico!',
      crownedAllIcon: 'galaxy',
      masteredWithNext: (lvl, next) => `¡Enhorabuena! Has coronado el Nivel ${lvl}. Se ha abierto el Nivel ${next} y recibes quince diamantes estelares para tu ropero.`,
      masteredSolo: (lvl) => `¡Extraordinario! Has alcanzado la maestría máxima del Nivel ${lvl}. ¡Quince diamantes para ti!`,
      lockSpeech: (prevLvl) => `¡Este nivel aún duerme! Corona el Nivel ${prevLvl} al cien por ciento para abrirlo.`,
      powerBusySpeech: 'El poder no está disponible.',
      levelIconFallback: 'sparkles',
      starsSelector: '#player-stars-count, #math-star-balance',
      diamondsSelector: '#player-diamonds-count, #math-diamond-balance',
    });
    this.keypadBuffer = '';
  }

  /** Reto vigente de la práctica arcade. */
  getActiveChallenge() {
    return mathPractice.getState().currentChallenge;
  }

  async init() {
    console.log('💎 [ValenQuest] Inicializando Taller Matemático: El Prisma Numérico...');
    loadSvgSprites();

    // Campaña OCULTA temporalmente: ?campaign=1 se ignora con aviso.
    // La Gran Aventura vive en controllers/campaign-arena.js (dormida).
    try {
      const wantsCampaign = new URLSearchParams(window.location.search).get('campaign') === '1';
      if (wantsCampaign) {
        window.history.replaceState({}, '', 'math.html');
        setTimeout(() => {
          try { speech.speak('La Gran Aventura abrirá muy pronto. Mientras tanto, practica en el Prisma Numérico.', { deferUntilActivation: true }); } catch {}
        }, 1200);
      }
    } catch {}

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
      await this.loadCompanionsAndWallet();
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
      this._wasm = wasm || null;
      if (wasm) {
        mathPractice.init(wasm);
        this.renderChallenge();
      }
    } catch (err) {
      console.log('Math practice using built-in JS challenge engine:', err?.message || err);
      this.renderChallenge();
    }

    // Saludo inicial de Orión
    speech.speak('¡Bienvenida a El Prisma Numérico! Elige tu nivel de cálculo y que la luz guíe tu camino.', { deferUntilActivation: true });
  }

  // =========================================================================
  // Banners previos a ocultar al renderizar
  // =========================================================================
  powerBannerIds() {
    return ['lia-banner', 'valen-banner'];
  }

  // =========================================================================
  // Renderizado del Reto Matemático
  // =========================================================================
  renderTitle(state) {
    const titleTag = this.el('active-title');
    if (titleTag && state.levelInfo) {
      const svgName = state.levelInfo.svgIcon || 'sparkles';
      titleTag.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-${svgName}"></use></svg> <span>${state.levelInfo.name}</span>`;
    }
  }

  speakChallengeText(challenge) {
    return challenge.expression && challenge.expression.length > 0
      ? `¿Cuánto es ${challenge.expression}?`
      : `¿Cuánto es ${challenge.op1} ${challenge.operator || 'más'} ${challenge.op2}?`;
  }

  renderChallenge() {
    const state = mathPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;
    if (!this.renderHud(state)) return;

    this.resetChallengeVisuals();
    this.renderChallengeBody(challenge, state);
    this.startTimer();
  }

  /** Limpia resaltados de poderes del reto anterior. */
  resetChallengeVisuals() {
    const opEl = this.el('operator');
    if (opEl) opEl.className = 'math-operator';

    const optionsGrid = this.el('options-grid');
    if (optionsGrid) {
      optionsGrid.classList.remove('lia-hint-grid-active');
    }
    document.querySelectorAll('.math-choice-btn').forEach((b) => {
      b.classList.remove('crystal-choice-hint', 'prism-discarded', 'prism-blessed');
    });
  }

  renderChallengeBody(challenge, state) {
    const op1El = this.el('op1');
    const opEl = this.el('operator');
    const op2El = this.el('op2');
    const previewEl = this.el('preview-val');

    // 6. Botón de alternancia de modo
    const btnToggleMode = document.getElementById('btn-toggle-math-mode');
    if (btnToggleMode) {
      btnToggleMode.innerHTML = state.inputMode === 'choice'
        ? '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-keypad"></use></svg> <span>Usar Teclado</span>'
        : '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bubble"></use></svg> <span>Opciones</span>';
    }

    // 7. Renderizar operación matemática en el display
    if (challenge.expression && challenge.expression.length > 0) {
      if (op1El) op1El.textContent = challenge.expression;
      if (opEl) opEl.textContent = '';
      if (op2El) op2El.textContent = '';
    } else {
      if (op1El) op1El.textContent = challenge.op1;
      if (opEl) opEl.textContent = challenge.operator || '+';
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

      const grid = this.el('options-grid');
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
  // Caja de respuesta y teclado numérico (solo mate)
  // =========================================================================
  showPendingAnswer(userAnswer) {
    const previewEl = this.el('preview-val');
    if (previewEl) {
      previewEl.textContent = userAnswer;
      previewEl.className = 'math-input-box';
    }
  }

  clearAnswerVisuals() {
    const previewEl = this.el('preview-val');
    if (previewEl) previewEl.className = 'math-input-box empty';
  }

  resetInput() {
    this.keypadBuffer = '';
  }

  afterLevelChange() {
    this.keypadBuffer = '';
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
    const preview = this.el('preview-val');
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
  // Poderes con pista numérica (Valen, Reni, Lía)
  // =========================================================================
  activateValenVisuals() {
    const card = this.el('challenge-card');
    if (card) {
      card.classList.remove('prism-rainbow-beam');
      void card.offsetWidth;
      card.classList.add('prism-rainbow-beam');
      setTimeout(() => card.classList.remove('prism-rainbow-beam'), 1600);
    }

    const valenBanner = this.el('valen-banner');
    const clueText = this.el('valen-clue-text');
    if (valenBanner && clueText) {
      valenBanner.hidden = false;
      if (!valenBanner._closeBound) {
        valenBanner._closeBound = true;
        valenBanner.addEventListener('click', () => { valenBanner.hidden = true; });
      }
    }

    const challenge = this.getActiveChallenge();
    const state = mathPractice.getState();

    let discardedCount = 0;
    if (challenge && state.inputMode === 'choice') {
      const optionBtns = document.querySelectorAll('.math-choice-btn');
      optionBtns.forEach((btn) => {
        if (discardedCount < 2 && Number(btn.textContent) !== challenge.answer && !btn.disabled) {
          btn.disabled = true;
          btn.classList.add('prism-discarded');
          btn.setAttribute('aria-disabled', 'true');
          discardedCount++;
        } else if (Number(btn.textContent) === challenge.answer || !btn.disabled) {
          btn.classList.add('prism-blessed');
        }
      });
      if (clueText) {
        clueText.textContent = `¡Prisma Real de Valen! La luz refractó y desintegró ${discardedCount} opciones falsas. ¡Elige entre las restantes!`;
      }
    } else if (clueText) {
      clueText.textContent = '¡Prisma Real de Valen! La luz mágica despeja tus pensamientos para calcular sin distracciones.';
    }

    speech.speak('¡Prisma Real de Valen! La luz descompone las ilusiones y desintegra opciones erróneas.');
  }

  activateReniVisuals() {
    // Brisa Temporal: Congela el cronómetro y asegura el bono ágil
    this.freezeTimer();
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => card.classList.remove('royal-boost'), 1600);
    }
    speech.speak('¡Brisa Temporal activada! Reni ha congelado el cronómetro: tus 2 diamantes y bonificación ágil están asegurados.');
  }

  activateLiaVisuals() {
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('crystal-focus');
      setTimeout(() => card.classList.remove('crystal-focus'), 1600);
    }

    const state = mathPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    // 1. Resaltar operador y operandos
    const opEl = this.el('operator');
    const op1El = this.el('op1');
    const op2El = this.el('op2');
    if (opEl) opEl.classList.add('crystal-operator-pulse');
    if (op1El) op1El.classList.add('crystal-operand-glow');
    if (op2El) op2El.classList.add('crystal-operand-glow');

    // 2. Banner interactivo explicativo
    const liaBanner = this.el('lia-banner');
    const clueText = this.el('lia-clue-text');
    const op = challenge.operator || '+';
    const hasUnknown = (challenge.expression || '').includes('?');

    let message = '';
    let speechMessage = '';
    if (hasUnknown) {
      message = `¡Foco de Lía! Hay un valor escondido: ${challenge.expression || ''}. ¡Despeja la incógnita con calma!`;
      speechMessage = '¡Lía enfoca la incógnita! Busca el número escondido.';
    } else if (op === '+') {
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
      if (!liaBanner._closeBound) {
        liaBanner._closeBound = true;
        liaBanner.style.cursor = 'pointer';
        liaBanner.title = 'Toca para cerrar esta pista';
        liaBanner.addEventListener('click', () => {
          liaBanner.hidden = true;
        });
      }
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
