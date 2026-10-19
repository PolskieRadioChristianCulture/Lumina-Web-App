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

console.log('🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego...');

// 1. Zaktualizuj akademia.html
let akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');

// A. Popraw ewentualne literówki w linkach dni
akademiaHtml = akademiaHtml.replace(
  'href="/akademia/kurscodzienny/dzien-14" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">\n            <div class="flex items-center justify-between gap-2 mb-3">\n              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 06',
  'href="/akademia/kurscodzienny/dzien-06" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">\n            <div class="flex items-center justify-between gap-2 mb-3">\n              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 06'
);

// B. Zaktualizuj DWA PRZYCISKI HERO w akademia.html
const heroActionsRegex = /<!-- Hero Actions -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
const updatedHeroActions = `<!-- Hero Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="/akademia/kurscodzienny/dzien-19" class="cin-btn-primary min-h-[48px]">
            <span>CZYTAJ DZIEŃ 19 (19 PAŹDZIERNIKA)</span>
            <span>→</span>
          </a>
          <a href="/akademia/kurscodzienny/dzien-18" class="cin-btn-secondary min-h-[48px]">
            <span>← DZIEŃ 18</span>
          </a>
          <a href="#katalog-kurscodzienny" class="cin-btn-secondary min-h-[48px]">
            <span>PRZEGLĄDAJ DNI MIESIĄCA ↓</span>
          </a>
        </div>`;
akademiaHtml = akademiaHtml.replace(heroActionsRegex, updatedHeroActions);

// C. Zaktualizuj licznik dostępnych dni w akademia.html
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ Dostępne \(Październik 2026\)/g,
  'Dni 1–19 z 31 Dostępne (19 Października 2026)'
);
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
  'Dni 1–19 z 31 Dostępne (19 Października 2026)'
);

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
        <a href="/akademia/kurscodzienny/dzien-19" class="cin-btn-primary min-h-[48px]">
          <span>CZYTAJ DZIEŃ 19 (19 PAŹDZIERNIKA)</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-18" class="cin-btn-secondary min-h-[48px]">
          <span>← DZIEŃ 18</span>
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
    'Dni 1–19 z 31 Dostępne (19 Października 2026)'
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
