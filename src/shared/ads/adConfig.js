// Ad Configuration & Monetization Settings for Minty.red Arcade Games

export const ADSENSE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_CLIENT_ID) ||
  'ca-pub-3700914218529429';

/**
 * Google AdSense Slot IDs mapped by game slug.
 * Override these with your environment variables (e.g. VITE_ADSENSE_SLOT_ORBITDROP)
 * or supply them in .env.
 */
export const AD_SLOTS = {
  orbitdrop:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_ORBITDROP) ||
    '1000000001',
  chronos:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_CHRONOS) ||
    '1000000002',
  roots:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_ROOTS) ||
    '1000000003',
  ethnos:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_ETHNOS) ||
    '1000000004',
  shinobi:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_SHINOBI) ||
    '1000000005',
  scalecraft:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_SCALECRAFT) ||
    '1000000006',
  flaghex:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_FLAGHEX) ||
    '1000000007',
  citygrid:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_CITYGRID) ||
    '1000000008',
  logicgate:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_LOGICGATE) ||
    '1000000009',
  bearinglock:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_BEARINGLOCK) ||
    '1000000010',
  default:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_DEFAULT) ||
    '1000000000',
};

/**
 * Curated arcade house ads and sponsor promos.
 * Displayed seamlessly when Google AdSense is blocked by adblockers,
 * unconfigured, or in development mode.
 */
export const HOUSE_ADS = [
  {
    id: 'cyber-shinobi',
    gameSlug: 'shinobi',
    title: 'Cyber-Shinobi',
    tagline: 'Neon Cyberpunk Reflex Slasher',
    badge: 'Trending',
    cta: 'Play Now',
    icon: 'Swords',
    accentColor: '#ec4899',
    bgGradient: 'from-pink-950/40 via-purple-950/30 to-slate-900/60',
    borderColor: 'border-pink-500/30',
  },
  {
    id: 'orbitdrop-skins',
    gameSlug: 'orbitdrop',
    title: 'OrbitDrop Daily Slingshot',
    tagline: 'Keplerian physics with daily global leaderboard',
    badge: 'Featured',
    cta: 'Try OrbitDrop',
    icon: 'Orbit',
    accentColor: '#0ea5e9',
    bgGradient: 'from-sky-950/40 via-cyan-950/30 to-slate-900/60',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'chronos-blitz',
    gameSlug: 'chronos',
    title: 'Chronos: Year Slider',
    tagline: 'Pinpoint historical milestones on the scrubbing ruler',
    badge: 'Popular',
    cta: 'Scrub Timeline',
    icon: 'Clock',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-950/40 via-orange-950/30 to-slate-900/60',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'flaghex-reflex',
    gameSlug: 'flaghex',
    title: 'Flag Hex Reflex',
    tagline: 'Speed-identify nations from high-saturation palette hexes',
    badge: 'Fast-Paced',
    cta: 'Test Reflexes',
    icon: 'Zap',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-slate-900/60',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'arcade-hub',
    gameSlug: 'hub',
    title: 'Minty Arcade Pass',
    tagline: '10 instant micro web games. Zero install required.',
    badge: 'Free',
    cta: 'Browse Arcade',
    icon: 'Gamepad2',
    accentColor: '#8b5cf6',
    bgGradient: 'from-indigo-950/40 via-violet-950/30 to-slate-900/60',
    borderColor: 'border-indigo-500/30',
  },
];

/**
 * Gets a random or specific house ad fallback, excluding the current active game
 * so the player is promoted to a different exciting game or arcade feature.
 */
export function getHouseAd(currentGameSlug) {
  const filtered = HOUSE_ADS.filter((ad) => ad.gameSlug !== currentGameSlug);
  const candidates = filtered.length > 0 ? filtered : HOUSE_ADS;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

/**
 * Helper to get the AdSense slot ID for a given game.
 */
export function getAdSlot(gameSlug) {
  return AD_SLOTS[gameSlug] || AD_SLOTS.default;
}
