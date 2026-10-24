/**
 * ValenQuest - Controlador de Iniciación Real (onboarding-page.js)
 * Orquestador desacoplado para la página dedicada www/onboarding.html.
 * Garantiza ergonomía táctil infantil, retroalimentación auditiva y visual inmediata,
 * y navegación robusta y tolerante a fallos hacia el Salón Principal (index.html).
 */

import { loadSvgSprites } from './services/icons.js';
import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { getPersonalizedVoiceGreeting } from './services/profile-format.js';

class OnboardingPageController {
  constructor() {
    this.selectedGender = 'neutral';
    this.selectedAge = 7;
    this.selectedCompanion = 'valen';
    this.isSubmitting = false;
  }

  async init() {
    console.log('📜 [ValenQuest] Inicializando Iniciación Real en Lumiria...');
    try {
      await loadSvgSprites();
      const profile = await db.getProfile();
      await companions.loadState();

      if (profile) {
        if (profile.gender) this.selectedGender = profile.gender;
        if (typeof profile.age === 'number') this.selectedAge = profile.age;
        if (profile.selectedCompanion && HEROINES[profile.selectedCompanion]) {
          this.selectedCompanion = profile.selectedCompanion;
        }
      }

      this.setupDOM(profile);
      this.updateLivePreview();
      speech.calibrateRateForAge(this.selectedAge);
    } catch (err) {
      console.error('Error inicializando Iniciación Real:', err);
    }
  }

  setupDOM(profile) {
    const form = document.getElementById('onboarding-form');
    const submitBtn = document.getElementById('btn-onboarding-submit');
    const nameInput = document.getElementById('onboarding-input-name');
    const clearBtn = document.getElementById('btn-onboarding-clear-name');
    const quickBtns = document.querySelectorAll('.onboarding-quick-btn');
    const genderCards = document.querySelectorAll('.onboarding-gender-card');
    const ageBubbles = document.querySelectorAll('.onboarding-age-bubble');
    const companionCards = document.querySelectorAll('.onboarding-companion-card');
    const listenBtn = document.getElementById('btn-preview-listen-speech');

    // Pre-cargar nombre si ya existía
    if (nameInput && profile?.name && profile.name !== 'Aventurero') {
      nameInput.value = profile.name;
      if (clearBtn) clearBtn.hidden = false;
    }

    // Input nombre
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (clearBtn) clearBtn.hidden = !nameInput.value.trim();
        this.updateLivePreview();
      });
    }

    if (clearBtn && nameInput) {
      clearBtn.addEventListener('click', () => {
        nameInput.value = '';
        clearBtn.hidden = true;
        nameInput.focus();
        try { sound.playClick(); } catch (_) {}
        this.updateLivePreview();
      });
    }

    // Sugerencias de apodos rápidos
    quickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (nameInput) {
          nameInput.value = btn.dataset.name || '';
          if (clearBtn) clearBtn.hidden = false;
          try { sound.playClick(); } catch (_) {}
          this.updateLivePreview();
        }
      });
    });

    // Selector de Identidad / Género
    genderCards.forEach((card) => {
      if (card.dataset.gender === this.selectedGender) {
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
        this.selectedGender = card.dataset.gender;
        this.updateLivePreview();
      });
    });

    // Selector de Edad
    ageBubbles.forEach((bubble) => {
      const bubbleAge = parseInt(bubble.dataset.age, 10);
      if (bubbleAge === this.selectedAge) {
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
        this.selectedAge = parseInt(bubble.dataset.age, 10);
        speech.calibrateRateForAge(this.selectedAge);
        this.updateLivePreview();
      });
    });

    // Selector de Princesa Guía
    companionCards.forEach((card) => {
      if (card.dataset.companion === this.selectedCompanion) {
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
        this.selectedCompanion = card.dataset.companion;
        this.updateLivePreview();
      });
    });

    // Botón de audio para escuchar la bienvenida en vivo
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        this.speakCurrentGreeting();
      });
    }

    // Doble enlace de confirmación: tanto en click del botón como en submit del form
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmission();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmission();
      });
    }
  }

  getCurrentPlayerName() {
    const nameInput = document.getElementById('onboarding-input-name');
    const raw = nameInput ? nameInput.value.trim() : '';
    return raw || 'Aventurero';
  }

  updateLivePreview() {
    const avatarIcon = document.getElementById('preview-avatar-icon');
    const heroineTag = document.getElementById('preview-heroine-tag');
    const dialogueText = document.getElementById('preview-dialogue-text');

    const heroine = HEROINES[this.selectedCompanion] || HEROINES.valen;
    const name = this.getCurrentPlayerName();

    if (avatarIcon) {
      const useEl = avatarIcon.querySelector('use');
      if (useEl) {
        useEl.setAttribute('href', `#vq-heroine-${this.selectedCompanion}`);
      }
    }

    if (heroineTag) {
      heroineTag.textContent = `${heroine.name} • ${heroine.role || 'Guardiana Real'}`;
    }

    if (dialogueText) {
      let salute = '¡Bienvenido';
      if (this.selectedGender === 'girl') salute = '¡Bienvenida';
      else if (this.selectedGender === 'neutral') salute = '¡Saludos';

      dialogueText.textContent = `${salute}, ${name}! Soy ${heroine.name}. ¿Comenzamos tu viaje en Lumiria?`;
    }
  }

  speakCurrentGreeting() {
    try {
      sound.playClick();
      const name = this.getCurrentPlayerName();
      const heroine = HEROINES[this.selectedCompanion] || HEROINES.valen;
      const greeting = getPersonalizedVoiceGreeting(
        { name, gender: this.selectedGender, age: this.selectedAge },
        heroine.name
      );
      speech.speak(greeting);
    } catch (e) {
      console.warn('Speech preview error:', e);
    }
  }

  async handleSubmission() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const submitBtn = document.getElementById('btn-onboarding-submit');
    const submitText = document.getElementById('onboarding-submit-text');

    // Retroalimentación visual inmediata
    if (submitBtn) {
      submitBtn.classList.add('is-submitting');
      submitBtn.setAttribute('disabled', 'true');
    }
    if (submitText) {
      submitText.textContent = '¡Pergamino Sellado! Entrando a Lumiria...';
    }

    try { sound.playClick(); } catch (_) {}
    try { sound.playLevelUp(); } catch (_) {}

    const finalName = this.getCurrentPlayerName();
    let updatedProfile = null;

    try {
      updatedProfile = await db.savePlayerIdentity({
        name: finalName,
        gender: this.selectedGender,
        age: this.selectedAge,
        selectedCompanion: this.selectedCompanion,
      });

      await companions.loadState();
      await companions.setActive(this.selectedCompanion, true);

      // Reproducir saludo de bienvenida de la guardiana
      if (speech.isEnabled() && updatedProfile) {
        const heroine = HEROINES[this.selectedCompanion] || HEROINES.valen;
        speech.speak(getPersonalizedVoiceGreeting(updatedProfile, heroine.name));
      }
    } catch (err) {
      console.error('Error guardando iniciación real:', err);
    }

    // Redirección segura con fallback timeout: el niño nunca se queda bloqueado
    const navigateToHub = () => {
      window.location.replace('index.html');
    };

    setTimeout(navigateToHub, 400);
    // Timeout de seguridad en caso de demora
    setTimeout(navigateToHub, 1500);
  }
}

// Arranque automático al cargar el documento
const onboardingPage = new OnboardingPageController();
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    onboardingPage.init();
  });
}

export { onboardingPage };
