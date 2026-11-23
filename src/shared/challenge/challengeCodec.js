// Challenge Link Codec for 1v1 head-to-head matches.

export function encodeChallenge(gameSlug, seed, challengerScore, challengerTime) {
  const payload = {
    g: gameSlug,
    s: seed,
    sc: challengerScore,
    tm: Math.round(challengerTime * 10) / 10,
    v: 1,
  };
  const jsonStr = JSON.stringify(payload);
  // Base64 url-safe
  return btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeChallenge(code) {
  if (!code) return null;
  try {
    let base64 = code.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    return {
      gameSlug: data.g,
      seed: data.s,
      challengerScore: data.sc,
      challengerTime: data.tm,
    };
  } catch (e) {
    return null;
  }
}
