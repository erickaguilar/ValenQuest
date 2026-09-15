/**
 * KidsLearn-WASM WebAssembly Module Loader
 * Handles asynchronous initialization, memory linking, and fallback detection.
 */

let wasmModule = null;
let initPromise = null;

export async function loadWasm() {
  if (wasmModule) {
    return wasmModule;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Dynamic import of the wasm-pack generated ES module
      const module = await import('../../pkg/kidslearn_wasm.js');
      // Initialize WebAssembly memory instance
      await module.default();
      wasmModule = module;
      console.log('✅ [KidsLearn-WASM] Engine initialized:', module.get_engine_version ? module.get_engine_version() : 'OK');
      return wasmModule;
    } catch (err) {
      console.error('❌ [KidsLearn-WASM] Failed to load WebAssembly module:', err);
      showWasmErrorBanner(err);
      throw err;
    }
  })();

  return initPromise;
}

function showWasmErrorBanner(err) {
  const container = document.getElementById('wasm-status-banner');
  if (container) {
    container.hidden = false;
    container.innerHTML = `
      <div class="wasm-alert">
        <strong>⚠️ Error al inicializar el motor WebAssembly</strong>
        <p>Asegúrate de servir la aplicación mediante un servidor HTTP local:</p>
        <code>python3 -m http.server 8090 --directory www</code>
        <small style="display:block;margin-top:6px;opacity:0.8;">Detalle: ${err.message || err}</small>

      </div>
    `;
  }
}
