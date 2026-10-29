import fs from 'node:fs';

const targetDay = process.argv[2] ? parseInt(process.argv[2], 10) : 29;

const catalogFiles = [
  'akademia.html',
  'akademia/index.html',
  'akademia/kurscodzienny.html',
  'akademia/kurscodzienny/index.html',
  'kursy.html',
  'kursy/index.html',
  'kursy/kurscodzienny.html',
  'kursy/kurscodzienny/index.html',
];

if (targetDay === 29) {
  // Revert Hero to Day 29
  for (const f of catalogFiles) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');

    // Hero buttons
    content = content.replace(
      /href="\/akademia\/kurscodzienny\/dzien-30" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ 30 \(30 PAŹDZIERNIKA\)<\/span>\s*<span>→<\/span>\s*<\/a>\s*<a href="\/akademia\/kurscodzienny\/dzien-29" class="cin-btn-secondary min-h-\[48px\]">\s*<span>← DZIEŃ 29<\/span>/g,
      'href="/akademia/kurscodzienny/dzien-29" class="cin-btn-primary min-h-[48px]">\n            <span>CZYTAJ DZIEŃ 29 (29 PAŹDZIERNIKA)</span>\n            <span>→</span>\n          </a>\n          <a href="/akademia/kurscodzienny/dzien-28" class="cin-btn-secondary min-h-[48px]">\n            <span>← DZIEŃ 28</span>'
    );

    // Counter badge
    content = content.replace(
      /Dni 1–30 z 31 Dostępne \(30 Października 2026\)/g,
      'Dni 1–29 z 31 Dostępne (29 Października 2026)'
    );

    // Badges in grid
    // Day 29 card should have DZISIEJSZA LEKCJA
    content = content.replace(
      /(DZIEŃ 29 • 29 PAŹDZIERNIKA 2026<\/span>\s*<span class="[^"]*">)DOSTĘPNA TERAZ(<\/span>)/g,
      '$1DZISIEJSZA LEKCJA$2'
    );
    // Make sure day 29 card has animated pulse and border styling
    content = content.replace(
      /(<!-- KARTA DZIEŃ 29 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-29" class="group block p-5 rounded-2xl bg-\[#0E121A\] )border border-brand-gold\/40 hover:border-amber-500 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-lg shadow-black\/40 flex flex-col/g,
      '$1border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30'
    );
    content = content.replace(
      /(DZIEŃ 29 • 29 PAŹDZIERNIKA 2026<\/span>\s*<span class=")px-2 py-0.5 rounded-full bg-emerald-500\/20 text-emerald-300 text-\[10px\] font-bold border border-emerald-500\/40(")/g,
      '$1px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse$2'
    );

    // Day 30 card badge: DOSTĘPNA 30.10 O PÓŁNOCY (lub DOSTĘPNA WKRÓTCE)
    content = content.replace(
      /(<!-- KARTA DZIEŃ 30 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-30" class="group block p-5 rounded-2xl bg-\[#0E121A\] )border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30/g,
      '$1border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col'
    );
    content = content.replace(
      /(DZIEŃ 30 • 30 PAŹDZIERNIKA 2026<\/span>\s*<span class=")px-2 py-0.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse(">)DZISIEJSZA LEKCJA(<\/span>)/g,
      '$1px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400/90 text-[10px] font-semibold border border-amber-500/30$2OD 30.10 (O PÓŁNOCY)$3'
    );

    fs.writeFileSync(f, content, 'utf8');
    console.log('Set Day 29 active in', f);
  }

  // Update search indexes
  const now = new Date().toISOString();
  for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
    const idx = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const item of idx.items) {
      if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-29') {
        item.title = 'Z Biblią za Pan Brat — Dzień 29 (Lekcja 29 na dziś): Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)';
        const tags = new Set(item.tags || []);
        tags.add('lekcja na dziś');
        tags.add('rozważanie na dziś');
        tags.add('słowo na dziś');
        tags.add('dzisiaj');
        tags.add('dziś');
        tags.add('lekcja 29 na dziś');
        item.tags = [...tags];
      }
      if (item.url === 'https://polskieradio.cc/akademia/kurscodzienny/dzien-30') {
        item.title = 'Z Biblią za Pan Brat — Dzień 30 (Lekcja 30): Błogosławieństwo, obietnica i Lew z Judy (Rdz 48:1–49:33)';
        item.tags = (item.tags || []).filter((t) => !['lekcja na dziś', 'rozważanie na dziś', 'słowo na dziś', 'dzisiaj', 'dziś', 'lekcja 30 na dziś'].includes(t));
      }
    }
    idx.updatedAt = now;
    fs.writeFileSync(f, JSON.stringify(idx, null, 2) + '\n');
  }
  fs.copyFileSync('szukaj/catalog.json', 'data/cc-search-index.json');
  console.log('Search indexes restored: Day 29 is today.');
}
