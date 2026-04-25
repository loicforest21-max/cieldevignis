// ═══════════════════════════════════════════════════
// FOOTER — Site footer with brand, links, credits
// ═══════════════════════════════════════════════════
import { G } from "../styles.jsx";

const SERVER_ADDRESS = "game10.helloserv.fr:5500";
const DISCORD_URL = "https://discord.gg/7YmTATJcf";
const SITE_VERSION = "v1.0.0";
const CURRENT_YEAR = new Date().getFullYear();

function FooterLink({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="footer-link"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "5px 0",
        background: "transparent",
        border: "none",
        fontSize: 12.5,
        color: "#a89075",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "var(--fb)",
        letterSpacing: "0.2px",
      }}
    >
      <span
        style={{ display: "inline-block", width: 18, fontSize: 13 }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function Footer({ setPage }) {
  const go = (id) => {
    if (setPage) setPage(id);
  };

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #12100c 0%, #0a0812 100%)",
        borderTop: "1px solid rgba(232,165,55,0.2)",
        position: "relative",
        overflow: "hidden",
        marginTop: 40,
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
            "linear-gradient(90deg, transparent, rgba(232,165,55,0.3), rgba(201,165,255,0.25), rgba(61,216,197,0.25), transparent)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 30px 24px" }}>
        {/* Main grid: brand + 3 columns */}
        <div className="footer-grid">
          {/* ─── Brand column ─── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 7,
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: G.bg,
                  fontFamily: "var(--fd)",
                  fontSize: 16,
                  fontWeight: 900,
                  boxShadow: `0 0 16px ${G.gold}30`,
                }}
                aria-hidden="true"
              >
                C
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 17,
                    color: "#f0e6d2",
                    fontWeight: 800,
                    letterSpacing: 1,
                    lineHeight: 1,
                  }}
                >
                  CielDeVignis
                </div>
                <div
                  style={{
                    fontFamily: "var(--fd)",
                    fontSize: 9,
                    color: "#c9a5ff",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  ✦ Royaume Hytale
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: "#8a8070",
                lineHeight: 1.65,
                margin: "0 0 14px",
                maxWidth: 280,
                fontStyle: "italic",
                fontFamily: "var(--fd)",
              }}
            >
              « Le compagnon du serveur Hytale PvE — outils, codex et théorycraft pour les
              Aventuriers du Royaume. »
            </p>
            <div
              style={{
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: 11,
                color: "#3dd8c5",
                background: "rgba(61,216,197,0.08)",
                border: "1px solid rgba(61,216,197,0.2)",
                borderRadius: 4,
                padding: "5px 9px",
                display: "inline-block",
                letterSpacing: "0.05em",
              }}
            >
              {SERVER_ADDRESS}
            </div>
          </div>

          {/* ─── Tools column ─── */}
          <div>
            <div className="footer-col-title">⚔ Outils</div>
            <FooterLink icon="⚔️" label="Build Creator" onClick={() => go("builds")} />
            <FooterLink icon="📖" label="Wiki" onClick={() => go("wiki")} />
            <FooterLink icon="🏰" label="Donjons" onClick={() => go("dungeons")} />
            <FooterLink icon="🗺️" label="Carte" onClick={() => go("map")} />
            <FooterLink icon="🧩" label="Mods" onClick={() => go("mods")} />
          </div>

          {/* ─── Community column ─── */}
          <div>
            <div className="footer-col-title">🌍 Communauté</div>
            <FooterLink icon="🌍" label="Builds partagés" onClick={() => go("community")} />
            <FooterLink icon="🔮" label="Rejoindre le serveur" onClick={() => go("join")} />
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 14px",
                background: "rgba(88,101,242,0.15)",
                border: "1px solid rgba(88,101,242,0.4)",
                borderRadius: 6,
                color: "#8b96f9",
                fontFamily: "var(--fd)",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.3px",
                marginTop: 8,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(88,101,242,0.25)";
                e.currentTarget.style.borderColor = "rgba(88,101,242,0.6)";
                e.currentTarget.style.color = "#b1bbff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(88,101,242,0.15)";
                e.currentTarget.style.borderColor = "rgba(88,101,242,0.4)";
                e.currentTarget.style.color = "#8b96f9";
              }}
            >
              <span aria-hidden="true">💬</span> Discord du Royaume
            </a>
          </div>

          {/* ─── Kingdom info column ─── */}
          <div>
            <div className="footer-col-title">📚 Le Royaume</div>
            <div
              style={{
                fontSize: 11,
                color: "#8a8070",
                lineHeight: 1.85,
                fontFamily: "var(--fb)",
              }}
            >
              Mode <strong style={{ color: "#3dd8c5" }}>PvE</strong>
              <br />
              Mod <strong style={{ color: "#e8a537" }}>EndlessLeveling v7.0.6</strong>
              <br />
              Hytale{" "}
              <span
                style={{
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: 10,
                  color: "#c9b892",
                }}
              >
                2026.03.26
              </span>
            </div>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div
          style={{
            padding: "18px 0 0",
            borderTop: "0.5px solid rgba(232,165,55,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 10.5,
            color: "#6a5a45",
            fontFamily: "var(--fd)",
            letterSpacing: "0.05em",
          }}
        >
          <div style={{ fontStyle: "italic" }}>
            Site forgé avec passion par{" "}
            <b style={{ color: "#c9b892", fontWeight: 600, fontStyle: "normal" }}>Luo-Yi</b> ·{" "}
            {CURRENT_YEAR}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: 10,
                padding: "2px 8px",
                background: "rgba(232,165,55,0.08)",
                border: "1px solid rgba(232,165,55,0.18)",
                borderRadius: 3,
                color: "#c9b892",
                letterSpacing: "0.05em",
              }}
            >
              {SITE_VERSION}
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span
              style={{
                fontSize: 10.5,
                color: "#6a5a45",
                fontFamily: "var(--fb)",
              }}
            >
              Conditions
            </span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span
              style={{
                fontSize: 10.5,
                color: "#6a5a45",
                fontFamily: "var(--fb)",
              }}
            >
              Confidentialité
            </span>
          </div>
        </div>

        {/* ─── Legal disclaimer ─── */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
            marginTop: 14,
            paddingTop: 14,
            borderTop: "0.5px solid rgba(42,34,24,0.6)",
            fontSize: 9.5,
            color: "#5f5240",
            fontStyle: "italic",
            fontFamily: "var(--fd)",
            letterSpacing: "0.05em",
          }}
        >
          Site communautaire non-officiel. Hytale™ est une marque de Hytale Inc. — non affilié.
        </div>
      </div>

      {/* Local styles for grid responsiveness and link hover */}
      <style>
        {`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 32px;
        }
        .footer-col-title {
          font-family: var(--fd);
          font-size: 10px;
          color: #e8a537;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 0.5px solid rgba(232,165,55,0.18);
        }
        .footer-link:hover {
          color: #e8a537 !important;
          padding-left: 4px !important;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}
      </style>
    </footer>
  );
}

export { Footer };
