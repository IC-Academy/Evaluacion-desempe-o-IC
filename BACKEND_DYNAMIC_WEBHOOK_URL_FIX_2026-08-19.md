# Fix URLs dinámicas n8n — 2026-08-19

Se actualizaron en `js/api.js` las rutas dinámicas que n8n publica con `webhookId` prefijado.

- GET detalle evaluación: `6f123813-cb2b-4698-af51-60fe95ca1b52`
- PUT self draft: `28e6125b-64c9-453c-a100-8c77f8ee68b9`
- POST submit self: `0a235f4f-46c5-4a9c-bce0-dae3c0a0ab23`
- PUT leader draft: `d4a332bd-8994-4b3d-aaba-28f2b99aca0a`
- POST submit leader: `11eb53d4-a38a-4048-81e0-4705ebc57e56`

`POST /evaluations/mine/initialize` permanece sin cambios.

También se corrigió preventivamente `GET /evaluations/:evaluationId`, ya que n8n aplica el mismo prefijo a rutas dinámicas.
