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
    this.selectedLevel = 1;
    this.streak = 0;
    this.highestStreak = 0;
    this.totalAnswered = 0;
    this.combo = 0; // 0% a 100%
    this.totalCombos = 0;
    this.listeners = [];
  }

  async loadState() {
    try {
      const state = await storage.getModuleState('math_practice');
      if (state) {
        this.selectedLevel = state.selectedLevel || 1;
        this.highestStreak = state.highestStreak || 0;
        this.totalAnswered = state.totalAnswered || 0;
        this.totalCombos = state.totalCombos || 0;
        this.combo = 0;
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
      combo: this.combo,
      totalCombos: this.totalCombos,
    };
  }

  async setLevel(level) {
    const validLevel = Math.max(1, Math.min(5, Number(level) || 1));
    this.selectedLevel = validLevel;
    this.streak = 0;
    this.combo = 0;
    await this.saveState();
    return this.getState();
  }

  resetCombo() {
    this.combo = 0;
    this.notify();
  }

  async recordAnswer(isCorrect, elapsedMs = 0) {
    this.totalAnswered++;
    let comboBurst = false;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
      // Cada acierto ágil (<=4s) suma +25% de combo; respuesta pensada suma +20%
      const gain = elapsedMs > 0 && elapsedMs <= 4000 ? 25 : 20;
      this.combo += gain;

      if (this.combo >= 100) {
        comboBurst = true;
        this.totalCombos++;
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
      combo: this.combo,
      comboBurst,
      totalCombos: this.totalCombos,
    };
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
