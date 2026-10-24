#!/usr/bin/env node
/**
 * Smoke test para la Fase 1: Capa de Datos y Persistencia del Perfil del Jugador.
 * Valida la inicialización por defecto, migración de perfil, métodos de guardado de identidad
 * y sanitización de datos (nombre, género, edad, onboardingCompleted) en StorageService.
 */

import assert from 'node:assert/strict';

// Mock de fetch para archivos JSON locales en entorno Node
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  const urlStr = String(url);
  if (urlStr.includes('cosmetics.json') || urlStr.includes('game-modules.json') || urlStr.includes('initial-state.json')) {
    return {
      ok: true,
      status: 200,
      json: async () => [],
    };
  }
  if (originalFetch) return originalFetch(url);
  return { ok: false, status: 404, json: async () => ({}) };
};

// 1. Mock minimalista in-memory de IndexedDB para entorno Node
class MockIDBRequest {
  constructor() {
    this.onsuccess = null;
    this.onerror = null;
    this.result = undefined;
    this.error = null;
  }
}

class MockIDBTransaction {
  constructor(db, storeNames, mode) {
    this.db = db;
    this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
    this.mode = mode;
    this.oncomplete = null;
    this.onerror = null;
    this.error = null;
  }

  objectStore(name) {
    const store = this.db._stores[name];
    if (!store) throw new Error(`Object store ${name} not found`);
    return {
      get: (key) => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          req.result = store.has(key) ? structuredClone(store.get(key)) : undefined;
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      put: (val) => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          const key = val.id || val.heroineId || val.itemId || val.moduleId || 'key';
          store.set(key, structuredClone(val));
          req.result = key;
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      delete: (key) => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          store.delete(key);
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      getAll: () => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          req.result = Array.from(store.values()).map((v) => structuredClone(v));
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      getAllKeys: () => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          req.result = Array.from(store.keys());
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
      clear: () => {
        const req = new MockIDBRequest();
        queueMicrotask(() => {
          store.clear();
          if (req.onsuccess) req.onsuccess({ target: req });
        });
        return req;
      },
    };
  }
}

class MockIDBDatabase {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this._stores = {
      player_profile: new Map(),
      companions_state: new Map(),
      cosmetics_catalog: new Map(),
      session_history: new Map(),
      game_modules: new Map(),
    };
    this.objectStoreNames = {
      contains: (n) => Object.prototype.hasOwnProperty.call(this._stores, n),
    };
  }

  createObjectStore(name) {
    if (!this._stores[name]) this._stores[name] = new Map();
    return {
      createIndex: () => {},
    };
  }

  transaction(storeNames, mode) {
    const tx = new MockIDBTransaction(this, storeNames, mode);
    queueMicrotask(() => {
      if (tx.oncomplete) tx.oncomplete();
    });
    return tx;
  }
}

const mockIndexedDB = {
  open: (name, version) => {
    const req = new MockIDBRequest();
    queueMicrotask(() => {
      const db = new MockIDBDatabase(name, version);
      req.result = db;
      if (req.onupgradeneeded) {
        req.onupgradeneeded({ target: { result: db } });
      }
      if (req.onsuccess) {
        req.onsuccess({ target: { result: db } });
      }
    });
    return req;
  },
};

globalThis.indexedDB = mockIndexedDB;

console.log('🧪 [Fase 1 Test] Iniciando verificación de Capa de Datos (Storage)...');

// Importar servicio de almacenamiento
const { db } = await import('../www/js/services/storage.js');

// 1. Inicialización y Seed por defecto
await db.ensureSeedData();
const initialProfile = await db.getProfile();

console.log('  ✓ Perfil inicial sembrado:', {
  name: initialProfile.name,
  gender: initialProfile.gender,
  age: initialProfile.age,
  onboardingCompleted: initialProfile.onboardingCompleted,
});

assert.equal(initialProfile.name, 'Aventurero', 'Nombre por defecto debe ser "Aventurero"');
assert.equal(initialProfile.gender, 'neutral', 'Género por defecto debe ser "neutral"');
assert.equal(initialProfile.age, 7, 'Edad por defecto debe ser 7');
assert.equal(initialProfile.onboardingCompleted, false, 'onboardingCompleted debe ser false inicialmente');

// 2. Comprobación de isOnboardingNeeded
const neededBefore = await db.isOnboardingNeeded();
assert.equal(neededBefore, true, 'isOnboardingNeeded() debe devolver true antes de completar onboarding');
console.log('  ✓ isOnboardingNeeded() devuelve true correctamente');

// 3. Guardado de Identidad del Jugador (savePlayerIdentity)
const updated = await db.savePlayerIdentity({
  name: '  Mateo  ',
  gender: 'boy',
  age: 8,
  selectedCompanion: 'zoe',
});

assert.equal(updated.name, 'Mateo', 'El nombre debe ser recortado de espacios');
assert.equal(updated.gender, 'boy', 'El género debe actualizarse a boy');
assert.equal(updated.age, 8, 'La edad debe actualizarse a 8');
assert.equal(updated.selectedCompanion, 'zoe', 'La compañera activa debe ser zoe');
assert.equal(updated.onboardingCompleted, true, 'onboardingCompleted debe ser true tras guardar');
console.log('  ✓ savePlayerIdentity() guardó y sanitizó identidad correctamente');

// 4. Verificación de persistencia leyendo de nuevo el perfil
const reloaded = await db.getProfile();
assert.equal(reloaded.name, 'Mateo');
assert.equal(reloaded.gender, 'boy');
assert.equal(reloaded.age, 8);
assert.equal(reloaded.selectedCompanion, 'zoe');
assert.equal(reloaded.onboardingCompleted, true);

const neededAfter = await db.isOnboardingNeeded();
assert.equal(neededAfter, false, 'isOnboardingNeeded() debe devolver false tras completar onboarding');
console.log('  ✓ Persistencia comprobada e isOnboardingNeeded() devuelve false');

// 5. Sanitización de datos en saveProfile
await db.saveProfile({
  name: 'NombreDemasiadoLargoSuperandoElLimitePermitidoDeVeinticincoCaracteres',
  gender: 'extraterrestre-invalido',
  age: 6.8,
  diamonds: 15,
});

const sanitized = await db.getProfile();
assert.equal(sanitized.name.length <= 25, true, 'Nombre no debe exceder 25 caracteres');
assert.equal(sanitized.gender, 'neutral', 'Género inválido debe caer a neutral');
assert.equal(sanitized.age, 7, 'Edad flotante debe redondearse');
assert.equal(sanitized.diamonds, 15, 'Diamantes conservados');
console.log('  ✓ Sanitización robusta ante entradas malformadas comprobada');

// 6. Verificación de Concordancia Gramatical (profile-format.js)
const { getWelcomeHeadlineHtml, getPersonalizedVoiceGreeting } = await import('../www/js/services/profile-format.js');

const boyHtml = getWelcomeHeadlineHtml({ name: 'Mateo', gender: 'boy' });
assert.equal(boyHtml.includes('¡Bienvenido'), true, 'Debe concordar en masculino');
assert.equal(boyHtml.includes('Mateo'), true, 'Debe incluir el nombre del niño');

const girlHtml = getWelcomeHeadlineHtml({ name: 'Sofía', gender: 'girl' });
assert.equal(girlHtml.includes('¡Bienvenida'), true, 'Debe concordar en femenino');
assert.equal(girlHtml.includes('Sofía'), true, 'Debe incluir el nombre de la niña');

const neutralHtml = getWelcomeHeadlineHtml({ name: 'Valen', gender: 'neutral' });
assert.equal(neutralHtml.includes('¡Te damos la bienvenida'), true, 'Debe usar bienvenida neutral');
console.log('  ✓ Concordancia gramatical de bienvenida verificada (Él, Ella, Neutral)');

// 7. Verificación de Saludos de Voz Personalizados
const boyGreeting = getPersonalizedVoiceGreeting({ name: 'Mateo', gender: 'boy' }, 'Zoe');
assert.equal(boyGreeting.includes('valiente explorador'), true);
assert.equal(boyGreeting.includes('Soy Zoe'), true);

const girlGreeting = getPersonalizedVoiceGreeting({ name: 'Sofía', gender: 'girl' }, 'Reni');
assert.equal(girlGreeting.includes('valiente exploradora'), true);
assert.equal(girlGreeting.includes('Soy Reni'), true);
console.log('  ✓ Saludos de voz personalizados de las heroínas verificados');

// 8. Verificación de Calibración TTS por Edad
const { speech } = await import('../www/js/services/speech.js');
speech.calibrateRateForAge(5, true);
assert.equal(speech.getRate(), 0.85, 'Edad <= 6 debe calibrar a ritmo pausado (0.85)');

speech.calibrateRateForAge(9, true);
assert.equal(speech.getRate(), 1.0, 'Edad >= 7 debe calibrar a ritmo estándar (1.0)');
console.log('  ✓ Calibración adaptativa de velocidad de voz por edad comprobada');

console.log('\n✨ [Fase 1-4 Test] Todos los checks de datos, concordancia y adaptabilidad pasaron exitosamente.');
