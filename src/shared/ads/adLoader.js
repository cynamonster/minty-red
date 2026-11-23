// Google AdSense Dynamic Script Loader & Error Guard

let isScriptInjected = false;
let isScriptLoaded = false;
let isBlocked = false;
let loadPromise = null;

/**
 * Safely loads the Google AdSense script once if a client ID is provided.
 * Gracefully resolves to false if blocked or unavailable.
 */
export function loadAdSenseScript(clientId) {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (!clientId || !clientId.startsWith('ca-pub-')) {
    return Promise.resolve(false);
  }

  if (isScriptLoaded) {
    return Promise.resolve(true);
  }

  if (isBlocked) {
    return Promise.resolve(false);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    // Check if script already exists in the document
    const existing = document.querySelector(
      `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`
    );

    if (existing) {
      isScriptInjected = true;
      isScriptLoaded = true;
      resolve(true);
      return;
    }

    try {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId
      )}`;

      script.onload = () => {
        isScriptInjected = true;
        isScriptLoaded = true;
        resolve(true);
      };

      script.onerror = () => {
        // Ad blocker or network failure
        isBlocked = true;
        resolve(false);
      };

      document.head.appendChild(script);
      isScriptInjected = true;
    } catch {
      isBlocked = true;
      resolve(false);
    }
  });

  return loadPromise;
}

/**
 * Safely triggers the AdSense render queue.
 */
export function pushAdSense() {
  if (typeof window === 'undefined') return;

  try {
    const queue = window.adsbygoogle || [];
    queue.push({});
    window.adsbygoogle = queue;
  } catch (err) {
    // Silently catch ad block or duplicate slot errors
    console.debug('[AdSense] Ad push suppressed or already initialized:', err?.message);
  }
}

/**
 * Check if AdSense is currently blocked by the client's browser.
 */
export function isAdSenseBlocked() {
  return isBlocked;
}
