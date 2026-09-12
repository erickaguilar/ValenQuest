/**
 * ValenQuest Heroines Wardrobe & Cosmetics System
 * Manages wardrobe modal, cosmetic accessory unlocks, star spending and real-time avatar equipping.
 */

import { sound } from './audio.js';
import { speech } from './speech.js';
import { db } from './storage.js';
import { companions, HEROINES } from './companions.js';

class WardrobeManager {
  constructor() {
    this.activeHeroineId = 'valen';
    this.modal = null;
    this.isOpen = false;
  }

  init() {
    this.modal = document.getElementById('wardrobe-modal');
    this.setupEventListeners();
  }

  setupEventListeners() {
    const btnOpen = document.getElementById('btn-open-wardrobe');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        sound.playClick();
        this.open();
      });
    }

    const starsBadge = document.getElementById('header-stars-badge');
    if (starsBadge) {
      starsBadge.addEventListener('click', () => {
        sound.playClick();
        this.open();
      });
    }

    const btnClose = document.getElementById('btn-wardrobe-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });
    }

    // Dismiss on backdrop click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Heroine selection tabs inside wardrobe
    ['valen', 'mia', 'zoe'].forEach((id) => {
      const tab = document.getElementById(`tab-wardrobe-${id}`);
      if (tab) {
        tab.addEventListener('click', () => {
          sound.playClick();
          this.activeHeroineId = id;
          this.render();
        });
      }
    });
  }

  async open() {
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.hidden = false;

    // Default to currently active heroine in game
    const currentHero = companions.getActive();
    if (currentHero) {
      this.activeHeroineId = currentHero.id;
    }

    await this.render();
    speech.speak(`¡Bienvenida al Ropero Mágico! Elige accesorios para ${HEROINES[this.activeHeroineId].name}.`);
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.hidden = true;
  }

  /**
   * Renders the complete wardrobe interface: tabs, star balance, live avatar preview and accessories grid
   */
  async render() {
    if (!this.isOpen) return;

    const profile = await db.getProfile();
    const currentStars = profile?.stars || 0;

    // Update star balances
    const balanceEl = document.getElementById('wardrobe-star-balance');
    if (balanceEl) balanceEl.textContent = currentStars;
    const headerStars = document.getElementById('player-stars-count');
    if (headerStars) headerStars.textContent = currentStars;

    // Update heroine tabs
    ['valen', 'mia', 'zoe'].forEach((id) => {
      const tab = document.getElementById(`tab-wardrobe-${id}`);
      if (tab) {
        const isActive = id === this.activeHeroineId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });

    // Update live avatar preview
    this.renderPreview();

    // Render accessories cards
    await this.renderItemsGrid(currentStars);
  }

  renderPreview() {
    const previewWrapper = document.getElementById('wardrobe-preview-avatar');
    const svgUse = document.getElementById('wardrobe-svg-use');
    const heroine = HEROINES[this.activeHeroineId];

    if (svgUse && heroine) {
      svgUse.setAttribute('href', `#${heroine.symbolId}`);
    }

    const titleEl = document.getElementById('wardrobe-preview-title');
    if (titleEl && heroine) {
      titleEl.textContent = `${heroine.name} • ${heroine.title}`;
    }

    // Synchronize equipped cosmetic classes onto preview wrapper
    if (previewWrapper) {
      companions.applyEquippedCosmeticsClasses(this.activeHeroineId);
    }
  }

  async renderItemsGrid(currentStars) {
    const grid = document.getElementById('wardrobe-items-grid');
    if (!grid) return;

    const catalog = await db.getCosmeticsCatalog(this.activeHeroineId);
    const equipped = companions.getEquipped(this.activeHeroineId);

    grid.innerHTML = '';

    if (catalog.length === 0) {
      grid.innerHTML = '<div class="wardrobe-empty-msg">No hay accesorios disponibles para esta guardiana.</div>';
      return;
    }

    catalog.forEach((item) => {
      const isEquipped = equipped[item.slot] === item.itemId;
      const canAfford = currentStars >= item.costStars;

      const card = document.createElement('div');
      card.className = `wardrobe-item-card ${item.unlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''}`;

      let slotLabel = 'Accesorio';
      if (item.slot === 'head') slotLabel = 'Corona / Cabeza';
      else if (item.slot === 'wings') slotLabel = 'Alas';
      else if (item.slot === 'charm') slotLabel = 'Broche / Amuleto';

      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-slot-badge">${slotLabel}</span>
          ${isEquipped ? '<span class="item-status-pill equipped-pill">✨ Equipado</span>' : ''}
          ${!item.unlocked ? `<span class="item-status-pill cost-pill">⭐ ${item.costStars}</span>` : ''}
        </div>
        <div class="item-icon-display">${item.icon || '✨'}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.description}</div>
        <div class="item-card-action"></div>
      `;

      const actionArea = card.querySelector('.item-card-action');

      if (!item.unlocked) {
        if (canAfford) {
          const btnUnlock = document.createElement('button');
          btnUnlock.className = 'wardrobe-action-btn unlock-btn';
          btnUnlock.innerHTML = `<span>Desbloquear por ${item.costStars} ⭐</span>`;
          btnUnlock.addEventListener('click', () => this.handleUnlock(item));
          actionArea.appendChild(btnUnlock);
        } else {
          const btnLocked = document.createElement('button');
          btnLocked.className = 'wardrobe-action-btn locked-btn';
          btnLocked.disabled = true;
          btnLocked.innerHTML = `<span>🔒 Necesitas ${item.costStars} ⭐</span>`;
          actionArea.appendChild(btnLocked);
        }
      } else {
        const btnToggle = document.createElement('button');
        btnToggle.className = `wardrobe-action-btn ${isEquipped ? 'unequip-btn' : 'equip-btn'}`;
        btnToggle.innerHTML = isEquipped
          ? '<span>Quitar Accesorio</span>'
          : '<span>✨ Equipar</span>';

        btnToggle.addEventListener('click', () => this.handleEquipToggle(item));
        actionArea.appendChild(btnToggle);
      }

      grid.appendChild(card);
    });
  }

  async handleUnlock(item) {
    sound.playClick();
    const res = await db.unlockCosmetic(item.itemId);

    if (res.success) {
      sound.playLevelUp();
      speech.speak(`¡Felicidades! Desbloqueaste ${item.name}. ¡Ahora lo equipamos!`);

      // Auto-equip upon unlock for delight!
      await companions.equip(this.activeHeroineId, item.slot, item.itemId);

      // Re-render wardrobe
      await this.render();
    } else {
      sound.playIncorrect();
      speech.speak(res.reason || 'No alcanzan las estrellas aún.');
    }
  }

  async handleEquipToggle(item) {
    sound.playClick();
    await companions.equip(this.activeHeroineId, item.slot, item.itemId);
    sound.playCorrect();
    await this.render();
  }
}

export const wardrobe = new WardrobeManager();
