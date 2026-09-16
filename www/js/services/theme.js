/**
 * ValenQuest Theme Service
 * Gestor unificado del tema (Modo Día Pastel / Modo Noche Astral) para todo el reino de Lumiria.
 * Garantiza persistencia instantánea y sincronización homogénea entre todas las páginas HTML.
 */

class ThemeService {
  constructor() {
    this.STORAGE_KEY = 'vq-theme';
    this.listeners = new Set();
    this.init();
  }

  init() {
    const currentTheme = this.getTheme();
    this.applyTheme(currentTheme, false);

    // Sincronizar en cuanto el DOM del body esté listo si aún no lo estaba
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.applyTheme(this.getTheme(), false);
          this.syncButton();
        });
      } else {
        this.applyTheme(currentTheme, false);
      }
    }

    // Sincronización entre pestañas en tiempo real
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.STORAGE_KEY && e.newValue) {
          this.applyTheme(e.newValue, false);
        }
      });

      // Sincronización al navegar hacia atrás o adelante (bfcache del navegador)
      window.addEventListener('pageshow', () => {
        this.applyTheme(this.getTheme(), false);
        this.syncButton();
      });

      // Escuchar cambios de preferencia del sistema si el usuario no ha forzado un tema manualmente
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.applyTheme(e.matches ? 'dark' : 'light', false);
          }
        });
      }
    }
  }

  getTheme() {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null;
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      console.warn('[ValenQuest Theme] Error reading localStorage:', e);
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      const fromAttr = document.documentElement.getAttribute('data-theme');
      if (fromAttr === 'dark' || fromAttr === 'light') return fromAttr;
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  applyTheme(theme, persist = true) {
    const activeTheme = theme === 'dark' ? 'dark' : 'light';

    if (typeof document !== 'undefined') {
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', activeTheme);
      }
      if (document.body) {
        document.body.setAttribute('data-theme', activeTheme);
      }
    }

    if (persist) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, activeTheme);
        }
      } catch (err) {
        console.warn('[ValenQuest Theme] Error saving theme:', err);
      }
    }

    this.syncButton();

    this.listeners.forEach((fn) => {
      try { fn(activeTheme); } catch (e) { console.warn(e); }
    });
  }

  toggle() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next, true);
    return next;
  }

  syncButton(btn = null) {
    if (typeof document === 'undefined') return;
    const button = btn || document.getElementById('btn-toggle-theme');
    if (!button) return;

    const isDark = this.getTheme() === 'dark';
    button.innerHTML = isDark
      ? '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-sun"></use></svg>'
      : '<svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-moon"></use></svg>';
    button.title = isDark ? 'Cambiar a Modo Día Pastel' : 'Cambiar a Modo Noche Astral';
    button.setAttribute('aria-label', isDark ? 'Cambiar a Modo Día Pastel' : 'Cambiar a Modo Noche Astral');
  }

  bindButton(btn = null) {
    if (typeof document === 'undefined') return;
    const button = btn || document.getElementById('btn-toggle-theme');
    if (!button || button._themeBound) return;
    button._themeBound = true;

    this.syncButton(button);
    button.addEventListener('click', () => {
      this.toggle();
    });
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const theme = new ThemeService();
