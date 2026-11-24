// Local Aggregator for Studio Dashboard & In-Browser Telemetry
// Provides instant insight into DAU / WAU patterns and game stats even offline or without GA dashboard access.

const STORAGE_KEY = 'minty_local_metrics';

function getTodayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

const DEFAULT_METRICS = {
  activeDays: [], // ['2026-11-24', ...] up to 30 days
  totalRoundsPlayed: 0,
  gameStarts: {},
  gameCompletions: {},
  sharesCount: 0,
  adblockDetected: false,
  recentEvents: [],
  createdDate: getTodayKey(),
};

export function getLocalMetrics() {
  if (typeof window === 'undefined') return DEFAULT_METRICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_METRICS };
    return { ...DEFAULT_METRICS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_METRICS };
  }
}

function saveLocalMetrics(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function recordLocalMetric(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  const current = getLocalMetrics();
  const today = getTodayKey();

  // Track active days for local DAU / WAU calculation
  if (!current.activeDays.includes(today)) {
    current.activeDays = [today, ...current.activeDays.filter((d) => d !== today)].slice(0, 30);
  }

  const game = params.game_id || params.game;

  if (eventName === 'game_start' && game) {
    current.gameStarts[game] = (current.gameStarts[game] || 0) + 1;
    current.totalRoundsPlayed += 1;
  } else if (eventName === 'game_end' && game) {
    current.gameCompletions[game] = (current.gameCompletions[game] || 0) + 1;
  } else if (eventName === 'social_share') {
    current.sharesCount = (current.sharesCount || 0) + 1;
  } else if (eventName === 'adblock_status' || eventName === 'adblock_detected') {
    if (params.is_blocked) {
      current.adblockDetected = true;
    }
  }

  // Keep a small ring buffer of the 20 most recent events for the developer dashboard
  const logEntry = {
    id: Math.random().toString(36).slice(2, 7),
    time: new Date().toLocaleTimeString(),
    event: eventName,
    game: game || null,
    score: params.score !== undefined ? params.score : null,
    adblock: params.is_adblock || false,
  };

  current.recentEvents = [logEntry, ...(current.recentEvents || [])].slice(0, 20);
  saveLocalMetrics(current);
}

/**
 * Calculates local user engagement statistics
 */
export function getLocalEngagementSummary() {
  const metrics = getLocalMetrics();
  const today = getTodayKey();

  // Active days in last 7 days (WAU representation)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const activeThisWeek = metrics.activeDays.filter((d) => d >= sevenDaysAgo).length;

  return {
    isActiveToday: metrics.activeDays.includes(today),
    activeDaysPast7: activeThisWeek,
    activeDaysPast30: metrics.activeDays.length,
    totalRoundsPlayed: metrics.totalRoundsPlayed,
    gameStarts: metrics.gameStarts,
    gameCompletions: metrics.gameCompletions,
    adblockDetected: metrics.adblockDetected,
    recentEvents: metrics.recentEvents || [],
  };
}
