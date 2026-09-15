/**
 * ValenQuest Native Text-To-Speech (TTS) Engine
 * Zero-dependency speech synthesis utilizing browser native SpeechSynthesis API.
 * Child-adapted prosody: slightly slower cadence, warm melodic pitch, and Spanish phonetics.
 */

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.enabled = true;
    this.isSpeaking = false;
    this.speakingListeners = new Set();
    this.warmedUp = false;
    this._currentUtterance = null;

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
      this.initWarmUp();
    }
  }

  /**
   * Unlocks mobile audio pipeline (iOS WebKit / Android) upon first user interaction
   */
  initWarmUp() {
    if (typeof window === 'undefined' || !this.synth) return;

    const warmUpHandler = () => {
      if (this.warmedUp) return;
      this.warmedUp = true;

      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        // Silent zero-duration utterance to unlock audio context
        const silent = new SpeechSynthesisUtterance('');
        silent.volume = 0;
        this.synth.speak(silent);
        this.initVoices();
      } catch (err) {
        console.warn('[ValenQuest TTS] Silent warm-up bypassed:', err);
      }

      window.removeEventListener('pointerdown', warmUpHandler);
      window.removeEventListener('touchstart', warmUpHandler);
      window.removeEventListener('click', warmUpHandler);
      window.removeEventListener('keydown', warmUpHandler);
    };

    window.addEventListener('pointerdown', warmUpHandler, { once: true, passive: true });
    window.addEventListener('touchstart', warmUpHandler, { once: true, passive: true });
    window.addEventListener('click', warmUpHandler, { once: true, passive: true });
    window.addEventListener('keydown', warmUpHandler, { once: true, passive: true });
  }

  /**
   * Discovers and selects the best natural Spanish voice available in the OS.
   * Prioritizes Mexican / Latin American / Peninsular voices with high-quality descriptors.
   */
  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const scoreVoice = (v) => {
      let score = 0;
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();

      // Language tier
      if (lang === 'es-mx') score += 100;
      else if (lang === 'es-419') score += 95;
      else if (lang === 'es-es') score += 90;
      else if (lang === 'es-us') score += 85;
      else if (lang.startsWith('es')) score += 70;
      else return -1; // Ignore non-Spanish

      // Quality and natural timbre indicators
      if (name.includes('natural') || name.includes('neural')) score += 40;
      if (name.includes('google')) score += 30;
      if (
        name.includes('paulina') ||
        name.includes('monica') ||
        name.includes('mónica') ||
        name.includes('helena') ||
        name.includes('sabina') ||
        name.includes('jorge')
      ) {
        score += 25;
      }
      if (v.localService) score += 15; // Prefers local voices over unreliable network synthesis

      return score;
    };

    let bestVoice = null;
    let highestScore = -1;

    for (const v of voices) {
      const score = scoreVoice(v);
      if (score > highestScore) {
        highestScore = score;
        bestVoice = v;
      }
    }

    if (bestVoice) {
      this.voice = bestVoice;
    } else {
      // Fallback: first available voice with 'es' tag or system default
      this.voice = voices.find((v) => (v.lang || '').startsWith('es')) || voices[0];
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.synth) {
      this.cancel();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  cancel() {
    if (this.synth) {
      this.synth.cancel();
      this._currentUtterance = null;
      this.notifySpeaking(false);
    }
  }

  onSpeakingChange(callback) {
    this.speakingListeners.add(callback);
    return () => this.speakingListeners.delete(callback);
  }

  notifySpeaking(speaking) {
    this.isSpeaking = speaking;
    this.speakingListeners.forEach((fn) => fn(speaking));
  }

  /**
   * Speaks raw text with child-friendly prosody.
   */
  speak(text, { rate = 0.92, pitch = 1.15 } = {}) {
    if (!this.synth || !this.enabled || !text) return;

    // Guard: ensure voices are initialized
    if (!this.voice) {
      this.initVoices();
    }

    // Cancel ongoing speech to prevent backlog queue
    this.synth.cancel();

    // Guard: resume if iOS WebKit placed synthesis in paused state
    if (this.synth.paused) {
      try {
        this.synth.resume();
      } catch {
        // Ignore resume errors
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
      utterance.lang = this.voice.lang;
    } else {
      utterance.lang = 'es-MX';
    }

    utterance.rate = rate;   // Slightly slower and deliberate for primary students
    utterance.pitch = pitch; // Warm, friendly tone

    utterance.onstart = () => this.notifySpeaking(true);
    utterance.onend = () => {
      this._currentUtterance = null;
      this.notifySpeaking(false);
    };
    utterance.onerror = () => {
      this._currentUtterance = null;
      this.notifySpeaking(false);
    };

    // Keep instance reference to prevent iOS garbage collection bug
    this._currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Pronounces a math challenge in natural spoken Spanish.
   * e.g. "¿Cuánto es 4 más 3?" o "¿Cuánto es 8 menos 5?"
   */
  speakMath(op1, operator, op2) {
    let opWord = 'más';
    if (operator === '-') opWord = 'menos';
    else if (operator === '×' || operator === '*' || operator === 'x') opWord = 'por';

    const phrase = `¿Cuánto es ${op1} ${opWord} ${op2}?`;
    this.speak(phrase, { rate: 0.9, pitch: 1.15 });
  }

  /**
   * Narrates dialogue from characters or story text.
   */
  speakDialogue(text) {
    this.speak(text, { rate: 0.94, pitch: 1.18 });
  }

  /**
   * Reads a single vocabulary or syllabified word clearly.
   */
  speakWord(word) {
    this.speak(word, { rate: 0.82, pitch: 1.1 });
  }

  /**
   * Celebratory voice praise for streaks and milestones.
   */
  speakPraise(streak) {
    const praises = [
      '¡Increíble trabajo!',
      '¡Súper bien hecho!',
      '¡Estupendo cálculo!',
      `¡Racha mágica de ${streak} aciertos!`,
      '¡Brillas como las constelaciones de Lumiria!',
    ];
    const phrase = praises[Math.floor(Math.random() * praises.length)];
    this.speak(phrase, { rate: 1.0, pitch: 1.25 });
  }
}

export const speech = new SpeechEngine();
