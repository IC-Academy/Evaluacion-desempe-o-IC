# EDD — Madurez de objetivos · 2026-08-18

Cambios de frontend consolidados sobre la versión Nine Box Premium v2:

- Manejo de IA permanece dentro de B.2 y ahora es obligatorio: no muestra N/A y la sección no permite avanzar sin calificarlo 1–5.
- El colaborador puede declarar “No tuve objetivos definidos en este periodo”.
- Esa declaración exige motivo y contexto breve; la sección C queda N/A y no se convierte en cero.
- El líder debe validar la declaración:
  - confirmar que realmente no hubo objetivos, con comentario obligatorio; o
  - indicar que sí existían objetivos, documentarlos y justificar la discrepancia.
- DO recibe contexto de la discrepancia en calibración.
- El panel de Desarrollo Organizacional incorpora una categoría de KPI “Objetivos” con:
  - cobertura de objetivos,
  - personas sin objetivos definidos,
  - pendientes de definir,
  - áreas con casos,
  - detalle por persona/área/motivo.
- El indicador de objetivos del wizard muestra N/A cuando corresponde.
- Se conserva la reponderación existente: una sección completa N/A no suma cero ni regala puntos; el resultado se calcula sobre el peso aplicable.
- Se corrigió una duplicidad visual del texto “Avance del ciclo”.

Nota: estos cambios son de frontend/local demo. El esquema equivalente debe persistirse en Airtable/n8n antes del cierre de producción.
