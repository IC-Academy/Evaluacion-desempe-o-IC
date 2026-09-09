/**
 * ninebox-axis-labels-v43.js
 * ---------------------------------------------------------------------------
 * Ajuste exclusivamente visual de etiquetas para la matriz 9-Box.
 * No modifica cálculos, umbrales, numeración, cuadrantes ni valores.
 *
 * Eje X (horizontal): DESEMPEÑO
 * Eje Y (vertical): VALORES / ACTITUD
 * ---------------------------------------------------------------------------
 */
(function (global) {
  'use strict';

  const calc = global.EDDCalc;
  const charts = global.EDDCharts;

  if (calc && calc.CONFIG_9BOX) {
    calc.CONFIG_9BOX.ejeVertical = 'Valores / Actitud';
    calc.CONFIG_9BOX.ejeHorizontal = 'Desempeño';
  }

  if (!charts || typeof charts.renderNineBoxIndividual !== 'function') return;

  const renderNineBoxIndividualOriginal = charts.renderNineBoxIndividual;

  charts.renderNineBoxIndividual = function (resultado) {
    return renderNineBoxIndividualOriginal(resultado)
      // El nombre del eje vertical debe leerse a la izquierda de la matriz.
      .replace(
        '<div class="ninebox-y-title">DESEMPEÑO</div>',
        '<div class="ninebox-y-title">VALORES / ACTITUD</div>'
      )
      // La etiqueta superior "ACTITUD" era confusa porque parecía corresponder
      // al eje horizontal. Se conserva el espacio para no alterar el layout.
      .replace(
        '<div class="ninebox-axis-title ninebox-axis-title-top">ACTITUD</div>',
        '<div class="ninebox-axis-title ninebox-axis-title-top" aria-hidden="true"></div>'
      );
  };
})(window);
