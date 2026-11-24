// Centralized Analytics Service for Minty.red
// Bridges GA4, PostHog (post-paint deferred & session replay), Cloudflare Fallback, and Local Metrics.

import { getAnonymousUserId, getSessionId, getAnonymousUserMetadata } from './identity';
import { initGA4, sendGA4Event, sendGA4PageView, isGA4Blocked, isGA4Ready } from './providers/ga4';
import {
  initPostHog,
  sendPostHogEvent,
  trackPostHogGameView,
  trackPostHogGameStart,
  trackPostHogGameComplete,
  isPostHogBlocked,
} from './providers/posthog';
import { initCloudflareBeacon, sendCloudflareTelemetry } from './providers/cloudflareFallback';
import { recordLocalMetric, getLocalEngagementSummary } from './providers/localMetrics';
import { isAdSenseBlocked } from '../ads/adLoader';

let isInitialized = false;
let userAdblockDetected = false;

/**
 * Checks whether any adblocker has been detected across AdSense, GA4, or PostHog
 */
export function isAdblockActive() {
  return userAdblockDetected || isGA4Blocked() || isPostHogBlocked() || isAdSenseBlocked();
}

/**
 * Initializes the analytics pipeline (GA4, deferred PostHog, Cloudflare beacon).
 */
export async function initAnalytics(options = {}) {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Establish anonymous user identity in localStorage (no cookies / no PII)
  const metadata = getAnonymousUserMetadata();

  // 2. Initialize GA4 (primary macro audience platform)
  const gaSuccess = await initGA4(options.gaMeasurementId);

  // 3. Initialize PostHog (deferred post-paint for mobile session recording & game funnels)
  initPostHog({
    apiKey: options.posthogKey,
    apiHost: options.posthogHost,
  });

  // 4. Initialize Cloudflare Beacon (optional, if configured)
  initCloudflareBeacon(options.cfBeaconToken);

  // 5. Check if adblocker blocked GA4 during init
  if (!gaSuccess && isGA4Blocked()) {
    userAdblockDetected = true;
    recordLocalMetric('adblock_detected', { is_blocked: true, target: 'ga4' });
    sendCloudflareTelemetry({
      event: 'adblock_detected',
      blocked_service: 'ga4',
      client_id: metadata.userId,
    });
  }

  // 6. Record session start event
  trackEvent('session_start', {
    is_new_user: metadata.isNewUser,
    session_count: metadata.sessionCount,
    days_since_first_seen: metadata.daysSinceFirstSeen,
  });
}

/**
 * Dispatches an event across GA4, PostHog, Cloudflare Edge, and Local Metrics
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  const metadata = getAnonymousUserMetadata();
  const adblockStatus = isAdblockActive();

  const enrichedPayload = {
    ...params,
    event_name: eventName,
    client_id: metadata.userId,
    session_id: metadata.sessionId,
    is_adblock: adblockStatus,
    timestamp: Date.now(),
  };

  // 1. Send to GA4
  if (isGA4Ready()) {
    sendGA4Event(eventName, enrichedPayload);
  }

  // 2. Send to PostHog
  sendPostHogEvent(eventName, enrichedPayload);

  // 3. Fallback / Parallel to Cloudflare Edge:
  // If GA4 or PostHog is blocked, or if an adblocker is detected, send to /api/track to preserve stats!
  if (!isGA4Ready() || isPostHogBlocked() || adblockStatus) {
    sendCloudflareTelemetry(enrichedPayload);
  }

  // 4. Local storage log for /dash
  recordLocalMetric(eventName, enrichedPayload);
}

/**
 * Track SPA Page / Screen navigation
 */
export function trackPageView(path, title) {
  if (typeof window === 'undefined') return;

  const metadata = getAnonymousUserMetadata();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // GA4
  if (isGA4Ready()) {
    sendGA4PageView(cleanPath, title);
  }

  // PostHog
  sendPostHogEvent('$pageview', {
    $current_url: window.location.href,
    page_path: cleanPath,
    page_title: title || document.title,
  });

  // Cloudflare fallback / adblock tracking
  if (!isGA4Ready() || isPostHogBlocked() || isAdblockActive()) {
    sendCloudflareTelemetry({
      event: 'page_view',
      page_path: cleanPath,
      page_title: title || document.title,
      client_id: metadata.userId,
      session_id: metadata.sessionId,
      is_adblock: isAdblockActive(),
    });
  }

  recordLocalMetric('page_view', { path: cleanPath });
}

/**
 * Track when a game view mounts
 */
export function trackGameView(gameSlug, entryPoint = 'hub') {
  trackPostHogGameView(gameSlug, entryPoint);
  trackEvent('game_view', {
    game_id: gameSlug,
    entry_point: entryPoint,
  });
}

/**
 * Track when a game round is started (first tap / move)
 */
export function trackGameStart(gameSlug, mode = 'standard') {
  trackPostHogGameStart(gameSlug, mode);
  trackEvent('game_start', {
    game_id: gameSlug,
    mode,
  });
}

/**
 * Track when a game round completes
 */
export function trackGameEnd(gameSlug, details = {}) {
  trackPostHogGameComplete(gameSlug, details);
  trackEvent('game_end', {
    game_id: gameSlug,
    score: details.score || 0,
    time_spent_seconds: Math.round(details.duration || 0),
    duration_seconds: Math.round(details.duration || 0),
    result: details.win ? 'win' : 'loss',
    streak: details.streak || 0,
    is_daily: details.isDaily || false,
  });
}

/**
 * Track Daily Challenge completion
 */
export function trackDailyChallenge(gameSlug, streak = 0, score = 0) {
  trackEvent('daily_challenge_complete', {
    game_id: gameSlug,
    streak,
    score,
  });
}

/**
 * Track social sharing & challenge creation
 */
export function trackShare(gameSlug, shareType = 'score', score = 0) {
  trackEvent('social_share', {
    game_id: gameSlug,
    share_type: shareType,
    score,
  });
}

/**
 * Track cross-promoted next game click
 */
export function trackNextGameClick(fromGame, toGame) {
  trackEvent('next_game_click', {
    from_game: fromGame,
    to_game: toGame,
  });
}

/**
 * Notify analytics when an adblocker was detected (e.g., from AdSense loader)
 */
export function trackAdblockStatus(isBlocked) {
  if (isBlocked && !userAdblockDetected) {
    userAdblockDetected = true;
    trackEvent('adblock_detected', { is_blocked: true, blocked_service: 'adsense' });
  }
}

/**
 * Summary stats for the Studio Dashboard (/dash)
 */
export function getAnalyticsSummary() {
  const user = getAnonymousUserMetadata();
  const engagement = getLocalEngagementSummary();
  return {
    user,
    engagement,
    isAdblockActive: isAdblockActive(),
    isGA4Ready: isGA4Ready(),
    isGA4Blocked: isGA4Blocked(),
    isPostHogBlocked: isPostHogBlocked(),
  };
}
