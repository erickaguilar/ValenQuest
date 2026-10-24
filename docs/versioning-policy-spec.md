# ValenQuest: Política y Homologación de Versionado

> **Estado:** Vigente y Canónico  
> **Versión Actual del Ecosistema:** `v2.2.0`  
> **Ámbito:** Frontend Vanilla JS, Componentes Web, Motor Rust + WASM, Service Worker y Manifiestos  
> **Audiencia:** Desarrolladores, mantenedores, agentes de IA y pipelines de CI/CD  

---

## 1. 🎯 Propósito y Filosofía

En **ValenQuest**, al ser una Progressive Web App (PWA) con arquitectura *local-first* y motor compilado en Rust/WebAssembly, un cambio de versión impacta simultáneamente múltiples capas:
1. **La capa de cómputo WASM:** Compilada desde Rust (`Cargo.toml`).
2. **La capa de empaquetado y scripts:** Gestionada por Node.js (`package.json`).
3. **El Service Worker (`sw.js`):** Responsable de invalidar cachés y descargar las nuevas constelaciones y assets en los dispositivos de los niños.
4. **La interfaz de usuario visible:** Muestra con transparencia la versión oficial en el pie de página (`<vq-footer>`) para padres y educadores.

Este documento establece la **política canónica de versionado semántico (SemVer 2.0.0)** y proporciona la guía y herramientas automatizadas para que **cada incremento de versión se mantenga 100% homologado y atómico en todos los archivos del repositorio**.

---

## 2. 🔢 Esquema SemVer (Semantic Versioning 2.0.0)

ValenQuest sigue estrictamente el formato `MAJOR.MINOR.PATCH` (ej. `2.1.0`):

| Segmento | Cuándo se incrementa | Ejemplos en ValenQuest |
| :--- | :--- | :--- |
| **MAJOR (X.0.0)** | Cambios arquitectónicos mayores, migraciones de esquema incompatibles en IndexedDB (`valenquest_db`), reestructuración completa del motor o rediseño total. | Paso de v1 (monolito) a v2 (arquitectura modular con Hub & Spoke y controllers por página). |
| **MINOR (X.Y.0)** | Nuevas funcionalidades pedagógicas, nuevos templos en La Gran Aventura, adición de nuevas heroínas, mecánicas de juego o modos de práctica. | Adición de La Pluma de la Fluidez, soporte TTS del Búho Orión o nuevo Ropero Mágico. |
| **PATCH (X.Y.Z)** | Corrección de errores (*bugfixes*), mejoras de rendimiento, ajustes de contraste visual, textos pedagógicos o afinación de síntesis de voz. | Ajustes en diálogos de confirmación, mejoras en responsividad móvil o parches de CSS. |

---

## 3. 🗺️ Mapa de Archivos Canónicos de Versionado

> **Fuente única de verdad (SSOT): `package.json` (`"version"`).**
> El script `scripts/bump-version.js` propaga esa versión a todos los puntos.
> `node scripts/bump-version.js --check` (o `npm run version:check`) verifica
> que no haya deriva; úsalo en CI antes de cada release.

Cualquier cambio de versión **DEBE** reflejarse en los siguientes puntos:

```text
ValenQuest/
├── package.json                   # [SSOT] Manifiesto Node.js ("version": "2.1.6")
├── package-lock.json              # [2] Lockfile Node (root + packages[""].version)
├── Cargo.toml                     # [3] Manifiesto Rust ("version = "2.1.6"")
├── Cargo.lock                     # [4] Lockfile Rust (bloque kidslearn-wasm)
├── VERSION                        # [5] Texto plano con la versión
├── README.md                      # [6] Badge version-2.1.6
├── src/lib.rs                     # [7] get_engine_version() del motor WASM
├── scripts/build.js               # [8] Lee dinámicamente package.json para inyectar CACHE_VERSION
├── www/
│   ├── sw.js                      # [9] Service Worker base (const CACHE_VERSION = 'v2.1.6')
│   ├── js/app.js                  # [10] APP_VERSION del Hub
│   ├── js/components/footer.js    # [11] Componente <vq-footer> (ValenQuest v2.1.6 • Edición Lumiria © 2026)
│   ├── js/services/icons.js       # [12] Claves de caché vigentes + ?v=2.1.6 (cache busting)
│   ├── campaign.html              # [13] Hereda vía <vq-footer> (sin versión hardcodeada)
│   └── story.html                 # [14] Hereda vía <vq-footer> (sin versión hardcodeada)
```

### Tabla de Formatos por Archivo

| Archivo | Patrón / Clave | Formato Requerido (ejemplo v2.1.6) |
| :--- | :--- | :--- |
| [`package.json`](file:///home/erickaguilar/Documentos/ValenQuest/package.json) | `"version": "..."` **[SSOT]** | `"version": "2.1.6"` |
| `package-lock.json` | `version` raíz + `packages[""].version` (solo ValenQuest, no dependencias) | `"version": "2.1.6"` |
| [`Cargo.toml`](file:///home/erickaguilar/Documentos/ValenQuest/Cargo.toml) | `version = "..."` (paquete `kidslearn-wasm`) | `version = "2.1.6"` |
| `Cargo.lock` | Bloque `kidslearn-wasm` únicamente | `version = "2.1.6"` |
| `VERSION` | Contenido del archivo | `2.1.6` |
| `README.md` | Badge `badge/version-...` | `badge/version-2.1.6` |
| [`src/lib.rs`](file:///home/erickaguilar/Documentos/ValenQuest/src/lib.rs) | `get_engine_version()` | `KidsLearn-WASM Engine v2.1.6 (Rust+Wasm)` |
| [`www/js/app.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/app.js) | `APP_VERSION` | `'2.1.6'` |
| [`www/sw.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/sw.js) | `const CACHE_VERSION = '...'` | `const CACHE_VERSION = 'v2.1.6';` |
| [`www/js/components/footer.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/components/footer.js) | Texto en párrafo footer | `ValenQuest v2.1.6 • Edición Lumiria © 2026` |
| [`www/js/services/icons.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/services/icons.js) | Claves `*_CACHE_KEY` vigentes + `fetch(...?v=...)` | `v2_1_6` en claves, `?v=2.1.6` en fetch |
| [`www/campaign.html`](file:///home/erickaguilar/Documentos/ValenQuest/www/campaign.html) | Hereda vía `<vq-footer>` | Sin versión hardcodeada |
| [`www/story.html`](file:///home/erickaguilar/Documentos/ValenQuest/www/story.html) | Hereda vía `<vq-footer>` | Sin versión hardcodeada |

---

## 4. ⚡ Automatización: Script de Homologación

Para evitar errores humanos y olvidos manuales, el proyecto incluye un script de un solo paso:

```bash
# Homologar una nueva versión (escribe en los 14 puntos canónicos):
npm run version:bump <NUEVA_VERSION>

# Verificar que no haya deriva (solo lectura, ideal para CI):
npm run version:check

# O directamente con Node:
node scripts/bump-version.js <NUEVA_VERSION>
node scripts/bump-version.js --check
```

### Ejemplo de Uso
```bash
npm run version:bump 2.2.0
```

**Salida en consola (ejemplo para 2.2.0):**
```text
🦄 [ValenQuest] Homologando actualización a versión: v2.2.0 (SSOT: package.json)

  ✓ package.json actualizado a v2.2.0
  ✓ Cargo.toml actualizado a v2.2.0
  ✓ VERSION actualizado a v2.2.0
  ✓ src/lib.rs actualizado a v2.2.0
  ✓ www/js/app.js actualizado a v2.2.0
  ✓ www/sw.js actualizado a v2.2.0
  ✓ www/js/components/footer.js actualizado a v2.2.0
  ✓ www/js/services/icons.js actualizado a v2.2.0
  ... (14 puntos canónicos en total)

✨ ¡Homologación completada! N actualizados, M ya al día.
👉 Verifica con: npm run version:check
👉 Luego compila: ./scripts/build.sh (tests + WASM + dist/)
```

---

## 5. 🔄 Mecanismo de Cache Busting en el Service Worker

En `scripts/build.js`, el generador de producción lee la versión de `package.json` y la concatena con el hash determinista SHA-256 de los assets:

$$\text{CACHE\_VERSION} = \text{"v"} + \text{appVersion} + \text{"-"} + \text{globalBuildHash}$$

Ejemplo:
```javascript
const CACHE_VERSION = 'v2.1.0-58a3d212';
```

### Beneficios del Esquema:
1. **Detección Inmediata por el Navegador:** El Service Worker en `dist/sw.js` cambia byte a byte, lo que dispara el evento `updatefound` del navegador móvil.
2. **Purgado Seguro de Cachés Obsoletas:** La fase `activate` del SW elimina automáticamente cualquier caché cuyo nombre no coincida con el nuevo `CACHE_VERSION`, liberando espacio en dispositivos infantiles de gama de entrada.
3. **Cero Acción Manual para los Padres:** Los usuarios no necesitan forzar recarga ni borrar datos de navegación.

---

## 6. 📋 Protocolo de Release Paso a Paso

Sigue esta lista de verificación cada vez que se libere una nueva versión:

### Paso 1: Ejecutar el Homologador y verificar
```bash
npm run version:bump 2.2.0
npm run version:check
```

### Paso 2: Compilar y Ejecutar Tests Unitarios
```bash
./scripts/build.sh
```
Verifica que:
- Los tests de Rust pasen: `14 passed; 0 failed` en motor + `5 passed; 0 failed` en integración (Total 19 tests).
- WebAssembly compile sin advertencias críticas (`wasm-pack build --target web`).
- La carpeta `dist/` se genere con el `asset-manifest.json` y los hashes actualizados.

### Paso 3: Crear el Commit de Release
```bash
git add -A
git commit -m "chore(release): bump version to v2.2.0"
```

### Paso 4: Sincronizar Ramas GitFlow
```bash
# 1. Asegurar develop
git push gitlab develop
git push origin develop

# 2. Promover a main
git checkout main
git merge develop --ff-only
git push gitlab main
git push origin main
git checkout develop
```

### Paso 5: Etiquetar la Versión (Git Tag)
```bash
git tag -a v2.2.0 -m "Release v2.2.0: Resumen de mejoras y novedades"
git push gitlab v2.2.0
git push origin v2.2.0
```

---

## 7. 🛡️ Reglas de Oro para Desarrolladores y Agentes IA

1. **Nunca editar la versión en un solo archivo:** `package.json` es la fuente única
   de verdad. Para cambiar de versión, ejecuta `npm run version:bump <ver>`; el script
   propaga a los 14 puntos canónicos. `campaign.html` y `story.html` heredan vía
   `<vq-footer>` y no llevan versión hardcodeada.
2. **El footer nunca debe tener versiones desfasadas:** El componente `<vq-footer>` es la referencia visual oficial de padres y maestros; su versión debe coincidir exactamente con `package.json`, `Cargo.toml`, `VERSION`, `src/lib.rs` y `www/js/app.js`. Verifícalo con `npm run version:check`.
3. **Toda release debe pasar `npm run version:check` y `scripts/build.sh`:** Ningún commit con cambio de versión debe enviarse a `develop` o `main` sin homologación verificada, la suite completa de tests y la compilación WASM.
