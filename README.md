# Plataforma EDD Inter-Con — Demo funcional

Demo web funcional (sin backend) de la Evaluación del Desempeño Administrativo de
**INTER-CON SERVICIOS DE SEGURIDAD PRIVADA, S.A. DE C.V.**, construida a partir del
documento oficial `EDD_Inter-Con_alineada.docx` (FOR-CAP-003 Rev. 3): competencias,
ponderaciones, escala, fórmulas, clasificación de desempeño, matriz 9-box, significado
de cuadrantes, acciones sugeridas, fortalezas, áreas de oportunidad, plan de mejora,
plan de desarrollo y comentarios/evidencias provienen todos de ese documento.

> **Beta 3 — preparación para Airtable + n8n (backend temporal).** Esta versión se
> construyó **encima** de la beta 2 (misma arquitectura, mismos archivos, mismo
> flujo, mismo diseño): no se reescribió la app ni se migró a un framework. El
> objetivo de esta beta **no** es conectar un backend real, sino dejar el frontend
> **preparado** para hacerlo sin otro rediseño: modo demo/API central (12.1), nuevo
> login por número de empleado + código temporal (12.2), cliente API y módulo de
> sesión centralizados (12.3–12.4), endpoints previstos documentados (12.5),
> estructura de usuarios/jerarquías alineada al futuro Excel maestro (12.6), y dos
> pantallas administrativas nuevas de solo consulta: Usuarios y Jerarquías (12.7).
> El modo demo (sin backend, con `localStorage`) sigue siendo el modo por defecto y
> se conserva **intacto** en su funcionamiento; ver sección 14 para el detalle
> completo de esta beta. Todo lo marcado como **"pendiente de validación por RH"**
> en betas anteriores (ponderación, umbrales, potencial preliminar, radar calibrado)
> sigue sin resolverse a propósito — no es parte del alcance de esta beta.
>
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
3. No requiere instalación, compilación, servidor ni conexión a internet **en modo
   demo** (ver sección 12.1 — `js/config.js`, `APP_CONFIG.mode = "demo"`, valor por
   defecto).
4. Los datos se guardan en el `localStorage` del navegador que uses. Si cambias de
   navegador o de equipo, la demo vuelve a cargar la semilla inicial.
5. El inicio de sesión ahora pide número de empleado y un código temporal (ver
   sección 12.2). En modo demo el código es siempre **123456**; los botones de acceso
   rápido lo capturan automáticamente por ti.

## 2. Usuarios de prueba

| Perfil | N.º de empleado | Nombre | Notas |
|---|---|---|---|
| Colaborador | 10001 | Laura Hernández | Analista de RH — evaluación **no iniciada** (ideal para recorrer el flujo completo) |
| Líder | 20001 | Carlos Martínez | Gerente de RH, líder de Laura y Jorge |
| Administrador | 90001 | Administrador RH | Acceso a calibración, 9-box, auditoría y configuración |

La pantalla de inicio de sesión incluye botones de acceso rápido para estos tres
usuarios (solicitan y validan el código de demostración automáticamente). También
puedes escribir cualquier número de empleado de la base simulada (10001–10011
colaboradores, 20001–20005 líderes, 90001 administrador), capturar el código de
demostración **123456** cuando se te pida, y entrarás con el rol que ya tiene
asignado ese número de empleado (ya no se elige el perfil a mano, ver 12.2).

Hay 11 colaboradores repartidos en Recursos Humanos, Finanzas, Operaciones, Tecnología
y Comercial, en distintos estados del proceso (no iniciada, en progreso, pendiente de
líder, pendiente de calibración, retroalimentación pendiente, cerrada) para poder
demostrar cada pantalla sin necesidad de capturar datos desde cero. Ver sección 4.7
para los escenarios pensados específicamente para probar el radar, la brecha y la
matriz 9-box de la beta 2 (ejemplo cercano, ejemplo con brecha significativa,
cobertura de varios cuadrantes), y la sección 12.6 para el colaborador nuevo de esta
beta (10011, sin líder asignado, usado para demostrar la vista administrativa de
Jerarquías).

## 3. Estructura del proyecto

```
evaluacion-desempeno/
├── index.html            Punto de entrada. Carga los scripts en orden.
├── css/
│   └── styles.css        Línea visual corporativa (azul marino / blanco / semáforo).
├── js/
│   ├── config.js          (NUEVO en beta 3) Configuración central: modo
│   │                       demo/api, URL base de n8n, clave de sessionStorage,
│   │                       timeout, código demo. Único lugar donde vive esto.
│   ├── data.js            Catálogo maestro: escala, competencias, conductas,
│   │                       usuarios/colaboradores/líderes de demostración
│   │                       (ahora con correo/estatus, ver 12.6), tabla
│   │                       JERARQUIAS (nuevo en beta 3), generador
│   │                       determinista de respuestas simuladas.
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
│   │                       semilla inicial, auditoría, CRUD. Clave subida a
│   │                       `v3` en esta beta (ver 12.6 y sección 6).
│   ├── api.js              (NUEVO en beta 3) Cliente HTTP centralizado
│   │                       (`EDDApi`): única puerta de salida hacia n8n.
│   │                       Nadie más en el frontend hace `fetch()` directo.
│   ├── auth.js             (NUEVO en beta 3) Sesión y login por código
│   │                       temporal (`EDDAuth`): solicitar/validar código,
│   │                       token en sessionStorage, expiración, logout.
│   └── app.js             Router por hash, vistas de los 3 portales, validaciones,
│                           widget de calificación en estrellas + N/A, y (beta 3)
│                           las dos pantallas de login y las vistas
│                           administrativas de Usuarios/Jerarquías.
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

## 6. Modelo de datos (localStorage, clave `edd_interconn_db_v3`)

Entidades: `usuarios`, `colaboradores`, `lideres`, `administradores` (nuevo en beta 3),
`jerarquias` (nuevo en beta 3, ver 12.6), `periodos`, `evaluaciones`, `respuestas`,
`objetivos`, `resultados`, `calibraciones`, `cuadrantes`, `planes_desarrollo`,
`areas_oportunidad`, `acciones` (cronograma de 6 semanas), `evidencias`, `auditoria`,
`configuracion`.

Cada `evaluacion` tiene `tipo` (`autoevaluacion` | `lider`), `estado`, y referencias a
`respuestas`/`objetivos` por `evaluacionId`. Cada envío completado genera un registro
en `resultados` con `puntajes`, `promedios` y `nivel`. Las `calibraciones` guardan
`historial` con valor anterior, valor nuevo, motivo, usuario, fecha y hora de cada
cambio (trazabilidad exigida por el punto 21 del brief de beta 2).

> **Nota sobre la clave `v2` → `v3` (beta 3):** se subió la versión de la clave de
> localStorage otra vez, porque el modelo de datos de usuarios cambió de forma
> incompatible: se agregaron `correoCorporativo`, `estatusEmpleado`,
> `correoValidado`, `ultimaActualizacion` a colaboradores/líderes/administradores, se
> agregó la tabla `jerarquias`, y se agregó un colaborador nuevo sin líder asignado
> (10011) para poder demostrar la vista administrativa correspondiente. Un `db`
> guardado bajo `v2` no tendría esos campos. Como en el cambio anterior (`v1`→`v2`),
> no se migran datos viejos: es una demo sin backend y el navegador simplemente
> reconstruye la semilla completa bajo la nueva clave. **Importante:** esto es
> independiente de la sesión de login, que desde esta beta vive en
> `sessionStorage` bajo la clave `APP_CONFIG.sessionStorageKey` (por defecto
> `edd_session`, ver 12.4) — cerrar la pestaña también cierra la sesión, a
> diferencia de los datos de la demo que sí persisten entre visitas.

> **Nota sobre la clave `v1` → `v2` (beta 2):** esta beta subió la versión de la clave
> de localStorage (`js/storage.js`) a propósito, porque la beta anterior pudo dejar
> `resultados` guardados en el navegador calculados con la ponderación vieja
> (40/20/10/30). Reutilizar la misma clave habría mezclado puntajes viejos con la
> lógica nueva.

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

- No hay backend ni base de datos real: todo vive en el navegador (localStorage) en
  modo demo. El modo `api` (beta 3, ver sección 12.1) queda preparado pero no
  funcional hasta que exista n8n/Airtable reales.
- Los archivos de evidencia no se almacenan físicamente; solo se registra su nombre,
  tipo, fecha, usuario y comentario para demostrar el flujo.
- Los descuentos por actas administrativas o NOM-035 son **solo alertas
  informativas**; no se aplica ningún descuento automático porque, según el brief,
  esa metodología aún debe validarse con RH.
- El inicio de sesión (beta 3) usa número de empleado + código temporal, pero en modo
  demo el código es fijo (**123456**, ver 12.2) y no hay backend que realmente lo
  envíe por correo; es un acceso de demostración, no una autenticación real.
- Los datos son simulados; los nombres, resultados y comentarios no corresponden a
  información real de colaboradores de Inter-Con.
- El "potencial preliminar" de la matriz 9-box (sección 4.3) es una aproximación con
  los datos conductuales/de habilidades disponibles, no una evaluación de potencial
  dedicada.

Explícitamente fuera de alcance de la beta 2 (a propósito, no por omisión): backend
real, Airtable real, n8n real, login con contraseña, Active Directory, envío real de
correos, generación real de PDF, integración real con NOM-035 o con actas
administrativas, IA externa para generar planes de desarrollo, un editor completo de
organigrama, cambio de framework, dependencias externas o CDN, y necesidad de un
servidor local. La demo debe poder seguir abriéndose con doble clic en `index.html`.

Explícitamente fuera de alcance de la beta 3 (ver sección 12.8 para el detalle
completo): integración directa real con Airtable, flujos reales de n8n, envío real
de correo, Microsoft Entra ID / Active Directory, recuperación de contraseña,
registro abierto de usuarios, backend propio, migración a React, cambio total de
diseño, IA generativa, firma electrónica, PDF oficial, integración con SQL,
importación directa desde Dataverse, edición masiva de usuarios o importación de
Excel desde el navegador.

## 11. Botón de reinicio

Portal de Administrador → Configuración → "Reiniciar datos de la demo" borra el
localStorage y reconstruye la semilla inicial (usuarios, evaluaciones, calibraciones,
auditoría) tal como viene en `data.js`.

## 12. Beta 3 — preparación para Airtable + n8n

Esta beta **no conecta un backend real**. Prepara el frontend (modo, login, cliente
API, sesión, endpoints, estructura de usuarios/jerarquías, pantallas de consulta)
para que conectarlo después sea un cambio acotado, sin tocar la interfaz aprobada.

### 12.1 Modo demo vs. modo API

Todo vive en `js/config.js` (`APP_CONFIG`), que es el **único** lugar del frontend
que declara la URL de la API o la clave de sesión:

```js
const APP_CONFIG = {
  mode: 'demo',                                    // 'demo' | 'api'
  apiBaseUrl: 'https://URL-N8N/webhook/evaluacion', // no se usa en modo demo
  sessionStorageKey: 'edd_session',
  requestTimeout: 15000,
  demoCode: '123456',                               // solo modo demo
  codeValidityMinutes: 10,
  defaultSessionSeconds: 28800                       // 8 horas
};
```

- **Modo demo** (por defecto): sin backend, usa `EDDStorage`/localStorage tal cual
  venía funcionando desde beta 1/2. Conserva accesos rápidos, datos simulados,
  flujos por rol y el botón de reinicio.
- **Modo API**: el login (`auth.js`) pasa a llamar a los endpoints de n8n descritos
  en 12.5 en vez de validar contra la semilla local. El resto de la aplicación
  (evaluaciones, comparación, calibración, 9-box, radar) **sigue leyendo de
  `EDDStorage`/localStorage en esta beta** — el cliente `api.js` y los 20 endpoints
  quedan centralizados y listos para consumirse, pero conectar cada pantalla de
  datos al backend real es trabajo de una beta posterior, una vez que n8n/Airtable
  existan de verdad (ver 12.8, "riesgos y pendientes"). Cambiar a `mode: 'api'` sin
  una URL real hace que las llamadas fallen con un error de conexión controlado
  (nunca una excepción sin capturar ni una traza expuesta al usuario).

Para probarlo: edita `APP_CONFIG.mode = 'api'` en `js/config.js` (o en la consola del
navegador) y recarga. El login mostrará el mensaje de modo API y los accesos rápidos
se deshabilitan (el código fijo de demo nunca se acepta en este modo).

### 12.2 Login (dos pasos)

Sustituye el login simulado (empleado + selección de perfil a mano) de beta 1/2.

1. **Pantalla A — solicitar código:** el usuario captura su número de empleado y
   pulsa "Enviar código". La interfaz nunca revela si el número existe o no (mensaje
   neutro: *"Si el número de empleado se encuentra registrado, recibirás un código
   temporal en el correo asociado."*), tanto en modo demo como en modo API.
2. **Pantalla B — validar código:** muestra el correo enmascarado (`j***@dominio`,
   `EDDAuth.maskEmail`) cuando está disponible, un contador informativo de 10
   minutos, y los botones "Ingresar", "Reenviar código" y "Corregir número de
   empleado". El contador es solo informativo — la vigencia real siempre la valida
   el backend (en modo demo, `auth.js` la valida localmente con la misma regla).
3. En **modo demo**, el único código válido es **123456** (`APP_CONFIG.demoCode`), y
   la pantalla lo indica explícitamente como código exclusivo de demostración. En
   **modo API** ese código fijo nunca se acepta: `auth.js` en ese modo no compara
   nada localmente, delega toda la validación a `POST /auth/verify-code`.
4. Los accesos rápidos (10001/20001/90001) siguen existiendo: internamente hacen el
   mismo flujo de dos pasos (solicitan y validan con el código de demo) para no
   duplicar lógica de login, pero desde la perspectiva del usuario siguen siendo
   "un clic y ya estoy dentro", igual que en beta 1/2. Solo están disponibles en modo
   demo.

### 12.3 Cliente API centralizado (`js/api.js`)

`EDDApi.apiRequest(endpoint, options)` es el único punto del frontend que hace
`fetch()`. Agrega `Content-Type: application/json`, el encabezado
`Authorization: Bearer <token>` (leído de `sessionStorage`, no de `auth.js`, para
evitar una dependencia circular entre ambos módulos), controla el `timeout`
(`APP_CONFIG.requestTimeout`, con `AbortController`), distingue errores de red,
tiempo agotado, `401` (sesión inválida/expirada — dispara el evento
`edd:session-expired` que escuchan `auth.js` y `app.js`) y otros errores HTTP, y
nunca deja pasar al usuario final una traza técnica: los detalles solo van a
`console.error`. `EDDApi` expone además una función por cada endpoint de 12.5.

### 12.4 Sesión y autenticación (`js/auth.js`)

`EDDAuth` administra `requestCode`, `verifyCode`, la sesión (guardada en
**`sessionStorage`**, no en `localStorage`, para que no sobreviva al cierre del
navegador/pestaña), su expiración, el cierre de sesión, y la conversión entre la
forma de sesión "tipo API" (`{token, expiresAt, user: {numeroEmpleado,
nombreCompleto, rol, ...}}`, tal como pide el brief) y la forma interna que ya usaba
`app.js` desde beta 1 (`{empleado, nombre, perfil}`), para no tener que reescribir
el resto de las vistas. `app.js` ya no guarda ni lee sesión directamente: en cada
`render()` pregunta a `EDDAuth.getSession()`; si no hay sesión (porque nunca hubo
login, porque expiró por tiempo, porque el usuario cerró sesión, o porque el backend
respondió `401`), manda a la pantalla de login — con un aviso explícito si la causa
fue una expiración. Un chequeo periódico (cada 15 s) refleja la expiración por
tiempo en la interfaz sin esperar a que el usuario navegue a otra pantalla.

Nunca se guarda: contraseña, código temporal, ni tokens/API keys de Airtable.

### 12.5 Endpoints previstos (n8n)

El frontend queda preparado para consumir estos webhooks (no es necesario que ya
respondan; ver 12.1 y 12.8):

```
Autenticación
POST /auth/request-code   POST /auth/verify-code
POST /auth/logout         GET  /auth/me

Colaborador
GET  /evaluaciones/mias                 GET  /evaluaciones/:id
POST /autoevaluacion/:id/guardar        POST /autoevaluacion/:id/enviar

Líder
GET  /lider/equipo                      GET  /lider/evaluaciones
GET  /lider/evaluaciones/:id
POST /lider/evaluaciones/:id/guardar    POST /lider/evaluaciones/:id/enviar

Administrador
GET  /admin/evaluaciones                GET  /admin/calibraciones
POST /admin/calibraciones/:id/guardar   POST /admin/calibraciones/:id/liberar
GET  /admin/nine-box

Retroalimentación
GET  /retroalimentacion/:id
POST /retroalimentacion/:id/guardar     POST /retroalimentacion/:id/cerrar
```

### 12.6 Usuarios y jerarquías (Excel maestro)

`js/data.js` incorpora los campos que traería el Excel maestro de usuarios:
`correoCorporativo`, `estatusEmpleado`, `correoValidado`, `ultimaActualizacion`,
además de los ya existentes (`puesto`, `area`, `ciudad`). Se agregó una tabla nueva,
`JERARQUIAS` (una fila por colaborador, con la forma exacta que tendría el registro
de Airtable/Excel: `idAsignacion`, `numeroEmpleado`, `numeroLider`, `periodo`,
`fechaInicio`, `fechaFin`, `asignacionActiva`, `tipoAsignacion`) — se deriva de
`COLABORADORES.liderId` para no duplicar la fuente de verdad de esa relación, que
sigue siendo el mismo campo desde beta 1.

Las relaciones **siempre** usan `numeroEmpleado`/`numeroLider`, nunca el nombre.

Se agregó un colaborador nuevo, **10011 — Mario Castillo (Operaciones)**, sin
`liderId` asignado, exclusivamente para poder demostrar el caso "sin líder
asignado" en la vista de Jerarquías (12.7) sin tocar ninguno de los escenarios ya
verificados de beta 2 (10001–10010 quedan intactos).

### 12.7 Pantallas administrativas nuevas (solo consulta)

- **Usuarios** (`#/admin/usuarios`): tabla con número de empleado, nombre, correo
  **enmascarado**, puesto, área, rol, estatus, líder asignado (o el badge "Sin líder
  asignado"), si el correo está validado, y última actualización. Filtros por área,
  rol, estatus, con/sin líder y con/sin correo. Es de solo consulta: no incluye
  edición masiva ni importación de Excel desde el navegador (fuera de alcance a
  propósito, ver 12.8).
- **Jerarquías** (`#/admin/jerarquias`): tabla derivada de `JERARQUIAS`, con KPIs de
  asignaciones totales / con líder / sin líder, filtros por estado de asignación y
  periodo, y las filas sin líder resaltadas visualmente (borde e indicador rojo),
  porque esos colaboradores no pueden avanzar al flujo de evaluación del líder hasta
  que se les asigne uno en el Excel maestro.

### 12.8 Riesgos y pendientes para conectar n8n/Airtable

- El `apiBaseUrl` de ejemplo (`js/config.js`) es un placeholder; hay que
  sustituirlo por la URL real del entorno de n8n antes de usar el modo `api`.
- Los 20 endpoints de 12.5 están **definidos** en `api.js` pero no **implementados**
  en n8n; hasta que existan, el modo `api` solo sirve para probar que el frontend
  maneja bien los errores de conexión (ver prueba correspondiente en el harness de
  pruebas).
- El envío real del código temporal por correo depende de que n8n tenga configurado
  un nodo de correo (SMTP/Office 365/etc.); esta beta no lo implementa.
- La autorización por rol implementada en el frontend (qué ve cada perfil) es
  **solo de interfaz**; debe revalidarse siempre del lado de n8n antes de producción,
  ocultar un botón no equivale a autorizar la acción.
- Falta definir en n8n la vigencia real y el mecanismo de invalidación de códigos
  usados (single-use), que aquí solo se simula localmente en modo demo.
- Las pantallas de datos (evaluaciones, comparación, calibración, 9-box) siguen
  leyendo de `localStorage` incluso en modo `api` en esta beta; conectarlas al
  backend real es trabajo de una beta posterior (ver 12.1).
- Falta decidir, junto con RH, el mapeo definitivo de `rolPlataforma` /
  `puedeAutoevaluarse` / `puedeEvaluar` / `requiereEvaluacion` del Excel maestro
  hacia las reglas de acceso de la plataforma (hoy se infiere del mismo campo
  `perfil`/`liderId` que ya existía desde beta 1).
- Airtable — tablas previstas y su correspondencia con las entidades del frontend
  (nombres exactos de campos por definir junto con quien administre la base):

  | Tabla en Airtable | Entidad/origen en el frontend |
  |---|---|
  | `Empleados` | `colaboradores` + `lideres` + `administradores` (ver 12.6) |
  | `Asignaciones` | `jerarquias` (12.6) |
  | `Periodos` | `periodos` |
  | `Evaluaciones` | `evaluaciones` |
  | `Preguntas` | `js/data.js` → `COMPETENCIAS` (catálogo, hoy fijo en el frontend) |
  | `Respuestas` | `respuestas` |
  | `Objetivos` | `objetivos` |
  | `Calibraciones` | `calibraciones` |
  | `Retroalimentaciones` | ficha ejecutiva (`viewRetroalimentacion`) + `areas_oportunidad` + `planes_desarrollo` + `acciones` |
  | `Sesiones` | sesión en `sessionStorage` (12.4) — no debería persistir en Airtable más allá de lo necesario para invalidar tokens |
  | `CodigosAcceso` | código temporal + `requestId` (12.2) — de un solo uso, con vigencia corta |
  | `Bitacora` | `auditoria` |

## 13. Propuesta de migración a producción

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

---

## Hardening de seguridad — Beta 3.1

Esta copia incorpora defensa en profundidad para la demo antes de conectar el backend:

- El router valida que el portal solicitado (`colaborador`, `lider`, `admin`) coincida con el rol de la sesión. Cambiar manualmente el hash ya no renderiza un portal ajeno.
- Las acciones sensibles validan rol antes de modificar datos: calibración, habilitación de retroalimentación, configuración, Nine Box, filtros administrativos y reinicio de demo.
- Las acciones de colaborador validan propiedad del recurso: una autoevaluación/evidencia/aceptación solo puede modificarse por el mismo número de empleado autenticado.
- Las acciones de líder validan relación jerárquica y que la evaluación corresponda al líder autenticado antes de modificar respuestas, objetivos, fortalezas, comentarios o planes del colaborador.
- Los tokens e identificadores simulados dejaron de usar `Math.random()` y ahora usan `crypto.getRandomValues()`.

### Límite importante

Estas validaciones protegen la interfaz y reducen modificaciones accidentales o por manipulación simple del navegador, pero **no convierten `localStorage` en un backend confiable**. En modo API, n8n/API debe volver a validar token, rol, relación líder-colaborador y propiedad de cada recurso antes de leer o escribir en Airtable/SQL. La auditoría definitiva también debe generarse en servidor.
