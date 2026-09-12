/**
 * KidsLearn-WASM UI Lifecycle Orchestrator
 * Strictly decoupled: JS only manages the DOM, Web Audio, and event dispatching.
 * All logic, validation, mastery EMA, and syllabification reside in WebAssembly.
 */

import { loadWasm } from './wasm-loader.js';
import { sound } from './audio.js';
import { db } from './storage.js';
import { speech } from './speech.js';
import { companions } from './companions.js';
import { wardrobe } from './wardrobe.js';
import { pwa } from './pwa.js';

class KidsLearnApp {
  constructor() {
    this.wasm = null;
    this.mathSession = null;
    this.readingSession = null;
    this.currentStoryText = '';

    // UI State (DOM only)
    this.currentTab = 'intro';
    this.inputMode = 'choice'; // 'choice' or 'keypad'
    this.keypadBuffer = '';
    this.challengeStartTime = 0;
    this.rsvpTimer = null;
    this.rsvpIndex = 0;
    this.rsvpWords = [];
    this.rsvpWpm = 100;
    this.powerGatingTimer = null;
  }

  async init() {
    console.log('🌟 [ValenQuest] Initializing application in Lumiria...');

    // 1. Bind event listeners immediately so all buttons respond with zero delay
    this.setupEventListeners();
    this.syncThemeButton();

    try {
      this.wasm = await loadWasm();
      const profile = await db.getProfile();

      // Guarantee Level Up modal is strictly hidden on boot
      const levelModal = document.getElementById('level-up-modal');
      if (levelModal) levelModal.hidden = true;

      // Load persisted companion states & initialize wardrobe system
      await companions.loadState();
      wardrobe.init();

      // Hook speech synthesis speaking state to visual indicator
      speech.onSpeakingChange((speaking) => {
        const bubble = document.getElementById('intro-dialogue-bubble');
        if (bubble) bubble.classList.toggle('vq-anim-speaking', speaking);
        const speechBtn = document.getElementById('btn-toggle-speech');
        if (speechBtn) speechBtn.classList.toggle('vq-anim-speaking', speaking);
      });

      // Hook companion powers badges updates
      companions.onChange(() => this.updatePowersBadges());

      // Restore active heroine from profile if saved
      if (profile.selectedCompanion) {
        await companions.setActive(profile.selectedCompanion);
        document.querySelectorAll('.heroine-card').forEach((c) => {
          c.classList.toggle('active-companion', c.id === `card-heroine-${profile.selectedCompanion}`);
        });
      }
      companions.applyEquippedCosmeticsClasses();

      // Initialize Rust MathSession with high-entropy seed and saved tier
      const seed = BigInt(Date.now());
      this.mathSession = new this.wasm.MathSession(seed, profile.currentTier || 1);

      // Initialize Rust ReadingSession
      this.readingSession = new this.wasm.ReadingSession();

      this.updatePowersBadges();
      this.renderProfileHeader(profile);
      this.renderMathChallenge();
      this.renderReadingCatalog();

      // Ensure intro tab is active initially
      this.switchTab('intro');

      // Initialize PWA installation and Service Worker engine
      pwa.init();

      console.log('🚀 [ValenQuest] Application ready with Heroines Trio & Friendship Powers!');
    } catch (err) {
      console.error('Fatal initialization error:', err);
    }
  }

  /**
   * Cognitive Gating: Locks help buttons during initial seconds of a challenge
   * to ensure student reads and attempts the problem first.
   */
  startCognitiveGating(delayMs = 1800) {
    if (this.powerGatingTimer) {
      clearTimeout(this.powerGatingTimer);
      this.powerGatingTimer = null;
    }

    companions.setGated(true);

    const bar = document.querySelector('.companion-powers-bar');
    const label = document.querySelector('.powers-bar-label');
    const buttons = document.querySelectorAll('.power-btn');

    if (bar) bar.classList.add('powers-gated');
    if (label) label.innerHTML = '<span>⏳</span> <span>Observa...</span>';

    buttons.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add('power-gated');
      btn.setAttribute('aria-disabled', 'true');
    });

    this.powerGatingTimer = setTimeout(() => {
      companions.setGated(false);
      if (bar) bar.classList.remove('powers-gated');
      if (label) label.innerHTML = '<span>✨</span> <span>Poderes:</span>';

      buttons.forEach((btn) => {
        btn.classList.remove('power-gated');
        const id = btn.id.replace('btn-power-', '');
        const hasCharges = companions.getCharges(id) > 0;
        btn.disabled = !hasCharges;
        btn.setAttribute('aria-disabled', hasCharges ? 'false' : 'true');
      });
      this.powerGatingTimer = null;
    }, delayMs);
  }

  updatePowersBadges() {
    const isGated = companions.isPowerGated();
    ['valen', 'mia', 'zoe', 'lia'].forEach((id) => {
      const badge = document.getElementById(`badge-${id}`);
      const btn = document.getElementById(`btn-power-${id}`);
      const charges = companions.getCharges(id);
      if (badge) badge.textContent = charges;
      if (btn) {
        if (isGated) {
          btn.disabled = true;
          btn.classList.add('power-gated');
          btn.setAttribute('aria-disabled', 'true');
        } else {
          btn.disabled = charges <= 0;
          btn.classList.remove('power-gated');
          btn.setAttribute('aria-disabled', charges <= 0 ? 'false' : 'true');
        }
      }
    });
  }


  syncThemeButton() {
    const themeBtn = document.getElementById('btn-toggle-theme');
    const currentTheme =
      document.documentElement.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const isDark = currentTheme === 'dark';

    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);

    if (themeBtn) {
      themeBtn.textContent = isDark ? '☀️' : '🌙';
      themeBtn.title = isDark ? 'Cambiar a Modo Día Pastel' : 'Cambiar a Modo Noche Astral';
    }
  }



  // =========================================================================
  // Event Listeners & Input Handlers
  // =========================================================================
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Intro Navigation buttons
    const btnShowIntro = document.getElementById('btn-show-intro');
    if (btnShowIntro) {
      btnShowIntro.addEventListener('click', () => this.switchTab('intro'));
    }

    const btnStartQuest = document.getElementById('btn-start-quest');
    if (btnStartQuest) {
      btnStartQuest.addEventListener('click', () => {
        sound.playLevelUp();
        this.switchTab('math');
      });
    }

    const btnIntroMath = document.getElementById('btn-intro-goto-math');
    if (btnIntroMath) {
      btnIntroMath.addEventListener('click', () => {
        sound.playClick();
        this.switchTab('math');
      });
    }

    const btnIntroReading = document.getElementById('btn-intro-goto-reading');
    if (btnIntroReading) {
      btnIntroReading.addEventListener('click', () => {
        sound.playClick();
        this.switchTab('reading');
      });
    }


    // Audio mute toggle
    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        muteBtn.title = isMuted ? 'Activar sonido' : 'Silenciar sonido';
      });
    }

    // Dark Mode Theme Toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        sound.playClick();
        const currentTheme =
          document.documentElement.getAttribute('data-theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
        localStorage.setItem('vq-theme', nextTheme);
        this.syncThemeButton();
      });
    }


    // Native Speech Synthesis (TTS) Toggle
    const speechBtn = document.getElementById('btn-toggle-speech');
    if (speechBtn) {
      speechBtn.addEventListener('click', () => {
        sound.playClick();
        const isEnabled = speech.toggle();
        speechBtn.classList.toggle('active', isEnabled);
        speechBtn.title = isEnabled ? 'Voz del narrador activa' : 'Voz del narrador silenciada';
        if (isEnabled) {
          speech.speak('Voz mágica activada');
        }
      });
    }

    // Speak Intro Dialogue Button
    const btnSpeakIntro = document.getElementById('btn-speak-intro');
    if (btnSpeakIntro) {
      btnSpeakIntro.addEventListener('click', () => {
        sound.playClick();
        const text =
          'El Velo de la Duda ha desordenado los pergaminos de la Gran Biblioteca de las Constelaciones y borró las fórmulas de cristal. ¡Tú eres la heroína elegida para empuñar los artefactos celestiales y restaurar la luz estelar!';
        speech.speakDialogue(text);
      });
    }

    // Speak Math Challenge Button
    const btnSpeakMath = document.getElementById('btn-speak-math');
    if (btnSpeakMath) {
      btnSpeakMath.addEventListener('click', () => {
        sound.playClick();
        const op1 = this.mathSession.get_operand1();
        const op = this.mathSession.get_operator();
        const op2 = this.mathSession.get_operand2();
        speech.speakMath(op1, op, op2);
      });
    }

    // Speak Story Button
    const btnSpeakStory = document.getElementById('btn-speak-story');
    if (btnSpeakStory) {
      btnSpeakStory.addEventListener('click', () => {
        sound.playClick();
        if (this.currentStoryText) {
          speech.speakDialogue(this.currentStoryText);
        }
      });
    }

    // React to OS Dark Mode preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!localStorage.getItem('vq-theme')) {
        this.syncThemeButton();
      }
    });

    // Heroines Harmony Quartet Selection (Valen, Mia, Zoe, Lía)
    ['valen', 'mia', 'zoe', 'lia'].forEach((id) => {
      const card = document.getElementById(`card-heroine-${id}`);
      if (card) {
        card.addEventListener('click', () => {
          companions.setActive(id);
          document
            .querySelectorAll('.heroine-card')
            .forEach((c) => c.classList.remove('active-companion'));
          card.classList.add('active-companion');
          const hero = companions.getActive();
          sound.playClick();
          speech.speakDialogue(`¡Hola, soy ${hero.name}! ${hero.title}. ${hero.voiceQuote}`);
          const avatar = document.getElementById('student-avatar');
          const name = document.getElementById('student-name');
          if (avatar) avatar.textContent = hero.emoji;
          if (name) name.textContent = `${hero.name} (${hero.title})`;
        });
      }
    });

    // Companion In-Game Power Buttons (Valen, Mia, Zoe, Lía)
    ['valen', 'mia', 'zoe', 'lia'].forEach((id) => {
      const btn = document.getElementById(`btn-power-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const res = companions.activatePower(id, {
            mathSession: this.mathSession,
            app: this,
          });
          this.updatePowersBadges();
          if (res && res.success) {
            btn.classList.add('power-activated');
            setTimeout(() => btn.classList.remove('power-activated'), 700);
          }
        });
      }
    });

    // Input mode toggle (Multiple Choice vs Numeric Keypad)
    const modeToggle = document.getElementById('btn-toggle-mode');
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        sound.playClick();
        this.inputMode = this.inputMode === 'choice' ? 'keypad' : 'choice';
        modeToggle.textContent =
          this.inputMode === 'choice'
            ? '🔢 Usar teclado numérico'
            : '🔘 Usar opciones múltiples';
        this.renderInputArea();
      });
    }

    // Tactile On-screen Keypad delegation
    const keypad = document.getElementById('keypad-grid');
    if (keypad) {
      keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('.key-btn');
        if (!btn) return;
        sound.playClick();
        const action = btn.dataset.action;
        const val = btn.dataset.val;

        if (action === 'backspace') {
          this.keypadBuffer = this.keypadBuffer.slice(0, -1);
          this.updateKeypadDisplay();
        } else if (action === 'submit') {
          this.handleKeypadSubmit();
        } else if (val !== undefined) {
          if (this.keypadBuffer.length < 3) {
            this.keypadBuffer += val;
            this.updateKeypadDisplay();
          }
        }
      });
    }

    // Physical keyboard listener for accessibility
    window.addEventListener('keydown', (e) => {
      if (this.currentTab !== 'math') return;

      if (e.key >= '0' && e.key <= '9') {
        sound.playClick();
        if (this.inputMode !== 'keypad') {
          this.inputMode = 'keypad';
          this.renderInputArea();
        }
        if (this.keypadBuffer.length < 3) {
          this.keypadBuffer += e.key;
          this.updateKeypadDisplay();
        }
      } else if (e.key === 'Backspace') {
        sound.playClick();
        this.keypadBuffer = this.keypadBuffer.slice(0, -1);
        this.updateKeypadDisplay();
      } else if (e.key === 'Enter') {
        if (this.keypadBuffer.length > 0) {
          this.handleKeypadSubmit();
        }
      }
    });

    // Level up modal dismiss
    const dismissModalBtn = document.getElementById('btn-modal-dismiss');
    if (dismissModalBtn) {
      dismissModalBtn.addEventListener('click', () => {
        sound.playClick();
        document.getElementById('level-up-modal').hidden = true;
      });
    }

    // Reading controls
    const btnPlayRsvp = document.getElementById('btn-play-rsvp');
    if (btnPlayRsvp) {
      btnPlayRsvp.addEventListener('click', () => this.toggleRsvp());
    }

    const rsvpSpeedSlider = document.getElementById('rsvp-speed');
    if (rsvpSpeedSlider) {
      rsvpSpeedSlider.addEventListener('input', (e) => {
        this.rsvpWpm = parseInt(e.target.value, 10);
        document.getElementById('wpm-display').textContent = `${this.rsvpWpm} PPM`;
        if (this.rsvpTimer) {
          this.stopRsvp();
          this.startRsvp();
        }
      });
    }
  }

  switchTab(tab) {
    sound.playClick();
    this.currentTab = tab;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const introSec = document.getElementById('intro-section');
    const mathSec = document.getElementById('math-section');
    const readSec = document.getElementById('reading-section');

    if (introSec) introSec.hidden = tab !== 'intro';
    if (mathSec) mathSec.hidden = tab !== 'math';
    if (readSec) readSec.hidden = tab !== 'reading';

    if (tab === 'reading' && this.rsvpTimer) {
      this.stopRsvp();
    }
  }


  // =========================================================================
  // Math Game Engine Integration
  // =========================================================================
  renderMathChallenge() {
    this.challengeStartTime = performance.now();
    this.keypadBuffer = '';
    this.updateKeypadDisplay();

    // Cognitive gating: lock powers during initial reading window (1.8s)
    this.startCognitiveGating(1800);

    // Query Rust WASM state
    const op1 = this.mathSession.get_operand1();
    const op2 = this.mathSession.get_operand2();
    const op = this.mathSession.get_operator();
    const tier = this.mathSession.get_tier();
    const tierName = this.mathSession.get_tier_name();
    const streak = this.mathSession.get_streak();
    const masteryPct = this.mathSession.get_mastery_percentage();

    // Update DOM indicators
    document.getElementById('math-op1').textContent = op1;
    document.getElementById('math-op2').textContent = op2;
    document.getElementById('math-operator').textContent = op;

    document.getElementById('tier-badge-text').textContent = tierName;
    document.getElementById('streak-count').textContent = streak;
    document.getElementById('mastery-pct').textContent = `${masteryPct}%`;
    document.getElementById('mastery-bar-fill').style.width = `${masteryPct}%`;

    const flameBadge = document.getElementById('streak-badge');
    flameBadge.classList.toggle('active-flame', streak >= 3);

    this.renderInputArea();
  }

  renderInputArea() {
    const choiceContainer = document.getElementById('options-grid');
    const keypadContainer = document.getElementById('keypad-wrapper');

    if (this.inputMode === 'choice') {
      choiceContainer.hidden = false;
      keypadContainer.hidden = true;

      // Parse distractors generated deterministically in Rust
      const optionsJson = this.mathSession.get_options_json();
      const options = JSON.parse(optionsJson);

      choiceContainer.innerHTML = '';
      options.forEach((optVal) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = optVal;
        btn.setAttribute('aria-label', `Opción ${optVal}`);
        btn.addEventListener('click', () => {
          this.submitAnswer(optVal);
        });
        choiceContainer.appendChild(btn);
      });
    } else {
      choiceContainer.hidden = true;
      keypadContainer.hidden = false;
    }
  }

  updateKeypadDisplay() {
    const display = document.getElementById('math-answer-preview');
    if (this.keypadBuffer.length > 0) {
      display.textContent = this.keypadBuffer;
      display.classList.remove('empty');
    } else {
      display.textContent = '?';
      display.classList.add('empty');
    }
  }

  handleKeypadSubmit() {
    if (!this.keypadBuffer) return;
    const num = parseInt(this.keypadBuffer, 10);
    if (!Number.isNaN(num)) {
      this.submitAnswer(num);
    }
  }

  /**
   * Dispatches user answer and elapsed latency to Rust WASM engine
   */
  async submitAnswer(userAnswer) {
    const elapsedMs = Math.round(performance.now() - this.challengeStartTime);

    // Call Rust WASM: updates EMA mastery, streaks, and FSM tier transitions
    const isCorrect = this.mathSession.submit_answer(userAnswer, elapsedMs);
    const tierChanged = this.mathSession.get_tier_changed();
    const currentStreak = this.mathSession.get_streak();

    const card = document.getElementById('math-challenge-card');

    if (isCorrect) {
      card.classList.add('correct-flash');
      await companions.rewardStreak(currentStreak);
      this.updatePowersBadges();

      // Calculation of Stars:
      // Agile performance (<=4000ms): 2 stars; thoughtful/hesitant: 1 star.
      // Streak milestone bonus: Every 3 streak grants +1 bonus star!
      // Lía's Royal Flare: Multiplies earned stars (2x) when activated!
      const baseStars = elapsedMs <= 4000 ? 2 : 1;
      const isStreakMilestone = currentStreak > 0 && currentStreak % 3 === 0;
      const streakBonus = isStreakMilestone ? 1 : 0;
      const multiplier = this.starMultiplier || 1;
      const earnedStars = (baseStars + streakBonus) * multiplier;
      this.starMultiplier = 1; // Reset multiplier after successful challenge

      const newStarsBalance = await db.addStars(earnedStars);
      this.updateStarsDisplay(newStarsBalance);

      if (isStreakMilestone) {
        sound.playStreak();
        speech.speakPraise(currentStreak);
      } else {
        sound.playCorrect();
      }
    } else {
      // Zoe's Roots Shield protection check
      if (this.streakShieldActive) {
        this.streakShieldActive = false;
        sound.playStreak();
        speech.speak('¡El Escudo de Raíces de Zoe protegió tu racha! Inténtalo de nuevo.');
        card.classList.add('shield-protect');
        setTimeout(() => card.classList.remove('shield-protect'), 800);
        return; // Don't advance or reset challenge, let student try again!
      }

      card.classList.add('incorrect-shake');
      sound.playIncorrect();
    }

    setTimeout(() => {
      card.classList.remove('correct-flash', 'incorrect-shake');
    }, 450);

    // Check for Tier Level Up
    if (tierChanged === 1) {
      sound.playLevelUp();
      const tierName = this.mathSession.get_tier_name();
      this.showLevelUpModal(tierName);
      speech.speak(`¡Felicidades Valen! Has subido a ${tierName}`);
    }

    // Persist session metrics to IndexedDB
    await db.recordMathSession({
      tier: this.mathSession.get_tier(),
      totalAnswered: this.mathSession.get_total_answered(),
      totalCorrect: this.mathSession.get_total_correct(),
      streak: currentStreak,
      highestStreak: this.mathSession.get_highest_streak(),
      mastery: this.mathSession.get_mastery(),
    });

    // Generate next challenge in Rust and re-render
    this.mathSession.generate_next_challenge();
    this.renderMathChallenge();
  }

  showLevelUpModal(tierName) {
    const modal = document.getElementById('level-up-modal');
    const title = document.getElementById('modal-tier-title');
    if (modal && title) {
      title.textContent = `¡Has alcanzado ${tierName}! 🌟`;
      modal.hidden = false;
    }
  }

  renderProfileHeader(profile) {
    const avatar = document.getElementById('student-avatar');
    const name = document.getElementById('student-name');
    if (avatar) avatar.textContent = profile.avatar || '🦄';
    if (name) name.textContent = profile.name || 'Valen y sus Amigas';
    this.updateStarsDisplay(profile.stars || 0);
  }

  updateStarsDisplay(stars) {
    const countEl = document.getElementById('player-stars-count');
    if (countEl) {
      countEl.textContent = stars;
      const badge = document.getElementById('header-stars-badge');
      if (badge) {
        badge.classList.remove('star-updated');
        void badge.offsetWidth; // Force reflow to restart CSS keyframe
        badge.classList.add('star-updated');
      }
    }
    const wardrobeBalance = document.getElementById('wardrobe-star-balance');
    if (wardrobeBalance) {
      wardrobeBalance.textContent = stars;
    }
  }

  // =========================================================================
  // Reading Fluency Engine Integration
  // =========================================================================
  renderReadingCatalog() {
    const storiesJson = this.readingSession.get_stories_json();
    const stories = JSON.parse(storiesJson);
    const selector = document.getElementById('story-selector');
    if (!selector) return;

    selector.innerHTML = '';
    stories.forEach((story, idx) => {
      const chip = document.createElement('button');
      chip.className = `story-chip ${idx === 0 ? 'active' : ''}`;
      chip.textContent = `${story.title} (Nivel ${story.level})`;
      chip.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.story-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.readingSession.select_story(story.id);
        this.loadStoryView(story);
      });
      selector.appendChild(chip);
    });

    if (stories.length > 0) {
      this.loadStoryView(stories[0]);
    }
  }

  loadStoryView(story) {
    this.currentStoryText = story.text;
    document.getElementById('reading-story-title').textContent = story.title;

    // Use Rust WASM Syllable Parser to split words and format text
    const syllablesJson = this.readingSession.get_active_story_syllables();
    const wordsWithSyllables = JSON.parse(syllablesJson);
    this.rsvpWords = wordsWithSyllables.map((w) => w.raw);

    const storyBody = document.getElementById('reading-story-body');
    storyBody.innerHTML = '';

    wordsWithSyllables.forEach((item) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-span';
      wordSpan.setAttribute('title', `Haz clic para escuchar "${item.clean || item.raw}"`);

      // Click to pronounce individual word via Native SpeechSynthesis
      wordSpan.addEventListener('click', () => {
        sound.playClick();
        speech.speakWord(item.clean || item.raw);
      });

      if (item.syllables && item.syllables.length > 1) {
        // Color alternate syllables for phonetic decoding
        item.syllables.forEach((syl, i) => {
          const sylSpan = document.createElement('span');
          sylSpan.className = i % 2 === 0 ? 'syllable-a' : 'syllable-b';
          sylSpan.textContent = syl;
          wordSpan.appendChild(sylSpan);
        });
      } else {
        wordSpan.textContent = item.raw;
      }

      storyBody.appendChild(wordSpan);
      storyBody.appendChild(document.createTextNode(' '));
    });

    // Reset RSVP display
    document.getElementById('rsvp-current-word').textContent = 'Listo para leer';
  }


  toggleRsvp() {
    if (this.rsvpTimer) {
      this.stopRsvp();
    } else {
      this.startRsvp();
    }
  }

  startRsvp() {
    if (this.rsvpWords.length === 0) return;
    this.rsvpIndex = 0;
    const btn = document.getElementById('btn-play-rsvp');
    if (btn) btn.textContent = '⏸ Pausar Lectura';

    const intervalMs = Math.round((60 / this.rsvpWpm) * 1000);
    const display = document.getElementById('rsvp-current-word');

    this.rsvpTimer = setInterval(() => {
      if (this.rsvpIndex < this.rsvpWords.length) {
        display.textContent = this.rsvpWords[this.rsvpIndex];
        this.rsvpIndex++;
      } else {
        this.stopRsvp();
        display.textContent = '¡Completado! 🎉';
        sound.playLevelUp();
      }
    }, intervalMs);
  }

  stopRsvp() {
    if (this.rsvpTimer) {
      clearInterval(this.rsvpTimer);
      this.rsvpTimer = null;
    }
    const btn = document.getElementById('btn-play-rsvp');
    if (btn) btn.textContent = '▶ Iniciar Lectura RSVP';
  }
}

// Instantiate and boot on DOM content ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new KidsLearnApp();
  app.init();
});
