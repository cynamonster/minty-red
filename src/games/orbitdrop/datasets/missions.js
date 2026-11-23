// OrbitDrop Mission Datasets: 24 Varied Celestial Scenarios
// Spans Single Slingshots, Binary Stars, Asteroid Barriers, and High-Speed Assists.

export const MISSIONS = [
  // --- NOVICE MISSIONS (1 - 4) ---
  {
    id: 'orbit-01',
    name: 'Lunar Swingby',
    difficulty: 'Novice',
    brief: 'Slingshot around the low-gravity moon to reach the portal beacon.',
    parScore: 1000,
    launcher: { x: 70, y: 410 },
    target: { x: 330, y: 90, radius: 24 },
    planets: [
      {
        name: 'Luna Minor',
        x: 200,
        y: 250,
        radius: 26,
        mass: 2200,
        color: '#94a3b8',
        lightColor: '#f1f5f9',
        darkColor: '#334155',
        rimColor: 'rgba(255, 255, 255, 0.4)',
        glowColor: 'rgba(148, 163, 184, 0.45)',
      },
    ],
  },
  {
    id: 'orbit-02',
    name: 'Perilous Periapsis',
    difficulty: 'Novice',
    brief: 'Use the massive gas giant to bend your probe into the orbital shadow.',
    parScore: 1100,
    launcher: { x: 80, y: 420 },
    target: { x: 80, y: 90, radius: 25 },
    planets: [
      {
        name: 'Ares Major',
        x: 230,
        y: 250,
        radius: 38,
        mass: 3800,
        color: '#f97316',
        lightColor: '#fdba74',
        darkColor: '#7c2d12',
        rimColor: 'rgba(254, 215, 170, 0.5)',
        glowColor: 'rgba(249, 115, 22, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-03',
    name: 'Eclipse Run',
    difficulty: 'Novice',
    brief: 'Terra blocks direct flight. Curve over the polar horizon into the gate.',
    parScore: 1150,
    launcher: { x: 60, y: 240 },
    target: { x: 340, y: 240, radius: 24 },
    planets: [
      {
        name: 'Terra Nova',
        x: 200,
        y: 240,
        radius: 34,
        mass: 3200,
        color: '#0284c7',
        lightColor: '#38bdf8',
        darkColor: '#082f49',
        rimColor: 'rgba(125, 211, 252, 0.6)',
        glowColor: 'rgba(56, 189, 248, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-04',
    name: 'Helios Flyby',
    difficulty: 'Novice',
    brief: 'The blazing sun exerts intense gravitational pull. Maintain high escape velocity.',
    parScore: 1200,
    launcher: { x: 90, y: 430 },
    target: { x: 310, y: 110, radius: 26 },
    planets: [
      {
        name: 'Helios Prime',
        x: 180,
        y: 270,
        radius: 42,
        mass: 4500,
        color: '#eab308',
        lightColor: '#fef08a',
        darkColor: '#713f12',
        rimColor: 'rgba(253, 224, 71, 0.7)',
        glowColor: 'rgba(234, 179, 8, 0.6)',
      },
    ],
  },

  // --- CADET MISSIONS (5 - 10) ---
  {
    id: 'orbit-05',
    name: 'Twin Titans',
    difficulty: 'Cadet',
    brief: 'Navigate the saddle point between two equal-mass binary stars.',
    parScore: 1300,
    launcher: { x: 200, y: 440 },
    target: { x: 200, y: 70, radius: 22 },
    planets: [
      {
        name: 'Castor',
        x: 120,
        y: 250,
        radius: 28,
        mass: 2600,
        color: '#38bdf8',
        lightColor: '#bae6fd',
        darkColor: '#0369a1',
        rimColor: 'rgba(186, 230, 253, 0.5)',
        glowColor: 'rgba(56, 189, 248, 0.5)',
      },
      {
        name: 'Pollux',
        x: 280,
        y: 250,
        radius: 28,
        mass: 2600,
        color: '#f43f5e',
        lightColor: '#fecdd3',
        darkColor: '#881337',
        rimColor: 'rgba(254, 205, 211, 0.5)',
        glowColor: 'rgba(244, 63, 94, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-06',
    name: 'The Belt Weave',
    difficulty: 'Cadet',
    brief: 'Weave through an asteroid gravity field and slingshot around the primary moon.',
    parScore: 1350,
    launcher: { x: 60, y: 410 },
    target: { x: 340, y: 90, radius: 23 },
    planets: [
      {
        name: 'Ceres-1',
        x: 140,
        y: 310,
        radius: 18,
        mass: 1400,
        color: '#a1a1aa',
        lightColor: '#e4e4e7',
        darkColor: '#3f3f46',
        glowColor: 'rgba(161, 161, 170, 0.4)',
      },
      {
        name: 'Vesta-X',
        x: 250,
        y: 190,
        radius: 24,
        mass: 2400,
        color: '#fbbf24',
        lightColor: '#fef3c7',
        darkColor: '#78350f',
        glowColor: 'rgba(251, 191, 36, 0.45)',
      },
    ],
  },
  {
    id: 'orbit-07',
    name: 'Crescent Pass',
    difficulty: 'Cadet',
    brief: 'Thread underneath the ring plane of Saturnia for an orbital kick.',
    parScore: 1400,
    launcher: { x: 60, y: 390 },
    target: { x: 330, y: 120, radius: 24 },
    planets: [
      {
        name: 'Saturnia',
        x: 200,
        y: 230,
        radius: 36,
        mass: 3400,
        color: '#c084fc',
        lightColor: '#f3e8ff',
        darkColor: '#581c87',
        hasRing: true,
        ringColor: 'rgba(216, 180, 254, 0.5)',
        glowColor: 'rgba(192, 132, 252, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-08',
    name: 'Hyperbolic Trajectory',
    difficulty: 'Cadet',
    brief: 'High-speed flyby around a dense Crimson Dwarf to strike the portal corner.',
    parScore: 1450,
    launcher: { x: 320, y: 420 },
    target: { x: 70, y: 80, radius: 22 },
    planets: [
      {
        name: 'Crimson Dwarf',
        x: 180,
        y: 260,
        radius: 32,
        mass: 3600,
        color: '#ef4444',
        lightColor: '#fca5a5',
        darkColor: '#7f1d1d',
        glowColor: 'rgba(239, 68, 68, 0.55)',
      },
    ],
  },
  {
    id: 'orbit-09',
    name: 'Deep Space Slingshot',
    difficulty: 'Cadet',
    brief: 'Use the low-orbit gravity assist of ice giant Neptuna to fling into deep space.',
    parScore: 1400,
    launcher: { x: 90, y: 440 },
    target: { x: 320, y: 60, radius: 25 },
    planets: [
      {
        name: 'Neptuna',
        x: 170,
        y: 320,
        radius: 32,
        mass: 3100,
        color: '#06b6d4',
        lightColor: '#a5f3fc',
        darkColor: '#164e63',
        glowColor: 'rgba(6, 182, 212, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-10',
    name: 'Lagrange Drift',
    difficulty: 'Cadet',
    brief: 'Reach the hidden beacon nestled in the gravitational wake behind Titan.',
    parScore: 1500,
    launcher: { x: 70, y: 390 },
    target: { x: 280, y: 150, radius: 20 },
    planets: [
      {
        name: 'Jupiter Prime',
        x: 180,
        y: 220,
        radius: 40,
        mass: 4200,
        color: '#d97706',
        lightColor: '#fde68a',
        darkColor: '#78350f',
        glowColor: 'rgba(217, 119, 6, 0.55)',
      },
      {
        name: 'Europa',
        x: 250,
        y: 180,
        radius: 14,
        mass: 900,
        color: '#e2e8f0',
        lightColor: '#ffffff',
        darkColor: '#475569',
        glowColor: 'rgba(226, 232, 240, 0.4)',
      },
    ],
  },

  // --- COMMANDER MISSIONS (11 - 18) ---
  {
    id: 'orbit-11',
    name: 'Binary Dance',
    difficulty: 'Commander',
    brief: 'Asymmetric binary stars: massive Blue Giant Rigel and dense companion Sirius B.',
    parScore: 1600,
    launcher: { x: 80, y: 420 },
    target: { x: 320, y: 80, radius: 22 },
    planets: [
      {
        name: 'Rigel',
        x: 150,
        y: 270,
        radius: 38,
        mass: 4000,
        color: '#3b82f6',
        lightColor: '#bfdbfe',
        darkColor: '#1e3a8a',
        glowColor: 'rgba(59, 130, 246, 0.55)',
      },
      {
        name: 'Sirius B',
        x: 270,
        y: 190,
        radius: 20,
        mass: 2200,
        color: '#cbd5e1',
        lightColor: '#ffffff',
        darkColor: '#334155',
        glowColor: 'rgba(203, 213, 225, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-12',
    name: 'The Asteroid Gauntlet',
    difficulty: 'Commander',
    brief: 'Three dense asteroid cores create a hazardous cross-gravitational corridor.',
    parScore: 1700,
    launcher: { x: 50, y: 240 },
    target: { x: 350, y: 240, radius: 22 },
    planets: [
      {
        name: 'Alpha Rock',
        x: 160,
        y: 150,
        radius: 19,
        mass: 1600,
        color: '#71717a',
        lightColor: '#d4d4d8',
        darkColor: '#27272a',
        glowColor: 'rgba(113, 113, 122, 0.4)',
      },
      {
        name: 'Beta Rock',
        x: 200,
        y: 330,
        radius: 21,
        mass: 1800,
        color: '#78716c',
        lightColor: '#d6d3d1',
        darkColor: '#292524',
        glowColor: 'rgba(120, 113, 108, 0.4)',
      },
      {
        name: 'Gamma Rock',
        x: 260,
        y: 170,
        radius: 17,
        mass: 1500,
        color: '#a1a1aa',
        lightColor: '#f4f4f5',
        darkColor: '#3f3f46',
        glowColor: 'rgba(161, 161, 170, 0.4)',
      },
    ],
  },
  {
    id: 'orbit-13',
    name: 'The S-Curve Slingshot',
    difficulty: 'Commander',
    brief: 'Master dual planetary deflection: curve left around planet 1, right around planet 2.',
    parScore: 1750,
    launcher: { x: 60, y: 430 },
    target: { x: 340, y: 70, radius: 22 },
    planets: [
      {
        name: 'Zephyr',
        x: 140,
        y: 310,
        radius: 26,
        mass: 2700,
        color: '#10b981',
        lightColor: '#a7f3d0',
        darkColor: '#064e3b',
        glowColor: 'rgba(16, 185, 129, 0.5)',
      },
      {
        name: 'Boreas',
        x: 270,
        y: 180,
        radius: 28,
        mass: 2900,
        color: '#8b5cf6',
        lightColor: '#ddd6fe',
        darkColor: '#4c1d95',
        glowColor: 'rgba(139, 92, 246, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-14',
    name: 'Charybdis and Scylla',
    difficulty: 'Commander',
    brief: 'Two immense gas titans flank the space lane. Pull an exterior boundary orbit.',
    parScore: 1800,
    launcher: { x: 200, y: 440 },
    target: { x: 200, y: 60, radius: 23 },
    planets: [
      {
        name: 'Charybdis',
        x: 110,
        y: 240,
        radius: 35,
        mass: 3700,
        color: '#ec4899',
        lightColor: '#fbcfe8',
        darkColor: '#831843',
        glowColor: 'rgba(236, 72, 153, 0.55)',
      },
      {
        name: 'Scylla',
        x: 290,
        y: 240,
        radius: 35,
        mass: 3700,
        color: '#06b6d4',
        lightColor: '#cffafe',
        darkColor: '#164e63',
        glowColor: 'rgba(6, 182, 212, 0.55)',
      },
    ],
  },
  {
    id: 'orbit-15',
    name: "Voyager's Path",
    difficulty: 'Commander',
    brief: 'Sequential orbital assist: scrape past Jupiter to accelerate into Saturnian orbit.',
    parScore: 1850,
    launcher: { x: 50, y: 420 },
    target: { x: 350, y: 100, radius: 21 },
    planets: [
      {
        name: 'Jupiter',
        x: 150,
        y: 330,
        radius: 32,
        mass: 3300,
        color: '#f59e0b',
        lightColor: '#fde68a',
        darkColor: '#78350f',
        glowColor: 'rgba(245, 158, 11, 0.5)',
      },
      {
        name: 'Saturn',
        x: 250,
        y: 200,
        radius: 30,
        mass: 3000,
        color: '#eab308',
        lightColor: '#fef08a',
        darkColor: '#713f12',
        hasRing: true,
        ringColor: 'rgba(254, 240, 138, 0.45)',
        glowColor: 'rgba(234, 179, 8, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-16',
    name: 'The Asteroid Arc',
    difficulty: 'Commander',
    brief: 'Four rocky bodies form an orbital barrier. Find the critical trajectory window.',
    parScore: 1900,
    launcher: { x: 200, y: 430 },
    target: { x: 200, y: 70, radius: 22 },
    planets: [
      {
        name: 'Shard-A',
        x: 90,
        y: 270,
        radius: 16,
        mass: 1400,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
      {
        name: 'Shard-B',
        x: 160,
        y: 220,
        radius: 17,
        mass: 1500,
        color: '#64748b',
        glowColor: 'rgba(100, 116, 139, 0.4)',
      },
      {
        name: 'Shard-C',
        x: 240,
        y: 220,
        radius: 17,
        mass: 1500,
        color: '#64748b',
        glowColor: 'rgba(100, 116, 139, 0.4)',
      },
      {
        name: 'Shard-D',
        x: 310,
        y: 270,
        radius: 16,
        mass: 1400,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
    ],
  },
  {
    id: 'orbit-17',
    name: 'Pulsar Corridor',
    difficulty: 'Commander',
    brief: 'A high-density pulsar generates extreme localized curvature.',
    parScore: 1950,
    launcher: { x: 80, y: 410 },
    target: { x: 320, y: 100, radius: 22 },
    planets: [
      {
        name: 'PSR J0737',
        x: 200,
        y: 240,
        radius: 18,
        mass: 4200,
        color: '#38bdf8',
        lightColor: '#ffffff',
        darkColor: '#0284c7',
        glowColor: 'rgba(56, 189, 248, 0.7)',
      },
    ],
  },
  {
    id: 'orbit-18',
    name: 'Slingshot Acceleration',
    difficulty: 'Commander',
    brief: 'Use a high-speed near-surface pass to double probe velocity toward distant beacon.',
    parScore: 1900,
    launcher: { x: 70, y: 350 },
    target: { x: 330, y: 60, radius: 23 },
    planets: [
      {
        name: 'Chronos Heavy',
        x: 180,
        y: 280,
        radius: 36,
        mass: 4100,
        color: '#f97316',
        lightColor: '#ffedd5',
        darkColor: '#7c2d12',
        glowColor: 'rgba(249, 115, 22, 0.55)',
      },
    ],
  },

  // --- COSMIC MISSIONS (19 - 24) ---
  {
    id: 'orbit-19',
    name: 'Triple Star Nexus',
    difficulty: 'Cosmic',
    brief: 'Three stellar masses in equilateral triad create a complex gravitational labyrinth.',
    parScore: 2100,
    launcher: { x: 200, y: 440 },
    target: { x: 200, y: 60, radius: 16 },
    planets: [
      {
        name: 'Alpha',
        x: 120,
        y: 300,
        radius: 25,
        mass: 2500,
        color: '#f43f5e',
        lightColor: '#fecdd3',
        darkColor: '#881337',
        glowColor: 'rgba(244, 63, 94, 0.5)',
      },
      {
        name: 'Beta',
        x: 280,
        y: 300,
        radius: 25,
        mass: 2500,
        color: '#06b6d4',
        lightColor: '#cffafe',
        darkColor: '#164e63',
        glowColor: 'rgba(6, 182, 212, 0.5)',
      },
      {
        name: 'Gamma',
        x: 200,
        y: 180,
        radius: 26,
        mass: 2700,
        color: '#eab308',
        lightColor: '#fef08a',
        darkColor: '#713f12',
        glowColor: 'rgba(234, 179, 8, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-20',
    name: 'Neutron Needle',
    difficulty: 'Cosmic',
    brief: 'A hyper-dense neutron star with pin-point radius bends space at extreme angles.',
    parScore: 2200,
    launcher: { x: 60, y: 390 },
    target: { x: 340, y: 90, radius: 14 },
    planets: [
      {
        name: 'Magnetar X',
        x: 200,
        y: 240,
        radius: 12,
        mass: 4800,
        color: '#ec4899',
        lightColor: '#ffffff',
        darkColor: '#9d174d',
        glowColor: 'rgba(236, 72, 153, 0.8)',
      },
    ],
  },
  {
    id: 'orbit-21',
    name: 'Singularity Gate',
    difficulty: 'Cosmic',
    brief: 'Dark gravitational singularity forces an impossible 180-degree hairpin return.',
    parScore: 2300,
    launcher: { x: 100, y: 420 },
    target: { x: 300, y: 420, radius: 15 },
    planets: [
      {
        name: 'Void Maw',
        x: 200,
        y: 210,
        radius: 22,
        mass: 5200,
        color: '#312e81',
        lightColor: '#818cf8',
        darkColor: '#0f172a',
        glowColor: 'rgba(129, 140, 248, 0.7)',
      },
    ],
  },
  {
    id: 'orbit-22',
    name: "Kepler's Challenge",
    difficulty: 'Cosmic',
    brief: 'Gas giant with two counter-weight moons creates a treacherous orbital slalom.',
    parScore: 2400,
    launcher: { x: 60, y: 420 },
    target: { x: 340, y: 80, radius: 15 },
    planets: [
      {
        name: 'Kepler-452',
        x: 200,
        y: 250,
        radius: 36,
        mass: 3800,
        color: '#10b981',
        lightColor: '#d1fae5',
        darkColor: '#064e3b',
        glowColor: 'rgba(16, 185, 129, 0.55)',
      },
      {
        name: 'Moon I',
        x: 130,
        y: 190,
        radius: 14,
        mass: 1100,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
      {
        name: 'Moon II',
        x: 270,
        y: 310,
        radius: 14,
        mass: 1100,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
    ],
  },
  {
    id: 'orbit-23',
    name: 'Cosmic Slingshot Finale',
    difficulty: 'Cosmic',
    brief: 'A grand quad-body alignment. One single trajectory leads to portal synchronization.',
    parScore: 2500,
    launcher: { x: 60, y: 430 },
    target: { x: 340, y: 70, radius: 14 },
    planets: [
      {
        name: 'Sol Alpha',
        x: 130,
        y: 330,
        radius: 22,
        mass: 2200,
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.5)',
      },
      {
        name: 'Sol Beta',
        x: 180,
        y: 220,
        radius: 26,
        mass: 2800,
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        name: 'Sol Gamma',
        x: 270,
        y: 270,
        radius: 20,
        mass: 2000,
        color: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.5)',
      },
    ],
  },
  {
    id: 'orbit-24',
    name: 'Gravity Well Escape',
    difficulty: 'Cosmic',
    brief: 'Launch pad is buried deep within the gravity throat. Max thrust escape trajectory!',
    parScore: 2500,
    launcher: { x: 200, y: 380 },
    target: { x: 200, y: 60, radius: 15 },
    planets: [
      {
        name: 'Gargantua',
        x: 200,
        y: 220,
        radius: 46,
        mass: 5500,
        color: '#4338ca',
        lightColor: '#a5b4fc',
        darkColor: '#1e1b4b',
        glowColor: 'rgba(99, 102, 241, 0.7)',
      },
      {
        name: 'Anvil-1',
        x: 90,
        y: 130,
        radius: 18,
        mass: 1600,
        color: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.45)',
      },
      {
        name: 'Anvil-2',
        x: 310,
        y: 130,
        radius: 18,
        mass: 1600,
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.45)',
      },
    ],
  },
  {
    id: 'orbit-25',
    name: 'Event Horizon Slalom',
    difficulty: 'Cosmic',
    brief: 'Two counter-spinning black hole remnants flank an ultra-narrow relativistic escape corridor.',
    parScore: 2600,
    launcher: { x: 200, y: 440 },
    target: { x: 200, y: 55, radius: 14 },
    planets: [
      {
        name: 'Maw-Prime',
        x: 110,
        y: 230,
        radius: 24,
        mass: 4800,
        color: '#6366f1',
        lightColor: '#c7d2fe',
        darkColor: '#312e81',
        glowColor: 'rgba(99, 102, 241, 0.7)',
      },
      {
        name: 'Maw-Secundus',
        x: 290,
        y: 230,
        radius: 24,
        mass: 4800,
        color: '#ec4899',
        lightColor: '#fbcfe8',
        darkColor: '#831843',
        glowColor: 'rgba(236, 72, 153, 0.7)',
      },
      {
        name: 'Choke Moon',
        x: 200,
        y: 140,
        radius: 16,
        mass: 1800,
        color: '#64748b',
        glowColor: 'rgba(100, 116, 139, 0.4)',
      },
    ],
  },
  {
    id: 'orbit-26',
    name: 'The Gauntlet of Prometheus',
    difficulty: 'Cosmic',
    brief: 'A blazing hypergiant star shielded by an asteroid barrier. Only a high-speed outer arc survives.',
    parScore: 2700,
    launcher: { x: 60, y: 420 },
    target: { x: 340, y: 65, radius: 14 },
    planets: [
      {
        name: 'Prometheus Major',
        x: 200,
        y: 240,
        radius: 40,
        mass: 5400,
        color: '#ef4444',
        lightColor: '#fee2e2',
        darkColor: '#7f1d1d',
        glowColor: 'rgba(239, 68, 68, 0.75)',
      },
      {
        name: 'Aegis-1',
        x: 100,
        y: 310,
        radius: 12,
        mass: 900,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
      {
        name: 'Aegis-2',
        x: 150,
        y: 150,
        radius: 12,
        mass: 900,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
      {
        name: 'Aegis-3',
        x: 280,
        y: 170,
        radius: 12,
        mass: 900,
        color: '#94a3b8',
        glowColor: 'rgba(148, 163, 184, 0.4)',
      },
    ],
  },
];

/**
 * Find mission by ID
 */
export function getMissionById(id) {
  return MISSIONS.find((m) => m.id === id) || MISSIONS[0];
}

/**
 * Deterministic PRNG helper
 */
function seededShuffle(array, seed) {
  const result = [...array];
  let s = Math.abs(seed) || 123456789;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 5 Daily Flight missions (curated progressive difficulty: Novice -> Cadet -> Commander -> Cosmic -> Cosmic Finale)
 */
export function generateDailyMissions(seed) {
  const novice = MISSIONS.filter((m) => m.difficulty === 'Novice');
  const cadet = MISSIONS.filter((m) => m.difficulty === 'Cadet');
  const commander = MISSIONS.filter((m) => m.difficulty === 'Commander');
  const cosmic = MISSIONS.filter((m) => m.difficulty === 'Cosmic');

  const s1 = seededShuffle(novice, seed);
  const s2 = seededShuffle(cadet, seed + 1);
  const s3 = seededShuffle(commander, seed + 2);
  const sCosmic = seededShuffle(cosmic, seed + 3);

  const m4 = sCosmic[0];
  const m5 = sCosmic.find((m) => m.id !== m4.id) || sCosmic[1];

  return [s1[0], s2[0], s3[0], m4, m5];
}

/**
 * Generate 5 Blitz missions with randomized seed
 */
export function generateBlitzMissions(count = 5, seed = Date.now()) {
  const novice = MISSIONS.filter((m) => m.difficulty === 'Novice');
  const cadet = MISSIONS.filter((m) => m.difficulty === 'Cadet');
  const commander = MISSIONS.filter((m) => m.difficulty === 'Commander');
  const cosmic = MISSIONS.filter((m) => m.difficulty === 'Cosmic');

  const s1 = seededShuffle(novice, seed);
  const s2 = seededShuffle(cadet, seed + 17);
  const s3 = seededShuffle(commander, seed + 33);
  const sCosmic = seededShuffle(cosmic, seed + 49);

  const m4 = sCosmic[0];
  const m5 = sCosmic.find((m) => m.id !== m4.id) || sCosmic[1];

  return [s1[0], s2[0], s3[0], m4, m5];
}

/**
 * Generate 5 Duel missions with deterministic challenge seed
 */
export function generateDuelMissions(seed) {
  return generateDailyMissions(seed);
}

/**
 * Generate sequential mission for Infinite Expedition Mode.
 * Cycles progressively through Novice -> Cadet -> Commander -> Cosmic with scaled gravity.
 */
export function generateInfiniteMission(missionIdx, seed = 42) {
  const baseMission = MISSIONS[missionIdx % MISSIONS.length];
  const cycle = Math.floor(missionIdx / MISSIONS.length);
  if (cycle === 0) {
    return {
      ...baseMission,
      id: `inf-${missionIdx + 1}`,
      name: `Mission ${missionIdx + 1}: ${baseMission.name}`,
    };
  }

  // Deep space variation for higher cycles
  const prng = (s) => Math.abs(Math.sin(s) * 10000) % 1;
  const planets = baseMission.planets.map((p, i) => {
    const shift = (prng(seed + missionIdx * 10 + i) - 0.5) * 18;
    return {
      ...p,
      x: Math.max(70, Math.min(330, p.x + shift)),
      mass: Math.round(p.mass * (1 + cycle * 0.05)),
    };
  });

  return {
    ...baseMission,
    id: `inf-${missionIdx + 1}`,
    name: `Mission ${missionIdx + 1}: Deep ${baseMission.name}`,
    parScore: (baseMission.parScore || 1000) + cycle * 200,
    planets,
  };
}
