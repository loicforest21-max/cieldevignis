// ═══════════════════════════════════════════════════
// APP — Main entry point with code splitting
// ═══════════════════════════════════════════════════
import { useState, useEffect, lazy, Suspense } from "react";
import { G, GlobalStyles } from "./styles.jsx";
import { Particles } from "./components/Particles.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { HomePage } from "./pages/HomePage.jsx";

// Heavy pages are lazy-loaded — only fetched when user opens them
const WikiPage = lazy(() => import("./pages/WikiPage.jsx"));
const DungeonsPage = lazy(() => import("./pages/DungeonsPage.jsx"));
const CommunityPage = lazy(() => import("./pages/CommunityPage.jsx"));
const BuildsPage = lazy(() => import("./pages/BuildsPage.jsx"));
const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const ModsPage = lazy(() => import("./pages/ModsPage.jsx"));

// ─── Magical loader shown while a page chunk is being fetched ───
function PageLoader() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "100px 24px",
      }}
    >
      {/* Pulsing rune */}
      <div
        style={{
          position: "relative",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${G.gold}50, transparent 70%)`,
            animation: "pageLoaderPulse 1.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            border: `1.5px solid ${G.gold}80`,
            borderTopColor: "transparent",
            animation: "pageLoaderSpin 1.2s linear infinite",
          }}
        />
        <span
          style={{
            fontSize: 22,
            filter: `drop-shadow(0 0 12px ${G.gold}aa)`,
            zIndex: 1,
          }}
        >
          ✦
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--fd)",
          fontSize: 11,
          color: "#c9a5ff",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Invocation en cours...
      </div>
      <style>
        {`
        @keyframes pageLoaderPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%      { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pageLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
}

function SiteApp() {
  const [page, setPage] = useState("home");
  // Cross-page: code to pre-load in BuildCreator
  const [importCode, setImportCode] = useState("");
  // Cross-page: code to pre-fill in CommunityPage publish form
  const [communityCode, setCommunityCode] = useState("");

  const goToBuilderWithCode = (code) => {
    setImportCode(code);
    setPage("builds");
  };
  const goToCommunityWithCode = (code) => {
    setCommunityCode(code);
    setPage("community");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "var(--fb)" }}>
      <GlobalStyles />
      {/* Skip link for keyboard users — jumps past navbar */}
      <a href="#main-content" className="skip-to-main">
        Aller au contenu principal
      </a>
      <Particles />
      <Navbar page={page} setPage={setPage} />
      {/* ErrorBoundary keyed by page = it auto-resets when user navigates */}
      <ErrorBoundary key={page} onReset={() => setPage("home")}>
        <main id="main-content">
          {/* Home stays eager — first page everyone sees */}
          {page === "home" && <HomePage setPage={setPage} />}
          {/* All other pages are lazy-loaded */}
          <Suspense fallback={<PageLoader />}>
            {page === "builds" && (
              <BuildsPage
                importCode={importCode}
                onClearImportCode={() => setImportCode("")}
                onPublishToCommunity={goToCommunityWithCode}
              />
            )}
            {page === "community" && (
              <CommunityPage
                setPage={setPage}
                initialCode={communityCode}
                onClearInitialCode={() => setCommunityCode("")}
                onEditInBuilder={goToBuilderWithCode}
              />
            )}
            {page === "dungeons" && <DungeonsPage />}
            {page === "wiki" && <WikiPage />}
            {page === "mods" && <ModsPage />}
            {page === "map" && <MapPage />}
          </Suspense>
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default SiteApp;
