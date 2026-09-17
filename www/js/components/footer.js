/**
 * ValenQuest Web Component: <vq-footer>
 * Componente nativo encapsulado para el pie de página de la aplicación.
 * Muestra las insignias de confiabilidad, la versión actual oficial y la dedicatoria con amor.
 */
export class VqFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <!-- Footer Compacto: Reino de Lumiria -->
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

      <!-- Dedicatoria con amor para mis hijas -->
      <p class="footer-dedication">
        <svg class="vq-icon vq-icon--xs footer-heart-icon" aria-hidden="true"><use href="#vq-icon-heart"></use></svg>
        <span>Hecho con amor para mis hijas</span>
      </p>

      <!-- Pie de página final con versión real actual -->
      <div class="footer-bottom">
        <p>ValenQuest v2.1.0 • Edición Lumiria © 2026</p>
      </div>
    </footer>
    `;
  }
}

if (!customElements.get('vq-footer')) {
  customElements.define('vq-footer', VqFooter);
}
