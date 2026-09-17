/**
 * KidsLearn-WASM UI Hub Controller (app.js)
 * Orquestador del Salón Principal y Selección de Heroínas (index.html).
 * Desacoplado: Cada página curricular (math.html, reading.html, campaign.html,
 * wardrobe.html, story.html) posee su propio controlador independiente.
 */

import { loadWasm } from './services/wasm-loader.js';
import { sound } from './services/audio.js';
import { db } from './services/storage.js';
import { speech } from './services/speech.js';
import { companions, HEROINES } from './services/companions.js';
import { pwa } from './services/pwa.js';
import { loadLevelsData } from './data/levels-data.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';
import { adventure } from './services/adventure.js';
import { mathPractice } from './services/math-practice.js';
import { readingPractice } from './services/reading-practice.js';
import { portalController } from './controllers/portal-controller.js';

// Web Components modulares de UI (Header y Footer)
import './components/header.js';
import './components/footer.js';

export const APP_VERSION = '1.1.0';

class KidsLearnApp {
  constructor() {
    this.wasm = null;
    this.currentStoryText = '';
  }

  async init() {
    console.log(`🌟 [ValenQuest] Initializing Hub Application v${APP_VERSION} in Lumiria...`);

    // 1. Redirección inmediata para enlaces o marcadores antiguos con query params
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'math') {
      window.location.replace('math.html');
      return;
    } else if (modeParam === 'reading') {
      window.location.replace('reading.html');
      return;
    } else if (modeParam === 'campaign') {
      window.location.replace('campaign.html');
      return;
    }

    // 2. Configurar listeners de la UI y tema
    this.setupEventListeners();
    this.syncThemeButton();

    try {
      await loadSvgSprites();
      this.wasm = await loadWasm();
      await loadLevelsData();
      portalController.init();

      const profile = await db.getProfile();

      // Ocultar modales en arranque
      const levelModal = document.getElementById('level-up-modal');
      if (levelModal) levelModal.hidden = true;
      const portalModal = document.getElementById('portal-challenge-modal');
      if (portalModal) portalModal.hidden = true;
      const actModal = document.getElementById('act-transition-modal');
      if (actModal) actModal.hidden = true;
      const powersGuideModal = document.getElementById('powers-guide-modal');
      if (powersGuideModal) powersGuideModal.hidden = true;

      // Cargar estado de guardianas
      await companions.loadState();

      // Vincular animación de la burbuja de diálogo con la síntesis de voz
      speech.onSpeakingChange((speaking) => {
        const bubble = document.getElementById('intro-dialogue-bubble');
        if (bubble) bubble.classList.toggle('vq-anim-speaking', speaking);
        const speechBtn = document.getElementById('btn-speak-intro');
        if (speechBtn) speechBtn.classList.toggle('vq-anim-speaking', speaking);
      });

      // Hook companion powers badges updates
      companions.onChange(() => this.updatePowersBadges());

      // Restaurar heroína activa
      const activeCompanionId = profile?.selectedCompanion || companions.activeId || 'valen';
      await companions.setActive(activeCompanionId, false);
      this.syncActiveCompanionUI(activeCompanionId);

      // Cargar balances e indicadores de los módulos
      await this.syncTriadUI();

      // Configurar Modal de Guía de Poderes
      this.setupPowersGuideModal();

      // Inicializar motor PWA
      pwa.init();

      console.log('🚀 [ValenQuest] Hub ready with Heroines Quartet & Modular Navigation!');
    } catch (err) {
      console.error('Fatal initialization error in Hub:', err);
    }
  }

  updatePowersBadges() {
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const badge = document.getElementById(`badge-${id}`);
      if (badge) {
        badge.textContent = companions.getCharges(id);
      }
    });
  }

  syncThemeButton() {
    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      theme.bindButton(btn);
    }
  }

  setupEventListeners() {
    // 1. Selector interactivo del Cuarteto de la Armonía
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const card = document.getElementById(`card-heroine-${id}`);
      if (card) {
        card.addEventListener('click', () => {
          this.selectCompanion(id);
        });
      }
    });

    // 2. Botón de narración del mensaje de bienvenida
    const btnSpeakIntro = document.getElementById('btn-speak-intro');
    if (btnSpeakIntro) {
      btnSpeakIntro.addEventListener('click', () => {
        const textEl = document.getElementById('intro-dialogue-text');
        if (textEl) {
          speech.speak(textEl.innerText || textEl.textContent);
        }
      });
    }

    // 3. Selectores de nivel de Matemáticas en el Salón Principal
    document.querySelectorAll('#math-level-chips .level-chip-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        sound.playClick();
        const lvl = Number(e.currentTarget.dataset.level) || 1;
        await mathPractice.setLevel(lvl);
        this.updateMathChipsUI(lvl);
      });
    });

    // 4. Selectores de nivel de Lectura en el Salón Principal
    document.querySelectorAll('#reading-level-chips .level-chip-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        sound.playClick();
        const lvl = Number(e.currentTarget.dataset.level) || 1;
        await readingPractice.setLevel(lvl);
        this.updateReadingChipsUI(lvl);
      });
    });

    // 5. Efectos de sonido en los botones de acción de entrada
    const btnStartQuest = document.getElementById('btn-start-quest');
    if (btnStartQuest) {
      btnStartQuest.addEventListener('click', () => sound.playLevelUp());
    }

    const btnIntroMath = document.getElementById('btn-intro-goto-math');
    if (btnIntroMath) {
      btnIntroMath.addEventListener('click', () => sound.playClick());
    }

    const btnIntroReading = document.getElementById('btn-intro-goto-reading');
    if (btnIntroReading) {
      btnIntroReading.addEventListener('click', () => sound.playClick());
    }

    // 6. Botón de instalación PWA en el banner
    const btnBannerInstall = document.getElementById('btn-banner-install');
    if (btnBannerInstall) {
      btnBannerInstall.addEventListener('click', () => {
        sound.playClick();
        pwa.promptInstall();
      });
    }
  }

  updateMathChipsUI(lvl) {
    const masteredLevels = mathPractice.masteredLevels || [];
    document.querySelectorAll('#math-level-chips .level-chip-btn').forEach((btn) => {
      const chipLvl = Number(btn.dataset.level);
      const active = chipLvl === lvl;
      const isMastered = masteredLevels.includes(chipLvl);
      btn.classList.toggle('active', active);
      btn.classList.toggle('mastered', isMastered);
      btn.classList.remove('locked');
      btn.removeAttribute('aria-disabled');
      if (isMastered) {
        btn.innerHTML = `${chipLvl}<span>👑</span>`;
        btn.title = `Nivel ${chipLvl} (¡Coronado 100%! Puedes seguir practicando)`;
      } else {
        btn.innerHTML = `${chipLvl}`;
        btn.title = `Nivel ${chipLvl}`;
      }
    });
    const summary = document.getElementById('math-level-summary');
    if (summary) {
      const lvlInfo = mathPractice.getCurrentLevelInfo();
      summary.textContent = `✨ Nivel ${lvlInfo.level}: ${lvlInfo.name} (${lvlInfo.subtitle})`;
    }
  }

  updateReadingChipsUI(lvl) {
    document.querySelectorAll('#reading-level-chips .level-chip-btn').forEach((btn) => {
      const chipLvl = Number(btn.dataset.level);
      const active = chipLvl === lvl;
      btn.classList.toggle('active', active);
      btn.classList.remove('locked');
      btn.removeAttribute('aria-disabled');
    });
    const summary = document.getElementById('reading-level-summary');
    if (summary) {
      const lvlInfo = readingPractice.getCurrentLevelInfo();
      summary.textContent = `💧 Nivel ${lvlInfo.level}: ${lvlInfo.name} (${lvlInfo.subtitle})`;
    }
  }

  async syncTriadUI() {
    // 1. Estado de la Campaña (Aventura)
    const advState = await adventure.loadState();
    const templeDisplay = document.getElementById('adventure-temple-display');
    if (templeDisplay) {
      templeDisplay.textContent = `Templo ${advState.currentTemple}: ${advState.templeName}`;
    }

    // 2. Estado del Prisma Numérico
    await mathPractice.loadState();
    const mathLvl = mathPractice.selectedLevel || mathPractice.currentLevel || 1;
    this.updateMathChipsUI(mathLvl);

    // 3. Estado de la Pluma de la Fluidez
    await readingPractice.loadState();
    const readLvl = readingPractice.selectedLevel || readingPractice.currentLevel || 1;
    this.updateReadingChipsUI(readLvl);
  }

  selectCompanion(id, speak = true) {
    companions.setActive(id);
    this.syncActiveCompanionUI(id);
    sound.playClick();

    if (speak) {
      const hero = HEROINES[id] || HEROINES.valen;
      speech.speak(`¡Hola, soy ${hero.name}! ${hero.description}`);
    }
  }

  syncActiveCompanionUI(id) {
    const hero = HEROINES[id] || HEROINES.valen;

    // Actualizar selección visual en la cuadrícula de heroínas
    ['valen', 'reni', 'zoe', 'lia'].forEach((heroId) => {
      const card = document.getElementById(`card-heroine-${heroId}`);
      if (card) {
        card.classList.toggle('active-companion', heroId === id);
      }
    });

    // Actualizar avatar y título en la cabecera
    const studentAvatar = document.getElementById('student-avatar');
    const studentName = document.getElementById('student-name');
    if (studentAvatar) {
      studentAvatar.innerHTML = `<svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#${hero.iconSymbol || 'vq-icon-star'}"></use></svg>`;
    }
    if (studentName) {
      studentName.textContent = hero.name;
    }

    // Actualizar globo de diálogo estilo Gacha Life
    const speakerAvatar = document.getElementById('gacha-speaker-avatar');
    const speakerName = document.getElementById('gacha-speaker-name');
    const speakerRole = document.getElementById('gacha-speaker-role');
    const dialogueText = document.getElementById('intro-dialogue-text');

    if (speakerAvatar) {
      speakerAvatar.innerHTML = `<svg class="vq-icon" aria-hidden="true"><use href="#vq-heroine-${hero.id}"></use></svg>`;
    }
    if (speakerName) {
      speakerName.textContent = hero.name;
    }
    if (speakerRole) {
      speakerRole.textContent = `${hero.race} • ${hero.title}`;
    }
    if (dialogueText) {
      const quotes = {
        valen: '«¡Las constelaciones de <strong>Lumiria</strong> nos llaman! El <strong>Velo de la Duda</strong> de la Emperatriz Eclipse ha dispersado los diez sellos estelares. Con el <strong>Cuarteto de la Armonía</strong> y el poder de la amistad, resolveremos cada enigma para encender todas las estrellas. ¡Elige tu misión y comencemos!»',
        reni: '«¡Siente la brisa fresca de las nubes! Mi <strong>Brisa Temporal</strong> te dará todo el tiempo del mundo para pensar con calma. ¡Ningún reto es demasiado rápido cuando volamos juntas!»',
        zoe: '«¡La arboleda sagrada nos protege! Con mi <strong>Escudo de Raíces</strong> nunca perderás tu racha y descubriremos el secreto de cada número paso a pasito. ¡La paciencia florece en sabiduría!»',
        lia: '«¡Los cristales del palacio refractan la verdad! Mi <strong>Foco de Cristal</strong> iluminará la pista clave de cada problema matemático y de lectura. ¡La magia de aprender es infinita!»'
      };
      dialogueText.innerHTML = quotes[id] || quotes.valen;
    }
  }

  setupPowersGuideModal() {
    const modal = document.getElementById('powers-guide-modal');
    const openBtn = document.getElementById('btn-open-powers-guide');
    const closeBtn = document.getElementById('powers-guide-close');
    const tabBtns = document.querySelectorAll('.power-guide-tab-btn');
    const heroPanels = document.querySelectorAll('.power-guide-hero');

    if (!modal) return;

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sound.playClick();
        modal.hidden = false;
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        modal.hidden = true;
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
      }
    });

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetHero = e.currentTarget.dataset.hero;
        sound.playClick();

        tabBtns.forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        heroPanels.forEach((panel) => {
          panel.hidden = panel.id !== `guide-hero-${targetHero}`;
        });
      });
    });
  }
}

// Inicialización automática
const app = new KidsLearnApp();
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
}

export { app };
