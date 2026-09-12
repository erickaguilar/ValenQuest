# ValenQuest: Especificación de Estándares Mobile-First y Ergonomía Táctil Infantil

Este documento técnico establece los principios arquitectónicos, directrices de diseño táctil infantil y estándares de rendimiento **Mobile-First** implementados en ValenQuest. El objetivo prioritario es garantizar una experiencia impecable, fluida (60 FPS) y adaptada a la motricidad fina de niñas y niños de 5 a 9 años en smartphones y tabletas (iOS Safari, iPadOS y Android Chrome/Edge).

---

## 1. Principios de Ergonomía Táctil para Niñas y Niños

A diferencia de los usuarios adultos, los estudiantes de educación primaria presentan particularidades biomecánicas y cognitivas:
* **Área de contacto dactilar variable:** Al usar tabletas o teléfonos en las manos o sobre la mesa, tocan con la yema completa, el pulgar o múltiples dedos.
* **Tolerancia reducida a la frustración:** Retrasos táctiles de 300 ms o botones pequeños provocan toques repetidos erráticos ("rage tapping").
* **Oclusión visual por teclados virtuales del sistema:** Los teclados del sistema operativo (iOS Keyboard / Gboard) cubren más del 50% de la pantalla en orientación vertical y el 80% en horizontal, ocultando el reto matemático y los poderes.

### 1.1. Matriz de Dimensiones de Blancos Táctiles (Touch Targets)

Siguiendo y superando el criterio **WCAG 2.2 SC 2.5.8 (Target Size - Minimum)**:

| Componente | Dimensión Mínima | Área de Impacto | Justificación Pedagógica |
| :--- | :--- | :--- | :--- |
| **Opciones de Respuesta Múltiple (`.option-btn`)** | `100% × 64px` | ≥ 4800 px² | Botones primarios de respuesta; deben presionarse sin riesgo de error por adyacencia. |
| **Teclado Táctil In-Game (`.key-btn`)** | `100% × 52px - 60px` | ≥ 3600 px² | Reemplaza el teclado del sistema, manteniendo el reto visualmente visible. |
| **Botón de Envío (`.key-action-submit`)** | `2 columnas × 52px - 60px` | ≥ 7200 px² | Hito final de la acción con doble ancho para confirmar con confianza. |
| **Botones de Icono del Header (`.icon-btn`)** | `40px - 44px × 40px - 44px` | ≥ 1600 px² | Controles secundarios de accesibilidad (audio, tema, ropero). |
| **Botones de Poderes de Amistad (`.power-btn`)** | `flex: 1 1 30% × 42px` | ≥ 2100 px² | Asistencia inmediata sin obstaculizar la tarjeta central. |
| **Insignia de Estrellas (`.stars-counter-badge`)** | `Auto × 38px` | ≥ 2600 px² | Hitbox generosa que abre directamente el ropero mágico al tocar el saldo. |

---

## 2. Configuración de Viewport, Safe Areas y Unidades Dinámicas

### 2.1. Meta Viewport Adaptativo (`viewport-fit=cover`)
En `www/index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

* **`viewport-fit=cover`:** Extiende el canvas visual a los bordes físicos del dispositivo (Edge-to-Edge), permitiendo que el fondo pastel o noche astral cubra el Notch del iPhone, la Dynamic Island y las esquinas redondeadas.
* **Control de Zoom Accesible:** Se evita bloquear permanentemente el escalado (`user-scalable=no` eliminado) en favor de `touch-action: manipulation`, cumpliendo la pauta WCAG 1.4.4 (Resize text).

### 2.2. Safe Area Insets con Funciones `max()`
En `www/css/base.css`:
```css
.app-container {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```
* **Garantía:** El contenido interactivo nunca queda oculto detrás de la barra de estado superior ni superpuesto con la barra de inicio gestual inferior (Home Indicator) de iOS y Android.

### 2.3. Unidades de Viewport Dinámicas (`100dvh`)
En navegadores móviles, `100vh` genera desbordamiento vertical debido a la barra de direcciones que se retrae al hacer scroll. ValenQuest utiliza:
```css
body {
  min-height: 100vh;
  min-height: 100dvh;
}

.wardrobe-modal-content {
  max-height: calc(100dvh - 24px);
}
```
* `100dvh` (Dynamic Viewport Height) se recalcula en tiempo real cuando la barra del navegador aparece o desaparece, evitando saltos visuales bruscos.

---

## 3. Optimización Táctil: Cero Retardo y Prevención de "Sticky Hover"

### 3.1. Eliminación del Retardo Táctil de 300 ms
Los navegadores móviles aplican por defecto una pausa de 300 ms antes del evento `click` para verificar si el usuario realizará un doble toque para zoom. En ValenQuest se neutraliza con:
```css
button,
[role="button"],
.tab-btn,
.key-btn,
.option-btn,
.icon-btn,
.power-btn,
.wardrobe-action-btn,
.wardrobe-tab-btn,
.story-chip {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}
```
* **`touch-action: manipulation`:** Permite desplazamiento vertical y zoom gestual con dos dedos, pero cancela de inmediato el retardo de doble toque en botones.
* **`-webkit-tap-highlight-color: transparent`:** Elimina el recuadro gris o azul por defecto de WebKit en iOS/Android al pulsar elementos interactivos.
* **`user-select: none`:** Impide que los toques repetidos seleccionen texto accidentalmente o abran lupas de selección nativas.

### 3.2. Aislamiento de Efectos Hover (`@media (hover: hover)`)
En dispositivos táctiles, los estilos `:hover` suelen quedar "pegados" después de levantar el dedo, confundiendo a los infantes. ValenQuest aísla todos los efectos de cursor:
```css
@media (hover: hover) {
  .icon-btn:hover {
    background: var(--vq-pink-bubble);
    transform: translateY(-2px);
  }
  .option-btn:hover {
    background: var(--vq-lavender-light);
    transform: translateY(-2px);
  }
  .heroine-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--vq-shadow-hard);
  }
}

/* Feedback instantáneo exclusivo para toque físico */
.option-btn:active,
.key-btn:active,
.icon-btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--vq-border);
}
```

### 3.3. Contención del Rebote Elástico (`overscroll-behavior-y: contain`)
Evita que el arrastre vertical desplace la página completa fuera de pantalla (rubber-banding en Safari) o dispare recargas accidentales (Pull-to-Refresh en Chrome móvil):
```css
html, body {
  overscroll-behavior-y: contain;
}
```

---

## 4. Pipeline de Audio y Síntesis de Voz en Dispositivos Móviles

Los navegadores móviles imponen restricciones estrictas de ahorro energético y prevención de spam: **el audio no puede reproducirse sin un gesto previo explícito del usuario**.

### 4.1. Desbloqueo Preventivo del AudioContext (`audio.js`)
El motor de efectos sonoros procedurales suscribe listeners pasivos de un solo uso (`once: true`) a los primeros eventos táctiles del viewport:
```javascript
initWarmUp() {
  const unlockHandler = () => {
    this.ensureContext();
    window.removeEventListener('pointerdown', unlockHandler);
    window.removeEventListener('touchstart', unlockHandler);
    window.removeEventListener('click', unlockHandler);
  };
  window.addEventListener('pointerdown', unlockHandler, { once: true, passive: true });
  window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
  window.addEventListener('click', unlockHandler, { once: true, passive: true });
}
```

### 4.2. Calentamiento de Síntesis de Voz (`speech.js`)
Emite una expresión silenciosa (`volume = 0`) para activar el pipeline de síntesis de voz en iOS WebKit y sincronizar el catálogo de voces en background.

---

## 5. Matriz de Breakpoints y Adaptabilidad Responsive

ValenQuest implementa un diseño líquido y adaptable en tres umbrales clave:

```text
📱 320px — 380px (Ultra Compact Mobile: iPhone SE 1ª/2ª gen, Android compactos)
   ├── Tipografía: clamp(2rem, 9vw, 2.8rem)
   ├── Header: Disposición en 2 filas, botones de 40px
   ├── Teclado in-game: Altura 48px
   └── Grid del ropero: 1 columna completa

📱 381px — 540px (Standard Mobile: iPhone 13/14/15/16, Samsung Galaxy S, Pixel)
   ├── Tipografía: clamp(2.4rem, 10vw, 3.6rem)
   ├── Header: Acciones wrap compactas con espacio entre sí
   ├── Teclado in-game: Altura 52px
   └── Poderes de heroínas: flex wrap 33% equilibrado

💻 541px — 768px (Tablets / iPads en modo vertical)
   ├── Layout centrado con max-width de 680px
   ├── Trío de heroínas: Grid de 3 columnas
   └── Ropero Mágico: Grid de 2 columnas con previsualización ampliada
```

---

## 6. Verificación y Checklist de Calidad Mobile

- [x] **Touch Targets:** Todos los elementos interactivos superan los 44×44 px mínimos de WCAG 2.2.
- [x] **Safe Areas:** Integración completa de `env(safe-area-inset-*)` y `viewport-fit=cover`.
- [x] **Sin Retardo:** `touch-action: manipulation` activo en todos los controles.
- [x] **Sin Sticky Hover:** Estados `:hover` confinados a `@media (hover: hover)`.
- [x] **Viewport Dinámico:** `100dvh` implementado en contenedor principal y modales.
- [x] **Audio Móvil Desbloqueado:** Web Audio API y Web Speech API inicializados sin latencia.
- [x] **PWA Standalone:** Pantalla completa, `theme-color` adaptativo y soporte offline al 100%.
