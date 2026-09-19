/**
 * ValenQuest Web Component: <vq-header>
 * Componente nativo encapsulado para la cabecera principal de la aplicación.
 * Gestiona la identidad del jugador, avatar de la heroína activa, contador de estrellas y modal de ajustes mágicos.
 */
import { sound } from '../services/audio.js';
import { theme } from '../services/theme.js';
import { speech } from '../services/speech.js';
import { db } from '../services/storage.js';
import { loadSvgSprites } from '../services/icons.js';

export class VqHeader extends HTMLElement {
  connectedCallback() {
    loadSvgSprites();

    const currentSection = (this.getAttribute('current') || '').toLowerCase().trim();

    let sectionBadgeHtml = '';
    if (currentSection === 'math') {
      sectionBadgeHtml = `
        <span class="header-section-badge header-section-badge--math" title="Módulo actual: El Prisma Numérico (Matemáticas)">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-math"></use></svg>
          <span>Matemáticas</span>
        </span>`;
    } else if (currentSection === 'reading') {
      sectionBadgeHtml = `
        <span class="header-section-badge header-section-badge--reading" title="Módulo actual: La Pluma de la Fluidez (Lectura)">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-reading"></use></svg>
          <span>Lectura</span>
        </span>`;
    } else if (currentSection === 'wardrobe') {
      sectionBadgeHtml = `
        <span class="header-section-badge header-section-badge--wardrobe" title="Módulo actual: Ropero Mágico de Lumiria">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-wardrobe"></use></svg>
          <span>Ropero</span>
        </span>`;
    } else if (currentSection === 'campaign') {
      sectionBadgeHtml = `
        <span class="header-section-badge header-section-badge--campaign" title="Módulo actual: La Gran Aventura (Los 10 Templos)">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-rocket"></use></svg>
          <span>Aventura</span>
        </span>`;
    } else if (currentSection === 'story') {
      sectionBadgeHtml = `
        <span class="header-section-badge header-section-badge--story" title="Módulo actual: El Gran Libro de las Princesas">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
          <span>Cuentos</span>
        </span>`;
    }

    this.innerHTML = `
    <!-- App Header (Optimizado Mobile-First) -->
    <header class="app-header" role="banner">
      <!-- Fila Superior: Identidad (Logo + Nombre + Badge de Módulo) -->
      <div class="header-brand-row">
        <a href="./" id="header-brand-link" class="brand" style="text-decoration:none; color:inherit; cursor:pointer;" title="Volver al Salón Principal (ValenQuest)">
          <span class="brand-icon" aria-hidden="true" style="overflow: hidden; padding: 0; background: #F5EEFA;">
            <img src="assets/emblem-valen.png" alt="ValenQuest" class="brand-emblem-img" width="38" height="38" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">
          </span>
          <div class="brand-info">
            <h1 class="brand-title">ValenQuest</h1>
          </div>
        </a>
        ${sectionBadgeHtml}
      </div>

      <!-- Fila de Utilidades: Balances a la izquierda + Botones de Acción juntos a la derecha -->
      <div class="header-tools-row">
        <!-- Balances del Jugador (Estrellas de Lumiria) en el Header -->
        <div class="header-balances-pill" title="Tus Estrellas de Lumiria" aria-label="Estrellas del jugador">
          <span class="header-balance-item" title="Estrellas de Campaña">
            <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg>
            <span id="player-stars-count">0</span>
          </span>
        </div>

        <!-- Dock de Acciones y Herramientas Mágicas -->
        <div class="header-actions" aria-label="Herramientas y ajustes mágicos">
          <!-- Conocer a las Heroínas (Redirección a La Gran Aventura) -->
          <a href="campaign.html#heroines-section" id="btn-header-heroines" class="icon-btn ${currentSection === 'campaign' ? 'active' : ''}" aria-label="Conocer a las Heroínas" title="Conocer a las 4 Heroínas de Lumiria">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-heroine-valen"></use></svg>
          </a>

          <!-- Historia del Reino (Redirección al Gran Libro de las Princesas) -->
          <a href="story.html" id="btn-show-intro" class="icon-btn ${currentSection === 'story' ? 'active' : ''}" aria-label="Historia de Lumiria" title="Ver el Gran Libro de las Princesas">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
          </a>

          <!-- Botón de Configuración & Ajustes Mágicos (Tema, Sonido, Voz, App) -->
          <button id="btn-open-settings" class="icon-btn" aria-label="Ajustes y configuración" title="Configuración de sonido, tema y aplicación">
            <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-settings"></use></svg>
          </button>
        </div>
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
            <button id="btn-toggle-mute" class="icon-btn active" aria-label="Alternar efectos de sonido" title="Efectos mágicos activos">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>
            </button>
          </div>

          <!-- Fila: Cajita Musical de Lumiria (Música Ambiental Procedural) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>
                Cajita Musical
              </span>
              <span class="settings-item-desc">Melodía suave de las princesas de fondo</span>
            </div>
            <button id="btn-toggle-musicbox" class="icon-btn" aria-label="Alternar cajita musical" title="Activar cajita musical">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>
            </button>
          </div>

          <!-- Fila: Voz de Orión (Web Speech API) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-owl"></use></svg>
                Voz de Orión
              </span>
              <span class="settings-item-desc">El Sabio Búho narra los retos en voz alta</span>
            </div>
            <button id="btn-toggle-speech" class="icon-btn active" aria-label="Alternar voz de Orión" title="Voz de Orión activa">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-owl"></use></svg>
            </button>
          </div>

          <!-- Fila: Ritmo de Lectura de Orión (Velocidad de locución) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
                Ritmo de Lectura
              </span>
              <span class="settings-item-desc">Velocidad del búho para acompañar la lectura</span>
            </div>
            <div class="settings-segmented-group" id="settings-speech-rate-group" role="group" aria-label="Velocidad de voz de Orión">
              <button type="button" class="segment-btn" data-rate="0.8" title="Lectura pausada y deliberada">Lenta</button>
              <button type="button" class="segment-btn active" data-rate="1.0" title="Lectura natural">Normal</button>
              <button type="button" class="segment-btn" data-rate="1.2" title="Lectura dinámica">Ágil</button>
            </div>
          </div>

          <!-- Fila: Modo Calma (Reducción de Movimiento & Estímulos) -->
          <div class="settings-item-row">
            <div class="settings-item-info">
              <span class="settings-item-label">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg>
                Modo Calma
              </span>
              <span class="settings-item-desc">Movimientos suaves y menor estímulo visual</span>
            </div>
            <button id="btn-toggle-calm" class="icon-btn" aria-label="Alternar modo calma" title="Activar movimientos suaves">
              <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-leaf"></use></svg>
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

          <!-- Fila: Reiniciar Aventura (Volver todo a cero con confirmación) -->
          <div class="settings-item-row settings-item-row--danger">
            <div class="settings-item-info">
              <span class="settings-item-label settings-item-label--danger">
                <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>
                Reiniciar Aventura
              </span>
              <span class="settings-item-desc">Borrar estrellas, diamantes y volver a cero</span>
            </div>
            <button id="btn-reset-progress" class="action-btn action-btn--danger" aria-label="Borrar todos los avances y volver a cero" title="Reiniciar todo el progreso a cero">
              Reiniciar
            </button>
          </div>
        </div>

        <div class="settings-footer">
          <button id="btn-settings-done" class="action-btn" style="width:100%; justify-content:center;">
            ¡Listo, guardar ajustes!
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Personalizado de Confirmación para Reiniciar Aventura -->
    <div id="confirm-reset-modal" class="modal-backdrop confirm-reset-backdrop" hidden role="dialog" aria-modal="true" aria-labelledby="confirm-reset-title">
      <div class="modal-content confirm-reset-content">
        <div class="confirm-reset-icon-wrap" aria-hidden="true">
          <svg class="vq-icon confirm-reset-icon" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>
        </div>
        <h3 id="confirm-reset-title" class="confirm-reset-title">¿Reiniciar Aventura Mágica?</h3>
        <p class="confirm-reset-text" id="confirm-reset-desc">
          Se borrarán tus <strong>estrellas ⭐</strong>, <strong>diamantes 💎</strong> y avances en los templos para comenzar una nueva historia desde cero.
        </p>
        <div class="confirm-reset-tip" id="confirm-reset-hint">
          <span>🛡️ Esta acción no se puede deshacer. Tus ajustes de tema y sonido se mantendrán.</span>
        </div>
        <div class="confirm-reset-actions" id="confirm-reset-actions">
          <button id="btn-cancel-reset" type="button" class="action-btn action-btn--secondary">
            No, seguir jugando
          </button>
          <button id="btn-confirm-reset" type="button" class="action-btn action-btn--danger">
            Sí, empezar de cero
          </button>
        </div>
      </div>
    </div>
    `;

    this.setupSettingsModal();
    this.syncBalances();
  }

  setupSettingsModal() {
    const modal = this.querySelector('#settings-modal');
    const btnOpen = this.querySelector('#btn-open-settings');
    const btnClose = this.querySelector('#btn-settings-close');
    const btnDone = this.querySelector('#btn-settings-done');
    const themeBtn = this.querySelector('#btn-toggle-theme');
    const muteBtn = this.querySelector('#btn-toggle-mute');
    const musicBoxBtn = this.querySelector('#btn-toggle-musicbox');
    const speechBtn = this.querySelector('#btn-toggle-speech');
    const speechRateGroup = this.querySelector('#settings-speech-rate-group');
    const calmBtn = this.querySelector('#btn-toggle-calm');
    const resetBtn = this.querySelector('#btn-reset-progress');
    const pwaBtn = this.querySelector('#btn-install-pwa');
    const pwaRow = this.querySelector('#settings-pwa-row');

    // Elementos del Modal Personalizado de Confirmación de Reinicio
    const confirmModal = this.querySelector('#confirm-reset-modal');
    const btnCancelReset = this.querySelector('#btn-cancel-reset');
    const btnConfirmReset = this.querySelector('#btn-confirm-reset');
    const confirmDesc = this.querySelector('#confirm-reset-desc');
    const confirmHint = this.querySelector('#confirm-reset-hint');

    if (themeBtn) {
      theme.bindButton(themeBtn);
    }

    // 1. Control de Efectos de Sonido
    const updateMuteBtn = () => {
      if (!muteBtn) return;
      const isMuted = sound.isMuted();
      const iconUse = muteBtn.querySelector('use');
      if (iconUse) {
        iconUse.setAttribute('href', isMuted ? '#vq-icon-sound-off' : '#vq-icon-sound-on');
      }
      muteBtn.classList.toggle('active', !isMuted);
      muteBtn.title = isMuted ? 'Efectos de sonido silenciados' : 'Efectos mágicos activos';
      muteBtn.setAttribute('aria-label', isMuted ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido');
    };
    updateMuteBtn();
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        sound.toggleMute();
        updateMuteBtn();
        if (!sound.isMuted()) sound.playClick();
      });
    }

    // 1.5. Control de Cajita Musical Global
    const updateMusicBoxBtn = () => {
      if (!musicBoxBtn) return;
      const isPlaying = sound.isMusicBoxActive();
      musicBoxBtn.classList.toggle('active', isPlaying);
      const iconUse = musicBoxBtn.querySelector('use');
      if (iconUse) {
        iconUse.setAttribute('href', isPlaying ? '#vq-icon-sound-on' : '#vq-icon-sparkles');
      }
      musicBoxBtn.title = isPlaying ? 'Cajita musical sonando (Pausar)' : 'Activar melodía de la cajita musical';
      musicBoxBtn.setAttribute('aria-label', isPlaying ? 'Pausar cajita musical' : 'Activar cajita musical');
    };
    updateMusicBoxBtn();
    sound.onMusicBoxChange(() => updateMusicBoxBtn());
    if (musicBoxBtn) {
      musicBoxBtn.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        sound.toggleMusicBox();
        updateMusicBoxBtn();
      });
    }

    // 2. Control de Voz de Orión (TTS)
    const updateSpeechBtn = () => {
      if (!speechBtn) return;
      const isEnabled = speech.isEnabled();
      speechBtn.classList.toggle('active', isEnabled);
      speechBtn.title = isEnabled ? 'Voz de Orión activa' : 'Voz de Orión silenciada';
      speechBtn.setAttribute('aria-label', isEnabled ? 'Desactivar voz de Orión' : 'Activar voz de Orión');
    };
    updateSpeechBtn();
    if (speechBtn) {
      speechBtn.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        const enabled = speech.toggle();
        updateSpeechBtn();
        if (enabled) {
          speech.speakOrion('¡Saludos! Soy Orión, el sabio búho.');
        }
      });
    }

    // 3. Ritmo de Lectura (Segmented Speed Buttons)
    if (speechRateGroup) {
      const currentRate = speech.getRate();
      const buttons = speechRateGroup.querySelectorAll('.segment-btn');
      buttons.forEach((btn) => {
        const r = parseFloat(btn.dataset.rate);
        if (Math.abs(r - currentRate) < 0.1) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        btn.addEventListener('click', () => {
          try { sound.playClick(); } catch (_) {}
          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          speech.setRate(r);
          if (speech.isEnabled()) {
            if (r < 0.9) speech.speak('Lectura pausada activada');
            else if (r > 1.1) speech.speak('Lectura ágil activada');
            else speech.speak('Lectura normal activada');
          }
        });
      });
    }

    // 4. Modo Calma (Reducción de Animaciones)
    const isCalmActive = () => document.documentElement.classList.contains('vq-calm-mode');
    const updateCalmBtn = () => {
      if (!calmBtn) return;
      const active = isCalmActive();
      calmBtn.classList.toggle('active', active);
      calmBtn.title = active ? 'Modo Calma activo (movimientos suaves)' : 'Modo Calma desactivado';
      calmBtn.setAttribute('aria-label', active ? 'Desactivar modo calma' : 'Activar modo calma');
    };

    if (typeof localStorage !== 'undefined' && localStorage.getItem('vq-calm-mode') === 'true') {
      document.documentElement.classList.add('vq-calm-mode');
    }
    updateCalmBtn();

    if (calmBtn) {
      calmBtn.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        const nowCalm = !isCalmActive();
        document.documentElement.classList.toggle('vq-calm-mode', nowCalm);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vq-calm-mode', nowCalm ? 'true' : 'false');
          }
        } catch (_) {}
        updateCalmBtn();
      });
    }

    // 5. Diálogo Personalizado de Reinicio de Aventura
    const openConfirmReset = () => {
      if (confirmModal) {
        sound.playClick();
        confirmModal.hidden = false;
        btnCancelReset?.focus();
      }
    };

    const closeConfirmReset = () => {
      if (confirmModal && !confirmModal.hidden) {
        sound.playClick();
        confirmModal.hidden = true;
        resetBtn?.focus();
      }
    };

    if (resetBtn) {
      resetBtn.addEventListener('click', openConfirmReset);
    }

    if (btnCancelReset) {
      btnCancelReset.addEventListener('click', closeConfirmReset);
    }

    confirmModal?.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeConfirmReset();
      }
    });

    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', async () => {
        btnConfirmReset.disabled = true;
        if (btnCancelReset) btnCancelReset.disabled = true;
        btnConfirmReset.textContent = 'Borrando...';
        if (confirmDesc) {
          confirmDesc.innerHTML = '✨ <em>Restableciendo el reino y las constelaciones...</em>';
        }
        if (confirmHint) {
          confirmHint.innerHTML = '<span>🌟 ¡Todo listo para un nuevo comienzo! Redirigiendo...</span>';
        }

        try {
          await db.resetAllProgress();
          try { sound.playSparkle(); } catch (_) {}
          setTimeout(() => {
            window.location.href = './';
          }, 850);
        } catch (err) {
          console.error('[ValenQuest Settings] Error al reiniciar progreso:', err);
          btnConfirmReset.disabled = false;
          if (btnCancelReset) btnCancelReset.disabled = false;
          btnConfirmReset.textContent = 'Sí, empezar de cero';
          if (confirmDesc) {
            confirmDesc.innerHTML = '⚠️ No se pudo completar el reinicio. Intenta nuevamente.';
          }
        }
      });
    }

    // Apertura y Cierre de Modal de Ajustes
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


    const btnHeroines = this.querySelector('#btn-header-heroines');
    if (btnHeroines) {
      btnHeroines.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
      });
    }

    const btnStory = this.querySelector('#btn-show-intro');
    if (btnStory) {
      btnStory.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
      });
    }

    // Cerrar al pulsar sobre el fondo oscuro (backdrop)
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (confirmModal && !confirmModal.hidden) {
          closeConfirmReset();
        } else if (modal && !modal.hidden) {
          closeModal();
        }
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

  async syncBalances() {
    try {
      const profile = await db.getProfile();
      const stars = typeof profile?.stars === 'number' ? profile.stars : 0;
      const diamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;

      const starSelectors = '#player-stars-count, #math-star-balance, #reading-star-balance, #wardrobe-star-balance, #campaign-star-balance, #campaign-wardrobe-stars';
      const diamondSelectors = '#math-diamond-balance, #reading-diamond-balance';

      document.querySelectorAll(starSelectors).forEach((el) => {
        el.textContent = stars;
      });
      document.querySelectorAll(diamondSelectors).forEach((el) => {
        el.textContent = diamonds;
      });
    } catch (_) {}
  }
}

if (!customElements.get('vq-header')) {
  customElements.define('vq-header', VqHeader);
}
