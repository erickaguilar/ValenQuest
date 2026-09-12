# ValenQuest: Trío de Heroínas, Poderes de Amistad y Animación Vectorial

Especificación técnica y narrativa del **Trío de Heroínas Astrales** de **ValenQuest**, su implementación gráfica en SVG animado, el sistema de poderes de amistad cooperativos integrados al motor **Rust + WebAssembly**, y la sincronización con **Web Speech TTS** y el **Modo Noche Astral**.

---

## 1. Lore del Trío de Heroínas de Lumiria

Para restaurar la luz estelar en los 6 reinos celestiales, la heroína principal **Valen** no viaja sola: cuenta con el apoyo incondicional de sus dos mejores amigas, **Mia** y **Zoe**. Juntas forman el **Círculo de la Armonía**, combinando la intuición numérica, la serenidad del tiempo y la sabiduría pedagógica.

```
       ┌───────────────────────────────┐
       │     CÍRCULO DE LA ARMONÍA     │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   🦄 VALEN       🪽 MIA        🌿 ZOE
  (Prisma/Luz)  (Viento/Tiempo) (Sabiduría/Flora)
```

### 1.1. Perfiles de Personaje

| Heroína | Arquetipo y Especie | Elemento y Color | Título Celestial | Poder de Amistad |
|---|---|---|---|---|
| **Valen** | Unicornio Astral Chibi 🦄 | Luz y Armonía (`--vq-pink-bubble`) | *Guardiana del Prisma Astral* | **Prisma Revelador**: Refracta la luz para descartar 1 o 2 distractores erróneos. |
| **Mia** | Pegaso Celestial 🪽 | Brisa y Tiempo (`--vq-sky`) | *Alquimista de los Vientos* | **Brisa Temporal**: Detiene el reloj de latencia para pensar con calma y asegurar maestría máxima ($P = 1.0$). |
| **Zoe** | Hada de las Estrellas 🌿 | Naturaleza y Palabras (`--vq-mint`) | *Guardiana de la Sabiduría* | **Susurro Sabio**: Explica el reto paso a paso mediante voz sintética pausada y visualiza pistas. |

---

## 2. Arquitectura Gráfica: Biblioteca SVG Animada (`www/assets/heroines.svg`)

En cumplimiento con el principio **Zero External Assets & Zero Dependencies**, todos los avatares se generan como vectores escalables puros en una hoja de sprites [`heroines.svg`](file:///home/erickaguilar/Documentos/ValenQuest/www/assets/heroines.svg) con `viewBox="0 0 100 100"`.

### 2.1. Técnicas de Animación Vectorial Integradas
1. **SMIL Nativo (`<animateTransform>` y `<animate>`):**
   * **Cuerno de Valen:** Modula su luminosidad y radio de destello estelar con un pulso sinusoidal continuo.
   * **Alas de Mia:** Baten con balanceo de $\pm 8^\circ$ mediante `<animateTransform type="rotate">` sobre un pivote orgánico.
   * **Corona floral de Zoe:** Destello cálido en sus gemas y balanceo sutil de hojas.
2. **CSS Keyframes Complementarios ([`animations.css`](file:///home/erickaguilar/Documentos/ValenQuest/www/css/animations.css)):**
   * `.vq-anim-bounce`: Rebote tierno chibi de respiración (60 FPS, acelerado por GPU).
   * `.vq-sparkle`: Centelleo estelar de los ojos anime y destellos de fondo.
   * `.vq-anim-speaking`: Pulso halo visual que reacciona sincrónicamente cuando el TTS está activo.

### 2.2. Reutilización en el DOM
En [`www/index.html`](file:///home/erickaguilar/Documentos/ValenQuest/www/index.html), los avatares se instancian instantáneamente con etiquetas `<use>`:
```html
<svg class="heroine-svg-avatar" viewBox="0 0 100 100">
  <use href="assets/heroines.svg#vq-heroine-valen"></use>
</svg>
```

---

## 3. Mecánica Lúdica y Pedagógica: Poderes de Amistad

Los poderes no son trampas que anulen el aprendizaje; son **andamios pedagógicos (scaffolding)** diseñados para mitigar la ansiedad matemática infantil y fomentar la metacognición.

### 3.1. Detalle Técnico de Cada Poder

#### 🦄 Poder de Valen: *Prisma Revelador*
* **Problema pedagógico que resuelve:** Sobrecarga cognitiva cuando un niño enfrenta 4 alternativas y se siente abrumado.
* **Mecanismo:**
  1. Consulta a Rust WASM el valor correcto mediante `mathSession.get_correct_answer()`.
  2. Localiza los botones del DOM en `#options-grid`.
  3. Deshabilita y tacha visualmente hasta 2 distractores incorrectos (`opacity: 0.3`, `text-decoration: line-through`).
  4. Si el estudiante estaba usando el teclado numérico (`keypad`), cambia dinámicamente a modo opciones para que la ayuda sea perceptible.
* **Efecto sonoro:** Arpegio ascendente de cristal + voz TTS: *"¡Mira el reflejo del prisma! He apartado una respuesta que no es."*

#### 🪽 Poder de Mia: *Brisa Temporal*
* **Problema pedagógico que resuelve:** Prisa excesiva o frustración por el reloj en niños que temen equivocarse.
* **Mecanismo e Integración con Rust EMA:**
  El motor en Rust [`src/engine/math_fsm.rs`](file:///home/erickaguilar/Documentos/ValenQuest/src/engine/math_fsm.rs) premia la agilidad mental asignando el valor de rendimiento $P$ según el tiempo de respuesta:
  $$P = \begin{cases} 1.0 & \text{si } t \le 4000\text{ ms} \\ 0.85 & \text{si } 4000 < t \le 8000\text{ ms} \\ 0.70 & \text{si } t > 8000\text{ ms} \end{cases}$$
  Al activar la **Brisa Temporal**, JavaScript reinicia el cronómetro del reto:
  ```javascript
  app.challengeStartTime = performance.now();
  ```
  Esto garantiza que cuando el alumno responda con calma, el tiempo transcurrido sea inferior a $4000\text{ ms}$, otorgando **$P = 1.0$** e impulsando al máximo la fórmula EMA:
  $$M_k = 0.75 \cdot M_{k-1} + 0.25 \cdot 1.0$$
* **Feedback visual:** Resplandor celeste celestial en la tarjeta del reto (`box-shadow: 0 0 25px var(--vq-sky)`).

#### 🌿 Poder de Zoe: *Susurro Sabio*
* **Problema pedagógico que resuelve:** Bloqueo conceptual o desconocimiento de la estrategia para resolver la operación.
* **Mecanismo:**
  1. Extrae los operandos y el operador del reto activo (`get_operand1()`, `get_operator()`, `get_operand2()`).
  2. Genera una explicación adaptada al nivel cognitivo de educación primaria:
     * **Suma ($+$):** *"Tienes 7, y le añades 5. Imagina contar hacia adelante desde 7."*
     * **Resta ($-$):** *"Comienzas con 14 y quitas 6. Cuenta hacia atrás para descubrir lo que queda."*
     * **Multiplicación ($\times$):** *"Multiplicar es sumar varias veces: son 4 grupos de 3."*
  3. Vocaliza la explicación con el sintetizador nativo **Web Speech API** a velocidad pausada (`rate: 0.88`, `pitch: 1.15`).
  4. Resalta el contorno del reto con color esmeralda menta (`var(--vq-mint)`).

### 3.2. Sistema de Cargas y Racha de Amistad
* Cada heroína inicia con **2 cargas** de poder.
* **Recarga por Racha:** Por cada **3 aciertos consecutivos** validados por Rust (`currentStreak % 3 === 0`), todas las heroínas recuperan **+1 carga** (hasta un máximo de 3).
* Esto enseña a los niños la disciplina del esfuerzo constante: usar un poder para desbloquearse, pero esforzarse para recargarlo.

---

## 4. Arquitectura de Módulos JavaScript

El sistema se organiza en módulos ES6 desacoplados:

```text
www/js/
├── companions.js   # Definición de heroínas, gestión de cargas y ejecución de poderes
├── speech.js       # Configuración de prosodia infantil y síntesis Web Speech API
├── audio.js        # Sintetizador procedural Web Audio API (cero MP3s externos)
├── storage.js      # Persistencia local-first en IndexedDB (perfil, racha, tier)
├── wasm-loader.js  # Carga resiliente del binario compilado de Rust WebAssembly
└── app.js          # Orquestador del ciclo de vida del DOM y eventos de interacción
```

### 4.1. Módulo `companions.js`
Expone la instancia singleton `companions`, que emite eventos de cambio (`onChange`) para actualizar los contadores (`#badge-valen`, `#badge-mia`, `#badge-zoe`) sin necesidad de acoplamiento rígido con el renderizador de retos.

---

## 5. Verificación de Modo Noche Astral (Dark Mode)

El botón `#btn-toggle-theme` conmuta dinámicamente entre **Día Pastel** y **Noche Astral**.

### 5.1. Solución de Especificidad
Para evitar que reglas de componentes sobreescriban los colores oscuros, los selectores de tema en [`tokens.css`](file:///home/erickaguilar/Documentos/ValenQuest/www/css/tokens.css) se definieron con especificidad reforzada:
```css
:root[data-theme="dark"],
html[data-theme="dark"],
body[data-theme="dark"],
[data-theme="dark"] {
  --vq-bg-canvas: #130E1F !important;
  --vq-bg-card: #201633 !important;
  --vq-bg-well: #1A122A !important;
  --vq-border: #8975A3 !important;
  --vq-text: #F8F5FC !important;
  --vq-text-muted: #D1C4E9 !important;
  /* ... */
}
```

### 5.2. Persistencia y Resiliencia
* El valor se almacena en `localStorage.getItem('vq-theme')`.
* Al iniciar la aplicación, se evalúa tanto el valor guardado como la consulta de medios `window.matchMedia('(prefers-color-scheme: dark)')`.
* Un script síncrono en el `<head>` de `index.html` previene cualquier parpadeo (FOUC) antes de pintar la interfaz.

---

## 6. Blindaje de UX y Compatibilidad Móvil

### 6.1. Retardo Intencional de Poderes (Gating Cognitivo)
* **Objetivo:** Evitar el reflejo de evitación automática en el estudiante ante números grandes.
* **Comportamiento:** Durante los primeros **1.8 segundos** de cada reto, la barra `.companion-powers-bar` entra en estado `.powers-gated`, los botones se inhabilitan (`disabled`, `pointer-events: none`) y la etiqueta muestra `⏳ Observa...`. Transcurrido ese lapso, los botones habilitados se desbloquean suavemente.

### 6.2. Warm-Up y Fallback de Web Speech API en Móviles
* **Desbloqueo de Pipeline:** En el primer toque o gesto del usuario (`pointerdown`, `touchstart`, `click`), el motor ejecuta una emisión silenciosa (`volume = 0`) y reanuda el sintetizador si el navegador lo puso en pausa.
* **Selección Fonética Ponderada:** Se evalúan las voces de `getVoices()` asignando puntuaciones prioritarias a variantes en español (`es-MX`, `es-419`, `es-ES`, `es-US`) y descriptores naturales (`Natural`, `Neural`, `Google`, `Paulina`, `Helena`).
* **Protección Anti-Garbage Collector:** Se almacena la referencia activa de la instancia `SpeechSynthesisUtterance` para prevenir que WebKit en iOS corte el habla en medio de una frase.

### 6.3. Rendimiento Vectorial: Animaciones GPU puras con CSS
Para asegurar 60 FPS estables en dispositivos móviles y tabletas económicas, los aleteos de alas de Mia, Zoe y el resplandor de Valen se migraron de SMIL a clases CSS puras (`transform: rotate()`, `transform-origin`, `will-change: transform`). Esto delega el renderizado al compositor de la GPU sin bloquear el hilo principal de JavaScript ni WebAssembly.

---

## 7. Mapeo de Poderes de Amistad para el Módulo de Lectura (Siguiente Fase)

| Heroína | Reto Matemático (Fase 1) | Reto de Fluidez Lectora (Fase 2) |
|---|---|---|
| **Valen** 🦄 | **Prisma Revelador:** Descarta 1-2 respuestas incorrectas. | **Luz Silábica:** Resalta la sílaba tónica o divide la palabra con guiones de colores de alta legibilidad. |
| **Mia** 🪽 | **Brisa Temporal:** Resetea el reloj para asegurar $P = 1.0$. | **Brisa Calma:** Reduce temporalmente la velocidad RSVP (Palabras por Minuto) para asimilar el texto sin agobio. |
| **Zoe** 🌿 | **Susurro Sabio:** Explica el cálculo paso a paso por voz. | **Eco Amigo:** Lee en voz alta la oración completa con entonación natural antes de evaluar la comprensión lectora. |

