/**
 * ValenQuest: La Leyenda de las Diez Lunas de Lumiria
 * Catálogo Canónico de Progresión Curricular, Narrativa en Tres Actos,
 * Guardianes Astrales, Micro-cuentos y Desafíos de Portal.
 * Carga asíncrona desacoplada desde data/levels.json.
 */

export let TEN_MOONS_LEVELS = [];
export let ACT_TRANSITIONS = {};

/**
 * Carga de forma asíncrona el catálogo curricular completo desde data/levels.json
 */
export async function loadLevelsData() {
  if (TEN_MOONS_LEVELS && TEN_MOONS_LEVELS.length > 0) {
    return { levels: TEN_MOONS_LEVELS, actTransitions: ACT_TRANSITIONS };
  }
  try {
    const res = await fetch('data/levels.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    TEN_MOONS_LEVELS = data.levels || [];
    ACT_TRANSITIONS = data.actTransitions || {};
    return data;
  } catch (err) {
    console.warn('⚠️ [LevelsData] Could not fetch data/levels.json, using fallback:', err);
    return { levels: TEN_MOONS_LEVELS, actTransitions: ACT_TRANSITIONS };
  }
}

// Auto-trigger load on module evaluation in browser
if (typeof window !== 'undefined') {
  loadLevelsData().catch(() => {});
}

/**
 * Devuelve la configuración de nivel por ID (1 a 10)
 */
export function getLevelData(levelId) {
  const clamped = Math.max(1, Math.min(10, parseInt(levelId, 10) || 1));
  if (TEN_MOONS_LEVELS && TEN_MOONS_LEVELS.length > 0) {
    return TEN_MOONS_LEVELS.find((lvl) => lvl.id === clamped) || TEN_MOONS_LEVELS[0];
  }
  return {
    id: clamped,
    act: clamped <= 3 ? 1 : clamped <= 7 ? 2 : 3,
    actTitle: clamped <= 3 ? 'Acto I: El Despertar de los Elementos' : clamped <= 7 ? 'Acto II: Los Secretos Olvidados de Cristal' : 'Acto III: La Gran Purificación',
    name: 'Templo Astral',
    templeTitle: 'Templo de Lumiria',
    pageNumber: clamped,
    guardian: { name: 'Guardián Astral', emoji: '✨' },
    portalRiddle: { prompt: '', options: [1, 2, 3, 4], correctAnswer: 1 },
    reward: { itemId: 'tiara-basica', name: 'Tiara Astral' }
  };
}

/**
 * Devuelve los metadatos de transición cósmica por número de Acto (1, 2 o 3)
 */
export function getActTransitionData(actNumber) {
  const num = parseInt(actNumber, 10) || 1;
  return (ACT_TRANSITIONS && ACT_TRANSITIONS[num]) || (ACT_TRANSITIONS && ACT_TRANSITIONS[1]) || {
    actNumber: num,
    actTitle: 'Acto Concluido',
    completedPill: '¡Acto Concluido!',
    headline: '¡Victoria de Acto!',
    tagline: 'Has liberado los templos de Lumiria.',
    guardians: [],
    loreQuote: '',
    voiceNarration: '¡Felicidades!',
    nextActNumber: num + 1,
    nextActTitle: 'Siguiente Acto',
    buttonText: '¡Continuar Aventura! 🚀'
  };
}
