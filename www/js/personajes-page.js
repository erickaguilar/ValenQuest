/**
 * ValenQuest: Códice de Personajes (personajes-page.js)
 * Visor de administración del reparto: heroínas, guardianes, lore y el mapa
 * de relaciones templo → guardián → capítulo → recompensa.
 *
 * Solo LEE los SSOT (companions.js, levels.json, story-chapters.json);
 * el contenido se edita en esos archivos, nunca aquí.
 */

import { sound } from './services/audio.js';
import { HEROINES, getIntroDialogue } from './services/companions.js';
import { TEMPLE_CHAPTER_UNLOCKS } from './services/adventure.js';
import { loadSvgSprites } from './services/icons.js';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const LORE_FIGURES = [
  {
    id: 'orion',
    name: 'Maestro Orión',
    role: 'Búho sabio • Mentor y narrador',
    symbolId: 'vq-icon-owl',
    element: 'Voz masculina del TTS',
    power: 'Narración karaoke de micro-cuentos y saludos de cada página',
    voice: 'Voz masculina y sabia del TTS; a veces pregunta en vez de responder.',
    presence: 'Global: saludos, micro-cuentos de portal y guía de poderes.',
    lore: 'Custodio del Gran Grimorio antes del Sueño del Olvido. No combate: enseña. Su ignorancia es selectiva — a veces pregunta para que la niña responda.',
  },
  {
    id: 'eclipse',
    name: 'Emperatriz Eclipse',
    role: 'Soberana de la Noche • Antagonista redimida',
    symbolId: 'vq-heroine-eclipse',
    element: 'El Velo de la Duda',
    power: 'Sueño del Olvido: fragmentó el Grimorio en diez páginas',
    voice: 'La mejor escrita del reparto: no es malvada, tiene miedo a que la luz se extinga.',
    presence: 'Capítulo II (origen), Templo 10 (redención) y transiciones de acto.',
    lore: 'Su miedo congela el tiempo y dispersa los sellos. Al purificar los diez templos, vuelve como Soberana Astral: la victoria es reconciliación, no derrota.',
  },
];

async function loadJson(path, fallback) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Codex] Sin ${path}, respaldo mínimo:`, err?.message || err);
    return fallback;
  }
}

function heroineRewards(heroineId, levels) {
  return levels
    .filter((l) => l.reward && l.reward.heroineId === heroineId)
    .map((l) => `T${l.id} · ${l.reward.name}`);
}

function heroineChapters(heroineId, chapters) {
  return chapters
    .filter((c) => c.heroineId === heroineId)
    .map((c) => c.number || `Cap. ${c.id}`);
}

function renderHeroines(levels, chapters) {
  const grid = document.getElementById('codex-heroines-grid');
  if (!grid) return;
  grid.innerHTML = Object.values(HEROINES).map((h) => {
    const rewards = heroineRewards(h.id, levels);
    const chaps = heroineChapters(h.id, chapters);
    return `
    <article class="codex-card" aria-label="Ficha de ${esc(h.name)}">
      <div class="codex-card-avatar" aria-hidden="true">
        <svg class="vq-icon" aria-hidden="true"><use href="#${esc(h.symbolId || 'vq-icon-star')}"></use></svg>
      </div>
      <h4 class="codex-card-name">${esc(h.name)}</h4>
      <p class="codex-card-role">${esc(h.raceName || h.race)} • ${esc(h.title)}</p>
      <div class="codex-pills">
        <span class="codex-pill">${esc(h.element || '')}</span>
        <span class="codex-pill">${esc(h.powerName || '')}</span>
      </div>
      <p class="codex-card-text">${esc(h.powerDescription || '')}</p>
      <blockquote class="codex-card-quote">${getIntroDialogue(h.id)}</blockquote>
      <p class="codex-card-text muted">Voz: ${esc(h.voiceQuote || '—')}</p>
      <details>
        <summary>Relaciones (${rewards.length} recompensas · ${chaps.length} capítulos)</summary>
        <ul>
          <li><strong>Recompensas:</strong> ${rewards.length ? esc(rewards.join(' · ')) : '—'}</li>
          <li><strong>Capítulos:</strong> ${chaps.length ? esc(chaps.join(' · ')) : '—'}</li>
        </ul>
      </details>
    </article>`;
  }).join('');
}

function renderGuardians(levels, chapters) {
  const grid = document.getElementById('codex-guardians-grid');
  if (!grid) return;
  const byId = new Map(chapters.map((c) => [c.id, c]));
  grid.innerHTML = levels.map((l) => {
    const g = l.guardian || {};
    const rewardHero = (l.reward && HEROINES[l.reward.heroineId]?.name) || '—';
    const unlockId = TEMPLE_CHAPTER_UNLOCKS[l.id];
    const unlockCh = unlockId ? byId.get(unlockId) : null;
    const riddle = l.portalRiddle || {};
    return `
    <article class="codex-card" aria-label="Ficha de ${esc(g.name || ('Templo ' + l.id))}">
      <div class="codex-card-avatar" aria-hidden="true">
        <svg class="vq-icon" aria-hidden="true"><use href="#${esc(g.symbolId || 'vq-icon-sparkles')}"></use></svg>
      </div>
      <h4 class="codex-card-name">${esc(g.name || 'Guardián')}</h4>
      <p class="codex-card-role">${esc(g.title || '')}${g.species ? ` • ${esc(g.species)}` : ''}</p>
      <div class="codex-pills">
        <span class="codex-pill">T${l.id} · ${esc(l.name)}</span>
        <span class="codex-pill">${esc(l.actTitle ? l.actTitle.split(':')[0] : '')}</span>
      </div>
      <p class="codex-card-text muted">Eje mate: ${esc(l.mathAxis || '—')}</p>
      <p class="codex-card-text muted">Eje lector: ${esc(l.readingAxis || '—')}</p>
      <details>
        <summary>Micro-cuento, acertijo y recompensa</summary>
        <ul>
          ${(l.microCuento || []).map((v) => `<li>${esc(v)}</li>`).join('')}
          <li><strong>Acertijo:</strong> ${esc(riddle.prompt || '—')}</li>
          <li><strong>Respuesta:</strong> ${esc(riddle.correctAnswer ?? '—')} <em>(${esc(riddle.explanation || '')})</em></li>
          <li><strong>Recompensa:</strong> ${esc(l.reward ? l.reward.name : '—')} → ${esc(rewardHero)}</li>
          <li><strong>Desbloquea:</strong> ${unlockCh ? esc(`${unlockCh.number || ('Cap. ' + unlockCh.id)} · ${unlockCh.title}`) : '—'}</li>
        </ul>
      </details>
    </article>`;
  }).join('');
}

function renderLore() {
  const grid = document.getElementById('codex-lore-grid');
  if (!grid) return;
  grid.innerHTML = LORE_FIGURES.map((f) => `
    <article class="codex-card" aria-label="Ficha de ${esc(f.name)}">
      <div class="codex-card-avatar" aria-hidden="true">
        <svg class="vq-icon" aria-hidden="true"><use href="#${esc(f.symbolId)}"></use></svg>
      </div>
      <h4 class="codex-card-name">${esc(f.name)}</h4>
      <p class="codex-card-role">${esc(f.role)}</p>
      <div class="codex-pills"><span class="codex-pill">${esc(f.element)}</span></div>
      <p class="codex-card-text"><strong>Poder:</strong> ${esc(f.power)}</p>
      <p class="codex-card-text"><strong>Voz:</strong> ${esc(f.voice)}</p>
      <p class="codex-card-text muted"><strong>Presencia:</strong> ${esc(f.presence)}</p>
      <p class="codex-card-text">${esc(f.lore)}</p>
    </article>`).join('');
}

function renderRelations(levels, chapters) {
  const body = document.getElementById('codex-relations-body');
  if (!body) return;
  const byId = new Map(chapters.map((c) => [c.id, c]));
  body.innerHTML = levels.map((l) => {
    const g = l.guardian || {};
    const unlockId = TEMPLE_CHAPTER_UNLOCKS[l.id];
    const unlockCh = unlockId ? byId.get(unlockId) : null;
    const rewardHero = (l.reward && HEROINES[l.reward.heroineId]?.name) || '—';
    return `
    <tr>
      <td><strong>T${l.id}</strong> · ${esc(l.name)}</td>
      <td><svg class="mini-avatar" aria-hidden="true"><use href="#${esc(g.symbolId || 'vq-icon-sparkles')}"></use></svg>${esc(g.name || '—')}</td>
      <td>${esc(l.actTitle ? l.actTitle.split(':')[0] : '')}</td>
      <td>${unlockCh ? esc(`${unlockCh.number || ('Cap. ' + unlockCh.id)}`) : '—'}</td>
      <td>${esc(l.reward ? l.reward.name : '—')} <em>(${esc(rewardHero)})</em></td>
    </tr>`;
  }).join('');
}

function setupFilters() {
  const btns = document.querySelectorAll('.codex-filter-btn');
  const sections = {
    heroines: document.getElementById('codex-heroines-section'),
    guardians: document.getElementById('codex-guardians-section'),
    lore: document.getElementById('codex-lore-section'),
  };
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      try { sound.playClick(); } catch {}
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      for (const [key, sec] of Object.entries(sections)) {
        if (sec) sec.hidden = f !== 'all' && f !== key;
      }
    });
  });
}

async function init() {
  await loadSvgSprites();
  setupFilters();
  const [levelsData, storyData] = await Promise.all([
    loadJson('data/levels.json', { levels: [] }),
    loadJson('data/story-chapters.json', { chapters: [] }),
  ]);
  const levels = Array.isArray(levelsData.levels) ? levelsData.levels : [];
  const chapters = Array.isArray(storyData.chapters) ? storyData.chapters : [];

  renderHeroines(levels, chapters);
  renderGuardians(levels, chapters);
  renderLore();
  renderRelations(levels, chapters);

  const pill = document.getElementById('codex-count-pill');
  if (pill) {
    const nHero = Object.keys(HEROINES).length;
    pill.textContent = `${nHero} heroínas • ${levels.length} templos • ${chapters.length} capítulos`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init().catch((e) => console.warn('[Codex]', e)));
} else {
  init().catch((e) => console.warn('[Codex]', e));
}
