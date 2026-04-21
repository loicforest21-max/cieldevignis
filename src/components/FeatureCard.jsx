// ═══════════════════════════════════════════════════
// FEATURE CARD — Landing page feature showcase card
// ═══════════════════════════════════════════════════
import { G } from "../styles.jsx";

function FeatureCard({ icon, title, desc, color, delay, onClick }) {
  return (
    <div
      onClick={onClick}
      className="feature-card"
      style={{
        background: `linear-gradient(165deg, ${G.card}, ${color}08)`,
        border: `1px solid ${G.border}`,
        borderRadius: 10,
        padding: 0,
        cursor: onClick ? "pointer" : "default",
        animation: `fadeSlideUp 0.6s ease ${delay}s both`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}40)`,
        }}
      />
      {/* Corner glow */}
      <div
        style={{
          position: "absolute",
          top: -15,
          right: -15,
          width: 50,
          height: 50,
          background: `radial-gradient(circle, ${color}10, transparent)`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div style={{ padding: "22px 20px", position: "relative" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 16,
            fontWeight: 700,
            color: color,
            fontFamily: "var(--fd)",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: G.muted, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export { FeatureCard };
