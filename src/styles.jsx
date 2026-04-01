// ═══════════════════════════════════════════════════
// STYLES — Theme constants & global CSS
// ═══════════════════════════════════════════════════

const G = {
  bg: "#0b1120", card: "#111d33", border: "#1a2d4f", accent: "#3dd8c5", accent2: "#f5a623",
  teal: "#3dd8c5", blue: "#4ea8f0", purple: "#845ef7", pink: "#e060a0",
  orange: "#e8653a", green: "#51cf66",
  text: "#dce4f0", muted: "#7c8db5",
};

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');
      :root {
        --fd: 'Rajdhani', sans-serif;
        --fb: 'Exo 2', sans-serif;

        /* Typographie — 5 niveaux */
        --text-xs: 11px;
        --text-sm: 13px;
        --text-md: 15px;
        --text-lg: 20px;
        --text-xl: 32px;

        /* Poids */
        --fw-normal: 400;
        --fw-bold: 700;
        --fw-black: 900;

        /* Espacement — grille 8px stricte */
        --sp-1: 8px;
        --sp-2: 16px;
        --sp-3: 24px;
        --sp-4: 32px;
        --sp-5: 48px;
        --sp-6: 64px;

        /* Border radius — 3 valeurs */
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 14px;

        /* Couleurs */
        --c-teal: #3dd8c5;
        --c-amber: #f5a623;
        --c-bg: #0b1120;
        --c-card: #111d33;
        --c-border: #1a2d4f;
        --c-text: #dce4f0;
        --c-muted: #7c8db5;

        /* Aliases utilisés dans BuildCreator */
        --card: #111d33;
        --brd: #1a2d4f;
        --bg: #0b1120;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: var(--c-bg);
        overflow-x: hidden;
        font-family: var(--fb);
        background-image:
          radial-gradient(circle at 20% 50%, #3dd8c506 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #845ef706 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, #f5a62306 0%, transparent 45%);
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #1a2d4f80; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #3dd8c540; }
      h1, h2, h3, h4 { font-family: var(--fd); letter-spacing: 0.5px; }
      input[type="range"] { height: 4px; }
      select { font-family: var(--fb); }
      button { font-family: var(--fb); }

      /* ═══ BUTTON SYSTEM ═══ */
      .btn-primary {
        background: linear-gradient(135deg, #3dd8c5, #4ea8f0);
        color: #fff;
        border: none;
        border-radius: var(--radius-md);
        padding: 12px 28px;
        font-weight: var(--fw-bold);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: var(--fd);
        letter-spacing: 0.5px;
      }
      .btn-primary:hover, .btn-primary:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 10px 32px #3dd8c530;
        outline: none;
      }
      .btn-primary-lg {
        background: linear-gradient(135deg, #3dd8c5, #4ea8f0);
        color: #fff;
        border: none;
        border-radius: var(--radius-md);
        padding: 15px 40px;
        font-weight: var(--fw-black);
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: var(--fd);
        letter-spacing: 1px;
        box-shadow: 0 8px 32px #3dd8c530, 0 0 20px #3dd8c510;
      }
      .btn-primary-lg:hover, .btn-primary-lg:focus-visible {
        transform: translateY(-3px);
        box-shadow: 0 14px 48px #3dd8c540, 0 0 30px #3dd8c515;
        outline: none;
      }
      .btn-ghost {
        background: transparent;
        color: var(--c-muted);
        border: 1px solid var(--c-border);
        border-radius: var(--radius-md);
        padding: 8px 16px;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--fb);
      }
      .btn-ghost:hover, .btn-ghost:focus-visible {
        color: var(--c-teal);
        border-color: #3dd8c540;
        background: #3dd8c510;
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
        border-radius: var(--radius-md);
        border: 2px solid var(--c-border);
        background: rgba(17,29,51,0.8);
        color: var(--c-text);
        font-size: 16px;
        font-weight: var(--fw-bold);
        cursor: pointer;
        font-family: var(--fb);
        transition: all 0.3s;
      }
      .btn-discord:hover, .btn-discord:focus-visible {
        border-color: #3dd8c560;
        transform: translateY(-3px);
        color: var(--c-teal);
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
        padding: 8px 18px;
        border-radius: var(--radius-md);
        border: none;
        background: transparent;
        color: var(--c-muted);
        font-weight: var(--fw-bold);
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
      .nav-link:hover { color: var(--c-teal); }
      .nav-link.active {
        color: var(--c-teal);
        background: #3dd8c515;
        border-bottom-color: var(--c-teal);
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
      .tab-btn:hover { color: #8090b8; }
      .tab-btn.active {
        background: var(--c-card);
        color: var(--c-teal);
        border-bottom-color: var(--c-teal);
      }

      /* ═══ CARDS ═══ */
      .card-interactive {
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: pointer;
      }
      .card-interactive:hover {
        transform: translateY(-2px);
      }
      .feature-card {
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      .feature-card:hover {
        transform: translateY(-6px);
      }
      .race-preview {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .race-preview:hover {
        transform: translateY(-4px) scale(1.03);
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
      .footer-link:hover { color: var(--c-teal); }
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
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }

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

      /* Build Creator — mobile bottom nav */
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

      /* Hide scrollbar on tabs */
      div::-webkit-scrollbar { height: 0; }
    `}</style>
  );
}

export { G, GlobalStyles };
