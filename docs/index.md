# ValenQuest: Índice Maestro de Documentación Técnica

Bienvenido al repositorio central de documentación de **ValenQuest (KidsLearn-WASM)**. Aquí encontrarás las especificaciones arquitectónicas, guías de diseño pedagógico, estándares móviles y directrices de ingeniería que rigen el desarrollo de la plataforma.

---

## 🗺️ Mapa de Documentación

```text
docs/
├── index.md                               # Este documento (Directorio principal)
├── mobile-standards-spec.md               # Estándares Mobile-First, ergonomía táctil infantil y PWA
├── heroines-and-powers-spec.md            # Trío de heroínas, poderes de amistad y ropero mágico
├── modular-css-darkmode-speech-spec.md    # CSS modular, modo noche astral y síntesis de voz
├── valenquest-visual-spec.md              # Sistema visual de diseño, tokens, paleta y estética chibi
└── gitflow-workflow.md                    # Flujo de trabajo GitFlow, ramas y remotos duales
```

---

## 📚 Módulos y Especificaciones

### 1. 📱 [Estándares Mobile-First y Ergonomía Táctil Infantil](./mobile-standards-spec.md)
* **Alcance:** Optimización para smartphones y tabletas (iOS Safari / Android Chrome).
* **Temas Clave:**
  * Ergonomía táctil para niñas y niños de 5 a 9 años (zonas de impacto WCAG 2.2 AAA de 48-60px).
  * Soporte completo de **Safe Areas** (`viewport-fit=cover`, `env(safe-area-inset-*)`).
  * Unidades de viewport dinámicas (`100dvh` para evitar el bug de la barra de direcciones en Safari).
  * Eliminación del retraso de 300 ms (`touch-action: manipulation`) y prevención de "sticky hover".
  * Desbloqueo preventivo de Web Audio API y Web Speech API ante el primer gesto táctil.
  * Contención de overscroll y prevención de pull-to-refresh accidental.

---

### 2. 🌟 [Trío de Heroínas, Poderes de Amistad y Ropero Mágico](./heroines-and-powers-spec.md)
* **Alcance:** Gamificación afectiva, andamiaje pedagógico y sistema de recompensas.
* **Temas Clave:**
  * Lore de las guardianas de Lumiria: **Valen** 🦄 (Luz), **Mia** 🪽 (Viento) y **Zoe** 🌿 (Naturaleza).
  * Mecánicas de poderes: *Prisma Revelador* (descarte), *Brisa Temporal* (pausa), *Susurro Sabio* (pista fonética).
  * Retardo intencional de poderes (**Gating Cognitivo de 1.8s**).
  * Sistema de persistencia transaccional en `IndexedDB` (`valenquest_db` v2).
  * Ropero Mágico de cosméticos y previsualización multi-capa SVG en tiempo real.

---

### 3. 🎨 [Arquitectura CSS Modular, Modo Noche Astral y TTS](./modular-css-darkmode-speech-spec.md)
* **Alcance:** Estructura de estilos Zero-Framework y accesibilidad auditiva.
* **Temas Clave:**
  * Separación en cinco capas (`tokens.css`, `base.css`, `animations.css`, `components.css`, `theme-dark.css`).
  * Matriz de contrastes y paletas Día Pastel vs. Noche Astral.
  * Prevención de FOUC (Flash of Unstyled Content) con script síncrono ultra-rápido.
  * Síntesis de voz nativa (`SpeechSynthesis API`) con cadencia adaptada para lectura infantil.

---

### 4. 🦄 [Especificación de Diseño Visual y Estética Chibi](./valenquest-visual-spec.md)
* **Alcance:** Identidad de marca, tokens semánticos, iconografía SVG y tipografía.
* **Temas Clave:**
  * Filosofía de diseño inspirada en *My Little Pony*, *Gacha Life* y libros de cuentos infantiles.
  * Definición exhaustiva de tokens CSS (`--vq-pink-bubble`, `--vq-gold`, `--vq-mint`, `--vq-border`).
  * Anatomía de avatares vectoriales SVG con animaciones en keyframes a 60 FPS.
  * Tipografías amigables y legibles para dislexia (`Fredoka`, `Quicksand`).

---

### 5. 🔀 [Estrategia de Ramas GitFlow y Remotos](./gitflow-workflow.md)
* **Alcance:** Gestión de versiones, despliegue continuo y control de código.
* **Temas Clave:**
  * Estructura de ramas: `main` (producción Vercel) y `develop` (desarrollo activo).
  * Estrategia de remotos duales simultáneos:
    * `origin`: [GitHub Repository](https://github.com/erickaguilar/ValenQuest.git)
    * `gitlab`: [GitLab Repository](https://gitlab.com/erick.aguilar/ValenQuest.git)
    * `all`: Remote consolidado para empuje dual sincronizado (`git push all <rama>`).
  * Estándar de commits convencionales (`feat:`, `fix:`, `docs:`, `perf:`).

---

## 🚀 Arquitectura General del Proyecto

```text
ValenQuest/
├── src/                  # Motor de Lógica Educativa en Rust
│   ├── engine/           # Máquina de estados finitos adaptativa (FSM), PRNG y silabeo español
│   └── tests/            # Suite de pruebas unitarias e integración de Rust (cargo test)
├── www/                  # Frontend Web Local-First (Zero Dependencias Externas)
│   ├── assets/           # Sprites SVG vectoriales de heroínas e iconos de interfaz
│   ├── css/              # Suite modular de estilos y diseño adaptable
│   ├── js/               # Módulos Vanilla ES (Audio, Speech, Storage, Wardrobe, Companions, PWA)
│   ├── pkg/              # Binarios WebAssembly compilados con wasm-pack
│   ├── sw.js             # Service Worker para ejecución 100% offline
│   └── index.html        # Shell de la aplicación PWA
└── docs/                 # Índice y especificaciones técnicas del proyecto
```
