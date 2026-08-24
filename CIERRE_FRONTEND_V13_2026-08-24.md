# EDD — Cierre frontend v13 — 2026-08-24

- Se integraron `api.js` y `config.js` finales entregados tras la validación backend.
- URLs productivas con webhookId real para calibración, release, reunión, acuerdos y firmas.
- `releaseResult` captura `feedbackId` y refresca el expediente.
- `GET evaluation detail` hidrata feedback, FODA, planes y estados de firma en la experiencia visual existente.
- Portal líder puede volver a abrir seguimiento desde datos reales del equipo.
- Confirmación de reunión usa backend real.
- Acuerdos finales se guardan y después se liberan para firma usando backend real.
- Firma líder y firma colaborador llaman sus endpoints productivos; la firma del colaborador representa el cierre.
- La retroalimentación propia también fuerza carga lazy del detalle backend.
- Se eliminó copy obsoleto que decía que release/calibración no estaban conectados.
- Cache-busting actualizado a `20260824-v13` para evitar que el navegador sirva JS viejo después del despliegue.

## Fuente de verdad
En modo API, n8n + Airtable siguen siendo la fuente de verdad. localStorage se usa únicamente para hidratar componentes visuales heredados.
