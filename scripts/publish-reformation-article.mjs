import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const ARTICLE_DATA = {
  id: 'art-dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski',
  title: 'Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski',
  slug: 'dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski',
  excerpt: 'Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez w Wittenberdze. Dlaczego Sola Scriptura i Sola Gratia pozostają żywym wezwaniem do przemiany serca i sumienia? Obejrzyj film „Luter” na Christian Culture TV.',
  category: 'wiara',
  categoryLabel: 'CCN WIARA & HISTORIA • DZIEŃ REFORMACJI 2026',
  publishedAt: '2026-10-31T08:00:00Z',
  dateFormatted: '31 października 2026',
  imageUrl: '/images/news/art-dzien-reformacji-2026.jpg',
  imageCaption: '31 października: 509. rocznica Reformacji. Wittenberga 1517 r. i powrót do autorytetu Słowa Bożego.',
  readTimeMinutes: 8,
  isHero: true,
  isPopular: true,
  popularRank: 1,
  tags: [
    'Dzień Reformacji', 'Reformacja', 'Marcin Luter', 'Sola Scriptura', 'Sola Gratia',
    'Historia Kościoła', 'Cezary Rogowski', 'Wittenberga', 'Wormacja', 'Pismo Święte', 'Film Luter'
  ],
  author: {
    id: 'cezary-rogowski',
    name: 'Cezary Rogowski',
    role: 'Założyciel Christian Culture',
    avatarUrl: '/avatar_cezary_official.jpg'
  },
  youtubeVideoId: 'lug1BNspb8k',
  videoUrl: 'https://youtu.be/lug1BNspb8k',
  scriptureReference: {
    verse: 'List do Rzymian 1:16–17',
    text: 'Nie wstydzę się bowiem ewangelii Chrystusa, ponieważ jest ona mocą Boga ku zbawieniu dla każdego, kto wierzy (...) Sprawiedliwy zaś z wiary żyć będzie.',
    strongCode: 'G1343'
  },
  lexiconTerms: [
    {
      term: 'Sola Scriptura (2 Tm 3:16–17)',
      strongCode: 'G2315',
      definition: 'Zasada nadrzędnego autorytetu natchnionego Pisma Świętego (theopneustos — tchnięte przez Boga) jako jedynej nieomylnej normy wiary i życia chrześcijańskiego.'
    },
    {
      term: 'Sola Gratia (Ef 2:8–9)',
      strongCode: 'G5485',
      definition: 'Usprawiedliwienie i zbawienie człowieka jako całkowicie darmowy, niezasłużony dar Bożej łaski (charis) przyjmowany przez wiarę w Chrystusa, nie z ludzkich zasług.'
    }
  ],
  biblicalCommentary: {
    thesis: 'Prawdziwa Reformacja to powrót do Chrystusa i uświęcenie codziennego sumienia',
    explanation: 'Odnowa Kościoła i osobistej wiary nie polega na podtrzymywaniu plemiennych wojen religijnych sprzed stuleci, lecz na odwadze podporządkowania własnego życia i przekonań prawdzie Pisma Świętego.',
    verses: [
      {
        ref: 'Rz 1:16–17',
        text: 'Sprawiedliwy z wiary żyć będzie.'
      },
      {
        ref: 'Ef 2:8–10',
        text: 'Łaską bowiem jesteście zbawieni przez wiarę (...) stworzeni w Chrystusie Jezusie do dobrych uczynków.'
      },
      {
        ref: '2 Tm 3:16–17',
        text: 'Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do strofowania, do poprawy, do wychowania w sprawiedliwości.'
      },
      {
        ref: 'Ap 14:6–7',
        text: 'I widziałem innego anioła lecącego środkiem nieba, mającego wieczną Ewangelię, aby ją zwiastować mieszkańcom ziemi.'
      }
    ]
  },
  resourceLinks: [
    {
      label: 'Obejrzyj pełnometrażowy film „Luter” na Christian Culture TV (YouTube)',
      url: 'https://youtu.be/lug1BNspb8k'
    },
    {
      label: 'Interlinearna MojaBiblia CC — Badaj teksty oryginalne ze Strongiem',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      label: 'Akademia Biblijna — Kurs Codzienny „Z Biblią za Pan Brat”',
      url: 'https://polskieradio.cc/akademia/kurscodzienny'
    }
  ],
  content: [
    "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez dotyczących odpustów. Dzień ten zwyczajowo upamiętnia początek ruchu, który zmienił oblicze zachodniego chrześcijaństwa. Czy jest to jednak tylko rocznica wydarzenia sprzed pięciu stuleci? A może również okazja, by postawić sobie pytanie, czy moja własna wiara potrzebuje odnowy?",
    "Wydaje mi się, że prawdziwe dziedzictwo Reformacji nie polega na nieustannym sporze o to, kto zwyciężył w XVI wieku. Polega na odwadze sprawdzania własnych przekonań w świetle Pisma i powracania do Jezusa Chrystusa. Nie potrzebujemy kolejnego święta religijnego pozbawionego przemiany serca. Potrzebujemy prawdy, która dotyka naszego codziennego postępowania.",
    "[KADR: /images/news/luter-film-plakat-pionowy.jpg | Film „Luter” (2003, reż. Eric Till) z Josephem Fiennesem w roli Marcina Lutra — opowieść o człowieku, który w poszukiwaniu pokoju z Bogiem zmienił bieg dziejów Europy.]",
    "1. Co naprawdę wydarzyło się w Wittenberdze?",
    "Luter był augustiańskim zakonnikiem i profesorem teologii. Jego 95 tez otworzyło dyskusję o odpustach, pokucie i nadużyciach religijnych. Początkowo nie były gotowym programem stworzenia osobnego Kościoła. Dzięki drukowi kontrowersja szybko rozprzestrzeniła się daleko poza Wittenbergę.",
    "Tradycyjna scena przybicia tez do drzwi kościoła stała się symbolem; szczegóły tego gestu pozostają przedmiotem historycznej dyskusji. Samo rozpowszechnienie tez i rosnący spór są dobrze poświadczone. Reformacja przyniosła szerszy dostęp do Biblii, nowe formy nauczania oraz istotną debatę o zbawieniu. Jej historia obejmowała także bolesne podziały i przemoc. Nie służy prawdzie przemilczanie ani osiągnięć, ani błędów ludzi po którejkolwiek stronie.",
    "[KADR: /images/news/luter-film-kadr-staupitz-klasztor.jpg | Zmagania młodego mnicha w murach klasztoru w Erfurcie: Johann von Staupitz kieruje uwagę udręczonego Lutra z własnej niedoskonałości ku miłości i ofierze Jezusa Chrystusa.]",
    "2. Sola Scriptura — czy Słowo naprawdę ma ostatnie słowo?",
    "Reformacyjna zasada Sola Scriptura nie oznacza lekceważenia historii czy mądrości innych chrześcijan. Oznacza, że Pismo pozostaje najwyższym autorytetem dla nauki wiary. Apostoł Paweł wskazuje na jego rolę w nauczaniu, napominaniu i wychowaniu w sprawiedliwości (2 Tm 3,16–17), a Berejczycy sprawdzają głoszone im nauczanie przez badanie Pism (Dz 17,11).",
    "Zadaję sobie trudne pytanie: czy otwieram Biblię po to, aby Bóg mógł skorygować moje poglądy, czy szukam jedynie wersetów, które je potwierdzą? Reformacja jest żywa tam, gdzie człowiek ma odwagę powiedzieć: „Panie, jeśli się mylę, naucz mnie Twojej prawdy”.",
    "[KADR: /images/news/luter-film-kadr-wormacja-1521.jpg | Słynna obrona na Sejmie w Wormacji w 1521 roku przed cesarzem Karolem V: „Moje sumienie jest pojmane w Słowie Bożym. Odwołać niczego nie mogę i nie chcę. Tu stoję, inaczej nie mogę, niech mi Bóg dopomoże. Amen”.]",
    "3. Solus Christus i Sola Gratia — centrum, którego nie wolno zgubić",
    "Lutrowi towarzyszyło pytanie, jak grzeszny człowiek może zostać uznany za sprawiedliwego przed Bogiem. Rz 1,16–17 ukazuje Ewangelię jako moc Bożą ku zbawieniu, a Rz 3,21–26 przedstawia usprawiedliwienie przez odkupienie w Jezusie Chrystusie.",
    "Ef 2,8–10 daje nam niezwykle ważną kolejność: zostajemy zbawieni łaską przez wiarę, nie na podstawie naszych uczynków; zostajemy jednak stworzeni w Chrystusie do dobrych czynów. Łaska nie jest więc nagrodą za religijną doskonałość. Jest niezasłużonym darem, który prowadzi do przemienionego życia.",
    "Nie uratują mnie pieniądze, dobre uczynki rozumiane jako zapłata za zbawienie ani opinia innych o mojej pobożności. Jedynym Pośrednikiem jest Chrystus (1 Tm 2,5). Tylko Jemu należy się chwała. A moja wiara powinna wydawać owoce uczciwości, miłości i odpowiedzialności.",
    "[KADR: /images/news/luter-film-kadr-fryderyk-madry.jpg | Książę saski Fryderyk Mądry (w filmie wybitna rola Sir Petera Ustinova) — władca, który chronił wolność myśli i dał schronienie Lutrowi na zamku w Wartburgu, umożliwiając przetłumaczenie Nowego Testamentu na język ojczysty.]",
    "4. Od reformy instytucji do reformy mojego sumienia",
    "Znacznie łatwiej oceniać pomyłki ludzi sprzed pięciuset lat niż własne. Jezus przypomina jednak, że można zachować religijną formę i zaniedbywać sprawiedliwość, miłosierdzie i wierność (Mt 23,23–28).",
    "Jeśli mówię o Biblii, a oszukuję w interesach, potrzebuję reformy. Jeśli głoszę miłość, a upokarzam bliskich, potrzebuję reformy. Jeśli wzywam innych do pokuty, ale sam nie chcę przyznać się do winy, moje hasła są puste.",
    "Prawdziwa odnowa oznacza przyznanie prawdy, zaprzestanie krzywdy i podjęcie odpowiedzialności. Nikt nie zostaje zbawiony przez własną moralną sprawność, ale łaska Chrystusa nigdy nie jest usprawiedliwieniem hipokryzji (Tt 2,11–14).",
    "[KADR: /images/news/luter-film-kadr-rebel-genius.jpg | Prawdziwe przesłanie Reformacji to nie spór polityczny, lecz osobista przemiana życia w blasku Bożej łaski.]",
    "5. Wieczna Ewangelia dla współczesnego świata",
    "Ap 14,6–7 przedstawia wieczną Ewangelię głoszoną wszystkim narodom, językom i ludom. W jej centrum jest wezwanie do oddawania czci Stwórcy. To ważne przypomnienie, że reforma wiary nie kończy się na nowych strukturach organizacyjnych i polemikach. Prowadzi do żywej relacji z Bogiem.",
    "Nie trzeba dopasowywać każdej bieżącej wiadomości do proroctwa, aby zachować biblijną czujność. Chrześcijanin ma szukać prawdy i żyć nią z miłością oraz nadzieją. Świat potrzebuje przede wszystkim Ewangelii Jezusa Chrystusa, a nie kolejnego religijnego konfliktu prowadzonego dla prestiżu.",
    "6. Obejrzyj film „Luter” na Christian Culture TV",
    "Z okazji Dnia Reformacji zapraszam Cię do obejrzenia filmu „Luter – człowiek, który zmienił oblicze Kościoła”, udostępnionego z polskim lektorem na kanale Christian Culture TV.",
    "Film „Luther” z 2003 roku, wyreżyserowany przez Erica Tilla, przedstawia duchowe zmagania reformatora i wydarzenia prowadzące do Reformacji. W roli tytułowej występuje Joseph Fiennes. Film jest dramatem historycznym, a nie dokumentem, dlatego warto traktować go jako zachętę do dalszego poznawania historii i Pisma Świętego.",
    "Zobacz cały film z polskim lektorem bezpośrednio pod adresem: https://youtu.be/lug1BNspb8k lub w powyższym oknie odtwarzacza.",
    "Zaproś rodzinę lub znajomych, a po seansie przeczytajcie razem Rz 1,16–17 oraz Ef 2,8–10. Zastanówcie się: na czym opieramy pewność zbawienia? Co oznacza wolność w Chrystusie? Czy moja religijność pozostaje otwarta na korektę Słowa Bożego?",
    "7. Reformacja zaczyna się dziś",
    "Nie chcę, żeby 31 października był tylko datą w kalendarzu. Chciałbym, aby stał się dniem osobistej decyzji. Wróćmy do Biblii. Nie udawajmy bezbłędnych. Przyjmijmy zbawienie z łaski, a następnie uczmy się żyć w sposób godny Ewangelii.",
    "Modlitwa na Dzień Reformacji: Panie Jezu, daj nam pokorę wobec Twojego Słowa, odwagę do odrzucenia obłudy, miłość do ludzi o innych przekonaniach i wdzięczność za Twoją łaskę. Niech odnowa zacznie się we mnie. Amen.",
    "Podsumowanie Redakcyjne CCN News: Dzień Reformacji 2026 to zaproszenie do osobistego rachunku sumienia i oparcia życia na niewzruszonym fundamencie Pisma Świętego. Wszystkie publikacje, słuchowiska i materiały Christian Culture są w 100% bezpłatne. Pełny film z polskim lektorem dostępny jest na Christian Culture TV (YouTube: lug1BNspb8k)."
  ]
};

console.log('🚀 Rozpoczynam dodawanie artykułu o Reformacji do baz ekosystemu...');

// 1. Dodaj do portals/ccn-news/src/data/articles.ts
const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');

if (!articlesTs.includes(ARTICLE_DATA.slug)) {
  const marker = 'export const INITIAL_ARTICLES: Article[] = [';
  const index = articlesTs.indexOf(marker);
  if (index === -1) throw new Error('Nie znaleziono ARTICLES w articles.ts');

  // Skonstruuj string artykułu
  const articleStr = `  {\n    id: ${JSON.stringify(ARTICLE_DATA.id)},\n    title: ${JSON.stringify(ARTICLE_DATA.title)},\n    slug: ${JSON.stringify(ARTICLE_DATA.slug)},\n    excerpt: ${JSON.stringify(ARTICLE_DATA.excerpt)},\n    category: 'wiara',\n    categoryLabel: ${JSON.stringify(ARTICLE_DATA.categoryLabel)},\n    publishedAt: ${JSON.stringify(ARTICLE_DATA.publishedAt)},\n    dateFormatted: ${JSON.stringify(ARTICLE_DATA.dateFormatted)},\n    imageUrl: ${JSON.stringify(ARTICLE_DATA.imageUrl)},\n    imageCaption: ${JSON.stringify(ARTICLE_DATA.imageCaption)},\n    readTimeMinutes: ${ARTICLE_DATA.readTimeMinutes},\n    isHero: true,\n    isPopular: true,\n    popularRank: 1,\n    tags: ${JSON.stringify(ARTICLE_DATA.tags)},\n    author: AUTHORS.cezary,\n    youtubeVideoId: ${JSON.stringify(ARTICLE_DATA.youtubeVideoId)},\n    videoUrl: ${JSON.stringify(ARTICLE_DATA.videoUrl)},\n    scriptureReference: ${JSON.stringify(ARTICLE_DATA.scriptureReference, null, 6).trim()},\n    lexiconTerms: ${JSON.stringify(ARTICLE_DATA.lexiconTerms, null, 6).trim()},\n    biblicalCommentary: ${JSON.stringify(ARTICLE_DATA.biblicalCommentary, null, 6).trim()},\n    resourceLinks: ${JSON.stringify(ARTICLE_DATA.resourceLinks, null, 6).trim()},\n    content: ${JSON.stringify(ARTICLE_DATA.content, null, 6).trim()},\n  },\n`;

  articlesTs = articlesTs.slice(0, index + marker.length) + '\n' + articleStr + articlesTs.slice(index + marker.length);
  fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
  console.log('✅ Dodano artykuł do portals/ccn-news/src/data/articles.ts');
} else {
  console.log('ℹ️ Artykuł już obecny w articles.ts');
}

// 2. Dodaj do scripts/portals_data.cjs (portale historia, biblioteka, prawo)
const portalsDataPath = path.join(ROOT, 'scripts/portals_data.cjs');
let portalsData = fs.readFileSync(portalsDataPath, 'utf8');

if (!portalsData.includes(ARTICLE_DATA.slug)) {
  // Przygotuj wersję artykułu dla portals_data.cjs
  const portalArticleStr = `      {\n        id: ${JSON.stringify(ARTICLE_DATA.id)},\n        title: ${JSON.stringify(ARTICLE_DATA.title)},\n        slug: ${JSON.stringify(ARTICLE_DATA.slug)},\n        excerpt: ${JSON.stringify(ARTICLE_DATA.excerpt)},\n        category: 'manuskrypty',\n        categoryLabel: ${JSON.stringify(ARTICLE_DATA.categoryLabel)},\n        publishedAt: ${JSON.stringify(ARTICLE_DATA.publishedAt)},\n        dateFormatted: ${JSON.stringify(ARTICLE_DATA.dateFormatted)},\n        imageUrl: ${JSON.stringify(ARTICLE_DATA.imageUrl)},\n        imageCaption: ${JSON.stringify(ARTICLE_DATA.imageCaption)},\n        readTimeMinutes: ${ARTICLE_DATA.readTimeMinutes},\n        isHero: true,\n        isPopular: true,\n        popularRank: 1,\n        tags: ${JSON.stringify(ARTICLE_DATA.tags)},\n        author: {\n          id: 'cezary-rogowski',\n          name: 'Cezary Rogowski',\n          role: 'Założyciel Christian Culture',\n          avatarUrl: '/avatar_cezary_official.jpg'\n        },\n        youtubeVideoId: ${JSON.stringify(ARTICLE_DATA.youtubeVideoId)},\n        videoUrl: ${JSON.stringify(ARTICLE_DATA.videoUrl)},\n        scriptureReference: ${JSON.stringify(ARTICLE_DATA.scriptureReference, null, 10).trim()},\n        content: ${JSON.stringify(ARTICLE_DATA.content, null, 10).trim()},\n      },\n`;

  // Wstaw na początek articles w portalu 'historia'
  const historiaMarker = "id: 'historia',\n    title: 'CCN Historia',";
  const historiaIdx = portalsData.indexOf(historiaMarker);
  if (historiaIdx !== -1) {
    const articlesMarker = "articles: [";
    const artIdx = portalsData.indexOf(articlesMarker, historiaIdx);
    if (artIdx !== -1) {
      portalsData = portalsData.slice(0, artIdx + articlesMarker.length) + '\n' + portalArticleStr + portalsData.slice(artIdx + articlesMarker.length);
      console.log('✅ Dodano artykuł do portalu CCN Historia');
    }
  }

  // Wstaw na początek articles w portalu 'biblioteka'
  const bibliotekaMarker = "id: 'biblioteka',\n    title: 'CCN Biblioteka',";
  const bibIdx = portalsData.indexOf(bibliotekaMarker);
  if (bibIdx !== -1) {
    const articlesMarker = "articles: [";
    const artIdx = portalsData.indexOf(articlesMarker, bibIdx);
    if (artIdx !== -1) {
      portalsData = portalsData.slice(0, artIdx + articlesMarker.length) + '\n' + portalArticleStr + portalsData.slice(artIdx + articlesMarker.length);
      console.log('✅ Dodano artykuł do portalu CCN Biblioteka');
    }
  }

  // Wstaw na początek articles w portalu 'prawo'
  const prawoMarker = "id: 'prawo',\n    title: 'CCN Prawo',";
  const prawoIdx = portalsData.indexOf(prawoMarker);
  if (prawoIdx !== -1) {
    const articlesMarker = "articles: [";
    const artIdx = portalsData.indexOf(articlesMarker, prawoIdx);
    if (artIdx !== -1) {
      portalsData = portalsData.slice(0, artIdx + articlesMarker.length) + '\n' + portalArticleStr + portalsData.slice(artIdx + articlesMarker.length);
      console.log('✅ Dodano artykuł do portalu CCN Prawo');
    }
  }

  fs.writeFileSync(portalsDataPath, portalsData, 'utf8');
} else {
  console.log('ℹ️ Artykuł już obecny w portals_data.cjs');
}

// 3. Zaktualizuj paski informacyjne TV (ccn-news-ticker.json oraz news.json)
const tickerPath = path.join(ROOT, 'data/ccn-news-ticker.json');
let tickerData = JSON.parse(fs.readFileSync(tickerPath, 'utf8'));

const reformationTickers = [
  {
    title: "DZIEŃ REFORMACJI 2026: 509 lat od wystąpienia Marcina Lutra — powrót do autorytetu Pisma Świętego i Ewangelii łaski (Sola Scriptura, Sola Gratia).",
    category: "ŚWIĘTO REFORMACJI",
    url: "https://polskieradio.cc/news/dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski"
  },
  {
    title: "FILM „LUTER” NA CHRISTIAN CULTURE TV: Zobacz wybitny dramat historyczny o człowieku, który zmienił świat (reż. Eric Till, z polskim lektorem).",
    category: "KINO I HISTORIA",
    url: "https://youtu.be/lug1BNspb8k"
  },
  {
    title: "NOWY ARTYKUŁ CEZAREGO ROGOWSKIEGO: „Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski” już dostępny na polskieradio.cc/news.",
    category: "CCN NEWS • OPINIE",
    url: "https://polskieradio.cc/news/dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski"
  }
];

const tickerRef = [
  {
    topic: "DZIEŃ REFORMACJI 2026",
    text: "509 lat od 1517 r. Powrót do Pisma Świętego i Ewangelii łaski (Sola Scriptura, Sola Gratia) — czytaj na polskieradio.cc"
  },
  {
    topic: "KINO I HISTORIA",
    text: "Premiera filmu „Luter” na kanale Christian Culture TV — zobacz poruszający dramat historyczny na polskieradio.cc"
  },
  {
    topic: "NOWY ARTYKUŁ CCN",
    text: "Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski (Cezary Rogowski) — czytaj na polskieradio.cc"
  }
];

if (!tickerData.items) tickerData.items = [];
tickerData.items = [...tickerRef, ...tickerData.items.filter(t => !t.topic.includes('REFORMACJ') && !t.text.includes('Reformacj'))].slice(0, 15);
tickerData.updatedAt = new Date().toISOString();
fs.writeFileSync(tickerPath, JSON.stringify(tickerData, null, 2) + '\n', 'utf8');
console.log('✅ Zaktualizowano data/ccn-news-ticker.json');

// news.json jest celowo zachowany jako [] (wymóg Cloudflare Worker live RSS & Zero-QA lumina-straznik)
const newsJsonPath = path.join(ROOT, 'news.json');
fs.writeFileSync(newsJsonPath, '[]\n', 'utf8');
console.log('✅ news.json zweryfikowany jako []');

// 4. Polecaj w wyszukiwarce (cc-search-recommendations.json)
const recoPath = path.join(ROOT, 'data/cc-search-recommendations.json');
let recoData = JSON.parse(fs.readFileSync(recoPath, 'utf8'));

const recoItem = {
  tag: 'Dzień Reformacji 2026',
  title: 'Reformacja nie skończyła się w 1517 roku — film „Luter”',
  desc: '509 lat od 1517 r. Sola Scriptura, Sola Gratia i pełnometrażowy film (Cezary Rogowski).',
  url: '/news/dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski',
  icon: 'newspaper'
};

if (recoData.pools && recoData.pools[2]) {
  recoData.pools[2] = [recoItem, ...recoData.pools[2].filter(r => !r.url.includes('reformacj'))].slice(0, 4);
}
recoData.updatedAt = new Date().toISOString();
fs.writeFileSync(recoPath, JSON.stringify(recoData, null, 2) + '\n', 'utf8');
console.log('✅ Zaktualizowano data/cc-search-recommendations.json');

// 5. Zindeksuj w wyszukiwarce (data/cc-search-index.json i szukaj/catalog.json)
for (const f of ['data/cc-search-index.json', 'szukaj/catalog.json']) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  let idx = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const articleUrl = "https://polskieradio.cc/news/dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski";
  
  idx.items = idx.items.filter(x => x.url !== articleUrl);
  idx.items.unshift({
    title: "Dzień Reformacji 2026: Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski",
    category: "Wiedza & Publicystyka",
    url: articleUrl,
    description: "31 października 2026 r. (509. rocznica Reformacji). Marcin Luter, 95 tez, Sola Scriptura, Sola Gratia i film „Luter” na Christian Culture TV. Artykuł Cezarego Rogowskiego.",
    tags: [
      "reformacja", "dzień reformacji", "luter", "marcin luter", "film luter", "wittenberga",
      "wormacja", "sola scriptura", "sola gratia", "łaska", "pismo święte", "31 października",
      "historia kościoła", "cezary rogowski", "ccn news", "ccn historia", "polecane na dziś", "dziś"
    ],
    featured: true
  });

  idx.totalItems = idx.items.length;
  idx.updatedAt = new Date().toISOString();
  fs.writeFileSync(fp, JSON.stringify(idx, null, 2) + '\n', 'utf8');
  console.log(`✅ Zindeksowano w ${f} (total: ${idx.totalItems})`);
}

// 6. Zaktualizuj Mapę Ekosystemu (data/ecosystem-map.json)
const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
let map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const mapTopic = "CCN News / Historia: Publikacja artykułu i filmu „Dzień Reformacji 2026 — wróćmy do Pisma i Ewangelii łaski” (Cezary Rogowski)";

if (!map.updatesLog.some(u => u.topic === mapTopic)) {
  map.updatesLog.unshift({
    topic: mapTopic,
    date: "2026-10-31",
    agent: "A"
  });
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
  console.log('✅ Zaktualizowano data/ecosystem-map.json');
}

console.log('🎉 Wszystkie wpisy ekosystemu przygotowane pomyślnie!');
