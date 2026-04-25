// ═══════════════════════════════════════════════════
// NAVBAR — Top navigation with magical accents
// ═══════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { G } from "../styles.jsx";

function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "home", label: "Accueil", icon: "🏠" },
    { id: "builds", label: "Build Creator", icon: "⚔️" },
    { id: "community", label: "Communauté", icon: "🌍" },
    { id: "dungeons", label: "Donjons", icon: "🏰" },
    { id: "wiki", label: "Wiki", icon: "📖" },
    { id: "mods", label: "Mods", icon: "🧩" },
    { id: "map", label: "Carte", icon: "🗺️" },
    { id: "discord", label: "Discord", icon: "💬" },
  ];
  const go = (id) => {
    if (id === "discord") window.open("https://discord.gg/7YmTATJcf", "_blank");
    else setPage(id);
    setMenuOpen(false);
  };
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled || menuOpen ? `${G.bg}f0` : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: scrolled ? `1px solid ${G.gold}15` : "none",
        transition: "all 0.4s ease",
        padding: "0 20px",
      }}
    >
      {/* Tricolor magical accent line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #e8a53766, #c9a5ff4d, #3dd8c54d, transparent)",
          opacity: scrolled || menuOpen ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setPage("home");
            setMenuOpen(false);
          }}
          aria-label="CielDeVignis — Retour à l'accueil"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            padding: 0,
            color: "inherit",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${G.gold}40 0%, transparent 70%)`,
                animation: "navLogoGlow 3s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 7,
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 900,
                color: G.bg,
                fontFamily: "var(--fd)",
                boxShadow: `0 0 18px ${G.gold}40`,
                position: "relative",
                zIndex: 1,
              }}
            >
              C
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              className="nav-title"
              style={{
                fontSize: 17,
                fontWeight: 800,
                fontFamily: "var(--fd)",
                letterSpacing: 1,
                color: "#f5f0e8",
              }}
            >
              CielDeVignis
            </span>
            <span
              className="nav-tagline"
              style={{
                fontFamily: "var(--fd)",
                fontSize: 9,
                color: "#c9a5ff",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              ✦ Royaume Hytale
            </span>
          </div>
        </button>
        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 3 }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`nav-link${page === l.id ? " active" : ""}`}
              aria-current={page === l.id ? "page" : undefined}
            >
              <span style={{ fontSize: 15 }} aria-hidden="true">
                {l.icon}
              </span>
              {l.label}
            </button>
          ))}
        </div>
        {/* Mobile hamburger */}
        <button
          className="nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: G.teal,
            fontSize: 24,
            cursor: "pointer",
            padding: 8,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="nav-mobile-menu"
          style={{
            display: "none",
            flexDirection: "column",
            gap: 2,
            padding: "8px 0 16px",
            borderTop: `1px solid ${G.gold}20`,
            animation: "fadeSlideUp 0.2s ease",
          }}
        >
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`nav-link${page === l.id ? " active" : ""}`}
              aria-current={page === l.id ? "page" : undefined}
              style={{ width: "100%", textAlign: "left", fontSize: 15, gap: 10 }}
            >
              <span style={{ fontSize: 18 }} aria-hidden="true">
                {l.icon}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export { Navbar };
