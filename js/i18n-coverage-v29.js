(function (global) {
  'use strict';

  const LANG_KEY = 'edd_language';
  const exact = new Map(Object.entries({
    'Evaluación de líder':'Manager evaluation',
    'Evaluación líder':'Manager evaluation',
    'Cierre':'Closure',
    'Avance de evaluación':'Evaluation progress',
    'Avance consolidado por área para el periodo actual.':'Consolidated progress by area for the current period.',
    'Desglose por área no disponible':'Area breakdown unavailable',
    'El detalle por área estará disponible cuando existan datos suficientes para el periodo.':'Area detail will be available when enough data exists for the period.',
    'Resumen de empleados y seguimiento':'Employee summary and follow-up',
    'Personas visibles actualmente por alertas, calibración o cierre.':'People currently visible due to alerts, calibration, or closure.',
    'ETAPA / ATENCIÓN':'STAGE / ATTENTION',
    'RESULTADO':'RESULT',
    'RESULT':'RESULT',
    'RESULTADO FINAL':'FINAL RESULT',
    'Por calibrar':'Pending calibration',
    'Calibradas':'Calibrated',
    'Sin distribución disponible todavía.':'No distribution available yet.',
    'Cobertura por área':'Coverage by area',
    'COBERTURA POR ÁREA':'COVERAGE BY AREA',
    'Talento':'Talent',
    'TALENTO':'TALENT',
    'Operación DO':'HR OPERATIONS',
    'OPERACIÓN DO':'HR OPERATIONS',
    'Abrir matriz':'Open matrix',
    'Resumen 9-Box':'9-Box summary',
    'Pendiente líder':'Pending manager',
    'Pendiente de líder':'Pending manager',
    'Pendiente calibración':'Pending calibration',
    'Pendiente de calibración':'Pending calibration',
    'Retroalimentación disponible':'Feedback available',
    'Retroalimentación pendiente':'Feedback pending',
    'Completada':'Completed',
    'No iniciada':'Not started',
    'En progreso':'In progress',
    'Cerrada':'Closed',
    'Vencida':'Overdue',
    'Autoevaluación vencida':'Self-assessment overdue',
    'Evaluación líder vencida':'Manager evaluation overdue',
    'Requiere revisión':'Needs review',
    'Revisar':'Review',
    'Alineada':'Aligned',
    'Diferencias detalladas por competencia':'Detailed differences by competency',
    'COMPETENCIA':'COMPETENCY',
    'AUTOEVALUACIÓN':'SELF-ASSESSMENT',
    'EVALUACIÓN LÍDER':'MANAGER EVALUATION',
    'DIFERENCIA':'DIFFERENCE',
    'BRECHA':'GAP',
    'COMENTARIO LÍDER':'MANAGER COMMENT',
    'COMENTARIO COLABORADOR':'EMPLOYEE COMMENT',
    'Ubicación en la Matriz 9-Box':'9-Box Matrix placement',
    'Usuarios':'Users',
    'Configuración':'Settings',
    'Calibración':'Calibration',
    'Matriz 9-Box':'9-Box Matrix',
    'Dashboard':'Dashboard',
    'Mi equipo':'My team',
    'Pendientes por evaluar':'Pending evaluations',
    'Pendientes de retroalimentación':'Pending feedback',
    'Colaborador':'Employee',
    'Líder':'Manager',
    'Administrador':'Administrator',
    'Cambiar perfil':'Switch profile',
    'Cerrar sesión':'Sign out',
    'Inicio':'Home',
    'Autoevaluación':'Self-assessment',
    'Retroalimentación':'Feedback',
    'Guardar progreso':'Save progress',
    'Guardando…':'Saving…',
    'Guardando...':'Saving...',
    '✓ Guardado':'✓ Saved',
    '✓ Sin cambios':'✓ No changes',
    'Anterior':'Back',
    'Siguiente':'Next',
    'Siguiente →':'Next →',
    'Finalizar y enviar ✓':'Finish and submit ✓',
    'Enviar evaluación ✓':'Submit evaluation ✓',
    'Confirmo que la información capturada es correcta.':'I confirm the information entered is correct.',
    'Confirmo que la evaluación está completa.':'I confirm the evaluation is complete.',
    'Valores y Actitud':'Values and Attitude',
    'Habilidades':'Skills',
    'Cumplimiento de Objetivos':'Goal Achievement',
    'Objetivos':'Objectives',
    'Resumen':'Summary',
    'Progreso general':'Overall progress',
    'Progreso de la sección':'Section progress',
    'Antes de capturar, revisa cómo se califican tus objetivos':'Before entering goals, review how they are scored',
    'OBJETIVOS DEL PERIODO · 30%':'PERIOD GOALS · 30%',
    'Comprendido':'Understood',
    'Escala rápida para objetivos':'Quick goal rating scale',
    'La estrella se obtiene del % validado por el líder.':'The star rating is based on the percentage validated by the manager.',
    'Meta':'Target',
    'Resultado':'Result',
    'Resultado alcanzado':'Achieved result',
    'Resultado obtenido':'Achieved result',
    'Comentario líder':'Manager comment',
    'Comentario colaborador':'Employee comment',
    'Comentario':'Comment',
    'Justificación':'Justification',
    'Fortalezas':'Strengths',
    'Oportunidades de desarrollo':'Development opportunities',
    'Brechas':'Gaps',
    'Riesgos / factores':'Risks / factors',
    'Síntesis':'Summary',
    'Plan de desarrollo':'Development plan',
    'Competencia':'Competency',
    'Acción':'Action',
    'Responsable':'Owner',
    'Fecha compromiso':'Due date',
    'Guardar calibración':'Save calibration',
    'Habilitar retroalimentación':'Enable feedback',
    'Retroalimentación habilitada':'Feedback enabled',
    'Calibrar ahora':'Calibrate now',
    'Evaluar ahora':'Evaluate now',
    'Firmar ahora':'Sign now',
    'Continuar retroalimentación':'Continue feedback',
    'Ver seguimiento':'View follow-up',
    'Completar retroalimentación →':'Complete feedback →',
    'Acuerdos liberados':'Agreements released',
    'Firma registrada':'Signature recorded',
    'Guardar acuerdos':'Save agreements',
    'Confirmar reunión':'Confirm meeting',
    'Liberar para firma':'Release for signature',
    'Firmar':'Sign',
    'Descargar constancia':'Download certificate',
    'Imprimir constancia':'Print certificate',
    'Nombre':'Name',
    'Puesto':'Position',
    'Área':'Area',
    'Estado':'Status',
    'Periodo':'Period',
    'Buscar':'Search',
    'Limpiar':'Clear',
    'Limpiar filtros':'Clear filters',
    'Todos':'All',
    'Todas':'All',
    'Activo':'Active',
    'Inactivo':'Inactive',
    'Correo':'Email',
    'Número de empleado':'Employee number',
    'Rol plataforma':'Platform role',
    'Puede autoevaluarse':'Can self-assess',
    'Puede evaluar':'Can evaluate',
    'Requiere evaluación':'Requires evaluation',
    'Correo validado':'Email verified',
    'Administrativo 2026':'Administrative 2026',
    'Evaluación de Desempeño Administrativo 2026':'Performance Evaluation 2026',
    'Evaluación de Desempeño':'Performance Evaluation',
    'Resultado disponible':'Result available',
    'Resultado final':'Final result',
    'Promedio general':'Overall average',
    'Avance del ciclo':'Cycle progress',
    'Personal a evaluar':'Employees to evaluate',
    'Universo del periodo':'Employees in this cycle',
    'Autoevaluaciones':'Self-assessments',
    'Evaluaciones líder':'Manager evaluations',
    'evaluaciones cerradas':'closed evaluations',
    'completadas':'completed',
    'visibles':'visible'
  }));

  const phraseRules = [
    [/\bSelf-assessment vencida\b/gi, 'Self-assessment overdue'],
    [/\bAutoevaluación vencida\b/gi, 'Self-assessment overdue'],
    [/\bEvaluación de líder\b/gi, 'Manager evaluation'],
    [/\bEvaluación líder\b/gi, 'Manager evaluation'],
    [/\bPendiente de líder\b/gi, 'Pending manager'],
    [/\bPendiente líder\b/gi, 'Pending manager'],
    [/\bPendiente de calibración\b/gi, 'Pending calibration'],
    [/\bPor calibrar\b/gi, 'Pending calibration'],
    [/\bRetroalimentación disponible\b/gi, 'Feedback available'],
    [/\bRetroalimentación pendiente\b/gi, 'Feedback pending'],
    [/\bSin distribución disponible todavía\.?\b/gi, 'No distribution available yet.'],
    [/\bDesglose por área no disponible\b/gi, 'Area breakdown unavailable'],
    [/\bAvance consolidado por área para el periodo actual\.?\b/gi, 'Consolidated progress by area for the current period.'],
    [/\bPersonas visibles actualmente por alertas, calibración o cierre\.?\b/gi, 'People currently visible due to alerts, calibration, or closure.']
  ];

  function lang() {
    try { return localStorage.getItem(LANG_KEY) || 'es'; } catch (_) { return 'es'; }
  }

  function translateText(text) {
    if (lang() !== 'en') return text;
    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    const core = text.trim();
    if (!core) return text;
    if (exact.has(core)) return leading + exact.get(core) + trailing;
    let out = core;
    phraseRules.forEach(([re, replacement]) => { out = out.replace(re, replacement); });
    return leading + out + trailing;
  }

  function shouldSkip(el) {
    if (!el || el.nodeType !== 1) return false;
    return !!el.closest('script,style,textarea,[contenteditable="true"],.user-content,.objective-user-text,.comment-user-text');
  }

  function translateNode(root) {
    if (lang() !== 'en' || !root) return;
    if (root.nodeType === 3) {
      const parent = root.parentElement;
      if (!parent || shouldSkip(parent)) return;
      const next = translateText(root.nodeValue || '');
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== 1 || shouldSkip(root)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateNode);

    root.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label]').forEach(el => {
      ['placeholder','title','aria-label'].forEach(attr => {
        if (el.hasAttribute(attr)) {
          const value = el.getAttribute(attr);
          const next = translateText(value || '');
          if (next !== value) el.setAttribute(attr, next);
        }
      });
    });
  }

  function translateAll() {
    const root = document.getElementById('app-root');
    if (root) translateNode(root);
    document.documentElement.lang = lang() === 'en' ? 'en' : 'es';
  }

  const observer = new MutationObserver(mutations => {
    if (lang() !== 'en') return;
    mutations.forEach(m => {
      m.addedNodes.forEach(n => translateNode(n));
      if (m.type === 'characterData') translateNode(m.target);
    });
  });

  function start() {
    const root = document.getElementById('app-root');
    if (!root) return;
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    translateAll();
    document.addEventListener('click', e => {
      const t = e.target && e.target.closest ? e.target.closest('button,a,label') : null;
      if (!t) return;
      const txt = (t.textContent || '').trim().toUpperCase();
      if (txt === 'EN' || txt === 'ES') setTimeout(translateAll, 0);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.EDDI18NCoverage = { translateAll, translateText };
})(window);
