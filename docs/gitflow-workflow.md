# ValenQuest: Flujo de Trabajo GitFlow

Especificación del modelo de ramas **GitFlow** adoptado para el desarrollo continuo de **ValenQuest**.

---

## 1. Estructura de Ramas

```
 main (Producción / Vercel Live)
   ▲
   │ [merge release / hotfix]
   │
 develop (Integración activa) ◄── [RAMA PRINCIPAL DE TRABAJO]
   ▲
   ├── feature/reading-syllables-ui
   ├── feature/companions-wardrobe-db
   └── feature/sound-ambience-loops
```

### 1.1. Ramas Principales (Infraestructura)
* **`main`:** Código estable en producción. Cada commit en esta rama es desplegado automáticamente por Vercel a la URL pública y representa una versión probada.
* **`develop`:** Rama de integración activa. Aquí convergen todas las características nuevas antes de pasar a un corte de versión (*release*).

### 1.2. Ramas Temporales de Apoyo
* **`feature/<nombre-de-la-funcionalidad>`:**
  * Se origina de: `develop`
  * Se fusiona en: `develop`
  * Ejemplo: `feature/reading-syllabic-parser`, `feature/cosmetics-inventory`
* **`release/<vX.Y.Z>`:**
  * Se origina de: `develop`
  * Se fusiona en: `main` y `develop`
  * Sirve para congelar código, pulir detalles finales de versión y actualizar changelogs.
* **`hotfix/<descripcion>`:**
  * Se origina de: `main`
  * Se fusiona en: `main` y `develop`
  * Para corregir errores críticos detectados en producción de forma inmediata.

---

## 2. Comandos Frecuentes

### 2.1. Iniciar una nueva funcionalidad:
```bash
git checkout develop
git pull all develop
git checkout -b feature/mi-nueva-mejora
```

### 2.2. Finalizar e integrar la funcionalidad en `develop`:
```bash
git checkout develop
git pull all develop
git merge --no-ff feature/mi-nueva-mejora
git branch -d feature/mi-nueva-mejora
git push all develop
```

### 2.3. Publicar una versión a producción (`main`):
```bash
git checkout main
git pull all main
git merge --no-ff develop -m "release: v1.1.0 - Nuevas mecánicas de juego"
git tag -a v1.1.0 -m "Versión 1.1.0"
git push all main --tags
```
