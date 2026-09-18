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

import { theme } from './services/theme.js';
import { loadSvgSprites } from './services/icons.js';

const CHAPTERS = [
  {
    id: 1,
    number: 'Capítulo I',
    title: 'El Gran Grimorio y las Cuatro Razas',
    heroineId: 'valen',
    symbolId: 'vq-icon-unicorn',
    characterName: 'El Reino de Lumiria',
    characterSubtitle: 'La Alianza del Templo Supremo',
    sceneType: 'kingdom',
    dropCap: 'E',
    paragraphs: [
      'n los tiempos dorados de Lumiria, la armonía de todo el cosmos descansaba sobre las páginas resplandecientes del Gran Grimorio de Cristal. Custodiado en la cúspide del Templo Supremo, este libro sagrado albergaba los dos pilares del saber: las fórmulas numéricas doradas que mantenían girando a las constelaciones y los pergaminos sagrados de la lectura que daban voz al pensamiento.',
      'Durante siglos, cuatro nobles linajes de ponis vivieron en fraternal equilibrio: los majestuosos Alicornios guardianes del firmamento, los intrépidos Pegasos dueños de los vientos, los laboriosos Ponis Terrestres cimientos de la naturaleza, y los místicos Unicornios tejedores de cristales.',
      'Juntos formaban una civilización donde el conocimiento no era un deber aburrido, sino una fiesta diaria de descubrimientos, risas y estrellas brillantes.'
    ],
    quote: '«Donde cuatro razas comparten su luz con nobleza, ninguna sombra puede oscurecer el firmamento.»',
    auraColor: '#FFC8DD'
  },
  {
    id: 2,
    number: 'Capítulo II',
    title: 'La Emperatriz Eclipse y el Sueño del Olvido',
    heroineId: 'valen',
    symbolId: 'vq-heroine-eclipse',
    characterName: 'La Emperatriz Eclipse',
    characterSubtitle: 'Soberana de la Noche Estelar • El Velo de la Duda',
    sceneType: 'eclipse',
    dropCap: 'P',
    paragraphs: [
      'ero la paz cósmica fue puesta a prueba cuando la Emperatriz Eclipse, abrumada por el temor a que la luz de las estrellas llegara a extinguirse, intentó congelar el tiempo. En su desesperación, desató el Sueño del Olvido, una densa bruma violácea que envolvió a los valles y torres de Lumiria.',
      'El impacto del hechizo fue devastador: el Gran Grimorio de Cristal se fragmentó en diez páginas sagradas que salieron disparadas hacia los rincones más lejanos del reino. Al mismo tiempo, los nueve guardianes astrales cayeron en un profundo letargo, olvidando su misión y bloqueando los templos con acertijos dormidos.',
      'Las palabras se desordenaron, los números se cubrieron de polvo y el cielo nocturno quedó a oscuras. Solo la luz de una verdadera amistad podría despertar a los durmientes.'
    ],
    quote: '«El miedo nos hace olvidar lo que sabemos; el amor y la constancia nos devuelven la memoria.»',
    auraColor: '#7B2CBF'
  },
  {
    id: 3,
    number: 'Capítulo III',
    title: 'Valen, la Princesa Astral',
    heroineId: 'valen',
    symbolId: 'vq-heroine-valen',
    characterName: 'Valen la Princesa Astral',
    characterSubtitle: 'Alicornio Real • Magia y Liderazgo',
    sceneType: 'valen',
    dropCap: 'V',
    paragraphs: [
      'alen nació bajo la bendición de las dos lunas de Lumiria, dotada con las alas emplumadas de un pegaso y el cuerno brillante de un unicornio. Como líder del Cuarteto de la Armonía, su corazón no conoce el desánimo: donde otros ven sombras, Valen ve la oportunidad de recomenzar.',
      'En su pecho late el Prisma Real, una joya ancestral tallada en cuarzo estelar. Cuando un aprendiz enfrenta un desafío difícil y se siente abrumado por opciones confusas, Valen canaliza su prisma para refractar la verdad, tachar dos caminos erróneos y activar un multiplicador que duplica todas las estrellas ganadas.',
      '«No temas al tropiezo, valiente heroína», dice Valen con una sonrisa cálida. «Cada intento sincero es un chispazo que enciende de nuevo el firmamento.»'
    ],
    quote: '«¡El Prisma Real refracta la verdad y duplica tus estrellas para el Ropero Mágico!»',
    auraColor: '#FFAFCC'
  },
  {
    id: 4,
    number: 'Capítulo IV',
    title: 'Reni, el Alquimista de los Vientos',
    heroineId: 'reni',
    symbolId: 'vq-heroine-reni',
    characterName: 'Reni el Alquimista de los Vientos',
    characterSubtitle: 'Pegaso de Nimbus • Dominio del Tiempo',
    sceneType: 'reni',
    dropCap: 'E',
    paragraphs: [
      'n los acantilados flotantes de Nimbus habita Reni, un pegaso de melena celeste como el mediodía y alas veloces como relámpagos. Durante su entrenamiento entre tempestades, Reni descubrió la mayor lección de los cielos: correr sin pensar conduce a la tormenta; la verdadera maestría surge de la serenidad.',
      'Cuando el reloj del desafío parece correr con prisa y la angustia asoma en el pecho, Reni bate sus alas celestes e invoca la Brisa Temporal. El tiempo exterior se congela con suavidad, los vientos se aquietan y el estudiante recibe calma absoluta para razonar el problema sin presión.',
      'Con Reni a tu lado, la urgencia desaparece. Descubrirás que respirar hondo y pensar paso a paso es el superpoder más veloz de todo el reino.'
    ],
    quote: '«¡Reni despeja el viento para darte tiempo! Respira hondo y piensa con calma.»',
    auraColor: '#A2D2FF'
  },
  {
    id: 5,
    number: 'Capítulo V',
    title: 'Zoe, el Ancla de la Naturaleza',
    heroineId: 'zoe',
    symbolId: 'vq-heroine-zoe',
    characterName: 'Zoe el Ancla de la Naturaleza',
    characterSubtitle: 'Poni Terrestre • Fuerza y Resiliencia',
    sceneType: 'zoe',
    dropCap: 'D',
    paragraphs: [
      'esde el frondoso Valle de los Brotes Verdes llega Zoe, una poni terrestre con la firmeza de los robles centenarios y la ternura de los pétalos de menta. Sus cascos están conectados al corazón mismo de la tierra, reconociendo el valor de la perseverancia.',
      'Cuando un estudiante se equivoca en una respuesta, Zoe no permite que la frustración apague su entusiasmo. Clava sus cuatro cascos y despliega el Escudo de Raíces: una muralla de brotes esmeralda que sostiene la racha de aciertos sin que se rompa, y activa una voz guiada que explica el reto con paciencia infinita.',
      '«Los errores no son fracasos», susurra Zoe mientras brotan flores a su paso. «Son las semillas donde germina tu inteligencia más luminosa.»'
    ],
    quote: '«¡Mis raíces sostienen tu camino! Lo resolveremos paso a pasito, sin temor.»',
    auraColor: '#B8F2E6'
  },
  {
    id: 6,
    number: 'Capítulo VI',
    title: 'Lía, la Maga del Cristal Cósmico',
    heroineId: 'lia',
    symbolId: 'vq-heroine-lia',
    characterName: 'Lía la Maga del Cristal',
    characterSubtitle: 'Unicornio Místico • Telequinesis y Ciencia',
    sceneType: 'lia',
    dropCap: 'E',
    paragraphs: [
      'n lo alto de las Agujas Celestiales, rodeada de telescopios de prisma y astrolabios de amatista, estudia Lía. Es la unicornio más sabia de Lumiria, capaz de percibir la melodía oculta en cada número y el ritmo sonoro en cada sílaba de la lengua castellana.',
      'Cuando un problema matemático requiere descomponer decenas o una palabra esconde diptongos e hiatos misteriosos, Lía enciende su cuerno y proyecta el Foco de Cristal. Un rayo de luz telequinética violeta resalta el acarreo exacto, las columnas numéricas o la sílaba tónica, guiando la mente del estudiante con precisión.',
      'Lía te enseña que los enigmas son como joyas sin pulir: cuando sabes dónde mirar, su belleza brilla de inmediato.'
    ],
    quote: '«¡Mi cuerno de cristal enfoca el camino! Observa la pista luminosa que danza para ti.»',
    auraColor: '#C77DFF'
  },
  {
    id: 7,
    number: 'Capítulo VII',
    title: 'La Travesía de las Diez Lunas y los Tres Actos',
    heroineId: 'valen',
    symbolId: 'vq-icon-journey',
    characterName: 'El Mapa de los Diez Templos',
    characterSubtitle: 'Del Manantial al Trono Estelar',
    sceneType: 'temples',
    dropCap: 'E',
    paragraphs: [
      'Para devolver la luz a Lumiria, el Cuarteto de la Armonía trazó la Travesía de las Diez Lunas, dividida en tres grandes actos de aprendizaje:',
      'En el Acto I (El Despertar de los Elementos), viajaremos al Manantial de Rocío del Poni Burbuja, al Bosque Susurrante del Hada Ciervo y al Vértice de Algodón del Pegaso Melódico. En el Acto II (Los Secretos Olvidados), nos adentraremos en la Caverna de Ámbar del Búho de Piedra, el Palacio Prisma del León de Espejos, el Reloj de las Arenas de la Esfinge y el Mar de Coral de la Sirena Dragón.',
      'Y en el Acto III (La Gran Purificación), alcanzaremos la Muralla de Nácar del Gólem de Cuarzo, la Cúspide de la Aurora del Fénix Boreal y el Trono Supremo de las Estrellas, donde liberaremos a la Emperatriz Eclipse de su coraza sombría para restaurarla como Soberana Astral de la Noche.'
    ],
    quote: '«Diez templos astrales, nueve guardianes por despertar y una corona esperando ser purificada.»',
    auraColor: '#FFD166'
  },
  {
    id: 8,
    number: 'Capítulo VIII',
    title: 'Los Portales Bifásicos y Tu Gran Misión',
    heroineId: 'valen',
    symbolId: 'vq-icon-sparkles',
    characterName: 'Tu Despertar en Lumiria',
    characterSubtitle: 'La Quinta Estrella de la Armonía',
    sceneType: 'portal',
    dropCap: 'L',
    paragraphs: [
      'Los antiguos sabios grabaron en las puertas de cada templo la Regla de Oro de los Portales Bifásicos: nunca te precipites. Cada portal se abre en dos tiempos: en la Fase 1, escucharás la historia del guardián en total calma y sin números que te presionen; en la Fase 2, desatarás tu mente para resolver el acertijo y purificar el cristal.',
      'Por cada luna que completes con maestría, el Ropero Mágico te entregará reliquias ancestrales: la Tiara de Rocío, el Lazo de Viento, las Alas de Pluma Dulce, hasta la mítica Corona Suprema de Soberana Astral.',
      'La profecía se cumple en este instante. Valen, Reni, Zoe y Lía ya te esperan en la Gran Biblioteca. ¡Empuña tus artefactos, confía en tu inteligencia y devuelve la luz al firmamento de Lumiria!'
    ],
    quote: '«¡Tú eres la heroína elegida! Abre tus alas, resuelve los misterios y haz brillar las estrellas.»',
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
    this.isMusicPlaying = false;
    this.audioCtx = null;
    this.musicTimer = null;
    this.particles = [];
    this.sceneAngle = 0;
  }

  init() {
    loadSvgSprites();
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
        btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-off"></use></svg> <span>Pausar a Orión</span>';
      }
    };

    utterance.onend = utterance.onerror = () => {
      this.isSpeaking = false;
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-owl"></use></svg> <span>Voz de Orión</span>';
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
      btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-owl"></use></svg> <span>Voz de Orión</span>';
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

  toggleMusicBox() {
    if (this.isMusicPlaying) {
      this.stopMusicBox();
    } else {
      this.startMusicBox();
    }
  }

  startMusicBox() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isMusicPlaying = true;
      const btn = document.getElementById('btn-toggle-music');
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sound-on"></use></svg> <span>Música Activa</span>';
      }

      // Fairy princess music box arpeggios (C major pentatonic lullaby)
      // Notes: C5 (523), D5 (587), E5 (659), G5 (783), A5 (880), C6 (1046)
      const melody = [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 587.33, 523.25, 783.99, 1046.50, 880.00];
      let step = 0;

      const playNextNote = () => {
        if (!this.isMusicPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const freq = melody[step % melody.length];
        step++;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Music box bell chime decay
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.6);

        this.musicTimer = setTimeout(playNextNote, 320);
      };

      playNextNote();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  stopMusicBox() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    const btn = document.getElementById('btn-toggle-music');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-music-wand, #vq-icon-quill"></use><use href="#vq-icon-sparkles"></use></svg> <span>Cajita Musical</span>';
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

    // Music Box Toggle button
    const musicBtn = document.getElementById('btn-toggle-music');
    if (musicBtn) musicBtn.addEventListener('click', () => this.toggleMusicBox());

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
