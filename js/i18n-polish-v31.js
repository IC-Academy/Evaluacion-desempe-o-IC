(function (global) {
  'use strict';

  const LANG_KEY = 'edd_language';
  const OVERRIDE_KEY = 'edd_language_session_override';
  const MANUAL_FOR_KEY = 'edd_language_manual_for';

  const T = new Map(Object.entries({
    'Selecciona cómo quieres ingresar':'Choose how you want to enter',
    'Puedes cambiar de perfil en cualquier momento':'You can switch profiles at any time',
    'Tu perfil determina las acciones y la información que podrás consultar.':'Your profile determines the actions and information available to you.',
    'Perfil disponible':'Available profile',
    'Perfiles disponibles':'Available profiles',
    'Ingresar':'Enter',
    'Volver':'Back',
    'Cambiar perfil':'Switch profile',
    'Panel de administración':'Administration panel',
    'Panel de líder':'Manager panel',
    'Panel de colaborador':'Employee panel',
    'Bienvenido':'Welcome',
    'Bienvenida':'Welcome',
    'Evaluación de Desempeño':'Performance Evaluation',
    'Evaluación de desempeño':'Performance Evaluation',
    'Evaluación de líder':'Manager evaluation',
    'Evaluación líder':'Manager evaluation',
    'Autoevaluación':'Self-assessment',
    'Retroalimentación':'Feedback',
    'Calibración':'Calibration',
    'Matriz 9-Box':'9-Box Matrix',
    'Usuarios':'Users',
    'Configuración':'Settings',
    'Mi equipo':'My team',
    'Mi evaluación':'My evaluation',
    'Inicio':'Home',
    'Cerrar sesión':'Sign out',
    'Administrador':'Administrator',
    'Líder':'Manager',
    'Colaborador':'Employee',
    'Pendientes por evaluar':'Pending evaluations',
    'Pendientes de retroalimentación':'Pending feedback',
    'Pendientes por firmar':'Pending signatures',
    'Por firmar':'Pending signature',
    'Por firmar líder':'Manager signature pending',
    'Firma colaborador pendiente':'Employee signature pending',
    'Pendiente de reunión':'Meeting pending',
    'Pendiente líder':'Pending manager',
    'Pendiente de líder':'Pending manager',
    'Pendiente calibración':'Pending calibration',
    'Pendiente de calibración':'Pending calibration',
    'Retroalimentación disponible':'Feedback available',
    'Retroalimentación pendiente':'Feedback pending',
    'Resultado disponible':'Result available',
    'Resultado final':'Final result',
    'Resultado líder':'Manager result',
    'Resultado calibrado':'Calibrated result',
    'Promedio general':'Overall average',
    'Avance del ciclo':'Cycle progress',
    'Avance':'Progress',
    'Avance de evaluación':'Evaluation progress',
    'Avance de punta a punta':'End-to-end progress',
    'Avance por área':'Progress by area',
    'Cierre':'Closure',
    'Cierre del ciclo':'Cycle closure',
    'Cierre del proceso':'Process close',
    'Seguimiento':'Follow-up',
    'Seguimiento de evaluaciones':'Evaluation tracking',
    'Resumen':'Summary',
    'Resumen ejecutivo':'Executive summary',
    'Resumen de empleados y seguimiento':'Employee summary and follow-up',
    'Resumen 9-Box':'9-Box summary',
    'Cobertura por área':'Coverage by area',
    'Distribución 9-Box':'9-Box distribution',
    'Niveles de desempeño':'Performance levels',
    'Talento':'Talent',
    'Personal a evaluar':'Employees to evaluate',
    'Universo del periodo':'Employees in this cycle',
    'Autoevaluaciones':'Self-assessments',
    'Evaluaciones líder':'Manager evaluations',
    'Por calibrar':'Pending calibration',
    'Calibradas':'Calibrated',
    'Actualizar':'Refresh',
    'Buscar':'Search',
    'Limpiar':'Clear',
    'Limpiar filtros':'Clear filters',
    'Todas las áreas':'All areas',
    'Todos los estados':'All statuses',
    'Todos los cuadrantes':'All quadrants',
    'Todos':'All',
    'Todas':'All',
    'Nombre':'Name',
    'Puesto':'Position',
    'Área':'Area',
    'Estado':'Status',
    'Periodo':'Period',
    'Proceso':'Process',
    'Firma':'Signature',
    'Resultado':'Result',
    'Puntaje':'Score',
    'Cuadrante':'Quadrant',
    'Valores y Actitud':'Values and Attitude',
    'Habilidades':'Skills',
    'Conocimientos':'Knowledge',
    'Cumplimiento de Objetivos':'Goal Achievement',
    'Objetivos':'Objectives',
    'A. Valores y Actitud':'A. Values and Attitude',
    'B. Habilidades':'B. Skills',
    'C. Conocimientos':'C. Knowledge',
    'D. Cumplimiento de Objetivos':'D. Goal Achievement',
    'Actitud':'Attitude',
    'Desempeño':'Performance',
    'Eje ACTITUD':'ATTITUDE axis',
    'Eje DESEMPEÑO':'PERFORMANCE axis',
    'Peso de la sección: 40%':'Section weight: 40%',
    'Peso de la sección: 30%':'Section weight: 30%',
    'Progreso general':'Overall progress',
    'Progreso de la sección':'Section progress',
    'Guardar progreso':'Save progress',
    'Guardando…':'Saving…',
    'Guardando...':'Saving...',
    '✓ Guardado':'✓ Saved',
    '✓ Sin cambios':'✓ No changes',
    'Progreso guardado correctamente.':'Progress saved successfully.',
    'Guardado automático activo.':'Automatic saving is active.',
    'Guardado automático activo':'Automatic saving is active',
    'Tus avances quedan registrados para que puedas salir y continuar después.':'Your progress is saved so you can leave and continue later.',
    'Anterior':'Back',
    'Siguiente':'Next',
    'Siguiente →':'Next →',
    'Finalizar y enviar ✓':'Finish and submit ✓',
    'Enviar evaluación ✓':'Submit evaluation ✓',
    'Sección':'Section',
    'Meta':'Target',
    'Resultado alcanzado':'Achieved result',
    'Resultado obtenido':'Achieved result',
    'Resultado real':'Actual result',
    'Cumplimiento':'Achievement',
    'Cumplimiento objetivo':'Goal achievement',
    'Comentario':'Comment',
    'Comentarios':'Comments',
    'Comentario líder':'Manager comment',
    'Comentario colaborador':'Employee comment',
    'Justificación':'Justification',
    'Fuente / evidencia':'Source / evidence',
    'Fuente':'Source',
    'Evidencia':'Evidence',
    'Calificación':'Rating',
    'Calificación líder':'Manager rating',
    'Promedio de herramientas':'Tool average',
    'herramientas evaluadas':'tools evaluated',
    'Herramientas':'Tools',
    'Excel':'Excel',
    'Power BI':'Power BI',
    'Manejo de IA':'AI proficiency',
    'No aplica':'Not applicable',
    'No aplica o no hay elementos suficientes.':'Not applicable or insufficient information.',
    'Escala de evaluación':'Rating scale',
    'Escala rápida para objetivos':'Quick goal rating scale',
    'Antes de capturar, revisa cómo se califican tus objetivos':'Before entering goals, review how they are scored',
    'Comprendido':'Got it',
    'Objetivos del periodo':'Period goals',
    'Objetivo':'Goal',
    'Agregar objetivo':'Add goal',
    'Quitar':'Remove',
    'Revisar':'Review',
    'Requiere revisión':'Needs review',
    'Alineada':'Aligned',
    'Brecha':'Gap',
    'Brechas':'Gaps',
    'Diferencia':'Difference',
    'Diferencias detalladas por competencia':'Detailed differences by competency',
    'Comparación':'Comparison',
    'Fortalezas':'Strengths',
    'Oportunidades de desarrollo':'Development opportunities',
    'Áreas de oportunidad':'Development opportunities',
    'Riesgos / factores':'Risks / factors',
    'Síntesis':'Summary',
    'Plan de desarrollo':'Development plan',
    'Competencia':'Competency',
    'Competencia a desarrollar':'Competency to develop',
    'Acción':'Action',
    'Responsable':'Owner',
    'Fecha compromiso':'Due date',
    'Guardar acuerdos':'Save agreements',
    'Confirmar reunión':'Confirm meeting',
    'Liberar para firma':'Release for signature',
    'Firmar':'Sign',
    'Firmar ahora':'Sign now',
    'Firma registrada':'Signature recorded',
    'Acuerdos liberados':'Agreements released',
    'Continuar retroalimentación':'Continue feedback',
    'Completar retroalimentación →':'Complete feedback →',
    'Ver seguimiento':'View follow-up',
    'Evaluar ahora':'Evaluate now',
    'Calibrar ahora':'Calibrate now',
    'Guardar calibración':'Save calibration',
    'Habilitar retroalimentación':'Enable feedback',
    'Retroalimentación habilitada':'Feedback enabled',
    'Descargar constancia':'Download certificate',
    'Imprimir constancia':'Print certificate',
    'Completada':'Completed',
    'No iniciada':'Not started',
    'En progreso':'In progress',
    'Cerrada':'Closed',
    'Vencida':'Overdue',
    'Autoevaluación vencida':'Self-assessment overdue',
    'Evaluación líder vencida':'Manager evaluation overdue',
    'Activo':'Active',
    'Inactivo':'Inactive',
    'Correo':'Email',
    'Número de empleado':'Employee number',
    'Rol plataforma':'Platform role',
    'Puede autoevaluarse':'Can self-assess',
    'Puede evaluar':'Can evaluate',
    'Requiere evaluación':'Requires evaluation',
    'Correo validado':'Email verified',
    'Sin distribución disponible todavía.':'No distribution available yet.',
    'Desglose por área no disponible':'Area breakdown unavailable',
    'El detalle por área estará disponible cuando existan datos suficientes para el periodo.':'Area detail will be available when enough data exists for the cycle.',
    'La información se actualiza conforme avanza cada etapa del proceso.':'Information updates as each stage of the process progresses.',
    'Los módulos muestran únicamente la información disponible para el periodo.':'Modules show only the information available for the current cycle.',
    'Información actualizada':'Information up to date',
    'Personas visibles actualmente por alertas, calibración o cierre.':'People currently visible due to alerts, calibration, or closure.',
    'Vista ejecutiva del estado de cada etapa del ciclo.':'Executive view of the status of each stage of the cycle.',
    'Consulta el avance de tu equipo y las acciones que requieren seguimiento.':'Review your team progress and actions that require follow-up.',
    'Preparando tu evaluación...':'Preparing your evaluation...',
    'Preparando tu experiencia y la información del periodo.':'Preparing your experience and current-cycle information.',
    'Cargando tu información':'Loading your information',
    'Confirmo que la información capturada es correcta.':'I confirm the information entered is correct.',
    'Confirmo que la evaluación está completa.':'I confirm the evaluation is complete.',
    'Tu evaluación ya fue enviada':'Your evaluation has already been submitted',
    'Tu autoevaluación ha sido registrada correctamente.':'Your self-assessment has been recorded successfully.',
    'Tu líder recibirá la notificación correspondiente para continuar con el proceso.':'Your manager will receive the appropriate notification to continue the process.',
    'Ir al inicio':'Go to home'
  }));

  const R = [
    [/\bSECCIÓN\s+(\d+)\s+DE\s+(\d+)\b/gi, 'SECTION $1 OF $2'],
    [/\bPeso de la sección:\s*(\d+)%/gi, 'Section weight: $1%'],
    [/\b(\d+)\s+pendientes\b/gi, '$1 pending'],
    [/\b(\d+)%\s+cerrado\b/gi, '$1% closed'],
    [/\b(\d+)\s+herramientas evaluadas\b/gi, '$1 tools evaluated'],
    [/\bEvaluación de líder\b/gi, 'Manager evaluation'],
    [/\bEvaluación líder\b/gi, 'Manager evaluation'],
    [/\bAutoevaluación\b/gi, 'Self-assessment'],
    [/\bRetroalimentación\b/gi, 'Feedback'],
    [/\bCalibración DO\b/gi, 'HR calibration'],
    [/\bPendiente de reunión\b/gi, 'Meeting pending'],
    [/\bPendiente de líder\b/gi, 'Pending manager'],
    [/\bPendiente líder\b/gi, 'Pending manager'],
    [/\bPendiente de calibración\b/gi, 'Pending calibration'],
    [/\bColaborador\b/gi, 'Employee'],
    [/\bLíder\b/gi, 'Manager'],
    [/\bAdministrador\b/gi, 'Administrator'],
    [/\bObjetivos\b/gi, 'Goals'],
    [/\bResultado final\b/gi, 'Final result'],
    [/\bGuardar progreso\b/gi, 'Save progress'],
    [/\bSiguiente\b/gi, 'Next'],
    [/\bAnterior\b/gi, 'Back']
  ];

  function lang() {
    try { return sessionStorage.getItem(OVERRIDE_KEY) || localStorage.getItem(LANG_KEY) || 'es'; }
    catch (_) { return 'es'; }
  }

  function identity() {
    try {
      const s = global.EDDAuth && global.EDDAuth.getSession ? global.EDDAuth.getSession() : null;
      const u = s && s.user ? s.user : {};
      return { employee: String(u.numeroEmpleado || ''), email: String(u.correo || u.email || '').trim().toLowerCase() };
    } catch (_) { return {employee:'', email:''}; }
  }

  function emailDefault(email) {
    const e = String(email || '').toLowerCase().trim();
    return e.endsWith('@icsecurity.com') ? 'en' : 'es';
  }

  function syncInitialLanguage() {
    let override = '';
    try { override = sessionStorage.getItem(OVERRIDE_KEY) || ''; } catch (_) {}
    if (override === 'es' || override === 'en') {
      try { localStorage.setItem(LANG_KEY, override); } catch (_) {}
      return override;
    }
    const id = identity();
    if (!id.employee || !id.email) return lang();
    const desired = emailDefault(id.email);
    try { localStorage.setItem(LANG_KEY, desired); } catch (_) {}
    return desired;
  }

  function translate(text) {
    if (lang() !== 'en') return text;
    const raw = String(text == null ? '' : text);
    const lead = (raw.match(/^\s*/) || [''])[0];
    const tail = (raw.match(/\s*$/) || [''])[0];
    const core = raw.trim();
    if (!core) return raw;
    let out = T.has(core) ? T.get(core) : core;
    R.forEach(([re, repl]) => { out = out.replace(re, repl); });
    return lead + out + tail;
  }

  function skipElement(el) {
    if (!el) return true;
    return !!el.closest('script,style,textarea,[contenteditable="true"],.user-content,.objective-user-text,.comment-user-text,.feedback-user-text,.agreement-user-text,.evidence-user-text');
  }

  function translateTree(root) {
    if (lang() !== 'en' || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const p = root.parentElement;
      if (!p || skipElement(p)) return;
      const n = translate(root.nodeValue || '');
      if (n !== root.nodeValue) root.nodeValue = n;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || skipElement(root)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTree);
    root.querySelectorAll('[placeholder],[title],[aria-label],[data-label]').forEach(el => {
      ['placeholder','title','aria-label','data-label'].forEach(a => {
        if (!el.hasAttribute(a)) return;
        const old = el.getAttribute(a) || '';
        const next = translate(old);
        if (next !== old) el.setAttribute(a, next);
      });
    });
    document.documentElement.lang = 'en';
  }

  let timer = 0;
  function refresh() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (lang() === 'en') {
        const root = document.getElementById('app-root');
        if (root) translateTree(root);
        document.documentElement.lang = 'en';
      } else document.documentElement.lang = 'es';
    }, 20);
  }

  function selectManual(value) {
    if (value !== 'es' && value !== 'en') return;
    try {
      sessionStorage.setItem(OVERRIDE_KEY, value);
      const id = identity();
      if (id.employee) sessionStorage.setItem(MANUAL_FOR_KEY, id.employee);
      localStorage.setItem(LANG_KEY, value);
    } catch (_) {}
    setTimeout(refresh, 0);
  }

  function start() {
    syncInitialLanguage();
    const root = document.getElementById('app-root');
    if (root) {
      translateTree(root);
      new MutationObserver(refresh).observe(root, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['placeholder','title','aria-label','data-label']});
    }
    document.addEventListener('click', e => {
      const el = e.target && e.target.closest ? e.target.closest('button,a,label,[role="button"]') : null;
      if (!el) return;
      const txt = (el.textContent || '').trim().toUpperCase();
      if (txt === 'EN') selectManual('en');
      else if (txt === 'ES') selectManual('es');
      else if (txt.includes('CERRAR SESIÓN') || txt.includes('SIGN OUT')) {
        try { sessionStorage.removeItem(OVERRIDE_KEY); sessionStorage.removeItem(MANUAL_FOR_KEY); } catch (_) {}
      }
    }, false);
    global.addEventListener('hashchange', refresh);
    setTimeout(refresh, 100);
    setTimeout(refresh, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.EDDI18NPolish = { translate, refresh, selectManual, emailDefault };
})(window);
