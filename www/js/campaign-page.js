/**
 * ValenQuest: Controlador del Modo Campaña (campaign-page.js)
 * Maneja la presentación de La Gran Aventura de Lumiria,
 * la selección interactiva del Cuarteto de la Armonía y el roadmap de los 10 Templos.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { adventure, TEMPLE_NAMES } from './services/adventure.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

class CampaignPageController {
  constructor() {
    this.activeHeroineId = 'valen';
  }

  async init() {
    console.log('🏰 [ValenQuest] Inicializando Modo Campaña (La Gran Aventura)...');
    await loadSvgSprites();

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

    // 5. Configurar selector interactivo de heroínas
    this.setupHeroinesSelector();

    // 6. Configurar botones de narración por voz y animación
    this.setupSpeechButton();

    // 7. Efectos de audio en enlaces y botones
    this.setupAudioClicks();

    // Saludo inicial suave
    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
    speech.speak(`¡Bienvenida ${hero.name}! La Gran Aventura de Lumiria está en preparación mágica. ¡Pronto abriremos los 10 Templos!`);
  }

  // =========================================================================
  // Controles de Cabecera (Tema & Audio)
  // =========================================================================
  // Controles de Cabecera (Gestionados por el Web Component <vq-header>)
  // =========================================================================
  setupHeaderControls() {
    // Gestionado automáticamente por <vq-header>
  }

  syncThemeButton() {
    theme.syncButton();
  }

  // =========================================================================
  // Selector del Cuarteto de la Armonía
  // =========================================================================
  setupHeroinesSelector() {
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const card = document.getElementById(`card-heroine-${id}`);
      if (card) {
        card.addEventListener('click', () => {
          this.selectHeroine(id, true);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectHeroine(id, true);
          }
        });
      }
    });
  }

  async selectHeroine(id, speak = true) {
    this.activeHeroineId = id;
    await companions.setActive(id);
    this.renderHeroineInfo();
    sound.playClick();

    if (speak) {
      const hero = HEROINES[id] || HEROINES.valen;
      speech.speak(`¡Hola, soy ${hero.name}! ${hero.voiceQuote || hero.title}`);
    }
  }

  // =========================================================================
  // Renderizado de Información y Diálogo Gacha
  // =========================================================================
  renderBalances(profile) {
    const stars = profile?.stars || 0;
    const diamonds = typeof profile?.diamonds === 'number' ? profile.diamonds : 0;

    document.querySelectorAll('#player-stars-count, #campaign-star-balance').forEach((el) => {
      el.textContent = stars;
    });
    document.querySelectorAll('#player-diamonds-count, #campaign-diamond-balance').forEach((el) => {
      el.textContent = diamonds;
    });
  }

  renderHeroineInfo() {
    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;

    // 1. Tarjeta de diálogo de Orión
    const nameEl = document.getElementById('campaign-heroine-name');
    if (nameEl) nameEl.textContent = hero.name;

    const avatarEl = document.getElementById('campaign-heroine-avatar');
    if (avatarEl && hero.symbolId) {
      avatarEl.innerHTML = `<svg class="vq-icon" aria-hidden="true"><use href="#${hero.symbolId}"></use></svg>`;
    }

    // 2. Cuadrícula de heroínas: clase activa
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const card = document.getElementById(`card-heroine-${id}`);
      if (card) {
        card.classList.toggle('active-companion', id === this.activeHeroineId);
      }
    });

    // 3. Globo de diálogo Chibi estilo Gacha Life
    const speakerAvatar = document.getElementById('gacha-speaker-avatar');
    if (speakerAvatar) {
      speakerAvatar.innerHTML = `<svg class="vq-icon" aria-hidden="true"><use href="#vq-heroine-${hero.id}"></use></svg>`;
    }

    const speakerName = document.getElementById('gacha-speaker-name');
    if (speakerName) {
      speakerName.textContent = hero.name;
    }

    const speakerRole = document.getElementById('gacha-speaker-role');
    if (speakerRole) {
      speakerRole.textContent = `${hero.raceName || hero.race} • ${hero.title}`;
    }

    const dialogueText = document.getElementById('intro-dialogue-text');
    if (dialogueText) {
      const quotes = {
        valen: '«¡Las constelaciones de <strong>Lumiria</strong> nos llaman! El <strong>Velo de la Duda</strong> de la Emperatriz Eclipse ha dispersado los diez sellos estelares. Con el <strong>Cuarteto de la Armonía</strong> y el poder de la amistad, resolveremos cada enigma para encender todas las estrellas. ¡Elige a tu compañera y comencemos la misión!»',
        reni: '«¡Siente la brisa fresca de las nubes! Mi <strong>Brisa Temporal</strong> te dará todo el tiempo del mundo para pensar con calma. ¡Ningún reto es demasiado rápido cuando volamos juntas!»',
        zoe: '«¡La arboleda sagrada nos protege! Con mi <strong>Escudo de Raíces</strong> nunca perderás tu racha y descubriremos el secreto de cada número paso a pasito. ¡La paciencia florece en sabiduría!»',
        lia: '«¡Los cristales del palacio refractan la verdad! Mi <strong>Foco de Cristal</strong> iluminará la pista clave de cada problema matemático y de lectura. ¡La magia de aprender es infinita!»'
      };
      dialogueText.innerHTML = quotes[this.activeHeroineId] || quotes.valen;
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
    // 1. Voz de Orión en el banner
    const btnSpeakCampaign = document.getElementById('btn-speak-campaign');
    if (btnSpeakCampaign) {
      btnSpeakCampaign.addEventListener('click', () => {
        sound.playClick();
        const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
        speech.speak(
          `¡Saludos, ${hero.name}! El Sabio Búho Orión te informa: La Gran Aventura con los 10 Templos Lunares está en construcción mágica. Mientras los portales se alinean, entrena tus poderes en el Prisma Numérico y la Pluma de la Fluidez.`
        );
      });
    }

    // 2. Voz de la Heroína en el globo Chibi Gacha
    const btnSpeakIntro = document.getElementById('btn-speak-intro');
    if (btnSpeakIntro) {
      btnSpeakIntro.addEventListener('click', () => {
        sound.playClick();
        const textEl = document.getElementById('intro-dialogue-text');
        if (textEl) {
          speech.speak(textEl.innerText || textEl.textContent);
        }
      });
    }

    // 3. Animación de habla sincronizada
    speech.onSpeakingChange((speaking) => {
      const bubble = document.getElementById('intro-dialogue-bubble');
      if (bubble) bubble.classList.toggle('vq-anim-speaking', speaking);
      if (btnSpeakIntro) btnSpeakIntro.classList.toggle('vq-anim-speaking', speaking);
    });
  }

  setupAudioClicks() {
    document.querySelectorAll('.training-cta-btn, .campaign-back-btn, .campaign-footer-cta, .gacha-story-link').forEach((btn) => {
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
