/**
 * ValenQuest Companions & Friendship Powers Module
 * Manages the Harmony Quartet of heroines: Valen (Unicorn), Mia (Pegasus), Zoe (Earth Pony), and Lía (Alicorn).
 * Coordinates their animated avatars, lore quotes, and friendship powers during quest challenges.
 * Backed by IndexedDB (valenquest_db) for persistent charges, times invoked, and equipped cosmetics.
 */

import { sound } from './audio.js';
import { speech } from './speech.js';
import { db } from './storage.js';

export const HEROINES = {
  valen: {
    id: 'valen',
    name: 'Valen',
    race: 'unicorn',
    raceName: 'Unicornio',
    title: 'Guardiana del Prisma Astral',
    element: 'Luz y Prisma',
    color: 'var(--vq-pink-bubble)',
    symbolId: 'vq-heroine-valen',
    emoji: '🦄',
    powerName: 'Prisma Revelador',
    powerDescription: 'Refracta la luz para descartar una o dos respuestas incorrectas.',
    voiceQuote: '¡Mira el reflejo del prisma! He apartado una respuesta que no es.',
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    race: 'pegasus',
    raceName: 'Pegaso',
    title: 'Alquimista de los Vientos',
    element: 'Vuelo y Tiempo',
    color: 'var(--vq-sky)',
    symbolId: 'vq-heroine-mia',
    emoji: '🪽',
    powerName: 'Brisa Temporal',
    powerDescription: 'Detiene el tiempo y te da calma para asegurar máxima maestría (P = 1.0).',
    voiceQuote: '¡Respira hondo! La brisa detiene el tiempo para que pienses tranquila.',
  },
  zoe: {
    id: 'zoe',
    name: 'Zoe',
    race: 'earth_pony',
    raceName: 'Poni Terrestre',
    title: 'Ancla de la Naturaleza',
    element: 'Fuerza y Raíces',
    color: 'var(--vq-mint)',
    symbolId: 'vq-heroine-zoe',
    emoji: '🌿',
    powerName: 'Escudo de Raíces',
    powerDescription: 'Protege tu racha de aciertos ante un error y te explica el reto con voz tranquila.',
    voiceQuote: '¡Mis raíces sostienen tu camino! Escucha con calma, lo resolveremos paso a pasito.',
  },
  lia: {
    id: 'lia',
    name: 'Lía',
    race: 'alicorn',
    raceName: 'Alicornio Real',
    title: 'Princesa Astral de Lumiria',
    element: 'Realeza y Unión',
    color: 'var(--vq-alicorn-purple)',
    symbolId: 'vq-heroine-lia',
    emoji: '👑',
    powerName: 'Destello Real',
    powerDescription: '¡Doble efecto! Duplica las estrellas del reto y recarga +1 carga a tus amigas.',
    voiceQuote: '¡El Cuarteto de la Armonía une sus poderes! Doble estrella y energía mágica para todas.',
  },
};

class CompanionSystem {
  constructor() {
    this.activeId = 'valen';
    // Power charges for each heroine (refill with streaks)
    this.charges = {
      valen: 2,
      mia: 2,
      zoe: 2,
      lia: 2,
    };
    this.states = {};
    this.isGated = false;
    this.onPowerUsedListeners = new Set();
  }

  /**
   * Loads persisted charges, timesInvoked and equipped accessories from IndexedDB
   */
  async loadState() {
    try {
      const profile = await db.getProfile();
      if (profile && profile.selectedCompanion && HEROINES[profile.selectedCompanion]) {
        this.activeId = profile.selectedCompanion;
      }

      const allStates = await db.getAllCompanionsState();
      if (allStates) {
        this.states = allStates;
        ['valen', 'mia', 'zoe', 'lia'].forEach((id) => {
          if (allStates[id] && typeof allStates[id].charges === 'number') {
            this.charges[id] = allStates[id].charges;
          }
        });
      }

      this.applyEquippedCosmeticsClasses();
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('[ValenQuest Companions] Could not load persisted state from DB:', err);
      return false;
    }
  }

  setGated(gated) {
    this.isGated = !!gated;
    this.notifyListeners();
  }

  isPowerGated() {
    return this.isGated;
  }

  getActive() {
    return HEROINES[this.activeId];
  }

  async setActive(id) {
    if (HEROINES[id]) {
      this.activeId = id;
      sound.playClick();

      try {
        const profile = await db.getProfile();
        if (profile) {
          profile.selectedCompanion = id;
          await db.saveProfile(profile);
        }
      } catch (err) {
        console.warn('[ValenQuest Companions] Error saving selectedCompanion:', err);
      }

      this.applyEquippedCosmeticsClasses();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  getCharges(id) {
    return this.charges[id] || 0;
  }

  getEquipped(heroineId) {
    return this.states[heroineId]?.equipped || { head: null, wings: null, charm: null };
  }

  /**
   * Equips or unequips an item and persists state to IndexedDB
   */
  async equip(heroineId, slot, itemId) {
    try {
      const updatedState = await db.equipCosmetic(heroineId, slot, itemId);
      this.states[heroineId] = updatedState;
      this.applyEquippedCosmeticsClasses();
      this.notifyListeners();
      return updatedState;
    } catch (err) {
      console.error('[ValenQuest Companions] Error equipping item:', err);
      return null;
    }
  }

  /**
   * Refills friendship charges upon reaching streak milestones.
   * Persists new charges atomically to IndexedDB.
   */
  async rewardStreak(streak) {
    if (streak > 0 && streak % 3 === 0) {
      for (const key of Object.keys(this.charges)) {
        if (this.charges[key] < 3) {
          this.charges[key] += 1;
          await db.updateCompanionCharges(key, this.charges[key]).catch(() => {});
        }
      }
      sound.playStreak();
      speech.speak('¡La amistad brilla! Tus heroínas han recargado sus poderes mágicos.');
      this.notifyListeners();
    }
  }

  /**
   * Activates the selected heroine power.
   * @param {string} heroineId - 'valen' | 'mia' | 'zoe'
   * @param {Object} context - Game context ({ mathSession, app })
   */
  activatePower(heroineId, context) {
    if (this.isGated) {
      sound.playIncorrect();
      speech.speak('¡Observa el reto un momento antes de invocar el poder!');
      return { success: false, reason: 'Gated' };
    }

    const heroine = HEROINES[heroineId];
    if (!heroine) return { success: false, reason: 'Heroína no encontrada' };

    if (this.charges[heroineId] <= 0) {
      sound.playIncorrect();
      speech.speak(`El poder de ${heroine.name} se está recargando con tus aciertos.`);
      return { success: false, reason: 'Sin cargas' };
    }

    this.charges[heroineId] -= 1;

    // Persist charge change to IndexedDB
    db.updateCompanionCharges(heroineId, this.charges[heroineId]).catch((err) => {
      console.warn('[ValenQuest Companions] Error persisting charge decrement:', err);
    });

    sound.playLevelUp();
    speech.speakDialogue(heroine.voiceQuote);

    let effectResult = {};

    switch (heroineId) {
      case 'valen': {
        // Valen: Discards 1 or 2 wrong distractors from DOM
        effectResult = this.applyValenPower(context);
        break;
      }
      case 'mia': {
        // Mia: Freezes time and resets challenge timer
        effectResult = this.applyMiaPower(context);
        break;
      }
      case 'zoe': {
        // Zoe: Roots Shield protects streak + explains problem with TTS
        effectResult = this.applyZoePower(context);
        break;
      }
      case 'lia': {
        // Lía: Royal Flare (Double stars + team recharge)
        effectResult = this.applyLiaPower(context);
        break;
      }
      default:
        break;
    }

    this.notifyListeners();
    return { success: true, heroine, effect: effectResult };
  }

  applyValenPower(context) {
    const { mathSession, app } = context;
    if (!mathSession) return { discarded: 0 };

    // If student was on keypad mode, switch to choice mode so discarded options are visible
    if (app && app.inputMode === 'keypad') {
      app.inputMode = 'choice';
      const modeToggle = document.getElementById('btn-toggle-mode');
      if (modeToggle) {
        modeToggle.textContent = '🔢 Usar teclado numérico';
      }
      app.renderInputArea();
    }

    const correctAnswer = mathSession.get_correct_answer();
    const buttons = Array.from(document.querySelectorAll('#options-grid .option-btn'));
    let discardedCount = 0;

    for (const btn of buttons) {
      const val = parseInt(btn.textContent, 10);
      if (val !== correctAnswer && !btn.disabled) {
        btn.disabled = true;
        btn.style.opacity = '0.3';
        btn.style.textDecoration = 'line-through';
        btn.style.transform = 'scale(0.9)';
        discardedCount += 1;
        // Discard up to 2 wrong answers
        if (discardedCount >= 2) break;
      }
    }

    return { discarded: discardedCount };
  }

  applyMiaPower(context) {
    const { app } = context;
    if (app) {
      // Reset challenge start time to now, guaranteeing elapsed_ms is minimal for P = 1.0
      app.challengeStartTime = performance.now();
    }
    const card = document.getElementById('math-challenge-card');
    if (card) {
      card.style.boxShadow = '0 0 25px var(--vq-sky), 0 6px 0 var(--vq-border)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 2000);
    }
    return { timeFrozen: true };
  }

  applyZoePower(context) {
    const { mathSession, app } = context;
    if (app) {
      // Escudo de Raíces: protege la racha ante un tropiezo
      app.streakShieldActive = true;
    }

    let hint = '';
    if (mathSession) {
      const op1 = mathSession.get_operand1();
      const op = mathSession.get_operator();
      const op2 = mathSession.get_operand2();

      if (op === '+') {
        hint = `Tienes ${op1}, y le añades ${op2}. Imagina contar hacia adelante desde ${op1}.`;
      } else if (op === '-') {
        hint = `Comienzas con ${op1} y quitas ${op2}. Cuenta hacia atrás para descubrir lo que queda.`;
      } else if (op === '×') {
        hint = `Multiplicar es sumar varias veces: son ${op1} grupos de ${op2}.`;
      }
      speech.speak(hint, { rate: 0.88, pitch: 1.15 });
    }

    const card = document.getElementById('math-challenge-card');
    if (card) {
      card.classList.add('shield-protect');
      setTimeout(() => {
        card.classList.remove('shield-protect');
      }, 2500);
    }

    return { spoken: true, shieldActive: true, hint };
  }

  applyLiaPower(context) {
    const { app } = context;
    if (app) {
      // Duplica las estrellas del reto actual
      app.starMultiplier = 2;
    }

    // Recarga +1 carga a las tres amigas (Valen, Mia, Zoe) hasta tope de 3
    ['valen', 'mia', 'zoe'].forEach((id) => {
      if (this.charges[id] < 3) {
        this.charges[id] = Math.min(3, this.charges[id] + 1);
        db.updateCompanionCharges(id, this.charges[id]).catch(() => {});
      }
    });

    const card = document.getElementById('math-challenge-card');
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => {
        card.classList.remove('royal-boost');
      }, 2500);
    }

    return { starMultiplier: 2, teamRefilled: true };
  }

  /**
   * Applies CSS classes to heroine avatar containers so equipped SVG layers become visible
   * @param {string|null} overrideHeroineId - Optional heroine ID to display on wardrobe preview avatar
   */
  applyEquippedCosmeticsClasses(overrideHeroineId = null) {
    const allCosmeticIds = [
      'tiara-basica',
      'tiara-cristal',
      'lazo-cielo',
      'alas-aurora',
      'corona-hojas',
      'amuleto-bosque',
      'tiara-solsticio',
      'cetro-cometa',
      'alas-majestuosas',
    ];

    ['valen', 'mia', 'zoe', 'lia'].forEach((heroineId) => {
      const card = document.getElementById(`card-heroine-${heroineId}`);
      const equipped = this.getEquipped(heroineId);

      allCosmeticIds.forEach((itemId) => {
        const className = `equipped-${itemId}`;
        const isEquipped = Object.values(equipped).includes(itemId);
        if (card) {
          card.classList.toggle(className, isEquipped);
        }
      });
    });

    // Also update wardrobe preview container if present
    const preview = document.getElementById('wardrobe-preview-avatar');
    if (preview) {
      const targetHeroine = overrideHeroineId || this.activeId;
      const targetEquipped = this.getEquipped(targetHeroine);
      allCosmeticIds.forEach((itemId) => {
        const className = `equipped-${itemId}`;
        const isEquipped = Object.values(targetEquipped).includes(itemId);
        preview.classList.toggle(className, isEquipped);
      });
    }
  }

  onChange(callback) {
    this.onPowerUsedListeners.add(callback);
    return () => this.onPowerUsedListeners.delete(callback);
  }

  notifyListeners() {
    this.onPowerUsedListeners.forEach((fn) => fn(this));
  }
}

export const companions = new CompanionSystem();
