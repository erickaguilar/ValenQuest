/**
 * ValenQuest: Controlador de la Boutique & Ropero Mágico (wardrobe-page.js)
 * Maneja la selección de heroínas, catálogo de accesorios en IndexedDB,
 * canje de estrellas, vista previa dinámica y gancho para Three.js.
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

class WardrobePageController {
  constructor() {
    this.activeHeroineId = 'valen';
    this.activeCategory = 'all';
    this.threeJsScene = null;
  }

  async init() {
    console.log('👗 [ValenQuest] Inicializando Ropero Mágico en Lumiria...');
    await loadSvgSprites();

    // 1. Configurar eventos de navegación y controles de la cabecera
    this.setupHeaderControls();

    // 2. Cargar estado de las guardianas desde IndexedDB
    await companions.loadState();

    // 3. Determinar heroína activa inicial (del perfil o por defecto Valen)
    const profile = await db.getProfile();
    if (profile && profile.selectedCompanion) {
      this.activeHeroineId = profile.selectedCompanion;
    } else if (companions.activeId) {
      this.activeHeroineId = companions.activeId;
    }

    // 4. Configurar selectores de heroína y filtros de categoría
    this.setupHeroineTabs();
    this.setupCategoryFilters();
    this.setupSpeechButton();

    // 5. Gancho de preparación para Three.js (animaciones 3D)
    this.initThreeJsStage();

    // 6. Renderizar interfaz completa
    await this.render();

    // Saludo de bienvenida
    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
    speech.speakHeroine(this.activeHeroineId, `¡Bienvenida a la Boutique Real de Lumiria! Elige accesorios mágicos para ${hero.name}.`);
  }

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
  // Pestañas de Heroínas y Filtros
  // =========================================================================
  setupHeroineTabs() {
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const tab = document.getElementById(`tab-wardrobe-${id}`);
      if (tab) {
        tab.addEventListener('click', async () => {
          sound.playClick();
          this.activeHeroineId = id;
          await this.render();
          const hero = HEROINES[id];
          if (hero) {
            speech.speakHeroine(id, `${hero.name}: ${hero.title}.`);
          }
        });
      }
    });
  }

  setupCategoryFilters() {
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        sound.playClick();
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeCategory = chip.dataset.category || 'all';
        this.renderCatalogOnly();
      });
    });
  }

  setupSpeechButton() {
    const btnSpeak = document.getElementById('btn-speak-heroine');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        const hero = HEROINES[this.activeHeroineId];
        if (hero) {
          sound.playClick();
          speech.speakHeroine(this.activeHeroineId, `${hero.name} dice: ${hero.voiceQuote}`);
        }
      });
    }
  }

  // =========================================================================
  // Renderizado Principal
  // =========================================================================
  async render() {
    const profile = await db.getProfile();
    const currentStars = profile?.stars || 0;

    // Saldo de estrellas de Lumiria
    document.querySelectorAll('#player-stars-count, #wardrobe-star-balance').forEach((el) => {
      el.textContent = currentStars;
    });

    // Actualizar estado activo en pestañas de heroínas
    ['valen', 'reni', 'zoe', 'lia'].forEach((id) => {
      const tab = document.getElementById(`tab-wardrobe-${id}`);
      if (tab) {
        const isActive = id === this.activeHeroineId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });

    // Actualizar escenario / pasarela
    this.renderStage();

    // Actualizar catálogo de accesorios
    await this.renderCatalogOnly();
  }

  renderStage() {
    const heroine = HEROINES[this.activeHeroineId] || HEROINES.valen;
    const svgUse = document.getElementById('wardrobe-svg-use');
    if (svgUse && heroine) {
      svgUse.setAttribute('href', `#${heroine.symbolId}`);
    }

    const titleEl = document.getElementById('wardrobe-preview-title');
    if (titleEl && heroine) {
      titleEl.textContent = `${heroine.name} • ${heroine.title}`;
    }

    const quoteEl = document.getElementById('wardrobe-preview-quote');
    if (quoteEl && heroine) {
      quoteEl.textContent = `«${heroine.voiceQuote}»`;
    }

    const speakLabel = document.getElementById('heroine-speak-label');
    if (speakLabel && heroine) {
      speakLabel.textContent = `Escuchar a ${heroine.name}`;
    }

    // Sincronizar clases cosméticas en el avatar
    const previewWrapper = document.getElementById('wardrobe-preview-avatar');
    if (previewWrapper) {
      companions.applyEquippedCosmeticsClasses(this.activeHeroineId);
    }
  }

  async renderCatalogOnly() {
    const grid = document.getElementById('wardrobe-items-grid');
    if (!grid) return;

    const profile = await db.getProfile();
    const currentStars = profile?.stars || 0;

    let catalog = await db.getCosmeticsCatalog(this.activeHeroineId);
    const equipped = companions.getEquipped(this.activeHeroineId);

    // Filtrar por categoría seleccionada
    if (this.activeCategory !== 'all') {
      catalog = catalog.filter((item) => item.slot === this.activeCategory);
    }

    grid.innerHTML = '';

    if (catalog.length === 0) {
      grid.innerHTML = '<div class="wardrobe-empty-msg">No hay accesorios en esta categoría para esta guardiana.</div>';
      return;
    }

    catalog.forEach((item) => {
      const isEquipped = equipped[item.slot] === item.itemId;
      const costStars = item.costStars || 0;
      const isTempleReward = costStars === 0 && !item.unlocked;
      const canAfford = costStars > 0 && currentStars >= costStars;

      const card = document.createElement('div');
      card.className = `wardrobe-item-card ${item.unlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''}`;

      let slotLabel = 'Accesorio';
      if (item.slot === 'head') slotLabel = 'Corona / Cabeza';
      else if (item.slot === 'wings') slotLabel = 'Alas / Capa';
      else if (item.slot === 'charm') slotLabel = 'Broche / Amuleto';

      let iconSymbol = item.iconSymbol;
      if (!iconSymbol) {
        if (item.slot === 'wings') iconSymbol = 'vq-icon-wing';
        else if (item.slot === 'head') iconSymbol = 'vq-icon-crown';
        else iconSymbol = 'vq-icon-crystal';
      }

      let costBadgesHtml = '';
      if (!item.unlocked) {
        if (costStars > 0) {
          costBadgesHtml += `<span class="item-status-pill cost-pill" title="Estrellas de campaña"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg> ${costStars}</span>`;
        } else if (isTempleReward) {
          costBadgesHtml += `<span class="item-status-pill cost-pill" title="Recompensa de Templo Lunar"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-portal"></use></svg> Templo</span>`;
        }
      }

      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-slot-badge">${slotLabel}</span>
          ${isEquipped ? '<span class="item-status-pill equipped-pill"><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> Equipado</span>' : ''}
          ${costBadgesHtml}
        </div>
        <div class="item-icon-display">
          <svg class="vq-icon vq-icon--xl" aria-hidden="true"><use href="#${iconSymbol}"></use></svg>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.description}</div>
        <div class="item-card-action"></div>
      `;

      const actionArea = card.querySelector('.item-card-action');

      if (!item.unlocked) {
        if (isTempleReward) {
          const btnTemple = document.createElement('button');
          btnTemple.className = 'wardrobe-action-btn locked-btn';
          btnTemple.disabled = true;
          btnTemple.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg> <span>Supera el Templo Lunar</span>`;
          actionArea.appendChild(btnTemple);
        } else if (canAfford) {
          const btnUnlock = document.createElement('button');
          btnUnlock.className = 'wardrobe-action-btn unlock-btn';
          btnUnlock.innerHTML = `<span>Desbloquear por ${costStars}</span> <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg>`;
          btnUnlock.addEventListener('click', () => this.handleUnlock(item));
          actionArea.appendChild(btnUnlock);
        } else {
          const btnLocked = document.createElement('button');
          btnLocked.className = 'wardrobe-action-btn locked-btn';
          btnLocked.disabled = true;
          btnLocked.innerHTML = `<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg> <span>Necesitas ${costStars}</span> <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg>`;
          actionArea.appendChild(btnLocked);
        }
      } else {
        const btnToggle = document.createElement('button');
        btnToggle.className = `wardrobe-action-btn ${isEquipped ? 'unequip-btn' : 'equip-btn'}`;
        btnToggle.innerHTML = isEquipped
          ? '<span>Quitar Accesorio</span>'
          : '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Equipar</span>';

        btnToggle.addEventListener('click', () => this.handleEquipToggle(item));
        actionArea.appendChild(btnToggle);
      }

      grid.appendChild(card);
    });
  }

  // =========================================================================
  // Acciones de Desbloqueo y Equipamiento
  // =========================================================================
  async handleUnlock(item) {
    sound.playClick();
    const res = await db.unlockCosmetic(item.itemId);

    if (res.success) {
      sound.playLevelUp();
      speech.speakHeroine(this.activeHeroineId, `¡Felicidades! Desbloqueaste ${item.name} con tus estrellas. ¡Lo equipamos en ${HEROINES[this.activeHeroineId].name}!`);

      // Equipar automáticamente tras el desbloqueo
      await companions.equip(this.activeHeroineId, item.slot, item.itemId);

      // Re-renderizar
      await this.render();
    } else {
      sound.playIncorrect();
      speech.speakHeroine(this.activeHeroineId, res.reason || 'Aún necesitas más estrellas de Lumiria.');
    }
  }

  async handleEquipToggle(item) {
    sound.playClick();
    await companions.equip(this.activeHeroineId, item.slot, item.itemId);
    sound.playCorrect();
    await this.render();
  }

  // =========================================================================
  // Gancho de Integración para Three.js (Animaciones y Pasarela 3D)
  // =========================================================================
  initThreeJsStage() {
    const container = document.getElementById('threejs-stage-container');
    if (!container) return;

    // Hook preparado: cuando se agregue la librería Three.js (vía import o script CDN/local),
    // aquí se inicializará la Scene, PerspectiveCamera, WebGLRenderer, y el modelo 3D con animaciones.
    console.log('🌟 [Three.js Hook] Contenedor de pasarela 3D listo para inicialización:', container);
    
    // Por ahora, el contenedor permanece listo y no bloquea el avatar 2D SVG
  }
}

// Inicialización automática de la página
const page = new WardrobePageController();
document.addEventListener('DOMContentLoaded', () => {
  page.init();
});
