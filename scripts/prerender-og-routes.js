// Prerenders static HTML route index files with tailored Open Graph and Twitter card tags.
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('Error: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

const games = [
  {
    slug: 'orbitdrop',
    title: 'OrbitDrop | 2D Keplerian Gravity Slingshot',
    description: 'Slingshot your space probes around the gravity of planets and steer them into the goal portal.',
    image: 'https://minty.red/images/og/orbitdrop.png',
  },
  {
    slug: 'ethnos',
    title: 'Ethnos | Micro Ethnoguesser & World Faces',
    description: 'Look at real composite portraits of people from across the globe and pinpoint their home regions on the world map.',
    image: 'https://minty.red/images/og/ethnos.png',
  },
  {
    slug: 'bearinglock',
    title: 'Bearing Lock | Tactile Global Navigation',
    description: 'Spin a 360-degree compass dial to lock onto the exact direction of famous world landmarks.',
    image: 'https://minty.red/images/og/bearinglock.png',
  },
  {
    slug: 'relic',
    title: 'R.E.L.I.C. | Archeology & Geography',
    description: "Inspect famous ancient treasures, guess what year they were made, and find where they were discovered before time's up.",
    image: 'https://minty.red/images/og/relic.png',
  },
  {
    slug: 'metro',
    title: 'Metro | Subway Map Reflex',
    description: 'Identify cities by their subway systems.',
    image: 'https://minty.red/images/og/metro.png',
  },
  {
    slug: 'roots',
    title: 'Roots | Surnames & Language Origins',
    description: 'Trace last names back to their original languages, countries, and historical meanings.',
    image: 'https://minty.red/images/og/roots.png',
  },
  {
    slug: 'flagship',
    title: 'Flagship | Flag Recognition',
    description: 'Test your vexillology by matching national flags to their color distributions before time runs out.',
    image: 'https://minty.red/images/og/flagship.png',
  },
];

console.log('Generating prerendered static HTML routes for social crawlers...');

for (const game of games) {
  const gameUrl = `https://minty.red/${game.slug}`;
  let html = template;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${game.title} | Minty.red</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${game.description}" />`
  );

  // Replace or inject Open Graph tags
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${gameUrl}" />`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${game.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${game.description}" />`
  );

  const ogImageBlock = `<meta property="og:image" content="${game.image}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`;
  if (/<meta property="og:image" content=".*?" \/>/i.test(html)) {
    html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${game.image}" />`);
  } else {
    html = html.replace(
      /(<meta property="og:description" content=".*?" \/>)/i,
      `$1\n    ${ogImageBlock}`
    );
  }

  // Replace or inject Twitter card tags
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${game.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${game.description}" />`
  );

  const twitterCardBlock = `<meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${game.title}" />\n    <meta name="twitter:description" content="${game.description}" />\n    <meta name="twitter:image" content="${game.image}" />`;
  if (/<meta name="twitter:image" content=".*?" \/>/i.test(html)) {
    html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${game.image}" />`);
  } else {
    html = html.replace(
      /<meta name="twitter:card" content=".*?" \/>/i,
      twitterCardBlock
    );
  }

  // Create route directory dist/[slug]
  const targetDir = path.join(distDir, game.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  console.log(`✓ Generated dist/${game.slug}/index.html`);
}

// Also ensure dist/images/og has the latest images
const distOgDir = path.join(distDir, 'images', 'og');
fs.mkdirSync(distOgDir, { recursive: true });
const publicOgDir = path.resolve('public', 'images', 'og');
if (fs.existsSync(publicOgDir)) {
  for (const file of fs.readdirSync(publicOgDir)) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(publicOgDir, file), path.join(distOgDir, file));
    }
  }
  console.log('✓ Synced OG images to dist/images/og');
}

console.log('Static route prerendering complete!');
