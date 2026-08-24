# Cierre E2E frontend v12 — 2026-08-24

- Submit líder queda desacoplado de la carga posterior de comparación: un GET lento ya no retiene el éxito del envío.
- Expediente DO incorpora estado de error + reintento, evitando loaders infinitos.
- Calibración mantiene guardar/completar y agrega transición visual a retroalimentación.
- Release queda cableado mediante `APP_CONFIG.endpointOverrides.releaseResultPath` para no inventar la URL dinámica de n8n.
- Se agregó una tira de avance E2E en el dashboard DO para demo ejecutiva.
- Retroalimentación y firmas históricas permanecen disponibles; endpoints productivos faltantes se declaran como overrides y no se simulan como persistidos.
