import { Article, Author } from '../types';

export const AUTHORS: Record<string, Author> = {
  cezary: {
    id: 'cezary-rogowski',
    name: 'Cezary Rogowski',
    role: 'Założyciel Christian Culture',
    status: 'Żonaty',
    avatarUrl: '/avatar_cezary_official.jpg',
    bio: 'Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC.',
  },
  wioletta: {
    id: 'wioletta-rogowska',
    name: 'Wioletta Rogowska',
    role: 'Współzałożycielka Christian Culture',
    status: 'Mężatka',
    avatarUrl: '/avatar_wioletta_official.jpg',
    bio: 'Współzałożycielka Christian Culture, koordynatorka inicjatyw charytatywnych i ewangelizacyjnych.',
  },
  redakcja: {
    id: 'redakcja-ccn',
    name: 'Cezary Rogowski',
    role: 'Redakcja CCN',
    avatarUrl: '/avatar_cezary_official.jpg',
    bio: 'Założyciel Christian Culture. Materiały opracowane przez redakcję CCN.',
  },
  partner: {
    id: 'studio-dobrego-slowa',
    name: 'Studio Dobrego Słowa',
    role: 'Partner Misyjny Christian Culture',
    avatarUrl: 'https://i.ytimg.com/vi/ZQfzarxSDkU/hqdefault.jpg',
    bio: 'Oficjalny partner misyjny Christian Culture (studiods.pl). Twórcy głębokich rozważań biblijnych i programów o nadziei Ewangelii.',
  },
};


export const BREAKING_NEWS: string[] = [
  "CCN FINANSE + AUDIO (17:51): Cyfrowy pieniądz, prawo niedzielne i Apokalipsa 13 — analiza Cezarego Rogowskiego o CBDC i wolności sumienia",
  "Szafarstwo Boże: Ponad 2350 wersetów w Biblii dotyczy pieniędzy i odpowiedzialności za powierzone dobra",
  "Wolność od Zadłużenia: Zasada „dłużnik jest sługą wierzyciela” (Prz 22:7) i sprawdzona droga do wolności",
  "Mądrość Przysłów: Oszczędność, pracowitość i unikanie pochopnych poręczeń fundamentem stabilności",
  "Serce Dawcy: „Więcej szczęścia jest w dawaniu aniżeli w braniu” (Dz 20:35) – tajemnica Bożego pomnożenia"
];

export const INITIAL_ARTICLES: Article[] = [
  {
    "id": "art-cbdc-prawo-niedzielne-apokalipsa-13",
    "title": "Cyfrowy pieniądz, prawo niedzielne i Apokalipsa 13. Czy technologia może stać się narzędziem przymusu religijnego?",
    "slug": "cbdc-prawo-niedzielne-apokalipsa-13",
    "excerpt": "Dyskusja o cyfrowych walutach banków centralnych (CBDC) coraz częściej wykracza poza ekonomię. Chrześcijanie pytają, czy programowalny pieniądz i całkowita kontrola transakcji mogą w przyszłości posłużyć do wywierania presji na sumienie — zwłaszcza w sporze o dzień święty i wolność religijną.",
    "category": "szafarstwo",
    "categoryLabel": "FINANSE, TECHNOLOGIA, WOLNOŚĆ RELIGIJNA I PROROCTWA BIBLIJNE",
    "publishedAt": "2026-10-15T10:00:00Z",
    "updatedAt": "2026-10-17T11:00:00Z",
    "dateFormatted": "15 października 2026",
    "imageUrl": "/images/news/art-cbdc-prawo-niedzielne-apokalipsa-13.jpg",
    "imageCaption": "Ilustracja redakcyjna: Otwarta Biblia obok tradycyjnego pieniądza i cyfrowego systemu transakcyjnego — pytanie o granice kontroli finansowej i wolność sumienia (ilustracja poglądowa wygenerowana z pomocą AI).",
    "readTimeMinutes": 9,
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": [
      "CBDC",
      "Cyfrowy Pieniądz",
      "Apokalipsa 13",
      "Prawo Niedzielne",
      "Wolność Religijna",
      "Sabat",
      "Dekalog",
      "Finanse",
      "Cezary Rogowski"
    ],
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture & Redaktor Naczelny CCN",
      "status": "Żonaty",
      "avatarUrl": "/avatar_cezary_official.jpg",
      "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
    },
    "audio": {
      "src": "/audio/ccn/cbdc-prawo-niedzielne-apokalipsa-13.m4a",
      "title": "Programowalny pieniądz: CBDC a proroctwo Apokalipsy",
      "reader": "AI Lektor",
      "durationSeconds": 1071.368,
      "driveId": "1armTC6OXOU5XI6hZ9BkBR2amYrLeXCdr",
      "publicationStatus": "published",
      "peaks": [54,38,39,45,65,25,38,41,53,54,56,38,56,62,59,60,63,44,47,49,64,60,59,67,49,65,56,80,71,56,53,53,49,49,56,64,52,51,72,73,84,51,66,66,68,56,51,60,64,61,67,44,45,48,51,48,45,44,39,57,45,38,40,48]
    },
    "scriptureReference": {
      "verse": "Objawienie Jana (Apokalipsa) 13:16–17 · Księga Wyjścia 20:8–11 · Objawienie Jana 14:12 · Dzieje Apostolskie 5:29",
      "text": "I sprawia, aby wszyscy, mali i wielcy, bogaci i ubodzy, wolni i niewolnicy, przyjęli znamię na prawą rękę swoją albo na czoło swoje, i aby nikt nie mógł kupić ani sprzedać, tylko ten, kto ma znamię, imię bestii lub liczbę jej imienia.",
      "strongCode": "G5480 (Charagma — Znamię) / G4453 (Poleo — Sprzedawać)"
    },
    "sourceCitation": {
      "sourceName": "Europejski Bank Centralny (projekt cyfrowego euro), Bank Rozrachunków Międzynarodowych (BIS), Rezerwa Federalna USA (Fed) & Biblia",
      "sourceUrl": "https://www.ecb.europa.eu/euro/digital_euro/html/index.en.html",
      "quotationDate": "15 października 2026 r.",
      "originalTitle": "Dokumenty informacyjne EBC dot. cyfrowego euro · Raporty BIS o CBDC · Biblia: Wj 20:8–11; Dz 5:29; Ap 13:11–18; Ap 14:6–12"
    },
    "content": [
      "Dyskusja o cyfrowych walutach banków centralnych (CBDC) coraz częściej wykracza poza ekonomię. Chrześcijanie pytają, czy programowalny pieniądz i całkowita kontrola transakcji mogą w przyszłości posłużyć do wywierania presji na sumienie — zwłaszcza w sporze o dzień święty i wolność religijną.",
      "1. Cyfrowa rewolucja pieniądza",
      "Na całym świecie banki centralne prowadzą badania, testy lub wdrożenia cyfrowych walut banków centralnych, określanych skrótem CBDC (Central Bank Digital Currency). Europejski Bank Centralny rozwija projekt cyfrowego euro, Bank Rozrachunków Międzynarodowych analizuje modele rozliczeń transgranicznych, a wiele państw testuje własne systemy płatności cyfrowych.",
      "Zwolennicy CBDC wskazują na wygodę, szybkość rozliczeń, bezpieczeństwo systemowe oraz walkę z przestępczością finansową. Krytycy zwracają jednak uwagę na drugą stronę tego procesu: postępujące ograniczanie roli gotówki oraz rosnącą możliwość technicznego nadzoru nad każdą transakcją obywatela.",
      "Gotówka ma jedną cechę, której nie posiada żaden system cyfrowy: pozwala na zawarcie legalnej transakcji bez udziału pośrednika technicznego i bez budowania pełnego profilu zachowań konsumenta.",
      "2. Programowalny pieniądz i granice wolności",
      "W debacie o CBDC pojawia się pojęcie pieniądza programowalnego. W sensie technicznym oznacza ono możliwość przypisania środkom określonych reguł użycia: czasu ważności, kategorii zakupów, limitów geograficznych, limitów kwotowych lub warunków aktywacji.",
      "Należy uczciwie podkreślić: banki centralne w Europie i USA deklarują dziś, że ich celem nie jest całkowite zastąpienie gotówki ani polityczna kontrola obywateli. Jednocześnie historia uczy, że gdy powstaje potężna infrastruktura techniczna, kolejne rządy w sytuacjach kryzysowych mogą sięgać po nią szerzej, niż zakładali jej pierwotni twórcy.",
      "To właśnie w tym miejscu pytanie technologiczne staje się pytaniem etycznym i duchowym: co się stanie, jeśli dostęp do kupowania i sprzedawania zostanie całkowicie uzależniony od centralnego systemu cyfrowego?",
      "3. Apokalipsa 13 i ekonomiczny wymiar przymusu",
      "Dla czytelników Pisma Świętego pytanie to brzmi znajomo. W 13. rozdziale Księgi Apokalipsy czytamy o systemie przymusu, który łączy autorytet religijny, polityczny i ekonomiczny:",
      "„I sprawia, że wszyscy: mali i wielcy, bogaci i biedni, wolni i niewolnicy otrzymują znamię na prawą rękę lub na czoło, i że nikt nie może kupić ni sprzedać, kto nie ma znamienia...” (Ap 13,16–17).",
      "Tekst biblijny nie opisuje samego pieniądza cyfrowego jako „znamienia bestii”. Samo używanie karty płatniczej, przelewu bankowego czy aplikacji finansowej nie jest grzechem ani odstępstwem od Boga. Istotą proroctwa Apokalipsy 13 i 14 nie jest sam środek płatniczy, lecz wymuszona lojalność religijno-moralna, w której człowiek staje przed wyborem między posłuszeństwem Bogu a podporządkowaniem się ludzkiemu nakazowi sprzecznemu z Bożym prawem.",
      "Technologia finansowa nie jest więc proroctwem sama w sobie, ale może stworzyć infrastrukturę, dzięki której opisany w Apokalipsie mechanizm wykluczenia ekonomicznego („nikt nie może kupić ani sprzedać”) staje się technicznie łatwy do wyobrażenia w skali globalnej.",
      "4. Prawo niedzielne a historia i współczesność",
      "W chrześcijańskiej refleksji eschatologicznej — szczególnie w tradycji protestanckiej i adwentystycznej — od dawna zwraca się uwagę na znaczenie czwartego przykazania Dekalogu oraz sporu o dzień święty.",
      "W historii chrześcijaństwa prawa niedzielne nie są fikcją. Już w 321 roku cesarz Konstantyn wydał edykt nakazujący odpoczynek w „czcigodnym dniu słońca”. W kolejnych stuleciach w różnych krajach Europy i Ameryki pojawiały się tzw. blue laws — przepisy regulujące handel, pracę i życie publiczne w niedzielę.",
      "Współcześnie temat powraca w nowych formach: jako postulaty ograniczenia handlu w niedzielę, ochrony „wspólnego dnia odpoczynku”, troski o rodzinę, dobrostan pracowników lub redukcję konsumpcji i emisji ze względów klimatycznych.",
      "Warto zachować rozróżnienie: troska o odpoczynek pracowników jest zrozumiałym tematem społecznym, natomiast problem zaczyna się wtedy, gdy państwo zaczyna sankcjonować określony dzień o charakterze religijnym jako normę przymusową, naruszającą wolność sumienia mniejszości religijnych.",
      "5. Sabat i niedziela — spór o autorytet",
      "W perspektywie biblijnej czwarty przepis Dekalogu wskazuje na siódmy dzień tygodnia — Sabat — jako pamiątkę stworzenia:",
      "„Pamiętaj o dniu sabatu, aby go święcić... gdyż w sześciu dniach uczynił Pan niebo i ziemię, morze oraz wszystko, co w nich jest, a odpoczął dnia siódmego” (Wj 20,8–11).",
      "Dlatego w Księdze Apokalipsy końcowe wezwanie Ewangelii brzmi: „Oddajcie pokłon Temu, który stworzył niebo i ziemię, i morze, i źródła wód” (Ap 14,7), a lud Boży zostaje opisany jako ci, „którzy strzegą przykazań Bożych i wiary Jezusa” (Ap 14,12).",
      "W tym ujęciu przyszły konflikt wokół prawa niedzielnego nie dotyczy wyłącznie kalendarza, lecz pytania o najwyższy autorytet: czy ostateczną miarą posłuszeństwa człowieka jest Słowo Boże, czy ludzka tradycja poparta przymusem prawa i ekonomii?",
      "6. Co jest faktem, a co interpretacją?",
      "Rzetelne dziennikarstwo chrześcijańskie wymaga jasnego oddzielenia faktów od prognoz:",
      "• Faktem jest rozwój projektów CBDC i postępująca cyfryzacja płatności na świecie.\n• Faktem jest techniczna możliwość tworzenia programowalnych reguł dla cyfrowych pieniędzy.\n• Faktem są historyczne i współczesne regulacje dotyczące niedzieli jako dnia wolnego od handlu i pracy.\n• Nie jest natomiast faktem, że istnieje dziś jedno jawne prawo światowe łączące CBDC z przymusem religijnym.\n• Kwestia przyszłego połączenia nadzoru finansowego z presją na sumienie należy do obszaru teologicznej interpretacji proroctw oraz analizy ryzyk dla wolności obywatelskich.",
      "Takie rozróżnienie chroni wierzących zarówno przed naiwnością, jak i przed budowaniem sensacji czy wyznaczaniem dat.",
      "7. Chrześcijańska odpowiedź: czujność zamiast paniki",
      "Jezus nie wzywał swoich uczniów do paniki, lecz do duchowej trzeźwości: „Patrzcie, aby was kto nie zwiódł” (Mt 24,4). Chrześcijanin nie powinien żyć w lęku przed każdym nowym rozwiązaniem technicznym, ale też nie powinien rezygnować z roztropności.",
      "Praktyczna postawa obejmuje trzy wymiary:",
      "1. Obrona wolności sumienia i gotówki jako przestrzeni zwykłej prywatności obywatelskiej.\n2. Rozsądek finansowy — życie bez nadmiernego zadłużenia, uczciwość, prostota i gotowość do wzajemnej pomocy we wspólnocie.\n3. Duchowa wierność Bogu już dziś — bo człowiek, który nie potrafi być wierny w małych wyborach dnia codziennego, nie stanie się nagle wierny w godzinie wielkiej próby (Łk 16,10; Dz 5,29).",
      "Podsumowanie",
      "Cyfrowy pieniądz sam w sobie nie jest spełnieniem Apokalipsy 13. Pokazuje jednak, że współczesny świat buduje narzędzia techniczne, które w rękach nietolerancyjnej władzy mogłyby posłużyć do wywierania bezprecedensowej presji ekonomicznej. Dlatego biblijne przesłanie na dziś nie brzmi: „bój się technologii”, lecz: „poznaj prawdę, chroń wolność sumienia i pozostań wierny Bogu ponad wszystko”.",
      "Źródła i teksty biblijne",
      "• Biblia: Wj 20,8–11; Łk 16,10; Dz 5,29; Mt 24,4; Ap 13,11–18; Ap 14,6–12.\n• Europejski Bank Centralny — dokumenty informacyjne dotyczące projektu cyfrowego euro.\n• Bank Rozrachunków Międzynarodowych (BIS) — raporty o architekturze CBDC i płatnościach cyfrowych.\n• Rezerwa Federalna USA (Fed) — materiały analityczne dotyczące pieniądza cyfrowego banku centralnego."
    ]
  },
  {
    "id": "art-wyjscie-z-dlugow-zasady",
    "title": "Dłużnik jest sługą wierzyciela: 7 kroków do całkowitej wolności finansowej",
    "slug": "dluznik-jest-sluga-wierzyciela-7-krokow-do-wolnosci",
    "excerpt": "Kredyty konsumpcyjne i karty kredytowe stały się współczesną formą niewolnictwa. Jak według biblijnych zasad spłacić wszystkie długi i nigdy więcej do nich nie wracać.",
    "category": "dlugi",
    "categoryLabel": "WOLNOŚĆ OD DŁUGÓW · STRATEGIA",
    "publishedAt": "2026-10-03T06:00:00Z",
    "dateFormatted": "3 października 2026",
    "imageUrl": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    "imageCaption": "Wolność finansowa: zerwanie kajdan konsumpcyjnego zadłużenia.",
    "readTimeMinutes": 8,
    "isHero": false,
    "isPopular": true,
    "popularRank": 2,
    "tags": [
      "Finanse",
      "Długi",
      "Księga Przysłów",
      "Budżet",
      "Cezary Rogowski"
    ],
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture",
      "avatarUrl": "/avatar_cezary_official.jpg"
    },
    "scriptureReference": {
      "verse": "Księga Przysłów 22:7",
      "text": "Bogaty panuje nad ubogimi, a dłużnik jest sługą wierzyciela.",
      "strongCode": "H5650 (ebed - niewolnik, sługa poddany woli pana)"
    },
    "content": [
      "Żyjemy w kulturze, która za cel stawia sobie natychmiastową gratyfikację kosztem przyszłości. Banki i instytucje pożyczkowe sprzedają iluzję bogactwa, uzależniając ludzi od comiesięcznych rat i odbierając im spokój snu.",
      "Pismo Święte nigdy nie pochwala zadłużania się na konsumpcję. W Księdze Przysłów czytamy bez owijania w bawełnę: dłużnik staje się sługą. Spłata długów to nie tylko kwestia matematyki, ale przede wszystkim decyzji duchowej i zmiany stylu życia.",
      "Zastosowanie metody kuli śnieżnej (spłacanie od najmniejszego długu do największego), bezwzględne zablokowanie nowych pożyczek i dyscyplina budżetowa pozwalają w ciągu 2-3 lat odzyskać pełną wolność i suwerenność finansową."
    ]
  },
  {
    "id": "art-budzet-domowy-z-madroscia",
    "title": "Planowanie i gospodarność: Jak stworzyć niewzruszony budżet domowy",
    "slug": "planowanie-i-gospodarnosc-budzet-domowy",
    "excerpt": "Mądra niewiasta i gospodarny mąż: jak zarządzać comiesięcznymi przychodami, by starczało na potrzeby, oszczędności na czarną godzinę i szczodrą pomoc potrzebującym.",
    "category": "budzet",
    "categoryLabel": "BUDŻET DOMOWY · GOSPODARNOŚĆ",
    "publishedAt": "2026-10-02T13:00:00Z",
    "dateFormatted": "2 października 2026",
    "imageUrl": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    "imageCaption": "Planowanie wydatków z ołówkiem w ręku: mądrość gospodarza.",
    "readTimeMinutes": 6,
    "isHero": false,
    "isPopular": true,
    "popularRank": 2,
    "tags": [
      "Budżet",
      "Oszczędności",
      "Gospodarność",
      "Wioletta Rogowska"
    ],
    "author": {
      "id": "wioletta-rogowska",
      "name": "Wioletta Rogowska",
      "role": "Współzałożycielka Christian Culture",
      "avatarUrl": "/avatar_wioletta_official.jpg"
    },
    "scriptureReference": {
      "verse": "Ewangelia wg św. Łukasza 14:28",
      "text": "Któż bowiem z was, chcąc zbudować wieżę, nie usiądzie wpierw i nie obliczy kosztów, czy ma na wykończenie?",
      "strongCode": "G5585 (psephizo - obliczać, kalkulować za pomocą kamyków)"
    },
    "content": [
      "Brak planu finansowego to planowanie porażki. Wiele chrześcijańskich małżeństw przeżywa kryzysy nie z powodu braku miłości, lecz z powodu chronicznego stresu finansowego wywołanego chaosem w wydatkach.",
      "Budżet zerowy – w którym każda zarobiona złotówka ma przypisane swoje zadanie przed rozpoczęciem miesiąca – eliminuje pytanie „gdzie podziały się nasze pieniądze?”. Daje poczucie kontroli i zgodę między małżonkami.",
      "Odkładanie funduszu awaryjnego na nieprzewidziane wydatki chroni rodzinę przed paniką w razie awarii samochodu czy utraty pracy, budując dom na skale rozwagi."
    ]
  },
  {
    "id": "art-wlasciciel-czy-szafarz",
    "title": "Właściciel czy szafarz? Prawdziwy sekret obfitości i Bożej opieki",
    "slug": "wlasciciel-czy-szafarz-sekret-obfitosci",
    "excerpt": "Zrozumienie, że wszystko należy do Boga (Ps 24:1), uwalnia od chciwości, lęku o jutro i otwiera źródło prawdziwego Bożego zaopatrzenia.",
    "category": "szafarstwo",
    "categoryLabel": "SZAFARSTWO · FUNDAMENTY WIARY",
    "publishedAt": "2026-10-01T15:00:00Z",
    "dateFormatted": "1 października 2026",
    "imageUrl": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80",
    "imageCaption": "Boże zaopatrzenie: zaufanie Temu, który karmi ptaki niebieskie.",
    "readTimeMinutes": 7,
    "isHero": false,
    "isPopular": true,
    "popularRank": 3,
    "tags": [
      "Szafarstwo",
      "Dziesięcina",
      "Hojność",
      "Cezary Rogowski"
    ],
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture",
      "avatarUrl": "/avatar_cezary_official.jpg"
    },
    "scriptureReference": {
      "verse": "Księga Psalmów 24:1",
      "text": "Do Pana należy ziemia i to, co ją napełnia, świat i jego mieszkańcy.",
      "strongCode": "H776 (erets - ziemia, wszelka materia)"
    },
    "content": [
      "Kiedy uważamy się za właścicieli pieniędzy, każda strata rodzi gniew, a każdy wydatek niepokój. Kiedy jednak pojmujemy, że jesteśmy jedynie zarządcami (szafarzami) Bożego majątku, perspektywa ulega całkowitemu uzdrowieniu.",
      "Bóg jako Właściciel bierze odpowiedzialność za zaopatrzenie swoich wiernych sług. Hojność i wspieranie dzieła Ewangelii oraz ubogich nie jest stratą, lecz najlepszą inwestycją w wieczność.",
      "Doświadczenie tysięcy wierzących potwierdza: otwarta dłoń, która potrafi dawać, jest tą samą dłonią, w którą Bóg może z zaufaniem powierzyć kolejne błogosławieństwa."
    ]
  }
];
