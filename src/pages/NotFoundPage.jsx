// ═══════════════════════════════════════════════════
// NOT FOUND PAGE — Themed 404 fallback
// ═══════════════════════════════════════════════════
import { G } from "../styles.jsx";

function NotFoundPage({ setPage, onOpenSearch }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}
    >
      {/* Magical night background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 800,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, #0a0812 0%, #1a1228 40%, #2a1a34 70%, transparent 100%)",
          zIndex: -1,
        }}
      />

      {/* Floating magical orbs */}
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: "18%",
          left: "14%",
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff80 40%, transparent 70%)",
          boxShadow: "0 0 16px #a878ff90",
          pointerEvents: "none",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: "24%",
          right: "18%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffecb4f0, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 14px #e8a537a0",
          pointerEvents: "none",
          animationDelay: "2.5s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          bottom: "25%",
          left: "20%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c573 40%, transparent 70%)",
          boxShadow: "0 0 14px #3dd8c590",
          pointerEvents: "none",
          animationDelay: "5s",
        }}
      />

      {/* Decorative flourishes (top corners) */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        stroke="#e8a537"
        strokeWidth="0.9"
        opacity="0.45"
        aria-hidden="true"
        style={{ position: "absolute", top: 100, left: "12%", width: 36, height: 36 }}
      >
        <path d="M3 3 L3 15 M3 3 L15 3 M3 3 Q14 14 20 11 M3 3 Q14 14 11 20" />
      </svg>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        stroke="#e8a537"
        strokeWidth="0.9"
        opacity="0.45"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 100,
          right: "12%",
          width: 36,
          height: 36,
          transform: "scaleX(-1)",
        }}
      >
        <path d="M3 3 L3 15 M3 3 L15 3 M3 3 Q14 14 20 11 M3 3 Q14 14 11 20" />
      </svg>

      {/* Floating rune */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 18,
          opacity: 0.7,
          filter: "drop-shadow(0 0 18px rgba(168,120,255,0.4))",
          animation: "nfFloat 4s ease-in-out infinite",
        }}
        aria-hidden="true"
      >
        🌀
      </div>

      {/* Big "404" */}
      <div
        style={{
          fontFamily: "var(--fd)",
          fontSize: 96,
          fontWeight: 900,
          color: "rgba(232,165,55,0.25)",
          letterSpacing: 6,
          lineHeight: 0.9,
          margin: "0 0 18px",
          textShadow: "0 0 30px rgba(232,165,55,0.18)",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        404
      </div>

      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--fd)",
          fontSize: 11,
          color: "#c9a5ff",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Sentier non cartographié
      </div>

      {/* Main title */}
      <h1
        style={{
          fontFamily: "var(--fd)",
          fontSize: 30,
          fontWeight: 900,
          color: "#f0e6d2",
          margin: "0 0 14px",
          letterSpacing: 1.5,
          textShadow: "0 0 22px rgba(232,165,55,0.25)",
        }}
      >
        Cette page s'est perdue dans la brume
      </h1>

      {/* Lore quote */}
      <p
        style={{
          fontFamily: "var(--fd)",
          fontStyle: "italic",
          fontSize: 14,
          color: "#a89075",
          maxWidth: 480,
          margin: "0 auto 30px",
          lineHeight: 1.7,
        }}
      >
        « Tu as franchi un portail que les cartographes du Royaume n'ont jamais tracé. Reviens à
        l'accueil, ou cherche ce que tu désirais via le grimoire de recherche. »
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPage && setPage("home")}
          style={{
            padding: "11px 24px",
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
            border: "none",
            borderRadius: 6,
            color: G.bg,
            fontFamily: "var(--fd)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.5px",
            cursor: "pointer",
            boxShadow: `0 4px 18px ${G.gold}55`,
            transition: "transform 0.15s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 6px 24px ${G.gold}77`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 18px ${G.gold}55`;
          }}
        >
          <span aria-hidden="true">🏠</span> Retour à l'accueil
        </button>
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            style={{
              padding: "11px 22px",
              background: "transparent",
              border: `1px solid ${G.gold}66`,
              borderRadius: 6,
              color: G.gold,
              fontFamily: "var(--fd)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.5px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232,165,55,0.08)";
              e.currentTarget.style.borderColor = "rgba(232,165,55,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = `${G.gold}66`;
            }}
          >
            <span aria-hidden="true">🔎</span> Rechercher{" "}
            <span
              style={{
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: 9.5,
                padding: "1px 6px",
                background: "rgba(232,165,55,0.15)",
                border: "1px solid rgba(232,165,55,0.3)",
                borderRadius: 3,
                color: "#c9b892",
                letterSpacing: "0.05em",
                fontWeight: 600,
              }}
              aria-hidden="true"
            >
              ⌘K
            </span>
          </button>
        )}
      </div>

      <style>
        {`
        @keyframes nfFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
      `}
      </style>
    </div>
  );
}

export default NotFoundPage;
