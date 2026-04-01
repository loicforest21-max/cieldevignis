// ═══════════════════════════════════════════════════
// ENGINE — Stat computation, encoding, storage
// ═══════════════════════════════════════════════════
import { STATS, RACES, CLASSES, AUGMENTS, EVOLUTIONS } from './data.js';

function getActiveRace(race, evoId) {
  if (!race) return null;
  const evo = evoId && EVOLUTIONS[evoId];
  if (evo) return { ...race, attrs: evo.attrs, innate: evo.innate, passives: evo.passives, activeName: evo.name, activeDesc: evo.desc, activeStage: evo.stage, activePrestige: evo.prestige, evoId: evoId };
  const base = EVOLUTIONS[race.id];
  if (base) return { ...race, attrs: base.attrs, innate: base.innate, passives: base.passives, activeName: base.name, activeDesc: base.desc, activeStage: "base", activePrestige: 0, evoId: race.id };
  return race;
}

// STAT COMPUTATION — CORRECTED FORMULAS
// ═══════════════════════════════════════════
function computeInnates(activeRace, c1, t1, c2, t2, level) {
  const inn = {};
  const c1inn = c1?.innateByTier?.[t1] || {};
  const c2inn = c2?.innateByTier?.[t2] || {};
  STATS.forEach(s => {
    const rv = activeRace?.innate?.[s.key] || 0;
    const cv1 = c1inn[s.key] || 0;
    const cv2 = c2inn[s.key] ? c2inn[s.key] * 0.5 : 0;
    const pl = rv + cv1 + cv2;
    inn[s.key] = { perLevel: pl, total: pl * level };
  });
  return inn;
}

function computeAugBonuses(selectedAugments, manualAugBonus, baseStats) {
  const total = {};
  STATS.forEach(s => { total[s.key] = manualAugBonus[s.key] || 0; });
  // Pass 1: flat bonuses from augments
  selectedAugments.forEach(aug => {
    if (aug.bonuses) {
      Object.entries(aug.bonuses).forEach(([key, val]) => {
        if (STATS.find(s => s.key === key)) total[key] = (total[key] || 0) + val;
      });
    }
  });
  // Pass 2: scaling bonuses (needs base stats computed without scaling)
  if (baseStats) {
    selectedAugments.forEach(aug => {
      if (aug.scaling) {
        aug.scaling.forEach(sc => {
          const sourceVal = baseStats[sc.source] || 0;
          const bonus = sourceVal * sc.ratio;
          total[sc.target] = (total[sc.target] || 0) + bonus;
        });
      }
    });
  }
  return total;
}

function computeStat(stat, race, innates, sp, augBonus, postBonus) {
  const spVal = (sp[stat.key] || 0) * stat.per_level;
  const innVal = innates[stat.key]?.total || 0;
  const aug = augBonus[stat.key] || 0;
  const rawRaceAttr = race?.attrs[stat.key];
  const post = postBonus?.[stat.key] || 0;

  if (stat.mode === "haste") {
    // For haste: 0 or undefined = 1.0 (no modifier)
    const raceAttr = (rawRaceAttr === undefined || rawRaceAttr === 0) ? 1.0 : rawRaceAttr;
    const raceOffset = (raceAttr - 1.0) * 100;
    const gains = innVal + spVal + aug;
    const multiplied = gains * raceAttr;
    return { total: raceOffset + multiplied + post, base: raceOffset, raceEffect: `${raceAttr} (${raceOffset >= 0 ? "+" : ""}${raceOffset.toFixed(0)}% base)`, fromSP: spVal, fromInn: innVal, fromAug: aug, fromPost: post, formula: `(${raceAttr}-1)×100 + (${innVal.toFixed(1)}+${spVal.toFixed(1)}${aug ? `+${aug}` : ""})×${raceAttr}${post ? ` + ${post.toFixed(1)} passive` : ""}` };
  } else if (stat.mode === "mult") {
    // For mult: 0 or undefined = 1.0 (no race modifier)
    const raceAttr = (rawRaceAttr === undefined || rawRaceAttr === 0) ? 1.0 : rawRaceAttr;
    const gains = innVal + spVal + aug;
    const multiplied = gains * raceAttr;
    return { total: multiplied + post, base: 0, raceEffect: raceAttr === 1.0 ? "×1.0 (aucun)" : `×${raceAttr}`, fromSP: spVal, fromInn: innVal, fromAug: aug, fromPost: post, formula: `(${innVal.toFixed(1)}+${spVal.toFixed(1)}${aug ? `+${aug}` : ""})×${raceAttr}${post ? ` + ${post.toFixed(1)} passive` : ""}` };
  } else if (stat.mode === "add%") {
    const raceAttr = rawRaceAttr || 0;
    return { total: raceAttr + innVal + spVal + aug + post, base: raceAttr, raceEffect: `+${raceAttr}%`, fromSP: spVal, fromInn: innVal, fromAug: aug, fromPost: post, formula: `${raceAttr}+${innVal.toFixed(1)}+${spVal.toFixed(1)}${aug ? `+${aug}` : ""}${post ? `+${post.toFixed(1)}` : ""}` };
  } else {
    const raceAttr = rawRaceAttr || 0;
    return { total: raceAttr + innVal + spVal + aug + post, base: raceAttr, raceEffect: `+${raceAttr}`, fromSP: spVal, fromInn: innVal, fromAug: aug, fromPost: post, formula: `${raceAttr}+${innVal.toFixed(1)}+${spVal.toFixed(1)}${aug ? `+${aug}` : ""}${post ? `+${post.toFixed(1)}` : ""}` };
  }
}

// Compute class passive scaling (Arcane Dominance, Primal Dominance) — flat additions AFTER race multiplier
// Now supports per-tier scaling via passiveScalingByTier
function computeClassPassiveScaling(c1, t1, c2, t2, baseStats) {
  const post = {};
  // Primary class scaling
  if (c1?.passiveScalingByTier) {
    const sc = c1.passiveScalingByTier[t1 || 0];
    if (sc) {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio;
    }
  } else if (c1?.passiveScaling) {
    c1.passiveScaling.forEach(sc => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio;
    });
  }
  // Secondary class scaling (50%)
  if (c2?.passiveScalingByTier) {
    const sc = c2.passiveScalingByTier[t2 || 0];
    if (sc) {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio * 0.5;
    }
  } else if (c2?.passiveScaling) {
    c2.passiveScaling.forEach(sc => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio * 0.5;
    });
  }
  return post;
}

// Pass 4: augment stat multipliers (ex: Brute Force ×2.5 FOR/SOR, PRÉ→0)
// Applied AFTER all other passes on the final stat totals
function computeAugMultipliers(selectedAugments) {
  const mult = {}; // { stat_key: multiplier }
  const lock = {}; // { stat_key: forced_value }
  (selectedAugments || []).forEach(aug => {
    if (!aug.dpsImpact) return;
    const d = aug.dpsImpact;
    if (d.strMult) mult.strength = (mult.strength || 1) * d.strMult;
    if (d.sorMult) mult.sorcery  = (mult.sorcery  || 1) * d.sorMult;
    if (d.precLock) lock.precision = 0;
  });
  return { mult, lock };
}

function fmt(val, mode) {
  if (mode === "mult" || mode === "add%" || mode === "haste") return val === 0 ? "0%" : (val > 0 ? "+" : "") + val.toFixed(1) + "%";
  return Math.round(val).toString();
}

// ═══════════════════════════════════════════
// ENCODE/DECODE

function encodeBuild(s) { return btoa(JSON.stringify({ r:s.selectedRace?.id||"",e:s.selectedEvo||"",c1:s.primaryClass?.id||"",c2:s.secondaryClass?.id||"",t1:s.primaryTier,t2:s.secondaryTier,l:s.level,p:s.prestige,sp:s.skillPoints,a:s.selectedAugments.map(a=>a.id),ab:s.augBonus})); }
function decodeBuild(str) { try { const d=JSON.parse(atob(str)); return { selectedRace:RACES.find(r=>r.id===d.r)||null,selectedEvo:d.e||"",primaryClass:CLASSES.find(c=>c.id===d.c1)||null,secondaryClass:CLASSES.find(c=>c.id===d.c2)||null,primaryTier:d.t1||0,secondaryTier:d.t2||0,level:d.l||1,prestige:d.p||0,skillPoints:d.sp||{},selectedAugments:(d.a||[]).map(id=>AUGMENTS.find(a=>a.id===id)).filter(Boolean),augBonus:d.ab||{} }; } catch { return null; } }

// STORAGE HELPERS (persistent across sessions)
// ═══════════════════════════════════════════

async function loadSavedBuilds() {
  try {
    const result = await window.storage.get("saved-builds");
    return result ? JSON.parse(result.value) : [];
  } catch { return []; }
}
async function saveBuildsList(builds) {
  try { await window.storage.set("saved-builds", JSON.stringify(builds)); } catch(e) { console.error(e); }
}

// ═══════════════════════════════════════════
// FULL STAT PIPELINE — centralized 4-pass computation
// Avoids duplicating this logic across multiple components
// ═══════════════════════════════════════════
function computeFullStats({ race, evoId, c1, t1, c2, t2, level, skillPoints, selectedAugments, augBonus: manualAug }) {
  const activeRace = getActiveRace(race, evoId || race?.id);
  const inn = computeInnates(activeRace, c1, t1, c2, t2, level);
  // Pass 1: flat aug bonuses only
  const flatAug = computeAugBonuses(selectedAugments, manualAug);
  const baseStats = {};
  STATS.forEach(s => { baseStats[s.key] = computeStat(s, activeRace, inn, skillPoints, flatAug).total; });
  // Pass 2: scaling augments (needs base stats)
  const totalAug = computeAugBonuses(selectedAugments, manualAug, baseStats);
  const baseStats2 = {};
  STATS.forEach(s => { baseStats2[s.key] = computeStat(s, activeRace, inn, skillPoints, totalAug).total; });
  // Pass 3: class passive scaling (Arcane/Primal Dominance)
  const postBonus = computeClassPassiveScaling(c1, t1, c2, t2, baseStats2);
  // Pass 4: augment multipliers (Brute Force etc.)
  const { mult: augMult, lock: augLock } = computeAugMultipliers(selectedAugments);
  const finalStats = {};
  const details = {};
  STATS.forEach(s => {
    const raw = computeStat(s, activeRace, inn, skillPoints, totalAug, postBonus);
    let total = raw.total;
    if (augMult[s.key] != null) total *= augMult[s.key];
    if (augLock[s.key] != null) total = augLock[s.key];
    finalStats[s.key] = total;
    details[s.key] = { ...raw, total };
  });
  return { activeRace, inn, totalAug, postBonus, augMult, augLock, finalStats, details };
}

export {
  getActiveRace, computeInnates, computeAugBonuses, computeStat,
  computeClassPassiveScaling, computeAugMultipliers, computeFullStats,
  fmt, encodeBuild, decodeBuild,
  loadSavedBuilds, saveBuildsList,
};
