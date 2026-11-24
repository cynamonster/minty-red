// Environment and game availability utilities

export const ALL_GAMES = [
  'metro',
  'orbitdrop',
  'bearinglock',
  'logicgate',
  'citygrid',
  'flaghex',
  'scalecraft',
  'chronos',
  'roots',
  'ethnos',
  'shinobi',
];

export const PUBLIC_GAMES = ['metro', 'orbitdrop'];

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

  // Explicit dev or preview query param
  if (params.get('dev') === 'true' || params.get('preview') === 'true') {
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
 * Returns the list of games available in the current environment.
 * On production minty.red: only 'orbitdrop'
 * On dev site: all games
 */
export function getAvailableGames() {
  return isDevSite() ? ALL_GAMES : PUBLIC_GAMES;
}

/**
 * Checks if a specific game slug is accessible in the current environment.
 */
export function isGameAvailable(slug) {
  if (!slug) return false;
  const available = getAvailableGames();
  return available.includes(slug.toLowerCase());
}
