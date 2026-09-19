/**
 * ValenQuest: Reading Practice Service (La Pluma de la Fluidez)
 * Orquestador del taller de lenguaje y fluidez estructurado en 5 niveles de maestría.
 * Implementa generador de retos, cálculo de racha, Combo Lírico (0% a 100%),
 * progresión de maestría (desbloqueo de niveles por aciertos)
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
    svgIcon: 'quill',
  },
  {
    level: 2,
    id: 'vientos-cruzados',
    name: 'Vientos Cruzados',
    shortName: 'Sílabas Trabadas',
    description: 'Grupos consonánticos inseparables (bra, pla, tro, glu).',
    icon: '🍃',
    svgIcon: 'leaf',
  },
  {
    level: 3,
    id: 'pergaminos-cantarines',
    name: 'Pergaminos Cantarines',
    shortName: 'Oraciones con Orión',
    description: 'Frases completas con lectura asistida en voz alta.',
    icon: '📜',
    svgIcon: 'scroll',
  },
  {
    level: 4,
    id: 'vuelo-rapido-rsvp',
    name: 'Vuelo Rápido RSVP',
    shortName: 'Velocímetro RSVP',
    description: 'Entrenamiento de velocidad visual palabra a palabra.',
    icon: '⚡',
    svgIcon: 'bolt',
  },
  {
    level: 5,
    id: 'fabulas-grimorio',
    name: 'Fábulas del Grimorio',
    shortName: 'Comprensión Lectora',
    description: 'Micro-cuentos, inferencias, sinónimos y rimas.',
    icon: '📖',
    svgIcon: 'reading',
  },
];

// Banco Curado y Extenso de Retos Lingüísticos por Nivel
const CHALLENGES_BY_LEVEL = {
  1: [
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">LU</span> <span class="syl-sep">•</span> <span class="syl syl-2">NA</span>',
      speakText: 'Lu... na...',
      options: ['Luna', 'Lupa', 'Lana', 'Lona'],
      answer: 'Luna',
      hint: 'Brilla en la noche estrellada de Lumiria.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">SO</span> <span class="syl-sep">•</span> <span class="syl syl-2">PA</span>',
      speakText: 'So... pa...',
      options: ['Sopa', 'Sapo', 'Sola', 'Seda'],
      answer: 'Sopa',
      hint: 'Comida caliente y deliciosa.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">CA</span> <span class="syl-sep">•</span> <span class="syl syl-2">SA</span>',
      speakText: 'Ca... sa...',
      options: ['Casa', 'Cama', 'Caja', 'Cala'],
      answer: 'Casa',
      hint: 'Lugar donde descansas con tu familia.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">MA</span> <span class="syl-sep">•</span> <span class="syl syl-2">PA</span>',
      speakText: 'Ma... pa...',
      options: ['Mapa', 'Mano', 'Masa', 'Mazo'],
      answer: 'Mapa',
      hint: 'Guía el camino por los 10 Templos.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">RO</span> <span class="syl-sep">•</span> <span class="syl syl-2">SA</span>',
      speakText: 'Ro... sa...',
      options: ['Rosa', 'Ropa', 'Roca', 'Rueda'],
      answer: 'Rosa',
      hint: 'Una flor hermosa de pétalos suaves.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">PA</span> <span class="syl-sep">•</span> <span class="syl syl-2">TO</span>',
      speakText: 'Pa... to...',
      options: ['Pato', 'Paso', 'Palo', 'Pavo'],
      answer: 'Pato',
      hint: 'Ave que nada alegre en el estanque.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">GA</span> <span class="syl-sep">•</span> <span class="syl syl-2">TO</span>',
      speakText: 'Ga... to...',
      options: ['Gato', 'Gota', 'Gallo', 'Gorra'],
      answer: 'Gato',
      hint: 'Amiguito de bigotes que dice miau.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">FO</span> <span class="syl-sep">•</span> <span class="syl syl-2">CA</span>',
      speakText: 'Fo... ca...',
      options: ['Foca', 'Foco', 'Foto', 'Fosa'],
      answer: 'Foca',
      hint: 'Nada feliz en las aguas de Lumiria.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">ES</span> <span class="syl-sep">•</span> <span class="syl syl-2">TRE</span> <span class="syl-sep">•</span> <span class="syl syl-3">LLA</span>',
      speakText: 'Es... tre... lla...',
      options: ['Estrella', 'Escuela', 'Espejo', 'Espada'],
      answer: 'Estrella',
      hint: 'Ilumina los cielos de las princesas.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">BO</span> <span class="syl-sep">•</span> <span class="syl syl-2">LA</span>',
      speakText: 'Bo... la...',
      options: ['Bola', 'Bota', 'Boca', 'Boda'],
      answer: 'Bola',
      hint: 'Objeto redondo para jugar en el jardín.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">PI</span> <span class="syl-sep">•</span> <span class="syl syl-2">NO</span>',
      speakText: 'Pi... no...',
      options: ['Pino', 'Pipa', 'Piso', 'Pila'],
      answer: 'Pino',
      hint: 'Árbol alto y verde del bosque sagrado.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">VA</span> <span class="syl-sep">•</span> <span class="syl syl-2">SO</span>',
      speakText: 'Va... so...',
      options: ['Vaso', 'Vela', 'Vino', 'Vaca'],
      answer: 'Vaso',
      hint: 'Recipiente para beber agua fresca.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">LE</span> <span class="syl-sep">•</span> <span class="syl syl-2">CHE</span>',
      speakText: 'Le... che...',
      options: ['Leche', 'Lente', 'Lema', 'Leña'],
      answer: 'Leche',
      hint: 'Bebida blanca y nutritiva.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">MO</span> <span class="syl-sep">•</span> <span class="syl syl-2">NO</span>',
      speakText: 'Mo... no...',
      options: ['Mono', 'Moro', 'Moto', 'Moño'],
      answer: 'Mono',
      hint: 'Animalito ágil que salta de rama en rama.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">FA</span> <span class="syl-sep">•</span> <span class="syl syl-2">RO</span>',
      speakText: 'Fa... ro...',
      options: ['Faro', 'Faja', 'Fama', 'Fase'],
      answer: 'Faro',
      hint: 'Torre con luz que guía a los barcos.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">CO</span> <span class="syl-sep">•</span> <span class="syl syl-2">NE</span> <span class="syl-sep">•</span> <span class="syl syl-3">JO</span>',
      speakText: 'Co... ne... jo...',
      options: ['Conejo', 'Consejo', 'Cofre', 'Cometa'],
      answer: 'Conejo',
      hint: 'Amiguito de orejas largas que come zanahoria.',
    },
  ],
  2: [
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PL"?',
      displayHtml: '<span class="blend-highlight">PL</span>',
      speakText: '¿Cuál palabra tiene el sonido PL?',
      options: ['Pluma', 'Puma', 'Palma', 'Perla'],
      answer: 'Pluma',
      hint: 'El instrumento mágico de la lectura.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "GL"?',
      displayHtml: '<span class="blend-highlight">GL</span>',
      speakText: '¿Cuál palabra tiene el sonido GL?',
      options: ['Globo', 'Lobo', 'Gota', 'Goma'],
      answer: 'Globo',
      hint: 'Flota suave en el aire de Lumiria.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: BRA - ZO?',
      displayHtml: '<span class="syl syl-1">BRA</span> <span class="syl-sep">•</span> <span class="syl syl-2">ZO</span>',
      speakText: 'Bra... zo...',
      options: ['Brazo', 'Barco', 'Bazo', 'Brisa'],
      answer: 'Brazo',
      hint: 'Parte de tu cuerpo que abraza.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "TR"?',
      displayHtml: '<span class="blend-highlight">TR</span>',
      speakText: '¿Cuál palabra tiene el sonido TR?',
      options: ['Trébol', 'Torre', 'Taza', 'Toro'],
      answer: 'Trébol',
      hint: 'Planta de la suerte de cuatro hojas.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: FRU - TA?',
      displayHtml: '<span class="syl syl-1">FRU</span> <span class="syl-sep">•</span> <span class="syl syl-2">TA</span>',
      speakText: 'Fru... ta...',
      options: ['Fruta', 'Furia', 'Fuerte', 'Fuente'],
      answer: 'Fruta',
      hint: 'Alimento dulce y natural de los árboles.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "CR"?',
      displayHtml: '<span class="blend-highlight">CR</span>',
      speakText: '¿Cuál palabra tiene el sonido CR?',
      options: ['Cristal', 'Costal', 'Coral', 'Corona'],
      answer: 'Cristal',
      hint: 'Material reluciente de las tiaras reales.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "DR"?',
      displayHtml: '<span class="blend-highlight">DR</span>',
      speakText: '¿Cuál palabra tiene el sonido DR?',
      options: ['Dragón', 'Dardo', 'Danza', 'Dátil'],
      answer: 'Dragón',
      hint: 'Criatura mística y leal de fuego y colores.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "BL"?',
      displayHtml: '<span class="blend-highlight">BL</span>',
      speakText: '¿Cuál palabra tiene el sonido BL?',
      options: ['Blanco', 'Banco', 'Barco', 'Bolsa'],
      answer: 'Blanco',
      hint: 'El color de las nubes del solsticio.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PR"?',
      displayHtml: '<span class="blend-highlight">PR</span>',
      speakText: '¿Cuál palabra tiene el sonido PR?',
      options: ['Princesa', 'Pesa', 'Plaza', 'Perla'],
      answer: 'Princesa',
      hint: 'Guardián noble del reino de Lumiria.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "GR"?',
      displayHtml: '<span class="blend-highlight">GR</span>',
      speakText: '¿Cuál palabra tiene el sonido GR?',
      options: ['Grillo', 'Gallo', 'Giro', 'Ganso'],
      answer: 'Grillo',
      hint: 'Insecto que canta alegre en las noches de verano.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "CL"?',
      displayHtml: '<span class="blend-highlight">CL</span>',
      speakText: '¿Cuál palabra tiene el sonido CL?',
      options: ['Clavo', 'Caldo', 'Cavo', 'Cuna'],
      answer: 'Clavo',
      hint: 'Pieza de metal que une maderas firmes.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "FL"?',
      displayHtml: '<span class="blend-highlight">FL</span>',
      speakText: '¿Cuál palabra tiene el sonido FL?',
      options: ['Flor', 'Faro', 'Fila', 'Foca'],
      answer: 'Flor',
      hint: 'Brota con hermosos pétalos de colores.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: FRE - SA?',
      displayHtml: '<span class="syl syl-1">FRE</span> <span class="syl-sep">•</span> <span class="syl syl-2">SA</span>',
      speakText: 'Fre... sa...',
      options: ['Fresa', 'Fosa', 'Fila', 'Fama'],
      answer: 'Fresa',
      hint: 'Fruta roja y dulce que le encanta a Zoe.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "TR"?',
      displayHtml: '<span class="blend-highlight">TR</span>',
      speakText: '¿Cuál palabra tiene el sonido TR?',
      options: ['Tren', 'Toro', 'Tela', 'Tina'],
      answer: 'Tren',
      hint: 'Vehículo que viaja veloz sobre las vías.',
    },
  ],
  3: [
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El unicornio de Valen vuela sobre la nube rosa.',
      question: '¿Dónde vuela el unicornio?',
      speakText: 'El unicornio de Valen vuela sobre la nube rosa. ¿Dónde vuela el unicornio?',
      options: ['Sobre la nube rosa', 'Bajo las piedras', 'En la cueva oscura', 'Dentro del pozo'],
      answer: 'Sobre la nube rosa',
      hint: 'Mira los colores mágicos del cielo.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Reni danza con la brisa fresca del amanecer.',
      question: '¿Con qué danza Reni?',
      speakText: 'Reni danza con la brisa fresca del amanecer. ¿Con qué danza Reni?',
      options: ['Con la brisa fresca', 'Con las sombras', 'Con la lluvia fría', 'Con el trueno fuerte'],
      answer: 'Con la brisa fresca',
      hint: 'El viento matutino que acaricia sus alas.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Zoe riega las flores mágicas del bosque sagrado.',
      question: '¿Qué riega Zoe en el bosque?',
      speakText: 'Zoe riega las flores mágicas del bosque sagrado. ¿Qué riega Zoe en el bosque?',
      options: ['Las flores mágicas', 'Las piedras duras', 'Los caracoles', 'Las ramas secas'],
      answer: 'Las flores mágicas',
      hint: 'Brotes que crecen con amor.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Lia observa las estrellas doradas desde su balcón real.',
      question: '¿Qué observa Lia desde su balcón?',
      speakText: 'Lia observa las estrellas doradas desde su balcón real. ¿Qué observa Lia?',
      options: ['Las estrellas doradas', 'Los barcos piratas', 'Las nubes grises', 'Los dragones de fuego'],
      answer: 'Las estrellas doradas',
      hint: 'Luces que guían a los guardianes.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El búho Orión lee cuentos antiguos en la biblioteca.',
      question: '¿Dónde lee cuentos el búho Orión?',
      speakText: 'El búho Orión lee cuentos antiguos en la biblioteca. ¿Dónde lee cuentos Orión?',
      options: ['En la biblioteca', 'En el fondo del mar', 'En la cocina', 'En la cima del volcán'],
      answer: 'En la biblioteca',
      hint: 'El lugar lleno de estantes y pergaminos.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Valen descubrió un cristal brillante en la orilla del lago azul.',
      question: '¿Qué descubrió Valen?',
      speakText: 'Valen descubrió un cristal brillante en la orilla del lago azul. ¿Qué descubrió Valen?',
      options: ['Un cristal brillante', 'Una bota vieja', 'Una llave de madera', 'Una moneda oxidada'],
      answer: 'Un cristal brillante',
      hint: 'Brillaba con la luz del amanecer.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Reni ayuda a los pajaritos a construir sus nidos en el gran roble.',
      question: '¿A quiénes ayuda Reni?',
      speakText: 'Reni ayuda a los pajaritos a construir sus nidos en el gran roble. ¿A quiénes ayuda Reni?',
      options: ['A los pajaritos', 'A los peces', 'A los topos', 'A las hormigas'],
      answer: 'A los pajaritos',
      hint: 'Tienen plumas y cantan alegremente.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Zoe prepara una merienda deliciosa de fresas y miel para sus amigas.',
      question: '¿Qué prepara Zoe?',
      speakText: 'Zoe prepara una merienda deliciosa de fresas y miel. ¿Qué prepara Zoe?',
      options: ['Fresas y miel', 'Sopa de cebolla', 'Pan duro', 'Hierbas amargas'],
      answer: 'Fresas y miel',
      hint: 'Un manjar dulce del jardín.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Lía dibuja constelaciones luminosas en su cuaderno de magia.',
      question: '¿Qué dibuja Lía?',
      speakText: 'Lía dibuja constelaciones luminosas en su cuaderno de magia. ¿Qué dibuja Lía?',
      options: ['Constelaciones luminosas', 'Coches de carreras', 'Peces nadando', 'Castillos de arena'],
      answer: 'Constelaciones luminosas',
      hint: 'Figuras trazadas con estrellas.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El puente de arcoíris conecta el bosque encantado con el Palacio Real.',
      question: '¿Qué conecta el puente de arcoíris?',
      speakText: 'El puente de arcoíris conecta el bosque encantado con el Palacio Real. ¿Qué conecta el puente?',
      options: ['El bosque encantado con el Palacio', 'La cueva con el río', 'El molino con el mar', 'El pantano con la montaña'],
      answer: 'El bosque encantado con el Palacio',
      hint: 'Une dos lugares mágicos de Lumiria.',
    },
  ],
  4: [
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'princesa', 'enciende', 'la', 'antorcha', 'dorada'],
      question: '¿Qué enciende la princesa?',
      speakText: '¿Qué enciende la princesa?',
      options: ['La antorcha dorada', 'Una fogata grande', 'Una vela roja', 'Una lámpara vieja'],
      answer: 'La antorcha dorada',
      hint: 'Recuerda el objeto brillante que sostiene en la mano.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Las', 'hadas', 'bailan', 'bajo', 'la', 'luna', 'llena'],
      question: '¿Dónde bailan las hadas?',
      speakText: '¿Dónde bailan las hadas?',
      options: ['Bajo la luna llena', 'Bajo la mesa', 'En el desierto', 'En la torre oscura'],
      answer: 'Bajo la luna llena',
      hint: 'El astro plateado de la noche.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'pegaso', 'cruza', 'el', 'arcoíris', 'velozmente'],
      question: '¿Qué cruza el pegaso velozmente?',
      speakText: '¿Qué cruza el pegaso velozmente?',
      options: ['El arcoíris', 'El puente roto', 'El bosque seco', 'El río helado'],
      answer: 'El arcoíris',
      hint: 'El puente de siete colores en el cielo.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Un', 'cometa', 'brillante', 'viaja', 'por', 'el', 'cielo'],
      question: '¿Qué viaja brillante por el cielo?',
      speakText: '¿Qué viaja brillante por el cielo?',
      options: ['Un cometa', 'Un avión', 'Un pájaro', 'Un globo'],
      answer: 'Un cometa',
      hint: 'Un cuerpo celeste con cola luminosa.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'estrella', 'polar', 'guía', 'a', 'los', 'viajeros'],
      question: '¿A quiénes guía la estrella polar?',
      speakText: '¿A quiénes guía la estrella polar?',
      options: ['A los viajeros', 'A los osos', 'A las nubes', 'A los peces'],
      answer: 'A los viajeros',
      hint: 'Personas que exploran nuevos caminos.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'unicornio', 'blanco', 'bebe', 'agua', 'cristalina'],
      question: '¿Qué bebe el unicornio blanco?',
      speakText: '¿Qué bebe el unicornio blanco?',
      options: ['Agua cristalina', 'Jugo de uva', 'Té caliente', 'Leche con chocolate'],
      answer: 'Agua cristalina',
      hint: 'El agua pura y limpia del manantial.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Zoe', 'planta', 'un', 'girasol', 'gigante', 'y', 'dorado'],
      question: '¿Qué planta Zoe?',
      speakText: '¿Qué planta Zoe?',
      options: ['Un girasol gigante', 'Un pino pequeño', 'Un cactus seco', 'Un rosal silvestre'],
      answer: 'Un girasol gigante',
      hint: 'Una flor amarilla que sigue al sol.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Un', 'delfín', 'rosado', 'salta', 'sobre', 'las', 'olas'],
      question: '¿Quién salta sobre las olas?',
      speakText: '¿Quién salta sobre las olas?',
      options: ['Un delfín rosado', 'Un oso polar', 'Un caracol', 'Una mariposa'],
      answer: 'Un delfín rosado',
      hint: 'Un amigo acuático alegre y juguetón.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'llave', 'dorada', 'abre', 'el', 'gran', 'cofre'],
      question: '¿Qué abre la llave dorada?',
      speakText: '¿Qué abre la llave dorada?',
      options: ['El gran cofre', 'La ventana rota', 'El libro cerrado', 'La jaula de hierro'],
      answer: 'El gran cofre',
      hint: 'La caja donde se guardan los tesoros.',
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
      options: ['Por su valentía y corazón puro', 'Porque era el más grande', 'Porque tenía miedo', 'Por casualidad del viento'],
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
      options: ['Escupía burbujas y era bondadoso', 'Era un dragón enojado', 'No tenía alas', 'Dormía todo el día'],
      answer: 'Escupía burbujas y era bondadoso',
      hint: 'Sus burbujas llenaban el cielo de alegría.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Semilla de Zoe',
      text: 'Zoe encontró una pequeña semilla en el corazón del bosque. En lugar de guardarla en una caja, la plantó en tierra féil y la regó cada mañana con paciencia. Con el tiempo, creció un árbol frutal gigante que dio sombra y alimento a todos los animales.',
      question: '¿Qué lección nos enseña la acción de Zoe?',
      speakText: 'Zoe plantó la semilla y la cuidó con paciencia hasta crecer un gran árbol. ¿Qué lección nos enseña la acción de Zoe?',
      options: ['La paciencia y compartir dan frutos', 'Es mejor guardar las cosas', 'Los árboles no necesitan agua', 'No vale la pena esperar'],
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
      options: ['Los protegió con sus alas valientes', 'Se escondió en su casa', 'Esperó que pasara sola la lluvia', 'Los dejó en el suelo mojado'],
      answer: 'Los protegió con sus alas valientes',
      hint: 'El valor de ayudar a quienes lo necesitan.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Luciérnaga Tímida',
      text: 'Lili era una luciérnaga que sentía que su luz era muy pequeña comparada con la luna. Una noche sin estrellas, un conejito se perdió en la espesura. Lili se acercó y con su destello suave guió al conejito hasta su madriguera, descubriendo que toda luz, por pequeña que sea, es valiosa.',
      question: '¿Qué descubrió Lili sobre su luz?',
      speakText: 'Lili era una luciérnaga que pensaba que su luz era pequeña, pero guió a un conejito perdido. ¿Qué descubrió Lili sobre su luz?',
      options: ['Toda luz es valiosa para ayudar', 'Que la luna es más útil', 'Que era mejor apagarse', 'Que las luciérnagas no deben volar'],
      answer: 'Toda luz es valiosa para ayudar',
      hint: 'Ayudar a un amigo demuestra tu verdadero brillo.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Caracol y la Montaña',
      text: 'Todos los animales le decían al caracol Tito que la montaña era demasiado alta para él. Tito sonrió y avanzó paso a pasito, disfrutando cada hoja del sendero y descansando cuando era necesario. Una mañana de sol, Tito llegó a la cima y contempló todo el reino de Lumiria.',
      question: '¿Cómo logró Tito llegar a la cima de la montaña?',
      speakText: 'Tito el caracol avanzó paso a pasito disfrutando el camino. ¿Cómo logró Tito llegar a la cima?',
      options: ['Con constancia y paciencia paso a paso', 'Pidiendo que lo llevaran volando', 'Rindiéndose en la primera colina', 'Corriendo muy rápido sin parar'],
      answer: 'Con constancia y paciencia paso a paso',
      hint: 'No rendirse y avanzar poco a poco permite lograr grandes metas.',
    },
  ],
};

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
        unlockedLevels: this.unlockedLevels,
        masteredLevels: this.masteredLevels,
        levelMastery: this.levelMastery,
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
      this.wordsRead += 4; // Promedio de palabras consolidadas por reto

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
