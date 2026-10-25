// scripts/update-apokalipsa-lesson29.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1. Aktualizacja data/kurs-apokalipsa-baza-pelna.json
const dbPath = path.join(ROOT, 'data', 'kurs-apokalipsa-baza-pelna.json');
const lessons = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log(`Aktualna liczba lekcji w bazie Apokalipsy: ${lessons.length}`);

const lesson29 = {
  id: 29,
  slug: "29-przeslanie-z-kosmosu-cz2-i-cz3-drugi-i-trzeci-aniol",
  videoId: "gIKzt5aW9-k",
  duration: "55:00",
  tytul: "LEKCJA 29: PRZESŁANIE Z KOSMOSU CZ. 2 I CZ. 3 — DRUGI I TRZECI ANIOŁ",
  podtytul: "Apokalipsa 14:8–13 — Upadek Babilonu, ostrzeżenie przed zwiedzeniem i znamieniem bestii oraz cierpliwość świętych",
  zakresBiblijny: "Apokalipsa 14:8–13; Księga Izajasza 21:9; Księga Jeremiasza 51:6–9; Apokalipsa 18:1–4; Apokalipsa 13:15–17; Księga Wyjścia 20:1–17.",
  tekstGlowny: "„A za nim szedł inny anioł, mówiąc: Upadł, upadł Babilon, to wielkie miasto, bo winem gniewu swego nierządu napoiło wszystkie narody. A trzeci anioł szedł za nimi, mówiąc donośnym głosem: Jeśli ktoś oddaje pokłon bestii i jej wizerunkowi i przyjmuje znamię na swoje czoło lub na swoją rękę, ten również będzie pił z wina zapalczywości Boga... Tu jest cierpliwość świętych; tu są ci, którzy strzegą przykazań Boga i wiary Jezusa”. (Apokalipsa 14:8–10.12)",
  tekstPamieciowy: "„Tu jest cierpliwość świętych; tu są ci, którzy strzegą przykazań Boga i wiary Jezusa”. (Apokalipsa 14:12, UBG)",
  celLekcji: "Zrozumieć biblijną tożsamość i duchowy upadek Babilonu (poselstwo drugiego anioła), rozpoznać śmiertelne zagrożenie związane z przyjęciem znamienia bestii (poselstwo trzeciego anioła) oraz odkryć Bożą receptę na zwycięstwo w czasach ostatecznych: wierność przykazaniom Bożym i niezłomną wiarę Jezusa.",
  wprowadzenie: "Po uroczystym wezwaniu pierwszego anioła do oddania pokłonu Stwórcy nieba i ziemi, niebo rozbrzmiewa kolejnymi dramatycznymi ostrzeżeniami. Rozdział 14 Apokalipsy wprowadza drugiego i trzeciego anioła z najbardziej bezkompromisowym orędziem w całym Piśmie Świętym. Dlaczego Bóg ogłasza upadek potężnego Babilonu i dlaczego z taką mocą przestrzega przed kompromisem z systemem bestii? Pastor Wincenty Sieja ze Studia Dobrego Słowa demaskuje duchowe mechanizmy zwiedzenia czasów końca, ukazując, że w centrum ostatecznego boju stoi walka o prawdę, wolność sumienia i posłuszeństwo Bogu. Jednocześnie Bóg wskazuje na Swój wierny lud — tych, którzy nie dają się zastraszyć ani zwieść, strzegąc Bożych przykazań i żyjąc wiarą Jezusa Chrystusa.",
  studiumKrokPoKroku: [
    {
      tytul: "1. Poselstwo Drugiego Anioła — Upadek Babilonu",
      tresc: "Drugi anioł ogłasza: „Upadł, upadł Babilon, to wielkie miasto, bo winem gniewu swego nierządu napoiło wszystkie narody” (Ap 14:8). W Biblii starożytny Babilon był symbolem buntu przeciwko Bogu, pychy (wieża Babel) i ucisku ludu Bożego. W Nowym Testamencie duchowy Babilon oznacza odstępczy system religijny, który połączył się z władzą świecką i zastąpił czyste Słowo Boże ludzkimi tradycjami i dogmatami."
    },
    {
      tytul: "2. Wino zwiedzenia — fałszywa nauka i kompromis",
      tresc: "„Wino Babilonu” to mieszanina prawdy z fałszem — nauki zniekształcające Boży charakter, odrzucające Jego Prawo i usypiające sumienia ludzi. Przez duchowe oszołomienie narody tracą zdolność rozróżniania dobra od zła. Bóg jednak wzywa swój lud: „Wyjdźcie z niego, mój ludzie, abyście nie byli uczestnikami jego grzechów” (Ap 18:4)."
    },
    {
      tytul: "3. Poselstwo Trzeciego Anioła — Najsurowsze ostrzeżenie w Biblii",
      tresc: "Trzeci anioł przestrzega przed oddaniem pokłonu bestii, jej posągowi i przyjęciem jej znamienia na czoło (świadome przekonanie) lub rękę (zewnętrzny konformizm i działanie). Jest to orędzie Bożej miłości w formie ostrzeżenia — Bóg nie chce, aby ktokolwiek zginął, dlatego z całą powagą ukazuje konsekwencje odrzucenia Stwórcy na rzecz ludzkiego przymusu."
    },
    {
      tytul: "4. Wielka kontrowersja: Znamię bestii czy Pieczęć Boga",
      tresc: "W finale historii świata nie będzie postaw neutralnych. Z jednej strony stoi Boża Pieczęć (wierność Bogu i Jego nienaruszonemu Prawu), z drugiej — znamię bestii (uznanie ludzkiego autorytetu ponad Boży nakaz). Decyzja każdego człowieka dotyczy lojalności: komu oddasz pierwszeństwo — Stwórcy czy ziemskiemu systemowi?"
    },
    {
      tytul: "5. Portret wiernego ludu Bożego (Apokalipsa 14:12)",
      tresc: "Bóg nie pozostawia nas w lęku, lecz ukazuje zwycięski lud: „Tu jest cierpliwość świętych; tu są ci, którzy strzegą przykazań Boga i wiary Jezusa”. Prawdziwi naśladowcy Chrystusa nie poddają się presji większości. Ich siłą nie jest ludzka odwaga, lecz żywa, ratująca wiara samego Jezusa, która daje cierpliwość i zwycięstwo w każdej próbie."
    },
    {
      tytul: "6. Odpocznienie i wieczna nagroda (Apokalipsa 14:13)",
      tresc: "Głos z nieba zapewnia: „Błogosławieni są odtąd umarli, którzy umierają w Panu... niech odpoczną od swoich prac, a ich uczynki idą za nimi”. Nawet w obliczu prześladowania czy śmierci, ci, którzy należą do Jezusa, mają pewność wiecznego zmartwychwstania i nieprzemijającego pokoju w Nim."
    }
  ],
  sprawdzWBiblii: [
    "Ap 14:8 — Drugi anioł ogłasza upadek Babilonu, który napoił narody winem nierządu",
    "Ap 14:9–11 — Trzeci anioł ostrzega przed pokłonem bestii i przyjęciem jej znamienia",
    "Ap 14:12 — Opis świętych czasów końca: strzegą przykazań Boga i mają wiarę Jezusa",
    "Ap 14:13 — Błogosławieństwo dla umierających w Panu i wieczny pokój",
    "Iz 21:9 & Jer 51:6–9 — Stary Testament zapowiada upadek dosłownego Babilonu jako typ Babilonu duchowego",
    "Ap 18:1–4 — Boże wezwanie do wyjścia z Babilonu: 'Wyjdźcie z niego, mój ludzie...'"
  ],
  zastosowanieOsobiste: "Czy w swoim życiu kierujesz się czystym Słowem Bożym, czy dałeś się uśpić 'winu tradycji' i kompromisom otaczającego świata? Poselstwo trzech aniołów to nie teoria, lecz Boży apel o czystość serca i odwagę stanięcia po stronie prawdy. Prawdziwa wiara Jezusa daje pokój i cierpliwość nawet w najtrudniejszych doświadczeniach.",
  pytaniaDoStudium: [
    "Czym w symbolice biblijnej jest Babilon i dlaczego Pismo Święte mówi o jego 'upadku'?",
    "Co symbolizuje 'wino zapalczywości nierządu', którym Babilon poi narody?",
    "Przed czym z tak ogromną mocą przestrzega trzeci anioł w Apokalipsie 14:9–11?",
    "Jakie dwa nieodłączne elementy charakteryzują lud Boży w Apokalipsie 14:12?",
    "W jaki sposób wiara Jezusa uzdalnia wierzącego do zachowania cierpliwości w czasie kryzysu?"
  ],
  quiz: [
    {
      pytanie: "Co według Apokalipsy 14:8 ogłasza Drugi Anioł?",
      opcje: [
        "Początek budowy świątyni w Jerozolimie",
        "Upadek Babilonu, który winem swego nierządu napoił wszystkie narody",
        "Koniec wojen na ziemi",
        "Zesłanie plag na Egipt"
      ],
      poprawna: 1,
      odpowiedz: "Upadek Babilonu, który winem swego nierządu napoił wszystkie narody",
      wyjasnienie: "Drugi anioł wzywa do zerwania z odstępczym systemem religijnym, głosząc upadek duchowego Babilonu i jego zwodniczych nauk."
    },
    {
      pytanie: "Jakie dwie cechy definiują Boży lud czasu końca w Apokalipsie 14:12?",
      opcje: [
        "Bogactwo materialne i władza polityczna",
        "Strzeżenie przykazań Boga i wiara Jezusa",
        "Tradycja przodków i przynależność plemienna",
        "Poddanie się ziemskim autorytetom religijnym"
      ],
      poprawna: 1,
      odpowiedz: "Strzeżenie przykazań Boga i wiara Jezusa",
      wyjasnienie: "Apokalipsa 14:12 precyzuje: 'Tu są ci, którzy strzegą przykazań Boga i wiary Jezusa'. To połączenie posłuszeństwa Bożemu prawu z żywą wiarą Zbawiciela."
    },
    {
      pytanie: "Gdzie według poselstwa trzeciego anioła (Ap 14:9) bestia usiłuje umieścić swoje znamię?",
      opcje: [
        "Na plecach lub stopach",
        "Na czole lub na ręce",
        "Na sercu",
        "W paszporcie"
      ],
      poprawna: 1,
      odpowiedz: "Na czole lub na ręce",
      wyjasnienie: "Czoło symbolizuje świadome przekonanie umysłu, a ręka — działanie, pracę i zewnętrzny konformizm (Ap 14:9)."
    }
  ],
  twojaDecyzja: "Postanawiam opierać moją wiarę wyłącznie na niezmiennym Słowie Bożym. Odrzucam duchowe zwiedzenie i kompromisy Babilonu. Z Bożą pomocą chcę strzec przykazań mojego Pana i żyć wiarą Jezusa każdego dnia.",
  modlitwa: "Ojcze Niebieski, Boże prawdy i łaski! Dziękuję Ci za miłość, która w poselstwach aniołów ostrzega nas przed fałszem i zniszczeniem. Otwórz moje oczy na duchowe zwiedzenia i daj mi odwagę stać po stronie Twojej prawdy. Wzmocnij moją wiarę i napełnij moje serce cierpliwością, abym dochował Ci wierności i strzegł Twoich przykazań z miłości do Ciebie. W imieniu Jezusa Chrystusa, Amen!"
};

const existingIndex = lessons.findIndex(l => l.id === 29);
if (existingIndex >= 0) {
  lessons[existingIndex] = lesson29;
} else {
  lessons.push(lesson29);
}

fs.writeFileSync(dbPath, JSON.stringify(lessons, null, 2), 'utf8');
console.log(`✅ Zaktualizowano bazę kursu Apokalipsy. Nowa liczba lekcji: ${lessons.length}`);

// 2. Aktualizacja akademia.html, akademia/index.html, kursy.html, kursy/index.html
const targetFiles = [
  path.join(ROOT, 'akademia.html'),
  path.join(ROOT, 'akademia', 'index.html'),
  path.join(ROOT, 'kursy.html'),
  path.join(ROOT, 'kursy', 'index.html')
];

const lekcja29CardHtml = `    <a href="/akademia/apokalipsa/lekcja-29" class="group block p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/50 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 29 / 29</span>
        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>
      </div>
      <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
        PRZESŁANIE Z KOSMOSU CZ. 2 I CZ. 3 — DRUGI I TRZECI ANIOŁ
      </h3>
      <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">Apokalipsa 14:8–13 — Upadek Babilonu, ostrzeżenie przed zwiedzeniem i znamieniem bestii oraz cierpliwość świętych</p>
      <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-zinc-500 flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
          <span>Ap 14:8–13; Iz 21:9; Jer 51:6–9</span>
        </span>
        <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Studiuj</span>
          <span>→</span>
        </span>
      </div>
    </a>`;

targetFiles.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let content = fs.readFileSync(fp, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';

  // Liczniki 28 -> 29
  content = content.replace(/28 LEKCJI/g, '29 LEKCJI');
  content = content.replace(/28 Lekcji/g, '29 Lekcji');
  content = content.replace(/0 \/ 28 LEKCJI/g, '0 \/ 29 LEKCJI');
  content = content.replace(/28\/28 LEKCJI/g, '29/29 LEKCJI');
  content = content.replace(/(LEKCJA \d{2}) \/ 28/g, '$1 / 29');
  content = content.replace(/Każda z 28 lekcji/g, 'Każda z 29 lekcji');
  content = content.replace(/28 dedykowanych podstron/g, '29 dedykowanych podstron');

  // W karcie Lekcji 28 usunąć PREMIERA (zamienić na wskaźnik wideo)
  // Wyszukujemy kartę lekcji 28
  const l28Anchor = 'href="/akademia/apokalipsa/lekcja-28"';
  const l28Pos = content.indexOf(l28Anchor);
  if (l28Pos !== -1) {
    const l28End = content.indexOf('</a>', l28Pos);
    if (l28End !== -1) {
      let l28Slice = content.substring(l28Pos, l28End);
      l28Slice = l28Slice.replace(
        '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>',
        '<span class="text-[11px] text-zinc-500 font-mono"><i class="fa-solid fa-play text-red-500 mr-1 text-[9px]"></i>58:33</span>'
      );
      content = content.substring(0, l28Pos) + l28Slice + content.substring(l28End);
    }
  }

  // Wstawienie karty lekcji 29 jeśli jej nie ma
  if (!content.includes('href="/akademia/apokalipsa/lekcja-29"')) {
    const l28PosNew = content.indexOf(l28Anchor);
    if (l28PosNew !== -1) {
      const l28EndNew = content.indexOf('</a>', l28PosNew);
      if (l28EndNew !== -1) {
        content = content.substring(0, l28EndNew + 4) + eol + lekcja29CardHtml + content.substring(l28EndNew + 4);
      }
    }
  }

  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✅ Zaktualizowano ${path.relative(ROOT, fp)} (28 -> 29 lekcji)`);
});

// 3. Aktualizacja js/lumina-courses-engine.js
const enginePath = path.join(ROOT, 'js', 'lumina-courses-engine.js');
if (fs.existsSync(enginePath)) {
  let eng = fs.readFileSync(enginePath, 'utf8');
  eng = eng.replace(/28 LEKCJI/g, '29 LEKCJI');
  fs.writeFileSync(enginePath, eng, 'utf8');
  console.log('✅ Zaktualizowano js/lumina-courses-engine.js');
}
