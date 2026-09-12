# ValenQuest: Especificación de Universo, Arte y Sistema Visual

Documento de diseño para el motor visual y narrativo de **ValenQuest**, integrando la estética pastel mágica inspirada en *My Little Pony: Friendship is Magic* con la interfaz de bordes definidos, diálogos y coleccionismo chibi estilo *Gacha Life/Club*.

---

## 1. Lore & Narrativa del Videojuego

### Premisa
En el reino celestial de **Lumiria**, la *Gran Biblioteca de las Constelaciones* ha perdido su brillo: el *Velo de la Duda* desordenó las palabras de los pergaminos y borró las fórmulas de cristal. 

La heroína **Valen** es elegida por los Espíritus Estelares para empuñar el **Prisma Numérico** y la **Pluma de la Fluidez**. Con cada cálculo resuelto y cada frase dominada, Valen enciende constelaciones, despierta guardianes míticos y desbloquea accesorios mágicos para su avatar.

### Mapa de Progresión (Tiers Temáticos)
* **Nivel 1: Jardín de Rocío (Suma elemental sin acarreo):** Mascotas burbuja que se unen para formar constelaciones simples.
* **Nivel 2: Valle Nube (Sumas y restas hasta 20):** Despejar ráfagas de viento sumando nubes o apartando tormentas.
* **Nivel 3: Cristalera de Ámbar (Suma con acarreo):** Fusión de gemas posicionales (unidades que se transforman en decenas doradas).
* **Nivel 4: Bosque de Sombras Claras (Resta con transformación):** Desactivar candados de luz prestando energía de las decenas a las unidades.
* **Nivel 5: Palacio Prisma (Tablas rápidas: 2, 3, 5, 10):** Portales de multiplicación que duplican o quintuplican talismanes.
* **Nivel 6: Trono de las Estrellas (Tablas maestras: 4, 6, 7, 8, 9):** Duelos amigables contra guardianes astrales para completar el libro.

---

## 2. Paleta Cromática y Tokens Semánticos

El sistema combina tonos pastel de alta saturación lúdica con un contorno ciruela profundo para lograr el contraste nítido característico de los stickers Gacha.

| Token CSS | Hex Code | Referencia Estética | Uso Primario |
|---|---|---|---|
| `--vq-pink-bubble` | `#FFAFCC` | Pinkie Pie / Gacha Accent | Botones de acción, corazones de vida, aciertos. |
| `--vq-lavender-glow`| `#CDB4DB` | Twilight Sparkle / Magia | Fondos de tarjetas, barra de maestría, modales. |
| `--vq-sky-pastel` | `#A2D2FF` | Rainbow Dash / Cielo | Contenedores de lectura, botones secundarios. |
| `--vq-cloud-soft` | `#FDF7FF` | Blancura acolchada | Fondo general de la aplicación (Canvas/DOM). |
| `--vq-gold-star` | `#FFD166` | Estrellas / Insignias | Rachas de aciertos, chispas de combo, recompensas. |
| `--vq-mint-spark` | `#B8F2E6` | Fluttershy / Naturaleza | Notificaciones de éxito rápido y bonificaciones. |
| `--vq-border-ink` | `#4A3E56` | Contorno Sticker Gacha | Bordes de 3-4px de todos los componentes interactivos. |
| `--vq-text-main` | `#32213F` | Contraste de lectura | Tipografía sobre fondos pastel (accesibilidad AA). |

---

## 3. Hoja de Estilos: `www/css/theme-valenquest.css`

```css
/* ==========================================================================
   VALENQUEST DESIGN SYSTEM - MLP x GACHA HYBRID SPEC
   ========================================================================== */

:root {
  /* Paleta Base */
  --vq-pink-bubble: #FFAFCC;
  --vq-pink-light: #FFC8DD;
  --vq-lavender: #CDB4DB;
  --vq-sky: #A2D2FF;
  --vq-sky-light: #BDE0FE;
  --vq-cloud: #FDF7FF;
  --vq-gold: #FFD166;
  --vq-mint: #B8F2E6;
  --vq-border: #4A3E56;
  --vq-text: #32213F;

  /* Elevaciones e Interacción Gacha */
  --vq-border-width: 3px;
  --vq-radius-bubble: 20px;
  --vq-radius-pill: 50px;
  --vq-shadow-hard: 0 6px 0 var(--vq-border);
  --vq-shadow-active: 0 2px 0 var(--vq-border);
  
  /* Tipografía */
  --vq-font-kids: 'Fredoka', 'Quicksand', system-ui, sans-serif;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--vq-cloud);
  background-image: 
    radial-gradient(var(--vq-sky-light) 15%, transparent 16%),
    radial-gradient(var(--vq-pink-light) 15%, transparent 16%);
  background-size: 60px 60px;
  background-position: 0 0, 30px 30px;
  color: var(--vq-text);
  font-family: var(--vq-font-kids);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Tarjeta Principal de Reto (Estilo Chibi Sticker) */
.vq-card {
  background: white;
  border: var(--vq-border-width) solid var(--vq-border);
  border-radius: var(--vq-radius-bubble);
  box-shadow: var(--vq-shadow-hard);
  padding: 24px;
  position: relative;
  overflow: hidden;
  max-width: 480px;
  margin: 20px auto;
}

/* Medalla o Header Superior */
.vq-header-badge {
  background: var(--vq-pink-bubble);
  border: var(--vq-border-width) solid var(--vq-border);
  border-radius: var(--vq-radius-pill);
  padding: 6px 18px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 0 var(--vq-border);
}

/* Área del Problema Numérico / Frase */
.vq-display-box {
  background: var(--vq-sky-light);
  border: var(--vq-border-width) solid var(--vq-border);
  border-radius: 16px;
  margin: 20px 0;
  padding: 24px;
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  color: var(--vq-text);
  text-shadow: 2px 2px 0 white;
}

/* Barra de Maestría Dinámica (Alimentada por WASM) */
.vq-meter-track {
  background: white;
  border: var(--vq-border-width) solid var(--vq-border);
  height: 22px;
  border-radius: var(--vq-radius-pill);
  position: relative;
  overflow: hidden;
}

.vq-meter-fill {
  background: linear-gradient(90deg, var(--vq-mint), var(--vq-gold));
  height: 100%;
  width: 50%;
  border-right: 2px solid var(--vq-border);
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Botones con efecto de pulsación física */
.vq-btn {
  background: var(--vq-gold);
  border: var(--vq-border-width) solid var(--vq-border);
  border-radius: 16px;
  box-shadow: var(--vq-shadow-hard);
  color: var(--vq-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 14px 24px;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

.vq-btn:active {
  transform: translateY(4px);
  box-shadow: var(--vq-shadow-active);
}

/* Diálogo estilo Gacha Life */
.vq-dialogue-bubble {
  background: white;
  border: var(--vq-border-width) solid var(--vq-border);
  border-radius: 18px;
  padding: 14px 20px;
  position: relative;
  font-size: 1.1rem;
  line-height: 1.4;
  box-shadow: 0 4px 0 var(--vq-border);
}

.vq-dialogue-bubble::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 32px;
  border-width: 12px 10px 0;
  border-style: solid;
  border-color: var(--vq-border) transparent;
  display: block;
  width: 0;
}
```

---

## 4. Biblioteca Vectorial SVG (Iconografía & Artefactos de Lumiria)

Para mantener la regla arquitectónica de **cero dependencias externas**, máxima nitidez en pantallas móviles/Retina y tiempos de carga instantáneos (sin peticiones HTTP pesadas de imágenes ráster PNG/WebP), los activos gráficos e iconográficos de **ValenQuest** se estructuran como una **biblioteca de símbolos vectoriales SVG (`<symbol>`)**.

### 4.1. Principios de Renderizado Vectorial Gacha / MLP
1. **Contorno Grueso Uniforme:** Todos los iconos cuentan con un trazo perimetral de `3px` o `4px` en tinta ciruela `--vq-border` (`#4A3E56`), con esquinas y uniones redondeadas (`stroke-linecap="round" stroke-linejoin="round"`) para emular el contorno sólido de los stickers chibi estilo Gacha.
2. **Paleta Pastel Cohesiva:** Rellenos basados en los tokens del sistema (`--vq-pink-bubble`, `--vq-gold`, `--vq-sky`, `--vq-lavender`, `--vq-mint`).
3. **Puntos de Brillo Especular ("Kawaii Highlights"):** Pequeñas elipses o trazos de brillo blanco semitransparente (`fill="white" opacity="0.8"`) situados en la esquina superior izquierda de cada activo para simular volumen de sticker vinílico o cristal mágico.
4. **Normalización de Escala:** Todos los activos se diseñan sobre un canvas estándar de `viewBox="0 0 64 64"`, lo que permite redimensionarlos a 24px, 48px, 96px o 180px con total fidelidad visual y cero pixelación.

---

### 4.2. Catálogo de Artefactos e Iconos Clave

| ID del Símbolo | Nombre Narrativo | Uso en la Interfaz | Atributos y Colores |
|---|---|---|---|
| `#vq-icon-prism` | Prisma Numérico | Ícono representativo de Matemáticas | Cristal hexagonal facetado en lavanda y azul cielo con núcleo rosa y contorno ciruela. |
| `#vq-icon-quill` | Pluma de la Fluidez | Ícono representativo de Lectura | Pluma mágica celeste pastel con ribetes y chispas doradas de estrella. |
| `#vq-icon-star` | Estrella de Lumiria | Medallas, maestría y rachas de combo | Estrella de cinco puntas dorada con brillo kawaii y contorno rígido de 4px. |
| `#vq-icon-flame` | Fuego de Racha | Indicador de combos consecutivos ($\ge 3$) | Llama cálida en capas rosa pastel y oro brillante con animación de pulso. |
| `#vq-icon-heart` | Corazón de Ánimo | Vidas, perseverancia y felicitaciones | Corazón en rosa chicle pastel con reflejo blanco arqueado. |
| `#vq-icon-bubble-pet` | Guardián Burbuja | Mascota guía del Nivel 1 (Jardín de Rocío) | Gota celestial sonriente con rubor pastel y reflejos de rocío. |
| `#vq-icon-gem` | Gema Posicional | Transformación de decenas en Nivel 3 | Rombo mágico ambarino con facetas de cristal. |
| `#vq-icon-padlock` | Candado de Luz | Niveles o retos aún bloqueados | Candado suave lavanda con cerradura en forma de corazón. |
| `#vq-icon-scroll` | Pergamino de Leyendas | Contenedor de cuentos y lectura guiada | Rollo pergamino clásico en crema con cinta carmesí pastel. |
| `#vq-icon-sound-on` / `#vq-icon-sound-off` | Diapasón Mágico | Control de audio procedural Web Audio | Altavoz con ondas sonoras estelares y modo silenciado. |
| `#vq-icon-keypad` | Teclado Astral | Conmutador al teclado numérico | Matriz de 9 cuadrículas táctiles con contorno redondeado. |

---

### 4.3. Sprite Sheet Maestro (`www/assets/icons.svg`)

Archivo SVG compilado con los símbolos vectoriales para reutilización en todo el proyecto:

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">

  <!-- Prisma Numérico (Módulo de Matemáticas) -->
  <symbol id="vq-icon-prism" viewBox="0 0 64 64">
    <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="#CDB4DB" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <polygon points="32,4 32,60 6,46 6,18" fill="#BDE0FE" opacity="0.6"/>
    <polygon points="32,18 48,27 48,43 32,52 16,43 16,27" fill="#FFAFCC" stroke="#4A3E56" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="32,4 48,27 32,52 16,27" fill="#FFFFFF" opacity="0.4"/>
  </symbol>

  <!-- Pluma de la Fluidez (Módulo de Lectura) -->
  <symbol id="vq-icon-quill" viewBox="0 0 64 64">
    <path d="M54,6 C54,6 30,12 18,32 C14,38 12,46 10,58 C14,54 22,50 28,46 C34,42 46,30 52,18 C56,10 54,6 54,6 Z" 
          fill="#A2D2FF" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <path d="M10,58 L16,52" stroke="#4A3E56" stroke-width="4" stroke-linecap="round"/>
    <path d="M28,46 Q36,36 48,22" stroke="#4A3E56" stroke-width="3" stroke-linecap="round"/>
    <circle cx="48" cy="14" r="3" fill="#FFD166" stroke="#4A3E56" stroke-width="2"/>
    <path d="M42,8 L44,4 L46,8 L50,10 L46,12 L44,16 L42,12 L38,10 Z" fill="#FFD166"/>
  </symbol>

  <!-- Estrella de Lumiria (Maestría & Rachas) -->
  <symbol id="vq-icon-star" viewBox="0 0 64 64">
    <polygon points="32,4 40,23 60,25 45,39 49,59 32,49 15,59 19,39 4,25 24,23" 
             fill="#FFD166" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <!-- Brillo Especular Gacha -->
    <ellipse cx="26" cy="22" rx="4" ry="2" transform="rotate(-30 26 22)" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="21" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8"/>
  </symbol>

  <!-- Fuego de Racha (Combos Consecutivos) -->
  <symbol id="vq-icon-flame" viewBox="0 0 64 64">
    <path d="M32,4 C38,16 54,26 54,42 C54,54 44,60 32,60 C20,60 10,54 10,42 C10,30 22,22 26,14 C28,20 32,22 34,18 C36,14 32,4 32,4 Z" 
          fill="#FFAFCC" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32,24 C36,32 44,36 44,46 C44,52 38,54 32,54 C26,54 20,52 20,46 C20,38 28,34 30,28 C32,32 34,32 32,24 Z" 
          fill="#FFD166" stroke="#4A3E56" stroke-width="3" stroke-linejoin="round"/>
  </symbol>

  <!-- Corazón Mágico (Vida / Aciertos) -->
  <symbol id="vq-icon-heart" viewBox="0 0 64 64">
    <path d="M32,56 C32,56 6,40 6,22 C6,12 14,6 24,6 C28,6 31,8 32,11 C33,8 36,6 40,6 C50,6 58,12 58,22 C58,40 32,56 32,56 Z" 
          fill="#FFAFCC" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <!-- Reflejo blanco arqueado -->
    <path d="M14,16 C16,12 20,10 24,10" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
  </symbol>

  <!-- Candado de Luz (Tier Bloqueado) -->
  <symbol id="vq-icon-padlock" viewBox="0 0 64 64">
    <rect x="14" y="26" width="36" height="30" rx="10" fill="#CDB4DB" stroke="#4A3E56" stroke-width="4"/>
    <path d="M22,26 V18 C22,12 26,8 32,8 C38,8 42,12 42,18 V26" fill="none" stroke="#4A3E56" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32" cy="39" r="4" fill="#4A3E56"/>
    <path d="M30,42 L34,42 L33,48 L31,48 Z" fill="#4A3E56"/>
  </symbol>

  <!-- Mascota Burbuja (Nivel 1 Jardín de Rocío) -->
  <symbol id="vq-icon-bubble-pet" viewBox="0 0 64 64">
    <circle cx="32" cy="34" r="24" fill="#B8F2E6" stroke="#4A3E56" stroke-width="4"/>
    <!-- Ojos Chibi -->
    <ellipse cx="24" cy="32" rx="3" ry="4" fill="#4A3E56"/>
    <ellipse cx="40" cy="32" rx="3" ry="4" fill="#4A3E56"/>
    <circle cx="23" cy="30" r="1" fill="white"/>
    <circle cx="39" cy="30" r="1" fill="white"/>
    <!-- Sonrisa y Rubor -->
    <path d="M29,38 Q32,41 35,38" fill="none" stroke="#4A3E56" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="18" cy="36" rx="3" ry="1.5" fill="#FFAFCC"/>
    <ellipse cx="46" cy="36" rx="3" ry="1.5" fill="#FFAFCC"/>
    <!-- Reflejo burbuja -->
    <path d="M18,22 C22,16 28,14 34,14" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </symbol>

  <!-- Altavoz de Audio Activo -->
  <symbol id="vq-icon-sound-on" viewBox="0 0 64 64">
    <path d="M10,24 L22,24 L36,12 L36,52 L22,40 L10,40 Z" fill="#FFD166" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <path d="M44,22 C48,26 48,38 44,42" fill="none" stroke="#4A3E56" stroke-width="4" stroke-linecap="round"/>
    <path d="M52,14 C58,22 58,42 52,50" fill="none" stroke="#4A3E56" stroke-width="4" stroke-linecap="round"/>
  </symbol>

  <!-- Altavoz Silenciado -->
  <symbol id="vq-icon-sound-off" viewBox="0 0 64 64">
    <path d="M10,24 L22,24 L36,12 L36,52 L22,40 L10,40 Z" fill="#CDB4DB" stroke="#4A3E56" stroke-width="4" stroke-linejoin="round"/>
    <line x1="42" y1="22" x2="56" y2="42" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
    <line x1="56" y1="22" x2="42" y2="42" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
  </symbol>

  <!-- Teclado Numérico Astral -->
  <symbol id="vq-icon-keypad" viewBox="0 0 64 64">
    <rect x="8" y="10" width="48" height="44" rx="8" fill="#FDF7FF" stroke="#4A3E56" stroke-width="4"/>
    <rect x="16" y="18" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
    <rect x="28" y="18" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
    <rect x="40" y="18" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
    <rect x="16" y="30" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
    <rect x="28" y="30" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
    <rect x="40" y="30" width="8" height="8" rx="2" fill="#FFAFCC" stroke="#4A3E56" stroke-width="2"/>
  </symbol>

</svg>
```

---

### 4.4. Patrones de Consumo en la Capa UI

#### Patrón 1: Instanciación Declarativa en HTML (Sprite Referenciado)
Permite reutilizar cualquier icono de forma limpia y accesible:

```html
<!-- Ícono de Prisma Numérico en el Header de Matemáticas -->
<svg class="vq-icon vq-icon--lg" role="img" aria-label="Prisma Numérico">
  <use href="assets/icons.svg#vq-icon-prism"></use>
</svg>

<!-- Ícono de Estrella en la Barra de Racha -->
<svg class="vq-icon vq-icon--star-spin" aria-hidden="true">
  <use href="assets/icons.svg#vq-icon-star"></use>
</svg>
```

#### Patrón 2: Clases Utilitarias CSS para Iconografía (`www/css/theme-valenquest.css`)
```css
/* Dimensiones y sombra de sticker */
.vq-icon {
  display: inline-block;
  width: 1.6em;
  height: 1.6em;
  vertical-align: middle;
  filter: drop-shadow(0 2px 0 var(--vq-border));
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vq-icon--sm { width: 1.2em; height: 1.2em; }
.vq-icon--lg { width: 2.4em; height: 2.4em; }
.vq-icon--xl { width: 3.5em; height: 3.5em; }

/* Animación de giro suave para estrellas de maestría */
.vq-icon--star-spin {
  animation: vqStarPulse 1.8s ease-in-out infinite alternate;
}

@keyframes vqStarPulse {
  0%   { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.12) rotate(10deg); }
}

/* Efecto de salto al presionar botones con icono */
.vq-btn:hover .vq-icon {
  transform: translateY(-2px) scale(1.08);
}
```

#### Patrón 3: Generador Dinámico en Vanilla JS (`www/js/icons.js`)
Para insertar o actualizar iconos dinámicamente según el estado retornado por el motor WASM:

```javascript
/**
 * Crea un elemento SVG que referencia un símbolo del sprite sheet.
 * @param {string} iconId - ID del símbolo (ej: 'vq-icon-star')
 * @param {string} [className=''] - Clases CSS opcionales
 * @returns {SVGSVGElement}
 */
export function createSvgIcon(iconId, className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `vq-icon ${className}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `assets/icons.svg#${iconId}`);
  // Compatibilidad con navegadores antiguos:
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `assets/icons.svg#${iconId}`);

  svg.appendChild(use);
  return svg;
}
```

---

### 4.5. Animaciones Vectoriales: ¿Por qué SVG es el formato definitivo frente a GIF, Lottie o WebM?

**Respuesta Técnica:** Sí, **el SVG animado es 100% nativo** y es el formato **superior y óptimo** para la arquitectura de *ValenQuest*. **No se requiere ningún otro formato**.

#### Comparativa Técnica de Formatos en Entornos Educativos:

| Criterio | SVG Animado (Nativo) | GIF Animado | Lottie (Bodymovin JSON) | Video (WebM / MP4) |
|---|---|---|---|---|
| **Cero Dependencias** | ✅ **100% Nativo** (CSS / SMIL) | ✅ Nativo | ❌ Requiere `lottie-web` (~80-150KB) | ✅ Nativo (tag `<video>`) |
| **Nitidez Vectorial** | ✅ **Infinita (Retina / 4K)** | ❌ Se pixela y deforma | ✅ Infinita | ❌ Pixelación por resolución |
| **Peso en Disco / Red** | ✅ **~1 KB - 5 KB** | ❌ 150 KB - 2 MB (Pesado) | ⚠️ 30 KB - 120 KB + runtime | ❌ 500 KB - 5 MB |
| **Transparencia Alpha** | ✅ Suave y perfecta | ❌ Borde dentado (1-bit mask) | ✅ Suave | ⚠️ Soporte desigual de canal alfa |
| **Consumo de Memoria/CPU**| ✅ Ultrabajo (GPU `transform`) | ❌ Alto (ciclo de decodificación) | ⚠️ Alto (evaluación JS de frames) | ⚠️ Ocupa decodificador de hardware |
| **Reactividad al Motor WASM**| ✅ **Total:** Se acelera o cambia de color con variables CSS | ❌ Inerte (no interactivo) | ⚠️ Requiere API externa | ❌ Inerte |
| **Accesibilidad (Reduced Motion)**| ✅ Filtro inmediato con media query | ❌ No se puede pausar fácilmente | ⚠️ Requiere llamadas JS | ⚠️ Requiere lógica personalizada |

#### Métodos de Animación en ValenQuest:
1. **Animación CSS sobre Elementos Internos (`@keyframes`):**
   Aprovecha la aceleración por hardware de la GPU para animar `transform` (`translate`, `rotate`, `scale`) y `opacity`. Es el estándar de oro en rendimiento web moderno.
2. **Animaciones Temáticas Implementadas:**
   * **`vq-anim-float`:** Levita el *Prisma Numérico* como un talismán celestial suspendido en el aire.
   * **`vq-anim-quill`:** Balancea la *Pluma de la Fluidez* con una cadencia suave de caligrafía.
   * **`vq-anim-star-spin`:** Hace pulsar y rotar la *Estrella de Lumiria* al ganar rachas.
   * **`vq-sparkle`:** Enciende y apaga destellos de luz kawaii en los bordes de los artefactos.
   * **`vq-anim-bounce`:** Rebote tierno (*idle bounce*) para las mascotas chibi del reino.


