(function (global) {
  'use strict';

  const App = global.App;
  const S = global.EDDStorage;
  const C = global.EDDCalc;
  if (!App || !S) return;

  const txt = el => (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim();
  const lower = v => String(v == null ? '' : v).trim().toLowerCase();
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const num = v => { const n=Number(String(v==null?'':v).replace('%','').replace(',','.')); return Number.isFinite(n)?n:null; };
  const fmt = v => Number.isFinite(Number(v)) ? (Math.round(Number(v)*10)/10).toFixed(1).replace(/\.0$/,'') : '—';

  function activePeriodId(){ const db=S.load(); const p=(db.periodos||[]).find(x=>x.activo)||(db.periodos||[])[0]; return p&&p.id; }
  function avg(xs){ const a=xs.map(num).filter(Number.isFinite); return a.length?a.reduce((s,v)=>s+v,0)/a.length:null; }
  function objectiveScore(o){
    let s=num(o&&o.calificacion); if(s!=null&&s>=1&&s<=5)return s;
    let p=num(o&&(o.cumplimiento??o.cumplimientoAutomatico)); if(p!=null&&p>=0&&p<=1.5)p*=100;
    return p==null?null:(C&&C.calificacionPorCumplimiento?C.calificacionPorCumplimiento(p):null);
  }

  function leaderObjectiveInfo(employeeId){
    const periodId=activePeriodId(); if(!employeeId||!periodId)return null;
    const lev=S.getEvaluacion(String(employeeId),periodId,'lider'); if(!lev)return null;
    const objs=(S.getObjetivos(lev.id)||[]).filter(o=>(o.descripcion||'').trim());
    if(!objs.length)return null;
    const score=avg(objs.map(objectiveScore));
    const pct=avg(objs.map(o=>{let p=num(o.cumplimiento??o.cumplimientoAutomatico);if(p!=null&&p>=0&&p<=1.5)p*=100;return p;}));
    return {score,pct,count:objs.length,objs};
  }

  function employeeIdFromPage(){
    let m=location.hash.match(/\/(?:resultado|comparacion|seguimiento|feedback)\/([^/?#]+)/i); if(m)return decodeURIComponent(m[1]);
    const n=Array.from(document.querySelectorAll('*')).find(el=>/^n[.°º]?\s*de empleado$/i.test(txt(el)));
    if(n&&n.parentElement){const values=Array.from(n.parentElement.children);const idx=values.indexOf(n);if(values[idx+1])return txt(values[idx+1]);}
    const db=S.load(); const candidates=(db.colaboradores||[]).filter(c=>document.body&&document.body.innerText&&document.body.innerText.includes(c.nombre));
    return candidates.length===1?candidates[0].empleado:null;
  }

  function repairEmployeeObjectiveResult(){
    const employeeId=employeeIdFromPage(); if(!employeeId)return;
    const info=leaderObjectiveInfo(employeeId); if(!info||info.score==null)return;
    const card=Array.from(document.querySelectorAll('article,div')).find(el=>/C\.\s*Cumplimiento de Objetivos/i.test(txt(el)) && el.querySelector && el.querySelector('.progress,.progress-bar'));
    if(!card)return;
    const current=lower(txt(card));
    if(!/n\/a|no aplic[oó]/.test(current))return;
    const pctScore=Math.max(0,Math.min(100,(info.score/5)*100));
    const badge=Array.from(card.querySelectorAll('span,b,em')).find(el=>/^n\/a$/i.test(txt(el)));
    if(badge) badge.textContent='30%';
    const bar=card.querySelector('.progress-bar'); if(bar) bar.style.width=pctScore+'%';
    const smalls=Array.from(card.querySelectorAll('small,p,span')).filter(el=>el!==badge);
    const note=smalls.find(el=>/no aplic[oó]|reponderado/i.test(txt(el)));
    if(note) note.textContent=`${fmt(info.pct!=null?info.pct:pctScore)}% de cumplimiento · promedio ${fmt(info.score)}/5 · ${info.count} objetivo${info.count===1?'':'s'}`;
    card.classList.add('objective-result-restored-v24');
  }

  function friendlyProcessLabels(){
    document.querySelectorAll('table').forEach(table=>{
      const heads=Array.from(table.querySelectorAll('thead th')).map(h=>lower(txt(h)));
      const idx=heads.findIndex(h=>h==='proceso'); if(idx<0)return;
      table.querySelectorAll('tbody tr').forEach(row=>{
        const cell=row.children[idx]; if(!cell)return;
        const raw=lower(txt(cell));
        if(raw==='released'||raw.includes('feedback_released')||raw.includes('result_released')) cell.innerHTML='<span class="badge workflow-state-action">Retroalimentación disponible</span>';
        else if(raw.includes('leader_submitted')) cell.innerHTML='<span class="badge badge-yellow">Pendiente de calibración</span>';
        else if(raw.includes('pending_meeting')) cell.innerHTML='<span class="badge workflow-state-action">Pendiente de reunión</span>';
        else if(raw.includes('pending_leader_signature')) cell.innerHTML='<span class="badge badge-red">Pendiente de firma del líder</span>';
        else if(raw.includes('pending_employee_signature')) cell.innerHTML='<span class="badge badge-yellow">Pendiente de firma del colaborador</span>';
      });
    });
    document.querySelectorAll('table tbody tr').forEach(row=>{
      const t=lower(txt(row));
      if(!/retroalimentaci[oó]n disponible|released|pendiente de reuni[oó]n/.test(t))return;
      const btn=Array.from(row.querySelectorAll('button,a.btn')).find(b=>/ver seguimiento|continuar/i.test(lower(txt(b))));
      if(btn){btn.textContent='Completar retroalimentación →';btn.classList.add('workflow-action-primary','workflow-action-urgent');}
    });
  }

  function ensureLeaderFeedbackBadge(){
    if(!/\/lider\//.test(location.hash))return;
    const rows=Array.from(document.querySelectorAll('table tbody tr'));
    const count=rows.filter(r=>/retroalimentaci[oó]n disponible|pending_meeting|released|completar retroalimentaci[oó]n/i.test(lower(txt(r)))).length;
    if(!count)return;
    const nav=Array.from(document.querySelectorAll('nav a,nav button,.app-nav a,.app-nav button,header a,header button')).find(el=>/mi equipo|seguimiento/i.test(txt(el)));
    if(nav&&!nav.querySelector('.workflow-nav-badge')){const b=document.createElement('span');b.className='workflow-nav-badge attention';b.textContent=String(count);nav.appendChild(b);nav.classList.add('workflow-nav-has-action');}
    const host=document.querySelector('.backend-live-section,.premium-evaluation-main,main,#app-root');
    if(host&&!document.querySelector('.feedback-action-banner-v24')){const a=document.createElement('a');a.href='#/lider/dashboard';a.className='feedback-action-banner-v24';a.innerHTML=`<span>ACCIÓN PENDIENTE</span><strong>${count} ${count===1?'retroalimentación requiere':'retroalimentaciones requieren'} tu atención</strong><b>Continuar →</b>`;host.insertAdjacentElement('afterbegin',a);}
  }

  function lockButton(btn,label){if(!btn)return null;const old=btn.textContent;btn.disabled=true;btn.setAttribute('aria-busy','true');btn.classList.add('action-processing-v24');btn.textContent=label||'Procesando…';return old;}
  function finishButton(btn,label){if(!btn)return;btn.disabled=true;btn.removeAttribute('aria-busy');btn.classList.remove('action-processing-v24');btn.classList.add('action-complete-v24');btn.textContent=label;}
  function restoreButton(btn,old){if(!btn)return;btn.disabled=false;btn.removeAttribute('aria-busy');btn.classList.remove('action-processing-v24');btn.textContent=old;}

  if(typeof App.liberarAcuerdos==='function'&&!App.liberarAcuerdos.__v24){
    const original=App.liberarAcuerdos.bind(App);
    const wrapped=async function(colaboradorId,periodoId){
      const btn=Array.from(document.querySelectorAll('button')).find(b=>/guardar y liberar acuerdos/i.test(txt(b)));const old=lockButton(btn,'Guardando y liberando…');
      await original(colaboradorId,periodoId);
      const cal=S.getCalibracion(colaboradorId,periodoId);
      if(cal&&cal.acuerdosLiberados) finishButton(btn,'✓ Acuerdos liberados'); else restoreButton(btn,old);
    }; wrapped.__v24=true; App.liberarAcuerdos=wrapped;
  }

  if(typeof App.firmarRetroalimentacion==='function'&&!App.firmarRetroalimentacion.__v24){
    const original=App.firmarRetroalimentacion.bind(App);
    const wrapped=async function(role,colaboradorId,periodoId,canvasId){
      const canvas=document.getElementById(canvasId);const scope=canvas&&canvas.closest('.signature-card,.feedback-signature-card,.feedback-acceptance-card,.leader-release-card');
      const btn=scope&&Array.from(scope.querySelectorAll('button')).find(b=>/firmar y confirmar|firmar ahora|confirmar firma/i.test(txt(b)));const old=lockButton(btn,'Registrando firma…');
      await original(role,colaboradorId,periodoId,canvasId);
      const cal=S.getCalibracion(colaboradorId,periodoId);const ok=cal&&(role==='lider'?cal.firmaLider:cal.firmaColaborador);
      if(ok) finishButton(btn,'✓ Firma registrada'); else restoreButton(btn,old);
    }; wrapped.__v24=true; App.firmarRetroalimentacion=wrapped;
  }

  function compactConstancy(colaboradorId,periodoId){
    const col=S.getColaborador(String(colaboradorId))||{}; const cal=S.getCalibracion(String(colaboradorId),periodoId)||{};
    const lev=S.getEvaluacion(String(colaboradorId),periodoId,'lider'); const res=lev&&S.getResultado(lev.id); const info=leaderObjectiveInfo(colaboradorId);
    const total=res&&res.puntajes&&num(res.puntajes.total); const score100=total!=null?(total<=5?total*20:total):null;
    const signature=(title,name,date,data)=>`<div class="sig"><span>${esc(title)}</span>${data?`<img src="${data}" alt="Firma ${esc(title)}">`:'<div class="sig-empty">Sin firma</div>'}<b>${esc(name||'—')}</b><small>${date?new Date(date).toLocaleString('es-MX'):'—'}</small></div>`;
    const objRows=info&&info.objs?info.objs.map((o,i)=>`<tr><td>${i+1}. ${esc(o.descripcion||'Objetivo')}</td><td>${esc(o.meta||'—')}</td><td>${esc(o.resultado||'—')}</td><td>${esc(o.cumplimiento==null?'—':fmt(num(o.cumplimiento))+'%')}</td><td>${esc(fmt(objectiveScore(o)))}/5</td></tr>`).join(''):'';
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Constancia de retroalimentación</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;font-family:Segoe UI,Arial,sans-serif;color:#102b4e;font-size:11px;line-height:1.4}.page{max-width:185mm;margin:0 auto}.head{background:#0b2f59;color:#fff;padding:18px 22px;border-radius:12px}.brand{font-size:10px;letter-spacing:2px;font-weight:800;opacity:.85}.head h1{margin:4px 0;font-size:22px}.head p{margin:0;opacity:.85}.person,.section{border:1px solid #d8e4ef;border-radius:10px;padding:12px 14px;margin-top:10px}.person{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}.label{font-size:8px;color:#6b7f96;text-transform:uppercase;letter-spacing:.8px}.value{display:block;font-weight:700}.score{font-size:24px;color:#14914b}.section h2{font-size:14px;margin:0 0 8px}.agreements{white-space:pre-wrap;background:#f7fafc;border-radius:8px;padding:10px;min-height:45px}table{width:100%;border-collapse:collapse;font-size:9px}th{background:#eef4fa;text-align:left;padding:6px}td{padding:6px;border-bottom:1px solid #e3ebf3}.sigs{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sig{border:1px solid #d8e4ef;border-radius:9px;padding:10px;text-align:center}.sig>span{display:block;font-size:8px;letter-spacing:1px;text-transform:uppercase;color:#6b7f96}.sig img{display:block!important;width:auto!important;height:auto!important;max-width:150px!important;max-height:55px!important;object-fit:contain!important;margin:8px auto!important}.sig b,.sig small{display:block}.sig-empty{height:55px;display:flex;align-items:center;justify-content:center;color:#8da0b5}.foot{margin-top:12px;border-top:1px solid #d8e4ef;padding-top:8px;color:#6b7f96;font-size:8px;text-align:center}img,svg,canvas{max-width:100%;height:auto}.no-chart{display:none!important}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><main class="page"><header class="head"><div class="brand">INTER-CON · EVALUACIÓN DE DESEMPEÑO</div><h1>Constancia de retroalimentación</h1><p>Documento final del proceso de evaluación, acuerdos y firmas.</p></header><section class="person"><div><span class="label">Colaborador</span><span class="value">${esc(col.nombre||colaboradorId)}</span><span class="label">Puesto</span><span class="value">${esc(col.puesto||'—')}</span></div><div><span class="label">Área</span><span class="value">${esc(col.area||'—')}</span><span class="label">N.º empleado</span><span class="value">${esc(colaboradorId)}</span></div><div><span class="label">Resultado final</span><span class="value score">${score100==null?'—':fmt(score100)}</span><span class="label">Periodo</span><span class="value">${esc(periodoId)}</span></div></section>${objRows?`<section class="section"><h2>Objetivos del periodo</h2><table><thead><tr><th>Objetivo</th><th>Meta</th><th>Resultado</th><th>Cumplimiento</th><th>Calificación</th></tr></thead><tbody>${objRows}</tbody></table></section>`:''}<section class="section"><h2>Acuerdos finales de la reunión</h2><div class="agreements">${esc(cal.acuerdosFinales||'Sin acuerdos registrados.')}</div></section><section class="section"><h2>Firmas</h2><div class="sigs">${signature('Líder',cal.firmaLiderNombre,cal.fechaFirmaLider,cal.firmaLiderData)}${signature('Colaborador',cal.firmaColaboradorNombre,cal.fechaFirmaColaborador,cal.firmaColaboradorData)}</div></section><footer class="foot">Generado desde la plataforma oficial de Evaluación de Desempeño Inter-Con · ${new Date().toLocaleDateString('es-MX')}</footer></main></body></html>`;
  }

  App.descargarRetroalimentacion=function(colaboradorId,periodoId){const cal=S.getCalibracion(String(colaboradorId),periodoId);if(!cal||!(cal.firmaLider&&cal.firmaColaborador))return;const html=compactConstancy(colaboradorId,periodoId);const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`constancia-retroalimentacion-${colaboradorId}-${periodoId}.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  App.imprimirRetroalimentacion=function(colaboradorId,periodoId){const cal=S.getCalibracion(String(colaboradorId),periodoId);if(!cal||!(cal.firmaLider&&cal.firmaColaborador))return;const html=compactConstancy(colaboradorId,periodoId);const w=window.open('','_blank');if(!w)return;w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{w.focus();w.print();},250);};

  function enhance(){repairEmployeeObjectiveResult();friendlyProcessLabels();ensureLeaderFeedbackBadge();}
  let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance();});}
  const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});
  global.addEventListener('hashchange',()=>setTimeout(schedule,40));document.addEventListener('DOMContentLoaded',schedule);setTimeout(schedule,100);setTimeout(schedule,700);
})(window);
