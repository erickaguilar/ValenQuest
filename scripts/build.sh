#!/usr/bin/env bash
# ==============================================================================
# KidsLearn-WASM Build & Validation Script
# ==============================================================================
set -euo pipefail

# Ensure ~/.cargo/bin is in PATH for cargo and wasm-pack
export PATH="$HOME/.cargo/bin:$PATH"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=================================================="
echo "🚀 KidsLearn-WASM: Compilación y Validación"
echo "=================================================="
echo "Directorio de trabajo: $PROJECT_ROOT"

# 1. Verificar herramientas
echo ""
echo "[1/4] 🔍 Verificando toolchain de Rust y WASM..."
command -v cargo >/dev/null 2>&1 || { echo "❌ Error: 'cargo' no encontrado."; exit 1; }
command -v wasm-pack >/dev/null 2>&1 || { echo "❌ Error: 'wasm-pack' no encontrado."; exit 1; }
echo "  ✓ Cargo: $(cargo --version)"
echo "  ✓ wasm-pack: $(wasm-pack --version)"

# 2. Ejecutar pruebas unitarias de Rust
echo ""
echo "[2/4] 🧪 Ejecutando pruebas unitarias nativas (cargo test)..."
cargo test --verbose

# 3. Compilar WASM con optimizaciones de tamaño para web
echo ""
echo "[3/4] 📦 Compilando WebAssembly (wasm-pack build --target web)..."
wasm-pack build --target web --out-dir www/pkg --release

# 4. Validar artefactos generados
echo ""
echo "[4/4] 📋 Verificando artefactos generados en www/pkg/..."
if [[ -f "www/pkg/kidslearn_wasm_bg.wasm" && -f "www/pkg/kidslearn_wasm.js" ]]; then
    WASM_SIZE=$(du -h "www/pkg/kidslearn_wasm_bg.wasm" | cut -f1)
    echo "  ✓ Binario WASM: www/pkg/kidslearn_wasm_bg.wasm ($WASM_SIZE)"
    echo "  ✓ Glue JS:      www/pkg/kidslearn_wasm.js"
    echo "=================================================="
    echo "🎉 ¡Compilación completada exitosamente!"
    echo "Para servir localmente la aplicación:"
    echo "   python3 -m http.server 8090 --directory www"
    echo "=================================================="

else
    echo "❌ Error: Faltan archivos compilados en www/pkg/."
    exit 1
fi
