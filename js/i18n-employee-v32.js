(function (global) {
  'use strict';

  const LANG_KEY = 'edd_language';
  const OVERRIDE_KEY = 'edd_language_session_override';

  const EXACT = new Map(Object.entries({
    'Preparando tu experiencia y la información del periodo...':'Preparing your experience and current-cycle information...',
    'Preparando tu experiencia y la información del periodo.':'Preparing your experience and current-cycle information.',
    'Cargando tu evaluación':'Loading your evaluation',
    'Recuperando respuestas y Goals guardados...':'Restoring your saved responses and goals...',
    'Recuperando respuestas y objetivos guardados...':'Restoring your saved responses and goals...',
    'Evalúa a tu equipo, realiza la Feedback y da seguimiento a firmas y acuerdos.':'Evaluate your team, provide feedback, and track signatures and agreements.',
    'Realiza tu Self-assessment y consulta tus resultados y Feedback personal.':'Complete your self-assessment and review your results and personal feedback.',
    'Ingresar como Administrator':'Enter as Administrator',
    'Ingresar como Manager':'Enter as Manager',
    'Ingresar como Employee':'Enter as Employee',
    'Ingresar como administrador':'Enter as Administrator',
    'Ingresar como líder':'Enter as Manager',
    'Ingresar como colaborador':'Enter as Employee',
    'Administrador de RH':'HR Administrator',
    '2 — Cumple parcialmente; requiere mejorar.':'2 — Partially meets expectations; improvement is required.',
    '1 — No cumple.':'1 — Does not meet expectations.',
    '3 — Cumple lo esperado.':'3 — Meets expectations.',
    '4 — Supera expectativas.':'4 — Exceeds expectations.',
    '5 — Excede significativamente.':'5 — Significantly exceeds expectations.',
    'Comprendido':'Got it',
    'ORDEN DE LECTURA':'READING ORDER',
    '1. Objetivo':'1. Goal',
    '2. Meta y resultado alcanzado':'2. Target and achieved result',
    '3. Resultado en estrellas':'3. Star rating',
    'Meta acordada':'Agreed target',
    '¿Qué debía lograrse?':'What was expected?',
    'Result alcanzado':'Achieved result',
    'Resultado alcanzado':'Achieved result',
    '¿Qué se logró al cierre?':'What was achieved by the end of the cycle?',
    'Comparación meta vs. resultado':'Target vs. result comparison',
    'Resultado ÷ meta × 100':'Result ÷ target × 100',
    'El sistema calcula este porcentaje automáticamente y no puede editarse.':'The system calculates this percentage automatically and it cannot be edited.',
    'Resultado en estrellas':'Star rating',
    'Agregar objetivo':'Add goal',
    'Quitar':'Remove',
    'Revisa tus respuestas antes de enviar. El resultado y la comparación con tu Manager se mostrarán más adelante, en la fase de Feedback.':'Review your responses before submitting. Your result and comparison with your manager will be shown later during the feedback stage.',
    'Revisa tus respuestas antes de enviar. El resultado y la comparación con tu líder se mostrarán más adelante, en la fase de retroalimentación.':'Review your responses before submitting. Your result and comparison with your manager will be shown later during the feedback stage.',
    'Comentarios u observaciones del Employee':'Employee comments or observations',
    'Comentarios u observaciones del colaborador':'Employee comments or observations',
    'Agrega contexto adicional si lo consideras necesario. Si más de la mitad de una sección quedó en N/A, justifica aquí.':'Add any additional context you consider necessary. If more than half of a section was marked N/A, explain why here.',
    'Trabajo en Equipo, Unión y Growth de Otros':'Teamwork, Unity and Development of Others',
    'Trabajo en Equipo, Unión y Desarrollo de Otros':'Teamwork, Unity and Development of Others',
    'Effective Communication y Apertura':'Effective Communication and Openness',
    'Comunicación Efectiva y Apertura':'Effective Communication and Openness',
    'Adaptabilidad, Iniciativa y Commitment to Sustainability':'Adaptability, Initiative and Commitment to Sustainability',
    'Adaptabilidad, Iniciativa y Compromiso con la Sustentabilidad':'Adaptability, Initiative and Commitment to Sustainability',
    'Results Orientation y Calidad':'Results Orientation and Quality',
    'Orientación a Resultados y Calidad':'Results Orientation and Quality',
    'Seguimiento, Control y Uso de Recursos':'Follow-up, Control and Resource Use',
    'Planeación y Organización':'Planning and Organization',
    'El average se calcula automáticamente.':'The average is calculated automatically.',
    'Average de herramientas':'Tool average',
    'Peso de la sección':'Section weight',
    'Eje ATTITUDE':'ATTITUDE axis',
    'Eje PERFORMANCE':'PERFORMANCE axis',
    'No calificado':'Not rated',
    'Sin calificar':'Not rated'
  }));

  const RULES = [
    [/\bPreparando tu experiencia y la información del periodo\.{1,3}/gi, 'Preparing your experience and current-cycle information...'],
    [/\bRecuperando respuestas y (?:Goals|objetivos) guardados\.{1,3}/gi, 'Restoring your saved responses and goals...'],
    [/\bIngresar como Administrator\b/gi, 'Enter as Administrator'],
    [/\bIngresar como Manager\b/gi, 'Enter as Manager'],
    [/\bIngresar como Employee\b/gi, 'Enter as Employee'],
    [/\bMeta acordada\b/gi, 'Agreed target'],
    [/\bComparación meta vs\. resultado\b/gi, 'Target vs. result comparison'],
    [/\bResultado en estrellas\b/gi, 'Star rating'],
    [/\bComentarios u observaciones del (?:Employee|colaborador)\b/gi, 'Employee comments or observations'],
    [/\bTrabajo en Equipo, Unión y (?:Growth|Desarrollo) de Otros\b/gi, 'Teamwork, Unity and Development of Others'],
    [/\bEffective Communication y Apertura\b/gi, 'Effective Communication and Openness'],
    [/\bAdaptabilidad, Iniciativa y (?:Commitment to Sustainability|Compromiso con la Sustentabilidad)\b/gi, 'Adaptability, Initiative and Commitment to Sustainability'],
    [/\bResults Orientation y Calidad\b/gi, 'Results Orientation and Quality'],
    [/\bSeguimiento, Control y Uso de Recursos\b/gi, 'Follow-up, Control and Resource Use']
  ];

  function lang() {
    try { return sessionStorage.getItem(OVERRIDE_KEY) || localStorage.getItem(LANG_KEY) || 'es'; }
    catch (_) { return 'es'; }
  }

  function tr(value) {
    if (lang() !== 'en') return value;
    const raw = String(value == null ? '' : value);
    const leading = (raw.match(/^\s*/) || [''])[0];
    const trailing = (raw.match(/\s*$/) || [''])[0];
    const core = raw.trim();
    if (!core) return raw;
    let out = EXACT.has(core) ? EXACT.get(core) : core;
    RULES.forEach(([re, repl]) => { out = out.replace(re, repl); });
    return leading + out + trailing;
  }

  function skip(el) {
    return !el || !!el.closest('script,style,[contenteditable="true"],.user-content,.objective-user-text,.comment-user-text');
  }

  function translate(root) {
    if (lang() !== 'en' || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const p = root.parentElement;
      if (!p || skip(p)) return;
      const next = tr(root.nodeValue || '');
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || skip(root)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translate);

    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
      ['placeholder','title','aria-label'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const old = el.getAttribute(attr) || '';
        const next = tr(old);
        if (next !== old) el.setAttribute(attr, next);
      });
    });
  }

  let timer = null;
  function refresh() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const root = document.getElementById('app-root');
      if (root) translate(root);
    }, 20);
  }

  function start() {
    const root = document.getElementById('app-root');
    if (!root) return;
    translate(root);
    new MutationObserver(refresh).observe(root, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','placeholder','aria-label']});
    document.addEventListener('click', function(e){
      const t = e.target && e.target.closest ? e.target.closest('button,a,label') : null;
      if (!t) return;
      const x = (t.textContent || '').trim().toUpperCase();
      if (x === 'EN' || x === 'ES') setTimeout(refresh, 10);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.EDDI18NEmployee = { translate: refresh, translateText: tr };
})(window);
