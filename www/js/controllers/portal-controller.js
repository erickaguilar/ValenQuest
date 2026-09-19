/**
 * ValenQuest: Portal & Act Transition Controller (portal-controller.js)
 * Controlador modular para los Desafíos de Portal, Purificación de Guardianes,
 * Recompensas Astrales y Transiciones Cósmicas de Actos en Lumiria.
 */

import { sound } from '../services/audio.js';
import { speech } from '../services/speech.js';
import { db } from '../services/storage.js';
import { HEROINES } from '../services/companions.js';
import { getLevelData, getActTransitionData } from '../data/levels-data.js';

export class PortalController {
  constructor() {
    this.currentPortalLevel = 1;
    this.isPortalActive = false;
    this.isSpeakingPortalStory = false;
    this.pendingNextTier = 1;
    this.onAdvanceCallback = null;
    this.onActContinueCallback = null;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Botón Continuar tras purificación
    const btnPortalContinue = document.getElementById('btn-portal-continue');
    if (btnPortalContinue) {
      btnPortalContinue.onclick = () => {
        const modal = document.getElementById('portal-challenge-modal');
        if (modal) modal.hidden = true;
        this.isPortalActive = false;
        if (this.onAdvanceCallback) {
          this.onAdvanceCallback(this.currentPortalLevel);
        }
      };
    }

    // Botón Equipar Cosmético
    const btnPortalEquip = document.getElementById('btn-portal-equip-now');
    if (btnPortalEquip) {
      btnPortalEquip.onclick = () => {
        sound.playClick();
        window.location.href = 'wardrobe.html';
      };
    }

    // Botón Continuar de Transición Cósmica
    const btnActContinue = document.getElementById('btn-act-continue');
    if (btnActContinue) {
      btnActContinue.onclick = () => {
        const modal = document.getElementById('act-transition-modal');
        if (modal) modal.hidden = true;
        if (this.onActContinueCallback) {
          this.onActContinueCallback(this.pendingNextTier);
        } else if (this.onAdvanceCallback) {
          this.onAdvanceCallback(this.pendingNextTier);
        }
      };
    }

    // Modal de Subida de Nivel
    const btnLevelUpPortal = document.getElementById('btn-levelup-portal');
    if (btnLevelUpPortal) {
      btnLevelUpPortal.onclick = () => {
        const modal = document.getElementById('level-up-modal');
        if (modal) modal.hidden = true;
        this.openPortalChallenge(this.currentPortalLevel);
      };
    }

    const btnLevelUpStay = document.getElementById('btn-levelup-stay');
    if (btnLevelUpStay) {
      btnLevelUpStay.onclick = () => {
        const modal = document.getElementById('level-up-modal');
        if (modal) modal.hidden = true;
      };
    }
  }

  /**
   * Abre el Desafío de Portal de Amistad para un templo astral
   */
  openPortalChallenge(levelId, onAdvance = null) {
    if (onAdvance) this.onAdvanceCallback = onAdvance;
    const levelData = getLevelData(levelId);
    this.currentPortalLevel = levelData.id;
    this.isPortalActive = true;

    // Encabezado
    const pagePill = document.getElementById('portal-page-pill');
    const actPill = document.getElementById('portal-act-pill');
    const title = document.getElementById('portal-modal-title');
    const subtitle = document.getElementById('portal-subtitle');

    if (pagePill) {
      pagePill.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-reading"></use></svg> Página ${levelData.pageNumber} de 10`;
    }
    if (actPill) actPill.textContent = (levelData.actTitle || 'Acto I').split(':')[0];
    if (title) title.textContent = levelData.name;
    if (subtitle) subtitle.textContent = `${levelData.templeTitle} • Desafío de Portal`;

    // Escena del Guardián (Corrompido por defecto)
    const wrapper = document.getElementById('portal-guardian-wrapper');
    const emoji = document.getElementById('portal-guardian-emoji');
    const guardianName = document.getElementById('portal-guardian-name');
    const statusBadge = document.getElementById('portal-guardian-status');

    if (wrapper) wrapper.className = 'guardian-avatar-wrapper vq-anim-corrupted';
    if (emoji) {
      if (levelData.guardian?.symbolId) {
        emoji.innerHTML = `<svg class="heroine-svg-avatar" viewBox="0 0 100 100" style="width: 72px; height: 72px;" aria-hidden="true"><use href="#${levelData.guardian.symbolId}"></use></svg>`;
      } else if (levelData.pageNumber === 10) {
        emoji.innerHTML = `<svg class="heroine-svg-avatar" viewBox="0 0 100 100" style="width: 72px; height: 72px;"><use href="#vq-heroine-eclipse"></use></svg>`;
      } else {
        emoji.innerHTML = `<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>`;
      }
    }
    if (guardianName) guardianName.textContent = levelData.guardian?.name || 'Guardián';
    if (statusBadge) {
      statusBadge.className = 'guardian-status-badge corrupted';
      statusBadge.textContent = 'Sombra del Eclipse';
    }

    // Micro-cuento
    const linesContainer = document.getElementById('portal-story-lines');
    if (linesContainer) {
      linesContainer.innerHTML = '';
      const lines = levelData.microCuento || levelData.storyLines || [];
      lines.forEach((line, idx) => {
        const p = document.createElement('p');
        p.className = 'portal-line';
        p.dataset.line = idx;
        p.textContent = line;
        linesContainer.appendChild(p);
      });
    }

    // Acertijo
    const riddlePrompt = document.getElementById('portal-riddle-prompt');
    if (riddlePrompt) riddlePrompt.textContent = levelData.portalRiddle?.prompt || '';

    const optionsGrid = document.getElementById('portal-options-grid');
    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      const opts = levelData.portalRiddle?.options || [1, 2, 3, 4];
      opts.forEach((optVal) => {
        const btn = document.createElement('button');
        btn.className = 'portal-option-btn';
        btn.type = 'button';
        btn.textContent = optVal;
        btn.addEventListener('click', (e) => this.handlePortalAnswer(optVal, e.currentTarget, levelData));
        optionsGrid.appendChild(btn);
      });
    }

    // Botón de Voz
    const btnSpeak = document.getElementById('btn-portal-speak-story');
    if (btnSpeak) {
      btnSpeak.onclick = () => this.speakPortalStory(levelData);
    }

    // Visibilidad de Tarjetas
    const riddleCard = document.getElementById('portal-riddle-card');
    const rewardCard = document.getElementById('portal-reward-card');
    if (riddleCard) riddleCard.hidden = false;
    if (rewardCard) rewardCard.hidden = true;

    // Mostrar modal
    const modal = document.getElementById('portal-challenge-modal');
    if (modal) modal.hidden = false;

    // Narrar automáticamente tras breve pausa (solo si ya hubo un gesto;
    // los navegadores bloquean el habla sin activación del usuario).
    setTimeout(() => {
      try {
        if (speech.isUserActivated && speech.isUserActivated()) this.speakPortalStory(levelData);
      } catch {}
    }, 450);
  }

  /**
   * Narra el micro-cuento con resaltado visual tipo karaoke
   */
  async speakPortalStory(input) {
    const lines = Array.isArray(input) ? input : (input && (input.storyLines || input.microCuento));
    if (!lines || lines.length === 0 || this.isSpeakingPortalStory) return;
    this.isSpeakingPortalStory = true;

    document.querySelectorAll('.portal-line').forEach((el) => el.classList.remove('speaking'));

    for (let i = 0; i < lines.length; i++) {
      if (!this.isPortalActive) break;

      const lineEl = document.querySelector(`.portal-line[data-line="${i}"]`);
      if (lineEl) {
        document.querySelectorAll('.portal-line').forEach((el) => el.classList.remove('speaking'));
        lineEl.classList.add('speaking');
      }

      await new Promise((resolve) => {
        speech.speak(lines[i]);
        const approxDurationMs = Math.max(1800, lines[i].split(' ').length * 370);
        setTimeout(resolve, approxDurationMs);
      });
    }

    document.querySelectorAll('.portal-line').forEach((el) => el.classList.remove('speaking'));
    this.isSpeakingPortalStory = false;
  }

  /**
   * Evalúa la respuesta en el Desafío de Portal
   */
  async handlePortalAnswer(selectedVal, buttonEl, levelData) {
    if (this.isSpeakingPortalStory) {
      speech.stop();
      this.isSpeakingPortalStory = false;
    }

    const isCorrect = selectedVal === levelData.portalRiddle?.correctAnswer;

    if (isCorrect) {
      sound.playCorrect();
      buttonEl.classList.add('correct');

      // 1. Purificar Guardián visualmente
      const wrapper = document.getElementById('portal-guardian-wrapper');
      const statusBadge = document.getElementById('portal-guardian-status');

      if (wrapper) {
        wrapper.classList.remove('vq-anim-corrupted');
        wrapper.classList.add('vq-anim-purified');
      }
      if (statusBadge) {
        statusBadge.classList.remove('corrupted');
        statusBadge.classList.add('purified');
        statusBadge.innerHTML = '¡Guardián Purificado! <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg>';
      }

      // 2. Chispas doradas de celebración
      const sparks = document.createElement('div');
      sparks.className = 'gold-sparks-overlay';
      document.body.appendChild(sparks);
      setTimeout(() => sparks.remove(), 1400);

      // 3. Audio celebración
      sound.playLevelUp();

      // 4. Persistencia: otorgar cosmético
      if (levelData.reward?.itemId) {
        await db.grantCosmeticReward(levelData.reward.itemId);
      }

      // 5. Mostrar tarjeta de recompensa
      setTimeout(() => {
        const riddleCard = document.getElementById('portal-riddle-card');
        const rewardCard = document.getElementById('portal-reward-card');
        if (riddleCard) riddleCard.hidden = true;
        if (rewardCard && levelData.reward) {
          rewardCard.hidden = false;
          const rewardIcon = document.getElementById('portal-reward-icon');
          const rewardName = document.getElementById('portal-reward-name');
          const rewardDesc = document.getElementById('portal-reward-desc');
          let rewardSymbol = levelData.reward.iconSymbol || (levelData.reward.itemId.includes('alas') ? 'vq-icon-wing' : levelData.reward.itemId.includes('cetro') ? 'vq-icon-magic-wand' : 'vq-icon-crown');
          if (rewardIcon) rewardIcon.innerHTML = `<svg class="vq-icon vq-icon--xl" aria-hidden="true"><use href="#${rewardSymbol}"></use></svg>`;
          if (rewardName) rewardName.textContent = levelData.reward.name;
          if (rewardDesc) rewardDesc.textContent = `${levelData.reward.description || ''} • ¡Desbloqueado en tu Ropero!`;
        }
      }, 500);

      // 6. Voz de elogio
      speech.speak(`¡Felicidades! Has purificado al ${levelData.guardian?.name || 'Guardián'} y obtenido ${levelData.reward?.name || 'una recompensa'}.`);
    } else {
      sound.playIncorrect();
      buttonEl.classList.add('incorrect');
      setTimeout(() => buttonEl.classList.remove('incorrect'), 600);
      speech.speak(`Piénsalo bien. Recuerda: ${levelData.portalRiddle?.explanation || 'Inténtalo otra vez.'}`);
    }
  }

  /**
   * Despliega el Gran Modal de Transición Cósmica al concluir un Acto
   */
  showActTransition(actNumber, targetNextTier, onContinue = null) {
    if (onContinue) this.onActContinueCallback = onContinue;
    this.pendingNextTier = targetNextTier;
    const actData = getActTransitionData(actNumber);

    const modal = document.getElementById('act-transition-modal');
    const pill = document.getElementById('act-transition-pill');
    const title = document.getElementById('act-transition-title');
    const subtitle = document.getElementById('act-transition-subtitle');
    const grid = document.getElementById('act-guardians-grid');
    const lore = document.getElementById('act-lore-text');
    const nextTitle = document.getElementById('act-next-title');
    const btnText = document.getElementById('btn-act-continue-text');

    if (pill) pill.textContent = actData.completedPill;
    if (title) title.textContent = actData.headline;
    // Guía rotativa del acto (consejo de iguales): cada acto lo narra una heroína.
    const guideId = actData.guideHeroineId || 'valen';
    const guideName = HEROINES[guideId]?.name || 'Valen';
    if (subtitle) subtitle.textContent = `${actData.tagline} Guiado por ${guideName}.`;
    if (lore) lore.textContent = actData.loreQuote;
    if (nextTitle) {
      nextTitle.textContent = `${actData.nextActTitle} • ${actData.nextLevelName} ${actData.nextGuardianEmoji}`;
    }
    if (btnText) btnText.textContent = actData.buttonText;

    if (grid) {
      grid.innerHTML = '';
      (actData.guardians || []).forEach((guardian, idx) => {
        const card = document.createElement('div');
        card.className = 'act-guardian-card';
        card.style.animationDelay = `${idx * 0.4}s`;
        const avatar = guardian.symbolId
          ? `<svg class="vq-icon" aria-hidden="true" style="width: 44px; height: 44px;"><use href="#${guardian.symbolId}"></use></svg>`
          : guardian.emoji;
        card.innerHTML = `
          <div class="act-guardian-emoji" style="text-shadow: 0 0 16px ${guardian.color};">${avatar}</div>
          <div class="act-guardian-name">${guardian.name}</div>
          <div class="act-guardian-temple">${guardian.temple}</div>
          <div class="act-guardian-pill"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> Purificado</div>
        `;
        grid.appendChild(card);
      });
    }

    sound.playLevelUp();
    try {
      if (typeof speech.speakHeroine === 'function') {
        speech.speakHeroine(guideId, actData.voiceNarration || '¡Felicidades!');
      } else {
        speech.speak(actData.voiceNarration || '¡Felicidades!');
      }
    } catch {}

    if (modal) modal.hidden = false;
  }

  showLevelUpModal(tierName, onStartPortal = null) {
    if (onStartPortal) this.onAdvanceCallback = onStartPortal;
    const modal = document.getElementById('level-up-modal');
    const title = document.getElementById('modal-tier-title');
    if (modal && title) {
      title.innerHTML = `¡Has alcanzado ${tierName}! <svg class="vq-icon vq-icon--sm" aria-hidden="true"><use href="#vq-icon-star"></use></svg>`;
      modal.hidden = false;
      sound.playLevelUp();
    }
  }
}

export const portalController = new PortalController();
