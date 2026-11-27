// R.E.L.I.C. — Reverse-Extraction of Looted Intertemporal Contraband
// Curated Master Collection: Baked High-Resolution Treasures from The Met Open Access (CC0) and Wikimedia Archives.
// Zero in-game latency, 100% offline & edge-cached resilient.

import { createPRNG } from '../../../shared/storage/playerStorage.js';

export const RELIC_ARTIFACTS = [
  {
    id: 'tutankhamun-mask',
    name: "Tutankhamun's Gold Funerary Mask",
    culture: 'Ancient Egyptian (18th Dynasty)',
    region: 'Valley of the Kings, Thebes (Luxor), Egypt',
    exactYear: -1323,
    coordinates: { lat: 25.74, lng: 32.60 },
    material: 'Repoussé Gold, Lapis Lazuli, Turquoise, Obsidian',
    imageUrl: '/images/relic/tutankhamun-mask.jpg',
    historicalProvenanceFact: 'Crafted from two beaten sheets of high-carat gold and inlaid with colored glass and semiprecious stones. Discovered intact by Howard Carter in tomb KV62.',
    vaneVaultLog: 'VAULT ENTRY #001: Extracted from KV62 seconds before Carter breached the plaster seal in 1922. The luminescence of 24-karat gold under stasis vacuum remains unmatched.',
  },
  {
    id: 'sword-of-tiberius',
    name: 'Gladius of Tiberius & Scabbard',
    culture: 'Imperial Roman',
    region: 'Mainz (Mogontiacum), Roman Germania (Germany)',
    exactYear: 15,
    coordinates: { lat: 49.99, lng: 8.27 },
    material: 'Tinned & Gilded Bronze, Forged Iron, Silver Foil',
    imageUrl: '/images/relic/sword-of-tiberius.jpg',
    historicalProvenanceFact: 'An ornate legionary gladius Mainz-type presenting Tiberius receiving Germanicus after his Rhine campaign. Recovered intact from the Rhine gravel.',
    vaneVaultLog: 'VAULT ENTRY #002: Intercepted along the Rhine riverbed before 19th-century dredging crews discovered it. The tinned bronze relief of Mars Ultor is pristine.',
  },
  {
    id: 'pakal-jade-mask',
    name: 'Jadeite Death Mask of Pakal the Great',
    culture: 'Classic Maya',
    region: 'Temple of the Inscriptions, Palenque, Chiapas, Mexico',
    exactYear: 683,
    coordinates: { lat: 17.48, lng: -92.04 },
    material: 'Carved Imperial Jadeite, Spondylus Shell, Mother-of-Pearl',
    imageUrl: '/images/relic/pakal-jade-mask.jpg',
    historicalProvenanceFact: 'Composed of over 340 interlocking polished jade tesserae with obsidian irises. Interred with ruler K\'inich Janaab\' Pakal beneath his funerary pyramid.',
    vaneVaultLog: 'VAULT ENTRY #003: Sub-crypt salvage beam activated at 2:00 AM local time inside the Temple of Inscriptions. Each mosaic tessera resonates at 14.8 MHz.',
  },
  {
    id: 'nanban-samurai-armor',
    name: 'Nanban Gusoku Samurai Armor',
    culture: 'Momoyama / Early Edo Period Japan',
    region: 'Edo (Tokyo), Japan',
    exactYear: 1600,
    coordinates: { lat: 35.67, lng: 139.65 },
    material: 'Forged Steel Cuirass, Lacquer, Gilded Copper, Silk Cord',
    imageUrl: '/images/relic/nanban-samurai-armor.jpg',
    historicalProvenanceFact: 'A hybrid "Southern Barbarian" (Nanban) armor adapting imported European peascod breastplates for samurai warlords around the pivotal Battle of Sekigahara.',
    vaneVaultLog: 'VAULT ENTRY #004: Secured from a daimyo stronghold outside Kyoto just prior to the Tokugawa siege. The bullet-test indentation on the breastplate is authentic proof of battle.',
  },
  {
    id: 'battersea-shield',
    name: 'Celtic Battersea Bronze Shield',
    culture: 'Celtic / La Tène Tradition',
    region: 'River Thames, London, Britannia (United Kingdom)',
    exactYear: -350,
    coordinates: { lat: 51.48, lng: -0.14 },
    material: 'Sheet Bronze, Opaque Red Glass Champlevé Enamel',
    imageUrl: '/images/relic/battersea-shield.jpg',
    historicalProvenanceFact: 'Constructed from four sheet bronze plates riveted together with 27 red glass enamel bosses. Offered ritually into the River Thames as a votive sacrifice.',
    vaneVaultLog: 'VAULT ENTRY #005: Recovered from the muddy tidal bed of the Thames before 1857 bridge excavations. The red opaque glass inlay glows when irradiated with tachyons.',
  },
  {
    id: 'benin-bronze-head',
    name: 'Benin Commemorative Head of an Oba',
    culture: 'Edo Peoples, Kingdom of Benin',
    region: 'Benin City, Edo State, Nigeria',
    exactYear: 1550,
    coordinates: { lat: 6.33, lng: 5.62 },
    material: 'Lost-Wax Cast Copper Alloy (Brass/Bronze), Coral Bead Crown',
    imageUrl: '/images/relic/benin-bronze-head.jpg',
    historicalProvenanceFact: 'Sculpted by royal brass-casters (Igun Eronmwon) to honor a deceased Oba and placed on ancestral altars in the palace of Benin City.',
    vaneVaultLog: 'VAULT ENTRY #006: Salvaged from the royal court of the Oba before the 1897 British punitive expedition looted the palace compound.',
  },
  {
    id: 'inca-gold-tumi',
    name: 'Inca Royal Ceremonial Tumi & Quipu',
    culture: 'Inca Empire (Tawantinsuyu)',
    region: 'Cusco, Andean Highlands, Peru',
    exactYear: 1470,
    coordinates: { lat: -13.53, lng: -71.96 },
    material: 'Hammered 24K Sheet Gold, Turquoise Cabochons, Silver',
    imageUrl: '/images/relic/inca-gold-tumi.jpg',
    historicalProvenanceFact: 'A crescent-bladed sacrificial axe depicting Naymlap or an Inca solar deity, wielded by high priests during the winter solstice Inti Raymi ceremonies.',
    vaneVaultLog: 'VAULT ENTRY #007: Intercepted high on the slopes above Coricancha in Cusco. The gold matrix has absorbed centuries of high-altitude solar radiation.',
  },
  {
    id: 'terracotta-cavalry-horse',
    name: 'Qin Cavalry Warhorse & Groom',
    culture: 'Qin Dynasty China',
    region: 'Lintong District, Xi\'an, Shaanxi, China',
    exactYear: -210,
    coordinates: { lat: 34.38, lng: 109.27 },
    material: 'High-Fired Terracotta, Traces of Mineral Pigment & Lacquer',
    imageUrl: '/images/relic/terracotta-cavalry-horse.jpg',
    historicalProvenanceFact: 'One of several thousand life-sized ceramic warriors and cavalry steeds guarding the underground necropolis of Qin Shi Huang, the first Emperor of unified China.',
    vaneVaultLog: 'VAULT ENTRY #008: Extracted from Pit 2 at Xi\'an in 1973 before local well-diggers broke through the subterranean brick floor. The original purple pigment is still unfaded.',
  },
  {
    id: 'scythian-gold-pectoral',
    name: 'Royal Scythian Gold Pectoral',
    culture: 'Scythian Steppe Nomads',
    region: 'Tovsta Mohyla Barrow, Dnipro Region, Ukraine',
    exactYear: -390,
    coordinates: { lat: 47.50, lng: 35.00 },
    material: 'Solid Cast, Chased & Granulated 24K Gold',
    imageUrl: '/images/relic/scythian-gold-pectoral.jpg',
    historicalProvenanceFact: 'A masterpiece of Graeco-Scythian goldsmithing containing over 48 individual cast figurines of pastoral nomads, pegasi, and mythological beasts. Unearthed during barrow excavations.',
    vaneVaultLog: 'VAULT ENTRY #009: Plucked from the central burial mound at Tovsta Mohyla. The micro-sculpted golden grasshoppers on the outer rim require a microscope to appreciate.',
  },
  {
    id: 'minoan-bull-rhyton',
    name: 'Minoan Bull\'s-Head Rhyton',
    culture: 'Minoan Civilization (Neopalatial Period)',
    region: 'Palace of Knossos, Heraklion, Crete, Greece',
    exactYear: -1500,
    coordinates: { lat: 35.29, lng: 25.16 },
    material: 'Carved Black Steatite, Red Jasper, Mother-of-Pearl, Gilded Horns',
    imageUrl: '/images/relic/minoan-bull-rhyton.jpg',
    historicalProvenanceFact: 'A sacred libation vessel carved from a single block of steatite with rock-crystal and jasper eyes, used to pour wine or sacrificial blood in palatial rituals.',
    vaneVaultLog: 'VAULT ENTRY #010: Extracted from the Little Palace of Knossos. The crystal pupil of the bull\'s left eye refracts light in concentric Fibonacci spirals.',
  },
  {
    id: 'rapa-nui-kavakava',
    name: 'Rapa Nui Moai Kavakava',
    culture: 'Rapa Nui (Easter Island)',
    region: 'Hanga Roa, Rapa Nui (Easter Island, Chile)',
    exactYear: 1800,
    coordinates: { lat: -27.11, lng: -109.35 },
    material: 'Toromiro Hardwood, Marine Obsidian, Bone Eyes',
    imageUrl: '/images/relic/rapa-nui-kavakava.jpg',
    historicalProvenanceFact: 'An ancestral male figure depicting prominent ribs and spine, representing the spirits of deceased ancestors (aku aku) who protected family dwellings.',
    vaneVaultLog: 'VAULT ENTRY #011: Snatched from a lava cave cache on the southern coast of Rapa Nui. The extinct toromiro grain is denser than marine steel.',
  },
  {
    id: 'olmec-colossal-head',
    name: 'Olmec Colossal Head No. 1 (El Rey)',
    culture: 'Olmec Mother Culture of Mesoamerica',
    region: 'San Lorenzo Tenochtitlán, Veracruz, Mexico',
    exactYear: -900,
    coordinates: { lat: 17.75, lng: -94.76 },
    material: 'Volcanic Basalt Boulder, Polished Quartz Abrasives',
    imageUrl: '/images/relic/olmec-colossal-head.jpg',
    historicalProvenanceFact: 'Carved from a single multi-ton basalt boulder dragged over 60 km from the Tuxtlas mountains, portraying a divine sovereign wearing a protective ballplayer helmet.',
    vaneVaultLog: 'VAULT ENTRY #012: Tachyon tractor array required 92% reactor output to phase-shift a 24-ton basalt monolith into orbital stasis. Worth every megawatt.',
  },
  {
    id: 'rosetta-stone',
    name: 'The Rosetta Stone Decree',
    culture: 'Ptolemaic Kingdom of Egypt',
    region: 'Rashid (Rosetta) / Memphis, Nile Delta, Egypt',
    exactYear: -196,
    coordinates: { lat: 31.40, lng: 30.42 },
    material: 'Granodiorite Monolith, Chiseled Inscription',
    imageUrl: '/images/relic/rosetta-stone.jpg',
    historicalProvenanceFact: 'A trilingual decree issued at Memphis on behalf of King Ptolemy V in Ancient Egyptian Hieroglyphic, Demotic script, and Ancient Greek.',
    vaneVaultLog: 'VAULT ENTRY #013: Relocated from Fort Julien in 1799 moments before French engineer Pierre-François Bouchard spotted the black slab in the rubble.',
  },
  {
    id: 'sutton-hoo-helmet',
    name: 'Sutton Hoo Ceremonial Crested Helmet',
    culture: 'Anglo-Saxon (Kingdom of East Anglia)',
    region: 'Sutton Hoo Ship Burial, Woodbridge, Suffolk, England',
    exactYear: 625,
    coordinates: { lat: 52.09, lng: 1.34 },
    material: 'Tinned Bronze Foil, Forged Iron, Cloisonné Garnets, Gilt Bronze',
    imageUrl: '/images/relic/sutton-hoo-helmet.jpg',
    historicalProvenanceFact: 'The centerpiece of an elite Anglo-Saxon ship burial, possibly King Rædwald of East Anglia, featuring anthropomorphic dragon and bird motifs across the face mask.',
    vaneVaultLog: 'VAULT ENTRY #014: Retrieved from Mound 1 at Sutton Hoo in 1939 before Basil Brown began excavation. The garnet dragon eyebrows reflect ambient light like neon embers.',
  },
  {
    id: 'ishtar-gate-dragon',
    name: 'Ishtar Gate Mušḫuššu Dragon Relief',
    culture: 'Neo-Babylonian Empire',
    region: 'Processional Way, Babylon (Al-Hillah, Iraq)',
    exactYear: -575,
    coordinates: { lat: 32.54, lng: 44.42 },
    material: 'Cobalt Blue Glazed Molded Mudbrick, Lapis Lazuli Pigment',
    imageUrl: '/images/relic/ishtar-gate-dragon.jpg',
    historicalProvenanceFact: 'Built by King Nebuchadnezzar II as the eighth inner gate to Babylon, adorned with rows of the horned serpent-dragon (mušḫuššu), sacred beast of Marduk.',
    vaneVaultLog: 'VAULT ENTRY #015: Beam pulled directly from the Babylonian Processional Way before Koldewey began European export. The cobalt glaze retains zero atmospheric oxidation.',
  },
  {
    id: 'golden-rhino-mapungubwe',
    name: 'Golden Rhinoceros of Mapungubwe',
    culture: 'Kingdom of Mapungubwe',
    region: 'Mapungubwe Hill, Limpopo Valley, South Africa',
    exactYear: 1250,
    coordinates: { lat: -22.21, lng: 29.37 },
    material: 'Beaten Gold Foil Sheets, Gold Tacks, Carved Wooden Core',
    imageUrl: '/images/relic/golden-rhino-mapungubwe.jpg',
    historicalProvenanceFact: 'Crafted by beating gold into thin sheets fastened with miniature gold tacks over a wooden core. Excavated from royal grave #10 at Mapungubwe Hill.',
    vaneVaultLog: 'VAULT ENTRY #016: Snatched from the elite burial terrace on Mapungubwe Hill overlooking the Limpopo. The hammered foil is barely 0.2mm thick.',
  },
  {
    id: 'gandhara-seated-buddha',
    name: 'Seated Teaching Buddha of Gandhara',
    culture: 'Greco-Buddhist Art of Gandhara (Kushan Empire)',
    region: 'Peshawar Valley, Gandhara (Khyber Pakhtunkhwa, Pakistan)',
    exactYear: 200,
    coordinates: { lat: 34.01, lng: 71.52 },
    material: 'Carved Gray Schist, Gold Leaf Residue',
    imageUrl: '/images/relic/gandhara-seated-buddha.jpg',
    historicalProvenanceFact: 'A sublime synthesis of Hellenistic drapery folds and Indian spiritual iconography, depicting Shakyamuni Buddha performing the Dharmachakra mudra on the Silk Road.',
    vaneVaultLog: 'VAULT ENTRY #017: Extracted from a monastery stupa along the Swat Valley. The crystalline flecks within the schist stone produce subtle optical interference.',
  },
  {
    id: 'aztec-sun-stone',
    name: 'Aztec Sun Stone (Piedra del Sol)',
    culture: 'Aztec / Mexica Empire',
    region: 'Templo Mayor, Tenochtitlan (Mexico City, Mexico)',
    exactYear: 1500,
    coordinates: { lat: 19.43, lng: -99.13 },
    material: 'Carved Olivine-Basalt Monolith, Red & Ocher Pigments',
    imageUrl: '/images/relic/aztec-sun-stone.jpg',
    historicalProvenanceFact: 'A monumental 24-ton circular basalt monolith commissioned by Moctezuma II or Axayacatl, embodying the Aztec cosmogony of the Four Suns and solar deity Tonatiuh.',
    vaneVaultLog: 'VAULT ENTRY #018: Teleported during the sack of Tenochtitlan in August 1521 before Spanish conquerors could bury it beneath the Zócalo cathedral foundations.',
  },
  {
    id: 'mask-of-agamemnon',
    name: 'Mycenaean Gold "Mask of Agamemnon"',
    culture: 'Late Helladic Mycenaean Greece',
    region: 'Grave Circle A, Mycenae, Argolis, Greece',
    exactYear: -1550,
    coordinates: { lat: 37.73, lng: 22.75 },
    material: 'Chased Gold Sheet, Repoussé Detailing',
    imageUrl: '/images/relic/mask-of-agamemnon.jpg',
    historicalProvenanceFact: 'Unearthed by Heinrich Schliemann over the face of a deceased Mycenaean warlord during excavations at Mycenae.',
    vaneVaultLog: 'VAULT ENTRY #019: Beam-harvested from Shaft Grave V at Mycenae right through Schliemann’s spade line. The mustache and distinct ear profiles are entirely genuine.',
  },
  {
    id: 'maori-hei-tiki',
    name: 'Maori Hei-Tiki Ancestral Pendant',
    culture: 'Māori Peoples (Te Ao Māori)',
    region: 'Rotorua, Bay of Plenty, North Island, Aotearoa (New Zealand)',
    exactYear: 1650,
    coordinates: { lat: -38.68, lng: 176.07 },
    material: 'Carved Pounamu (Nephrite Greenstone), Haliotis (Pāua) Shell Inlay',
    imageUrl: '/images/relic/maori-hei-tiki.jpg',
    historicalProvenanceFact: 'Carved with sandstone friction and water from sacred New Zealand greenstone. Hei-Tiki are imbued with the ancestral spiritual power (mana) of generations of chiefs.',
    vaneVaultLog: 'VAULT ENTRY #020: Acquired directly from a sacred whare on Lake Rotorua. The cold nephrite jade conducts thermal energy faster than synthetic diamond.',
  },
  {
    id: 'homeric-bronze-corinthian-helmet',
    name: 'Archaic Corinthian Bronze Helmet',
    culture: 'Archaic Greece',
    region: 'Olympia Sanctuary, Peloponnese, Greece',
    exactYear: -520,
    coordinates: { lat: 37.64, lng: 21.63 },
    material: 'Hammered Seamless Sheet Bronze, Inlaid Silver Eyebrows',
    imageUrl: '/images/relic/homeric-bronze-corinthian-helmet.jpg',
    historicalProvenanceFact: 'Forged from a single ingot of bronze into an anatomical protective dome with distinct almond eye-slits. Dedicated as a votive war offering at the Sanctuary of Zeus.',
    vaneVaultLog: 'VAULT ENTRY #021: Recovered from the sacred Altis precinct at Olympia. Forged without a single weld or seam; classical Greek metallurgy at its zenith.',
  },
  {
    id: 'byzantine-justinian-mosaic',
    name: 'Ravenna Imperial Glass & Gold Mosaic',
    culture: 'Byzantine Empire (Reign of Justinian I)',
    region: 'Basilica of San Vitale, Ravenna, Italy',
    exactYear: 547,
    coordinates: { lat: 44.42, lng: 12.20 },
    material: 'Gold-Leaf Smalti Glass Tesserae, Crushed Marble, Terracotta',
    imageUrl: '/images/relic/byzantine-justinian-mosaic.jpg',
    historicalProvenanceFact: 'Commissioned under Bishop Maximian to portray Emperor Justinian I and his court holding the communion paten, inaugurating Byzantine dominance in northern Italy.',
    vaneVaultLog: 'VAULT ENTRY #022: Optical tesserae sample scanned from San Vitale before the 19th-century restoration. The 15-degree angled glass tesserae catch light dynamically.',
  },
  {
    id: 'korea-silla-gold-crown',
    name: 'Silla Kingdom Royal Gold Crown',
    culture: 'Silla Kingdom of Korea (Three Kingdoms Period)',
    region: 'Hwangnamdaechong Tomb, Gyeongju, South Korea',
    exactYear: 500,
    coordinates: { lat: 35.83, lng: 129.21 },
    material: 'Cut Sheet Gold, Gogok Comma-Shaped Jade Beads, Wire Spangles',
    imageUrl: '/images/relic/korea-silla-gold-crown.jpg',
    historicalProvenanceFact: 'Found in the royal tombs of Gyeongju, featuring stylized tree and deer antler uprights signifying shamanic ascent to the heavens, hung with fluttering gold paillettes.',
    vaneVaultLog: 'VAULT ENTRY #023: Sub-ground resonance extraction from Gyeongju North Mound. The comma-shaped jade pendants tremble whenever the vault station shifts orbital attitude.',
  },
  {
    id: 'chavin-lanzon-stela',
    name: 'Chavín Monolithic Lanzón Stela',
    culture: 'Chavín Culture of the Central Andes',
    region: 'Chavín de Huántar, Ancash Region, Peru',
    exactYear: -800,
    coordinates: { lat: -9.59, lng: -77.18 },
    material: 'Carved White Granite Monolith, Fanged Deity Relief',
    imageUrl: '/images/relic/chavin-lanzon-stela.jpg',
    historicalProvenanceFact: 'A 4.5-meter lance-shaped granite monolith depicting a snarling fanged anthropomorphic deity standing in the dark labyrinthine heart of the underground circular plaza.',
    vaneVaultLog: 'VAULT ENTRY #024: Phase-transferred from the subterranean cruciform chamber at Chavín de Huántar. The underground water acoustic channels still hum inside its stone matrix.',
  },
  {
    id: 'persian-cyrus-cylinder',
    name: 'The Cyrus Cylinder Charter',
    culture: 'Achaemenid Persian Empire',
    region: 'Temple of Marduk, Babylon (Al-Hillah, Iraq)',
    exactYear: -539,
    coordinates: { lat: 32.54, lng: 44.42 },
    material: 'Baked Clay Barrel Cylinder, Akkadian Cuneiform Script',
    imageUrl: '/images/relic/persian-cyrus-cylinder.jpg',
    historicalProvenanceFact: 'Deposited as a royal foundation deposit in Babylon after Cyrus the Great conquered the city, freeing exiled peoples and restoring regional sanctuaries.',
    vaneVaultLog: 'VAULT ENTRY #025: Snatched from the foundation trench of the Esagila temple. Known throughout the quadrant as humanity’s earliest declaration of rights.',
  },
];

export const ROUNDS_PER_GAME = 5;

/**
 * Cyclic Nonce-Block Partitioning for Zero-Duplicate Daily Challenges:
 * Guarantees zero intra-day duplicates, and zero inter-day repeats across
 * N / 5 consecutive calendar days.
 * 
 * @param {Array} allArtifacts - Full curated collection of relics
 * @param {number} dayIndex - Days elapsed since epoch
 * @returns {Array} 5 unique artifacts for the daily round
 */
export function getDailyDeck(allArtifacts = RELIC_ARTIFACTS, dayIndex = null) {
  if (dayIndex === null) {
    dayIndex = Math.floor(Date.now() / 86400000);
  }

  const N = allArtifacts.length;
  const cycleDays = Math.max(1, Math.floor(N / ROUNDS_PER_GAME));

  // 1. Cycle increments only after every relic in the pool has been played
  const cycleNumber = Math.floor(dayIndex / cycleDays);
  const dayInCycle = ((dayIndex % cycleDays) + cycleDays) % cycleDays;

  // 2. Deterministically permute the pool once per cycle using seeded PRNG
  const cyclePrng = createPRNG(421337 + cycleNumber * 101399);
  const cycleDeck = [...allArtifacts].sort(() => cyclePrng() - 0.5);

  // 3. Disjoint 5-relic window for today
  const start = dayInCycle * ROUNDS_PER_GAME;
  return cycleDeck.slice(start, start + ROUNDS_PER_GAME);
}

/**
 * Free Play / Blitz random deck generator
 */
export function getBlitzDeck(allArtifacts = RELIC_ARTIFACTS, seed = null) {
  const prng = seed ? createPRNG(seed) : Math.random;
  const shuffled = [...allArtifacts].sort(() => prng() - 0.5);
  return shuffled.slice(0, ROUNDS_PER_GAME);
}

/**
 * Dual-Axis Resonance Scoring Engine
 * Max 5,000 pts per round (2,500 ChronoScore + 2,500 GeoScore)
 * +1,000 pt Temporal Resonance Bonus if BOTH year and coordinates are within 5% error.
 */
export function calculateRelicScore({
  guessedYear,
  exactYear,
  distanceKm,
}) {
  const antiquity = Math.max(100, 2025 - exactYear);

  // 1. Year Score (0 - 2,500 pts)
  // Decay exponent k is scaled relative to the antiquity of the artifact
  let chronoScore = 0;
  let yearError = null;
  if (guessedYear !== null && guessedYear !== undefined && !Number.isNaN(guessedYear)) {
    yearError = Math.abs(guessedYear - exactYear);
    const k = 1 / Math.max(30, antiquity * 0.08);
    chronoScore = Math.max(0, Math.floor(2500 * Math.exp(-k * yearError)));
  }

  // 2. Geodesic Map Score (0 - 2,500 pts)
  // Distance decay from true cultural origin
  let geoScore = 0;
  if (distanceKm !== null && distanceKm !== undefined && !Number.isNaN(distanceKm)) {
    geoScore = Math.max(0, Math.floor(2500 * Math.exp(-distanceKm / 1800)));
  }

  // 3. Temporal Resonance Bonus (+1,000 pts)
  // Both Year and Map within 5% error threshold:
  // - Year error <= 5% of antiquity
  // - Distance <= 1,000 km (approx 5% of half Earth circumference 20,000 km)
  const isYearResonant = yearError !== null && yearError <= Math.max(25, antiquity * 0.05);
  const isGeoResonant = distanceKm !== null && distanceKm <= 1000;
  const hasResonanceBonus = isYearResonant && isGeoResonant;
  const resonanceBonusPts = hasResonanceBonus ? 1000 : 0;

  const totalRoundScore = Math.min(5000, chronoScore + geoScore + resonanceBonusPts);

  // Status rating for this round
  let emoji = '🟩';
  if (totalRoundScore < 2000) {
    emoji = '🟥';
  } else if (totalRoundScore < 3800) {
    emoji = '🟨';
  }

  return {
    chronoScore,
    geoScore,
    resonanceBonusPts,
    hasResonanceBonus,
    totalRoundScore,
    yearError,
    antiquity,
    distanceKm,
    emoji,
  };
}

/**
 * Format year display with BCE / CE
 */
export function formatYear(year) {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  return `${year} CE`;
}
