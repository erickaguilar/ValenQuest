/**
 * ValenQuest: Reading Practice Service (La Pluma de la Fluidez)
 * Orquestador del taller de lenguaje y fluidez estructurado en 5 niveles de maestría.
 */
import { storage } from './storage.js';

export const READING_LEVELS = [
  {
    level: 1,
    id: 'ecos-rocio',
    name: 'Ecos de Rocío',
    shortName: 'Palabras Directas',
    description: 'Silabeo básico y palabras bisílabas (ma-pa, lu-na).',
    icon: '💧',
  },
  {
    level: 2,
    id: 'vientos-cruzados',
    name: 'Vientos Cruzados',
    shortName: 'Sílabas Trabadas',
    description: 'Grupos consonánticos inseparables (bra, pla, tro, glu).',
    icon: '🍃',
  },
  {
    level: 3,
    id: 'pergaminos-cantarines',
    name: 'Pergaminos Cantarines',
    shortName: 'Oraciones con Orión',
    description: 'Frases completas con lectura asistida en voz alta.',
    icon: '📜',
  },
  {
    level: 4,
    id: 'vuelo-rapido-rsvp',
    name: 'Vuelo Rápido RSVP',
    shortName: 'Velocímetro RSVP',
    description: 'Entrenamiento de velocidad visual palabra a palabra.',
    icon: '⚡',
  },
  {
    level: 5,
    id: 'fabulas-grimorio',
    name: 'Fábulas del Grimorio',
    shortName: 'Comprensión Lectora',
    description: 'Micro-cuentos, inferencias, sinónimos y rimas.',
    icon: '📖',
  },
];

export class ReadingPracticeService {
  constructor() {
    this.selectedLevel = 1;
    this.wordsRead = 0;
    this.highestWpm = 120;
    this.storiesCompleted = 0;
    this.listeners = [];
  }

  async loadState() {
    try {
      const profile = await storage.getProfile();
      if (profile && profile.readingPractice) {
        this.selectedLevel = profile.readingPractice.selectedLevel || 1;
        this.wordsRead = profile.readingPractice.wordsRead || 0;
        this.highestWpm = profile.readingPractice.highestWpm || 120;
        this.storiesCompleted = profile.readingPractice.storiesCompleted || 0;
      }
    } catch (err) {
      console.warn('ReadingPracticeService: error loading state:', err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const profile = (await storage.getProfile()) || {};
      profile.readingPractice = {
        selectedLevel: this.selectedLevel,
        wordsRead: this.wordsRead,
        highestWpm: this.highestWpm,
        storiesCompleted: this.storiesCompleted,
      };
      await storage.saveProfile(profile);
    } catch (err) {
      console.warn('ReadingPracticeService: error saving state:', err);
    }
    this.notify();
  }

  getLevels() {
    return READING_LEVELS;
  }

  getCurrentLevelInfo() {
    return READING_LEVELS.find((l) => l.level === this.selectedLevel) || READING_LEVELS[0];
  }

  getState() {
    return {
      selectedLevel: this.selectedLevel,
      currentLevelInfo: this.getCurrentLevelInfo(),
      wordsRead: this.wordsRead,
      highestWpm: this.highestWpm,
      storiesCompleted: this.storiesCompleted,
    };
  }

  async setLevel(level) {
    const validLevel = Math.max(1, Math.min(5, Number(level) || 1));
    this.selectedLevel = validLevel;
    await this.saveState();
    return this.getState();
  }

  async recordRead(wordCount = 1, wpm = 0) {
    this.wordsRead += wordCount;
    if (wpm > this.highestWpm) {
      this.highestWpm = wpm;
    }
    await this.saveState();
    return this.getState();
  }

  async recordStoryComplete() {
    this.storiesCompleted++;
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
        console.error('ReadingPracticeService listener error:', err);
      }
    });
  }
}

export const readingPractice = new ReadingPracticeService();
