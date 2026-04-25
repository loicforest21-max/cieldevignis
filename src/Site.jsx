// ═══════════════════════════════════════════════════
// SITE — Remaining pages: BuildsPage, MapPage, ModsPage
// (HomePage, WikiPage, DungeonsPage, CommunityPage extracted to ./pages/)
// ═══════════════════════════════════════════════════
import { useState } from "react";
import { G } from "./styles.jsx";
import { BuildCreator } from "./BuildCreator.jsx";

function BuildsPage({ importCode, onClearImportCode, onPublishToCommunity }) {
  return (
    <div style={{ position: "relative", zIndex: 1, paddingTop: 72 }}>
      {/* Magical night background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 900,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, #0a0812 0%, #0f0a1a 12%, #1a1228 28%, #1e1630 50%, #1a1424 75%, transparent 100%)",
          zIndex: -1,
        }}
      />
      {/* Floating magical orbs */}
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 110,
          left: "5%",
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c580 40%, transparent 70%)",
          boxShadow: "0 0 16px #3dd8c5a0",
          pointerEvents: "none",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 170,
          right: "7%",
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffecb4f0, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 20px #e8a537a0",
          pointerEvents: "none",
          animationDelay: "2.5s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 420,
          left: "3%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff80 40%, transparent 70%)",
          boxShadow: "0 0 14px #a878ff90",
          pointerEvents: "none",
          animationDelay: "5s",
        }}
      />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 0" }}>
        {/* Magical mini-hero */}
        <div
          className="page-hero"
          style={{
            textAlign: "center",
            marginBottom: 22,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(61,216,197,0.15)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
              filter: "drop-shadow(0 0 16px rgba(61,216,197,0.5))",
            }}
          >
            ⚒️
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 10,
              color: "#3dd8c5",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Atelier du Théorycrafter
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              margin: "0 0 6px",
              letterSpacing: 2,
              textShadow: "0 0 24px rgba(61,216,197,0.3)",
            }}
          >
            Build Creator
          </h1>
          <p
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              fontSize: 13,
              color: "#a89075",
              margin: 0,
            }}
          >
            « Forge ta combinaison parfaite de race, classe et augments »
          </p>
        </div>
      </div>

      <BuildCreator
        initialCode={importCode}
        onClearInitialCode={onClearImportCode}
        onPublishToCommunity={onPublishToCommunity}
      />
    </div>
  );
}

function MapPage() {
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
          left: "7%",
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c580 40%, transparent 70%)",
          boxShadow: "0 0 16px #3dd8c5a0",
          pointerEvents: "none",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 170,
          right: "8%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffecb4f0, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 18px #e8a537a0",
          pointerEvents: "none",
          animationDelay: "2.5s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 420,
          right: "4%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff80 40%, transparent 70%)",
          boxShadow: "0 0 14px #a878ff90",
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
            borderBottom: "1px solid rgba(61,216,197,0.18)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
              filter: "drop-shadow(0 0 16px rgba(61,216,197,0.5))",
            }}
          >
            🗺️
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 10,
              color: "#3dd8c5",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Cartographie du Royaume
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              margin: "0 0 6px",
              letterSpacing: 2,
              textShadow: "0 0 24px rgba(61,216,197,0.3)",
            }}
          >
            Carte du monde
          </h1>
          <p
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              fontSize: 13,
              color: "#a89075",
              margin: 0,
            }}
          >
            « Explore le monde ouvert du Ciel de Vignis »
          </p>
        </div>

        <div
          style={{
            background: G.card,
            border: `1px solid rgba(232,165,55,0.3)`,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: `0 0 30px rgba(168,120,255,0.15), 0 8px 32px ${G.teal}08`,
          }}
        >
          <iframe
            src="https://voxl.gg/map/eb48e335930b468ca6d90ad646be808b"
            width="100%"
            height="600px"
            frameBorder="0"
            style={{ display: "block", border: "none", borderRadius: "var(--radius-lg)" }}
            title="Carte CielDeVignis"
            allowFullScreen
          />
        </div>
        <div
          style={{
            marginTop: "var(--sp-2)",
            padding: "var(--sp-2)",
            background: `${G.teal}08`,
            border: `1px solid ${G.teal}18`,
            borderRadius: "var(--radius-md)",
            borderLeft: `3px solid ${G.teal}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div
              style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-bold)", color: G.teal }}
            >
              Navigation
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: G.muted, marginTop: 2 }}>
              Utilise la molette pour zoomer, clic-glisser pour te déplacer. Clique sur un marqueur
              pour voir les détails.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export {
  BuildsPage,
  MapPage,
  ModsPage,
};
