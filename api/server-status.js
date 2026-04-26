// ═══════════════════════════════════════════════════
// SERVER STATUS PROXY — Vercel serverless function
// ═══════════════════════════════════════════════════
// Bridges voxl.gg's API (which doesn't expose CORS headers)
// to our frontend by proxying the request server-side, where
// CORS doesn't apply.
//
// The voxl.gg plugin authenticates to their WebSocket via the
// `x-secret-key` header. We try the same header on the REST API
// since their public endpoints reject unauthenticated requests
// with an HTML login redirect.
//
// The secret is read from the VOXL_SECRET_KEY environment variable
// configured in Vercel's project settings — never commit it.
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

  const secretKey = process.env.VOXL_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "missing_voxl_secret_key" });
    return;
  }

  try {
    // Fetch with timeout to avoid hanging if voxl.gg is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(VOXL_API_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CielDeVignis/1.0 (+https://cieldevignis.vercel.app)",
        "x-secret-key": secretKey,
      },
      signal: controller.signal,
      redirect: "manual", // don't follow login redirects, surface them
    });
    clearTimeout(timeoutId);

    const bodyText = await response.text();

    // Try to parse JSON; if it fails, return debug info
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      // voxl.gg returned non-JSON (probably HTML login page)
      res.status(502).json({
        error: "upstream_not_json",
        _debug: {
          status: response.status,
          location: response.headers.get("location"),
          contentType: response.headers.get("content-type"),
          bodyPreview: bodyText.slice(0, 400),
        },
      });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({
        error: response.status === 404 ? "server_not_found" : "upstream_error",
        upstream_status: response.status,
      });
      return;
    }

    // Whitelist only the fields we actually use on the frontend
    res.status(200).json({
      name: data.name,
      lastSeenAt: data.lastSeenAt,
      lastPluginVersion: data.lastPluginVersion,
      whitelistEnabled: data.whitelistEnabled,
    });
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    res.status(503).json({
      error: isTimeout ? "upstream_timeout" : "upstream_unreachable",
      _debug: {
        name: err.name,
        message: err.message,
        cause: err.cause ? String(err.cause) : null,
      },
    });
  }
}
