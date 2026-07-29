# Plataforma EDD Inter-Con — Demo funcional

Demo web funcional (sin backend) de la Evaluación del Desempeño Administrativo de
**INTER-CON SERVICIOS DE SEGURIDAD PRIVADA, S.A. DE C.V.**, construida a partir del
documento oficial `EDD_Inter-Con_alineada.docx` (FOR-CAP-003 Rev. 3): competencias,
ponderaciones, escala, fórmulas, clasificación de desempeño, matriz 9-box, significado
de cuadrantes, acciones sugeridas, fortalezas, áreas de oportunidad, plan de mejora,
plan de desarrollo y comentarios/evidencias provienen todos de ese documento.

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
demostrar cada pantalla sin necesidad de capturar datos desde cero.

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

- **Ponderación de secciones:** A. Valores y Actitud 40 %, B. Habilidades 20 %,
  C. Conocimientos 10 %, D. Cumplimiento de Objetivos 30 % (suman 100 %).
- **Puntaje de sección** = `(promedio de calificaciones válidas / 5) × peso de la sección`.
- **Puntaje final** = suma de los 4 puntajes de sección, sobre 100 puntos. Se
  mantienen decimales internamente y se muestra un máximo de un decimal.
- **Clasificación de nivel:** 95–100 Sobresaliente · 90–94.99 Excede las expectativas
  · 80–89.99 Cumple las expectativas · 70–79.99 Cumple parcialmente · <70 Requiere
  mejorar.
- **Eje ACTITUD** = promedio de la Sección A. **Eje DESEMPEÑO** = promedio ponderado
  de B + C + D.
- **Cuadrante 9-box** = `(nivelDesempeño − 1) × 3 + nivelActitud`, con
  `nivelActitud`/`nivelDesempeño` en {1, 2, 3} según `CONFIG_9BOX`. La fórmula fue
  validada contra los 9 significados y acciones del documento oficial.
- **Brecha auto vs. líder:** 0–0.49 Alineada · 0.50–0.99 Revisar · ≥1 Brecha
  significativa (umbrales editables desde el portal de Administrador → Configuración).

## 5. Tratamiento de N/A

- N/A **nunca** se convierte en 0 ni reduce el promedio.
- Se excluye del denominador al calcular el promedio de la sección.
- Se conserva el valor "N/A" en el registro de respuestas para trazabilidad.
- Si una sección completa queda sin calificaciones válidas, su puntaje es 0 y se
  marca internamente como `sinDatos: true` (no se oculta el problema, se puede
  auditar).

## 6. Modelo de datos (localStorage, clave `edd_interconn_db_v1`)

Entidades: `usuarios`, `colaboradores`, `lideres`, `periodos`, `evaluaciones`,
`respuestas`, `objetivos`, `resultados`, `calibraciones`, `cuadrantes`,
`planes_desarrollo`, `areas_oportunidad`, `acciones` (cronograma de 6 semanas),
`evidencias`, `auditoria`, `configuracion`.

Cada `evaluacion` tiene `tipo` (`autoevaluacion` | `lider`), `estado`, y referencias a
`respuestas`/`objetivos` por `evaluacionId`. Cada envío completado genera un registro
en `resultados` con `puntajes`, `promedios` y `nivel`. Las `calibraciones` guardan
`historial` con valor anterior, valor nuevo, motivo, usuario, fecha y hora de cada
cambio (trazabilidad exigida por el punto 21 del brief).

## 7. Estados del proceso

`No iniciada` → `En progreso` → `Completada` (por evaluación) y a nivel del proceso
completo: `Pendiente de líder` → `Pendiente de calibración` → `Calibrada` →
`Retroalimentación pendiente` → `Cerrada`. El estado general se **deriva**
automáticamente de las evaluaciones y la calibración (función `estadoProceso` en
`storage.js`); no se guarda como bandera manual para evitar inconsistencias.

## 8. Configuración de umbrales

- `CONFIG_9BOX` (nivel1Max 2.49, nivel2Max 3.99, nivel3Max 5) está **centralizado**
  en `calculations.js`. El código señala explícitamente que estos límites deben ser
  validados por RH antes de producción.
- `CONFIG_BRECHA` (alineada/revisar) es editable desde el portal de Administrador
  → Configuración, y no está incrustado de forma rígida en la interfaz.

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
