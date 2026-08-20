# Frontend v8 — resultados server-side

- El frontend prioriza `Resultado global (backend)`, `Actitud (backend)` y `Desempeño (backend)` cuando el detalle API los expone.
- Mantiene cálculo local únicamente como fallback de compatibilidad mientras el GET detail termina de exponer todos los campos normalizados.
- Tras submit de colaborador/líder se intenta refrescar el detalle y persistir localmente los resultados server-side para comparación, perfil multidimensional y 9-Box.
- Actitud/Desempeño backend (0-100) se convierten a promedio 1-5 solo para componentes visuales heredados; el score global conserva el valor backend.
- No se modifica ninguna fórmula de negocio en frontend ni los endpoints n8n.
