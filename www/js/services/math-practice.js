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
    this.diamondsEarned = 0;
    this.inputMode = 'choice'; // 'choice' | 'keypad'
    this.keypadBuffer = '';
    this.listeners = [];
    this.currentChallenge = this.generateFallbackChallenge();
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
        this.diamondsEarned = state.diamondsEarned || 0;
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
        diamondsEarned: this.diamondsEarned || 0,
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
    return (
      MATH_LEVELS.find((lvl) => lvl.level === this.selectedLevel) ||
      MATH_LEVELS[0]
    );
  }

  getState() {
    if (!this.currentChallenge) {
      this.generateChallenge();
    }
    return {
      selectedLevel: this.selectedLevel,
      levelInfo: this.getCurrentLevelInfo(),
      streak: this.streak,
      highestStreak: this.highestStreak,
      totalAnswered: this.totalAnswered,
      combo: typeof this.combo === 'number' ? this.combo : 0,
      totalCombos: this.totalCombos || 0,
      diamondsEarned: this.diamondsEarned || 0,
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

  generateFallbackChallenge() {
    const lvl = this.selectedLevel || 1;
    let op1 = 1, op2 = 1, op = '+', expr = '', answer = 2;

    switch (lvl) {
      case 1: { // Chispas Estelares: Sumas 1..10
        op1 = Math.floor(Math.random() * 8) + 1;
        op2 = Math.floor(Math.random() * (10 - op1)) + 1;
        op = '+';
        answer = op1 + op2;
        break;
      }
      case 2: { // Senderos de Nubes: Sumas y restas hasta 20
        const isSub = Math.random() > 0.5;
        if (isSub) {
          op1 = Math.floor(Math.random() * 11) + 10;
          op2 = Math.floor(Math.random() * 9) + 1;
          op = '-';
          answer = op1 - op2;
        } else {
          op1 = Math.floor(Math.random() * 10) + 1;
          op2 = Math.floor(Math.random() * 10) + 1;
          op = '+';
          answer = op1 + op2;
        }
        break;
      }
      case 3: { // Enigmas de Cristal: Acarreo y desagrupación hasta 50
        const isSub = Math.random() > 0.5;
        if (isSub) {
          op1 = Math.floor(Math.random() * 25) + 25;
          op2 = Math.floor(Math.random() * 15) + 8;
          op = '-';
          answer = op1 - op2;
        } else {
          op1 = Math.floor(Math.random() * 20) + 15;
          op2 = Math.floor(Math.random() * 15) + 8;
          op = '+';
          answer = op1 + op2;
        }
        break;
      }
      case 4: { // El Salón de los Reflejos: Tablas 2, 3, 5 y 10
        const tables = [2, 3, 5, 10];
        op1 = tables[Math.floor(Math.random() * tables.length)];
        op2 = Math.floor(Math.random() * 9) + 2;
        op = '×';
        answer = op1 * op2;
        break;
      }
      case 5: // Vórtice Cósmico: Tablas 4, 6, 7, 8, 9
      default: {
        const tables = [4, 6, 7, 8, 9];
        op1 = tables[Math.floor(Math.random() * tables.length)];
        op2 = Math.floor(Math.random() * 8) + 2;
        op = '×';
        answer = op1 * op2;
        break;
      }
    }

    const distractorSet = new Set([answer]);
    const offsets = [-2, -1, 1, 2, 3, -3, 4];
    for (const offset of offsets) {
      if (distractorSet.size >= 4) break;
      const candidate = answer + offset;
      if (candidate >= 0) distractorSet.add(candidate);
    }
    while (distractorSet.size < 4) {
      distractorSet.add(answer + distractorSet.size + 1);
    }

    const options = Array.from(distractorSet).sort(() => Math.random() - 0.5);

    return {
      op1,
      op2,
      operator: op,
      expression: expr,
      answer,
      options,
    };
  }

  generateChallenge() {
    if (!this.session) {
      this.currentChallenge = this.generateFallbackChallenge();
      this.notify();
      return this.currentChallenge;
    }
    const lvlInfo = this.getCurrentLevelInfo();
    this.session.force_tier(lvlInfo.curriculumTier);
    this.session.clear_portal_ready();

    let op1 = this.session.get_operand1();
    let op2 = this.session.get_operand2();
    let op = this.session.get_operator();
    let expr = this.session.get_expression ? this.session.get_expression() : '';
    let answer = this.session.get_correct_answer();

    // Si los operandos son exactamente los mismos del reto anterior, refrescar para mayor variedad
    if (this.currentChallenge && this.currentChallenge.op1 === op1 && this.currentChallenge.op2 === op2 && this.currentChallenge.operator === op) {
      this.session.generate_next_challenge();
      op1 = this.session.get_operand1();
      op2 = this.session.get_operand2();
      op = this.session.get_operator();
      expr = this.session.get_expression ? this.session.get_expression() : '';
      answer = this.session.get_correct_answer();
    }

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

    this.notify();
    return this.currentChallenge;
  }

  async checkAnswer(userAnswer, elapsedMs = 3000) {
    if (!this.currentChallenge) {
      this.generateChallenge();
    }

    const isCorrect = Number(userAnswer) === this.currentChallenge.answer;
    this.totalAnswered++;
    let comboBurst = false;
    let earnedDiamonds = 0;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
      const gain = elapsedMs > 0 && elapsedMs <= 4000 ? 25 : 20;
      const nextCombo = Math.min(100, (this.combo || 0) + gain);

      // Calculo de Diamantes (Práctica Libre NO otorga estrellas de campaña)
      const baseDiamonds = elapsedMs > 0 && elapsedMs <= 4000 ? 2 : 1;
      const isStreakMilestone = this.streak > 0 && this.streak % 3 === 0;
      const streakBonus = isStreakMilestone ? 1 : 0;
      earnedDiamonds = baseDiamonds + streakBonus;

      if (nextCombo >= 100) {
        comboBurst = true;
        this.totalCombos = (this.totalCombos || 0) + 1;
        this.combo = 100; // Se mantiene en 100% para visualización del burst en UI
        earnedDiamonds += 10; // +10 Diamantes bonus por Súper Combo Astral
      } else {
        this.combo = nextCombo;
      }
      this.diamondsEarned = (this.diamondsEarned || 0) + earnedDiamonds;
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
      earnedDiamonds,
      totalDiamonds: this.diamondsEarned,
      correctAnswer: this.currentChallenge.answer,
    };
  }

  resetCombo() {
    this.combo = 0;
    this.saveState();
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
