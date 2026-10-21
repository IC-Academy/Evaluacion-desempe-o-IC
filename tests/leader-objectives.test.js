// Ejecutar: node tests/leader-objectives.test.js
// Carga el código REAL de js/ (storage, normalización, app.js) en un contexto vm. Sin red, sin Airtable.
const fs = require('fs'), vm = require('vm'), path = require('path');
const JS = path.join(__dirname, '..', 'js') + path.sep;
const SRC = fs.readFileSync(JS + 'app.js', 'utf8');
function extract(startRe, endRe) {
  const a = SRC.search(startRe); if (a < 0) throw new Error('no start ' + startRe);
  const rest = SRC.slice(a); const m = rest.slice(1).search(endRe); return rest.slice(0, m + 1);
}
const hyd = extract(/  function hydrateObjectives\(/, /\n  function pickMetric\(/);
const val = extract(/  function limpiarErroresVisuales\(/, /\n  function requiereJustificacionNA\(/);
let fails = 0; const ok = (n, c, x) => { console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : ' ' + JSON.stringify(x))); if (!c) fails++; };
function run(objectives) {
  const mem = {}; const win = { localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } } };
  win.window = win; win.document = {}; const c = vm.createContext(win);
  ['config.js', 'data.js', 'calculations.js', 'storage.js', 'objective-normalization.js', 'objective-rule.js'].forEach(f => {
    if (fs.existsSync(JS + f)) vm.runInContext(fs.readFileSync(JS + f, 'utf8'), c, { filename: f });
  });
  const REAL = win.EDDStorage; const rows = [];
  const mk = i => ({ dataset: { idx: String(i) }, classList: { add() { this.on = true; }, remove() {} }, scrollIntoView() {}, querySelector() { return null; } });
  const wizard = { querySelectorAll: q => (q === '.objetivo-row' ? rows : []), querySelector: () => null };
  const S = Object.create(REAL); S.load = () => ({ evaluaciones: [{ id: 'L1' }] }); S.getEvaluacion = () => ({ objetivosNoAplican: false });
  S.saveObjetivo = (...a) => REAL.saveObjetivo(...a); S.getObjetivos = () => REAL.getObjetivos('L1');
  const ctx = { global: win, S, D: { COMPETENCIAS: {} }, state: { wizard: { tipo: 'lider', colaboradorId: 'x' }, periodo: { id: 'P' } }, document: { querySelector: () => wizard, querySelectorAll: () => [] }, setTimeout, evaluacionSinObjetivos: () => false };
  vm.createContext(ctx);
  vm.runInContext(hyd + '\n' + val + '\nthis.h=hydrateObjectives;this.v=validarSeccionVisual;this.det=()=>(typeof ultimoDetalleValidacion!=="undefined"?ultimoDetalleValidacion:[]);', ctx);
  ctx.h('L1', objectives, true); REAL.getObjetivos('L1').forEach((_, i) => rows.push(mk(i)));
  const n = ctx.v('L1', 'objetivos');
  return { n, red: rows.map((r, i) => (r.classList.on ? i : -1)).filter(i => i >= 0), det: ctx.det ? ctx.det() : [], store: REAL.getObjetivos('L1') };
}
const O = (id, meta, res, ratio, lp, ls, just) => ({ objectiveId: id, description: 'obj ' + id, goal: meta, actualResult: res, employeeCompletionPercent: ratio, leaderValidatedPercent: lp, leaderScore: ls, leaderAdjustmentReason: just || '' });
let r = run([O('1', 100, 85, 0.85, 85, 2), O('2', 100, 90, 0.9, 90, 3), O('3', 100, 70, 0.7, 75, 1, 'justificado')]);
ok('272257: reabierta sin diferencias reales no bloquea', r.n === 0, r);
r = run([O('1', 90, 85, 0.9440000000000001, 90, 3), O('2', 80, 65, 0.813, 80, 3, 'j2'), O('3', 95, 88, 0.9259999999999999, 92.6, 2)]);
ok('273183: solo el ajuste real sin justificar (OBJ-1) queda en rojo', r.n === 1 && r.red[0] === 0, r);
ok('273183: mensaje nombra sección, objetivo y valores', /Sección Objetivos, objetivo 1: falta la justificación del ajuste \(94\.4 % → 90 %\)/.test(r.det.join(' ')), r.det);
r = run([O('1', 48, 108, 2.25, 225, 5), O('2', 25, 50, 2, 200, 5), O('3', 30, 40, 1.3330000000000002, 133.3, 5)]);
ok('249068: >100 % respeta reglas actuales, no bloquea', r.n === 0, r);
r = run([O('2', 100, 98.05, 0.98, 98.1, 3)]);
ok('98.05 vs 98.1: sin ajuste, no bloquea', r.n === 0 && !r.store[0].ajusteManualLider, r);
r = run([O('2', 100, 98.05, 0.98, 98.0, 3)]);
ok('98.0 vs 98.1: ajuste real sin justificar, bloquea (sin tolerancia)', r.n === 1, r);
r = run([O('2', 100, 98.05, 0.98, 98.0, 3, 'motivo')]);
ok('ajuste real con justificación: no bloquea', r.n === 0, r);
r = run([O('1', 100, 100, 1, 100, 4)]);
ok('100 %: no bloquea', r.n === 0, r);
r = run([O('1', 100, 85, 0.85, 85, '')]);
ok('sin calificación del líder se completa por escala (sin cambiar escala)', r.n === 0 && r.store[0].calificacion === 2, r);
console.log(fails ? '\nFALLAS: ' + fails : '\nTODAS PASS');
process.exit(fails ? 1 : 0);
