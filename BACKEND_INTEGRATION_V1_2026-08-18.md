# Backend Integration v1 — 2026-08-18

## Conectado
- Base API: `https://jmejiaromero.app.n8n.cloud/webhook`
- `GET /auth/me`
- `GET /evaluations/mine`
- `GET /evaluations/:evaluationId`
- `GET /leader/team`
- `GET /admin/dashboard`
- Bearer token desde `sessionStorage`.
- Perfil interno derivado de capacidades reales (`isAdmin`, `canEvaluate`) para permitir líderes que también se autoevalúan.
- Estados de carga/error y reintento sin caer automáticamente a datos demo.

## Modo híbrido controlado
La lectura ya es backend real. La escritura sigue desactivada mediante `APP_CONFIG.writeApiEnabled=false`; no se presenta como persistida hasta conectar endpoints POST.

## Gaps de backend reconocidos
No se inventa persistencia para ausencia de objetivos, fuente/evidencia, porcentaje validado por líder, motivo de ajuste ni lectura cualitativa FODA.
