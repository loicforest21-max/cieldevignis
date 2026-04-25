// ═══════════════════════════════════════════════════
// SEARCH INDEX — Global search across all site content
// ═══════════════════════════════════════════════════
// The index is built once on first call (~9000 entries),
// then cached for the rest of the session.
// Each entry has: { id, name, type, sub, page, payload }
// where:
//   id      — unique identifier (raw)
//   name    — display name
//   type    — "item" | "race" | "class" | "dungeon" | "mod" | "page"
//   sub     — secondary text shown below the name
//   page    — target page id ("wiki", "dungeons", etc.)
//   payload — extra context for the destination page (item id, race id, etc.)

let cachedIndex = null;
let buildPromise = null;

const PAGES = [
  {
    id: "page:home",
    name: "Accueil",
    type: "page",
    sub: "Le Royaume Hytale — page d'accueil",
    page: "home",
    icon: "🏠",
  },
  {
    id: "page:builds",
    name: "Build Creator",
    type: "page",
    sub: "Forger ta combinaison race × classe × augments",
    page: "builds",
    icon: "⚔️",
  },
  {
    id: "page:community",
    name: "Communauté",
    type: "page",
    sub: "Place des Aventuriers — partage de builds",
    page: "community",
    icon: "🌍",
  },
  {
    id: "page:dungeons",
    name: "Donjons",
    type: "page",
    sub: "Carte des donjons par tier",
    page: "dungeons",
    icon: "🏰",
  },
  {
    id: "page:wiki",
    name: "Wiki",
    type: "page",
    sub: "Codex du Royaume — items, mobs, craft",
    page: "wiki",
    icon: "📖",
  },
  {
    id: "page:mods",
    name: "Mods",
    type: "page",
    sub: "Bibliothèque des Arcanes",
    page: "mods",
    icon: "🧩",
  },
  {
    id: "page:map",
    name: "Carte",
    type: "page",
    sub: "Cartographie du Royaume — monde ouvert",
    page: "map",
    icon: "🗺️",
  },
  {
    id: "page:join",
    name: "Rejoindre",
    type: "page",
    sub: "Le Portail du Royaume — coordonnées du serveur",
    page: "join",
    icon: "🔮",
  },
];

// Format an item id like "Armor_Adamantite_Chest" → "Armor Adamantite Chest"
function fmtItem(id) {
  return id ? id.replace(/_/g, " ") : "";
}

async function buildIndex() {
  // Lazy import all data modules in parallel
  const [coreMod, wikiMod, dungeonsMod] = await Promise.all([
    import("../data/core.js"),
    import("../data/wiki.js"),
    import("../data/dungeons.js"),
  ]);

  // Mods are not in a shared data module yet — keep a minimal hardcoded list
  // synced with what's documented in ModsPage. Update as new mods are documented.
  const MODS_LIST = [
    { id: "endgame", name: "Endgame", desc: "Donjons et items endgame, Prisma/Onyxium/Mithril" },
    { id: "qol", name: "QoL", desc: "Améliorations Quality of Life du gameplay" },
  ];

  const { RACES, CLASSES } = coreMod;
  const { WIKI_ITEMS, WIKI_MOBS } = wikiMod;
  const { DUNGEONS } = dungeonsMod;

  const idx = [];

  // Pages
  PAGES.forEach((p) => idx.push(p));

  // Races
  RACES.forEach((r) => {
    idx.push({
      id: `race:${r.id}`,
      name: r.name,
      type: "race",
      sub: r.desc || "Race",
      page: "builds",
      payload: { tab: "race", raceId: r.id },
      icon: r.emoji || "✦",
    });
  });

  // Classes
  CLASSES.forEach((c) => {
    idx.push({
      id: `class:${c.id}`,
      name: c.name,
      type: "class",
      sub: `${c.dmg} · ${c.range || "mêlée"} · ${(c.roles || []).join(", ")}`,
      page: "builds",
      payload: { tab: "class", classId: c.id },
      icon: c.emoji || "⚔",
    });
  });

  // Dungeons
  DUNGEONS.forEach((d) => {
    const bossText =
      d.bosses && d.bosses.length > 0
        ? `Boss : ${d.bosses.map((b) => b.name).join(", ")}`
        : `Tier ${d.tier || "?"}`;
    idx.push({
      id: `dungeon:${d.id}`,
      name: d.name,
      type: "dungeon",
      sub: `${d.tier || "Tier ?"} · ${bossText}`,
      page: "dungeons",
      payload: { dungeonId: d.id },
      icon: d.icon || "🏰",
    });
  });

  // Items
  WIKI_ITEMS.forEach((it) => {
    if (it.q === "Hidden" || it.q === "junk") return; // skip junk
    const name = fmtItem(it.id);
    const subParts = [];
    if (it.c) subParts.push(it.c);
    if (it.q) subParts.push(it.q);
    if (it.l) subParts.push(`Niv. ${it.l}`);
    if (it.dmg) subParts.push(`${it.dmg} DMG`);
    idx.push({
      id: `item:${it.id}`,
      name,
      type: "item",
      sub: subParts.join(" · "),
      quality: it.q,
      page: "wiki",
      payload: { tab: "items", itemId: it.id },
      icon: "📦",
    });
  });

  // Mobs
  WIKI_MOBS.forEach((m) => {
    const name = fmtItem(m.id);
    const subParts = [];
    if (m.c) subParts.push(m.c);
    if (m.l) subParts.push(`Niv. ${m.l}`);
    if (m.hp) subParts.push(`${m.hp} HP`);
    idx.push({
      id: `mob:${m.id}`,
      name,
      type: "mob",
      sub: subParts.join(" · "),
      page: "wiki",
      payload: { tab: "mobs", mobId: m.id },
      icon: "🐾",
    });
  });

  // Mods (small inline list — not tied to mods data structure for now)
  MODS_LIST.forEach((m) => {
    idx.push({
      id: `mod:${m.id}`,
      name: m.name,
      type: "mod",
      sub: m.desc,
      page: "mods",
      payload: { modId: m.id },
      icon: "🧩",
    });
  });

  return idx;
}

// Public API: returns the cached index, building it on first call
export async function getSearchIndex() {
  if (cachedIndex) return cachedIndex;
  if (buildPromise) return buildPromise;
  buildPromise = buildIndex().then((idx) => {
    cachedIndex = idx;
    buildPromise = null;
    return idx;
  });
  return buildPromise;
}

// ─── Fuzzy-ish ranked search ───
// Scoring:
//  +100 exact match
//  +60  starts-with match
//  +30  word-boundary match
//  +10  substring match anywhere
// Plus per-type boosts: page > race/class/dungeon > mod > item > mob
const TYPE_BOOST = {
  page: 50,
  race: 30,
  class: 30,
  dungeon: 25,
  mod: 20,
  item: 5,
  mob: 0,
};

export function searchIndex(idx, query, maxPerType = 6) {
  const q = (query || "").trim().toLowerCase();
  if (!q || !idx) return [];

  const results = [];
  for (const e of idx) {
    const name = e.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 60;
    else if (new RegExp("\\b" + escapeRegex(q)).test(name)) score = 30;
    else if (name.includes(q)) score = 10;
    if (score > 0) {
      results.push({ entry: e, score: score + (TYPE_BOOST[e.type] || 0) });
    }
  }

  // Sort by score desc, then by name asc
  results.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));

  // Cap per-type to avoid one type drowning others
  const counts = {};
  const capped = [];
  for (const r of results) {
    const t = r.entry.type;
    counts[t] = (counts[t] || 0) + 1;
    if (counts[t] <= maxPerType) capped.push(r.entry);
  }
  return capped.slice(0, 30); // hard ceiling
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
