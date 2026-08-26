(function () {
  'use strict';

  function titleCase(s) {
    return String(s || '').toLowerCase().replace(/(^|[\s'-])([a-záéíóúüñ])/g, function (_, p1, p2) {
      return p1 + p2.toUpperCase();
    });
  }

  function givenNameFromCorporate(fullName) {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';

    // Formato corporativo habitual: APELLIDO(S) NOMBRE(S).
    // 2 palabras: SABOGAL GABRIEL -> Gabriel.
    // 3 palabras: GOMEZ SEGUNDO MARIELA -> Mariela.
    // 4+ palabras: MARTINEZ SANCHEZ MONICA EVANGELINA -> Monica.
    let given;
    if (parts.length === 1) given = parts[0];
    else if (parts.length <= 3) given = parts[parts.length - 1];
    else given = parts[2];
    return titleCase(given);
  }

  function findCorporateFullName() {
    // El encabezado muestra el nombre completo autenticado en mayúsculas.
    const candidates = Array.from(document.querySelectorAll('header *, nav *, .topbar *, .app-header *, body *'));
    for (const el of candidates) {
      if (!el || el.children.length) continue;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt || txt.length < 5 || txt.length > 80) continue;
      if (!/^[A-ZÁÉÍÓÚÜÑ\s'-]+$/.test(txt)) continue;
      const parts = txt.split(/\s+/);
      if (parts.length < 2) continue;
      if (/^(INTER|CON|ES|EN|INICIO|AUTOEVALUACIÓN|RETROALIMENTACIÓN|CERRAR|SESIÓN)$/.test(txt)) continue;
      // Preferimos nombres cercanos al perfil del usuario, no títulos del sistema.
      const context = (el.parentElement && el.parentElement.textContent || '').toLowerCase();
      if (/colaborador|líder|lider|administrador|evaluación de desempeño/.test(context)) return txt;
    }
    return '';
  }

  function fixSuccessGreeting() {
    const bodyText = document.body ? document.body.textContent || '' : '';
    if (!/Evaluación enviada con éxito/i.test(bodyText)) return;

    const fullName = findCorporateFullName();
    const given = givenNameFromCorporate(fullName);
    if (!given) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const value = node.nodeValue || '';
      if (!/Gracias por tu participación,/i.test(value)) continue;
      node.nodeValue = value.replace(/(Gracias por tu participación,\s*)([^.!\n<]+)/i, function (_, prefix) {
        return prefix + given;
      });
    }
  }

  function run() {
    try { fixSuccessGreeting(); } catch (e) { console.warn('name-fix-v26', e); }
  }

  const observer = new MutationObserver(function () { requestAnimationFrame(run); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 100);
  setTimeout(run, 500);
})();
