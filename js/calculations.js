/**
 * calculations.js
 * ---------------------------------------------------------------------------
 * Motor de cálculo de la Evaluación del Desempeño Administrativo (EDD)
 * INTER-CON SERVICIOS DE SEGURIDAD PRIVADA, S.A. DE C.V.
 * Documento fuente: EDD_Inter-Con_alineada.docx (FOR-CAP-003 Rev. 3)
 *
 * Todas las reglas numéricas de la evaluación viven en este archivo.
 * No se deben duplicar fórmulas ni umbrales en otros módulos.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  // ===========================================================================
  // 1. PONDERACIÓN GENERAL
  //
  // ⚠ PROPUESTA PRELIMINAR — acuerdo de la reunión de actualización de la beta.
  // Sustituye la ponderación original del documento FOR-CAP-003 Rev. 3
  // (Actitud 40 / Habilidades 20 / Conocimientos 10 / Objetivos 30).
  // Pendiente de validación definitiva por RH antes de pasar a producción.
  //
  // Única fuente de verdad de los porcentajes: NO se deben hardcodear
  // porcentajes en app.js, data.js ni en ningún otro módulo. Cualquier
  // pantalla que muestre un peso debe leerlo de aquí (o de data.js, que a su
  // vez reparte estos mismos totales entre las competencias de cada sección).
  // ===========================================================================
  const PESOS_SECCION = {
    actitud: 20,       // A. Valores y Actitud (Eje POTENCIAL preliminar)
    habilidades: 15,   // B. Habilidades (Eje DESEMPEÑO)
    conocimientos: 15, // C. Conocimientos técnicos (Eje DESEMPEÑO)
    objetivos: 50       // D. Cumplimiento de Objetivos (Eje DESEMPEÑO) — ahora es la sección con mayor peso
  };
  // Suma de control: 20 + 15 + 15 + 50 = 100. Ver test-runner / auditoría de pesos.

  // ===========================================================================
  // 2. CLASIFICACIÓN NUMÉRICA DEL RESULTADO FINAL (0-100)
  //    Documento oficial + precisión decimal indicada por el cliente.
  // ===========================================================================
  const NIVELES_DESEMPENO = [
    { min: 95, max: 100, nivel: 'Sobresaliente', color: '#1e7e34' },
    { min: 90, max: 94.99, nivel: 'Excede las expectativas', color: '#28a745' },
    { min: 80, max: 89.99, nivel: 'Cumple las expectativas', color: '#3b82c4' },
    { min: 70, max: 79.99, nivel: 'Cumple parcialmente', color: '#e0a800' },
    { min: -Infinity, max: 69.99, nivel: 'Requiere mejorar', color: '#c0392b' }
  ];

  function clasificarNivel(total) {
    if (total === null || total === undefined || isNaN(total)) {
      return { nivel: 'Sin datos', color: '#6c757d' };
    }
    for (const rango of NIVELES_DESEMPENO) {
      if (total >= rango.min && total <= rango.max) {
        return { nivel: rango.nivel, color: rango.color };
      }
    }
    return { nivel: 'Sin datos', color: '#6c757d' };
  }

  // ===========================================================================
  // 3. UMBRALES Y EJES DE LA MATRIZ 9-BOX
  //    Configurables. Deben validarse por RH antes de producción.
  //    Escala 1-5 para cada eje (Potencial preliminar / Desempeño).
  //
  //    ⚠ NOTA SOBRE EL EJE VERTICAL (POTENCIAL PRELIMINAR):
  //    En esta versión beta, el potencial se estima provisionalmente mediante
  //    los componentes conductuales y de habilidades disponibles (se reutiliza
  //    el promedio de la sección "Valores y Actitud" como aproximación). En
  //    producción deberá incorporarse una evaluación específica de potencial
  //    (por ejemplo, un cuestionario dedicado). La función/variable interna
  //    sigue llamándose "actitud" por compatibilidad con el resto del código;
  //    lo que cambia es exclusivamente la ETIQUETA visible al usuario.
  // ===========================================================================
  const CONFIG_9BOX = {
    nivel1Max: 2.49,
    nivel2Max: 3.99,
    nivel3Max: 5,
    // Etiquetas de eje mostradas en la interfaz (matriz global e individual).
    ejeVertical: 'Potencial (preliminar)',
    ejeHorizontal: 'Desempeño',
    // Etiquetas de nivel por tercio (1, 2, 3), compartidas por ambos ejes.
    etiquetasNivel: ['Bajo', 'Medio', 'Alto']
  };

  // Umbrales de comparación de brechas entre autoevaluación y evaluación del líder.
  // Editable / configurable, no debe quedar incrustado en la interfaz.
  const CONFIG_BRECHA = {
    alineadaMax: 0.49,   // 0 a 0.49 = Alineada
    revisarMax: 0.99     // 0.50 a 0.99 = Revisar ; >=1 = Brecha significativa
  };

  // ===========================================================================
  // 4. INFORMACIÓN DE LOS 9 CUADRANTES (documento oficial, secciones V y VI)
  //    cuadrante = (nivelDesempeno - 1) * 3 + nivelActitud
  // ===========================================================================
  const CUADRANTES_INFO = {
    1: {
      numero: 1, nombre: 'Black Spot',
      significado: 'No tiene la actitud ni los conocimientos requeridos para su posición.',
      accion: 'No Inter-Con — con plan de acción inmediato y mejora en un mes; de lo contrario, debe salir de la empresa.',
      color: '#c0392b', prioridad: 'Crítica', seguimiento: 'Revisión en 1 mes'
    },
    2: {
      numero: 2, nombre: 'Sembrando',
      significado: 'Mejor actitud que desempeño.',
      accion: 'Requiere plan claro de capacitación en sus áreas de posibilidad; evaluar en 3 meses.',
      color: '#e0731c', prioridad: 'Alta', seguimiento: 'Revisión en 3 meses'
    },
    3: {
      numero: 3, nombre: 'Semilla',
      significado: 'Actitud positiva, pero desempeño bajo.',
      accion: 'Potencial Gente Inter-Con — plan de capacitación técnica y evaluación en 3 meses mostrando mejora.',
      color: '#e0a800', prioridad: 'Alta', seguimiento: 'Revisión en 3 meses'
    },
    4: {
      numero: 4, nombre: 'En Maceta',
      significado: 'Trabajo positivo, pero resultados aún por debajo del estándar.',
      accion: 'Debe trabajar su actitud; se sugiere plan de coaching y evaluación cada 3 meses.',
      color: '#e0a800', prioridad: 'Media-Alta', seguimiento: 'Coaching cada 3 meses'
    },
    5: {
      numero: 5, nombre: 'Sol',
      significado: 'En la mitad — OK.',
      accion: 'OK — está en su zona de confort y hace bien su trabajo con actitud positiva.',
      color: '#3b82c4', prioridad: 'Media', seguimiento: 'Seguimiento en el próximo periodo'
    },
    6: {
      numero: 6, nombre: 'Cosecha',
      significado: 'Buena actitud y desempeño promedio; buen potencial de crecimiento.',
      accion: 'Guardián — capacidad para un puesto de liderazgo en la empresa.',
      color: '#4caf50', prioridad: 'Media', seguimiento: 'Plan de crecimiento'
    },
    7: {
      numero: 7, nombre: 'Agua',
      significado: 'Actitud negativa, pero desempeño superior al promedio.',
      accion: 'Debe trabajar su actitud para crecer en Inter-Con; hacer un plan o considerar retiro en el corto plazo.',
      color: '#e0731c', prioridad: 'Alta', seguimiento: 'Plan de actitud en el corto plazo'
    },
    8: {
      numero: 8, nombre: 'Corazón',
      significado: 'Por encima del promedio; tiene capacidad y actitud.',
      accion: 'Crecimiento — listo para una posición de liderazgo en el corto plazo.',
      color: '#2e7d32', prioridad: 'Alta', seguimiento: 'Plan de crecimiento en el corto plazo'
    },
    9: {
      numero: 9, nombre: 'Green Spot',
      significado: 'Cumple a satisfacción tanto en actitud como en desempeño.',
      accion: 'Alto Potencial — estrella de Inter-Con, lista para promoción inmediata.',
      color: '#1b5e20', prioridad: 'Alta', seguimiento: 'Promoción inmediata'
    }
  };

  // ===========================================================================
  // 5. UTILIDADES DE PROMEDIO EXCLUYENDO N/A
  // ===========================================================================

  /**
   * Calcula el promedio de un arreglo de calificaciones (1-5) excluyendo N/A.
   * N/A NUNCA se convierte a 0, ni reduce el promedio: simplemente se excluye
   * del denominador. Si no hay ninguna calificación válida, retorna null.
   */
  function promedioValido(valores) {
    const validos = (valores || []).filter((v) => v !== 'N/A' && v !== null && v !== undefined && v !== '' && !isNaN(Number(v)));
    if (validos.length === 0) return null;
    const suma = validos.reduce((acc, v) => acc + Number(v), 0);
    return suma / validos.length;
  }

  /**
   * Puntaje de sección = (promedio de calificaciones válidas / 5) * peso de la sección
   * Si no hay calificaciones válidas, el puntaje de esa sección es 0 y se marca sinDatos.
   */
  function puntajeSeccion(promedio, peso) {
    if (promedio === null || promedio === undefined) {
      return { puntaje: 0, sinDatos: true };
    }
    return { puntaje: (promedio / 5) * peso, sinDatos: false };
  }

  function round1(n) {
    if (n === null || n === undefined || isNaN(n)) return null;
    return Math.round(n * 10) / 10;
  }

  // ===========================================================================
  // 6. CÁLCULO COMPLETO DE UNA EVALUACIÓN
  //    Recibe respuestas (por sección) y objetivos, entrega puntajes completos.
  // ===========================================================================

  /**
   * respuestasPorSeccion: { actitud: [valores], habilidades: [valores], conocimientos: [valores] }
   * objetivos: [{ descripcion, resultado, calificacion }]  (calificacion puede ser 1-5 o 'N/A')
   */
  function calcularResultado(respuestasPorSeccion, objetivos) {
    const valoresA = (respuestasPorSeccion.actitud || []).map((r) => r.valor);
    const valoresB = (respuestasPorSeccion.habilidades || []).map((r) => r.valor);
    const valoresC = (respuestasPorSeccion.conocimientos || []).map((r) => r.valor);

    // Solo objetivos registrados (con descripción) y con calificación válida entran al promedio.
    const valoresD = (objetivos || [])
      .filter((o) => o && o.descripcion && String(o.descripcion).trim() !== '')
      .map((o) => o.calificacion);

    const avgA = promedioValido(valoresA);
    const avgB = promedioValido(valoresB);
    const avgC = promedioValido(valoresC);
    const avgD = promedioValido(valoresD);

    const secA = puntajeSeccion(avgA, PESOS_SECCION.actitud);
    const secB = puntajeSeccion(avgB, PESOS_SECCION.habilidades);
    const secC = puntajeSeccion(avgC, PESOS_SECCION.conocimientos);
    const secD = puntajeSeccion(avgD, PESOS_SECCION.objetivos);

    const total = secA.puntaje + secB.puntaje + secC.puntaje + secD.puntaje;

    // Eje DESEMPEÑO = B + C + D, expresado en escala 1-5 (promedio ponderado de promedios)
    const pesosDesempeno = [
      { avg: avgB, peso: PESOS_SECCION.habilidades },
      { avg: avgC, peso: PESOS_SECCION.conocimientos },
      { avg: avgD, peso: PESOS_SECCION.objetivos }
    ].filter((x) => x.avg !== null);
    const pesoTotalDesempeno = pesosDesempeno.reduce((acc, x) => acc + x.peso, 0);
    const desempenoProm = pesoTotalDesempeno > 0
      ? pesosDesempeno.reduce((acc, x) => acc + x.avg * x.peso, 0) / pesoTotalDesempeno
      : null;

    return {
      promedios: { actitud: avgA, habilidades: avgB, conocimientos: avgC, objetivos: avgD, desempeno: desempenoProm },
      puntajes: {
        actitud: round1(secA.puntaje),
        habilidades: round1(secB.puntaje),
        conocimientos: round1(secC.puntaje),
        objetivos: round1(secD.puntaje),
        total: round1(total)
      },
      sinDatos: { actitud: secA.sinDatos, habilidades: secB.sinDatos, conocimientos: secC.sinDatos, objetivos: secD.sinDatos },
      nivel: clasificarNivel(total)
    };
  }

  // ===========================================================================
  // 7. ASIGNACIÓN DE CUADRANTE 9-BOX
  // ===========================================================================

  function nivelEje(promedio) {
    if (promedio === null || promedio === undefined) return null;
    if (promedio <= CONFIG_9BOX.nivel1Max) return 1;
    if (promedio <= CONFIG_9BOX.nivel2Max) return 2;
    return 3;
  }

  /**
   * actitudProm: promedio 1-5 de la sección A (Valores y Actitud).
   *   Se usa como aproximación provisional del eje "Potencial" — ver nota en
   *   CONFIG_9BOX más arriba. El nombre del parámetro no cambió para no
   *   romper compatibilidad con el resto del código y los datos existentes.
   * desempenoProm: promedio ponderado 1-5 de B+C+D (Habilidades + Conocimientos
   *   + Objetivos), usando los pesos actuales de PESOS_SECCION.
   * Fórmula validada contra el documento oficial:
   *   cuadrante = (nivelDesempeno - 1) * 3 + nivelActitud
   */
  function asignarCuadrante(actitudProm, desempenoProm) {
    const nA = nivelEje(actitudProm);
    const nD = nivelEje(desempenoProm);
    if (nA === null || nD === null) {
      return { cuadrante: null, nivelActitud: nA, nivelDesempeno: nD, info: null };
    }
    const numero = (nD - 1) * 3 + nA;
    return { cuadrante: numero, nivelActitud: nA, nivelDesempeno: nD, info: CUADRANTES_INFO[numero] };
  }

  // ===========================================================================
  // 8. COMPARACIÓN AUTOEVALUACIÓN vs. EVALUACIÓN DEL LÍDER
  // ===========================================================================

  function clasificarBrecha(diferenciaAbs) {
    if (diferenciaAbs === null || diferenciaAbs === undefined || isNaN(diferenciaAbs)) {
      return { etiqueta: 'Sin datos', color: '#6c757d' };
    }
    const d = Math.abs(diferenciaAbs);
    if (d <= CONFIG_BRECHA.alineadaMax) return { etiqueta: 'Alineada', color: '#28a745' };
    if (d <= CONFIG_BRECHA.revisarMax) return { etiqueta: 'Revisar', color: '#e0a800' };
    return { etiqueta: 'Brecha significativa', color: '#c0392b' };
  }

  // ===========================================================================
  // EXPORTS
  // ===========================================================================
  global.EDDCalc = {
    PESOS_SECCION,
    NIVELES_DESEMPENO,
    CONFIG_9BOX,
    CONFIG_BRECHA,
    CUADRANTES_INFO,
    promedioValido,
    puntajeSeccion,
    round1,
    calcularResultado,
    clasificarNivel,
    nivelEje,
    asignarCuadrante,
    clasificarBrecha
  };
})(window);
