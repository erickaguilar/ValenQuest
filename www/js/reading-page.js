/**
 * ValenQuest: Controlador de La Pluma de la Fluidez (reading-page.js)
 * Arena de lectura en español con 5 niveles, velocímetro RSVP,
 * fábulas y poderes de amistad.
 * Extiende ArenaPageController (lógica compartida con matemáticas).
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { readingPractice, READING_LEVELS } from './services/reading-practice.js';
import { loadWasm } from './services/wasm-loader.js';
import { loadSvgSprites } from './services/icons.js';
import { ArenaPageController } from './controllers/arena-base.js';

class ReadingPageController extends ArenaPageController {
  constructor() {
    super({
      prefix: 'reading',
      practice: readingPractice,
      levels: READING_LEVELS,
      maxLevel: 5,
      bonusMs: 6000,
      practiceVerb: 'leyendo',
      masteryTarget: readingPractice.targetAciertos || 30,
      comboBurstSpeech: '¡Súper Combo Lírico completado! ¡Diez diamantes para tu ropero!',
      crownedAllText: '¡Has coronado todos los santuarios de la Pluma de la Fluidez!',
      crownedAllIcon: 'reading',
      masteredWithNext: (lvl, next) => `¡Extraordinario! Has coronado el Nivel ${lvl}. Se ha abierto el Nivel ${next} y recibes quince diamantes para tu ropero.`,
      masteredSolo: (lvl) => `¡Maravilloso! Has alcanzado la maestría máxima del Nivel ${lvl}. ¡Quince diamantes para ti!`,
      lockSpeech: (prevLvl) => `¡Este santuario aún duerme! Corona el Nivel ${prevLvl} con tus aciertos para abrirlo.`,
      powerBusySpeech: 'El poder aún se está cargando con tu racha.',
      levelIconFallback: 'scroll',
      starsSelector: '#player-stars-count, #reading-star-balance',
      diamondsSelector: '#player-diamonds-count, #reading-diamond-balance',
    });
    this.isRsvpPlaying = false;
    this.rsvpTimer = null;
  }

  async init() {
    console.log('🪶 [ValenQuest] Inicializando Taller de Lectura: La Pluma de la Fluidez...');
    loadSvgSprites();

    // 1. Renderizar inmediatamente el reto inicial (sin esperar a red/DB)
    try {
      if (!readingPractice.currentChallenge) {
        readingPractice.generateChallenge();
      }
      this.renderChallenge();
    } catch (err) {
      console.error('ReadingPage: Error in initial render:', err);
    }

    // 2. Configurar eventos de cabecera y controles interactivos
    try { this.setupHeaderControls(); } catch (err) { console.warn(err); }
    try { this.setupLevelChips(); } catch (err) { console.warn(err); }
    try { this.setupLevelMasteryModal(); } catch (err) { console.warn(err); }
    try { this.setupPowersBadges(); } catch (err) { console.warn(err); }

    // 3. Cargar estado de las guardianas y perfil desde IndexedDB
    try {
      await this.loadCompanionsAndWallet();
    } catch (err) {
      console.warn('Error loading companions/profile in reading page:', err);
    }

    // 4. Cargar estado del módulo de lectura desde IndexedDB (game_modules)
    try {
      await readingPractice.loadState();
      this.renderChallenge();
    } catch (err) {
      console.warn('Error loading reading practice state:', err);
    }

    // 5. Cablear el motor Rust/WASM (silabeo RAE + WPM real) de forma no bloqueante
    try {
      const wasm = await loadWasm();
      if (wasm) {
        readingPractice.init(wasm);
        this.renderChallenge();
      }
    } catch (err) {
      console.log('Reading practice sin motor WASM (WPM aritmético):', err?.message || err);
      this.renderChallenge();
    }

    // Saludo inicial de Orión
    speech.speak('¡Bienvenida a La Pluma de la Fluidez! Elige tu nivel y leamos juntos.', { deferUntilActivation: true });
  }

  // =========================================================================
  // Banners previos a ocultar al renderizar
  // =========================================================================
  powerBannerIds() {
    return ['valen-banner', 'reni-banner', 'lia-banner'];
  }

  // =========================================================================
  // Renderizado del Reto Lector
  // =========================================================================
  renderTitle(state) {
    const titleTag = this.el('active-title');
    const activeIcon = document.getElementById('reading-active-icon');
    if (titleTag && state.levelInfo) {
      titleTag.textContent = state.levelInfo.name;
    }
    if (activeIcon && state.levelInfo) {
      activeIcon.setAttribute('href', `#vq-icon-${state.levelInfo.svgIcon || 'quill'}`);
    }
  }

  speakChallengeText(challenge) {
    return challenge.speakText || challenge.prompt;
  }

  renderChallenge() {
    const state = readingPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;
    if (!this.renderHud(state)) return;

    this.renderChallengeBody(challenge);
    this.startTimer();
  }

  renderChallengeBody(challenge) {
    // 6. Renderizar consigna
    const promptText = document.getElementById('challenge-prompt-text');
    if (promptText) {
      promptText.textContent = challenge.prompt;
    }

    // 8. Renderizar contenido específico del nivel
    const contentArea = document.getElementById('challenge-content-area');
    if (contentArea) {
      contentArea.innerHTML = '';

      if (challenge.type === 'syllables') {
        contentArea.innerHTML = `<div class="syllable-display">${challenge.displayHtml}</div>`;
      } else if (challenge.type === 'blend') {
        contentArea.innerHTML = `<div class="blend-display">${challenge.displayHtml}</div>`;
      } else if (challenge.type === 'sentence') {
        contentArea.innerHTML = `
          <div class="sentence-text">«${challenge.sentence}»</div>
          <div class="sentence-question"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>${challenge.question}</span></div>
        `;
      } else if (challenge.type === 'rsvp') {
        contentArea.innerHTML = `
          <div class="rsvp-stage">
            <div class="rsvp-word-box" id="rsvp-display-box">${challenge.words[0] || 'Listo'}</div>
            <div class="rsvp-controls-row">
              <button type="button" class="btn-rsvp-play" id="btn-play-rsvp-words">
                <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>
                <span>¡Iniciar Velocímetro!</span>
              </button>
              <div class="sentence-question" id="rsvp-question-tag" style="display:none;"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>${challenge.question}</span></div>
            </div>
          </div>
        `;
        this.setupRsvpInteractive(challenge.words);
      } else if (challenge.type === 'fable') {
        contentArea.innerHTML = `
          <div class="fable-box">
            <h4 class="fable-title"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg> ${challenge.title}</h4>
            <p class="fable-text">${challenge.text}</p>
            <div class="fable-question"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>${challenge.question}</span></div>
          </div>
        `;
      }
    }

    // 9. Renderizar opciones múltiples
    const optionsGrid = this.el('options-grid');
    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      challenge.options.forEach((optText) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reading-choice-btn';
        btn.textContent = optText;
        btn.addEventListener('click', (e) => this.submitAnswer(optText, e.currentTarget));
        optionsGrid.appendChild(btn);
      });
    }
  }

  // =========================================================================
  // RSVP Interactivo (Nivel 4)
  // =========================================================================
  setupRsvpInteractive(words) {
    const btnPlay = document.getElementById('btn-play-rsvp-words');
    const box = document.getElementById('rsvp-display-box');
    const questionTag = document.getElementById('rsvp-question-tag');
    if (!btnPlay || !box) return;

    btnPlay.addEventListener('click', () => {
      if (this.isRsvpPlaying) return;
      this.isRsvpPlaying = true;
      sound.playClick();
      btnPlay.disabled = true;

      let idx = 0;
      if (this.rsvpTimer) clearInterval(this.rsvpTimer);

      this.rsvpTimer = setInterval(() => {
        if (idx < words.length) {
          box.textContent = words[idx];
          try { sound.playClick(); } catch (e) {}
          idx++;
        } else {
          clearInterval(this.rsvpTimer);
          this.isRsvpPlaying = false;
          box.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>¡Lectura Completa!</span>';
          if (questionTag) questionTag.style.display = 'block';
          btnPlay.disabled = false;
        }
      }, 380);
    });
  }

  // =========================================================================
  // Poderes con pista lingüística (Valen, Reni, Lía)
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

    const state = readingPractice.getState();
    const challenge = state.currentChallenge;
    let discardedCount = 0;
    if (challenge && challenge.options) {
      const optionBtns = document.querySelectorAll('.reading-choice-btn');
      const ansTxt = (challenge.answer || '').trim().toLowerCase();
      optionBtns.forEach((btn) => {
        const btnTxt = btn.textContent.trim().toLowerCase();
        if (discardedCount < 2 && btnTxt !== ansTxt && !btn.disabled) {
          btn.disabled = true;
          btn.classList.add('prism-discarded');
          btn.setAttribute('aria-disabled', 'true');
          discardedCount++;
        } else if (btnTxt === ansTxt || !btn.disabled) {
          btn.classList.add('prism-blessed');
        }
      });
      if (clueText) {
        clueText.textContent = `¡Prisma Real de Valen! La luz refractó y desintegró ${discardedCount} opciones falsas. ¡Elige entre las restantes!`;
      }
    } else if (clueText) {
      clueText.textContent = '¡Prisma Real de Valen! La luz mágica despeja opciones incorrectas para encontrar la respuesta.';
    }

    speech.speak('¡Prisma Real de Valen! La luz descompone las ilusiones y desintegra opciones erróneas.');
  }

  activateReniVisuals() {
    this.freezeTimer();
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => card.classList.remove('royal-boost'), 1600);
    }

    const reniBanner = this.el('reni-banner');
    const clueText = this.el('reni-clue-text');
    if (reniBanner && clueText) {
      clueText.textContent = '¡Brisa Temporal de Reni! El tiempo se ha detenido en calma total: tus 2 diamantes y bonificación ágil están asegurados.';
      reniBanner.hidden = false;
      if (!reniBanner._closeBound) {
        reniBanner._closeBound = true;
        reniBanner.addEventListener('click', () => { reniBanner.hidden = true; });
      }
    }

    speech.speak('¡Brisa Temporal activada! Reni ha congelado el cronómetro: tus 2 diamantes y bonificación ágil están asegurados.');
  }

  activateLiaVisuals() {
    const card = this.el('challenge-card');
    if (card) {
      card.classList.add('crystal-focus');
      setTimeout(() => card.classList.remove('crystal-focus'), 1600);
    }

    const state = readingPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    // Resaltar elementos lingüísticos clave del reto
    const bubbles = document.querySelectorAll('.syllable-bubble, .syl, .blend-display span');
    bubbles.forEach((b) => b.classList.add('crystal-bubble-glow'));

    const sentences = document.querySelectorAll('.sentence-text, .sentence-question, .fable-title');
    sentences.forEach((s) => s.classList.add('crystal-word-glow'));

    // En modo de opciones, iluminar suavemente la respuesta correcta con aura de cristal
    const optionBtns = document.querySelectorAll('.reading-choice-btn');
    const ansTxt = (challenge.answer || '').trim().toLowerCase();
    optionBtns.forEach((btn) => {
      const btnTxt = btn.textContent.trim().toLowerCase();
      if (btnTxt === ansTxt) {
        btn.classList.add('crystal-choice-hint');
      }
    });

    const liaBanner = this.el('lia-banner');
    const clueText = this.el('lia-clue-text');

    let message = '';
    let speechMsg = '';
    if (challenge.type === 'syllables') {
      message = `¡Foco de Lía! Las sílabas se unen con su sonido musical. ¡Encuentra «${challenge.answer}»!`;
      speechMsg = `¡Lía enfoca el sonido de las sílabas! Observa la pista amatista resaltada.`;
    } else if (challenge.type === 'blend') {
      message = `¡Foco de Lía! Sigue la melodía de las letras para pronunciar «${challenge.answer}».`;
      speechMsg = `¡Lía enfoca el sonido! Fíjate en la pista amatista iluminada.`;
    } else if (challenge.type === 'sentence') {
      message = `¡Foco de Lía! Completa la idea mágica de la oración con la palabra que encaja.`;
      speechMsg = `¡Lía ilumina la oración! Lee con atención la pista en pantalla.`;
    } else if (challenge.type === 'rsvp') {
      message = `¡Foco de Lía! Las palabras pasaron veloces, ¡pero tu memoria de cristal recuerda la respuesta!`;
      speechMsg = `¡Lía ilumina el velocímetro lector! Observa la opción correcta.`;
    } else if (challenge.type === 'fable') {
      message = `¡Foco de Lía! La sabiduría de la fábula se revela en sus frases clave.`;
      speechMsg = `¡Lía enfoca la fábula! Lee la pista iluminada con atención.`;
    } else {
      message = `¡Foco de Lía! Iluminando la pista clave del reto.`;
      speechMsg = `¡Lía enfoca el reto! Observa la pista resaltada.`;
    }

    if (liaBanner && clueText) {
      clueText.textContent = message;
      liaBanner.hidden = false;
      if (!liaBanner._closeBound) {
        liaBanner._closeBound = true;
        liaBanner.addEventListener('click', () => { liaBanner.hidden = true; });
      }
    }

    speech.speak(speechMsg);
  }
}

// Inicialización automática y resiliente
const controller = new ReadingPageController();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    controller.init();
  });
} else {
  controller.init();
}
