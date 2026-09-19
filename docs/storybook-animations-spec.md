# Especificación Técnica y Catálogo Conceptual: Animaciones Vectoriales SVG del Gran Libro de Lumiria

**Documento:** `docs/storybook-animations-spec.md`  
**Estado:** Canónico / Aprobado  
**Versión:** 1.0.0 (ValenQuest v2.1.6)  
**Módulo Destino:** `www/story.html` (El Gran Libro de las Princesas y el Reino de Lumiria)

---

## 1. Propósito y Filosofía de Diseño

El módulo del **Gran Libro de las Princesas** (`story.html`) sumerge a Valentina y a los aprendices en la mitología fundacional de Lumiria a través de 8 capítulos canónicos. Cada capítulo cuenta con una página izquierda que alberga el **Espejo Mágico** (`.magic-mirror-frame`), un espacio ilustrado diseñado para complementar la lectura manuscrita.

Para elevar la experiencia sin sobrecargar cognitivamente al lector infantil (6 a 8 años) ni comprometer el rendimiento en dispositivos móviles o modo offline PWA, se establece un sistema de **animaciones vectoriales SVG nativas**:

1. **Cero Dependencias y Cero Peso:** Eliminación de GIFs, videos MP4 o sprites pesados. Todo se modela en SVG semántico y CSS3 puro (~3 a 4 KB por escena).
2. **Cadencia Calma (Bucle de 10 Segundos):** Una duración unificada de `10s` por ciclo para garantizar movimientos suaves, mágicos y contemplativos que no distraigan de la lectura.
3. **Control y Accesibilidad (Sweller CLT):** Sincronización con el botón *«Animación Activa / Pausada»* (`#btn-toggle-anim`) y soporte estricto para `@media (prefers-reduced-motion: reduce)`.
4. **Mantenibilidad Puntual:** Arquitectura desacoplada donde cada capítulo tiene su escena aislada en un catálogo modular.

---

## 2. Estándar Técnico de Implementación

### 2.1. Arquitectura de Archivos

```text
ValenQuest/
├── docs/
│   └── storybook-animations-spec.md   # [Este documento] Especificación canónica y catálogo
├── www/
│   ├── css/
│   │   ├── storybook.css              # Maquetación del libro, pliego y tipografías
│   │   └── story-animations.css       # Keyframes y timings de las 8 animaciones SVG
│   └── js/
│       ├── storybook.js               # Controlador del libro (orquestación y fallback)
│       └── components/
│           └── story-scenes.js        # Diccionario modular con el render SVG de cada capítulo
```

### 2.2. Parámetros del Lienzo Vectorial

| Parámetro | Valor Estándar | Razón Técnica |
| :--- | :--- | :--- |
| **ViewBox** | `0 0 200 200` | Espacio de coordenadas cuadrado escalable y homogéneo en el Espejo Mágico. |
| **Duración del Ciclo** | `10s` | Ritmo biológico de respiración y relajación (10 segundos por bucle continuo). |
| **Aceleración GPU** | `transform`, `opacity` | Únicas propiedades animadas para garantizar 60 FPS estables en Android/iOS. |
| **Prefijo de Clases** | `story-anim-*` | Homologado con la regla de inclusión de PurgeCSS en `scripts/build.js`. |
| **Prefijo de IDs** | `c{N}-*` (ej: `c1-grad-book`) | Evita colisiones de `<defs>`, `<linearGradient>` y `<radialGradient>` en el DOM global. |

### 2.3. Control de Pausa y Accesibilidad

Cuando el usuario activa el modo pausa o el sistema operativo solicita reducción de movimiento, una única regla CSS congela el estado visual de la escena de forma elegante:

```css
.page-stage.is-paused .story-scene-svg *,
@media (prefers-reduced-motion: reduce) {
  .story-scene-svg * {
    animation-play-state: paused !important;
  }
}
```

---

## 3. Catálogo Conceptual: Las 8 Escenas (1 por Capítulo)

Basado en la biblia de lore oficial (`docs/story-and-lore-guide.md`) y el contenido de `CHAPTERS` en `storybook.js`:

### Capítulo I: El Gran Grimorio y las Cuatro Razas
* **Identificador Escena:** `scene-grimoire`
* **Metáfora Visual:** El Gran Grimorio de Cristal en la cúspide del Templo Supremo abriéndose majestuosamente mientras emana los pilares de la sabiduría (letras y números) y los cuatro orbes elementales de las razas de ponis.
* **Paleta Canónica:** Dorado estelar (`#FFD166`), Violeta cósmico (`#7B2CBF`), Cuarzo rosa (`#FFC8DD`), Azul zafiro (`#1976D2`).
* **Cronograma de 10 Segundos:**
  * **0s – 2s (El Despertar):** El Gran Grimorio cerrado flota sobre un pedestal de luz suave; un halo dorado pulsa suavemente.
  * **2s – 5s (La Revelación):** Las cubiertas se abren; de sus páginas brotan runas rúnicas flotantes de letras (`A`, `B`, `✨`) y números (`1`, `2`, `+`).
  * **5s – 8s (Las Cuatro Razas):** Cuatro orbes de energía (Alicornio rosa, Pegaso celeste, Terrestre esmeralda y Unicornio lila) orbitan en espiral ascendente.
  * **8s – 10s (Convergencia Armónica):** Los cuatro orbes se alinean coronando el libro con una estrella prismática radiante, cerrando el ciclo armónicamente.

---

### Capítulo II: La Emperatriz Eclipse y el Sueño del Olvido
* **Identificador Escena:** `scene-eclipse`
* **Metáfora Visual:** La luna llena plateada siendo velada por la bruma púrpura del miedo, y el Gran Grimorio separando sus diez páginas sagradas como estrellas fugaces.
* **Paleta Canónica:** Púrpura noche profunda (`#201633`), Amatista sombra (`#5A189A`), Destello dorado pálido (`#FFEAA7`).
* **Cronograma de 10 Segundos:** Luna radiante que pulsa suavemente (0-3s), bruma violácea que la abraza creando un anillo de eclipse suave (3-7s), y fragmentos estelares que viajan hacia el horizonte (7-10s).

---

### Capítulo III: Valen, Princesa de las Estrellas
* **Identificador Escena:** `scene-valen`
* **Metáfora Visual:** El Prisma Real de cuarzo estelar en el pecho de la princesa alicornio, girando para refractar un rayo de sol que disipa dos sombras y duplica estrellas doradas.
* **Paleta Canónica:** Rosa chicle (`#FFAFCC`), Oro realeza (`#FFD166`), Blanco perla (`#FFFFFF`).
* **Cronograma de 10 Segundos:** Prisma en reposo resplandeciendo (0-3s), giro multidimensional refractando un arcoíris en cruz (3-6s), multiplicación de estrellas flotantes gemelas que ascienden (6-10s).

---

### Capítulo IV: Reni, Princesa de los Vientos
* **Identificador Escena:** `scene-reni`
* **Metáfora Visual:** El astrolabio de los vientos de Nimbus; ráfagas veloces de tempestad que, al recibir las plumas celestes de Reni, se suavizan en una suave brisa serena.
* **Paleta Canónica:** Azul cielo (`#A2D2FF`), Blanco nube (`#F8F9FA`), Turquesa suave (`#BEE1E6`).
* **Cronograma de 10 Segundos:** Torbellino veloz en espiral (0-3s), despliegue de alas celestes en el centro (3-5s), desaceleración rítmica hasta una suave oscilación pendular de calma (5-10s).

---

### Capítulo V: Zoe, Princesa de la Naturaleza
* **Identificador Escena:** `scene-zoe`
* **Metáfora Visual:** El Escudo de Raíces esmeralda brotando de la tierra fértil; un brote que florece y resiste el viento con paciencia inquebrantable.
* **Paleta Canónica:** Menta silvestre (`#B8F2E6`), Verde bosque (`#52B788`), Ocre tierra cálida (`#D8B4E2`).
* **Cronograma de 10 Segundos:** Brote verde pequeño en tierra (0-2s), enredadera de raíces que teje una cúpula protectora (2-6s), apertura de una flor dorada que rocía semillas luminosas (6-10s).

---

### Capítulo VI: Lía, Princesa de los Cristales
* **Identificador Escena:** `scene-lia`
* **Metáfora Visual:** El cuerno de unicornio canalizando energía telequinética violeta hacia un prisma flotante que resalta números y sílabas clave.
* **Paleta Canónica:** Lila místico (`#C77DFF`), Violeta profundo (`#3C096C`), Cian cristalino (`#E0AAFF`).
* **Cronograma de 10 Segundos:** Constelación en penumbra (0-3s), destello del cuerno encendiendo un haz concentrado (3-6s), iluminación de runas que bailan en perfecta armonía (6-10s).

---

### Capítulo VII: La Travesía de las Diez Lunas y los Tres Actos
* **Identificador Escena:** `scene-temples`
* **Metáfora Visual:** El planetario de Lumiria con la Luna Mayor en el centro y las diez lunas/templos orbitando en tres anillos concéntricos (Actos I, II y III).
* **Paleta Canónica:** Azul noche astral (`#1D3557`), Oro solar (`#F4A261`), Perla lunar (`#F1FAEE`).
* **Cronograma de 10 Segundos:** Danza elíptica de los 10 orbes lunares con estelas de luz, encendiéndose progresivamente de la 1 a la 10.

---

### Capítulo VIII: Los Portales Bifásicos y Tu Gran Misión
* **Identificador Escena:** `scene-portal`
* **Metáfora Visual:** El Portal Ancestral pulsando en sus dos tiempos de oro: Fase 1 (calma azul de escucha) y Fase 2 (energía dorada del despertar), coronado por la Quinta Estrella de la Armonía.
* **Paleta Canónica:** Azul zafiro sereno (`#457B9D`), Oro estelar de victoria (`#FFB703`), Blanco diamante (`#EDF2F4`).
* **Cronograma de 10 Segundos:** Pulso azul sereno en expansión (0-4s), transición con chispas de luz (4-6s), fulgor dorado expansivo con la quinta estrella brillando triunfal (6-10s).

---

## 4. Estructura de Código del Módulo `story-scenes.js`

Cada escena se registra mediante un contrato estandarizado:

```javascript
export const STORY_SCENES = {
  1: {
    id: 'scene-grimoire',
    name: 'El Gran Grimorio y las Cuatro Razas',
    render: () => `
      <svg class="story-scene-svg story-scene-c1" viewBox="0 0 200 200" aria-label="El Gran Grimorio de Cristal">
        <defs>
          <!-- Gradientes y filtros con prefijo c1- -->
        </defs>
        <!-- Grupos con clases story-anim-* -->
      </svg>
    `
  },
  // ... 2 al 8
};
```

Cualquier capítulo no implementado aún o en mantenimiento resolverá mediante fallback automático al símbolo SVG canónico `#${ch.symbolId}`, garantizando cero regresiones funcionales.
