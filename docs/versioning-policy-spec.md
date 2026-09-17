# ValenQuest: Política y Homologación de Versionado

> **Estado:** Vigente y Canónico  
> **Versión Actual del Ecosistema:** `v2.1.0`  
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

Cualquier cambio de versión **DEBE** reflejarse en los siguientes puntos:

```text
ValenQuest/
├── package.json                   # [1] Manifiesto Node.js ("version": "2.1.0")
├── Cargo.toml                     # [2] Manifiesto Rust ("version = "2.1.0"")
├── Cargo.lock                     # [3] Lockfile Rust (se sincroniza al compilar con cargo)
├── scripts/build.js               # [4] Lee dinámicamente package.json para inyectar CACHE_VERSION
├── www/
│   ├── sw.js                      # [5] Service Worker base (const CACHE_VERSION = 'v2.1.0')
│   ├── js/components/footer.js    # [6] Componente <vq-footer> (ValenQuest v2.1.0 • Edición Lumiria © 2026)
│   ├── campaign.html              # [7] Pie informativo del módulo de campaña (ValenQuest v2.1.0)
│   └── story.html                 # [8] Pie informativo del libro de cuentos (ValenQuest v2.1.0)
```

### Tabla de Formatos por Archivo

| Archivo | Patrón / Clave | Formato Requerido |
| :--- | :--- | :--- |
| [`package.json`](file:///home/erickaguilar/Documentos/ValenQuest/package.json) | `"version": "..."` | `"version": "2.1.0"` |
| [`Cargo.toml`](file:///home/erickaguilar/Documentos/ValenQuest/Cargo.toml) | `version = "..."` | `version = "2.1.0"` |
| [`www/sw.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/sw.js) | `const CACHE_VERSION = '...'` | `const CACHE_VERSION = 'v2.1.0';` |
| [`www/js/components/footer.js`](file:///home/erickaguilar/Documentos/ValenQuest/www/js/components/footer.js) | Texto en párrafo footer | `ValenQuest v2.1.0 • Edición Lumiria © 2026` |
| [`www/campaign.html`](file:///home/erickaguilar/Documentos/ValenQuest/www/campaign.html) | `.campaign-footer-meta` | `ValenQuest v2.1.0 • Módulo de Campaña...` |
| [`www/story.html`](file:///home/erickaguilar/Documentos/ValenQuest/www/story.html) | Footer informativo | `ValenQuest v2.1.0 • Las Crónicas de Lumiria...` |

---

## 4. ⚡ Automatización: Script de Homologación

Para evitar errores humanos y olvidos manuales, el proyecto incluye un script de un solo paso:

```bash
# Mediante script npm:
npm run version:bump <NUEVA_VERSION>

# O directamente con Node:
node scripts/bump-version.js <NUEVA_VERSION>
```

### Ejemplo de Uso
```bash
npm run version:bump 2.2.0
```

**Salida en consola:**
```text
🦄 [ValenQuest] Homologando actualización a versión: v2.2.0

  ✓ package.json actualizado a v2.2.0
  ✓ Cargo.toml actualizado a v2.2.0
  ✓ www/sw.js actualizado a v2.2.0
  ✓ www/js/components/footer.js actualizado a v2.2.0
  ✓ www/campaign.html actualizado a v2.2.0
  ✓ www/story.html actualizado a v2.2.0

✨ ¡Homologación completada en 6 archivos!
👉 Ejecuta `./scripts/build.sh` para compilar Rust/WASM y actualizar dist/ con los nuevos hashes.
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

### Paso 1: Ejecutar el Homologador
```bash
npm run version:bump 2.2.0
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

1. **Nunca editar la versión en un solo archivo:** Si se actualiza `package.json`, siempre debe ejecutarse el script o actualizar la totalidad de los 6 puntos canónicos.
2. **El footer nunca debe tener versiones desfasadas:** El componente `<vq-footer>` es la referencia visual oficial de padres y maestros; su versión debe coincidir exactamente con `Cargo.toml` y `package.json`.
3. **Toda release debe pasar `scripts/build.sh`:** Ningún commit con cambio de versión debe enviarse a `develop` o `main` sin haber superado la suite completa de 19 tests y la compilación WASM.
