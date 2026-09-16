/**
 * ValenQuest: Math Practice Service (El Prisma Numérico)
 * Orquestador del modo arcade de cálculo mental estructurado en 5 niveles de maestría.
 */
import { storage } from './storage.js';

export const MATH_LEVELS = [
  {
    level: 1,
    id: 'chispas-estelares',
    name: 'Chispas Estelares',
    shortName: 'Conteo y Sumas 1..10',
    description: 'Sumas directas y conteo visual hasta 10.',
    icon: '✨',
    curriculumTier: 1,
  },
  {
    level: 2,
    id: 'senderos-nubes',
    name: 'Senderos de Nubes',
    shortName: 'Sumas y Restas hasta 20',
    description: 'Operaciones básicas sin acarreo hasta 20.',
    icon: '☁️',
    curriculumTier: 2,
  },
  {
    level: 3,
    id: 'enigmas-cristal',
    name: 'Enigmas de Cristal',
    shortName: 'Acarreo y Desagrupación',
    description: 'Sumas y restas con transformación hasta 50.',
    icon: '💎',
    curriculumTier: 3,
  },
  {
    level: 4,
    id: 'salon-reflejos',
    name: 'El Salón de los Reflejos',
    shortName: 'Tablas 2, 3, 5 y 10',
    description: 'Multiplicación introductoria y matrices de luz.',
    icon: '🦁',
    curriculumTier: 5,
  },
  {
    level: 5,
    id: 'vortice-cosmico',
    name: 'Vórtice Cósmico',
    shortName: 'Tablas Avanzadas y Desafíos',
    description: 'Tablas 4, 6, 7, 8, 9, cálculo ágil y combinadas.',
    icon: '🌌',
    curriculumTier: 6,
  },
];

export class MathPracticeService {
  constructor() {
    this.wasm = null;
    this.session = null;
    this.selectedLevel = 1;
    this.streak = 0;
    this.highestStreak = 0;
    this.totalAnswered = 0;
    this.combo = 0; // 0% a 100%
    this.totalCombos = 0;
    this.inputMode = 'choice'; // 'choice' | 'keypad'
    this.keypadBuffer = '';
    this.currentChallenge = null;
    this.listeners = [];
  }

  init(wasm) {
    this.wasm = wasm;
    const seed = BigInt(Date.now()) + 9999n;
    const lvlInfo = this.getCurrentLevelInfo();
    this.session = new wasm.MathSession(seed, lvlInfo.curriculumTier || 1);
    this.generateChallenge();
  }

  async loadState() {
    try {
      const state = await storage.getModuleState('math_practice');
      if (state) {
        this.selectedLevel = state.selectedLevel || 1;
        this.highestStreak = state.highestStreak || 0;
        this.totalAnswered = state.totalAnswered || 0;
        this.totalCombos = state.totalCombos || 0;
        this.combo = typeof state.combo === 'number' ? state.combo : 0;
        if (state.inputMode) this.inputMode = state.inputMode;
      }
    } catch (err) {
      console.warn('MathPracticeService: error loading state:', err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const payload = {
        selectedLevel: this.selectedLevel,
        levelName: this.getCurrentLevelInfo().name,
        highestStreak: this.highestStreak,
        totalAnswered: this.totalAnswered,
        totalCombos: this.totalCombos,
        combo: this.combo || 0,
        inputMode: this.inputMode,
      };
      await storage.saveModuleState('math_practice', payload);
    } catch (err) {
      console.warn('MathPracticeService: error saving state:', err);
    }
    this.notify();
  }

  getLevels() {
    return MATH_LEVELS;
  }

  getCurrentLevelInfo() {
    return MATH_LEVELS.find((l) => l.level === this.selectedLevel) || MATH_LEVELS[0];
  }

  getState() {
    return {
      selectedLevel: this.selectedLevel,
      currentLevelInfo: this.getCurrentLevelInfo(),
      streak: this.streak,
      highestStreak: this.highestStreak,
      totalAnswered: this.totalAnswered,
      combo: typeof this.combo === 'number' ? this.combo : 0,
      totalCombos: this.totalCombos || 0,
      inputMode: this.inputMode,
      currentChallenge: this.currentChallenge,
    };
  }

  async setLevel(level) {
    const validLevel = Math.max(1, Math.min(5, Number(level) || 1));
    this.selectedLevel = validLevel;
    this.streak = 0;
    this.combo = 0;
    this.keypadBuffer = '';
    this.generateChallenge();
    await this.saveState();
    return this.getState();
  }

  generateChallenge() {
    if (!this.session) return null;
    const lvlInfo = this.getCurrentLevelInfo();
    this.session.force_tier(lvlInfo.curriculumTier);
    this.session.clear_portal_ready();

    const op1 = this.session.get_operand1();
    const op2 = this.session.get_operand2();
    const op = this.session.get_operator();
    const expr = this.session.get_expression ? this.session.get_expression() : '';
    const answer = this.session.get_correct_answer();

    let options = [];
    try {
      options = JSON.parse(this.session.get_options_json());
    } catch {
      options = [answer, answer + 1, answer + 2, Math.max(1, answer - 1)];
    }

    // GARANTÍA: La respuesta correcta SIEMPRE debe estar presente en las opciones
    if (!options.includes(answer)) {
      options[0] = answer;
      options.sort(() => Math.random() - 0.5);
    }

    this.currentChallenge = {
      op1,
      op2,
      operator: op,
      expression: expr,
      answer,
      options,
    };

    return this.currentChallenge;
  }

  async checkAnswer(userAnswer, elapsedMs = 3000) {
    if (!this.currentChallenge) {
      this.generateChallenge();
    }

    const isCorrect = Number(userAnswer) === this.currentChallenge.answer;
    this.totalAnswered++;
    let comboBurst = false;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
      const gain = elapsedMs > 0 && elapsedMs <= 4000 ? 25 : 20;
      this.combo = Math.min(100, (this.combo || 0) + gain);

      if (this.combo >= 100) {
        comboBurst = true;
        this.totalCombos = (this.totalCombos || 0) + 1;
        this.combo = 0; // Se reinicia para el siguiente combo
      }
    } else {
      this.streak = 0;
      this.combo = 0;
    }

    await this.saveState();

    return {
      isCorrect,
      streak: this.streak,
      highestStreak: this.highestStreak,
      combo: typeof this.combo === 'number' ? this.combo : 0,
      comboBurst,
      totalCombos: this.totalCombos || 0,
      correctAnswer: this.currentChallenge.answer,
    };
  }

  resetCombo() {
    this.combo = 0;
    this.notify();
  }

  toggleInputMode() {
    this.inputMode = this.inputMode === 'choice' ? 'keypad' : 'choice';
    this.keypadBuffer = '';
    this.saveState();
    return this.inputMode;
  }

  keypadAppend(digit) {
    if (this.keypadBuffer.length < 3) {
      this.keypadBuffer += String(digit);
    }
    return this.keypadBuffer;
  }

  keypadBackspace() {
    this.keypadBuffer = this.keypadBuffer.slice(0, -1);
    return this.keypadBuffer;
  }

  keypadClear() {
    this.keypadBuffer = '';
    return this.keypadBuffer;
  }

  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error('MathPracticeService listener error:', err);
      }
    });
  }
}

export const mathPractice = new MathPracticeService();
