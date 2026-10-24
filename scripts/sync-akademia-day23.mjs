#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const akademiaPath = path.join(ROOT, 'akademia.html');
const kurscodziennyPath = path.join(ROOT, 'akademia/kurscodzienny.html');
const akademiaDir = path.join(ROOT, 'akademia/kurscodzienny');
const kursyDir = path.join(ROOT, 'kursy/kurscodzienny');
const kursyHtml = path.join(ROOT, 'kursy/kurscodzienny.html');
const kursyIndex = path.join(ROOT, 'kursy/kurscodzienny/index.html');

console.log('🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego (Dzień 23)...');

let akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');

// 1. Zaktualizuj DWA PRZYCISKI HERO w akademia.html
const heroActionsRegex = /<!-- Hero Actions -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
const updatedHeroActions = `<!-- Hero Actions -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="/akademia/kurscodzienny/dzien-23" class="cin-btn-primary min-h-[48px]">
            <span>CZYTAJ DZIEŃ 23 (23 PAŹDZIERNIKA)</span>
            <span>→</span>
          </a>
          <a href="/akademia/kurscodzienny/dzien-22" class="cin-btn-secondary min-h-[48px]">
            <span>← DZIEŃ 22</span>
          </a>
          <a href="#katalog-kurscodzienny" class="cin-btn-secondary min-h-[48px]">
            <span>PRZEGLĄDAJ DNI MIESIĄCA ↓</span>
          </a>
        </div>`;
akademiaHtml = akademiaHtml.replace(heroActionsRegex, updatedHeroActions);

// 2. Zaktualizuj licznik dostępnych dni w akademia.html
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ Dostępne \(Październik 2026\)/g,
  'Dni 1–23 z 31 Dostępne (23 Października 2026)'
);
akademiaHtml = akademiaHtml.replace(
  /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
  'Dni 1–23 z 31 Dostępne (23 Października 2026)'
);

// 3. Zmień kartę Dnia 22 na DOSTĘPNA TERAZ
akademiaHtml = akademiaHtml.replace(
  /<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>\s*<\/div>\s*<!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\s*<div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold\/20">\s*<img src="\/images\/academy\/daily\/kc_day_22_jakub_walczy_z_bogiem_jabbok\.jpg/,
  '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>\n            </div>\n\n            <!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\n            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">\n              <img src="/images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg'
);
akademiaHtml = akademiaHtml.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-22" class="group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30">/,
  '<a href="/akademia/kurscodzienny/dzien-22" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">'
);

// 4. Karta Dnia 23
const day23Card = `
          <!-- KARTA DZIEŃ 23 -->
          <a href="/akademia/kurscodzienny/dzien-23" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 23 • 23 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>

            <!-- MINIATURA GRAFIKI TEMATYCZNEJ -->
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_23_pojednanie_i_powrot_do_betel.jpg" alt="Dzień 23: POJEDNANIE I POWRÓT DO BETEL — Rdz 33:1–35:29" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>

            <h3 class="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-2 line-clamp-2">
              POJEDNANIE I POWRÓT DO BETEL
            </h3>
            <p class="text-xs text-zinc-400 mb-4 line-clamp-2">
              Bóg prowadzi ku pokojowi, oczyszczeniu domu z obcych bogów i odnowieniu przymierza.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="font-mono text-zinc-500">Rdz 33:1–35:29</span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

if (!akademiaHtml.includes('/akademia/kurscodzienny/dzien-23')) {
  const day22Anchor = '/akademia/kurscodzienny/dzien-22';
  const day22Idx = akademiaHtml.indexOf(day22Anchor);
  if (day22Idx !== -1) {
    const day22EndTag = akademiaHtml.indexOf('</a>', day22Idx) + '</a>'.length;
    akademiaHtml = akademiaHtml.slice(0, day22EndTag) + '\n' + day23Card + akademiaHtml.slice(day22EndTag);
  } else {
    const gridEnd = '</div>\n      </section>\n\n          <!-- ── WEZWANIE DO DZIAŁANIA: ZOSTAŃ PATRONEM KURSU CODZIENNEGO ── -->';
    if (akademiaHtml.includes(gridEnd)) {
      akademiaHtml = akademiaHtml.replace(gridEnd, day23Card + '\n' + gridEnd);
    }
  }
}

fs.writeFileSync(akademiaPath, akademiaHtml, 'utf8');
fs.writeFileSync(path.join(ROOT, 'akademia/index.html'), akademiaHtml, 'utf8');
fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia.html'), akademiaHtml, 'utf8');
fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia/index.html'), akademiaHtml, 'utf8');
console.log('✅ Zaktualizowano akademia.html i mirrory');

// 5. Zaktualizuj akademia/kurscodzienny.html
if (fs.existsSync(kurscodziennyPath)) {
  let kurscodziennyHtml = fs.readFileSync(kurscodziennyPath, 'utf8');

  const heroCtaRegex = /<!-- CTA Buttons -->\s*<div class="flex flex-wrap items-center justify-center gap-4">[\s\S]*?<\/div>/;
  const updatedHeroCta = `<!-- CTA Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/akademia/kurscodzienny/dzien-23" class="cin-btn-primary min-h-[48px]">
          <span>CZYTAJ DZIEŃ 23 (23 PAŹDZIERNIKA)</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-22" class="cin-btn-secondary min-h-[48px]">
          <span>← DZIEŃ 22</span>
        </a>
        <a href="/akademia/kurscodzienny/dzien-01" class="cin-btn-secondary min-h-[48px]">
          <span>OD POCZĄTKU (DZIEŃ 1)</span>
        </a>
        <a href="#katalog-dni" class="cin-btn-secondary min-h-[48px]">
          <span>SPIS DNI ↓</span>
        </a>
      </div>`;
  kurscodziennyHtml = kurscodziennyHtml.replace(heroCtaRegex, updatedHeroCta);

  kurscodziennyHtml = kurscodziennyHtml.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–23 z 31 Dostępne (23 Października 2026)'
  );

  // Karta dnia 22 na DOSTĘPNA TERAZ
  kurscodziennyHtml = kurscodziennyHtml.replace(
    /<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>\s*<\/div>\s*<!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\s*<div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold\/20">\s*<img src="\/images\/academy\/daily\/kc_day_22_jakub_walczy_z_bogiem_jabbok\.jpg/,
    '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>\n            </div>\n\n            <!-- MINIATURA GRAFIKI TEMATYCZNEJ -->\n            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">\n              <img src="/images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg'
  );

  if (!kurscodziennyHtml.includes('/akademia/kurscodzienny/dzien-23')) {
    const day22Anchor = '/akademia/kurscodzienny/dzien-22';
    const day22Idx = kurscodziennyHtml.indexOf(day22Anchor);
    if (day22Idx !== -1) {
      const day22EndTag = kurscodziennyHtml.indexOf('</a>', day22Idx) + '</a>'.length;
      kurscodziennyHtml = kurscodziennyHtml.slice(0, day22EndTag) + '\n' + day23Card + kurscodziennyHtml.slice(day22EndTag);
    }
  }

  fs.writeFileSync(kurscodziennyPath, kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'akademia/kurscodzienny/index.html'), kurscodziennyHtml, 'utf8');
  fs.writeFileSync(kursyHtml, kurscodziennyHtml, 'utf8');
  fs.writeFileSync(kursyIndex, kurscodziennyHtml, 'utf8');

  fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia/kurscodzienny.html'), kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia/kurscodzienny/index.html'), kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'kursy/kurscodzienny.html'), kurscodziennyHtml, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'kursy/kurscodzienny/index.html'), kurscodziennyHtml, 'utf8');
  console.log('✅ Zaktualizowano kurscodzienny.html we wszystkich ścieżkach');
}

// 6. Zaktualizuj Dzień 22 link do Dnia 23
const day22Path = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
if (fs.existsSync(day22Path)) {
  let d22 = fs.readFileSync(day22Path, 'utf8');
  d22 = d22.replace('href="#jutro" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 23 →</a>', 'href="/akademia/kurscodzienny/dzien-23" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 23 →</a>');
  fs.writeFileSync(day22Path, d22, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'akademia/kurscodzienny/dzien-22/index.html'), d22, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'kursy/kurscodzienny/dzien-22.html'), d22, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'kursy/kurscodzienny/dzien-22/index.html'), d22, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-22.html'), d22, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-22/index.html'), d22, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-22.html'), d22, 'utf8');
  fs.writeFileSync(path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-22/index.html'), d22, 'utf8');
  console.log('✅ Zaktualizowano linki w Dniu 22');
}

console.log('✨ Synchronizacja Dnia 23 zakończona sukcesem!');
