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
  andrzej: {
    id: 'andrzej-thiel',
    name: 'Andrzej Thiel',
    role: 'Autor rozważań „Cuda Każdego Dnia”',
    avatarUrl: '/avatar_andrzej_thiel.jpg',
    bio: 'Ewangelista, publicysta i autor codziennych rozważań biblijnych „Cuda Każdego Dnia”.',
  },
  redakcja: {
    id: 'redakcja-ccn',
    name: 'Redakcja Biblijna CCN News',
    role: 'Dział Wiadomości i Analiz Teologicznych',
    avatarUrl: '/ccn-logo-square.png',
    bio: 'Kolegium redakcyjne dziennikarzy i teologów analizujących wydarzenia z kraju i ze świata w świetle Pisma Świętego.',
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
  'Z Biblią za Pan Brat: Dzień 3 — Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu (Rdz 3:1–24)',
  'Studio Dobrego Słowa: Odc. 26 | Dlaczego SĄD jest dobrą nowiną?',
  'Ukraina: ONZ apeluje o ochronę cywilów po kolejnych atakach',
  'Polska: rząd ogłosił przyjęcie projektu budżetu na 2027 rok',
  '2 października: ONZ wzywa do dialogu i przeciwdziałania przemocy',
  '#JestNadzieja: Kościół adwentystyczny informuje o rozpoczęciu OneVoice27 w Polsce',
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-z-biblia-za-pan-brat-dzien-03',
    title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
    slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
    excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
    category: 'wiara',
    categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
    publishedAt: '2026-10-03',
    dateFormatted: '3 października 2026',
    imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
    imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
    readTimeMinutes: 5,
    isHero: false,
    isPopular: true,
    popularRank: 1,
    tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski', 'Wiara'],
    author: AUTHORS.cezary,
    scriptureReference: {
      verse: 'Księga Rodzaju 3:15',
      text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
      strongCode: 'H2233',
    },
    lexiconTerms: [
      {
        term: 'Protoewangelia (Rdz 3:15)',
        strongCode: 'H2233',
        definition: 'Pierwsza obietnica Ewangelii — zapowiedź zwycięstwa Chrystusa nad szatanem i grzechem.',
      },
    ],
    relatedCourse: {
      title: 'Z Biblią za Pan Brat: Miesiąc 1 – Księga Rodzaju',
      lesson: 'Dzień 3: Gdzie jesteś? (Rdz 3:1–24)',
      url: '/akademia/kurscodzienny/dzien-03',
      badge: 'KURS CODZIENNY',
    },
    content: [
      'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
      'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
      'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.',
      'Psychologia poczucia winy potwierdza, że lęk i wstyd rodzą w nas mechanizm ucieczki i obwiniania innych, dokładnie tak, jak uczynił to Adam i Ewa. Prawda Królestwa uderza jednak z wyzwalającą, triumfalną mocą: Bóg nie zrezygnował z Ciebie w Edenie; zapowiedział zwycięstwo Potomka – Jezusa Chrystusa, który zmiażdży głowę węża i uwolni nas z niewoli śmierci.',
      '1. Strategia Pokusy: Podważenie Słowa i Dobroci Boga. Zaledwie dwa rozdziały wcześniej opisano świat, o którym Stwórca powiedział: „Oto było bardzo dobre” (Rdz 1:31). Sytuacja zmienia się gwałtownie wraz z pojawieniem się węża, który stawia subwersywne pytanie: „Czy Bóg rzeczywiście powiedział: Nie będziecie jeść ze wszystkich drzew tego ogrodu?” (Rdz 3:1). Pokusa nie uderza wprost w samo przykazanie – jej celem jest podważenie fundamentalnego zaufania do moralnego charakteru i dobroci Boga.',
      '2. Anatomia Grzechu i Próba Autonomii. Wąż przechodzi od insynuacji do otwartego zaprzeczenia Bożemu ostrzeżeniu („Na pewno nie umrzecie” — Rdz 3:4). Obiecuje człowiekowi autonomię („będziecie jak bogowie”), ironicznie ignorując fakt, że człowiek już wcześniej został obdarzony boskim obrazem i godnością (Rdz 1:26–27). W istocie pierwszy grzech nie polegał wyłącznie na konsumpcji zakazanego owocu, lecz stanowił fundamentalny bunt: człowiek odrzucił Słowo Stwórcy, by samodzielnie decydować o dobru i złu (zobaczyła → zapragnęła → wzięła → zjadła; 1 J 2:16).',
      '3. Skutki: Wstyd, Strach i Ucieczka. Zgodnie z zapowiedzią, otwarcie oczu nie przyniosło transcendencji, lecz bolesną świadomość nagości i wstydu. Człowiek po raz pierwszy w historii doświadczył paraliżującego lęku przed obecnością Boga. Rezultatem stał się mechanizm obronny: szycie liści figowych, ucieczka w cień drzew oraz przerzucanie winy na innych i na samego Boga („Kobieta, którą mi dałeś…” — Rdz 3:12).',
      '4. Głos Boga i Protewangelia (Rdz 3:15). Kluczowym punktem zwrotnym dramatu w Edenie jest interwencja Boga. Wszechwiedzący Stwórca nie czeka biernie na inicjatywę człowieka – sam wychodzi naprzeciw i stawia egzystencjalne pytanie: „Gdzie jesteś?” (Rdz 3:9). Mimo bolesnych konsekwencji grzechu, Bóg natychmiast ogłasza pierwszą dobrą nowinę Biblii — Protewangelię (Rdz 3:15): Potomek kobiety stoczy śmiertelny bój z wężem, ostatecznie miażdżąc jego głowę. Nowy Testament jednoznacznie identyfikuje tego Potomka jako Jezusa Chrystusa, który objawił się po to, aby zniszczyć dzieła diabła (1 J 3:8).',
      'Podsumowanie Redakcyjne CCN: Rozdział trzeci Księgi Rodzaju uczy, że religijne próby samoratowania (symboliczne „liście figowe”) są nieskuteczne; prawdziwe okrycie i sprawiedliwość zapewnia wyłącznie sam Bóg (szaty ze skór — Rdz 3:21). Historia Edenu nie kończy się zamknięciem bram raju, lecz stanowi linię startową wielkiego planu odkupienia, który znajduje swój punkt kulminacyjny w krzyżu Chrystusa i ostateczne domknięcie w Nowej Jerozolimie (Ap 22).',
    ],
  },
  {
  "id": "news-sds-odc-26-sad-dobra-nowina-20261002",
  "title": "Studio Dobrego Słowa: Odc. 26 | Dlaczego SĄD jest dobrą nowiną?",
  "category": "kraj",
  "categoryLabel": "KRAJ · STUDIO DOBREGO SŁOWA",
  "excerpt": "W najnowszym 26. odcinku Studio Dobrego Słowa porusza jeden z najbardziej intrygujących tematów biblijnych: dlaczego Boży sąd w Piśmie Świętym jest w istocie radosną, wyzwalającą nowiną dla wierzących?",
  "content": [
    "W najnowszej publikacji z cyklu biblijnego przygotowanego przez Studio Dobrego Słowa (oficjalnego partnera misyjnego Christian Culture), autorzy podejmują kluczowe zagadnienie sprawiedliwości Bożej i ostatecznego sądu.",
    "Dla wielu ludzi pojęcie sądu kojarzy się wyłącznie z lękiem, karą i potępieniem. Jednak egzegeza biblijna Starego i Nowego Testamentu odsłania zupełnie inną perspektywę: Boży sąd to moment ocalenia, rehabilitacji prawdy, stanięcia Boga po stronie uciśnionych i ostatecznego zatriumfowania łaski Chrystusa.",
    "Gdy stajemy przed obliczem Boga w zaufaniu do ofiary Jezusa Chrystusa, sąd staje się dla wierzącego radosną nowiną — uwolnieniem od oskarżeń i wejściem w Boży pokój.",
    "Materiał wideo w całości można obejrzeć w odtwarzaczu poniżej oraz bezpośrednio na kanale YouTube Studia Dobrego Słowa."
  ],
  "slug": "studio-dobrego-slowa-odc-26-dlaczego-sad-jest-dobra-nowina",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "https://i.ytimg.com/vi/ZQfzarxSDkU/hqdefault.jpg",
  "imageCaption": "Studio Dobrego Słowa — Odc. 26: Dlaczego SĄD jest dobrą nowiną? (studiods.pl)",
  "readTimeMinutes": 4,
  "isHero": true,
  "isPopular": true,
  "popularRank": 1,
  "youtubeVideoId": "ZQfzarxSDkU",
  "videoUrl": "https://youtu.be/ZQfzarxSDkU",
  "tags": [
    "Studio Dobrego Słowa",
    "Kraj",
    "Biblia",
    "Sąd Ostateczny",
    "Dobra Nowina",
    "Ewangelia",
    "Wideo"
  ],
  "scriptureReference": {
    "verse": "Ewangelia wg św. Jana 5:24",
    "text": "Zaprawdę, zaprawdę powiadam wam: Kto słucha mego słowa i wierzy temu, który mnie posłał, ma życie wieczne i nie idzie na sąd, lecz przeszedł ze śmierci do życia."
  },
  "sourceCitation": {
    "sourceName": "Studio Dobrego Słowa (studiods.pl)",
    "sourceUrl": "https://youtu.be/ZQfzarxSDkU",
    "quotationDate": "2 października 2026"
  },
  "biblicalCommentary": {
    "thesis": "Komentarz redakcyjny: Boży sąd przywraca sprawiedliwość i przynosi wolność tym, którzy powierzyli swoje życie Chrystusowi.",
    "verses": [
      {
        "ref": "Rz 8,1",
        "text": "Teraz więc nie ma żadnego potępienia dla tych, którzy są w Chrystusie Jezusie."
      }
    ],
    "explanation": "Biblijny sąd nie jest powodem do paraliżującego strachu, lecz obietnicą, że zło i niesprawiedliwość nie będą miały ostatniego słowa. Dla człowieka pojednanego z Bogiem przez Krzyż jest to uroczyste potwierdzenie Bożego przymierza i odkupienia."
  },
  "resourceLinks": [
    {
      "label": "Oficjalna strona Studio Dobrego Słowa",
      "url": "https://studiods.pl/"
    },
    {
      "label": "Kanał YouTube Studio Dobrego Słowa",
      "url": "https://www.youtube.com/@StudioDeeS"
    }
  ]
,
  author: AUTHORS.partner
},
  {
  "id": "news-ukraina-ochrona-cywilow-20261002",
  "title": "Ukraina: ONZ apeluje o ochronę cywilów po kolejnych atakach",
  "category": "swiat",
  "categoryLabel": "UKRAINA · KOMUNIKAT ONZ",
  "excerpt": "Koordynator humanitarny ONZ opisuje zagrożenie dla mieszkańców i infrastruktury cywilnej. Opracowanie komunikatu z 28 września, z osobnym komentarzem biblijnym.",
  "content": [
    "W komunikacie z 28 września 2026 r. koordynator humanitarny ONZ w Ukrainie Matthias Schmale opisał skutki rosyjskich ataków dla ludności cywilnej. Wskazał na zniszczenia domów, szkół, placówek zdrowotnych i innej infrastruktury w kilku regionach kraju.",
    "Według komunikatu alarmy, konieczność korzystania ze schronienia i przerwy w nauce wpływają na codzienne życie rodzin. Autor wezwał do ochrony cywilów oraz przestrzegania międzynarodowego prawa humanitarnego.",
    "To własne polskie opracowanie stanowiska ONZ, nie relacja naszego korespondenta. Nie ustalamy na tej podstawie bieżącej liczby ofiar ani sytuacji na froncie. Data komunikatu: 28 września; weryfikacja i publikacja opracowania CCN: 2 października 2026."
  ],
  "slug": "news-ukraina-ochrona-cywilow-20261002",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "/ccn-news-ukraina-photo.jpg",
  "imageCaption": "Ilustracja fotorealistyczna wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia.",
  "readTimeMinutes": 2,
  "isHero": false,
  "isPopular": true,
  "popularRank": 2,
  "tags": [
    "Aktualności",
    "Źródła",
    "Komentarz biblijny"
  ],
  "sourceCitation": {
    "sourceName": "ONZ w Ukrainie / OCHA — komunikat koordynatora humanitarnego",
    "sourceUrl": "https://ukraine.un.org/en/323455-millions-across-ukraine-life-increasingly-dangerous",
    "quotationDate": "28 września 2026"
  },
  "biblicalCommentary": {
    "thesis": "Komentarz redakcji: troska o życie człowieka powinna prowadzić do pomocy cierpiącym i uczciwego opisywania przemocy.",
    "verses": [],
    "explanation": "Przypowieść o miłosiernym Samarytaninie (Łk 10,25–37) kieruje uwagę na konkretnego człowieka potrzebującego pomocy. Wezwanie do czynienia pokoju (Mt 5,9) nie usuwa odpowiedzialności za krzywdę. To interpretacja etyczna redakcji, nie stwierdzenie o spełnieniu proroctwa ani przepowiednia przebiegu wojny."
  }
,
  author: AUTHORS.redakcja
},
  {
  "id": "news-polska-budzet-20261002",
  "title": "Polska: rząd ogłosił przyjęcie projektu budżetu na 2027 rok",
  "category": "kraj",
  "categoryLabel": "POLSKA · KOMUNIKAT KPRM",
  "excerpt": "KPRM informuje o projekcie budżetu i propozycjach podatkowych. Rozróżniamy zapowiedzi rządu od prawa, które weszło w życie.",
  "content": [
    "Kancelaria Prezesa Rady Ministrów poinformowała 29 września 2026 r. o przyjęciu przez Radę Ministrów projektu ustawy budżetowej na 2027 rok. W komunikacie wskazano bezpieczeństwo i ochronę zdrowia jako ważne kierunki wydatków.",
    "KPRM przedstawiła również propozycje zmian w podatku PIT oraz apel premiera o podpisanie ustaw. Opisujemy tutaj deklaracje i stanowisko rządu, a nie niezależną ocenę ich skutków.",
    "Projekt i polityczna zapowiedź nie są równoznaczne z obowiązującą ustawą. Przed podejmowaniem decyzji finansowych trzeba sprawdzić zakończony proces legislacyjny i opublikowane przepisy. Opracowanie CCN zweryfikowano 2 października 2026 r."
  ],
  "slug": "news-polska-budzet-20261002",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "/ccn-news-polska-photo.jpg",
  "imageCaption": "Ilustracja fotorealistyczna wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia.",
  "readTimeMinutes": 2,
  "isHero": false,
  "isPopular": true,
  "popularRank": 3,
  "tags": [
    "Aktualności",
    "Źródła",
    "Komentarz biblijny"
  ],
  "sourceCitation": {
    "sourceName": "Kancelaria Prezesa Rady Ministrów — komunikat z 29 września",
    "sourceUrl": "https://www.gov.pl/web/premier/premier-apeluje-do-prezydenta-o-podpisanie-korzystnych-dla-obywateli-ustaw",
    "quotationDate": "29 września 2026"
  },
  "biblicalCommentary": {
    "thesis": "Komentarz redakcji: zarządzanie wspólnymi środkami wymaga uczciwości, odpowiedzialności i troski o osoby słabsze.",
    "verses": [],
    "explanation": "Prz 11,1 przypomina o uczciwości, a Mi 6,8 o sprawiedliwości i miłosierdziu. Te odwołania są etycznym punktem odniesienia redakcji; nie stanowią poparcia dla partii ani biblijnego potwierdzenia konkretnego projektu podatkowego."
  }
,
  author: AUTHORS.redakcja
},
  {
  "id": "news-onz-dzien-bez-przemocy-20261002",
  "title": "2 października: ONZ wzywa do dialogu i przeciwdziałania przemocy",
  "category": "swiat",
  "categoryLabel": "ŚWIAT · DZIEŃ BEZ PRZEMOCY",
  "excerpt": "W przesłaniu na Międzynarodowy Dzień Bez Przemocy sekretarz generalny ONZ akcentuje dialog, godność i pokojowe rozwiązywanie sporów.",
  "content": [
    "W przesłaniu opublikowanym 2 października 2026 r. sekretarz generalny ONZ António Guterres wezwał do dialogu i dyplomacji w obliczu podziałów oraz konfliktów. Odwołał się do dziedzictwa Mahatmy Gandhiego i metod działania bez przemocy.",
    "Autor wskazał na cierpienie ludzi, ubóstwo i nierówności oraz potrzebę poszanowania praw człowieka. To opis oficjalnego stanowiska ONZ i własne polskie opracowanie jego treści, bez kopiowania całego wystąpienia."
  ],
  "slug": "news-onz-dzien-bez-przemocy-20261002",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "/ccn-news-pokoj-photo.jpg",
  "imageCaption": "Ilustracja fotorealistyczna wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia.",
  "readTimeMinutes": 2,
  "isHero": false,
  "isPopular": true,
  "popularRank": 4,
  "tags": [
    "Aktualności",
    "Źródła",
    "Komentarz biblijny"
  ],
  "sourceCitation": {
    "sourceName": "ONZ — przesłanie sekretarza generalnego na Międzynarodowy Dzień Bez Przemocy",
    "sourceUrl": "https://ukraine.un.org/en/323593-un-secretary-generals-message-international-day-non-violence",
    "quotationDate": "2 października 2026"
  },
  "biblicalCommentary": {
    "thesis": "Komentarz redakcji: chrześcijański sprzeciw wobec przemocy zaczyna się także w sposobie traktowania bliźniego.",
    "verses": [],
    "explanation": "Mt 5,9 i Rz 12,18 odnoszą się do czynienia pokoju. Redakcja odczytuje je jako wezwanie do odpowiedzialnych słów, pomocy pokrzywdzonym i poszukiwania sprawiedliwych rozwiązań. Komentarz biblijny jest oddzielny od przesłania ONZ; nie utożsamiamy stanowiska instytucji z nauczaniem Pisma."
  }
,
  author: AUTHORS.redakcja
},
  {
  "id": "news-adwent-jestnadzieja-20261002",
  "title": "#JestNadzieja: Kościół adwentystyczny informuje o rozpoczęciu OneVoice27 w Polsce",
  "category": "kraj",
  "categoryLabel": "KOŚCIOŁY · OFICJALNE ŹRÓDŁO",
  "excerpt": "Oficjalny serwis Kościoła Adwentystów Dnia Siódmego w RP podaje, że polska odsłona projektu rozpoczęła się 5 września.",
  "content": [
    "Oficjalny serwis adwent.pl podał, że projekt OneVoice27 jest realizowany w Polsce pod nazwą #JestNadzieja i rozpoczął się 5 września 2026 r. Informacja znajduje się w sekcji aktualności Kościoła Adwentystów Dnia Siódmego w RP.",
    "To krótka wiadomość oparta na ogłoszeniu organizatora, sprawdzonym 2 października. Nie podajemy niezweryfikowanych danych o zasięgu lub uczestnikach. Szczegóły i kolejne komunikaty należy sprawdzać u organizatora."
  ],
  "slug": "news-adwent-jestnadzieja-20261002",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "/ccn-news-nadzieja-photo.jpg",
  "imageCaption": "Ilustracja fotorealistyczna wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia.",
  "readTimeMinutes": 2,
  "isHero": false,
  "isPopular": true,
  "popularRank": 5,
  "tags": [
    "Aktualności",
    "Źródła",
    "Komentarz biblijny"
  ],
  "sourceCitation": {
    "sourceName": "Kościół Adwentystów Dnia Siódmego w RP — adwent.pl",
    "sourceUrl": "https://adwent.pl/",
    "quotationDate": "25 września 2026; aktualizacja 29 września"
  },
  "biblicalCommentary": {
    "thesis": "Komentarz redakcji: dzielenie się nadzieją powinno łączyć jasny przekaz wiary z szacunkiem dla odbiorcy.",
    "verses": [],
    "explanation": "1 P 3,15–16 łączy gotowość wyjaśnienia nadziei z łagodnością i szacunkiem. Jest to redakcyjne odwołanie do kontekstu biblijnego, a nie potwierdzenie rezultatów tego projektu."
  }
,
  author: AUTHORS.redakcja
},
  {
  "id": "art-kurs-apokalipsy-akademia",
  "title": "Księga Objawienia bez lęku: Nowy Kurs Apokalipsy w Akademii Biblijnej CC",
  "slug": "ksiega-objawienia-kurs-apokalipsy-akademia-cc",
  "excerpt": "24 profesjonalne wykłady wideo, interaktywne quizy, odnośniki do kodów Stronga i imienne certyfikaty ukończenia. Sprawdź wyjątkowy program edukacyjny dostępny bezpłatnie na polskieradio.cc/akademia.",
  "category": "kursy",
  "categoryLabel": "AKADEMIA BIBLIJNA CC",
  "publishedAt": "2026-09-15",
  "dateFormatted": "15 września 2026",
  "imageUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
  "imageCaption": "Nowoczesna platforma e-learningowa Akademii Biblijnej łączy najwyższą jakość technologiczną z głębią egzegezy.",
  "readTimeMinutes": 5,
  "isPopular": true,
  "popularRank": 6,
  "tags": [
    "Akademia",
    "Kurs Apokalipsy",
    "Edukacja",
    "Biblia",
    "Certyfikat"
  ],
  "scriptureReference": {
    "verse": "Księga Objawienia 1:3",
    "text": "Błogosławiony, który czyta, i ci, którzy słuchają słów tego proroctwa i zachowują to, co w nim jest napisane; czas bowiem jest bliski.",
    "strongCode": "G3107"
  },
  "relatedCourse": {
    "title": "Kurs Apokalipsy (24 Lekcje Wideo)",
    "lesson": "Lekcja 01: Wstęp do Księgi Objawienia – Klucz do Proroctw",
    "url": "/akademia/apokalipsa/lekcja-01",
    "badge": "Pełny Kurs Gratis"
  },
  "lexiconTerms": [
    {
      "term": "Paruzja (παρουσία)",
      "strongCode": "G3952",
      "definition": "Klucz hermeneutyczny do całej Księgi Objawienia – nadzieja na ostateczny powrót Króla."
    }
  ],
  "content": [
    "Dla wielu czytelników Pisma Świętego Księga Objawienia (Apokalipsa św. Jana) kojarzy się z katastrofą, lękiem i niepokojem. Tymczasem jej grecka nazwa – Apokalypsis – oznacza dosłownie odsłonięcie, objawienie Jezusa Chrystusa.",
    "W ramach ekosystemu Christian Culture uruchomiliśmy monumentalny program edukacyjny: Kurs Apokalipsy składający się z 24 kompletnych wykładów wideo w jakości kinowej 4K, z transkrypcjami, quizami weryfikacyjnymi i możliwością bezpośredniego kontaktu z duchownym.",
    "Uczestnicy kursu krok po kroku odkrywają symbolikę siedmiu zborów, pieczęci, trąb, Niewiasty obleczonej w słońce, aż po triumf Nowego Jeruzalem.",
    "Kurs jest w 100% bezpłatny i dostępny na platformie https://polskieradio.cc/akademia. Po zalogowaniu system automatycznie zapamiętuje postępy, a po ukończeniu wszystkich lekcji generuje oficjalny, weryfikowalny Certyfikat Ukończenia."
  ]
,
  author: AUTHORS.cezary
},
  {
  "id": "art-historia-amazing-grace",
  "title": "Historia hymnu „Cudowna Boża Łaska” (Amazing Grace): od handlarza niewolników do pieśni odkupienia",
  "slug": "historia-hymnu-cudowna-boza-laska-amazing-grace",
  "excerpt": "Jak John Newton, bezwzględny kapitan statku niewolniczego, po dramatycznym sztormie doświadczył łaski Chrystusa i stworzył najbardziej poruszający hymn w dziejach muzyki chrześcijańskiej.",
  "category": "muzyka",
  "categoryLabel": "MUZYKA I KULTURA CC",
  "publishedAt": "2026-09-10",
  "dateFormatted": "10 września 2026",
  "imageUrl": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
  "imageCaption": "Muzyka uwielbienia w Polskim Radiu Christian Culture niesie przesłanie Bożej łaski przez 24 godziny na dobę.",
  "readTimeMinutes": 6,
  "tags": [
    "Muzyka",
    "Amazing Grace",
    "Historia Wiary",
    "Uwielbienie",
    "Radio CC"
  ],
  "scriptureReference": {
    "verse": "List do Efezjan 2:8-9",
    "text": "Łaską bowiem jesteście zbawieni przez wiarę, i to nie z was, dar to jest Boży; nie z uczynków, aby się nikt nie chlubił.",
    "strongCode": "G5485"
  },
  "relatedMusic": {
    "title": "Amazing Grace (Cudowna Boża Łaska) – Aranżacja CC",
    "artist": "Chór i Orkiestra Christian Culture",
    "streamUrl": "https://stream.zeno.fm/imo45hqnshyuv",
    "badge": "Pasmo Uwielbienia & Prawdy"
  },
  "lexiconTerms": [
    {
      "term": "Agape (ἀγάπη)",
      "strongCode": "G26",
      "definition": "Darmowa i ofiarna łaska Boża, która odnajduje człowieka w najgłębszym upadku."
    }
  ],
  "content": [
    "W marcu 1748 roku podczas potężnego sztormu u wybrzeży Irlandii statek handlowy „Greyhound” niemalże poszedł na dno. Kapitan John Newton, znany z bezwzględności, wulgarności i cynizmu handlarz ludźmi, w obliczu nieuchronnej śmierci zawołał: „Panie, zmiłuj się nad nami!”.",
    "To wydarzenie stało się początkiem jego głębokiego nawrócenia. Newton porzucił haniebny proceder niewolnictwa, został duchownym i wraz z Williamem Wilberforce’em walczył o całkowite zniesienie niewolnictwa w Imperium Brytyjskim.",
    "Słowa hymnu „Amazing Grace” – „Cudowna Boża łaska, jak słodki ma dźwięk, ocaliła takiego nędznika jak ja; byłem zgubiony, lecz teraz jestem odnaleziony, byłem ślepy, lecz teraz widzę” – rozbrzmiewają dziś we wszystkich językach świata.",
    "W Polskim Radiu Christian Culture emitujemy najpiękniejsze tradycyjne i współczesne interpretacje tego utworu w ramach Pasma Uwielbienia & Prawdy."
  ]
,
  author: AUTHORS.wioletta
},
  {
  "id": "art-z-biblia-za-pan-brat-rdz-2-20261002",
  "slug": "z-biblia-za-pan-brat-szabat-i-odpowiedzialnosc-rdz-2",
  "title": "Szabat i odpowiedzialność — Boży projekt dla ludzkiego życia",
  "excerpt": "Księga Rodzaju — Miesiąc 1 | Dzień 2 (2 października 2026). Boży odpoczynek, odpowiedzialna praca i relacje w świetle drugiego rozdziału Księgi Rodzaju.",
  "category": "wiara",
  "categoryLabel": "Z BIBLIĄ ZA PAN BRAT",
  "publishedAt": "2026-10-02",
  "dateFormatted": "2 października 2026",
  "imageUrl": "/ccn-news-nadzieja-photo.jpg",
  "imageCaption": "Ilustracja fotorealistyczna wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia.",
  "readTimeMinutes": 5,
  "tags": [
    "Z Biblią za Pan Brat",
    "Księga Rodzaju",
    "Szabat",
    "Odpowiedzialność",
    "Rodzina",
    "Cezary Rogowski"
  ],
  "scriptureReference": {
    "verse": "Księga Rodzaju 2:2 (UBG)",
    "text": "W siódmym dniu Bóg ukończył swe dzieło, które uczynił; i odpoczął siódmego dnia od wszelkiego swego dzieła, które stworzył."
  },
  "sourceCitation": {
    "sourceName": "Pismo Święte — Uwspółcześniona Biblia Gdańska (UBG), Fundacja Wrota Nadziei",
    "sourceUrl": "https://www.bible.com/pl/bible/138/GEN.2.UBG",
    "quotationDate": "Weryfikacja cytatów: 2 października 2026"
  },
  "relatedCourse": {
    "title": "Z Biblią za Pan Brat",
    "lesson": "Księga Rodzaju — Miesiąc 1 | Dzień 2",
    "url": "/akademia/kurscodzienny",
    "badge": "Codzienny program studiów biblijnych"
  },
  "resourceLinks": [
    {
      "label": "Christian Culture — strona główna",
      "url": "https://polskieradio.cc/"
    },
    {
      "label": "Społeczność LUMINA",
      "url": "https://polskieradio.cc/lumina"
    },
    {
      "label": "CC Lite",
      "url": "https://www.cclite.pl"
    },
    {
      "label": "Grupa WhatsApp CCN / CC",
      "url": "https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0"
    }
  ],
  "content": [
    "Księga Rodzaju — Miesiąc 1 | Dzień 2 (2 października 2026)",
    "W ramach trwającego globalnego programu studiów biblijnych „Z Biblią za Pan Brat”, dzisiejsze opracowanie leksykonu chrześcijańskiego skupia się na drugim rozdziale Księgi Rodzaju. Tekst ten ukazuje kulminację dzieła stworzenia, ustanowienie Bożego odpoczynku (szabatu) oraz powołanie człowieka do życia w harmonii, relacji i odpowiedzialnym zarządzaniu.",
    "1. Odpoczynek Stwórcy a model dla człowieka",
    "Drugi rozdział Księgi Rodzaju rozpoczyna się od opisu zakończenia dzieła i uświęcenia siódmego dnia (Rdz 2:2–3).",
    "Teologia biblijna podkreśla, że Boży szabat nie wynika ze zmęczenia Stwórcy, lecz stanowi akt celebrowania doskonałości i harmonii stworzonego świata. Ustanowienie szabatu staje się fundamentem dla rytmu ludzkiego życia: zaproszeniem do regularnego zatrzymania się, oddania chwały Bogu i odzyskania właściwych proporcji między pracą a odpoczynkiem.",
    "2. Ogród Eden: miejsce obfitości i próby",
    "Bóg umieszcza człowieka w ogrodzie w Edenie, powierzając mu konkretne zadanie: „PAN Bóg wziął więc człowieka i umieścił go w ogrodzie Eden, aby go uprawiał i strzegł” (Rdz 2:15, UBG).",
    "Tekst ukazuje, że praca nie jest skutkiem upadku, lecz integralną częścią ludzkiego powołania już w stanie pierwotnej czystości. Człowiek otrzymuje jednak również jasną granicę — zakaz spożywania owoców z drzewa poznania dobra i zła (Rdz 2:16–17). Ta granica przypomina o fundamentalnej prawdzie: człowiek jest zarządcą, a nie ostatecznym właścicielem stworzenia; jego wolność realizuje się w zaufaniu do woli Stwórcy.",
    "3. Stworzenie kobiety i instytucja małżeństwa",
    "Widząc samotność człowieka, Bóg stwierdza: „PAN Bóg powiedział też: Niedobrze, by człowiek był sam; uczynię mu odpowiednią dla niego pomoc” (Rdz 2:18, UBG). Wyprowadzenie kobiety z żebra mężczyzny podkreśla ich ontologiczną równość i głęboką jedność, wyrażoną w klasycznym wersecie:",
    "„Dlatego opuści mężczyzna swojego ojca i swoją matkę i połączy się ze swoją żoną, i będą jednym ciałem” (Rdz 2:24, UBG).",
    "Ten fragment stanowi biblijny archetyp małżeństwa i rodziny jako podstawowej komórki społecznej, ustanowionej bezpośrednio przez Boga.",
    "4. Stan niewinności (Rdz 2:25)",
    "Rozdział drugi zamyka się jednym z najbardziej uderzających stwierdzeń Pisma Świętego: „I oboje, Adam i jego żona, byli nadzy, a nie wstydzili się” (Rdz 2:25, UBG).",
    "Brak wstydu symbolizuje pełną przejrzystość, brak lęku, poczucie całkowitego bezpieczeństwa oraz czystość relacji zarówno między ludźmi, jak i w ich bezpośredniej relacji z Bogiem. Jest to stan doskonałej harmonii przed nadejściem grzechu opisanego w kolejnym rozdziale.",
    "PODSUMOWANIE REDAKCYJNE CCN",
    "Drugi rozdział Księgi Rodzaju uczy nas, że ludzkie życie ma sens zakorzeniony w Bożej obecności, regularnym odpoczynku, uczciwej pracy oraz czystych, pełnych szacunku relacjach.",
    "Wszystkie materiały formacyjne i publicystyczne w ekosystemie Christian Culture są całkowicie bezpłatne. Dołącz do naszej społeczności i śledź codzienne analizy w ramach projektu „Z Biblią za Pan Brat”.",
    "Cytaty biblijne: Uwspółcześniona Biblia Gdańska (UBG), © 2018 Fundacja Wrota Nadziei, CC BY-ND 4.0. Komentarz i wnioski teologiczne stanowią opracowanie redakcyjne CCN."
  ]
,
  author: AUTHORS.redakcja
},
];
