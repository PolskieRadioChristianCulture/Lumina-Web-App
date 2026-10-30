import fs from 'node:fs';

const now = new Date().toISOString();
for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-29') {
      item.title = 'Z Biblią za Pan Brat — Dzień 29 (Lekcja 29): Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 29 na dziś'].includes(t));
    }
  }
  const has30 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-30');
  if (!has30) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 30 (Lekcja 30 na dziś): Błogosławieństwo, obietnica i Lew z Judy (Rdz 48:1–49:33)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-30',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 30 (Lekcja 30 na dziś, 30 października 2026). Ostatnie słowa Jakuba: błogosławieństwo synów Józefa, proroctwo o berle Judy i nadzieja mesjańska — Rdz 48:1–49:33.',
      tags: [
        'lekcja 30', 'lekcja 30 na dziś', 'lekcja na dziś', 'dzień 30', 'dzien 30',
        'rozważanie 30', 'rozważanie na dziś', 'słowo na dziś',
        'błogosławieństwo obietnica i lew z judy', 'jakub', 'józef', 'juda', 'lew z judy', 'efraim', 'manasses', 'berło',
        'rdz 48', 'rdz 49', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '30 października 2026', 'dzisiaj', 'dziś'
      ],
      featured: true,
    });
  }
  idx.totalItems = idx.items.length;
  idx.updatedAt = now;
  fs.writeFileSync(f, JSON.stringify(idx, null, 2) + '\n');
  console.log('Updated', f, 'totalItems:', idx.totalItems);
}

// Ensure byte-for-byte identical content
fs.copyFileSync('szukaj/catalog.json', 'data/cc-search-index.json');

const mapPath = 'data/ecosystem-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const topic = 'Z Biblią za Pan Brat — Dzień 30 (Rdz 48–49): Publikacja lekcji „Błogosławieństwo, obietnica i Lew z Judy” w Akademii Biblijnej';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-10-30',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('Updated ecosystem-map.json');
}
