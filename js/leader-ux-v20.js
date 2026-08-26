(function (global) {
  'use strict';

  const App = global.App;
  const S = global.EDDStorage;
  const D = global.EDDData;
  const API = global.EDDApi;
  if (!App) return;

  const patched = new WeakSet();

  function txt(el) { return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim(); }
  function numberFromText(value) {
    const m = String(value || '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : null;
  }

  function makeWizardStepsClickable() {
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
      if (step.dataset.navReady === '1') return;
      step.dataset.navReady = '1';
      step.setAttribute('role', 'button');
      step.setAttribute('tabindex', '0');
      step.setAttribute('aria-label', 'Ir a ' + txt(step).replace(/^\d+\.\s*/, ''));
      const go = () => {
        // Guardado en segundo plano antes de cambiar de sección. No bloquea la navegación.
        try { if (typeof App.guardarProgresoVisual === 'function') Promise.resolve(App.guardarProgresoVisual()).catch(() => {}); } catch (_) {}
        if (typeof App.irSeccionWizard === 'function') App.irSeccionWizard(index);
      };
      step.addEventListener('click', go);
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  }

  function addObjectiveScale() {
    const objectiveHeading = Array.from(document.querySelectorAll('h1,h2,h3')).find((h) => /cumplimiento de objetivos/i.test(txt(h)));
    if (!objectiveHeading) return;
    const host = objectiveHeading.closest('.wizard-card, .card, main, section') || objectiveHeading.parentElement;
    if (!host || host.querySelector('.leader-objective-scale-guide')) return;
    const guide = document.createElement('div');
    guide.className = 'leader-objective-scale-guide';
    guide.innerHTML = `
      <div class="leader-guide-title"><strong>Escala rápida para objetivos</strong><span>La estrella se obtiene del % validado por el líder.</span></div>
      <div class="leader-star-scale">
        <span><b>5 ★</b><small>110% o más</small></span>
        <span><b>4 ★</b><small>100% a 109%</small></span>
        <span><b>3 ★</b><small>90% a 99%</small></span>
        <span><b>2 ★</b><small>75% a 89%</small></span>
        <span><b>1 ★</b><small>Menos de 75%</small></span>
      </div>`;
    objectiveHeading.insertAdjacentElement('afterend', guide);
  }

  function enhanceObjectiveCards() {
    document.querySelectorAll('.leader-objective-review').forEach((card) => {
      if (card.dataset.visualGuide === '1') return;
      card.dataset.visualGuide = '1';

      const readings = Array.from(card.querySelectorAll('.objetivo-lectura'));
      const objectiveText = readings.find((x) => /objetivo:/i.test(txt(x)));
      const metaText = readings.find((x) => /meta acordada:/i.test(txt(x)));
      const resultText = readings.find((x) => /resultado reportado:/i.test(txt(x)));
      const pctText = readings.find((x) => /% reportado por colaborador:/i.test(txt(x)));

      const meta = numberFromText(txt(metaText));
      const result = numberFromText(txt(resultText));
      const pct = numberFromText(txt(pctText));
      const expected = Number.isFinite(meta) && Number.isFinite(result) && meta !== 0 ? Math.round((result / meta * 100) * 10) / 10 : pct;

      const visual = document.createElement('div');
      visual.className = 'leader-objective-visual-flow';
      visual.innerHTML = `
        <div class="objective-flow-copy">
          <span class="objective-flow-kicker">¿QUÉ DEBES VALIDAR?</span>
          <strong>Compara el resultado contra la meta.</strong>
          <small>El sistema calcula <b>Resultado ÷ Meta × 100</b>. Como líder solo confirma ese porcentaje o corrígelo si tu evidencia indica otro resultado.</small>
        </div>
        <div class="objective-flow-numbers">
          <div><small>1 · META ACORDADA</small><strong>${Number.isFinite(meta) ? meta : '—'}</strong><span>Lo que debía lograrse</span></div>
          <i>→</i>
          <div><small>2 · RESULTADO</small><strong>${Number.isFinite(result) ? result : '—'}</strong><span>Lo reportado al cierre</span></div>
          <i>→</i>
          <div class="objective-flow-result"><small>3 · CUMPLIMIENTO</small><strong>${Number.isFinite(expected) ? expected + '%' : '—'}</strong><span>Este es el número que validas</span></div>
        </div>`;

      const fields = card.querySelector('.objetivo-fields');
      if (fields) {
        const decision = card.querySelector('.leader-score-decision');
        if (decision) fields.insertBefore(visual, decision);
        else fields.appendChild(visual);
      }

      const oldGrid = card.querySelector('.kpi-leader-grid');
      if (oldGrid) oldGrid.classList.add('leader-reference-grid-compact');

      const input = card.querySelector('.leader-percent-field input[type="number"]');
      if (input) {
        input.setAttribute('aria-label', 'Porcentaje de cumplimiento validado por líder');
        input.setAttribute('inputmode', 'decimal');
      }
    });
  }

  function createPrintableDocument(title) {
    const root = document.querySelector('#app-root');
    if (!root) return '';
    const clone = root.cloneNode(true);
    clone.querySelectorAll('button, .nav-tabs, .wizard-steps, .wizard-nav, .app-header, .app-footer, .document-actions, input[type="checkbox"]').forEach((el) => el.remove());
    clone.querySelectorAll('textarea,input,select').forEach((el) => {
      const value = el.value || el.getAttribute('value') || '';
      const replacement = document.createElement('div');
      replacement.className = 'print-field-value';
      replacement.textContent = value || '—';
      el.replaceWith(replacement);
    });
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>
      @page{size:A4;margin:13mm}*{box-sizing:border-box}body{font-family:Segoe UI,Arial,sans-serif;color:#0b2545;margin:0;background:#fff;font-size:11px;line-height:1.45}.doc-head{background:#082b52;color:white;padding:22px 26px;border-radius:14px;margin-bottom:18px}.doc-brand{font-size:11px;letter-spacing:2px;font-weight:700;opacity:.8}.doc-head h1{font-size:25px;margin:5px 0 3px;color:white}.doc-head p{margin:0;opacity:.86}.doc-meta{display:flex;justify-content:space-between;gap:15px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.25)}#app-root{max-width:none!important}.container,.main-content,.content{max-width:none!important;width:100%!important;margin:0!important;padding:0!important}.card,.admin-panel,.feedback-acceptance-card,.leader-release-card,.performance-summary,.comparison-card{box-shadow:none!important;border:1px solid #d9e4f0!important;border-radius:12px!important;margin:0 0 12px!important;padding:14px!important;background:#fff!important}h1,h2,h3,h4{color:#082b52!important;break-after:avoid}.table{width:100%;border-collapse:collapse;font-size:10px}.table th{background:#edf4fb!important;color:#082b52!important;padding:7px}.table td{padding:7px;border-bottom:1px solid #e4ebf3}.print-field-value{border:1px solid #d9e4f0;background:#f8fbfe;padding:8px;border-radius:8px;min-height:30px}.leader-objective-scale-guide,.leader-objective-visual-flow{break-inside:avoid}.sidebar,.leader-sidebar,.admin-sidebar{display:none!important}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><header class="doc-head"><div class="doc-brand">INTER-CON · EVALUACIÓN DE DESEMPEÑO</div><h1>${title}</h1><p>Constancia de retroalimentación y seguimiento del periodo.</p><div class="doc-meta"><span>Documento generado desde la plataforma oficial</span><span>${new Date().toLocaleDateString('es-MX')}</span></div></header>${clone.innerHTML}</body></html>`;
  }

  App.imprimirRetroalimentacion = function () {
    const html = createPrintableDocument('Retroalimentación de desempeño');
    if (!html) return;
    const w = window.open('', '_blank');
    if (!w) { alert('El navegador bloqueó la ventana de impresión. Habilita ventanas emergentes para este sitio.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    const printNow = () => { try { w.focus(); w.print(); } catch (_) {} };
    if (w.document.readyState === 'complete') setTimeout(printNow, 250);
    else w.addEventListener('load', () => setTimeout(printNow, 250), { once:true });
  };

  App.descargarRetroalimentacion = function (colaboradorId, periodoId) {
    const html = createPrintableDocument('Constancia de retroalimentación');
    if (!html) return;
    const blob = new Blob([html], { type:'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constancia-retroalimentacion-${colaboradorId || 'colaborador'}-${periodoId || 'periodo'}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  function patchDraftCache() {
    if (!API || typeof API.saveLeaderDraft !== 'function' || API.saveLeaderDraft.__v20) return;
    const original = API.saveLeaderDraft.bind(API);
    let last = null;
    const wrapped = async function (id, payload) {
      const signature = id + '|' + JSON.stringify(payload || {});
      if (last && last.signature === signature && (Date.now() - last.at) < 10 * 60 * 1000) {
        return last.result || { ok:true, cached:true };
      }
      const result = await original(id, payload);
      last = { signature, at:Date.now(), result };
      return result;
    };
    wrapped.__v20 = true;
    API.saveLeaderDraft = wrapped;
  }

  async function repairMissingSelfComparison() {
    if (!API || !S || !D || !/\/lider\/comparacion\//.test(location.hash)) return;
    const table = Array.from(document.querySelectorAll('table')).find((t) => /AUTOEVALUACI[ÓO]N/i.test(txt(t.querySelector('thead'))));
    if (!table || table.dataset.selfRepair === 'done' || table.dataset.selfRepair === 'loading') return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    if (!rows.length) return;
    const autoColMissing = rows.filter((r) => {
      const td = r.children[1];
      const v = txt(td);
      return !v || v === '—' || /sin dato|n\/a/i.test(v);
    }).length;
    if (autoColMissing < Math.max(2, Math.floor(rows.length / 3))) return;

    table.dataset.selfRepair = 'loading';
    try {
      const employeeId = decodeURIComponent((location.hash.split('/lider/comparacion/')[1] || '').split('/')[0]);
      const db = S.load();
      const periods = db.periodos || [];
      const period = periods.find((p) => p.activo || p.estado === 'Activo') || periods[0];
      const auto = period && S.getEvaluacion(employeeId, period.id, 'autoevaluacion');
      const anyEval = (db.evaluaciones || []).find((e) => String(e.colaboradorId) === String(employeeId) && e.backendId);
      const backendId = (auto && auto.backendId) || (anyEval && anyEval.backendId);
      if (!backendId) return;
      const raw = await API.evaluationDetail(backendId, true);
      const detail = raw && raw.data ? raw.data : raw;
      const answers = Array.isArray(detail && detail.answers) ? detail.answers : [];
      const selfAnswers = answers.filter((a) => {
        const role = String(a.evaluator || a.evaluador || a.role || a.evaluatorRole || a.source || a.origin || a.tipoEvaluador || '').toLowerCase();
        return !/l[ií]der|leader|manager/.test(role);
      });
      const answerMap = {};
      selfAnswers.forEach((a) => {
        const id = a.competencyId || a.competenciaId || a.questionId || a.preguntaId || a.code || a.codigo;
        const value = a.value ?? a.valor ?? a.score ?? a.calificacion;
        if (id != null && value != null && value !== '') answerMap[String(id).toUpperCase()] = value;
      });
      const nameToId = {};
      Object.keys(D.COMPETENCIAS || {}).forEach((sec) => (D.COMPETENCIAS[sec] || []).forEach((c) => { nameToId[String(c.nombre || '').trim().toLowerCase()] = String(c.id || '').toUpperCase(); }));
      rows.forEach((r) => {
        const name = txt(r.children[0]).replace(/\s+/g,' ').trim().toLowerCase();
        if (/cumplimiento de objetivos/.test(name)) return;
        const id = nameToId[name];
        const value = id && answerMap[id];
        if (value != null && r.children[1] && (!txt(r.children[1]) || txt(r.children[1]) === '—')) r.children[1].textContent = value;
      });
      table.dataset.selfRepair = 'done';
    } catch (e) {
      console.warn('EDD v20: no fue posible recuperar autoevaluación para comparación', e);
    } finally {
      if (table.dataset.selfRepair !== 'done') table.dataset.selfRepair = 'retry';
    }
  }

  function enhance() {
    makeWizardStepsClickable();
    addObjectiveScale();
    enhanceObjectiveCards();
    repairMissingSelfComparison();
  }

  patchDraftCache();
  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList:true, subtree:true });
  document.addEventListener('DOMContentLoaded', enhance);
  setTimeout(enhance, 100);
})(window);
