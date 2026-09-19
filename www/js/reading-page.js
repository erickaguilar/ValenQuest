/**
 * ValenQuest: Controlador de la Pluma de la Fluidez (reading-page.js)
 * Maneja la sesión independiente de práctica lectora con 5 niveles en caliente,
 * bloqueo y desbloqueo progresivo por aciertos, maestría de nivel, modal de coronación,
 * racha, combo lírico, recompensas en Diamantes (💎) y poderes de amistad.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { readingPractice, READING_LEVELS } from './services/reading-practice.js';
import { loadWasm } from './services/wasm-loader.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

class ReadingPageController {
  constructor() {
    this.activeHeroineId = 'valen';
    this.isSubmitting = false;
    this.challengeStartTime = Date.now();
    this.rsvpTimer = null;
    // Billetera única: profile.diamonds es el SSOT.
    this.walletDiamonds = 0;
    this.isRsvpPlaying = false;
    this.streakShieldActive = false;
    this.starMultiplier = 1;
    this.isTimerFrozen = false;
    this.timerInterval = null;
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
      await companions.loadState();
      const profile = await db.getProfile();
      if (profile?.selectedCompanion) {
        this.activeHeroineId = profile.selectedCompanion;
      } else if (companions.activeId) {
        this.activeHeroineId = companions.activeId;
      }
      // Billetera única: el saldo del perfil manda en todas las barras.
      this.walletDiamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;
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
    const stars = profile?.stars || 0;
    const diamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;

    document.querySelectorAll('#player-stars-count, #reading-star-balance').forEach((el) => {
      el.textContent = stars;
    });
    document.querySelectorAll('#player-diamonds-count, #reading-diamond-balance').forEach((el) => {
      el.textContent = diamonds;
    });
  }

  // =========================================================================
  // Selector de Niveles (Chips en Caliente 1..5 con Bloqueo y Desbloqueo)
  // =========================================================================
  setupLevelChips() {
    const chips = document.querySelectorAll('.level-chip-btn');
    chips.forEach((chip) => {
      chip.addEventListener('click', async (e) => {
        const lvl = Number(e.currentTarget.dataset.level) || 1;
        const res = await readingPractice.setLevel(lvl);

        if (!res.success && res.reason === 'locked') {
          sound.playIncorrect();
          const targetBtn = e.currentTarget;
          targetBtn.classList.add('locked-shake');
          setTimeout(() => targetBtn.classList.remove('locked-shake'), 400);
          const prevLvl = Math.max(1, lvl - 1);
          speech.speak(`¡Este santuario aún duerme! Corona el Nivel ${prevLvl} con tus aciertos para abrirlo.`);
          return;
        }

        sound.playClick();
        this.renderChallenge();
        const info = readingPractice.getCurrentLevelInfo();
        speech.speak(`Nivel ${lvl}: ${info.name}. ${info.shortName}.`);
      });
    });
  }

  // =========================================================================
  // Modal de Coronación de Nivel Lector y Desbloqueo
  // =========================================================================
  setupLevelMasteryModal() {
    const modal = document.getElementById('level-mastery-modal');
    const btnNext = document.getElementById('btn-mastery-next-level');
    const btnStay = document.getElementById('btn-mastery-stay');

    if (btnNext) {
      btnNext.addEventListener('click', async () => {
        sound.playClick();
        if (modal) modal.hidden = true;
        const currentLvl = readingPractice.selectedLevel;
        if (currentLvl < 5) {
          await readingPractice.setLevel(currentLvl + 1);
          this.renderChallenge();
          const info = readingPractice.getCurrentLevelInfo();
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
  // Renderizado del Reto Lector
  // =========================================================================
  renderChallenge() {
    const state = readingPractice.getState();
    const challenge = state.currentChallenge;
    if (!challenge) return;

    this.challengeStartTime = Date.now();

    // 1. Sincronizar título e icono del nivel activo
    const titleTag = document.getElementById('reading-active-title');
    const activeIcon = document.getElementById('reading-active-icon');
    if (titleTag && state.levelInfo) {
      titleTag.textContent = state.levelInfo.name;
    }
    if (activeIcon && state.levelInfo) {
      activeIcon.setAttribute('href', `#vq-icon-${state.levelInfo.svgIcon || 'quill'}`);
    }

    // 2. Sincronizar racha, récord y diamantes en barra arcade
    const streakVal = document.getElementById('reading-streak-val');
    if (streakVal) streakVal.textContent = state.streak;

    const recordVal = document.getElementById('reading-record-val');
    if (recordVal) recordVal.textContent = state.highestStreak;

    const diamondsVal = document.getElementById('reading-diamonds-val');
    if (diamondsVal) diamondsVal.textContent = this.walletDiamonds;

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
        chip.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg>';
        chip.title = `Nivel ${chipLvl} (Bloqueado: Corona el Nivel ${Math.max(1, chipLvl - 1)} para abrir)`;
      } else if (isMastered) {
        chip.innerHTML = `${chipLvl}<span class="chip-crown-badge"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-crown"></use></svg></span>`;
        chip.title = `Nivel ${chipLvl} (¡Coronado 100%! Puedes seguir practicando)`;
      } else {
        chip.innerHTML = `${chipLvl}`;
        chip.title = `Nivel ${chipLvl}`;
      }
    });

    // 4. Sincronizar Barra de Maestría Lectora
    const currentMastery = state.currentMastery || 0;
    const isCurrentMastered = state.isCurrentMastered || currentMastery >= 100;
    this.updateMasteryDisplay(currentMastery, isCurrentMastered);

    // 5. Sincronizar barra de combo lírico
    const comboPct = document.getElementById('reading-combo-pct');
    const comboFill = document.getElementById('reading-combo-fill');
    const comboBadge = document.getElementById('reading-combo-badge');
    if (comboPct) comboPct.textContent = `${state.combo}%`;
    if (comboFill) comboFill.style.width = `${state.combo}%`;
    if (comboBadge) {
      const comboNum = state.totalCombos > 0 ? state.totalCombos + 1 : 1;
      comboBadge.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg> <span>x${comboNum}</span>`;
    }

    // Ocultar banners efímeros de poderes previos
    const valenBanner = document.getElementById('reading-valen-banner');
    if (valenBanner) valenBanner.hidden = true;
    const reniBanner = document.getElementById('reading-reni-banner');
    if (reniBanner) reniBanner.hidden = true;
    const liaBanner = document.getElementById('reading-lia-banner');
    if (liaBanner) liaBanner.hidden = true;

    // Sincronizar estado persistente del Escudo de Raíces de Zoe
    const card = document.getElementById('reading-challenge-card');
    const shieldBadge = document.getElementById('reading-shield-badge');
    const zoeBanner = document.getElementById('reading-zoe-banner');

    if (this.streakShieldActive) {
      if (card) card.classList.add('shield-protected');
      if (shieldBadge) {
        shieldBadge.hidden = false;
        shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>Protegida</span>';
      }
    } else {
      if (card) card.classList.remove('shield-protected', 'shield-absorbed-impact', 'prism-rainbow-beam', 'crystal-focus', 'royal-boost');
      if (shieldBadge) shieldBadge.hidden = true;
      if (zoeBanner && !zoeBanner._isAbsorbing) zoeBanner.hidden = true;
    }

    // 6. Renderizar consigna
    const promptText = document.getElementById('challenge-prompt-text');
    if (promptText) {
      promptText.textContent = challenge.prompt;
    }

    // 7. Botón de narración por voz con Orión
    const btnSpeak = document.getElementById('btn-speak-challenge');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        sound.playClick();
        speech.speak(challenge.speakText || challenge.prompt);
      };
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

    // Iniciar cronómetro visual del reto actual
    this.startTimer();
  }

  // =========================================================================
  // Actualización de la Barra de Maestría Lectora
  // =========================================================================
  updateMasteryDisplay(currentMastery = 0, isCurrentMastered = false) {
    const masteryBadge = document.getElementById('reading-mastery-badge');
    const masteryFill = document.getElementById('reading-mastery-fill');
    const masteryStatus = document.getElementById('reading-mastery-status');

    if (masteryBadge) masteryBadge.textContent = `${Math.round(currentMastery)}%`;
    if (masteryFill) {
      masteryFill.style.width = `${currentMastery}%`;
      masteryFill.closest('[role="progressbar"]')?.setAttribute('aria-valuenow', currentMastery);
    }
    if (masteryStatus) {
      const targetAciertos = readingPractice.targetAciertos || 30;
      const approxCount = Math.min(targetAciertos, Math.round((currentMastery / 100) * targetAciertos));
      if (isCurrentMastered || currentMastery >= 100) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-crown"></use></svg> <span>¡Coronado! (${targetAciertos}/${targetAciertos})</span>`;
      } else if (currentMastery >= 90) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-flame"></use></svg> <span>${approxCount}/${targetAciertos} aciertos</span>`;
      } else if (currentMastery >= 60) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg> <span>${approxCount}/${targetAciertos} aciertos</span>`;
      } else if (currentMastery >= 30) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg> <span>${approxCount}/${targetAciertos} aciertos</span>`;
      } else if (currentMastery > 0) {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg> <span>${approxCount}/${targetAciertos} aciertos</span>`;
      } else {
        masteryStatus.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>0/${targetAciertos} aciertos</span>`;
      }
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
  // Envío de Respuestas (Zero-Freeze con try-catch-finally)
  // =========================================================================
  async submitAnswer(userAnswer, buttonEl) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.stopTimer();

    const card = document.getElementById('reading-challenge-card');
    const actualElapsed = Date.now() - this.challengeStartTime;
    const elapsedMs = this.isTimerFrozen ? 1500 : actualElapsed;

    const wasShieldActive = Boolean(this.streakShieldActive);

    try {
      const res = readingPractice.checkAnswer(userAnswer, elapsedMs, {
        shieldActive: wasShieldActive,
        timerFrozen: this.isTimerFrozen,
      });

      if (res.isCorrect) {
        if (buttonEl) buttonEl.classList.add('correct-choice');
        if (card) card.classList.add('correct-flash');

        // Billetera única: otorgar al perfil y reflejar el saldo real.
        try {
          const newBalance = await db.addDiamonds(res.earnedDiamonds || 1);
          this.walletDiamonds = newBalance;
          this.updateDiamondsDisplay(newBalance);
        } catch (e) {
          console.warn('Error saving diamonds in reading:', e);
        }

        // Sincronizar barra arcade con la billetera
        const diamondsVal = document.getElementById('reading-diamonds-val');
        if (diamondsVal) diamondsVal.textContent = this.walletDiamonds;

        this.updateMasteryDisplay(
          res.currentMastery,
          res.currentMastery >= 100 || (res.masteredLevels && res.masteredLevels.includes(readingPractice.selectedLevel))
        );

        const comboPct = document.getElementById('reading-combo-pct');
        const comboFill = document.getElementById('reading-combo-fill');
        const comboBadge = document.getElementById('reading-combo-badge');
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
            const comboWrapper = document.getElementById('reading-combo-wrapper');
            if (comboWrapper) {
              comboWrapper.classList.add('combo-burst-burst');
              setTimeout(() => comboWrapper.classList.remove('combo-burst-burst'), 1200);
            }
            readingPractice.resetCombo();
            if (comboPct) comboPct.textContent = '0%';
            if (comboFill) comboFill.style.width = '0%';
          }
          this.showLevelMasteryCelebration(res);
        } else if (res.comboBurst) {
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

        // Protección heroica de Raíces de Zoe
        if (res.shieldAbsorbed) {
          this.streakShieldActive = false;
          if (card) {
            card.classList.remove('shield-protected', 'incorrect-shake');
            void card.offsetWidth;
            card.classList.add('shield-absorbed-impact');
            setTimeout(() => card.classList.remove('shield-absorbed-impact'), 1800);
          }

          const shieldBadge = document.getElementById('reading-shield-badge');
          if (shieldBadge) {
            shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>¡Absorbido!</span>';
            setTimeout(() => { if (shieldBadge) shieldBadge.hidden = true; }, 1600);
          }

          const zoeBanner = document.getElementById('reading-zoe-banner');
          const clueText = document.getElementById('reading-zoe-clue-text');
          const icon = document.getElementById('reading-zoe-banner-icon');
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

        const streakVal = document.getElementById('reading-streak-val');
        if (streakVal) streakVal.textContent = res.streak;
        const comboPct = document.getElementById('reading-combo-pct');
        const comboFill = document.getElementById('reading-combo-fill');
        if (comboPct) comboPct.textContent = `${res.combo}%`;
        if (comboFill) comboFill.style.width = `${res.combo}%`;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.error('Error in reading submitAnswer:', err);
    } finally {
      this.isSubmitting = false;
      this.isTimerFrozen = false;
      if (card) card.classList.remove('correct-flash', 'incorrect-shake');
      readingPractice.generateChallenge();
      this.renderChallenge();
    }
  }

  showLevelMasteryCelebration(res) {
    const modal = document.getElementById('level-mastery-modal');
    const subtitle = document.getElementById('level-mastery-subtitle');
    const rewardUnlockedCard = document.getElementById('reward-unlocked-card');
    const rewardUnlockedTitle = document.getElementById('reward-unlocked-title');
    const btnNext = document.getElementById('btn-mastery-next-level');

    const currentLevel = readingPractice.selectedLevel;
    const currentInfo = readingPractice.getCurrentLevelInfo();

    if (subtitle) {
      subtitle.innerHTML = `¡Has dominado el <strong>Nivel ${currentLevel}: ${currentInfo.name}</strong> al 100%!`;
    }

    if (res.newlyUnlockedLevel) {
      const nextInfo = READING_LEVELS.find((l) => l.level === res.newlyUnlockedLevel);
      if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
      if (rewardUnlockedTitle && nextInfo) {
        rewardUnlockedTitle.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-${nextInfo.svgIcon || 'scroll'}"></use></svg> <span>Nivel ${nextInfo.level}: ${nextInfo.name}</span>`;
      }
      if (btnNext) btnNext.hidden = false;
    } else {
      if (currentLevel >= 5) {
        if (rewardUnlockedCard) rewardUnlockedCard.hidden = false;
        if (rewardUnlockedTitle) {
          rewardUnlockedTitle.innerHTML = '<span>¡Has coronado todos los santuarios de la Pluma de la Fluidez!</span> <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-reading"></use></svg>';
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
        ? `¡Extraordinario! Has coronado el Nivel ${currentLevel}. Se ha abierto el Nivel ${res.newlyUnlockedLevel} y recibes quince diamantes para tu ropero.`
        : `¡Maravilloso! Has alcanzado la maestría máxima del Nivel ${currentLevel}. ¡Quince diamantes para ti!`;
      speech.speak(orionMsg);
    } catch (e) {}
  }

  updateDiamondsDisplay(diamonds) {
    document.querySelectorAll('#player-diamonds-count, #reading-diamond-balance').forEach((el) => {
      el.textContent = diamonds;
    });

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
      speech.speak(result.reason || 'El poder aún se está cargando con tu racha.');
      return;
    }

    sound.playStreak();
    speech.speak(`¡${result.powerName}! ${result.description}`);

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

  activateValenVisuals() {
    const card = document.getElementById('reading-challenge-card');
    if (card) {
      card.classList.remove('prism-rainbow-beam');
      void card.offsetWidth;
      card.classList.add('prism-rainbow-beam');
      setTimeout(() => card.classList.remove('prism-rainbow-beam'), 1600);
    }

    const valenBanner = document.getElementById('reading-valen-banner');
    const clueText = document.getElementById('reading-valen-clue-text');
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
    const card = document.getElementById('reading-challenge-card');
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => card.classList.remove('royal-boost'), 1600);
    }

    const reniBanner = document.getElementById('reading-reni-banner');
    const clueText = document.getElementById('reading-reni-clue-text');
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

  activateZoeVisuals() {
    this.streakShieldActive = true;
    const card = document.getElementById('reading-challenge-card');
    if (card) {
      card.classList.add('shield-protected');
    }

    const shieldBadge = document.getElementById('reading-shield-badge');
    if (shieldBadge) {
      shieldBadge.hidden = false;
      shieldBadge.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-shield"></use></svg> <span>Protegida</span>';
    }

    const zoeBanner = document.getElementById('reading-zoe-banner');
    const clueText = document.getElementById('reading-zoe-clue-text');
    const icon = document.getElementById('reading-zoe-banner-icon');
    if (zoeBanner && clueText) {
      if (icon) icon.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg>';
      clueText.textContent = '¡Escudo de Raíces de Zoe! Una barrera sagrada protegerá tu racha y combo ante cualquier tropiezo.';
      zoeBanner.hidden = false;
      if (!zoeBanner._closeBound) {
        zoeBanner._closeBound = true;
        zoeBanner.addEventListener('click', () => { zoeBanner.hidden = true; });
      }
    }

    speech.speak('¡Escudo de Raíces de Zoe activado! Una barrera sagrada protegerá tu racha y combo de cualquier tropiezo.');
  }

  activateLiaVisuals() {
    const card = document.getElementById('reading-challenge-card');
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

    const liaBanner = document.getElementById('reading-lia-banner');
    const clueText = document.getElementById('reading-lia-clue-text');

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
      speech.speak(`¡El poder de ${heroine.name} necesita ${RECHARGE_COST} diamantes para recargarse! Tienes ${currentDiamonds} diamantes. Sigue leyendo para reunirlos.`);
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

  // =========================================================================
  // Cronómetro Ágil y Modo Calma (Reni - 6 Segundos)
  // =========================================================================
  startTimer() {
    this.stopTimer();
    this.isTimerFrozen = false;

    const wrap = document.getElementById('reading-timer-bar-wrap');
    if (wrap) wrap.classList.remove('timer-frozen');

    const updateUI = () => {
      const fill = document.getElementById('reading-timer-fill');
      const text = document.getElementById('reading-timer-text');
      const status = document.getElementById('reading-timer-status');
      const icon = document.getElementById('reading-timer-icon');

      if (this.isTimerFrozen) {
        if (fill) fill.style.width = '100%';
        if (wrap) wrap.classList.add('timer-frozen');
        if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg>';
        if (text) text.innerHTML = 'Brisa de Reni (+2 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>)';
        if (status) status.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg> <span>Pausa</span>';
        return;
      }

      const elapsed = Date.now() - this.challengeStartTime;
      const TOTAL_BONUS_MS = 6000;

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
    const wrap = document.getElementById('reading-timer-bar-wrap');
    const fill = document.getElementById('reading-timer-fill');
    const text = document.getElementById('reading-timer-text');
    const status = document.getElementById('reading-timer-status');
    const icon = document.getElementById('reading-timer-icon');

    if (wrap) wrap.classList.add('timer-frozen');
    if (fill) fill.style.width = '100%';
    if (icon) icon.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg>';
    if (text) text.innerHTML = 'Brisa de Reni (+2 <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-gem"></use></svg>)';
    if (status) status.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-snowflake"></use></svg> <span>Pausa</span>';
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
