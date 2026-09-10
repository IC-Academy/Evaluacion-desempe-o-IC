(function (global) {
  'use strict';

  const api = global.EDDApi;
  if (!api || typeof api.saveLeaderDraft !== 'function' || api.saveLeaderDraft.__draftContinuityV44) return;

  const original = api.saveLeaderDraft.bind(api);

  function hasValidContinuity(risk) {
    if (!risk || typeof risk !== 'object') return false;
    const impact = String(risk.operationalImpact || '').trim();
    const replacement = String(risk.replacementAvailability || '').trim();
    const actions = Array.isArray(risk.recommendedActions) ? risk.recommendedActions.filter(Boolean) : [];
    const comment = String(risk.confidentialComment || '').trim();
    if (!impact || !replacement || !actions.length) return false;
    if ((impact === 'Alto' || impact === 'Crítico' || replacement === 'Sin reemplazo identificado') && !comment) return false;
    return true;
  }

  async function saveLeaderDraftProgressive(id, payload) {
    const clean = payload && typeof payload === 'object' ? Object.assign({}, payload) : payload;
    if (clean && Object.prototype.hasOwnProperty.call(clean, 'continuityRisk') && !hasValidContinuity(clean.continuityRisk)) {
      delete clean.continuityRisk;
    }
    return original(id, clean);
  }

  saveLeaderDraftProgressive.__draftContinuityV44 = true;
  api.saveLeaderDraft = saveLeaderDraftProgressive;
})(window);
