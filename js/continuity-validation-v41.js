(function (global) {
  'use strict';

  function install() {
    const App = global.App;
    if (!App || typeof App.enviarEvaluacionLider !== 'function' || App.enviarEvaluacionLider.__continuityV41) return;
    const original = App.enviarEvaluacionLider.bind(App);

    async function enviarConValidacion(evaluacionId) {
      const block = document.querySelector('.leader-continuity-block');
      if (block) {
        const selects = Array.from(block.querySelectorAll('.leader-continuity-field select'));
        const impact = selects[0] ? selects[0].value : '';
        const replacement = selects[1] ? selects[1].value : '';
        const actions = block.querySelectorAll('.leader-continuity-actions input[type="checkbox"]:checked');
        const comment = block.querySelector('.leader-continuity-comment textarea');
        const lang = document.documentElement.lang === 'en' || sessionStorage.getItem('edd_language') === 'en' ? 'en' : 'es';
        let message = '';
        let target = null;

        if (!impact || !replacement) {
          message = lang === 'en' ? 'Complete the confidential operational continuity section before submitting.' : 'Completa la sección confidencial de continuidad operativa antes de enviar.';
          target = !impact ? selects[0] : selects[1];
        } else if (!actions.length) {
          message = lang === 'en' ? 'Select at least one recommended continuity action before submitting.' : 'Selecciona al menos una acción recomendada de continuidad antes de enviar.';
          target = block.querySelector('.leader-continuity-actions');
        } else if ((impact === 'Alto' || impact === 'Crítico' || replacement === 'Sin reemplazo identificado') && !(comment && comment.value.trim())) {
          message = lang === 'en' ? 'Add a confidential HR comment for the selected impact or lack of replacement.' : 'Agrega un comentario confidencial para RH por el impacto seleccionado o la falta de reemplazo.';
          target = comment;
        }

        if (message) {
          if (target) {
            target.classList.add('validation-error');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof target.focus === 'function') setTimeout(() => target.focus(), 350);
          }
          global.alert(message);
          return;
        }
      }
      return original(evaluacionId);
    }

    enviarConValidacion.__continuityV41 = true;
    App.enviarEvaluacionLider = enviarConValidacion;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})(window);
