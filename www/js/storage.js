/**
 * ValenQuest Local-First Storage Architecture (valenquest_db v2)
 * Robust Promise-oriented IndexedDB service managing:
 * - player_profile: Stars balance, active companion, settings, tiers
 * - companions_state: Heroine charges, usage counter, equipped cosmetics
 * - cosmetics_catalog: Items catalog with star costs and unlock state
 * - session_history: Longitudinal pedagogical metrics
 */

const DB_NAME = 'valenquest_db';
const DB_VERSION = 2;

export const INITIAL_COSMETICS = [
  {
    itemId: 'tiara-basica',
    heroineId: 'valen',
    slot: 'head',
    name: 'Tiara de Rocío',
    costStars: 0,
    unlocked: true,
    icon: '👑',
    description: 'Gotas de rocío celestial que brillan con la luz del alba.',
    svgLayerId: 'cosmetic-valen-tiara-basica',
  },
  {
    itemId: 'tiara-cristal',
    heroineId: 'valen',
    slot: 'head',
    name: 'Diadema Prisma Estelar',
    costStars: 15,
    unlocked: false,
    icon: '💎',
    description: 'Forjada con tres puntas de cristal que refractan destellos arcoíris.',
    svgLayerId: 'cosmetic-valen-tiara-cristal',
  },
  {
    itemId: 'lazo-cielo',
    heroineId: 'mia',
    slot: 'head',
    name: 'Lazo Celeste de Viento',
    costStars: 0,
    unlocked: true,
    icon: '🎀',
    description: 'Cinta etérea hilada con la brisa suave de las nubes.',
    svgLayerId: 'cosmetic-mia-lazo-cielo',
  },
  {
    itemId: 'alas-aurora',
    heroineId: 'mia',
    slot: 'wings',
    name: 'Alas de Fénix Tornasol',
    costStars: 25,
    unlocked: false,
    icon: '🪽',
    description: 'Plumas tornasoladas con el resplandor de la aurora boreal.',
    svgLayerId: 'cosmetic-mia-alas-aurora',
  },
  {
    itemId: 'corona-hojas',
    heroineId: 'zoe',
    slot: 'head',
    name: 'Corona Floral Silvestre',
    costStars: 0,
    unlocked: true,
    icon: '🌸',
    description: 'Pétalos y ramas de la arboleda sagrada que nunca se marchitan.',
    svgLayerId: 'cosmetic-zoe-corona-hojas',
  },
  {
    itemId: 'amuleto-bosque',
    heroineId: 'zoe',
    slot: 'charm',
    name: 'Broche Esmeralda Sabia',
    costStars: 20,
    unlocked: false,
    icon: '🌿',
    description: 'Gema mística que susurra consejos de los antiguos guardianes.',
    svgLayerId: 'cosmetic-zoe-amuleto-bosque',
  },
];

export const INITIAL_COMPANIONS = [
  {
    heroineId: 'valen',
    name: 'Valen',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'tiara-basica', wings: null, charm: null },
  },
  {
    heroineId: 'mia',
    name: 'Mia',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'lazo-cielo', wings: null, charm: null },
  },
  {
    heroineId: 'zoe',
    name: 'Zoe',
    charges: 2,
    timesInvoked: 0,
    equipped: { head: 'corona-hojas', wings: null, charm: null },
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
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        try {
          // Perform automatic first-time seeding
          await this.ensureSeedData();
          resolve(this.db);
        } catch (seedErr) {
          console.warn('[ValenQuest Storage] Seed verification warning:', seedErr);
          resolve(this.db);
        }
      };

      request.onerror = (event) => {
        console.error('Fatal error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Seeds default profile, companions and cosmetics if table is empty
   */
  async ensureSeedData() {
    // 1. Seed Profile
    const profile = await this.getProfile();
    if (!profile) {
      const initialProfile = {
        id: 'active',
        name: 'Valen',
        avatar: '🦄',
        stars: 5, // 5 starter stars for instant celebration!
        selectedCompanion: 'valen',
        theme: localStorage.getItem('vq-theme') || 'light',
        mathTier: 1,
        readingTier: 1,
        totalMathSolved: 0,
        totalMathCorrect: 0,
        bestStreak: 0,
        currentStreak: 0,
        lastPlayed: new Date().toISOString(),
      };
      await this.saveProfile(initialProfile);
    }

    // 2. Seed Companions State
    const companionsTx = this.db.transaction('companions_state', 'readwrite');
    const compStore = companionsTx.objectStore('companions_state');
    for (const comp of INITIAL_COMPANIONS) {
      const existing = await new Promise((res) => {
        const req = compStore.get(comp.heroineId);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
      if (!existing) {
        compStore.put(comp);
      }
    }

    // 3. Seed Cosmetics Catalog
    const catalogTx = this.db.transaction('cosmetics_catalog', 'readwrite');
    const catStore = catalogTx.objectStore('cosmetics_catalog');
    for (const item of INITIAL_COSMETICS) {
      const existing = await new Promise((res) => {
        const req = catStore.get(item.itemId);
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(null);
      });
      if (!existing) {
        catStore.put(item);
      }
    }
  }

  // =========================================================================
  // Player Profile Management
  // =========================================================================
  async getProfile() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('player_profile', 'readonly');
      const store = tx.objectStore('player_profile');
      const req = store.get('active');

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveProfile(profile) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('player_profile', 'readwrite');
      const store = tx.objectStore('player_profile');
      const toSave = { ...profile, id: 'active', lastPlayed: new Date().toISOString() };
      const req = store.put(toSave);

      req.onsuccess = () => resolve(toSave);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Atomically adds or deducts stars from player balance.
   * @param {number} amount - Positive to reward, negative to spend
   * @returns {Promise<number>} New star balance
   */
  async addStars(amount) {
    await this.init();
    const profile = (await this.getProfile()) || {
      id: 'active',
      stars: 0,
      name: 'Valen',
      avatar: '🦄',
    };

    const currentStars = profile.stars || 0;
    const newStars = Math.max(0, currentStars + amount);
    profile.stars = newStars;

    await this.saveProfile(profile);
    return newStars;
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

    state.charges = Math.max(0, Math.min(3, charges));
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
    if (currentStars < item.costStars) {
      return {
        success: false,
        reason: `Necesitas ${item.costStars} ⭐ (tienes ${currentStars} ⭐)`,
        required: item.costStars,
        current: currentStars,
      };
    }

    // Atomic deduction and unlock
    profile.stars = currentStars - item.costStars;
    item.unlocked = true;

    await this.saveProfile(profile);

    const tx = this.db.transaction('cosmetics_catalog', 'readwrite');
    tx.objectStore('cosmetics_catalog').put(item);

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        resolve({
          success: true,
          item,
          remainingStars: profile.stars,
        });
      };
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
}

export const db = new StorageService();
