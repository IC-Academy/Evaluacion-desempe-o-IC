# EDD 360° — Backend DEV Contract

## Entorno

- Git branch: `dev/360-module`
- Airtable DEV base: `appyUc7HnxV425TTZ` — **EDD 360 DEV — AOP 2027**
- Producción EDD: NO modificar durante desarrollo.
- Campaña seed: `360-DEV-AOP-2027-01` (estado `draft`).
- Registros seed marcados como `Registro de prueba = true`.

## Alcance aprobado

- Sujetos evaluados en esta fase: **Líderes y Gerentes**.
- Cada participante que evalúa selecciona **1 área**.
- Backend asigna **2 áreas adicionales aleatoriamente**.
- Una evaluación finalizada no puede volver a abrirse ni modificarse.
- Resultados del líder muestran identidad del evaluador y comentarios.
- Fuentes del resultado personal: Autoevaluación, Jefe directo y Clientes internos.
- Escala:
  - 1 Necesita mejorar
  - 2 En desarrollo
  - 3 Cumple
  - 4 Destacado
  - 5 Ejemplar

## Tablas Airtable DEV

### 360_Campañas — `tblI0U0P3s4UmYgZv`
Controla el ciclo independiente del EDD productivo.
Estados: `draft -> active -> closed -> released`.

### 360_Areas — `tblTHjQHx3LyPmaEB`
Catálogo de áreas/funciones elegibles. Incluye snapshots del responsable.
No seleccionar aleatoriamente registros con `Elegible aleatoria = false`.

### 360_Participantes — `tblceRaWNescA9ScF`
Universo de Líderes/Gerentes evaluados por campaña.
Estados: `pending_selection, assigned, in_progress, completed, results_released`.

### 360_Preguntas — `tblujJW5jfbfbrXJR`
Catálogo separado del banco de preguntas EDD.
Seed actual: 12 reactivos cerrados + 3 preguntas abiertas.

### 360_Asignaciones — `tblNQOQL87tioTd0y`
Una fila por evaluación asignada.
`Origen asignación`: `seleccion_usuario` o `aleatoria`.
Estados: `pending, draft, completed`.

### 360_Respuestas — `tblCmkirl46WPVl3q`
Una fila por pregunta y asignación.
Llave lógica recomendada: `ID Asignación + ID Pregunta`.
Estados: `draft, submitted`.

### 360_Bitacora — `tblyqs3rWCB2siwmm`
Auditoría de campaña, asignaciones, guardados, envíos, cierres y liberación.

## Endpoints n8n requeridos

Todos deben validar sesión y derivar `numeroEmpleado` del token/sesión; nunca confiar en un número de empleado enviado por el browser.

### Usuario / evaluador

#### GET /360/me
Devuelve participación en la campaña activa, estado de selección, conteo de asignaciones y disponibilidad de resultados.

#### GET /360/areas
Devuelve áreas activas elegibles para selección manual.
Debe excluir el área propia cuando aplique y cualquier área no evaluable.

#### POST /360/selection
Body:
```json
{ "selectedAreaId": "360-AREA-LEGAL" }
```

Transacción lógica:
1. validar campaña `active`;
2. validar participante;
3. validar que todavía esté `pending_selection`;
4. validar que `selectedAreaId` sea válida;
5. crear 1 asignación `seleccion_usuario`;
6. obtener universo `Activa=true AND Elegible aleatoria=true`;
7. excluir área seleccionada, área propia y duplicados;
8. elegir 2 áreas distintas en backend;
9. crear 2 asignaciones `aleatoria`;
10. actualizar participante a `assigned`;
11. escribir eventos en `360_Bitacora`;
12. devolver las 3 asignaciones.

La aleatoriedad nunca debe ejecutarse en frontend.

#### GET /360/assignments
Devuelve sólo asignaciones cuyo `Número evaluador` coincida con la sesión.

#### GET /360/assignments/:id
Valida propiedad de la asignación y devuelve datos del área, responsable, preguntas y borrador existente.

#### PUT /360/assignments/:id/draft
Upsert de respuestas por `ID Asignación + ID Pregunta`.
- Sólo estados `pending` o `draft`.
- Valor cerrado: entero 1..5.
- Pregunta abierta: texto.
- Nunca permitir escribir si `Bloqueada=true` o `Estado=completed`.
- Primera escritura marca `Iniciada el` y estado `draft`.

#### POST /360/assignments/:id/submit
Validaciones:
- asignación pertenece al usuario;
- no está completada;
- todos los reactivos obligatorios tienen respuesta;
- valores cerrados 1..5;
- preguntas abiertas obligatorias presentes.

Acciones:
- respuestas -> `submitted`;
- asignación -> `completed`;
- `Bloqueada=true`;
- `Finalizada el=now()`;
- registrar bitácora.

Reintento posterior debe devolver HTTP 409:
```json
{ "error": { "code": "evaluation_already_completed" } }
```

### Resultados líder

#### GET /360/results/me
Sólo disponible si campaña = `released`.

Debe devolver:
```json
{
  "campaignId": "360-DEV-AOP-2027-01",
  "evaluatedEmployee": {},
  "globalScore": 4.18,
  "level": "Destacado",
  "sources": {
    "self": 4.50,
    "manager": 4.30,
    "internalClients": 4.02
  },
  "dimensions": [],
  "feedback": [
    {
      "evaluatorEmployeeNumber": "000000",
      "evaluatorName": "Nombre",
      "evaluatorArea": "Área",
      "relation": "Cliente interno",
      "strength": "...",
      "improvement": "...",
      "continueDoing": "..."
    }
  ]
}
```

**No anonimizar** evaluadores en esta versión aprobada.

### Admin

#### GET /360/admin/dashboard
KPIs, avance, promedio por área/dimensión y detalle de responsables.

#### GET /360/admin/participants
Lista Líderes/Gerentes con estado y progreso.

#### POST /360/admin/campaign/:id/activate
`draft -> active`.

#### POST /360/admin/campaign/:id/close
`active -> closed`. Bloquea nuevas selecciones y envíos.

#### POST /360/admin/campaign/:id/release
`closed -> released`, `Resultados liberados=true`.

## Cálculo

- Cada reactivo cerrado usa escala 1..5.
- Resultado de dimensión = promedio de respuestas válidas de la dimensión.
- Resultado por fuente = promedio de reactivos cerrados de esa fuente.
- Resultado global = promedio de respuestas cerradas válidas incluidas en el resultado.
- No mezclar comentarios abiertos en cálculo.
- No usar datos de EDD normal para modificar el resultado 360.

## Seguridad / invariantes

1. Frontend nunca habla directo con Airtable.
2. Credenciales Airtable sólo en n8n.
3. Todos los endpoints usan sesión existente EDD.
4. Evaluador se deriva de sesión.
5. Nadie puede responder una asignación ajena.
6. No confiar en `areaId`, `evaluatedEmployeeNumber` o estado enviados por el cliente sin revalidar.
7. `completed` es inmutable.
8. Campaña `closed/released` rechaza escrituras.
9. Admin endpoints requieren rol Admin.
10. Registrar acciones críticas en `360_Bitacora`.

## Datos seed DEV

Áreas cargadas desde el alcance AOP 2027. Sólo se habilitaron para aleatoriedad aquellas con responsable verificado en el padrón EDD DEV seed. Áreas sin responsable confirmado permanecen activas pero no son elegibles aleatoriamente.

Participantes seed:
- Diana López Zúñiga — 263808
- Maricela Fragoso Prado — 106455
- Alondra Casarrubias Duarte — 259629
- José Ricardo Zamora Acosta — 248088
- Mónica Evangelina Martínez Sánchez — 261809

Estos registros están marcados como prueba.

## Regla de integración

No tocar los endpoints actuales:
- submit-self
- submit-leader
- calibración
- release EDD
- feedback
- firmas

El módulo 360 debe vivir bajo namespace `/360` y usar sus tablas exclusivas.
