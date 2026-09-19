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
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">PE</span> <span class="syl-sep">•</span> <span class="syl syl-2">LO</span> <span class="syl-sep">•</span> <span class="syl syl-3">TA</span>',
      speakText: 'Pe... lo... ta...',
      options: ['Pelota', 'Paleta', 'Peluca', 'Peseta'],
      answer: 'Pelota',
      hint: 'Juguete redondo que bota con alegría.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">TO</span> <span class="syl-sep">•</span> <span class="syl syl-2">MA</span> <span class="syl-sep">•</span> <span class="syl syl-3">TE</span>',
      speakText: 'To... ma... te...',
      options: ['Tomate', 'Tapete', 'Torote', 'Tigre'],
      answer: 'Tomate',
      hint: 'Fruto rojo, jugoso y saludable de la huerta.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">CA</span> <span class="syl-sep">•</span> <span class="syl syl-2">MI</span> <span class="syl-sep">•</span> <span class="syl syl-3">SA</span>',
      speakText: 'Ca... mi... sa...',
      options: ['Camisa', 'Comida', 'Camino', 'Casita'],
      answer: 'Camisa',
      hint: 'Prenda de vestir con botones y cuello.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">LA</span> <span class="syl-sep">•</span> <span class="syl syl-2">GO</span>',
      speakText: 'La... go...',
      options: ['Lago', 'Lazo', 'Lobo', 'Lomo'],
      answer: 'Lago',
      hint: 'Cuerpo de agua tranquila rodeado de árboles.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">PA</span> <span class="syl-sep">•</span> <span class="syl syl-2">LO</span> <span class="syl-sep">•</span> <span class="syl syl-3">MA</span>',
      speakText: 'Pa... lo... ma...',
      options: ['Paloma', 'Pelota', 'Pantera', 'Paleta'],
      answer: 'Paloma',
      hint: 'Ave blanca de alas suaves que vuela libre.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">NA</span> <span class="syl-sep">•</span> <span class="syl syl-2">VE</span>',
      speakText: 'Na... ve...',
      options: ['Nave', 'Nube', 'Nieve', 'Nota'],
      answer: 'Nave',
      hint: 'Vehículo espacial que viaja entre las estrellas.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene cuatro sílabas?',
      displayHtml: '<span class="syl syl-1">MA</span> <span class="syl-sep">•</span> <span class="syl syl-2">RI</span> <span class="syl-sep">•</span> <span class="syl syl-3">PO</span> <span class="syl-sep">•</span> <span class="syl syl-4">SA</span>',
      speakText: 'Ma... ri... po... sa...',
      options: ['Mariposa', 'Manzana', 'Molinillo', 'Margarita'],
      answer: 'Mariposa',
      hint: 'Tiene alas de colores brillantes y visita las flores.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene tres sílabas?',
      displayHtml: '<span class="syl syl-1">CO</span> <span class="syl-sep">•</span> <span class="syl syl-2">RO</span> <span class="syl-sep">•</span> <span class="syl syl-3">NA</span>',
      speakText: 'Co... ro... na...',
      options: ['Corona', 'Cortina', 'Comida', 'Colmena'],
      answer: 'Corona',
      hint: 'Aro dorado con gemas que llevan las princesas.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra luminosa tiene una sola sílaba?',
      displayHtml: '<span class="syl syl-1">SOL</span>',
      speakText: 'Sol...',
      options: ['Sol', 'Sal', 'Sur', 'Son'],
      answer: 'Sol',
      hint: 'La gran estrella que ilumina el día en Lumiria.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra deliciosa tiene una sola sílaba?',
      displayHtml: '<span class="syl syl-1">PAN</span>',
      speakText: 'Pan...',
      options: ['Pan', 'Pez', 'Paz', 'Pie'],
      answer: 'Pan',
      hint: 'Alimento dorado horneado con trigo.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">SE</span> <span class="syl-sep">•</span> <span class="syl syl-2">MI</span> <span class="syl-sep">•</span> <span class="syl syl-3">LLA</span>',
      speakText: 'Se... mi... lla...',
      options: ['Semilla', 'Sencilla', 'Señora', 'Semana'],
      answer: 'Semilla',
      hint: 'Se planta en la tierra para que nazca una flor.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra mágica tiene dos sílabas?',
      displayHtml: '<span class="syl syl-1">LI</span> <span class="syl-sep">•</span> <span class="syl syl-2">BRO</span>',
      speakText: 'Li... bro...',
      options: ['Libro', 'Libre', 'Lirio', 'Limón'],
      answer: 'Libro',
      hint: 'Lleno de páginas con historias fantásticas.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra se forma al unir las sílabas?',
      displayHtml: '<span class="syl syl-1">CA</span> <span class="syl-sep">•</span> <span class="syl syl-2">MI</span> <span class="syl-sep">•</span> <span class="syl syl-3">NO</span>',
      speakText: 'Ca... mi... no...',
      options: ['Camino', 'Camisa', 'Casino', 'Canario'],
      answer: 'Camino',
      hint: 'Sendero de piedras que lleva al Templo.',
    },
    {
      type: 'syllables',
      prompt: '¿Qué palabra resplandeciente tiene una sola sílaba?',
      displayHtml: '<span class="syl syl-1">LUZ</span>',
      speakText: 'Luz...',
      options: ['Luz', 'Lupa', 'Luna', 'Lobo'],
      answer: 'Luz',
      hint: 'Destello radiante que ahuyenta las sombras.',
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
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "BR"?',
      displayHtml: '<span class="blend-highlight">BR</span>',
      speakText: '¿Cuál palabra tiene el sonido BR?',
      options: ['Brújula', 'Burbuja', 'Basura', 'Bandeja'],
      answer: 'Brújula',
      hint: 'Instrumento mágico que señala el norte.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: CRA • TER?',
      displayHtml: '<span class="syl syl-1">CRA</span> <span class="syl-sep">•</span> <span class="syl syl-2">TER</span>',
      speakText: 'Cra... ter...',
      options: ['Cráter', 'Cártel', 'Casta', 'Cura'],
      answer: 'Cráter',
      hint: 'Boca profunda de un volcán o de la luna.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: PIE • DRA?',
      displayHtml: '<span class="syl syl-1">PIE</span> <span class="syl-sep">•</span> <span class="syl syl-2">DRA</span>',
      speakText: 'Pie... dra...',
      options: ['Piedra', 'Pierna', 'Pieza', 'Pinar'],
      answer: 'Piedra',
      hint: 'Mineral sólido y firme de la montaña.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "FR"?',
      displayHtml: '<span class="blend-highlight">FR</span>',
      speakText: '¿Cuál palabra tiene el sonido FR?',
      options: ['Frasco', 'Faro', 'Faja', 'Fina'],
      answer: 'Frasco',
      hint: 'Recipiente de cristal para pociones mágicas.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "GR"?',
      displayHtml: '<span class="blend-highlight">GR</span>',
      speakText: '¿Cuál palabra tiene el sonido GR?',
      options: ['Granja', 'Gana', 'Goma', 'Gota'],
      answer: 'Granja',
      hint: 'Lugar campestre donde viven muchos animalitos.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PR"?',
      displayHtml: '<span class="blend-highlight">PR</span>',
      speakText: '¿Cuál palabra tiene el sonido PR?',
      options: ['Prisma', 'Puma', 'Pico', 'Paso'],
      answer: 'Prisma',
      hint: 'Cristal que descompone la luz en arcoíris.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: ES • TRE • LLA?',
      displayHtml: '<span class="syl syl-1">ES</span> <span class="syl-sep">•</span> <span class="syl syl-2">TRE</span> <span class="syl-sep">•</span> <span class="syl syl-3">LLA</span>',
      speakText: 'Es... tre... lla...',
      options: ['Estrella', 'Estufa', 'Esfera', 'Espada'],
      answer: 'Estrella',
      hint: 'Astro con luz que titila en la noche.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "BL"?',
      displayHtml: '<span class="blend-highlight">BL</span>',
      speakText: '¿Cuál palabra tiene el sonido BL?',
      options: ['Blusa', 'Boca', 'Bala', 'Bota'],
      answer: 'Blusa',
      hint: 'Prenda ligera y elegante de vestir.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "CL"?',
      displayHtml: '<span class="blend-highlight">CL</span>',
      speakText: '¿Cuál palabra tiene el sonido CL?',
      options: ['Clavel', 'Canel', 'Canto', 'Cuna'],
      answer: 'Clavel',
      hint: 'Flor aromática de pétalos dentados.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "FL"?',
      displayHtml: '<span class="blend-highlight">FL</span>',
      speakText: '¿Cuál palabra tiene el sonido FL?',
      options: ['Flauta', 'Fauna', 'Fama', 'Feria'],
      answer: 'Flauta',
      hint: 'Instrumento musical de viento con notas dulces.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "GL"?',
      displayHtml: '<span class="blend-highlight">GL</span>',
      speakText: '¿Cuál palabra tiene el sonido GL?',
      options: ['Iglú', 'Isla', 'Imán', 'Indio'],
      answer: 'Iglú',
      hint: 'Casa redonda hecha con bloques de nieve.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PL"?',
      displayHtml: '<span class="blend-highlight">PL</span>',
      speakText: '¿Cuál palabra tiene el sonido PL?',
      options: ['Planta', 'Pinta', 'Pata', 'Pena'],
      answer: 'Planta',
      hint: 'Ser vivo verde que crece en la tierra.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra se forma con: BRI • LLA?',
      displayHtml: '<span class="syl syl-1">BRI</span> <span class="syl-sep">•</span> <span class="syl syl-2">LLA</span>',
      speakText: 'Bri... lla...',
      options: ['Brilla', 'Baila', 'Bulla', 'Bala'],
      answer: 'Brilla',
      hint: 'Emite luz propia como una estrella.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "TR"?',
      displayHtml: '<span class="blend-highlight">TR</span>',
      speakText: '¿Cuál palabra tiene el sonido TR?',
      options: ['Trompeta', 'Tormenta', 'Tenedor', 'Tomate'],
      answer: 'Trompeta',
      hint: 'Instrumento musical dorado de sonido triunfal.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "PL"?',
      displayHtml: '<span class="blend-highlight">PL</span>',
      speakText: '¿Cuál palabra tiene el sonido PL?',
      options: ['Plátano', 'Pájaro', 'Palo', 'Pato'],
      answer: 'Plátano',
      hint: 'Fruta amarilla rica y suave que da energía.',
    },
    {
      type: 'blend',
      prompt: '¿Qué palabra tiene el grupo consonántico "CR"?',
      displayHtml: '<span class="blend-highlight">CR</span>',
      speakText: '¿Cuál palabra tiene el sonido CR?',
      options: ['Cromo', 'Como', 'Coro', 'Copo'],
      answer: 'Cromo',
      hint: 'Estampa coleccionable brillante.',
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
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'La princesa Valen sonríe al mirar el amanecer dorado.',
      question: '¿Cuándo sonríe la princesa Valen?',
      speakText: 'La princesa Valen sonríe al mirar el amanecer dorado. ¿Cuándo sonríe la princesa Valen?',
      options: ['Al mirar el amanecer dorado', 'Al ver una tormenta', 'En la noche oscura', 'Al romper un plato'],
      answer: 'Al mirar el amanecer dorado',
      hint: 'La luz de la mañana que ilumina el reino.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Reni vuela junto a las golondrinas sobre las colinas verdes.',
      question: '¿Junto a quiénes vuela Reni?',
      speakText: 'Reni vuela junto a las golondrinas sobre las colinas verdes. ¿Junto a quiénes vuela Reni?',
      options: ['Junto a las golondrinas', 'Junto a los osos', 'Junto a las piedras', 'Junto a los topos'],
      answer: 'Junto a las golondrinas',
      hint: 'Aves veloces que cruzan el cielo.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Zoe encontró un mapa secreto escondido dentro de un árbol hueco.',
      question: '¿Dónde estaba escondido el mapa secreto?',
      speakText: 'Zoe encontró un mapa secreto escondido dentro de un árbol hueco. ¿Dónde estaba escondido?',
      options: ['Dentro de un árbol hueco', 'En el fondo del mar', 'Bajo una alfombra', 'En una sartén'],
      answer: 'Dentro de un árbol hueco',
      hint: 'Un escondite natural en el tronco del roble.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Lía enciende tres velas moradas para estudiar el libro de constelaciones.',
      question: '¿Cuántas velas enciende Lía?',
      speakText: 'Lía enciende tres velas moradas para estudiar las constelaciones. ¿Cuántas velas enciende Lía?',
      options: ['Tres velas moradas', 'Diez antorchas', 'Una fogata', 'Cinco linternas'],
      answer: 'Tres velas moradas',
      hint: 'Un número mágico que ilumina su mesa.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El búho Orión viaja en una nube suave para visitar a las cuatro heroínas.',
      question: '¿En qué viaja el búho Orión?',
      speakText: 'El búho Orión viaja en una nube suave para visitar a las heroínas. ¿En qué viaja el búho?',
      options: ['En una nube suave', 'En un barco pirata', 'En una bicicleta', 'A pie por el lodo'],
      answer: 'En una nube suave',
      hint: 'Un transporte esponjoso del cielo.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Las cuatro amigas comparten pastel de manzana en el jardín del palacio.',
      question: '¿Qué comparten las cuatro amigas?',
      speakText: 'Las cuatro amigas comparten pastel de manzana en el jardín. ¿Qué comparten?',
      options: ['Pastel de manzana', 'Sopa fría', 'Pan duro', 'Té amargo'],
      answer: 'Pastel de manzana',
      hint: 'Un postre dulce recién horneado.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Un rayo de sol despertó a las mariposas del bosque encantado.',
      question: '¿Quién despertó a las mariposas?',
      speakText: 'Un rayo de sol despertó a las mariposas del bosque. ¿Quién las despertó?',
      options: ['Un rayo de sol', 'Un trueno fuerte', 'El viento helado', 'Un lobo gris'],
      answer: 'Un rayo de sol',
      hint: 'La cálida luz del amanecer.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Valen lleva un vestido rosa decorado con brillantes de cristal.',
      question: '¿De qué color es el vestido de Valen?',
      speakText: 'Valen lleva un vestido rosa decorado con brillantes. ¿De qué color es su vestido?',
      options: ['Rosa', 'Negro', 'Gris', 'Marrón'],
      answer: 'Rosa',
      hint: 'El color suave de los pétalos de flor.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Reni recolecta plumas doradas caídas de las aves del sol.',
      question: '¿Qué recolecta Reni?',
      speakText: 'Reni recolecta plumas doradas caídas de las aves del sol. ¿Qué recolecta Reni?',
      options: ['Plumas doradas', 'Monedas de cobre', 'Piedras pesadas', 'Caracoles de río'],
      answer: 'Plumas doradas',
      hint: 'Son ligeras, brillantes y caen del cielo.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Zoe cura las hojas enfermas con una gota de rocío matutino.',
      question: '¿Con qué cura Zoe las hojas enfermas?',
      speakText: 'Zoe cura las hojas con una gota de rocío matutino. ¿Con qué las cura?',
      options: ['Con rocío matutino', 'Con agua caliente', 'Con sal gruesa', 'Con arena seca'],
      answer: 'Con rocío matutino',
      hint: 'Gotas puras que refrescan el bosque al alba.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Lía mira por el telescopio para descubrir una nueva luna.',
      question: '¿Por dónde mira Lía?',
      speakText: 'Lía mira por el telescopio para descubrir una nueva luna. ¿Por dónde mira?',
      options: ['Por el telescopio', 'Por la ventana rota', 'A través de un espejo', 'Por una lupa rota'],
      answer: 'Por el telescopio',
      hint: 'El instrumento de los sabios para mirar los astros.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El arroyo de Lumiria canta una canción alegre entre las piedras redondas.',
      question: '¿Dónde canta el arroyo de Lumiria?',
      speakText: 'El arroyo de Lumiria canta entre las piedras redondas. ¿Dónde canta el arroyo?',
      options: ['Entre las piedras redondas', 'En el tejado alto', 'En una cueva seca', 'Bajo la tierra'],
      answer: 'Entre las piedras redondas',
      hint: 'El agua corre y hace música en su cauce.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Orión guardó la llave de las estrellas dentro de un cofre de plata.',
      question: '¿Dónde guardó Orión la llave de las estrellas?',
      speakText: 'Orión guardó la llave dentro de un cofre de plata. ¿Dónde guardó la llave?',
      options: ['En un cofre de plata', 'En el fondo de un lago', 'Bajo un zapato', 'En un vaso roto'],
      answer: 'En un cofre de plata',
      hint: 'Una cajita reluciente y protegida.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'Las princesas plantaron un jardín de tréboles de la suerte.',
      question: '¿Qué plantaron las princesas?',
      speakText: 'Las princesas plantaron un jardín de tréboles de la suerte. ¿Qué plantaron?',
      options: ['Tréboles de la suerte', 'Cactus espinosos', 'Hierba amarga', 'Árboles secos'],
      answer: 'Tréboles de la suerte',
      hint: 'Plantitas verdes de cuatro hojas.',
    },
    {
      type: 'sentence',
      prompt: 'Lee la oración con Orión y responde:',
      sentence: 'El gran portal de Lumiria brilla cuando las cuatro heroínas unen sus manos.',
      question: '¿Cuándo brilla el gran portal?',
      speakText: 'El gran portal de Lumiria brilla cuando las cuatro heroínas unen sus manos. ¿Cuándo brilla el portal?',
      options: ['Cuando unen sus manos', 'Cuando llega la noche', 'Cuando llueve fuerte', 'Cuando sopla el norte'],
      answer: 'Cuando unen sus manos',
      hint: 'La fuerza y magia de la amistad verdadera.',
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
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'arcoíris', 'ilumina', 'todo', 'el', 'castillo', 'real'],
      question: '¿Qué ilumina todo el castillo?',
      speakText: '¿Qué ilumina todo el castillo?',
      options: ['El arcoíris', 'Una vela', 'La chimenea', 'Un fósforo'],
      answer: 'El arcoíris',
      hint: 'Banda luminosa de siete colores.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'ardilla', 'guarda', 'nueces', 'en', 'su', 'nido'],
      question: '¿Qué guarda la ardilla en su nido?',
      speakText: '¿Qué guarda la ardilla en su nido?',
      options: ['Nueces', 'Piedras', 'Flores secas', 'Zapatos'],
      answer: 'Nueces',
      hint: 'Frutos secos que come en invierno.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Cuatro', 'estrellas', 'brillan', 'en', 'el', 'cielo', 'nocturno'],
      question: '¿Cuántas estrellas brillan en el cielo?',
      speakText: '¿Cuántas estrellas brillan en el cielo?',
      options: ['Cuatro estrellas', 'Dos estrellas', 'Diez estrellas', 'Una estrella'],
      answer: 'Cuatro estrellas',
      hint: 'Una por cada heroína de Lumiria.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'barco', 'velero', 'navega', 'por', 'el', 'mar', 'azul'],
      question: '¿Quién navega por el mar azul?',
      speakText: '¿Quién navega por el mar azul?',
      options: ['El barco velero', 'Un coche', 'Un caballo', 'Un tren'],
      answer: 'El barco velero',
      hint: 'Embarcación con velas que aprovecha el viento.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Valen', 'descubre', 'un', 'camino', 'secreto', 'en', 'el', 'bosque'],
      question: '¿Qué descubre Valen en el bosque?',
      speakText: '¿Qué descubre Valen en el bosque?',
      options: ['Un camino secreto', 'Un pozo seco', 'Una bota rota', 'Un muro alto'],
      answer: 'Un camino secreto',
      hint: 'Un sendero oculto entre los árboles.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'pájaro', 'azul', 'canta', 'al', 'salir', 'el', 'sol'],
      question: '¿De qué color es el pájaro que canta?',
      speakText: '¿De qué color es el pájaro que canta?',
      options: ['Azul', 'Rojo', 'Amarillo', 'Gris'],
      answer: 'Azul',
      hint: 'El color del cielo despejado.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Zoe', 'riega', 'las', 'fresas', 'con', 'mucha', 'delicadeza'],
      question: '¿Qué riega Zoe con delicadeza?',
      speakText: '¿Qué riega Zoe con delicadeza?',
      options: ['Las fresas', 'Las rocas', 'La alfombra', 'Las sillas'],
      answer: 'Las fresas',
      hint: 'Frutos rojos y sabrosos.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Lía', 'observa', 'el', 'mapa', 'bajo', 'la', 'lámpara'],
      question: '¿Qué observa Lía bajo la lámpara?',
      speakText: '¿Qué observa Lía bajo la lámpara?',
      options: ['El mapa', 'El plato', 'El espejo', 'El reloj'],
      answer: 'El mapa',
      hint: 'Muestra las rutas de los templos.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Reni', 'corre', 'junto', 'al', 'río', 'de', 'aguas', 'claras'],
      question: '¿Junto a qué corre Reni?',
      speakText: '¿Junto a qué corre Reni?',
      options: ['Al río de aguas claras', 'A una pared de roca', 'A una cueva oscura', 'A un lago seco'],
      answer: 'Al río de aguas claras',
      hint: 'Corriente natural de agua cristalina.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'luna', 'llena', 'guía', 'los', 'pasos', 'del', 'viajero'],
      question: '¿Quién guía los pasos del viajero?',
      speakText: '¿Quién guía los pasos del viajero?',
      options: ['La luna llena', 'Una linterna rota', 'El fuego artificial', 'Un reflector'],
      answer: 'La luna llena',
      hint: 'La esfera blanca en el firmamento.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'dragón', 'verde', 'vuela', 'sobre', 'la', 'gran', 'montaña'],
      question: '¿Sobre qué vuela el dragón verde?',
      speakText: '¿Sobre qué vuela el dragón verde?',
      options: ['Sobre la gran montaña', 'Bajo el puente', 'En la cocina', 'Dentro del túnel'],
      answer: 'Sobre la gran montaña',
      hint: 'La cima más alta del reino.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Orión', 'escribe', 'una', 'canción', 'en', 'su', 'pergamino'],
      question: '¿Qué escribe Orión en su pergamino?',
      speakText: '¿Qué escribe Orión en su pergamino?',
      options: ['Una canción', 'Una cuenta', 'Una carta rota', 'Un mapa falso'],
      answer: 'Una canción',
      hint: 'Palabras con ritmo y melodía poética.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['Una', 'mariposa', 'dorada', 'se', 'posa', 'en', 'la', 'rosa'],
      question: '¿Dónde se posa la mariposa dorada?',
      speakText: '¿Dónde se posa la mariposa dorada?',
      options: ['En la rosa', 'En el suelo', 'En el zapato', 'En la nube'],
      answer: 'En la rosa',
      hint: 'En la flor aromática del jardín.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'viento', 'suave', 'mueve', 'las', 'hojas', 'del', 'sauce'],
      question: '¿Qué mueve las hojas del sauce?',
      speakText: '¿Qué mueve las hojas del sauce?',
      options: ['El viento suave', 'La lluvia pesada', 'Una piedra', 'Un oso'],
      answer: 'El viento suave',
      hint: 'Brisa fresca que pasa entre las ramas.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['La', 'princesa', 'lleva', 'un', 'anillo', 'de', 'rubí', 'brillante'],
      question: '¿De qué piedra es el anillo de la princesa?',
      speakText: '¿De qué piedra es el anillo de la princesa?',
      options: ['De rubí brillante', 'De plástico', 'De madera', 'De carbón'],
      answer: 'De rubí brillante',
      hint: 'Gema roja y preciosa.',
    },
    {
      type: 'rsvp',
      prompt: '¡Atenta al velocímetro! Lee las palabras que aparecerán una a una:',
      words: ['El', 'manantial', 'mágico', 'cura', 'la', 'sed', 'del', 'reino'],
      question: '¿Qué cura la sed del reino?',
      speakText: '¿Qué cura la sed del reino?',
      options: ['El manantial mágico', 'Un refresco frío', 'Un pozo vacío', 'El agua salada'],
      answer: 'El manantial mágico',
      hint: 'Fuente de agua pura de Lumiria.',
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
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Árbol que Aprendió a Escuchar',
      text: 'En el claro del bosque crecía un roble muy orgulloso que siempre presumía de su gran altura. Un día, una familia de pajaritos le pidió refugio de la lluvia. El roble dobló amablemente sus ramas para protegerlos y descubrió que dar abrigo y escuchar a otros es más hermoso que ser el más alto.',
      question: '¿Qué descubrió el roble al proteger a los pajaritos?',
      speakText: 'El roble descubrió que dar abrigo y escuchar a otros es más hermoso que presumir. ¿Qué descubrió el roble?',
      options: ['Que ayudar a otros es más valioso que presumir', 'Que era mejor estar solo', 'Que las ramas se rompían', 'Que la lluvia no existía'],
      answer: 'Que ayudar a otros es más valioso que presumir',
      hint: 'La generosidad y el abrigo enriquecen el corazón.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Abejita que Compartió la Miel',
      text: 'Maya era una abeja trabajadora que encontró la flor más dulce de la colina. Podía haberse quedado con todo el néctar, pero voló de inmediato a llamar a sus compañeras para que todas disfrutaran juntas. La colmena nunca había sido tan feliz ni producido miel tan deliciosa.',
      question: '¿Qué hizo Maya cuando encontró la flor más dulce?',
      speakText: 'Maya encontró la flor más dulce y llamó a sus compañeras para compartir. ¿Qué hizo Maya?',
      options: ['Llamó a sus compañeras para compartir', 'Se comió todo sola en secreto', 'Se fue a dormir a otra colmena', 'Rompió los pétalos de la flor'],
      answer: 'Llamó a sus compañeras para compartir',
      hint: 'El valor de pensar en el bienestar de todos.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Oso que Aprendió a Esperar',
      text: 'Barny el osezno quería que los frutos del manzano maduraran en un solo día y sacudía el tronco con impaciencia. Su abuelo le enseñó a regar el árbol y a cantar mientras el sol hacía su trabajo. Semanas después, las manzanas cayeron dulces y rojas, premiando su dulce paciencia.',
      question: '¿Qué lección aprendió Barny de su abuelo?',
      speakText: 'Barny aprendió que regar el árbol con paciencia da los frutos más dulces. ¿Qué lección aprendió Barny?',
      options: ['Que las cosas buenas necesitan paciencia y tiempo', 'Que hay que sacudir fuerte los árboles', 'Que los frutos nunca maduran', 'Que era mejor comprar manzanas'],
      answer: 'Que las cosas buenas necesitan paciencia y tiempo',
      hint: 'Saber esperar da los frutos más dulces.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Zorro que Dijo la Verdad',
      text: 'Zipo el zorro rompió sin querer el jarrón de flores de la abuela. Al principio pensó culpar al viento, pero miró a los ojos de su abuela y le contó lo sucedido pidiendo disculpas. Su abuela sonrió, le dio un abrazo y le dijo que la verdad es el tesoro más brillante del reino.',
      question: '¿Por qué la abuela felicitó a Zipo?',
      speakText: 'Zipo pidió disculpas y dijo la verdad sobre el jarrón roto. ¿Por qué la abuela lo felicitó?',
      options: ['Porque fue honesto y dijo la verdad', 'Porque compró un jarrón de oro', 'Porque corrió muy rápido', 'Porque culpó al viento del jardín'],
      answer: 'Porque fue honesto y dijo la verdad',
      hint: 'La honestidad genera confianza y amor.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Pescador y la Estrella de Mar',
      text: 'Caminando por la playa al bajar la marea, Lucas vio a miles de estrellas de mar varadas en la arena tibia. Tomó una y la devolvió con ternura al agua. Un caminante le preguntó de qué servía hacer eso si eran tantas. Lucas sonrió y respondió: Para esa estrella de mar, lo significó todo.',
      question: '¿Qué nos enseña la respuesta de Lucas?',
      speakText: 'Lucas devolvió una estrella de mar al agua diciendo: para ella, lo significó todo. ¿Qué nos enseña?',
      options: ['Cada pequeña ayuda importa y tiene valor', 'Que no hay que ayudar si son muchos', 'Que la playa es muy peligrosa', 'Que las estrellas de mar no nadan'],
      answer: 'Cada pequeña ayuda importa y tiene valor',
      hint: 'Cualquier acto de bondad, aunque parezca pequeño, cambia un mundo.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Tortuga y el Colibrí',
      text: 'Un colibrí veloz se burlaba del paso lento de la tortuga Tula. Cuando comenzó un viento helado, el colibrí no tenía fuerzas para avanzar. Tula lo subió a su caparazón duro y abrigado, salvándolo del frío. El colibrí comprendió que cada ser tiene dones únicos y valiosos.',
      question: '¿Qué aprendió el colibrí sobre la tortuga Tula?',
      speakText: 'Tula protegió al colibrí del frío en su caparazón. ¿Qué aprendió el colibrí?',
      options: ['Que cada uno tiene dones únicos y valiosos', 'Que volar siempre es lo mejor', 'Que las tortugas deben correr', 'Que no deben ser amigos'],
      answer: 'Que cada uno tiene dones únicos y valiosos',
      hint: 'La fortaleza y la constancia también son grandes virtudes.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Ratón Valiente del Castillo',
      text: 'Pipo era el ratón más pequeño del palacio. Un día, la llave del portón real cayó en una rendija muy estrecha donde ningún guardia podía meter la mano. Pipo se deslizó con agilidad, ató una cuerda y sacó la llave. Todos aplaudieron al pequeño héroe.',
      question: '¿Cómo ayudó Pipo al reino de Lumiria?',
      speakText: 'Pipo rescató la llave de la rendija gracias a su pequeño tamaño. ¿Cómo ayudó Pipo?',
      options: ['Recuperó la llave gracias a su pequeño tamaño', 'Abrió el portón rompiéndolo', 'Compró una nueva cerradura', 'Llamó a los dragones'],
      answer: 'Recuperó la llave gracias a su pequeño tamaño',
      hint: 'Hasta el más pequeño puede resolver grandes desafíos.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Puente de los Tres Animales',
      text: 'Un conejo, un ciervo y un búho querían cruzar un río crecido. El conejo trajo ramitas, el ciervo empujó troncos gruesos y el búho los guió desde el aire. Juntos construyeron un puente sólido por donde cruzó todo el bosque.',
      question: '¿Qué permitió a los animales cruzar el río?',
      speakText: 'Los animales unieron sus fuerzas para construir un puente sólido. ¿Qué les permitió cruzar?',
      options: ['El trabajo en equipo y la cooperación', 'La fuerza del ciervo solo', 'Nadar contra la corriente', 'Esperar a que el río se secara'],
      answer: 'El trabajo en equipo y la cooperación',
      hint: 'Unir distintas habilidades logra lo que uno solo no puede.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Espejo Mágico de Lía',
      text: 'Lía encontró un espejo antiguo en la torre de cristal. Cuando se miró con tristeza, el espejo reflejó sombras. Pero cuando sonrió y pensó en sus amigas con gratitud, el espejo brilló con todos los colores del arcoíris. El espejo le enseñó que lo que llevamos dentro ilumina el mundo exterior.',
      question: '¿Por qué brilló el espejo con colores de arcoíris?',
      speakText: 'El espejo brilló cuando Lía sonrió y pensó en sus amigas con gratitud. ¿Por qué brilló?',
      options: ['Por la gratitud y la sonrisa de Lía', 'Porque Lía lo limpió con agua', 'Porque era de oro macizo', 'Porque se rompió en pedazos'],
      answer: 'Por la gratitud y la sonrisa de Lía',
      hint: 'La alegría interior transforma lo que vemos.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Delfín y el Caracol Marino',
      text: 'El delfín Marino cruzaba los océanos a toda velocidad. Un día conoció al caracol Coral, que vivía en una roca admirando las perlas del arrecife. Coral le enseñó a detenerse y observar los detalles hermosos del fondo del mar que él nunca había visto por ir tan rápido.',
      question: '¿Qué le enseñó Coral al delfín Marino?',
      speakText: 'Coral le enseñó al delfín a detenerse y disfrutar los detalles con calma. ¿Qué le enseñó?',
      options: ['A disfrutar los detalles hermosos con calma', 'A nadar más rápido que los demás', 'A no volver a salir del agua', 'A esconderse en las piedras'],
      answer: 'A disfrutar los detalles hermosos con calma',
      hint: 'La calma nos permite apreciar la belleza oculta.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Erizo y el Abrazo Amable',
      text: 'Pinchín era un erizo que temía no tener amigos por sus púas puntiagudas. Un día un conejito con frío se le acercó sin miedo y le pidió charlar junto a una fogata. Pinchín descubrió que no se necesita tocar para abrazar con las palabras y la amabilidad.',
      question: '¿Qué descubrió Pinchín sobre la amistad?',
      speakText: 'Pinchín descubrió que las palabras amables también abrazan el corazón. ¿Qué descubrió?',
      options: ['Que las palabras amables también abrazan', 'Que debía perder todas sus púas', 'Que era mejor no hablar con nadie', 'Que el frío era su enemigo'],
      answer: 'Que las palabras amables también abrazan',
      hint: 'El cariño sincero traspasa cualquier barrera.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Paloma y la Hormiga',
      text: 'Una pequeña hormiga cayó a un arroyo y una paloma le lanzó una hoja para que pudiera subir y salvarse. Días después, un cazador apuntaba a la paloma, y la hormiga picó su pie haciéndolo fallar. La paloma escapó libre y agradecida.',
      question: '¿Qué nos demuestra la ayuda mutua entre la paloma y la hormiga?',
      speakText: 'La paloma salvó a la hormiga y luego la hormiga salvó a la paloma. ¿Qué nos demuestra?',
      options: ['Un favor de corazón siempre encuentra su recompensa', 'Que las hormigas son peligrosas', 'Que las aves no necesitan amigos', 'Que no hay que acercarse al arroyo'],
      answer: 'Un favor de corazón siempre encuentra su recompensa',
      hint: 'La gratitud y la solidaridad van y vienen.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'El Viento y el Sol',
      text: 'El viento y el sol discutían quién era más poderoso. El viento sopló con furia para quitarle la capa a un viajero, pero este solo se abrigó más. Luego el sol brilló con calidez suave y el viajero, aliviado por el calor, se quitó la capa con una sonrisa.',
      question: '¿Por qué el sol logró que el viajero se quitara la capa?',
      speakText: 'El sol brilló con calidez y gentileza, logrando lo que el viento no pudo. ¿Por qué lo logró?',
      options: ['Por su calidez y gentileza suave', 'Porque hizo mucho ruido', 'Porque congeló el camino', 'Porque era más fuerte que el viento'],
      answer: 'Por su calidez y gentileza suave',
      hint: 'La suavidad y la gentileza logran más que la fuerza bruta.',
    },
    {
      type: 'fable',
      prompt: 'Lee la pequeña fábula y encuentra la respuesta sabia:',
      title: 'La Llave de la Esperanza',
      text: 'En un cofre antiguo había tres llaves: de hierro, de plata y de luz. Las dos primeras intentaron abrir la gran puerta del castillo pero se trabaron. La llave de luz, hecha de esperanza y buenos deseos, encajó a la perfección y abrió las puertas a un reino de paz.',
      question: '¿Por qué la llave de luz abrió la gran puerta?',
      speakText: 'La llave de luz estaba hecha de esperanza y abrió las puertas a la paz. ¿Por qué abrió la puerta?',
      options: ['Porque estaba hecha de esperanza y buenos deseos', 'Porque era la más pesada y dura', 'Porque tenía dientes de acero', 'Porque era la más antigua de todas'],
      answer: 'Porque estaba hecha de esperanza y buenos deseos',
      hint: 'La esperanza abre las puertas más difíciles.',
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
