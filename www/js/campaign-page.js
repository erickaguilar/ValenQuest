/**
 * ValenQuest: Controlador del Modo Campaña (campaign-page.js)
 * Maneja la presentación de La Gran Aventura de Lumiria,
 * la visualización del estado de construcción y el roadmap de los 10 Templos.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { adventure, TEMPLE_NAMES } from './services/adventure.js';
import { theme } from './services/theme.js';

class CampaignPageController {
  constructor() {
    this.activeHeroineId = 'valen';
  }

  async init() {
    console.log('🏰 [ValenQuest] Inicializando Modo Campaña (La Gran Aventura)...');

    // 1. Configurar eventos de cabecera y controles
    this.setupHeaderControls();

    // 2. Cargar estado de guardianas y perfil
    await companions.loadState();
    const profile = await db.getProfile();
    if (profile?.selectedCompanion) {
      this.activeHeroineId = profile.selectedCompanion;
    } else if (companions.activeId) {
      this.activeHeroineId = companions.activeId;
    }

    // 3. Cargar estado de la aventura desde IndexedDB
    const advState = await adventure.loadState();

    // 4. Renderizar balances y detalles en la vista
    this.renderBalances(profile);
    this.renderHeroineInfo();
    this.renderTempleRoadmap(advState);

    // 5. Configurar botón de narración por voz
    this.setupSpeechButton();

    // 6. Efectos de audio en enlaces y botones
    this.setupAudioClicks();

    // Saludo inicial suave
    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
    speech.speak(`¡Bienvenida ${hero.name}! La Gran Aventura de Lumiria está en preparación mágica. ¡Pronto abriremos los 10 Templos!`);
  }

  // =========================================================================
  // Controles de Cabecera (Tema & Audio)
  // =========================================================================
  setupHeaderControls() {
    // Alternancia de tema Noche Astral / Día Pastel
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      theme.bindButton(themeBtn);
    }

    // Alternar silenciado de audio
    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        muteBtn.innerHTML = isMuted
          ? '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-off"></use></svg>'
          : '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg>';
        muteBtn.title = isMuted ? 'Activar sonido' : 'Silenciar sonido';
      });
    }
  }

  syncThemeButton() {
    theme.syncButton();
  }

  // =========================================================================
  // Renderizado de Información
  // =========================================================================
  renderBalances(profile) {
    const starEl = document.getElementById('campaign-star-balance');
    if (starEl) starEl.textContent = profile?.stars || 0;

    const diamondEl = document.getElementById('campaign-diamond-balance');
    if (diamondEl) diamondEl.textContent = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;
  }

  renderHeroineInfo() {
    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
    const nameEl = document.getElementById('campaign-heroine-name');
    if (nameEl) nameEl.textContent = hero.name;

    const avatarEl = document.getElementById('campaign-heroine-avatar');
    if (avatarEl && hero.symbolId) {
      avatarEl.innerHTML = `<svg class="vq-icon" aria-hidden="true"><use href="#${hero.symbolId}"></use></svg>`;
    }
  }

  renderTempleRoadmap(advState) {
    const currentTempleNum = advState?.currentTemple || 1;
    const templePill = document.getElementById('campaign-current-temple-pill');
    if (templePill) {
      const name = TEMPLE_NAMES[currentTempleNum - 1] || 'Manantial de Rocío';
      templePill.textContent = `Templo Activo: ${currentTempleNum} - ${name}`;
    }
  }

  setupSpeechButton() {
    const btnSpeak = document.getElementById('btn-speak-campaign');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        sound.playClick();
        const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
        speech.speak(
          `¡Saludos, ${hero.name}! El Sabio Búho Orión te informa: La Gran Aventura con los 10 Templos Lunares está en construcción mágica. Mientras los portales se alinean, entrena tus poderes en el Prisma Numérico y la Pluma de la Fluidez.`
        );
      });
    }
  }

  setupAudioClicks() {
    document.querySelectorAll('.training-cta-btn, .campaign-back-btn, .campaign-footer-cta').forEach((btn) => {
      btn.addEventListener('click', () => {
        try { sound.playClick(); } catch (e) {}
      });
    });
  }
}

// Inicialización automática
const controller = new CampaignPageController();
document.addEventListener('DOMContentLoaded', () => {
  controller.init();
});
