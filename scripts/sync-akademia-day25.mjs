#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const akademiaPath = path.join(ROOT, 'akademia.html');
const akademiaIndexPath = path.join(ROOT, 'akademia/index.html');
const kursyMainHtml = path.join(ROOT, 'kursy.html');
const kursyMainIndex = path.join(ROOT, 'kursy/index.html');
const kurscodziennyPath = path.join(ROOT, 'akademia/kurscodzienny.html');
const kursyHtml = path.join(ROOT, 'kursy/kurscodzienny.html');
const kursyIndex = path.join(ROOT, 'kursy/kurscodzienny/index.html');

console.log('🔄 Rozpoczynam synchronizację Akademii i Kursu Codziennego dla Dnia 25 (25 Października 2026)...');

// Szablony kart 21-25
const dayCards = `
          <!-- KARTA DZIEŃ 21 -->
          <a href="/akademia/kurscodzienny/dzien-21" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 21 • 21 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_21_bog_dziala_niedoskonale_rodziny.jpg" alt="Dzień 21: BÓG DZIAŁA W NIEDOSKONAŁYCH RODZINACH — Rdz 29:1–30:43" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              BÓG DZIAŁA W NIEDOSKONAŁYCH RODZINACH
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Jakub, Laban, Lea i Rachela — ludzka rywalizacja i wierność Bożego przymierza — Rdz 29:1–30:43.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Rdz 29:1–30:43</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 22 -->
          <a href="/akademia/kurscodzienny/dzien-22" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 22 • 22 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg" alt="Dzień 22: JAKUB WALCZY Z BOGIEM NAD JABBOKIEM — Rdz 31:1–32:32" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              JAKUB WALCZY Z BOGIEM NAD JABBOKIEM
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Nocne zmaganie, zwichnięte biodro i nowe imię Izrael — Boża moc w ludzkiej słabości — Rdz 31:1–32:32.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Rdz 31:1–32:32</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 23 -->
          <a href="/akademia/kurscodzienny/dzien-23" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 23 • 23 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_23_pojednanie_i_powrot_do_betel.jpg" alt="Dzień 23: POJEDNANIE I POWRÓT DO BETEL — Rdz 33:1–35:29" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              POJEDNANIE I POWRÓT DO BETEL
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Bóg prowadzi ku pokojowi, oczyszczeniu domu z obcych bogów i odnowieniu przymierza — Rdz 33:1–35:29.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Rdz 33:1–35:29</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 24 -->
          <a href="/akademia/kurscodzienny/dzien-24" class="group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 24 • 24 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_24_jozef_marzenie_zdrada_boza_opatrznosc.jpg" alt="Dzień 24: JÓZEF — MARZENIE, ZDRADA I BOŻA OPATRZNOŚĆ — Rdz 36:1–37:36" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              JÓZEF — MARZENIE, ZDRADA I BOŻA OPATRZNOŚĆ
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Siedemnastoletni Józef sprzedany przez braci do Egiptu — Boża suwerenność ponad ludzkim złem — Rdz 36:1–37:36.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Rdz 36:1–37:36</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>

          <!-- KARTA DZIEŃ 25 -->
          <a href="/akademia/kurscodzienny/dzien-25" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 25 • 25 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg" alt="Dzień 25: JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM — Rdz 38:1–39:23" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Wierność w obliczu pokusy, niesłuszne oskarżenie i Boża łaska w murach więziennych — Rdz 38:1–39:23.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Rdz 38:1–39:23</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

// Funkcja aktualizująca pliki HTML
function updateAkademiaHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // A. Przyciski Hero (Primary i Secondary)
  html = html.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>\s*<span>[^<]*<\/span>\s*<\/a>/g,
    'href="/akademia/kurscodzienny/dzien-25" class="cin-btn-primary min-h-[48px]">\n            <span>CZYTAJ DZIEŃ 25 (25 PAŹDZIERNIKA)</span>\n            <span>→</span>\n          </a>'
  );
  html = html.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>\s*<\/a>/g,
    'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-secondary min-h-[48px]">\n            <span>← DZIEŃ 24</span>\n          </a>'
  );

  // B. Badge licznika dni
  html = html.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–25 z 31 Dostępne (25 Października 2026)'
  );
  html = html.replace(
    /Dni 1–\d+ Dostępne \(Październik 2026\)/g,
    'Dni 1–25 z 31 Dostępne (25 Października 2026)'
  );

  // C. Siatka kart - jeśli nie zawiera Dnia 25
  if (!html.includes('/akademia/kurscodzienny/dzien-25')) {
    if (html.includes('/akademia/kurscodzienny/dzien-21')) {
      const day20End = html.indexOf('<!-- KARTA DZIEŃ 21 -->');
      const gridEnd = html.indexOf('</div>\n      </section>\n\n          <!-- ── WEZWANIE DO DZIAŁANIA');
      if (day20End !== -1 && gridEnd !== -1) {
        html = html.slice(0, day20End) + dayCards.trim() + '\n\n        ' + html.slice(gridEnd);
      }
    } else {
      const day20Idx = html.indexOf('/akademia/kurscodzienny/dzien-20');
      if (day20Idx !== -1) {
        const day20EndTag = html.indexOf('</a>', day20Idx) + '</a>'.length;
        html = html.slice(0, day20EndTag) + '\n' + dayCards + html.slice(day20EndTag);
      }
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Zaktualizowano ${filePath}`);
}

// 1. Zaktualizuj akademia.html, akademia/index.html, kursy.html, kursy/index.html
updateAkademiaHtml(akademiaPath);
updateAkademiaHtml(akademiaIndexPath);
updateAkademiaHtml(kursyMainHtml);
updateAkademiaHtml(kursyMainIndex);

// 2. Zaktualizuj akademia/kurscodzienny.html
if (fs.existsSync(kurscodziennyPath)) {
  let kcHtml = fs.readFileSync(kurscodziennyPath, 'utf8');

  kcHtml = kcHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>\s*<span>[^<]*<\/span>\s*<\/a>/g,
    'href="/akademia/kurscodzienny/dzien-25" class="cin-btn-primary min-h-[48px]">\n          <span>CZYTAJ DZIEŃ 25 (25 PAŹDZIERNIKA)</span>\n          <span>→</span>\n        </a>'
  );
  kcHtml = kcHtml.replace(
    /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>\s*<\/a>/g,
    'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-secondary min-h-[48px]">\n          <span>← DZIEŃ 24</span>\n        </a>'
  );

  kcHtml = kcHtml.replace(
    /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
    'Dni 1–25 z 31 Dostępne (25 Października 2026)'
  );

  if (!kcHtml.includes('/akademia/kurscodzienny/dzien-25')) {
    const day19Idx = kcHtml.lastIndexOf('/akademia/kurscodzienny/dzien-19');
    if (day19Idx !== -1) {
      const day19EndTag = kcHtml.indexOf('</a>', day19Idx) + '</a>'.length;
      kcHtml = kcHtml.slice(0, day19EndTag) + '\n' + dayCards + kcHtml.slice(day19EndTag);
    }
  }

  fs.writeFileSync(kurscodziennyPath, kcHtml, 'utf8');
  console.log(`✅ Zaktualizowano ${kurscodziennyPath}`);
}

// 3. Zaktualizuj kursy/kurscodzienny.html i index.html
[kursyHtml, kursyIndex].forEach(p => {
  if (fs.existsSync(p)) {
    let html = fs.readFileSync(p, 'utf8');
    html = html.replace(
      /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-primary min-h-\[48px\]">\s*<span>CZYTAJ DZIEŃ \d+ \([^)]+\)<\/span>\s*<span>[^<]*<\/span>\s*<\/a>/g,
      'href="/akademia/kurscodzienny/dzien-25" class="cin-btn-primary min-h-[48px]">\n          <span>CZYTAJ DZIEŃ 25 (25 PAŹDZIERNIKA)</span>\n          <span>→</span>\n        </a>'
    );
    html = html.replace(
      /href="\/akademia\/kurscodzienny\/dzien-\d+" class="cin-btn-secondary min-h-\[48px\]">\s*<span>←? ?DZIEŃ \d+<\/span>\s*<\/a>/g,
      'href="/akademia/kurscodzienny/dzien-24" class="cin-btn-secondary min-h-[48px]">\n          <span>← DZIEŃ 24</span>\n        </a>'
    );
    html = html.replace(
      /Dni 1–\d+ z 31 Dostępne[^\n<]*/g,
      'Dni 1–25 z 31 Dostępne (25 Października 2026)'
    );
    fs.writeFileSync(p, html, 'utf8');
    console.log(`✅ Zaktualizowano ${p}`);
  }
});

// 4. Mirror do LUMINA
[akademiaPath, akademiaIndexPath, kursyMainHtml, kursyMainIndex, kurscodziennyPath, kursyHtml, kursyIndex].forEach(src => {
  const rel = path.relative(ROOT, src);
  const dst = path.join(LUMINA_ROOT, rel);
  if (fs.existsSync(src)) {
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`✅ Skopiowano do LUMINA: ${rel}`);
  }
});

console.log('🎉 Synchronizacja CTA, licznika i kafelków Dnia 25 pomyślnie ukończona!');
