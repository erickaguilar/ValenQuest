# ValenQuest 🦄✨ (KidsLearn-WASM)

> Plataforma educativa web local-first (PWA) para educación primaria (matemáticas adaptativas y fluidez lectora), ambientada en el universo de **Lumiria** con estética pastel mágica (*My Little Pony* + *Gacha Club*). Impulsada por un núcleo en **Rust + WebAssembly** y una presentación ultra-ligera en **Vanilla JavaScript (ES Modules) + HTML5/CSS3**.
> 
> Acompaña a la heroína y princesa **Valen** (Alicornio) y a su equipo del Cuarteto de la Armonía, **Reni** (Pegaso), **Zoe** (Poni Terrestre) y **Lía** (Unicornio), usando sus **Poderes de Amistad** para restaurar las constelaciones de la Gran Biblioteca de Lumiria.

---

## 🏛️ Principios Arquitectónicos Estrictos (Guardrails)

1. **Zero Framework Frontend:** Sin dependencias externas de empaquetadores pesados ni frameworks reactivos (sin React, Vue, Angular o Tailwind). Interfaz construida con **Vanilla JS moderno (ES Modules)**, variables CSS nativas y HTML semántico con foco en accesibilidad infantil.
2. **Núcleo Lógico en Rust (WASM):** Todo el cómputo crítico reside exclusivamente en Rust compilado a WebAssembly (`wasm32-unknown-unknown` con `wasm-bindgen`):
   - Algoritmo adaptativo EMA (Exponential Moving Average).
   - Máquina de Estados Finitos (FSM) de 6 tiers curriculares.
   - Generador pseudoaleatorio determinista Xorshift64*.
   - Generación de distractores pedagógicamente verosímiles.
   - Algoritmo fonotáctico de silabeo en español y cálculo de WPM para fluidez lectora (RSVP).
3. **Desacoplamiento Estricto:** La UI en JavaScript actúa únicamente como un "terminal tonto": maneja el DOM, Web Audio API, animaciones y eventos. La interfaz **no** valida respuestas ni calcula cambios de nivel; simplemente despacha `(input, elapsed_ms)` al WASM y renderiza el estado devuelto.
4. **Offline-First & Local Persistence:** Persistencia sin servidor mediante `IndexedDB` nativo para perfiles de estudiantes, historial de sesiones y rachas continuas.

---

## 📐 Algoritmo Adaptativo (EMA) y Curricular Tiers

### 1. Fórmula de Maestría
El motor utiliza una Media Móvil Exponencial (EMA) para suavizar la curva de aprendizaje y reaccionar rápidamente a la destreza del niño:

$$M_k = 0.75 \cdot M_{k-1} + 0.25 \cdot P$$

Donde:
- $M_k \in [0.0, 1.0]$: Nivel de maestría actual (inicializado en 0.50).
- $P \in [0.0, 1.0]$: Desempeño ponderado por latencia cognitiva en el reto actual:
  - **Acierto rápido** ($\le 4000\text{ ms}$): $P = 1.0$ (agilidad y dominio).
  - **Acierto reflexivo** ($4000\text{ ms} < t \le 8000\text{ ms}$): $P = 0.85$.
  - **Acierto pausado** ($> 8000\text{ ms}$): $P = 0.70$.
  - **Fallo**: $P = 0.0$.

### 2. Progresión Curricular: Las Diez Lunas de Lumiria (10 Niveles & Templos)
La aventura se estructura en tres actos que abarcan la educación primaria y culminan en **Desafíos de Portal** al alcanzar el 100% de maestría ($M_k \ge 0.95$):
1. **Acto I (Niveles 1-3):**
   - **Nivel 1 - Manantial de Rocío:** Sumas directas ($a + b \le 10$) | Sílabas directas | *Poni Burbuja* 🫧 | Tiara de Rocío Astral
   - **Nivel 2 - Bosque Susurrante:** Operaciones hasta 20 sin acarreo | Sílabas trabadas | *Hada Ciervo* 🦌 | Lazo de Viento Celeste
   - **Nivel 3 - Vértice de Algodón:** Sumas con acarreo forzado | Sintaxis de oración | *Pegaso Melódico* 🪽 | Alas de Pluma Dulce
2. **Acto II (Niveles 4-7):**
   - **Nivel 4 - Caverna de Ámbar:** Restas con transformación (desagrupación) | Idea principal | *Búho de Piedra* 🦉 | Corona Floral Silvestre
   - **Nivel 5 - Palacio Prisma:** Tablas del 2, 3, 5 y 10 | Sinónimos en contexto | *León de Espejos* 🦁 | Cetro Estelar Radiante
   - **Nivel 6 - Reloj de las Arenas:** Tablas complejas y dobles/mitades | Secuencia temporal | *Esfinge de Cristal* ⏳ | Reloj de Bolsillo Astral
   - **Nivel 7 - Mar de Coral Profundo:** Reparto equitativo (división exacta) | Causa y efecto | *Sirena Dragón* 🧜‍♀️ | Aura de Burbujas Iridiscentes
3. **Acto III (Niveles 8-10):**
   - **Nivel 8 - Muralla de Nácar:** Fracciones visuales (medios, cuartos, octavos) | Hechos vs. Opiniones | *Gólem de Cuarzo* 🛡️ | Armadura de Pétalos de Seda
   - **Nivel 9 - Cúspide de la Aurora:** Operaciones combinadas con paréntesis | Inferencia moral | *Fénix Boreal* 🦅 | Alas Tornasol de Aurora
   - **Nivel 10 - Trono de las Estrellas:** Alta fluidez mental ($t \le 3500\text{ ms}$) | Reconstrucción del poema | *Emperatriz Eclipse Purificada* 👑✨ | Corona Suprema

*Criterio de Desafío de Portal:* $M_k \ge 0.95$ y racha consecutiva $\ge 3$ activa el Desafío de Portal (Micro-cuento + Acertijo Dual).  
*Criterio de Refuerzo:* $M_k < 0.38$ y 2 fallos consecutivos (retrocede un nivel para afianzar confianza).

---

## 📂 Estructura del Repositorio

```text
kidslearn-wasm/
├── Cargo.toml               # Dependencias Rust (wasm-bindgen, serde) y optimizaciones de tamaño
├── src/
│   ├── lib.rs               # Punto de entrada wasm-bindgen y re-exportaciones
│   ├── engine/
│   │   ├── mod.rs           # Módulo del motor
│   │   ├── math_fsm.rs      # FSM de 6 tiers curriculares y cálculo EMA
│   │   ├── prng.rs          # Generador Xorshift64* determinista
│   │   └── reading.rs       # Algoritmo de silabeo fonotáctico y RSVP
│   └── tests/
│       └── math_tests.rs    # Pruebas unitarias de integración en Rust
├── tests/
│   └── math_tests.rs        # Suite de pruebas de integración Cargo
├── www/
│   ├── index.html           # Shell accesible de la aplicación
│   ├── pkg/                 # Artefactos compilados por wasm-pack (WASM + JS glue)
│   ├── css/
│   │   ├── main.css         # Layout fluido, temas y variables nativas
│   │   └── components.css   # Tarjetas táctiles, teclado virtual y feedback
│   └── js/
│       ├── app.js           # Orquestador del ciclo de vida de la UI
│       ├── wasm-loader.js   # Carga y fallback de módulos WebAssembly
│       ├── storage.js       # Wrapper minimalista para IndexedDB
│       └── audio.js         # Sintetizador procedural con Web Audio API
├── scripts/
│   └── build.sh             # Script de compilación y verificación automática
└── README.md
```

---

## 🛠️ Compilación y Ejecución

### Prerrequisitos
- **Rust Toolchain:** `rustc` y `cargo` (1.80+) con el target `wasm32-unknown-unknown`.
- **wasm-pack:** Para empaquetar el módulo WebAssembly (`curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`).
- **Python 3:** Para servir los archivos estáticos en local.

### 1. Ejecutar Pruebas y Compilar WASM
```bash
./scripts/build.sh
```
O directamente mediante el comando de auto-validación:
```bash
cargo test && wasm-pack build --target web --out-dir www/pkg --release
```

### 2. Levantar el Servidor Local
Para cargar módulos ES y archivos `.wasm` sin restricciones CORS del navegador:
```bash
python3 -m http.server 8090 --directory www
```
Abre en tu navegador: [http://localhost:8090](http://localhost:8090).


---

## 🔊 Sintetizador de Audio Procedural (Web Audio API)
La plataforma no requiere archivos de audio externos `.mp3` ni `.wav`. Todos los efectos sonoros son generados en tiempo real mediante osciladores nativos del navegador:
- **Click háptico:** Pulso percusivo senoidal.
- **Acierto:** Arpegio ascendente mayor ($C_5 \to E_5 \to G_5 \to C_6$).
- **Fallo:** Doble tono descendente suave (pedagógicamente amigable, sin estridencias punitivas).
- **Subida de nivel:** Fanfarria armónica triunfante.
- **Racha:** Resonancia brillante por múltiplos de 5 aciertos.

---

## 📊 Persistencia Local-First (IndexedDB)
Toda la actividad del estudiante se conserva íntegramente en el navegador sin enviar telemetría a servidores externos:
- `profiles`: Datos del estudiante, avatar, tier actual y mejor racha.
- `math_sessions`: Registro histórico de precisión, latencia y maestría por nivel.
- `reading_sessions`: Conteo de palabras leídas y velocidad WPM alcanzada.
