/**
 * app.js
 * ---------------------------------------------------------------------------
 * Interfaz y navegación de la demo EDD Inter-Con. Router por hash, tres
 * portales (Colaborador / Líder / Administrador) y componentes compartidos.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';
  const D = global.EDDData;
  const C = global.EDDCalc;
  const S = global.EDDStorage;
  const SESSION_KEY = 'edd_session_v1';

  const state = {
    user: null,       // {empleado, nombre, perfil}
    periodo: null,
    wizard: { seccionIdx: 0, evaluacionId: null, tipo: null, colaboradorId: null, liderId: null },
    adminFiltros: {},
    nineboxSel: null
  };

  // =========================================================================
  // UTILIDADES
  // =========================================================================
  const $ = (sel, root) => (root || document).querySelector(sel);
  function h(strings) { return strings; } // noop, mantiene legibilidad de template literals
  function esc(str) { return String(str === null || str === undefined ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function f1(n) { return (n === null || n === undefined || isNaN(n)) ? '—' : Number(n).toFixed(1); }
  function pct(n) { return Math.max(0, Math.min(100, Math.round(n))); }

  const ESTADO_COLOR = {
    'No iniciada': 'gray', 'En progreso': 'yellow', 'Completada': 'green',
    'Pendiente de líder': 'yellow', 'Pendiente de calibración': 'yellow', 'Calibrada': 'blue',
    'Retroalimentación pendiente': 'yellow', 'Cerrada': 'green'
  };
  function badge(texto, color) {
    return `<span class="badge badge-${color || ESTADO_COLOR[texto] || 'gray'}">${esc(texto)}</span>`;
  }

  function progressBar(percent, color) {
    const p = pct(percent);
    return `<div class="progress"><div class="progress-bar" style="width:${p}%;background:${color || 'var(--azul-marino)'}"></div></div><div class="progress-label">${p}%</div>`;
  }

  function escalaHelpHTML() {
    return `<div class="escala-help"><strong>Escala de evaluación</strong>` +
      D.ESCALA.map((e) => `<div class="escala-row"><span class="escala-valor">${esc(e.valor)}</span><span>${esc(e.descripcion)}</span></div>`).join('') +
      `</div>`;
  }

  function fechaHoy() { return '2026-07-28'; } // fecha de referencia de la demo (ver <env>)
  function esVencido(fechaLimite) { return fechaLimite && fechaHoy() > fechaLimite; }

  // =========================================================================
  // SESIÓN
  // =========================================================================
  function guardarSesion(u) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch (e) {} }
  function leerSesion() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } }
  function borrarSesion() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

  function login(empleado, perfil) {
    const u = S.getUsuario(empleado);
    if (!u) { alert('Número de empleado no encontrado en la demo.'); return; }
    if (u.perfil !== perfil) { alert('El perfil seleccionado no coincide con el número de empleado (perfil real: ' + u.perfil + ').'); return; }
    state.user = u;
    guardarSesion(u);
    S.addAudit(u.nombre, 'Inicio de sesión', 'usuarios', u.empleado, null, u.perfil);
    navigate(u.perfil === 'colaborador' ? '#/colaborador/inicio' : (u.perfil === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard'));
  }
  function logout() {
    if (state.user) S.addAudit(state.user.nombre, 'Cierre de sesión', 'usuarios', state.user.empleado, null, null);
    state.user = null; borrarSesion(); navigate('#/login');
  }

  // =========================================================================
  // ROUTER
  // =========================================================================
  function navigate(hash) { if (location.hash === hash) { render(); } else { location.hash = hash; } }
  function parseHash() {
    const h = location.hash.replace(/^#\//, '');
    const parts = h.split('/').filter(Boolean);
    return parts;
  }

  function render() {
    const root = document.getElementById('app-root');
    if (!state.user) {
      const sess = leerSesion();
      if (sess) state.user = sess;
    }
    if (!state.user) { root.innerHTML = viewLogin(); bindLogin(); return; }
    state.periodo = S.getPeriodoActivo();

    const parts = parseHash();
    const area = parts[0] || (state.user.perfil === 'colaborador' ? 'colaborador' : state.user.perfil === 'lider' ? 'lider' : 'admin');
    const page = parts[1] || 'inicio';
    const param = parts[2];

    let body = '';
    if (area === 'colaborador') body = renderColaborador(page);
    else if (area === 'lider') body = renderLider(page, param);
    else body = renderAdmin(page, param);

    root.innerHTML = renderHeader(area, page) + `<main class="container">${body}</main>` + renderFooter();
    bindGlobal();
  }

  // =========================================================================
  // HEADER / NAV / FOOTER
  // =========================================================================
  function renderHeader(area, page) {
    const u = state.user;
    const per = state.periodo;
    let tabs = [];
    if (u.perfil === 'colaborador') {
      tabs = [['inicio', 'Inicio'], ['autoevaluacion', 'Autoevaluación'], ['retroalimentacion', 'Retroalimentación']];
    } else if (u.perfil === 'lider') {
      tabs = [['dashboard', 'Dashboard de equipo']];
    } else {
      tabs = [['dashboard', 'Dashboard'], ['calibracion', 'Calibración'], ['9box', 'Matriz 9-Box'], ['auditoria', 'Auditoría'], ['config', 'Configuración']];
    }
    const navHtml = tabs.map((t) => `<a href="#/${area === 'colaborador' ? 'colaborador' : area}/${t[0]}" class="${page === t[0] ? 'active' : ''}">${t[1]}</a>`).join('');
    return `
    <header class="app-header">
      <div class="app-header-top">
        <div class="brand">
          <span class="brand-mark">IC</span>
          <div>
            <div class="brand-title">Plataforma EDD · Inter-Con</div>
            <div class="brand-sub">Evaluación del Desempeño Administrativo</div>
          </div>
        </div>
        <div class="header-meta">
          <div class="header-meta-item"><span class="label">Usuario</span><span class="value">${esc(u.nombre)}</span></div>
          <div class="header-meta-item"><span class="label">Perfil</span><span class="value">${capitalize(u.perfil)}</span></div>
          <div class="header-meta-item"><span class="label">Periodo</span><span class="value">${esc(per ? per.nombre : '—')}</span></div>
          <button class="btn btn-outline btn-sm" onclick="App.logout()">Cerrar sesión</button>
        </div>
      </div>
      <nav class="nav-tabs">${navHtml}</nav>
    </header>`;
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function renderFooter() {
    return `<footer class="app-footer">Demo funcional EDD Inter-Con — FOR-CAP-003 Rev. 3 · Datos simulados almacenados localmente en este navegador.</footer>`;
  }

  function bindGlobal() {
    document.querySelectorAll('[data-tooltip-toggle]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const panel = document.getElementById(btn.getAttribute('data-tooltip-toggle'));
        if (panel) panel.classList.toggle('open');
      });
    });
  }

  // =========================================================================
  // LOGIN
  // =========================================================================
  function viewLogin() {
    return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">
          <span class="brand-mark brand-mark-lg">IC</span>
          <h1>Plataforma EDD Inter-Con</h1>
          <p>Evaluación del Desempeño Administrativo — acceso de demostración</p>
        </div>
        <div class="login-form">
          <label>Número de empleado</label>
          <input id="loginEmpleado" type="text" placeholder="Ej. 10001" />
          <label>Perfil</label>
          <select id="loginPerfil">
            <option value="colaborador">Colaborador</option>
            <option value="lider">Líder</option>
            <option value="administrador">Administrador</option>
          </select>
          <button class="btn btn-primary btn-block" id="btnLogin">Entrar</button>
        </div>
        <div class="quick-access">
          <p class="quick-access-title">Acceso rápido de demostración</p>
          <button class="btn btn-outline btn-block" data-quick="10001|colaborador">Entrar como colaborador — Laura Hernández (10001)</button>
          <button class="btn btn-outline btn-block" data-quick="20001|lider">Entrar como líder — Carlos Martínez (20001)</button>
          <button class="btn btn-outline btn-block" data-quick="90001|administrador">Entrar como administrador — Administrador RH (90001)</button>
        </div>
      </div>
    </div>`;
  }
  function bindLogin() {
    $('#btnLogin').addEventListener('click', () => login($('#loginEmpleado').value.trim(), $('#loginPerfil').value));
    document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
      const [emp, perfil] = b.getAttribute('data-quick').split('|');
      login(emp, perfil);
    }));
  }

  // =========================================================================
  // PORTAL COLABORADOR
  // =========================================================================
  function renderColaborador(page) {
    const col = S.getColaborador(state.user.empleado);
    const periodoId = state.periodo.id;
    const estado = S.estadoProceso(col.empleado, periodoId);

    if (page === 'autoevaluacion') return viewAutoevaluacion(col, periodoId, estado);
    if (page === 'retroalimentacion') return viewRetroalimentacion(col, periodoId, estado);
    return viewColaboradorInicio(col, periodoId, estado);
  }

  function viewColaboradorInicio(col, periodoId, estado) {
    const autoEval = S.getEvaluacion(col.empleado, periodoId, 'autoevaluacion');
    let avance = 0;
    if (autoEval) {
      const total = D.COMPETENCIAS.actitud.length + D.COMPETENCIAS.habilidades.length + D.COMPETENCIAS.conocimientos.length + 1;
      const respondidas = S.getRespuestas(autoEval.id).length;
      const objetivosOk = S.getObjetivos(autoEval.id).some((o) => o.descripcion && o.descripcion.trim());
      avance = pct(((respondidas + (objetivosOk ? 1 : 0)) / total) * 100);
    }
    const vencida = esVencido(state.periodo.fechaLimiteAutoevaluacion) && estado === D.ESTADOS.NO_INICIADA;

    let accion = '';
    if (estado === D.ESTADOS.NO_INICIADA || estado === D.ESTADOS.EN_PROGRESO) {
      accion = `<a class="btn btn-primary" href="#/colaborador/autoevaluacion">${estado === D.ESTADOS.NO_INICIADA ? 'Iniciar autoevaluación' : 'Continuar autoevaluación'}</a>`;
    } else if (estado === D.ESTADOS.RETRO_PENDIENTE || estado === D.ESTADOS.CERRADA) {
      accion = `<a class="btn btn-primary" href="#/colaborador/retroalimentacion">Ver retroalimentación</a>`;
    } else {
      accion = `<p class="muted">Tu autoevaluación fue enviada. El proceso continúa con la evaluación de tu líder y la calibración de RH.</p>`;
    }

    return `
    <div class="card">
      <h2>Hola, ${esc(col.nombre)}</h2>
      <p class="muted">${esc(col.puesto)} · ${esc(col.area)} · ${esc(col.ciudad)}</p>
      <div class="info-grid">
        <div><span class="label">Periodo activo</span><span class="value">${esc(state.periodo.nombre)}</span></div>
        <div><span class="label">Estado</span>${badge(estado)}</div>
        <div><span class="label">Fecha límite autoevaluación</span><span class="value">${state.periodo.fechaLimiteAutoevaluacion}${vencida ? ' ' + badge('Vencida', 'red') : ''}</span></div>
      </div>
      <div class="progress-wrap">${progressBar(avance)}</div>
      <div class="actions">${accion}</div>
    </div>`;
  }

  function ensureWizard(col, periodoId) {
    const ev = S.getOrCreateEvaluacion(col.empleado, col.liderId, periodoId, 'autoevaluacion');
    if (state.wizard.evaluacionId !== ev.id) { state.wizard = { seccionIdx: 0, evaluacionId: ev.id, tipo: 'autoevaluacion', colaboradorId: col.empleado, liderId: col.liderId }; }
    return ev;
  }

  const SECCIONES_WIZARD = ['actitud', 'habilidades', 'conocimientos', 'objetivos', 'resumen'];

  function viewAutoevaluacion(col, periodoId, estado) {
    const ev = ensureWizard(col, periodoId);
    if (ev.estado === D.ESTADOS.COMPLETADA) {
      return `<div class="card"><h2>Autoevaluación ya enviada</h2><p>Tu autoevaluación para este periodo ya fue enviada el ${esc((ev.completedAt || '').slice(0, 10))}. No es posible modificarla.</p><a class="btn btn-outline" href="#/colaborador/inicio">Volver al inicio</a></div>`;
    }
    const idx = state.wizard.seccionIdx;
    const seccion = SECCIONES_WIZARD[idx];
    const stepsHtml = SECCIONES_WIZARD.map((s, i) => `<div class="wizard-step ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}">${i + 1}. ${labelSeccion(s)}</div>`).join('');

    let contenido = '';
    if (seccion === 'objetivos') contenido = renderObjetivosForm(ev, false);
    else if (seccion === 'resumen') contenido = renderResumenAuto(ev);
    else contenido = renderSeccionForm(ev, seccion, false);

    return `
    <div class="card wizard-card">
      <div class="wizard-steps">${stepsHtml}</div>
      <h2>${labelSeccion(seccion)}</h2>
      ${contenido}
      <div class="wizard-nav">
        <button class="btn btn-outline" ${idx === 0 ? 'disabled' : ''} onclick="App.wizardPrev()">Anterior</button>
        ${seccion === 'resumen'
          ? `<label class="confirm-check"><input type="checkbox" id="confirmEnvioAuto"/> Confirmo que la información capturada es correcta.</label>
             <button class="btn btn-primary" onclick="App.enviarAutoevaluacion()">Enviar autoevaluación</button>`
          : `<button class="btn btn-primary" onclick="App.wizardNext('${seccion}')">Siguiente</button>`}
      </div>
    </div>`;
  }

  function labelSeccion(s) {
    return { actitud: 'A. Valores y Actitud', habilidades: 'B. Habilidades', conocimientos: 'C. Conocimientos', objetivos: 'D. Cumplimiento de Objetivos', resumen: 'Resumen y envío' }[s];
  }

  function renderSeccionForm(ev, seccion, soloLectura) {
    const meta = D.SECCIONES_META[seccion];
    const competencias = D.COMPETENCIAS[seccion];
    const respuestas = S.getRespuestasPorSeccion(ev.id)[seccion];
    const mapVal = {}; respuestas.forEach((r) => { mapVal[r.competenciaId] = r; });
    return `
    <p class="muted">${esc(meta.descripcion)} <span class="peso-tag">Peso de la sección: ${meta.peso}%</span></p>
    ${escalaHelpInline()}
    ${competencias.map((c) => renderCompetenciaCard(ev.id, seccion, c, mapVal[c.id], soloLectura)).join('')}
    `;
  }

  function escalaHelpInline() {
    return `<details class="escala-details"><summary>Ver escala de evaluación</summary>${escalaHelpHTML()}</details>`;
  }

  /**
   * Widget de calificación en estrellas (1-5) + pastilla N/A, en reemplazo del
   * <select> plano. Los 5 radios comparten "groupName" con el radio N/A para
   * que sean mutuamente excluyentes; el relleno visual usa el truco CSS de
   * hermanos generales (~) sobre <label class="star">, ver styles.css.
   */
  function ratingWidget(groupName, valorActual, onchangeJs, disabled, compact) {
    const safeGroup = String(groupName).replace(/[^a-zA-Z0-9_-]/g, '_');
    const estrellas = [5, 4, 3, 2, 1].map((v) => {
      const id = safeGroup + '_s' + v;
      const checked = String(valorActual) === String(v);
      const descEntry = D.ESCALA.find((e) => String(e.valor) === String(v));
      const tip = descEntry ? (v + ' — ' + descEntry.descripcion) : String(v);
      return `<input type="radio" name="${safeGroup}" id="${id}" value="${v}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="${onchangeJs}"/><label class="star" for="${id}" title="${esc(tip)}">★</label>`;
    }).join('');
    const idNA = safeGroup + '_na';
    const checkedNA = String(valorActual) === 'N/A';
    const vacio = valorActual === '' || valorActual === null || valorActual === undefined;
    return `<div class="rating-widget${disabled ? ' rating-readonly' : ''}${compact ? ' rating-compact' : ''}">
      <div class="star-rating">${estrellas}</div>
      <input type="radio" class="na-radio" name="${safeGroup}" id="${idNA}" value="N/A" ${checkedNA ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="${onchangeJs}"/>
      <label class="na-pill" for="${idNA}" title="No aplica o sin elementos suficientes para evaluar">N/A</label>
      ${vacio ? '<span class="rating-empty-hint">Sin calificar</span>' : ''}
    </div>`;
  }

  function renderCompetenciaCard(evaluacionId, seccion, c, respuesta, soloLectura) {
    const valor = respuesta ? respuesta.valor : '';
    const comentario = respuesta ? respuesta.comentario : '';
    const groupName = 'rate_' + evaluacionId + '_' + c.id;
    const onchangeJs = `App.rate('${evaluacionId}','${seccion}','${c.id}',this.value)`;
    return `
    <div class="competency-card">
      <div class="competency-header">
        <div>
          <strong>${esc(c.nombre)}</strong>
          <span class="peso-tag">${c.peso}%</span>
          <ul class="conductas">${c.conductas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div class="competency-rate">
          <label>Calificación</label>
          ${ratingWidget(groupName, valor, onchangeJs, soloLectura, false)}
        </div>
      </div>
      ${!soloLectura ? `<textarea class="comentario-box" placeholder="Comentario (opcional)" onchange="App.comentar('${evaluacionId}','${seccion}','${c.id}',this.value)">${esc(comentario)}</textarea>` : (comentario ? `<div class="comentario-lectura">${esc(comentario)}</div>` : '')}
    </div>`;
  }

  function renderObjetivosForm(ev, soloLecturaDescripcion) {
    const objetivos = S.getObjetivos(ev.id);
    const filas = [];
    for (let i = 0; i < Math.max(objetivos.length, 1); i++) filas.push(objetivos[i] || { index: i, descripcion: '', resultado: '', calificacion: '' });
    return `
    <p class="muted">Registra hasta cinco objetivos del periodo. Solo se promedian los objetivos con descripción y calificación válida.</p>
    ${escalaHelpInline()}
    <div id="objetivosWrap">${filas.map((o, i) => renderObjetivoRow(ev.id, o, i, soloLecturaDescripcion)).join('')}</div>
    ${filas.length < 5 ? `<button class="btn btn-outline btn-sm" onclick="App.agregarObjetivo('${ev.id}')">+ Agregar objetivo</button>` : ''}
    `;
  }

  function renderObjetivoRow(evaluacionId, o, index, soloLecturaDescripcion) {
    const groupName = 'obj_' + evaluacionId + '_' + index;
    const onchangeJs = `App.editarObjetivo('${evaluacionId}',${index},'calificacion',this.value)`;
    return `
    <div class="objetivo-row" data-idx="${index}">
      <div class="objetivo-num">#${index + 1}</div>
      <div class="objetivo-fields">
        <textarea placeholder="Descripción del objetivo" ${soloLecturaDescripcion ? 'disabled' : ''} onchange="App.editarObjetivo('${evaluacionId}',${index},'descripcion',this.value)">${esc(o.descripcion)}</textarea>
        <textarea placeholder="Resultado obtenido" ${soloLecturaDescripcion ? 'disabled' : ''} onchange="App.editarObjetivo('${evaluacionId}',${index},'resultado',this.value)">${esc(o.resultado)}</textarea>
        ${ratingWidget(groupName, o.calificacion, onchangeJs, false, true)}
      </div>
      <button class="btn btn-outline btn-sm" onclick="App.quitarObjetivo('${evaluacionId}',${index})">Quitar</button>
    </div>`;
  }

  function renderResumenAuto(ev) {
    const secciones = ['actitud', 'habilidades', 'conocimientos'];
    const objetivos = S.getObjetivos(ev.id).filter((o) => o.descripcion && o.descripcion.trim());
    return `
    <p class="muted">Revisa tus respuestas antes de enviar. El resultado y la comparación con tu líder se mostrarán más adelante, en la fase de retroalimentación.</p>
    ${secciones.map((s) => {
      const resp = S.getRespuestasPorSeccion(ev.id)[s];
      const map = {}; resp.forEach((r) => map[r.competenciaId] = r.valor);
      return `<div class="resumen-seccion"><h4>${labelSeccion(s)}</h4><table class="table table-compact"><tbody>
        ${D.COMPETENCIAS[s].map((c) => `<tr><td>${esc(c.nombre)}</td><td class="text-right">${map[c.id] !== undefined ? esc(map[c.id]) : '<span class="muted">Sin responder</span>'}</td></tr>`).join('')}
      </tbody></table></div>`;
    }).join('')}
    <div class="resumen-seccion"><h4>D. Cumplimiento de Objetivos</h4>
      ${objetivos.length ? `<table class="table table-compact"><tbody>${objetivos.map((o) => `<tr><td>${esc(o.descripcion)}</td><td class="text-right">${esc(o.calificacion)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No se registraron objetivos.</p>'}
    </div>`;
  }

  function viewRetroalimentacion(col, periodoId, estado) {
    if (estado !== D.ESTADOS.RETRO_PENDIENTE && estado !== D.ESTADOS.CERRADA) {
      return `<div class="card"><h2>Retroalimentación</h2><p class="muted">Tu retroalimentación aún no está disponible. Estado actual: ${badge(estado)}</p></div>`;
    }
    const cal = S.getCalibracion(col.empleado, periodoId);
    const liderEval = S.getEvaluacion(col.empleado, periodoId, 'lider');
    const resultadoLider = S.getUltimoResultadoPorOrigen(col.empleado, periodoId, 'lider');
    const totalFinal = cal ? cal.resultadoCalibrado : (resultadoLider ? resultadoLider.puntajes.total : null);
    const nivel = C.clasificarNivel(totalFinal);
    const cuad = C.asignarCuadrante(resultadoLider ? resultadoLider.promedios.actitud : null, resultadoLider ? resultadoLider.promedios.desempeno : null);
    const areas = S.getAreasOportunidad(col.empleado, periodoId);
    const planes = S.getPlanesDesarrollo(col.empleado, periodoId);
    const evidencias = S.getEvidencias(col.empleado, periodoId);
    const acciones = S.getAcciones(col.empleado, periodoId);

    return `
    <div class="card">
      <h2>Retroalimentación — ${esc(state.periodo.nombre)}</h2>
      <div class="resultado-final">
        <div class="resultado-num" style="color:${nivel.color}">${f1(totalFinal)}</div>
        <div>${badge(nivel.nivel, null)}<div class="muted">Puntaje final sobre 100</div></div>
      </div>
      ${progressBar(totalFinal, nivel.color)}
      ${cuad.info ? renderCuadranteInfo(cuad) : '<p class="muted">Cuadrante 9-box no disponible.</p>'}
      <h3>Fortalezas</h3><p>${esc(liderEval ? liderEval.fortalezas : '') || '<span class="muted">Sin registrar.</span>'}</p>
      <h3>Áreas de oportunidad y plan de mejora</h3>
      ${areas.length ? `<table class="table"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th></tr></thead><tbody>${areas.map((a) => `<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Sin áreas registradas.</p>'}
      <h3>Plan de desarrollo</h3>
      ${renderPlanesTabla(planes)}
      <h3>Cronograma de seguimiento (6 semanas)</h3>
      ${acciones.length ? renderGantt(acciones) : '<p class="muted">Aún no se genera cronograma.</p>'}
      <h3>Comentarios del líder</h3><p>${esc(liderEval ? liderEval.comentarios : '') || '<span class="muted">Sin comentarios.</span>'}</p>
      <h3>Evidencias</h3>
      <ul class="evidencias-list">${evidencias.map((e) => `<li>${esc(e.nombreArchivo)} <span class="muted">(${esc(e.tipo)}, ${esc(e.fecha)}, ${esc(e.usuario)})</span></li>`).join('') || '<li class="muted">Sin evidencias cargadas.</li>'}</ul>
      <div class="actions">
        <button class="btn btn-outline" onclick="App.cargarEvidencia('${col.empleado}','${periodoId}')">Simular carga de evidencia</button>
        ${estado === D.ESTADOS.RETRO_PENDIENTE ? `<button class="btn btn-primary" ${evidencias.length ? '' : 'disabled title="Carga al menos una evidencia antes de aceptar"'} onclick="App.aceptar('${col.empleado}','${periodoId}')">Aceptar resultado</button>` : badge('Resultado aceptado el ' + (cal ? cal.fechaAceptacion : ''), 'green')}
      </div>
    </div>`;
  }

  function renderCuadranteInfo(cuad) {
    const icono = (global.EDDIcons && global.EDDIcons.SVG[cuad.cuadrante]) || '';
    return `<div class="cuadrante-box" style="border-color:${cuad.info.color}">
      <div class="cuadrante-icon">${icono}</div>
      <div class="cuadrante-body">
        <div class="cuadrante-title-row">
          <div class="cuadrante-num" style="background:${cuad.info.color}">${cuad.cuadrante}</div>
          <strong>${esc(cuad.info.nombre)}</strong> — <span class="muted">Prioridad: ${esc(cuad.info.prioridad)}</span>
        </div>
        <p>${esc(cuad.info.significado)}</p>
        <p><strong>Acción sugerida:</strong> ${esc(cuad.info.accion)}</p>
        <p class="muted">Seguimiento: ${esc(cuad.info.seguimiento)}</p>
      </div>
    </div>`;
  }

  function renderPlanesTabla(planes) {
    if (!planes.length) return '<p class="muted">Sin acciones de desarrollo registradas.</p>';
    return `<table class="table"><thead><tr><th>Competencia</th><th>Acción</th><th>Responsable</th><th>Fecha compromiso</th><th>Estado</th><th>Evidencia</th></tr></thead><tbody>
      ${planes.map((p) => `<tr><td>${esc(p.competencia)}</td><td>${esc(p.accion)}</td><td>${esc(p.responsable)}</td><td>${esc(p.fechaCompromiso)}</td><td>${badge(p.estado)}</td><td>${esc(p.evidencia) || '—'}</td></tr>`).join('')}
    </tbody></table>`;
  }

  function renderGantt(acciones) {
    const semanas = [1, 2, 3, 4, 5, 6];
    return `<div class="gantt">
      <div class="gantt-header"><div class="gantt-label">Acción</div>${semanas.map((s) => `<div class="gantt-col">S${s}</div>`).join('')}<div class="gantt-col">Avance</div></div>
      ${acciones.map((a) => `<div class="gantt-row">
        <div class="gantt-label">${esc(a.accion)} <span class="muted">(${esc(a.responsable)})</span></div>
        ${semanas.map((s) => `<div class="gantt-col ${s >= a.semanaInicio && s <= a.semanaFin ? 'gantt-active gantt-' + estadoClase(a.estado) : ''}"></div>`).join('')}
        <div class="gantt-col">${badge(a.estado)} ${a.avance}%</div>
      </div>`).join('')}
    </div>`;
  }
  function estadoClase(estado) {
    return { 'No iniciada': 'gray', 'En proceso': 'yellow', 'Completada': 'green', 'Vencida': 'red' }[estado] || 'gray';
  }

  // =========================================================================
  // PORTAL LÍDER
  // =========================================================================
  function renderLider(page, param) {
    const lider = S.getLider(state.user.empleado);
    const periodoId = state.periodo.id;
    if (page === 'evaluar' && param) return viewLiderEvaluar(lider, param, periodoId);
    if (page === 'comparacion' && param) return viewComparacion(lider, param, periodoId);
    return viewLiderDashboard(lider, periodoId);
  }

  function viewLiderDashboard(lider, periodoId) {
    const equipo = S.getColaboradoresDeLider(lider.empleado);
    const filas = equipo.map((c) => {
      const estado = S.estadoProceso(c.empleado, periodoId);
      const autoEval = S.getEvaluacion(c.empleado, periodoId, 'autoevaluacion');
      const liderEval = S.getEvaluacion(c.empleado, periodoId, 'lider');
      return { c, estado, autoEval, liderEval };
    });
    const total = filas.length;
    const completadas = filas.filter((f) => f.estado === D.ESTADOS.CERRADA).length;
    const pendientesLider = filas.filter((f) => f.estado === D.ESTADOS.PENDIENTE_LIDER).length;
    const pendientesRetro = filas.filter((f) => f.estado === D.ESTADOS.RETRO_PENDIENTE).length;
    const vencidas = filas.filter((f) => (!f.autoEval || f.autoEval.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteAutoevaluacion)).length
      + filas.filter((f) => f.autoEval && f.autoEval.estado === D.ESTADOS.COMPLETADA && (!f.liderEval || f.liderEval.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteLider)).length;
    const avance = total ? pct((completadas / total) * 100) : 0;

    return `
    <div class="kpi-grid">
      ${kpi('Colaboradores', total)}
      ${kpi('Evaluaciones pendientes (líder)', pendientesLider, vencidas ? 'red' : 'yellow')}
      ${kpi('Completadas', completadas, 'green')}
      ${kpi('Pendientes de retroalimentación', pendientesRetro, 'yellow')}
      ${kpi('Avance del equipo', avance + '%', 'blue')}
      ${kpi('Alertas por vencimiento', vencidas, vencidas ? 'red' : 'gray')}
    </div>
    <div class="card">
      <h2>Equipo — ${esc(lider.area)}</h2>
      <table class="table">
        <thead><tr><th>Nombre</th><th>Puesto</th><th>Área</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Retroalimentación</th><th></th></tr></thead>
        <tbody>
        ${filas.map((f) => {
          const eAuto = !f.autoEval ? 'No iniciada' : f.autoEval.estado;
          const eLider = !f.liderEval ? 'No iniciada' : f.liderEval.estado;
          const eRetro = [D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(f.estado) ? f.estado : (f.estado === D.ESTADOS.CALIBRADA ? 'Calibrada' : 'Pendiente');
          let accion = '';
          if (f.estado === D.ESTADOS.PENDIENTE_LIDER) accion = `<a class="btn btn-primary btn-sm" href="#/lider/evaluar/${f.c.empleado}">Evaluar</a>`;
          else if ([D.ESTADOS.PENDIENTE_CALIBRACION, D.ESTADOS.CALIBRADA, D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(f.estado)) accion = `<a class="btn btn-outline btn-sm" href="#/lider/comparacion/${f.c.empleado}">Ver comparación</a>`;
          else accion = `<span class="muted">Sin acción disponible</span>`;
          return `<tr><td>${esc(f.c.nombre)}</td><td>${esc(f.c.puesto)}</td><td>${esc(f.c.area)}</td><td>${badge(eAuto)}</td><td>${badge(eLider)}</td><td>${badge(eRetro)}</td><td>${accion}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;
  }
  function kpi(label, value, color) {
    return `<div class="kpi-card"><div class="kpi-value ${color ? 'kpi-' + color : ''}">${value}</div><div class="kpi-label">${esc(label)}</div></div>`;
  }

  function viewLiderEvaluar(lider, colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    const autoEval = S.getEvaluacion(colaboradorId, periodoId, 'autoevaluacion');
    if (!autoEval || autoEval.estado !== D.ESTADOS.COMPLETADA) {
      return `<div class="card"><h2>${esc(col.nombre)}</h2><p class="muted">El colaborador aún no completa su autoevaluación. No es posible iniciar la evaluación del líder todavía.</p><a class="btn btn-outline" href="#/lider/dashboard">Volver</a></div>`;
    }
    const ev = S.getOrCreateEvaluacion(colaboradorId, lider.empleado, periodoId, 'lider');
    if (ev.estado === D.ESTADOS.COMPLETADA) return viewComparacion(lider, colaboradorId, periodoId);

    if (state.wizard.evaluacionId !== ev.id) state.wizard = { seccionIdx: 0, evaluacionId: ev.id, tipo: 'lider', colaboradorId, liderId: lider.empleado };
    const idx = state.wizard.seccionIdx;
    const seccion = SECCIONES_WIZARD[idx];
    const stepsHtml = SECCIONES_WIZARD.map((s, i) => `<div class="wizard-step ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}">${i + 1}. ${labelSeccion(s === 'resumen' ? 'resumen' : s)}</div>`).join('');

    let contenido = '';
    if (seccion === 'objetivos') contenido = renderObjetivosLider(ev, autoEval);
    else if (seccion === 'resumen') contenido = renderResumenLider(ev, col);
    else contenido = renderSeccionForm(ev, seccion, false);

    return `
    <div class="card">
      <h2>Evaluación de ${esc(col.nombre)}</h2>
      <div class="info-grid">
        <div><span class="label">Puesto</span><span class="value">${esc(col.puesto)}</span></div>
        <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
        <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
        <div><span class="label">Periodo</span><span class="value">${esc(state.periodo.nombre)}</span></div>
      </div>
      <p class="alert alert-info">La autoevaluación del colaborador permanecerá oculta hasta que envíes tu evaluación.</p>
    </div>
    <div class="card wizard-card">
      <div class="wizard-steps">${stepsHtml}</div>
      <h2>${labelSeccion(seccion)}</h2>
      ${contenido}
      <div class="wizard-nav">
        <button class="btn btn-outline" ${idx === 0 ? 'disabled' : ''} onclick="App.wizardPrev()">Anterior</button>
        ${seccion === 'resumen'
          ? `<label class="confirm-check"><input type="checkbox" id="confirmEnvioLider"/> Confirmo que la evaluación está completa.</label>
             <button class="btn btn-primary" onclick="App.enviarEvaluacionLider('${colaboradorId}')">Enviar evaluación</button>`
          : `<button class="btn btn-primary" onclick="App.wizardNext('${seccion}')">Siguiente</button>`}
      </div>
    </div>`;
  }

  function renderObjetivosLider(ev, autoEval) {
    const objetivosAuto = S.getObjetivos(autoEval.id).filter((o) => o.descripcion && o.descripcion.trim());
    const objetivosLider = S.getObjetivos(ev.id);
    const mapLider = {}; objetivosLider.forEach((o) => mapLider[o.index] = o);
    if (!objetivosAuto.length) return '<p class="muted">El colaborador no registró objetivos en este periodo.</p>';
    return `
    <p class="muted">Califica el cumplimiento de cada objetivo declarado por el colaborador.</p>
    ${objetivosAuto.map((o, i) => {
      const calif = mapLider[i] ? mapLider[i].calificacion : '';
      const groupName = 'objl_' + ev.id + '_' + i;
      const descEsc = esc(o.descripcion).replace(/'/g, "\\'");
      const resEsc = esc(o.resultado).replace(/'/g, "\\'");
      const onchangeJs = `App.editarObjetivoLider('${ev.id}',${i},'${descEsc}','${resEsc}',this.value)`;
      return `<div class="objetivo-row">
        <div class="objetivo-num">#${i + 1}</div>
        <div class="objetivo-fields">
          <div class="objetivo-lectura"><strong>Objetivo:</strong> ${esc(o.descripcion)}</div>
          <div class="objetivo-lectura"><strong>Resultado:</strong> ${esc(o.resultado)}</div>
          ${ratingWidget(groupName, calif, onchangeJs, false, true)}
        </div>
      </div>`;
    }).join('')}`;
  }

  function renderResumenLider(ev, col) {
    return `
    <p class="muted">Registra retroalimentación cualitativa. Estos campos se mostrarán al colaborador cuando RH habilite la fase de retroalimentación.</p>
    <div class="form-group"><label>Fortalezas del colaborador</label><textarea onchange="App.setFortalezas('${ev.id}',this.value)">${esc(ev.fortalezas)}</textarea></div>
    <div class="form-group"><label>Comentarios generales</label><textarea onchange="App.setComentarios('${ev.id}',this.value)">${esc(ev.comentarios)}</textarea></div>
    <h4>Áreas de oportunidad y plan de mejora</h4>
    <div id="areasWrap">${renderAreasEditable(col.empleado, state.periodo.id)}</div>
    <button class="btn btn-outline btn-sm" onclick="App.agregarAreaOportunidad('${col.empleado}')">+ Agregar área de oportunidad</button>
    <h4>Plan de desarrollo</h4>
    <div id="planesWrap">${renderPlanesEditable(col.empleado, state.periodo.id, col.liderId)}</div>
    <button class="btn btn-outline btn-sm" onclick="App.agregarPlanDesarrollo('${col.empleado}','${col.liderId}')">+ Agregar acción de desarrollo</button>
    `;
  }

  function renderAreasEditable(colaboradorId, periodoId) {
    const areas = S.getAreasOportunidad(colaboradorId, periodoId);
    if (!areas.length) return '<p class="muted">Sin áreas registradas todavía.</p>';
    return `<table class="table table-compact"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th><th></th></tr></thead><tbody>
      ${areas.map((a) => `<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td><td><button class="btn btn-outline btn-sm" onclick="App.quitarAreaOportunidad('${a.id}','${colaboradorId}')">Quitar</button></td></tr>`).join('')}
    </tbody></table>`;
  }
  function renderPlanesEditable(colaboradorId, periodoId) {
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
    if (!planes.length) return '<p class="muted">Sin acciones registradas todavía.</p>';
    return `<table class="table table-compact"><thead><tr><th>Competencia</th><th>Acción</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>
      ${planes.map((p) => `<tr><td>${esc(p.competencia)}</td><td>${esc(p.accion)}</td><td>${esc(p.fechaCompromiso)}</td><td>${badge(p.estado)}</td><td><button class="btn btn-outline btn-sm" onclick="App.quitarPlanDesarrollo('${p.id}','${colaboradorId}')">Quitar</button></td></tr>`).join('')}
    </tbody></table>`;
  }

  function viewComparacion(lider, colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    const autoEval = S.getEvaluacion(colaboradorId, periodoId, 'autoevaluacion');
    const liderEval = S.getEvaluacion(colaboradorId, periodoId, 'lider');
    if (!autoEval || !liderEval || autoEval.estado !== D.ESTADOS.COMPLETADA || liderEval.estado !== D.ESTADOS.COMPLETADA) {
      return `<div class="card"><h2>Comparación</h2><p class="muted">Ambas evaluaciones deben estar completas para ver la comparación.</p></div>`;
    }
    const respAuto = S.getRespuestasPorSeccion(autoEval.id);
    const respLider = S.getRespuestasPorSeccion(liderEval.id);
    const filas = [];
    ['actitud', 'habilidades', 'conocimientos'].forEach((sec) => {
      D.COMPETENCIAS[sec].forEach((c) => {
        const ra = respAuto[sec].find((r) => r.competenciaId === c.id);
        const rl = respLider[sec].find((r) => r.competenciaId === c.id);
        filas.push({ nombre: c.nombre, auto: ra ? ra.valor : null, lider: rl ? rl.valor : null, comentarioLider: rl ? rl.comentario : '', comentarioAuto: ra ? ra.comentario : '' });
      });
    });
    const objAuto = S.getObjetivos(autoEval.id).filter((o) => o.descripcion && o.descripcion.trim());
    const objLider = S.getObjetivos(liderEval.id);
    const avgObjAuto = C.promedioValido(objAuto.map((o) => o.calificacion));
    const avgObjLider = C.promedioValido(objLider.map((o) => o.calificacion));
    filas.push({ nombre: 'D. Cumplimiento de Objetivos (promedio)', auto: avgObjAuto !== null ? C.round1(avgObjAuto) : 'N/A', lider: avgObjLider !== null ? C.round1(avgObjLider) : 'N/A', comentarioLider: '', comentarioAuto: '' });

    const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'lider');
    const cuad = C.asignarCuadrante(resLider.promedios.actitud, resLider.promedios.desempeno);
    const estado = S.estadoProceso(colaboradorId, periodoId);

    return `
    <div class="card">
      <h2>Comparación — ${esc(col.nombre)}</h2>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Puntaje autoevaluación', f1(resAuto.puntajes.total))}
        ${kpi('Puntaje evaluación líder', f1(resLider.puntajes.total))}
        ${kpi('Diferencia', f1(resAuto.puntajes.total - resLider.puntajes.total))}
      </div>
      <table class="table">
        <thead><tr><th>Competencia</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Diferencia</th><th>Brecha</th><th>Comentario líder</th><th>Comentario colaborador</th></tr></thead>
        <tbody>
        ${filas.map((f) => {
          const na = f.auto === 'N/A' || f.lider === 'N/A' || f.auto === null || f.lider === null;
          const diff = na ? null : (Number(f.lider) - Number(f.auto));
          const brecha = na ? { etiqueta: 'Sin datos', color: '#6c757d' } : C.clasificarBrecha(diff);
          const rowClass = na ? '' : (diff > 0 ? 'row-lider-mayor' : (diff < 0 ? 'row-auto-mayor' : ''));
          return `<tr class="${rowClass}"><td>${esc(f.nombre)}</td><td>${esc(f.auto)}</td><td>${esc(f.lider)}</td><td>${na ? '—' : (diff > 0 ? '+' : '') + f1(diff)}</td><td>${badge(brecha.etiqueta, brecha.etiqueta === 'Alineada' ? 'green' : (brecha.etiqueta === 'Revisar' ? 'yellow' : (brecha.etiqueta === 'Sin datos' ? 'gray' : 'red')))}</td><td>${esc(f.comentarioLider)}</td><td>${esc(f.comentarioAuto)}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
      ${cuad.info ? renderCuadranteInfo(cuad) : ''}
      <p class="muted">Estado actual del proceso: ${badge(estado)}. La calibración y liberación de retroalimentación las gestiona el administrador de RH.</p>
    </div>`;
  }

  // =========================================================================
  // PORTAL ADMINISTRADOR
  // =========================================================================
  function renderAdmin(page, param) {
    const periodoId = state.periodo.id;
    if (page === 'calibracion') return param ? viewCalibracionDetalle(param, periodoId) : viewCalibracionLista(periodoId);
    if (page === '9box') return view9BoxAdmin(periodoId);
    if (page === 'auditoria') return viewAuditoria();
    if (page === 'config') return viewConfig();
    return viewAdminDashboard(periodoId);
  }

  function datosGlobales(periodoId) {
    const colaboradores = S.getTodosColaboradores();
    return colaboradores.map((c) => {
      const estado = S.estadoProceso(c.empleado, periodoId);
      const resLider = S.getUltimoResultadoPorOrigen(c.empleado, periodoId, 'lider');
      const cal = S.getCalibracion(c.empleado, periodoId);
      const totalFinal = cal ? cal.resultadoCalibrado : (resLider ? resLider.puntajes.total : null);
      const nivel = C.clasificarNivel(totalFinal);
      const cuad = resLider ? C.asignarCuadrante(resLider.promedios.actitud, resLider.promedios.desempeno) : { cuadrante: null, info: null };
      return { c, estado, totalFinal, nivel, cuad };
    });
  }

  function viewAdminDashboard(periodoId) {
    const datos = datosGlobales(periodoId);
    const total = datos.length;
    const autoCompletadas = datos.filter((d) => S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion') && S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion').estado === D.ESTADOS.COMPLETADA).length;
    const liderCompletadas = datos.filter((d) => S.getEvaluacion(d.c.empleado, periodoId, 'lider') && S.getEvaluacion(d.c.empleado, periodoId, 'lider').estado === D.ESTADOS.COMPLETADA).length;
    const calibradas = datos.filter((d) => S.getCalibracion(d.c.empleado, periodoId)).length;
    const cerradas = datos.filter((d) => d.estado === D.ESTADOS.CERRADA).length;
    const vencidas = datos.filter((d) => {
      const auto = S.getEvaluacion(d.c.empleado, periodoId, 'autoevaluacion');
      return (!auto || auto.estado !== D.ESTADOS.COMPLETADA) && esVencido(state.periodo.fechaLimiteAutoevaluacion);
    }).length;
    const avanceNacional = total ? pct((cerradas / total) * 100) : 0;
    const promedios = datos.filter((d) => d.totalFinal !== null).map((d) => d.totalFinal);
    const promedioGeneral = promedios.length ? promedios.reduce((a, b) => a + b, 0) / promedios.length : null;

    const filtros = state.adminFiltros;
    const areas = [...new Set(datos.map((d) => d.c.area))];
    const filtrados = datos.filter((d) => (!filtros.area || d.c.area === filtros.area) && (!filtros.estado || d.estado === filtros.estado) && (!filtros.cuadrante || String(d.cuad.cuadrante) === filtros.cuadrante));

    // Avance por área
    const avancePorArea = areas.map((a) => {
      const arr = datos.filter((d) => d.c.area === a);
      const cerr = arr.filter((d) => d.estado === D.ESTADOS.CERRADA).length;
      return { area: a, pct: arr.length ? pct((cerr / arr.length) * 100) : 0, total: arr.length };
    });

    // Distribución de niveles
    const nivelesCount = {};
    D.REFERENCIA_NIVELES.forEach((n) => nivelesCount[n.nivel] = 0);
    datos.forEach((d) => { if (d.totalFinal !== null) nivelesCount[d.nivel.nivel] = (nivelesCount[d.nivel.nivel] || 0) + 1; });

    // Distribución por cuadrante
    const cuadranteCount = {}; for (let i = 1; i <= 9; i++) cuadranteCount[i] = 0;
    datos.forEach((d) => { if (d.cuad.cuadrante) cuadranteCount[d.cuad.cuadrante]++; });

    // Ranking de áreas con mayor rezago (menor avance primero)
    const ranking = avancePorArea.slice().sort((a, b) => a.pct - b.pct);

    return `
    <div class="kpi-grid">
      ${kpi('Personal a evaluar', total)}
      ${kpi('Autoevaluaciones completadas', autoCompletadas)}
      ${kpi('Evaluaciones de líder completadas', liderCompletadas)}
      ${kpi('Calibradas', calibradas, 'blue')}
      ${kpi('Cerradas', cerradas, 'green')}
      ${kpi('Vencidas', vencidas, vencidas ? 'red' : 'gray')}
      ${kpi('Avance nacional', avanceNacional + '%', 'blue')}
      ${kpi('Promedio general', f1(promedioGeneral))}
    </div>

    <div class="card">
      <h2>Avance por área</h2>
      ${avancePorArea.map((a) => `<div class="bar-row"><span class="bar-label">${esc(a.area)} (${a.total})</span>${progressBar(a.pct)}</div>`).join('')}
    </div>

    <div class="two-col">
      <div class="card">
        <h2>Distribución de calificaciones</h2>
        ${Object.keys(nivelesCount).map((n) => `<div class="bar-row"><span class="bar-label">${esc(n)}</span>${progressBar(total ? (nivelesCount[n] / total) * 100 : 0)}<span class="bar-count">${nivelesCount[n]}</span></div>`).join('')}
      </div>
      <div class="card">
        <h2>Distribución por cuadrante</h2>
        ${Object.keys(cuadranteCount).map((n) => `<div class="bar-row"><span class="bar-icon-mini">${(global.EDDIcons && global.EDDIcons.SVG[n]) || ''}</span><span class="bar-label">${n}. ${esc(C.CUADRANTES_INFO[n].nombre)}</span>${progressBar(total ? (cuadranteCount[n] / total) * 100 : 0, C.CUADRANTES_INFO[n].color)}<span class="bar-count">${cuadranteCount[n]}</span></div>`).join('')}
      </div>
    </div>

    <div class="card">
      <h2>Ranking de áreas con mayor rezago</h2>
      <table class="table"><thead><tr><th>#</th><th>Área</th><th>Avance</th></tr></thead><tbody>
      ${ranking.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.area)}</td><td>${r.pct}%</td></tr>`).join('')}
      </tbody></table>
    </div>

    <div class="card">
      <h2>Tabla de pendientes</h2>
      <div class="filters-bar">
        <select onchange="App.setFiltroAdmin('area', this.value)"><option value="">Todas las áreas</option>${areas.map((a) => `<option value="${a}" ${filtros.area === a ? 'selected' : ''}>${a}</option>`).join('')}</select>
        <select onchange="App.setFiltroAdmin('estado', this.value)"><option value="">Todos los estados</option>${Object.values(D.ESTADOS).map((e) => `<option value="${e}" ${filtros.estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select>
        <select onchange="App.setFiltroAdmin('cuadrante', this.value)"><option value="">Todos los cuadrantes</option>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<option value="${n}" ${filtros.cuadrante === String(n) ? 'selected' : ''}>${n}. ${C.CUADRANTES_INFO[n].nombre}</option>`).join('')}</select>
        <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosAdmin()">Limpiar filtros</button>
      </div>
      <table class="table"><thead><tr><th>Nombre</th><th>Área</th><th>Líder</th><th>Estado</th><th>Puntaje</th><th>Cuadrante</th><th></th></tr></thead><tbody>
      ${filtrados.map((d) => {
        const lider = S.getLider(d.c.liderId);
        let accion = '';
        if ([D.ESTADOS.PENDIENTE_CALIBRACION, D.ESTADOS.CALIBRADA, D.ESTADOS.RETRO_PENDIENTE].includes(d.estado)) accion = `<a class="btn btn-primary btn-sm" href="#/admin/calibracion/${d.c.empleado}">Calibrar</a>`;
        return `<tr><td>${esc(d.c.nombre)}</td><td>${esc(d.c.area)}</td><td>${esc(lider ? lider.nombre : '—')}</td><td>${badge(d.estado)}</td><td>${f1(d.totalFinal)}</td><td>${d.cuad.cuadrante ? d.cuad.cuadrante + '. ' + esc(d.cuad.info.nombre) : '—'}</td><td>${accion}</td></tr>`;
      }).join('')}
      </tbody></table>
    </div>

    <div class="card">
      <h2>Alertas</h2>
      <ul class="alertas-list">
        ${vencidas ? `<li class="alert alert-danger">${vencidas} colaborador(es) con autoevaluación vencida (límite ${state.periodo.fechaLimiteAutoevaluacion}).</li>` : ''}
        ${datos.filter((d) => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION).length ? `<li class="alert alert-warning">${datos.filter((d) => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION).length} evaluación(es) esperando calibración de RH.</li>` : ''}
        ${!vencidas && !datos.filter((d) => d.estado === D.ESTADOS.PENDIENTE_CALIBRACION).length ? '<li class="muted">Sin alertas activas.</li>' : ''}
      </ul>
    </div>`;
  }

  function viewCalibracionLista(periodoId) {
    const datos = datosGlobales(periodoId).filter((d) => [D.ESTADOS.PENDIENTE_CALIBRACION, D.ESTADOS.CALIBRADA, D.ESTADOS.RETRO_PENDIENTE, D.ESTADOS.CERRADA].includes(d.estado));
    return `<div class="card"><h2>Calibración de RH</h2>
    <table class="table"><thead><tr><th>Colaborador</th><th>Área</th><th>Estado</th><th>Puntaje</th><th></th></tr></thead><tbody>
    ${datos.map((d) => `<tr><td>${esc(d.c.nombre)}</td><td>${esc(d.c.area)}</td><td>${badge(d.estado)}</td><td>${f1(d.totalFinal)}</td><td><a class="btn btn-outline btn-sm" href="#/admin/calibracion/${d.c.empleado}">Abrir</a></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No hay evaluaciones pendientes de calibración.</td></tr>'}
    </tbody></table></div>`;
  }

  function viewCalibracionDetalle(colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'lider');
    if (!resAuto || !resLider) return `<div class="card"><h2>${esc(col.nombre)}</h2><p class="muted">Aún no existen ambas evaluaciones completas para calibrar.</p></div>`;
    const cal = S.getCalibracion(colaboradorId, periodoId) || { ajuste: 0, justificacion: '', actas: 0, nom035: '', observacionesRH: '', retroHabilitada: false, aceptacionColaborador: false, historial: [] };
    const diferencia = C.round1(resAuto.puntajes.total - resLider.puntajes.total);
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);

    return `
    <div class="card">
      <h2>Calibración — ${esc(col.nombre)}</h2>
      <div class="info-grid">
        <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
        <div><span class="label">Ciudad operativa</span><span class="value">${esc(col.ciudad)}</span></div>
        <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
      </div>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Autoevaluación', f1(resAuto.puntajes.total))}
        ${kpi('Evaluación líder', f1(resLider.puntajes.total))}
        ${kpi('Diferencia', f1(diferencia))}
      </div>
      <div class="form-row">
        <div class="form-group"><label>Número de actas administrativas (simulado)</label><input type="number" min="0" id="calActas" value="${cal.actas || 0}"/></div>
        <div class="form-group"><label>Resultado / indicador NOM-035 (simulado)</label><input type="text" id="calNom035" value="${esc(cal.nom035 || '')}"/></div>
      </div>
      <p class="alert alert-info">Las actas administrativas y el indicador NOM-035 se muestran como alerta contextual. La metodología de descuento automático aún debe ser validada por RH; no se aplica ningún descuento definitivo en esta demo.</p>
      <div class="form-group"><label>Observaciones de RH</label><textarea id="calObs">${esc(cal.observacionesRH || '')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Ajuste al resultado (puntos, puede ser negativo)</label><input type="number" step="0.1" id="calAjuste" value="${cal.ajuste || 0}"/></div>
        <div class="form-group"><label>Resultado calibrado</label><input type="text" id="calResultadoPreview" value="${f1((cal.resultadoCalibrado !== undefined ? cal.resultadoCalibrado : resLider.puntajes.total))}" disabled/></div>
      </div>
      <div class="form-group"><label>Justificación ${'<span class="muted">(obligatoria si el ajuste es distinto de 0)</span>'}</label><textarea id="calJustificacion">${esc(cal.justificacion || '')}</textarea></div>
      <div class="actions">
        <button class="btn btn-primary" onclick="App.guardarCalibracion('${colaboradorId}','${periodoId}',${resLider.puntajes.total})">Guardar calibración</button>
        <button class="btn btn-outline" ${cal.resultadoCalibrado === undefined ? 'disabled' : ''} onclick="App.habilitarRetro('${colaboradorId}','${periodoId}')">${cal.retroHabilitada ? 'Retroalimentación habilitada' : 'Habilitar retroalimentación'}</button>
      </div>
      ${planes.length < 1 ? '<p class="muted">Nota: si el resultado calibrado es menor a 80, se exigirá al menos un plan de desarrollo antes de habilitar la retroalimentación.</p>' : ''}
      <h3>Trazabilidad de cambios</h3>
      <table class="table table-compact"><thead><tr><th>Campo</th><th>Valor anterior</th><th>Valor nuevo</th><th>Motivo</th><th>Usuario</th><th>Fecha</th><th>Hora</th></tr></thead><tbody>
      ${(cal.historial || []).slice().reverse().map((h) => `<tr><td>${esc(h.campo)}</td><td>${esc(JSON.stringify(h.valorAnterior))}</td><td>${esc(JSON.stringify(h.valorNuevo))}</td><td>${esc(h.motivo)}</td><td>${esc(h.usuario)}</td><td>${esc(h.fecha)}</td><td>${esc(h.hora)}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Sin cambios registrados.</td></tr>'}
      </tbody></table>
    </div>`;
  }

  function view9BoxAdmin(periodoId) {
    const datos = datosGlobales(periodoId).filter((d) => d.cuad.cuadrante);
    const grid = [];
    for (let fila = 3; fila >= 1; fila--) {
      const cols = [];
      for (let col = 1; col <= 3; col++) {
        const nDesempeno = col; const nActitud = fila;
        const numero = (nDesempeno - 1) * 3 + nActitud;
        const info = C.CUADRANTES_INFO[numero];
        const ocupantes = datos.filter((d) => d.cuad.cuadrante === numero);
        const icono = (global.EDDIcons && global.EDDIcons.SVG[numero]) || '';
        cols.push(`<div class="ninebox-cell" style="border-color:${info.color}" onclick="App.selNinebox(${numero})">
          <div class="ninebox-cell-icon">${icono}</div>
          <div class="ninebox-cell-title">${numero}. ${esc(info.nombre)}</div>
          <div class="ninebox-markers">${ocupantes.map((o) => `<span class="ninebox-marker" title="${esc(o.c.nombre)}" style="background:${info.color}">${esc(iniciales(o.c.nombre))}</span>`).join('')}</div>
        </div>`);
      }
      grid.push(`<div class="ninebox-row">${cols.join('')}</div>`);
    }
    const sel = state.nineboxSel ? C.CUADRANTES_INFO[state.nineboxSel] : null;
    const ocupSel = sel ? datos.filter((d) => d.cuad.cuadrante === state.nineboxSel) : [];
    return `
    <div class="card">
      <h2>Matriz 9-Box</h2>
      <div class="ninebox-axes"><div class="axis-y">ACTITUD ▲</div></div>
      <div class="ninebox-grid">${grid.join('')}</div>
      <div class="axis-x">DESEMPEÑO ►</div>
      <p class="muted">Umbrales configurables (ver calculations.js → CONFIG_9BOX): nivel 1 hasta ${C.CONFIG_9BOX.nivel1Max}, nivel 2 hasta ${C.CONFIG_9BOX.nivel2Max}, nivel 3 hasta ${C.CONFIG_9BOX.nivel3Max}. Deben ser validados por RH antes de producción.</p>
      ${sel ? `<div class="cuadrante-detail">${renderCuadranteInfo({ cuadrante: state.nineboxSel, info: sel })}<h4>Colaboradores en este cuadrante</h4><ul>${ocupSel.map((o) => `<li>${esc(o.c.nombre)} — ${esc(o.c.area)} (${f1(o.totalFinal)} pts)</li>`).join('') || '<li class="muted">Sin colaboradores.</li>'}</ul></div>` : '<p class="muted">Haz clic en un cuadrante para ver el detalle.</p>'}
    </div>`;
  }
  function iniciales(nombre) { return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); }

  function viewAuditoria() {
    const db = S.load();
    return `<div class="card"><h2>Auditoría</h2>
    <table class="table"><thead><tr><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID</th><th>Fecha</th><th>Hora</th><th>Valor anterior</th><th>Valor nuevo</th></tr></thead><tbody>
    ${db.auditoria.slice(0, 200).map((a) => `<tr><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.entidad)}</td><td>${esc(a.entidadId)}</td><td>${esc(a.fecha)}</td><td>${esc(a.hora)}</td><td>${esc(a.valorAnterior)}</td><td>${esc(a.valorNuevo)}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function viewConfig() {
    const cfg = S.getConfiguracion();
    return `<div class="card">
      <h2>Configuración</h2>
      <h3>Umbrales de brecha (comparación auto vs. líder)</h3>
      <div class="form-row">
        <div class="form-group"><label>Alineada hasta</label><input type="number" step="0.01" id="cfgAlineada" value="${cfg.configBrecha.alineadaMax}"/></div>
        <div class="form-group"><label>Revisar hasta</label><input type="number" step="0.01" id="cfgRevisar" value="${cfg.configBrecha.revisarMax}"/></div>
      </div>
      <button class="btn btn-outline" onclick="App.guardarConfigBrecha()">Guardar umbrales</button>
      <h3 style="margin-top:24px">Reinicio de datos</h3>
      <p class="muted">Restaura todos los datos de la demo a su estado inicial (usuarios, evaluaciones, calibraciones, auditoría). Esta acción no se puede deshacer.</p>
      <button class="btn btn-danger" onclick="App.reiniciarDemo()">Reiniciar datos de la demo</button>
    </div>`;
  }

  // =========================================================================
  // ACCIONES (expuestas a los onclick del HTML)
  // =========================================================================
  const Actions = {
    logout,
    wizardNext(seccionActual) {
      if (seccionActual !== 'resumen') {
        const ev = { id: state.wizard.evaluacionId };
        const seccion = seccionActual;
        if (seccion !== 'objetivos') {
          const resp = S.getRespuestasPorSeccion(ev.id)[seccion];
          const totalReq = D.COMPETENCIAS[seccion].length;
          if (resp.length < totalReq) { alert('Debes calificar todas las competencias de esta sección antes de continuar.'); return; }
        } else {
          const objetivos = S.getObjetivos(ev.id).filter((o) => o.descripcion && o.descripcion.trim());
          if (!objetivos.length) { alert('Registra al menos un objetivo con descripción antes de continuar.'); return; }
          const sinDescripcion = S.getObjetivos(ev.id).some((o) => o.calificacion && (!o.descripcion || !o.descripcion.trim()));
          if (sinDescripcion) { alert('No puedes calificar un objetivo sin descripción.'); return; }
        }
      }
      state.wizard.seccionIdx = Math.min(state.wizard.seccionIdx + 1, SECCIONES_WIZARD.length - 1);
      render();
    },
    wizardPrev() { state.wizard.seccionIdx = Math.max(state.wizard.seccionIdx - 1, 0); render(); },
    rate(evaluacionId, seccion, competenciaId, valor) {
      const existentes = S.getRespuestas(evaluacionId);
      const actual = existentes.find((r) => r.competenciaId === competenciaId);
      S.saveRespuesta(evaluacionId, seccion, competenciaId, valor, actual ? actual.comentario : '');
    },
    comentar(evaluacionId, seccion, competenciaId, comentario) {
      const existentes = S.getRespuestas(evaluacionId);
      const actual = existentes.find((r) => r.competenciaId === competenciaId);
      S.saveRespuesta(evaluacionId, seccion, competenciaId, actual ? actual.valor : '', comentario);
    },
    agregarObjetivo(evaluacionId) {
      const objetivos = S.getObjetivos(evaluacionId);
      if (objetivos.length >= 5) return;
      S.saveObjetivo(evaluacionId, objetivos.length, '', '', '');
      render();
    },
    editarObjetivo(evaluacionId, index, campo, valor) {
      const objetivos = S.getObjetivos(evaluacionId);
      const o = objetivos.find((x) => x.index === index) || { descripcion: '', resultado: '', calificacion: '' };
      o[campo] = valor;
      S.saveObjetivo(evaluacionId, index, o.descripcion, o.resultado, o.calificacion);
    },
    quitarObjetivo(evaluacionId, index) { S.removeObjetivo(evaluacionId, index); render(); },
    enviarAutoevaluacion() {
      if (!$('#confirmEnvioAuto').checked) { alert('Confirma que la información es correcta antes de enviar.'); return; }
      const evaluacionId = state.wizard.evaluacionId;
      const objetivos = S.getObjetivos(evaluacionId).filter((o) => o.descripcion && o.descripcion.trim());
      if (!objetivos.length) { alert('Registra al menos un objetivo antes de enviar.'); return; }
      S.completarEvaluacion(evaluacionId, state.user.nombre);
      alert('Tu autoevaluación fue enviada correctamente. El proceso continúa con la evaluación de tu líder.');
      navigate('#/colaborador/inicio');
    },
    editarObjetivoLider(evaluacionId, index, descripcion, resultado, calificacion) {
      S.saveObjetivo(evaluacionId, index, descripcion, resultado, calificacion);
    },
    setFortalezas(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.fortalezas = valor; S.persist(); }
    },
    setComentarios(evaluacionId, valor) {
      const db = S.load(); const ev = db.evaluaciones.find((e) => e.id === evaluacionId); if (ev) { ev.comentarios = valor; S.persist(); }
    },
    agregarAreaOportunidad(colaboradorId) {
      const area = prompt('Área de oportunidad:'); if (!area) return;
      const plan = prompt('Plan de mejora:'); if (!plan) return;
      S.addAreaOportunidad(colaboradorId, state.periodo.id, area, plan, state.user.nombre);
      render();
    },
    quitarAreaOportunidad(id) { S.removeAreaOportunidad(id, state.user.nombre); render(); },
    agregarPlanDesarrollo(colaboradorId, liderId) {
      const competencia = prompt('Competencia a desarrollar:'); if (!competencia) return;
      const accion = prompt('Acción:'); if (!accion) return;
      const fecha = prompt('Fecha compromiso (AAAA-MM-DD):', '2026-09-01') || '2026-09-01';
      S.addPlanDesarrollo(colaboradorId, state.periodo.id, { competencia, accion, responsable: liderId, fechaCompromiso: fecha }, state.user.nombre);
      render();
    },
    quitarPlanDesarrollo(id) { S.removePlanDesarrollo(id, state.user.nombre); render(); },
    enviarEvaluacionLider(colaboradorId) {
      if (!$('#confirmEnvioLider').checked) { alert('Confirma que la evaluación está completa antes de enviar.'); return; }
      const evaluacionId = state.wizard.evaluacionId;
      S.completarEvaluacion(evaluacionId, state.user.nombre);
      navigate('#/lider/comparacion/' + colaboradorId);
    },
    cargarEvidencia(colaboradorId, periodoId) {
      const nombre = prompt('Nombre del archivo a cargar (simulado), ej. retroalimentacion_firmada.pdf:');
      if (!nombre) return;
      const tipo = prompt('Tipo (PDF firmado / Imagen / Documento de retroalimentación):', 'PDF firmado') || 'Documento';
      S.addEvidencia(colaboradorId, periodoId, nombre, tipo, state.user.nombre, '');
      render();
    },
    aceptar(colaboradorId, periodoId) {
      const evidencias = S.getEvidencias(colaboradorId, periodoId);
      if (!evidencias.length) { alert('Carga al menos una evidencia antes de aceptar el resultado.'); return; }
      S.aceptarResultado(colaboradorId, periodoId, state.user.nombre);
      render();
    },
    setFiltroAdmin(campo, valor) { state.adminFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosAdmin() { state.adminFiltros = {}; render(); },
    guardarCalibracion(colaboradorId, periodoId, totalLider) {
      const ajuste = parseFloat($('#calAjuste').value) || 0;
      const justificacion = $('#calJustificacion').value.trim();
      if (ajuste !== 0 && !justificacion) { alert('La justificación es obligatoria cuando existe un ajuste distinto de 0.'); return; }
      const resultadoCalibrado = C.round1(Math.max(0, Math.min(100, totalLider + ajuste)));
      const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
      S.crearOActualizarCalibracion(colaboradorId, periodoId, {
        resultadoAuto: resAuto.puntajes.total, resultadoLider: totalLider,
        diferenciaGeneral: C.round1(resAuto.puntajes.total - totalLider),
        ajuste, justificacion, resultadoCalibrado,
        actas: parseInt($('#calActas').value, 10) || 0,
        nom035: $('#calNom035').value,
        observacionesRH: $('#calObs').value,
        responsable: state.user.nombre,
        _motivo: justificacion || 'Calibración de RH'
      }, state.user.nombre);
      alert('Calibración guardada.');
      render();
    },
    habilitarRetro(colaboradorId, periodoId) {
      const cal = S.getCalibracion(colaboradorId, periodoId);
      if (!cal || cal.resultadoCalibrado === undefined) { alert('Guarda la calibración antes de habilitar la retroalimentación.'); return; }
      if (cal.resultadoCalibrado < 80) {
        const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
        if (!planes.length) { alert('El resultado es menor a 80. Registra al menos un plan de desarrollo antes de habilitar la retroalimentación.'); return; }
      }
      S.habilitarRetroalimentacion(colaboradorId, periodoId, state.user.nombre);
      alert('Retroalimentación habilitada para el colaborador.');
      render();
    },
    selNinebox(numero) { state.nineboxSel = numero; render(); },
    guardarConfigBrecha() {
      const alineadaMax = parseFloat($('#cfgAlineada').value);
      const revisarMax = parseFloat($('#cfgRevisar').value);
      if (isNaN(alineadaMax) || isNaN(revisarMax) || alineadaMax >= revisarMax) { alert('Verifica que "Alineada" sea menor que "Revisar".'); return; }
      S.updateConfigBrecha({ alineadaMax, revisarMax }, state.user.nombre);
      alert('Umbrales actualizados.');
      render();
    },
    reiniciarDemo() {
      if (!confirm('¿Reiniciar todos los datos de la demo? Esta acción no se puede deshacer.')) return;
      S.reset();
      borrarSesion();
      state.user = null;
      location.hash = '#/login';
      render();
    }
  };

  global.App = Actions;
  global.addEventListener('hashchange', render);
  global.addEventListener('DOMContentLoaded', render);
})(window);
