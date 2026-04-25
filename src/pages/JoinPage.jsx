// ═══════════════════════════════════════════════════
// JOIN PAGE — Server connection info & Discord CTA
// ═══════════════════════════════════════════════════
import { useState } from "react";
import { G } from "../styles.jsx";

const SERVER_ADDRESS = "game10.helloserv.fr:5500";
const HYTALE_VERSION = "2026.03.26-89796e57b";
const DISCORD_URL = "https://discord.gg/7YmTATJcf";

const RULES = [
  {
    icon: "🚫",
    title: "Pas de cheat",
    desc: "Tout exploit, mod tricheur ou bug abuse mène à un ban définitif.",
  },
  {
    icon: "🤝",
    title: "Respect mutuel",
    desc: "Toxicité, harcèlement et discriminations ne sont pas tolérés.",
  },
  {
    icon: "💬",
    title: "Pas de spam",
    desc: "Garde le chat lisible. Pas de pub, flood ou messages répétitifs.",
  },
];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Adresse copiée" : "Copier l'adresse du serveur"}
      style={{
        background: copied ? "rgba(46,213,115,0.15)" : "transparent",
        border: `1px solid ${copied ? "rgba(46,213,115,0.5)" : "rgba(61,216,197,0.3)"}`,
        borderRadius: 4,
        padding: "5px 11px",
        fontSize: 10.5,
        color: copied ? "#2ed573" : "#3dd8c5",
        cursor: "pointer",
        marginLeft: 10,
        fontFamily: "Consolas, Monaco, monospace",
        letterSpacing: "0.05em",
        verticalAlign: "middle",
        fontWeight: 600,
        transition: "all 0.18s",
      }}
    >
      {copied ? "✓ COPIÉ" : "📋 COPIER"}
    </button>
  );
}

function JoinPage() {
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
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff80 40%, transparent 70%)",
          boxShadow: "0 0 16px #a878ff90",
          pointerEvents: "none",
          animationDelay: "3s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 480,
          right: "4%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c580 40%, transparent 70%)",
          boxShadow: "0 0 14px #3dd8c590",
          pointerEvents: "none",
          animationDelay: "5s",
        }}
      />

      <div style={{ padding: "100px 24px 60px", maxWidth: 980, margin: "0 auto" }}>
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
            🔮
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
            Le Portail du Royaume
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
            Rejoindre
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
            « Franchis le seuil et deviens un Aventurier du Ciel de Vignis »
          </p>
        </div>

        {/* Status pill */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              background: "rgba(46,213,115,0.1)",
              border: "1px solid rgba(46,213,115,0.4)",
              borderRadius: 30,
              fontFamily: "var(--fd)",
              fontSize: 12,
              color: "#2ed573",
              letterSpacing: "0.5px",
              fontWeight: 600,
            }}
            role="status"
            aria-label="Serveur en ligne, ouvert à tous"
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "#2ed573",
                borderRadius: "50%",
                boxShadow: "0 0 10px #2ed573",
                animation: "joinPulse 2s ease-in-out infinite",
              }}
              aria-hidden="true"
            />
            SERVEUR EN LIGNE · OUVERT À TOUS
          </span>
        </div>

        {/* Server coordinates card */}
        <div
          style={{
            fontFamily: "var(--fd)",
            color: "#e8a537",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 11,
            fontWeight: 600,
            margin: "0 0 14px",
            paddingBottom: 8,
            borderBottom: "0.5px solid rgba(232,165,55,0.18)",
          }}
        >
          ⚔ Coordonnées du serveur
        </div>
        <div
          style={{
            background: "linear-gradient(180deg, rgba(26,22,40,0.7), rgba(10,8,18,0.55))",
            border: "1px solid rgba(232,165,55,0.3)",
            borderRadius: 10,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 30px rgba(232,165,55,0.08)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, #e8a537, transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              background: "rgba(232,165,55,0.1)",
            }}
            className="join-server-grid"
          >
            <div style={{ background: "rgba(10,8,18,0.6)", padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 9.5,
                  color: "#8a8070",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Adresse
              </div>
              <div
                style={{
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: 14,
                  color: "#e8a537",
                  fontWeight: 600,
                }}
              >
                {SERVER_ADDRESS}
                <CopyButton value={SERVER_ADDRESS} />
              </div>
            </div>
            <div style={{ background: "rgba(10,8,18,0.6)", padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 9.5,
                  color: "#8a8070",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Version Hytale
              </div>
              <div
                style={{
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: 13,
                  color: "#e8a537",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {HYTALE_VERSION}
              </div>
            </div>
            <div style={{ background: "rgba(10,8,18,0.6)", padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 9.5,
                  color: "#8a8070",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Mode de jeu
              </div>
              <div
                style={{
                  fontFamily: "var(--fd)",
                  fontSize: 13,
                  color: "#c9b892",
                  fontWeight: 500,
                }}
              >
                PvE · EndlessLeveling
              </div>
            </div>
          </div>
        </div>

        {/* Steps to join */}
        <div
          style={{
            fontFamily: "var(--fd)",
            color: "#e8a537",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 11,
            fontWeight: 600,
            margin: "0 0 14px",
            paddingBottom: 8,
            borderBottom: "0.5px solid rgba(232,165,55,0.18)",
          }}
        >
          📜 Comment rejoindre
        </div>
        <ol
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            listStyle: "none",
            padding: 0,
            margin: "0 0 28px",
          }}
        >
          {[
            {
              title: "Vérifie ta version d'Hytale",
              desc: (
                <>
                  Le serveur tourne sur la version{" "}
                  <strong style={{ color: "#e8a537" }}>{HYTALE_VERSION}</strong>. Si ton client est
                  plus ancien, mets-le à jour via le launcher Hytale.
                </>
              ),
            },
            {
              title: "Connecte-toi au serveur",
              desc: (
                <>
                  Lance Hytale, ajoute l'adresse{" "}
                  <code
                    style={{
                      color: "#3dd8c5",
                      background: "rgba(61,216,197,0.08)",
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontSize: 12,
                      fontFamily: "Consolas, monospace",
                    }}
                  >
                    {SERVER_ADDRESS}
                  </code>{" "}
                  dans tes serveurs favoris, puis clique « Rejoindre ».
                </>
              ),
            },
            {
              title: "Rejoins le Discord",
              desc: "Notre communauté t'aidera en cas de problème. Tu y trouveras aussi les annonces, les patch notes et les autres aventuriers.",
            },
          ].map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 18px",
                background: "rgba(26,22,40,0.5)",
                border: "1px solid rgba(232,165,55,0.18)",
                borderLeft: "3px solid #e8a537",
                borderRadius: 8,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(232,165,55,0.15)",
                  border: "1px solid rgba(232,165,55,0.5)",
                  color: "#e8a537",
                  fontFamily: "var(--fd)",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(232,165,55,0.2)",
                }}
                aria-hidden="true"
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 14,
                    color: "#f0e6d2",
                    fontWeight: 600,
                    margin: "0 0 4px",
                    letterSpacing: "0.3px",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 12.5, color: "#a89075", lineHeight: 1.55, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Rules */}
        <div
          style={{
            fontFamily: "var(--fd)",
            color: "#e8a537",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: 11,
            fontWeight: 600,
            margin: "0 0 14px",
            paddingBottom: 8,
            borderBottom: "0.5px solid rgba(232,165,55,0.18)",
          }}
        >
          ⚖ Règles du Royaume
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 28,
          }}
          className="join-rules-grid"
        >
          {RULES.map((r) => (
            <div
              key={r.title}
              style={{
                padding: "12px 14px",
                background: "rgba(26,22,40,0.45)",
                border: "1px solid rgba(168,120,255,0.18)",
                borderLeft: "3px solid #c9a5ff",
                borderRadius: 6,
                fontSize: 12,
                color: "#c9b892",
                lineHeight: 1.45,
              }}
            >
              <strong
                style={{
                  color: "#c9a5ff",
                  fontFamily: "var(--fd)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 4,
                  fontSize: 12.5,
                  letterSpacing: "0.3px",
                }}
              >
                <span aria-hidden="true">{r.icon}</span> {r.title}
              </strong>
              {r.desc}
            </div>
          ))}
        </div>

        {/* Discord CTA */}
        <div
          style={{
            marginTop: 32,
            padding: 24,
            background: "linear-gradient(135deg, rgba(168,120,255,0.1), rgba(61,216,197,0.08))",
            border: "1px solid rgba(168,120,255,0.3)",
            borderRadius: 10,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, #c9a5ff, transparent)",
              pointerEvents: "none",
            }}
          />
          <h3
            style={{
              fontFamily: "var(--fd)",
              fontSize: 17,
              color: "#f0e6d2",
              fontWeight: 600,
              margin: "0 0 6px",
              letterSpacing: "0.5px",
            }}
          >
            Besoin d'aide ou envie de papoter ?
          </h3>
          <p
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              fontSize: 12,
              color: "#a89075",
              margin: "0 0 16px",
            }}
          >
            « Rejoins les autres aventuriers sur le Discord du Royaume »
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "11px 28px",
              background: "#5865F2",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              fontFamily: "var(--fd)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(88,101,242,0.4)",
              transition: "transform 0.15s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(88,101,242,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(88,101,242,0.4)";
            }}
          >
            <span aria-hidden="true">💬</span> Rejoindre le Discord
          </a>
        </div>
      </div>

      {/* Local keyframes & responsive */}
      <style>
        {`
        @keyframes joinPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @media (max-width: 720px) {
          .join-server-grid { grid-template-columns: 1fr !important; }
          .join-rules-grid  { grid-template-columns: 1fr !important; }
        }
      `}
      </style>
    </div>
  );
}

export default JoinPage;
