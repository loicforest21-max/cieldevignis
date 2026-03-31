// ═══════════════════════════════════════════════════
// APP — Main entry point
// ═══════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { G, GlobalStyles } from './styles.jsx';
import { Particles, Navbar, HomePage, WikiPage, BuildsPage, MapPage, DungeonsPage, CommunityPage } from './Site.jsx';

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

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "var(--fb)" }}>
      <GlobalStyles />
      <Particles />
      <Navbar page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "builds" && <BuildsPage importCode={importCode} onClearImportCode={() => setImportCode("")} onPublishToCommunity={goToCommunityWithCode} />}
      {page === "community" && <CommunityPage setPage={setPage} initialCode={communityCode} onClearInitialCode={() => setCommunityCode("")} onEditInBuilder={goToBuilderWithCode} />}
      {page === "dungeons" && <DungeonsPage />}
      {page === "wiki" && <WikiPage />}
      {page === "map" && <MapPage />}
    </div>
  );
}

export default SiteApp;
