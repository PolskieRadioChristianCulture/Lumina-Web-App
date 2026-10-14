const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');
const SCRATCH_ROOT = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch');
const APOLOGETYKA_SRC = path.join(SCRATCH_ROOT, 'apologetyka_src');

console.log('=== PUBLISHING DEKALOG (BJW) ON THEMATIC PORTALS ===');

const dekalogArticle = {
  id: 'art-dekalog-dziesiec-przykazan-bozych-wujek-bjw',
  title: 'Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (BJW)',
  slug: 'dziesiec-przykazan-bozych-biblia-jakub-wujek-bjw-dekalog',
  excerpt: 'Księga Wyjścia 20,1–17 w klasycznym, natchnionym przekładzie ks. Jakuba Wujka (wyd. III 1962 r.). Poznaj autentyczne, nienaruszone brzmienie Dekalogu — z biblijnym zakazem kultu obrazów rytych oraz uświęceniem dnia siódmego (sabatu).',
  content: [
    '„I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli” (Księga Wyjścia 20,1–2, Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962 r.).',
    'Prezentujemy autentyczny, pełny tekst Dziesięciu Przykazań Bożych dokładnie według natchnionego tekstu Pisma Świętego w historycznym przekładzie ks. Jakuba Wujka (BJW):',
    'I. Nie będziesz miał bogów cudzych przede mną.',
    'II. Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią. Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą; a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich.',
    'III. Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno.',
    'IV. Pamiętaj, abyś dzień sobotni święcił. Sześć dni robic będziesz i będziesz wykonywał wszystkie roboty twoje; ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi. Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go.',
    'V. Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie.',
    'VI. Nie będziesz zabijał.',
    'VII. Nie będziesz cudzołożył.',
    'VIII. Nie będziesz kradzieży czynił.',
    'IX. Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu.',
    'X. Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest.',
    '(Księga Wyjścia 20,1-17, Biblia w przekładzie Ks. Jakuba Wujka, wyd.III 1962r.)',
    'KOMENTARZ REDAKCYJNY — CEZARY ROGOWSKI:',
    'Przekład ks. Jakuba Wujka z 1599 roku (oraz zrewidowane wydanie III z 1962 r.) to nie tylko monumentalny zabytek polszczyzny, ale przede wszystkim wierne świadectwo integralności Słowa Bożego. Tekst ten bez żadnych retuszy zachowuje pełne, natchnione brzmienie Dekalogu.',
    'Współczesna kultura religijna przyzwyczaiła wielu wiernych do skróconych formuł katechizmowych, w których z reguły całkowicie usunięte zostaje drugie przykazanie o zakazie kultu obrazów i posągów, a przykazanie czwarte o sabacie sprowadzone jest do ogólnego nakazu święcenia dni świętych. Aby uzupełnić brakujące przykazanie do liczby dziesięciu, dziesiąte przykazanie o pożądaniu zostało rozdzielone na dwa odrębne punkty.',
    'Pismo Święte w Księdze Wyjścia 20:1–17 ukazuje jednak Dekalog jako nierozerwalną całość Przymierza. Sam Zbawiciel, Jezus Chrystus, podkreślił w Ewangelii wg św. Mateusza (5:17–19), że ani jedna jota, ani jedna kreska nie przeminie z Zakonu. Apostoł Jakub napisał: „Ktokolwiek bowiem zachowa cały Zakon, a uchybi w jednym, stał się winnym wszystkich” (Jk 2:10).',
    'Dekalog ogłoszony na Synaju wyznacza wieczne standardy sprawiedliwości i miłości. Pierwsze cztery przykazania regulują naszą relację z Bogiem — Jego wyłączność, zakaz bałwochwalstwa, cześć dla Jego Imienia oraz odpoczynek sabatowy na pamiątkę Stworzenia. Kolejnych sześć przykazań chroni rodzinę, życie, wierność małżeńską, własność, prawdę i czystość ludzkiego serca.',
    'Jako Christian Culture stajemy na gruncie nieskażonego Słowa Bożego, zachęcając każdego czytelnika do osobistego sięgnięcia po Pismo Święte i weryfikowania każdej nauki w świetle natchnionego tekstu Biblii.'
  ],
  scriptureReference: {
    verse: 'Księga Wyjścia 20:1–17',
    text: 'I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli.',
    strongCode: 'H1697 (Aseret ha-Dvarim — Dziesięć Przykazań) / H8451 (Torah — Prawo Boże)'
  },
  sourceCitation: {
    sourceName: 'Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962r.',
    sourceUrl: 'https://polskieradio.cc/prawo',
    quotationDate: 'Wydanie III z 1962 r.',
    originalTitle: 'Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (Wj 20,1-17)'
  },
  category: 'dekalog',
  categoryLabel: 'DEKALOG · PISMO ŚWIĘTE (BJW)',
  author: {
    id: 'cezary-rogowski',
    name: 'Cezary Rogowski',
    role: 'Założyciel Christian Culture',
    status: 'Żonaty',
    avatarUrl: '/avatar_cezary_official.jpg',
    bio: 'Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC.'
  },
  publishedAt: '2026-10-14T19:30:00Z',
  dateFormatted: '14 października 2026',
  imageUrl: '/images/news/art-dekalog-dziesiec-przykazan-wujek.jpg',
  imageCaption: 'Ilustracja AI: Tablice Przymierza na Górze Synaj w majestatycznym świetle poranka (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia).',
  readTimeMinutes: 6,
  isHero: true,
  isPopular: true,
  popularRank: 1,
  tags: [
    'Dekalog',
    'Dziesięć Przykazań',
    'Biblia Jakuba Wujka',
    'BJW',
    'Księga Wyjścia 20',
    'Prawo Boże',
    'Sabat',
    'Synaj',
    'Cezary Rogowski'
  ]
};

// ==========================================
// 1. UPDATE scripts/portals_data.cjs (PRAWO & BIBLIOTEKA)
// ==========================================
console.log('1. Updating portals_data.cjs for PRAWO and BIBLIOTEKA...');
const portalsDataPath = path.join(PROJECT_ROOT, 'scripts/portals_data.cjs');
let portalsDataContent = fs.readFileSync(portalsDataPath, 'utf8');

// A. Insert into PRAWO articles (if not already there)
if (!portalsDataContent.includes('art-dekalog-dziesiec-przykazan-bozych-wujek-bjw')) {
  // Find id: 'prawo' and its articles: [
  const pravoIdx = portalsDataContent.indexOf("id: 'prawo',");
  if (pravoIdx !== -1) {
    const articlesStartIdx = portalsDataContent.indexOf("articles: [", pravoIdx);
    if (articlesStartIdx !== -1) {
      const insertPos = articlesStartIdx + "articles: [".length;
      const jsonStr = '\n      ' + JSON.stringify(dekalogArticle, null, 8).trim() + ',';
      portalsDataContent = portalsDataContent.slice(0, insertPos) + jsonStr + portalsDataContent.slice(insertPos);
      console.log('   ✓ Added Dekalog article to PRAWO articles in portals_data.cjs');
    }
  }

  // Also add to tickerItems of PRAWO
  const pravoTickerIdx = portalsDataContent.indexOf("id: 'prawo',");
  const tickerStart = portalsDataContent.indexOf("tickerItems: [", pravoTickerIdx);
  if (tickerStart !== -1) {
    const insertTicker = tickerStart + "tickerItems: [".length;
    const tickerLine = "\n      'DEKALOG BOŻY (BJW): Księga Wyjścia 20:1–17 w przekładzie ks. Jakuba Wujka — autentyczny, pełny tekst Dziesięciu Przykazań na polskieradio.cc/prawo',";
    portalsDataContent = portalsDataContent.slice(0, insertTicker) + tickerLine + portalsDataContent.slice(insertTicker);
    console.log('   ✓ Added Dekalog ticker to PRAWO in portals_data.cjs');
  }

  // B. Insert into BIBLIOTEKA articles
  const bibliotekaIdx = portalsDataContent.indexOf("id: 'biblioteka',");
  if (bibliotekaIdx !== -1) {
    const bibArticlesIdx = portalsDataContent.indexOf("articles: [", bibliotekaIdx);
    if (bibArticlesIdx !== -1) {
      const insertPos = bibArticlesIdx + "articles: [".length;
      const bibArticle = { ...dekalogArticle, category: 'klasyka', categoryLabel: 'PISMO ŚWIĘTE · PRZEKŁAD KS. JAKUBA WUJKA (BJW)', isHero: false, popularRank: 3 };
      const jsonStr = '\n      ' + JSON.stringify(bibArticle, null, 8).trim() + ',';
      portalsDataContent = portalsDataContent.slice(0, insertPos) + jsonStr + portalsDataContent.slice(insertPos);
      console.log('   ✓ Added Dekalog article to BIBLIOTEKA articles in portals_data.cjs');
    }
    const bibTickerIdx = portalsDataContent.indexOf("tickerItems: [", bibliotekaIdx);
    if (bibTickerIdx !== -1) {
      const insertTicker = bibTickerIdx + "tickerItems: [".length;
      const tickerLine = "\n      'BIBLIA JAKUBA WUJKA (BJW): Kompletny tekst Dekalogu z Księgi Wyjścia 20,1–17 (wyd. III 1962 r.) w zbiorach CCN Biblioteka',";
      portalsDataContent = portalsDataContent.slice(0, insertTicker) + tickerLine + portalsDataContent.slice(insertTicker);
      console.log('   ✓ Added Dekalog ticker to BIBLIOTEKA in portals_data.cjs');
    }
  }

  fs.writeFileSync(portalsDataPath, portalsDataContent, 'utf8');
}

// ==========================================
// 2. UPDATE APOLOGETYKA_SRC
// ==========================================
console.log('2. Updating APOLOGETYKA_SRC...');
const apoArticlesPath = path.join(APOLOGETYKA_SRC, 'src/data/articles.ts');
if (fs.existsSync(apoArticlesPath)) {
  let apoContent = fs.readFileSync(apoArticlesPath, 'utf8');
  if (!apoContent.includes('art-dekalog-dziesiec-przykazan-bozych-wujek-bjw')) {
    const apoArticle = {
      ...dekalogArticle,
      category: 'obrona',
      categoryLabel: 'APOLOGETYKA BIBLIJNA · INTEGRALNOŚĆ DEKALOGU (BJW)'
    };
    // Make previous hero not hero
    apoContent = apoContent.replace(/isHero:\s*true/g, 'isHero: false');
    // Prepend to INITIAL_ARTICLES
    const initIdx = apoContent.indexOf('export const INITIAL_ARTICLES: Article[] = [');
    if (initIdx !== -1) {
      const pos = initIdx + 'export const INITIAL_ARTICLES: Article[] = ['.length;
      const jsonStr = '\n  ' + JSON.stringify(apoArticle, null, 2) + ',';
      apoContent = apoContent.slice(0, pos) + jsonStr + apoContent.slice(pos);
    }
    // Prepend to BREAKING_NEWS
    const breakingIdx = apoContent.indexOf('export const BREAKING_NEWS: string[] = [');
    if (breakingIdx !== -1) {
      const pos = breakingIdx + 'export const BREAKING_NEWS: string[] = ['.length;
      const tick = '\n  "DEKALOG BOŻY WG BIBLII (BJW): Pełne brzmienie Wj 20:1–17 w tł. ks. Jakuba Wujka — obrona integralności natchnionego Słowa Bożego",';
      apoContent = apoContent.slice(0, pos) + tick + apoContent.slice(pos);
    }
    fs.writeFileSync(apoArticlesPath, apoContent, 'utf8');
    console.log('   ✓ Updated apologetyka_src articles.ts');
  }
}

// ==========================================
// 3. UPDATE portals/ccn-news/src/data/articles.ts
// ==========================================
console.log('3. Updating portals/ccn-news/src/data/articles.ts...');
const ccnNewsArticlesPath = path.join(PROJECT_ROOT, 'portals/ccn-news/src/data/articles.ts');
if (fs.existsSync(ccnNewsArticlesPath)) {
  let newsContent = fs.readFileSync(ccnNewsArticlesPath, 'utf8');
  if (!newsContent.includes('art-dekalog-dziesiec-przykazan-bozych-wujek-bjw')) {
    const ccnArticle = {
      ...dekalogArticle,
      category: 'wiara',
      categoryLabel: 'PISMO ŚWIĘTE · DEKALOG BOŻY (BJW)',
      isHero: false,
      isPopular: true,
      popularRank: 2
    };
    const initIdx = newsContent.indexOf('export const INITIAL_ARTICLES: Article[] = [');
    if (initIdx !== -1) {
      const pos = initIdx + 'export const INITIAL_ARTICLES: Article[] = ['.length;
      const jsonStr = '\n  ' + JSON.stringify(ccnArticle, null, 2) + ',';
      newsContent = newsContent.slice(0, pos) + jsonStr + newsContent.slice(pos);
    }
    const breakingIdx = newsContent.indexOf('export const BREAKING_NEWS: string[] = [');
    if (breakingIdx !== -1) {
      const pos = breakingIdx + 'export const BREAKING_NEWS: string[] = ['.length;
      const tick = '\n  "DEKALOG BOŻY WG BIBLII (BJW): Pełne natchnione brzmienie Wj 20:1–17 w tł. ks. Jakuba Wujka (wyd. III 1962 r.) na dedykowanych portalach CCN",';
      newsContent = newsContent.slice(0, pos) + tick + newsContent.slice(pos);
    }
    fs.writeFileSync(ccnNewsArticlesPath, newsContent, 'utf8');
    console.log('   ✓ Updated portals/ccn-news/src/data/articles.ts');
  }
}

console.log('=== DATA PATCH COMPLETED SUCCESSFULLY ===');
