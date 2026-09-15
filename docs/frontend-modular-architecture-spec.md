# ValenQuest: Especificación de Arquitectura Modular Frontend y Desacoplamiento de Vistas

Este documento detalla la reestructuración arquitectónica del frontend en `www/`, el esqueleto semántico de `index.html`, la adopción de Web Components nativos en Light DOM, la reorganización funcional de módulos JavaScript y la extracción de experiencias complejas (como el Ropero Mágico) a páginas dedicadas preparadas para tecnologías 3D como Three.js.

---

## 1. Motivación y Principios de Diseño

1. **Esqueleto Semántico y Mantenibilidad:** Evitar archivos HTML monolíticos superiores a 1,000 líneas. `index.html` pasa a actuar como un shell declarativo con fronteras claras:
   - Cabecera (`<vq-header>`)
   - Navegación (`<nav class="nav-tabs">`)
   - Contenido curricular principal (`<main class="app-main">`)
   - Modales/Overlays transitorios
   - Pie de página (`<vq-footer>`)
2. **Zero-Framework & Zero-CORS:** Todo el sistema se mantiene en Vanilla HTML5, CSS3 y ES Modules nativos, garantizando ejecución fluida en navegadores locales, WebViews y PWA 100% offline.
3. **Ergonomía Móvil y Carga Cognitiva:** Las experiencias con alta interacción visual o configuraciones espaciadas (como el probador de heroínas o desafíos de portal) no deben confinarse a modales reducidos en pantallas pequeñas, sino disfrutar de `100dvh` en páginas dedicadas.
4. **Preparación para Three.js:** Desacoplar la pasarela de personajes permite integrar motores 3D sin penalizar el rendimiento ni el tiempo de carga del núcleo de ejercicios matemáticos y lectores.

---

## 2. Esqueleto Semántico y Web Components Nativos

### 2.1. Web Components en Light DOM (`www/js/components/`)
Para mantener compatibilidad total con la suite CSS modular (`tokens.css`, `base.css`, `components.css`) y permitir que `app.js` interactúe con los identificadores del DOM sin barreras de Shadow DOM, los componentes emplean **Light DOM**:

```javascript
// www/js/components/header.js
export class VqHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="app-header" role="banner">
        ...
      </header>
    `;
  }
}
customElements.define('vq-header', VqHeader);
```

### 2.2. Integración en el Layout Flex (`display: contents`)
En [`base.css`](../www/css/base.css), se establece:
```css
vq-header,
vq-footer,
.app-main {
  display: contents;
}
```
Esto asegura que las etiquetas contenedoras de los Custom Elements no alteren el flujo flex vertical ni el espaciado (`gap: 16px`) definido en `.app-container`.

---

## 3. Reorganización Funcional de JavaScript (`www/js/`)

El directorio `www/js/` se estructura por dominios de responsabilidad:

```text
www/js/
├── app.js               # Orquestador del ciclo de vida de la aplicación principal
├── storybook.js         # Controlador exclusivo del Gran Libro (story.html)
├── wardrobe-page.js     # Controlador exclusivo de la Boutique (wardrobe.html)
├── components/          # Web Components nativos reutilizables
│   ├── header.js        # <vq-header>
│   └── footer.js        # <vq-footer>
├── views/               # Vistas curriculares modulares (próxima fase)
│   └── .gitkeep         # (intro-view.js, math-view.js, reading-view.js)
├── data/                # Datos curriculares estáticos y narrativa canónica
│   └── levels-data.js   # Catálogo de Las Diez Lunas y 3 Actos
└── services/            # Servicios transversales y motores del sistema
    ├── audio.js         # Sintetizador procedural Web Audio API
    ├── speech.js        # Motor de voz nativa Web Speech API (TTS)
    ├── storage.js       # Persistencia transaccional IndexedDB (valenquest_db v4)
    ├── companions.js    # Estado, poderes y cargas del Cuarteto de la Armonía
    ├── pwa.js           # Gestor de instalación PWA y eventos offline
    └── wasm-loader.js   # Carga asíncrona y resiliente del binario Rust WebAssembly
```

---

## 4. Desacoplamiento del Ropero Mágico (`wardrobe.html`)

### 4.1. Diagnóstico del Modal Anterior
El modal `#wardrobe-modal` acumulaba alta densidad de elementos (tabs de 4 heroínas, avatar con capas SVG, catálogo de IndexedDB, botones de compra). En dispositivos móviles generaba scrolls anidados molestos y limitaba la visibilidad del personaje.

### 4.2. Nueva Página Dedicada: `www/wardrobe.html`
- **Cabecera de boutique:** Retorno directo (`← Volver a ValenQuest`), saldo interactivo de estrellas, silenciador y conmutador de tema Noche Astral.
- **Layout bifásico en escritorio / apilado en móvil:**
  - **Columna de Escenario / Pasarela:**
    - Selector rápido de heroínas (*Valen*, *Reni*, *Zoe*, *Lía*).
    - Avatar 2D SVG ampliado a 130px con capas dinámicas.
    - Cita de voz con botón TTS narrativo.
    - **Contenedor `<div id="threejs-stage-container">`** integrado para Three.js.
  - **Columna de Catálogo:**
    - Filtros por chips (*Todos*, *Coronas y Tiaras*, *Alas y Capas*, *Amuletos y Broches*).
    - Rejilla responsiva con precios en estrellas, estado equipado/bloqueado y auto-equipamiento.

### 4.3. Preparación de Three.js para Animaciones 3D
El archivo [`wardrobe-page.js`](../www/js/wardrobe-page.js) implementa el gancho `initThreeJsStage()`:
```javascript
initThreeJsStage() {
  const container = document.getElementById('threejs-stage-container');
  if (!container) return;
  // Hook preparado para inicializar Scene, PerspectiveCamera, WebGLRenderer
  // y renderizado de modelos 3D / efectos de partículas.
}
```

---

## 5. Garantía de Funcionamiento 100% Offline (PWA)

El Service Worker [`www/sw.js`](../www/sw.js) mantiene sincronizada la lista `PRECACHE_URLS` con todos los nuevos módulos y páginas:
- `/wardrobe.html`
- `/css/wardrobe.css`
- `/js/wardrobe-page.js`
- `/js/components/header.js`
- `/js/components/footer.js`
- `/js/services/*`
- `/js/data/levels-data.js`

Garantizando que tanto `index.html`, `story.html` como `wardrobe.html` funcionen plenamente sin conexión a internet.
