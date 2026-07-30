# Plataforma EDD Inter-Con — Demo funcional

Demo web funcional (sin backend) de la Evaluación del Desempeño Administrativo de
**INTER-CON SERVICIOS DE SEGURIDAD PRIVADA, S.A. DE C.V.**, construida a partir del
documento oficial `EDD_Inter-Con_alineada.docx` (FOR-CAP-003 Rev. 3): competencias,
ponderaciones, escala, fórmulas, clasificación de desempeño, matriz 9-box, significado
de cuadrantes, acciones sugeridas, fortalezas, áreas de oportunidad, plan de mejora,
plan de desarrollo y comentarios/evidencias provienen todos de ese documento.

> **Beta 2 — actualización sobre la estructura aprobada.** Esta versión se construyó
> **encima** de la beta anterior (misma arquitectura, mismos archivos, mismo flujo):
> no se reescribió la app ni se migró a un framework. Los cambios de esta beta son:
> nueva ponderación de secciones (sección 4, 50/20/15/15), blindaje de la relación
> líder–colaborador (4.1), radar de competencias (4.2), Nine Box con ejes relabeados
> (4.3) + vista individual (4.4), ficha ejecutiva de retroalimentación (4.5), brechas
> por sección en la comparación (4.6) y ajustes a la semilla de datos de demostración
> (4.7). Todas las decisiones marcadas como **"pendiente de validación por RH"** son
> provisionales y deben confirmarse antes de cualquier uso productivo.

## 1. Cómo abrir la demo

1. Descomprime la carpeta `evaluacion-desempeno`.
2. Abre el archivo `index.html` haciendo doble clic (o arrástralo a tu navegador).
3. No requiere instalación, compilación, servidor ni conexión a internet.
4. Los datos se guardan en el `localStorage` del navegador que uses. Si cambias de
   navegador o de equipo, la demo vuelve a cargar la semilla inicial.

## 2. Usuarios de prueba

| Perfil | N.º de empleado | Nombre | Notas |
|---|---|---|---|
| Colaborador | 10001 | Laura Hernández | Analista de RH — evaluación **no iniciada** (ideal para recorrer el flujo completo) |
| Líder | 20001 | Carlos Martínez | Gerente de RH, líder de Laura y Jorge |
| Administrador | 90001 | Administrador RH | Acceso a calibración, 9-box, auditoría y configuración |

La pantalla de inicio de sesión incluye botones de acceso rápido para estos tres
usuarios. También puedes escribir cualquier número de empleado de la base simulada
(10001–10010 colaboradores, 20001–20005 líderes, 90001 administrador) junto con el
perfil correspondiente.

Hay 10 colaboradores repartidos en Recursos Humanos, Finanzas, Operaciones, Tecnología
y Comercial, en distintos estados del proceso (no iniciada, en progreso, pendiente de
líder, pendiente de calibración, retroalimentación pendiente, cerrada) para poder
demostrar cada pantalla sin necesidad de capturar datos desde cero. Ver sección 4.7
para los escenarios pensados específicamente para probar el radar, la brecha y la
matriz 9-box de esta beta (ejemplo cercano, ejemplo con brecha significativa,
cobertura de varios cuadrantes).

## 3. Estructura del proyecto

```
evaluacion-desempeno/
├── index.html            Punto de entrada. Carga los scripts en orden.
├── css/
│   └── styles.css        Línea visual corporativa (azul marino / blanco / semáforo).
├── js/
│   ├── data.js            Catálogo maestro: escala, competencias, conductas,
│   │                       usuarios/colaboradores/líderes de demostración,
│   │                       generador determinista de respuestas simuladas.
│   ├── calculations.js    Única fuente de verdad de las fórmulas: promedios,
│   │                       puntajes por sección, resultado final, clasificación
│   │                       de nivel, CONFIG_9BOX, asignación de cuadrante,
│   │                       información de cuadrantes, umbrales de brecha.
│   ├── icons.js            Ilustraciones SVG en línea, una por cuadrante 9-box
│   │                       (gota, corazón, planeta, maceta, sol, árbol, lámpara,
│   │                       hoyo en tierra, grano/semilla). Puramente visual.
│   ├── charts.js          Visualizaciones reutilizables (beta 2): radar de
│   │                       competencias (`renderRadarChart`), matriz 9-box completa
│   │                       (`renderNineBoxFull`) y matriz 9-box individual
│   │                       (`renderNineBoxIndividual`). Solo presentación: lee los
│   │                       pesos/umbrales/catálogo desde `calculations.js`, no
│   │                       duplica fórmulas.
│   ├── storage.js         Capa de persistencia sobre localStorage: entidades,
│   │                       semilla inicial, auditoría, CRUD.
│   └── app.js             Router por hash, vistas de los 3 portales, validaciones,
│                           widget de calificación en estrellas + N/A.
└── README.md
```

## 3.1 Ilustraciones por cuadrante y calificación en estrellas

- Cada uno de los 9 cuadrantes tiene un ícono temático propio (`js/icons.js`), por
  ejemplo el grano/semilla para **Semilla**, el sol para **Sol**, la gota para
  **Agua**, etc. Se muestra automáticamente junto al resultado en Retroalimentación,
  Comparación, Calibración y la Matriz 9-Box (además de mini-versiones en el
  dashboard de RH y en cada celda de la matriz).
- Las calificaciones de 1 a 5 ya no usan un `<select>`: se capturan con un widget de
  **estrellas** (como al calificar una app) más una pastilla "N/A", tanto en
  competencias como en objetivos, para colaborador y líder.

## 4. Reglas de cálculo (ver `js/calculations.js`)

> ⚠ **Ponderación preliminar, pendiente de validación por RH.** Las secciones 4.1 a
> 4.7 documentan una actualización de la beta (beta 2). Todos los porcentajes,
> umbrales y la forma de estimar "potencial" descritos aquí son una **propuesta**
> para poder demostrar el flujo completo; no son la ponderación oficial final.

- **Ponderación de secciones (beta 2):** D. Cumplimiento de Objetivos **50 %**,
  A. Valores y Actitud 20 %, B. Habilidades 15 %, C. Conocimientos técnicos 15 %
  (suman 100 %). Reemplaza la ponderación de la beta 1 (Actitud 40 / Habilidades 20 /
  Conocimientos 10 / Objetivos 30). El único lugar donde vive este porcentaje es
  `PESOS_SECCION` en `js/calculations.js` (con un comentario "PROPUESTA PRELIMINAR"
  encima); `js/data.js` (`SECCIONES_META`, pesos de `COMPETENCIAS`) y toda la interfaz
  (formularios, resultados, comparación, calibración, ficha de retroalimentación) leen
  ese mismo valor — no hay porcentajes repetidos a mano en ningún otro archivo.
- **Puntaje de sección** = `(promedio de calificaciones válidas / 5) × peso de la sección`.
- **Puntaje final** = suma de los 4 puntajes de sección, sobre 100 puntos. Se
  mantienen decimales internamente y se muestra un máximo de un decimal.
- **Clasificación de nivel:** 95–100 Sobresaliente · 90–94.99 Excede las expectativas
  · 80–89.99 Cumple las expectativas · 70–79.99 Cumple parcialmente · <70 Requiere
  mejorar.
- **Eje DESEMPEÑO** = promedio ponderado de Habilidades + Conocimientos técnicos +
  Cumplimiento de Objetivos. **Eje POTENCIAL (preliminar)** = promedio de la sección
  Valores y Actitud (ver 4.4 — sigue usando internamente el nombre `actitud` por
  compatibilidad, solo cambia la etiqueta visible).
- **Cuadrante 9-box** = `(nivelDesempeño − 1) × 3 + nivelActitud`, con
  `nivelActitud`/`nivelDesempeño` en {1, 2, 3} según `CONFIG_9BOX`. La fórmula fue
  validada contra los 9 significados y acciones del documento oficial.
- **Brecha auto vs. líder:** 0–0.49 Alineada · 0.50–0.99 Revisar · ≥1 Brecha
  significativa (`CONFIG_BRECHA`, editable desde el portal de Administrador →
  Configuración; reutilizado sin cambios por el radar y por la comparación).

### 4.1 Relación líder–colaborador

Cada colaborador tiene `liderId`. Un líder solo ve y puede evaluar a sus propios
colaboradores: el dashboard del líder los filtra por `liderId`, y además se agregó un
candado a nivel de vista (`perteneceALider`, en `app.js`) que bloquea el acceso directo
por URL (hash) a la evaluación o comparación de un colaborador que no es suyo —
muestra una pantalla de "Acceso denegado" en vez de la información. El administrador
no tiene esta restricción (ve a todos). El nombre del líder directo se muestra en el
perfil del colaborador, en la ficha de calibración y en la ficha ejecutiva de
retroalimentación. No se construyó un editor de organigrama: la relación se sigue
declarando en la semilla de datos (`data.js`), igual que en la beta 1.

### 4.2 Radar de competencias

`EDDCharts.renderRadarChart({ autoevaluacion, evaluacionLider, calibracion, dimensiones })`
(en `js/charts.js`) dibuja un radar SVG (sin librerías externas) con las 4 secciones
actuales en escala homogénea 0–5, y aparece en tres vistas: comparación del líder,
detalle de calibración del administrador y ficha ejecutiva de retroalimentación del
colaborador. Siempre reutiliza `resultados.promedios` de `calculations.js` — no
recalcula promedios en `app.js` ni en `charts.js`. Si una sección no tiene datos
válidos (N/A completo), ese vértice se dibuja en 0 y el punto indica "sin datos (N/A)"
en su tooltip; nunca se inventa un valor.

**Decisión sobre la tercera serie ("Calibrado"):** la calibración de RH solo ajusta el
**resultado global** (0–100), no cada sección por separado. Para poder comparar tres
series sin inventar respuestas nuevas por competencia, se eligió la opción A descrita
en el brief: proyectar la forma de la evaluación del líder escalada por un factor único
`factor = resultadoCalibrado / resultadoLider`, aplicado por igual a las 4 secciones.
Es una aproximación visual explícita (se rotula "Calibrado (proyección proporcional)"
en la leyenda, con una nota al pie que muestra el factor exacto usado) y no un dato
capturado independientemente. Se prefirió sobre la opción B (mostrar solo auto+líder
y un indicador global aparte) porque el brief pedía comparar "las 3 series", y esta
opción sí las muestra las tres en el mismo gráfico sin fabricar calificaciones por
competencia que nadie emitió.

### 4.3 Matriz 9-Box: ejes relabeados + potencial preliminar

> **"En esta versión beta, el potencial se estima provisionalmente mediante los
> componentes conductuales y de habilidades disponibles. En producción deberá
> incorporarse una evaluación específica de potencial."**

Este texto aparece literal en la leyenda de la matriz 9-box (dentro de
`EDDCharts.renderNineBoxFull`, visible en el dashboard del administrador y en toda
vista individual) y aquí en el README. Visualmente el eje horizontal ahora dice
**Desempeño** y el eje vertical **Potencial (preliminar)**, con niveles Bajo/Medio/Alto
en ambos ejes (`CONFIG_9BOX.ejeHorizontal`, `ejeVertical`, `etiquetasNivel`). Por
dentro, el cálculo sigue siendo exactamente el mismo que en la beta 1 (el promedio de
la sección "Valores y Actitud" hace de aproximación de potencial); solo cambió la
etiqueta que ve el usuario, no la lógica ni los nombres internos de variables/función
(`actitudProm`, `asignarCuadrante`), para no romper compatibilidad. No se construyó un
cuestionario de potencial nuevo ni se cambió el flujo de evaluación.

La matriz completa (global, del administrador) muestra las 9 celdas simultáneamente,
con su ícono, nombre, las personas ubicadas ahí, y permite seleccionar una celda o una
persona para ver su ficha de cuadrante (`renderCuadranteInfo`): significado, prioridad,
acción sugerida y seguimiento — sin renombrar ninguno de los 9 cuadrantes existentes.

### 4.4 Matriz 9-Box individual

Además de la matriz global, `EDDCharts.renderNineBoxIndividual(resultado)` dibuja la
misma matriz de 9 celdas pero con un solo marcador destacado (la ubicación de esa
persona), sus puntajes de desempeño/potencial preliminar y la tarjeta de significado
del cuadrante debajo. Aparece en comparación (líder), calibración (administrador) y
ficha de retroalimentación (colaborador). Usa el mismo `renderNineBoxGridCore` y la
misma configuración (`CONFIG_9BOX`/`CUADRANTES_INFO`) que la matriz global, así que
ambas siempre son consistentes entre sí.

### 4.5 Ficha ejecutiva de retroalimentación

La vista de retroalimentación del colaborador (`viewRetroalimentacion` en `app.js`) se
amplió — sin duplicar entidades ni funciones — a una ficha ejecutiva con: datos
generales (avatar de iniciales, puesto, área, dirección, ciudad, antigüedad, líder
directo, periodo evaluado), indicadores (resultado final, las 4 secciones, potencial
preliminar, cuadrante 9-box, diferencia auto vs. líder), el radar comparativo, la
matriz 9-box individual, tarjetas de resultado por sección, fortalezas, áreas de
oportunidad y plan de mejora, plan de desarrollo, cronograma, comentarios del líder,
observaciones de RH y evidencias registradas. Todo proviene de datos y funciones que
ya existían (`storage.js`, `calculations.js`, `charts.js`); no se crearon entidades
nuevas.

### 4.6 Brechas por sección en la comparación

La vista de comparación del líder muestra, para cada una de las 4 secciones, la
calificación del colaborador, la del líder, la diferencia absoluta y su estado
(Alineada / Revisar / Brecha significativa), clasificado con `CONFIG_BRECHA` y
`clasificarBrecha` de `calculations.js` (mismos umbrales que ya usaba la tabla
detallada por competencia — no se agregó ningún umbral nuevo). Las filas con brecha
significativa se resaltan visualmente (`row-brecha-critica`) tanto en la tabla como al
lado del radar comparativo.

### 4.7 Ajustes a la semilla de datos

Solo se modificaron 3 de los 10 colaboradores simulados (`js/data.js`), para poder
validar visualmente el radar, la brecha y la matriz 9-box sin tocar ningún escenario
que ya funcionaba (estados, usuarios de acceso rápido 10001/20001/90001 sin cambios):

- **10005 (ejemplo cercano):** autoevaluación y evaluación del líder con objetivos muy
  parecidos entre sí en las 4 secciones — sirve para mostrar una brecha global
  "Alineada" y un radar con las dos series casi superpuestas.
- **10009 (brecha significativa, bandera insignia):** la colaboradora se autopercibe
  con actitud sobresaliente, pero el líder documenta una actitud deficiente pese a un
  desempeño técnico sólido (habilidades/conocimientos/objetivos alineados). Cae en el
  cuadrante 7 "Agua" — pensado para demostrar la brecha marcada en rojo y el radar con
  una sección muy separada entre series.
- **10004:** perfil intermedio, pensado junto con el resto de la base para lograr
  cobertura de al menos 6 de los 9 cuadrantes al ver la matriz global del
  administrador.

El resto de colaboradores (10001, 10002, 10003, 10006, 10007, 10008, 10010), los
líderes, el administrador y los periodos quedaron exactamente igual que en la beta
anterior. Los valores objetivo (`perfilObjetivo`/`perfilObjetivoLider`) alimentan un
generador pseudoaleatorio determinista (mismo mecanismo de la beta 1, sin cambios en
su funcionamiento) que agrega variación realista por competencia alrededor de esos
objetivos, por lo que los promedios finales pueden variar en ±0.1–0.2 frente a los
valores objetivo — la ubicación de cuadrante y el signo de la brecha se verificaron
para que sean estables pese a esa variación.

## 5. Tratamiento de N/A

- N/A **nunca** se convierte en 0 ni reduce el promedio.
- Se excluye del denominador al calcular el promedio de la sección.
- Se conserva el valor "N/A" en el registro de respuestas para trazabilidad.
- Si una sección completa queda sin calificaciones válidas, su puntaje es 0 y se
  marca internamente como `sinDatos: true` (no se oculta el problema, se puede
  auditar).

## 6. Modelo de datos (localStorage, clave `edd_interconn_db_v2`)

Entidades: `usuarios`, `colaboradores`, `lideres`, `periodos`, `evaluaciones`,
`respuestas`, `objetivos`, `resultados`, `calibraciones`, `cuadrantes`,
`planes_desarrollo`, `areas_oportunidad`, `acciones` (cronograma de 6 semanas),
`evidencias`, `auditoria`, `configuracion`.

Cada `evaluacion` tiene `tipo` (`autoevaluacion` | `lider`), `estado`, y referencias a
`respuestas`/`objetivos` por `evaluacionId`. Cada envío completado genera un registro
en `resultados` con `puntajes`, `promedios` y `nivel`. Las `calibraciones` guardan
`historial` con valor anterior, valor nuevo, motivo, usuario, fecha y hora de cada
cambio (trazabilidad exigida por el punto 21 del brief).

> **Nota sobre la clave `v1` → `v2`:** esta beta subió la versión de la clave de
> localStorage (`js/storage.js`) a propósito, porque la beta anterior pudo dejar
> `resultados` guardados en el navegador calculados con la ponderación vieja
> (40/20/10/30). Reutilizar la misma clave habría mezclado puntajes viejos con la
> lógica nueva. Al cambiar de clave, el navegador simplemente no encuentra datos bajo
> `edd_interconn_db_v2` y reconstruye la semilla desde cero con la ponderación
> vigente — no se migran ni se recalculan los datos de la `v1` (es una demo sin
> backend, no se justifica ese esfuerzo). Si nunca abriste la beta anterior en ese
> navegador, este cambio es transparente.

## 7. Estados del proceso

`No iniciada` → `En progreso` → `Completada` (por evaluación) y a nivel del proceso
completo: `Pendiente de líder` → `Pendiente de calibración` → `Calibrada` →
`Retroalimentación pendiente` → `Cerrada`. El estado general se **deriva**
automáticamente de las evaluaciones y la calibración (función `estadoProceso` en
`storage.js`); no se guarda como bandera manual para evitar inconsistencias.

## 8. Configuración de umbrales

- `CONFIG_9BOX` (nivel1Max 2.49, nivel2Max 3.99, nivel3Max 5, más las etiquetas
  `ejeVertical: 'Potencial (preliminar)'`, `ejeHorizontal: 'Desempeño'` y
  `etiquetasNivel: ['Bajo','Medio','Alto']` agregadas en esta beta) está
  **centralizado** en `calculations.js`. El código señala explícitamente que estos
  límites y la forma de estimar potencial deben ser validados por RH antes de
  producción.
- `PESOS_SECCION` (50/20/15/15, ver sección 4) también vive únicamente en
  `calculations.js`, marcado como "PROPUESTA PRELIMINAR".
- `CONFIG_BRECHA` (alineada/revisar) es editable desde el portal de Administrador
  → Configuración, y no está incrustado de forma rígida en la interfaz. Se reutiliza
  sin cambios en el radar y en la tabla de brechas por sección (4.6).

## 9. Validaciones implementadas

No enviar sección sin respuestas · aceptar N/A como respuesta válida · no enviar
objetivos sin descripción · no calibrar sin justificación cuando hay ajuste · no
habilitar retroalimentación sin plan de desarrollo cuando el resultado calibrado es
menor a 80 · no cerrar (aceptar resultado) sin evidencia cargada · confirmación
explícita antes de cada envío definitivo · guardado automático en cada cambio ·
recuperación de avance al recargar la página (persistencia en localStorage) ·
prevención de envíos duplicados (una evaluación completada no puede reabrirse).

## 10. Limitaciones de la demo

- No hay backend ni base de datos real: todo vive en el navegador (localStorage).
- Los archivos de evidencia no se almacenan físicamente; solo se registra su nombre,
  tipo, fecha, usuario y comentario para demostrar el flujo.
- Los descuentos por actas administrativas o NOM-035 son **solo alertas
  informativas**; no se aplica ningún descuento automático porque, según el brief,
  esa metodología aún debe validarse con RH.
- El inicio de sesión no valida contraseña (es un acceso de demostración por número
  de empleado + perfil).
- Los datos son simulados; los nombres, resultados y comentarios no corresponden a
  información real de colaboradores de Inter-Con.
- El "potencial preliminar" de la matriz 9-box (sección 4.3) es una aproximación con
  los datos conductuales/de habilidades disponibles, no una evaluación de potencial
  dedicada.

Explícitamente fuera de alcance de esta beta (a propósito, no por omisión): backend
real, Airtable real, n8n real, login con contraseña, Active Directory, envío real de
correos, generación real de PDF, integración real con NOM-035 o con actas
administrativas, IA externa para generar planes de desarrollo, un editor completo de
organigrama, cambio de framework, dependencias externas o CDN, y necesidad de un
servidor local. La demo debe poder seguir abriéndose con doble clic en `index.html`.

## 11. Botón de reinicio

Portal de Administrador → Configuración → "Reiniciar datos de la demo" borra el
localStorage y reconstruye la semilla inicial (usuarios, evaluaciones, calibraciones,
auditoría) tal como viene en `data.js`.

## 12. Propuesta de migración a producción

La demo se diseñó para que `storage.js` sea el único punto de contacto entre la
interfaz y los datos. Migrar a producción implica sustituir el cuerpo de esas
funciones por llamadas a una API real, sin tocar `app.js`:

1. **Frontend web:** conservar la misma interfaz (HTML/CSS/JS) o migrarla a un
   framework (React/Vue) si el equipo de TI lo prefiere; la lógica de negocio ya está
   aislada en `calculations.js`.
2. **Base de datos:** Airtable (rápido de administrar por RH) o una base SQL
   (Postgres/SQL Server) si se requiere mayor volumen y control de permisos.
3. **n8n** para automatizaciones: recordatorios de vencimiento, notificaciones de
   nueva evaluación, disparo de la fase de retroalimentación, generación de reportes
   periódicos.
4. **Almacenamiento de evidencias:** un bucket (S3, Azure Blob, Google Drive
   corporativo) referenciado desde el registro de `evidencias`.
5. **Autenticación corporativa:** SSO / Active Directory en lugar de número de
   empleado + selección de perfil.
6. **Dashboards:** Power BI conectado a la misma base para los reportes ejecutivos de
   RH y dirección, complementando o reemplazando el dashboard embebido.
7. **Alertas por correo:** integradas vía n8n cuando una evaluación esté por vencer o
   cuando RH deba calibrar.
8. **Historial anual:** conservar periodos anteriores en la base para comparativos
   año contra año (el modelo de datos ya contempla `periodoId` en cada entidad).
9. **Control de permisos:** roles y visibilidad por área/dirección/ciudad operativa
   a nivel de base de datos, no solo de interfaz.
10. **Escalabilidad nacional:** paginación y consultas por índice (área, líder,
    ciudad, estado) ya reflejadas en los filtros del dashboard de administrador.

Esta demo **no implementa** esas integraciones; deja la arquitectura (separación
datos / cálculo / persistencia / interfaz) lista para que ese reemplazo sea
incremental.
