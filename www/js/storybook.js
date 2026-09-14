/**
 * ValenQuest: Motor del Gran Libro de las Princesas (Storybook Engine)
 * Coordina la narrativa de Lumiria, el Espejo Mágico en Canvas,
 * la lectura teatral por Web Speech API y la navegación táctil.
 */

const CHAPTERS = [
  {
    id: 1,
    number: 'Capítulo I',
    title: 'El Reino de Lumiria y el Velo de la Duda',
    heroineId: 'valen',
    symbolId: 'vq-icon-unicorn',
    characterName: 'El Reino de Lumiria',
    characterSubtitle: 'La Alianza de las Cuatro Razas',
    dropCap: 'H',
    paragraphs: [
      'ace muchas eras, en un rincón resplandeciente del cosmos, floreció el Reino de Lumiria. Era una tierra mágica donde cuatro nobles linajes de ponis convivían en perfecta armonía: los majestuosos Alicornios, los veloces Pegasos, los firmes Ponis Terrestres y los sabios Unicornios.',
      'En la cima del reino se erigía la Gran Biblioteca de las Constelaciones, donde los antiguos sabios guardaban los pergaminos sagrados de la lectura y las fórmulas numéricas doradas que daban luz a las estrellas del firmamento.',
      'Pero un día, una bruma silenciosa conocida como el Velo de la Duda descendió sobre el reino. La niebla desordenó las palabras de los pergaminos, borró las fórmulas de cristal y apagó las constelaciones celestes, sumiendo a los valles en la incertidumbre.'
    ],
    quote: '«Donde cuatro reinos se unen con un solo corazón, ninguna estrella se apaga jamás.»',
    auraColor: '#FFC8DD'
  },
  {
    id: 2,
    number: 'Capítulo II',
    title: 'Valen y el Prisma Real',
    heroineId: 'valen',
    symbolId: 'vq-heroine-valen',
    characterName: 'Valen la Princesa Astral',
    characterSubtitle: 'Alicornio Líder • Elemento de la Realeza',
    dropCap: 'V',
    paragraphs: [
      'alen nació bajo la conjunción de las lunas gemelas de Lumiria, portando las alas de un pegaso y el cuerno luminoso de un unicornio. Como Princesa Astral y líder natural del reino, su deber es guiar a todos con bondad, valentía y una sonrisa radiante.',
      'En su pecho late el Prisma Real, una joya celestial forjada con polvo de estrellas. Cuando las dudas parecen abrumadoras, el prisma de Valen refracta la verdad, despeja las opciones engañosas y duplica las estrellas de recompensa.',
      '«No temas equivocarte», suele decir Valen con su tierna voz. «Cada intento es un paso más cerca de iluminar el cielo entero.»'
    ],
    quote: '«¡El Prisma Real refracta la verdad y duplica tus estrellas para el ropero mágico!»',
    auraColor: '#FFAFCC'
  },
  {
    id: 3,
    number: 'Capítulo III',
    title: 'Reni y la Brisa Temporal',
    heroineId: 'reni',
    symbolId: 'vq-heroine-reni',
    characterName: 'Reni el Alquimista de los Vientos',
    characterSubtitle: 'Pegaso de Nimbus • Elemento del Tiempo',
    dropCap: 'E',
    paragraphs: [
      'ntre los picos flotantes de Nimbus habita Reni, un pegaso de plumaje celeste y corazón intrépido. Capaz de cruzar tempestades sin despeinarse, Reni descubrió el secreto más profundo de los vientos: la verdadera velocidad nace de la serenidad.',
      'Cuando un desafío parece urgente y el reloj aprieta el pecho, Reni bate sus alas celestiales invocando la Brisa Temporal. El tiempo se sosiega, los vientos se calman y el aprendiz puede contemplar el problema con total claridad y maestría.',
      'Con Reni a tu lado, la prisa desaparece. Descubrirás que pensar con calma es el superpoder más veloz del universo.'
    ],
    quote: '«¡Reni despeja el viento para darte tiempo! Respira hondo y piensa con calma.»',
    auraColor: '#A2D2FF'
  },
  {
    id: 4,
    number: 'Capítulo IV',
    title: 'Zoe y las Raíces Eternas',
    heroineId: 'zoe',
    symbolId: 'vq-heroine-zoe',
    characterName: 'Zoe el Ancla de la Naturaleza',
    characterSubtitle: 'Poni Terrestre • Elemento de la Tierra',
    dropCap: 'E',
    paragraphs: [
      'n el frondoso Valle de los Brotes Verdes vive Zoe, la poni terrestre con la fuerza de los robles milenarios y la paciencia de las flores silvestres. Zoe comprende el murmullo de la tierra y la fortaleza que habita en cada raíz.',
      'Cuando el estudiante comete un tropiezo, Zoe planta sus cuatro cascos y despliega el Escudo de Raíces. Su abrazo vegetal protege la racha de aciertos y transforma el error en fertilizante para el aprendizaje.',
      '«Los errores no son fracasos», susurra Zoe mientras brotan flores a su alrededor. «Son las semillas donde florece tu inteligencia más brillante.»'
    ],
    quote: '«¡Mis raíces sostienen tu camino! Lo resolveremos paso a pasito, sin miedo.»',
    auraColor: '#B8F2E6'
  },
  {
    id: 5,
    number: 'Capítulo V',
    title: 'Lía y el Foco de Cristal',
    heroineId: 'lia',
    symbolId: 'vq-heroine-lia',
    characterName: 'Lía la Maga del Cristal Cósmico',
    characterSubtitle: 'Unicornio Místico • Elemento de la Magia',
    dropCap: 'D',
    paragraphs: [
      'esde las torres de amatista de las Agujas Celestiales, Lía contempla los enigmas del firmamento. Es la unicornio más erudita del reino, capaz de ver patrones numéricos y sílabas ocultas donde otros solo ven sombras.',
      'Empuñando su cuerno con gracia etérea, Lía proyecta el Foco de Cristal. Un haz de telequinesis luminosa resalta el número clave, el acarreo matemático o la acentuación de las palabras, guiando la mirada exactamente hacia la solución.',
      'Lía te enseña a mirar más allá de lo evidente, descubriendo que la ciencia y la magia son hermanas gemelas en el Reino de Lumiria.'
    ],
    quote: '«¡Mi cuerno de cristal enfoca el camino! Observa la pista luminosa que danza para ti.»',
    auraColor: '#C77DFF'
  },
  {
    id: 6,
    number: 'Capítulo VI',
    title: 'El Despertar de la Heroína Elegida',
    heroineId: 'valen',
    symbolId: 'vq-icon-sparkles',
    characterName: 'Tu Misión en Lumiria',
    characterSubtitle: 'La Quinta Estrella de la Armonía',
    dropCap: 'L',
    paragraphs: [
      'a antigua profecía de las constelaciones habla de una heroína que llegaría de más allá del horizonte. Alguien curiosa, persistente y con el deseo invencible de aprender. ¡Esa heroína eres tú!',
      'Al resolver cada desafío de matemáticas y descifrar cada pergamino de lectura, un haz de luz sube hacia el cielo nocturno. Cada estrella restaurada ilumina el camino del reino y te otorga gemas estelares para vestir a tus heroínas en el Ropero Mágico.',
      'El Cuarteto de la Armonía está listo. Valen, Reni, Zoe y Lía extienden sus cascos hacia ti. ¡Abre las puertas de la Gran Biblioteca y comienza tu leyenda!'
    ],
    quote: '«¡Toma tus artefactos, confía en tu mente y devuélvele la luz al cielo de Lumiria!»',
    auraColor: '#FFD166'
  }
];

class StorybookManager {
  constructor() {
    this.currentChapterIndex = 0;
    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;
    this.isAnimPlaying = true;
    this.isSpeaking = false;
    this.audioCtx = null;
    this.particles = [];
  }

  init() {
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
  }

  initParticles() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.offsetWidth || 320;
    this.canvas.height = this.canvas.offsetHeight || 240;
    this.particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 0.8,
        color: ['#FFC8DD', '#FFD166', '#A2D2FF', '#CDB4DB', '#FFFFFF'][Math.floor(Math.random() * 5)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }
  }

  startCanvasAnimation() {
    const loop = () => {
      if (this.isAnimPlaying && this.ctx && this.canvas) {
        this.drawCanvas();
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  drawCanvas() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Subtle cosmic vignette
    const grad = this.ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.5);
    grad.addColorStop(0, 'rgba(157, 78, 221, 0.2)');
    grad.addColorStop(1, 'rgba(19, 14, 31, 0.7)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Draw Constellation Lines between nearby particles
    this.ctx.strokeStyle = 'rgba(255, 209, 102, 0.15)';
    this.ctx.lineWidth = 0.8;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw glowing star particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
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
      charWrapper.innerHTML = `<svg class="vq-anim-float" aria-hidden="true"><use href="#${ch.symbolId}"></use></svg>`;
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
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no admite síntesis de voz.');
      return;
    }

    window.speechSynthesis.cancel();
    const ch = CHAPTERS[this.currentChapterIndex];
    const fullText = `${ch.title}. ${ch.paragraphs.join(' ')} ${ch.quote}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    const btn = document.getElementById('btn-read-aloud');

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-off"></use></svg> <span>Pausar Narración</span>';
      }
    };

    utterance.onend = utterance.onerror = () => {
      this.isSpeaking = false;
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-speech"></use></svg> <span>Escuchar Historia</span>';
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    const btn = document.getElementById('btn-read-aloud');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-speech"></use></svg> <span>Escuchar Historia</span>';
    }
  }

  playPageTurnSound() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio autoplay policy fallback
    }
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
        animToggleBtn.innerHTML = this.isAnimPlaying
          ? '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-sparkles"></use></svg> <span>Animación Activa</span>'
          : '<svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-moon"></use></svg> <span>Pausada</span>';
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
        localStorage.setItem('vq-theme', nextTheme);
        this.syncThemeButton();
      });
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
    const themeBtn = document.getElementById('btn-toggle-theme');
    const currentTheme = document.documentElement.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const isDark = currentTheme === 'dark';
    if (themeBtn) {
      themeBtn.innerHTML = isDark
        ? '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sun"></use></svg>'
        : '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-moon"></use></svg>';
      themeBtn.title = isDark ? 'Modo Día Pastel' : 'Modo Noche Astral';
    }
  }
}

// Boot Storybook Manager on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const storybook = new StorybookManager();
  storybook.init();
});
