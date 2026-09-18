/**
 * ValenQuest: Catálogo Modular de Escenas Vectoriales del Gran Libro (story-scenes.js)
 * Especificación canónica: docs/storybook-animations-spec.md
 * 
 * Cada escena se modela en un lienzo viewBox="0 0 200 200" con IDs prefijados (cN-*)
 * y clases de animación (.story-anim-*) para garantizar 60 FPS y cero fugas de estilos.
 */

export const STORY_SCENES = {
  1: {
    id: 'scene-grimoire',
    name: 'El Gran Grimorio y las Cuatro Razas',
    render: () => `
      <svg class="story-scene-svg story-scene-c1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="El Gran Grimorio de Cristal y las Cuatro Razas">
        <defs>
          <!-- Resplandor central de sabiduría -->
          <radialGradient id="c1-aura-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFD166" stop-opacity="0.55" />
            <stop offset="60%" stop-color="#7B2CBF" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#201633" stop-opacity="0" />
          </radialGradient>

          <!-- Cubierta de cristal amatista y zafiro -->
          <linearGradient id="c1-crystal-cover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9D4EDD" />
            <stop offset="50%" stop-color="#5A189A" />
            <stop offset="100%" stop-color="#240046" />
          </linearGradient>

          <!-- Páginas doradas iluminadas -->
          <linearGradient id="c1-pages-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFF9E6" />
            <stop offset="50%" stop-color="#FFEAA7" />
            <stop offset="100%" stop-color="#FDCB6E" />
          </linearGradient>

          <!-- Lomo de cristal prismático -->
          <linearGradient id="c1-spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFD166" />
            <stop offset="50%" stop-color="#FFF" />
            <stop offset="100%" stop-color="#FFD166" />
          </linearGradient>

          <!-- Orbe 1: Alicornio (Rosa / Oro • Liderazgo y Magia Real) -->
          <radialGradient id="c1-orb-alicorn" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="40%" stop-color="#FFAFCC" />
            <stop offset="100%" stop-color="#FF758F" />
          </radialGradient>

          <!-- Orbe 2: Pegaso (Celeste Nimbus • Vientos y Tiempo) -->
          <radialGradient id="c1-orb-pegasus" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="40%" stop-color="#A2D2FF" />
            <stop offset="100%" stop-color="#3A86FF" />
          </radialGradient>

          <!-- Orbe 3: Terrestre (Menta Brote • Naturaleza y Firmeza) -->
          <radialGradient id="c1-orb-earth" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="40%" stop-color="#B8F2E6" />
            <stop offset="100%" stop-color="#38B000" />
          </radialGradient>

          <!-- Orbe 4: Unicornio (Lila Amatista • Telequinesis y Cristal) -->
          <radialGradient id="c1-orb-unicorn" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="40%" stop-color="#E0AAFF" />
            <stop offset="100%" stop-color="#7B2CBF" />
          </radialGradient>
        </defs>

        <!-- 1. Halo Cósmico Pulsante de Fondo -->
        <circle class="story-anim-glow" cx="100" cy="105" r="70" fill="url(#c1-aura-glow)" />

        <!-- 2. Núcleo Flotante: El Gran Grimorio de Cristal -->
        <g class="story-anim-levitate">
          <!-- Sombra etérea de sustentación -->
          <ellipse cx="100" cy="156" rx="42" ry="7" fill="rgba(0,0,0,0.3)" />

          <!-- Pedestal de cristal estelar -->
          <path d="M78 152 L122 152 L114 144 L86 144 Z" fill="#FFD166" opacity="0.85" />
          <polygon points="100,140 106,146 100,152 94,146" fill="#FFF" />

          <!-- Tapas exteriores del Grimorio -->
          <!-- Tapa Izquierda -->
          <g class="story-anim-cover-l">
            <path d="M98 90 L42 98 L46 138 L98 132 Z" fill="url(#c1-crystal-cover)" stroke="#FFD166" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M48 103 L88 97 L88 127 L48 133 Z" fill="none" stroke="rgba(255,209,102,0.4)" stroke-width="0.8" />
          </g>

          <!-- Tapa Derecha -->
          <g class="story-anim-cover-r">
            <path d="M102 90 L158 98 L154 138 L102 132 Z" fill="url(#c1-crystal-cover)" stroke="#FFD166" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M152 103 L112 97 L112 127 L152 133 Z" fill="none" stroke="rgba(255,209,102,0.4)" stroke-width="0.8" />
          </g>

          <!-- Hojas doradas abiertas en abanico (Páginas del Saber) -->
          <!-- Bloque de páginas izquierda -->
          <path d="M98 92 C80 92 56 97 48 100 L51 135 C59 133 80 129 98 130 Z" fill="url(#c1-pages-gold)" stroke="#E0A96D" stroke-width="0.7" />
          <!-- Filigrana rúnica sutil (Lectura y Palabras) -->
          <line x1="58" y1="108" x2="88" y2="105" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />
          <line x1="58" y1="114" x2="84" y2="111" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />
          <line x1="58" y1="120" x2="86" y2="117" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />

          <!-- Bloque de páginas derecha -->
          <path d="M102 92 C120 92 144 97 152 100 L149 135 C141 133 120 129 102 130 Z" fill="url(#c1-pages-gold)" stroke="#E0A96D" stroke-width="0.7" />
          <!-- Filigrana rúnica sutil (Números y Fórmulas) -->
          <line x1="112" y1="105" x2="142" y2="108" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />
          <line x1="116" y1="111" x2="142" y2="114" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />
          <line x1="114" y1="117" x2="142" y2="120" stroke="#9C6644" stroke-width="0.9" stroke-linecap="round" opacity="0.65" />

          <!-- Lomo central y cinta marcadora sagrada -->
          <path d="M97 88 L103 88 L103 134 L97 134 Z" fill="url(#c1-spine-grad)" />
          <path d="M100 134 Q102 146 108 150 Q104 148 100 144" fill="none" stroke="#FF758F" stroke-width="2.2" stroke-linecap="round" />

          <!-- Joya central del Grimorio (El Prisma del Conocimiento) -->
          <polygon points="100,98 104,105 100,112 96,105" fill="#FFF" stroke="#FFD166" stroke-width="0.9" />
        </g>

        <!-- 3. Runas y Chispas de Sabiduría que se elevan desde las páginas -->
        <!-- Letra A de Lectura -->
        <g class="story-anim-sparkle" style="animation-delay: 0.2s;">
          <text x="76" y="85" font-family="'Fredoka', cursive, sans-serif" font-weight="900" font-size="11" fill="#FFD166" text-anchor="middle">A</text>
        </g>
        <!-- Número 7 de Matemáticas -->
        <g class="story-anim-sparkle" style="animation-delay: 2.4s;">
          <text x="124" y="84" font-family="'Fredoka', cursive, sans-serif" font-weight="900" font-size="11" fill="#FFC8DD" text-anchor="middle">7</text>
        </g>
        <!-- Chispa estelar mágica -->
        <g class="story-anim-sparkle" style="animation-delay: 4.8s;">
          <path d="M100 74 L102 78 L106 80 L102 82 L100 86 L98 82 L94 80 L98 78 Z" fill="#FFF" />
        </g>
        <!-- Signo + de la Suma de Armonía -->
        <g class="story-anim-sparkle" style="animation-delay: 7.2s;">
          <text x="88" y="78" font-family="'Fredoka', cursive, sans-serif" font-weight="900" font-size="10" fill="#B8F2E6" text-anchor="middle">+</text>
        </g>

        <!-- 4. Órbita Tridimensional de las Cuatro Razas de Ponis (10s de rotación) -->
        <g class="story-anim-orbit-cw">
          <!-- Trayectoria elíptica sutil -->
          <ellipse cx="100" cy="100" rx="68" ry="60" fill="none" stroke="rgba(255,209,102,0.18)" stroke-width="1" stroke-dasharray="3,4" />

          <!-- Raza 1: ALICORNIO (Cúspide Norte: Rosa/Oro • Valen) -->
          <g transform="translate(100, 36)">
            <circle cx="0" cy="0" r="9" fill="url(#c1-orb-alicorn)" stroke="#FFD166" stroke-width="1.4" />
            <!-- Corona estelar de alicornio -->
            <path d="M-4 1 L-3 -3 L0 -1 L3 -3 L4 1 Z" fill="#FFD166" />
          </g>

          <!-- Raza 2: PEGASO (Este: Celeste Viento • Reni) -->
          <g transform="translate(164, 100)">
            <circle cx="0" cy="0" r="8.5" fill="url(#c1-orb-pegasus)" stroke="#FFF" stroke-width="1.3" />
            <!-- Silueta de pluma alada -->
            <path d="M-3 -1 C-2 -4 3 -4 3 -1 C3 2 -1 3 -3 -1 Z" fill="#FFF" opacity="0.9" />
          </g>

          <!-- Raza 3: PONI TERRESTRE (Sur: Menta Firmeza • Zoe) -->
          <g transform="translate(100, 164)">
            <circle cx="0" cy="0" r="8.5" fill="url(#c1-orb-earth)" stroke="#FFD166" stroke-width="1.3" />
            <!-- Hoja silvestre de la tierra -->
            <path d="M0 -3 C3 -3 3 2 0 4 C-3 2 -3 -3 0 -3 Z" fill="#FFF" opacity="0.9" />
          </g>

          <!-- Raza 4: UNICORNIO (Oeste: Lila Cristal • Lía) -->
          <g transform="translate(36, 100)">
            <circle cx="0" cy="0" r="8.5" fill="url(#c1-orb-unicorn)" stroke="#FFF" stroke-width="1.3" />
            <!-- Cuerno místico de prisma -->
            <polygon points="0,-4 3,3 -3,3" fill="#FFF" opacity="0.95" />
          </g>
        </g>

        <!-- 5. Estrella Cimera de Lumiria (Destello armónico culminante) -->
        <g class="story-anim-star-crown">
          <path d="M100 28 L102.5 35 L110 37.5 L102.5 40 L100 47 L97.5 40 L90 37.5 L97.5 35 Z" fill="#FFF" stroke="#FFD166" stroke-width="1.2" />
          <circle cx="100" cy="37.5" r="2.5" fill="#FFD166" />
        </g>
      </svg>
    `
  },

  // Capítulos 2 al 8 preparados con el contrato estándar (utilizan fallback dinámico hasta su implementación)
  2: { id: 'scene-eclipse', name: 'La Emperatriz Eclipse' },
  3: { id: 'scene-valen', name: 'Valen, la Princesa Astral' },
  4: { id: 'scene-reni', name: 'Reni, el Alquimista de los Vientos' },
  5: { id: 'scene-zoe', name: 'Zoe, el Ancla de la Naturaleza' },
  6: { id: 'scene-lia', name: 'Lía, la Maga del Cristal Cósmico' },
  7: { id: 'scene-temples', name: 'La Travesía de las Diez Lunas' },
  8: { id: 'scene-portal', name: 'Los Portales Bifásicos y Tu Gran Misión' }
};

/**
 * Renderiza la escena animada del capítulo en el contenedor especificado.
 * Si el capítulo cuenta con escena vectorial dedicada, la inyecta;
 * en caso contrario, utiliza el fallback canónico (#symbolId).
 * 
 * @param {Object} chapter - Objeto canónico del capítulo de CHAPTERS
 * @param {HTMLElement} container - Contenedor DOM (#stage-character)
 */
export function renderChapterScene(chapter, container) {
  if (!container) return;

  const sceneConfig = STORY_SCENES[chapter.id];

  if (sceneConfig && typeof sceneConfig.render === 'function') {
    container.innerHTML = sceneConfig.render();
  } else {
    // Fallback gracioso homogéneo
    container.innerHTML = `<svg class="vq-anim-float" aria-hidden="true"><use href="#${chapter.symbolId}"></use></svg>`;
  }
}
