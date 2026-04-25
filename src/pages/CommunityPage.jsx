// ═══════════════════════════════════════════════════
// COMMUNITY PAGE — Build sharing via Firebase Firestore
// ═══════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { STATS, RACES, CLASSES, AUGMENTS, BUILD_TAGS } from "../data.js";
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

// ═══════════════════════════════════════════════════
// MODS PAGE
// ═══════════════════════════════════════════════════
const MOD_CATEGORIES = [
  { id: "all", label: "Tous", icon: "📦", color: G.gold },
  { id: "combat", label: "Combat & RPG", icon: "⚔️", color: "#e8653a" },
  { id: "craft", label: "Craft & Outils", icon: "🔨", color: "#f5a623" },
  { id: "decoration", label: "Décoration", icon: "🏡", color: "#51cf66" },
  { id: "exploration", label: "Exploration", icon: "🗺️", color: "#4ea8f0" },
  { id: "qol", label: "Quality of Life", icon: "✨", color: "#845ef7" },
];

const MODS_DATA = [
  {
    id: "endgame",
    name: "Endgame & QoL",
    version: "4.1.5",
    authors: ["Lewai", "ReyZ41 (Models/Textures)"],
    category: "combat",
    description:
      "Débloquez le plein potentiel de Hytale ! Nouveaux boss, armures endgame, mécaniques avancées et système de configuration complet.",
    color: "#e8653a",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/endgame-qol",
        icon: "🔗",
      },
      { label: "Wiki", url: "https://wiki.hytalemodding.dev/mod/endgame-qol", icon: "📖" },
    ],
    highlights: [
      { label: "Items", value: "79", color: "#e8653a" },
      { label: "Armes", value: "12", color: "#f5a623" },
      { label: "Armures", value: "4 sets", color: "#4ea8f0" },
      { label: "Donjons", value: "3", color: "#845ef7" },
    ],
    intro: {
      title: "Le mod incontournable du serveur",
      paragraphs: [
        "Endgame & QoL est le pilier central de la progression sur Ciel de Vignis. Ce mod transforme l'expérience de jeu en ajoutant un véritable parcours endgame structuré autour de trois ères successives — Mithril, Onyxium et Prisma — chacune débloquée par la conquête d'un donjon et la défaite de son boss.",
        "La progression est linéaire et exigeante : chaque donjon donne accès à de nouveaux matériaux, un tier supérieur de l'Endgame Bench, et l'équipement nécessaire pour affronter le défi suivant. Les niveaux minimums sont fixés par le mod Endless Leveling, qui assure que chaque étape demande un investissement réel.",
        "Au-delà des donjons, le mod ajoute des staves pour chaque tier de minerai, des gliders, des sacs à dos, des accessoires légendaires et un système de défis Warden. Un contenu massif qui donne enfin un vrai objectif aux joueurs les plus investis.",
      ],
    },
    progression: [
      {
        id: "frozen",
        icon: "❄️",
        label: "Frozen Dungeon",
        color: "#4ea8f0",
        sublabel: "Ère Mithril",
        requires: "Endgame's Bench Tier 2 · Craft Dungeon Key",
        rewards: "Dragon Heart → Bench T3 · Shard of Frozen Summit → Mithril Ore",
        optional: "Korvyn — marchand caché",
      },
      {
        id: "swamp",
        icon: "💎",
        label: "Swamp Dungeon",
        color: "#845ef7",
        sublabel: "Ère Onyxium",
        requires: "2nd Dragon Heart → Bench T4 · Shard of Rotting Sanctum",
        rewards: "Swamp Gem · Swamp Ingot · Hedera Bramble → accès Onyxium",
        optional: null,
      },
      {
        id: "void",
        icon: "🟣",
        label: "Golem Void",
        color: "#c56cf0",
        sublabel: "Ère Prisma",
        requires: "Hedera's Gem → Bench T5 · Shard of the Void",
        rewards: "Prisma Ore · Void Amulet → Prisma Gear complet",
        optional: null,
      },
    ],
    sections: [
      {
        id: "armors",
        label: "Armures",
        icon: "🛡️",
        color: "#4ea8f0",
        items: [
          {
            name: "Set Prisma",
            quality: "Legendary",
            level: "55-65",
            slots: "Head/Chest/Legs/Hands",
            stats: "28% Phys · 15% Fire · 15% Fall · +47 HP · +30 Mana · +10% Signature",
            desc: "Le meilleur set du jeu. Résistances élémentaires complètes et bonus dégâts Signature sur chaque pièce.",
          },
          {
            name: "Set Onyxium",
            quality: "Epic",
            level: "55",
            slots: "Head/Chest/Legs/Hands",
            stats: "22% Phys · 12% Fire · +37 HP · +24 Mana · +8% Signature",
            desc: "Set endgame intermédiaire avec résistance au feu et bonus Signature.",
          },
          {
            name: "Set Mithril",
            quality: "Epic",
            level: "50",
            slots: "Head/Chest/Legs/Hands",
            stats: "18% Phys · +30 HP · +19 Mana · +6% Signature",
            desc: "Amélioration du Mithril EL de base avec Mana et bonus Signature ajoutés.",
          },
          {
            name: "Set Adamantite (amélioré)",
            quality: "Rare",
            level: "40",
            slots: "Head/Chest/Legs/Hands",
            stats: "14.4% Phys · +24 HP · +15 Mana · +6% Light",
            desc: "Bonus Mana et dégâts Light ajoutés par Endgame au set vanilla.",
          },
        ],
      },
      {
        id: "weapons",
        label: "Armes",
        icon: "⚔️",
        color: "#e8653a",
        items: [
          {
            name: "Épée Prisma",
            quality: "Legendary",
            level: "65",
            stats: "SigEnergy +30 · Mana +200 · Stamina +25",
            desc: "Épée endgame ultime avec des bonus massifs de Mana et Stamina.",
          },
          {
            name: "Daggers Prisma",
            quality: "Legendary",
            level: "70",
            stats: "SigEnergy +30 · Mana +200 · Stamina +20 · 9 attaques",
            desc: "Dagues les plus puissantes du jeu. 9 types d'attaques.",
          },
          {
            name: "Frozen Sword",
            quality: "Epic",
            level: "52",
            stats: "SigEnergy +20 · Stamina +15 · 12 attaques",
            desc: "Épée de glace avec dégâts Ice, récompense de donjon.",
          },
          {
            name: "Staves (7 tiers)",
            quality: "Uncommon→Epic",
            level: "10-55",
            stats: "Mana +15 à +60",
            desc: "Cuivre, Iron, Thorium, Cobalt, Adamantite, Mithril, Onyxium. Chaque tier donne plus de Mana.",
          },
        ],
      },
      {
        id: "dungeons",
        label: "Donjons",
        icon: "🏰",
        color: "#845ef7",
        items: [
          {
            name: "Frozen Dungeon",
            quality: "Rare",
            level: "Niv. 10-25",
            slots: "Ère Mithril",
            stats: "Portail craftable · Boss : Dragon Frost (Niv. 30)",
            desc: "Premier donjon endgame. Explorez un labyrinthe glacé peuplé de mobs gelés (Niv. 10-25) avant d'affronter le Dragon Frost au niveau 30 — un dragon de glace qui utilise des attaques de zone AoE et des projectiles de gel. Le donjon utilise un système de tiers adaptatif (Endless Leveling) qui ajuste la difficulté à votre progression.",
            boss: {
              name: "Dragon Frost",
              type: "Dragon · Niv. 30",
              mechanics: "AoE givre · Projectiles de gel · Augment : Blood Surge",
              drops: "Dragon Heart · Shard of Frozen Summit · Frozen Sword",
            },
          },
          {
            name: "Swamp Dungeon",
            quality: "Epic",
            level: "Niv. 30-45",
            slots: "Ère Onyxium",
            stats: "Portail craftable · Boss : Hedera (Niv. 50)",
            desc: "Donjon de difficulté intermédiaire dans un marais empoisonné. Des mobs toxiques (Niv. 30-45) protègent Hedera — une créature végétale ancienne au niveau 50 qui invoque des lianes piégeuses et crache du poison. Le système de tiers adaptatif ajuste la difficulté à votre niveau.",
            boss: {
              name: "Hedera",
              type: "Créature végétale · Niv. 50",
              mechanics: "Lianes piégeuses · Poison AoE · Augment : Rebirth",
              drops: "Swamp Gem · Swamp Ingot · Hedera Bramble · Hedera's Gem",
            },
          },
          {
            name: "Golem Void",
            quality: "Legendary",
            level: "Niv. 50-65",
            slots: "Ère Prisma",
            stats: "Portail craftable · Boss : Golem du Void (Niv. 70)",
            desc: "Le défi ultime du serveur. Un donjon situé dans le Void, peuplé de créatures corrompues (Niv. 50-65). Le Golem du Void au niveau 70 est le boss le plus difficile : attaques dévastatrices, phases multiples et mécaniques de zone. La victoire ouvre l'accès à l'ère Prisma et à l'équipement le plus puissant du jeu.",
            boss: {
              name: "Golem du Void",
              type: "Golem corrompu · Niv. 70",
              mechanics: "Attaques multi-phases · Zones mortelles · Augment : Rebirth",
              drops: "Shard of the Void · Void Amulet · Prisma Ore",
            },
          },
        ],
      },
      {
        id: "gear",
        label: "Équipement",
        icon: "🎒",
        color: "#f5a623",
        items: [
          {
            name: "Gliders (3 tiers)",
            quality: "Rare→Legendary",
            level: "3-10",
            stats: "Endgame Glider réduit conso Stamina",
            desc: "Standard, Advanced, Endgame. Planez à travers Orbis !",
          },
          {
            name: "Backpacks (3 tiers)",
            quality: "Uncommon→Epic",
            level: "97-99",
            stats: "Agrandissement inventaire",
            desc: "3 niveaux de sacs à dos pour augmenter votre inventaire.",
          },
          {
            name: "Warden Challenges (4 tiers)",
            quality: "Uncommon→Legendary",
            level: "—",
            stats: "Défis progressifs",
            desc: "4 niveaux de défis : prouvez votre valeur face aux Wardens.",
          },
          {
            name: "Accessories (7 types)",
            quality: "Legendary",
            level: "—",
            stats: "Blazefist, Frostwalkers, etc.",
            desc: "Accessoires légendaires uniques : Hedera Seed, Ocean Striders, Void Amulet, Pocket Garden, Pouch.",
          },
        ],
      },
      {
        id: "resources",
        label: "Ressources & Craft",
        icon: "⚗️",
        color: "#51cf66",
        items: [
          {
            name: "Minerais",
            quality: "—",
            level: "—",
            stats: "Mithril (Niv.100) · Onyxium (Niv.6)",
            desc: "Deux minerais endgame pour crafter les sets et armes les plus puissants.",
          },
          {
            name: "Potions améliorées",
            quality: "Rare",
            level: "—",
            stats: "Health, Mana, Stamina Large",
            desc: "Versions grande taille des potions de base.",
          },
          {
            name: "Matériaux de donjon",
            quality: "Epic",
            level: "—",
            stats: "Swamp Gem/Ingot · Hedera Bramble/Key/Gem · Dragon Heart",
            desc: "Drops exclusifs des donjons, nécessaires pour l'équipement endgame.",
          },
          {
            name: "Mana Totem",
            quality: "Rare",
            level: "30",
            stats: "Déployable",
            desc: "Totem régénérateur de mana posable au sol.",
          },
        ],
      },
    ],
  },
  {
    id: "endlessleveling",
    name: "Endless Leveling",
    version: "7.3.5",
    authors: ["Lewai"],
    category: "combat",
    description:
      "Système RPG complet : niveaux, attributs, races, classes, augments, prestige et portails (EndlessGate). Le cœur de la progression sur le serveur.",
    color: "#845ef7",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/endless-leveling",
        icon: "🔗",
      },
    ],
    highlights: [
      { label: "Races", value: "12", color: "#3dd8c5" },
      { label: "Classes", value: "14", color: "#e8653a" },
      { label: "Augments", value: "57", color: "#f5a623" },
      { label: "Portails", value: "∞", color: "#c56cf0" },
    ],
    intro: {
      title: "Le système RPG du serveur",
      paragraphs: [
        "Endless Leveling est le moteur RPG qui structure toute la progression de Ciel de Vignis. Le mod ajoute un système de niveaux (cap 100), 10 attributs de compétence qui évoluent à chaque niveau, et un système de prestige infini qui repousse sans cesse les limites.",
        "Chaque joueur choisit une race parmi 12 disponibles et une classe parmi 14, chacune avec son propre arbre d'évolutions (jusqu'à 5 stades par race, 5 par classe). Les augments — 57 au total répartis en 4 tiers (Common, Elite, Legendary, Mythic) — se débloquent progressivement et ajoutent des effets passifs puissants aux combats.",
        "Le mod gère aussi le niveau des mobs dans le monde : un système hybride distance + niveau du joueur adapte la difficulté en permanence. Les donjons ont leurs propres configurations de tiers avec scaling de HP, dégâts et défense, ce qui garantit un challenge constant quelle que soit votre progression.",
        "Endless Leveling dispose également de l'addon EndlessGate, qui ajoute un système de portails instanciés. Ces portails génèrent des donjons avec des boss uniques — Azaroth, Katherina, Baron, le Construct Ancient Dark Titan — chacun équipé d'augments spécifiques et d'un scaling adaptatif. Les portails offrent un contenu rejouable à l'infini, parfait pour farmer l'XP et tester ses builds en conditions extrêmes.",
      ],
    },
    progression: [
      {
        id: "leveling",
        icon: "⭐",
        label: "Leveling (Niv. 1-100)",
        color: "#f5a623",
        sublabel: "Progression de base",
        requires: "Tuer des mobs pour gagner de l'XP",
        rewards:
          "5 skill points/niveau · 10 attributs à monter · Passifs débloqués progressivement",
        optional: "Party XP : 60% partagés dans un rayon de 40 blocs",
      },
      {
        id: "builds",
        icon: "🧬",
        label: "Race + Classe",
        color: "#3dd8c5",
        sublabel: "Personnalisation",
        requires: "Race au Niv. 1 · Classe au Niv. 1 · 1 changement autorisé",
        rewards:
          "12 races × 6 évolutions · 14 classes × 5 évolutions · Classe secondaire disponible",
        optional: null,
      },
      {
        id: "prestige",
        icon: "🔥",
        label: "Prestige (∞)",
        color: "#845ef7",
        sublabel: "Endgame infini",
        requires: "Atteindre le level cap (100 + 10/prestige)",
        rewards: "Nouveaux slots d'augments · Rerolls de tier · +20% XP de base/prestige",
        optional: null,
      },
    ],
    sections: [
      {
        id: "attributes",
        label: "Attributs",
        icon: "📊",
        color: "#845ef7",
        items: [
          {
            name: "Life Force",
            quality: "—",
            level: "Par niveau : +2.5",
            stats: "Santé",
            desc: "Points de vie supplémentaires par niveau. L'attribut le plus vital pour la survie.",
          },
          {
            name: "Strength",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Dégâts physiques",
            desc: "Bonus de dégâts physiques appliqué à chaque attaque de mêlée et à distance.",
          },
          {
            name: "Defense",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Réduction de dégâts",
            desc: "Réduction de dégâts subis. Capée selon la catégorie de classe (40% Mage → 80% Vanguard/Juggernaut).",
          },
          {
            name: "Haste",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Vitesse de déplacement",
            desc: "Augmente la vitesse de déplacement du joueur.",
          },
          {
            name: "Precision",
            quality: "—",
            level: "Par niveau : +0.8",
            stats: "Chance de critique",
            desc: "Probabilité d'infliger un coup critique lors d'une attaque.",
          },
          {
            name: "Ferocity",
            quality: "—",
            level: "Par niveau : +1.2",
            stats: "Dégâts critiques",
            desc: "Multiplicateur de dégâts sur les coups critiques.",
          },
          {
            name: "Stamina",
            quality: "—",
            level: "Par niveau : +0.2",
            stats: "Endurance",
            desc: "Stamina pour les actions comme le sprint, le dodge et le glider.",
          },
          {
            name: "Sorcery",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Dégâts magiques (staves)",
            desc: "Bonus de dégâts magiques, applicable uniquement aux staves.",
          },
          {
            name: "Flow",
            quality: "—",
            level: "Par niveau : +0.5",
            stats: "Mana",
            desc: "Ressource pour les sorts et capacités spéciales.",
          },
          {
            name: "Discipline",
            quality: "—",
            level: "Par niveau : +0.75",
            stats: "Bonus d'XP (%)",
            desc: "Pourcentage de bonus d'expérience gagné par niveau.",
          },
        ],
      },
      {
        id: "passives",
        label: "Passifs",
        icon: "🛡️",
        color: "#3dd8c5",
        items: [
          {
            name: "Stamina Gain Bonus",
            quality: "Common",
            level: "Débloqué Niv. 5",
            stats: "Base +20% · +20%/tier · Max 10 tiers · Intervalle : 5 niv.",
            desc: "Augmente le gain de stamina. Premier passif accessible, progression rapide.",
          },
          {
            name: "Mana Regeneration",
            quality: "Common",
            level: "Débloqué Niv. 10",
            stats: "Base +1.0 · +0.5/tier · Max 10 tiers · Intervalle : 6 niv.",
            desc: "Régénération passive de mana au fil du temps.",
          },
          {
            name: "Signature Gain",
            quality: "Rare",
            level: "Débloqué Niv. 15",
            stats: "Base +40 · +40/tier · Max 10 tiers · Intervalle : 7 niv.",
            desc: "Accélère le gain d'énergie Signature pour votre arme.",
          },
          {
            name: "Regeneration",
            quality: "Rare",
            level: "Débloqué Niv. 20",
            stats: "Base +3.0 · +1.5/tier · Max 10 tiers · Intervalle : 8 niv.",
            desc: "Régénération passive de points de vie. Indispensable en solo.",
          },
          {
            name: "Luck",
            quality: "Epic",
            level: "Débloqué Niv. 20",
            stats: "Base +2.5% · +2.5%/tier · Max 40 tiers · Intervalle : 5 niv.",
            desc: "Augmente les chances de loot rare. Le passif avec le plus de tiers disponibles (40).",
          },
        ],
      },
      {
        id: "races",
        label: "Races",
        icon: "🧬",
        color: "#e8653a",
        items: [
          {
            name: "Human",
            quality: "Common",
            level: "Base",
            stats: "Polyvalent · Equilibré",
            desc: "Race par défaut. Évolue en Explorer ou Raider, puis Voyager/Conqueror/Emperor.",
          },
          {
            name: "Dragonborn",
            quality: "Epic",
            level: "Base",
            stats: "Offensif · Tank",
            desc: "Descendants des dragons. Évolutions : Guardian, Marauder, Sentinel, Alpha, Tyrant.",
          },
          {
            name: "Iceborn",
            quality: "Epic",
            level: "Base",
            stats: "Défensif · Givre",
            desc: "Nés du froid éternel. Évolutions : Guardian, Berzerker, Titan, Frostlord, Ragnarok.",
          },
          {
            name: "Vastaya",
            quality: "Rare",
            level: "Base",
            stats: "Agile · Nature",
            desc: "Créatures mi-animales. Évolutions : Hunter, Mystic, Beastlord, Apex, Spiritbinder.",
          },
          {
            name: "Celestial",
            quality: "Legendary",
            level: "Base",
            stats: "Magique · Support",
            desc: "Êtres célestes. Évolutions : Adept, Catalyst, Arcanum, Overlord, Supreme.",
          },
          {
            name: "Darkin",
            quality: "Legendary",
            level: "Base",
            stats: "Offensif · Vampirique",
            desc: "Corrompus par le Void. Évolutions : Blade, Warlord, Bloodweaver, Bloodlord, Unbound.",
          },
          {
            name: "Voidborn",
            quality: "Epic",
            level: "Base",
            stats: "Chaos · Offensif",
            desc: "Nés du néant. Évolutions : Prowler, Protector, Reaver, Juggernaut, Oblivion.",
          },
          {
            name: "Wraith",
            quality: "Rare",
            level: "Base",
            stats: "Furtif · Assassin",
            desc: "Spectres entre les mondes. Évolutions : Whisper, Fang, Spectral, Reaver, Phantom King.",
          },
          {
            name: "+ 4 autres races",
            quality: "—",
            level: "—",
            stats: "Ascended · Golem · Watcher · Yordle",
            desc: "Chaque race a 6 stades d'évolution avec des attributs et passifs uniques.",
          },
        ],
      },
      {
        id: "classes",
        label: "Classes",
        icon: "⚔️",
        color: "#f5a623",
        items: [
          {
            name: "Assassin",
            quality: "Epic",
            level: "Melee",
            stats: "Dagger/Sword/Bow · Focused Strike · Reset on Kill",
            desc: "Maître de l'ouverture. Dégâts physiques en burst avec un cooldown reset au kill.",
          },
          {
            name: "Battlemage",
            quality: "Epic",
            level: "Hybrid",
            stats: "Staff/Sword · Dégâts hybrides",
            desc: "Mêle magie et mêlée. Defense cap : 65%.",
          },
          {
            name: "Vanguard",
            quality: "Legendary",
            level: "Tank",
            stats: "Sword/Mace · Defense cap 80%",
            desc: "Le tank ultime avec la plus haute réduction de dégâts.",
          },
          {
            name: "Marksman",
            quality: "Rare",
            level: "Ranged",
            stats: "Bow · Dégâts à distance · Defense cap 40%",
            desc: "Spécialiste du combat à distance avec des bonus de précision.",
          },
          {
            name: "Mage",
            quality: "Rare",
            level: "Ranged",
            stats: "Staff · Sorcery · Defense cap 40%",
            desc: "Dégâts magiques purs via les staves. Glass cannon.",
          },
          {
            name: "Necromancer",
            quality: "Legendary",
            level: "Hybrid",
            stats: "Staff/Dagger · Dark magic",
            desc: "Magie noire et invocations. Mélange offense et survie.",
          },
          {
            name: "Slayer",
            quality: "Epic",
            level: "Melee",
            stats: "Sword/Axe · Burst damage",
            desc: "Spécialiste du burst offensif en mêlée.",
          },
          {
            name: "+ 7 autres classes",
            quality: "—",
            level: "—",
            stats: "Adventurer · Arcanist · Brawler · Duelist · Juggernaut · Magistrate · Priest",
            desc: "Chaque classe a 5 évolutions (Elite, Master, Exalted, Legendary) avec des passifs uniques. Classe secondaire disponible (-40% dégâts hors catégorie d'arme).",
          },
        ],
      },
      {
        id: "augments",
        label: "Augments",
        icon: "💎",
        color: "#c56cf0",
        items: [
          {
            name: "Tier Common (débloqué Niv. 5+)",
            quality: "Common",
            level: "Niv. 5, 10, 15, 35, 45 + */10",
            stats: "Passifs de base",
            desc: "Augments fondamentaux : Burn, Drain, Fleet Footwork, Overheal, Vampirism, Wither...",
          },
          {
            name: "Tier Elite (débloqué Niv. 15)",
            quality: "Rare",
            level: "Niv. 15 · Prestige 1, 4, 7, 10",
            stats: "Passifs avancés",
            desc: "Blood Frenzy, Conqueror, Executioner, First Strike, Phase Rush, Predator, Reckoning...",
          },
          {
            name: "Tier Legendary (débloqué Niv. 30)",
            quality: "Epic",
            level: "Niv. 30 · Prestige 10",
            stats: "Passifs puissants",
            desc: "Arcane Mastery, Blood Surge, Giant Slayer, Glass Cannon, Goliath, Rebirth, Undying Rage...",
          },
          {
            name: "Tier Mythic (débloqué Niv. 50)",
            quality: "Legendary",
            level: "Niv. 50 · Prestige 15",
            stats: "Passifs ultimes",
            desc: "Les augments les plus rares. Débloqués au prestige 15, ils transforment radicalement votre build.",
          },
        ],
      },
      {
        id: "mobleveling",
        label: "Mob Leveling",
        icon: "🎯",
        color: "#4ea8f0",
        items: [
          {
            name: "Mode Overworld (MIXED)",
            quality: "—",
            level: "Monde ouvert",
            stats: "30% joueur + 70% distance · 40 blocs/niveau depuis le spawn",
            desc: "Les mobs s'adaptent : plus vous êtes loin du spawn, plus ils sont forts. Votre niveau influence aussi (30%). Range d'XP : ±15 niveaux de différence.",
          },
          {
            name: "Mode Donjon (TIERED)",
            quality: "—",
            level: "Instances",
            stats: "Tiers adaptatifs · 20 niveaux/tier · Scaling HP/DMG/DEF",
            desc: "Chaque donjon a un niveau de base fixe et des tiers infinis. Le scaling monte les HP (×3.0 base), les dégâts (×1.25 base) et la défense des mobs progressivement.",
          },
          {
            name: "Nameplates",
            quality: "—",
            level: "Visuel",
            stats: "Niveau + Nom + HP affichés",
            desc: "Chaque mob affiche son niveau, son nom et sa barre de vie. Mise à jour en temps réel (1 tick).",
          },
          {
            name: "XP Scaling",
            quality: "—",
            level: "Récompenses",
            stats: "Linéaire · ×0.8 global · Min 50 XP",
            desc: "L'XP scale linéairement. Bonus ×3 au max level. Mobs trop faibles ou trop forts : seulement 5% de l'XP. Minimum garanti : 50 XP.",
          },
        ],
      },
      {
        id: "endlessgate",
        label: "EndlessGate",
        icon: "🌀",
        color: "#c56cf0",
        items: [
          {
            name: "Portails instanciés",
            quality: "—",
            level: "Addon",
            stats: "Donjons générés · Rejouable à l'infini",
            desc: "EndlessGate est l'addon officiel d'Endless Leveling qui ajoute un système de portails. Chaque portail ouvre une instance de donjon avec des mobs et boss configurés spécifiquement. Le scaling suit le même système de tiers adaptatif qu'Endless Leveling : HP (×3.0 base), dégâts (×1.25 base) et défense progressifs.",
          },
          {
            name: "Azaroth",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Rebirth · Frozen Domain",
            desc: "Boss majeur des portails. Combinaison mortelle de résurrection (Rebirth) et de contrôle de zone glacé (Frozen Domain). Niveau = max du range +10.",
            boss: {
              name: "Azaroth",
              type: "Boss de portail",
              mechanics: "Rebirth · Frozen Domain · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Katherina",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Bloodthirster · Vampirism",
            desc: "Boss vampirique qui se soigne en infligeant des dégâts. Bloodthirster et Vampirism la rendent extrêmement résiliente — il faut un burst massif pour la finir.",
            boss: {
              name: "Katherina",
              type: "Boss de portail",
              mechanics: "Bloodthirster · Vampirism · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Baron",
            quality: "Legendary",
            level: "Boss",
            stats: "Augments : Blood Surge · Bloodthirster",
            desc: "Boss offensif avec Blood Surge (dégâts augmentés) et Bloodthirster (vol de vie). Un adversaire agressif qui punit les builds trop défensifs.",
            boss: {
              name: "Baron",
              type: "Boss de portail",
              mechanics: "Blood Surge · Bloodthirster · Random augments",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Construct Ancient Dark Titan",
            quality: "Epic",
            level: "Boss",
            stats: "Scaling défensif réduit",
            desc: "Titan mécanique ancien. Moins de defense scaling que les autres boss mais toujours redoutable par son pool de HP et ses dégâts bruts.",
            boss: {
              name: "Construct Ancient Dark Titan",
              type: "Boss de portail",
              mechanics: "Tank massif · Dégâts bruts",
              drops: "XP endgame · Loot de portail",
            },
          },
          {
            name: "Cult Knights & Werewolves",
            quality: "Rare",
            level: "Mini-boss",
            stats: "Augments (mini-boss) : Blood Surge · Blood Frenzy · Vampirism",
            desc: "Mobs élites des portails. Les versions mini-boss ont 3 augments simultanés et un scaling de dégâts renforcé. Apparaissent en groupes.",
          },
        ],
      },
    ],
  },
  {
    id: "arcanerelay",
    name: "Arcane Relay",
    version: "1.1.1",
    authors: ["PseudoAle", "Fanzy"],
    category: "craft",
    description:
      "Système d'automatisation magique et de logique pour Hytale. Activez des mécanismes à distance, déplacez des blocs et créez des circuits.",
    color: "#51cf66",
    links: [
      {
        label: "CurseForge",
        url: "https://www.curseforge.com/hytale/mods/arcane-relay",
        icon: "🔗",
      },
    ],
    highlights: [
      { label: "Blocs", value: "8", color: "#51cf66" },
      { label: "Actions", value: "15", color: "#f5a623" },
      { label: "Bench", value: "1", color: "#845ef7" },
      { label: "DL", value: "2.1K", color: "#4ea8f0" },
    ],
    intro: {
      title: "L'automatisation magique sur Orbis",
      paragraphs: [
        "Arcane Relay est un mod d'automatisation et de logique qui permet de construire de véritables machines dans Hytale. Développé par Pseudo_Elephant (PseudoAle & Fanzy), il est l'un des mods les plus populaires sur CurseForge avec plus de 2 100 téléchargements et 65 commentaires.",
        "Le concept est simple : des blocs arcaniques — Relays, Buttons, Pushers, Pullers — peuvent être connectés entre eux grâce à un Arcane Staff. Chaque bloc envoyeur peut déclencher à distance des actions sur d'autres blocs : ouvrir des portes, allumer des torches, déplacer des blocs, envoyer des signaux en chaîne. Le tout sans fil, par magie.",
        "L'Arcane Bench, craftable au Workbench Tier 2 (10 Thorium Bars + 30 Linen + 20 Void Essence), offre trois catégories de craft : Portails, Artefacts et Divers. Avec un système de Toggle Relay qui peut bloquer ou relayer un signal, et un Discharge qui accumule des signaux avant de les relâcher, les joueurs créatifs peuvent construire des systèmes complexes : ascenseurs, bases secrètes, cryptes qui s'illuminent, portes automatiques et bien plus.",
      ],
    },
    sections: [
      {
        id: "blocks",
        label: "Blocs",
        icon: "🧱",
        color: "#51cf66",
        items: [
          {
            name: "Arcane Relay",
            quality: "Rare",
            level: "Bloc",
            stats: "Envoyeur de signal",
            desc: "Le bloc de base. Relaie un signal vers ses sorties connectées. Interagissez pour envoyer manuellement un signal.",
          },
          {
            name: "Toggle Relay",
            quality: "Rare",
            level: "Bloc",
            stats: "Relais conditionnel · On/Off",
            desc: "Bloque ou relaie le signal selon son état. Chaque signal reçu bascule l'état. Interagissez pour changer l'état de départ.",
          },
          {
            name: "Button",
            quality: "Common",
            level: "Bloc",
            stats: "Déclencheur",
            desc: "Bouton qui envoie un signal à distance vers les blocs connectés. Le déclencheur le plus simple du système.",
          },
          {
            name: "Pusher",
            quality: "Rare",
            level: "Bloc",
            stats: "Déplacement de blocs",
            desc: "Pousse les blocs dans la direction où il fait face. Peut être déclenché à distance par un signal. Variante murale disponible pour pousser verticalement.",
          },
          {
            name: "Puller",
            quality: "Rare",
            level: "Bloc",
            stats: "Attraction de blocs",
            desc: "Tire un bloc distant vers lui. S'étend pour atteindre la cible, puis la ramène au signal suivant. Utilise des Puller Extensions.",
          },
          {
            name: "Discharge",
            quality: "Epic",
            level: "Bloc",
            stats: "Accumulateur de signaux",
            desc: "Stocke les signaux reçus avant de les relayer une fois chargé. Interagissez pour régler le nombre de signaux nécessaires. Parfait pour créer des minuteries et séquences.",
          },
        ],
      },
      {
        id: "tools",
        label: "Outils",
        icon: "🔧",
        color: "#f5a623",
        items: [
          {
            name: "Arcane Staff",
            quality: "Rare",
            level: "Outil",
            stats: "Configuration des connexions",
            desc: "L'outil indispensable pour configurer les connexions arcaniques. Clic droit : sélectionner un bloc source. Clic gauche : ajouter/retirer une destination. Accroupi + interaction : voir les connexions d'un bloc.",
          },
          {
            name: "Arcane Bench",
            quality: "Epic",
            level: "Bench",
            stats: "10 Thorium Bars · 30 Linen · 20 Void Essence",
            desc: "Établi de craft pour tous les blocs et outils arcaniques. Craftable au Workbench Tier 2. Trois catégories : Portails, Artefacts et Divers.",
          },
          {
            name: "Crystal Cyan",
            quality: "Common",
            level: "Ingrédient",
            stats: "Ressource de craft",
            desc: "Cristal cyan utilisé comme composant dans les recettes arcaniques.",
          },
        ],
      },
      {
        id: "activations",
        label: "Interactions",
        icon: "⚡",
        color: "#4ea8f0",
        items: [
          {
            name: "Toggle Door / Gate",
            quality: "—",
            level: "Action",
            stats: "Porte · Porte horizontale · Grille",
            desc: "Ouvrez et fermez des portes et grilles à distance. Trois variantes : porte standard, porte horizontale et grille.",
          },
          {
            name: "Toggle Torch",
            quality: "—",
            level: "Action",
            stats: "Torche · Torche brute",
            desc: "Allumez et éteignez des torches à distance. Idéal pour les cryptes et les éclairages automatiques.",
          },
          {
            name: "Move Block",
            quality: "—",
            level: "Action",
            stats: "Déplacement haut/bas",
            desc: "Déplace un bloc vers le haut ou le bas. Base pour construire des ascenseurs et plateformes mobiles.",
          },
          {
            name: "Push / Pull Chain",
            quality: "—",
            level: "Action",
            stats: "Chaîne de Pusher · Chaîne de Puller",
            desc: "Les Pushers et Pullers peuvent fonctionner en chaîne, poussant ou tirant plusieurs blocs à la suite.",
          },
          {
            name: "Send Signal",
            quality: "—",
            level: "Action",
            stats: "Propagation",
            desc: "Envoie un signal d'un bloc arcanique à un autre. La brique élémentaire de tout circuit logique.",
          },
        ],
      },
    ],
  },
];

export { CommunityPage };
