import fs from 'node:fs';

for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-27') {
      item.title = 'Z Biblią za Pan Brat — Dzień 27 (Lekcja 27): Gdy przeszłość wraca — Bracia Józefa (Rdz 42:1–43:34)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 27 na dziś'].includes(t));
    }
  }
  const has28 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-28');
  if (!has28) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 28 (Lekcja 28 na dziś): „Ja jestem Józef” — Przebaczenie zamiast zemsty (Rdz 44:1–45:28)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-28',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 28 (Lekcja 28 na dziś, 28 października 2026). Srebrny kielich w worku Beniamina, ofiarne poręczenie Judy i wielkie wyznanie Józefa: przebaczenie, prawda i Boża opatrzność — Rdz 44:1–45:28.',
      tags: [
        'lekcja 28', 'lekcja 28 na dziś', 'lekcja na dziś', 'dzień 28', 'dzien 28',
        'rozważanie 28', 'rozważanie na dziś', 'słowo na dziś',
        'ja jestem józef', 'przebaczenie zamiast zemsty', 'józef', 'juda', 'beniamin', 'srebrny kielich',
        'rdz 44', 'rdz 45', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '28 października 2026', 'dzisiaj', 'dziś'
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
const topic = 'Z Biblią za Pan Brat — Dzień 28 (Rdz 44–45): Publikacja lekcji „Ja jestem Józef — Przebaczenie zamiast zemsty”, rozważań (TTS, WWW, TV Noemi i Sara) oraz artykułu CCN News';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-10-28',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('Updated ecosystem-map.json');
}
