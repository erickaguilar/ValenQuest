/**
 * ValenQuest: Controlador de la Pluma de la Fluidez (reading-page.js)
 * Maneja la sesión independiente de práctica lectora con 5 niveles en caliente,
 * racha, combo lírico, recompensas en Diamantes (💎) y poderes de amistad.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { readingPractice, READING_LEVELS } from './services/reading-practice.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

class ReadingPageController {
  constructor() {
    this.activeHeroineId = 'valen';
    this.isSubmitting = false;
    this.challengeStartTime = Date.now();
    this.rsvpTimer = null;
    this.isRsvpPlaying = false;
    this.streakShieldActive = false;
    this.starMultiplier = 1;
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
    try { this.setupPowersBadges(); } catch (err) { console.warn(err); }

    // 3. Cargar estado de las guardianas y perfil desde IndexedDB
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
      console.warn('Error loading companions/profile in reading page:', err);
    }

    // 4. Cargar estado del módulo de lectura desde IndexedDB (game_modules)
    try {
      await readingPractice.loadState();
      this.renderChallenge();
    } catch (err) {
      console.warn('Error loading reading practice state:', err);
    }

    // Saludo inicial de Orión
    speech.speak('¡Bienvenida a La Pluma de la Fluidez! Elige tu nivel y leamos juntos.');
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
    const starEl = document.getElementById('reading-star-balance');
    if (starEl) starEl.textContent = profile?.stars || 0;

    const diamondEl = document.getElementById('reading-diamond-balance');
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
        await readingPractice.setLevel(lvl);
        this.renderChallenge();
        const info = readingPractice.getCurrentLevelInfo();
        speech.speak(`Nivel ${lvl}: ${info.name}. ${info.shortName}.`);
      });
    });
  }

  // =========================================================================
  // Renderizado del Reto Lector
  // =========================================================================
  renderChallenge() {
    const state = readingPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    this.challengeStartTime = Date.now();

    // 1. Sincronizar título e info del nivel
    const titleTag = document.getElementById('reading-active-title');
    if (titleTag && state.levelInfo) {
      titleTag.textContent = `${state.levelInfo.icon || '💧'} Nivel ${state.selectedLevel}: ${state.levelInfo.name} (${state.levelInfo.shortName})`;
    }

    // 2. Sincronizar racha, récord y diamantes en barra arcade
    const streakVal = document.getElementById('reading-streak-val');
    if (streakVal) streakVal.textContent = state.streak;

    const recordVal = document.getElementById('reading-record-val');
    if (recordVal) recordVal.textContent = state.highestStreak;

    const diamondsVal = document.getElementById('reading-diamonds-val');
    if (diamondsVal) diamondsVal.textContent = state.diamondsEarned || 0;

    // 3. Sincronizar chips activos
    document.querySelectorAll('.level-chip-btn').forEach((chip) => {
      const chipLvl = Number(chip.dataset.level);
      chip.classList.toggle('active', chipLvl === state.selectedLevel);
    });

    // 4. Sincronizar combo bar
    const comboPct = document.getElementById('reading-combo-pct');
    const comboFill = document.getElementById('reading-combo-fill');
    const comboBadge = document.getElementById('reading-combo-badge');
    if (comboPct) comboPct.textContent = `${state.combo}%`;
    if (comboFill) comboFill.style.width = `${state.combo}%`;
    if (comboBadge) {
      comboBadge.textContent = state.totalCombos > 0 ? `⚡ x${state.totalCombos + 1}` : '⚡ x1';
    }

    // 5. Renderizar consigna
    const promptText = document.getElementById('challenge-prompt-text');
    if (promptText) {
      promptText.textContent = challenge.prompt;
    }

    // 6. Botón de narración por voz con Orión
    const btnSpeak = document.getElementById('btn-speak-challenge');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        sound.playClick();
        speech.speak(challenge.speakText || challenge.prompt);
      };
    }

    // 7. Renderizar contenido específico del nivel
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
          <div class="sentence-question">❓ ${challenge.question}</div>
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
              <div class="sentence-question" id="rsvp-question-tag" style="display:none;">❓ ${challenge.question}</div>
            </div>
          </div>
        `;
        this.setupRsvpInteractive(challenge.words);
      } else if (challenge.type === 'fable') {
        contentArea.innerHTML = `
          <div class="fable-box">
            <h4 class="fable-title"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg> ${challenge.title}</h4>
            <p class="fable-text">${challenge.text}</p>
            <div class="fable-question">❓ ${challenge.question}</div>
          </div>
        `;
      }
    }

    // 8. Renderizar opciones múltiples
    const optionsGrid = document.getElementById('reading-options-grid');
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
          box.textContent = '✨ ¡Lectura Completa!';
          if (questionTag) questionTag.style.display = 'block';
          btnPlay.disabled = false;
        }
      }, 380);
    });
  }

  // =========================================================================
  // Envío de Respuestas (Zero-Freeze con try-catch-finally)
  // =========================================================================
  async submitAnswer(userAnswer, buttonEl) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const card = document.getElementById('reading-challenge-card');
    const elapsedMs = Date.now() - this.challengeStartTime;

    try {
      const res = readingPractice.checkAnswer(userAnswer, elapsedMs);

      if (res.isCorrect) {
        if (buttonEl) buttonEl.classList.add('correct-choice');
        if (card) card.classList.add('correct-flash');

        // Otorgar Diamantes al perfil (IndexedDB)
        try {
          const newBalance = await db.addDiamonds(res.earnedDiamonds || 1);
          this.updateDiamondsDisplay(newBalance);
        } catch (e) {
          console.warn('Error saving diamonds in reading:', e);
        }

        // Sincronizar barra arcade
        const diamondsVal = document.getElementById('reading-diamonds-val');
        if (diamondsVal) diamondsVal.textContent = res.totalDiamonds;

        const comboPct = document.getElementById('reading-combo-pct');
        const comboFill = document.getElementById('reading-combo-fill');
        const comboBadge = document.getElementById('reading-combo-badge');
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
          const comboWrapper = document.getElementById('reading-combo-wrapper');
          if (comboWrapper) {
            comboWrapper.classList.add('combo-burst-burst');
            setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
          }
          try { sound.playLevelUp(); } catch (e) {}
          try { speech.speak('¡Súper Combo Lírico completado! ¡Diez diamantes para tu ropero!'); } catch (e) {}

          await new Promise((resolve) => setTimeout(resolve, 800));
          readingPractice.resetCombo();
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
        if (card) card.classList.add('incorrect-shake');
        try { sound.playIncorrect(); } catch (e) {}

        // Protección de Raíces de Zoe
        if (this.streakShieldActive) {
          this.streakShieldActive = false;
          try { sound.playStreak(); } catch (e) {}
          try { speech.speak('¡El Escudo de Zoe protegió tu racha de lectura!'); } catch (e) {}
        }

        const streakVal = document.getElementById('reading-streak-val');
        if (streakVal) streakVal.textContent = res.streak;
        const comboPct = document.getElementById('reading-combo-pct');
        const comboFill = document.getElementById('reading-combo-fill');
        if (comboPct) comboPct.textContent = '0%';
        if (comboFill) comboFill.style.width = '0%';
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.error('Error in reading submitAnswer:', err);
    } finally {
      this.isSubmitting = false;
      if (card) card.classList.remove('correct-flash', 'incorrect-shake');
      readingPractice.generateChallenge();
      this.renderChallenge();
    }
  }

  updateDiamondsDisplay(diamonds) {
    const headerDiamonds = document.getElementById('reading-diamond-balance');
    if (headerDiamonds) headerDiamonds.textContent = diamonds;

    const arcadeDiamonds = document.getElementById('reading-diamonds-val');
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

    const card = document.getElementById('reading-challenge-card');
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
      // Prisma: Descarta una opción incorrecta
      if (card) {
        card.classList.add('royal-boost');
        setTimeout(() => card.classList.remove('royal-boost'), 1600);
      }
      const challenge = readingPractice.getState().currentChallenge;
      if (challenge) {
        const optionBtns = document.querySelectorAll('.reading-choice-btn');
        let discarded = false;
        optionBtns.forEach((btn) => {
          if (!discarded && btn.textContent !== challenge.answer && !btn.disabled) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.textDecoration = 'line-through';
            discarded = true;
          }
        });
      }
    } else if (heroineId === 'reni') {
      // Brisa: Calma temporal
      if (card) {
        card.classList.add('royal-boost');
        setTimeout(() => card.classList.remove('royal-boost'), 1600);
      }
    } else if (heroineId === 'lia') {
      // Foco: Resalta la pista / palabra clave
      if (card) {
        card.classList.add('crystal-focus');
        setTimeout(() => card.classList.remove('crystal-focus'), 1600);
      }
      const promptArea = document.querySelector('.reading-prompt-display');
      if (promptArea) {
        promptArea.style.transform = 'scale(1.05)';
        promptArea.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          promptArea.style.transform = 'none';
        }, 1500);
      }
    }

    this.updatePowersBadges();
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
