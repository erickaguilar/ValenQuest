# Registro de Cambios (Changelog) - ValenQuest 🦄✨

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [Unreleased]

### 🌙 Papel temático en iconos (adiós "blancos sin líneas")
- **Causa:** la tinta se tematizó (`--vq-ink-line` clara en oscuro) pero los fondos blancos no: iconos mayormente blancos quedaban sin definición en modo oscuro.
- **Fix:** 35 rellenos papel (`#FDF7FF`, `#F5EEFA`) → `var(--vq-icon-paper)` (`#FDF7FF` día / `#4A3A68` noche); pupilas sobre esclerótica blanca fijas en `#4A3E56` (brillos intactos).
- **Verificado:** disc/keypad `#FDF7FF`→`#4A3A68` y pupilas fijas por estilo computado; barrido de píxeles 0 invisibles en ambos temas. Cubre v2.1.8 (cachés ya invalidadas).

### 🌙 Fixes modo oscuro + poderes
- **Foco de Lía:** `resetChallengeVisuals()` ahora retira `crystal-operand-glow` de los operandos; los números del reto siguiente ya no heredan el brillo.
- **Escudo de Zoe:** confirmado por diseño — queda armado hasta absorber un fallo (no caduca por tiempo ni por retos).
- **Iconos en oscuro:** auditados los 79 símbolos en ambos temas (todos pintan); si Vercel muestra tinta invisible es despliegue anterior al token `--vq-ink-line`: redesplegar `main` y recarga dura (SW + caché de sesión versionados).

### 📐 Arenas despejadas (mate + lectura)
- `math-practice-bar` partida como en lectura: arriba identidad y controles; maestría/combo/tiempo en nueva `math-progress-section` bajo el `main`. Sin cambios de ids.
- `reading-practice-bar` partida en dos: arriba quedan identidad y controles (título, racha, diamantes, chips); las barras de maestría/combo/tiempo bajan a una nueva sección bajo el `main`. El reto aparece primero en móvil sin cambiar ningún id (JS intacto).

### 👑 Cuarteto en igualdad (adiós a la monarquía)
- **Mismo rango:** las cuatro son Princesas (Estrellas, Vientos, Naturaleza, Cristales); eliminado `isLeader` del catálogo, el seed y la migración de IndexedDB (que ahora limpia el flag legacy).
- **Capítulos 2-2-2-2:** I→Zoe (cimientos), II→Lía (cristal vs sombra), VII→Reni (travesía); Valen conserva III (origen) y VIII (final). Títulos de origen actualizados.
- **Guías rotativas por acto** (`guideHeroineId` en `levels.json`): Reni I, Zoe II, Lía III —pill en el modal y narración con su voz—.
- **Narrativa:** diálogo de Valen en tono de consejo, `Princesa Valen` → `Valen`, docs y README en lenguaje de consejo (el nombre *ValenQuest* queda como marca, estilo Zelda).
- **Cap. III:** "líder del Cuarteto" → "primera voz del consejo sin corona mayor".

### 📖 Códice de Personajes (`personajes.html`)
- **Visor administrable del reparto:** 4 heroínas (arte, poder, voz, diálogo, recompensas y capítulos vinculados), 10 guardianes (templo, acto, micro-cuento, acertijo + respuesta, recompensa, capítulo que desbloquea) y 2 figuras del lore (Orión y Eclipse).
- **Mapa de relaciones** templo → guardián → acto → capítulo → recompensa (heroína), derivado en vivo de `levels.json` + capítulos + catálogo (filtros por sección, solo lectura: el contenido se edita en los JSON).
- Badge `Códice` en el header, enlace desde la campaña, a11y 100/100/100 y axe 0 violaciones.

### 🦄 Cero emojis funcionales + 9 guardianes SVG (v2.1.8)
- **Nuevo `assets/guardians.svg`:** Poni Burbuja, Hada Ciervo, Pegaso Melódico, Búho de Piedra, León de Espejos, Esfinge de Cristal, Sirena Dragón, Gólem de Cuarzo y Fénix Boreal en estilo chibi (el 10.º reutiliza la Eclipse existente). Loader, SW y `symbolId` por templo en `levels.json`.
- **Purga:** portal y cartas de acto renderizan símbolos; diálogo de reinicio, instalador, prototipo palacio, fallbacks y pills sin emoji; símbolos nuevos `warning`/`plus`; podados `play`/`arrow-up` muertos; `icon`/`emoji` muertos fuera de datos y servicios.
- **Quedan** (no funcionales): emojis en docs, comentarios y `console.*` de desarrollo.

### 🎨 Sistema SVG optimizado (v2.1.7)
- **Emblema:** `emblem-valen.png` (845 KB) eliminado; header/footer/index usan el símbolo `vq-emblem-valen` del sprite (0 bytes extra). Ahorro total de assets: ~1.2 MB.
- **Tinta temática:** 317 trazos `#4A3E56` → `var(--vq-ink-line)` (nuevo token: `#4A3E56` día / `#EDE7F7` noche); los chibi se definen en modo oscuro sin cambiar el día.
- **Icono roto:** `#vq-icon-portal` no existía y dejaba un hueco en el ropero → `vq-icon-galaxy`; podados `vq-icon-play` y `vq-icon-arrow-up` (cero referencias).
- **PNG PWA** 443→41 KB por cuantización verificada (RMSE ~1, alfa intacto); minificación SVG integrada en `scripts/build.js` (la fuente conserva comentarios).
- **Nota:** `svgo` CLI se evaluó y descartó (sus comentarios `--` rompen su parser); `currentColor` global se descartó (rompería el diseño de insignias pastel).
- **Caché:** bump a v2.1.7 (sprites + SW invalidados por protocolo).

### 🏛️ Arquitectura www/js/ (ArenaBase + campaña modular)
- **Nuevo `controllers/arena-base.js`:** poderes, cronómetro, insignias, billetera, chips, coronación, HUD y envío de respuestas centralizados; `math-page` 1342→473 y `reading-page` 1043→366 líneas (−65% duplicación).
- **Campaña dormida extraída** a `controllers/campaign-arena.js` (extiende la arena de mate; se activa por bootstrap cuando se reabra).
- **Higiene:** `db` como única API de storage (alias `storage` eliminado), diálogos de heroínas centralizados en `companions.getIntroDialogue`, import muerto `wasmLoader` fuera.
- **Bug latente corregido:** `e.currentTarget` leído tras `await` era `null` y rompía el shake de chips bloqueados (afectaba a ambas arenas desde antes del refactor).
- **Verificado en navegador headless:** 13 checks runtime (responder, diamantes, racha, teclado, poderes, Escape) sin errores de consola; axe 0 violaciones.

### ⚖️ Calibración EMA + regla de piedad
- **Diagnóstico (simulación exacta):** rápidos portan en 3-4, reflexivos en 7-9, pero pausados ($P=0.70$, asíntota $0.70<0.82$) **jamás**; 1 fallo ≈ 3 aciertos ($\alpha=0.25$ reactivo, correcto para sesiones cortas); regresión en 2-3 fallos.
- **Regla de piedad:** racha $\ge 8$ a cualquier velocidad arma el portal. Sin auto-avance (contrato vigente) y válida en N10. Test `test_mercy_rule_*` + spec y README actualizados.

### ♿ Accesibilidad infantil verificada (Lighthouse + axe + teclado)
- **Lighthouse a11y/BP/SEO 100/100/100** en las 5 páginas (index, math, reading, story, campaign), medido contra `www/` en servidor local.
- **Contraste WCAG AA:** rosa `#ffafcc` → `#c2255c` y ámbar `#f59e0b` → `#b45309` en insignias, combos, títulos y dedicatoria (con overrides de tema oscuro); badge de lectura `#059669` → `#047857`, story `#d97706` → `#92400e`, ropero `#db2777` → `#c2255c`.
- **Nombres accesibles:** `aria-label` en las 6 barras `progressbar`, CTAs con nombre que contiene el texto visible, ribbons `Capítulo N: título`, chips bloqueados con `aria-label`, tarjetas de heroínas por `aria-labelledby`.
- **Teclado:** skip-link + `h1` sr-only por página, foco global `:focus-visible`, `tabindex` positivos inexistentes, modales cierran con Escape (verificado por CDP).
- **Voz sin bloqueo futuro:** saludos automáticos con `deferUntilActivation` (suenan al primer gesto); Chrome ya depreca `speak()` sin activación.
- **Infra:** auditoría con axe-core + recorrido Tab por CDP y Lighthouse headless; scripts efímeros en `/tmp` (no versionados).

### 🧮 Más variedad en el generador matemático
- **Modos nuevos:** factor faltante en N5 ($t \times ? = p$), dividendo faltante en N7 ($? \div d = q$), fracciones con numerador $k \ge 2$ en N8 e identidad con cero en N1 ($0 + b$).
- **Rangos ampliados:** N2 sumas hasta 17, N3 decenas hasta 30, N4 hasta 50, N6 mitades/dobles hasta 20, N7 cocientes hasta 11, N8 factor hasta 7, N9/N10 operandos mayores.
- **Distractores recalibrados** para los modos nuevos (producto/cociente como trampa, densidades con numerador) con regla ±10 por magnitud (nuevo `ten_mode`); Lía explica incógnitas (`?`) con mensaje propio.
- **4 tests nuevos** de modos + matriz curricular actualizada en el spec.

### 🔒 Campaña oculta + módulos ajustados
- **Gran Aventura en pausa:** hub, `campaign.html`, `math.html` y `app.js` vuelven a estado "Próximamente"; `?campaign=1` se ignora con aviso. Todo el cableado (engine, portales, FSM) queda intacto y dormido tras el flag para la gran apertura.
- **Billetera única de diamantes:** `profile.diamonds` es el SSOT. Los contadores de mate/lectura/campaña pasan a sesión (no persisten) y todas las barras muestran el saldo real; recargas y premios ya operaban sobre la billetera.
- **Banco de lectura 130 → 180 retos** (+10 por nivel, curaduría Lumiria; 30/30/25/25/20 → 40/40/35/35/30). Guardianes y smoke actualizados; el QA RAE valida también las 10 segmentaciones nuevas.

### 📚 Contenido con fuente única (Rust vs JS)
- **Principio SSOT:** algoritmos en Rust, contenido editorial en `www/data/*.json`, nada de textos inline en servicios.
- **Fase A · Higiene:** `TEMPLE_NAMES` se deriva de `levels.json` (el const queda como respaldo offline); eliminado `recordAnswer` legacy sin uso; fallback JS de matemáticas alineado al Tier 2 real (sin acarreo); las 3 historias hardcodeadas de `reading.rs` eliminadas (duplicaban las fábulas JS) — `ReadingSession` queda como motor stateless (silabeo + WPM).
- **Fase B · Editorial a JSON:** 130 retos de lectura → `reading-challenges.json`, 8 capítulos → `story-chapters.json`; `reading-practice.js` 76→15 KB y `storybook.js` −30%, ambos con fetch + respaldo mínimo y precache en el SW.
- **Fase C · Lectura cableada al motor:** `reading-practice.init(wasm)` — WPM real vía `calculate_wpm`, `wordsRead` con conteo real y QA en carga que verifica las 30 segmentaciones curadas contra el silabeo RAE (solo avisa; el curado manda).
- **Guardianes en Rust:** `tests/content_tests.rs` (4 tests) fallan el build si un reto/capítulo/templo rompe el esquema o contradice al parser RAE. Smoke `scripts/smoke-content.mjs` (+ CI).

### ⚔️ Campaña cableada al FSM (JS ↔ Rust/WASM)
- **Nuevo `www/js/services/campaign-engine.js`:** terminal tonto de verdad — despacha `(respuesta, elapsed_ms)` a `MathSession.submit_answer`, lee `get_state_json()` y persiste el espejo en `adventure`. Sin validación ni cálculo de avance en JS.
- **Portal sin auto-avance (`src/engine/math_fsm.rs`):** `submit_answer` ahora solo arma `portal_ready` (+`tier_changed = 1`); el tier se mueve en `advance_tier()` tras vencer el portal, como dictaba la spec. También habilita el portal de victoria en el Nivel 10. Tests del contrato actualizados.
- **`math.html?campaign=1`:** modo campaña en la arena existente (retos, opciones/teclado, poderes, diamantes y combo reutilizados); la maestría y la racha mostradas son la EMA del motor; al armarse el portal se abre el Desafío del templo vigente y al vencerlo se avanza + transición de acto (3/7/10).
- **`campaign.html`:** roadmap con estado real (purificado/activo/por liberar) y botón "¡Jugar Templo N!"; hub e `index.html` actualizados (`?mode=campaign` → arena).
- **Smoke `scripts/smoke-campaign.mjs` (+ `npm run test:campaign` y paso en CI):** verifica init, armado de portal sin auto-avance, avance con cierre de acto, regresión sincronizada y victoria del templo 10.
- **Economía separada por diseño:** diamantes/combo siguen JS; el Escudo de Zoe absorbe el fallo sin manchar la sesión WASM.

### 🔍 Auditoría FSM-vs-docs y calibración de distractores
- **Distractores calibrados por tier (`src/engine/math_fsm.rs`):** el pool genérico (±10, ×2, ÷2 para todo) ofrecía descartes por absurdo en N1 (ej. `12` junto a sumas ≤ 10). Ahora cada tier tiene vecindad (±1/±2/±3), salto ±10 solo si la respuesta lo admite y topes de plausibilidad (N1 ≤ 12, N2 ≤ 22, N8 ≤ total de gemas).
- **Trampas pedagógicas por reto (`pedagogical_traps`):** tabla vecina en N5/N6 (3×4=12 → 9/15), dividendo en mitades, divisor en N7, densidades confundidas en N8, errores de precedencia/signo en N9/N10 (a×(b+c), (a+b)×c, a+3b vs 2a+b). Tienen prioridad sobre la vecindad genérica.
- **N6 recupera los dobles** ("Doble de N") que la matriz curricular documentaba pero el motor nunca generaba (solo mitades y tablas).
- **N10 aplica su banda de fluidez** ($t \le 3500\text{ ms}$ para $P=1.0$) que los docs prometían; el resto conserva $4000\text{ ms}$.
- **Docs corregidos:** umbral de portal $0.95$ → $0.82$ + racha ≥ 3 (el valor real del motor; con $0.95$ harían falta ~8 aciertos seguidos y contradecía la racha ≥ 3), rango de $P$ completo (incluye fallo $P=0.0$), regla de refuerzo documentada y "FSM de 6 tiers" → 10 en `README.md`.
- **Hallazgo (sin cambio, pendiente de decisión):** en producción el JS nunca llama a `submit_answer` — la capa `math-practice.js` valida respuestas y calcula su propia maestría (0-100, +2/+3) con 5 niveles arcade mapeados a los tiers WASM {1,2,3,5,6}; los tiers 4,7,8,9,10 y el FSM de portal solo se ejercitan en tests Rust. El guardrail "terminal tonto" del README no se cumple hoy.

### 🛠️ Homologación de versionado
- **Fuente única de verdad:** `package.json` (`"version": "2.1.6"`) es ahora el SSOT canónico.
- **Deriva corregida:** `VERSION`, badge de `README.md`, `get_engine_version()` en `src/lib.rs` y `APP_VERSION` en `www/js/app.js` estaban anclados en `1.1.0`; ahora están en `2.1.6` junto a `Cargo.toml`, `Cargo.lock`, `package-lock.json`, `www/sw.js`, `<vq-footer>` y `www/js/services/icons.js`.
- **Script ampliado (`scripts/bump-version.js`):** cubre 14 puntos canónicos y añade modo `--check` (`npm run version:check`) para CI.
- **`docs/versioning-policy-spec.md`:** mapa de archivos actualizado a la realidad (`campaign.html`/`story.html` heredan vía `<vq-footer>`, sin versión hardcodeada) y cabecera en `v2.1.6`.

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
