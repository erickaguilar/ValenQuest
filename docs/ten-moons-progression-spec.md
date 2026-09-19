# ValenQuest: La Leyenda de las Diez Lunas de Lumiria
## Especificación de Progresión Curricular, Narrativa y Desafíos de Portal

> **Documento:** Especificación Técnica y Pedagógica de Progresión  
> **Versión:** 1.0.0  
> **Estado:** Activo / Canónico  
> **Arquitectura:** Rust WASM (Motor de Dificultad Adaptativa) + IndexedDB v4 + Web Speech API (TTS)

---

## 1. La Gran Crónica: El Rescate del Grimorio de Cristal

En los tiempos fundacionales del Reino de Lumiria, la armonía descansaba sobre las páginas sagradas del **Gran Grimorio de Cristal**, custodiado en el Templo Supremo por las cuatro razas de ponis. La *Emperatriz Eclipse*, cegada por el temor a que la luz se extinguiera, lanzó el *Sueño del Olvido*, un hechizo de sombra que fragmentó el Grimorio en diez páginas sagradas y sumió a los guardianes ancestrales en un letargo corrupto.

Para restaurar Lumiria, el **Cuarteto de la Armonía** emprende la travesía de las Diez Lunas a través de diez templos astrales:
- 👑 **Valen (Alicornio, Princesa de las Estrellas):** Primera voz del consejo; refracta las cifras con su *Prisma Real*, desvelando el orden matemático oculto.
- 🪽 **Reni (Pegaso de los Vientos):** Despeja las tormentas con su *Brisa Temporal*, permitiendo serenidad y concentración sin prisa.
- 🌿 **Zoe (Poni Terrestre):** Ancla de la naturaleza, traduce los glifos antiguos con su *Escudo de Raíces*, protegiendo la constancia y guiando con voz sabia.
- 🦄 **Lía (Unicornio de Cristal):** Canalizadora de la resonancia mística, enfoca la energía con su *Foco de Cristal*, iluminando las pistas clave y reagrupaciones.

---

## 2. Estructura Narrativa en Tres Actos

```
                          ┌──────────────────────────────────────────────┐
                          │   LA LEYENDA DE LAS DIEZ LUNAS DE LUMIRIA    │
                          └──────────────────────┬───────────────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          ▼                                      ▼                                      ▼
   ┌──────────────┐                       ┌──────────────┐                       ┌──────────────┐
   │   ACTO I     │                       │   ACTO II    │                       │   ACTO III   │
   │ El Despertar │                       │  Los Secretos│                       │  La Gran     │
   │ de Elementos │                       │  de Cristal  │                       │  Purificación│
   │ (Niveles 1-3)│                       │ (Niveles 4-7)│                       │(Niveles 8-10)│
   └──────────────┘                       └──────────────┘                       └──────────────┘
```

### Acto I: El Despertar de los Elementos (Niveles 1 al 3)
* **Temática:** Reconexión con el flujo vital del agua, el aire y la tierra.
* **Nivel 1:** *Manantial de Rocío* — Despertar del Poni Burbuja y purificación de las aguas cantarinas.
* **Nivel 2:** *Bosque Susurrante* — Rescate del Hada Ciervo y restitución de las brisas suaves.
* **Nivel 3:** *Vértice de Algodón* — Liberación del Pegaso Melódico entre las nubes de azúcar.

### Acto II: Los Secretos Olvidados de Cristal (Niveles 4 al 7)
* **Temática:** Profundización en los templos interiores, descifrado de mecanismos y leyes matemáticas.
* **Nivel 4:** *Caverna de Ámbar* — Despertar del Búho de Piedra y desagrupación de gemas fósiles.
* **Nivel 5:** *Palacio Prisma* — Desafío del León de Espejos y multiplicación de los reflejos de luz.
* **Nivel 6:** *Reloj de las Arenas* — Diálogo con la Esfinge de Cristal y dominio de las secuencias temporales.
* **Nivel 7:** *Mar de Coral Profundo* — Alianza con la Sirena Dragón y comprensión del reparto equitativo.

### Acto III: La Purificación del Eclipse (Niveles 8 al 10)
* **Temática:** Restauración final de la armonía, superación de pruebas complejas y redención.
* **Nivel 8:** *Muralla de Nácar* — Despertar del Gólem de Cuarzo y reconstrucción de gemas en fracciones.
* **Nivel 9:** *Cúspide de la Aurora* — Vuelo con el Fénix Boreal y equilibrio de operaciones con paréntesis.
* **Nivel 10:** *Trono de las Estrellas* — Encuentro final con la Emperatriz Eclipse; liberación de su forma sombría para restaurarla como Soberana Astral de Lumiria.

---

## 3. Matriz Curricular de los 10 Niveles

| Nivel & Templo | Acto | Eje Matemático (Rust WASM) | Eje Comprensión Lectora | Guardián Astral | Recompensa Cosmética (IndexedDB) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **1. Manantial de Rocío** | I | Sumas simples directas ($a + b \le 10$) sin acarreo, incluyendo identidad con cero ($0 + b$). | Sílabas directas (ma, pa, so) y palabras bisílabas. | 🫧 *Poni Burbuja* | **Tiara de Rocío Astral** (Cabello Valen) |
| **2. Bosque Susurrante** | I | Suma y resta hasta 20 sin acarreos ni transformaciones. | Sílabas trabadas (*tr*, *bl*, *pl*) y rimas consonantes. | 🦌 *Hada Ciervo* | **Lazo de Viento Celeste** (Accesorio Reni) |
| **3. Vértice de Algodón** | I | Suma de dos cifras con acarreo forzado en unidades ($17+8, 24+9$). | Estructura de oración: sintaxis Sujeto + Verbo + Predicado. | 🪽 *Pegaso Melódico* | **Alas de Pluma Dulce** (Alas Reni) |
| **4. Caverna de Ámbar** | II | Resta con transformación (desagrupar decenas, ej. $23-7, 31-5$). | Identificar la idea principal en textos breves de 3 renglones. | 🦉 *Búho de Piedra* | **Corona Floral Silvestre** (Cabello Zoe) |
| **5. Palacio Prisma** | II | Tablas de multiplicar introductorias: 2, 3, 5 y 10, con modo de factor faltante ($t \times ? = p$). | Deducción por contexto: sinónimos y vocabulario en fábulas. | 🦁 *León de Espejos* | **Cetro Estelar Radiante** (Amuleto Mano Lía) |
| **6. Reloj de las Arenas** | II | Tablas complejas (4, 6, 7, 8, 9) y cálculo de dobles/mitades. | Secuencia temporal: conectores (*primero*, *luego*, *al final*). | ⏳ *Esfinge de Cristal* | **Reloj de Bolsillo Astral** (Broche Pecho) |
| **7. Mar de Coral Profundo** | II | Reparto equitativo (división exacta) y problemas verbales simples, con modo de dividendo faltante ($? \div d = q$). | Causa y efecto: responder preguntas *"¿Por qué el personaje hizo X?"*. | 🧜‍♀️ *Sirena Dragón* | **Aura de Burbujas Iridiscentes** (Efecto Partículas) |
| **8. Muralla de Nácar** | III | Fracciones visuales en gemas (medios $1/2$, cuartos $1/4$, octavos $1/8$) con numerador 1 o $k$ ($k/\text{den}$ de $N$). | Distinguir entre afirmaciones de hechos y emociones/opiniones. | 🛡️ *Gólem de Cuarzo* | **Armadura de Pétalos de Seda** (Atuendo Completo) |
| **9. Cúspide de la Aurora** | III | Operaciones combinadas de 2 pasos con balance de paréntesis: $(a \times b) + c$. | Inferencia de lección moral implícita en la narrativa. | 🦅 *Fénix Boreal* | **Alas Tornasol de Aurora** (Alas Multicolor) |
| **10. Trono de las Estrellas** | III | Acertijos numéricos de alta fluidez mental ($t \le 3500\text{ ms}$). | Reconstrucción del poema canónico completo con coherencia global. | 👑 *Emperatriz Eclipse (Purificada)* | **Corona Suprema de Soberana Astral** + Fondo Mítico |

---

## 4. Mecánica del Fin de Nivel: Encuentros de Amistad y Desafío de Portal

### 4.1. Condición de Activación
En el motor matemático de Rust WASM, la maestría se calcula continuamente mediante la Media Móvil Exponencial (EMA):
$$M_k = 0.75 \times M_{k-1} + 0.25 \times P$$
Donde el desempeño $P$ pondera exactitud y latencia cognitiva:
- **Acierto rápido** ($\le 4000\text{ ms}$, $\le 3500\text{ ms}$ en el Nivel 10): $P = 1.0$.
- **Acierto reflexivo** ($\le 8000\text{ ms}$): $P = 0.85$.
- **Acierto pausado** ($> 8000\text{ ms}$): $P = 0.70$.
- **Fallo**: $P = 0.0$.

Al alcanzar **maestría suficiente** ($M_k \ge 0.82$ con racha consecutiva $\ge 3$), el motor adaptativo activa el estado `PortalReady` (sin bloquear la práctica: la interfaz decide cuándo presentar el modal). La interfaz despliega entonces el modal inmersivo del **Desafío de Portal**. Tras superarlo, `advance_tier()` recalibra la maestría a $0.65$ en el nuevo templo.

**Regla de piedad:** 8 aciertos consecutivos a cualquier velocidad también activan el portal. Sin ella, un jugador lento-pero-correcto ($P = 0.70$, asíntota $0.70 < 0.82$) persistiría sin avanzar jamás; la racha ya exige 8 *correctas* seguidas, sin vía de juego sucio.

**Regla de refuerzo:** con $M_k < 0.38$ y 2 fallos consecutivos, el motor retrocede un tier para afianzar confianza (recalibra a $0.55$), salvo en el Nivel 1.

```
[ Ejercicios Adaptativos WASM ]
              │
              ▼
   ¿Maestría Mk >= 0.82 y racha >= 3? ──(No)──► ¿Racha >= 8 (piedad)? ──(No)──► Continuar práctica
              │ (Sí)                                  │ (Sí)
              ▼                                       ▼
   [ ESTADO PORTALREADY ACTIVADO ]◄───────────────────┘
              │
              ▼
   [ DESAFÍO DE PORTAL ACTIVADO ]
      ├── 1. Lectura Narrativa (Micro-cuento 4 líneas + TTS Karaoke)
      ├── 2. Reto Dual Lógico-Matemático
      └── 3. Liberación, Celebración y Cosmético
```

### 4.2. Fases del Desafío de Portal

#### Fase 1: Lectura Narrativa Inmersiva
* El Guardián Astral aparece en su **forma corrompida** (silueta ensombrecida con tonos índigo y aura titilante).
* Se presenta un **micro-cuento de 4 versos** que sitúa el dilema del templo.
* Al pulsar *"Escuchar Micro-Cuento"* (o por reproducción automática accesible), el sintetizador de voz (Web Speech API) lee el texto verso por verso.
* Cada verso se ilumina con la clase `.story-line.speaking` en sincronía con la locución (efecto karaoke pedagógico).

#### Fase 2: El Reto Dual Lógico-Matemático
* Directamente integrado en la trama del micro-cuento, el guardián plantea un acertijo que requiere conjugar comprensión lectora con razonamiento aritmético.
* *Ejemplo Templo 1:*
  > *"Tres conchas guardan 3 perlas cada una en el fondo del manantial, y una nutria amiga trae 1 perla más para encender el altar. ¿Cuántas perlas hay en total para romper la niebla?"*
  > **Opciones:** `[8]  [9]  [10]  [12]` — **Respuesta correcta:** `10`.
* Se disponen 4 fichas interactivas táctiles con superficie mínima de $48 \times 48\text{px}$.

#### Fase 3: Liberación y Celebración
Al pulsar la opción correcta:
1. **Purificación Visual:** El guardián astral transmuta su apariencia: la sombra se disipa mediante una transición CSS y adopta sus colores pasteles radiantes (`.guardian-purified`).
2. **Efecto de Destello Celestial:** La pantalla emite una lluvia de chispas doradas (`.gold-sparks`) y se reproduce el acorde sinfónico de portal (`sound.playLevelUp()`).
3. **Desbloqueo en IndexedDB:** El cosmético correspondiente al templo se desbloquea inmediatamente en `cosmetics_catalog` con costo 0 ⭐.
4. **Ascenso Curricular WASM:** El motor Rust ejecuta `advance_tier()`, avanzando al siguiente templo astral y actualizando el perfil activo.
5. **Auto-equipamiento Opcional:** Una tarjeta de victoria ofrece equipar el nuevo accesorio de inmediato o continuar la aventura en el siguiente templo.

### 4.3. Flujo Bifásico Progresivo y Mitigación de Carga Cognitiva (Teoría de Sweller)
Para niveles de alta complejidad conceptual como el **Nivel 5 (Palacio Prisma)**, donde convergen vocabulario en contexto y multiplicación matricial ($5 \times 6 = 30$), el portal implementa un **diseño bifásico secuencial**:
* **Fase 1 (Lectura Contextual):** Presenta únicamente la fábula y el reto de vocabulario/sinónimo (*radiante* $\rightarrow$ *brillante*). La matemática permanece oculta para evitar el *Split-Attention Effect*.
* **Transición Causal (400–650 ms):** Al acertar la comprensión, el diálogo del guardián conecta la lectura con la necesidad aritmética: *"¡Exacto! El cetro es brillante... ahora acompáñame a encender los espejos del salón"*.
* **Fase 2 (Matemáticas Visuales):** Se ilumina secuencialmente la matriz concreta de gemas ($6 \text{ filas} \times 5 \text{ columnas} = 30 \text{ gemas}$) facilitando el andamiaje visual antes de solicitar el cálculo numérico.
* **Feedback Sensorial:**
  * **"El Sueño del Olvido"** (`.oblivion-mist`): En caso de error o vacilación, la escena se desatura un 70% con un tinte violáceo sutil y tono grave, sin frustrar al jugador.
  * **"El Resplandor de la Armonía"** (`.harmony-radiance`): En caso de acierto, la escena vibra con saturación pastel al 135%, acorde pentatónico mayor y lluvia de chispas doradas.
* **Prototipo de Referencia:** Ver [`www/palacio-prisma.html`](../www/palacio-prisma.html).

---

## 5. Integración Técnica

### 5.1. Rust WASM (`src/engine/math_fsm.rs`)
* Enum `CurricularTier` ampliado a 10 variantes con nombres canónicos de templos.
* Generador de problemas procedurales calibrado por niveles 1..10.
* Flag `portal_ready: bool` expuesta para el ciclo de vida del juego.
* Método `advance_tier(&mut self) -> u8` para ascender tras la victoria del portal.

### 5.2. Motor de Campaña (`www/js/services/campaign-engine.js`)
* Terminal tonto: despacha `(respuesta, elapsed_ms)` a `MathSession.submit_answer()` y persiste el `get_state_json()` devuelto en `adventure` (`syncWasm`). No valida ni calcula avances.
* Al armarse `portal_ready`, la arena (`math.html?campaign=1`) abre `portalController.openPortalChallenge(templo)`; al vencer, `completePortal()` ejecuta `advance_tier()` + `adventure.completeTemple()` y dispara la transición de acto (templos 3/7/10).
* El motor es fuente de verdad del tier: ante regresión (`tier_changed === -1`), la aventura retrocede con él.

### 5.3. Módulo de Datos (`www/js/levels-data.js`)
* Colección `TEN_MOONS_LEVELS` estructurada con micro-cuentos, acertijos duales, metadatos de guardianes y especificaciones de recompensas.

### 5.3. Capa de Persistencia (`www/js/storage.js`)
* Esquema `valenquest_db` enriquecido con los 10 cosméticos astrales en `INITIAL_COSMETICS`.
* Método `grantCosmeticReward(itemId)` para transacciones de desbloqueo sin costo en estrellas.
