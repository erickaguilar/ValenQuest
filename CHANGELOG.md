# Registro de Cambios (Changelog) - ValenQuest 🦄✨

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [1.1.0] - 2026-09-14

### 🌟 Transición Cósmica de Actos & Continuación de Partida
- **Celebración y Animación de Conclusión de Actos (`#act-transition-modal`):**
  - Implementación de la pantalla de transición estelar al purificar el último guardián de cada acto (Acto I: Pegaso Melódico en el Nivel 3).
  - Efectos visuales de constelación: halo estelar con gradientes cósmicos, rayo de conexión animado (`beamPulse`) y tarjetas de guardianes elementales liberados (🫧 Poni Burbuja, 🦌 Hada Ciervo, 🪽 Pegaso Melódico) con flotación armónica (`cardFloat`).
  - Crónica del Gran Libro con cita lore canónica y narración automatizada con Web Speech API.
  - Botón de acción destacado "¡Continuar al Acto II: Caverna de Ámbar! 🦉 🚀" adaptado a interfaces táctiles y de escritorio.
- **Transición Automática del Motor WASM & Persistencia:**
  - Resolución del bloqueo al terminar el Acto I: invocación de `mathSession.force_tier(nextTier)` y generación inmediata de nuevos desafíos (`generate_next_challenge()`).
  - Actualización automática del perfil en IndexedDB (`currentTier` y `mathTier`), cambio fluido a la pestaña de matemáticas y actualización del indicador de templo.
  - Arquitectura extensible que soporta de forma idéntica las transiciones del Acto II (Nivel 7) y la victoria final de Lumiria en el Acto III (Nivel 10).

## [1.0.0] - 2026-09-13

### 🚀 Novedades Principales

#### 🧠 Núcleo Lógico en Rust + WebAssembly (`kidslearn-wasm`)
- **Algoritmo Adaptativo EMA:** Implementación de Media Móvil Exponencial ($M_k = 0.75 M_{k-1} + 0.25 P$) con ponderación dinámica por latencia de respuesta cognitiva.
- **Las Diez Lunas de Lumiria (10 Tiers Curriculares):**
  - **Acto I (Niveles 1-3):** Manantial de Rocío (sumas $\le 10$), Bosque Susurrante (hasta 20 sin acarreo), Vértice de Algodón (con acarreo).
  - **Acto II (Niveles 4-7):** Caverna de Ámbar (restas con desagrupación), Palacio Prisma (tablas del 2, 3, 5 y 10), Reloj de las Arenas (tablas compuestas y mitades/dobles), Mar de Coral Profundo (reparto exacto).
  - **Acto III (Niveles 8-10):** Muralla de Nácar (fracciones visuales), Cúspide de la Aurora (operaciones combinadas con paréntesis), Trono de las Estrellas (fluidez mental con límite temporal y reconstrucción final).
- **Generador PRNG Determinista:** Xorshift64* con fallback seguro contra semillas nulas para generación reproducible de desafíos.
- **Distractores Pedagógicos Verosímiles:** Algoritmo de alternativas numéricas plausibles que previene la adivinanza por descarte.
- **Motor de Fluidez Lectora y Silabeo RAE:**
  - Segmentación fonotáctica en español respetando diptongos, triptongos e hiatos forzados.
  - Presentación serial visual rápida (RSVP) con velocímetro WPM configurable.

#### 📖 El Gran Libro de Lumiria (Cuentacuentos Interactivo)
- **Nueva página de historia (`story.html`):** Experiencia de lectura de cuentos de hadas con modo libro de dos páginas y pergamino continuo responsive.
- **10 Capítulos Canónicos:** Crónicas ilustradas de cada templo y sus guardianes estelares.
- **Caja de Música Procedural:** Melodía infantil generada con Web Audio API en tiempo real sin dependencias de audio externas.
- **Controles de Lectura:** Ajuste de tamaño tipográfico, salto por capítulos y narración por voz con Web Speech API.

#### 👗 Ropero Mágico y Compañeras de la Armonía
- **Cuarteto de la Armonía:** Valen (Alicornio), Reni (Pegaso), Zoe (Poni Terrestre) y Lía (Unicornio), cada una con talentos mágicos y habilidades exclusivas.
- **Vestidor Interactivo:** Desbloqueo y equipamiento de tiaras, alas, auras y lazos mediante maestría y estrellas acumuladas.

#### 🎨 Interfaz de Usuario y Experiencia Móvil
- **Vista Previa de Respuesta en Vivo (`#math-answer-preview`):** Indicador dinámico en tiempo real del número seleccionado o ingresado en teclado numérico, con envoltura matemática responsive.
- **Footer Móvil Compacto:** Rediseño optimizado para pantallas pequeñas (~110px de altura), unificando accesos rápidos y eliminando duplicidades del header.
- **Iconografía Vectorial Pastel en Footer:** Sustitución de emojis de texto por símbolos SVG nativos del sistema de diseño (`#vq-icon-bolt`, `#vq-icon-lock`, `#vq-icon-reading`, `#vq-icon-arrow-up`).
- **Botón Heroico CTA Estelar & Limpieza de Bienvenida:** Eliminación del botón duplicado de historia en el diálogo de bienvenida, corrección de la jerarquía DOM y rediseño del botón principal "¡Comenzar Aventura en Equipo!" con degradado oro a rosa, resplandor pulsante, shimmer dinámico e iconografía dual (`#vq-icon-sparkles` y `#vq-icon-rocket`).
- **Sintetizador Procedural de Audio:** Efectos de pulsación háptica, acierto armónico, error constructivo, racha estelar y fanfarria triunfal sin archivos `.mp3` pesados.

#### 📦 PWA & Modo Offline Total
- **Service Worker (`valenquest-v1.0.0`):** Almacenamiento en caché estricto y seguro para juego 100% desconectado de internet.
- **Persistencia Local con IndexedDB:** Historial de partidas, progreso curricular y perfiles almacenados en el navegador del usuario sin telemetría externa.
- **Arquitectura Zero-Framework:** Vanilla JavaScript con módulos ES nativos y CSS moderno con tokens temáticos claros y oscuros.
