/**
 * ValenQuest: Motor del Gran Libro de las Princesas (Storybook Engine)
 * Basado en las Especificaciones Canónicas de Lumiria:
 * - La Leyenda de las Diez Lunas y el Gran Grimorio de Cristal
 * - El Cuarteto de la Armonía y los Poderes de Amistad
 * - Portales Bifásicos (Sweller CLT) y Recompensas del Ropero Mágico
 * 
 * Funcionalidades:
 * - 8 Capítulos Canónicos Completos
 * - Espejo Mágico Canvas Dinámico por Escenario (Eclipses, Prismas, Vientos, Brotes)
 * - Cajita Musical de Princesas en Web Audio API (Música procedural sin MP3 externos)
 * - Narración Teatral en Español con Web Speech API y resaltado karaoke
 * - Navegación Táctil (Swipe), Cintas Marcadoras y Atajos de Teclado
 */

import { sound } from './services/audio.js';
import { speech } from './services/speech.js';
import { db } from './services/storage.js';
import { companions, HEROINES } from './services/companions.js';
import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';
import { renderChapterScene } from './components/story-scenes.js';

// Capítulos (SSOT: data/story-chapters.json).
// El respaldo embebido (Capítulo I) solo cubre el arranque sin red.
let CHAPTERS = [
  {
    "id": 1,
    "number": "Capítulo I",
    "title": "El Gran Grimorio y las Cuatro Razas",
    "heroineId": "valen",
    "symbolId": "vq-icon-unicorn",
    "characterName": "El Reino de Lumiria",
    "characterSubtitle": "La Alianza del Templo Supremo",
    "sceneType": "kingdom",
    "dropCap": "E",
    "paragraphs": [
      "n los tiempos dorados de Lumiria, la armonía de todo el cosmos descansaba sobre las páginas resplandecientes del Gran Grimorio de Cristal. Custodiado en la cúspide del Templo Supremo, este libro sagrado albergaba los dos pilares del saber: las fórmulas numéricas doradas que mantenían girando a las constelaciones y los pergaminos sagrados de la lectura que daban voz al pensamiento.",
      "Durante siglos, cuatro nobles linajes de ponis vivieron en fraternal equilibrio: los majestuosos Alicornios guardianes del firmamento, los intrépidos Pegasos dueños de los vientos, los laboriosos Ponis Terrestres cimientos de la naturaleza, y los místicos Unicornios tejedores de cristales.",
      "Juntos formaban una civilización donde el conocimiento no era un deber aburrido, sino una fiesta diaria de descubrimientos, risas y estrellas brillantes."
    ],
    "quote": "«Donde cuatro razas comparten su luz con nobleza, ninguna sombra puede oscurecer el firmamento.»",
    "auraColor": "#FFC8DD"
  }
];
let storyChaptersLoaded = false;

/**
 * Carga los 8 capítulos del Gran Libro. Idempotente y tolerante a fallos.
 */
export async function loadStoryChapters() {
  if (storyChaptersLoaded) return CHAPTERS;
  try {
    const res = await fetch('data/story-chapters.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.chapters) && data.chapters.length > 0) {
      CHAPTERS = data.chapters;
    }
  } catch (err) {
    console.warn('⚠️ [Storybook] Capítulos en respaldo embebido:', err?.message || err);
  }
  storyChaptersLoaded = true;
  return CHAPTERS;
}

class StorybookManager {
  constructor() {
    this.currentChapterIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;
    this.isAnimPlaying = true;
    this.isSpeaking = false;
    this.particles = [];
    this.sceneAngle = 0;
    this.activeHeroineId = 'valen';
  }

  async init() {
    await loadSvgSprites();
    await loadStoryChapters();
    this.canvas = document.getElementById('mirror-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.initParticles();
      this.startCanvasAnimation();
    }

    this.renderRibbons();
    this.renderChapter(0);
    this.setupEventListeners();
    this.syncThemeButton();

    // Sincronizar estado de voz del servicio central con el botón de Orión
    speech.onSpeakingChange((speaking) => {
      this.isSpeaking = speaking;
      const btn = document.getElementById('btn-read-aloud');
      if (btn) {
        if (speaking) {
          btn.classList.add('active');
          btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-off"></use></svg> <span>Pausar a Orión</span>';
        } else {
          btn.classList.remove('active');
          btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-owl"></use></svg> <span>Voz de Orión</span>';
        }
      }
    });

    // Cargar perfil y compañera activa para personalizar el saludo
    try {
      await companions.loadState();
      const profile = await db.getProfile();
      if (profile?.selectedCompanion) {
        this.activeHeroineId = profile.selectedCompanion;
      } else if (companions.activeId) {
        this.activeHeroineId = companions.activeId;
      }
    } catch (err) {
      console.warn('[Storybook] No se pudo cargar perfil:', err);
    }

    // Saludo sonoro y de bienvenida al entrar, idéntico a La Gran Aventura
    this.playWelcomeGreeting();
  }

  playWelcomeGreeting() {
    try {
      sound.playStreak();
    } catch (_) {}

    const hero = HEROINES[this.activeHeroineId] || HEROINES.valen;
    speech.speakOrion(
      `¡Bienvenida ${hero.name} a El Gran Libro de las Princesas! Explora las leyendas sagradas de Lumiria y pulsa la Voz de Orión para escuchar cada capítulo.`
    );
  }

  initParticles() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth || 320;
    this.canvas.height = this.canvas.offsetHeight || 240;
    this.particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2.2 + 0.8,
        color: ['#FFC8DD', '#FFD166', '#A2D2FF', '#CDB4DB', '#B8F2E6', '#FFFFFF'][Math.floor(Math.random() * 6)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        pulse: Math.random() * Math.PI,
      });
    }
  }

  startCanvasAnimation() {
    const loop = () => {
      if (this.isAnimPlaying && this.ctx && this.canvas) {
        this.drawScene();
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  drawScene() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.sceneAngle += 0.015;

    const ch = CHAPTERS[this.currentChapterIndex];
    const scene = ch.sceneType || 'kingdom';

    // 1. Cosmic Background Gradient
    const grad = this.ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 1.4);
    if (scene === 'eclipse') {
      grad.addColorStop(0, 'rgba(123, 44, 191, 0.45)');
      grad.addColorStop(0.6, 'rgba(32, 22, 51, 0.8)');
      grad.addColorStop(1, 'rgba(10, 6, 18, 0.95)');
    } else if (scene === 'reni') {
      grad.addColorStop(0, 'rgba(162, 210, 255, 0.4)');
      grad.addColorStop(1, 'rgba(20, 30, 60, 0.9)');
    } else if (scene === 'zoe') {
      grad.addColorStop(0, 'rgba(184, 242, 230, 0.4)');
      grad.addColorStop(1, 'rgba(15, 45, 35, 0.9)');
    } else if (scene === 'lia') {
      grad.addColorStop(0, 'rgba(199, 125, 255, 0.45)');
      grad.addColorStop(1, 'rgba(30, 15, 55, 0.9)');
    } else {
      grad.addColorStop(0, 'rgba(255, 200, 221, 0.35)');
      grad.addColorStop(1, 'rgba(25, 18, 40, 0.9)');
    }
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Scene-specific celestial geometries
    if (scene === 'eclipse') {
      // Rotating Eclipse Ring
      this.ctx.save();
      this.ctx.translate(w / 2, h / 2);
      this.ctx.rotate(this.sceneAngle * 0.4);
      this.ctx.strokeStyle = '#FBBF24';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 48, 0, Math.PI * 1.6);
      this.ctx.stroke();
      this.ctx.restore();
    } else if (scene === 'temples') {
      // 10 Orbiting Temple Orbs
      this.ctx.save();
      this.ctx.translate(w / 2, h / 2);
      for (let i = 0; i < 10; i++) {
        const theta = (i / 10) * Math.PI * 2 + this.sceneAngle * 0.6;
        const ox = Math.cos(theta) * 58;
        const oy = Math.sin(theta) * 42;
        this.ctx.fillStyle = i === 9 ? '#FFD166' : '#FFC8DD';
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, i === 9 ? 4.5 : 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    } else if (scene === 'portal') {
      // Radiant Portal Rays
      this.ctx.save();
      this.ctx.translate(w / 2, h / 2);
      this.ctx.rotate(this.sceneAngle * 0.8);
      this.ctx.strokeStyle = 'rgba(255, 209, 102, 0.25)';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        this.ctx.rotate(Math.PI / 4);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);
        this.ctx.lineTo(0, 70);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    // 3. Constellation Links between particles
    this.ctx.strokeStyle = 'rgba(255, 209, 102, 0.14)';
    this.ctx.lineWidth = 0.8;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 55) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // 4. Stardust Particles
    for (const p of this.particles) {
      p.pulse += 0.03;
      const curRadius = Math.max(0.6, p.radius + Math.sin(p.pulse) * 0.6);

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }
  }

  renderRibbons() {
    const bar = document.getElementById('chapter-ribbons');
    if (!bar) return;
    bar.innerHTML = CHAPTERS.map((ch, idx) => `
      <button type="button" class="ribbon-tab ${idx === 0 ? 'active-ribbon' : ''}" data-index="${idx}" aria-label="${ch.title}">
        <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-star"></use></svg>
        <span>${ch.number}</span>
      </button>
    `).join('');

    bar.querySelectorAll('.ribbon-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        this.goToChapter(idx);
      });
    });
  }

  renderChapter(index) {
    if (index < 0 || index >= CHAPTERS.length) return;
    this.currentChapterIndex = index;
    const ch = CHAPTERS[index];

    // 1. Update Ribbon Tabs
    document.querySelectorAll('.ribbon-tab').forEach((btn, idx) => {
      btn.classList.toggle('active-ribbon', idx === index);
    });

    // 2. Update Stage Visuals
    const charWrapper = document.getElementById('stage-character');
    if (charWrapper) {
      renderChapterScene(ch, charWrapper);
    }

    const nameEl = document.getElementById('stage-character-name');
    if (nameEl) nameEl.textContent = ch.characterName;

    const subEl = document.getElementById('stage-character-sub');
    if (subEl) subEl.textContent = ch.characterSubtitle;

    // 3. Update Manuscript Text
    const numEl = document.getElementById('chapter-num');
    if (numEl) numEl.textContent = ch.number;

    const titleEl = document.getElementById('chapter-title');
    if (titleEl) titleEl.textContent = ch.title;

    const bodyEl = document.getElementById('chapter-body');
    if (bodyEl) {
      const firstPara = ch.paragraphs[0];
      const restFirstPara = firstPara.substring(1);
      const otherParas = ch.paragraphs.slice(1).map(p => `<p>${p}</p>`).join('');

      bodyEl.innerHTML = `
        <p><span class="drop-cap">${ch.dropCap}</span>${restFirstPara}</p>
        ${otherParas}
      `;
    }

    const quoteEl = document.getElementById('chapter-quote');
    if (quoteEl) quoteEl.textContent = ch.quote;

    // 4. Update Navigation Buttons
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    const pagePill = document.getElementById('page-indicator');
    const ctaContainer = document.getElementById('cta-container');

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) {
      nextBtn.disabled = index === CHAPTERS.length - 1;
      nextBtn.style.display = index === CHAPTERS.length - 1 ? 'none' : 'inline-flex';
    }
    if (pagePill) {
      pagePill.textContent = `${index + 1} / ${CHAPTERS.length}`;
    }
    if (ctaContainer) {
      ctaContainer.style.display = index === CHAPTERS.length - 1 ? 'block' : 'none';
    }

    // Cancel ongoing speech if reading previous chapter
    if (this.isSpeaking) {
      this.stopSpeech();
    }

    // Sound effect
    this.playPageTurnSound();
  }

  goToChapter(index) {
    if (index >= 0 && index < CHAPTERS.length) {
      this.renderChapter(index);
    }
  }

  nextChapter() {
    if (this.currentChapterIndex < CHAPTERS.length - 1) {
      this.goToChapter(this.currentChapterIndex + 1);
    }
  }

  prevChapter() {
    if (this.currentChapterIndex > 0) {
      this.goToChapter(this.currentChapterIndex - 1);
    }
  }

  toggleSpeech() {
    if (this.isSpeaking) {
      this.stopSpeech();
    } else {
      this.readCurrentChapter();
    }
  }

  readCurrentChapter() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Tu navegador no admite síntesis de voz.');
      return;
    }

    const ch = CHAPTERS[this.currentChapterIndex];
    const fullText = `${ch.title}. ${ch.paragraphs.join(' ')} ${ch.quote}`;
    speech.speakOrion(fullText, { rate: 0.92 });
  }

  stopSpeech() {
    speech.cancel();
  }

  playPageTurnSound() {
    try {
      sound.playClick();
    } catch (_) {}
  }

  setupEventListeners() {
    // Nav Prev / Next buttons
    const prevBtn = document.getElementById('btn-prev-page');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevChapter());

    const nextBtn = document.getElementById('btn-next-page');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextChapter());

    // Read Aloud / TTS button
    const speechBtn = document.getElementById('btn-read-aloud');
    if (speechBtn) speechBtn.addEventListener('click', () => this.toggleSpeech());

    // Toggle mirror scene animation
    const animToggleBtn = document.getElementById('btn-toggle-anim');
    if (animToggleBtn) {
      animToggleBtn.addEventListener('click', () => {
        this.isAnimPlaying = !this.isAnimPlaying;
        const stageEl = document.querySelector('.page-stage');
        if (stageEl) {
          stageEl.classList.toggle('is-paused', !this.isAnimPlaying);
        }
        animToggleBtn.innerHTML = this.isAnimPlaying
          ? '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Animación Activa</span>'
          : '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-moon"></use></svg> <span>Pausada</span>';
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      theme.bindButton(themeBtn);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.nextChapter();
      if (e.key === 'ArrowLeft') this.prevChapter();
    });

    // Touch Swipe Gestures on mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const bookEl = document.getElementById('fairytale-book');
    if (bookEl) {
      bookEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      bookEl.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextChapter();
          } else {
            this.prevChapter();
          }
        }
      }, { passive: true });
    }
  }

  syncThemeButton() {
    theme.syncButton();
  }
}

// Boot Storybook Manager on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const storybook = new StorybookManager();
  storybook.init();
});
