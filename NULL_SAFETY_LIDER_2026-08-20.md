# Null safety — evaluación líder

- Se agregó reconstrucción local defensiva del resultado de una autoevaluación remota ya completada cuando el backend entrega respuestas/objetivos pero no un objeto de resultados calculados.
- Se protegieron accesos a `promedios` y `puntajes` con optional chaining/fallbacks para que estados intermedios (líder no iniciado, calibración inexistente, resultados aún no materializados) no rompan la UI.
- La comparación ahora intenta reconstruir resultados locales antes de renderizar y, si aún no están disponibles, muestra un estado controlado en vez de lanzar una excepción.
- No se modificaron contratos API, rutas, seguridad ni workflows n8n.
