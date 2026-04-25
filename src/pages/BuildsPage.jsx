// ═══════════════════════════════════════════════════
// BUILDS PAGE — Magical wrapper around BuildCreator
// ═══════════════════════════════════════════════════
import { BuildCreator } from "../BuildCreator.jsx";

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

export { BuildsPage };
