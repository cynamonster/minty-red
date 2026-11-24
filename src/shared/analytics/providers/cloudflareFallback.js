// Cloudflare First-Party Edge Fallback Provider
// Sends telemetry to /api/track (Cloudflare Pages Function) on the same domain,
// bypassing third-party adblockers and content filters.

let isBeaconInjected = false;

/**
 * Initializes optional Cloudflare Web Analytics beacon script if token is provided.
 */
export function initCloudflareBeacon(beaconToken) {
  if (typeof window === 'undefined') return;

  const token = beaconToken || import.meta.env.VITE_CF_BEACON_TOKEN;
  if (!token || isBeaconInjected) return;

  try {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
    document.head.appendChild(script);
    isBeaconInjected = true;
  } catch (err) {
    console.debug('[Cloudflare] Beacon script injection skipped:', err);
  }
}

/**
 * Sends telemetry directly to /api/track (first-party Cloudflare Pages endpoint)
 */
export function sendCloudflareTelemetry(payload) {
  if (typeof window === 'undefined') return false;

  const endpoint = '/api/track';
  const body = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    },
  });

  try {
    // navigator.sendBeacon is preferred because it won't be cancelled if the user navigates away
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return true;
    }

    // Fallback to fetch with keepalive
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently catch network failures or local offline mode
    });
    return true;
  } catch (err) {
    console.debug('[Analytics] Cloudflare edge dispatch skipped:', err);
    return false;
  }
}
