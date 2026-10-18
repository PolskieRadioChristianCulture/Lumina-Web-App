const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const akademiaPath = path.join(ROOT, 'akademia.html');
let html = fs.readFileSync(akademiaPath, 'utf8');

// Normalize line endings for replacement or use regex/normalize
const isCRLF = html.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

// 1. Tab badge
html = html.replace(
  '<span class="cin-tab-badge">27 LEKCJI</span>',
  '<span class="cin-tab-badge">28 LEKCJI</span>'
);

// 2. Headings & copy
html = html.replace(
  'WIDOK KURSU 2: APOKALIPSA – KSIĘGA NADZIEI (27 LEKCJI)',
  'WIDOK KURSU 2: APOKALIPSA – KSIĘGA NADZIEI (28 LEKCJI)'
);

html = html.replace(
  'STUDIO DOBREGO SŁOWA • 27 LEKCJI • SOLA SCRIPTURA',
  'STUDIO DOBREGO SŁOWA • 28 LEKCJI • SOLA SCRIPTURA'
);

html = html.replace(
  'PRZEGLĄDAJ 27 LEKCJI ↓',
  'PRZEGLĄDAJ 28 LEKCJI ↓'
);

html = html.replace(
  'Każda z 27 lekcji zawiera pełne studium biblijne',
  'Każda z 28 lekcji zawiera pełne studium biblijne'
);

html = html.replace(
  '<span>✓ 27 dedykowanych podstron</span>',
  '<span>✓ 28 dedykowanych podstron</span>'
);

html = html.replace(
  '<span>27 Lekcji Kursu — Jedna Podstrona na Lekcję</span>',
  '<span>28 Lekcji Kursu — Jedna Podstrona na Lekcję</span>'
);

html = html.replace(
  '27 Lekcji Dostępnych',
  '28 Lekcji Dostępnych'
);

// 3. Card badges: LEKCJA XX / 27 -> LEKCJA XX / 28
html = html.replace(/(LEKCJA \d{2}) \/ 27/g, '$1 / 28');

// 4. In Lekcja 27 card, replace PREMIERA with duration
html = html.replace(
  '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>',
  '<span class="text-[11px] text-zinc-500 font-mono"><i class="fa-solid fa-play text-red-500 mr-1 text-[9px]"></i>58:45</span>'
);

// 5. Insert Lekcja 28 card right after Lekcja 27 card
const lekcja27Anchor = 'href="/akademia/apokalipsa/lekcja-27"';
const lekcja27Idx = html.indexOf(lekcja27Anchor);
if (lekcja27Idx === -1) {
  console.error('ERROR: Could not find lekcja-27 in akademia.html');
  process.exit(1);
}

const lekcja27CardClose = html.indexOf('</a>', lekcja27Idx);
if (lekcja27CardClose === -1) {
  console.error('ERROR: Could not find closing </a> for lekcja-27 in akademia.html');
  process.exit(1);
}

const lekcja28Card = `${eol}    <a href="/akademia/apokalipsa/lekcja-28" class="group block p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/50 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 28 / 28</span>
        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>
      </div>
      <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
        ZAPOMNIANY DZIEŃ BOGA — Apokalipsa 14:7
      </h3>
      <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">Apokalipsa 14:7 i 2 Mojżeszowa 20:8–11 — Pieczęć Stwórcy, IV Przykazanie i wielki spór o autorytet Boga</p>
      <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-zinc-500 flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
          <span>Ap 14:7; Wj 20:8–11; Rdz 2:1–3</span>
        </span>
        <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Studiuj</span>
          <span>→</span>
        </span>
      </div>
    </a>`;

html = html.substring(0, lekcja27CardClose + 4) + lekcja28Card + html.substring(lekcja27CardClose + 4);

fs.writeFileSync(akademiaPath, html, 'utf8');
console.log('✅ Zaktualizowano akademia.html.');

// Synchronizacja kopii: kursy.html, akademia/index.html, kursy/index.html
fs.writeFileSync(path.join(ROOT, 'kursy.html'), html, 'utf8');
fs.writeFileSync(path.join(ROOT, 'akademia', 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(ROOT, 'kursy', 'index.html'), html, 'utf8');
console.log('✅ Zsynchronizowano kursy.html, akademia/index.html i kursy/index.html.');
