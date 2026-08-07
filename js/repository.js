/**
 * repository.js
 * ---------------------------------------------------------------------------
 * Capa ÚNICA de acceso a datos ("data service") de la Plataforma EDD Inter-Con.
 *
 * Objetivo de este archivo (y de esta iteración): que `app.js` deje de saber
 * si un dato viene de `localStorage` (modo demo, vía `storage.js`) o de n8n
 * (modo API, vía `api.js`). `app.js` solo debe llamar a `EDDRepo.<función>` y
 * recibir siempre la MISMA forma de objeto, sin importar el modo.
 *
 * La selección demo/api se resuelve AQUÍ, una sola vez por función, leyendo
 * `APP_CONFIG.mode`. Por eso `app.js` no debe (y ya no necesita) tener
 * `if (mode === 'api')` repartido por todos lados.
 *
 * IMPORTANTE — qué NO cambia esta iteración (ver brief "PREPARAR PERSISTENCIA
 * REAL DE EVALUACIONES"):
 *   - El login (auth.js) no se toca. Este archivo solo REUTILIZA la sesión ya
 *     autenticada (EDDAuth.getSession/getAppUser) para saber quién es el
 *     usuario en turno (para campos de auditoría como "usuario" en demo).
 *   - `calculations.js` sigue siendo la ÚNICA fuente de verdad de las
 *     fórmulas (pesos, umbrales, promedios, nivel, cuadrante). Este archivo
 *     NUNCA recalcula una fórmula: en modo demo, arma los objetos "forma API"
 *     leyendo los resultados que `storage.js` ya calculó con `EDDCalc` al
 *     completar una evaluación o calibración (`S.getUltimoResultadoPorOrigen`,
 *     `S.getCalibracion`); en modo API, simplemente pasa a través lo que
 *     n8n ya haya calculado.
 *   - Las vistas de captura profundas (wizard de autoevaluación/evaluación
 *     de líder, comparación auto-vs-líder, Nine Box, ficha ejecutiva de
 *     retroalimentación) SIGUEN leyendo directamente de `EDDStorage` en esta
 *     iteración, exactamente igual que antes — no se tocó su render ni su
 *     lógica, por eso "no se rediseña nada". Lo que SÍ pasa por este
 *     repositorio ahora: (a) los listados de alto nivel que alimentan los
 *     dashboards (`getMisEvaluaciones`, `getEquipoLider`, `getPeriodoActivo`),
 *     y (b) TODAS las acciones de guardado/envío/liberación/cierre (que antes
 *     llamaban a `storage.js` directo desde los `onclick`). Ver README,
 *     sección 14, para el detalle exacto de qué se conectó y qué queda
 *     pendiente para una iteración futura.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';
  const D = global.EDDData;
  const C = global.EDDCalc;
  const S = global.EDDStorage;
  const Api = global.EDDApi;

  function cfg() { return global.APP_CONFIG; }
  function enModoApi() { return cfg().mode === 'api'; }

  // Nombre del usuario en turno, para campos de auditoría en modo demo
  // (S.addAudit / S.crearOActualizarCalibracion ya piden "usuario" como
  // string). Se lee de auth.js — no se duplica lógica de sesión aquí.
  function usuarioActual() {
    try {
      const session = global.EDDAuth.getSession();
      const u = session ? global.EDDAuth.getAppUser(session) : null;
      return u ? u.nombre : 'Sistema';
    } catch (e) { return 'Sistema'; }
  }

  // Misma fecha de referencia y misma fórmula que app.js (función interna
  // `esVencido`/`fechaHoy`). Se duplica a propósito: es una utilidad de
  // comparación de fechas de una línea, no una fórmula de negocio (esas
  // viven únicamente en calculations.js). Si se ajusta la fecha de
  // referencia de la demo en app.js, ajustar también aquí.
  function fechaHoy() { return '2026-07-28'; }
  function esVencido(fechaLimite) { return !!fechaLimite && fechaHoy() > fechaLimite; }

  // ===========================================================================
  // ADAPTADORES DE FORMA — demo (storage.js) -> forma canónica (brief secc. 6/8/9/17/19)
  // ===========================================================================

  // El motor de estados de storage.js (`ev.estado`) solo distingue 3 valores
  // por evaluación individual (No iniciada / En progreso / Completada). El
  // vocabulario canónico del brief (sección 7) distingue por tipo
  // (autoevaluación vs. líder). Este mapeo traduce uno a otro SIN cambiar el
  // motor de estados real (que sigue intacto en storage.js/app.js).
  function estadoEvaluacionCanonico(ev) {
    if (!ev) return 'No iniciada';
    const E = D.ESTADOS;
    if (ev.estado === E.NO_INICIADA) return 'No iniciada';
    if (ev.estado === E.EN_PROGRESO) return ev.tipo === 'lider' ? 'En evaluación del líder' : 'En autoevaluación';
    if (ev.estado === E.COMPLETADA) return ev.tipo === 'lider' ? 'Evaluación del líder enviada' : 'Autoevaluación enviada';
    return ev.estado;
  }

  function respuestaACanonica(r) {
    return {
      idRespuesta: r.evaluacionId + ':' + r.competenciaId,
      idEvaluacion: r.evaluacionId,
      idCompetencia: r.competenciaId,
      seccion: r.seccion,
      valor: r.valor, // '1'..'5' o 'N/A' — nunca se convierte a 0 (ver brief secc. 8)
      comentario: r.comentario || ''
    };
  }

  function objetivoACanonico(o) {
    return {
      idObjetivo: o.evaluacionId + ':' + o.index,
      idEvaluacion: o.evaluacionId,
      orden: o.index,
      nombreObjetivo: o.descripcion || '',
      tipoObjetivo: 'Individual', // storage.js no distingue Corporativo/Área/Individual todavía
      descripcion: o.descripcion || '',
      meta: '',
      unidadMedida: '',
      resultadoReal: o.resultado || '',
      resultadoObtenido: o.resultado || '',
      ponderacion: null, // ver brief secc. 10 — la ponderación por objetivo aún no se captura en el wizard actual
      cumplimiento: null,
      calificacion: (o.calificacion === '' || o.calificacion === undefined || o.calificacion === null) ? null : Number(o.calificacion),
      evidencia: ''
    };
  }

  function evaluacionACanonica(ev) {
    if (!ev) return null;
    const resultado = S.getUltimoResultadoPorOrigen(ev.colaboradorId, ev.periodoId, ev.tipo);
    return {
      idEvaluacion: ev.id,
      periodo: ev.periodoId,
      numeroEmpleado: ev.colaboradorId,
      numeroLider: ev.liderId,
      tipo: ev.tipo === 'lider' ? 'lider' : 'autoevaluacion',
      estado: estadoEvaluacionCanonico(ev),
      fortalezas: ev.fortalezas || '',
      comentarios: ev.comentarios || '',
      creada: ev.createdAt,
      actualizada: ev.updatedAt,
      completadaEl: ev.completedAt,
      resultadoValores: resultado ? resultado.promedios.actitud : null,
      resultadoHabilidades: resultado ? resultado.promedios.habilidades : null,
      resultadoConocimientos: resultado ? resultado.promedios.conocimientos : null,
      resultadoObjetivos: resultado ? resultado.promedios.objetivos : null,
      resultadoPonderado: resultado ? resultado.puntajes.total : null,
      // La brecha global (auto vs. líder) es una comparación entre DOS
      // evaluaciones, no una propiedad de una sola — se expone en la vista
      // de comparación (sin cambios, ver README) y no se duplica aquí.
      brechaGlobal: null,
      bloqueada: ev.estado === D.ESTADOS.COMPLETADA,
      fechaBloqueo: ev.estado === D.ESTADOS.COMPLETADA ? ev.completedAt : null,
      respuestas: S.getRespuestas(ev.id).map(respuestaACanonica),
      objetivos: S.getObjetivos(ev.id).map(objetivoACanonico)
    };
  }

  function calibracionACanonica(colaboradorId, periodoId) {
    const cal = S.getCalibracion(colaboradorId, periodoId);
    const resAuto = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'autoevaluacion');
    const resLider = S.getUltimoResultadoPorOrigen(colaboradorId, periodoId, 'lider');
    const cuad = resLider ? C.asignarCuadrante(resLider.promedios.actitud, resLider.promedios.desempeno) : null;
    return {
      idCalibracion: cal ? cal.id : null,
      numeroEmpleado: String(colaboradorId),
      periodo: periodoId,
      resultadoAutoevaluacion: resAuto ? resAuto.puntajes.total : null,
      resultadoLider: resLider ? resLider.puntajes.total : null,
      diferenciaGeneral: cal && cal.diferenciaGeneral !== undefined ? cal.diferenciaGeneral : null,
      ajusteRH: cal ? (cal.ajuste !== undefined ? cal.ajuste : null) : null,
      justificacionAjuste: cal ? (cal.justificacion || null) : null,
      resultadoCalibrado: cal ? (cal.resultadoCalibrado !== undefined ? cal.resultadoCalibrado : null) : null,
      puntajeDesempeno: resLider ? resLider.puntajes.total : null,
      nivelDesempeno: resLider ? resLider.nivel : null,
      // "Potencial preliminar" (ver README 4.3 / brief secc. 17): en esta
      // beta se estima con la sección Actitud de la evaluación del líder —
      // NO es un cuestionario de potencial nuevo, tal como pide el brief.
      puntajePotencialPreliminar: resLider ? resLider.promedios.actitud : null,
      nivelPotencial: null,
      cuadranteNineBox: cuad ? cuad.cuadrante : null,
      responsableRH: cal ? (cal.responsable || null) : null,
      retroalimentacionHabilitada: cal ? !!cal.retroHabilitada : false
    };
  }

  function retroalimentacionACanonica(colaboradorId, periodoId) {
    const cal = S.getCalibracion(colaboradorId, periodoId);
    const areas = S.getAreasOportunidad(colaboradorId, periodoId);
    const planes = S.getPlanesDesarrollo(colaboradorId, periodoId);
    const evidencias = S.getEvidencias(colaboradorId, periodoId);
    let estado = 'Pendiente';
    if (cal && cal.aceptacionColaborador) estado = 'Retroalimentación realizada';
    else if (cal && cal.retroHabilitada) estado = 'Retroalimentación habilitada';
    return {
      idRetroalimentacion: cal ? cal.id : null,
      numeroEmpleado: String(colaboradorId),
      periodo: periodoId,
      fortalezas: null, // capturado en la evaluación del líder (ev.fortalezas), no en un campo propio de retro
      areasOportunidad: areas.map((a) => ({ id: a.id, area: a.area, planMejora: a.planMejora })),
      planDesarrollo: planes.map((p) => ({ id: p.id, competencia: p.competencia, accion: p.accion, responsable: p.responsable, fechaCompromiso: p.fechaCompromiso, estado: p.estado })),
      cronogramaAcciones: S.getAcciones ? S.getAcciones(colaboradorId, periodoId).map((a) => ({ id: a.id, accion: a.accion, responsable: a.responsable, semanaInicio: a.semanaInicio, semanaFin: a.semanaFin, estado: a.estado, avance: a.avance })) : [],
      comentariosLider: null,
      comentariosRH: cal ? (cal.observacionesRH || null) : null,
      fechaRetroalimentacion: cal ? (cal.fechaAceptacion || null) : null,
      responsableRetroalimentacion: cal ? (cal.responsable || null) : null,
      evidencias: evidencias.map((e) => ({ id: e.id, nombreArchivo: e.nombreArchivo, tipo: e.tipo, comentario: e.comentario })),
      estado,
      aceptacionColaborador: cal ? !!cal.aceptacionColaborador : false,
      fechaCierre: cal ? (cal.fechaAceptacion || null) : null
    };
  }

  // ===========================================================================
  // IMPLEMENTACIÓN — MODO DEMO (localStorage vía storage.js)
  // ===========================================================================
  const demoImpl = {
    getPeriodoActivo() { return S.getPeriodoActivo(); }, // misma forma de siempre — sin adaptar, para no romper nada

    getConfiguracion() {
      return {
        PESO_OBJETIVOS: C.PESOS_SECCION.objetivos,
        PESO_VALORES_ACTITUD: C.PESOS_SECCION.actitud,
        PESO_HABILIDADES: C.PESOS_SECCION.habilidades,
        PESO_CONOCIMIENTOS: C.PESOS_SECCION.conocimientos,
        BRECHA_ADVERTENCIA: C.CONFIG_BRECHA.alineadaMax,
        BRECHA_SIGNIFICATIVA: C.CONFIG_BRECHA.revisarMax,
        // CONFIG_9BOX en calculations.js usa una escala 1-5 (nivel1Max/
        // nivel2Max/nivel3Max), no 0-100. Se exponen tal cual bajo los
        // nombres canónicos del brief; quien consuma /configuracion en modo
        // API debe saber que estos umbrales están en escala 1-5, igual que
        // los promedios de sección.
        NINEBOX_BAJO_MAX: C.CONFIG_9BOX.nivel1Max,
        NINEBOX_MEDIO_MAX: C.CONFIG_9BOX.nivel2Max
      };
    },

    getMisEvaluaciones(numeroEmpleado, periodoId) {
      const auto = S.getEvaluacion(numeroEmpleado, periodoId, 'autoevaluacion');
      const lider = S.getEvaluacion(numeroEmpleado, periodoId, 'lider');
      return [auto, lider].filter(Boolean).map(evaluacionACanonica);
    },

    getEvaluacion(idEvaluacion) {
      const ev = S.load().evaluaciones.find((e) => e.id === idEvaluacion);
      return evaluacionACanonica(ev);
    },

    guardarAutoevaluacion(idEvaluacion, data) { aplicarPatchEvaluacion(idEvaluacion, data); },
    enviarAutoevaluacion(idEvaluacion) { return S.completarEvaluacion(idEvaluacion, usuarioActual()); },

    getEquipoLider(numeroLider, periodoId) {
      return S.getColaboradoresDeLider(numeroLider).map((c) => ({
        numeroEmpleado: c.empleado,
        nombreCompleto: c.nombre,
        puesto: c.puesto,
        area: c.area,
        estadoEvaluacion: estadoEquipoCanonico(c.empleado, periodoId)
      }));
    },

    getEvaluacionesEquipo(numeroLider, periodoId) {
      return S.getColaboradoresDeLider(numeroLider)
        .map((c) => S.getEvaluacion(c.empleado, periodoId, 'lider'))
        .filter(Boolean)
        .map(evaluacionACanonica);
    },

    guardarEvaluacionLider(idEvaluacion, data) { aplicarPatchEvaluacion(idEvaluacion, data); },
    enviarEvaluacionLider(idEvaluacion) { return S.completarEvaluacion(idEvaluacion, usuarioActual()); },

    getCalibraciones(periodoId) {
      return S.getTodosColaboradores().map((c) => calibracionACanonica(c.empleado, periodoId));
    },
    getCalibracion(numeroEmpleado, periodoId) { return calibracionACanonica(numeroEmpleado, periodoId); },
    guardarCalibracion(numeroEmpleado, data) {
      const periodoId = (data && data.periodo) || S.getPeriodoActivo().id;
      const cambios = Object.assign({}, data);
      delete cambios.periodo;
      if (!cambios._motivo) cambios._motivo = cambios.justificacion || 'Calibración de RH';
      return S.crearOActualizarCalibracion(numeroEmpleado, periodoId, cambios, usuarioActual());
    },
    liberarCalibracion(numeroEmpleado, periodoId) {
      const p = periodoId || S.getPeriodoActivo().id;
      return S.habilitarRetroalimentacion(numeroEmpleado, p, usuarioActual());
    },

    getRetroalimentacion(numeroEmpleado, periodoId) {
      const p = periodoId || S.getPeriodoActivo().id;
      return retroalimentacionACanonica(numeroEmpleado, p);
    },
    guardarRetroalimentacion(numeroEmpleado, data) {
      const periodoId = (data && data.periodo) || S.getPeriodoActivo().id;
      const usuario = usuarioActual();
      if (data.agregarAreaOportunidad) {
        const a = data.agregarAreaOportunidad;
        S.addAreaOportunidad(numeroEmpleado, periodoId, a.area, a.planMejora, usuario);
      }
      if (data.quitarAreaOportunidadId) S.removeAreaOportunidad(data.quitarAreaOportunidadId, usuario);
      if (data.agregarPlanDesarrollo) {
        S.addPlanDesarrollo(numeroEmpleado, periodoId, data.agregarPlanDesarrollo, usuario);
      }
      if (data.quitarPlanDesarrolloId) S.removePlanDesarrollo(data.quitarPlanDesarrolloId, usuario);
      if (data.agregarEvidencia) {
        const e = data.agregarEvidencia;
        S.addEvidencia(numeroEmpleado, periodoId, e.nombreArchivo, e.tipo, usuario, e.comentario || '');
      }
      return retroalimentacionACanonica(numeroEmpleado, periodoId);
    },
    cerrarRetroalimentacion(numeroEmpleado, periodoId) {
      const p = periodoId || S.getPeriodoActivo().id;
      return S.aceptarResultado(numeroEmpleado, p, usuarioActual());
    }
  };

  // Aplica un patch parcial {respuestas?, objetivos?, fortalezas?, comentarios?}
  // sobre una evaluación existente, usando las mismas funciones granulares de
  // storage.js que ya usaba app.js directamente (mismo comportamiento, un
  // nivel de indirección extra). Compartida por autoevaluación y evaluación
  // de líder porque storage.js no distingue el tipo a este nivel.
  function aplicarPatchEvaluacion(idEvaluacion, data) {
    if (!data) return;
    if (Array.isArray(data.respuestas)) {
      data.respuestas.forEach((r) => S.saveRespuesta(idEvaluacion, r.seccion, r.idCompetencia || r.competenciaId, r.valor, r.comentario));
    }
    if (Array.isArray(data.objetivos)) {
      data.objetivos.forEach((o) => S.saveObjetivo(idEvaluacion, o.orden !== undefined ? o.orden : o.index, o.descripcion, o.resultadoObtenido !== undefined ? o.resultadoObtenido : o.resultado, o.calificacion));
    }
    if (data.fortalezas !== undefined || data.comentarios !== undefined) {
      const db = S.load();
      const ev = db.evaluaciones.find((e) => e.id === idEvaluacion);
      if (ev) {
        if (data.fortalezas !== undefined) ev.fortalezas = data.fortalezas;
        if (data.comentarios !== undefined) ev.comentarios = data.comentarios;
        S.persist();
      }
    }
  }

  // "Estado del equipo" tal como lo necesita el dashboard del líder (brief
  // secc. 15): usa el mismo estadoProceso() de siempre (sin cambiar el
  // motor de estados) y lo traduce al vocabulario canónico.
  function estadoEquipoCanonico(colaboradorId, periodoId) {
    const E = D.ESTADOS;
    const interno = S.estadoProceso(colaboradorId, periodoId);
    const mapa = {};
    mapa[E.NO_INICIADA] = 'No iniciada';
    mapa[E.EN_PROGRESO] = 'En autoevaluación';
    mapa[E.PENDIENTE_LIDER] = 'En evaluación del líder';
    mapa[E.PENDIENTE_CALIBRACION] = 'En calibración';
    mapa[E.CALIBRADA] = 'Calibrada';
    mapa[E.RETRO_PENDIENTE] = 'Retroalimentación habilitada';
    mapa[E.CERRADA] = 'Cerrada';
    return mapa[interno] || interno;
  }

  // ===========================================================================
  // IMPLEMENTACIÓN — MODO API (n8n vía api.js)
  // ===========================================================================
  const apiImpl = {
    async getPeriodoActivo() {
      const p = await Api.getPeriodoActivo();
      // Se traduce de vuelta a la forma legada que ya usa el resto de app.js
      // (state.periodo.id/nombre/fechaLimiteAutoevaluacion/fechaLimiteLider/
      // activo) para no tener que tocar ninguna vista todavía. La forma
      // canónica completa que manda n8n queda disponible en `_raw`.
      return {
        id: p.idPeriodo, nombre: p.nombre,
        fechaLimiteAutoevaluacion: p.fechaLimiteAutoevaluacion, fechaLimiteLider: p.fechaLimiteEvaluacionLider,
        activo: p.estadoPeriodo !== 'Cerrado', _raw: p
      };
    },
    // No hay fallback silencioso en modo API a propósito (ver brief secc.
    // 11: "En modo API no deben cambiarse silenciosamente las reglas").
    // Si /configuracion falla, el error se propaga; quien llame decide.
    getConfiguracion() { return Api.getConfiguracion(); },

    getMisEvaluaciones() { return Api.evaluacionesMias(); },
    getEvaluacion(idEvaluacion) { return Api.evaluacionPorId(idEvaluacion); },
    guardarAutoevaluacion(idEvaluacion, data) { return Api.autoevaluacionGuardar(idEvaluacion, data); },
    enviarAutoevaluacion(idEvaluacion) { return Api.autoevaluacionEnviar(idEvaluacion); },

    getEquipoLider() { return Api.liderEquipo(); },
    getEvaluacionesEquipo() { return Api.liderEvaluaciones(); },
    guardarEvaluacionLider(idEvaluacion, data) { return Api.liderEvaluacionGuardar(idEvaluacion, data); },
    enviarEvaluacionLider(idEvaluacion) { return Api.liderEvaluacionEnviar(idEvaluacion); },

    getCalibraciones() { return Api.adminCalibraciones(); },
    getCalibracion(idCalibracion) { return Api.adminCalibracionPorId(idCalibracion); },
    guardarCalibracion(idCalibracion, data) { return Api.adminCalibracionGuardar(idCalibracion, data); },
    liberarCalibracion(idCalibracion) { return Api.adminCalibracionLiberar(idCalibracion); },

    getRetroalimentacion(id) { return Api.retroalimentacionPorId(id); },
    guardarRetroalimentacion(id, data) { return Api.retroalimentacionGuardar(id, data); },
    cerrarRetroalimentacion(id) { return Api.retroalimentacionCerrar(id); }
  };

  // ===========================================================================
  // DESPACHO — una sola vez por función, aquí y no en app.js
  // ===========================================================================
  function elegir(nombre) { return enModoApi() ? apiImpl[nombre] : demoImpl[nombre]; }

  const EDDRepo = {
    getPeriodoActivo(...a) { return elegir('getPeriodoActivo')(...a); },
    getConfiguracion(...a) { return elegir('getConfiguracion')(...a); },

    getMisEvaluaciones(...a) { return elegir('getMisEvaluaciones')(...a); },
    getEvaluacion(...a) { return elegir('getEvaluacion')(...a); },
    guardarAutoevaluacion(...a) { return elegir('guardarAutoevaluacion')(...a); },
    enviarAutoevaluacion(...a) { return elegir('enviarAutoevaluacion')(...a); },

    getEquipoLider(...a) { return elegir('getEquipoLider')(...a); },
    getEvaluacionesEquipo(...a) { return elegir('getEvaluacionesEquipo')(...a); },
    guardarEvaluacionLider(...a) { return elegir('guardarEvaluacionLider')(...a); },
    enviarEvaluacionLider(...a) { return elegir('enviarEvaluacionLider')(...a); },

    getCalibraciones(...a) { return elegir('getCalibraciones')(...a); },
    getCalibracion(...a) { return elegir('getCalibracion')(...a); },
    guardarCalibracion(...a) { return elegir('guardarCalibracion')(...a); },
    liberarCalibracion(...a) { return elegir('liberarCalibracion')(...a); },

    getRetroalimentacion(...a) { return elegir('getRetroalimentacion')(...a); },
    guardarRetroalimentacion(...a) { return elegir('guardarRetroalimentacion')(...a); },
    cerrarRetroalimentacion(...a) { return elegir('cerrarRetroalimentacion')(...a); },

    // Expuestos por si una vista futura necesita el mismo adaptador de forma
    // sin pasar por una función de alto nivel (uso interno/pruebas).
    _internal: { evaluacionACanonica, calibracionACanonica, retroalimentacionACanonica, estadoEquipoCanonico, esVencido }
  };

  global.EDDRepo = EDDRepo;
})(window);
