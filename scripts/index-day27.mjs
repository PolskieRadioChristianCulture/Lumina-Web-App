import fs from 'node:fs';

for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const item of idx.items) {
    if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-26') {
      item.title = 'Z Biblią za Pan Brat — Dzień 26 (Lekcja 26): Od więzienia do pałacu (Rdz 40:1–41:57)';
      item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 26 na dziś'].includes(t));
    }
  }
  const has27 = idx.items.some((x) => x.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-27');
  if (!has27) {
    idx.items.unshift({
      title: 'Z Biblią za Pan Brat — Dzień 27 (Lekcja 27 na dziś): Gdy przeszłość wraca — Bracia Józefa (Rdz 42:1–43:34)',
      category: 'Biblia i formacja',
      url: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-27',
      description: 'Kurs Codzienny Pisma Świętego — Dzień 27 (Lekcja 27 na dziś, 27 października 2026). Bracia Józefa w Egipcie, przebudzenie sumienia, poręczenie Judy za Beniamina i pierwsze kroki ku pojednaniu — Rdz 42:1–43:34.',
      tags: [
        'lekcja 27', 'lekcja 27 na dziś', 'lekcja na dziś', 'dzień 27', 'dzien 27',
        'rozważanie 27', 'rozważanie na dziś', 'słowo na dziś',
        'gdy przeszłość wraca', 'bracia józefa', 'józef', 'juda', 'beniamin', 'symeon',
        'rdz 42', 'rdz 43', 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna',
        '27 października 2026', 'dzisiaj', 'dziś'
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
const topic = 'Z Biblią za Pan Brat — Dzień 27 (Rdz 42–43): Publikacja lekcji „Gdy przeszłość wraca — Bracia Józefa”, rozważań (TTS, WWW, TV Noemi i Sara) oraz artykułu CCN News';
if (!map.updatesLog.some((u) => u.topic === topic)) {
  map.updatesLog.unshift({
    topic,
    date: '2026-10-27',
    agent: 'A',
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  console.log('Updated ecosystem-map.json');
}
