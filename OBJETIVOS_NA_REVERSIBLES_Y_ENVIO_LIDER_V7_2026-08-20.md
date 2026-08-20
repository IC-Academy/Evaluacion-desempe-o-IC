# EDD V7 — Objetivos N/A reversibles + envío líder

- Marcar “No tuve objetivos definidos” ya no elimina objetivos capturados; se ocultan y se recuperan si se desmarca.
- El payload de autoevaluación queda preparado para enviar `noObjectives`, `noObjectivesReason` y `noObjectivesDetail`.
- El payload del líder queda preparado para enviar `noObjectivesDecision` y `noObjectivesLeaderComment`.
- El envío del líder muestra pasos `Guardando…` → `Enviando…`, bloquea doble clic y deja de esperar el refresh general después del submit.
- La persistencia real del caso “sin objetivos” requiere que n8n acepte y valide estos campos en self-draft/submit-self/leader-draft/submit-leader.
