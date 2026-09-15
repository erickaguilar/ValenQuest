/**
 * ValenQuest Web Component: <vq-header>
 * Componente nativo encapsulado para la cabecera principal de la aplicación.
 * Gestiona la identidad del jugador, avatar de la heroína activa, contador de estrellas y modal de ajustes mágicos.
 */
import { sound } from '../services/audio.js';

export class VqHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <!-- App Header (Optimizado Mobile-First) -->
    <header class="app-header" role="banner">
      <!-- Fila Superior: Identidad, Heroína Activa y Contador de Estrellas -->
      <div class="header-main-row">
        <a href="index.html" id="header-brand-link" class="brand" style="text-decoration:none; color:inherit; cursor:pointer;" title="Volver a El Viaje (Salón Principal)">
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
        </a>

        <!-- Contador de Estrellas y Enlace Único Canónico al Ropero Mágico -->
        <a href="wardrobe.html" id="header-stars-badge" class="stars-counter-badge" title="Tus estrellas de Lumiria — ¡Toca para entrar al Ropero Mágico!" aria-label="Estrellas acumuladas. Toca para entrar al Ropero Mágico" style="text-decoration:none; color:inherit;">
          <span class="star-icon" aria-hidden="true"><svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-star"></use></svg></span>
          <span id="player-stars-count">0</span>
        </a>
      </div>

      <!-- Dock de Acciones y Herramientas Mágicas -->
      <div class="header-actions" aria-label="Herramientas y ajustes mágicos">
        <!-- Historia del Reino (Redirección al Gran Libro de las Princesas) -->
        <a href="story.html" id="btn-show-intro" class="icon-btn" aria-label="Historia de Lumiria" title="Ver el Gran Libro de las Princesas">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
        </a>

        <!-- Botón de Configuración & Ajustes Mágicos (Tema, Sonido, Voz, App) -->
        <button id="btn-open-settings" class="icon-btn" aria-label="Ajustes y configuración" title="Configuración de sonido, tema y aplicación">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-settings"></use></svg>
        </button>
      </div>
    </header>

    <!-- Modal de Configuración & Ajustes Mágicos -->
    <div id="settings-modal" class="modal-backdrop" hidden role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="modal-content settings-modal-content">
        <div class="settings-header">
          <h2 id="settings-title" class="settings-title">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-settings"></use></svg>
            <span>Ajustes Mágicos</span>
          </h2>
          <button id="btn-settings-close" class="modal-close-btn" aria-label="Cerrar ajustes" title="Cerrar ventana">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-close"></use></svg>
          </button>
        </div>

        <div class="settings-list">
          <!-- Fila: Aspecto Astral (Tema Noche / Día) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-moon"></use></svg>
                Aspecto Astral
              </span>
              <span class="settings-item-desc">Alternar entre modo Día Pastel y Noche Astral</span>
            </div>
            <button id="btn-toggle-theme" class="icon-btn" aria-label="Cambiar tema día/noche" title="Modo Noche Astral">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-moon"></use></svg>
            </button>
          </div>

          <!-- Fila: Efectos de Sonido Web Audio API -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>
                Efectos Mágicos
              </span>
              <span class="settings-item-desc">Activar o silenciar sonidos y fanfarrias</span>
            </div>
            <button id="btn-toggle-mute" class="icon-btn" aria-label="Alternar efectos de sonido" title="Silenciar efectos">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>
            </button>
          </div>

          <!-- Fila: Voz del Narrador (Web Speech API) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-speech"></use></svg>
                Voz Narradora
              </span>
              <span class="settings-item-desc">Lectura con voz interactiva en los retos</span>
            </div>
            <button id="btn-toggle-speech" class="icon-btn active" aria-label="Alternar voz del narrador" title="Voz del narrador activa">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-speech"></use></svg>
            </button>
          </div>

          <!-- Fila: Descargar / Instalar App (PWA) -->
          <div class="settings-item-row" id="settings-pwa-row" hidden>
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-download"></use></svg>
                Instalar Aplicación
              </span>
              <span class="settings-item-desc">Juega sin conexión instalando ValenQuest</span>
            </div>
            <button id="btn-install-pwa" class="icon-btn pwa-install-icon-btn" aria-label="Descargar e instalar app" title="Descargar e instalar ValenQuest en tu pantalla de inicio" hidden>
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-download"></use></svg>
            </button>
          </div>
        </div>

        <div class="settings-footer">
          <button id="btn-settings-done" class="action-btn" style="width:100%; justify-content:center;">
            ¡Listo, cerrar ajustes!
          </button>
          <span class="settings-version-tag">ValenQuest v1.2 • Edición Lumiria</span>
        </div>
      </div>
    </div>
    `;

    this.setupSettingsModal();
  }

  setupSettingsModal() {
    const modal = this.querySelector('#settings-modal');
    const btnOpen = this.querySelector('#btn-open-settings');
    const btnClose = this.querySelector('#btn-settings-close');
    const btnDone = this.querySelector('#btn-settings-done');
    const pwaBtn = this.querySelector('#btn-install-pwa');
    const pwaRow = this.querySelector('#settings-pwa-row');

    const openModal = () => {
      if (modal) {
        sound.playClick();
        modal.hidden = false;
        btnClose?.focus();
      }
    };

    const closeModal = () => {
      if (modal && !modal.hidden) {
        sound.playClick();
        modal.hidden = true;
        btnOpen?.focus();
      }
    };

    btnOpen?.addEventListener('click', openModal);
    btnClose?.addEventListener('click', closeModal);
    btnDone?.addEventListener('click', closeModal);

    // Cerrar al pulsar sobre el fondo oscuro (backdrop)
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        closeModal();
      }
    });

    // Sincronizar visibilidad de fila PWA si el Service Worker / navegador lo activa
    if (pwaBtn && pwaRow) {
      pwaRow.hidden = pwaBtn.hidden;
      const observer = new MutationObserver(() => {
        pwaRow.hidden = pwaBtn.hidden;
      });
      observer.observe(pwaBtn, { attributes: true, attributeFilter: ['hidden'] });
    }
  }
}

if (!customElements.get('vq-header')) {
  customElements.define('vq-header', VqHeader);
}
