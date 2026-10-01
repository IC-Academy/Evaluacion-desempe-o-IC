(function (global) {
  'use strict';

  if (!global.EDDAuth || !global.EDDApi || !global.APP_CONFIG) return;

  const originalVerifyCode = global.EDDAuth.verifyCode;
  if (typeof originalVerifyCode !== 'function') return;

  function extractPayload(resp) {
    if (resp && resp.data && resp.data.token) return resp.data;
    return resp || {};
  }

  function persistSessionFromVerifyResponse(resp) {
    const payload = extractPayload(resp);
    if (!payload || !payload.token) return false;
    const expiresIn = Number(payload.expiresIn || global.APP_CONFIG.defaultSessionSeconds || 28800);
    const session = {
      token: payload.token,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      user: payload.user || {}
    };
    try {
      sessionStorage.setItem(global.APP_CONFIG.sessionStorageKey, JSON.stringify(session));
      return true;
    } catch (e) {
      console.error('EDD auth guard: sessionStorage no disponible.', e);
      return false;
    }
  }

  global.EDDAuth.verifyCode = async function guardedVerifyCode(numeroEmpleado, codigo) {
    const resp = await originalVerifyCode.call(global.EDDAuth, numeroEmpleado, codigo);

    let session = global.EDDAuth.getSession();
    if (!session) {
      persistSessionFromVerifyResponse(resp);
      session = global.EDDAuth.getSession();
    }

    if (!session || !session.token) {
      throw new global.EDDApi.ApiError(
        'session_storage',
        'El código fue validado, pero el navegador no pudo conservar la sesión. Recarga la página e intenta nuevamente. Si el problema continúa, usa una ventana normal del navegador y verifica que el almacenamiento del sitio esté habilitado.'
      );
    }

    return resp;
  };
})(window);
