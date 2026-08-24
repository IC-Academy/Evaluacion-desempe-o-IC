/**
 * app.js
 * ---------------------------------------------------------------------------
 * Interfaz y navegación de la demo EDD Inter-Con. Router por hash, tres
 * portales (Colaborador / Líder / Administrador) y componentes compartidos.
 *
 * Beta 3: la sesión (login por número de empleado + código temporal) ya NO
 * se maneja aquí — vive en auth.js (EDDAuth), sobre sessionStorage. Este
 * archivo solo consume EDDAuth.getSession()/getAppUser() para saber quién
 * es el usuario en turno, igual que ya consumía EDDStorage para los datos.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';
  const D = global.EDDData;
  const C = global.EDDCalc;
  const S = global.EDDStorage;
  const A = global.EDDAuth;



  // =========================================================================
  // IDIOMA ES / EN — traducción de interfaz sin alterar datos ni lógica.
  // Se guarda localmente para que el usuario conserve su preferencia.
  // =========================================================================
  const LANG_KEY = 'edd_language';
  let currentLang = localStorage.getItem(LANG_KEY) || 'es';

  const EN = {
    'Inicio':'Home','Autoevaluación':'Self-assessment','Retroalimentación':'Feedback',
    'Mi equipo':'My team','Pendientes por evaluar':'Pending evaluations','Dashboard':'Dashboard',
    'Calibración':'Calibration','Matriz 9-Box':'9-Box Matrix','Usuarios':'Users','Jerarquías':'Hierarchy',
    'Auditoría':'Audit','Configuración':'Settings','Cerrar sesión':'Sign out',
    'Plataforma corporativa':'Corporate platform','Bienvenido(a)':'Welcome','Verificación de identidad':'Identity verification',
    'Utiliza tu número de empleado para acceder a tu evaluación.':'Use your employee number to access your evaluation.',
    'Revisa tu correo corporativo y captura el código temporal de 6 dígitos.':'Check your corporate email and enter the 6-digit temporary code.',
    'Acceso protegido · Uso exclusivo de personal autorizado':'Protected access · Authorized personnel only',
    'Número de empleado':'Employee number','Ingresa tu número de empleado':'Enter your employee number',
    'Continuar':'Continue','Enviando…':'Sending…','Código temporal':'Temporary code',
    'Ingresar a la plataforma':'Enter platform','Validando…':'Validating…',
    'El código vence en':'The code expires in','minutos.':'minutes.','vencido':'expired',
    'Evaluación de Desempeño':'Performance Evaluation',
    'Duración estimada':'Estimated duration','¿Quién participa?':'Who participates?','Antes de comenzar':'Before you begin',
    'Confidencialidad':'Confidentiality','¿Cómo se integra?':'How is it structured?','Escala de evaluación':'Rating scale',
    'Comenzar mi evaluación':'Start my evaluation','Tu autoevaluación.':'Your self-assessment.',
    'La evaluación de tu líder.':'Your manager’s evaluation.','Retroalimentación para tu desarrollo.':'Feedback for your development.',
    'Valores y Actitud':'Values and Attitude','Habilidades':'Skills','Conocimientos':'Knowledge','Objetivos':'Objectives',
    'Cumplimiento de Objetivos':'Goal Achievement','Guardar progreso':'Save progress','Siguiente':'Next','Anterior':'Back',
    'Siguiente sección':'Next section','Finalizar y enviar ✓':'Finish and submit ✓','Progreso general':'Overall progress',
    'Progreso de la sección':'Section progress','Recordatorio':'Reminder','Puedes guardar tu progreso en cualquier momento.':'You can save your progress at any time.',
    'Tu evaluación es confidencial.':'Your evaluation is confidential.','Comentarios (opcional)':'Comments (optional)',
    'Resumen de tu evaluación':'Evaluation summary','Revisa tus resultados antes de finalizar.':'Review your results before finishing.',
    'Puntaje global':'Overall score','Nivel global':'Overall level','Interpretación de nivel':'Level interpretation',
    'Finalizar y enviar mi evaluación':'Finish and submit my evaluation','¡Evaluación enviada con éxito!':'Evaluation submitted successfully!',
    'Gracias por tu participación.':'Thank you for your participation.','Ir al inicio':'Go to home',
    'Tu autoevaluación ha sido enviada correctamente.':'Your self-assessment was submitted successfully.',
    'Tu líder recibirá una notificación para realizar su evaluación.':'Your manager will receive a notification to complete their evaluation.',
    'Pendientes de retroalimentación':'Pending feedback','Nombre':'Name','Puesto':'Position','Área':'Area',
    'Evaluación líder':'Manager evaluation','Comparación':'Comparison','Evaluar':'Evaluate','Ver':'View',
    'No tienes evaluaciones pendientes en este momento.':'You have no pending evaluations at this time.',
    'Guardar calibración':'Save calibration','Habilitar retroalimentación':'Enable feedback','Retroalimentación habilitada':'Feedback enabled',
    'Resultado calibrado':'Calibrated result','Autoevaluación':'Self-assessment','Percepción del colaborador':'Employee self-perception',
    'Resultado líder':'Manager result','Resultado final':'Final result','Justificación':'Justification',
    'Fortalezas':'Strengths','Áreas de oportunidad':'Development opportunities','Plan de desarrollo':'Development plan',
    'Competencia a desarrollar':'Competency to develop','Acción':'Action','Responsable':'Owner','Fecha compromiso':'Due date',
    'Objetivo específico':'Specific objective','Meta / indicador':'Target / indicator','Resultado obtenido':'Result achieved','Calificación':'Rating',
    'Validación SMART':'SMART validation','Específico':'Specific','Medible':'Measurable','Alcanzable':'Achievable','Relevante':'Relevant','Temporal':'Time-bound',
    'Completa los criterios pendientes antes de continuar.':'Complete the pending criteria before continuing.',
    '¿Qué es un objetivo SMART?':'What is a SMART objective?','Guía SMART':'SMART guide','Ejemplo':'Example',
    'Objetivo general:':'General objective:','Objetivo SMART:':'SMART objective:','¿Por qué es SMART?':'Why is it SMART?',
    'Quitar':'Remove','Agregar objetivo':'Add objective','Ver escala de evaluación':'View rating scale',
    'Excede significativamente las expectativas. Es un referente para otros.':'Significantly exceeds expectations. Serves as a role model for others.',
    'Supera las expectativas de manera constante.':'Consistently exceeds expectations.',
    'Cumple con lo esperado para su puesto.':'Meets expectations for the role.',
    'Cumple parcialmente; requiere mejorar.':'Partially meets expectations; improvement is required.',
    'No cumple con las expectativas del puesto.':'Does not meet the expectations of the role.',
    'No aplica o no cuento con elementos suficientes para evaluarlo.':'Not applicable or insufficient information to evaluate.',
    'Sobresaliente':'Outstanding','Excede las expectativas':'Exceeds expectations','Cumple las expectativas':'Meets expectations',
    'Cumple parcialmente; requiere plan de mejora':'Partially meets expectations; improvement plan required',
    'No cumple las expectativas del puesto':'Does not meet role expectations','Alto':'High','Medio':'Medium','Bajo':'Low',
    'Activo':'Active','Inactivo':'Inactive','Completada':'Completed','En progreso':'In progress','No iniciada':'Not started',
    'Pendiente de líder':'Pending manager','Pendiente de calibración':'Pending calibration','Calibrada':'Calibrated',
    'Retroalimentación pendiente':'Feedback pending','Cerrada':'Closed','Vencida':'Overdue',
    'Buscar':'Search','Limpiar filtros':'Clear filters','Todos':'All','Todas':'All','Estado':'Status','Periodo':'Period',
    'Guardar':'Save','Cancelar':'Cancel','Aceptar':'Accept','Cerrar':'Close','Sí':'Yes','No':'No'
  };

  Object.assign(EN, {"Inicia sesión": "Sign in", "Ingresa tu código de acceso": "Enter your access code", "Una experiencia simple, segura y confidencial para impulsar tu desarrollo dentro de Inter-Con.": "A simple, secure and confidential experience designed to support your growth at Inter-Con.", "Seguro": "Secure", "Tus datos están protegidos": "Your data is protected", "Confidencial": "Confidential", "Información de uso interno": "Internal-use information", "Desarrollo": "Growth", "Impulsamos tu crecimiento": "We support your growth", "Te enviaremos un código de verificación a tu correo corporativo.": "We will send a verification code to your corporate email.", "Accesos de demostración": "Demo access", "Colaborador": "Employee", "Líder": "Manager", "Administrador": "Administrator", "Tu sesión anterior expiró por inactividad. Inicia sesión de nuevo.": "Your previous session expired due to inactivity. Please sign in again.", "Demo funcional EDD Inter-Con — FOR-CAP-003 Rev. 4 · Datos simulados almacenados localmente en este navegador.": "Functional EDD Inter-Con demo — FOR-CAP-003 Rev. 4 · Simulated data stored locally in this browser.", "¡Bienvenida, Laura!": "Welcome, Laura!", "¡Bienvenido, Laura!": "Welcome, Laura!", "Esta evaluación nos ayuda a conocer tu desempeño, reconocer tus fortalezas e identificar oportunidades de desarrollo que impulsen tu crecimiento dentro de Inter-Con.": "This evaluation helps us understand your performance, recognize your strengths, and identify development opportunities that support your growth at Inter-Con.", "15 a 20 minutos": "15 to 20 minutes", "Procura realizar la evaluación en un solo momento y sin interrupciones.": "Try to complete the evaluation in one sitting and without interruptions.", "Responde con honestidad y objetividad.": "Answer honestly and objectively.", "Considera tu desempeño durante el periodo evaluado.": "Consider your performance throughout the evaluation period.", "Lee cuidadosamente cada pregunta.": "Read each question carefully.", "Tus respuestas serán tratadas de forma confidencial y se utilizarán exclusivamente para apoyar tu desarrollo y fortalecer nuestro proceso de gestión del desempeño.": "Your responses will be treated confidentially and used exclusively to support your development and strengthen our performance management process.", "Valores y Actitud 40% + Técnica Funcional 60%": "Values and Attitude 50% + Technical-functional Skills and Objectives 50%", "Tu opinión y compromiso contribuyen a construir un mejor Inter-Con.": "Your feedback and commitment help build a better Inter-Con.", "Tu evaluación ya fue enviada": "Your evaluation has already been submitted", "Gracias por tu participación, Laura.": "Thank you for your participation, Laura.", "Tu autoevaluación ha sido registrada correctamente.": "Your self-assessment has been recorded successfully.", "Tu líder recibirá la notificación correspondiente para continuar con el proceso.": "Your manager will receive the appropriate notification to continue the process.", "Tu compromiso impulsa tu desarrollo y el éxito de Inter-Con.": "Your commitment supports your growth and Inter-Con’s success.", "Personal a evaluar": "Employees to evaluate", "Universo del periodo": "Employees in this cycle", "Autoevaluaciones": "Self-assessments", "completadas": "completed", "Evaluaciones líder": "Manager evaluations", "Por calibrar": "Pending calibration", "Requieren revisión DO": "Require HR review", "Calibradas": "Calibrated", "Con resultado DO": "With HR result", "Promedio general": "Overall average", "Resultado disponible": "Result available", "Avance del ciclo": "Cycle progress", "evaluaciones cerradas": "evaluations closed", "PANEL RH": "HR PANEL", "Seguimiento nacional, calibración, cierre y distribución de talento en un solo lugar.": "National tracking, calibration, closure, and talent distribution in one place.", "COBERTURA": "COVERAGE", "Avance por área": "Progress by area", "Cierre del proceso": "Process close", "RESULTADOS": "RESULTS", "Niveles de desempeño": "Performance levels", "TALENTO": "TALENT", "Distribución 9-Box": "9-Box distribution", "Abrir matriz": "Open matrix", "OPERACIÓN RH": "HR OPERATIONS", "Seguimiento de evaluaciones": "Evaluation tracking", "Todas las áreas": "All areas", "Todos los estados": "All statuses", "Todos los cuadrantes": "All quadrants", "Limpiar": "Clear", "COLABORADOR": "EMPLOYEE", "AREA": "AREA", "LÍDER": "MANAGER", "STATUS": "STATUS", "PUNTAJE": "SCORE", "9-BOX": "9-BOX", "Recursos Humanos": "Human Resources", "Finanzas": "Finance", "Operaciones": "Operations", "Tecnología": "Technology", "Comercial": "Commercial", "Analista de Recursos Humanos": "Human Resources Analyst", "Gerente de Recursos Humanos": "Human Resources Manager", "Coordinador de Nómina": "Payroll Coordinator", "Pendiente líder": "Pending manager", "Pendiente manager": "Pending manager", "Cerrada": "Closed", "Cuadrante": "Quadrant", "A. Valores y Actitud": "A. Values and Attitude", "B. Habilidades": "B. Skills", "C. Conocimientos": "C. Knowledge", "D. Cumplimiento de Objetivos": "D. Goal Achievement", "ACTITUD": "ATTITUDE", "DESEMPEÑO": "PERFORMANCE", "Evalúa la vivencia diaria de los valores ESPÍRITU de Inter-Con. Esta sección determina la posición del colaborador en el eje vertical (Actitud) de la matriz 9-box.": "Evaluates how consistently Inter-Con’s ESPÍRITU values are demonstrated in daily work. This section determines the employee’s position on the vertical Attitude axis of the 9-box matrix.", "Evalúa las capacidades funcionales para ejecutar el puesto con eficiencia.": "Evaluates the functional capabilities required to perform the role efficiently.", "Evalúa el dominio técnico del puesto y de los procesos/herramientas del área.": "Evaluates technical mastery of the role and the area’s processes and tools.", "Se evalúa de forma independiente al bloque de competencias. Registra hasta cinco objetivos acordados al inicio del periodo, su meta o indicador, resultado alcanzado y calificación.": "Evaluated independently from the competency block. Enter up to five objectives agreed at the start of the period, including target or indicator, achieved result, and rating.", "Compromiso Organizacional (Integridad y Excelencia)": "Organizational Commitment (Integrity and Excellence)", "Actitud de Servicio (Pasión y Respeto)": "Service Mindset (Passion and Respect)", "Trabajo en Equipo y Unión": "Teamwork and Unity", "Innovación y Creatividad (Capacidad de Cambio y Flexibilidad)": "Innovation and Creativity (Change Agility and Flexibility)", "Compromiso con la Sustentabilidad": "Commitment to Sustainability", "Orientación a Resultados": "Results Orientation", "Planeación y Organización": "Planning and Organization", "Comunicación Efectiva": "Effective Communication", "Seguimiento y Control": "Follow-up and Control", "Desarrollo de Personas (Liderazgo)": "People Development (Leadership)", "Dominio del Puesto": "Role Mastery", "Procesos y Herramientas de Trabajo": "Work Processes and Tools", "Actúa conforme a los valores ESPÍRITU de Inter-Con.": "Acts in accordance with Inter-Con’s ESPÍRITU values.", "Muestra responsabilidad y ética profesional.": "Demonstrates responsibility and professional ethics.", "Se involucra activamente en los objetivos de la empresa.": "Actively contributes to company objectives.", "Atiende oportunamente las solicitudes de clientes internos y externos.": "Responds promptly to internal and external customer requests.", "Demuestra disposición y pasión para apoyar a otros.": "Shows willingness and passion for supporting others.", "Actúa con profesionalismo, respeto y empatía.": "Acts with professionalism, respect, and empathy.", "Colabora con otras áreas para lograr objetivos comunes.": "Collaborates across areas to achieve shared objectives.", "Mantiene relaciones laborales basadas en el respeto.": "Maintains respectful working relationships.", "Contribuye a resolver diferencias de manera constructiva.": "Helps resolve differences constructively.", "Se adapta positivamente a cambios y nuevas prioridades.": "Adapts positively to change and new priorities.", "Propone ideas para mejorar procesos.": "Proposes ideas to improve processes.", "Implementa soluciones innovadoras cuando es necesario.": "Implements innovative solutions when needed.", "Hace uso responsable de los recursos materiales y energéticos a su cargo.": "Uses assigned material and energy resources responsibly.", "Promueve prácticas de cuidado ambiental y ahorro de recursos en su área de trabajo.": "Promotes environmental care and resource-saving practices in the workplace.", "Cumple consistentemente los objetivos establecidos.": "Consistently meets established objectives.", "Mantiene altos estándares de calidad en su trabajo.": "Maintains high quality standards in their work.", "Propone acciones para mejorar la productividad y eficiencia.": "Proposes actions to improve productivity and efficiency.", "Organiza adecuadamente sus actividades y prioridades.": "Organizes activities and priorities effectively.", "Cumple los plazos establecidos.": "Meets established deadlines.", "Anticipa riesgos y establece acciones preventivas.": "Anticipates risks and establishes preventive actions.", "Se comunica de forma clara, respetuosa y oportuna.": "Communicates clearly, respectfully, and promptly.", "Escucha activamente y considera diferentes puntos de vista.": "Listens actively and considers different points of view.", "Comparte información relevante para facilitar el trabajo.": "Shares relevant information to facilitate work.", "Da seguimiento oportuno a sus actividades.": "Follows up on activities in a timely manner.", "Cumple políticas y procedimientos internos.": "Complies with internal policies and procedures.", "Administra adecuadamente los recursos asignados.": "Manages assigned resources appropriately.", "Comparte conocimientos con sus compañeros.": "Shares knowledge with colleagues.", "Brinda apoyo cuando otros lo requieren.": "Provides support when others need it.", "Favorece un ambiente de aprendizaje y colaboración.": "Fosters a learning and collaborative environment.", "Aplica correctamente los conocimientos de su puesto.": "Correctly applies role-specific knowledge.", "Resuelve problemas relacionados con sus funciones.": "Solves problems related to their responsibilities.", "Mantiene actualizados sus conocimientos.": "Keeps their knowledge up to date.", "Conoce y aplica correctamente los procesos, políticas y procedimientos de su área.": "Understands and correctly applies the area’s processes, policies, and procedures.", "Utiliza adecuadamente las herramientas y sistemas de automatización disponibles para su puesto.": "Uses the tools and automation systems available for the role appropriately.", "Actas administrativas": "Administrative actions", "Indicador / referencia NOM-035": "NOM-035 indicator / reference", "Sin dato": "No data", "Estos datos se consideran como contexto para la revisión de DO y no modifican automáticamente la calificación.": "These data are contextual. In this demo they do not automatically reduce the score.", "Observaciones de RH": "HR observations", "Registra hechos, contexto o acuerdos relevantes...": "Record relevant facts, context, or agreements...", "DECISIÓN": "DECISION", "Ajuste de calibración": "Calibration adjustment", "Ajuste en puntos": "Point adjustment", "Justificación obligatoria cuando exista ajuste": "Justification required when an adjustment exists", "Explica la razón del ajuste y la evidencia utilizada...": "Explain the reason for the adjustment and the evidence used...", "Trazabilidad de cambios": "Change history", "movimientos": "changes", "Campo": "Field", "Anterior": "Previous", "Nuevo": "New", "Motivo": "Reason", "Usuario": "User", "Fecha": "Date", "Hora": "Time", "Sin cambios registrados.": "No changes recorded."});

  Object.assign(EN, {
    'Sección':'Section','Evaluación del líder':'Manager evaluation','Líder':'Manager','Calibrado':'Calibrated','Calibrado*':'Calibrated*',
    'Puntaje de desempeño':'Performance score','Potencial preliminar':'Preliminary potential','Quitar selección individual':'Clear individual selection',
    'Haz clic en un cuadrante para ver su significado y acción sugerida, o en el marcador de un colaborador para ver su detalle individual.':'Click a quadrant to view its meaning and suggested action, or click an employee marker to view individual details.',
    'Colaboradores en este cuadrante':'Employees in this quadrant','Sin colaboradores.':'No employees.','Ubicación 9-Box':'9-Box placement',
    'Criterio oficial Rev4 para ambos ejes: Bajo <60, Medio / esperado 60–79, Alto 80–100 (base 100).':'Official Rev4 criteria for both axes: Low <60, Medium / expected 60–79, High 80–100 (base 100).',
    'Auditoría':'Audit','Valor anterior':'Previous value','Valor nuevo':'New value','Configuración':'Settings','Umbrales de brecha (comparación auto vs. líder)':'Gap thresholds (self-assessment vs. manager)',
    'Reinicio de datos':'Data reset','Restaura todos los datos de la demo a su estado inicial (usuarios, evaluaciones, calibraciones, auditoría). Esta acción no se puede deshacer.':'Restores all demo data to its initial state (users, evaluations, calibrations, audit). This action cannot be undone.',
    'Reiniciar datos de la demo':'Reset demo data','Captura tu número de empleado.':'Enter your employee number.','Confirma que la información es correcta antes de enviar.':'Confirm that the information is correct before submitting.',
    'Registra al menos un objetivo antes de enviar.':'Enter at least one objective before submitting.','Confirma que la evaluación está completa antes de enviar.':'Confirm that the evaluation is complete before submitting.',
    'La justificación es obligatoria cuando existe un ajuste distinto de 0.':'Justification is required when there is a non-zero adjustment.','Calibración guardada.':'Calibration saved.',
    'Guarda la calibración antes de habilitar la retroalimentación.':'Save the calibration before enabling feedback.','El resultado es menor a 80. Registra al menos un plan de desarrollo antes de habilitar la retroalimentación.':'The result is below 80. Add at least one development plan before enabling feedback.',
    'Retroalimentación habilitada para el colaborador.':'Feedback enabled for the employee.','Error de conexión. Verifica tu internet e intenta de nuevo.':'Connection error. Check your internet connection and try again.',
    'La solicitud tardó demasiado. Intenta de nuevo.':'The request took too long. Try again.','El código venció. Solicita uno nuevo.':'The code expired. Request a new one.','Código inválido. Verifica los 6 dígitos e intenta de nuevo.':'Invalid code. Check the 6 digits and try again.',
    'Verifica los datos capturados.':'Check the information entered.','Tu sesión expiró. Inicia sesión nuevamente.':'Your session expired. Please sign in again.','Ocurrió un error inesperado. Intenta de nuevo.':'An unexpected error occurred. Try again.',
    'No puedes continuar. Tienes':'You cannot continue. You have','campo pendiente':'pending field','campos pendientes':'pending fields','Revisa lo marcado en rojo.':'Review the fields marked in red.',
    'Semilla':'Seed','Cosecha':'Harvest','Sembrando':'Sowing','Sol':'Sun','Corazón':'Heart','En Maceta':'Potted','Agua':'Water'
  });


  // Cobertura EN ampliada: textos compuestos, pantallas de líder/RH y etiquetas
  // que antes quedaban en español al renderizarse dinámicamente.
  Object.assign(EN, {
    'Escala de evaluación':'Rating scale',
    'Excede significativamente las expectativas.':'Significantly exceeds expectations.',
    'Supera las expectativas de manera constante.':'Consistently exceeds expectations.',
    'Cumple con lo esperado para su puesto.':'Meets expectations for the role.',
    'Cumple parcialmente; requiere mejorar.':'Partially meets expectations; improvement is required.',
    'No cumple con las expectativas del puesto.':'Does not meet role expectations.',
    'EJEMPLO':'EXAMPLE','General objective:':'General objective:','SMART objective:':'SMART objective:',
    'Quiero mejorar la capacitación de los colaboradores.':'I want to improve employee training.',
    'Incrementar del 75% al 90% el porcentaje de colaboradores que concluyen satisfactoriamente la capacitación de inducción, durante los próximos 3 meses, mediante seguimiento semanal, recordatorios y evaluación de conocimientos al finalizar el curso.':'Increase from 75% to 90% the percentage of employees who successfully complete induction training over the next 3 months, through weekly follow-up, reminders, and a knowledge assessment at the end of the course.',
    'S – Específico: Mejorar la conclusión satisfactoria de la capacitación.':'S – Specific: Improve successful completion of training.',
    'M – Medible: Pasar del 75% al 90%.':'M – Measurable: Increase from 75% to 90%.',
    'A – Alcanzable: Se establecen acciones concretas de seguimiento.':'A – Achievable: Concrete follow-up actions are established.',
    'R – Relevante: Fortalece la preparación de los colaboradores.':'R – Relevant: Strengthens employee preparedness.',
    'T – Temporal: Se debe lograr en 3 meses.':'T – Time-bound: It must be achieved within 3 months.',
    'CUMPLIMIENTO DE OBJETIVOS · 25% DEL TOTAL':'GOAL ACHIEVEMENT · 25% OF TOTAL',
    'Captura tus objetivos del periodo':'Enter your goals for the period',
    'Registra hasta cinco objetivos. Completa la meta, fecha y criterios SMART; solo se promedian los objetivos con descripción y calificación válida.':'Enter up to five goals. Complete the target, due date, and SMART criteria; only goals with a valid description and rating are averaged.',
    'criterios':'criteria','criterio':'criterion','Completa los criterios pendientes antes de continuar.':'Complete the pending criteria before continuing.',
    'Es alcanzable con los recursos y responsabilidades disponibles.':'It is achievable with the available resources and responsibilities.',
    'Está relacionado con las responsabilidades del puesto o prioridades del área.':'It is related to the role responsibilities or area priorities.',
    'Resultado obtenido':'Result achieved','Calificación':'Rating','Quitar':'Remove',
    'Confirmo que la información capturada es correcta.':'I confirm that the information entered is correct.',
    'Confirma que la información es correcta antes de enviar.':'Confirm that the information is correct before submitting.',
    'Evaluación de':'Evaluation of','N.º DE EMPLEADO':'EMPLOYEE NO.','N° DE EMPLEADO':'EMPLOYEE NO.','N.º de empleado':'Employee no.',
    'PUESTO':'POSITION','ÁREA':'AREA','DIRECCIÓN':'DEPARTMENT','CIUDAD OPERATIVA':'OPERATING CITY','ANTIGÜEDAD':'TENURE','PERIODO':'PERIOD',
    'Jefe directo':'Direct manager','MANAGER DIRECTO':'DIRECT MANAGER','Líder directo':'Direct manager','Antigüedad':'Tenure',
    'La autoevaluación del colaborador permanecerá oculta hasta que envíes tu evaluación.':'The employee self-assessment will remain hidden until you submit your evaluation.',
    'REVISIÓN FINAL':'FINAL REVIEW','Resumen y envío':'Summary and submission',
    'Registra retroalimentación cualitativa. Estos campos se mostrarán al colaborador cuando RH habilite la fase de retroalimentación.':'Enter qualitative feedback. These fields will be shown to the employee when HR enables the feedback phase.',
    'Fortalezas del colaborador':'Employee strengths','Comentarios generales':'General comments','Oportunidades de desarrollo':'Development opportunities','Brechas a atender':'Gaps to address','Riesgos o factores de atención':'Risks or attention factors','Síntesis del líder':'Leader summary',
    'Áreas de oportunidad y plan de mejora':'Development opportunities and improvement plan',
    'Sin áreas registradas todavía.':'No development opportunities added yet.','+ Agregar área de oportunidad':'+ Add development opportunity',
    'Sin acciones registradas todavía.':'No development actions added yet.','+ Agregar acción de desarrollo':'+ Add development action',
    'Confirmo que la evaluación está completa.':'I confirm that the evaluation is complete.','Enviar evaluación ✓':'Submit evaluation ✓',
    'Diferencias detalladas por competencia':'Detailed differences by competency','COMPETENCIA':'COMPETENCY','AUTOEVALUACIÓN':'SELF-ASSESSMENT',
    'EVALUACIÓN LÍDER':'MANAGER EVALUATION','DIFERENCIA':'DIFFERENCE','BRECHA':'GAP','COMENTARIO LÍDER':'MANAGER COMMENT','COMENTARIO COLABORADOR':'EMPLOYEE COMMENT',
    'Brecha significativa':'Significant gap','Alineada':'Aligned','Revisar':'Review','En revisión':'Under review',
    'D. Cumplimiento de Objetivos (promedio)':'D. Goal Achievement (average)',
    'Ubicación en la 9-Box Matrix':'9-Box Matrix placement','Desempeño':'Performance','Actitud':'Attitude',
    'Cumple a satisfacción tanto en actitud como en desempeño.':'Meets expectations in both attitude and performance.',
    'Prioridad: Alta':'Priority: High','Prioridad: Media':'Priority: Medium','Prioridad: Baja':'Priority: Low',
    'Acción sugerida:':'Suggested action:','Seguimiento:':'Follow-up:','Promoción inmediata':'Immediate promotion',
    'estrella de Inter-Con, lista para promoción inmediata.':'Inter-Con star, ready for immediate promotion.',
    'Status actual del proceso:':'Current process status:','La calibración y liberación de retroalimentación las gestiona el administrador de RH.':'Calibration and feedback release are managed by the HR administrator.',
    'Pendiente calibración':'Pending calibration','Pendiente líder':'Pending manager','Pendiente manager':'Pending manager',
    'HR OPERATIONS':'HR OPERATIONS','Evaluation tracking':'Evaluation tracking','registros':'records','PUNTAJE':'SCORE','Puntaje':'Score','Revisar':'Review',
    'Todos los estados':'All statuses','Todos los cuadrantes':'All quadrants','Todas las áreas':'All areas','Limpiar':'Clear',
    'Resultados por sección':'Results by section','Puntaje final sobre 100':'Final score out of 100','promedio':'average','pts':'pts',
    'Radar comparativo':'Comparison radar','AUTOEVAL.':'SELF-ASSESS.','LÍDER':'MANAGER','CALIBRADO*':'CALIBRATED*',
    'La serie "Calibrado" es una proyección proporcional de la forma de la evaluación del líder (factor 1.00×), porque la calibración de RH ajusta el resultado global y no cada competencia.':'The “Calibrated” series is a proportional projection of the manager evaluation shape (factor 1.00×), because HR calibration adjusts the overall result rather than each competency.',
    '9-Box Matrix (tu ubicación)':'9-Box Matrix (your placement)','tu ubicación':'your placement','Medio / esperado':'Medium / expected',
    'Desempeño (esc. 1-5)':'Performance (scale 1-5)','Potencial preliminar (esc. 1-5)':'Preliminary potential (scale 1-5)',
    'Evaluación de Desempeño':'Performance Evaluation','Seguimiento nacional, calibración, cierre y distribución de talento en un solo lugar.':'National tracking, calibration, closure, and talent distribution in one place.',
    'Personal a evaluar':'Employees to evaluate','Autoevaluaciones':'Self-assessments','Evaluaciones líder':'Manager evaluations','Por calibrar':'Pending calibration','Calibradas':'Calibrated','Promedio general':'Overall average',
    'Avance del ciclo':'Cycle progress','evaluaciones cerradas':'evaluations closed','Universo del periodo':'Period population','completadas':'completed','Requieren revisión DO':'Require HR review','Con resultado DO':'With HR result','Resultado disponible':'Result available',
    'COBERTURA':'COVERAGE','Avance por área':'Progress by area','Cierre del proceso':'Process closure','colaboradores':'employees',
    'RESULTADOS':'RESULTS','Niveles de desempeño':'Performance levels','TALENTO':'TALENT','Distribución 9-Box':'9-Box distribution','Abrir matriz →':'Open matrix →',
    'OPERACIÓN RH':'HR OPERATIONS','Seguimiento de evaluaciones':'Evaluation tracking','PRIORIDAD':'PRIORITY','Áreas con mayor rezago':'Areas with greatest delay','ALERTAS':'ALERTS','Atención requerida':'Attention required',
    'autoevaluaciones vencidas':'overdue self-assessments','evaluaciones esperando calibración':'evaluations awaiting calibration',
    'CALIBRACIÓN RH':'HR CALIBRATION','Revisión y calibración':'Review and calibration','Contrasta autoevaluación, evaluación del líder y contexto del colaborador antes de liberar resultados.':'Compare the self-assessment, manager evaluation, and employee context before releasing results.',
    'EXPEDIENTE DE CALIBRACIÓN':'CALIBRATION FILE','Resultado actual':'Current result','Resultado base de calibración':'Calibration baseline','Brecha auto vs líder':'Self vs manager gap','Guardado por RH':'Saved by HR','Sin ajuste aún':'No adjustment yet',
    'COMPARATIVO':'COMPARISON','Radar de evaluación':'Evaluation radar','Ubicación 9-Box':'9-Box placement','CONTEXTO':'CONTEXT','Alertas para RH':'HR alerts',
    'DECISIÓN':'DECISION','Ajuste de calibración':'Calibration adjustment','Ajuste en puntos':'Point adjustment','Justificación obligatoria cuando exista ajuste':'Justification required when an adjustment is made',
    'AUDITORÍA':'AUDIT','Trazabilidad de cambios':'Change history','movimientos':'changes',
    'Alineada hasta':'Aligned up to','Guardar umbrales':'Save thresholds','Reinicio de datos':'Data reset','Reiniciar datos de la demo':'Reset demo data',
    'Carga al menos una evidencia antes de aceptar el resultado.':'Upload at least one piece of evidence before accepting the result.',
    'Verifica que "Alineada" sea menor que "Revisar".':'Make sure “Aligned” is lower than “Review”.','Umbrales actualizados.':'Thresholds updated.',
    '¿Reiniciar todos los datos de la demo? Esta acción no se puede deshacer.':'Reset all demo data? This action cannot be undone.',
    'No puedes enviar. Tienes':'You cannot submit. You have','pendientes; revisa lo marcado en rojo.':'pending fields; review those marked in red.'
  });

  // EN completeness patch — audited against employee, manager and HR screens.
  Object.assign(EN, {
    "Cronograma de seguimiento (6 semanas)": "Follow-up schedule (6 weeks)",
    "Aún no se genera cronograma.": "No follow-up schedule has been generated yet.",
    "Comentarios del líder": "Manager comments",
    "Evidencias": "Evidence",
    "Sin evidencias cargadas.": "No evidence uploaded.",
    "Simular carga de evidencia": "Simulate evidence upload",
    "Aceptar resultado": "Accept result",
    "Carga al menos una evidencia antes de aceptar": "Upload at least one piece of evidence before accepting the result.",
    "Evaluación de": "Evaluation of",
    "N.º DE EMPLEADO": "EMPLOYEE NO.",
    "N.° DE EMPLEADO": "EMPLOYEE NO.",
    "ÁREA": "AREA",
    "DIRECCIÓN": "BUSINESS UNIT",
    "CIUDAD OPERATIVA": "OPERATING CITY",
    "ANTIGÜEDAD": "TENURE",
    "PERIODO": "PERIOD",
    "MANAGER DIRECTO": "DIRECT MANAGER",
    "LÍDER DIRECTO": "DIRECT MANAGER",
    "La autoevaluación del colaborador permanecerá oculta hasta que envíes tu evaluación.": "The employee’s self-assessment will remain hidden until you submit your evaluation.",
    "Revisión final": "Final review",
    "REVISIÓN FINAL": "FINAL REVIEW",
    "Resumen y envío": "Summary and submission",
    "Registra retroalimentación cualitativa. Estos campos se mostrarán al colaborador cuando RH habilite la fase de retroalimentación.": "Enter qualitative feedback. These fields will be shown to the employee when HR enables the feedback phase.",
    "Fortalezas del colaborador": "Employee strengths",
    "Strengths del colaborador": "Employee strengths",
    "Comentarios generales": "General comments",
    "Áreas de oportunidad y plan de mejora": "Development opportunities and improvement plan",
    "Development opportunities y plan de mejora": "Development opportunities and improvement plan",
    "Sin áreas registradas todavía.": "No development opportunities added yet.",
    "+ Agregar área de oportunidad": "+ Add development opportunity",
    "Plan de desarrollo": "Development plan",
    "Sin acciones registradas todavía.": "No development actions added yet.",
    "Sin acciones de desarrollo registradas.": "No development actions added.",
    "+ Agregar acción de desarrollo": "+ Add development action",
    "Confirmo que la evaluación está completa.": "I confirm that the evaluation is complete.",
    "Enviar evaluación ✓": "Submit evaluation ✓",
    "Diferencias detalladas por competencia": "Detailed differences by competency",
    "AUTOEVALUACIÓN": "SELF-ASSESSMENT",
    "EVALUACIÓN LÍDER": "MANAGER EVALUATION",
    "DIFERENCIA": "DIFFERENCE",
    "BRECHA": "GAP",
    "COMENTARIO LÍDER": "MANAGER COMMENT",
    "COMENTARIO COLABORADOR": "EMPLOYEE COMMENT",
    "Brecha significativa": "Significant gap",
    "Alineada": "Aligned",
    "Ubicación en la 9-Box Matrix": "9-Box Matrix placement",
    "Ubicación en la 9-Box": "9-Box placement",
    "Desempeño": "Performance",
    "Actitud": "Attitude",
    "Cumple a satisfacción tanto en actitud como en desempeño.": "Meets expectations in both attitude and performance.",
    "Acción sugerida:": "Suggested action:",
    "Action sugerida:": "Suggested action:",
    "Seguimiento:": "Follow-up:",
    "Status actual del proceso:": "Current process status:",
    "Estado actual del proceso:": "Current process status:",
    "La calibración y liberación de retroalimentación las gestiona el administrador de RH.": "Calibration and feedback release are managed by the HR administrator.",
    "Resultados por sección": "Results by section",
    "Radar comparativo": "Comparison radar",
    "promedio": "average",
    "Promedio": "Average",
    "Puntaje final sobre 100": "Final score out of 100",
    "Medio / esperado": "Medium / expected",
    "Preliminar potencial (esc. 1-5)": "Preliminary potential (scale 1-5)",
    "Potencial preliminar (esc. 1-5)": "Preliminary potential (scale 1-5)",
    "Puntaje de desempeño": "Performance score",
    "Resultado final": "Final result",
    "Puntaje": "Score",
    "PUNTAJE": "SCORE",
    "registros": "records",
    "Revisar": "Review",
    "Calibrar": "Calibrate",
    "Todas las áreas": "All areas",
    "Todos los roles": "All roles",
    "Todos los estatus": "All statuses",
    "Todos los estados": "All statuses",
    "Todos los cuadrantes": "All quadrants",
    "Todos los periodos": "All periods",
    "Con/sin líder (todos)": "With/without manager (all)",
    "Con líder": "With manager",
    "Sin líder": "Without manager",
    "Con/sin correo (todos)": "With/without email (all)",
    "Con correo": "With email",
    "Sin correo": "Without email",
    "Sin líder asignado": "No manager assigned",
    "Con líder asignado": "Manager assigned",
    "Sin resultados para los filtros aplicados.": "No results for the selected filters.",
    "Por revisar": "To review",
    "Resultado": "Result",
    "Líder:": "Manager:",
    "Antigüedad:": "Tenure:",
    "Guardado por RH": "Saved by HR",
    "Sin ajuste aún": "No adjustment yet",
    "Estos datos se consideran como contexto para la revisión de RH y no modifican automáticamente la calificación.": "These data are contextual. In this demo they do not automatically reduce the rating.",
    "Observaciones de RH": "HR observations",
    "Ajuste en puntos": "Point adjustment",
    "Justificación obligatoria cuando exista ajuste": "Justification required when an adjustment is made",
    "Explica la razón del ajuste y la evidencia utilizada...": "Explain the reason for the adjustment and the evidence used...",
    "Si el resultado calibrado es menor a 80, se requerirá al menos un plan de desarrollo antes de liberar la retroalimentación.": "If the calibrated result is below 80, at least one development plan is required before feedback can be released.",
    "Sin cambios registrados.": "No changes recorded.",
    "Haz clic en un cuadrante para ver su significado y acción sugerida, o en el marcador de un colaborador para ver su detalle individual.": "Click a quadrant to see its meaning and suggested action, or click an employee marker to view individual details.",
    "Quitar selección individual": "Clear individual selection",
    "Sin colaboradores.": "No employees.",
    "Umbrales de brecha (comparación auto vs. líder)": "Gap thresholds (self vs. manager comparison)",
    "Alineada hasta": "Aligned up to",
    "Revisar hasta": "Review up to",
    "Reinicio de datos": "Data reset",
    "Restaura todos los datos de la demo a su estado inicial (usuarios, evaluaciones, calibraciones, auditoría). Esta acción no se puede deshacer.": "Restores all demo data to its initial state (users, evaluations, calibrations, audit). This action cannot be undone.",
    "Progreso de evaluación": "Evaluation progress",
    "Evaluación del líder": "Manager evaluation",
    "Guarda tu avance y verifica cada sección antes de enviar. La autoevaluación se mostrará después del envío.": "Save your progress and review each section before submitting. The self-assessment will be shown after submission.",
    "El colaborador no registró objetivos en este periodo.": "The employee did not enter goals for this period.",
    "Objetivo:": "Goal:",
    "Resultado:": "Result:",
    "Selecciona una calificación para continuar.": "Select a rating to continue.",
    "Área de oportunidad": "Development opportunity",
    "Plan de mejora": "Improvement plan",
    "Comparación —": "Comparison —",
    "Puntaje autoevaluación": "Self-assessment score",
    "Puntaje evaluación líder": "Manager evaluation score",
    "Sin datos": "No data",
    "Evaluaciones pendientes (líder)": "Pending manager evaluations",
    "Avance del equipo": "Team progress",
    "Alertas por vencimiento": "Deadline alerts",
    "Este colaborador no pertenece a tu equipo directo. Solo puedes evaluar a las personas cuyo líder registrado seas tú.": "This employee is not on your direct team. You can only evaluate employees for whom you are the registered manager.",
    "Este colaborador no pertenece a tu equipo directo. Solo puedes consultar la comparación de las personas cuyo líder registrado seas tú.": "This employee is not on your direct team. You can only view comparisons for employees for whom you are the registered manager.",
    "El colaborador aún no completa su autoevaluación. No es posible iniciar la evaluación del líder todavía.": "The employee has not completed the self-assessment yet. The manager evaluation cannot be started yet.",
    "Confirma que la información es correcta antes de enviar.": "Confirm that the information is correct before submitting.",
    "Confirmo que la información capturada es correcta.": "I confirm that the entered information is correct.",
    "Registra al menos un objetivo antes de enviar.": "Enter at least one goal before submitting.",
    "Confirma que la evaluación está completa antes de enviar.": "Confirm that the evaluation is complete before submitting.",
    "Área de oportunidad:": "Development opportunity:",
    "Plan de mejora:": "Improvement plan:",
    "Nombre del archivo a cargar (simulado), ej. retroalimentacion_firmada.pdf:": "File name to upload (simulated), e.g. signed_feedback.pdf:",
    "Tipo (PDF firmado / Imagen / Documento de retroalimentación):": "Type (Signed PDF / Image / Feedback document):",
    "PDF firmado": "Signed PDF",
    "Documento de retroalimentación": "Feedback document",
    "La justificación es obligatoria cuando existe un ajuste distinto de 0.": "Justification is required when the adjustment is not 0.",
    "Calibración de RH": "HR calibration",
    "Calibración guardada.": "Calibration saved.",
    "Guarda la calibración antes de habilitar la retroalimentación.": "Save the calibration before enabling feedback.",
    "El resultado es menor a 80. Registra al menos un plan de desarrollo antes de habilitar la retroalimentación.": "The result is below 80. Add at least one development plan before enabling feedback.",
    "Retroalimentación habilitada para el colaborador.": "Feedback enabled for the employee.",
    "Se envió un nuevo código.": "A new code was sent.",
    "Captura tu número de empleado.": "Enter your employee number.",
    "Error al solicitar código": "Error requesting code",
    "Error al validar código": "Error validating code",
    "Error en acceso rápido": "Quick-access error",
    "Inicio de sesión": "Sign-in",
    "Conexión segura mediante API corporativa.": "Secure connection through the corporate API.",
    "Código de demostración:": "Demo code:",
    "Reenviar código": "Resend code",
    "Cambiar empleado": "Change employee",
    "Periodo activo": "Active period",
    "Líder directo": "Direct manager",
    "Fecha límite autoevaluación": "Self-assessment deadline",
    "Ver retroalimentación": "View feedback",
    "Tu autoevaluación fue enviada. El proceso continúa con la evaluación de tu líder y la calibración de RH.": "Your self-assessment was submitted. The process continues with your manager’s evaluation and HR calibration.",
    "Hola,": "Hello,",
    "Sección": "Section",
    "de 4": "of 4",
    "Eje DESEMPEÑO": "PERFORMANCE axis",
    "Sin calificar": "Not rated",
    "Comentario (opcional)": "Comment (optional)",
    "Sin responder": "Not answered",
    "✓ Este objetivo cumple con los criterios SMART.": "✓ This goal meets the SMART criteria.",
    "Guía para redactar objetivos SMART": "Guide to writing SMART goals",
    "Quitar objetivo": "Remove goal",
    "Ej. Incrementar la cobertura...": "E.g. Increase coverage...",
    "Captura tus objetivos del periodo": "Enter your goals for the period",
    "Registra hasta cinco objetivos. Completa la meta, fecha y criterios SMART; solo se promedian los objetivos con descripción y calificación válida.": "Enter up to five goals. Complete the target, due date, and SMART criteria; only goals with a description and valid rating are averaged.",
    "CUMPLIMIENTO DE OBJETIVOS": "GOAL ACHIEVEMENT",
    "DEL TOTAL": "OF TOTAL",
    "Es alcanzable con los recursos y responsabilidades disponibles.": "It is achievable with the available resources and responsibilities.",
    "Está relacionado con las responsabilidades del puesto o prioridades del área.": "It is related to the role responsibilities or area priorities.",
    "General objective:": "General objective:",
    "SMART objective:": "SMART objective:",
    "S — Específico:": "S — Specific:",
    "M — Medible:": "M — Measurable:",
    "A — Alcanzable:": "A — Achievable:",
    "R — Relevante:": "R — Relevant:",
    "T — Temporal:": "T — Time-bound:",
    "Mejorar la conclusión satisfactoria de la capacitación.": "Improve successful completion of training.",
    "Pasar del 75% al 90%.": "Increase from 75% to 90%.",
    "Se establecen acciones concretas de seguimiento.": "Concrete follow-up actions are established.",
    "Fortalece la preparación de los colaboradores.": "Strengthens employee readiness.",
    "Se debe lograr en 3 meses.": "It must be achieved within 3 months.",
    "Quiero mejorar la capacitación de los colaboradores.": "I want to improve employee training.",
    "Incrementar del 75% al 90% el porcentaje de colaboradores que concluyen satisfactoriamente la capacitación de inducción, durante los próximos 3 meses, mediante seguimiento semanal, recordatorios y evaluación de conocimientos al finalizar el curso.": "Increase from 75% to 90% the percentage of employees who successfully complete induction training over the next 3 months through weekly follow-up, reminders, and a knowledge assessment at the end of the course.",
    "Ciudad de México": "Mexico City",
    "Recursos Humanos": "Human Resources",
    "Finanzas": "Finance",
    "Operaciones": "Operations",
    "Tecnología": "Technology",
    "Comercial": "Commercial",
    "Analista de Recursos Humanos": "Human Resources Analyst",
    "Gerente de Recursos Humanos": "Human Resources Manager",
    "Coordinador de Nómina": "Payroll Coordinator",
    "Analista Contable": "Accounting Analyst",
    "Analista de Tesorería": "Treasury Analyst",
    "Supervisora de Zona": "Area Supervisor",
    "Coordinador Operativo": "Operations Coordinator",
    "Analista de Sistemas": "Systems Analyst",
    "Soporte Técnico Sr.": "Senior Technical Support",
    "Ejecutiva de Cuenta": "Account Executive",
    "Coordinador Comercial": "Commercial Coordinator",
    "Analista Junior de Operaciones": "Junior Operations Analyst"
});

  const ATTR_EN = {
    'Cerrar sesión':'Sign out',
    'Ingresa tu número de empleado':'Enter your employee number',
    'Competencia a desarrollar:':'Competency to develop:',
    'Acción:':'Action:',
    'Fecha compromiso (AAAA-MM-DD):':'Due date (YYYY-MM-DD):'
  };

  function t(text) { return currentLang === 'en' ? (EN[text] || text) : text; }
  function setLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'es';
    localStorage.setItem(LANG_KEY, currentLang);
    document.documentElement.lang = currentLang;
    document.title = currentLang === 'en' ? 'Inter-Con EDD — Performance Evaluation' : 'Plataforma EDD Inter-Con — Evaluación de Desempeño';
    render();
    // El modal de IA SMART vive fuera de #app-root (para sobrevivir los
    // render() del wizard), así que no se retraduce solo con render(): hay
    // que refrescarlo aparte si está abierto.
    if (state.aiSmart.open) renderAiSmartModal();
  }

  function translateDOM(root) {
    document.documentElement.lang = currentLang;
    if (currentLang !== 'en' || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const raw = node.nodeValue || '';
      const trimmed = raw.trim();
      if (!trimmed) return;
      const normalized = trimmed.replace(/\s+/g, ' ');
      let translated = EN[trimmed] || EN[normalized] || normalized;
      if (translated === normalized) {
        // Dynamic values that are not fixed UI labels (names, counts and tenure).
        const greeting = normalized.match(/^¡Bienvenid[oa],\s*(.+)!$/i);
        const evalOf = normalized.match(/^Evaluación de\s+(.+)$/i);
        const thanks = normalized.match(/^Gracias por tu participación,\s*(.+)\.$/i);
        if (greeting) translated = `Welcome, ${greeting[1]}!`;
        else if (evalOf) translated = `Evaluation of ${evalOf[1]}`;
        else if (thanks) translated = `Thank you for participating, ${thanks[1]}.`;
        else {
          translated = translated
            .replace(/(\d+)\s+año(?:s)?\b/gi, (_, n) => `${n} year${n === '1' ? '' : 's'}`)
            .replace(/(\d+)\s+mes(?:es)?\b/gi, (_, n) => `${n} month${n === '1' ? '' : 's'}`)
            .replace(/(\d+)\s+semanas?\b/gi, (_, n) => `${n} week${n === '1' ? '' : 's'}`);
        }
        const keys = Object.keys(EN).sort((a, b) => b.length - a.length);
        keys.forEach((key) => {
          if (translated.includes(key)) translated = translated.split(key).join(EN[key]);
        });
      }
      if (translated !== normalized) node.nodeValue = raw.replace(trimmed, translated);
    });
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach((el) => {
      ['placeholder','title','aria-label'].forEach((attr) => {
        const v = el.getAttribute(attr);
        if (v && (EN[v] || ATTR_EN[v])) el.setAttribute(attr, EN[v] || ATTR_EN[v]);
      });
    });
  }

  function languageSwitcher(compact) {
    return `<div class="language-switch ${compact ? 'language-switch-compact' : ''}" role="group" aria-label="Idioma / Language">
      <button type="button" class="language-option ${currentLang === 'es' ? 'active' : ''}" onclick="App.setLanguage('es')">ES</button>
      <button type="button" class="language-option ${currentLang === 'en' ? 'active' : ''}" onclick="App.setLanguage('en')">EN</button>
    </div>`;
  }

  const state = {
    user: null,       // {empleado, nombre, perfil} — derivado de EDDAuth.getAppUser()
    periodo: null,
    wizard: { seccionIdx: 0, evaluacionId: null, tipo: null, colaboradorId: null, liderId: null },
    adminFiltros: {},
    adminKpiGroup: 'avance',
    adminAlertOpen: null,
    usuariosFiltros: {},
    jerarquiasFiltros: {},
    nineboxSel: null,
    nineboxSelEmpleado: null,
    remote: { ready: false, loading: false, error: null, me: null, mine: null, detail: null, detailLoading: false, detailError: null, detailRetry: 0, team: null, dashboard: null, calibration: null, lastSync: null, leaderSubmitting: false, leaderSubmitSuccess: false, calibrationSaving: false, calibrationCompleting: false, calibrationReleasing: false },
    // --- Estado del login de dos pasos (beta 3) ---
    login: {
      paso: 'solicitar',   // 'solicitar' | 'validar'
      numeroEmpleado: '',
      maskedEmail: null,
      loading: false,
      error: null,
      info: null,
      sessionExpiredNotice: false
    }
  };

  // =========================================================================
  // UTILIDADES
  // =========================================================================
  const $ = (sel, root) => (root || document).querySelector(sel);
  function h(strings) { return strings; } // noop, mantiene legibilidad de template literals
  function esc(str) { return String(str === null || str === undefined ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function f1(n) { return (n === null || n === undefined || isNaN(n)) ? '—' : Number(n).toFixed(1); }
  function pct(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function personalRoute(page) { return state.user && state.user.perfil === 'lider' ? '#/lider/mi-' + page : '#/colaborador/' + page; }

  const ESTADO_COLOR = {
    'No iniciada': 'gray', 'En progreso': 'yellow', 'Completada': 'green',
    'Pendiente de líder': 'yellow', 'Pendiente de calibración': 'yellow', 'Calibrada': 'blue',
    'Retroalimentación pendiente': 'yellow', 'Cerrada': 'green'
  };
  function badge(texto, color) {
    return `<span class="badge badge-${color || ESTADO_COLOR[texto] || 'gray'}">${esc(t(texto))}</span>`;
  }

  function progressBar(percent, color) {
    const p = pct(percent);
    return `<div class="progress"><div class="progress-bar" style="width:${p}%;background:${color || 'var(--azul-marino)'}"></div></div><div class="progress-label">${p}%</div>`;
  }

  function escalaHelpHTML() {
    return `<div class="escala-help"><strong>Escala de evaluación</strong>` +
      D.ESCALA.map((e) => `<div class="escala-row"><span class="escala-valor">${esc(e.valor)}</span><span>${esc(e.descripcion)}</span></div>`).join('') +
      `</div>`;
  }

  function fechaHoy() { return '2026-07-28'; } // fecha de referencia de la demo (ver <env>)
  function esVencido(fechaLimite) { return fechaLimite && fechaHoy() > fechaLimite; }


  function apiReadMode() { return global.APP_CONFIG && global.APP_CONFIG.mode === 'api' && global.APP_CONFIG.readApiEnabled !== false; }
  function apiWriteMode() { return apiReadMode() && global.APP_CONFIG && global.APP_CONFIG.writeApiEnabled === true; }
  function apiTestCaptureMode() { return apiReadMode() && global.APP_CONFIG && global.APP_CONFIG.testCaptureEnabled === true && global.APP_CONFIG.writeApiEnabled !== true; }
  function apiData(resp) { return resp && Object.prototype.hasOwnProperty.call(resp, 'data') ? resp.data : resp; }

  function estadoBackendAInterno(valor) {
    const v = String(valor || '').toLowerCase();
    if (/submitted|enviada|completada|leader_submitted/.test(v)) return D.ESTADOS.COMPLETADA;
    if (/progreso|progress/.test(v)) return D.ESTADOS.EN_PROGRESO;
    return D.ESTADOS.NO_INICIADA;
  }
  function upsertColaboradorRemoto(emp, liderId) {
    if (!emp || !(emp.employeeId || emp.empleado)) return null;
    const id = String(emp.employeeId || emp.empleado);
    const db = S.load();
    let col = db.colaboradores.find(c => String(c.empleado) === id);
    const data = {
      empleado: id,
      nombre: emp.name || emp.nombre || id,
      puesto: emp.position || emp.puesto || '',
      area: emp.area || '', direccion: emp.direction || emp.direccion || '',
      ciudad: emp.city || emp.ciudad || '', antiguedad: emp.seniority || emp.antiguedad || '',
      liderId: String(liderId || emp.leaderId || emp.liderId || '')
    };
    if (col) Object.assign(col, data); else { col = data; db.colaboradores.push(col); }
    S.persist();
    return col;
  }
  function getOrCreateLocalEvaluation(colaboradorId, liderId, tipo, backendId, estado) {
    const ev = S.getOrCreateEvaluacion(String(colaboradorId), String(liderId || ''), state.periodo.id, tipo);
    const db = S.load(); const real = db.evaluaciones.find(e => e.id === ev.id);
    if (real) { if (backendId) real.backendId = backendId; if (estado) real.estado = estadoBackendAInterno(estado); S.persist(); }
    return real || ev;
  }
  function mapRemoteAnswerToLocal(localEvalId, ans) {
    const cid = ans && (ans.competencyId || ans.competenciaId || ans.idCompetencia);
    if (!cid) return;
    const up = String(cid).toUpperCase();
    const val = ans.value ?? ans.valor ?? ans.rating ?? '';
    if (up === 'TOOL-EXCEL') return S.saveHerramientaEvaluacion(localEvalId, 'excel', val);
    if (up === 'TOOL-POWERBI') return S.saveHerramientaEvaluacion(localEvalId, 'analisis', val);
    if (up === 'TOOL-IA') return S.saveHerramientaEvaluacion(localEvalId, 'ia', val);
    const sec = ans.section || ans.seccion || (up.startsWith('A') ? 'actitud' : 'habilidades');
    S.saveRespuesta(localEvalId, sec, String(cid), val, ans.comment || ans.comentario || '');
  }
  function hydrateObjectives(localEvalId, objectives, leaderMode) {
    if (!Array.isArray(objectives)) return;
    objectives.forEach((o, i) => {
      const idx = Number.isFinite(Number(o.index)) ? Number(o.index) : i;
      const desc = o.description || o.descripcion || o.name || '';
      const goal = o.goal ?? o.meta ?? '';
      const result = o.actualResult ?? o.resultado ?? '';
      const pctSelf = o.employeeCompletionPercent ?? o.completionPercent ?? o.cumplimiento ?? '';
      const scoreSelf = o.employeeScore ?? o.calificacionColaborador ?? o.score ?? o.calificacion ?? '';
      const pctLeader = o.leaderValidatedPercent ?? o.porcentajeValidadoLider ?? '';
      const scoreLeader = o.leaderScore ?? o.calificacionLider ?? '';
      S.saveObjetivo(localEvalId, idx, desc, result, leaderMode ? (scoreLeader || '') : (scoreSelf || ''), {
        meta: goal,
        cumplimiento: leaderMode ? (pctLeader === null ? '' : pctLeader) : (pctSelf === null ? '' : pctSelf),
        cumplimientoAutomatico: pctSelf,
        calificacionAutomatica: scoreSelf,
        ajusteManualLider: leaderMode && pctLeader !== '' && Number(pctLeader) !== Number(pctSelf),
        justificacionLider: o.leaderAdjustmentReason || o.justificacionAjusteLider || ''
      });
    });
  }

  function pickMetric(obj, keys) {
    if (!obj || typeof obj !== 'object') return null;
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const raw = obj[key];
        if (raw === '' || raw === null || raw === undefined) continue;
        const n = Number(raw);
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  }
  function backendMetricsFromDetail(detail, role) {
    if (!detail || typeof detail !== 'object') return null;
    const ev = detail.evaluation || {};
    const roleKey = role === 'lider' ? 'leader' : 'self';
    const candidates = [
      detail[roleKey + 'Result'], detail[roleKey + 'Metrics'], detail.results && detail.results[roleKey],
      ev[roleKey + 'Result'], ev[roleKey + 'Metrics'], ev[roleKey], ev
    ].filter(Boolean);
    for (const src of candidates) {
      const globalScore = pickMetric(src, ['resultadoGlobalBackend','resultadoGlobal','globalResult','globalScore','score','Resultado global (backend)','Resultado Global Backend']);
      const attitude = pickMetric(src, ['actitudBackend','attitudeBackend','attitude','actitud','Actitud (backend)','Actitud Backend']);
      const performance = pickMetric(src, ['desempenoBackend','performanceBackend','performance','desempeno','Desempeño (backend)','Desempeno (backend)','Desempeño Backend']);
      if (globalScore !== null || attitude !== null || performance !== null) return { globalScore, attitude, performance, source:'backend' };
    }
    return null;
  }
  function persistBackendResult(ev, metrics) {
    if (!ev || !ev.id || !metrics) return null;
    const existing = S.getResultado(ev.id);
    const localFallback = existing || (() => {
      try { return C.calcularResultado(S.getRespuestasPorSeccion(ev.id), S.getObjetivos(ev.id)); } catch (_) { return null; }
    })();
    const promedios = Object.assign({}, (localFallback && localFallback.promedios) || {});
    const puntajes = Object.assign({}, (localFallback && localFallback.puntajes) || {});
    if (metrics.attitude !== null) promedios.actitud = metrics.attitude / 20;
    if (metrics.performance !== null) promedios.desempeno = metrics.performance / 20;
    if (metrics.globalScore !== null) puntajes.total = metrics.globalScore;
    const db = S.load();
    db.resultados = Array.isArray(db.resultados) ? db.resultados : [];
    db.resultados = db.resultados.filter(r => r.evaluacionId !== ev.id);
    const item = {
      id:`RES-BACKEND-${ev.id}`, evaluacionId:ev.id, colaboradorId:String(ev.colaboradorId), periodoId:ev.periodoId,
      origen:ev.tipo, puntajes, promedios, nivel: metrics.globalScore !== null ? C.clasificarNivel(metrics.globalScore) : ((localFallback&&localFallback.nivel)||null),
      fecha:new Date().toISOString().slice(0,10), sincronizadoDesdeBackend:true, fuenteResultado:'backend'
    };
    db.resultados.push(item); S.persist(); return item;
  }
  function syncBackendResultsFromDetail(detail, autoEv, leaderEv) {
    const selfMetrics = backendMetricsFromDetail(detail, 'self');
    const leaderMetrics = backendMetricsFromDetail(detail, 'lider');
    if (selfMetrics && autoEv) persistBackendResult(autoEv, selfMetrics);
    if (leaderMetrics && leaderEv) persistBackendResult(leaderEv, leaderMetrics);
    return { selfMetrics, leaderMetrics };
  }

  function hydrateRemoteFeedback(detail, colaboradorId, periodoId, leaderEv) {
    if (!detail || !colaboradorId || !periodoId) return null;
    const fb = detail.feedback;
    const calRemote = detail.calibration || detail.calibracion || null;
    if (!fb && !calRemote) return null;
    const cambios = {_motivo:'Sincronización desde backend'};
    if (fb) {
      cambios.feedbackId = fb.feedbackId || fb.id || '';
      cambios.retroHabilitada = true;
      cambios.reunionLiderRealizada = !!fb.meetingConfirmed;
      cambios.acuerdosLiberados = !!fb.releasedForSignature;
      cambios.firmaLider = !!fb.leaderSigned;
      cambios.firmaColaborador = !!fb.employeeSigned;
      cambios.aceptacionColaborador = !!fb.employeeSigned || /cerrad|closed/i.test(String(fb.signatureState||''));
      cambios.acuerdosFinales = fb.finalAgreements || fb.agreements || '';
      cambios.fechaFirmaLider = fb.leaderSignedAt || fb.leaderSignatureAt || null;
      cambios.fechaFirmaColaborador = fb.employeeSignedAt || fb.employeeSignatureAt || fb.closedAt || null;
      if (fb.closedAt) cambios.closedAt = fb.closedAt;
      if (leaderEv) {
        leaderEv.fortalezas = fb.strengths || leaderEv.fortalezas || '';
        leaderEv.oportunidadesDesarrollo = fb.developmentOpportunities || leaderEv.oportunidadesDesarrollo || '';
        leaderEv.debilidadesBrechas = fb.gaps || leaderEv.debilidadesBrechas || '';
        leaderEv.riesgosAtencion = fb.risks || leaderEv.riesgosAtencion || '';
        leaderEv.comentarios = fb.leaderSummary || leaderEv.comentarios || '';
      }
      const db=S.load();
      db.areas_oportunidad=(db.areas_oportunidad||[]).filter(a=>!(String(a.colaboradorId)===String(colaboradorId)&&a.periodoId===periodoId));
      normalizeFeedbackArray(fb.improvementPlan).forEach((a,i)=>db.areas_oportunidad.push({id:`AO-REMOTE-${colaboradorId}-${i}`,colaboradorId:String(colaboradorId),periodoId,area:a.area||a.opportunityArea||'',planMejora:a.improvementPlan||a.plan||''}));
      db.planes_desarrollo=(db.planes_desarrollo||[]).filter(a=>!(String(a.colaboradorId)===String(colaboradorId)&&a.periodoId===periodoId));
      normalizeFeedbackArray(fb.developmentPlan).forEach((a,i)=>db.planes_desarrollo.push({id:`PD-REMOTE-${colaboradorId}-${i}`,colaboradorId:String(colaboradorId),periodoId,competencia:a.competency||a.competencia||'',accion:a.action||a.accion||'',responsable:a.responsible||a.responsable||'',fechaCompromiso:a.commitmentDate||a.fechaCompromiso||'',estado:'No iniciada',evidencia:'',observaciones:''}));
      S.persist();
    }
    if (calRemote) {
      const cr=calRemote;
      const rr=Number(cr.calibratedResult ?? cr.resultadoCalibrado);
      if(Number.isFinite(rr)) cambios.resultadoCalibrado=rr;
      if(cr.notes||cr.notas) cambios.observacionesRH=cr.notes||cr.notas;
      if(/completed/i.test(String(cr.status||cr.calibrationStatus||cr.estado||''))) cambios.calibracionCompletada=true;
    }
    return S.crearOActualizarCalibracion(String(colaboradorId),periodoId,cambios,(state.user&&state.user.nombre)||'Backend');
  }

  async function refreshFeedbackDetail(evaluationId, colaboradorId, leaderEv) {
    const fresh=apiData(await global.EDDApi.evaluationDetail(evaluationId,true));
    state.remote.detail=fresh; state.remote.detailError=null;
    hydrateRemoteFeedback(fresh,String(colaboradorId),state.periodo.id,leaderEv||S.getEvaluacion(String(colaboradorId),state.periodo.id,'lider'));
    return fresh;
  }

  function ensureLocalResultForEvaluation(ev) {
    if (!ev || !ev.id) return null;
    const existing = S.getResultado(ev.id);
    if (existing && existing.promedios && existing.puntajes) return existing;
    try {
      const resultado = C.calcularResultado(S.getRespuestasPorSeccion(ev.id), S.getObjetivos(ev.id));
      if (!resultado) return null;
      const db = S.load();
      db.resultados = Array.isArray(db.resultados) ? db.resultados : [];
      db.resultados = db.resultados.filter(r => r.evaluacionId !== ev.id);
      db.resultados.push({
        id: `RES-SYNC-${ev.id}`, evaluacionId: ev.id, colaboradorId: String(ev.colaboradorId),
        periodoId: ev.periodoId, origen: ev.tipo, puntajes: resultado.puntajes || {},
        promedios: resultado.promedios || {}, nivel: resultado.nivel || null,
        fecha: new Date().toISOString().slice(0,10), sincronizadoDesdeBackend: true
      });
      S.persist();
      return db.resultados[db.resultados.length - 1];
    } catch (e) {
      console.warn('No fue posible reconstruir resultado local sincronizado', e);
      return null;
    }
  }

  function hydrateOwnRemoteDetail() {
    if (!apiReadMode() || !state.remote.detail || !state.remote.mine || !state.remote.mine.evaluation) return;
    const d = state.remote.detail; const me = empleadoRemoto();
    const leader = d.leader || {};
    const liderId = leader.employeeId || leader.empleado || state.remote.mine.evaluation.leaderId || '';
    upsertColaboradorRemoto(me, liderId);
    const backendId = state.remote.mine.evaluation.evaluationId || state.remote.mine.evaluation.id;
    const local = getOrCreateLocalEvaluation(me.empleado, liderId, 'autoevaluacion', backendId, state.remote.mine.evaluation.state || state.remote.mine.evaluation.selfState);
    (d.answers || []).filter(a => !/l[ií]der|leader/i.test(String(a.evaluator || a.evaluador || ''))).forEach(a => mapRemoteAnswerToLocal(local.id, a));
    hydrateObjectives(local.id, d.objectives || [], false);
    syncBackendResultsFromDetail(d, local, null);
    hydrateRemoteFeedback(d, me.empleado, state.periodo.id, S.getEvaluacion(me.empleado, state.periodo.id, 'lider'));
  }
  function selfDraftPayload(localEvalId, backendId) {
    const ev = S.load().evaluaciones.find(e => e.id === localEvalId) || {};
    const answers = S.getRespuestas(localEvalId).filter(r => String(r.competenciaId).toUpperCase() !== 'B2').map(r => ({competencyId:r.competenciaId, value:r.valor, comment:r.comentario || ''}));
    const h = S.getHerramientasEvaluacion(localEvalId) || {};
    const noObjectives = !!ev.objetivosNoAplican;
    const objectives = noObjectives ? [] : S.getObjetivos(localEvalId).filter(o => (o.descripcion || '').trim()).map((o,i) => ({
      objectiveId: o.backendObjectiveId || `${backendId}-OBJ-${Number(o.index ?? i)+1}`,
      description:o.descripcion || '', goal:o.meta === '' ? '' : Number(o.meta), actualResult:o.resultado === '' ? '' : Number(o.resultado), evidenceSelf:o.evidenceSelf || ''
    }));
    return {
      answers,
      tools:{ excel:h.excel ?? '', powerBi:h.analisis ?? '', ia:h.ia ?? '' },
      objectives,
      noObjectives,
      noObjectivesReason: noObjectives ? (ev.objetivosNoAplicanMotivo || '') : '',
      noObjectivesDetail: noObjectives ? (ev.objetivosNoAplicanDetalle || '') : ''
    };
  }
  function leaderDraftPayload(localEvalId, backendId) {
    const ev = S.load().evaluaciones.find(e => e.id === localEvalId) || {};
    const answers = S.getRespuestas(localEvalId).filter(r => String(r.competenciaId).toUpperCase() !== 'B2').map(r => ({competencyId:r.competenciaId, value:r.valor, comment:r.comentario || ''}));
    const h = S.getHerramientasEvaluacion(localEvalId) || {};
    const decision = ev.objetivosNoAplicanDecision || (ev.objetivosNoAplicanConfirmados ? 'confirmado' : '');
    const objectives = decision === 'confirmado' ? [] : S.getObjetivos(localEvalId).filter(o => (o.descripcion || '').trim()).map((o,i) => ({
      objectiveId:o.backendObjectiveId || `${backendId}-OBJ-${Number(o.index ?? i)+1}`,
      leaderValidatedPercent:o.cumplimiento === '' ? '' : Number(o.cumplimiento), leaderAdjustmentReason:o.justificacionLider || '', evidenceLeader:o.evidenceLeader || ''
    }));
    const colaboradorId = String(ev.colaboradorId || state.wizard.colaboradorId || '');
    const periodoId = ev.periodoId || (state.periodo && state.periodo.id) || '';
    const improvementPlan = colaboradorId && periodoId ? S.getAreasOportunidad(colaboradorId, periodoId).map(a => ({
      area: a.area || '',
      improvementPlan: a.planMejora || ''
    })) : [];
    const developmentPlan = colaboradorId && periodoId ? S.getPlanesDesarrollo(colaboradorId, periodoId).map(p => ({
      competency: p.competencia || '',
      action: p.accion || '',
      responsible: p.responsable || '',
      commitmentDate: p.fechaCompromiso || ''
    })) : [];
    return {
      answers,
      tools:{ excel:h.excel ?? '', powerBi:h.analisis ?? '', ia:h.ia ?? '' },
      objectives,
      noObjectivesDecision: decision || '',
      noObjectivesLeaderComment: ev.objetivosNoAplicanComentarioLider || '',
      strengths: ev.fortalezas || '',
      developmentOpportunities: ev.oportunidadesDesarrollo || '',
      gaps: ev.debilidadesBrechas || '',
      risks: ev.riesgosAtencion || '',
      leaderSummary: ev.comentarios || '',
      improvementPlan,
      developmentPlan
    };
  }
  function backendIdForLocalEvaluation(localEvalId) {
    const ev = S.load().evaluaciones.find(e => e.id === localEvalId);
    return ev && ev.backendId ? ev.backendId : null;
  }
  function periodoRemotoNormalizado(p) {
    if (!p) return null;
    return {
      id: p.id || p.periodId || 'ACTIVO',
      nombre: p.name || p.nombre || 'Periodo activo',
      fechaLimiteAutoevaluacion: p.selfDeadline || p.fechaLimiteAutoevaluacion || '',
      fechaLimiteLider: p.leaderDeadline || p.fechaLimiteLider || '',
      fechaLimiteRetroalimentacion: p.feedbackDeadline || p.fechaLimiteRetroalimentacion || ''
    };
  }
  function empleadoRemoto() {
    const me = state.remote.me || {};
    const e = me.employee || {};
    return {
      empleado: e.employeeId || state.user.empleado,
      nombre: e.name || state.user.nombre,
      correoCorporativo: e.email || '', puesto: e.position || state.user.puesto || '',
      area: e.area || state.user.area || '', direccion: e.direction || state.user.direccion || '', ciudad: ''
    };
  }
  async function refreshBackendRead(force) {
    if (!apiReadMode() || state.remote.loading || (state.remote.ready && !force)) return;
    state.remote.loading = true; state.remote.error = null;
    try {
      // /auth/me hidrata la sesión una sola vez. api.js deduplica/cachea este GET
      // para evitar la segunda llamada que hacía la integración v1.
      try { await A.refreshProfileFromApi(); state.user = A.getAppUser(); } catch (e) { console.warn('EDD read: /auth/me profile refresh failed', e); }
      try { state.remote.me = apiData(await global.EDDApi.authMe(false)); } catch (e) { console.warn('EDD read: /auth/me state refresh failed', e); }

      // Mine + equipo/dashboard son webhooks independientes: el navegador sí
      // puede ejecutarlos concurrentemente aunque n8n no paralelice nodos dentro
      // de un workflow. Esto reduce el tiempo de entrada al portal del líder/DO.
      const jobs = [global.EDDApi.evaluationsMine(!!force).then(r => { state.remote.mine = apiData(r); })];
      if (state.user && state.user.perfil === 'lider') jobs.push(global.EDDApi.leaderTeam(!!force).then(r => { state.remote.team = apiData(r); }));
      if (state.user && state.user.perfil === 'administrador') {
        jobs.push(global.EDDApi.adminDashboard(!!force).then(r => { state.remote.dashboard = apiData(r); }));
        jobs.push(global.EDDApi.adminCalibration(!!force).then(r => { state.remote.calibration = apiData(r); }));
      }
      await Promise.all(jobs);

      // El detalle completo cuesta ~10s en n8n/Airtable. Ya no se carga en el
      // dashboard de líder ni en Inicio: se solicita de forma lazy solo al abrir
      // la autoevaluación o una evaluación de colaborador.
      state.remote.ready = true; state.remote.lastSync = new Date().toISOString();
    } catch (err) {
      console.error('EDD Backend Integration performance', err);
      state.remote.error = err; state.remote.ready = false;
    } finally {
      state.remote.loading = false;
      render();
    }
  }

  async function ensureOwnRemoteDetail(force) {
    if (!apiReadMode() || state.remote.detailLoading) return;
    const mineEval = state.remote.mine && state.remote.mine.evaluation;
    const id = mineEval && (mineEval.evaluationId || mineEval.id);
    if (!id || (state.remote.detail && !force)) return;
    state.remote.detailLoading = true;
    try {
      state.remote.detail = apiData(await global.EDDApi.evaluationDetail(id, !!force));
      try { hydrateOwnRemoteDetail(); } catch (e) { console.warn('EDD read: no fue posible hidratar detalle propio', e); }
    } catch (e) {
      console.warn('EDD read: detalle propio no disponible', e);
      showNotice(e && e.message ? e.message : 'No fue posible cargar el detalle de la evaluación.', 'warning');
    } finally {
      state.remote.detailLoading = false;
      render();
    }
  }
  function viewBackendLoading() {
    return `<main class="container backend-state-page"><div class="card backend-state-card"><div class="backend-spinner"></div><h2>Conectando con Evaluación de Desempeño</h2><p class="muted">Consultando tu sesión y datos del periodo activo…</p></div></main>`;
  }
  function viewBackendError(err) {
    const msg = err && err.message ? err.message : 'No fue posible consultar la información del backend.';
    return `<main class="container backend-state-page"><div class="card backend-state-card"><div class="backend-state-icon">!</div><h2>No pudimos cargar tus datos</h2><p class="muted">${esc(msg)}</p><button class="btn btn-primary" onclick="App.recargarBackend()">Reintentar</button><p class="backend-read-note">La información de producción no se sustituye por datos demo automáticamente.</p></div></main>`;
  }
  function backendStatusPill() {
    if (!apiReadMode()) return '';
    return `<span class="backend-live-pill" title="Lectura conectada a n8n + Airtable"><i></i> Backend conectado</span>`;
  }

  // =========================================================================
  // SESIÓN (delegada en auth.js — ver EDDAuth). Este bloque solo resuelve la
  // navegación posterior al login/logout y el registro en auditoría local.
  // =========================================================================
  function irAHomeDePerfil(perfil) {
    navigate(perfil === 'colaborador' ? '#/colaborador/bienvenida' : (perfil === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard'));
  }

  function introKey() {
    return state.user ? `edd_intro_rev4_${state.user.empleado}` : 'edd_intro_rev4';
  }
  function introVista() { return sessionStorage.getItem(introKey()) === '1'; }
  function marcarIntroVista() { sessionStorage.setItem(introKey(), '1'); }

  function resetLoginState(paso) {
    state.login = {
      paso: paso || 'solicitar',
      numeroEmpleado: state.login ? state.login.numeroEmpleado : '',
      maskedEmail: null,
      loading: false,
      error: null,
      info: null,
      sessionExpiredNotice: state.login ? state.login.sessionExpiredNotice : false
    };
  }

  async function logout() {
    if (state.user) {
      S.addAudit(state.user.nombre, 'Cierre de sesión', 'usuarios', state.user.empleado, null, null);
      sessionStorage.removeItem(introKey());
    }
    if (state.aiSmart.open) { state.aiSmart.open = false; renderAiSmartModal(); }
    await A.logout();
    state.user = null;
    resetLoginState('solicitar');
    navigate('#/login');
  }

  // =========================================================================
  // ROUTER
  // =========================================================================
  function navigate(hash) { if (location.hash === hash) { render(); } else { location.hash = hash; } }
  function parseHash() {
    const h = location.hash.replace(/^#\//, '');
    const parts = h.split('/').filter(Boolean);
    return parts;
  }

  function render() {
    const root = document.getElementById('app-root');
    const teniaUsuario = !!state.user;
    const session = A.getSession();
    state.user = session ? A.getAppUser(session) : null;

    if (!state.user) {
      state.remote = { ready: false, loading: false, error: null, me: null, mine: null, detail: null, detailLoading: false, team: null, dashboard: null, lastSync: null };
      // Si había sesión activa y ya no la hay (y no fue por un logout manual
      // que ya limpió el aviso), asumimos que expiró y lo mostramos en login.
      if (teniaUsuario && !state.login.sessionExpiredNotice) {
        state.login.sessionExpiredNotice = true;
      }
      root.innerHTML = viewLogin();
      bindLogin();
      translateDOM(root);
      return;
    }
    if (apiReadMode() && !state.remote.ready) {
      if (!state.remote.loading && !state.remote.error) refreshBackendRead(false);
      root.innerHTML = state.remote.error ? viewBackendError(state.remote.error) : viewBackendLoading();
      translateDOM(root);
      return;
    }
    state.periodo = apiReadMode() ? (periodoRemotoNormalizado(state.remote.mine && state.remote.mine.period) || S.getPeriodoActivo()) : S.getPeriodoActivo();

    const parts = parseHash();
    const areaEsperada = state.user.perfil === 'colaborador' ? 'colaborador' : state.user.perfil === 'lider' ? 'lider' : 'admin';
    const area = parts[0] || areaEsperada;
    const page = parts[1] || (areaEsperada === 'colaborador' ? 'inicio' : 'dashboard');
    const param = parts[2];

    // Carga lazy del detalle propio: evita pagar ~10s al entrar al dashboard.
    const necesitaDetallePropio = (area === 'colaborador' && (page === 'autoevaluacion' || page === 'retroalimentacion')) || (area === 'lider' && (page === 'mi-autoevaluacion' || page === 'mi-retroalimentacion'));
    const mineEvalParaDetalle = state.remote.mine && state.remote.mine.evaluation;
    if (apiReadMode() && necesitaDetallePropio && mineEvalParaDetalle && !state.remote.detail) {
      if (!state.remote.detailLoading) ensureOwnRemoteDetail(false);
      root.innerHTML = viewBackendLoading().replace('Conectando con Evaluación de Desempeño','Cargando tu evaluación').replace('Consultando tu sesión y datos del periodo activo…','Recuperando respuestas y objetivos guardados…');
      translateDOM(root);
      return;
    }

    // Seguridad de navegación: el rol de la URL nunca puede sustituir al rol
    // de la sesión. Si el usuario modifica manualmente el hash, vuelve a su portal.
    if (area !== areaEsperada) {
      navigate(areaEsperada === 'colaborador' ? '#/colaborador/inicio' : areaEsperada === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard');
      return;
    }

    let body = '';
    if (area === 'colaborador') body = renderColaborador(page);
    else if (area === 'lider') body = renderLider(page, param);
    else if (area === 'admin') body = renderAdmin(page, param);
    else {
      navigate(areaEsperada === 'colaborador' ? '#/colaborador/inicio' : areaEsperada === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard');
      return;
    }

    root.innerHTML = renderHeader(area, page) + `<main class="container">${body}</main>` + renderFooter();
    bindGlobal();
    translateDOM(root);
    initSignaturePads();
  }

  // =========================================================================
  // HEADER / NAV / FOOTER
  // =========================================================================
  function renderHeader(area, page) {
    const u = state.user;
    const per = state.periodo;
    let tabs = [];
    if (u.perfil === 'colaborador') {
      tabs = [['inicio', 'Inicio'], ['autoevaluacion', 'Autoevaluación'], ['retroalimentacion', 'Retroalimentación']];
    } else if (u.perfil === 'lider') {
      tabs = [['mi-inicio', 'Mi evaluación'], ['dashboard', 'Mi equipo'], ['pendientes', 'Pendientes por evaluar'], ['firmas', 'Por firmar']];
    } else {
      tabs = [['dashboard', 'Dashboard'], ['calibracion', 'Calibración'], ['9box', 'Matriz 9-Box'], ['usuarios', 'Usuarios'], ['jerarquias', 'Jerarquías'], ['auditoria', 'Auditoría'], ['config', 'Configuración']];
    }
    const retroPendiente = u.perfil === 'colaborador' && state.periodo && (() => { const cal=S.getCalibracion(u.empleado, state.periodo.id); return !!(cal && cal.retroHabilitada && !cal.aceptacionColaborador); })();
    const firmasPendientesLider = u.perfil === 'lider' && state.periodo ? S.getColaboradoresDeLider(u.empleado).filter((c) => { const cal = S.getCalibracion(c.empleado, state.periodo.id); return !!(cal && cal.acuerdosLiberados && !cal.firmaLider); }).length : 0;
    const navHtml = tabs.map((t) => {
      const esRetro = u.perfil === 'colaborador' && t[0] === 'retroalimentacion';
      const esFirma = u.perfil === 'lider' && t[0] === 'firmas';
      const esMiEvaluacion = u.perfil === 'lider' && t[0] === 'mi-inicio';
      const estadoPropio = esMiEvaluacion ? S.estadoProceso(u.empleado, state.periodo.id) : null;
      const autoPropiaPendiente = esMiEvaluacion && [D.ESTADOS.NO_INICIADA, D.ESTADOS.EN_PROGRESO].includes(estadoPropio);
      const atencion = (esRetro && retroPendiente) || (esFirma && firmasPendientesLider > 0) || autoPropiaPendiente;
      const badgeCount = esRetro && retroPendiente ? 1 : esFirma ? firmasPendientesLider : autoPropiaPendiente ? 1 : 0;
      const titulo = esRetro ? 'Retroalimentación disponible' : esFirma ? 'Acuerdos pendientes por firmar' : 'Tu autoevaluación está pendiente';
      return `<a href="#/${area === 'colaborador' ? 'colaborador' : area}/${t[0]}" class="${page === t[0] ? 'active' : ''}${atencion ? ' nav-attention' : ''}">${t[1]}${atencion ? `<span class="nav-notification-dot" title="${titulo}">${badgeCount}</span>` : ''}</a>`;
    }).join('');
    const iniciales = esc((u.nombre || '').split(/\s+/).slice(0,2).map(x => x[0] || '').join('').toUpperCase());
    return `
    <header class="app-header premium-header">
      <div class="app-header-top premium-header-top">
        <div class="brand premium-brand">
          <img src="assets/logo-ic-blanco-horizontal.png" alt="IC Seguridad Privada" />
        </div>
        <nav class="nav-tabs premium-nav-tabs">${navHtml}</nav>
        <div class="premium-user-menu">
          <span class="premium-user-avatar">${iniciales}</span>
          <span class="premium-user-copy"><strong>${esc(u.nombre)}</strong><small>${capitalize(u.perfil)} · ${esc(per ? per.nombre : '')}</small></span>
          ${languageSwitcher(true)}
          <button class="premium-logout" onclick="App.logout()" title="Cerrar sesión"><span class="logout-icon">↪</span><span class="logout-label">Cerrar sesión</span></button>
        </div>
      </div>
    </header>`;
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function showNotice(message, type) {
    let host=document.getElementById('appInlineNotice');
    if(!host){ host=document.createElement('div'); host.id='appInlineNotice'; host.className='app-inline-notice'; document.body.appendChild(host); }
    host.className='app-inline-notice show '+(type||'info'); host.innerHTML=`<span>${esc(message)}</span><button type="button" aria-label="Cerrar" onclick="this.parentElement.classList.remove('show')">×</button>`;
    clearTimeout(showNotice._timer); showNotice._timer=setTimeout(()=>host.classList.remove('show'),5200);
  }

  function renderFooter() {
    return `<footer class="app-footer">Inter-Con Seguridad Privada · Evaluación de Desempeño · FOR-CAP-003 Rev. 4</footer>`;
  }

  function bindGlobal() {
    document.querySelectorAll('[data-tooltip-toggle]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const panel = document.getElementById(btn.getAttribute('data-tooltip-toggle'));
        if (panel) panel.classList.toggle('open');
      });
    });
  }

  // =========================================================================
  // LOGIN (dos pasos: solicitar código -> validar código) — beta 3
  // =========================================================================
  let countdownInterval = null;

  function detenerCountdown() { if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; } }

  function iniciarCountdown() {
    detenerCountdown();
    countdownInterval = setInterval(() => {
      const pend = A.pendienteActual();
      const el = document.getElementById('loginCountdown');
      if (!pend || !el) { detenerCountdown(); return; }
      const restanteMs = pend.expiresAt - Date.now();
      if (restanteMs <= 0) {
        el.textContent = 'vencido';
        el.classList.add('countdown-vencido');
        detenerCountdown();
        return;
      }
      const mm = Math.floor(restanteMs / 60000);
      const ss = Math.floor((restanteMs % 60000) / 1000);
      el.textContent = mm + ':' + String(ss).padStart(2, '0');
    }, 1000);
  }

  function viewLogin() {
    const L = state.login;
    const avisoExpirada = L.sessionExpiredNotice
      ? `<p class="alert alert-warning premium-login-alert">Tu sesión anterior expiró por inactividad. Inicia sesión de nuevo.</p>`
      : '';
    const cuerpo = L.paso === 'validar' ? viewLoginValidar(L) : viewLoginSolicitar(L);
    return `
    <div class="login-screen premium-login-screen">
      <section class="premium-login-shell">
        <div class="premium-login-brand-panel">
          <div class="premium-login-overlay"></div>
          <div class="premium-login-brand-content">
            <img class="premium-login-logo" src="assets/logo-ic-blanco-horizontal.png" alt="IC Seguridad Privada" />
            <div class="premium-login-kicker">Plataforma corporativa</div>
            <h1>Evaluación de Desempeño</h1>
            <p>Una experiencia simple, segura y confidencial para impulsar tu desarrollo dentro de Inter-Con.</p>
          </div>
          <div class="premium-login-trust">
            <div><span>◇</span><strong>Seguro</strong><small>Tus datos están protegidos</small></div>
            <div><span>▣</span><strong>Confidencial</strong><small>Información de uso interno</small></div>
            <div><span>↗</span><strong>Desarrollo</strong><small>Impulsamos tu crecimiento</small></div>
          </div>
        </div>
        <div class="premium-login-form-panel">
          <div class="premium-login-form-wrap">
            <div class="premium-login-lang">${languageSwitcher(false)}</div>
            <div class="premium-login-mobile-logo"><img src="assets/logo-ic-blanco-horizontal.png" alt="IC Seguridad Privada" /></div>
            <div class="premium-login-step">${L.paso === 'validar' ? 'Verificación de identidad' : 'Bienvenido(a)'}</div>
            <h2>${L.paso === 'validar' ? 'Ingresa tu código de acceso' : 'Inicia sesión'}</h2>
            <p class="premium-login-description">${L.paso === 'validar' ? 'Revisa tu correo corporativo y captura el código temporal de 6 dígitos.' : 'Utiliza tu número de empleado para acceder a tu evaluación.'}</p>
            ${avisoExpirada}
            ${cuerpo}
            <div class="premium-login-security">▾ &nbsp; Acceso protegido · Uso exclusivo de personal autorizado</div>
          </div>
        </div>
      </section>
    </div>`;
  }

  function viewLoginSolicitar(L) {
    const modoApi = global.APP_CONFIG.mode === 'api';
    return `
    <div class="login-form premium-login-form">
      <label for="loginEmpleado">Número de empleado</label>
      <div class="premium-input-wrap"><span>♙</span><input id="loginEmpleado" type="text" inputmode="numeric" placeholder="Ingresa tu número de empleado" value="${esc(L.numeroEmpleado)}" /></div>
      <p class="premium-field-help">Te enviaremos un código de verificación a tu correo corporativo.</p>
      ${L.error ? `<p class="alert alert-danger">${esc(L.error)}</p>` : ''}
      ${L.info ? `<p class="alert alert-info">${esc(L.info)}</p>` : ''}
      <button class="btn btn-primary btn-block premium-login-primary" id="btnSolicitarCodigo" ${L.loading ? 'disabled' : ''}>${L.loading ? 'Enviando…' : 'Continuar'} <span>→</span></button>
      ${modoApi ? '<p class="muted premium-api-note">Conexión segura mediante API corporativa.</p>' : ''}
    </div>
    `;
  }

  function viewLoginValidar(L) {
    const modoApi = global.APP_CONFIG.mode === 'api';
    return `
    <div class="login-form premium-login-form">
      <div class="premium-code-sent">✓ Código enviado${L.maskedEmail ? ' a <strong>' + esc(L.maskedEmail) + '</strong>' : ''}</div>
      <label for="loginCodigo">Código temporal</label>
      <input class="premium-code-input" id="loginCodigo" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" />
      <p class="premium-field-help">El código vence en <strong id="loginCountdown">${esc(global.APP_CONFIG.codeValidityMinutes)}:00</strong> minutos.</p>
      ${L.error ? `<p class="alert alert-danger">${esc(L.error)}</p>` : ''}
      ${L.info ? `<p class="alert alert-info">${esc(L.info)}</p>` : ''}
      <button class="btn btn-primary btn-block premium-login-primary" id="btnValidarCodigo" ${L.loading ? 'disabled' : ''}>${L.loading ? 'Validando…' : 'Ingresar a la plataforma'} <span>→</span></button>
      <div class="login-secondary-actions premium-login-secondary">
        <button class="btn btn-outline btn-sm" id="btnReenviarCodigo" ${L.loading ? 'disabled' : ''}>Reenviar código</button>
        <button class="btn btn-outline btn-sm" id="btnCorregirEmpleado" ${L.loading ? 'disabled' : ''}>Cambiar empleado</button>
      </div>
    </div>`;
  }

  function bindLogin() {
    detenerCountdown();
    if (state.login.paso === 'validar') {
      iniciarCountdown();
      $('#btnValidarCodigo').addEventListener('click', () => Actions.validarCodigo());
      $('#btnReenviarCodigo').addEventListener('click', () => Actions.reenviarCodigo());
      $('#btnCorregirEmpleado').addEventListener('click', () => Actions.corregirEmpleado());
      const inputCodigo = $('#loginCodigo');
      if (inputCodigo) inputCodigo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') Actions.validarCodigo(); });
    } else {
      $('#btnSolicitarCodigo').addEventListener('click', () => Actions.solicitarCodigo($('#loginEmpleado').value.trim()));
      const inputEmpleado = $('#loginEmpleado');
      if (inputEmpleado) inputEmpleado.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') Actions.solicitarCodigo(inputEmpleado.value.trim()); });
      document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => Actions.quickLogin(b.getAttribute('data-quick'))));
    }
  }

  // =========================================================================
  // PORTAL COLABORADOR
  // =========================================================================
  function normalizeBackendProcessState(value) {
    const raw = String(value || '').trim();
    const key = raw.toLowerCase().replace(/[\s-]+/g, '_');
    const map = {
      'draft': D.ESTADOS.EN_PROGRESO,
      'in_progress': D.ESTADOS.EN_PROGRESO,
      'en_progreso': D.ESTADOS.EN_PROGRESO,
      'submitted': D.ESTADOS.PENDIENTE_LIDER,
      'self_submitted': D.ESTADOS.PENDIENTE_LIDER,
      'leader_submitted': D.ESTADOS.PENDIENTE_CALIBRACION,
      'pending_calibration': D.ESTADOS.PENDIENTE_CALIBRACION,
      'calibration': D.ESTADOS.CALIBRADA,
      'calibrated': D.ESTADOS.CALIBRADA,
      'released': D.ESTADOS.RETRO_PENDIENTE,
      'feedback': D.ESTADOS.RETRO_PENDIENTE,
      'closed': D.ESTADOS.CERRADA
    };
    return map[key] || raw || D.ESTADOS.NO_INICIADA;
  }

  function ownRemoteProcessState(mineEval) {
    const d = state.remote && state.remote.detail;
    // Para vistas que cargan Evaluation Detail (p. ej. Retroalimentación),
    // el detalle es la fuente más fresca. /evaluations/mine puede conservar
    // selfState='submitted' aunque DO ya haya liberado el proceso.
    const candidates = [
      d && d.processState,
      d && d.generalProcessState,
      d && d.evaluation && d.evaluation.processState,
      d && d.evaluation && d.evaluation.generalProcessState,
      d && d.status && d.status.processState,
      mineEval && mineEval.processState,
      mineEval && mineEval.generalProcessState,
      mineEval && mineEval.state,
      mineEval && mineEval.selfState
    ];
    let raw = candidates.find(v => v !== undefined && v !== null && String(v).trim() !== '');

    // Contrato E2E: después de release debe existir feedback. Si el endpoint
    // mine llega stale pero el detalle ya trae feedback, nunca regresamos a
    // 'submitted' en la pantalla del colaborador.
    if (d && d.feedback && d.feedback.feedbackId) {
      const signatureState = String(d.feedback.signatureState || '').toLowerCase();
      const closed = d.feedback.closedAt || d.feedback.employeeSigned || signatureState === 'cerrada' || signatureState === 'closed';
      if (closed) raw = 'closed';
      else if (!raw || /^(submitted|self_submitted|leader_submitted|calibration|calibrated)$/i.test(String(raw))) raw = 'released';
    }
    return normalizeBackendProcessState(raw);
  }

  function renderColaborador(page) {
    const col = apiReadMode() ? empleadoRemoto() : S.getColaborador(state.user.empleado);
    const periodoId = state.periodo.id;
    const mineEval = apiReadMode() && state.remote.mine ? state.remote.mine.evaluation : null;
    const estado = apiReadMode() ? (mineEval ? ownRemoteProcessState(mineEval) : D.ESTADOS.NO_INICIADA) : S.estadoProceso(col.empleado, periodoId);

    if (page === 'bienvenida') return viewBienvenidaEvaluacion(col, periodoId, estado);
    if (page === 'autoevaluacion' && !introVista() && (estado === D.ESTADOS.NO_INICIADA || estado === D.ESTADOS.EN_PROGRESO)) {
      return viewBienvenidaEvaluacion(col, periodoId, estado);
    }
    if (page === 'autoevaluacion' && apiReadMode() && !global.APP_CONFIG.writeApiEnabled && !apiTestCaptureMode()) return viewReadOnlyEvaluationIntegration(col, estado);
    if (page === 'autoevaluacion') return viewAutoevaluacion(col, periodoId, estado);
    if (page === 'retroalimentacion') return viewRetroalimentacion(col, periodoId, estado);
    if (page === 'enviado') return viewEnvioExitoso(col);
    return viewBienvenidaEvaluacion(col, periodoId, estado);
  }

  function nombreParaSaludo(nombreCompleto) {
    const raw = String(nombreCompleto || '').trim();
    if (!raw) return '';
    const partes = raw.split(/\s+/).filter(Boolean);
    // El maestro corporativo puede venir en formato APELLIDO PATERNO +
    // APELLIDO MATERNO + NOMBRE(S), normalmente completamente en mayúsculas.
    // Para ese caso usamos el primer nombre (tercer bloque) sin alterar el
    // nombre completo que se muestra en la ficha del colaborador.
    const letras = raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
    const pareceApellidoPrimero = partes.length >= 3 && letras && letras === letras.toUpperCase();
    const elegido = pareceApellidoPrimero ? partes[2] : partes[0];
    return elegido.charAt(0).toUpperCase() + elegido.slice(1).toLowerCase();
  }

  function viewBienvenidaEvaluacion(col, periodoId, estado) {
    const enProgreso = estado === D.ESTADOS.EN_PROGRESO;
    const retroDisponible = estado === D.ESTADOS.RETRO_PENDIENTE || estado === D.ESTADOS.CERRADA;
    const evaluacionEnviada = ![D.ESTADOS.NO_INICIADA, D.ESTADOS.EN_PROGRESO].includes(estado);
    const primerNombre = esc(nombreParaSaludo(col.nombre));
    return `
    <section class="welcome-page">
      <div class="welcome-hero">
        <div class="welcome-hero-copy">
          <div class="welcome-eyebrow">Evaluación de Desempeño</div>
          <h1>¡Hola, ${primerNombre}! <span class="welcome-wave">👋</span></h1>
          <p class="welcome-lead">Esta evaluación nos ayuda a conocer tu desempeño, reconocer tus fortalezas e identificar oportunidades de desarrollo que impulsen tu crecimiento dentro de Inter-Con.</p>

          <div class="welcome-persona">
            <div class="welcome-persona-block">
              <div class="welcome-persona-icon">▣</div>
              <div><strong>${esc(col.nombre)}</strong><span>${esc(col.puesto)}</span></div>
            </div>
            <div class="welcome-persona-divider"></div>
            <div class="welcome-persona-block">
              <div class="welcome-persona-icon">⌘</div>
              <div><strong>${esc(col.area || 'Área')}</strong><span>${esc(col.area || '')}</span></div>
            </div>
          </div>
        </div>

        <div class="welcome-hero-art" aria-hidden="true">
          <div class="welcome-building">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="welcome-quote">
            <div class="welcome-quote-mark">“</div>
            <p>Tu opinión y compromiso contribuyen a construir un mejor Inter-Con.</p>
            <i></i>
          </div>
        </div>
      </div>

      <div class="welcome-info-grid">
        <article class="welcome-card">
          <div class="welcome-card-icon icon-blue">◷</div>
          <h3>Duración estimada</h3>
          <div class="welcome-big-number">15 a 20<br>minutos</div>
          <p>Procura realizar la evaluación en un solo momento y sin interrupciones.</p>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-purple">👥</div>
          <h3>¿Quién participa?</h3>
          <ul class="welcome-check-list purple-list">
            <li>Tu autoevaluación.</li>
            <li>La evaluación de tu líder.</li>
            <li>Retroalimentación para tu desarrollo.</li>
          </ul>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-yellow">★</div>
          <h3>Antes de comenzar</h3>
          <ul class="welcome-check-list yellow-list">
            <li>Responde con honestidad y objetividad.</li>
            <li>Considera tu desempeño durante el periodo evaluado.</li>
            <li>Lee cuidadosamente cada pregunta.</li>
          </ul>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-green">▣</div>
          <h3>Confidencialidad</h3>
          <p>Tus respuestas serán tratadas de forma confidencial y se utilizarán exclusivamente para apoyar tu desarrollo y fortalecer nuestro proceso de gestión del desempeño.</p>
        </article>

        <article class="welcome-card welcome-card-integracion">
          <div class="welcome-card-icon icon-blue">◔</div>
          <h3>¿Cómo se integra?</h3>
          <p class="welcome-integracion-title"><strong>Valores y Actitud 40%</strong> +<br><strong>Técnica Funcional 60%</strong></p>
          <div class="welcome-weight-list">
            <span><i class="dot-blue"></i>Valores y Actitud <b>40%</b></span>
            <span><i class="dot-purple"></i>Conocimientos y Habilidades Técnicas <b>30%</b></span>
            <span><i class="dot-green"></i>Cumplimiento de Objetivos <b>30%</b></span>
          </div>
        </article>
      </div>


      <div class="welcome-actions">
        ${retroDisponible
          ? `<a class="btn welcome-start-btn" href="${personalRoute('retroalimentacion')}">→&nbsp;&nbsp;Conocer mi retroalimentación</a>`
          : evaluacionEnviada
            ? `<div class="welcome-process-status"><strong>✓ Tu autoevaluación ya fue enviada</strong><span>El proceso continúa con tu líder y Desarrollo Organizacional. Te notificaremos cuando tu retroalimentación esté disponible.</span></div>`
            : `<button class="btn welcome-start-btn" onclick="App.comenzarEvaluacion()">→&nbsp;&nbsp;${enProgreso ? 'Continuar mi evaluación' : 'Comenzar mi evaluación'}</button>`}
        <div class="welcome-important">◈ &nbsp;Tu evaluación es importante</div>
      </div>
    </section>`;
  }

  function viewReadOnlyEvaluationIntegration(col, estado) {
    const mine = state.remote.mine || {};
    const ev = mine.evaluation;
    return `<section class="card backend-integration-card"><span class="admin-section-kicker">BACKEND INTEGRATION V1</span><h2>${esc(col.nombre)}</h2><p>La lectura de tu evaluación ya está conectada a n8n + Airtable.</p><div class="info-grid"><div><span class="label">Periodo</span><span class="value">${esc(state.periodo.nombre)}</span></div><div><span class="label">Estado backend</span>${badge(estado)}</div><div><span class="label">ID evaluación</span><span class="value">${esc(ev ? (ev.evaluationId || ev.id || '—') : 'Aún no creada')}</span></div><div><span class="label">Sincronización</span><span class="value">${state.remote.lastSync ? new Date(state.remote.lastSync).toLocaleString('es-MX') : '—'}</span></div></div><div class="alert alert-info"><strong>Lectura real activa.</strong> La captura/guardado todavía no se enviará al backend hasta conectar los endpoints de escritura en la siguiente fase.</div><button class="btn btn-outline" onclick="App.recargarBackend()">Actualizar desde backend</button></section>`;
  }

  function viewEnvioExitoso(col, yaEnviada) {
    return `
    <section class="premium-success-page">
      <div class="premium-success-icon">✓</div>
      <div class="premium-success-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <h1>${yaEnviada ? 'Tu evaluación ya fue enviada' : '¡Evaluación enviada con éxito!'}</h1>
      <p>Gracias por tu participación, ${esc((col.nombre || '').split(/\s+/)[0] || '')}.</p>
      <div class="premium-success-note"><span>✉</span><div><strong>Tu autoevaluación ha sido registrada correctamente.</strong><small>Tu líder recibirá la notificación correspondiente para continuar con el proceso.</small></div></div>
      <a class="btn btn-primary premium-success-home" href="${personalRoute('inicio')}">⌂ &nbsp; Ir al inicio</a>
      <div class="premium-success-footer">◇ &nbsp; Tu compromiso impulsa tu desarrollo y el éxito de Inter-Con.</div>
    </section>`;
  }

  function viewColaboradorInicio(col, periodoId, estado) {
    const autoEval = S.getEvaluacion(col.empleado, periodoId, 'autoevaluacion');
    let avance = 0;
    if (autoEval) {
      const total = D.COMPETENCIAS.actitud.length + D.COMPETENCIAS.habilidades.length + 1;
      const respondidas = S.getRespuestas(autoEval.id).length;
      const objetivosOk = S.getObjetivos(autoEval.id).some((o) => o.descripcion && o.descripcion.trim());
      avance = pct(((respondidas + (objetivosOk ? 1 : 0)) / total) * 100);
    }
    const vencida = esVencido(state.periodo.fechaLimiteAutoevaluacion) && estado === D.ESTADOS.NO_INICIADA;
    const liderDirecto = S.getLider(col.liderId);

    let accion = '';
    if (estado === D.ESTADOS.NO_INICIADA || estado === D.ESTADOS.EN_PROGRESO) {
      accion = `<a class="btn btn-primary" href="#/${estado === D.ESTADOS.NO_INICIADA ? 'colaborador/bienvenida' : 'colaborador/autoevaluacion'}">${estado === D.ESTADOS.NO_INICIADA ? 'Iniciar autoevaluación' : 'Continuar autoevaluación'}</a>`;
    } else if (estado === D.ESTADOS.RETRO_PENDIENTE || estado === D.ESTADOS.CERRADA) {
      accion = `<a class="btn btn-primary" href="${personalRoute('retroalimentacion')}">Conocer mi retroalimentación</a>`;
    } else {
      accion = `<p class="muted">Tu autoevaluación fue enviada. El proceso continúa con la evaluación de tu líder y la calibración de RH.</p>`;
    }

    return `
    <div class="card">
      <h2>Hola, ${esc(col.nombre)}</h2>
      <p class="muted">${esc(col.puesto)} · ${esc(col.area)} · ${esc(col.ciudad)}</p>
      <div class="info-grid">
        <div><span class="label">Periodo activo</span><span class="value">${esc(state.periodo.nombre)}</span></div>
        <div><span class="label">Estado</span>${badge(estado)}</div>
        <div><span class="label">Líder directo</span><span class="value">${esc(liderDirecto ? liderDirecto.nombre : '—')}</span></div>
        <div><span class="label">Fecha límite autoevaluación</span><span class="value">${state.periodo.fechaLimiteAutoevaluacion}${vencida ? ' ' + badge('Vencida', 'red') : ''}</span></div>
      </div>
      <div class="progress-wrap">${progressBar(avance)}</div>
      <div class="actions">${accion}</div>
    </div>`;
  }

  function ensureWizard(col, periodoId) {
    const ev = S.getOrCreateEvaluacion(col.empleado, col.liderId, periodoId, 'autoevaluacion');
    if (apiWriteMode() && !ev.backendId && state.remote.mine && state.remote.mine.evaluation) {
      const db=S.load(); const real=db.evaluaciones.find(e=>e.id===ev.id); if(real){ real.backendId=state.remote.mine.evaluation.evaluationId || state.remote.mine.evaluation.id || ''; S.persist(); }
    }
    if (state.wizard.evaluacionId !== ev.id) { state.wizard = { seccionIdx: 0, evaluacionId: ev.id, tipo: 'autoevaluacion', colaboradorId: col.empleado, liderId: col.liderId }; }
    return ev;
  }

  const SECCIONES_WIZARD = ['actitud', 'habilidades', 'objetivos', 'resumen'];
  const HERRAMIENTAS_B2 = [
    ['excel','Excel'],['office','Word y PowerPoint'],['outlook','Outlook'],['teams','Teams / SharePoint / OneDrive'],
    ['concur','Concur'],['internos','Sistemas internos de Inter-Con'],['portales','Portales de clientes / CFDI'],
    ['analisis','Power BI / herramientas de análisis'],['ia','Manejo de IA']
  ];

  function viewAutoevaluacion(col, periodoId, estado) {
    const ev = ensureWizard(col, periodoId);
    if (ev.estado === D.ESTADOS.COMPLETADA) {
      return viewEnvioExitoso(col, true);
    }
    const idx = state.wizard.seccionIdx;
    const seccion = SECCIONES_WIZARD[idx];
    const progreso = Math.round(((idx + (seccion === 'resumen' ? 1 : 0)) / SECCIONES_WIZARD.length) * 100);
    const respuestasPorSeccion = S.getRespuestasPorSeccion(ev.id);
    const counts = {
      actitud: (respuestasPorSeccion.actitud || []).filter(r => r.valor !== '' && r.valor !== null && r.valor !== undefined).length,
      habilidades: (respuestasPorSeccion.habilidades || []).filter(r => r.valor !== '' && r.valor !== null && r.valor !== undefined).length,
      objetivos: S.getObjetivos(ev.id).filter(o => (o.descripcion || '').trim() && o.calificacion).length
    };
    const total = { actitud:D.COMPETENCIAS.actitud.length, habilidades:D.COMPETENCIAS.habilidades.length, objetivos:5 };

    let contenido = '';
    if (seccion === 'objetivos') contenido = renderObjetivosForm(ev, false);
    else if (seccion === 'resumen') contenido = renderResumenAuto(ev);
    else contenido = renderSeccionForm(ev, seccion, false);

    const sideSections = ['actitud','habilidades','objetivos'].map((s,i) => `
      <button class="premium-section-step ${seccion === s ? 'active' : ''} ${i < idx ? 'done' : ''}" onclick="App.irSeccionWizard(${i})">
        <span><strong>${labelSeccion(s)}</strong><small>${s === 'actitud' ? 'Eje ACTITUD' : 'Eje DESEMPEÑO'}</small></span>
        <b>${s==='objetivos' && ev.objetivosNoAplican ? 'N/A' : counts[s]+'/'+total[s]}</b>
      </button>`).join('');

    return `
    ${apiWriteMode() ? `<div class="alert alert-success backend-test-capture-note"><strong>Guardado real activo.</strong> Tus avances se guardan mediante n8n en Airtable. Puedes salir y continuar después.</div>` : (apiTestCaptureMode() ? `<div class="alert alert-info backend-test-capture-note"><strong>Modo de prueba funcional.</strong> Puedes completar y enviar esta evaluación para validar el flujo visual. La captura se guarda únicamente en este navegador y todavía no modifica Airtable.</div>` : '')}
    <section class="premium-evaluation-page">
      <div class="premium-progress-head"><div><span>Progreso general</span><div class="progress"><div class="progress-bar" style="width:${progreso}%"></div></div></div><strong>${progreso}%</strong></div>
      <div class="premium-evaluation-layout">
        <aside class="premium-evaluation-sidebar">
          ${sideSections}
          <div class="premium-reminder-card"><strong>Recordatorio</strong><p>Puedes guardar tu progreso en cualquier momento. Tu evaluación es confidencial.</p></div>
          ${escalaSidebarHTML()}
        </aside>
        <div class="premium-evaluation-main">
          <div class="premium-evaluation-title">${seccion !== 'resumen' && D.SECCIONES_META[seccion] ? `<div class="premium-section-weight">Peso de la sección: <strong>${D.SECCIONES_META[seccion].peso}%</strong></div>` : ''}<span class="premium-section-kicker">${seccion === 'resumen' ? 'Revisión final' : 'Sección ' + (idx + 1) + ' de 3'}</span><h1>${labelSeccion(seccion)}</h1></div>
          ${contenido}
          <div class="wizard-nav premium-wizard-nav">
            <button class="btn btn-outline" ${idx === 0 ? 'disabled' : ''} onclick="App.wizardPrev()">← Anterior</button>
            <button class="btn btn-outline premium-save-btn" onclick="App.guardarProgresoVisual()">Guardar progreso</button>
            ${seccion === 'resumen'
              ? `<label class="confirm-check premium-confirm premium-confirm-large"><input type="checkbox" id="confirmEnvioAuto"/> Confirmo que la información capturada es correcta.</label><button class="btn btn-primary premium-next-btn" onclick="App.enviarAutoevaluacion()">Finalizar y enviar ✓</button>`
              : `<button class="btn btn-primary premium-next-btn" onclick="App.wizardNext('${seccion}')">Siguiente →</button>`}
          </div>
        </div>
      </div>
    </section>`;
  }

  function labelSeccion(s) {
    return { actitud: 'A. Valores y Actitud', habilidades: 'B. Conocimientos y Habilidades Técnicas', conocimientos: 'Sección interna', objetivos: 'C. Cumplimiento de Objetivos', resumen: 'Resumen y envío' }[s];
  }

  function renderSeccionForm(ev, seccion, soloLectura) {
    const meta = D.SECCIONES_META[seccion];
    const competencias = D.COMPETENCIAS[seccion];
    const respuestas = S.getRespuestasPorSeccion(ev.id)[seccion];
    const mapVal = {}; respuestas.forEach((r) => { mapVal[r.competenciaId] = r; });
    return `
    <p class="muted">${esc(meta.descripcion)}</p>
    ${escalaHelpInline()}
    ${competencias.map((c) => renderCompetenciaCard(ev.id, seccion, c, mapVal[c.id], soloLectura)).join('')}
    `;
  }

  function escalaHelpInline() {
    // Rev.4 UX: la escala ya no se repite dentro de cada sección. Se mantiene
    // siempre visible en la barra lateral para evitar ruido y desplazamientos.
    return '';
  }

  function escalaSidebarHTML() {
    const rows = [
      { n: 5, label: 'Excede significativamente' },
      { n: 4, label: 'Supera expectativas' },
      { n: 3, label: 'Cumple lo esperado' },
      { n: 2, label: 'Cumple parcialmente' },
      { n: 1, label: 'No cumple' }
    ];
    return `<div class="premium-scale-card" aria-label="Escala de evaluación permanente">
      <div class="premium-scale-title"><strong>Escala de evaluación</strong></div>
      <div class="premium-scale-list">${rows.map((r) => `<div class="premium-scale-row"><span class="premium-scale-stars">${'★'.repeat(r.n)}${'☆'.repeat(5-r.n)}</span><span><b>${r.n}</b> ${r.label}</span></div>`).join('')}</div>
      <div class="premium-scale-na"><b>N/A</b><span>No aplica o no hay elementos suficientes.</span></div>
    </div>`;
  }

  /**
   * Widget de calificación en estrellas (1-5) + pastilla N/A, en reemplazo del
   * <select> plano. Los 5 radios comparten "groupName" con el radio N/A para
   * que sean mutuamente excluyentes; el relleno visual usa el truco CSS de
   * hermanos generales (~) sobre <label class="star">, ver styles.css.
   */
  function ratingWidget(groupName, valorActual, onchangeJs, disabled, compact, allowNA = true) {
    const safeGroup = String(groupName).replace(/[^a-zA-Z0-9_-]/g, '_');
    const estrellas = [5, 4, 3, 2, 1].map((v) => {
      const id = safeGroup + '_s' + v;
      const checked = String(valorActual) === String(v);
      const descEntry = D.ESCALA.find((e) => String(e.valor) === String(v));
      const tip = descEntry ? (v + ' — ' + descEntry.descripcion) : String(v);
      return `<input type="radio" name="${safeGroup}" id="${id}" value="${v}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="${onchangeJs}"/><label class="star" for="${id}" title="${esc(tip)}">★</label>`;
    }).join('');
    const idNA = safeGroup + '_na';
    const checkedNA = String(valorActual) === 'N/A';
    const vacio = valorActual === '' || valorActual === null || valorActual === undefined;
    return `<div class="rating-widget${disabled ? ' rating-readonly' : ''}${compact ? ' rating-compact' : ''}">
      <div class="star-rating">${estrellas}</div>
      ${allowNA ? `<input type="radio" class="na-radio" name="${safeGroup}" id="${idNA}" value="N/A" ${checkedNA ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="${onchangeJs}"/><label class="na-pill" for="${idNA}" title="No aplica o sin elementos suficientes para evaluar">N/A</label>` : '<span class="required-tool-pill">Obligatorio</span>'}
      ${vacio ? '<span class="rating-empty-hint">Sin calificar</span>' : ''}
    </div>`;
  }

  function renderCompetenciaCard(evaluacionId, seccion, c, respuesta, soloLectura) {
    const valor = respuesta ? respuesta.valor : '';
    const comentario = respuesta ? respuesta.comentario : '';
    const groupName = 'rate_' + evaluacionId + '_' + c.id;
    const onchangeJs = `App.rate('${evaluacionId}','${seccion}','${c.id}',this.value)`;
    const esHerramientas = c.id === 'B2';
    const tools = esHerramientas ? S.getHerramientasEvaluacion(evaluacionId) : {};
    const toolValues = esHerramientas ? HERRAMIENTAS_B2.map(([id]) => tools[id]).filter(v => v !== undefined && v !== '' && v !== null && v !== 'N/A').map(Number).filter(Number.isFinite) : [];
    const toolAvg = toolValues.length ? C.round1(toolValues.reduce((a,b)=>a+b,0)/toolValues.length) : null;
    return `
    <div class="competency-card competency-card-fixed" data-competencia-id="${esc(c.id)}">
      <div class="competency-topline">
        <div class="competency-title-block"><strong>${esc(c.nombre)}</strong><span class="peso-tag">${c.peso}%</span></div>
        <div class="competency-rate competency-rate-fixed">
          <label>${esHerramientas ? 'Promedio de herramientas' : 'Calificación'}</label>
          ${esHerramientas ? `<div class="tools-average ${toolAvg===null?'empty':''}"><strong>${toolAvg===null?'—':f1(toolAvg)}</strong><span>/ 5</span><small>${toolValues.length} herramienta${toolValues.length===1?'':'s'} evaluada${toolValues.length===1?'':'s'}</small></div>` : ratingWidget(groupName, valor, onchangeJs, soloLectura, false)}
        </div>
      </div>
      ${esHerramientas ? `<p class="tools-intro">Califica las herramientas que aplican a tu puesto. Usa N/A cuando no corresponda. <b>Manejo de IA es obligatorio para todos</b> y no admite N/A. El promedio se calcula automáticamente.</p>
        <div class="tools-rating-grid">${HERRAMIENTAS_B2.map(([id,nombre]) => {
          const g='tool_'+evaluacionId+'_'+id; const v=tools[id]??''; const change=`App.rateHerramienta('${evaluacionId}','${seccion}','${id}',this.value)`;
          return `<div class="tool-rating-row"><div><strong>${esc(nombre)}</strong></div>${ratingWidget(g,v,change,soloLectura,true,id!=='ia')}</div>`;
        }).join('')}</div>` : `<ul class="conductas conductas-below">${c.conductas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`}
      ${!soloLectura ? `<div class="validation-message" aria-live="polite">${esHerramientas?'Califica al menos una herramienta aplicable para continuar.':'Selecciona una calificación para continuar.'}</div><textarea class="comentario-box" placeholder="Comentario (opcional)" onchange="App.comentar('${evaluacionId}','${seccion}','${c.id}',this.value)">${esc(comentario)}</textarea>` : (comentario ? `<div class="comentario-lectura">${esc(comentario)}</div>` : '')}
    </div>`;
  }

  function evaluarSmartObjetivo(o) {
    const descripcion = String(o.descripcion || '').trim();
    const meta = String(o.meta || '').trim();
    const fecha = String(o.fechaCompromiso || '').trim();
    const palabras = descripcion.split(/\s+/).filter(Boolean);
    const verbos = /\b(incrementar|reducir|disminuir|aumentar|mejorar|alcanzar|lograr|implementar|completar|mantener|desarrollar|optimizar|automatizar|entregar|cumplir|capacitar|generar|crear|fortalecer|elevar|bajar)\b/i;
    const especifico = palabras.length >= 7 && verbos.test(descripcion);
    const medible = !!meta || /\d|%|porcentaje|indicador|kpi|cantidad|número|numero|tasa|índice|indice/i.test(descripcion);
    const alcanzable = !!o.alcanzable;
    const relevante = !!o.relevante;
    const temporal = !!fecha || /\b(20\d{2}|q[1-4]|trimestre|mes|semana|antes del|a más tardar|al \d{1,2}|durante)\b/i.test(descripcion);
    const criterios = { S: especifico, M: medible, A: alcanzable, R: relevante, T: temporal };
    return { criterios, completo: Object.values(criterios).every(Boolean), total: Object.values(criterios).filter(Boolean).length };
  }

  function smartChecklistHTML(o, evaluacionId, index, soloLecturaDescripcion) {
    const smart = evaluarSmartObjetivo(o);
    const item = (k, label) => `<span class="smart-pill ${smart.criterios[k] ? 'ok' : 'pending'}"><b>${k}</b>${smart.criterios[k] ? '✓' : '•'} ${label}</span>`;
    return `<div class="smart-validator ${smart.completo ? 'smart-ok' : ''}">
      <div class="smart-validator-head"><strong>Validación SMART</strong><span>${smart.total}/5 criterios</span></div>
      <div class="smart-pills">
        ${item('S','Específico')}${item('M','Medible')}${item('A','Alcanzable')}${item('R','Relevante')}${item('T','Temporal')}
      </div>
      ${smart.completo ? '<p class="smart-status ok">✓ Este objetivo cumple con los criterios SMART.</p>' : '<p class="smart-status">Completa los criterios pendientes antes de continuar.</p>'}
      ${!soloLecturaDescripcion ? `<div class="smart-confirmations">
        <label><input type="checkbox" ${o.alcanzable ? 'checked' : ''} onchange="App.editarObjetivoSmart('${evaluacionId}',${index},'alcanzable',this.checked)"> A — Es alcanzable con los recursos y responsabilidades disponibles.</label>
        <label><input type="checkbox" ${o.relevante ? 'checked' : ''} onchange="App.editarObjetivoSmart('${evaluacionId}',${index},'relevante',this.checked)"> R — Está relacionado con las responsabilidades del puesto o prioridades del área.</label>
      </div>` : ''}
    </div>`;
  }

  // =========================================================================
  // ASISTENTE DE IA PARA OBJETIVOS SMART ("✨ Ayúdame con IA")
  // ---------------------------------------------------------------------------
  // La IA es solo un asistente de REDACCIÓN: nunca guarda, envía ni aprueba
  // nada automáticamente. El usuario siempre decide: aceptar, editar o
  // descartar. Después de aceptar, el objetivo pasa por evaluarSmartObjetivo()
  // (la validación SMART que YA EXISTE) exactamente igual que si el usuario
  // lo hubiera escrito a mano — este módulo no la reemplaza ni la duplica.
  //
  // Arquitectura: FRONTEND -> api.js (EDDApi.ai.generateSmartObjective) -> n8n
  // -> proveedor de IA -> n8n -> FRONTEND. Nunca se llama a un proveedor de
  // IA directamente ni se coloca una API key en el frontend. En modo demo no
  // hay llamada de red: se genera una propuesta simulada localmente (ver
  // generarPropuestaSimuladaIA), dejando explícito en consola que es un mock.
  // =========================================================================
  state.aiSmart = {
    open: false,
    evaluacionId: null,
    index: null,
    idea: '',
    loading: false,
    error: null,
    proposal: null,       // { objective, indicator, suggestedDeadline, smart:{...} }
    deadlineHints: {}      // { [evaluacionId+':'+index]: 'texto de plazo sugerido' } — ver requerimiento 9 del brief
  };

  const AI_IDEA_MIN = 5;
  const AI_IDEA_MAX = 500;

  Object.assign(EN, {
    '✨ Ayúdame con IA': '✨ Help me with AI',
    'Convierte tu idea en un objetivo SMART': 'Turn your idea into a SMART objective',
    'Describe brevemente qué quieres lograr. La IA te ayudará a estructurarlo; podrás editar la propuesta antes de utilizarla.': 'Briefly describe what you want to achieve. AI will help you structure it; you can edit the suggestion before using it.',
    '¿Qué quieres lograr?': 'What do you want to achieve?',
    'Ej. mejorar la capacitación del equipo': 'E.g. improve team training',
    '✨ Generar propuesta SMART': '✨ Generate SMART suggestion',
    'Generando propuesta...': 'Generating suggestion...',
    'PROPUESTA SMART': 'SMART SUGGESTION',
    'Objetivo específico': 'Specific objective',
    'Meta / indicador': 'Target / indicator',
    'Plazo sugerido': 'Suggested deadline',
    'Usar esta propuesta': 'Use this suggestion',
    'Editar': 'Edit',
    'Generar otra': 'Generate another',
    'Cancelar': 'Cancel',
    'Cerrar': 'Close',
    'La propuesta generada es una ayuda de redacción. Revisa y valida la información antes de utilizarla.': 'AI-generated suggestions are writing assistance. Review and validate the information before using them.',
    'No fue posible generar la propuesta en este momento. Puedes continuar redactando el objetivo manualmente.': "We couldn't generate a suggestion right now. You can continue writing your objective manually.",
    'Escribe al menos 5 caracteres para describir tu idea.': 'Write at least 5 characters to describe your idea.',
    'caracteres': 'characters',
    'S — Específico': 'S — Specific', 'M — Medible': 'M — Measurable', 'A — Alcanzable': 'A — Achievable',
    'R — Relevante': 'R — Relevant', 'T — Temporal': 'T — Time-bound',
    'Describe qué quieres lograr antes de generar una propuesta.': 'Describe what you want to achieve before generating a suggestion.'
  });

  function claveHintPlazo(evaluacionId, index) { return evaluacionId + ':' + index; }

  // Genera una propuesta SMART simulada (modo demo, sin backend). Determinista
  // y basada en plantillas simples a partir de la idea capturada — nunca
  // pretende ser una conexión real a un modelo de IA (ver requerimiento 19).
  function generarPropuestaSimuladaIA(idea, language) {
    const ideaLimpia = idea.trim().replace(/\.+$/, '');
    if (language === 'en') {
      return {
        objective: `Improve the current level of "${ideaLimpia}" through a measurable action plan with follow-up over the next 3 months.`,
        indicator: `Percentage of progress on "${ideaLimpia}" (baseline to be confirmed with your manager)`,
        suggestedDeadline: '3 months',
        smart: {
          specific: `Focuses on improving "${ideaLimpia}" through concrete, trackable actions.`,
          measurable: 'A percentage or indicator is suggested; confirm the exact baseline and target with your manager.',
          achievable: 'A progressive improvement with follow-up actions is proposed — validate that it is realistic with your available resources.',
          relevant: 'Contributes to the objectives of your role and area; confirm it aligns with current priorities.',
          timeBound: 'Should be achieved within the next 3 months; select the exact commitment date manually.'
        }
      };
    }
    return {
      objective: `Mejorar el nivel actual de "${ideaLimpia}" mediante un plan de acción medible con seguimiento durante los próximos 3 meses.`,
      indicator: `Porcentaje de avance de "${ideaLimpia}" (línea base por confirmar con tu líder)`,
      suggestedDeadline: '3 meses',
      smart: {
        specific: `Se enfoca en mejorar "${ideaLimpia}" mediante acciones concretas y medibles.`,
        measurable: 'Se sugiere un porcentaje o indicador; confirma la línea base y la meta exacta con tu líder.',
        achievable: 'Se plantea una mejora progresiva con acciones de seguimiento — valida que sea realista con tus recursos disponibles.',
        relevant: 'Contribuye a los objetivos de tu puesto y área; confirma que esté alineado con las prioridades actuales.',
        timeBound: 'Debe alcanzarse dentro de los próximos 3 meses; selecciona la fecha de compromiso exacta manualmente.'
      }
    };
  }

  // Orquesta demo/api sin que la vista sepa cuál corrió — ver requerimientos
  // 19-21 del brief (modo demo simulado localmente, modo api vía EDDApi.ai,
  // nunca fetch() dentro de app.js).
  function generarPropuestaSmartIA(idea, language, employeeContext) {
    if (global.APP_CONFIG.mode === 'demo') {
      console.log('[DEMO] AI SMART suggestion generated locally');
      return new Promise((resolve) => {
        setTimeout(() => resolve(generarPropuestaSimuladaIA(idea, language)), 700); // simula latencia realista del panel de carga
      });
    }
    return (async () => {
      const resp = await global.EDDApi.ai.generateSmartObjective(idea, language, employeeContext);
      if (!resp || resp.success !== true || !resp.data) {
        throw new Error((resp && resp.message) || 'Respuesta inválida del asistente de IA.');
      }
      return resp.data;
    })();
  }

  function renderAiSmartModal() {
    let host = document.getElementById('aiSmartModalHost');
    if (!state.aiSmart.open) { if (host) host.remove(); return; }
    if (!host) {
      host = document.createElement('div');
      host.id = 'aiSmartModalHost';
      document.body.appendChild(host);
    }
    const ai = state.aiSmart;
    host.innerHTML = `
    <div class="ai-smart-overlay" id="aiSmartOverlay" role="presentation">
      <div class="ai-smart-modal" role="dialog" aria-modal="true" aria-label="${esc(t('Convierte tu idea en un objetivo SMART'))}">
        <div class="ai-smart-modal-header">
          <div class="ai-smart-modal-title"><span class="ai-smart-sparkle" aria-hidden="true">✨</span>Convierte tu idea en un objetivo SMART</div>
          <button type="button" class="ai-smart-modal-close" onclick="App.cerrarAsistenteIA()" aria-label="${esc(t('Cerrar'))}">×</button>
        </div>
        <div class="ai-smart-modal-body">
          ${ai.loading ? renderAiSmartLoading() : (ai.proposal ? renderAiSmartPreview(ai.proposal) : renderAiSmartForm(ai))}
        </div>
        <p class="ai-smart-disclaimer">La propuesta generada es una ayuda de redacción. Revisa y valida la información antes de utilizarla.</p>
      </div>
    </div>`;
    translateDOM(host);
    const overlay = document.getElementById('aiSmartOverlay');
    if (overlay) overlay.addEventListener('mousedown', (ev) => { if (ev.target === overlay) Actions.cerrarAsistenteIA(); });
    const textarea = document.getElementById('aiSmartIdeaInput');
    if (textarea) { textarea.focus(); const v = textarea.value; textarea.setSelectionRange(v.length, v.length); }
  }

  function renderAiSmartForm(ai) {
    const len = (ai.idea || '').length;
    const puedeGenerar = len >= AI_IDEA_MIN && len <= AI_IDEA_MAX;
    return `
    <p class="ai-smart-intro">Describe brevemente qué quieres lograr. La IA te ayudará a estructurarlo; podrás editar la propuesta antes de utilizarla.</p>
    <div class="ai-smart-field">
      <label for="aiSmartIdeaInput">¿Qué quieres lograr?</label>
      <textarea id="aiSmartIdeaInput" maxlength="${AI_IDEA_MAX}" placeholder="${esc(t('Ej. mejorar la capacitación del equipo'))}" oninput="App.actualizarIdeaIA(this.value)">${esc(ai.idea || '')}</textarea>
      <div class="ai-smart-counter">${len}/${AI_IDEA_MAX} ${t('caracteres')}</div>
      ${ai.error ? `<p class="ai-smart-error" role="alert" aria-live="polite">⚠ ${esc(ai.error)}</p>` : ''}
    </div>
    <div class="ai-smart-actions">
      <button type="button" class="btn btn-outline" onclick="App.cerrarAsistenteIA()">Cancelar</button>
      <button type="button" class="btn btn-primary ai-smart-generate" ${puedeGenerar ? '' : 'disabled'} onclick="App.generarPropuestaIA()">✨ Generar propuesta SMART</button>
    </div>`;
  }

  function renderAiSmartLoading() {
    return `<div class="ai-smart-loading" role="status" aria-live="polite">
      <span class="ai-smart-spinner" aria-hidden="true"></span>
      <p>Generando propuesta...</p>
    </div>`;
  }

  function renderAiSmartPreview(p) {
    const smartRow = (label, text) => `<div class="ai-smart-criterion"><b>${esc(label)}</b><span>${esc(text)}</span></div>`;
    return `
    <div class="ai-smart-preview">
      <div class="ai-smart-preview-kicker">PROPUESTA SMART</div>
      <div class="ai-smart-field">
        <label for="aiSmartObjectiveInput">Objetivo específico</label>
        <textarea id="aiSmartObjectiveInput">${esc(p.objective)}</textarea>
      </div>
      <div class="ai-smart-field">
        <label for="aiSmartIndicatorInput">Meta / indicador</label>
        <textarea id="aiSmartIndicatorInput">${esc(p.indicator)}</textarea>
      </div>
      ${p.suggestedDeadline ? `<div class="ai-smart-deadline"><b>Plazo sugerido</b><span>${esc(p.suggestedDeadline)}</span></div>` : ''}
      <div class="ai-smart-criteria">
        ${smartRow(t('S — Específico'), p.smart.specific)}
        ${smartRow(t('M — Medible'), p.smart.measurable)}
        ${smartRow(t('A — Alcanzable'), p.smart.achievable)}
        ${smartRow(t('R — Relevante'), p.smart.relevant)}
        ${smartRow(t('T — Temporal'), p.smart.timeBound)}
      </div>
    </div>
    <div class="ai-smart-actions ai-smart-actions--preview">
      <button type="button" class="btn btn-outline" onclick="App.cerrarAsistenteIA()">Cancelar</button>
      <button type="button" class="btn btn-outline" onclick="App.editarPropuestaIA()">Editar</button>
      <button type="button" class="btn btn-outline" onclick="App.regenerarPropuestaIA()">Generar otra</button>
      <button type="button" class="btn btn-primary" onclick="App.usarPropuestaIA()">Usar esta propuesta</button>
    </div>`;
  }

  function objectivesAckKey(evaluacionId) { return `edd_obj_ack_rev4_${evaluacionId}`; }
  function objetivosComprendidos(evaluacionId) { return sessionStorage.getItem(objectivesAckKey(evaluacionId)) === '1'; }

  function numeroObjetivo(valor) {
    if (valor === null || valor === undefined) return null;
    const limpio = String(valor).trim().replace(/%/g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
    if (!limpio || limpio === '-' || limpio === '.') return null;
    const n = Number(limpio);
    return Number.isFinite(n) ? n : null;
  }

  function cumplimientoAutomatico(meta, resultado) {
    const m = numeroObjetivo(meta);
    const r = numeroObjetivo(resultado);
    if (m === null || r === null || m === 0) return '';
    const pctValue = (r / m) * 100;
    return Math.round(pctValue * 10) / 10;
  }

  function evaluacionSinObjetivos(evaluacionId) {
    const ev = S.load().evaluaciones.find((e) => e.id === evaluacionId);
    return !!(ev && ev.objetivosNoAplican);
  }

  function renderObjetivosForm(ev, soloLecturaDescripcion) {
    const objetivos = S.getObjetivos(ev.id);
    const filas = [];
    const comprendido = objetivosComprendidos(ev.id);
    const noAplican = !!ev.objetivosNoAplican;
    for (let i = 0; i < Math.max(objetivos.length, 1); i++) {
      filas.push(objetivos[i] || { index: i, descripcion: '', meta: '', resultado: '', cumplimiento: '', noCuantificable: false, calificacion: '' });
    }
    return `
    <div class="kpi-workspace kpi-workspace-stacked">
      <section class="kpi-guide-wide ${comprendido ? 'acknowledged' : ''}" aria-label="Guía de objetivos del periodo">
        <div class="kpi-guide-wide-copy">
          <div class="smart-guide-badge">OBJETIVOS DEL PERIODO · 30%</div>
          <h3>Antes de capturar, revisa cómo se califican tus objetivos</h3>
          <p>Registra hasta cinco objetivos. Captura qué meta se acordó y cuál fue el resultado final. El porcentaje y la calificación se calculan automáticamente.</p>
          <div class="kpi-equivalence-inline">
            <span><b>5 ★</b> 110% o más</span><span><b>4 ★</b> 100–109%</span><span><b>3 ★</b> 90–99%</span><span><b>2 ★</b> 75–89%</span><span><b>1 ★</b> &lt;75%</span>
          </div>
        </div>
        <button type="button" class="btn ${comprendido ? 'btn-ack-done' : 'btn-primary'} kpi-understand-btn" onclick="App.comprenderObjetivos('${ev.id}')" ${comprendido ? 'disabled' : ''}>${comprendido ? '✓ Comprendido' : 'Comprendo lo que dice'}</button>
      </section>
      <section class="smart-capture-panel kpi-capture-full ${comprendido ? '' : 'kpi-capture-locked'}" aria-disabled="${comprendido ? 'false' : 'true'}">
        <div class="smart-capture-head">
          <div><span class="smart-capture-kicker">CUMPLIMIENTO DE OBJETIVOS · 30%</span><h3>Captura tus objetivos</h3><p><b>Meta acordada</b> = lo que debías lograr · <b>Resultado alcanzado</b> = lo que realmente lograste. El sistema calcula el cumplimiento y la calificación.</p></div>
          <div class="smart-capture-chip">REV. 4</div>
        </div>
        ${comprendido ? '' : '<div class="kpi-lock-message">🔒 Confirma que comprendiste la guía superior para habilitar la captura.</div>'}
        <div class="objective-na-choice ${noAplican ? 'selected' : ''}">
          <label class="objective-na-check"><input type="checkbox" ${noAplican ? 'checked' : ''} ${comprendido ? '' : 'disabled'} onchange="App.toggleObjetivosNoAplican('${ev.id}',this.checked)"/><span><strong>No tuve objetivos definidos en este periodo</strong><small>Esta opción existe porque este primer ciclo también busca detectar puestos o equipos que operaron sin objetivos formales. No se registra como cero.</small></span></label>
        </div>
        ${noAplican ? `<div class="objective-na-diagnostic">
          <div class="objective-na-confirmed"><span>✓</span><div><strong>Sección marcada como N/A</strong><p>La ausencia de objetivos se registrará como un dato de madurez de gestión y deberá ser validada por tu líder.</p></div></div>
          <div class="objective-na-fields">
            <label><span>Motivo principal <em>obligatorio</em></span><select onchange="App.setObjetivosNoAplicanMotivo('${ev.id}',this.value)"><option value="">Selecciona un motivo</option>${['No se definieron objetivos formales para mi puesto','Ingresé después del periodo de definición','Mi función operó sin metas documentadas','Otro'].map(x=>`<option value="${x}" ${ev.objetivosNoAplicanMotivo===x?'selected':''}>${x}</option>`).join('')}</select></label>
            <label><span>Contexto breve <em>obligatorio</em></span><textarea placeholder="Explica brevemente por qué no tuviste objetivos definidos durante el periodo." oninput="App.setObjetivosNoAplicanDetalle('${ev.id}',this.value)">${esc(ev.objetivosNoAplicanDetalle||'')}</textarea></label>
          </div>
        </div>` : `<div id="objetivosWrap">${filas.map((o, i) => renderObjetivoRow(ev.id, o, Number(o.index ?? i), soloLecturaDescripcion, !comprendido)).join('')}</div>${filas.length < 5 ? `<button class="btn btn-outline btn-sm smart-add-objective" ${comprendido ? '' : 'disabled'} onclick="App.agregarObjetivo('${ev.id}')">+ Agregar objetivo</button>` : ''}`}
      </section>
    </div>`;
  }

  function renderObjetivoRow(evaluacionId, o, index, soloLecturaDescripcion, bloqueado) {
    const calif = o.calificacion || '';
    return `<div class="objetivo-row kpi-objective-row ${bloqueado ? 'is-locked' : ''}" data-idx="${index}">
      <div class="objetivo-num">#${index + 1}</div>
      <button class="btn btn-outline btn-sm btn-remove-objective" ${bloqueado ? 'bloqueado' : ''} onclick="App.quitarObjetivo('${evaluacionId}',${index})">× Quitar</button>
      <div class="objetivo-fields kpi-objective-fields">
        <div class="form-group kpi-objective-main"><label>Objetivo</label><textarea ${bloqueado||soloLecturaDescripcion?'bloqueado':''} placeholder="Describe el objetivo acordado para el periodo" onchange="App.editarObjetivoKPI('${evaluacionId}',${index},'descripcion',this.value)">${esc(o.descripcion || '')}</textarea></div>
        <div class="kpi-objective-grid">
          <div class="form-group"><label>Meta acordada <small>¿Qué debía lograrse?</small></label><input ${bloqueado?'bloqueado':''} type="number" step="any" value="${esc(o.meta || '')}" placeholder="Ej. 95" oninput="App.editarObjetivoKPI('${evaluacionId}',${index},'meta',this.value)"/></div>
          <div class="form-group"><label>Resultado alcanzado <small>¿Qué se logró al cierre?</small></label><input ${bloqueado?'bloqueado':''} type="number" step="any" value="${esc(o.resultado || '')}" placeholder="Ej. 93" oninput="App.editarObjetivoKPI('${evaluacionId}',${index},'resultado',this.value)"/></div>
          <div class="form-group"><label>% de cumplimiento <small>Resultado ÷ meta × 100</small></label><input class="kpi-auto-field" type="text" value="${esc(o.cumplimiento === '' || o.cumplimiento == null ? '' : o.cumplimiento + '%')}" placeholder="Se calcula automáticamente" readonly tabindex="-1"/><small class="kpi-auto-note">El sistema calcula este porcentaje automáticamente y no puede editarse.</small></div>
          <div class="form-group kpi-auto-rating"><label>Calificación automática</label><div class="auto-rating-display">${calif ? `<strong>${esc(calif)}</strong><span>${'★'.repeat(Number(calif)||0)}${'☆'.repeat(Math.max(0,5-(Number(calif)||0)))}</span>` : '<strong>—</strong><span>Sin cálculo</span>'}</div></div>
        </div>
        <div class="validation-message" aria-live="polite">Completa objetivo, meta, resultado y porcentaje de cumplimiento.</div>
      </div>
    </div>`;
  }

  function renderResumenAuto(ev) {
    const secciones = ['actitud', 'habilidades'];
    const objetivos = S.getObjetivos(ev.id).filter((o) => o.descripcion && o.descripcion.trim());
    const objetivosNoAplican = !!ev.objetivosNoAplican;
    return `
    <p class="muted">Revisa tus respuestas antes de enviar. El resultado y la comparación con tu líder se mostrarán más adelante, en la fase de retroalimentación.</p>
    ${secciones.map((s) => {
      const resp = S.getRespuestasPorSeccion(ev.id)[s];
      const map = {}; resp.forEach((r) => map[r.competenciaId] = r.valor);
      return `<div class="resumen-seccion resumen-seccion-${s}"><h4>${labelSeccion(s)}</h4><table class="table table-compact"><tbody>
        ${D.COMPETENCIAS[s].map((c) => `<tr><td>${esc(c.nombre)}</td><td class="text-right">${map[c.id] !== undefined ? esc(map[c.id]) : '<span class="muted">Sin responder</span>'}</td></tr>`).join('')}
      </tbody></table></div>`;
    }).join('')}
    <div class="resumen-seccion resumen-seccion-objetivos"><h4>C. Cumplimiento de Objetivos</h4>
      ${objetivosNoAplican ? `<div class="objective-na-summary"><strong>N/A — Sin objetivos definidos en este periodo</strong><span>${esc(ev.objetivosNoAplicanMotivo||'Motivo pendiente')} · ${esc(ev.objetivosNoAplicanDetalle||'Sin contexto registrado')}.</span></div>` : (objetivos.length ? `<table class="table table-compact"><thead><tr><th>Objetivo</th><th>Meta</th><th>Resultado</th><th>%</th><th>Calif.</th></tr></thead><tbody>${objetivos.map((o) => `<tr><td>${esc(o.descripcion)}</td><td>${esc(o.meta || '—')}</td><td>${esc(o.resultado || '—')}</td><td>${esc(o.cumplimiento === '' || o.cumplimiento == null ? '—' : o.cumplimiento + '%')}</td><td class="text-right">${esc(o.calificacion)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No se registraron objetivos.</p>')}
    </div>
    <div class="form-group resumen-comments"><label>Comentarios u observaciones del colaborador</label><textarea placeholder="Agrega contexto adicional si lo consideras necesario. Si más de la mitad de una sección quedó en N/A, justifica aquí." onchange="App.setComentarios('${ev.id}',this.value)">${esc(ev.comentarios || '')}</textarea></div>`;
  }

  function inicialesAvatar(nombre) { return String(nombre || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); }

  function fmtFechaFirma(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('es-MX', { dateStyle:'medium', timeStyle:'short' }); }
    catch (_) { return esc(iso); }
  }

  function initSignaturePads() {
    document.querySelectorAll('canvas[data-signature-role]').forEach((canvas) => {
      if (canvas.dataset.bound === '1') return;
      canvas.dataset.bound = '1';
      const role = canvas.dataset.signatureRole;
      const empleado = canvas.dataset.employee;
      const periodo = canvas.dataset.period;
      const cal = S.getCalibracion(empleado, periodo);
      const saved = role === 'lider' ? cal?.firmaLiderData : cal?.firmaColaboradorData;
      const resize = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        const ctx = canvas.getContext('2d');
        ctx.setTransform(ratio,0,0,ratio,0,0);
        ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0b2d59';
        if (saved) { const img = new Image(); img.onload=()=>ctx.drawImage(img,0,0,rect.width,rect.height); img.src=saved; }
      };
      resize();
      let drawing=false, last=null;
      const pos=(e)=>{ const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
      canvas.addEventListener('pointerdown',(e)=>{ if(canvas.dataset.locked==='1')return; drawing=true; last=pos(e); canvas.setPointerCapture?.(e.pointerId); });
      canvas.addEventListener('pointermove',(e)=>{ if(!drawing||canvas.dataset.locked==='1')return; const pt=pos(e),ctx=canvas.getContext('2d');ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(pt.x,pt.y);ctx.stroke();last=pt; });
      const stop=()=>{drawing=false;last=null;}; canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('pointerleave',stop);
    });
  }

  function renderSignatureCard(role, col, periodoId, cal, lockedReason) {
    const isLeader = role === 'lider';
    const signed = isLeader ? !!cal?.firmaLider : !!cal?.firmaColaborador;
    const fecha = isLeader ? cal?.fechaFirmaLider : cal?.fechaFirmaColaborador;
    const nombre = isLeader ? cal?.firmaLiderNombre : cal?.firmaColaboradorNombre;
    const canSign = !signed && !lockedReason;
    const title = isLeader ? 'Firma del líder' : 'Firma del colaborador';
    const canvasId = `firma-${role}-${String(col.empleado).replace(/[^a-zA-Z0-9_-]/g,'')}`;
    return `<article class="signature-card ${signed?'signed':canSign?'ready':'locked'}">
      <div class="signature-card-head"><div><span class="admin-section-kicker">${signed?'CONFIRMADO':'FIRMA DIGITAL'}</span><h4>${title}</h4></div>${signed?'<span class="signature-status">✓ Firmado</span>':'<span class="signature-status pending">Pendiente</span>'}</div>
      ${signed ? `<div class="signature-signed-summary"><strong>${esc(nombre||'Firma registrada')}</strong><span>${esc(fmtFechaFirma(fecha))}</span></div>${(isLeader?cal?.firmaLiderData:cal?.firmaColaboradorData)?`<img class="signature-preview" src="${isLeader?cal.firmaLiderData:cal.firmaColaboradorData}" alt="Firma registrada"/>`:''}` : `
        ${lockedReason?`<div class="signature-lock-note">${esc(lockedReason)}</div>`:''}
        <div class="signature-canvas-wrap"><canvas id="${canvasId}" data-signature-role="${role}" data-employee="${esc(col.empleado)}" data-period="${esc(periodoId)}" data-locked="${canSign?'0':'1'}" aria-label="Área para firmar"></canvas><span>Firma dentro del recuadro</span></div>
        <div class="signature-actions"><button class="btn btn-outline btn-sm" ${canSign?'':'disabled'} onclick="App.limpiarFirma('${canvasId}')">Limpiar</button><button class="btn btn-primary btn-sm" ${canSign?'':'disabled'} onclick="App.firmarRetroalimentacion('${role}','${esc(col.empleado)}','${esc(periodoId)}','${canvasId}')">Firmar y confirmar</button></div>`}
    </article>`;
  }

  function renderOtherPartySignatureStatus(role, cal) {
    const isLeader = role === 'lider';
    const signed = isLeader ? !!cal?.firmaLider : !!cal?.firmaColaborador;
    const nombre = isLeader ? cal?.firmaLiderNombre : cal?.firmaColaboradorNombre;
    const fecha = isLeader ? cal?.fechaFirmaLider : cal?.fechaFirmaColaborador;
    const label = isLeader ? 'Firma del líder' : 'Firma del colaborador';
    return `<div class="signature-party-status ${signed?'signed':'pending'}">
      <div><span class="admin-section-kicker">ESTATUS</span><strong>${label}</strong></div>
      <div>${signed?`<span class="signature-status">✓ Firmado</span><small>${esc(nombre||'Firma registrada')} · ${esc(fmtFechaFirma(fecha))}</small>`:`<span class="signature-status pending">Pendiente</span><small>Aún no se ha registrado esta firma.</small>`}</div>
    </div>`;
  }

  function buildRetroDocument(colaboradorId, periodoId) {
    const col=S.getColaborador(colaboradorId), cal=S.getCalibracion(colaboradorId,periodoId), liderEval=S.getEvaluacion(colaboradorId,periodoId,'lider'), resLider=S.getUltimoResultadoPorOrigen(colaboradorId,periodoId,'lider'), lider=col?S.getLider(col.liderId):null;
    if(!col||!cal) return null;
    const total=cal.resultadoCalibrado!==undefined?cal.resultadoCalibrado:(resLider?.puntajes?.total??'—');
    const nivel=total==='—'?{nivel:'—'}:C.clasificarNivel(total);
    const cuad=resLider?C.asignarCuadrante(resLider?.promedios?.actitud,resLider?.promedios?.desempeno):null;
    const areas=S.getAreasOportunidad(colaboradorId,periodoId), planes=S.getPlanesDesarrollo(colaboradorId,periodoId);
    const rowsAreas=areas.length?areas.map(a=>`<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td></tr>`).join(''):'<tr><td colspan="2">No aplica.</td></tr>';
    const rowsPlanes=planes.length?planes.map(a=>`<tr><td>${esc(a.competencia)}</td><td>${esc(a.accion)}</td><td>${esc(a.fechaCompromiso||'—')}</td></tr>`).join(''):'<tr><td colspan="3">No aplica.</td></tr>';
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Retroalimentación - ${esc(col.nombre)}</title><style>body{font-family:Arial,sans-serif;color:#102a48;margin:36px;line-height:1.45}header{border-bottom:3px solid #0b5fc6;padding-bottom:18px;margin-bottom:24px}h1{margin:0;font-size:25px}h2{font-size:17px;margin-top:25px;color:#0b5fc6}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px 24px;background:#f4f8fc;padding:16px;border-radius:10px}.score{display:flex;gap:30px;align-items:center;padding:18px 0}.score b{font-size:34px;color:#0b5fc6}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #d6e1ec;padding:8px;text-align:left;font-size:12px}th{background:#edf5fe}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:34px}.sig{border-top:1px solid #7890a8;padding-top:10px;text-align:center}.sig img{max-width:220px;max-height:70px;display:block;margin:0 auto 8px}.muted{color:#687c91;font-size:12px}@media print{body{margin:18mm}.no-print{display:none}}</style></head><body><header><div class="muted">INTER-CON · Evaluación de Desempeño</div><h1>Constancia de retroalimentación</h1><div class="muted">FOR-CAP-003 Rev. 4 · ${esc(state.periodo?.nombre||periodoId)}</div></header><div class="meta"><div><b>Colaborador:</b> ${esc(col.nombre)}</div><div><b>No. empleado:</b> ${esc(col.empleado)}</div><div><b>Puesto:</b> ${esc(col.puesto||'—')}</div><div><b>Área:</b> ${esc(col.area||'—')}</div><div><b>Líder:</b> ${esc(lider?.nombre||'—')}</div><div><b>Fecha reunión:</b> ${esc(fmtFechaFirma(cal.fechaReunion))}</div></div><div class="score"><b>${esc(f1(total))}</b><div><strong>${esc(nivel.nivel||'—')}</strong><br><span class="muted">Resultado final calibrado · ${cuad?.info?`9-Box ${cuad.cuadrante}: ${esc(cuad.info.nombre)}`:'Sin clasificación 9-Box'}</span></div></div><h2>Fortalezas</h2><p>${esc(liderEval?.fortalezas||'Sin registrar.')}</p><h2>Oportunidades de desarrollo</h2><p>${esc(liderEval?.oportunidadesDesarrollo||'Sin registrar.')}</p><h2>Brechas a atender</h2><p>${esc(liderEval?.debilidadesBrechas||'Sin registrar.')}</p><h2>Riesgos o factores de atención</h2><p>${esc(liderEval?.riesgosAtencion||'Sin registrar.')}</p><h2>Síntesis del líder</h2><p>${esc(liderEval?.comentarios||'Sin comentarios.')}</p><h2>Áreas de oportunidad y plan de mejora</h2><table><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th></tr></thead><tbody>${rowsAreas}</tbody></table><h2>Plan de desarrollo</h2><table><thead><tr><th>Competencia</th><th>Acción acordada</th><th>Fecha compromiso</th></tr></thead><tbody>${rowsPlanes}</tbody></table>${cal.observacionesRH?`<h2>Observaciones de RH</h2><p>${esc(cal.observacionesRH)}</p>`:''}<div class="signatures"><div class="sig">${cal.firmaLiderData?`<img src="${cal.firmaLiderData}"/>`:''}<b>${esc(cal.firmaLiderNombre||lider?.nombre||'Líder')}</b><br><span class="muted">${cal.firmaLider?`Firmado ${esc(fmtFechaFirma(cal.fechaFirmaLider))}`:'Firma pendiente'}</span></div><div class="sig">${cal.firmaColaboradorData?`<img src="${cal.firmaColaboradorData}"/>`:''}<b>${esc(cal.firmaColaboradorNombre||col.nombre)}</b><br><span class="muted">${cal.firmaColaborador?`Firmado ${esc(fmtFechaFirma(cal.fechaFirmaColaborador))}`:'Firma pendiente'}</span></div></div><p class="muted" style="margin-top:28px">La firma confirma la recepción y revisión de la retroalimentación y de los acuerdos de desarrollo registrados; no sustituye otros procesos laborales o administrativos aplicables.</p></body></html>`;
  }


  function buildPerformanceProfile(colaboradorId, periodoId) {
    const autoEval=S.getEvaluacion(colaboradorId,periodoId,'autoevaluacion');
    const leaderEval=S.getEvaluacion(colaboradorId,periodoId,'lider');
    if(!autoEval || !leaderEval) return null;
    const autoResp=S.getRespuestas(autoEval.id), leaderResp=S.getRespuestas(leaderEval.id);
    const dims=[]; const auto={}; const lider={};
    [...D.COMPETENCIAS.actitud,...D.COMPETENCIAS.habilidades].forEach((c)=>{
      const key=c.id.toLowerCase();
      const chartLabels={
        A1:'Compromiso Organizacional',
        A2:'Actitud de Servicio',
        A3:'Trabajo en Equipo',
        A4:'Comunicación Efectiva',
        A5:'Adaptabilidad e Iniciativa',
        B1:'Dominio del Puesto',
        B2:'Procesos y Herramientas',
        B3:'Orientación a Resultados',
        B4:'Planeación y Organización',
        B5:'Seguimiento y Control'
      };
      const short=chartLabels[c.id] || c.nombre.replace(/\s*\([^)]*\)/g,'');
      dims.push({key,label:c.nombre,shortLabel:short});
      const ar=autoResp.find(r=>r.competenciaId===c.id), lr=leaderResp.find(r=>r.competenciaId===c.id);
      auto[key]=ar && ar.valor!=='N/A' ? Number(ar.valor) : null;
      lider[key]=lr && lr.valor!=='N/A' ? Number(lr.valor) : null;
    });
    const ao=S.getObjetivos(autoEval.id).filter(o=>(o.descripcion||'').trim()), lo=S.getObjetivos(leaderEval.id).filter(o=>(o.descripcion||'').trim());
    const avgA=C.promedioValido(ao.map(o=>o.calificacion)), avgL=C.promedioValido(lo.map(o=>o.calificacion));
    dims.push({key:'objetivos',label:'Cumplimiento de Objetivos',shortLabel:'Objetivos'}); auto.objetivos=avgA; lider.objetivos=avgL;
    return {dimensiones:dims,autoevaluacion:auto,evaluacionLider:lider};
  }

  function renderSectionGapSummary(resAuto,resLider){
    if(!resAuto||!resLider) return '';
    const sections=[['actitud','Valores y actitud'],['habilidades','Técnica funcional'],['objetivos','Objetivos']];
    return `<div class="performance-summary-strip">${sections.map(([k,label])=>{
      const a=Number((resAuto?.promedios || {})[k]), l=Number((resLider?.promedios || {})[k]);
      const lOk=Number.isFinite(l), aOk=Number.isFinite(a);
      const idealGap=lOk?5-l:null, perception=(aOk&&lOk)?a-l:null;
      const cls=idealGap===null?'neutral':idealGap<=.5?'good':idealGap<=1.25?'mid':'attention';
      return `<article class="performance-summary-card ${cls}"><span>${esc(label)}</span><strong>${lOk?l.toFixed(1):'—'}<small>/5 líder</small></strong><div><b>${idealGap===null?'—':`${idealGap.toFixed(1)} pts al ideal`}</b><em>${perception===null?'—':`${perception>0?'+':''}${perception.toFixed(1)} auto vs líder`}</em></div></article>`;
    }).join('')}</div>`;
  }

  /**
   * Ficha ejecutiva de retroalimentación del colaborador. Reutiliza los
   * campos y funciones ya existentes (resultados, calibración, áreas de
   * oportunidad, planes de desarrollo, acciones de cronograma, evidencias);
   * no se duplican entidades nuevas.
   */
  function viewRetroalimentacion(col, periodoId, estado) {
    if (estado !== D.ESTADOS.RETRO_PENDIENTE && estado !== D.ESTADOS.CERRADA) {
      return `<div class="card"><h2>Retroalimentación</h2><p class="muted">Tu retroalimentación aún no está disponible. Estado actual: ${badge(estado)}</p></div>`;
    }
    const cal = S.getCalibracion(col.empleado, periodoId);
    const liderEval = S.getEvaluacion(col.empleado, periodoId, 'lider');
    const resAuto = S.getUltimoResultadoPorOrigen(col.empleado, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(col.empleado, periodoId, 'lider');
    const totalFinalRaw = cal ? cal.resultadoCalibrado : (resLider ? resLider?.puntajes?.total : null);
    // El backend devuelve el resultado global en escala 1-5. La ficha ejecutiva
    // y sus bandas de desempeño trabajan en 0-100; normalizamos aquí para no
    // mostrar 4.4 como si fuera 4.4%.
    const totalFinal = (totalFinalRaw !== null && totalFinalRaw !== undefined && Number(totalFinalRaw) <= 5)
      ? Number(totalFinalRaw) * 20
      : totalFinalRaw;
    const nivel = C.clasificarNivel(totalFinal);
    const cuad = C.asignarCuadrante(resLider?.promedios?.actitud ?? null, resLider?.promedios?.desempeno ?? null);
    const areas = S.getAreasOportunidad(col.empleado, periodoId);
    const planes = S.getPlanesDesarrollo(col.empleado, periodoId);
    const evidencias = S.getEvidencias(col.empleado, periodoId);
    const acciones = S.getAcciones(col.empleado, periodoId);
    const liderDirecto = S.getLider(col.liderId);
    const diferenciaGlobal = (resAuto && resLider) ? C.round1(resAuto?.puntajes?.total - resLider?.puntajes?.total) : null;
    const brechaGlobal = diferenciaGlobal !== null ? C.clasificarBrecha(diferenciaGlobal) : null;
    const promedios = resLider?.promedios || {};
    const puntajes = resLider ? resLider.puntajes : {};

    const radarHtml = global.EDDCharts.renderRadarChart({
      autoevaluacion: resAuto?.promedios || null,
      evaluacionLider: resLider?.promedios || null,
      calibracion: (cal && cal.resultadoCalibrado !== undefined && resLider) ? { resultadoLider: resLider?.puntajes?.total, resultadoCalibrado: cal.resultadoCalibrado } : null
    });
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({
      actitudProm: resLider?.promedios?.actitud ?? null,
      desempenoProm: resLider?.promedios?.desempeno ?? null,
      nombreColaborador: col.nombre
    });
    const performanceProfile = buildPerformanceProfile(col.empleado, periodoId);
    const performanceWheelHtml = performanceProfile ? global.EDDCharts.renderPerformanceWheel(performanceProfile) : '';

    const objetivosNA = !!(liderEval?.objetivosNoAplicanConfirmados || liderEval?.objetivosNoAplicanDecision === 'confirmado');
    const seccionesCards = ['actitud', 'habilidades', 'objetivos'].map((s) => {
      const meta = D.SECCIONES_META[s];
      if (s === 'objetivos' && objetivosNA) {
        return `<div class="seccion-card seccion-card-na">
          <div class="seccion-card-title">${esc(meta.titulo)} <span class="peso-tag">N/A</span></div>
          <div class="progress"><div class="progress-bar" style="width:0%"></div></div>
          <div class="seccion-card-val">No aplicó en este periodo · el resultado fue reponderado con las secciones aplicables</div>
        </div>`;
      }
      const val = puntajes[s];
      const pctVal = (val !== undefined && val !== null && meta.peso) ? (val / meta.peso) * 100 : 0;
      return `<div class="seccion-card">
        <div class="seccion-card-title">${esc(meta.titulo)} <span class="peso-tag">${meta.peso}%</span></div>
        ${progressBar(pctVal)}
        <div class="seccion-card-val">${f1(val)} de ${meta.peso} pts · promedio ${f1(promedios[s])}/5</div>
      </div>`;
    }).join('');

    return `
    <div class="card ficha-ejecutiva">
      <div class="ficha-header">
        <div class="avatar-iniciales">${esc(inicialesAvatar(col.nombre))}</div>
        <div class="ficha-datos-generales">
          <h2>${esc(col.nombre)}</h2>
          <div class="info-grid">
            <div><span class="label">N.º de empleado</span><span class="value">${esc(col.empleado)}</span></div>
            <div><span class="label">Puesto</span><span class="value">${esc(col.puesto)}</span></div>
            <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
            <div><span class="label">Dirección</span><span class="value">${esc(col.direccion)}</span></div>
            <div><span class="label">Ciudad operativa</span><span class="value">${esc(col.ciudad)}</span></div>
            <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
            <div><span class="label">Líder directo</span><span class="value">${esc(liderDirecto ? liderDirecto.nombre : '—')}</span></div>
            <div><span class="label">Periodo evaluado</span><span class="value">${esc(state.periodo.nombre)}</span></div>
          </div>
        </div>
      </div>

      <div class="resultado-final">
        <div class="resultado-num" style="color:${nivel.color}">${f1(totalFinal)}</div>
        <div>${badge(nivel.nivel, null)}<div class="muted">Puntaje final sobre 100</div></div>
      </div>
      ${progressBar(totalFinal, nivel.color)}

      <h3>Resultados por sección</h3>
      <div class="seccion-cards">${seccionesCards}</div>

      <div class="feedback-top-grid">
        <div><h3>Matriz 9-Box</h3>${ninaBoxHtml}</div>
        <div class="feedback-group-card"><span class="admin-section-kicker">TU CLASIFICACIÓN</span>${renderCuadranteInfo(cuad)}</div>
      </div>
      <section class="performance-profile-section">
        <div class="performance-profile-head"><div><span class="admin-section-kicker">PERFIL DE DESEMPEÑO</span><h3>Lectura multidimensional</h3><p>Compara tu percepción, la evaluación del líder y la distancia contra el nivel ideal esperado.</p></div></div>
        ${renderSectionGapSummary(resAuto,resLider)}
        ${performanceWheelHtml}
        <details class="performance-summary-details"><summary>Ver resumen de las 3 dimensiones</summary><div class="feedback-analysis-single"><div><h3>Radar ejecutivo</h3>${radarHtml}</div></div></details>
      </section>

      ${(()=>{const ae=S.getEvaluacion(col.empleado,periodoId,'autoevaluacion'),le=S.getEvaluacion(col.empleado,periodoId,'lider');if(!ae||!le)return '';const ao=S.getObjetivos(ae.id),lo=S.getObjetivos(le.id).filter(o=>o.ajusteManualLider);return lo.length?`<section class="feedback-objective-adjustments"><div class="feedback-section-title"><span>OBJETIVOS</span><h3>Ajustes realizados por tu líder</h3><p>Cuando la calificación del líder difiere de la equivalencia automática, aquí puedes consultar el motivo registrado.</p></div>${lo.map(o=>{const a=ao.find(x=>Number(x.index)===Number(o.index));return `<article class="objective-adjustment-card"><div><strong>${esc(a?.descripcion||o.descripcion||'Objetivo')}</strong><span class="objective-score-change">Cumplimiento ${esc(a?.cumplimiento??'—')}% → Líder ${esc(o.cumplimiento??'—')}% · Equivalencia ${esc(o.calificacionAutomatica??a?.calificacion??'—')}/5 → ${esc(o.calificacion)}/5</span></div><p><b>Justificación del líder:</b> ${esc(o.justificacionLider||'Sin justificación registrada.')}</p></article>`}).join('')}</section>`:''})()}
      <section class="feedback-agreements"><div class="feedback-section-title"><span>ACUERDOS DE RETROALIMENTACIÓN</span><h3>Lo acordado para tu desarrollo</h3></div>
        <div class="agreement-grid">
          <article><h4>Fortalezas</h4><p>${esc(liderEval ? liderEval.fortalezas : '') || '<span class="muted">Sin registrar.</span>'}</p></article>
          <article><h4>Oportunidades de desarrollo</h4><p>${esc(liderEval ? liderEval.oportunidadesDesarrollo : '') || '<span class="muted">Sin registrar.</span>'}</p></article>
          <article><h4>Brechas a atender</h4><p>${esc(liderEval ? liderEval.debilidadesBrechas : '') || '<span class="muted">Sin registrar.</span>'}</p></article>
          <article><h4>Riesgos o factores de atención</h4><p>${esc(liderEval ? liderEval.riesgosAtencion : '') || '<span class="muted">Sin registrar.</span>'}</p></article>
          <article class="span-2"><h4>Síntesis del líder</h4><p>${esc(liderEval ? liderEval.comentarios : '') || '<span class="muted">Sin comentarios.</span>'}</p></article>
          <article class="span-2"><h4>Áreas de oportunidad y plan de mejora</h4>${areas.length ? `<table class="table table-compact"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th></tr></thead><tbody>${areas.map(a=>`<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No aplica.</p>'}</article>
          <article class="span-2"><h4>Plan de desarrollo</h4>${planes.length ? renderPlanesTabla(planes) : '<p class="muted">No aplica.</p>'}</article>
          ${cal && cal.observacionesRH ? `<article class="span-2"><h4>Observaciones de RH</h4><p>${esc(cal.observacionesRH)}</p></article>` : ''}
        </div>
      </section>
      <section class="feedback-acceptance-card ${cal&&cal.acuerdosLiberados?'ready':'locked'}"><div class="feedback-signing-head"><div><span class="admin-section-kicker">CIERRE Y CONSTANCIA</span><h3>Confirmación y firma de retroalimentación</h3><p>${cal&&cal.acuerdosLiberados?'Los acuerdos finales ya fueron liberados. Firma cuando hayas revisado el resultado, la retroalimentación y el plan de desarrollo.':'La firma se habilitará después de la reunión y de que el líder libere los acuerdos finales.'}</p></div><div class="document-actions"><button class="btn btn-outline btn-sm" onclick="App.descargarRetroalimentacion('${col.empleado}','${periodoId}')">Descargar constancia</button><button class="btn btn-outline btn-sm" onclick="App.imprimirRetroalimentacion('${col.empleado}','${periodoId}')">Imprimir / Guardar PDF</button></div></div>
        <div class="signature-own-flow">
          ${renderOtherPartySignatureStatus('lider',cal)}
          ${renderSignatureCard('colaborador',col,periodoId,cal,!cal?.acuerdosLiberados?'Tu líder aún no ha liberado los acuerdos finales.':!cal?.firmaLider?'Tu firma se habilita después de que tu líder firme desde su portal.':null)}
        </div>
        <div class="feedback-legal-note">Cada participante firma desde su propio portal. Al firmar confirmas que recibiste y revisaste la retroalimentación y que conoces los acuerdos registrados.</div>
      </section>
    </div>`;
  }

  // renderCuadranteInfo vive ahora en charts.js (EDDCharts.renderCuadranteInfo)
  // para que la matriz global y la individual usen exactamente la misma tarjeta.
  function renderCuadranteInfo(cuad) { return global.EDDCharts.renderCuadranteInfo(cuad); }

  function normalizeFeedbackArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; }
    }
    return [];
  }
  function renderRemoteImprovementPlan(value) {
    const rows = normalizeFeedbackArray(value);
    if (!rows.length) return '<p class="muted">Sin plan de mejora registrado.</p>';
    return `<div class="admin-table-wrap"><table class="table table-compact"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.area||r.opportunityArea||'—')}</b></td><td>${esc(r.improvementPlan||r.plan||'—')}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function renderRemoteDevelopmentPlan(value) {
    const rows = normalizeFeedbackArray(value);
    if (!rows.length) return '<p class="muted">Sin acciones de desarrollo registradas.</p>';
    return `<div class="admin-table-wrap"><table class="table table-compact"><thead><tr><th>Competencia</th><th>Acción</th><th>Responsable</th><th>Fecha compromiso</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.competency||r.competencia||'—')}</b></td><td>${esc(r.action||r.accion||'—')}</td><td>${esc(r.responsible||r.responsable||'—')}</td><td>${esc(r.commitmentDate||r.fechaCompromiso||'—')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function renderPlanesTabla(planes) {
    if (!planes.length) return '<p class="muted">Sin acciones de desarrollo registradas.</p>';
    return `<table class="table"><thead><tr><th>Competencia</th><th>Acción</th><th>Responsable</th><th>Fecha compromiso</th><th>Estado</th><th>Evidencia</th></tr></thead><tbody>
      ${planes.map((p) => `<tr><td>${esc(p.competencia)}</td><td>${esc(p.accion)}</td><td>${esc(p.responsable)}</td><td>${esc(p.fechaCompromiso)}</td><td>${badge(p.estado)}</td><td>${esc(p.evidencia) || '—'}</td></tr>`).join('')}
    </tbody></table>`;
  }

  function renderGantt(acciones) {
    const semanas = [1, 2, 3, 4, 5, 6];
    return `<div class="gantt">
      <div class="gantt-header"><div class="gantt-label">Acción</div>${semanas.map((s) => `<div class="gantt-col">S${s}</div>`).join('')}<div class="gantt-col">Avance</div></div>
      ${acciones.map((a) => `<div class="gantt-row">
        <div class="gantt-label">${esc(a.accion)} <span class="muted">(${esc(a.responsable)})</span></div>
        ${semanas.map((s) => `<div class="gantt-col ${s >= a.semanaInicio && s <= a.semanaFin ? 'gantt-active gantt-' + estadoClase(a.estado) : ''}"></div>`).join('')}
        <div class="gantt-col">${badge(a.estado)} ${a.avance}%</div>
      </div>`).join('')}
    </div>`;
  }
  function estadoClase(estado) {
    return { 'No iniciada': 'gray', 'En proceso': 'yellow', 'Completada': 'green', 'Vencida': 'red' }[estado] || 'gray';
  }

  // =========================================================================
  // PORTAL LÍDER
  // =========================================================================
  function renderLider(page, param) {
    const lider = S.getLider(state.user.empleado) || { empleado: state.user.empleado, nombre: state.user.nombre, puesto: state.user.puesto || '', area: state.user.area || '' };
    const periodoId = state.periodo.id;
    if (page === 'mi-inicio') return renderColaborador('inicio');
    if (page === 'mi-autoevaluacion') return renderColaborador('autoevaluacion');
    if (page === 'mi-retroalimentacion') return renderColaborador('retroalimentacion');
    if (page === 'mi-enviado') return renderColaborador('enviado');
    if (page === 'evaluar' && param) return viewLiderEvaluar(lider, param, periodoId);
    if (page === 'comparacion' && param) return viewComparacion(lider, param, periodoId);
    if (apiReadMode()) {
      if (page === 'pendientes') return viewLiderDashboardApi(true, false);
      if (page === 'firmas') return viewLiderDashboardApi(false, true);
      if (page === 'dashboard') return viewLiderDashboardApi(false, false);
    }
    if (page === 'pendientes') return viewLiderDashboard(lider, periodoId, true, false);
    if (page === 'firmas') return viewLiderDashboard(lider, periodoId, false, true);
    return viewLiderDashboard(lider, periodoId, false, false);
  }

  function viewLiderDashboardApi(soloPendientes, soloFirmas) {
    const data = state.remote.team || {};
    let team = Array.isArray(data.team) ? data.team.slice() : [];
    if (soloPendientes) team = team.filter(x => /pendiente|no iniciada|en progreso/i.test(String(x.leaderStatus || x.processState || '')));
    if (soloFirmas) team = team.filter(x => !!x.leaderSignaturePending);
    const pendingEval = team.filter(x => /pendiente|no iniciada|en progreso/i.test(String(x.leaderStatus || x.processState || ''))).length;
    const pendingLeaderSignature = team.filter(x => x.leaderSignaturePending).length;
    const pendingEmployeeSignature = team.filter(x => x.employeeSignaturePending).length;
    return `<section class="backend-live-section"><div class="kpi-grid">${kpi('Colaboradores',team.length)}${kpi('Pendientes por evaluar',pendingEval,pendingEval?'yellow':'gray')}${kpi('Por firmar líder',pendingLeaderSignature,pendingLeaderSignature?'red':'gray')}${kpi('Firma colaborador pendiente',pendingEmployeeSignature,pendingEmployeeSignature?'yellow':'gray')}</div><div class="card"><div class="admin-panel-head"><div><span class="admin-section-kicker">DATOS EN VIVO</span><h2>${soloFirmas?'Pendientes por firmar':soloPendientes?'Pendientes por evaluar':'Mi equipo'}</h2><p>Origen: n8n + Airtable · identidad y jerarquía validadas por sesión.</p></div><button class="btn btn-outline btn-sm" onclick="App.recargarBackend()">Actualizar</button></div><div class="admin-table-wrap"><table class="table"><thead><tr><th>Nombre</th><th>Puesto</th><th>Área</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Proceso</th><th>Retroalimentación</th><th>Firma</th><th></th></tr></thead><tbody>${team.map(x=>{const selfReady=/submitted|completada|enviada|pendiente.*l[ií]der/i.test(String(x.selfStatus||x.processState||''));const leaderDone=/submitted|completada|enviada/i.test(String(x.leaderStatus||''));return `<tr><td><div class="backend-person-cell"><strong>${esc(x.name||x.employeeName||x.employeeId)}</strong><small>${esc(x.employeeId||'')}</small></div></td><td>${esc(x.position||'—')}</td><td>${esc(x.area||'—')}</td><td>${badge(x.selfStatus||'—')}</td><td>${badge(x.leaderStatus||'—')}</td><td>${badge(x.processState||'—')}</td><td>${badge(x.feedbackState||'—')}</td><td>${x.leaderSignaturePending?badge('Pendiente líder','red'):x.employeeSignaturePending?badge('Pendiente colaborador','yellow'):'—'}</td><td>${selfReady&&!leaderDone&&x.evaluationId?`<button class="btn btn-primary btn-sm" onclick="App.abrirEvaluacionLider('${esc(x.employeeId)}','${esc(x.evaluationId)}')">Evaluar</button>`:leaderDone&&x.evaluationId?`<button class="btn btn-outline btn-sm" onclick="App.abrirComparacionLider('${esc(x.employeeId)}','${esc(x.evaluationId)}')">Ver seguimiento</button>`:'<span class="muted">Esperando autoevaluación</span>'}</td></tr>`}).join('')||`<tr><td colspan="9" class="muted">Sin acuerdos listos para firma. Las retroalimentaciones recién liberadas aparecen primero en Mi equipo como Pendiente de reunión; después de confirmar la reunión y liberar acuerdos pasarán a esta vista.</td></tr>`}</tbody></table></div><p class="backend-read-note">Evaluación, calibración, retroalimentación y firmas usan n8n + Airtable como fuente de verdad.</p></div></section>`;
  }

  function viewLiderDashboard(lider, periodoId, soloPendientes, soloFirmas) {
    const equipo = S.getColaboradoresDeLider(lider.empleado);
    let filas = equipo.map((c) => {
      const estado = S.estadoProceso(c.empleado, periodoId);
      const autoEval = S.getEvaluacion(c.empleado, periodoId, 'autoevaluacion');
      const liderEval = S.getEvaluacion(c.empleado, periodoId, 'lider');
      const cal = S.getCalibracion(c.empleado, periodoId);
      return { c, estado, autoEval, liderEval, cal };
    });
    if (soloPendientes) filas = filas.filter((f) => f.estado === D.ESTADOS.PENDIENTE_LIDER);
    if (soloFirmas) filas = filas.filter((f) => { const cal = S.getCalibracion(f.c.empleado, periodoId); return !!(cal && cal.acuerdosLiberados && !cal.firmaLider); });
    const total = filas.length;
    const completadas = filas.filter((f) => f.estado === D.ESTADOS.CERRADA).length;
    const pendientesLider = filas.filter((f) => f.estado === D.ESTADOS.PENDIENTE_LIDER).length;
    const pendientesRetro = filas.filter((f) => f.estado === D.ESTADOS.RETRO_PENDIENTE).length;
    const vencidas = filas.filter((f) => (!f.autoEval || f.autoEval.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteAutoevaluacion)).length
      + filas.filter((f) => f.autoEval && f.autoEval.estado === D.ESTADOS.COMPLETADA && (!f.liderEval || f.liderEval.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteLider)).length;
    const avance = total ? pct((completadas / total) * 100) : 0;
    const retroLiberadas = filas.filter((f)=>S.getCalibracion(f.c.empleado,periodoId)?.acuerdosLiberados).length;
    const firmasLider = filas.filter((f)=>S.getCalibracion(f.c.empleado,periodoId)?.firmaLider).length;
    const firmasColaborador = filas.filter((f)=>S.getCalibracion(f.c.empleado,periodoId)?.firmaColaborador).length;
    const retroFirmadas = filas.filter((f)=>{const c=S.getCalibracion(f.c.empleado,periodoId);return c?.firmaLider&&c?.firmaColaborador;}).length;
    const pendientesFirma = Math.max(0, retroLiberadas - retroFirmadas);
    const porFirmarLider = filas.filter((f)=>{ const c=S.getCalibracion(f.c.empleado,periodoId); return c?.acuerdosLiberados && !c?.firmaLider; }).length;

    return `
    ${porFirmarLider ? `<div class="leader-action-banner"><div><span>ACCIÓN REQUERIDA</span><strong>Tienes ${porFirmarLider} acuerdo${porFirmarLider===1?'':'s'} por firmar</strong><small>Revisa la retroalimentación y firma desde tu portal para que el colaborador pueda continuar.</small></div><a href="#leader-signatures" class="btn btn-primary">Ver pendientes</a></div>` : ''}
    <div class="kpi-grid">
      ${kpi('Colaboradores', total)}
      ${kpi('Evaluaciones pendientes (líder)', pendientesLider, vencidas ? 'red' : 'yellow')}
      ${kpi('Retroalimentaciones firmadas', `${retroFirmadas}/${retroLiberadas}`, 'green')}
      ${kpi('Por firmar', porFirmarLider, porFirmarLider ? 'red' : 'gray')}
      ${kpi('Firma del líder', `${firmasLider}/${retroLiberadas}`, 'blue')}
      ${kpi('Firma del colaborador', `${firmasColaborador}/${retroLiberadas}`, 'blue')}
      ${kpi('Avance del equipo', avance + '%', 'blue')}
      ${kpi('Alertas por vencimiento', vencidas, vencidas ? 'red' : 'gray')}
    </div>
    <div class="card" id="leader-signatures">
      <h2>${soloFirmas ? 'Pendientes por firmar' : soloPendientes ? 'Pendientes por evaluar' : 'Mi equipo'} — ${esc(lider.area)}</h2>
      ${soloPendientes && !filas.length ? '<p class="alert alert-success">No tienes evaluaciones pendientes en este momento.</p>' : ''}
      ${soloFirmas && !filas.length ? '<p class="alert alert-success">No tienes acuerdos pendientes por firmar en este momento.</p>' : ''}
      <table class="table">
        <thead><tr><th>Nombre</th><th>Puesto</th><th>Área</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Retroalimentación</th><th>Firmas</th><th></th></tr></thead>
        <tbody>
        ${filas.map((f) => {
          const eAuto = !f.autoEval ? 'No iniciada' : f.autoEval.estado;
          const eLider = !f.liderEval ? 'No iniciada' : f.liderEval.estado;
          const eRetro = [D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(f.estado) ? f.estado : (f.estado === D.ESTADOS.CALIBRADA ? 'Calibrada' : 'Pendiente');
          let accion = '';
          if (f.estado === D.ESTADOS.PENDIENTE_LIDER) accion = `<a class="btn btn-primary btn-sm" href="#/lider/evaluar/${f.c.empleado}">Evaluar</a>`;
          else if (f.cal?.acuerdosLiberados && !f.cal?.firmaLider) accion = `<a class="btn btn-primary btn-sm leader-sign-now" href="#/lider/comparacion/${f.c.empleado}">Firmar acuerdo</a>`;
          else if ([D.ESTADOS.PENDIENTE_CALIBRACION, D.ESTADOS.CALIBRADA, D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(f.estado)) accion = `<a class="btn btn-outline btn-sm" href="#/lider/comparacion/${f.c.empleado}">Ver comparación</a>`;
          else accion = `<span class="muted">Sin acción disponible</span>`;
          const firmaEstado=f.cal?.firmaLider&&f.cal?.firmaColaborador?'Completa':f.cal?.firmaLider?'Falta colaborador':f.cal?.acuerdosLiberados?'Falta líder':'—'; return `<tr><td>${esc(f.c.nombre)}</td><td>${esc(f.c.puesto)}</td><td>${esc(f.c.area)}</td><td>${badge(eAuto)}</td><td>${badge(eLider)}</td><td>${badge(eRetro)}</td><td>${firmaEstado==='—'?'—':badge(firmaEstado,firmaEstado==='Completa'?'green':firmaEstado==='Falta colaborador'?'yellow':'red')}</td><td>${accion}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;
  }
  function kpi(label, value, color) {
    return `<div class="kpi-card"><div class="kpi-value ${color ? 'kpi-' + color : ''}">${value}</div><div class="kpi-label">${esc(label)}</div></div>`;
  }

  // Bloquea el acceso de un líder a colaboradores que no le reportan
  // directamente (liderId debe coincidir con el número de empleado del líder
  // en sesión). Se aplica tanto si el líder llega por navegación normal como
  // si escribe la URL con hash directamente en el navegador.
  function viewAccesoDenegado(mensaje) {
    return `<div class="card"><h2>Acceso no autorizado</h2><p class="muted">${esc(mensaje)}</p><a class="btn btn-outline" href="#/lider/dashboard">Volver a mi equipo</a></div>`;
  }
  function perteneceALider(col, lider) {
    return !!(col && lider && String(col.liderId) === String(lider.empleado));
  }

  function viewLiderEvaluar(lider, colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    if (!col || !perteneceALider(col, lider)) {
      return viewAccesoDenegado('Este colaborador no pertenece a tu equipo directo. Solo puedes evaluar a las personas cuyo líder registrado seas tú.');
    }
    const autoEval = S.getEvaluacion(colaboradorId, periodoId, 'autoevaluacion');
    if (!autoEval || autoEval.estado !== D.ESTADOS.COMPLETADA) {
      return `<div class="card"><h2>${esc(col.nombre)}</h2><p class="muted">El colaborador aún no completa su autoevaluación. No es posible iniciar la evaluación del líder todavía.</p><a class="btn btn-outline" href="#/lider/dashboard">Volver</a></div>`;
    }
    const ev = S.getOrCreateEvaluacion(colaboradorId, lider.empleado, periodoId, 'lider');
    if (ev.estado === D.ESTADOS.COMPLETADA) return viewComparacion(lider, colaboradorId, periodoId);

    if (state.wizard.evaluacionId !== ev.id) state.wizard = { seccionIdx: 0, evaluacionId: ev.id, tipo: 'lider', colaboradorId, liderId: lider.empleado };
    const idx = state.wizard.seccionIdx;
    const seccion = SECCIONES_WIZARD[idx];
    const stepsHtml = SECCIONES_WIZARD.map((s, i) => `<div class="wizard-step ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}">${i + 1}. ${labelSeccion(s === 'resumen' ? 'resumen' : s)}</div>`).join('');

    let contenido = '';
    if (seccion === 'objetivos') contenido = renderObjetivosLider(ev, autoEval);
    else if (seccion === 'resumen') contenido = renderResumenLider(ev, col);
    else contenido = renderSeccionForm(ev, seccion, false);

    const progresoLider = Math.round(((idx + (seccion === 'resumen' ? 1 : 0)) / SECCIONES_WIZARD.length) * 100);
    const sidebarLider = SECCIONES_WIZARD.map((s, i) => `<button class="premium-section-step ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}" type="button"><span><strong>${labelSeccion(s)}</strong><small>${s === 'resumen' ? 'Revisión final' : (D.SECCIONES_META[s] ? D.SECCIONES_META[s].eje || 'Evaluación' : '')}</small></span><b>${i < idx ? '✓' : (i + 1) + '/5'}</b></button>`).join('');
    return `
    <div class="card premium-leader-person">
      <h2>Evaluación de ${esc(col.nombre)}</h2>
      <div class="info-grid">
        <div><span class="label">Puesto</span><span class="value">${esc(col.puesto)}</span></div>
        <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
        <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
        <div><span class="label">Periodo</span><span class="value">${esc(state.periodo.nombre)}</span></div>
      </div>
      <p class="alert alert-info">La autoevaluación del colaborador permanecerá oculta hasta que envíes tu evaluación.</p>
    </div>
    <section class="premium-evaluation-page premium-leader-evaluation">
      <div class="premium-progress-head"><div><span>Progreso de evaluación</span><div class="progress"><div class="progress-bar" style="width:${progresoLider}%"></div></div></div><strong>${progresoLider}%</strong></div>
      <div class="premium-evaluation-layout">
        <aside class="premium-evaluation-sidebar">${sidebarLider}<div class="premium-reminder-card"><strong>Evaluación del líder</strong><p>Guarda tu avance y verifica cada sección antes de enviar. La autoevaluación se mostrará después del envío.</p></div>${escalaSidebarHTML()}</aside>
        <div class="premium-evaluation-main">
          <div class="premium-evaluation-title"><span class="premium-section-kicker">${seccion === 'resumen' ? 'Revisión final' : 'Sección ' + (idx + 1) + ' de 3'}</span><h1>${labelSeccion(seccion)}${seccion !== 'resumen' && D.SECCIONES_META[seccion] ? ` <em>(${D.SECCIONES_META[seccion].peso}%)</em>` : ''}</h1></div>
          ${contenido}
          <div class="wizard-nav premium-wizard-nav">
            <button class="btn btn-outline" ${idx === 0 ? 'disabled' : ''} onclick="App.wizardPrev()">← Anterior</button>
            <button class="btn btn-outline premium-save-btn" onclick="App.guardarProgresoVisual()">Guardar progreso</button>
            ${seccion === 'resumen'
              ? `<label class="confirm-check premium-confirm premium-confirm-large"><input type="checkbox" id="confirmEnvioLider"/> Confirmo que la evaluación está completa.</label><button id="btnEnviarEvaluacionLider" class="btn btn-primary premium-next-btn" onclick="App.enviarEvaluacionLider('${colaboradorId}')">Enviar evaluación ✓</button>`
              : `<button class="btn btn-primary premium-next-btn" onclick="App.wizardNext('${seccion}')">Siguiente →</button>`}
          </div>
        </div>
      </div>
    </section>`;
  }

  function renderObjetivosLider(ev, autoEval) {
    const objetivosNoAplican = !!autoEval.objetivosNoAplican;
    const objetivosAuto = S.getObjetivos(autoEval.id).filter((o) => o.descripcion && o.descripcion.trim());
    const objetivosLider = S.getObjetivos(ev.id);
    const mapLider = {}; objetivosLider.forEach((o) => { mapLider[Number(o.index)] = o; });
    if (objetivosNoAplican) {
      const decision = ev.objetivosNoAplicanDecision || (ev.objetivosNoAplicanConfirmados ? 'confirmado' : '');
      const leaderObjs = S.getObjetivos(ev.id);
      const leaderRows = leaderObjs.length ? leaderObjs : [{index:0,descripcion:'',meta:'',resultado:'',cumplimiento:'',calificacion:''}];
      return `<section class="leader-na-objectives ${decision==='confirmado' ? 'confirmed' : ''} ${decision==='rechazado' ? 'rejected' : ''}">
        <div><span class="admin-section-kicker">OBJETIVOS DEL PERIODO</span><h3>El colaborador reportó que no tuvo objetivos definidos</h3><p><b>Motivo:</b> ${esc(autoEval.objetivosNoAplicanMotivo||'Sin motivo registrado')}<br><b>Contexto:</b> ${esc(autoEval.objetivosNoAplicanDetalle||'Sin contexto registrado')}</p><p>Como líder, valida si esta ausencia corresponde a la realidad del periodo. Esto permite distinguir una brecha de desempeño de una brecha de gestión.</p></div>
        <div class="leader-na-decision">
          <button type="button" class="decision-card ${decision==='confirmado'?'active confirm':''}" onclick="App.decisionObjetivosNoAplicanLider('${ev.id}','confirmado')"><b>✓ Confirmar sin objetivos</b><span>La sección queda N/A y se reporta como indicador de madurez de gestión.</span></button>
          <button type="button" class="decision-card ${decision==='rechazado'?'active reject':''}" onclick="App.decisionObjetivosNoAplicanLider('${ev.id}','rechazado')"><b>Había objetivos</b><span>Debes documentarlos y evaluarlos para este cierre.</span></button>
        </div>
        ${decision==='confirmado' ? `<label class="leader-na-comment"><span>Comentario del líder <em>obligatorio</em></span><textarea placeholder="Confirma el contexto o explica por qué no se definieron objetivos para este puesto." oninput="App.setObjetivosNoAplicanComentarioLider('${ev.id}',this.value)">${esc(ev.objetivosNoAplicanComentarioLider||'')}</textarea></label>` : ''}
        ${decision==='rechazado' ? `<div class="leader-objectives-recovery"><div class="leader-form-intro"><strong>Documenta los objetivos que sí existían</strong><span>Captura objetivo, meta y resultado. El cumplimiento y la equivalencia se calcularán automáticamente. Esta discrepancia quedará visible para DO.</span></div><div id="objetivosWrap">${leaderRows.map((o,i)=>renderObjetivoRow(ev.id,o,Number(o.index??i),false,false)).join('')}</div>${leaderRows.length<5?`<button class="btn btn-outline btn-sm smart-add-objective" onclick="App.agregarObjetivo('${ev.id}')">+ Agregar objetivo</button>`:''}<label class="leader-na-comment"><span>Justificación de la discrepancia <em>obligatoria</em></span><textarea placeholder="Explica por qué consideras que sí existían objetivos aunque el colaborador reportó lo contrario." oninput="App.setObjetivosNoAplicanComentarioLider('${ev.id}',this.value)">${esc(ev.objetivosNoAplicanComentarioLider||'')}</textarea></label></div>` : ''}
      </section>`;
    }
    if (!objetivosAuto.length) return '<p class="muted">El colaborador no registró objetivos en este periodo.</p>';
    return `
    <div class="kpi-leader-note"><strong>Validación del líder:</strong> la meta y el resultado reportado por el colaborador permanecen visibles como referencia. Como líder debes validar el <b>% de cumplimiento</b> con la información disponible. La calificación en estrellas se calcula automáticamente a partir del porcentaje que valides. Si tu porcentaje difiere del reportado por el colaborador, la justificación es obligatoria y será visible en retroalimentación y calibración de DO.</div>
    ${objetivosAuto.map((o, i) => {
      const sourceIndex = Number(o.index);
      const autoScore = Number(o.calificacion) || '';
      let actual = mapLider[sourceIndex];
      if (!actual) {
        S.saveObjetivo(ev.id, sourceIndex, o.descripcion||'', o.resultado||'', autoScore, {meta:o.meta||'', cumplimiento:o.cumplimiento??'', cumplimientoAutomatico:o.cumplimiento??'', noCuantificable:false, calificacionAutomatica:autoScore, ajusteManualLider:false, justificacionLider:''});
        actual = S.getObjetivos(ev.id).find((x) => Number(x.index) === sourceIndex);
      }
      const pctAuto = Number(o.cumplimiento);
      const pctLider = actual?.cumplimiento === '' || actual?.cumplimiento == null ? pctAuto : Number(actual.cumplimiento);
      const manual = Number.isFinite(pctAuto) && Number.isFinite(pctLider) ? Math.abs(pctLider - pctAuto) > 0.01 : !!actual?.ajusteManualLider;
      const scoreLider = Number.isFinite(pctLider) ? C.calificacionPorCumplimiento(pctLider) : autoScore;
      const just = actual?.justificacionLider || '';
      return `<div class="objetivo-row leader-objective-review ${manual ? 'manual-active' : ''}" data-idx="${sourceIndex}"><div class="objetivo-num">#${i+1}</div><div class="objetivo-fields">
        <div class="objetivo-lectura"><strong>Objetivo:</strong> ${esc(o.descripcion)}</div>
        <div class="kpi-leader-grid"><div class="objetivo-lectura"><strong>Meta acordada:</strong> ${esc(o.meta||'—')}</div><div class="objetivo-lectura"><strong>Resultado reportado:</strong> ${esc(o.resultado||'—')}</div><div class="objetivo-lectura"><strong>% reportado por colaborador:</strong> ${esc(o.cumplimiento===''||o.cumplimiento==null?'—':o.cumplimiento+'%')}</div><div class="objetivo-lectura"><strong>Equivalencia del colaborador:</strong> <span class="readonly-rating">${esc(autoScore||'—')} ${autoScore?'★'.repeat(Number(autoScore)||0):''}</span></div></div>
        <div class="leader-score-decision leader-percent-decision">
          <div class="leader-score-choice-head"><div><strong>Validación del líder</strong><span>${manual ? 'Existe diferencia contra el porcentaje reportado' : 'Coincide con el porcentaje reportado'}</span></div></div>
          <div class="leader-percent-grid">
            <label class="leader-percent-field"><span>% de cumplimiento validado por líder</span><div class="percent-input-wrap"><input type="number" min="0" step="0.1" value="${Number.isFinite(pctLider)?esc(pctLider):''}" oninput="App.validarCumplimientoObjetivoLider('${ev.id}',${sourceIndex},this.value)"/><b>%</b></div><small>Captura el porcentaje que determinaste después de validar la evidencia o fuente.</small></label>
            <div class="leader-derived-rating"><span>Calificación resultante</span><strong>${esc(scoreLider||'—')}/5 ${scoreLider?'★'.repeat(Number(scoreLider)||0):''}</strong><small>Se calcula automáticamente con la equivalencia Rev. 4.</small></div>
          </div>
          ${manual ? `<label class="leader-justification-field"><span>Justificación de la diferencia <em>obligatoria</em></span><textarea placeholder="Explica por qué el porcentaje validado difiere del reportado por el colaborador e indica la evidencia o fuente revisada..." oninput="App.justificarObjetivoLider('${ev.id}',${sourceIndex},this.value)">${esc(just)}</textarea></label>` : `<div class="leader-auto-score-kept"><span>✓</span><div><strong>Sin ajuste</strong><small>El porcentaje validado coincide con el colaborador.</small></div></div>`}
        </div>
        <div class="validation-message" aria-live="polite">Si el porcentaje validado es diferente al reportado por el colaborador, registra la justificación y fuente utilizada.</div>
      </div></div>`;
    }).join('')}`;
  }

  function renderResumenLider(ev, col) {
    return `
    <section class="leader-foda-section">
      <div class="leader-foda-head"><div><span>LECTURA INTEGRAL</span><h3>Resumen cualitativo del desempeño</h3><p>Analiza el desempeño con una lógica inspirada en FODA, enfocada en desarrollo. Registra hechos observables y evita comentarios personales o ambiguos.</p></div><div class="leader-foda-badge">F · O · D · A</div></div>
      <div class="leader-foda-grid">
        <label class="leader-foda-card strength"><span class="leader-foda-icon">F</span><div><strong>Fortalezas</strong><small>Capacidades, conductas y resultados que conviene mantener y potenciar.</small></div><textarea placeholder="Ej. Mantiene alta calidad en sus entregables y apoya al equipo en cierres críticos." onchange="App.setFortalezas('${ev.id}',this.value)">${esc(ev.fortalezas||'')}</textarea></label>
        <label class="leader-foda-card opportunity"><span class="leader-foda-icon">O</span><div><strong>Oportunidades de desarrollo</strong><small>Espacios concretos donde puede crecer, aprender o ampliar su impacto.</small></div><textarea placeholder="Ej. Fortalecer planeación semanal y desarrollar mayor dominio de Power BI." onchange="App.setOportunidades('${ev.id}',this.value)">${esc(ev.oportunidadesDesarrollo||'')}</textarea></label>
        <label class="leader-foda-card weakness"><span class="leader-foda-icon">D</span><div><strong>Brechas a atender</strong><small>Conocimientos, hábitos o resultados que hoy limitan su desempeño esperado.</small></div><textarea placeholder="Ej. Presenta retrasos recurrentes en seguimiento y requiere mayor precisión en reportes." onchange="App.setDebilidades('${ev.id}',this.value)">${esc(ev.debilidadesBrechas||'')}</textarea></label>
        <label class="leader-foda-card risk"><span class="leader-foda-icon">A</span><div><strong>Riesgos o factores de atención</strong><small>Situaciones que podrían afectar el desempeño si no se atienden oportunamente.</small></div><textarea placeholder="Ej. Dependencia de una sola persona/proceso, carga acumulada o falta de capacitación específica." onchange="App.setAmenazas('${ev.id}',this.value)">${esc(ev.riesgosAtencion||'')}</textarea></label>
      </div>
      <label class="leader-foda-summary"><div><strong>Síntesis del líder</strong><small>Resume los puntos anteriores en un mensaje claro, respetuoso, útil y orientado a acciones.</small></div><textarea placeholder="Ej. Durante el periodo destacaste por..., y el principal foco de desarrollo será..." onchange="App.setComentarios('${ev.id}',this.value)">${esc(ev.comentarios||'')}</textarea></label>
    </section>
    <section class="leader-agreement-block"><div class="leader-block-head"><div><span>ACUERDOS</span><h4>Áreas de oportunidad y plan de mejora</h4></div><button class="btn btn-outline btn-sm" onclick="App.mostrarNuevaArea('${col.empleado}')">+ Agregar</button></div>
      <div id="nuevaArea-${col.empleado}" class="inline-editor leader-inline-editor leader-form-surface hidden"><div class="leader-form-intro"><strong>Registrar acuerdo de mejora</strong><span>Documenta el punto a desarrollar y la acción acordada con el colaborador.</span></div><div class="leader-inline-grid leader-inline-grid-2"><div class="leader-inline-field"><label>Área de oportunidad</label><textarea id="areaNueva-${col.empleado}" rows="3" placeholder="Describe con claridad el aspecto que se trabajará"></textarea></div><div class="leader-inline-field"><label>Plan de mejora</label><textarea id="planNuevo-${col.empleado}" rows="3" placeholder="Describe la acción acordada para mejorar"></textarea></div></div><div class="inline-editor-actions"><button class="btn btn-primary btn-sm" onclick="App.guardarNuevaArea('${col.empleado}')">Guardar acuerdo</button><button class="btn btn-outline btn-sm" onclick="App.ocultarNuevaArea('${col.empleado}')">Cancelar</button></div></div>
      <div id="areasWrap">${renderAreasEditable(col.empleado, state.periodo.id)}</div>
    </section>
    <section class="leader-agreement-block"><div class="leader-block-head"><div><span>DESARROLLO</span><h4>Plan de desarrollo</h4></div><button class="btn btn-outline btn-sm" onclick="App.mostrarNuevoPlan('${col.empleado}')">+ Agregar acción</button></div>
      <div id="nuevoPlan-${col.empleado}" class="inline-editor leader-inline-editor leader-form-surface hidden"><div class="leader-form-intro"><strong>Registrar acción de desarrollo</strong><span>Define una acción concreta, medible y con fecha compromiso.</span></div><div class="leader-inline-grid leader-inline-grid-plan"><div class="leader-inline-field"><label>Competencia a desarrollar</label><input id="competenciaNueva-${col.empleado}" placeholder="Ej. Planeación y organización"/></div><div class="leader-inline-field"><label>Acción acordada</label><input id="accionNueva-${col.empleado}" placeholder="Ej. Revisión semanal de prioridades"/></div><div class="leader-inline-field"><label>Responsable</label><input id="responsableNuevo-${col.empleado}" value="${esc(col.liderId||'')}" placeholder="No. empleado o responsable"/></div><div class="leader-inline-field leader-inline-date"><label>Fecha compromiso</label><input id="fechaNueva-${col.empleado}" type="date" value="2026-09-01"/></div></div><div class="inline-editor-actions"><button class="btn btn-primary btn-sm" onclick="App.guardarNuevoPlan('${col.empleado}','${col.liderId}')">Guardar acción</button><button class="btn btn-outline btn-sm" onclick="App.ocultarNuevoPlan('${col.empleado}')">Cancelar</button></div></div>
      <div id="planesWrap">${renderPlanesEditable(col.empleado, state.periodo.id, col.liderId)}</div>
    </section>`;
  }

  function renderAreasEditable(colaboradorId, periodoId) {
    const areas = S.getAreasOportunidad(colaboradorId, periodoId);
    if (!areas.length) return '<p class="muted">Sin áreas registradas todavía.</p>';
    return `<table class="table table-compact"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th><th></th></tr></thead><tbody>${areas.map((a) => `<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td><td><button class="btn btn-outline btn-sm" onclick="App.quitarAreaOportunidad('${a.id}','${colaboradorId}')">Quitar</button></td></tr>`).join('')}</tbody></table>`;
  }
  function renderPlanesEditable(colaboradorId, periodoId) {
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
    if (!planes.length) return '<p class="muted">Sin acciones registradas todavía.</p>';
    return `<table class="table table-compact"><thead><tr><th>Competencia</th><th>Acción</th><th>Responsable</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${planes.map((p) => `<tr><td>${esc(p.competencia)}</td><td>${esc(p.accion)}</td><td>${esc(p.responsable||'—')}</td><td>${esc(p.fechaCompromiso)}</td><td>${badge(p.estado)}</td><td><button class="btn btn-outline btn-sm" onclick="App.quitarPlanDesarrollo('${p.id}','${colaboradorId}')">Quitar</button></td></tr>`).join('')}</tbody></table>`;
  }

  function viewComparacion(lider, colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    if (!col || !perteneceALider(col, lider)) {
      return viewAccesoDenegado('Este colaborador no pertenece a tu equipo directo. Solo puedes consultar la comparación de las personas cuyo líder registrado seas tú.');
    }
    const autoEval = S.getEvaluacion(colaboradorId, periodoId, 'autoevaluacion');
    const liderEval = S.getEvaluacion(colaboradorId, periodoId, 'lider');
    if (!autoEval || !liderEval || autoEval.estado !== D.ESTADOS.COMPLETADA || liderEval.estado !== D.ESTADOS.COMPLETADA) {
      return `<div class="card"><h2>Comparación</h2><p class="muted">Ambas evaluaciones deben estar completas para ver la comparación.</p></div>`;
    }
    const respAuto = S.getRespuestasPorSeccion(autoEval.id);
    const respLider = S.getRespuestasPorSeccion(liderEval.id);
    const filas = [];
    ['actitud', 'habilidades'].forEach((sec) => {
      D.COMPETENCIAS[sec].forEach((c) => {
        const ra = respAuto[sec].find((r) => r.competenciaId === c.id);
        const rl = respLider[sec].find((r) => r.competenciaId === c.id);
        filas.push({ nombre: c.nombre, auto: ra ? ra.valor : null, lider: rl ? rl.valor : null, comentarioLider: rl ? rl.comentario : '', comentarioAuto: ra ? ra.comentario : '' });
      });
    });
    const objAuto = S.getObjetivos(autoEval.id).filter((o) => o.descripcion && o.descripcion.trim());
    const objLider = S.getObjetivos(liderEval.id);
    const avgObjAuto = C.promedioValido(objAuto.map((o) => o.calificacion));
    const avgObjLider = C.promedioValido(objLider.map((o) => o.calificacion));
    filas.push({ nombre: 'C. Cumplimiento de Objetivos (promedio)', auto: avgObjAuto !== null ? C.round1(avgObjAuto) : 'N/A', lider: avgObjLider !== null ? C.round1(avgObjLider) : 'N/A', comentarioLider: '', comentarioAuto: '' });
    const ajustesObjetivos = objLider.filter((o) => o.ajusteManualLider).map((ol) => { const oa = objAuto.find((x) => Number(x.index) === Number(ol.index)); return { objetivo: oa?.descripcion || ol.descripcion || 'Objetivo', automatica: ol.calificacionAutomatica ?? oa?.calificacion ?? '—', lider: ol.calificacion, justificacion: ol.justificacionLider || '' }; });

    let resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
    let resLider = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'lider');
    if (!resAuto) resAuto = ensureLocalResultForEvaluation(autoEval);
    if (!resLider) resLider = ensureLocalResultForEvaluation(liderEval);
    if (!resAuto || !resLider) return `<div class="card"><h2>Comparación</h2><p class="muted">Las evaluaciones están completas, pero todavía no hay resultados calculados disponibles. Actualiza e intenta de nuevo.</p></div>`;
    const cuad = C.asignarCuadrante(resLider?.promedios?.actitud, resLider?.promedios?.desempeno);
    const estado = S.estadoProceso(colaboradorId, periodoId);
    const cal = S.getCalibracion(colaboradorId, periodoId);
    const brechaGeneral = C.clasificarBrecha(resAuto?.puntajes?.total - resLider?.puntajes?.total);

    const radarHtml = global.EDDCharts.renderRadarChart({
      autoevaluacion: resAuto?.promedios || {},
      evaluacionLider: resLider?.promedios || {},
      calibracion: (cal && cal.resultadoCalibrado !== undefined) ? { resultadoLider: resLider?.puntajes?.total, resultadoCalibrado: cal.resultadoCalibrado } : null
    });
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({
      actitudProm: resLider?.promedios?.actitud, desempenoProm: resLider?.promedios?.desempeno, nombreColaborador: col.nombre
    });
    const performanceProfile = buildPerformanceProfile(colaboradorId, periodoId);
    const performanceWheelHtml = performanceProfile ? global.EDDCharts.renderPerformanceWheel(performanceProfile) : '';

    return `
    <div class="card">
      <h2>Comparación — ${esc(col.nombre)}</h2>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Puntaje autoevaluación', f1(resAuto?.puntajes?.total))}
        ${kpi('Puntaje evaluación líder', f1(resLider?.puntajes?.total))}
        ${kpi('Diferencia global', (resAuto?.puntajes?.total - resLider?.puntajes?.total > 0 ? '+' : '') + f1(resAuto?.puntajes?.total - resLider?.puntajes?.total))}
      </div>
      <p>Brecha general: ${badge(brechaGeneral.etiqueta, brechaGeneral.etiqueta === 'Alineada' ? 'green' : (brechaGeneral.etiqueta === 'Revisar' ? 'yellow' : 'red'))}</p>
      <section class="performance-profile-section leader-performance-profile">
        <div class="performance-profile-head"><div><span class="admin-section-kicker">LECTURA MULTIDIMENSIONAL</span><h3>Perfil de desempeño vs. ideal</h3><p>La rueda muestra dónde están alineados colaborador y líder, y en qué dimensiones ambos siguen lejos del estándar esperado.</p></div></div>
        ${renderSectionGapSummary(resAuto,resLider)}
        ${performanceWheelHtml}
        <details class="performance-summary-details"><summary>Ver resumen ejecutivo de 3 dimensiones</summary>${radarHtml}</details>
      </section>
      ${ajustesObjetivos.length ? `<section class="objective-adjustment-context"><div class="admin-panel-head"><div><span class="admin-section-kicker">AJUSTES DE OBJETIVOS</span><h3>Calificaciones modificadas por el líder</h3></div></div>${ajustesObjetivos.map(a=>`<article class="objective-adjustment-card"><div><strong>${esc(a.objetivo)}</strong><span class="objective-score-change">Automática ${esc(a.automatica)}/5 → Líder ${esc(a.lider)}/5</span></div><p><b>Justificación:</b> ${esc(a.justificacion||'Sin justificación registrada.')}</p></article>`).join('')}</section>` : ''}
      ${autoEval?.objetivosNoAplican ? `<section class="objective-adjustment-context objective-governance-context"><div class="admin-panel-head"><div><span class="admin-section-kicker">MADUREZ DE OBJETIVOS</span><h3>Validación de ausencia de objetivos</h3></div></div><article class="objective-adjustment-card"><div><strong>Colaborador: N/A — sin objetivos definidos</strong><span class="objective-score-change">Líder: ${liderEval?.objetivosNoAplicanDecision==='rechazado'?'reporta que sí existían objetivos':'confirma ausencia de objetivos'}</span></div><p><b>Motivo del colaborador:</b> ${esc(autoEval.objetivosNoAplicanMotivo||'Sin motivo')} — ${esc(autoEval.objetivosNoAplicanDetalle||'Sin contexto')}</p><p><b>Contexto del líder:</b> ${esc(liderEval?.objetivosNoAplicanComentarioLider||'Pendiente de documentar')}</p></article></section>` : ''}
      <h3>Diferencias detalladas por competencia</h3>
      <table class="table">
        <thead><tr><th>Competencia</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Diferencia</th><th>Brecha</th><th>Comentario líder</th><th>Comentario colaborador</th></tr></thead>
        <tbody>
        ${filas.map((f) => {
          const na = f.auto === 'N/A' || f.lider === 'N/A' || f.auto === null || f.lider === null;
          const diff = na ? null : (Number(f.lider) - Number(f.auto));
          const brecha = na ? { etiqueta: 'Sin datos', color: '#6c757d' } : C.clasificarBrecha(diff);
          const rowClass = na ? '' : (diff > 0 ? 'row-lider-mayor' : (diff < 0 ? 'row-auto-mayor' : ''));
          const destacar = !na && brecha.etiqueta === 'Brecha significativa' ? ' row-brecha-critica' : '';
          return `<tr class="${rowClass}${destacar}"><td>${esc(f.nombre)}</td><td>${esc(f.auto)}</td><td>${esc(f.lider)}</td><td>${na ? '—' : (diff > 0 ? '+' : '') + f1(diff)}</td><td>${badge(brecha.etiqueta, brecha.etiqueta === 'Alineada' ? 'green' : (brecha.etiqueta === 'Revisar' ? 'yellow' : (brecha.etiqueta === 'Sin datos' ? 'gray' : 'red')))}</td><td>${esc(f.comentarioLider)}</td><td>${esc(f.comentarioAuto)}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
      <h3>Ubicación en la Matriz 9-Box</h3>
      ${ninaBoxHtml}
      <p class="muted">Estado actual del proceso: ${badge(estado)}. La calibración y liberación de retroalimentación las gestiona el administrador de RH.</p>
      ${cal && cal.retroHabilitada ? `<section class="leader-release-card"><div class="feedback-signing-head"><div><span class="admin-section-kicker">CIERRE DE RETROALIMENTACIÓN</span><h3>Reunión, acuerdos y firma</h3><p>Confirma la reunión, ajusta los acuerdos si es necesario y libera la versión final antes de firmar.</p></div><div class="document-actions"><button class="btn btn-outline btn-sm" onclick="App.descargarRetroalimentacion('${colaboradorId}','${periodoId}')">Descargar constancia</button><button class="btn btn-outline btn-sm" onclick="App.imprimirRetroalimentacion('${colaboradorId}','${periodoId}')">Imprimir / Guardar PDF</button></div></div><label class="confirm-check"><input type="checkbox" ${cal.reunionLiderRealizada?'checked':''} ${cal.firmaLider?'disabled':''} onchange="App.confirmarReunionLider('${colaboradorId}','${periodoId}',this.checked)"/> Confirmo que ya realicé la reunión de retroalimentación con el colaborador.</label><label class="calibration-field" style="margin-top:14px"><span>Acuerdos finales de la reunión</span><textarea id="feedbackAgreements-${colaboradorId}" ${cal.acuerdosLiberados?'disabled':''} placeholder="Documenta compromisos, responsables y acuerdos finales...">${esc(cal.acuerdosFinales||'')}</textarea></label><div class="actions"><button class="btn btn-primary" ${cal.reunionLiderRealizada&&!cal.acuerdosLiberados&&!cal.firmaLider?'':'disabled'} onclick="App.liberarAcuerdos('${colaboradorId}','${periodoId}')">${cal.acuerdosLiberados?'✓ Acuerdos liberados':'Guardar y liberar acuerdos para firma'}</button></div><div class="signature-own-flow leader-signature-grid">${renderSignatureCard('lider',col,periodoId,cal,!cal.acuerdosLiberados?'Libera primero los acuerdos finales.':null)}${renderOtherPartySignatureStatus('colaborador',cal)}</div></section>` : ''}
    </div>`;
  }

  // =========================================================================
  // PORTAL ADMINISTRADOR
  // =========================================================================
  function renderAdmin(page, param) {
    const periodoId = state.periodo.id;
    if (page === 'calibracion') return param ? viewCalibracionDetalle(param, periodoId) : viewCalibracionLista(periodoId);
    if (page === '9box') return view9BoxAdmin(periodoId);
    if (page === 'usuarios') return viewAdminUsuarios();
    if (page === 'jerarquias') return viewAdminJerarquias(periodoId);
    if (page === 'auditoria') return viewAuditoria();
    if (page === 'config') return viewConfig();
    return apiReadMode() ? viewAdminDashboardApi() : viewAdminDashboard(periodoId);
  }

  function viewAdminDashboardApi() {
    const d = state.remote.dashboard || {};
    const p = d.progress || {}, c = d.calibration || {}, f = d.feedback || {}, a = d.alerts || {}, tlt = d.talent || {}, o = d.objectives || {};
    const total = Number(p.totalEmployees || 0);
    const avance = Number(p.cycleProgressPercent || 0);
    const cerradas = Number(f.closed || p.closed || 0);
    const semaforoAvance = avance >= 90 ? 'green' : avance >= 60 ? 'yellow' : 'red';
    const selfDone = Number(p.selfCompleted || 0), selfPending = Number(p.selfPending ?? Math.max(0,total-selfDone));
    const leaderDone = Number(p.leaderCompleted || 0), leaderPending = Number(p.leaderPending ?? Math.max(0,total-leaderDone));
    const calPending = Number(c.pending || 0), calDone = Number(c.completed || 0);
    const avgCal = c.averageCalibratedScore ?? c.averageScore ?? null;
    const overdueSelf = (a.overdueSelfEvaluations && a.overdueSelfEvaluations.count) || 0;
    const overdueLeader = (a.overdueLeaderEvaluations && a.overdueLeaderEvaluations.count) || 0;
    const overdueFeedback = (a.overdueFeedback && a.overdueFeedback.count) || 0;
    const pendingSignature = Number(f.pendingLeaderSignature || 0) + Number(f.pendingEmployeeSignature || 0);
    const nine = Array.isArray(tlt.nineBoxDistribution) ? tlt.nineBoxDistribution : [];
    const avgAtt = tlt.averageAttitude ?? null, avgPerf = tlt.averagePerformance ?? null;
    const noObjPeople = Array.isArray(o.withoutObjectivesEmployees) ? o.withoutObjectivesEmployees : [];
    const noObjAreas = Array.isArray(o.withoutObjectivesByArea) ? o.withoutObjectivesByArea : [];
    const overdueEmployees = (a.overdueSelfEvaluations && Array.isArray(a.overdueSelfEvaluations.employees)) ? a.overdueSelfEvaluations.employees : [];

    const metricTabs = [['avance','Avance'],['objetivos','Objetivos'],['calibracion','Calibración'],['retro','Retroalimentación'],['alertas','Alertas'],['talento','Talento']];
    let detalle = '';
    if (state.adminKpiGroup === 'avance') {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid">
        <article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">COBERTURA</span><h2>Estado del ciclo</h2><p>Información consolidada directamente desde n8n + Airtable.</p></div><button class="btn btn-outline btn-sm" onclick="App.recargarBackend()">Actualizar datos</button></div>
        <div class="backend-progress-cards"><div><span>Autoevaluación</span><strong>${selfDone}/${total}</strong>${progressBar(total ? selfDone/total*100 : 0)}</div><div><span>Evaluación de líder</span><strong>${leaderDone}/${total}</strong>${progressBar(total ? leaderDone/total*100 : 0)}</div><div><span>Cierre</span><strong>${cerradas}/${total}</strong>${progressBar(avance)}</div></div></article>
      </div>`;
    } else if (state.adminKpiGroup === 'objetivos') {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid"><article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">MADUREZ DE GESTIÓN</span><h2>Cobertura de objetivos</h2><p>La ausencia de objetivos es un indicador de gestión; no se interpreta automáticamente como bajo desempeño del colaborador.</p></div></div>
        <div class="backend-objective-summary"><div><span>Con objetivos</span><strong>${o.withObjectives ?? '—'}</strong></div><div><span>Sin objetivos</span><strong>${o.withoutObjectives ?? '—'}</strong></div><div><span>Cobertura</span><strong>${o.coveragePercent ?? '—'}%</strong></div></div>
        ${o.dataGapNote ? `<div class="backend-data-gap"><strong>Gap de datos actual</strong><span>${esc(o.dataGapNote)}</span></div>` : ''}
        ${noObjAreas.length ? `<div class="objective-area-summary">${noObjAreas.map(x=>`<span><b>${esc(x.area||x.name||'Área')}</b> ${esc(x.count ?? x.withoutObjectives ?? '—')}${x.percentage!=null?' · '+esc(x.percentage)+'%':''}</span>`).join('')}</div>` : ''}
        ${noObjPeople.length ? `<div class="objective-maturity-list">${noObjPeople.slice(0,30).map(x=>`<div><span><b>${esc(x.name||x.employeeName||x.employeeId||'Colaborador')}</b><small>${esc(x.area||'')}</small></span><span><small>${esc(x.reason||'Sin motivo persistido en Airtable')}</small></span></div>`).join('')}</div>` : ''}
      </article></div>`;
    } else if (state.adminKpiGroup === 'calibracion') {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid"><article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">CALIBRACIÓN</span><h2>Seguimiento de revisión DO</h2></div></div><div class="backend-objective-summary"><div><span>Pendientes</span><strong>${calPending}</strong></div><div><span>Calibradas</span><strong>${calDone}</strong></div><div><span>Promedio calibrado</span><strong>${avgCal==null?'—':f1(avgCal)}</strong></div></div><p class="backend-read-note">Los detalles y acciones de calibración permanecen sin escritura hasta conectar la siguiente capa del backend.</p></article></div>`;
    } else if (state.adminKpiGroup === 'retro') {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid"><article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">RETROALIMENTACIÓN</span><h2>Cierre y firmas</h2></div></div><div class="backend-signature-grid">${kpi('Liberadas',f.released??0)}${kpi('Pendiente reunión',f.pendingMeeting??0,'yellow')}${kpi('Firma líder pendiente',f.pendingLeaderSignature??0,'yellow')}${kpi('Firma colaborador pendiente',f.pendingEmployeeSignature??0,'yellow')}${kpi('Cerradas',f.closed??0,'green')}</div></article></div>`;
    } else if (state.adminKpiGroup === 'alertas') {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid"><article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">ALERTAS</span><h2>Seguimiento requerido</h2><p>Personas y etapas que requieren atención durante el ciclo.</p></div></div>
        <div class="backend-objective-summary"><div><span>Autoevaluación vencida</span><strong>${overdueSelf}</strong></div><div><span>Evaluación líder vencida</span><strong>${overdueLeader}</strong></div><div><span>Retroalimentación vencida</span><strong>${overdueFeedback}</strong></div><div><span>Firmas pendientes</span><strong>${pendingSignature}</strong></div></div>
        ${overdueEmployees.length ? `<div class="admin-table-wrap"><table class="table"><thead><tr><th>Colaborador</th><th>Área</th><th>Líder</th><th>Fecha límite</th></tr></thead><tbody>${overdueEmployees.slice(0,50).map(x=>`<tr><td><strong>${esc(x.name||x.employeeName||x.employeeId||'—')}</strong></td><td>${esc(x.area||'—')}</td><td>${esc(x.leader||x.leaderName||'—')}</td><td>${esc(x.deadline||'—')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No hay detalle de colaboradores para esta alerta.</p>'}
      </article></div>`;
    } else {
      detalle = `<div class="admin-dashboard-grid backend-admin-grid"><article class="admin-panel admin-panel-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">TALENTO</span><h2>Distribución 9-Box</h2><p>Vista agregada de la distribución disponible en backend.</p></div></div>
        <div class="backend-talent-summary"><div><span>Actitud promedio</span><strong>${avgAtt==null?'—':f1(avgAtt)}</strong></div><div><span>Desempeño promedio</span><strong>${avgPerf==null?'—':f1(avgPerf)}</strong></div></div>
        <div class="backend-ninebox-grid">${nine.length ? nine.map(x=>`<article><span>Cuadrante ${esc(x.quadrant??'—')}</span><strong>${esc(x.count??0)}</strong><small>${esc(x.name||'')}</small></article>`).join('') : '<div class="backend-empty-wide"><strong>Sin distribución disponible</strong><span>Se poblará conforme existan evaluaciones con resultado.</span></div>'}</div>
      </article></div>`;
    }

    return `<section class="admin-premium-shell backend-admin-premium">
      <div class="admin-premium-hero"><div><span class="admin-kicker">PANEL DE DESARROLLO ORGANIZACIONAL · DATOS EN VIVO</span><h1>Evaluación de Desempeño</h1><p>Seguimiento del ciclo con información real de n8n + Airtable, conservando la experiencia completa del portal.</p></div><div class="admin-hero-progress progress-${semaforoAvance}"><div class="admin-progress-value">${avance.toFixed(0)}%</div><div><strong>Avance del ciclo</strong><span>${cerradas} de ${total} evaluaciones cerradas</span></div></div></div>
      <div class="admin-metric-switcher" role="tablist" aria-label="Tipo de métricas">${metricTabs.map(([id,label])=>`<button type="button" class="admin-metric-tab ${state.adminKpiGroup===id?'active':''}" onclick="App.setAdminKpiGroup('${id}')">${label}</button>`).join('')}</div>
      <div class="admin-kpi-grid admin-kpi-grid-focused">
        ${state.adminKpiGroup==='avance'?`<div class="admin-kpi-card"><span>Personal a evaluar</span><strong>${total}</strong><small>Universo del periodo</small></div><div class="admin-kpi-card"><span>Autoevaluaciones</span><strong>${selfDone}/${total}</strong><small>${selfPending} pendientes</small></div><div class="admin-kpi-card"><span>Evaluaciones líder</span><strong>${leaderDone}/${total}</strong><small>${leaderPending} pendientes</small></div><div class="admin-kpi-card"><span>Cierre del ciclo</span><strong>${cerradas}/${total}</strong><small>${avance.toFixed(0)}% cerrado</small></div>`:''}
        ${state.adminKpiGroup==='objetivos'?`<div class="admin-kpi-card success"><span>Cobertura de objetivos</span><strong>${o.coveragePercent??'—'}%</strong><small>${o.withObjectives??'—'} con objetivos</small></div><div class="admin-kpi-card attention"><span>Sin objetivos</span><strong>${o.withoutObjectives??'—'}</strong><small>Gap de gestión</small></div>`:''}
        ${state.adminKpiGroup==='calibracion'?`<div class="admin-kpi-card attention"><span>Por calibrar</span><strong>${calPending}</strong><small>Requieren revisión DO</small></div><div class="admin-kpi-card success"><span>Calibradas</span><strong>${calDone}</strong><small>Con resultado</small></div><div class="admin-kpi-card"><span>Promedio calibrado</span><strong>${avgCal==null?'—':f1(avgCal)}</strong><small>Resultado disponible</small></div>`:''}
        ${state.adminKpiGroup==='retro'?`<div class="admin-kpi-card success"><span>Liberadas</span><strong>${f.released??0}</strong><small>Para retroalimentación</small></div><div class="admin-kpi-card attention"><span>Firma líder</span><strong>${f.pendingLeaderSignature??0}</strong><small>Pendientes</small></div><div class="admin-kpi-card attention"><span>Firma colaborador</span><strong>${f.pendingEmployeeSignature??0}</strong><small>Pendientes</small></div><div class="admin-kpi-card"><span>Cerradas</span><strong>${f.closed??0}</strong><small>${f.closurePercent??0}% de cierre</small></div>`:''}
        ${state.adminKpiGroup==='alertas'?`<div class="admin-kpi-card attention"><span>Autoevaluaciones vencidas</span><strong>${overdueSelf}</strong><small>Requieren seguimiento</small></div><div class="admin-kpi-card attention"><span>Evaluaciones líder vencidas</span><strong>${overdueLeader}</strong><small>Seguimiento con liderazgo</small></div><div class="admin-kpi-card"><span>Firmas pendientes</span><strong>${pendingSignature}</strong><small>Proceso sin cerrar</small></div>`:''}
        ${state.adminKpiGroup==='talento'?`<div class="admin-kpi-card"><span>Actitud promedio</span><strong>${avgAtt==null?'—':f1(avgAtt)}</strong><small>Base disponible</small></div><div class="admin-kpi-card"><span>Desempeño promedio</span><strong>${avgPerf==null?'—':f1(avgPerf)}</strong><small>Base disponible</small></div><div class="admin-kpi-card"><span>Cuadrantes con datos</span><strong>${nine.filter(x=>Number(x.count||0)>0).length}</strong><small>Distribución 9-Box</small></div>`:''}
      </div>
      ${detalle}
      ${(()=>{
        const areaData = Array.isArray(p.byArea)?p.byArea:(Array.isArray(p.areas)?p.areas:(Array.isArray(d.areas)?d.areas:[]));
        const calRows=[...((state.remote.calibration&&state.remote.calibration.pending)||[]),...((state.remote.calibration&&state.remote.calibration.calibrated)||[]),...((state.remote.calibration&&state.remote.calibration.closed)||[])];
        const peopleMap=new Map();
        overdueEmployees.forEach(x=>peopleMap.set(String(x.employeeId||x.id||x.name),Object.assign({attention:'Autoevaluación vencida'},x)));
        calRows.forEach(x=>peopleMap.set(String(x.employeeId||x.id||x.name),Object.assign({attention:x.status==='pending_calibration'?'Pendiente de calibración':x.status==='closed'?'Cerrada':'Calibración'},x)));
        const people=[...peopleMap.values()];
        const areaHtml=areaData.length?areaData.map(a=>{const name=a.area||a.name||'Área';const done=Number(a.completed??a.closed??a.evaluated??0);const at=Number(a.total??a.employees??0);const per=a.percentage??a.progressPercent??(at?done/at*100:0);return `<div class="admin-area-progress-row"><div><strong>${esc(name)}</strong><small>${done}/${at} completadas</small></div>${progressBar(per)}<b>${Math.round(Number(per)||0)}%</b></div>`}).join(''):`<div class="backend-data-gap compact"><strong>Desglose por área pendiente del endpoint</strong><span>La estructura visual está lista; se poblará cuando /admin/dashboard exponga avance por área.</span></div>`;
        const peopleHtml=people.length?`<div class="admin-table-wrap"><table class="table admin-table"><thead><tr><th>Colaborador</th><th>Área</th><th>Etapa / atención</th><th>Resultado</th><th></th></tr></thead><tbody>${people.slice(0,30).map(x=>`<tr><td><strong>${esc(x.name||x.employeeName||x.employeeId||'—')}</strong><small>${esc(x.position||'')}</small></td><td>${esc(x.area||'—')}</td><td>${badge(x.attention||x.status||'Seguimiento')}</td><td>${x.leaderResult!=null?f1(x.leaderResult):'—'}</td><td>${x.evaluationId?`<a class="btn btn-outline btn-sm" href="#/admin/calibracion/${encodeURIComponent(String(x.employeeId||''))}">Revisar</a>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<div class="admin-empty-state">Sin personas con alertas o actividad disponible en los endpoints actuales.</div>';
        return `<div class="admin-dashboard-grid do-restored-grid"><article class="admin-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">COBERTURA POR ÁREA</span><h2>Avance de evaluación</h2><p>Recuperamos la lectura ejecutiva por área sin mezclar información demo.</p></div></div><div class="admin-area-progress-list">${areaHtml}</div></article><article class="admin-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">TALENTO</span><h2>Resumen 9-Box</h2></div><a class="btn btn-outline btn-sm" href="#/admin/9box">Abrir matriz</a></div><div class="backend-ninebox-grid compact">${nine.length?nine.map(x=>`<article><span>${esc(x.quadrant??'—')}</span><strong>${esc(x.count??0)}</strong><small>${esc(x.name||'')}</small></article>`).join(''):'<div class="backend-empty-wide">Sin distribución disponible todavía.</div>'}</div></article></div><article class="admin-panel admin-people-summary-restored"><div class="admin-panel-head"><div><span class="admin-section-kicker">OPERACIÓN DO</span><h2>Resumen de empleados y seguimiento</h2><p>Personas visibles actualmente por alertas, calibración o cierre.</p></div><span class="admin-panel-note">${people.length} visibles</span></div>${peopleHtml}</article><div class="admin-dashboard-grid do-alerts-restored"><article class="admin-panel"><span class="admin-section-kicker">VENCIMIENTOS</span><h2>Evaluaciones fuera de fecha</h2><div class="backend-objective-summary"><div><span>Autoevaluación</span><strong>${overdueSelf}</strong></div><div><span>Evaluación líder</span><strong>${overdueLeader}</strong></div><div><span>Retroalimentación</span><strong>${overdueFeedback}</strong></div></div></article><article class="admin-panel"><span class="admin-section-kicker">CIERRE</span><h2>Firmas y retroalimentación</h2><div class="backend-objective-summary"><div><span>Liberadas</span><strong>${f.released??0}</strong></div><div><span>Firma líder</span><strong>${f.pendingLeaderSignature??0}</strong></div><div><span>Firma colaborador</span><strong>${f.pendingEmployeeSignature??0}</strong></div></div></article></div>`;
      })()}
      <article class="admin-panel demo-readiness-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">LISTO PARA DEMO</span><h2>Flujo de punta a punta</h2><p>Lectura rápida para presentar el avance sin entrar a cada módulo.</p></div></div><div class="demo-flow-strip"><span class="done">1 · Autoevaluación</span><span class="done">2 · Evaluación líder</span><span class="${calPending||calDone?'done':''}">3 · Calibración DO</span><span class="${Number(f.released||0)>0?'done':''}">4 · Retroalimentación</span><span class="${Number(f.closed||0)>0?'done':''}">5 · Cierre</span></div></article>
      <div class="backend-live-footer"><span><i></i> Lectura backend activa</span><small>Datos reales; los módulos sin información muestran el gap en lugar de datos demo.</small><button class="btn btn-outline btn-sm" onclick="App.recargarBackend()">Actualizar</button></div>
    </section>`;
  }

  // =========================================================================
  // ADMIN — USUARIOS (consulta, beta 3 — preparación Excel maestro/Airtable)
  // =========================================================================
  function todosLosUsuariosCompletos() {
    const colaboradores = S.getTodosColaboradores().map((c) => Object.assign({ rolPlataforma: 'Colaborador' }, c));
    const lideres = S.getTodosLideres().map((l) => Object.assign({ rolPlataforma: 'Líder' }, l));
    const administradores = S.getTodosAdministradores().map((a) => Object.assign({ rolPlataforma: 'Administrador' }, a));
    return colaboradores.concat(lideres, administradores);
  }
  function nombreLiderDe(liderId) {
    if (!liderId) return null;
    const l = S.getLider(liderId);
    return l ? l.nombre : liderId;
  }

  function viewAdminUsuarios() {
    const filtros = state.usuariosFiltros;
    const todos = todosLosUsuariosCompletos();
    const areas = Array.from(new Set(todos.map((u) => u.area).filter(Boolean))).sort();
    const filtrados = todos.filter((u) => {
      if (filtros.area && u.area !== filtros.area) return false;
      if (filtros.rol && u.rolPlataforma !== filtros.rol) return false;
      if (filtros.estatus && u.estatusEmpleado !== filtros.estatus) return false;
      if (filtros.lider === 'con' && !u.liderId) return false;
      if (filtros.lider === 'sin' && (u.liderId || u.rolPlataforma !== 'Colaborador')) return false;
      if (filtros.correo === 'con' && !u.correoCorporativo) return false;
      if (filtros.correo === 'sin' && u.correoCorporativo) return false;
      return true;
    });

    return `
    <div class="card">
      <h2>Usuarios</h2>
      <p class="muted">Vista de solo consulta. Origen previsto: Excel maestro de usuarios sincronizado a Airtable vía n8n (tabla <code>Empleados</code>, ver README). Aún no se implementa edición masiva ni importación directa desde el navegador (ver requerimiento 17 del brief).</p>
      <div class="filters-bar">
        <select onchange="App.setFiltroUsuarios('area', this.value)"><option value="">Todas las áreas</option>${areas.map((a) => `<option value="${esc(a)}" ${filtros.area === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>
        <select onchange="App.setFiltroUsuarios('rol', this.value)"><option value="">Todos los roles</option><option ${filtros.rol === 'Colaborador' ? 'selected' : ''}>Colaborador</option><option ${filtros.rol === 'Líder' ? 'selected' : ''}>Líder</option><option ${filtros.rol === 'Administrador' ? 'selected' : ''}>Administrador</option></select>
        <select onchange="App.setFiltroUsuarios('estatus', this.value)"><option value="">Todos los estatus</option><option ${filtros.estatus === 'Activo' ? 'selected' : ''}>Activo</option><option ${filtros.estatus === 'Inactivo' ? 'selected' : ''}>Inactivo</option></select>
        <select onchange="App.setFiltroUsuarios('lider', this.value)"><option value="">Con/sin líder (todos)</option><option value="con" ${filtros.lider === 'con' ? 'selected' : ''}>Con líder</option><option value="sin" ${filtros.lider === 'sin' ? 'selected' : ''}>Sin líder</option></select>
        <select onchange="App.setFiltroUsuarios('correo', this.value)"><option value="">Con/sin correo (todos)</option><option value="con" ${filtros.correo === 'con' ? 'selected' : ''}>Con correo</option><option value="sin" ${filtros.correo === 'sin' ? 'selected' : ''}>Sin correo</option></select>
        <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosUsuarios()">Limpiar filtros</button>
      </div>
      <table class="table">
        <thead><tr><th>No. empleado</th><th>Nombre</th><th>Correo</th><th>Puesto</th><th>Área</th><th>Rol</th><th>Estatus</th><th>Líder asignado</th><th>Correo validado</th><th>Última actualización</th></tr></thead>
        <tbody>
        ${filtrados.map((u) => `<tr class="${(u.rolPlataforma === 'Colaborador' && !u.liderId) ? 'row-sin-lider' : ''}">
          <td>${esc(u.empleado)}</td>
          <td>${esc(u.nombre)}</td>
          <td>${u.correoCorporativo ? esc(A.maskEmail(u.correoCorporativo)) : '<span class="muted">Sin correo</span>'}</td>
          <td>${esc(u.puesto)}</td>
          <td>${esc(u.area)}</td>
          <td>${esc(u.rolPlataforma)}</td>
          <td>${badge(u.estatusEmpleado || '—', u.estatusEmpleado === 'Activo' ? 'green' : 'gray')}</td>
          <td>${u.rolPlataforma === 'Colaborador' ? (u.liderId ? esc(nombreLiderDe(u.liderId)) : badge('Sin líder asignado', 'red')) : '<span class="muted">N/A</span>'}</td>
          <td>${u.correoValidado ? badge('Validado', 'green') : badge('Pendiente', 'yellow')}</td>
          <td>${esc(u.ultimaActualizacion || '—')}</td>
        </tr>`).join('') || `<tr><td colspan="10" class="muted">Sin resultados para los filtros aplicados.</td></tr>`}
        </tbody>
      </table>
      <p class="muted">${filtrados.length} de ${todos.length} usuarios.</p>
    </div>`;
  }

  // =========================================================================
  // ADMIN — JERARQUÍAS (consulta, beta 3)
  // =========================================================================
  function viewAdminJerarquias(periodoId) {
    const filtros = state.jerarquiasFiltros;
    const jerarquias = S.getJerarquias();
    const filas = jerarquias.map((j) => {
      const col = S.getColaborador(j.numeroEmpleado);
      const lider = j.numeroLider ? S.getLider(j.numeroLider) : null;
      return { j, col, lider };
    }).filter((f) => f.col);
    const sinLider = filas.filter((f) => !f.j.numeroLider);

    const filtradas = filas.filter((f) => {
      if (filtros.estado === 'con' && !f.j.numeroLider) return false;
      if (filtros.estado === 'sin' && f.j.numeroLider) return false;
      if (filtros.periodo && f.j.periodo !== filtros.periodo) return false;
      return true;
    });
    const periodos = Array.from(new Set(jerarquias.map((j) => j.periodo)));

    return `
    <div class="card">
      <h2>Jerarquías</h2>
      <p class="muted">Origen previsto: tabla <code>Asignaciones</code> del Excel maestro sincronizada a Airtable vía n8n. Las relaciones siempre usan <code>numeroEmpleado</code>/<code>numeroLider</code>, nunca el nombre (ver requerimiento 8 del brief).</p>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Asignaciones totales', filas.length)}
        ${kpi('Con líder asignado', filas.length - sinLider.length, 'green')}
        ${kpi('Sin líder asignado', sinLider.length, sinLider.length ? 'red' : 'gray')}
      </div>
      <div class="filters-bar">
        <select onchange="App.setFiltroJerarquias('estado', this.value)"><option value="">Con/sin líder (todos)</option><option value="con" ${filtros.estado === 'con' ? 'selected' : ''}>Con líder</option><option value="sin" ${filtros.estado === 'sin' ? 'selected' : ''}>Sin líder</option></select>
        <select onchange="App.setFiltroJerarquias('periodo', this.value)"><option value="">Todos los periodos</option>${periodos.map((p) => `<option value="${esc(p)}" ${filtros.periodo === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosJerarquias()">Limpiar filtros</button>
      </div>
      <table class="table">
        <thead><tr><th>Asignación</th><th>Colaborador</th><th>Líder asignado</th><th>Periodo</th><th>Tipo</th><th>Vigencia</th><th>Estado</th></tr></thead>
        <tbody>
        ${filtradas.map((f) => `<tr class="${!f.j.numeroLider ? 'row-sin-lider' : ''}">
          <td>${esc(f.j.idAsignacion)}</td>
          <td>${esc(f.col.nombre)} <span class="muted">(${esc(f.j.numeroEmpleado)})</span></td>
          <td>${f.lider ? esc(f.lider.nombre) + ' <span class="muted">(' + esc(f.j.numeroLider) + ')</span>' : badge('Sin líder asignado', 'red')}</td>
          <td>${esc(f.j.periodo)}</td>
          <td>${esc(f.j.tipoAsignacion)}</td>
          <td>${esc(f.j.fechaInicio)} — ${f.j.fechaFin ? esc(f.j.fechaFin) : 'vigente'}</td>
          <td>${badge(f.j.asignacionActiva ? 'Activa' : 'Inactiva', f.j.asignacionActiva ? 'green' : 'gray')}</td>
        </tr>`).join('') || `<tr><td colspan="7" class="muted">Sin resultados para los filtros aplicados.</td></tr>`}
        </tbody>
      </table>
      ${sinLider.length ? `<p class="alert alert-warning">${sinLider.length} colaborador(es) no tienen líder asignado y por lo tanto no pueden avanzar en el flujo de evaluación del líder hasta que se asigne uno en el Excel maestro.</p>` : ''}
    </div>`;
  }

  function datosGlobales(periodoId) {
    const colaboradores = S.getTodosColaboradores();
    return colaboradores.map((c) => {
      const estado = S.estadoProceso(c.empleado, periodoId);
      const resLider = S.getUltimoResultadoPorOrigen(c.empleado, periodoId, 'lider');
      const cal = S.getCalibracion(c.empleado, periodoId);
      const totalFinal = cal ? cal.resultadoCalibrado : (resLider ? resLider?.puntajes?.total : null);
      const nivel = C.clasificarNivel(totalFinal);
      const cuad = resLider ? C.asignarCuadrante(resLider?.promedios?.actitud, resLider?.promedios?.desempeno) : { cuadrante: null, info: null };
      return { c, estado, totalFinal, nivel, cuad, promedios: resLider?.promedios || null };
    });
  }

  function viewAdminDashboard(periodoId) {
    const datos = datosGlobales(periodoId);
    const total = datos.length;
    const autoCompletadas = datos.filter((d) => S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion') && S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion').estado === D.ESTADOS.COMPLETADA).length;
    const liderCompletadas = datos.filter((d) => S.getEvaluacion(d.c.empleado, periodoId, 'lider') && S.getEvaluacion(d.c.empleado, periodoId, 'lider').estado === D.ESTADOS.COMPLETADA).length;
    const calibradas = datos.filter((d) => S.getCalibracion(d.c.empleado, periodoId)).length;
    const cerradas = datos.filter((d) => d.estado === D.ESTADOS.CERRADA).length;
    const pendientesCal = datos.filter((d) => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION).length;
    const vencidas = datos.filter((d) => {
      const auto = S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion');
      return (!auto || auto.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteAutoevaluacion);
    }).length;
    const avanceNacional = total ? pct((cerradas / total) * 100) : 0;
    const semaforoAvance = avanceNacional >= 90 ? 'green' : avanceNacional >= 60 ? 'yellow' : 'red';
    const promedios = datos.filter((d) => d.totalFinal !== null).map((d) => d.totalFinal);
    const promedioGeneral = promedios.length ? promedios.reduce((a, b) => a + b, 0) / promedios.length : null;
    const retroLiberadas = datos.filter((d)=>S.getCalibracion(d.c.empleado,periodoId)?.acuerdosLiberados).length;
    const firmaLiderCount = datos.filter((d)=>S.getCalibracion(d.c.empleado,periodoId)?.firmaLider).length;
    const firmaColaboradorCount = datos.filter((d)=>S.getCalibracion(d.c.empleado,periodoId)?.firmaColaborador).length;
    const retroFirmadas = datos.filter((d)=>{const c=S.getCalibracion(d.c.empleado,periodoId);return c?.firmaLider&&c?.firmaColaborador;}).length;
    const pendientesFirma = Math.max(0, retroLiberadas-retroFirmadas);

    const filtros = state.adminFiltros;
    const areas = [...new Set(datos.map((d) => d.c.area))];
    const objetivosConDefinicion = datos.filter((d)=>{ const a=S.getEvaluacion(d.c.empleado,periodoId,'autoevaluacion'); return a && !a.objetivosNoAplican && S.getObjetivos(a.id).some(o=>(o.descripcion||'').trim()); }).length;
    const objetivosSinDefinicion = datos.filter((d)=>S.getEvaluacion(d.c.empleado,periodoId,'autoevaluacion')?.objetivosNoAplican).length;
    const objetivosPendientesDefinir = Math.max(0,total-objetivosConDefinicion-objetivosSinDefinicion);
    const coberturaObjetivos = total ? pct((objetivosConDefinicion/total)*100) : 0;
    const sinObjetivosPorArea = areas.map(a=>{ const arr=datos.filter(d=>d.c.area===a); const sin=arr.filter(d=>S.getEvaluacion(d.c.empleado,periodoId,'autoevaluacion')?.objetivosNoAplican).length; return {area:a,sin,total:arr.length,pct:arr.length?pct(sin/arr.length*100):0}; }).filter(x=>x.sin>0).sort((a,b)=>b.pct-a.pct);

    const filtrados = datos.filter((d) => (!filtros.area || d.c.area === filtros.area) && (!filtros.estado || d.estado === filtros.estado) && (!filtros.cuadrante || String(d.cuad.cuadrante) === filtros.cuadrante));

    const avancePorArea = areas.map((a) => {
      const arr = datos.filter((d) => d.c.area === a);
      const cerr = arr.filter((d) => d.estado === D.ESTADOS.CERRADA).length;
      return { area: a, pct: arr.length ? pct((cerr / arr.length) * 100) : 0, total: arr.length, completadas: cerr };
    });

    const nivelesCount = {};
    D.REFERENCIA_NIVELES.forEach((n) => nivelesCount[n.nivel] = 0);
    datos.forEach((d) => { if (d.totalFinal !== null) nivelesCount[d.nivel.nivel] = (nivelesCount[d.nivel.nivel] || 0) + 1; });

    const cuadranteCount = {}; for (let i = 1; i <= 9; i++) cuadranteCount[i] = 0;
    datos.forEach((d) => { if (d.cuad.cuadrante) cuadranteCount[d.cuad.cuadrante]++; });
    const ranking = avancePorArea.slice().sort((a, b) => a.pct - b.pct);

    return `
    <section class="admin-premium-shell">
      <div class="admin-premium-hero">
        <div>
          <span class="admin-kicker">PANEL DE DESARROLLO ORGANIZACIONAL · ${esc(periodoId)}</span>
          <h1>Evaluación de Desempeño</h1>
          <p>Seguimiento nacional, calibración, cierre y distribución de talento en un solo lugar.</p>
        </div>
        <div class="admin-hero-progress progress-${semaforoAvance}">
          <div class="admin-progress-value">${avanceNacional}%</div>
          <div><strong>Avance del ciclo</strong><span>${cerradas} de ${total} evaluaciones cerradas</span></div>
        </div>
      </div>

      <div class="admin-metric-switcher" role="tablist" aria-label="Tipo de métricas">
        ${[['avance','Avance'],['objetivos','Objetivos'],['calibracion','Calibración'],['retro','Retroalimentación'],['alertas','Alertas'],['talento','Talento']].map(([id,label])=>`<button type="button" class="admin-metric-tab ${state.adminKpiGroup===id?'active':''}" onclick="App.setAdminKpiGroup('${id}')">${label}</button>`).join('')}
      </div>
      <div class="admin-kpi-grid admin-kpi-grid-focused">
        ${state.adminKpiGroup==='avance' ? `
          <div class="admin-kpi-card"><span>Personal a evaluar</span><strong>${total}</strong><small>Universo del periodo</small></div>
          <div class="admin-kpi-card"><span>Autoevaluaciones</span><strong>${autoCompletadas}/${total}</strong><small>${total ? pct(autoCompletadas/total*100) : 0}% completadas</small></div>
          <div class="admin-kpi-card"><span>Evaluaciones líder</span><strong>${liderCompletadas}/${total}</strong><small>${total ? pct(liderCompletadas/total*100) : 0}% completadas</small></div>
          <div class="admin-kpi-card"><span>Cierre del ciclo</span><strong>${cerradas}/${total}</strong><small>${avanceNacional}% cerrado</small></div>` : ''}
        ${state.adminKpiGroup==='objetivos' ? `
          <div class="admin-kpi-card success"><span>Cobertura de objetivos</span><strong>${coberturaObjetivos}%</strong><small>${objetivosConDefinicion}/${total} con objetivos documentados</small></div>
          <div class="admin-kpi-card attention"><span>Sin objetivos definidos</span><strong>${objetivosSinDefinicion}</strong><small>Sección C reportada como N/A</small></div>
          <div class="admin-kpi-card"><span>Pendientes de definir</span><strong>${objetivosPendientesDefinir}</strong><small>Aún sin captura o declaración</small></div>
          <div class="admin-kpi-card"><span>Áreas con casos</span><strong>${sinObjetivosPorArea.length}</strong><small>Con al menos una persona sin objetivos</small></div>` : ''}
        ${state.adminKpiGroup==='calibracion' ? `
          <div class="admin-kpi-card attention"><span>Por calibrar</span><strong>${pendientesCal}</strong><small>Requieren revisión DO</small></div>
          <div class="admin-kpi-card success"><span>Calibradas</span><strong>${calibradas}</strong><small>Con resultado DO</small></div>
          <div class="admin-kpi-card"><span>Promedio general</span><strong>${f1(promedioGeneral)}</strong><small>Resultado disponible</small></div>` : ''}
        ${state.adminKpiGroup==='retro' ? `
          <div class="admin-kpi-card success"><span>Retroalimentaciones cerradas</span><strong>${retroFirmadas}/${retroLiberadas}</strong><small>Con ambas firmas</small></div>
          <div class="admin-kpi-card attention"><span>Pendientes por firmar</span><strong>${pendientesFirma}</strong><small>Acuerdos liberados sin cierre</small></div>
          <div class="admin-kpi-card"><span>Firma del líder</span><strong>${firmaLiderCount}/${retroLiberadas}</strong><small>Confirmaciones registradas</small></div>
          <div class="admin-kpi-card"><span>Firma del colaborador</span><strong>${firmaColaboradorCount}/${retroLiberadas}</strong><small>Confirmaciones registradas</small></div>` : ''}
        ${state.adminKpiGroup==='alertas' ? `
          <div class="admin-kpi-card attention"><span>Autoevaluaciones vencidas</span><strong>${vencidas}</strong><small>Requieren seguimiento</small></div>
          <div class="admin-kpi-card attention"><span>Esperando calibración</span><strong>${pendientesCal}</strong><small>Acción de DO</small></div>
          <div class="admin-kpi-card"><span>Firmas pendientes</span><strong>${pendientesFirma}</strong><small>Acuerdos sin cierre</small></div>` : ''}
        ${state.adminKpiGroup==='talento' ? `
          <div class="admin-kpi-card"><span>Promedio general</span><strong>${f1(promedioGeneral)}</strong><small>Resultado global</small></div>
          <div class="admin-kpi-card"><span>Con resultado</span><strong>${promedios.length}/${total}</strong><small>Personas con puntaje disponible</small></div>
          <div class="admin-kpi-card"><span>Ubicados en 9-Box</span><strong>${datos.filter(d=>d.cuad.cuadrante).length}</strong><small>Talento clasificado</small></div>` : ''}
      </div>

      ${state.adminKpiGroup==='objetivos' && objetivosSinDefinicion ? `<section class="objective-maturity-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">MADUREZ DE GESTIÓN</span><h2>Personas sin objetivos definidos</h2><p>Este indicador no califica negativamente al colaborador; permite identificar brechas de definición y seguimiento de objetivos por área y liderazgo.</p></div></div><div class="objective-maturity-list">${datos.filter(d=>S.getEvaluacion(d.c.empleado,periodoId,'autoevaluacion')?.objetivosNoAplican).map(d=>{const a=S.getEvaluacion(d.c.empleado,periodoId,'autoevaluacion');return `<div><span><b>${esc(d.c.nombre)}</b><small>${esc(d.c.area)} · Líder: ${esc((S.getColaborador(d.c.liderId)||{}).nombre||d.c.liderId||'—')}</small></span><span><b>${esc(a.objetivosNoAplicanMotivo||'Sin motivo')}</b><small>${esc(a.objetivosNoAplicanDetalle||'Sin contexto')}</small></span></div>`}).join('')}</div>${sinObjetivosPorArea.length?`<div class="objective-area-summary">${sinObjetivosPorArea.map(x=>`<span><b>${esc(x.area)}</b> ${x.sin}/${x.total} · ${x.pct}%</span>`).join('')}</div>`:''}</section>` : ''}

      <div class="admin-dashboard-grid">
        <article class="admin-panel admin-panel-wide">
          <div class="admin-panel-head"><div><span class="admin-section-kicker">COBERTURA</span><h2>Avance por área</h2></div><span class="admin-panel-note">Cierre del proceso</span></div>
          <div class="admin-area-progress">
            ${avancePorArea.map((a) => `<div class="admin-area-row"><div><strong>${esc(a.area)}</strong><span>${a.completadas}/${a.total} completadas</span></div><div class="admin-area-track"><i style="width:${a.pct}%"></i></div><b>${a.pct}%</b></div>`).join('')}
          </div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><span class="admin-section-kicker">RESULTADOS</span><h2>Niveles de desempeño</h2></div></div>
          <div class="admin-distribution-list">
            ${Object.keys(nivelesCount).map((n) => `<div><span>${esc(n)}</span><strong>${nivelesCount[n]}</strong><i style="width:${total ? (nivelesCount[n]/total)*100 : 0}%"></i></div>`).join('')}
          </div>
        </article>

        <article class="admin-panel">
          <div class="admin-panel-head"><div><span class="admin-section-kicker">TALENTO</span><h2>Distribución 9-Box</h2></div><a href="#/admin/9box" class="admin-text-link">Abrir matriz →</a></div>
          <div class="admin-nine-mini">
            ${Object.keys(cuadranteCount).map((n) => `<div title="${esc(C.CUADRANTES_INFO[n].nombre)}"><span>${n}</span><b>${cuadranteCount[n]}</b><small>${esc(C.CUADRANTES_INFO[n].nombre)}</small></div>`).join('')}
          </div>
        </article>
      </div>

      <article class="admin-panel admin-pending-panel">
        <div class="admin-panel-head"><div><span class="admin-section-kicker">OPERACIÓN DO</span><h2>Seguimiento de evaluaciones</h2></div><span class="admin-panel-note">${filtrados.length} registros</span></div>
        <div class="filters-bar admin-filters">
          <select onchange="App.setFiltroAdmin('area', this.value)"><option value="">Todas las áreas</option>${areas.map((a) => `<option value="${a}" ${filtros.area === a ? 'selected' : ''}>${a}</option>`).join('')}</select>
          <select onchange="App.setFiltroAdmin('estado', this.value)"><option value="">Todos los estados</option>${Object.values(D.ESTADOS).map((e) => `<option value="${e}" ${filtros.estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
          <select onchange="App.setFiltroAdmin('cuadrante', this.value)"><option value="">Todos los cuadrantes</option>${[1,2,3,4,5,6,7,8,9].map((n) => `<option value="${n}" ${filtros.cuadrante === String(n) ? 'selected' : ''}>${n}. ${C.CUADRANTES_INFO[n].nombre}</option>`).join('')}</select>
          <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosAdmin()">Limpiar</button>
        </div>
        <div class="admin-table-wrap"><table class="table admin-table"><thead><tr><th>Colaborador</th><th>Área</th><th>Líder</th><th>Estado</th><th>Puntaje</th><th>9-Box</th><th>Firmas</th><th></th></tr></thead><tbody>
        ${filtrados.map((d) => {
          const lider = S.getLider(d.c.liderId);
          let accion = '';
          if ([D.ESTADOS.PENDIENTE_CALIBRACION,D.ESTADOS.CALIBRADA,D.ESTADOS.RETRO_PENDIENTE].includes(d.estado)) accion = `<a class="btn btn-primary btn-sm" href="#/admin/calibracion/${d.c.empleado}">Revisar</a>`;
          const calFirma=S.getCalibracion(d.c.empleado,periodoId); const firmaTxt=calFirma?.firmaLider&&calFirma?.firmaColaborador?'2/2':calFirma?.firmaLider?'1/2':calFirma?.acuerdosLiberados?'0/2':'—'; return `<tr><td><strong>${esc(d.c.nombre)}</strong><small>${esc(d.c.puesto || '')}</small></td><td>${esc(d.c.area)}</td><td>${esc(lider ? lider.nombre : '—')}</td><td>${badge(d.estado)}</td><td><b>${f1(d.totalFinal)}</b></td><td>${d.cuad.cuadrante ? `<span class="admin-box-pill">${d.cuad.cuadrante} · ${esc(d.cuad.info.nombre)}</span>` : '—'}</td><td>${firmaTxt==='—'?'—':badge(firmaTxt,firmaTxt==='2/2'?'green':firmaTxt==='1/2'?'yellow':'red')}</td><td>${accion}</td></tr>`;
        }).join('')}
        </tbody></table></div>
      </article>

      <div class="admin-bottom-grid">
        <article class="admin-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">PRIORIDAD</span><h2>Áreas con mayor rezago</h2></div></div><ol class="admin-ranking">${ranking.slice(0,6).map((r,i)=>`<li><span>${i+1}</span><div><strong>${esc(r.area)}</strong><small>${r.completadas}/${r.total} completadas</small></div><b>${r.pct}%</b></li>`).join('')}</ol></article>
        <article class="admin-panel"><div class="admin-panel-head"><div><span class="admin-section-kicker">ALERTAS</span><h2>Atención requerida</h2></div></div><div class="admin-alert-stack">${vencidas ? `<button class="admin-alert danger" onclick="App.toggleAdminAlert('vencidas')"><b>${vencidas}</b><span>autoevaluaciones vencidas</span><i>Ver detalle →</i></button>${state.adminAlertOpen==='vencidas'?renderAdminAlertDetalle('vencidas',datos):''}` : ''}${pendientesCal ? `<button class="admin-alert warning" onclick="App.toggleAdminAlert('calibracion')"><b>${pendientesCal}</b><span>evaluaciones esperando calibración</span><i>Ver detalle →</i></button>${state.adminAlertOpen==='calibracion'?renderAdminAlertDetalle('calibracion',datos):''}` : ''}${!vencidas&&!pendientesCal ? '<div class="admin-alert success"><b>✓</b><span>Sin alertas activas</span></div>' : ''}</div></article>
      </div>
    </section>`;
  }

  function renderAdminAlertDetalle(tipo, datos) {
    const rows = tipo === 'calibracion'
      ? datos.filter(d => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION)
      : datos.filter(d => { const a=S.getEvaluacion(d.c.empleado,state.periodo.id,'autoevaluacion'); return (!a || a.estado!==D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteAutoevaluacion); });
    if (!rows.length) return '<div class="admin-alert-detail">Sin registros pendientes.</div>';
    return `<div class="admin-alert-detail">${rows.map(d=>{const l=S.getLider(d.c.liderId);return `<div><strong>${esc(d.c.nombre)}</strong><span>${esc(d.c.area)} · Líder: ${esc(l?l.nombre:'—')}</span><div class="admin-alert-actions">${tipo==='vencidas'?`<button class="btn btn-primary btn-sm" onclick="App.enviarNotificacionVencida('${esc(d.c.empleado)}')">Enviar notificación</button>`:''}${tipo==='calibracion'?`<a class="btn btn-outline btn-sm" href="#/admin/calibracion/${d.c.empleado}">Revisar</a>`:''}</div></div>`}).join('')}</div>`;
  }

  function viewCalibracionLista(periodoId) {
    if (apiReadMode()) {
      const queue = state.remote.calibration || {};
      const pending = Array.isArray(queue.pending) ? queue.pending : [];
      const calibrated = Array.isArray(queue.calibrated) ? queue.calibrated : [];
      const closed = Array.isArray(queue.closed) ? queue.closed : [];
      const rows = [...pending, ...calibrated, ...closed];
      const statusLabel = (x) => x.status === 'pending_calibration' ? 'Pendiente de calibración' : (x.status === 'closed' ? 'Cerrada' : 'Calibrada');
      return `<section class="calibration-shell">
        <div class="calibration-list-hero"><div><span class="admin-kicker">CALIBRACIÓN DO · DATOS EN VIVO</span><h1>Revisión y calibración</h1><p>Cola real derivada de Evaluaciones en n8n + Airtable. Solo aparecen colaboradores cuya evaluación de líder ya fue enviada.</p></div><div class="calibration-list-stats"><div><strong>${pending.length}</strong><span>Por revisar</span></div><div><strong>${calibrated.length}</strong><span>Calibradas</span></div></div></div>
        <div class="calibration-card-list">
        ${rows.map((x) => `<article class="calibration-person-card"><div class="calibration-avatar">${esc(x.name||'').split(' ').slice(0,2).map(v=>v[0]).join('')}</div><div class="calibration-person-main"><div class="calibration-person-title"><strong>${esc(x.name||x.employeeId)}</strong>${badge(statusLabel(x))}</div><span>${esc(x.position||'')} · ${esc(x.area||'')}</span><small>Líder: ${esc(x.leaderName||'—')}</small></div><div class="calibration-score"><span>Resultado</span><strong>${f1(x.calibratedResult ?? x.leaderResult)}</strong><small>${x.calibratedResult!=null?'Calibrado':'Líder'}</small></div><a class="btn btn-primary btn-sm" href="#/admin/calibracion/${encodeURIComponent(String(x.employeeId||''))}">${x.status==='pending_calibration'?'Calibrar':'Revisar'}</a></article>`).join('') || '<div class="admin-empty-state">No hay evaluaciones disponibles para calibración.</div>'}
        </div>
        <p class="backend-read-note">Lectura real activa. La cola ya no usa colaboradores demo.</p>
      </section>`;
    }
    const datos = datosGlobales(periodoId).filter((d) => [D.ESTADOS.PENDIENTE_CALIBRACION, D.ESTADOS.CALIBRADA, D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(d.estado));
    const porCalibrar = datos.filter((d) => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION).length;
    const calibradas = datos.filter((d) => S.getCalibracion(d.c.empleado, periodoId)).length;
    return `<section class="calibration-shell"><div class="calibration-list-hero"><div><span class="admin-kicker">CALIBRACIÓN DO</span><h1>Revisión y calibración</h1></div><div class="calibration-list-stats"><div><strong>${porCalibrar}</strong><span>Por revisar</span></div><div><strong>${calibradas}</strong><span>Calibradas</span></div></div></div></section>`;
  }

  function viewCalibracionDetalle(colaboradorId, periodoId) {
    if (apiReadMode() && state.remote.calibration) {
      const q = state.remote.calibration;
      const item = [...(q.pending||[]), ...(q.calibrated||[]), ...(q.closed||[])].find(x => String(x.employeeId) === String(colaboradorId));
      if (item) {
        const detail = state.remote.detail || null;
        const evInfo = detail && detail.evaluation || {};
        const detailEmployee = detail && detail.employee && (detail.employee.employeeId || detail.employee.id);
        const detailReady = detail && (!detailEmployee || String(detailEmployee)===String(colaboradorId)) && Array.isArray(detail.answers);
        if (!detailReady && !state.remote.detailLoading) setTimeout(()=>Actions.cargarDetalleCalibracionDO(String(colaboradorId), String(item.evaluationId||'')), 0);

        const gap = (item.selfResult!=null && item.leaderResult!=null) ? Number(item.selfResult)-Number(item.leaderResult) : null;
        const calibrationDone = item.calibrationStatus === 'calibration_completed';
        const calibrationDraft = item.calibrationStatus === 'calibration_draft';
        const currentCalibrated = item.calibratedResult != null ? Number(item.calibratedResult) : Number(item.leaderResult);
        const reason = item.adjustmentReason || '';
        const answers = detailReady ? (detail.answers||[]) : [];
        const objectives = detailReady ? (detail.objectives||[]) : [];
        const feedback = detailReady ? (detail.feedback||{}) : {};

        // Null-safe helpers: durante el lazy-load del expediente `answers` puede estar vacío
        // o una competencia puede no tener todavía una de las dos respuestas. La pantalla de
        // calibración debe renderizar placeholders y continuar cargando, nunca romper el router.
        const roleOf = a => String((a && (a.evaluator||a.evaluador||a.role||a.evaluatorRole||a['Evaluador (rol)'])) || '').toLowerCase();
        const valOf = a => {
          if (!a) return null;
          const raw = a.value ?? a.valor ?? a.score ?? a.rating ?? a.calificacion ?? null;
          if (raw === null || raw === undefined || raw === '' || raw === 'N/A') return raw === 'N/A' ? 'N/A' : null;
          const n = Number(raw);
          return Number.isFinite(n) ? n : raw;
        };
        const commentOf = a => a ? (a.comment ?? a.comentario ?? a.comments ?? '') : '';
        const cidOf = a => String((a && (a.competencyId||a.competenciaId||a.questionId||a.preguntaId)) || '');
        const findAns = (cid, leader) => answers.find(a => cidOf(a)===cid && (leader ? /l[ií]der|leader/.test(roleOf(a)) : !/l[ií]der|leader/.test(roleOf(a))));
        const cat = [...(D.COMPETENCIAS.actitud||[]), ...(D.COMPETENCIAS.habilidades||[])];
        const competencyRows = cat.map(c=>{ const aa=findAns(c.id,false), ll=findAns(c.id,true); const av=valOf(aa), lv=valOf(ll); const diff=(typeof av==='number'&&typeof lv==='number')?Number(lv)-Number(av):null; return `<tr class="${diff!=null&&Math.abs(diff)>=2?'cal-gap-row':''}"><td><strong>${esc(c.nombre)}</strong><small>${esc(c.id)} · ${c.peso}%</small></td><td>${av==null?'—':esc(av)}</td><td>${lv==null?'—':esc(lv)}</td><td>${diff==null?'—':(diff>0?'+':'')+f1(diff)}</td><td>${esc(commentOf(ll)||commentOf(aa)||'—')}</td></tr>`; }).join('');
        const toolDefs=[['TOOL-EXCEL','Excel'],['TOOL-POWERBI','Power BI'],['TOOL-IA','Manejo de IA']];
        const toolRows=toolDefs.map(([id,label])=>{const aa=findAns(id,false),ll=findAns(id,true);return `<tr><td><strong>${label}</strong></td><td>${valOf(aa)??'—'}</td><td>${valOf(ll)??'—'}</td></tr>`}).join('');

        const objRows = objectives.length ? objectives.map((o,i)=>{
          const f=o&&o.fields&&typeof o.fields==='object'?o.fields:{};
          const pick=(...keys)=>{for(const k of keys){if(o&&o[k]!=null&&o[k]!=='')return o[k];if(f&&f[k]!=null&&f[k]!=='')return f[k];}return null};
          const desc=pick('description','descripcion','objective','objetivo','Descripción','Objetivo')??`Objetivo ${i+1}`;
          const meta=pick('target','meta','metaAcordada','Meta acordada','Meta')??'—';
          const result=pick('result','resultado','resultadoAlcanzado','Resultado alcanzado','Resultado')??'—';
          let selfPct=pick('compliancePercent','cumplimiento','selfPercent','cumplimientoObjetivo','Cumplimiento objetivo','% cumplimiento','Porcentaje cumplimiento');
          if (selfPct!=null){ const np=Number(selfPct); if(Number.isFinite(np)){ selfPct=np; if(selfPct>=0&&selfPct<=1.2) selfPct*=100; } }
          let leaderPct=pick('leaderValidatedPercent','porcentajeValidadoLider','leaderPercent','% validado por líder','Porcentaje validado líder');
          if(leaderPct!=null){const np=Number(leaderPct);if(Number.isFinite(np))leaderPct=np;}
          const selfScore=pick('selfScore','calificacionColaborador','automaticScore','calificacionAutomatica','Calificación colaborador','Calificación automática');
          const leaderScore=pick('leaderScore','calificacionLider','Calificación líder');
          const adj=pick('leaderAdjustmentReason','justificacionAjusteLider','justificacionLider','Justificación ajuste líder','Justificación líder')||'';
          return `<tr><td><strong>${esc(desc)}</strong>${adj?`<small>Ajuste líder: ${esc(adj)}</small>`:''}</td><td>${esc(meta)}</td><td>${esc(result)}</td><td>${selfPct==null?'—':f1(selfPct)+'%'}</td><td>${leaderPct==null?'—':f1(leaderPct)+'%'}</td><td>${selfScore??'—'} → ${leaderScore??'—'}</td></tr>`;
        }).join('') : '';

        const secAvg=(prefix,leader)=>{const xs=answers.filter(a=>cidOf(a).startsWith(prefix)&&(leader?/l[ií]der|leader/.test(roleOf(a)):!/l[ií]der|leader/.test(roleOf(a)))).map(valOf).filter(v=>typeof v==='number');return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null};
        const objScore=(leader)=>{const xs=objectives.map(o=>leader?(o.leaderScore??o.calificacionLider):(o.selfScore??o.calificacionColaborador??o.automaticScore??o.calificacionAutomatica)).filter(v=>typeof v==='number');return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null};
        const autoProm={actitud:secAvg('A',false),habilidades:secAvg('B',false),objetivos:objScore(false)};
        const leaderProm={actitud:secAvg('A',true),habilidades:secAvg('B',true),objetivos:objScore(true)};
        const radar = detailReady ? global.EDDCharts.renderRadarChart({autoevaluacion:autoProm,evaluacionLider:leaderProm,calibracion:item.calibratedResult!=null?{resultadoLider:item.leaderResult,resultadoCalibrado:item.calibratedResult}:null,size:380}) : '';
        const chartLabels={A1:'Compromiso Organizacional',A2:'Actitud de Servicio',A3:'Trabajo en Equipo',A4:'Comunicación Efectiva',A5:'Adaptabilidad e Iniciativa',B1:'Dominio del Puesto',B2:'Procesos y Herramientas',B3:'Orientación a Resultados',B4:'Planeación y Organización',B5:'Seguimiento y Control'};
        const performanceDims=[...(D.COMPETENCIAS.actitud||[]),...(D.COMPETENCIAS.habilidades||[])].map(c=>({key:c.id.toLowerCase(),label:c.nombre,shortLabel:chartLabels[c.id]||c.nombre}));
        const performanceAuto={}, performanceLeader={};
        performanceDims.forEach(d=>{ const cid=d.key.toUpperCase(); performanceAuto[d.key]=valOf(findAns(cid,false)); performanceLeader[d.key]=valOf(findAns(cid,true)); });
        performanceDims.push({key:'objetivos',label:'Cumplimiento de Objetivos',shortLabel:'Objetivos'}); performanceAuto.objetivos=autoProm.objetivos; performanceLeader.objetivos=leaderProm.objetivos;
        const performanceProfile={dimensiones:performanceDims,autoevaluacion:performanceAuto,evaluacionLider:performanceLeader};
        const performanceWheel = detailReady ? global.EDDCharts.renderPerformanceWheel(performanceProfile) : '';
        const sectionGapSummary = detailReady ? renderSectionGapSummary({promedios:autoProm},{promedios:leaderProm}) : '';
        const nine = global.EDDCharts.renderNineBoxIndividual({actitudProm:Number(item.leaderAttitude)/20, desempenoProm:Number(item.leaderPerformance)/20, nombreColaborador:item.name});
        const fget=(...keys)=>{for(const k of keys){if(feedback&&feedback[k]!=null&&feedback[k]!=='')return feedback[k];}return ''};
        const strengths=fget('strengths','fortalezas','Fortalezas');
        const opp=fget('developmentOpportunities','oportunidadesDesarrollo','areasOfOpportunity','Áreas de oportunidad');
        const gaps=fget('gaps','brechas','debilidadesBrechas','Brechas a atender');
        const risks=fget('risks','riesgosAtencion','Riesgos y factores de atención');
        const summary=fget('leaderSummary','sintesisLider','comments','comentariosLider','Comentarios del líder');
        const areas=fget('improvementPlan','planMejora','planDeMejora','Plan de mejora');
        const dev=fget('developmentPlan','planDesarrollo','planDeDesarrollo','Plan de desarrollo');

        return `<section class="calibration-shell calibration-detail-shell calibration-rich-remote">
          <a href="#/admin/calibracion" class="calibration-back">← Volver a calibración</a>
          <div class="calibration-profile-hero"><div class="calibration-avatar large">${esc(item.name||'').split(' ').slice(0,2).map(v=>v[0]).join('')}</div><div class="calibration-profile-copy"><span class="admin-kicker">EXPEDIENTE EJECUTIVO DE CALIBRACIÓN · DATOS EN VIVO</span><h1>${esc(item.name||item.employeeId)}</h1><p>${esc(item.position||'')} · ${esc(item.area||'')}</p><div class="calibration-meta"><span>Líder: <b>${esc(item.leaderName||'—')}</b></span><span>Periodo: <b>${esc(item.periodId||periodoId)}</b></span><span>ID: <b>${esc(item.employeeId)}</b></span></div></div><div class="calibration-final-score"><span>Resultado líder</span><strong>${f1(item.leaderResult)}</strong>${badge(calibrationDone?'Calibrada':calibrationDraft?'Calibración en borrador':'Pendiente de calibración', calibrationDone?'green':calibrationDraft?'blue':'yellow')}</div></div>

          <div class="calibration-score-grid"><div class="calibration-score-card"><span>Autoevaluación</span><strong>${f1(item.selfResult)}</strong><small>Percepción colaborador</small></div><div class="calibration-score-card"><span>Evaluación líder</span><strong>${f1(item.leaderResult)}</strong><small>Base de calibración</small></div><div class="calibration-score-card ${gap!=null&&Math.abs(gap)>=1?'attention':''}"><span>Brecha auto vs líder</span><strong>${gap==null?'—':(gap>0?'+':'')+f1(gap)}</strong><small>Diferencia global</small></div><div class="calibration-score-card success"><span>Resultado calibrado</span><strong>${item.calibratedResult==null?'—':f1(item.calibratedResult)}</strong><small>${calibrationDone?'Completada':calibrationDraft?'Borrador':'Pendiente'}</small></div></div>

          ${!detailReady?`<article class="admin-panel calibration-loading-detail ${state.remote.detailError?'has-error':''}">${state.remote.detailError?'':`<div class="backend-spinner"></div>`}<div><span class="admin-section-kicker">${state.remote.detailError?'EXPEDIENTE NO DISPONIBLE':'CARGANDO EXPEDIENTE'}</span><h2>${state.remote.detailError?'No pudimos cargar el detalle completo':'Recuperando respuestas, objetivos y contexto del líder…'}</h2><p>${state.remote.detailError?esc(state.remote.detailError):'La calibración puede continuar cuando termine esta lectura. No se usan datos demo.'}</p>${state.remote.detailError?`<button class="btn btn-primary btn-sm" onclick="App.reintentarDetalleCalibracion('${esc(item.employeeId)}','${esc(item.evaluationId)}')">Reintentar cargar expediente</button>`:''}</div></article>`:`
          <section class="performance-profile-section calibration-performance-profile remote-performance-profile">
            <div class="performance-profile-head"><div><span class="admin-section-kicker">LECTURA MULTIDIMENSIONAL</span><h2>Perfil de desempeño vs. ideal</h2><p>Recuperamos la lectura aprobada: compara la percepción del colaborador, la evaluación del líder y la distancia de cada dimensión contra el nivel ideal de 5/5.</p></div></div>
            ${sectionGapSummary}
            ${performanceWheel}
            <details class="performance-summary-details"><summary>Ver resumen ejecutivo de 3 dimensiones</summary><div class="feedback-analysis-single"><div><h3>Radar ejecutivo</h3>${radar}</div></div></details>
          </section>

          <article class="admin-panel calibration-ninebox-card calibration-ninebox-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">9-BOX · EJES BACKEND</span><h2>Ubicación de talento</h2><p class="panel-support-copy">La ubicación se calcula con Actitud y Desempeño del backend y se usa únicamente como referencia para revisión humana de DO.</p></div><div class="backend-objective-summary compact"><div><span>Actitud</span><strong>${f1(item.leaderAttitude)}</strong></div><div><span>Desempeño</span><strong>${f1(item.leaderPerformance)}</strong></div></div></div>${nine}</article>

          <article class="admin-panel calibration-detail-table"><div class="admin-panel-head"><div><span class="admin-section-kicker">COMPETENCIAS</span><h2>Detalle de la evaluación</h2><p>Contrasta la percepción del colaborador con la valoración del líder y enfoca la revisión donde exista brecha.</p></div></div><div class="admin-table-wrap"><table class="table admin-table"><thead><tr><th>Competencia</th><th>Auto</th><th>Líder</th><th>Brecha</th><th>Comentario</th></tr></thead><tbody>${competencyRows}</tbody></table></div></article>

          <div class="admin-dashboard-grid calibration-context-two"><article class="admin-panel"><span class="admin-section-kicker">HERRAMIENTAS B.2</span><h2>Dominio de herramientas</h2><table class="table table-compact"><thead><tr><th>Herramienta</th><th>Auto</th><th>Líder</th></tr></thead><tbody>${toolRows}</tbody></table></article><article class="admin-panel"><span class="admin-section-kicker">LECTURA CUALITATIVA</span><h2>Contexto del líder</h2><div class="leader-context-grid"><div><h4>Fortalezas</h4><p>${esc(strengths)||'<span class="muted">Sin dato backend.</span>'}</p></div><div><h4>Oportunidades</h4><p>${esc(opp)||'<span class="muted">Sin dato backend.</span>'}</p></div><div><h4>Brechas</h4><p>${esc(gaps)||'<span class="muted">Sin dato backend.</span>'}</p></div><div><h4>Factores de atención</h4><p>${esc(risks)||'<span class="muted">Sin dato backend.</span>'}</p></div><div class="span-2"><h4>Síntesis del líder</h4><p>${esc(summary)||'<span class="muted">Sin dato backend.</span>'}</p></div></div></article></div>

          <article class="admin-panel calibration-objectives-rich"><div class="admin-panel-head"><div><span class="admin-section-kicker">OBJETIVOS</span><h2>Cumplimiento y validación del líder</h2></div></div>${objRows?`<div class="admin-table-wrap"><table class="table admin-table"><thead><tr><th>Objetivo</th><th>Meta</th><th>Resultado</th><th>% colaborador</th><th>% líder</th><th>Calificación</th></tr></thead><tbody>${objRows}</tbody></table></div>`:'<div class="admin-empty-state">Sin objetivos aplicables o sin datos disponibles.</div>'}</article>

          <div class="admin-dashboard-grid calibration-context-two"><article class="admin-panel"><span class="admin-section-kicker">ACUERDOS</span><h2>Plan de mejora</h2>${renderRemoteImprovementPlan(areas)}</article><article class="admin-panel"><span class="admin-section-kicker">DESARROLLO</span><h2>Plan de desarrollo</h2>${renderRemoteDevelopmentPlan(dev)}</article></div>`}

          <article class="admin-panel calibration-do-context-card"><div class="admin-panel-head"><div><span class="admin-section-kicker">CONTEXTO DO</span><h2>Antecedentes administrativos y bienestar</h2><p class="panel-support-copy">Estos datos sirven como contexto para la revisión y no modifican automáticamente la calificación.</p></div></div>
            <div class="calibration-do-context-grid">
              <label><span>Actas administrativas</span><input type="number" id="calRemoteActas" min="0" step="1" value="0" ${calibrationDone?'disabled':''}/><small>Número de actas registradas en el periodo.</small></label>
              <label><span>Referencia NOM-035</span><select id="calRemoteNom035" ${calibrationDone?'disabled':''}><option value="No">No</option><option value="Sí">Sí</option><option value="En seguimiento">En seguimiento</option></select><small>Indica si existe antecedente o seguimiento relacionado.</small></label>
              <label class="span-2"><span>Detalle NOM-035 / contexto relevante</span><textarea id="calRemoteNom035Detail" ${calibrationDone?'disabled':''} placeholder="Describe únicamente el contexto necesario para la calibración..."></textarea></label>
            </div>
            <div class="calibration-info-note">La información de NOM-035 debe tratarse como contexto sensible de revisión humana; no genera ajustes automáticos ni decisiones laborales.</div>
          </article>

          <article class="admin-panel calibration-write-panel calibration-write-wide"><div class="admin-panel-head"><div><span class="admin-section-kicker">DECISIÓN DO</span><h2>Calibrar resultado</h2><p class="panel-support-copy">Mantén el resultado del líder o ajusta el valor con evidencia y justificación. El resultado original siempre queda visible.</p></div><span class="calibration-live-result" id="calRemoteLiveBadge">${f1(currentCalibrated)}</span></div>
            <div class="calibration-adjust-row"><label><span>Resultado calibrado</span><input type="number" id="calRemoteResult" min="1" max="5" step="0.01" value="${esc(currentCalibrated)}" ${calibrationDone?'disabled':''} oninput="App.previewRemoteCalibracion()"/></label><div class="calibration-reference-box"><span>Resultado líder original</span><strong>${f1(item.leaderResult)}</strong><small>Fuente de verdad del backend</small></div></div>
            <label class="calibration-field"><span>Justificación del ajuste <em>${Math.abs(currentCalibrated-Number(item.leaderResult))>0.0001?'obligatoria':'si modificas el resultado'}</em></span><textarea id="calRemoteReason" ${calibrationDone?'disabled':''} placeholder="Describe la evidencia y el criterio utilizado para el ajuste...">${esc(reason)}</textarea></label>
            <label class="calibration-field"><span>Notas de DO <em>opcional</em></span><textarea id="calRemoteNotes" ${calibrationDone?'disabled':''} placeholder="Contexto adicional de la revisión..."></textarea></label>
            <div class="calibration-state-note ${calibrationDone?'is-complete':calibrationDraft?'is-draft':''}">${calibrationDone?'✓ Calibración completada. El resultado quedó bloqueado para esta etapa.':calibrationDraft?'Borrador guardado. Puedes seguir ajustando o completar la calibración.':'Aún no existe una calibración guardada.'}</div>
            <div class="calibration-actions"><button class="btn btn-outline" id="calRemoteSaveBtn" ${calibrationDone?'disabled':''} onclick="App.guardarCalibracionRemota('${esc(item.evaluationId)}')">${state.remote.calibrationSaving?'Guardando…':'Guardar borrador'}</button><button class="btn btn-primary" id="calRemoteCompleteBtn" ${calibrationDone||state.remote.calibrationCompleting?'disabled':''} onclick="App.completarCalibracionRemota('${esc(item.evaluationId)}')">${calibrationDone?'✓ Calibración completada':state.remote.calibrationCompleting?'Completando…':'Completar calibración'}</button></div>${calibrationDone?`<div class="calibration-release-panel"><div><span class="admin-section-kicker">SIGUIENTE ETAPA</span><h3>Retroalimentación</h3><p>La calibración ya está cerrada. Libera el resultado para iniciar la retroalimentación y habilitar el seguimiento de firmas.</p></div><button class="btn btn-primary" ${state.remote.calibrationReleasing?'disabled':''} onclick="App.liberarResultadoRemoto('${esc(item.evaluationId)}')">${state.remote.calibrationReleasing?'Liberando…':'Liberar para retroalimentación'}</button></div>`:''}
          </article>
        </section>`;
      }
    }
    const col = S.getColaborador(colaboradorId);
    const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'lider');
    if (!resAuto || !resLider) return `<div class="card"><h2>${esc(col.nombre)}</h2><p class="muted">Aún no existen ambas evaluaciones completas para calibrar.</p></div>`;
    const cal = S.getCalibracion(colaboradorId, periodoId) || { ajuste: 0, justificacion: '', actas: 0, nom035: '', observacionesRH: '', retroHabilitada: false, aceptacionColaborador: false, historial: [] };
    const diferencia = C.round1(resAuto?.puntajes?.total - resLider?.puntajes?.total);
    const brechaGeneral = C.clasificarBrecha(diferencia);
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
    const liderDirecto = S.getLider(col.liderId);
    const radarHtml = global.EDDCharts.renderRadarChart({autoevaluacion: resAuto?.promedios || {},evaluacionLider: resLider?.promedios || {},calibracion: (cal.resultadoCalibrado !== undefined) ? { resultadoLider: resLider?.puntajes?.total, resultadoCalibrado: cal.resultadoCalibrado } : null});
    const performanceProfile = buildPerformanceProfile(colaboradorId, periodoId);
    const performanceWheelHtml = performanceProfile ? global.EDDCharts.renderPerformanceWheel(performanceProfile) : '';
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({actitudProm: resLider?.promedios?.actitud, desempenoProm: resLider?.promedios?.desempeno, nombreColaborador: col.nombre});
    const iniciales = esc(col.nombre).split(' ').slice(0,2).map(x=>x[0]).join('');
    const resultadoActual = cal.resultadoCalibrado !== undefined ? cal.resultadoCalibrado : resLider?.puntajes?.total;

    return `<section class="calibration-shell calibration-detail-shell">
      <a href="#/admin/calibracion" class="calibration-back">← Volver a calibración</a>
      <div class="calibration-profile-hero">
        <div class="calibration-avatar large">${iniciales}</div>
        <div class="calibration-profile-copy"><span class="admin-kicker">EXPEDIENTE DE CALIBRACIÓN</span><h1>${esc(col.nombre)}</h1><p>${esc(col.puesto||'')} · ${esc(col.area)} · ${esc(col.ciudad||'')}</p><div class="calibration-meta"><span>Líder: <b>${esc(liderDirecto ? liderDirecto.nombre : '—')}</b></span><span>Antigüedad: <b>${esc(col.antiguedad||'—')}</b></span></div></div>
        <div class="calibration-final-score"><span>Resultado actual</span><strong>${f1(resultadoActual)}</strong>${badge(C.clasificarNivel(resultadoActual).nivel,'blue')}</div>
      </div>

      <div class="calibration-score-grid">
        <div class="calibration-score-card"><span>Autoevaluación</span><strong>${f1(resAuto?.puntajes?.total)}</strong><small>Percepción del colaborador</small></div>
        <div class="calibration-score-card"><span>Evaluación líder</span><strong>${f1(resLider?.puntajes?.total)}</strong><small>Resultado base de calibración</small></div>
        <div class="calibration-score-card ${Math.abs(diferencia)>=10?'attention':''}"><span>Brecha auto vs líder</span><strong>${diferencia>0?'+':''}${f1(diferencia)}</strong><small>${esc(brechaGeneral.etiqueta)}</small></div>
        <div class="calibration-score-card success"><span>Resultado calibrado</span><strong>${f1(resultadoActual)}</strong><small>${cal.resultadoCalibrado!==undefined?'Guardado por DO':'Sin ajuste aún'}</small></div>
      </div>

      <section class="performance-profile-section calibration-performance-profile">
        <div class="performance-profile-head"><div><span class="admin-section-kicker">LECTURA MULTIDIMENSIONAL</span><h2>Perfil de desempeño vs. ideal</h2><p>La misma lectura utilizada en la comparación de la evaluación: muestra la percepción del colaborador, la evaluación del líder y la distancia de cada competencia frente al ideal esperado de 5/5.</p></div></div>
        ${renderSectionGapSummary(resAuto,resLider)}
        ${performanceWheelHtml}
        <details class="performance-summary-details"><summary>Ver resumen ejecutivo de 3 dimensiones</summary>${radarHtml}</details>
      </section>

      <article class="admin-panel calibration-ninebox-card"><div class="admin-panel-head"><div><span class="admin-section-kicker">TALENTO</span><h2>Ubicación 9-Box</h2><p class="panel-support-copy">Referencia de talento basada en los resultados de desempeño y actitud de la evaluación del líder.</p></div></div>${ninaBoxHtml}</article>

      <article class="admin-panel calibration-leader-context"><div class="admin-panel-head"><div><span class="admin-section-kicker">CONTEXTO DEL LÍDER</span><h2>Retroalimentación y acciones propuestas</h2></div></div><div class="leader-context-grid">${(()=>{const le=S.getEvaluacion(colaboradorId,periodoId,'lider')||{};return `<div><h4>Fortalezas</h4><p>${esc(le.fortalezas||'')||'<span class="muted">Sin registrar.</span>'}</p></div><div><h4>Oportunidades de desarrollo</h4><p>${esc(le.oportunidadesDesarrollo||'')||'<span class="muted">Sin registrar.</span>'}</p></div><div><h4>Brechas a atender</h4><p>${esc(le.debilidadesBrechas||'')||'<span class="muted">Sin registrar.</span>'}</p></div><div><h4>Riesgos o factores de atención</h4><p>${esc(le.riesgosAtencion||'')||'<span class="muted">Sin registrar.</span>'}</p></div><div class="span-2"><h4>Síntesis del líder</h4><p>${esc(le.comentarios||'')||'<span class="muted">Sin comentarios.</span>'}</p></div>`})()}</div>${(()=>{const ae=S.getEvaluacion(colaboradorId,periodoId,'autoevaluacion'),le=S.getEvaluacion(colaboradorId,periodoId,'lider');if(!ae||!le)return '';const ao=S.getObjetivos(ae.id),lo=S.getObjetivos(le.id).filter(o=>o.ajusteManualLider);return lo.length?`<section class="do-objective-adjustments"><span class="admin-section-kicker">AJUSTES DEL LÍDER EN OBJETIVOS</span><h4>Revisión para calibración</h4>${lo.map(o=>{const a=ao.find(x=>Number(x.index)===Number(o.index));return `<article class="objective-adjustment-card"><div><strong>${esc(a?.descripcion||o.descripcion||'Objetivo')}</strong><span class="objective-score-change">Cumplimiento colaborador ${esc(a?.cumplimiento??'—')}% → validado líder ${esc(o.cumplimiento??'—')}% · Equivalencia ${esc(o.calificacionAutomatica??a?.calificacion??'—')}/5 → ${esc(o.calificacion)}/5</span></div><p><b>Justificación del líder:</b> ${esc(o.justificacionLider||'Sin justificación registrada.')}</p></article>`}).join('')}</section>`:''})()}<h4>Áreas de oportunidad y plan de mejora</h4>${S.getAreasOportunidad(colaboradorId,periodoId).length?`<table class="table table-compact"><tbody>${S.getAreasOportunidad(colaboradorId,periodoId).map(a=>`<tr><td><b>${esc(a.area)}</b></td><td>${esc(a.planMejora)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Sin áreas registradas.</p>'}<h4>Plan de desarrollo</h4>${renderPlanesTabla(S.getPlanesDesarrollo(colaboradorId,periodoId))}</article>

      <div class="calibration-workspace-grid">
        <article class="admin-panel calibration-context-card">
          <div class="admin-panel-head"><div><span class="admin-section-kicker">CONTEXTO</span><h2>Alertas para DO</h2></div></div>
          <div class="calibration-context-grid"><label><span>Actas administrativas</span><input type="number" min="0" id="calActas" value="${cal.actas || 0}"/></label><label><span>Indicador / referencia NOM-035</span><input type="text" id="calNom035" value="${esc(cal.nom035 || '')}" placeholder="Sin dato"/></label></div>
          <div class="calibration-info-note">Estos datos se consideran como contexto para la revisión de RH y no modifican automáticamente la calificación.</div>
          <label class="calibration-field"><span>Observaciones de DO</span><textarea id="calObs" placeholder="Registra hechos, contexto o acuerdos relevantes...">${esc(cal.observacionesRH || '')}</textarea></label>
        </article>

        <article class="admin-panel calibration-decision-card">
          <div class="admin-panel-head"><div><span class="admin-section-kicker">DECISIÓN</span><h2>Ajuste de calibración</h2></div><span class="calibration-live-result" id="calLiveBadge">${f1(resultadoActual)}</span></div>
          <div class="calibration-adjust-row"><label><span>Ajuste en puntos</span><input type="number" step="0.1" id="calAjuste" value="${cal.ajuste || 0}" oninput="App.previewCalibracion(${resLider?.puntajes?.total})"/></label><label><span>Resultado calibrado</span><input type="text" id="calResultadoPreview" value="${f1(resultadoActual)}" disabled/></label></div>
          <label class="calibration-field"><span>Justificación <em>obligatoria cuando exista ajuste</em></span><textarea id="calJustificacion" placeholder="Explica la razón del ajuste y la evidencia utilizada...">${esc(cal.justificacion || '')}</textarea></label>
          <div class="calibration-actions"><button class="btn btn-primary" onclick="App.guardarCalibracion('${colaboradorId}','${periodoId}',${resLider?.puntajes?.total})">Guardar calibración</button><button class="btn btn-outline" ${cal.resultadoCalibrado === undefined ? 'disabled' : ''} onclick="App.habilitarRetro('${colaboradorId}','${periodoId}')">${cal.retroHabilitada ? '✓ Retroalimentación habilitada' : 'Habilitar retroalimentación'}</button></div>
          ${planes.length < 1 ? '<div class="calibration-warning-note">Si el resultado calibrado es menor a 80, se requerirá al menos un plan de desarrollo antes de liberar la retroalimentación.</div>' : ''}
        </article>
      </div>

      <article class="admin-panel calibration-history-card"><div class="admin-panel-head"><div><span class="admin-section-kicker">ÚLTIMO CAMBIO</span><h2>Resumen de trazabilidad</h2></div><a href="#/admin/auditoria" class="admin-text-link">Ver auditoría completa →</a></div>${(cal.historial||[]).length?(()=>{const h=cal.historial[cal.historial.length-1];return `<div class="history-summary"><strong>${esc(h.campo)}</strong><span>${esc(h.motivo||'Actualización')}</span><small>${esc(h.usuario)} · ${esc(h.fecha)} ${esc(h.hora)}</small></div>`})():'<p class="muted">Sin cambios registrados.</p>'}</article>
    </section>`;
  }

  function view9BoxAdmin(periodoId) {
    const datos = datosGlobales(periodoId).filter((d) => d.cuad.cuadrante);
    const ocupantes = datos.map((d) => ({
      empleado: d.c.empleado, nombre: d.c.nombre, cuadrante: d.cuad.cuadrante,
      destacado: state.nineboxSelEmpleado === d.c.empleado
    }));
    const gridHtml = global.EDDCharts.renderNineBoxFull({
      ocupantes,
      resaltarCuadrante: state.nineboxSel,
      onCellClickJs: (numero) => `App.selNinebox(${numero})`,
      onMarkerClickJs: (empleado) => `App.selNineboxColaborador('${empleado}')`
    });

    const sel = state.nineboxSel ? C.CUADRANTES_INFO[state.nineboxSel] : null;
    const ocupSel = sel ? datos.filter((d) => d.cuad.cuadrante === state.nineboxSel) : [];
    const seleccionado = state.nineboxSelEmpleado ? datos.find((d) => d.c.empleado === state.nineboxSelEmpleado) : null;

    let panelDetalle = '<p class="muted">Haz clic en un cuadrante para ver su significado y acción sugerida, o en el marcador de un colaborador para ver su detalle individual.</p>';
    if (seleccionado) {
      panelDetalle = `<div class="cuadrante-detail">
        <h4>${esc(seleccionado.c.nombre)} <span class="muted">— ${esc(seleccionado.c.area)}</span></h4>
        <div class="kpi-grid kpi-grid-3">
          ${kpi('Puntaje de desempeño', f1(seleccionado.promedios ? seleccionado.promedios.desempeno : null))}
          ${kpi('Potencial preliminar', f1(seleccionado.promedios ? seleccionado.promedios.actitud : null))}
          ${kpi('Resultado final', f1(seleccionado.totalFinal))}
        </div>
        ${renderCuadranteInfo(seleccionado.cuad)}
        <button class="btn btn-outline btn-sm" onclick="App.limpiarSeleccionNinebox()">Quitar selección individual</button>
      </div>`;
    } else if (sel) {
      panelDetalle = `<div class="cuadrante-detail">${renderCuadranteInfo({ cuadrante: state.nineboxSel, info: sel })}<h4>Colaboradores en este cuadrante</h4><ul>${ocupSel.map((o) => `<li><a href="#" onclick="event.preventDefault();App.selNineboxColaborador('${o.c.empleado}')">${esc(o.c.nombre)}</a> — ${esc(o.c.area)} (${f1(o.totalFinal)} pts)</li>`).join('') || '<li class="muted">Sin colaboradores.</li>'}</ul></div>`;
    }

    return `
    <div class="card">
      <h2>Matriz 9-Box</h2>
      <p class="muted">Criterio oficial Rev4 para ambos ejes: Bajo &lt;60, Medio / esperado 60–79, Alto 80–100 (base 100).</p>
      ${gridHtml}
      ${panelDetalle}
    </div>`;
  }

  function viewAuditoria() {
    const db = S.load();
    return `<div class="card"><h2>Auditoría</h2>
    <table class="table"><thead><tr><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID</th><th>Fecha</th><th>Hora</th><th>Valor anterior</th><th>Valor nuevo</th></tr></thead><tbody>
    ${db.auditoria.slice(0, 200).map((a) => `<tr><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.entidad)}</td><td>${esc(a.entidadId)}</td><td>${esc(a.fecha)}</td><td>${esc(a.hora)}</td><td>${esc(a.valorAnterior)}</td><td>${esc(a.valorNuevo)}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function viewConfig() {
    const cfg = S.getConfiguracion();
    return `<div class="card">
      <h2>Configuración</h2>
      <h3>Umbrales de brecha (comparación auto vs. líder)</h3>
      <div class="form-row">
        <div class="form-group"><label>Alineada hasta</label><input type="number" step="0.01" id="cfgAlineada" value="${cfg.configBrecha.alineadaMax}"/></div>
        <div class="form-group"><label>Revisar hasta</label><input type="number" step="0.01" id="cfgRevisar" value="${cfg.configBrecha.revisarMax}"/></div>
      </div>
      <button class="btn btn-outline" onclick="App.guardarConfigBrecha()">Guardar umbrales</button>
      <div class="test-tools-card">
        <div>
          <span class="eyebrow">HERRAMIENTAS DE PRUEBA</span>
          <h3>Restaurar datos demo</h3>
          <p class="muted">Vuelve a cargar la semilla inicial para repetir pruebas de colaborador, líder, calibración y retroalimentación.</p>
        </div>
        <button class="btn btn-outline test-reset-btn" onclick="App.reiniciarDemo()">↻ Restaurar datos demo</button>
      </div>
    </div>`;
  }

  // Traduce errores de auth.js/api.js a mensajes seguros para el usuario
  // final (nunca trazas técnicas — eso solo va a consola, ver
  // requerimiento 12 del brief).
  function mensajeErrorLogin(err) {
    const tipo = err && err.tipo;
    if (tipo === 'network') return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    if (tipo === 'timeout') return 'La solicitud tardó demasiado. Intenta de nuevo.';
    if (tipo === 'expired') return 'El código venció. Solicita uno nuevo.';
    if (tipo === 'invalid_code') return 'Código inválido. Verifica los 6 dígitos e intenta de nuevo.';
    if (tipo === 'validation') return err.message || 'Verifica los datos capturados.';
    if (tipo === 'unauthorized') return 'Tu sesión expiró. Inicia sesión nuevamente.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  // =========================================================================
  // ACCIONES (expuestas a los onclick del HTML)
  // =========================================================================

  function limpiarErroresVisuales(root) {
    (root || document).querySelectorAll('.validation-error').forEach((el) => el.classList.remove('validation-error'));
  }

  function marcarErroresYEnfocar(elementos) {
    const faltantes = (elementos || []).filter(Boolean);
    faltantes.forEach((el) => el.classList.add('validation-error'));
    if (faltantes.length) {
      const primero = faltantes[0];
      primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = primero.querySelector('input:not([disabled]), textarea:not([disabled]), button:not([disabled])');
      if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 300);
    }
    return faltantes.length;
  }

  function validarSeccionVisual(evaluacionId, seccion) {
    const wizard = document.querySelector('.wizard-card') || document;
    limpiarErroresVisuales(wizard);
    const faltantes = [];

    if (seccion !== 'objetivos') {
      const respuestas = S.getRespuestasPorSeccion(evaluacionId)[seccion] || [];
      const respondidas = new Set(respuestas.filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).map((r) => String(r.competenciaId)));
      (D.COMPETENCIAS[seccion] || []).forEach((c) => {
        if (!respondidas.has(String(c.id))) {
          faltantes.push(Array.from(wizard.querySelectorAll('.competency-card')).find((el) => el.dataset.competenciaId === String(c.id)));
        }
      });
      if (seccion === 'habilidades') {
        const iaValor = S.getHerramientasEvaluacion(evaluacionId)?.ia;
        if (iaValor === undefined || iaValor === '' || iaValor === null || iaValor === 'N/A') {
          const b2 = Array.from(wizard.querySelectorAll('.competency-card')).find((el) => el.dataset.competenciaId === 'B2');
          if (b2 && !faltantes.includes(b2)) faltantes.push(b2);
        }
      }
    } else if (state.wizard.tipo === 'lider') {
      const evLider = S.load().evaluaciones.find((e) => e.id === evaluacionId);
      const autoEval = S.getEvaluacion(state.wizard.colaboradorId, state.periodo.id, 'autoevaluacion');
      if (autoEval && autoEval.objetivosNoAplican) {
        const decision=evLider?.objetivosNoAplicanDecision || (evLider?.objetivosNoAplicanConfirmados?'confirmado':'');
        let ok=false;
        if(decision==='confirmado') ok=!!String(evLider?.objetivosNoAplicanComentarioLider||'').trim();
        if(decision==='rechazado'){ const objs=S.getObjetivos(evaluacionId).filter(o=>(o.descripcion||'').trim()); ok=objs.length>0 && objs.every(o=>(o.descripcion||'').trim()&&String(o.meta||'').trim()&&String(o.resultado||'').trim()&&o.calificacion) && !!String(evLider?.objetivosNoAplicanComentarioLider||'').trim(); }
        if(!ok){ const block=wizard.querySelector('.leader-na-objectives'); if(block) faltantes.push(block); }
        return marcarErroresYEnfocar(faltantes);
      }
      const objetivos = S.getObjetivos(evaluacionId) || [];
      const filas = wizard.querySelectorAll('.objetivo-row');
      filas.forEach((fila) => {
        const idx = Number(fila.dataset.idx);
        const o = objetivos.find((x) => Number(x.index) === idx);
        if (!o || o.calificacion === '' || o.calificacion === null || o.calificacion === undefined || (o.ajusteManualLider && !String(o.justificacionLider || '').trim())) faltantes.push(fila);
      });
    } else {
      if (evaluacionSinObjetivos(evaluacionId)) { const evNA=S.load().evaluaciones.find(e=>e.id===evaluacionId); if(!String(evNA?.objetivosNoAplicanMotivo||'').trim()||!String(evNA?.objetivosNoAplicanDetalle||'').trim()){ const block=wizard.querySelector('.objective-na-diagnostic')||wizard.querySelector('.objective-na-choice'); if(block) faltantes.push(block); } return marcarErroresYEnfocar(faltantes); }
      const objetivos = S.getObjetivos(evaluacionId) || [];
      const filas = wizard.querySelectorAll('.objetivo-row');
      filas.forEach((fila, i) => {
        const o = objetivos.find((x) => Number(x.index) === i);
        const tieneAlgo = o && ((o.descripcion || '').trim() || (o.meta || '').trim() || (o.resultado || '').trim() || o.calificacion || o.cumplimiento !== '' || o.noCuantificable);
        const completo = o && (o.descripcion || '').trim() && (o.meta || '').trim() && (o.resultado || '').trim() && o.calificacion;
        if (tieneAlgo && !completo) faltantes.push(fila);
      });
      if (!objetivos.some((o) => (o.descripcion || '').trim() && (o.meta || '').trim() && (o.resultado || '').trim() && o.calificacion)) {
        if (!faltantes.length && filas[0]) faltantes.push(filas[0]);
      }
    }

    return marcarErroresYEnfocar(faltantes);
  }

  function requiereJustificacionNA(evaluacionId) {
    const por = S.getRespuestasPorSeccion(evaluacionId);
    return ['actitud','habilidades'].some((sec) => {
      const total = (D.COMPETENCIAS[sec] || []).length;
      if (!total) return false;
      const na = (por[sec] || []).filter((r) => String(r.valor) === 'N/A').length;
      return na > total / 2;
    });
  }

  const Actions = {
    setLanguage(lang) { setLanguage(lang); },
    recargarBackend() { if(global.EDDApi&&global.EDDApi.clearReadCache) global.EDDApi.clearReadCache(); state.remote.ready=false; state.remote.error=null; state.remote.detail=null; refreshBackendRead(true); render(); },
    async abrirEvaluacionLider(employeeId, evaluationId) {
      if (!apiWriteMode()) { navigate('#/lider/evaluar/' + employeeId); return; }
      if (state.remote.loadingEvaluationId) return;
      state.remote.loadingEvaluationId = String(evaluationId);
      try {
        showNotice('Cargando evaluación del colaborador…','info');
        const detail = apiData(await global.EDDApi.evaluationDetail(evaluationId));
        const team = (state.remote.team && state.remote.team.team) || [];
        const row = team.find(x => String(x.employeeId) === String(employeeId)) || {};
        const emp = detail.employee || {employeeId, name:row.name, position:row.position, area:row.area};
        const col = upsertColaboradorRemoto(emp, state.user.empleado);
        const evInfo = detail.evaluation || {};
        const selfBackendId = evInfo.selfEvaluationId || evInfo.evaluationId || evaluationId;
        const leaderBackendId = evInfo.leaderEvaluationId || evInfo.managerEvaluationId || row.leaderEvaluationId || evaluationId;
        const auto = getOrCreateLocalEvaluation(employeeId, state.user.empleado, 'autoevaluacion', selfBackendId, evInfo.selfState || row.selfStatus || 'Completada');
        const lev = getOrCreateLocalEvaluation(employeeId, state.user.empleado, 'lider', leaderBackendId, evInfo.leaderState || row.leaderStatus || 'En progreso');
        (detail.answers || []).forEach(a => {
          const who=String(a.evaluator||a.evaluador||a.role||'').toLowerCase();
          mapRemoteAnswerToLocal(/l[ií]der|leader/.test(who)?lev.id:auto.id,a);
        });
        hydrateObjectives(auto.id, detail.objectives || [], false);
        hydrateObjectives(lev.id, detail.objectives || [], true);
        const backendMetrics = syncBackendResultsFromDetail(detail, auto, lev);
        hydrateRemoteFeedback(detail, String(employeeId), state.periodo.id, lev);
        if (auto.estado === D.ESTADOS.COMPLETADA && !(backendMetrics && backendMetrics.selfMetrics)) ensureLocalResultForEvaluation(auto);
        if (lev.estado === D.ESTADOS.COMPLETADA && !(backendMetrics && backendMetrics.leaderMetrics)) ensureLocalResultForEvaluation(lev);
        state.wizard={seccionIdx:0,evaluacionId:lev.id,tipo:'lider',colaboradorId:String(employeeId),liderId:String(state.user.empleado)};
        navigate('#/lider/evaluar/' + employeeId);
      } catch (err) { showNotice(err.message || 'No fue posible cargar la evaluación.','warning'); } finally { state.remote.loadingEvaluationId = null; }
    },
    async abrirComparacionLider(employeeId, evaluationId) {
      if (!apiReadMode()) { navigate('#/lider/comparacion/' + employeeId); return; }
      if (state.remote.loadingEvaluationId) return;
      state.remote.loadingEvaluationId=String(evaluationId);
      try {
        showNotice('Cargando seguimiento y retroalimentación…','info');
        const detail=apiData(await global.EDDApi.evaluationDetail(evaluationId,true));
        state.remote.detail=detail;
        const row=((state.remote.team&&state.remote.team.team)||[]).find(x=>String(x.employeeId)===String(employeeId))||{};
        const emp=detail.employee||{employeeId,name:row.name,position:row.position,area:row.area};
        upsertColaboradorRemoto(emp,state.user.empleado);
        const info=detail.evaluation||{};
        const auto=getOrCreateLocalEvaluation(employeeId,state.user.empleado,'autoevaluacion',info.selfEvaluationId||info.evaluationId||evaluationId,info.selfState||row.selfStatus||'Completada');
        const lev=getOrCreateLocalEvaluation(employeeId,state.user.empleado,'lider',info.leaderEvaluationId||info.managerEvaluationId||row.leaderEvaluationId||(evaluationId+'-LIDER'),info.leaderState||row.leaderStatus||'Completada');
        (detail.answers||[]).forEach(a=>{const who=String(a.evaluator||a.evaluador||a.role||a.evaluatorRole||'').toLowerCase();mapRemoteAnswerToLocal(/l[ií]der|leader/.test(who)?lev.id:auto.id,a);});
        hydrateObjectives(auto.id,detail.objectives||[],false); hydrateObjectives(lev.id,detail.objectives||[],true);
        syncBackendResultsFromDetail(detail,auto,lev); hydrateRemoteFeedback(detail,String(employeeId),state.periodo.id,lev);

        // v13.3: no dependemos del evento hashchange para pintar el seguimiento.
        // En producción se observó que la URL cambiaba a /lider/comparacion/:id
        // pero la vista anterior quedaba montada. Actualizamos el hash mediante
        // History API y renderizamos explícitamente con el detalle ya hidratado.
        const target = '#/lider/comparacion/' + employeeId;
        if (location.hash !== target) history.pushState(null, '', target);
        state.remote.loadingEvaluationId = null;
        render();
      } catch(e) { showNotice(e&&e.message?e.message:'No fue posible cargar el seguimiento.','warning'); }
      finally { state.remote.loadingEvaluationId=null; }
    },
    async abrirCalibracionDO(employeeId, evaluationId) {
      if (!apiReadMode()) { navigate('#/admin/calibracion/' + employeeId); return; }
      state.remote.detail = null;
      navigate('#/admin/calibracion/' + employeeId);
      await Actions.cargarDetalleCalibracionDO(employeeId, evaluationId);
    },
    async cargarDetalleCalibracionDO(employeeId, evaluationId) {
      if (!apiReadMode() || state.remote.detailLoading || !evaluationId) return;
      state.remote.detailLoading = true; state.remote.detailError = null;
      try {
        const detail = apiData(await global.EDDApi.evaluationDetail(evaluationId, true));
        state.remote.detail = detail; state.remote.detailRetry = 0;
        // Hidrata una copia local únicamente para reutilizar componentes visuales históricos;
        // la fuente de verdad sigue siendo backend y no se sustituye con datos demo.
        try {
          const emp = detail.employee || { employeeId, name:'', position:'', area:'' };
          upsertColaboradorRemoto(emp, (detail.leader&&detail.leader.employeeId)||'');
          const info = detail.evaluation || {};
          const auto = getOrCreateLocalEvaluation(employeeId, (detail.leader&&detail.leader.employeeId)||'', 'autoevaluacion', info.selfEvaluationId||evaluationId, info.selfState||'Completada');
          const lev = getOrCreateLocalEvaluation(employeeId, (detail.leader&&detail.leader.employeeId)||'', 'lider', info.leaderEvaluationId||info.managerEvaluationId||(evaluationId+'-LIDER'), info.leaderState||'Completada');
          (detail.answers||[]).forEach(a=>{ const who=String(a.evaluator||a.evaluador||a.role||a.evaluatorRole||'').toLowerCase(); mapRemoteAnswerToLocal(/l[ií]der|leader/.test(who)?lev.id:auto.id,a); });
          hydrateObjectives(auto.id, detail.objectives||[], false); hydrateObjectives(lev.id, detail.objectives||[], true);
          syncBackendResultsFromDetail(detail, auto, lev);
          hydrateRemoteFeedback(detail,String(employeeId),state.periodo.id,lev);
        } catch(e) { console.warn('EDD DO: hidratación visual parcial',e); }
      } catch(e) { state.remote.detailError = e.message||'No fue posible cargar el expediente completo.'; showNotice(state.remote.detailError,'warning'); }
      finally { state.remote.detailLoading=false; render(); }
    },
    async reintentarDetalleCalibracion(employeeId,evaluationId){ state.remote.detailError=null; state.remote.detail=null; state.remote.detailRetry=(state.remote.detailRetry||0)+1; render(); await Actions.cargarDetalleCalibracionDO(employeeId,evaluationId); },
    async liberarResultadoRemoto(evaluationId){
      if(state.remote.calibrationReleasing) return;
      state.remote.calibrationReleasing=true; render();
      try{
        const released=apiData(await global.EDDApi.releaseResult(evaluationId));
        if(released&&released.feedbackId){
          const employeeId=(state.remote.detail&&state.remote.detail.employee&&(state.remote.detail.employee.employeeId||state.remote.detail.employee.empleado))||'';
          if(employeeId) S.crearOActualizarCalibracion(String(employeeId),state.periodo.id,{feedbackId:released.feedbackId,retroHabilitada:true,_motivo:'Release confirmado por backend'},state.user.nombre);
        }
        try {
          const employeeId=(state.remote.detail&&state.remote.detail.employee&&(state.remote.detail.employee.employeeId||state.remote.detail.employee.empleado))||'';
          if(employeeId) await refreshFeedbackDetail(evaluationId,employeeId,S.getEvaluacion(String(employeeId),state.periodo.id,'lider'));
        } catch(refreshErr){ console.warn('Release confirmado; refresh de feedback pendiente',refreshErr); }
        showNotice('Resultado liberado para retroalimentación.','success');
        if(global.EDDApi.adminCalibration) state.remote.calibration=apiData(await global.EDDApi.adminCalibration(true));
        if(global.EDDApi.adminDashboard) state.remote.dashboard=apiData(await global.EDDApi.adminDashboard(true));
      }catch(e){
        showNotice(e&&e.message?e.message:'No fue posible liberar el resultado.','warning');
      }finally{state.remote.calibrationReleasing=false;render();}
    },
    logout,
    async solicitarCodigo(numeroEmpleado) {
      state.login.error = null; state.login.info = null;
      if (!numeroEmpleado) { state.login.error = 'Captura tu número de empleado.'; render(); return; }
      state.login.loading = true; state.login.numeroEmpleado = numeroEmpleado; render();
      try {
        const resp = await A.requestCode(numeroEmpleado);
        state.login.paso = 'validar';
        state.login.maskedEmail = resp.maskedEmail || null;
        state.login.loading = false;
        state.login.info = null;
        render();
      } catch (err) {
        console.error('Error al solicitar código', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    async validarCodigo() {
      const codigo = ($('#loginCodigo') || {}).value || '';
      state.login.error = null; state.login.info = null; state.login.loading = true; render();
      try {
        const resp = await A.verifyCode(state.login.numeroEmpleado, codigo.trim());
        const appUser = A.getAppUser();
        state.user = appUser;
        S.addAudit(appUser.nombre, 'Inicio de sesión', 'usuarios', appUser.empleado, null, appUser.perfil);
        resetLoginState('solicitar');
        irAHomeDePerfil(appUser.perfil);
      } catch (err) {
        console.error('Error al validar código', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    async reenviarCodigo() {
      await Actions.solicitarCodigo(state.login.numeroEmpleado);
      state.login.info = 'Se envió un nuevo código.';
      render();
    },
    corregirEmpleado() {
      A.limpiarPendiente();
      resetLoginState('solicitar');
      render();
    },
    async quickLogin(numeroEmpleado) {
      if (global.APP_CONFIG.mode === 'api') return; // solo disponible en modo demo
      state.login.error = null; state.login.info = null; state.login.loading = true; render();
      try {
        await A.requestCode(numeroEmpleado);
        const resp = await A.verifyCode(numeroEmpleado, global.APP_CONFIG.demoCode);
        const appUser = A.getAppUser();
        state.user = appUser;
        S.addAudit(appUser.nombre, 'Inicio de sesión', 'usuarios', appUser.empleado, null, appUser.perfil);
        resetLoginState('solicitar');
        irAHomeDePerfil(appUser.perfil);
      } catch (err) {
        console.error('Error en acceso rápido', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    async comenzarEvaluacion() {
      marcarIntroVista();
      if (apiWriteMode()) {
        try {
          const mine = state.remote.mine && state.remote.mine.evaluation;
          if (!mine) {
            showNotice('Preparando tu evaluación…','info');
            await global.EDDApi.initializeMyEvaluation();
            state.remote.ready = false; await refreshBackendRead(true);
          }
        } catch (err) { showNotice(err.message || 'No fue posible iniciar la evaluación.','warning'); return; }
      }
      navigate(personalRoute('autoevaluacion'));
    },
    wizardNext(seccionActual) {
      if (seccionActual !== 'resumen') {
        const ev = { id: state.wizard.evaluacionId };
        const seccion = seccionActual;
        const faltantes = validarSeccionVisual(ev.id, seccion);
        if (faltantes) {
          showNotice(currentLang === 'en' ? `You cannot continue. Review the fields marked in red.` : `No puedes continuar. Revisa los campos marcados en rojo.`,'warning');
          return;
        }
      }
      state.wizard.seccionIdx = Math.min(state.wizard.seccionIdx + 1, SECCIONES_WIZARD.length - 1);
      render();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }));
    },
    wizardPrev() {
      state.wizard.seccionIdx = Math.max(state.wizard.seccionIdx - 1, 0);
      render();
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })));
    },
    irSeccionWizard(idx) {
      state.wizard.seccionIdx = Math.max(0, Math.min(Number(idx) || 0, SECCIONES_WIZARD.length - 1));
      render();
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })));
    },
    comprenderObjetivos(evaluacionId) { sessionStorage.setItem(objectivesAckKey(evaluacionId), '1'); render(); },
    async guardarProgresoVisual() {
      const btn = document.querySelector('.premium-save-btn'); const original = btn ? btn.textContent : 'Guardar progreso';
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
      try {
        if (apiWriteMode()) {
          const localId = state.wizard.evaluacionId; let backendId = backendIdForLocalEvaluation(localId);
          if (!backendId && state.wizard.tipo === 'autoevaluacion') {
            const init = apiData(await global.EDDApi.initializeMyEvaluation()); backendId = init && init.evaluationId;
            const db=S.load(); const ev=db.evaluaciones.find(e=>e.id===localId); if(ev){ev.backendId=backendId;S.persist();}
          }
          if (!backendId) throw new Error('No se encontró el identificador de backend de la evaluación.');
          if (state.wizard.tipo === 'lider') await global.EDDApi.saveLeaderDraft(backendId, leaderDraftPayload(localId, backendId));
          else await global.EDDApi.saveSelfDraft(backendId, selfDraftPayload(localId, backendId));
          showNotice('Progreso guardado correctamente.','success');
        }
        if (btn) { btn.textContent = '✓ Guardado'; btn.classList.add('saved'); setTimeout(() => { btn.textContent = original; btn.classList.remove('saved'); btn.disabled=false; }, 1400); }
      } catch (err) {
        if (btn) { btn.textContent=original; btn.disabled=false; }
        showNotice(err.message || 'No fue posible guardar el progreso.','warning');
      }
    },
    rate(evaluacionId, seccion, competenciaId, valor) {
      const existentes = S.getRespuestas(evaluacionId);
      const actual = existentes.find((r) => r.competenciaId === competenciaId);
      S.saveRespuesta(evaluacionId, seccion, competenciaId, valor, actual ? actual.comentario : '');
      const card = Array.from(document.querySelectorAll('.competency-card')).find((el) => el.dataset.competenciaId === String(competenciaId));
      if (card) card.classList.remove('validation-error');
    },
    comentar(evaluacionId, seccion, competenciaId, comentario) {
      const existentes = S.getRespuestas(evaluacionId);
      const actual = existentes.find((r) => r.competenciaId === competenciaId);
      S.saveRespuesta(evaluacionId, seccion, competenciaId, actual ? actual.valor : '', comentario);
    },
    toggleObjetivosNoAplican(evaluacionId, checked) {
      const db = S.load();
      const ev = db.evaluaciones.find((e) => e.id === evaluacionId);
      if (!ev) return;
      ev.objetivosNoAplican = !!checked;
      ev.updatedAt = new Date().toISOString();
      // No eliminamos objetivos al marcar N/A. Se conservan ocultos para que la
      // decisión sea reversible durante el borrador; si el usuario desmarca la
      // opción, recupera lo que ya había capturado sin perder información.
      if (!checked) { ev.objetivosNoAplicanMotivo=''; ev.objetivosNoAplicanDetalle=''; }
      S.persist();
      render();
    },
    setObjetivosNoAplicanMotivo(evaluacionId, valor) { const ev=S.load().evaluaciones.find(e=>e.id===evaluacionId); if(!ev)return; ev.objetivosNoAplicanMotivo=valor||''; ev.updatedAt=new Date().toISOString(); S.persist(); },
    setObjetivosNoAplicanDetalle(evaluacionId, valor) { const ev=S.load().evaluaciones.find(e=>e.id===evaluacionId); if(!ev)return; ev.objetivosNoAplicanDetalle=valor||''; ev.updatedAt=new Date().toISOString(); S.persist(); },
    decisionObjetivosNoAplicanLider(evaluacionId, decision) { const ev=S.load().evaluaciones.find(e=>e.id===evaluacionId); if(!ev)return; ev.objetivosNoAplicanDecision=decision; ev.objetivosNoAplicanConfirmados=decision==='confirmado'; ev.objetivosNoAplican=decision==='confirmado'; ev.updatedAt=new Date().toISOString(); S.persist(); render(); },
    setObjetivosNoAplicanComentarioLider(evaluacionId, valor) { const ev=S.load().evaluaciones.find(e=>e.id===evaluacionId); if(!ev)return; ev.objetivosNoAplicanComentarioLider=valor||''; ev.updatedAt=new Date().toISOString(); S.persist(); },
    confirmarObjetivosNoAplicanLider(evaluacionId, checked) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (!ev) return;
      ev.objetivosNoAplicanConfirmados = !!checked; ev.objetivosNoAplican = !!checked; ev.updatedAt = new Date().toISOString(); S.persist(); render();
    },
    validarCumplimientoObjetivoLider(evaluacionId, index, valor) {
      const autoEval = S.getEvaluacion(state.wizard.colaboradorId, state.periodo.id, 'autoevaluacion');
      const fuente = autoEval ? S.getObjetivos(autoEval.id).find((o) => Number(o.index) === Number(index)) : null;
      const actual = S.getObjetivos(evaluacionId).find((o) => Number(o.index) === Number(index));
      if (!fuente) return;
      const pct = valor === '' ? '' : Number(valor);
      const pctAuto = fuente.cumplimiento === '' || fuente.cumplimiento == null ? '' : Number(fuente.cumplimiento);
      const score = pct === '' || !Number.isFinite(pct) ? '' : C.calificacionPorCumplimiento(pct);
      const ajustado = pct !== '' && Number.isFinite(Number(pctAuto)) ? Math.abs(Number(pct) - Number(pctAuto)) > 0.01 : false;
      S.saveObjetivo(evaluacionId, Number(index), fuente.descripcion || '', fuente.resultado || '', score, {meta:fuente.meta||'', cumplimiento:pct, cumplimientoAutomatico:fuente.cumplimiento??'', noCuantificable:false, calificacionAutomatica:fuente.calificacion||'', ajusteManualLider:ajustado, justificacionLider:ajustado?(actual?.justificacionLider||''):''});
      render();
    },
    justificarObjetivoLider(evaluacionId, index, texto) {
      const autoEval = S.getEvaluacion(state.wizard.colaboradorId, state.periodo.id, 'autoevaluacion');
      const fuente = autoEval ? S.getObjetivos(autoEval.id).find((o) => Number(o.index) === Number(index)) : null;
      const actual = S.getObjetivos(evaluacionId).find((o) => Number(o.index) === Number(index));
      if (!fuente || !actual) return;
      S.saveObjetivo(evaluacionId, Number(index), fuente.descripcion || '', fuente.resultado || '', actual.calificacion || '', {meta:fuente.meta||'', cumplimiento:actual.cumplimiento??fuente.cumplimiento??'', cumplimientoAutomatico:fuente.cumplimiento??'', noCuantificable:false, calificacionAutomatica:fuente.calificacion||'', ajusteManualLider:!!actual.ajusteManualLider, justificacionLider:texto||''});
      const fila=document.querySelector(`.objetivo-row[data-idx="${Number(index)}"]`); if(fila&&String(texto||'').trim()&&actual.calificacion) fila.classList.remove('validation-error');
    },
    agregarObjetivo(evaluacionId) {
      const objetivos = S.getObjetivos(evaluacionId);
      if (objetivos.length >= 5) return;
      const usados = new Set(objetivos.map((o) => Number(o.index)));
      let nextIndex = 0; while (usados.has(nextIndex)) nextIndex++;
      S.saveObjetivo(evaluacionId, nextIndex, '', '', '', { meta:'', cumplimiento:'', noCuantificable:false });
      render();
    },
    editarObjetivo(evaluacionId, index, campo, valor) {
      return Actions.editarObjetivoKPI(evaluacionId, index, campo, valor);
    },
    editarObjetivoKPI(evaluacionId, index, campo, valor) {
      const objetivos = S.getObjetivos(evaluacionId);
      const o = objetivos.find((x) => Number(x.index) === Number(index)) || { index:Number(index), descripcion:'', meta:'', resultado:'', cumplimiento:'', noCuantificable:false, calificacion:'' };
      o[campo] = valor;
      if (campo === 'meta' || campo === 'resultado') {
        const cumplimiento = cumplimientoAutomatico(o.meta, o.resultado);
        o.cumplimiento = cumplimiento;
        const score = cumplimiento === '' ? null : C.calificacionPorCumplimiento(cumplimiento);
        o.calificacion = score === null ? '' : score;
      }
      if (campo === 'noCuantificable' && valor) o.cumplimiento = '';
      S.saveObjetivo(evaluacionId, Number(index), o.descripcion || '', o.resultado || '', o.calificacion || '', {
        meta: o.meta || '', cumplimiento: o.cumplimiento ?? '', noCuantificable: !!o.noCuantificable
      });
      const fila = document.querySelector(`.objetivo-row[data-idx="${Number(index)}"]`);
      if (fila && (o.descripcion || '').trim() && String(o.meta || '').trim() && String(o.resultado || '').trim() && o.calificacion) fila.classList.remove('validation-error');
      if (campo === 'meta' || campo === 'resultado' || campo === 'noCuantificable') render();
    },
    editarObjetivoSmart(evaluacionId, index, campo, valor) {
      // Compatibilidad temporal: SMART queda fuera del flujo Rev.4; redirige a captura KPI.
      return Actions.editarObjetivoKPI(evaluacionId, index, campo, valor);
    },
    quitarObjetivo(evaluacionId, index) { S.removeObjetivo(evaluacionId, index); render(); },

    // --- Asistente de IA para objetivos SMART -----------------------------
    abrirAsistenteIA(evaluacionId, index) {
      state.aiSmart.open = true;
      state.aiSmart.evaluacionId = evaluacionId;
      state.aiSmart.index = Number(index);
      state.aiSmart.idea = '';
      state.aiSmart.loading = false;
      state.aiSmart.error = null;
      state.aiSmart.proposal = null;
      renderAiSmartModal();
    },
    cerrarAsistenteIA() {
      if (state.aiSmart.loading) return; // evita cerrar a medio de una solicitud en curso
      if (state.aiSmart.proposal) {
        console.log('[AUDIT] AI_SMART_DISCARDED', { employeeId: state.user.empleado, evaluationId: state.aiSmart.evaluacionId, objectiveIndex: state.aiSmart.index, timestamp: new Date().toISOString() });
      }
      state.aiSmart.open = false;
      renderAiSmartModal();
    },
    actualizarIdeaIA(valor) {
      state.aiSmart.idea = String(valor || '').slice(0, AI_IDEA_MAX);
      state.aiSmart.error = null;
      renderAiSmartModal();
    },
    async generarPropuestaIA() {
      const ai = state.aiSmart;
      const idea = (ai.idea || '').trim();
      if (idea.length < AI_IDEA_MIN) { ai.error = t('Escribe al menos 5 caracteres para describir tu idea.'); renderAiSmartModal(); return; }
      ai.loading = true; ai.error = null;
      renderAiSmartModal();
      // AI_SMART_REQUEST — auditoría del lado del backend en producción (ver
      // README); en demo se registra en consola para poder verificar el flujo.
      console.log('[AUDIT] AI_SMART_REQUEST', { employeeId: state.user.empleado, evaluationId: ai.evaluacionId, objectiveIndex: ai.index, timestamp: new Date().toISOString() });
      try {
        const col = S.getColaborador(state.wizard.colaboradorId);
        const employeeContext = col ? { position: col.puesto, area: col.area } : undefined;
        const propuesta = await generarPropuestaSmartIA(idea, currentLang, employeeContext);
        state.aiSmart.proposal = propuesta;
        state.aiSmart.loading = false;
        renderAiSmartModal();
      } catch (err) {
        console.error('Asistente de IA SMART: error al generar propuesta', err);
        state.aiSmart.loading = false;
        state.aiSmart.error = t('No fue posible generar la propuesta en este momento. Puedes continuar redactando el objetivo manualmente.');
        renderAiSmartModal();
      }
    },
    regenerarPropuestaIA() {
      state.aiSmart.proposal = null;
      renderAiSmartModal();
      Actions.generarPropuestaIA();
    },
    // Botón "Editar": lleva el foco al campo de objetivo dentro de la propia
    // vista previa — los campos de la propuesta ya son editables directamente
    // (ver renderAiSmartPreview), así que aquí solo reforzamos visualmente
    // cuál es el campo a ajustar (comportamiento discreto, sin bloquear nada).
    editarPropuestaIA() {
      const el = document.getElementById('aiSmartObjectiveInput');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    },
    usarPropuestaIA() {
      const ai = state.aiSmart;
      const objectiveEl = document.getElementById('aiSmartObjectiveInput');
      const indicatorEl = document.getElementById('aiSmartIndicatorInput');
      const objetivo = objectiveEl ? objectiveEl.value.trim() : (ai.proposal ? ai.proposal.objective : '');
      const meta = indicatorEl ? indicatorEl.value.trim() : (ai.proposal ? ai.proposal.indicator : '');
      Actions.editarObjetivoSmart(ai.evaluacionId, ai.index, 'descripcion', objetivo);
      Actions.editarObjetivoSmart(ai.evaluacionId, ai.index, 'meta', meta);
      // Solo se prellena la fecha de compromiso si la IA devolvió una fecha
      // EXACTA (formato AAAA-MM-DD); si devolvió un plazo relativo ("3 meses")
      // nunca se inventa una fecha absoluta — se muestra como sugerencia junto
      // al campo y el usuario elige la fecha manualmente (ver requerimiento 9).
      const plazo = ai.proposal ? ai.proposal.suggestedDeadline : null;
      if (plazo && /^\d{4}-\d{2}-\d{2}$/.test(plazo)) {
        Actions.editarObjetivoSmart(ai.evaluacionId, ai.index, 'fechaCompromiso', plazo);
      } else if (plazo) {
        state.aiSmart.deadlineHints[claveHintPlazo(ai.evaluacionId, ai.index)] = plazo;
      }
      console.log('[AUDIT] AI_SMART_ACCEPTED', { employeeId: state.user.empleado, evaluationId: ai.evaluacionId, objectiveIndex: ai.index, timestamp: new Date().toISOString() });
      state.aiSmart.open = false;
      renderAiSmartModal();
      render();
    },
    async enviarAutoevaluacion() {
      if (!$('#confirmEnvioAuto').checked) { showNotice(t('Confirma que la información es correcta antes de enviar.'),'warning'); return; }
      const evaluacionId = state.wizard.evaluacionId;
      for (let i = 0; i < SECCIONES_WIZARD.length - 1; i++) {
        const sec = SECCIONES_WIZARD[i];
        const incompleta = sec === 'objetivos'
          ? (!evaluacionSinObjetivos(evaluacionId) && !S.getObjetivos(evaluacionId).some((o) => (o.descripcion || '').trim() && (o.meta || '').trim() && (o.resultado || '').trim() && o.calificacion))
          : (S.getRespuestasPorSeccion(evaluacionId)[sec] || []).filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).length < D.COMPETENCIAS[sec].length;
        if (incompleta) {
          state.wizard.seccionIdx = i; render();
          setTimeout(() => {
            const n = validarSeccionVisual(evaluacionId, sec);
            showNotice(currentLang === 'en' ? `You cannot submit. Review the fields marked in red.` : `No puedes enviar. Revisa los campos marcados en rojo.`,'warning');
          }, 0);
          return;
        }
      }
      const objetivos = S.getObjetivos(evaluacionId).filter((o) => o.descripcion && o.descripcion.trim());
      if (!evaluacionSinObjetivos(evaluacionId) && !objetivos.length) { showNotice(t('Registra al menos un objetivo o marca que no tienes objetivos aplicables antes de enviar.'),'warning'); return; }
      const evActual = S.load().evaluaciones.find((e) => e.id === evaluacionId);
      if (requiereJustificacionNA(evaluacionId) && !(evActual && String(evActual.comentarios || '').trim())) {
        state.wizard.seccionIdx = SECCIONES_WIZARD.length - 1; render();
        setTimeout(() => showNotice('Más de la mitad de una sección está marcada como N/A. Agrega una justificación en Comentarios u observaciones antes de enviar.','warning'), 0);
        return;
      }
      const submitBtn = document.querySelector('button[onclick="App.enviarAutoevaluacion()"]');
      const submitBtnOriginal = submitBtn ? submitBtn.textContent : 'Finalizar y enviar ✓';
      if (submitBtn) {
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
        submitBtn.setAttribute('aria-busy', 'true');
      }
      try {
        if (apiWriteMode()) {
          let backendId = backendIdForLocalEvaluation(evaluacionId);
          if (!backendId) { const init=apiData(await global.EDDApi.initializeMyEvaluation()); backendId=init&&init.evaluationId; const db=S.load(); const local=db.evaluaciones.find(e=>e.id===evaluacionId); if(local){local.backendId=backendId;S.persist();} }
          if (!backendId) throw new Error('No se encontró la evaluación en backend.');
          await global.EDDApi.saveSelfDraft(backendId, selfDraftPayload(evaluacionId, backendId));
          await global.EDDApi.submitSelf(backendId);
          try {
            const fresh = apiData(await global.EDDApi.evaluationDetail(backendId, { force:true }));
            state.remote.detail = fresh;
            const localEv = S.load().evaluaciones.find(e=>e.id===evaluacionId);
            if (localEv) syncBackendResultsFromDetail(fresh, localEv, null);
          } catch (e) { console.warn('No fue posible refrescar resultado backend tras submit-self', e); }
        }
        S.completarEvaluacion(evaluacionId, state.user.nombre);
        if (apiTestCaptureMode()) showNotice('Prueba completada localmente. Aún no se envió a Airtable porque la capa de escritura sigue pendiente.','info');
        if (apiWriteMode()) { state.remote.ready=false; await refreshBackendRead(true); }
        navigate(personalRoute('enviado'));
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnOriginal;
          submitBtn.removeAttribute('aria-busy');
        }
        const detalle = err && err.detalle;
        const code = detalle && (detalle.code || (detalle.error && detalle.error.code));
        let msg = (detalle && ((detalle.error&&detalle.error.message)||detalle.message)) || err.message || 'No fue posible enviar la evaluación.';
        if (code === 'objective_required') {
          msg = 'Registra al menos un objetivo con meta y resultado antes de enviar.';
        }
        showNotice(msg + (code ? ` (${code})` : ''),'warning');
      }
    },
    editarObjetivoLider(evaluacionId, index, calificacion) {
      return Actions.calificarObjetivoLider(evaluacionId, index, calificacion);
    },

    setFortalezas(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.fortalezas = valor; S.persist(); }
    },
    setOportunidades(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.oportunidadesDesarrollo = valor; S.persist(); }
    },
    setDebilidades(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.debilidadesBrechas = valor; S.persist(); }
    },
    setAmenazas(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.riesgosAtencion = valor; S.persist(); }
    },
    setComentarios(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.comentarios = valor; S.persist(); }
    },
    mostrarNuevaArea(colaboradorId){ const el=document.getElementById('nuevaArea-'+colaboradorId); if(el) el.classList.remove('hidden'); },
    ocultarNuevaArea(colaboradorId){ const el=document.getElementById('nuevaArea-'+colaboradorId); if(el) el.classList.add('hidden'); },
    guardarNuevaArea(colaboradorId){ const a=document.getElementById('areaNueva-'+colaboradorId); const p=document.getElementById('planNuevo-'+colaboradorId); if(!a||!p||!a.value.trim()||!p.value.trim()){showNotice('Completa el área de oportunidad y el plan de mejora.','warning');return;} S.addAreaOportunidad(colaboradorId,state.periodo.id,a.value.trim(),p.value.trim(),state.user.nombre); render(); },
    quitarAreaOportunidad(id) { S.removeAreaOportunidad(id, state.user.nombre); render(); },
    mostrarNuevoPlan(colaboradorId){ const el=document.getElementById('nuevoPlan-'+colaboradorId); if(el) el.classList.remove('hidden'); },
    ocultarNuevoPlan(colaboradorId){ const el=document.getElementById('nuevoPlan-'+colaboradorId); if(el) el.classList.add('hidden'); },
    guardarNuevoPlan(colaboradorId,liderId){ const c=document.getElementById('competenciaNueva-'+colaboradorId),a=document.getElementById('accionNueva-'+colaboradorId),r=document.getElementById('responsableNuevo-'+colaboradorId),f=document.getElementById('fechaNueva-'+colaboradorId); if(!c||!a||!c.value.trim()||!a.value.trim()){showNotice('Completa la competencia y la acción de desarrollo.','warning');return;} S.addPlanDesarrollo(colaboradorId,state.periodo.id,{competencia:c.value.trim(),accion:a.value.trim(),responsable:r&&r.value.trim()?r.value.trim():liderId,fechaCompromiso:f&&f.value?f.value:'2026-09-01'},state.user.nombre); render(); },
    quitarPlanDesarrollo(id) { S.removePlanDesarrollo(id, state.user.nombre); render(); },
    async enviarEvaluacionLider(colaboradorId) {
      if (state.remote.leaderSubmitting) return;
      if (!$('#confirmEnvioLider').checked) { showNotice(t('Confirma que la evaluación está completa antes de enviar.'),'warning'); return; }
      const evaluacionId = state.wizard.evaluacionId;
      for (let i = 0; i < SECCIONES_WIZARD.length - 1; i++) {
        const sec = SECCIONES_WIZARD[i];
        let incompleta;
        if (sec === 'objetivos') {
          const autoEval = S.getEvaluacion(colaboradorId, state.periodo.id, 'autoevaluacion');
          const evLider = S.load().evaluaciones.find((e) => e.id === evaluacionId);
          if (autoEval && autoEval.objetivosNoAplican) {
            incompleta = !(evLider && evLider.objetivosNoAplicanConfirmados);
          } else {
            const objetivosAuto = autoEval ? S.getObjetivos(autoEval.id).filter((o) => (o.descripcion || '').trim()) : [];
            const objetivosLider = S.getObjetivos(evaluacionId);
            incompleta = objetivosAuto.some((oa) => {
              const ol = objetivosLider.find((x) => Number(x.index) === Number(oa.index));
              return !ol || ol.calificacion === '' || ol.calificacion === null || ol.calificacion === undefined || (ol.ajusteManualLider && !String(ol.justificacionLider || '').trim());
            });
          }
        } else {
          incompleta = (S.getRespuestasPorSeccion(evaluacionId)[sec] || []).filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).length < D.COMPETENCIAS[sec].length;
        }
        if (incompleta) {
          state.wizard.seccionIdx = i; render();
          setTimeout(() => {
            const n = validarSeccionVisual(evaluacionId, sec);
            showNotice(currentLang === 'en' ? `You cannot submit. Review the fields marked in red.` : `No puedes enviar. Revisa los campos marcados en rojo.`,'warning');
          }, 0);
          return;
        }
      }
      const evActual = S.load().evaluaciones.find((e) => e.id === evaluacionId);
      if (requiereJustificacionNA(evaluacionId) && !(evActual && String(evActual.comentarios || '').trim())) {
        state.wizard.seccionIdx = SECCIONES_WIZARD.length - 1; render();
        setTimeout(() => showNotice('Más de la mitad de una sección está marcada como N/A. Justifica el uso de N/A en Comentarios generales antes de enviar.','warning'), 0);
        return;
      }
      const submitBtn = document.getElementById('btnEnviarEvaluacionLider');
      const submitBtnOriginal = submitBtn ? submitBtn.textContent : 'Enviar evaluación ✓';
      state.remote.leaderSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.classList.add('is-submitting');
      }
      try {
        if (apiWriteMode()) {
          const backendId = backendIdForLocalEvaluation(evaluacionId);
          if (!backendId) throw new Error('No se encontró el identificador backend de la evaluación del líder.');
          showNotice('Guardando los últimos cambios…', 'info');
          if (submitBtn) submitBtn.textContent = 'Guardando…';
          await global.EDDApi.saveLeaderDraft(backendId, leaderDraftPayload(evaluacionId, backendId));
          showNotice('Cambios guardados. Enviando evaluación…', 'info');
          if (submitBtn) submitBtn.textContent = 'Enviando…';
          await global.EDDApi.submitLeader(backendId);
          state.remote.leaderSubmitSuccess = true;
          // El submit ya terminó. La comparación se refresca aparte y jamás retiene
          // el botón ni el mensaje de éxito. Si el GET tarda, la pantalla permite reintentar.
          setTimeout(async()=>{
            try {
              const fresh = apiData(await global.EDDApi.evaluationDetail(backendId, true));
              state.remote.detail = fresh; state.remote.detailError = null;
              const autoEv = S.getEvaluacion(colaboradorId, state.periodo.id, 'autoevaluacion');
              const leaderEv = S.load().evaluaciones.find(e=>e.id===evaluacionId);
              syncBackendResultsFromDetail(fresh, autoEv, leaderEv);
              render();
            } catch (e) { console.warn('Refresh comparación post-submit líder', e); state.remote.detailError = e.message || 'No fue posible cargar la comparación.'; render(); }
          },0);
        }
        S.completarEvaluacion(evaluacionId, state.user.nombre);
        showNotice('Evaluación enviada correctamente.', 'success');
        navigate('#/lider/comparacion/' + colaboradorId);
        // La actualización de dashboard/equipo se hace después y en segundo plano.
        // No bloqueamos la confirmación del envío esperando otros GET de n8n.
        if (apiWriteMode()) {
          // Mantener `ready=true`: el refresh es secundario y NO debe reemplazar la
          // comparación por la pantalla global "Conectando...". Si algún GET falla,
          // la evaluación ya quedó enviada y la vista actual debe seguir utilizable.
          setTimeout(() => refreshBackendRead(true).catch(e => console.warn('Refresh post-submit líder', e)), 0);
        }
      } catch (err) {
        const d=err&&err.detalle;
        const code=(err && (err.tipo === 'timeout' || err.tipo === 'network')) ? null : (d&&(d.code||(d.error&&d.error.code)));
        const msg=(err && (err.tipo === 'timeout' || err.tipo === 'network'))
          ? (err.message || 'No fue posible conectar con el servidor.')
          : ((d&&((d.error&&d.error.message)||d.message))||err.message||'No fue posible enviar la evaluación del líder.');
        showNotice(msg + (code?` (${code})`:''),'warning');
      } finally {
        state.remote.leaderSubmitting = false;
        if (submitBtn && document.body.contains(submitBtn)) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnOriginal;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.classList.remove('is-submitting');
        }
      }
    },
    limpiarFirma(canvasId){ const c=document.getElementById(canvasId); if(!c)return; const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); },
    async firmarRetroalimentacion(role,colaboradorId,periodoId,canvasId){
      const cal=S.getCalibracion(colaboradorId,periodoId), c=document.getElementById(canvasId);
      const perfil=state.user&&state.user.perfil;
      if((role==='lider'&&perfil!=='lider')||(role==='colaborador'&&perfil!=='colaborador')){showNotice('Esta firma debe realizarse desde el portal personal correspondiente.','warning');return;}
      if(role==='colaborador'&&String(state.user.empleado)!==String(colaboradorId)){showNotice('Solo puedes firmar tu propia retroalimentación.','warning');return;}
      if(role==='lider'){ const col=S.getColaborador(colaboradorId); if(!col||String(col.liderId)!==String(state.user.empleado)){showNotice('No tienes autorización para firmar la retroalimentación de este colaborador.','warning');return;} }
      if(!cal||!cal.retroHabilitada){showNotice('La retroalimentación todavía no está habilitada.','warning');return;}
      if(!cal.acuerdosLiberados){showNotice('Los acuerdos finales deben estar liberados antes de firmar.','warning');return;}
      if(role==='colaborador'&&!cal.firmaLider){showNotice('La firma del colaborador se habilita después de la firma del líder.','warning');return;}
      if(!c){showNotice('No se encontró el recuadro de firma.','warning');return;}
      const blank=document.createElement('canvas');blank.width=c.width;blank.height=c.height;
      if(c.toDataURL()===blank.toDataURL()){showNotice('Firma dentro del recuadro antes de confirmar.','warning');return;}
      const now=new Date().toISOString(), data=c.toDataURL('image/png');
      try {
        if(apiWriteMode()){
          const feedbackId=cal.feedbackId;
          if(!feedbackId) throw new Error('No se encontró el identificador de retroalimentación. Actualiza la pantalla e intenta de nuevo.');
          const payload={signatureImage:data};
          if(role==='lider') await global.EDDApi.signFeedbackAsLeader(feedbackId,payload);
          else await global.EDDApi.signFeedbackAsEmployee(feedbackId,payload);
        }
        if(role==='lider') S.crearOActualizarCalibracion(colaboradorId,periodoId,{firmaLider:true,fechaFirmaLider:now,firmaLiderNombre:state.user.nombre,firmaLiderData:data,_motivo:'Líder firma constancia de retroalimentación'},state.user.nombre);
        else S.crearOActualizarCalibracion(colaboradorId,periodoId,{firmaColaborador:true,fechaFirmaColaborador:now,firmaColaboradorNombre:state.user.nombre,firmaColaboradorData:data,aceptacionColaborador:true,fechaAceptacion:now,_motivo:'Colaborador firma constancia de retroalimentación'},state.user.nombre);
        showNotice(role==='lider'?'Firma del líder registrada. El colaborador ya puede firmar.':'Firma registrada. La retroalimentación quedó cerrada.','success');
        if(apiWriteMode()) { try { if(role==='colaborador') await ensureOwnRemoteDetail(true); else { const ev=S.getEvaluacion(colaboradorId,periodoId,'autoevaluacion'); const bid=ev&&ev.backendId; if(bid) await refreshFeedbackDetail(bid,colaboradorId,S.getEvaluacion(colaboradorId,periodoId,'lider')); } } catch(e){console.warn('Refresh post-firma',e);} }
        render();
      } catch(e){ showNotice(e&&e.message?e.message:'No fue posible registrar la firma.','warning'); }
    },
    descargarRetroalimentacion(colaboradorId,periodoId){ const html=buildRetroDocument(colaboradorId,periodoId); if(!html){showNotice('No hay información suficiente para generar la constancia.','warning');return;} const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`retroalimentacion-${colaboradorId}-${periodoId}.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); },
    imprimirRetroalimentacion(colaboradorId,periodoId){ const html=buildRetroDocument(colaboradorId,periodoId); if(!html){showNotice('No hay información suficiente para generar la constancia.','warning');return;} const w=window.open('','_blank','noopener,noreferrer');if(!w){showNotice('Permite ventanas emergentes para imprimir la constancia.','warning');return;}w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{w.focus();w.print();},350); },
    aceptar(colaboradorId, periodoId) {
      const cal=S.getCalibracion(colaboradorId,periodoId); const chk=document.getElementById('confirmAceptacionRetro');
      if(!cal||!cal.acuerdosLiberados){showNotice('Tu líder debe realizar la reunión y liberar los acuerdos finales antes de que puedas aceptar.','warning');return;}
      if(!chk||!chk.checked){showNotice('Confirma que recibiste la retroalimentación y revisaste los acuerdos antes de cerrar.','warning');return;}
      S.aceptarResultado(colaboradorId, periodoId, state.user.nombre); showNotice('Retroalimentación aceptada correctamente.','success'); render();
    },
    rateHerramienta(evaluacionId,seccion,herramientaId,valor){ S.saveHerramientaEvaluacion(evaluacionId,herramientaId,valor); const vals=Object.values(S.getHerramientasEvaluacion(evaluacionId)).filter(v=>v!=='N/A'&&v!==''&&v!=null).map(Number).filter(Number.isFinite); const avg=vals.length?C.round1(vals.reduce((a,b)=>a+b,0)/vals.length):''; S.saveRespuesta(evaluacionId,seccion,'B2',avg,''); render(); },
    async confirmarReunionLider(colaboradorId,periodoId,checked){
      const cal=S.getCalibracion(colaboradorId,periodoId);
      if(apiWriteMode() && !checked){ showNotice('En producción la reunión confirmada no se revierte desde el portal.','info'); render(); return; }
      try{
        if(apiWriteMode()){
          if(!cal||!cal.feedbackId) throw new Error('No se encontró el identificador de retroalimentación. Actualiza la pantalla.');
          await global.EDDApi.confirmFeedbackMeeting(cal.feedbackId);
        }
        S.crearOActualizarCalibracion(colaboradorId,periodoId,{reunionLiderRealizada:!!checked,fechaReunion:checked?new Date().toISOString():null,_motivo:'Confirmación de reunión de retroalimentación'},state.user.nombre);
        showNotice(checked?'Reunión confirmada. Documenta los acuerdos finales.':'Se retiró la confirmación de reunión.','success'); render();
      }catch(e){showNotice(e&&e.message?e.message:'No fue posible confirmar la reunión.','warning');render();}
    },
    async liberarAcuerdos(colaboradorId,periodoId){
      const cal=S.getCalibracion(colaboradorId,periodoId); if(!cal||!cal.reunionLiderRealizada){showNotice('Confirma primero que realizaste la reunión de retroalimentación.','warning');return;}
      const txt=String((document.getElementById('feedbackAgreements-'+colaboradorId)||{}).value||cal.acuerdosFinales||'').trim();
      if(!txt){showNotice('Documenta los acuerdos finales antes de liberarlos para firma.','warning');return;}
      try{
        if(apiWriteMode()){
          if(!cal.feedbackId) throw new Error('No se encontró el identificador de retroalimentación. Actualiza la pantalla.');
          // v13.4: el backend de acuerdos ha usado nombres distintos durante la integración.
          // Enviamos las claves compatibles y, antes de liberar, verificamos que Airtable ya
          // devuelva los acuerdos por Evaluation Detail. Así evitamos liberar contra una escritura
          // todavía no visible o contra un contrato de payload desfasado.
          await global.EDDApi.saveFeedbackAgreements(cal.feedbackId,{agreements:txt,finalAgreements:txt,acuerdosFinales:txt});
          S.crearOActualizarCalibracion(colaboradorId,periodoId,{acuerdosFinales:txt,_motivo:'Acuerdos guardados antes de liberar'},state.user.nombre);
          const autoEv=S.getEvaluacion(colaboradorId,periodoId,'autoevaluacion');
          const backendEvalId=autoEv&&(autoEv.backendId||autoEv.id);
          let persisted=false;
          if(backendEvalId){
            for(let i=0;i<3;i++){
              if(i) await new Promise(r=>setTimeout(r,500));
              const fresh=await refreshFeedbackDetail(backendEvalId,colaboradorId,S.getEvaluacion(colaboradorId,periodoId,'lider'));
              const fb=fresh&&fresh.feedback;
              const saved=String((fb&&(fb.finalAgreements||fb.agreements||fb.acuerdosFinales))||'').trim();
              if(saved){ persisted=true; break; }
            }
          }
          // Si el GET no expone aún el campo, dejamos que el propio gate del backend valide;
          // pero nunca llamamos release antes de terminar el guardado anterior.
          await global.EDDApi.releaseFeedbackForSignature(cal.feedbackId);
          if(!persisted) console.warn('EDD v13.4: acuerdos liberados; Evaluation Detail no expuso acuerdos antes del release.');
          try{ if(backendEvalId) await refreshFeedbackDetail(backendEvalId,colaboradorId,S.getEvaluacion(colaboradorId,periodoId,'lider')); }catch(_){ }
        }
        S.crearOActualizarCalibracion(colaboradorId,periodoId,{acuerdosFinales:txt,acuerdosLiberados:true,fechaLiberacionAcuerdos:new Date().toISOString(),_motivo:'Líder libera acuerdos finales para firma'},state.user.nombre);
        showNotice('Acuerdos guardados y liberados para firma.','success'); render();
      }catch(e){showNotice(e&&e.message?e.message:'No fue posible liberar los acuerdos.','warning');}
    },
    async enviarNotificacionVencida(empleado){
      const col=S.getColaborador(empleado); if(!col){showNotice('No se encontró al colaborador.','warning');return;}
      const cfg=global.APP_CONFIG||{};
      if(cfg.mode==='api' && global.EDDApi && global.EDDApi.adminEnviarNotificacion){
        try{ await global.EDDApi.adminEnviarNotificacion({numeroEmpleado:empleado,tipo:'autoevaluacion_vencida'}); showNotice(`Notificación enviada a ${col.nombre}.`,'success'); }
        catch(e){ showNotice(e&&e.message?e.message:'No fue posible enviar la notificación.','warning'); }
      }else{
        showNotice(`Notificación de prueba enviada a ${col.nombre}. En producción se enviará por correo mediante n8n.`,'success');
      }
    },
    setAdminKpiGroup(grupo){ state.adminKpiGroup=grupo||'avance'; render(); },
    toggleAdminAlert(tipo){ state.adminAlertOpen=state.adminAlertOpen===tipo?null:tipo; render(); },
    setFiltroAdmin(campo, valor) { state.adminFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosAdmin() { state.adminFiltros = {}; render(); },
    previewRemoteCalibracion() {
      const input = document.getElementById('calRemoteResult');
      const badge = document.getElementById('calRemoteLiveBadge');
      if (!input || !badge) return;
      let value = Number(input.value);
      if (!Number.isFinite(value)) value = 0;
      badge.textContent = value >= 1 && value <= 5 ? value.toFixed(2) : '—';
    },
    async guardarCalibracionRemota(evaluationId) {
      if (state.remote.calibrationSaving || state.remote.calibrationCompleting) return;
      const resultEl = document.getElementById('calRemoteResult');
      const reasonEl = document.getElementById('calRemoteReason');
      const notesEl = document.getElementById('calRemoteNotes');
      const calibratedResult = Number(resultEl && resultEl.value);
      const adjustmentReason = String(reasonEl && reasonEl.value || '').trim();
      const freeNotes = String(notesEl && notesEl.value || '').trim();
      const actasEl = document.getElementById('calRemoteActas');
      const nomEl = document.getElementById('calRemoteNom035');
      const nomDetailEl = document.getElementById('calRemoteNom035Detail');
      const actas = Math.max(0, parseInt(actasEl && actasEl.value || '0',10) || 0);
      const nom035 = String(nomEl && nomEl.value || 'No');
      const nom035Detail = String(nomDetailEl && nomDetailEl.value || '').trim();
      const notes = [`[CONTEXTO DO]`,`Actas administrativas: ${actas}`,`NOM-035: ${nom035}${nom035Detail ? ' · ' + nom035Detail : ''}`,freeNotes ? `Notas DO: ${freeNotes}` : ''].filter(Boolean).join('\n');
      if (!Number.isFinite(calibratedResult) || calibratedResult < 1 || calibratedResult > 5) { showNotice('Captura un resultado calibrado válido entre 1 y 5.','warning'); return; }
      state.remote.calibrationSaving = true; render();
      try {
        await global.EDDApi.saveAdminCalibration(evaluationId,{ calibratedResult, adjustmentReason, notes });
        state.remote.calibration = apiData(await global.EDDApi.adminCalibration(true));
        showNotice('Borrador de calibración guardado.','success');
      } catch(e) { showNotice(e && e.message ? e.message : 'No fue posible guardar la calibración.','warning'); }
      finally { state.remote.calibrationSaving = false; render(); }
    },
    async completarCalibracionRemota(evaluationId) {
      if (state.remote.calibrationSaving || state.remote.calibrationCompleting) return;
      const resultEl = document.getElementById('calRemoteResult');
      const reasonEl = document.getElementById('calRemoteReason');
      const notesEl = document.getElementById('calRemoteNotes');
      const calibratedResult = Number(resultEl && resultEl.value);
      const adjustmentReason = String(reasonEl && reasonEl.value || '').trim();
      const freeNotes = String(notesEl && notesEl.value || '').trim();
      const actasEl = document.getElementById('calRemoteActas');
      const nomEl = document.getElementById('calRemoteNom035');
      const nomDetailEl = document.getElementById('calRemoteNom035Detail');
      const actas = Math.max(0, parseInt(actasEl && actasEl.value || '0',10) || 0);
      const nom035 = String(nomEl && nomEl.value || 'No');
      const nom035Detail = String(nomDetailEl && nomDetailEl.value || '').trim();
      const notes = [`[CONTEXTO DO]`,`Actas administrativas: ${actas}`,`NOM-035: ${nom035}${nom035Detail ? ' · ' + nom035Detail : ''}`,freeNotes ? `Notas DO: ${freeNotes}` : ''].filter(Boolean).join('\n');
      if (!Number.isFinite(calibratedResult) || calibratedResult < 1 || calibratedResult > 5) { showNotice('Captura un resultado calibrado válido entre 1 y 5.','warning'); return; }
      state.remote.calibrationCompleting = true; render();
      try {
        // Persistimos primero el valor visible para evitar completar un borrador anterior por accidente.
        await global.EDDApi.saveAdminCalibration(evaluationId,{ calibratedResult, adjustmentReason, notes });
        await global.EDDApi.completeAdminCalibration(evaluationId);
        state.remote.calibration = apiData(await global.EDDApi.adminCalibration(true));
        if (global.EDDApi.adminDashboard) state.remote.dashboard = apiData(await global.EDDApi.adminDashboard(true));
        showNotice('Calibración completada correctamente.','success');
      } catch(e) { showNotice(e && e.message ? e.message : 'No fue posible completar la calibración.','warning'); }
      finally { state.remote.calibrationCompleting = false; render(); }
    },
    previewCalibracion(totalLider) {
      const ajusteEl = document.getElementById('calAjuste');
      const previewEl = document.getElementById('calResultadoPreview');
      const badgeEl = document.getElementById('calLiveBadge');
      if (!ajusteEl || !previewEl) return;
      const ajuste = parseFloat(ajusteEl.value || '0') || 0;
      const valor = C.round1(Math.max(0, Math.min(100, totalLider + ajuste)));
      previewEl.value = f1(valor);
      if (badgeEl) badgeEl.textContent = f1(valor);
    },
    guardarCalibracion(colaboradorId, periodoId, totalLider) {
      const ajuste = parseFloat($('#calAjuste').value) || 0;
      const justificacion = $('#calJustificacion').value.trim();
      if (ajuste !== 0 && !justificacion) { showNotice(t('La justificación es obligatoria cuando existe un ajuste distinto de 0.'),'warning'); return; }
      const resultadoCalibrado = C.round1(Math.max(0, Math.min(100, totalLider + ajuste)));
      const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
      S.crearOActualizarCalibracion(colaboradorId, periodoId, {
        resultadoAuto: resAuto?.puntajes?.total, resultadoLider: totalLider,
        diferenciaGeneral: C.round1(resAuto?.puntajes?.total - totalLider),
        ajuste, justificacion, resultadoCalibrado,
        actas: parseInt($('#calActas').value, 10) || 0,
        nom035: $('#calNom035').value,
        observacionesRH: $('#calObs').value,
        responsable: state.user.nombre,
        _motivo: justificacion || 'Calibración de RH'
      }, state.user.nombre);
      showNotice(t('Calibración guardada.'),'success');
      render();
    },
    habilitarRetro(colaboradorId, periodoId) {
      const cal = S.getCalibracion(colaboradorId, periodoId);
      if (!cal || cal.resultadoCalibrado === undefined) { showNotice(t('Guarda la calibración antes de habilitar la retroalimentación.'),'warning'); return; }
      if (cal.resultadoCalibrado < 80) {
        const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
        if (!planes.length) { showNotice(t('El resultado es menor a 80. Registra al menos un plan de desarrollo antes de habilitar la retroalimentación.'),'warning'); return; }
      }
      S.crearOActualizarCalibracion(colaboradorId,periodoId,{retroHabilitada:true,notificacionRetroPendiente:true,fechaNotificacion:new Date().toISOString(),_motivo:'RH habilita fase de retroalimentación'},state.user.nombre);
      showNotice(t('Retroalimentación habilitada. El colaborador podrá continuar cuando reciba la notificación correspondiente.'),'success');
      render();
    },
    selNinebox(numero) { state.nineboxSel = numero; state.nineboxSelEmpleado = null; render(); },
    selNineboxColaborador(empleado) {
      const col = S.getColaborador(empleado);
      const periodoId = state.periodo.id;
      const resLider = S.getUltimoResultadoPorOrigen(empleado, periodoId, 'lider');
      const cuad = resLider ? C.asignarCuadrante(resLider?.promedios?.actitud, resLider?.promedios?.desempeno) : null;
      state.nineboxSelEmpleado = empleado;
      state.nineboxSel = cuad ? cuad.cuadrante : state.nineboxSel;
      render();
    },
    limpiarSeleccionNinebox() { state.nineboxSelEmpleado = null; render(); },
    guardarConfigBrecha() {
      const alineadaMax = parseFloat($('#cfgAlineada').value);
      const revisarMax = parseFloat($('#cfgRevisar').value);
      if (isNaN(alineadaMax) || isNaN(revisarMax) || alineadaMax >= revisarMax) { showNotice(t('Verifica que "Alineada" sea menor que "Revisar".'),'warning'); return; }
      S.updateConfigBrecha({ alineadaMax, revisarMax }, state.user.nombre);
      showNotice(t('Umbrales actualizados.'),'success');
      render();
    },
    reiniciarDemo() {
      S.reset();
      A.clearSession();
      state.user = null;
      resetLoginState('solicitar');
      location.hash = '#/login';
      render();
    },
    setFiltroUsuarios(campo, valor) { state.usuariosFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosUsuarios() { state.usuariosFiltros = {}; render(); },
    setFiltroJerarquias(campo, valor) { state.jerarquiasFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosJerarquias() { state.jerarquiasFiltros = {}; render(); }
  };

  global.App = Actions;
  global.addEventListener('hashchange', render);
  global.addEventListener('DOMContentLoaded', render);
  // Si el backend responde 401 (token inválido/vencido en modo API), api.js
  // dispara este evento; auth.js ya limpió la sesión, aquí solo refrescamos
  // la pantalla para mandar al usuario al login con el aviso correspondiente.
  global.addEventListener(global.EDDApi.EVENTO_SESION_EXPIRADA, () => { if (state.user) render(); });
  // Verificación periódica de expiración por tiempo (no depende de que el
  // usuario haga clic en algo): si la sesión ya venció, se refleja en la UI
  // sin esperar a la siguiente navegación.
  setInterval(() => { if (state.user && !A.getSession()) render(); }, 15000);
  // ESC cierra el asistente de IA SMART (accesibilidad, requerimiento 23 del brief).
  global.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && state.aiSmart.open) Actions.cerrarAsistenteIA(); });
})(window);
