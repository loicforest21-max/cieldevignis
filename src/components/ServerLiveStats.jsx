// ═══════════════════════════════════════════════════
// SERVER LIVE STATS — Real-time server status via Vercel proxy
// ═══════════════════════════════════════════════════
// Pulls /api/server-status (our Vercel serverless function) which
// proxies voxl.gg server-side — voxl.gg doesn't expose CORS headers
// so we can't fetch them directly from the browser.
//
// The proxy whitelists fields and caches responses 30s at the edge.
//
// Online/offline status is derived from the lastSeenAt timestamp.
// voxl.gg currently doesn't expose live playerCount via REST — it lives
// only on the WebSocket SignalR hub, which would require auth + a much
// more complex client. If voxl.gg adds playerCount to the REST response
// later, just read it from `data.playerCount` in the render block.
// ═══════════════════════════════════════════════════
import { useEffect, useState, useRef } from "react";

const STATUS_API_URL = "/api/server-status";
const REFRESH_INTERVAL_MS = 60_000; // 60 seconds
const ONLINE_THRESHOLD_MS = 2 * 60_000; // server is "online" if lastSeen < 2 minutes ago

// ─── Format a timestamp as a relative french string ───
function formatRelativeTime(date) {
  if (!date) return null;
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return "à l'instant";
  if (sec < 60) return `il y a ${sec} s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const day = Math.floor(hr / 24);
  return `il y a ${day} j`;
}

function ServerLiveStats({ variant = "default", style = {} }) {
  const [data, setData] = useState(null); // { name, lastSeenAt, lastPluginVersion, ... } or null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // "cors" | "network" | "404" | null
  // Tick state forces re-render every 10s so the relative time updates
  const [, setTick] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(STATUS_API_URL, {
          headers: { Accept: "application/json" },
        });
        if (!mountedRef.current) return;
        if (!res.ok) {
          setError(res.status === 404 ? "404" : "network");
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!mountedRef.current) return;
        setData(json);
        setError(null);
        setLoading(false);
      } catch (e) {
        if (!mountedRef.current) return;
        // Likely a CORS error or network outage
        const isCors = e instanceof TypeError;
        setError(isCors ? "cors" : "network");
        setLoading(false);
      }
    };

    fetchStats();
    const refreshTimer = setInterval(fetchStats, REFRESH_INTERVAL_MS);
    // Force re-render every 10s to keep the relative time fresh
    const tickTimer = setInterval(() => setTick((t) => t + 1), 10_000);

    return () => {
      mountedRef.current = false;
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, []);

  // Derive online status from lastSeenAt
  const lastSeenDate = data?.lastSeenAt ? new Date(data.lastSeenAt) : null;
  const isOnline = lastSeenDate
    ? Date.now() - lastSeenDate.getTime() < ONLINE_THRESHOLD_MS
    : false;
  const relativeTime = lastSeenDate ? formatRelativeTime(lastSeenDate) : null;

  // ─── COMPACT VARIANT (e.g. for Join page) ───
  if (variant === "compact") {
    return (
      <CompactPill
        loading={loading}
        error={error}
        isOnline={isOnline}
        relativeTime={relativeTime}
        style={style}
      />
    );
  }

  // ─── DEFAULT VARIANT (e.g. for HomePage) ───
  return (
    <DefaultCard
      loading={loading}
      error={error}
      data={data}
      isOnline={isOnline}
      relativeTime={relativeTime}
      style={style}
    />
  );
}

// ───────────────────────────────────────────────────
// Compact pill: just a status indicator, used inline
// ───────────────────────────────────────────────────
function CompactPill({ loading, error, isOnline, relativeTime, style }) {
  if (loading) {
    return (
      <span style={{ ...pillBaseStyle, ...neutralPillStyle, ...style }} role="status">
        <Dot color="#a89075" pulse />
        <span style={pillLabelStyle}>VÉRIFICATION DU PORTAIL...</span>
      </span>
    );
  }

  if (error) {
    // On error, fall back to a neutral "open" status instead of misleading users
    return (
      <span style={{ ...pillBaseStyle, ...neutralPillStyle, ...style }} role="status">
        <Dot color="#a89075" />
        <span style={pillLabelStyle}>SERVEUR · OUVERT À TOUS</span>
      </span>
    );
  }

  if (isOnline) {
    return (
      <span
        style={{ ...pillBaseStyle, ...onlinePillStyle, ...style }}
        role="status"
        aria-label={`Serveur en ligne, dernière activité ${relativeTime}`}
      >
        <Dot color="#2ed573" pulse glow />
        <span style={pillLabelStyle}>SERVEUR EN LIGNE · OUVERT À TOUS</span>
      </span>
    );
  }

  // Offline
  return (
    <span style={{ ...pillBaseStyle, ...offlinePillStyle, ...style }} role="status">
      <Dot color="#e8653a" />
      <span style={{ ...pillLabelStyle, color: "#e8653a" }}>
        HORS LIGNE · {relativeTime}
      </span>
    </span>
  );
}

// ───────────────────────────────────────────────────
// Default card: more verbose, used on HomePage
// ───────────────────────────────────────────────────
function DefaultCard({ loading, error, data, isOnline, relativeTime, style }) {
  // Loading skeleton
  if (loading) {
    return (
      <div style={{ ...cardBaseStyle, ...style }} aria-busy="true">
        <div style={cardLeftStyle}>
          <Dot color="#a89075" size={14} pulse />
          <div>
            <div style={{ ...cardStatusStyle, color: "#a89075" }}>Vérification...</div>
            <div style={cardSubStyle}>Connexion au portail voxl.gg</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state — show the server is reachable but stats unavailable
  if (error) {
    return (
      <div style={{ ...cardBaseStyle, ...style }} role="status">
        <div style={cardLeftStyle}>
          <Dot color="#a89075" size={14} />
          <div>
            <div style={{ ...cardStatusStyle, color: "#c9b892" }}>Serveur · Ouvert à tous</div>
            <div style={cardSubStyle}>Statut live indisponible pour le moment</div>
          </div>
        </div>
      </div>
    );
  }

  // Online state
  if (isOnline) {
    return (
      <div
        style={{
          ...cardBaseStyle,
          background: "rgba(46,213,115,0.06)",
          borderColor: "rgba(46,213,115,0.3)",
          ...style,
        }}
        role="status"
        aria-label="Serveur en ligne"
      >
        <div style={cardLeftStyle}>
          <Dot color="#2ed573" size={14} pulse glow />
          <div>
            <div style={{ ...cardStatusStyle, color: "#2ed573" }}>Serveur en ligne</div>
            <div style={cardSubStyle}>
              {data?.name && <span style={{ color: "#c9b892" }}>{data.name}</span>}
              {data?.name && " · "}
              Dernière activité {relativeTime}
            </div>
          </div>
        </div>
        {data?.lastPluginVersion && (
          <div style={cardRightStyle} aria-hidden="true">
            voxl v{data.lastPluginVersion}
          </div>
        )}
      </div>
    );
  }

  // Offline state
  return (
    <div
      style={{
        ...cardBaseStyle,
        background: "rgba(232,101,58,0.06)",
        borderColor: "rgba(232,101,58,0.3)",
        ...style,
      }}
      role="status"
    >
      <div style={cardLeftStyle}>
        <Dot color="#e8653a" size={14} />
        <div>
          <div style={{ ...cardStatusStyle, color: "#e8653a" }}>Serveur hors ligne</div>
          <div style={cardSubStyle}>
            {data?.name && <span style={{ color: "#c9b892" }}>{data.name}</span>}
            {data?.name && " · "}
            Dernière activité {relativeTime}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────
// Shared dot component (status indicator)
// ───────────────────────────────────────────────────
function Dot({ color, size = 8, pulse = false, glow = false }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: color,
        borderRadius: "50%",
        boxShadow: glow ? `0 0 10px ${color}` : "none",
        animation: pulse ? "serverDotPulse 2s ease-in-out infinite" : "none",
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Shared styles ───
const pillBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 18px",
  borderRadius: 30,
  fontFamily: "var(--fd)",
  fontSize: 12,
  letterSpacing: "0.5px",
  fontWeight: 600,
};
const onlinePillStyle = {
  background: "rgba(46,213,115,0.1)",
  border: "1px solid rgba(46,213,115,0.4)",
  color: "#2ed573",
};
const neutralPillStyle = {
  background: "rgba(168,144,117,0.08)",
  border: "1px solid rgba(168,144,117,0.3)",
  color: "#c9b892",
};
const offlinePillStyle = {
  background: "rgba(232,101,58,0.08)",
  border: "1px solid rgba(232,101,58,0.3)",
  color: "#e8653a",
};
const pillLabelStyle = { letterSpacing: "0.5px" };

const cardBaseStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 18px",
  background: "rgba(168,144,117,0.06)",
  border: "1px solid rgba(168,144,117,0.25)",
  borderRadius: 8,
  transition: "all 0.4s",
};
const cardLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
  minWidth: 0,
};
const cardStatusStyle = {
  fontFamily: "var(--fd)",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: 2,
};
const cardSubStyle = {
  fontFamily: "var(--fd)",
  fontStyle: "italic",
  fontSize: 11.5,
  color: "#8a8070",
  letterSpacing: "0.05em",
};
const cardRightStyle = {
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: 10,
  color: "#6a5a45",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

// Inject keyframes once
function ServerLiveStatsStyles() {
  return (
    <style>
      {`@keyframes serverDotPulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.45; }
      }`}
    </style>
  );
}

export { ServerLiveStats, ServerLiveStatsStyles };
