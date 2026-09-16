/**
 * ValenQuest: Icon System Service (icons.js)
 * Carga de forma centralizada y asíncrona la biblioteca de iconos SVG
 * desde assets/icons.svg y assets/heroines.svg, desacoplando los 700+ renglones
 * duplicados en los HTML y optimizando el rendimiento PWA local-first.
 */

let spritesLoaded = false;
let spritesLoadingPromise = null;

/**
 * Carga e inyecta los sprites SVG en el DOM si no están presentes.
 * Utiliza sessionStorage para resolución instantánea (0ms) en transiciones de página.
 */
export async function loadSvgSprites() {
  if (typeof document === 'undefined') return;

  if (spritesLoaded || document.getElementById('vq-svg-sprite-container')) {
    spritesLoaded = true;
    return;
  }

  if (spritesLoadingPromise) {
    return spritesLoadingPromise;
  }

  spritesLoadingPromise = (async () => {
    const doInject = (svgContent) => {
      const attach = () => {
        let container = document.getElementById('vq-svg-sprite-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'vq-svg-sprite-container';
          container.style.display = 'none';
          container.setAttribute('aria-hidden', 'true');
          if (document.body) {
            document.body.insertBefore(container, document.body.firstChild);
          } else {
            document.documentElement.appendChild(container);
          }
        }
        container.innerHTML = svgContent;
        spritesLoaded = true;
      };

      if (document.body) {
        attach();
      } else {
        document.addEventListener('DOMContentLoaded', attach);
      }
    };

    // 1. Inyección ultrarrápida desde caché de sesión si está disponible (0ms)
    try {
      const cachedIcons = sessionStorage.getItem('vq_icons_svg');
      const cachedHeroines = sessionStorage.getItem('vq_heroines_svg');
      if (cachedIcons && cachedHeroines) {
        doInject(cachedIcons + cachedHeroines);
        return;
      }
    } catch (_) {}

    // 2. Carga asíncrona desde assets/icons.svg y assets/heroines.svg
    try {
      const [iconsRes, heroinesRes] = await Promise.all([
        fetch('assets/icons.svg').catch((e) => {
          console.warn('⚠️ [Icons] Error al cargar assets/icons.svg:', e);
          return null;
        }),
        fetch('assets/heroines.svg').catch((e) => {
          console.warn('⚠️ [Icons] Error al cargar assets/heroines.svg:', e);
          return null;
        }),
      ]);

      let combinedSvg = '';

      if (iconsRes && iconsRes.ok) {
        const iconsText = await iconsRes.text();
        combinedSvg += iconsText;
        try {
          sessionStorage.setItem('vq_icons_svg', iconsText);
        } catch (_) {}
      }

      if (heroinesRes && heroinesRes.ok) {
        const heroinesText = await heroinesRes.text();
        combinedSvg += heroinesText;
        try {
          sessionStorage.setItem('vq_heroines_svg', heroinesText);
        } catch (_) {}
      }

      if (combinedSvg) {
        doInject(combinedSvg);
      }
    } catch (err) {
      console.warn('⚠️ [Icons] No se pudieron cargar los sprites SVG:', err);
    }
  })();

  return spritesLoadingPromise;
}

/**
 * Renderiza una etiqueta de icono SVG accesible
 * @param {string} name - Nombre del icono (ej. 'star', 'crown', o 'vq-icon-star')
 * @param {string} [extraClass=''] - Clases utilitarias adicionales (ej. 'vq-icon--sm')
 * @returns {string} Markup HTML
 */
export function renderIcon(name, extraClass = '') {
  const cls = extraClass ? `vq-icon ${extraClass}` : 'vq-icon';
  const symbolId = name.startsWith('vq-') ? name : `vq-icon-${name}`;
  return `<svg class="${cls}" aria-hidden="true"><use href="#${symbolId}"></use></svg>`;
}

// Disparo automático al evaluar el módulo en entorno navegador
if (typeof window !== 'undefined') {
  loadSvgSprites().catch(() => {});
}
