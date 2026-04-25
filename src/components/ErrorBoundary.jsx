// ═══════════════════════════════════════════════════
// ERROR BOUNDARY — Catches render errors and shows a themed fallback
// ═══════════════════════════════════════════════════
import { Component } from "react";
import { G } from "../styles.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console for dev debugging — could be sent to a monitoring service later
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
          padding: "100px 24px",
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
            height: 600,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, #0a0812 0%, #1a1228 40%, #2a1a34 70%, transparent 100%)",
            zIndex: -1,
          }}
        />

        {/* Broken rune icon */}
        <div
          style={{
            fontSize: 64,
            marginBottom: 18,
            filter: "drop-shadow(0 0 20px rgba(232,165,55,0.4))",
            opacity: 0.85,
          }}
        >
          ⚠️
        </div>

        <div
          style={{
            fontFamily: "var(--fd)",
            fontSize: 11,
            color: "#c9a5ff",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Une rune s'est brisée
        </div>

        <h2
          style={{
            fontFamily: "var(--fd)",
            fontSize: 28,
            fontWeight: 900,
            color: "#f0e6d2",
            margin: "0 0 12px",
            letterSpacing: 1.5,
            textShadow: "0 0 20px rgba(232,165,55,0.25)",
          }}
        >
          Une erreur s'est produite
        </h2>

        <p
          style={{
            fontFamily: "var(--fd)",
            fontStyle: "italic",
            fontSize: 14,
            color: "#a89075",
            maxWidth: 500,
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
        >
          « Le grimoire a refusé de s'ouvrir cette fois-ci. Essaie de revenir en arrière, ou
          retourne au royaume principal. »
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 22px",
              borderRadius: 6,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
              border: "none",
              color: G.bg,
              fontFamily: "var(--fd)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.5px",
              cursor: "pointer",
              boxShadow: `0 4px 18px ${G.gold}40`,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            ✦ Réessayer
          </button>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "10px 22px",
              borderRadius: 6,
              background: "transparent",
              border: `1px solid ${G.gold}40`,
              color: G.gold,
              fontFamily: "var(--fd)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.5px",
              cursor: "pointer",
            }}
          >
            🏠 Retour à l'accueil
          </button>
        </div>

        {/* Technical details (collapsed) for dev debugging */}
        {this.state.error && (
          <details
            style={{
              marginTop: 32,
              maxWidth: 600,
              fontSize: 11,
              color: "#6a5a45",
              fontFamily: "monospace",
              textAlign: "left",
              opacity: 0.7,
            }}
          >
            <summary style={{ cursor: "pointer", marginBottom: 6 }}>Détails techniques</summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "rgba(10,8,18,0.6)",
                padding: 12,
                borderRadius: 4,
                border: "1px solid rgba(232,165,55,0.15)",
                margin: 0,
              }}
            >
              {this.state.error.toString()}
            </pre>
          </details>
        )}
      </div>
    );
  }
}

export { ErrorBoundary };
