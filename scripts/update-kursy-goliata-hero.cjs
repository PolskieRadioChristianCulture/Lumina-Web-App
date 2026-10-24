const fs = require('fs');

const targets = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/index.html'
];

const oldSection = `<section class="cin-hero scroll-mt-20">
      <div class="cin-hero-inner">
        <div class="cin-hero-content">
          <div class="cin-journey-tag">
            <span class="text-amber-400">⚔️</span> <span>KURS BIBLIJNO-PSYCHOLOGICZNY • 8 KROKÓW • ZERO CLOUD</span>
          </div>

          <h1 class="cin-hero-title">
            <span class="block text-brand-gold">POKONAĆ GOLIATA</span>
            <span class="block text-white text-2xl sm:text-4xl mt-1">JAK ZWYCIĘŻAĆ WŁASNE SŁABOŚCI</span>
          </h1>

          <p class="font-serif text-xl sm:text-2xl text-amber-200/95 font-normal tracking-wide mb-3">
            Interaktywny kurs motywacji i formacji charakteru na podstawie książki Cezarego Rogowskiego
          </p>

          <p class="cin-hero-desc">
            Przejdź od bezsilności i ucieczki do wolności i nowego imienia. Osiem sprawdzonych kroków łączących biblijną prawdę z psychologią zmiany, prywatną kartą pracy w przeglądarce i planem działania na każdy dzień.
          </p>

          <div class="cin-hero-actions">
            <a href="/kursy/pokonac-goliata" class="cin-btn-primary min-h-[48px] px-8 py-3.5 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2">
              <span>ROZPOCZNIJ KURS INTERAKTYWNY →</span>
            </a>
            <a href="/pokonac-goliata" class="cin-btn-secondary min-h-[48px] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <span>📖 CZYTAJ KSIĄŻKĘ ONLINE</span>
            </a>
          </div>

          <div class="cin-hero-meta">
            <div class="cin-meta-item">
              <span class="cin-meta-val">10</span>
              <span class="cin-meta-lbl">MODUŁÓW</span>
            </div>
            <div class="cin-meta-divider"></div>
            <div class="cin-meta-item">
              <span class="cin-meta-val">8</span>
              <span class="cin-meta-lbl">KROKÓW ZWYCIĘSTWA</span>
            </div>
            <div class="cin-meta-divider"></div>
            <div class="cin-meta-item">
              <span class="cin-meta-val">100%</span>
              <span class="cin-meta-lbl">PRYWATNOŚCI LOKALNEJ</span>
            </div>
            <div class="cin-meta-divider"></div>
            <div class="cin-meta-item">
              <span class="cin-meta-val">BEZPŁATNY</span>
              <span class="cin-meta-lbl">DLA KAŻDEGO</span>
            </div>
          </div>
        </div>

        <div class="cin-hero-art">
          <div class="relative w-full max-w-[340px] sm:max-w-[400px] mx-auto">
            <img src="/assets/pokonac-goliata-book-3d.png" alt="Pokonać Goliata — Cezary Rogowski" class="w-full h-auto drop-shadow-[0_20px_50px_rgba(196,163,90,0.3)] object-contain" />
          </div>
        </div>
      </div>
    </section>`;

const newSection = `<section class="relative w-full min-h-[580px] lg:min-h-[640px] pt-24 pb-14 overflow-hidden flex items-center bg-[#050B11] border-b border-amber-500/20">
      <!-- Background Image: David vs Goliath Valley Painting -->
      <div class="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:right_center] sm:bg-[position:65%_center] opacity-90" style="background-image: url('/assets/hero-david-goliath-valley.jpg');"></div>
      
      <!-- Gradient Overlays for Guaranteed Text Readability -->
      <div class="absolute inset-0 z-[1] bg-gradient-to-r from-[#050B11] via-[#050B11]/90 to-transparent sm:w-[65%] w-full pointer-events-none"></div>
      <div class="absolute inset-0 z-[1] bg-gradient-to-t from-[#050B11] via-transparent to-transparent pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Left Column: Copy & Actions -->
          <div class="lg:col-span-8 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4">
              <span>⚔️</span> <span>KURS BIBLIJNO-PSYCHOLOGICZNY • 8 KROKÓW • ZERO CLOUD</span>
            </div>

            <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-3">
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">POKONAĆ GOLIATA</span>
              <span class="block text-white text-2xl sm:text-3xl font-semibold mt-1">JAK ZWYCIĘŻAĆ WŁASNE SŁABOŚCI</span>
            </h1>

            <p class="font-serif text-lg sm:text-xl text-amber-100/90 leading-snug mb-4">
              Chrześcijańsko-psychologiczny, interaktywny<br class="hidden sm:inline" />
              kurs inspiracji i motywacji na podstawie książki Cezarego Rogowskiego
            </p>

            <p class="text-sm sm:text-base text-zinc-300/90 leading-relaxed max-w-xl mb-6">
              Przejdź od bezsilności i ucieczki do wolności i nowego imienia. Osiem sprawdzonych kroków łączących biblijną prawdę z psychologią zmiany, prywatną kartą pracy w przeglądarce i planem działania na każdy dzień.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3 mb-8">
              <a href="/kursy/pokonac-goliata" class="cin-btn-primary min-h-[48px] px-8 py-3.5 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-amber-500/20">
                <span>ROZPOCZNIJ KURS INTERAKTYWNY →</span>
              </a>
              <a href="/pokonac-goliata" class="cin-btn-secondary min-h-[48px] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                <span>📖 CZYTAJ KSIĄŻKĘ ONLINE</span>
              </a>
            </div>

            <!-- Meta Badges -->
            <div class="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-white/10 text-xs text-zinc-300">
              <div>
                <span class="font-bold text-amber-400 text-sm block">10</span>
                <span class="text-[10px] tracking-wider text-zinc-400 uppercase">Modułów</span>
              </div>
              <div class="h-6 w-px bg-white/10"></div>
              <div>
                <span class="font-bold text-amber-400 text-sm block">8</span>
                <span class="text-[10px] tracking-wider text-zinc-400 uppercase">Kroków Zwycięstwa</span>
              </div>
              <div class="h-6 w-px bg-white/10"></div>
              <div>
                <span class="font-bold text-amber-400 text-sm block">100%</span>
                <span class="text-[10px] tracking-wider text-zinc-400 uppercase">Prywatności (Zero Cloud)</span>
              </div>
              <div class="h-6 w-px bg-white/10"></div>
              <div>
                <span class="font-bold text-emerald-400 text-sm block">BEZPŁATNY</span>
                <span class="text-[10px] tracking-wider text-zinc-400 uppercase">Dla każdego</span>
              </div>
            </div>
          </div>

          <!-- Right Column: 3D Book Graphic -->
          <div class="lg:col-span-4 flex justify-center lg:justify-end">
            <div class="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px]">
              <img src="/assets/pokonac-goliata-book-3d.png" alt="Pokonać Goliata — Cezary Rogowski" class="w-full h-auto drop-shadow-[0_20px_50px_rgba(196,163,90,0.35)] object-contain" />
            </div>
          </div>

        </div>
      </div>
    </section>`;

for (const t of targets) {
  if (!fs.existsSync(t)) continue;
  let c = fs.readFileSync(t, 'utf8');
  if (c.includes(oldSection)) {
    c = c.replace(oldSection, newSection);
    fs.writeFileSync(t, c, 'utf8');
    console.log('Replaced hero in:', t);
  } else {
    console.log('oldSection not matched in:', t);
  }
}
