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
// ═══════════════════════════════════════════
// RACE EVOLUTIONS — extracted from YML files
// ═══════════════════════════════════════════
const EVOLUTIONS={"ascended":{"name":"Ascended","desc":"Empowered by ancient sun rituals, Ascended are godlike warriors with immense physical might and durability.","stage":"base","prestige":0,"attrs":{"life_force":98,"strength":1.02,"defense":0.94,"haste":0.9,"precision":14.0,"ferocity":7.0,"stamina":10.5,"flow":14.0,"sorcery":0.89,"discipline":0},"innate":{"life_force":0.81},"passives":[{"name":"Special Charge","desc":"+70% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+140% exec sous 15%. CD 45s","icon":"💀","color":"#e74c3c"}],"next":["ascended_hero","ascended_magus"]},"ascended_archon":{"name":"Ascended Archon","desc":"A celestial sovereign whose divine sorcery bends the battlefield to radiant judgment.","stage":"tier_2","prestige":5,"attrs":{"life_force":210,"strength":1.15,"defense":1.16,"haste":1.03,"precision":24.0,"ferocity":20.0,"stamina":18.0,"flow":38.0,"sorcery":1.525,"discipline":0},"innate":{"life_force":1.9},"passives":[{"name":"Special Charge","desc":"+140% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"2.5% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+250% exec sous 22%. CD 36s","icon":"💀","color":"#e74c3c"}],"next":["ascended_divinity"],"minSk":{"life_force":250,"sorcery":250}},"ascended_divinity":{"name":"Ascended Divinity","desc":"The ultimate Ascended state, uniting immortal vitality with both divine might and transcendent sorcery.","stage":"final","prestige":10,"attrs":{"life_force":282.5,"strength":1.65,"defense":1.36,"haste":1.09,"precision":34,"ferocity":28.5,"stamina":23.5,"flow":44,"sorcery":1.65,"discipline":0},"innate":{"life_force":2.4},"passives":[{"name":"Special Charge","desc":"+155% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"2.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+300% exec sous 25%. CD 30s","icon":"💀","color":"#e74c3c"}],"next":[],"minSk":{"life_force":600},"minAny":[{"strength":400},{"sorcery":400}],"reqForms":["ascended_titan","ascended_archon"]},"ascended_hero":{"name":"Ascended Hero","desc":"An Ascended champion who turns divine vitality into overwhelming martial power.","stage":"tier_1","prestige":2,"attrs":{"life_force":155,"strength":1.32,"defense":1.14,"haste":0.97,"precision":22.0,"ferocity":15.0,"stamina":16.0,"flow":18.0,"sorcery":1.0,"discipline":0},"innate":{"life_force":1.4},"passives":[{"name":"Special Charge","desc":"+110% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+220% exec sous 18%. CD 40s","icon":"💀","color":"#e74c3c"}],"next":["ascended_titan"],"minSk":{"life_force":125,"strength":125}},"ascended_magus":{"name":"Ascended Magus","desc":"An Ascended adept who channels divine radiance through disciplined sorcery.","stage":"tier_1","prestige":2,"attrs":{"life_force":150,"strength":1.1,"defense":1.08,"haste":0.97,"precision":18.0,"ferocity":14.0,"stamina":15.0,"flow":28.0,"sorcery":1.36,"discipline":0},"innate":{"life_force":1.35},"passives":[{"name":"Special Charge","desc":"+114% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"1.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+190% exec sous 20%. CD 42s","icon":"💀","color":"#e74c3c"}],"next":["ascended_archon"],"minSk":{"life_force":125,"sorcery":125}},"ascended_titan":{"name":"Ascended Titan","desc":"A towering paragon of divine force whose body and will crush mortal resistance.","stage":"tier_2","prestige":5,"attrs":{"life_force":220,"strength":1.525,"defense":1.26,"haste":1.03,"precision":28.0,"ferocity":22.0,"stamina":20.0,"flow":20.0,"sorcery":1.08,"discipline":0},"innate":{"life_force":2.0},"passives":[{"name":"Special Charge","desc":"+135% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+270% exec sous 20%. CD 34s","icon":"💀","color":"#e74c3c"}],"next":["ascended_divinity"],"minSk":{"life_force":250,"strength":250}},"celestial":{"name":"Celestial","desc":"Ancient cosmic entities born of starlight, Celestials wield immense magical power and unparalleled resilience.","stage":"base","prestige":0,"attrs":{"life_force":59,"strength":0.77,"defense":0.94,"haste":0.875,"precision":3.5,"ferocity":28.0,"stamina":5.6,"flow":24.5,"sorcery":1.06,"discipline":0},"innate":{"life_force":0.65},"passives":[{"name":"Mana Regen","desc":"1.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+70% charge spéciale","icon":"⚡","color":"#f39c12"}],"next":["celestial_adept","celestial_arcanum"]},"celestial_adept":{"name":"Celestial Adept","desc":"A Celestial who channels their cosmic nature into an endless wellspring of arcane flow, sustaining magic far beyond normal limits.","stage":"tier_1","prestige":2,"attrs":{"life_force":80,"strength":0.82,"defense":0.98,"haste":0.93,"precision":4.5,"ferocity":30.0,"stamina":6.5,"flow":42.0,"sorcery":1.22,"discipline":0},"innate":{"life_force":0.9},"passives":[{"name":"Mana Regen","desc":"2.5% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+80% charge spéciale","icon":"⚡","color":"#f39c12"}],"next":["celestial_catalyst"],"minSk":{"sorcery":125,"flow":125}},"celestial_arcanum":{"name":"Celestial Arcanum","desc":"A Celestial who weaponizes cosmic precision into devastating critical bursts, turning every spell into a potential killing blow.","stage":"tier_1","prestige":2,"attrs":{"life_force":80,"strength":0.82,"defense":0.98,"haste":0.93,"precision":7.0,"ferocity":52.0,"stamina":6.5,"flow":28.0,"sorcery":1.22,"discipline":0},"innate":{"life_force":0.9},"passives":[{"name":"Special Charge","desc":"+100% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+150% exec sous 20%. CD 45s","icon":"💀","color":"#e74c3c"}],"next":["celestial_overlord"],"minSk":{"sorcery":125,"ferocity":125}},"celestial_catalyst":{"name":"Celestial Catalyst","desc":"A Celestial Adept who has mastered the art of infinite cosmic flow, converting mana into a boundless engine of arcane destruction.","stage":"tier_2","prestige":5,"attrs":{"life_force":110,"strength":0.88,"defense":1.05,"haste":0.99,"precision":6.0,"ferocity":38.0,"stamina":9.0,"flow":55.0,"sorcery":1.38,"discipline":0},"innate":{"life_force":1.4},"passives":[{"name":"Mana Regen","desc":"3.5% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+120% charge spéciale","icon":"⚡","color":"#f39c12"}],"next":["celestial_supreme"],"minSk":{"sorcery":250,"flow":250}},"celestial_overlord":{"name":"Celestial Overlord","desc":"A Celestial Arcanum who has refined cosmic precision to its apex, shattering enemies with catastrophic critical strikes.","stage":"tier_2","prestige":5,"attrs":{"life_force":110,"strength":0.88,"defense":1.05,"haste":0.99,"precision":14.0,"ferocity":75.0,"stamina":9.0,"flow":32.0,"sorcery":1.38,"discipline":0},"innate":{"life_force":1.4},"passives":[{"name":"Special Charge","desc":"+140% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+220% exec sous 22%. CD 38s","icon":"💀","color":"#e74c3c"}],"next":["celestial_supreme"],"minSk":{"sorcery":250,"ferocity":250}},"celestial_supreme":{"name":"Celestial Supreme","desc":"The pinnacle of Celestial ascension — a cosmic sovereign who commands both infinite arcane flow and supreme critical devastation.","stage":"final","prestige":10,"attrs":{"life_force":140,"strength":0.94,"defense":1.12,"haste":1.05,"precision":18.2,"ferocity":90.5,"stamina":11.5,"flow":63.5,"sorcery":1.8,"discipline":0},"innate":{"life_force":2.0},"passives":[{"name":"Mana Regen","desc":"4.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+160% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+280% exec sous 25%. CD 30s","icon":"💀","color":"#e74c3c"}],"next":[],"minSk":{"sorcery":350,"flow":250,"ferocity":400},"reqForms":["celestial_catalyst","celestial_overlord"]},"darkin":{"name":"Darkin","desc":"Twisted Ascended bound to cursed weapons, Darkin thrive on carnage and devastating critical strikes.","stage":"base","prestige":0,"attrs":{"life_force":65,"strength":1.11,"defense":0.68,"haste":1.05,"precision":3.5,"ferocity":52.5,"stamina":8.8,"flow":7.0,"sorcery":0.85,"discipline":0},"innate":{"life_force":1.05},"passives":[{"name":"Healing Bonus","desc":"+50% soins","icon":"💚","color":"#2ed573"},{"name":"Ravenous Strike","desc":"3.5/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":["darkin_blade","darkin_bloodweaver"]},"darkin_blade":{"name":"Darkin Blade","desc":"A Darkin who sharpened their carnage into direct martial supremacy.","stage":"tier_1","prestige":2,"attrs":{"life_force":100,"strength":1.35,"defense":0.82,"haste":1.075,"precision":5.0,"ferocity":80.0,"stamina":13.0,"flow":9.0,"sorcery":0.95,"discipline":0},"innate":{"life_force":1.5},"passives":[{"name":"Healing Bonus","desc":"+65% soins","icon":"💚","color":"#2ed573"},{"name":"Ravenous Strike","desc":"5.5/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":["darkin_warlord"],"minSk":{"strength":150,"life_force":100}},"darkin_bloodlord":{"name":"Darkin Bloodlord","desc":"An ascended blood sovereign whose sorcery overwhelms flesh and will.","stage":"tier_2","prestige":5,"attrs":{"life_force":115,"strength":0.95,"defense":0.85,"haste":1.1,"precision":8.0,"ferocity":70.0,"stamina":12.0,"flow":24.0,"sorcery":1.55,"discipline":0},"innate":{"life_force":1.9},"passives":[{"name":"Healing Bonus","desc":"+80% soins","icon":"💚","color":"#2ed573"},{"name":"Mana Regen","desc":"2.5% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Ravenous Strike","desc":"6.5/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":["darkin_unbound"],"minSk":{"sorcery":250,"ferocity":150,"life_force":100}},"darkin_bloodweaver":{"name":"Darkin Bloodweaver","desc":"A blood-mage Darkin who bends life essence into cursed sorcery.","stage":"tier_1","prestige":2,"attrs":{"life_force":95,"strength":1.05,"defense":0.78,"haste":1.075,"precision":6.0,"ferocity":60.0,"stamina":11.0,"flow":16.0,"sorcery":1.35,"discipline":0},"innate":{"life_force":1.4},"passives":[{"name":"Healing Bonus","desc":"+65% soins","icon":"💚","color":"#2ed573"},{"name":"Mana Regen","desc":"1.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Ravenous Strike","desc":"5.0/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":["darkin_bloodlord"],"minSk":{"sorcery":150,"life_force":100}},"darkin_unbound":{"name":"Darkin Unbound","desc":"A transcendent Darkin who fuses warlord brutality with blood sorcery mastery.","stage":"final","prestige":10,"attrs":{"life_force":150,"strength":1.7,"defense":1.05,"haste":1.125,"precision":10,"ferocity":115,"stamina":18,"flow":28.5,"sorcery":1.7,"discipline":0},"innate":{"life_force":2.1},"passives":[{"name":"Healing Bonus","desc":"+100% soins","icon":"💚","color":"#2ed573"},{"name":"Mana Regen","desc":"2.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Ravenous Strike","desc":"7.5/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":[],"minSk":{"life_force":300,"ferocity":300},"minAny":[{"strength":400},{"sorcery":400}],"reqForms":["darkin_warlord","darkin_bloodlord"]},"darkin_warlord":{"name":"Darkin Warlord","desc":"A supreme war tyrant whose blood-fueled power dominates the battlefield.","stage":"tier_2","prestige":5,"attrs":{"life_force":125,"strength":1.55,"defense":0.95,"haste":1.1,"precision":7.0,"ferocity":100.0,"stamina":16.0,"flow":10.0,"sorcery":0.9,"discipline":0},"innate":{"life_force":2.0},"passives":[{"name":"Healing Bonus","desc":"+80% soins","icon":"💚","color":"#2ed573"},{"name":"Ravenous Strike","desc":"7.0/coup + 5.3% FOR + 5.3% SOR","icon":"🩸","color":"#e74c3c"}],"next":["darkin_unbound"],"minSk":{"strength":250,"ferocity":150,"life_force":100}},"dragonborn":{"name":"Dragonborn","desc":"Born of draconic blood, Dragonborn possess immense strength, resilience, and overwhelming presence in battle.","stage":"base","prestige":0,"attrs":{"life_force":114,"strength":1.02,"defense":1.02,"haste":0.925,"precision":3.5,"ferocity":42.0,"stamina":10.5,"flow":10.5,"sorcery":0.93,"discipline":0},"innate":{"life_force":0.98},"passives":[{"name":"Swiftness","desc":"+5.3%/kill, 8x (max +42%)","icon":"💨","color":"#a29bfe"},{"name":"Second Wind","desc":"32.5% PV sous 20%. CD 60s","icon":"💚","color":"#2ed573"}],"next":["dragonborn_guardian","dragonborn_marauder"]},"dragonborn_alpha":{"name":"Alpha Dragon","desc":"The pinnacle of draconic evolution — an Alpha Dragon who commands both the unbreakable resilience of a sentinel and the devastating ferocity of a tyrant.","stage":"final","prestige":10,"attrs":{"life_force":250,"strength":1.245,"defense":1.54,"haste":1.15,"precision":11,"ferocity":104,"stamina":20,"flow":13.8,"sorcery":1.14,"discipline":0},"innate":{"life_force":2.5},"passives":[{"name":"Second Wind","desc":"65.0% PV sous 30%. CD 35s","icon":"💚","color":"#2ed573"},{"name":"Swiftness","desc":"+9.0%/kill, 8x (max +72%)","icon":"💨","color":"#a29bfe"}],"next":[],"minSk":{"life_force":400,"ferocity":300},"minAny":[{"strength":300},{"sorcery":300}],"reqForms":["dragonborn_sentinel","dragonborn_tyrant"]},"dragonborn_guardian":{"name":"Dragon Guardian","desc":"A Dragonborn who channels their draconic resilience into an unbreakable fortress of scales and vitality.","stage":"tier_1","prestige":2,"attrs":{"life_force":155,"strength":1.05,"defense":1.22,"haste":1.0,"precision":3.5,"ferocity":32.0,"stamina":13.0,"flow":10.0,"sorcery":0.92,"discipline":0},"innate":{"life_force":1.5},"passives":[{"name":"Second Wind","desc":"42.0% PV sous 25%. CD 50s","icon":"💚","color":"#2ed573"},{"name":"Swiftness","desc":"+4.0%/kill, 8x (max +32%)","icon":"💨","color":"#a29bfe"}],"next":["dragonborn_sentinel"],"minSk":{"life_force":125,"stamina":125}},"dragonborn_marauder":{"name":"Drake Marauder","desc":"A Dragonborn who sharpens their draconic ferocity into relentless critical devastation, striking with the force of a predator.","stage":"tier_1","prestige":2,"attrs":{"life_force":125,"strength":1.08,"defense":0.96,"haste":1.0,"precision":5.5,"ferocity":65.0,"stamina":11.0,"flow":10.5,"sorcery":0.98,"discipline":0},"innate":{"life_force":1.2},"passives":[{"name":"Swiftness","desc":"+6.5%/kill, 8x (max +52%)","icon":"💨","color":"#a29bfe"},{"name":"Second Wind","desc":"28.0% PV sous 20%. CD 65s","icon":"💚","color":"#2ed573"}],"next":["dragonborn_tyrant"],"minSk":{"ferocity":125},"minAny":[{"strength":125},{"sorcery":125}]},"dragonborn_sentinel":{"name":"Dragon Sentinel","desc":"A Dragon Guardian who has mastered the art of draconic endurance, becoming an immovable wall of scales and regenerative power.","stage":"tier_2","prestige":5,"attrs":{"life_force":210,"strength":1.08,"defense":1.42,"haste":1.075,"precision":4.0,"ferocity":35.0,"stamina":17.0,"flow":12.0,"sorcery":0.94,"discipline":0},"innate":{"life_force":2.0},"passives":[{"name":"Second Wind","desc":"58.0% PV sous 30%. CD 40s","icon":"💚","color":"#2ed573"},{"name":"Swiftness","desc":"+3.5%/kill, 8x (max +28%)","icon":"💨","color":"#a29bfe"}],"next":["dragonborn_alpha"],"minSk":{"life_force":250,"stamina":250}},"dragonborn_tyrant":{"name":"Dragon Tyrant","desc":"A Drake Marauder who has ascended into apex predator status, critical strikes triggering with terrifying frequency and devastation.","stage":"tier_2","prestige":5,"attrs":{"life_force":150,"strength":1.18,"defense":1.0,"haste":1.075,"precision":9.0,"ferocity":90.0,"stamina":13.0,"flow":12.0,"sorcery":1.08,"discipline":0},"innate":{"life_force":1.6},"passives":[{"name":"Swiftness","desc":"+8.5%/kill, 8x (max +68%)","icon":"💨","color":"#a29bfe"},{"name":"Second Wind","desc":"32.0% PV sous 20%. CD 60s","icon":"💚","color":"#2ed573"}],"next":["dragonborn_alpha"],"minSk":{"ferocity":250},"minAny":[{"strength":250},{"sorcery":250}]},"golem":{"name":"Golem","desc":"Artificial beings of immense durability, Golems are slow but nearly indestructible.","stage":"base","prestige":0,"attrs":{"life_force":195,"strength":0.6,"defense":1.11,"haste":0.6,"precision":0.0,"ferocity":0.0,"stamina":14.0,"flow":3.5,"sorcery":0.68,"discipline":0},"innate":{"life_force":1.3},"passives":[{"name":"Retaliation","desc":"18% renvoi sur 5s. CD 25s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"32.5% PV sous 20%. CD 60s","icon":"💚","color":"#2ed573"}],"next":["golem_sentinel","golem_crusher"]},"golem_colossus":{"name":"Golem Colossus","desc":"A towering bastion of living stone that converts every blow into inevitable counterforce.","stage":"tier_2","prestige":5,"attrs":{"life_force":420,"strength":0.82,"defense":1.9,"haste":0.73,"precision":4.0,"ferocity":8.0,"stamina":28.0,"flow":8.0,"sorcery":0.95,"discipline":0},"innate":{"life_force":3.0},"passives":[{"name":"Retaliation","desc":"38% renvoi sur 5s. CD 18s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"65.0% PV sous 30%. CD 50s","icon":"💚","color":"#2ed573"}],"next":["golem_prime"],"minSk":{"life_force":250,"stamina":250}},"golem_crusher":{"name":"Golem Crusher","desc":"A war-forged golem frame tuned for violent impact and relentless stamina-fueled pressure.","stage":"tier_1","prestige":2,"attrs":{"life_force":300,"strength":1.1,"defense":1.35,"haste":0.67,"precision":8.0,"ferocity":18.0,"stamina":24.0,"flow":12.0,"sorcery":1.1,"discipline":0},"innate":{"life_force":2.2},"passives":[{"name":"Retaliation","desc":"24% renvoi sur 5s. CD 20s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"50.0% PV sous 20%. CD 50s","icon":"💚","color":"#2ed573"}],"next":["golem_ravager"],"minSk":{"stamina":125},"minAny":[{"strength":125},{"sorcery":125}]},"golem_prime":{"name":"Golem Prime","desc":"The perfected golem state, unifying supreme defense with catastrophic endurance-driven offense.","stage":"final","prestige":10,"attrs":{"life_force":510,"strength":1.45,"defense":2.15,"haste":0.79,"precision":15,"ferocity":41,"stamina":36,"flow":19,"sorcery":1.45,"discipline":0},"innate":{"life_force":3.5},"passives":[{"name":"Retaliation","desc":"45% renvoi sur 5s. CD 14s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"75.0% PV sous 30%. CD 40s","icon":"💚","color":"#2ed573"}],"next":[],"minSk":{"life_force":650,"stamina":150},"minAny":[{"strength":200},{"sorcery":200}],"reqForms":["golem_colossus","golem_ravager"]},"golem_ravager":{"name":"Golem Ravager","desc":"An annihilation-class golem that fuses crushing force with inexhaustible battle endurance.","stage":"tier_2","prestige":5,"attrs":{"life_force":380,"strength":1.36,"defense":1.5,"haste":0.73,"precision":12.0,"ferocity":32.0,"stamina":30.0,"flow":16.0,"sorcery":1.36,"discipline":0},"innate":{"life_force":2.7},"passives":[{"name":"Retaliation","desc":"32% renvoi sur 5s. CD 17s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"60.0% PV sous 25%. CD 45s","icon":"💚","color":"#2ed573"}],"next":["golem_prime"],"minSk":{"stamina":250},"minAny":[{"strength":250},{"sorcery":250}]},"golem_sentinel":{"name":"Golem Sentinel","desc":"A fortified golem form focused on absolute mitigation and unshakable front-line control.","stage":"tier_1","prestige":2,"attrs":{"life_force":320,"strength":0.72,"defense":1.55,"haste":0.67,"precision":2.0,"ferocity":4.0,"stamina":22.0,"flow":6.0,"sorcery":0.82,"discipline":0},"innate":{"life_force":2.2},"passives":[{"name":"Retaliation","desc":"30% renvoi sur 5s. CD 22s","icon":"🔄","color":"#e17055"},{"name":"Second Wind","desc":"55.0% PV sous 25%. CD 55s","icon":"💚","color":"#2ed573"}],"next":["golem_colossus"],"minSk":{"life_force":125,"stamina":125}},"human":{"name":"Human","desc":"Versatile and ambitious, humans are known for their adaptability and determination.","stage":"base","prestige":0,"attrs":{"life_force":98,"strength":0.85,"defense":0.85,"haste":1.0,"precision":7.0,"ferocity":35.0,"stamina":7.0,"flow":14.0,"discipline":0},"innate":{"life_force":1.3},"passives":[{"name":"XP Bonus","desc":"+50% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"3.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"56% endurance sous 20%. CD 45s","icon":"⚡","color":"#f39c12"}],"next":["human_explorer","human_raider"]},"human_conqueror":{"name":"Human Conqueror","desc":"A battle-forged warleader who amplifies critical devastation through strength or sorcery mastery.","stage":"tier_2","prestige":5,"attrs":{"life_force":165,"strength":1.2,"defense":1.0,"haste":1.08,"precision":13.0,"ferocity":84.0,"stamina":14.0,"flow":22.0,"discipline":0},"innate":{"life_force":2.1},"passives":[{"name":"XP Bonus","desc":"+110% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"4.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"90% endurance sous 20%. CD 38s","icon":"⚡","color":"#f39c12"}],"next":["human_emperor"],"minSk":{"ferocity":250},"minAny":[{"strength":250},{"sorcery":250}]},"human_emperor":{"name":"Human Emperor","desc":"The ultimate human sovereign, uniting expedition mastery with conquering might into absolute dominance.","stage":"final","prestige":10,"attrs":{"life_force":207.5,"strength":1.285,"defense":1.085,"haste":1.12,"precision":16,"ferocity":97.5,"stamina":17,"flow":28,"discipline":0},"innate":{"life_force":2.6},"passives":[{"name":"XP Bonus","desc":"+150% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"6.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"100% endurance sous 25%. CD 32s","icon":"⚡","color":"#f39c12"}],"next":[],"minSk":{"discipline":200,"haste":150,"ferocity":400},"minAny":[{"strength":250},{"sorcery":250}],"reqForms":["human_voyager","human_conqueror"]},"human_explorer":{"name":"Human Explorer","desc":"A disciplined trailblazer who survives harsh frontiers through relentless pacing and tactical precision.","stage":"tier_1","prestige":2,"attrs":{"life_force":130,"strength":0.95,"defense":0.95,"haste":1.04,"precision":9.0,"ferocity":40.0,"stamina":11.0,"flow":20.0,"discipline":0},"innate":{"life_force":1.8},"passives":[{"name":"XP Bonus","desc":"+85% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"4.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"72% endurance sous 20%. CD 42s","icon":"⚡","color":"#f39c12"}],"next":["human_voyager"],"minSk":{"discipline":125,"haste":125}},"human_raider":{"name":"Human Raider","desc":"A ruthless combat specialist who turns raw force or arcane talent into devastating critical damage.","stage":"tier_1","prestige":2,"attrs":{"life_force":130,"strength":1.08,"defense":0.94,"haste":1.04,"precision":10.0,"ferocity":62.0,"stamina":11.0,"flow":18.0,"discipline":0},"innate":{"life_force":1.7},"passives":[{"name":"XP Bonus","desc":"+80% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"3.5% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"70% endurance sous 20%. CD 42s","icon":"⚡","color":"#f39c12"}],"next":["human_conqueror"],"minSk":{"ferocity":125},"minAny":[{"strength":125},{"sorcery":125}]},"human_voyager":{"name":"Human Voyager","desc":"A master adventurer whose discipline and speed let them outlast any campaign and outmaneuver any threat.","stage":"tier_2","prestige":5,"attrs":{"life_force":170,"strength":1.0,"defense":1.02,"haste":1.08,"precision":12.0,"ferocity":45.0,"stamina":14.0,"flow":24.0,"discipline":0},"innate":{"life_force":2.2},"passives":[{"name":"XP Bonus","desc":"+120% XP","icon":"📖","color":"#fed330"},{"name":"Health Regen","desc":"5.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Adrenaline","desc":"95% endurance sous 20%. CD 38s","icon":"⚡","color":"#f39c12"}],"next":["human_emperor"],"minSk":{"discipline":200,"haste":150,"stamina":150}},"iceborn":{"name":"Iceborn","desc":"Empowered by eternal frost, Iceborn warriors are durable, relentless, and resistant to harm.","stage":"base","prestige":0,"attrs":{"life_force":94,"strength":1.06,"defense":0.94,"haste":0.9,"precision":10.5,"ferocity":21.0,"stamina":14.0,"flow":7.0,"sorcery":0.85,"discipline":0},"innate":{"life_force":1.14},"passives":[{"name":"Health Regen","desc":"2.1% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Berzerker","desc":"+14% dégâts max à 35% PV","icon":"🔥","color":"#e74c3c"}],"next":["iceborn_guardian","iceborn_berzerker"]},"iceborn_berzerker":{"name":"Iceborn Berzerker","desc":"A frenzied Iceborn executioner who turns precision and ferocity into brutal critical slaughter.","stage":"tier_1","prestige":2,"attrs":{"life_force":145,"strength":1.22,"defense":1.0,"haste":0.98,"precision":24.0,"ferocity":50.0,"stamina":18.0,"flow":10.0,"sorcery":0.96,"discipline":0},"innate":{"life_force":1.85},"passives":[{"name":"Health Regen","desc":"3.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Berzerker","desc":"+28% dégâts max à 35% PV","icon":"🔥","color":"#e74c3c"}],"next":["iceborn_ragnarok"],"minSk":{"ferocity":150,"stamina":100}},"iceborn_frostlord":{"name":"Iceborn Frostlord","desc":"The absolute ruler of frozen war, fusing titan endurance with ragnarok-level critical annihilation.","stage":"final","prestige":10,"attrs":{"life_force":292.5,"strength":1.465,"defense":1.37,"haste":1.16,"precision":43.5,"ferocity":99,"stamina":37,"flow":17.5,"sorcery":1.135,"discipline":0},"innate":{"life_force":2.9},"passives":[{"name":"Health Regen","desc":"5.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Berzerker","desc":"+45% dégâts max à 35% PV","icon":"🔥","color":"#e74c3c"},{"name":"Retaliation","desc":"34% renvoi sur 5s. CD 20s","icon":"🔄","color":"#e17055"}],"next":[],"minSk":{"life_force":400,"stamina":100,"ferocity":500},"reqForms":["iceborn_titan","iceborn_ragnarok"]},"iceborn_guardian":{"name":"Iceborn Guardian","desc":"A glacial bulwark who endures impossible punishment through frozen vitality and steadfast stamina.","stage":"tier_1","prestige":2,"attrs":{"life_force":160,"strength":1.12,"defense":1.08,"haste":0.98,"precision":12.0,"ferocity":24.0,"stamina":22.0,"flow":9.0,"sorcery":0.88,"discipline":0},"innate":{"life_force":1.9},"passives":[{"name":"Health Regen","desc":"3.2% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Retaliation","desc":"20% renvoi sur 5s. CD 25s","icon":"🔄","color":"#e17055"}],"next":["iceborn_titan"],"minSk":{"life_force":125,"stamina":125}},"iceborn_ragnarok":{"name":"Iceborn Ragnarok","desc":"A cataclysmic Iceborn warform where each critical strike echoes like a shattering avalanche.","stage":"tier_2","prestige":5,"attrs":{"life_force":200,"strength":1.35,"defense":1.1,"haste":1.07,"precision":36.0,"ferocity":80.0,"stamina":24.0,"flow":14.0,"sorcery":1.05,"discipline":0},"innate":{"life_force":2.2},"passives":[{"name":"Health Regen","desc":"3.8% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Berzerker","desc":"+38% dégâts max à 35% PV","icon":"🔥","color":"#e74c3c"}],"next":["iceborn_frostlord"],"minSk":{"ferocity":350,"stamina":150}},"iceborn_titan":{"name":"Iceborn Titan","desc":"An unstoppable mountain of ice and wrath, advancing through battle with inexhaustible endurance.","stage":"tier_2","prestige":5,"attrs":{"life_force":230,"strength":1.22,"defense":1.24,"haste":1.07,"precision":15.0,"ferocity":32.0,"stamina":30.0,"flow":12.0,"sorcery":0.96,"discipline":0},"innate":{"life_force":2.35},"passives":[{"name":"Health Regen","desc":"4.2% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Retaliation","desc":"30% renvoi sur 5s. CD 22s","icon":"🔄","color":"#e17055"}],"next":["iceborn_frostlord"],"minSk":{"life_force":250,"stamina":250}},"vastaya":{"name":"Vastaya","desc":"Mysterious and agile, Vastaya are a race of animalistic humanoids with a deep connection to nature.","stage":"base","prestige":0,"attrs":{"life_force":81,"strength":0.98,"defense":0.83,"haste":1.1,"precision":10.5,"ferocity":28.0,"stamina":7.0,"flow":21.0,"sorcery":0.98,"discipline":0},"innate":{"life_force":0.65},"passives":[{"name":"XP Bonus","desc":"+35% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+7.0%/kill, 8x (max +56%)","icon":"💨","color":"#a29bfe"}],"next":["vastaya_hunter","vastaya_mystic"]},"vastaya_apex":{"name":"Vastaya Apex","desc":"The ultimate Vastaya state where primal might, spirit craft, and impossible speed merge into one apex form.","stage":"final","prestige":10,"attrs":{"life_force":220,"strength":1.79,"defense":1.16,"haste":1.25,"precision":31,"ferocity":93,"stamina":19,"flow":57,"sorcery":1.825,"discipline":0},"innate":{"life_force":2.2},"passives":[{"name":"XP Bonus","desc":"+85% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+24.0%/kill, 8x (max +192%)","icon":"💨","color":"#a29bfe"}],"next":[],"minSk":{"haste":200,"discipline":100,"ferocity":300},"minAny":[{"strength":400},{"sorcery":400}],"reqForms":["vastaya_beastlord","vastaya_spiritbinder"]},"vastaya_beastlord":{"name":"Vastaya Beastlord","desc":"An apex pack sovereign whose feral speed and strength overwhelm everything in reach.","stage":"tier_2","prestige":5,"attrs":{"life_force":175,"strength":1.62,"defense":1.08,"haste":1.2,"precision":22.0,"ferocity":75.0,"stamina":16.0,"flow":30.0,"sorcery":1.05,"discipline":0},"innate":{"life_force":1.8},"passives":[{"name":"XP Bonus","desc":"+70% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+20.0%/kill, 8x (max +160%)","icon":"💨","color":"#a29bfe"}],"next":["vastaya_apex"],"minSk":{"strength":250,"haste":250}},"vastaya_hunter":{"name":"Vastaya Hunter","desc":"A predatory Vastaya path that hones speed and lethal strikes into instinctive supremacy.","stage":"tier_1","prestige":2,"attrs":{"life_force":130,"strength":1.34,"defense":1.0,"haste":1.15,"precision":18.0,"ferocity":55.0,"stamina":13.0,"flow":28.0,"sorcery":1.0,"discipline":0},"innate":{"life_force":1.2},"passives":[{"name":"XP Bonus","desc":"+60% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+14.0%/kill, 8x (max +112%)","icon":"💨","color":"#a29bfe"}],"next":["vastaya_beastlord"],"minSk":{"strength":125,"haste":125}},"vastaya_mystic":{"name":"Vastaya Mystic","desc":"A spirit-tuned Vastaya who blends uncanny speed with precise nature sorcery.","stage":"tier_1","prestige":2,"attrs":{"life_force":125,"strength":1.12,"defense":0.98,"haste":1.15,"precision":20.0,"ferocity":42.0,"stamina":12.0,"flow":38.0,"sorcery":1.38,"discipline":0},"innate":{"life_force":1.15},"passives":[{"name":"XP Bonus","desc":"+60% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+14.0%/kill, 8x (max +112%)","icon":"💨","color":"#a29bfe"}],"next":["vastaya_spiritbinder"],"minSk":{"sorcery":125,"haste":125}},"vastaya_spiritbinder":{"name":"Vastaya Spiritbinder","desc":"A transcendent channeler bound to ancestral spirits, weaving velocity and arcane instinct as one.","stage":"tier_2","prestige":5,"attrs":{"life_force":170,"strength":1.18,"defense":1.06,"haste":1.2,"precision":26.0,"ferocity":58.0,"stamina":15.0,"flow":50.0,"sorcery":1.66,"discipline":0},"innate":{"life_force":1.75},"passives":[{"name":"XP Bonus","desc":"+70% XP","icon":"📖","color":"#fed330"},{"name":"Swiftness","desc":"+20.0%/kill, 8x (max +160%)","icon":"💨","color":"#a29bfe"}],"next":["vastaya_apex"],"minSk":{"sorcery":250,"haste":250}},"voidborn":{"name":"Voidborn","desc":"Twisted by the Void, Voidborn adapt rapidly, gaining strength through chaos and corruption.","stage":"base","prestige":0,"attrs":{"life_force":98,"strength":0.98,"defense":0.85,"haste":0.9,"precision":7.0,"ferocity":35.0,"stamina":8.4,"flow":28.0,"sorcery":0.98,"discipline":0},"innate":{"life_force":1.14},"passives":[{"name":"Mana Regen","desc":"1.4% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+35% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"18% renvoi sur 5s. CD 25s","icon":"🔄","color":"#e17055"}],"next":["voidborn_protector","voidborn_prowler"]},"voidborn_juggernaut":{"name":"Void Juggernaut","desc":"A monstrous void fortress that crushes opposition through impossible resilience and retaliatory force.","stage":"tier_2","prestige":5,"attrs":{"life_force":220,"strength":1.08,"defense":1.3,"haste":1.02,"precision":10.0,"ferocity":42.0,"stamina":15.0,"flow":42.0,"sorcery":1.08,"discipline":0},"innate":{"life_force":2.1},"passives":[{"name":"Mana Regen","desc":"2.2% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+57% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"34% renvoi sur 5s. CD 20s","icon":"🔄","color":"#e17055"}],"next":["voidborn_oblivion"],"minSk":{"life_force":250,"stamina":250}},"voidborn_oblivion":{"name":"Void Oblivion","desc":"The ultimate void incarnation, where indestructible defense and predatory destruction collapse into one form.","stage":"final","prestige":10,"attrs":{"life_force":275,"strength":1.5,"defense":1.43,"haste":1.08,"precision":16.5,"ferocity":101,"stamina":20,"flow":52,"sorcery":1.5,"discipline":0},"innate":{"life_force":2.6},"passives":[{"name":"Mana Regen","desc":"3.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+85% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"38% renvoi sur 5s. CD 18s","icon":"🔄","color":"#e17055"}],"next":[],"minSk":{"life_force":400,"ferocity":150},"minAny":[{"strength":450},{"sorcery":450}],"reqForms":["voidborn_juggernaut","voidborn_reaver"]},"voidborn_protector":{"name":"Void Protector","desc":"A Voidborn who hardens corruptive flesh into a living bulwark of abyssal endurance.","stage":"tier_1","prestige":2,"attrs":{"life_force":160,"strength":1.02,"defense":1.12,"haste":0.96,"precision":8.0,"ferocity":34.0,"stamina":11.0,"flow":34.0,"sorcery":1.02,"discipline":0},"innate":{"life_force":1.65},"passives":[{"name":"Mana Regen","desc":"1.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+45% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"26% renvoi sur 5s. CD 22s","icon":"🔄","color":"#e17055"}],"next":["voidborn_juggernaut"],"minSk":{"life_force":125,"stamina":125}},"voidborn_prowler":{"name":"Void Prowler","desc":"A predatory void stalker that turns ferocity and dark power into lethal crit-heavy assaults.","stage":"tier_1","prestige":2,"attrs":{"life_force":140,"strength":1.18,"defense":0.94,"haste":0.96,"precision":11.0,"ferocity":64.0,"stamina":12.0,"flow":36.0,"sorcery":1.18,"discipline":0},"innate":{"life_force":1.55},"passives":[{"name":"Mana Regen","desc":"2.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+60% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"23% renvoi sur 5s. CD 23s","icon":"🔄","color":"#e17055"}],"next":["voidborn_reaver"],"minSk":{"ferocity":125},"minAny":[{"strength":125},{"sorcery":125}]},"voidborn_reaver":{"name":"Void Reaver","desc":"An apex hunter of the abyss, blending brutal crit pressure with martial or arcane void mastery.","stage":"tier_2","prestige":5,"attrs":{"life_force":190,"strength":1.3,"defense":1.02,"haste":1.02,"precision":14.0,"ferocity":86.0,"stamina":16.0,"flow":44.0,"sorcery":1.3,"discipline":0},"innate":{"life_force":2.0},"passives":[{"name":"Mana Regen","desc":"2.4% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Special Charge","desc":"+70% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Retaliation","desc":"30% renvoi sur 5s. CD 20s","icon":"🔄","color":"#e17055"}],"next":["voidborn_oblivion"],"minSk":{"ferocity":250},"minAny":[{"strength":250},{"sorcery":250}]},"watcher":{"name":"Watcher","desc":"Eldritch entities from beyond reality, Watchers wield incomprehensible power but struggle to endure the physical world.","stage":"base","prestige":0,"attrs":{"life_force":78,"strength":0.68,"defense":0.77,"haste":0.875,"precision":10.5,"ferocity":21.0,"stamina":4.2,"flow":35.0,"sorcery":1.02,"discipline":0},"innate":{"life_force":0.49},"passives":[{"name":"Mana Regen","desc":"2.1% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"XP Bonus","desc":"+28% XP","icon":"📖","color":"#fed330"}],"next":["watcher_seer","watcher_mystic"]},"watcher_arbiter":{"name":"Watcher Arbiter","desc":"The final Watcher state, judging reality itself with boundless sustain and annihilating eldritch power.","stage":"final","prestige":10,"attrs":{"life_force":217.5,"strength":0.915,"defense":1.08,"haste":1.05,"precision":24,"ferocity":79,"stamina":10,"flow":72,"sorcery":1.75,"discipline":0},"innate":{"life_force":1.75},"passives":[{"name":"Mana Regen","desc":"4.5% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Health Regen","desc":"5.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"Final Incantation","desc":"+290% exec sous 25%. CD 30s","icon":"💀","color":"#e74c3c"},{"name":"XP Bonus","desc":"+60% XP","icon":"📖","color":"#fed330"}],"next":[],"minSk":{"flow":250,"life_force":150,"sorcery":350,"ferocity":250},"reqForms":["watcher_oracle","watcher_eldritch"]},"watcher_eldritch":{"name":"Watcher Eldritch","desc":"An apex destroyer from beyond, weaving sorcery and critical force into terrifying void eruptions.","stage":"tier_2","prestige":5,"attrs":{"life_force":145,"strength":0.85,"defense":0.9,"haste":0.99,"precision":20.0,"ferocity":66.0,"stamina":8.0,"flow":56.0,"sorcery":1.42,"discipline":0},"innate":{"life_force":1.15},"passives":[{"name":"Mana Regen","desc":"3.7% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+250% exec sous 22%. CD 34s","icon":"💀","color":"#e74c3c"},{"name":"XP Bonus","desc":"+46% XP","icon":"📖","color":"#fed330"}],"next":["watcher_arbiter"],"minSk":{"sorcery":250,"ferocity":250}},"watcher_mystic":{"name":"Watcher Mystic","desc":"A void-channeling assassin-scholar who sharpens sorcery into catastrophic critical bursts.","stage":"tier_1","prestige":2,"attrs":{"life_force":100,"strength":0.78,"defense":0.82,"haste":0.93,"precision":15.0,"ferocity":45.0,"stamina":6.0,"flow":48.0,"sorcery":1.25,"discipline":0},"innate":{"life_force":0.78},"passives":[{"name":"Mana Regen","desc":"3.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+180% exec sous 20%. CD 42s","icon":"💀","color":"#e74c3c"},{"name":"XP Bonus","desc":"+34% XP","icon":"📖","color":"#fed330"}],"next":["watcher_eldritch"],"minSk":{"sorcery":125,"ferocity":125}},"watcher_oracle":{"name":"Watcher Oracle","desc":"A prophetic Watcher whose mastery of mana and vitality lets them sustain impossible cosmic pressure.","stage":"tier_2","prestige":5,"attrs":{"life_force":170,"strength":0.8,"defense":0.98,"haste":0.99,"precision":16.0,"ferocity":30.0,"stamina":8.0,"flow":62.0,"sorcery":1.28,"discipline":0},"innate":{"life_force":1.25},"passives":[{"name":"Mana Regen","desc":"3.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Health Regen","desc":"4.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"XP Bonus","desc":"+50% XP","icon":"📖","color":"#fed330"}],"next":["watcher_arbiter"],"minSk":{"flow":250,"life_force":100,"stamina":150}},"watcher_seer":{"name":"Watcher Seer","desc":"A Watcher who bends void insight toward sustaining eldritch energies and preserving fragile flesh.","stage":"tier_1","prestige":2,"attrs":{"life_force":120,"strength":0.74,"defense":0.86,"haste":0.93,"precision":13.0,"ferocity":25.0,"stamina":6.0,"flow":50.0,"sorcery":1.12,"discipline":0},"innate":{"life_force":0.85},"passives":[{"name":"Mana Regen","desc":"3.0% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Health Regen","desc":"3.0% PV max/5s","icon":"💚","color":"#2ed573"},{"name":"XP Bonus","desc":"+38% XP","icon":"📖","color":"#fed330"}],"next":["watcher_oracle"],"minSk":{"flow":125,"life_force":125}},"wraith":{"name":"Wraith","desc":"Cursed spirits tethered to the mortal plane, Wraiths excel at swift, lethal strikes and evasion.","stage":"base","prestige":0,"attrs":{"life_force":49,"strength":1.02,"defense":0.72,"haste":1.1,"precision":7.0,"ferocity":52.5,"stamina":7.0,"flow":14.0,"sorcery":1.02,"discipline":0},"innate":{"life_force":0.49},"passives":[{"name":"Swiftness","desc":"+8.8%/kill, 8x (max +70%)","icon":"💨","color":"#a29bfe"}],"next":["wraith_whisper","wraith_fang"]},"wraith_fang":{"name":"Wraith Fang","desc":"A predatory spirit form that turns critical violence into rapid executions.","stage":"tier_1","prestige":2,"attrs":{"life_force":62,"strength":1.12,"defense":0.78,"haste":1.18,"precision":10.0,"ferocity":74.0,"stamina":10.0,"flow":18.0,"sorcery":1.12,"discipline":0},"innate":{"life_force":0.82},"passives":[{"name":"Swiftness","desc":"+11.0%/kill, 8x (max +88%)","icon":"💨","color":"#a29bfe"},{"name":"Final Incantation","desc":"+180% exec sous 20%. CD 42s","icon":"💀","color":"#e74c3c"}],"next":["wraith_reaver"],"minSk":{"ferocity":125},"minAny":[{"strength":125},{"sorcery":125}]},"wraith_phantom_king":{"name":"Phantom King","desc":"The sovereign form of cursed spirits, fusing untouchable evasion with overwhelming critical lethality.","stage":"final","prestige":10,"attrs":{"life_force":106,"strength":1.34,"defense":0.935,"haste":1.36,"precision":16,"ferocity":105,"stamina":23,"flow":33,"sorcery":1.345,"discipline":0},"innate":{"life_force":1.7},"passives":[{"name":"Swiftness","desc":"+15.0%/kill, 8x (max +120%)","icon":"💨","color":"#a29bfe"},{"name":"Adrenaline","desc":"100% endurance sous 25%. CD 30s","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+290% exec sous 25%. CD 28s","icon":"💀","color":"#e74c3c"}],"next":[],"minSk":{"haste":200,"stamina":100,"ferocity":500},"minAny":[{"strength":200},{"sorcery":200}],"reqForms":["wraith_spectral","wraith_reaver"]},"wraith_reaver":{"name":"Wraith Reaver","desc":"An apex killer spirit that amplifies critical devastation through ruthless martial or arcane mastery.","stage":"tier_2","prestige":5,"attrs":{"life_force":84,"strength":1.25,"defense":0.86,"haste":1.27,"precision":13.0,"ferocity":92.0,"stamina":14.0,"flow":26.0,"sorcery":1.25,"discipline":0},"innate":{"life_force":1.1},"passives":[{"name":"Swiftness","desc":"+13.0%/kill, 8x (max +104%)","icon":"💨","color":"#a29bfe"},{"name":"Final Incantation","desc":"+240% exec sous 22%. CD 34s","icon":"💀","color":"#e74c3c"}],"next":["wraith_phantom_king"],"minSk":{"ferocity":250},"minAny":[{"strength":250},{"sorcery":250}]},"wraith_spectral":{"name":"Wraith Spectral","desc":"A perfected evasive apparition that phases through danger and keeps pressure with relentless mobility.","stage":"tier_2","prestige":5,"attrs":{"life_force":84,"strength":1.05,"defense":0.85,"haste":1.27,"precision":12.0,"ferocity":66.0,"stamina":18.0,"flow":24.0,"sorcery":1.12,"discipline":0},"innate":{"life_force":1.1},"passives":[{"name":"Swiftness","desc":"+13.5%/kill, 8x (max +108%)","icon":"💨","color":"#a29bfe"},{"name":"Adrenaline","desc":"90% endurance sous 20%. CD 36s","icon":"⚡","color":"#f39c12"}],"next":["wraith_phantom_king"],"minSk":{"haste":250,"stamina":250}},"wraith_whisper":{"name":"Wraith Whisper","desc":"A fleeting spirit form that slips through battlefields with impossible speed and ghostly endurance.","stage":"tier_1","prestige":2,"attrs":{"life_force":62,"strength":1.0,"defense":0.78,"haste":1.18,"precision":9.0,"ferocity":58.0,"stamina":12.0,"flow":18.0,"sorcery":1.06,"discipline":0},"innate":{"life_force":0.82},"passives":[{"name":"Swiftness","desc":"+11.0%/kill, 8x (max +88%)","icon":"💨","color":"#a29bfe"},{"name":"Adrenaline","desc":"65% endurance sous 20%. CD 42s","icon":"⚡","color":"#f39c12"}],"next":["wraith_spectral"],"minSk":{"haste":125,"stamina":125}},"yordle":{"name":"Yordle","desc":"Whimsical yet dangerous, Yordles rely on agility, trickery, and explosive damage.","stage":"base","prestige":0,"attrs":{"life_force":52,"strength":0.81,"defense":0.77,"haste":1.075,"precision":17.5,"ferocity":7.0,"stamina":12.3,"flow":31.5,"sorcery":0.94,"discipline":0},"innate":{"life_force":0.78},"passives":[{"name":"Swiftness","desc":"+18.0%/kill, 8x (max +144%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+140% charge spéciale","icon":"⚡","color":"#f39c12"}],"next":["yordle_sprout","yordle_trickster"]},"yordle_enchanter":{"name":"Yordle Enchanter","desc":"A master support Yordle whose mana reserves and stamina control empower endless magical pressure.","stage":"tier_2","prestige":5,"attrs":{"life_force":95,"strength":0.9,"defense":0.92,"haste":1.225,"precision":24.0,"ferocity":12.0,"stamina":22.0,"flow":58.0,"sorcery":1.18,"discipline":0},"innate":{"life_force":1.45},"passives":[{"name":"Swiftness","desc":"+24.0%/kill, 8x (max +192%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+220% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"2.4% mana/5s","icon":"💎","color":"#45aaf2"}],"next":["yordle_master"],"minSk":{"flow":200,"stamina":200,"haste":100}},"yordle_master":{"name":"Yordle Master","desc":"The pinnacle Yordle form, mastering support enchantment and trickster devastation in one legendary body.","stage":"final","prestige":10,"attrs":{"life_force":120,"strength":1.14,"defense":0.985,"haste":1.3,"precision":40,"ferocity":40,"stamina":26.5,"flow":67,"sorcery":1.3,"discipline":0},"innate":{"life_force":1.9},"passives":[{"name":"Swiftness","desc":"+34.0%/kill, 8x (max +272%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+280% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"2.8% mana/5s","icon":"💎","color":"#45aaf2"},{"name":"Final Incantation","desc":"+280% exec sous 25%. CD 30s","icon":"💀","color":"#e74c3c"}],"next":[],"minSk":{"flow":200,"stamina":200,"haste":200,"ferocity":400},"reqForms":["yordle_enchanter","yordle_menace"]},"yordle_menace":{"name":"Yordle Menace","desc":"An apex prankster of destruction, blending impossible speed with brutal crit bursts.","stage":"tier_2","prestige":5,"attrs":{"life_force":90,"strength":1.06,"defense":0.86,"haste":1.225,"precision":34.0,"ferocity":30.0,"stamina":20.0,"flow":46.0,"sorcery":1.18,"discipline":0},"innate":{"life_force":1.4},"passives":[{"name":"Swiftness","desc":"+30.0%/kill, 8x (max +240%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+240% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+229% exec sous 22%. CD 34s","icon":"💀","color":"#e74c3c"}],"next":["yordle_master"],"minSk":{"haste":250,"ferocity":250}},"yordle_sprout":{"name":"Yordle Sprout","desc":"A budding support Yordle who channels whimsical mana and stamina into relentless team utility.","stage":"tier_1","prestige":2,"attrs":{"life_force":70,"strength":0.85,"defense":0.85,"haste":1.15,"precision":20.0,"ferocity":9.0,"stamina":17.0,"flow":46.0,"sorcery":1.06,"discipline":0},"innate":{"life_force":1.05},"passives":[{"name":"Swiftness","desc":"+20.0%/kill, 8x (max +160%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+180% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Mana Regen","desc":"1.8% mana/5s","icon":"💎","color":"#45aaf2"}],"next":["yordle_enchanter"],"minSk":{"flow":125,"stamina":125}},"yordle_trickster":{"name":"Yordle Trickster","desc":"A chaotic damage dealer who weaponizes speed and critical force to dismantle enemies before they react.","stage":"tier_1","prestige":2,"attrs":{"life_force":68,"strength":0.95,"defense":0.8,"haste":1.15,"precision":27.0,"ferocity":18.0,"stamina":16.0,"flow":40.0,"sorcery":1.08,"discipline":0},"innate":{"life_force":1.0},"passives":[{"name":"Swiftness","desc":"+26.0%/kill, 8x (max +208%)","icon":"💨","color":"#a29bfe"},{"name":"Special Charge","desc":"+200% charge spéciale","icon":"⚡","color":"#f39c12"},{"name":"Final Incantation","desc":"+170% exec sous 20%. CD 42s","icon":"💀","color":"#e74c3c"}],"next":["yordle_menace"],"minSk":{"haste":125,"ferocity":125}}};

function getActiveRace(race, evoId) {
  if (!race) return null;
  const evo = evoId && EVOLUTIONS[evoId];
  if (evo) return { ...race, attrs: evo.attrs, innate: evo.innate, passives: evo.passives, activeName: evo.name, activeDesc: evo.desc, activeStage: evo.stage, activePrestige: evo.prestige, evoId: evoId };
  const base = EVOLUTIONS[race.id];
  if (base) return { ...race, attrs: base.attrs, innate: base.innate, passives: base.passives, activeName: base.name, activeDesc: base.desc, activeStage: "base", activePrestige: 0, evoId: race.id };
  return race;
}

const SC={base:"#95a5a6",tier_1:"#3498db",tier_2:"#e67e22",final:"#e74c3c"};
const SL={base:"Base",tier_1:"Tier 1",tier_2:"Tier 2",final:"Final"};
const TABS=[{id:"race",label:"Race",emoji:"🧬"},{id:"class",label:"Classe",emoji:"⚔️"},{id:"stats",label:"Stats",emoji:"📊"},{id:"augments",label:"Augments",emoji:"💠"},{id:"dps",label:"DPS",emoji:"⚡"},{id:"summary",label:"Résumé",emoji:"📋"},{id:"builds",label:"Mes Builds",emoji:"💾"},{id:"compare",label:"Comparer",emoji:"⚖️"}];

// ═══════════════════════════════════════════
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
function encodeBuild(s) { return btoa(JSON.stringify({ r:s.selectedRace?.id||"",e:s.selectedEvo||"",c1:s.primaryClass?.id||"",c2:s.secondaryClass?.id||"",t1:s.primaryTier,t2:s.secondaryTier,l:s.level,p:s.prestige,sp:s.skillPoints,a:s.selectedAugments.map(a=>a.id),ab:s.augBonus})); }
function decodeBuild(str) { try { const d=JSON.parse(atob(str)); return { selectedRace:RACES.find(r=>r.id===d.r)||null,selectedEvo:d.e||"",primaryClass:CLASSES.find(c=>c.id===d.c1)||null,secondaryClass:CLASSES.find(c=>c.id===d.c2)||null,primaryTier:d.t1||0,secondaryTier:d.t2||0,level:d.l||1,prestige:d.p||0,skillPoints:d.sp||{},selectedAugments:(d.a||[]).map(id=>AUGMENTS.find(a=>a.id===id)).filter(Boolean),augBonus:d.ab||{} }; } catch { return null; } }

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════
function PassiveList({passives,compact}){return(<div style={{display:"flex",flexDirection:"column",gap:compact?4:6}}>{passives.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:compact?"5px 10px":"8px 12px",background:p.color+"0a",borderRadius:10,border:"1px solid "+p.color+"15",transition:"background 0.15s"}}><span style={{fontSize:compact?14:16,flexShrink:0,width:compact?20:24,textAlign:"center"}}>{p.icon}</span><div style={{minWidth:0}}><span style={{fontSize:compact?11:12,fontWeight:700,color:p.color}}>{p.name}</span><span style={{fontSize:compact?10:11,color:"#7888a8",marginLeft:6}}>{p.desc}</span></div></div>))}</div>)}

function AscTree({race}){const stages=["base","tier_1","tier_2","final"];const by={};stages.forEach(s=>{by[s]=race.tree.filter(n=>n.stage===s)});return(<div style={{display:"flex",gap:6,alignItems:"flex-start",overflowX:"auto",padding:"8px 0"}}>{stages.map((stage,si)=>(<div key={stage} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",minWidth:82}}><div style={{fontSize:9,color:SC[stage],fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{SL[stage]}</div>{by[stage].map(n=>(<div key={n.id} style={{background:SC[stage]+"12",border:"2px solid "+SC[stage]+"44",borderRadius:10,padding:"4px 10px",textAlign:"center",fontSize:11,fontWeight:700,color:SC[stage],minWidth:72}}>{n.name}{n.prestige>0&&<div style={{fontSize:9,opacity:0.6}}>P{n.prestige}</div>}</div>))}</div>{si<3&&<div style={{color:"#333",fontSize:14,margin:"0 2px",marginTop:14}}>›</div>}</div>))}</div>)}

const bs=(c,sm)=>({minWidth:sm?30:36,height:sm?26:30,borderRadius:7,border:"1px solid "+c+"33",background:c+"10",color:c,fontWeight:700,fontSize:sm?11:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0});

// ═══════════════════════════════════════════
// TAB: RACE
// ═══════════════════════════════════════════
function EvoTree({race,selectedEvo,setSelectedEvo}){
  const stages=["base","tier_1","tier_2","final"];
  const by={};stages.forEach(s=>{by[s]=race.tree.filter(n=>n.stage===s)});
  return(<div style={{display:"flex",gap:6,alignItems:"flex-start",overflowX:"auto",padding:"8px 0",flexWrap:"wrap"}}>{stages.map((stage,si)=>(<div key={stage} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",minWidth:82}}><div style={{fontSize:9,color:SC[stage],fontWeight:800,textTransform:"uppercase",letterSpacing:1.5}}>{SL[stage]}</div>{by[stage].map(n=>{const sel=selectedEvo===n.id;const evo=EVOLUTIONS[n.id];return(<div key={n.id} onClick={()=>setSelectedEvo(n.id)} style={{background:sel?SC[stage]+"25":SC[stage]+"0a",border:"2px solid "+(sel?SC[stage]:SC[stage]+"44"),borderRadius:10,padding:"6px 12px",textAlign:"center",fontSize:11,fontWeight:700,color:sel?"#fff":SC[stage],minWidth:78,cursor:"pointer",transition:"all 0.2s",boxShadow:sel?"0 2px 12px "+SC[stage]+"30":"none"}}><div>{evo?.name||n.name}</div>{n.prestige>0&&<div style={{fontSize:9,opacity:0.6}}>P{n.prestige}</div>}</div>)})}</div>{si<3&&<div style={{color:"#333",fontSize:14,margin:"0 2px",marginTop:14}}>›</div>}</div>))}</div>);
}

function EvoDetails({evoId,raceColor}){
  const evo=EVOLUTIONS[evoId];if(!evo)return null;
  return(<div style={{marginTop:10}}>
    <div style={{fontSize:12,fontWeight:700,color:raceColor,marginBottom:6}}>{evo.name} <span style={{fontSize:10,color:SC[evo.stage],background:SC[evo.stage]+"15",padding:"2px 8px",borderRadius:6,marginLeft:6}}>{SL[evo.stage]}{evo.prestige>0?` P${evo.prestige}`:""}</span></div>
    <div style={{fontSize:11,color:"#888",marginBottom:8,lineHeight:1.4}}>{evo.desc}</div>
    {/* Requirements */}
    {(evo.minSk||evo.minAny||evo.reqForms)&&<div style={{marginBottom:8,padding:"6px 10px",background:"#ffffff06",borderRadius:8,border:"1px solid #ffffff0a"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#f39c12",marginBottom:3}}>Requirements</div>
      {evo.minSk&&<div style={{fontSize:10,color:"#aaa",display:"flex",gap:6,flexWrap:"wrap"}}>{Object.entries(evo.minSk).map(([k,v])=>{const s=STATS.find(st=>st.key===k);return <span key={k} style={{background:s?.color+"15",color:s?.color||"#aaa",padding:"1px 6px",borderRadius:4}}>{s?.icon||""} {s?.name||k} ≥{v}</span>})}</div>}
      {evo.minAny&&<div style={{fontSize:10,color:"#aaa",marginTop:2}}>OU: {evo.minAny.map((x,i)=>{const[k,v]=Object.entries(x)[0];const s=STATS.find(st=>st.key===k);return <span key={i} style={{background:s?.color+"15",color:s?.color||"#aaa",padding:"1px 6px",borderRadius:4,marginRight:4}}>{s?.icon||""} {s?.name||k} ≥{v}</span>})}</div>}
      {evo.reqForms&&<div style={{fontSize:10,color:"#e74c3c",marginTop:2}}>Forme requise: {evo.reqForms.map(f=>EVOLUTIONS[f]?.name||f).join(" ou ")}</div>}
    </div>}
    {/* Stats grid */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:2,marginBottom:8}}>{STATS.map(s=>{const v=evo.attrs[s.key]||0;const label=s.mode==="mult"?(v===0||v===undefined?"—":`×${v}`):s.mode==="haste"?(v===0||v===undefined?"—":`${((v-1)*100)>=0?"+":""}${((v-1)*100).toFixed(0)}%`):s.mode==="add%"?`+${v}%`:`${v}`;return(<div key={s.key} style={{textAlign:"center",fontSize:9,padding:"3px 0",background:s.color+"08",borderRadius:4}}><div>{s.icon}</div><div style={{color:s.mode==="mult"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.mode==="haste"?(v>=1?"#2ed573":v>0?"#ff6b6b":"#555"):s.color,fontWeight:700}}>{label}</div></div>)})}</div>
    <div style={{fontSize:10,color:"#777"}}>Innate/niv: {Object.entries(evo.innate).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v).join(" • ")}</div>
    <div style={{marginTop:6}}><PassiveList passives={evo.passives} compact/></div>
  </div>);
}

function RaceTab({selectedRace:sr,setSelectedRace:set,selectedEvo,setSelectedEvo}){
  const KEY_STATS=["life_force","strength","sorcery","defense","haste"];
  return(<div>
    <h3 style={{margin:"0 0 16px",fontSize:18,color:"#fff",fontFamily:"var(--fd)",letterSpacing:0.5}}>🧬 Choisis ta Race</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))",gap:10}}>
      {RACES.map(r=>{const sel=sr?.id===r.id;return(
        <div key={r.id} onClick={()=>{set(r);setSelectedEvo(r.id)}} style={{
          background:sel?`linear-gradient(160deg,${r.color}14,${r.color}06)`:"var(--card)",
          border:`2px solid ${sel?r.color:"var(--brd)"}`,borderRadius:16,padding:"18px 16px",
          cursor:"pointer",transition:"all 0.25s ease",position:"relative",overflow:"hidden",
          boxShadow:sel?`0 6px 24px ${r.color}20,inset 0 1px 0 ${r.color}15`:"none",
        }}
        onMouseEnter={e=>{if(!sel){e.currentTarget.style.borderColor=r.color+"60";e.currentTarget.style.transform="translateY(-2px)"}}}
        onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor="var(--brd)";e.currentTarget.style.transform=""}}}
        >
          {sel&&<div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right,${r.color}18,transparent)`,borderRadius:"0 0 0 60px"}}/>}
          <div style={{fontSize:36,marginBottom:8,filter:sel?"none":"grayscale(0.2)"}}>{r.emoji}</div>
          <div style={{fontSize:15,fontWeight:800,color:sel?"#fff":r.color,fontFamily:"var(--fd)",marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:11,color:"#6878a0",lineHeight:1.4,marginBottom:10}}>{r.desc}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {KEY_STATS.map(k=>{const s=STATS.find(st=>st.key===k);const v=r.attrs[k]||0;if(v===0&&(s.mode==="mult"||s.mode==="haste"))return null;
              const label=s.mode==="mult"?`×${v}`:s.mode==="haste"?`${((v-1)*100)>=0?"+":""}${((v-1)*100).toFixed(0)}%`:s.mode==="add%"?`+${v}%`:`${v}`;
              const good=s.mode==="mult"?v>=1:s.mode==="haste"?v>=1:true;
              return <span key={k} style={{fontSize:9,padding:"2px 6px",borderRadius:6,background:s.color+"12",color:good?s.color:"#ff6b6b",fontWeight:700}}>{s.icon} {label}</span>
            })}
          </div>
          <div style={{marginTop:8,fontSize:10,color:"#555"}}>{r.passives.length} passif{r.passives.length>1?"s":""}</div>
        </div>
      )})}
    </div>
    {sr&&(<div style={{marginTop:16,background:"linear-gradient(145deg,var(--card),"+sr.color+"05)",borderRadius:18,padding:"20px 18px",border:"2px solid "+sr.color+"25",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,background:`radial-gradient(circle,${sr.color}0a,transparent)`,borderRadius:"50%"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,position:"relative"}}>
        <span style={{fontSize:32}}>{sr.emoji}</span>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:sr.color,fontFamily:"var(--fd)"}}>{sr.name}</div>
          <div style={{fontSize:12,color:"#6878a0"}}>Sélectionne une forme d'ascension</div>
        </div>
      </div>
      <EvoTree race={sr} selectedEvo={selectedEvo||sr.id} setSelectedEvo={setSelectedEvo}/>
      <EvoDetails evoId={selectedEvo||sr.id} raceColor={sr.color}/>
    </div>)}
  </div>)}


// ═══════════════════════════════════════════
// TAB: CLASS
// ═══════════════════════════════════════════
function ClassTab({primaryClass:pc,setPrimaryClass:spc,secondaryClass:sc,setSecondaryClass:ssc,primaryTier:pt,setPrimaryTier:spt,secondaryTier:st,setSecondaryTier:sst}){const[mode,setMode]=useState("primary");const cc=mode==="primary"?pc:sc;const setC=mode==="primary"?spc:ssc;const ct=mode==="primary"?pt:st;const setT=mode==="primary"?spt:sst;return(<div><div style={{display:"flex",gap:8,marginBottom:14}}>{["primary","secondary"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{padding:"8px 18px",borderRadius:10,border:"2px solid "+(mode===m?"#f39c12":"var(--brd)"),background:mode===m?"#f39c1212":"var(--card)",color:mode===m?"#f39c12":"#555",fontWeight:700,fontSize:13,cursor:"pointer"}}>{m==="primary"?"⚔️ Primaire":"🛡️ Secondaire"}</button>))}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:10}}>{CLASSES.map(cls=>{const sel=cc?.id===cls.id;const oth=mode==="primary"?sc?.id===cls.id:pc?.id===cls.id;return(<div key={cls.id} onClick={()=>{if(!oth){setC(cls);setT(0)}}} style={{background:sel?"linear-gradient(135deg,"+cls.color+"10,"+cls.color+"05)":oth?"#0a0a14":"var(--card)",border:"2px solid "+(sel?cls.color:oth?"#181830":"var(--brd)"),borderRadius:12,padding:12,cursor:oth?"not-allowed":"pointer",opacity:oth?0.3:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:24}}>{cls.emoji}</span><div><div style={{fontSize:14,fontWeight:800,color:cls.color}}>{cls.name}</div><div style={{fontSize:10,color:"#666"}}>{cls.dmg} • {cls.range} • Cap DEF: {cls.defCap}%</div></div></div><div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>{cls.weapons.map(w=><span key={w} style={{fontSize:9,background:cls.color+"15",color:cls.color,padding:"2px 6px",borderRadius:5}}>{w}</span>)}</div><PassiveList passives={cls.passives} compact/></div>)})}</div>{cc&&(<div style={{marginTop:14,background:"var(--card)",borderRadius:14,padding:14,border:"2px solid "+cc.color+"30"}}><div style={{fontSize:15,fontWeight:800,color:cc.color,marginBottom:10,fontFamily:"var(--fd)"}}>{cc.emoji} {cc.name} — Tier</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CLASS_TIERS.map((tier,i)=>(<button key={tier} onClick={()=>setT(i)} style={{padding:"8px 16px",borderRadius:10,border:"2px solid "+(ct===i?CLASS_TIER_COLORS[i]:"var(--brd)"),background:ct===i?CLASS_TIER_COLORS[i]+"15":"var(--bg)",color:ct===i?CLASS_TIER_COLORS[i]:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>{tier} {CLASS_TIER_PRESTIGE[i]>0&&<span style={{opacity:0.5}}>(P{CLASS_TIER_PRESTIGE[i]})</span>}</button>))}</div><div style={{marginTop:10,fontSize:11,color:"#777"}}>Innate : {Object.entries(cc.innateByTier[ct]).map(([k,v])=>(STATS.find(s=>s.key===k)?.icon||"")+" "+k+" +"+v+"/niv").join("  •  ")}{mode==="secondary"&&<span style={{color:"#f39c12",marginLeft:8}}>× 0.5 (secondaire)</span>}</div></div>)}</div>)}

// ═══════════════════════════════════════════
// TAB: STATS
// ═══════════════════════════════════════════
function StatsTab({level,setLevel,prestige,setPrestige,skillPoints:sp,setSkillPoints:setSP,totalSP,usedSP,selectedRace:race,primaryClass:c1,primaryTier:t1,secondaryClass:c2,secondaryTier:t2,augBonus,postBonus,selectedEvo}){const rem=totalSP-usedSP;const aRace=getActiveRace(race,selectedEvo||race?.id);const inn=computeInnates(aRace,c1,t1,c2,t2,level);const add=(k,a)=>{setSP(p=>{const c=p[k]||0;const nv=Math.max(0,c+a);if(nv-c>rem&&a>0)return p;return{...p,[k]:nv}})};return(<div><div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Niveau</label><input type="number" min={1} max={200} value={level} onChange={e=>{const v=parseInt(e.target.value)||1;setLevel(Math.max(1,Math.min(200,v)))}} style={{width:64,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#f39c12",padding:"6px 10px",fontSize:15,fontWeight:800,textAlign:"center",fontFamily:"var(--fb)",outline:"none"}}/></div><div style={{display:"flex",alignItems:"center",gap:6}}><label style={{fontSize:12,color:"#aaa",fontWeight:700}}>Prestige</label><input type="number" min={0} max={20} value={prestige} onChange={e=>{const v=parseInt(e.target.value)||0;setPrestige(Math.max(0,Math.min(20,v)))}} style={{width:52,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#e74c3c",padding:"6px 8px",fontSize:15,fontWeight:800,textAlign:"center",fontFamily:"var(--fb)",outline:"none"}}/></div><div style={{background:rem>0?"#2ed57312":"#ff6b6b12",padding:"6px 14px",borderRadius:10,border:"1px solid "+(rem>0?"#2ed573":"#ff6b6b")+"30",fontSize:13,fontWeight:700,color:rem>0?"#2ed573":"#ff6b6b"}}>{rem} / {totalSP} SP</div><button onClick={()=>setSP({})} style={{...bs("#ff6b6b"),padding:"6px 14px",minWidth:"auto",fontSize:11}}>Reset</button></div>{(race||c1||c2)&&STATS.some(s=>inn[s.key].perLevel>0)&&(<div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:14,border:"1px solid var(--brd)"}}><div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:8}}>📈 Innate Bonuses</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:6}}>{STATS.filter(s=>inn[s.key].perLevel>0).map(s=>{const i=inn[s.key];return(<div key={s.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:s.color+"08",borderRadius:8,border:"1px solid "+s.color+"18"}}><span style={{fontSize:12,color:"#ccc"}}>{s.icon} {s.name}</span><span style={{fontSize:12,fontWeight:700,color:s.color}}>+{i.perLevel.toFixed(2)}/niv <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>)}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:8}}>{STATS.map(stat=>{const pts=sp[stat.key]||0;const comp=computeStat(stat,aRace,inn,sp,augBonus,postBonus);return(<div key={stat.key} style={{background:"var(--card)",borderRadius:12,padding:12,border:"1px solid "+stat.color+"18"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18}}>{stat.icon}</span><div><div style={{fontSize:13,fontWeight:700,color:stat.color}}>{stat.name}</div><div style={{fontSize:9,color:"#555"}}>Niv. {pts} • {stat.per_level}{stat.mode!=="flat"?"%":""}/pt{stat.mode==="mult"?" (×race)":stat.mode==="haste"?" (×race + offset)":""}</div></div></div><div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:stat.color}}>{fmt(comp.total,stat.mode)}</div></div></div><div style={{display:"flex",gap:4,fontSize:9,color:"#555",marginBottom:6,flexWrap:"wrap"}}>{stat.mode==="mult"&&aRace&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {(aRace.attrs[stat.key]===0||aRace.attrs[stat.key]===undefined)?"×1.0 (aucun)":`×${aRace.attrs[stat.key]}`}</span>}{stat.mode==="haste"&&aRace&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: {aRace.attrs[stat.key]||1} ({((aRace.attrs[stat.key]||1)-1)*100>=0?"+":""}{(((aRace.attrs[stat.key]||1)-1)*100).toFixed(0)}% base, ×gains)</span>}{stat.mode!=="mult"&&stat.mode!=="haste"&&comp.base!==0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Race: +{comp.base}</span>}{comp.fromInn>0&&<span style={{background:"#fff1",padding:"1px 5px",borderRadius:4}}>Innate: +{comp.fromInn.toFixed(1)}</span>}{comp.fromSP>0&&<span style={{background:stat.color+"15",padding:"1px 5px",borderRadius:4,color:stat.color}}>SP: +{comp.fromSP.toFixed(1)}</span>}{comp.fromAug!==0&&<span style={{background:comp.fromAug>0?"#f39c1220":"#ff6b6b20",padding:"1px 5px",borderRadius:4,color:comp.fromAug>0?"#f39c12":"#ff6b6b"}}>Aug: {comp.fromAug>0?"+":""}{comp.fromAug}</span>}{comp.fromPost>0&&<span style={{background:"#a55eea20",padding:"1px 5px",borderRadius:4,color:"#a55eea"}}>Passive: +{comp.fromPost.toFixed(1)}</span>}</div><div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>add(stat.key,-10)} style={bs("#ff6b6b",true)}>-10</button><button onClick={()=>add(stat.key,-1)} style={bs("#ff6b6b",true)}>-1</button><div style={{flex:1,height:6,background:"#16162a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(pts/4,100)+"%",background:"linear-gradient(90deg,"+stat.color+"55,"+stat.color+")",borderRadius:3,transition:"width 0.15s"}}/></div><button onClick={()=>add(stat.key,1)} style={bs("#2ed573",true)}>+1</button><button onClick={()=>add(stat.key,10)} style={bs("#2ed573",true)}>+10</button></div></div>)})}</div></div>)}

// ═══════════════════════════════════════════
// TAB: AUGMENTS (with stat bonus input)
// ═══════════════════════════════════════════
function AugmentsTab({selectedAugments:sa,setSelectedAugments:setSA,augBonus,setAugBonus}){const[f,setF]=useState("ALL");const fl=f==="ALL"?AUGMENTS:AUGMENTS.filter(a=>a.tier===f);const gr={};TIER_ORDER.forEach(t=>{gr[t]=fl.filter(a=>a.tier===t)});const tog=a=>setSA(p=>p.find(x=>x.id===a.id)?p.filter(x=>x.id!==a.id):[...p,a]);return(<div><div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>{["ALL",...TIER_ORDER].map(t=>(<button key={t} onClick={()=>setF(t)} style={{padding:"6px 14px",borderRadius:10,border:"2px solid "+(f===t?(TIER_COLORS[t]||"#f39c12"):"var(--brd)"),background:f===t?(TIER_COLORS[t]||"#f39c12")+"12":"var(--bg)",color:f===t?(TIER_COLORS[t]||"#f39c12"):"#444",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t==="ALL"?"Tous":t}</button>))}<span style={{marginLeft:"auto",fontSize:12,color:"#666"}}>{sa.length} sélectionnés</span></div>{TIER_ORDER.map(tier=>{const augs=gr[tier];if(!augs?.length)return null;return(<div key={tier} style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:800,color:TIER_COLORS[tier],marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>{tier} ({augs.length})</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:6}}>{augs.map(aug=>{const sel=sa.find(a=>a.id===aug.id);return(<div key={aug.id} onClick={()=>tog(aug)} style={{background:sel?TIER_COLORS[aug.tier]+"0d":"var(--card)",border:"2px solid "+(sel?TIER_COLORS[aug.tier]:"var(--brd)"),borderRadius:10,padding:"8px 12px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color:sel?TIER_COLORS[aug.tier]:"#bbb"}}>{aug.name}</span><span style={{fontSize:9,color:TIER_COLORS[aug.tier],background:TIER_COLORS[aug.tier]+"15",padding:"2px 6px",borderRadius:5}}>{aug.tier}</span></div><div style={{fontSize:10,color:"#666",marginTop:3}}>{aug.desc}</div>{aug.bonuses&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{Object.entries(aug.bonuses).map(([k,v])=>{const st=STATS.find(s=>s.key===k);return st?<span key={k} style={{fontSize:9,background:v>0?"#2ed57318":"#ff6b6b18",color:v>0?"#2ed573":"#ff6b6b",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{v>0?"+":""}{v}{st.mode!=="flat"?"%":""} {st.name}</span>:null})}</div>}{aug.scaling&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{aug.scaling.map((sc,i)=>{const src=STATS.find(s=>s.key===sc.source);const tgt=STATS.find(s=>s.key===sc.target);return <span key={i} style={{fontSize:9,background:"#a55eea18",color:"#a55eea",padding:"1px 6px",borderRadius:4,fontWeight:700}}>{src?.icon} {(sc.ratio*100).toFixed(0)}% {src?.name} → {tgt?.icon} {tgt?.name}</span>})}</div>}</div>)})}</div></div>)})}
{/* Augment stat bonuses input */}
<div style={{marginTop:16,background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}>
<div style={{fontSize:14,fontWeight:800,color:"#f39c12",marginBottom:4,fontFamily:"var(--fd)"}}>📊 Bonus manuels</div>
<div style={{fontSize:10,color:"#666",marginBottom:10}}>Ajoute ici les bonus des rolls Common ou d'autres sources non automatiques. Les bonus des augments sélectionnés ci-dessus sont déjà calculés automatiquement.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:8}}>
{STATS.map(s=>(<div key={s.key} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{s.icon}</span><span style={{fontSize:11,color:"#aaa",minWidth:70}}>{s.name}</span><input type="number" step="0.01" value={augBonus[s.key]||""} onChange={e=>{const v=parseFloat(e.target.value);setAugBonus(p=>({...p,[s.key]:isNaN(v)?0:v}))}} placeholder="0" style={{width:70,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:6,color:s.color,padding:"4px 8px",fontSize:12,fontWeight:700,textAlign:"right"}}/><span style={{fontSize:10,color:"#555"}}>{s.mode!=="flat"?"%":""}</span></div>))}
</div></div></div>)}

// ═══════════════════════════════════════════
// TAB: SUMMARY
// ═══════════════════════════════════════════
function SummaryTab({state:s}){const{selectedRace:race0,selectedEvo:sEvo,primaryClass:c1,secondaryClass:c2,primaryTier:t1,secondaryTier:t2,level,prestige,skillPoints:sp,selectedAugments:sa,augBonus:manualAug}=s;const race=getActiveRace(race0,sEvo||race0?.id);const totalSP=12+(level-1)*5;const usedSP=Object.values(sp).reduce((a,b)=>a+b,0);const inn=computeInnates(race,c1,t1,c2,t2,level);const flatAug=computeAugBonuses(sa,manualAug);const baseStats={};STATS.forEach(s=>{baseStats[s.key]=computeStat(s,race,inn,sp,flatAug).total});const augBonus=computeAugBonuses(sa,manualAug,baseStats);const baseStats2={};STATS.forEach(s=>{baseStats2[s.key]=computeStat(s,race,inn,sp,augBonus).total});const postBonus=computeClassPassiveScaling(c1,c2,baseStats2);const[copied,setCopied]=useState(false);const code=encodeBuild(s);return(<div><div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}><button onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{padding:"8px 16px",borderRadius:10,border:"2px solid #f39c1240",background:"#f39c1210",color:"#f39c12",fontWeight:700,fontSize:12,cursor:"pointer"}}>{copied?"✅ Copié !":"📋 Copier le code"}</button><div style={{flex:1,background:"var(--card)",borderRadius:8,padding:"6px 10px",fontSize:10,color:"#444",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"1px solid var(--brd)"}}>{code.slice(0,80)}...</div></div>
<div style={{background:"linear-gradient(135deg,#141425,#1a1a38)",borderRadius:16,padding:18,border:"1px solid #2a2a4e",marginBottom:14}}><div style={{display:"flex",gap:20,flexWrap:"wrap"}}>{[{l:"PRESTIGE",v:prestige,c:prestige>0?"#e74c3c":"#fff"},{l:"LEVEL",v:level,c:"#fff"}].map(x=>(<div key={x.l} style={{flex:"1 1 80px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div><div style={{fontSize:22,fontWeight:900,color:x.c}}>{x.v}</div></div>))}<div style={{flex:"1 1 120px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>RACE</div>{race?<div><div style={{fontSize:16,fontWeight:800,color:race.color}}>{race.emoji} {race.activeName||race.name}</div>{race.activeStage&&race.activeStage!=="base"&&<div style={{fontSize:10,color:SC[race.activeStage]}}>{SL[race.activeStage]}</div>}</div>:<div style={{color:"#444"}}>—</div>}</div>{[{l:"PRIMARY CLASS",o:c1,t:t1},{l:"SECONDARY CLASS",o:c2,t:t2}].map(x=>(<div key={x.l} style={{flex:"1 1 140px"}}><div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:2}}>{x.l}</div>{x.o?<div><span style={{fontSize:14,fontWeight:800,color:x.o.color}}>{x.o.emoji} {x.o.name}</span><div style={{fontSize:10,color:CLASS_TIER_COLORS[x.t]}}>{CLASS_TIERS[x.t]}</div></div>:<div style={{color:"#444"}}>—</div>}</div>))}</div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Total Attributes */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Total Attributes</div>{STATS.map(stat=>{const comp=computeStat(stat,race,inn,sp,augBonus,postBonus);const pts=sp[stat.key]||0;const mx=stat.mode==="flat"?300:100;const pct=Math.min((Math.abs(comp.total)/mx)*100,100);return(<div key={stat.key} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:pts>0?stat.color:"#888"}}>{stat.icon} <span style={{fontWeight:pts>0?700:400}}>Niv. {pts}</span> {stat.name}</span><span style={{color:stat.color,fontWeight:800,fontSize:13}}>{fmt(comp.total,stat.mode)}</span></div><div style={{height:5,background:"#16162a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+stat.color+"44,"+stat.color+")",borderRadius:3}}/></div></div>)})}</div>
{/* Innate */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:10,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Innate Bonuses</div>{STATS.filter(s=>inn[s.key].perLevel>0).map(stat=>{const i=inn[stat.key];return(<div key={stat.key} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #ffffff08",fontSize:12}}><span style={{color:"#bbb"}}>{stat.icon} {stat.name}</span><span style={{color:stat.color,fontWeight:600}}>+{i.perLevel.toFixed(2)} par niveau <span style={{color:"#666"}}>(Total +{i.total.toFixed(1)} @ Niv {level})</span></span></div>)})}</div></div>
<div style={{display:"flex",flexDirection:"column",gap:14}}>
{/* Augments */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Augments ({sa.length})</div>{sa.length===0?<div style={{color:"#444",fontSize:11}}>Aucun augment</div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>{sa.map(aug=>(<div key={aug.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:TIER_COLORS[aug.tier]+"0a",borderRadius:6,border:"1px solid "+TIER_COLORS[aug.tier]+"18"}}><span style={{fontSize:11,fontWeight:600,color:"#ccc"}}>{aug.name}</span><span style={{fontSize:9,color:TIER_COLORS[aug.tier],fontWeight:700}}>{aug.tier}</span></div>))}</div>}
{/* Augment stat bonuses */}
{Object.entries(augBonus).some(([,v])=>v!==0)&&(<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:700,color:"#f39c12",marginBottom:4}}>Bonus Augments (total)</div>{STATS.filter(s=>(augBonus[s.key]||0)!==0).map(s=>(<div key={s.key} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0"}}><span style={{color:"#aaa"}}>{s.icon} {s.name}</span><span style={{color:augBonus[s.key]>0?"#f39c12":"#ff6b6b",fontWeight:700}}>{augBonus[s.key]>0?"+":""}{augBonus[s.key]}{s.mode!=="flat"?"%":""}</span></div>))}</div>)}
</div>
{/* Passives */}
<div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}><div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:8,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--fd)"}}>Passives</div>{race&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:race.color,marginBottom:4}}>{race.emoji} {race.name}</div><PassiveList passives={race.passives} compact/></div>}{c1&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:c1.color,marginBottom:4}}>{c1.emoji} {c1.name} (Primaire)</div><PassiveList passives={c1.passives} compact/></div>}{c2&&<div><div style={{fontSize:10,fontWeight:700,color:c2.color,marginBottom:4}}>{c2.emoji} {c2.name} (Secondaire)</div><PassiveList passives={c2.passives} compact/></div>}</div></div></div>
<div style={{marginTop:14,padding:"10px 14px",background:"#f39c120a",borderRadius:10,border:"1px solid #f39c1218",fontSize:10,color:"#888",lineHeight:1.5}}>⚠️ Formules : Stats multiplicatives (FOR, DEF, SOR) = (innate + SP + aug) × race. Hâte = (race - 1.0)×100 + (innate + SP + aug) × race. Stats additives (PRE, FER, DIS) = base race + innate + SP + aug. Stats flat (VIT, END, FLOW) = base race + innate + SP + aug.</div></div>)}


// ═══════════════════════════════════════════
// TAB: DPS METER
// ═══════════════════════════════════════════
const WEAPON_PRESETS=[
  {name:"Épée",baseDmg:7,speed:1.6,type:"physical",icon:"🗡️"},
  {name:"Hache",baseDmg:9,speed:1.0,type:"physical",icon:"🪓"},
  {name:"Dague",baseDmg:5,speed:2.2,type:"physical",icon:"🔪"},
  {name:"Masse",baseDmg:8,speed:1.2,type:"physical",icon:"🔨"},
  {name:"Lance",baseDmg:6.5,speed:1.4,type:"physical",icon:"🔱"},
  {name:"Gantelet",baseDmg:4,speed:2.8,type:"physical",icon:"👊"},
  {name:"Arc",baseDmg:8,speed:1.0,type:"magic",icon:"🏹"},
  {name:"Arbalète",baseDmg:12,speed:0.6,type:"magic",icon:"🎯"},
  {name:"Bâton",baseDmg:6,speed:1.4,type:"magic",icon:"🪄"},
  {name:"Custom",baseDmg:10,speed:1.5,type:"physical",icon:"⚙️"},
];

function DpsTab({computedStats,selectedRace,primaryClass,selectedEvo}){
  const[weaponIdx,setWeaponIdx]=useState(0);
  const[customDmg,setCustomDmg]=useState(10);
  const[customSpd,setCustomSpd]=useState(1.5);
  const[customType,setCustomType]=useState("physical");
  const[targetDef,setTargetDef]=useState(0);

  const wp=WEAPON_PRESETS[weaponIdx];
  const isCustom=wp.name==="Custom";
  const baseDmg=isCustom?customDmg:wp.baseDmg;
  const baseSpd=isCustom?customSpd:wp.speed;
  const dmgType=isCustom?customType:wp.type;

  const str=computedStats?.strength||0;
  const sor=computedStats?.sorcery||0;
  const pre=computedStats?.precision||0;
  const fer=computedStats?.ferocity||0;
  const haste=computedStats?.haste||0;

  const dmgMod=dmgType==="magic"?sor:str;
  const modifiedDmg=baseDmg*(1+dmgMod/100);
  const atkSpeed=baseSpd*(1+haste/100);
  const critChance=Math.min(pre,100)/100;
  const critMultiplier=1+fer/100;
  const avgCritMult=1+critChance*(critMultiplier-1);
  const defReduction=Math.min(targetDef,80)/100;

  const dmgPerHit=modifiedDmg*avgCritMult;
  const dmgPerHitCrit=modifiedDmg*critMultiplier;
  const rawDps=dmgPerHit*atkSpeed;
  const effectiveDps=rawDps*(1-defReduction);
  const burst5s=rawDps*5;

  const fmtN=(v,d=1)=>v>=1000?(v/1000).toFixed(1)+"k":v.toFixed(d);
  const StatBox=({label,value,unit,color,sub})=>(
    <div style={{background:color+"0a",border:"1px solid "+color+"20",borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
      <div style={{fontSize:10,color:"#6878a0",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{fontSize:28,fontWeight:900,color:color,fontFamily:"var(--fd)",lineHeight:1}}>{fmtN(value)}<span style={{fontSize:13,fontWeight:600,opacity:0.6}}>{unit}</span></div>
      {sub&&<div style={{fontSize:10,color:"#555",marginTop:4}}>{sub}</div>}
    </div>
  );

  return(<div>
    <h3 style={{margin:"0 0 16px",fontSize:18,color:"#fff",fontFamily:"var(--fd)",letterSpacing:0.5}}>⚡ DPS Meter</h3>

    <div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:10,fontFamily:"var(--fd)"}}>🗡️ Arme</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:isCustom?12:0}}>
        {WEAPON_PRESETS.map((w,i)=>{const sel=weaponIdx===i;return(
          <button key={w.name} onClick={()=>setWeaponIdx(i)} style={{
            padding:"8px 14px",borderRadius:10,border:"2px solid "+(sel?"#f39c12":"var(--brd)"),
            background:sel?"#f39c1212":"var(--bg)",color:sel?"#f39c12":"#6878a0",
            fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"var(--fb)",
          }}>{w.icon} {w.name}</button>
        )})}
      </div>
      {isCustom&&(
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <label style={{fontSize:11,color:"#aaa",fontWeight:700}}>Dégâts</label>
            <input type="number" step="0.5" value={customDmg} onChange={e=>setCustomDmg(parseFloat(e.target.value)||1)}
              style={{width:64,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#f39c12",padding:"6px 8px",fontSize:13,fontWeight:700,textAlign:"center"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <label style={{fontSize:11,color:"#aaa",fontWeight:700}}>Vitesse</label>
            <input type="number" step="0.1" value={customSpd} onChange={e=>setCustomSpd(parseFloat(e.target.value)||0.5)}
              style={{width:56,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#a29bfe",padding:"6px 8px",fontSize:13,fontWeight:700,textAlign:"center"}}/>
            <span style={{fontSize:10,color:"#555"}}>/s</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <label style={{fontSize:11,color:"#aaa",fontWeight:700}}>Type</label>
            <select value={customType} onChange={e=>setCustomType(e.target.value)}
              style={{background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#ccc",padding:"6px 10px",fontSize:12}}>
              <option value="physical">⚔️ Physique</option>
              <option value="magic">✨ Magique</option>
            </select>
          </div>
        </div>
      )}
    </div>

    <div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"var(--fd)"}}>🛡️ Défense cible</div>
        <input type="number" min={0} max={80} value={targetDef} onChange={e=>setTargetDef(Math.max(0,Math.min(80,parseInt(e.target.value)||0)))}
          style={{width:56,background:"#0d0d1a",border:"1px solid #2a2a4e",borderRadius:8,color:"#54a0ff",padding:"6px 8px",fontSize:14,fontWeight:700,textAlign:"center"}}/>
        <span style={{fontSize:11,color:"#555"}}>% réduction</span>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:4}}>
          {[{l:"Mob",v:0},{l:"Joueur",v:20},{l:"Tank",v:50}].map(p=>(
            <button key={p.l} onClick={()=>setTargetDef(p.v)} style={{
              padding:"4px 10px",borderRadius:6,border:"1px solid "+(targetDef===p.v?"#54a0ff30":"var(--brd)"),
              background:targetDef===p.v?"#54a0ff10":"transparent",color:targetDef===p.v?"#54a0ff":"#555",
              fontSize:10,fontWeight:700,cursor:"pointer",
            }}>{p.l}</button>
          ))}
        </div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",gap:10,marginBottom:16}}>
      <StatBox label="DPS Brut" value={rawDps} unit="/s" color="#f39c12" sub={fmtN(dmgPerHit)+" × "+atkSpeed.toFixed(2)+"/s"}/>
      <StatBox label="DPS Effectif" value={effectiveDps} unit="/s" color="#2ed573" sub={targetDef>0?"après "+targetDef+"% réduction":"aucune réduction"}/>
      <StatBox label="Dmg/Hit" value={dmgPerHit} unit="" color="#ff9f43" sub={"base "+baseDmg+" × "+(1+dmgMod/100).toFixed(2)}/>
      <StatBox label="Crit Dmg" value={dmgPerHitCrit} unit="" color="#e74c3c" sub={"×"+critMultiplier.toFixed(2)+" ("+(critChance*100).toFixed(1)+"%)"}/>
      <StatBox label="Burst 5s" value={burst5s} unit="" color="#a55eea" sub="dégâts en 5 secondes"/>
      <StatBox label="Atk Speed" value={atkSpeed} unit="/s" color="#a29bfe" sub={"base "+baseSpd+" + "+haste.toFixed(0)+"% hâte"}/>
    </div>

    <div style={{background:"var(--card)",borderRadius:14,padding:16,border:"1px solid var(--brd)"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:12,fontFamily:"var(--fd)"}}>📊 Breakdown</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:8}}>
        {[
          {label:"Dégâts arme base",value:baseDmg.toFixed(1),color:"#888",icon:wp.icon},
          {label:dmgType==="magic"?"Sorcellerie (mod)":"Force (mod)",value:"×"+(1+dmgMod/100).toFixed(3)+" (+"+dmgMod.toFixed(1)+"%)",color:dmgType==="magic"?"#a55eea":"#ff9f43",icon:dmgType==="magic"?"✨":"⚔️"},
          {label:"Dégâts modifiés",value:modifiedDmg.toFixed(1),color:"#fff",icon:"💥"},
          {label:"Chance crit (Précision)",value:(critChance*100).toFixed(1)+"%",color:"#f368e0",icon:"🎯"},
          {label:"Mult. crit (Férocité)",value:"×"+critMultiplier.toFixed(2)+" (+"+fer.toFixed(0)+"%)",color:"#ff6348",icon:"🔥"},
          {label:"Mult. crit moyen",value:"×"+avgCritMult.toFixed(3),color:"#e74c3c",icon:"📈"},
          {label:"Vitesse d'attaque",value:atkSpeed.toFixed(2)+"/s",color:"#a29bfe",icon:"💨"},
          {label:"Défense cible",value:"-"+targetDef+"%",color:"#54a0ff",icon:"🛡️"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:r.color+"08",borderRadius:10,border:"1px solid "+r.color+"12"}}>
            <span style={{fontSize:12,color:"#aaa",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{r.icon}</span>{r.label}</span>
            <span style={{fontSize:13,fontWeight:700,color:r.color}}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>

    {(!selectedRace&&!primaryClass)&&(
      <div style={{marginTop:16,padding:16,background:"#f39c120a",borderRadius:12,border:"1px solid #f39c1218",textAlign:"center"}}>
        <div style={{fontSize:12,color:"#f39c12",fontWeight:700}}>Configure ta race, classe et stats pour un calcul DPS précis</div>
        <div style={{fontSize:11,color:"#666",marginTop:4}}>Les modificateurs FOR/SOR, Précision, Férocité et Hâte viendront de ton build</div>
      </div>
    )}

    <div style={{marginTop:12,fontSize:10,color:"#3a4468",lineHeight:1.5}}>
      Formules (JAR v6.7) : DPS = (baseArme × (1 + FOR ou SOR / 100) × avgCritMult) × atkSpeed. CritMult = 1 + critChance × (férocité/100). AtkSpeed = baseSpeed × (1 + hâte/100).
    </div>
  </div>);
}

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
// SHARE CARD — PNG EXPORT VIA CANVAS
// ═══════════════════════════════════════════
function ShareCard({ state, onClose }) {
  const { selectedRace: race0, selectedEvo: sEvo, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, prestige, skillPoints: sp, selectedAugments: sa, augBonus: manualAug } = state;
  const race = getActiveRace(race0, sEvo || race0?.id);
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
                    Niv. {d.l}{d.p > 0 ? ` P${d.p}` : ""} • {(d.e && EVOLUTIONS[d.e]?.name) || race?.name || "?"} • {c1?.name || "?"}{c2 ? ` / ${c2.name}` : ""}
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
      selectedEvo: d.e || d.r || "",
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
    const { selectedRace: race0, selectedEvo: sEvo, primaryClass: c1, secondaryClass: c2, primaryTier: t1, secondaryTier: t2, level, skillPoints: sp, selectedAugments: sa, augBonus: mAug } = state;
    const race = getActiveRace(race0, sEvo || race0?.id);
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
function BuildCreator(){const[tab,setTab]=useState("race");const[selectedRace,setSelectedRace]=useState(null);const[selectedEvo,setSelectedEvo]=useState("");const[primaryClass,setPrimaryClass]=useState(null);const[secondaryClass,setSecondaryClass]=useState(null);const[primaryTier,setPrimaryTier]=useState(0);const[secondaryTier,setSecondaryTier]=useState(0);const[level,setLevel]=useState(1);const[prestige,setPrestige]=useState(0);const[skillPoints,setSkillPoints]=useState({});const[selectedAugments,setSelectedAugments]=useState([]);const[augBonus,setAugBonus]=useState({});const[showImport,setShowImport]=useState(false);const[showShareCard,setShowShareCard]=useState(false);const[savedBuilds,setSavedBuilds]=useState([]);
useEffect(()=>{loadSavedBuilds().then(b=>setSavedBuilds(b))},[]);
const totalSP=12+(level-1)*5;const usedSP=Object.values(skillPoints).reduce((a,b)=>a+b,0);
const handleImport=d=>{setSelectedRace(d.selectedRace);setSelectedEvo(d.selectedEvo||d.selectedRace?.id||"");setPrimaryClass(d.primaryClass);setSecondaryClass(d.secondaryClass);setPrimaryTier(d.primaryTier);setSecondaryTier(d.secondaryTier);setLevel(d.level);setPrestige(d.prestige);setSkillPoints(d.skillPoints);setSelectedAugments(d.selectedAugments);setAugBonus(d.augBonus||{});setTab("summary")};
const handleSaveBuild=(name)=>{const d={r:selectedRace?.id||"",e:selectedEvo||selectedRace?.id||"",c1:primaryClass?.id||"",c2:secondaryClass?.id||"",t1:primaryTier,t2:secondaryTier,l:level,p:prestige,sp:skillPoints,a:selectedAugments.map(a=>a.id),ab:augBonus};const newBuilds=[...savedBuilds,{name,data:d,date:Date.now()}];setSavedBuilds(newBuilds);saveBuildsList(newBuilds)};
const handleLoadBuild=(build)=>{const d=build.data;setSelectedRace(RACES.find(r=>r.id===d.r)||null);setSelectedEvo(d.e||d.r||"");setPrimaryClass(CLASSES.find(c=>c.id===d.c1)||null);setSecondaryClass(CLASSES.find(c=>c.id===d.c2)||null);setPrimaryTier(d.t1||0);setSecondaryTier(d.t2||0);setLevel(d.l||1);setPrestige(d.p||0);setSkillPoints(d.sp||{});setSelectedAugments((d.a||[]).map(id=>AUGMENTS.find(a=>a.id===id)).filter(Boolean));setAugBonus(d.ab||{});setTab("summary")};
const handleDeleteBuild=(idx)=>{const newBuilds=savedBuilds.filter((_,i)=>i!==idx);setSavedBuilds(newBuilds);saveBuildsList(newBuilds)};
const state={selectedRace,selectedEvo:selectedEvo||selectedRace?.id||"",primaryClass,secondaryClass,primaryTier,secondaryTier,level,prestige,skillPoints,selectedAugments,augBonus};
// 2-pass computation: base stats first, then scaling augments, then class passive scaling
const activeRace=getActiveRace(selectedRace,selectedEvo||selectedRace?.id);const inn=computeInnates(activeRace,primaryClass,primaryTier,secondaryClass,secondaryTier,level);
const flatAugBonus=computeAugBonuses(selectedAugments,augBonus);
const baseStats={};STATS.forEach(s=>{baseStats[s.key]=computeStat(s,activeRace,inn,skillPoints,flatAugBonus).total});
const totalAugBonus=computeAugBonuses(selectedAugments,augBonus,baseStats);
const baseStats2={};STATS.forEach(s=>{baseStats2[s.key]=computeStat(s,activeRace,inn,skillPoints,totalAugBonus).total});
const postBonus=computeClassPassiveScaling(primaryClass,secondaryClass,baseStats2);
const finalComputedStats={};STATS.forEach(s=>{finalComputedStats[s.key]=computeStat(s,activeRace,inn,skillPoints,totalAugBonus,postBonus).total});
const evoName=selectedEvo&&EVOLUTIONS[selectedEvo]?EVOLUTIONS[selectedEvo].name:null;
return(<div style={{"--bg":"#080b16","--card":"#0f1424","--brd":"#1a2040","--fd":"var(--fd)","--fb":"var(--fb)",background:"var(--bg)",color:"#d0d0e0",fontFamily:"var(--fb)"}}>
{/* BUILD CREATOR HEADER */}
<div style={{background:"linear-gradient(180deg,#10142a,#0c1020)",padding:"12px 20px 0",borderBottom:"1px solid var(--brd)",position:"relative"}}>
  {/* Top bar: breadcrumb + actions */}
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:12}}>
    {/* Build breadcrumb */}
    <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0,overflowX:"auto"}}>
      <span style={{fontSize:14,fontWeight:800,fontFamily:"var(--fd)",color:"#f39c12",flexShrink:0}}>Build Creator</span>
      {selectedRace&&<><span style={{color:"#2a3060",flexShrink:0}}>›</span><span style={{fontSize:12,color:selectedRace.color,fontWeight:700,flexShrink:0}}>{selectedRace.emoji} {evoName||selectedRace.name}</span></>}
      {primaryClass&&<><span style={{color:"#2a3060",flexShrink:0}}>›</span><span style={{fontSize:12,color:primaryClass.color,fontWeight:700,flexShrink:0}}>{primaryClass.emoji} {primaryClass.name}</span></>}
      {secondaryClass&&<><span style={{color:"#2a3060",flexShrink:0}}>›</span><span style={{fontSize:11,color:secondaryClass.color,fontWeight:600,opacity:0.7,flexShrink:0}}>{secondaryClass.emoji} {secondaryClass.name}</span></>}
      {level>1&&<><span style={{color:"#2a3060",flexShrink:0}}>›</span><span style={{fontSize:11,color:"#f39c12",fontWeight:700,flexShrink:0}}>Niv.{level}{prestige>0?` P${prestige}`:""}</span></>}
    </div>
    {/* Action buttons */}
    <div style={{display:"flex",gap:6,flexShrink:0}}>
      <button onClick={()=>setShowImport(true)} style={{width:34,height:34,borderRadius:10,border:"1px solid #1e2548",background:"#ffffff05",color:"#6878a0",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="#f39c1215";e.currentTarget.style.color="#f39c12";e.currentTarget.style.borderColor="#f39c1240"}}
        onMouseLeave={e=>{e.currentTarget.style.background="#ffffff05";e.currentTarget.style.color="#6878a0";e.currentTarget.style.borderColor="#1e2548"}}
        title="Importer un build">📥</button>
      <button onClick={()=>setShowShareCard(true)} style={{width:34,height:34,borderRadius:10,border:"1px solid #1e2548",background:"#ffffff05",color:"#6878a0",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="#30c8b015";e.currentTarget.style.color="#30c8b0";e.currentTarget.style.borderColor="#30c8b040"}}
        onMouseLeave={e=>{e.currentTarget.style.background="#ffffff05";e.currentTarget.style.color="#6878a0";e.currentTarget.style.borderColor="#1e2548"}}
        title="Exporter en image">📸</button>
    </div>
  </div>
  {/* Tabs */}
  <div style={{display:"flex",gap:1,overflowX:"auto",paddingBottom:0,scrollbarWidth:"none"}}>
    {TABS.map(t=>{const active=tab===t.id;const done=t.id==="race"?!!selectedRace:t.id==="class"?!!primaryClass:t.id==="stats"?usedSP>0:t.id==="augments"?selectedAugments.length>0||Object.values(augBonus).some(v=>v>0):t.id==="dps"?!!selectedRace&&!!primaryClass:t.id==="builds"?savedBuilds.length>0:false;
    return(<button key={t.id} onClick={()=>setTab(t.id)} style={{
      padding:"10px 16px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,
      whiteSpace:"nowrap",flexShrink:0,fontFamily:"var(--fb)",fontWeight:700,fontSize:12,
      background:active?"var(--card)":"transparent",
      color:active?"#f39c12":"#4a5478",
      borderRadius:"12px 12px 0 0",
      borderBottom:active?"2px solid #f39c12":"2px solid transparent",
      transition:"all 0.2s",position:"relative",
    }}
    onMouseEnter={e=>{if(!active)e.currentTarget.style.color="#8090b8"}}
    onMouseLeave={e=>{if(!active)e.currentTarget.style.color="#4a5478"}}
    ><span style={{fontSize:14}}>{t.emoji}</span><span className="tab-label">{t.label}</span>
    {done&&<span style={{width:6,height:6,borderRadius:"50%",background:"#2ed573",boxShadow:"0 0 6px #2ed57360",flexShrink:0}}/>}
    </button>)})}
  </div>
</div><div style={{padding:"16px 20px",maxWidth:1200,margin:"0 auto"}}>{tab==="race"&&<RaceTab selectedRace={selectedRace} setSelectedRace={setSelectedRace} selectedEvo={selectedEvo} setSelectedEvo={setSelectedEvo}/>}{tab==="class"&&<ClassTab primaryClass={primaryClass} setPrimaryClass={setPrimaryClass} secondaryClass={secondaryClass} setSecondaryClass={setSecondaryClass} primaryTier={primaryTier} setPrimaryTier={setPrimaryTier} secondaryTier={secondaryTier} setSecondaryTier={setSecondaryTier}/>}{tab==="stats"&&<StatsTab level={level} setLevel={setLevel} prestige={prestige} setPrestige={setPrestige} skillPoints={skillPoints} setSkillPoints={setSkillPoints} totalSP={totalSP} usedSP={usedSP} selectedRace={selectedRace} primaryClass={primaryClass} primaryTier={primaryTier} secondaryClass={secondaryClass} secondaryTier={secondaryTier} augBonus={totalAugBonus} postBonus={postBonus} selectedEvo={selectedEvo}/>}{tab==="augments"&&<AugmentsTab selectedAugments={selectedAugments} setSelectedAugments={setSelectedAugments} augBonus={augBonus} setAugBonus={setAugBonus}/>}{tab==="dps"&&<DpsTab computedStats={finalComputedStats} selectedRace={selectedRace} primaryClass={primaryClass} selectedEvo={selectedEvo}/>}{tab==="summary"&&<SummaryTab state={state}/>}{tab==="builds"&&<BuildsManagerTab savedBuilds={savedBuilds} onLoad={handleLoadBuild} onDelete={handleDeleteBuild} currentState={state} onSave={handleSaveBuild}/>}{tab==="compare"&&<CompareTab savedBuilds={savedBuilds} currentState={state}/>}</div>{showImport&&<ImportDialog onImport={handleImport} onClose={()=>setShowImport(false)}/>}{showShareCard&&<ShareCard state={state} onClose={()=>setShowShareCard(false)}/>}</div>)}


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
  const [menuOpen, setMenuOpen] = useState(false);
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
  const go = (id) => { if (id === "discord") window.open("https://discord.gg/7YmTATJcf", "_blank"); else setPage(id); setMenuOpen(false); };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || menuOpen ? `${G.bg}ee` : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${G.border}` : "none",
      transition: "all 0.4s ease", padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)" }}>C</div>
          <span className="nav-title" style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--fd)", background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CielDeVignis</span>
        </div>
        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 4 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: page === l.id ? `${G.accent}18` : "transparent",
              color: page === l.id ? G.accent : G.muted,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--fb)",
            }}>
              <span style={{ fontSize: 15 }}>{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
        {/* Mobile hamburger */}
        <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "none", border: "none", color: G.muted, fontSize: 24, cursor: "pointer", padding: 8,
        }}>{menuOpen ? "✕" : "☰"}</button>
      </div>
      {/* Mobile menu */}
      {menuOpen && <div className="nav-mobile-menu" style={{
        display: "none", flexDirection: "column", gap: 2, padding: "8px 0 16px",
        borderTop: `1px solid ${G.border}`, animation: "fadeSlideUp 0.2s ease",
      }}>
        {links.map(l => (
          <button key={l.id} onClick={() => go(l.id)} style={{
            padding: "12px 16px", borderRadius: 10, border: "none", width: "100%", textAlign: "left",
            background: page === l.id ? `${G.accent}12` : "transparent",
            color: page === l.id ? G.accent : G.text,
            fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--fb)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>{l.label}
          </button>
        ))}
      </div>}
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
          <button onClick={() => window.open("https://discord.gg/7YmTATJcf", "_blank")} style={{
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
      <footer style={{ borderTop: `1px solid ${G.border}`, background: `${G.card}80`, marginTop: 20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 36 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${G.accent}, ${G.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)" }}>C</div>
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--fd)", color: "#fff" }}>CielDeVignis</span>
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                Serveur communautaire Hytale PvE.
                <br/>Explore, combats, théorycraft.
              </p>
            </div>
            {/* Outils */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, fontFamily: "var(--fd)" }}>Outils</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{label:"Build Creator",icon:"⚔️",id:"builds"},{label:"Wiki",icon:"📖",id:"wiki"}].map(l=>(
                  <span key={l.id} onClick={()=>setPage(l.id)} style={{ fontSize: 13, color: G.muted, cursor: "pointer", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={e=>e.currentTarget.style.color=G.accent}
                    onMouseLeave={e=>e.currentTarget.style.color=G.muted}
                  >{l.icon} {l.label}</span>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, fontFamily: "var(--fd)" }}>Contenu</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{v:"12",l:"Races",c:G.accent2},{v:"14",l:"Classes",c:G.accent},{v:"55",l:"Augments",c:G.purple},{v:"72",l:"Évolutions",c:G.teal}].map(s=>(
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: G.muted }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: s.c, minWidth: 24 }}>{s.v}</span>{s.l}
                  </div>
                ))}
              </div>
            </div>
            {/* Communauté */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, fontFamily: "var(--fd)" }}>Communauté</div>
              <a href="https://discord.gg/7YmTATJcf" target="_blank" rel="noopener" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
                borderRadius: 12, background: "#5865F215", border: "1px solid #5865F230",
                color: "#5865F2", textDecoration: "none", fontSize: 13, fontWeight: 700,
                transition: "all 0.2s", fontFamily: "var(--fb)",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="#5865F225";e.currentTarget.style.borderColor="#5865F250"}}
              onMouseLeave={e=>{e.currentTarget.style.background="#5865F215";e.currentTarget.style.borderColor="#5865F230"}}
              >💬 Rejoindre le Discord</a>
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#3a4468" }}>© 2025 CielDeVignis — EndlessLeveling v6.7</div>
            <div style={{ fontSize: 11, color: "#3a4468" }}>Fait avec passion pour la communauté Hytale</div>
          </div>
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
      body { background: ${G.bg}; overflow-x: hidden; font-family: var(--fb); }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #1a204080; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #6878a060; }
      h1, h2, h3, h4 { font-family: var(--fd); }
      input[type="range"] { height: 4px; }
      select { font-family: var(--fb); }
      button { font-family: var(--fb); }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(20px); }
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
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 4px currentColor; }
        50% { box-shadow: 0 0 10px currentColor; }
      }
      /* Responsive navbar */
      @media (max-width: 768px) {
        .nav-desktop { display: none !important; }
        .nav-burger { display: block !important; }
        .nav-mobile-menu { display: flex !important; }
      }
      @media (min-width: 769px) {
        .nav-burger { display: none !important; }
        .nav-mobile-menu { display: none !important; }
      }
      /* Responsive tabs — hide labels on small screens */
      @media (max-width: 540px) {
        .tab-label { display: none; }
      }
      /* Hide scrollbar on tabs */
      div::-webkit-scrollbar { height: 0; }
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
