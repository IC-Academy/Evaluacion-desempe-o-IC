(function (global) {
  'use strict';

  const S = global.EDDStorage;
  const C = global.EDDCalc;
  if (!S || typeof S.saveObjetivo !== 'function' || !C) return;

  const originalSaveObjetivo = S.saveObjetivo.bind(S);

  function num(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(String(value).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  function computedPercent(meta, result) {
    const m = num(meta);
    const r = num(result);
    if (m === null || r === null || m === 0) return null;
    return Math.round(((r / m) * 100) * 10) / 10;
  }

  function normalizeAgainstExpected(value, expected) {
    const n = num(value);
    if (n === null) return value;
    if (!Number.isFinite(expected)) return n;

    const rawDistance = Math.abs(n - expected);
    const scaledDistance = Math.abs((n * 100) - expected);
    return scaledDistance + 0.0001 < rawDistance ? Math.round(n * 1000) / 10 : n;
  }

  S.saveObjetivo = function (evaluacionId, index, descripcion, resultado, calificacion, extras) {
    const opts = Object.assign({}, extras || {});
    const expected = computedPercent(opts.meta, resultado);

    if (expected !== null) {
      if (opts.cumplimientoAutomatico !== '' && opts.cumplimientoAutomatico !== null && opts.cumplimientoAutomatico !== undefined) {
        opts.cumplimientoAutomatico = normalizeAgainstExpected(opts.cumplimientoAutomatico, expected);
      }

      const automaticPercent = num(opts.cumplimientoAutomatico);

      if (!opts.ajusteManualLider) {
        // Cuando no hay ajuste del líder, la fuente de verdad visual es el
        // cálculo Resultado / Meta * 100. Esto corrige respuestas de Airtable
        // tipo percent (1.2) que representan 120%.
        opts.cumplimiento = expected;
      } else if (opts.cumplimiento !== '' && opts.cumplimiento !== null && opts.cumplimiento !== undefined) {
        // En ajustes manuales conservamos el valor del líder, pero normalizamos
        // si el backend lo devolvió como fracción decimal de un campo percent.
        const reference = automaticPercent !== null ? automaticPercent : expected;
        opts.cumplimiento = normalizeAgainstExpected(opts.cumplimiento, reference);
      }

      if (automaticPercent !== null) {
        opts.calificacionAutomatica = C.calificacionPorCumplimiento(automaticPercent);
      } else {
        opts.calificacionAutomatica = C.calificacionPorCumplimiento(expected);
      }
    }

    const pctFinal = num(opts.cumplimiento);
    let finalScore = calificacion;
    if ((finalScore === '' || finalScore === null || finalScore === undefined) && pctFinal !== null) {
      // En la evaluación del líder sin recalibración el backend puede no traer
      // leaderScore. La UI ya mostraba una equivalencia calculada, pero el
      // validador veía la calificación vacía y marcaba el objetivo en rojo.
      finalScore = C.calificacionPorCumplimiento(pctFinal);
    }

    return originalSaveObjetivo(evaluacionId, index, descripcion, resultado, finalScore, opts);
  };
})(window);
