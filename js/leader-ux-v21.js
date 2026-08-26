(function (global) {
  'use strict';

  const App = global.App;
  const C = global.EDDCalc;
  if (!App) return;

  function text(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function number(value) {
    const n = Number(String(value == null ? '' : value).replace('%', '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : null;
  }

  function wireLeaderSidebar() {
    const shell = document.querySelector('.premium-leader-evaluation');
    if (!shell) return;

    const steps = Array.from(shell.querySelectorAll('.premium-evaluation-sidebar .premium-section-step'));
    steps.forEach((step, index) => {
      if (step.dataset.leaderNavV21 === '1') return;
      step.dataset.leaderNavV21 = '1';
      step.setAttribute('aria-label', 'Ir a ' + text(step.querySelector('strong')));
      step.setAttribute('title', 'Ir a ' + text(step.querySelector('strong')));

      step.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof App.irSeccionWizard === 'function') App.irSeccionWizard(index);
      });

      step.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (typeof App.irSeccionWizard === 'function') App.irSeccionWizard(index);
      });
    });
  }

  function repairFractionalLeaderPercent(card) {
    const input = card.querySelector('.leader-percent-field input[type="number"]');
    const expectedEl = card.querySelector('.objective-flow-result strong');
    const noAdjustment = card.querySelector('.leader-auto-score-kept');
    if (!input || !expectedEl || !noAdjustment) return false;

    const raw = number(input.value);
    const expected = number(text(expectedEl));
    if (raw == null || expected == null || expected <= 2) return false;

    // Airtable percent devuelve 1.2 para 120%. Solo corregimos cuando coincide
    // exactamente con la escala fraccional y el líder todavía está "Sin ajuste".
    if (Math.abs((raw * 100) - expected) > 0.11) return false;

    const handler = input.getAttribute('onchange') || '';
    const match = handler.match(/validarCumplimientoObjetivoLider\('([^']+)'\s*,\s*(\d+)/);
    if (!match || typeof App.validarCumplimientoObjetivoLider !== 'function') {
      input.value = expected;
      return false;
    }

    card.dataset.normalizingPercentV21 = '1';
    App.validarCumplimientoObjetivoLider(match[1], Number(match[2]), String(expected));
    return true;
  }

  function organizeObjectiveCard(card) {
    if (card.dataset.objectiveLayoutV21 === '1') return;

    // Primero normalizamos un posible percent fraccional. La función de App
    // vuelve a renderizar, por lo que dejamos que el siguiente ciclo organice.
    if (repairFractionalLeaderPercent(card)) return;

    card.dataset.objectiveLayoutV21 = '1';
    card.classList.add('leader-objective-review-v21');

    const fields = card.querySelector('.objetivo-fields');
    if (!fields) return;

    const objective = Array.from(fields.children).find((el) =>
      el.classList && el.classList.contains('objetivo-lectura') && /objetivo:/i.test(text(el))
    );
    const visual = fields.querySelector('.leader-objective-visual-flow');
    const decision = fields.querySelector('.leader-score-decision');
    const message = fields.querySelector('.validation-message');

    if (objective) {
      objective.classList.add('leader-objective-title-v21');
      if (!objective.querySelector('.leader-objective-label-v21')) {
        const label = document.createElement('span');
        label.className = 'leader-objective-label-v21';
        label.textContent = 'OBJETIVO';
        objective.prepend(label);
      }
      fields.appendChild(objective);
    }

    if (visual) {
      visual.classList.add('leader-objective-check-v21');
      fields.appendChild(visual);
    }

    if (decision) {
      decision.classList.add('leader-validation-v21');
      fields.appendChild(decision);
    }

    if (message) {
      message.classList.add('leader-validation-note-v21');
      fields.appendChild(message);
    }
  }

  function organizeObjectives() {
    document.querySelectorAll('.premium-leader-evaluation .leader-objective-review').forEach(organizeObjectiveCard);
  }

  function enhance() {
    wireLeaderSidebar();
    organizeObjectives();
  }

  const observer = new MutationObserver(function () {
    requestAnimationFrame(enhance);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', enhance);
  setTimeout(enhance, 80);
  setTimeout(enhance, 400);
})(window);
