// ═══════════════════════════════════════════════════
// ENGINE v9 — Stat computation, encoding, storage
// ═══════════════════════════════════════════════════
// Mise à jour majeure pour EndlessLeveling 9.0.0 :
//   - Race attrs sont désormais TOUS flat (plus de multiplicateurs)
//     ex. v7 strength 1.11×, v9 strength 25 (flat)
//   - Haste a une baseline de 100 (race=100 → +0%, race=121 → +21%)
//   - SP = 10 + (lvl-1) × 4 (vs 12 + (lvl-1) × 5 en v7)
//   - per_level par stat ajusté (strength 0.5→0.75, haste 0.75→0.25, etc.)
//
// Pipeline (4 passes, identique à v7 dans la STRUCTURE, mais arithmétique simplifiée) :
//   Pass 1 : stats de base (race + innates × niveau + SP + flat aug)
//   Pass 2 : augments à scaling (Titan's Might → STR depuis MAX_HP, etc.)
//   Pass 3 : class passive scaling (Arcane/Primal Dominance : x% PV → SOR/STR)
//   Pass 4 : multiplicateurs d'augments (Brute Force ×2.5 STR/SOR, Precision lock)
//   Pass 5 : Fates (réservé pour Phase 5 ; stub neutre en Phase 1)
// ═══════════════════════════════════════════════════
import { STATS, RACES, CLASSES, AUGMENTS, EVOLUTIONS } from "./data/core.js";
import { FATE_SETS, resolveFateStat } from "./data/fates.js";

// ─── Constantes EL 9.0 (depuis leveling.json + config.json) ───
export const BASE_SP = 10;
export const SP_PER_LEVEL = 4;
export const PLAYER_LEVEL_CAP = 50;        // soft-cap niveau
export const ABSOLUTE_LEVEL_CAP = 250;     // cap absolu avec prestige
export const HASTE_BASELINE = 100;         // race haste 100 = +0%, 121 = +21%
export const OFF_CLASS_WEAPON_PENALTY = -0.40; // -40% dmg si arme hors-classe
export const DEF_CAPS_BY_ROLE = {
  Mage: 40, Marksman: 40, Assassin: 45, Support: 50, Diver: 55,
  Skirmisher: 65, BattleMage: 65, Juggernaut: 80, Vanguard: 80,
};

// ─── Helpers ───
export function spForLevel(level) { return BASE_SP + (level - 1) * SP_PER_LEVEL; }
export function defCapForClass(c) {
  if (!c?.roles) return 50;
  const role = c.roles[0];
  if (DEF_CAPS_BY_ROLE[role] != null) return DEF_CAPS_BY_ROLE[role];
  // Insensible à la casse (necromancer.json : "Battlemage")
  for (const k of Object.keys(DEF_CAPS_BY_ROLE))
    if (k.toLowerCase() === String(role).toLowerCase()) return DEF_CAPS_BY_ROLE[k];
  return 50;
}

// Récupère la forme active d'une race (base ou évoluée)
export function getActiveRace(race, evoId) {
  if (!race) return null;
  const evo = evoId && EVOLUTIONS[evoId];
  if (evo)
    return {
      ...race,
      attrs: evo.attrs,
      innate: evo.innate,
      passives: evo.passives,
      activeName: evo.name,
      activeDesc: evo.desc,
      activeStage: evo.stage,
      activePath: evo.path,
      activePrestige: evo.prestige,
      activeMinSk: evo.minSk || {},
      activeMinAnySk: evo.minAnySk || [],
      evoId: evoId,
    };
  const base = EVOLUTIONS[race.id];
  if (base)
    return {
      ...race,
      attrs: base.attrs,
      innate: base.innate,
      passives: base.passives,
      activeName: base.name,
      activeDesc: base.desc,
      activeStage: "base",
      activePath: base.path || "none",
      activePrestige: 0,
      activeMinSk: {},
      activeMinAnySk: [],
      evoId: race.id,
    };
  return race;
}

// ─── Innates (per-level scaling) ─────────────────────
// Race contribue (typiquement) via life_force innate
// Classe primaire : 100% des innateByTier[t]
// Classe secondaire : 50% des innateByTier[t]
export function computeInnates(activeRace, c1, t1, c2, t2, level) {
  const inn = {};
  const c1inn = c1?.innateByTier?.[t1] || {};
  const c2inn = c2?.innateByTier?.[t2] || {};
  STATS.forEach((s) => {
    const rv = activeRace?.innate?.[s.key] || 0;
    const cv1 = c1inn[s.key] || 0;
    const cv2 = c2inn[s.key] ? c2inn[s.key] * 0.5 : 0;
    const pl = rv + cv1 + cv2;
    inn[s.key] = { perLevel: pl, total: pl * level };
  });
  return inn;
}

// ─── Augments — bonus flats + scaling ─────────────────
// Si baseStats fourni : 2e passe avec scaling (Titan's Might etc.)
export function computeAugBonuses(selectedAugments, manualAugBonus, baseStats) {
  const total = {};
  STATS.forEach((s) => { total[s.key] = manualAugBonus?.[s.key] || 0; });
  // Pass 1 : bonus flats
  (selectedAugments || []).forEach((aug) => {
    if (aug?.bonuses) {
      Object.entries(aug.bonuses).forEach(([key, val]) => {
        if (STATS.find((s) => s.key === key)) total[key] = (total[key] || 0) + val;
      });
    }
  });
  // Pass 2 : bonus de scaling (nécessite les stats de base déjà calculées)
  if (baseStats) {
    (selectedAugments || []).forEach((aug) => {
      if (aug?.scaling) {
        aug.scaling.forEach((sc) => {
          const sourceVal = baseStats[sc.source] || 0;
          total[sc.target] = (total[sc.target] || 0) + sourceVal * sc.ratio;
        });
      }
    });
  }
  return total;
}

// ─── computeStat — calcul individuel d'une stat ───────
// EL 9.0 : tout est désormais ADDITIF (race attrs sont des flats).
// Le seul cas particulier reste haste (baseline 100) pour l'affichage.
export function computeStat(stat, race, innates, sp, augBonus, postBonus) {
  const spVal = (sp?.[stat.key] || 0) * stat.per_level;
  const innVal = innates?.[stat.key]?.total || 0;
  const aug = augBonus?.[stat.key] || 0;
  const raceAttr = race?.attrs?.[stat.key] || 0;
  const post = postBonus?.[stat.key] || 0;

  if (stat.mode === "haste") {
    // Race haste de 100 = neutre (+0%). Race haste de 121 = +21%.
    const raceOffset = raceAttr - HASTE_BASELINE;
    return {
      total: raceOffset + innVal + spVal + aug + post,
      base: raceOffset,
      raceEffect: `${raceAttr} (${raceOffset >= 0 ? "+" : ""}${raceOffset.toFixed(0)}% base)`,
      fromSP: spVal,
      fromInn: innVal,
      fromAug: aug,
      fromPost: post,
      formula: `${raceAttr}-${HASTE_BASELINE} + ${innVal.toFixed(1)} + ${spVal.toFixed(1)}${aug ? `+${aug}` : ""}${post ? ` + ${post.toFixed(1)} passive` : ""}`,
    };
  }

  // Tous les autres modes ("flat", "mult", "add%") : addition pure
  // mode est conservé uniquement pour l'AFFICHAGE (% suffix vs entier).
  return {
    total: raceAttr + innVal + spVal + aug + post,
    base: raceAttr,
    raceEffect: stat.mode === "flat" ? `+${raceAttr}` : `+${raceAttr}%`,
    fromSP: spVal,
    fromInn: innVal,
    fromAug: aug,
    fromPost: post,
    formula: `${raceAttr}+${innVal.toFixed(1)}+${spVal.toFixed(1)}${aug ? `+${aug}` : ""}${post ? `+${post.toFixed(1)}` : ""}`,
  };
}

// ─── Class passive scaling (Arcane/Primal Dominance) ──
// Ajout flat APRÈS toutes les autres passes — supporte par-tier
export function computeClassPassiveScaling(c1, t1, c2, t2, baseStats) {
  const post = {};
  if (c1?.passiveScalingByTier) {
    const sc = c1.passiveScalingByTier[t1 || 0];
    if (sc) {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio;
    }
  } else if (c1?.passiveScaling) {
    c1.passiveScaling.forEach((sc) => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio;
    });
  }
  // Classe secondaire = 50% du scaling
  if (c2?.passiveScalingByTier) {
    const sc = c2.passiveScalingByTier[t2 || 0];
    if (sc) {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio * 0.5;
    }
  } else if (c2?.passiveScaling) {
    c2.passiveScaling.forEach((sc) => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio * 0.5;
    });
  }
  return post;
}

// ─── Pass 4 : multiplicateurs d'augments (Brute Force, Precision lock) ─
export function computeAugMultipliers(selectedAugments) {
  const mult = {}; // { stat_key: multiplier }
  const lock = {}; // { stat_key: forced_value }
  (selectedAugments || []).forEach((aug) => {
    if (!aug?.dpsImpact) return;
    const d = aug.dpsImpact;
    if (d.strMult) mult.strength = (mult.strength || 1) * d.strMult;
    if (d.sorMult) mult.sorcery = (mult.sorcery || 1) * d.sorMult;
    if (d.staminaMult) mult.stamina = (mult.stamina || 1) * d.staminaMult;
    if (d.precLock) lock.precision = 0;
  });
  return { mult, lock };
}

// ─── Pass 5 : Fates (EndlessFates 0.1.0) ─────────────
// Input : selectedFateSets = { warborn: 4, iron_bastion: 2, ... }
//         (objet setId → nombre de pièces, total ≤ 5)
// Sortie : { flat: { stat: addValue }, mult: { stat: multiplier }, weaponDmgMult }
//
// Application :
//   - 2pc bonus si count ≥ 2
//   - 4pc bonus (passive approximation depuis le mod) si count ≥ 4
//   - WEAPON_BONUS_DAMAGE_PCT cumulé dans weaponDmgMult (consommé par DpsTab)
export function computeFateBonuses(selectedFateSets) {
  const flat = {}, mult = {};
  let weaponDmgMult = 1;
  if (!selectedFateSets) return { flat, mult, weaponDmgMult };

  const apply = (statKey, value) => {
    const r = resolveFateStat(statKey);
    if (!r) return;
    if (r.kind === "weapon_dmg") {
      weaponDmgMult *= (1 + value);
      return;
    }
    if (r.kind === "mult") {
      mult[r.stat] = (mult[r.stat] || 1) * (1 + value);
    } else if (r.kind === "pct_additive") {
      // STR_PCT 0.18 → +18 points (la stat est elle-même un %)
      flat[r.stat] = (flat[r.stat] || 0) + value * 100;
    } else {
      // _FLAT ou pas de suffixe → addition directe
      flat[r.stat] = (flat[r.stat] || 0) + value;
    }
  };

  for (const [setId, count] of Object.entries(selectedFateSets)) {
    if (!count || count < 2) continue;
    const set = FATE_SETS.find(s => s.id === setId);
    if (!set) continue;
    if (count >= 2 && set.twoPiece) {
      set.twoPiece.forEach(b => apply(b.stat, b.value));
    }
    if (count >= 4 && set.fourPiece?.passive) {
      set.fourPiece.passive.forEach(b => apply(b.stat, b.value));
    }
  }
  return { flat, mult, weaponDmgMult };
}

// ─── Format & utilitaires ─────────────────────────────
export function fmt(val, mode) {
  if (mode === "mult" || mode === "add%" || mode === "haste")
    return val === 0 ? "0%" : (val > 0 ? "+" : "") + val.toFixed(1) + "%";
  return Math.round(val).toString();
}

// ─── Encode/decode (encodage compact, partage URL) ────
export function encodeBuild(s) {
  return btoa(
    JSON.stringify({
      v: 9, // version du format
      r: s.selectedRace?.id || "",
      e: s.selectedEvo || "",
      c1: s.primaryClass?.id || "",
      c2: s.secondaryClass?.id || "",
      t1: s.primaryTier,
      t2: s.secondaryTier,
      l: s.level,
      p: s.prestige,
      sp: s.skillPoints,
      a: s.selectedAugments.map((a) => a.id),
      ab: s.augBonus,
      f: s.selectedFateSets || {},  // EL Fates 0.1.0 — { setId: count }
    })
  );
}
export function decodeBuild(str) {
  try {
    const d = JSON.parse(atob(str));
    return {
      selectedRace: RACES.find((r) => r.id === d.r) || null,
      selectedEvo: d.e || "",
      primaryClass: CLASSES.find((c) => c.id === d.c1) || null,
      secondaryClass: CLASSES.find((c) => c.id === d.c2) || null,
      primaryTier: d.t1 || 0,
      secondaryTier: d.t2 || 0,
      level: d.l || 1,
      prestige: d.p || 0,
      skillPoints: d.sp || {},
      selectedAugments: (d.a || []).map((id) => AUGMENTS.find((a) => a.id === id)).filter(Boolean),
      augBonus: d.ab || {},
      selectedFateSets: d.f || {},
    };
  } catch {
    return null;
  }
}

// ─── Persistance locale (saved-builds) ────────────────
export async function loadSavedBuilds() {
  try {
    const result = await window.storage.get("saved-builds");
    return result ? JSON.parse(result.value) : [];
  } catch { return []; }
}
export async function saveBuildsList(builds) {
  try { await window.storage.set("saved-builds", JSON.stringify(builds)); }
  catch (e) { console.error(e); }
}

// ═══════════════════════════════════════════════════════
// Pipeline complet — 4 passes + stub Fates
// ═══════════════════════════════════════════════════════
export function computeFullStats({
  race, evoId, c1, t1, c2, t2, level, skillPoints,
  selectedAugments, augBonus: manualAug, selectedFateSets,
}) {
  const activeRace = getActiveRace(race, evoId || race?.id);
  const inn = computeInnates(activeRace, c1, t1, c2, t2, level);

  // Pass 1 : bonus flats des augments
  const flatAug = computeAugBonuses(selectedAugments, manualAug);
  const baseStats = {};
  STATS.forEach((s) => {
    baseStats[s.key] = computeStat(s, activeRace, inn, skillPoints, flatAug).total;
  });

  // Pass 2 : augments avec scaling (ont besoin des stats de base)
  const totalAug = computeAugBonuses(selectedAugments, manualAug, baseStats);
  const baseStats2 = {};
  STATS.forEach((s) => {
    baseStats2[s.key] = computeStat(s, activeRace, inn, skillPoints, totalAug).total;
  });

  // Pass 3 : class passive scaling (Arcane/Primal Dominance)
  const postBonus = computeClassPassiveScaling(c1, t1, c2, t2, baseStats2);

  // Pass 4 : multiplicateurs d'augments (Brute Force etc.)
  const { mult: augMult, lock: augLock } = computeAugMultipliers(selectedAugments);

  // Pass 5 : Fates (sets équipés → bonus 2pc + 4pc passifs)
  const fateBonus = computeFateBonuses(selectedFateSets || {});

  const finalStats = {};
  const details = {};
  STATS.forEach((s) => {
    const raw = computeStat(s, activeRace, inn, skillPoints, totalAug, postBonus);
    let total = raw.total;
    // Ajouts flat des fates (avant multiplicateurs)
    total += fateBonus.flat?.[s.key] || 0;
    // Multiplicateurs des augments
    if (augMult[s.key] != null) total *= augMult[s.key];
    // Multiplicateurs des fates (LIFE_FORCE_PCT, STAMINA_PCT, FLOW_PCT)
    if (fateBonus.mult?.[s.key] != null) total *= fateBonus.mult[s.key];
    // Lock (Brute Force precLock)
    if (augLock[s.key] != null) total = augLock[s.key];
    finalStats[s.key] = total;
    details[s.key] = { ...raw, fateFlat: fateBonus.flat?.[s.key] || 0, fateMult: fateBonus.mult?.[s.key] || 1, total };
  });

  return { activeRace, inn, totalAug, postBonus, augMult, augLock, fateBonus, finalStats, details };
}
