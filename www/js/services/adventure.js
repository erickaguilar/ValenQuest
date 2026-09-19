/**
 * ValenQuest: Adventure Service (La Gran Aventura)
 * Orquestador del modo campaña principal e híbrido (Práctica Intercalada).
 * Alterna entre retos matemáticos y retos de lectura a través de los 10 Templos Lunares.
 */
import { db } from './storage.js';
import { loadLevelsData } from '../data/levels-data.js';

export const TEMPLE_CHAPTER_UNLOCKS = {
  1: 2,  // Completar Templo 1 desbloquea Capítulo II
  2: 3,  // Completar Templo 2 desbloquea Capítulo III
  3: 4,  // Completar Templo 3 desbloquea Capítulo IV
  5: 5,  // Completar Templo 5 desbloquea Capítulo V
  7: 6,  // Completar Templo 7 desbloquea Capítulo VI
  9: 7,  // Completar Templo 9 desbloquea Capítulo VII
  10: 8, // Completar Templo 10 desbloquea Capítulo VIII
};

/**
 * Nombres de respaldo offline-first. SSOT: `data/levels.json` (campo `name`);
 * este arreglo solo se usa antes de que el catálogo cargue o sin red.
 */
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
    // Espejo del motor WASM (fuente de verdad en modo campaña):
    this.wasmMasteryPct = 50;
    this.wasmStreak = 0;
    this.wasmHighestStreak = 0;
    this.portalReady = false;
    this.regressed = false;
    this.campaignCompleted = false;
    // Espejo del catálogo (SSOT levels.json); arranca con el respaldo.
    this.templeNames = [...TEMPLE_NAMES];
    this.listeners = [];
  }

  templeNameOf(num) {
    return this.templeNames[num - 1] || TEMPLE_NAMES[num - 1] || 'Templo Sagrado';
  }

  async loadState() {
    try {
      const state = await db.getModuleState('adventure');
      if (state) {
        this.currentTemple = state.currentTemple || 1;
        this.phase = state.phase || 'math';
        this.consecutiveCorrect = state.consecutiveCorrect || 0;
        this.templeProgress = state.templeProgress || 0;
        this.unlockedChapters = state.unlockedChapters || [1];
        this.wasmMasteryPct = typeof state.wasmMasteryPct === 'number' ? state.wasmMasteryPct : 50;
        this.wasmStreak = state.wasmStreak || 0;
        this.wasmHighestStreak = state.wasmHighestStreak || 0;
        this.portalReady = Boolean(state.portalReady);
        this.campaignCompleted = Boolean(state.campaignCompleted);
      }
    } catch (err) {
      console.warn('AdventureService: error loading state:', err);
    }
    // Sincronizar nombres canónicos del catálogo (SSOT levels.json).
    try {
      const data = await loadLevelsData();
      if (data && Array.isArray(data.levels) && data.levels.length >= 10) {
        const names = data.levels
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((lvl) => lvl.name)
          .filter(Boolean);
        if (names.length >= 10) this.templeNames = names;
      }
    } catch (err) {
      console.warn('AdventureService: usando nombres de respaldo:', err?.message || err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const payload = {
        currentTemple: this.currentTemple,
        templeName: this.templeNameOf(this.currentTemple),
        phase: this.phase,
        consecutiveCorrect: this.consecutiveCorrect,
        templeProgress: this.templeProgress,
        unlockedChapters: this.unlockedChapters,
        wasmMasteryPct: this.wasmMasteryPct,
        wasmStreak: this.wasmStreak,
        wasmHighestStreak: this.wasmHighestStreak,
        portalReady: this.portalReady,
        campaignCompleted: this.campaignCompleted,
      };
      await db.saveModuleState('adventure', payload);
    } catch (err) {
      console.warn('AdventureService: error saving state:', err);
    }
    this.notify();
  }

  /**
   * Persiste el estado devuelto por el motor WASM tras cada respuesta.
   * El motor es la fuente de verdad: tier (regresión incluida), maestría
   * EMA, racha y flag de portal.
   */
  async syncWasm(patch = {}) {
    if (typeof patch.currentTemple === 'number') {
      this.currentTemple = Math.max(1, Math.min(10, patch.currentTemple));
    }
    if (typeof patch.wasmMasteryPct === 'number') this.wasmMasteryPct = patch.wasmMasteryPct;
    if (typeof patch.wasmStreak === 'number') this.wasmStreak = patch.wasmStreak;
    if (typeof patch.wasmHighestStreak === 'number') this.wasmHighestStreak = patch.wasmHighestStreak;
    if (typeof patch.portalReady === 'boolean') this.portalReady = patch.portalReady;
    if (typeof patch.campaignCompleted === 'boolean') this.campaignCompleted = patch.campaignCompleted;
    this.regressed = Boolean(patch.regressed);
    await this.saveState();
    return this.getState();
  }

  getState() {
    return {
      currentTemple: this.currentTemple,
      templeName: this.templeNameOf(this.currentTemple),
      phase: this.phase,
      consecutiveCorrect: this.consecutiveCorrect,
      templeProgress: this.templeProgress,
      unlockedChapters: [...this.unlockedChapters],
      wasmMasteryPct: this.wasmMasteryPct,
      wasmStreak: this.wasmStreak,
      wasmHighestStreak: this.wasmHighestStreak,
      campaignCompleted: this.campaignCompleted,
      regressed: this.regressed,
      isPortalReady: this.portalReady || this.templeProgress >= 100
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
