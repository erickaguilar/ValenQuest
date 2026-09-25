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
import { companions, HEROINES, getIntroDialogue } from './services/companions.js';
import { pwa } from './services/pwa.js';
import { loadLevelsData } from './data/levels-data.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';
import { adventure } from './services/adventure.js';
import { mathPractice } from './services/math-practice.js';
import { readingPractice } from './services/reading-practice.js';
import { portalController } from './controllers/portal-controller.js';
import { getWelcomeHeadlineHtml, getPersonalizedVoiceGreeting } from './services/profile-format.js';

// Web Components modulares de UI (Header y Footer)
import './components/header.js';
import './components/footer.js';

export const APP_VERSION = '2.2.0';

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

      // Configurar Modal de Iniciación / Onboarding
      this.setupOnboardingModal(profile);

      // Personalizar saludo del Salón Principal y velocidad de voz
      this.updateWelcomeTitle(profile);
      if (profile?.age) {
        speech.calibrateRateForAge(profile.age);
      }

      // Escuchar actualizaciones de perfil en vivo
      window.addEventListener('vq-profile-updated', (e) => {
        const updatedProfile = e.detail;
        if (updatedProfile) {
          this.updateWelcomeTitle(updatedProfile);
          if (updatedProfile.age) {
            speech.calibrateRateForAge(updatedProfile.age);
          }
        }
      });

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

  updateWelcomeTitle(profile) {
    const titleEl = document.getElementById('journey-welcome-title');
    if (titleEl && profile) {
      titleEl.innerHTML = getWelcomeHeadlineHtml(profile);
    }
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

    // 3. Efectos de sonido en los botones de acción de entrada
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

  async syncTriadUI() {
    // 1. Estado de la Campaña (Aventura)
    const advState = await adventure.loadState();
    const templeDisplay = document.getElementById('adventure-temple-display');
    if (templeDisplay) {
      templeDisplay.textContent = `Templo ${advState.currentTemple}: ${advState.templeName}`;
    }

    // 2. Estado del Prisma Numérico
    await mathPractice.loadState();

    // 3. Estado de la Pluma de la Fluidez
    await readingPractice.loadState();
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
      dialogueText.innerHTML = getIntroDialogue(id);
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

  setupOnboardingModal(profile) {
    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;

    const form = document.getElementById('onboarding-form');
    const nameInput = document.getElementById('onboarding-input-name');
    const clearBtn = document.getElementById('btn-onboarding-clear-name');
    const quickBtns = modal.querySelectorAll('.onboarding-quick-btn');
    const genderCards = modal.querySelectorAll('.onboarding-gender-card');
    const ageBubbles = modal.querySelectorAll('.onboarding-age-bubble');
    const companionCards = modal.querySelectorAll('.onboarding-companion-card');

    let selectedGender = profile?.gender || 'neutral';
    let selectedAge = typeof profile?.age === 'number' ? profile.age : 7;
    let selectedCompanion = profile?.selectedCompanion || 'valen';

    // Rellenar nombre si ya existía y no es el genérico
    if (nameInput && profile?.name && profile.name !== 'Aventurero') {
      nameInput.value = profile.name;
      if (clearBtn) clearBtn.hidden = false;
    }

    // Input handlers
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (clearBtn) clearBtn.hidden = !nameInput.value;
      });
    }

    if (clearBtn && nameInput) {
      clearBtn.addEventListener('click', () => {
        nameInput.value = '';
        clearBtn.hidden = true;
        nameInput.focus();
        try { sound.playClick(); } catch (_) {}
      });
    }

    // Quick names
    quickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (nameInput) {
          nameInput.value = btn.dataset.name;
          if (clearBtn) clearBtn.hidden = false;
          try { sound.playClick(); } catch (_) {}
        }
      });
    });

    // Gender selection
    genderCards.forEach((card) => {
      if (card.dataset.gender === selectedGender) {
        genderCards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
      }

      card.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        genderCards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        selectedGender = card.dataset.gender;
      });
    });

    // Age bubbles
    ageBubbles.forEach((bubble) => {
      if (parseInt(bubble.dataset.age, 10) === selectedAge) {
        ageBubbles.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        bubble.classList.add('active');
        bubble.setAttribute('aria-checked', 'true');
      }

      bubble.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        ageBubbles.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        bubble.classList.add('active');
        bubble.setAttribute('aria-checked', 'true');
        selectedAge = parseInt(bubble.dataset.age, 10);
      });
    });

    // Companion selection
    companionCards.forEach((card) => {
      if (card.dataset.companion === selectedCompanion) {
        companionCards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
      }

      card.addEventListener('click', () => {
        try { sound.playClick(); } catch (_) {}
        companionCards.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        selectedCompanion = card.dataset.companion;
      });
    });

    // Submit handler
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawName = nameInput ? nameInput.value.trim() : '';
        const finalName = rawName || 'Aventurero';

        const updated = await db.savePlayerIdentity({
          name: finalName,
          gender: selectedGender,
          age: selectedAge,
          selectedCompanion,
        });

        // Activar heroína elegida si difiere de la actual
        if (selectedCompanion && selectedCompanion !== companions.activeId) {
          await companions.setActive(selectedCompanion, true);
          this.syncActiveCompanionUI(selectedCompanion);
        }

        modal.hidden = true;
        try { sound.playLevelUp(); } catch (_) {}

        window.dispatchEvent(new CustomEvent('vq-profile-updated', { detail: updated }));

        if (speech.isEnabled()) {
          const heroine = HEROINES[selectedCompanion] || HEROINES.valen;
          speech.speak(getPersonalizedVoiceGreeting(updated, heroine.name));
        }
      });
    }

    // Escape listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) {
        modal.hidden = true;
      }
    });

    // Comprobar si necesita mostrarse
    if (!profile?.onboardingCompleted) {
      modal.hidden = false;
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 300);
      }
    } else {
      modal.hidden = true;
    }
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
