// ═══════════════════════════════════════════════════
// FATES — EndlessFates 0.1.0 (10 sets, Genshin-style)
// ═══════════════════════════════════════════════════
// Phase 3a (UI hybride simple) : compteur 0/2/4 pièces par set.
// Phase 3b (à venir) : éditeur complet 5 slots × mainstat × 4 substats.
//
// Slots EL : HEART (Cœur), EDGE (Tranchant), RELIC (Relique),
//            SIGIL (Sigil), CROWN (Couronne).
// Aliases visuels (Genshin-like) : Fleur / Plume / Sablier / Gantelet / Casque.
//
// Système de drops : tiers E/D/C/B/A/S, S débloqué à prestige 10+.
// Substats : 4 par fate, upgradeables via essence COMMON/ELITE/MYTHIC.
// ═══════════════════════════════════════════════════

// ─── 5 slots ───
const FATE_SLOTS = [
  { id: "HEART",  name: "Cœur",     alias: "Fleur",    icon: "🌸" },
  { id: "EDGE",   name: "Tranchant",alias: "Plume",    icon: "🪶" },
  { id: "RELIC",  name: "Relique",  alias: "Sablier",  icon: "⏳" },
  { id: "SIGIL",  name: "Sigil",    alias: "Gantelet", icon: "🛡️" },
  { id: "CROWN",  name: "Couronne", alias: "Casque",   icon: "👑" },
];

// ─── Tiers (E low → S top) ───
const FATE_TIERS = ["E", "D", "C", "B", "A", "S"];
const FATE_TIER_COLORS = {
  E: "#7c8db5", D: "#6ab04c", C: "#4ea8f0", B: "#9b59b6", A: "#f39c12", S: "#e74c3c",
};
// S est gated derrière prestige 10
const FATE_S_UNLOCK_PRESTIGE = 10;

// ─── Mainstat pools par slot (extraits du JAR FateMainStatPools) ───
// HEART : seulement LIFE_FORCE_FLAT.
// Les autres : ouvert à plusieurs stats.
const FATE_MAINSTAT_POOLS = {
  HEART: ["LIFE_FORCE_FLAT"],
  EDGE:  ["STRENGTH_FLAT", "SORCERY_FLAT"],
  RELIC: ["STRENGTH_PCT", "SORCERY_PCT", "DEFENSE_PCT", "DISCIPLINE_PCT", "HASTE_PCT", "LIFE_FORCE_PCT"],
  SIGIL: ["STRENGTH_PCT", "SORCERY_PCT", "DEFENSE_PCT", "WEAPON_BONUS_DAMAGE_PCT", "LIFE_FORCE_PCT"],
  CROWN: ["STRENGTH_PCT", "SORCERY_PCT", "DEFENSE_PCT", "PRECISION_PCT", "FEROCITY_PCT", "LIFE_FORCE_PCT"],
};

// ─── Fourchettes de mainstat par tier (extraites du JAR StatRollRanges) ───
// Valeur = mainstat à ce tier (à ce moment, l'arrondi du jeu est ignoré pour simplification).
const FATE_MAINSTAT_RANGES = {
  LIFE_FORCE_FLAT:        { E: 60,   D: 120,  C: 200,  B: 320,  A: 500,  S: 800  },
  STRENGTH_FLAT:          { E: 8,    D: 16,   C: 28,   B: 44,   A: 68,   S: 100  },
  SORCERY_FLAT:           { E: 8,    D: 16,   C: 28,   B: 44,   A: 68,   S: 100  },
  STRENGTH_PCT:           { E: 0.04, D: 0.07, C: 0.11, B: 0.15, A: 0.20, S: 0.26 },
  SORCERY_PCT:            { E: 0.04, D: 0.07, C: 0.11, B: 0.15, A: 0.20, S: 0.26 },
  DEFENSE_PCT:            { E: 0.05, D: 0.08, C: 0.12, B: 0.17, A: 0.22, S: 0.28 },
  HASTE_PCT:              { E: 0.05, D: 0.08, C: 0.12, B: 0.17, A: 0.22, S: 0.28 },
  LIFE_FORCE_PCT:         { E: 0.05, D: 0.08, C: 0.12, B: 0.17, A: 0.22, S: 0.28 },
  DISCIPLINE_PCT:         { E: 0.05, D: 0.08, C: 0.12, B: 0.17, A: 0.22, S: 0.28 },
  PRECISION_PCT:          { E: 0.03, D: 0.05, C: 0.08, B: 0.12, A: 0.16, S: 0.21 },
  FEROCITY_PCT:           { E: 0.06, D: 0.09, C: 0.16, B: 0.21, A: 0.26, S: 0.34 },
  WEAPON_BONUS_DAMAGE_PCT:{ E: 0.04, D: 0.07, C: 0.11, B: 0.15, A: 0.20, S: 0.26 },
};

// ─── 21 stat options possibles (mainstat + substat) ───
const FATE_STAT_OPTIONS = [
  "LIFE_FORCE_FLAT", "LIFE_FORCE_PCT",
  "STRENGTH_FLAT", "STRENGTH_PCT",
  "SORCERY_FLAT", "SORCERY_PCT",
  "DEFENSE_FLAT", "DEFENSE_PCT",
  "HASTE_FLAT", "HASTE_PCT",
  "PRECISION_FLAT", "PRECISION_PCT",
  "FEROCITY_FLAT", "FEROCITY_PCT",
  "STAMINA_FLAT", "STAMINA_PCT",
  "FLOW_FLAT", "FLOW_PCT",
  "DISCIPLINE_FLAT", "DISCIPLINE_PCT",
  "WEAPON_BONUS_DAMAGE_PCT",
];

// Stat label FR pour affichage UI
const FATE_STAT_LABELS = {
  LIFE_FORCE_FLAT: "Vitalité (flat)",   LIFE_FORCE_PCT: "Vitalité %",
  STRENGTH_FLAT: "Force (flat)",         STRENGTH_PCT: "Force %",
  SORCERY_FLAT: "Sorcellerie (flat)",    SORCERY_PCT: "Sorcellerie %",
  DEFENSE_FLAT: "Défense (flat)",        DEFENSE_PCT: "Défense %",
  HASTE_FLAT: "Hâte (flat)",             HASTE_PCT: "Hâte %",
  PRECISION_FLAT: "Précision (flat)",    PRECISION_PCT: "Précision %",
  FEROCITY_FLAT: "Férocité (flat)",      FEROCITY_PCT: "Férocité %",
  STAMINA_FLAT: "Endurance (flat)",      STAMINA_PCT: "Endurance %",
  FLOW_FLAT: "Flow (flat)",              FLOW_PCT: "Flow %",
  DISCIPLINE_FLAT: "Discipline (flat)",  DISCIPLINE_PCT: "Discipline %",
  WEAPON_BONUS_DAMAGE_PCT: "Dégâts d'arme %",
};

// ─── 10 SETS (depuis fates/sets/*.json + foundation passive du fourPieceDescription) ───
// twoPiece et fourPiece.passive sont consommés par computeFateBonuses() de l'engine.
// L'effet 4pc réel (proc) est purement descriptif ; la valeur passive donnée
// dans 'foundation' du mod sert d'approximation chiffrée.
const FATE_SETS = [
  {
    id: "warborn",
    name: "Fate of the Warborn",
    nameShort: "Warborn",
    desc: "Set DPS physique pour playstyles à coups soutenus.",
    role: "DPS Physique",
    color: "#e74c3c",
    icon: "⚔️",
    twoPiece: [{ stat: "STRENGTH_PCT", value: 0.18 }],
    twoPieceDesc: "+18% Force",
    fourPiece: {
      desc: "Coups consécutifs accordent des stacks de Force (reset sur miss).",
      passive: [{ stat: "STRENGTH_PCT", value: 0.12 }],
      passiveDesc: "+12% Force (approx. proc passif)",
    },
  },
  {
    id: "arcanist",
    name: "Fate of the Arcanist",
    nameShort: "Arcanist",
    desc: "Set DPS mage focalisé sur dégâts magiques et regen Intelligence.",
    role: "DPS Magique",
    color: "#a55eea",
    icon: "🔮",
    twoPiece: [{ stat: "SORCERY_PCT", value: 0.18 }],
    twoPieceDesc: "+18% Sorcellerie",
    fourPiece: {
      desc: "Lancer des sorts augmente la Sorcellerie et restaure l'Intelligence.",
      passive: [{ stat: "SORCERY_PCT", value: 0.10 }],
      passiveDesc: "+10% Sorcellerie (approx. proc passif)",
    },
  },
  {
    id: "bloodreaver",
    name: "Fate of the Bloodreaver",
    nameShort: "Bloodreaver",
    desc: "Build crit-damage qui punit les critiques par bleed.",
    role: "Crit DPS",
    color: "#c0392b",
    icon: "🩸",
    twoPiece: [{ stat: "FEROCITY_FLAT", value: 20.0 }],
    twoPieceDesc: "+20 Férocité (flat)",
    fourPiece: {
      desc: "Coups critiques appliquent un bleed scalant avec la Férocité.",
      passive: [{ stat: "FEROCITY_FLAT", value: 8.0 }],
      passiveDesc: "+8 Férocité (approx. proc passif)",
    },
  },
  {
    id: "colossus",
    name: "Fate of the Colossus",
    nameShort: "Colossus",
    desc: "Set bruiser-HP convertissant la Vitalité max en bonus dégâts.",
    role: "Bruiser HP",
    color: "#e67e22",
    icon: "💪",
    twoPiece: [{ stat: "LIFE_FORCE_PCT", value: 0.20 }],
    twoPieceDesc: "+20% PV maximum",
    fourPiece: {
      desc: "Bonus dégâts basé sur la Vitalité maximum.",
      passive: [{ stat: "STRENGTH_PCT", value: 0.08 }],
      passiveDesc: "+8% Force (approx. ; HP-scaling réel non modélisé)",
    },
  },
  {
    id: "duality",
    name: "Fate of Duality",
    nameShort: "Duality",
    desc: "Set hybride scalant les dégâts physiques et magiques en alternance.",
    role: "Hybride",
    color: "#9b59b6",
    icon: "☯️",
    twoPiece: [
      { stat: "STRENGTH_PCT", value: 0.12 },
      { stat: "SORCERY_PCT", value: 0.12 },
    ],
    twoPieceDesc: "+12% Force, +12% Sorcellerie",
    fourPiece: {
      desc: "Attaques physiques/magiques alternées boostent le type opposé.",
      passive: [
        { stat: "STRENGTH_PCT", value: 0.06 },
        { stat: "SORCERY_PCT", value: 0.06 },
      ],
      passiveDesc: "+6% Force, +6% Sorcellerie (approx. proc passif)",
    },
  },
  {
    id: "endless_growth",
    name: "Fate of Endless Growth",
    nameShort: "Endless Growth",
    desc: "Set XP-scaling récompensant le combat soutenu par des stacks d'XP.",
    role: "XP / Discipline",
    color: "#f1c40f",
    icon: "📈",
    twoPiece: [{ stat: "DISCIPLINE_FLAT", value: 20.0 }],
    twoPieceDesc: "+20 Discipline (flat)",
    fourPiece: {
      desc: "Bonus XP cumulatif pendant le combat (reset à la sortie ou la mort).",
      passive: [{ stat: "DISCIPLINE_FLAT", value: 5.0 }],
      passiveDesc: "+5 Discipline (approx. proc passif)",
    },
  },
  {
    id: "iron_bastion",
    name: "Fate of the Iron Bastion",
    nameShort: "Iron Bastion",
    desc: "Set tank construit autour du stack de défense.",
    role: "Tank",
    color: "#34495e",
    icon: "🛡️",
    twoPiece: [{ stat: "DEFENSE_PCT", value: 0.18 }],
    twoPieceDesc: "+18% Défense",
    fourPiece: {
      desc: "Subir des dégâts augmente la Défense de 6% (5 stacks, courte durée).",
      passive: [{ stat: "DEFENSE_PCT", value: 0.15 }],
      passiveDesc: "+15% Défense (approx. proc passif)",
    },
  },
  {
    id: "relentless_hunt",
    name: "Fate of the Relentless Hunt",
    nameShort: "Relentless Hunt",
    desc: "Build crit-speed exploitant Précision et bursts de Hâte.",
    role: "Crit / Hâte",
    color: "#16a085",
    icon: "🏹",
    twoPiece: [{ stat: "PRECISION_FLAT", value: 12.0 }],
    twoPieceDesc: "+12 Précision (flat)",
    fourPiece: {
      desc: "Coups critiques accordent de la Hâte pour une courte durée.",
      passive: [{ stat: "HASTE_PCT", value: 0.08 }],
      passiveDesc: "+8% Hâte (approx. proc passif)",
    },
  },
  {
    id: "unyielding_will",
    name: "Fate of the Unyielding Will",
    nameShort: "Unyielding Will",
    desc: "Set sustain-Endurance récompensant l'usage actif d'Endurance par réduction de dégâts.",
    role: "Tank / Endurance",
    color: "#27ae60",
    icon: "💚",
    twoPiece: [{ stat: "STAMINA_PCT", value: 0.20 }],
    twoPieceDesc: "+20% Endurance",
    fourPiece: {
      desc: "Dépenser de l'Endurance réduit temporairement les dégâts subis.",
      passive: [{ stat: "DEFENSE_PCT", value: 0.12 }],
      passiveDesc: "+12% Défense (approx. proc passif)",
    },
  },
  {
    id: "windstrider",
    name: "Fate of the Windstrider",
    nameShort: "Windstrider",
    desc: "Set DPS mobilité récompensant le déplacement actif et les esquives.",
    role: "DPS Mobile",
    color: "#3498db",
    icon: "💨",
    twoPiece: [{ stat: "HASTE_PCT", value: 0.15 }],
    twoPieceDesc: "+15% Hâte",
    fourPiece: {
      desc: "Esquiver booste vitesse de déplacement et dégâts brièvement.",
      passive: [
        { stat: "HASTE_PCT", value: 0.06 },
        { stat: "STRENGTH_PCT", value: 0.06 },
      ],
      passiveDesc: "+6% Hâte, +6% Force (approx. proc passif)",
    },
  },
];

// ─── Helper : Convertit un FateStat (clé du JAR) vers nom de stat de base + type ───
// Retourne { stat: 'strength', kind: 'flat' | 'pct' | 'mult' } ou null
//
// Conventions v9 :
//   - Stats flat-mode (life_force, stamina, flow) : _PCT = MULTIPLICATEUR du total final
//                                                    _FLAT = ADDITION au total
//   - Stats pct-mode (strength, sorcery, defense, haste, precision, ferocity, discipline) :
//     Toutes les valeurs sont des points de % additifs au total.
//     _PCT signifie "points de %" ; _FLAT n'a pas vraiment de sens (rarement utilisé), traité comme additif.
//   - WEAPON_BONUS_DAMAGE_PCT : mappé sur dpsImpact.dmgMult (côté UI), pas sur les stats de base.
//
const FLAT_MODE_STATS = new Set(["life_force", "stamina", "flow"]);
const PCT_MODE_STATS  = new Set(["strength","sorcery","defense","haste","precision","ferocity","discipline"]);

function resolveFateStat(fateStat) {
  // WEAPON_BONUS_DAMAGE_PCT : pas une stat de base
  if (fateStat === "WEAPON_BONUS_DAMAGE_PCT") {
    return { stat: "weapon_dmg", kind: "weapon_dmg" };
  }
  // Match _FLAT or _PCT
  const m = fateStat.match(/^([A-Z_]+?)(_FLAT|_PCT)?$/);
  if (!m) return null;
  const base = m[1].toLowerCase();
  const suffix = m[2] || "";
  if (!FLAT_MODE_STATS.has(base) && !PCT_MODE_STATS.has(base)) return null;
  if (suffix === "_PCT") {
    if (FLAT_MODE_STATS.has(base)) return { stat: base, kind: "mult" };  // ex: LIFE_FORCE_PCT 0.20 → ×1.20
    return { stat: base, kind: "pct_additive" };  // ex: STRENGTH_PCT 0.18 → +18 pts au total
  }
  // _FLAT or no suffix : ajout direct
  return { stat: base, kind: "flat" };
}

export {
  FATE_SLOTS,
  FATE_TIERS,
  FATE_TIER_COLORS,
  FATE_S_UNLOCK_PRESTIGE,
  FATE_MAINSTAT_POOLS,
  FATE_MAINSTAT_RANGES,
  FATE_STAT_OPTIONS,
  FATE_STAT_LABELS,
  FATE_SETS,
  FLAT_MODE_STATS,
  PCT_MODE_STATS,
  resolveFateStat,
};
