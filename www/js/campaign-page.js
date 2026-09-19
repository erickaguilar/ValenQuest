/**
 * ValenQuest: Controlador del Modo Campaña (campaign-page.js)
 * Maneja la presentación de La Gran Aventura de Lumiria,
 * la selección interactiva del Cuarteto de la Armonía y el roadmap de los 10 Templos.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { adventure } from './services/adventure.js';
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
    speech.speakHeroine(this.activeHeroineId, `¡Bienvenida ${hero.name}! La Gran Aventura abrirá muy pronto. Explora el mapa y entrena tus poderes.`);
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
      speech.speakHeroine(id, `¡Hola, soy ${hero.name}! ${hero.voiceQuote || hero.title}`);
    }
  }

  // =========================================================================
  // Renderizado de Información y Diálogo Gacha
  // =========================================================================
  renderBalances(profile) {
    const stars = profile?.stars || 0;

    document.querySelectorAll('#player-stars-count, #campaign-star-balance, #campaign-wardrobe-stars').forEach((el) => {
      el.textContent = stars;
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
    const completed = Boolean(advState?.campaignCompleted);
    const templePill = document.getElementById('campaign-current-temple-pill');
    if (templePill) {
      const name = advState?.templeName || 'Manantial de Rocío';
      templePill.textContent = completed
        ? '¡Lumiria a salvo! Los 10 templos brillan'
        : `Templo Activo: ${currentTempleNum} - ${name}`;
    }

    // Botón principal: jugar el templo vigente en la arena matemática.
    const playBtn = document.getElementById('btn-play-temple');
    const playText = document.getElementById('btn-play-temple-text');
    if (playBtn) {
      playBtn.setAttribute('href', 'math.html?campaign=1');
      playBtn.setAttribute('aria-label', completed
        ? 'Seguir jugando la campaña (Lumiria a salvo)'
        : `Jugar el Templo ${currentTempleNum} de la campaña`);
    }
    if (playText) {
      playText.textContent = completed
        ? '¡Seguir jugando en Lumiria! ⚔️'
        : `¡Jugar Templo ${currentTempleNum}! ⚔️`;
    }

    // Roadmap: estado real por tarjeta (purificado / activo / por liberar).
    try {
      const cards = document.querySelectorAll('.temple-roadmap-grid .temple-card');
      cards.forEach((card, idx) => {
        const templeNum = idx + 1;
        const tag = card.querySelector('.temple-status-tag');
        if (!tag) return;
        card.classList.toggle('temple-purified', completed || templeNum < currentTempleNum);
        card.classList.toggle('temple-active', !completed && templeNum === currentTempleNum);
        if (completed || templeNum < currentTempleNum) {
          tag.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Purificado</span>';
        } else if (templeNum === currentTempleNum) {
          tag.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-rocket"></use></svg> <span>Templo activo</span>';
        } else {
          tag.innerHTML = '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg> <span>Por liberar</span>';
        }
      });
    } catch (err) {
      console.warn('Campaign roadmap:', err?.message || err);
    }
  }

  setupSpeechButton() {
    // 1. Voz de Orión en el banner
    const btnSpeakCampaign = document.getElementById('btn-speak-campaign');
    if (btnSpeakCampaign) {
      btnSpeakCampaign.addEventListener('click', () => {
        sound.playClick();
        const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
        speech.speakOrion(
          `¡Saludos, ${hero.name}! El Sabio Búho Orión te informa: los 10 Templos Lunares se están puliendo. Entrena en el Prisma Numérico y la Pluma de la Fluidez: tus diamantes te esperarán en la gran apertura.`
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
          speech.speakHeroine(this.activeHeroineId, textEl.innerText || textEl.textContent);
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
    document.querySelectorAll('.training-cta-btn, .campaign-back-btn, .campaign-footer-cta, .gacha-story-link, .campaign-wardrobe-btn, .gacha-wardrobe-link').forEach((btn) => {
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
