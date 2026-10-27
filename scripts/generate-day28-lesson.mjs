#!/usr/bin/env node
// Dzień 28 Kursu Codziennego „Z Biblią za Pan Brat” (@A001, 27.10.2026 -> 28.10.2026).
// Treść lekcji: plik L0 (tekst w scripts/content/kc-day28-lesson.txt, bez zmian).
// Szablon: strona Dnia 27 (kanoniczny wzorzec JOMA-D048 / Lekcja 1).
// Tworzy 4 adresy lekcji, dopisuje „Dzień 28 →” na stronach Dnia 27,
// aktualizuje przyciski, licznik i kartę dnia w Akademii.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG = '/images/academy/daily/kc_day_28_ja_jestem_jozef_przebaczenie_zamiast_zemsty.jpg';
const URL = 'https://polskieradio.cc/akademia/kurscodzienny/dzien-28';
const TITLE = '„JA JESTEM JÓZEF” — PRZEBACZENIE ZAMIAST ZEMSTY';
const SUB = 'Gdy odpowiedzialność zastępuje zdradę, a łaska otwiera drogę do pojednania (Rdz 44:1–45:28)';
const REF = 'Rdz 44:1–45:28';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/content/kc-day28-lesson.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
const titleCase = (h) => h.split(' — ').map((s, k) => (k === 0 ? s.charAt(0) + s.slice(1).toLowerCase() : s.charAt(0) + s.slice(1).toLowerCase())).join(' — ').replace(/rdz/g, 'Rdz').replace(/jakub/g, 'Jakub').replace(/beniaminem/g, 'Beniaminem').replace(/beniamina/g, 'Beniamina').replace(/juda/g, 'Juda').replace(/józef/g, 'Józef').replace(/„ja/g, '„Ja');

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
body += card('<i class="fa-solid fa-cross"></i>', 'Jezus w centrum — przebaczenie, zastępstwo i opatrzność', pointHtml(points(between('JEZUS W CENTRUM', 'SPRAWDŹ W BIBLII'))));
body += card('<i class="fa-solid fa-book-bible"></i>', 'Sprawdź w Biblii — 12 tekstów porównawczych', listHtml(between('SPRAWDŹ W BIBLII', 'PRAWDA NA DZIŚ')));
body += card('<i class="fa-solid fa-lightbulb"></i>', 'Prawda na dziś', listHtml(between('PRAWDA NA DZIŚ', 'POMYŚL —')));
body += card('<i class="fa-solid fa-heart"></i>', 'Pomyśl — pytania do refleksji', listHtml(between('POMYŚL —', 'MAŁY QUIZ'), 'list-decimal'));
const decyzja = between('TWOJA DECYZJA', 'MODLITWA NA 28');
body += card('<i class="fa-solid fa-route"></i>', 'Twoja decyzja — przebaczenie z prawdą',
  parasHtml(decyzja.filter((l) => !l.startsWith('MOJA DECYZJA'))) + '\n' +
  decyzja.filter((l) => l.startsWith('MOJA DECYZJA')).map((l) => `        <p class="text-amber-200 font-semibold">${esc(l)}</p>`).join('\n'));
body += card('<i class="fa-solid fa-hands-praying"></i>', 'Modlitwa na 28 października', parasHtml(between('MODLITWA NA 28', 'ZADANIE NA DZIŚ')).replace(/<p class="text-zinc-200">/g, '<p class="text-zinc-200 font-serif italic">'));
const zadanie = between('ZADANIE NA DZIŚ', 'JUTRO —');
body += card('<i class="fa-solid fa-list-check"></i>', 'Zadanie na dziś', listHtml(zadanie.filter((l) => !/PRZECZYTAŁEM/.test(l)), 'list-none') + '\n        <p class="text-xs text-brand-gold font-bold tracking-wider">✓ PRZECZYTAŁEM • ✓ ZROZUMIAŁEM • ✓ ZASTOSUJĘ</p>');
const jutro = lines.slice(at('JUTRO —'));
body += card('<i class="fa-solid fa-calendar-day"></i>', jutro[0].charAt(0) + jutro[0].slice(1).toLowerCase(), `        <p class="text-white font-semibold">${esc(jutro[1])}</p>\n` + parasHtml(jutro.slice(2)));

// Quiz: pytania i poprawne odpowiedzi dosłownie z pliku L0; dwa błędne warianty
const WRONG = [
  ['Pierścień faraona', 'Szaty wielobarwne'],
  ['Dowódca straży Potifar', 'Podczaszy faraona'],
  ['Od najmłodszego Beniamina', 'Od worka Judy'],
  ['U Rubena', 'U Symeona'],
  ['Uciekli do Kanaanu bez Beniamina', 'Ukryli się na pustyni'],
  ['Ruben', 'Symeon'],
  ['Obiecał przynieść podwójny podatek dla faraona', 'Poręczył życiem swoich dwóch synów'],
  ['Dwadzieścia srebrników', 'Stado owiec z Kanaanu'],
  ['Bał się gniewu Rubena', 'Nie znał drogi powrotnej'],
  ['Wszystkich braci oprócz Beniamina', 'Tylko Judę i Symeona'],
  ['Zachował całkowite milczenie i chłód', 'Wpadł w gniew i wezwał straże'],
  ['„Ja jestem Safnat-Paneach, sługa faraona”', '„Jestem wysłannikiem króla Geraru”'],
  ['O stada owiec w Kanaanie', 'O zdrowie króla Egiptu'],
  ['Tak, powiedział że sam uciekł do Egiptu', 'Przemilczał całkowicie tę sprawę'],
  ['Pięć', 'Siedem'],
  ['Dwa', 'Dziesięć'],
  ['W stolicy On', 'W ziemi Filistynów'],
  ['Rozgniewał się i kazał im opuścić kraj', 'Zażądał od nich wysokiej daniny'],
  ['Nie zatrzymywać się na nocleg', 'Nikomu nie mówić o zbożu'],
  ['Od razu rozkazał spalić wozy z Egiptu', 'Odmówił wyjazdu z Kanaanu'],
];
const quiz = between('MAŁY QUIZ', 'TWOJA DECYZJA').map((l, i) => {
  const [q, a] = l.split('Odpowiedź:').map((s) => s.trim());
  const answer = a.replace(/\s*\([\d:–,\s;]+\)\.?$/, '').replace(/\.$/, '');
  const pos = i % 3; const opts = [...WRONG[i]]; opts.splice(pos, 0, answer);
  return { q, a: opts, c: pos };
});
const quizJs = 'const QUIZ_DATA = [\n' + quiz.map((x) => `      ${JSON.stringify(x)}`).join(',\n') + '\n    ];';

// Strona Dnia 28 z szablonu Dnia 27
const tplPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-27.html');
let p = fs.readFileSync(tplPath, 'utf8');
const crlf = p.includes('\r\n'); p = p.split('\r\n').join('\n');
const rep = (a, b, all) => { if (!p.includes(a)) throw new Error('szablon: brak ' + a.slice(0, 60)); p = all ? p.split(a).join(b) : p.replace(a, b); };
const cut = (a, b, ins) => { const i = p.indexOf(a), j = p.indexOf(b, i); if (i < 0 || j < 0) throw new Error('szablon: brak ' + a); p = p.slice(0, i) + ins + p.slice(j); };

rep(/<title>[^<]*<\/title>/.exec(p)[0], `<title>Dzień 28: ${TITLE} (${REF}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
rep(/<meta name="description" content="[^"]*" \/>/.exec(p)[0], `<meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 28 (28 Października 2026). Srebrny kielich, wstawiennictwo Judy za Beniaminem i wyznanie: Ja jestem Józef — ${REF}. Kurs codzienny Pisma Świętego." />`);
rep('https://polskieradio.cc/akademia/kurscodzienny/dzien-27"', `${URL}"`, true);
rep(/<meta property="og:title" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:title" content="Dzień 28: ${TITLE} — Z Biblią za Pan Brat" />`);
rep(/<meta property="og:description" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 28. Gdy odpowiedzialność zastępuje zdradę, a łaska otwiera drogę do pojednania — ${REF}." />`);
rep('https://polskieradio.cc/images/academy/daily/kc_day_27_gdy_przeszlosc_wraca_bracia_jozefa.jpg?v=20261027', `https://polskieradio.cc${IMG}?v=20261028`);
rep('<span class="text-amber-400 font-bold">Dzień 27</span>', '<span class="text-amber-400 font-bold">Dzień 28</span>');
rep('<a href="/akademia/kurscodzienny/dzien-26" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 26</a>',
  '<a href="/akademia/kurscodzienny/dzien-27" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 27</a>', true);
rep('Księga Rodzaju • Miesiąc 1 • Dzień 27 z 31', 'Księga Rodzaju • Miesiąc 1 • Dzień 28 z 31');
rep('27 PAŹDZIERNIKA 2026 • WTOREK', '28 PAŹDZIERNIKA 2026 • ŚRODA');
rep('GDY PRZESZŁOŚĆ WRACA — BRACIA JÓZEFA\n      </h1>', `${TITLE}\n      </h1>`);
rep(/<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">\s*[^<]*<\/p>/.exec(p)[0], `<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        ${esc(SUB)}\n      </p>`);
rep('src="/images/academy/daily/kc_day_27_gdy_przeszlosc_wraca_bracia_jozefa.jpg?v=20261027"', `src="${IMG}?v=20261028"`);
rep('alt="Dzień 27: Gdy przeszłość wraca — Bracia Józefa przed zarządcą Egiptu (Rdz 42:1–43:34)"', `alt="Dzień 28: Ja jestem Józef — Przebaczenie zamiast zemsty (${REF})"`);
rep('20 Pytań z Rdz 42–43', '20 Pytań z Rdz 44–45');
rep('<span>Ilustracja biblijna: Gdy przeszłość wraca — Bracia Józefa</span>', '<span>Ilustracja biblijna: „Ja jestem Józef” — Przebaczenie zamiast zemsty</span>');
rep('<span class="font-mono text-brand-gold">Czytanie: Rdz 42:1–43:34</span>', `<span class="font-mono text-brand-gold">Czytanie: ${REF}</span>`);
rep(/<blockquote class="font-serif italic text-base sm:text-lg text-white">\s*[^<]*<\/blockquote>/.exec(p)[0], '<blockquote class="font-serif italic text-base sm:text-lg text-white">\n          „Ja jestem Józef, wasz brat, którego sprzedaliście do Egiptu”\n        </blockquote>');
rep('— Księga Rodzaju 42:21 (sens wyznania braci)', '— Księga Rodzaju 45:4 (sens wypowiedzi)');
rep(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*[^<]*<\/div>/.exec(p)[0],
  '<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ' + esc(lines[at('MYŚL PRZEWODNIA')].replace('MYŚL PRZEWODNIA: ', '')) + '\n      </div>');
cut('    <!-- LESSON BODY CONTENT', '    <!-- 20-QUESTION QUIZ SECTION -->', `    <!-- LESSON BODY CONTENT (Dzień 28, treść z pliku L0) -->\n    <section class="space-y-6">\n${body}\n    </section>\n\n`);
cut('    const QUIZ_DATA = [', '\n\n    let userAnswers', '    ' + quizJs);
const share = encodeURIComponent(`Dzień 28 Kursu Codziennego Pisma Świętego: „Ja jestem Józef” — Przebaczenie zamiast zemsty ${URL}`);
p = p.replace(/https:\/\/api\.whatsapp\.com\/send\?text=[^"]*/, `https://api.whatsapp.com/send?text=${share}`);
p = p.replace(/https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=[^"]*/, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`);
p = p.replace(/https:\/\/x\.com\/intent\/tweet\?text=[^"]*/, `https://x.com/intent/tweet?text=${encodeURIComponent('Dzień 28 Kursu Codziennego Pisma Świętego: „Ja jestem Józef” — Przebaczenie zamiast zemsty')}&url=${encodeURIComponent(URL)}`);
rep('Lekcja Dnia 27 została pomyślnie zapisana', 'Lekcja Dnia 28 została pomyślnie zapisana');
rep("'kc_day27_quiz'", "'kc_day28_quiz'", true);
rep("'kc_day27_completed'", "'kc_day28_completed'", true);
if (/dzien-27"|Dzień 27 z|kc_day27|kc_day_27/.test(p.replaceAll('href="/akademia/kurscodzienny/dzien-27" class="px-2.5', ''))) {
  const left = (p.replaceAll('href="/akademia/kurscodzienny/dzien-27" class="px-2.5', '').match(/.{0,60}(dzien-27"|kc_day27|kc_day_27).{0,40}/g) || []).filter((m) => !m.includes('← Dzień 27'));
  if (left.length) throw new Error('Zostały odwołania do Dnia 27: ' + left.join(' | '));
}
const out28 = crlf ? p.split('\n').join('\r\n') : p;
for (const f of ['akademia/kurscodzienny/dzien-28.html', 'akademia/kurscodzienny/dzien-28/index.html', 'kursy/kurscodzienny/dzien-28.html', 'kursy/kurscodzienny/dzien-28/index.html']) {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), out28);
}
console.log('Lekcja Dnia 28: 4 adresy, quiz', quiz.length, 'pytań');

// Strony Dnia 27: link „Dzień 28 →”
const next = '<a href="/akademia/kurscodzienny/dzien-28" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 28 →</a>';
for (const f of ['akademia/kurscodzienny/dzien-27.html', 'akademia/kurscodzienny/dzien-27/index.html', 'kursy/kurscodzienny/dzien-27.html', 'kursy/kurscodzienny/dzien-27/index.html']) {
  let h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (h.includes('/akademia/kurscodzienny/dzien-28')) continue;
  const prev = 'min-h-[32px] flex items-center">← Dzień 26</a>';
  if (!h.includes(prev)) throw new Error(f + ': brak linku ← Dzień 26');
  h = h.replaceAll(prev, prev + '\n        ' + next);
  fs.writeFileSync(path.join(ROOT, f), h);
}

// Akademia: przyciski, licznik, karta Dnia 28 (dzisiejsza), Dzień 27 jako dostępny
const card28 = `
          <!-- KARTA DZIEŃ 28 -->
          <a href="/akademia/kurscodzienny/dzien-28" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 28 • 28 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="${IMG}?v=20261028" alt="Dzień 28: ${TITLE} — ${REF}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              ${TITLE}
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Srebrny kielich w worku Beniamina, ofiarne poręczenie Judy i wielkie wyznanie Józefa: przebaczenie, prawda i Boża opatrzność — ${REF}.
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
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-27(" class="cin-btn-primary min-h-\[48px\]">\s*<span>)CZYTAJ DZIEŃ 27 \(27 PAŹDZIERNIKA\)/g, '$1dzien-28$2CZYTAJ DZIEŃ 28 (28 PAŹDZIERNIKA)');
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-26(" class="cin-btn-secondary min-h-\[48px\]">\s*<span>)← DZIEŃ 26/g, '$1dzien-27$2← DZIEŃ 27');
  h = h.replace(/Dni 1–27 z 31 Dostępne \(27 Października 2026\)/g, 'Dni 1–28 z 31 Dostępne (28 Października 2026)');
  // Dzień 27 przestaje być „dzisiejszą lekcją”
  h = h.replace(/(<!-- KARTA DZIEŃ 27 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-27" class=")group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30"/g,
    '$1group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col"');
  h = h.replace(/(DZIEŃ 27 • 27 PAŹDZIERNIKA 2026<\/span>\s*)<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>/g,
    '$1<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>');
  // Karta 28 po każdej karcie 27
  if (!h.includes('<!-- KARTA DZIEŃ 28 -->')) {
    let idx = 0, n = 0;
    while ((idx = h.indexOf('<!-- KARTA DZIEŃ 27 -->', idx)) !== -1) {
      const end = h.indexOf('</a>', idx) + 4;
      h = h.slice(0, end) + '\n' + card28 + h.slice(end); idx = end + card28.length; n++;
    }
    stats[f] = n;
  }
  if (h !== before) fs.writeFileSync(fp, h);
}
console.log('Karty Dnia 28 dodane:', JSON.stringify(stats));

const HL = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const NORMAL = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const TODAY = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const AVAIL = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';
const fixed = {};
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); let n = 0;
  h = h.replace(/<a href="\/akademia\/kurscodzienny\/dzien-(\d+)" class="([^"]+)">([\s\S]*?)<\/a>/g, (m, day, cls, inner) => {
    if (day === '28' || !inner.includes('DZISIEJSZA LEKCJA')) return m;
    n++;
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${cls === HL ? NORMAL : cls}">${inner.replace(TODAY, AVAIL)}</a>`;
  });
  if (n) { fs.writeFileSync(fp, h); fixed[f] = n; }
}
console.log('Karty poprawione na „dostępna”:', JSON.stringify(fixed));
