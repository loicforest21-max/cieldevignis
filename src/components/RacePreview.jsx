// ═══════════════════════════════════════════════════
// RACE PREVIEW — Compact race card for landing showcase
// ═══════════════════════════════════════════════════
import { G } from "../styles.jsx";

function RacePreview({ race, delay }) {
  return (
    <div
      className="race-preview"
      style={{
        background: `linear-gradient(165deg, ${G.card}, ${race.color}08)`,
        border: `1px solid ${race.color}20`,
        borderRadius: "var(--radius-md)",
        padding: "18px 22px",
        textAlign: "center",
        minWidth: 124,
        flex: "0 0 auto",
        animation: `fadeSlideUp 0.5s ease ${delay}s both`,
        borderLeft: `3px solid ${race.color}50`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${race.color}04 1px, transparent 1px), linear-gradient(90deg, ${race.color}04 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: 36,
          marginBottom: 8,
          position: "relative",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
        }}
      >
        {race.emoji}
      </div>
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: "var(--fw-black)",
          color: race.color,
          fontFamily: "var(--fd)",
          letterSpacing: 0.5,
          position: "relative",
        }}
      >
        {race.name}
      </div>
      <div
        style={{ fontSize: "var(--text-xs)", color: G.muted, marginTop: 4, position: "relative" }}
      >
        {race.passives.length} passifs
      </div>
    </div>
  );
}

export { RacePreview };
