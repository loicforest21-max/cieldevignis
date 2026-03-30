// ═══════════════════════════════════════════════════
// APP — Main entry point
// ═══════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { G, GlobalStyles } from './styles.jsx';
import { Particles, Navbar, HomePage, WikiPage, BuildsPage, MapPage, DungeonsPage } from './Site.jsx';

function SiteApp() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "var(--fb)" }}>
      <GlobalStyles />
      <Particles />
      <Navbar page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "builds" && <BuildsPage />}
      {page === "dungeons" && <DungeonsPage />}
      {page === "wiki" && <WikiPage />}
      {page === "map" && <MapPage />}
    </div>
  );
}

export default SiteApp;
