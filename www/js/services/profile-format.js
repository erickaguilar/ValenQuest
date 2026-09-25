/**
 * ValenQuest Profile Formatting & Grammatical Concordance Helpers
 * Provides gender-aware titles, greetings, and personalized wording for Lumiria.
 */

export function getPlayerTitle(gender = 'neutral') {
  switch (gender) {
    case 'boy':
      return {
        welcome: '¡Bienvenido',
        explorer: 'Explorador',
        champion: 'Campeón',
        ready: 'preparado',
        brave: 'valiente',
        friend: 'amigo',
        pronoun: 'él',
      };
    case 'girl':
      return {
        welcome: '¡Bienvenida',
        explorer: 'Exploradora',
        champion: 'Campeona',
        ready: 'preparada',
        brave: 'valiente',
        friend: 'amiga',
        pronoun: 'ella',
      };
    case 'neutral':
    default:
      return {
        welcome: '¡Te damos la bienvenida',
        explorer: 'Aventurero',
        champion: 'Gran Guía',
        ready: 'con todo listo',
        brave: 'valiente',
        friend: 'amigo estelar',
        pronoun: 'neutral',
      };
  }
}

/**
 * Returns the personalized welcome headline HTML for the Hub (index.html).
 */
export function getWelcomeHeadlineHtml(profile) {
  const name = (profile?.name && profile.name.trim()) || 'Aventurero';
  const gender = profile?.gender || 'neutral';
  const title = getPlayerTitle(gender);

  if (gender === 'neutral') {
    return `${title.welcome} a <span>Lumiria</span>, <span class="player-name-highlight">${escapeHtml(name)}</span>!`;
  }
  return `${title.welcome} a tu Aventura en <span>Lumiria</span>, <span class="player-name-highlight">${escapeHtml(name)}</span>!`;
}

/**
 * Returns a personalized voice greeting spoken by the active heroine.
 */
export function getPersonalizedVoiceGreeting(profile, heroineName = 'Valen') {
  const name = (profile?.name && profile.name.trim()) || 'Aventurero';
  const gender = profile?.gender || 'neutral';

  if (gender === 'boy') {
    return `¡Hola, ${name}! ¡Qué alegría tenerte en Lumiria, valiente explorador! Soy ${heroineName}. ¡Vamos a aprender juntos!`;
  } else if (gender === 'girl') {
    return `¡Hola, ${name}! ¡Qué alegría tenerte en Lumiria, valiente exploradora! Soy ${heroineName}. ¡Vamos a aprender juntas!`;
  }
  return `¡Hola, ${name}! ¡Qué alegría tenerte en Lumiria! Soy ${heroineName}. ¡Vamos a comenzar esta gran aventura!`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
