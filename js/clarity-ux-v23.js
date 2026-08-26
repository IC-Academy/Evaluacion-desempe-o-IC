(function (global) {
  'use strict';

  const S = global.EDDStorage;
  const D = global.EDDData;
  const C = global.EDDCalc;
  const Charts = global.EDDCharts;
  if (!S || !D || !C || !Charts) return;

  function text(el) { return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim(); }
  function num(v) {
    if (v === null || v === undefined || v === '' || v === 'N/A') return null;
    const n = Number(String(v).replace('%','').replace(',','.').trim());
    return Number.isFinite(n) ? n : null;
  }
  function avg(values) {
    const xs = values.map(num).filter(Number.isFinite);
    if (!xs.length) return null;
    return Math.round((xs.reduce((a,b)=>a+b,0)/xs.length)*100)/100;
  }
  function fmt(v) { return Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')) : '—'; }

  function scoreRange(score) {
    const s = Number(score);
    if (s === 5) return '110% o más';
    if (s === 4) return '100% a 109%';
    if (s === 3) return '90% a 99%';
    if (s === 2) return '75% a 89%';
    if (s === 1) return 'menos de 75%';
    return '';
  }

  function explainLeaderObjectiveScores() {
    document.querySelectorAll('.leader-objective-review').forEach(card => {
      const input = card.querySelector('.leader-percent-field input[type="number"]');
      const scoreBox = card.querySelector('.leader-derived-rating');
      if (!input || !scoreBox) return;
      const strong = scoreBox.querySelector('strong');
      const small = scoreBox.querySelector('small');
      const pct = num(input.value);
      const score = strong ? num(text(strong).split('/')[0]) : null;
      if (!small || pct == null || score == null) return;
      const range = scoreRange(score);
      small.innerHTML = `<b>${fmt(pct)}%</b> cae en <b>${range}</b>, por eso corresponde a <b>${score} ${score===1?'estrella':'estrellas'}</b>.`;
      scoreBox.classList.add('objective-score-explained-v23');
    });
  }

  function organizeEmployeeObjectives() {
    if (!/\/(colaborador|lider)\//.test(location.hash)) return;
    document.querySelectorAll('.kpi-objective-row:not(.leader-objective-review)').forEach(row => {
      if (row.dataset.orderV23 === '1') return;
      const main = row.querySelector('.kpi-objective-main');
      const grid = row.querySelector('.kpi-objective-grid');
      if (!main || !grid) return;
      row.dataset.orderV23 = '1';
      row.classList.add('employee-objective-order-v23');
      const cells = Array.from(grid.children);
      if (cells[0]) cells[0].classList.add('objective-meta-v23');
      if (cells[1]) cells[1].classList.add('objective-result-v23');
      if (cells[2]) cells[2].classList.add('objective-percent-v23');
      if (cells[3]) cells[3].classList.add('objective-stars-v23');
      const ratingLabel = cells[3] && cells[3].querySelector('label');
      if (ratingLabel) ratingLabel.textContent = 'Resultado en estrellas';
      const percentLabel = cells[2] && cells[2].querySelector('label');
      if (percentLabel) percentLabel.innerHTML = 'Comparación meta vs. resultado <small>Resultado ÷ meta × 100</small>';
      if (!row.querySelector('.employee-objective-reading-v23')) {
        const guide = document.createElement('div');
        guide.className = 'employee-objective-reading-v23';
        guide.innerHTML = '<span>ORDEN DE LECTURA</span><b>1. Objetivo</b><i>→</i><b>2. Meta y resultado alcanzado</b><i>→</i><b>3. Resultado en estrellas</b>';
        main.insertAdjacentElement('afterend', guide);
      }
    });
  }

  function activePeriodId() {
    const db = S.load();
    const p = (db.periodos || []).find(x => x.activo) || (db.periodos || [])[0];
    return p && p.id;
  }

  function employeeFromCalibrationHash() {
    const m = location.hash.match(/#\/admin\/calibracion\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function toolAverage(evalId) {
    const tools = S.getHerramientasEvaluacion(evalId) || {};
    return avg([tools.excel, tools.analisis, tools.ia]);
  }

  function responseValue(evalId, cid) {
    if (String(cid).toUpperCase() === 'B2') {
      const tool = toolAverage(evalId);
      if (tool != null) return tool;
    }
    const r = (S.getRespuestas(evalId) || []).find(x => String(x.competenciaId).toUpperCase() === String(cid).toUpperCase());
    return r && r.valor !== 'N/A' ? num(r.valor) : null;
  }

  function objectiveScore(o) {
    let s = num(o && o.calificacion);
    if (s != null && s >= 1 && s <= 5) return s;
    let pct = num(o && (o.cumplimiento ?? o.cumplimientoAutomatico));
    if (pct != null && pct >= 0 && pct <= 1.5) pct *= 100;
    return pct == null ? null : C.calificacionPorCumplimiento(pct);
  }

  function buildUnifiedProfile(employeeId) {
    const periodId = activePeriodId();
    if (!employeeId || !periodId) return null;
    const autoEval = S.getEvaluacion(employeeId, periodId, 'autoevaluacion');
    const leaderEval = S.getEvaluacion(employeeId, periodId, 'lider');
    if (!autoEval || !leaderEval) return null;

    const labels = {
      A1:'Compromiso Organizacional', A2:'Actitud de Servicio', A3:'Trabajo en Equipo',
      A4:'Comunicación Efectiva', A5:'Adaptabilidad e Iniciativa', B1:'Dominio del Puesto',
      B2:'Procesos y Herramientas', B3:'Orientación a Resultados', B4:'Planeación y Organización',
      B5:'Seguimiento y Control'
    };
    const dims = [];
    const auto = {}, leader = {};
    [...(D.COMPETENCIAS.actitud||[]), ...(D.COMPETENCIAS.habilidades||[])].forEach(c => {
      const key = String(c.id).toLowerCase();
      dims.push({key, label:c.nombre, shortLabel:labels[c.id] || c.nombre});
      auto[key] = responseValue(autoEval.id, c.id);
      leader[key] = responseValue(leaderEval.id, c.id);
    });
    const autoObj = avg((S.getObjetivos(autoEval.id)||[]).map(objectiveScore));
    const leaderObj = avg((S.getObjetivos(leaderEval.id)||[]).map(objectiveScore));
    dims.push({key:'objetivos', label:'Cumplimiento de Objetivos', shortLabel:'Objetivos'});
    auto.objetivos = autoObj;
    leader.objetivos = leaderObj;

    const attitudeKeys = (D.COMPETENCIAS.actitud||[]).map(c=>String(c.id).toLowerCase());
    const skillKeys = (D.COMPETENCIAS.habilidades||[]).map(c=>String(c.id).toLowerCase());
    const averages = source => ({
      actitud: avg(attitudeKeys.map(k=>source[k])),
      habilidades: avg(skillKeys.map(k=>source[k])),
      objetivos: source.objetivos
    });
    return { profile:{dimensiones:dims, autoevaluacion:auto, evaluacionLider:leader}, autoProm:averages(auto), leaderProm:averages(leader) };
  }

  function summaryStrip(autoProm, leaderProm) {
    const sections = [['actitud','Valores y actitud'],['habilidades','Técnica funcional'],['objetivos','Objetivos']];
    return `<div class="performance-summary-strip">${sections.map(([k,label])=>{
      const a=num(autoProm[k]), l=num(leaderProm[k]);
      const ideal=l==null?null:5-l, perception=(a==null||l==null)?null:a-l;
      const cls=ideal==null?'neutral':ideal<=.5?'good':ideal<=1.25?'mid':'attention';
      return `<article class="performance-summary-card ${cls}"><span>${label}</span><strong>${l==null?'—':fmt(l)}<small>/5 líder</small></strong><div><b>${ideal==null?'—':fmt(ideal)+' pts al ideal'}</b><em>${perception==null?'—':(perception>0?'+':'')+fmt(perception)+' auto vs líder'}</em></div></article>`;
    }).join('')}</div>`;
  }

  function repairCalibrationProfile() {
    const employeeId = employeeFromCalibrationHash();
    if (!employeeId) return;
    const section = document.querySelector('.remote-performance-profile');
    if (!section || section.dataset.unifiedV23 === '1') return;
    const data = buildUnifiedProfile(employeeId);
    if (!data) return;
    const wheel = Charts.renderPerformanceWheel(data.profile);
    const radar = Charts.renderRadarChart({autoevaluacion:data.autoProm, evaluacionLider:data.leaderProm});
    section.dataset.unifiedV23 = '1';
    section.innerHTML = `
      <div class="performance-profile-head"><div><span class="admin-section-kicker">LECTURA MULTIDIMENSIONAL</span><h2>Perfil de desempeño vs. ideal</h2><p>Esta vista usa exactamente la misma fuente y cálculo que la comparación del líder: competencias, herramientas B.2 consolidadas y objetivos del expediente.</p></div><span class="calibration-source-badge-v23">MISMA LECTURA QUE LÍDER</span></div>
      ${summaryStrip(data.autoProm,data.leaderProm)}
      ${wheel}
      <details class="performance-summary-details"><summary>Ver resumen ejecutivo de 3 dimensiones</summary><div class="feedback-analysis-single"><div><h3>Radar ejecutivo</h3>${radar}</div></div></details>`;
  }

  function enhance() {
    explainLeaderObjectiveScores();
    organizeEmployeeObjectives();
    repairCalibrationProfile();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  global.addEventListener('hashchange',()=>setTimeout(schedule,50));
  document.addEventListener('DOMContentLoaded',schedule);
  setTimeout(schedule,100);
  setTimeout(schedule,700);
})(window);
