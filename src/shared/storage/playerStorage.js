// Player persistence & deterministic daily seed generator.
import { trackGameEnd, trackDailyChallenge } from '../analytics/analyticsService';

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

export function getDailySeed() {
  const key = getTodayKey();
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
