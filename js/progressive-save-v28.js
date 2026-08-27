(function (global) {
  'use strict';

  const App = global.App;
  const Api = global.EDDApi;
  if (!App || !Api) return;

  const saveCache = new Map();
  let savingNext = false;

  function normalizeSection(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'ALL';
    if (raw === 'a' || raw.indexOf('actitud') !== -1 || raw.indexOf('valores') !== -1) return 'A';
    if (raw === 'b' || raw.indexOf('habil') !== -1 || raw.indexOf('conocimiento') !== -1 || raw.indexOf('técnica') !== -1 || raw.indexOf('tecnica') !== -1) return 'B';
    if (raw === 'objectives' || raw === 'objetivos' || raw.indexOf('objetiv') !== -1) return 'OBJECTIVES';
    if (raw === 'all' || raw === 'resumen') return 'ALL';
    return 'ALL';
  }

  function inferSectionFromUi() {
    const active = document.querySelector('.premium-evaluation-sidebar .premium-section-step.active strong, .premium-section-step.active strong');
    if (active) return normalizeSection(active.textContent);

    const heading = document.querySelector('.premium-leader-evaluation h2, .premium-evaluation-wizard h2, main h2');
    if (heading) return normalizeSection(heading.textContent);
    return 'ALL';
  }

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).sort().forEach((key) => { out[key] = canonical(value[key]); });
      return out;
    }
    return value;
  }

  function sectionSnapshot(payload, section) {
    payload = payload || {};
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    if (section === 'A') {
      return {
        answers: answers.filter((item) => /^A/i.test(String(item && (item.competencyId || item.competenciaId) || '')))
      };
    }
    if (section === 'B') {
      return {
        answers: answers.filter((item) => !/^A/i.test(String(item && (item.competencyId || item.competenciaId) || ''))),
        tools: payload.tools || {}
      };
    }
    if (section === 'OBJECTIVES') {
      return {
        objectives: payload.objectives || [],
        noObjectives: payload.noObjectives,
        noObjectivesReason: payload.noObjectivesReason,
        noObjectivesDetail: payload.noObjectivesDetail,
        noObjectivesDecision: payload.noObjectivesDecision,
        noObjectivesLeaderComment: payload.noObjectivesLeaderComment
      };
    }
    return payload;
  }

  function digest(payload, section) {
    try { return JSON.stringify(canonical(sectionSnapshot(payload, section))); }
    catch (e) { return String(Date.now()); }
  }

  function setLastSave(status) {
    global.__eddLastProgressiveSave = Object.assign({ at: Date.now() }, status || {});
  }

  function currentRequestedSection() {
    return normalizeSection(global.__eddProgressiveSection || inferSectionFromUi());
  }

  function wrapDraftSave(name, role) {
    const original = Api[name];
    if (typeof original !== 'function' || original.__progressiveV28) return;

    const wrapped = async function (evaluationId, payload) {
      const section = currentRequestedSection();
      const body = Object.assign({}, payload || {}, { section });
      const key = role + ':' + String(evaluationId || '') + ':' + section;
      const nextDigest = digest(body, section);

      // Dirty checking: if the exact same section was already persisted in this
      // browser session, avoid another round-trip to Airtable.
      if (section !== 'ALL' && saveCache.get(key) === nextDigest) {
        setLastSave({ called: true, ok: true, skipped: true, section, role });
        return { ok: true, skipped: true, section };
      }

      setLastSave({ called: true, ok: false, pending: true, section, role });
      try {
        const result = await original.call(Api, evaluationId, body);
        saveCache.set(key, nextDigest);

        // An ALL successful save also establishes the current snapshots as
        // persisted, so later navigation can skip unchanged sections.
        if (section === 'ALL') {
          ['A', 'B', 'OBJECTIVES'].forEach((part) => {
            saveCache.set(role + ':' + String(evaluationId || '') + ':' + part, digest(body, part));
          });
        }

        setLastSave({ called: true, ok: true, skipped: false, section, role });
        return result;
      } catch (error) {
        setLastSave({ called: true, ok: false, skipped: false, section, role, error });
        throw error;
      }
    };

    wrapped.__progressiveV28 = true;
    wrapped.__original = original;
    Api[name] = wrapped;
  }

  wrapDraftSave('saveSelfDraft', 'self');
  wrapDraftSave('saveLeaderDraft', 'leader');

  const originalWizardNext = App.wizardNext && App.wizardNext.bind(App);
  if (originalWizardNext && !App.wizardNext.__progressiveV28) {
    const progressiveWizardNext = async function (sectionName) {
      if (savingNext) return;
      const section = normalizeSection(sectionName);
      if (section === 'ALL') return originalWizardNext(sectionName);

      savingNext = true;
      const nextBtn = document.querySelector('.premium-next-btn');
      const originalLabel = nextBtn ? nextBtn.textContent : '';
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Guardando…';
        nextBtn.setAttribute('aria-busy', 'true');
      }

      global.__eddProgressiveSection = section;
      global.__eddLastProgressiveSave = { called: false, ok: true, section };

      try {
        if (typeof App.guardarProgresoVisual === 'function') {
          await App.guardarProgresoVisual();
        }

        const status = global.__eddLastProgressiveSave || {};
        if (status.called && status.ok === false) {
          return;
        }

        if (nextBtn) nextBtn.textContent = status.skipped ? '✓ Sin cambios' : '✓ Guardado';
        await new Promise((resolve) => setTimeout(resolve, status.skipped ? 180 : 320));
        originalWizardNext(sectionName);
      } finally {
        global.__eddProgressiveSection = null;
        savingNext = false;
        if (nextBtn && document.body.contains(nextBtn)) {
          nextBtn.disabled = false;
          nextBtn.removeAttribute('aria-busy');
          nextBtn.textContent = originalLabel || 'Siguiente →';
        }
      }
    };

    progressiveWizardNext.__progressiveV28 = true;
    App.wizardNext = progressiveWizardNext;
  }

  // The explicit "Guardar progreso" button also saves only the visible
  // section. Existing ALL behavior remains available on the summary screen.
  const originalSaveProgress = App.guardarProgresoVisual && App.guardarProgresoVisual.bind(App);
  if (originalSaveProgress && !App.guardarProgresoVisual.__progressiveV28) {
    const progressiveSaveProgress = async function () {
      const hadForced = !!global.__eddProgressiveSection;
      if (!hadForced) global.__eddProgressiveSection = inferSectionFromUi();
      try {
        return await originalSaveProgress();
      } finally {
        if (!hadForced) global.__eddProgressiveSection = null;
      }
    };
    progressiveSaveProgress.__progressiveV28 = true;
    App.guardarProgresoVisual = progressiveSaveProgress;
  }
})(window);
