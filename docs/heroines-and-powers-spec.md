# ValenQuest: El Cuarteto de la Armonía, Las 4 Razas de Lumiria y Poderes de Amistad

Especificación técnica y narrativa del **Cuarteto de la Armonía** de **ValenQuest**, su implementación gráfica en SVG animado, el sistema de poderes de amistad cooperativos integrados al motor **Rust + WebAssembly**, y la sincronización con **IndexedDB v2**, **Web Speech TTS** y el **Ropero Mágico**.

---

## 1. Lore del Cuarteto de la Armonía y las 4 Razas de Lumiria

Al consolidar a **Valen** (Unicornio), **Reni** (Pegaso) y redefinir a **Zoe** como el ancla de la naturaleza (**Poni Terrestre**), el cuarteto se completa orgánicamente con la llegada de la **Alicornio Real: Lía** 👑.

```text
                  ┌─────────────────────────────────────┐
                  │      EL CUARTETO DE LA ARMONÍA      │
                  └──────────────────┬──────────────────┘
                                     │
      ┌───────────────┬──────────────┴──────────────┬───────────────┐
      ▼               ▼                             ▼               ▼
 🦄 VALEN           🪽 RENI                       🌿 ZOE          👑 LÍA
(Unicornio)        (Pegaso)                  (Poni Terrestre)   (Alicornio)
Magia & Prisma   Vuelo & Tiempo              Fuerza & Raíces    Realeza & Unión
```

### 1.1. Perfiles de Personaje y Razas Canónicas

| Heroína | Raza MLP | Rasgos Físicos & Visuales | Talento Especial | Poder de Amistad (Mecánica) |
| --- | --- | --- | --- | --- |
| **Valen** | **Unicornio** | Cuerno estelar luminoso, melena rosa (`--vq-pink-bubble`). | Telequinesis prismática y cálculo astral. | **Prisma Revelador:** Descarta 1 o 2 opciones falsas en pantalla mediante refracción de luz. |
| **Reni** | **Pegaso** | Alas emplumadas batiendo a 60 FPS, coletas cielo (`--vq-sky`). | Vuelo acrobático y dominio del clima. | **Brisa Temporal:** Detiene el cronómetro ($t \le 4000\text{ ms}$) garantizando el factor de maestría $P = 1.0$. |
| **Zoe** | **Poni Terrestre** | Sin alas ni cuerno; cascos firmes de roble, melena menta (`--vq-mint`) y corona floral. | Conexión con la tierra, perseverancia y raíces del lenguaje. | **Escudo de Raíces:** Protege la racha ante un error (no resetea a 0) y activa la explicación guiada por voz (TTS). |
| **Lía** | **Alicornio** | Alas grandes tornasoladas + cuerno dorado, melena violeta cósmico (`#7B2CBF`). | Realeza mágica y resonancia de la amistad. | **Destello Real (Doble Efecto):** Duplica las estrellas del reto ($2\times$) y recarga instantáneamente +1 carga al resto del equipo (`valen`, `reni`, `zoe`). |

### 1.2. Integración en la Narrativa de los 10 Niveles

En la historia de Lumiria, los cuatro templos cardinales solo pueden desbloquearse cuando las cuatro razas colaboran:

* **Ponis Terrestres (Zoe):** Sostienen los cimientos de los templos subterráneos (*Caverna de Ámbar*, *Muralla de Nácar*), donde la perseverancia y la paciencia son indispensables.
* **Pegasos (Reni):** Despejan tormentas y corrientes de aire en las alturas (*Vértice de Algodón*, *Cúspide de la Aurora*) para retos de agilidad mental.
* **Unicornios (Valen):** Canalizan la energía pura del Prisma para desintegrar candados numéricos complejos (*Palacio Prisma*, *Reloj de las Arenas*).
* **Alicornios (Lía):** Como princesa astral, Lía aparece como mentora en los templos culminantes y se une al equipo activo para enfrentar a la *Emperatriz Eclipse* en el Nivel 10.

---

## 2. Arquitectura Gráfica: Biblioteca SVG Animada (`www/assets/heroines.svg`)

En cumplimiento con el principio **Zero External Assets & Zero Dependencies**, todos los avatares se generan como vectores escalables puros en una hoja de sprites [`heroines.svg`](file:///home/erickaguilar/Documentos/ValenQuest/www/assets/heroines.svg) con `viewBox="0 0 100 100"`.

### 2.1. Técnicas de Animación Vectorial Integradas
1. **SMIL Nativo (`<animateTransform>` y `<animate>`):**
   * **Cuerno de Valen:** Modula su luminosidad y radio de destello estelar con un pulso sinusoidal continuo.
   * **Alas de Reni:** Baten con balanceo de $\pm 8^\circ$ mediante `<animateTransform type="rotate">` sobre un pivote orgánico.
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

#### 🪽 Poder de Reni: *Brisa Temporal*
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

#### 🌿 Poder de Zoe: *Escudo de Raíces*
* **Problema pedagógico que resuelve:** Miedo paralizante al error y frustración infantil al perder una racha ganada con esfuerzo.
* **Mecanismo:**
  1. Activa el escudo de perseverancia terrestre (`app.streakShieldActive = true`).
  2. Si el estudiante comete una equivocación en el siguiente intento, el escudo absorbe el error:
     * La racha matemática en Rust no se rompe ni regresa a cero.
     * La tarjeta activa emite la animación `.shield-protect` en color menta brillante.
     * El TTS de Zoe ofrece contención afectiva: *"¡El Escudo de Raíces de Zoe protegió tu racha! Inténtalo de nuevo."*
  3. De forma complementaria, analiza la operación y ofrece la guía pedagógica por voz (TTS) paso a paso:
     * **Suma ($+$):** *"Tienes 7, y le añades 5. Imagina contar hacia adelante desde 7."*
     * **Resta ($-$):** *"Comienzas con 14 y quitas 6. Cuenta hacia atrás para descubrir lo que queda."*
     * **Multiplicación ($\times$):** *"Multiplicar es sumar varias veces: son 4 grupos de 3."*

#### 👑 Poder de Lía: *Destello Real (Doble Efecto)*
* **Problema pedagógico que resuelve:** Agotamiento de recursos en retos exigentes y necesidad de impulso multiplicador para desbloquear cosméticos en el Ropero Mágico.
* **Mecanismo:**
  1. **Multiplicador Astral ($2\times$):** Asigna `app.starMultiplier = 2`, duplicando todas las estrellas base y bonos de racha obtenidos en el reto resuelto.
  2. **Resonancia de la Amistad (Recarga en Equipo):** Itera sobre las 3 amigas (`valen`, `reni`, `zoe`) y les otorga instantáneamente **+1 carga de poder** (hasta el tope de 3 cargas).
  3. **Feedback Visual:** Baña la tarjeta con un halo violeta cósmico y destello dorado (`.royal-boost`), acompañado de la fanfarria mágica y la locución: *"¡El Cuarteto de la Armonía une sus poderes! Doble estrella y energía mágica para todas."*

### 3.2. Sistema de Cargas y Racha de Amistad
* Cada heroína inicia con **2 cargas** de poder en `valenquest_db` (v2).
* **Recarga por Racha:** Por cada **3 aciertos consecutivos** validados por Rust (`currentStreak % 3 === 0`), todas las heroínas del cuarteto recuperan **+1 carga** (hasta un máximo de 3).
* Esto enseña a los niños la disciplina del esfuerzo constante: usar un poder para desbloquearse, pero esforzarse para recargarlo.

---

## 4. Arquitectura de Módulos JavaScript

El sistema se organiza en módulos ES6 desacoplados:

```text
www/js/
├── companions.js   # Definición de las 4 heroínas, gestión de cargas y ejecución de poderes
├── wardrobe.js     # Gestor del Ropero Mágico, catálogo de cosméticos y canje por estrellas
├── speech.js       # Configuración de prosodia infantil y síntesis Web Speech API
├── audio.js        # Sintetizador procedural Web Audio API (cero MP3s externos)
├── storage.js      # Persistencia transaccional IndexedDB (perfil, cosméticos, cargas)
├── wasm-loader.js  # Carga resiliente del binario compilado de Rust WebAssembly
└── app.js          # Orquestador del ciclo de vida del DOM y eventos de interacción
```

### 4.1. Módulo `companions.js`
Expone la instancia singleton `companions`, que emite eventos de cambio (`onChange`) para actualizar los contadores (`#badge-valen`, `#badge-reni`, `#badge-zoe`, `#badge-lia`) sin necesidad de acoplamiento rígido con el renderizador de retos.

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
Para asegurar 60 FPS estables en dispositivos móviles y tabletas económicas, los aleteos de alas de Reni y el resplandor de Valen se migraron de SMIL a clases CSS puras (`transform: rotate()`, `transform-origin`, `will-change: transform`). Esto delega el renderizado al compositor de la GPU sin bloquear el hilo principal de JavaScript ni WebAssembly.

---

## 7. Mapeo de Poderes de Amistad para el Módulo de Lectura (Siguiente Fase)

| Heroína | Raza MLP | Reto Matemático (Fase 1) | Reto de Fluidez Lectora (Fase 2) |
|---|---|---|---|
| **Valen** 🦄 | **Unicornio** | **Prisma Revelador:** Descarta 1-2 respuestas incorrectas. | **Luz Silábica:** Resalta la sílaba tónica o divide la palabra con guiones de colores de alta legibilidad. |
| **Reni** 🪽 | **Pegaso** | **Brisa Temporal:** Resetea el reloj para asegurar $P = 1.0$. | **Brisa Calma:** Reduce temporalmente la velocidad RSVP (Palabras por Minuto) para asimilar el texto sin agobio. |
| **Zoe** 🌿 | **Poni Terrestre** | **Escudo de Raíces:** Protege la racha ante error y explica paso a paso. | **Eco Amigo:** Lee en voz alta la oración completa con entonación natural antes de evaluar la comprensión lectora. |
| **Lía** 👑 | **Alicornio** | **Destello Real:** Duplica estrellas ($2\times$) y recarga +1 a sus amigas. | **Corona de Comprensión:** Destaca las palabras clave e ideas principales del cuento con halo dorado celestial. |

