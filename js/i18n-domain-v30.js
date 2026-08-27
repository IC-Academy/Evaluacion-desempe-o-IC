(function (global) {
  'use strict';

  const LANG_KEY = 'edd_language';
  const AUTO_KEY = 'edd_language_auto_for';
  const MANUAL_KEY = 'edd_language_manual_for';

  const EN = new Map(Object.entries({
    'Cargando tu información':'Loading your information',
    'Preparando tu experiencia y la información del periodo.':'Preparing your experience and current-cycle information.',
    'Selecciona el perfil con el que deseas ingresar. Podrás cambiar de perfil en cualquier momento sin volver a iniciar sesión.':'Select the profile you want to use. You can switch profiles at any time without signing in again.',
    'GESTIÓN DEL CICLO':'CYCLE MANAGEMENT',
    'GESTIÓN DE EQUIPO':'TEAM MANAGEMENT',
    'MI PERFORMANCE':'MY PERFORMANCE',
    'Consulta el avance general, calibra resultados y administra el proceso de evaluación.':'Review overall progress, calibrate results, and manage the evaluation process.',
    'Evalúa a tu equipo, realiza la retroalimentación y da seguimiento a firmas y acuerdos.':'Evaluate your team, provide feedback, and track signatures and agreements.',
    'Realiza tu autoevaluación y consulta tus resultados y retroalimentación personal.':'Complete your self-assessment and review your results and personal feedback.',
    'Ingresar como administrador':'Enter as administrator',
    'Ingresar como líder':'Enter as manager',
    'Ingresar como colaborador':'Enter as employee',
    'Administrador de RH':'HR Administrator',
    'PANEL DE DESARROLLO ORGANIZACIONAL':'ORGANIZATIONAL DEVELOPMENT PANEL',
    'Seguimiento integral del ciclo de evaluación, calibración, retroalimentación y cierre.':'End-to-end tracking of the evaluation, calibration, feedback, and closure cycle.',
    'Avance':'Progress',
    'Cierre del ciclo':'Cycle closure',
    'pendientes':'pending',
    'cerrado':'closed',
    'FLUJO DEL PROCESO':'PROCESS FLOW',
    'Avance de punta a punta':'End-to-end progress',
    'Vista ejecutiva del estado de cada etapa del ciclo.':'Executive view of each stage of the cycle.',
    '1 · Autoevaluación':'1 · Self-assessment',
    '2 · Evaluación líder':'2 · Manager evaluation',
    '3 · Calibración DO':'3 · HR calibration',
    '4 · Retroalimentación':'4 · Feedback',
    '5 · Cierre':'5 · Closure',
    'Información actualizada':'Information up to date',
    'Los módulos muestran únicamente la información disponible para el periodo.':'Modules show only the information currently available for this cycle.',
    'Actualizar':'Refresh',
    'Resumen de empleados y seguimiento':'Employee summary and follow-up',
    'Personas visibles actualmente por alertas, calibración o cierre.':'People currently visible due to alerts, calibration, or closure.',
    'Sin acuerdos listos para firma. Las retroalimentaciones recién liberadas aparecen primero en My team como Pendiente de reunión; después de confirmar la reunión y liberar acuerdos pasarán a esta vista.':'No agreements are ready for signature. Newly released feedback first appears in My team as Meeting pending; after the meeting is confirmed and agreements are released, it will appear here.',
    'La información se actualiza conforme avanza cada etapa del proceso.':'Information updates as each stage of the process progresses.',
    'Pendientes por firmar':'Pending signatures',
    'Por firmar líder':'Manager signatures pending',
    'Firma colaborador pendiente':'Employee signature pending',
    'PROCESO':'PROCESS',
    'FIRMA':'SIGNATURE',
    'Seguimiento':'FOLLOW-UP',
    'Consulta el avance de tu equipo y las acciones que requieren seguimiento.':'Review your team progress and the actions that require follow-up.',
    'Preparando tu evaluación...':'Preparing your evaluation...',
    'Guardado automático activo.':'Automatic saving is active.',
    'Tus avances quedan registrados para que puedas salir y continuar después.':'Your progress is saved so you can leave and continue later.',
    'Guardado automático activo':'Automatic saving is active',
    'Progreso guardado correctamente.':'Progress saved successfully.',
    'Peso de la sección: 40%':'Section weight: 40%',
    'Peso de la sección: 30%':'Section weight: 30%',
    'SECCIÓN 1 DE 3':'SECTION 1 OF 3',
    'SECCIÓN 2 DE 3':'SECTION 2 OF 3',
    'SECCIÓN 3 DE 3':'SECTION 3 OF 3',
    'Eje ACTITUD':'ATTITUDE axis',
    'Eje DESEMPEÑO':'PERFORMANCE axis',
    'Evalúa la vivencia diaria de los valores ESPÍRITU de Inter-Con y la forma en que el colaborador se conduce con las personas.':'Evaluate how consistently the employee demonstrates Inter-Con’s ESPÍRITU values and interacts with others.',
    'Evalúa el dominio técnico del puesto, el uso de procesos y herramientas del área y la forma en que el colaborador organiza y controla su trabajo.':'Evaluate technical mastery of the role, use of area processes and tools, and how the employee organizes and controls their work.',
    'Es puntual, constante y cumple los compromisos que asume.':'Is punctual, consistent, and follows through on commitments.',
    'Aplica correctamente los conocimientos técnicos y normativos de su puesto.':'Correctly applies the technical and regulatory knowledge required for the role.',
    'Resuelve problemas relacionados con sus responsabilidades.':'Solves problems related to their responsibilities.',
    'Mantiene actualizados sus conocimientos técnicos y las herramientas propias de su puesto.':'Keeps technical knowledge and role-specific tools up to date.',
    'Promedio de herramientas':'Tool average',
    'herramientas evaluadas':'tools evaluated',
    'Califica las herramientas que aplican a tu puesto. Usa N/A cuando no corresponda. Manejo de IA es obligatorio para todos y no admite N/A. El promedio se calcula automáticamente.':'Rate the tools that apply to your role. Use N/A when a tool does not apply. AI proficiency is mandatory for everyone and cannot be marked N/A. The average is calculated automatically.',
    'Sistemas internos de Inter-Con':'Inter-Con internal systems',
    'Portales de clientes / CFDI':'Client portals / CFDI',
    'Power BI / herramientas de análisis':'Power BI / analytics tools',
    'Excede significativamente':'Significantly exceeds expectations',
    'Supera expectativas':'Exceeds expectations',
    'Cumple lo esperado':'Meets expectations',
    'Cumple parcialmente':'Partially meets expectations',
    'No cumple':'Does not meet expectations',
    'No aplica o no hay elementos suficientes.':'Not applicable or insufficient information.',
    'Actitud positiva, pero desempeño bajo.':'Positive attitude, but low performance.',
    'Buena actitud y desempeño average; buen potencial de crecimiento.':'Positive attitude and average performance; good growth potential.',
    'Mejor actitud que desempeño.':'Stronger attitude than performance.',
    'En la mitad — OK.':'Middle range — OK.',
    'Por encima del average; tiene capacidad y actitud.':'Above average; demonstrates capability and the right attitude.',
    'No tiene la actitud ni los conocimientos requeridos para su posición.':'Does not demonstrate the attitude or knowledge required for the role.',
    'Trabajo positivo, pero resultado aún por debajo del estándar.':'Positive contribution, but results are still below standard.',
    'Actitud negativa, pero desempeño superior al average.':'Negative attitude, but performance is above average.',
    'Performance (eje horizontal): Knowledge y Skills Técnicas (30%) + Goal Achievement (30%), convertido a base 100 sobre el bloque Técnica Funcional (60%).':'Performance (horizontal axis): Technical Knowledge & Skills (30%) + Goal Achievement (30%), converted to a 100-point scale over the Technical-Functional block (60%).',
    'Attitude (eje vertical): Se obtiene de la sección "Values and Attitude" (40%) y se convierte a base 100 multiplicando el average por 20.':'Attitude (vertical axis): Derived from the Values and Attitude section (40%) and converted to a 100-point scale by multiplying the average by 20.',
    'Niveles por eje: Low · Medium / expected · High · Low <60 · Medium 60–79 · High 80–100.':'Axis levels: Low · Medium / expected · High · Low <60 · Medium 60–79 · High 80–100.',
    'Mi evaluación':'My evaluation',
    'Por firmar':'Pending signature'
  }));

  const RULES = [
    [/\bPeso de la sección:\s*(\d+)%/gi, 'Section weight: $1%'],
    [/\bSECCIÓN\s+(\d+)\s+DE\s+(\d+)/gi, 'SECTION $1 OF $2'],
    [/\b(\d+)\s+pendientes\b/gi, '$1 pending'],
    [/\b(\d+)%\s+cerrado\b/gi, '$1% closed'],
    [/\b([0-9]+)\s+herramientas evaluadas\b/gi, '$1 tools evaluated'],
    [/\bPendiente de reunión\b/gi, 'Meeting pending'],
    [/\bEvaluación líder\b/gi, 'Manager evaluation'],
    [/\bCalibración DO\b/gi, 'HR calibration'],
    [/\bRetroalimentación\b/gi, 'Feedback'],
    [/\bAutoevaluación\b/gi, 'Self-assessment'],
    [/\bColaborador\b/gi, 'Employee'],
    [/\bLíder\b/gi, 'Manager']
  ];

  function currentLanguage() {
    try { return localStorage.getItem(LANG_KEY) || 'es'; } catch (_) { return 'es'; }
  }

  function sessionIdentity() {
    try {
      const s = global.EDDAuth && global.EDDAuth.getSession ? global.EDDAuth.getSession() : null;
      const u = s && s.user ? s.user : {};
      return { employee: String(u.numeroEmpleado || ''), email: String(u.correo || u.email || '').trim().toLowerCase() };
    } catch (_) { return { employee:'', email:'' }; }
  }

  function languageFromEmail(email) {
    email = String(email || '').trim().toLowerCase();
    if (email.endsWith('@icsecurity.com')) return 'en';
    if (email.endsWith('@intercon.com.mx')) return 'es';
    return 'es';
  }

  function applyDomainDefault() {
    const id = sessionIdentity();
    if (!id.employee || !id.email) return false;
    const manualFor = sessionStorage.getItem(MANUAL_KEY) || '';
    if (manualFor === id.employee) return false;
    const desired = languageFromEmail(id.email);
    const marker = sessionStorage.getItem(AUTO_KEY) || '';
    if (marker === id.employee + ':' + desired) return false;
    sessionStorage.setItem(AUTO_KEY, id.employee + ':' + desired);
    if (currentLanguage() !== desired) {
      localStorage.setItem(LANG_KEY, desired);
      location.reload();
      return true;
    }
    return false;
  }

  function translateText(text) {
    if (currentLanguage() !== 'en') return text;
    const lead = (text.match(/^\s*/) || [''])[0];
    const tail = (text.match(/\s*$/) || [''])[0];
    const core = text.trim();
    if (!core) return text;
    let out = EN.has(core) ? EN.get(core) : core;
    RULES.forEach(([re, value]) => { out = out.replace(re, value); });
    return lead + out + tail;
  }

  function skip(el) {
    return !el || !!el.closest('script,style,textarea,input,[contenteditable="true"],.user-content,.objective-user-text,.comment-user-text');
  }

  function translateRoot(root) {
    if (currentLanguage() !== 'en' || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const p = root.parentElement;
      if (!p || skip(p)) return;
      const next = translateText(root.nodeValue || '');
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || skip(root)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateRoot);
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
      ['placeholder','title','aria-label'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const old = el.getAttribute(attr) || '';
        const next = translateText(old);
        if (old !== next) el.setAttribute(attr, next);
      });
    });
    document.documentElement.lang = 'en';
  }

  let scheduled = false;
  function refreshSoon() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      if (applyDomainDefault()) return;
      const root = document.getElementById('app-root');
      if (root) translateRoot(root);
    }, 30);
  }

  function start() {
    if (applyDomainDefault()) return;
    const root = document.getElementById('app-root');
    if (!root) return;
    translateRoot(root);
    new MutationObserver(refreshSoon).observe(root, {childList:true, subtree:true, characterData:true});
    document.addEventListener('click', function (e) {
      const target = e.target && e.target.closest ? e.target.closest('button,a,label') : null;
      if (!target) return;
      const txt = (target.textContent || '').trim().toUpperCase();
      if (txt !== 'ES' && txt !== 'EN') return;
      const id = sessionIdentity();
      if (id.employee) sessionStorage.setItem(MANUAL_KEY, id.employee);
      setTimeout(refreshSoon, 0);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.EDDI18NDomain = { languageFromEmail, applyDomainDefault, translateText };
})(window);
