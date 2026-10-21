#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const akademiaPath = path.join(ROOT, 'akademia.html');
const kurscodziennyPath = path.join(ROOT, 'akademia/kurscodzienny.html');
const akademiaDir = path.join(ROOT, 'akademia/kurscodzienny');
const kursyDir = path.join(ROOT, 'kursy/kurscodzienny');
const kursyHtml = path.join(ROOT, 'kursy/kurscodzienny.html');
const kursyIndex = path.join(ROOT, 'kursy/kurscodzienny/index.html');

console.log('🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego (Dzień 22)...');

// 1. Zaktualizuj akademia.html
let akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');

// A. Zaktualizuj DWA PRZYCISKI HERO w akademia.html
const heroActionsRegex = /<!-- Hero Actions -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
const updatedHeroActions = `<!-- Hero Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="/akademia/kurscodzienny/dzien-22" class="cin-btn-primary min-h-[48px]">
            <span>CZYTAJ DZIEŃ 22 (22 PAŹDZIERNIKA)</span>
            <span>→</span>
          </a>
          <a href="/akademia/kurscodzienny/dzien-21" class="cin-btn-secondary min-h-[48px]">
            <span>← DZIEŃ 21</span>
          </a>
          <a href="#katalog-kurscodzienny" class="cin-btn-secondary min-h-[48px]">
            <span>PRZEGLĄDAJ DNI MIESIĄCA ↓</span>
          </a>
        </div>`;
akademiaHtml = akademiaHtml.replace(heroActionsRegex, updatedHeroActions);

// B. Zaktualizuj licznik dostępnych dni w akademia.html
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ Dostępne \(Październik 2026\)/g,
  'Dni 1–22 z 31 Dostępne (22 Października 2026)'
);
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
  'Dni 1–22 z 31 Dostępne (22 Października 2026)'
);

// C. Zaktualizuj kartę Dnia 21 na DOSTĘPNA TERAZ
akademiaHtml = akademiaHtml.replace(
  /<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>\s*<\/div>\s*<!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\s*<div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold\/20">\s*<img src="\/images\/academy\/daily\/kc_day_21_bog_dziala_niedoskonale_rodziny\.jpg/,
  '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>\n            </div>\n\n            <!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\n            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">\n              <img src="/images/academy/daily/kc_day_21_bog_dziala_niedoskonale_rodziny.jpg'
);
akademiaHtml = akademiaHtml.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-21" class="group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30">/,
  '<a href="/akademia/kurscodzienny/dzien-21" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">'
);

// D. Dodaj kartę Dnia 22 jeśli jej nie ma
if (!akademiaHtml.includes('/akademia/kurscodzienny/dzien-22')) {
  const day22Card = `
          <!-- KARTA DZIEŃ 22 -->
          <a href="/akademia/kurscodzienny/dzien-22" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 22 • 22 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>

            <!-- MINIATURA GRAFIKI TEMATYCZNEJ -->
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg?v=20261022" alt="Dzień 22: JAKUB WALCZY Z BOGIEM — PRZEMIANA CZŁOWIEKA — Rdz 31:1–32:32" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent"></div>
            </div>

            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              JAKUB WALCZY Z BOGIEM — PRZEMIANA CZŁOWIEKA
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Noc nad Jabbokiem, złamanie samowystarczalności i nowe imię Izrael — Rdz 31:1–32:32.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Księga Rodzaju 31:1–32:32</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>
`;
  // Wstaw za kartą Dnia 21
  const day21EndTag = 'Księga Rodzaju 29:1–30:43</span>\n              </span>\n              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">\n                <span>Studiuj</span>\n                <span>→</span>\n              </span>\n            </div>\n          </a>';
  if (akademiaHtml.includes(day21EndTag)) {
    akademiaHtml = akademiaHtml.replace(day21EndTag, day21EndTag + '\n' + day22Card);
  } else {
    // Wstaw przed zamknięciem siatki kart
    const gridEnd = '</div>\n      </section>\n\n          <!-- ── WEZWANIE DO DZIAŁANIA: ZOSTAŃ PATRONEM KURSU CODZIENNEGO ── -->';
    if (akademiaHtml.includes(gridEnd)) {
      akademiaHtml = akademiaHtml.replace(gridEnd, day22Card + '\n' + gridEnd);
    }
  }
}

fs.writeFileSync(akademiaPath, akademiaHtml, 'utf8');
console.log('✅ Zaktualizowano akademia.html');

// Zsynchronizuj akademia/index.html, kursy.html oraz kursy/index.html
fs.writeFileSync(path.join(ROOT, 'akademia/index.html'), akademiaHtml, 'utf8');
fs.writeFileSync(path.join(ROOT, 'kursy.html'), akademiaHtml, 'utf8');
fs.mkdirSync(path.join(ROOT, 'kursy'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'kursy/index.html'), akademiaHtml, 'utf8');
console.log('✅ Zsynchronizowano akademia/index.html, kursy.html oraz kursy/index.html');

// 2. Pobierz wszystkie karty z akademia.html i zaktualizuj akademia/kurscodzienny.html
const cardsMatch = akademiaHtml.match(/<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">([\s\S]*?)<\/div>\s*<\/section>\s*<!-- ── WEZWANIE DO DZIAŁANIA/);

if (cardsMatch && cardsMatch[1]) {
  const allCardsHtml = cardsMatch[1].trim();

  let kurscodziennyHtml = fs.readFileSync(kurscodziennyPath, 'utf8');

  // Zaktualizuj DWA PRZYCISKI HERO w kurscodzienny.html
  const heroCtaRegex = /<!-- CTA Buttons -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
  const updatedHeroCta = `<!-- CTA Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/akademia/kurscodzienny/dzien-22" class="cin-btn-primary min-h-[48px]">
          <span>CZYTAJ DZIEŃ 22 (22 PAŹDZIERNIKA)</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-21" class="cin-btn-secondary min-h-[48px]">
          <span>← DZIEŃ 21</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-01" class="cin-btn-secondary min-h-[48px]">
          <span>OD POCZĄTKU (DZIEŃ 1)</span>
        </a>
        <a href="#katalog-dni" class="cin-btn-secondary min-h-[48px]">
          <span>SPIS DNI ↓</span>
        </a>
      </div>`;
  kurscodziennyHtml = kurscodziennyHtml.replace(heroCtaRegex, updatedHeroCta);

  // Zaktualizuj licznik w kurscodzienny.html
  kurscodziennyHtml = kurscodziennyHtml.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–22 z 31 Dostępne (22 Października 2026)'
  );

  // Zaktualizuj siatkę kart w kurscodzienny.html
  const gridRegex = /<!-- SIATKA DNI -->\s*<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?<\/div>\s*<\/section>/;
  const updatedGrid = `<!-- SIATKA DNI -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${allCardsHtml}
      </div>
    </section>`;
  kurscodziennyHtml = kurscodziennyHtml.replace(gridRegex, updatedGrid);

  fs.writeFileSync(kurscodziennyPath, kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'akademia/kurscodzienny/index.html'), kurscodziennyHtml, 'utf8');
  console.log('✅ Zaktualizowano akademia/kurscodzienny.html oraz akademia/kurscodzienny/index.html');

  // Zsynchronizuj z kursy/kurscodzienny.html oraz kursy/kurscodzienny/index.html
  fs.mkdirSync(path.dirname(kursyHtml), { recursive: true });
  fs.copyFileSync(kurscodziennyPath, kursyHtml);
  fs.mkdirSync(path.dirname(kursyIndex), { recursive: true });
  fs.copyFileSync(kurscodziennyPath, kursyIndex);
  console.log('✅ Zsynchronizowano kursy/kurscodzienny.html oraz kursy/kurscodzienny/index.html');
}

// 3. Zsynchronizuj wszystkie pliki lekcji dzienne do kursy/kurscodzienny/
if (fs.existsSync(akademiaDir)) {
  fs.mkdirSync(kursyDir, { recursive: true });
  const entries = fs.readdirSync(akademiaDir, { withFileTypes: true });
  let syncedFiles = 0;
  for (const entry of entries) {
    const src = path.join(akademiaDir, entry.name);
    const dst = path.join(kursyDir, entry.name);
    if (entry.isFile() && entry.name.startsWith('dzien-')) {
      fs.copyFileSync(src, dst);
      syncedFiles++;
    } else if (entry.isDirectory() && entry.name.startsWith('dzien-')) {
      fs.cpSync(src, dst, { recursive: true });
      syncedFiles++;
    }
  }
  console.log(`✅ Zsynchronizowano ${syncedFiles} plików/katalogów lekcji do kursy/kurscodzienny/`);
}

console.log('✨ Synchronizacja Akademii i Kursu Codziennego zakończona sukcesem!');
