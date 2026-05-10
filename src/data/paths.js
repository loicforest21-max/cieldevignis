// ═══════════════════════════════════════════════════
// PATHS — Couleurs et icônes des paths d'ascension EL9
// ═══════════════════════════════════════════════════
// Chaque évolution dans EVOLUTIONS a un champ `path` (Phase 4-A).
// Ce module fournit les métadonnées d'affichage : couleur, icône, label FR.
// Utilisé par EvoTree (P4-C) pour différencier visuellement les voies
// damage / tank / support / etc.
// ═══════════════════════════════════════════════════

const PATH_META = {
  // Races de base / formes neutres
  none:        { color: "#7c8db5", icon: "•",   label: "Base",      desc: "Forme de base, sans spécialisation" },
  origin:      { color: "#95a5a6", icon: "✦",   label: "Origine",   desc: "Forme originelle, héritage racial" },

  // Paths DPS
  damage:      { color: "#e74c3c", icon: "⚔️",  label: "Dégâts",    desc: "DPS générique, dégâts soutenus" },
  strength:    { color: "#c0392b", icon: "💪",  label: "Force",     desc: "Path Force pure, dégâts physiques" },
  sorcery:     { color: "#a55eea", icon: "🔮",  label: "Sorcellerie", desc: "Path Sorcellerie, dégâts magiques" },
  offense:     { color: "#e67e22", icon: "🔥",  label: "Offensif",  desc: "Burst offensif, dégâts en pic" },
  crit:        { color: "#f39c12", icon: "🎯",  label: "Critique",  desc: "Path crit, multiplicateurs de coup critique" },

  // Paths Tank / Défensifs
  defense:     { color: "#34495e", icon: "🛡️",  label: "Défense",   desc: "Path défensif, mitigation des dégâts" },
  tank:        { color: "#3498db", icon: "🧱",  label: "Tank",      desc: "Path tank, encaisse les dégâts" },

  // Paths Support / Utility
  support:     { color: "#27ae60", icon: "✨",  label: "Support",   desc: "Path support, soins et buffs alliés" },
  flow:        { color: "#16a085", icon: "🌊",  label: "Flow",      desc: "Path Flow, régénération de ressources" },

  // Paths Mobilité
  adventurer:  { color: "#f1c40f", icon: "🧭",  label: "Aventurier", desc: "Path explorateur, XP et mouvement" },
  evasion:     { color: "#9b59b6", icon: "💨",  label: "Évasion",   desc: "Path évasion, agilité et esquive" },

  // Final forms
  hybrid:      { color: "#e8a537", icon: "👑",  label: "Hybride",   desc: "Forme finale, fusion de plusieurs paths" },
};

// Helper : retourne la métadonnée d'un path (avec fallback)
function getPathMeta(path) {
  return PATH_META[path] || PATH_META.none;
}

export { PATH_META, getPathMeta };
