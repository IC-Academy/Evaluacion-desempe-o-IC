# Performance Frontend v4 — 2026-08-20

Ajustes de rendimiento percibido tras el perfilado real de n8n:

- Cache corto de GET e in-flight deduplication en `api.js`.
- `/auth/me` ya no genera dos llamadas HTTP durante la misma hidratación.
- `/evaluations/mine` y `/leader/team` o `/admin/dashboard` se solicitan concurrentemente desde el navegador.
- `GET /evaluations/:id` se vuelve lazy: no se ejecuta al entrar al dashboard del líder/DO; solo al abrir una evaluación que realmente necesita detalle.
- Timeout específico de 20s para `evaluationDetail`, cuyo tiempo backend medido ronda 10.4s después de optimización.
- Cache del detalle por 30s para evitar recargas repetidas al navegar atrás/adelante.
- Escrituras limpian cache relacionada para evitar mostrar datos obsoletos después de guardar/enviar.
- Botón/acción de abrir evaluación de líder queda protegido contra dobles clics simultáneos.
- `Actualizar` limpia cache y fuerza una lectura real nueva.

No se cambiaron contratos JSON, seguridad, cálculos Rev.4 ni lógica de negocio.
