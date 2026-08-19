# Backend Write Integration v1 — 2026-08-19

Frontend conectado a los contratos de escritura validados por backend.

## Endpoints usados
- POST `/evaluations/mine/initialize`
- PUT `/evaluations/:evaluationId/self-draft`
- POST `/evaluations/:evaluationId/submit-self`
- PUT `/evaluations/:evaluationId/leader-draft`
- POST `/evaluations/:evaluationId/submit-leader`

## Cambios frontend
- `writeApiEnabled=true`, `testCaptureEnabled=false`.
- Inicio de evaluación crea/recupera el borrador real de forma idempotente.
- Guardar progreso persiste autoevaluación o evaluación del líder en n8n + Airtable.
- Envío final primero guarda el borrador y luego ejecuta el submit correspondiente.
- Los errores 401/403/404/409/422 se muestran de forma controlada usando el mensaje del backend.
- El portal del líder habilita la acción `Evaluar` cuando la autoevaluación está lista.
- El detalle remoto se hidrata al modelo local de UI para conservar el diseño existente sin usar localStorage como autoridad de backend.
- Manejo de IA se envía como `tools.ia`; Excel como `tools.excel`; Power BI como `tools.powerBi`.
- Las estrellas de objetivos no se envían como autoridad: backend recalcula Rev.4.

## Aún fuera de esta fase
- Calibración DO de escritura.
- Retroalimentación / FODA persistido al backend.
- Firmas y constancia.
- Flujo completo de `Sin objetivos` en los endpoints draft/submit (el schema ya tiene parte de los campos, pero el contrato de escritura entregado todavía exige objetivo en submit-self).
