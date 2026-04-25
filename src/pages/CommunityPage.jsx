// ═══════════════════════════════════════════════════
// COMMUNITY PAGE — Build sharing via Firebase Firestore
// ═══════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { STATS, RACES, CLASSES, AUGMENTS } from "../data/core.js";
import { BUILD_TAGS } from "../data/builds.js";
import { G } from "../styles.jsx";
import { decodeBuild, computeFullStats } from "../engine.js";
import { publishBuild, fetchBuilds } from "../firebase.js";

function CommunityPage({ setPage, initialCode, onClearInitialCode, onEditInBuilder }) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRace, setFilterRace] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [copied, setCopied] = useState(null);

  const [pubCode, setPubCode] = useState("");
  const [pubName, setPubName] = useState("");
  const [pubDesc, setPubDesc] = useState("");
  const [pubTags, setPubTags] = useState([]);
  const [pubAuthor, setPubAuthor] = useState(() => {
    try {
      return localStorage.getItem("cdv_author") || "";
    } catch {
      return "";
    }
  });
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState("");
  const [pubSuccess, setPubSuccess] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [decodedStats, setDecodedStats] = useState(null);

  const loadBuilds = async () => {
    setLoading(true);
    setError(null);
    try {
      setBuilds(await fetchBuilds());
    } catch (e) {
      setError("Erreur de chargement : " + e.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadBuilds();
  }, []);

  // Auto-open publish form if coming from BuildCreator with a code
  useEffect(() => {
    if (initialCode) {
      setPubCode(initialCode);
      setShowPublish(true);
      if (onClearInitialCode) onClearInitialCode();
    }
  }, [initialCode]);

  useEffect(() => {
    if (!pubCode.trim()) {
      setDecoded(null);
      setDecodedStats(null);
      return;
    }
    const d = decodeBuild(pubCode.trim());
    setDecoded(d);
    if (d) {
      try {
        const { finalStats } = computeFullStats({
          race: d.selectedRace,
          evoId: d.selectedEvo || d.selectedRace?.id,
          c1: d.primaryClass,
          t1: d.primaryTier,
          c2: d.secondaryClass,
          t2: d.secondaryTier,
          level: d.level,
          skillPoints: d.skillPoints,
          selectedAugments: d.selectedAugments,
          augBonus: d.augBonus || {},
        });
        setDecodedStats(finalStats);
      } catch (e) {
        console.error("decodedStats error:", e);
        setDecodedStats(null);
      }
    } else {
      setDecodedStats(null);
    }
  }, [pubCode]);

  const toggleTag = (id) =>
    setPubTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 3 ? [...t, id] : t));

  const handlePublish = async () => {
    if (!pubCode.trim() || !pubName.trim() || !pubAuthor.trim()) {
      setPubError("Code, nom et pseudo sont requis.");
      return;
    }
    if (pubAuthor.trim().length > 20) {
      setPubError("Pseudo max 20 caractères.");
      return;
    }
    if (!decoded) {
      setPubError("Code de build invalide.");
      return;
    }
    setPublishing(true);
    setPubError("");
    try {
      localStorage.setItem("cdv_author", pubAuthor.trim());
      const topStats = {};
      if (decodedStats) {
        STATS.map((s) => ({ key: s.key, val: decodedStats[s.key] || 0 }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .forEach((s) => {
            topStats[s.key] = Math.round(s.val * 100) / 100;
          });
      }
      await publishBuild({
        code: pubCode.trim(),
        name: pubName.trim(),
        description: pubDesc.trim(),
        author: pubAuthor.trim(),
        race: decoded.selectedRace?.id || "",
        raceEvo: decoded.selectedEvo || "",
        primaryClass: decoded.primaryClass?.id || "",
        secondaryClass: decoded.secondaryClass?.id || "",
        role: decoded.primaryClass?.roles?.[0] || "",
        level: decoded.level || 1,
        prestige: decoded.prestige || 0,
        augments: decoded.selectedAugments?.map((a) => a.id) || [],
        topStats,
        tags: pubTags,
      });
      setPubSuccess(true);
      setPubCode("");
      setPubName("");
      setPubDesc("");
      setPubTags([]);
      setDecoded(null);
      setDecodedStats(null);
      setTimeout(() => {
        setPubSuccess(false);
        setShowPublish(false);
        loadBuilds();
      }, 1500);
    } catch (e) {
      setPubError("Erreur : " + e.message);
    }
    setPublishing(false);
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const filtered = builds.filter((b) => {
    if (filterRace && b.race !== filterRace) return false;
    if (filterClass && b.primaryClass !== filterClass) return false;
    if (filterRole && b.role !== filterRole) return false;
    if (filterTag && !(b.tags || []).includes(filterTag)) return false;
    return true;
  });

  const allRoles = [...new Set(CLASSES.flatMap((c) => c.roles))].sort();
  const inp = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid " + G.border,
    background: G.bg,
    color: "#f0e6d2",
    fontSize: 14,
    fontFamily: "var(--fb)",
    outline: "none",
  };
  const sel = { ...inp, cursor: "pointer", appearance: "auto" };

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
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "radial-gradient(circle, #dcb4ffe6, #a878ff80 40%, transparent 70%)",
          boxShadow: "0 0 18px #a878ffa0",
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
          background: "radial-gradient(circle, #ffecb4f0, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 16px #e8a537a0",
          pointerEvents: "none",
          animationDelay: "3s",
        }}
      />
      <div
        className="page-orb"
        style={{
          position: "absolute",
          top: 450,
          left: "3%",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a5fff0e6, #3dd8c580 40%, transparent 70%)",
          boxShadow: "0 0 14px #3dd8c590",
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
            borderBottom: "1px solid rgba(168,120,255,0.18)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
              filter: "drop-shadow(0 0 16px rgba(168,120,255,0.5))",
            }}
          >
            🌍
          </div>
          <div
            style={{
              fontFamily: "var(--fd)",
              fontSize: 10,
              color: "#c9a5ff",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Place des Aventuriers
          </div>
          <h1
            style={{
              fontFamily: "var(--fd)",
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              margin: "0 0 6px",
              letterSpacing: 2,
              textShadow: "0 0 24px rgba(168,120,255,0.3)",
            }}
          >
            Communauté
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
            « Partage tes builds avec le royaume, inspire-toi des autres »
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPublish(!showPublish)}
            style={{
              padding: "10px 22px",
              borderRadius: "var(--radius-md)",
              border: "2px solid " + G.teal,
              background: showPublish ? G.teal + "20" : G.teal + "10",
              color: G.teal,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--fb)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {showPublish ? "✕ Annuler" : "📤 Publier un build"}
          </button>
          <button
            onClick={() => setPage("builds")}
            style={{
              padding: "10px 22px",
              borderRadius: "var(--radius-md)",
              border: "2px solid " + G.border,
              background: "transparent",
              color: G.muted,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--fb)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚔️ Créer un build
          </button>
        </div>

        {showPublish && (
          <div
            style={{
              background: G.card,
              border: "1px solid " + G.teal + "30",
              borderRadius: "var(--radius-lg)",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#f0e6d2",
                fontFamily: "var(--fd)",
                marginBottom: 16,
              }}
            >
              📤 Publier un build
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Code du build *
                </label>
                <input
                  value={pubCode}
                  onChange={(e) => setPubCode(e.target.value)}
                  placeholder="Colle ton code (Build Creator → Exporter)"
                  style={inp}
                />
                {pubCode && !decoded && (
                  <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 4 }}>Code invalide</div>
                )}
                {decoded && (
                  <div
                    style={{
                      fontSize: 11,
                      color: G.teal,
                      marginTop: 4,
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>✓ {decoded.selectedRace?.name || "?"}</span>
                    <span>· {decoded.primaryClass?.name || "?"}</span>
                    {decoded.secondaryClass && <span>/ {decoded.secondaryClass.name}</span>}
                    <span>
                      · Niv.{decoded.level} P{decoded.prestige}
                    </span>
                    {decoded.selectedAugments?.length > 0 && (
                      <span>· {decoded.selectedAugments.length} augments</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Nom du build *
                </label>
                <input
                  value={pubName}
                  onChange={(e) => setPubName(e.target.value)}
                  placeholder='Ex: "Tank Golem Indestructible"'
                  style={inp}
                  maxLength={50}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Ton pseudo *
                </label>
                <input
                  value={pubAuthor}
                  onChange={(e) => setPubAuthor(e.target.value)}
                  placeholder="Pseudo (max 20 car.)"
                  style={inp}
                  maxLength={20}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Description (optionnel)
                </label>
                <textarea
                  value={pubDesc}
                  onChange={(e) => setPubDesc(e.target.value)}
                  placeholder="Explique ta stratégie, forces et faiblesses..."
                  rows={3}
                  style={{ ...inp, resize: "vertical" }}
                  maxLength={500}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Tags — style de jeu (max 3)
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {BUILD_TAGS.map((t) => {
                    const active = pubTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTag(t.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid " + (active ? t.color : G.border),
                          background: active ? t.color + "18" : "transparent",
                          color: active ? t.color : G.muted,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "var(--fb)",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {decoded && decodedStats && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: G.bg,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid " + G.border,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, marginBottom: 8 }}>
                  Aperçu du build
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATS.filter((s) => decodedStats[s.key] > 0)
                    .sort((a, b) => (decodedStats[b.key] || 0) - (decodedStats[a.key] || 0))
                    .slice(0, 6)
                    .map((s) => (
                      <span
                        key={s.key}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: s.color + "12",
                          border: "1px solid " + s.color + "20",
                          color: s.color,
                          fontWeight: 700,
                        }}
                      >
                        {s.icon} {s.name}: {Math.round(decodedStats[s.key] * 100) / 100}
                      </span>
                    ))}
                </div>
                {decoded.selectedAugments?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {decoded.selectedAugments.map((a) => (
                      <span
                        key={a.id}
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: G.purple + "15",
                          color: G.purple,
                          fontWeight: 600,
                        }}
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {pubError && (
              <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{pubError}</div>
            )}
            {pubSuccess && (
              <div style={{ color: G.teal, fontSize: 13, marginTop: 10, fontWeight: 700 }}>
                ✓ Build publié !
              </div>
            )}
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                marginTop: 14,
                padding: "12px 32px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: G.teal,
                color: "#000",
                fontWeight: 800,
                fontSize: 14,
                cursor: publishing ? "wait" : "pointer",
                fontFamily: "var(--fb)",
                opacity: publishing ? 0.6 : 1,
              }}
            >
              {publishing ? "Publication..." : "Publier"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <select
            value={filterRace}
            onChange={(e) => setFilterRace(e.target.value)}
            style={{ ...sel, maxWidth: 180 }}
          >
            <option value="">Toutes les races</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.emoji} {r.name}
              </option>
            ))}
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{ ...sel, maxWidth: 180 }}
          >
            <option value="">Toutes les classes</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ ...sel, maxWidth: 180 }}
          >
            <option value="">Tous les rôles</option>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            style={{ ...sel, maxWidth: 180 }}
          >
            <option value="">Tous les styles</option>
            {BUILD_TAGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
          {(filterRace || filterClass || filterRole || filterTag) && (
            <button
              onClick={() => {
                setFilterRace("");
                setFilterClass("");
                setFilterRole("");
                setFilterTag("");
              }}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid " + G.border,
                background: "transparent",
                color: G.muted,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "var(--fb)",
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: G.muted }}>
            Chargement des builds...
          </div>
        )}
        {error && <div style={{ textAlign: "center", padding: 40, color: "#ff6b6b" }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16 }}>
              {builds.length === 0
                ? "Aucun build trouvé."
                : "Aucun build ne correspond aux filtres."}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {builds.length === 0
                ? "Sois le premier à partager le tien !"
                : "Essaie d'élargir tes critères."}
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 4 }}>
              {filtered.length} build{filtered.length > 1 ? "s" : ""}
              {filtered.length !== builds.length ? ` sur ${builds.length}` : ""}
            </div>
            {filtered.map((b) => {
              const race = RACES.find((r) => r.id === b.race);
              const cls = CLASSES.find((c) => c.id === b.primaryClass);
              const cls2 = CLASSES.find((c) => c.id === b.secondaryClass);
              const isCopied = copied === b.id;
              const bAugs = (b.augments || [])
                .map((id) => AUGMENTS.find((a) => a.id === id))
                .filter(Boolean);
              const bStats = b.topStats || {};
              const bTags = b.tags || [];
              return (
                <div
                  key={b.id}
                  style={{
                    background: G.card,
                    border: "1px solid " + G.border,
                    borderRadius: "var(--radius-md)",
                    borderLeft: "4px solid " + (cls?.color || G.teal),
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#f0e6d2",
                            fontFamily: "var(--fd)",
                          }}
                        >
                          {b.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: G.border,
                            color: G.muted,
                          }}
                        >
                          par {b.author}
                        </span>
                        <span style={{ fontSize: 10, color: G.muted + "80" }}>
                          {fmtDate(b.createdAt)}
                        </span>
                      </div>
                      {b.description && (
                        <div
                          style={{ fontSize: 13, color: G.muted, marginBottom: 6, lineHeight: 1.5 }}
                        >
                          {b.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {onEditInBuilder && (
                        <button
                          onClick={() => onEditInBuilder(b.code)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid " + G.teal + "40",
                            background: G.teal + "10",
                            color: G.teal,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "var(--fb)",
                          }}
                        >
                          ⚔️ Modifier
                        </button>
                      )}
                      <button
                        onClick={() => copyCode(b.code, b.id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid " + (isCopied ? G.teal : G.border),
                          background: isCopied ? G.teal + "15" : "transparent",
                          color: isCopied ? G.teal : G.muted,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "var(--fb)",
                        }}
                      >
                        {isCopied ? "✓ Copié !" : "📋 Code"}
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      flexWrap: "wrap",
                      marginBottom: bAugs.length > 0 || Object.keys(bStats).length > 0 ? 8 : 0,
                    }}
                  >
                    {race && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: race.color + "15",
                          color: race.color,
                          fontWeight: 700,
                        }}
                      >
                        {race.emoji} {race.name}
                      </span>
                    )}
                    {cls && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: cls.color + "15",
                          color: cls.color,
                          fontWeight: 700,
                        }}
                      >
                        {cls.emoji} {cls.name}
                      </span>
                    )}
                    {cls2 && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: cls2.color + "15",
                          color: cls2.color,
                          fontWeight: 600,
                        }}
                      >
                        + {cls2.name}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: G.border,
                        color: G.muted,
                      }}
                    >
                      Niv.{b.level} P{b.prestige}
                    </span>
                    {bTags.map((tid) => {
                      const tag = BUILD_TAGS.find((t) => t.id === tid);
                      return tag ? (
                        <span
                          key={tid}
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: tag.color + "15",
                            color: tag.color,
                            fontWeight: 700,
                          }}
                        >
                          {tag.icon} {tag.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                  {bAugs.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      {bAugs.map((a) => (
                        <span
                          key={a.id}
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: G.purple + "12",
                            border: "1px solid " + G.purple + "20",
                            color: G.purple,
                            fontWeight: 600,
                          }}
                        >
                          🔮 {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(bStats).length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {Object.entries(bStats).map(([key, val]) => {
                        const st = STATS.find((s) => s.key === key);
                        return st ? (
                          <span
                            key={key}
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: st.color + "10",
                              border: "1px solid " + st.color + "18",
                              color: st.color,
                              fontWeight: 700,
                            }}
                          >
                            {st.icon} {Math.round(val * 100) / 100}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { CommunityPage };
