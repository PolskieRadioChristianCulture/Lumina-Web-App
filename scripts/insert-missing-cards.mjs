#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const cards21to25 = `
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

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Brak pliku:', filePath);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  // Sprawdź czy siatka zawiera KARTA DZIEŃ 25
  if (html.includes('<!-- KARTA DZIEŃ 25 -->')) {
    console.log(`ℹ️ Plik ${filePath} ma już KARTA DZIEŃ 25.`);
    return;
  }

  // Szukamy KARTA DZIEŃ 20
  const d20Anchor = '<!-- KARTA DZIEŃ 20 -->';
  const d20Idx = html.indexOf(d20Anchor);
  if (d20Idx !== -1) {
    // Znajdź koniec tagu </a> dla Dnia 20
    const endTag = '</a>';
    const closeIdx = html.indexOf(endTag, d20Idx);
    if (closeIdx !== -1) {
      const insertPos = closeIdx + endTag.length;
      html = html.slice(0, insertPos) + '\n' + cards21to25 + html.slice(insertPos);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ Pomyślnie wstawiono karty 21-25 do: ${filePath}`);
      return;
    }
  }

  // Fallback: jeśli nie ma komentarza KARTA DZIEŃ 20, szukaj /akademia/kurscodzienny/dzien-20
  const d20Link = '/akademia/kurscodzienny/dzien-20"';
  const linkIdx = html.lastIndexOf(d20Link);
  if (linkIdx !== -1) {
    const endTag = '</a>';
    const closeIdx = html.indexOf(endTag, linkIdx);
    if (closeIdx !== -1) {
      const insertPos = closeIdx + endTag.length;
      html = html.slice(0, insertPos) + '\n' + cards21to25 + html.slice(insertPos);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ Pomyślnie wstawiono karty 21-25 (via link) do: ${filePath}`);
      return;
    }
  }

  console.warn(`⚠️ Nie znaleziono Dnia 20 w: ${filePath}`);
}

const files = [
  path.join(ROOT, 'akademia.html'),
  path.join(ROOT, 'akademia/index.html'),
  path.join(ROOT, 'kursy.html'),
  path.join(ROOT, 'kursy/index.html'),
  path.join(ROOT, 'akademia/kurscodzienny.html'),
  path.join(ROOT, 'kursy/kurscodzienny.html'),
  path.join(ROOT, 'kursy/kurscodzienny/index.html')
];

for (const f of files) {
  processFile(f);
  // Mirror to LUMINA
  const rel = path.relative(ROOT, f);
  const dst = path.join(LUMINA_ROOT, rel);
  if (fs.existsSync(f)) {
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(f, dst);
    console.log(`✅ Skopiowano do LUMINA: ${rel}`);
  }
}

console.log('🎉 Wstawianie brakujących kart zakończone!');
