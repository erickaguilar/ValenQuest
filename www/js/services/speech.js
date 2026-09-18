/**
 * ValenQuest Native Text-To-Speech (TTS) Engine
 * Zero-dependency speech synthesis utilizing browser native SpeechSynthesis API.
 * Child-adapted prosody: slightly slower cadence, warm melodic pitch, and Spanish phonetics.
 */

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.femaleVoice = null;
    this.maleVoice = null;
    this.hasDistinctMaleVoice = false;
    this.hasDistinctFemaleVoice = false;
    this.enabled = true;
    this.isSpeaking = false;
    this.speakingListeners = new Set();
    this.warmedUp = false;
    this._currentUtterance = null;
    this.rateMultiplier = 1.0;

    if (typeof localStorage !== 'undefined') {
      const savedRate = parseFloat(localStorage.getItem('vq-speech-rate'));
      if (!isNaN(savedRate) && savedRate > 0) {
        this.rateMultiplier = savedRate;
      }
    }

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
   * Detects the perceived gender of a voice by inspecting OS descriptors and naming conventions.
   */
  detectVoiceGender(v) {
    const name = (v.name || '').toLowerCase();
    const femaleHints = [
      'female', 'mujer', 'femenin', 'woman', 'girl',
      'paulina', 'monica', 'mónica', 'helena', 'sabina', 'francisca',
      'lucia', 'lucía', 'laura', 'carmen', 'rosa', 'valeria', 'victoria',
      'mia', 'mía', 'sofia', 'sofía', 'camila', 'paloma', 'jimena',
      'lupita', 'guadalupe', 'elvira', 'conchita', 'penelope', 'penélope',
      'soledad', 'ines', 'inés', 'zira', 'ana', 'silvia', 'sara', 'alva',
      'es-es-x-ana', 'es-es-x-eea', 'es-mx-x-sfb'
    ];
    const maleHints = [
      'male', 'hombre', 'masculin', 'man', 'boy',
      'jorge', 'diego', 'raul', 'raúl', 'alvaro', 'álvaro', 'pablo',
      'carlos', 'enrique', 'juan', 'manuel', 'miguel', 'mateo',
      'gonzalo', 'javier', 'pedro', 'julio', 'andres', 'andrés',
      'lucas', 'david', 'gabriel', 'fernando', 'alejandro', 'rodrigo',
      'tomas', 'tomás', 'hector', 'héctor', 'antonio', 'alberto', 'mario',
      'es-es-x-eef', 'es-mx-x-jfc'
    ];

    const isFemale = femaleHints.some((h) => name.includes(h));
    const isMale = maleHints.some((h) => name.includes(h));

    if (isFemale && !isMale) return 'female';
    if (isMale && !isFemale) return 'male';
    return 'neutral';
  }

  /**
   * Discovers, scores and categorizes Spanish voices into Female (Heroines) and Male (Master Orion).
   */
  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const scoreVoice = (v, targetGender = null) => {
      let score = 0;
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      const detectedGender = this.detectVoiceGender(v);

      // Dialect tier
      if (lang === 'es-mx') score += 100;
      else if (lang === 'es-419') score += 95;
      else if (lang === 'es-es') score += 90;
      else if (lang === 'es-us') score += 85;
      else if (lang.startsWith('es')) score += 70;
      else return -999; // Ignore non-Spanish voices

      // Gender affinity bonus / penalty
      if (targetGender) {
        if (detectedGender === targetGender) {
          score += 180;
        } else if (detectedGender !== 'neutral' && detectedGender !== targetGender) {
          score -= 160;
        }
      }

      // High-definition neural and natural speech indicators
      if (name.includes('natural') || name.includes('neural')) score += 50;
      if (name.includes('google')) score += 35;
      if (v.localService) score += 20;

      return score;
    };

    let bestGeneral = null;
    let bestFemale = null;
    let bestMale = null;

    let maxScoreGeneral = -9999;
    let maxScoreFemale = -9999;
    let maxScoreMale = -9999;

    for (const v of voices) {
      // General score
      const sg = scoreVoice(v, null);
      if (sg > maxScoreGeneral) {
        maxScoreGeneral = sg;
        bestGeneral = v;
      }

      // Female score
      const sf = scoreVoice(v, 'female');
      if (sf > maxScoreFemale) {
        maxScoreFemale = sf;
        bestFemale = v;
      }

      // Male score
      const sm = scoreVoice(v, 'male');
      if (sm > maxScoreMale) {
        maxScoreMale = sm;
        bestMale = v;
      }
    }

    // Assign best fallback voice
    this.voice = bestGeneral || voices.find((v) => (v.lang || '').startsWith('es')) || voices[0];

    // Assign gendered voices
    this.femaleVoice = bestFemale || this.voice;
    this.maleVoice = bestMale || this.voice;

    // Check if the voices are truly distinct in gender
    this.hasDistinctFemaleVoice = Boolean(this.femaleVoice && this.detectVoiceGender(this.femaleVoice) === 'female');
    this.hasDistinctMaleVoice = Boolean(this.maleVoice && this.detectVoiceGender(this.maleVoice) === 'male');
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

  setRate(rate) {
    const val = parseFloat(rate);
    if (!isNaN(val) && val > 0) {
      this.rateMultiplier = val;
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('vq-speech-rate', val.toString()); } catch (_) {}
      }
    }
  }

  getRate() {
    return this.rateMultiplier;
  }

  /**
   * Resolves whether the spoken text should use a Male (Orion) or Female (Heroines) voice persona.
   */
  resolveGender(options = {}, text = '') {
    if (options.gender) {
      return options.gender.toLowerCase() === 'male' ? 'male' : 'female';
    }

    const char = (options.character || '').toLowerCase();
    if (char === 'orion' || char === 'buho' || char === 'búho' || char === 'sabio') {
      return 'male';
    }
    if (char === 'valen' || char === 'reni' || char === 'zoe' || char === 'lia' || char === 'heroine') {
      return 'female';
    }

    // Contextual phrase detection
    const lower = (text || '').toLowerCase();
    const orionPatterns = [
      'soy orión', 'soy orion', 'el sabio búho', 'el sabio buho',
      'maestro orión', 'maestro orion', 'búho orión', 'buho orion',
      'voz de orión', 'voz de orion'
    ];
    if (orionPatterns.some((pattern) => lower.includes(pattern))) {
      return 'male';
    }

    // Default character persona in Lumiria
    return 'female';
  }

  /**
   * Speaks raw text with child-friendly prosody and automatic male/female voice selection.
   * - Masculine (Master Orion): deep, calm and noble timbre.
   * - Feminine (Heroines / Lumiria): warm, bright and enthusiastic timbre.
   */
  speak(text, { character, gender, rate = 0.92, pitch } = {}) {
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

    const resolvedGender = this.resolveGender({ character, gender }, text);
    let chosenVoice = null;
    let targetPitch = pitch;

    if (resolvedGender === 'male') {
      // Masculine persona: Master Orion
      chosenVoice = this.maleVoice || this.voice;
      if (targetPitch === undefined) {
        targetPitch = this.hasDistinctMaleVoice ? 0.90 : 0.80;
      }
    } else {
      // Feminine persona: Valen, Reni, Zoe, Lía and narrator
      chosenVoice = this.femaleVoice || this.voice;
      if (targetPitch === undefined) {
        targetPitch = 1.16;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = 'es-MX';
    }

    // Apply speed multiplier (allows slow / normal / fast pacing)
    const effectiveRate = Math.max(0.5, Math.min(2.0, rate * this.rateMultiplier));
    utterance.rate = effectiveRate;   // Deliberate, clear cadence
    utterance.pitch = targetPitch;    // Child-adapted gendered prosody

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
   * Speaks explicitly with Master Orion's masculine, wise persona.
   */
  speakOrion(text, options = {}) {
    this.speak(text, { gender: 'male', character: 'orion', ...options });
  }

  /**
   * Speaks explicitly with a specific heroine's feminine persona.
   */
  speakHeroine(heroineId, text, options = {}) {
    let pitch = 1.16;
    if (heroineId === 'reni') pitch = 1.22; // Pegaso vivaz y dinámica
    else if (heroineId === 'zoe') pitch = 1.10; // Poni terrestre serena y paciente
    else if (heroineId === 'lia') pitch = 1.15; // Unicornio curiosa
    else pitch = 1.18; // Valen, princesa astral

    this.speak(text, { gender: 'female', character: heroineId, pitch, ...options });
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
  speakDialogue(text, speaker = 'valen') {
    if (speaker === 'orion') {
      this.speakOrion(text);
    } else {
      this.speakHeroine(speaker, text);
    }
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
