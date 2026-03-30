// ═══════════════════════════════════════════════════
// SITE — Landing page, navigation, wiki, map
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import {
  STATS, RACES, RACE_PREVIEWS, CLASS_PREVIEWS,
  WIKI_ITEMS, WIKI_MOBS, WIKI_RECIPES, ITEM_CATS, QUALITY_COLORS, MOB_CATS, SALVAGE_CATS,
} from './data.js';
import { G } from './styles.jsx';
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
      borderBottom: scrolled ? `2px solid ${G.teal}18` : "none",
      transition: "all 0.4s ease", padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-md)",
            background: `linear-gradient(135deg, ${G.teal}, ${G.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)",
            boxShadow: `0 0 16px ${G.teal}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
            border: "2px solid rgba(255,255,255,0.1)",
          }}>C</div>
          <span className="nav-title" style={{
            fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", letterSpacing: 1,
            background: `linear-gradient(135deg, ${G.teal}, ${G.accent2})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
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
        {/* Atmospheric glow orbs — Hytale ambient style */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, background: `radial-gradient(circle, ${G.teal}0a, transparent 70%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 350, height: 350, background: `radial-gradient(circle, ${G.purple}0a, transparent 70%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 500, height: 500, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${G.accent2}06, transparent 60%)`, borderRadius: "50%", filter: "blur(100px)" }} />
        
        {/* Decorative voxel blocks */}
        <div style={{ position: "absolute", top: "18%", left: "8%", width: 24, height: 24, background: G.teal, opacity: 0.08, transform: "rotate(15deg)", animation: "voxelFloat 6s ease infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "12%", width: 16, height: 16, background: G.purple, opacity: 0.1, transform: "rotate(-10deg)", animation: "voxelFloat 8s ease infinite 1s" }} />
        <div style={{ position: "absolute", bottom: "25%", left: "15%", width: 20, height: 20, background: G.accent2, opacity: 0.07, transform: "rotate(25deg)", animation: "voxelFloat 7s ease infinite 2s" }} />
        <div style={{ position: "absolute", top: "60%", right: "20%", width: 14, height: 14, background: G.blue, opacity: 0.09, transform: "rotate(-20deg)", animation: "voxelFloat 9s ease infinite 0.5s" }} />
        <div style={{ position: "absolute", bottom: "35%", right: "8%", width: 28, height: 28, background: G.green, opacity: 0.06, transform: "rotate(40deg)", animation: "voxelFloat 10s ease infinite 3s" }} />

        <div style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 22px", borderRadius: 4,
            background: `${G.teal}10`, border: `1px solid ${G.teal}25`,
            borderLeft: `3px solid ${G.teal}`,
            fontSize: 13, fontWeight: 700, color: G.teal, marginBottom: 28,
            fontFamily: "var(--fb)", letterSpacing: 0.8,
          }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: G.teal, borderRadius: 2, animation: "glowPulse 2s ease infinite" }} />
            Serveur Hytale PvE — EndlessLeveling v6.7
          </div>
        </div>

        <h1 style={{
          fontSize: "clamp(52px, 9vw, 88px)", fontWeight: 900, lineHeight: 1.0, margin: "0 0 24px",
          fontFamily: "var(--fd)", letterSpacing: 2,
          background: `linear-gradient(135deg, ${G.teal} 0%, #7cf5e6 20%, ${G.accent2} 50%, #ffd080 75%, ${G.teal} 100%)`,
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
          <div style={{ display: "inline-block", padding: "4px 16px", borderRadius: 4, background: `${G.teal}10`, border: `1px solid ${G.teal}20`, fontSize: 11, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Outils</div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", margin: "8px 0 10px", letterSpacing: 1, animation: "fadeSlideUp 0.6s ease both" }}>
            Tout pour ton aventure
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Des outils pensés pour les joueurs de CielDeVignis
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <FeatureCard icon="⚔️" title="Build Creator" desc="Crée et simule tes builds avec un calcul précis de toutes tes stats. Race, classes, SP, augments — tout y est." color={G.teal} delay={0.1} onClick={() => setPage("builds")} />
          <FeatureCard icon="🏰" title="Donjons & Monstres" desc="Explore le wiki pour découvrir les créatures, leurs drops, et les stratégies pour chaque donjon." color={G.accent2} delay={0.2} onClick={() => setPage("wiki")} />
          <FeatureCard icon="🗡️" title="Armes & Armures" desc="Toutes les armes et armures du serveur avec leurs stats, bonus, et compatibilité de classe." color={G.orange} delay={0.3} onClick={() => setPage("wiki")} />
          <FeatureCard icon="📊" title="Partage & Compare" desc="Sauvegarde tes builds, partage-les avec ta guilde, et compare les stats entre différentes configurations." color={G.purple} delay={0.4} />
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
          background: `linear-gradient(165deg, ${G.card}, ${G.teal}06)`,
          border: `1px solid ${G.teal}20`, position: "relative", overflow: "hidden",
          borderTop: `3px solid ${G.teal}50`,
        }}>
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.teal}04 1px, transparent 1px), linear-gradient(90deg, ${G.teal}04 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: `radial-gradient(circle, ${G.teal}0c, transparent)`, borderRadius: "50%" }} />
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
      <footer style={{ borderTop: `2px solid ${G.teal}15`, background: `${G.card}90`, marginTop: 20, position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${G.teal}03 1px, transparent 1px), linear-gradient(90deg, ${G.teal}03 1px, transparent 1px)`, backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 24px", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 36 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, background: `linear-gradient(135deg, ${G.teal}, ${G.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "var(--fd)", boxShadow: `0 0 12px ${G.teal}25` }}>C</div>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--fd)", color: "#fff", letterSpacing: 0.5 }}>CielDeVignis</span>
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                Serveur communautaire Hytale PvE.
                <br/>Explore, combats, théorycraft.
              </p>
            </div>
            {/* Outils */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Outils</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[{label:"Build Creator",icon:"⚔️",id:"builds"},{label:"Wiki",icon:"📖",id:"wiki"}].map(l=>(
                  <span key={l.id} onClick={()=>setPage(l.id)} className="footer-link" style={{ fontSize: "var(--text-sm)", color: G.muted, display: "flex", alignItems: "center", gap: 6 }}
                  >{l.icon} {l.label}</span>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Contenu</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{v:"12",l:"Races",c:G.accent2},{v:"14",l:"Classes",c:G.teal},{v:"55",l:"Augments",c:G.purple},{v:"72",l:"Évolutions",c:G.blue}].map(s=>(
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: G.muted }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: s.c, minWidth: 24 }}>{s.v}</span>{s.l}
                  </div>
                ))}
              </div>
            </div>
            {/* Communauté */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.teal, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, fontFamily: "var(--fd)" }}>Communauté</div>
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
          <div style={{ borderTop: `1px solid ${G.teal}10`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#3a5068" }}>© 2025 CielDeVignis — EndlessLeveling v6.7</div>
            <div style={{ fontSize: 11, color: "#3a5068" }}>Fait avec passion pour la communauté Hytale</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WikiPage() {
  const [wikiTab, setWikiTab] = useState("items");
  const [cat, setCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const fmtItem = (s) => s ? s.replace(/_/g, ' ') : '';
  const switchTab = (t) => { setWikiTab(t); setCat("ALL"); setSearch(""); setExpanded(null); };
  const tabs = [
    {id:"items",label:"Objets",icon:"⚔️",count:WIKI_ITEMS.length},
    {id:"mobs",label:"Créatures",icon:"🐉",count:WIKI_MOBS.length},
    {id:"salvage",label:"Salvage",icon:"♻️",count:WIKI_RECIPES.length},
  ];
  const activeCats = wikiTab === "items" ? ITEM_CATS : wikiTab === "mobs" ? MOB_CATS : SALVAGE_CATS;
  const filteredItems = wikiTab==="items" ? WIKI_ITEMS.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) : [];
  const filteredMobs = wikiTab==="mobs" ? WIKI_MOBS.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.id.toLowerCase().includes(search.toLowerCase())&&!(r.app||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) : [];
  const filteredSalvage = wikiTab==="salvage" ? WIKI_RECIPES.filter(r => {
    if (cat!=="ALL"&&r.c!==cat) return false;
    if (search&&!r.n.toLowerCase().includes(search.toLowerCase())&&!r.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) : [];
  const totalFiltered = wikiTab==="items"?filteredItems.length:wikiTab==="mobs"?filteredMobs.length:filteredSalvage.length;

  return (
    <div style={{ position:"relative",zIndex:1,padding:"100px 24px 60px",maxWidth:1200,margin:"0 auto" }}>
      <div style={{ display:"inline-block",padding:"4px 16px",borderRadius:4,background:G.teal+"10",border:"1px solid "+G.teal+"20",fontSize:11,fontWeight:800,color:G.teal,textTransform:"uppercase",letterSpacing:2,marginBottom:12 }}>Base de données</div>
      <h1 style={{ fontSize:38,fontWeight:900,color:"#fff",fontFamily:"var(--fd)",margin:"0 0 8px",letterSpacing:1 }}>Wiki CielDeVignis</h1>
      <p style={{ fontSize:16,color:G.muted,margin:"0 0 24px" }}>{WIKI_ITEMS.length} objets · {WIKI_MOBS.length} créatures · {WIKI_RECIPES.length} recettes de salvage</p>
      {/* Tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:20,borderBottom:"2px solid "+G.border }}>
        {tabs.map(t=><button key={t.id} onClick={()=>switchTab(t.id)} style={{ padding:"10px 20px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",background:wikiTab===t.id?G.card:"transparent",color:wikiTab===t.id?G.teal:G.muted,borderBottom:wikiTab===t.id?"2px solid "+G.teal:"2px solid transparent",fontWeight:700,fontSize:14,fontFamily:"var(--fb)",display:"flex",alignItems:"center",gap:6 }}><span style={{fontSize:16}}>{t.icon}</span> {t.label} <span style={{fontSize:11,opacity:0.6}}>{t.count}</span></button>)}
      </div>
      {/* Filters */}
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
        <button onClick={()=>setCat("ALL")} style={{ padding:"6px 14px",borderRadius:"var(--radius-md)",border:"2px solid "+(cat==="ALL"?G.teal:G.border),background:cat==="ALL"?G.teal+"15":"transparent",color:cat==="ALL"?G.teal:G.muted,fontWeight:700,fontSize:12,cursor:"pointer" }}>Tous</button>
        {activeCats.map(c=><button key={c.id} onClick={()=>setCat(c.id)} style={{ padding:"6px 14px",borderRadius:"var(--radius-md)",border:"2px solid "+(cat===c.id?c.color:G.border),background:cat===c.id?c.color+"15":"transparent",color:cat===c.id?c.color:G.muted,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}><span style={{fontSize:13}}>{c.icon}</span> {c.label}</button>)}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{ width:"100%",maxWidth:500,padding:"10px 16px",borderRadius:"var(--radius-md)",border:"1px solid "+G.border,background:G.card,color:"#fff",fontSize:14,fontFamily:"var(--fb)",outline:"none",marginBottom:14 }}/>
      <div style={{ fontSize:12,color:G.muted,marginBottom:14 }}>{totalFiltered} résultat{totalFiltered>1?"s":""}</div>

      {/* ITEMS */}
      {wikiTab==="items"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
        {filteredItems.map(r=>{const isOpen=expanded===r.id;const catInfo=ITEM_CATS.find(c=>c.id===r.c)||{color:G.muted,icon:"📦"};const qc=QUALITY_COLORS[r.q]||G.muted;return(
          <div key={r.id} onClick={()=>setExpanded(isOpen?null:r.id)} style={{background:isOpen?G.card:"transparent",border:"1px solid "+(isOpen?qc+"30":G.border+"60"),borderLeft:"3px solid "+qc+(isOpen?"":"40"),borderRadius:"var(--radius-md)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"}}>
              <span style={{fontSize:18,flexShrink:0}}>{catInfo.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{fmtItem(r.id)}</div>
                <div style={{display:"flex",gap:6,fontSize:11,color:G.muted,marginTop:2}}>{r.sc&&<span>{r.sc}</span>}{r.l>0&&<span>Niv. {r.l}</span>}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
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
                  {r.r.map(([id,qty],i)=><div key={i} style={{background:G.teal+"08",border:"1px solid "+G.teal+"18",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{fmtItem(id)}</span><span style={{fontWeight:800,color:G.teal}}>×{qty}</span></div>)}
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
          const showHeader=firstLetter!==prevLetter;
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
              <span style={{fontSize:18,flexShrink:0}}>{catInfo.icon}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:isOpen?"#fff":G.text,fontFamily:"var(--fd)"}}>{r.n}</div><div style={{fontSize:11,color:G.muted}}>{fmtItem(r.id)}</div></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:catInfo.color+"12",color:catInfo.color,fontWeight:700}}>{r.c}</span>
                <span style={{fontSize:10,color:G.muted}}>{r.t}s</span>
                <span style={{fontSize:12,color:G.muted,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</span>
              </div>
            </div>
            {isOpen&&<div style={{padding:"0 14px 14px",borderTop:"1px solid "+G.border}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"flex-start",marginTop:12}}>
                <div><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Entrée</div><div style={{background:"#ff6b6b08",border:"1px solid #ff6b6b18",borderRadius:"var(--radius-md)",padding:"8px 12px"}}><div style={{fontSize:13,fontWeight:700,color:"#ff6b6b"}}>1× {fmtItem(r.id)}</div></div></div>
                <div style={{paddingTop:28,fontSize:20,color:G.teal}}>→</div>
                <div><div style={{fontSize:10,fontWeight:800,color:G.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Sorties</div>{r.o.map(([item,qty],i)=><div key={i} style={{background:G.teal+"08",border:"1px solid "+G.teal+"18",borderRadius:4,padding:"4px 10px",marginBottom:3,display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:G.text}}>{fmtItem(item)}</span><span style={{fontWeight:800,color:G.teal}}>×{qty}</span></div>)}</div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:G.muted}}>🔨 {fmtItem(r.b)} · ⏱️ {r.t}s</div>
            </div>}
          </div>)})}
      </div>}

      {totalFiltered===0&&<div style={{textAlign:"center",padding:40,color:G.muted,fontSize:14}}>Aucun résultat.</div>}
    </div>
  );
}

function BuildsPage() {
  return (
    <div style={{ position: "relative", zIndex: 1, paddingTop: 72 }}>
      <BuildCreator />
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

export { Particles, Navbar, HomePage, WikiPage, BuildsPage, MapPage };
