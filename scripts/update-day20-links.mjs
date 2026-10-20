import fs from 'node:fs';
import path from 'node:path';

const files = [
  'akademia/kurscodzienny/dzien-20.html',
  'akademia/kurscodzienny/dzien-20/index.html',
  'kursy/kurscodzienny/dzien-20.html',
  'kursy/kurscodzienny/dzien-20/index.html'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(
      'href="#jutro" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 21 →<',
      'href="/akademia/kurscodzienny/dzien-21" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 21 →<'
    );
    c = c.replace(
      '<section class="kc-card border-zinc-700/40" id="jutro">',
      '<section class="kc-card border-zinc-700/40" id="jutro">\n      <div class="mb-3"><a href="/akademia/kurscodzienny/dzien-21" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow transition min-h-[44px]"><span>CZYTAJ DZIEŃ 21 TERAZ</span><span>→</span></a></div>'
    );
    fs.writeFileSync(f, c, 'utf8');
    console.log('✅ Zaktualizowano linki w:', f);
  }
}
