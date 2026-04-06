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
    const COLORS = ["#3dd8c5", "#4ea8f0", "#845ef7", "#f5a623", "#51cf66", "#e8653a"];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: -Math.random() * 0.4 - 0.08,
      size: Math.random() * 6 + 3,
      o: Math.random() * 0.35 + 0.05,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
    }));
    let raf, t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      // Draw grid lines (subtle)
      ctx.globalAlpha = 0.015;
      ctx.strokeStyle = "#3dd8c5";
      ctx.lineWidth = 0.5;
      const gs = 80;
      for (let gx = 0; gx < w; gx += gs) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += gs) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      // Draw voxel cubes
      particles.forEach(p => {
        ctx.globalAlpha = p.o + Math.sin(t * 2 + p.phase) * 0.05;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // Draw a small cube face (square with slight 3D effect)
        const s = p.size;
        ctx.fillStyle = p.c;
        ctx.fillRect(-s/2, -s/2, s, s);
        // Top face (lighter)
        ctx.fillStyle = p.c + "60";
        ctx.beginPath();
        ctx.moveTo(-s/2, -s/2);
        ctx.lineTo(-s/2 + s*0.3, -s/2 - s*0.3);
        ctx.lineTo(s/2 + s*0.3, -s/2 - s*0.3);
        ctx.lineTo(s/2, -s/2);
        ctx.fill();
        // Right face (darker)
        ctx.fillStyle = p.c + "30";
        ctx.beginPath();
        ctx.moveTo(s/2, -s/2);
        ctx.lineTo(s/2 + s*0.3, -s/2 - s*0.3);
        ctx.lineTo(s/2 + s*0.3, s/2 - s*0.3);
        ctx.lineTo(s/2, s/2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rotSpeed;
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
    { id: "map", label: "Carte", icon: "🗺️" },
    { id: "discord", label: "Discord", icon: "💬" },
  ];
  const go = (id) => { if (id === "discord") window.open("https://discord.gg/7YmTATJcf", "_blank"); else setPage(id); setMenuOpen(false); };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || menuOpen ? `${G.bg}f0` : "transparent",
      backdropFilter: scrolled || menuOpen ? "blur(20px) saturate(1.4)" : "none",
      borderBottom: scrolled ? `1px solid ${G.gold || G.accent2}15` : "none",
      transition: "all 0.4s ease", padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${G.gold || G.accent2}, ${G.goldD || '#c8882a'})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: G.bg, fontFamily: "var(--fd)",
            boxShadow: `0 0 16px ${G.gold || G.accent2}25`,
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
        borderTop: `1px solid ${G.teal}20`, animation: "fadeSlideUp 0.2s ease",
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
      background: `linear-gradient(165deg, ${G.card}, ${color}06)`,
      border: `1px solid ${color}20`, borderRadius: "var(--radius-md)", padding: 0,
      cursor: onClick ? "pointer" : "default",
      animation: `fadeSlideUp 0.6s ease ${delay}s both`,
      borderTop: `3px solid ${color}60`,
      "--hover-shadow": `0 16px 48px ${color}18, 0 0 20px ${color}08`,
    }}
    >
      {/* Pixel grid overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${color}05 1px, transparent 1px), linear-gradient(90deg, ${color}05 1px, transparent 1px)`, backgroundSize: "16px 16px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: `radial-gradient(circle, ${color}0c, transparent)`, borderRadius: "50%" }} />
      <div style={{ padding: "28px 24px", position: "relative" }}>
        <div style={{ fontSize: 40, marginBottom: 16, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>{icon}</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)", letterSpacing: 0.5 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 14, color: G.muted, lineHeight: 1.6 }}>{desc}</p>
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
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden",
      }}>
        {/* Atmospheric glow orbs — warm Hytale style */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, background: `radial-gradient(circle, ${G.gold || G.accent2}0a, transparent 70%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 350, height: 350, background: `radial-gradient(circle, ${G.purple}08, transparent 70%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 500, height: 500, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${G.gold || G.accent2}08, transparent 60%)`, borderRadius: "50%", filter: "blur(100px)", animation: "heroGlow 6s ease-in-out infinite" }} />
        
        {/* Decorative voxel blocks */}
        <div style={{ position: "absolute", top: "18%", left: "8%", width: 24, height: 24, background: G.teal, opacity: 0.08, transform: "rotate(15deg)", animation: "voxelFloat 6s ease infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "12%", width: 16, height: 16, background: G.purple, opacity: 0.1, transform: "rotate(-10deg)", animation: "voxelFloat 8s ease infinite 1s" }} />
        <div style={{ position: "absolute", bottom: "25%", left: "15%", width: 20, height: 20, background: G.accent2, opacity: 0.07, transform: "rotate(25deg)", animation: "voxelFloat 7s ease infinite 2s" }} />
        <div style={{ position: "absolute", top: "60%", right: "20%", width: 14, height: 14, background: G.blue, opacity: 0.09, transform: "rotate(-20deg)", animation: "voxelFloat 9s ease infinite 0.5s" }} />
        <div style={{ position: "absolute", bottom: "35%", right: "8%", width: 28, height: 28, background: G.green, opacity: 0.06, transform: "rotate(40deg)", animation: "voxelFloat 10s ease infinite 3s" }} />

        <div style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 22px", borderRadius: 8,
            background: `${G.gold || G.accent2}0a`, border: `1px solid ${G.gold || G.accent2}18`,
            fontSize: 13, fontWeight: 700, color: G.gold || G.accent2, marginBottom: 28,
            fontFamily: "var(--fb)", letterSpacing: 1.2, textTransform: "uppercase",
          }}>
            <span style={{ display: "inline-block", width: 6, height: 6, background: G.gold || G.accent2, borderRadius: "50%", animation: "glowPulse 2s ease infinite" }} />
            Serveur Hytale PvE — EndlessLeveling v7.0.6
          </div>
        </div>

        <h1 style={{
          fontSize: "clamp(52px, 9vw, 88px)", fontWeight: 900, lineHeight: 1.0, margin: "0 0 24px",
          fontFamily: "var(--fd)", letterSpacing: 2,
          background: `linear-gradient(135deg, ${G.goldL || '#f0c06a'} 0%, ${G.gold || '#e8a537'} 30%, #f5f0e8 50%, ${G.gold || '#e8a537'} 70%, ${G.goldD || '#c8882a'} 100%)`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "fadeSlideUp 0.8s ease 0.1s both, shimmer 5s linear infinite",
          textShadow: "none",
        }}>
          CielDeVignis
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2.5vw, 21px)", color: G.muted, maxWidth: 620, margin: "0 auto 44px",
          lineHeight: 1.7, fontFamily: "var(--fb)", animation: "fadeSlideUp 0.8s ease 0.2s both",
        }}>
          Explore des donjons, affronte des créatures, crée ton build parfait.
          <br /><span style={{ color: G.teal }}>12 races</span> · <span style={{ color: G.accent2 }}>14 classes</span> · <span style={{ color: G.purple }}>55 augments</span> — des possibilités infinies.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeSlideUp 0.8s ease 0.3s both" }}>
          <button onClick={() => setPage("builds")} className="btn-primary-lg">
            ⚔️ Créer un Build
          </button>
          <button onClick={() => window.open("https://discord.gg/7YmTATJcf", "_blank")} className="btn-discord">
            💬 Rejoindre Discord
          </button>
        </div>

        {/* Scroll indicator — voxel style */}
        <div style={{ position: "absolute", bottom: 30, animation: "bounce 2s ease infinite", opacity: 0.35 }}>
          <div style={{ width: 22, height: 38, borderRadius: 4, border: `2px solid ${G.teal}60`, display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 4, height: 8, borderRadius: 1, background: G.teal, animation: "scrollDot 2s ease infinite" }} />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "20px 24px 60px" }}>
        <StatRow />
      </section>

      {/* FEATURES */}
      <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "5px 16px", borderRadius: 6, background: `${G.gold || G.accent2}0c`, border: `1px solid ${G.gold || G.accent2}18`, fontSize: 11, fontWeight: 800, color: G.gold || G.accent2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Outils</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "8px 0 10px", letterSpacing: 1, animation: "fadeSlideUp 0.6s ease both" }}>
            Tout pour ton aventure
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Des outils pensés pour les joueurs de CielDeVignis
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <FeatureCard icon="⚔️" title="Build Creator" desc="Crée et simule tes builds avec un calcul précis de toutes tes stats. Race, classes, SP, augments — tout y est." color={G.teal} delay={0.1} onClick={() => setPage("builds")} />
          <FeatureCard icon="🏰" title="Donjons & Monstres" desc="Explore les 11 donjons du serveur — niveaux, boss, scaling et loot pour chaque instance." color={G.gold || G.accent2} delay={0.2} onClick={() => setPage("dungeons")} />
          <FeatureCard icon="🗡️" title="Armes & Armures" desc="Toutes les armes et armures du serveur avec leurs stats, bonus, et compatibilité de classe." color={G.orange} delay={0.3} onClick={() => setPage("wiki")} />
          <FeatureCard icon="📊" title="Communauté" desc="Partage tes builds, explore ceux de ta guilde, et compare les configurations." color={G.purple} delay={0.4} onClick={() => setPage("community")} />
        </div>
      </section>

      {/* RACES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: `${G.accent2}10`, border: `1px solid ${G.accent2}20`, fontSize: 11, fontWeight: 800, color: G.accent2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Races</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "8px 0 8px", letterSpacing: 0.5 }}>
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
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: `${G.blue}10`, border: `1px solid ${G.blue}20`, fontSize: 11, fontWeight: 800, color: G.blue, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Classes</div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "8px 0 8px", letterSpacing: 0.5 }}>
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
          background: `linear-gradient(165deg, ${G.card}, ${G.gold || G.accent2}06)`,
          border: `1px solid ${G.gold || G.accent2}18`, position: "relative", overflow: "hidden",
          borderTop: `2px solid ${G.gold || G.accent2}40`,
        }}>
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.gold || G.accent2}03 1px, transparent 1px), linear-gradient(90deg, ${G.gold || G.accent2}03 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: `radial-gradient(circle, ${G.gold || G.accent2}0a, transparent)`, borderRadius: "50%" }} />
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", margin: "0 0 14px", fontFamily: "var(--fd)", position: "relative", letterSpacing: 1 }}>
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
      <footer style={{ borderTop: `1px solid ${G.gold || G.accent2}12`, background: `${G.card}90`, marginTop: 20, position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.gold || G.accent2}02 1px, transparent 1px), linear-gradient(90deg, ${G.gold || G.accent2}02 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 24px", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 36 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${G.gold || G.accent2}, ${G.goldD || '#c8882a'})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: G.bg, fontFamily: "var(--fd)", boxShadow: `0 0 12px ${G.gold || G.accent2}20` }}>C</div>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--fd)", color: "#fff", letterSpacing: 0.5 }}>CielDeVignis</span>
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                Serveur communautaire Hytale PvE.
                <br/>Explore, combats, théorycraft.
              </p>
            </div>
            {/* Outils */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold || G.accent2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Outils</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{label:"Build Creator",icon:"⚔️",id:"builds"},{label:"Communauté",icon:"🌍",id:"community"},{label:"Donjons",icon:"🏰",id:"dungeons"},{label:"Wiki",icon:"📖",id:"wiki"}].map(l=>(
                  <span key={l.id} onClick={()=>setPage(l.id)} className="footer-link" style={{ fontSize: "var(--text-sm)", color: G.muted, display: "flex", alignItems: "center", gap: 6 }}
                  >{l.icon} {l.label}</span>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold || G.accent2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Contenu</div>
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
              <div style={{ fontSize: 12, fontWeight: 800, color: G.gold || G.accent2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Communauté</div>
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
          <div style={{ borderTop: `1px solid ${G.gold || G.accent2}0c`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#3a5068" }}>© 2025 CielDeVignis — EndlessLeveling v7.0.6</div>
            <div style={{ fontSize: 11, color: "#3a5068" }}>Fait avec passion pour la communauté Hytale</div>
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
  const fmtItem = (s) => s ? s.replace(/_/g, ' ') : '';
  const switchTab = (t) => { setWikiTab(t); setCat("ALL"); setSearch(""); setExpanded(null); setQualities([]); setLvlMin(""); setLvlMax(""); setSort("name"); };
  const toggleQuality = (q) => setQualities(prev => prev.includes(q) ? prev.filter(x=>x!==q) : [...prev, q]);
  const clearAdvanced = () => { setQualities([]); setLvlMin(""); setLvlMax(""); setSort("name"); };
  const hasAdvanced = qualities.length > 0 || lvlMin !== "" || lvlMax !== "" || sort !== "name";
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
      <h1 style={{ fontSize:38,fontWeight:900,color:"#fff",fontFamily:"var(--fd)",margin:"0 0 8px",letterSpacing:1 }}>Wiki CielDeVignis</h1>
      <p style={{ fontSize:16,color:G.muted,margin:"0 0 24px" }}>{wikiItems.length} objets · {wikiMobs.length} créatures · {wikiRecipes.length} recettes salvage · {craftableItems.length} recettes craft</p>
      {/* Tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"2px solid "+G.border }}>
        {tabs.map(t=><button key={t.id} onClick={()=>switchTab(t.id)} style={{ padding:"10px 20px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",background:wikiTab===t.id?G.card:"transparent",color:wikiTab===t.id?G.teal:G.muted,borderBottom:wikiTab===t.id?"2px solid "+G.teal:"2px solid transparent",fontWeight:700,fontSize:14,fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:6 }}><span style={{fontSize:16}}>{t.icon}</span> {t.label} <span style={{fontSize:11,opacity:0.6}}>{t.count}</span></button>)}
      </div>
      {/* Filters */}
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        <button onClick={()=>setCat("ALL")} style={{ padding:"6px 14px",borderRadius:"var(--radius-md)",border:"2px solid "+(cat==="ALL"?G.teal:G.border),background:cat==="ALL"?G.teal+"15":"transparent",color:cat==="ALL"?G.teal:G.muted,fontWeight:700,fontSize:12,cursor:"pointer" }}>Tous</button>
        {activeCats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ padding:"6px 14px",borderRadius:"var(--radius-md)",border:"2px solid "+(cat===c.id?c.color:G.border),background:cat===c.id?c.color+"15":"transparent",color:cat===c.id?c.color:G.muted,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}><span style={{fontSize:13}}>{c.icon}</span> {c.label}</button>)}
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{ flex:1,minWidth:200,maxWidth:500,padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.card,color:"#fff",fontSize:14,fontFamily:"var(--fb)",outline:"none" }}/>
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
              <input type="number" value={lvlMin} onChange={e=>setLvlMin(e.target.value)} placeholder="Min" min={1} max={75} style={{ width:80,padding:"8px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#fff",fontSize:13,fontFamily:"var(--fb)",outline:"none",textAlign:"center" }}/>
              <span style={{ color:G.muted,fontSize:13 }}>—</span>
              <input type="number" value={lvlMax} onChange={e=>setLvlMax(e.target.value)} placeholder="Max" min={1} max={75} style={{ width:80,padding:"8px 12px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#fff",fontSize:13,fontFamily:"var(--fb)",outline:"none",textAlign:"center" }}/>
              <span style={{ fontSize:11,color:G.muted }}>(1 – 75)</span>
            </div>
          </div>
        </>}
        {wikiTab!=="items"&&wikiTab!=="craft"&&<div style={{ fontSize:13,color:G.muted }}>Utilisez le tri ci-dessus pour ordonner les résultats.</div>}
        {hasAdvanced&&<button onClick={clearAdvanced} style={{ marginTop:12,padding:"6px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:"transparent",color:G.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--fb)" }}>✕ Réinitialiser les filtres</button>}
      </div>}
      <div style={{ fontSize:12,color:G.muted,marginBottom:14,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
        <span>{totalFiltered} résultat{totalFiltered>1?"s":""}</span>
        {sort!=="name"&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.teal+"12",color:G.teal}}>Trié : {(SORT_OPTIONS[wikiTab]||[]).find(o=>o.id===sort)?.label}</span>}
        {qualities.length>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.purple+"12",color:G.purple}}>{qualities.length} qualité{qualities.length>1?"s":""}</span>}
        {(lvlMin||lvlMax)&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:G.blue+"12",color:G.blue}}>Niv. {lvlMin||"1"}–{lvlMax||"75"}</span>}
      </div>

      {/* ITEMS */}
      {wikiTab==="items"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
        {filteredItems.map(r=>{const isOpen=expanded===r.id;const catInfo=ITEM_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"📦"};const qc=QUALITY_COLORS[r.q]||G.muted;return(
          <div key={r.id} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?qc+"30":G.border+"60"),borderLeft:"3px solid "+qc+(isOpen?"":"40"),borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
              <ItemImg id={r.id} fallback={catInfo.icon} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.id)}</div>
                <div style={{display:"flex",gap:6,fontSize:11,color:G.muted,marginTop:2}}>{r.sc&&<span>{r.sc}</span>}{r.l>0&&<span>Niv. {r.l}</span>}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                {sort==="dps"&&itemDPS(r)>0&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#e8653a15",color:"#e8653a",fontWeight:700}}>{itemDPS(r)} DMG</span>}
                {sort==="res"&&itemRes(r)>0&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#4ea8f015",color:"#4ea8f0",fontWeight:700}}>{(itemRes(r)*100).toFixed(0)}% RES</span>}
                {sort==="dur"&&r.dur>0&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"#51cf6615",color:"#51cf66",fontWeight:700}}>{r.dur} DUR</span>}
                {r.q&&<span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:qc+"15",color:qc,fontWeight:700}}>{r.q}</span>}
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div style={{padding:"0 14px 14px",borderTop:"1px solid "+G.border}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:12,marginTop:12}}>
                {r.dmg&&r.dmg.length>0&&<div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Dégâts</div>
                  {r.dmg.map((d,i)=><div key={i} style={{background:"#e8653a08",border:"1px solid #e8653a18",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{d.a}</span><span style={{fontWeight:800,color:"#e8653a"}}>{d.d} {d.t}</span></div>)}
                </div>}
                {r.res&&<div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Résistance {r.sl&&`(${r.sl})`}</div>
                  {Object.entries(r.res).map(([k,v])=><div key={k} style={{background:"#4ea8f008",border:"1px solid #4ea8f018",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{k}</span><span style={{fontWeight:800,color:"#4ea8f0"}}>{(v*100).toFixed(0)}%</span></div>)}
                  {r.sm&&Object.entries(r.sm).map(([k,v])=><div key={k} style={{background:"#51cf6608",border:"1px solid #51cf6618",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{k}</span><span style={{fontWeight:800,color:"#51cf66"}}>+{v}</span></div>)}
                </div>}
                {r.r&&<div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Recette</div>
                  {r.r.map(([id,qty],i)=><div key={i} style={{background:G.teal+"08",border:"1px solid "+G.teal+"18",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",alignItems:"center",gap:6,fontSize:12}}><ItemImg id={id} size={18} fallback="" /><span style={{color:G.text,flex:1}}>{fmtItem(id)}</span><span style={{fontWeight:800,color:G.teal,flexShrink:0}}>×{qty}</span></div>)}
                  <div style={{fontSize:11,color:G.muted,marginTop:4}}>{r.b&&<span>🔨 {fmtItem(r.b)}</span>}{r.ct>0&&<span style={{marginLeft:10}}>⏱️ {r.ct}s</span>}{r.dur>0&&<span style={{marginLeft:10}}>🔧 {r.dur}</span>}</div>
                </div>}
              </div>
            </div>}
          </div>)})}
      </div>}

      {/* MOBS */}
      {wikiTab==="mobs"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
        {filteredMobs.map((r,idx)=>{
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
          <div key={r.id} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?catInfo.color+"30":G.border+"60"),borderLeft:"3px solid "+catInfo.color+(isOpen?"":"40"),borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
              <span style={{fontSize:18,flexShrink:0}}>{catInfo.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.app||r.id)}</div><div style={{fontSize:11,color:G.muted}}>{r.c}{r.hostile?" · Hostile":""}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={{
                  padding:"2px 8px",borderRadius:"var(--radius-sm)",
                  background:"#ff6b6b18",color:"#ff6b6b",
                  fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"
                }}>❤️ {r.hp}</span>
                {r.hostile&&(
                  <span style={{
                    padding:"2px 8px",borderRadius:"var(--radius-sm)",
                    background:"#f5a62318",color:"#f5a623",
                    fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"
                  }}>Hostile</span>
                )}
                {sort==="dmg"&&mobDmg(r)>0&&<span style={{padding:"2px 8px",borderRadius:"var(--radius-sm)",background:"#e8653a18",color:"#e8653a",fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"}}>⚔️ {mobDmg(r)}</span>}
                {sort==="spd"&&r.spd>0&&<span style={{padding:"2px 8px",borderRadius:"var(--radius-sm)",background:"#3dd8c518",color:"#3dd8c5",fontSize:"var(--text-xs)",fontWeight:"var(--fw-bold)"}}>💨 {r.spd}</span>}
                {r.drop&&(
                  <span style={{fontSize:"var(--text-xs)",color:"var(--c-muted)"}}>
                    🎁 {fmtItem(r.drop)}
                  </span>
                )}
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div style={{padding:"0 14px 14px",borderTop:"1px solid "+G.border}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:8,marginTop:10}}>
                <div style={{background:"#ff6b6b08",border:"1px solid #ff6b6b18",borderRadius:"var(--radius-sm)",padding:"8px 12px"}}><div style={{fontSize:"var(--text-xs)",color:G.muted,textTransform:"uppercase",letterSpacing:1}}>Vie</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#ff6b6b"}}>{r.hp}</div></div>
                {r.spd>0&&<div style={{background:"#3dd8c508",border:"1px solid #3dd8c518",borderRadius:"var(--radius-sm)",padding:"8px 12px"}}><div style={{fontSize:"var(--text-xs)",color:G.muted,textTransform:"uppercase",letterSpacing:1}}>Vitesse</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#3dd8c5"}}>{r.spd}</div></div>}
                {r.view>0&&<div style={{background:"#f5a62308",border:"1px solid #f5a62318",borderRadius:"var(--radius-sm)",padding:"8px 12px"}}><div style={{fontSize:"var(--text-xs)",color:G.muted,textTransform:"uppercase",letterSpacing:1}}>Vue</div><div style={{fontSize:"var(--text-lg)",fontWeight:"var(--fw-black)",color:"#f5a623"}}>{r.view}</div></div>}
              </div>
              {r.dmg&&r.dmg.length>0&&<div style={{marginTop:8}}><div style={{fontSize:"var(--text-xs)",fontWeight:"var(--fw-black)",color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Dégâts</div>{r.dmg.map((d,i)=><div key={i} style={{background:"#e8653a08",border:"1px solid #e8653a18",borderRadius:"var(--radius-sm)",padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{d.t}</span><span style={{fontWeight:800,color:"#e8653a"}}>{d.d}</span></div>)}</div>}
              {r.drop&&<div style={{fontSize:"var(--text-xs)",color:G.muted,marginTop:6}}>🎁 Drop: <span style={{color:G.teal,fontWeight:"var(--fw-bold)"}}>{fmtItem(r.drop)}</span></div>}
            </div>}
          </div></div>)})}
      </div>}

      {/* SALVAGE */}
      {wikiTab==="salvage"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
        {filteredSalvage.map(r=>{const isOpen=expanded===r.id;const catInfo=SALVAGE_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"📦"};return(
          <div key={r.id} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?catInfo.color+"30":G.border+"60"),borderLeft:"3px solid "+catInfo.color+(isOpen?"":"40"),borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
              <ItemImg id={r.id} fallback={catInfo.icon} />
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{r.n}</div><div style={{fontSize:11,color:G.muted}}>{fmtItem(r.id)}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:catInfo.color+"12",color:catInfo.color,fontWeight:700}}>{r.c}</span>
                <span style={{fontSize:10,color:G.muted}}>{r.t}s</span>
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div style={{padding:"0 14px 14px",borderTop:"1px solid "+G.border}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"flex-start",marginTop:12}}>
                <div><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Entrée</div><div style={{background:"#ff6b6b08",border:"1px solid #ff6b6b18",borderRadius:"var(--radius-md)",padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}><ItemImg id={r.id} size={24} fallback="" /><div style={{fontSize:13,fontWeight:700,color:"#ff6b6b"}}>1× {fmtItem(r.id)}</div></div></div>
                <div style={{paddingTop:28,fontSize:20,color:G.teal}}>→</div>
                <div><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Sorties</div>{r.o.map(([item,qty],i)=><div key={i} style={{background:G.teal+"08",border:"1px solid "+G.teal+"18",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",alignItems:"center",gap:6,fontSize:12}}><ItemImg id={item} size={18} fallback="" /><span style={{color:G.text,flex:1}}>{fmtItem(item)}</span><span style={{fontWeight:800,color:G.teal,flexShrink:0}}>×{qty}</span></div>)}</div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:G.muted}}>🔨 {fmtItem(r.b)} · ⏱️ {r.t}s</div>
            </div>}
          </div>)})}
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
            <input value={calcSearch} onChange={e=>setCalcSearch(e.target.value)} placeholder="Ajouter un item à crafter..." style={{width:"100%",padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.bg,color:"#fff",fontSize:13,fontFamily:"var(--fb)",outline:"none",boxSizing:"border-box"}}/>
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
        {filteredCraft.map(r=>{const isOpen=expanded===r.id;const qc=QUALITY_COLORS[r.q]||G.muted;const benchInfo=CRAFT_BENCHES.find(b=>b.id===r.b)||{icon:"📋",color:G.muted,label:r.b||"?"};
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
              {hasSub&&item.r.map(([subId,subQty])=>renderTree(subId,subQty,depth+1,new Set(seen)))}
            </div>
          );
        };
        // Compute flat raw materials
        const rawMats = isOpen ? flattenRecipe(r.id, 1, new Set()) : [];
        return(
          <div key={r.id} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?benchInfo.color+"30":G.border+"60"),borderLeft:"3px solid "+benchInfo.color+(isOpen?"":"40"),borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
              <ItemImg id={r.id} fallback={benchInfo.icon} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.id)}</div>
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
            {isOpen&&<div onClick={e=>e.stopPropagation()} style={{padding:"0 14px 14px",borderTop:"1px solid "+G.border}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:16,marginTop:12}}>
                {/* Left: Recipe tree */}
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🌳 Arbre de craft</div>
                  <div style={{background:G.bg+"80",border:"1px solid "+G.border,borderRadius:"var(--radius-md)",padding:10}}>
                    {r.r.map(([ingId,ingQty])=>renderTree(ingId,ingQty,0,new Set([r.id])))}
                  </div>
                  <div style={{marginTop:8,fontSize:11,color:G.muted}}>🔨 {fmtItem(r.b)}{r.ct>0&&<span> · ⏱️ {r.ct}s</span>}{r.dur>0&&<span> · 🔧 {r.dur}</span>}</div>
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
      </div>}

      {totalFiltered===0&&<div style={{textAlign:"center",padding:40,color:G.muted,fontSize:14}}>Aucun résultat.</div>}
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
        fontSize: 38, fontWeight: "var(--fw-black)", color: "#fff",
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
// DUNGEONS PAGE
// ═══════════════════════════════════════════════════
function DungeonsPage() {
  const [expanded, setExpanded] = useState(null);
  const [filterTier, setFilterTier] = useState("ALL");

  const filtered = filterTier === "ALL" ? DUNGEONS : DUNGEONS.filter(d => d.tier === filterTier);
  const grouped = DUNGEON_TIERS.map(t => ({
    ...t,
    dungeons: filtered.filter(d => d.tier === t.id),
  })).filter(g => g.dungeons.length > 0);

  const fmtAug = (id) => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: G.orange + "10", border: "1px solid " + G.orange + "20", fontSize: 11, fontWeight: 800, color: G.orange, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
        Instances PvE
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 8px", letterSpacing: 1 }}>
        Donjons
      </h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>
        {DUNGEONS.length} donjons · 5 mods · Progression Niv. 5 → 80+
      </p>

      {/* Tier filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={() => setFilterTier("ALL")} style={{
          padding: "8px 18px", borderRadius: "var(--radius-md)", border: "2px solid " + (filterTier === "ALL" ? G.teal : G.border),
          background: filterTier === "ALL" ? G.teal + "15" : "transparent", color: filterTier === "ALL" ? G.teal : G.muted,
          fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--fb)",
        }}>Tous ({DUNGEONS.length})</button>
        {DUNGEON_TIERS.map(t => {
          const count = DUNGEONS.filter(d => d.tier === t.id).length;
          return (
            <button key={t.id} onClick={() => setFilterTier(t.id)} style={{
              padding: "8px 18px", borderRadius: "var(--radius-md)", border: "2px solid " + (filterTier === t.id ? t.color : G.border),
              background: filterTier === t.id ? t.color + "15" : "transparent", color: filterTier === t.id ? t.color : G.muted,
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Dungeon groups by tier */}
      {grouped.map(group => (
        <div key={group.id} style={{ marginBottom: 36 }}>
          {/* Tier header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
            paddingBottom: 10, borderBottom: "2px solid " + group.color + "25",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: group.color + "15", border: "2px solid " + group.color + "30",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>{group.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: group.color, fontFamily: "var(--fd)", letterSpacing: 1 }}>
                {group.label}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>{group.range}</div>
            </div>
          </div>

          {/* Dungeon cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {group.dungeons.map(dg => {
              const isOpen = expanded === dg.id;
              return (
                <div key={dg.id} onClick={() => setExpanded(isOpen ? null : dg.id)} style={{
                  background: isOpen ? G.card : G.card + "80",
                  border: "1px solid " + (isOpen ? dg.color + "40" : G.border),
                  borderLeft: "4px solid " + dg.color + (isOpen ? "" : "60"),
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  transition: "all 0.2s ease", overflow: "hidden",
                }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{dg.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: isOpen ? "#fff" : G.text, fontFamily: "var(--fd)" }}>
                          {dg.name}
                        </span>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 4,
                          background: dg.color + "15", color: dg.color, fontWeight: 700,
                        }}>Niv. {dg.levels}</span>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 4,
                          background: G.border, color: G.muted, fontWeight: 600,
                        }}>{dg.source}</span>
                      </div>
                      <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>{dg.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {dg.bosses ? <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                        <span style={{ fontSize: 11, color: "#e05252", fontWeight: 700 }}>👑 {dg.bosses.length} Boss</span>
                        <span style={{ fontSize: 10, color: G.muted }}>{dg.bosses.map(b => b.name).join(" + ")}</span>
                      </div> : dg.boss && <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                        <span style={{ fontSize: 11, color: "#e05252", fontWeight: 700 }}>👑 {dg.boss.name}</span>
                        <span style={{ fontSize: 10, color: G.muted }}>{dg.boss.hp.toLocaleString()} PV{dg.boss.level ? " · Lv" + dg.boss.level : ""}</span>
                      </div>}
                      <span style={{
                        fontSize: 14, color: G.muted,
                        transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s",
                      }}>▼</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 18px", borderTop: "1px solid " + G.border }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

                        {/* Scaling */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                            ⚙️ Scaling des mobs
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {[
                              { l: "PV", v: `×${dg.scaling.hp.base} base + ${(dg.scaling.hp.perLv * 100).toFixed(1)}%/niv`, c: "#ff6b6b" },
                              { l: "Dégâts", v: `×${dg.scaling.dmg.base} base + ${(dg.scaling.dmg.perLv * 100).toFixed(1)}%/niv`, c: "#ff9f43" },
                              { l: "Défense", v: `${(dg.scaling.def.negMax * 100).toFixed(0)}% – ${(dg.scaling.def.posMax * 100).toFixed(0)}% (cap ${(dg.scaling.def.abovePos * 100).toFixed(0)}%)`, c: "#54a0ff" },
                            ].map(s => (
                              <div key={s.l} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "6px 10px", background: s.c + "08", borderRadius: 6, border: "1px solid " + s.c + "15",
                              }}>
                                <span style={{ fontSize: 12, color: s.c, fontWeight: 700 }}>{s.l}</span>
                                <span style={{ fontSize: 12, color: G.text }}>{s.v}</span>
                              </div>
                            ))}
                          </div>
                          {dg.tiered && (
                            <div style={{
                              marginTop: 8, padding: "6px 10px", background: G.purple + "08",
                              borderRadius: 6, border: "1px solid " + G.purple + "15", fontSize: 11, color: G.purple,
                            }}>
                              ♾️ Tiers infinis · +{dg.levelsPerTier} niv/tier · S'adapte au joueur
                            </div>
                          )}
                        </div>

                        {/* Mobs */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: G.accent2, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                            🐉 Créatures ({dg.mobs.length})
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {dg.mobs.map((m, i) => (
                              <div key={i} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "5px 10px", background: G.bg + "80", borderRadius: 6, border: "1px solid " + G.border,
                              }}>
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{m.name}</span>
                                  <span style={{ fontSize: 10, color: G.muted, marginLeft: 6 }}>{m.type}</span>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <span style={{ fontSize: 11, color: "#ff6b6b", fontWeight: 700 }}>{m.hp} PV</span>
                                  {m.dmg && <span style={{ fontSize: 10, color: G.muted }}>{m.dmg}</span>}
                                  {m.augments && <span style={{ fontSize: 9, color: G.purple }}>🔮 {m.augments.length}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Boss detail */}
                        {(dg.boss || dg.bosses) && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#e05252", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                              👑 {dg.bosses ? `Boss (${dg.bosses.length})` : "Boss"}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {(dg.bosses || [dg.boss]).map((b, bi) => (
                                <div key={bi} style={{
                                  background: "#e0525208", border: "1px solid #e0525220", borderRadius: 8, padding: 12,
                                }}>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)", marginBottom: 6 }}>
                                    {b.name}
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ fontSize: 12, color: G.text }}>
                                      ❤️ <span style={{ fontWeight: 700, color: "#ff6b6b" }}>{b.hp.toLocaleString()} PV</span>
                                      {b.level && <span style={{ color: G.muted }}> · Niveau fixé {b.level}</span>}
                                    </div>
                                    {b.dmg && <div style={{ fontSize: 12, color: G.text }}>⚔️ {b.dmg}</div>}
                                    {b.augments && b.augments.length > 0 && (
                                      <div style={{ marginTop: 4 }}>
                                        <span style={{ fontSize: 10, color: G.purple, fontWeight: 700 }}>Augments: </span>
                                        {b.augments.map((a, i) => (
                                          <span key={i} style={{
                                            fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 3,
                                            background: G.purple + "15", color: G.purple, fontWeight: 600,
                                          }}>{fmtAug(a)}</span>
                                        ))}
                                      </div>
                                    )}
                                    {b.scaling && (
                                      <div style={{ marginTop: 6, padding: "4px 8px", background: "#ff6b6b08", borderRadius: 4, border: "1px solid #ff6b6b15", fontSize: 10, color: G.muted }}>
                                        Boss scaling: PV ×{b.scaling.hp.base} +{(b.scaling.hp.perLv * 100)}%/niv · Dmg ×{b.scaling.dmg.base} +{(b.scaling.dmg.perLv * 100)}%/niv · Def cap {(b.scaling.def.abovePos * 100).toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Loot */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: G.accent2, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                            🎁 Loot
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {dg.loot.map((item, i) => (
                              <span key={i} style={{
                                fontSize: 11, padding: "4px 10px", borderRadius: 4,
                                background: G.accent2 + "10", border: "1px solid " + G.accent2 + "18",
                                color: G.accent2, fontWeight: 600,
                              }}>{item}</span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
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
  const inp = { width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + G.border, background: G.bg, color: "#fff", fontSize: 14, fontFamily: "var(--fb)", outline: "none" };
  const sel = { ...inp, cursor: "pointer", appearance: "auto" };

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: G.teal + "10", border: "1px solid " + G.teal + "20", fontSize: 11, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Partage de builds</div>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "0 0 8px", letterSpacing: 1 }}>Communauté</h1>
      <p style={{ fontSize: 16, color: G.muted, margin: "0 0 24px" }}>Parcours les builds de la communauté ou partage les tiens.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setShowPublish(!showPublish)} style={{ padding: "10px 22px", borderRadius: "var(--radius-md)", border: "2px solid " + G.teal, background: showPublish ? G.teal + "20" : G.teal + "10", color: G.teal, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 8 }}>{showPublish ? "✕ Annuler" : "📤 Publier un build"}</button>
        <button onClick={() => setPage("builds")} style={{ padding: "10px 22px", borderRadius: "var(--radius-md)", border: "2px solid " + G.border, background: "transparent", color: G.muted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--fb)", display: "flex", alignItems: "center", gap: 8 }}>⚔️ Créer un build</button>
      </div>

      {showPublish && (
        <div style={{ background: G.card, border: "1px solid " + G.teal + "30", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)", marginBottom: 16 }}>📤 Publier un build</div>
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
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "var(--fd)" }}>{b.name}</span>
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

export { Particles, Navbar, HomePage, WikiPage, BuildsPage, MapPage, DungeonsPage, CommunityPage };
