/**
 * ValenQuest Local-First Storage Architecture (valenquest_db v2)
 * Robust Promise-oriented IndexedDB service managing:
 * - player_profile: Stars balance, active companion, settings, tiers
 * - companions_state: Heroine charges, usage counter, equipped cosmetics
 * - cosmetics_catalog: Items catalog with star costs and unlock state
 * - session_history: Longitudinal pedagogical metrics
 */

const DB_NAME = 'valenquest_db';
const DB_VERSION = 5;

export let INITIAL_GAME_MODULES = [];
export let INITIAL_COSMETICS = [];

/**
 * Loads the initial game modules state from data/game-modules.json asynchronously.
 */
export async function loadInitialGameModules() {
  if (INITIAL_GAME_MODULES && INITIAL_GAME_MODULES.length > 0) {
    return INITIAL_GAME_MODULES;
  }
  try {
    const res = await fetch('data/game-modules.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    INITIAL_GAME_MODULES = await res.json();
    return INITIAL_GAME_MODULES;
  } catch (err) {
    console.warn('⚠️ [Storage] Could not fetch data/game-modules.json, attempting fallback:', err);
    try {
      const resFallback = await fetch('data/initial-state.json');
      const dataFallback = await resFallback.json();
      INITIAL_GAME_MODULES = dataFallback.gameModules || [];
      return INITIAL_GAME_MODULES;
    } catch (e) {
      console.error('❌ [Storage] Failed to load initial game modules:', e);
      return [];
    }
  }
}

/**
 * Loads the initial cosmetics catalog from data/cosmetics.json asynchronously.
 */
export async function loadInitialCosmetics() {
  if (INITIAL_COSMETICS && INITIAL_COSMETICS.length > 0) {
    return INITIAL_COSMETICS;
  }
  try {
    const res = await fetch('data/cosmetics.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    INITIAL_COSMETICS = await res.json();
    return INITIAL_COSMETICS;
  } catch (err) {
    console.warn('⚠️ [Storage] Could not fetch data/cosmetics.json, attempting fallback:', err);
    try {
      const resFallback = await fetch('data/initial-state.json');
      const dataFallback = await resFallback.json();
      INITIAL_COSMETICS = dataFallback.cosmetics || [];
      return INITIAL_COSMETICS;
    } catch (e) {
      console.error('❌ [Storage] Failed to load initial cosmetics:', e);
      return [];
    }
  }
}


export const INITIAL_COMPANIONS = [
  {
    heroineId: 'valen',
    name: 'Valen',
    race: 'alicorn',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'tiara-basica', wings: null, charm: null },
  },
  {
    heroineId: 'reni',
    name: 'Reni',
    race: 'pegasus',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'lazo-cielo', wings: null, charm: null },
  },
  {
    heroineId: 'zoe',
    name: 'Zoe',
    race: 'earth_pony',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'corona-hojas', wings: null, charm: null },
  },
  {
    heroineId: 'lia',
    name: 'Lía',
    race: 'unicorn',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'tiara-solsticio', wings: null, charm: null },
  },
];

class StorageService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initializes or upgrades IndexedDB to v2 schema with transactional seeding
   */
  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`📦 [ValenQuest Storage] Upgrading IndexedDB to v${DB_VERSION}...`);

        // 1. Player Profile Store
        if (!db.objectStoreNames.contains('player_profile')) {
          db.createObjectStore('player_profile', { keyPath: 'id' });
        }

        // 2. Companions State Store (charges, equipped accessories)
        if (!db.objectStoreNames.contains('companions_state')) {
          db.createObjectStore('companions_state', { keyPath: 'heroineId' });
        }

        // 3. Cosmetics Catalog Store
        if (!db.objectStoreNames.contains('cosmetics_catalog')) {
          const catalogStore = db.createObjectStore('cosmetics_catalog', {
            keyPath: 'itemId',
          });
          catalogStore.createIndex('heroineId', 'heroineId', { unique: false });
          catalogStore.createIndex('slot', 'slot', { unique: false });
        }

        // 4. Session History Store
        if (!db.objectStoreNames.contains('session_history')) {
          const sessionStore = db.createObjectStore('session_history', {
            keyPath: 'sessionId',
            autoIncrement: true,
          });
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 5. Game Modules Store (JSON objects per triad module)
        if (!db.objectStoreNames.contains('game_modules')) {
          db.createObjectStore('game_modules', { keyPath: 'moduleId' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        resolve(this.db);
        try {
          // Perform automatic first-time seeding asynchronously
          await this.ensureSeedData();
        } catch (seedErr) {
          console.warn('[ValenQuest Storage] Seed verification warning:', seedErr);
        }
      };

      request.onerror = (event) => {
        console.error('Fatal error opening IndexedDB:', event.target.error);
        this.initPromise = null;
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Seeds default profile, companions and cosmetics safely without transaction yielding
   */
  async ensureSeedData() {
    if (!this.db || this._isSeeding) return;
    this._isSeeding = true;

    try {
      // 1. Seed Profile if not present
      const profExists = await new Promise((res) => {
        try {
          const tx = this.db.transaction('player_profile', 'readonly');
          const req = tx.objectStore('player_profile').get('active');
          req.onsuccess = () => res(!!req.result);
          req.onerror = () => res(false);
        } catch (e) {
          res(false);
        }
      });

      if (!profExists) {
        await new Promise((res, rej) => {
          try {
            const tx = this.db.transaction('player_profile', 'readwrite');
            const store = tx.objectStore('player_profile');
            const initialProfile = {
              id: 'active',
              name: 'Valen',
              avatar: 'vq-heroine-valen',
              stars: 5, // 5 starter stars for instant celebration!
              selectedCompanion: 'valen',
              theme: (typeof localStorage !== 'undefined' && localStorage.getItem('vq-theme')) || 'light',
              currentTier: 1,
              mathTier: 1,
              readingTier: 1,
              totalMathSolved: 0,
              totalMathCorrect: 0,
              bestStreak: 0,
              currentStreak: 0,
              lastPlayed: new Date().toISOString(),
            };
            store.put(initialProfile);
            tx.oncomplete = () => res(true);
            tx.onerror = () => rej(tx.error);
          } catch (e) {
            rej(e);
          }
        });
      }

      // 1b. Migration: Mia -> Reni (Profile selected companion)
      if (profExists) {
        await new Promise((res) => {
          try {
            const tx = this.db.transaction('player_profile', 'readwrite');
            const store = tx.objectStore('player_profile');
            const req = store.get('active');
            req.onsuccess = () => {
              const prof = req.result;
              if (prof && prof.selectedCompanion === 'mia') {
                prof.selectedCompanion = 'reni';
                store.put(prof);
              }
            };
            tx.oncomplete = () => res(true);
            tx.onerror = () => res(false);
          } catch (e) {
            res(false);
          }
        });
      }

      // 1c. Migration: Mia -> Reni (Companions state)
      await new Promise((res) => {
        try {
          const tx = this.db.transaction('companions_state', 'readwrite');
          const store = tx.objectStore('companions_state');
          const req = store.get('mia');
          req.onsuccess = () => {
            const miaData = req.result;
            if (miaData) {
              const reniData = {
                ...miaData,
                heroineId: 'reni',
                name: 'Reni',
                race: 'pegasus',
              };
              store.put(reniData);
              store.delete('mia');
            }
          };
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        } catch (e) {
          res(false);
        }
      });

      // 1d. Migration: Mia -> Reni (Cosmetics catalog)
      await new Promise((res) => {
        try {
          const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
          const store = tx.objectStore('cosmetics_catalog');
          const req = store.getAll();
          req.onsuccess = () => {
            const items = req.result || [];
            items.forEach((item) => {
              if (item.heroineId === 'mia') {
                item.heroineId = 'reni';
                if (item.svgLayerId) {
                  item.svgLayerId = item.svgLayerId.replace('cosmetic-mia-', 'cosmetic-reni-');
                }
                store.put(item);
              }
            });
          };
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        } catch (e) {
          res(false);
        }
      });

      // 1e. Migration: Valen -> Alicorn & Lía -> Unicorn (sin rangos: consejo de iguales)
      await new Promise((res) => {
        try {
          const tx = this.db.transaction('companions_state', 'readwrite');
          const store = tx.objectStore('companions_state');
          const valenReq = store.get('valen');
          valenReq.onsuccess = () => {
            if (valenReq.result) {
              const valenData = valenReq.result;
              valenData.race = 'alicorn';
              delete valenData.isLeader;
              store.put(valenData);
            }
          };
          const liaReq = store.get('lia');
          liaReq.onsuccess = () => {
            if (liaReq.result) {
              const liaData = liaReq.result;
              liaData.race = 'unicorn';
              delete liaData.isLeader;
              store.put(liaData);
            }
          };
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        } catch (e) {
          res(false);
        }
      });

      // 1f. Migration: alas-majestuosas reassigned to Valen
      await new Promise((res) => {
        try {
          const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
          const store = tx.objectStore('cosmetics_catalog');
          const req = store.get('alas-majestuosas');
          req.onsuccess = () => {
            if (req.result) {
              const item = req.result;
              item.heroineId = 'valen';
              item.svgLayerId = 'cosmetic-valen-alas-majestuosas';
              store.put(item);
            }
          };
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        } catch (e) {
          res(false);
        }
      });

      // 2. Seed Companions State (Seed defaults and ensure missing heroines like Lía are added)
      const existingCompKeys = await new Promise((res) => {
        try {
          const tx = this.db.transaction('companions_state', 'readonly');
          const req = tx.objectStore('companions_state').getAllKeys();
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => res([]);
        } catch (e) {
          res([]);
        }
      });

      const missingComps = INITIAL_COMPANIONS.filter(
        (comp) => !existingCompKeys.includes(comp.heroineId)
      );

      if (missingComps.length > 0) {
        await new Promise((res, rej) => {
          try {
            const tx = this.db.transaction('companions_state', 'readwrite');
            const store = tx.objectStore('companions_state');
            missingComps.forEach((comp) => store.put(comp));
            tx.oncomplete = () => res(true);
            tx.onerror = () => rej(tx.error);
          } catch (e) {
            rej(e);
          }
        });
      }

      // 3. Seed Cosmetics Catalog (Seed defaults and ensure missing cosmetics like Lía's items are added)
      await loadInitialCosmetics();
      const existingCatKeys = await new Promise((res) => {
        try {
          const tx = this.db.transaction('cosmetics_catalog', 'readonly');
          const req = tx.objectStore('cosmetics_catalog').getAllKeys();
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => res([]);
        } catch (e) {
          res([]);
        }
      });

      const missingCosmetics = INITIAL_COSMETICS.filter(
        (item) => !existingCatKeys.includes(item.itemId)
      );

      if (missingCosmetics.length > 0) {
        await new Promise((res, rej) => {
          try {
            const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
            const store = tx.objectStore('cosmetics_catalog');
            missingCosmetics.forEach((item) => store.put(item));
            tx.oncomplete = () => res(true);
            tx.onerror = () => rej(tx.error);
          } catch (e) {
            rej(e);
          }
        });
      }

      // 4. Seed Game Modules (Triad JSON objects: adventure, math_practice, reading_practice)
      if (this.db.objectStoreNames.contains('game_modules')) {
        await loadInitialGameModules();
        const existingModKeys = await new Promise((res) => {
          try {
            const tx = this.db.transaction('game_modules', 'readonly');
            const req = tx.objectStore('game_modules').getAllKeys();
            req.onsuccess = () => res(req.result || []);
            req.onerror = () => res([]);
          } catch (e) {
            res([]);
          }
        });

        const missingModules = INITIAL_GAME_MODULES.filter(
          (mod) => !existingModKeys.includes(mod.moduleId)
        );

        if (missingModules.length > 0) {
          await new Promise((res, rej) => {
            try {
              const tx = this.db.transaction('game_modules', 'readwrite');
              const store = tx.objectStore('game_modules');
              missingModules.forEach((mod) => store.put(mod));
              tx.oncomplete = () => res(true);
              tx.onerror = () => rej(tx.error);
            } catch (e) {
              rej(e);
            }
          });
        }
      }
    } finally {
      this._isSeeding = false;
    }
  }

  // =========================================================================
  // Game Modules State Management (Triad JSON Objects in IndexedDB)
  // =========================================================================
  async getModuleState(moduleId) {
    await this.init();
    await loadInitialGameModules();
    return new Promise((resolve) => {
      try {
        if (!this.db.objectStoreNames.contains('game_modules')) {
          const defaultMod = INITIAL_GAME_MODULES.find((m) => m.moduleId === moduleId);
          return resolve(defaultMod ? { ...defaultMod } : null);
        }
        const tx = this.db.transaction('game_modules', 'readonly');
        const store = tx.objectStore('game_modules');
        const req = store.get(moduleId);

        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result);
          } else {
            const defaultMod = INITIAL_GAME_MODULES.find((m) => m.moduleId === moduleId);
            resolve(defaultMod ? { ...defaultMod } : null);
          }
        };
        req.onerror = () => {
          const defaultMod = INITIAL_GAME_MODULES.find((m) => m.moduleId === moduleId);
          resolve(defaultMod ? { ...defaultMod } : null);
        };
      } catch (err) {
        const defaultMod = INITIAL_GAME_MODULES.find((m) => m.moduleId === moduleId);
        resolve(defaultMod ? { ...defaultMod } : null);
      }
    });
  }

  async saveModuleState(moduleId, stateObj) {
    await this.init();
    return new Promise((resolve, reject) => {
      try {
        if (!this.db.objectStoreNames.contains('game_modules')) {
          return resolve(stateObj);
        }
        const tx = this.db.transaction('game_modules', 'readwrite');
        const store = tx.objectStore('game_modules');
        const toSave = {
          ...stateObj,
          moduleId,
          updatedAt: new Date().toISOString(),
        };
        const req = store.put(toSave);

        req.onsuccess = () => resolve(toSave);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAllModuleStates() {
    await this.init();
    await loadInitialGameModules();
    return new Promise((resolve) => {
      try {
        if (!this.db.objectStoreNames.contains('game_modules')) {
          return resolve([...INITIAL_GAME_MODULES]);
        }
        const tx = this.db.transaction('game_modules', 'readonly');
        const store = tx.objectStore('game_modules');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (err) {
        resolve([]);
      }
    });
  }

  // =========================================================================
  // Player Profile Management
  // =========================================================================
  async getProfile() {
    await this.init();
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('player_profile', 'readonly');
        const store = tx.objectStore('player_profile');
        const req = store.get('active');

        req.onsuccess = () => {
          if (req.result) {
            const p = req.result;
            if (typeof p.diamonds !== 'number') p.diamonds = 0;
            resolve(p);
          } else {
            resolve({
              id: 'active',
              name: 'Valen',
              avatar: 'vq-heroine-valen',
              stars: 5,
              diamonds: 0,
              currentTier: 1,
              selectedCompanion: 'valen',
            });
          }
        };
        req.onerror = () => resolve({
          id: 'active',
          name: 'Valen',
          avatar: 'vq-heroine-valen',
          stars: 5,
          diamonds: 0,
          currentTier: 1,
          selectedCompanion: 'valen',
        });
      } catch (err) {
        resolve({
          id: 'active',
          name: 'Valen',
          avatar: 'vq-heroine-valen',
          stars: 5,
          diamonds: 0,
          currentTier: 1,
          selectedCompanion: 'valen',
        });
      }
    });
  }

  async saveProfile(profile) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('player_profile', 'readwrite');
      const store = tx.objectStore('player_profile');
      const toSave = {
        ...profile,
        id: 'active',
        diamonds: typeof profile.diamonds === 'number' ? profile.diamonds : 0,
        lastPlayed: new Date().toISOString(),
      };
      const req = store.put(toSave);

      req.onsuccess = () => resolve(toSave);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Atomically adds or deducts stars from player balance (Campana Aventura).
   * @param {number} amount - Positive to reward, negative to spend
   * @returns {Promise<number>} New star balance
   */
  async addStars(amount) {
    await this.init();
    const profile = (await this.getProfile()) || {
      id: 'active',
      stars: 0,
      diamonds: 0,
      name: 'Valen',
      avatar: 'vq-heroine-valen',
    };

    const currentStars = profile.stars || 0;
    const newStars = Math.max(0, currentStars + amount);
    profile.stars = newStars;

    await this.saveProfile(profile);
    return newStars;
  }

  /**
   * Atomically adds or deducts diamonds from player balance (El Prisma Numerico - Practica).
   * @param {number} amount - Positive to reward, negative to spend
   * @returns {Promise<number>} New diamond balance
   */
  async addDiamonds(amount) {
    await this.init();
    const profile = (await this.getProfile()) || {
      id: 'active',
      stars: 0,
      diamonds: 0,
      name: 'Valen',
      avatar: 'vq-heroine-valen',
    };

    const currentDiamonds = typeof profile.diamonds === 'number' ? profile.diamonds : 0;
    const newDiamonds = Math.max(0, currentDiamonds + amount);
    profile.diamonds = newDiamonds;

    await this.saveProfile(profile);
    return newDiamonds;
  }

  async getDiamonds() {
    const profile = await this.getProfile();
    return profile?.diamonds || 0;
  }

  // =========================================================================
  // Companions State Management
  // =========================================================================
  async getCompanionState(heroineId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('companions_state', 'readonly');
      const store = tx.objectStore('companions_state');
      const req = store.get(heroineId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllCompanionsState() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('companions_state', 'readonly');
      const store = tx.objectStore('companions_state');
      const req = store.getAll();

      req.onsuccess = () => {
        const map = {};
        (req.result || []).forEach((c) => {
          map[c.heroineId] = c;
        });
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveCompanionState(state) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('companions_state', 'readwrite');
      const store = tx.objectStore('companions_state');
      const req = store.put(state);

      req.onsuccess = () => resolve(state);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Updates friendship charges for a heroine (clamped between 0 and 3)
   */
  async updateCompanionCharges(heroineId, charges) {
    await this.init();
    const state = (await this.getCompanionState(heroineId)) || {
      heroineId,
      name: heroineId,
      charges: 2,
      timesInvoked: 0,
      equipped: { head: null, wings: null, charm: null },
    };

    state.charges = Math.max(0, Math.min(2, charges));
    return this.saveCompanionState(state);
  }

  // =========================================================================
  // Cosmetics Catalog & Wardrobe
  // =========================================================================
  async getCosmeticsCatalog(heroineId = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('cosmetics_catalog', 'readonly');
      const store = tx.objectStore('cosmetics_catalog');
      const req = store.getAll();

      req.onsuccess = () => {
        let items = req.result || [];
        if (heroineId) {
          items = items.filter(
            (i) => i.heroineId === heroineId || i.heroineId === 'all'
          );
        }
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Unlocks an item by spending player stars in an atomic transaction
   */
  async unlockCosmetic(itemId) {
    await this.init();
    const profile = await this.getProfile();
    const catalog = await this.getCosmeticsCatalog();
    const item = catalog.find((i) => i.itemId === itemId);

    if (!item) return { success: false, reason: 'Artículo no encontrado' };
    if (item.unlocked) return { success: true, item, alreadyUnlocked: true };

    const currentStars = profile.stars || 0;
    const costStars = item.costStars || 0;

    if (currentStars < costStars) {
      return {
        success: false,
        reason: `Necesitas ${costStars} estrellas de Lumiria (tienes ${currentStars})`,
        required: costStars,
        current: currentStars,
        currency: 'stars',
      };
    }

    profile.stars = currentStars - costStars;
    item.unlocked = true;
    await this.saveProfile(profile);

    const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
    tx.objectStore('cosmetics_catalog').put(item);

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        resolve({
          success: true,
          item,
          currencyUsed: 'stars',
          remainingStars: profile.stars,
        });
      };
      tx.onerror = () => resolve({ success: false, reason: 'Error en la transacción de estrellas' });
    });
  }

  /**
   * Grants a cosmetic reward without star deduction (e.g. upon completing a Portal Challenge)
   */
  async grantCosmeticReward(itemId) {
    await this.init();
    await loadInitialCosmetics();
    const catalog = await this.getCosmeticsCatalog();
    let item = catalog.find((i) => i.itemId === itemId);

    if (!item) {
      const fallback = INITIAL_COSMETICS.find((i) => i.itemId === itemId);
      if (fallback) item = { ...fallback };
    }

    if (!item) return { success: false, reason: 'Artículo no encontrado' };

    item.unlocked = true;

    const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
    tx.objectStore('cosmetics_catalog').put(item);

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        resolve({
          success: true,
          item,
        });
      };
      tx.onerror = () => resolve({ success: false, reason: 'Error al persistir recompensa cosmética' });
    });
  }

  /**
   * Equips or unequips a cosmetic accessory for a heroine
   */
  async equipCosmetic(heroineId, slot, itemId) {
    await this.init();
    const state = (await this.getCompanionState(heroineId)) || {
      heroineId,
      name: heroineId,
      charges: 2,
      timesInvoked: 0,
      equipped: { head: null, wings: null, charm: null },
    };

    if (!state.equipped) {
      state.equipped = { head: null, wings: null, charm: null };
    }

    // Toggle: if already equipped, unequip; otherwise equip
    if (state.equipped[slot] === itemId) {
      state.equipped[slot] = null;
    } else {
      state.equipped[slot] = itemId;
    }

    await this.saveCompanionState(state);
    return state;
  }

  // =========================================================================
  // Session History (Pedagogical Metrics)
  // =========================================================================
  async recordMathSession(metrics) {
    await this.init();
    const session = {
      type: 'math',
      timestamp: Date.now(),
      ...metrics,
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('session_history', 'readwrite');
      const store = tx.objectStore('session_history');
      const req = store.add(session);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async recordReadingSession(metrics) {
    await this.init();
    const session = {
      type: 'reading',
      timestamp: Date.now(),
      ...metrics,
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('session_history', 'readwrite');
      const store = tx.objectStore('session_history');
      const req = store.add(session);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getSessions(limit = 20) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('session_history', 'readonly');
      const store = tx.objectStore('session_history');
      const index = store.index('timestamp');
      const req = index.openCursor(null, 'prev');
      const results = [];

      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Resets all player progress to zero:
   * - Clears player profile (stars = 0, diamonds = 0, streaks = 0, tier = 1)
   * - Clears companion charges and equips back to defaults
   * - Locks all cosmetics back to initial default locks
   * - Resets adventure, math practice, and reading practice modules back to initial states
   * - Clears session history
   * - Preserves user preferences like 'vq-theme', 'vq-speech-rate', 'vq-calm-mode'
   */
  async resetAllProgress() {
    await this.init();
    const storeNames = ['player_profile', 'companions_state', 'cosmetics_catalog', 'session_history', 'game_modules'];

    // 1. Clear all stores in IndexedDB
    await new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(storeNames, 'readwrite');
        storeNames.forEach((name) => {
          if (this.db.objectStoreNames.contains(name)) {
            tx.objectStore(name).clear();
          }
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });

    // 2. Clear progress keys from localStorage while preserving user preferences
    if (typeof localStorage !== 'undefined') {
      const preserved = {
        theme: localStorage.getItem('vq-theme'),
        speechRate: localStorage.getItem('vq-speech-rate'),
        calmMode: localStorage.getItem('vq-calm-mode'),
        fontSize: localStorage.getItem('vq-font-size'),
      };

      const keysToRemove = [
        'vq_player_profile',
        'vq_adventure_state',
        'vq_math_practice_state',
        'vq_reading_practice_state',
        'valenquest_stars',
        'valenquest_diamonds',
        'vq_streak',
        'vq_active_companion',
        'vq_last_visited',
      ];
      keysToRemove.forEach((k) => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      if (preserved.theme) localStorage.setItem('vq-theme', preserved.theme);
      if (preserved.speechRate) localStorage.setItem('vq-speech-rate', preserved.speechRate);
      if (preserved.calmMode) localStorage.setItem('vq-calm-mode', preserved.calmMode);
      if (preserved.fontSize) localStorage.setItem('vq-font-size', preserved.fontSize);
    }

    // 3. Reseed initial default data
    this._isSeeding = false;
    await this.ensureSeedData();

    // 4. Force stars and diamonds to 0 for a genuine reset to zero
    const profile = await this.getProfile();
    profile.stars = 0;
    profile.diamonds = 0;
    profile.currentStreak = 0;
    profile.bestStreak = 0;
    profile.totalMathSolved = 0;
    profile.totalMathCorrect = 0;
    profile.currentTier = 1;
    profile.mathTier = 1;
    profile.readingTier = 1;
    await this.saveProfile(profile);

    return true;
  }
}

export const db = new StorageService();
// SSOT de persistencia: importar siempre `db` (el alias `storage` se eliminó).
