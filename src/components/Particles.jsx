// ═══════════════════════════════════════════════════
// PARTICLES — Ambient canvas background particles
// ═══════════════════════════════════════════════════
import { useEffect, useRef } from "react";

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth),
      h = (canvas.height = window.innerHeight);
    const COLORS = ["#e8a537", "#f0c06a", "#c8882a", "#e8a537", "#3dd8c5"];
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.05,
      size: Math.random() * 3 + 1.5,
      o: Math.random() * 0.3 + 0.05,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.3 + 0.1,
    }));
    let raf,
      t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
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
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

export { Particles };
