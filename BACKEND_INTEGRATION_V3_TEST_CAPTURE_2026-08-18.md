# Backend Integration v3 — prueba funcional

- Saludo neutral: `¡Hola, Nombre!`.
- Lecturas reales siguen activas contra n8n + Airtable.
- Se habilita temporalmente `testCaptureEnabled=true` para poder recorrer la autoevaluación completa con el usuario autenticado real.
- La captura de prueba permanece en localStorage y se identifica explícitamente como NO persistida en Airtable.
- `writeApiEnabled` sigue en `false`: no se inventaron rutas/payloads de escritura que no estén confirmados.
- Próximo paso: conectar creación/guardado/envío real cuando n8n entregue el contrato de escritura (crear/guardar borrador + submit).
