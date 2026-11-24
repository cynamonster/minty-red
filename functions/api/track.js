// Cloudflare Pages Function: /api/track
// Edge ingestion endpoint for first-party telemetry and ad-block user tracking.

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const cf = context.request.cf || {};

    // Cloudflare edge log (visible in Wrangler tail and Cloudflare Dashboard Logs)
    const logEntry = {
      type: 'minty_telemetry',
      event: payload.event_name || payload.event || 'unknown',
      game: payload.game_id || null,
      score: payload.score !== undefined ? payload.score : null,
      clientId: payload.client_id || 'anonymous',
      sessionId: payload.session_id || null,
      isAdblock: Boolean(payload.is_adblock),
      geo: {
        country: cf.country || 'unknown',
        city: cf.city || 'unknown',
        colo: cf.colo || 'unknown',
      },
      timestamp: payload.timestamp || Date.now(),
      path: payload.page_path || payload.url || null,
    };

    console.log(JSON.stringify(logEntry));

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
