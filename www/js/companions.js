/**
 * ValenQuest Companions & Friendship Powers Module
 * Manages the trio of heroines: Valen, Mia, and Zoe.
 * Coordinates their animated avatars, lore quotes, and friendship powers during quest challenges.
 */

import { sound } from './audio.js';
import { speech } from './speech.js';

export const HEROINES = {
  valen: {
    id: 'valen',
    name: 'Valen',
    title: 'Guardiana del Prisma Astral',
    element: 'Luz y Armonía',
    color: 'var(--vq-pink-bubble)',
    symbolId: 'vq-heroine-valen',
    emoji: '🦄',
    powerName: 'Prisma Revelador',
    powerDescription: 'Refracta la luz para descartar una respuesta incorrecta.',
    voiceQuote: '¡Mira el reflejo del prisma! He apartado una respuesta que no es.',
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    title: 'Alquimista de los Vientos',
    element: 'Brisa y Tiempo',
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
    title: 'Guardiana de la Sabiduría',
    element: 'Naturaleza y Palabras',
    color: 'var(--vq-mint)',
    symbolId: 'vq-heroine-zoe',
    emoji: '🌿',
    powerName: 'Susurro Sabio',
    powerDescription: 'Explica el cálculo o pronuncia la palabra con voz pausada paso a paso.',
    voiceQuote: 'Escucha el susurro de las estrellas: vamos a resolverlo paso a pasito.',
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
    };
    this.isGated = false;
    this.onPowerUsedListeners = new Set();
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

  setActive(id) {
    if (HEROINES[id]) {
      this.activeId = id;
      sound.playClick();
      return true;
    }
    return false;
  }

  getCharges(id) {
    return this.charges[id] || 0;
  }

  /**
   * Refills friendship charges upon reaching streak milestones.
   */
  rewardStreak(streak) {
    if (streak > 0 && streak % 3 === 0) {
      Object.keys(this.charges).forEach((key) => {
        if (this.charges[key] < 3) {
          this.charges[key] += 1;
        }
      });
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
    sound.playLevelUp();
    speech.speakDialogue(heroine.voiceQuote);

    let effectResult = {};

    switch (heroineId) {
      case 'valen': {
        // Valen: Discards 1 wrong distractor from DOM
        effectResult = this.applyValenPower(context);
        break;
      }
      case 'mia': {
        // Mia: Freezes time and resets challenge timer
        effectResult = this.applyMiaPower(context);
        break;
      }
      case 'zoe': {
        // Zoe: Explains problem step by step with TTS and visual highlight
        effectResult = this.applyZoePower(context);
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
    const { mathSession } = context;
    if (!mathSession) return { spoken: false };

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

    const card = document.getElementById('math-challenge-card');
    if (card) {
      card.style.borderColor = 'var(--vq-mint)';
      setTimeout(() => {
        card.style.borderColor = '';
      }, 2500);
    }

    return { spoken: true, hint };
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
