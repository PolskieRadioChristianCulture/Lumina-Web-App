#!/usr/bin/env node
// Dzień 27 Kursu Codziennego „Z Biblią za Pan Brat” (@A001, 27.10.2026).
// Treść lekcji: plik L0 (tekst w scripts/content/kc-day27-lesson.txt, bez zmian).
// Szablon: strona Dnia 26 (kanoniczny wzorzec JOMA-D048 / Lekcja 1).
// Tworzy 4 adresy lekcji, dopisuje „Dzień 27 →” na stronach Dnia 26,
// aktualizuje przyciski, licznik i kartę dnia w Akademii.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG = '/images/academy/daily/kc_day_27_gdy_przeszlosc_wraca_bracia_jozefa.jpg';
const URL = 'https://polskieradio.cc/akademia/kurscodzienny/dzien-27';
const TITLE = 'GDY PRZESZŁOŚĆ WRACA — BRACIA JÓZEFA';
const SUB = 'Wina, próba charakteru i pierwsze kroki ku pojednaniu (Rdz 42:1–43:34)';
const REF = 'Rdz 42:1–43:34';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/content/kc-day27-lesson.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
const titleCase = (h) => h.split(' — ').map((s, k) => (k === 0 ? s.charAt(0) + s.slice(1).toLowerCase() : s.charAt(0) + s.slice(1).toLowerCase())).join(' — ').replace(/rdz/g, 'Rdz').replace(/jakub/g, 'Jakub').replace(/beniamina/g, 'Beniamina').replace(/juda/g, 'Juda').replace(/egipcie/g, 'Egipcie').replace(/egiptu/g, 'Egiptu').replace(/józefa/g, 'Józefa');

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
body += card('<i class="fa-solid fa-cross"></i>', 'Jezus w centrum — prawda, przebaczenie i przemiana', pointHtml(points(between('JEZUS W CENTRUM', 'SPRAWDŹ W BIBLII'))));
body += card('<i class="fa-solid fa-book-bible"></i>', 'Sprawdź w Biblii — 12 tekstów porównawczych', listHtml(between('SPRAWDŹ W BIBLII', 'PRAWDA NA DZIŚ')));
body += card('<i class="fa-solid fa-lightbulb"></i>', 'Prawda na dziś', listHtml(between('PRAWDA NA DZIŚ', 'POMYŚL —')));
body += card('<i class="fa-solid fa-heart"></i>', 'Pomyśl — pytania do serca', listHtml(between('POMYŚL —', 'MAŁY QUIZ'), 'list-decimal'));
const decyzja = between('TWOJA DECYZJA', 'MODLITWA NA 27');
body += card('<i class="fa-solid fa-route"></i>', 'Twoja decyzja — od lęku do odpowiedzialności',
  parasHtml(decyzja.filter((l) => !l.startsWith('MOJA DECYZJA'))) + '\n' +
  decyzja.filter((l) => l.startsWith('MOJA DECYZJA')).map((l) => `        <p class="text-amber-200 font-semibold">${esc(l)}</p>`).join('\n'));
body += card('<i class="fa-solid fa-hands-praying"></i>', 'Modlitwa na 27 października', parasHtml(between('MODLITWA NA 27', 'ZADANIE NA DZIŚ')).replace(/<p class="text-zinc-200">/g, '<p class="text-zinc-200 font-serif italic">'));
const zadanie = between('ZADANIE NA DZIŚ', 'JUTRO —');
body += card('<i class="fa-solid fa-list-check"></i>', 'Zadanie na dziś', listHtml(zadanie.filter((l) => !/PRZECZYTAŁEM/.test(l)), 'list-none') + '\n        <p class="text-xs text-brand-gold font-bold tracking-wider">✓ PRZECZYTAŁEM • ✓ ZROZUMIAŁEM • ✓ ZASTOSUJĘ</p>');
const jutro = lines.slice(at('JUTRO —'));
body += card('<i class="fa-solid fa-calendar-day"></i>', jutro[0].charAt(0) + jutro[0].slice(1).toLowerCase(), `        <p class="text-white font-semibold">${esc(jutro[1])}</p>\n` + parasHtml(jutro.slice(2)));

// Quiz: pytania i poprawne odpowiedzi dosłownie z pliku L0; dwa błędne warianty
const WRONG = [
  ['Aby uciec przed wojną z Filistynami', 'Aby złożyć hołd faraonowi'],
  ['Dwunastu', 'Siedmiu'],
  ['Juda', 'Ruben'],
  ['Nie, rozpoznał tylko Beniamina', 'Rozpoznał ich dopiero podczas drugiej uczty'],
  ['Tak, od razu po głosie', 'Tak, rozpoznał go Ruben'],
  ['O kradzież bydła faraona', 'O bunt przeciwko kapłanom w On'],
  ['Siedem', 'Czternaście'],
  ['Że służy bogom Egiptu', 'Że nie wierzy w żadnego Boga'],
  ['Kłótnię z pasterzami Geraru', 'Kradzież posążków Labana'],
  ['Ruben', 'Juda'],
  ['Tylko paszę dla osłów', 'Złoty kielich i szaty świąteczne'],
  ['Zgodził się natychmiast bez wahania', 'Postanowił sam pójść zamiast synów'],
  ['Zaoferował całe stado owiec ojca', 'Obiecał, że zostanie niewolnikiem w Egipcie'],
  ['Symeon', 'Lewi'],
  ['Tylko puste worki i broń', 'Stada owiec i wielbłądów'],
  ['Bali się gniewu Symeona', 'Myśleli, że zostaną wcieleni do wojska'],
  ['Podczaszy faraona', 'Kapłan z On'],
  ['O króla Geraru', 'O potomków Ezawa'],
  ['Skarcił go przy wszystkich braciach', 'Kazał go natychmiast uwięzić'],
  ['Dwa razy mniejszą niż pozostali', 'Dokładnie taką samą jak Ruben'],
];
const quiz = between('MAŁY QUIZ', 'TWOJA DECYZJA').map((l, i) => {
  const [q, a] = l.split('Odpowiedź:').map((s) => s.trim());
  const answer = a.replace(/\s*\([\d:–,\s]+\)\.?$/, '').replace(/\.$/, '');
  const pos = i % 3; const opts = [...WRONG[i]]; opts.splice(pos, 0, answer);
  return { q, a: opts, c: pos };
});
const quizJs = 'const QUIZ_DATA = [\n' + quiz.map((x) => `      ${JSON.stringify(x)}`).join(',\n') + '\n    ];';

// Strona Dnia 27 z szablonu Dnia 26
const tplPath = path.join(ROOT, 'akademia/kurscodzienny/dzien-26.html');
let p = fs.readFileSync(tplPath, 'utf8');
const crlf = p.includes('\r\n'); p = p.split('\r\n').join('\n');
const rep = (a, b, all) => { if (!p.includes(a)) throw new Error('szablon: brak ' + a.slice(0, 60)); p = all ? p.split(a).join(b) : p.replace(a, b); };
const cut = (a, b, ins) => { const i = p.indexOf(a), j = p.indexOf(b, i); if (i < 0 || j < 0) throw new Error('szablon: brak ' + a); p = p.slice(0, i) + ins + p.slice(j); };

rep(/<title>[^<]*<\/title>/.exec(p)[0], `<title>Dzień 27: ${TITLE} (${REF}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`);
rep(/<meta name="description" content="[^"]*" \/>/.exec(p)[0], `<meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 27 (27 Października 2026). Bracia Józefa w Egipcie, przebudzenie sumienia i odpowiedzialność Judy — ${REF}. Kurs codzienny Pisma Świętego." />`);
rep('https://polskieradio.cc/akademia/kurscodzienny/dzien-26"', `${URL}"`, true);
rep(/<meta property="og:title" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:title" content="Dzień 27: ${TITLE} — Z Biblią za Pan Brat" />`);
rep(/<meta property="og:description" content="[^"]*" \/>/.exec(p)[0], `<meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 27. Wina, próba charakteru i pierwsze kroki ku pojednaniu — ${REF}." />`);
rep('https://polskieradio.cc/images/academy/daily/kc_day_26_jozef_od_wiezienia_do_palacu.jpg?v=20261026', `https://polskieradio.cc${IMG}?v=20261027`);
rep('<span class="text-amber-400 font-bold">Dzień 26</span>', '<span class="text-amber-400 font-bold">Dzień 27</span>');
rep('<a href="/akademia/kurscodzienny/dzien-25" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 25</a>',
  '<a href="/akademia/kurscodzienny/dzien-26" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 26</a>', true);
rep('Księga Rodzaju • Miesiąc 1 • Dzień 26 z 31', 'Księga Rodzaju • Miesiąc 1 • Dzień 27 z 31');
rep('26 PAŹDZIERNIKA 2026 • PONIEDZIAŁEK', '27 PAŹDZIERNIKA 2026 • WTOREK');
rep('OD WIĘZIENIA DO PAŁACU\n      </h1>', `${TITLE}\n      </h1>`);
rep(/<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">\s*[^<]*<\/p>/.exec(p)[0], `<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        ${esc(SUB)}\n      </p>`);
rep('src="/images/academy/daily/kc_day_26_jozef_od_wiezienia_do_palacu.jpg?v=20261026"', `src="${IMG}?v=20261027"`);
rep('alt="Dzień 26: Od więzienia do pałacu — Józef przed faraonem (Rdz 40:1–41:57)"', `alt="Dzień 27: Gdy przeszłość wraca — Bracia Józefa przed zarządcą Egiptu (${REF})"`);
rep('20 Pytań z Rdz 40–41', '20 Pytań z Rdz 42–43');
rep('<span>Ilustracja biblijna: Józef — od więzienia do pałacu</span>', '<span>Ilustracja biblijna: Gdy przeszłość wraca — Bracia Józefa</span>');
rep('<span class="font-mono text-brand-gold">Czytanie: Rdz 40:1–41:57</span>', `<span class="font-mono text-brand-gold">Czytanie: ${REF}</span>`);
rep(/<blockquote class="font-serif italic text-base sm:text-lg text-white">\s*[^<]*<\/blockquote>/.exec(p)[0], '<blockquote class="font-serif italic text-base sm:text-lg text-white">\n          „Prawdziwie zgrzeszyliśmy przeciwko naszemu bratu”\n        </blockquote>');
rep('— Księga Rodzaju 40:8 (sens wypowiedzi Józefa)', '— Księga Rodzaju 42:21 (sens wyznania braci)');
rep(/<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>\s*[^<]*<\/div>/.exec(p)[0],
  '<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ' + esc(lines[at('MYŚL PRZEWODNIA')].replace('MYŚL PRZEWODNIA: ', '')) + '\n      </div>');
cut('    <!-- LESSON BODY CONTENT', '    <!-- 20-QUESTION QUIZ SECTION -->', `    <!-- LESSON BODY CONTENT (Dzień 27, treść z pliku L0) -->\n    <section class="space-y-6">\n${body}\n    </section>\n\n`);
cut('    const QUIZ_DATA = [', '\n\n    let userAnswers', '    ' + quizJs);
const share = encodeURIComponent(`Dzień 27 Kursu Codziennego Pisma Świętego: Gdy przeszłość wraca — Bracia Józefa ${URL}`);
p = p.replace(/https:\/\/api\.whatsapp\.com\/send\?text=[^"]*/, `https://api.whatsapp.com/send?text=${share}`);
p = p.replace(/https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=[^"]*/, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`);
p = p.replace(/https:\/\/x\.com\/intent\/tweet\?text=[^"]*/, `https://x.com/intent/tweet?text=${encodeURIComponent('Dzień 27 Kursu Codziennego Pisma Świętego: Gdy przeszłość wraca — Bracia Józefa')}&url=${encodeURIComponent(URL)}`);
rep('Lekcja Dnia 26 została pomyślnie zapisana', 'Lekcja Dnia 27 została pomyślnie zapisana');
rep("'kc_day26_quiz'", "'kc_day27_quiz'", true);
rep("'kc_day26_completed'", "'kc_day27_completed'", true);
if (/dzien-26"|Dzień 26 z|kc_day26|kc_day_26/.test(p.replaceAll('href="/akademia/kurscodzienny/dzien-26" class="px-2.5', ''))) {
  const left = (p.replaceAll('href="/akademia/kurscodzienny/dzien-26" class="px-2.5', '').match(/.{0,60}(dzien-26"|kc_day26|kc_day_26).{0,40}/g) || []).filter((m) => !m.includes('← Dzień 26'));
  if (left.length) throw new Error('Zostały odwołania do Dnia 26: ' + left.join(' | '));
}
const out27 = crlf ? p.split('\n').join('\r\n') : p;
for (const f of ['akademia/kurscodzienny/dzien-27.html', 'akademia/kurscodzienny/dzien-27/index.html', 'kursy/kurscodzienny/dzien-27.html', 'kursy/kurscodzienny/dzien-27/index.html']) {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), out27);
}
console.log('Lekcja Dnia 27: 4 adresy, quiz', quiz.length, 'pytań');

// Strony Dnia 26: link „Dzień 27 →”
const next = '<a href="/akademia/kurscodzienny/dzien-27" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 27 →</a>';
for (const f of ['akademia/kurscodzienny/dzien-26.html', 'akademia/kurscodzienny/dzien-26/index.html', 'kursy/kurscodzienny/dzien-26.html', 'kursy/kurscodzienny/dzien-26/index.html']) {
  let h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (h.includes('/akademia/kurscodzienny/dzien-27')) continue;
  const prev = 'min-h-[32px] flex items-center">← Dzień 25</a>';
  if (!h.includes(prev)) throw new Error(f + ': brak linku ← Dzień 25');
  h = h.replaceAll(prev, prev + '\n        ' + next);
  fs.writeFileSync(path.join(ROOT, f), h);
}

// Akademia: przyciski, licznik, karta Dnia 27 (dzisiejsza), Dzień 26 jako dostępny
const card27 = `
          <!-- KARTA DZIEŃ 27 -->
          <a href="/akademia/kurscodzienny/dzien-27" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 27 • 27 PAŹDZIERNIKA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="${IMG}?v=20261027" alt="Dzień 27: ${TITLE} — ${REF}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              ${TITLE}
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Bracia Józefa w Egipcie, przebudzenie sumienia, poręczenie Judy za Beniamina i pierwsze kroki ku pojednaniu — ${REF}.
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
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-26(" class="cin-btn-primary min-h-\[48px\]">\s*<span>)CZYTAJ DZIEŃ 26 \(26 PAŹDZIERNIKA\)/g, '$1dzien-27$2CZYTAJ DZIEŃ 27 (27 PAŹDZIERNIKA)');
  h = h.replace(/(href="\/akademia\/kurscodzienny\/)dzien-25(" class="cin-btn-secondary min-h-\[48px\]">\s*<span>)← DZIEŃ 25/g, '$1dzien-26$2← DZIEŃ 26');
  h = h.replace(/Dni 1–26 z 31 Dostępne \(26 Października 2026\)/g, 'Dni 1–27 z 31 Dostępne (27 Października 2026)');
  // Dzień 26 przestaje być „dzisiejszą lekcją”
  h = h.replace(/(<!-- KARTA DZIEŃ 26 -->\s*<a href="\/akademia\/kurscodzienny\/dzien-26" class=")group block p-5 rounded-2xl bg-\[#0E121A\] border-2 border-brand-gold hover:border-amber-400 hover:bg-\[#161B26\] transition-all transform hover:-translate-y-1 shadow-xl shadow-black\/50 flex flex-col relative ring-1 ring-amber-500\/30"/g,
    '$1group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col"');
  h = h.replace(/(DZIEŃ 26 • 26 PAŹDZIERNIKA 2026<\/span>\s*)<span class="px-2 py-0\.5 rounded-full bg-amber-500\/25 text-amber-300 text-\[10px\] font-extrabold border border-amber-500\/50 animate-pulse">DZISIEJSZA LEKCJA<\/span>/g,
    '$1<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>');
  // Karta 27 po każdej karcie 26
  if (!h.includes('<!-- KARTA DZIEŃ 27 -->')) {
    let idx = 0, n = 0;
    while ((idx = h.indexOf('<!-- KARTA DZIEŃ 26 -->', idx)) !== -1) {
      const end = h.indexOf('</a>', idx) + 4;
      h = h.slice(0, end) + '\n' + card27 + h.slice(end); idx = end + card27.length; n++;
    }
    stats[f] = n;
  }
  if (h !== before) fs.writeFileSync(fp, h);
}
console.log('Karty Dnia 27 dodane:', JSON.stringify(stats));

const HL = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const NORMAL = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const TODAY = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const AVAIL = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';
const fixed = {};
for (const f of ['akademia.html', 'akademia/index.html', 'akademia/kurscodzienny.html', 'kursy.html', 'kursy/index.html', 'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html']) {
  const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
  let h = fs.readFileSync(fp, 'utf8'); let n = 0;
  h = h.replace(/<a href="\/akademia\/kurscodzienny\/dzien-(\d+)" class="([^"]+)">([\s\S]*?)<\/a>/g, (m, day, cls, inner) => {
    if (day === '27' || !inner.includes('DZISIEJSZA LEKCJA')) return m;
    n++;
    return `<a href="/akademia/kurscodzienny/dzien-${day}" class="${cls === HL ? NORMAL : cls}">${inner.replace(TODAY, AVAIL)}</a>`;
  });
  if (n) { fs.writeFileSync(fp, h); fixed[f] = n; }
}
console.log('Karty poprawione na „dostępna”:', JSON.stringify(fixed));
