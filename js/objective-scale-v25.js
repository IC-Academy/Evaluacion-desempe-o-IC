(function () {
  'use strict';

  function isEmployeeObjectivesRoute() {
    return /^#\/colaborador\//i.test(location.hash) && /objetiv/i.test(document.body.textContent || '');
  }

  function hideEmployeeQuickScale() {
    if (!isEmployeeObjectivesRoute()) return;

    const nodes = Array.from(document.querySelectorAll('div,section,article'));
    nodes.forEach((el) => {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt.startsWith('Escala rápida para objetivos')) return;
      if (!txt.includes('La estrella se obtiene del % validado por el líder')) return;

      // Oculta únicamente la tarjeta rápida añadida para orientar al líder.
      // El bloque azul de instrucciones del colaborador se conserva porque sí explica
      // cómo se calcula su resultado y qué debe capturar.
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
      el.dataset.hiddenEmployeeScaleV25 = '1';
    });
  }

  function restoreOutsideEmployee() {
    if (isEmployeeObjectivesRoute()) return;
    document.querySelectorAll('[data-hidden-employee-scale-v25="1"]').forEach((el) => {
      el.style.display = '';
      el.removeAttribute('aria-hidden');
      delete el.dataset.hiddenEmployeeScaleV25;
    });
  }

  function enhance() {
    restoreOutsideEmployee();
    hideEmployeeQuickScale();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  setTimeout(schedule, 100);
  setTimeout(schedule, 500);
})();
