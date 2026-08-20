# Leader submit timeout + UX — 2026-08-20

- Se robusteció la detección de abort/timeout (AbortError, code 20 y señales abortadas).
- Evaluation Detail aumenta timeout cliente a 30 s para tolerar variaciones de n8n/Airtable sin mostrar errores técnicos.
- Save Leader Draft y Submit Leader aumentan timeout cliente de 15 s a 30 s.
- El botón **Enviar evaluación** del líder se bloquea inmediatamente, cambia a **Enviando…** y adopta estado gris mientras la petición está en curso.
- Se agregó guard global `leaderSubmitting` para evitar doble envío incluso con doble clic.
- Durante el proceso se muestra **Guardando y enviando la evaluación…** y al éxito **Evaluación enviada correctamente.**
- Los errores de timeout/red ya no muestran el detalle técnico `signal is aborted without reason (20)`.
