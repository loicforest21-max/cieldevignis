// ═══════════════════════════════════════════════════
// STYLES — Theme constants & global CSS (Hytale-inspired v2)
// ═══════════════════════════════════════════════════

const G = {
  bg: "#0a0f1a", card: "#121a2b", border: "#1c2d45", accent: "#e8a537", accent2: "#f5a623",
  teal: "#3dd8c5", blue: "#4ea8f0", purple: "#845ef7", pink: "#e060a0",
  orange: "#e8653a", green: "#51cf66",
  text: "#e8e4dc", muted: "#9aa3b8",
  gold: "#e8a537", goldL: "#f0c06a", goldD: "#c8882a",
  bg2: "#0d1320", bg3: "#111827",
};

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
      :root {
        --fd: 'Cinzel', serif;
        --fb: 'DM Sans', sans-serif;

        --text-xs: 11px;
        --text-sm: 13px;
        --text-md: 15px;
        --text-lg: 20px;
        --text-xl: 32px;

        --fw-normal: 400;
        --fw-bold: 700;
        --fw-black: 900;

        --sp-1: 8px;
        --sp-2: 16px;
        --sp-3: 24px;
        --sp-4: 32px;
        --sp-5: 48px;
        --sp-6: 64px;

        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 14px;

        --c-teal: #3dd8c5;
        --c-amber: #e8a537;
        --c-bg: #0a0f1a;
        --c-card: #121a2b;
        --c-border: #1c2d45;
        --c-text: #e8e4dc;
        --c-muted: #9aa3b8;

        --card: #121a2b;
        --brd: #1c2d45;
        --bg: #0a0f1a;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: var(--c-bg);
        overflow-x: hidden;
        font-family: var(--fb);
        background-image:
          radial-gradient(circle at 20% 50%, #e8a53706 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #845ef705 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, #3dd8c504 0%, transparent 45%);
      }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #1c2d4580; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #e8a53740; }
      h1, h2, h3, h4 { font-family: var(--fd); letter-spacing: 0.5px; }
      input[type="range"] { height: 4px; }
      select { font-family: var(--fb); }
      button { font-family: var(--fb); }

      /* ═══ WIKI LIST ═══ */
      .wiki-row { transition: background 0.12s, border-color 0.12s; }
      .wiki-row:hover:not(.wiki-row-open) { background: #121a2b60 !important; border-color: #1c2d4590 !important; }
      .wiki-row:nth-child(even):not(.wiki-row-open) { background: #0d132008; }
      .wiki-row-open { box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03); }
      .wiki-expanded { animation: wikiExpand 0.2s ease-out; }
      @keyframes wikiExpand { from { opacity:0; max-height:0; } to { opacity:1; max-height:800px; } }
      .wiki-stat-card { backdrop-filter: blur(4px); transition: transform 0.15s; }
      .wiki-stat-card:hover { transform: translateY(-1px); }
      .wiki-bench-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239aa3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px !important; }
      .compare-overlay { animation: compareFadeIn 0.25s ease-out; }
      @keyframes compareFadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

      /* ═══ BUTTON SYSTEM ═══ */
      .btn-primary {
        background: linear-gradient(135deg, #e8a537, #c8882a);
        color: #0a0f1a;
        border: none;
        border-radius: var(--radius-md);
        padding: 12px 28px;
        font-weight: var(--fw-bold);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: var(--fb);
        letter-spacing: 0.5px;
      }
      .btn-primary:hover, .btn-primary:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 10px 32px #e8a53730;
        outline: none;
      }
      .btn-primary-lg {
        background: linear-gradient(135deg, #e8a537, #c8882a);
        color: #0a0f1a;
        border: none;
        border-radius: 10px;
        padding: 15px 40px;
        font-weight: var(--fw-black);
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: var(--fb);
        letter-spacing: 0.5px;
        box-shadow: 0 4px 24px #e8a53730;
      }
      .btn-primary-lg:hover, .btn-primary-lg:focus-visible {
        transform: translateY(-3px);
        box-shadow: 0 8px 40px #e8a53740;
        outline: none;
      }
      .btn-ghost {
        background: transparent;
        color: var(--c-muted);
        border: 1.5px solid #2a3a55;
        border-radius: var(--radius-md);
        padding: 8px 16px;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--fb);
      }
      .btn-ghost:hover, .btn-ghost:focus-visible {
        color: var(--c-amber);
        border-color: #e8a53740;
        background: #e8a53710;
        outline: none;
      }
      .btn-ghost-teal {
        background: #3dd8c510;
        color: #3dd8c5;
        border: 1px solid #3dd8c540;
        border-radius: var(--radius-md);
        padding: 6px 14px;
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--fb);
      }
      .btn-ghost-teal:hover, .btn-ghost-teal:focus-visible {
        background: #3dd8c520;
        border-color: #3dd8c560;
        outline: none;
      }
      .btn-danger {
        background: transparent;
        color: #ff6b6b;
        border: 1px solid #ff6b6b30;
        border-radius: var(--radius-md);
        padding: 6px 12px;
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--fb);
      }
      .btn-danger:hover, .btn-danger:focus-visible {
        background: #ff6b6b15;
        border-color: #ff6b6b60;
        outline: none;
      }
      .btn-discord {
        padding: 15px 40px;
        border-radius: 10px;
        border: 1.5px solid #2a3a55;
        background: transparent;
        color: var(--c-text);
        font-size: 16px;
        font-weight: var(--fw-bold);
        cursor: pointer;
        font-family: var(--fb);
        transition: all 0.3s;
      }
      .btn-discord:hover, .btn-discord:focus-visible {
        border-color: #e8a53750;
        transform: translateY(-3px);
        color: #e8a537;
        outline: none;
      }
      .btn-icon {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-md);
        border: 1px solid var(--c-border);
        background: #ffffff05;
        color: var(--c-muted);
        font-size: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .btn-icon:hover, .btn-icon:focus-visible {
        background: #3dd8c510;
        color: var(--c-teal);
        border-color: #3dd8c540;
        outline: none;
      }

      /* ═══ NAVIGATION ═══ */
      .nav-link {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--c-muted);
        font-weight: 600;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: var(--fb);
        border-bottom: 2px solid transparent;
        text-decoration: none;
      }
      .nav-link:hover { color: #e8a537; }
      .nav-link.active {
        color: #e8a537;
        background: #e8a53712;
      }

      /* ═══ TABS ═══ */
      .tab-btn {
        padding: 10px 16px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        flex-shrink: 0;
        font-family: var(--fb);
        font-weight: var(--fw-bold);
        font-size: 12px;
        background: transparent;
        color: #4a5e78;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        position: relative;
      }
      .tab-btn:hover { color: #9aa3b8; }
      .tab-btn.active {
        background: var(--c-card);
        color: var(--c-teal);
        border-bottom-color: var(--c-teal);
      }

      /* ═══ CARDS ═══ */
      .card-interactive {
        transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.2s ease;
        cursor: pointer;
      }
      .card-interactive:hover {
        transform: translateY(-3px);
      }
      .feature-card {
        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .feature-card:hover {
        transform: translateY(-4px);
      }
      .race-preview {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .race-preview:hover {
        transform: translateY(-3px) scale(1.02);
      }
      .class-preview {
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
      }
      .class-preview:hover {
        transform: translateY(-2px);
      }
      .footer-link {
        transition: color 0.2s;
        cursor: pointer;
      }
      .footer-link:hover { color: #e8a537; }
      .discord-link {
        transition: all 0.2s;
      }
      .discord-link:hover {
        background: #5865F220 !important;
        border-color: #5865F250 !important;
      }

      /* ═══ ANIMATIONS ═══ */
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
      @keyframes scrollDot {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 4px currentColor; }
        50% { box-shadow: 0 0 12px currentColor; }
      }
      @keyframes voxelFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-8px) rotate(2deg); }
        75% { transform: translateY(4px) rotate(-1deg); }
      }
      @keyframes gridPulse {
        0%, 100% { opacity: 0.03; }
        50% { opacity: 0.06; }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes heroGlow {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(1.03); }
      }

      /* ═══ SECTION DIVIDER ═══ */
      .section-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        max-width: 300px;
        margin: 0 auto;
        padding: 16px 0;
      }
      .section-divider::before, .section-divider::after {
        content: '';
        flex: 1;
        height: 1px;
      }
      .section-divider::before { background: linear-gradient(90deg, transparent, #e8a53730); }
      .section-divider::after { background: linear-gradient(90deg, #e8a53730, transparent); }

      /* ═══ RESPONSIVE ═══ */
      @media (max-width: 768px) {
        .nav-desktop { display: none !important; }
        .nav-burger { display: block !important; }
        .nav-mobile-menu { display: flex !important; }
      }
      @media (min-width: 769px) {
        .nav-burger { display: none !important; }
        .nav-mobile-menu { display: none !important; }
      }

      @media (max-width: 540px) {
        .tab-label { display: none; }
        .build-tabs-desktop { display: none !important; }
        .build-bottom-nav {
          display: flex !important;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: var(--c-bg);
          border-top: 1px solid var(--c-border);
          z-index: 50;
          padding: 6px 0 env(safe-area-inset-bottom, 6px);
        }
        .build-bottom-nav button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: transparent;
          border: none;
          color: var(--c-muted);
          font-size: 10px;
          font-family: var(--fb);
          padding: 6px 4px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .build-bottom-nav button.active { color: var(--c-teal); }
        .build-bottom-nav button span.nav-icon { font-size: 20px; line-height: 1; }
        .build-content { padding-bottom: 72px !important; }
        .more-menu-overlay {
          position: fixed;
          bottom: 56px; left: 0; right: 0;
          background: var(--c-card);
          border-top: 1px solid var(--c-border);
          z-index: 49;
          padding: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          animation: fadeSlideUp 0.15s ease;
        }
        .more-menu-overlay button {
          flex: 1 1 45%;
          padding: 10px;
          border: 1px solid var(--c-border);
          border-radius: var(--radius-md);
          background: var(--c-bg);
          color: var(--c-muted);
          font-size: var(--text-xs);
          font-weight: var(--fw-bold);
          font-family: var(--fb);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          transition: all 0.15s;
        }
        .more-menu-overlay button.active {
          color: var(--c-teal);
          border-color: #3dd8c540;
          background: #3dd8c510;
        }
      }
      @media (min-width: 541px) {
        .build-bottom-nav { display: none !important; }
        .build-tabs-desktop { display: flex !important; }
        .more-menu-overlay { display: none !important; }
      }

      div::-webkit-scrollbar { height: 0; }
    `}</style>
  );
}

export { G, GlobalStyles };
