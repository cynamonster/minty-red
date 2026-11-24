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
  flagship:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_FLAGSHIP) ||
    '1000000007',
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
    id: 'orbitdrop-skins',
    gameSlug: 'orbitdrop',
    title: 'OrbitDrop Daily Slingshot',
    tagline: 'Keplerian physics with daily global leaderboard',
    cta: 'Try OrbitDrop',
    icon: 'Orbit',
    accentColor: '#0ea5e9',
    bgGradient: 'from-sky-950/40 via-cyan-950/30 to-slate-900/60',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'flagship-reflex',
    gameSlug: 'flagship',
    title: 'Flagship: Admiralty Reflex',
    tagline: 'Speed-identify sovereign naval ensigns before steam vents',
    cta: 'Board Flagship',
    icon: 'Anchor',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-950/40 via-sky-950/30 to-slate-900/60',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'arcade-hub',
    gameSlug: 'hub',
    title: 'Minty Arcade Pass',
    tagline: '10 instant micro web games. Zero install required.',
    cta: 'Browse Arcade',
    icon: 'Gamepad2',
    accentColor: '#8b5cf6',
    bgGradient: 'from-indigo-950/40 via-violet-950/30 to-slate-900/60',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'bearinglock-blitz',
    gameSlug: 'bearinglock',
    title: 'Bearing Lock: Compass Blitz',
    tagline: 'Lock into true nautical and aerial bearings across global landmarks',
    cta: 'Spin Compass',
    icon: 'Compass',
    accentColor: '#14b8a6',
    bgGradient: 'from-teal-950/40 via-cyan-950/30 to-slate-900/60',
    borderColor: 'border-teal-500/30',
  },
  {
    id: 'roots-origins',
    gameSlug: 'roots',
    title: 'Roots: Surname Origins',
    tagline: 'Trace the linguistic roots and etymology of global surnames',
    cta: 'Explore Roots',
    icon: 'Compass',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-slate-900/60',
    borderColor: 'border-emerald-500/30',
  },
];

/**
 * Detects whether an AdSense slot ID is an unconfigured placeholder.
 * Placeholder IDs use the pattern 1000000000 - 1000000099.
 */
export function isPlaceholderSlot(slotId) {
  if (!slotId) return true;
  const str = String(slotId).trim();
  return /^10{8}\d$/.test(str) || str === '1000000000' || str.startsWith('100000000');
}

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
