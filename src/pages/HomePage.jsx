// ═══════════════════════════════════════════════════
// HOME PAGE — Landing page with magical hero
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { RACE_PREVIEWS, CLASS_PREVIEWS } from "../data/core.js";
import { G } from "../styles.jsx";
import { FeatureCard } from "../components/FeatureCard.jsx";
import { RacePreview } from "../components/RacePreview.jsx";

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
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sky gradient — magical night (Direction C) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, #0a0812 0%, #0f0a1a 10%, #1a1228 22%, #2a1a34 34%, #3a2240 46%, #3a3048 56%, #2a2238 68%, #1a1428 82%, #0e0a14 94%, #12100c 100%)",
          }}
        />

        {/* Mystical moonlit glow (replaces sun) */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: `translateX(-50%) ${px(-0.15)}`,
            width: 380,
            height: 200,
            background:
              "radial-gradient(ellipse, #c9a5ff30, #a878ff1a, #3dd8c510, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: `translateX(-50%) ${px(-0.12)}`,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f0e6d228, #c9a5ff20, transparent 70%)",
            boxShadow: "0 0 60px #a878ff20",
            pointerEvents: "none",
          }}
        />

        {/* Arcane rays */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "46%",
            width: 3,
            height: 140,
            background: "linear-gradient(180deg, #a878ff1a, transparent)",
            transform: "rotate(-6deg)",
            transformOrigin: "top",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "54%",
            width: 2,
            height: 120,
            background: "linear-gradient(180deg, #3dd8c518, transparent)",
            transform: "rotate(5deg)",
            transformOrigin: "top",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "50%",
            width: 2,
            height: 130,
            background: "linear-gradient(180deg, #c9a5ff14, transparent)",
            transform: "rotate(-1deg)",
            transformOrigin: "top",
            pointerEvents: "none",
          }}
        />

        {/* Clouds */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "5%",
            width: 300,
            height: 50,
            background: "radial-gradient(ellipse, #1a1a2820, transparent)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "3%",
            right: "10%",
            width: 250,
            height: 45,
            background: "radial-gradient(ellipse, #2a203818, transparent)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* ═══ MAGIC — AURORA LAYERS ═══ */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "-10%",
            right: "-10%",
            height: 200,
            pointerEvents: "none",
            opacity: 0.4,
            filter: "blur(20px)",
            background: "linear-gradient(90deg, transparent, #e8a53766, transparent)",
            animation: "cdvAurora 12s ease-in-out infinite",
            transform: px(-0.06),
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "-10%",
            right: "-10%",
            height: 200,
            pointerEvents: "none",
            opacity: 0.4,
            filter: "blur(20px)",
            background: "linear-gradient(90deg, transparent, #3dd8c54d, transparent)",
            animation: "cdvAurora 16s ease-in-out infinite 2s",
            transform: px(-0.05),
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "-10%",
            right: "-10%",
            height: 200,
            pointerEvents: "none",
            opacity: 0.4,
            filter: "blur(20px)",
            background: "linear-gradient(90deg, transparent, #a878ff4d, transparent)",
            animation: "cdvAurora 14s ease-in-out infinite 4s",
            transform: px(-0.06),
          }}
        />

        {/* ═══ MAGIC — TWINKLING STARS (mystic color mix) ═══ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            pointerEvents: "none",
            transform: px(-0.03),
          }}
        >
          <svg
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <g fill="#f0c06a">
              <circle
                cx="85"
                cy="22"
                r="0.9"
                className="cdv-star"
                style={{ animationDelay: "0s" }}
              />
              <circle
                cx="178"
                cy="52"
                r="0.8"
                className="cdv-star"
                style={{ animationDelay: "1s" }}
              />
              <circle
                cx="278"
                cy="16"
                r="1"
                className="cdv-star"
                style={{ animationDelay: "2s" }}
              />
              <circle
                cx="378"
                cy="72"
                r="0.8"
                className="cdv-star"
                style={{ animationDelay: "0.6s" }}
              />
              <circle
                cx="720"
                cy="38"
                r="0.9"
                className="cdv-star"
                style={{ animationDelay: "1.5s" }}
              />
              <circle
                cx="818"
                cy="62"
                r="0.7"
                className="cdv-star"
                style={{ animationDelay: "2.2s" }}
              />
              <circle
                cx="918"
                cy="26"
                r="1"
                className="cdv-star"
                style={{ animationDelay: "0.8s" }}
              />
              <circle
                cx="128"
                cy="96"
                r="0.7"
                className="cdv-star"
                style={{ animationDelay: "2.8s" }}
              />
              <circle
                cx="868"
                cy="112"
                r="0.8"
                className="cdv-star"
                style={{ animationDelay: "1.9s" }}
              />
              <circle
                cx="475"
                cy="144"
                r="0.7"
                className="cdv-star"
                style={{ animationDelay: "3.1s" }}
              />
            </g>
            <g fill="#c9a5ff">
              <circle
                cx="220"
                cy="88"
                r="0.9"
                className="cdv-star"
                style={{ animationDelay: "0.4s" }}
              />
              <circle
                cx="600"
                cy="22"
                r="1"
                className="cdv-star"
                style={{ animationDelay: "1.7s" }}
              />
              <circle
                cx="760"
                cy="96"
                r="0.8"
                className="cdv-star"
                style={{ animationDelay: "2.5s" }}
              />
              <circle
                cx="480"
                cy="56"
                r="0.9"
                className="cdv-star"
                style={{ animationDelay: "0.2s" }}
              />
              <circle
                cx="340"
                cy="120"
                r="0.7"
                className="cdv-star"
                style={{ animationDelay: "2.9s" }}
              />
            </g>
            <g fill="#a5eedd">
              <circle
                cx="320"
                cy="140"
                r="0.8"
                className="cdv-star"
                style={{ animationDelay: "1.3s" }}
              />
              <circle
                cx="680"
                cy="142"
                r="0.9"
                className="cdv-star"
                style={{ animationDelay: "0.7s" }}
              />
              <circle
                cx="560"
                cy="168"
                r="0.7"
                className="cdv-star"
                style={{ animationDelay: "2.4s" }}
              />
            </g>
          </svg>
        </div>

        {/* ═══ MAGIC — ARCANE PORTAL (background) ═══ */}
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: `translateX(-50%) ${px(-0.08)}`,
            width: 260,
            height: 200,
            pointerEvents: "none",
            opacity: 0.6,
          }}
        >
          <svg viewBox="0 0 260 200" style={{ width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="cdvPortalGrad">
                <stop offset="0%" stopColor="#f0c06a" stopOpacity="0.65" />
                <stop offset="40%" stopColor="#c9a5ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3dd8c5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g className="cdv-portal-outer">
              <circle
                cx="130"
                cy="100"
                r="90"
                fill="none"
                stroke="#e8a537"
                strokeWidth="0.6"
                strokeDasharray="4 5"
                opacity="0.6"
              />
              <circle
                cx="130"
                cy="100"
                r="82"
                fill="none"
                stroke="#c9a5ff"
                strokeWidth="0.4"
                strokeDasharray="2 6"
                opacity="0.5"
              />
              <circle cx="130" cy="10" r="2" fill="#f0c06a" opacity="0.7" />
              <circle cx="220" cy="100" r="2" fill="#f0c06a" opacity="0.7" />
              <circle cx="130" cy="190" r="2" fill="#f0c06a" opacity="0.7" />
              <circle cx="40" cy="100" r="2" fill="#f0c06a" opacity="0.7" />
            </g>
            <g className="cdv-portal-inner">
              <circle
                cx="130"
                cy="100"
                r="62"
                fill="none"
                stroke="#3dd8c5"
                strokeWidth="0.5"
                strokeDasharray="3 4"
                opacity="0.4"
              />
              <text
                x="130"
                y="42"
                textAnchor="middle"
                fontFamily="var(--fd), serif"
                fontSize="11"
                fill="#c9a5ff"
                opacity="0.6"
              >
                ᛟ
              </text>
              <text
                x="188"
                y="104"
                textAnchor="middle"
                fontFamily="var(--fd), serif"
                fontSize="11"
                fill="#c9a5ff"
                opacity="0.6"
              >
                ᛉ
              </text>
              <text
                x="130"
                y="166"
                textAnchor="middle"
                fontFamily="var(--fd), serif"
                fontSize="11"
                fill="#c9a5ff"
                opacity="0.6"
              >
                ᛇ
              </text>
              <text
                x="72"
                y="104"
                textAnchor="middle"
                fontFamily="var(--fd), serif"
                fontSize="11"
                fill="#c9a5ff"
                opacity="0.6"
              >
                ᛚ
              </text>
            </g>
            <g className="cdv-portal-core">
              <ellipse
                cx="130"
                cy="100"
                rx="48"
                ry="42"
                fill="url(#cdvPortalGrad)"
                opacity="0.55"
              />
            </g>
          </svg>
        </div>

        {/* ═══ MAGIC — PHOENIX (distant, crossing) ═══ */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "-8%",
            width: 140,
            height: 70,
            opacity: 0.85,
            pointerEvents: "none",
            animation: "cdvPhoenixFly 28s linear infinite",
            filter: "drop-shadow(0 0 18px #e8a53780)",
            transform: px(-0.18),
          }}
        >
          <svg viewBox="0 0 140 70" style={{ width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="cdvPBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffecb4" />
                <stop offset="50%" stopColor="#e8a537" />
                <stop offset="100%" stopColor="#c45a2d" />
              </linearGradient>
              <linearGradient id="cdvPWing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffecb4" />
                <stop offset="40%" stopColor="#f0c06a" />
                <stop offset="100%" stopColor="#c45a2d" />
              </linearGradient>
              <linearGradient id="cdvPTrail" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#ffecb4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e8a537" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="cdv-phoenix-trail">
              <ellipse cx="25" cy="35" rx="15" ry="3" fill="url(#cdvPTrail)" opacity="0.6" />
              <ellipse cx="10" cy="35" rx="10" ry="2" fill="#f0c06a" opacity="0.4" />
            </g>
            <ellipse cx="70" cy="38" rx="15" ry="4.5" fill="url(#cdvPBody)" />
            <ellipse cx="56" cy="33" rx="5" ry="3.2" fill="#ffecb4" />
            <path d="M51 33 L45 35 L51 36" fill="#e8a537" />
            <circle cx="54" cy="32.5" r="0.8" fill="#2a1810" />
            <g
              style={{
                transformOrigin: "60px 35px",
                animation: "cdvPhoenixFlap 1.4s ease-in-out infinite",
              }}
            >
              <path
                d="M60 35 L32 14 L42 26 L22 6 L48 24 L14 0 L52 22"
                fill="url(#cdvPWing)"
                opacity="0.95"
              />
            </g>
            <g
              style={{
                transformOrigin: "80px 35px",
                animation: "cdvPhoenixFlap 1.4s ease-in-out infinite 0.1s",
              }}
            >
              <path
                d="M80 35 L108 12 L100 24 L118 4 L104 22 L126 0 L114 20"
                fill="url(#cdvPWing)"
                opacity="0.95"
              />
            </g>
            <path d="M85 40 Q95 48 105 42 L110 48 L100 44 L115 52 L103 46" fill="#e8a537" />
          </svg>
        </div>

        {/* ═══ MAGIC — FLOATING ORBS ═══ */}
        <div
          style={{
            position: "absolute",
            top: "42%",
            left: "12%",
            width: 14,
            height: 14,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #ffecb4f0 0%, #e8a53780 40%, transparent 70%)",
            boxShadow: "0 0 25px #e8a537b0, 0 0 45px #f0c06a66",
            animation: "cdvOrbFloat 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "58%",
            left: "20%",
            width: 11,
            height: 11,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #a5fff0e6 0%, #3dd8c573 40%, transparent 70%)",
            boxShadow: "0 0 25px #3dd8c5a6, 0 0 45px #64f0dc59",
            animation: "cdvOrbFloat 8s ease-in-out infinite 2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "48%",
            right: "15%",
            width: 13,
            height: 13,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #dcb4ffe6 0%, #a878ff73 40%, transparent 70%)",
            boxShadow: "0 0 25px #a878ff99, 0 0 45px #c896ff59",
            animation: "cdvOrbFloat 8s ease-in-out infinite 1s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "22%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #ffecb4f0 0%, #e8a53780 40%, transparent 70%)",
            boxShadow: "0 0 25px #e8a537b0, 0 0 45px #f0c06a66",
            animation: "cdvOrbFloat 8s ease-in-out infinite 3s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: "32%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #a5fff0e6 0%, #3dd8c573 40%, transparent 70%)",
            boxShadow: "0 0 20px #3dd8c5a6",
            animation: "cdvOrbFloat 8s ease-in-out infinite 4s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "38%",
            right: "32%",
            width: 9,
            height: 9,
            borderRadius: "50%",
            pointerEvents: "none",
            background: "radial-gradient(circle, #dcb4ffe6 0%, #a878ff73 40%, transparent 70%)",
            boxShadow: "0 0 22px #a878ff99",
            animation: "cdvOrbFloat 8s ease-in-out infinite 5s",
          }}
        />

        {/* ═══ MAIN DRAGON — animated wings (with arcane aura) ═══ */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            width: 220,
            height: 120,
            pointerEvents: "none",
            opacity: 0.85,
            animation: "dragonFly 8s ease-in-out infinite",
            transform: px(-0.25),
            filter: "drop-shadow(0 0 16px #a878ff40)",
          }}
        >
          <svg viewBox="0 0 220 120" style={{ width: "100%", height: "100%" }}>
            <g
              style={{
                transformOrigin: "90px 58px",
                animation: "wingFlap 1.8s ease-in-out infinite",
              }}
            >
              <path
                d="M90 58 L22 18 L42 40 L8 6 L46 34 L0 0 L52 32"
                fill="#0e0c08"
                opacity="0.95"
              />
              <path d="M52 32 L66 48 L90 58" fill="#0e0c08" />
              <path d="M90 58 L22 18" stroke="#1a1610" strokeWidth="0.7" />
              <path d="M90 58 L8 6" stroke="#1a1610" strokeWidth="0.7" />
              <path d="M90 58 L0 0" stroke="#1a1610" strokeWidth="0.7" />
            </g>
            <g
              style={{
                transformOrigin: "128px 58px",
                animation: "wingFlap 1.8s ease-in-out infinite 0.15s",
              }}
            >
              <path
                d="M128 58 L192 16 L174 40 L210 6 L170 34 L220 0 L164 32"
                fill="#0e0c08"
                opacity="0.95"
              />
              <path d="M164 32 L150 48 L128 58" fill="#0e0c08" />
              <path d="M128 58 L192 16" stroke="#1a1610" strokeWidth="0.7" />
              <path d="M128 58 L210 6" stroke="#1a1610" strokeWidth="0.7" />
              <path d="M128 58 L220 0" stroke="#1a1610" strokeWidth="0.7" />
            </g>
            <ellipse cx="110" cy="65" rx="24" ry="10" fill="#0e0c08" />
            <path
              d="M88 60 Q68 46 52 34 Q46 28 40 30"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <ellipse cx="38" cy="29" rx="9" ry="5.5" fill="#0e0c08" />
            <path d="M30 28 L22 32 L30 33" fill="#0e0c08" />
            <path d="M33 23 L30 16" stroke="#0e0c08" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M39 24 L38 18" stroke="#0e0c08" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="33" cy="27" r="1.8" fill="#c9a5ff" className="cdv-dragon-eye" />
            <circle cx="33" cy="27" r="0.7" fill="#fff3d4" />
            <path
              d="M134 65 Q156 70 174 60 Q184 54 192 58"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path d="M192 58 L200 51 L196 63 L192 58Z" fill="#0e0c08" />
            <path
              d="M95 74 L91 84 L97 82"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M125 74 L129 84 L123 82"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M90 57 L87 52 M96 55 L93 50 M102 55 L99 50 M108 56 L105 51"
              stroke="#0e0c08"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Second smaller dragon — animated */}
        <div
          style={{
            position: "absolute",
            top: "22%",
            right: "12%",
            width: 65,
            height: 35,
            opacity: 0.45,
            pointerEvents: "none",
            animation: "dragonSmall 10s ease-in-out infinite 2s",
          }}
        >
          <svg viewBox="0 0 55 30" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="27" cy="17" rx="7" ry="3.5" fill="#0e0c08" />
            <path
              d="M20 15 Q14 10 10 8"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <ellipse cx="9" cy="7.5" rx="3" ry="2" fill="#0e0c08" />
            <g
              style={{
                transformOrigin: "22px 14px",
                animation: "wingSmall 2.2s ease-in-out infinite",
              }}
            >
              <path d="M22 14 L8 4 L14 10 L4 0 L16 9" fill="#0e0c08" />
            </g>
            <g
              style={{
                transformOrigin: "32px 14px",
                animation: "wingSmall 2.2s ease-in-out infinite 0.1s",
              }}
            >
              <path d="M32 14 L44 3 L38 10 L50 0 L36 9" fill="#0e0c08" />
            </g>
            <path
              d="M34 17 Q40 19 44 16 Q46 14 48 16"
              fill="none"
              stroke="#0e0c08"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Birds far away */}
        <div style={{ position: "absolute", top: "18%", left: "20%", pointerEvents: "none" }}>
          <svg viewBox="0 0 14 7" width="14" height="7">
            <path
              d="M0 5 Q3.5 0 7 4 Q10.5 0 14 5"
              fill="none"
              stroke="#0e0c0850"
              strokeWidth="1.2"
            />
          </svg>
        </div>
        <div style={{ position: "absolute", top: "24%", left: "25%", pointerEvents: "none" }}>
          <svg viewBox="0 0 10 5" width="10" height="5">
            <path
              d="M0 3.5 Q2.5 0 5 3 Q7.5 0 10 3.5"
              fill="none"
              stroke="#0e0c0835"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Mountains */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: 0,
            right: 0,
            height: 120,
            pointerEvents: "none",
            transform: px(-0.08),
          }}
        >
          <svg
            viewBox="0 0 680 120"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0 120 L0 78 L30 55 L65 68 L105 32 L140 50 L180 24 L215 44 L255 18 L295 40 L335 26 L370 48 L410 16 L445 42 L485 22 L520 44 L555 30 L595 50 L635 34 L680 48 L680 120Z"
              fill="#1a1610"
            />
          </svg>
        </div>

        {/* Fortress */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "38%",
            width: 80,
            height: 105,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 80 105" style={{ width: "100%", height: "100%" }}>
            <rect x="24" y="25" width="32" height="80" fill="#1e1a12" />
            <rect x="24" y="20" width="7" height="8" fill="#1e1a12" />
            <rect x="34" y="20" width="7" height="8" fill="#1e1a12" />
            <rect x="44" y="20" width="7" height="8" fill="#1e1a12" />
            <polygon points="40,0 48,20 32,20" fill="#1e1a12" />
            <rect x="5" y="42" width="19" height="63" fill="#1e1a12" />
            <rect x="5" y="37" width="5" height="7" fill="#1e1a12" />
            <rect x="12" y="37" width="5" height="7" fill="#1e1a12" />
            <polygon points="14,28 22,37 7,37" fill="#1e1a12" />
            <rect x="56" y="38" width="19" height="67" fill="#1e1a12" />
            <rect x="56" y="33" width="5" height="7" fill="#1e1a12" />
            <rect x="63" y="33" width="5" height="7" fill="#1e1a12" />
            <polygon points="65,24 75,33 56,33" fill="#1e1a12" />
            <rect x="0" y="60" width="5" height="45" fill="#1e1a12" />
            <rect x="75" y="55" width="5" height="50" fill="#1e1a12" />
            <rect x="34" y="82" width="12" height="23" rx="6" fill="#14120c" />
            <rect x="36" y="40" width="4" height="5" fill="#e8a53718" rx="1" />
            <rect x="36" y="54" width="4" height="5" fill="#e8a53714" rx="1" />
            <rect x="36" y="68" width="4" height="5" fill="#e8a53710" rx="1" />
            <rect x="10" y="55" width="3" height="4" fill="#e8a53712" rx="0.5" />
            <rect x="10" y="68" width="3" height="4" fill="#e8a53710" rx="0.5" />
            <rect x="61" y="50" width="3" height="4" fill="#e8a53712" rx="0.5" />
            <rect x="61" y="63" width="3" height="4" fill="#e8a53710" rx="0.5" />
          </svg>
        </div>

        {/* Village houses */}
        <div
          style={{
            position: "absolute",
            bottom: "9%",
            left: "25%",
            width: 14,
            height: 14,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 14 14" style={{ width: "100%", height: "100%" }}>
            <rect x="1" y="6" width="12" height="8" fill="#1a1610" />
            <polygon points="0,6 7,0 14,6" fill="#1a1610" />
            <rect x="4" y="8" width="2" height="2" fill="#e8a53710" rx="0.5" />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8.5%",
            right: "23%",
            width: 12,
            height: 13,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 12 13" style={{ width: "100%", height: "100%" }}>
            <rect x="1" y="5.5" width="10" height="7.5" fill="#1a1610" />
            <polygon points="0,5.5 6,0 12,5.5" fill="#1a1610" />
            <rect x="4" y="7.5" width="2" height="2" fill="#e8a53710" rx="0.4" />
          </svg>
        </div>

        {/* Trees */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            width: 14,
            height: 38,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 14 38" style={{ width: "100%", height: "100%" }}>
            <line x1="7" y1="38" x2="7" y2="6" stroke="#16130e" strokeWidth="2.2" />
            <line x1="7" y1="14" x2="2" y2="6" stroke="#16130e" strokeWidth="1.5" />
            <line x1="7" y1="20" x2="12" y2="12" stroke="#16130e" strokeWidth="1.5" />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8.5%",
            right: "9%",
            width: 18,
            height: 34,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 18 34" style={{ width: "100%", height: "100%" }}>
            <polygon points="9,0 17,23 1,23" fill="#16140f" />
            <rect x="7" y="23" width="4" height="11" fill="#16140f" />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "9.5%",
            right: "14%",
            width: 13,
            height: 27,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 13 27" style={{ width: "100%", height: "100%" }}>
            <polygon points="6.5,0 13,19 0,19" fill="#16140f" />
            <rect x="4.5" y="19" width="4" height="8" fill="#16140f" />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "16%",
            width: 15,
            height: 30,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 15 30" style={{ width: "100%", height: "100%" }}>
            <polygon points="7.5,0 14,20 1,20" fill="#18150f" />
            <rect x="5.5" y="20" width="4" height="10" fill="#18150f" />
          </svg>
        </div>

        {/* Foreground */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10%",
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 680 60"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0 60 L0 32 Q100 22 220 28 Q340 16 460 24 Q560 14 680 22 L680 60Z"
              fill="#12100c"
            />
          </svg>
        </div>

        {/* Horizon glow band (magical) */}
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: 0,
            right: 0,
            height: 35,
            background:
              "linear-gradient(180deg, transparent, #a878ff0c, #c9a5ff08, #3dd8c506, transparent)",
            pointerEvents: "none",
          }}
        />

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
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: 50 + (i % 3) * 8,
                left: e.x,
                animation: `${e.drift} ${e.dDur}s ease-in-out infinite ${e.d}s`,
              }}
            >
              <div
                style={{
                  "--ec": e.c,
                  width: e.s,
                  height: e.s,
                  borderRadius: "50%",
                  background: e.c,
                  animation: `ember ${e.dur}s ease-out infinite ${e.d}s, pulseGlow ${0.7 + (i % 4) * 0.2}s ease-in-out infinite`,
                }}
              />
            </div>
          ))}
        </div>

        {/* ═══ CINEMATIC TITLE ═══ */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              color: "#8a6a40",
              letterSpacing: 5,
              marginBottom: 14,
              textTransform: "uppercase",
              fontFamily: "var(--fd)",
              animation: "subIn 1s ease-out 0.3s both",
            }}
          >
            ⚔ Serveur PvE Hytale ⚔
          </div>

          <h1 style={{ margin: "0 0 0", position: "relative", display: "inline-block" }}>
            {"Ciel de Vignis".split("").map((ch, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: "clamp(42px, 7vw, 72px)",
                  fontWeight: 900,
                  fontFamily: "var(--fd)",
                  letterSpacing: 3,
                  animation: `letterIn 0.5s ease-out ${1.0 + i * 0.09}s both`,
                  ...(ch === " " ? { width: "0.3em" } : {}),
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
            <div
              style={{
                position: "absolute",
                bottom: -4,
                left: 0,
                right: 0,
                height: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "40%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, #e8a537, #f0c06a, #e8a537, transparent)",
                  animation: "flashSweep 1s ease-out 2.5s both",
                }}
              />
            </div>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2.2vw, 19px)",
              color: "#c9a878",
              fontFamily: "var(--fd)",
              fontStyle: "italic",
              margin: "18px auto 36px",
              textShadow: "0 1px 12px #000a",
              animation: "fadeUp 0.8s ease-out 3s both",
            }}
          >
            Forge ton destin. Maîtrise les éléments.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "fadeUp 0.8s ease-out 3.5s both",
            }}
          >
            <button onClick={() => setPage("builds")} className="btn-primary-lg">
              ⚔️ Forger un Build
            </button>
            <button
              onClick={() => window.open("https://discord.gg/7YmTATJcf", "_blank")}
              className="btn-discord"
            >
              💬 Rejoindre Discord
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            animation: "bounce 2s ease infinite",
            opacity: 0.35,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 22,
              height: 38,
              borderRadius: 9,
              border: "1px solid #4a403060",
              display: "flex",
              justifyContent: "center",
              paddingTop: 8,
            }}
          >
            <div style={{ width: 3, height: 8, borderRadius: 2, background: "#e8a53780" }} />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: "20px 24px 50px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 120,
              height: 1,
              background: "linear-gradient(90deg, transparent, #e8a53725)",
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: "#6a5a40",
              letterSpacing: 3,
              fontFamily: "var(--fd)",
              textTransform: "uppercase",
            }}
          >
            En chiffres
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 120,
              height: 1,
              background: "linear-gradient(90deg, #e8a53725, transparent)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
            textAlign: "center",
          }}
        >
          {[
            { v: "8594", l: "objets", c: G.gold },
            { v: "72", l: "races", c: G.teal },
            { v: "14", l: "classes", c: G.blue },
            { v: "11", l: "donjons", c: G.orange },
            { v: "55", l: "augments", c: G.purple },
            { v: "29", l: "mods", c: "#f0c06a" },
          ].map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: "var(--fd)" }}>
                {s.v}
              </div>
              <div style={{ fontSize: 11, color: "#6a5a45" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: 120,
                height: 1,
                background: "linear-gradient(90deg, transparent, #e8a53725)",
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "#6a5a40",
                letterSpacing: 3,
                fontFamily: "var(--fd)",
                textTransform: "uppercase",
              }}
            >
              Découvrir
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 120,
                height: 1,
                background: "linear-gradient(90deg, #e8a53725, transparent)",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "#f0e6d2",
              fontFamily: "var(--fd)",
              margin: "8px 0 10px",
              letterSpacing: 1,
              animation: "fadeSlideUp 0.6s ease both",
            }}
          >
            Tout pour ton aventure
          </h2>
          <p style={{ fontSize: 16, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Des outils pensés pour les joueurs de CielDeVignis
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <FeatureCard
            icon="⚔️"
            title="Build Creator"
            desc="Crée et simule tes builds avec un calcul précis de toutes tes stats. Race, classes, SP, augments — tout y est."
            color={G.teal}
            delay={0.1}
            onClick={() => setPage("builds")}
          />
          <FeatureCard
            icon="🏰"
            title="Donjons & Monstres"
            desc="Explore les 11 donjons du serveur — niveaux, boss, scaling et loot pour chaque instance."
            color={G.gold}
            delay={0.2}
            onClick={() => setPage("dungeons")}
          />
          <FeatureCard
            icon="🗡️"
            title="Armes & Armures"
            desc="Toutes les armes et armures du serveur avec leurs stats, bonus, et compatibilité de classe."
            color={G.orange}
            delay={0.3}
            onClick={() => setPage("wiki")}
          />
          <FeatureCard
            icon="📊"
            title="Communauté"
            desc="Partage tes builds, explore ceux de ta guilde, et compare les configurations."
            color={G.purple}
            delay={0.4}
            onClick={() => setPage("community")}
          />
        </div>
      </section>

      {/* RACES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: 100,
                height: 1,
                background: "linear-gradient(90deg, transparent, #e8a53720)",
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "#6a5a40",
                letterSpacing: 3,
                fontFamily: "var(--fd)",
                textTransform: "uppercase",
              }}
            >
              Races
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 100,
                height: 1,
                background: "linear-gradient(90deg, #e8a53720, transparent)",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              fontFamily: "var(--fd)",
              margin: "8px 0 8px",
              letterSpacing: 0.5,
            }}
          >
            12 Races
          </h2>
          <p style={{ fontSize: 14, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Chacune avec un arbre d'ascension unique en 4 étapes
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {RACE_PREVIEWS.map((r, i) => (
            <RacePreview key={r.name} race={r} delay={0.05 * i} />
          ))}
        </div>
      </section>

      {/* CLASSES SHOWCASE */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: 100,
                height: 1,
                background: "linear-gradient(90deg, transparent, #e8a53720)",
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "#6a5a40",
                letterSpacing: 3,
                fontFamily: "var(--fd)",
                textTransform: "uppercase",
              }}
            >
              Classes
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 100,
                height: 1,
                background: "linear-gradient(90deg, #e8a53720, transparent)",
              }}
            />
          </div>
          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              fontFamily: "var(--fd)",
              margin: "8px 0 8px",
              letterSpacing: 0.5,
            }}
          >
            14 Classes × 5 Tiers
          </h2>
          <p style={{ fontSize: 14, color: G.muted, margin: 0, fontFamily: "var(--fb)" }}>
            Classe primaire + secondaire — des milliers de combinaisons
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {CLASS_PREVIEWS.map((c, i) => (
            <div
              key={c.name}
              className="class-preview"
              style={{
                background: `${c.color}08`,
                border: `1px solid ${c.color}20`,
                borderRadius: "var(--radius-md)",
                borderLeft: `3px solid ${c.color}50`,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: `fadeSlideUp 0.4s ease ${0.03 * i}s both`,
              }}
            >
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--fw-bold)",
                  color: c.color,
                  fontFamily: "var(--fd)",
                  letterSpacing: 0.3,
                }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px 100px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "52px 44px",
            borderRadius: "var(--radius-md)",
            background: `linear-gradient(165deg, ${G.card}, ${G.gold}06)`,
            border: `1px solid ${G.gold}18`,
            position: "relative",
            overflow: "hidden",
            borderTop: `2px solid ${G.gold}40`,
          }}
        >
          {/* Grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(${G.gold}03 1px, transparent 1px), linear-gradient(90deg, ${G.gold}03 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              background: `radial-gradient(circle, ${G.gold}0a, transparent)`,
              borderRadius: "50%",
            }}
          />
          <h2
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#f0e6d2",
              margin: "0 0 14px",
              fontFamily: "var(--fd)",
              position: "relative",
              letterSpacing: 1,
            }}
          >
            Prêt à créer ton build ?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: G.muted,
              margin: "0 0 32px",
              fontFamily: "var(--fb)",
              position: "relative",
            }}
          >
            Théorycraft ta combinaison parfaite de race, classes et augments.
          </p>
          <button
            onClick={() => setPage("builds")}
            className="btn-primary-lg"
            style={{ padding: "16px 52px", fontSize: 18, position: "relative" }}
          >
            ⚔️ Lancer le Build Creator
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${G.gold}12`,
          background: `${G.card}90`,
          marginTop: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${G.gold}02 1px, transparent 1px), linear-gradient(90deg, ${G.gold}02 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 32px 24px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 40,
              marginBottom: 36,
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${G.gold}, ${G.goldD})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                    color: G.bg,
                    fontFamily: "var(--fd)",
                    boxShadow: `0 0 12px ${G.gold}20`,
                  }}
                >
                  C
                </div>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    fontFamily: "var(--fd)",
                    color: "#f0e6d2",
                    letterSpacing: 0.5,
                  }}
                >
                  CielDeVignis
                </span>
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
                Serveur communautaire Hytale PvE.
                <br />
                Explore, combats, théorycraft.
              </p>
            </div>
            {/* Outils */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: G.gold,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                  fontFamily: "var(--fd)",
                }}
              >
                Outils
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Build Creator", icon: "⚔️", id: "builds" },
                  { label: "Communauté", icon: "🌍", id: "community" },
                  { label: "Donjons", icon: "🏰", id: "dungeons" },
                  { label: "Wiki", icon: "📖", id: "wiki" },
                  { label: "Mods", icon: "🧩", id: "mods" },
                ].map((l) => (
                  <span
                    key={l.id}
                    onClick={() => setPage(l.id)}
                    className="footer-link"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: G.muted,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {l.icon} {l.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Stats */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: G.gold,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                  fontFamily: "var(--fd)",
                }}
              >
                Contenu
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { v: "12", l: "Races", c: G.accent2 },
                  { v: "14", l: "Classes", c: G.teal },
                  { v: "59", l: "Augments", c: G.purple },
                  { v: "72", l: "Évolutions", c: G.blue },
                  { v: "11", l: "Donjons", c: G.orange },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: G.muted,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 800, color: s.c, minWidth: 24 }}>
                      {s.v}
                    </span>
                    {s.l}
                  </div>
                ))}
              </div>
            </div>
            {/* Communauté */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: G.gold,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 12,
                  fontFamily: "var(--fd)",
                }}
              >
                Communauté
              </div>
              <a
                href="https://discord.gg/7YmTATJcf"
                target="_blank"
                rel="noopener"
                className="discord-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: "var(--radius-sm)",
                  background: "#5865F210",
                  border: "1px solid #5865F225",
                  borderLeft: "3px solid #5865F2",
                  color: "#5865F2",
                  textDecoration: "none",
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--fw-bold)",
                  fontFamily: "var(--fb)",
                }}
              >
                💬 Rejoindre le Discord
              </a>
            </div>
          </div>
          {/* Bottom bar */}
          <div
            style={{
              borderTop: `1px solid ${G.gold}0c`,
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: "#4a4030" }}>
              © 2025 CielDeVignis — EndlessLeveling v7.0.6
            </div>
            <div style={{ fontSize: 11, color: "#4a4030" }}>
              Fait avec passion pour la communauté Hytale
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { HomePage };
