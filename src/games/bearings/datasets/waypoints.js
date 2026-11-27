// Dataset of iconic global navigation legs, maritime routes, and aviation corridors.
// All initial bearings and distances are calculated via spherical geodesics.

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// Spherical forward azimuth (initial bearing) from (lat1, lon1) to (lat2, lon2)
export function calculateInitialBearing(lat1, lon1, lat2, lon2) {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = (toDeg(θ) + 360) % 360;
  return Math.round(bearing);
}

// Great-circle distance in kilometers
export function calculateGreatCircleDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Shortest angular difference between two bearings in degrees [0, 180]
export function calculateBearingDelta(guess, target) {
  const g = (guess % 360 + 360) % 360;
  const t = (target % 360 + 360) % 360;
  let diff = Math.abs(g - t);
  if (diff > 180) diff = 360 - diff;
  return Math.round(diff * 10) / 10;
}

// 16-point compass rose conversion
export function getCompassHeading(deg) {
  const normalized = (deg % 360 + 360) % 360;
  const points = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return points[index];
}

export function formatDegrees(deg) {
  const normalized = Math.round((deg % 360 + 360) % 360);
  return `${String(normalized).padStart(3, '0')}°`;
}

// Calculate score based on angular error
export function calculateBearingScore(deltaDeg) {
  if (deltaDeg <= 1.5) {
    return { score: 1000, grade: 'TRUE MERIDIAN', badge: 'TRUE MERIDIAN', color: 'text-emerald-400', isBullseye: true };
  }
  if (deltaDeg <= 5) {
    return { score: 950, grade: 'PINPOINT', badge: 'PINPOINT', color: 'text-emerald-300', isBullseye: false };
  }
  if (deltaDeg <= 12) {
    return { score: 850, grade: 'HIGH PRECISION', badge: 'HIGH PRECISION', color: 'text-orange-400', isBullseye: false };
  }
  if (deltaDeg <= 25) {
    return { score: 650, grade: 'WITHIN TOLERANCE', badge: 'WITHIN TOLERANCE', color: 'text-slate-300', isBullseye: false };
  }
  if (deltaDeg <= 45) {
    return { score: 400, grade: 'DEVIATION', badge: 'DEVIATION', color: 'text-amber-400', isBullseye: false };
  }
  if (deltaDeg <= 90) {
    return { score: 180, grade: 'OUT OF BOUNDS', badge: 'OUT OF BOUNDS', color: 'text-rose-400', isBullseye: false };
  }
  return { score: 50, grade: 'OUT OF BOUNDS', badge: 'OUT OF BOUNDS', color: 'text-rose-400', isBullseye: false };
}

export const WAYPOINTS = [
  // 1. Transatlantic & European Corridors
  {
    id: 'nyc-lon',
    category: 'Transatlantic Air Corridor',
    difficulty: 'Normal',
    origin: { name: 'New York City', code: 'JFK', country: 'United States', flag: '🇺🇸', lat: 40.7128, lon: -74.006 },
    dest: { name: 'London', code: 'LHR', country: 'United Kingdom', flag: '🇬🇧', lat: 51.5074, lon: -0.1278 },
    trivia: 'Great circle routes steer northeast over Newfoundland and Ireland rather than flying directly east.',
  },
  {
    id: 'lon-par',
    category: 'Channel Crossing',
    difficulty: 'Easy',
    origin: { name: 'London', code: 'LHR', country: 'United Kingdom', flag: '🇬🇧', lat: 51.5074, lon: -0.1278 },
    dest: { name: 'Paris', code: 'CDG', country: 'France', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
    trivia: 'The historic air route crosses the English Channel on a smooth south-southeast heading.',
  },
  {
    id: 'par-rom',
    category: 'Continental Crossing',
    difficulty: 'Normal',
    origin: { name: 'Paris', code: 'CDG', country: 'France', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
    dest: { name: 'Rome', code: 'FCO', country: 'Italy', flag: '🇮🇹', lat: 41.9028, lon: 12.4964 },
    trivia: 'Cutting over the snow-capped French Alps along a southeast trajectory.',
  },
  {
    id: 'mad-lis',
    category: 'Iberian Waypoint',
    difficulty: 'Easy',
    origin: { name: 'Madrid', code: 'MAD', country: 'Spain', flag: '🇪🇸', lat: 40.4168, lon: -3.7038 },
    dest: { name: 'Lisbon', code: 'LIS', country: 'Portugal', flag: '🇵🇹', lat: 38.7223, lon: -9.1393 },
    trivia: 'Flying straight toward the Atlantic coastline on a gentle west-southwest heading.',
  },
  {
    id: 'rey-osl',
    category: 'Nordic Ocean Pass',
    difficulty: 'Normal',
    origin: { name: 'Reykjavik', code: 'KEF', country: 'Iceland', flag: '🇮🇸', lat: 64.1466, lon: -21.9426 },
    dest: { name: 'Oslo', code: 'OSL', country: 'Norway', flag: '🇳🇴', lat: 59.9139, lon: 10.7522 },
    trivia: 'Across the Norwegian Sea from the volcanic rift towards Scandinavian fjords.',
  },

  // 2. Transpacific & Asia-Pacific
  {
    id: 'tok-syd',
    category: 'Pacific Meridian',
    difficulty: 'Normal',
    origin: { name: 'Tokyo', code: 'HND', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 },
    dest: { name: 'Sydney', code: 'SYD', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lon: 151.2093 },
    trivia: 'Nearly due south with a slight eastern cant across Micronesia and the Coral Sea.',
  },
  {
    id: 'lax-hnl',
    category: 'Hawaiian Overwater',
    difficulty: 'Normal',
    origin: { name: 'Los Angeles', code: 'LAX', country: 'United States', flag: '🇺🇸', lat: 34.0522, lon: -118.2437 },
    dest: { name: 'Honolulu', code: 'HNL', country: 'United States', flag: '🌺', lat: 21.3069, lon: -157.8583 },
    trivia: 'Over 2,500 miles of unbroken Pacific Ocean on an ETOPS certified southwest corridor.',
  },
  {
    id: 'sfo-tok',
    category: 'North Pacific Arc',
    difficulty: 'Tricky',
    origin: { name: 'San Francisco', code: 'SFO', country: 'United States', flag: '🇺🇸', lat: 37.7749, lon: -122.4194 },
    dest: { name: 'Tokyo', code: 'NRT', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 },
    trivia: 'Due to spherical curvature, planes launch northwest over Alaska and the Aleutians, not west!',
  },
  {
    id: 'sin-syd',
    category: 'Equatorial Crossing',
    difficulty: 'Normal',
    origin: { name: 'Singapore', code: 'SIN', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lon: 103.8198 },
    dest: { name: 'Sydney', code: 'SYD', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lon: 151.2093 },
    trivia: 'Traversing the Indonesian archipelago and central Australian Outback on a southeast heading.',
  },
  {
    id: 'hkg-dxb',
    category: 'Silk Skyway',
    difficulty: 'Normal',
    origin: { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong', flag: '🇭🇰', lat: 22.3193, lon: 114.1694 },
    dest: { name: 'Dubai', code: 'DXB', country: 'United Arab Emirates', flag: '🇦🇪', lat: 25.2048, lon: 55.2708 },
    trivia: 'Cruising west-northwest across Indochina, the Bay of Bengal, and northern India.',
  },

  // 3. Americas & Maritime Passages
  {
    id: 'mia-rio',
    category: 'Pan-American Flight',
    difficulty: 'Normal',
    origin: { name: 'Miami', code: 'MIA', country: 'United States', flag: '🇺🇸', lat: 25.7617, lon: -80.1918 },
    dest: { name: 'Rio de Janeiro', code: 'GIG', country: 'Brazil', flag: '🇧🇷', lat: -22.9068, lon: -43.1729 },
    trivia: 'South America lies far further east than North America, giving a sharp southeast heading.',
  },
  {
    id: 'pan-gal',
    category: 'Pacific Convergence',
    difficulty: 'Tricky',
    origin: { name: 'Panama Canal', code: 'PAC', country: 'Panama', flag: '🇵🇦', lat: 8.9824, lon: -79.5199 },
    dest: { name: 'Galapagos Islands', code: 'GPS', country: 'Ecuador', flag: '🐢', lat: -0.9538, lon: -90.9656 },
    trivia: 'Sailing southwest from the Pacific mouth of the canal toward Darwin’s enchanted volcanic isles.',
  },
  {
    id: 'bue-cpt',
    category: 'South Atlantic Crossing',
    difficulty: 'Tricky',
    origin: { name: 'Buenos Aires', code: 'EZE', country: 'Argentina', flag: '🇦🇷', lat: -34.6037, lon: -58.3816 },
    dest: { name: 'Cape Town', code: 'CPT', country: 'South Africa', flag: '🇿🇦', lat: -33.9249, lon: 18.4241 },
    trivia: 'Traversing the Roaring Forties across the vast empty South Atlantic due east.',
  },
  {
    id: 'anc-hnl',
    category: 'Sub-Arctic to Tropics',
    difficulty: 'Easy',
    origin: { name: 'Anchorage', code: 'ANC', country: 'United States', flag: '🇺🇸', lat: 61.2181, lon: -149.9003 },
    dest: { name: 'Honolulu', code: 'HNL', country: 'United States', flag: '🌺', lat: 21.3069, lon: -157.8583 },
    trivia: 'Flying almost straight south down the 150th meridian into Polynesian trade winds.',
  },
  {
    id: 'tor-hav',
    category: 'North-South Corridor',
    difficulty: 'Easy',
    origin: { name: 'Toronto', code: 'YYZ', country: 'Canada', flag: '🇨🇦', lat: 43.6532, lon: -79.3832 },
    dest: { name: 'Havana', code: 'HAV', country: 'Cuba', flag: '🇨🇺', lat: 23.1136, lon: -82.3666 },
    trivia: 'Directly south across the eastern US seaboard to the Caribbean.',
  },

  // 4. Africa, Middle East & Indian Ocean
  {
    id: 'cai-cpt',
    category: 'Cairo to Cape',
    difficulty: 'Easy',
    origin: { name: 'Cairo', code: 'CAI', country: 'Egypt', flag: '🇪🇬', lat: 30.0444, lon: 31.2357 },
    dest: { name: 'Cape Town', code: 'CPT', country: 'South Africa', flag: '🇿🇦', lat: -33.9249, lon: 18.4241 },
    trivia: 'The legendary trans-African axis heading almost directly south-southwest across the Great Rift Valley.',
  },
  {
    id: 'dxb-sin',
    category: 'Indian Ocean Highway',
    difficulty: 'Normal',
    origin: { name: 'Dubai', code: 'DXB', country: 'United Arab Emirates', flag: '🇦🇪', lat: 25.2048, lon: 55.2708 },
    dest: { name: 'Singapore', code: 'SIN', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lon: 103.8198 },
    trivia: 'Crossing the Arabian Sea and southern India along a steady southeast trajectory.',
  },
  {
    id: 'gib-suez',
    category: 'Mediterranean Spine',
    difficulty: 'Easy',
    origin: { name: 'Strait of Gibraltar', code: 'GIB', country: 'Gibraltar', flag: '🇬🇮', lat: 35.9805, lon: -5.3536 },
    dest: { name: 'Suez Canal', code: 'SUZ', country: 'Egypt', flag: '🇪🇬', lat: 30.5852, lon: 32.2654 },
    trivia: 'The historic maritime trade artery pointing east-southeast across the entire length of the Med.',
  },
  {
    id: 'bom-nbo',
    category: 'Monsoon Route',
    difficulty: 'Normal',
    origin: { name: 'Mumbai', code: 'BOM', country: 'India', flag: '🇮🇳', lat: 19.076, lon: 72.8777 },
    dest: { name: 'Nairobi', code: 'NBO', country: 'Kenya', flag: '🇰🇪', lat: -1.2921, lon: 36.8219 },
    trivia: 'The ancient dhow trade winds route navigating southwest across the Arabian Sea.',
  },

  // 5. Extreme & Polar Navigations
  {
    id: 'osl-sva',
    category: 'Arctic Expedition',
    difficulty: 'Easy',
    origin: { name: 'Tromsø', code: 'TOS', country: 'Norway', flag: '🇳🇴', lat: 69.6492, lon: 18.9553 },
    dest: { name: 'Longyearbyen', code: 'LYR', country: 'Svalbard', flag: '❄️', lat: 78.2232, lon: 15.6267 },
    trivia: 'Due north past 78 degrees latitude into the high Arctic wilderness.',
  },
  {
    id: 'pun-mcm',
    category: 'Antarctic Gate',
    difficulty: 'Tricky',
    origin: { name: 'Punta Arenas', code: 'PUQ', country: 'Chile', flag: '🇨🇱', lat: -53.1638, lon: -70.9171 },
    dest: { name: 'McMurdo Station', code: 'MCM', country: 'Antarctica', flag: '🇦🇶', lat: -77.846, lon: 166.668 },
    trivia: 'Flying toward the South Magnetic Pole across the Drake Passage and Amundsen Sea.',
  },
  {
    id: 'ber-tok',
    category: 'Great Polar Circle',
    difficulty: 'Hard',
    origin: { name: 'Berlin', code: 'BER', country: 'Germany', flag: '🇩🇪', lat: 52.52, lon: 13.405 },
    dest: { name: 'Tokyo', code: 'HND', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 },
    trivia: 'The great circle route launches northeast over Scandinavia and Siberia, not east!',
  },
  {
    id: 'syd-scl',
    category: 'Southern Ocean Corridor',
    difficulty: 'Hard',
    origin: { name: 'Sydney', code: 'SYD', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lon: 151.2093 },
    dest: { name: 'Santiago', code: 'SCL', country: 'Chile', flag: '🇨🇱', lat: -33.4489, lon: -70.6693 },
    trivia: 'Flies southeast down toward Antarctica before turning back up northeast to Chile.',
  },
  {
    id: 'jnb-per',
    category: 'Roaring Forties Transit',
    difficulty: 'Normal',
    origin: { name: 'Johannesburg', code: 'JNB', country: 'South Africa', flag: '🇿🇦', lat: -26.2041, lon: 28.0473 },
    dest: { name: 'Perth', code: 'PER', country: 'Australia', flag: '🇦🇺', lat: -31.9505, lon: 115.8605 },
    trivia: 'A nonstop eastward sprint across thousands of miles of cold southern ocean.',
  },
];

// Pre-calculate bearings and distances for all waypoints
export const ENRICHED_WAYPOINTS = WAYPOINTS.map((wp) => {
  const bearing = calculateInitialBearing(
    wp.origin.lat,
    wp.origin.lon,
    wp.dest.lat,
    wp.dest.lon
  );
  const distance = calculateGreatCircleDistance(
    wp.origin.lat,
    wp.origin.lon,
    wp.dest.lat,
    wp.dest.lon
  );
  const heading = getCompassHeading(bearing);
  return {
    ...wp,
    trueBearing: bearing,
    distanceKm: distance,
    heading,
  };
});

export const ROUNDS_PER_DAILY = 5;

// Deterministic daily waypoint selector
export function getDailyWaypoints(seed) {
  const indices = [];
  const total = ENRICHED_WAYPOINTS.length;
  let currentSeed = Math.abs(seed) || 42;

  // Simple LCG pseudo-random generator
  const prng = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  const pool = [...Array(total).keys()];
  for (let i = 0; i < ROUNDS_PER_DAILY; i++) {
    const pickIdx = Math.floor(prng() * pool.length);
    indices.push(pool.splice(pickIdx, 1)[0]);
  }

  return indices.map((idx) => ENRICHED_WAYPOINTS[idx]);
}

// Random waypoint for blitz mode
export function getRandomWaypoint(excludeId = null) {
  const candidates = excludeId
    ? ENRICHED_WAYPOINTS.filter((w) => w.id !== excludeId)
    : ENRICHED_WAYPOINTS;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}
