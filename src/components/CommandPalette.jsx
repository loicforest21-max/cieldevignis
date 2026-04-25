// ═══════════════════════════════════════════════════
// COMMAND PALETTE — Global Ctrl+K search modal
// ═══════════════════════════════════════════════════
import { useEffect, useState, useRef, useMemo } from "react";
import { getSearchIndex, searchIndex } from "../search/searchIndex.js";

// ─── Visual config per type ───
const TYPE_META = {
  item: { label: "Items", order: 3, color: "rgba(232,165,55," },
  race: { label: "Races", order: 1, color: "rgba(61,216,197," },
  class: { label: "Classes", order: 2, color: "rgba(168,120,255," },
  dungeon: { label: "Donjons", order: 4, color: "rgba(255,128,96," },
  mob: { label: "Mobs", order: 5, color: "rgba(195,160,255," },
  mod: { label: "Mods", order: 6, color: "rgba(116,185,255," },
  page: { label: "Pages", order: 0, color: "rgba(195,160,255," },
};

const QUALITY_BADGE = {
  Common: { color: "#a8a399", bg: "rgba(168,163,153,0.12)", label: "Commun" },
  Rare: { color: "#3dd8c5", bg: "rgba(61,216,197,0.15)", label: "Rare" },
  Epic: { color: "#c9a5ff", bg: "rgba(168,120,255,0.15)", label: "Épique" },
  Legendary: { color: "#e8a537", bg: "rgba(232,165,55,0.18)", label: "Légendaire" },
};

// ─── Highlight matched substring inside a name ───
function HighlightedName({ name, query }) {
  if (!query) return name;
  const lower = name.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <b style={{ color: "#e8a537", fontWeight: 700 }}>{name.slice(idx, idx + q.length)}</b>
      {name.slice(idx + q.length)}
    </>
  );
}

// ─── Main component ───
function CommandPalette({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Lazy-load the search index when first opened
  useEffect(() => {
    if (isOpen && !index && !loading) {
      setLoading(true);
      getSearchIndex().then((idx) => {
        setIndex(idx);
        setLoading(false);
      });
    }
  }, [isOpen, index, loading]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIdx(0);
    } else {
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Compute results
  const flatResults = useMemo(() => {
    if (!index || !query.trim()) return [];
    return searchIndex(index, query);
  }, [index, query]);

  // Group results by type for display
  const grouped = useMemo(() => {
    const groups = {};
    flatResults.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return Object.entries(groups).sort(
      (a, b) => (TYPE_META[a[0]]?.order || 99) - (TYPE_META[b[0]]?.order || 99)
    );
  }, [flatResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, flatResults.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const r = flatResults[selectedIdx];
      if (r) {
        onNavigate(r);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,8,18,0.78)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        animation: "cmdFadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580,
          maxWidth: "92%",
          background: "linear-gradient(180deg, rgba(26,22,40,0.96), rgba(15,10,26,0.96))",
          border: "1px solid rgba(232,165,55,0.35)",
          borderRadius: 12,
          boxShadow:
            "0 20px 60px rgba(168,120,255,0.25), 0 0 0 1px rgba(232,165,55,0.08) inset",
          overflow: "hidden",
          position: "relative",
          animation: "cmdSlideDown 0.2s ease",
        }}
      >
        {/* Tricolor accent line on top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #e8a537, #c9a5ff, #3dd8c5, transparent)",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 22px",
            borderBottom: "1px solid rgba(232,165,55,0.18)",
            background: "rgba(10,8,18,0.4)",
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.7 }} aria-hidden="true">
            🔎
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cherche un item, donjon, race, classe…"
            aria-label="Recherche"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f0e6d2",
              fontSize: 16,
              fontFamily: "var(--fd)",
              letterSpacing: "0.3px",
              minWidth: 0,
            }}
          />
          <span
            style={{
              fontFamily: "Consolas, Monaco, monospace",
              fontSize: 10,
              padding: "3px 8px",
              background: "rgba(232,165,55,0.1)",
              border: "1px solid rgba(232,165,55,0.25)",
              borderRadius: 4,
              color: "#c9b892",
              letterSpacing: "0.05em",
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            ESC
          </span>
        </div>

        {/* Results body */}
        <div
          ref={listRef}
          style={{
            maxHeight: "55vh",
            overflowY: "auto",
            padding: "8px 0",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(232,165,55,0.3) transparent",
          }}
        >
          {loading && (
            <div
              style={{
                padding: "32px 22px",
                textAlign: "center",
                color: "#8a8070",
                fontFamily: "var(--fd)",
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              ✦ Invocation du codex...
            </div>
          )}

          {!loading && !query.trim() && (
            <div
              style={{
                padding: "32px 22px",
                textAlign: "center",
                color: "#8a8070",
                fontFamily: "var(--fd)",
                fontStyle: "italic",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              « Tape un nom d'item, de donjon, de race ou de classe »
              <div style={{ marginTop: 14, fontSize: 11, opacity: 0.7, fontStyle: "normal" }}>
                Essaie : <em style={{ color: "#e8a537" }}>dragon</em>,{" "}
                <em style={{ color: "#3dd8c5" }}>shiva</em>,{" "}
                <em style={{ color: "#c9a5ff" }}>mage</em>
              </div>
            </div>
          )}

          {!loading && query.trim() && flatResults.length === 0 && (
            <div
              style={{
                padding: "32px 22px",
                textAlign: "center",
                color: "#8a8070",
                fontFamily: "var(--fd)",
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              Aucun résultat pour « <span style={{ color: "#e8a537" }}>{query}</span> »
            </div>
          )}

          {!loading &&
            grouped.map(([type, results]) => {
              const meta = TYPE_META[type] || { label: type };
              return (
                <div key={type}>
                  <div
                    style={{
                      padding: "10px 22px 6px",
                      fontFamily: "var(--fd)",
                      fontSize: 9.5,
                      color: "#8a8070",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>{meta.label}</span>
                    <span
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        background: "rgba(232,165,55,0.1)",
                        borderRadius: 8,
                        color: "#e8a537",
                        letterSpacing: 0,
                        fontWeight: 700,
                      }}
                    >
                      {results.length}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        height: 1,
                        background: "linear-gradient(90deg, rgba(232,165,55,0.18), transparent)",
                      }}
                    />
                  </div>
                  {results.map((r) => {
                    const flatIdx = flatResults.indexOf(r);
                    const isSelected = flatIdx === selectedIdx;
                    return (
                      <ResultRow
                        key={r.id}
                        result={r}
                        query={query}
                        isSelected={isSelected}
                        onHover={() => setSelectedIdx(flatIdx)}
                        onClick={() => {
                          onNavigate(r);
                          onClose();
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer with shortcut hints */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 22px",
            borderTop: "1px solid rgba(232,165,55,0.15)",
            background: "rgba(10,8,18,0.5)",
            fontSize: 10.5,
            color: "#8a8070",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Shortcut k="↑↓" label="Naviguer" />
            <Shortcut k="↵" label="Ouvrir" />
            <Shortcut k="ESC" label="Fermer" />
          </div>
          <span
            style={{
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              color: "#6a5a45",
              letterSpacing: "0.2em",
            }}
          >
            ✦ CIELDEVIGNIS
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cmdFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cmdSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Shortcut({ k, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          fontFamily: "Consolas, Monaco, monospace",
          fontSize: 9.5,
          padding: "1px 6px",
          background: "rgba(232,165,55,0.1)",
          border: "1px solid rgba(232,165,55,0.25)",
          borderRadius: 4,
          color: "#c9b892",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {k}
      </span>
      {label}
    </span>
  );
}

function ResultRow({ result, query, isSelected, onHover, onClick }) {
  const r = result;
  const iconBg = (TYPE_META[r.type]?.color || "rgba(255,255,255,") + "0.12)";
  const iconBorder = (TYPE_META[r.type]?.color || "rgba(255,255,255,") + "0.3)";
  const qualityBadge = r.type === "item" && r.quality ? QUALITY_BADGE[r.quality] : null;

  return (
    <div
      data-selected={isSelected || undefined}
      onClick={onClick}
      onMouseEnter={onHover}
      role="option"
      aria-selected={isSelected}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 22px",
        cursor: "pointer",
        transition: "background 0.12s",
        borderLeft: "3px solid " + (isSelected ? "#e8a537" : "transparent"),
        background: isSelected
          ? "linear-gradient(90deg, rgba(232,165,55,0.12), transparent)"
          : "transparent",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
          background: iconBg,
          border: "1px solid " + iconBorder,
        }}
        aria-hidden="true"
      >
        {r.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div
          style={{
            fontFamily: "var(--fd)",
            fontSize: 13.5,
            color: isSelected ? "#f5d575" : "#f0e6d2",
            fontWeight: 500,
            letterSpacing: "0.2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <HighlightedName name={r.name} query={query} />
        </div>
        {r.sub && (
          <div
            style={{
              fontSize: 11,
              color: "#8a8070",
              marginTop: 1,
              letterSpacing: "0.05em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.sub}
          </div>
        )}
      </div>
      {qualityBadge && (
        <span
          style={{
            fontSize: 9.5,
            padding: "2px 7px",
            borderRadius: 3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
            flexShrink: 0,
            background: qualityBadge.bg,
            color: qualityBadge.color,
          }}
        >
          {qualityBadge.label}
        </span>
      )}
      <span
        style={{
          fontSize: 12,
          color: isSelected ? "#e8a537" : "#8a8070",
          opacity: isSelected ? 1 : 0,
          flexShrink: 0,
          transition: "opacity 0.12s",
        }}
        aria-hidden="true"
      >
        →
      </span>
    </div>
  );
}

export { CommandPalette };
