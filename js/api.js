/**
 * api.js
 * ---------------------------------------------------------------------------
 * Cliente HTTP centralizado de la Plataforma EDD Inter-Con (Beta 3).
 *
 * TODAS las peticiones al backend (n8n) deben pasar por apiRequest() /
 * las funciones EDDApi.* de este archivo. Ninguna otra pantalla debe hacer
 * fetch() directamente: así, cuando exista el backend real, solo hay que
 * ajustar este archivo (URLs, payloads, manejo de errores) sin tocar app.js.
 *
 * El frontend nunca habla con Airtable directamente; siempre pasa por los
 * webhooks de n8n descritos abajo (ver también README, sección "Arquitectura
 * objetivo" y "Endpoints previstos").
 *
 * Esta beta prepara el cliente y los endpoints, pero no requiere que n8n
 * esté funcionando: en modo "demo" estas funciones no se invocan (auth.js y
 * el resto de la app usan EDDStorage/localStorage); en modo "api", si no hay
 * backend real detrás de apiBaseUrl, las llamadas fallarán con un
 * ApiError de tipo "network", que las pantallas deben mostrar como "Error de
 * conexión" (ver sección 12 del brief).
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  /**
   * Error de API tipado, para que las pantallas puedan decidir el mensaje
   * (nunca mostrar el detalle técnico/trazas al usuario final; eso solo va a
   * consola, ver requerimiento 12 del brief).
   *   tipo: 'network' | 'timeout' | 'unauthorized' | 'http' | 'parse'
   */
  function ApiError(tipo, mensaje, status, detalle) {
    this.name = 'ApiError';
    this.tipo = tipo;
    this.message = mensaje;
    this.status = status || null;
    this.detalle = detalle;
  }
  ApiError.prototype = Object.create(Error.prototype);

  // Evento global que auth.js escucha para cerrar sesión automáticamente
  // cuando el backend responde 401 (token inválido o expirado).
  const EVENTO_SESION_EXPIRADA = 'edd:session-expired';

  // Cache corto + deduplicación de requests de lectura. Evita repetir los
  // mismos GET al cambiar de pestaña o cuando dos vistas piden el mismo dato
  // casi al mismo tiempo. Nunca cachea escrituras.
  const readCache = new Map();
  const inflight = new Map();
  function cacheKey(endpoint) { return String(endpoint || ''); }
  function clearReadCache(prefix) {
    if (!prefix) { readCache.clear(); return; }
    for (const key of readCache.keys()) if (key.indexOf(prefix) !== -1) readCache.delete(key);
  }

  function getConfig() {
    return global.APP_CONFIG || {
      apiBaseUrl: '', sessionStorageKey: 'edd_session', requestTimeout: 15000
    };
  }

  // Lee el token directamente de sessionStorage (y no de EDDAuth) para evitar
  // una dependencia circular entre api.js y auth.js: auth.js se construye
  // ENCIMA de api.js, no al revés.
  function getStoredToken() {
    try {
      const cfg = getConfig();
      const raw = sessionStorage.getItem(cfg.sessionStorageKey);
      if (!raw) return null;
      const sess = JSON.parse(raw);
      return (sess && sess.token) ? sess.token : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Petición centralizada a la API (n8n).
   * @param {string} endpoint - ej. '/auth/verify-code'
   * @param {object} options - { method, body, auth (bool, default true), signalExterno }
   */
  async function apiRequest(endpoint, options) {
    options = options || {};
    const cfg = getConfig();
    const method = options.method || (options.body ? 'POST' : 'GET');
    const url = (cfg.apiBaseUrl || '').replace(/\/$/, '') + endpoint;

    const headers = { 'Content-Type': 'application/json' };
    const isGet = method === 'GET';
    const cKey = cacheKey(endpoint);
    const cacheMs = isGet ? Number(options.cacheMs || 0) : 0;
    if (cacheMs > 0 && !options.forceRefresh) {
      const cached = readCache.get(cKey);
      if (cached && (Date.now() - cached.at) < cacheMs) return cached.data;
      if (inflight.has(cKey)) return inflight.get(cKey);
    }
    if (options.auth !== false) {
      const token = getStoredToken();
      if (token) headers['Authorization'] = 'Bearer ' + token;
    }

    const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timeoutMs = options.timeoutMs || cfg.requestTimeout || 15000;
    let timeoutId = null;
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    const execute = async () => {
      let response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller ? controller.signal : undefined
        });
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error('EDDApi: error de red llamando a', endpoint, err);
        const aborted = !!(controller && controller.signal && controller.signal.aborted);
        const abortLike = aborted || (err && (err.name === 'AbortError' || err.code === 20 || /aborted|abort/i.test(String(err.message || ''))));
        if (abortLike) {
          throw new ApiError('timeout', 'La solicitud tardó demasiado. Intenta de nuevo.', null, err);
        }
        throw new ApiError('network', 'No fue posible conectar con el servidor. Verifica tu conexión e intenta de nuevo.', null, err);
      }
      if (timeoutId) clearTimeout(timeoutId);

      if (response.status === 401) {
        try { global.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA)); } catch (e) { /* entornos sin CustomEvent */ }
        throw new ApiError('unauthorized', 'Tu sesión expiró. Inicia sesión nuevamente.', 401);
      }

      let data = null;
      const raw = await response.text();
      if (raw) {
        try { data = JSON.parse(raw); }
        catch (err) {
          console.error('EDDApi: respuesta no válida (no es JSON) de', endpoint, raw);
          throw new ApiError('parse', 'El servidor devolvió una respuesta inesperada.', response.status, raw);
        }
      }

      if (!response.ok) {
        const msg = (data && data.error && data.error.message) ? data.error.message : ((data && data.message) ? data.message : 'Ocurrió un error al procesar la solicitud.');
        console.error('EDDApi: respuesta de error', endpoint, response.status, data);
        throw new ApiError('http', msg, response.status, data);
      }

      if (cacheMs > 0) readCache.set(cKey, { at: Date.now(), data });
      return data;
    };

    if (cacheMs > 0 && !options.forceRefresh) {
      const promise = execute().finally(() => inflight.delete(cKey));
      inflight.set(cKey, promise);
      return promise;
    }
    return execute();
  }

  // ===========================================================================
  // ENDPOINTS PREVISTOS (ver README, sección "Endpoints previstos (n8n)")
  // No es necesario que el backend ya exista para que el frontend quede
  // preparado: estas funciones solo centralizan la forma de llamarlos.
  // ===========================================================================
  const EDDApi = {
    ApiError,
    EVENTO_SESION_EXPIRADA,
    apiRequest,
    clearReadCache,

    // --- Autenticación ---------------------------------------------------
    authRequestCode(numeroEmpleado) {
      return apiRequest('/auth/request-code', { method: 'POST', auth: false, body: { numeroEmpleado } });
    },
    authVerifyCode(numeroEmpleado, codigo, requestId) {
      return apiRequest('/auth/verify-code', { method: 'POST', auth: false, body: { numeroEmpleado, codigo, requestId } });
    },
    authLogout() {
      return apiRequest('/auth/logout', { method: 'POST' });
    },
    authMe(forceRefresh) {
      return apiRequest('/auth/me', { method: 'GET', cacheMs: 60000, forceRefresh: !!forceRefresh, timeoutMs: 10000 });
    },

    // --- Capa de lectura real (Backend Integration v1) -----------------------
    evaluationsMine(forceRefresh) { return apiRequest('/evaluations/mine', { method: 'GET', cacheMs: 15000, forceRefresh: !!forceRefresh, timeoutMs: 12000 }); },
    evaluationDetail(id, forceRefresh) { return apiRequest('/6f123813-cb2b-4698-af51-60fe95ca1b52/evaluations/' + encodeURIComponent(id), { method: 'GET', cacheMs: 30000, forceRefresh: !!forceRefresh, timeoutMs: 30000 }); },
    leaderTeam(forceRefresh) { return apiRequest('/leader/team', { method: 'GET', cacheMs: 20000, forceRefresh: !!forceRefresh, timeoutMs: 12000 }); },
    adminDashboard(forceRefresh) { return apiRequest('/admin/dashboard', { method: 'GET', cacheMs: 20000, forceRefresh: !!forceRefresh, timeoutMs: 15000 }); },
    adminCalibration(forceRefresh) { return apiRequest('/admin/calibration', { method: 'GET', cacheMs: 15000, forceRefresh: !!forceRefresh, timeoutMs: 15000 }); },
    // FIX (cierre E2E): faltaba el webhookId real de n8n en el path dinámico
    // (mismo patrón que ya rompió self-draft/submit-self/leader-draft en su
    // momento). Sin el webhookId, n8n devuelve 404 y el navegador nunca llega
    // al workflow -> "No fue posible conectar con el servidor".
    async saveAdminCalibration(evaluationId, payload) { const r=await apiRequest('/1ff38682-54db-4bc4-a8e5-4d6b9af56404/admin/calibration/' + encodeURIComponent(evaluationId), { method: 'PUT', body: payload, timeoutMs: 30000 }); clearReadCache('/admin/calibration'); return r; },
    async completeAdminCalibration(evaluationId) { const r=await apiRequest('/61a9fc92-586b-4343-a783-e0ceb82ec52a/admin/calibration/' + encodeURIComponent(evaluationId) + '/complete', { method: 'POST', timeoutMs: 30000 }); clearReadCache('/admin/calibration'); clearReadCache('/admin/dashboard'); return r; },
    async releaseResult(evaluationId) {
      // FIX (verificación explícita): antes dependía de
      // APP_CONFIG.endpointOverrides.releaseResultPath, que podía quedar
      // null silenciosamente si alguien reseteaba config.js. URL real de
      // n8n (workflow "EDD - Liberar Resultado", identificador = evaluationId,
      // NUNCA feedbackId) verificada directamente contra la production URL
      // del trigger: https://jmejiaromero.app.n8n.cloud/webhook/fa5dbc0a-401a-4db1-8f95-e480ab620cc7/evaluations/:evaluationId/release
      const r = await apiRequest('/fa5dbc0a-401a-4db1-8f95-e480ab620cc7/evaluations/' + encodeURIComponent(evaluationId) + '/release', { method: 'POST', timeoutMs: 30000 });
      clearReadCache(); return r;
    },

    // --- Retroalimentación y firmas ------------------------------------------
    // FIX (cierre E2E): antes existía un único feedbackAction(key, evaluationId,
    // payload) genérico que reemplazaba ':feedbackId' usando el valor de
    // evaluationId — evaluationId y feedbackId NUNCA son el mismo identificador
    // (feedbackId = ID de Retroalimentaciones, un registro aparte, distinto de
    // la evaluación). Se reemplaza por 5 métodos explícitos, cada uno exige el
    // identificador correcto por nombre — no hay forma de invocarlos con el ID
    // equivocado sin que sea obvio en la firma de la función.
    async confirmFeedbackMeeting(feedbackId) {
      const r = await apiRequest('/f9620b5c-7fe4-4afc-a8d6-164bff48c1d1/feedback/' + encodeURIComponent(feedbackId) + '/confirm-meeting', { method: 'POST', timeoutMs: 30000 });
      clearReadCache(); return r;
    },
    async saveFeedbackAgreements(feedbackId, payload) {
      const r = await apiRequest('/31fcda18-e890-4da7-9d69-ad387e473f12/feedback/' + encodeURIComponent(feedbackId) + '/agreements', { method: 'PUT', body: payload, timeoutMs: 30000 });
      clearReadCache(); return r;
    },
    async releaseFeedbackForSignature(feedbackId) {
      const r = await apiRequest('/2e91868a-6fdb-428a-9a60-5f689316fd9f/feedback/' + encodeURIComponent(feedbackId) + '/release-for-signature', { method: 'POST', timeoutMs: 30000 });
      clearReadCache(); return r;
    },
    async signFeedbackAsLeader(feedbackId, payload) {
      const r = await apiRequest('/d02bdd76-e268-4d1f-adf3-f1afbc75be86/feedback/' + encodeURIComponent(feedbackId) + '/sign-leader', { method: 'POST', body: payload || undefined, timeoutMs: 30000 });
      clearReadCache(); return r;
    },
    // NOTA: no existe un endpoint de "cierre" separado. La firma del
    // colaborador (sign-employee) ES la acción de cierre: el workflow
    // "EDD - Firmar Retroalimentación Colaborador" marca Estado de firma =
    // 'Cerrada' Y cierra la evaluación (Estado general del proceso = 'closed')
    // en la misma transacción. Confirmado por inspección directa del workflow.
    async signFeedbackAsEmployee(feedbackId, payload) {
      const r = await apiRequest('/770a2cff-b447-4880-9289-d6b024645df7/feedback/' + encodeURIComponent(feedbackId) + '/sign-employee', { method: 'POST', body: payload || undefined, timeoutMs: 30000 });
      clearReadCache(); return r;
    },

    // --- Capa de escritura real (Write API v1) ----------------------------
    async initializeMyEvaluation() { const r=await apiRequest('/evaluations/mine/initialize', { method: 'POST' }); clearReadCache('/evaluations/'); return r; },
    async saveSelfDraft(id, payload) { const r=await apiRequest('/28e6125b-64c9-453c-a100-8c77f8ee68b9/evaluations/' + encodeURIComponent(id) + '/self-draft', { method: 'PUT', body: payload, timeoutMs: 12000 }); clearReadCache('/evaluations/'); return r; },
    async submitSelf(id) { const r=await apiRequest('/0a235f4f-46c5-4a9c-bce0-dae3c0a0ab23/evaluations/' + encodeURIComponent(id) + '/submit-self', { method: 'POST', timeoutMs: 12000 }); clearReadCache(); return r; },
    async saveLeaderDraft(id, payload) { const r=await apiRequest('/d4a332bd-8994-4b3d-aaba-28f2b99aca0a/evaluations/' + encodeURIComponent(id) + '/leader-draft', { method: 'PUT', body: payload, timeoutMs: 30000 }); clearReadCache(); return r; },
    async submitLeader(id) { const r=await apiRequest('/11eb53d4-a38a-4048-81e0-4705ebc57e56/evaluations/' + encodeURIComponent(id) + '/submit-leader', { method: 'POST', timeoutMs: 30000 }); clearReadCache(); return r; },

    // Alias en español conservados para compatibilidad con código previo.
    evaluacionesMias() { return this.evaluationsMine(); },
    evaluacionPorId(id) { return this.evaluationDetail(id); },
    autoevaluacionGuardar(id, payload) { return apiRequest('/autoevaluacion/' + encodeURIComponent(id) + '/guardar', { method: 'POST', body: payload }); },
    autoevaluacionEnviar(id, payload) { return apiRequest('/autoevaluacion/' + encodeURIComponent(id) + '/enviar', { method: 'POST', body: payload }); },

    // --- Líder ---------------------------------------------------------------
    liderEquipo() { return this.leaderTeam(); },
    liderEvaluaciones() { return apiRequest('/lider/evaluaciones', { method: 'GET' }); },
    liderEvaluacionPorId(id) { return apiRequest('/lider/evaluaciones/' + encodeURIComponent(id), { method: 'GET' }); },
    liderEvaluacionGuardar(id, payload) { return apiRequest('/lider/evaluaciones/' + encodeURIComponent(id) + '/guardar', { method: 'POST', body: payload }); },
    liderEvaluacionEnviar(id, payload) { return apiRequest('/lider/evaluaciones/' + encodeURIComponent(id) + '/enviar', { method: 'POST', body: payload }); },

    // --- Administrador ---------------------------------------------------
    adminEvaluaciones() { return apiRequest('/admin/evaluaciones', { method: 'GET' }); },
    adminCalibraciones() { return apiRequest('/admin/calibraciones', { method: 'GET' }); },
    adminCalibracionGuardar(id, payload) { return apiRequest('/admin/calibraciones/' + encodeURIComponent(id) + '/guardar', { method: 'POST', body: payload }); },
    adminCalibracionLiberar(id, payload) { return apiRequest('/admin/calibraciones/' + encodeURIComponent(id) + '/liberar', { method: 'POST', body: payload }); },
    adminNineBox() { return apiRequest('/admin/nine-box', { method: 'GET' }); },
    adminEnviarNotificacion(payload) { return apiRequest('/admin/notificaciones/enviar', { method: 'POST', body: payload }); },

    // --- Retroalimentación -------------------------------------------------
    retroalimentacionPorId(id) { return apiRequest('/retroalimentacion/' + encodeURIComponent(id), { method: 'GET' }); },
    retroalimentacionGuardar(id, payload) { return apiRequest('/retroalimentacion/' + encodeURIComponent(id) + '/guardar', { method: 'POST', body: payload }); },
    retroalimentacionCerrar(id, payload) { return apiRequest('/retroalimentacion/' + encodeURIComponent(id) + '/cerrar', { method: 'POST', body: payload }); },

    // --- Asistente de IA para objetivos SMART -------------------------------
    // Ver README, sección "Asistente de IA para objetivos SMART". El frontend
    // nunca llama directamente a un proveedor de IA: siempre pasa por este
    // único método, que a su vez pasa por n8n (Webhook -> validar sesión ->
    // rate limit -> prompt -> LLM -> validar JSON -> responder). No hay
    // ninguna API key de proveedor de IA en este archivo ni en ningún otro
    // archivo del frontend.
    ai: {
      /**
       * @param {string} idea - Idea breve del usuario (5–500 caracteres; la
       *   validación de longitud vive en app.js, antes de llamar aquí).
       * @param {'es'|'en'} language - Idioma en el que n8n debe responder.
       * @param {{position?: string, area?: string}} [employeeContext] -
       *   Opcional. NUNCA debe incluir correo, evaluaciones, calificaciones,
       *   comentarios privados ni información de otros empleados — ver
       *   requerimiento de privacidad del brief.
       * @returns {Promise<{success: boolean, data?: object, message?: string}>}
       */
      generateSmartObjective(idea, language, employeeContext) {
        const body = { idea, language: language === 'en' ? 'en' : 'es' };
        if (employeeContext && (employeeContext.position || employeeContext.area)) {
          body.employeeContext = {};
          if (employeeContext.position) body.employeeContext.position = employeeContext.position;
          if (employeeContext.area) body.employeeContext.area = employeeContext.area;
        }
        return apiRequest('/ai/smart-objective', { method: 'POST', body });
      }
    }
  };

  global.EDDApi = EDDApi;
})(window);
