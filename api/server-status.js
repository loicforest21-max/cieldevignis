// ═══════════════════════════════════════════════════
// SERVER STATUS PROXY — Vercel serverless function
// ═══════════════════════════════════════════════════
// Bridges voxl.gg's API (which doesn't expose CORS headers)
// to our frontend by proxying the request server-side, where
// CORS doesn't apply.
//
// Endpoint: GET /api/server-status
// Returns: JSON from voxl.gg /api/servers/{ID}, or an error object
// Cache: 30 seconds at the edge (reduces voxl.gg load)
// ═══════════════════════════════════════════════════

const VOXL_SERVER_ID = "eed284a8-0b0d-4395-a912-e073b3614737";
const VOXL_API_URL = `https://voxl.gg/api/servers/${VOXL_SERVER_ID}`;
const FETCH_TIMEOUT_MS = 5000;

export default async function handler(req, res) {
  // Allow only GET
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  // Cache at the edge for 30s, with stale-while-revalidate for resilience
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

  try {
    // Fetch with timeout to avoid hanging if voxl.gg is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(VOXL_API_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CielDeVignis/1.0 (+https://cieldevignis.vercel.app)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(response.status).json({
        error: response.status === 404 ? "server_not_found" : "upstream_error",
        upstream_status: response.status,
      });
      return;
    }

    const data = await response.json();

    // Whitelist only the fields we actually use on the frontend
    // (don't leak the secretKey or other internal voxl.gg fields)
    res.status(200).json({
      name: data.name,
      lastSeenAt: data.lastSeenAt,
      lastPluginVersion: data.lastPluginVersion,
      whitelistEnabled: data.whitelistEnabled,
    });
  } catch (err) {
    // Network error, timeout, or DNS failure
    const isTimeout = err.name === "AbortError";
    res.status(503).json({
      error: isTimeout ? "upstream_timeout" : "upstream_unreachable",
      // Debug info — remove these fields once the issue is fixed
      _debug: {
        name: err.name,
        message: err.message,
        cause: err.cause ? String(err.cause) : null,
      },
    });
  }
}
