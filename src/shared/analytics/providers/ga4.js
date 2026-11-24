// Google Analytics 4 (GA4) Provider with Cookie-less & Adblock Detection Support
import { getAnonymousUserId } from '../identity';

let isGA4Initialized = false;
let isGA4BlockedState = false;
let gaMeasurementId = null;

export function isGA4Blocked() {
  return isGA4BlockedState;
}

export function isGA4Ready() {
  return isGA4Initialized && !isGA4BlockedState && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Initializes GA4 with anonymous client_id and zero third-party cookies.
 */
export function initGA4(measurementId) {
  if (typeof window === 'undefined') return Promise.resolve(false);

  gaMeasurementId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!gaMeasurementId || !gaMeasurementId.startsWith('G-')) {
    // No measurement ID set; silently skip GA4 without error
    return Promise.resolve(false);
  }

  if (isGA4Initialized) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    // Check if script already exists
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
      isGA4Initialized = true;
      resolve(true);
      return;
    }

    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());

      // Configure anonymous, cookie-free client tracking
      const anonUid = getAnonymousUserId();
      window.gtag('config', gaMeasurementId, {
        send_page_view: false, // SPA handles page views manually
        client_id: anonUid,
        client_storage: 'none', // Disables GA cookies for privacy compliance
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;

      script.onload = () => {
        isGA4Initialized = true;
        isGA4BlockedState = false;
        resolve(true);
      };

      script.onerror = () => {
        // Script blocked by uBlock, Brave Shields, Pi-hole, etc.
        console.warn('[Analytics] GA4 script blocked by client adblocker. Activating Cloudflare fallback.');
        isGA4BlockedState = true;
        resolve(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      isGA4BlockedState = true;
      resolve(false);
    }
  });
}

/**
 * Sends custom event to GA4
 */
export function sendGA4Event(eventName, eventParams = {}) {
  if (!isGA4Ready()) return false;

  try {
    window.gtag('event', eventName, eventParams);
    return true;
  } catch (err) {
    console.debug('[GA4] Event dispatch failed:', err);
    return false;
  }
}

/**
 * Sends page_view event to GA4
 */
export function sendGA4PageView(path, title) {
  if (!isGA4Ready()) return false;

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
    return true;
  } catch (err) {
    return false;
  }
}
