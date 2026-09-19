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
      // 1. Iniciar inmediatamente la descarga del binario WASM en streaming
      const wasmUrl = new URL('../../pkg/kidslearn_wasm_bg.wasm', import.meta.url);
      const wasmFetchPromise = fetch(wasmUrl);

      // 2. Importar el pegamento JavaScript en paralelo
      const module = await import('../../pkg/kidslearn_wasm.js');

      // 3. Compilación en streaming: WebAssembly.instantiateStreaming(fetch(...))
      // Si el navegador o el MIME-type fallan en streaming, caer en fallback a ArrayBuffer
      if (typeof WebAssembly.instantiateStreaming === 'function') {
        try {
          await module.default({ module_or_path: wasmFetchPromise });
        } catch (streamingErr) {
          console.warn('⚠️ [KidsLearn-WASM] Fallback de compilación en streaming:', streamingErr);
          const fallbackResponse = await fetch(wasmUrl);
          const bytes = await fallbackResponse.arrayBuffer();
          await module.default({ module_or_path: bytes });
        }
      } else {
        // Entornos sin soporte de streaming directo
        const response = await wasmFetchPromise;
        const bytes = await response.arrayBuffer();
        await module.default({ module_or_path: bytes });
      }

      wasmModule = module;
      console.log('✅ [KidsLearn-WASM] Engine initialized (streaming):', module.get_engine_version ? module.get_engine_version() : 'OK');
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
        <strong><svg class="vq-icon vq-icon--xs" aria-hidden="true"><use href="#vq-icon-warning"></use></svg> Error al inicializar el motor WebAssembly</strong>
        <p>Asegúrate de servir la aplicación mediante un servidor HTTP local:</p>
        <code>python3 -m http.server 8090 --directory www</code>
        <small style="display:block;margin-top:6px;opacity:0.8;">Detalle: ${err.message || err}</small>

      </div>
    `;
  }
}

export const wasmLoader = {
  load: loadWasm,
};
