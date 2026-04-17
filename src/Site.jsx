// ═══════════════════════════════════════════════════
// SITE — Landing page, navigation, wiki, map, dungeons, community
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef, useMemo } from "react";
import {
  STATS, RACES, CLASSES, AUGMENTS, RACE_PREVIEWS, CLASS_PREVIEWS,
  WIKI_ITEMS, WIKI_MOBS, WIKI_RECIPES, ITEM_CATS, QUALITY_COLORS, MOB_CATS, SALVAGE_CATS,
  DUNGEONS, DUNGEON_TIERS, ROLE_META, BUILD_TAGS,
} from './data.js';
import { G } from './styles.jsx';
import { decodeBuild, computeFullStats, getActiveRace } from './engine.js';
import { publishBuild, fetchBuilds } from './firebase.js';
import { BuildCreator } from './BuildCreator.jsx';

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
    const COLORS = ["#e8a537", "#f0c06a", "#c8882a", "#e8a537", "#3dd8c5"];
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.25 - 0.05,
      size: Math.random() * 3 + 1.5,
      o: Math.random() * 0.3 + 0.05,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.3 + 0.1,
    }));
    let raf, t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        const pulse = 0.5 + Math.sin(t * 2 + p.phase) * 0.4;
        ctx.globalAlpha = p.o * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
        // Glow
        ctx.globalAlpha = p.o * pulse * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
        p.x += p.vx + Math.sin(t + p.phase) * p.drift * 0.3;
        p.y += p.vy;
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "home", label: "Accueil", icon: "🏠" },
    { id: "builds", label: "Build Creator", icon: "⚔️" },
    { id: "community", label: "Communauté", icon: "🌍" },
    { id: "dungeons", label: "Donjons", icon: "🏰" },
    { id: "wiki", label: "Wiki", icon: "📖" },
    { id: "mods", label: "Mods", icon: "🧩" },
    { id: "map", label: "Carte", icon: "🗺️" },
    { id: "discord", label: "Discord", icon: "💬" },
  ];
  const go = (id) => { if (id === "discord") window.open("https://discord.gg/7YmTATJcf", "_blank"); else setPage(id); setMenuOpen(false); };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || menuOpen ? `${G.bg}f0` : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(20px) saturate(1.4)" : "none",
      borderBottom: scrolled ? `1px solid ${G.gold}15` : "none",
      transition: "all 0.4s ease", padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: G.bg, fontFamily: "var(--fd)",
            boxShadow: `0 0 16px ${G.gold}25`,
          }}>C</div>
          <span className="nav-title" style={{
            fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", letterSpacing: 1,
            color: "#f5f0e8",
          }}>CielDeVignis</span>
        </div>
        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 3 }}>
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`nav-link${page === l.id ? " active" : ""}`}
            >
              <span style={{ fontSize: 15 }}>{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
        {/* Mobile hamburger */}
        <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "none", border: "none", color: G.teal, fontSize: 24, cursor: "pointer", padding: 8,
        }}>{menuOpen ? "✕" : "☰"}</button>
      </div>
      {/* Mobile menu */}
      {menuOpen && <div className="nav-mobile-menu" style={{
        display: "none", flexDirection: "column", gap: 2, padding: "8px 0 16px",
        borderTop: `1px solid ${G.gold}20`, animation: "fadeSlideUp 0.2s ease",
      }}>
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => go(l.id)}
            className={`nav-link${page === l.id ? " active" : ""}`}
            style={{ width: "100%", textAlign: "left", fontSize: 15, gap: 10 }}
          >
            <span style={{ fontSize: 18 }}>{l.icon}</span>{l.label}
          </button>
        ))}
      </div>}
    </nav>
  );
}

// ═══════════════════════════════════════════
// FEATURE CARD
// ═══════════════════════════════════════════
function FeatureCard({ icon, title, desc, color, delay, onClick }) {
  return (
    <div onClick={onClick} className="feature-card" style={{
      background: `linear-gradient(165deg, ${G.card}, ${color}08)`,
      border: `1px solid ${G.border}`, borderRadius: 10, padding: 0,
      cursor: onClick ? "pointer" : "default",
      animation: `fadeSlideUp 0.6s ease ${delay}s both`,
      position: "relative", overflow: "hidden",
    }}
    >
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}40)` }} />
      {/* Corner glow */}
      <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, background: `radial-gradient(circle, ${color}10, transparent)`, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ padding: "22px 20px", position: "relative" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: color, fontFamily: "var(--fd)", letterSpacing: 0.5 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: G.muted, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RACE PREVIEW CARD
// ═══════════════════════════════════════════
function RacePreview({ race, delay }) {
  return (
    <div className="race-preview" style={{
      background: `linear-gradient(165deg, ${G.card}, ${race.color}08)`,
      border: `1px solid ${race.color}20`, borderRadius: "var(--radius-md)", padding: "18px 22px",
      textAlign: "center", minWidth: 124, flex: "0 0 auto",
      animation: `fadeSlideUp 0.5s ease ${delay}s both`,
      borderLeft: `3px solid ${race.color}50`,
    }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${race.color}04 1px, transparent 1px), linear-gradient(90deg, ${race.color}04 1px, transparent 1px)`, backgroundSize: "12px 12px", pointerEvents: "none" }} />
      <div style={{ fontSize: 36, marginBottom: 8, position: "relative", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>{race.emoji}</div>
      <div style={{ fontSize: "var(--text-md)", fontWeight: "var(--fw-black)", color: race.color, fontFamily: "var(--fd)", letterSpacing: 0.5, position: "relative" }}>{race.name}</div>
      <div style={{ fontSize: "var(--text-xs)", color: G.muted, marginTop: 4, position: "relative" }}>{race.passives.length} passifs</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// STAT ICON ROW
// ═══════════════════════════════════════════
function StatRow() {
  const stats = [
    { icon: "❤️", name: "Vitalité", color: "#ff6b6b" },
    { icon: "⚔️", name: "Force", color: "#ff9f43" },
    { icon: "✨", name: "Sorcellerie", color: "#a55eea" },
    { icon: "🛡️", name: "Défense", color: "#54a0ff" },
    { icon: "💨", name: "Hâte", color: "#a29bfe" },
    { icon: "🎯", name: "Précision", color: "#f368e0" },
    { icon: "🔥", name: "Férocité", color: "#ff6348" },
    { icon: "🏃", name: "Endurance", color: "#2ed573" },
    { icon: "💎", name: "Flow", color: "#45aaf2" },
    { icon: "📖", name: "Discipline", color: "#fed330" },
  ];
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", animation: "fadeSlideUp 0.6s ease 0.8s both" }}>
      {stats.map(s => (
        <div key={s.name} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
          background: `${s.color}08`, border: `1px solid ${s.color}18`, borderRadius: 4,
          borderLeft: `3px solid ${s.color}50`, position: "relative", overflow: "hidden",
        }}>
          <span style={{ fontSize: 14 }}>{s.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: "var(--fd)" }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function HomePage({ setPage }) {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const px = (factor) => `translateY(${scrollY * factor}px)`;
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* HERO — Epic dragon landscape */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Sky gradient — magical night (Direction C) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0a0812 0%, #0f0a1a 10%, #1a1228 22%, #2a1a34 34%, #3a2240 46%, #3a3048 56%, #2a2238 68%, #1a1428 82%, #0e0a14 94%, #12100c 100%)" }} />
        
        {/* Mystical moonlit glow (replaces sun) */}
        <div style={{ position: "absolute", top: "18%", left: "50%", transform: `translateX(-50%) ${px(-0.15)}`, width: 380, height: 200, background: "radial-gradient(ellipse, #c9a5ff30, #a878ff1a, #3dd8c510, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: `translateX(-50%) ${px(-0.12)}`, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, #f0e6d228, #c9a5ff20, transparent 70%)", boxShadow: "0 0 60px #a878ff20", pointerEvents: "none" }} />

        {/* Arcane rays */}
        <div style={{ position: "absolute", top: "15%", left: "46%", width: 3, height: 140, background: "linear-gradient(180deg, #a878ff1a, transparent)", transform: "rotate(-6deg)", transformOrigin: "top", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "18%", left: "54%", width: 2, height: 120, background: "linear-gradient(180deg, #3dd8c518, transparent)", transform: "rotate(5deg)", transformOrigin: "top", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "16%", left: "50%", width: 2, height: 130, background: "linear-gradient(180deg, #c9a5ff14, transparent)", transform: "rotate(-1deg)", transformOrigin: "top", pointerEvents: "none" }} />

        {/* Clouds */}
        <div style={{ position: "absolute", top: "6%", left: "5%", width: 300, height: 50, background: "radial-gradient(ellipse, #1a1a2820, transparent)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "3%", right: "10%", width: 250, height: 45, background: "radial-gradient(ellipse, #2a203818, transparent)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* ═══ MAGIC — AURORA LAYERS ═══ */}
        <div style={{ position: "absolute", top: "5%", left: "-10%", right: "-10%", height: 200, pointerEvents: "none",
          opacity: 0.4, filter: "blur(20px)",
          background: "linear-gradient(90deg, transparent, #e8a53766, transparent)",
          animation: "cdvAurora 12s ease-in-out infinite", transform: px(-0.06) }} />
        <div style={{ position: "absolute", top: "12%", left: "-10%", right: "-10%", height: 200, pointerEvents: "none",
          opacity: 0.4, filter: "blur(20px)",
          background: "linear-gradient(90deg, transparent, #3dd8c54d, transparent)",
          animation: "cdvAurora 16s ease-in-out infinite 2s", transform: px(-0.05) }} />
        <div style={{ position: "absolute", top: "8%", left: "-10%", right: "-10%", height: 200, pointerEvents: "none",
          opacity: 0.4, filter: "blur(20px)",
          background: "linear-gradient(90deg, transparent, #a878ff4d, transparent)",
          animation: "cdvAurora 14s ease-in-out infinite 4s", transform: px(-0.06) }} />

        {/* ═══ MAGIC — TWINKLING STARS (mystic color mix) ═══ */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", pointerEvents: "none", transform: px(-0.03) }}>
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <g fill="#f0c06a">
              <circle cx="85" cy="22" r="0.9" className="cdv-star" style={{ animationDelay: "0s" }}/>
              <circle cx="178" cy="52" r="0.8" className="cdv-star" style={{ animationDelay: "1s" }}/>
              <circle cx="278" cy="16" r="1" className="cdv-star" style={{ animationDelay: "2s" }}/>
              <circle cx="378" cy="72" r="0.8" className="cdv-star" style={{ animationDelay: "0.6s" }}/>
              <circle cx="720" cy="38" r="0.9" className="cdv-star" style={{ animationDelay: "1.5s" }}/>
              <circle cx="818" cy="62" r="0.7" className="cdv-star" style={{ animationDelay: "2.2s" }}/>
              <circle cx="918" cy="26" r="1" className="cdv-star" style={{ animationDelay: "0.8s" }}/>
              <circle cx="128" cy="96" r="0.7" className="cdv-star" style={{ animationDelay: "2.8s" }}/>
              <circle cx="868" cy="112" r="0.8" className="cdv-star" style={{ animationDelay: "1.9s" }}/>
              <circle cx="475" cy="144" r="0.7" className="cdv-star" style={{ animationDelay: "3.1s" }}/>
            </g>
            <g fill="#c9a5ff">
              <circle cx="220" cy="88" r="0.9" className="cdv-star" style={{ animationDelay: "0.4s" }}/>
              <circle cx="600" cy="22" r="1" className="cdv-star" style={{ animationDelay: "1.7s" }}/>
              <circle cx="760" cy="96" r="0.8" className="cdv-star" style={{ animationDelay: "2.5s" }}/>
              <circle cx="480" cy="56" r="0.9" className="cdv-star" style={{ animationDelay: "0.2s" }}/>
              <circle cx="340" cy="120" r="0.7" className="cdv-star" style={{ animationDelay: "2.9s" }}/>
            </g>
            <g fill="#a5eedd">
              <circle cx="320" cy="140" r="0.8" className="cdv-star" style={{ animationDelay: "1.3s" }}/>
              <circle cx="680" cy="142" r="0.9" className="cdv-star" style={{ animationDelay: "0.7s" }}/>
              <circle cx="560" cy="168" r="0.7" className="cdv-star" style={{ animationDelay: "2.4s" }}/>
            </g>
          </svg>
        </div>

        {/* ═══ MAGIC — ARCANE PORTAL (background) ═══ */}
        <div style={{ position: "absolute", top: "28%", left: "50%", transform: `translateX(-50%) ${px(-0.08)}`, width: 260, height: 200, pointerEvents: "none", opacity: 0.6 }}>
          <svg viewBox="0 0 260 200" style={{ width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="cdvPortalGrad">
                <stop offset="0%" stopColor="#f0c06a" stopOpacity="0.65"/>
                <stop offset="40%" stopColor="#c9a5ff" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#3dd8c5" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <g className="cdv-portal-outer">
              <circle cx="130" cy="100" r="90" fill="none" stroke="#e8a537" strokeWidth="0.6" strokeDasharray="4 5" opacity="0.6"/>
              <circle cx="130" cy="100" r="82" fill="none" stroke="#c9a5ff" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.5"/>
              <circle cx="130" cy="10" r="2" fill="#f0c06a" opacity="0.7"/>
              <circle cx="220" cy="100" r="2" fill="#f0c06a" opacity="0.7"/>
              <circle cx="130" cy="190" r="2" fill="#f0c06a" opacity="0.7"/>
              <circle cx="40" cy="100" r="2" fill="#f0c06a" opacity="0.7"/>
            </g>
            <g className="cdv-portal-inner">
              <circle cx="130" cy="100" r="62" fill="none" stroke="#3dd8c5" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.4"/>
              <text x="130" y="42" textAnchor="middle" fontFamily="var(--fd), serif" fontSize="11" fill="#c9a5ff" opacity="0.6">ᛟ</text>
              <text x="188" y="104" textAnchor="middle" fontFamily="var(--fd), serif" fontSize="11" fill="#c9a5ff" opacity="0.6">ᛉ</text>
              <text x="130" y="166" textAnchor="middle" fontFamily="var(--fd), serif" fontSize="11" fill="#c9a5ff" opacity="0.6">ᛇ</text>
              <text x="72" y="104" textAnchor="middle" fontFamily="var(--fd), serif" fontSize="11" fill="#c9a5ff" opacity="0.6">ᛚ</text>
            </g>
            <g className="cdv-portal-core">
              <ellipse cx="130" cy="100" rx="48" ry="42" fill="url(#cdvPortalGrad)" opacity="0.55"/>
            </g>
          </svg>
        </div>

        {/* ═══ MAGIC — PHOENIX (distant, crossing) ═══ */}
        <div style={{ position: "absolute", top: "14%", left: "-8%", width: 140, height: 70, opacity: 0.85, pointerEvents: "none",
          animation: "cdvPhoenixFly 28s linear infinite", filter: "drop-shadow(0 0 18px #e8a53780)", transform: px(-0.18) }}>
          <svg viewBox="0 0 140 70" style={{ width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="cdvPBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffecb4"/>
                <stop offset="50%" stopColor="#e8a537"/>
                <stop offset="100%" stopColor="#c45a2d"/>
              </linearGradient>
              <linearGradient id="cdvPWing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffecb4"/>
                <stop offset="40%" stopColor="#f0c06a"/>
                <stop offset="100%" stopColor="#c45a2d"/>
              </linearGradient>
              <linearGradient id="cdvPTrail" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#ffecb4" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#e8a537" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <g className="cdv-phoenix-trail">
              <ellipse cx="25" cy="35" rx="15" ry="3" fill="url(#cdvPTrail)" opacity="0.6"/>
              <ellipse cx="10" cy="35" rx="10" ry="2" fill="#f0c06a" opacity="0.4"/>
            </g>
            <ellipse cx="70" cy="38" rx="15" ry="4.5" fill="url(#cdvPBody)"/>
            <ellipse cx="56" cy="33" rx="5" ry="3.2" fill="#ffecb4"/>
            <path d="M51 33 L45 35 L51 36" fill="#e8a537"/>
            <circle cx="54" cy="32.5" r="0.8" fill="#2a1810"/>
            <g style={{ transformOrigin: "60px 35px", animation: "cdvPhoenixFlap 1.4s ease-in-out infinite" }}>
              <path d="M60 35 L32 14 L42 26 L22 6 L48 24 L14 0 L52 22" fill="url(#cdvPWing)" opacity="0.95"/>
            </g>
            <g style={{ transformOrigin: "80px 35px", animation: "cdvPhoenixFlap 1.4s ease-in-out infinite 0.1s" }}>
              <path d="M80 35 L108 12 L100 24 L118 4 L104 22 L126 0 L114 20" fill="url(#cdvPWing)" opacity="0.95"/>
            </g>
            <path d="M85 40 Q95 48 105 42 L110 48 L100 44 L115 52 L103 46" fill="#e8a537"/>
          </svg>
        </div>

        {/* ═══ MAGIC — FLOATING ORBS ═══ */}
        <div style={{ position: "absolute", top: "42%", left: "12%", width: 14, height: 14, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #ffecb4f0 0%, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 25px #e8a537b0, 0 0 45px #f0c06a66",
          animation: "cdvOrbFloat 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "58%", left: "20%", width: 11, height: 11, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #a5fff0e6 0%, #3dd8c573 40%, transparent 70%)",
          boxShadow: "0 0 25px #3dd8c5a6, 0 0 45px #64f0dc59",
          animation: "cdvOrbFloat 8s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: "48%", right: "15%", width: 13, height: 13, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #dcb4ffe6 0%, #a878ff73 40%, transparent 70%)",
          boxShadow: "0 0 25px #a878ff99, 0 0 45px #c896ff59",
          animation: "cdvOrbFloat 8s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", top: "60%", right: "22%", width: 10, height: 10, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #ffecb4f0 0%, #e8a53780 40%, transparent 70%)",
          boxShadow: "0 0 25px #e8a537b0, 0 0 45px #f0c06a66",
          animation: "cdvOrbFloat 8s ease-in-out infinite 3s" }} />
        <div style={{ position: "absolute", top: "32%", left: "32%", width: 8, height: 8, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #a5fff0e6 0%, #3dd8c573 40%, transparent 70%)",
          boxShadow: "0 0 20px #3dd8c5a6",
          animation: "cdvOrbFloat 8s ease-in-out infinite 4s" }} />
        <div style={{ position: "absolute", top: "38%", right: "32%", width: 9, height: 9, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, #dcb4ffe6 0%, #a878ff73 40%, transparent 70%)",
          boxShadow: "0 0 22px #a878ff99",
          animation: "cdvOrbFloat 8s ease-in-out infinite 5s" }} />

        {/* ═══ MAIN DRAGON — animated wings (with arcane aura) ═══ */}
        <div style={{ position: "absolute", top: "8%", left: "50%", width: 220, height: 120, pointerEvents: "none", opacity: 0.85, animation: "dragonFly 8s ease-in-out infinite", transform: px(-0.25), filter: "drop-shadow(0 0 16px #a878ff40)" }}>
          <svg viewBox="0 0 220 120" style={{ width: "100%", height: "100%" }}>
            <g style={{ transformOrigin: "90px 58px", animation: "wingFlap 1.8s ease-in-out infinite" }}>
              <path d="M90 58 L22 18 L42 40 L8 6 L46 34 L0 0 L52 32" fill="#0e0c08" opacity="0.95"/>
              <path d="M52 32 L66 48 L90 58" fill="#0e0c08"/>
              <path d="M90 58 L22 18" stroke="#1a1610" strokeWidth="0.7"/><path d="M90 58 L8 6" stroke="#1a1610" strokeWidth="0.7"/><path d="M90 58 L0 0" stroke="#1a1610" strokeWidth="0.7"/>
            </g>
            <g style={{ transformOrigin: "128px 58px", animation: "wingFlap 1.8s ease-in-out infinite 0.15s" }}>
              <path d="M128 58 L192 16 L174 40 L210 6 L170 34 L220 0 L164 32" fill="#0e0c08" opacity="0.95"/>
              <path d="M164 32 L150 48 L128 58" fill="#0e0c08"/>
              <path d="M128 58 L192 16" stroke="#1a1610" strokeWidth="0.7"/><path d="M128 58 L210 6" stroke="#1a1610" strokeWidth="0.7"/><path d="M128 58 L220 0" stroke="#1a1610" strokeWidth="0.7"/>
            </g>
            <ellipse cx="110" cy="65" rx="24" ry="10" fill="#0e0c08"/>
            <path d="M88 60 Q68 46 52 34 Q46 28 40 30" fill="none" stroke="#0e0c08" strokeWidth="6.5" strokeLinecap="round"/>
            <ellipse cx="38" cy="29" rx="9" ry="5.5" fill="#0e0c08"/>
            <path d="M30 28 L22 32 L30 33" fill="#0e0c08"/>
            <path d="M33 23 L30 16" stroke="#0e0c08" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M39 24 L38 18" stroke="#0e0c08" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="33" cy="27" r="1.8" fill="#c9a5ff" className="cdv-dragon-eye"/>
            <circle cx="33" cy="27" r="0.7" fill="#fff3d4"/>
            <path d="M134 65 Q156 70 174 60 Q184 54 192 58" fill="none" stroke="#0e0c08" strokeWidth="5.5" strokeLinecap="round"/>
            <path d="M192 58 L200 51 L196 63 L192 58Z" fill="#0e0c08"/>
            <path d="M95 74 L91 84 L97 82" fill="none" stroke="#0e0c08" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M125 74 L129 84 L123 82" fill="none" stroke="#0e0c08" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M90 57 L87 52 M96 55 L93 50 M102 55 L99 50 M108 56 L105 51" stroke="#0e0c08" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Second smaller dragon — animated */}
        <div style={{ position: "absolute", top: "22%", right: "12%", width: 65, height: 35, opacity: 0.45, pointerEvents: "none", animation: "dragonSmall 10s ease-in-out infinite 2s" }}>
          <svg viewBox="0 0 55 30" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="27" cy="17" rx="7" ry="3.5" fill="#0e0c08"/>
            <path d="M20 15 Q14 10 10 8" fill="none" stroke="#0e0c08" strokeWidth="2.5" strokeLinecap="round"/>
            <ellipse cx="9" cy="7.5" rx="3" ry="2" fill="#0e0c08"/>
            <g style={{ transformOrigin: "22px 14px", animation: "wingSmall 2.2s ease-in-out infinite" }}><path d="M22 14 L8 4 L14 10 L4 0 L16 9" fill="#0e0c08"/></g>
            <g style={{ transformOrigin: "32px 14px", animation: "wingSmall 2.2s ease-in-out infinite 0.1s" }}><path d="M32 14 L44 3 L38 10 L50 0 L36 9" fill="#0e0c08"/></g>
            <path d="M34 17 Q40 19 44 16 Q46 14 48 16" fill="none" stroke="#0e0c08" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Birds far away */}
        <div style={{ position: "absolute", top: "18%", left: "20%", pointerEvents: "none" }}>
          <svg viewBox="0 0 14 7" width="14" height="7"><path d="M0 5 Q3.5 0 7 4 Q10.5 0 14 5" fill="none" stroke="#0e0c0850" strokeWidth="1.2"/></svg>
        </div>
        <div style={{ position: "absolute", top: "24%", left: "25%", pointerEvents: "none" }}>
          <svg viewBox="0 0 10 5" width="10" height="5"><path d="M0 3.5 Q2.5 0 5 3 Q7.5 0 10 3.5" fill="none" stroke="#0e0c0835" strokeWidth="1"/></svg>
        </div>

        {/* Mountains */}
        <div style={{ position: "absolute", bottom: "12%", left: 0, right: 0, height: 120, pointerEvents: "none", transform: px(-0.08) }}>
          <svg viewBox="0 0 680 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}><path d="M0 120 L0 78 L30 55 L65 68 L105 32 L140 50 L180 24 L215 44 L255 18 L295 40 L335 26 L370 48 L410 16 L445 42 L485 22 L520 44 L555 30 L595 50 L635 34 L680 48 L680 120Z" fill="#1a1610"/></svg>
        </div>

        {/* Fortress */}
        <div style={{ position: "absolute", bottom: "10%", left: "38%", width: 80, height: 105, pointerEvents: "none" }}>
          <svg viewBox="0 0 80 105" style={{ width: "100%", height: "100%" }}>
            <rect x="24" y="25" width="32" height="80" fill="#1e1a12"/>
            <rect x="24" y="20" width="7" height="8" fill="#1e1a12"/><rect x="34" y="20" width="7" height="8" fill="#1e1a12"/><rect x="44" y="20" width="7" height="8" fill="#1e1a12"/>
            <polygon points="40,0 48,20 32,20" fill="#1e1a12"/>
            <rect x="5" y="42" width="19" height="63" fill="#1e1a12"/>
            <rect x="5" y="37" width="5" height="7" fill="#1e1a12"/><rect x="12" y="37" width="5" height="7" fill="#1e1a12"/>
            <polygon points="14,28 22,37 7,37" fill="#1e1a12"/>
            <rect x="56" y="38" width="19" height="67" fill="#1e1a12"/>
            <rect x="56" y="33" width="5" height="7" fill="#1e1a12"/><rect x="63" y="33" width="5" height="7" fill="#1e1a12"/>
            <polygon points="65,24 75,33 56,33" fill="#1e1a12"/>
            <rect x="0" y="60" width="5" height="45" fill="#1e1a12"/>
            <rect x="75" y="55" width="5" height="50" fill="#1e1a12"/>
            <rect x="34" y="82" width="12" height="23" rx="6" fill="#14120c"/>
            <rect x="36" y="40" width="4" height="5" fill="#e8a53718" rx="1"/>
            <rect x="36" y="54" width="4" height="5" fill="#e8a53714" rx="1"/>
            <rect x="36" y="68" width="4" height="5" fill="#e8a53710" rx="1"/>
            <rect x="10" y="55" width="3" height="4" fill="#e8a53712" rx="0.5"/>
            <rect x="10" y="68" width="3" height="4" fill="#e8a53710" rx="0.5"/>
            <rect x="61" y="50" width="3" height="4" fill="#e8a53712" rx="0.5"/>
            <rect x="61" y="63" width="3" height="4" fill="#e8a53710" rx="0.5"/>
          </svg>
        </div>

        {/* Village houses */}
        <div style={{ position: "absolute", bottom: "9%", left: "25%", width: 14, height: 14, pointerEvents: "none" }}>
          <svg viewBox="0 0 14 14" style={{ width: "100%", height: "100%" }}><rect x="1" y="6" width="12" height="8" fill="#1a1610"/><polygon points="0,6 7,0 14,6" fill="#1a1610"/><rect x="4" y="8" width="2" height="2" fill="#e8a53710" rx="0.5"/></svg>
        </div>
        <div style={{ position: "absolute", bottom: "8.5%", right: "23%", width: 12, height: 13, pointerEvents: "none" }}>
          <svg viewBox="0 0 12 13" style={{ width: "100%", height: "100%" }}><rect x="1" y="5.5" width="10" height="7.5" fill="#1a1610"/><polygon points="0,5.5 6,0 12,5.5" fill="#1a1610"/><rect x="4" y="7.5" width="2" height="2" fill="#e8a53710" rx="0.4"/></svg>
        </div>

        {/* Trees */}
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 14, height: 38, pointerEvents: "none" }}>
          <svg viewBox="0 0 14 38" style={{ width: "100%", height: "100%" }}><line x1="7" y1="38" x2="7" y2="6" stroke="#16130e" strokeWidth="2.2"/><line x1="7" y1="14" x2="2" y2="6" stroke="#16130e" strokeWidth="1.5"/><line x1="7" y1="20" x2="12" y2="12" stroke="#16130e" strokeWidth="1.5"/></svg>
        </div>
        <div style={{ position: "absolute", bottom: "8.5%", right: "9%", width: 18, height: 34, pointerEvents: "none" }}>
          <svg viewBox="0 0 18 34" style={{ width: "100%", height: "100%" }}><polygon points="9,0 17,23 1,23" fill="#16140f"/><rect x="7" y="23" width="4" height="11" fill="#16140f"/></svg>
        </div>
        <div style={{ position: "absolute", bottom: "9.5%", right: "14%", width: 13, height: 27, pointerEvents: "none" }}>
          <svg viewBox="0 0 13 27" style={{ width: "100%", height: "100%" }}><polygon points="6.5,0 13,19 0,19" fill="#16140f"/><rect x="4.5" y="19" width="4" height="8" fill="#16140f"/></svg>
        </div>
        <div style={{ position: "absolute", bottom: "8%", left: "16%", width: 15, height: 30, pointerEvents: "none" }}>
          <svg viewBox="0 0 15 30" style={{ width: "100%", height: "100%" }}><polygon points="7.5,0 14,20 1,20" fill="#18150f"/><rect x="5.5" y="20" width="4" height="10" fill="#18150f"/></svg>
        </div>

        {/* Foreground */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "10%", pointerEvents: "none" }}>
          <svg viewBox="0 0 680 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}><path d="M0 60 L0 32 Q100 22 220 28 Q340 16 460 24 Q560 14 680 22 L680 60Z" fill="#12100c"/></svg>
        </div>

        {/* Horizon glow band (magical) */}
        <div style={{ position: "absolute", top: "48%", left: 0, right: 0, height: 35, background: "linear-gradient(180deg, transparent, #a878ff0c, #c9a5ff08, #3dd8c506, transparent)", pointerEvents: "none" }} />

        {/* ═══ MAGIC MOTES — multi-color arcane particles ═══ */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[
            { x: "15%", dur: 4, drift: "drift1", dDur: 4, c: "#e8a537", s: 5, d: 0 },
            { x: "30%", dur: 5, drift: "drift2", dDur: 5, c: "#3dd8c5", s: 4, d: 0.3 },
            { x: "45%", dur: 3.5, drift: "drift3", dDur: 3.5, c: "#a878ff", s: 6, d: 0.8 },
            { x: "58%", dur: 4.5, drift: "drift1", dDur: 4.5, c: "#e8a537", s: 4, d: 1.2 },
            { x: "72%", dur: 3.8, drift: "drift2", dDur: 3.8, c: "#3dd8c5", s: 5, d: 1.8 },
            { x: "85%", dur: 5.2, drift: "drift3", dDur: 5.2, c: "#a878ff", s: 3, d: 0.5 },
            { x: "22%", dur: 3.2, drift: "drift1", dDur: 3.2, c: "#f0c06a", s: 4, d: 2 },
            { x: "38%", dur: 4.8, drift: "drift2", dDur: 4.8, c: "#a5eedd", s: 5, d: 2.5 },
            { x: "55%", dur: 3.6, drift: "drift3", dDur: 3.6, c: "#c9a5ff", s: 3, d: 3 },
            { x: "68%", dur: 5.5, drift: "drift1", dDur: 5.5, c: "#e8a537", s: 6, d: 0.2 },
            { x: "80%", dur: 4.2, drift: "drift2", dDur: 4.2, c: "#3dd8c5", s: 4, d: 1.5 },
            { x: "10%", dur: 6, drift: "drift3", dDur: 6, c: "#a878ff", s: 5, d: 3.5 },
          ].map((e, i) => (
            <div key={i} style={{ position: "absolute", bottom: 50 + (i % 3) * 8, left: e.x, animation: `${e.drift} ${e.dDur}s ease-in-out infinite ${e.d}s` }}>
              <div style={{ "--ec": e.c, width: e.s, height: e.s, borderRadius: "50%", background: e.c, animation: `ember ${e.dur}s ease-out infinite ${e.d}s, pulseGlow ${0.7 + (i % 4) * 0.2}s ease-in-out infinite` }} />
            </div>
          ))}
        </div>

        {/* ═══ CINEMATIC TITLE ═══ */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{
            fontSize: 11, color: "#8a6a40", letterSpacing: 5, marginBottom: 14,
            textTransform: "uppercase", fontFamily: "var(--fd)",
            animation: "subIn 1s ease-out 0.3s both",
          }}>⚔ Serveur PvE Hytale ⚔</div>

          <h1 style={{ margin: "0 0 0", position: "relative", display: "inline-block" }}>
            {"Ciel de Vignis".split("").map((ch, i) => (
              <span key={i} style={{
                display: "inline-block",
                fontSize: "clamp(42px, 7vw, 72px)", fontWeight: 900, fontFamily: "var(--fd)", letterSpacing: 3,
                animation: `letterIn 0.5s ease-out ${1.0 + i * 0.09}s both`,
                ...(ch === " " ? { width: "0.3em" } : {}),
              }}>{ch === " " ? "\u00A0" : ch}</span>
            ))}
            <div style={{
              position: "absolute", bottom: -4, left: 0, right: 0, height: 2, overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", width: "40%", height: "100%",
                background: "linear-gradient(90deg, transparent, #e8a537, #f0c06a, #e8a537, transparent)",
                animation: "flashSweep 1s ease-out 2.5s both",
              }} />
            </div>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2.2vw, 19px)", color: "#c9a878", fontFamily: "var(--fd)", fontStyle: "italic",
            margin: "18px auto 36px",
            textShadow: "0 1px 12px #000a",
            animation: "fadeUp 0.8s ease-out 3s both",
          }}>
            Forge ton destin. Maîtrise les éléments.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s ease-out 3.5s both" }}>
            <button onClick={() => setPage("builds")} className="btn-primary-lg">
              ⚔️ Forger un Build
            </button>
            <button onClick={() => window.open("https://discord.gg/7YmTATJcf", "_blank")} className="btn-discord">
              💬 Rejoindre Discord
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 30, animation: "bounce 2s ease infinite", opacity: 0.35, zIndex: 2 }}>
          <div style={{ width: 22, height: 38, borderRadius: 9, border: "1px solid #4a403060", display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, background: "#e8a53780" }} />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "20px 24px 50px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ flex: 1, maxWidth: 120, height: 1, background: "linear-gradient(90deg, transparent, #e8a53725)" }} />
          <div style={{ fontSize: 10, color: "#6a5a40", letterSpacing: 3, fontFamily: "var(--fd)", textTransform: "uppercase" }}>En chiffres</div>
          <div style={{ flex: 1, maxWidth: 120, height: 1, background: "linear-gradient(90deg, #e8a53725, transparent)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", textAlign: "center" }}>
          {[
            { v: "8594", l: "objets", c: G.gold },
            { v: "72", l: "races", c: G.teal },
            { v: "14", l: "classes", c: G.blue },
            { v: "11", l: "donjons", c: G.orange },
            { v: "55", l: "augments", c: G.purple },
            { v: "29", l: "mods", c: "#f0c06a" },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: "var(--fd)" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#6a5a45" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: "linear-gradient(90deg, transparent, #e8a53725)" }} />
            <div style={{ fontSize: 10, color: "#6a5a40", letterSpacing: 3, fontFamily: "var(--fd)", textTransform: "uppercase" }}>Découvrir</div>
            <div style={{ flex: 1, maxWidth: 120, height: 1, background: "linear-gradient(90deg, #e8a53725, transparent)" }} />
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "8px 0 10px", letterSpacing: 1, animation: "fadeSlideUp 0.6s ease both" }}>
            Tout pour ton aventure
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Des outils pensés pour les joueurs de CielDeVignis
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <FeatureCard icon="⚔️" title="Build Creator" desc="Crée et simule tes builds avec un calcul précis de toutes tes stats. Race, classes, SP, augments — tout y est." color={G.teal} delay={0.1} onClick={() => setPage("builds")} />
          <FeatureCard icon="🏰" title="Donjons & Monstres" desc="Explore les 11 donjons du serveur — niveaux, boss, scaling et loot pour chaque instance." color={G.gold} delay={0.2} onClick={() => setPage("dungeons")} />
          <FeatureCard icon="🗡️" title="Armes & Armures" desc="Toutes les armes et armures du serveur avec leurs stats, bonus, et compatibilité de classe." color={G.orange} delay={0.3} onClick={() => setPage("wiki")} />
          <FeatureCard icon="📊" title="Communauté" desc="Partage tes builds, explore ceux de ta guilde, et compare les configurations." color={G.purple} delay={0.4} onClick={() => setPage("community")} />
        </div>
      </section>

      {/* RACES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg, transparent, #e8a53720)" }} />
            <div style={{ fontSize: 10, color: "#6a5a40", letterSpacing: 3, fontFamily: "var(--fd)", textTransform: "uppercase" }}>Races</div>
            <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg, #e8a53720, transparent)" }} />
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "8px 0 8px", letterSpacing: 0.5 }}>
            12 Races
          </h2>
          <p style={{ fontSize: 14, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Chacune avec un arbre d'ascension unique en 4 étapes
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {RACE_PREVIEWS.map((r, i) => <RacePreview key={r.name} race={r} delay={0.05 * i} />)}
        </div>
      </section>

      {/* CLASSES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg, transparent, #e8a53720)" }} />
            <div style={{ fontSize: 10, color: "#6a5a40", letterSpacing: 3, fontFamily: "var(--fd)", textTransform: "uppercase" }}>Classes</div>
            <div style={{ flex: 1, maxWidth: 100, height: 1, background: "linear-gradient(90deg, #e8a53720, transparent)" }} />
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "8px 0 8px", letterSpacing: 0.5 }}>
            14 Classes × 5 Tiers
          </h2>
          <p style={{ fontSize: 14, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Classe primaire + secondaire — des milliers de combinaisons
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {CLASS_PREVIEWS.map((c, i) => (
            <div key={c.name} className="class-preview" style={{
              background: `${c.color}08`, border: `1px solid ${c.color}20`, borderRadius: "var(--radius-md)",
              borderLeft: `3px solid ${c.color}50`,
              padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
              animation: `fadeSlideUp 0.4s ease ${0.03 * i}s both`,
            }}
            >
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-bold)", color: c.color, fontFamily: "var(--fd)", letterSpacing: 0.3 }}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px 100px", textAlign: "center" }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", padding: "52px 44px", borderRadius: "var(--radius-md)",
          background: `linear-gradient(165deg, ${G.card}, ${G.gold}06)`,
          border: `1px solid ${G.gold}18`, position: "relative", overflow: "hidden",
          borderTop: `2px solid ${G.gold}40`,
        }}>
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.gold}03 1px, transparent 1px), linear-gradient(90deg, ${G.gold}03 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: `radial-gradient(circle, ${G.gold}0a, transparent)`, borderRadius: "50%" }} />
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#f0e6d2", margin: "0 0 14px", fontFamily: "var(--fd)", position: "relative", letterSpacing: 1 }}>
            Prêt à créer ton build ?
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: "0 0 32px", fontFamily: "var(--fb)", position: "relative" }}>
            Théorycraft ta combinaison parfaite de race, classes et augments.
          </p>
          <button onClick={() => setPage("builds")} className="btn-primary-lg" style={{ padding: "16px 52px", fontSize: 18, position: "relative" }}>
            ⚔️ Lancer le Build Creator
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${G.gold}12`, background: `${G.card}90`, marginTop: 20, position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.gold}02 1px, transparent 1px), linear-gradient(90deg, ${G.gold}02 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 24px", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 36 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: G.bg, fontFamily: "var(--fd)", boxShadow: `0 0 12px ${G.gold}20` }}>C</div>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--fd)", color: "#f0e6d2", letterSpacing: 0.5 }}>CielDeVignis</span>
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                Serveur communautaire Hytale PvE.
                <br/>Explore, combats, théorycraft.
              </p>
            </div>
            {/* Outils */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Outils</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{label:"Build Creator",icon:"⚔️",id:"builds"},{label:"Communauté",icon:"🌍",id:"community"},{label:"Donjons",icon:"🏰",id:"dungeons"},{label:"Wiki",icon:"📖",id:"wiki"},{label:"Mods",icon:"🧩",id:"mods"}].map(l=>(
                  <span key={l.id} onClick={()=>setPage(l.id)} className="footer-link" style={{ fontSize: "var(--text-sm)", color: G.muted, display: "flex", alignItems: "center", gap: 6 }}
                  >{l.icon} {l.label}</span>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Contenu</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{v:"12",l:"Races",c:G.accent2},{v:"14",l:"Classes",c:G.teal},{v:"59",l:"Augments",c:G.purple},{v:"72",l:"Évolutions",c:G.blue},{v:"11",l:"Donjons",c:G.orange}].map(s=>(
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: G.muted }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: s.c, minWidth: 24 }}>{s.v}</span>{s.l}
                  </div>
                ))}
              </div>
            </div>
            {/* Communauté */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Communauté</div>
              <a href="https://discord.gg/7YmTATJcf" target="_blank" rel="noopener" className="discord-link" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
                borderRadius: "var(--radius-sm)", background: "#5865F210", border: "1px solid #5865F225",
                borderLeft: "3px solid #5865F2",
                color: "#5865F2", textDecoration: "none", fontSize: "var(--text-sm)", fontWeight: "var(--fw-bold)",
                fontFamily: "var(--fb)",
              }}
              >💬 Rejoindre le Discord</a>
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${G.gold}0c`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#4a4030" }}>© 2025 CielDeVignis — EndlessLeveling v7.0.6</div>
            <div style={{ fontSize: 11, color: "#4a4030" }}>Fait avec passion pour la communauté Hytale</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ItemImg({ id, size = 28, fallback = "📦", style = {} }) {
  const [err, setErr] = useState(false);
  if (err || !id) return <span style={{ fontSize: size * 0.65, width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}>{fallback}</span>;
  return <img src={`/images/items/${id}.png`} alt="" onError={() => setErr(true)} style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0, borderRadius: 3, ...style }} />;
}

function WikiPage() {
  const [wikiTab, setWikiTab] = useState("items");
  const [cat, setCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  // Advanced filters
  const [qualities, setQualities] = useState([]);
  const [lvlMin, setLvlMin] = useState("");
  const [lvlMax, setLvlMax] = useState("");
  const [sort, setSort] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  // Calculator state
  const [calcItems, setCalcItems] = useState([]);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcSearch, setCalcSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(50);
  // Comparator state
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const toggleCompare = (id) => setCompareIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : prev.length<3 ? [...prev, id] : prev);
  const compareItems2 = compareIds.map(id => WIKI_ITEMS.find(i=>i.id===id)).filter(Boolean);
  const canCompare = (r) => r.c==="Weapon"||r.c==="Armor";
  const fmtItem = (s) => s ? s.replace(/_/g, ' ') : '';
  const switchTab = (t) => { setWikiTab(t); setCat("ALL"); setSearch(""); setExpanded(null); setQualities([]); setLvlMin(""); setLvlMax(""); setSort("name"); setDisplayCount(50); };
  const toggleQuality = (q) => setQualities(prev => prev.includes(q) ? prev.filter(x=>x!==q) : [...prev, q]);
  const clearAdvanced = () => { setQualities([]); setLvlMin(""); setLvlMax(""); setSort("name"); };
  const hasAdvanced = qualities.length > 0 || lvlMin !== "" || lvlMax !== "" || sort !== "name";
  useEffect(() => { setDisplayCount(50); }, [cat, search, sort]);
  // Filter out debug/dev/template/test items globally
  const HIDDEN_QUALITIES = new Set(["Debug","Developer","Template","Technical"]);
  const wikiItems = useMemo(() => WIKI_ITEMS.filter(i => !HIDDEN_QUALITIES.has(i.q)), []);
  const wikiMobs = useMemo(() => WIKI_MOBS.filter(m => m.c !== "_Core"), []);
  const wikiRecipes = useMemo(() => WIKI_RECIPES.filter(r => { const item = WIKI_ITEMS.find(i=>i.id===r.id); return !item || !HIDDEN_QUALITIES.has(item.q); }), []);
  const tabs = [
    {id:"items",label:"Objets",icon:"⚔️",count:wikiItems.length},
    {id:"mobs",label:"Créatures",icon:"🐉",count:wikiMobs.length},
    {id:"salvage",label:"Salvage",icon:"♻️",count:wikiRecipes.length},
    {id:"craft",label:"Craft",icon:"🔨",count:wikiItems.filter(i=>i.r&&i.r.length>0).length},
  ];
  // Craft bench categories
  const CRAFT_BENCHES = [
    {id:"Weapon_Bench",icon:"⚔️",label:"Armes",color:"#e8653a"},
    {id:"Armor_Bench",icon:"🛡️",label:"Armures",color:"#4ea8f0"},
    {id:"Armory",icon:"🏰",label:"Armurerie",color:"#845ef7"},
    {id:"Alchemybench",icon:"⚗️",label:"Alchimie",color:"#845ef7"},
    {id:"Cookingbench",icon:"🍳",label:"Cuisine",color:"#51cf66"},
    {id:"Campfire",icon:"🔥",label:"Feu de camp",color:"#e8653a"},
    {id:"Workbench",icon:"🔧",label:"Établi",color:"#f5a623"},
    {id:"Farmingbench",icon:"🌾",label:"Agriculture",color:"#51cf66"},
    {id:"Furnace",icon:"🔥",label:"Fourneau",color:"#e8653a"},
    {id:"Arcanebench",icon:"✨",label:"Arcane",color:"#845ef7"},
    {id:"Fieldcraft",icon:"🏕️",label:"Fieldcraft",color:"#3dd8c5"},
    {id:"Gauntlet_Anvil_Bench",icon:"🥊",label:"Gantelets",color:"#e8653a"},
    {id:"Runecrafter's Table",icon:"🔮",label:"Runecraft",color:"#845ef7"},
    {id:"Endgame_Bench",icon:"⚡",label:"Endgame",color:"#f5a623"},
    {id:"Necrobench",icon:"💀",label:"Nécro",color:"#845ef7"},
    {id:"KebKatana_Bench",icon:"⚔️",label:"Katanas",color:"#e8653a"},
    {id:"BenchMagicGearCraft",icon:"🪄",label:"Magie RPG",color:"#4ea8f0"},
    {id:"BenchMagicGearCraftUpgrades",icon:"⬆️",label:"Magie RPG+",color:"#4ea8f0"},
    {id:"EEG_Refinery",icon:"🔩",label:"Raffinerie",color:"#f5a623"},
    {id:"Tannery",icon:"🧶",label:"Tannerie",color:"#f5a623"},
    {id:"UMT_Loombench",icon:"🧵",label:"Métier à tisser",color:"#3dd8c5"},
    {id:"Hedera_Autel",icon:"🌿",label:"Autel Hedera",color:"#51cf66"},
    {id:"Enchantingbench",icon:"📜",label:"Enchantements",color:"#845ef7"},
    {id:"HyFishing_AnglerBench",icon:"🐟",label:"Pêche",color:"#4ea8f0"},
    {id:"Furniture_Bench",icon:"🪑",label:"Mobilier",color:"#c8882a"},
    {id:"Aurescraftingbench",icon:"🏡",label:"Aures Craft",color:"#c8882a"},
    {id:"Windows",icon:"🪟",label:"Fenêtres",color:"#3dd8c5"},
    {id:"Mcw_Lights_Bench",icon:"💡",label:"Lumières McwHy",color:"#f5a623"},
    {id:"Mcw_Carpets_Bench",icon:"🟥",label:"Tapis McwHy",color:"#e8653a"},
    {id:"Mcw_Doors_Bench",icon:"🚪",label:"Portes McwHy",color:"#c8882a"},
    {id:"Mcw_Furniture_Bench",icon:"🛋️",label:"Meuble McwHy",color:"#c8882a"},
    {id:"Builders",icon:"🧱",label:"Bâtisseur",color:"#f5a623"},
    {id:"N1Furniture_Bench",icon:"🪑",label:"Mobilier N1",color:"#c8882a"},
    {id:"LRP_Carpentry",icon:"🪵",label:"Menuiserie LotR",color:"#c8882a"},
    {id:"Armor_Bench_Elven",icon:"🧝",label:"Armure Elfique",color:"#4ea8f0"},
    {id:"Weapon_Bench_Elven",icon:"⚔️",label:"Arme Elfique",color:"#e8653a"},
    {id:"Mjolnir_Furnace",icon:"⚡",label:"Forge Mjolnir",color:"#f5a623"},
    {id:"Empacotador",icon:"📦",label:"Empacotador",color:"#7c8db5"},
    {id:"Mcw_Paths_Bench",icon:"🛤️",label:"Chemins McwHy",color:"#c8882a"},
    {id:"McwPaths_Bench",icon:"🛤️",label:"Chemins McwHy",color:"#c8882a"},
    {id:"Mcw_Windows_Bench",icon:"🪟",label:"Fenêtres McwHy",color:"#3dd8c5"},
    {id:"Bench_Music",icon:"🎵",label:"Musique",color:"#845ef7"},
    {id:"SOLrangebench",icon:"🍳",label:"Cuisinière SoL",color:"#51cf66"},
    {id:"Salmakia_Kitchen_Furniture",icon:"🍽️",label:"Cuisine Salmakia",color:"#c8882a"},
    {id:"Salmakia_Tea_Bench",icon:"🍵",label:"Thé Salmakia",color:"#51cf66"},
    {id:"NoCube_Bench_Brewing_Cauldron",icon:"🍺",label:"Brassage",color:"#f5a623"},
    {id:"NoCube_Bench_Fruit_Press",icon:"🍇",label:"Pressoir",color:"#51cf66"},
    {id:"NoCube_Bench_Keg",icon:"🛢️",label:"Tonneau",color:"#f5a623"},
    {id:"NoCube_Bench_Orchard",icon:"🌳",label:"Verger",color:"#51cf66"},
    {id:"NoCube_Aging_Cask",icon:"🪵",label:"Fût vieilliss.",color:"#c8882a"},
    {id:"SOL_Beehive",icon:"🐝",label:"Ruche",color:"#f5a623"},
    {id:"Potions",icon:"🧪",label:"Potions Sig",color:"#845ef7"},
    {id:"Bench_Violet_Clothing",icon:"👗",label:"Vêtements Violet",color:"#e060a0"},
    {id:"Bench_Violet_Plushie",icon:"🧸",label:"Peluches Violet",color:"#e060a0"},
    {id:"YmmersiveCarpentry",icon:"🪚",label:"Menuiserie Ymm.",color:"#c8882a"},
    {id:"YmmersiveMasonry",icon:"🧱",label:"Maçonnerie Ymm.",color:"#7c8db5"},
    {id:"DarkCoinShop",icon:"🪙",label:"Boutique Sombre",color:"#845ef7"},
    {id:"Bench_Writing_Desk",icon:"📝",label:"Bureau d'écriture",color:"#4ea8f0"},
    {id:"Bench_Palantir",icon:"🔮",label:"Palantír",color:"#845ef7"},
    {id:"Galadriel_Mirror",icon:"🪞",label:"Miroir Galadriel",color:"#3dd8c5"},
    {id:"Salvagebench",icon:"♻️",label:"Recyclage",color:"#7c8db5"},
    {id:"Tritale_Cadence_Shovel",icon:"⛏️",label:"Pelle Cadence",color:"#f5a623"},
    {id:"Furniture_Misc",icon:"🪑",label:"Mobilier Divers",color:"#c8882a"},
    {id:"Architectsbench",icon:"📐",label:"Architecte",color:"#f5a623"},
    {id:"ArmorBench",icon:"🛡️",label:"Armures (alt)",color:"#4ea8f0"},
    {id:"Loombench",icon:"🧵",label:"Métier à tisser",color:"#3dd8c5"},
    {id:"TODO",icon:"📋",label:"Non assigné",color:"#7c8db5"},
  ];
  const activeCats = wikiTab === "items" ? ITEM_CATS : wikiTab === "mobs" ? MOB_CATS : wikiTab === "craft" ? CRAFT_BENCHES : SALVAGE_CATS;
  // Craft helpers
  const ITEM_MAP = useMemo(() => Object.fromEntries(WIKI_ITEMS.map(i=>[i.id,i])), []);
  const craftableItems = useMemo(() => wikiItems.filter(i=>i.r&&i.r.length>0), [wikiItems]);
  // Build flat list of all raw materials needed
  const flattenRecipe = (id, qty, seen) => {
    if (!seen) seen = new Set();
    if (seen.has(id)) return [{id, qty, raw:true}];
    const item = ITEM_MAP[id];
    if (!item || !item.r || item.r.length===0) return [{id, qty, raw:true}];
    seen.add(id);
    const results = [];
    item.r.forEach(([ingId, ingQty]) => {
      const sub = flattenRecipe(ingId, ingQty * qty, new Set(seen));
      sub.forEach(s => {
        const existing = results.find(r=>r.id===s.id);
        if (existing) existing.qty += s.qty;
        else results.push({...s});
      });
    });
    return results;
  };
  // Calculator helpers
  const addToCalc = (id) => {
    setCalcItems(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) return prev.map(c => c.id === id ? {...c, qty: c.qty + 1} : c);
      return [...prev, {id, qty: 1}];
    });
    if (!calcOpen) setCalcOpen(true);
  };
  const setCalcQty = (id, qty) => {
    if (qty <= 0) return setCalcItems(prev => prev.filter(c => c.id !== id));
    setCalcItems(prev => prev.map(c => c.id === id ? {...c, qty} : c));
  };
  const removeFromCalc = (id) => setCalcItems(prev => prev.filter(c => c.id !== id));
  // Compute combined raw materials for all calc items
  const calcTotalMats = useMemo(() => {
    const combined = [];
    calcItems.forEach(({id, qty}) => {
      const mats = flattenRecipe(id, qty, new Set());
      mats.forEach(m => {
        const existing = combined.find(c => c.id === m.id);
        if (existing) existing.qty += m.qty;
        else combined.push({...m});
      });
    });
    return combined.sort((a, b) => b.qty - a.qty);
  }, [calcItems]);
  const calcIntermediates = useMemo(() => {
    const inter = [];
    const collect = (id, qty, seen) => {
      if (!seen) seen = new Set();
      if (seen.has(id)) return;
      const item = ITEM_MAP[id];
      if (!item || !item.r || item.r.length===0) return;
      seen.add(id);
      item.r.forEach(([ingId, ingQty]) => {
        const sub = ITEM_MAP[ingId];
        if (sub && sub.r && sub.r.length>0) {
          const totalQty = ingQty * qty;
          const existing = inter.find(c => c.id === ingId);
          if (existing) existing.qty += totalQty;
          else inter.push({id: ingId, qty: totalQty, bench: sub.b});
          collect(ingId, totalQty, new Set(seen));
        }
      });
    };
    calcItems.forEach(({id, qty}) => collect(id, qty, new Set()));
    return inter.sort((a, b) => b.qty - a.qty);
  }, [calcItems]);
  const calcSearchResults = calcSearch.length >= 2 ? craftableItems.filter(r =>
    r.id.toLowerCase().includes(calcSearch.toLowerCase()) && !calcItems.find(c => c.id === r.id)
  ).slice(0, 8) : [];
  // Helper: compute total DPS for an item
  const itemDPS = (r) => r.dmg ? r.dmg.reduce((s,d)=>s+d.d, 0) : 0;
  // Helper: compute total resistance for an item
  const itemRes = (r) => r.res ? Object.values(r.res).reduce((s,v)=>s+v, 0) : 0;
  // Helper: mob total damage
  const mobDmg = (r) => r.dmg ? r.dmg.reduce((s,d)=>s+d.d, 0) : 0;
  // Quality sort order for consistent ordering
  const QUALITY_ORDER = {"Common":0,"Uncommon":1,"Rare":2,"Epic":3,"Legendary":4,"Debug":5,"Developer":6,"Template":7,"Technical":8};
  // Sorting functions
  const sortItems = (arr) => {
    const sorted = [...arr];
    switch(sort) {
      case "level": return sorted.sort((a,b) => (a.l||0) - (b.l||0));
      case "level_desc": return sorted.sort((a,b) => (b.l||0) - (a.l||0));
      case "dps": return sorted.sort((a,b) => itemDPS(b) - itemDPS(a));
      case "res": return sorted.sort((a,b) => itemRes(b) - itemRes(a));
      case "dur": return sorted.sort((a,b) => (b.dur||0) - (a.dur||0));
      case "quality": return sorted.sort((a,b) => (QUALITY_ORDER[b.q]||0) - (QUALITY_ORDER[a.q]||0));
      default: return sorted;
    }
  };
  const sortMobs = (arr) => {
    const sorted = [...arr];
    switch(sort) {
      case "hp": return sorted.sort((a,b) => (b.hp||0) - (a.hp||0));
      case "hp_asc": return sorted.sort((a,b) => (a.hp||0) - (b.hp||0));
      case "dmg": return sorted.sort((a,b) => mobDmg(b) - mobDmg(a));
      case "spd": return sorted.sort((a,b) => (b.spd||0) - (a.spd||0));
      default: return sorted;
    }
  };
  const sortSalvage = (arr) => {
    const sorted = [...arr];
    switch(sort) {
      case "time": return sorted.sort((a,b) => (a.t||0) - (b.t||0));
      case "outputs": return sorted.sort((a,b) => (b.o?b.o.length:0) - (a.o?a.o.length:0));
      default: return sorted;
    }
  };
  const filteredItems = wikiTab==="items" ? sortItems(wikiItems.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (qualities.length>0&&!qualities.includes(r.q)) return false;
    if (lvlMin!==""&&(r.l||0)<parseInt(lvlMin)) return false;
    if (lvlMax!==""&&(r.l||0)>parseInt(lvlMax)) return false;
    return true;
  })) : [];
  const filteredMobs = wikiTab==="mobs" ? sortMobs(wikiMobs.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.id.toLowerCase().includes(search.toLowerCase())&&!(r.app||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  })) : [];
  const filteredSalvage = wikiTab==="salvage" ? sortSalvage(wikiRecipes.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.n.toLowerCase().includes(search.toLowerCase())&&!r.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  })) : [];
  const sortCraft = (arr) => {
    const sorted = [...arr];
    switch(sort) {
      case "level": return sorted.sort((a,b) => (a.l||0) - (b.l||0));
      case "level_desc": return sorted.sort((a,b) => (b.l||0) - (a.l||0));
      case "quality": return sorted.sort((a,b) => (QUALITY_ORDER[b.q]||0) - (QUALITY_ORDER[a.q]||0));
      case "ingredients": return sorted.sort((a,b) => (b.r?b.r.length:0) - (a.r?a.r.length:0));
      default: return sorted;
    }
  };
  const filteredCraft = wikiTab==="craft" ? sortCraft(craftableItems.filter(r => {
    if (cat!=="ALL"&&r.b!==cat) return false;
    if (search&&!r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (qualities.length>0&&!qualities.includes(r.q)) return false;
    if (lvlMin!==""&&(r.l||0)<parseInt(lvlMin)) return false;
    if (lvlMax!==""&&(r.l||0)>parseInt(lvlMax)) return false;
    return true;
  })) : [];
  const totalFiltered = wikiTab==="items"?filteredItems.length:wikiTab==="mobs"?filteredMobs.length:wikiTab==="craft"?filteredCraft.length:filteredSalvage.length;
  // Sort options per tab
  const SORT_OPTIONS = {
    items: [{id:"name",label:"Nom (A-Z)"},{id:"level",label:"Niveau ↑"},{id:"level_desc",label:"Niveau ↓"},{id:"quality",label:"Qualité ↓"},{id:"dps",label:"Dégâts ↓"},{id:"res",label:"Résistance ↓"},{id:"dur",label:"Durabilité ↓"}],
    mobs: [{id:"name",label:"Nom (A-Z)"},{id:"hp",label:"HP ↓"},{id:"hp_asc",label:"HP ↑"},{id:"dmg",label:"Dégâts ↓"},{id:"spd",label:"Vitesse ↓"}],
    salvage: [{id:"name",label:"Nom (A-Z)"},{id:"time",label:"Temps ↑"},{id:"outputs",label:"Nb sorties ↓"}],
    craft: [{id:"name",label:"Nom (A-Z)"},{id:"level",label:"Niveau ↑"},{id:"level_desc",label:"Niveau ↓"},{id:"quality",label:"Qualité ↓"},{id:"ingredients",label:"Nb ingrédients ↓"}],
  };
  const ALL_QUALITIES = ["Common","Uncommon","Rare","Epic","Legendary"];

  return (
    <div style={{ position:"relative",zIndex:1,padding:"100px 24px 60px",maxWidth:1200,margin:"0 auto" }}>
      <div style={{ display:"inline-block",padding:"4px 16px",borderRadius:4,background:G.teal+"10",border:"1px solid "+G.teal+"20",fontSize:11,fontWeight:800,color:G.teal,textTransform:"uppercase",letterSpacing:2,marginBottom:12 }}>Base de données</div>
      <h1 style={{ fontSize:38,fontWeight:900,color:"#f0e6d2",fontFamily:"var(--fd)",margin:"0 0 8px",letterSpacing:1 }}>Wiki CielDeVignis</h1>
      <p style={{ fontSize:16,color:G.muted,margin:"0 0 32px" }}>{wikiItems.length} objets · {wikiMobs.length} créatures · {wikiRecipes.length} recettes salvage · {craftableItems.length} recettes craft</p>
      {/* Tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:24,borderBottom:"2px solid "+G.border }}>
        {tabs.map(t=><button key={t.id} onClick={()=>switchTab(t.id)} style={{ padding:"12px 24px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",background:wikiTab===t.id?G.card:"transparent",color:wikiTab===t.id?G.teal:G.muted,borderBottom:wikiTab===t.id?"2px solid "+G.teal:"2px solid transparent",fontWeight:700,fontSize:14,fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8,transition:"color 0.15s" }}><span style={{fontSize:18}}>{t.icon}</span> {t.label} <span style={{fontSize:11,opacity:0.6,background:wikiTab===t.id?G.teal+"12":"transparent",padding:"2px 8px",borderRadius:10}}>{t.count}</span></button>)}
      </div>
      {/* Filters */}
      {/* Category filters */}
      {wikiTab==="craft"?
        <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
          <select value={cat} onChange={e=>{setCat(e.target.value);setDisplayCount(50);}} className="wiki-bench-select" style={{ padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+(cat!=="ALL"?G.gold+"60":G.border),background:cat!=="ALL"?G.gold+"08":G.card,color:cat!=="ALL"?G.gold:G.muted,fontSize:13,fontWeight:700,fontFamily:"var(--fb)",cursor:"pointer",outline:"none",minWidth:220 }}>
            <option value="ALL">🔨 Tous les ateliers ({craftableItems.length})</option>
            {CRAFT_BENCHES.map(c=>{const cnt=craftableItems.filter(i=>i.b===c.id).length;return cnt>0?<option key={c.id} value={c.id}>{c.icon} {c.label} ({cnt})</option>:null;})}
          </select>
          {cat!=="ALL"&&<button onClick={()=>{setCat("ALL");setDisplayCount(50);}} style={{padding:"6px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>✕ Réinitialiser</button>}
        </div>
      :
        <div style={{ display:"flex",gap:6,marginBottom:18,flexWrap:"wrap" }}>
          <button onClick={()=>{setCat("ALL");setDisplayCount(50);}} style={{ padding:"7px 16px",borderRadius:20,border:"1px solid "+(cat==="ALL"?G.teal:G.border),background:cat==="ALL"?G.teal+"15":"transparent",color:cat==="ALL"?G.teal:G.muted,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s" }}>Tous</button>
          {activeCats.map(c=><button key={c.id} onClick={()=>{setCat(c.id);setDisplayCount(50);}} style={{ padding:"7px 16px",borderRadius:20,border:"1px solid "+(cat===c.id?c.color:G.border),background:cat===c.id?c.color+"15":"transparent",color:cat===c.id?c.color:G.muted,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.15s" }}><span style={{fontSize:13}}>{c.icon}</span> {c.label}</button>)}
        </div>
      }
      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{ flex:1,minWidth:200,maxWidth:500,padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.card,color:"#f0e6d2",fontSize:14,fontFamily:"var(--fb)",outline:"none" }}/>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ padding:"10px 14px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.card,color:sort!=="name"?G.teal:G.muted,fontSize:12,fontWeight:700,fontFamily:"var(--fb)",cursor:"pointer",outline:"none",appearance:"auto" }}>
          {(SORT_OPTIONS[wikiTab]||[]).map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <button onClick={()=>setShowFilters(!showFilters)} style={{ padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+(showFilters||hasAdvanced?G.teal+60:G.border),background:showFilters||hasAdvanced?G.teal+"12":"transparent",color:showFilters||hasAdvanced?G.teal:G.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:6 }}>
          <span style={{fontSize:14}}>⚙️</span> Filtres{hasAdvanced?" ●":""}
        </button>
      </div>
      {/* Advanced filters panel */}
      {showFilters&&<div style={{ background:G.card,border:"1px solid "+G.border,borderRadius:"var(--radius-md)",padding:16,marginBottom:14 }}>
        {(wikiTab==="items"||wikiTab==="craft")&&<>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8 }}>Qualité</div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
              {ALL_QUALITIES.map(q=>{const qc=QUALITY_COLORS[q]||G.muted;const active=qualities.includes(q);return(
                <button key={q} onClick={()=>toggleQuality(q)} style={{ padding:"4px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+(active?qc:G.border),background:active?qc+"18":"transparent",color:active?qc:G.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)" }}>{q}</button>
              )})}
            </div>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8 }}>Niveau</div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <input type="number" value={lvlMin} onChange={e=>setLvlMin(e.target.value)} placeholder="Min" min={1} max={75} style={{ width:80,padding:"8px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#f0e6d2",fontSize:13,fontFamily:"var(--fb)",outline:"none",textAlign:"center" }}/>
              <span style={{ color:G.muted,fontSize:13 }}>—</span>
              <input type="number" value={lvlMax} onChange={e=>setLvlMax(e.target.value)} placeholder="Max" min={1} max={75} style={{ width:80,padding:"8px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#f0e6d2",fontSize:13,fontFamily:"var(--fb)",outline:"none",textAlign:"center" }}/>
              <span style={{ fontSize:11,color:G.muted }}>(1 – 75)</span>
            </div>
          </div>
        </>}
        {wikiTab!=="items"&&wikiTab!=="craft"&&<div style={{ fontSize:13,color:G.muted }}>Utilisez le tri ci-dessus pour ordonner les résultats.</div>}
        {hasAdvanced&&<button onClick={clearAdvanced} style={{ marginTop:12,padding:"6px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)" }}>✕ Réinitialiser les filtres</button>}
      </div>}
      <div style={{ fontSize:12,color:G.muted,marginBottom:18,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",padding:"8px 14px",background:G.card+"60",borderRadius:"var(--radius-md)",border:"1px solid "+G.border+"40" }}>
        <span>{totalFiltered} résultat{totalFiltered>1?"s":""}</span>
        {sort!=="name"&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.teal+"12",color:G.teal}}>Trié : {(SORT_OPTIONS[wikiTab]||[]).find(o=>o.id===sort)?.label}</span>}
        {qualities.length>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.purple+"12",color:G.purple}}>{qualities.length} qualité{qualities.length>1?"s":""}</span>}
        {(lvlMin||lvlMax)&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.blue+"12",color:G.blue}}>Niv. {lvlMin||"1"}–{lvlMax||"75"}</span>}
      </div>

      {/* ITEMS */}
      {wikiTab==="items"&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
        {filteredItems.slice(0,displayCount).map(r=>{const isOpen=expanded===r.id;const catInfo=ITEM_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"📦"};const qc=QUALITY_COLORS[r.q]||G.muted;return(
          <div key={r.id} className={`wiki-row${isOpen?" wiki-row-open":""}`} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?qc+"40":G.border+"40"),borderLeft:"3px solid "+qc+(isOpen?"":"30"),borderRadius:"var(--radius-md)",cursor:"pointer",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
              <ItemImg id={r.id} fallback={catInfo.icon} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.id)}</div>
                <div style={{display:"flex",gap:8,fontSize:11,color:G.muted,marginTop:3}}><span style={{padding:"1px 6px",borderRadius:3,background:catInfo.color+"10",color:catInfo.color,fontSize:10,fontWeight:600}}>{catInfo.icon} {catInfo.label}</span>{r.sc&&<span style={{padding:"1px 6px",borderRadius:3,background:G.border+"80",color:G.muted,fontSize:10,fontWeight:600}}>{r.sc}</span>}{r.l>0&&<span>Niv. {r.l}</span>}{r.dur>0&&<span>🔧 {r.dur}</span>}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                {sort==="dps"&&itemDPS(r)>0&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#e8653a15",color:"#e8653a",fontWeight:700}}>{itemDPS(r)} DMG</span>}
                {sort==="res"&&itemRes(r)>0&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#4ea8f015",color:"#4ea8f0",fontWeight:700}}>{(itemRes(r)*100).toFixed(0)}% RES</span>}
                {r.q&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:qc+"15",color:qc,fontWeight:700}}>{r.q}</span>}
                {canCompare(r)&&<button onClick={e=>{e.stopPropagation();toggleCompare(r.id);}} title={compareIds.includes(r.id)?"Retirer du comparateur":"Ajouter au comparateur (max 3)"} style={{width:26,height:26,borderRadius:6,border:"1px solid "+(compareIds.includes(r.id)?G.gold:G.border),background:compareIds.includes(r.id)?G.gold+"18":"transparent",color:compareIds.includes(r.id)?G.gold:G.muted,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>⚖️</button>}
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div className="wiki-expanded" style={{padding:"16px 18px 18px",borderTop:"1px solid "+G.border+"60",background:G.bg+"40"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:16}}>
                {r.dmg&&r.dmg.length>0&&<div>
                  <div style={{fontSize:11,fontWeight:800,color:"#e8653a",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>⚔️ Dégâts <span style={{fontSize:10,fontWeight:600,color:G.muted,textTransform:"none",letterSpacing:0}}>({itemDPS(r)} total)</span></div>
                  {r.dmg.map((d,i)=><div key={i} className="wiki-stat-card" style={{background:"#e8653a06",border:"1px solid #e8653a15",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}><span style={{color:G.text}}>{d.a}</span><span style={{fontWeight:800,color:"#e8653a"}}>{d.d} <span style={{fontSize:10,fontWeight:600,opacity:0.7}}>{d.t}</span></span></div>)}
                </div>}
                {r.res&&<div>
                  <div style={{fontSize:11,fontWeight:800,color:"#4ea8f0",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>🛡️ Résistance {r.sl&&<span style={{fontSize:10,fontWeight:600,color:G.muted,textTransform:"none",letterSpacing:0}}>({r.sl})</span>}</div>
                  {Object.entries(r.res).map(([k,v])=><div key={k} className="wiki-stat-card" style={{background:"#4ea8f006",border:"1px solid #4ea8f015",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}><span style={{color:G.text}}>{k}</span><span style={{fontWeight:800,color:"#4ea8f0"}}>{(v*100).toFixed(0)}%</span></div>)}
                  {r.sm&&Object.entries(r.sm).map(([k,v])=><div key={k} className="wiki-stat-card" style={{background:"#51cf6606",border:"1px solid #51cf6615",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}><span style={{color:G.text}}>{k}</span><span style={{fontWeight:800,color:"#51cf66"}}>+{v}</span></div>)}
                  {r.dce&&Object.entries(r.dce).map(([k,v])=><div key={k} className="wiki-stat-card" style={{background:"#f5a62306",border:"1px solid #f5a62315",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}><span style={{color:G.text}}>Bonus {k}</span><span style={{fontWeight:800,color:"#f5a623"}}>+{(v*100).toFixed(0)}%</span></div>)}
                </div>}
                {r.r&&<div>
                  <div style={{fontSize:11,fontWeight:800,color:G.teal,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>🔨 Recette</div>
                  {r.r.map(([id,qty],i)=><div key={i} className="wiki-stat-card" style={{background:G.teal+"06",border:"1px solid "+G.teal+"15",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontSize:12}}><ItemImg id={id} size={20} fallback="" /><span style={{color:G.text,flex:1}}>{fmtItem(id)}</span><span style={{fontWeight:800,color:G.teal,flexShrink:0}}>×{qty}</span></div>)}
                  <div style={{fontSize:11,color:G.muted,marginTop:6,display:"flex",gap:12}}>{r.b&&<span>🔨 {fmtItem(r.b)}</span>}{r.ct>0&&<span>⏱️ {r.ct}s</span>}{r.dur>0&&<span>🔧 {r.dur}</span>}</div>
                </div>}
              </div>
            </div>}
          </div>)})}
        {filteredItems.length>displayCount&&<button onClick={()=>setDisplayCount(c=>c+50)} style={{margin:"16px auto",padding:"12px 32px",borderRadius:20,border:"1px solid "+G.teal+"40",background:G.teal+"08",color:G.teal,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8}}>Charger plus <span style={{fontSize:11,opacity:0.7}}>({displayCount}/{filteredItems.length})</span></button>}
      </div>}

      {/* MOBS */}
      {wikiTab==="mobs"&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
        {filteredMobs.slice(0,displayCount).map((r,idx)=>{
          const isOpen=expanded===r.id;
          const catInfo=MOB_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"❓"};
          const firstLetter=(r.app||r.id||"").charAt(0).toUpperCase();
          const prevLetter=idx>0?(filteredMobs[idx-1].app||filteredMobs[idx-1].id||"").charAt(0).toUpperCase():"";
          const showHeader=sort==="name"&&firstLetter!==prevLetter;
          return(<div key={r.id}>
          {showHeader&&<div style={{
            padding:"var(--sp-1) var(--sp-2)",
            background:"var(--c-card)",
            borderLeft:"3px solid var(--c-teal)",
            fontSize:"var(--text-xs)",
            fontWeight:"var(--fw-black)",
            color:"var(--c-teal)",
            textTransform:"uppercase",
            letterSpacing:2,
            marginBottom:"var(--sp-1)",
            marginTop:idx>0?"var(--sp-2)":"0",
          }}>{firstLetter}</div>}
          <div className={`wiki-row${isOpen?" wiki-row-open":""}`} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?catInfo.color+"40":G.border+"40"),borderLeft:"3px solid "+catInfo.color+(isOpen?"":"30"),borderRadius:"var(--radius-md)",cursor:"pointer",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
              <span style={{fontSize:18,flexShrink:0}}>{catInfo.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.app||r.id)}</div><div style={{fontSize:11,color:G.muted,marginTop:2}}>{r.c}{r.hostile?" · Hostile":""}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={{
                  padding:"3px 8px",borderRadius:"var(--radius-sm)",
                  background:"#ff6b6b15",color:"#ff6b6b",
                  fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"
                }}>❤️ {r.hp}</span>
                {r.hostile&&(
                  <span style={{
                    padding:"3px 8px",borderRadius:"var(--radius-sm)",
                    background:"#f5a62315",color:"#f5a623",
                    fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"
                  }}>Hostile</span>
                )}
                {sort==="dmg"&&mobDmg(r)>0&&<span style={{padding:"3px 8px",borderRadius:"var(--radius-sm)",background:"#e8653a15",color:"#e8653a",fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"}}>⚔️ {mobDmg(r)}</span>}
                {sort==="spd"&&r.spd>0&&<span style={{padding:"3px 8px",borderRadius:"var(--radius-sm)",background:"#3dd8c515",color:"#3dd8c5",fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"}}>💨 {r.spd}</span>}
                {r.drop&&(
                  <span style={{fontSize:"var(--text-xs)",color:"var(--c-muted)"}}>
                    🎁 {fmtItem(r.drop)}
                  </span>
                )}
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div className="wiki-expanded" style={{padding:"16px 18px 18px",borderTop:"1px solid "+G.border+"60",background:G.bg+"40"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:10,marginBottom:r.dmg&&r.dmg.length>0?12:0}}>
                <div className="wiki-stat-card" style={{background:"#ff6b6b06",border:"1px solid #ff6b6b15",borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Vie</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#ff6b6b"}}>{r.hp}</div></div>
                {r.spd>0&&<div className="wiki-stat-card" style={{background:"#3dd8c506",border:"1px solid #3dd8c515",borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Vitesse</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#3dd8c5"}}>{r.spd}</div></div>}
                {r.view>0&&<div className="wiki-stat-card" style={{background:"#f5a62306",border:"1px solid #f5a62315",borderRadius:6,padding:"10px 14px"}}><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Vue</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#f5a623"}}>{r.view}</div></div>}
              </div>
              {r.dmg&&r.dmg.length>0&&<div><div style={{fontSize:11,fontWeight:800,color:"#e8653a",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>⚔️ Dégâts <span style={{fontSize:10,fontWeight:600,color:G.muted,textTransform:"none",letterSpacing:0}}>({mobDmg(r)} total)</span></div>{r.dmg.map((d,i)=><div key={i} className="wiki-stat-card" style={{background:"#e8653a06",border:"1px solid #e8653a15",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12}}><span style={{color:G.text}}>{d.t}</span><span style={{fontWeight:800,color:"#e8653a"}}>{d.d}</span></div>)}</div>}
              {r.drop&&<div style={{fontSize:12,color:G.muted,marginTop:8}}>🎁 Drop: <span style={{color:G.teal,fontWeight:"var(--fw-bold)"}}>{fmtItem(r.drop)}</span></div>}
            </div>}
          </div></div>)})}
        {filteredMobs.length>displayCount&&<button onClick={()=>setDisplayCount(c=>c+50)} style={{margin:"16px auto",padding:"12px 32px",borderRadius:20,border:"1px solid "+G.teal+"40",background:G.teal+"08",color:G.teal,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8}}>Charger plus <span style={{fontSize:11,opacity:0.7}}>({displayCount}/{filteredMobs.length})</span></button>}
      </div>}

      {/* SALVAGE */}
      {wikiTab==="salvage"&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
        {filteredSalvage.slice(0,displayCount).map(r=>{const isOpen=expanded===r.id;const catInfo=SALVAGE_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"📦"};return(
          <div key={r.id} className={`wiki-row${isOpen?" wiki-row-open":""}`} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?catInfo.color+"40":G.border+"40"),borderLeft:"3px solid "+catInfo.color+(isOpen?"":"30"),borderRadius:"var(--radius-md)",cursor:"pointer",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
              <ItemImg id={r.id} fallback={catInfo.icon} />
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{r.n}</div><div style={{fontSize:11,color:G.muted,marginTop:2}}>{fmtItem(r.id)}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:catInfo.color+"12",color:catInfo.color,fontWeight:700}}>{r.c}</span>
                <span style={{fontSize:10,color:G.muted}}>{r.t}s</span>
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div className="wiki-expanded" style={{padding:"16px 18px 18px",borderTop:"1px solid "+G.border+"60",background:G.bg+"40"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:20,alignItems:"flex-start"}}>
                <div><div style={{fontSize:11,fontWeight:800,color:"#ff6b6b",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Entrée</div><div className="wiki-stat-card" style={{background:"#ff6b6b06",border:"1px solid #ff6b6b15",borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}><ItemImg id={r.id} size={24} fallback="" /><div style={{fontSize:13,fontWeight:700,color:"#ff6b6b"}}>1× {fmtItem(r.id)}</div></div></div>
                <div style={{paddingTop:36,fontSize:22,color:G.teal}}>→</div>
                <div><div style={{fontSize:11,fontWeight:800,color:G.teal,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Sorties</div>{r.o.map(([item,qty],i)=><div key={i} className="wiki-stat-card" style={{background:G.teal+"06",border:"1px solid "+G.teal+"15",borderRadius:6,padding:"6px 12px",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontSize:12}}><ItemImg id={item} size={20} fallback="" /><span style={{color:G.text,flex:1}}>{fmtItem(item)}</span><span style={{fontWeight:800,color:G.teal,flexShrink:0}}>×{qty}</span></div>)}</div>
              </div>
              <div style={{marginTop:10,fontSize:11,color:G.muted,display:"flex",gap:12}}>🔨 {fmtItem(r.b)} <span>⏱️ {r.t}s</span></div>
            </div>}
          </div>)})}
        {filteredSalvage.length>displayCount&&<button onClick={()=>setDisplayCount(c=>c+50)} style={{margin:"16px auto",padding:"12px 32px",borderRadius:20,border:"1px solid "+G.teal+"40",background:G.teal+"08",color:G.teal,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8}}>Charger plus <span style={{fontSize:11,opacity:0.7}}>({displayCount}/{filteredSalvage.length})</span></button>}
      </div>}

      {/* CRAFT */}
      {wikiTab==="craft"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
        {/* Calculator toggle */}
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
          <button onClick={()=>setCalcOpen(!calcOpen)} style={{padding:"10px 18px",borderRadius:"var(--radius-md)",border:"1px solid "+(calcOpen||calcItems.length>0?G.gold:G.border),background:calcOpen?G.gold+"15":"transparent",color:calcOpen||calcItems.length>0?G.gold:G.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🧮</span> Calculateur{calcItems.length>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:G.gold+"20",color:G.gold,fontWeight:800}}>{calcItems.length}</span>}
          </button>
          {calcItems.length>0&&!calcOpen&&<span style={{fontSize:11,color:G.muted}}>{calcTotalMats.length} matériaux · {calcItems.reduce((s,c)=>s+c.qty,0)} items</span>}
        </div>
        {/* Calculator panel */}
        {calcOpen&&<div style={{background:G.card,border:"1px solid "+G.gold+"30",borderLeft:"3px solid "+G.gold,borderRadius:"var(--radius-md)",padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800,color:G.gold,fontFamily:"var(--fd)"}}>🧮 Calculateur de ressources</div>
            {calcItems.length>0&&<button onClick={()=>setCalcItems([])} style={{padding:"4px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)"}}>✕ Vider</button>}
          </div>
          {/* Search to add items */}
          <div style={{position:"relative",marginBottom:12}}>
            <input value={calcSearch} onChange={e=>setCalcSearch(e.target.value)} placeholder="Ajouter un item à crafter..." style={{width:"100%",padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#f0e6d2",fontSize:13,fontFamily:"var(--fb)",outline:"none",boxSizing:"border-box"}}/>
            {calcSearchResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:20,background:G.card,border:"1px solid "+G.border,borderRadius:"0 0 8px 8px",maxHeight:240,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              {calcSearchResults.map(r=>{const qc=QUALITY_COLORS[r.q]||G.muted;return(
                <div key={r.id} onClick={()=>{addToCalc(r.id);setCalcSearch("");}} style={{padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid "+G.border+"40",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=G.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <ItemImg id={r.id} size={22} fallback="📦" />
                  <span style={{fontSize:12,color:G.text,flex:1}}>{fmtItem(r.id)}</span>
                  {r.l>0&&<span style={{fontSize:10,color:G.muted}}>Niv.{r.l}</span>}
                  {r.q&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:qc+"15",color:qc,fontWeight:700}}>{r.q}</span>}
                  <span style={{fontSize:12,color:G.teal,fontWeight:700}}>+ Ajouter</span>
                </div>
              )})}
            </div>}
          </div>
          {/* Selected items */}
          {calcItems.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:G.muted,fontSize:13}}>Aucun item sélectionné. Recherche ci-dessus ou clique ＋ sur un item de la liste.</div>}
          {calcItems.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Items à crafter ({calcItems.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {calcItems.map(c=>{const item=ITEM_MAP[c.id];const qc=QUALITY_COLORS[item?.q]||G.muted;return(
                  <div key={c.id} style={{background:G.bg+"80",border:"1px solid "+G.border,borderRadius:4,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
                    <ItemImg id={c.id} size={22} fallback="📦" />
                    <span style={{fontSize:12,color:G.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtItem(c.id)}</span>
                    {item?.q&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:qc+"15",color:qc,fontWeight:700,flexShrink:0}}>{item.q}</span>}
                    <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <button onClick={()=>setCalcQty(c.id,c.qty-1)} style={{width:22,height:22,borderRadius:4,border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                      <span style={{fontSize:13,fontWeight:800,color:G.gold,minWidth:20,textAlign:"center"}}>{c.qty}</span>
                      <button onClick={()=>setCalcQty(c.id,c.qty+1)} style={{width:22,height:22,borderRadius:4,border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                    </div>
                    <button onClick={()=>removeFromCalc(c.id)} style={{width:22,height:22,borderRadius:4,border:"1px solid "+G.border+"60",background:"transparent",color:"#ff6b6b",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>✕</button>
                  </div>
                )})}
              </div>
            </div>
            <div>
              {calcIntermediates.length>0&&<>
              <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🔨 Crafts intermédiaires ({calcIntermediates.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:200,overflowY:"auto",marginBottom:14}}>
                {calcIntermediates.map(m=>(
                  <div key={m.id} style={{background:G.teal+"08",border:"1px solid "+G.teal+"18",borderRadius:4,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                    <ItemImg id={m.id} size={20} fallback="" />
                    <span style={{color:G.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtItem(m.id)}</span>
                    {m.bench&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:G.teal+"15",color:G.teal,fontWeight:700,flexShrink:0}}>🔨 {fmtItem(m.bench)}</span>}
                    <span style={{fontWeight:800,color:G.teal,flexShrink:0}}>×{m.qty}</span>
                  </div>
                ))}
              </div>
              </>}
              <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>📦 Total matériaux bruts ({calcTotalMats.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:300,overflowY:"auto"}}>
                {calcTotalMats.map(m=>(
                  <div key={m.id} style={{background:"#f5a62308",border:"1px solid #f5a62318",borderRadius:4,padding:"5px 10px",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                    <ItemImg id={m.id} size={20} fallback="" />
                    <span style={{color:G.text,flex:1}}>{fmtItem(m.id)}</span>
                    <span style={{fontWeight:800,color:"#f5a623",flexShrink:0}}>×{m.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>}
        </div>}
        {filteredCraft.slice(0,displayCount).map(r=>{const isOpen=expanded===r.id;const qc=QUALITY_COLORS[r.q]||G.muted;const benchInfo=CRAFT_BENCHES.find(b=>b.id===r.b)||{icon:"📋",color:G.muted,label:r.b||"?"};
        // Build recipe tree for expanded view
        const renderTree = (itemId, qty, depth, seen) => {
          if (!seen) seen = new Set();
          const item = ITEM_MAP[itemId];
          const hasSub = item && item.r && item.r.length>0 && !seen.has(itemId);
          const isRaw = !hasSub;
          if (hasSub) seen.add(itemId);
          return (
            <div key={itemId+"-"+depth} style={{marginLeft:depth*20,marginTop:depth>0?4:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {depth>0&&<span style={{color:G.border,fontSize:12,flexShrink:0}}>└─</span>}
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:4,background:isRaw?"#f5a62308":G.teal+"08",border:"1px solid "+(isRaw?"#f5a62318":G.teal+"18"),flex:1,minWidth:0}}>
                  <span style={{fontSize:12,fontWeight:800,color:isRaw?"#f5a623":G.teal,flexShrink:0}}>×{qty}</span>
                  <ItemImg id={itemId} size={20} fallback="" />
                  <span style={{fontSize:12,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtItem(itemId)}</span>
                  {isRaw&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"#f5a62315",color:"#f5a623",fontWeight:700,flexShrink:0}}>Matériau</span>}
                  {hasSub&&item.b&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:G.teal+"15",color:G.teal,fontWeight:700,flexShrink:0}}>🔨 {fmtItem(item.b)}</span>}
                </div>
              </div>
              {hasSub&&item.r.map(([subId,subQty])=>renderTree(subId,subQty*qty,depth+1,new Set(seen)))}
            </div>
          );
        };
        // Compute flat raw materials
        const rawMats = isOpen ? flattenRecipe(r.id, 1, new Set()) : [];
        return(
          <div key={r.id} className={`wiki-row${isOpen?" wiki-row-open":""}`} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?benchInfo.color+"40":G.border+"40"),borderLeft:"3px solid "+benchInfo.color+(isOpen?"":"30"),borderRadius:"var(--radius-md)",cursor:"pointer",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
              <ItemImg id={r.id} fallback={benchInfo.icon} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.id)}{r.oq>1&&<span style={{fontSize:11,fontWeight:800,color:G.gold,marginLeft:6}}>×{r.oq}</span>}</div>
                <div style={{display:"flex",gap:6,fontSize:11,color:G.muted,marginTop:2}}>
                  {r.l>0&&<span>Niv. {r.l}</span>}
                  <span>{r.r.length} ingrédient{r.r.length>1?"s":""}</span>
                  {r.ct>0&&<span>⏱️ {r.ct}s</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                {r.q&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:qc+"15",color:qc,fontWeight:700}}>{r.q}</span>}
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:benchInfo.color+"12",color:benchInfo.color,fontWeight:700}}>{benchInfo.label}</span>
                <button onClick={e=>{e.stopPropagation();addToCalc(r.id);}} title="Ajouter au calculateur" style={{width:24,height:24,borderRadius:4,border:"1px solid "+(calcItems.find(c=>c.id===r.id)?G.gold:G.border),background:calcItems.find(c=>c.id===r.id)?G.gold+"18":"transparent",color:calcItems.find(c=>c.id===r.id)?G.gold:G.muted,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0,lineHeight:1}}>+</button>
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div className="wiki-expanded" onClick={e=>e.stopPropagation()} style={{padding:"16px 18px 18px",borderTop:"1px solid "+G.border+"60",background:G.bg+"40"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16,marginTop:12}}>
                {/* Left: Recipe tree */}
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🌳 Arbre de craft</div>
                  <div style={{background:G.bg+"80",border:"1px solid "+G.border,borderRadius:"var(--radius-md)",padding:10}}>
                    {r.r.map(([ingId,ingQty])=>renderTree(ingId,ingQty,0,new Set([r.id])))}
                  </div>
                  <div style={{marginTop:8,fontSize:11,color:G.muted}}>🔨 {fmtItem(r.b)}{r.ct>0&&<span> · ⏱️ {r.ct}s</span>}{r.dur>0&&<span> · 🔧 {r.dur}</span>}{r.oq>1&&<span style={{color:G.gold,fontWeight:700}}> · 📦 Produit ×{r.oq}</span>}</div>
                </div>
                {/* Right: Total raw materials */}
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>📦 Matériaux bruts totaux</div>
                  <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {rawMats.sort((a,b)=>b.qty-a.qty).map(m=>(
                      <div key={m.id} style={{background:"#f5a62308",border:"1px solid #f5a62318",borderRadius:4,padding:"4px 10px",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                        <ItemImg id={m.id} size={20} fallback="" />
                        <span style={{color:G.text,flex:1}}>{fmtItem(m.id)}</span>
                        <span style={{fontWeight:800,color:"#f5a623",flexShrink:0}}>×{m.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>}
          </div>
        )})}
        {filteredCraft.length>displayCount&&<button onClick={()=>setDisplayCount(c=>c+50)} style={{margin:"16px auto",padding:"12px 32px",borderRadius:20,border:"1px solid "+G.teal+"40",background:G.teal+"08",color:G.teal,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:8}}>Charger plus <span style={{fontSize:11,opacity:0.7}}>({displayCount}/{filteredCraft.length})</span></button>}
      </div>}

      {totalFiltered===0&&<div style={{textAlign:"center",padding:40,color:G.muted,fontSize:14}}>Aucun résultat.</div>}

      {/* COMPARATOR — sticky bar */}
      {compareIds.length>0&&!compareOpen&&<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"linear-gradient(180deg,transparent,"+G.bg+" 20%)",padding:"20px 24px 16px",display:"flex",justifyContent:"center"}}>
        <div style={{background:G.card,border:"1px solid "+G.gold+"40",borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 -4px 30px rgba(0,0,0,0.5)",maxWidth:800,width:"100%"}}>
          <span style={{fontSize:14}}>⚖️</span>
          <div style={{display:"flex",gap:8,flex:1,overflow:"auto"}}>
            {compareItems2.map(r=>{const qc=QUALITY_COLORS[r.q]||G.muted;return(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,background:qc+"10",border:"1px solid "+qc+"30",fontSize:12,fontWeight:600,color:G.text,flexShrink:0}}>
                <ItemImg id={r.id} size={20} fallback={r.c==="Weapon"?"🗡️":"🛡️"} />
                <span style={{maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmtItem(r.id)}</span>
                <button onClick={()=>toggleCompare(r.id)} style={{width:18,height:18,borderRadius:4,border:"none",background:"transparent",color:"#ff6b6b",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
              </div>
            )})}
          </div>
          <span style={{fontSize:11,color:G.muted,flexShrink:0}}>{compareIds.length}/3</span>
          <button onClick={()=>setCompareOpen(true)} disabled={compareIds.length<2} style={{padding:"8px 20px",borderRadius:8,border:"none",background:compareIds.length>=2?"linear-gradient(135deg,"+G.gold+","+G.goldD+")":G.border,color:compareIds.length>=2?G.bg:G.muted,fontWeight:800,fontSize:13,cursor:compareIds.length>=2?"pointer":"not-allowed",fontFamily:"var(--fb)",flexShrink:0}}>Comparer</button>
          <button onClick={()=>setCompareIds([])} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"var(--fb)",flexShrink:0}}>Vider</button>
        </div>
      </div>}

      {/* COMPARATOR — full panel overlay */}
      {compareOpen&&compareItems2.length>=2&&<div style={{position:"fixed",inset:0,zIndex:100,background:G.bg+"f0",backdropFilter:"blur(8px)",overflowY:"auto"}} onClick={()=>setCompareOpen(false)}>
        <div style={{maxWidth:1000,margin:"80px auto 40px",padding:"0 24px"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:G.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Comparateur</div>
              <h2 style={{fontSize:28,fontWeight:900,color:"#f0e6d2",fontFamily:"var(--fd)",margin:0}}>{compareItems2[0].c==="Weapon"?"Armes":"Armures"}</h2>
            </div>
            <button onClick={()=>setCompareOpen(false)} style={{width:40,height:40,borderRadius:10,border:"1px solid "+G.border,background:G.card,color:G.muted,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>

          {/* Compare table */}
          {(()=>{
            const items = compareItems2;
            const isWeapon = items[0].c==="Weapon";
            // Collect all stat keys
            const allResKeys = [...new Set(items.flatMap(i=>i.res?Object.keys(i.res):[]))];
            const allSmKeys = [...new Set(items.flatMap(i=>i.sm?Object.keys(i.sm):[]))];
            const allDceKeys = [...new Set(items.flatMap(i=>i.dce?Object.keys(i.dce):[]))];
            const allDmgActions = [...new Set(items.flatMap(i=>i.dmg?i.dmg.map(d=>d.a):[]))];

            const bestOf = (vals, higher=true) => {
              const nums = vals.map(v=>typeof v==="number"?v:0);
              const best = higher ? Math.max(...nums) : Math.min(...nums);
              return nums.map(n=>n===best&&n>0);
            };

            const Row = ({label,vals,color,fmt,higher=true,icon}) => {
              const bests = bestOf(vals,higher);
              return <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                <div style={{background:G.card,padding:"8px 14px",fontSize:12,color:G.muted,display:"flex",alignItems:"center",gap:6}}>{icon&&<span style={{fontSize:12}}>{icon}</span>}{label}</div>
                {vals.map((v,i)=><div key={i} style={{background:G.card,padding:"8px 14px",textAlign:"center",fontSize:13,fontWeight:bests[i]?800:500,color:bests[i]?color||G.teal:v?G.text:G.muted+"60"}}>{v?(fmt?fmt(v):v):"—"}</div>)}
              </div>;
            };

            return <div style={{borderRadius:12,overflow:"hidden",border:"1px solid "+G.border,background:G.border+"30"}}>
              {/* Header row */}
              <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                <div style={{background:G.bg,padding:"14px"}}></div>
                {items.map(r=>{const qc=QUALITY_COLORS[r.q]||G.muted;return(
                  <div key={r.id} style={{background:G.bg,padding:"14px",textAlign:"center"}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><ItemImg id={r.id} size={32} fallback={isWeapon?"🗡️":"🛡️"} /></div>
                    <div style={{fontSize:13,fontWeight:800,color:"#f0e6d2",fontFamily:"var(--fd)",marginBottom:4}}>{fmtItem(r.id)}</div>
                    <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
                      {r.q&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:qc+"15",color:qc,fontWeight:700}}>{r.q}</span>}
                      {r.sc&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:G.border,color:G.muted,fontWeight:600}}>{r.sc}</span>}
                    </div>
                  </div>
                )})}
              </div>

              {/* General stats */}
              <Row label="Niveau" vals={items.map(i=>i.l||0)} color={G.blue} icon="📊" />
              <Row label="Durabilité" vals={items.map(i=>i.dur||0)} color="#51cf66" icon="🔧" />
              {!isWeapon&&<Row label="Slot" vals={items.map(i=>i.sl||"—")} color={G.muted} icon="👕" />}

              {/* Weapon: DPS */}
              {isWeapon&&<>
                <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                  <div style={{background:G.bg2,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#e8653a",textTransform:"uppercase",letterSpacing:1.5}}>⚔️ Dégâts</div>
                  {items.map(r=><div key={r.id} style={{background:G.bg2,padding:"8px 14px"}}></div>)}
                </div>
                <Row label="DPS Total" vals={items.map(i=>itemDPS(i))} color="#e8653a" icon="💥" fmt={v=>""+v} />
                {allDmgActions.map(action=><Row key={action} label={action} vals={items.map(i=>{const d=i.dmg?.find(x=>x.a===action);return d?d.d:0;})} color="#e8653a" />)}
              </>}

              {/* Armor: Resistances */}
              {allResKeys.length>0&&<>
                <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                  <div style={{background:G.bg2,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#4ea8f0",textTransform:"uppercase",letterSpacing:1.5}}>🛡️ Résistances</div>
                  {items.map(r=><div key={r.id} style={{background:G.bg2,padding:"8px 14px"}}></div>)}
                </div>
                {!isWeapon&&<Row label="Rés. Totale" vals={items.map(i=>itemRes(i))} color="#4ea8f0" icon="🛡️" fmt={v=>(v*100).toFixed(1)+"%"} />}
                {allResKeys.map(k=><Row key={k} label={k} vals={items.map(i=>i.res?.[k]||0)} color="#4ea8f0" fmt={v=>(v*100).toFixed(1)+"%"} />)}
              </>}

              {/* Stat modifiers */}
              {allSmKeys.length>0&&<>
                <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                  <div style={{background:G.bg2,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#51cf66",textTransform:"uppercase",letterSpacing:1.5}}>📈 Bonus Stats</div>
                  {items.map(r=><div key={r.id} style={{background:G.bg2,padding:"8px 14px"}}></div>)}
                </div>
                {allSmKeys.map(k=><Row key={k} label={k} vals={items.map(i=>i.sm?.[k]||0)} color="#51cf66" fmt={v=>"+"+v} />)}
              </>}

              {/* Damage Class Enhancement */}
              {allDceKeys.length>0&&<>
                <div style={{display:"grid",gridTemplateColumns:"200px repeat("+items.length+", 1fr)",gap:1,background:G.border+"30"}}>
                  <div style={{background:G.bg2,padding:"8px 14px",fontSize:11,fontWeight:800,color:"#f5a623",textTransform:"uppercase",letterSpacing:1.5}}>⚡ Bonus Dégâts</div>
                  {items.map(r=><div key={r.id} style={{background:G.bg2,padding:"8px 14px"}}></div>)}
                </div>
                {allDceKeys.map(k=><Row key={k} label={"Bonus "+k} vals={items.map(i=>i.dce?.[k]||0)} color="#f5a623" fmt={v=>"+"+(v*100).toFixed(0)+"%"} />)}
              </>}
            </div>;
          })()}
        </div>
      </div>}
    </div>
  );
}

function BuildsPage({ importCode, onClearImportCode, onPublishToCommunity }) {
  return (
    <div style={{ position: "relative", zIndex: 1, paddingTop: 72 }}>
      <BuildCreator initialCode={importCode} onClearInitialCode={onClearImportCode} onPublishToCommunity={onPublishToCommunity} />
    </div>
  );
}

function MapPage() {
  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{
        display: "inline-block", padding: "4px 16px", borderRadius: "var(--radius-sm)",
        background: `${G.teal}10`, border: `1px solid ${G.teal}20`,
        fontSize: "var(--text-xs)", fontWeight: "var(--fw-black)", color: G.teal,
        textTransform: "uppercase", letterSpacing: 2, marginBottom: 12,
      }}>
        Exploration
      </div>
      <h1 style={{
        fontSize: 38, fontWeight: "var(--fw-black)", color: "#f0e6d2",
        fontFamily: "var(--fd)", margin: "0 0 8px", letterSpacing: 1,
      }}>
        🗺️ Carte du monde
      </h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>
        Explore la carte interactive de CielDeVignis — donjons, biomes, points d'intérêt.
      </p>
      <div style={{
        background: G.card, border: `1px solid ${G.border}`,
        borderRadius: "var(--radius-lg)", overflow: "hidden",
        boxShadow: `0 8px 32px ${G.teal}08`,
      }}>
        <iframe
          src="https://voxl.gg/map/eb48e335930b468ca6d90ad646be808b"
          width="100%"
          height="600px"
          frameBorder="0"
          style={{ display: "block", border: "none", borderRadius: "var(--radius-lg)" }}
          title="Carte CielDeVignis"
          allowFullScreen
        />
      </div>
      <div style={{
        marginTop: "var(--sp-2)", padding: "var(--sp-2)",
        background: `${G.teal}08`, border: `1px solid ${G.teal}18`,
        borderRadius: "var(--radius-md)", borderLeft: `3px solid ${G.teal}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-bold)", color: G.teal }}>
            Navigation
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: G.muted, marginTop: 2 }}>
            Utilise la molette pour zoomer, clic-glisser pour te déplacer. Clique sur un marqueur pour voir les détails.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// REMPLACEMENT DE DungeonsPage — Carte enchantée
// ═══════════════════════════════════════════════════
// À coller dans Site.jsx en remplacement des lignes 1425-1670
// (l'ancienne function DungeonsPage() entière)
//
// Aucun changement d'import nécessaire : G, DUNGEONS, DUNGEON_TIERS
// sont déjà importés en haut de Site.jsx.
//
// À la fin du fichier, l'export existant reste inchangé :
//   export { ..., DungeonsPage, ... };
// DungeonDetails est un sous-composant interne, pas besoin de l'exporter.
// ═══════════════════════════════════════════════════

// ─── Coordonnées des donjons sur la carte (viewBox 1000x620) ───
// Tu pourras ajuster ces positions après premier rendu Vercel.
const DUNGEON_COORDS = {
  frozen_dungeon:      { x: 180, y: 120 },  // NW — montagnes gelées
  shivas_ice_cave:     { x: 440, y: 95  },  // N — falaises glacées
  tower_of_shiva:      { x: 760, y: 115 },  // NE — pics sacrés
  golem_void:          { x: 880, y: 240 },  // E lointain — faille du Vide
  overgrown_ruins:     { x: 185, y: 310 },  // O — forêt envahissante
  major_d01:           { x: 360, y: 260 },  // Centre-O — plaines / Silvermoon
  major_d02:           { x: 500, y: 380 },  // Centre — ruines de Katherina
  forbidden_labyrinth: { x: 690, y: 270 },  // E — dédale oriental
  swamp_dungeon:       { x: 720, y: 455 },  // SE — marécage
  major_d03:           { x: 430, y: 500 },  // S — forteresse du Baron
  reliquary:           { x: 170, y: 495 },  // SO lointain — sanctuaire scellé
};

// ─── Sentiers entre donjons (progression narrative) ───
const DUNGEON_PATHS = [
  ["overgrown_ruins", "major_d01"],
  ["major_d01", "shivas_ice_cave"],
  ["shivas_ice_cave", "frozen_dungeon"],
  ["major_d01", "major_d02"],
  ["major_d02", "swamp_dungeon"],
  ["major_d02", "tower_of_shiva"],
  ["swamp_dungeon", "forbidden_labyrinth"],
  ["tower_of_shiva", "golem_void"],
  ["forbidden_labyrinth", "golem_void"],
  ["major_d02", "major_d03"],
  ["major_d03", "reliquary"],
];

// Pré-calcul des courbes (évite de recalculer à chaque render)
const DUNGEON_PATH_CURVES = DUNGEON_PATHS.map(([a, b]) => {
  const pa = DUNGEON_COORDS[a], pb = DUNGEON_COORDS[b];
  if (!pa || !pb) return null;
  const mx = (pa.x + pb.x) / 2;
  const my = (pa.y + pb.y) / 2 - Math.abs(pb.x - pa.x) * 0.12;
  return `M ${pa.x} ${pa.y} Q ${mx} ${my} ${pb.x} ${pb.y}`;
}).filter(Boolean);

// ─── Tailles de marqueur par tier ───
const TIER_RING = { beginner: 12, intermediate: 13, advanced: 14, endgame: 15 };
const TIER_AURA = { beginner: 0,  intermediate: 0,  advanced: 20, endgame: 24 };

// ═══════════════════════════════════════════════════
// DUNGEONS PAGE
// ═══════════════════════════════════════════════════
function DungeonsPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [filterTier, setFilterTier] = useState(null);

  const selected = selectedId ? DUNGEONS.find(d => d.id === selectedId) : null;
  const fmtAug = (id) => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const tierMeta = (tid) => DUNGEON_TIERS.find(t => t.id === tid) || {};

  const toggleTier = (id) => setFilterTier(filterTier === id ? null : id);
  const isDimmed = (d) => filterTier && d.tier !== filterTier;

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: G.gold + "10", border: "1px solid " + G.gold + "20", fontSize: 11, fontWeight: 800, color: G.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
        Carte du royaume
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "0 0 8px", letterSpacing: 1 }}>
        Donjons
      </h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>
        {DUNGEONS.length} donjons · {DUNGEON_TIERS.length} tiers · Progression Niv. 5 → 80+
      </p>

      {/* Tier legend / filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {DUNGEON_TIERS.map(t => {
          const count = DUNGEONS.filter(d => d.tier === t.id).length;
          const active = filterTier === t.id;
          const inactive = filterTier && !active;
          return (
            <button key={t.id} onClick={() => toggleTier(t.id)} style={{
              padding: "7px 13px", borderRadius: "var(--radius-md)",
              border: "1.5px solid " + (active ? t.color : t.color + "35"),
              background: active ? t.color + "20" : "transparent",
              color: inactive ? G.muted : t.color,
              opacity: inactive ? 0.55 : 1,
              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--fb)",
              display: "flex", alignItems: "center", gap: 6, letterSpacing: 0.3,
              transition: "all 0.15s",
            }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: t.color, display: "inline-block" }}></span>
              {t.label} · {count}
            </button>
          );
        })}
        {filterTier && (
          <button onClick={() => setFilterTier(null)} style={{
            padding: "7px 13px", borderRadius: "var(--radius-md)",
            border: "1.5px solid " + G.border, background: "transparent",
            color: G.muted, fontWeight: 600, fontSize: 12, cursor: "pointer",
            fontFamily: "var(--fb)", letterSpacing: 0.3,
          }}>Réinitialiser</button>
        )}
      </div>

      {/* Carte + panneau détails */}
      <div className="cdv-map-grid">
        {/* --- Carte SVG --- */}
        <div className="cdv-map-frame">
          <svg className="cdv-map-svg" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cdvParchDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.5" fill="#3a2e1d" opacity="0.5"/>
              </pattern>
            </defs>

            {/* Parchemin */}
            <rect width="1000" height="620" fill="#1c170f"/>
            <rect width="1000" height="620" fill="url(#cdvParchDots)"/>

            {/* Cadre décoratif */}
            <rect x="10" y="10" width="980" height="600" fill="none" stroke="#3a2e1d" strokeWidth="1"/>
            <rect x="16" y="16" width="968" height="588" fill="none" stroke="#e8a537" strokeWidth="0.6" opacity="0.4"/>

            {/* Flourishes de coins */}
            <g stroke="#e8a537" strokeWidth="0.9" fill="none" opacity="0.6">
              <path d="M 30 30 L 30 60 M 30 30 L 60 30 M 30 30 Q 42 42 52 40 M 30 30 Q 42 42 40 52"/>
              <path d="M 970 30 L 970 60 M 970 30 L 940 30 M 970 30 Q 958 42 948 40 M 970 30 Q 958 42 960 52"/>
              <path d="M 30 590 L 30 560 M 30 590 L 60 590 M 30 590 Q 42 578 52 580 M 30 590 Q 42 578 40 568"/>
              <path d="M 970 590 L 970 560 M 970 590 L 940 590 M 970 590 Q 958 578 948 580 M 970 590 Q 958 578 960 568"/>
            </g>

            {/* Biomes */}
            <ellipse cx="500" cy="80"  rx="450" ry="55"  fill="#2a3640" opacity="0.35"/>  {/* Montagnes N */}
            <ellipse cx="200" cy="290" rx="160" ry="130" fill="#232a1a" opacity="0.55"/> {/* Forêt O */}
            <ellipse cx="460" cy="325" rx="230" ry="80"  fill="#2a2418" opacity="0.3"/>  {/* Plaines */}
            <ellipse cx="710" cy="260" rx="180" ry="110" fill="#2a241a" opacity="0.4"/>  {/* Plateau E */}
            <ellipse cx="720" cy="455" rx="140" ry="85"  fill="#1a2820" opacity="0.5"/>  {/* Marécage SE */}
            <ellipse cx="885" cy="240" rx="80"  ry="80"  fill="#2a1838" opacity="0.55"/> {/* Faille Vide */}
            <ellipse cx="430" cy="495" rx="210" ry="80"  fill="#2a1812" opacity="0.45"/> {/* Forteresse S */}
            <ellipse cx="170" cy="490" rx="130" ry="85"  fill="#1f1a14" opacity="0.4"/>  {/* Pierre SO */}

            {/* Montagnes (détails ligne) */}
            <g fill="none" stroke="#8aa0b0" strokeWidth="0.9" opacity="0.55">
              <path d="M 80 95 L 105 62 L 128 92 M 150 98 L 180 58 L 210 95 M 240 92 L 270 62 L 298 94 M 330 98 L 362 56 L 392 96 L 412 78 L 438 98 M 470 92 L 500 54 L 530 94 M 560 96 L 592 62 L 622 92 M 658 98 L 692 62 L 725 96 L 748 78 L 775 98 M 810 94 L 840 60 L 870 96 M 890 98 L 915 68 L 940 96"/>
            </g>

            {/* Forêt (points d'arbres) */}
            <g fill="#4a5236" opacity="0.6">
              <circle cx="140" cy="240" r="3"/><circle cx="165" cy="255" r="3.5"/><circle cx="185" cy="235" r="3"/>
              <circle cx="210" cy="260" r="3"/><circle cx="230" cy="240" r="3.5"/><circle cx="255" cy="255" r="3"/>
              <circle cx="155" cy="285" r="3"/><circle cx="195" cy="305" r="3.5"/><circle cx="240" cy="300" r="3"/>
              <circle cx="180" cy="340" r="3"/><circle cx="270" cy="285" r="3"/><circle cx="125" cy="260" r="3"/>
              <circle cx="280" cy="310" r="3"/><circle cx="295" cy="270" r="2.5"/>
              <circle cx="140" cy="360" r="3"/><circle cx="220" cy="355" r="3"/>
            </g>

            {/* Marécage (vagues) */}
            <g stroke="#4a6c5a" strokeWidth="0.8" fill="none" opacity="0.55">
              <path d="M 630 430 Q 650 436 670 430 T 710 430 T 750 430 T 790 430"/>
              <path d="M 640 455 Q 660 461 680 455 T 720 455 T 760 455 T 800 455"/>
              <path d="M 650 480 Q 670 486 690 480 T 730 480 T 770 480"/>
            </g>

            {/* Faille du Vide (aura violette) */}
            <g opacity="0.4">
              <circle cx="885" cy="240" r="40" fill="#845ef7" opacity="0.2"/>
              <circle cx="885" cy="240" r="24" fill="#6c5ce7" opacity="0.35"/>
            </g>

            {/* Forteresse (créneaux S) */}
            <g fill="#8a2a20" opacity="0.5">
              <rect x="395" y="475" width="6" height="14"/>
              <rect x="410" y="470" width="6" height="19"/>
              <rect x="425" y="475" width="6" height="14"/>
              <rect x="445" y="480" width="5" height="12"/>
              <rect x="465" y="478" width="5" height="13"/>
            </g>

            {/* Porte scellée (SO) */}
            <g stroke="#8a7a5c" strokeWidth="0.7" fill="none" opacity="0.5">
              <rect x="155" y="475" width="30" height="38" rx="2"/>
              <line x1="170" y1="478" x2="170" y2="510"/>
            </g>

            {/* Sentiers (routes dorées pointillées) */}
            <g stroke="#e8a537" strokeWidth="1" fill="none" strokeDasharray="3 4" opacity="0.4">
              {DUNGEON_PATH_CURVES.map((d, i) => <path key={i} d={d}/>)}
            </g>

            {/* Rose des vents */}
            <g transform="translate(910, 560)">
              <circle r="32" fill="#1c170f" stroke="#e8a537" strokeWidth="0.7" opacity="0.75"/>
              <circle r="23" fill="none" stroke="#e8a537" strokeWidth="0.4" opacity="0.4"/>
              <path d="M 0 -28 L 3 0 L 0 28 L -3 0 Z" fill="#e8a537" opacity="0.85"/>
              <path d="M -28 0 L 0 3 L 28 0 L 0 -3 Z" fill="#e8a537" opacity="0.55"/>
              <text y="-34" textAnchor="middle" fontSize="11" fill="#e8a537" fontFamily="var(--fd), serif">N</text>
              <text y="42"  textAnchor="middle" fontSize="11" fill="#e8a537" fontFamily="var(--fd), serif">S</text>
              <text x="-37" y="4" textAnchor="middle" fontSize="11" fill="#e8a537" fontFamily="var(--fd), serif">O</text>
              <text x="37"  y="4" textAnchor="middle" fontSize="11" fill="#e8a537" fontFamily="var(--fd), serif">E</text>
            </g>

            {/* Échelle */}
            <g transform="translate(50, 590)">
              <line x1="0" y1="0" x2="100" y2="0" stroke="#e8a537" strokeWidth="1" opacity="0.6"/>
              <line x1="0"   y1="-4" x2="0"   y2="4" stroke="#e8a537" strokeWidth="1" opacity="0.6"/>
              <line x1="50"  y1="-4" x2="50"  y2="4" stroke="#e8a537" strokeWidth="1" opacity="0.6"/>
              <line x1="100" y1="-4" x2="100" y2="4" stroke="#e8a537" strokeWidth="1" opacity="0.6"/>
              <text x="50" y="16" textAnchor="middle" fontSize="10" fill="#8a7a5c" fontFamily="var(--fd), serif" letterSpacing="0.15em">50 LIEUES</text>
            </g>

            {/* Marqueurs de donjons */}
            {DUNGEONS.map(d => {
              const c = DUNGEON_COORDS[d.id];
              if (!c) return null;
              const tm = tierMeta(d.tier);
              const tc = tm.color || G.gold;
              const isSelected = selectedId === d.id;
              const isHover = hoveredId === d.id;
              const dim = isDimmed(d);
              const ringR = TIER_RING[d.tier] || 12;
              const auraR = TIER_AURA[d.tier] || 0;
              return (
                <g key={d.id} transform={`translate(${c.x}, ${c.y})`}
                   onClick={() => setSelectedId(d.id)}
                   onMouseEnter={() => setHoveredId(d.id)}
                   onMouseLeave={() => setHoveredId(null)}
                   style={{ cursor: "pointer", opacity: dim ? 0.3 : 1, transition: "opacity 0.15s" }}>
                  {auraR > 0 && (
                    <circle r={auraR} fill={tc} opacity={isSelected ? 0.28 : 0.14}
                            style={{ transition: "opacity 0.15s" }}/>
                  )}
                  <circle r={ringR} fill="#1c170f"
                          stroke={isSelected ? G.goldL : tc}
                          strokeWidth={isSelected ? 3 : isHover ? 2.8 : 2}
                          style={{ transition: "stroke-width 0.15s" }}/>
                  <text y="5" textAnchor="middle" fontSize="16"
                        style={{ pointerEvents: "none", userSelect: "none" }}>
                    {d.emoji}
                  </text>
                  <text y={ringR + 15} textAnchor="middle" fontSize="11"
                        fill={isSelected || isHover ? G.goldL : "#c9b892"}
                        fontFamily="var(--fd), serif" letterSpacing="0.04em"
                        style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}>
                    {d.name}
                  </text>
                  <title>{d.name} — {tm.label} · Niv. {d.levels}</title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* --- Panneau de détails --- */}
        <div className="cdv-map-panel">
          {selected ? (
            <DungeonDetails d={selected} tm={tierMeta(selected.tier)} fmtAug={fmtAug}
                            onClose={() => setSelectedId(null)}/>
          ) : (
            <div style={{ padding: "50px 22px", textAlign: "center", color: G.muted }}>
              <div style={{ fontSize: 38, opacity: 0.35, marginBottom: 14 }}>🗺️</div>
              <div style={{ fontSize: 13, fontFamily: "var(--fd)", color: G.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
                Choisis ta destination
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: G.muted, maxWidth: 240, margin: "0 auto" }}>
                Clique sur un marqueur de la carte pour découvrir ses créatures, ses boss et son butin.
              </div>
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid " + G.border, fontSize: 10.5, color: "#6b5d44", fontStyle: "italic", letterSpacing: 0.3 }}>
                Les sentiers dorés indiquent une progression suggérée.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cdv-map-hint">
        Touche un marqueur pour afficher sa fiche
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DungeonDetails — panneau latéral
// ═══════════════════════════════════════════════════
function DungeonDetails({ d, tm, fmtAug, onClose }) {
  return (
    <div style={{ padding: "18px 18px 22px" }}>
      {/* Bouton fermer + tier badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: tm.color, display: "inline-block" }}></span>
          <span style={{ fontSize: 10, color: tm.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>
            {tm.label} · Niv. {d.levels}
          </span>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid " + G.border, color: G.muted,
          width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 11,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
          fontFamily: "var(--fb)",
        }} title="Fermer">✕</button>
      </div>

      {/* Nom */}
      <h3 style={{ fontSize: 19, fontWeight: 800, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "0 0 4px", letterSpacing: 0.5 }}>
        <span style={{ marginRight: 8 }}>{d.emoji}</span>{d.name}
      </h3>

      {/* Source (mod) */}
      <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Mod · {d.source}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12.5, color: "#c9b892", lineHeight: 1.55, margin: "0 0 16px", fontStyle: "italic" }}>
        {d.desc}
      </p>

      {/* Scaling */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
          ⚙️ Scaling des mobs
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          {[
            { l: "PV",      v: `×${d.scaling.hp.base} + ${(d.scaling.hp.perLv * 100).toFixed(1)}%/niv`,       c: "#ff6b6b" },
            { l: "Dégâts",  v: `×${d.scaling.dmg.base} + ${(d.scaling.dmg.perLv * 100).toFixed(1)}%/niv`,     c: "#ff9f43" },
            { l: "Défense", v: `${(d.scaling.def.negMax * 100).toFixed(0)}%–${(d.scaling.def.posMax * 100).toFixed(0)}% · cap ${(d.scaling.def.abovePos * 100).toFixed(0)}%`, c: "#54a0ff" },
          ].map(s => (
            <div key={s.l} style={{
              display: "flex", justifyContent: "space-between", fontSize: 11,
              padding: "4px 8px", background: s.c + "08", borderRadius: 4, border: "1px solid " + s.c + "18",
            }}>
              <span style={{ color: s.c, fontWeight: 700 }}>{s.l}</span>
              <span style={{ color: G.text }}>{s.v}</span>
            </div>
          ))}
        </div>
        {d.tiered && (
          <div style={{ marginTop: 6, padding: "4px 8px", background: G.purple + "08", borderRadius: 4, border: "1px solid " + G.purple + "18", fontSize: 10.5, color: G.purple }}>
            ♾️ Tiers infinis · +{d.levelsPerTier} niv/tier
          </div>
        )}
      </div>

      {/* Mobs */}
      {d.mobs && d.mobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: G.accent2, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
            🐉 Créatures ({d.mobs.length})
          </div>
          <div style={{ display: "grid", gap: 3 }}>
            {d.mobs.map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "4px 8px", background: G.bg + "80", borderRadius: 4, border: "1px solid " + G.border, fontSize: 11,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontWeight: 700, color: G.text }}>{m.name}</span>
                  <span style={{ fontSize: 10, color: G.muted, marginLeft: 5 }}>{m.type}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ color: "#ff6b6b", fontWeight: 700 }}>{m.hp} PV</span>
                  {m.dmg && <span style={{ fontSize: 9.5, color: G.muted }}>{m.dmg}</span>}
                  {m.augments && <span style={{ fontSize: 9, color: G.purple }}>🔮{m.augments.length}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boss(es) */}
      {(d.boss || d.bosses) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#e05252", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
            👑 {d.bosses ? `Boss (${d.bosses.length})` : "Boss"}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {(d.bosses || [d.boss]).map((b, bi) => (
              <div key={bi} style={{
                background: "#e0525208", border: "1px solid #e0525222", borderRadius: 6, padding: 10,
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#f0e6d2", fontFamily: "var(--fd)", marginBottom: 4, letterSpacing: 0.3 }}>
                  {b.name}
                </div>
                {b.hp && (
                  <div style={{ fontSize: 11, color: G.text, marginBottom: 2 }}>
                    ❤️ <span style={{ fontWeight: 700, color: "#ff6b6b" }}>{b.hp.toLocaleString()} PV</span>
                    {b.level && <span style={{ color: G.muted }}> · Lv{b.level}</span>}
                  </div>
                )}
                {b.dmg && <div style={{ fontSize: 11, color: G.text, marginBottom: 2 }}>⚔️ {b.dmg}</div>}
                {b.augments && b.augments.length > 0 && (
                  <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {b.augments.map((a, i) => (
                      <span key={i} style={{
                        fontSize: 9, padding: "1.5px 5px", borderRadius: 3,
                        background: G.purple + "15", color: G.purple, fontWeight: 600,
                      }}>{fmtAug(a)}</span>
                    ))}
                  </div>
                )}
                {b.scaling && (
                  <div style={{ marginTop: 5, padding: "3px 6px", background: "#ff6b6b08", borderRadius: 3, border: "1px solid #ff6b6b15", fontSize: 9.5, color: G.muted }}>
                    Boss scaling : PV ×{b.scaling.hp.base} · Dmg ×{b.scaling.dmg.base} · Def cap {(b.scaling.def.abovePos * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loot */}
      {d.loot && d.loot.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: G.accent2, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
            🎁 Loot
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {d.loot.map((item, i) => (
              <span key={i} style={{
                fontSize: 10.5, padding: "3px 7px", borderRadius: 3,
                background: G.accent2 + "10", border: "1px solid " + G.accent2 + "18",
                color: G.accent2, fontWeight: 600,
              }}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════
// COMMUNITY PAGE — Browse & share builds
// ═══════════════════════════════════════════════════
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
    try { return localStorage.getItem("cdv_author") || ""; } catch { return ""; }
  });
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState("");
  const [pubSuccess, setPubSuccess] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [decodedStats, setDecodedStats] = useState(null);

  const loadBuilds = async () => {
    setLoading(true); setError(null);
    try { setBuilds(await fetchBuilds()); }
    catch (e) { setError("Erreur de chargement : " + e.message); }
    setLoading(false);
  };
  useEffect(() => { loadBuilds(); }, []);

  // Auto-open publish form if coming from BuildCreator with a code
  useEffect(() => {
    if (initialCode) {
      setPubCode(initialCode);
      setShowPublish(true);
      if (onClearInitialCode) onClearInitialCode();
    }
  }, [initialCode]);

  useEffect(() => {
    if (!pubCode.trim()) { setDecoded(null); setDecodedStats(null); return; }
    const d = decodeBuild(pubCode.trim());
    setDecoded(d);
    if (d) {
      try {
        const { finalStats } = computeFullStats({
          race: d.selectedRace, evoId: d.selectedEvo || d.selectedRace?.id,
          c1: d.primaryClass, t1: d.primaryTier, c2: d.secondaryClass, t2: d.secondaryTier,
          level: d.level, skillPoints: d.skillPoints, selectedAugments: d.selectedAugments, augBonus: d.augBonus || {},
        });
        setDecodedStats(finalStats);
      } catch(e) { console.error("decodedStats error:", e); setDecodedStats(null); }
    } else { setDecodedStats(null); }
  }, [pubCode]);

  const toggleTag = (id) => setPubTags(t => t.includes(id) ? t.filter(x => x !== id) : t.length < 3 ? [...t, id] : t);

  const handlePublish = async () => {
    if (!pubCode.trim() || !pubName.trim() || !pubAuthor.trim()) { setPubError("Code, nom et pseudo sont requis."); return; }
    if (pubAuthor.trim().length > 20) { setPubError("Pseudo max 20 caractères."); return; }
    if (!decoded) { setPubError("Code de build invalide."); return; }
    setPublishing(true); setPubError("");
    try {
      localStorage.setItem("cdv_author", pubAuthor.trim());
      const topStats = {};
      if (decodedStats) {
        STATS.map(s => ({ key: s.key, val: decodedStats[s.key] || 0 })).sort((a, b) => b.val - a.val).slice(0, 5).forEach(s => { topStats[s.key] = Math.round(s.val * 100) / 100; });
      }
      await publishBuild({
        code: pubCode.trim(), name: pubName.trim(), description: pubDesc.trim(), author: pubAuthor.trim(),
        race: decoded.selectedRace?.id || "", raceEvo: decoded.selectedEvo || "",
        primaryClass: decoded.primaryClass?.id || "", secondaryClass: decoded.secondaryClass?.id || "",
        role: decoded.primaryClass?.roles?.[0] || "",
        level: decoded.level || 1, prestige: decoded.prestige || 0,
        augments: decoded.selectedAugments?.map(a => a.id) || [],
        topStats, tags: pubTags,
      });
      setPubSuccess(true);
      setPubCode(""); setPubName(""); setPubDesc(""); setPubTags([]); setDecoded(null); setDecodedStats(null);
      setTimeout(() => { setPubSuccess(false); setShowPublish(false); loadBuilds(); }, 1500);
    } catch (e) { setPubError("Erreur : " + e.message); }
    setPublishing(false);
  };

  const copyCode = (code, id) => { navigator.clipboard.writeText(code); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const fmtDate = (ts) => { if (!ts) return ""; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); };

  const filtered = builds.filter(b => {
    if (filterRace && b.race !== filterRace) return false;
    if (filterClass && b.primaryClass !== filterClass) return false;
    if (filterRole && b.role !== filterRole) return false;
    if (filterTag && !(b.tags || []).includes(filterTag)) return false;
    return true;
  });

  const allRoles = [...new Set(CLASSES.flatMap(c => c.roles))].sort();
  const inp = { width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + G.border, background: G.bg, color: "#f0e6d2", fontSize: 14, fontFamily: "var(--fb)", outline: "none" };
  const sel = { ...inp, cursor: "pointer", appearance: "auto" };

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: G.teal + "10", border: "1px solid " + G.teal + "20", fontSize: 11, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Partage de builds</div>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: "#f0e6d2", fontFamily: "var(--fd)", margin: "0 0 8px", letterSpacing: 1 }}>Communauté</h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>Parcours les builds de la communauté ou partage les tiens.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setShowPublish(!showPublish)} style={{ padding: "10px 22px", borderRadius: "var(--radius-md)", border: "2px solid " + G.teal, background: showPublish ? G.teal + "20" : G.teal + "10", color: G.teal, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 8 }}>{showPublish ? "✕ Annuler" : "📤 Publier un build"}</button>
        <button onClick={() => setPage("builds")} style={{ padding: "10px 22px", borderRadius: "var(--radius-md)", border: "2px solid " + G.border, background: "transparent", color: G.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 8 }}>⚔️ Créer un build</button>
      </div>

      {showPublish && (
        <div style={{ background: G.card, border: "1px solid " + G.teal + "30", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f0e6d2", fontFamily: "var(--fd)", marginBottom: 16 }}>📤 Publier un build</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>Code du build *</label>
              <input value={pubCode} onChange={e => setPubCode(e.target.value)} placeholder="Colle ton code (Build Creator → Exporter)" style={inp} />
              {pubCode && !decoded && <div style={{ fontSize: 11, color: "#ff6b6b", marginTop: 4 }}>Code invalide</div>}
              {decoded && <div style={{ fontSize: 11, color: G.teal, marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}><span>✓ {decoded.selectedRace?.name || "?"}</span><span>· {decoded.primaryClass?.name || "?"}</span>{decoded.secondaryClass && <span>/ {decoded.secondaryClass.name}</span>}<span>· Niv.{decoded.level} P{decoded.prestige}</span>{decoded.selectedAugments?.length > 0 && <span>· {decoded.selectedAugments.length} augments</span>}</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>Nom du build *</label>
              <input value={pubName} onChange={e => setPubName(e.target.value)} placeholder='Ex: "Tank Golem Indestructible"' style={inp} maxLength={50} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>Ton pseudo *</label>
              <input value={pubAuthor} onChange={e => setPubAuthor(e.target.value)} placeholder="Pseudo (max 20 car.)" style={inp} maxLength={20} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>Description (optionnel)</label>
              <textarea value={pubDesc} onChange={e => setPubDesc(e.target.value)} placeholder="Explique ta stratégie, forces et faiblesses..." rows={3} style={{ ...inp, resize: "vertical" }} maxLength={500} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, color: G.muted, fontWeight: 700, display: "block", marginBottom: 6 }}>Tags — style de jeu (max 3)</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {BUILD_TAGS.map(t => { const active = pubTags.includes(t.id); return (
                  <button key={t.id} onClick={() => toggleTag(t.id)} style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + (active ? t.color : G.border), background: active ? t.color + "18" : "transparent", color: active ? t.color : G.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}</button>
                ); })}
              </div>
            </div>
          </div>
          {decoded && decodedStats && (
            <div style={{ marginTop: 14, padding: 12, background: G.bg, borderRadius: "var(--radius-md)", border: "1px solid " + G.border }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, marginBottom: 8 }}>Aperçu du build</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATS.filter(s => decodedStats[s.key] > 0).sort((a, b) => (decodedStats[b.key] || 0) - (decodedStats[a.key] || 0)).slice(0, 6).map(s => (
                  <span key={s.key} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: s.color + "12", border: "1px solid " + s.color + "20", color: s.color, fontWeight: 700 }}>{s.icon} {s.name}: {Math.round(decodedStats[s.key] * 100) / 100}</span>
                ))}
              </div>
              {decoded.selectedAugments?.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>{decoded.selectedAugments.map(a => <span key={a.id} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: G.purple + "15", color: G.purple, fontWeight: 600 }}>{a.name}</span>)}</div>}
            </div>
          )}
          {pubError && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{pubError}</div>}
          {pubSuccess && <div style={{ color: G.teal, fontSize: 13, marginTop: 10, fontWeight: 700 }}>✓ Build publié !</div>}
          <button onClick={handlePublish} disabled={publishing} style={{ marginTop: 14, padding: "12px 32px", borderRadius: "var(--radius-md)", border: "none", background: G.teal, color: "#000", fontWeight: 800, fontSize: 14, cursor: publishing ? "wait" : "pointer", fontFamily: "var(--fb)", opacity: publishing ? 0.6 : 1 }}>{publishing ? "Publication..." : "Publier"}</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filterRace} onChange={e => setFilterRace(e.target.value)} style={{ ...sel, maxWidth: 180 }}><option value="">Toutes les races</option>{RACES.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}</select>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ ...sel, maxWidth: 180 }}><option value="">Toutes les classes</option>{CLASSES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ ...sel, maxWidth: 180 }}><option value="">Tous les rôles</option>{allRoles.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ ...sel, maxWidth: 180 }}><option value="">Tous les styles</option>{BUILD_TAGS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select>
        {(filterRace || filterClass || filterRole || filterTag) && <button onClick={() => { setFilterRace(""); setFilterClass(""); setFilterRole(""); setFilterTag(""); }} style={{ padding: "10px 16px", borderRadius: "var(--radius-md)", border: "1px solid " + G.border, background: "transparent", color: G.muted, fontSize: 13, cursor: "pointer", fontFamily: "var(--fb)" }}>✕ Reset</button>}
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: G.muted }}>Chargement des builds...</div>}
      {error && <div style={{ textAlign: "center", padding: 40, color: "#ff6b6b" }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: G.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontSize: 16 }}>{builds.length === 0 ? "Aucun build trouvé." : "Aucun build ne correspond aux filtres."}</div><div style={{ fontSize: 13, marginTop: 6 }}>{builds.length === 0 ? "Sois le premier à partager le tien !" : "Essaie d'élargir tes critères."}</div></div>}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, color: G.muted, marginBottom: 4 }}>{filtered.length} build{filtered.length > 1 ? "s" : ""}{filtered.length !== builds.length ? ` sur ${builds.length}` : ""}</div>
          {filtered.map(b => {
            const race = RACES.find(r => r.id === b.race);
            const cls = CLASSES.find(c => c.id === b.primaryClass);
            const cls2 = CLASSES.find(c => c.id === b.secondaryClass);
            const isCopied = copied === b.id;
            const bAugs = (b.augments || []).map(id => AUGMENTS.find(a => a.id === id)).filter(Boolean);
            const bStats = b.topStats || {};
            const bTags = b.tags || [];
            return (
              <div key={b.id} style={{ background: G.card, border: "1px solid " + G.border, borderRadius: "var(--radius-md)", borderLeft: "4px solid " + (cls?.color || G.teal), padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#f0e6d2", fontFamily: "var(--fd)" }}>{b.name}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: G.border, color: G.muted }}>par {b.author}</span>
                      <span style={{ fontSize: 10, color: G.muted + "80" }}>{fmtDate(b.createdAt)}</span>
                    </div>
                    {b.description && <div style={{ fontSize: 13, color: G.muted, marginBottom: 6, lineHeight: 1.5 }}>{b.description}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {onEditInBuilder && <button onClick={() => onEditInBuilder(b.code)} style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + G.teal + "40", background: G.teal + "10", color: G.teal, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--fb)" }}>⚔️ Modifier</button>}
                    <button onClick={() => copyCode(b.code, b.id)} style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + (isCopied ? G.teal : G.border), background: isCopied ? G.teal + "15" : "transparent", color: isCopied ? G.teal : G.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--fb)" }}>{isCopied ? "✓ Copié !" : "📋 Code"}</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: bAugs.length > 0 || Object.keys(bStats).length > 0 ? 8 : 0 }}>
                  {race && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: race.color + "15", color: race.color, fontWeight: 700 }}>{race.emoji} {race.name}</span>}
                  {cls && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: cls.color + "15", color: cls.color, fontWeight: 700 }}>{cls.emoji} {cls.name}</span>}
                  {cls2 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: cls2.color + "15", color: cls2.color, fontWeight: 600 }}>+ {cls2.name}</span>}
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: G.border, color: G.muted }}>Niv.{b.level} P{b.prestige}</span>
                  {bTags.map(tid => { const tag = BUILD_TAGS.find(t => t.id === tid); return tag ? <span key={tid} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: tag.color + "15", color: tag.color, fontWeight: 700 }}>{tag.icon} {tag.label}</span> : null; })}
                </div>
                {bAugs.length > 0 && <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>{bAugs.map(a => <span key={a.id} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: G.purple + "12", border: "1px solid " + G.purple + "20", color: G.purple, fontWeight: 600 }}>🔮 {a.name}</span>)}</div>}
                {Object.keys(bStats).length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{Object.entries(bStats).map(([key, val]) => { const st = STATS.find(s => s.key === key); return st ? <span key={key} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: st.color + "10", border: "1px solid " + st.color + "18", color: st.color, fontWeight: 700 }}>{st.icon} {Math.round(val * 100) / 100}</span> : null; })}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MODS PAGE
// ═══════════════════════════════════════════════════
const MOD_CATEGORIES = [
  {id:"all",label:"Tous",icon:"📦",color:G.gold},
  {id:"combat",label:"Combat & RPG",icon:"⚔️",color:"#e8653a"},
  {id:"craft",label:"Craft & Outils",icon:"🔨",color:"#f5a623"},
  {id:"decoration",label:"Décoration",icon:"🏡",color:"#51cf66"},
  {id:"exploration",label:"Exploration",icon:"🗺️",color:"#4ea8f0"},
  {id:"qol",label:"Quality of Life",icon:"✨",color:"#845ef7"},
];

const MODS_DATA = [
  {
    id:"endgame",
    name:"Endgame & QoL",
    version:"4.1.5",
    authors:["Lewai","ReyZ41 (Models/Textures)"],
    category:"combat",
    description:"Débloquez le plein potentiel de Hytale ! Nouveaux boss, armures endgame, mécaniques avancées et système de configuration complet.",
    color:"#e8653a",
    links:[
      {label:"CurseForge",url:"https://www.curseforge.com/hytale/mods/endgame-qol",icon:"🔗"},
      {label:"Wiki",url:"https://wiki.hytalemodding.dev/mod/endgame-qol",icon:"📖"},
    ],
    highlights:[
      {label:"Items",value:"79",color:"#e8653a"},
      {label:"Armes",value:"12",color:"#f5a623"},
      {label:"Armures",value:"4 sets",color:"#4ea8f0"},
      {label:"Donjons",value:"3",color:"#845ef7"},
    ],
    intro:{
      title:"Le mod incontournable du serveur",
      paragraphs:[
        "Endgame & QoL est le pilier central de la progression sur Ciel de Vignis. Ce mod transforme l'expérience de jeu en ajoutant un véritable parcours endgame structuré autour de trois ères successives — Mithril, Onyxium et Prisma — chacune débloquée par la conquête d'un donjon et la défaite de son boss.",
        "La progression est linéaire et exigeante : chaque donjon donne accès à de nouveaux matériaux, un tier supérieur de l'Endgame Bench, et l'équipement nécessaire pour affronter le défi suivant. Les niveaux minimums sont fixés par le mod Endless Leveling, qui assure que chaque étape demande un investissement réel.",
        "Au-delà des donjons, le mod ajoute des staves pour chaque tier de minerai, des gliders, des sacs à dos, des accessoires légendaires et un système de défis Warden. Un contenu massif qui donne enfin un vrai objectif aux joueurs les plus investis.",
      ],
    },
    progression:[
      {id:"frozen",icon:"❄️",label:"Frozen Dungeon",color:"#4ea8f0",sublabel:"Ère Mithril",
        requires:"Endgame's Bench Tier 2 · Craft Dungeon Key",
        rewards:"Dragon Heart → Bench T3 · Shard of Frozen Summit → Mithril Ore",
        optional:"Korvyn — marchand caché",
      },
      {id:"swamp",icon:"💎",label:"Swamp Dungeon",color:"#845ef7",sublabel:"Ère Onyxium",
        requires:"2nd Dragon Heart → Bench T4 · Shard of Rotting Sanctum",
        rewards:"Swamp Gem · Swamp Ingot · Hedera Bramble → accès Onyxium",
        optional:null,
      },
      {id:"void",icon:"🟣",label:"Golem Void",color:"#c56cf0",sublabel:"Ère Prisma",
        requires:"Hedera's Gem → Bench T5 · Shard of the Void",
        rewards:"Prisma Ore · Void Amulet → Prisma Gear complet",
        optional:null,
      },
    ],
    sections:[
      {id:"armors",label:"Armures",icon:"🛡️",color:"#4ea8f0",items:[
        {name:"Set Prisma",quality:"Legendary",level:"55-65",slots:"Head/Chest/Legs/Hands",stats:"28% Phys · 15% Fire · 15% Fall · +47 HP · +30 Mana · +10% Signature",desc:"Le meilleur set du jeu. Résistances élémentaires complètes et bonus dégâts Signature sur chaque pièce."},
        {name:"Set Onyxium",quality:"Epic",level:"55",slots:"Head/Chest/Legs/Hands",stats:"22% Phys · 12% Fire · +37 HP · +24 Mana · +8% Signature",desc:"Set endgame intermédiaire avec résistance au feu et bonus Signature."},
        {name:"Set Mithril",quality:"Epic",level:"50",slots:"Head/Chest/Legs/Hands",stats:"18% Phys · +30 HP · +19 Mana · +6% Signature",desc:"Amélioration du Mithril EL de base avec Mana et bonus Signature ajoutés."},
        {name:"Set Adamantite (amélioré)",quality:"Rare",level:"40",slots:"Head/Chest/Legs/Hands",stats:"14.4% Phys · +24 HP · +15 Mana · +6% Light",desc:"Bonus Mana et dégâts Light ajoutés par Endgame au set vanilla."},
      ]},
      {id:"weapons",label:"Armes",icon:"⚔️",color:"#e8653a",items:[
        {name:"Épée Prisma",quality:"Legendary",level:"65",stats:"SigEnergy +30 · Mana +200 · Stamina +25",desc:"Épée endgame ultime avec des bonus massifs de Mana et Stamina."},
        {name:"Daggers Prisma",quality:"Legendary",level:"70",stats:"SigEnergy +30 · Mana +200 · Stamina +20 · 9 attaques",desc:"Dagues les plus puissantes du jeu. 9 types d'attaques."},
        {name:"Frozen Sword",quality:"Epic",level:"52",stats:"SigEnergy +20 · Stamina +15 · 12 attaques",desc:"Épée de glace avec dégâts Ice, récompense de donjon."},
        {name:"Staves (7 tiers)",quality:"Uncommon→Epic",level:"10-55",stats:"Mana +15 à +60",desc:"Cuivre, Iron, Thorium, Cobalt, Adamantite, Mithril, Onyxium. Chaque tier donne plus de Mana."},
      ]},
      {id:"dungeons",label:"Donjons",icon:"🏰",color:"#845ef7",items:[
        {name:"Frozen Dungeon",quality:"Rare",level:"Niv. 10-25",slots:"Ère Mithril",stats:"Portail craftable · Boss : Dragon Frost (Niv. 30)",
          desc:"Premier donjon endgame. Explorez un labyrinthe glacé peuplé de mobs gelés (Niv. 10-25) avant d'affronter le Dragon Frost au niveau 30 — un dragon de glace qui utilise des attaques de zone AoE et des projectiles de gel. Le donjon utilise un système de tiers adaptatif (Endless Leveling) qui ajuste la difficulté à votre progression.",
          boss:{name:"Dragon Frost",type:"Dragon · Niv. 30",mechanics:"AoE givre · Projectiles de gel · Augment : Blood Surge",drops:"Dragon Heart · Shard of Frozen Summit · Frozen Sword"},
        },
        {name:"Swamp Dungeon",quality:"Epic",level:"Niv. 30-45",slots:"Ère Onyxium",stats:"Portail craftable · Boss : Hedera (Niv. 50)",
          desc:"Donjon de difficulté intermédiaire dans un marais empoisonné. Des mobs toxiques (Niv. 30-45) protègent Hedera — une créature végétale ancienne au niveau 50 qui invoque des lianes piégeuses et crache du poison. Le système de tiers adaptatif ajuste la difficulté à votre niveau.",
          boss:{name:"Hedera",type:"Créature végétale · Niv. 50",mechanics:"Lianes piégeuses · Poison AoE · Augment : Rebirth",drops:"Swamp Gem · Swamp Ingot · Hedera Bramble · Hedera's Gem"},
        },
        {name:"Golem Void",quality:"Legendary",level:"Niv. 50-65",slots:"Ère Prisma",stats:"Portail craftable · Boss : Golem du Void (Niv. 70)",
          desc:"Le défi ultime du serveur. Un donjon situé dans le Void, peuplé de créatures corrompues (Niv. 50-65). Le Golem du Void au niveau 70 est le boss le plus difficile : attaques dévastatrices, phases multiples et mécaniques de zone. La victoire ouvre l'accès à l'ère Prisma et à l'équipement le plus puissant du jeu.",
          boss:{name:"Golem du Void",type:"Golem corrompu · Niv. 70",mechanics:"Attaques multi-phases · Zones mortelles · Augment : Rebirth",drops:"Shard of the Void · Void Amulet · Prisma Ore"},
        },
      ]},
      {id:"gear",label:"Équipement",icon:"🎒",color:"#f5a623",items:[
        {name:"Gliders (3 tiers)",quality:"Rare→Legendary",level:"3-10",stats:"Endgame Glider réduit conso Stamina",desc:"Standard, Advanced, Endgame. Planez à travers Orbis !"},
        {name:"Backpacks (3 tiers)",quality:"Uncommon→Epic",level:"97-99",stats:"Agrandissement inventaire",desc:"3 niveaux de sacs à dos pour augmenter votre inventaire."},
        {name:"Warden Challenges (4 tiers)",quality:"Uncommon→Legendary",level:"—",stats:"Défis progressifs",desc:"4 niveaux de défis : prouvez votre valeur face aux Wardens."},
        {name:"Accessories (7 types)",quality:"Legendary",level:"—",stats:"Blazefist, Frostwalkers, etc.",desc:"Accessoires légendaires uniques : Hedera Seed, Ocean Striders, Void Amulet, Pocket Garden, Pouch."},
      ]},
      {id:"resources",label:"Ressources & Craft",icon:"⚗️",color:"#51cf66",items:[
        {name:"Minerais",quality:"—",level:"—",stats:"Mithril (Niv.100) · Onyxium (Niv.6)",desc:"Deux minerais endgame pour crafter les sets et armes les plus puissants."},
        {name:"Potions améliorées",quality:"Rare",level:"—",stats:"Health, Mana, Stamina Large",desc:"Versions grande taille des potions de base."},
        {name:"Matériaux de donjon",quality:"Epic",level:"—",stats:"Swamp Gem/Ingot · Hedera Bramble/Key/Gem · Dragon Heart",desc:"Drops exclusifs des donjons, nécessaires pour l'équipement endgame."},
        {name:"Mana Totem",quality:"Rare",level:"30",stats:"Déployable",desc:"Totem régénérateur de mana posable au sol."},
      ]},
    ],
  },
  {
    id:"endlessleveling",
    name:"Endless Leveling",
    version:"7.3.5",
    authors:["Lewai"],
    category:"combat",
    description:"Système RPG complet : niveaux, attributs, races, classes, augments, prestige et portails (EndlessGate). Le cœur de la progression sur le serveur.",
    color:"#845ef7",
    links:[
      {label:"CurseForge",url:"https://www.curseforge.com/hytale/mods/endless-leveling",icon:"🔗"},
    ],
    highlights:[
      {label:"Races",value:"12",color:"#3dd8c5"},
      {label:"Classes",value:"14",color:"#e8653a"},
      {label:"Augments",value:"57",color:"#f5a623"},
      {label:"Portails",value:"∞",color:"#c56cf0"},
    ],
    intro:{
      title:"Le système RPG du serveur",
      paragraphs:[
        "Endless Leveling est le moteur RPG qui structure toute la progression de Ciel de Vignis. Le mod ajoute un système de niveaux (cap 100), 10 attributs de compétence qui évoluent à chaque niveau, et un système de prestige infini qui repousse sans cesse les limites.",
        "Chaque joueur choisit une race parmi 12 disponibles et une classe parmi 14, chacune avec son propre arbre d'évolutions (jusqu'à 5 stades par race, 5 par classe). Les augments — 57 au total répartis en 4 tiers (Common, Elite, Legendary, Mythic) — se débloquent progressivement et ajoutent des effets passifs puissants aux combats.",
        "Le mod gère aussi le niveau des mobs dans le monde : un système hybride distance + niveau du joueur adapte la difficulté en permanence. Les donjons ont leurs propres configurations de tiers avec scaling de HP, dégâts et défense, ce qui garantit un challenge constant quelle que soit votre progression.",
        "Endless Leveling dispose également de l'addon EndlessGate, qui ajoute un système de portails instanciés. Ces portails génèrent des donjons avec des boss uniques — Azaroth, Katherina, Baron, le Construct Ancient Dark Titan — chacun équipé d'augments spécifiques et d'un scaling adaptatif. Les portails offrent un contenu rejouable à l'infini, parfait pour farmer l'XP et tester ses builds en conditions extrêmes.",
      ],
    },
    progression:[
      {id:"leveling",icon:"⭐",label:"Leveling (Niv. 1-100)",color:"#f5a623",sublabel:"Progression de base",
        requires:"Tuer des mobs pour gagner de l'XP",
        rewards:"5 skill points/niveau · 10 attributs à monter · Passifs débloqués progressivement",
        optional:"Party XP : 60% partagés dans un rayon de 40 blocs",
      },
      {id:"builds",icon:"🧬",label:"Race + Classe",color:"#3dd8c5",sublabel:"Personnalisation",
        requires:"Race au Niv. 1 · Classe au Niv. 1 · 1 changement autorisé",
        rewards:"12 races × 6 évolutions · 14 classes × 5 évolutions · Classe secondaire disponible",
        optional:null,
      },
      {id:"prestige",icon:"🔥",label:"Prestige (∞)",color:"#845ef7",sublabel:"Endgame infini",
        requires:"Atteindre le level cap (100 + 10/prestige)",
        rewards:"Nouveaux slots d'augments · Rerolls de tier · +20% XP de base/prestige",
        optional:null,
      },
    ],
    sections:[
      {id:"attributes",label:"Attributs",icon:"📊",color:"#845ef7",items:[
        {name:"Life Force",quality:"—",level:"Par niveau : +2.5",stats:"Santé",desc:"Points de vie supplémentaires par niveau. L'attribut le plus vital pour la survie."},
        {name:"Strength",quality:"—",level:"Par niveau : +0.5",stats:"Dégâts physiques",desc:"Bonus de dégâts physiques appliqué à chaque attaque de mêlée et à distance."},
        {name:"Defense",quality:"—",level:"Par niveau : +0.5",stats:"Réduction de dégâts",desc:"Réduction de dégâts subis. Capée selon la catégorie de classe (40% Mage → 80% Vanguard/Juggernaut)."},
        {name:"Haste",quality:"—",level:"Par niveau : +0.75",stats:"Vitesse de déplacement",desc:"Augmente la vitesse de déplacement du joueur."},
        {name:"Precision",quality:"—",level:"Par niveau : +0.8",stats:"Chance de critique",desc:"Probabilité d'infliger un coup critique lors d'une attaque."},
        {name:"Ferocity",quality:"—",level:"Par niveau : +1.2",stats:"Dégâts critiques",desc:"Multiplicateur de dégâts sur les coups critiques."},
        {name:"Stamina",quality:"—",level:"Par niveau : +0.2",stats:"Endurance",desc:"Stamina pour les actions comme le sprint, le dodge et le glider."},
        {name:"Sorcery",quality:"—",level:"Par niveau : +0.75",stats:"Dégâts magiques (staves)",desc:"Bonus de dégâts magiques, applicable uniquement aux staves."},
        {name:"Flow",quality:"—",level:"Par niveau : +0.5",stats:"Mana",desc:"Ressource pour les sorts et capacités spéciales."},
        {name:"Discipline",quality:"—",level:"Par niveau : +0.75",stats:"Bonus d'XP (%)",desc:"Pourcentage de bonus d'expérience gagné par niveau."},
      ]},
      {id:"passives",label:"Passifs",icon:"🛡️",color:"#3dd8c5",items:[
        {name:"Stamina Gain Bonus",quality:"Common",level:"Débloqué Niv. 5",stats:"Base +20% · +20%/tier · Max 10 tiers · Intervalle : 5 niv.",desc:"Augmente le gain de stamina. Premier passif accessible, progression rapide."},
        {name:"Mana Regeneration",quality:"Common",level:"Débloqué Niv. 10",stats:"Base +1.0 · +0.5/tier · Max 10 tiers · Intervalle : 6 niv.",desc:"Régénération passive de mana au fil du temps."},
        {name:"Signature Gain",quality:"Rare",level:"Débloqué Niv. 15",stats:"Base +40 · +40/tier · Max 10 tiers · Intervalle : 7 niv.",desc:"Accélère le gain d'énergie Signature pour votre arme."},
        {name:"Regeneration",quality:"Rare",level:"Débloqué Niv. 20",stats:"Base +3.0 · +1.5/tier · Max 10 tiers · Intervalle : 8 niv.",desc:"Régénération passive de points de vie. Indispensable en solo."},
        {name:"Luck",quality:"Epic",level:"Débloqué Niv. 20",stats:"Base +2.5% · +2.5%/tier · Max 40 tiers · Intervalle : 5 niv.",desc:"Augmente les chances de loot rare. Le passif avec le plus de tiers disponibles (40)."},
      ]},
      {id:"races",label:"Races",icon:"🧬",color:"#e8653a",items:[
        {name:"Human",quality:"Common",level:"Base",stats:"Polyvalent · Equilibré",desc:"Race par défaut. Évolue en Explorer ou Raider, puis Voyager/Conqueror/Emperor."},
        {name:"Dragonborn",quality:"Epic",level:"Base",stats:"Offensif · Tank",desc:"Descendants des dragons. Évolutions : Guardian, Marauder, Sentinel, Alpha, Tyrant."},
        {name:"Iceborn",quality:"Epic",level:"Base",stats:"Défensif · Givre",desc:"Nés du froid éternel. Évolutions : Guardian, Berzerker, Titan, Frostlord, Ragnarok."},
        {name:"Vastaya",quality:"Rare",level:"Base",stats:"Agile · Nature",desc:"Créatures mi-animales. Évolutions : Hunter, Mystic, Beastlord, Apex, Spiritbinder."},
        {name:"Celestial",quality:"Legendary",level:"Base",stats:"Magique · Support",desc:"Êtres célestes. Évolutions : Adept, Catalyst, Arcanum, Overlord, Supreme."},
        {name:"Darkin",quality:"Legendary",level:"Base",stats:"Offensif · Vampirique",desc:"Corrompus par le Void. Évolutions : Blade, Warlord, Bloodweaver, Bloodlord, Unbound."},
        {name:"Voidborn",quality:"Epic",level:"Base",stats:"Chaos · Offensif",desc:"Nés du néant. Évolutions : Prowler, Protector, Reaver, Juggernaut, Oblivion."},
        {name:"Wraith",quality:"Rare",level:"Base",stats:"Furtif · Assassin",desc:"Spectres entre les mondes. Évolutions : Whisper, Fang, Spectral, Reaver, Phantom King."},
        {name:"+ 4 autres races",quality:"—",level:"—",stats:"Ascended · Golem · Watcher · Yordle",desc:"Chaque race a 6 stades d'évolution avec des attributs et passifs uniques."},
      ]},
      {id:"classes",label:"Classes",icon:"⚔️",color:"#f5a623",items:[
        {name:"Assassin",quality:"Epic",level:"Melee",stats:"Dagger/Sword/Bow · Focused Strike · Reset on Kill",desc:"Maître de l'ouverture. Dégâts physiques en burst avec un cooldown reset au kill."},
        {name:"Battlemage",quality:"Epic",level:"Hybrid",stats:"Staff/Sword · Dégâts hybrides",desc:"Mêle magie et mêlée. Defense cap : 65%."},
        {name:"Vanguard",quality:"Legendary",level:"Tank",stats:"Sword/Mace · Defense cap 80%",desc:"Le tank ultime avec la plus haute réduction de dégâts."},
        {name:"Marksman",quality:"Rare",level:"Ranged",stats:"Bow · Dégâts à distance · Defense cap 40%",desc:"Spécialiste du combat à distance avec des bonus de précision."},
        {name:"Mage",quality:"Rare",level:"Ranged",stats:"Staff · Sorcery · Defense cap 40%",desc:"Dégâts magiques purs via les staves. Glass cannon."},
        {name:"Necromancer",quality:"Legendary",level:"Hybrid",stats:"Staff/Dagger · Dark magic",desc:"Magie noire et invocations. Mélange offense et survie."},
        {name:"Slayer",quality:"Epic",level:"Melee",stats:"Sword/Axe · Burst damage",desc:"Spécialiste du burst offensif en mêlée."},
        {name:"+ 7 autres classes",quality:"—",level:"—",stats:"Adventurer · Arcanist · Brawler · Duelist · Juggernaut · Magistrate · Priest",desc:"Chaque classe a 5 évolutions (Elite, Master, Exalted, Legendary) avec des passifs uniques. Classe secondaire disponible (-40% dégâts hors catégorie d'arme)."},
      ]},
      {id:"augments",label:"Augments",icon:"💎",color:"#c56cf0",items:[
        {name:"Tier Common (débloqué Niv. 5+)",quality:"Common",level:"Niv. 5, 10, 15, 35, 45 + */10",stats:"Passifs de base",desc:"Augments fondamentaux : Burn, Drain, Fleet Footwork, Overheal, Vampirism, Wither..."},
        {name:"Tier Elite (débloqué Niv. 15)",quality:"Rare",level:"Niv. 15 · Prestige 1, 4, 7, 10",stats:"Passifs avancés",desc:"Blood Frenzy, Conqueror, Executioner, First Strike, Phase Rush, Predator, Reckoning..."},
        {name:"Tier Legendary (débloqué Niv. 30)",quality:"Epic",level:"Niv. 30 · Prestige 10",stats:"Passifs puissants",desc:"Arcane Mastery, Blood Surge, Giant Slayer, Glass Cannon, Goliath, Rebirth, Undying Rage..."},
        {name:"Tier Mythic (débloqué Niv. 50)",quality:"Legendary",level:"Niv. 50 · Prestige 15",stats:"Passifs ultimes",desc:"Les augments les plus rares. Débloqués au prestige 15, ils transforment radicalement votre build."},
      ]},
      {id:"mobleveling",label:"Mob Leveling",icon:"🎯",color:"#4ea8f0",items:[
        {name:"Mode Overworld (MIXED)",quality:"—",level:"Monde ouvert",stats:"30% joueur + 70% distance · 40 blocs/niveau depuis le spawn",desc:"Les mobs s'adaptent : plus vous êtes loin du spawn, plus ils sont forts. Votre niveau influence aussi (30%). Range d'XP : ±15 niveaux de différence."},
        {name:"Mode Donjon (TIERED)",quality:"—",level:"Instances",stats:"Tiers adaptatifs · 20 niveaux/tier · Scaling HP/DMG/DEF",desc:"Chaque donjon a un niveau de base fixe et des tiers infinis. Le scaling monte les HP (×3.0 base), les dégâts (×1.25 base) et la défense des mobs progressivement."},
        {name:"Nameplates",quality:"—",level:"Visuel",stats:"Niveau + Nom + HP affichés",desc:"Chaque mob affiche son niveau, son nom et sa barre de vie. Mise à jour en temps réel (1 tick)."},
        {name:"XP Scaling",quality:"—",level:"Récompenses",stats:"Linéaire · ×0.8 global · Min 50 XP",desc:"L'XP scale linéairement. Bonus ×3 au max level. Mobs trop faibles ou trop forts : seulement 5% de l'XP. Minimum garanti : 50 XP."},
      ]},
      {id:"endlessgate",label:"EndlessGate",icon:"🌀",color:"#c56cf0",items:[
        {name:"Portails instanciés",quality:"—",level:"Addon",stats:"Donjons générés · Rejouable à l'infini",
          desc:"EndlessGate est l'addon officiel d'Endless Leveling qui ajoute un système de portails. Chaque portail ouvre une instance de donjon avec des mobs et boss configurés spécifiquement. Le scaling suit le même système de tiers adaptatif qu'Endless Leveling : HP (×3.0 base), dégâts (×1.25 base) et défense progressifs."},
        {name:"Azaroth",quality:"Legendary",level:"Boss",stats:"Augments : Rebirth · Frozen Domain",
          desc:"Boss majeur des portails. Combinaison mortelle de résurrection (Rebirth) et de contrôle de zone glacé (Frozen Domain). Niveau = max du range +10.",
          boss:{name:"Azaroth",type:"Boss de portail",mechanics:"Rebirth · Frozen Domain · Random augments",drops:"XP endgame · Loot de portail"}},
        {name:"Katherina",quality:"Legendary",level:"Boss",stats:"Augments : Bloodthirster · Vampirism",
          desc:"Boss vampirique qui se soigne en infligeant des dégâts. Bloodthirster et Vampirism la rendent extrêmement résiliente — il faut un burst massif pour la finir.",
          boss:{name:"Katherina",type:"Boss de portail",mechanics:"Bloodthirster · Vampirism · Random augments",drops:"XP endgame · Loot de portail"}},
        {name:"Baron",quality:"Legendary",level:"Boss",stats:"Augments : Blood Surge · Bloodthirster",
          desc:"Boss offensif avec Blood Surge (dégâts augmentés) et Bloodthirster (vol de vie). Un adversaire agressif qui punit les builds trop défensifs.",
          boss:{name:"Baron",type:"Boss de portail",mechanics:"Blood Surge · Bloodthirster · Random augments",drops:"XP endgame · Loot de portail"}},
        {name:"Construct Ancient Dark Titan",quality:"Epic",level:"Boss",stats:"Scaling défensif réduit",
          desc:"Titan mécanique ancien. Moins de defense scaling que les autres boss mais toujours redoutable par son pool de HP et ses dégâts bruts.",
          boss:{name:"Construct Ancient Dark Titan",type:"Boss de portail",mechanics:"Tank massif · Dégâts bruts",drops:"XP endgame · Loot de portail"}},
        {name:"Cult Knights & Werewolves",quality:"Rare",level:"Mini-boss",stats:"Augments (mini-boss) : Blood Surge · Blood Frenzy · Vampirism",
          desc:"Mobs élites des portails. Les versions mini-boss ont 3 augments simultanés et un scaling de dégâts renforcé. Apparaissent en groupes."},
      ]},
    ],
  },
  {
    id:"arcanerelay",
    name:"Arcane Relay",
    version:"1.1.1",
    authors:["PseudoAle","Fanzy"],
    category:"craft",
    description:"Système d'automatisation magique et de logique pour Hytale. Activez des mécanismes à distance, déplacez des blocs et créez des circuits.",
    color:"#51cf66",
    links:[
      {label:"CurseForge",url:"https://www.curseforge.com/hytale/mods/arcane-relay",icon:"🔗"},
    ],
    highlights:[
      {label:"Blocs",value:"8",color:"#51cf66"},
      {label:"Actions",value:"15",color:"#f5a623"},
      {label:"Bench",value:"1",color:"#845ef7"},
      {label:"DL",value:"2.1K",color:"#4ea8f0"},
    ],
    intro:{
      title:"L'automatisation magique sur Orbis",
      paragraphs:[
        "Arcane Relay est un mod d'automatisation et de logique qui permet de construire de véritables machines dans Hytale. Développé par Pseudo_Elephant (PseudoAle & Fanzy), il est l'un des mods les plus populaires sur CurseForge avec plus de 2 100 téléchargements et 65 commentaires.",
        "Le concept est simple : des blocs arcaniques — Relays, Buttons, Pushers, Pullers — peuvent être connectés entre eux grâce à un Arcane Staff. Chaque bloc envoyeur peut déclencher à distance des actions sur d'autres blocs : ouvrir des portes, allumer des torches, déplacer des blocs, envoyer des signaux en chaîne. Le tout sans fil, par magie.",
        "L'Arcane Bench, craftable au Workbench Tier 2 (10 Thorium Bars + 30 Linen + 20 Void Essence), offre trois catégories de craft : Portails, Artefacts et Divers. Avec un système de Toggle Relay qui peut bloquer ou relayer un signal, et un Discharge qui accumule des signaux avant de les relâcher, les joueurs créatifs peuvent construire des systèmes complexes : ascenseurs, bases secrètes, cryptes qui s'illuminent, portes automatiques et bien plus.",
      ],
    },
    sections:[
      {id:"blocks",label:"Blocs",icon:"🧱",color:"#51cf66",items:[
        {name:"Arcane Relay",quality:"Rare",level:"Bloc",stats:"Envoyeur de signal",desc:"Le bloc de base. Relaie un signal vers ses sorties connectées. Interagissez pour envoyer manuellement un signal."},
        {name:"Toggle Relay",quality:"Rare",level:"Bloc",stats:"Relais conditionnel · On/Off",desc:"Bloque ou relaie le signal selon son état. Chaque signal reçu bascule l'état. Interagissez pour changer l'état de départ."},
        {name:"Button",quality:"Common",level:"Bloc",stats:"Déclencheur",desc:"Bouton qui envoie un signal à distance vers les blocs connectés. Le déclencheur le plus simple du système."},
        {name:"Pusher",quality:"Rare",level:"Bloc",stats:"Déplacement de blocs",desc:"Pousse les blocs dans la direction où il fait face. Peut être déclenché à distance par un signal. Variante murale disponible pour pousser verticalement."},
        {name:"Puller",quality:"Rare",level:"Bloc",stats:"Attraction de blocs",desc:"Tire un bloc distant vers lui. S'étend pour atteindre la cible, puis la ramène au signal suivant. Utilise des Puller Extensions."},
        {name:"Discharge",quality:"Epic",level:"Bloc",stats:"Accumulateur de signaux",desc:"Stocke les signaux reçus avant de les relayer une fois chargé. Interagissez pour régler le nombre de signaux nécessaires. Parfait pour créer des minuteries et séquences."},
      ]},
      {id:"tools",label:"Outils",icon:"🔧",color:"#f5a623",items:[
        {name:"Arcane Staff",quality:"Rare",level:"Outil",stats:"Configuration des connexions",desc:"L'outil indispensable pour configurer les connexions arcaniques. Clic droit : sélectionner un bloc source. Clic gauche : ajouter/retirer une destination. Accroupi + interaction : voir les connexions d'un bloc."},
        {name:"Arcane Bench",quality:"Epic",level:"Bench",stats:"10 Thorium Bars · 30 Linen · 20 Void Essence",desc:"Établi de craft pour tous les blocs et outils arcaniques. Craftable au Workbench Tier 2. Trois catégories : Portails, Artefacts et Divers."},
        {name:"Crystal Cyan",quality:"Common",level:"Ingrédient",stats:"Ressource de craft",desc:"Cristal cyan utilisé comme composant dans les recettes arcaniques."},
      ]},
      {id:"activations",label:"Interactions",icon:"⚡",color:"#4ea8f0",items:[
        {name:"Toggle Door / Gate",quality:"—",level:"Action",stats:"Porte · Porte horizontale · Grille",desc:"Ouvrez et fermez des portes et grilles à distance. Trois variantes : porte standard, porte horizontale et grille."},
        {name:"Toggle Torch",quality:"—",level:"Action",stats:"Torche · Torche brute",desc:"Allumez et éteignez des torches à distance. Idéal pour les cryptes et les éclairages automatiques."},
        {name:"Move Block",quality:"—",level:"Action",stats:"Déplacement haut/bas",desc:"Déplace un bloc vers le haut ou le bas. Base pour construire des ascenseurs et plateformes mobiles."},
        {name:"Push / Pull Chain",quality:"—",level:"Action",stats:"Chaîne de Pusher · Chaîne de Puller",desc:"Les Pushers et Pullers peuvent fonctionner en chaîne, poussant ou tirant plusieurs blocs à la suite."},
        {name:"Send Signal",quality:"—",level:"Action",stats:"Propagation",desc:"Envoie un signal d'un bloc arcanique à un autre. La brique élémentaire de tout circuit logique."},
      ]},
    ],
  },
];

function ModsPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [expandedMod, setExpandedMod] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const filteredMods = selectedCat === "all" ? MODS_DATA : MODS_DATA.filter(m => m.category === selectedCat);

  return (
    <div style={{ position:"relative",zIndex:1,padding:"100px 24px 60px",maxWidth:1200,margin:"0 auto" }}>
      <div style={{ display:"inline-block",padding:"4px 16px",borderRadius:4,background:G.gold+"10",border:"1px solid "+G.gold+"20",fontSize:11,fontWeight:800,color:G.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:12 }}>Serveur</div>
      <h1 style={{ fontSize:38,fontWeight:900,color:"#f0e6d2",fontFamily:"var(--fd)",margin:"0 0 8px",letterSpacing:1 }}>Mods installés</h1>
      <p style={{ fontSize:16,color:G.muted,margin:"0 0 32px" }}>{MODS_DATA.length} mod{MODS_DATA.length>1?"s":""} documenté{MODS_DATA.length>1?"s":""}</p>

      <div style={{ display:"flex",gap:6,marginBottom:28,flexWrap:"wrap" }}>
        {MOD_CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setSelectedCat(c.id)} style={{
            padding:"8px 18px",borderRadius:20,border:"1px solid "+(selectedCat===c.id?c.color:G.border),
            background:selectedCat===c.id?c.color+"15":"transparent",color:selectedCat===c.id?c.color:G.muted,
            fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
            transition:"all 0.15s",fontFamily:"var(--fb)",
          }}><span style={{fontSize:14}}>{c.icon}</span> {c.label}</button>
        ))}
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {filteredMods.map(mod=>{
          const isOpen = expandedMod === mod.id;
          const catInfo = MOD_CATEGORIES.find(c=>c.id===mod.category) || MOD_CATEGORIES[0];
          const curSection = activeSection || (mod.intro ? "__intro" : mod.sections[0]?.id);
          const sectionData = mod.sections.find(s=>s.id===curSection) || mod.sections[0];
          return (
            <div key={mod.id} style={{
              background:G.card,border:"1px solid "+(isOpen?mod.color+"50":G.border),
              borderRadius:14,overflow:"hidden",transition:"border-color 0.2s",
            }}>
              {/* Header */}
              <div onClick={()=>{setExpandedMod(isOpen?null:mod.id);setActiveSection(null);}} style={{cursor:"pointer",padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
                <div style={{
                  width:56,height:56,borderRadius:12,flexShrink:0,
                  background:`linear-gradient(135deg, ${mod.color}20, ${mod.color}08)`,
                  border:"1px solid "+mod.color+"30",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,
                }}>{catInfo.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:20,fontWeight:800,color:"#f0e6d2",fontFamily:"var(--fd)"}}>{mod.name}</span>
                    <span style={{fontSize:10,padding:"3px 10px",borderRadius:10,background:mod.color+"15",color:mod.color,fontWeight:700}}>v{mod.version}</span>
                    <span style={{fontSize:10,padding:"3px 10px",borderRadius:10,background:catInfo.color+"15",color:catInfo.color,fontWeight:700}}>{catInfo.icon} {catInfo.label}</span>
                  </div>
                  <div style={{fontSize:13,color:G.muted,lineHeight:1.5}}>{mod.description}</div>
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                    {mod.authors.map(a=>(<span key={a} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:G.border,color:G.text,fontWeight:600}}>👤 {a}</span>))}
                    {mod.links&&mod.links.map(l=>(<a key={l.label} href={l.url} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:G.teal+"15",color:G.teal,fontWeight:600,textDecoration:"none"}}>{l.icon} {l.label}</a>))}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
                  {mod.highlights.map(h=>(
                    <div key={h.label} style={{textAlign:"center",minWidth:48}}>
                      <div style={{fontSize:20,fontWeight:900,color:h.color,fontFamily:"var(--fd)"}}>{h.value}</div>
                      <div style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{h.label}</div>
                    </div>
                  ))}
                  <span style={{fontSize:14,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s",marginLeft:8}}>▼</span>
                </div>
              </div>

              {/* Expanded */}
              {isOpen&&<div className="wiki-expanded" style={{borderTop:"1px solid "+G.border+"60"}}>
                {/* Section tabs — add Aperçu tab */}
                <div style={{display:"flex",gap:0,borderBottom:"1px solid "+G.border+"40",background:G.bg+"80",overflowX:"auto"}}>
                  {mod.intro&&<button onClick={()=>setActiveSection("__intro")} style={{
                    padding:"12px 20px",border:"none",cursor:"pointer",fontFamily:"var(--fb)",
                    background:curSection==="__intro"?G.card:"transparent",
                    color:curSection==="__intro"?mod.color:G.muted,fontWeight:curSection==="__intro"?800:600,fontSize:13,
                    borderBottom:curSection==="__intro"?"2px solid "+mod.color:"2px solid transparent",
                    display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",transition:"all 0.15s",
                  }}><span style={{fontSize:15}}>📋</span> Aperçu</button>}
                  {mod.sections.map(s=>(
                    <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
                      padding:"12px 20px",border:"none",cursor:"pointer",fontFamily:"var(--fb)",
                      background:curSection===s.id?G.card:"transparent",
                      color:curSection===s.id?s.color:G.muted,fontWeight:curSection===s.id?800:600,fontSize:13,
                      borderBottom:curSection===s.id?"2px solid "+s.color:"2px solid transparent",
                      display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap",transition:"all 0.15s",
                    }}><span style={{fontSize:15}}>{s.icon}</span> {s.label} <span style={{fontSize:10,opacity:0.6}}>({s.items.length})</span></button>
                  ))}
                </div>

                {/* Intro / Aperçu section */}
                {curSection==="__intro"&&mod.intro&&<div style={{padding:"28px 24px"}}>
                  {/* Intro text */}
                  <h3 style={{fontSize:22,fontWeight:900,color:"#f0e6d2",fontFamily:"var(--fd)",marginBottom:16}}>{mod.intro.title}</h3>
                  {mod.intro.paragraphs.map((p,i)=>(
                    <p key={i} style={{fontSize:13,color:G.muted,lineHeight:1.8,marginBottom:i<mod.intro.paragraphs.length-1?14:0}}>{p}</p>
                  ))}

                  {/* Progression flowchart */}
                  {mod.progression&&<>
                    <div style={{marginTop:32,marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{height:1,flex:1,background:`linear-gradient(90deg, transparent, ${G.border})`}}/>
                      <span style={{fontSize:11,fontWeight:800,color:G.gold,textTransform:"uppercase",letterSpacing:2}}>Progression</span>
                      <div style={{height:1,flex:1,background:`linear-gradient(90deg, ${G.border}, transparent)`}}/>
                    </div>

                    <div style={{position:"relative",display:"flex",flexDirection:"column",gap:0,paddingLeft:28}}>
                      {/* Vertical line */}
                      <div style={{position:"absolute",left:15,top:28,bottom:28,width:2,background:`linear-gradient(180deg, ${mod.progression[0].color}60, ${mod.progression[1]?.color||mod.progression[0].color}60, ${mod.progression[mod.progression.length-1].color}60)`,borderRadius:1}}/>
                      
                      {mod.progression.map((step,si)=>(
                        <div key={step.id}>
                          {/* Step node */}
                          <div style={{display:"flex",gap:16,alignItems:"flex-start",position:"relative"}}>
                            {/* Circle node on line */}
                            <div style={{
                              position:"absolute",left:-28,top:2,
                              width:30,height:30,borderRadius:"50%",
                              background:`radial-gradient(circle, ${step.color}30, ${step.color}08)`,
                              border:`2px solid ${step.color}80`,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:14,zIndex:2,
                              boxShadow:`0 0 12px ${step.color}20`,
                            }}>{step.icon}</div>

                            {/* Content card */}
                            <div style={{
                              flex:1,
                              background:`linear-gradient(135deg, ${step.color}08, transparent)`,
                              border:`1px solid ${step.color}20`,
                              borderRadius:12,padding:"16px 20px",marginLeft:12,
                            }}>
                              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                                <span style={{fontSize:17,fontWeight:800,color:"#f0e6d2",fontFamily:"var(--fd)"}}>{step.label}</span>
                                <span style={{fontSize:10,padding:"3px 10px",borderRadius:10,background:step.color+"18",color:step.color,fontWeight:700,border:`1px solid ${step.color}25`}}>{step.sublabel}</span>
                              </div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                                <div>
                                  <div style={{fontSize:10,fontWeight:700,color:step.color,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Prérequis</div>
                                  <div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{step.requires}</div>
                                </div>
                                <div>
                                  <div style={{fontSize:10,fontWeight:700,color:G.green,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Récompenses</div>
                                  <div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{step.rewards}</div>
                                </div>
                              </div>
                              {step.optional&&<div style={{marginTop:8,fontSize:11,color:G.gold,fontStyle:"italic"}}>💡 {step.optional}</div>}
                            </div>
                          </div>

                          {/* Arrow between steps */}
                          {si<mod.progression.length-1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:24,position:"relative"}}>
                            <div style={{position:"absolute",left:-13,fontSize:10,color:G.muted}}>▼</div>
                          </div>}
                        </div>
                      ))}
                    </div>
                  </>}
                </div>}

                {/* Regular section content */}
                {curSection!=="__intro"&&<div style={{padding:"20px 24px"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {sectionData.items.map((item,i)=>{
                      const qColors = {"Legendary":"#f5a623","Epic":"#845ef7","Rare":"#4ea8f0","Uncommon":"#3dd8c5","Common":"#95a5a6"};
                      const qc = qColors[item.quality] || G.muted;
                      return (
                        <div key={i} style={{
                          background:sectionData.color+"06",border:"1px solid "+sectionData.color+"12",
                          borderLeft:"3px solid "+sectionData.color+"60",borderRadius:10,padding:"16px 20px",
                        }}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                            <span style={{fontSize:16,fontWeight:800,color:"#f0e6d2",fontFamily:"var(--fd)"}}>{item.name}</span>
                            {item.quality&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:qc+"15",color:qc,fontWeight:700}}>{item.quality}</span>}
                            {item.level&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:G.border,color:G.muted,fontWeight:600}}>{item.level}</span>}
                            {item.slots&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:G.blue+"15",color:G.blue,fontWeight:600}}>{item.slots}</span>}
                          </div>
                          {item.stats&&<div style={{fontSize:12,color:sectionData.color,fontWeight:700,marginBottom:6,fontFamily:"var(--fb)"}}>{item.stats}</div>}
                          <div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{item.desc}</div>

                          {/* Boss card for dungeons */}
                          {item.boss&&<div style={{
                            marginTop:12,padding:"14px 16px",borderRadius:10,
                            background:`linear-gradient(135deg, ${sectionData.color}10, ${sectionData.color}04)`,
                            border:`1px solid ${sectionData.color}25`,
                          }}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                              <span style={{fontSize:14}}>💀</span>
                              <span style={{fontSize:14,fontWeight:800,color:"#f0e6d2",fontFamily:"var(--fd)"}}>{item.boss.name}</span>
                              <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#ff6b6b15",color:"#ff6b6b",fontWeight:700}}>{item.boss.type}</span>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                              <div>
                                <div style={{fontSize:10,fontWeight:700,color:"#ff6b6b",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Mécaniques</div>
                                <div style={{fontSize:11,color:G.muted,lineHeight:1.6}}>{item.boss.mechanics}</div>
                              </div>
                              <div>
                                <div style={{fontSize:10,fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Drops</div>
                                <div style={{fontSize:11,color:G.muted,lineHeight:1.6}}>{item.boss.drops}</div>
                              </div>
                            </div>
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>}
              </div>}
            </div>
          );
        })}
      </div>

      <div style={{marginTop:32,padding:"24px",borderRadius:14,border:"1px dashed "+G.border,textAlign:"center"}}>
        <div style={{fontSize:14,color:G.muted,marginBottom:4}}>🚧 D'autres mods seront ajoutés prochainement</div>
        <div style={{fontSize:12,color:G.border}}>59 mods au total sur le serveur</div>
      </div>
    </div>
  );
}

export { Particles, Navbar, HomePage, WikiPage, BuildsPage, MapPage, DungeonsPage, CommunityPage, ModsPage };
