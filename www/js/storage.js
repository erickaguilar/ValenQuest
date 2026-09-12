/**
 * KidsLearn-WASM Local-First Native IndexedDB Storage
 * Lightweight, zero-dependency async persistence layer for profiles, sessions & streaks.
 */

const DB_NAME = 'KidsLearnDB';
const DB_VERSION = 1;

class LocalStorageDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  /**
   * Initializes and upgrades IndexedDB schema
   */
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Profile store (key: 'active_student')
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        // Math sessions store
        if (!db.objectStoreNames.contains('math_sessions')) {
          const mathStore = db.createObjectStore('math_sessions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          mathStore.createIndex('timestamp', 'timestamp', { unique: false });
          mathStore.createIndex('tier', 'tier', { unique: false });
        }

        // Reading sessions store
        if (!db.objectStoreNames.contains('reading_sessions')) {
          const readingStore = db.createObjectStore('reading_sessions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          readingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB opening error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Gets or initializes the default student profile
   */
  async getProfile() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const req = store.get('active_student');

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          // Default initial profile for ValenQuest
          const defaultProfile = {
            id: 'active_student',
            name: 'Valen',
            avatar: '🦄',
            currentTier: 1,
            totalMathSolved: 0,
            totalMathCorrect: 0,
            bestStreak: 0,
            currentStreak: 0,
            storiesCompleted: 0,
            lastPlayed: new Date().toISOString(),
          };

          this.saveProfile(defaultProfile)
            .then(() => resolve(defaultProfile))
            .catch(reject);
        }
      };

      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Updates or saves student profile
   */
  async saveProfile(profile) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      const req = store.put({ ...profile, id: 'active_student' });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Records a completed math session
   */
  async recordMathSession(sessionData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['math_sessions', 'profiles'], 'readwrite');
      const mathStore = tx.objectStore('math_sessions');
      const profileStore = tx.objectStore('profiles');

      const entry = {
        ...sessionData,
        timestamp: Date.now(),
      };

      mathStore.add(entry);

      // Update aggregate profile stats
      const profReq = profileStore.get('active_student');
      profReq.onsuccess = () => {
        const prof = profReq.result || { id: 'active_student' };
        prof.totalMathSolved = (prof.totalMathSolved || 0) + (sessionData.totalAnswered || 0);
        prof.totalMathCorrect = (prof.totalMathCorrect || 0) + (sessionData.totalCorrect || 0);
        prof.currentStreak = sessionData.streak || 0;
        if (sessionData.highestStreak > (prof.bestStreak || 0)) {
          prof.bestStreak = sessionData.highestStreak;
        }
        prof.currentTier = sessionData.tier || prof.currentTier || 1;
        prof.lastPlayed = new Date().toISOString();
        profileStore.put(prof);
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Retrieves recent math sessions
   */
  async getRecentMathSessions(limit = 10) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('math_sessions', 'readonly');
      const store = tx.objectStore('math_sessions');
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results.slice(0, limit));
      };

      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Records a reading session
   */
  async recordReadingSession(readingData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['reading_sessions', 'profiles'], 'readwrite');
      const readStore = tx.objectStore('reading_sessions');
      const profileStore = tx.objectStore('profiles');

      const entry = {
        ...readingData,
        timestamp: Date.now(),
      };

      readStore.add(entry);

      const profReq = profileStore.get('active_student');
      profReq.onsuccess = () => {
        const prof = profReq.result || { id: 'active_student' };
        prof.storiesCompleted = (prof.storiesCompleted || 0) + 1;
        prof.lastPlayed = new Date().toISOString();
        profileStore.put(prof);
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new LocalStorageDB();
