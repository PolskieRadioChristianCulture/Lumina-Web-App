import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articleId = 'art-co-dalej-z-ta-niedziela-szabat-bacchiocchi';
const articleSlug = 'co-dalej-z-ta-niedziela-szabat-bacchiocchi';
const articleTitle = 'Co dalej z tą niedzielą? Szabat, pierwszy pełny dzień człowieka i pytanie o spotkanie ze Stwórcą';
const articleExcerpt = 'Dlaczego chrześcijanie świętują niedzielę, skoro Bóg pobłogosławił siódmy dzień? Biblia, historia i badania Samuele Bacchiocchiego.';
const primaryPortalUrl = 'https://polskieradio.cc/historia/co-dalej-z-ta-niedziela-szabat-bacchiocchi';
const primaryPortalLabel = 'CCN Historia — Główne wydanie pełne';
const imageUrl = '/images/news/art-co-dalej-z-ta-niedziela-szabat-bacchiocchi.jpg';
const imageCaption = 'Ilustracja artystyczna: Rodzina odpoczywa o zachodzie słońca z otwartą Biblią na stole.';

const articleContent = [
  "Czy zastanawiałeś się kiedyś, dlaczego większość chrześcijan spotyka się na nabożeństwach w niedzielę, skoro czwarte przykazanie mówi o siódmym dniu tygodnia? I dlaczego już na pierwszych stronach Biblii Bóg wyróżnia nie pierwszy, lecz siódmy dzień? Nie chcę rozpoczynać kolejnego sporu o kalendarz. Chcę zaprosić Cię do czegoś głębszego: do odkrycia czasu, który Stwórca oddzielił dla człowieka, zanim pojawił się grzech, Izrael czy jakakolwiek instytucja kościelna.",
  "1. Pierwszy pełny dzień człowieka: dar, nie obowiązek",
  "Według Rdz 1,26–31 człowiek został stworzony szóstego dnia. Następnie Rdz 2,1–3 opowiada o dniu siódmym: Bóg zakończył dzieło stworzenia, odpoczął, pobłogosławił ten dzień i go uświęcił. Bóg nie odpoczywał z wyczerpania. Tekst pokazuje zwieńczenie skończonego, dobrego dzieła.",
  "To prowadzi do pięknej refleksji: pierwszy pełny dzień przeżywany przez człowieka był dniem odpoczynku Boga. Zanim Adam i Ewa zaczęli wykonywać swoje zadania, otrzymali czas, który wskazywał na Dawcę życia. Możemy mówić o szabacie jako przestrzeni ich pierwszej pełnej wspólnoty ze Stwórcą. Trzeba jednak uczciwie dodać: Księga Rodzaju nie opisuje dosłownie pierwszego szabatu Adama ani nie zapisuje rozmowy, która miałaby się wtedy odbyć. To wniosek teologiczny wyprowadzony z kolejności narracji, nie cytat z tekstu.",
  "I właśnie ta kolejność mnie porusza: najpierw dar istnienia i relacji, dopiero potem praca. Człowiek nie musiał zasłużyć na Bożą obecność. Został stworzony, by żyć przed Jego obliczem.",
  "2. Szabat przypomina, do kogo należy nasze życie",
  "Wj 20,8–11 nie ustanawia nowego, przypadkowego rytuału. Przykazanie odsyła do stworzenia: sześć dni pracy i siódmy dzień odpoczynku są zakorzenione w Bożym działaniu. Pwt 5,12–15 dodatkowo łączy odpoczynek z pamięcią o wyzwoleniu z Egiptu. Szabat przypomina więc zarówno o Stwórcy, jak i o Wyzwolicielu.",
  "Wyróżniające jest to, że odpocząć mają także syn, córka, sługa, przybysz i zwierzęta. To nie tylko zasada osobistej pobożności; to również etyka godności, troski i sprawiedliwości. W świecie bezustannej produktywności szabat mówi: nie jesteś wyłącznie tym, co wytwarzasz.",
  "3. Co Jezus zrobił z szabatem?",
  "Jezus regularnie uczestniczył w nabożeństwach w szabat (Łk 4,16), nauczał i uzdrawiał w tym dniu. Spory opisane w Ewangeliach nie dotyczą prostego pytania, czy wolno czynić dobro, lecz sposobu rozumienia odpoczynku i ludzkich tradycji. W Mk 2,27–28 Jezus stwierdza, że szabat został ustanowiony dla człowieka, a Syn Człowieczy jest także Panem szabatu.",
  "Nie odczytuję tych słów jako zachęty do traktowania ludzi surowo. Jezus sprzeciwiał się praktykom, które czyniły z dnia Bożego daru ciężar. W Mt 12,12 wyraźnie dopuszcza czynienie dobra w szabat. Chrystus przywraca dniowi odpoczynku jego sens: życie, miłosierdzie i relację z Bogiem.",
  "4. Skąd zatem wzięła się niedziela?",
  "Nowy Testament mówi, że Jezus zmartwychwstał pierwszego dnia tygodnia (Mk 16,2; J 20,1). Znajdujemy także wzmiankę o spotkaniu uczniów pierwszego dnia tygodnia (Dz 20,7) i o odkładaniu darów tego dnia (1 Kor 16,2). Są to teksty ważne dla historii praktyk chrześcijańskich. Nie zawierają jednak wprost nakazu, że pierwszy dzień tygodnia zastępuje siódmy dzień czwartego przykazania.",
  "Równocześnie trzeba rzetelnie przyznać, że wielu chrześcijan od wczesnych wieków świętowało niedzielę w związku ze zmartwychwstaniem Jezusa. Historia tej praktyki nie sprowadza się do jednego dekretu ani jednego wydarzenia. Rozwijała się stopniowo, w różnych wspólnotach i uwarunkowaniach.",
  "To rozróżnienie jest kluczowe: fakt, że niedziela ma długą historię w chrześcijaństwie, nie jest sam w sobie dowodem biblijnego przeniesienia świętości szabatu; a fakt, że szabat ma podstawę w stworzeniu, nie pozwala pomijać świadectwa historii o niedzielnych spotkaniach.",
  "5. Co ustalił Samuele Bacchiocchi?",
  "Samuele Bacchiocchi, historyk Kościoła i autor książki „From Sabbath to Sunday: A Historical Investigation of the Rise of Sunday Observance in Early Christianity” (1977), badał historyczny rozwój świętowania niedzieli. Praca została wydana przez Pontifical Gregorian University Press. Bacchiocchi argumentował, że zmiana praktyki nie wynikała z jednoznacznego ustanowienia niedzieli przez Jezusa czy apostołów, lecz dokonywała się w toku późniejszych przemian społecznych, teologicznych i kościelnych. Szczególną rolę w jego wyjaśnieniu odgrywają napięcia między chrześcijanami a judaizmem oraz kontekst rzymski.",
  "W „Divine Rest for Human Restlessness: A Theological Study of the Good News of the Sabbath for Today” Bacchiocchi rozwija pozytywne znaczenie odpoczynku: szabat jako dobrą nowinę dla człowieka niespokojnego, przeciążonego i potrzebującego więzi ze Stwórcą. To inspirujące podejście, ponieważ nie ogranicza problemu do tego, co wolno i czego nie wolno robić.",
  "Nie wszyscy historycy zgadzają się jednak z każdym elementem rekonstrukcji Bacchiocchiego. Na przykład Richard Bauckham analizował wczesnochrześcijańską niedzielę w sposób podkreślający złożoność świadectw. Trzeba zatem rozróżnić udokumentowany rozwój niedzielnej praktyki i spory co do konkretnych przyczyn jej powstania. Zamiast traktować książkę jako rozstrzygającą wszystkie kwestie, warto potraktować ją jako zaproszenie do poważnego studiowania źródeł.",
  "6. A co z wolnością sumienia i przyszłością?",
  "Nie chcę, by rozmowa o sobocie i niedzieli przerodziła się w osądzanie osób, które szczerze oddają cześć Bogu w innym dniu. Wiara wymaga prawdy, ale także miłości. Rz 14,5–6 bywa przywoływany w sporze o dni; jego bezpośredni kontekst dotyczy różnic praktyk i wzajemnego niesądzenia, a chrześcijanie różnią się co do tego, czy Paweł miał tam na myśli również szabat Dekalogu. Nie wolno ignorować tego sporu interpretacyjnego.",
  "Historycystyczna interpretacja Dn 7,25 i Ap 13–14 łączy końcowy konflikt z autorytetem Boga, Jego przykazaniami i przymusem religijnym. W tradycji adwentystycznej pojawia się w tym kontekście ostrzeżenie przed przyszłym narzuceniem świętowania niedzieli. Sama Apokalipsa 13 nie wymienia jednak niedzieli ani konkretnej ustawy. Wszelkie obecne przepisy o pracy czy handlu trzeba oceniać według ich rzeczywistej treści; nie wolno bez dowodów nazywać ich spełnieniem tego proroctwa.",
  "Wolność sumienia musi obejmować wszystkich: świętujących sobotę, niedzielę i osoby niewierzące. Oddawanie czci nie staje się prawdziwe przez przymus.",
  "7. Co dalej z tą niedzielą? Moja odpowiedź",
  "Nie chcę odebrać nikomu radości ze spotkania ze zmartwychwstałym Chrystusem. Chcę jednak postawić uczciwe pytanie: czy w naszych zwyczajach pozwalamy Biblii mówić pierwszym głosem?",
  "Dla mnie szabat jest czymś więcej niż dniem w kalendarzu. Jest cotygodniowym przypomnieniem, że świat nie należy do naszej pracy, osiągnięć ani lęków. Należy do Stwórcy. W wizji nowego nieba i nowej ziemi Iz 66,22–23 przedstawia regularne oddawanie czci Bogu, używając również obrazu szabatu. To proroczy obraz, którego szczegóły różne tradycje interpretują odmiennie, ale jego centrum jest jasne: Stwórca jest godzien czci.",
  "Jeśli pierwszy pełny dzień życia człowieka był dniem pobłogosławionym przez Boga, czy nie warto na nowo zapytać, co ten dar oznacza dzisiaj?",
  "Moje zaproszenie jest proste: otwórz Biblię. Przeczytaj spokojnie Rdz 2,1–3, Wj 20,8–11, Mk 2,27–28 i Ap 14,6–12. Nie zaczynaj od ataku na czyjąś tradycję. Zacznij od spotkania ze Stwórcą.",
  "Bo ostatecznie nie pytam tylko: „Co dalej z tą niedzielą?”. Pytam również: „Co zrobię z dniem, który Bóg sam pobłogosławił?”. Niech to pytanie prowadzi nas do Jezusa, do wierności Słowu i do miłości bliźniego. Amen.",
  "ŹRÓDŁA I BIBLIOGRAFIA",
  "Biblia (odniesienia do NKJV / UBG): Rdz 1,26–2,3; Wj 20,8–11; Pwt 5,12–15; Mk 2,27–28; Łk 4,16; Mt 12,12; Mk 16,2; J 20,1; Dz 20,7; 1 Kor 16,2; Rz 14,5–6; Dn 7,25; Ap 13–14; Iz 66,22–23.\n\nSamuele Bacchiocchi, From Sabbath to Sunday: A Historical Investigation of the Rise of Sunday Observance in Early Christianity, Pontifical Gregorian University Press, Rzym, 1977. https://books.google.com/books?id=7_DYAAAAMAAJ\n\nSamuele Bacchiocchi, Divine Rest for Human Restlessness: A Theological Study of the Good News of the Sabbath for Today, Biblical Perspectives, wyd. 1990. https://books.google.com/books?id=lgFSzQEACAAJ\n\nRichard J. Bauckham, „Sabbath and Sunday in the Post-Apostolic Church”, w: D. A. Carson (red.), From Sabbath to Lord's Day, Zondervan, 1982, s. 251–298."
];

// 1. Update portals/ccn-news/src/data/articles.ts
const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');

if (!articlesTs.includes(articleId)) {
  const breakingNewsBanner = `  "CCN BIBLIA & HISTORIA: Co dalej z tą niedzielą? Szabat, pierwszy pełny dzień człowieka i pytanie o spotkanie ze Stwórcą — analiza Cezarego Rogowskiego (Rdz 2:1-3; Wj 20:8-11; Mk 2:27-28; Bacchiocchi)",\n`;
  articlesTs = articlesTs.replace('export const BREAKING_NEWS: string[] = [\n', 'export const BREAKING_NEWS: string[] = [\n' + breakingNewsBanner);

  const articleTsSnippet = `  {
    "id": "${articleId}",
    "title": ${JSON.stringify(articleTitle)},
    "slug": "${articleSlug}",
    "excerpt": ${JSON.stringify(articleExcerpt)},
    "primaryPortalUrl": "${primaryPortalUrl}",
    "primaryPortalLabel": "${primaryPortalLabel}",
    "content": ${JSON.stringify(articleContent, null, 6)},
    "category": "wiara",
    "categoryLabel": "CCN Historia & Biblia",
    "author": AUTHORS.cezary,
    "publishedAt": "2026-10-23T18:00:00.000Z",
    "dateFormatted": "23 października 2026",
    "imageUrl": "${imageUrl}",
    "imageCaption": "${imageCaption}",
    "readTimeMinutes": 10,
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": [
      "Szabat",
      "Niedziela",
      "Historia Kościoła",
      "Bacchiocchi",
      "Dekalog",
      "Stworzenie",
      "Cezary Rogowski"
    ],
    "scriptureReference": {
      "verse": "Ewangelia wg św. Marka 2:27–28",
      "text": "I mówił im: Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Dlatego Syn Człowieczy jest też Panem szabatu.",
      "strongCode": "G4521 (sabbaton - odpoczynek szabatu, pamiątka stworzenia)"
    },
    "biblicalCommentary": {
      "thesis": "Szabat jest darem Stwórcy dla człowieka od zarania dziejów, wskazującym na prymat relacji z Bogiem nad ludzką produktywnością i samowystarczalnością.",
      "verses": [
        { "ref": "Rdz 2:2-3", "text": "I odpoczął Bóg w siódmym dniu od wszelkiego dzieła... i pobłogosławił dzień siódmy, i uświęcił go." },
        { "ref": "Wj 20:8-11", "text": "Pamiętaj o dniu szabatu, aby go święcić. Sześć dni będziesz pracować... ale siódmy dzień jest szabatem PANA, twego Boga." },
        { "ref": "Mk 2:27-28", "text": "Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu." }
      ],
      "explanation": "Analiza biblijna i historyczna ukazuje, że siódmy dzień tygodnia został dany człowiekowi w Edenie przed nastaniem grzechu, a Nowy Testament nie zawiera nakazu zniesienia pamiątki stworzenia na rzecz pierwszego dnia tygodnia."
    }
  },\n`;

  articlesTs = articlesTs.replace('export const INITIAL_ARTICLES: Article[] = [\n', 'export const INITIAL_ARTICLES: Article[] = [\n' + articleTsSnippet);
  fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
  console.log('✅ Updated portals/ccn-news/src/data/articles.ts');
} else {
  console.log('ℹ️ Article already in portals/ccn-news/src/data/articles.ts');
}

// 2. Update scripts/portals_data.cjs under historia
const portalsDataPath = path.join(ROOT, 'scripts/portals_data.cjs');
let portalsData = fs.readFileSync(portalsDataPath, 'utf8');

if (!portalsData.includes(articleId)) {
  const historiaArticlesIndex = portalsData.indexOf("id: 'historia'");
  if (historiaArticlesIndex !== -1) {
    const articlesArrayStart = portalsData.indexOf("articles: [", historiaArticlesIndex);
    if (articlesArrayStart !== -1) {
      const insertionPoint = articlesArrayStart + "articles: [\n".length;
      const portalsSnippet = `      {
        id: '${articleId}',
        title: ${JSON.stringify(articleTitle)},
        slug: '${articleSlug}',
        excerpt: ${JSON.stringify(articleExcerpt)},
        category: 'manuskrypty',
        categoryLabel: 'CCN HISTORIA • BADANIA I ŹRÓDŁA',
        publishedAt: '2026-10-23T18:00:00Z',
        dateFormatted: '23 października 2026',
        imageUrl: '${imageUrl}',
        imageCaption: '${imageCaption}',
        readTimeMinutes: 10,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Szabat', 'Niedziela', 'Historia Kościoła', 'Bacchiocchi', 'Dekalog', 'Stworzenie', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia wg św. Marka 2:27–28',
          text: 'I mówił im: Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Dlatego Syn Człowieczy jest też Panem szabatu.',
          strongCode: 'G4521'
        },
        content: ${JSON.stringify(articleContent, null, 10)}
      },\n`;

      portalsData = portalsData.slice(0, insertionPoint) + portalsSnippet + portalsData.slice(insertionPoint);
      fs.writeFileSync(portalsDataPath, portalsData, 'utf8');
      console.log('✅ Updated scripts/portals_data.cjs (historia section)');
    }
  }
} else {
  console.log('ℹ️ Article already in scripts/portals_data.cjs');
}

console.log('🚀 Publishing complete in source data.');
