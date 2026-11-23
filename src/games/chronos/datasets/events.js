// Curated, verified historical milestones for Chronos: Year Slider.
// Spans 1000 AD to 2024 across 5 core categories with rich contextual reveals.

export const CHRONOS_EVENTS = [
  // INVENTIONS & TECH
  {
    id: 'tech-gutenberg',
    event: 'Johannes Gutenberg perfects the movable type printing press in Mainz',
    year: 1450,
    category: 'Inventions & Tech',
    era: 'Renaissance',
    context: 'The movable press democratized literacy across Europe and triggered the scientific revolution.',
  },
  {
    id: 'tech-steam-engine',
    event: 'James Watt patents the separate condenser steam engine',
    year: 1769,
    category: 'Inventions & Tech',
    era: 'Industrial',
    context: 'Watt’s breakthrough dramatically boosted thermal efficiency, igniting the Industrial Revolution.',
  },
  {
    id: 'tech-telephone',
    event: 'Alexander Graham Bell places the first telephone call: "Mr. Watson, come here"',
    year: 1876,
    category: 'Inventions & Tech',
    era: 'Industrial',
    context: 'Bell filed his patent just hours before rival inventor Elisha Gray on February 14.',
  },
  {
    id: 'tech-lightbulb',
    event: 'Thomas Edison demonstrates his long-lasting incandescent carbon-filament bulb',
    year: 1879,
    category: 'Inventions & Tech',
    era: 'Industrial',
    context: 'His bamboo-filament bulb could burn continuously for over 1,200 hours in Menlo Park.',
  },
  {
    id: 'tech-wright-brothers',
    event: 'The Wright brothers achieve the first powered, controlled heavier-than-air airplane flight',
    year: 1903,
    category: 'Inventions & Tech',
    era: 'Atomic',
    context: 'Orville Wright flew 120 feet in 12 seconds over the sands of Kitty Hawk, North Carolina.',
  },
  {
    id: 'tech-penicillin',
    event: 'Alexander Fleming discovers penicillin after finding mold in a staphylococcus culture',
    year: 1928,
    category: 'Inventions & Tech',
    era: 'Atomic',
    context: 'Fleming famously remarked: "One sometimes finds what one is not looking for."',
  },
  {
    id: 'tech-transistor',
    event: 'Bell Labs physicists invent the point-contact transistor',
    year: 1947,
    category: 'Inventions & Tech',
    era: 'Atomic',
    context: 'John Bardeen, Walter Brattain, and William Shockley paved the path for all modern silicon microchips.',
  },
  {
    id: 'tech-arpanet',
    event: 'The first computer-to-computer ARPANET message ("LO") is sent from UCLA to Stanford',
    year: 1969,
    category: 'Inventions & Tech',
    era: 'Digital',
    context: 'The system crashed right after typing the first two letters of "LOGIN".',
  },
  {
    id: 'tech-macintosh',
    event: 'Steve Jobs introduces the original Apple Macintosh with its iconic "1984" Super Bowl ad',
    year: 1984,
    category: 'Inventions & Tech',
    era: 'Digital',
    context: 'The Mac popularized the graphical user interface (GUI) and desktop mouse for the mass market.',
  },
  {
    id: 'tech-www',
    event: 'Tim Berners-Lee publishes the world\'s first website at CERN on his NeXT computer',
    year: 1991,
    category: 'Inventions & Tech',
    era: 'Digital',
    context: 'The webpage described the basic features of the Web and how to set up your own web server.',
  },
  {
    id: 'tech-iphone',
    event: 'Steve Jobs unveils the original iPhone at Macworld San Francisco',
    year: 2007,
    category: 'Inventions & Tech',
    era: 'Digital',
    context: 'Jobs pitched it as "a widescreen iPod with touch controls, a revolutionary mobile phone, and a breakthrough internet device."',
  },
  {
    id: 'tech-bitcoin',
    event: 'Satoshi Nakamoto mines the Bitcoin Genesis Block',
    year: 2009,
    category: 'Inventions & Tech',
    era: 'Digital',
    context: 'The block included an embedded headline: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."',
  },

  // SPACE & SCIENCE
  {
    id: 'space-halley',
    event: 'Edmond Halley predicts the periodic return of the comet that now bears his name',
    year: 1705,
    category: 'Space & Science',
    era: 'Enlightenment',
    context: 'Halley accurately calculated that the 1531, 1607, and 1682 sightings were the same object returning every 75-76 years.',
  },
  {
    id: 'space-origin-species',
    event: 'Charles Darwin publishes "On the Origin of Species by Means of Natural Selection"',
    year: 1859,
    category: 'Space & Science',
    era: 'Industrial',
    context: 'All 1,250 copies of the first print run sold out to booksellers on the first day.',
  },
  {
    id: 'space-relativity',
    event: 'Albert Einstein publishes his paper on General Relativity',
    year: 1915,
    category: 'Space & Science',
    era: 'Atomic',
    context: 'Einstein’s theory predicted gravitational light-bending, proven four years later during an eclipse.',
  },
  {
    id: 'space-dna',
    event: 'James Watson and Francis Crick deduce the double-helix structure of DNA',
    year: 1953,
    category: 'Space & Science',
    era: 'Atomic',
    context: 'Crucial X-ray diffraction Photo 51 taken by Rosalind Franklin was key to unlocking the helical twist.',
  },
  {
    id: 'space-sputnik',
    event: 'The Soviet Union launches Sputnik 1, the first artificial satellite in orbit',
    year: 1957,
    category: 'Space & Science',
    era: 'Atomic',
    context: 'The polished aluminum sphere beeped radio pulses every 0.4 seconds, shocking Western nations.',
  },
  {
    id: 'space-gagarin',
    event: 'Yuri Gagarin becomes the first human in space aboard Vostok 1',
    year: 1961,
    category: 'Space & Science',
    era: 'Atomic',
    context: 'Gagarin completed a single 108-minute orbit around Earth, exclaiming "Poyekhali!" ("Let’s go!").',
  },
  {
    id: 'space-moon-landing',
    event: 'Apollo 11 lands on the Moon; Neil Armstrong walks on the lunar surface',
    year: 1969,
    category: 'Space & Science',
    era: 'Digital',
    context: 'An estimated 650 million viewers worldwide watched the live black-and-white television broadcast.',
  },
  {
    id: 'space-voyager',
    event: 'Voyager 1 launches from Cape Canaveral carrying the Golden Record',
    year: 1977,
    category: 'Space & Science',
    era: 'Digital',
    context: 'It is now the most distant human-made object from Earth, cruising interstellar space beyond the heliosphere.',
  },
  {
    id: 'space-hubble',
    event: 'Space Shuttle Discovery deploys the Hubble Space Telescope into low Earth orbit',
    year: 1990,
    category: 'Space & Science',
    era: 'Digital',
    context: 'Hubble’s mirror initially had a spherical aberration of 2.2 microns, fixed in 1993 with corrective optics.',
  },
  {
    id: 'space-higgs',
    event: 'CERN scientists at the Large Hadron Collider announce the discovery of the Higgs Boson',
    year: 2012,
    category: 'Space & Science',
    era: 'Digital',
    context: 'The particle completed the Standard Model of particle physics, 48 years after Peter Higgs predicted it.',
  },
  {
    id: 'space-jwst',
    event: 'NASA releases the first full-color scientific deep field image from the James Webb Space Telescope',
    year: 2022,
    category: 'Space & Science',
    era: 'Digital',
    context: 'Webb’s infrared mirror captured light from gravitational-lensed galaxies born over 13.1 billion years ago.',
  },

  // WORLD HISTORY & EXPLORATIONS
  {
    id: 'hist-norman-conquest',
    event: 'William the Conqueror defeats King Harold II at the Battle of Hastings',
    year: 1066,
    category: 'World History',
    era: 'Medieval',
    context: 'The Norman victory linked England to Continental European politics and forever transformed the English language.',
  },
  {
    id: 'hist-magna-carta',
    event: 'King John signs Magna Carta at Runnymede under pressure from rebel barons',
    year: 1215,
    category: 'World History',
    era: 'Medieval',
    context: 'It established the bedrock principle that everyone, even the monarch, is subject to the rule of law.',
  },
  {
    id: 'hist-black-death',
    event: 'The Black Death bubonic plague epidemic arrives in Europe via Genoese merchant ships',
    year: 1347,
    category: 'World History',
    era: 'Medieval',
    context: 'Between 30% and 60% of Europe’s total population perished over the next five years.',
  },
  {
    id: 'hist-constantinople',
    event: 'Ottoman Sultan Mehmed II breaches the Theodosian Walls and captures Constantinople',
    year: 1453,
    category: 'World History',
    era: 'Renaissance',
    context: 'The fall marked the final end of the Eastern Roman (Byzantine) Empire after more than 1,100 years.',
  },
  {
    id: 'hist-columbus',
    event: 'Christopher Columbus reaches the Lucayan Archipelago in the Bahamas aboard the Santa María',
    year: 1492,
    category: 'World History',
    era: 'Renaissance',
    context: '1492 also saw the completion of the Spanish Reconquista with the surrender of Granada.',
  },
  {
    id: 'hist-luther',
    event: 'Martin Luther nails his Ninety-five Theses to the door of All Saints\' Church in Wittenberg',
    year: 1517,
    category: 'World History',
    era: 'Renaissance',
    context: 'His critique of papal indulgences sparked the Protestant Reformation across Europe.',
  },
  {
    id: 'hist-magellan',
    event: 'Ferdinand Magellan’s expedition vessel Victoria returns to Spain, completing the first global circumnavigation',
    year: 1522,
    category: 'World History',
    era: 'Renaissance',
    context: 'Only 18 of the original 270 crew members survived the three-year voyage, commanded by Juan Sebastián Elcano.',
  },
  {
    id: 'hist-spanish-armada',
    event: 'England defeats King Philip II\'s Spanish Armada in the English Channel',
    year: 1588,
    category: 'World History',
    era: 'Renaissance',
    context: 'English fireships and fierce Atlantic storms ("the Protestant Wind") scattered the invasion fleet.',
  },
  {
    id: 'hist-us-independence',
    event: 'The Second Continental Congress adopts the United States Declaration of Independence',
    year: 1776,
    category: 'World History',
    era: 'Enlightenment',
    context: 'Drafted primarily by Thomas Jefferson, 56 delegates signed the parchment in Philadelphia.',
  },
  {
    id: 'hist-french-rev',
    event: 'Parisian citizens storm the Bastille fortress prison, launching the French Revolution',
    year: 1789,
    category: 'World History',
    era: 'Enlightenment',
    context: 'Though only seven prisoners were inside, the Bastille stood as the ultimate symbol of royal tyranny.',
  },
  {
    id: 'hist-waterloo',
    event: 'The Duke of Wellington and Gebhard von Blücher defeat Napoleon Bonaparte at Waterloo',
    year: 1815,
    category: 'World History',
    era: 'Industrial',
    context: 'Napoleon’s final defeat ended the Napoleonic Wars and led to his permanent exile on Saint Helena.',
  },
  {
    id: 'hist-suez-canal',
    event: 'The Suez Canal officially opens in Egypt, connecting the Mediterranean to the Red Sea',
    year: 1869,
    category: 'World History',
    era: 'Industrial',
    context: 'The 120-mile waterway cut the maritime transit between Europe and India by around 4,300 miles.',
  },
  {
    id: 'hist-titanic',
    event: 'RMS Titanic strikes an iceberg and sinks in the North Atlantic Ocean',
    year: 1912,
    category: 'World History',
    era: 'Industrial',
    context: 'Over 1,500 passengers and crew lost their lives on what was hailed as an "unsinkable" luxury liner.',
  },
  {
    id: 'hist-ww1-start',
    event: 'Archduke Franz Ferdinand of Austria is assassinated in Sarajevo, sparking World War I',
    year: 1914,
    category: 'World History',
    era: 'Atomic',
    context: 'Gavrilo Princip fired two shots near the Latin Bridge after the motorcade made a wrong turn.',
  },
  {
    id: 'hist-berlin-wall',
    event: 'The Berlin Wall falls as East German citizens cross checkpoints into West Berlin',
    year: 1989,
    category: 'World History',
    era: 'Digital',
    context: 'A spokesman\'s mistaken announcement at an evening press conference caused tens of thousands to flood the gates.',
  },
  {
    id: 'hist-ussr-dissolution',
    event: 'The Soviet flag is lowered over the Kremlin as the USSR officially dissolves',
    year: 1991,
    category: 'World History',
    era: 'Digital',
    context: 'Mikhail Gorbachev resigned as Soviet president, handing power over to Russian President Boris Yeltsin.',
  },
  {
    id: 'hist-mandela',
    event: 'Nelson Mandela is inaugurated as South Africa\'s first Black president',
    year: 1994,
    category: 'World History',
    era: 'Digital',
    context: 'Mandela won the historic all-race general elections four years after his release from 27 years in prison.',
  },

  // POP CULTURE, MUSIC & CINEMA
  {
    id: 'pop-shakespeare-globe',
    event: 'William Shakespeare\'s playing company opens the original Globe Theatre in London',
    year: 1599,
    category: 'Culture & Arts',
    era: 'Renaissance',
    context: 'Built from timbers of an earlier theatre, it could hold up to 3,000 groundlings and seated patrons.',
  },
  {
    id: 'pop-beethoven-9',
    event: 'Ludwig van Beethoven conducts the premiere of his Ninth Symphony while profoundly deaf',
    year: 1824,
    category: 'Culture & Arts',
    era: 'Industrial',
    context: 'Contralto Caroline Unger had to gently turn Beethoven around so he could see the standing ovation.',
  },
  {
    id: 'pop-mona-lisa-stolen',
    event: 'The Mona Lisa is stolen from the Louvre by handyman Vincenzo Peruggia',
    year: 1911,
    category: 'Culture & Arts',
    era: 'Industrial',
    context: 'The audacious heist and 2-year disappearance turned Da Vinci’s painting into the most famous artwork in the world.',
  },
  {
    id: 'pop-wizard-of-oz',
    event: '"The Wizard of Oz" premieres, stunning audiences with its shift from sepia to Technicolor',
    year: 1939,
    category: 'Culture & Arts',
    era: 'Atomic',
    context: '1939 is widely regarded as Hollywood\'s golden year, also releasing "Gone with the Wind" and "Stagecoach".',
  },
  {
    id: 'pop-beatles-ed-sullivan',
    event: 'The Beatles perform on The Ed Sullivan Show, igniting Beatlemania in America',
    year: 1964,
    category: 'Culture & Arts',
    era: 'Atomic',
    context: 'A record 73 million Americans tuned in — nearly 40% of the entire country\'s population.',
  },
  {
    id: 'pop-woodstock',
    event: 'The Woodstock Music & Art Fair draws 400,000 people to a dairy farm in Bethel, New York',
    year: 1969,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'Jimi Hendrix closed the four-day festival on Monday morning with his legendary rendition of "The Star-Spangled Banner".',
  },
  {
    id: 'pop-star-wars',
    event: 'George Lucas\'s original "Star Wars: A New Hope" premieres in just 32 movie theaters',
    year: 1977,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'Fans queued around city blocks for months; the film revolutionized cinematic VFX and merchandising forever.',
  },
  {
    id: 'pop-thriller',
    event: 'Michael Jackson releases "Thriller", which becomes the best-selling album of all time',
    year: 1982,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'Produced by Quincy Jones, seven of the album’s nine tracks became Billboard Hot 100 top 10 singles.',
  },
  {
    id: 'pop-live-aid',
    event: 'The Live Aid dual-venue benefit concert is broadcast to 1.9 billion viewers worldwide',
    year: 1985,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'Queen’s electrifying 21-minute set at Wembley Stadium is regarded as one of the greatest live performances in rock history.',
  },
  {
    id: 'pop-jurassic-park',
    event: 'Steven Spielberg\'s "Jurassic Park" premieres, pioneering photorealistic CGI dinosaurs',
    year: 1993,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'Industrial Light & Magic’s digital models replaced planned stop-motion go-motion puppets.',
  },
  {
    id: 'pop-harry-potter',
    event: 'J.K. Rowling publishes "Harry Potter and the Philosopher\'s Stone" with an initial 500-copy print run',
    year: 1997,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'About 300 of the original 500 hardcover copies were distributed to British public libraries.',
  },
  {
    id: 'pop-game-of-thrones',
    event: 'HBO premieres the fantasy television series "Game of Thrones"',
    year: 2011,
    category: 'Culture & Arts',
    era: 'Digital',
    context: 'The pilot episode introduced the motto "Winter Is Coming" and launched a global cultural phenomenon.',
  },
];

export const ERA_GRADIENTS = {
  Medieval: {
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    accent: '#d97706',
    label: '1000 - 1400 • Medieval Era',
  },
  Renaissance: {
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    accent: '#059669',
    label: '1400 - 1650 • Renaissance',
  },
  Enlightenment: {
    badge: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
    accent: '#0d9488',
    label: '1650 - 1800 • Age of Enlightenment',
  },
  Industrial: {
    badge: 'bg-orange-950/60 text-orange-300 border-orange-800/60',
    accent: '#ea580c',
    label: '1800 - 1920 • Industrial Age',
  },
  Atomic: {
    badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    accent: '#06b6d4',
    label: '1920 - 1970 • Atomic & Space Age',
  },
  Digital: {
    badge: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    accent: '#a855f7',
    label: '1970 - 2026 • Digital & AI Age',
  },
};

export const MIN_YEAR = 1000;
export const MAX_YEAR = 2025;
export const ROUNDS_PER_GAME = 5;

// Proximity scoring system
export function calculateYearScore(guessYear, actualYear) {
  const delta = Math.abs(guessYear - actualYear);

  if (delta === 0) {
    return {
      points: 1000,
      delta: 0,
      verdict: 'BULLSEYE!',
      badgeColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
      emoji: '🎯',
    };
  }
  if (delta <= 2) {
    return {
      points: Math.round(950 - delta * 25),
      delta,
      verdict: 'Pinpoint!',
      badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      emoji: '🟢',
    };
  }
  if (delta <= 5) {
    return {
      points: Math.round(850 - (delta - 2) * 30),
      delta,
      verdict: 'Close Range',
      badgeColor: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
      emoji: '🔵',
    };
  }
  if (delta <= 15) {
    return {
      points: Math.max(300, Math.round(750 - (delta - 5) * 35)),
      delta,
      verdict: 'Same Decade',
      badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
      emoji: '🟡',
    };
  }
  if (delta <= 35) {
    return {
      points: Math.max(100, Math.round(400 - (delta - 15) * 12)),
      delta,
      verdict: 'Same Era',
      badgeColor: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
      emoji: '🟠',
    };
  }
  return {
    points: Math.max(10, Math.round(150 - Math.min(140, delta * 1.5))),
    delta,
    verdict: 'Time Drift',
    badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    emoji: '🔴',
  };
}
