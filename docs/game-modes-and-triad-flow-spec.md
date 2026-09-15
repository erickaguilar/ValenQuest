# ValenQuest: Especificación de Modos de Juego y Arquitectura de Tríada

> **Documento:** Especificación Técnica y de Game Design — Tríada de Flujos de Aprendizaje  
> **Audiencia:** Desarrolladores, Agentes de IA, Diseñadores Pedagógicos  
> **Versión:** 1.0.0 (Edición Lumiria 2026)  
> **Estado:** Aprobado / En curso de implementación  

---

## 🎯 1. Filosofía de la Tríada de Lumiria

Para eliminar la ambigüedad entre los artefactos mágicos y el inicio del juego, ValenQuest estructura su experiencia en **tres flujos independientes pero complementarios**:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SALÓN PRINCIPAL (HUB DE LUMIRIA)                          │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
🚀 LA GRAN AVENTURA             💎 EL PRISMA NUMÉRICO           🪶 LA PLUMA DE LA FLUIDEZ
 (Modo Historia / Campaña)        (Modo Práctica / Arcade)        (Modo Taller de Lectura)
 • Eje principal del juego.       • Práctica matemática pura.     • Práctica lectora pura.
 • Flujo híbrido intercalado:     • 5 Niveles de dificultad.      • 5 Niveles de fluidez.
   (Matemáticas ⇄ Lectura)        • Ejercitación sin pausa.       • Fonética, silabeo y RSVP.
 • Progresión por Templos.        • Enfoque en cálculo ágil.      • Enfoque en decodificación.
 • Desbloquea Capítulos Bonus.    • Ideal para repaso escolar.    • Ideal para lectura nocturna.
```

### 1.1. Fundamentación Neuroeducativa: Práctica Intercalada (*Interleaved Practice*)
Basado en los estudios de Rohrer y Taylor (2007) y la Teoría de Carga Cognitiva de John Sweller (CLT):
* **Práctica Bloqueada (*Blocked*):** Repetir 30 ejercicios idénticos de suma agota rápidamente la atención de niños de 5 a 9 años.
* **Práctica Intercalada (*Interleaved*):** Alternar un cálculo matemático con una decodificación lingüística en **La Gran Aventura** estimula ambos hemisferios cerebrales, reactiva la memoria de trabajo y mejora la transferencia del aprendizaje a largo plazo hasta en un 43%.
* **Práctica Deliberada (*Deliberate Practice*):** Los modos independientes (**El Prisma** y **La Pluma**) permiten a padres, terapeutas y docentes aislar una debilidad específica (por ejemplo, automatizar las tablas de multiplicar o superar una dislalia en sílabas trabadas) sin la distracción de la narrativa.

---

## 🚀 2. Pilar 1: La Gran Aventura (Modo Campaña Principal)

### 2.1. Concepto y Rol en el Juego
Es el **eje central y troncal** de ValenQuest. El jugador encarna al **Cuarteto de la Armonía** guiado por el **Maestro Orión** en una travesía para recuperar las diez páginas del *Gran Grimorio de Cristal* y purificar el *Velo de la Duda* de la *Emperatriz Eclipse*.

### 2.2. Bucle de Juego Intercalado (Game Loop Híbrido)
En cada uno de los 10 Templos Lunares, el avance no es monótono ni puramente numérico; cada fase del templo intercala ambos dominios:

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 BUCLE DE LA GRAN AVENTURA                   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ 1. Reto Matemático Adaptativo  │ ➔ Suma, resta o tabla según Templo
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ 2. Reto Lingüístico / Lectura │ ➔ Silabeo, rima o comprensión
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ 3. Hito Narrativo de Orión    │ ➔ Diálogo pedagógico y feedback
                 └───────────────┬───────────────┘
                                 │ (Maestría acumulada ≥ 0.95)
                 ┌───────────────▼───────────────┐
                 │ 4. Desafío de Portal (Jefe)   │ ➔ Prueba bifásica con el Guardián
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ 5. ¡RECOMPENSA Y BONUS!       │
                 │  • Cosmético para el Ropero   │
                 │  • Capítulo en el Gran Libro  │
                 └───────────────────────────────┘
```

### 2.3. Sistema de Capítulos Bonus (El Gran Libro de las Princesas)
Los 8 capítulos canónicos ilustrados en [`www/story.html`](file:///data/data/com.termux/files/home/develop/ValenQuest/www/story.html) dejan de ser una lectura estática aislada y se convierten en **recompensas coleccionables**:
* **Capítulo 1:** Desbloqueado de inicio (Prólogo del Reino de Lumiria).
* **Capítulo 2 al 8:** Se desbloquean conforme el jugador purifica los templos en la Gran Aventura.
* Cada capítulo desbloqueado permite escuchar el relato en voz alta con la **Voz de Orión**, encender la **Cajita Musical Procedural** y explorar los efectos de espejo mágico en Canvas.

---

## 💎 3. Pilar 2: El Prisma Numérico (Modo Práctica / Arcade Matemático)

### 3.1. Concepto y Rol
Es el **gimnasio de cálculo mental continuo e infinito**. Diseñado para el entrenamiento puro de la fluidez aritmética sin pausas narrativas. Permite seleccionar libremente o progresar a través de **5 niveles de dominio**:

### 3.2. Matriz de los 5 Niveles de Cálculo

| Nivel | Nombre del Reto | Operaciones y Rango | Foco Cognitivo / Pedagógico |
| :---: | :--- | :--- | :--- |
| **1** | **Chispas Estelares** | Sumas directas $1 \dots 10$, conteo visual con talismanes. | Sentido numérico, conservación de cantidad y correspondencia 1 a 1. |
| **2** | **Senderos de Nubes** | Sumas y restas hasta $20$ sin transformación ($14 + 5$, $18 - 6$). | Fluidez aditiva básica, complementos al 10 y recta numérica mental. |
| **3** | **Enigmas de Cristal** | Sumas con acarreo ($17 + 8$) y restas con desagrupación ($32 - 15$) hasta $50$. | Descomposición posicional (unidades y decenas) y algoritmo de transformación. |
| **4** | **El Salón de los Reflejos** | Tablas de multiplicar fundamentales: $2$, $3$, $5$ y $10$. | Multiplicación como suma repetida, patrones rítmicos y matrices rectangulares. |
| **5** | **Vórtice Cósmico** | Tablas avanzadas ($4, 6, 7, 8, 9$), dobles, mitades y operaciones con paréntesis. | Automatización ágil, jerarquía operacional y flexibilidad de cálculo mental. |

### 3.3. Mecánicas Arcade
* **Racha Infinita de Estrellas:** Multiplicadores dinámicos ($1\times, 1.5\times, 2\times$) al mantener respuestas consecutivas sin error.
* **Soporte de Entrada Dual:** Opciones múltiples con distractores plausibles generados por Rust WASM o teclado numérico virtual táctil (Modo Teclado).

---

## 🪶 4. Pilar 3: La Pluma de la Fluidez (Modo Práctica / Taller de Lectura)

### 4.1. Concepto y Rol
Es el **taller intensivo de decodificación fonética y comprensión lingüística**. Diseñado para niños que están aprendiendo a leer o perfeccionando su entonación y velocidad. Estructurado en **5 niveles de maestría lectora**:

### 4.2. Matriz de los 5 Niveles de Fluidez Lectora

| Nivel | Nombre del Taller | Formato y Mecánica Lingüística | Foco Cognitivo / RAE |
| :---: | :--- | :--- | :--- |
| **1** | **Ecos de Rocío** | Palabras bisílabas directas (*ma-pa, lu-na, ro-sa, es-tre-lla*). | Conciencia silábica directa, segmentación fonémica y articulación clara. |
| **2** | **Vientos Cruzados** | Sílabas trabadas y grupos consonánticos inseparables (*bra, pla, tro, glu, cri*). | Superación de dislalias fonológicas y fluidez en combinaciones complejas. |
| **3** | **Pergaminos Cantarines** | Oraciones breves con apoyo auditivo del Maestro Orión (Web Speech API). | Entonación prosódica, signos de puntuación (. , ¡! ¿?) y pausas respiratorias. |
| **4** | **Vuelo Rápido RSVP** | Lectura visual palabra por palabra en taquistoscopio RSVP (100 a 250 WPM). | Eliminación de subvocalización innecesaria y ampliación del campo visual fijador. |
| **5** | **Fábulas del Grimorio** | Párrafos narrativos con adivinanzas y preguntas de inferencia y vocabulario. | Comprensión literal e inferencial, identificación de sinónimos y lección moral. |

---

## ⚙️ 5. Arquitectura de Software y Persistencia

### 5.1. Orquestación Frontend (`www/js/`)
El frontend administra la transición entre estos tres modos mediante módulos especializados:

```text
www/js/
├── app.js                         # Controlador principal y enrutador de vistas
├── services/
│   ├── adventure.js               # [NUEVO] Orquestador híbrido de La Gran Aventura
│   ├── math-practice.js           # [NUEVO] Gestor de los 5 niveles del Prisma Numérico
│   ├── reading-practice.js        # [NUEVO] Gestor de los 5 niveles de La Pluma
│   ├── companions.js              # Poderes del Cuarteto de la Armonía
│   ├── speech.js                  # Voz de Orión (TTS)
│   └── storage.js                 # Motor IndexedDB v4 (valenquest_db)
└── components/
    ├── header.js                  # <vq-header> (Ajustes, estrellas y heroína)
    └── footer.js                  # <vq-footer> (Navegación e info)
```

### 5.2. Esquema de Datos en IndexedDB (`valenquest_db`)
Se incorporan los siguientes estados dentro del almacén `profiles`:

```javascript
{
  id: "default_player",
  stars: 120,
  selectedCompanion: "valen",
  
  // 1. Estado de La Gran Aventura
  adventure: {
    currentTemple: 3,           // 1 al 10
    phase: "math",              // "math" | "reading" | "portal"
    consecutiveCorrect: 4,
    unlockedChapters: [1, 2, 3] // Capítulos bonus disponibles en story.html
  },

  // 2. Estado de Modo Práctica: Prisma Numérico
  mathPractice: {
    selectedLevel: 2,           // 1 al 5
    highestStreak: 15,
    totalAnswered: 84
  },

  // 3. Estado de Modo Práctica: Pluma de la Fluidez
  readingPractice: {
    selectedLevel: 1,           // 1 al 5
    highestWpm: 140,
    wordsRead: 320
  }
}
```

---

## 📋 6. Plan de Implementación por Fases

1. **Fase 1: Documentación e Integración en el Índice Maestro** *(Completada en este documento)*.
2. **Fase 2: Rediseño del Salón Principal (`www/index.html`):**
   * Configurar el botón heroico CTA **«¡Comenzar la Gran Aventura!»** como punto de entrada al flujo intercalado.
   * Añadir selectores de nivel (píldoras 1 al 5) en las tarjetas de **El Prisma Numérico** y **La Pluma de la Fluidez**.
3. **Fase 3: Orquestador Híbrido (`adventure.js`):**
   * Implementar la máquina de estados que alterna entre retos de matemáticas y lectura, acumulando progreso para el templo.
4. **Fase 4: Gamificación de Capítulos Bonus (`www/story.html`):**
   * Bloquear visualmente los capítulos 2 al 8 con candado estelar y mostrar aviso de desbloqueo al superar templos en la Gran Aventura.
5. **Fase 5: Validación y Versionado:**
   * Pruebas de compatibilidad offline (Service Worker cache bump `v1.6.0`).
