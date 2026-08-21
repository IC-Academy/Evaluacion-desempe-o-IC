# Calibración DO — escritura frontend v10

- Conecta `PUT /admin/calibration/:evaluationId`.
- Conecta `POST /admin/calibration/:evaluationId/complete`.
- Permite mantener o ajustar resultado 1–5.
- Justificación enviada al backend; backend conserva validación obligatoria cuando hay diferencia.
- Notas opcionales enviadas al backend.
- Guardar borrador refresca la cola real.
- Completar guarda primero el valor visible, completa la calibración y refresca cola + dashboard.
- Una calibración completada queda bloqueada visualmente en esta etapa.
- No se implementó liberación desde frontend porque el reporte recibido no incluyó la URL de producción concreta del workflow dinámico `release`.
