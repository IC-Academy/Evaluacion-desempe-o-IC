/**
 * data.js
 * ---------------------------------------------------------------------------
 * Catálogo maestro de la Evaluación del Desempeño Administrativo (EDD)
 * Fuente: EDD_Inter-Con_alineada.docx (FOR-CAP-003 Rev. 3)
 *
 * Contiene: escala de evaluación, competencias y conductas observables por
 * sección, ponderaciones, datos de usuarios de demostración y un generador
 * determinista de respuestas simuladas para poblar el localStorage la
 * primera vez que se abre la demo.
 * ---------------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  // ===========================================================================
  // ESCALA DE EVALUACIÓN (documento oficial, tabla "ESCALA DE EVALUACIÓN")
  // ===========================================================================
  const ESCALA = [
    { valor: 5, descripcion: 'Excede significativamente las expectativas. Es un referente para otros.' },
    { valor: 4, descripcion: 'Supera las expectativas de manera constante.' },
    { valor: 3, descripcion: 'Cumple con lo esperado para su puesto.' },
    { valor: 2, descripcion: 'Cumple parcialmente; requiere mejorar.' },
    { valor: 1, descripcion: 'No cumple con las expectativas del puesto.' },
    { valor: 'N/A', descripcion: 'No aplica o no cuento con elementos suficientes para evaluarlo.' }
  ];

  // ===========================================================================
  // SECCIONES Y COMPETENCIAS (con conductas observables textuales del documento)
  //
  // ⚠ PONDERACIÓN PRELIMINAR (acuerdo de la reunión de actualización de la
  // beta), pendiente de validación definitiva por RH. Los totales por sección
  // (peso) DEBEN coincidir siempre con calculations.js -> PESOS_SECCION, que
  // es la fuente de verdad para el cálculo. Aquí solo se reparte ese total
  // entre las competencias de la sección, para fines de despliegue en pantalla
  // (el cálculo real promedia las calificaciones de la sección sin ponderar
  // cada competencia de forma individual; ver calculations.js).
  // ===========================================================================
  const SECCIONES_META = {
    actitud: { titulo: 'A. Valores y Actitud', peso: 20, eje: 'POTENCIAL (preliminar)', descripcion: 'Evalúa la vivencia diaria de los valores ESPÍRITU de Inter-Con. Esta sección alimenta, de forma preliminar, el eje vertical (Potencial) de la matriz 9-box mientras no exista un instrumento de potencial dedicado.' },
    habilidades: { titulo: 'B. Habilidades', peso: 15, eje: 'DESEMPEÑO', descripcion: 'Evalúa las capacidades funcionales para ejecutar el puesto con eficiencia.' },
    conocimientos: { titulo: 'C. Conocimientos técnicos', peso: 15, eje: 'DESEMPEÑO', descripcion: 'Evalúa el dominio técnico del puesto y de los procesos/herramientas del área.' },
    objetivos: { titulo: 'D. Cumplimiento de Objetivos', peso: 50, eje: 'DESEMPEÑO', descripcion: 'Registre hasta cinco objetivos específicos del periodo, el resultado obtenido y su calificación (1-5). Es la sección con mayor peso en la ponderación preliminar.' }
  };

  const COMPETENCIAS = {
    actitud: [
      {
        id: 'A1', nombre: 'Compromiso Organizacional (Integridad y Excelencia)', peso: 4,
        conductas: [
          'Actúa conforme a los valores ESPÍRITU de Inter-Con.',
          'Muestra responsabilidad y ética profesional.',
          'Se involucra activamente en los objetivos de la empresa.'
        ]
      },
      {
        id: 'A2', nombre: 'Actitud de Servicio (Pasión y Respeto)', peso: 4,
        conductas: [
          'Atiende oportunamente las solicitudes de clientes internos y externos.',
          'Demuestra disposición y pasión para apoyar a otros.',
          'Actúa con profesionalismo, respeto y empatía.'
        ]
      },
      {
        id: 'A3', nombre: 'Trabajo en Equipo y Unión', peso: 4,
        conductas: [
          'Colabora con otras áreas para lograr objetivos comunes.',
          'Mantiene relaciones laborales basadas en el respeto.',
          'Contribuye a resolver diferencias de manera constructiva.'
        ]
      },
      {
        id: 'A4', nombre: 'Innovación y Creatividad (Capacidad de Cambio y Flexibilidad)', peso: 4,
        conductas: [
          'Se adapta positivamente a cambios y nuevas prioridades.',
          'Propone ideas para mejorar procesos.',
          'Implementa soluciones innovadoras cuando es necesario.'
        ]
      },
      {
        id: 'A5', nombre: 'Compromiso con la Sustentabilidad', peso: 4,
        conductas: [
          'Hace uso responsable de los recursos materiales y energéticos a su cargo.',
          'Promueve prácticas de cuidado ambiental y ahorro de recursos en su área de trabajo.'
        ]
      }
    ],
    habilidades: [
      {
        id: 'B1', nombre: 'Orientación a Resultados', peso: 3,
        conductas: [
          'Cumple consistentemente los objetivos establecidos.',
          'Mantiene altos estándares de calidad en su trabajo.',
          'Propone acciones para mejorar la productividad y eficiencia.'
        ]
      },
      {
        id: 'B2', nombre: 'Planeación y Organización', peso: 3,
        conductas: [
          'Organiza adecuadamente sus actividades y prioridades.',
          'Cumple los plazos establecidos.',
          'Anticipa riesgos y establece acciones preventivas.'
        ]
      },
      {
        id: 'B3', nombre: 'Comunicación Efectiva', peso: 3,
        conductas: [
          'Se comunica de forma clara, respetuosa y oportuna.',
          'Escucha activamente y considera diferentes puntos de vista.',
          'Comparte información relevante para facilitar el trabajo.'
        ]
      },
      {
        id: 'B4', nombre: 'Seguimiento y Control', peso: 3,
        conductas: [
          'Da seguimiento oportuno a sus actividades.',
          'Cumple políticas y procedimientos internos.',
          'Administra adecuadamente los recursos asignados.'
        ]
      },
      {
        id: 'B5', nombre: 'Desarrollo de Personas (Liderazgo)', peso: 3,
        conductas: [
          'Comparte conocimientos con sus compañeros.',
          'Brinda apoyo cuando otros lo requieren.',
          'Favorece un ambiente de aprendizaje y colaboración.'
        ]
      }
    ],
    conocimientos: [
      {
        id: 'C1', nombre: 'Dominio del Puesto', peso: 7.5,
        conductas: [
          'Aplica correctamente los conocimientos de su puesto.',
          'Resuelve problemas relacionados con sus funciones.',
          'Mantiene actualizados sus conocimientos.'
        ]
      },
      {
        id: 'C2', nombre: 'Procesos y Herramientas de Trabajo', peso: 7.5,
        conductas: [
          'Conoce y aplica correctamente los procesos, políticas y procedimientos de su área.',
          'Utiliza adecuadamente las herramientas y sistemas de automatización disponibles para su puesto.'
        ]
      }
    ]
  };

  // ===========================================================================
  // NIVELES DE DESEMPEÑO (referencia visual, la fuente de verdad numérica
  // vive en calculations.js -> NIVELES_DESEMPENO)
  // ===========================================================================
  const REFERENCIA_NIVELES = [
    { rango: '95 – 100', nivel: 'Sobresaliente' },
    { rango: '90 – 94.99', nivel: 'Excede las expectativas' },
    { rango: '80 – 89.99', nivel: 'Cumple las expectativas' },
    { rango: '70 – 79.99', nivel: 'Cumple parcialmente' },
    { rango: 'Menor a 70', nivel: 'Requiere mejorar' }
  ];

  // ===========================================================================
  // ESTADOS DEL PROCESO
  // ===========================================================================
  const ESTADOS = {
    NO_INICIADA: 'No iniciada',
    EN_PROGRESO: 'En progreso',
    COMPLETADA: 'Completada',
    PENDIENTE_LIDER: 'Pendiente de líder',
    PENDIENTE_CALIBRACION: 'Pendiente de calibración',
    CALIBRADA: 'Calibrada',
    RETRO_PENDIENTE: 'Retroalimentación pendiente',
    CERRADA: 'Cerrada'
  };

  // ===========================================================================
  // PERIODO ACTIVO
  // ===========================================================================
  const PERIODOS = [
    {
      id: 'PER-2026-01',
      nombre: 'Evaluación de Desempeño Administrativo 2026',
      fechaInicio: '2026-06-01',
      fechaFin: '2026-08-31',
      fechaLimiteAutoevaluacion: '2026-07-15',
      fechaLimiteLider: '2026-07-31',
      activo: true,
      faseRetroalimentacionHabilitada: {} // se llena por colaboradorId cuando RH habilita
    }
  ];

  // ===========================================================================
  // USUARIOS / COLABORADORES / LÍDERES DE DEMOSTRACIÓN
  // ===========================================================================
  const LIDERES = [
    { empleado: '20001', nombre: 'Carlos Martínez', puesto: 'Gerente de Recursos Humanos', area: 'Recursos Humanos', ciudad: 'Ciudad de México', correoCorporativo: 'carlos.martinez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '20002', nombre: 'Ana Torres', puesto: 'Gerente de Finanzas', area: 'Finanzas', ciudad: 'Guadalajara', correoCorporativo: 'ana.torres@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '20003', nombre: 'Roberto Díaz', puesto: 'Gerente de Operaciones', area: 'Operaciones', ciudad: 'Monterrey', correoCorporativo: 'roberto.diaz@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '20004', nombre: 'Sofía López', puesto: 'Gerente de Tecnología', area: 'Tecnología', ciudad: 'Ciudad de México', correoCorporativo: 'sofia.lopez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '20005', nombre: 'Miguel Ángel Ruiz', puesto: 'Gerente Comercial', area: 'Comercial', ciudad: 'Puebla', correoCorporativo: 'miguel.ruiz@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' }
  ];

  const ADMINISTRADORES = [
    { empleado: '90001', nombre: 'Administrador RH', puesto: 'Administrador de RH', area: 'Recursos Humanos', correoCorporativo: 'rh.admin@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' }
  ];

  // perfilObjetivo: valores de referencia (1-5) usados por el generador de respuestas
  // simuladas para poder mostrar distintos cuadrantes 9-box en la demo.
  const COLABORADORES = [
    { empleado: '10001', nombre: 'Laura Hernández', puesto: 'Analista de Recursos Humanos', area: 'Recursos Humanos', liderId: '20001', antiguedad: '2 años 4 meses', ciudad: 'Ciudad de México', direccion: 'Dirección Corporativa', estadoDemo: 'no_iniciada', correoCorporativo: 'laura.hernandez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10002', nombre: 'Jorge Ramírez', puesto: 'Coordinador de Nómina', area: 'Recursos Humanos', liderId: '20001', antiguedad: '1 año 2 meses', ciudad: 'Ciudad de México', direccion: 'Dirección Corporativa', estadoDemo: 'pendiente_lider', perfilObjetivo: { actitud: 4.2, habilidades: 3.8, conocimientos: 4.0, objetivos: 4.0 }, correoCorporativo: 'jorge.ramirez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10003', nombre: 'Fernanda Gómez', puesto: 'Analista Contable', area: 'Finanzas', liderId: '20002', antiguedad: '3 años', ciudad: 'Guadalajara', direccion: 'Dirección Administrativa', estadoDemo: 'pendiente_calibracion', perfilObjetivo: { actitud: 4.6, habilidades: 4.4, conocimientos: 4.5, objetivos: 4.3 }, perfilObjetivoLider: { actitud: 4.3, habilidades: 4.0, conocimientos: 4.2, objetivos: 4.0 }, correoCorporativo: 'fernanda.gomez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10004', nombre: 'Diego Morales', puesto: 'Analista de Tesorería', area: 'Finanzas', liderId: '20002', antiguedad: '8 meses', ciudad: 'Guadalajara', direccion: 'Dirección Administrativa', estadoDemo: 'retro_pendiente', perfilObjetivo: { actitud: 4.0, habilidades: 3.2, conocimientos: 3.0, objetivos: 3.3 }, perfilObjetivoLider: { actitud: 4.3, habilidades: 2.2, conocimientos: 2.3, objetivos: 2.0 }, correoCorporativo: 'diego.morales@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10005', nombre: 'Patricia Reyes', puesto: 'Supervisora de Zona', area: 'Operaciones', liderId: '20003', antiguedad: '5 años', ciudad: 'Monterrey', direccion: 'Dirección de Operaciones', estadoDemo: 'cerrada', perfilObjetivo: { actitud: 3.7, habilidades: 4.7, conocimientos: 4.6, objetivos: 4.7 }, perfilObjetivoLider: { actitud: 3.5, habilidades: 4.6, conocimientos: 4.5, objetivos: 4.6 }, correoCorporativo: 'patricia.reyes@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10006', nombre: 'Héctor Vargas', puesto: 'Coordinador Operativo', area: 'Operaciones', liderId: '20003', antiguedad: '1 año', ciudad: 'Monterrey', direccion: 'Dirección de Operaciones', estadoDemo: 'no_iniciada', correoCorporativo: 'hector.vargas@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10007', nombre: 'Daniela Cruz', puesto: 'Analista de Sistemas', area: 'Tecnología', liderId: '20004', antiguedad: '2 años', ciudad: 'Ciudad de México', direccion: 'Dirección de Tecnología', estadoDemo: 'en_progreso', correoCorporativo: 'daniela.cruz@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10008', nombre: 'Andrés Ortiz', puesto: 'Soporte Técnico Sr.', area: 'Tecnología', liderId: '20004', antiguedad: '5 meses', ciudad: 'Ciudad de México', direccion: 'Dirección de Tecnología', estadoDemo: 'cerrada', perfilObjetivo: { actitud: 1.8, habilidades: 2.2, conocimientos: 2.0, objetivos: 1.9 }, perfilObjetivoLider: { actitud: 1.6, habilidades: 1.9, conocimientos: 1.8, objetivos: 1.7 }, correoCorporativo: 'andres.ortiz@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: false, ultimaActualizacion: '2026-07-18' },
    // Caso "brecha significativa": la colaboradora se autopercibe con actitud sobresaliente,
    // pero el líder documenta una actitud deficiente pese a un desempeño técnico sólido
    // (Habilidades/Conocimientos/Objetivos alineados). Cuadrante resultante: Agua (7).
    { empleado: '10009', nombre: 'Valeria Sánchez', puesto: 'Ejecutiva de Cuenta', area: 'Comercial', liderId: '20005', antiguedad: '4 años', ciudad: 'Puebla', direccion: 'Dirección Comercial', estadoDemo: 'pendiente_calibracion', perfilObjetivo: { actitud: 4.5, habilidades: 4.4, conocimientos: 4.2, objetivos: 4.5 }, perfilObjetivoLider: { actitud: 1.8, habilidades: 4.3, conocimientos: 4.3, objetivos: 4.5 }, correoCorporativo: 'valeria.sanchez@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    { empleado: '10010', nombre: 'Ricardo Paredes', puesto: 'Coordinador Comercial', area: 'Comercial', liderId: '20005', antiguedad: '1 año 6 meses', ciudad: 'Puebla', direccion: 'Dirección Comercial', estadoDemo: 'cerrada', perfilObjetivo: { actitud: 4.4, habilidades: 3.6, conocimientos: 3.5, objetivos: 3.4 }, perfilObjetivoLider: { actitud: 4.2, habilidades: 3.4, conocimientos: 3.3, objetivos: 3.2 }, correoCorporativo: 'ricardo.paredes@intercon.com.mx', estatusEmpleado: 'Activo', correoValidado: true, ultimaActualizacion: '2026-07-20' },
    // Caso nuevo de beta 3, aditivo: colaborador SIN líder asignado en el Excel
    // maestro (ver requerimiento 18 del brief — "Sin líder asignado"). No
    // afecta ningún escenario previo: su evaluación sigue "no_iniciada" y no
    // participa en flujos de líder/comparación/calibración.
    { empleado: '10011', nombre: 'Mario Castillo', puesto: 'Analista Junior de Operaciones', area: 'Operaciones', liderId: null, antiguedad: '3 meses', ciudad: 'Monterrey', direccion: 'Dirección de Operaciones', estadoDemo: 'no_iniciada', correoCorporativo: null, estatusEmpleado: 'Activo', correoValidado: false, ultimaActualizacion: '2026-07-25' }
  ];

  // ===========================================================================
  // JERARQUÍAS (tabla "Asignaciones" del Excel maestro / Airtable, ver brief
  // sección 8). Se deriva de COLABORADORES.liderId para no duplicar la fuente
  // de verdad de la relación líder-colaborador (que sigue viviendo ahí, tal
  // como en beta 1/2). Esta tabla es solo la proyección con la forma exacta
  // que tendrá el registro real de Airtable/Excel.
  // ===========================================================================
  const JERARQUIAS = COLABORADORES.map((c, idx) => ({
    idAsignacion: 'ASG-2026-' + String(idx + 1).padStart(4, '0'),
    numeroEmpleado: c.empleado,
    numeroLider: c.liderId || null,
    periodo: 'EDD-2026',
    fechaInicio: '2026-08-01',
    fechaFin: null,
    asignacionActiva: true,
    tipoAsignacion: 'Líder directo'
  }));

  // ===========================================================================
  // GENERADOR DETERMINISTA DE RESPUESTAS SIMULADAS (para poblar la demo)
  // ===========================================================================

  // PRNG determinista (mulberry32) para que la demo sea reproducible.
  function crearRng(semilla) {
    let a = semilla >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function claseHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return h >>> 0;
  }

  /**
   * Genera respuestas simuladas para un conjunto de competencias, con
   * variación alrededor de un valor objetivo, e incluye ocasionalmente N/A
   * para poder demostrar la exclusión de N/A del cálculo.
   */
  function generarRespuestas(competencias, valorObjetivo, semillaTexto, incluirNA) {
    const rng = crearRng(claseHash(semillaTexto));
    return competencias.map((c, idx) => {
      if (incluirNA && idx === competencias.length - 1 && rng() < 0.3) {
        return { competenciaId: c.id, valor: 'N/A', comentario: 'Sin elementos suficientes para evaluar en este periodo.' };
      }
      const variacion = (rng() - 0.5) * 1.2;
      let v = Math.round(valorObjetivo + variacion);
      v = Math.max(1, Math.min(5, v));
      return { competenciaId: c.id, valor: v, comentario: '' };
    });
  }

  const OBJETIVOS_MUESTRA = [
    ['Reducir el tiempo de respuesta a solicitudes internas en un 15%.', 'Se redujo el tiempo de respuesta en 18%, superando la meta.'],
    ['Actualizar el 100% de los expedientes del área durante el trimestre.', 'Se actualizó el 95% de los expedientes; quedaron pendientes 2 casos especiales.'],
    ['Implementar un tablero de seguimiento mensual para el equipo.', 'Tablero implementado y en uso desde el segundo mes del periodo.'],
    ['Capacitar al equipo en el nuevo procedimiento operativo.', 'Se capacitó al 100% del equipo con evaluación de conocimientos aprobatoria.'],
    ['Disminuir incidencias reportadas por el cliente interno.', 'Las incidencias bajaron de 12 a 6 en el periodo evaluado.']
  ];

  function generarObjetivos(valorObjetivo, semillaTexto, cantidad) {
    const rng = crearRng(claseHash(semillaTexto + '-obj'));
    const n = cantidad || (3 + Math.floor(rng() * 3)); // 3 a 5 objetivos
    const objetivos = [];
    for (let i = 0; i < Math.min(n, 5); i++) {
      const variacion = (rng() - 0.5) * 1.2;
      let v = Math.round(valorObjetivo + variacion);
      v = Math.max(1, Math.min(5, v));
      objetivos.push({
        descripcion: OBJETIVOS_MUESTRA[i][0],
        resultado: OBJETIVOS_MUESTRA[i][1],
        calificacion: v
      });
    }
    return objetivos;
  }

  // ===========================================================================
  // EXPORTS
  // ===========================================================================
  global.EDDData = {
    ESCALA,
    SECCIONES_META,
    COMPETENCIAS,
    REFERENCIA_NIVELES,
    ESTADOS,
    PERIODOS,
    LIDERES,
    ADMINISTRADORES,
    COLABORADORES,
    JERARQUIAS,
    generarRespuestas,
    generarObjetivos,
    crearRng,
    claseHash
  };
})(window);
