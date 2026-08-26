# Evaluación de Desempeño — Inter-Con

Frontend web de la plataforma de Evaluación de Desempeño.

## Estado actual

Aplicación estática en HTML, CSS y JavaScript conectada al backend de n8n para autenticación OTP, evaluaciones, calibración, retroalimentación y firmas.

## Perfiles

- Colaborador: autoevaluación, objetivos y resultados personales.
- Líder: evaluación de equipo, retroalimentación y firmas.
- Administrador DO: dashboard, calibración, matriz 9-Box, usuarios y configuración.

Los permisos reales deben validarse en backend; el frontend solo controla navegación y experiencia de usuario.

## Estructura

- `index.html` — entrada principal.
- `css/styles.css` — estilos.
- `js/app.js` — navegación y lógica de interfaz.
- `js/api.js` — integración con backend.
- `js/auth.js` — autenticación y sesión.
- `js/calculations.js` — cálculos de evaluación.
- `js/charts.js` — visualizaciones.
- `js/config.js` — configuración de frontend.
- `js/data.js`, `js/storage.js`, `js/icons.js` — soporte de aplicación.
- `assets/` — recursos visuales.
- `CNAME` — dominio personalizado.

## Reglas principales

Ponderación Rev. 4:

- 40% Valores y Actitud.
- 30% Conocimientos y Habilidades Técnicas.
- 30% Objetivos.

Los N/A se excluyen del promedio y la lógica sensible de evaluación, calibración y permisos debe permanecer validada del lado del backend.

## Producción

Dominio: `https://evaluacion.intercon.com.mx`

No guardar tokens, credenciales de Airtable, secretos de n8n ni llaves privadas en este repositorio.

## Documentación

Este README es la referencia vigente del frontend. Los archivos históricos de cambios y notas de versiones se retiraron del branch principal para mantener el repositorio limpio; el historial completo permanece disponible en Git.
