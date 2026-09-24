# ValenQuest: Contrato Terminal-Tonto (JS ↔ Rust/WASM)

> **SSOT:** `src/engine/math_fsm.rs` (EMA, FSM 10 tiers, portal) + `src/engine/reading.rs` (silabeo, WPM).
> **Verificación:** `npm run test:contract` (`scripts/check-terminal-tonto.mjs`).

## 1. Quién es dueño de qué

| Dominio | Dueño | Detalle |
| :--- | :--- | :--- |
| Generación de retos y distractores | Rust | `generate_next_challenge()` + `Xorshift64*`. JS jamás usa `Math.random` salvo fallback degradado marcado |
| Validación de respuesta matemática | Rust | `submit_answer(resp, ms)` → `bool`. JS no hace `=== answer` como verdad (solo precálculo local para escudo) |
| Maestría EMA `M_k`, racha, `tier_changed` | Rust | `M_k ≥ 0.82 + racha ≥ 3` → portal; piedad `racha ≥ 8`; refuerzo `M_k < 0.38 + 2 fallos` |
| `portal_ready`, `advance_tier()` → `0.65` | Rust | JS solo lee el flag y abre el portal; el avance ocurre tras vencerlo |
| Silabeo RAE, WPM | Rust | `parse_text_syllables`, `calculate_wpm`. Fallback aritmético solo sin WASM |
| Render, audio/TTS, persistencia del JSON, economía arcade (combo/diamantes 0-100%), poderes, capítulos, navegación | JS | La maestría arcade 0-100% **no** es la EMA del motor: documentarlo en UI si se muestra |

## 2. Prohibiciones en JS

1. `Math.random` fuera de `generateFallbackChallenge()`.
2. Hardcodear `0.82` / `0.95` o `templeProgress >= 100` como condición de portal.
3. `isPortalReady = portalReady || ...` — debe ser solo el flag WASM.
4. Duplicar límites de acto (`3/7/10`) fuera de `actOf()` (`campaign-engine.js`, espejo de `data/levels.json`).
5. Escudo de Zoe: con fallo + escudo **no** se despacha al WASM (no mancha EMA); sin escudo siempre se despacha.

## 3. Flujo canónico

```text
UI --(respuesta, elapsed_ms)--> session.submit_answer()
  --> get_state_json() { tier, mastery, streak, portal_ready, ... }
  --> adventure.syncWasm() persiste espejo (display-only)
  --> si portal_ready: portalController.openPortalChallenge()
  --> al vencer: session.advance_tier() + adventure.completeTemple()
```
