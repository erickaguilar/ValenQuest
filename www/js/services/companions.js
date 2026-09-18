/**
 * ValenQuest Companions & Friendship Powers Module
 * Manages the Harmony Quartet of heroines: Valen (Unicorn), Reni (Pegasus), Zoe (Earth Pony), and Lía (Alicorn).
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
    race: 'alicorn',
    raceName: 'Alicornio',
    isLeader: true,
    title: 'Princesa Astral de Lumiria',
    element: 'Magia y Realeza',
    color: 'var(--vq-pink-bubble)',
    symbolId: 'vq-heroine-valen',
    iconSymbol: 'vq-icon-crown',
    emoji: '👑',
    powerName: 'Prisma Real',
    powerDescription: 'Descarta 2 opciones incorrectas y otorga un multiplicador de estrellas (2x) al acertar.',
    voiceQuote: '¡El Prisma Real de Lumiria refracta la verdad y duplica tus estrellas!',
  },
  reni: {
    id: 'reni',
    name: 'Reni',
    race: 'pegasus',
    raceName: 'Pegaso',
    title: 'Alquimista de los Vientos',
    element: 'Vuelo y Tiempo',
    color: 'var(--vq-sky)',
    symbolId: 'vq-heroine-reni',
    iconSymbol: 'vq-icon-wing',
    emoji: '🪽',
    powerName: 'Brisa Temporal',
    powerDescription: 'Detiene el tiempo y te da calma para asegurar máxima maestría (P = 1.0).',
    voiceQuote: '¡Reni despeja el viento para darte tiempo! Piensa con calma.',
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
    iconSymbol: 'vq-icon-leaf',
    emoji: '🌿',
    powerName: 'Escudo de Raíces',
    powerDescription: 'Protege tu racha de aciertos ante un error y te explica el reto con voz tranquila.',
    voiceQuote: '¡Mis raíces sostienen tu camino! Escucha con calma, lo resolveremos paso a pasito.',
  },
  lia: {
    id: 'lia',
    name: 'Lía',
    race: 'unicorn',
    raceName: 'Unicornio',
    title: 'Maga del Cristal Cósmico',
    element: 'Cristal y Magia',
    color: 'var(--vq-alicorn-purple)',
    symbolId: 'vq-heroine-lia',
    iconSymbol: 'vq-icon-crystal',
    emoji: '🦄',
    powerName: 'Foco de Cristal',
    powerDescription: 'Resalta la pista clave del problema (el acarreo o la descomposición) con telequinesis.',
    voiceQuote: '¡Mi cuerno de cristal enfoca el camino! Observa la pista luminosa.',
  },
};

class CompanionSystem {
  constructor() {
    this.activeId = 'valen';
    // Power charges for each heroine (refill with streaks)
    this.charges = {
      valen: 2,
      reni: 2,
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
        ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
          if (allStates[id] && typeof allStates[id].charges === 'number') {
            this.charges[id] = Math.min(2, allStates[id].charges);
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

  getAll() {
    return Object.values(HEROINES).map((hero) => ({
      ...hero,
      charges: this.charges[hero.id] ?? 2,
      available: (this.charges[hero.id] ?? 2) > 0,
      avatarEmoji: hero.emoji || '✨',
    }));
  }

  usePower(heroineId, context = {}) {
    const res = this.activatePower(heroineId, context);
    if (!res || !res.success) {
      return { success: false, reason: res?.reason || 'No disponible' };
    }
    return {
      success: true,
      powerName: res.heroine?.powerName || 'Poder de la Armonía',
      description: res.heroine?.powerDescription || '',
      heroine: res.heroine,
    };
  }

  getActive() {
    return HEROINES[this.activeId];
  }

  async setActive(id, playSound = true) {
    if (HEROINES[id]) {
      this.activeId = id;
      if (playSound) sound.playClick();

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
   * In practice mode, charges are NOT refilled on regular streaks to keep practice focused.
   */
  async rewardStreak(streak, isPractice = false) {
    if (isPractice) return;

    if (streak > 0 && streak % 3 === 0) {
      for (const key of Object.keys(this.charges)) {
        if (this.charges[key] < 2) {
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
   * Directly recharges charges for a specific heroine using diamonds (clamped to max 2)
   */
  async rechargeHeroine(heroineId, amount = 1) {
    if (!HEROINES[heroineId]) return false;
    const current = this.charges[heroineId] || 0;
    const newCharges = Math.min(2, current + amount);
    this.charges[heroineId] = newCharges;
    await db.updateCompanionCharges(heroineId, newCharges).catch(() => {});
    this.notifyListeners();
    return newCharges;
  }

  /**
   * Recharges a single power for practice mode upon completing a Combo Burst
   */
  async rechargeOnePower(maxCharge = 2) {
    const keys = ['valen', 'reni', 'zoe', 'lia'];
    const eligible = keys.filter((k) => (this.charges[k] || 0) < maxCharge);
    if (eligible.length > 0) {
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      this.charges[pick] = (this.charges[pick] || 0) + 1;
      await db.updateCompanionCharges(pick, this.charges[pick]).catch(() => {});
      this.notifyListeners();
      return pick;
    }
    return null;
  }

  /**
   * Activates the selected heroine power.
   * @param {string} heroineId - 'valen' | 'reni' | 'zoe' | 'lia'
   * @param {Object} context - Game context ({ mathSession, app, isPractice })
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
    if (context && context.isPractice) {
      // En modo práctica voz más concisa
    } else {
      speech.speakDialogue(heroine.voiceQuote, heroineId);
    }

    let effectResult = {};

    switch (heroineId) {
      case 'valen': {
        // Valen: Discards 1 distractor in practice, up to 2 in adventure
        effectResult = this.applyValenPower(context);
        break;
      }
      case 'reni': {
        // Reni: Brief breathing pause
        effectResult = this.applyReniPower(context);
        break;
      }
      case 'zoe': {
        // Zoe: Roots Shield protects streak
        effectResult = this.applyZoePower(context);
        break;
      }
      case 'lia': {
        // Lía: Operator highlight or clue
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
    const { mathSession, app, isPractice } = context;
    if (app) {
      // Prisma Real: en aventura 2x estrellas; en práctica ventaja mínima (1x)
      app.starMultiplier = isPractice ? 1 : 2;
    }

    const card = typeof document !== 'undefined' ? document.getElementById('math-challenge-card') : null;
    if (card) {
      card.classList.add('royal-boost');
      setTimeout(() => {
        card.classList.remove('royal-boost');
      }, 2000);
    }

    if (context.correctAnswer === undefined && !mathSession) return { discarded: 0, starMultiplier: isPractice ? 1 : 2 };

    let discardedCount = 0;
    if (typeof document !== 'undefined') {
      // If student was on keypad mode, switch to choice mode so discarded options are visible
      if (app && app.inputMode === 'keypad') {
        app.inputMode = 'choice';
        const modeToggle = document.getElementById('btn-toggle-mode');
        if (modeToggle) {
          modeToggle.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-keypad"></use></svg> <span>Cambiar a Teclado Numérico</span>';
        }
        app.renderInputArea();
      }

      const correctAnswer = context.correctAnswer !== undefined
        ? context.correctAnswer
        : (mathSession ? mathSession.get_correct_answer() : 0);
      const buttons = Array.from(document.querySelectorAll(
        '#options-grid .option-btn, #portal-options-grid .portal-option-btn, #math-options-grid .math-option-btn, #reading-options-grid .reading-option-btn'
      ));
      const maxDiscard = isPractice ? 1 : 2; // En práctica solo descarta 1 distractor para ventaja mínima

      for (const btn of buttons) {
        const val = parseInt(btn.textContent, 10);
        if (val !== correctAnswer && !btn.disabled) {
          btn.disabled = true;
          btn.style.opacity = '0.3';
          btn.style.textDecoration = 'line-through';
          btn.style.transform = 'scale(0.9)';
          discardedCount += 1;
          if (discardedCount >= maxDiscard) break;
        }
      }
    }

    if (isPractice) {
      speech.speak('Valen descarta una opción para ayudarte a practicar.');
    }

    return { discarded: discardedCount, starMultiplier: isPractice ? 1 : 2 };
  }

  applyReniPower(context) {
    const { app, isPractice } = context;
    if (app) {
      app.challengeStartTime = performance.now();
    }
    const card = typeof document !== 'undefined' ? document.getElementById('math-challenge-card') : null;
    if (card) {
      card.style.boxShadow = '0 0 25px var(--vq-sky), 0 6px 0 var(--vq-border)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 2000);
    }
    if (isPractice) {
      speech.speak('Reni te da un momento de calma para calcular.');
    }
    return { timeFrozen: true };
  }

  applyZoePower(context) {
    const { mathSession, app, isPractice } = context;
    if (app) {
      // Escudo de Raíces: protege la racha ante un tropiezo
      app.streakShieldActive = true;
    }

    if (isPractice) {
      // En práctica, mensaje ágil sin interrumpir el ritmo arcade
      speech.speak('¡Escudo de Zoe activo para cuidar tu racha!');
    } else if (mathSession) {
      const op1 = mathSession.get_operand1();
      const op = mathSession.get_operator();
      const op2 = mathSession.get_operand2();

      let hint = '';
      if (op === '+') {
        hint = `Tienes ${op1}, y le añades ${op2}. Imagina contar hacia adelante desde ${op1}.`;
      } else if (op === '-') {
        hint = `Comienzas con ${op1} y quitas ${op2}. Cuenta hacia atrás para descubrir lo que queda.`;
      } else if (op === '×') {
        hint = `Multiplicar es sumar varias veces: son ${op1} grupos de ${op2}.`;
      }
      speech.speak(hint, { rate: 0.88, pitch: 1.15 });
    }

    const card = typeof document !== 'undefined' ? document.getElementById('math-challenge-card') : null;
    if (card) {
      card.classList.add('shield-protect');
      setTimeout(() => {
        card.classList.remove('shield-protect');
      }, 2000);
    }

    return { spoken: true, shieldActive: true };
  }

  applyLiaPower(context) {
    const { mathSession, isPractice } = context;
    const card = typeof document !== 'undefined' ? document.getElementById('math-challenge-card') : null;
    if (card) {
      card.classList.add('crystal-focus');
      setTimeout(() => {
        card.classList.remove('crystal-focus');
      }, 2000);
    }

    if (isPractice) {
      const op = context.operator || (mathSession ? mathSession.get_operator() : '+');
      speech.speak(`Lía enfoca el signo ${op}: ¡atenta a la operación!`);
      return { crystalFocus: true, clue: 'Pista de signo' };
    }

    let clue = '';
    if (mathSession) {
      const op1 = mathSession.get_operand1();
      const op = mathSession.get_operator();
      const op2 = mathSession.get_operand2();
      const ans = mathSession.get_correct_answer();

      if (op === '+') {
        if (op1 + op2 >= 10) {
          const unit1 = op1 % 10;
          const unit2 = op2 % 10;
          clue = `¡Foco de Cristal! ${op1} más ${op2} cruza la decena: suma primero las unidades ${unit1} + ${unit2} = ${unit1 + unit2}.`;
        } else {
          clue = `¡Foco de Cristal! Suma directa: reúne ${op1} y ${op2} para obtener ${ans}.`;
        }
      } else if (op === '-') {
        if (op1 >= 10 && (op1 % 10) < (op2 % 10)) {
          clue = `¡Foco de Cristal! Descompón la decena de ${op1} para restar ${op2} con facilidad.`;
        } else {
          clue = `¡Foco de Cristal! A ${op1} le quitas ${op2}, te quedan ${ans}.`;
        }
      } else if (op === '×') {
        clue = `¡Foco de Cristal! Multiplicar ${op1} × ${op2}: suma ${op1} veces el número ${op2}.`;
      }

      speech.speak(clue, { rate: 0.9, pitch: 1.15 });
    }

    return { crystalFocus: true, clue };
  }

  /**
   * Applies CSS classes to heroine avatar containers so equipped SVG layers become visible
   * @param {string|null} overrideHeroineId - Optional heroine ID to display on wardrobe preview avatar
   */
  applyEquippedCosmeticsClasses(overrideHeroineId = null) {
    const baseLayerNames = [
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

    // Mapeo de cosméticos (incluyendo los 10 premios de Templos Lunares) a la capa base SVG
    const COSMETIC_LAYER_MAP = {
      'tiara-basica': 'tiara-basica',
      'tiara-cristal': 'tiara-cristal',
      'lazo-cielo': 'lazo-cielo',
      'alas-aurora': 'alas-aurora',
      'corona-hojas': 'corona-hojas',
      'amuleto-bosque': 'amuleto-bosque',
      'tiara-solsticio': 'tiara-solsticio',
      'cetro-cometa': 'cetro-cometa',
      'alas-majestuosas': 'alas-majestuosas',
      // Recompensas de los 10 Templos Lunares:
      'tiara-rocio-astral': 'tiara-basica',
      'lazo-viento-celeste': 'lazo-cielo',
      'alas-pluma-dulce': 'alas-aurora',
      'corona-floral-silvestre': 'corona-hojas',
      'cetro-estelar-radiante': 'cetro-cometa',
      'reloj-bolsillo-astral': 'cetro-cometa',
      'aura-burbujas-iridiscentes': 'alas-majestuosas',
      'armadura-petalos-seda': 'amuleto-bosque',
      'alas-tornasol-aurora': 'alas-aurora',
      'corona-suprema-soberana': 'tiara-cristal',
    };

    const updateTargetClasses = (container, equippedMap) => {
      if (!container) return;
      const equippedItemIds = Object.values(equippedMap).filter(Boolean);
      const activeLayerNames = new Set(
        equippedItemIds.map((id) => COSMETIC_LAYER_MAP[id] || id)
      );

      // Activar capas base SVG
      baseLayerNames.forEach((layerName) => {
        container.classList.toggle(`equipped-${layerName}`, activeLayerNames.has(layerName));
      });

      // Alternar clases directas por cada itemId
      Object.keys(COSMETIC_LAYER_MAP).forEach((itemId) => {
        container.classList.toggle(`equipped-${itemId}`, equippedItemIds.includes(itemId));
      });
    };

    ['valen', 'reni', 'zoe', 'lia'].forEach((heroineId) => {
      const card = document.getElementById(`card-heroine-${heroineId}`);
      if (card) {
        updateTargetClasses(card, this.getEquipped(heroineId));
      }
    });

    // Also update wardrobe preview container if present
    const preview = document.getElementById('wardrobe-preview-avatar');
    if (preview) {
      const targetHeroine = overrideHeroineId || this.activeId;
      updateTargetClasses(preview, this.getEquipped(targetHeroine));
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
