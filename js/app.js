/**
 * app.js
 * ---------------------------------------------------------------------------
 * Interfaz y navegación de la demo EDD Inter-Con. Router por hash, tres
 * portales (Colaborador / Líder / Administrador) y componentes compartidos.
 *
 * Beta 3: la sesión (login por número de empleado + código temporal) ya NO
 * se maneja aquí — vive en auth.js (EDDAuth), sobre sessionStorage. Este
 * archivo solo consume EDDAuth.getSession()/getAppUser() para saber quién
 * es el usuario en turno, igual que ya consumía EDDStorage para los datos.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';
  const D = global.EDDData;
  const C = global.EDDCalc;
  const S = global.EDDStorage;
  const A = global.EDDAuth;

  const state = {
    user: null,       // {empleado, nombre, perfil} — derivado de EDDAuth.getAppUser()
    periodo: null,
    wizard: { seccionIdx: 0, evaluacionId: null, tipo: null, colaboradorId: null, liderId: null },
    adminFiltros: {},
    usuariosFiltros: {},
    jerarquiasFiltros: {},
    nineboxSel: null,
    nineboxSelEmpleado: null,
    // --- Estado del login de dos pasos (beta 3) ---
    login: {
      paso: 'solicitar',   // 'solicitar' | 'validar'
      numeroEmpleado: '',
      maskedEmail: null,
      loading: false,
      error: null,
      info: null,
      sessionExpiredNotice: false
    }
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
  // SESIÓN (delegada en auth.js — ver EDDAuth). Este bloque solo resuelve la
  // navegación posterior al login/logout y el registro en auditoría local.
  // =========================================================================
  function irAHomeDePerfil(perfil) {
    navigate(perfil === 'colaborador' ? '#/colaborador/bienvenida' : (perfil === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard'));
  }

  function introKey() {
    return state.user ? `edd_intro_rev4_${state.user.empleado}` : 'edd_intro_rev4';
  }
  function introVista() { return sessionStorage.getItem(introKey()) === '1'; }
  function marcarIntroVista() { sessionStorage.setItem(introKey(), '1'); }

  function resetLoginState(paso) {
    state.login = {
      paso: paso || 'solicitar',
      numeroEmpleado: state.login ? state.login.numeroEmpleado : '',
      maskedEmail: null,
      loading: false,
      error: null,
      info: null,
      sessionExpiredNotice: state.login ? state.login.sessionExpiredNotice : false
    };
  }

  async function logout() {
    if (state.user) {
      S.addAudit(state.user.nombre, 'Cierre de sesión', 'usuarios', state.user.empleado, null, null);
      sessionStorage.removeItem(introKey());
    }
    await A.logout();
    state.user = null;
    resetLoginState('solicitar');
    navigate('#/login');
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
    const teniaUsuario = !!state.user;
    const session = A.getSession();
    state.user = session ? A.getAppUser(session) : null;

    if (!state.user) {
      // Si había sesión activa y ya no la hay (y no fue por un logout manual
      // que ya limpió el aviso), asumimos que expiró y lo mostramos en login.
      if (teniaUsuario && !state.login.sessionExpiredNotice) {
        state.login.sessionExpiredNotice = true;
      }
      root.innerHTML = viewLogin();
      bindLogin();
      return;
    }
    state.periodo = S.getPeriodoActivo();

    const parts = parseHash();
    const areaEsperada = state.user.perfil === 'colaborador' ? 'colaborador' : state.user.perfil === 'lider' ? 'lider' : 'admin';
    const area = parts[0] || areaEsperada;
    const page = parts[1] || (areaEsperada === 'colaborador' ? 'inicio' : 'dashboard');
    const param = parts[2];

    // Seguridad de navegación: el rol de la URL nunca puede sustituir al rol
    // de la sesión. Si el usuario modifica manualmente el hash, vuelve a su portal.
    if (area !== areaEsperada) {
      navigate(areaEsperada === 'colaborador' ? '#/colaborador/inicio' : areaEsperada === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard');
      return;
    }

    let body = '';
    if (area === 'colaborador') body = renderColaborador(page);
    else if (area === 'lider') body = renderLider(page, param);
    else if (area === 'admin') body = renderAdmin(page, param);
    else {
      navigate(areaEsperada === 'colaborador' ? '#/colaborador/inicio' : areaEsperada === 'lider' ? '#/lider/dashboard' : '#/admin/dashboard');
      return;
    }

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
      tabs = [['dashboard', 'Dashboard'], ['calibracion', 'Calibración'], ['9box', 'Matriz 9-Box'], ['usuarios', 'Usuarios'], ['jerarquias', 'Jerarquías'], ['auditoria', 'Auditoría'], ['config', 'Configuración']];
    }
    const navHtml = tabs.map((t) => `<a href="#/${area === 'colaborador' ? 'colaborador' : area}/${t[0]}" class="${page === t[0] ? 'active' : ''}">${t[1]}</a>`).join('');
    const iniciales = esc((u.nombre || '').split(/\s+/).slice(0,2).map(x => x[0] || '').join('').toUpperCase());
    return `
    <header class="app-header premium-header">
      <div class="app-header-top premium-header-top">
        <div class="brand premium-brand">
          <img src="assets/ic-seguridad-privada.png" alt="IC Seguridad Privada" />
        </div>
        <nav class="nav-tabs premium-nav-tabs">${navHtml}</nav>
        <div class="premium-user-menu">
          <span class="premium-user-avatar">${iniciales}</span>
          <span class="premium-user-copy"><strong>${esc(u.nombre)}</strong><small>${capitalize(u.perfil)} · ${esc(per ? per.nombre : '')}</small></span>
          <button class="premium-logout" onclick="App.logout()" title="Cerrar sesión">⌄</button>
        </div>
      </div>
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
  // LOGIN (dos pasos: solicitar código -> validar código) — beta 3
  // =========================================================================
  let countdownInterval = null;

  function detenerCountdown() { if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; } }

  function iniciarCountdown() {
    detenerCountdown();
    countdownInterval = setInterval(() => {
      const pend = A.pendienteActual();
      const el = document.getElementById('loginCountdown');
      if (!pend || !el) { detenerCountdown(); return; }
      const restanteMs = pend.expiresAt - Date.now();
      if (restanteMs <= 0) {
        el.textContent = 'vencido';
        el.classList.add('countdown-vencido');
        detenerCountdown();
        return;
      }
      const mm = Math.floor(restanteMs / 60000);
      const ss = Math.floor((restanteMs % 60000) / 1000);
      el.textContent = mm + ':' + String(ss).padStart(2, '0');
    }, 1000);
  }

  function viewLogin() {
    const L = state.login;
    const avisoExpirada = L.sessionExpiredNotice
      ? `<p class="alert alert-warning premium-login-alert">Tu sesión anterior expiró por inactividad. Inicia sesión de nuevo.</p>`
      : '';
    const cuerpo = L.paso === 'validar' ? viewLoginValidar(L) : viewLoginSolicitar(L);
    return `
    <div class="login-screen premium-login-screen">
      <section class="premium-login-shell">
        <div class="premium-login-brand-panel">
          <div class="premium-login-overlay"></div>
          <div class="premium-login-brand-content">
            <img class="premium-login-logo" src="assets/ic-seguridad-privada.png" alt="IC Seguridad Privada" />
            <div class="premium-login-kicker">Plataforma corporativa</div>
            <h1>Evaluación de Desempeño<br>Administrativo</h1>
            <p>Una experiencia simple, segura y confidencial para impulsar tu desarrollo dentro de Inter-Con.</p>
          </div>
          <div class="premium-login-trust">
            <div><span>◇</span><strong>Seguro</strong><small>Tus datos están protegidos</small></div>
            <div><span>▣</span><strong>Confidencial</strong><small>Información de uso interno</small></div>
            <div><span>↗</span><strong>Desarrollo</strong><small>Impulsamos tu crecimiento</small></div>
          </div>
        </div>
        <div class="premium-login-form-panel">
          <div class="premium-login-form-wrap">
            <div class="premium-login-mobile-logo"><img src="assets/ic-seguridad-privada.png" alt="IC Seguridad Privada" /></div>
            <div class="premium-login-step">${L.paso === 'validar' ? 'Verificación de identidad' : 'Bienvenido(a)'}</div>
            <h2>${L.paso === 'validar' ? 'Ingresa tu código de acceso' : 'Inicia sesión'}</h2>
            <p class="premium-login-description">${L.paso === 'validar' ? 'Revisa tu correo corporativo y captura el código temporal de 6 dígitos.' : 'Utiliza tu número de empleado para acceder a tu evaluación.'}</p>
            ${avisoExpirada}
            ${cuerpo}
            <div class="premium-login-security">▾ &nbsp; Acceso protegido · Uso exclusivo de personal autorizado</div>
          </div>
        </div>
      </section>
    </div>`;
  }

  function viewLoginSolicitar(L) {
    const modoApi = global.APP_CONFIG.mode === 'api';
    return `
    <div class="login-form premium-login-form">
      <label for="loginEmpleado">Número de empleado</label>
      <div class="premium-input-wrap"><span>♙</span><input id="loginEmpleado" type="text" inputmode="numeric" placeholder="Ingresa tu número de empleado" value="${esc(L.numeroEmpleado)}" /></div>
      <p class="premium-field-help">Te enviaremos un código de verificación a tu correo corporativo.</p>
      ${L.error ? `<p class="alert alert-danger">${esc(L.error)}</p>` : ''}
      ${L.info ? `<p class="alert alert-info">${esc(L.info)}</p>` : ''}
      <button class="btn btn-primary btn-block premium-login-primary" id="btnSolicitarCodigo" ${L.loading ? 'disabled' : ''}>${L.loading ? 'Enviando…' : 'Continuar'} <span>→</span></button>
      ${modoApi ? '<p class="muted premium-api-note">Conexión segura mediante API corporativa.</p>' : ''}
    </div>
    ${!modoApi ? `<details class="premium-demo-access"><summary>Accesos de demostración</summary><div class="quick-access">
      <button class="btn btn-outline btn-block" data-quick="10001">Colaborador · Laura Hernández</button>
      <button class="btn btn-outline btn-block" data-quick="20001">Líder · Carlos Martínez</button>
      <button class="btn btn-outline btn-block" data-quick="90001">Administrador · RH</button>
      <small>Código demo: ${esc(global.APP_CONFIG.demoCode)}</small>
    </div></details>` : ''}`;
  }

  function viewLoginValidar(L) {
    const modoApi = global.APP_CONFIG.mode === 'api';
    return `
    <div class="login-form premium-login-form">
      <div class="premium-code-sent">✓ Código enviado${L.maskedEmail ? ' a <strong>' + esc(L.maskedEmail) + '</strong>' : ''}</div>
      <label for="loginCodigo">Código temporal</label>
      <input class="premium-code-input" id="loginCodigo" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" />
      <p class="premium-field-help">El código vence en <strong id="loginCountdown">${esc(global.APP_CONFIG.codeValidityMinutes)}:00</strong> minutos.</p>
      ${!modoApi ? `<p class="muted premium-demo-code">Código de demostración: <strong>${esc(global.APP_CONFIG.demoCode)}</strong></p>` : ''}
      ${L.error ? `<p class="alert alert-danger">${esc(L.error)}</p>` : ''}
      ${L.info ? `<p class="alert alert-info">${esc(L.info)}</p>` : ''}
      <button class="btn btn-primary btn-block premium-login-primary" id="btnValidarCodigo" ${L.loading ? 'disabled' : ''}>${L.loading ? 'Validando…' : 'Ingresar a la plataforma'} <span>→</span></button>
      <div class="login-secondary-actions premium-login-secondary">
        <button class="btn btn-outline btn-sm" id="btnReenviarCodigo" ${L.loading ? 'disabled' : ''}>Reenviar código</button>
        <button class="btn btn-outline btn-sm" id="btnCorregirEmpleado" ${L.loading ? 'disabled' : ''}>Cambiar empleado</button>
      </div>
    </div>`;
  }

  function bindLogin() {
    detenerCountdown();
    if (state.login.paso === 'validar') {
      iniciarCountdown();
      $('#btnValidarCodigo').addEventListener('click', () => Actions.validarCodigo());
      $('#btnReenviarCodigo').addEventListener('click', () => Actions.reenviarCodigo());
      $('#btnCorregirEmpleado').addEventListener('click', () => Actions.corregirEmpleado());
      const inputCodigo = $('#loginCodigo');
      if (inputCodigo) inputCodigo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') Actions.validarCodigo(); });
    } else {
      $('#btnSolicitarCodigo').addEventListener('click', () => Actions.solicitarCodigo($('#loginEmpleado').value.trim()));
      const inputEmpleado = $('#loginEmpleado');
      if (inputEmpleado) inputEmpleado.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') Actions.solicitarCodigo(inputEmpleado.value.trim()); });
      document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => Actions.quickLogin(b.getAttribute('data-quick'))));
    }
  }

  // =========================================================================
  // PORTAL COLABORADOR
  // =========================================================================
  function renderColaborador(page) {
    const col = S.getColaborador(state.user.empleado);
    const periodoId = state.periodo.id;
    const estado = S.estadoProceso(col.empleado, periodoId);

    if (page === 'bienvenida') return viewBienvenidaEvaluacion(col, periodoId, estado);
    if (page === 'autoevaluacion' && !introVista() && (estado === D.ESTADOS.NO_INICIADA || estado === D.ESTADOS.EN_PROGRESO)) {
      return viewBienvenidaEvaluacion(col, periodoId, estado);
    }
    if (page === 'autoevaluacion') return viewAutoevaluacion(col, periodoId, estado);
    if (page === 'retroalimentacion') return viewRetroalimentacion(col, periodoId, estado);
    if (page === 'enviado') return viewEnvioExitoso(col);
    return viewColaboradorInicio(col, periodoId, estado);
  }

  function viewBienvenidaEvaluacion(col, periodoId, estado) {
    const enProgreso = estado === D.ESTADOS.EN_PROGRESO;
    const primerNombre = esc((col.nombre || '').trim().split(/\s+/)[0] || '');
    return `
    <section class="welcome-page">
      <div class="welcome-hero">
        <div class="welcome-hero-copy">
          <div class="welcome-eyebrow">Evaluación de Desempeño Administrativo</div>
          <h1>¡Bienvenida, ${primerNombre}! <span class="welcome-wave">👋</span></h1>
          <p class="welcome-lead">Esta evaluación nos ayuda a conocer tu desempeño, reconocer tus fortalezas e identificar oportunidades de desarrollo que impulsen tu crecimiento dentro de Inter-Con.</p>

          <div class="welcome-persona">
            <div class="welcome-persona-block">
              <div class="welcome-persona-icon">▣</div>
              <div><strong>${esc(col.nombre)}</strong><span>${esc(col.puesto)}</span></div>
            </div>
            <div class="welcome-persona-divider"></div>
            <div class="welcome-persona-block">
              <div class="welcome-persona-icon">⌘</div>
              <div><strong>${esc(col.area || 'Área')}</strong><span>${esc(col.area || '')}</span></div>
            </div>
          </div>
        </div>

        <div class="welcome-hero-art" aria-hidden="true">
          <div class="welcome-building">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="welcome-quote">
            <div class="welcome-quote-mark">“</div>
            <p>Tu opinión y compromiso contribuyen a construir un mejor Inter-Con.</p>
            <i></i>
          </div>
        </div>
      </div>

      <div class="welcome-info-grid">
        <article class="welcome-card">
          <div class="welcome-card-icon icon-blue">◷</div>
          <h3>Duración estimada</h3>
          <div class="welcome-big-number">15 a 20<br>minutos</div>
          <p>Procura realizar la evaluación en un solo momento y sin interrupciones.</p>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-purple">👥</div>
          <h3>¿Quién participa?</h3>
          <ul class="welcome-check-list purple-list">
            <li>Tu autoevaluación.</li>
            <li>La evaluación de tu líder.</li>
            <li>Retroalimentación para tu desarrollo.</li>
          </ul>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-yellow">★</div>
          <h3>Antes de comenzar</h3>
          <ul class="welcome-check-list yellow-list">
            <li>Responde con honestidad y objetividad.</li>
            <li>Considera tu desempeño durante el periodo evaluado.</li>
            <li>Lee cuidadosamente cada pregunta.</li>
          </ul>
        </article>

        <article class="welcome-card">
          <div class="welcome-card-icon icon-green">▣</div>
          <h3>Confidencialidad</h3>
          <p>Tus respuestas serán tratadas de forma confidencial y se utilizarán exclusivamente para apoyar tu desarrollo y fortalecer nuestro proceso de gestión del desempeño.</p>
        </article>

        <article class="welcome-card welcome-card-integracion">
          <div class="welcome-card-icon icon-blue">◔</div>
          <h3>¿Cómo se integra?</h3>
          <p class="welcome-integracion-title"><strong>Competencias 70%</strong> +<br><strong>Cumplimiento de Objetivos 30%</strong></p>
          <div class="welcome-weight-list">
            <span><i class="dot-blue"></i>Valores y Actitud <b>40%</b></span>
            <span><i class="dot-purple"></i>Habilidades <b>20%</b></span>
            <span><i class="dot-green"></i>Conocimientos <b>10%</b></span>
            <span><i class="dot-yellow"></i>Objetivos <b>30%</b></span>
          </div>
        </article>
      </div>

      <div class="welcome-scale">
        <div class="welcome-scale-title">
          <div class="welcome-scale-icon">▥</div>
          <strong>Escala de<br>evaluación</strong>
        </div>
        <div class="welcome-scale-item score-5"><b>5</b><span><strong>Excede</strong> significativamente las expectativas.</span></div>
        <div class="welcome-scale-item score-4"><b>4</b><span><strong>Supera</strong> las expectativas de manera constante.</span></div>
        <div class="welcome-scale-item score-3"><b>3</b><span><strong>Cumple</strong> con lo esperado para su puesto.</span></div>
        <div class="welcome-scale-item score-2"><b>2</b><span><strong>Cumple parcialmente</strong>; requiere mejorar.</span></div>
        <div class="welcome-scale-item score-1"><b>1</b><span><strong>No cumple</strong> con las expectativas del puesto.</span></div>
        <div class="welcome-scale-item score-na"><b>N/A</b><span>No aplica o no cuento con elementos suficientes para evaluarlo.</span></div>
      </div>

      <div class="welcome-actions">
        <button class="btn welcome-start-btn" onclick="App.comenzarEvaluacion()">→&nbsp;&nbsp;${enProgreso ? 'Continuar mi evaluación' : 'Comenzar mi evaluación'}</button>
        <div class="welcome-important">◈ &nbsp;Tu evaluación es importante</div>
      </div>
    </section>`;
  }

  function viewEnvioExitoso(col, yaEnviada) {
    return `
    <section class="premium-success-page">
      <div class="premium-success-icon">✓</div>
      <div class="premium-success-confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <h1>${yaEnviada ? 'Tu evaluación ya fue enviada' : '¡Evaluación enviada con éxito!'}</h1>
      <p>Gracias por tu participación, ${esc((col.nombre || '').split(/\s+/)[0] || '')}.</p>
      <div class="premium-success-note"><span>✉</span><div><strong>Tu autoevaluación ha sido registrada correctamente.</strong><small>Tu líder recibirá la notificación correspondiente para continuar con el proceso.</small></div></div>
      <a class="btn btn-primary premium-success-home" href="#/colaborador/inicio">⌂ &nbsp; Ir al inicio</a>
      <div class="premium-success-footer">◇ &nbsp; Tu compromiso impulsa tu desarrollo y el éxito de Inter-Con.</div>
    </section>`;
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
    const liderDirecto = S.getLider(col.liderId);

    let accion = '';
    if (estado === D.ESTADOS.NO_INICIADA || estado === D.ESTADOS.EN_PROGRESO) {
      accion = `<a class="btn btn-primary" href="#/${estado === D.ESTADOS.NO_INICIADA ? 'colaborador/bienvenida' : 'colaborador/autoevaluacion'}">${estado === D.ESTADOS.NO_INICIADA ? 'Iniciar autoevaluación' : 'Continuar autoevaluación'}</a>`;
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
        <div><span class="label">Líder directo</span><span class="value">${esc(liderDirecto ? liderDirecto.nombre : '—')}</span></div>
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
      return viewEnvioExitoso(col, true);
    }
    const idx = state.wizard.seccionIdx;
    const seccion = SECCIONES_WIZARD[idx];
    const progreso = Math.round(((idx + (seccion === 'resumen' ? 1 : 0)) / SECCIONES_WIZARD.length) * 100);
    const respuestasPorSeccion = S.getRespuestasPorSeccion(ev.id);
    const counts = {
      actitud: (respuestasPorSeccion.actitud || []).filter(r => r.valor !== '' && r.valor !== null && r.valor !== undefined).length,
      habilidades: (respuestasPorSeccion.habilidades || []).filter(r => r.valor !== '' && r.valor !== null && r.valor !== undefined).length,
      conocimientos: (respuestasPorSeccion.conocimientos || []).filter(r => r.valor !== '' && r.valor !== null && r.valor !== undefined).length,
      objetivos: S.getObjetivos(ev.id).filter(o => (o.descripcion || '').trim() && o.calificacion).length
    };
    const total = { actitud:D.COMPETENCIAS.actitud.length, habilidades:D.COMPETENCIAS.habilidades.length, conocimientos:D.COMPETENCIAS.conocimientos.length, objetivos:5 };

    let contenido = '';
    if (seccion === 'objetivos') contenido = renderObjetivosForm(ev, false);
    else if (seccion === 'resumen') contenido = renderResumenAuto(ev);
    else contenido = renderSeccionForm(ev, seccion, false);

    const sideSections = ['actitud','habilidades','conocimientos','objetivos'].map((s,i) => `
      <button class="premium-section-step ${seccion === s ? 'active' : ''} ${i < idx ? 'done' : ''}" onclick="App.irSeccionWizard(${i})">
        <span><strong>${labelSeccion(s)}</strong><small>${s === 'actitud' ? 'Eje ACTITUD' : 'Eje DESEMPEÑO'}</small></span>
        <b>${counts[s]}/${total[s]}</b>
      </button>`).join('');

    return `
    <section class="premium-evaluation-page">
      <div class="premium-progress-head"><div><span>Progreso general</span><div class="progress"><div class="progress-bar" style="width:${progreso}%"></div></div></div><strong>${progreso}%</strong></div>
      <div class="premium-evaluation-layout">
        <aside class="premium-evaluation-sidebar">
          ${sideSections}
          <div class="premium-reminder-card"><strong>Recordatorio</strong><p>Puedes guardar tu progreso en cualquier momento. Tu evaluación es confidencial.</p></div>
        </aside>
        <div class="premium-evaluation-main">
          <div class="premium-evaluation-title"><span class="premium-section-kicker">${seccion === 'resumen' ? 'Revisión final' : 'Sección ' + (idx + 1) + ' de 4'}</span><h1>${labelSeccion(seccion)}${seccion !== 'resumen' ? ` <em>${D.SECCIONES_META[seccion] ? '(' + D.SECCIONES_META[seccion].peso + '%)' : ''}</em>` : ''}</h1></div>
          ${contenido}
          <div class="wizard-nav premium-wizard-nav">
            <button class="btn btn-outline" ${idx === 0 ? 'disabled' : ''} onclick="App.wizardPrev()">← Anterior</button>
            <button class="btn btn-outline premium-save-btn" onclick="App.guardarProgresoVisual()">Guardar progreso</button>
            ${seccion === 'resumen'
              ? `<label class="confirm-check premium-confirm"><input type="checkbox" id="confirmEnvioAuto"/> Confirmo que la información capturada es correcta.</label><button class="btn btn-primary premium-next-btn" onclick="App.enviarAutoevaluacion()">Finalizar y enviar ✓</button>`
              : `<button class="btn btn-primary premium-next-btn" onclick="App.wizardNext('${seccion}')">Siguiente →</button>`}
          </div>
        </div>
      </div>
    </section>`;
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
    <div class="competency-card" data-competencia-id="${esc(c.id)}">
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
      ${!soloLectura ? `<div class="validation-message" aria-live="polite">Selecciona una calificación para continuar.</div><textarea class="comentario-box" placeholder="Comentario (opcional)" onchange="App.comentar('${evaluacionId}','${seccion}','${c.id}',this.value)">${esc(comentario)}</textarea>` : (comentario ? `<div class="comentario-lectura">${esc(comentario)}</div>` : '')}
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
        <div class="validation-message" aria-live="polite">Completa la descripción y selecciona una calificación.</div>
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

  function inicialesAvatar(nombre) { return String(nombre || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); }

  /**
   * Ficha ejecutiva de retroalimentación del colaborador. Reutiliza los
   * campos y funciones ya existentes (resultados, calibración, áreas de
   * oportunidad, planes de desarrollo, acciones de cronograma, evidencias);
   * no se duplican entidades nuevas.
   */
  function viewRetroalimentacion(col, periodoId, estado) {
    if (estado !== D.ESTADOS.RETRO_PENDIENTE && estado !== D.ESTADOS.CERRADA) {
      return `<div class="card"><h2>Retroalimentación</h2><p class="muted">Tu retroalimentación aún no está disponible. Estado actual: ${badge(estado)}</p></div>`;
    }
    const cal = S.getCalibracion(col.empleado, periodoId);
    const liderEval = S.getEvaluacion(col.empleado, periodoId, 'lider');
    const resAuto = S.getUltimoResultadoPorOrigen(col.empleado, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(col.empleado, periodoId, 'lider');
    const totalFinal = cal ? cal.resultadoCalibrado : (resLider ? resLider.puntajes.total : null);
    const nivel = C.clasificarNivel(totalFinal);
    const cuad = C.asignarCuadrante(resLider ? resLider.promedios.actitud : null, resLider ? resLider.promedios.desempeno : null);
    const areas = S.getAreasOportunidad(col.empleado, periodoId);
    const planes = S.getPlanesDesarrollo(col.empleado, periodoId);
    const evidencias = S.getEvidencias(col.empleado, periodoId);
    const acciones = S.getAcciones(col.empleado, periodoId);
    const liderDirecto = S.getLider(col.liderId);
    const diferenciaGlobal = (resAuto && resLider) ? C.round1(resAuto.puntajes.total - resLider.puntajes.total) : null;
    const brechaGlobal = diferenciaGlobal !== null ? C.clasificarBrecha(diferenciaGlobal) : null;
    const promedios = resLider ? resLider.promedios : {};
    const puntajes = resLider ? resLider.puntajes : {};

    const radarHtml = global.EDDCharts.renderRadarChart({
      autoevaluacion: resAuto ? resAuto.promedios : null,
      evaluacionLider: resLider ? resLider.promedios : null,
      calibracion: (cal && cal.resultadoCalibrado !== undefined && resLider) ? { resultadoLider: resLider.puntajes.total, resultadoCalibrado: cal.resultadoCalibrado } : null
    });
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({
      actitudProm: resLider ? resLider.promedios.actitud : null,
      desempenoProm: resLider ? resLider.promedios.desempeno : null,
      nombreColaborador: col.nombre
    });

    const seccionesCards = ['actitud', 'habilidades', 'conocimientos', 'objetivos'].map((s) => {
      const meta = D.SECCIONES_META[s];
      const val = puntajes[s];
      const pctVal = (val !== undefined && val !== null && meta.peso) ? (val / meta.peso) * 100 : 0;
      return `<div class="seccion-card">
        <div class="seccion-card-title">${esc(meta.titulo)} <span class="peso-tag">${meta.peso}%</span></div>
        ${progressBar(pctVal)}
        <div class="seccion-card-val">${f1(val)} de ${meta.peso} pts · promedio ${f1(promedios[s])}/5</div>
      </div>`;
    }).join('');

    return `
    <div class="card ficha-ejecutiva">
      <div class="ficha-header">
        <div class="avatar-iniciales">${esc(inicialesAvatar(col.nombre))}</div>
        <div class="ficha-datos-generales">
          <h2>${esc(col.nombre)}</h2>
          <div class="info-grid">
            <div><span class="label">N.º de empleado</span><span class="value">${esc(col.empleado)}</span></div>
            <div><span class="label">Puesto</span><span class="value">${esc(col.puesto)}</span></div>
            <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
            <div><span class="label">Dirección</span><span class="value">${esc(col.direccion)}</span></div>
            <div><span class="label">Ciudad operativa</span><span class="value">${esc(col.ciudad)}</span></div>
            <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
            <div><span class="label">Líder directo</span><span class="value">${esc(liderDirecto ? liderDirecto.nombre : '—')}</span></div>
            <div><span class="label">Periodo evaluado</span><span class="value">${esc(state.periodo.nombre)}</span></div>
          </div>
        </div>
      </div>

      <div class="resultado-final">
        <div class="resultado-num" style="color:${nivel.color}">${f1(totalFinal)}</div>
        <div>${badge(nivel.nivel, null)}<div class="muted">Puntaje final sobre 100</div></div>
      </div>
      ${progressBar(totalFinal, nivel.color)}

      <h3>Resultados por sección</h3>
      <div class="seccion-cards">${seccionesCards}</div>

      <div class="two-col">
        <div><h3>Radar comparativo</h3>${radarHtml}</div>
        <div><h3>Matriz 9-Box (tu ubicación)</h3>${ninaBoxHtml}</div>
      </div>

      <h3>Fortalezas</h3><p>${esc(liderEval ? liderEval.fortalezas : '') || '<span class="muted">Sin registrar.</span>'}</p>
      <h3>Áreas de oportunidad y plan de mejora</h3>
      ${areas.length ? `<table class="table"><thead><tr><th>Área de oportunidad</th><th>Plan de mejora</th></tr></thead><tbody>${areas.map((a) => `<tr><td>${esc(a.area)}</td><td>${esc(a.planMejora)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Sin áreas registradas.</p>'}
      <h3>Plan de desarrollo</h3>
      ${renderPlanesTabla(planes)}
      <h3>Cronograma de seguimiento (6 semanas)</h3>
      ${acciones.length ? renderGantt(acciones) : '<p class="muted">Aún no se genera cronograma.</p>'}
      <h3>Comentarios del líder</h3><p>${esc(liderEval ? liderEval.comentarios : '') || '<span class="muted">Sin comentarios.</span>'}</p>
      <h3>Observaciones de RH</h3><p>${esc(cal ? cal.observacionesRH : '') || '<span class="muted">Sin observaciones registradas.</span>'}</p>
      <h3>Evidencias</h3>
      <ul class="evidencias-list">${evidencias.map((e) => `<li>${esc(e.nombreArchivo)} <span class="muted">(${esc(e.tipo)}, ${esc(e.fecha)}, ${esc(e.usuario)})</span></li>`).join('') || '<li class="muted">Sin evidencias cargadas.</li>'}</ul>
      <div class="actions">
        <button class="btn btn-outline" onclick="App.cargarEvidencia('${col.empleado}','${periodoId}')">Simular carga de evidencia</button>
        ${estado === D.ESTADOS.RETRO_PENDIENTE ? `<button class="btn btn-primary" ${evidencias.length ? '' : 'disabled title="Carga al menos una evidencia antes de aceptar"'} onclick="App.aceptar('${col.empleado}','${periodoId}')">Aceptar resultado</button>` : badge('Resultado aceptado el ' + (cal ? cal.fechaAceptacion : ''), 'green')}
      </div>
    </div>`;
  }

  // renderCuadranteInfo vive ahora en charts.js (EDDCharts.renderCuadranteInfo)
  // para que la matriz global y la individual usen exactamente la misma tarjeta.
  function renderCuadranteInfo(cuad) { return global.EDDCharts.renderCuadranteInfo(cuad); }

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

  // Bloquea el acceso de un líder a colaboradores que no le reportan
  // directamente (liderId debe coincidir con el número de empleado del líder
  // en sesión). Se aplica tanto si el líder llega por navegación normal como
  // si escribe la URL con hash directamente en el navegador.
  function viewAccesoDenegado(mensaje) {
    return `<div class="card"><h2>Acceso no autorizado</h2><p class="muted">${esc(mensaje)}</p><a class="btn btn-outline" href="#/lider/dashboard">Volver a mi equipo</a></div>`;
  }
  function perteneceALider(col, lider) {
    return !!(col && lider && String(col.liderId) === String(lider.empleado));
  }

  function viewLiderEvaluar(lider, colaboradorId, periodoId) {
    const col = S.getColaborador(colaboradorId);
    if (!col || !perteneceALider(col, lider)) {
      return viewAccesoDenegado('Este colaborador no pertenece a tu equipo directo. Solo puedes evaluar a las personas cuyo líder registrado seas tú.');
    }
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
          <div class="validation-message" aria-live="polite">Selecciona una calificación para continuar.</div>
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
    if (!col || !perteneceALider(col, lider)) {
      return viewAccesoDenegado('Este colaborador no pertenece a tu equipo directo. Solo puedes consultar la comparación de las personas cuyo líder registrado seas tú.');
    }
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
    const cal = S.getCalibracion(colaboradorId, periodoId);
    const brechaGeneral = C.clasificarBrecha(resAuto.puntajes.total - resLider.puntajes.total);

    const radarHtml = global.EDDCharts.renderRadarChart({
      autoevaluacion: resAuto.promedios,
      evaluacionLider: resLider.promedios,
      calibracion: (cal && cal.resultadoCalibrado !== undefined) ? { resultadoLider: resLider.puntajes.total, resultadoCalibrado: cal.resultadoCalibrado } : null
    });
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({
      actitudProm: resLider.promedios.actitud, desempenoProm: resLider.promedios.desempeno, nombreColaborador: col.nombre
    });

    return `
    <div class="card">
      <h2>Comparación — ${esc(col.nombre)}</h2>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Puntaje autoevaluación', f1(resAuto.puntajes.total))}
        ${kpi('Puntaje evaluación líder', f1(resLider.puntajes.total))}
        ${kpi('Diferencia global', (resAuto.puntajes.total - resLider.puntajes.total > 0 ? '+' : '') + f1(resAuto.puntajes.total - resLider.puntajes.total))}
      </div>
      <p>Brecha general: ${badge(brechaGeneral.etiqueta, brechaGeneral.etiqueta === 'Alineada' ? 'green' : (brechaGeneral.etiqueta === 'Revisar' ? 'yellow' : 'red'))}</p>
      <h3>Diferencias por sección (radar comparativo)</h3>
      ${radarHtml}
      <h3>Diferencias detalladas por competencia</h3>
      <table class="table">
        <thead><tr><th>Competencia</th><th>Autoevaluación</th><th>Evaluación líder</th><th>Diferencia</th><th>Brecha</th><th>Comentario líder</th><th>Comentario colaborador</th></tr></thead>
        <tbody>
        ${filas.map((f) => {
          const na = f.auto === 'N/A' || f.lider === 'N/A' || f.auto === null || f.lider === null;
          const diff = na ? null : (Number(f.lider) - Number(f.auto));
          const brecha = na ? { etiqueta: 'Sin datos', color: '#6c757d' } : C.clasificarBrecha(diff);
          const rowClass = na ? '' : (diff > 0 ? 'row-lider-mayor' : (diff < 0 ? 'row-auto-mayor' : ''));
          const destacar = !na && brecha.etiqueta === 'Brecha significativa' ? ' row-brecha-critica' : '';
          return `<tr class="${rowClass}${destacar}"><td>${esc(f.nombre)}</td><td>${esc(f.auto)}</td><td>${esc(f.lider)}</td><td>${na ? '—' : (diff > 0 ? '+' : '') + f1(diff)}</td><td>${badge(brecha.etiqueta, brecha.etiqueta === 'Alineada' ? 'green' : (brecha.etiqueta === 'Revisar' ? 'yellow' : (brecha.etiqueta === 'Sin datos' ? 'gray' : 'red')))}</td><td>${esc(f.comentarioLider)}</td><td>${esc(f.comentarioAuto)}</td></tr>`;
        }).join('')}
        </tbody>
      </table>
      <h3>Ubicación en la Matriz 9-Box</h3>
      ${ninaBoxHtml}
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
    if (page === 'usuarios') return viewAdminUsuarios();
    if (page === 'jerarquias') return viewAdminJerarquias(periodoId);
    if (page === 'auditoria') return viewAuditoria();
    if (page === 'config') return viewConfig();
    return viewAdminDashboard(periodoId);
  }

  // =========================================================================
  // ADMIN — USUARIOS (consulta, beta 3 — preparación Excel maestro/Airtable)
  // =========================================================================
  function todosLosUsuariosCompletos() {
    const colaboradores = S.getTodosColaboradores().map((c) => Object.assign({ rolPlataforma: 'Colaborador' }, c));
    const lideres = S.getTodosLideres().map((l) => Object.assign({ rolPlataforma: 'Líder' }, l));
    const administradores = S.getTodosAdministradores().map((a) => Object.assign({ rolPlataforma: 'Administrador' }, a));
    return colaboradores.concat(lideres, administradores);
  }
  function nombreLiderDe(liderId) {
    if (!liderId) return null;
    const l = S.getLider(liderId);
    return l ? l.nombre : liderId;
  }

  function viewAdminUsuarios() {
    const filtros = state.usuariosFiltros;
    const todos = todosLosUsuariosCompletos();
    const areas = Array.from(new Set(todos.map((u) => u.area).filter(Boolean))).sort();
    const filtrados = todos.filter((u) => {
      if (filtros.area && u.area !== filtros.area) return false;
      if (filtros.rol && u.rolPlataforma !== filtros.rol) return false;
      if (filtros.estatus && u.estatusEmpleado !== filtros.estatus) return false;
      if (filtros.lider === 'con' && !u.liderId) return false;
      if (filtros.lider === 'sin' && (u.liderId || u.rolPlataforma !== 'Colaborador')) return false;
      if (filtros.correo === 'con' && !u.correoCorporativo) return false;
      if (filtros.correo === 'sin' && u.correoCorporativo) return false;
      return true;
    });

    return `
    <div class="card">
      <h2>Usuarios</h2>
      <p class="muted">Vista de solo consulta. Origen previsto: Excel maestro de usuarios sincronizado a Airtable vía n8n (tabla <code>Empleados</code>, ver README). Aún no se implementa edición masiva ni importación directa desde el navegador (ver requerimiento 17 del brief).</p>
      <div class="filters-bar">
        <select onchange="App.setFiltroUsuarios('area', this.value)"><option value="">Todas las áreas</option>${areas.map((a) => `<option value="${esc(a)}" ${filtros.area === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select>
        <select onchange="App.setFiltroUsuarios('rol', this.value)"><option value="">Todos los roles</option><option ${filtros.rol === 'Colaborador' ? 'selected' : ''}>Colaborador</option><option ${filtros.rol === 'Líder' ? 'selected' : ''}>Líder</option><option ${filtros.rol === 'Administrador' ? 'selected' : ''}>Administrador</option></select>
        <select onchange="App.setFiltroUsuarios('estatus', this.value)"><option value="">Todos los estatus</option><option ${filtros.estatus === 'Activo' ? 'selected' : ''}>Activo</option><option ${filtros.estatus === 'Inactivo' ? 'selected' : ''}>Inactivo</option></select>
        <select onchange="App.setFiltroUsuarios('lider', this.value)"><option value="">Con/sin líder (todos)</option><option value="con" ${filtros.lider === 'con' ? 'selected' : ''}>Con líder</option><option value="sin" ${filtros.lider === 'sin' ? 'selected' : ''}>Sin líder</option></select>
        <select onchange="App.setFiltroUsuarios('correo', this.value)"><option value="">Con/sin correo (todos)</option><option value="con" ${filtros.correo === 'con' ? 'selected' : ''}>Con correo</option><option value="sin" ${filtros.correo === 'sin' ? 'selected' : ''}>Sin correo</option></select>
        <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosUsuarios()">Limpiar filtros</button>
      </div>
      <table class="table">
        <thead><tr><th>No. empleado</th><th>Nombre</th><th>Correo</th><th>Puesto</th><th>Área</th><th>Rol</th><th>Estatus</th><th>Líder asignado</th><th>Correo validado</th><th>Última actualización</th></tr></thead>
        <tbody>
        ${filtrados.map((u) => `<tr class="${(u.rolPlataforma === 'Colaborador' && !u.liderId) ? 'row-sin-lider' : ''}">
          <td>${esc(u.empleado)}</td>
          <td>${esc(u.nombre)}</td>
          <td>${u.correoCorporativo ? esc(A.maskEmail(u.correoCorporativo)) : '<span class="muted">Sin correo</span>'}</td>
          <td>${esc(u.puesto)}</td>
          <td>${esc(u.area)}</td>
          <td>${esc(u.rolPlataforma)}</td>
          <td>${badge(u.estatusEmpleado || '—', u.estatusEmpleado === 'Activo' ? 'green' : 'gray')}</td>
          <td>${u.rolPlataforma === 'Colaborador' ? (u.liderId ? esc(nombreLiderDe(u.liderId)) : badge('Sin líder asignado', 'red')) : '<span class="muted">N/A</span>'}</td>
          <td>${u.correoValidado ? badge('Validado', 'green') : badge('Pendiente', 'yellow')}</td>
          <td>${esc(u.ultimaActualizacion || '—')}</td>
        </tr>`).join('') || `<tr><td colspan="10" class="muted">Sin resultados para los filtros aplicados.</td></tr>`}
        </tbody>
      </table>
      <p class="muted">${filtrados.length} de ${todos.length} usuarios.</p>
    </div>`;
  }

  // =========================================================================
  // ADMIN — JERARQUÍAS (consulta, beta 3)
  // =========================================================================
  function viewAdminJerarquias(periodoId) {
    const filtros = state.jerarquiasFiltros;
    const jerarquias = S.getJerarquias();
    const filas = jerarquias.map((j) => {
      const col = S.getColaborador(j.numeroEmpleado);
      const lider = j.numeroLider ? S.getLider(j.numeroLider) : null;
      return { j, col, lider };
    }).filter((f) => f.col);
    const sinLider = filas.filter((f) => !f.j.numeroLider);

    const filtradas = filas.filter((f) => {
      if (filtros.estado === 'con' && !f.j.numeroLider) return false;
      if (filtros.estado === 'sin' && f.j.numeroLider) return false;
      if (filtros.periodo && f.j.periodo !== filtros.periodo) return false;
      return true;
    });
    const periodos = Array.from(new Set(jerarquias.map((j) => j.periodo)));

    return `
    <div class="card">
      <h2>Jerarquías</h2>
      <p class="muted">Origen previsto: tabla <code>Asignaciones</code> del Excel maestro sincronizada a Airtable vía n8n. Las relaciones siempre usan <code>numeroEmpleado</code>/<code>numeroLider</code>, nunca el nombre (ver requerimiento 8 del brief).</p>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Asignaciones totales', filas.length)}
        ${kpi('Con líder asignado', filas.length - sinLider.length, 'green')}
        ${kpi('Sin líder asignado', sinLider.length, sinLider.length ? 'red' : 'gray')}
      </div>
      <div class="filters-bar">
        <select onchange="App.setFiltroJerarquias('estado', this.value)"><option value="">Con/sin líder (todos)</option><option value="con" ${filtros.estado === 'con' ? 'selected' : ''}>Con líder</option><option value="sin" ${filtros.estado === 'sin' ? 'selected' : ''}>Sin líder</option></select>
        <select onchange="App.setFiltroJerarquias('periodo', this.value)"><option value="">Todos los periodos</option>${periodos.map((p) => `<option value="${esc(p)}" ${filtros.periodo === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
        <button class="btn btn-outline btn-sm" onclick="App.limpiarFiltrosJerarquias()">Limpiar filtros</button>
      </div>
      <table class="table">
        <thead><tr><th>Asignación</th><th>Colaborador</th><th>Líder asignado</th><th>Periodo</th><th>Tipo</th><th>Vigencia</th><th>Estado</th></tr></thead>
        <tbody>
        ${filtradas.map((f) => `<tr class="${!f.j.numeroLider ? 'row-sin-lider' : ''}">
          <td>${esc(f.j.idAsignacion)}</td>
          <td>${esc(f.col.nombre)} <span class="muted">(${esc(f.j.numeroEmpleado)})</span></td>
          <td>${f.lider ? esc(f.lider.nombre) + ' <span class="muted">(' + esc(f.j.numeroLider) + ')</span>' : badge('Sin líder asignado', 'red')}</td>
          <td>${esc(f.j.periodo)}</td>
          <td>${esc(f.j.tipoAsignacion)}</td>
          <td>${esc(f.j.fechaInicio)} — ${f.j.fechaFin ? esc(f.j.fechaFin) : 'vigente'}</td>
          <td>${badge(f.j.asignacionActiva ? 'Activa' : 'Inactiva', f.j.asignacionActiva ? 'green' : 'gray')}</td>
        </tr>`).join('') || `<tr><td colspan="7" class="muted">Sin resultados para los filtros aplicados.</td></tr>`}
        </tbody>
      </table>
      ${sinLider.length ? `<p class="alert alert-warning">${sinLider.length} colaborador(es) no tienen líder asignado y por lo tanto no pueden avanzar en el flujo de evaluación del líder hasta que se asigne uno en el Excel maestro.</p>` : ''}
    </div>`;
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
      return { c, estado, totalFinal, nivel, cuad, promedios: resLider ? resLider.promedios : null };
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
    const brechaGeneral = C.clasificarBrecha(diferencia);
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
    const liderDirecto = S.getLider(col.liderId);
    const radarHtml = global.EDDCharts.renderRadarChart({
      autoevaluacion: resAuto.promedios,
      evaluacionLider: resLider.promedios,
      calibracion: (cal.resultadoCalibrado !== undefined) ? { resultadoLider: resLider.puntajes.total, resultadoCalibrado: cal.resultadoCalibrado } : null
    });
    const ninaBoxHtml = global.EDDCharts.renderNineBoxIndividual({
      actitudProm: resLider.promedios.actitud, desempenoProm: resLider.promedios.desempeno, nombreColaborador: col.nombre
    });

    return `
    <div class="card">
      <h2>Calibración — ${esc(col.nombre)}</h2>
      <div class="info-grid">
        <div><span class="label">Área</span><span class="value">${esc(col.area)}</span></div>
        <div><span class="label">Ciudad operativa</span><span class="value">${esc(col.ciudad)}</span></div>
        <div><span class="label">Antigüedad</span><span class="value">${esc(col.antiguedad)}</span></div>
        <div><span class="label">Líder directo</span><span class="value">${esc(liderDirecto ? liderDirecto.nombre : '—')}</span></div>
      </div>
      <div class="kpi-grid kpi-grid-3">
        ${kpi('Autoevaluación', f1(resAuto.puntajes.total))}
        ${kpi('Evaluación líder', f1(resLider.puntajes.total))}
        ${kpi('Diferencia', f1(diferencia))}
      </div>
      <p>Brecha general auto vs. líder: ${badge(brechaGeneral.etiqueta, brechaGeneral.etiqueta === 'Alineada' ? 'green' : (brechaGeneral.etiqueta === 'Revisar' ? 'yellow' : 'red'))}</p>
      <div class="two-col">
        <div>
          <h3>Radar comparativo</h3>
          ${radarHtml}
        </div>
        <div>
          <h3>Ubicación en la Matriz 9-Box</h3>
          ${ninaBoxHtml}
        </div>
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
    const ocupantes = datos.map((d) => ({
      empleado: d.c.empleado, nombre: d.c.nombre, cuadrante: d.cuad.cuadrante,
      destacado: state.nineboxSelEmpleado === d.c.empleado
    }));
    const gridHtml = global.EDDCharts.renderNineBoxFull({
      ocupantes,
      resaltarCuadrante: state.nineboxSel,
      onCellClickJs: (numero) => `App.selNinebox(${numero})`,
      onMarkerClickJs: (empleado) => `App.selNineboxColaborador('${empleado}')`
    });

    const sel = state.nineboxSel ? C.CUADRANTES_INFO[state.nineboxSel] : null;
    const ocupSel = sel ? datos.filter((d) => d.cuad.cuadrante === state.nineboxSel) : [];
    const seleccionado = state.nineboxSelEmpleado ? datos.find((d) => d.c.empleado === state.nineboxSelEmpleado) : null;

    let panelDetalle = '<p class="muted">Haz clic en un cuadrante para ver su significado y acción sugerida, o en el marcador de un colaborador para ver su detalle individual.</p>';
    if (seleccionado) {
      panelDetalle = `<div class="cuadrante-detail">
        <h4>${esc(seleccionado.c.nombre)} <span class="muted">— ${esc(seleccionado.c.area)}</span></h4>
        <div class="kpi-grid kpi-grid-3">
          ${kpi('Puntaje de desempeño', f1(seleccionado.promedios ? seleccionado.promedios.desempeno : null))}
          ${kpi('Potencial preliminar', f1(seleccionado.promedios ? seleccionado.promedios.actitud : null))}
          ${kpi('Resultado final', f1(seleccionado.totalFinal))}
        </div>
        ${renderCuadranteInfo(seleccionado.cuad)}
        <button class="btn btn-outline btn-sm" onclick="App.limpiarSeleccionNinebox()">Quitar selección individual</button>
      </div>`;
    } else if (sel) {
      panelDetalle = `<div class="cuadrante-detail">${renderCuadranteInfo({ cuadrante: state.nineboxSel, info: sel })}<h4>Colaboradores en este cuadrante</h4><ul>${ocupSel.map((o) => `<li><a href="#" onclick="event.preventDefault();App.selNineboxColaborador('${o.c.empleado}')">${esc(o.c.nombre)}</a> — ${esc(o.c.area)} (${f1(o.totalFinal)} pts)</li>`).join('') || '<li class="muted">Sin colaboradores.</li>'}</ul></div>`;
    }

    return `
    <div class="card">
      <h2>Matriz 9-Box</h2>
      <p class="muted">Criterio oficial Rev4 para ambos ejes: Bajo &lt;60, Medio / esperado 60–79, Alto 80–100 (base 100).</p>
      ${gridHtml}
      ${panelDetalle}
    </div>`;
  }

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

  // Traduce errores de auth.js/api.js a mensajes seguros para el usuario
  // final (nunca trazas técnicas — eso solo va a consola, ver
  // requerimiento 12 del brief).
  function mensajeErrorLogin(err) {
    const tipo = err && err.tipo;
    if (tipo === 'network') return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    if (tipo === 'timeout') return 'La solicitud tardó demasiado. Intenta de nuevo.';
    if (tipo === 'expired') return 'El código venció. Solicita uno nuevo.';
    if (tipo === 'invalid_code') return 'Código inválido. Verifica los 6 dígitos e intenta de nuevo.';
    if (tipo === 'validation') return err.message || 'Verifica los datos capturados.';
    if (tipo === 'unauthorized') return 'Tu sesión expiró. Inicia sesión nuevamente.';
    return 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  // =========================================================================
  // ACCIONES (expuestas a los onclick del HTML)
  // =========================================================================

  function limpiarErroresVisuales(root) {
    (root || document).querySelectorAll('.validation-error').forEach((el) => el.classList.remove('validation-error'));
  }

  function marcarErroresYEnfocar(elementos) {
    const faltantes = (elementos || []).filter(Boolean);
    faltantes.forEach((el) => el.classList.add('validation-error'));
    if (faltantes.length) {
      const primero = faltantes[0];
      primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = primero.querySelector('input:not([disabled]), textarea:not([disabled]), button:not([disabled])');
      if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 300);
    }
    return faltantes.length;
  }

  function validarSeccionVisual(evaluacionId, seccion) {
    const wizard = document.querySelector('.wizard-card') || document;
    limpiarErroresVisuales(wizard);
    const faltantes = [];

    if (seccion !== 'objetivos') {
      const respuestas = S.getRespuestasPorSeccion(evaluacionId)[seccion] || [];
      const respondidas = new Set(respuestas.filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).map((r) => String(r.competenciaId)));
      (D.COMPETENCIAS[seccion] || []).forEach((c) => {
        if (!respondidas.has(String(c.id))) {
          faltantes.push(Array.from(wizard.querySelectorAll('.competency-card')).find((el) => el.dataset.competenciaId === String(c.id)));
        }
      });
    } else if (state.wizard.tipo === 'lider') {
      const objetivos = S.getObjetivos(evaluacionId) || [];
      const filas = wizard.querySelectorAll('.objetivo-row');
      filas.forEach((fila, i) => {
        const o = objetivos.find((x) => Number(x.index) === i);
        if (!o || o.calificacion === '' || o.calificacion === null || o.calificacion === undefined) faltantes.push(fila);
      });
    } else {
      const objetivos = S.getObjetivos(evaluacionId) || [];
      const filas = wizard.querySelectorAll('.objetivo-row');
      filas.forEach((fila, i) => {
        const o = objetivos.find((x) => Number(x.index) === i);
        const tieneAlgo = o && ((o.descripcion || '').trim() || (o.resultado || '').trim() || o.calificacion);
        if (tieneAlgo && (!(o.descripcion || '').trim() || !o.calificacion)) faltantes.push(fila);
      });
      if (!objetivos.some((o) => (o.descripcion || '').trim() && o.calificacion)) {
        if (!faltantes.length && filas[0]) faltantes.push(filas[0]);
      }
    }

    return marcarErroresYEnfocar(faltantes);
  }

  const Actions = {
    logout,
    async solicitarCodigo(numeroEmpleado) {
      state.login.error = null; state.login.info = null;
      if (!numeroEmpleado) { state.login.error = 'Captura tu número de empleado.'; render(); return; }
      state.login.loading = true; state.login.numeroEmpleado = numeroEmpleado; render();
      try {
        const resp = await A.requestCode(numeroEmpleado);
        state.login.paso = 'validar';
        state.login.maskedEmail = resp.maskedEmail || null;
        state.login.loading = false;
        state.login.info = null;
        render();
      } catch (err) {
        console.error('Error al solicitar código', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    async validarCodigo() {
      const codigo = ($('#loginCodigo') || {}).value || '';
      state.login.error = null; state.login.info = null; state.login.loading = true; render();
      try {
        const resp = await A.verifyCode(state.login.numeroEmpleado, codigo.trim());
        const appUser = A.getAppUser();
        state.user = appUser;
        S.addAudit(appUser.nombre, 'Inicio de sesión', 'usuarios', appUser.empleado, null, appUser.perfil);
        resetLoginState('solicitar');
        irAHomeDePerfil(appUser.perfil);
      } catch (err) {
        console.error('Error al validar código', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    async reenviarCodigo() {
      await Actions.solicitarCodigo(state.login.numeroEmpleado);
      state.login.info = 'Se envió un nuevo código.';
      render();
    },
    corregirEmpleado() {
      A.limpiarPendiente();
      resetLoginState('solicitar');
      render();
    },
    async quickLogin(numeroEmpleado) {
      if (global.APP_CONFIG.mode === 'api') return; // solo disponible en modo demo
      state.login.error = null; state.login.info = null; state.login.loading = true; render();
      try {
        await A.requestCode(numeroEmpleado);
        const resp = await A.verifyCode(numeroEmpleado, global.APP_CONFIG.demoCode);
        const appUser = A.getAppUser();
        state.user = appUser;
        S.addAudit(appUser.nombre, 'Inicio de sesión', 'usuarios', appUser.empleado, null, appUser.perfil);
        resetLoginState('solicitar');
        irAHomeDePerfil(appUser.perfil);
      } catch (err) {
        console.error('Error en acceso rápido', err);
        state.login.loading = false;
        state.login.error = mensajeErrorLogin(err);
        render();
      }
    },
    comenzarEvaluacion() {
      marcarIntroVista();
      navigate('#/colaborador/autoevaluacion');
    },
    wizardNext(seccionActual) {
      if (seccionActual !== 'resumen') {
        const ev = { id: state.wizard.evaluacionId };
        const seccion = seccionActual;
        const faltantes = validarSeccionVisual(ev.id, seccion);
        if (faltantes) {
          alert(`No puedes continuar. Tienes ${faltantes} campo${faltantes === 1 ? '' : 's'} pendiente${faltantes === 1 ? '' : 's'}. Revisa lo marcado en rojo.`);
          return;
        }
      }
      state.wizard.seccionIdx = Math.min(state.wizard.seccionIdx + 1, SECCIONES_WIZARD.length - 1);
      render();
    },
    wizardPrev() { state.wizard.seccionIdx = Math.max(state.wizard.seccionIdx - 1, 0); render(); },
    irSeccionWizard(idx) { state.wizard.seccionIdx = Math.max(0, Math.min(Number(idx) || 0, SECCIONES_WIZARD.length - 1)); render(); },
    guardarProgresoVisual() { const btn = document.querySelector('.premium-save-btn'); if (!btn) return; const original = btn.textContent; btn.textContent = '✓ Guardado'; btn.classList.add('saved'); setTimeout(() => { btn.textContent = original; btn.classList.remove('saved'); }, 1400); },
    rate(evaluacionId, seccion, competenciaId, valor) {
      const existentes = S.getRespuestas(evaluacionId);
      const actual = existentes.find((r) => r.competenciaId === competenciaId);
      S.saveRespuesta(evaluacionId, seccion, competenciaId, valor, actual ? actual.comentario : '');
      const card = Array.from(document.querySelectorAll('.competency-card')).find((el) => el.dataset.competenciaId === String(competenciaId));
      if (card) card.classList.remove('validation-error');
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
      const fila = document.querySelector(`.objetivo-row[data-idx="${index}"]`);
      if (fila && (o.descripcion || '').trim() && o.calificacion) fila.classList.remove('validation-error');
    },
    quitarObjetivo(evaluacionId, index) { S.removeObjetivo(evaluacionId, index); render(); },
    enviarAutoevaluacion() {
      if (!$('#confirmEnvioAuto').checked) { alert('Confirma que la información es correcta antes de enviar.'); return; }
      const evaluacionId = state.wizard.evaluacionId;
      for (let i = 0; i < SECCIONES_WIZARD.length - 1; i++) {
        const sec = SECCIONES_WIZARD[i];
        const incompleta = sec === 'objetivos'
          ? !S.getObjetivos(evaluacionId).some((o) => (o.descripcion || '').trim() && o.calificacion)
          : (S.getRespuestasPorSeccion(evaluacionId)[sec] || []).filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).length < D.COMPETENCIAS[sec].length;
        if (incompleta) {
          state.wizard.seccionIdx = i; render();
          setTimeout(() => {
            const n = validarSeccionVisual(evaluacionId, sec);
            alert(`No puedes enviar. Tienes ${n || 'campos'} pendientes; revisa lo marcado en rojo.`);
          }, 0);
          return;
        }
      }
      const objetivos = S.getObjetivos(evaluacionId).filter((o) => o.descripcion && o.descripcion.trim());
      if (!objetivos.length) { alert('Registra al menos un objetivo antes de enviar.'); return; }
      S.completarEvaluacion(evaluacionId, state.user.nombre);
      navigate('#/colaborador/enviado');
    },
    editarObjetivoLider(evaluacionId, index, descripcion, resultado, calificacion) {
      S.saveObjetivo(evaluacionId, index, descripcion, resultado, calificacion);
      const fila = document.querySelectorAll('.objetivo-row')[index];
      if (fila && calificacion) fila.classList.remove('validation-error');
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
      for (let i = 0; i < SECCIONES_WIZARD.length - 1; i++) {
        const sec = SECCIONES_WIZARD[i];
        const incompleta = sec === 'objetivos'
          ? S.getObjetivos(evaluacionId).some((o) => !o.calificacion)
          : (S.getRespuestasPorSeccion(evaluacionId)[sec] || []).filter((r) => r.valor !== '' && r.valor !== null && r.valor !== undefined).length < D.COMPETENCIAS[sec].length;
        if (incompleta) {
          state.wizard.seccionIdx = i; render();
          setTimeout(() => {
            const n = validarSeccionVisual(evaluacionId, sec);
            alert(`No puedes enviar. Tienes ${n || 'campos'} pendientes; revisa lo marcado en rojo.`);
          }, 0);
          return;
        }
      }
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
    selNinebox(numero) { state.nineboxSel = numero; state.nineboxSelEmpleado = null; render(); },
    selNineboxColaborador(empleado) {
      const col = S.getColaborador(empleado);
      const periodoId = state.periodo.id;
      const resLider = S.getUltimoResultadoPorOrigen(empleado, periodoId, 'lider');
      const cuad = resLider ? C.asignarCuadrante(resLider.promedios.actitud, resLider.promedios.desempeno) : null;
      state.nineboxSelEmpleado = empleado;
      state.nineboxSel = cuad ? cuad.cuadrante : state.nineboxSel;
      render();
    },
    limpiarSeleccionNinebox() { state.nineboxSelEmpleado = null; render(); },
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
      A.clearSession();
      state.user = null;
      resetLoginState('solicitar');
      location.hash = '#/login';
      render();
    },
    setFiltroUsuarios(campo, valor) { state.usuariosFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosUsuarios() { state.usuariosFiltros = {}; render(); },
    setFiltroJerarquias(campo, valor) { state.jerarquiasFiltros[campo] = valor || undefined; render(); },
    limpiarFiltrosJerarquias() { state.jerarquiasFiltros = {}; render(); }
  };

  global.App = Actions;
  global.addEventListener('hashchange', render);
  global.addEventListener('DOMContentLoaded', render);
  // Si el backend responde 401 (token inválido/vencido en modo API), api.js
  // dispara este evento; auth.js ya limpió la sesión, aquí solo refrescamos
  // la pantalla para mandar al usuario al login con el aviso correspondiente.
  global.addEventListener(global.EDDApi.EVENTO_SESION_EXPIRADA, () => { if (state.user) render(); });
  // Verificación periódica de expiración por tiempo (no depende de que el
  // usuario haga clic en algo): si la sesión ya venció, se refleja en la UI
  // sin esperar a la siguiente navegación.
  setInterval(() => { if (state.user && !A.getSession()) render(); }, 15000);
})(window);
