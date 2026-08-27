/**
 * i18n-unified-v33.js
 * ---------------------------------------------------------------------------
 * Traduccion ES/EN consolidada. Reemplaza a i18n-coverage-v29.js,
 * i18n-domain-v30.js, i18n-polish-v31.js e i18n-employee-v32.js, que corrian
 * en paralelo con 4 MutationObserver independientes y reglas de reemplazo
 * por PALABRA SUELTA (ej. /\bObjetivos\b/gi -> 'Goals'). Esas reglas
 * globales se disparaban dentro de oraciones completas que no estaban en
 * ningun diccionario exacto, produciendo texto a medio traducir
 * ("Recuperando respuestas y Goals guardados..."), y el mismo concepto
 * quedaba traducido de forma distinta segun que capa lo alcanzara primero
 * ("Objectives" en unos lugares, "Goals" en otros).
 *
 * Este archivo:
 *   1. Usa SOLO coincidencia exacta de frase completa (nunca reemplazo de
 *      palabra suelta dentro de una oracion) -> elimina el Spanglish.
 *   2. Un diccionario unico y consolidado (434 entradas, fusion de las 4
 *      capas anteriores + el diccionario original de app.js) -> elimina la
 *      inconsistencia de terminologia.
 *   3. Un unico MutationObserver, sobre document.body (no solo #app-root) ->
 *      ahora si traduce los avisos emergentes (showNotice), que viven fuera
 *      de #app-root y por eso nunca los alcanzaba ninguna capa anterior.
 *   4. Una unica implementacion de deteccion de idioma por dominio de
 *      correo (languageFromEmail), con una sola clave de sessionStorage
 *      para "el usuario ya eligio a mano" -> elimina el riesgo de que dos
 *      mecanismos independientes se contradigan entre si.
 * ---------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  const LANG_KEY = 'edd_language';
  const MANUAL_FOR_KEY = 'edd_language_manual_for';
  const AUTO_FOR_KEY = 'edd_language_auto_for';

  // Diccionario unico consolidado. Coincidencia EXACTA de frase completa
  // unicamente -- nunca reemplazo de subcadena o palabra suelta dentro de
  // una oracion mas larga (eso es lo que causaba el Spanglish).
  const DICT = new Map(Object.entries({
  "Inicio": "Home",
  "Autoevaluación": "Self-assessment",
  "Retroalimentación": "Feedback",
  "Mi equipo": "My team",
  "Pendientes por evaluar": "Pending evaluations",
  "Dashboard": "Dashboard",
  "Calibración": "Calibration",
  "Matriz 9-Box": "9-Box Matrix",
  "Usuarios": "Users",
  "Jerarquías": "Hierarchy",
  "Auditoría": "Audit",
  "Configuración": "Settings",
  "Cerrar sesión": "Sign out",
  "Plataforma corporativa": "Corporate platform",
  "Bienvenido(a)": "Welcome",
  "Verificación de identidad": "Identity verification",
  "Utiliza tu número de empleado para acceder a tu evaluación.": "Use your employee number to access your evaluation.",
  "Revisa tu correo corporativo y captura el código temporal de 6 dígitos.": "Check your corporate email and enter the 6-digit temporary code.",
  "Acceso protegido · Uso exclusivo de personal autorizado": "Protected access · Authorized personnel only",
  "Número de empleado": "Employee number",
  "Ingresa tu número de empleado": "Enter your employee number",
  "Continuar": "Continue",
  "Enviando…": "Sending…",
  "Código temporal": "Temporary code",
  "Ingresar a la plataforma": "Enter platform",
  "Validando…": "Validating…",
  "El código vence en": "The code expires in",
  "minutos.": "minutes.",
  "vencido": "expired",
  "Evaluación de Desempeño": "Performance Evaluation",
  "Duración estimada": "Estimated duration",
  "¿Quién participa?": "Who participates?",
  "Antes de comenzar": "Before you begin",
  "Confidencialidad": "Confidentiality",
  "¿Cómo se integra?": "How is it structured?",
  "Escala de evaluación": "Rating scale",
  "Comenzar mi evaluación": "Start my evaluation",
  "Tu autoevaluación.": "Your self-assessment.",
  "La evaluación de tu líder.": "Your manager’s evaluation.",
  "Retroalimentación para tu desarrollo.": "Feedback for your development.",
  "Valores y Actitud": "Values and Attitude",
  "Habilidades": "Skills",
  "Conocimientos": "Knowledge",
  "Objetivos": "Objectives",
  "Cumplimiento de Objetivos": "Goal Achievement",
  "Guardar progreso": "Save progress",
  "Siguiente": "Next",
  "Anterior": "Back",
  "Siguiente sección": "Next section",
  "Finalizar y enviar ✓": "Finish and submit ✓",
  "Progreso general": "Overall progress",
  "Progreso de la sección": "Section progress",
  "Recordatorio": "Reminder",
  "Puedes guardar tu progreso en cualquier momento.": "You can save your progress at any time.",
  "Tu evaluación es confidencial.": "Your evaluation is confidential.",
  "Comentarios (opcional)": "Comments (optional)",
  "Resumen de tu evaluación": "Evaluation summary",
  "Revisa tus resultados antes de finalizar.": "Review your results before finishing.",
  "Puntaje global": "Overall score",
  "Nivel global": "Overall level",
  "Interpretación de nivel": "Level interpretation",
  "Finalizar y enviar mi evaluación": "Finish and submit my evaluation",
  "¡Evaluación enviada con éxito!": "Evaluation submitted successfully!",
  "Gracias por tu participación.": "Thank you for your participation.",
  "Ir al inicio": "Go to home",
  "Tu autoevaluación ha sido enviada correctamente.": "Your self-assessment was submitted successfully.",
  "Tu líder recibirá una notificación para realizar su evaluación.": "Your manager will receive a notification to complete their evaluation.",
  "Pendientes de retroalimentación": "Pending feedback",
  "Nombre": "Name",
  "Puesto": "Position",
  "Área": "Area",
  "Evaluación líder": "Manager evaluation",
  "Comparación": "Comparison",
  "Evaluar": "Evaluate",
  "Ver": "View",
  "No tienes evaluaciones pendientes en este momento.": "You have no pending evaluations at this time.",
  "Guardar calibración": "Save calibration",
  "Habilitar retroalimentación": "Enable feedback",
  "Retroalimentación habilitada": "Feedback enabled",
  "Resultado calibrado": "Calibrated result",
  "Percepción del colaborador": "Employee self-perception",
  "Resultado líder": "Manager result",
  "Resultado final": "Final result",
  "Justificación": "Justification",
  "Fortalezas": "Strengths",
  "Áreas de oportunidad": "Development opportunities",
  "Plan de desarrollo": "Development plan",
  "Competencia a desarrollar": "Competency to develop",
  "Acción": "Action",
  "Responsable": "Owner",
  "Fecha compromiso": "Due date",
  "Objetivo específico": "Specific objective",
  "Meta / indicador": "Target / indicator",
  "Resultado obtenido": "Achieved result",
  "Calificación": "Rating",
  "Validación SMART": "SMART validation",
  "Específico": "Specific",
  "Medible": "Measurable",
  "Alcanzable": "Achievable",
  "Relevante": "Relevant",
  "Temporal": "Time-bound",
  "Completa los criterios pendientes antes de continuar.": "Complete the pending criteria before continuing.",
  "¿Qué es un objetivo SMART?": "What is a SMART objective?",
  "Guía SMART": "SMART guide",
  "Ejemplo": "Example",
  "Objetivo general:": "General objective:",
  "Objetivo SMART:": "SMART objective:",
  "¿Por qué es SMART?": "Why is it SMART?",
  "Quitar": "Remove",
  "Agregar objetivo": "Add objective",
  "Ver escala de evaluación": "View rating scale",
  "Excede significativamente las expectativas. Es un referente para otros.": "Significantly exceeds expectations. Serves as a role model for others.",
  "Supera las expectativas de manera constante.": "Consistently exceeds expectations.",
  "Cumple con lo esperado para su puesto.": "Meets expectations for the role.",
  "Cumple parcialmente; requiere mejorar.": "Partially meets expectations; improvement is required.",
  "No cumple con las expectativas del puesto.": "Does not meet the expectations of the role.",
  "No aplica o no cuento con elementos suficientes para evaluarlo.": "Not applicable or insufficient information to evaluate.",
  "Sobresaliente": "Outstanding",
  "Excede las expectativas": "Exceeds expectations",
  "Cumple las expectativas": "Meets expectations",
  "Cumple parcialmente; requiere plan de mejora": "Partially meets expectations; improvement plan required",
  "No cumple las expectativas del puesto": "Does not meet role expectations",
  "Alto": "High",
  "Medio": "Medium",
  "Bajo": "Low",
  "Activo": "Active",
  "Inactivo": "Inactive",
  "Completada": "Completed",
  "En progreso": "In progress",
  "No iniciada": "Not started",
  "Pendiente de líder": "Pending manager",
  "Pendiente de calibración": "Pending calibration",
  "Calibrada": "Calibrated",
  "Retroalimentación pendiente": "Feedback pending",
  "Cerrada": "Closed",
  "Vencida": "Overdue",
  "Buscar": "Search",
  "Limpiar filtros": "Clear filters",
  "Todos": "All",
  "Todas": "All",
  "Estado": "Status",
  "Periodo": "Period",
  "Guardar": "Save",
  "Cancelar": "Cancel",
  "Aceptar": "Accept",
  "Cerrar": "Close",
  "Sí": "Yes",
  "No": "No",
  "Evaluación de líder": "Manager evaluation",
  "Cierre": "Closure",
  "Avance de evaluación": "Evaluation progress",
  "Avance consolidado por área para el periodo actual.": "Consolidated progress by area for the current period.",
  "Desglose por área no disponible": "Area breakdown unavailable",
  "El detalle por área estará disponible cuando existan datos suficientes para el periodo.": "Area detail will be available when enough data exists for the cycle.",
  "Resumen de empleados y seguimiento": "Employee summary and follow-up",
  "Personas visibles actualmente por alertas, calibración o cierre.": "People currently visible due to alerts, calibration, or closure.",
  "ETAPA / ATENCIÓN": "STAGE / ATTENTION",
  "RESULTADO": "RESULT",
  "RESULT": "RESULT",
  "RESULTADO FINAL": "FINAL RESULT",
  "Por calibrar": "Pending calibration",
  "Calibradas": "Calibrated",
  "Sin distribución disponible todavía.": "No distribution available yet.",
  "Cobertura por área": "Coverage by area",
  "COBERTURA POR ÁREA": "COVERAGE BY AREA",
  "Talento": "Talent",
  "TALENTO": "TALENT",
  "Operación DO": "HR OPERATIONS",
  "OPERACIÓN DO": "HR OPERATIONS",
  "Abrir matriz": "Open matrix",
  "Resumen 9-Box": "9-Box summary",
  "Pendiente líder": "Pending manager",
  "Pendiente calibración": "Pending calibration",
  "Retroalimentación disponible": "Feedback available",
  "Autoevaluación vencida": "Self-assessment overdue",
  "Evaluación líder vencida": "Manager evaluation overdue",
  "Requiere revisión": "Needs review",
  "Revisar": "Review",
  "Alineada": "Aligned",
  "Diferencias detalladas por competencia": "Detailed differences by competency",
  "COMPETENCIA": "COMPETENCY",
  "AUTOEVALUACIÓN": "SELF-ASSESSMENT",
  "EVALUACIÓN LÍDER": "MANAGER EVALUATION",
  "DIFERENCIA": "DIFFERENCE",
  "BRECHA": "GAP",
  "COMENTARIO LÍDER": "MANAGER COMMENT",
  "COMENTARIO COLABORADOR": "EMPLOYEE COMMENT",
  "Ubicación en la Matriz 9-Box": "9-Box Matrix placement",
  "Colaborador": "Employee",
  "Líder": "Manager",
  "Administrador": "Administrator",
  "Cambiar perfil": "Switch profile",
  "Guardando…": "Saving…",
  "Guardando...": "Saving...",
  "✓ Guardado": "✓ Saved",
  "✓ Sin cambios": "✓ No changes",
  "Siguiente →": "Next →",
  "Enviar evaluación ✓": "Submit evaluation ✓",
  "Confirmo que la información capturada es correcta.": "I confirm the information entered is correct.",
  "Confirmo que la evaluación está completa.": "I confirm the evaluation is complete.",
  "Resumen": "Summary",
  "Antes de capturar, revisa cómo se califican tus objetivos": "Before entering goals, review how they are scored",
  "OBJETIVOS DEL PERIODO · 30%": "PERIOD GOALS · 30%",
  "Comprendido": "Got it",
  "Escala rápida para objetivos": "Quick goal rating scale",
  "La estrella se obtiene del % validado por el líder.": "The star rating is based on the percentage validated by the manager.",
  "Meta": "Target",
  "Resultado": "Result",
  "Resultado alcanzado": "Achieved result",
  "Comentario líder": "Manager comment",
  "Comentario colaborador": "Employee comment",
  "Comentario": "Comment",
  "Oportunidades de desarrollo": "Development opportunities",
  "Brechas": "Gaps",
  "Riesgos / factores": "Risks / factors",
  "Síntesis": "Summary",
  "Competencia": "Competency",
  "Calibrar ahora": "Calibrate now",
  "Evaluar ahora": "Evaluate now",
  "Firmar ahora": "Sign now",
  "Continuar retroalimentación": "Continue feedback",
  "Ver seguimiento": "View follow-up",
  "Completar retroalimentación →": "Complete feedback →",
  "Acuerdos liberados": "Agreements released",
  "Firma registrada": "Signature recorded",
  "Guardar acuerdos": "Save agreements",
  "Confirmar reunión": "Confirm meeting",
  "Liberar para firma": "Release for signature",
  "Firmar": "Sign",
  "Descargar constancia": "Download certificate",
  "Imprimir constancia": "Print certificate",
  "Limpiar": "Clear",
  "Correo": "Email",
  "Rol plataforma": "Platform role",
  "Puede autoevaluarse": "Can self-assess",
  "Puede evaluar": "Can evaluate",
  "Requiere evaluación": "Requires evaluation",
  "Correo validado": "Email verified",
  "Administrativo 2026": "Administrative 2026",
  "Evaluación de Desempeño Administrativo 2026": "Performance Evaluation 2026",
  "Resultado disponible": "Result available",
  "Promedio general": "Overall average",
  "Avance del ciclo": "Cycle progress",
  "Personal a evaluar": "Employees to evaluate",
  "Universo del periodo": "Employees in this cycle",
  "Autoevaluaciones": "Self-assessments",
  "Evaluaciones líder": "Manager evaluations",
  "evaluaciones cerradas": "closed evaluations",
  "completadas": "completed",
  "visibles": "visible",
  "Cargando tu información": "Loading your information",
  "Preparando tu experiencia y la información del periodo.": "Preparing your experience and current-cycle information.",
  "Selecciona el perfil con el que deseas ingresar. Podrás cambiar de perfil en cualquier momento sin volver a iniciar sesión.": "Select the profile you want to use. You can switch profiles at any time without signing in again.",
  "GESTIÓN DEL CICLO": "CYCLE MANAGEMENT",
  "GESTIÓN DE EQUIPO": "TEAM MANAGEMENT",
  "MI PERFORMANCE": "MY PERFORMANCE",
  "Consulta el avance general, calibra resultados y administra el proceso de evaluación.": "Review overall progress, calibrate results, and manage the evaluation process.",
  "Evalúa a tu equipo, realiza la retroalimentación y da seguimiento a firmas y acuerdos.": "Evaluate your team, provide feedback, and track signatures and agreements.",
  "Realiza tu autoevaluación y consulta tus resultados y retroalimentación personal.": "Complete your self-assessment and review your results and personal feedback.",
  "Ingresar como administrador": "Enter as Administrator",
  "Ingresar como líder": "Enter as Manager",
  "Ingresar como colaborador": "Enter as Employee",
  "Administrador de RH": "HR Administrator",
  "PANEL DE DESARROLLO ORGANIZACIONAL": "ORGANIZATIONAL DEVELOPMENT PANEL",
  "Seguimiento integral del ciclo de evaluación, calibración, retroalimentación y cierre.": "End-to-end tracking of the evaluation, calibration, feedback, and closure cycle.",
  "Avance": "Progress",
  "Cierre del ciclo": "Cycle closure",
  "pendientes": "pending",
  "cerrado": "closed",
  "FLUJO DEL PROCESO": "PROCESS FLOW",
  "Avance de punta a punta": "End-to-end progress",
  "Vista ejecutiva del estado de cada etapa del ciclo.": "Executive view of the status of each stage of the cycle.",
  "1 · Autoevaluación": "1 · Self-assessment",
  "2 · Evaluación líder": "2 · Manager evaluation",
  "3 · Calibración DO": "3 · HR calibration",
  "4 · Retroalimentación": "4 · Feedback",
  "5 · Cierre": "5 · Closure",
  "Información actualizada": "Information up to date",
  "Los módulos muestran únicamente la información disponible para el periodo.": "Modules show only the information available for the current cycle.",
  "Actualizar": "Refresh",
  "Sin acuerdos listos para firma. Las retroalimentaciones recién liberadas aparecen primero en My team como Pendiente de reunión; después de confirmar la reunión y liberar acuerdos pasarán a esta vista.": "No agreements are ready for signature. Newly released feedback first appears in My team as Meeting pending; after the meeting is confirmed and agreements are released, it will appear here.",
  "La información se actualiza conforme avanza cada etapa del proceso.": "Information updates as each stage of the process progresses.",
  "Pendientes por firmar": "Pending signatures",
  "Por firmar líder": "Manager signature pending",
  "Firma colaborador pendiente": "Employee signature pending",
  "PROCESO": "PROCESS",
  "FIRMA": "SIGNATURE",
  "Seguimiento": "Follow-up",
  "Consulta el avance de tu equipo y las acciones que requieren seguimiento.": "Review your team progress and actions that require follow-up.",
  "Preparando tu evaluación...": "Preparing your evaluation...",
  "Guardado automático activo.": "Automatic saving is active.",
  "Tus avances quedan registrados para que puedas salir y continuar después.": "Your progress is saved so you can leave and continue later.",
  "Guardado automático activo": "Automatic saving is active",
  "Progreso guardado correctamente.": "Progress saved successfully.",
  "Peso de la sección: 40%": "Section weight: 40%",
  "Peso de la sección: 30%": "Section weight: 30%",
  "SECCIÓN 1 DE 3": "SECTION 1 OF 3",
  "SECCIÓN 2 DE 3": "SECTION 2 OF 3",
  "SECCIÓN 3 DE 3": "SECTION 3 OF 3",
  "Eje ACTITUD": "ATTITUDE axis",
  "Eje DESEMPEÑO": "PERFORMANCE axis",
  "Evalúa la vivencia diaria de los valores ESPÍRITU de Inter-Con y la forma en que el colaborador se conduce con las personas.": "Evaluate how consistently the employee demonstrates Inter-Con’s ESPÍRITU values and interacts with others.",
  "Evalúa el dominio técnico del puesto, el uso de procesos y herramientas del área y la forma en que el colaborador organiza y controla su trabajo.": "Evaluate technical mastery of the role, use of area processes and tools, and how the employee organizes and controls their work.",
  "Es puntual, constante y cumple los compromisos que asume.": "Is punctual, consistent, and follows through on commitments.",
  "Aplica correctamente los conocimientos técnicos y normativos de su puesto.": "Correctly applies the technical and regulatory knowledge required for the role.",
  "Resuelve problemas relacionados con sus responsabilidades.": "Solves problems related to their responsibilities.",
  "Mantiene actualizados sus conocimientos técnicos y las herramientas propias de su puesto.": "Keeps technical knowledge and role-specific tools up to date.",
  "Promedio de herramientas": "Tool average",
  "herramientas evaluadas": "tools evaluated",
  "Califica las herramientas que aplican a tu puesto. Usa N/A cuando no corresponda. Manejo de IA es obligatorio para todos y no admite N/A. El promedio se calcula automáticamente.": "Rate the tools that apply to your role. Use N/A when a tool does not apply. AI proficiency is mandatory for everyone and cannot be marked N/A. The average is calculated automatically.",
  "Sistemas internos de Inter-Con": "Inter-Con internal systems",
  "Portales de clientes / CFDI": "Client portals / CFDI",
  "Power BI / herramientas de análisis": "Power BI / analytics tools",
  "Excede significativamente": "Significantly exceeds expectations",
  "Supera expectativas": "Exceeds expectations",
  "Cumple lo esperado": "Meets expectations",
  "Cumple parcialmente": "Partially meets expectations",
  "No cumple": "Does not meet expectations",
  "No aplica o no hay elementos suficientes.": "Not applicable or insufficient information.",
  "Actitud positiva, pero desempeño bajo.": "Positive attitude, but low performance.",
  "Buena actitud y desempeño average; buen potencial de crecimiento.": "Positive attitude and average performance; good growth potential.",
  "Mejor actitud que desempeño.": "Stronger attitude than performance.",
  "En la mitad — OK.": "Middle range — OK.",
  "Por encima del average; tiene capacidad y actitud.": "Above average; demonstrates capability and the right attitude.",
  "No tiene la actitud ni los conocimientos requeridos para su posición.": "Does not demonstrate the attitude or knowledge required for the role.",
  "Trabajo positivo, pero resultado aún por debajo del estándar.": "Positive contribution, but results are still below standard.",
  "Actitud negativa, pero desempeño superior al average.": "Negative attitude, but performance is above average.",
  "Performance (eje horizontal): Knowledge y Skills Técnicas (30%) + Goal Achievement (30%), convertido a base 100 sobre el bloque Técnica Funcional (60%).": "Performance (horizontal axis): Technical Knowledge & Skills (30%) + Goal Achievement (30%), converted to a 100-point scale over the Technical-Functional block (60%).",
  "Attitude (eje vertical): Se obtiene de la sección \"Values and Attitude\" (40%) y se convierte a base 100 multiplicando el average por 20.": "Attitude (vertical axis): Derived from the Values and Attitude section (40%) and converted to a 100-point scale by multiplying the average by 20.",
  "Niveles por eje: Low · Medium / expected · High · Low <60 · Medium 60–79 · High 80–100.": "Axis levels: Low · Medium / expected · High · Low <60 · Medium 60–79 · High 80–100.",
  "Mi evaluación": "My evaluation",
  "Por firmar": "Pending signature",
  "Selecciona cómo quieres ingresar": "Choose how you want to enter",
  "Puedes cambiar de perfil en cualquier momento": "You can switch profiles at any time",
  "Tu perfil determina las acciones y la información que podrás consultar.": "Your profile determines the actions and information available to you.",
  "Perfil disponible": "Available profile",
  "Perfiles disponibles": "Available profiles",
  "Ingresar": "Enter",
  "Volver": "Back",
  "Panel de administración": "Administration panel",
  "Panel de líder": "Manager panel",
  "Panel de colaborador": "Employee panel",
  "Bienvenido": "Welcome",
  "Bienvenida": "Welcome",
  "Evaluación de desempeño": "Performance Evaluation",
  "Pendiente de reunión": "Meeting pending",
  "Avance por área": "Progress by area",
  "Cierre del proceso": "Process close",
  "Seguimiento de evaluaciones": "Evaluation tracking",
  "Resumen ejecutivo": "Executive summary",
  "Distribución 9-Box": "9-Box distribution",
  "Niveles de desempeño": "Performance levels",
  "Todas las áreas": "All areas",
  "Todos los estados": "All statuses",
  "Todos los cuadrantes": "All quadrants",
  "Proceso": "Process",
  "Firma": "Signature",
  "Puntaje": "Score",
  "Cuadrante": "Quadrant",
  "A. Valores y Actitud": "A. Values and Attitude",
  "B. Habilidades": "B. Skills",
  "C. Conocimientos": "C. Knowledge",
  "D. Cumplimiento de Objetivos": "D. Goal Achievement",
  "Actitud": "Attitude",
  "Desempeño": "Performance",
  "Sección": "Section",
  "Resultado real": "Actual result",
  "Cumplimiento": "Achievement",
  "Cumplimiento objetivo": "Goal achievement",
  "Comentarios": "Comments",
  "Fuente / evidencia": "Source / evidence",
  "Fuente": "Source",
  "Evidencia": "Evidence",
  "Calificación líder": "Manager rating",
  "Herramientas": "Tools",
  "Excel": "Excel",
  "Power BI": "Power BI",
  "Manejo de IA": "AI proficiency",
  "No aplica": "Not applicable",
  "Objetivos del periodo": "Period goals",
  "Objetivo": "Goal",
  "Brecha": "Gap",
  "Diferencia": "Difference",
  "Tu evaluación ya fue enviada": "Your evaluation has already been submitted",
  "Tu autoevaluación ha sido registrada correctamente.": "Your self-assessment has been recorded successfully.",
  "Tu líder recibirá la notificación correspondiente para continuar con el proceso.": "Your manager will receive the appropriate notification to continue the process.",
  "Preparando tu experiencia y la información del periodo...": "Preparing your experience and current-cycle information...",
  "Cargando tu evaluación": "Loading your evaluation",
  "Recuperando respuestas y Goals guardados...": "Restoring your saved responses and goals...",
  "Recuperando respuestas y objetivos guardados...": "Restoring your saved responses and goals...",
  "Evalúa a tu equipo, realiza la Feedback y da seguimiento a firmas y acuerdos.": "Evaluate your team, provide feedback, and track signatures and agreements.",
  "Realiza tu Self-assessment y consulta tus resultados y Feedback personal.": "Complete your self-assessment and review your results and personal feedback.",
  "Ingresar como Administrator": "Enter as Administrator",
  "Ingresar como Manager": "Enter as Manager",
  "Ingresar como Employee": "Enter as Employee",
  "2 — Cumple parcialmente; requiere mejorar.": "2 — Partially meets expectations; improvement is required.",
  "1 — No cumple.": "1 — Does not meet expectations.",
  "3 — Cumple lo esperado.": "3 — Meets expectations.",
  "4 — Supera expectativas.": "4 — Exceeds expectations.",
  "5 — Excede significativamente.": "5 — Significantly exceeds expectations.",
  "ORDEN DE LECTURA": "READING ORDER",
  "1. Objetivo": "1. Goal",
  "2. Meta y resultado alcanzado": "2. Target and achieved result",
  "3. Resultado en estrellas": "3. Star rating",
  "Meta acordada": "Agreed target",
  "¿Qué debía lograrse?": "What was expected?",
  "Result alcanzado": "Achieved result",
  "¿Qué se logró al cierre?": "What was achieved by the end of the cycle?",
  "Comparación meta vs. resultado": "Target vs. result comparison",
  "Resultado ÷ meta × 100": "Result ÷ target × 100",
  "El sistema calcula este porcentaje automáticamente y no puede editarse.": "The system calculates this percentage automatically and it cannot be edited.",
  "Resultado en estrellas": "Star rating",
  "Revisa tus respuestas antes de enviar. El resultado y la comparación con tu Manager se mostrarán más adelante, en la fase de Feedback.": "Review your responses before submitting. Your result and comparison with your manager will be shown later during the feedback stage.",
  "Revisa tus respuestas antes de enviar. El resultado y la comparación con tu líder se mostrarán más adelante, en la fase de retroalimentación.": "Review your responses before submitting. Your result and comparison with your manager will be shown later during the feedback stage.",
  "Comentarios u observaciones del Employee": "Employee comments or observations",
  "Comentarios u observaciones del colaborador": "Employee comments or observations",
  "Agrega contexto adicional si lo consideras necesario. Si más de la mitad de una sección quedó en N/A, justifica aquí.": "Add any additional context you consider necessary. If more than half of a section was marked N/A, explain why here.",
  "Trabajo en Equipo, Unión y Growth de Otros": "Teamwork, Unity and Development of Others",
  "Trabajo en Equipo, Unión y Desarrollo de Otros": "Teamwork, Unity and Development of Others",
  "Effective Communication y Apertura": "Effective Communication and Openness",
  "Comunicación Efectiva y Apertura": "Effective Communication and Openness",
  "Adaptabilidad, Iniciativa y Commitment to Sustainability": "Adaptability, Initiative and Commitment to Sustainability",
  "Adaptabilidad, Iniciativa y Compromiso con la Sustentabilidad": "Adaptability, Initiative and Commitment to Sustainability",
  "Results Orientation y Calidad": "Results Orientation and Quality",
  "Orientación a Resultados y Calidad": "Results Orientation and Quality",
  "Seguimiento, Control y Uso de Recursos": "Follow-up, Control and Resource Use",
  "Planeación y Organización": "Planning and Organization",
  "El average se calcula automáticamente.": "The average is calculated automatically.",
  "Average de herramientas": "Tool average",
  "Peso de la sección": "Section weight",
  "Eje ATTITUDE": "ATTITUDE axis",
  "Eje PERFORMANCE": "PERFORMANCE axis",
  "No calificado": "Not rated",
  "Sin calificar": "Not rated",
  "Cargando evaluación del colaborador…": "Loading employee evaluation…",
  "Cargando seguimiento y retroalimentación…": "Loading follow-up and feedback…",
  "Resultado liberado para retroalimentación.": "Result released for feedback.",
  "No tienes acceso a este perfil.": "You do not have access to this profile.",
  "Preparando tu evaluación…": "Preparing your evaluation…",
  "Progreso guardado correctamente.": "Progress saved successfully.",
  "No fue posible guardar el progreso.": "Unable to save progress.",
  "Más de la mitad de una sección está marcada como N/A. Agrega una justificación en Comentarios u observaciones antes de enviar.": "More than half of a section is marked N/A. Add a justification in Comments or observations before submitting.",
  "Prueba completada localmente. Aún no se envió a Airtable porque la capa de escritura sigue pendiente.": "Local test completed. It has not been sent to Airtable because the write layer is still pending.",
  "Completa el área de oportunidad y el plan de mejora.": "Complete the development opportunity and improvement plan.",
  "Completa la competencia y la acción de desarrollo.": "Complete the competency and development action.",
  "Más de la mitad de una sección está marcada como N/A. Justifica el uso de N/A en Comentarios generales antes de enviar.": "More than half of a section is marked N/A. Justify the use of N/A in General comments before submitting.",
  "Guardando los últimos cambios…": "Saving the latest changes…",
  "Cambios guardados. Enviando evaluación…": "Changes saved. Submitting evaluation…",
  "Evaluación enviada correctamente.": "Evaluation submitted successfully.",
  "Esta firma debe realizarse desde el portal personal correspondiente.": "This signature must be completed from the corresponding personal portal.",
  "Solo puedes firmar tu propia retroalimentación.": "You can only sign your own feedback.",
  "No tienes autorización para firmar la retroalimentación de este colaborador.": "You are not authorized to sign this employee’s feedback.",
  "La retroalimentación todavía no está habilitada.": "Feedback is not enabled yet.",
  "Los acuerdos finales deben estar liberados antes de firmar.": "The final agreements must be released before signing.",
  "La firma del colaborador se habilita después de la firma del líder.": "The employee signature becomes available after the manager signs.",
  "No se encontró el recuadro de firma.": "The signature box was not found.",
  "Firma dentro del recuadro antes de confirmar.": "Sign inside the box before confirming.",
  "Firma del líder registrada. El colaborador ya puede firmar.": "Manager signature recorded. The employee can now sign.",
  "Firma registrada. La retroalimentación quedó cerrada.": "Signature recorded. The feedback process is now closed.",
  "No fue posible registrar la firma.": "Unable to record the signature.",
  "No hay información suficiente para generar la constancia.": "There is not enough information to generate the record.",
  "Permite ventanas emergentes para imprimir la constancia.": "Allow pop-up windows to print the record.",
  "Tu líder debe realizar la reunión y liberar los acuerdos finales antes de que puedas aceptar.": "Your manager must hold the meeting and release the final agreements before you can accept.",
  "Confirma que recibiste la retroalimentación y revisaste los acuerdos antes de cerrar.": "Confirm that you received the feedback and reviewed the agreements before closing.",
  "Retroalimentación aceptada correctamente.": "Feedback accepted successfully.",
  "En producción la reunión confirmada no se revierte desde el portal.": "In production, a confirmed meeting cannot be reversed from the portal.",
  "Reunión confirmada. Documenta los acuerdos finales.": "Meeting confirmed. Document the final agreements.",
  "Se retiró la confirmación de reunión.": "Meeting confirmation removed.",
  "No fue posible confirmar la reunión.": "Unable to confirm the meeting.",
  "Confirma primero que realizaste la reunión de retroalimentación.": "First confirm that you held the feedback meeting.",
  "Documenta los acuerdos finales antes de liberarlos para firma.": "Document the final agreements before releasing them for signature.",
  "Los acuerdos ya están liberados y tu firma ya fue registrada.": "The agreements have already been released and your signature has been recorded.",
  "Acuerdos guardados y liberados para firma.": "Agreements saved and released for signature.",
  "No fue posible liberar los acuerdos.": "Unable to release the agreements.",
  "No se encontró al colaborador.": "The employee was not found.",
  "Captura un resultado calibrado válido entre 1 y 5.": "Enter a valid calibrated result between 1 and 5.",
  "Borrador de calibración guardado.": "Calibration draft saved.",
  "No fue posible guardar la calibración.": "Unable to save the calibration.",
  "Calibración completada correctamente.": "Calibration completed successfully.",
  "No fue posible completar la calibración.": "Unable to complete the calibration.",

  "Avance": "Progress",
  "Objetivos": "Objectives",
  "Calibración": "Calibration",
  "Retroalimentación": "Feedback",
  "Alertas": "Alerts",
  "Talento": "Talent",
  "Estado del ciclo": "Cycle status",
  "Información consolidada del ciclo de evaluación.": "Consolidated evaluation cycle information.",
  "Actualizar datos": "Refresh data",
  "Evaluación de líder": "Manager evaluation",
  "Evaluation of líder": "Manager evaluation",
  "Cierre": "Closure",
  "Cobertura de objetivos": "Objective coverage",
  "La ausencia de objetivos es un indicador de gestión; no se interpreta automáticamente como bajo desempeño del colaborador.": "The absence of objectives is a management indicator; it is not automatically interpreted as poor employee performance.",
  "Con objetivos": "With objectives",
  "Sin objetivos": "Without objectives",
  "Cobertura": "Coverage",
  "Información pendiente": "Pending information",
  "No existe en Airtable un campo formal que distinga NO_TUVO_OBJETIVOS de TODAVÍA_NO_CAPTURO — este bloque solo mide ausencia de registros en Objetivos, no la razón.": "Airtable does not contain a formal field that distinguishes NO_OBJECTIVES_ASSIGNED from NOT_YET_ENTERED — this section only measures missing objective records, not the reason.",
  "Gap de gestión": "Management gap",
  "Seguimiento de revisión DO": "OD review tracking",
  "Pendientes": "Pending",
  "Calibradas": "Calibrated",
  "Promedio calibrado": "Average calibrated score",
  "Requieren revisión DO": "Require OD review",
  "Con resultado": "With result",
  "Resultado disponible": "Result available",
  "Consulta aquí el avance de las calibraciones del periodo.": "Review the progress of the cycle’s calibrations here.",
  "COBERTURA POR ÁREA": "COVERAGE BY AREA",
  "Avance de evaluación": "Evaluation progress",
  "Avance consolidado por área para el periodo actual.": "Consolidated progress by area for the current cycle.",
  "Desglose por área no disponible": "Area breakdown unavailable",
  "El detalle por área estará disponible cuando existan datos suficientes para el periodo.": "Area details will be available when enough data exists for the cycle.",
  "Resumen 9-Box": "9-Box summary",
  "Abrir matriz": "Open matrix",
  "Sin distribución disponible todavía.": "No distribution available yet.",
  "OPERACIÓN DO": "OD OPERATIONS",
  "Resumen de empleados y seguimiento": "Employee summary and follow-up",
  "Personas visibles actualmente por alertas, calibración o cierre.": "People currently visible due to alerts, calibration, or closure.",
  "visibles": "visible",
  "VENCIMIENTOS": "OVERDUE ITEMS",
  "Evaluaciones fuera de fecha": "Overdue evaluations",
  "Autoevaluación": "Self-assessment",
  "Evaluación líder": "Manager evaluation",
  "Retroalimentación": "Feedback",
  "CIERRE": "CLOSURE",
  "Firmas y retroalimentación": "Signatures and feedback",
  "Liberadas": "Released",
  "Firma líder": "Manager signature",
  "Firma colaborador": "Employee signature",
  "FLUJO DEL PROCESO": "PROCESS FLOW",
  "Avance de principio a fin": "End-to-end progress",
  "Vista ejecutiva del estado de cada etapa del ciclo.": "Executive view of the status of each stage of the cycle.",
  "1 · Autoevaluación": "1 · Self-assessment",
  "2 · Evaluación líder": "2 · Manager evaluation",
  "3 · Calibración DO": "3 · OD calibration",
  "4 · Retroalimentación": "4 · Feedback",
  "5 · Cierre": "5 · Closure",
  "Información al día": "Information up to date",
  "Los módulos muestran únicamente la información disponible para el ciclo actual.": "Modules show only the information available for the current cycle.",
  "Actualizar": "Refresh",
  "Autoevaluaciones vencidas": "Overdue self-assessments",
  "Evaluaciones líder vencidas": "Overdue manager evaluations",
  "Firmas pendientes": "Pending signatures",
  "Requieren seguimiento": "Require follow-up",
  "Seguimiento con liderazgo": "Manager follow-up",
  "Proceso sin cerrar": "Process not closed",
  "Seguimiento requerido": "Follow-up required",
  "Personas y etapas que requieren atención durante el ciclo.": "People and stages that require attention during the cycle.",
  "Autoevaluación vencida": "Self-assessment overdue",
  "Evaluación líder vencida": "Manager evaluation overdue",
  "Retroalimentación vencida": "Feedback overdue",
  "COLABORADOR": "EMPLOYEE",
  "ÁREA": "AREA",
  "LÍDER": "MANAGER",
  "FECHA LÍMITE": "DEADLINE",
  "Distribución 9-Box": "9-Box distribution",
  "Vista agregada de la distribución de talento disponible para el periodo.": "Aggregate view of the talent distribution available for the cycle.",
  "Actitud promedio": "Average attitude",
  "Desempeño promedio": "Average performance",
  "Sin distribución disponible": "No distribution available",
  "Se poblará conforme existan evaluaciones con resultado.": "It will populate as completed evaluation results become available.",
  "Cuadrantes con datos": "Quadrants with data",
  "Distribución 9-Box": "9-Box distribution",
  "Inter-Con Seguridad Privada · Evaluación de Desempeño · FOR-CAP-003 Rev. 4": "Inter-Con Private Security · Performance Evaluation · FOR-CAP-003 Rev. 4",
  "Base disponible": "Available data",
  "CALIBRACIÓN": "CALIBRATION",
  "Cierre y firmas": "Closure and signatures",
  "Etapa / atención": "Stage / attention",
  "Fecha límite": "Deadline",
  "Firma líder pendiente": "Manager signature pending",
  "MADUREZ DE GESTIÓN": "MANAGEMENT MATURITY",
  "No hay detalle de colaboradores para esta alerta.": "No employee details are available for this alert.",
  "Para retroalimentación": "Ready for feedback",
  "Pendiente reunión": "Meeting pending",
  "RETROALIMENTACIÓN": "FEEDBACK",
  "Sin personas con alertas o actividad pendiente en este momento.": "No people currently have alerts or pending activity.",
  "No existe en Airtable un campo formal que distinga NO_TUVO_OBJETIVOS de TODAVIA_NO_CAPTURO — este bloque solo mide ausencia de registros en Objetivos, no la razón.": "Airtable does not contain a formal field that distinguishes NO_OBJECTIVES_ASSIGNED from NOT_YET_ENTERED — this section only measures missing objective records, not the reason.",

  "Tu autoevaluación ya fue enviada": "Your self-assessment has already been submitted",
  "El proceso continúa con tu líder y Desarrollo Organizacional. Te notificaremos cuando tu retroalimentación esté disponible.": "The process continues with your manager and Organizational Development. We will notify you when your feedback is available.",
  "Tu evaluación es importante": "Your evaluation matters",
  "Colaboradores": "Employees",
  "Por firmar líder": "Pending manager signatures",
  "Pendientes por firmar": "Pending signatures",
  "Pendiente colaborador": "Pending employee",
  "Esperando autoevaluación": "Waiting for self-assessment",
  "Evaluar": "Evaluate",
  "Ver seguimiento": "View follow-up",
  "Sin acuerdos listos para firma. Las retroalimentaciones recién liberadas aparecen primero en Mi equipo como Pendiente de reunión; después de confirmar la reunión y liberar acuerdos pasarán a esta vista.": "There are no agreements ready for signature. Newly released feedback first appears in My team as Meeting pending; after the meeting is confirmed and the agreements are released, it will appear in this view.",
  "No tienes acuerdos pendientes por firmar en este momento.": "You have no agreements pending signature at this time.",
  "SEGUIMIENTO": "FOLLOW-UP",
  "Consulta el avance de tu equipo y las acciones que requieren seguimiento.": "Review your team’s progress and actions that require follow-up.",
  "La información se actualiza conforme avanza cada etapa del proceso.": "Information updates as each stage of the process progresses.",
  "ACCIÓN REQUERIDA": "ACTION REQUIRED",
  "Revisa la retroalimentación y firma desde tu portal para que el colaborador pueda continuar.": "Review the feedback and sign from your portal so the employee can continue.",
  "Avance del equipo": "Team progress",
  "Evaluaciones pendientes (líder)": "Pending manager evaluations",
  "Evaluación del líder": "Manager evaluation",
  "Puntaje autoevaluación": "Self-assessment score",
  "Puntaje evaluación líder": "Manager evaluation score",
  "Ver comparación": "View comparison",
  "Volver a mi equipo": "Back to my team",
  "El colaborador aún no completa su autoevaluación. No es posible iniciar la evaluación del líder todavía.": "The employee has not completed their self-assessment yet. The manager evaluation cannot be started at this time.",
  "Ambas evaluaciones deben estar completas para ver la comparación.": "Both evaluations must be complete to view the comparison.",
  "Las evaluaciones están completas, pero todavía no hay resultados calculados disponibles. Actualiza e intenta de nuevo.": "The evaluations are complete, but calculated results are not available yet. Refresh and try again.",
  "Progreso de evaluación": "Evaluation progress",
  "Guarda tu avance y verifica cada sección antes de enviar. La autoevaluación se mostrará después del envío.": "Save your progress and review each section before submitting. The self-assessment will be shown after submission.",
  "La autoevaluación del colaborador permanecerá oculta hasta que envíes tu evaluación.": "The employee’s self-assessment will remain hidden until you submit your evaluation.",
  "OBJETIVOS DEL PERIODO": "PERIOD OBJECTIVES",
  "El colaborador no registró objetivos en este periodo.": "The employee did not record objectives for this cycle.",
  "El colaborador reportó que no tuvo objetivos definidos": "The employee reported that no objectives were defined",
  "Como líder, valida si esta ausencia corresponde a la realidad del periodo. Esto permite distinguir una brecha de desempeño de una brecha de gestión.": "As the manager, confirm whether this reflects the reality of the cycle. This distinguishes a performance gap from a management gap.",
  "Validación del líder": "Manager validation",
  "Había objetivos": "Objectives existed",
  "Debes documentarlos y evaluarlos para este cierre.": "You must document and evaluate them for this cycle close.",
  "✓ Confirmar sin objetivos": "✓ Confirm no objectives",
  "La sección queda N/A y se reporta como indicador de madurez de gestión.": "The section remains N/A and is reported as a management maturity indicator.",
  "Documenta los objetivos que sí existían": "Document the objectives that existed",
  "Captura objetivo, meta y resultado. El cumplimiento y la equivalencia se calcularán automáticamente. Esta discrepancia quedará visible para DO.": "Enter the objective, target, and result. Achievement and its rating equivalent will be calculated automatically. This discrepancy will be visible to OD.",
  "% reportado por colaborador:": "% reported by employee:",
  "% de cumplimiento validado por líder": "% achievement validated by manager",
  "Captura el porcentaje que determinaste después de validar la evidencia o fuente.": "Enter the percentage determined after validating the evidence or source.",
  "Equivalencia del colaborador:": "Employee rating equivalent:",
  "Calificación resultante": "Resulting rating",
  "Se calcula automáticamente con la equivalencia Rev. 4.": "Calculated automatically using the Rev. 4 rating scale.",
  "Justificación de la discrepancia": "Discrepancy justification",
  "Si el porcentaje validado es diferente al reportado por el colaborador, registra la justificación y fuente utilizada.": "If the validated percentage differs from the employee’s reported percentage, record the justification and source used.",
  "El porcentaje validado coincide con el colaborador.": "The validated percentage matches the employee’s report.",
  "Sin ajuste": "No adjustment",
  "Resumen cualitativo del desempeño": "Qualitative performance summary",
  "Analiza el desempeño con una lógica inspirada en FODA, enfocada en desarrollo. Registra hechos observables y evita comentarios personales o ambiguos.": "Analyze performance using a development-focused SWOT approach. Record observable facts and avoid personal or ambiguous comments.",
  "Riesgos o factores de atención": "Risks or attention factors",
  "Situaciones que podrían afectar el desempeño si no se atienden oportunamente.": "Situations that could affect performance if they are not addressed promptly.",
  "Síntesis del líder": "Manager summary",
  "Resume los puntos anteriores en un mensaje claro, respetuoso, útil y orientado a acciones.": "Summarize the points above in a clear, respectful, useful, and action-oriented message.",
  "Áreas de oportunidad y plan de mejora": "Development opportunities and improvement plan",
  "Área de oportunidad": "Development opportunity",
  "Plan de mejora": "Improvement plan",
  "Registrar acuerdo de mejora": "Add improvement agreement",
  "+ Agregar acción": "+ Add action",
  "Guardar acción": "Save action",
  "Sin áreas registradas todavía.": "No development opportunities recorded yet.",
  "Registrar acción de desarrollo": "Add development action",
  "Acción acordada": "Agreed action",
  "Define una acción concreta, medible y con fecha compromiso.": "Define a specific, measurable action with a due date.",
  "Sin acciones registradas todavía.": "No actions recorded yet.",
  "CIERRE DE RETROALIMENTACIÓN": "FEEDBACK CLOSURE",
  "Reunión, acuerdos y firma": "Meeting, agreements, and signature",
  "Confirma la reunión, ajusta los acuerdos si es necesario y libera la versión final antes de firmar.": "Confirm the meeting, adjust the agreements if needed, and release the final version before signing.",
  "Confirmo que ya realicé la reunión de retroalimentación con el colaborador.": "I confirm that I held the feedback meeting with the employee.",
  "Acuerdos finales de la reunión": "Final meeting agreements",
  "Firma del líder": "Manager signature",
  "Firma del colaborador": "Employee signature"
}));

  // -------------------------------------------------------------------
  // Idioma por dominio de correo (regla oficial, unica implementacion).
  // -------------------------------------------------------------------
  function languageFromEmail(email) {
    const e = String(email || '').trim().toLowerCase();
    if (e.endsWith('@intercon.com.mx')) return 'es';
    if (e.endsWith('@icsecurity.com')) return 'en';
    return 'es';
  }

  function currentLanguage() {
    try { return localStorage.getItem(LANG_KEY) || 'es'; } catch (_) { return 'es'; }
  }

  function sessionIdentity() {
    try {
      const s = global.EDDAuth && global.EDDAuth.getSession ? global.EDDAuth.getSession() : null;
      const u = s && s.user ? s.user : {};
      return { employee: String(u.numeroEmpleado || ''), email: String(u.correo || u.email || '').trim().toLowerCase() };
    } catch (_) { return { employee: '', email: '' }; }
  }

  // Aplica el idioma por dominio SOLO la primera vez que se detecta la
  // identidad en la sesion, y SOLO si el usuario no eligio manualmente ya
  // (con una unica clave de sessionStorage para esa decision).
  function applyDomainDefaultOnce() {
    const id = sessionIdentity();
    if (!id.employee || !id.email) return false;
    let manualFor = '';
    try { manualFor = sessionStorage.getItem(MANUAL_FOR_KEY) || ''; } catch (_) {}
    if (manualFor === id.employee) return false;
    let marker = '';
    try { marker = sessionStorage.getItem(AUTO_FOR_KEY) || ''; } catch (_) {}
    const desired = languageFromEmail(id.email);
    if (marker === id.employee + ':' + desired) return false;
    try { sessionStorage.setItem(AUTO_FOR_KEY, id.employee + ':' + desired); } catch (_) {}
    if (currentLanguage() !== desired) {
      try { localStorage.setItem(LANG_KEY, desired); } catch (_) {}
      location.reload();
      return true;
    }
    return false;
  }

  function setLanguageManual(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
    const id = sessionIdentity();
    try { if (id.employee) sessionStorage.setItem(MANUAL_FOR_KEY, id.employee); } catch (_) {}
    translateAll();
  }

  // -------------------------------------------------------------------
  // Traduccion: SOLO coincidencia exacta de frase completa (trim de
  // espacios en los extremos preservado). Sin regex de palabra suelta.
  // -------------------------------------------------------------------
  function translateText(text) {
    if (currentLanguage() !== 'en') return text;
    const raw = String(text == null ? '' : text);
    const leading = (raw.match(/^\s*/) || [''])[0];
    const trailing = (raw.match(/\s*$/) || [''])[0];
    const core = raw.trim();
    if (!core) return raw;
    const hit = DICT.get(core);
    if (hit !== undefined) return leading + hit + trailing;

    // Explicit full-message patterns for values that contain runtime data.
    // These patterns translate the whole sentence, never isolated words.
    const notification = core.match(/^Notificación enviada a (.+)\.$/);
    if (notification) return leading + `Notification sent to ${notification[1]}.` + trailing;
    const withObjectives = core.match(/^(\d+|—) con objetivos$/);
    if (withObjectives) return leading + `${withObjectives[1]} with objectives` + trailing;
    const visible = core.match(/^(\d+) visibles$/);
    if (visible) return leading + `${visible[1]} visible` + trailing;
    const pending = core.match(/^(\d+) pendientes$/);
    if (pending) return leading + `${pending[1]} pending` + trailing;
    const closedPercent = core.match(/^(\d+(?:\.\d+)?)% cerrado$/);
    if (closedPercent) return leading + `${closedPercent[1]}% closed` + trailing;
    const closedEvaluations = core.match(/^(\d+) de (\d+) evaluaciones cerradas$/);
    if (closedEvaluations) return leading + `${closedEvaluations[1]} of ${closedEvaluations[2]} evaluations closed` + trailing;
    const completed = core.match(/^(\d+)\/(\d+) completadas$/);
    if (completed) return leading + `${completed[1]}/${completed[2]} completed` + trailing;
    const records = core.match(/^(\d+) registros$/);
    if (records) return leading + `${records[1]} records` + trailing;
    const closurePercent = core.match(/^(\d+(?:\.\d+)?)% de cierre$/);
    if (closurePercent) return leading + `${closurePercent[1]}% closure` + trailing;
    const leaderSection = core.match(/^(Mi equipo|Pendientes por evaluar|Pendientes por firmar)\s+—\s+(.+)$/);
    if (leaderSection) {
      const sectionLabel = DICT.get(leaderSection[1]) || leaderSection[1];
      return leading + `${sectionLabel} — ${leaderSection[2]}` + trailing;
    }
    const agreementsToSign = core.match(/^Tienes (\d+) acuerdos? por firmar$/);
    if (agreementsToSign) {
      const count = agreementsToSign[1];
      return leading + `You have ${count} agreement${count === '1' ? '' : 's'} pending signature` + trailing;
    }
    const codeSuffix = core.match(/^(.*?)(\s+\([A-Z0-9_-]+\))$/);
    if (codeSuffix && DICT.has(codeSuffix[1])) {
      return leading + DICT.get(codeSuffix[1]) + codeSuffix[2] + trailing;
    }
    return raw;
  }

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) return false;
    return !!el.closest('script,style,textarea,input,[contenteditable="true"],.user-content,.objective-user-text,.comment-user-text,.feedback-user-text,.agreement-user-text,.evidence-user-text');
  }

  function translateNode(node) {
    if (currentLanguage() !== 'en' || !node) return;
    if (node.nodeType === 3) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) return;
      const next = translateText(node.nodeValue || '');
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== 1 || shouldSkip(node)) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(translateNode);
    node.querySelectorAll('[placeholder],[title],[aria-label]').forEach((el) => {
      ['placeholder', 'title', 'aria-label'].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const old = el.getAttribute(attr) || '';
        const next = translateText(old);
        if (next !== old) el.setAttribute(attr, next);
      });
    });
  }

  function translateAll() {
    document.documentElement.lang = currentLanguage() === 'en' ? 'en' : 'es';
    // document.body en vez de solo #app-root: esto es lo que ahora SI
    // alcanza los avisos emergentes (showNotice), que se insertan fuera de
    // #app-root.
    translateNode(document.body);
  }

  // -------------------------------------------------------------------
  // Un unico MutationObserver sobre document.body. Reemplaza a los 4
  // observers independientes que corrian antes (uno por capa).
  // -------------------------------------------------------------------
  let scheduled = false;
  function scheduleTranslate() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      if (applyDomainDefaultOnce()) return;
      translateAll();
    }, 20);
  }

  function start() {
    if (applyDomainDefaultOnce()) return; // location.reload() en curso
    translateAll();
    new MutationObserver(scheduleTranslate).observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label']
    });
    document.addEventListener('click', (e) => {
      const el = e.target && e.target.closest ? e.target.closest('button,a,label,[role="button"]') : null;
      if (!el) return;
      const txt = (el.textContent || '').trim().toUpperCase();
      if (txt === 'EN') setLanguageManual('en');
      else if (txt === 'ES') setLanguageManual('es');
    }, true);
    global.addEventListener('hashchange', scheduleTranslate);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.EDDI18N = { languageFromEmail, translateText, translateAll, setLanguageManual };
})(window);
