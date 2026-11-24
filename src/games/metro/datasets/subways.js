// METRO Transit Topology Dataset
// Stripped-down topological polyline diagrams of iconic global rapid transit networks
// Stations and geographical waterlines are stripped to isolate pure network topology.

export const SUBWAY_DATASET = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    systemName: 'Tokyo Subway & Yamanote Loop',
    continent: 'Asia',
    topologicalFact: 'Encircling central Tokyo with 30 stations, the iconic Yamanote loop acts as the gravitational center for 13 intersecting underground subway lines carrying 8M+ daily commuters.',
    distractors: ['Seoul', 'Osaka', 'Taipei'],
    viewBox: '0 0 400 400',
    lines: [
      // Yamanote Loop (Green)
      { name: 'Yamanote Loop', color: '#00ff88', strokeWidth: 4.5, path: 'M 140,90 C 240,70 300,120 290,220 C 280,310 200,340 140,320 C 80,300 70,220 80,140 Z' },
      // Marunouchi Line (Red C-curve)
      { name: 'Marunouchi', color: '#ff2d55', strokeWidth: 3.5, path: 'M 70,230 C 130,230 140,290 200,280 C 260,270 280,190 230,140 C 200,110 140,130 110,80' },
      // Chiyoda Line (Emerald)
      { name: 'Chiyoda', color: '#00d284', strokeWidth: 3, path: 'M 60,300 L 140,230 L 220,180 L 290,110 L 340,60' },
      // Ginza Line (Orange)
      { name: 'Ginza', color: '#ff9500', strokeWidth: 3, path: 'M 70,250 C 110,230 180,240 230,200 C 260,170 260,120 270,90' },
      // Tozai Line (Cyan East-West spine)
      { name: 'Tozai', color: '#00c7ff', strokeWidth: 3, path: 'M 50,160 L 140,180 L 230,210 L 350,220' },
      // Hibiya Line (Silver Gray)
      { name: 'Hibiya', color: '#a0aec0', strokeWidth: 3, path: 'M 90,320 C 140,280 180,250 220,240 C 270,230 290,160 260,90 L 280,50' },
      // Oedo Line (Magenta spiral loop)
      { name: 'Oedo Loop', color: '#d946ef', strokeWidth: 2.5, path: 'M 40,110 L 90,110 C 150,110 270,110 270,190 C 270,270 120,290 100,210 C 90,170 150,150 200,160' }
    ]
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    systemName: 'London Underground (The Tube)',
    continent: 'Europe',
    topologicalFact: 'The world’s oldest underground railway (1863). Its schematic map, designed by electrical draughtsman Harry Beck in 1931, established the global standard for topological transit cartography.',
    distractors: ['Glasgow', 'Manchester', 'Dublin'],
    viewBox: '0 0 400 400',
    lines: [
      // Circle Line (Yellow bottle shape)
      { name: 'Circle', color: '#ffd60a', strokeWidth: 4, path: 'M 110,180 L 150,140 L 280,140 L 300,180 L 280,230 L 140,230 L 110,180 Z' },
      // Central Line (Red East-West spine)
      { name: 'Central', color: '#ef4444', strokeWidth: 3.5, path: 'M 40,170 L 110,170 L 160,170 L 240,170 L 300,150 L 360,120' },
      // Piccadilly Line (Deep Blue Diagonal)
      { name: 'Piccadilly', color: '#2563eb', strokeWidth: 3, path: 'M 50,290 L 120,240 L 170,200 L 230,150 L 280,90 L 340,60' },
      // Northern Line (Black dual-branch chasm)
      { name: 'Northern', color: '#e2e8f0', strokeWidth: 3, path: 'M 170,50 L 170,130 L 180,180 L 180,260 L 160,340 M 230,50 L 230,130 L 220,180 L 220,260 L 160,340' },
      // Victoria Line (Light Cyan Diagonal)
      { name: 'Victoria', color: '#06b6d4', strokeWidth: 3, path: 'M 100,320 L 160,250 L 200,190 L 240,130 L 300,70' },
      // Jubilee Line (Silver)
      { name: 'Jubilee', color: '#94a3b8', strokeWidth: 3, path: 'M 90,70 L 140,130 L 170,190 L 230,230 L 290,240 L 350,210 L 370,260' },
      // District Line (Green)
      { name: 'District', color: '#22c55e', strokeWidth: 3, path: 'M 40,240 L 130,240 L 290,240 L 360,200 M 120,330 L 130,240 L 130,140' }
    ]
  },
  {
    id: 'newyork',
    city: 'New York City',
    country: 'United States',
    systemName: 'New York City Subway',
    continent: 'North America',
    topologicalFact: 'With 472 stations, it has the most stations of any rapid transit system on Earth, famous for its 4-track trunk lines allowing express trains to skip local stops.',
    distractors: ['Chicago', 'Philadelphia', 'Boston'],
    viewBox: '0 0 400 400',
    lines: [
      // 1/2/3 Broadway-7th Ave (Red West Spine)
      { name: 'Broadway-7th Ave (1/2/3)', color: '#ef4444', strokeWidth: 4, path: 'M 160,30 L 160,170 L 150,240 L 180,290 L 230,330 L 310,340' },
      // 4/5/6 Lexington Ave (Green East Spine)
      { name: 'Lexington Ave (4/5/6)', color: '#22c55e', strokeWidth: 4, path: 'M 210,30 L 210,240 L 190,280 L 240,320 L 290,310' },
      // A/C/E 8th Ave (Blue Trunk)
      { name: '8th Ave (A/C/E)', color: '#3b82f6', strokeWidth: 3.5, path: 'M 130,30 L 140,140 L 140,240 L 170,280 L 230,310 L 330,360 M 330,360 L 370,370' },
      // B/D/F/M 6th Ave (Orange Trunk)
      { name: '6th Ave (B/D/F/M)', color: '#f97316', strokeWidth: 3.5, path: 'M 180,30 L 180,180 L 160,250 L 210,290 L 270,300 L 260,370' },
      // N/Q/R/W Broadway (Yellow Trunk)
      { name: 'Broadway (N/Q/R/W)', color: '#eab308', strokeWidth: 3.5, path: 'M 260,110 L 190,130 L 170,210 L 180,270 L 210,300 L 200,370' },
      // 7 Flushing Line (Purple East-West crosstown into Queens)
      { name: 'Flushing (7)', color: '#a855f7', strokeWidth: 3, path: 'M 110,180 L 230,180 L 310,160 L 370,110' },
      // L Line (Silver Canarsie 14th St crosstown)
      { name: '14th St (L)', color: '#94a3b8', strokeWidth: 3, path: 'M 100,220 L 200,220 L 260,240 L 320,290' }
    ]
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    systemName: 'Métro de Paris',
    continent: 'Europe',
    topologicalFact: 'One of the densest transit grids globally: within the Paris city limits, no point is further than 500 meters (0.3 miles) from an entrance, framed by outer loop Lines 2 & 6.',
    distractors: ['Lyon', 'Brussels', 'Marseille'],
    viewBox: '0 0 400 400',
    lines: [
      // Line 2 (Northern semi-circular crown)
      { name: 'Ligne 2 (Nord)', color: '#3b82f6', strokeWidth: 4, path: 'M 90,190 C 100,100 290,90 310,190' },
      // Line 6 (Southern semi-circular smile)
      { name: 'Ligne 6 (Sud)', color: '#10b981', strokeWidth: 4, path: 'M 90,190 C 110,300 290,310 310,190' },
      // Line 1 (Yellow East-West Seine spine)
      { name: 'Ligne 1 (Champs-Élysées)', color: '#fbbf24', strokeWidth: 3.5, path: 'M 50,140 L 120,170 L 200,200 L 280,210 L 360,230' },
      // Line 4 (Magenta North-South cross)
      { name: 'Ligne 4', color: '#ec4899', strokeWidth: 3, path: 'M 210,60 L 210,180 L 190,220 L 170,340' },
      // Line 14 (Purple automated express diagonal)
      { name: 'Ligne 14', color: '#8b5cf6', strokeWidth: 3.5, path: 'M 140,90 L 180,150 L 230,220 L 270,320' },
      // Line 8 (Lilac southwest to southeast sweep)
      { name: 'Ligne 8', color: '#c084fc', strokeWidth: 2.5, path: 'M 60,260 L 150,210 L 250,170 L 300,240 L 340,330' }
    ]
  },
  {
    id: 'moscow',
    city: 'Moscow',
    country: 'Russia',
    systemName: 'Moscow Metro (Московское метро)',
    continent: 'Europe',
    topologicalFact: 'Renowned for its iconic brown Ring Line (Koltsevaya) encircling the Kremlin and Stalinist palace-like stations, it forms a near-perfect radial-circular spiderweb.',
    distractors: ['Saint Petersburg', 'Kyiv', 'Warsaw'],
    viewBox: '0 0 400 400',
    lines: [
      // Koltsevaya Ring Line (Brown Circle)
      { name: 'Koltsevaya Ring', color: '#a16207', strokeWidth: 5, path: 'M 200,120 A 80 80 0 1 0 200.1,120 Z' },
      // Sokolnicheskaya (Red Radial)
      { name: 'Sokolnicheskaya (Line 1)', color: '#ef4444', strokeWidth: 3, path: 'M 90,330 L 170,230 L 230,170 L 310,70' },
      // Zamoskvoretskaya (Green Radial)
      { name: 'Zamoskvoretskaya (Line 2)', color: '#16a34a', strokeWidth: 3, path: 'M 190,40 L 190,160 L 210,240 L 280,340' },
      // Arbatsko-Pokrovskaya (Blue East-West)
      { name: 'Arbatsko-Pokrovskaya (Line 3)', color: '#2563eb', strokeWidth: 3, path: 'M 50,180 L 160,200 L 240,200 L 350,170' },
      // Tagansko-Krasnopresnenskaya (Purple Radial)
      { name: 'Tagansko (Line 7)', color: '#9333ea', strokeWidth: 3, path: 'M 80,100 L 170,180 L 230,220 L 330,310' },
      // Kaluzhsko-Rizhskaya (Orange Radial)
      { name: 'Orange Radial (Line 6)', color: '#ea580c', strokeWidth: 3, path: 'M 250,40 L 210,160 L 180,240 L 120,340' }
    ]
  },
  {
    id: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    systemName: 'Berlin U-Bahn & S-Bahn Ring',
    continent: 'Europe',
    topologicalFact: 'Framed by the S-Bahn Ringbahn (popularly dubbed "Hundekopf" or Dog’s Head because of its distinctive silhouette), traversed by 9 U-Bahn lines that reunited East and West.',
    distractors: ['Munich', 'Vienna', 'Hamburg'],
    viewBox: '0 0 400 400',
    lines: [
      // Ringbahn (Dog head polygon/oval)
      { name: 'Ringbahn (S41/S42)', color: '#ca8a04', strokeWidth: 4.5, path: 'M 140,110 C 230,80 320,110 330,180 C 340,250 280,300 200,310 C 130,320 80,260 70,190 C 65,145 100,120 140,110 Z' },
      // Stadtbahn (East-West Trunk)
      { name: 'Stadtbahn (S-Bahn Trunk)', color: '#16a34a', strokeWidth: 4, path: 'M 40,220 L 120,200 L 200,185 L 280,195 L 360,240' },
      // U7 (Light blue zigzag longest line)
      { name: 'U7', color: '#0284c7', strokeWidth: 3, path: 'M 50,110 L 110,180 L 180,230 L 270,250 L 340,340' },
      // U2 (Red snake through Alexanderplatz)
      { name: 'U2', color: '#dc2626', strokeWidth: 3, path: 'M 90,260 L 160,220 L 200,200 L 250,160 L 260,90' },
      // U8 (Dark blue North-South)
      { name: 'U8', color: '#1e40af', strokeWidth: 3, path: 'M 220,50 L 230,150 L 220,240 L 200,340' }
    ]
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    systemName: 'Seoul Metropolitan Subway',
    continent: 'Asia',
    topologicalFact: 'Line 2 (the vibrant green circle) is one of the world’s longest circular subway lines at 60.2 km, looping continuously between Gangnam, Sinchon, and City Hall across the Han River.',
    distractors: ['Busan', 'Tokyo', 'Incheon'],
    viewBox: '0 0 400 400',
    lines: [
      // Line 2 (The Great Green Loop)
      { name: 'Line 2 (Circle)', color: '#22c55e', strokeWidth: 4.5, path: 'M 120,130 C 220,100 320,120 320,210 C 320,300 230,320 140,300 C 60,280 60,160 120,130 Z' },
      // Line 1 (Dark Blue spine)
      { name: 'Line 1', color: '#1e3a8a', strokeWidth: 3.5, path: 'M 50,70 L 150,140 L 180,170 L 260,160 L 360,120 M 180,170 L 120,340' },
      // Line 3 (Orange diagonal)
      { name: 'Line 3', color: '#ea580c', strokeWidth: 3, path: 'M 90,90 L 170,150 L 220,210 L 290,290' },
      // Line 4 (Cyan diagonal)
      { name: 'Line 4', color: '#06b6d4', strokeWidth: 3, path: 'M 280,60 L 220,140 L 180,190 L 110,290' },
      // Line 5 (Purple twin-branch cross)
      { name: 'Line 5', color: '#9333ea', strokeWidth: 3, path: 'M 40,200 L 160,190 L 230,180 L 320,170 M 230,180 L 330,250' },
      // Line 9 (Gold express southern corridor)
      { name: 'Line 9', color: '#d97706', strokeWidth: 3, path: 'M 50,230 L 150,260 L 260,260 L 350,230' }
    ]
  },
  {
    id: 'washington',
    city: 'Washington, D.C.',
    country: 'United States',
    systemName: 'Washington Metro (Metrorail)',
    continent: 'North America',
    topologicalFact: 'Centered around the massive vaults of Metro Center and L’Enfant Plaza, its iconic Red Line forms a wide U-shape linking Maryland and DC across rock-hewn vaulted stations.',
    distractors: ['Baltimore', 'Atlanta', 'Philadelphia'],
    viewBox: '0 0 400 400',
    lines: [
      // Red Line (Big U-Curve)
      { name: 'Red Line', color: '#ef4444', strokeWidth: 4, path: 'M 100,70 L 100,160 L 160,210 L 240,210 L 280,160 L 280,60' },
      // Orange/Silver/Blue Shared Corridor
      { name: 'Orange/Silver/Blue Trunk', color: '#f97316', strokeWidth: 4, path: 'M 40,230 L 120,230 L 170,230 L 260,230 L 350,200' },
      // Blue Line branch to Alexandria/Pentagon
      { name: 'Blue Line South', color: '#3b82f6', strokeWidth: 3, path: 'M 140,230 L 140,290 L 120,340' },
      // Yellow/Green North-South Trunk
      { name: 'Yellow/Green Line', color: '#22c55e', strokeWidth: 3.5, path: 'M 210,70 L 210,210 L 210,250 L 240,330' },
      // Yellow Potomac crossing
      { name: 'Yellow Line Bridge', color: '#eab308', strokeWidth: 3, path: 'M 210,250 L 150,300 L 130,340' }
    ]
  },
  {
    id: 'madrid',
    city: 'Madrid',
    country: 'Spain',
    systemName: 'Metro de Madrid',
    continent: 'Europe',
    topologicalFact: 'With almost 300 km of track, Madrid features the giant Circular Line 6 (gray) enveloping central Madrid, plus the detached southern Metrosur orbital super-loop (Line 12).',
    distractors: ['Barcelona', 'Lisbon', 'Valencia'],
    viewBox: '0 0 400 400',
    lines: [
      // Line 6 Circular (Gray Ring)
      { name: 'Línea 6 Circular', color: '#64748b', strokeWidth: 4.5, path: 'M 200,110 C 270,110 290,170 280,240 C 270,290 190,300 130,280 C 100,240 110,160 140,120 Z' },
      // Line 1 (Light Blue North-South)
      { name: 'Línea 1', color: '#0ea5e9', strokeWidth: 3.5, path: 'M 210,40 L 210,140 L 190,200 L 230,270 L 270,340' },
      // Line 10 (Navy Blue Long Trunk)
      { name: 'Línea 10', color: '#1e40af', strokeWidth: 3.5, path: 'M 230,40 L 220,130 L 170,200 L 150,280 L 120,350' },
      // Line 5 (Green diagonal)
      { name: 'Línea 5', color: '#16a34a', strokeWidth: 3, path: 'M 100,310 L 150,240 L 180,190 L 260,150 L 320,120' },
      // Line 8 (Pink Airport Express)
      { name: 'Línea 8 (Aeropuerto)', color: '#ec4899', strokeWidth: 3, path: 'M 220,120 L 270,100 L 340,70' }
    ]
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    systemName: 'Singapore MRT (Mass Rapid Transit)',
    continent: 'Asia',
    topologicalFact: 'Completely driverless and automated, anchored by the Circle Line (yellow orbit) and the North-South red artery bending around the central nature catchment.',
    distractors: ['Kuala Lumpur', 'Hong Kong', 'Bangkok'],
    viewBox: '0 0 400 400',
    lines: [
      // Circle Line (Yellow Loop)
      { name: 'Circle Line (CCL)', color: '#eab308', strokeWidth: 4, path: 'M 200,160 C 270,160 280,220 270,270 C 250,310 160,320 130,290 C 110,250 120,180 170,165 Z' },
      // North-South Line (Red loop around reservoir)
      { name: 'North-South Line (NSL)', color: '#dc2626', strokeWidth: 3.5, path: 'M 180,330 L 190,270 L 190,210 L 170,110 L 120,120 L 90,190 L 120,240' },
      // East-West Line (Green island spine to Changi)
      { name: 'East-West Line (EWL)', color: '#16a34a', strokeWidth: 3.5, path: 'M 50,250 L 120,250 L 180,310 L 260,280 L 340,240 L 370,240' },
      // Downtown Line (Blue Loop-and-Spur)
      { name: 'Downtown Line (DTL)', color: '#2563eb', strokeWidth: 3, path: 'M 120,160 L 160,220 L 210,290 L 240,260 L 270,210 L 340,270' },
      // Thomson-East Coast Line (Brown)
      { name: 'Thomson-East Coast Line (TEL)', color: '#854d0e', strokeWidth: 3, path: 'M 170,80 L 180,180 L 180,280 L 250,330 L 320,320' }
    ]
  },
  {
    id: 'mexicocity',
    city: 'Mexico City',
    country: 'Mexico',
    systemName: 'Metro de la Ciudad de México',
    continent: 'North America',
    topologicalFact: 'Built on the ancient soft lakebed of Lake Texcoco, famous for giving every single station an iconic Aztec/pictographic glyph so non-literate passengers could navigate with ease.',
    distractors: ['Guadalajara', 'Bogotá', 'Santiago'],
    viewBox: '0 0 400 400',
    lines: [
      // Line 1 (Pink East-West spine)
      { name: 'Línea 1 (Rosa)', color: '#ec4899', strokeWidth: 4, path: 'M 80,250 L 150,210 L 220,210 L 320,190' },
      // Line 2 (Blue inverted U / center axis)
      { name: 'Línea 2 (Azul)', color: '#2563eb', strokeWidth: 3.5, path: 'M 60,120 L 140,120 L 180,160 L 180,270 L 180,350' },
      // Line 3 (Olive Green North-South backbone)
      { name: 'Línea 3 (Verde Olivo)', color: '#65a30d', strokeWidth: 3.5, path: 'M 190,60 L 190,180 L 160,250 L 130,340' },
      // Line 7 (Orange West vertical wall)
      { name: 'Línea 7 (Naranja)', color: '#ea580c', strokeWidth: 3, path: 'M 90,80 L 90,200 L 90,320' },
      // Line 9 (Brown South parallel)
      { name: 'Línea 9 (Café)', color: '#78350f', strokeWidth: 3, path: 'M 90,270 L 180,260 L 250,250 L 330,240' },
      // Line 12 (Golden South Radial)
      { name: 'Línea 12 (Dorada)', color: '#ca8a04', strokeWidth: 3, path: 'M 110,330 L 180,310 L 260,330 L 340,360' }
    ]
  },
  {
    id: 'sanfrancisco',
    city: 'San Francisco (BART)',
    country: 'United States',
    systemName: 'Bay Area Rapid Transit (BART)',
    continent: 'North America',
    topologicalFact: 'Lines funnel through the underwater Transbay Tube beneath San Francisco Bay before fanning out into four East Bay radial corridors reaching Oakland, Berkeley, and San Jose.',
    distractors: ['Seattle', 'Los Angeles', 'San Diego'],
    viewBox: '0 0 400 400',
    lines: [
      // Transbay Tube & SF Trunk (Multi-line convergence)
      { name: 'SF Peninsula Trunk', color: '#e2e8f0', strokeWidth: 5, path: 'M 80,330 L 110,260 L 150,200 L 200,160' },
      // Yellow Line to Antioch
      { name: 'Yellow (Antioch)', color: '#eab308', strokeWidth: 3, path: 'M 200,160 L 230,140 L 260,90 L 330,50' },
      // Red Line to Richmond
      { name: 'Red (Richmond)', color: '#ef4444', strokeWidth: 3, path: 'M 200,160 L 230,130 L 240,60' },
      // Blue Line to Dublin/Pleasanton
      { name: 'Blue (Dublin/Pleasanton)', color: '#3b82f6', strokeWidth: 3, path: 'M 200,160 L 240,190 L 290,220 L 360,220' },
      // Green/Orange to Berryessa / San Jose
      { name: 'Green/Orange (Berryessa)', color: '#22c55e', strokeWidth: 3.5, path: 'M 200,160 L 240,200 L 270,280 L 310,350' }
    ]
  }
];

export function getDailyMetroQuestions(count = 5) {
  // Deterministic daily shuffle or pick
  const shuffled = [...SUBWAY_DATASET].sort((a, b) => a.id.localeCompare(b.id));
  return shuffled.slice(0, count).map(network => {
    // Generate 4 multiple-choice options (1 correct, 3 distractors)
    const options = [network.city, ...network.distractors].sort(() => 0.5 - Math.random());
    return {
      ...network,
      options,
      correctAnswer: network.city
    };
  });
}

export function getRandomMetroQuestion() {
  const item = SUBWAY_DATASET[Math.floor(Math.random() * SUBWAY_DATASET.length)];
  const options = [item.city, ...item.distractors].sort(() => 0.5 - Math.random());
  return {
    ...item,
    options,
    correctAnswer: item.city
  };
}
