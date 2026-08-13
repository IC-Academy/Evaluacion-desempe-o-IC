# EDD Inter-Con — Rev. 4 · Ponderación 40/30/30

Versión de frontend alineada al documento oficial `EDD_Inter-Con_Rev4_ponderacion_40_60.docx` (FOR-CAP-003 Rev. 4).

## Reglas funcionales aplicadas

- Valores y Actitud: **40%** (5 reactivos de 8%).
- Conocimientos y Habilidades Técnicas del Puesto: **30%** (5 reactivos de 6%).
- Cumplimiento de Objetivos: **30%**.
- Escala 1–5 + N/A; N/A se excluye del promedio.
- Si más de la mitad de una sección está en N/A se exige justificación en comentarios antes del envío.
- Objetivos: hasta 5 con objetivo, meta/indicador, resultado, % de cumplimiento y calificación.
- Equivalencia Rev.4: >=110%=5, 100–109%=4, 90–99%=3, 75–89%=2, <75%=1.
- Eje ACTITUD = promedio A × 20.
- Eje DESEMPEÑO = Técnica Funcional + Objetivos, convertido a base 100.
- Niveles 9-box: <60 Bajo; 60–79 Medio; 80–100 Alto.

## Importante

SMART/IA permanece en el código solo como compatibilidad futura, pero **no forma parte del flujo visible Rev.4**. El login OTP actual también se conserva sin cambios; la migración a Microsoft Entra ID/SAML se realizará en una fase separada cuando HTTPS y la configuración del IdP estén listos.

## Modo demo / API

La aplicación conserva la arquitectura existente (`APP_CONFIG.mode`). No se agregan secretos al frontend.
