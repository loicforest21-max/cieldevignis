import { useState, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════
// BUILD CREATOR — DATA & COMPUTATION ENGINE
// ═══════════════════════════════════════════════════


// ═══════════════════════════════════════════
// STAT DEFINITIONS
// Stats have 4 modes:
// - "mult": race attr is a MULTIPLIER applied to (innate + SP). Values ~0.6-1.1
// - "haste": race attr is speed modifier where 1.0=base. Formula: (race-1)×100 + (innate+SP)×race
// - "add%": race attr is a FLAT % added. Values like 3.5, 7.0, 52.5
// - "flat": race attr is a flat value added. Values like 65, 98, 195
// ═══════════════════════════════════════════
const STATS = [
  { key: "life_force", name: "Vitalité", icon: "❤️", per_level: 2.5, color: "#ff6b6b", mode: "flat", hytaleBase: 0, desc: "PV" },
  { key: "strength", name: "Force", icon: "⚔️", per_level: 0.5, color: "#ff9f43", mode: "mult", desc: "Dégâts physiques" },
  { key: "sorcery", name: "Sorcellerie", icon: "✨", per_level: 0.75, color: "#a55eea", mode: "mult", desc: "Dégâts magiques" },
  { key: "defense", name: "Défense", icon: "🛡️", per_level: 0.5, color: "#54a0ff", mode: "mult", desc: "Réduction dégâts" },
  { key: "haste", name: "Hâte", icon: "💨", per_level: 0.75, color: "#a29bfe", mode: "haste", desc: "Vitesse" },
  { key: "precision", name: "Précision", icon: "🎯", per_level: 0.8, color: "#f368e0", mode: "add%", desc: "Chance critique" },
  { key: "ferocity", name: "Férocité", icon: "🔥", per_level: 1.2, color: "#ff6348", mode: "add%", desc: "Dégâts critiques" },
  { key: "stamina", name: "Endurance", icon: "🏃", per_level: 0.2, color: "#2ed573", mode: "flat", hytaleBase: 0, desc: "Endurance" },
  { key: "flow", name: "Flow", icon: "💎", per_level: 0.5, color: "#45aaf2", mode: "flat", hytaleBase: 0, desc: "Mana" },
  { key: "discipline", name: "Discipline", icon: "📖", per_level: 0.75, color: "#fed330", mode: "add%", desc: "Bonus XP" },
];

// ═══════════════════════════════════════════
// RACES
// ═══════════════════════════════════════════
const RACES=[
{id:"human",name:"Human",desc:"Versatile et ambitieux.",attrs:{life_force:98,strength:0.85,defense:0.85,haste:1.0,precision:7.0,ferocity:35.0,stamina:7.0,flow:14.0,sorcery:0,discipline:0},innate:{life_force:1.30},passives:[{name:"XP Bonus",desc:"+50% XP",icon:"📖",color:"#fed330"},{name:"Health Regen",desc:"3% PV max/5s",icon:"💚",color:"#2ed573"},{name:"Adrenaline",desc:"56% endurance sous 20%. CD 45s",icon:"⚡",color:"#f39c12"}],color:"#f0c040",emoji:"👤",tree:[{id:"human",name:"Human",stage:"base",children:["human_explorer","human_raider"]},{id:"human_explorer",name:"Explorer",stage:"tier_1",prestige:2,children:["human_voyager"]},{id:"human_raider",name:"Raider",stage:"tier_1",prestige:2,children:["human_conqueror"]},{id:"human_voyager",name:"Voyager",stage:"tier_2",prestige:5,children:["human_emperor"]},{id:"human_conqueror",name:"Conqueror",stage:"tier_2",prestige:5,children:["human_emperor"]},{id:"human_emperor",name:"Emperor",stage:"final",prestige:10,children:[]}]},
{id:"darkin",name:"Darkin",desc:"Ascended corrompus, carnage et critiques.",attrs:{life_force:65,strength:1.11,defense:0.68,haste:1.05,precision:3.5,ferocity:52.5,stamina:8.8,flow:7.0,sorcery:0.85,discipline:0},innate:{life_force:1.05},passives:[{name:"Healing Bonus",desc:"+50% soins",icon:"💚",color:"#2ed573"},{name:"Ravenous Strike",desc:"3.5/coup + 5.3% FOR + 5.3% SOR",icon:"🩸",color:"#e74c3c"}],color:"#cc3333",emoji:"😈",tree:[{id:"darkin",name:"Darkin",stage:"base",children:["darkin_blade","darkin_bloodweaver"]},{id:"darkin_blade",name:"Blade",stage:"tier_1",prestige:2,children:["darkin_warlord"]},{id:"darkin_bloodweaver",name:"Bloodweaver",stage:"tier_1",prestige:2,children:["darkin_bloodlord"]},{id:"darkin_warlord",name:"Warlord",stage:"tier_2",prestige:5,children:["darkin_unbound"]},{id:"darkin_bloodlord",name:"Bloodlord",stage:"tier_2",prestige:5,children:["darkin_unbound"]},{id:"darkin_unbound",name:"Unbound",stage:"final",prestige:10,children:[]}]},
{id:"dragonborn",name:"Dragonborn",desc:"Sang draconique, force et résilience.",attrs:{life_force:114,strength:1.02,defense:1.02,haste:0.925,precision:3.5,ferocity:42.0,stamina:10.5,flow:10.5,sorcery:0.93,discipline:0},innate:{life_force:0.98},passives:[{name:"Swiftness",desc:"+5.3%/kill, 8x (max +42.4%)",icon:"💨",color:"#a29bfe"},{name:"Second Wind",desc:"32.5% PV sous 20%. CD 60s",icon:"💚",color:"#2ed573"}],color:"#e67e22",emoji:"🐉",tree:[{id:"dragonborn",name:"Dragonborn",stage:"base",children:["dragonborn_guardian","dragonborn_marauder"]},{id:"dragonborn_guardian",name:"Guardian",stage:"tier_1",prestige:2,children:["dragonborn_sentinel"]},{id:"dragonborn_marauder",name:"Marauder",stage:"tier_1",prestige:2,children:["dragonborn_tyrant"]},{id:"dragonborn_sentinel",name:"Sentinel",stage:"tier_2",prestige:5,children:["dragonborn_alpha"]},{id:"dragonborn_tyrant",name:"Tyrant",stage:"tier_2",prestige:5,children:["dragonborn_alpha"]},{id:"dragonborn_alpha",name:"Alpha Dragon",stage:"final",prestige:10,children:[]}]},
{id:"ascended",name:"Ascended",desc:"Guerriers divins aux rituels solaires.",attrs:{life_force:98,strength:1.02,defense:0.94,haste:0.9,precision:14.0,ferocity:7.0,stamina:10.5,flow:14.0,sorcery:0.89,discipline:0},innate:{life_force:0.81},passives:[{name:"Special Charge",desc:"+70% charge spéciale",icon:"⚡",color:"#f39c12"},{name:"Final Incantation",desc:"+140% exec sous 15%. CD 45s",icon:"💀",color:"#e74c3c"}],color:"#f1c40f",emoji:"☀️",tree:[{id:"ascended",name:"Ascended",stage:"base",children:["ascended_hero","ascended_magus"]},{id:"ascended_hero",name:"Hero",stage:"tier_1",prestige:2,children:["ascended_titan"]},{id:"ascended_magus",name:"Magus",stage:"tier_1",prestige:2,children:["ascended_archon"]},{id:"ascended_titan",name:"Titan",stage:"tier_2",prestige:5,children:["ascended_divinity"]},{id:"ascended_archon",name:"Archon",stage:"tier_2",prestige:5,children:["ascended_divinity"]},{id:"ascended_divinity",name:"Divinity",stage:"final",prestige:10,children:[]}]},
{id:"celestial",name:"Celestial",desc:"Entités cosmiques, puissance magique immense.",attrs:{life_force:59,strength:0.77,defense:0.94,haste:0.875,precision:3.5,ferocity:28.0,stamina:5.6,flow:24.5,sorcery:1.06,discipline:0},innate:{life_force:0.65},passives:[{name:"Mana Regen",desc:"1.8% mana/5s",icon:"💎",color:"#45aaf2"},{name:"Special Charge",desc:"+70% charge",icon:"⚡",color:"#f39c12"}],color:"#9b59b6",emoji:"🌟",tree:[{id:"celestial",name:"Celestial",stage:"base",children:["celestial_adept","celestial_arcanum"]},{id:"celestial_adept",name:"Adept",stage:"tier_1",prestige:2,children:["celestial_catalyst"]},{id:"celestial_arcanum",name:"Arcanum",stage:"tier_1",prestige:2,children:["celestial_overlord"]},{id:"celestial_catalyst",name:"Catalyst",stage:"tier_2",prestige:5,children:["celestial_supreme"]},{id:"celestial_overlord",name:"Overlord",stage:"tier_2",prestige:5,children:["celestial_supreme"]},{id:"celestial_supreme",name:"Supreme",stage:"final",prestige:10,children:[]}]},
{id:"golem",name:"Golem",desc:"Ultra résistants, lents mais indestructibles.",attrs:{life_force:195,strength:0.60,defense:1.11,haste:0.6,precision:0.0,ferocity:0.0,stamina:14.0,flow:3.5,sorcery:0.68,discipline:0},innate:{life_force:1.30},passives:[{name:"Retaliation",desc:"18% renvoi sur 5s. CD 25s",icon:"🔄",color:"#e17055"},{name:"Second Wind",desc:"32.5% PV sous 20%. CD 60s",icon:"💚",color:"#2ed573"}],color:"#7f8c8d",emoji:"🗿",tree:[{id:"golem",name:"Golem",stage:"base",children:["golem_sentinel","golem_crusher"]},{id:"golem_sentinel",name:"Sentinel",stage:"tier_1",prestige:2,children:["golem_colossus"]},{id:"golem_crusher",name:"Crusher",stage:"tier_1",prestige:2,children:["golem_ravager"]},{id:"golem_colossus",name:"Colossus",stage:"tier_2",prestige:5,children:["golem_prime"]},{id:"golem_ravager",name:"Ravager",stage:"tier_2",prestige:5,children:["golem_prime"]},{id:"golem_prime",name:"Prime",stage:"final",prestige:10,children:[]}]},
{id:"iceborn",name:"Iceborn",desc:"Givre éternel, endurants et résistants.",attrs:{life_force:94,strength:1.06,defense:0.94,haste:0.9,precision:10.5,ferocity:21.0,stamina:14.0,flow:7.0,sorcery:0.85,discipline:0},innate:{life_force:1.14},passives:[{name:"Health Regen",desc:"2.1% PV max/5s",icon:"💚",color:"#2ed573"},{name:"Berzerker",desc:"+14% dégâts max à 35% PV",icon:"🔥",color:"#e74c3c"}],color:"#74b9ff",emoji:"❄️",tree:[{id:"iceborn",name:"Iceborn",stage:"base",children:["iceborn_guardian","iceborn_berzerker"]},{id:"iceborn_guardian",name:"Guardian",stage:"tier_1",prestige:2,children:["iceborn_titan"]},{id:"iceborn_berzerker",name:"Berzerker",stage:"tier_1",prestige:2,children:["iceborn_ragnarok"]},{id:"iceborn_titan",name:"Titan",stage:"tier_2",prestige:5,children:["iceborn_frostlord"]},{id:"iceborn_ragnarok",name:"Ragnarok",stage:"tier_2",prestige:5,children:["iceborn_frostlord"]},{id:"iceborn_frostlord",name:"Frostlord",stage:"final",prestige:10,children:[]}]},
{id:"vastaya",name:"Vastaya",desc:"Agiles et mystérieux, connectés à la nature.",attrs:{life_force:81,strength:0.98,defense:0.83,haste:1.1,precision:10.5,ferocity:28.0,stamina:7.0,flow:21.0,sorcery:0.98,discipline:0},innate:{life_force:0.65},passives:[{name:"XP Bonus",desc:"+35% XP",icon:"📖",color:"#fed330"},{name:"Swiftness",desc:"+7%/kill, 8x (max +56%)",icon:"💨",color:"#a29bfe"}],color:"#00b894",emoji:"🦊",tree:[{id:"vastaya",name:"Vastaya",stage:"base",children:["vastaya_hunter","vastaya_mystic"]},{id:"vastaya_hunter",name:"Hunter",stage:"tier_1",prestige:2,children:["vastaya_beastlord"]},{id:"vastaya_mystic",name:"Mystic",stage:"tier_1",prestige:2,children:["vastaya_spiritbinder"]},{id:"vastaya_beastlord",name:"Beastlord",stage:"tier_2",prestige:5,children:["vastaya_apex"]},{id:"vastaya_spiritbinder",name:"Spiritbinder",stage:"tier_2",prestige:5,children:["vastaya_apex"]},{id:"vastaya_apex",name:"Apex",stage:"final",prestige:10,children:[]}]},
{id:"voidborn",name:"Voidborn",desc:"Corrompus par le Vide, adaptation rapide.",attrs:{life_force:98,strength:0.98,defense:0.85,haste:0.9,precision:7.0,ferocity:35.0,stamina:8.4,flow:28.0,sorcery:0.98,discipline:0},innate:{life_force:1.14},passives:[{name:"Mana Regen",desc:"1.4% mana/5s",icon:"💎",color:"#45aaf2"},{name:"Special Charge",desc:"+35% charge",icon:"⚡",color:"#f39c12"},{name:"Retaliation",desc:"18% renvoi 4s. CD 25s",icon:"🔄",color:"#e17055"}],color:"#6c5ce7",emoji:"🌀",tree:[{id:"voidborn",name:"Voidborn",stage:"base",children:["voidborn_protector","voidborn_prowler"]},{id:"voidborn_protector",name:"Protector",stage:"tier_1",prestige:2,children:["voidborn_juggernaut"]},{id:"voidborn_prowler",name:"Prowler",stage:"tier_1",prestige:2,children:["voidborn_reaver"]},{id:"voidborn_juggernaut",name:"Juggernaut",stage:"tier_2",prestige:5,children:["voidborn_oblivion"]},{id:"voidborn_reaver",name:"Reaver",stage:"tier_2",prestige:5,children:["voidborn_oblivion"]},{id:"voidborn_oblivion",name:"Oblivion",stage:"final",prestige:10,children:[]}]},
{id:"watcher",name:"Watcher",desc:"Entités d'outre-réalité, puissance incompréhensible.",attrs:{life_force:78,strength:0.68,defense:0.77,haste:0.875,precision:10.5,ferocity:21.0,stamina:4.2,flow:35.0,sorcery:1.02,discipline:0},innate:{life_force:0.49},passives:[{name:"Mana Regen",desc:"2.1% mana/5s",icon:"💎",color:"#45aaf2"},{name:"XP Bonus",desc:"+28% XP",icon:"📖",color:"#fed330"}],color:"#00cec9",emoji:"👁️",tree:[{id:"watcher",name:"Watcher",stage:"base",children:["watcher_seer","watcher_mystic"]},{id:"watcher_seer",name:"Seer",stage:"tier_1",prestige:2,children:["watcher_oracle"]},{id:"watcher_mystic",name:"Mystic",stage:"tier_1",prestige:2,children:["watcher_eldritch"]},{id:"watcher_oracle",name:"Oracle",stage:"tier_2",prestige:5,children:["watcher_arbiter"]},{id:"watcher_eldritch",name:"Eldritch",stage:"tier_2",prestige:5,children:["watcher_arbiter"]},{id:"watcher_arbiter",name:"Arbiter",stage:"final",prestige:10,children:[]}]},
{id:"wraith",name:"Wraith",desc:"Esprits maudits, frappes létales et évasion.",attrs:{life_force:49,strength:1.02,defense:0.72,haste:1.1,precision:7.0,ferocity:52.5,stamina:7.0,flow:14.0,sorcery:1.02,discipline:0},innate:{life_force:0.49},passives:[{name:"Swiftness",desc:"+8.8%/kill, 8x (max +70%)",icon:"💨",color:"#a29bfe"}],color:"#636e72",emoji:"👻",tree:[{id:"wraith",name:"Wraith",stage:"base",children:["wraith_whisper","wraith_fang"]},{id:"wraith_whisper",name:"Whisper",stage:"tier_1",prestige:2,children:["wraith_spectral"]},{id:"wraith_fang",name:"Fang",stage:"tier_1",prestige:2,children:["wraith_reaver"]},{id:"wraith_spectral",name:"Spectral",stage:"tier_2",prestige:5,children:["wraith_phantom_king"]},{id:"wraith_reaver",name:"Reaver",stage:"tier_2",prestige:5,children:["wraith_phantom_king"]},{id:"wraith_phantom_king",name:"Phantom King",stage:"final",prestige:10,children:[]}]},
{id:"yordle",name:"Yordle",desc:"Agilité, ruse et dégâts explosifs.",attrs:{life_force:52,strength:0.81,defense:0.77,haste:1.075,precision:17.5,ferocity:7.0,stamina:12.3,flow:31.5,sorcery:0.94,discipline:0},innate:{life_force:0.78},passives:[{name:"Swiftness",desc:"+18%/kill, 5x (max +90%)",icon:"💨",color:"#a29bfe"},{name:"Special Charge",desc:"+140% charge",icon:"⚡",color:"#f39c12"}],color:"#fdcb6e",emoji:"🧙",tree:[{id:"yordle",name:"Yordle",stage:"base",children:["yordle_sprout","yordle_trickster"]},{id:"yordle_sprout",name:"Sprout",stage:"tier_1",prestige:2,children:["yordle_enchanter"]},{id:"yordle_trickster",name:"Trickster",stage:"tier_1",prestige:2,children:["yordle_menace"]},{id:"yordle_enchanter",name:"Enchanter",stage:"tier_2",prestige:5,children:["yordle_master"]},{id:"yordle_menace",name:"Menace",stage:"tier_2",prestige:5,children:["yordle_master"]},{id:"yordle_master",name:"Master",stage:"final",prestige:10,children:[]}]}
];

// ═══════════════════════════════════════════
// CLASSES
// ═══════════════════════════════════════════
const CLASSES=[
{id:"mage",name:"Mage",roles:["Mage"],dmg:"Magic",range:"distance",color:"#a55eea",emoji:"🔮",weapons:["Bâton","Dague"],defCap:40,innateByTier:[{flow:1.05,sorcery:0.84},{flow:1.275,sorcery:1.02},{flow:1.5,sorcery:1.2},{flow:1.725,sorcery:1.38},{flow:1.95,sorcery:1.56}],passives:[{name:"Mana Regen",desc:"2.8% mana/5s",icon:"💎",color:"#45aaf2"},{name:"Arcane Wisdom",desc:"+20% magic dmg. CD 5s",icon:"✨",color:"#a55eea"},{name:"Health Regen",desc:"1.4% PV/5s",icon:"💚",color:"#2ed573"}]},
{id:"arcanist",name:"Arcanist",roles:["Mage"],dmg:"Magic",range:"distance",color:"#8854d0",emoji:"📘",weapons:["Bâton","Dague"],defCap:40,innateByTier:[{flow:0.28,sorcery:0.98},{flow:0.34,sorcery:1.19},{flow:0.4,sorcery:1.4},{flow:0.46,sorcery:1.61},{flow:0.52,sorcery:1.82}],passives:[{name:"Mana Regen",desc:"2.1% mana/5s",icon:"💎",color:"#45aaf2"},{name:"Final Incantation",desc:"+100% exec sous 15%. CD 45s",icon:"💀",color:"#e74c3c"}]},
{id:"assassin",name:"Assassin",roles:["Assassin","Diver"],dmg:"Physical",range:"mêlée",color:"#636e72",emoji:"🗡️",weapons:["Dague","Épée","Arc"],defCap:45,innateByTier:[{haste:0.28,ferocity:0.84},{haste:0.34,ferocity:1.02},{haste:0.4,ferocity:1.2},{haste:0.46,ferocity:1.38},{haste:0.52,ferocity:1.56}],passives:[{name:"Focused Strike",desc:"+10% ouverture. 20 true dmg + 10%. +50% hâte. CD 20s, reset kill",icon:"🎯",color:"#e74c3c"}]},
{id:"battlemage",name:"BattleMage",roles:["BattleMage"],dmg:"Magic",range:"hybride",color:"#e17055",emoji:"⚡",weapons:["Bâton","Épée","Masse"],defCap:65,innateByTier:[{sorcery:0.945,life_force:1.575},{sorcery:1.147,life_force:1.912},{sorcery:1.35,life_force:2.25},{sorcery:1.552,life_force:2.587},{sorcery:1.755,life_force:2.925}],passiveScaling:[{source:"life_force",target:"sorcery",ratio:0.04,label:"Arcane Dominance"}],passives:[{name:"Health Regen",desc:"2.1% PV/5s",icon:"💚",color:"#2ed573"},{name:"Berzerker",desc:"+24.5% dmg max à 40% PV",icon:"🔥",color:"#e74c3c"},{name:"Arcane Dominance",desc:"SOR = 4% PV total (flat). Slow -20% 2s",icon:"✨",color:"#a55eea"}]},
{id:"brawler",name:"Brawler",roles:["Skirmisher","Juggernaut"],dmg:"Physical",range:"mêlée",color:"#d63031",emoji:"👊",weapons:["Gantelet","Masse"],defCap:65,innateByTier:[{life_force:1.75,strength:0.84},{life_force:2.125,strength:1.02},{life_force:2.5,strength:1.2},{life_force:2.875,strength:1.38},{life_force:3.25,strength:1.56}],passives:[{name:"Retaliation",desc:"+40% renvoi 5s. CD 20s",icon:"🔄",color:"#e17055"},{name:"Berzerker",desc:"+30% dmg max à 40% PV",icon:"🔥",color:"#e74c3c"}]},
{id:"duelist",name:"Duelist",roles:["Skirmisher"],dmg:"Physical",range:"mêlée",color:"#fdcb6e",emoji:"⚔️",weapons:["Épée","Lance","Dague"],defCap:65,innateByTier:[{haste:0.28,strength:0.91,life_force:1.05},{haste:0.34,strength:1.105,life_force:1.275},{haste:0.4,strength:1.3,life_force:1.5},{haste:0.46,strength:1.495,life_force:1.725},{haste:0.52,strength:1.69,life_force:1.95}],passives:[{name:"Blade Dance",desc:"+10% AS/coup, 5x. +5% dmg/stack",icon:"💃",color:"#fdcb6e"}]},
{id:"healer",name:"Healer",roles:["Support"],dmg:"Magic",range:"distance",color:"#55efc4",emoji:"💚",weapons:["Bâton"],defCap:50,innateByTier:[{flow:1.75,stamina:0.7},{flow:2.125,stamina:0.85},{flow:2.5,stamina:1},{flow:2.875,stamina:1.15},{flow:3.25,stamina:1.3}],passives:[{name:"Healing Touch",desc:"50% soin allié. Scale END. R10",icon:"🤲",color:"#55efc4"},{name:"Healing Aura",desc:"AoE 25+10%Mana+20%END. R5",icon:"🌿",color:"#2ed573"}]},
{id:"juggernaut",name:"Juggernaut",roles:["Juggernaut"],dmg:"Physical",range:"mêlée",color:"#b33939",emoji:"🪓",weapons:["Hache","Épée","Masse"],defCap:80,innateByTier:[{life_force:2.1,strength:1.4},{life_force:2.55,strength:1.7},{life_force:3,strength:2},{life_force:3.45,strength:2.3},{life_force:3.9,strength:2.6}],passiveScaling:[{source:"life_force",target:"strength",ratio:0.04,label:"Primal Dominance"}],passives:[{name:"Primal Dominance",desc:"FOR = 4% PV total (flat). Slow -20% 2s",icon:"👑",color:"#ff9f43"},{name:"Health Regen",desc:"2.8% PV/5s",icon:"💚",color:"#2ed573"}]},
{id:"marksman",name:"Marksman",roles:["Marksman"],dmg:"Physical",range:"distance",color:"#26de81",emoji:"🏹",weapons:["Arc","Arbalète"],defCap:40,innateByTier:[{precision:0.245,ferocity:0.84},{precision:0.297,ferocity:1.02},{precision:0.35,ferocity:1.2},{precision:0.402,ferocity:1.38},{precision:0.455,ferocity:1.56}],passives:[{name:"True Bolts",desc:"6% PV max cible true. CD 4s",icon:"🎯",color:"#e74c3c"},{name:"Swiftness",desc:"+5.2%/kill, 8x",icon:"💨",color:"#a29bfe"},{name:"Special Charge",desc:"+17.5%",icon:"⚡",color:"#f39c12"}]},
{id:"necromancer",name:"Necromancer",roles:["Battlemage"],dmg:"Magic",range:"hybride",color:"#2d3436",emoji:"💀",weapons:["Bâton","Dague"],defCap:65,innateByTier:[{flow:1.05,sorcery:0.84},{flow:1.275,sorcery:1.02},{flow:1.5,sorcery:1.2},{flow:1.725,sorcery:1.38},{flow:1.95,sorcery:1.56}],passives:[{name:"Army of the Dead",desc:"Squelettes/toucher. +1/200 mana",icon:"💀",color:"#636e72"},{name:"Health Regen",desc:"1.4% PV/5s",icon:"💚",color:"#2ed573"}]},
{id:"oracle",name:"Oracle",roles:["Support"],dmg:"Magic",range:"distance",color:"#74b9ff",emoji:"🔵",weapons:["Bâton"],defCap:50,innateByTier:[{flow:1.75,stamina:0.7},{flow:2.125,stamina:0.85},{flow:2.5,stamina:1},{flow:2.875,stamina:1.15},{flow:3.25,stamina:1.3}],passives:[{name:"Shielding Aura",desc:"Bouclier 45+20%END. CD 25s",icon:"🛡️",color:"#54a0ff"},{name:"Buffing Aura",desc:"Buff dmg alliés +100% max",icon:"⬆️",color:"#f39c12"}]},
{id:"slayer",name:"Slayer",roles:["Skirmisher"],dmg:"Physical",range:"mêlée",color:"#e84393",emoji:"💥",weapons:["Épée","Hache","Lance"],defCap:65,innateByTier:[{strength:0.875,life_force:1.575,defense:0.105},{strength:1.062,life_force:1.912,defense:0.128},{strength:1.25,life_force:2.25,defense:0.15},{strength:1.438,life_force:2.587,defense:0.172},{strength:1.625,life_force:2.925,defense:0.195}],passives:[{name:"True Edge",desc:"+7 true flat + 10% pré-def true",icon:"🗡️",color:"#e74c3c"}]},
{id:"vanguard",name:"Vanguard",roles:["Vanguard"],dmg:"Hybrid",range:"mêlée",color:"#0984e3",emoji:"🏰",weapons:["Masse","Hache","Épée"],defCap:80,innateByTier:[{defense:0.245,life_force:1.575},{defense:0.297,life_force:1.912},{defense:0.35,life_force:2.25},{defense:0.402,life_force:2.587},{defense:0.455,life_force:2.925}],passives:[{name:"Second Wind",desc:"35% PV sous 35%. CD 45s",icon:"💚",color:"#2ed573"},{name:"Retaliation",desc:"17.5% renvoi 5s. CD 25s",icon:"🔄",color:"#e17055"},{name:"Absorb",desc:"-35% un coup. CD 25s",icon:"🛡️",color:"#54a0ff"}]},
{id:"adventurer",name:"Adventurer",roles:["Skirmisher"],dmg:"Hybrid",range:"hybride",color:"#00b894",emoji:"🧭",weapons:["Épée","Arc","Lance"],defCap:65,innateByTier:[{strength:0.35,stamina:0.49},{strength:0.425,stamina:0.595},{strength:0.5,stamina:0.7},{strength:0.575,stamina:0.805},{strength:0.65,stamina:0.91}],passives:[{name:"XP Bonus",desc:"+35% XP",icon:"📖",color:"#fed330"},{name:"Special Charge",desc:"+35%",icon:"⚡",color:"#f39c12"},{name:"Adrenaline",desc:"56% END sous 20%. CD 30s",icon:"⚡",color:"#f39c12"}]}
];

const CLASS_TIERS=["Base","Elite","Master","Legendary","Exalted"];
const CLASS_TIER_PRESTIGE=[0,2,4,6,8];
const CLASS_TIER_COLORS=["#95a5a6","#3498db","#e67e22","#e74c3c","#9b59b6"];
// tierMult removed: using exact innateByTier values from yml files

const AUGMENTS=[
{id:"common",name:"Common",tier:"COMMON",desc:"Boosts aléatoires (roll variable par stat)"},
{id:"absolute_focus",name:"Absolute Focus",tier:"ELITE",desc:"Garantit un critique périodiquement."},
{id:"arcane_instability",name:"Arcane Instability",tier:"ELITE",desc:"SOR+ si Mana haut, pénalité si bas."},
{id:"arcane_mastery",name:"Arcane Mastery",tier:"ELITE",desc:"+10% de la Sorcellerie en Flow.",scaling:[{source:"sorcery",target:"flow",ratio:0.1}]},
{id:"bailout",name:"Bailout",tier:"ELITE",desc:"Triche la mort sauf kill."},
{id:"blood_echo",name:"Blood Echo",tier:"ELITE",desc:"Soins → dégâts + lifesteal."},
{id:"blood_frenzy",name:"Blood Frenzy",tier:"ELITE",desc:"+5% Lifesteal, +25% Hâte.",bonuses:{haste:25}},
{id:"burn",name:"Burn",tier:"ELITE",desc:"DoT AoE + 100 Vitalité.",bonuses:{life_force:100}},
{id:"cripple",name:"Cripple",tier:"ELITE",desc:"Stun 2s + 100 Vitalité.",bonuses:{life_force:100}},
{id:"critical_guard",name:"Critical Guard",tier:"ELITE",desc:"Précision → réduction dégâts."},
{id:"cutdown",name:"Cutdown",tier:"ELITE",desc:"+ dégâts cibles haute vie."},
{id:"death_bomb",name:"Death Bomb",tier:"ELITE",desc:"Explosion à la mort."},
{id:"drain",name:"Drain",tier:"ELITE",desc:"Bonus dmg % PV cible."},
{id:"endure_pain",name:"Endure Pain",tier:"ELITE",desc:"Dégâts différés en saignement."},
{id:"executioner",name:"Executioner",tier:"ELITE",desc:"Exécute cibles basse vie."},
{id:"first_strike",name:"First Strike",tier:"ELITE",desc:"1er coup = burst puissant."},
{id:"fleet_footwork",name:"Fleet Footwork",tier:"ELITE",desc:"Frappe soin + vitesse."},
{id:"fortress",name:"Fortress",tier:"ELITE",desc:"Bouclier au seuil de mort. Buff temporaire: +15% DEF, +50% FOR/SOR."},
{id:"four_leaf_clover",name:"Four Leaf Clover",tier:"ELITE",desc:"Luck (double-drops + XP)."},
{id:"frozen_domain",name:"Frozen Domain",tier:"ELITE",desc:"Aura gel + 100 Vitalité.",bonuses:{life_force:100}},
{id:"glass_cannon",name:"Glass Cannon",tier:"ELITE",desc:"+50% Hâte, +50% Dmg, -20% PV max.",bonuses:{haste:50}},
{id:"goliath",name:"Goliath",tier:"ELITE",desc:"+20% PV max, +7.5% FOR, +7.5% SOR.",bonuses:{strength:7.5,sorcery:7.5}},
{id:"magic_blade",name:"Magic Blade",tier:"ELITE",desc:"SOR → dégâts d'arme."},
{id:"magic_missle",name:"Magic Missile",tier:"ELITE",desc:"Missile magique /2s."},
{id:"mana_infusion",name:"Mana Infusion",tier:"ELITE",desc:"+20% du Flow en Sorcellerie.",scaling:[{source:"flow",target:"sorcery",ratio:0.2}]},
{id:"overdrive",name:"Overdrive",tier:"ELITE",desc:"On hit: +4% Hâte/stack, +5% Crit Dmg/stack (8 max, temporaire)."},
{id:"overheal",name:"Overheal",tier:"ELITE",desc:"Soins excédentaires → bouclier."},
{id:"phantom_hits",name:"Phantom Hits",tier:"ELITE",desc:"Frappes fantômes (FOR+SOR)."},
{id:"predator",name:"Predator",tier:"ELITE",desc:"On kill: +12% Hâte/stack, +6% FOR/stack (4 max). -10% DEF avant max stacks."},
{id:"protective_bubble",name:"Protective Bubble",tier:"ELITE",desc:"Annule 1 attaque."},
{id:"rebirth",name:"Rebirth",tier:"ELITE",desc:"Triche mort + gros soin."},
{id:"soul_reaver",name:"Soul Reaver",tier:"ELITE",desc:"Kills soignent % PV cible."},
{id:"supersonic",name:"Supersonic",tier:"ELITE",desc:"+50% Hâte, -10% Force.",bonuses:{haste:50,strength:-10}},
{id:"time_master",name:"Time Master",tier:"ELITE",desc:"Kills réduisent tous CD."},
{id:"titans_might",name:"Titan's Might",tier:"ELITE",desc:"+15% de la Vitalité en Force. -15% Hâte.",bonuses:{haste:-15},scaling:[{source:"life_force",target:"strength",ratio:0.15}]},
{id:"titans_wisdom",name:"Titan's Wisdom",tier:"ELITE",desc:"+15% de la Vitalité en Sorcellerie. -15% Hâte.",bonuses:{haste:-15},scaling:[{source:"life_force",target:"sorcery",ratio:0.15}]},
{id:"vampiric_strike",name:"Vampiric Strike",tier:"ELITE",desc:"+15% Précision, +25% Lifesteal on crit.",bonuses:{precision:15}},
{id:"vampirism",name:"Vampirism",tier:"ELITE",desc:"+12.5% Life Steal."},
{id:"wither",name:"Wither",tier:"ELITE",desc:"Slow + % dmg."},
{id:"arcane_comet",name:"Arcane Comet",tier:"LEGENDARY",desc:"/8s: +dmg SOR."},
{id:"brute_force",name:"Brute Force",tier:"LEGENDARY",desc:"0 crit → puissance brute."},
{id:"conqueror",name:"Conqueror",tier:"LEGENDARY",desc:"Momentum combat + soins + +5% dmg/stack."},
{id:"raging_momentum",name:"Raging Momentum",tier:"LEGENDARY",desc:"Stack +2.5% FOR/SOR, ×2 au cap."},
{id:"snipers_reach",name:"Sniper's Reach",tier:"LEGENDARY",desc:"Dmg scale avec distance."},
{id:"tank_engine",name:"Tank Engine",tier:"LEGENDARY",desc:"Combat → +PV max massifs."},
{id:"arcane_cataclysm",name:"Arcane Cataclysm",tier:"MYTHIC",desc:"5ème coup = explosion SOR."},
{id:"blood_surge",name:"Blood Surge",tier:"MYTHIC",desc:"PV bas → +Life Steal."},
{id:"bloodthirster",name:"Bloodthirster",tier:"MYTHIC",desc:"Fort si sain, sustain si blessé."},
{id:"giant_slayer",name:"Giant Slayer",tier:"MYTHIC",desc:"+dmg si cible + PV."},
{id:"nesting_doll",name:"Nesting Doll",tier:"MYTHIC",desc:"Multi-rez, chacune + faible."},
{id:"phase_rush",name:"Phase Rush",tier:"MYTHIC",desc:"On hit rapide: +50% Hâte temporaire → puissance."},
{id:"raid_boss",name:"Raid Boss",tier:"MYTHIC",desc:"+50% PV max, +15% Dmg."},
{id:"reckoning",name:"Reckoning",tier:"MYTHIC",desc:"+dmg au prix de PV."},
{id:"undying_rage",name:"Undying Rage",tier:"MYTHIC",desc:"Unkillable + +15% Précision + Crit Dmg.",bonuses:{precision:15}}
];

const TIER_COLORS={COMMON:"#95a5a6",ELITE:"#3498db",LEGENDARY:"#e74c3c",MYTHIC:"#9b59b6"};
const TIER_ORDER=["COMMON","ELITE","LEGENDARY","MYTHIC"];
const SC={base:"#95a5a6",tier_1:"#3498db",tier_2:"#e67e22",final:"#e74c3c"};
const SL={base:"Base",tier_1:"Tier 1",tier_2:"Tier 2",final:"Final"};
const TABS=[{id:"race",label:"Race",emoji:"🧬"},{id:"class",label:"Classe",emoji:"⚔️"},{id:"stats",label:"Stats",emoji:"📊"},{id:"augments",label:"Augments",emoji:"💠"},{id:"summary",label:"Résumé",emoji:"📋"},{id:"builds",label:"Mes Builds",emoji:"💾"},{id:"compare",label:"Comparer",emoji:"⚖️"}];

// ═══════════════════════════════════════════
// STAT COMPUTATION — CORRECTED FORMULAS
// ═══════════════════════════════════════════
function computeInnates(race, c1, t1, c2, t2, level) {
  const inn = {};
  const c1inn = c1?.innateByTier?.[t1] || {};
  const c2inn = c2?.innateByTier?.[t2] || {};
  STATS.forEach(s => {
    const rv = race?.innate?.[s.key] || 0;
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
function computeClassPassiveScaling(c1, c2, baseStats) {
  const post = {};
  if (c1?.passiveScaling) {
    c1.passiveScaling.forEach(sc => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio;
    });
  }
  if (c2?.passiveScaling) {
    c2.passiveScaling.forEach(sc => {
      const sourceVal = baseStats[sc.source] || 0;
      post[sc.target] = (post[sc.target] || 0) + sourceVal * sc.ratio * 0.5; // Secondary class = 50%
    });
  }
  return post;
}

function fmt(val, mode) {
  if (mode === "mult" || mode === "add%" || mode === "haste") return val === 0 ? "0%" : (val > 0 ? "+" : "") + val.toFixed(1) + "%";
  return Math.round(val).toString();
}

// ═══════════════════════════════════════════
// ENCODE/DECODE
// ═══════════════════════════════════════════
function encodeBuild(s) { return btoa(JSON.stringify({ r:s.selectedRace?.id||"",c1:s.primaryClass?.id||"",c2:s.secondaryClass?.id||"",t1:s.primaryTier,t2:s.secondaryTier,l:s.level,p:s.prestige,sp:s.skillPoints,a:s.selectedAugments.map(a=>a.id),ab:s.augBonus})); }
function decodeBuild(str) { try { const d=JSON.parse(atob(str)); return { selectedRace:RACES.find(r=>r.id===d.r)||null,primaryClass:CLASSES.find(c=>c.id===d.c1)||null,secondaryClass:CLASSES.find(c=>c.id===d.c2)||null,primaryTier:d.t1||0,secondaryTier:d.t2||0,level:d.l||1,prestige:d.p||0,skillPoints:d.sp||{},selectedAugments:(d.a||[]).map(id=>AUGMENTS.find(a=>a.id===id)).filter(Boolean),augBonus:d.ab||{} }; } catch { return null; } }

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════
function PassiveList({passives,compact}){return(<div style={{display:"flex",flexDirection:"column",gap:compact?3:5}}>{passives.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,padding:compact?"4px 8px":"6px 10px",background:p.color+"0d",borderRadius:8,border:"1px solid "+p.color+"20"}}><span style={{fontSize:compact?13:15,flexShrink:0}}>{p.icon}</span><div><span style={{fontSize:compact?11:12,fontWeight:700,color:p.color}}>{p.name}</span><span style={{fontSize:compact?10:11,color:"#888",marginLeft:6}}>{p.desc}</span></div></div>))}</div>)}

function AscTree({race}){const stages=["base","tier_1","tier_2","final"];const by={};stages.forEach(s=>{by[s]=race.tree.filter(n=>n.stage===s)});return(<div style={{display:"flex",gap:6,alignItems:"flex-start",overflowX:"auto",padding:"8px 0"}}>{stages.map((stage,si)=>(<div key={stage} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",minWidth:82}}><div style={{fontSize:9,color:SC[stage],fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{SL[stage]}</div>{by[stage].map(n=>(<div key={n.id} style={{background:SC[stage]+"12",border:"2px solid "+SC[stage]+"44",borderRadius:10,padding:"4px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:SC[stage],minWidth:72}}>{n.name}{n.prestige>0&&<div style={{fontSize:9,opacity:0.6}}>P{n.prestige}</div>}</div>))}</div>{si<3&&<div style={{color:"#333",fontSize:14,margin:"0 2px",marginTop:14}}>›</div>}</div>))}</div>)}

const bs=(c,sm)=>({minWidth:sm?30:36,height:sm?26:30,borderRadius:7,border:"1px solid "+c+"33",background:c+"10",color:c,fontWeight:700,fontSize:sm?11:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0});

// ═══════════════════════════════════════════
// TAB: RACE
// ═══════════════════════════════════════════
function RaceTab({selectedRace:sr,setSelectedRace:set}){return(<div><h3 style={{margin:"0 0 12px",fontSize:16,color:"#fff",fontFamily:"var(--fd)"}}>🧬 Choisis ta Race</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10}}>{RACES.map(r=>{const sel=sr?.id===r.id;return(<div key={r.id} onClick={()=>set(r)} style={{background:sel?"linear-gradient(135deg,"+r.color+"10,"+r.color+"06)":"var(--card)",border:"2px solid "+(sel?r.color:"var(--brd)"),borderRadius:14,padding:14,cursor:"pointer",transition:"all 0.2s",boxShadow:sel?"0 4px 20px "+r.color+"18":"none"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:28}}>{r.emoji}</span><div><div style={{fontSize:15,fontWeight:800,color:r.color}}>{r.name}</div><div style={{fontSize:10,color:"#666"}}>{r.desc}</div></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:2,marginBottom:8}}>{STATS.map(s=>{const v=r.attrs[s.key]||0;const label=s.mode==="mult"?(v===0||v===undefined?"—":`×${v}`):s.mode==="haste"?(v===0||v===undefined?"—":`${((v-1)*100)>=0?"+":""}${((v-1)*100).toFixed(0)}%`):s.mode==="add%"?`+${v}%`:`${v}`;return(<div key={s.key} style={{textAlign:"center",fontSize:9,padding:"2px 0"}}><div>{s.icon}</div><div style={{color:s.mode==="mult"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.mode==="haste"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.color,fontWeight:700}}>{label}</div></div>)})}</div><PassiveList passives={r.passives} compact/></div>)})}</div>{sr&&(<div style={{marginTop:14,background:"var(--card)",borderRadius:14,padding:16,border:"2px solid "+sr.color+"30"}}><div style={{fontSize:15,fontWeight:800,color:sr.color,fontFamily:"var(--fd)"}}>{sr.emoji} {sr.name} — Arbre d'Ascension</div><AscTree race={sr}/><div style={{marginTop:8,fontSize:10,color:"#777"}}>Innate/niv : {Object.entries(sr.innate).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v).join(" • ")}</div><div style={{marginTop:4,fontSize:10,color:"#888"}}>Multiplicateurs : {STATS.filter(s=>(s.mode==="mult"||s.mode==="haste")&&sr.attrs[s.key]&&sr.attrs[s.key]!==0).map(s=>s.mode==="haste"?`${s.icon} ${s.name} ${sr.attrs[s.key]} (${((sr.attrs[s.key]-1)*100)>=0?"+":""}${((sr.attrs[s.key]-1)*100).toFixed(0)}%)`:`${s.icon} ${s.name} ×${sr.attrs[s.key]}`).join(" • ")}</div></div>)}</div>)}

// ═══════════════════════════════════════════
// TAB: CLASS
// ═══════════════════════════════════════════
function ClassTab({primaryClass:pc,setPrimaryClass:spc,secondaryClass:sc,setSecondaryClass:ssc,primaryTier:pt,setPrimaryTier:spt,secondaryTier:st,setSecondaryTier:sst}){const[mode,setMode]=useState("primary");const cc=mode==="primary"?pc:sc;const setC=mode==="primary"?spc:ssc;const ct=mode==="primary"?pt:st;const setT=mode==="primary"?spt:sst;return(<div><div style={{display:"flex",gap:8,marginBottom:14}}>{["primary","secondary"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{padding:"8px 18px",borderRadius:10,border:"2px solid "+(mode===m?"#f39c12":"var(--brd)"),background:mode===m?"#f39c1212":"var(--card)",color:mode===m?"#f39c12":"#555",fontWeight:700,fontSize:13,cursor:"pointer"}}>{m==="primary"?"⚔️ Primaire":"🛡️ Secondaire"}</button>))}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:10}}>{CLASSES.map(cls=>{const sel=cc?.id===cls.id;const oth=mode==="primary"?sc?.id===cls.id:pc?.id===cls.id;return(<div key={cls.id} onClick={()=>{if(!oth){setC(cls);setT(0)}}} style={{background:sel?"linear-gradient(135deg,"+cls.color+"10,"+cls.color+"05)":oth?"#0a0a14":"var(--card)",border:"2px solid "+(sel?cls.color:oth?"#181830":"var(--brd)"),borderRadius:12,padding:12,cursor:oth?"not-allowed":"pointer",opacity:oth?0.3:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:24}}>{cls.emoji}</span><div><div style={{fontSize:14,fontWeight:800,color:cls.color}}>{cls.name}</div><div style={{fontSize:10,color:"#666"}}>{cls.dmg} • {cls.range} • Cap DEF: {cls.defCap}%</div></div></div><div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>{cls.weapons.map(w=><span key={w} style={{fontSize:9,background:cls.color+"15",color:cls.color,padding:"2px 6px",borderRadius:5}}>{w}</span>)}</div><PassiveList passives={cls.passives} compact/></div>)})}</div>{cc&&(<div style={{marginTop:14,background:"var(--card)",borderRadius:14,padding:14,border:"2px solid "+cc.color+"30"}}><div style={{fontSize:14,fontWeight:800,color:cc.color,marginBottom:10}}>{cc.emoji} {cc.name} — Tier</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CLASS_TIERS.map((tier,i)=>(<button key={tier} onClick={()=>setT(i)} style={{padding:"8px 16px",borderRadius:10,border:"2px solid "+(ct===i?CLASS_TIER_COLORS[i]:"var(--brd)"),background:ct===i?CLASS_TIER_COLORS[i]+"15":"var(--bg)",color:ct===i?CLASS_TIER_COLORS[i]:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>{tier} {CLASS_TIER_PRESTIGE[i]>0&&<span style={{opacity:0.5}}>(P{CLASS_TIER_PRESTIGE[i]})</span>}</button>))}</div><div style={{marginTop:10,fontSize:11,color:"#777"}}>Innate : {Object.entries(cc.innateByTier[ct]).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v+"/niv").join("  •  ")}{mode==="secondary"&&<span style={{color:"#f39c12",marginLeft:8}}>× 0.5 (secondaire)</span>}</div></div>)}</div>)}

// ═══════════════════════════════════════════
// TAB: STATS
// ═══════════════════════════════════════════
function StatsTab({level,setLevel,prestige,setPrestige,skillPoints:sp,setSkillPoints:setSP,totalSP,usedSP,selectedRace:race,primaryClass:c1,primaryTier:t1,secondaryClass:c2,secondaryTier:t2,augBonus,postBonus}){const rem=totalSP-usedSP;const inn=computeInnates(race,c1,t1,c2,t2,level);const add=(k,a)=>{setSP(p=>{const c=p[k]||0;const nv=Math.max(0,c+a);if(nv-c>rem&&a>0)return p;return{...p,[k]:nv}})};return(<div><div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Niveau</label><input type="range" min={1} max={200} value={level} onChange={e=>setLevel(+e.target.value)} style={{width:120,accentColor:"#f39c12"}}/><span style={{fontSize:16,fontWeight:800,color:"#f39c12",minWidth:32}}>{level}</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Prestige</label><input type="range" min={0} max={20} value={prestige} onChange={e=>setPrestige(+e.target.value)} style={{width:80,accentColor:"#e74c3c"}}/><span style={{fontSize:16,fontWeight:800,color:"#e74c3c",minWidth:20}}>{prestige}</span></div><div style={{background:rem>0?"#2ed57312":"#ff6b6b12",padding:"6px 14px",borderRadius:10,border:"1px solid "+(rem>0?"#2ed573":"#ff6b6b")+"30",fontSize:13,fontWeight:700,color:rem>0?"#2ed573":"#ff6b6b"}}>{rem} / {totalSP} SP</div><button onClick={()=>setSP({})} style={{...bs("#ff6b6b"),padding:"6px 14px",minWidth:"auto",fontSize:11}}>Reset</button></div>{(race||c1||c2)&&STATS.some(s=>inn[s.key].perLevel>0)&&(<div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:14,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:8}}>📈 Innate Bonuses</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:6}}>{STATS.filter(s=>inn[s.key].perLevel>0).map(s=>{const i=inn[s.key];return(<div key={s.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:s.color+"08",borderRadius:8,border:"1px solid "+s.color+"18"}}><span style={{fontSize:12,color:"#ccc"}}>{s.icon} {s.name}</span><span style={{fontSize:12,fontWeight:700,color:s.color}}>+{i.perLevel.toFixed(2)}/niv <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>)}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:8}}>{STATS.map(stat=>{const pts=sp[stat.key]||0;const comp=computeStat(stat,race,inn,sp,augBonus,postBonus);return(<div key={stat.key} style={{background:"var(--card)",borderRadius:12,padding:12,border:"1px solid "+stat.color+"18"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18}}>{stat.icon}</span><div><div style={{fontSize:13,fontWeight:700,color:stat.color}}>{stat.name}</div><div style={{fontSize:9,color:"#555"}}>Niv. {pts} • {stat.per_level}{stat.mode!=="flat"?"%":""}/pt{stat.mode==="mult"?" (×race)":stat.mode==="haste"?" (×race + offset)":""}</div></div></div><div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:stat.color}}>{fmt(comp.total,stat.mode)}</div></div></div><div style={{display:"flex",gap:4,fontSize:9,color:"#555",marginBottom:6,flexWrap:"wrap"}}>{stat.mode==="mult"&&race&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {(race.attrs[stat.key]===0||race.attrs[stat.key]===undefined)?"×1.0 (aucun)":`×${race.attrs[stat.key]}`}</span>}{stat.mode==="haste"&&race&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {race.attrs[stat.key]||1} ({((race.attrs[stat.key]||1)-1)*100>=0?"+":""}{(((race.attrs[stat.key]||1)-1)*100).toFixed(0)}% base, ×gains)</span>}{stat.mode!=="mult"&&stat.mode!=="haste"&&comp.base!==0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: +{comp.base}</span>}{comp.fromInn>0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Innate: +{comp.fromInn.toFixed(1)}</span>}{comp.fromSP>0&&<span style={{background:stat.color+"15",padding:"1px 5px",borderRadius:4,color:stat.color}}>SP: +{comp.fromSP.toFixed(1)}</span>}{comp.fromAug!==0&&<span style={{background:comp.fromAug>0?"#f39c1220":"#ff6b6b20",padding:"1px 5px",borderRadius:4,color:comp.fromAug>0?"#f39c12":"#ff6b6b"}}>Aug: {comp.fromAug>0?"+":""}{comp.fromAug}</span>}{comp.fromPost>0&&<span style={{background:"#a55eea20",padding:"1px 5px",borderRadius:4,color:"#a55eea"}}>Passive: +{comp.fromPost.toFixed(1)}</span>}</div><div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>add(stat.key,-10)} style={bs("#ff6b6b",true)}>-10</button><button onClick={()=>add(stat.key,-1)} style={bs("#ff6b6b",true)}>-1</button><div style={{flex:1,height:6,background:"#16162a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(pts/4,100)+"%",background:"linear-gradient(90deg,"+stat.color+"55,"+stat.color+")",borderRadius:3,transition:"width 0.15s"}}/></div><button onClick={()=>add(stat.key,1)} style={bs("#2ed573",true)}>+1</button><button onClick={()=>add(stat.key,10)} style={bs("#2ed573",true)}>+10</button></div></div>)})}</div></div>)}

// ═══════════════════════════════════════════
// TAB: AUGMENTS (with stat bonus input)
// ═══════════════════════════════════════════
function AugmentsTab({selectedAugments:sa,setSelectedAugments:setSA,augBonus,setAugBonus}){const[f,setF]=useState("ALL");const fl=f==="ALL"?AUGMENTS:AUGMENTS.filter(a=>a.tier===f);const gr={};TIER_ORDER.forEach(t=>{gr[t]=fl.filter(a=>a.tier===t)});const tog=a=>setSA(p=>p.find(x=>x.id===a.id)?p.filter(x=>x.id!==a.id):[...p,a]);return(<div><div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>{["ALL",...TIER_ORDER].map(t=>(<button key={t} onClick={()=>setF(t)} style={{padding:"6px 14px",borderRadius:10,border:"2px solid "+(f===t?(TIER_COLORS[t]||"#f39c12"):"var(--brd)"),background:f===t?(TIER_COLORS[t]||"#f39c12")+"12":"var(--bg)",color:f===t?(TIER_COLORS[t]||"#f39c12"):"#444",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t==="ALL"?"Tous":t}</button>))}<span style={{marginLeft:"auto",fontSize:12,color:"#666"}}>{sa.length} sélectionnés</span></div>{TIER_ORDER.map(tier=>{const augs=gr[tier];if(!augs?.length)return null;return(<div key={tier} style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:800,color:TIER_COLORS[tier],marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>{tier} ({augs.length})</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:6}}>{augs.map(aug=>{const sel=sa.find(a=>a.id===aug.id);return(<div key={aug.id} onClick={()=>tog(aug)} style={{background:sel?TIER_COLORS[aug.tier]+"0d":"var(--card)",border:"2px solid "+(sel?TIER_COLORS[aug.tier]:"var(--brd)"),borderRadius:10,padding:"8px 12px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:sel?TIER_COLORS[aug.tier]:"#bbb"}}>{aug.name}</span><span style={{fontSize:9,color:TIER_COLORS[aug.tier],background:TIER_COLORS[aug.tier]+"15",padding:"2px 6px",borderRadius:5}}>{aug.tier}</span></div><div style={{fontSize:10,color:"#666",marginTop:3}}>{aug.desc}</div>{aug.bonuses&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{Object.entries(aug.bonuses).map(([k,v])=>{const st=STATS.find(s=>s.key===k);return st?<span key={k} style={{fontSize:9,background:v>0?"#2ed57318":"#ff6b6b18",color:v>0?"#2ed573":"#ff6b6b",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{v>0?"+":""}{v}{st.mode!=="flat"?"%":""} {st.name}</span>:null})}</div>}{aug.scaling&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{aug.scaling.map((sc,i)=>{const src=STATS.find(s=>s.key===sc.source);const tgt=STATS.find(s=>s.key===sc.target);return <span key={i} style={{fontSize:9,background:"#a55eea18",color:"#a55eea",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{src?.icon} {(sc.ratio*100).toFixed(0)}% {src?.name} → {tgt?.icon} {tgt?.name}</span>})}</div>}</div>)})}</div></div>)})}
{/* Augment stat bonuses input */}
<div style={{marginTop:16,background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}>
<div style={{fontSize:13,fontWeight:800,color:"#f39c12",marginBottom:4}}>📊 Bonus manuels (Common rolls, autres)</div>
<div style={{fontSize:10,color:"#666",marginBottom:10}}>Ajoute ici les bonus des rolls Common ou d'autres sources non automatiques. Les bonus des augments sélectionnés ci-dessus sont déjà calculés automatiquement.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:8}}>
{STATS.map(s=>(<div key={s.key} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{s.icon}</span><span style={{fontSize:11,color:"#aaa",minWidth:70}}>{s.name}</span><input type="number" step="0.01" value={augBonus[s.key]||""} onChange={e=>{const v=parseFloat(e.target.value);setAugBonus(p=>({...p,[s.key]:isNaN(v)?0:v}))}} placeholder="0" style={{width:70,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:6,color:s.color,padding:"4px 8px",fontSize:12,fontWeight:700,textAlign:"right"}}/><span style={{fontSize:10,color:"#555"}}>{s.mode!=="flat"?"%":""}</span></div>))}
</div></div></div>)}

// ═══════════════════════════════════════════
// TAB: SUMMARY
// ═══════════════════════════════════════════
function SummaryTab({state:s}){const{selectedRace:race,primaryClass:c1,secondaryClass:c2,primaryTier:t1,secondaryTier:t2,level,prestige,skillPoints:sp,selectedAugments:sa,augBonus:manualAug}=s;const totalSP=12+(level-1)*5;const usedSP=Object.values(sp).reduce((a,b)=>a+b,0);const inn=computeInnates(race,c1,t1,c2,t2,level);const flatAug=computeAugBonuses(sa,manualAug);const baseStats={};STATS.forEach(s=>{baseStats[s.key]=computeStat(s,race,inn,sp,flatAug).total});const augBonus=computeAugBonuses(sa,manualAug,baseStats);const baseStats2={};STATS.forEach(s=>{baseStats2[s.key]=computeStat(s,race,inn,sp,augBonus).total});const postBonus=computeClassPassiveScaling(c1,c2,baseStats2);const[copied,setCopied]=useState(false);const code=encodeBuild(s);return(<div><div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><button onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:"8px 16px",borderRadius:10,border:"2px solid #f39c1240",background:"#f39c1210",color:"#f39c12",fontWeight:700,fontSize:12,cursor:"pointer"}}>{copied?"✅ Copié !":"📋 Copier le code"}</button><div style={{flex:1,background:"var(--card)",borderRadius:8,padding:"6px 10px",fontSize:10,color:"#444",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"1px solid var(--brd)"}}>{code.slice(0,80)}...</div></div>
<div style={{background:"linear-gradient(135deg,#141425,#1a1a38)",borderRadius:16,padding:18,border:"1px solid #2a2a4e",marginBottom:14}}><div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{[{l:"PRESTIGE",v:prestige,c:prestige>0?"#e74c3c":"#fff"},{l:"LEVEL",v:level,c:"#fff"}].map(x=>(<div key={x.l} style={{flex:"1 1 80px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div><div style={{fontSize:22,fontWeight:900,color:x.c}}>{x.v}</div></div>))}<div style={{flex:"1 1 120px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>RACE</div>{race?<div style={{fontSize:16,fontWeight:800,color:race.color}}>{race.emoji} {race.name}</div>:<div style={{color:"#444"}}>—</div>}</div>{[{l:"PRIMARY CLASS",o:c1,t:t1},{l:"SECONDARY CLASS",o:c2,t:t2}].map(x=>(<div key={x.l} style={{flex:"1 1 140px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div>{x.o?<div><span style={{fontSize:14,fontWeight:800,color:x.o.color}}>{x.o.emoji} {x.o.name}</span><div style={{fontSize:10,color:CLASS_TIER_COLORS[x.t]}}>{CLASS_TIERS[x.t]}</div></div>:<div style={{color:"#444"}}>—</div>}</div>))}</div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Total Attributes */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Total Attributes</div>{STATS.map(stat=>{const comp=computeStat(stat,race,inn,sp,augBonus,postBonus);const pts=sp[stat.key]||0;const mx=stat.mode==="flat"?300:100;const pct=Math.min((Math.abs(comp.total)/mx)*100,100);return(<div key={stat.key} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:pts>0?stat.color:"#888"}}>{stat.icon} <span style={{fontWeight:pts>0?700:400}}>Niv. {pts}</span> {stat.name}</span><span style={{color:stat.color,fontWeight:800,fontSize:13}}>{fmt(comp.total,stat.mode)}</span></div><div style={{height:5,background:"#16162a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+stat.color+"44,"+stat.color+")",borderRadius:3}}/></div></div>)})}</div>
{/* Innate */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Innate Bonuses</div>{STATS.filter(s=>inn[s.key].perLevel>0).map(stat=>{const i=inn[stat.key];return(<div key={stat.key} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #ffffff08",fontSize:12}}><span style={{color:"#bbb"}}>{stat.icon} {stat.name}</span><span style={{color:stat.color,fontWeight:600}}>+{i.perLevel.toFixed(2)} par niveau <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>
<div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Augments */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Augments ({sa.length})</div>{sa.length===0?<div style={{color:"#444",fontSize:11}}>Aucun augment</div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>{sa.map(aug=>(<div key={aug.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:TIER_COLORS[aug.tier]+"0a",borderRadius:6,border:"1px solid "+TIER_COLORS[aug.tier]+"18"}}><span style={{fontSize:11,fontWeight:600,color:"#ccc"}}>{aug.name}</span><span style={{fontSize:9,color:TIER_COLORS[aug.tier],fontWeight:700}}>{aug.tier}</span></div>))}</div>}
{/* Augment stat bonuses */}
{Object.entries(augBonus).some(([,v])=>v!==0)&&(<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:700,color:"#f39c12",marginBottom:4}}>Bonus Augments (total)</div>{STATS.filter(s=>(augBonus[s.key]||0)!==0).map(s=>(<div key={s.key} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0"}}><span style={{color:"#aaa"}}>{s.icon} {s.name}</span><span style={{color:augBonus[s.key]>0?"#f39c12":"#ff6b6b",fontWeight:700}}>{augBonus[s.key]>0?"+":""}{augBonus[s.key]}{s.mode!=="flat"?"%":""}</span></div>))}</div>)}
</div>
{/* Passives */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Passives</div>{race&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:race.color,marginBottom:4}}>{race.emoji} {race.name}</div><PassiveList passives={race.passives} compact/></div>}{c1&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:c1.color,marginBottom:4}}>{c1.emoji} {c1.name} (Primaire)</div><PassiveList passives={c1.passives} compact/></div>}{c2&&<div><div style={{fontSize:10,fontWeight:700,color:c2.color,marginBottom:4}}>{c2.emoji} {c2.name} (Secondaire)</div><PassiveList passives={c2.passives} compact/></div>}</div></div></div>
<div style={{marginTop:14,padding:"10px 14px",background:"#f39c120a",borderRadius:10,border:"1px solid #f39c1218",fontSize:10,color:"#888",lineHeight:1.5}}>⚠️ Formules : Stats multiplicatives (FOR, DEF, SOR) = (innate + SP + aug) × race. Hâte = (race - 1.0)×100 + (innate + SP + aug) × race. Stats additives (PRE, FER, DIS) = base race + innate + SP + aug. Stats flat (VIT, END, FLOW) = base race + innate + SP + aug.</div></div>)}

// ═══════════════════════════════════════════
// IMPORT DIALOG
// ═══════════════════════════════════════════
function ImportDialog({onImport,onClose}){const[code,setCode]=useState("");const[err,setErr]=useState("");const go=()=>{const r=decodeBuild(code.trim());if(r){onImport(r);onClose()}else setErr("Code invalide")};return(<div style={{position:"fixed",inset:0,background:"#000b",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1a1a2e",borderRadius:16,padding:24,width:400,maxWidth:"90vw",border:"2px solid #2a2a4e"}}><h3 style={{margin:"0 0 12px",color:"#fff",fontSize:16}}>📥 Importer un build</h3><textarea value={code} onChange={e=>{setCode(e.target.value);setErr("")}} placeholder="Colle ton code ici..." style={{width:"100%",minHeight:80,background:"#12121e",border:"1px solid #2a2a4e",borderRadius:10,color:"#ccc",padding:10,fontSize:12,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box"}}/>{err&&<div style={{color:"#ff6b6b",fontSize:11,marginTop:4}}>{err}</div>}<div style={{display:"flex",gap:8,marginTop:12,justifyContent:"flex-end"}}><button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #333",background:"transparent",color:"#888",cursor:"pointer",fontWeight:600,fontSize:12}}>Annuler</button><button onClick={go} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#f39c12",color:"#000",cursor:"pointer",fontWeight:700,fontSize:12}}>Importer</button></div></div></div>)}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════════════
// BUILD CREATOR — COMPONENT
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════
// STORAGE HELPERS (persistent across sessions)
// ═══════════════════════════════════════════
function loadSavedBuilds() {
  try {
    const result = localStorage.getItem("cieldevignis-builds");
    return result ? JSON.parse(result) : [];
  } catch { return []; }
}
function saveBuildsList(builds) {
  try { localStorage.setItem("cieldevignis-builds", JSON.stringify(builds)); } catch(e) { console.error(e); }
}

// ═══════════════════════════════════════════
// SHARE CARD — PNG EXPORT VIA CANVAS
// ═══════════════════════════════════════════
function ShareCard({ state, onClose }) {
  const { selectedRace: race, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, prestige, skillPoints: sp, selectedAugments: sa, augBonus: manualAug } = state;
  const inn = computeInnates(race, c1, t1, c2, t2, level);
  const flatAug = computeAugBonuses(sa, manualAug);
  const bs1 = {}; STATS.forEach(s => { bs1[s.key] = computeStat(s, race, inn, sp, flatAug).total; });
  const augB = computeAugBonuses(sa, manualAug, bs1);
  const bs2 = {}; STATS.forEach(s => { bs2[s.key] = computeStat(s, race, inn, sp, augB).total; });
  const post = computeClassPassiveScaling(c1, c2, bs2);

  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const drawCard = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const W = 600, H = 520;
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2); // Retina

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0c1020"); bgGrad.addColorStop(1, "#141830");
    ctx.fillStyle = bgGrad; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

    // Border
    ctx.strokeStyle = "#2a3060"; ctx.lineWidth = 1.5; roundRect(ctx, 0, 0, W, H, 16); ctx.stroke();

    // Header
    ctx.fillStyle = "#f0a030"; ctx.font = "bold 22px sans-serif"; ctx.fillText("CielDeVignis", 24, 38);
    ctx.fillStyle = "#6878a0"; ctx.font = "11px sans-serif"; ctx.fillText("Build Creator • EndlessLeveling v6.7", 24, 56);
    // Level
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "right";
    ctx.fillText(`Niv. ${level}${prestige > 0 ? ` P${prestige}` : ""}`, W - 24, 42);
    ctx.textAlign = "left";

    // Divider
    ctx.fillStyle = "#1a2040"; ctx.fillRect(24, 68, W - 48, 1);

    // Build info boxes
    let bx = 24;
    const drawBox = (emoji, name, sub, color) => {
      const bw = 170;
      ctx.fillStyle = color + "15"; roundRect(ctx, bx, 80, bw, 60, 10); ctx.fill();
      ctx.strokeStyle = color + "40"; roundRect(ctx, bx, 80, bw, 60, 10); ctx.stroke();
      ctx.font = "24px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(emoji, bx + 12, 116);
      ctx.font = "bold 14px sans-serif"; ctx.fillStyle = color; ctx.fillText(name, bx + 44, 108);
      ctx.font = "10px sans-serif"; ctx.fillStyle = "#6878a0"; ctx.fillText(sub, bx + 44, 124);
      bx += bw + 10;
    };
    if (race) drawBox(race.emoji, race.name, "Race", race.color);
    if (c1) drawBox(c1.emoji, c1.name, `${CLASS_TIERS[t1]} • Primaire`, c1.color);
    if (c2) drawBox(c2.emoji, c2.name, `${CLASS_TIERS[t2]} • Secondaire`, c2.color);

    // Stats - 2 columns
    let sy = 160;
    ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#6878a0";
    ctx.fillText("TOTAL ATTRIBUTES", 24, sy); sy += 16;

    STATS.forEach((stat, i) => {
      const comp = computeStat(stat, race, inn, sp, augB, post);
      const pts = sp[stat.key] || 0;
      const col = i < 5 ? 0 : 1;
      const row = i < 5 ? i : i - 5;
      const x = 24 + col * 290;
      const y = sy + row * 28;

      // Label
      ctx.font = "12px sans-serif";
      ctx.fillStyle = pts > 0 ? stat.color : "#6878a0";
      ctx.fillText(`${stat.icon} Niv. ${pts} ${stat.name}`, x, y + 12);

      // Value
      ctx.font = "bold 13px sans-serif"; ctx.fillStyle = stat.color;
      ctx.textAlign = "right"; ctx.fillText(fmt(comp.total, stat.mode), x + 270, y + 12);
      ctx.textAlign = "left";

      // Bar
      const barW = 270, barH = 4;
      const mx = stat.mode === "flat" ? 300 : 100;
      const pct = Math.min(Math.abs(comp.total) / mx, 1);
      ctx.fillStyle = "#1a2040"; roundRect(ctx, x, y + 18, barW, barH, 2); ctx.fill();
      if (pct > 0) { ctx.fillStyle = stat.color + "88"; roundRect(ctx, x, y + 18, barW * pct, barH, 2); ctx.fill(); }
    });

    // Augments
    const augY = sy + 5 * 28 + 20;
    if (sa.length > 0) {
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#6878a0";
      ctx.fillText("AUGMENTS", 24, augY);
      let ax = 24;
      sa.forEach(a => {
        const tc = TIER_COLORS[a.tier] || "#888";
        ctx.font = "11px sans-serif";
        const tw = ctx.measureText(a.name).width + 16;
        ctx.fillStyle = tc + "20"; roundRect(ctx, ax, augY + 6, tw, 20, 6); ctx.fill();
        ctx.fillStyle = tc; ctx.font = "bold 10px sans-serif"; ctx.fillText(a.name, ax + 8, augY + 20);
        ax += tw + 6;
        if (ax > W - 60) { ax = 24; }
      });
    }

    // Footer
    ctx.fillStyle = "#4a5478"; ctx.font = "9px sans-serif"; ctx.textAlign = "right";
    ctx.fillText("cieldevignis.vercel.app", W - 24, H - 16);
    ctx.textAlign = "left";
  };

  useEffect(() => { drawCard(); }, [state]);

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    setDownloading(true);
    const link = document.createElement("a");
    link.download = `build-${race?.name || "custom"}-${c1?.name || ""}-lv${level}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: "95vw" }}>
        <div style={{ background: "#0c1020", borderRadius: 16, padding: 20, border: "1px solid #2a3060" }}>
          <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 12, display: "block" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
            <button onClick={handleDownload} style={{
              padding: "10px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #f0a030, #e85d3a)", color: "#fff",
              fontWeight: 800, fontSize: 14, cursor: "pointer",
            }}>
              {downloading ? "✅ Téléchargé !" : "📥 Télécharger PNG"}
            </button>
            <button onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid #333",
              background: "transparent", color: "#888", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// ═══════════════════════════════════════════
// BUILDS MANAGER TAB
// ═══════════════════════════════════════════
function BuildsManagerTab({ savedBuilds, onLoad, onDelete, currentState, onSave }) {
  const [name, setName] = useState("");
  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
  };
  return (
    <div>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#fff", fontFamily: "var(--fd)" }}>💾 Mes Builds</h3>
      {/* Save current */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="Nom du build..." style={{
            flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--brd)", background: "var(--bg)",
            color: "#fff", fontSize: 13, fontFamily: "var(--fb)", outline: "none",
          }} />
        <button onClick={handleSave} style={{
          padding: "10px 24px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #f0a030, #e85d3a)", color: "#fff",
          fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        }}>💾 Sauvegarder</button>
      </div>
      {/* Saved list */}
      {savedBuilds.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6878a0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 14 }}>Aucun build sauvegardé</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Configure ton build puis sauvegarde-le ici !</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {savedBuilds.map((build, i) => {
            const d = build.data;
            const race = RACES.find(r => r.id === d.r);
            const c1 = CLASSES.find(c => c.id === d.c1);
            const c2 = CLASSES.find(c => c.id === d.c2);
            return (
              <div key={i} style={{
                background: "var(--card)", border: "1px solid var(--brd)", borderRadius: 14,
                padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", gap: 4, fontSize: 24 }}>
                  {race && <span>{race.emoji}</span>}
                  {c1 && <span>{c1.emoji}</span>}
                  {c2 && <span style={{ opacity: 0.6, fontSize: 18 }}>{c2.emoji}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{build.name}</div>
                  <div style={{ fontSize: 11, color: "#6878a0" }}>
                    Niv. {d.l}{d.p > 0 ? ` P${d.p}` : ""} • {race?.name || "?"} • {c1?.name || "?"}{c2 ? ` / ${c2.name}` : ""}
                    {d.t1 > 0 && ` • ${CLASS_TIERS[d.t1]}`}
                  </div>
                  <div style={{ fontSize: 10, color: "#4a5478", marginTop: 2 }}>
                    {new Date(build.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onLoad(build)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid #f0a03040",
                    background: "#f0a03010", color: "#f0a030", fontWeight: 700, fontSize: 11, cursor: "pointer",
                  }}>Charger</button>
                  <button onClick={() => onDelete(i)} style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid #ff6b6b30",
                    background: "#ff6b6b08", color: "#ff6b6b", fontWeight: 700, fontSize: 11, cursor: "pointer",
                  }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// COMPARE TAB
// ═══════════════════════════════════════════
function CompareTab({ savedBuilds, currentState }) {
  const [slotA, setSlotA] = useState("current");
  const [slotB, setSlotB] = useState(null);

  const resolveState = (slot) => {
    if (slot === "current") return currentState;
    const build = savedBuilds[slot];
    if (!build) return null;
    const d = build.data;
    return {
      selectedRace: RACES.find(r => r.id === d.r) || null,
      primaryClass: CLASSES.find(c => c.id === d.c1) || null,
      secondaryClass: CLASSES.find(c => c.id === d.c2) || null,
      primaryTier: d.t1 || 0, secondaryTier: d.t2 || 0,
      level: d.l || 1, prestige: d.p || 0,
      skillPoints: d.sp || {}, selectedAugments: (d.a || []).map(id => AUGMENTS.find(a => a.id === id)).filter(Boolean),
      augBonus: d.ab || {},
    };
  };

  const computeAll = (state) => {
    if (!state) return null;
    const { selectedRace: race, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, skillPoints: sp, selectedAugments: sa, augBonus: mAug } = state;
    const inn = computeInnates(race, c1, t1, c2, t2, level);
    const fAug = computeAugBonuses(sa, mAug);
    const bs1 = {}; STATS.forEach(s => { bs1[s.key] = computeStat(s, race, inn, sp, fAug).total; });
    const aB = computeAugBonuses(sa, mAug, bs1);
    const bs2 = {}; STATS.forEach(s => { bs2[s.key] = computeStat(s, race, inn, sp, aB).total; });
    const post = computeClassPassiveScaling(c1, c2, bs2);
    const final = {}; STATS.forEach(s => { final[s.key] = computeStat(s, race, inn, sp, aB, post).total; });
    return { stats: final, state };
  };

  const a = computeAll(resolveState(slotA));
  const b = computeAll(resolveState(slotB));

  const options = [{ value: "current", label: "⚔️ Build actuel" }, ...savedBuilds.map((b, i) => ({ value: i, label: `💾 ${b.name}` }))];

  const BuildColumn = ({ data, label }) => {
    if (!data) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6878a0", fontSize: 13 }}>Sélectionne un build</div>;
    const { stats, state: s } = data;
    return (
      <div style={{ flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", fontSize: 22 }}>
            {s.selectedRace && <span>{s.selectedRace.emoji}</span>}
            {s.primaryClass && <span>{s.primaryClass.emoji}</span>}
            {s.secondaryClass && <span style={{ opacity: 0.5 }}>{s.secondaryClass.emoji}</span>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 4 }}>Niv. {s.level}{s.prestige > 0 ? ` P${s.prestige}` : ""}</div>
          <div style={{ fontSize: 11, color: "#6878a0" }}>
            {s.selectedRace?.name} • {s.primaryClass?.name}{s.secondaryClass ? ` / ${s.secondaryClass.name}` : ""}
          </div>
        </div>
        {STATS.map(st => (
          <div key={st.key} style={{ display: "flex", justifyContent: "space-between", padding: "3px 8px", fontSize: 11 }}>
            <span style={{ color: "#6878a0" }}>{st.icon} {st.name}</span>
            <span style={{ color: st.color, fontWeight: 700 }}>{fmt(stats[st.key], st.mode)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#fff", fontFamily: "var(--fd)" }}>⚖️ Comparer des builds</h3>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#6878a0", fontWeight: 700, display: "block", marginBottom: 4 }}>Build A</label>
          <select value={slotA ?? ""} onChange={e => setSlotA(e.target.value === "current" ? "current" : parseInt(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--brd)", background: "var(--bg)", color: "#fff", fontSize: 12 }}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8, fontSize: 18, color: "#6878a0" }}>vs</div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: "#6878a0", fontWeight: 700, display: "block", marginBottom: 4 }}>Build B</label>
          <select value={slotB ?? ""} onChange={e => setSlotB(e.target.value === "current" ? "current" : e.target.value === "" ? null : parseInt(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--brd)", background: "var(--bg)", color: "#fff", fontSize: 12 }}>
            <option value="">— Choisir —</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      {/* Comparison */}
      <div style={{ display: "flex", gap: 16, background: "var(--card)", borderRadius: 16, padding: 16, border: "1px solid var(--brd)" }}>
        <BuildColumn data={a} label="A" />
        {a && b && (
          <div style={{ width: 1, background: "var(--brd)", flexShrink: 0, margin: "30px 0" }} />
        )}
        {a && b && (
          <div style={{ width: 60, display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 62 }}>
            {STATS.map(st => {
              const diff = (b.stats[st.key] || 0) - (a.stats[st.key] || 0);
              if (Math.abs(diff) < 0.05) return <div key={st.key} style={{ padding: "3px 0", fontSize: 10, textAlign: "center", color: "#4a5478" }}>—</div>;
              return <div key={st.key} style={{ padding: "3px 0", fontSize: 10, textAlign: "center", fontWeight: 700, color: diff > 0 ? "#2ed573" : "#ff6b6b" }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</div>;
            })}
          </div>
        )}
        {a && b && (
          <div style={{ width: 1, background: "var(--brd)", flexShrink: 0, margin: "30px 0" }} />
        )}
        <BuildColumn data={b} label="B" />
      </div>
      {savedBuilds.length === 0 && <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#6878a0" }}>Sauvegarde des builds dans l'onglet "Mes Builds" pour les comparer ici</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// BUILD CREATOR — MAIN COMPONENT
// ═══════════════════════════════════════════
function BuildCreator(){const[tab,setTab]=useState("race");const[selectedRace,setSelectedRace]=useState(null);const[primaryClass,setPrimaryClass]=useState(null);const[secondaryClass,setSecondaryClass]=useState(null);const[primaryTier,setPrimaryTier]=useState(0);const[secondaryTier,setSecondaryTier]=useState(0);const[level,setLevel]=useState(1);const[prestige,setPrestige]=useState(0);const[skillPoints,setSkillPoints]=useState({});const[selectedAugments,setSelectedAugments]=useState([]);const[augBonus,setAugBonus]=useState({});const[showImport,setShowImport]=useState(false);const[showShareCard,setShowShareCard]=useState(false);const[savedBuilds,setSavedBuilds]=useState([]);
useEffect(()=>{setSavedBuilds(loadSavedBuilds())},[]);
const totalSP=12+(level-1)*5;const usedSP=Object.values(skillPoints).reduce((a,b)=>a+b,0);
const handleImport=d=>{setSelectedRace(d.selectedRace);setPrimaryClass(d.primaryClass);setSecondaryClass(d.secondaryClass);setPrimaryTier(d.primaryTier);setSecondaryTier(d.secondaryTier);setLevel(d.level);setPrestige(d.prestige);setSkillPoints(d.skillPoints);setSelectedAugments(d.selectedAugments);setAugBonus(d.augBonus||{});setTab("summary")};
const handleSaveBuild=(name)=>{const d={r:selectedRace?.id||"",c1:primaryClass?.id||"",c2:secondaryClass?.id||"",t1:primaryTier,t2:secondaryTier,l:level,p:prestige,sp:skillPoints,a:selectedAugments.map(a=>a.id),ab:augBonus};const newBuilds=[...savedBuilds,{name,data:d,date:Date.now()}];setSavedBuilds(newBuilds);saveBuildsList(newBuilds)};
const handleLoadBuild=(build)=>{const d=build.data;setSelectedRace(RACES.find(r=>r.id===d.r)||null);setPrimaryClass(CLASSES.find(c=>c.id===d.c1)||null);setSecondaryClass(CLASSES.find(c=>c.id===d.c2)||null);setPrimaryTier(d.t1||0);setSecondaryTier(d.t2||0);setLevel(d.l||1);setPrestige(d.p||0);setSkillPoints(d.sp||{});setSelectedAugments((d.a||[]).map(id=>AUGMENTS.find(a=>a.id===id)).filter(Boolean));setAugBonus(d.ab||{});setTab("summary")};
const handleDeleteBuild=(idx)=>{const newBuilds=savedBuilds.filter((_,i)=>i!==idx);setSavedBuilds(newBuilds);saveBuildsList(newBuilds)};
const state={selectedRace,primaryClass,secondaryClass,primaryTier,secondaryTier,level,prestige,skillPoints,selectedAugments,augBonus};
// 2-pass computation: base stats first, then scaling augments, then class passive scaling
const inn=computeInnates(selectedRace,primaryClass,primaryTier,secondaryClass,secondaryTier,level);
const flatAugBonus=computeAugBonuses(selectedAugments,augBonus);
const baseStats={};STATS.forEach(s=>{baseStats[s.key]=computeStat(s,selectedRace,inn,skillPoints,flatAugBonus).total});
const totalAugBonus=computeAugBonuses(selectedAugments,augBonus,baseStats);
const baseStats2={};STATS.forEach(s=>{baseStats2[s.key]=computeStat(s,selectedRace,inn,skillPoints,totalAugBonus).total});
const postBonus=computeClassPassiveScaling(primaryClass,secondaryClass,baseStats2);return(<div style={{"--bg":"#080b16","--card":"#0f1424","--brd":"#1a2040","--fd":"var(--fd)","--fb":"var(--fb)",background:"var(--bg)",color:"#d0d0e0",fontFamily:"var(--fb)"}}><div style={{background:"linear-gradient(135deg,#141428,#1a1a3a,#0f2840)",padding:"14px 20px 0",borderBottom:"1px solid var(--brd)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-60,right:-30,width:200,height:200,background:"radial-gradient(circle,#f39c120a,transparent)",borderRadius:"50%"}}/><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1,marginBottom:10}}><div><h1 style={{margin:0,fontSize:24,fontFamily:"var(--fd)",letterSpacing:1.5,background:"linear-gradient(135deg,#7ec8e3,#5b86e5,#a855f7,#f39c12)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CielDeVignis</h1><div style={{fontSize:10,color:"#445",letterSpacing:0.5}}>Build Creator — EndlessLeveling v6.7</div></div><button onClick={()=>setShowImport(true)} style={{padding:"7px 14px",borderRadius:10,border:"1px solid #2a2a4e",background:"#ffffff06",color:"#999",fontWeight:700,fontSize:11,cursor:"pointer"}}>📥 Importer</button><button onClick={()=>setShowShareCard(true)} style={{padding:"7px 14px",borderRadius:10,border:"1px solid #2a2a4e",background:"#ffffff06",color:"#999",fontWeight:700,fontSize:11,cursor:"pointer",marginLeft:6}}>📸 Image</button></div><div style={{display:"flex",gap:2,position:"relative",zIndex:1,overflowX:"auto",paddingBottom:2}}>{TABS.map(t=>{const active=tab===t.id;const done=t.id==="race"?!!selectedRace:t.id==="class"?!!primaryClass:t.id==="stats"?usedSP>0:t.id==="augments"?selectedAugments.length>0||Object.values(augBonus).some(v=>v>0):t.id==="builds"?savedBuilds.length>0:false;return(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 14px",borderRadius:"10px 10px 0 0",border:"none",background:active?"var(--card)":"transparent",color:active?"#f39c12":"#444",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,borderBottom:active?"2px solid #f39c12":"2px solid transparent",whiteSpace:"nowrap",flexShrink:0}}>{t.emoji} {t.label} {done&&<span style={{width:5,height:5,borderRadius:"50%",background:"#2ed573"}}/>}</button>)})}</div></div><div style={{padding:"16px 20px",maxWidth:1200,margin:"0 auto"}}>{tab==="race"&&<RaceTab selectedRace={selectedRace} setSelectedRace={setSelectedRace}/>}{tab==="class"&&<ClassTab primaryClass={primaryClass} setPrimaryClass={setPrimaryClass} secondaryClass={secondaryClass} setSecondaryClass={setSecondaryClass} primaryTier={primaryTier} setPrimaryTier={setPrimaryTier} secondaryTier={secondaryTier} setSecondaryTier={setSecondaryTier}/>}{tab==="stats"&&<StatsTab level={level} setLevel={setLevel} prestige={prestige} setPrestige={setPrestige} skillPoints={skillPoints} setSkillPoints={setSkillPoints} totalSP={totalSP} usedSP={usedSP} selectedRace={selectedRace} primaryClass={primaryClass} primaryTier={primaryTier} secondaryClass={secondaryClass} secondaryTier={secondaryTier} augBonus={totalAugBonus} postBonus={postBonus}/>}{tab==="augments"&&<AugmentsTab selectedAugments={selectedAugments} setSelectedAugments={setSelectedAugments} augBonus={augBonus} setAugBonus={setAugBonus}/>}{tab==="summary"&&<SummaryTab state={state}/>}{tab==="builds"&&<BuildsManagerTab savedBuilds={savedBuilds} onLoad={handleLoadBuild} onDelete={handleDeleteBuild} currentState={state} onSave={handleSaveBuild}/>}{tab==="compare"&&<CompareTab savedBuilds={savedBuilds} currentState={state}/>}</div>{showImport&&<ImportDialog onImport={handleImport} onClose={()=>setShowImport(false)}/>}{showShareCard&&<ShareCard state={state} onClose={()=>setShowShareCard(false)}/>}</div>)}


// ═══════════════════════════════════════════════════
// SITE SHELL — LANDING PAGE, NAVIGATION, WIKI
// ═══════════════════════════════════════════════════


// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const G = {
  bg: "#080b16", card: "#0f1424", border: "#1a2040", accent: "#f0a030", accent2: "#e85d3a",
  teal: "#30c8b0", blue: "#4890f0", purple: "#8860e0", pink: "#e060a0",
  text: "#d8dce8", muted: "#6878a0",
};

// ═══════════════════════════════════════════
// PARTICLE BACKGROUND
// ═══════════════════════════════════════════
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.5 - 0.1,
      r: Math.random() * 2.5 + 0.5, o: Math.random() * 0.5 + 0.1,
      c: [G.accent, G.teal, G.blue, G.purple, G.pink][Math.floor(Math.random() * 5)]
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.o; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════
function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "home", label: "Accueil", icon: "🏠" },
    { id: "builds", label: "Build Creator", icon: "⚔️" },
    { id: "wiki", label: "Wiki", icon: "📖" },
    { id: "discord", label: "Discord", icon: "💬" },
  ];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? `${G.bg}ee` : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${G.border}` : "none",
      transition: "all 0.4s ease",
      padding: "0 32px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)" }}>C</div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CielDeVignis</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => {
              if (l.id === "discord") window.open("https://discord.gg/hfMeu9KWsh", "_blank");
              else setPage(l.id);
            }} style={{
              padding: "8px 18px", borderRadius: 10, border: "none",
              background: page === l.id ? `${G.accent}18` : "transparent",
              color: page === l.id ? G.accent : G.muted,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--fb)",
            }}>
              <span style={{ fontSize: 15 }}>{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════
// FEATURE CARD
// ═══════════════════════════════════════════
function FeatureCard({ icon, title, desc, color, delay, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: `linear-gradient(145deg, ${G.card}, ${color}08)`,
      border: `1px solid ${color}25`, borderRadius: 20, padding: 28,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.3s ease", position: "relative", overflow: "hidden",
      animation: `fadeSlideUp 0.6s ease ${delay}s both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${color}15`; e.currentTarget.style.borderColor = `${color}50`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = `${color}25`; }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: `radial-gradient(circle, ${color}10, transparent)`, borderRadius: "50%" }} />
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: G.muted, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// RACE PREVIEW CARD
// ═══════════════════════════════════════════
function RacePreview({ race, delay }) {
  return (
    <div style={{
      background: `linear-gradient(145deg, ${G.card}, ${race.color}06)`,
      border: `1px solid ${race.color}20`, borderRadius: 16, padding: "16px 20px",
      textAlign: "center", minWidth: 120, flex: "0 0 auto",
      animation: `fadeSlideUp 0.5s ease ${delay}s both`,
      transition: "all 0.3s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${race.color}60`; e.currentTarget.style.transform = "scale(1.05)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = `${race.color}20`; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ fontSize: 36, marginBottom: 6 }}>{race.emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: race.color, fontFamily: "var(--fd)" }}>{race.name}</div>
      <div style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>{race.passives.length} passifs</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// STAT ICON ROW
// ═══════════════════════════════════════════
function StatRow() {
  const stats = [
    { icon: "❤️", name: "Vitalité", color: "#ff6b6b" },
    { icon: "⚔️", name: "Force", color: "#ff9f43" },
    { icon: "✨", name: "Sorcellerie", color: "#a55eea" },
    { icon: "🛡️", name: "Défense", color: "#54a0ff" },
    { icon: "💨", name: "Hâte", color: "#a29bfe" },
    { icon: "🎯", name: "Précision", color: "#f368e0" },
    { icon: "🔥", name: "Férocité", color: "#ff6348" },
    { icon: "🏃", name: "Endurance", color: "#2ed573" },
    { icon: "💎", name: "Flow", color: "#45aaf2" },
    { icon: "📖", name: "Discipline", color: "#fed330" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeSlideUp 0.6s ease 0.8s both" }}>
      {stats.map(s => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", background: `${s.color}10`, border: `1px solid ${s.color}20`, borderRadius: 30 }}>
          <span style={{ fontSize: 14 }}>{s.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
const RACE_PREVIEWS = [
  { emoji: "👤", name: "Human", color: "#f0c040", passives: [1, 2, 3] },
  { emoji: "😈", name: "Darkin", color: "#cc3333", passives: [1, 2] },
  { emoji: "🐉", name: "Dragonborn", color: "#e67e22", passives: [1, 2] },
  { emoji: "☀️", name: "Ascended", color: "#f1c40f", passives: [1, 2] },
  { emoji: "🌟", name: "Celestial", color: "#9b59b6", passives: [1, 2] },
  { emoji: "🗿", name: "Golem", color: "#7f8c8d", passives: [1, 2] },
  { emoji: "❄️", name: "Iceborn", color: "#74b9ff", passives: [1, 2] },
  { emoji: "🦊", name: "Vastaya", color: "#00b894", passives: [1, 2] },
  { emoji: "🌀", name: "Voidborn", color: "#6c5ce7", passives: [1, 2, 3] },
  { emoji: "👁️", name: "Watcher", color: "#00cec9", passives: [1, 2] },
  { emoji: "👻", name: "Wraith", color: "#636e72", passives: [1] },
  { emoji: "🧙", name: "Yordle", color: "#fdcb6e", passives: [1, 2] },
];

const CLASS_PREVIEWS = [
  { emoji: "🔮", name: "Mage", color: "#a55eea" },
  { emoji: "📘", name: "Arcanist", color: "#8854d0" },
  { emoji: "🗡️", name: "Assassin", color: "#636e72" },
  { emoji: "⚡", name: "BattleMage", color: "#e17055" },
  { emoji: "👊", name: "Brawler", color: "#d63031" },
  { emoji: "⚔️", name: "Duelist", color: "#fdcb6e" },
  { emoji: "💚", name: "Healer", color: "#55efc4" },
  { emoji: "🪓", name: "Juggernaut", color: "#b33939" },
  { emoji: "🏹", name: "Marksman", color: "#26de81" },
  { emoji: "💀", name: "Necromancer", color: "#2d3436" },
  { emoji: "🔵", name: "Oracle", color: "#74b9ff" },
  { emoji: "💥", name: "Slayer", color: "#e84393" },
  { emoji: "🏰", name: "Vanguard", color: "#0984e3" },
  { emoji: "🧭", name: "Adventurer", color: "#00b894" },
];

function HomePage({ setPage }) {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px", position: "relative",
      }}>
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, background: `radial-gradient(circle, ${G.accent}08, transparent)`, borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 250, height: 250, background: `radial-gradient(circle, ${G.teal}08, transparent)`, borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "40%", right: "30%", width: 200, height: 200, background: `radial-gradient(circle, ${G.purple}06, transparent)`, borderRadius: "50%", filter: "blur(50px)" }} />

        <div style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <div style={{
            display: "inline-block", padding: "6px 20px", borderRadius: 30,
            background: `${G.accent}12`, border: `1px solid ${G.accent}30`,
            fontSize: 13, fontWeight: 700, color: G.accent, marginBottom: 24,
            fontFamily: "var(--fb)", letterSpacing: 0.5,
          }}>
            Serveur Hytale PvE — EndlessLeveling v6.7
          </div>
        </div>

        <h1 style={{
          fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 20px",
          fontFamily: "var(--fd)",
          background: `linear-gradient(135deg, ${G.accent} 0%, #ffd080 25%, ${G.accent2} 50%, ${G.pink} 75%, ${G.purple} 100%)`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "fadeSlideUp 0.8s ease 0.1s both, shimmer 4s linear infinite",
        }}>
          CielDeVignis
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2.5vw, 22px)", color: G.muted, maxWidth: 600, margin: "0 auto 40px",
          lineHeight: 1.6, fontFamily: "var(--fb)", animation: "fadeSlideUp 0.8s ease 0.2s both",
        }}>
          Explore des donjons, affronte des créatures, crée ton build parfait.
          <br />12 races, 14 classes, 55 augments — des possibilités infinies.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animation: "fadeSlideUp 0.8s ease 0.3s both" }}>
          <button onClick={() => setPage("builds")} style={{
            padding: "14px 36px", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`,
            color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: "var(--fd)", letterSpacing: 0.5,
            boxShadow: `0 8px 30px ${G.accent}30`,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${G.accent}40`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 30px ${G.accent}30`; }}
          >
            ⚔️ Créer un Build
          </button>
          <button onClick={() => window.open("https://discord.gg/hfMeu9KWsh", "_blank")} style={{
            padding: "14px 36px", borderRadius: 14,
            border: `2px solid ${G.border}`, background: `${G.card}cc`,
            color: G.text, fontSize: 16, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--fb)", transition: "all 0.3s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = G.muted; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = ""; }}
          >
            💬 Rejoindre Discord
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 30, animation: "bounce 2s ease infinite", opacity: 0.4 }}>
          <div style={{ width: 24, height: 40, borderRadius: 12, border: `2px solid ${G.muted}`, display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 4, height: 8, borderRadius: 2, background: G.muted, animation: "scrollDot 2s ease infinite" }} />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "20px 24px 60px" }}>
        <StatRow />
      </section>

      {/* FEATURES */}
      <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 12px", animation: "fadeSlideUp 0.6s ease both" }}>
          Tout pour ton aventure
        </h2>
        <p style={{ textAlign: "center", fontSize: 16, color: G.muted, margin: "0 0 48px", fontFamily: "var(--fb)" }}>
          Des outils pensés pour les joueurs de CielDeVignis
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <FeatureCard icon="⚔️" title="Build Creator" desc="Crée et simule tes builds avec un calcul précis de toutes tes stats. Race, classes, SP, augments — tout y est." color={G.accent} delay={0.1} onClick={() => setPage("builds")} />
          <FeatureCard icon="🏰" title="Donjons & Monstres" desc="Explore le wiki pour découvrir les créatures, leurs drops, et les stratégies pour chaque donjon." color={G.teal} delay={0.2} onClick={() => setPage("wiki")} />
          <FeatureCard icon="🗡️" title="Armes & Armures" desc="Toutes les armes et armures du serveur avec leurs stats, bonus, et compatibilité de classe." color={G.accent2} delay={0.3} onClick={() => setPage("wiki")} />
          <FeatureCard icon="📊" title="Partage & Compare" desc="Sauvegarde tes builds, partage-les avec ta guilde, et compare les stats entre différentes configurations." color={G.purple} delay={0.4} />
        </div>
      </section>

      {/* RACES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 8px" }}>
          🧬 12 Races
        </h2>
        <p style={{ textAlign: "center", fontSize: 14, color: G.muted, margin: "0 0 32px", fontFamily: "var(--fb)" }}>
          Chacune avec un arbre d'ascension unique en 4 étapes
        </p>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {RACE_PREVIEWS.map((r, i) => <RacePreview key={r.name} race={r} delay={0.05 * i} />)}
        </div>
      </section>

      {/* CLASSES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 8px" }}>
          ⚔️ 14 Classes × 5 Tiers
        </h2>
        <p style={{ textAlign: "center", fontSize: 14, color: G.muted, margin: "0 0 32px", fontFamily: "var(--fb)" }}>
          Classe primaire + secondaire — des milliers de combinaisons
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {CLASS_PREVIEWS.map((c, i) => (
            <div key={c.name} style={{
              background: `${c.color}10`, border: `1px solid ${c.color}25`, borderRadius: 12,
              padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
              animation: `fadeSlideUp 0.4s ease ${0.03 * i}s both`, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}60`; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}25`; e.currentTarget.style.transform = ""; }}
            >
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.color, fontFamily: "var(--fd)" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px 100px", textAlign: "center" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", padding: "48px 40px", borderRadius: 24,
          background: `linear-gradient(135deg, ${G.accent}08, ${G.accent2}06)`,
          border: `1px solid ${G.accent}20`, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${G.accent}10, transparent)`, borderRadius: "50%" }} />
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 12px", fontFamily: "var(--fd)", position: "relative" }}>
            Prêt à créer ton build ?
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: "0 0 28px", fontFamily: "var(--fb)", position: "relative" }}>
            Théorycraft ta combinaison parfaite de race, classes et augments.
          </p>
          <button onClick={() => setPage("builds")} style={{
            padding: "16px 48px", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`,
            color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer",
            fontFamily: "var(--fd)", boxShadow: `0 8px 30px ${G.accent}30`,
            transition: "all 0.3s", position: "relative",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            ⚔️ Lancer le Build Creator
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "24px 32px", borderTop: `1px solid ${G.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ fontSize: 13, color: G.muted, fontFamily: "var(--fb)" }}>
          CielDeVignis — Serveur Hytale PvE
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="https://discord.gg/hfMeu9KWsh" target="_blank" rel="noopener" style={{ color: G.muted, textDecoration: "none", fontSize: 13, fontFamily: "var(--fb)", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.accent}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}
          >Discord</a>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// WIKI PAGE (placeholder)
// ═══════════════════════════════════════════
function WikiPage() {
  const sections = [
    { icon: "🐉", title: "Monstres", desc: "Tous les mobs, leurs niveaux, drops et patterns d'attaque.", color: G.accent2, count: "Bientôt" },
    { icon: "🗡️", title: "Armes", desc: "Épées, bâtons, arcs, dagues — stats et bonus de classe.", color: G.accent, count: "Bientôt" },
    { icon: "🛡️", title: "Armures", desc: "Toutes les protections disponibles et leurs effets.", color: G.blue, count: "Bientôt" },
    { icon: "⚗️", title: "Crafts", desc: "Recettes, matériaux requis et lieux de craft.", color: G.teal, count: "Bientôt" },
    { icon: "🏰", title: "Donjons", desc: "Guide des donjons, boss, mécaniques et récompenses.", color: G.purple, count: "Bientôt" },
    { icon: "💠", title: "Augments", desc: "Tous les augments détaillés : effets, scaling, synergies.", color: G.pink, count: "55" },
  ];
  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 8px" }}>📖 Wiki</h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 40px", fontFamily: "var(--fb)" }}>Base de connaissances de CielDeVignis</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {sections.map((s, i) => (
          <div key={s.title} style={{
            background: `linear-gradient(145deg, ${G.card}, ${s.color}06)`,
            border: `1px solid ${s.color}20`, borderRadius: 18, padding: 24,
            transition: "all 0.3s", animation: `fadeSlideUp 0.5s ease ${0.08 * i}s both`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}20`; e.currentTarget.style.transform = ""; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: "4px 12px", borderRadius: 20 }}>{s.count}</span>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)" }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: G.muted, lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: 24, background: `${G.accent}08`, borderRadius: 16, border: `1px solid ${G.accent}20`, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, color: G.muted }}>Le wiki sera progressivement rempli avec les données de tes mods. Envoie-moi les fichiers quand tu es prêt !</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BUILD CREATOR PAGE (wrapper)
// ═══════════════════════════════════════════
function BuildsPage() {
  return (
    <div style={{ position: "relative", zIndex: 1, paddingTop: 72 }}>
      <BuildCreator />
    </div>
  );
}

// ═══════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Cinzel:wght@700;900&display=swap');
      :root {
        --fd: 'Cinzel', serif;
        --fb: 'Outfit', sans-serif;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${G.bg}; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: ${G.bg}; }
      ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: ${G.muted}; }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
      @keyframes scrollDot {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
function SiteApp() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "var(--fb)" }}>
      <GlobalStyles />
      <Particles />
      <Navbar page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "builds" && <BuildsPage />}
      {page === "wiki" && <WikiPage />}
    </div>
  );
}


// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════
export default SiteApp;
