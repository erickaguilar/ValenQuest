/**
 * ValenQuest: Reading Practice Service (La Pluma de la Fluidez)
 * Orquestador del taller de lenguaje y fluidez estructurado en 5 niveles de maestría.
 * Implementa generador de retos, cálculo de racha, Combo Lírico (0% a 100%)
 * y recompensas en Diamantes (💎) con persistencia en IndexedDB (valenquest_db).
 */
import { storage } from './storage.js';

export const READING_LEVELS = [
  {
    level: 1,
    id: 'ecos-rocio',
    name: 'Ecos de Rocío',
    shortName: 'Palabras Directas',
    description: 'Silabeo básico y palabras bisílabas (ma-pa, lu-na).',
    icon: '💧',
  },
  {
    level: 2,
    id: 'vientos-cruzados',
    name: 'Vientos Cruzados',
    shortName: 'Sílabas Trabadas',
    description: 'Grupos consonánticos inseparables (bra, pla, tro, glu).',
    icon: '🍃',
  },
  {
    level: 3,
    id: 'pergaminos-cantarines',
    name: 'Pergaminos Cantarines',
    shortName: 'Oraciones con Orión',
    description: 'Frases completas con lectura asistida en voz alta.',
    icon: '📜',
  },
  {
    level: 4,
    id: 'vuelo-rapido-rsvp',
    name: 'Vuelo Rápido RSVP',
    shortName: 'Velocímetro RSVP',
    description: 'Entrenamiento de velocidad visual palabra a palabra.',
    icon: '⚡',
  },
  {
    level: 5,
    id: 'fabulas-grimorio',
    name: 'Fábulas del Grimorio',
    shortName: 'Comprensión Lectora',
    description: 'Micro-cuentos, inferencias, sinónimos y rimas.',
    icon: '📖',
  },
];

// Banco Curado de Retos Lingüísticos por Nivel
const CHALLENGES_BY_LEVEL = {
  1: [
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">LU</span> <span class="syl-sep">•</span> <span class="syl syl-2">NA</span>',
      speakText: 'Lu... na...',
      options: ['Luna', 'Lupa', 'Lana'],
      answer: 'Luna',
      hint: 'Brilla en la noche estrellada de Lumiria.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">SO</span> <span class="syl-sep">•</span> <span class="syl syl-2">PA</span>',
      speakText: 'So... pa...',
      options: ['Sopa', 'Sapo', 'Sola'],
      answer: 'Sopa',
      hint: 'Comida caliente y deliciosa.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">CA</span> <span class="syl-sep">•</span> <span class="syl syl-2">SA</span>',
      speakText: 'Ca... sa...',
      options: ['Casa', 'Cama', 'Caja'],
      answer: 'Casa',
      hint: 'Lugar donde descansas con tu familia.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">MA</span> <span class="syl-sep">•</span> <span class="syl syl-2">PA</span>',
      speakText: 'Ma... pa...',
      options: ['Mapa', 'Mano', 'Masa'],
      answer: 'Mapa',
      hint: 'Guía el camino por los 10 Templos.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">RO</span> <span class="syl-sep">•</span> <span class="syl syl-2">SA</span>',
      speakText: 'Ro... sa...',
      options: ['Rosa', 'Ropa', 'Roca'],
      answer: 'Rosa',
      hint: 'Una flor hermosa de pétalos suaves.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">PA</span> <span class="syl-sep">•</span> <span class="syl syl-2">TO</span>',
      speakText: 'Pa... to...',
      options: ['Pato', 'Paso', 'Palo'],
      answer: 'Pato',
      hint: 'Ave que nada alegre en el estanque.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">GA</span> <span class="syl-sep">•</span> <span class="syl syl-2">TO</span>',
      speakText: 'Ga... to...',
      options: ['Gato', 'Gota', 'Gallo'],
      answer: 'Gato',
      hint: 'Amiguito de bigotes que dice miau.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">FO</span> <span class="syl-sep">•</span> <span class="syl syl-2">CA</span>',
      speakText: 'Fo... ca...',
      options: ['Foca', 'Foco', 'Foto'],
      answer: 'Foca',
      hint: 'Nada feliz en las aguas de Lumiria.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">ES</span> <span class="syl-sep">•</span> <span class="syl syl-2">TRE</span> <span class="syl-sep">•</span> <span class="syl syl-3">LLA</span>',
      speakText: 'Es... tre... lla...',
      options: ['Estrella', 'Escuela', 'Espejo'],
      answer: 'Estrella',
      hint: 'Ilumina los cielos de las princesas.',
    },
  ],
  2: [
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PL"?',
      displayHtml: '<span class="blend-highlight">PL</span>',
      speakText: '¿Cuál palabra tiene el sonido PL?',
      options: ['Pluma', 'Puma', 'Palma'],
      answer: 'Pluma',
      hint: 'El instrumento mágico de la lectura.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "GL"?',
      displayHtml: '<span class="blend-highlight">GL</span>',
      speakText: '¿Cuál palabra tiene el sonido GL?',
      options: ['Globo', 'Lobo', 'Gota'],
      answer: 'Globo',
      hint: 'Flota suave en el aire de Lumiria.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: BRA - ZO?',
      displayHtml: '<span class="syl syl-1">BRA</span> <span class="syl-sep">•</span> <span class="syl syl-2">ZO</span>',
      speakText: 'Bra... zo...',
      options: ['Brazo', 'Barco', 'Bazo'],
      answer: 'Brazo',
      hint: 'Parte de tu cuerpo que abraza.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "TR"?',
      displayHtml: '<span class="blend-highlight">TR</span>',
      speakText: '¿Cuál palabra tiene el sonido TR?',
      options: ['Trébol', 'Torre', 'Trote'],
      answer: 'Trébol',
      hint: 'Planta de la suerte de cuatro hojas.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: FRU - TA?',
      displayHtml: '<span class="syl syl-1">FRU</span> <span class="syl-sep">•</span> <span class="syl syl-2">TA</span>',
      speakText: 'Fru... ta...',
      options: ['Fruta', 'Furia', 'Fuerte'],
      answer: 'Fruta',
      hint: 'Alimento dulce y natural de los árboles.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "CR"?',
      displayHtml: '<span class="blend-highlight">CR</span>',
      speakText: '¿Cuál palabra tiene el sonido CR?',
      options: ['Cristal', 'Costal', 'Coral'],
      answer: 'Cristal',
      hint: 'Material reluciente de las tiaras reales.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "DR"?',
      displayHtml: '<span class="blend-highlight">DR</span>',
      speakText: '¿Cuál palabra tiene el sonido DR?',
      options: ['Dragón', 'Dardo', 'Danza'],
      answer: 'Dragón',
      hint: 'Criatura mística y leal de fuego y colores.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "BL"?',
      displayHtml: '<span class="blend-highlight">BL</span>',
      speakText: '¿Cuál palabra tiene el sonido BL?',
      options: ['Blanco', 'Banco', 'Barco'],
      answer: 'Blanco',
      hint: 'El color de las nubes del solsticio.',
    },
  ],
  3: [
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El unicornio de Valen vuela sobre la nube rosa.',
      question: '¿Dónde vuela el unicornio?',
      speakText: 'El unicornio de Valen vuela sobre la nube rosa. ¿Dónde vuela el unicornio?',
      options: ['Sobre la nube rosa', 'Bajo las piedras', 'En la cueva oscura'],
      answer: 'Sobre la nube rosa',
      hint: 'Mira los colores mágicos del cielo.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Reni danza con la brisa fresca del amanecer.',
      question: '¿Con qué danza Reni?',
      speakText: 'Reni danza con la brisa fresca del amanecer. ¿Con qué danza Reni?',
      options: ['Con la brisa fresca', 'Con las sombras', 'Con la lluvia fría'],
      answer: 'Con la brisa fresca',
      hint: 'El viento matutino que acaricia sus alas.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Zoe riega las flores mágicas del bosque sagrado.',
      question: '¿Qué riega Zoe en el bosque?',
      speakText: 'Zoe riega las flores mágicas del bosque sagrado. ¿Qué riega Zoe en el bosque?',
      options: ['Las flores mágicas', 'Las piedras duras', 'Los caracoles'],
      answer: 'Las flores mágicas',
      hint: 'Brotes que crecen con amor.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Lia observa las estrellas doradas desde su balcón real.',
      question: '¿Qué observa Lia desde su balcón?',
      speakText: 'Lia observa las estrellas doradas desde su balcón real. ¿Qué observa Lia?',
      options: ['Las estrellas doradas', 'Los barcos piratas', 'Las nubes grises'],
      answer: 'Las estrellas doradas',
      hint: 'Luces que guían a los guardianes.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El búho Orión lee cuentos antiguos en la biblioteca.',
      question: '¿Dónde lee cuentos el búho Orión?',
      speakText: 'El búho Orión lee cuentos antiguos en la biblioteca. ¿Dónde lee cuentos Orión?',
      options: ['En la biblioteca', 'En el fondo del mar', 'En la cocina'],
      answer: 'En la biblioteca',
      hint: 'El lugar lleno de estantes y pergaminos.',
    },
  ],
  4: [
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'princesa', 'enciende', 'la', 'antorcha', 'dorada'],
      question: '¿Qué enciende la princesa?',
      speakText: '¿Qué enciende la princesa?',
      options: ['La antorcha dorada', 'Una fogata grande', 'Una vela roja'],
      answer: 'La antorcha dorada',
      hint: 'Recuerda el objeto brillante que sostiene en la mano.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Las', 'hadas', 'bailan', 'bajo', 'la', 'luna', 'llena'],
      question: '¿Dónde bailan las hadas?',
      speakText: '¿Dónde bailan las hadas?',
      options: ['Bajo la luna llena', 'Bajo la mesa', 'En el desierto'],
      answer: 'Bajo la luna llena',
      hint: 'El astro plateado de la noche.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'pegaso', 'cruza', 'el', 'arcoíris', 'velozmente'],
      question: '¿Qué cruza el pegaso velozmente?',
      speakText: '¿Qué cruza el pegaso velozmente?',
      options: ['El arcoíris', 'El puente roto', 'El bosque seco'],
      answer: 'El arcoíris',
      hint: 'El puente de siete colores en el cielo.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Un', 'cometa', 'brillante', 'viaja', 'por', 'el', 'cielo'],
      question: '¿Qué viaja brillante por el cielo?',
      speakText: '¿Qué viaja brillante por el cielo?',
      options: ['Un cometa', 'Un avión', 'Un pájaro'],
      answer: 'Un cometa',
      hint: 'Un cuerpo celeste con cola luminosa.',
    },
  ],
  5: [
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Pequeño Cohete Curioso',
      text: 'Chispa era un cohete diminuto que vivía en el Valle de los Luceros. Todas las noches miraba la luna plateada y soñaba con visitarla para cantar juntos una nana estelar. Con valentía y corazón puro, encendió sus motores y voló alto hasta alcanzarla.',
      question: '¿Por qué Chispa logró alcanzar la luna?',
      speakText: 'Chispa era un cohete diminuto que soñaba visitar la luna. Con valentía y corazón puro, encendió sus motores y voló alto hasta alcanzarla. ¿Por qué Chispa logró alcanzar la luna?',
      options: ['Por su valentía y corazón puro', 'Porque era el más grande', 'Porque tenía miedo'],
      answer: 'Por su valentía y corazón puro',
      hint: 'Fíjate en las virtudes del pequeño Chispa.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Dragón que Comía Nubes',
      text: 'Fito era un dragón verde que no escupía fuego, sino ricas burbujas de colores. Cada mañana subía a la montaña más alta para desayunar nubes de fresa y vainilla. Los pájaros cantaban felices a su alrededor porque era bondadoso.',
      question: '¿Qué hacía especial a Fito frente a otros dragones?',
      speakText: 'Fito era un dragón verde que no escupía fuego, sino ricas burbujas de colores. ¿Qué hacía especial a Fito frente a otros dragones?',
      options: ['Escupía burbujas y era bondadoso', 'Era un dragón enojado', 'No tenía alas'],
      answer: 'Escupía burbujas y era bondadoso',
      hint: 'Sus burbujas llenaban el cielo de alegría.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Semilla de Zoe',
      text: 'Zoe encontró una pequeña semilla en el corazón del bosque. En lugar de guardarla en una caja, la plantó en tierra fértil y la regó cada mañana con paciencia. Con el tiempo, creció un árbol frutal gigante que dio sombra y alimento a todos los animales.',
      question: '¿Qué lección nos enseña la acción de Zoe?',
      speakText: 'Zoe plantó la semilla y la cuidó con paciencia hasta crecer un gran árbol. ¿Qué lección nos enseña la acción de Zoe?',
      options: ['La paciencia y compartir dan frutos', 'Es mejor guardar las cosas', 'Los árboles no necesitan agua'],
      answer: 'La paciencia y compartir dan frutos',
      hint: 'Cuidar a los demás hace florecer la vida.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Vuelo Solidario de Reni',
      text: 'Una tarde comenzó una tormenta repentina y los pajaritos pequeños no podían regresar a sus nidos. Reni abrió sus grandes alas de pegaso, desafió el viento y protegió a la bandada hasta dejarlos a salvo en el Templo.',
      question: '¿Cómo ayudó Reni a los pajaritos en peligro?',
      speakText: 'Reni abrió sus grandes alas y protegió a la bandada hasta dejarlos a salvo. ¿Cómo ayudó Reni a los pajaritos?',
      options: ['Los protegió con sus alas valientes', 'Se escondió en su casa', 'Esperó que pasara sola la lluvia'],
      answer: 'Los protegió con sus alas valientes',
      hint: 'El valor de ayudar a quienes lo necesitan.',
    },
  ],
};

export class ReadingPracticeService {
  constructor() {
    this.selectedLevel = 1;
    this.streak = 0;
    this.highestStreak = 0;
    this.totalAnswered = 0;
    this.combo = 0; // 0% a 100%
    this.totalCombos = 0;
    this.diamondsEarned = 0;
    this.wordsRead = 0;
    this.highestWpm = 120;
    this.listeners = [];
    this.currentChallenge = this.generateChallenge();
  }

  get currentLevel() {
    return this.selectedLevel;
  }

  async loadState() {
    try {
      const state = await storage.getModuleState('reading_practice');
      if (state) {
        this.selectedLevel = state.selectedLevel || 1;
        this.streak = state.streak || 0;
        this.highestStreak = state.highestStreak || 0;
        this.totalAnswered = state.totalAnswered || 0;
        this.totalCombos = state.totalCombos || 0;
        this.diamondsEarned = state.diamondsEarned || 0;
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
        levelName: this.getCurrentLevelInfo().name,
        streak: this.streak,
        highestStreak: this.highestStreak,
        totalAnswered: this.totalAnswered,
        totalCombos: this.totalCombos,
        diamondsEarned: this.diamondsEarned || 0,
        combo: this.combo || 0,
        wordsRead: this.wordsRead,
        highestWpm: this.highestWpm,
      };
      await storage.saveModuleState('reading_practice', payload);
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
    this.selectedLevel = validLevel;
    this.generateChallenge();
    await this.saveState();
    return this.getState();
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

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.highestStreak) {
        this.highestStreak = this.streak;
      }
      this.wordsRead += 4; // Promedio de palabras consolidadas por reto

      const gain = elapsedMs > 0 && elapsedMs <= 4000 ? 25 : 20;
      const nextCombo = Math.min(100, (this.combo || 0) + gain);

      // Cálculo de Diamantes (Igual que en matemáticas: Práctica Libre da Diamantes estéticos)
      const baseDiamonds = elapsedMs > 0 && elapsedMs <= 4000 ? 2 : 1;
      const isStreakMilestone = this.streak > 0 && this.streak % 3 === 0;
      const streakBonus = isStreakMilestone ? 1 : 0;
      earnedDiamonds = baseDiamonds + streakBonus;

      if (nextCombo >= 100) {
        comboBurst = true;
        this.totalCombos = (this.totalCombos || 0) + 1;
        this.combo = 100; // Se mantiene en 100% para visualización del burst en UI
        earnedDiamonds += 10; // +10 Diamantes bonus por Súper Combo Lírico
      } else {
        this.combo = nextCombo;
      }
      this.diamondsEarned = (this.diamondsEarned || 0) + earnedDiamonds;
    } else {
      if (isShieldActive) {
        // Escudo de Zoe: Racha y combo protegidos
      } else {
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
      earnedDiamonds,
      totalDiamonds: this.diamondsEarned,
      correctAnswer: this.currentChallenge.answer,
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
