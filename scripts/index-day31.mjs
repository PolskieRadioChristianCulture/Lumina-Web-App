import fs from 'node:fs';

const now = new Date().toISOString();
for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-30') {
      item.title = 'Z Biblią za Pan Brat — Dzień 30 (Lekcja 30): Błogosławieństwo, obietnica i Lew z Judy (Rdz 48:1–49:33)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 30 na dziś'].includes(t));
    }
  }
  const has31 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-31');
  if (!has31) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 31 (Lekcja 31 na dziś): Bóg obrócił to w dobro — Ewangelia Opatrzności (Rdz 50:1–26)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-31',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 31 (Lekcja 31 na dziś, 31 października 2026). Finał Księgi Rodzaju: pochówek Jakuba, lęk braci, wyznanie Bożej Opatrzności i kości Józefa — Rdz 50:1–26.',
      tags: [
        'lekcja 31', 'lekcja 31 na dziś', 'lekcja na dziś', 'dzień 31', 'dzien 31',
        'rozważanie 31', 'rozważanie na dziś', 'słowo na dziś',
        'bóg obrócił to w dobro', 'józef', 'jakub', 'przebaczenie', 'opatrzność', 'kości józefa', 'machpela',
        'rdz 50', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '31 października 2026', 'dzisiaj', 'dziś'
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
const topic = 'Z Biblią za Pan Brat — Dzień 31 (Rdz 50): Publikacja lekcji „Bóg obrócił to w dobro — Ewangelia Opatrzności” w Akademii Biblijnej';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-10-31',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('Updated ecosystem-map.json');
}
