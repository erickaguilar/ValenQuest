# ValenQuest: Arquitectura CSS Modular, Modo Noche Astral, Iconografía SVG y TTS Nativo

Este documento técnico detalla la reestructuración del sistema de estilos, la implementación del **Modo Obscuro (Noche Astral)**, la integración del sprite vectorial SVG y el subsistema de accesibilidad fonética y auditiva (**Web Audio API + Web Speech API**) para niños de educación primaria.

---

## 1. Arquitectura Modular CSS (Zero Framework)

Para garantizar mantenibilidad, carga instantánea y separación clara de responsabilidades, el sistema de estilos se organiza en cinco capas modulares:

```text
www/css/
├── tokens.css       # Tokens de diseño semánticos (paleta día pastel, noche astral, tipografía, radios y sombras)
├── base.css         # Reset de accesibilidad, layout fluido, header de navegación y canvas de fondo
├── animations.css   # Suite de keyframes acelerados por GPU para SVGs y componentes táctiles (60 FPS)
├── components.css   # Tarjetas de reto, teclado táctil, diálogos chibi, barra de maestría y modales
└── theme-dark.css   # Ajustes de contraste, cielo estrellado nocturno y scrollbars temáticas
```

### 1.1. Inclusión en el Shell (`www/index.html`)
```html
<!-- Carga modular en cascada sin empaquetadores -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/theme-dark.css">
```

---

## 2. Sistema de Modo Noche Astral (Dark Mode)

El sistema de temas soporta tanto la preferencia del sistema operativo del usuario (`prefers-color-scheme`) como la alternancia manual con persistencia en `localStorage`.

### 2.1. Matriz de Contraste y Tokens Semánticos

| Token Semántico | Modo Día Pastel (Lumiria Solar) | Modo Noche Astral (Lumiria Nocturna) | Uso en UI |
|---|---|---|---|
| `--vq-bg-canvas` | `#FDF7FF` (Nube blanca suave) | `#130E1F` (Espacio profundo) | Fondo general de la aplicación |
| `--vq-bg-card` | `#FFFFFF` (Blanco puro) | `#201633` (Ciruela galáctico) | Tarjeta de reto, diálogos y menú |
| `--vq-bg-well` | `#F4EEF8` (Lavanda tenue) | `#1A122A` (Nebulosa profunda) | Teclado numérico, display del reto |
| `--vq-border` | `#4A3E56` (Tinta ciruela) | `#8975A3` (Lila cósmico nítido) | Bordes gruesos estilo sticker chibi (3px) |
| `--vq-text` | `#32213F` (Púrpura noche) | `#F8F5FC` (Luz estelar luminosa) | Textos principales (Cumple WCAG AAA) |
| `--vq-pink-bubble` | `#FFAFCC` (Rosa chicle pastel) | `#F472B6` (Neón rosa brillante) | Operadores, botones y acentos |
| `--vq-gold` | `#FFD166` (Oro cálido) | `#FBBF24` (Ámbar estelar) | Botón de comenzar, rachas y medallas |
| `--vq-mint` | `#B8F2E6` (Menta fresca) | `#34D399` (Esmeralda aurora) | Botón enviar, aciertos y nivel completado |

### 2.2. Prevención de FOUC (Flash of Unstyled Content)
En `<head>` de `index.html` se ejecuta un script síncrono ultraligero que inyecta `data-theme` antes de pintar el DOM:
```html
<script>
  (function() {
    const savedTheme = localStorage.getItem('vq-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  })();
</script>
```

---

## 3. Integración con la Biblioteca de Iconos Vectoriales SVG

El sprite sheet [`www/assets/icons.svg`](file:///home/erickaguilar/Documentos/ValenQuest/www/assets/icons.svg) contiene símbolos vectoriales (`<symbol>`) diseñados sobre un canvas de `64x64px`.

### 3.1. Adaptabilidad Cromática Automática
Los iconos no usan colores fijos en sus contornos; referencian directamente los tokens `--vq-border` y variables contextuales, adaptándose instantáneamente cuando el usuario activa el Modo Noche Astral.

### 3.2. Animaciones GPU Vinculadas
Las clases definidas en [`animations.css`](file:///home/erickaguilar/Documentos/ValenQuest/www/css/animations.css) se asocian a los elementos vectoriales:
* **Prisma Numérico:** `.vq-anim-float` levita el prisma de matemáticas en el eje Y.
* **Pluma de la Fluidez:** `.vq-anim-quill` aplica rotación de péndulo caligráfico sobre el origen `(20%, 85%)`.
* **Destellos Kawaii:** `.vq-sparkle` modula la opacidad y escala de las estrellas.

---

## 4. Recursos Nativos de Audio y Text-To-Speech (TTS)

Fieles al guardrail de **Zero Framework & Zero External Dependencies**, no se descargan archivos `.mp3` ni se invocan APIs de pago en la nube. Se utilizan dos APIs nativas del navegador:

### 4.1. Sintetizador Web Audio API ([`www/js/audio.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/audio.js))
Genera ondas senoidales y triangulares en tiempo real:
* **Clic táctil:** 420 Hz $\to$ 180 Hz en 40 ms.
* **Acierto:** Arpegio ascendente en Do Mayor ($C_5 \to E_5 \to G_5 \to C_6$).
* **Fallo amigable:** Descenso menor ($C_4 \to A_3$) con onda suave y decay prolongado (sin timbres punitivos).
* **Subida de Tier:** Fanfarria heroica con cuatro acordes armónicos.
* **Hito de Racha:** Glissando senoidal de 880 Hz a 1760 Hz.

### 4.2. Motor de Voz Narradora TTS ([`www/js/speech.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/speech.js))
Utiliza la interfaz `window.speechSynthesis` y `SpeechSynthesisUtterance` configurada pedagógicamente para educación básica:
* **Detección inteligente de voz:** Filtra y selecciona voces naturales en español (`es-ES`, `es-MX`, `es-419`, `es-US`).
* **Prosodia calibrada:**
  - `rate: 0.90 - 0.94`: Velocidad deliberadamente más pausada que el habla estándar, facilitando la comprensión en niños pequeños.
  - `pitch: 1.15 - 1.20`: Tono ligeramente agudo y cálido, emulando la voz de una compañera mágica o maestra.

### 4.3. Puntos de Contacto del TTS en ValenQuest:
1. **Lectura del Reto Matemático:** El botón `🗣️ Escuchar reto` traduce la ecuación matemática a lenguaje natural (ej. `$6 \times 7 = ?$` se pronuncia como *"¿Cuánto es 6 por 7?"*).
2. **Pronunciación de Palabras al Clic:** En el módulo de lectura, cada palabra dividida en sílabas es interactiva. Al pulsarla, el motor pronuncia la palabra de forma individual y clara.
3. **Lectura del Cuento:** El botón `🗣️ Leer cuento` narra el pasaje completo mientras el niño sigue el texto coloreado.
4. **Felicitaciones de Racha:** Al alcanzar rachas de aciertos ($3, 6, 9...$), el motor vocaliza elogios variados (*"¡Increíble trabajo!", "¡Brillas como las estrellas de Lumiria!"*).
5. **Indicador Visual de Habla:** El diálogo de Valen pulsa con la animación `.vq-anim-speaking` mientras la voz está emitiendo audio.

---

## 5. Accesibilidad y Ergonomía Cognitiva

* **Sensibilidad Vestibular:** Soporte integral de `@media (prefers-reduced-motion: reduce)` en `animations.css`. Si el sistema tiene activada la reducción de movimiento, las oscilaciones se detienen por completo.
* **Control de Estímulos:** La interfaz provee conmutadores independientes para silenciar los efectos sonoros (`🔊 / 🔇`) y para apagar la voz del narrador (`🗣️`), permitiendo adaptar la experiencia a aulas de clases o niños con neurodivergencias.
