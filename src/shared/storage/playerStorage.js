// Player persistence & deterministic daily seed generator.
import { trackGameEnd, trackDailyChallenge } from '../analytics/analyticsService';
import { isDevSite } from '../utils/environment';

export function getTodayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

// Simple seeded PRNG (Mulberry32)
export function createPRNG(seed) {
  let s = Math.abs(seed) || 123456789;
  return function() {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailySeed(customDateKey) {
  const key = customDateKey || getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGameStats(gameSlug) {
  const raw = localStorage.getItem(`bobby_stats_${gameSlug}`);
  if (!raw) {
    return {
      highScore: 0,
      gamesPlayed: 0,
      totalCorrect: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      todayCompleted: false,
    };
  }
  try {
    const data = JSON.parse(raw);
    const today = getTodayKey();
    data.todayCompleted = data.lastPlayedDate === today;
    return data;
  } catch {
    return { highScore: 0, gamesPlayed: 0, currentStreak: 0, maxStreak: 0, todayCompleted: false };
  }
}

export function saveGameScore(gameSlug, score, isDaily = false, correctCount = 0) {
  const stats = getGameStats(gameSlug);
  const today = getTodayKey();

  stats.gamesPlayed += 1;
  stats.totalCorrect = (stats.totalCorrect || 0) + correctCount;
  if (score > stats.highScore) {
    stats.highScore = score;
  }

  if (isDaily) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (stats.lastPlayedDate === yesterday) {
      stats.currentStreak += 1;
    } else if (stats.lastPlayedDate !== today) {
      stats.currentStreak = 1;
    }
    if (stats.currentStreak > (stats.maxStreak || 0)) {
      stats.maxStreak = stats.currentStreak;
    }
    stats.lastPlayedDate = today;
    stats.todayCompleted = true;
  }

  localStorage.setItem(`bobby_stats_${gameSlug}`, JSON.stringify(stats));

  try {
    trackGameEnd(gameSlug, {
      score,
      streak: stats.currentStreak || 0,
      isDaily,
      win: score > 0,
    });

    if (isDaily) {
      trackDailyChallenge(gameSlug, stats.currentStreak || 0, score);
    }
  } catch {}

  return stats;
}

/**
 * Get the number of infinite runs played today by gameSlug
 */
export function getDailyInfinitePlays(gameSlug) {
  const today = getTodayKey();
  const raw = localStorage.getItem(`minty_infinite_${gameSlug}`);
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    if (data.date === today) return data.count || 0;
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Increment and return the updated count of infinite runs played today
 */
export function incrementDailyInfinitePlays(gameSlug) {
  const today = getTodayKey();
  const count = getDailyInfinitePlays(gameSlug) + 1;
  try {
    localStorage.setItem(`minty_infinite_${gameSlug}`, JSON.stringify({ date: today, count }));
  } catch {}
  return count;
}

/**
 * Check whether infinite mode can be played:
 * Free players get 1 free run/day; Pass holders & Dev Mode (?dev=true, ?pass=true) get unlimited.
 */
export function canPlayInfiniteMode(gameSlug, isPassHolder = false) {
  if (isPassHolder || isDevSite()) {
    return { allowed: true, remaining: Infinity, isDev: isDevSite() };
  }
  const plays = getDailyInfinitePlays(gameSlug);
  const remaining = Math.max(0, 1 - plays);
  return { allowed: remaining > 0, remaining };
}

/**
 * Get archive completions map for a game { "2026-10-15": { score: 120, completedAt: ... } }
 */
export function getArchiveHistory(gameSlug) {
  const raw = localStorage.getItem(`minty_archive_${gameSlug}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/**
 * Save an archive puzzle completion
 */
export function saveArchiveScore(gameSlug, dateKey, score) {
  const history = getArchiveHistory(gameSlug);
  history[dateKey] = {
    score,
    completedAt: Date.now(),
  };
  try {
    localStorage.setItem(`minty_archive_${gameSlug}`, JSON.stringify(history));
  } catch {}
  return history;
}
