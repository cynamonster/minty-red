// Environment and game availability utilities

/**
 * Production games available on the live site (minty.red).
 */
export const PUBLIC_GAMES = [
  'orbitdrop',
  'ethnos',
  'bearings',
  'flagship',
];

/**
 * Prototypes and games only visible on dev in the lab cartridges list.
 */
export const LAB_GAMES = [
  'relic',
  'metro',
  'roots',
];

/**
 * All active games accessible in the development / preview environment.
 * Includes production games plus dev lab cartridges (and legacy aliases).
 */
export const ALL_GAMES = [
  ...PUBLIC_GAMES,
  'relic',
  'metro',
  'roots',
  'flaghex', // legacy alias for flagship
  'bearinglock', // legacy alias for bearings
  'bearing_lock',
];

/**
 * Games where development has stopped. No longer available on main or dev sites.
 */
export const STOPPED_GAMES = [
  'logicgate',
  'citygrid',
  'scalecraft',
  'chronos',
  'shinobi',
];

/**
 * Checks if the current environment is a dev / staging / internal site.
 * Dev site conditions:
 * - Localhost / 127.0.0.1 / local development (import.meta.env.DEV)
 * - Dev / preview subdomains (dev.minty.red, preview.minty.red, dash.minty.red, dash.bobby.blue)
 * - Cloudflare Pages preview deployments (*.pages.dev)
 * - URL query parameter (?dev=true or ?preview=true)
 */
export function isDevSite() {
  if (typeof window === 'undefined') return false;

  const host = (window.location.hostname || '').toLowerCase();
  const search = window.location.search || '';
  const params = new URLSearchParams(search);

  // Explicit dev or preview query param (e.g. ?dev=true, ?dev=1, ?dev, ?preview=true, ?pass=true)
  if (
    params.get('dev') === 'true' ||
    params.get('dev') === '1' ||
    params.has('dev') ||
    params.get('preview') === 'true' ||
    params.get('pass') === 'true' ||
    params.get('pass') === '1' ||
    params.has('pass')
  ) {
    return true;
  }

  // Local development
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.localhost')
  ) {
    return true;
  }

  // Subdomains for dev, preview, or studio dashboard
  if (
    host === 'dev.minty.red' ||
    host.endsWith('.dev.minty.red') ||
    host.startsWith('dev.') ||
    host.startsWith('preview.') ||
    host.startsWith('dash.') ||
    host.endsWith('.pages.dev')
  ) {
    return true;
  }

  // Vite development mode
  try {
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      return true;
    }
  } catch {
    // Ignore if not defined
  }

  return false;
}

/**
 * Checks if advertisements should be hidden.
 * Ads (both AdSense and arcade house ads) are hidden on dev.minty.red.
 */
export function shouldHideAds() {
  if (typeof window === 'undefined') return false;
  const host = (window.location.hostname || '').toLowerCase();
  return host === 'dev.minty.red' || host.endsWith('.dev.minty.red');
}

/**
 * Normalizes game slug aliases (e.g. bearing_lock / bearinglock -> bearings, flaghex -> flagship).
 */
export function normalizeGameSlug(slug) {
  if (!slug) return '';
  const clean = slug.toLowerCase().trim();
  if (clean === 'bearing_lock' || clean === 'bearinglock') return 'bearings';
  if (clean === 'flaghex') return 'flagship';
  if (clean === 'cyber-shinobi') return 'shinobi';
  return clean;
}

/**
 * Returns the list of games available in the current environment.
 * On production minty.red: 'orbitdrop', 'ethnos', 'bearings', 'flagship'
 * On dev site: production games + dev lab cartridges
 */
export function getAvailableGames() {
  return isDevSite() ? ALL_GAMES : PUBLIC_GAMES;
}

/**
 * Checks if a specific game slug is accessible in the current environment.
 */
export function isGameAvailable(slug) {
  if (!slug) return false;
  const normalized = normalizeGameSlug(slug);
  const available = getAvailableGames();
  return available.includes(normalized) || available.includes(slug.toLowerCase());
}
