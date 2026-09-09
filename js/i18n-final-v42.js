(function () {
  'use strict';
  const ES = 'Acceso protegido · Uso exclusivo de personal autorizado';
  const EN = 'Protected access · Authorized personnel only';

  function polish() {
    const active = document.querySelector('.language-option.active');
    const english = !!active && active.textContent.trim() === 'EN';
    document.querySelectorAll('.premium-login-security').forEach((el) => {
      const raw = (el.textContent || '').replace(/^\s*▾\s*/, '').trim();
      if (english && raw === ES) el.innerHTML = '▾ &nbsp; ' + EN;
      if (!english && raw === EN) el.innerHTML = '▾ &nbsp; ' + ES;
    });
  }

  function schedule() {
    setTimeout(polish, 0);
    setTimeout(polish, 120);
  }

  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('click', (event) => {
    if (event.target && event.target.closest && event.target.closest('.language-option')) schedule();
  });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  schedule();
})();
