#!/usr/bin/env node
// Dzień 30 Kursu Codziennego „Z Biblią za Pan Brat” (@A001, 29.10.2026 -> 30.10.2026).
// Treść lekcji: plik L0 (tekst w scripts/content/kc-day30-lesson.txt, bez zmian).
// Szablon: strona Dnia 29 (kanoniczny wzorzec JOMA-D048 / Lekcja 1).
// Tworzy 4 adresy lekcji, dopisuje „Dzień 30 →” na stronach Dnia 29,
// aktualizuje przyciski, licznik i kartę dnia w Akademii.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG = '/images/academy/daily/kc_day_30_blogoslawienstwo_obietnica_i_lew_z_judy.jpg';
const URL = 'https://polskieradio.cc/akademia/kurscodzienny/dzien-30';
const TITLE = 'BŁOGOSŁAWIEŃSTWO, OBIETNICA I LEW Z JUDY';
const SUB = 'Ostatnie słowa Jakuba: przyszłość w rękach wiernego Boga (Rdz 48:1–49:33)';
const REF = 'Rdz 48:1–49:33';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/content/kc-day30-lesson.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const at = (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); if (i < 0) throw new Error('Brak sekcji: ' + prefix); return i; };
const between = (a, b) => lines.slice(at(a) + 1, at(b));

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
const titleCase = (h) => h.split(' — ').map((s, k) => (k === 0 ? s.charAt(0) + s.slice(1).toLowerCase() : s.charAt(0) + s.slice(1).toLowerCase())).join(' — ').replace(/rdz/g, 'Rdz').replace(/jakub/g, 'Jakub').replace(/judy/g, 'Judy').replace(/juda/g, 'Juda').replace(/józef/g, 'Józef').replace(/józefa/g, 'Józefa');

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
body += card('<i class="fa-solid fa-cross"></i>', 'Jezus w centrum — Lew z Judy i Baranek', pointHtml(points(between('JEZUS W CENTRUM', 'SPRAWDŹ W BIBLII'))));
body += card('<i class="fa-solid fa-book-bible"></i>', 'Sprawdź w Biblii — 12 tekstów porównawczych', listHtml(between('SPRAWDŹ W BIBLII', 'PRAWDA NA DZIŚ')));
body += card('<i class="fa-solid fa-lightbulb"></i>', 'Prawda na dziś', listHtml(between('PRAWDA NA DZIŚ', 'POMYŚL —')));
body += card('<i class="fa-solid fa-heart"></i>', 'Pomyśl — pytania do serca', listHtml(between('POMYŚL —', 'MAŁY QUIZ'), 'list-decimal'));
const decyzja = between('TWOJA DECYZJA', 'MODLITWA NA 30');
body += card('<i class="fa-solid fa-route"></i>', 'Twoja decyzja — przekazać wiarę i nadzieję',
  parasHtml(decyzja.filter((l) => !l.startsWith('MOJA DECYZJA'))) + '\n' +
  decyzja.filter((l) => l.startsWith('MOJA DECYZJA')).map((l) => `        <p class="text-amber-200 font-semibold">${esc(l)}</p>`).join('\n'));
body += card('<i class="fa-solid fa-hands-praying"></i>', 'Modlitwa na 30 października', parasHtml(between('MODLITWA NA 30', 'ZADANIE NA DZIŚ')).replace(/<p class="text-zinc-200">/g, '<p class="text-zinc-200 font-serif italic">'));
const zadanie = between('ZADANIE NA DZIŚ', 'JUTRO —');
body += card('<i class="fa-solid fa-list-check"></i>', 'Zadanie na dziś', listHtml(zadanie.filter((l) => !/PRZECZYTAŁEM/.test(l)), 'list-none') + '\n        <p class="text-xs text-brand-gold font-bold tracking-wider">✓ PRZECZYTAŁEM • ✓ ZROZUMIAŁEM • ✓ ZASTOSUJĘ</p>');
const jutro = lines.slice(at('JUTRO —'));
body += card('<i class="fa-solid fa-calendar-day"></i>', jutro[0].charAt(0) + jutro[0].slice(1).toLowerCase(), `        <p class="text-white font-semibold">${esc(jutro[1])}</p>\n` + parasHtml(jutro.slice(2)));

// Quiz: pytania i poprawne odpowiedzi dosłownie z pliku L0; dwa błędne warianty
const WRONG = [
  ['Ruben i Symeon', 'Gerszom i Eliezer'],
  ['W Hebronie', 'W Beer-Szebie'],
  ['Zrobił ich królami Egiptu', 'Zwolnił ich z przymierza obrzezania'],
  ['Lewą', 'Obie ręce położył równo'],
  ['Efraim', 'Byli bliźniętami z jednego dnia'],
  ['Swoim Wojownikiem', 'Swoim Sędzią'],
  ['Odszedł w gniewie do faraona', 'Złożył pokłon przed Efraimem'],
  ['Manasses', 'Obaj mieli pozostać bez potomstwa'],
  ['Że wybudują nową stolicę w Goszen', 'Że nigdy nie opuszczą Egiptu'],
  ['Siedmiu', 'Dziesięciu'],
  ['Juda', 'Józef'],
  ['Zabulon i Dan', 'Gad i Aser'],
  ['Beniamin', 'Efraim'],
  ['Tarcza', 'Złota korona'],
  ['Beniamin', 'Lewi'],
  ['Rdz 48:5', 'Rdz 49:1'],
  ['Jako orła na skale', 'Jako dąb wyniosły'],
  ['Sędzia i Mściciel', 'Twórca i Prawodawca'],
  ['W piramidzie faraona', 'W krainie Goszen w Egipcie'],
  ['Mojżesza', 'Króla Salomona'],
];
const quiz = between('MAŁY QUIZ', 'TWOJA DECYZJA').map((l, i) => {
  const [q, a] = l.split('Odpowiedź:').map((s) => s.trim());
  const answer = a.replace(/\s*\([\d:–,\s;]+\)\.?$/, '').replace(/\.$/, '');
  const pos = i % 3; const opts = [...WRONG[i]]; opts.splice(pos, 0, answer);
  return { q, a: opts, c: pos };
});
const quizJs = 'const QUIZ_DATA = [\n' + quiz.map((x) => `      ${JSON.stringify(x)}`).join(',\n') + '\n    ];';

// Strona Dnia 30 z szablonu Dnia 29
const tplPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-29.html');
let p = fs.readFileSync(tplPath, 'utf8');
const crlf = p.includes('\r\n'); p = p.split('\r\n').join('\n');
const rep = (a, b, all) => { if (!p.includes(a)) throw new Error('szablon: brak ' + a.slice(0, 60)); p = all ? p.split(a).join(b) : p.replace(a, b); };
const cut = (a, b, ins) => { const i = p.indexOf(a), j = p.indexOf(b, i); if (i < 0 || j < 0) throw new Error('szablon: brak ' + a); p = p.slice(0, i) + ins + p.slice(j); };

rep(/<title>[^<]*<\/title>/.exec(p)[0], `<title>Dzień 30: ${TITLE} (${REF}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
rep(/<meta name="description" content="[^"]*" \/>/.exec(p)[0], `<meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 30 (30 Października 2026). Ostatnie słowa Jakuba: błogosławieństwo synów Józefa, proroctwo o Lwie z Judy i nadzieja mesjańska — ${REF}. Kurs codzienny Pisma Świętego." />`);
rep('https://polskieradio.cc/akademia/kurscodzienny/dzien-29"', `${URL}"`, true);
rep(/<meta property="og:title" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:title" content="Dzień 30: ${TITLE} — Z Biblią za Pan Brat" />`);
rep(/<meta property="og:description" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 30. Ostatnie słowa Jakuba: przyszłość w rękach wiernego Boga, błogosławieństwo i Lew z Judy — ${REF}." />`);
rep('https://polskieradio.cc/images/academy/daily/kc_day_29_bog_prowadzi_swoj_lud_do_egiptu.jpg?v=20261029', `https://polskieradio.cc${IMG}?v=20261030`);
rep('<span class="text-amber-400 font-bold">Dzień 29</span>', '<span class="text-amber-400 font-bold">Dzień 30</span>');
rep('<a href="/akademia/kurscodzienny/dzien-28" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 28</a>',
  '<a href="/akademia/kurscodzienny/dzien-29" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 29</a>', true);
rep('Księga Rodzaju • Miesiąc 1 • Dzień 29 z 31', 'Księga Rodzaju • Miesiąc 1 • Dzień 30 z 31');
rep('29 PAŹDZIERNIKA 2026 • CZWARTEK', '30 PAŹDZIERNIKA 2026 • PIĄTEK');
rep('BÓG PROWADZI SWÓJ LUD DO EGIPTU\n      </h1>', `${TITLE}\n      </h1>`);
rep(/<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">\s*[^<]*<\/p>/.exec(p)[0], `<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        ${esc(SUB)}\n      </p>`);
rep('src="/images/academy/daily/kc_day_29_bog_prowadzi_swoj_lud_do_egiptu.jpg?v=20261029"', `src="${IMG}?v=20261030"`);
rep('alt="Dzień 29: Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)"', `alt="Dzień 30: ${TITLE} (${REF})"`);
rep('20 Pytań z Rdz 46–47', '20 Pytań z Rdz 48–49');
rep('<span>Ilustracja biblijna: Bóg prowadzi swój lud do Egiptu</span>', '<span>Ilustracja biblijna: Błogosławieństwo, obietnica i Lew z Judy</span>');
rep('<span class="font-mono text-brand-gold">Czytanie: Rdz 46:1–47:31</span>', `<span class="font-mono text-brand-gold">Czytanie: ${REF}</span>`);
rep(/<blockquote class="font-serif italic text-base sm:text-lg text-white">\s*[^<]*<\/blockquote>/.exec(p)[0], '<blockquote class="font-serif italic text-base sm:text-lg text-white">\n          „Nie oddali się berło od Judy ani laska władcy spomiędzy jego nóg, aż przyjdzie Ten, do którego należy”\n        </blockquote>');
rep('— Księga Rodzaju 46:3 (sens wypowiedzi Boga do Jakuba)', '— Księga Rodzaju 49:10 (sens proroctwa Jakuba)');
rep(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*[^<]*<\/div>/.exec(p)[0],
  '<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ' + esc(lines[at('MYŚL PRZEWODNIA')].replace('MYŚL PRZEWODNIA: ', '')) + '\n      </div>');
cut('    <!-- LESSON BODY CONTENT', '    <!-- 20-QUESTION QUIZ SECTION -->', `    <!-- LESSON BODY CONTENT (Dzień 30, treść z pliku L0) -->\n    <section class="space-y-6">\n${body}\n    </section>\n\n`);
cut('    const QUIZ_DATA = [', '\n\n    let userAnswers', '    ' + quizJs);
const share = encodeURIComponent(`Dzień 30 Kursu Codziennego Pisma Świętego: Błogosławieństwo, obietnica i Lew z Judy ${URL}`);
p = p.replace(/https:\/\/api\.whatsapp\.com\/send\?text=[^"]*/, `https://api.whatsapp.com/send?text=${share}`);
p = p.replace(/https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=[^"]*/, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`);
p = p.replace(/https:\/\/x\.com\/intent\/tweet\?text=[^"]*/, `https://x.com/intent/tweet?text=${encodeURIComponent('Dzień 30 Kursu Codziennego Pisma Świętego: Błogosławieństwo, obietnica i Lew z Judy')}&url=${encodeURIComponent(URL)}`);
rep('Lekcja Dnia 29 została pomyślnie zapisana', 'Lekcja Dnia 30 została pomyślnie zapisana');
rep("'kc_day29_quiz'", "'kc_day30_quiz'", true);
rep("'kc_day29_completed'", "'kc_day30_completed'", true);
if (/dzien-29"|Dzień 29 z|kc_day29|kc_day_29/.test(p.replaceAll('href="/akademia/kurscodzienny/dzien-29" class="px-2.5', ''))) {
  const left = (p.replaceAll('href="/akademia/kurscodzienny/dzien-29" class="px-2.5', '').match(/.{0,60}(dzien-29"|kc_day29|kc_day_29).{0,40}/g) || []).filter((m) => !m.includes('← Dzień 29'));
  if (left.length) throw new Error('Zostały odwołania do Dnia 29: ' + left.join(' | '));
}
const out30 = crlf ? p.split('\n').join('\r\n') : p;
for (const f of ['akademia/kurscodzienny/dzien-30.html', 'akademia/kurscodzienny/dzien-30/index.html', 'kursy/kurscodzienny/dzien-30.html', 'kursy/kurscodzienny/dzien-30/index.html']) {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), out30);
}
console.log('Lekcja Dnia 30: 4 adresy, quiz', quiz.length, 'pytań');

// Strony Dnia 29: link „Dzień 30 →”
const next = '<a href="/akademia/kurscodzienny/dzien-30" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 30 →</a>';
for (const f of ['akademia/kurscodzienny/dzien-29.html', 'akademia/kurscodzienny/dzien-29/index.html', 'kursy/kurscodzienny/dzien-29.html', 'kursy/kurscodzienny/dzien-29/index.html']) {
  let h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (h.includes('/akademia/kurscodzienny/dzien-30')) continue;
  const prev = 'min-h-[32px] flex items-center">← Dzień 28</a>';
  if (!h.includes(prev)) throw new Error(f + ': brak linku ← Dzień 28');
  h = h.replaceAll(prev, prev + '\n        ' + next);
  fs.writeFileSync(path.join(ROOT, f), h);
}

// Akademia: przyciski, licznik, karta Dnia 30 (dzisiejsza), Dzień 29 jako dostępny
const card30 = `
          <!-- KARTA DZIEŃ 30 -->
          <a href="/akademia/kurscodzienny/dzien-30" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 30 • 30 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="${IMG}?v=20261030" alt="Dzień 30: ${TITLE} — ${REF}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              ${TITLE}
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Ostatnie słowa Jakuba: błogosławieństwo synów Józefa ze skrzyżowanymi dłońmi, proroctwo o berle Judy i nadzieja mesjańska — ${REF}.
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
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); const before = h;
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-29(" class="cin-btn-primary min-h-\[48px\]">\s*<span>)CZYTAJ DZIEŃ 29 \(29 PAŹDZIERNIKA\)/g, '$1dzien-30$2CZYTAJ DZIEŃ 30 (30 PAŹDZIERNIKA)');
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-28(" class="cin-btn-secondary min-h-\[48px\]">\s*<span>)← DZIEŃ 28/g, '$1dzien-29$2← DZIEŃ 29');
  h = h.replace(/Dni 1–29 z 31 Dostępne \(29 Października 2026\)/g, 'Dni 1–30 z 31 Dostępne (30 Października 2026)');
  // Dzień 29 przestaje być „dzisiejszą lekcją”
  h = h.replace(/(<!-- KARTA DZIEŃ 29 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-29" class=")group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30"/g,
    '$1group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col"');
  h = h.replace(/(DZIEŃ 29 • 29 PAŹDZIERNIKA 2026<\/span>\s*)<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>/g,
    '$1<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>');
  // Karta 30 po każdej karcie 29
  if (!h.includes('<!-- KARTA DZIEŃ 30 -->')) {
    let idx = 0, n = 0;
    while ((idx = h.indexOf('<!-- KARTA DZIEŃ 29 -->', idx)) !== -1) {
      const end = h.indexOf('</a>', idx) + 4;
      h = h.slice(0, end) + '\n' + card30 + h.slice(end); idx = end + card30.length; n++;
    }
    stats[f] = n;
  }
  if (h !== before) fs.writeFileSync(fp, h);
}
console.log('Karty Dnia 30 dodane:', JSON.stringify(stats));

const HL = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const NORMAL = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const TODAY = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const AVAIL = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';
const fixed = {};
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); let n = 0;
  h = h.replace(/<a href="\/akademia\/kurscodzienny\/dzien-(\d+)" class="([^"]+)">([\s\S]*?)<\/a>/g, (m, day, cls, inner) => {
    if (day === '30' || !inner.includes('DZISIEJSZA LEKCJA')) return m;
    n++;
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${cls === HL ? NORMAL : cls}">${inner.replace(TODAY, AVAIL)}</a>`;
  });
  if (n) { fs.writeFileSync(fp, h); fixed[f] = n; }
}
console.log('Karty poprawione na „dostępna”:', JSON.stringify(fixed));
