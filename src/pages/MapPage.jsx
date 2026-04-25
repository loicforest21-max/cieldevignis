// ═══════════════════════════════════════════════════
// MAP PAGE — Embedded voxl.gg interactive world map
// ═══════════════════════════════════════════════════
import { G } from "../styles.jsx";

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

export default MapPage;
