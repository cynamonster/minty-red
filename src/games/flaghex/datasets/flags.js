// Flag Hex Reflex: Verified Country Flag Datasets
// Complete with official hex codes, proportional distributions, aspects, and symbolism trivia.

export const CONTINENTS = {
  EUROPE: 'Europe',
  ASIA: 'Asia',
  AFRICA: 'Africa',
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  OCEANIA: 'Oceania',
};

export const CONTINENT_NEIGHBORS = {
  Europe: ['Asia', 'Africa'],
  Asia: ['Europe', 'Oceania', 'Africa'],
  Africa: ['Europe', 'Asia'],
  'North America': ['South America', 'Europe'],
  'South America': ['North America', 'Africa'],
  Oceania: ['Asia', 'North America'],
};

export const FLAGS_DATASET = [
  // --- EUROPE (20) ---
  {
    id: 'fr',
    image: '/images/flags/fr.svg',
    country: 'France',
    continent: 'Europe',
    colors: ['#002654', '#FFFFFF', '#ED2939'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Adopted in 1794 during the Revolution, combining the blue and red of Paris with royal white.',
  },
  {
    id: 'it',
    image: '/images/flags/it.svg',
    country: 'Italy',
    continent: 'Europe',
    colors: ['#009246', '#FFFFFF', '#CE2B37'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'The colors represent hope (green), faith (white), and charity/courage (red) across Italian unity.',
  },
  {
    id: 'de',
    image: '/images/flags/de.svg',
    country: 'Germany',
    continent: 'Europe',
    colors: ['#000000', '#DD0000', '#FFCC00'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_horizontal',
    trivia: 'The black, red, and gold tricolor originated from the uniforms of the 19th-century Lützow Free Corps.',
  },
  {
    id: 'es',
    image: '/images/flags/es.svg',
    country: 'Spain',
    continent: 'Europe',
    colors: ['#AA151B', '#F1BF00', '#AA151B'],
    proportions: [1, 2, 1],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Known as "La Rojigualda", the central yellow stripe is twice as wide as each red stripe.',
  },
  {
    id: 'gb',
    image: '/images/flags/gb.svg',
    country: 'United Kingdom',
    continent: 'Europe',
    colors: ['#012169', '#C8102E', '#FFFFFF'],
    proportions: [3, 2, 1],
    flagAspect: 'cross',
    trivia: 'Combines the heraldic crosses of Saint George (England), Saint Andrew (Scotland), and Saint Patrick (Ireland).',
  },
  {
    id: 'nl',
    image: '/images/flags/nl.svg',
    country: 'Netherlands',
    continent: 'Europe',
    colors: ['#AE1C28', '#FFFFFF', '#21468B'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Originally the orange-white-blue Prince flag in 1572, the orange was later replaced with vermilion red.',
  },
  {
    id: 'be',
    image: '/images/flags/be.svg',
    country: 'Belgium',
    continent: 'Europe',
    colors: ['#000000', '#FDDA24', '#EF3340'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Derives from the Duchy of Brabant coat of arms, featuring a yellow lion on black with red claws.',
  },
  {
    id: 'se',
    image: '/images/flags/se.svg',
    country: 'Sweden',
    continent: 'Europe',
    colors: ['#006AA7', '#FECC00'],
    proportions: [5, 8],
    flagAspect: 'cross',
    trivia: 'The Nordic cross design was inspired by the Danish Dannebrog and King Gustav Vasa yellow-and-blue arms.',
  },
  {
    id: 'no',
    image: '/images/flags/no.svg',
    country: 'Norway',
    continent: 'Europe',
    colors: ['#BA0C2F', '#FFFFFF', '#00205B'],
    proportions: [6, 1, 2],
    flagAspect: 'cross',
    trivia: 'Designer Fredrik Meltzer added an inner indigo blue cross over Denmark white cross in 1821.',
  },
  {
    id: 'fi',
    image: '/images/flags/fi.svg',
    country: 'Finland',
    continent: 'Europe',
    colors: ['#FFFFFF', '#002F6C'],
    proportions: [7, 11],
    flagAspect: 'cross',
    trivia: 'The blue Nordic cross symbolizes thousands of lakes and clear skies, while white represents winter snow.',
  },
  {
    id: 'dk',
    image: '/images/flags/dk.svg',
    country: 'Denmark',
    continent: 'Europe',
    colors: ['#C60C30', '#FFFFFF'],
    proportions: [7, 12],
    flagAspect: 'cross',
    trivia: 'Recognized by Guinness as the oldest continuously used national flag in the world, dating to 1219.',
  },
  {
    id: 'ie',
    image: '/images/flags/ie.svg',
    country: 'Ireland',
    continent: 'Europe',
    colors: ['#169B62', '#FFFFFF', '#FF883E'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Green represents Gaelic tradition, orange the Protestant Williamites, and white lasting peace between them.',
  },
  {
    id: 'pl',
    image: '/images/flags/pl.svg',
    country: 'Poland',
    continent: 'Europe',
    colors: ['#FFFFFF', '#DC143C'],
    proportions: [1, 1],
    flagAspect: 'bicolor',
    trivia: 'White represents the White Eagle of Polish heraldry against a historic field of crimson red.',
  },
  {
    id: 'ua',
    image: '/images/flags/ua.svg',
    country: 'Ukraine',
    continent: 'Europe',
    colors: ['#0057B7', '#FFDD00'],
    proportions: [1, 1],
    flagAspect: 'bicolor',
    trivia: 'Symbolizes endless clear blue skies arching over golden fields of ripe wheat across the steppe.',
  },
  {
    id: 'gr',
    image: '/images/flags/gr.svg',
    country: 'Greece',
    continent: 'Europe',
    colors: ['#0D5EAF', '#FFFFFF'],
    proportions: [5, 4],
    flagAspect: 'canton_stripes',
    trivia: 'Its nine blue and white stripes correspond to the nine syllables of "Eleftheria i thanatos" (Freedom or Death).',
  },
  {
    id: 'pt',
    image: '/images/flags/pt.svg',
    country: 'Portugal',
    continent: 'Europe',
    colors: ['#046A38', '#DA291C', '#FFD100'],
    proportions: [2, 3, 0.5],
    flagAspect: 'tricolor_vertical',
    trivia: 'Features the golden celestial armillary sphere used by Portuguese navigators during the Age of Discovery.',
  },
  {
    id: 'ch',
    image: '/images/flags/ch.svg',
    country: 'Switzerland',
    continent: 'Europe',
    colors: ['#FF0000', '#FFFFFF'],
    proportions: [5, 2],
    flagAspect: 'cross',
    trivia: 'One of only two sovereign square flags in the world, alongside Vatican City.',
  },
  {
    id: 'at',
    image: '/images/flags/at.svg',
    country: 'Austria',
    continent: 'Europe',
    colors: ['#ED2939', '#FFFFFF', '#ED2939'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Legend holds Duke Leopold V tunic was soaked in blood at Acre except where protected under his belt.',
  },
  {
    id: 'cz',
    image: '/images/flags/cz.svg',
    country: 'Czechia',
    continent: 'Europe',
    colors: ['#11457E', '#FFFFFF', '#D7141A'],
    proportions: [2, 2, 2],
    flagAspect: 'canton_wedge',
    trivia: 'The blue hoist triangle was added in 1920 to distinguish the flag from the identical white-and-red banner of Poland.',
  },
  {
    id: 'is',
    image: '/images/flags/is.svg',
    country: 'Iceland',
    continent: 'Europe',
    colors: ['#02529C', '#FFFFFF', '#DC1E35'],
    proportions: [7, 1, 2],
    flagAspect: 'cross',
    trivia: 'The colors represent Iceland volcanic red fire, glaciers of white ice, and the deep blue ocean.',
  },

  // --- ASIA (16) ---
  {
    id: 'jp',
    image: '/images/flags/jp.svg',
    country: 'Japan',
    continent: 'Asia',
    colors: ['#FFFFFF', '#BC002D'],
    proportions: [7, 3],
    flagAspect: 'disk',
    trivia: 'The Nisshoki depicts the crimson solar disc rising on a field of pure white.',
  },
  {
    id: 'kr',
    image: '/images/flags/kr.svg',
    country: 'South Korea',
    continent: 'Asia',
    colors: ['#FFFFFF', '#CD2E3A', '#0047A0', '#000000'],
    proportions: [6, 2, 2, 1],
    flagAspect: 'disk',
    trivia: 'The Taegeuk disc symbolizes cosmic yin-yang harmony, surrounded by four black trigrams from the I Ching.',
  },
  {
    id: 'cn',
    image: '/images/flags/cn.svg',
    country: 'China',
    continent: 'Asia',
    colors: ['#DE2910', '#FFDE00'],
    proportions: [9, 1],
    flagAspect: 'canton_stars',
    trivia: 'The large golden star symbolizes the Communist Party and four smaller stars represent the four revolutionary classes.',
  },
  {
    id: 'in',
    image: '/images/flags/in.svg',
    country: 'India',
    continent: 'Asia',
    colors: ['#FF9933', '#FFFFFF', '#138808', '#000080'],
    proportions: [1, 1, 1, 0.2],
    flagAspect: 'tricolor_horizontal',
    trivia: 'The navy blue Ashoka Chakra wheel in the center features 24 spokes symbolizing the continuous cycles of duty.',
  },
  {
    id: 'vn',
    image: '/images/flags/vn.svg',
    country: 'Vietnam',
    continent: 'Asia',
    colors: ['#DA251D', '#FFFF00'],
    proportions: [9, 1],
    flagAspect: 'disk',
    trivia: 'The five-pointed gold star honors workers, peasants, soldiers, intellectuals, and youth united together.',
  },
  {
    id: 'id',
    image: '/images/flags/id.svg',
    country: 'Indonesia',
    continent: 'Asia',
    colors: ['#FF0000', '#FFFFFF'],
    proportions: [1, 1],
    flagAspect: 'bicolor',
    trivia: 'Known as "Sang Saka Merah-Putih", its design traces directly back to the 13th-century Majapahit royal banner.',
  },
  {
    id: 'th',
    image: '/images/flags/th.svg',
    country: 'Thailand',
    continent: 'Asia',
    colors: ['#A51931', '#F4F5F8', '#2D2A4A'],
    proportions: [1, 1, 2],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Known as the Trairanga (Tricolor), the central indigo blue stripe is twice as wide as the outer stripes.',
  },
  {
    id: 'ph',
    image: '/images/flags/ph.svg',
    country: 'Philippines',
    continent: 'Asia',
    colors: ['#0038A8', '#CE1126', '#FFFFFF', '#FCD116'],
    proportions: [1, 1, 0.8, 0.4],
    flagAspect: 'canton_wedge',
    trivia: 'Flown with blue stripe on top in peacetime, but flipped upside down with red on top during wartime.',
  },
  {
    id: 'sg',
    image: '/images/flags/sg.svg',
    country: 'Singapore',
    continent: 'Asia',
    colors: ['#ED2939', '#FFFFFF'],
    proportions: [1, 1],
    flagAspect: 'bicolor',
    trivia: 'The crescent moon represents a rising young nation, while five white stars denote democracy, peace, and equality.',
  },
  {
    id: 'my',
    image: '/images/flags/my.svg',
    country: 'Malaysia',
    continent: 'Asia',
    colors: ['#010066', '#CC0000', '#FFFFFF', '#FFCC00'],
    proportions: [7, 7, 7, 2],
    flagAspect: 'canton_stripes',
    trivia: 'Known as the Stripes of Glory (Jalur Gemilang), displaying 14 alternating red and white stripes and a 14-point star.',
  },
  {
    id: 'pk',
    image: '/images/flags/pk.svg',
    country: 'Pakistan',
    continent: 'Asia',
    colors: ['#01411C', '#FFFFFF'],
    proportions: [3, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'The vertical white stripe represents religious minorities, while dark green represents the Muslim majority.',
  },
  {
    id: 'bd',
    image: '/images/flags/bd.svg',
    country: 'Bangladesh',
    continent: 'Asia',
    colors: ['#006A4E', '#F42A41'],
    proportions: [8, 2],
    flagAspect: 'disk',
    trivia: 'The red disc is offset slightly toward the hoist so that it appears centered when fluttering in the breeze.',
  },
  {
    id: 'sa',
    image: '/images/flags/sa.svg',
    country: 'Saudi Arabia',
    continent: 'Asia',
    colors: ['#006C35', '#FFFFFF'],
    proportions: [8, 1],
    flagAspect: 'bicolor',
    trivia: 'Because it bears the sacred Islamic Shahada creed and sword, the flag is never flown at half-mast.',
  },
  {
    id: 'tr',
    image: '/images/flags/tr.svg',
    country: 'Turkey',
    continent: 'Asia',
    colors: ['#E30A17', '#FFFFFF'],
    proportions: [8, 2],
    flagAspect: 'disk',
    trivia: 'The crescent moon and star on crimson red has served as the sacred emblem of Anatolia for centuries.',
  },
  {
    id: 'il',
    image: '/images/flags/il.svg',
    country: 'Israel',
    continent: 'Asia',
    colors: ['#FFFFFF', '#0038B8'],
    proportions: [6, 4],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Emulates the traditional blue-and-white tallit Jewish prayer shawl with the Shield of David centered between stripes.',
  },
  {
    id: 'ae',
    image: '/images/flags/ae.svg',
    country: 'United Arab Emirates',
    continent: 'Asia',
    colors: ['#00732F', '#FFFFFF', '#000000', '#FF0000'],
    proportions: [1, 1, 1, 1],
    flagAspect: 'canton_stripes',
    trivia: 'Features the four pan-Arab colors symbolizing fertility (green), purity (white), strength (black), and courage (red).',
  },

  // --- AFRICA (14) ---
  {
    id: 'za',
    image: '/images/flags/za.svg',
    country: 'South Africa',
    continent: 'Africa',
    colors: ['#007749', '#001489', '#E03C31', '#000000', '#FFB81C', '#FFFFFF'],
    proportions: [3, 2, 2, 2, 1, 1],
    flagAspect: 'pall_y',
    trivia: 'The horizontal Y-shape symbolizes the convergence of diverse cultures into one unified rainbow nation.',
  },
  {
    id: 'ng',
    image: '/images/flags/ng.svg',
    country: 'Nigeria',
    continent: 'Africa',
    colors: ['#008751', '#FFFFFF', '#008751'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Designed by 23-year-old student Michael Taiwo Akinkunmi; green represents agricultural wealth and white represents peace.',
  },
  {
    id: 'eg',
    image: '/images/flags/eg.svg',
    country: 'Egypt',
    continent: 'Africa',
    colors: ['#CE1126', '#FFFFFF', '#000000', '#C09300'],
    proportions: [1, 1, 1, 0.3],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Features the golden Eagle of Saladin centered upon the Arab Liberation red, white, and black tricolor.',
  },
  {
    id: 'ke',
    image: '/images/flags/ke.svg',
    country: 'Kenya',
    continent: 'Africa',
    colors: ['#000000', '#BB1E10', '#006600', '#FFFFFF'],
    proportions: [3, 3, 3, 0.5],
    flagAspect: 'tricolor_horizontal',
    trivia: 'A traditional Maasai warrior shield and two crossed white spears sit atop stripes representing people, blood, and land.',
  },
  {
    id: 'ma',
    image: '/images/flags/ma.svg',
    country: 'Morocco',
    continent: 'Africa',
    colors: ['#C1272D', '#006233'],
    proportions: [9, 1],
    flagAspect: 'disk',
    trivia: 'The green five-pointed pentagram represents the Seal of Solomon, standing for health, wisdom, and life.',
  },
  {
    id: 'gh',
    image: '/images/flags/gh.svg',
    country: 'Ghana',
    continent: 'Africa',
    colors: ['#CE1126', '#FCD116', '#006B3F', '#000000'],
    proportions: [1, 1, 1, 0.3],
    flagAspect: 'tricolor_horizontal',
    trivia: 'First African nation to adopt the Pan-African colors, accented by the iconic Black Star of African freedom.',
  },
  {
    id: 'et',
    image: '/images/flags/et.svg',
    country: 'Ethiopia',
    continent: 'Africa',
    colors: ['#009A44', '#FED100', '#EF3340', '#0F47AF'],
    proportions: [1, 1, 1, 0.4],
    flagAspect: 'tricolor_horizontal',
    trivia: 'The historical birthplace of the Pan-African colors, dating back to Emperor Menelik II in the 19th century.',
  },
  {
    id: 'sn',
    image: '/images/flags/sn.svg',
    country: 'Senegal',
    continent: 'Africa',
    colors: ['#00853F', '#FDEF42', '#E31B23'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Features a central green star on the yellow stripe symbolizing the opening of the five continents to the sky.',
  },
  {
    id: 'dz',
    image: '/images/flags/dz.svg',
    country: 'Algeria',
    continent: 'Africa',
    colors: ['#006233', '#FFFFFF', '#D21034'],
    proportions: [1, 1, 0.3],
    flagAspect: 'bicolor',
    trivia: 'Composed of equal green and white halves with a red star and crescent in the middle representing sovereignty.',
  },
  {
    id: 'tz',
    image: '/images/flags/tz.svg',
    country: 'Tanzania',
    continent: 'Africa',
    colors: ['#1EB53A', '#00A3DD', '#000000', '#FCD116'],
    proportions: [4, 4, 3, 1],
    flagAspect: 'diagonal',
    trivia: 'The black diagonal stripe bordered by yellow lines unifies the former nations of Tanganyika and Zanzibar.',
  },
  {
    id: 'cm',
    image: '/images/flags/cm.svg',
    country: 'Cameroon',
    continent: 'Africa',
    colors: ['#007A5E', '#CE1126', '#FCD116'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Nicknamed the "Star of Unity", featuring a central yellow star on red flanked by green and yellow.',
  },
  {
    id: 'ci',
    image: '/images/flags/ci.svg',
    country: 'Ivory Coast',
    continent: 'Africa',
    colors: ['#F77F00', '#FFFFFF', '#009E60'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'A mirror reverse of Ireland: orange on hoist represents northern savannas, white peace, and green coastal forests.',
  },
  {
    id: 'ao',
    image: '/images/flags/ao.svg',
    country: 'Angola',
    continent: 'Africa',
    colors: ['#CC092F', '#000000', '#FFCC00'],
    proportions: [1, 1, 0.3],
    flagAspect: 'bicolor',
    trivia: 'Features a golden half cogwheel and machete cross, inspired by socialist emblems to honor workers and farmers.',
  },
  {
    id: 'mg',
    image: '/images/flags/mg.svg',
    country: 'Madagascar',
    continent: 'Africa',
    colors: ['#FFFFFF', '#FC3D32', '#007E3A'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'White represents purity and the historic Merina monarchy, while red and green represent sovereign coastal populations.',
  },

  // --- NORTH AMERICA (6) ---
  {
    id: 'us',
    image: '/images/flags/us.svg',
    country: 'United States',
    continent: 'North America',
    colors: ['#B22234', '#FFFFFF', '#3C3B6E'],
    proportions: [7, 6, 5],
    flagAspect: 'canton_stripes',
    trivia: 'Features 50 stars representing fifty sovereign states and 13 stripes honoring the original founding colonies.',
  },
  {
    id: 'ca',
    image: '/images/flags/ca.svg',
    country: 'Canada',
    continent: 'North America',
    colors: ['#FF0000', '#FFFFFF', '#FF0000'],
    proportions: [1, 2, 1],
    flagAspect: 'canadian_pale',
    trivia: 'The iconic 11-pointed sugar maple leaf was chosen after wind-tunnel tests proved it stayed recognizable in heavy gales.',
  },
  {
    id: 'mx',
    image: '/images/flags/mx.svg',
    country: 'Mexico',
    continent: 'North America',
    colors: ['#006847', '#FFFFFF', '#CE1126', '#8B5A2B'],
    proportions: [1, 1, 1, 0.3],
    flagAspect: 'tricolor_vertical',
    trivia: 'Depicts an Aztec myth where an eagle perched on a prickly pear cactus devours a rattlesnake.',
  },
  {
    id: 'cu',
    image: '/images/flags/cu.svg',
    country: 'Cuba',
    continent: 'North America',
    colors: ['#002A8F', '#FFFFFF', '#CF142B'],
    proportions: [3, 2, 2],
    flagAspect: 'canton_wedge',
    trivia: 'Designed in New York exile in 1849, with three blue stripes representing the Spanish military departments of Cuba.',
  },
  {
    id: 'jm',
    image: '/images/flags/jm.svg',
    country: 'Jamaica',
    continent: 'North America',
    colors: ['#000000', '#007749', '#FFB81C'],
    proportions: [2, 2, 1],
    flagAspect: 'cross',
    trivia: 'One of only two national flags in the world with no red, white, or blue, featuring a gold diagonal saltire cross.',
  },
  {
    id: 'cr',
    image: '/images/flags/cr.svg',
    country: 'Costa Rica',
    continent: 'North America',
    colors: ['#002B7F', '#FFFFFF', '#CE1126'],
    proportions: [1, 1, 2],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Inspired by the French Tricolor, the double-width central red stripe represents warmth, courage, and vitality.',
  },

  // --- SOUTH AMERICA (6) ---
  {
    id: 'br',
    image: '/images/flags/br.svg',
    country: 'Brazil',
    continent: 'South America',
    colors: ['#009739', '#FEDD00', '#012169', '#FFFFFF'],
    proportions: [10, 5, 2, 0.2],
    flagAspect: 'rhombus',
    trivia: 'The celestial sphere depicts the night sky over Rio de Janeiro on 15 November 1889, proclamation day of the Republic.',
  },
  {
    id: 'ar',
    image: '/images/flags/ar.svg',
    country: 'Argentina',
    continent: 'South America',
    colors: ['#75AADB', '#FFFFFF', '#75AADB', '#F6B40E'],
    proportions: [1, 1, 1, 0.3],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Features the radiant Sun of May, an Inca solar god Inti face with alternating straight and wavy rays.',
  },
  {
    id: 'co',
    image: '/images/flags/co.svg',
    country: 'Colombia',
    continent: 'South America',
    colors: ['#FCD116', '#003893', '#CE1126'],
    proportions: [2, 1, 1],
    flagAspect: 'tricolor_horizontal',
    trivia: 'Designed by Francisco de Miranda, with yellow occupying the entire top half of the flag.',
  },
  {
    id: 'cl',
    image: '/images/flags/cl.svg',
    country: 'Chile',
    continent: 'South America',
    colors: ['#0039A6', '#FFFFFF', '#D52B1E'],
    proportions: [1, 2, 3],
    flagAspect: 'canton',
    trivia: 'The Lone Star (La Estrella Solitaria) guides the nation toward progress, while blue symbolizes Pacific skies.',
  },
  {
    id: 'pe',
    image: '/images/flags/pe.svg',
    country: 'Peru',
    continent: 'South America',
    colors: ['#D91023', '#FFFFFF', '#D91023'],
    proportions: [1, 1, 1],
    flagAspect: 'tricolor_vertical',
    trivia: 'Legend claims General José de San Martín was inspired after seeing a flock of red-and-white parihuana flamingos.',
  },
  {
    id: 'uy',
    image: '/images/flags/uy.svg',
    country: 'Uruguay',
    continent: 'South America',
    colors: ['#FFFFFF', '#0038A8', '#FCD116'],
    proportions: [5, 4, 1.5],
    flagAspect: 'canton_stripes',
    trivia: 'Displays nine alternating stripes representing the nine original departments, illuminated by the radiant Sun of May.',
  },

  // --- OCEANIA (5) ---
  {
    id: 'au',
    image: '/images/flags/au.svg',
    country: 'Australia',
    continent: 'Oceania',
    colors: ['#00008B', '#FFFFFF', '#FF0000'],
    proportions: [6, 2, 2],
    flagAspect: 'canton_stars',
    trivia: 'Combines the British Union Jack with the large seven-pointed Commonwealth Star and Southern Cross constellation.',
  },
  {
    id: 'nz',
    image: '/images/flags/nz.svg',
    country: 'New Zealand',
    continent: 'Oceania',
    colors: ['#00247D', '#CC142B', '#FFFFFF'],
    proportions: [6, 2, 2],
    flagAspect: 'canton_stars',
    trivia: 'Features four red stars with white borders representing the Southern Cross constellation in the South Pacific night sky.',
  },
  {
    id: 'fj',
    image: '/images/flags/fj.svg',
    country: 'Fiji',
    continent: 'Oceania',
    colors: ['#68BFE5', '#012169', '#C8102E', '#FFFFFF'],
    proportions: [6, 1, 1, 1],
    flagAspect: 'canton',
    trivia: 'Retains a distinctive sky-blue field representing the vast expanse of the Pacific Ocean surrounding its islands.',
  },
  {
    id: 'pg',
    image: '/images/flags/pg.svg',
    country: 'Papua New Guinea',
    continent: 'Oceania',
    colors: ['#000000', '#DA121A', '#FFCC00', '#FFFFFF'],
    proportions: [5, 5, 2, 1],
    flagAspect: 'diagonal',
    trivia: 'Designed in 1971 by 15-year-old schoolgirl Susan Karike, featuring the golden Kumul Bird of Paradise in flight.',
  },
  {
    id: 'ws',
    image: '/images/flags/ws.svg',
    country: 'Samoa',
    continent: 'Oceania',
    colors: ['#CE1126', '#002B7F', '#FFFFFF'],
    proportions: [6, 2, 1],
    flagAspect: 'canton_stars',
    trivia: 'Features the five white stars of the Southern Cross constellation inside a navy blue canton on a vibrant red field.',
  },
];

/**
 * Returns 3 distractor flags for a given target flag, prioritizing same continent
 * then neighboring continents to ensure competitive, plausible choices.
 */
export function getDistractors(target, allFlags = FLAGS_DATASET, count = 3, prng = Math.random) {
  const targetContinent = target.continent;
  const neighbors = CONTINENT_NEIGHBORS[targetContinent] || [];

  // Pool 1: Same continent (excluding target)
  const sameContinent = allFlags.filter(
    (f) => f.id !== target.id && f.continent === targetContinent
  );
  const shuffledSame = [...sameContinent].sort(() => prng() - 0.5);

  const picked = shuffledSame.slice(0, count);

  // Pool 2: Neighboring continents if needed
  if (picked.length < count) {
    const neighborPool = allFlags.filter(
      (f) =>
        f.id !== target.id &&
        neighbors.includes(f.continent) &&
        !picked.some((p) => p.id === f.id)
    );
    const shuffledNeighbors = [...neighborPool].sort(() => prng() - 0.5);
    picked.push(...shuffledNeighbors.slice(0, count - picked.length));
  }

  // Pool 3: Global pool fallback
  if (picked.length < count) {
    const globalPool = allFlags.filter(
      (f) => f.id !== target.id && !picked.some((p) => p.id === f.id)
    );
    const shuffledGlobal = [...globalPool].sort(() => prng() - 0.5);
    picked.push(...shuffledGlobal.slice(0, count - picked.length));
  }

  return picked.slice(0, count);
}

/**
 * Generates a full question structure with the target and 4 shuffled choices.
 */
export function generateQuestion(target, allFlags = FLAGS_DATASET, prng = Math.random) {
  const distractors = getDistractors(target, allFlags, 3, prng);
  const options = [target, ...distractors];

  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    target,
    options,
  };
}

/**
 * Generates a game round of `count` questions from the pool.
 */
export function generateGameRound(count = 10, pool = FLAGS_DATASET, prng = Math.random) {
  const available = [...pool];
  // Shuffle pool
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const selected = available.slice(0, Math.min(count, available.length));
  return selected.map((item) => generateQuestion(item, pool, prng));
}
