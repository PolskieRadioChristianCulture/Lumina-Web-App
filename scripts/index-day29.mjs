import fs from 'node:fs';

for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-28') {
      item.title = 'Z Biblią za Pan Brat — Dzień 28 (Lekcja 28): „Ja jestem Józef” — Przebaczenie zamiast zemsty (Rdz 44:1–45:28)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 28 na dziś'].includes(t));
    }
  }
  const has29 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-29');
  if (!has29) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 29 (Lekcja 29 na dziś): Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-29',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 29 (Lekcja 29 na dziś, 29 października 2026). Przeniesienie rodziny Jakuba do Egiptu, teofania w Beer-Szebie, spotkanie w Goszen i mądrość w czasie głodu — Rdz 46:1–47:31.',
      tags: [
        'lekcja 29', 'lekcja 29 na dziś', 'lekcja na dziś', 'dzień 29', 'dzien 29',
        'rozważanie 29', 'rozważanie na dziś', 'słowo na dziś',
        'bóg prowadzi swój lud do egiptu', 'jakub', 'józef', 'goszen', 'beer-szeba', 'faraon',
        'rdz 46', 'rdz 47', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '29 października 2026', 'dzisiaj', 'dziś'
      ],
      featured: true,
    });
  }
  idx.totalItems = idx.items.length;
  idx.updatedAt = new Date().toISOString();
  fs.writeFileSync(f, JSON.stringify(idx, null, 2) + '\n');
  console.log('Updated', f, 'totalItems:', idx.totalItems);
}

const mapPath = 'data/ecosystem-map.json';
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const topic = 'Z Biblią za Pan Brat — Dzień 29 (Rdz 46–47): Publikacja lekcji „Bóg prowadzi swój lud do Egiptu”, rozważań (TTS, WWW, TV Noemi i Sara) oraz artykułu CCN News';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-10-29',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('Updated ecosystem-map.json');
}
