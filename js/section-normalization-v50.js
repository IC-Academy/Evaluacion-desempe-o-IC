(function (global) {
  'use strict';

  const S = global.EDDStorage;
  if (!S) return;

  const SECCIONES_CANONICAS = ['actitud', 'habilidades', 'conocimientos'];
  const SECCION_POR_PREFIJO = { A: 'actitud', B: 'habilidades', C: 'conocimientos' };

  function normalizarSeccion(seccion, competenciaId) {
    const limpia = String(seccion || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (SECCIONES_CANONICAS.includes(limpia)) return limpia;

    const prefijo = String(competenciaId || '').trim().charAt(0).toUpperCase();
    if (SECCION_POR_PREFIJO[prefijo]) return SECCION_POR_PREFIJO[prefijo];

    return limpia || seccion;
  }

  function migrarSeccionesRespuestas() {
    const db = S.load();
    let cambios = 0;
    (db && Array.isArray(db.respuestas) ? db.respuestas : []).forEach((r) => {
      const canonica = normalizarSeccion(r.seccion, r.competenciaId);
      if (canonica && r.seccion !== canonica) {
        r.seccion = canonica;
        cambios += 1;
      }
    });
    if (cambios) S.persist();
    return cambios;
  }

  const saveRespuestaOriginal = S.saveRespuesta.bind(S);

  S.saveRespuesta = function (evaluacionId, seccion, competenciaId, valor, comentario) {
    const canonica = normalizarSeccion(seccion, competenciaId);
    saveRespuestaOriginal(evaluacionId, canonica, competenciaId, valor, comentario);

    // storage.js legado conserva la sección anterior cuando actualiza una respuesta
    // existente. La reparamos aquí para que render/validación usen la clave canónica.
    const db = S.load();
    const r = (db.respuestas || []).find((x) =>
      x.evaluacionId === evaluacionId && x.competenciaId === competenciaId
    );
    if (r && r.seccion !== canonica) {
      r.seccion = canonica;
      S.persist();
    }
  };

  S.getRespuestasPorSeccion = function (evaluacionId) {
    const out = { actitud: [], habilidades: [], conocimientos: [] };
    S.getRespuestas(evaluacionId).forEach((r) => {
      const sec = normalizarSeccion(r.seccion, r.competenciaId);
      if (out[sec]) out[sec].push(r);
    });
    return out;
  };

  S.normalizarSeccion = normalizarSeccion;
  S.migrarSeccionesRespuestas = migrarSeccionesRespuestas;

  // Repara inmediatamente navegadores afectados sin borrar localStorage.
  migrarSeccionesRespuestas();
})(window);
