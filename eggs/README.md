# 🥚 Incubadora de Funcionalidades y Propuestas (Eggs)

Este directorio alberga especificaciones, RFCs (Request for Comments) y planes de integración técnica para nuevas características en fase de diseño e incubación antes de su incorporación al código principal de **ValenQuest**.

---

## 📋 Índice de Propuestas en Incubación

| Documento | Estado | Descripción |
| :--- | :--- | :--- |
| [`player-profile-onboarding-plan.md`](./player-profile-onboarding-plan.md) | 🟡 En Revisión / Planificación | Onboarding interactivo para niños: Credencial mágica (Nombre/Apodo, Género/Tratamiento y Edad) con adaptación pedagógica local-first. |

---

## 🎯 Criterios de Incubación
Toda propuesta en `eggs/` debe satisfacer:
1. **Enfoque Infantil Primero**: Adaptado a la motricidad fina, autonomía y lenguaje de niñas y niños de 5 a 10 años.
2. **Privacidad Local-First**: Sin recopilación en la nube ni telemetría invasiva (respeto estricto a normativas COPPA y GDPR-K).
3. **No-Regresión**: Planes de migración retrocompatibles para el estado de [`IndexedDB`](../www/js/services/storage.js).
4. **Accesibilidad Universal**: Cumplimiento WCAG 2.2 AA y soporte completo para navegación táctil, teclado y lectores de pantalla.
