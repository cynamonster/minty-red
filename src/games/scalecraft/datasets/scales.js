// ScaleCraft Physical Scale Dataset
// 75+ rigorously curated physical entities spanning Architecture, Biology/Microscopic, Astronomy, and Nature.
// All values are in standard SI reference units:
// - length: meters (m)
// - mass: kilograms (kg)
// - speed: kilometers per hour (km/h)

export const SCALE_ENTITIES = [
  // ==========================================
  // LENGTH / HEIGHT / SPAN (meters)
  // ==========================================
  {
    id: 'dna-double-helix',
    name: 'DNA Double Helix Diameter',
    category: 'microscopic',
    metricType: 'length',
    value: 2e-9,
    displayValue: '2.0 nm',
    icon: '🧬',
    funFact: 'Roughly 2 million strands of DNA double helices could fit side-by-side across the head of a sewing pin.',
  },
  {
    id: 'sars-cov-2',
    name: 'SARS-CoV-2 Coronavirus',
    category: 'microscopic',
    metricType: 'length',
    value: 1.2e-7,
    displayValue: '120 nm',
    icon: '🦠',
    funFact: 'About 1,000 coronavirus particles lined up end-to-end equal the thickness of a single human hair.',
  },
  {
    id: 'red-blood-cell',
    name: 'Human Red Blood Cell',
    category: 'microscopic',
    metricType: 'length',
    value: 7.5e-6,
    displayValue: '7.5 µm',
    icon: '🩸',
    funFact: 'A human red blood cell is so flexible it can deform and squeeze through capillaries narrower than itself.',
  },
  {
    id: 'human-hair',
    name: 'Human Hair Width',
    category: 'microscopic',
    metricType: 'length',
    value: 8e-5,
    displayValue: '80 µm',
    icon: '💇',
    funFact: 'A single healthy human hair strand can support up to 100 grams of weight without snapping.',
  },
  {
    id: 'tardigrade',
    name: 'Tardigrade (Water Bear)',
    category: 'microscopic',
    metricType: 'length',
    value: 0.0005,
    displayValue: '0.5 mm',
    icon: '🔬',
    funFact: 'Tardigrades can survive outer space vacuum, scorching radiation, and dehydration for over 30 years.',
  },
  {
    id: 'flea-length',
    name: 'Cat Flea',
    category: 'biology',
    metricType: 'length',
    value: 0.0025,
    displayValue: '2.5 mm',
    icon: '🪲',
    funFact: 'Fleas can leap over 150 times their own body height—the human equivalent of clearing the Empire State Building.',
  },
  {
    id: 'honeybee-length',
    name: 'Worker Honeybee',
    category: 'biology',
    metricType: 'length',
    value: 0.015,
    displayValue: '15 mm',
    icon: '🐝',
    funFact: 'Flaps its wings 200 times per second, generating its characteristic buzz and electrostatic charge.',
  },
  {
    id: 'hummingbird-length',
    name: 'Bee Hummingbird',
    category: 'biology',
    metricType: 'length',
    value: 0.057,
    displayValue: '5.7 cm',
    icon: '🐦',
    funFact: 'The smallest living bird on Earth, native to Cuba and weighing less than a single US dime.',
  },
  {
    id: 'giant-african-snail',
    name: 'Giant African Land Snail',
    category: 'biology',
    metricType: 'length',
    value: 0.2,
    displayValue: '20 cm',
    icon: '🐌',
    funFact: 'Can live up to 10 years and its shell is strong enough to occasionally puncture car tires.',
  },
  {
    id: 'emperor-penguin',
    name: 'Emperor Penguin',
    category: 'biology',
    metricType: 'length',
    value: 1.15,
    displayValue: '1.15 m',
    icon: '🐧',
    funFact: 'The tallest living penguin species, huddling together to survive Antarctic blizzards of -60°C.',
  },
  {
    id: 'komodo-dragon',
    name: 'Komodo Dragon',
    category: 'nature',
    metricType: 'length',
    value: 3.0,
    displayValue: '3.0 m',
    icon: '🦎',
    funFact: 'The world’s heaviest and longest living lizard, equipped with serrated teeth and anticoagulant venom.',
  },
  {
    id: 'giraffe-height',
    name: 'Adult Giraffe',
    category: 'biology',
    metricType: 'length',
    value: 5.5,
    displayValue: '5.5 m',
    icon: '🦒',
    funFact: 'A giraffe’s neck spans 2 meters yet has only 7 vertebrae—the exact same number as a human neck.',
  },
  {
    id: 't-rex-length',
    name: 'Tyrannosaurus Rex Length',
    category: 'nature',
    metricType: 'length',
    value: 12.3,
    displayValue: '12.3 m',
    icon: '🦖',
    funFact: 'The king of apex predators had banana-sized serrated teeth measuring up to 30 cm including root length.',
  },
  {
    id: 'colossal-squid',
    name: 'Colossal Squid',
    category: 'nature',
    metricType: 'length',
    value: 14.0,
    displayValue: '14 m',
    icon: '🦑',
    funFact: 'Armed with rotating swiveling hooks on its tentacles and dinner-plate eyes 27 cm in diameter.',
  },
  {
    id: 'blue-whale-length',
    name: 'Blue Whale Length',
    category: 'biology',
    metricType: 'length',
    value: 30.0,
    displayValue: '30 m',
    icon: '🐋',
    funFact: 'Longer than a professional NBA basketball court; their massive tongue alone weighs as much as an elephant.',
  },
  {
    id: 'olympic-pool-length',
    name: 'Olympic Swimming Pool',
    category: 'architecture',
    metricType: 'length',
    value: 50.0,
    displayValue: '50 m',
    icon: '🏊',
    funFact: 'Standardized by World Aquatics to contain 2.5 million liters of water across 10 racing lanes.',
  },
  {
    id: 'boeing-747-wingspan',
    name: 'Boeing 747-400 Wingspan',
    category: 'architecture',
    metricType: 'length',
    value: 64.4,
    displayValue: '64.4 m',
    icon: '✈️',
    funFact: 'Its wingspan is nearly double the entire distance of the Wright Brothers’ historic first powered flight (36.5 m).',
  },
  {
    id: 'giant-sequoia-height',
    name: 'General Sherman Giant Sequoia',
    category: 'nature',
    metricType: 'length',
    value: 83.8,
    displayValue: '83.8 m',
    icon: '🌲',
    funFact: 'The largest living single-stem tree on Earth by volume, estimated to be between 2,200 and 2,700 years old.',
  },
  {
    id: 'statue-of-liberty',
    name: 'Statue of Liberty (Ground to Torch)',
    category: 'architecture',
    metricType: 'length',
    value: 93.0,
    displayValue: '93 m',
    icon: '🗽',
    funFact: 'The iconic green copper skin is surprisingly thin—just 2.4 mm, less than the thickness of two pennies stacked.',
  },
  {
    id: 'saturn-v-rocket',
    name: 'Saturn V Moon Rocket',
    category: 'architecture',
    metricType: 'length',
    value: 110.6,
    displayValue: '110.6 m',
    icon: '🚀',
    funFact: 'Taller than London’s Big Ben clock tower; burned 20 tons of liquid oxygen and kerosene per second during launch.',
  },
  {
    id: 'hyperion-tree',
    name: 'Hyperion Coast Redwood',
    category: 'nature',
    metricType: 'length',
    value: 115.9,
    displayValue: '115.9 m',
    icon: '🌲',
    funFact: 'The world’s tallest known living tree, standing deep in California redwood forests with its exact GPS kept secret.',
  },
  {
    id: 'great-pyramid-height',
    name: 'Great Pyramid of Giza (Original)',
    category: 'architecture',
    metricType: 'length',
    value: 146.6,
    displayValue: '146.6 m',
    icon: '🏛️',
    funFact: 'Remained the tallest man-made structure on Earth for over 3,800 years until Lincoln Cathedral in 1311 AD.',
  },
  {
    id: 'titanic-length',
    name: 'RMS Titanic Length',
    category: 'architecture',
    metricType: 'length',
    value: 269.1,
    displayValue: '269 m',
    icon: '🚢',
    funFact: 'Spanned 4 city blocks; only 3 of its 4 iconic funnels were functional—the 4th was added for majestic aesthetics.',
  },
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower (with Antenna)',
    category: 'architecture',
    metricType: 'length',
    value: 330.0,
    displayValue: '330 m',
    icon: '🗼',
    funFact: 'Due to thermal expansion of puddle iron, the tower grows up to 15 cm taller during scorching summer heatwaves.',
  },
  {
    id: 'empire-state-building',
    name: 'Empire State Building (Roof)',
    category: 'architecture',
    metricType: 'length',
    value: 381.0,
    displayValue: '381 m',
    icon: '🏙️',
    funFact: 'Constructed at an astonishing pace of 4.5 floors per week during the height of the Great Depression.',
  },
  {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    category: 'architecture',
    metricType: 'length',
    value: 828.0,
    displayValue: '828 m',
    icon: '🏙️',
    funFact: 'The world’s tallest skyscraper; because of its height, sunset can be watched twice: from ground, then from top.',
  },
  {
    id: 'golden-gate-length',
    name: 'Golden Gate Bridge Total Length',
    category: 'architecture',
    metricType: 'length',
    value: 2737.0,
    displayValue: '2.74 km',
    icon: '🌉',
    funFact: 'Its two main suspension cables contain 129,000 kilometers of steel wire—enough to wrap around the Earth 3 times.',
  },
  {
    id: 'everest-elevation',
    name: 'Mount Everest Elevation',
    category: 'nature',
    metricType: 'length',
    value: 8848.86,
    displayValue: '8,849 m',
    icon: '🏔️',
    funFact: 'Grows about 4 millimeters higher each year as tectonic plates relentlessly push India into the Eurasian continent.',
  },
  {
    id: 'mariana-trench-depth',
    name: 'Mariana Trench (Challenger Deep)',
    category: 'nature',
    metricType: 'length',
    value: 10994.0,
    displayValue: '10,994 m',
    icon: '🌊',
    funFact: 'If Mount Everest were placed in the trench, its peak would still be submerged under more than 2 kilometers of ocean.',
  },
  {
    id: 'olympus-mons-height',
    name: 'Olympus Mons Volcano (Mars)',
    category: 'astronomy',
    metricType: 'length',
    value: 21900.0,
    displayValue: '21.9 km',
    icon: '🪐',
    funFact: 'The largest shield volcano in the Solar System, standing nearly 2.5 times the elevation of Mount Everest.',
  },
  {
    id: 'lhc-circumference',
    name: 'Large Hadron Collider Ring',
    category: 'architecture',
    metricType: 'length',
    value: 26659.0,
    displayValue: '26.7 km',
    icon: '⚛️',
    funFact: 'A circular subterranean particle collider beneath Switzerland and France, cooled to -271.3°C—colder than deep space.',
  },
  {
    id: 'panama-canal-length',
    name: 'Panama Canal Waterway',
    category: 'architecture',
    metricType: 'length',
    value: 82000.0,
    displayValue: '82 km',
    icon: '🚢',
    funFact: 'Cuts across the Isthmus of Panama, saving merchant vessels an 8,000 nautical mile detour around Cape Horn.',
  },
  {
    id: 'moon-diameter',
    name: 'The Moon’s Diameter',
    category: 'astronomy',
    metricType: 'length',
    value: 3474800.0,
    displayValue: '3,475 km',
    icon: '🌕',
    funFact: 'Roughly the driving distance between New York City and Las Vegas across the continental United States.',
  },
  {
    id: 'mars-diameter',
    name: 'Mars Equatorial Diameter',
    category: 'astronomy',
    metricType: 'length',
    value: 6779000.0,
    displayValue: '6,779 km',
    icon: '🪐',
    funFact: 'Mars is just over half of Earth’s diameter, but because it has no oceans, its dry land area equals Earth’s continents.',
  },
  {
    id: 'earth-diameter',
    name: 'Earth Equatorial Diameter',
    category: 'astronomy',
    metricType: 'length',
    value: 12742000.0,
    displayValue: '12,742 km',
    icon: '🌍',
    funFact: 'Because of planetary centrifugal spin, Earth bulges outward at the equator by 43 km compared to its pole-to-pole axis.',
  },
  {
    id: 'jupiter-diameter',
    name: 'Jupiter Equatorial Diameter',
    category: 'astronomy',
    metricType: 'length',
    value: 139820000.0,
    displayValue: '139,820 km',
    icon: '🪐',
    funFact: 'Eleven Earths could be lined up side-by-side across Jupiter’s equator; its Great Red Spot could swallow Earth whole.',
  },
  {
    id: 'sun-diameter',
    name: 'The Sun’s Diameter',
    category: 'astronomy',
    metricType: 'length',
    value: 1392700000.0,
    displayValue: '1.39M km',
    icon: '☀️',
    funFact: 'About 109 Earths could line up across the face of the Sun; its inner volume could pack in 1.3 million planet Earths.',
  },

  // ==========================================
  // MASS / WEIGHT (kilograms)
  // ==========================================
  {
    id: 'raindrop-mass',
    name: 'Typical Raindrop',
    category: 'nature',
    metricType: 'mass',
    value: 0.000034,
    displayValue: '34 mg',
    icon: '💧',
    funFact: 'Falls through cloud moisture at terminal speeds around 9 m/s before surface tension causes it to shatter.',
  },
  {
    id: 'honeybee-mass',
    name: 'Worker Honeybee',
    category: 'biology',
    metricType: 'mass',
    value: 0.00011,
    displayValue: '110 mg',
    icon: '🐝',
    funFact: 'Can transport up to half its own body weight in floral pollen and nectar during returning forage flights.',
  },
  {
    id: 'penny-mass',
    name: 'US One-Cent Coin',
    category: 'architecture',
    metricType: 'mass',
    value: 0.0025,
    displayValue: '2.5 g',
    icon: '🪙',
    funFact: 'Since 1982, pennies are actually 97.5% zinc with a paper-thin exterior copper plating to save metal costs.',
  },
  {
    id: 'smartphone-mass',
    name: 'Flagship Smartphone',
    category: 'architecture',
    metricType: 'mass',
    value: 0.187,
    displayValue: '187 g',
    icon: '📱',
    funFact: 'Contains more than 30 distinct chemical elements including trace amounts of real gold, silver, and rare neodymium.',
  },
  {
    id: 'cat-mass',
    name: 'Domestic House Cat',
    category: 'biology',
    metricType: 'mass',
    value: 4.5,
    displayValue: '4.5 kg',
    icon: '🐈',
    funFact: 'Possesses a flexible spine with no collarbone, enabling their famous mid-air righting reflex to land on their paws.',
  },
  {
    id: 'adult-human-mass',
    name: 'Average Adult Human',
    category: 'biology',
    metricType: 'mass',
    value: 70.0,
    displayValue: '70 kg',
    icon: '🧍',
    funFact: 'Composed of roughly 60% water, with enough iron dissolved in blood hemoglobin to forge a 7 cm nail.',
  },
  {
    id: 'giant-panda-mass',
    name: 'Giant Panda',
    category: 'nature',
    metricType: 'mass',
    value: 115.0,
    displayValue: '115 kg',
    icon: '🐼',
    funFact: 'Must munch on fibrous bamboo for up to 14 hours a day because their carnivore digestive tract absorbs only 17% of it.',
  },
  {
    id: 'grizzly-bear-mass',
    name: 'Male Grizzly Bear',
    category: 'nature',
    metricType: 'mass',
    value: 360.0,
    displayValue: '360 kg',
    icon: '🐻',
    funFact: 'Has a jaw bite force of 1,160 psi—strong enough to effortlessly shatter a cast bowling ball.',
  },
  {
    id: 'angus-bull-mass',
    name: 'Aberdeen Angus Bull',
    category: 'biology',
    metricType: 'mass',
    value: 950.0,
    displayValue: '950 kg',
    icon: '🐂',
    funFact: 'A prime beef bull weighs virtually the same as an entire subcompact passenger hatchback car.',
  },
  {
    id: 'hippopotamus-mass',
    name: 'Adult Hippopotamus',
    category: 'nature',
    metricType: 'mass',
    value: 1500.0,
    displayValue: '1.5 metric tons',
    icon: '🦛',
    funFact: 'Despite weighing 1.5 tons, hippos can gallop at up to 30 km/h on land, easily outrunning human sprinters.',
  },
  {
    id: 'tesla-model-3-mass',
    name: 'Tesla Model 3 Long Range',
    category: 'architecture',
    metricType: 'mass',
    value: 1847.0,
    displayValue: '1.85 metric tons',
    icon: '🚗',
    funFact: 'Its heavy 480 kg floor-mounted battery pack gives it an ultra-low center of gravity, preventing rollover crashes.',
  },
  {
    id: 'african-elephant-mass',
    name: 'African Bush Elephant',
    category: 'biology',
    metricType: 'mass',
    value: 6000.0,
    displayValue: '6.0 metric tons',
    icon: '🐘',
    funFact: 'The largest living land mammal; its dexterous trunk contains over 40,000 individual muscle fascicles.',
  },
  {
    id: 't-rex-mass',
    name: 'Tyrannosaurus Rex',
    category: 'nature',
    metricType: 'mass',
    value: 8400.0,
    displayValue: '8.4 metric tons',
    icon: '🦖',
    funFact: 'Heavier than an American yellow school bus, relying on a muscular counterbalance tail to pivot while hunting.',
  },
  {
    id: 'blue-whale-mass',
    name: 'Adult Blue Whale',
    category: 'biology',
    metricType: 'mass',
    value: 150000.0,
    displayValue: '150 metric tons',
    icon: '🐋',
    funFact: 'The heaviest animal ever discovered in Earth’s history—far heavier than the largest sauropod dinosaur.',
  },
  {
    id: 'boeing-747-mass',
    name: 'Boeing 747 Max Takeoff Weight',
    category: 'architecture',
    metricType: 'mass',
    value: 396890.0,
    displayValue: '397 metric tons',
    icon: '✈️',
    funFact: 'Takes off carrying up to 216,000 liters of jet fuel stored primarily inside its gargantuan wings.',
  },
  {
    id: 'iss-mass',
    name: 'International Space Station',
    category: 'architecture',
    metricType: 'mass',
    value: 450000.0,
    displayValue: '450 metric tons',
    icon: '🛰️',
    funFact: 'Assembled in orbit across dozens of rocket flights; provides habitable volume equivalent to a six-bedroom house.',
  },
  {
    id: 'eiffel-metal-mass',
    name: 'Eiffel Tower Metal Structure',
    category: 'architecture',
    metricType: 'mass',
    value: 7300000.0,
    displayValue: '7,300 metric tons',
    icon: '🗼',
    funFact: 'If all its puddle iron were melted down into a cylinder matching its square base, it would stand only 6 cm high!',
  },
  {
    id: 'titanic-mass',
    name: 'RMS Titanic Displacement',
    category: 'architecture',
    metricType: 'mass',
    value: 52310000.0,
    displayValue: '52,310 metric tons',
    icon: '🚢',
    funFact: 'Displaced over 52,000 tons of Atlantic ocean water; propelled by 29 colossal coal-fired scotch boilers.',
  },
  {
    id: 'great-pyramid-mass',
    name: 'Great Pyramid of Giza Mass',
    category: 'architecture',
    metricType: 'mass',
    value: 5900000000.0,
    displayValue: '5.9M metric tons',
    icon: '🏛️',
    funFact: 'Composed of 2.3 million limestone and granite blocks, each weighing an average of 2.5 metric tons.',
  },
  {
    id: 'bennu-asteroid-mass',
    name: 'Asteroid 101955 Bennu',
    category: 'astronomy',
    metricType: 'mass',
    value: 7.329e10,
    displayValue: '73.3M metric tons',
    icon: '☄️',
    funFact: 'A loose rubble-pile asteroid visited by NASA’s OSIRIS-REx probe, which scooped samples and flew them back to Utah.',
  },
  {
    id: 'moon-mass',
    name: 'The Moon’s Total Mass',
    category: 'astronomy',
    metricType: 'mass',
    value: 7.342e22,
    displayValue: '7.34 × 10²² kg',
    icon: '🌕',
    funFact: 'Its gravitational attraction lifts trillions of tons of seawater every day, generating Earth’s global ocean tides.',
  },
  {
    id: 'earth-mass',
    name: 'Planet Earth',
    category: 'astronomy',
    metricType: 'mass',
    value: 5.972e24,
    displayValue: '5.97 × 10²⁴ kg',
    icon: '🌍',
    funFact: 'Because of its iron-nickel core, Earth is the densest planet in our entire Solar System (5.51 g/cm³).',
  },
  {
    id: 'jupiter-mass',
    name: 'Planet Jupiter',
    category: 'astronomy',
    metricType: 'mass',
    value: 1.898e27,
    displayValue: '1.90 × 10²⁷ kg',
    icon: '🪐',
    funFact: 'More massive than all other seven planets, moons, dwarf planets, and asteroids in our Solar System combined.',
  },
  {
    id: 'sun-mass',
    name: 'The Sun',
    category: 'astronomy',
    metricType: 'mass',
    value: 1.989e30,
    displayValue: '1.99 × 10³⁰ kg',
    icon: '☀️',
    funFact: 'Accounts for a staggering 99.86% of all physical matter in the entire Solar System.',
  },

  // ==========================================
  // SPEED / VELOCITY (km/h)
  // ==========================================
  {
    id: 'garden-snail-speed',
    name: 'Garden Snail',
    category: 'nature',
    metricType: 'speed',
    value: 0.048,
    displayValue: '0.048 km/h',
    icon: '🐌',
    funFact: 'Secretes a slick hygroscopic mucus carpet that allows it to crawl safely across the blade of a sharp razor.',
  },
  {
    id: 'three-toed-sloth-speed',
    name: 'Three-Toed Sloth',
    category: 'biology',
    metricType: 'speed',
    value: 0.24,
    displayValue: '0.24 km/h',
    icon: '🦥',
    funFact: 'Moves so slowly that symbiotic green algae flourishes directly inside its fur, giving it arboreal camouflage.',
  },
  {
    id: 'galapagos-tortoise-speed',
    name: 'Galapagos Giant Tortoise',
    category: 'nature',
    metricType: 'speed',
    value: 0.3,
    displayValue: '0.3 km/h',
    icon: '🐢',
    funFact: 'Can live for over 150 years and survive for an entire year without eating food or drinking fresh water.',
  },
  {
    id: 'human-walk-speed',
    name: 'Human Walking Pace',
    category: 'biology',
    metricType: 'speed',
    value: 5.0,
    displayValue: '5.0 km/h',
    icon: '🚶',
    funFact: 'Human bipedal walking is one of the most mechanically energy-efficient forms of locomotion in nature.',
  },
  {
    id: 'usain-bolt-sprint',
    name: 'Usain Bolt Peak Sprint',
    category: 'biology',
    metricType: 'speed',
    value: 44.72,
    displayValue: '44.7 km/h',
    icon: '⚡',
    funFact: 'Recorded between the 60m and 80m mark during his legendary 9.58s 100m world record in Berlin (2009).',
  },
  {
    id: 'racehorse-speed',
    name: 'Thoroughbred Racehorse',
    category: 'biology',
    metricType: 'speed',
    value: 70.76,
    displayValue: '70.8 km/h',
    icon: '🐎',
    funFact: 'Can sustain galloping speeds above 65 km/h over distances of more than two kilometers carrying a jockey.',
  },
  {
    id: 'sailfish-speed',
    name: 'Indo-Pacific Sailfish',
    category: 'nature',
    metricType: 'speed',
    value: 110.0,
    displayValue: '110 km/h',
    icon: '🐟',
    funFact: 'The fastest swimmer in the sea, folding its sail-like dorsal fin into a sleek groove to streamline underwater sprints.',
  },
  {
    id: 'cheetah-speed',
    name: 'Cheetah Top Sprint',
    category: 'nature',
    metricType: 'speed',
    value: 112.0,
    displayValue: '112 km/h',
    icon: '🐆',
    funFact: 'Accelerates from 0 to 100 km/h in 3 seconds flat—faster than most commercial production supercars!',
  },
  {
    id: 'shinkansen-speed',
    name: 'Shinkansen Bullet Train',
    category: 'architecture',
    metricType: 'speed',
    value: 320.0,
    displayValue: '320 km/h',
    icon: '🚄',
    funFact: 'Operates at 320 km/h in daily service with an average yearly timetable delay of less than 60 seconds.',
  },
  {
    id: 'f1-car-speed',
    name: 'Formula 1 Car Record',
    category: 'architecture',
    metricType: 'speed',
    value: 372.5,
    displayValue: '372.5 km/h',
    icon: '🏎️',
    funFact: 'Generates so much aerodynamic downforce at speed that it could theoretically race upside down on a ceiling.',
  },
  {
    id: 'peregrine-falcon-dive',
    name: 'Peregrine Falcon Dive',
    category: 'biology',
    metricType: 'speed',
    value: 389.0,
    displayValue: '389 km/h',
    icon: '🦅',
    funFact: 'The fastest animal on Earth, tucking its wings into a teardrop shape during high-altitude hunting stoops.',
  },
  {
    id: 'bugatti-chiron-speed',
    name: 'Bugatti Chiron Super Sport',
    category: 'architecture',
    metricType: 'speed',
    value: 490.48,
    displayValue: '490.5 km/h',
    icon: '🏎️',
    funFact: 'At maximum top speed, its quad-turbo 1,600 hp W16 engine empties its 100-liter fuel tank in just 9 minutes.',
  },
  {
    id: 'speed-of-sound',
    name: 'Speed of Sound (Sea Level, 20°C)',
    category: 'nature',
    metricType: 'speed',
    value: 1235.0,
    displayValue: '1,235 km/h',
    icon: '🔊',
    funFact: 'Surpassing Mach 1 creates sudden air-pressure wavefronts that human ears perceive as an explosive sonic boom.',
  },
  {
    id: 'sr71-blackbird-speed',
    name: 'SR-71 Blackbird Spy Plane',
    category: 'architecture',
    metricType: 'speed',
    value: 3529.0,
    displayValue: '3,529 km/h',
    icon: '🛩️',
    funFact: 'Flew at Mach 3.3; air friction heated its titanium skin so fiercely that the fuselage expanded by 8 cm in flight.',
  },
  {
    id: 'iss-orbit-speed',
    name: 'ISS Orbital Velocity',
    category: 'architecture',
    metricType: 'speed',
    value: 27600.0,
    displayValue: '27,600 km/h',
    icon: '🛰️',
    funFact: 'Circles Earth once every 92 minutes at 7.7 km per second, granting astronauts 16 sunrises every 24 hours.',
  },
  {
    id: 'saturn-v-escape-speed',
    name: 'Saturn V Escape Velocity',
    category: 'architecture',
    metricType: 'speed',
    value: 39000.0,
    displayValue: '39,000 km/h',
    icon: '🚀',
    funFact: 'The blistering speed required by the Apollo missions to break free from Earth’s strong gravitational grip.',
  },
  {
    id: 'voyager-1-speed',
    name: 'Voyager 1 Interstellar Speed',
    category: 'astronomy',
    metricType: 'speed',
    value: 61200.0,
    displayValue: '61,200 km/h',
    icon: '🛰️',
    funFact: 'The farthest human-made machine from Earth, currently cruising through the cold void beyond our heliosphere.',
  },
  {
    id: 'earth-orbit-speed',
    name: 'Earth Orbiting the Sun',
    category: 'astronomy',
    metricType: 'speed',
    value: 107208.0,
    displayValue: '107,208 km/h',
    icon: '🌍',
    funFact: 'Every person on Earth is currently traveling nearly 30 kilometers every second in orbit around our home star.',
  },
  {
    id: 'parker-solar-probe-speed',
    name: 'Parker Solar Probe Peak Speed',
    category: 'astronomy',
    metricType: 'speed',
    value: 635266.0,
    displayValue: '635,266 km/h',
    icon: '☀️',
    funFact: 'The fastest spacecraft ever engineered, repeatedly plunging through the Sun’s blistering outer corona.',
  },
  {
    id: 'speed-of-light',
    name: 'Speed of Light in Vacuum',
    category: 'astronomy',
    metricType: 'speed',
    value: 1079252848.0,
    displayValue: '1.08B km/h',
    icon: '✨',
    funFact: 'The ultimate universal cosmic speed limit; light could travel around the Earth’s equator 7.5 times in one second.',
  },
];

// Helper to look up metric details and questions
export function getMetricInfo(metricType) {
  switch (metricType) {
    case 'length':
      return {
        label: 'Length & Height',
        question: 'Which is LONGER / TALLER?',
        unit: 'meters (m)',
        color: 'sky',
        accentBadge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        gradient: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
      };
    case 'mass':
      return {
        label: 'Mass & Weight',
        question: 'Which is HEAVIER / MORE MASSIVE?',
        unit: 'kilograms (kg)',
        color: 'emerald',
        accentBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      };
    case 'speed':
      return {
        label: 'Speed & Velocity',
        question: 'Which is FASTER?',
        unit: 'km/h',
        color: 'amber',
        accentBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      };
    default:
      return {
        label: 'Physical Scale',
        question: 'Which is GREATER?',
        unit: '',
        color: 'cyan',
        accentBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
      };
  }
}

// Format ratio nicely (e.g. "1.8x", "12.4x", "1.2k x")
export function formatScaleRatio(valA, valB) {
  const higher = Math.max(valA, valB);
  const lower = Math.min(valA, valB);
  if (lower === 0) return '∞';
  const ratio = higher / lower;

  if (ratio >= 1000000) {
    return `${(ratio / 1000000).toFixed(1)}M x`;
  }
  if (ratio >= 10000) {
    return `${Math.round(ratio / 1000)}k x`;
  }
  if (ratio >= 1000) {
    return `${(ratio / 1000).toFixed(1)}k x`;
  }
  if (ratio >= 100) {
    return `${Math.round(ratio)}x`;
  }
  if (ratio >= 10) {
    return `${ratio.toFixed(1)}x`;
  }
  if (ratio >= 1.05) {
    return `${ratio.toFixed(2)}x`;
  }
  return `${ratio.toFixed(2)}x`;
}

// Generate fair, interesting comparison pairs
export function generateComparisonPair(rng = Math.random, excludeIds = new Set(), preferredMetric = null) {
  const metricTypes = ['length', 'mass', 'speed'];
  const chosenMetric = preferredMetric || metricTypes[Math.floor(rng() * metricTypes.length)];

  const pool = SCALE_ENTITIES.filter(
    (item) => item.metricType === chosenMetric && !excludeIds.has(item.id)
  );

  if (pool.length < 2) {
    // Fallback without exclusions if pool exhausted
    const fallbackPool = SCALE_ENTITIES.filter((item) => item.metricType === chosenMetric);
    return pickFairPairFromPool(fallbackPool, rng);
  }

  return pickFairPairFromPool(pool, rng);
}

function pickFairPairFromPool(pool, rng) {
  // Sort pool by value to find close/interesting neighbors
  const sorted = [...pool].sort((a, b) => a.value - b.value);

  // Pick first entity
  const firstIdx = Math.floor(rng() * sorted.length);
  const itemA = sorted[firstIdx];

  // Pick second entity:
  // Fair, compelling pairs are often within 1.05x to 80x ratio, or 1 to 6 steps away in the sorted list.
  // We bias heavily towards close calls (e.g. 1.05x - 4x) or moderate steps (4x - 50x)
  const candidateIndices = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i === firstIdx) continue;
    const itemB = sorted[i];
    const ratio = Math.max(itemA.value, itemB.value) / Math.min(itemA.value, itemB.value);
    // Keep interesting range (not equal, and preferably ratio between 1.05 and 200)
    if (ratio >= 1.05 && ratio <= 250) {
      candidateIndices.push(i);
    }
  }

  let itemB;
  if (candidateIndices.length > 0) {
    const chosenIdx = candidateIndices[Math.floor(rng() * candidateIndices.length)];
    itemB = sorted[chosenIdx];
  } else {
    // Pick nearest neighbor that isn't identical
    const nearestIdx = firstIdx > 0 ? firstIdx - 1 : firstIdx + 1;
    itemB = sorted[nearestIdx];
  }

  // Coin flip for left vs right presentation so correct answer is balanced
  const flip = rng() > 0.5;
  const left = flip ? itemA : itemB;
  const right = flip ? itemB : itemA;

  const isLeftLarger = left.value > right.value;
  const winner = isLeftLarger ? left : right;
  const loser = isLeftLarger ? right : left;
  const ratio = winner.value / loser.value;
  const ratioText = formatScaleRatio(winner.value, loser.value);

  return {
    id: `${left.id}-vs-${right.id}`,
    metricType: itemA.metricType,
    entityA: left,
    entityB: right,
    correctEntityId: winner.id,
    winner,
    loser,
    ratio,
    ratioText,
    isCloseCall: ratio < 1.6, // Very close call triggers bullseye bonus!
  };
}

// Generate a full game deck of N balanced rounds
export function generateScaleCraftDeck(roundsCount = 5, rng = Math.random) {
  const metricsSequence = ['length', 'mass', 'speed', 'length', 'mass'];
  const excludeIds = new Set();
  const deck = [];

  for (let i = 0; i < roundsCount; i++) {
    const preferredMetric = metricsSequence[i % metricsSequence.length];
    const pair = generateComparisonPair(rng, excludeIds, preferredMetric);
    excludeIds.add(pair.entityA.id);
    excludeIds.add(pair.entityB.id);
    deck.push(pair);
  }

  return deck;
}
