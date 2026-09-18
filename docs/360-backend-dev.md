# EDD 360° — Backend DEV Contract

## Entorno

- Git branch: `dev/360-module`
- Airtable DEV base: `appyUc7HnxV425TTZ` — **EDD 360 DEV — AOP 2027**
- Producción EDD: NO modificar durante desarrollo.
- Campaña seed: `360-DEV-AOP-2027-01` (estado `draft`).
- Registros seed marcados como `Registro de prueba = true`.

## Alcance aprobado

- Sujetos evaluados en esta fase: **Líderes y Gerentes**.
- El usuario **NO elige áreas**.
- Cada evaluador recibe **3 áreas automáticas**.
- Las 3 áreas deben ser distintas.
- El backend debe excluir siempre el **área propia del evaluador**.
- El backend debe balancear las asignaciones para que todos los Líderes/Gerentes evaluados reciban una cantidad equivalente de evaluaciones.
- Una evaluación finalizada no puede volver a abrirse ni modificarse.
- Resultados del líder muestran identidad del evaluador y comentarios.
- Fuentes del resultado personal: Autoevaluación, Jefe directo y Clientes internos.
- Escala:
  - 1 Necesita mejorar
  - 2 En desarrollo
  - 3 Cumple
  - 4 Destacado
  - 5 Ejemplar

## Regla central de asignación

La asignación no es "random puro". Debe ser **aleatoria balanceada**.

Objetivos simultáneos:

1. 3 asignaciones por evaluador.
2. Nunca asignar su propia área.
3. Nunca duplicar un área dentro de las 3 asignaciones del mismo evaluador.
4. Nunca asignar al propio evaluador como sujeto evaluado.
5. Distribuir la carga lo más uniforme posible entre todos los Líderes/Gerentes evaluados.
6. En empate de carga, elegir aleatoriamente.
7. Generar las asignaciones en backend, nunca en frontend.
8. Generar el lote completo de la campaña para conocer la carga global antes de liberar el ejercicio.

### Algoritmo recomendado: balanced random / least-loaded random

Para una campaña:

1. Obtener todos los evaluadores elegibles.
2. Obtener todas las áreas con `Activa=true`, `Elegible aleatoria=true` y responsable evaluable.
3. Mezclar aleatoriamente el orden de evaluadores para no favorecer siempre a los primeros.
4. Inicializar `assignmentCount[targetAreaId]` con el número de asignaciones ya existentes del lote/campaña.
5. Para cada evaluador:
   - excluir `ID Área propia 360`;
   - excluir áreas ya elegidas para ese evaluador;
   - excluir cualquier área cuyo responsable sea el mismo evaluador;
   - ordenar candidatos por menor `assignmentCount`;
   - tomar el nivel de carga mínima disponible;
   - elegir aleatoriamente entre candidatos empatados;
   - crear asignación;
   - incrementar inmediatamente `assignmentCount`;
   - repetir hasta completar 3.
6. Validar el lote completo.
7. Si algún evaluado recibe 0 asignaciones o la diferencia máxima-mínima es mayor a 1 cuando existe una solución factible, descartar el lote y regenerar con otro orden aleatorio.
8. Persistir únicamente un lote validado.

Resultado esperado:
- si `evaluadores * 3` es divisible entre el número de evaluados, todos reciben exactamente la misma cantidad;
- si no es divisible, la diferencia ideal entre el más y menos asignado es máximo 1.

Ejemplo:
- 20 evaluadores × 3 = 60 asignaciones;
- 10 líderes evaluados;
- objetivo = 6 evaluaciones por líder.

Esto conserva aleatoriedad sin dejar líderes con 12 respuestas y otros con 1.

## Idempotencia

La generación debe ser una operación de lote.

Campos disponibles:
- `360_Campañas.Asignaciones generadas`
- `360_Campañas.ID Lote asignaciones`
- `360_Asignaciones.ID Lote generación`
- `360_Asignaciones.Orden asignación`

Un segundo intento para una campaña que ya tenga `Asignaciones generadas=true` debe:
- devolver el lote existente; o
- requerir una acción administrativa explícita de regeneración en DEV.

Nunca duplicar asignaciones por reintento HTTP.

## Tablas Airtable DEV

### 360_Campañas — `tblI0U0P3s4UmYgZv`
Controla el ciclo independiente del EDD productivo.
Estados: `draft -> active -> closed -> released`.

Campos de lote:
- `Asignaciones generadas`
- `ID Lote asignaciones`

### 360_Areas — `tblTHjQHx3LyPmaEB`
Catálogo de áreas/funciones elegibles. Incluye snapshots del responsable.
No seleccionar registros con `Elegible aleatoria=false`.

### 360_Participantes — `tblceRaWNescA9ScF`
Universo de Líderes/Gerentes evaluados por campaña.

Campo nuevo:
- `ID Área propia 360`: se usa para impedir autoasignación del área.

El antiguo estado `pending_selection` queda obsoleto funcionalmente. Para compatibilidad DEV puede mantenerse en registros seed hasta que n8n genere el lote; después pasa a `assigned`.

### 360_Preguntas — `tblujJW5jfbfbrXJR`
Catálogo separado del banco de preguntas EDD.
Seed actual: 12 reactivos cerrados + 3 preguntas abiertas.

### 360_Asignaciones — `tblNQOQL87tioTd0y`
Una fila por evaluación asignada.

En la nueva regla todas las asignaciones creadas por el ciclo usan:
- `Origen asignación = aleatoria`

Campos de control:
- `ID Lote generación`
- `Orden asignación` = 1, 2 o 3
- `Estado` = `pending, draft, completed`

El valor `seleccion_usuario` queda legado y no debe utilizarse en nuevos lotes.

### 360_Respuestas — `tblCmkirl46WPVl3q`
Una fila por pregunta y asignación.
Llave lógica recomendada: `ID Asignación + ID Pregunta`.
Estados: `draft, submitted`.

### 360_Bitacora — `tblyqs3rWCB2siwmm`
Auditoría de campaña, generación de lote, guardados, envíos, cierres y liberación.

## Endpoints n8n requeridos

Todos deben validar sesión y derivar `numeroEmpleado` de la sesión. Nunca confiar en un número de empleado enviado por el browser.

### Usuario / evaluador

#### GET /360/me
Devuelve:
- campaña activa;
- participación;
- 3 asignaciones;
- progreso;
- disponibilidad de resultados.

Ya no devuelve estado de selección porque no existe selección manual.

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

Reintento posterior:
```json
{ "error": { "code": "evaluation_already_completed" } }
```
HTTP 409.

### Admin / generación

#### POST /360/admin/campaign/:id/generate-assignments
Endpoint crítico.

Sólo Admin.

Precondiciones:
- campaña en `draft` o etapa configurada para preparación;
- no existir lote ya confirmado;
- existir al menos 4 áreas evaluables para poder asignar 3 diferentes excluyendo la propia.

Acciones:
1. construir matriz de elegibilidad;
2. ejecutar algoritmo balanced-random;
3. validar cobertura y equidad;
4. crear todas las filas en `360_Asignaciones`;
5. actualizar participantes a `assigned`;
6. marcar `Asignaciones generadas=true`;
7. guardar `ID Lote asignaciones`;
8. registrar auditoría.

Respuesta sugerida:
```json
{
  "success": true,
  "batchId": "360-BATCH-...",
  "evaluators": 20,
  "assignments": 60,
  "targets": 10,
  "minAssignmentsPerTarget": 6,
  "maxAssignmentsPerTarget": 6,
  "balanced": true
}
```

#### GET /360/admin/assignment-distribution
Debe permitir revisar antes del lanzamiento:
- evaluado;
- área;
- asignaciones recibidas;
- mínimo;
- máximo;
- promedio;
- desviación;
- usuarios sin 3 asignaciones;
- líderes sin ninguna asignación.

No mostrar quién evaluará a quién en una pantalla pública; sólo Admin.

#### GET /360/admin/dashboard
KPIs, avance, promedio por área/dimensión y detalle de responsables.

#### GET /360/admin/participants
Lista Líderes/Gerentes con estado y progreso.

#### POST /360/admin/campaign/:id/activate
Debe rechazar activación si:
- `Asignaciones generadas != true`;
- algún evaluador no tiene exactamente 3 asignaciones;
- algún target quedó sin evaluaciones cuando matemáticamente era evitable.

#### POST /360/admin/campaign/:id/close
`active -> closed`. Bloquea nuevos envíos.

#### POST /360/admin/campaign/:id/release
`closed -> released`, `Resultados liberados=true`.

## Resultados líder

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

No anonimizar evaluadores en esta versión aprobada.

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
6. El frontend jamás decide las 3 áreas.
7. Área propia siempre excluida.
8. Las 3 áreas del mismo evaluador son distintas.
9. `completed` es inmutable.
10. Campaña `closed/released` rechaza escrituras.
11. Admin endpoints requieren rol Admin.
12. Generación de lote debe ser idempotente.
13. Activación requiere validación de cobertura.
14. Registrar acciones críticas en `360_Bitacora`.

## Datos seed DEV

Participantes seed y área propia configurada:
- Diana López Zúñiga — 263808 — `360-AREA-QSHE`
- Maricela Fragoso Prado — 106455 — `360-AREA-FIN`
- Alondra Casarrubias Duarte — 259629 — `360-AREA-REC`
- José Ricardo Zamora Acosta — 248088 — `360-AREA-LOG`
- Mónica Evangelina Martínez Sánchez — 261809 — `360-AREA-LEGAL`

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
