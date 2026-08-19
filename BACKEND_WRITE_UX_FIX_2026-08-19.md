# Ajustes UX de guardado y envío — 2026-08-19

- El aviso de guardado ya no menciona Airtable; ahora dice `Progreso guardado correctamente.`
- Al iniciar el envío final, el botón queda deshabilitado y cambia a `Enviando…` hasta que termina la petición.
- Si el envío falla, el botón vuelve a habilitarse para reintentar.
- El frontend deja de mostrar el texto heredado de `validación SMART` cuando recibe `objective_required`; muestra un mensaje compatible con el flujo KPI actual.
- Nota: el backend `submit-self` todavía debe eliminar su validación SMART heredada para aceptar objetivos KPI (descripción + meta + resultado) como regla definitiva.
