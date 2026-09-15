/**
 * ValenQuest Web Component: <vq-footer>
 * Componente nativo encapsulado para el pie de página de la aplicación.
 * Muestra las insignias de confiabilidad (Rust + WASM, Privacidad Offline, RAE), enlaces rápidos y licencias.
 */
export class VqFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <!-- Footer Compacto y Sin Duplicados: Reino de Lumiria -->
    <footer class="app-footer" role="contentinfo">
      <div class="footer-top">
        <div class="footer-brand">
          <svg class="vq-icon" aria-hidden="true"><use href="#vq-icon-unicorn"></use></svg>
          <span>ValenQuest: Lumiria</span>
        </div>
        <p class="footer-motto">
          Aventuras pedagógicas de matemáticas y fluidez lectora para educación primaria.
        </p>
      </div>

      <!-- Garantías compactas en una sola línea -->
      <div class="footer-badges-compact" aria-label="Garantías del sistema">
        <span class="footer-badge-item">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-bolt"></use></svg>
          <span>Rust + WASM</span>
        </span>
        <span class="footer-dot-sep" aria-hidden="true">•</span>
        <span class="footer-badge-item">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-lock"></use></svg>
          <span>100% Offline &amp; Privado</span>
        </span>
        <span class="footer-dot-sep" aria-hidden="true">•</span>
        <span class="footer-badge-item">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-reading"></use></svg>
          <span>Fluidez RAE</span>
        </span>
      </div>

      <!-- Enlaces útiles no duplicados -->
      <div class="footer-links-row" aria-label="Enlaces rápidos">
        <a href="wardrobe.html" class="footer-link">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-wardrobe"></use></svg>
          <span>Ropero Mágico</span>
        </a>
        <span class="footer-dot-sep" aria-hidden="true">•</span>
        <a href="story.html" class="footer-link">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-scroll"></use></svg>
          <span>El Gran Libro</span>
        </a>
        <span class="footer-dot-sep" aria-hidden="true">•</span>
        <button type="button" class="footer-link" id="btn-footer-scroll-top" title="Volver al inicio">
          <svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-arrow-up"></use></svg>
          <span>Subir</span>
        </button>
      </div>

      <!-- Pie de página final con licencias duales -->
      <div class="footer-bottom">
        <p>ValenQuest v1.1.0 © 2026 • Licencias código abierto <a href="LICENSE.md" target="_blank" class="footer-license-link">MIT &amp; Apache-2.0</a></p>
      </div>
    </footer>
    `;
  }
}

if (!customElements.get('vq-footer')) {
  customElements.define('vq-footer', VqFooter);
}
