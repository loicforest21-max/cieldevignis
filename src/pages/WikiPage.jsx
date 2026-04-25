// ═══════════════════════════════════════════════════
// WIKI PAGE — Items, mobs, salvage, craft database
// ═══════════════════════════════════════════════════
import { useState, useMemo, useEffect } from "react";
import {
  WIKI_ITEMS,
  WIKI_MOBS,
  WIKI_RECIPES,
  ITEM_CATS,
  MOB_CATS,
  SALVAGE_CATS,
} from "../data/wiki.js";
import { QUALITY_COLORS } from "../data/core.js";
import { G } from "../styles.jsx";
import { ItemImg } from "../components/ItemImg.jsx";

function WikiPage() {
  const [wikiTab, setWikiTab] = useState("items");
  const [cat, setCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  // Advanced filters
  const [qualities, setQualities] = useState([]);
  const [lvlMin, setLvlMin] = useState("");
  const [lvlMax, setLvlMax] = useState("");
  const [sort, setSort] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  // Calculator state
  const [calcItems, setCalcItems] = useState([]);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcSearch, setCalcSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(50);
  // Comparator state
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const toggleCompare = (id) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  const compareItems2 = compareIds.map((id) => WIKI_ITEMS.find((i) => i.id === id)).filter(Boolean);
  const canCompare = (r) => r.c === "Weapon" || r.c === "Armor";
  const fmtItem = (s) => (s ? s.replace(/_/g, " ") : "");
  const switchTab = (t) => {
    setWikiTab(t);
    setCat("ALL");
    setSearch("");
    setExpanded(null);
    setQualities([]);
    setLvlMin("");
    setLvlMax("");
    setSort("name");
    setDisplayCount(50);
  };
  const toggleQuality = (q) =>
    setQualities((prev) => (prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]));
  const clearAdvanced = () => {
    setQualities([]);
    setLvlMin("");
    setLvlMax("");
    setSort("name");
  };
  const hasAdvanced = qualities.length > 0 || lvlMin !== "" || lvlMax !== "" || sort !== "name";
  useEffect(() => {
    setDisplayCount(50);
  }, [cat, search, sort]);
  // Filter out debug/dev/template/test items globally
  const HIDDEN_QUALITIES = new Set(["Debug", "Developer", "Template", "Technical"]);
  const wikiItems = useMemo(() => WIKI_ITEMS.filter((i) => !HIDDEN_QUALITIES.has(i.q)), []);
  const wikiMobs = useMemo(() => WIKI_MOBS.filter((m) => m.c !== "_Core"), []);
  const wikiRecipes = useMemo(
    () =>
      WIKI_RECIPES.filter((r) => {
        const item = WIKI_ITEMS.find((i) => i.id === r.id);
        return !item || !HIDDEN_QUALITIES.has(item.q);
      }),
    []
  );
  const tabs = [
    { id: "items", label: "Objets", icon: "⚔️", count: wikiItems.length },
    { id: "mobs", label: "Créatures", icon: "🐉", count: wikiMobs.length },
    { id: "salvage", label: "Salvage", icon: "♻️", count: wikiRecipes.length },
    {
      id: "craft",
      label: "Craft",
      icon: "🔨",
      count: wikiItems.filter((i) => i.r && i.r.length > 0).length,
    },
  ];
  // Craft bench categories
  const CRAFT_BENCHES = [
    { id: "Weapon_Bench", icon: "⚔️", label: "Armes", color: "#e8653a" },
    { id: "Armor_Bench", icon: "🛡️", label: "Armures", color: "#4ea8f0" },
    { id: "Armory", icon: "🏰", label: "Armurerie", color: "#845ef7" },
    { id: "Alchemybench", icon: "⚗️", label: "Alchimie", color: "#845ef7" },
    { id: "Cookingbench", icon: "🍳", label: "Cuisine", color: "#51cf66" },
    { id: "Campfire", icon: "🔥", label: "Feu de camp", color: "#e8653a" },
    { id: "Workbench", icon: "🔧", label: "Établi", color: "#f5a623" },
    { id: "Farmingbench", icon: "🌾", label: "Agriculture", color: "#51cf66" },
    { id: "Furnace", icon: "🔥", label: "Fourneau", color: "#e8653a" },
    { id: "Arcanebench", icon: "✨", label: "Arcane", color: "#845ef7" },
    { id: "Fieldcraft", icon: "🏕️", label: "Fieldcraft", color: "#3dd8c5" },
    { id: "Gauntlet_Anvil_Bench", icon: "🥊", label: "Gantelets", color: "#e8653a" },
    { id: "Runecrafter's Table", icon: "🔮", label: "Runecraft", color: "#845ef7" },
    { id: "Endgame_Bench", icon: "⚡", label: "Endgame", color: "#f5a623" },
    { id: "Necrobench", icon: "💀", label: "Nécro", color: "#845ef7" },
    { id: "KebKatana_Bench", icon: "⚔️", label: "Katanas", color: "#e8653a" },
    { id: "BenchMagicGearCraft", icon: "🪄", label: "Magie RPG", color: "#4ea8f0" },
    { id: "BenchMagicGearCraftUpgrades", icon: "⬆️", label: "Magie RPG+", color: "#4ea8f0" },
    { id: "EEG_Refinery", icon: "🔩", label: "Raffinerie", color: "#f5a623" },
    { id: "Tannery", icon: "🧶", label: "Tannerie", color: "#f5a623" },
    { id: "UMT_Loombench", icon: "🧵", label: "Métier à tisser", color: "#3dd8c5" },
    { id: "Hedera_Autel", icon: "🌿", label: "Autel Hedera", color: "#51cf66" },
    { id: "Enchantingbench", icon: "📜", label: "Enchantements", color: "#845ef7" },
    { id: "HyFishing_AnglerBench", icon: "🐟", label: "Pêche", color: "#4ea8f0" },
    { id: "Furniture_Bench", icon: "🪑", label: "Mobilier", color: "#c8882a" },
    { id: "Aurescraftingbench", icon: "🏡", label: "Aures Craft", color: "#c8882a" },
    { id: "Windows", icon: "🪟", label: "Fenêtres", color: "#3dd8c5" },
    { id: "Mcw_Lights_Bench", icon: "💡", label: "Lumières McwHy", color: "#f5a623" },
    { id: "Mcw_Carpets_Bench", icon: "🟥", label: "Tapis McwHy", color: "#e8653a" },
    { id: "Mcw_Doors_Bench", icon: "🚪", label: "Portes McwHy", color: "#c8882a" },
    { id: "Mcw_Furniture_Bench", icon: "🛋️", label: "Meuble McwHy", color: "#c8882a" },
    { id: "Builders", icon: "🧱", label: "Bâtisseur", color: "#f5a623" },
    { id: "N1Furniture_Bench", icon: "🪑", label: "Mobilier N1", color: "#c8882a" },
    { id: "LRP_Carpentry", icon: "🪵", label: "Menuiserie LotR", color: "#c8882a" },
    { id: "Armor_Bench_Elven", icon: "🧝", label: "Armure Elfique", color: "#4ea8f0" },
    { id: "Weapon_Bench_Elven", icon: "⚔️", label: "Arme Elfique", color: "#e8653a" },
    { id: "Mjolnir_Furnace", icon: "⚡", label: "Forge Mjolnir", color: "#f5a623" },
    { id: "Empacotador", icon: "📦", label: "Empacotador", color: "#7c8db5" },
    { id: "Mcw_Paths_Bench", icon: "🛤️", label: "Chemins McwHy", color: "#c8882a" },
    { id: "McwPaths_Bench", icon: "🛤️", label: "Chemins McwHy", color: "#c8882a" },
    { id: "Mcw_Windows_Bench", icon: "🪟", label: "Fenêtres McwHy", color: "#3dd8c5" },
    { id: "Bench_Music", icon: "🎵", label: "Musique", color: "#845ef7" },
    { id: "SOLrangebench", icon: "🍳", label: "Cuisinière SoL", color: "#51cf66" },
    { id: "Salmakia_Kitchen_Furniture", icon: "🍽️", label: "Cuisine Salmakia", color: "#c8882a" },
    { id: "Salmakia_Tea_Bench", icon: "🍵", label: "Thé Salmakia", color: "#51cf66" },
    { id: "NoCube_Bench_Brewing_Cauldron", icon: "🍺", label: "Brassage", color: "#f5a623" },
    { id: "NoCube_Bench_Fruit_Press", icon: "🍇", label: "Pressoir", color: "#51cf66" },
    { id: "NoCube_Bench_Keg", icon: "🛢️", label: "Tonneau", color: "#f5a623" },
    { id: "NoCube_Bench_Orchard", icon: "🌳", label: "Verger", color: "#51cf66" },
    { id: "NoCube_Aging_Cask", icon: "🪵", label: "Fût vieilliss.", color: "#c8882a" },
    { id: "SOL_Beehive", icon: "🐝", label: "Ruche", color: "#f5a623" },
    { id: "Potions", icon: "🧪", label: "Potions Sig", color: "#845ef7" },
    { id: "Bench_Violet_Clothing", icon: "👗", label: "Vêtements Violet", color: "#e060a0" },
    { id: "Bench_Violet_Plushie", icon: "🧸", label: "Peluches Violet", color: "#e060a0" },
    { id: "YmmersiveCarpentry", icon: "🪚", label: "Menuiserie Ymm.", color: "#c8882a" },
    { id: "YmmersiveMasonry", icon: "🧱", label: "Maçonnerie Ymm.", color: "#7c8db5" },
    { id: "DarkCoinShop", icon: "🪙", label: "Boutique Sombre", color: "#845ef7" },
    { id: "Bench_Writing_Desk", icon: "📝", label: "Bureau d'écriture", color: "#4ea8f0" },
    { id: "Bench_Palantir", icon: "🔮", label: "Palantír", color: "#845ef7" },
    { id: "Galadriel_Mirror", icon: "🪞", label: "Miroir Galadriel", color: "#3dd8c5" },
    { id: "Salvagebench", icon: "♻️", label: "Recyclage", color: "#7c8db5" },
    { id: "Tritale_Cadence_Shovel", icon: "⛏️", label: "Pelle Cadence", color: "#f5a623" },
    { id: "Furniture_Misc", icon: "🪑", label: "Mobilier Divers", color: "#c8882a" },
    { id: "Architectsbench", icon: "📐", label: "Architecte", color: "#f5a623" },
    { id: "ArmorBench", icon: "🛡️", label: "Armures (alt)", color: "#4ea8f0" },
    { id: "Loombench", icon: "🧵", label: "Métier à tisser", color: "#3dd8c5" },
    { id: "TODO", icon: "📋", label: "Non assigné", color: "#7c8db5" },
  ];
  const activeCats =
    wikiTab === "items"
      ? ITEM_CATS
      : wikiTab === "mobs"
        ? MOB_CATS
        : wikiTab === "craft"
          ? CRAFT_BENCHES
          : SALVAGE_CATS;
  // Craft helpers
  const ITEM_MAP = useMemo(() => Object.fromEntries(WIKI_ITEMS.map((i) => [i.id, i])), []);
  const craftableItems = useMemo(() => wikiItems.filter((i) => i.r && i.r.length > 0), [wikiItems]);
  // Build flat list of all raw materials needed
  const flattenRecipe = (id, qty, seen) => {
    if (!seen) seen = new Set();
    if (seen.has(id)) return [{ id, qty, raw: true }];
    const item = ITEM_MAP[id];
    if (!item || !item.r || item.r.length === 0) return [{ id, qty, raw: true }];
    seen.add(id);
    const results = [];
    item.r.forEach(([ingId, ingQty]) => {
      const sub = flattenRecipe(ingId, ingQty * qty, new Set(seen));
      sub.forEach((s) => {
        const existing = results.find((r) => r.id === s.id);
        if (existing) existing.qty += s.qty;
        else results.push({ ...s });
      });
    });
    return results;
  };
  // Calculator helpers
  const addToCalc = (id) => {
    setCalcItems((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
    if (!calcOpen) setCalcOpen(true);
  };
  const setCalcQty = (id, qty) => {
    if (qty <= 0) return setCalcItems((prev) => prev.filter((c) => c.id !== id));
    setCalcItems((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  };
  const removeFromCalc = (id) => setCalcItems((prev) => prev.filter((c) => c.id !== id));
  // Compute combined raw materials for all calc items
  const calcTotalMats = useMemo(() => {
    const combined = [];
    calcItems.forEach(({ id, qty }) => {
      const mats = flattenRecipe(id, qty, new Set());
      mats.forEach((m) => {
        const existing = combined.find((c) => c.id === m.id);
        if (existing) existing.qty += m.qty;
        else combined.push({ ...m });
      });
    });
    return combined.sort((a, b) => b.qty - a.qty);
  }, [calcItems]);
  const calcIntermediates = useMemo(() => {
    const inter = [];
    const collect = (id, qty, seen) => {
      if (!seen) seen = new Set();
      if (seen.has(id)) return;
      const item = ITEM_MAP[id];
      if (!item || !item.r || item.r.length === 0) return;
      seen.add(id);
      item.r.forEach(([ingId, ingQty]) => {
        const sub = ITEM_MAP[ingId];
        if (sub && sub.r && sub.r.length > 0) {
          const totalQty = ingQty * qty;
          const existing = inter.find((c) => c.id === ingId);
          if (existing) existing.qty += totalQty;
          else inter.push({ id: ingId, qty: totalQty, bench: sub.b });
          collect(ingId, totalQty, new Set(seen));
        }
      });
    };
    calcItems.forEach(({ id, qty }) => collect(id, qty, new Set()));
    return inter.sort((a, b) => b.qty - a.qty);
  }, [calcItems]);
  const calcSearchResults =
    calcSearch.length >= 2
      ? craftableItems
          .filter(
            (r) =>
              r.id.toLowerCase().includes(calcSearch.toLowerCase()) &&
              !calcItems.find((c) => c.id === r.id)
          )
          .slice(0, 8)
      : [];
  // Helper: compute total DPS for an item
  const itemDPS = (r) => (r.dmg ? r.dmg.reduce((s, d) => s + d.d, 0) : 0);
  // Helper: compute total resistance for an item
  const itemRes = (r) => (r.res ? Object.values(r.res).reduce((s, v) => s + v, 0) : 0);
  // Helper: mob total damage
  const mobDmg = (r) => (r.dmg ? r.dmg.reduce((s, d) => s + d.d, 0) : 0);
  // Quality sort order for consistent ordering
  const QUALITY_ORDER = {
    Common: 0,
    Uncommon: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4,
    Debug: 5,
    Developer: 6,
    Template: 7,
    Technical: 8,
  };
  // Sorting functions
  const sortItems = (arr) => {
    const sorted = [...arr];
    switch (sort) {
      case "level":
        return sorted.sort((a, b) => (a.l || 0) - (b.l || 0));
      case "level_desc":
        return sorted.sort((a, b) => (b.l || 0) - (a.l || 0));
      case "dps":
        return sorted.sort((a, b) => itemDPS(b) - itemDPS(a));
      case "res":
        return sorted.sort((a, b) => itemRes(b) - itemRes(a));
      case "dur":
        return sorted.sort((a, b) => (b.dur || 0) - (a.dur || 0));
      case "quality":
        return sorted.sort((a, b) => (QUALITY_ORDER[b.q] || 0) - (QUALITY_ORDER[a.q] || 0));
      default:
        return sorted;
    }
  };
  const sortMobs = (arr) => {
    const sorted = [...arr];
    switch (sort) {
      case "hp":
        return sorted.sort((a, b) => (b.hp || 0) - (a.hp || 0));
      case "hp_asc":
        return sorted.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      case "dmg":
        return sorted.sort((a, b) => mobDmg(b) - mobDmg(a));
      case "spd":
        return sorted.sort((a, b) => (b.spd || 0) - (a.spd || 0));
      default:
        return sorted;
    }
  };
  const sortSalvage = (arr) => {
    const sorted = [...arr];
    switch (sort) {
      case "time":
        return sorted.sort((a, b) => (a.t || 0) - (b.t || 0));
      case "outputs":
        return sorted.sort((a, b) => (b.o ? b.o.length : 0) - (a.o ? a.o.length : 0));
      default:
        return sorted;
    }
  };
  const filteredItems =
    wikiTab === "items"
      ? sortItems(
          wikiItems.filter((r) => {
            if (cat !== "ALL" && r.c !== cat) return false;
            if (search && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
            if (qualities.length > 0 && !qualities.includes(r.q)) return false;
            if (lvlMin !== "" && (r.l || 0) < parseInt(lvlMin)) return false;
            if (lvlMax !== "" && (r.l || 0) > parseInt(lvlMax)) return false;
            return true;
          })
        )
      : [];
  const filteredMobs =
    wikiTab === "mobs"
      ? sortMobs(
          wikiMobs.filter((r) => {
            if (cat !== "ALL" && r.c !== cat) return false;
            if (
              search &&
              !r.id.toLowerCase().includes(search.toLowerCase()) &&
              !(r.app || "").toLowerCase().includes(search.toLowerCase())
            )
              return false;
            return true;
          })
        )
      : [];
  const filteredSalvage =
    wikiTab === "salvage"
      ? sortSalvage(
          wikiRecipes.filter((r) => {
            if (cat !== "ALL" && r.c !== cat) return false;
            if (
              search &&
              !r.n.toLowerCase().includes(search.toLowerCase()) &&
              !r.id.toLowerCase().includes(search.toLowerCase())
            )
              return false;
            return true;
          })
        )
      : [];
  const sortCraft = (arr) => {
    const sorted = [...arr];
    switch (sort) {
      case "level":
        return sorted.sort((a, b) => (a.l || 0) - (b.l || 0));
      case "level_desc":
        return sorted.sort((a, b) => (b.l || 0) - (a.l || 0));
      case "quality":
        return sorted.sort((a, b) => (QUALITY_ORDER[b.q] || 0) - (QUALITY_ORDER[a.q] || 0));
      case "ingredients":
        return sorted.sort((a, b) => (b.r ? b.r.length : 0) - (a.r ? a.r.length : 0));
      default:
        return sorted;
    }
  };
  const filteredCraft =
    wikiTab === "craft"
      ? sortCraft(
          craftableItems.filter((r) => {
            if (cat !== "ALL" && r.b !== cat) return false;
            if (search && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
            if (qualities.length > 0 && !qualities.includes(r.q)) return false;
            if (lvlMin !== "" && (r.l || 0) < parseInt(lvlMin)) return false;
            if (lvlMax !== "" && (r.l || 0) > parseInt(lvlMax)) return false;
            return true;
          })
        )
      : [];
  const totalFiltered =
    wikiTab === "items"
      ? filteredItems.length
      : wikiTab === "mobs"
        ? filteredMobs.length
        : wikiTab === "craft"
          ? filteredCraft.length
          : filteredSalvage.length;
  // Sort options per tab
  const SORT_OPTIONS = {
    items: [
      { id: "name", label: "Nom (A-Z)" },
      { id: "level", label: "Niveau ↑" },
      { id: "level_desc", label: "Niveau ↓" },
      { id: "quality", label: "Qualité ↓" },
      { id: "dps", label: "Dégâts ↓" },
      { id: "res", label: "Résistance ↓" },
      { id: "dur", label: "Durabilité ↓" },
    ],
    mobs: [
      { id: "name", label: "Nom (A-Z)" },
      { id: "hp", label: "HP ↓" },
      { id: "hp_asc", label: "HP ↑" },
      { id: "dmg", label: "Dégâts ↓" },
      { id: "spd", label: "Vitesse ↓" },
    ],
    salvage: [
      { id: "name", label: "Nom (A-Z)" },
      { id: "time", label: "Temps ↑" },
      { id: "outputs", label: "Nb sorties ↓" },
    ],
    craft: [
      { id: "name", label: "Nom (A-Z)" },
      { id: "level", label: "Niveau ↑" },
      { id: "level_desc", label: "Niveau ↓" },
      { id: "quality", label: "Qualité ↓" },
      { id: "ingredients", label: "Nb ingrédients ↓" },
    ],
  };
  const ALL_QUALITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Magical night background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 620,
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
          left: "6%",
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
          top: 160,
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
          top: 420,
          right: "4%",
          width: 6,
          height: 6,
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
            borderBottom: "1px solid rgba(232,165,55,0.12)",
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
            📖
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 10,
              color: "#c9a5ff",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Codex du Royaume
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
            Wiki
          </h1>
          <p
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              fontSize: 13,
              color: "#a89075",
              margin: "0 0 10px",
            }}
          >
            « Toute la connaissance du Ciel de Vignis, consignée en ces pages »
          </p>
          <p style={{ fontSize: 13, color: G.muted, margin: 0 }}>
            {wikiItems.length} objets · {wikiMobs.length} créatures · {wikiRecipes.length} recettes
            salvage · {craftableItems.length} recettes craft
          </p>
        </div>
        {/* Tabs */}
        <div className="wiki-tabs-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={"wiki-tab" + (wikiTab === t.id ? " active" : "")}
            >
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}{" "}
              <span className="wiki-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
        {/* Filters */}
        {/* Category filters */}
        {wikiTab === "craft" ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 18,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={cat}
              onChange={(e) => {
                setCat(e.target.value);
                setDisplayCount(50);
              }}
              className="wiki-bench-select"
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid " + (cat !== "ALL" ? G.gold + "60" : G.border),
                background: cat !== "ALL" ? G.gold + "08" : G.card,
                color: cat !== "ALL" ? G.gold : G.muted,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--fb)",
                cursor: "pointer",
                outline: "none",
                minWidth: 220,
              }}
            >
              <option value="ALL">🔨 Tous les ateliers ({craftableItems.length})</option>
              {CRAFT_BENCHES.map((c) => {
                const cnt = craftableItems.filter((i) => i.b === c.id).length;
                return cnt > 0 ? (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label} ({cnt})
                  </option>
                ) : null;
              })}
            </select>
            {cat !== "ALL" && (
              <button
                onClick={() => {
                  setCat("ALL");
                  setDisplayCount(50);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + G.border,
                  background: "transparent",
                  color: G.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setCat("ALL");
                setDisplayCount(50);
              }}
              className={"wiki-chip" + (cat === "ALL" ? " active" : "")}
            >
              Tous
            </button>
            {activeCats.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCat(c.id);
                  setDisplayCount(50);
                }}
                className={"wiki-chip" + (cat === c.id ? " active" : "")}
              >
                <span style={{ fontSize: 13 }}>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="wiki-input-magic"
            style={{ flex: 1, minWidth: 200, maxWidth: 500, fontSize: 14 }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="wiki-input-magic"
            style={{
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              color: sort !== "name" ? "#e8a537" : "#a89075",
              appearance: "auto",
            }}
          >
            {(SORT_OPTIONS[wikiTab] || []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="wiki-chip"
            style={{
              color: showFilters || hasAdvanced ? "#e8a537" : "#a89075",
              background:
                showFilters || hasAdvanced ? "rgba(232,165,55,0.12)" : "rgba(26,22,16,0.5)",
              borderColor:
                showFilters || hasAdvanced ? "rgba(232,165,55,0.5)" : "rgba(232,165,55,0.18)",
            }}
          >
            <span style={{ fontSize: 14 }}>⚙️</span> Filtres{hasAdvanced ? " ●" : ""}
          </button>
        </div>
        {/* Advanced filters panel */}
        {showFilters && (
          <div
            style={{
              background: G.card,
              border: "1px solid " + G.border,
              borderRadius: "var(--radius-md)",
              padding: 16,
              marginBottom: 14,
            }}
          >
            {(wikiTab === "items" || wikiTab === "craft") && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: G.muted,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    Qualité
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {ALL_QUALITIES.map((q) => {
                      const qc = QUALITY_COLORS[q] || G.muted;
                      const active = qualities.includes(q);
                      return (
                        <button
                          key={q}
                          onClick={() => toggleQuality(q)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid " + (active ? qc : G.border),
                            background: active ? qc + "18" : "transparent",
                            color: active ? qc : G.muted,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "var(--fb)",
                          }}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: G.muted,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    Niveau
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      value={lvlMin}
                      onChange={(e) => setLvlMin(e.target.value)}
                      placeholder="Min"
                      min={1}
                      max={75}
                      style={{
                        width: 80,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid " + G.border,
                        background: G.bg,
                        color: "#f0e6d2",
                        fontSize: 13,
                        fontFamily: "var(--fb)",
                        outline: "none",
                        textAlign: "center",
                      }}
                    />
                    <span style={{ color: G.muted, fontSize: 13 }}>—</span>
                    <input
                      type="number"
                      value={lvlMax}
                      onChange={(e) => setLvlMax(e.target.value)}
                      placeholder="Max"
                      min={1}
                      max={75}
                      style={{
                        width: 80,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid " + G.border,
                        background: G.bg,
                        color: "#f0e6d2",
                        fontSize: 13,
                        fontFamily: "var(--fb)",
                        outline: "none",
                        textAlign: "center",
                      }}
                    />
                    <span style={{ fontSize: 11, color: G.muted }}>(1 – 75)</span>
                  </div>
                </div>
              </>
            )}
            {wikiTab !== "items" && wikiTab !== "craft" && (
              <div style={{ fontSize: 13, color: G.muted }}>
                Utilisez le tri ci-dessus pour ordonner les résultats.
              </div>
            )}
            {hasAdvanced && (
              <button
                onClick={clearAdvanced}
                style={{
                  marginTop: 12,
                  padding: "6px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + G.border,
                  background: "transparent",
                  color: G.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                }}
              >
                ✕ Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginBottom: 18,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
            padding: "8px 14px",
            background: G.card + "60",
            borderRadius: "var(--radius-md)",
            border: "1px solid " + G.border + "40",
          }}
        >
          <span>
            {totalFiltered} résultat{totalFiltered > 1 ? "s" : ""}
          </span>
          {sort !== "name" && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                background: G.teal + "12",
                color: G.teal,
              }}
            >
              Trié : {(SORT_OPTIONS[wikiTab] || []).find((o) => o.id === sort)?.label}
            </span>
          )}
          {qualities.length > 0 && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                background: G.purple + "12",
                color: G.purple,
              }}
            >
              {qualities.length} qualité{qualities.length > 1 ? "s" : ""}
            </span>
          )}
          {(lvlMin || lvlMax) && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                background: G.blue + "12",
                color: G.blue,
              }}
            >
              Niv. {lvlMin || "1"}–{lvlMax || "75"}
            </span>
          )}
        </div>

        {/* ITEMS */}
        {wikiTab === "items" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredItems.slice(0, displayCount).map((r) => {
              const isOpen = expanded === r.id;
              const catInfo = ITEM_CATS.find((c) => c.id === r.c) || { color: G.muted, icon: "📦" };
              const qc = QUALITY_COLORS[r.q] || G.muted;
              return (
                <div
                  key={r.id}
                  className={`wiki-row${isOpen ? " wiki-row-open" : ""}`}
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    background: isOpen ? G.card : "transparent",
                    border: "1px solid " + (isOpen ? qc + "40" : G.border + "40"),
                    borderLeft: "3px solid " + qc + (isOpen ? "" : "30"),
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px" }}
                  >
                    <ItemImg id={r.id} fallback={catInfo.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isOpen ? "#fff" : G.text,
                          fontFamily: "var(--fd)",
                        }}
                      >
                        {fmtItem(r.id)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: 11,
                          color: G.muted,
                          marginTop: 3,
                        }}
                      >
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: 3,
                            background: catInfo.color + "10",
                            color: catInfo.color,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {catInfo.icon} {catInfo.label}
                        </span>
                        {r.sc && (
                          <span
                            style={{
                              padding: "1px 6px",
                              borderRadius: 3,
                              background: G.border + "80",
                              color: G.muted,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {r.sc}
                          </span>
                        )}
                        {r.l > 0 && <span>Niv. {r.l}</span>}
                        {r.dur > 0 && <span>🔧 {r.dur}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {sort === "dps" && itemDPS(r) > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "#e8653a15",
                            color: "#e8653a",
                            fontWeight: 700,
                          }}
                        >
                          {itemDPS(r)} DMG
                        </span>
                      )}
                      {sort === "res" && itemRes(r) > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "#4ea8f015",
                            color: "#4ea8f0",
                            fontWeight: 700,
                          }}
                        >
                          {(itemRes(r) * 100).toFixed(0)}% RES
                        </span>
                      )}
                      {r.q && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: qc + "15",
                            color: qc,
                            fontWeight: 700,
                          }}
                        >
                          {r.q}
                        </span>
                      )}
                      {canCompare(r) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(r.id);
                          }}
                          title={
                            compareIds.includes(r.id)
                              ? "Retirer du comparateur"
                              : "Ajouter au comparateur (max 3)"
                          }
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            border: "1px solid " + (compareIds.includes(r.id) ? G.gold : G.border),
                            background: compareIds.includes(r.id) ? G.gold + "18" : "transparent",
                            color: compareIds.includes(r.id) ? G.gold : G.muted,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          ⚖️
                        </button>
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          color: G.muted,
                          transform: isOpen ? "rotate(180deg)" : "",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                  {isOpen && (
                    <div
                      className="wiki-expanded"
                      style={{
                        padding: "16px 18px 18px",
                        borderTop: "1px solid " + G.border + "60",
                        background: G.bg + "40",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 16,
                        }}
                      >
                        {r.dmg && r.dmg.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#e8653a",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              ⚔️ Dégâts{" "}
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: G.muted,
                                  textTransform: "none",
                                  letterSpacing: 0,
                                }}
                              >
                                ({itemDPS(r)} total)
                              </span>
                            </div>
                            {r.dmg.map((d, i) => (
                              <div
                                key={i}
                                className="wiki-stat-card"
                                style={{
                                  background: "#e8653a06",
                                  border: "1px solid #e8653a15",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  marginBottom: 4,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 12,
                                }}
                              >
                                <span style={{ color: G.text }}>{d.a}</span>
                                <span style={{ fontWeight: 800, color: "#e8653a" }}>
                                  {d.d}{" "}
                                  <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>
                                    {d.t}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {r.res && (
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#4ea8f0",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              🛡️ Résistance{" "}
                              {r.sl && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: G.muted,
                                    textTransform: "none",
                                    letterSpacing: 0,
                                  }}
                                >
                                  ({r.sl})
                                </span>
                              )}
                            </div>
                            {Object.entries(r.res).map(([k, v]) => (
                              <div
                                key={k}
                                className="wiki-stat-card"
                                style={{
                                  background: "#4ea8f006",
                                  border: "1px solid #4ea8f015",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  marginBottom: 4,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 12,
                                }}
                              >
                                <span style={{ color: G.text }}>{k}</span>
                                <span style={{ fontWeight: 800, color: "#4ea8f0" }}>
                                  {(v * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                            {r.sm &&
                              Object.entries(r.sm).map(([k, v]) => (
                                <div
                                  key={k}
                                  className="wiki-stat-card"
                                  style={{
                                    background: "#51cf6606",
                                    border: "1px solid #51cf6615",
                                    borderRadius: 6,
                                    padding: "6px 12px",
                                    marginBottom: 4,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: 12,
                                  }}
                                >
                                  <span style={{ color: G.text }}>{k}</span>
                                  <span style={{ fontWeight: 800, color: "#51cf66" }}>+{v}</span>
                                </div>
                              ))}
                            {r.dce &&
                              Object.entries(r.dce).map(([k, v]) => (
                                <div
                                  key={k}
                                  className="wiki-stat-card"
                                  style={{
                                    background: "#f5a62306",
                                    border: "1px solid #f5a62315",
                                    borderRadius: 6,
                                    padding: "6px 12px",
                                    marginBottom: 4,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: 12,
                                  }}
                                >
                                  <span style={{ color: G.text }}>Bonus {k}</span>
                                  <span style={{ fontWeight: 800, color: "#f5a623" }}>
                                    +{(v * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                        {r.r && (
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: G.teal,
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              🔨 Recette
                            </div>
                            {r.r.map(([id, qty], i) => (
                              <div
                                key={i}
                                className="wiki-stat-card"
                                style={{
                                  background: G.teal + "06",
                                  border: "1px solid " + G.teal + "15",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  marginBottom: 4,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 12,
                                }}
                              >
                                <ItemImg id={id} size={20} fallback="" />
                                <span style={{ color: G.text, flex: 1 }}>{fmtItem(id)}</span>
                                <span style={{ fontWeight: 800, color: G.teal, flexShrink: 0 }}>
                                  ×{qty}
                                </span>
                              </div>
                            ))}
                            <div
                              style={{
                                fontSize: 11,
                                color: G.muted,
                                marginTop: 6,
                                display: "flex",
                                gap: 12,
                              }}
                            >
                              {r.b && <span>🔨 {fmtItem(r.b)}</span>}
                              {r.ct > 0 && <span>⏱️ {r.ct}s</span>}
                              {r.dur > 0 && <span>🔧 {r.dur}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredItems.length > displayCount && (
              <button
                onClick={() => setDisplayCount((c) => c + 50)}
                style={{
                  margin: "16px auto",
                  padding: "12px 32px",
                  borderRadius: 20,
                  border: "1px solid " + G.teal + "40",
                  background: G.teal + "08",
                  color: G.teal,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Charger plus{" "}
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  ({displayCount}/{filteredItems.length})
                </span>
              </button>
            )}
          </div>
        )}

        {/* MOBS */}
        {wikiTab === "mobs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredMobs.slice(0, displayCount).map((r, idx) => {
              const isOpen = expanded === r.id;
              const catInfo = MOB_CATS.find((c) => c.id === r.c) || { color: G.muted, icon: "❓" };
              const firstLetter = (r.app || r.id || "").charAt(0).toUpperCase();
              const prevLetter =
                idx > 0
                  ? (filteredMobs[idx - 1].app || filteredMobs[idx - 1].id || "")
                      .charAt(0)
                      .toUpperCase()
                  : "";
              const showHeader = sort === "name" && firstLetter !== prevLetter;
              return (
                <div key={r.id}>
                  {showHeader && (
                    <div
                      style={{
                        padding: "var(--sp-1) var(--sp-2)",
                        background: "var(--c-card)",
                        borderLeft: "3px solid var(--c-teal)",
                        fontSize: "var(--text-xs)",
                        fontWeight: "var(--fw-black)",
                        color: "var(--c-teal)",
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        marginBottom: "var(--sp-1)",
                        marginTop: idx > 0 ? "var(--sp-2)" : "0",
                      }}
                    >
                      {firstLetter}
                    </div>
                  )}
                  <div
                    className={`wiki-row${isOpen ? " wiki-row-open" : ""}`}
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                    style={{
                      background: isOpen ? G.card : "transparent",
                      border: "1px solid " + (isOpen ? catInfo.color + "40" : G.border + "40"),
                      borderLeft: "3px solid " + catInfo.color + (isOpen ? "" : "30"),
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 16px",
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{catInfo.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: isOpen ? "#fff" : G.text,
                            fontFamily: "var(--fd)",
                          }}
                        >
                          {fmtItem(r.app || r.id)}
                        </div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                          {r.c}
                          {r.hostile ? " · Hostile" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "var(--radius-sm)",
                            background: "#ff6b6b15",
                            color: "#ff6b6b",
                            fontSize: "var(--text-xs)",
                            fontWeight: "var(--fw-bold)",
                          }}
                        >
                          ❤️ {r.hp}
                        </span>
                        {r.hostile && (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "var(--radius-sm)",
                              background: "#f5a62315",
                              color: "#f5a623",
                              fontSize: "var(--text-xs)",
                              fontWeight: "var(--fw-bold)",
                            }}
                          >
                            Hostile
                          </span>
                        )}
                        {sort === "dmg" && mobDmg(r) > 0 && (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "var(--radius-sm)",
                              background: "#e8653a15",
                              color: "#e8653a",
                              fontSize: "var(--text-xs)",
                              fontWeight: "var(--fw-bold)",
                            }}
                          >
                            ⚔️ {mobDmg(r)}
                          </span>
                        )}
                        {sort === "spd" && r.spd > 0 && (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "var(--radius-sm)",
                              background: "#3dd8c515",
                              color: "#3dd8c5",
                              fontSize: "var(--text-xs)",
                              fontWeight: "var(--fw-bold)",
                            }}
                          >
                            💨 {r.spd}
                          </span>
                        )}
                        {r.drop && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--c-muted)" }}>
                            🎁 {fmtItem(r.drop)}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 12,
                            color: G.muted,
                            transform: isOpen ? "rotate(180deg)" : "",
                            transition: "transform 0.2s",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                    {isOpen && (
                      <div
                        className="wiki-expanded"
                        style={{
                          padding: "16px 18px 18px",
                          borderTop: "1px solid " + G.border + "60",
                          background: G.bg + "40",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: 10,
                            marginBottom: r.dmg && r.dmg.length > 0 ? 12 : 0,
                          }}
                        >
                          <div
                            className="wiki-stat-card"
                            style={{
                              background: "#ff6b6b06",
                              border: "1px solid #ff6b6b15",
                              borderRadius: 6,
                              padding: "10px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: G.muted,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                marginBottom: 4,
                              }}
                            >
                              Vie
                            </div>
                            <div
                              style={{
                                fontSize: "var(--text-lg)",
                                fontWeight: "var(--fw-black)",
                                color: "#ff6b6b",
                              }}
                            >
                              {r.hp}
                            </div>
                          </div>
                          {r.spd > 0 && (
                            <div
                              className="wiki-stat-card"
                              style={{
                                background: "#3dd8c506",
                                border: "1px solid #3dd8c515",
                                borderRadius: 6,
                                padding: "10px 14px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: G.muted,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                  marginBottom: 4,
                                }}
                              >
                                Vitesse
                              </div>
                              <div
                                style={{
                                  fontSize: "var(--text-lg)",
                                  fontWeight: "var(--fw-black)",
                                  color: "#3dd8c5",
                                }}
                              >
                                {r.spd}
                              </div>
                            </div>
                          )}
                          {r.view > 0 && (
                            <div
                              className="wiki-stat-card"
                              style={{
                                background: "#f5a62306",
                                border: "1px solid #f5a62315",
                                borderRadius: 6,
                                padding: "10px 14px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: G.muted,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                  marginBottom: 4,
                                }}
                              >
                                Vue
                              </div>
                              <div
                                style={{
                                  fontSize: "var(--text-lg)",
                                  fontWeight: "var(--fw-black)",
                                  color: "#f5a623",
                                }}
                              >
                                {r.view}
                              </div>
                            </div>
                          )}
                        </div>
                        {r.dmg && r.dmg.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#e8653a",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                marginBottom: 6,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              ⚔️ Dégâts{" "}
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: G.muted,
                                  textTransform: "none",
                                  letterSpacing: 0,
                                }}
                              >
                                ({mobDmg(r)} total)
                              </span>
                            </div>
                            {r.dmg.map((d, i) => (
                              <div
                                key={i}
                                className="wiki-stat-card"
                                style={{
                                  background: "#e8653a06",
                                  border: "1px solid #e8653a15",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  marginBottom: 4,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 12,
                                }}
                              >
                                <span style={{ color: G.text }}>{d.t}</span>
                                <span style={{ fontWeight: 800, color: "#e8653a" }}>{d.d}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {r.drop && (
                          <div style={{ fontSize: 12, color: G.muted, marginTop: 8 }}>
                            🎁 Drop:{" "}
                            <span style={{ color: G.teal, fontWeight: "var(--fw-bold)" }}>
                              {fmtItem(r.drop)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredMobs.length > displayCount && (
              <button
                onClick={() => setDisplayCount((c) => c + 50)}
                style={{
                  margin: "16px auto",
                  padding: "12px 32px",
                  borderRadius: 20,
                  border: "1px solid " + G.teal + "40",
                  background: G.teal + "08",
                  color: G.teal,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Charger plus{" "}
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  ({displayCount}/{filteredMobs.length})
                </span>
              </button>
            )}
          </div>
        )}

        {/* SALVAGE */}
        {wikiTab === "salvage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredSalvage.slice(0, displayCount).map((r) => {
              const isOpen = expanded === r.id;
              const catInfo = SALVAGE_CATS.find((c) => c.id === r.c) || {
                color: G.muted,
                icon: "📦",
              };
              return (
                <div
                  key={r.id}
                  className={`wiki-row${isOpen ? " wiki-row-open" : ""}`}
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    background: isOpen ? G.card : "transparent",
                    border: "1px solid " + (isOpen ? catInfo.color + "40" : G.border + "40"),
                    borderLeft: "3px solid " + catInfo.color + (isOpen ? "" : "30"),
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px" }}
                  >
                    <ItemImg id={r.id} fallback={catInfo.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isOpen ? "#fff" : G.text,
                          fontFamily: "var(--fd)",
                        }}
                      >
                        {r.n}
                      </div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                        {fmtItem(r.id)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: catInfo.color + "12",
                          color: catInfo.color,
                          fontWeight: 700,
                        }}
                      >
                        {r.c}
                      </span>
                      <span style={{ fontSize: 10, color: G.muted }}>{r.t}s</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: G.muted,
                          transform: isOpen ? "rotate(180deg)" : "",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                  {isOpen && (
                    <div
                      className="wiki-expanded"
                      style={{
                        padding: "16px 18px 18px",
                        borderTop: "1px solid " + G.border + "60",
                        background: G.bg + "40",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          gap: 20,
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#ff6b6b",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            Entrée
                          </div>
                          <div
                            className="wiki-stat-card"
                            style={{
                              background: "#ff6b6b06",
                              border: "1px solid #ff6b6b15",
                              borderRadius: 6,
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <ItemImg id={r.id} size={24} fallback="" />
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b" }}>
                              1× {fmtItem(r.id)}
                            </div>
                          </div>
                        </div>
                        <div style={{ paddingTop: 36, fontSize: 22, color: G.teal }}>→</div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: G.teal,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            Sorties
                          </div>
                          {r.o.map(([item, qty], i) => (
                            <div
                              key={i}
                              className="wiki-stat-card"
                              style={{
                                background: G.teal + "06",
                                border: "1px solid " + G.teal + "15",
                                borderRadius: 6,
                                padding: "6px 12px",
                                marginBottom: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 12,
                              }}
                            >
                              <ItemImg id={item} size={20} fallback="" />
                              <span style={{ color: G.text, flex: 1 }}>{fmtItem(item)}</span>
                              <span style={{ fontWeight: 800, color: G.teal, flexShrink: 0 }}>
                                ×{qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 11,
                          color: G.muted,
                          display: "flex",
                          gap: 12,
                        }}
                      >
                        🔨 {fmtItem(r.b)} <span>⏱️ {r.t}s</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredSalvage.length > displayCount && (
              <button
                onClick={() => setDisplayCount((c) => c + 50)}
                style={{
                  margin: "16px auto",
                  padding: "12px 32px",
                  borderRadius: 20,
                  border: "1px solid " + G.teal + "40",
                  background: G.teal + "08",
                  color: G.teal,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Charger plus{" "}
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  ({displayCount}/{filteredSalvage.length})
                </span>
              </button>
            )}
          </div>
        )}

        {/* CRAFT */}
        {wikiTab === "craft" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/* Calculator toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <button
                onClick={() => setCalcOpen(!calcOpen)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + (calcOpen || calcItems.length > 0 ? G.gold : G.border),
                  background: calcOpen ? G.gold + "15" : "transparent",
                  color: calcOpen || calcItems.length > 0 ? G.gold : G.muted,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>🧮</span> Calculateur
                {calcItems.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: G.gold + "20",
                      color: G.gold,
                      fontWeight: 800,
                    }}
                  >
                    {calcItems.length}
                  </span>
                )}
              </button>
              {calcItems.length > 0 && !calcOpen && (
                <span style={{ fontSize: 11, color: G.muted }}>
                  {calcTotalMats.length} matériaux · {calcItems.reduce((s, c) => s + c.qty, 0)}{" "}
                  items
                </span>
              )}
            </div>
            {/* Calculator panel */}
            {calcOpen && (
              <div
                style={{
                  background: G.card,
                  border: "1px solid " + G.gold + "30",
                  borderLeft: "3px solid " + G.gold,
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: G.gold,
                      fontFamily: "var(--fd)",
                    }}
                  >
                    🧮 Calculateur de ressources
                  </div>
                  {calcItems.length > 0 && (
                    <button
                      onClick={() => setCalcItems([])}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid " + G.border,
                        background: "transparent",
                        color: G.muted,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--fb)",
                      }}
                    >
                      ✕ Vider
                    </button>
                  )}
                </div>
                {/* Search to add items */}
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    value={calcSearch}
                    onChange={(e) => setCalcSearch(e.target.value)}
                    placeholder="Ajouter un item à crafter..."
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid " + G.border,
                      background: G.bg,
                      color: "#f0e6d2",
                      fontSize: 13,
                      fontFamily: "var(--fb)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {calcSearchResults.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        background: G.card,
                        border: "1px solid " + G.border,
                        borderRadius: "0 0 8px 8px",
                        maxHeight: 240,
                        overflowY: "auto",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      {calcSearchResults.map((r) => {
                        const qc = QUALITY_COLORS[r.q] || G.muted;
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              addToCalc(r.id);
                              setCalcSearch("");
                            }}
                            style={{
                              padding: "8px 14px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              borderBottom: "1px solid " + G.border + "40",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = G.bg)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <ItemImg id={r.id} size={22} fallback="📦" />
                            <span style={{ fontSize: 12, color: G.text, flex: 1 }}>
                              {fmtItem(r.id)}
                            </span>
                            {r.l > 0 && (
                              <span style={{ fontSize: 10, color: G.muted }}>Niv.{r.l}</span>
                            )}
                            {r.q && (
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "2px 6px",
                                  borderRadius: 3,
                                  background: qc + "15",
                                  color: qc,
                                  fontWeight: 700,
                                }}
                              >
                                {r.q}
                              </span>
                            )}
                            <span style={{ fontSize: 12, color: G.teal, fontWeight: 700 }}>
                              + Ajouter
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Selected items */}
                {calcItems.length === 0 && (
                  <div
                    style={{ textAlign: "center", padding: "20px 0", color: G.muted, fontSize: 13 }}
                  >
                    Aucun item sélectionné. Recherche ci-dessus ou clique ＋ sur un item de la
                    liste.
                  </div>
                )}
                {calcItems.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: G.muted,
                          textTransform: "uppercase",
                          letterSpacing: 1.5,
                          marginBottom: 8,
                        }}
                      >
                        Items à crafter ({calcItems.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {calcItems.map((c) => {
                          const item = ITEM_MAP[c.id];
                          const qc = QUALITY_COLORS[item?.q] || G.muted;
                          return (
                            <div
                              key={c.id}
                              style={{
                                background: G.bg + "80",
                                border: "1px solid " + G.border,
                                borderRadius: 4,
                                padding: "6px 10px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <ItemImg id={c.id} size={22} fallback="📦" />
                              <span
                                style={{
                                  fontSize: 12,
                                  color: G.text,
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {fmtItem(c.id)}
                              </span>
                              {item?.q && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                    background: qc + "15",
                                    color: qc,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.q}
                                </span>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  flexShrink: 0,
                                }}
                              >
                                <button
                                  onClick={() => setCalcQty(c.id, c.qty - 1)}
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 4,
                                    border: "1px solid " + G.border,
                                    background: "transparent",
                                    color: G.muted,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                  }}
                                >
                                  −
                                </button>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: G.gold,
                                    minWidth: 20,
                                    textAlign: "center",
                                  }}
                                >
                                  {c.qty}
                                </span>
                                <button
                                  onClick={() => setCalcQty(c.id, c.qty + 1)}
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 4,
                                    border: "1px solid " + G.border,
                                    background: "transparent",
                                    color: G.muted,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCalc(c.id)}
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 4,
                                  border: "1px solid " + G.border + "60",
                                  background: "transparent",
                                  color: "#ff6b6b",
                                  fontSize: 11,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      {calcIntermediates.length > 0 && (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: G.muted,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            🔨 Crafts intermédiaires ({calcIntermediates.length})
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              maxHeight: 200,
                              overflowY: "auto",
                              marginBottom: 14,
                            }}
                          >
                            {calcIntermediates.map((m) => (
                              <div
                                key={m.id}
                                style={{
                                  background: G.teal + "08",
                                  border: "1px solid " + G.teal + "18",
                                  borderRadius: 4,
                                  padding: "5px 10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 12,
                                }}
                              >
                                <ItemImg id={m.id} size={20} fallback="" />
                                <span
                                  style={{
                                    color: G.text,
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {fmtItem(m.id)}
                                </span>
                                {m.bench && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      padding: "1px 5px",
                                      borderRadius: 3,
                                      background: G.teal + "15",
                                      color: G.teal,
                                      fontWeight: 700,
                                      flexShrink: 0,
                                    }}
                                  >
                                    🔨 {fmtItem(m.bench)}
                                  </span>
                                )}
                                <span style={{ fontWeight: 800, color: G.teal, flexShrink: 0 }}>
                                  ×{m.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: G.muted,
                          textTransform: "uppercase",
                          letterSpacing: 1.5,
                          marginBottom: 8,
                        }}
                      >
                        📦 Total matériaux bruts ({calcTotalMats.length})
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          maxHeight: 300,
                          overflowY: "auto",
                        }}
                      >
                        {calcTotalMats.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              background: "#f5a62308",
                              border: "1px solid #f5a62318",
                              borderRadius: 4,
                              padding: "5px 10px",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                            }}
                          >
                            <ItemImg id={m.id} size={20} fallback="" />
                            <span style={{ color: G.text, flex: 1 }}>{fmtItem(m.id)}</span>
                            <span style={{ fontWeight: 800, color: "#f5a623", flexShrink: 0 }}>
                              ×{m.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {filteredCraft.slice(0, displayCount).map((r) => {
              const isOpen = expanded === r.id;
              const qc = QUALITY_COLORS[r.q] || G.muted;
              const benchInfo = CRAFT_BENCHES.find((b) => b.id === r.b) || {
                icon: "📋",
                color: G.muted,
                label: r.b || "?",
              };
              // Build recipe tree for expanded view
              const renderTree = (itemId, qty, depth, seen) => {
                if (!seen) seen = new Set();
                const item = ITEM_MAP[itemId];
                const hasSub = item && item.r && item.r.length > 0 && !seen.has(itemId);
                const isRaw = !hasSub;
                if (hasSub) seen.add(itemId);
                return (
                  <div
                    key={itemId + "-" + depth}
                    style={{ marginLeft: depth * 20, marginTop: depth > 0 ? 4 : 0 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {depth > 0 && (
                        <span style={{ color: G.border, fontSize: 12, flexShrink: 0 }}>└─</span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 4,
                          background: isRaw ? "#f5a62308" : G.teal + "08",
                          border: "1px solid " + (isRaw ? "#f5a62318" : G.teal + "18"),
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: isRaw ? "#f5a623" : G.teal,
                            flexShrink: 0,
                          }}
                        >
                          ×{qty}
                        </span>
                        <ItemImg id={itemId} size={20} fallback="" />
                        <span
                          style={{
                            fontSize: 12,
                            color: G.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtItem(itemId)}
                        </span>
                        {isRaw && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: "1px 6px",
                              borderRadius: 3,
                              background: "#f5a62315",
                              color: "#f5a623",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            Matériau
                          </span>
                        )}
                        {hasSub && item.b && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: "1px 6px",
                              borderRadius: 3,
                              background: G.teal + "15",
                              color: G.teal,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            🔨 {fmtItem(item.b)}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasSub &&
                      item.r.map(([subId, subQty]) =>
                        renderTree(subId, subQty * qty, depth + 1, new Set(seen))
                      )}
                  </div>
                );
              };
              // Compute flat raw materials
              const rawMats = isOpen ? flattenRecipe(r.id, 1, new Set()) : [];
              return (
                <div
                  key={r.id}
                  className={`wiki-row${isOpen ? " wiki-row-open" : ""}`}
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    background: isOpen ? G.card : "transparent",
                    border: "1px solid " + (isOpen ? benchInfo.color + "40" : G.border + "40"),
                    borderLeft: "3px solid " + benchInfo.color + (isOpen ? "" : "30"),
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px" }}
                  >
                    <ItemImg id={r.id} fallback={benchInfo.icon} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isOpen ? "#fff" : G.text,
                          fontFamily: "var(--fd)",
                        }}
                      >
                        {fmtItem(r.id)}
                        {r.oq > 1 && (
                          <span
                            style={{ fontSize: 11, fontWeight: 800, color: G.gold, marginLeft: 6 }}
                          >
                            ×{r.oq}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          fontSize: 11,
                          color: G.muted,
                          marginTop: 2,
                        }}
                      >
                        {r.l > 0 && <span>Niv. {r.l}</span>}
                        <span>
                          {r.r.length} ingrédient{r.r.length > 1 ? "s" : ""}
                        </span>
                        {r.ct > 0 && <span>⏱️ {r.ct}s</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {r.q && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: qc + "15",
                            color: qc,
                            fontWeight: 700,
                          }}
                        >
                          {r.q}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: benchInfo.color + "12",
                          color: benchInfo.color,
                          fontWeight: 700,
                        }}
                      >
                        {benchInfo.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCalc(r.id);
                        }}
                        title="Ajouter au calculateur"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border:
                            "1px solid " +
                            (calcItems.find((c) => c.id === r.id) ? G.gold : G.border),
                          background: calcItems.find((c) => c.id === r.id)
                            ? G.gold + "18"
                            : "transparent",
                          color: calcItems.find((c) => c.id === r.id) ? G.gold : G.muted,
                          fontSize: 14,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </button>
                      <span
                        style={{
                          fontSize: 12,
                          color: G.muted,
                          transform: isOpen ? "rotate(180deg)" : "",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                  {isOpen && (
                    <div
                      className="wiki-expanded"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: "16px 18px 18px",
                        borderTop: "1px solid " + G.border + "60",
                        background: G.bg + "40",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: 16,
                          marginTop: 12,
                        }}
                      >
                        {/* Left: Recipe tree */}
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: G.muted,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            🌳 Arbre de craft
                          </div>
                          <div
                            style={{
                              background: G.bg + "80",
                              border: "1px solid " + G.border,
                              borderRadius: "var(--radius-md)",
                              padding: 10,
                            }}
                          >
                            {r.r.map(([ingId, ingQty]) =>
                              renderTree(ingId, ingQty, 0, new Set([r.id]))
                            )}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, color: G.muted }}>
                            🔨 {fmtItem(r.b)}
                            {r.ct > 0 && <span> · ⏱️ {r.ct}s</span>}
                            {r.dur > 0 && <span> · 🔧 {r.dur}</span>}
                            {r.oq > 1 && (
                              <span style={{ color: G.gold, fontWeight: 700 }}>
                                {" "}
                                · 📦 Produit ×{r.oq}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Right: Total raw materials */}
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: G.muted,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 8,
                            }}
                          >
                            📦 Matériaux bruts totaux
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {rawMats
                              .sort((a, b) => b.qty - a.qty)
                              .map((m) => (
                                <div
                                  key={m.id}
                                  style={{
                                    background: "#f5a62308",
                                    border: "1px solid #f5a62318",
                                    borderRadius: 4,
                                    padding: "4px 10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: 12,
                                  }}
                                >
                                  <ItemImg id={m.id} size={20} fallback="" />
                                  <span style={{ color: G.text, flex: 1 }}>{fmtItem(m.id)}</span>
                                  <span
                                    style={{ fontWeight: 800, color: "#f5a623", flexShrink: 0 }}
                                  >
                                    ×{m.qty}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredCraft.length > displayCount && (
              <button
                onClick={() => setDisplayCount((c) => c + 50)}
                style={{
                  margin: "16px auto",
                  padding: "12px 32px",
                  borderRadius: 20,
                  border: "1px solid " + G.teal + "40",
                  background: G.teal + "08",
                  color: G.teal,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--fb)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Charger plus{" "}
                <span style={{ fontSize: 11, opacity: 0.7 }}>
                  ({displayCount}/{filteredCraft.length})
                </span>
              </button>
            )}
          </div>
        )}

        {totalFiltered === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: G.muted, fontSize: 14 }}>
            Aucun résultat.
          </div>
        )}

        {/* COMPARATOR — sticky bar */}
        {compareIds.length > 0 && !compareOpen && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              background: "linear-gradient(180deg,transparent," + G.bg + " 20%)",
              padding: "20px 24px 16px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: G.card,
                border: "1px solid " + G.gold + "40",
                borderRadius: 14,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
                maxWidth: 800,
                width: "100%",
              }}
            >
              <span style={{ fontSize: 14 }}>⚖️</span>
              <div style={{ display: "flex", gap: 8, flex: 1, overflow: "auto" }}>
                {compareItems2.map((r) => {
                  const qc = QUALITY_COLORS[r.q] || G.muted;
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: qc + "10",
                        border: "1px solid " + qc + "30",
                        fontSize: 12,
                        fontWeight: 600,
                        color: G.text,
                        flexShrink: 0,
                      }}
                    >
                      <ItemImg id={r.id} size={20} fallback={r.c === "Weapon" ? "🗡️" : "🛡️"} />
                      <span
                        style={{
                          maxWidth: 140,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtItem(r.id)}
                      </span>
                      <button
                        onClick={() => toggleCompare(r.id)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: "none",
                          background: "transparent",
                          color: "#ff6b6b",
                          fontSize: 11,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
              <span style={{ fontSize: 11, color: G.muted, flexShrink: 0 }}>
                {compareIds.length}/3
              </span>
              <button
                onClick={() => setCompareOpen(true)}
                disabled={compareIds.length < 2}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    compareIds.length >= 2
                      ? "linear-gradient(135deg," + G.gold + "," + G.goldD + ")"
                      : G.border,
                  color: compareIds.length >= 2 ? G.bg : G.muted,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: compareIds.length >= 2 ? "pointer" : "not-allowed",
                  fontFamily: "var(--fb)",
                  flexShrink: 0,
                }}
              >
                Comparer
              </button>
              <button
                onClick={() => setCompareIds([])}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid " + G.border,
                  background: "transparent",
                  color: G.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontFamily: "var(--fb)",
                  flexShrink: 0,
                }}
              >
                Vider
              </button>
            </div>
          </div>
        )}

        {/* COMPARATOR — full panel overlay */}
        {compareOpen && compareItems2.length >= 2 && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: G.bg + "f0",
              backdropFilter: "blur(8px)",
              overflowY: "auto",
            }}
            onClick={() => setCompareOpen(false)}
          >
            <div
              style={{ maxWidth: 1000, margin: "80px auto 40px", padding: "0 24px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: G.gold,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      marginBottom: 4,
                    }}
                  >
                    Comparateur
                  </div>
                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#f0e6d2",
                      fontFamily: "var(--fd)",
                      margin: 0,
                    }}
                  >
                    {compareItems2[0].c === "Weapon" ? "Armes" : "Armures"}
                  </h2>
                </div>
                <button
                  onClick={() => setCompareOpen(false)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid " + G.border,
                    background: G.card,
                    color: G.muted,
                    fontSize: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Compare table */}
              {(() => {
                const items = compareItems2;
                const isWeapon = items[0].c === "Weapon";
                // Collect all stat keys
                const allResKeys = [
                  ...new Set(items.flatMap((i) => (i.res ? Object.keys(i.res) : []))),
                ];
                const allSmKeys = [
                  ...new Set(items.flatMap((i) => (i.sm ? Object.keys(i.sm) : []))),
                ];
                const allDceKeys = [
                  ...new Set(items.flatMap((i) => (i.dce ? Object.keys(i.dce) : []))),
                ];
                const allDmgActions = [
                  ...new Set(items.flatMap((i) => (i.dmg ? i.dmg.map((d) => d.a) : []))),
                ];

                const bestOf = (vals, higher = true) => {
                  const nums = vals.map((v) => (typeof v === "number" ? v : 0));
                  const best = higher ? Math.max(...nums) : Math.min(...nums);
                  return nums.map((n) => n === best && n > 0);
                };

                const Row = ({ label, vals, color, fmt, higher = true, icon }) => {
                  const bests = bestOf(vals, higher);
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                        gap: 1,
                        background: G.border + "30",
                      }}
                    >
                      <div
                        style={{
                          background: G.card,
                          padding: "8px 14px",
                          fontSize: 12,
                          color: G.muted,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
                        {label}
                      </div>
                      {vals.map((v, i) => (
                        <div
                          key={i}
                          style={{
                            background: G.card,
                            padding: "8px 14px",
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: bests[i] ? 800 : 500,
                            color: bests[i] ? color || G.teal : v ? G.text : G.muted + "60",
                          }}
                        >
                          {v ? (fmt ? fmt(v) : v) : "—"}
                        </div>
                      ))}
                    </div>
                  );
                };

                return (
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid " + G.border,
                      background: G.border + "30",
                    }}
                  >
                    {/* Header row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                        gap: 1,
                        background: G.border + "30",
                      }}
                    >
                      <div style={{ background: G.bg, padding: "14px" }}></div>
                      {items.map((r) => {
                        const qc = QUALITY_COLORS[r.q] || G.muted;
                        return (
                          <div
                            key={r.id}
                            style={{ background: G.bg, padding: "14px", textAlign: "center" }}
                          >
                            <div
                              style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
                            >
                              <ItemImg id={r.id} size={32} fallback={isWeapon ? "🗡️" : "🛡️"} />
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#f0e6d2",
                                fontFamily: "var(--fd)",
                                marginBottom: 4,
                              }}
                            >
                              {fmtItem(r.id)}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                justifyContent: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              {r.q && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                    background: qc + "15",
                                    color: qc,
                                    fontWeight: 700,
                                  }}
                                >
                                  {r.q}
                                </span>
                              )}
                              {r.sc && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                    background: G.border,
                                    color: G.muted,
                                    fontWeight: 600,
                                  }}
                                >
                                  {r.sc}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* General stats */}
                    <Row
                      label="Niveau"
                      vals={items.map((i) => i.l || 0)}
                      color={G.blue}
                      icon="📊"
                    />
                    <Row
                      label="Durabilité"
                      vals={items.map((i) => i.dur || 0)}
                      color="#51cf66"
                      icon="🔧"
                    />
                    {!isWeapon && (
                      <Row
                        label="Slot"
                        vals={items.map((i) => i.sl || "—")}
                        color={G.muted}
                        icon="👕"
                      />
                    )}

                    {/* Weapon: DPS */}
                    {isWeapon && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                            gap: 1,
                            background: G.border + "30",
                          }}
                        >
                          <div
                            style={{
                              background: G.bg2,
                              padding: "8px 14px",
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#e8653a",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                            }}
                          >
                            ⚔️ Dégâts
                          </div>
                          {items.map((r) => (
                            <div
                              key={r.id}
                              style={{ background: G.bg2, padding: "8px 14px" }}
                            ></div>
                          ))}
                        </div>
                        <Row
                          label="DPS Total"
                          vals={items.map((i) => itemDPS(i))}
                          color="#e8653a"
                          icon="💥"
                          fmt={(v) => "" + v}
                        />
                        {allDmgActions.map((action) => (
                          <Row
                            key={action}
                            label={action}
                            vals={items.map((i) => {
                              const d = i.dmg?.find((x) => x.a === action);
                              return d ? d.d : 0;
                            })}
                            color="#e8653a"
                          />
                        ))}
                      </>
                    )}

                    {/* Armor: Resistances */}
                    {allResKeys.length > 0 && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                            gap: 1,
                            background: G.border + "30",
                          }}
                        >
                          <div
                            style={{
                              background: G.bg2,
                              padding: "8px 14px",
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#4ea8f0",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                            }}
                          >
                            🛡️ Résistances
                          </div>
                          {items.map((r) => (
                            <div
                              key={r.id}
                              style={{ background: G.bg2, padding: "8px 14px" }}
                            ></div>
                          ))}
                        </div>
                        {!isWeapon && (
                          <Row
                            label="Rés. Totale"
                            vals={items.map((i) => itemRes(i))}
                            color="#4ea8f0"
                            icon="🛡️"
                            fmt={(v) => (v * 100).toFixed(1) + "%"}
                          />
                        )}
                        {allResKeys.map((k) => (
                          <Row
                            key={k}
                            label={k}
                            vals={items.map((i) => i.res?.[k] || 0)}
                            color="#4ea8f0"
                            fmt={(v) => (v * 100).toFixed(1) + "%"}
                          />
                        ))}
                      </>
                    )}

                    {/* Stat modifiers */}
                    {allSmKeys.length > 0 && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                            gap: 1,
                            background: G.border + "30",
                          }}
                        >
                          <div
                            style={{
                              background: G.bg2,
                              padding: "8px 14px",
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#51cf66",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                            }}
                          >
                            📈 Bonus Stats
                          </div>
                          {items.map((r) => (
                            <div
                              key={r.id}
                              style={{ background: G.bg2, padding: "8px 14px" }}
                            ></div>
                          ))}
                        </div>
                        {allSmKeys.map((k) => (
                          <Row
                            key={k}
                            label={k}
                            vals={items.map((i) => i.sm?.[k] || 0)}
                            color="#51cf66"
                            fmt={(v) => "+" + v}
                          />
                        ))}
                      </>
                    )}

                    {/* Damage Class Enhancement */}
                    {allDceKeys.length > 0 && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "200px repeat(" + items.length + ", 1fr)",
                            gap: 1,
                            background: G.border + "30",
                          }}
                        >
                          <div
                            style={{
                              background: G.bg2,
                              padding: "8px 14px",
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#f5a623",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                            }}
                          >
                            ⚡ Bonus Dégâts
                          </div>
                          {items.map((r) => (
                            <div
                              key={r.id}
                              style={{ background: G.bg2, padding: "8px 14px" }}
                            ></div>
                          ))}
                        </div>
                        {allDceKeys.map((k) => (
                          <Row
                            key={k}
                            label={"Bonus " + k}
                            vals={items.map((i) => i.dce?.[k] || 0)}
                            color="#f5a623"
                            fmt={(v) => "+" + (v * 100).toFixed(0) + "%"}
                          />
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { WikiPage };
