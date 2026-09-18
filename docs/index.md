# ValenQuest: Índice Maestro de Documentación Técnica y Narrativa

Bienvenido al repositorio central de documentación de **ValenQuest (KidsLearn-WASM)**. Este índice organiza las especificaciones narrativas, arquitectónicas, pedagógicas y de ingeniería del proyecto para consulta ágil de desarrolladores humanos y agentes de inteligencia artificial.

---

## 🗺️ Mapa General de Documentación

```text
docs/
├── index.md                               # Este documento (Directorio principal y guía rápida)
│
├── 📖 NARRATIVA, LORE Y GAME DESIGN
│   ├── story-and-lore-guide.md            # Biblia Oficial de Historia, Lore y Mundo de Lumiria
│   ├── game-modes-and-triad-flow-spec.md  # [NUEVO] Tríada de Modos de Juego (Aventura, Prisma, Pluma y Bonus)
│   ├── ten-moons-progression-spec.md      # Las Diez Lunas de Lumiria, 3 actos, matriz de 10 niveles y portales
│   ├── heroines-and-powers-spec.md        # Cuarteto de la Armonía, 4 razas canónicas, poderes y ropero
│   └── storybook-animations-spec.md       # [NUEVO] Estándar y catálogo de animaciones SVG del Gran Libro (10s loops)
│
├── ⚙️ ARQUITECTURA TÉCNICA Y MOTORES
│   ├── frontend-modular-architecture-spec.md # Arquitectura modular frontend, Web Components y Hub & Spoke
│   ├── modular-css-darkmode-speech-spec.md    # CSS modular en 5 capas, noche astral y síntesis de voz (TTS)
│   └── valenquest-visual-spec.md              # Sistema visual de diseño, tokens, paleta y estética chibi
│
├── 📱 ESTÁNDARES MÓVILES Y PWA
│   └── mobile-standards-spec.md               # Estándares Mobile-First, ergonomía táctil infantil y PWA offline
│
└── 🚀 GOBERNANZA, ROADMAP Y DESARROLLO
    ├── gitflow-workflow.md                    # Flujo de trabajo GitFlow, ramas y remotos duales (GitHub + GitLab)
    ├── versioning-policy-spec.md              # [NUEVO] Política y Homologación de Versionado en ValenQuest (SemVer y PWA)
    └── opportunities-and-roadmap-spec.md      # Oportunidades de madurez, CLT Sweller y hoja de ruta técnica
```

---

## 📖 Sección I: Narrativa, Lore y Diseño de Juego

### 1. 🌟 [Biblia Oficial de Historia, Lore y Mundo de Lumiria](./story-and-lore-guide.md)
* **Propósito:** Documento canónico definitivo de la mitología, personajes, antagonista y trama del juego.
* **Contenido Principal:**
  * **El Reino de Lumiria:** La Era Dorada del saber y el Gran Grimorio de Cristal.
  * **Las 4 Razas:** Alicornios (Liderazgo), Pegasos (Viento y Tiempo), Ponis Terrestres (Tierra y Lenguaje) y Unicornios (Cristal y Magia).
  * **El Cuarteto de la Armonía:** Fichas de personaje de Valen 👑, Reni 🪽, Zoe 🌿 y Lía 🦄.
  * **Orión, el Sabio Búho:** Gran Archivista de Lumiria, gafas de cristal estelar, rol pedagógico del error y voz narradora oficial (Web Speech API).
  * **La Emperatriz Eclipse:** Motivación trágica (el miedo a que la luz se apague), el *Velo de la Duda* y su purificación final.
  * **La Travesía de las Diez Lunas:** Los 3 Actos narrativos y los 10 Templos Lunares.
  * **El Gran Libro de las Princesas:** Resumen y sinopsis de los 8 capítulos canónicos.
  * **Glosario Mágico y Directrices Narrativas:** Pautas de redacción para mantener el tono positivo y pedagógico.

---

### 2. 🎮 [Especificación de Modos de Juego y Tríada de Aprendizaje](./game-modes-and-triad-flow-spec.md)
* **Propósito:** Separación en 3 flujos diferenciados con propósitos claros y fundamentación neuroeducativa.
* **Contenido Principal:**
  * **La Gran Aventura (Eje Principal / Campaña):** Flujo intercalado híbrido (*Interleaved Practice* de Rohrer & Taylor) que alterna retos de matemáticas y lectura a través de los 10 templos.
  * **El Prisma Numérico (Modo Práctica / Arcade Matemático):** Entrenamiento continuo de cálculo mental en 5 niveles de progresión (conteo, sumas/restas sin/con acarreo, tablas y combinadas).
  * **La Pluma de la Fluidez (Modo Práctica / Taller de Lectura):** Entrenamiento intensivo de conciencia fonológica y lenguaje en 5 niveles de fluidez (silabeo directo, trabadas, oraciones con Orión, RSVP y fábulas).
  * **Capítulos Bonus del Gran Libro:** Desbloqueo progresivo de los 8 capítulos canónicos como recompensas narrativas coleccionables.
  * **Persistencia Local en IndexedDB (`valenquest_db` v5):** Cada módulo almacena su estado como un objeto JSON independiente en el object store `game_modules` (`adventure`, `math_practice`, `reading_practice`).

---

### 3. 🌙 [La Leyenda de las Diez Lunas: Progresión Curricular y Portales](./ten-moons-progression-spec.md)
* **Propósito:** Especificación técnica del motor adaptativo de matemáticas (Rust WASM) integrado con la narrativa.
* **Contenido Principal:**
  * Estructura en 3 Actos: *El Despertar de los Elementos* (1-3), *Los Secretos de Cristal* (4-7) y *La Purificación del Eclipse* (8-10).
  * Matriz curricular dual: operaciones aritméticas progresivas y habilidades de comprensión lectora.
  * Los 10 Guardianes Astrales y sus 10 recompensas cosméticas registradas en IndexedDB.
  * Mecánica del Desafío de Portal al alcanzar el 100% de maestría adaptativa ($M_k \ge 0.95$ por EMA).

---

### 4. 🦄 [El Cuarteto de la Armonía: Razas, Poderes y Ropero](./heroines-and-powers-spec.md)
* **Propósito:** Sistema de gamificación afectiva, poderes cooperativos y economía de estrellas.
* **Contenido Principal:**
  * Poderes de amistad: *Prisma Real* (Valen), *Brisa Temporal* (Reni), *Escudo de Raíces* (Zoe) y *Foco de Cristal* (Lía).
  * Gating cognitivo intencional de 1.8 segundos antes de sugerir ayudas.
  * Persistencia en `IndexedDB` (`valenquest_db` v4) y catálogo de atuendos del Ropero Mágico.

---

### 5. ✨ [Animaciones Vectoriales SVG del Gran Libro de Lumiria](./storybook-animations-spec.md)
* **Propósito:** Estándar técnico y catálogo conceptual de las 8 escenas vectoriales del Espejo Mágico.
* **Contenido Principal:**
  * Bucles continuos de 10 segundos, cero frameworks y máxima aceleración por GPU (60 FPS).
  * Estándar de coordenadas `viewBox="0 0 200 200"` e IDs con scope `cN-*`.
  * Catálogo narrativo de los 8 capítulos canónicos (Grimorio, Eclipse, Valen, Reni, Zoe, Lía, Diez Lunas y Portales).
  * Sincronización con el botón de pausa global y accesibilidad `prefers-reduced-motion`.

---

## ⚙️ Sección II: Arquitectura Técnica y Frontend Modular

### 6. 🧩 [Arquitectura Modular Frontend y Navegación Hub & Spoke](./frontend-modular-architecture-spec.md)
* **Propósito:** Estructuración del código web, componentes y flujo de navegación.
* **Contenido Principal:**
  * Web Components nativos en Light DOM: `<vq-header>` y `<vq-footer>` con `display: contents`.
  * Organización modular de `www/js/`: `services/`, `data/`, `components/` y `views/`.
  * Desacoplamiento del Ropero Mágico a página dedicada (`wardrobe.html`) con gancho preparado para animaciones 3D con Three.js (`initThreeJsStage()`).
  * Navegación por Misiones (Hub & Spoke): Salón Principal como centro neurálgico y barras de misión con botón `← Volver al Viaje`.
  * Modal de Ajustes Mágicos (`#settings-modal`) encapsulado dentro de `<vq-header>`.

---

### 6. 🎨 [Arquitectura CSS Modular, Modo Noche Astral y TTS](./modular-css-darkmode-speech-spec.md)
* **Propósito:** Suite modular de estilos Zero-Framework, tema oscuro y síntesis de voz.
* **Contenido Principal:**
  * Separación en capas: `tokens.css`, `base.css`, `animations.css`, `components.css`, `theme-dark.css`, `wardrobe.css` y `storybook.css`.
  * Tokens semánticos de modo día pastel vs. noche astral.
  * Prevención de FOUC mediante script de cabecera síncrono.
  * Configuración del motor Web Speech API (TTS) adaptado para cadencia infantil en español.

---

### 7. 🖌️ [Especificación de Diseño Visual y Estética Chibi](./valenquest-visual-spec.md)
* **Propósito:** Identidad gráfica, tokens de diseño y biblioteca vectorial.
* **Contenido Principal:**
  * Filosofía estética neomórfica pastel / chibi inspirada en *My Little Pony* y *Gacha Life*.
  * Biblioteca SVG vectorial pura sin dependencias externas (`heroines.svg`, `icons.svg`).
  * Directrices tipográficas accesibles para educación primaria y dislexia.

---

## 📱 Sección III: Estándares Móviles y PWA

### 8. 📱 [Estándares Mobile-First y Ergonomía Táctil Infantil](./mobile-standards-spec.md)
* **Propósito:** Optimización para smartphones y tablets en entornos educativos y domésticos.
* **Contenido Principal:**
  * Zonas de impacto táctil WCAG 2.2 AAA (mínimo 48-60px para dedos infantiles).
  * Soporte de Safe Areas (`viewport-fit=cover`, `env(safe-area-inset-*)`).
  * Manejo de viewports dinámicos (`100dvh`) y prevención de pull-to-refresh accidental.
  * Desbloqueo preventivo de Web Audio y Speech ante el primer toque.
  * Configuración del Service Worker (`sw.js`) para jugabilidad 100% offline.

---

## 🚀 Sección IV: Gobernanza, Roadmap y Guía para Agentes

### 9. 🔀 [Estrategia de Ramas GitFlow y Remotos](./gitflow-workflow.md)
* **Propósito:** Control de versiones, ramas y sincronización de remotos.
* **Contenido Principal:**
  * Ramas maestras: `main` (despliegue en producción) y `develop` (integración continua).
  * Configuración del remote unificado `all` para empuje simultáneo a GitHub y GitLab (`git push all <rama>`).
  * Estándar de commits convencionales (`feat:`, `fix:`, `docs:`, `perf:`).

---

### 10. 🏷️ [Política y Homologación de Versionado](./versioning-policy-spec.md)
* **Propósito:** Garantizar que cada incremento de versión SemVer sea atómico y homologado en todo el repositorio.
* **Contenido Principal:**
  * Esquema SemVer 2.0.0 (MAJOR.MINOR.PATCH) adaptado a ValenQuest.
  * Mapa canónico de 8 archivos que contienen la versión (`package.json`, `Cargo.toml`, `sw.js`, `footer.js`, HTMLs).
  * Utilidad automatizada `npm run version:bump <nueva_version>`.
  * Protocolo de invalidación de caché PWA en el Service Worker mediante hash determinista SHA-256.
  * Checklist paso a paso para releases oficiales y etiquetado Git (`git tag`).

---

### 11. 🔮 [Oportunidades, Sugerencias y Hoja de Ruta de Evolución](./opportunities-and-roadmap-spec.md)
* **Propósito:** Visión de futuro, madurez tecnológica y mitigación de sobrecarga cognitiva.
* **Contenido Principal:**
  * Portales bifásicos basados en la Teoría de Carga Cognitiva de Sweller (CLT).
  * Panel familiar y docente con analíticas privadas locales en el dispositivo.
  * Plan de integración de modelos 3D y partículas en Three.js.

---

## 💡 Guía Rápida para Desarrolladores y Agentes de IA

Cuando trabajes en este repositorio, respeta rigurosamente las siguientes **reglas de oro arquitectónicas**:

1. **Zero External Frameworks & Zero External Runtime Dependencies:**
   * No añadas React, Vue, Angular, jQuery ni utilidades como lodash o tailwind.
   * La aplicación utiliza **Vanilla JS ES Modules**, CSS puro con Custom Properties y HTML5 semántico.
2. **Zero CORS & Local-First:**
   * Ningún asset gráfico o sonoro debe requerir CDN externo que falle sin internet. Todos los iconos y avatares son SVGs embebidos o sprites locales. Los sonidos se sintetizan mediante Web Audio API procedimentalmente.
3. **Cero Lógica Crítica en JS:**
   * La generación matemática adaptativa, la fórmula EMA, el PRNG determinista y el silabeo RAE residen en el binario WebAssembly compilado con Rust (`src/` -> `www/pkg/`).
   * JavaScript únicamente gestiona el DOM, orquesta eventos y reproduce audio/TTS.
4. **Respeto a los IDs del DOM:**
   * `app.js` interactúa con el DOM mediante IDs canónicos (ej. `#btn-toggle-theme`, `#btn-toggle-mute`, `#header-stars-badge`). Al refactorizar componentes, mantén siempre accesibles estos identificadores.
5. **Caché PWA:**
   * Al modificar o añadir archivos estáticos a `www/`, recuerda incrementar la constante `CACHE_NAME` en [`www/sw.js`](file:///data/data/com.termux/files/home/develop/ValenQuest/www/sw.js) para que los navegadores y dispositivos móviles actualicen su caché local.
