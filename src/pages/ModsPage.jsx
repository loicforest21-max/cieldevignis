// ═══════════════════════════════════════════════════
// MODS PAGE — Codex-style mod catalog with illustrated cards
// ═══════════════════════════════════════════════════
import { useState } from "react";
import { G } from "../styles.jsx";

const MOD_CATEGORIES = [
  { id: "all", label: "Tous", icon: "📦", color: G.gold },
  { id: "combat", label: "Combat & RPG", icon: "⚔️", color: "#e8653a" },
  { id: "craft", label: "Craft & Outils", icon: "🔨", color: "#f5a623" },
  { id: "decoration", label: "Décoration", icon: "🏡", color: "#51cf66" },
  { id: "exploration", label: "Exploration", icon: "🗺️", color: "#4ea8f0" },
  { id: "qol", label: "Quality of Life", icon: "✨", color: "#845ef7" },
];

const MODS_DATA = [
  {
    id: "endgame",
    name: "Endgame & QoL",
    version: "4.1.5",
    authors: ["Lewai", "ReyZ41 (Models/Textures)"],
    category: "combat",
    description:
      "Débloquez le plein potentiel de Hytale ! Nouveaux boss, armures endgame, mécaniques avancées et système de configuration complet.",
    color: "#e8653a",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/endgame-qol",
        icon: "🔗",
      },
      { label: "Wiki", url: "https://wiki.hytalemodding.dev/mod/endgame-qol", icon: "📖" },
    ],
    highlights: [
      { label: "Items", value: "79", color: "#e8653a" },
      { label: "Armes", value: "12", color: "#f5a623" },
      { label: "Armures", value: "4 sets", color: "#4ea8f0" },
      { label: "Donjons", value: "3", color: "#845ef7" },
    ],
    intro: {
      title: "Le mod incontournable du serveur",
      paragraphs: [
        "Endgame & QoL est le pilier central de la progression sur Ciel de Vignis. Ce mod transforme l'expérience de jeu en ajoutant un véritable parcours endgame structuré autour de trois ères successives — Mithril, Onyxium et Prisma — chacune débloquée par la conquête d'un donjon et la défaite de son boss.",
        "La progression est linéaire et exigeante : chaque donjon donne accès à de nouveaux matériaux, un tier supérieur de l'Endgame Bench, et l'équipement nécessaire pour affronter le défi suivant. Les niveaux minimums sont fixés par le mod Endless Leveling, qui assure que chaque étape demande un investissement réel.",
        "Au-delà des donjons, le mod ajoute des staves pour chaque tier de minerai, des gliders, des sacs à dos, des accessoires légendaires et un système de défis Warden. Un contenu massif qui donne enfin un vrai objectif aux joueurs les plus investis.",
      ],
    },
    progression: [
      {
        id: "frozen",
        icon: "❄️",
        label: "Frozen Dungeon",
        color: "#4ea8f0",
        sublabel: "Ère Mithril",
        requires: "Endgame's Bench Tier 2 · Craft Dungeon Key",
        rewards: "Dragon Heart → Bench T3 · Shard of Frozen Summit → Mithril Ore",
        optional: "Korvyn — marchand caché",
      },
      {
        id: "swamp",
        icon: "💎",
        label: "Swamp Dungeon",
        color: "#845ef7",
        sublabel: "Ère Onyxium",
        requires: "2nd Dragon Heart → Bench T4 · Shard of Rotting Sanctum",
        rewards: "Swamp Gem · Swamp Ingot · Hedera Bramble → accès Onyxium",
        optional: null,
      },
      {
        id: "void",
        icon: "🟣",
        label: "Golem Void",
        color: "#c56cf0",
        sublabel: "Ère Prisma",
        requires: "Hedera's Gem → Bench T5 · Shard of the Void",
        rewards: "Prisma Ore · Void Amulet → Prisma Gear complet",
        optional: null,
      },
    ],
    sections: [
      {
        id: "armors",
        label: "Armures",
        icon: "🛡️",
        color: "#4ea8f0",
        items: [
          {
            name: "Set Prisma",
            quality: "Legendary",
            level: "55-65",
            slots: "Head/Chest/Legs/Hands",
            stats: "28% Phys · 15% Fire · 15% Fall · +47 HP · +30 Mana · +10% Signature",
            desc: "Le meilleur set du jeu. Résistances élémentaires complètes et bonus dégâts Signature sur chaque pièce.",
          },
          {
            name: "Set Onyxium",
            quality: "Epic",
            level: "55",
            slots: "Head/Chest/Legs/Hands",
            stats: "22% Phys · 12% Fire · +37 HP · +24 Mana · +8% Signature",
            desc: "Set endgame intermédiaire avec résistance au feu et bonus Signature.",
          },
          {
            name: "Set Mithril",
            quality: "Epic",
            level: "50",
            slots: "Head/Chest/Legs/Hands",
            stats: "18% Phys · +30 HP · +19 Mana · +6% Signature",
            desc: "Amélioration du Mithril EL de base avec Mana et bonus Signature ajoutés.",
          },
          {
            name: "Set Adamantite (amélioré)",
            quality: "Rare",
            level: "40",
            slots: "Head/Chest/Legs/Hands",
            stats: "14.4% Phys · +24 HP · +15 Mana · +6% Light",
            desc: "Bonus Mana et dégâts Light ajoutés par Endgame au set vanilla.",
          },
        ],
      },
      {
        id: "weapons",
        label: "Armes",
        icon: "⚔️",
        color: "#e8653a",
        items: [
          {
            name: "Épée Prisma",
            quality: "Legendary",
            level: "65",
            stats: "SigEnergy +30 · Mana +200 · Stamina +25",
            desc: "Épée endgame ultime avec des bonus massifs de Mana et Stamina.",
          },
          {
            name: "Daggers Prisma",
            quality: "Legendary",
            level: "70",
            stats: "SigEnergy +30 · Mana +200 · Stamina +20 · 9 attaques",
            desc: "Dagues les plus puissantes du jeu. 9 types d'attaques.",
          },
          {
            name: "Frozen Sword",
            quality: "Epic",
            level: "52",
            stats: "SigEnergy +20 · Stamina +15 · 12 attaques",
            desc: "Épée de glace avec dégâts Ice, récompense de donjon.",
          },
          {
            name: "Staves (7 tiers)",
            quality: "Uncommon→Epic",
            level: "10-55",
            stats: "Mana +15 à +60",
            desc: "Cuivre, Iron, Thorium, Cobalt, Adamantite, Mithril, Onyxium. Chaque tier donne plus de Mana.",
          },
        ],
      },
      {
        id: "dungeons",
        label: "Donjons",
        icon: "🏰",
        color: "#845ef7",
        items: [
          {
            name: "Frozen Dungeon",
            quality: "Rare",
            level: "Niv. 10-25",
            slots: "Ère Mithril",
            stats: "Portail craftable · Boss : Dragon Frost (Niv. 30)",
            desc: "Premier donjon endgame. Explorez un labyrinthe glacé peuplé de mobs gelés (Niv. 10-25) avant d'affronter le Dragon Frost au niveau 30 — un dragon de glace qui utilise des attaques de zone AoE et des projectiles de gel. Le donjon utilise un système de tiers adaptatif (Endless Leveling) qui ajuste la difficulté à votre progression.",
            boss: {
              name: "Dragon Frost",
              type: "Dragon · Niv. 30",
              mechanics: "AoE givre · Projectiles de gel · Augment : Blood Surge",
              drops: "Dragon Heart · Shard of Frozen Summit · Frozen Sword",
            },
          },
          {
            name: "Swamp Dungeon",
            quality: "Epic",
            level: "Niv. 30-45",
            slots: "Ère Onyxium",
            stats: "Portail craftable · Boss : Hedera (Niv. 50)",
            desc: "Donjon de difficulté intermédiaire dans un marais empoisonné. Des mobs toxiques (Niv. 30-45) protègent Hedera — une créature végétale ancienne au niveau 50 qui invoque des lianes piégeuses et crache du poison. Le système de tiers adaptatif ajuste la difficulté à votre niveau.",
            boss: {
              name: "Hedera",
              type: "Créature végétale · Niv. 50",
              mechanics: "Lianes piégeuses · Poison AoE · Augment : Rebirth",
              drops: "Swamp Gem · Swamp Ingot · Hedera Bramble · Hedera's Gem",
            },
          },
          {
            name: "Golem Void",
            quality: "Legendary",
            level: "Niv. 50-65",
            slots: "Ère Prisma",
            stats: "Portail craftable · Boss : Golem du Void (Niv. 70)",
            desc: "Le défi ultime du serveur. Un donjon situé dans le Void, peuplé de créatures corrompues (Niv. 50-65). Le Golem du Void au niveau 70 est le boss le plus difficile : attaques dévastatrices, phases multiples et mécaniques de zone. La victoire ouvre l'accès à l'ère Prisma et à l'équipement le plus puissant du jeu.",
            boss: {
              name: "Golem du Void",
              type: "Golem corrompu · Niv. 70",
              mechanics: "Attaques multi-phases · Zones mortelles · Augment : Rebirth",
              drops: "Shard of the Void · Void Amulet · Prisma Ore",
            },
          },
        ],
      },
      {
        id: "gear",
        label: "Équipement",
        icon: "🎒",
        color: "#f5a623",
        items: [
          {
            name: "Gliders (3 tiers)",
            quality: "Rare→Legendary",
            level: "3-10",
            stats: "Endgame Glider réduit conso Stamina",
            desc: "Standard, Advanced, Endgame. Planez à travers Orbis !",
          },
          {
            name: "Backpacks (3 tiers)",
            quality: "Uncommon→Epic",
            level: "97-99",
            stats: "Agrandissement inventaire",
            desc: "3 niveaux de sacs à dos pour augmenter votre inventaire.",
          },
          {
            name: "Warden Challenges (4 tiers)",
            quality: "Uncommon→Legendary",
            level: "—",
            stats: "Défis progressifs",
            desc: "4 niveaux de défis : prouvez votre valeur face aux Wardens.",
          },
          {
            name: "Accessories (7 types)",
            quality: "Legendary",
            level: "—",
            stats: "Blazefist, Frostwalkers, etc.",
            desc: "Accessoires légendaires uniques : Hedera Seed, Ocean Striders, Void Amulet, Pocket Garden, Pouch.",
          },
        ],
      },
      {
        id: "resources",
        label: "Ressources & Craft",
        icon: "⚗️",
        color: "#51cf66",
        items: [
          {
            name: "Minerais",
            quality: "—",
            level: "—",
            stats: "Mithril (Niv.100) · Onyxium (Niv.6)",
            desc: "Deux minerais endgame pour crafter les sets et armes les plus puissants.",
          },
          {
            name: "Potions améliorées",
            quality: "Rare",
            level: "—",
            stats: "Health, Mana, Stamina Large",
            desc: "Versions grande taille des potions de base.",
          },
          {
            name: "Matériaux de donjon",
            quality: "Epic",
            level: "—",
            stats: "Swamp Gem/Ingot · Hedera Bramble/Key/Gem · Dragon Heart",
            desc: "Drops exclusifs des donjons, nécessaires pour l'équipement endgame.",
          },
          {
            name: "Mana Totem",
            quality: "Rare",
            level: "30",
            stats: "Déployable",
            desc: "Totem régénérateur de mana posable au sol.",
          },
        ],
      },
    ],
  },
  {
    id: "endlessleveling",
    name: "Endless Leveling",
    version: "7.3.5",
    authors: ["Lewai"],
    category: "combat",
    description:
      "Système RPG complet : niveaux, attributs, races, classes, augments, prestige et portails (EndlessGate). Le cœur de la progression sur le serveur.",
    color: "#845ef7",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/endless-leveling",
        icon: "🔗",
      },
    ],
    highlights: [
      { label: "Races", value: "12", color: "#3dd8c5" },
      { label: "Classes", value: "14", color: "#e8653a" },
      { label: "Augments", value: "57", color: "#f5a623" },
      { label: "Portails", value: "∞", color: "#c56cf0" },
    ],
    intro: {
      title: "Le système RPG du serveur",
      paragraphs: [
        "Endless Leveling est le moteur RPG qui structure toute la progression de Ciel de Vignis. Le mod ajoute un système de niveaux (cap 100), 10 attributs de compétence qui évoluent à chaque niveau, et un système de prestige infini qui repousse sans cesse les limites.",
        "Chaque joueur choisit une race parmi 12 disponibles et une classe parmi 14, chacune avec son propre arbre d'évolutions (jusqu'à 5 stades par race, 5 par classe). Les augments — 57 au total répartis en 4 tiers (Common, Elite, Legendary, Mythic) — se débloquent progressivement et ajoutent des effets passifs puissants aux combats.",
        "Le mod gère aussi le niveau des mobs dans le monde : un système hybride distance + niveau du joueur adapte la difficulté en permanence. Les donjons ont leurs propres configurations de tiers avec scaling de HP, dégâts et défense, ce qui garantit un challenge constant quelle que soit votre progression.",
        "Endless Leveling dispose également de l'addon EndlessGate, qui ajoute un système de portails instanciés. Ces portails génèrent des donjons avec des boss uniques — Azaroth, Katherina, Baron, le Construct Ancient Dark Titan — chacun équipé d'augments spécifiques et d'un scaling adaptatif. Les portails offrent un contenu rejouable à l'infini, parfait pour farmer l'XP et tester ses builds en conditions extrêmes.",
      ],
    },
    progression: [
      {
        id: "leveling",
        icon: "⭐",
        label: "Leveling (Niv. 1-100)",
        color: "#f5a623",
        sublabel: "Progression de base",
        requires: "Tuer des mobs pour gagner de l'XP",
        rewards:
          "5 skill points/niveau · 10 attributs à monter · Passifs débloqués progressivement",
        optional: "Party XP : 60% partagés dans un rayon de 40 blocs",
      },
      {
        id: "builds",
        icon: "🧬",
        label: "Race + Classe",
        color: "#3dd8c5",
        sublabel: "Personnalisation",
        requires: "Race au Niv. 1 · Classe au Niv. 1 · 1 changement autorisé",
        rewards:
          "12 races × 6 évolutions · 14 classes × 5 évolutions · Classe secondaire disponible",
        optional: null,
      },
      {
        id: "prestige",
        icon: "🔥",
        label: "Prestige (∞)",
        color: "#845ef7",
        sublabel: "Endgame infini",
        requires: "Atteindre le level cap (100 + 10/prestige)",
        rewards: "Nouveaux slots d'augments · Rerolls de tier · +20% XP de base/prestige",
        optional: null,
      },
    ],
    sections: [
      {
        id: "attributes",
        label: "Attributs",
        icon: "📊",
        color: "#845ef7",
        items: [
          {
            name: "Life Force",
            quality: "—",
            level: "Par niveau : +2.5",
            stats: "Santé",
            desc: "Points de vie supplémentaires par niveau. L'attribut le plus vital pour la survie.",
          },
          {
            name: "Strength",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Dégâts physiques",
            desc: "Bonus de dégâts physiques appliqué à chaque attaque de mêlée et à distance.",
          },
          {
            name: "Defense",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Réduction de dégâts",
            desc: "Réduction de dégâts subis. Capée selon la catégorie de classe (40% Mage → 80% Vanguard/Juggernaut).",
          },
          {
            name: "Haste",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Vitesse de déplacement",
            desc: "Augmente la vitesse de déplacement du joueur.",
          },
          {
            name: "Precision",
            quality: "—",
            level: "Par niveau : +0.8",
            stats: "Chance de critique",
            desc: "Probabilité d'infliger un coup critique lors d'une attaque.",
          },
          {
            name: "Ferocity",
            quality: "—",
            level: "Par niveau : +1.2",
            stats: "Dégâts critiques",
            desc: "Multiplicateur de dégâts sur les coups critiques.",
          },
          {
            name: "Stamina",
            quality: "—",
            level: "Par niveau : +0.2",
            stats: "Endurance",
            desc: "Stamina pour les actions comme le sprint, le dodge et le glider.",
          },
          {
            name: "Sorcery",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Dégâts magiques (staves)",
            desc: "Bonus de dégâts magiques, applicable uniquement aux staves.",
          },
          {
            name: "Flow",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Mana",
            desc: "Ressource pour les sorts et capacités spéciales.",
          },
          {
            name: "Discipline",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Bonus d'XP (%)",
            desc: "Pourcentage de bonus d'expérience gagné par niveau.",
          },
        ],
      },
      {
        id: "passives",
        label: "Passifs",
        icon: "🛡️",
        color: "#3dd8c5",
        items: [
          {
            name: "Stamina Gain Bonus",
            quality: "Common",
            level: "Débloqué Niv. 5",
            stats: "Base +20% · +20%/tier · Max 10 tiers · Intervalle : 5 niv.",
            desc: "Augmente le gain de stamina. Premier passif accessible, progression rapide.",
          },
          {
            name: "Mana Regeneration",
            quality: "Common",
            level: "Débloqué Niv. 10",
            stats: "Base +1.0 · +0.5/tier · Max 10 tiers · Intervalle : 6 niv.",
            desc: "Régénération passive de mana au fil du temps.",
          },
          {
            name: "Signature Gain",
            quality: "Rare",
            level: "Débloqué Niv. 15",
            stats: "Base +40 · +40/tier · Max 10 tiers · Intervalle : 7 niv.",
            desc: "Accélère le gain d'énergie Signature pour votre arme.",
          },
          {
            name: "Regeneration",
            quality: "Rare",
            level: "Débloqué Niv. 20",
            stats: "Base +3.0 · +1.5/tier · Max 10 tiers · Intervalle : 8 niv.",
            desc: "Régénération passive de points de vie. Indispensable en solo.",
          },
          {
            name: "Luck",
            quality: "Epic",
            level: "Débloqué Niv. 20",
            stats: "Base +2.5% · +2.5%/tier · Max 40 tiers · Intervalle : 5 niv.",
            desc: "Augmente les chances de loot rare. Le passif avec le plus de tiers disponibles (40).",
          },
        ],
      },
      {
        id: "races",
        label: "Races",
        icon: "🧬",
        color: "#e8653a",
        items: [
          {
            name: "Human",
            quality: "Common",
            level: "Base",
            stats: "Polyvalent · Equilibré",
            desc: "Race par défaut. Évolue en Explorer ou Raider, puis Voyager/Conqueror/Emperor.",
          },
          {
            name: "Dragonborn",
            quality: "Epic",
            level: "Base",
            stats: "Offensif · Tank",
            desc: "Descendants des dragons. Évolutions : Guardian, Marauder, Sentinel, Alpha, Tyrant.",
          },
          {
            name: "Iceborn",
            quality: "Epic",
            level: "Base",
            stats: "Défensif · Givre",
            desc: "Nés du froid éternel. Évolutions : Guardian, Berzerker, Titan, Frostlord, Ragnarok.",
          },
          {
            name: "Vastaya",
            quality: "Rare",
            level: "Base",
            stats: "Agile · Nature",
            desc: "Créatures mi-animales. Évolutions : Hunter, Mystic, Beastlord, Apex, Spiritbinder.",
          },
          {
            name: "Celestial",
            quality: "Legendary",
            level: "Base",
            stats: "Magique · Support",
            desc: "Êtres célestes. Évolutions : Adept, Catalyst, Arcanum, Overlord, Supreme.",
          },
          {
            name: "Darkin",
            quality: "Legendary",
            level: "Base",
            stats: "Offensif · Vampirique",
            desc: "Corrompus par le Void. Évolutions : Blade, Warlord, Bloodweaver, Bloodlord, Unbound.",
          },
          {
            name: "Voidborn",
            quality: "Epic",
            level: "Base",
            stats: "Chaos · Offensif",
            desc: "Nés du néant. Évolutions : Prowler, Protector, Reaver, Juggernaut, Oblivion.",
          },
          {
            name: "Wraith",
            quality: "Rare",
            level: "Base",
            stats: "Furtif · Assassin",
            desc: "Spectres entre les mondes. Évolutions : Whisper, Fang, Spectral, Reaver, Phantom King.",
          },
          {
            name: "+ 4 autres races",
            quality: "—",
            level: "—",
            stats: "Ascended · Golem · Watcher · Yordle",
            desc: "Chaque race a 6 stades d'évolution avec des attributs et passifs uniques.",
          },
        ],
      },
      {
        id: "classes",
        label: "Classes",
        icon: "⚔️",
        color: "#f5a623",
        items: [
          {
            name: "Assassin",
            quality: "Epic",
            level: "Melee",
            stats: "Dagger/Sword/Bow · Focused Strike · Reset on Kill",
            desc: "Maître de l'ouverture. Dégâts physiques en burst avec un cooldown reset au kill.",
          },
          {
            name: "Battlemage",
            quality: "Epic",
            level: "Hybrid",
            stats: "Staff/Sword · Dégâts hybrides",
            desc: "Mêle magie et mêlée. Defense cap : 65%.",
          },
          {
            name: "Vanguard",
            quality: "Legendary",
            level: "Tank",
            stats: "Sword/Mace · Defense cap 80%",
            desc: "Le tank ultime avec la plus haute réduction de dégâts.",
          },
          {
            name: "Marksman",
            quality: "Rare",
            level: "Ranged",
            stats: "Bow · Dégâts à distance · Defense cap 40%",
            desc: "Spécialiste du combat à distance avec des bonus de précision.",
          },
          {
            name: "Mage",
            quality: "Rare",
            level: "Ranged",
            stats: "Staff · Sorcery · Defense cap 40%",
            desc: "Dégâts magiques purs via les staves. Glass cannon.",
          },
          {
            name: "Necromancer",
            quality: "Legendary",
            level: "Hybrid",
            stats: "Staff/Dagger · Dark magic",
            desc: "Magie noire et invocations. Mélange offense et survie.",
          },
          {
            name: "Slayer",
            quality: "Epic",
            level: "Melee",
            stats: "Sword/Axe · Burst damage",
            desc: "Spécialiste du burst offensif en mêlée.",
          },
          {
            name: "+ 7 autres classes",
            quality: "—",
            level: "—",
            stats: "Adventurer · Arcanist · Brawler · Duelist · Juggernaut · Magistrate · Priest",
            desc: "Chaque classe a 5 évolutions (Elite, Master, Exalted, Legendary) avec des passifs uniques. Classe secondaire disponible (-40% dégâts hors catégorie d'arme).",
          },
        ],
      },
      {
        id: "augments",
        label: "Augments",
        icon: "💎",
        color: "#c56cf0",
        items: [
          {
            name: "Tier Common (débloqué Niv. 5+)",
            quality: "Common",
            level: "Niv. 5, 10, 15, 35, 45 + */10",
            stats: "Passifs de base",
            desc: "Augments fondamentaux : Burn, Drain, Fleet Footwork, Overheal, Vampirism, Wither...",
          },
          {
            name: "Tier Elite (débloqué Niv. 15)",
            quality: "Rare",
            level: "Niv. 15 · Prestige 1, 4, 7, 10",
            stats: "Passifs avancés",
            desc: "Blood Frenzy, Conqueror, Executioner, First Strike, Phase Rush, Predator, Reckoning...",
          },
          {
            name: "Tier Legendary (débloqué Niv. 30)",
            quality: "Epic",
            level: "Niv. 30 · Prestige 10",
            stats: "Passifs puissants",
            desc: "Arcane Mastery, Blood Surge, Giant Slayer, Glass Cannon, Goliath, Rebirth, Undying Rage...",
          },
          {
            name: "Tier Mythic (débloqué Niv. 50)",
            quality: "Legendary",
            level: "Niv. 50 · Prestige 15",
            stats: "Passifs ultimes",
            desc: "Les augments les plus rares. Débloqués au prestige 15, ils transforment radicalement votre build.",
          },
        ],
      },
      {
        id: "mobleveling",
        label: "Mob Leveling",
        icon: "🎯",
        color: "#4ea8f0",
        items: [
          {
            name: "Mode Overworld (MIXED)",
            quality: "—",
            level: "Monde ouvert",
            stats: "30% joueur + 70% distance · 40 blocs/niveau depuis le spawn",
            desc: "Les mobs s'adaptent : plus vous êtes loin du spawn, plus ils sont forts. Votre niveau influence aussi (30%). Range d'XP : ±15 niveaux de différence.",
          },
          {
            name: "Mode Donjon (TIERED)",
            quality: "—",
            level: "Instances",
            stats: "Tiers adaptatifs · 20 niveaux/tier · Scaling HP/DMG/DEF",
            desc: "Chaque donjon a un niveau de base fixe et des tiers infinis. Le scaling monte les HP (×3.0 base), les dégâts (×1.25 base) et la défense des mobs progressivement.",
          },
          {
            name: "Nameplates",
            quality: "—",
            level: "Visuel",
            stats: "Niveau + Nom + HP affichés",
            desc: "Chaque mob affiche son niveau, son nom et sa barre de vie. Mise à jour en temps réel (1 tick).",
          },
          {
            name: "XP Scaling",
            quality: "—",
            level: "Récompenses",
            stats: "Linéaire · ×0.8 global · Min 50 XP",
            desc: "L'XP scale linéairement. Bonus ×3 au max level. Mobs trop faibles ou trop forts : seulement 5% de l'XP. Minimum garanti : 50 XP.",
          },
        ],
      },
      {
        id: "endlessgate",
        label: "EndlessGate",
        icon: "🌀",
        color: "#c56cf0",
        items: [
          {
            name: "Portails instanciés",
            quality: "—",
            level: "Addon",
            stats: "Donjons générés · Rejouable à l'infini",
            desc: "EndlessGate est l'addon officiel d'Endless Leveling qui ajoute un système de portails. Chaque portail ouvre une instance de donjon avec des mobs et boss configurés spécifiquement. Le scaling suit le même système de tiers adaptatif qu'Endless Leveling : HP (×3.0 base), dégâts (×1.25 base) et défense progressifs.",
          },
          {
            name: "Azaroth",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Rebirth · Frozen Domain",
            desc: "Boss majeur des portails. Combinaison mortelle de résurrection (Rebirth) et de contrôle de zone glacé (Frozen Domain). Niveau = max du range +10.",
            boss: {
              name: "Azaroth",
              type: "Boss de portail",
              mechanics: "Rebirth · Frozen Domain · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Katherina",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Bloodthirster · Vampirism",
            desc: "Boss vampirique qui se soigne en infligeant des dégâts. Bloodthirster et Vampirism la rendent extrêmement résiliente — il faut un burst massif pour la finir.",
            boss: {
              name: "Katherina",
              type: "Boss de portail",
              mechanics: "Bloodthirster · Vampirism · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Baron",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Blood Surge · Bloodthirster",
            desc: "Boss offensif avec Blood Surge (dégâts augmentés) et Bloodthirster (vol de vie). Un adversaire agressif qui punit les builds trop défensifs.",
            boss: {
              name: "Baron",
              type: "Boss de portail",
              mechanics: "Blood Surge · Bloodthirster · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Construct Ancient Dark Titan",
            quality: "Epic",
            level: "Boss",
            stats: "Scaling défensif réduit",
            desc: "Titan mécanique ancien. Moins de defense scaling que les autres boss mais toujours redoutable par son pool de HP et ses dégâts bruts.",
            boss: {
              name: "Construct Ancient Dark Titan",
              type: "Boss de portail",
              mechanics: "Tank massif · Dégâts bruts",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Cult Knights & Werewolves",
            quality: "Rare",
            level: "Mini-boss",
            stats: "Augments (mini-boss) : Blood Surge · Blood Frenzy · Vampirism",
            desc: "Mobs élites des portails. Les versions mini-boss ont 3 augments simultanés et un scaling de dégâts renforcé. Apparaissent en groupes.",
          },
        ],
      },
    ],
  },
  {
    id: "arcanerelay",
    name: "Arcane Relay",
    version: "1.1.1",
    authors: ["PseudoAle", "Fanzy"],
    category: "craft",
    description:
      "Système d'automatisation magique et de logique pour Hytale. Activez des mécanismes à distance, déplacez des blocs et créez des circuits.",
    color: "#51cf66",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/arcane-relay",
        icon: "🔗",
      },
    ],
    highlights: [
      { label: "Blocs", value: "8", color: "#51cf66" },
      { label: "Actions", value: "15", color: "#f5a623" },
      { label: "Bench", value: "1", color: "#845ef7" },
      { label: "DL", value: "2.1K", color: "#4ea8f0" },
    ],
    intro: {
      title: "L'automatisation magique sur Orbis",
      paragraphs: [
        "Arcane Relay est un mod d'automatisation et de logique qui permet de construire de véritables machines dans Hytale. Développé par Pseudo_Elephant (PseudoAle & Fanzy), il est l'un des mods les plus populaires sur CurseForge avec plus de 2 100 téléchargements et 65 commentaires.",
        "Le concept est simple : des blocs arcaniques — Relays, Buttons, Pushers, Pullers — peuvent être connectés entre eux grâce à un Arcane Staff. Chaque bloc envoyeur peut déclencher à distance des actions sur d'autres blocs : ouvrir des portes, allumer des torches, déplacer des blocs, envoyer des signaux en chaîne. Le tout sans fil, par magie.",
        "L'Arcane Bench, craftable au Workbench Tier 2 (10 Thorium Bars + 30 Linen + 20 Void Essence), offre trois catégories de craft : Portails, Artefacts et Divers. Avec un système de Toggle Relay qui peut bloquer ou relayer un signal, et un Discharge qui accumule des signaux avant de les relâcher, les joueurs créatifs peuvent construire des systèmes complexes : ascenseurs, bases secrètes, cryptes qui s'illuminent, portes automatiques et bien plus.",
      ],
    },
    sections: [
      {
        id: "blocks",
        label: "Blocs",
        icon: "🧱",
        color: "#51cf66",
        items: [
          {
            name: "Arcane Relay",
            quality: "Rare",
            level: "Bloc",
            stats: "Envoyeur de signal",
            desc: "Le bloc de base. Relaie un signal vers ses sorties connectées. Interagissez pour envoyer manuellement un signal.",
          },
          {
            name: "Toggle Relay",
            quality: "Rare",
            level: "Bloc",
            stats: "Relais conditionnel · On/Off",
            desc: "Bloque ou relaie le signal selon son état. Chaque signal reçu bascule l'état. Interagissez pour changer l'état de départ.",
          },
          {
            name: "Button",
            quality: "Common",
            level: "Bloc",
            stats: "Déclencheur",
            desc: "Bouton qui envoie un signal à distance vers les blocs connectés. Le déclencheur le plus simple du système.",
          },
          {
            name: "Pusher",
            quality: "Rare",
            level: "Bloc",
            stats: "Déplacement de blocs",
            desc: "Pousse les blocs dans la direction où il fait face. Peut être déclenché à distance par un signal. Variante murale disponible pour pousser verticalement.",
          },
          {
            name: "Puller",
            quality: "Rare",
            level: "Bloc",
            stats: "Attraction de blocs",
            desc: "Tire un bloc distant vers lui. S'étend pour atteindre la cible, puis la ramène au signal suivant. Utilise des Puller Extensions.",
          },
          {
            name: "Discharge",
            quality: "Epic",
            level: "Bloc",
            stats: "Accumulateur de signaux",
            desc: "Stocke les signaux reçus avant de les relayer une fois chargé. Interagissez pour régler le nombre de signaux nécessaires. Parfait pour créer des minuteries et séquences.",
          },
        ],
      },
      {
        id: "tools",
        label: "Outils",
        icon: "🔧",
        color: "#f5a623",
        items: [
          {
            name: "Arcane Staff",
            quality: "Rare",
            level: "Outil",
            stats: "Configuration des connexions",
            desc: "L'outil indispensable pour configurer les connexions arcaniques. Clic droit : sélectionner un bloc source. Clic gauche : ajouter/retirer une destination. Accroupi + interaction : voir les connexions d'un bloc.",
          },
          {
            name: "Arcane Bench",
            quality: "Epic",
            level: "Bench",
            stats: "10 Thorium Bars · 30 Linen · 20 Void Essence",
            desc: "Établi de craft pour tous les blocs et outils arcaniques. Craftable au Workbench Tier 2. Trois catégories : Portails, Artefacts et Divers.",
          },
          {
            name: "Crystal Cyan",
            quality: "Common",
            level: "Ingrédient",
            stats: "Ressource de craft",
            desc: "Cristal cyan utilisé comme composant dans les recettes arcaniques.",
          },
        ],
      },
      {
        id: "activations",
        label: "Interactions",
        icon: "⚡",
        color: "#4ea8f0",
        items: [
          {
            name: "Toggle Door / Gate",
            quality: "—",
            level: "Action",
            stats: "Porte · Porte horizontale · Grille",
            desc: "Ouvrez et fermez des portes et grilles à distance. Trois variantes : porte standard, porte horizontale et grille.",
          },
          {
            name: "Toggle Torch",
            quality: "—",
            level: "Action",
            stats: "Torche · Torche brute",
            desc: "Allumez et éteignez des torches à distance. Idéal pour les cryptes et les éclairages automatiques.",
          },
          {
            name: "Move Block",
            quality: "—",
            level: "Action",
            stats: "Déplacement haut/bas",
            desc: "Déplace un bloc vers le haut ou le bas. Base pour construire des ascenseurs et plateformes mobiles.",
          },
          {
            name: "Push / Pull Chain",
            quality: "—",
            level: "Action",
            stats: "Chaîne de Pusher · Chaîne de Puller",
            desc: "Les Pushers et Pullers peuvent fonctionner en chaîne, poussant ou tirant plusieurs blocs à la suite.",
          },
          {
            name: "Send Signal",
            quality: "—",
            level: "Action",
            stats: "Propagation",
            desc: "Envoie un signal d'un bloc arcanique à un autre. La brique élémentaire de tout circuit logique.",
          },
        ],
      },
    ],
  },
];

function ModsPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [expandedMod, setExpandedMod] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const filteredMods =
    selectedCat === "all" ? MODS_DATA : MODS_DATA.filter((m) => m.category === selectedCat);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Magical night background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 720,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, #0a0812 0%, #0f0a1a 15%, #1a1228 40%, #1e1630 70%, transparent 100%)",
          zIndex: -1,
        }}
      />
      {/* Floating magical orbs */}
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 110,
          left: "7%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffecb4f0, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 18px #e8a537a0",
          pointerEvents: "none",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 170,
          right: "8%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff73 40%, transparent 70%)",
          boxShadow: "0 0 16px #a878ff90",
          pointerEvents: "none",
          animationDelay: "3s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 520,
          right: "4%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c573 40%, transparent 70%)",
          boxShadow: "0 0 14px #3dd8c590",
          pointerEvents: "none",
          animationDelay: "5s",
        }}
      />

      <div style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Magical mini-hero */}
        <div
          className="page-hero"
          style={{
            textAlign: "center",
            marginBottom: 28,
            paddingBottom: 22,
            borderBottom: "1px solid rgba(232,165,55,0.18)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
              filter: "drop-shadow(0 0 16px rgba(232,165,55,0.5))",
            }}
          >
            🧩
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 10,
              color: "#e8a537",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Bibliothèque des Arcanes
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              margin: "0 0 6px",
              letterSpacing: 2,
              textShadow: "0 0 24px rgba(232,165,55,0.3)",
            }}
          >
            Mods
          </h1>
          <p
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              fontSize: 13,
              color: "#a89075",
              margin: "0 0 8px",
            }}
          >
            « {MODS_DATA.length} enchantement{MODS_DATA.length > 1 ? "s" : ""} qui façonne
            {MODS_DATA.length > 1 ? "nt" : ""} le Ciel de Vignis »
          </p>
        </div>

        {/* Category filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {MOD_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={"wiki-chip" + (selectedCat === c.id ? " active" : "")}
            >
              <span style={{ fontSize: 14 }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredMods.map((mod) => {
            const isOpen = expandedMod === mod.id;
            const catInfo = MOD_CATEGORIES.find((c) => c.id === mod.category) || MOD_CATEGORIES[0];
            const curSection = activeSection || (mod.intro ? "__intro" : mod.sections[0]?.id);
            const sectionData = mod.sections.find((s) => s.id === curSection) || mod.sections[0];
            const initial = mod.name.charAt(0).toUpperCase();
            return (
              <div
                key={mod.id}
                className="mod-card"
                style={{
                  background: "linear-gradient(180deg, rgba(26,22,40,0.7), rgba(10,8,18,0.55))",
                  border: "1px solid " + (isOpen ? mod.color + "50" : "rgba(232,165,55,0.22)"),
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "all 0.25s",
                  "--mod-accent": mod.color,
                  position: "relative",
                }}
              >
                {/* Magical accent line on top */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${mod.color}, transparent)`,
                    opacity: 0.65,
                    pointerEvents: "none",
                  }}
                />

                {/* Header */}
                <div
                  onClick={() => {
                    setExpandedMod(isOpen ? null : mod.id);
                    setActiveSection(null);
                  }}
                  style={{ cursor: "pointer", display: "flex", alignItems: "stretch", gap: 0 }}
                >
                  {/* Codex illustration — colored gradient rectangle */}
                  <div
                    style={{
                      width: 130,
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${mod.color}, ${mod.color}70)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 130,
                    }}
                  >
                    {/* Diagonal pattern overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.12,
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px)",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Dark vignette */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(ellipse at center, transparent 30%, rgba(10,8,18,0.5) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 48,
                        zIndex: 1,
                        filter: "drop-shadow(0 0 14px rgba(0,0,0,0.5))",
                      }}
                    >
                      {catInfo.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: "18px 22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        marginBottom: 6,
                      }}
                    >
                      {/* Illuminated initial */}
                      <span
                        style={{
                          fontFamily: "var(--fd)",
                          fontSize: 34,
                          color: mod.color,
                          fontWeight: 700,
                          lineHeight: 0.9,
                          flexShrink: 0,
                          filter: `drop-shadow(0 0 10px ${mod.color}60)`,
                        }}
                      >
                        {initial}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 19,
                              fontWeight: 700,
                              color: "#f0e6d2",
                              fontFamily: "var(--fd)",
                              letterSpacing: 0.5,
                            }}
                          >
                            {mod.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9.5,
                              padding: "2px 8px",
                              borderRadius: 3,
                              background: mod.color + "18",
                              color: mod.color,
                              fontWeight: 700,
                              letterSpacing: 0.1 + "em",
                            }}
                          >
                            v{mod.version}
                          </span>
                          <span
                            style={{
                              fontSize: 9.5,
                              padding: "2px 8px",
                              borderRadius: 3,
                              background: "rgba(232,165,55,0.12)",
                              color: "#e8a537",
                              fontWeight: 700,
                              letterSpacing: 0.05 + "em",
                              textTransform: "uppercase",
                            }}
                          >
                            {catInfo.icon} {catInfo.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#a89075",
                            lineHeight: 1.55,
                            marginBottom: 8,
                          }}
                        >
                          {mod.description}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {mod.authors.map((a) => (
                            <span
                              key={a}
                              style={{
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 3,
                                background: "rgba(26,22,40,0.6)",
                                border: "1px solid rgba(232,165,55,0.15)",
                                color: "#c9b892",
                                fontWeight: 600,
                              }}
                            >
                              👤 {a}
                            </span>
                          ))}
                          {mod.links &&
                            mod.links.map((l) => (
                              <a
                                key={l.label}
                                href={l.url}
                                target="_blank"
                                rel="noopener"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  fontSize: 10,
                                  padding: "2px 8px",
                                  borderRadius: 3,
                                  background: "rgba(61,216,197,0.12)",
                                  border: "1px solid rgba(61,216,197,0.3)",
                                  color: "#3dd8c5",
                                  fontWeight: 600,
                                  textDecoration: "none",
                                }}
                              >
                                {l.icon} {l.label}
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights + chevron */}
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      padding: "0 20px",
                      flexShrink: 0,
                      borderLeft: "1px solid rgba(232,165,55,0.1)",
                    }}
                  >
                    {mod.highlights.map((h) => (
                      <div key={h.label} style={{ textAlign: "center", minWidth: 46 }}>
                        <div
                          style={{
                            fontSize: 19,
                            fontWeight: 700,
                            color: h.color,
                            fontFamily: "var(--fd)",
                          }}
                        >
                          {h.value}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#8a8070",
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            fontWeight: 700,
                            marginTop: 2,
                          }}
                        >
                          {h.label}
                        </div>
                      </div>
                    ))}
                    <span
                      style={{
                        fontSize: 14,
                        color: "#8a8070",
                        transform: isOpen ? "rotate(180deg)" : "",
                        transition: "transform 0.2s",
                        marginLeft: 8,
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div
                    className="wiki-expanded"
                    style={{ borderTop: "1px solid " + G.border + "60" }}
                  >
                    {/* Section tabs — add Aperçu tab */}
                    <div
                      style={{
                        display: "flex",
                        gap: 0,
                        borderBottom: "1px solid " + G.border + "40",
                        background: G.bg + "80",
                        overflowX: "auto",
                      }}
                    >
                      {mod.intro && (
                        <button
                          onClick={() => setActiveSection("__intro")}
                          style={{
                            padding: "12px 20px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--fb)",
                            background: curSection === "__intro" ? G.card : "transparent",
                            color: curSection === "__intro" ? mod.color : G.muted,
                            fontWeight: curSection === "__intro" ? 800 : 600,
                            fontSize: 13,
                            borderBottom:
                              curSection === "__intro"
                                ? "2px solid " + mod.color
                                : "2px solid transparent",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: 15 }}>📋</span> Aperçu
                        </button>
                      )}
                      {mod.sections.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveSection(s.id)}
                          style={{
                            padding: "12px 20px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--fb)",
                            background: curSection === s.id ? G.card : "transparent",
                            color: curSection === s.id ? s.color : G.muted,
                            fontWeight: curSection === s.id ? 800 : 600,
                            fontSize: 13,
                            borderBottom:
                              curSection === s.id
                                ? "2px solid " + s.color
                                : "2px solid transparent",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ fontSize: 15 }}>{s.icon}</span> {s.label}{" "}
                          <span style={{ fontSize: 10, opacity: 0.6 }}>({s.items.length})</span>
                        </button>
                      ))}
                    </div>

                    {/* Intro / Aperçu section */}
                    {curSection === "__intro" && mod.intro && (
                      <div style={{ padding: "28px 24px" }}>
                        {/* Intro text */}
                        <h3
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: "#f0e6d2",
                            fontFamily: "var(--fd)",
                            marginBottom: 16,
                          }}
                        >
                          {mod.intro.title}
                        </h3>
                        {mod.intro.paragraphs.map((p, i) => (
                          <p
                            key={i}
                            style={{
                              fontSize: 13,
                              color: G.muted,
                              lineHeight: 1.8,
                              marginBottom: i < mod.intro.paragraphs.length - 1 ? 14 : 0,
                            }}
                          >
                            {p}
                          </p>
                        ))}

                        {/* Progression flowchart */}
                        {mod.progression && (
                          <>
                            <div
                              style={{
                                marginTop: 32,
                                marginBottom: 20,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  height: 1,
                                  flex: 1,
                                  background: `linear-gradient(90deg, transparent, ${G.border})`,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: G.gold,
                                  textTransform: "uppercase",
                                  letterSpacing: 2,
                                }}
                              >
                                Progression
                              </span>
                              <div
                                style={{
                                  height: 1,
                                  flex: 1,
                                  background: `linear-gradient(90deg, ${G.border}, transparent)`,
                                }}
                              />
                            </div>

                            <div
                              style={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                gap: 0,
                                paddingLeft: 28,
                              }}
                            >
                              {/* Vertical line */}
                              <div
                                style={{
                                  position: "absolute",
                                  left: 15,
                                  top: 28,
                                  bottom: 28,
                                  width: 2,
                                  background: `linear-gradient(180deg, ${mod.progression[0].color}60, ${mod.progression[1]?.color || mod.progression[0].color}60, ${mod.progression[mod.progression.length - 1].color}60)`,
                                  borderRadius: 1,
                                }}
                              />

                              {mod.progression.map((step, si) => (
                                <div key={step.id}>
                                  {/* Step node */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 16,
                                      alignItems: "flex-start",
                                      position: "relative",
                                    }}
                                  >
                                    {/* Circle node on line */}
                                    <div
                                      style={{
                                        position: "absolute",
                                        left: -28,
                                        top: 2,
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        background: `radial-gradient(circle, ${step.color}30, ${step.color}08)`,
                                        border: `2px solid ${step.color}80`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        zIndex: 2,
                                        boxShadow: `0 0 12px ${step.color}20`,
                                      }}
                                    >
                                      {step.icon}
                                    </div>

                                    {/* Content card */}
                                    <div
                                      style={{
                                        flex: 1,
                                        background: `linear-gradient(135deg, ${step.color}08, transparent)`,
                                        border: `1px solid ${step.color}20`,
                                        borderRadius: 12,
                                        padding: "16px 20px",
                                        marginLeft: 12,
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 10,
                                          marginBottom: 8,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: 17,
                                            fontWeight: 800,
                                            color: "#f0e6d2",
                                            fontFamily: "var(--fd)",
                                          }}
                                        >
                                          {step.label}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: 10,
                                            padding: "3px 10px",
                                            borderRadius: 10,
                                            background: step.color + "18",
                                            color: step.color,
                                            fontWeight: 700,
                                            border: `1px solid ${step.color}25`,
                                          }}
                                        >
                                          {step.sublabel}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "1fr 1fr",
                                          gap: 8,
                                        }}
                                      >
                                        <div>
                                          <div
                                            style={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              color: step.color,
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                              marginBottom: 4,
                                            }}
                                          >
                                            Prérequis
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 12,
                                              color: G.muted,
                                              lineHeight: 1.6,
                                            }}
                                          >
                                            {step.requires}
                                          </div>
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              color: G.green,
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                              marginBottom: 4,
                                            }}
                                          >
                                            Récompenses
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 12,
                                              color: G.muted,
                                              lineHeight: 1.6,
                                            }}
                                          >
                                            {step.rewards}
                                          </div>
                                        </div>
                                      </div>
                                      {step.optional && (
                                        <div
                                          style={{
                                            marginTop: 8,
                                            fontSize: 11,
                                            color: G.gold,
                                            fontStyle: "italic",
                                          }}
                                        >
                                          💡 {step.optional}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Arrow between steps */}
                                  {si < mod.progression.length - 1 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: 24,
                                        position: "relative",
                                      }}
                                    >
                                      <div
                                        style={{
                                          position: "absolute",
                                          left: -13,
                                          fontSize: 10,
                                          color: G.muted,
                                        }}
                                      >
                                        ▼
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Regular section content */}
                    {curSection !== "__intro" && (
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {sectionData.items.map((item, i) => {
                            const qColors = {
                              Legendary: "#f5a623",
                              Epic: "#845ef7",
                              Rare: "#4ea8f0",
                              Uncommon: "#3dd8c5",
                              Common: "#95a5a6",
                            };
                            const qc = qColors[item.quality] || G.muted;
                            return (
                              <div
                                key={i}
                                style={{
                                  background: sectionData.color + "06",
                                  border: "1px solid " + sectionData.color + "12",
                                  borderLeft: "3px solid " + sectionData.color + "60",
                                  borderRadius: 10,
                                  padding: "16px 20px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 800,
                                      color: "#f0e6d2",
                                      fontFamily: "var(--fd)",
                                    }}
                                  >
                                    {item.name}
                                  </span>
                                  {item.quality && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        background: qc + "15",
                                        color: qc,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {item.quality}
                                    </span>
                                  )}
                                  {item.level && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        background: G.border,
                                        color: G.muted,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.level}
                                    </span>
                                  )}
                                  {item.slots && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        background: G.blue + "15",
                                        color: G.blue,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.slots}
                                    </span>
                                  )}
                                </div>
                                {item.stats && (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: sectionData.color,
                                      fontWeight: 700,
                                      marginBottom: 6,
                                      fontFamily: "var(--fb)",
                                    }}
                                  >
                                    {item.stats}
                                  </div>
                                )}
                                <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>
                                  {item.desc}
                                </div>

                                {/* Boss card for dungeons */}
                                {item.boss && (
                                  <div
                                    style={{
                                      marginTop: 12,
                                      padding: "14px 16px",
                                      borderRadius: 10,
                                      background: `linear-gradient(135deg, ${sectionData.color}10, ${sectionData.color}04)`,
                                      border: `1px solid ${sectionData.color}25`,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 8,
                                      }}
                                    >
                                      <span style={{ fontSize: 14 }}>💀</span>
                                      <span
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 800,
                                          color: "#f0e6d2",
                                          fontFamily: "var(--fd)",
                                        }}
                                      >
                                        {item.boss.name}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "2px 8px",
                                          borderRadius: 4,
                                          background: "#ff6b6b15",
                                          color: "#ff6b6b",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {item.boss.type}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 10,
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "#ff6b6b",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 4,
                                          }}
                                        >
                                          Mécaniques
                                        </div>
                                        <div
                                          style={{ fontSize: 11, color: G.muted, lineHeight: 1.6 }}
                                        >
                                          {item.boss.mechanics}
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: G.gold,
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 4,
                                          }}
                                        >
                                          Drops
                                        </div>
                                        <div
                                          style={{ fontSize: 11, color: G.muted, lineHeight: 1.6 }}
                                        >
                                          {item.boss.drops}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 32,
            padding: "24px",
            borderRadius: 14,
            border: "1px dashed rgba(232,165,55,0.2)",
            textAlign: "center",
            background: "rgba(26,22,40,0.35)",
          }}
        >
          <div style={{ fontSize: 14, color: "#a89075", marginBottom: 4, fontStyle: "italic" }}>
            🚧 D'autres enchantements seront ajoutés prochainement
          </div>
          <div style={{ fontSize: 12, color: "#6a5a45" }}>59 mods au total sur le serveur</div>
        </div>
      </div>
    </div>
  );
}

export { ModsPage };
