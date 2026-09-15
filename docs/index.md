# ValenQuest: Índice Maestro de Documentación Técnica

Bienvenido al repositorio central de documentación de **ValenQuest (KidsLearn-WASM)**. Aquí encontrarás las especificaciones arquitectónicas, guías de diseño pedagógico, estándares móviles y directrices de ingeniería que rigen el desarrollo de la plataforma.

---

## 🗺️ Mapa de Documentación

```text
docs/
├── index.md                               # Este documento (Directorio principal)
├── ten-moons-progression-spec.md          # Las Diez Lunas de Lumiria, 3 actos, matriz de 10 niveles y portales
├── mobile-standards-spec.md               # Estándares Mobile-First, ergonomía táctil infantil y PWA
├── heroines-and-powers-spec.md            # Cuarteto de la Armonía, 4 razas canónicas, poderes y ropero
├── modular-css-darkmode-speech-spec.md    # CSS modular, modo noche astral y síntesis de voz
├── valenquest-visual-spec.md              # Sistema visual de diseño, tokens, paleta y estética chibi
├── gitflow-workflow.md                    # Flujo de trabajo GitFlow, ramas y remotos duales
└── opportunities-and-roadmap-spec.md      # Oportunidades, sugerencias y hoja de ruta de evolución técnica
```

---

## 📚 Módulos y Especificaciones

### 1. 🌙 [La Leyenda de las Diez Lunas de Lumiria: Progresión Curricular y Portales](./ten-moons-progression-spec.md)
* **Alcance:** Estructura narrativa en 3 actos, matriz curricular de 10 niveles y mecánica de fin de nivel (Desafíos de Portal).
* **Temas Clave:**
  * Narrativa de la Gran Crónica: El Rescate del Grimorio de Cristal contra la Emperatriz Eclipse.
  * Los 3 Actos: *El Despertar de los Elementos* (1-3), *Los Secretos de Cristal* (4-7) y *La Purificación del Eclipse* (8-10).
  * Matriz dual de 10 niveles: retos matemáticos procedurales (Rust WASM) + comprensión lectora (español).
  * Los 10 Guardianes Astrales y sus 10 desbloqueos coleccionables en el Ropero de IndexedDB.
  * Mecánica del Desafío de Portal al 100% de maestría: Micro-cuento con TTS interactivo, acertijo lógico-matemático integrado y purificación pastel con chispas doradas.

---

### 2. 📱 [Estándares Mobile-First y Ergonomía Táctil Infantil](./mobile-standards-spec.md)
* **Alcance:** Optimización para smartphones y tabletas (iOS Safari / Android Chrome).
* **Temas Clave:**
  * Ergonomía táctil para niñas y niños de 5 a 9 años (zonas de impacto WCAG 2.2 AAA de 48-60px).
  * Soporte completo de **Safe Areas** (`viewport-fit=cover`, `env(safe-area-inset-*)`).
  * Unidades de viewport dinámicas (`100dvh` para evitar el bug de la barra de direcciones en Safari).
  * Eliminación del retraso de 300 ms (`touch-action: manipulation`) y prevención de "sticky hover".
  * Desbloqueo preventivo de Web Audio API y Web Speech API ante el primer gesto táctil.
  * Contención de overscroll y prevención de pull-to-refresh accidental.

---

### 3. 🌟 [El Cuarteto de la Armonía: Las 4 Razas de Lumiria, Poderes y Ropero](./heroines-and-powers-spec.md)
* **Alcance:** Gamificación afectiva, 4 razas canónicas (MLP), andamiaje pedagógico y economía de estrellas.
* **Temas Clave:**
  * Las 4 razas de Lumiria: **Valen** 👑 (Alicornio Líder), **Reni** 🪽 (Pegaso), **Zoe** 🌿 (Poni Terrestre) y **Lía** 🦄 (Unicornio).
  * Mecánicas de amistad:
    * *Prisma Real* (Valen: descarte de 2 opciones + $2\times$ estrellas).
    * *Brisa Temporal* (Reni: pausa de latencia con $P = 1.0$).
    * *Escudo de Raíces* (Zoe: protección de racha ante error + guía TTS).
    * *Foco de Cristal* (Lía: resalta la pista clave del reto).
  * Retardo intencional de poderes (**Gating Cognitivo de 1.8s**).
  * Persistencia transaccional en `IndexedDB` (`valenquest_db` v4) con sembrado atómico y migración de razas.
  * Ropero Mágico con 4 heroínas y cosméticos exclusivos de Alicornio (`tiara-solsticio`, `cetro-cometa`, `alas-majestuosas`).

---

### 4. 🎨 [Arquitectura CSS Modular, Modo Noche Astral y TTS](./modular-css-darkmode-speech-spec.md)
* **Alcance:** Estructura de estilos Zero-Framework y accesibilidad auditiva.
* **Temas Clave:**
  * Separación en cinco capas (`tokens.css`, `base.css`, `animations.css`, `components.css`, `theme-dark.css`).
  * Matriz de contrastes y paletas Día Pastel vs. Noche Astral.
  * Prevención de FOUC (Flash of Unstyled Content) con script síncrono ultra-rápido.
  * Síntesis de voz nativa (`SpeechSynthesis API`) con cadencia adaptada para lectura infantil.

---

### 5. 🦄 [Especificación de Diseño Visual y Estética Chibi](./valenquest-visual-spec.md)
* **Alcance:** Identidad de marca, tokens semánticos, iconografía SVG y tipografía.
* **Temas Clave:**
  * Filosofía de diseño inspirada en *My Little Pony*, *Gacha Life* y libros de cuentos infantiles.
  * Definición exhaustiva de tokens CSS (`--vq-pink-bubble`, `--vq-gold`, `--vq-mint`, `--vq-border`).
  * Anatomía de avatares vectoriales SVG con animaciones en keyframes a 60 FPS.
  * Tipografías amigables y legibles para dislexia (`Fredoka`, `Quicksand`).

---

### 6. 🔀 [Estrategia de Ramas GitFlow y Remotos](./gitflow-workflow.md)
* **Alcance:** Gestión de versiones, despliegue continuo y control de código.
* **Temas Clave:**
  * Estructura de ramas: `main` (producción Vercel) y `develop` (desarrollo activo).
  * Estrategia de remotos duales simultáneos:
    * `origin`: [GitHub Repository](https://github.com/erickaguilar/ValenQuest.git)
    * `gitlab`: [GitLab Repository](https://gitlab.com/erick.aguilar/ValenQuest.git)
    * `all`: Remote consolidado para empuje dual sincronizado (`git push all <rama>`).
  * Estándar de commits convencionales (`feat:`, `fix:`, `docs:`, `perf:`).

---

### 7. 🚀 [Oportunidades, Sugerencias y Hoja de Ruta de Evolución](./opportunities-and-roadmap-spec.md)
* **Alcance:** Diagnóstico integral de madurez, mitigación de sobrecarga cognitiva, panel docente y resiliencia.
* **Temas Clave:**
  * Integración de portales bifásicos basados en la Teoría de Carga Cognitiva de Sweller (CLT).
  * Panel de acompañamiento familiar y docente local-first (cero telemetría externa).
  * Modo "Karaoke Visual Asistido" para resiliencia ante contingencias de `Web Speech API`.
  * Expansión del motor fonotáctico RAE en Rust con métricas de legibilidad y autoría de cuentos en JSON.
  * Matriz de priorización cuatrimestral por horizontes de implementación.

---

### 8. 🧩 [Arquitectura Modular Frontend y Desacoplamiento de Vistas](./frontend-modular-architecture-spec.md)
* **Alcance:** Esqueleto semántico de `index.html`, Web Components en Light DOM, organización de `www/js/` por dominios y desacoplamiento del Ropero Mágico a página dedicada preparada para Three.js.
* **Temas Clave:**
  * Componentes nativos `<vq-header>` y `<vq-footer>` con `display: contents`.
  * Reorganización modular en `services/`, `data/`, `components/` y `views/`.
  * Página dedicada `wardrobe.html` con pasarela responsiva y gancho para animaciones 3D.
  * Sincronización offline en `sw.js` (PWA).

---

## 🚀 Arquitectura General del Proyecto

```text
ValenQuest/
├── src/                  # Motor de Lógica Educativa en Rust
│   ├── engine/           # Máquina de estados finitos adaptativa (FSM), PRNG y silabeo español
│   └── tests/            # Suite de pruebas unitarias e integración de Rust (cargo test)
├── www/                  # Frontend Web Local-First (Zero Dependencias Externas)
│   ├── assets/           # Sprites SVG vectoriales de heroínas e iconos de interfaz
│   ├── css/              # Suite modular de estilos (tokens, base, animations, components, theme-dark, wardrobe, storybook)
│   ├── js/               # Módulos Vanilla ES estructurados por dominios
│   │   ├── app.js        # Orquestador del ciclo de vida de la UI
│   │   ├── storybook.js  # Controlador del Gran Libro
│   │   ├── wardrobe-page.js # Controlador de la Boutique y pasarela Three.js
│   │   ├── components/   # Web Components nativos (header.js, footer.js)
│   │   ├── views/        # Vistas pedagógicas modulares (en desarrollo)
│   │   ├── data/         # Progresión curricular y narrativa (levels-data.js)
│   │   └── services/     # Servicios del sistema (audio, speech, storage, companions, pwa, wasm-loader)
│   ├── pkg/              # Binarios WebAssembly compilados con wasm-pack
│   ├── sw.js             # Service Worker para ejecución 100% offline
│   ├── story.html        # El Gran Libro de las Princesas
│   ├── wardrobe.html     # Ropero Mágico y Pasarela (preparada para Three.js)
│   ├── palacio-prisma.html # Prototipo interactivo bifásico del Nivel 5 (Sweller CLT)
│   └── index.html        # Shell y esqueleto semántico de la aplicación
└── docs/                 # Índice y especificaciones técnicas del proyecto
```
