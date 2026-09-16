/**
 * ValenQuest: Adventure Service (La Gran Aventura)
 * Orquestador del modo campaña principal e híbrido (Práctica Intercalada).
 * Alterna entre retos matemáticos y retos de lectura a través de los 10 Templos Lunares.
 */
import { storage } from './storage.js';

export const TEMPLE_CHAPTER_UNLOCKS = {
  1: 2,  // Completar Templo 1 desbloquea Capítulo II
  2: 3,  // Completar Templo 2 desbloquea Capítulo III
  3: 4,  // Completar Templo 3 desbloquea Capítulo IV
  5: 5,  // Completar Templo 5 desbloquea Capítulo V
  7: 6,  // Completar Templo 7 desbloquea Capítulo VI
  9: 7,  // Completar Templo 9 desbloquea Capítulo VII
  10: 8, // Completar Templo 10 desbloquea Capítulo VIII
};

export const TEMPLE_NAMES = [
  'Manantial de Rocío',
  'Bosque Susurrante',
  'Vértice de Algodón',
  'Caverna de Ámbar',
  'Palacio Prisma',
  'Reloj de las Arenas',
  'Mar de Coral Profundo',
  'Muralla de Nácar',
  'Cúspide de la Aurora',
  'Trono de las Estrellas'
];

export class AdventureService {
  constructor() {
    this.currentTemple = 1;
    this.phase = 'math'; // 'math' | 'reading' | 'portal'
    this.consecutiveCorrect = 0;
    this.templeProgress = 0; // 0 a 100%
    this.unlockedChapters = [1]; // Capítulo 1 siempre disponible
    this.listeners = [];
  }

  async loadState() {
    try {
      const state = await storage.getModuleState('adventure');
      if (state) {
        this.currentTemple = state.currentTemple || 1;
        this.phase = state.phase || 'math';
        this.consecutiveCorrect = state.consecutiveCorrect || 0;
        this.templeProgress = state.templeProgress || 0;
        this.unlockedChapters = state.unlockedChapters || [1];
      }
    } catch (err) {
      console.warn('AdventureService: error loading state:', err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const payload = {
        currentTemple: this.currentTemple,
        templeName: TEMPLE_NAMES[this.currentTemple - 1] || 'Templo Sagrado',
        phase: this.phase,
        consecutiveCorrect: this.consecutiveCorrect,
        templeProgress: this.templeProgress,
        unlockedChapters: this.unlockedChapters,
      };
      await storage.saveModuleState('adventure', payload);
    } catch (err) {
      console.warn('AdventureService: error saving state:', err);
    }
    this.notify();
  }

  getState() {
    return {
      currentTemple: this.currentTemple,
      templeName: TEMPLE_NAMES[this.currentTemple - 1] || 'Templo Sagrado',
      phase: this.phase,
      consecutiveCorrect: this.consecutiveCorrect,
      templeProgress: this.templeProgress,
      unlockedChapters: [...this.unlockedChapters],
      isPortalReady: this.templeProgress >= 100
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
        console.error('AdventureService listener error:', err);
      }
    });
  }

  /**
   * Registra una respuesta del jugador en el flujo intercalado.
   * Alterna la fase entre 'math' y 'reading' y suma progreso.
   */
  async recordAnswer(isCorrect) {
    if (isCorrect) {
      this.consecutiveCorrect++;
      this.templeProgress = Math.min(100, this.templeProgress + 20); // 5 aciertos = 100%
      // Práctica Intercalada: alternar fase
      this.phase = this.phase === 'math' ? 'reading' : 'math';
    } else {
      this.consecutiveCorrect = 0;
      this.templeProgress = Math.max(0, this.templeProgress - 10);
    }

    await this.saveState();
    return this.getState();
  }

  /**
   * Supera el templo actual, desbloquea el capítulo bonus si aplica y avanza al siguiente.
   */
  async completeTemple() {
    const newlyUnlockedChapter = TEMPLE_CHAPTER_UNLOCKS[this.currentTemple];
    if (newlyUnlockedChapter && !this.unlockedChapters.includes(newlyUnlockedChapter)) {
      this.unlockedChapters.push(newlyUnlockedChapter);
      this.unlockedChapters.sort((a, b) => a - b);
    }

    if (this.currentTemple < 10) {
      this.currentTemple++;
      this.templeProgress = 0;
      this.consecutiveCorrect = 0;
      this.phase = 'math';
    }

    await this.saveState();
    return {
      ...this.getState(),
      newChapterUnlocked: newlyUnlockedChapter || null
    };
  }
}

export const adventure = new AdventureService();
