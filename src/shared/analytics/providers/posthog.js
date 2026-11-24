// PostHog Provider with Post-Paint Deferred Loading & Mobile Session Replay
import { getAnonymousUserId } from '../identity';

let isPostHogInitialized = false;
let isPostHogBlockedState = false;
let eventQueue = [];

export function isPostHogBlocked() {
  return isPostHogBlockedState;
}

export function isPostHogReady() {
  return (
    isPostHogInitialized &&
    !isPostHogBlockedState &&
    typeof window !== 'undefined' &&
    window.posthog &&
    typeof window.posthog.capture === 'function'
  );
}

/**
 * Defers execution until after the first paint / idle time
 * to prevent blocking initial canvas, audio, or game loop initialization.
 */
function runAfterFirstPaint(callback) {
  if (typeof window === 'undefined') return;

  const runWhenIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => callback(), { timeout: 2000 });
    } else {
      setTimeout(callback, 1200);
    }
  };

  // Wait for initial paint before scheduling idle load
  if (document.readyState === 'complete') {
    requestAnimationFrame(() => requestAnimationFrame(runWhenIdle));
  } else {
    window.addEventListener('load', () => {
      requestAnimationFrame(() => requestAnimationFrame(runWhenIdle));
    }, { once: true });
  }
}

/**
 * Initializes PostHog with deferred script injection and mobile session recordings.
 */
export function initPostHog(options = {}) {
  if (typeof window === 'undefined') return;

  const apiKey = options.apiKey || import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = options.apiHost || import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!apiKey || apiKey === 'phc_placeholder') {
    // PostHog not configured; gracefully skip
    return;
  }

  if (isPostHogInitialized) return;

  // Defer PostHog script injection until after the first paint and idle moment
  runAfterFirstPaint(() => {
    try {
      // Check if script already exists
      if (document.querySelector('script[src*="posthog"]')) {
        isPostHogInitialized = true;
        flushEventQueue();
        return;
      }

      // Initialize PostHog stub
      (function (t, e) {
        var o, n, p, r;
        e.__SV ||
          ((window.posthog = e),
          (e._i = []),
          (e.init = function (i, s, a) {
            function g(t, e) {
              var o = e.split('.');
              2 == o.length && ((t = t[o[0]]), (e = o[1])),
                (t[e] = function () {
                  t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                });
            }
            ((p = t.createElement('script')).type = 'text/javascript'),
              (p.async = !0),
              (p.crossOrigin = 'anonymous'),
              (p.src =
                s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') +
                '/static/array.js'),
              (p.onerror = function () {
                console.warn('[Analytics] PostHog script blocked by adblocker. Routing via Cloudflare edge.');
                isPostHogBlockedState = true;
              }),
              (p.onload = function () {
                isPostHogInitialized = true;
                flushEventQueue();
              }),
              (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r);
            var u = e;
            for (
              void 0 !== a ? (u = e[a] = []) : (a = 'posthog'),
                u.people = u.people || [],
                u.toString = function (t) {
                  var e = 'posthog';
                  return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e;
                },
                u.people.toString = function () {
                  return u.toString(1) + '.people (stub)';
                },
                o =
                  'capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId startSessionRecording stopSessionRecording'.split(
                    ' '
                  ),
                n = 0;
              n < o.length;
              n++
            )
              g(u, o[n]);
            e._i.push([i, s, a]);
          }),
          (e.__SV = 1));
      })(document, window.posthog || []);

      const anonUid = getAnonymousUserId();

      // Configure PostHog with mobile session replay & cookie-free localStorage persistence
      window.posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: true,
        capture_pageview: false, // We control page_views manually
        persistence: 'localStorage', // No third-party cookies
        bootstrap: {
          distinctID: anonUid,
        },
        disable_session_recording: false,
        session_recording: {
          recordCrossOriginIframes: false,
          maskAllInputs: true,
        },
        loaded: (ph) => {
          ph.identify(anonUid);
          isPostHogInitialized = true;
          flushEventQueue();
        },
      });
    } catch (err) {
      isPostHogBlockedState = true;
      console.debug('[PostHog] Init skipped or error:', err);
    }
  });
}

function flushEventQueue() {
  if (!isPostHogReady() || eventQueue.length === 0) return;
  const queued = [...eventQueue];
  eventQueue = [];
  for (const item of queued) {
    try {
      window.posthog.capture(item.name, item.properties);
    } catch {}
  }
}

/**
 * Capture custom PostHog event with queuing during deferred loading
 */
export function sendPostHogEvent(eventName, properties = {}) {
  if (isPostHogBlockedState) return false;

  if (isPostHogReady()) {
    try {
      window.posthog.capture(eventName, properties);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Queue event until PostHog finishes post-paint load
  eventQueue.push({ name: eventName, properties });
  return true;
}

/**
 * Explicitly capture game view in PostHog
 */
export function trackPostHogGameView(gameId, entryPoint = 'hub') {
  sendPostHogEvent('game_view', {
    game_id: gameId,
    entry_point: entryPoint,
  });
}

/**
 * Explicitly capture game start in PostHog
 */
export function trackPostHogGameStart(gameId, mode = 'standard') {
  sendPostHogEvent('game_start', {
    game_id: gameId,
    mode,
  });
}

/**
 * Explicitly capture game completion in PostHog
 */
export function trackPostHogGameComplete(gameId, details = {}) {
  const { score = 0, duration = 0, win = false, streak = 0, isDaily = false } = details;
  sendPostHogEvent('game_complete', {
    game_id: gameId,
    score,
    time_spent_seconds: Math.round(duration),
    duration_seconds: Math.round(duration),
    result: win ? 'win' : 'loss',
    streak,
    is_daily: isDaily,
  });
}
