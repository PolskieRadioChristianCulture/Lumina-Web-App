#!/usr/bin/env node
// Dzień 26 Kursu Codziennego „Z Biblią za Pan Brat” (@007, 25.10.2026).
// Treść lekcji: plik L0 Z_Biblia_za_Pan_Brat_Dzien_26_2026-10-26.docx (tekst w scripts/content/kc-day26-lesson.txt, bez zmian).
// Szablon: strona Dnia 25. Tworzy 4 adresy lekcji, dopisuje „Dzień 26 →” na stronach Dnia 25,
// aktualizuje przyciski, licznik i kartę dnia w Akademii. Uruchom z katalogu repozytorium: node scripts/generate-day26-lesson.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG = '/images/academy/daily/kc_day_26_jozef_od_wiezienia_do_palacu.jpg';
const URL = 'https://polskieradio.cc/akademia/kurscodzienny/dzien-26';
const TITLE = 'OD WIĘZIENIA DO PAŁACU';
const SUB = 'Józef — wierność w oczekiwaniu, mądrość w działaniu i Boża opatrzność (Rdz 40:1–41:57)';
const REF = 'Rdz 40:1–41:57';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/content/kc-day26-lesson.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const at = (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); if (i < 0) throw new Error('Brak sekcji: ' + prefix); return i; };
const between = (a, b) => lines.slice(at(a) + 1, at(b));

// Pary „N. Tytuł (odnośnik)” + objaśnienie
function points(block) {
  const out = [];
  for (let i = 0; i < block.length; i++) {
    if (/^\d+\.\s/.test(block[i]) && block[i + 1] && !/^\d+\.\s/.test(block[i + 1])) { out.push([block[i], block[i + 1]]); i++; }
  }
  return out;
}
const card = (icon, label, inner) => `
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          ${icon}
          <span>${esc(label)}</span>
        </div>
${inner}
      </article>
`;
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const partHeads = lines.filter((l) => /^CZĘŚĆ [IVX]+ — /.test(l));
const nextHead = (h) => { const i = lines.indexOf(h); const rest = lines.slice(i + 1); const j = rest.findIndex((l) => /^CZĘŚĆ [IVX]+ — |^JEZUS W CENTRUM/.test(l)); return rest.slice(0, j); };
const pointHtml = (pairs) => `        <div class="space-y-3 text-zinc-200">\n${pairs.map(([t, d]) => `          <p><strong>${esc(t)}:</strong> ${esc(d)}</p>`).join('\n')}\n        </div>`;
const listHtml = (items, cls = 'list-disc') => `        <ul class="${cls} pl-5 space-y-2 text-zinc-200">\n${items.map((t) => `          <li>${esc(t.replace(/^[•☐]\s*/, '').replace(/^\d+\.\s*/, ''))}</li>`).join('\n')}\n        </ul>`;
const parasHtml = (items) => items.map((t) => `        <p class="text-zinc-200">${esc(t)}</p>`).join('\n');
const titleCase = (h) => h.split(' — ').map((s, k) => (k === 0 ? s.charAt(0) + s.slice(1).toLowerCase() : s.charAt(0) + s.slice(1).toLowerCase())).join(' — ').replace(/rdz/g, 'Rdz');

let body = '';
body += card('<i class="fa-solid fa-compass"></i>', 'Zanim otworzysz Biblię', parasHtml(between('ZANIM OTWORZYSZ BIBLIĘ', 'CZĘŚĆ I —')));
partHeads.forEach((h, k) => {
  const label = titleCase(h);
  body += `
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">${roman[k]}</span>
          <span>${esc(label)}</span>
        </div>
${pointHtml(points(nextHead(h)))}
      </article>
`;
});
body += card('<i class="fa-solid fa-cross"></i>', 'Jezus w centrum — nadzieja, która nie zawodzi', pointHtml(points(between('JEZUS W CENTRUM', 'SPRAWDŹ W BIBLII'))));
body += card('<i class="fa-solid fa-book-bible"></i>', 'Sprawdź w Biblii — teksty porównawcze', listHtml(between('SPRAWDŹ W BIBLII', 'PRAWDA NA DZIŚ')));
body += card('<i class="fa-solid fa-lightbulb"></i>', 'Prawda na dziś', listHtml(between('PRAWDA NA DZIŚ', 'POMYŚL —')));
body += card('<i class="fa-solid fa-heart"></i>', 'Pomyśl — pytania do serca', listHtml(between('POMYŚL —', 'MAŁY QUIZ'), 'list-decimal'));
const decyzja = between('TWOJA DECYZJA', 'MODLITWA NA 26');
body += card('<i class="fa-solid fa-route"></i>', 'Twoja decyzja — wierność w oczekiwaniu',
  parasHtml(decyzja.filter((l) => !l.startsWith('MOJA DECYZJA'))) + '\n' +
  decyzja.filter((l) => l.startsWith('MOJA DECYZJA')).map((l) => `        <p class="text-amber-200 font-semibold">${esc(l)}</p>`).join('\n'));
body += card('<i class="fa-solid fa-hands-praying"></i>', 'Modlitwa na 26 października', parasHtml(between('MODLITWA NA 26', 'ZADANIE NA DZIŚ')).replace(/<p class="text-zinc-200">/g, '<p class="text-zinc-200 font-serif italic">'));
const zadanie = between('ZADANIE NA DZIŚ', 'JUTRO —');
body += card('<i class="fa-solid fa-list-check"></i>', 'Zadanie na dziś', listHtml(zadanie.filter((l) => !/PRZECZYTAŁEM/.test(l)), 'list-none') + '\n        <p class="text-xs text-brand-gold font-bold tracking-wider">✓ PRZECZYTAŁEM • ✓ ZROZUMIAŁEM • ✓ ZASTOSUJĘ</p>');
const jutro = lines.slice(at('JUTRO —'));
body += card('<i class="fa-solid fa-calendar-day"></i>', jutro[0].charAt(0) + jutro[0].slice(1).toLowerCase().replace('października', 'października'), `        <p class="text-white font-semibold">${esc(jutro[1])}</p>\n` + parasHtml(jutro.slice(2)));

// Quiz: pytania i poprawne odpowiedzi dosłownie z pliku L0; dwa błędne warianty dopisane przez @007
const WRONG = [
  ['Dwaj bracia Józefa', 'Dowódca straży i kapłan z On'], ['Ich bogactwo', 'Ich gniew na faraona'], ['Egipskim mędrcom', 'Sobie samemu'],
  ['Siedem', 'Dwie'], ['Śmierć po trzech dniach', 'Ucieczkę z więzienia'], ['O pieniądze', 'O list do braci'],
  ['Siedem krów nad Nilem', 'Kielich faraona'], ['Został ułaskawiony', 'Został zarządcą więzienia'], ['Od razu wstawił się za Józefem', 'Odwiedził Józefa w więzieniu'],
  ['Siedem lat', 'Trzy dni'], ['Trzy tłuste i trzy chude', 'Dwanaście krów'], ['Siedem gałązek winorośli', 'Trzy kosze z pieczywem'],
  ['Piekarz', 'Żona Potifara'], ['Trzy', 'Dwanaście'], ['Trzy', 'Czterdzieści'],
  ['Połowę', 'Jedną dziesiątą'], ['Kapłana w On', 'Dowódcy straży więzienia'], ['Siedemnaście', 'Czterdzieści'],
  ['Ruben i Juda', 'Peres i Zerach'], ['Aby oddać pokłon faraonowi', 'Aby uciec przed wojną'],
];
const quiz = between('MAŁY QUIZ', 'TWOJA DECYZJA').map((l, i) => {
  const [q, a] = l.split('Odpowiedź:').map((s) => s.trim());
  const answer = a.replace(/\s*\([\d:–,\s]+\)\.?$/, '').replace(/\.$/, '');
  const pos = i % 3; const opts = [...WRONG[i]]; opts.splice(pos, 0, answer);
  return { q, a: opts, c: pos };
});
const quizJs = 'const QUIZ_DATA = [\n' + quiz.map((x) => `      ${JSON.stringify(x)}`).join(',\n') + '\n    ];';

// Strona Dnia 26 z szablonu Dnia 25
const tplPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-25.html');
let p = fs.readFileSync(tplPath, 'utf8');
const crlf = p.includes('\r\n'); p = p.split('\r\n').join('\n');
const rep = (a, b, all) => { if (!p.includes(a)) throw new Error('szablon: brak ' + a.slice(0, 60)); p = all ? p.split(a).join(b) : p.replace(a, b); };
const cut = (a, b, ins) => { const i = p.indexOf(a), j = p.indexOf(b, i); if (i < 0 || j < 0) throw new Error('szablon: brak ' + a); p = p.slice(0, i) + ins + p.slice(j); };

rep(/<title>[^<]*<\/title>/.exec(p)[0], `<title>Dzień 26: ${TITLE} (${REF}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
rep(/<meta name="description" content="[^"]*" \/>/.exec(p)[0], `<meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 26 (26 Października 2026). Józef zapomniany w więzieniu, sny faraona i plan na lata obfitości i głodu — ${REF}. Kurs codzienny Pisma Świętego." />`);
rep('https://polskieradio.cc/akademia/kurscodzienny/dzien-25"', `${URL}"`, true);
rep(/<meta property="og:title" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:title" content="Dzień 26: ${TITLE} — Z Biblią za Pan Brat" />`);
rep(/<meta property="og:description" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 26. Wierność w oczekiwaniu i mądrość w działaniu — ${REF}." />`);
rep('https://polskieradio.cc/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg?v=20261025', `https://polskieradio.cc${IMG}?v=20261026`);
rep('<span class="text-amber-400 font-bold">Dzień 25</span>', '<span class="text-amber-400 font-bold">Dzień 26</span>');
rep('<a href="/akademia/kurscodzienny/dzien-24" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 24</a>',
  '<a href="/akademia/kurscodzienny/dzien-25" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 25</a>');
rep('Księga Rodzaju • Miesiąc 1 • Dzień 25 z 31', 'Księga Rodzaju • Miesiąc 1 • Dzień 26 z 31');
rep('25 PAŹDZIERNIKA 2026 • NIEDZIELA', '26 PAŹDZIERNIKA 2026 • PONIEDZIAŁEK');
rep('JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM\n      </h1>', `${TITLE}\n      </h1>`);
rep(/<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">\s*[^<]*<\/p>/.exec(p)[0], `<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        ${esc(SUB)}\n      </p>`);
rep('src="/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg"', `src="${IMG}?v=20261026"`);
rep('alt="Dzień 25: Józef w domu Potifara i w więzieniu — A Pan był z nim (Rdz 38–39)"', `alt="Dzień 26: Od więzienia do pałacu — Józef przed faraonem (${REF})"`);
rep('20 Pytań z Rdz 38–39', '20 Pytań z Rdz 40–41');
rep('<span>Ilustracja biblijna: Józef w Egipcie — Boża obecność w próbie</span>', '<span>Ilustracja biblijna: Józef — od więzienia do pałacu</span>');
rep('<span class="font-mono text-brand-gold">Czytanie: Rdz 38:1–39:23</span>', `<span class="font-mono text-brand-gold">Czytanie: ${REF}</span>`);
rep(/<blockquote class="font-serif italic text-base sm:text-lg text-white">\s*[^<]*<\/blockquote>/.exec(p)[0], '<blockquote class="font-serif italic text-base sm:text-lg text-white">\n          „Czyż wykład snów nie należy do Boga?”\n        </blockquote>');
rep('— Księga Rodzaju 39:21 (UBG)', '— Księga Rodzaju 40:8 (sens wypowiedzi Józefa)');
rep(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*[^<]*<\/div>/.exec(p)[0],
  '<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ' + esc(lines[at('MYŚL PRZEWODNIA')].replace('MYŚL PRZEWODNIA: ', '')) + '\n      </div>');
cut('    <!-- LESSON BODY CONTENT -->', '    <!-- 20-QUESTION QUIZ SECTION -->', `    <!-- LESSON BODY CONTENT (Dzień 26, treść z pliku L0) -->\n    <section class="space-y-6">\n${body}\n    </section>\n\n`);
cut('    const QUIZ_DATA = [', '\n\n    let userAnswers', '    ' + quizJs);
const share = encodeURIComponent(`Dzień 26 Kursu Codziennego Pisma Świętego: Od więzienia do pałacu ${URL}`);
p = p.replace(/https:\/\/api\.whatsapp\.com\/send\?text=[^"]*/, `https://api.whatsapp.com/send?text=${share}`);
p = p.replace(/https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=[^"]*/, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`);
p = p.replace(/https:\/\/x\.com\/intent\/tweet\?text=[^"]*/, `https://x.com/intent/tweet?text=${encodeURIComponent('Dzień 26 Kursu Codziennego Pisma Świętego: Od więzienia do pałacu')}&url=${encodeURIComponent(URL)}`);
rep('Lekcja Dnia 25 została pomyślnie zapisana', 'Lekcja Dnia 26 została pomyślnie zapisana');
rep("'kc_day25_quiz'", "'kc_day26_quiz'", true);
rep("'kc_day25_completed'", "'kc_day26_completed'", true);
if (/dzien-25"|Dzień 25 z|kc_day25|kc_day_25/.test(p.replace('href="/akademia/kurscodzienny/dzien-25" class="px-2.5', ''))) {
  const left = (p.match(/.{0,60}(dzien-25"|kc_day25|kc_day_25).{0,40}/g) || []).filter((m) => !m.includes('← Dzień 25'));
  if (left.length) throw new Error('Zostały odwołania do Dnia 25: ' + left.join(' | '));
}
const out26 = crlf ? p.split('\n').join('\r\n') : p;
for (const f of ['akademia/kurscodzienny/dzien-26.html', 'akademia/kurscodzienny/dzien-26/index.html', 'kursy/kurscodzienny/dzien-26.html', 'kursy/kurscodzienny/dzien-26/index.html']) {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), out26);
}
console.log('Lekcja Dnia 26: 4 adresy, quiz', quiz.length, 'pytań');

// Strony Dnia 25: link „Dzień 26 →”
const next = '<a href="/akademia/kurscodzienny/dzien-26" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 26 →</a>';
for (const f of ['akademia/kurscodzienny/dzien-25.html', 'akademia/kurscodzienny/dzien-25/index.html', 'kursy/kurscodzienny/dzien-25.html', 'kursy/kurscodzienny/dzien-25/index.html']) {
  let h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (h.includes('/akademia/kurscodzienny/dzien-26')) continue;
  const prev = 'min-h-[32px] flex items-center">← Dzień 24</a>';
  if (!h.includes(prev)) throw new Error(f + ': brak linku ← Dzień 24');
  h = h.replace(prev, prev + '\n        ' + next);
  fs.writeFileSync(path.join(ROOT, f), h);
}

// Akademia: przyciski, licznik, karta Dnia 26 (dzisiejsza), Dzień 25 jako dostępny
const card26 = `
          <!-- KARTA DZIEŃ 26 -->
          <a href="/akademia/kurscodzienny/dzien-26" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 26 • 26 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="${IMG}?v=20261026" alt="Dzień 26: ${TITLE} — ${REF}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              ${TITLE}
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Józef zapomniany w więzieniu, sny faraona i mądry plan na lata obfitości i głodu — ${REF}.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>${REF}</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;
const stats = {};
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); const before = h;
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-25(" class="cin-btn-primary min-h-\[48px\]">\s*<span>)CZYTAJ DZIEŃ 25 \(25 PAŹDZIERNIKA\)/g, '$1dzien-26$2CZYTAJ DZIEŃ 26 (26 PAŹDZIERNIKA)');
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-24(" class="cin-btn-secondary min-h-\[48px\]">\s*<span>)← DZIEŃ 24/g, '$1dzien-25$2← DZIEŃ 25');
  h = h.replace(/Dni 1–25 z 31 Dostępne \(25 Października 2026\)/g, 'Dni 1–26 z 31 Dostępne (26 Października 2026)');
  // Dzień 25 przestaje być „dzisiejszą lekcją”
  h = h.replace(/(<!-- KARTA DZIEŃ 25 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-25" class=")group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30"/g,
    '$1group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col"');
  h = h.replace(/(DZIEŃ 25 • 25 PAŹDZIERNIKA 2026<\/span>\s*)<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>/g,
    '$1<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>');
  // Karta 26 po każdej karcie 25
  if (!h.includes('<!-- KARTA DZIEŃ 26 -->')) {
    let idx = 0, n = 0;
    while ((idx = h.indexOf('<!-- KARTA DZIEŃ 25 -->', idx)) !== -1) {
      const end = h.indexOf('</a>', idx) + 4;
      h = h.slice(0, end) + '\n' + card26 + h.slice(end); idx = end + card26.length; n++;
    }
    stats[f] = n;
  }
  if (h !== before) fs.writeFileSync(fp, h);
}
console.log('Karty Dnia 26 dodane:', JSON.stringify(stats));

// Tylko Dzień 26 jako „dzisiejsza lekcja”; wcześniejsze karty (np. 18–20, pozostałe z dawnych synchronizacji) jako dostępne
const HL = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const NORMAL = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const TODAY = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const AVAIL = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';
const fixed = {};
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); let n = 0;
  h = h.replace(/<a href="\/akademia\/kurscodzienny\/dzien-(\d+)" class="([^"]+)">([\s\S]*?)<\/a>/g, (m, day, cls, inner) => {
    if (day === '26' || !inner.includes('DZISIEJSZA LEKCJA')) return m;
    n++;
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${cls === HL ? NORMAL : cls}">${inner.replace(TODAY, AVAIL)}</a>`;
  });
  if (n) { fs.writeFileSync(fp, h); fixed[f] = n; }
}
console.log('Karty poprawione na „dostępna”:', JSON.stringify(fixed));
