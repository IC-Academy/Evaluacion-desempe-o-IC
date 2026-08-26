(function (global) {
  'use strict';

  const App = global.App;
  if (!App || App.__leaderScrollV27Applied) return;
  App.__leaderScrollV27Applied = true;

  function scrollLeaderToTop() {
    const shell = document.querySelector('.premium-leader-evaluation');
    if (!shell) return;

    const topTarget = shell.querySelector('.premium-evaluation-main, .premium-evaluation-content, .premium-evaluation-header') || shell;
    const header = document.querySelector('header, .topbar, .app-header, .premium-header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const y = Math.max(0, window.scrollY + topTarget.getBoundingClientRect().top - headerHeight - 16);

    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  if (typeof App.irSeccionWizard === 'function') {
    const originalIrSeccionWizard = App.irSeccionWizard.bind(App);
    App.irSeccionWizard = function () {
      const result = originalIrSeccionWizard.apply(App, arguments);
      requestAnimationFrame(function () {
        requestAnimationFrame(scrollLeaderToTop);
      });
      return result;
    };
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('button, a');
    if (!button) return;
    const shell = button.closest('.premium-leader-evaluation');
    if (!shell) return;

    const label = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!/siguiente|anterior|resumen|guardar progreso/.test(label)) return;

    setTimeout(function () {
      if (document.querySelector('.premium-leader-evaluation')) scrollLeaderToTop();
    }, 120);
  }, true);
})(window);
