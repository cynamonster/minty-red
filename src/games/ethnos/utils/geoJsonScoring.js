// Geodesic math, ray-casting point-in-polygon, and logarithmic EthnoGuessr scoring

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great circle distance between two points on Earth in km using Haversine formula.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

/**
 * 2D Ray-Casting algorithm to check if a point is inside a polygon ring.
 * ring: array of [lng, lat] coordinates
 */
export function isPointInPolygon(lng, lat, ring) {
  if (!ring || ring.length < 3) return false;
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if (lat, lng) is inside ANY polygon in an array of polygon rings.
 */
export function isPointInAnyPolygon(lat, lng, polygons) {
  if (!polygons || polygons.length === 0) return false;
  for (let i = 0; i < polygons.length; i++) {
    if (isPointInPolygon(lng, lat, polygons[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Projects a point onto a line segment [p1, p2] where p = [lng, lat]
 */
function closestPointOnSegment(lat, lng, p1, p2) {
  let dLng = lng - p1[0];
  while (dLng > 180) dLng -= 360;
  while (dLng < -180) dLng += 360;

  let segDLng = p2[0] - p1[0];
  while (segDLng > 180) segDLng -= 360;
  while (segDLng < -180) segDLng += 360;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  const x = dLng * cosLat;
  const y = lat - p1[1];
  const dx = segDLng * cosLat;
  const dy = p2[1] - p1[1];
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { lat: p1[1], lng: p1[0] };
  }

  const t = Math.max(0, Math.min(1, (x * dx + y * dy) / lenSq));
  let resultLng = p1[0] + t * segDLng;
  while (resultLng > 180) resultLng -= 360;
  while (resultLng < -180) resultLng += 360;

  return {
    lat: p1[1] + t * (p2[1] - p1[1]),
    lng: Math.round(resultLng * 1000) / 1000,
  };
}

/**
 * Evaluates the closest target point and Haversine distance in km to the bright polygons.
 * If user is inside any bright polygon: returns distance 0 and user's own coords.
 */
export function getClosestPointAndDistance(lat, lng, brightPolygons, fallbackCentroid) {
  if (!brightPolygons || brightPolygons.length === 0) {
    if (fallbackCentroid) {
      const d = haversineDistanceKm(lat, lng, fallbackCentroid.lat, fallbackCentroid.lng);
      return { distanceKm: Math.round(d), closestPoint: fallbackCentroid };
    }
    return { distanceKm: 0, closestPoint: { lat, lng } };
  }

  // 1. Core homeland hit check
  if (isPointInAnyPolygon(lat, lng, brightPolygons)) {
    return {
      distanceKm: 0,
      closestPoint: { lat, lng },
      isInsideCore: true,
    };
  }

  // 2. Find closest point among all polygon perimeter segments and vertices
  let minDistance = Infinity;
  let bestPoint = null;

  for (let pIdx = 0; pIdx < brightPolygons.length; pIdx++) {
    const ring = brightPolygons[pIdx];
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const p1 = ring[i];
      const p2 = ring[(i + 1) % n];

      // Check vertex
      const dVertex = haversineDistanceKm(lat, lng, p1[1], p1[0]);
      if (dVertex < minDistance) {
        minDistance = dVertex;
        bestPoint = { lat: p1[1], lng: p1[0] };
      }

      // Check projected point on segment
      const projected = closestPointOnSegment(lat, lng, p1, p2);
      const dSegment = haversineDistanceKm(lat, lng, projected.lat, projected.lng);
      if (dSegment < minDistance) {
        minDistance = dSegment;
        bestPoint = projected;
      }
    }
  }

  return {
    distanceKm: Math.round(minDistance),
    closestPoint: bestPoint || fallbackCentroid || { lat, lng },
    isInsideCore: false,
  };
}

/**
 * EthnoGuessr Authentic Scoring Formula:
 * Score = 5000 * (1 - ln(d / 200) / ln(5000 / 200))
 * where ln(5000 / 200) = ln(25) ≈ 3.2188758
 * d <= 200 km => 5,000 points
 * d >= 5,000 km => 0 points
 */
const LN_25 = Math.log(25);

export function calculateEthnoGuessrScore(distanceKm) {
  if (distanceKm <= 200) return 5000;
  if (distanceKm >= 5000) return 0;
  const score = 5000 * (1 - Math.log(distanceKm / 200) / LN_25);
  return Math.max(0, Math.min(5000, Math.round(score)));
}
