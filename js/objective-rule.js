(function (global) {
  'use strict';
// Regla compartida EDD: texto idéntico al de los nodos n8n (Save/Submit Leader).
function eddRound1(n){ return Math.round((Number(n)+Number.EPSILON)*10)/10; }
function eddSelfPct(meta,res,ratio){ const m=Number(meta),r=Number(res);
  if(meta!==''&&meta!=null&&res!==''&&res!=null&&Number.isFinite(m)&&Number.isFinite(r)&&m>0) return eddRound1((r/m)*100);
  if(ratio===''||ratio==null||!Number.isFinite(Number(ratio))) return null; return eddRound1(Number(ratio)*100); }
function eddIsAdjusted(self,leader){ if(leader===''||leader==null||self===null||!Number.isFinite(Number(leader))) return false; return eddRound1(leader)!==eddRound1(self); }
  global.EDDObjectiveRule = { eddRound1, eddSelfPct, eddIsAdjusted };
  global.eddRound1 = eddRound1; global.eddSelfPct = eddSelfPct; global.eddIsAdjusted = eddIsAdjusted;
  if (typeof module !== 'undefined' && module.exports) module.exports = global.EDDObjectiveRule;
})(typeof window !== 'undefined' ? window : globalThis);
