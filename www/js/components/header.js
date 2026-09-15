/**
 * ValenQuest Web Component: <vq-header>
 * Componente nativo encapsulado para la cabecera principal de la aplicación.
 * Gestiona la identidad del jugador, avatar de la heroína activa, contador de estrellas y dock de herramientas mágicas.
 */
export class VqHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <!-- App Header (Optimizado Mobile-First) -->
    <header class="app-header" role="banner">
      <!-- Fila Superior: Identidad, Heroína Activa y Contador de Estrellas -->
      <div class="header-main-row">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-unicorn"></use></svg>
          </span>
          <div class="brand-info">
            <h1 class="brand-title">ValenQuest</h1>
            <div class="brand-subtitle" title="Heroína activa">
              <span id="student-avatar" aria-hidden="true"><svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-crown"></use></svg></span>
              <span id="student-name">Valen</span>
            </div>
          </div>
        </div>

        <!-- Contador de Estrellas y Enlace al Ropero Mágico -->
        <a href="wardrobe.html" id="header-stars-badge" class="stars-counter-badge" title="Tus estrellas de Lumiria — ¡Toca para entrar al Ropero Mágico!" aria-label="Estrellas acumuladas. Toca para entrar al Ropero Mágico" style="text-decoration:none; color:inherit;">
          <span class="star-icon" aria-hidden="true"><svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-star"></use></svg></span>
          <span id="player-stars-count">0</span>
        </a>
      </div>

      <!-- Dock de Acciones y Herramientas Mágicas -->
      <div class="header-actions" aria-label="Herramientas y ajustes mágicos">
        <!-- Ropero Mágico & Pasarela (Boutique de Heroínas) -->
        <a href="wardrobe.html" id="btn-show-wardrobe" class="icon-btn" aria-label="Ropero Mágico" title="Ir al Ropero Mágico y Pasarela">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-wardrobe"></use></svg>
        </a>
        <!-- Selector Modo Oscuro (Noche Astral) -->
        <button id="btn-toggle-theme" class="icon-btn" aria-label="Cambiar tema día/noche" title="Modo Noche Astral">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-moon"></use></svg>
        </button>
        <!-- Voz Narradora / TTS -->
        <button id="btn-toggle-speech" class="icon-btn active" aria-label="Alternar voz del narrador" title="Voz del narrador activa">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-speech"></use></svg>
        </button>
        <!-- Historia del Reino (Redirección al Gran Libro de las Princesas) -->
        <a href="story.html" id="btn-show-intro" class="icon-btn" aria-label="Historia de Lumiria" title="Ver el Gran Libro de las Princesas">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
        </a>
        <!-- Efectos de Audio Web Audio API -->
        <button id="btn-toggle-mute" class="icon-btn" aria-label="Alternar efectos de sonido" title="Silenciar efectos">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>
        </button>
        <!-- Botón de Descarga / Instalación PWA (oculto por defecto) -->
        <button id="btn-install-pwa" class="icon-btn pwa-install-icon-btn" aria-label="Descargar e instalar app" title="Descargar e instalar ValenQuest en tu pantalla de inicio" hidden>
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-download"></use></svg>
        </button>
      </div>
    </header>
    `;
  }
}

if (!customElements.get('vq-header')) {
  customElements.define('vq-header', VqHeader);
}
