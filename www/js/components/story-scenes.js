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

          <!-- Orbe 1: Alicornio (Rosa / Oro • Magia Real de las Estrellas) -->
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

  // Capítulo 2: La Emperatriz Eclipse y el Sueño del Olvido
  2: {
    id: 'scene-eclipse',
    name: 'La Emperatriz Eclipse y el Sueño del Olvido',
    render: () => `
      <svg class="story-scene-svg story-scene-c2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="La Emperatriz Eclipse y el Sueño del Olvido">
        <defs>
          <!-- Bruma cósmica del Sueño del Olvido -->
          <radialGradient id="c2-mist-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#9D4EDD" stop-opacity="0.6" />
            <stop offset="45%" stop-color="#5A189A" stop-opacity="0.35" />
            <stop offset="80%" stop-color="#240046" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#130E1F" stop-opacity="0" />
          </radialGradient>

          <!-- Luna Plateada de Lumiria -->
          <linearGradient id="c2-moon-silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="60%" stop-color="#E2E8F0" />
            <stop offset="100%" stop-color="#CBD5E1" />
          </linearGradient>

          <!-- Sombra amatista del Eclipse -->
          <radialGradient id="c2-eclipse-shadow" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#3C096C" />
            <stop offset="65%" stop-color="#240046" />
            <stop offset="100%" stop-color="#10002B" />
          </radialGradient>

          <!-- Anillo de fuego dorado / Corona estelar -->
          <linearGradient id="c2-corona-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFEAA7" />
            <stop offset="50%" stop-color="#FFD166" />
            <stop offset="100%" stop-color="#F39C12" />
          </linearGradient>

          <!-- Tiara Soberana de la Emperatriz -->
          <linearGradient id="c2-tiara-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F39C12" />
            <stop offset="50%" stop-color="#FFF" />
            <stop offset="100%" stop-color="#FFD166" />
          </linearGradient>

          <!-- Fragmentos de cristal / Páginas sagradas -->
          <linearGradient id="c2-shard-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="70%" stop-color="#FFD166" />
            <stop offset="100%" stop-color="#E17055" />
          </linearGradient>
        </defs>

        <!-- 1. Bruma Cósmica Giratoria del Sueño del Olvido -->
        <g class="story-anim-c2-mist-swirl">
          <circle cx="100" cy="100" r="75" fill="url(#c2-mist-glow)" />
          <!-- Filamentos de niebla violácea etérea -->
          <path d="M40 90 Q70 60 100 80 T160 70 Q140 120 100 120 T40 90 Z" fill="none" stroke="rgba(157,78,221,0.25)" stroke-width="8" stroke-linecap="round" />
          <path d="M50 120 Q80 140 110 120 T150 130" fill="none" stroke="rgba(255,209,102,0.18)" stroke-width="3" stroke-linecap="round" />
        </g>

        <!-- 2. Núcleo Lunar Central Flotante -->
        <g class="story-anim-levitate">
          <!-- Resplandor exterior de la Luna -->
          <circle cx="100" cy="100" r="46" fill="rgba(255,255,255,0.08)" />

          <!-- Anillo de Fuego de Corona Solar durante el Eclipse -->
          <circle class="story-anim-c2-corona-ring" cx="100" cy="100" r="45" fill="none" stroke="url(#c2-corona-ring-grad)" stroke-width="3.2" stroke-dasharray="8,4" />

          <!-- Disco de la Luna Llena Plateada -->
          <circle cx="100" cy="100" r="42" fill="url(#c2-moon-silver)" stroke="#E2E8F0" stroke-width="1.2" />
          <!-- Detalles sutiles de cráteres de cristal -->
          <circle cx="86" cy="92" r="5" fill="#CBD5E1" opacity="0.45" />
          <circle cx="112" cy="114" r="7" fill="#CBD5E1" opacity="0.4" />
          <circle cx="94" cy="118" r="3.5" fill="#CBD5E1" opacity="0.35" />

          <!-- Disco de Sombra del Eclipse que se desliza sobre la Luna -->
          <g class="story-anim-c2-eclipse-slide">
            <circle cx="100" cy="100" r="42.5" fill="url(#c2-eclipse-shadow)" stroke="#FFD166" stroke-width="1.6" />
            <!-- Velo de penumbra interno -->
            <path d="M68 90 Q100 70 132 90 Q100 120 68 90 Z" fill="rgba(60,9,108,0.4)" />
          </g>

          <!-- Chispa de Esperanza Latente en el Corazón del Eclipse -->
          <g class="story-anim-c2-hope-spark">
            <polygon points="100,92 102.5,98 108,100 102.5,102 100,108 97.5,102 92,100 97.5,98" fill="#FFF" stroke="#FFD166" stroke-width="0.8" />
            <circle cx="100" cy="100" r="2" fill="#FFD166" />
          </g>

          <!-- 3. Tiara de Medianoche de la Soberana Astral -->
          <g transform="translate(100, 56)">
            <!-- Alas/Cuernos sutiles de la corona de la noche -->
            <path d="M-22 6 Q-12 -6 0 -14 Q12 -6 22 6 Q12 1 0 -2 Q-12 1 -22 6 Z" fill="url(#c2-tiara-gold)" stroke="#FFD166" stroke-width="1" />
            <!-- Joya amatista central de la tiara -->
            <polygon points="0,-16 4,-9 0,-2 -4,-9" fill="#9D4EDD" stroke="#FFF" stroke-width="0.8" />
            <!-- Cúspide lunar creciente -->
            <path d="M-6 -8 Q0 -12 6 -8 Q3 -6 0 -6 Q-3 -6 -6 -8 Z" fill="#FFF" />
          </g>
        </g>

        <!-- 4. Dispersión Centrífuga de las Diez Páginas Sagradas del Gran Grimorio -->
        <g class="story-anim-c2-pages-disperse">
          <!-- Trayectoria orbital punteada -->
          <ellipse cx="100" cy="100" rx="72" ry="68" fill="none" stroke="rgba(255,209,102,0.18)" stroke-width="0.9" stroke-dasharray="2,5" />

          <!-- Página 1: Templo Manantial (Norte) -->
          <g transform="translate(100, 28)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 2: Templo Bosque (Noreste Alto) -->
          <g transform="translate(142, 42)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 3: Templo Algodón (Este Alto) -->
          <g transform="translate(168, 76)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 4: Templo Ámbar (Este Bajo) -->
          <g transform="translate(168, 124)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 5: Palacio Prisma (Sureste) -->
          <g transform="translate(142, 158)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 6: Reloj de Arenas (Sur) -->
          <g transform="translate(100, 172)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 7: Mar de Coral (Suroeste) -->
          <g transform="translate(58, 158)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 8: Muralla de Nácar (Oeste Bajo) -->
          <g transform="translate(32, 124)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 9: Cúspide Aurora (Oeste Alto) -->
          <g transform="translate(32, 76)"><polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="url(#c2-shard-gold)" stroke="#FFF" stroke-width="0.7" /></g>
          <!-- Página 10: Trono Estelar (Noroeste) -->
          <g transform="translate(58, 42)"><polygon points="0,-5 4.5,0 0,5 -4.5,0" fill="#FFD166" stroke="#FFF" stroke-width="0.9" /></g>
        </g>
      </svg>
    `
  },

  // Capítulo 7: La Travesía de las Diez Lunas y los Tres Actos
  7: {
    id: 'scene-temples',
    name: 'La Travesía de las Diez Lunas y los Tres Actos',
    render: () => `
      <svg class="story-scene-svg story-scene-c7" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="El Planetario de Lumiria y la Travesía de las Diez Lunas">
        <defs>
          <!-- Resplandor del Planetario de Medianoche -->
          <radialGradient id="c7-planetarium-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1D3557" stop-opacity="0.85" />
            <stop offset="60%" stop-color="#0B132B" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#000" stop-opacity="0" />
          </radialGradient>

          <!-- Rosa de los vientos y astrolabio central -->
          <linearGradient id="c7-compass-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF9E6" />
            <stop offset="50%" stop-color="#FFD166" />
            <stop offset="100%" stop-color="#F4A261" />
          </linearGradient>

          <!-- Gradiantes de las Diez Lunas por Acto -->
          <!-- Acto I -->
          <radialGradient id="c7-m1-manantial" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#A0E7E5" /><stop offset="100%" stop-color="#00B4D8" />
          </radialGradient>
          <radialGradient id="c7-m2-bosque" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#B8F2E6" /><stop offset="100%" stop-color="#2EC4B6" />
          </radialGradient>
          <radialGradient id="c7-m3-algodon" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#FFAFCC" /><stop offset="100%" stop-color="#FF70A6" />
          </radialGradient>

          <!-- Acto II -->
          <radialGradient id="c7-m4-ambar" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#FFEAA7" /><stop offset="100%" stop-color="#E67E22" />
          </radialGradient>
          <radialGradient id="c7-m5-prisma" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#E0AAFF" /><stop offset="100%" stop-color="#70D6FF" />
          </radialGradient>
          <radialGradient id="c7-m6-arenas" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#C77DFF" /><stop offset="100%" stop-color="#6A0572" />
          </radialGradient>
          <radialGradient id="c7-m7-coral" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#48CAE4" /><stop offset="100%" stop-color="#023E8A" />
          </radialGradient>

          <!-- Acto III -->
          <radialGradient id="c7-m8-nacar" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="60%" stop-color="#E2E8F0" /><stop offset="100%" stop-color="#94A3B8" />
          </radialGradient>
          <radialGradient id="c7-m9-aurora" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="40%" stop-color="#FEE440" /><stop offset="100%" stop-color="#FF5964" />
          </radialGradient>
          <radialGradient id="c7-m10-trono" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFF" /><stop offset="50%" stop-color="#FFD166" /><stop offset="100%" stop-color="#D4AF37" />
          </radialGradient>
        </defs>

        <!-- 1. Fondo de Nebulosa Celestial del Astrolabio -->
        <circle cx="100" cy="100" r="82" fill="url(#c7-planetarium-glow)" />

        <!-- 2. Constelación Conectiva Decagonal (Armonía de la Travesía) -->
        <g class="story-anim-c7-constellation" fill="none" stroke="#FFD166" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.6">
          <polygon points="100,28 137,63 162,136 137,137 100,166 63,137 38,136 63,63" />
          <line x1="100" y1="28" x2="100" y2="166" stroke="rgba(255,209,102,0.2)" />
          <line x1="38" y1="136" x2="162" y2="136" stroke="rgba(255,209,102,0.2)" />
        </g>

        <!-- 3. ANILLO III: Acto III • La Gran Purificación (Radio 72px) -->
        <g class="story-anim-c7-ring3">
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,209,102,0.3)" stroke-width="1.2" stroke-dasharray="4,6" />

          <!-- Luna 8: Muralla de Nácar (Norte) -->
          <g transform="translate(100, 28)">
            <circle cx="0" cy="0" r="6.5" fill="url(#c7-m8-nacar)" stroke="#FFF" stroke-width="1.2" />
            <circle cx="0" cy="0" r="2" fill="#FFF" />
          </g>

          <!-- Luna 9: Cúspide de la Aurora (Sureste) -->
          <g transform="translate(162, 136)">
            <circle cx="0" cy="0" r="7" fill="url(#c7-m9-aurora)" stroke="#FFD166" stroke-width="1.2" />
            <polygon points="0,-3 2,1 -2,1" fill="#FFF" />
          </g>

          <!-- Luna 10: Trono Supremo de las Estrellas (Suroeste - Reina Restaurada) -->
          <g transform="translate(38, 136)">
            <circle cx="0" cy="0" r="8.5" fill="url(#c7-m10-trono)" stroke="#FFF" stroke-width="1.5" />
            <!-- Corona estelar de la Emperatriz Soberana Astral -->
            <path d="M-4 1 L-3 -4 L0 -2 L3 -4 L4 1 Z" fill="#FFD166" stroke="#FFF" stroke-width="0.6" />
          </g>
        </g>

        <!-- 4. ANILLO II: Acto II • Los Secretos Olvidados (Radio 52px, Contrarrotación) -->
        <g class="story-anim-c7-ring2">
          <circle cx="100" cy="100" r="52" fill="none" stroke="rgba(255,209,102,0.25)" stroke-width="1" stroke-dasharray="3,5" />

          <!-- Luna 4: Caverna de Ámbar (Noreste) -->
          <g transform="translate(137, 63)">
            <circle cx="0" cy="0" r="6" fill="url(#c7-m4-ambar)" stroke="#FFD166" stroke-width="1" />
          </g>

          <!-- Luna 5: Palacio Prisma (Sureste) -->
          <g transform="translate(137, 137)">
            <circle cx="0" cy="0" r="6.5" fill="url(#c7-m5-prisma)" stroke="#FFF" stroke-width="1" />
            <polygon points="0,-2 2,2 -2,2" fill="#FFF" />
          </g>

          <!-- Luna 6: Reloj de las Arenas (Suroeste) -->
          <g transform="translate(63, 137)">
            <circle cx="0" cy="0" r="6" fill="url(#c7-m6-arenas)" stroke="#C77DFF" stroke-width="1" />
          </g>

          <!-- Luna 7: Mar de Coral Profundo (Noroeste) -->
          <g transform="translate(63, 63)">
            <circle cx="0" cy="0" r="6" fill="url(#c7-m7-coral)" stroke="#FFF" stroke-width="1" />
          </g>
        </g>

        <!-- 5. ANILLO I: Acto I • El Despertar de los Elementos (Radio 34px) -->
        <g class="story-anim-c7-ring1">
          <circle cx="100" cy="100" r="34" fill="none" stroke="rgba(255,209,102,0.4)" stroke-width="1.2" stroke-dasharray="2,4" />

          <!-- Luna 1: Manantial de Rocío (Norte Interior) -->
          <g transform="translate(100, 66)">
            <circle cx="0" cy="0" r="5.5" fill="url(#c7-m1-manantial)" stroke="#FFF" stroke-width="1" />
          </g>

          <!-- Luna 2: Bosque Susurrante (Sureste Interior) -->
          <g transform="translate(129, 117)">
            <circle cx="0" cy="0" r="5.5" fill="url(#c7-m2-bosque)" stroke="#FFD166" stroke-width="1" />
          </g>

          <!-- Luna 3: Vértice de Algodón (Suroeste Interior) -->
          <g transform="translate(71, 117)">
            <circle cx="0" cy="0" r="5.5" fill="url(#c7-m3-algodon)" stroke="#FFF" stroke-width="1" />
          </g>
        </g>

        <!-- 6. NÚCLEO CENTRAL: La Rosa de los Vientos y la Gran Estrella Guía -->
        <g class="story-anim-c7-compass">
          <!-- Anillo de sustentación central -->
          <circle cx="100" cy="100" r="14" fill="#0B132B" stroke="#FFD166" stroke-width="1.6" />
          <!-- Estrella de 8 puntas de la brújula -->
          <polygon points="100,88 103,97 112,100 103,103 100,112 97,103 88,100 97,97" fill="url(#c7-compass-gold)" stroke="#FFF" stroke-width="0.8" />
          <!-- Puntos cardinales menores -->
          <polygon points="100,92 102,98 108,100 102,102 100,108 98,102 92,100 98,98" fill="#FFF" opacity="0.85" />
          <!-- Gema central de cristal de Lumiria -->
          <circle cx="100" cy="100" r="3" fill="#FFF" stroke="#FFD166" stroke-width="0.8" />
        </g>
      </svg>
    `
  },

  // Capítulo 8: Los Portales Bifásicos y Tu Gran Misión (El Gran Final del Libro)
  8: {
    id: 'scene-portal',
    name: 'Los Portales Bifásicos y Tu Gran Misión',
    render: () => `
      <svg class="story-scene-svg story-scene-c8" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="El Gran Portal Bifásico y el Despertar de la Quinta Estrella">
        <defs>
          <!-- Vórtice de luz de los Portales de Lumiria -->
          <radialGradient id="c8-portal-vortex" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="35%" stop-color="#FFD166" stop-opacity="0.8" />
            <stop offset="65%" stop-color="#457B9D" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#1D3557" stop-opacity="0" />
          </radialGradient>

          <!-- Marco de cristal y oro del Gran Portal -->
          <linearGradient id="c8-arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFEAA7" />
            <stop offset="45%" stop-color="#FFD166" />
            <stop offset="100%" stop-color="#E76F51" />
          </linearGradient>

          <!-- Hojas de puerta de cristal iridiscente -->
          <linearGradient id="c8-gate-crystal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF" stop-opacity="0.75" />
            <stop offset="60%" stop-color="#A2D2FF" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#7B2CBF" stop-opacity="0.3" />
          </linearGradient>

          <!-- La Gran Quinta Estrella de la Armonía -->
          <linearGradient id="c8-star-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="40%" stop-color="#FFEAA7" />
            <stop offset="85%" stop-color="#FFD166" />
            <stop offset="100%" stop-color="#F39C12" />
          </linearGradient>

          <!-- Alas de luz alicornio de la Quinta Estrella -->
          <linearGradient id="c8-wings-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFF" stop-opacity="0.95" />
            <stop offset="60%" stop-color="#FFAFCC" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FFD166" stop-opacity="0.5" />
          </linearGradient>

          <!-- Haces convergentes de los 4 linajes -->
          <linearGradient id="c8-beam-valen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFAFCC" /><stop offset="100%" stop-color="#FFF" />
          </linearGradient>
          <linearGradient id="c8-beam-reni" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#A2D2FF" /><stop offset="100%" stop-color="#FFF" />
          </linearGradient>
          <linearGradient id="c8-beam-zoe" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#B8F2E6" /><stop offset="100%" stop-color="#FFF" />
          </linearGradient>
          <linearGradient id="c8-beam-lia" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#E0AAFF" /><stop offset="100%" stop-color="#FFF" />
          </linearGradient>
        </defs>

        <!-- 1. Vórtice Interior del Portal (Respiración Bifásica de Calma a Fulgor) -->
        <g class="story-anim-c8-vortex">
          <ellipse cx="100" cy="105" rx="55" ry="65" fill="url(#c8-portal-vortex)" />
          <circle cx="100" cy="105" r="40" fill="rgba(255,255,255,0.12)" />
        </g>

        <!-- 2. Marco Arquitectónico del Gran Portal de Cristal -->
        <g>
          <!-- Pedestal de soporte -->
          <path d="M44 165 L156 165 L148 174 L52 174 Z" fill="#D4AF37" opacity="0.85" />
          <line x1="40" y1="165" x2="160" y2="165" stroke="#FFD166" stroke-width="2" />

          <!-- Columnas laterales de templo -->
          <rect x="52" y="90" width="10" height="75" rx="2" fill="url(#c8-arch-gold)" />
          <rect x="138" y="90" width="10" height="75" rx="2" fill="url(#c8-arch-gold)" />
          <!-- Bases de columnas -->
          <rect x="48" y="158" width="18" height="7" rx="1.5" fill="#FFEAA7" />
          <rect x="134" y="158" width="18" height="7" rx="1.5" fill="#FFEAA7" />

          <!-- Gran Arco Ojival de Cristal -->
          <path d="M52 92 C52 46 80 28 100 24 C120 28 148 46 148 92" fill="none" stroke="url(#c8-arch-gold)" stroke-width="6" stroke-linecap="round" />
          <path d="M60 92 C60 54 82 38 100 34 C118 38 140 54 140 92" fill="none" stroke="#FFF" stroke-width="1.2" opacity="0.8" />

          <!-- Cúspide del Portal: Prisma Guardián -->
          <polygon points="100,18 106,26 100,34 94,26" fill="#FFF" stroke="#FFD166" stroke-width="1.2" />
        </g>

        <!-- 3. Hojas de Puerta de Cristal Abatibles -->
        <!-- Hoja Izquierda -->
        <g class="story-anim-c8-gate-l">
          <path d="M62 92 C62 58 80 44 99 38 L99 164 L62 164 Z" fill="url(#c8-gate-crystal)" stroke="#FFF" stroke-width="1" />
          <!-- Filigrana rúnica interna -->
          <circle cx="80" cy="100" r="10" fill="none" stroke="rgba(255,209,102,0.5)" stroke-width="0.8" />
        </g>
        <!-- Hoja Derecha -->
        <g class="story-anim-c8-gate-r">
          <path d="M138 92 C138 58 120 44 101 38 L101 164 L138 164 Z" fill="url(#c8-gate-crystal)" stroke="#FFF" stroke-width="1" />
          <!-- Filigrana rúnica interna -->
          <circle cx="120" cy="100" r="10" fill="none" stroke="rgba(255,209,102,0.5)" stroke-width="0.8" />
        </g>

        <!-- 4. Haces Convergentes del Cuarteto de la Armonía -->
        <g class="story-anim-c8-beams">
          <!-- Haz 1: Valen (Noroeste -> Centro) -->
          <path d="M30 40 Q65 65 98 96" fill="none" stroke="url(#c8-beam-valen)" stroke-width="3" stroke-linecap="round" />
          <circle cx="30" cy="40" r="4" fill="#FFAFCC" />

          <!-- Haz 2: Reni (Noreste -> Centro) -->
          <path d="M170 40 Q135 65 102 96" fill="none" stroke="url(#c8-beam-reni)" stroke-width="3" stroke-linecap="round" />
          <circle cx="170" cy="40" r="4" fill="#A2D2FF" />

          <!-- Haz 3: Zoe (Suroeste -> Centro) -->
          <path d="M30 150 Q65 125 98 98" fill="none" stroke="url(#c8-beam-zoe)" stroke-width="3" stroke-linecap="round" />
          <circle cx="30" cy="150" r="4" fill="#B8F2E6" />

          <!-- Haz 4: Lía (Sureste -> Centro) -->
          <path d="M170 150 Q135 125 102 98" fill="none" stroke="url(#c8-beam-lia)" stroke-width="3" stroke-linecap="round" />
          <circle cx="170" cy="150" r="4" fill="#E0AAFF" />
        </g>

        <!-- 5. LA QUINTA ESTRELLA DE LA ARMONÍA (El Despertar del Aprendiz) -->
        <g class="story-anim-c8-star">
          <!-- Resplandor áureo expansivo -->
          <circle cx="100" cy="96" r="28" fill="url(#c8-portal-vortex)" opacity="0.85" />

          <!-- Alas de Luz Alicornio Desplegadas -->
          <!-- Ala Izquierda -->
          <path d="M96 96 C82 82 64 74 48 80 C56 94 72 102 96 100 Z" fill="url(#c8-wings-glow)" stroke="#FFF" stroke-width="0.8" />
          <path d="M52 86 C65 88 78 94 92 98" fill="none" stroke="#FFF" stroke-width="0.6" />

          <!-- Ala Derecha -->
          <path d="M104 96 C118 82 136 74 152 80 C144 94 128 102 104 100 Z" fill="url(#c8-wings-glow)" stroke="#FFF" stroke-width="0.8" />
          <path d="M148 86 C135 88 122 94 108 98" fill="none" stroke="#FFF" stroke-width="0.6" />

          <!-- La Gran Quinta Estrella de 5 Puntas -->
          <polygon points="100,78 105,90 118,92 108,100 112,113 100,105 88,113 92,100 82,92 95,90" fill="url(#c8-star-gold)" stroke="#FFF" stroke-width="1.4" stroke-linejoin="round" />

          <!-- Diamante prisma en el corazón de la estrella -->
          <polygon points="100,88 104,95 100,102 96,95" fill="#FFF" stroke="#FFD166" stroke-width="0.8" />
          <circle cx="100" cy="95" r="2" fill="#FFD166" />
        </g>

        <!-- 6. Destellos y Confeti Estelar de Celebración -->
        <g class="story-anim-sparkle" style="animation-delay: 1s;">
          <polygon points="100,50 102,54 106,55 102,56 100,60 98,56 94,55 98,54" fill="#FFF" />
        </g>
        <g class="story-anim-sparkle" style="animation-delay: 3.5s;">
          <polygon points="70,75 71.5,78 74.5,79 71.5,80 70,83 68.5,80 65.5,79 68.5,78" fill="#FFD166" />
        </g>
        <g class="story-anim-sparkle" style="animation-delay: 6s;">
          <polygon points="130,75 131.5,78 134.5,79 131.5,80 130,83 128.5,80 125.5,79 128.5,78" fill="#FFAFCC" />
        </g>
      </svg>
    `
  },

  // Capítulos 3, 4, 5 y 6 preparados con el contrato estándar (fallback canónico #symbolId)
  3: { id: 'scene-valen', name: 'Valen, Princesa de las Estrellas' },
  4: { id: 'scene-reni', name: 'Reni, Princesa de los Vientos' },
  5: { id: 'scene-zoe', name: 'Zoe, Princesa de la Naturaleza' },
  6: { id: 'scene-lia', name: 'Lía, Princesa de los Cristales' }
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
