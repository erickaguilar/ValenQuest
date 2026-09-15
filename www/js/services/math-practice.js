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
    this.listeners = [];
  }

  async loadState() {
    try {
      const profile = await storage.getProfile();
      if (profile && profile.mathPractice) {
        this.selectedLevel = profile.mathPractice.selectedLevel || 1;
        this.highestStreak = profile.mathPractice.highestStreak || 0;
        this.totalAnswered = profile.mathPractice.totalAnswered || 0;
      }
    } catch (err) {
      console.warn('MathPracticeService: error loading state:', err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const profile = (await storage.getProfile()) || {};
      profile.mathPractice = {
        selectedLevel: this.selectedLevel,
        highestStreak: this.highestStreak,
        totalAnswered: this.totalAnswered,
      };
      await storage.saveProfile(profile);
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
    };
  }

  async setLevel(level) {
    const validLevel = Math.max(1, Math.min(5, Number(level) || 1));
    this.selectedLevel = validLevel;
    this.streak = 0;
    await this.saveState();
    return this.getState();
  }

  async recordAnswer(isCorrect) {
    this.totalAnswered++;
    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
    } else {
      this.streak = 0;
    }
    await this.saveState();
    return this.getState();
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
