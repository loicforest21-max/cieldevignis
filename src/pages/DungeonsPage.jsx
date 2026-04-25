// ═══════════════════════════════════════════════════
// DUNGEONS PAGE — Tier-organized dungeon catalog with detail panel
// ═══════════════════════════════════════════════════
import { useState } from "react";
import { DUNGEONS, DUNGEON_TIERS } from "../data/dungeons.js";
import { G } from "../styles.jsx";

// ─── Coordonnées des donjons sur la carte (viewBox 1000x620) ───
// Tu pourras ajuster ces positions après premier rendu Vercel.
const DUNGEON_COORDS = {
  frozen_dungeon: { x: 180, y: 120 }, // NW — montagnes gelées
  shivas_ice_cave: { x: 440, y: 95 }, // N — falaises glacées
  tower_of_shiva: { x: 760, y: 115 }, // NE — pics sacrés
  golem_void: { x: 880, y: 240 }, // E lointain — faille du Vide
  overgrown_ruins: { x: 185, y: 310 }, // O — forêt envahissante
  major_d01: { x: 360, y: 260 }, // Centre-O — plaines / Silvermoon
  major_d02: { x: 500, y: 380 }, // Centre — ruines de Katherina
  forbidden_labyrinth: { x: 690, y: 270 }, // E — dédale oriental
  swamp_dungeon: { x: 720, y: 455 }, // SE — marécage
  major_d03: { x: 430, y: 500 }, // S — forteresse du Baron
  reliquary: { x: 170, y: 495 }, // SO lointain — sanctuaire scellé
};

// ─── Sentiers entre donjons (progression narrative) ───
const DUNGEON_PATHS = [
  ["overgrown_ruins", "major_d01"],
  ["major_d01", "shivas_ice_cave"],
  ["shivas_ice_cave", "frozen_dungeon"],
  ["major_d01", "major_d02"],
  ["major_d02", "swamp_dungeon"],
  ["major_d02", "tower_of_shiva"],
  ["swamp_dungeon", "forbidden_labyrinth"],
  ["tower_of_shiva", "golem_void"],
  ["forbidden_labyrinth", "golem_void"],
  ["major_d02", "major_d03"],
  ["major_d03", "reliquary"],
];

// Pré-calcul des courbes (évite de recalculer à chaque render)
const DUNGEON_PATH_CURVES = DUNGEON_PATHS.map(([a, b]) => {
  const pa = DUNGEON_COORDS[a],
    pb = DUNGEON_COORDS[b];
  if (!pa || !pb) return null;
  const mx = (pa.x + pb.x) / 2;
  const my = (pa.y + pb.y) / 2 - Math.abs(pb.x - pa.x) * 0.12;
  return `M ${pa.x} ${pa.y} Q ${mx} ${my} ${pb.x} ${pb.y}`;
}).filter(Boolean);

// ─── Tailles de marqueur par tier ───
const TIER_RING = { beginner: 12, intermediate: 13, advanced: 14, endgame: 15 };
const TIER_AURA = { beginner: 0, intermediate: 0, advanced: 20, endgame: 24 };


function DungeonsPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [filterTier, setFilterTier] = useState(null);

  const selected = selectedId ? DUNGEONS.find((d) => d.id === selectedId) : null;
  const fmtAug = (id) => id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const tierMeta = (tid) => DUNGEON_TIERS.find((t) => t.id === tid) || {};

  const toggleTier = (id) => setFilterTier(filterTier === id ? null : id);
  const isDimmed = (d) => filterTier && d.tier !== filterTier;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: "100px 24px 60px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "inline-block",
          padding: "4px 16px",
          borderRadius: 4,
          background: G.gold + "10",
          border: "1px solid " + G.gold + "20",
          fontSize: 11,
          fontWeight: 800,
          color: G.gold,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 12,
        }}
      >
        Carte du royaume
      </div>
      <h1
        style={{
          fontSize: 38,
          fontWeight: 900,
          color: "#f0e6d2",
          fontFamily: "var(--fd)",
          margin: "0 0 8px",
          letterSpacing: 1,
        }}
      >
        Donjons
      </h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>
        {DUNGEONS.length} donjons · {DUNGEON_TIERS.length} tiers · Progression Niv. 5 → 80+
      </p>

      {/* Tier legend / filter */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {DUNGEON_TIERS.map((t) => {
          const count = DUNGEONS.filter((d) => d.tier === t.id).length;
          const active = filterTier === t.id;
          const inactive = filterTier && !active;
          return (
            <button
              key={t.id}
              onClick={() => toggleTier(t.id)}
              style={{
                padding: "7px 13px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid " + (active ? t.color : t.color + "35"),
                background: active ? t.color + "20" : "transparent",
                color: inactive ? G.muted : t.color,
                opacity: inactive ? 0.55 : 1,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "var(--fb)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.3,
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: t.color,
                  display: "inline-block",
                }}
              ></span>
              {t.label} · {count}
            </button>
          );
        })}
        {filterTier && (
          <button
            onClick={() => setFilterTier(null)}
            style={{
              padding: "7px 13px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid " + G.border,
              background: "transparent",
              color: G.muted,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--fb)",
              letterSpacing: 0.3,
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Carte + panneau détails */}
      <div className="cdv-map-grid">
        {/* --- Carte SVG --- */}
        <div className="cdv-map-frame">
          <svg className="cdv-map-svg" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cdvParchDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.5" fill="#3a2e1d" opacity="0.5" />
              </pattern>
            </defs>
            {/* Parchemin */}
            <rect width="1000" height="620" fill="#1c170f" />
            <rect width="1000" height="620" fill="url(#cdvParchDots)" />
            {/* Cadre décoratif */}
            <rect
              x="10"
              y="10"
              width="980"
              height="600"
              fill="none"
              stroke="#3a2e1d"
              strokeWidth="1"
            />
            <rect
              x="16"
              y="16"
              width="968"
              height="588"
              fill="none"
              stroke="#e8a537"
              strokeWidth="0.6"
              opacity="0.4"
            />
            {/* Flourishes de coins */}
            <g stroke="#e8a537" strokeWidth="0.9" fill="none" opacity="0.6">
              <path d="M 30 30 L 30 60 M 30 30 L 60 30 M 30 30 Q 42 42 52 40 M 30 30 Q 42 42 40 52" />
              <path d="M 970 30 L 970 60 M 970 30 L 940 30 M 970 30 Q 958 42 948 40 M 970 30 Q 958 42 960 52" />
              <path d="M 30 590 L 30 560 M 30 590 L 60 590 M 30 590 Q 42 578 52 580 M 30 590 Q 42 578 40 568" />
              <path d="M 970 590 L 970 560 M 970 590 L 940 590 M 970 590 Q 958 578 948 580 M 970 590 Q 958 578 960 568" />
            </g>
            {/* Biomes */}
            <ellipse cx="500" cy="80" rx="450" ry="55" fill="#2a3640" opacity="0.35" />{" "}
            {/* Montagnes N */}
            <ellipse cx="200" cy="290" rx="160" ry="130" fill="#232a1a" opacity="0.55" />{" "}
            {/* Forêt O */}
            <ellipse cx="460" cy="325" rx="230" ry="80" fill="#2a2418" opacity="0.3" />{" "}
            {/* Plaines */}
            <ellipse cx="710" cy="260" rx="180" ry="110" fill="#2a241a" opacity="0.4" />{" "}
            {/* Plateau E */}
            <ellipse cx="720" cy="455" rx="140" ry="85" fill="#1a2820" opacity="0.5" />{" "}
            {/* Marécage SE */}
            <ellipse cx="885" cy="240" rx="80" ry="80" fill="#2a1838" opacity="0.55" />{" "}
            {/* Faille Vide */}
            <ellipse cx="430" cy="495" rx="210" ry="80" fill="#2a1812" opacity="0.45" />{" "}
            {/* Forteresse S */}
            <ellipse cx="170" cy="490" rx="130" ry="85" fill="#1f1a14" opacity="0.4" />{" "}
            {/* Pierre SO */}
            {/* Montagnes (détails ligne) */}
            <g fill="none" stroke="#8aa0b0" strokeWidth="0.9" opacity="0.55">
              <path d="M 80 95 L 105 62 L 128 92 M 150 98 L 180 58 L 210 95 M 240 92 L 270 62 L 298 94 M 330 98 L 362 56 L 392 96 L 412 78 L 438 98 M 470 92 L 500 54 L 530 94 M 560 96 L 592 62 L 622 92 M 658 98 L 692 62 L 725 96 L 748 78 L 775 98 M 810 94 L 840 60 L 870 96 M 890 98 L 915 68 L 940 96" />
            </g>
            {/* Forêt (points d'arbres) */}
            <g fill="#4a5236" opacity="0.6">
              <circle cx="140" cy="240" r="3" />
              <circle cx="165" cy="255" r="3.5" />
              <circle cx="185" cy="235" r="3" />
              <circle cx="210" cy="260" r="3" />
              <circle cx="230" cy="240" r="3.5" />
              <circle cx="255" cy="255" r="3" />
              <circle cx="155" cy="285" r="3" />
              <circle cx="195" cy="305" r="3.5" />
              <circle cx="240" cy="300" r="3" />
              <circle cx="180" cy="340" r="3" />
              <circle cx="270" cy="285" r="3" />
              <circle cx="125" cy="260" r="3" />
              <circle cx="280" cy="310" r="3" />
              <circle cx="295" cy="270" r="2.5" />
              <circle cx="140" cy="360" r="3" />
              <circle cx="220" cy="355" r="3" />
            </g>
            {/* Marécage (vagues) */}
            <g stroke="#4a6c5a" strokeWidth="0.8" fill="none" opacity="0.55">
              <path d="M 630 430 Q 650 436 670 430 T 710 430 T 750 430 T 790 430" />
              <path d="M 640 455 Q 660 461 680 455 T 720 455 T 760 455 T 800 455" />
              <path d="M 650 480 Q 670 486 690 480 T 730 480 T 770 480" />
            </g>
            {/* Faille du Vide (aura violette) */}
            <g opacity="0.4">
              <circle cx="885" cy="240" r="40" fill="#845ef7" opacity="0.2" />
              <circle cx="885" cy="240" r="24" fill="#6c5ce7" opacity="0.35" />
            </g>
            {/* Forteresse (créneaux S) */}
            <g fill="#8a2a20" opacity="0.5">
              <rect x="395" y="475" width="6" height="14" />
              <rect x="410" y="470" width="6" height="19" />
              <rect x="425" y="475" width="6" height="14" />
              <rect x="445" y="480" width="5" height="12" />
              <rect x="465" y="478" width="5" height="13" />
            </g>
            {/* Porte scellée (SO) */}
            <g stroke="#8a7a5c" strokeWidth="0.7" fill="none" opacity="0.5">
              <rect x="155" y="475" width="30" height="38" rx="2" />
              <line x1="170" y1="478" x2="170" y2="510" />
            </g>
            {/* Sentiers (routes dorées pointillées) */}
            <g stroke="#e8a537" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.4">
              {DUNGEON_PATH_CURVES.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            {/* Rose des vents */}
            <g transform="translate(910, 560)">
              <circle r="32" fill="#1c170f" stroke="#e8a537" strokeWidth="0.7" opacity="0.75" />
              <circle r="23" fill="none" stroke="#e8a537" strokeWidth="0.4" opacity="0.4" />
              <path d="M 0 -28 L 3 0 L 0 28 L -3 0 Z" fill="#e8a537" opacity="0.85" />
              <path d="M -28 0 L 0 3 L 28 0 L 0 -3 Z" fill="#e8a537" opacity="0.55" />
              <text
                y="-34"
                textAnchor="middle"
                fontSize="11"
                fill="#e8a537"
                fontFamily="var(--fd), serif"
              >
                N
              </text>
              <text
                y="42"
                textAnchor="middle"
                fontSize="11"
                fill="#e8a537"
                fontFamily="var(--fd), serif"
              >
                S
              </text>
              <text
                x="-37"
                y="4"
                textAnchor="middle"
                fontSize="11"
                fill="#e8a537"
                fontFamily="var(--fd), serif"
              >
                O
              </text>
              <text
                x="37"
                y="4"
                textAnchor="middle"
                fontSize="11"
                fill="#e8a537"
                fontFamily="var(--fd), serif"
              >
                E
              </text>
            </g>
            {/* Échelle */}
            <g transform="translate(50, 590)">
              <line x1="0" y1="0" x2="100" y2="0" stroke="#e8a537" strokeWidth="1" opacity="0.6" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#e8a537" strokeWidth="1" opacity="0.6" />
              <line x1="50" y1="-4" x2="50" y2="4" stroke="#e8a537" strokeWidth="1" opacity="0.6" />
              <line
                x1="100"
                y1="-4"
                x2="100"
                y2="4"
                stroke="#e8a537"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x="50"
                y="16"
                textAnchor="middle"
                fontSize="10"
                fill="#8a7a5c"
                fontFamily="var(--fd), serif"
                letterSpacing="0.15em"
              >
                50 LIEUES
              </text>
            </g>
            {/* Marqueurs de donjons */}
            {DUNGEONS.map((d) => {
              const c = DUNGEON_COORDS[d.id];
              if (!c) return null;
              const tm = tierMeta(d.tier);
              const tc = tm.color || G.gold;
              const isSelected = selectedId === d.id;
              const isHover = hoveredId === d.id;
              const dim = isDimmed(d);
              const ringR = TIER_RING[d.tier] || 12;
              const auraR = TIER_AURA[d.tier] || 0;
              return (
                <g
                  key={d.id}
                  transform={`translate(${c.x}, ${c.y})`}
                  onClick={() => setSelectedId(d.id)}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: "pointer", opacity: dim ? 0.3 : 1, transition: "opacity 0.15s" }}
                >
                  {auraR > 0 && (
                    <circle
                      r={auraR}
                      fill={tc}
                      opacity={isSelected ? 0.28 : 0.14}
                      style={{ transition: "opacity 0.15s" }}
                    />
                  )}
                  <circle
                    r={ringR}
                    fill="#1c170f"
                    stroke={isSelected ? G.goldL : tc}
                    strokeWidth={isSelected ? 3 : isHover ? 2.8 : 2}
                    style={{ transition: "stroke-width 0.15s" }}
                  />
                  <text
                    y="5"
                    textAnchor="middle"
                    fontSize="16"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {d.emoji}
                  </text>
                  <text
                    y={ringR + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isSelected || isHover ? G.goldL : "#c9b892"}
                    fontFamily="var(--fd), serif"
                    letterSpacing="0.04em"
                    style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}
                  >
                    {d.name}
                  </text>
                  <title>
                    {d.name} — {tm.label} · Niv. {d.levels}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* --- Panneau de détails --- */}
        <div className="cdv-map-panel">
          {selected ? (
            <DungeonDetails
              d={selected}
              tm={tierMeta(selected.tier)}
              fmtAug={fmtAug}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div style={{ padding: "50px 22px", textAlign: "center", color: G.muted }}>
              <div style={{ fontSize: 38, opacity: 0.35, marginBottom: 14 }}>🗺️</div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "var(--fd)",
                  color: G.gold,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                Choisis ta destination
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: G.muted,
                  maxWidth: 240,
                  margin: "0 auto",
                }}
              >
                Clique sur un marqueur de la carte pour découvrir ses créatures, ses boss et son
                butin.
              </div>
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: "1px solid " + G.border,
                  fontSize: 10.5,
                  color: "#6b5d44",
                  fontStyle: "italic",
                  letterSpacing: 0.3,
                }}
              >
                Les sentiers dorés indiquent une progression suggérée.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cdv-map-hint">Touche un marqueur pour afficher sa fiche</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DungeonDetails — panneau latéral
// ═══════════════════════════════════════════════════
function DungeonDetails({ d, tm, fmtAug, onClose }) {
  return (
    <div style={{ padding: "18px 18px 22px" }}>
      {/* Bouton fermer + tier badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: tm.color,
              display: "inline-block",
            }}
          ></span>
          <span
            style={{
              fontSize: 10,
              color: tm.color,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {tm.label} · Niv. {d.levels}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid " + G.border,
            color: G.muted,
            width: 22,
            height: 22,
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontFamily: "var(--fb)",
          }}
          title="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Nom */}
      <h3
        style={{
          fontSize: 19,
          fontWeight: 800,
          color: "#f0e6d2",
          fontFamily: "var(--fd)",
          margin: "0 0 4px",
          letterSpacing: 0.5,
        }}
      >
        <span style={{ marginRight: 8 }}>{d.emoji}</span>
        {d.name}
      </h3>

      {/* Source (mod) */}
      <div
        style={{
          fontSize: 10,
          color: G.muted,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Mod · {d.source}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 12.5,
          color: "#c9b892",
          lineHeight: 1.55,
          margin: "0 0 16px",
          fontStyle: "italic",
        }}
      >
        {d.desc}
      </p>

      {/* Scaling */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: G.teal,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          ⚙️ Scaling des mobs
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          {[
            {
              l: "PV",
              v: `×${d.scaling.hp.base} + ${(d.scaling.hp.perLv * 100).toFixed(1)}%/niv`,
              c: "#ff6b6b",
            },
            {
              l: "Dégâts",
              v: `×${d.scaling.dmg.base} + ${(d.scaling.dmg.perLv * 100).toFixed(1)}%/niv`,
              c: "#ff9f43",
            },
            {
              l: "Défense",
              v: `${(d.scaling.def.negMax * 100).toFixed(0)}%–${(d.scaling.def.posMax * 100).toFixed(0)}% · cap ${(d.scaling.def.abovePos * 100).toFixed(0)}%`,
              c: "#54a0ff",
            },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                padding: "4px 8px",
                background: s.c + "08",
                borderRadius: 4,
                border: "1px solid " + s.c + "18",
              }}
            >
              <span style={{ color: s.c, fontWeight: 700 }}>{s.l}</span>
              <span style={{ color: G.text }}>{s.v}</span>
            </div>
          ))}
        </div>
        {d.tiered && (
          <div
            style={{
              marginTop: 6,
              padding: "4px 8px",
              background: G.purple + "08",
              borderRadius: 4,
              border: "1px solid " + G.purple + "18",
              fontSize: 10.5,
              color: G.purple,
            }}
          >
            ♾️ Tiers infinis · +{d.levelsPerTier} niv/tier
          </div>
        )}
      </div>

      {/* Mobs */}
      {d.mobs && d.mobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: G.accent2,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            🐉 Créatures ({d.mobs.length})
          </div>
          <div style={{ display: "grid", gap: 3 }}>
            {d.mobs.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 8px",
                  background: G.bg + "80",
                  borderRadius: 4,
                  border: "1px solid " + G.border,
                  fontSize: 11,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontWeight: 700, color: G.text }}>{m.name}</span>
                  <span style={{ fontSize: 10, color: G.muted, marginLeft: 5 }}>{m.type}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ color: "#ff6b6b", fontWeight: 700 }}>{m.hp} PV</span>
                  {m.dmg && <span style={{ fontSize: 9.5, color: G.muted }}>{m.dmg}</span>}
                  {m.augments && (
                    <span style={{ fontSize: 9, color: G.purple }}>🔮{m.augments.length}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boss(es) */}
      {(d.boss || d.bosses) && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#e05252",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            👑 {d.bosses ? `Boss (${d.bosses.length})` : "Boss"}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {(d.bosses || [d.boss]).map((b, bi) => (
              <div
                key={bi}
                style={{
                  background: "#e0525208",
                  border: "1px solid #e0525222",
                  borderRadius: 6,
                  padding: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: "#f0e6d2",
                    fontFamily: "var(--fd)",
                    marginBottom: 4,
                    letterSpacing: 0.3,
                  }}
                >
                  {b.name}
                </div>
                {b.hp && (
                  <div style={{ fontSize: 11, color: G.text, marginBottom: 2 }}>
                    ❤️{" "}
                    <span style={{ fontWeight: 700, color: "#ff6b6b" }}>
                      {b.hp.toLocaleString()} PV
                    </span>
                    {b.level && <span style={{ color: G.muted }}> · Lv{b.level}</span>}
                  </div>
                )}
                {b.dmg && (
                  <div style={{ fontSize: 11, color: G.text, marginBottom: 2 }}>⚔️ {b.dmg}</div>
                )}
                {b.augments && b.augments.length > 0 && (
                  <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {b.augments.map((a, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 9,
                          padding: "1.5px 5px",
                          borderRadius: 3,
                          background: G.purple + "15",
                          color: G.purple,
                          fontWeight: 600,
                        }}
                      >
                        {fmtAug(a)}
                      </span>
                    ))}
                  </div>
                )}
                {b.scaling && (
                  <div
                    style={{
                      marginTop: 5,
                      padding: "3px 6px",
                      background: "#ff6b6b08",
                      borderRadius: 3,
                      border: "1px solid #ff6b6b15",
                      fontSize: 9.5,
                      color: G.muted,
                    }}
                  >
                    Boss scaling : PV ×{b.scaling.hp.base} · Dmg ×{b.scaling.dmg.base} · Def cap{" "}
                    {(b.scaling.def.abovePos * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loot */}
      {d.loot && d.loot.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: G.accent2,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 6,
            }}
          >
            🎁 Loot
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {d.loot.map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10.5,
                  padding: "3px 7px",
                  borderRadius: 3,
                  background: G.accent2 + "10",
                  border: "1px solid " + G.accent2 + "18",
                  color: G.accent2,
                  fontWeight: 600,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMMUNITY PAGE — Browse & share builds
// ═══════════════════════════════════════════════════

export default DungeonsPage;
