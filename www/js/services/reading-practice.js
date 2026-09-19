/**
 * ValenQuest: Reading Practice Service (La Pluma de la Fluidez)
 * Orquestador del taller de lenguaje y fluidez estructurado en 5 niveles de maestría.
 * Implementa generador de retos, cálculo de racha, Combo Lírico (0% a 100%),
 * progresión de maestría (desbloqueo de niveles por aciertos)
 * y recompensas en Diamantes con persistencia en IndexedDB (valenquest_db).
 */
import { db } from './storage.js';

export const READING_LEVELS = [
  {
    level: 1,
    id: 'ecos-rocio',
    name: 'Ecos de Rocío',
    shortName: 'Palabras Directas',
    description: 'Silabeo básico y palabras bisílabas (ma-pa, lu-na).',
    svgIcon: 'quill',
  },
  {
    level: 2,
    id: 'vientos-cruzados',
    name: 'Vientos Cruzados',
    shortName: 'Sílabas Trabadas',
    description: 'Grupos consonánticos inseparables (bra, pla, tro, glu).',
    svgIcon: 'leaf',
  },
  {
    level: 3,
    id: 'pergaminos-cantarines',
    name: 'Pergaminos Cantarines',
    shortName: 'Oraciones con Orión',
    description: 'Frases completas con lectura asistida en voz alta.',
    svgIcon: 'scroll',
  },
  {
    level: 4,
    id: 'vuelo-rapido-rsvp',
    name: 'Vuelo Rápido RSVP',
    shortName: 'Velocímetro RSVP',
    description: 'Entrenamiento de velocidad visual palabra a palabra.',
    svgIcon: 'bolt',
  },
  {
    level: 5,
    id: 'fabulas-grimorio',
    name: 'Fábulas del Grimorio',
    shortName: 'Comprensión Lectora',
    description: 'Micro-cuentos, inferencias, sinónimos y rimas.',
    svgIcon: 'reading',
  },
];

// Banco de retos (SSOT: data/reading-challenges.json).
// El respaldo embebido (1 reto por nivel) solo cubre el arranque sin red;
// el catálogo completo de 180 retos llega por fetch en loadReadingChallenges().
let CHALLENGES_BY_LEVEL = {
  "1": [
    {
      "type": "syllables",
      "prompt": "¿Qué palabra se forma al unir las sílabas?",
      "displayHtml": "<span class=\"syl syl-1\">LU</span> <span class=\"syl-sep\">•</span> <span class=\"syl syl-2\">NA</span>",
      "speakText": "Lu... na...",
      "options": [
        "Luna",
        "Lupa",
        "Lana",
        "Lona"
      ],
      "answer": "Luna",
      "hint": "Brilla en la noche estrellada de Lumiria."
    }
  ],
  "2": [
    {
      "type": "blend",
      "prompt": "¿Qué palabra tiene el grupo consonántico \"PL\"?",
      "displayHtml": "<span class=\"blend-highlight\">PL</span>",
      "speakText": "¿Cuál palabra tiene el sonido PL?",
      "options": [
        "Pluma",
        "Puma",
        "Palma",
        "Perla"
      ],
      "answer": "Pluma",
      "hint": "El instrumento mágico de la lectura."
    }
  ],
  "3": [
    {
      "type": "sentence",
      "prompt": "Lee la oración con Orión y responde:",
      "sentence": "El unicornio de Valen vuela sobre la nube rosa.",
      "question": "¿Dónde vuela el unicornio?",
      "speakText": "El unicornio de Valen vuela sobre la nube rosa. ¿Dónde vuela el unicornio?",
      "options": [
        "Sobre la nube rosa",
        "Bajo las piedras",
        "En la cueva oscura",
        "Dentro del pozo"
      ],
      "answer": "Sobre la nube rosa",
      "hint": "Mira los colores mágicos del cielo."
    }
  ],
  "4": [
    {
      "type": "rsvp",
      "prompt": "¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:",
      "words": [
        "La",
        "princesa",
        "enciende",
        "la",
        "antorcha",
        "dorada"
      ],
      "question": "¿Qué enciende la princesa?",
      "speakText": "¿Qué enciende la princesa?",
      "options": [
        "La antorcha dorada",
        "Una fogata grande",
        "Una vela roja",
        "Una lámpara vieja"
      ],
      "answer": "La antorcha dorada",
      "hint": "Recuerda el objeto brillante que sostiene en la mano."
    }
  ],
  "5": [
    {
      "type": "fable",
      "prompt": "Lee la pequeña fábula y encuentra la respuesta sabia:",
      "title": "El Pequeño Cohete Curioso",
      "text": "Chispa era un cohete diminuto que vivía en el Valle de los Luceros. Todas las noches miraba la luna plateada y soñaba con visitarla para cantar juntos una nana estelar. Con valentía y corazón puro, encendió sus motores y voló alto hasta alcanzarla.",
      "question": "¿Por qué Chispa logró alcanzar la luna?",
      "speakText": "Chispa era un cohete diminuto que soñaba visitar la luna. Con valentía y corazón puro, encendió sus motores y voló alto hasta alcanzarla. ¿Por qué Chispa logró alcanzar la luna?",
      "options": [
        "Por su valentía y corazón puro",
        "Porque era el más grande",
        "Porque tenía miedo",
        "Por casualidad del viento"
      ],
      "answer": "Por su valentía y corazón puro",
      "hint": "Fíjate en las virtudes del pequeño Chispa."
    }
  ]
};
let readingBankLoaded = false;
let readingBankPromise = null;

/**
 * Carga el catálogo completo de retos. Idempotente y tolerante a fallos:
 * sin red se conserva el respaldo embebido.
 */
export async function loadReadingChallenges() {
  if (readingBankLoaded) return CHALLENGES_BY_LEVEL;
  if (readingBankPromise) return readingBankPromise;
  readingBankPromise = (async () => {
    try {
      const res = await fetch('data/reading-challenges.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.levels && Array.isArray(data.levels['1']) && data.levels['1'].length > 0) {
        CHALLENGES_BY_LEVEL = data.levels;
      }
    } catch (err) {
      console.warn('⚠️ [Reading] Catálogo en respaldo embebido:', err?.message || err);
    }
    readingBankLoaded = true;
    return CHALLENGES_BY_LEVEL;
  })();
  return readingBankPromise;
}

export class ReadingPracticeService {
  constructor() {
    this.selectedLevel = 1;
    this.unlockedLevels = [1];
    this.masteredLevels = [];
    this.levelMastery = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.targetAciertos = 30;
    this.streak = 0;
    this.highestStreak = 0;
    this.totalAnswered = 0;
    this.combo = 0; // 0% a 100%
    this.totalCombos = 0;
    this.diamondsEarned = 0;
    this.wordsRead = 0;
    this.highestWpm = 120;
    this.lastWpm = 0;
    this.listeners = [];
    // Motor Rust/WASM (silabeo RAE + WPM). Se inyecta con init(wasm).
    this.readingWasm = null;
    this.readingSession = null;
    this.syllableQa = { checked: 0, mismatches: [] };
    this.currentChallenge = this.generateChallenge();
  }

  /**
   * Cablea el motor de lectura: a partir de aquí el WPM es real
   * (ReadingSession.calculate_wpm) y el banco curado se verifica
   * contra el silabeo RAE (parse_text_syllables).
   */
  init(wasm) {
    this.readingWasm = wasm || null;
    try {
      if (wasm && wasm.ReadingSession) {
        this.readingSession = new wasm.ReadingSession();
        this.verifyCuratedSplits();
      }
    } catch (err) {
      console.warn('ReadingPracticeService: sin motor WASM:', err?.message || err);
      this.readingSession = null;
    }
    return this.getState();
  }

  /**
   * QA editorial contra el motor: compara la segmentación curada de cada
   * reto silábico con el silabeo fonotáctico RAE. Solo avisa por consola;
   * el contenido curado manda (el motor verifica, no reescribe).
   */
  verifyCuratedSplits() {
    this.syllableQa = { checked: 0, mismatches: [] };
    if (!this.readingSession || typeof this.readingSession.parse_text_syllables !== 'function') {
      return this.syllableQa;
    }
    for (const [lvl, items] of Object.entries(CHALLENGES_BY_LEVEL)) {
      for (const item of items) {
        if (item.type !== 'syllables' || !item.displayHtml || !item.answer) continue;
        const curated = (item.displayHtml.match(/syl syl-\d+/g) || []).length;
        if (!curated) continue;
        let parsedTotal = -1;
        try {
          const parsed = JSON.parse(this.readingSession.parse_text_syllables(String(item.answer)));
          parsedTotal = parsed.reduce((n, w) => n + (w.syllables ? w.syllables.length : 0), 0);
        } catch {
          continue;
        }
        this.syllableQa.checked++;
        if (parsedTotal !== curated) {
          this.syllableQa.mismatches.push({ level: lvl, answer: item.answer, curated, rae: parsedTotal });
        }
      }
    }
    if (this.syllableQa.mismatches.length > 0) {
      console.warn(
        `⚠️ [Reading QA] ${this.syllableQa.mismatches.length}/${this.syllableQa.checked} segmentaciones difieren del silabeo RAE:`,
        this.syllableQa.mismatches.slice(0, 5)
      );
    }
    return this.syllableQa;
  }

  /** WPM real vía motor (con fallback aritmético sin WASM). */
  measureWpm(wordCount, elapsedMs) {
    const words = Math.max(1, Number(wordCount) || 1);
    const ms = Math.max(1, Math.round(elapsedMs) || 1);
    try {
      if (this.readingWasm && this.readingWasm.ReadingSession) {
        return this.readingWasm.ReadingSession.calculate_wpm(words, ms);
      }
    } catch {}
    return Math.round(words / (ms / 60000));
  }

  get currentLevel() {
    return this.selectedLevel;
  }

  async loadState() {
    // Catálogo completo antes de jugar (con respaldo embebido si falla).
    try {
      await loadReadingChallenges();
      this.verifyCuratedSplits();
      this.generateChallenge();
    } catch (err) {
      console.warn('ReadingPracticeService: banco:', err?.message || err);
    }
    try {
      const state = await db.getModuleState('reading_practice');
      if (state) {
        this.selectedLevel = state.selectedLevel || 1;
        this.unlockedLevels = Array.isArray(state.unlockedLevels) && state.unlockedLevels.length > 0
          ? state.unlockedLevels
          : [1];
        if (!this.unlockedLevels.includes(1)) {
          this.unlockedLevels.push(1);
        }
        this.masteredLevels = Array.isArray(state.masteredLevels) ? state.masteredLevels : [];
        this.levelMastery = state.levelMastery && typeof state.levelMastery === 'object'
          ? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...state.levelMastery }
          : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (!this.unlockedLevels.includes(this.selectedLevel)) {
          this.selectedLevel = Math.max(...this.unlockedLevels);
        }

        this.streak = state.streak || 0;
        this.highestStreak = state.highestStreak || 0;
        this.totalAnswered = state.totalAnswered || 0;
        this.totalCombos = state.totalCombos || 0;
        // Billetera única: los diamantes viven en profile.diamonds;
        // aquí solo se acumula la sesión (no persiste).
        this.diamondsEarned = 0;
        this.wordsRead = state.wordsRead || 0;
        this.highestWpm = state.highestWpm || 120;
        this.combo = typeof state.combo === 'number' ? state.combo : 0;
      }
    } catch (err) {
      console.warn('ReadingPracticeService: error loading state:', err);
    }
    this.notify();
    return this.getState();
  }

  async saveState() {
    try {
      const payload = {
        selectedLevel: this.selectedLevel,
        unlockedLevels: this.unlockedLevels,
        masteredLevels: this.masteredLevels,
        levelMastery: this.levelMastery,
        levelName: this.getCurrentLevelInfo().name,
        streak: this.streak,
        highestStreak: this.highestStreak,
        totalAnswered: this.totalAnswered,
        totalCombos: this.totalCombos,
        combo: this.combo || 0,
        wordsRead: this.wordsRead,
        highestWpm: this.highestWpm,
      };
      await db.saveModuleState('reading_practice', payload);
    } catch (err) {
      console.warn('ReadingPracticeService: error saving state:', err);
    }
    this.notify();
  }

  getLevels() {
    return READING_LEVELS;
  }

  getCurrentLevelInfo() {
    return (
      READING_LEVELS.find((lvl) => lvl.level === this.selectedLevel) ||
      READING_LEVELS[0]
    );
  }

  getState() {
    if (!this.currentChallenge) {
      this.generateChallenge();
    }
    return {
      selectedLevel: this.selectedLevel,
      levelInfo: this.getCurrentLevelInfo(),
      unlockedLevels: this.unlockedLevels,
      masteredLevels: this.masteredLevels,
      levelMastery: this.levelMastery,
      currentMastery: this.levelMastery[this.selectedLevel] || 0,
      isCurrentMastered: this.masteredLevels.includes(this.selectedLevel) || ((this.levelMastery[this.selectedLevel] || 0) >= 100),
      targetAciertos: this.targetAciertos,
      streak: this.streak,
      highestStreak: this.highestStreak,
      totalAnswered: this.totalAnswered,
      combo: typeof this.combo === 'number' ? this.combo : 0,
      totalCombos: this.totalCombos || 0,
      diamondsEarned: this.diamondsEarned || 0,
      wordsRead: this.wordsRead,
      highestWpm: this.highestWpm,
      currentChallenge: this.currentChallenge,
    };
  }

  async setLevel(level) {
    const validLevel = Math.max(1, Math.min(5, Number(level) || 1));
    if (!this.unlockedLevels.includes(validLevel)) {
      return { success: false, reason: 'locked', level: validLevel };
    }
    this.selectedLevel = validLevel;
    this.streak = 0;
    this.combo = 0;
    this.generateChallenge();
    await this.saveState();
    return { success: true, state: this.getState() };
  }

  generateChallenge() {
    const bank = CHALLENGES_BY_LEVEL[this.selectedLevel] || CHALLENGES_BY_LEVEL[1];
    let pool = bank;

    // Evitar repetir inmediatamente el mismo reto si hay opciones
    if (this.currentChallenge && pool.length > 1) {
      pool = bank.filter((item) => item.answer !== this.currentChallenge.answer);
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex] || bank[0];

    // Barajar opciones
    const shuffledOptions = [...chosen.options].sort(() => Math.random() - 0.5);

    this.currentChallenge = {
      ...chosen,
      options: shuffledOptions,
      generatedAt: Date.now(),
    };

    this.notify();
    return this.currentChallenge;
  }

  checkAnswer(userAnswer, elapsedMs = 0, options = {}) {
    if (!this.currentChallenge) {
      this.generateChallenge();
    }

    const isCorrect = String(userAnswer).trim().toLowerCase() === String(this.currentChallenge.answer).trim().toLowerCase();
    const isShieldActive = Boolean(options?.shieldActive);
    this.totalAnswered++;
    let comboBurst = false;
    let earnedDiamonds = 0;
    let masteryGain = 0;
    let justMastered = false;
    let newlyUnlockedLevel = null;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
      // Medición real: el texto del reto (fábula/oración/RSVP) se cronometra
      // con el motor (calculate_wpm); sin texto se cuenta 1 palabra.
      const readingText = this.currentChallenge.text
        || this.currentChallenge.sentence
        || this.currentChallenge.speakText
        || '';
      const wordCount = readingText ? readingText.split(/\s+/).filter(Boolean).length : 1;
      this.wordsRead += wordCount;
      const wpm = this.measureWpm(wordCount, elapsedMs);
      this.lastWpm = wpm;
      if (wpm > this.highestWpm) this.highestWpm = wpm;

      // Progreso de Maestría Lector: Base +3.4% (30 aciertos base para alcanzar el 100%),
      // con bonificación acelerada (+4.5%) si la racha es >= 3
      masteryGain = this.streak >= 3 ? 4.5 : 3.4;

      const isTimerFrozen = Boolean(options?.timerFrozen);
      const isAgile = isTimerFrozen || (elapsedMs > 0 && elapsedMs <= 6000);
      const gain = isAgile ? 25 : 20;
      const nextCombo = Math.min(100, (this.combo || 0) + gain);

      // Cálculo de Diamantes (Brisa Ágil 6s o Congelado da 2 diamantes, Modo Calma sin prisa da 1)
      const baseDiamonds = isAgile ? 2 : 1;
      const isStreakMilestone = this.streak > 0 && this.streak % 3 === 0;
      const streakBonus = isStreakMilestone ? 1 : 0;
      earnedDiamonds = baseDiamonds + streakBonus;

      if (nextCombo >= 100) {
        comboBurst = true;
        this.totalCombos = (this.totalCombos || 0) + 1;
        this.combo = 100; // Se mantiene en 100% para visualización del burst en UI
        earnedDiamonds += 10; // +10 Diamantes bonus por Súper Combo Lírico

        // Súper Combo Lírico otorga un impulso de +10% de maestría adicional
        masteryGain += 10;
      } else {
        this.combo = nextCombo;
      }

      // Actualizar la maestría del nivel actual (máximo 100%)
      const currentMastery = this.levelMastery[this.selectedLevel] || 0;
      const newMastery = Math.min(100, Math.round((currentMastery + masteryGain) * 10) / 10);
      this.levelMastery[this.selectedLevel] = newMastery;

      // Evaluar coronación del nivel si alcanza el 100%
      if (newMastery >= 100 && !this.masteredLevels.includes(this.selectedLevel)) {
        justMastered = true;
        this.masteredLevels.push(this.selectedLevel);
        earnedDiamonds += 15; // Cofre de recompensa especial: +15 diamantes al coronar el nivel

        // Desbloquear el siguiente nivel si existe
        if (this.selectedLevel < 5) {
          const nextLvl = this.selectedLevel + 1;
          if (!this.unlockedLevels.includes(nextLvl)) {
            this.unlockedLevels.push(nextLvl);
            newlyUnlockedLevel = nextLvl;
          }
        }
      }

      this.diamondsEarned = (this.diamondsEarned || 0) + earnedDiamonds;
    } else {
      if (isShieldActive) {
        // Escudo de Zoe: Racha y combo protegidos
      } else {
        // Pedagogía sin castigo: Racha y combo a 0, pero la maestría acumulada se mantiene intacta
        this.streak = 0;
        this.combo = 0;
      }
    }

    this.saveState();
    this.notify();

    return {
      isCorrect,
      shieldAbsorbed: !isCorrect && isShieldActive,
      streak: this.streak,
      highestStreak: this.highestStreak,
      combo: typeof this.combo === 'number' ? this.combo : 0,
      comboBurst,
      totalCombos: this.totalCombos || 0,
      masteryGain,
      currentMastery: this.levelMastery[this.selectedLevel] || 0,
      justMastered,
      newlyUnlockedLevel,
      unlockedLevels: this.unlockedLevels,
      masteredLevels: this.masteredLevels,
      earnedDiamonds,
      totalDiamonds: this.diamondsEarned,
      correctAnswer: this.currentChallenge.answer,
      wpm: this.lastWpm || 0,
      wordsRead: this.wordsRead,
      highestWpm: this.highestWpm,
    };
  }

  resetCombo() {
    this.combo = 0;
    this.saveState();
    this.notify();
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
