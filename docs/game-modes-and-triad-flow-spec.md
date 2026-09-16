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

### 3.2. Matriz de los 5 Niveles de Cálculo (Homologada con Lectura)

| Nivel | Icono | Nombre del Reto | Subtítulo Pedagógico | Operaciones y Rango | Foco Cognitivo / Pedagógico |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | ✨ | **Chispas Estelares** | *Conteo y Sumas 1..10* | Sumas directas $1 \dots 10$, conteo visual con talismanes. | Sentido numérico, conservación de cantidad y correspondencia 1 a 1. |
| **2** | ☁️ | **Senderos de Nubes** | *Sumas y Restas hasta 20* | Sumas y restas hasta $20$ sin transformación ($14 + 5$, $18 - 6$). | Fluidez aditiva básica, complementos al 10 y recta numérica mental. |
| **3** | 💎 | **Enigmas de Cristal** | *Acarreo y Desagrupación* | Sumas con acarreo ($17 + 8$) y restas con desagrupación ($32 - 15$) hasta $50$. | Descomposición posicional (unidades y decenas) y algoritmo de transformación. |
| **4** | 🦁 | **El Salón de los Reflejos** | *Tablas 2, 3, 5 y 10* | Tablas de multiplicar fundamentales: $2$, $3$, $5$ y $10$. | Multiplicación como suma repetida, patrones rítmicos y matrices rectangulares. |
| **5** | 🌌 | **Vórtice Cósmico** | *Tablas Avanzadas y Desafíos* | Tablas avanzadas ($4, 6, 7, 8, 9$), dobles, mitades y operaciones con paréntesis. | Automatización ágil, jerarquía operacional y flexibilidad de cálculo mental. |

### 3.3. Mecánicas Arcade
* **Racha Infinita de Fuego:** Multiplicadores dinámicos al mantener respuestas consecutivas sin error.
* **Barra de Combo Astral (0% a 100%):** Cada acierto suma porcentaje de combo. Al llegar al 100%, se desata una ráfaga astral con recompensa de 10 Diamantes (💎) y reinicio instantáneo del ciclo sin congelar la interfaz.
* **Recompensas Exclusivas en Diamantes (💎):** Los módulos de práctica de cálculo y lectura otorgan Diamantes (💎) destinados al Ropero Mágico (`wardrobe.html`), preservando las Estrellas (⭐) exclusivamente para la progresión narrativa de la Campaña (`campaign.html`).
* **Soporte de Entrada Dual:** Opciones múltiples con distractores generados por Rust WASM o teclado numérico virtual táctil (Modo Teclado con botón unificado de envío).

---

## 🪶 4. Pilar 3: La Pluma de la Fluidez (Modo Práctica / Taller de Lectura)

### 4.1. Concepto y Rol
Es el **taller intensivo de decodificación fonética y comprensión lingüística**. Diseñado para niños que están aprendiendo a leer o perfeccionando su entonación y velocidad. Estructurado en **5 niveles de maestría lectora**:

### 4.2. Matriz de los 5 Niveles de Fluidez Lectora (Homologada con Matemáticas)

| Nivel | Icono | Nombre del Taller | Subtítulo Pedagógico | Formato y Mecánica Lingüística | Foco Cognitivo / RAE |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | 💧 | **Ecos de Rocío** | *Palabras Directas* | Palabras bisílabas directas (*ma-pa, lu-na, ro-sa, es-tre-lla*). | Conciencia silábica directa, segmentación fonémica y articulación clara. |
| **2** | 🍃 | **Vientos Cruzados** | *Sílabas Trabadas* | Sílabas trabadas y grupos consonánticos inseparables (*bra, pla, tro, glu, cri*). | Superación de dislalias fonológicas y fluidez en combinaciones complejas. |
| **3** | 📜 | **Pergaminos Cantarines** | *Oraciones con Orión* | Oraciones breves con apoyo auditivo del Maestro Orión (Web Speech API). | Entonación prosódica, signos de puntuación (. , ¡! ¿?) y pausas respiratorias. |
| **4** | ⚡ | **Vuelo Rápido RSVP** | *Velocímetro RSVP* | Lectura visual palabra por palabra en taquistoscopio RSVP (100 a 250 WPM). | Eliminación de subvocalización innecesaria y ampliación del campo visual fijador. |
| **5** | 📖 | **Fábulas del Grimorio** | *Comprensión Lectora* | Párrafos narrativos con adivinanzas y preguntas de inferencia y vocabulario. | Comprensión literal e inferencial, identificación de sinónimos y lección moral. |

---

## ⚙️ 5. Arquitectura de Software y Persistencia

### 5.1. Orquestación Frontend Desacoplada y Homologada (`www/`)
El frontend desacopla por completo los tres pilares de juego para evitar colisiones de estado, con arquitectura simétrica y diseño homologado:

```text
www/
├── index.html                     # Salón Principal (Hub de Lumiria)
├── campaign.html                  # [DESACOPLADO] La Gran Aventura (Campaña Troncal)
├── math.html                      # [DESACOPLADO] El Prisma Numérico (Arcade de Cálculo Mental)
├── reading.html                   # [DESACOPLADO] La Pluma de la Fluidez (Taller de Lectura)
├── story.html                     # El Gran Libro de las Princesas (Crónicas y Cuentos)
├── wardrobe.html                  # El Ropero Mágico y Boutique de Lumiria
├── css/
│   ├── campaign.css               # Estilos del modo campaña y roadmap de templos
│   ├── math.css                   # [DESACOPLADO] Estilos dedicados de El Prisma Numérico
│   ├── reading.css                # [DESACOPLADO] Estilos dedicados de La Pluma de la Fluidez
│   ├── wardrobe.css               # Probador y boutique
│   └── components.css             # Componentes transversales
├── js/
│   ├── app.js                     # Controlador principal del Hub
│   ├── campaign-page.js           # Controlador dedicado de la Campaña
│   ├── math-page.js               # [DESACOPLADO] Controlador dedicado de El Prisma Numérico
│   ├── reading-page.js            # [DESACOPLADO] Controlador dedicado de La Pluma de la Fluidez
│   ├── wardrobe-page.js           # Controlador de la Boutique
│   └── services/
│       ├── adventure.js           # Orquestador híbrido de La Gran Aventura
│       ├── math-practice.js       # Gestor arcade de los 5 niveles del Prisma Numérico
│       ├── reading-practice.js    # Gestor arcade de los 5 niveles de La Pluma de la Fluidez
│       ├── companions.js          # Poderes del Cuarteto de la Armonía
│       ├── speech.js              # Voz de Orión (TTS)
│       └── storage.js             # Motor IndexedDB v5 (valenquest_db)
```

### 5.2. Esquema de Persistencia en IndexedDB (`valenquest_db` v5)

Para garantizar aislamiento, reactividad y portabilidad de datos, cada módulo de la Tríada almacena su estado como un **objeto JSON independiente** dentro del object store dedicado `game_modules` (con `keyPath: 'moduleId'`), manteniendo sincronización con el motor de perfiles:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                    INDEXEDDB: valenquest_db (v5)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│  Object Store: game_modules [keyPath: 'moduleId']                           │
│                                                                              │
│  ├─ Key: "adventure"         ➔ Objeto JSON: Estado de La Gran Aventura       │
│  ├─ Key: "math_practice"     ➔ Objeto JSON: Estado de El Prisma Numérico     │
│  └─ Key: "reading_practice"  ➔ Objeto JSON: Estado de La Pluma de la Fluidez │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Documento JSON: La Gran Aventura (`moduleId: "adventure"`)
```json
{
  "moduleId": "adventure",
  "currentTemple": 1,
  "templeName": "Manantial de Rocío",
  "phase": "math",
  "consecutiveCorrect": 0,
  "templeProgress": 0,
  "unlockedChapters": [1],
  "updatedAt": "2026-09-15T22:25:00.000Z"
}
```
* **`currentTemple` (Number 1..10):** Número del templo sagrado activo.
* **`templeName` (String):** Nombre canónico del templo según la cosmología de Lumiria.
* **`phase` (String):** `"math"` (resolución de cálculo), `"reading"` (decodificación lectora) o `"portal"` (encuentro con el Guardián).
* **`consecutiveCorrect` (Number):** Racha actual dentro del templo.
* **`templeProgress` (Number 0..100):** Porcentaje de avance hacia la apertura del Desafío de Portal.
* **`unlockedChapters` (Array de Numbers):** Lista de IDs de capítulos canónicos desbloqueados en El Gran Libro de las Princesas (`story.html`).
* **`updatedAt` (ISO Timestamp):** Registro de última sincronización local.

#### 2. Documento JSON: El Prisma Numérico (`moduleId: "math_practice"`)
```json
{
  "moduleId": "math_practice",
  "selectedLevel": 1,
  "levelName": "Chispas Estelares",
  "streak": 5,
  "highestStreak": 14,
  "totalAnswered": 42,
  "combo": 45,
  "totalCombos": 2,
  "diamondsEarned": 35,
  "updatedAt": "2026-09-15T22:25:00.000Z"
}
```
* **`selectedLevel` (Number 1..5):** Nivel de dificultad actualmente seleccionado por el jugador.
* **`levelName` (String):** Título pedagógico del nivel.
* **`streak` (Number):** Racha ininterrumpida activa en la sesión.
* **`highestStreak` (Number):** Récord histórico personal de aciertos consecutivos sin error.
* **`totalAnswered` (Number):** Total acumulado de operaciones de cálculo resueltas.
* **`combo` (Number 0..100):** Carga actual de la barra de Combo Astral.
* **`totalCombos` (Number):** Cantidad de ráfagas de combo al 100% completadas.
* **`diamondsEarned` (Number):** Total de diamantes ganados para el Ropero Mágico.
* **`updatedAt` (ISO Timestamp):** Fecha/hora de última modificación.

#### 3. Documento JSON: La Pluma de la Fluidez (`moduleId: "reading_practice"`)
```json
{
  "moduleId": "reading_practice",
  "selectedLevel": 1,
  "levelName": "Ecos de Rocío",
  "streak": 4,
  "highestStreak": 12,
  "totalAnswered": 30,
  "combo": 60,
  "totalCombos": 1,
  "diamondsEarned": 28,
  "wordsRead": 280,
  "highestWpm": 135,
  "updatedAt": "2026-09-15T22:25:00.000Z"
}
```
* **`selectedLevel` (Number 1..5):** Nivel de fluidez lectora seleccionado (*Ecos de Rocío, Vientos Cruzados, Pergaminos Cantarines, Vuelo Rápido RSVP, Fábulas del Grimorio*).
* **`levelName` (String):** Nombre pedagógico del taller lingüístico.
* **`streak` (Number):** Racha de aciertos en ejercicios de lectura.
* **`highestStreak` (Number):** Récord histórico de racha lectora.
* **`totalAnswered` (Number):** Total acumulado de desafíos lectores respondidos.
* **`combo` (Number 0..100):** Carga de la barra de Combo Lírico.
* **`totalCombos` (Number):** Cantidad de combos líricos al 100% alcanzados (+10 diamantes por burst).
* **`diamondsEarned` (Number):** Total de diamantes ganados para el Ropero Mágico.
* **`wordsRead` (Number):** Contador acumulado de palabras decodificadas y leídas.
* **`highestWpm` (Number):** Récord personal de velocidad en el velocímetro RSVP (Palabras Por Minuto).
* **`updatedAt` (ISO Timestamp):** Registro cronológico de guardado.

#### 4. API de Almacenamiento en `storage.js`
La clase `StorageService` (`import { storage } from './services/storage.js'`) expone las siguientes interfaces reactivas con promesas:

* `async storage.getModuleState(moduleId)`: Recupera de forma asíncrona el documento JSON del módulo solicitado. Si el registro aún no existe, devuelve una copia íntegra de la plantilla predeterminada de `INITIAL_GAME_MODULES`.
* `async storage.saveModuleState(moduleId, stateObj)`: Guarda o actualiza transaccionalmente el objeto JSON en el store `game_modules`, inyectando automáticamente la marca de tiempo `updatedAt`.
* `async storage.getAllModuleStates()`: Retorna un array con los tres objetos JSON para paneles de progreso general, analíticas locales o exportación de datos familiares.

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
