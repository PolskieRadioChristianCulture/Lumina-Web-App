import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'data/cc-search-index.json');
const catalogPath = path.join(ROOT, 'szukaj/catalog.json');
const luminaMirrorPath = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data\\cc-search-index.json';
const luminaCatalogMirror = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\szukaj\\catalog.json';

const rawData = fs.readFileSync(indexPath, 'utf8');
const data = JSON.parse(rawData);

data.contextGuides = data.contextGuides || {};

// Dodatkowe przewodniki tematyczne dla kluczowych obszarów
data.contextGuides.muzyka = {
  keywords: ["muzyka", "piosenki", "worship", "uwielbienie", "skins", "playlista", "albumy", "top ten"],
  topic: "Muzyka Chrześcijańska & Stacje Audio (CC Music & Radio SKINS)",
  summary: "Odkryj biblijną muzykę uwielbienia, autorskie playlisty TOP TEN, radio ze skórkami wizualnymi SKINS 2.0 oraz 6 tematycznych stacji radiowych 24/7.",
  keyVerses: [
    {
      ref: "Ps 150:6",
      text: "Wszystko, co oddycha, niech chwali Pana! Alleluja!",
      url: "https://polskieradio.cc/music"
    },
    {
      ref: "Kol 3:16",
      text: "Śpiewajcie z wdzięcznością w waszych sercach Panu psalmy, hymny i pieśni duchowe.",
      url: "https://polskieradio.cc/player"
    }
  ],
  shortcuts: [
    { title: "CC MUSIC Hub", url: "https://polskieradio.cc/music", icon: "🎵" },
    { title: "Radio SKINS 2.0", url: "https://polskieradio.cc/skins", icon: "💿" },
    { title: "PLAYER CC (6 Stacji)", url: "https://polskieradio.cc/player", icon: "📻" },
    { title: "Ambient Sleep (Relaks)", url: "https://polskieradio.cc/ambientsleep", icon: "🌙" }
  ]
};

data.contextGuides.zdrowie = {
  keywords: ["zdrowie", "uroda", "zioła", "dieta", "post", "kuchnia", "chleb", "ezechiel", "fitoterapia"],
  topic: "Zdrowie & Tradycja Biblijna („Ciało Świątynią Ducha”)",
  summary: "Odkryj biblijne podejście do zdrowia, naturalnego leczenia, atlasu ziół, postu oraz tradycyjnej kuchni biblijnej opartej na naturalnych darach Stwórcy.",
  keyVerses: [
    {
      ref: "1 Kor 6:19-20",
      text: "Czyż nie wiecie, że wasze ciało jest świątynią Ducha Świętego (...) Chwalcie więc Boga w waszym ciele.",
      url: "https://polskieradio.cc/ziu"
    },
    {
      ref: "Ez 4:9",
      text: "Weź sobie także pszenicy, jęczmienia, bobu, soczewicy, prosa i orkiszu, włóż je do jednego naczynia i zrób sobie z nich chleb.",
      url: "https://polskieradio.cc/kuchnia"
    }
  ],
  shortcuts: [
    { title: "CCN ZIU (Zdrowie & Uroda)", url: "https://polskieradio.cc/ziu", icon: "🌿" },
    { title: "CCN Kuchnia Biblijna", url: "https://polskieradio.cc/kuchnia", icon: "🍞" },
    { title: "Ambient Sleep (Sen)", url: "https://polskieradio.cc/ambientsleep", icon: "🌙" }
  ]
};

data.contextGuides.biznes = {
  keywords: ["biznes", "finanse", "pieniadze", "praca", "szafarstwo", "dlugi", "firma", "zarzadzanie"],
  topic: "Etyka w Biznesie & Boże Szafarstwo Finansowe",
  summary: "Wskazówki dla chrześcijańskich przedsiębiorców i rodzin: etyka w pracy, budżet domowy, wolność od długów i uczciwe zarządzanie zasobami powierzonymi przez Boga.",
  keyVerses: [
    {
      ref: "Przyp 16:3",
      text: "Powierz Panu swoje dzieła, a twoje zamysły będą utwierdzone.",
      url: "https://polskieradio.cc/biznes"
    },
    {
      ref: "Łk 16:10",
      text: "Kto jest wierny w bardzo małym, ten i w wielkim jest wierny.",
      url: "https://polskieradio.cc/finanse"
    }
  ],
  shortcuts: [
    { title: "CCN Biznes & Przedsiębiorczość", url: "https://polskieradio.cc/biznes", icon: "💼" },
    { title: "CCN Finanse & Budżet", url: "https://polskieradio.cc/finanse", icon: "💰" },
    { title: "HOLOS (5 Sektorów Życia)", url: "https://polskieradio.cc/holos", icon: "🎯" }
  ]
};

data.contextGuides.ksiazki = {
  keywords: ["ksiazka", "ksiazki", "autor", "pokonac goliata", "kod zrodlowy", "u boku diabla", "prawda bez filtra", "bog jest miloscia", "ebook"],
  topic: "Biblioteka Autorska — 5 Książek Cezarego i Wioletty Rogowskich",
  summary: "Oficjalna półka z książkami autorstwa założycieli Christian Culture. Dostępne bezpłatnie do czytania online, pobrania w PDF oraz odsłuchania jako audiobooki.",
  keyVerses: [
    {
      ref: "J 8:32",
      text: "I poznacie prawdę, a prawda was wyzwoli.",
      url: "https://polskieradio.cc/ksiazki-autora"
    }
  ],
  shortcuts: [
    { title: "Półka 5 Książek Autora", url: "https://polskieradio.cc/ksiazki-autora", icon: "📚" },
    { title: "1. Pokonać Goliata", url: "https://polskieradio.cc/pokonac-goliata", icon: "🛡️" },
    { title: "2. Kod Źródłowy Duszy", url: "https://polskieradio.cc/kod", icon: "💻" },
    { title: "3. U Boku Diabła", url: "https://polskieradio.cc/u-boku-diabla", icon: "🔥" },
    { title: "4. Prawda Bez Filtra", url: "https://polskieradio.cc/prawda-bez-filtra", icon: "✨" },
    { title: "5. Bóg jest MIŁOŚCIĄ?", url: "https://polskieradio.cc/bog-jest-miloscia", icon: "❤️" }
  ]
};

const menuItems = [
  {
    title: "Radio SKINS 2.0 — Interaktywny Odtwarzacz & 5 Skórek Wizualnych",
    category: "Radio & Live",
    url: "https://polskieradio.cc/skins",
    description: "Nowoczesny odtwarzacz Radia Christian Culture z 5 unikalnymi skórkami wizualnymi: Earth, Gold, Cosmic, Studio oraz Word. Animowany equalizer audio, wizualizacje fali dźwiękowej, pełny minimalizm i jakość Retina.",
    tags: ["skins", "radio skins", "odtwarzacz", "skórki", "radio na żywo", "equalizer", "wizualizator", "muzyka", "radio cc", "earth", "gold", "cosmic", "studio", "word"],
    featured: true
  },
  {
    title: "Ambient Sleep — Mikser Dźwięków Snu & Fale Mózgowe (3Hz / 8Hz)",
    category: "Radio & Live",
    url: "https://polskieradio.cc/ambientsleep",
    description: "Interaktywny mikser relaksacyjny i nocny Radia CC. Generuje kojące fale delta (3Hz) i theta (8Hz), dźwięki deszczu, strumienia, wiatru i nocy połączone z delikatną muzyką ambient dla głębokiego, spokojnego snu pod Bożą opieką.",
    tags: ["ambient sleep", "sen", "mikser snu", "fale delta", "fale theta", "3hz", "8hz", "odpoczynek", "noc", "relaks", "kojąca muzyka", "bezsenność", "wyciszenie"],
    featured: true
  },
  {
    title: "Smart TV CC — Telewizja Chrześcijańska 24/7 (6 Stacji & Pilot Online)",
    category: "Media i treści",
    url: "https://polskieradio.cc/tv",
    description: "Wirtualny telewizor Christian Culture z 6 stacjami telewizyjnymi na żywo: Worship Live, CCTV24, TV Epafraz, Śniadaniowa Live, Biblia Śpiewana oraz SDS Apokalipsa. Wygodny pilot online i tryb pełnoekranowy na telewizory i smartfony.",
    tags: ["smart tv", "telewizja", "tv cc", "stacje tv", "pilot", "telewizor", "worship live", "cctv24", "tv epafraz", "transmisja na żywo", "video live", "stream"],
    featured: true
  },
  {
    title: "Program TV & Ramówka Emisyjna — Dziś, Tydzień i Nadchodzące Audycje",
    category: "Media i treści",
    url: "https://polskieradio.cc/program",
    description: "Pełna ramówka radiowo-telewizyjna ekosystemu Christian Culture. Sprawdź harmonogram transmisji na żywo, nabożeństw, audycji autorskich, wykładów biblijnych i koncertów uwielbienia.",
    tags: ["program tv", "ramówka", "harmonogram", "audycje", "dziś", "tydzień", "transmisje", "co w radiu", "godziny emisji", "ramówka radia"],
    featured: false
  },
  {
    title: "Nadawaj z Nami — Retransmisja Sygnału Radiowego & Gotowe Sceny OBS Studio",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/nadawaj",
    description: "Pobierz oficjalny sygnał strumieniowy Radia Christian Culture dla własnych transmisji, parafii, zborów i kanałów YouTube/Twitch. Gotowe sceny emisyjne dla OBS Studio (16:9 oraz 9:16 pionowe) z dynamicznym RDS.",
    tags: ["nadawaj z nami", "obs", "obs studio", "retransmisja", "sygnał radiowy", "streaming", "scena obs", "retransmisja radia", "pobierz sygnał", "studio nadawcze"],
    featured: false
  },
  {
    title: "CC MUSIC Hub — Chrześcijańska Muzyka, Albumy i Lista Przebojów TOP TEN",
    category: "Radio & Live",
    url: "https://polskieradio.cc/music",
    description: "Centrum muzyczne Christian Culture: 109 starannie wyselekcjonowanych utworów chrześcijańskiego uwielbienia, albumy, oficjalne teledyski YouTube, lista przebojów TOP TEN oraz bezpośrednie linki do Spotify, Apple Music i Tidal.",
    tags: ["cc music", "muzyka", "muzyka chrześcijańska", "uwielbienie", "worship", "piosenki", "albumy", "top ten", "lista przebojów", "spotify", "tidal", "teledyski"],
    featured: true
  },
  {
    title: "CC NETWORK — Oficjalna Sieć Ponad 40 Kanałów Medialnych Christian Culture",
    category: "Media i treści",
    url: "https://polskieradio.cc/network",
    description: "Katalog całej sieci medialnej Christian Culture: kanały YouTube, transmisje na żywo, platformy alternatywne (Odysee, Brighteon, BitChute), profile autorskie i serwisy społecznościowe zrzeszone w misji.",
    tags: ["cc network", "sieć", "40 kanałów", "kanały", "youtube", "telewizja", "media", "media społecznościowe", "niezależne media", "katalog kanałów"],
    featured: false
  },
  {
    title: "HOLOS — Chrześcijański System Rozwoju Osobistego & Szafarstwa Czasu (Life OS)",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/holos",
    description: "Innowacyjna platforma rozwoju opartego na 5 sektorach życia: Duchowość, Zdrowie, Rodzina, Praca/Finanse oraz Społeczność. Narzędzia planowania dnia, kalendarz szabatów, wirtualny mentor biblijny i holistyczne szafarstwo darami Bożymi.",
    tags: ["holos", "rozwój osobisty", "zarządzanie czasem", "life os", "5 sektorów", "szafarstwo", "uświęcenie", "planowanie", "kalendarz", "mentor", "chrystocentryzm"],
    featured: true
  },
  {
    title: "Kalendarz 2027 — Generator Kalendarza Biblijnego A4/PDF do Druku",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/kalendarz",
    description: "Interaktywny generator i kreator kalendarza chrześcijańskiego na rok 2027 do samodzielnego wydruku w formacie A4 PDF. Zawiera oznaczone biblijne szabaty, wersety przewodnie na każdy miesiąc oraz przestrzeń na notatki duchowe.",
    tags: ["kalendarz 2027", "kalendarz", "kalendarz do druku", "pdf a4", "szabaty", "święta biblijne", "kreator kalendarza", "planer", "druk a4", "notatki"],
    featured: false
  },
  {
    title: "Bank Treści — Darmowe Materiały Ewangelizacyjne, Grafiki i Słowo Boże",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/bank-tresci",
    description: "Oficjalne repozytorium bezpłatnych materiałów dla twórców, parafii, zborów i ewangelizatorów: grafiki z wersetami w jakości Retina, karty Słowa Bożego, traktaty, plakaty i szablony do druku.",
    tags: ["bank treści", "darmowe materiały", "grafiki", "wersety do pobrania", "traktaty", "materiały ewangelizacyjne", "pliki do druku", "zasoby", "szablony"],
    featured: false
  },
  {
    title: "Projektant CC — Wewnętrzne Studio Kreatora Grafik & Postów Social Media",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/projektant",
    description: "Lekkie chrześcijańskie studio graficzne online (Canva-style) zoptymalizowane pod biblijne formaty social media (1:1, 9:16, 16:9). Gotowe palety kolorystyczne Obsidian & Gold, typografia biblijna i eksport w WebP/PNG.",
    tags: ["projektant cc", "kreator grafik", "canva", "studio graficzne", "posty social media", "grafika z wersetem", "design", "tworzenie grafik", "edycja obrazów"],
    featured: false
  },
  {
    title: "Aplikacje CC Hub — Centrum Pobierania Aplikacji Mobilnych i Webowych (PWA)",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/cc-light",
    description: "Wszystkie aplikacje ekosystemu w jednym miejscu: cclite.pl (PWA), Dobrze że jesteś na Androida, odtwarzacz radiowy oraz instalacja ikon aplikacji na ekranie głównym smartfona bez sklepów Google/Apple.",
    tags: ["aplikacje cc", "aplikacje", "hub", "android", "apk", "pwa", "web app", "cclite", "pobierz aplikację", "ikona na telefon", "aplikacja mobilna"],
    featured: true
  },
  {
    title: "CC STUDIO DAW — Profesjonalne Studio Nagrań & Montażu Słuchowisk Biblia Audio",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/studio",
    description: "Zaawansowana cyfrowa stacja robocza audio (DAW) w przeglądarce: wielościeżkowa oś czasu, synteza głosu lektora TTS, nagrywanie recytacji z mikrofonu, mikser audio z masteringiem radiowym -16 LUFS oraz generowanie wideo 4K.",
    tags: ["cc studio", "daw", "studio daw", "reżyseria audio", "montaż dźwięku", "biblia audio studio", "lektor tts", "nagrywanie mikrofonem", "mastering", "wielościeżkowy"],
    featured: true
  },
  {
    title: "Widget Radiowy CC — Osadź Radio i Słowo Boże na Swojej Stronie Internetowej",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/widget",
    description: "Generator responsywnego kodu iframe do umieszczenia odtwarzacza Radia Christian Culture oraz losowego wersetu dnia na dowolnej stronie WWW, blogu czy portalu chrześcijańskim.",
    tags: ["widget", "widget radiowy", "iframe", "kod na stronę", "osadź radio", "odtwarzacz na bloga", "radio na stronie", "instaluj widget"],
    featured: false
  },
  {
    title: "Rolki Wiary — Krótkie Inspiracje Wideo & Świadectwa (Format Pionowy 9:16)",
    category: "Media i treści",
    url: "https://polskieradio.cc/rolki",
    description: "Dynamiczny odtwarzacz krótkich form wideo (Shorts/Reels) z biblijnymi przesłaniami, fragmentami kazań, świadectwami nawróceń i mądrością Bożą w pionowym formacie zoptymalizowanym na smartfony.",
    tags: ["rolki", "rolki wiary", "shorts", "wideo pionowe", "tiktok", "reels", "krótkie wideo", "świadectwa", "inspiracje wideo", "słowo w 60 sekund"],
    featured: true
  },
  {
    title: "Certyfikat Ukończenia — Generator Imiennego Dyplomu Akademii Biblijnej CC",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/certyfikat",
    description: "Oficjalny generator imiennego certyfikatu ukończenia 28-dniowego Kursu Codziennego oraz Studium Apokalipsy w Akademii Biblijnej Christian Culture z unikalnym numerem weryfikacyjnym.",
    tags: ["certyfikat", "dyplom", "ukończenie kursu", "akademia biblijna certyfikat", "weryfikacja", "kurs codzienny dyplom", "zaświadczenie"],
    featured: false
  },
  {
    title: "CCN ZIU — Portal Zdrowia, Urody & Atlas Ziół („Ciało Świątynią Ducha Świętego”)",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/ziu",
    description: "Chrześcijański portal zdrowia i profilaktyki: biblijna Dieta Daniela, post leczniczy, fitoterapia, atlas ziół leczniczych, regeneracja układu nerwowego i szacunek dla ciała jako daru Stwórcy.",
    tags: ["ziu", "zdrowie", "uroda", "atlas ziół", "dieta stwórcy", "dieta daniela", "post", "zioła", "świątynia ducha", "naturalne leczenie", "regeneracja"],
    featured: false
  },
  {
    title: "CCN Kuchnia — Tradycja Kulinarna Biblii, Chleb Ezechiela & Przepisy Pisma",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/kuchnia",
    description: "Przepisy oparte na produktach ziemi biblijnej: tradycyjny chleb Ezechiela, oliwa, figi, ryba galilejska, zioła gorzkie i starożytne potrawy Bliskiego Wschodu w świetle zdrowia i wiary.",
    tags: ["kuchnia", "chleb ezechiela", "przepisy biblijne", "potrawy biblijne", "dieta", "stół chrześcijański", "ryba galilejska", "oliwa z oliwek", "zdrowe jedzenie"],
    featured: false
  },
  {
    title: "CCN Biznes — Etyka Chrześcijańska w Przedsiębiorczości & Boże Prowadzenie w Pracy",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/biznes",
    description: "Praktyczny portal dla przedsiębiorców, menedżerów i pracowników: etyka w relacjach z klientami i pracownikami, szafarstwo kapitałem, uczciwość podatkowa i powołanie zawodowe jako misja.",
    tags: ["biznes", "przedsiębiorczość", "etyka w biznesie", "firma", "praca", "rynek", "inwestycje", "zarządzanie", "chrześcijanin w pracy", "szafarstwo"],
    featured: false
  },
  {
    title: "CCN Finanse — Biblijne Zasady Zarządzania Pieniędzmi & Wyjście z Długów",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/finanse",
    description: "Finanse osobiste i rodzinne według Biblii: Boże szafarstwo, skuteczne planowanie budżetu domowego, wyjście z pętli zadłużenia, oszczędzanie i wolność od konsumpcjonizmu.",
    tags: ["finanse", "pieniądze", "budżet domowy", "długi", "wyjście z długów", "oszczędzanie", "dziesięcina", "hojność", "szafarstwo finansowe", "biblia o pieniądzach"],
    featured: false
  },
  {
    title: "CCN Apologetyka — Obrona Wiary Chrześcijańskiej, Dowody Historyczne & Rzetelność Biblii",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/apologetyka",
    description: "Naukowe, historyczne i filozoficzne argumenty za wiarą w Chrystusa: dowody na zmartwychwstanie, wiarygodność rękopisów Nowego Testamentu, odpowiedzi na zarzuty krytyków i ateistów.",
    tags: ["apologetyka", "obrona wiary", "dowody na boga", "zmartwychwstanie jezusa", "rzetelność biblii", "odpowiedzi dla ateistów", "teologia", "filozofia chrześcijańska"],
    featured: false
  },
  {
    title: "CCN Misje — Globalna Ewangelizacja, Raporty z Krajów Prześladowanych & Tłumaczenia Biblii",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/misje",
    description: "Działalność misyjna na krańcach ziemi: relacje misjonarzy, praca tłumaczy Wycliffe Bible Translators, wsparcie dla Kościoła prześladowanego (Open Doors) i nowo powstające wspólnoty.",
    tags: ["misje", "ewangelizacja", "misjonarze", "kościół prześladowany", "wycliffe", "tłumaczenia biblii", "głoszenie ewangelii", "pomoc humanitarna", "afryka", "azja"],
    featured: false
  },
  {
    title: "CCN Biblioteka — Chrześcijańskie Dzieła Klasyczne, Traktaty & Czytelnia Cyfrowa",
    category: "Wiedza i publicystyka",
    url: "https://polskieradio.cc/biblioteka",
    description: "Cyfrowa biblioteka literatury duchowej: pisma Ojców Reformacji, klasyka pobożności, traktaty teologiczne, bezpłatne e-booki i opracowania w otwartym dostępie.",
    tags: ["biblioteka", "czytelnia", "książki chrześcijańskie", "literatura duchowa", "reformacja", "traktaty", "ebooki chrześcijańskie", "teksty źródłowe", "klasyka"],
    featured: false
  },
  {
    title: "CCN Współpraca — Dołącz do Misji Christian Culture, Wolontariat & Redakcja",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/wspolpraca",
    description: "Możliwości zaangażowania swoich talentów w misję CC: autorzy artykułów, lektorzy, montażyści wideo, programiści, tłumacze, graficy i wolontariusze infolinii modlitewnej.",
    tags: ["współpraca", "wolontariat", "dołącz do nas", "służba", "rekrutacja", "redakcja", "pomoc w misji", "talenty dla boga", "zespół cc"],
    featured: false
  },
  {
    title: "TV Epafraz — Całodobowy Kanał Telewizyjny Zboru w Warszawie (Live 24/7)",
    category: "Radio & Live",
    url: "https://polskieradio.cc/tv-epafraz",
    description: "Transmisja nabożeństw, kazań biblijnych, wykładów teologicznych i pieśni uwielbienia zboru Epafraz w Warszawie w formacie 24/7 na żywo.",
    tags: ["tv epafraz", "epafraz", "zbór epafraz", "nabożeństwo na żywo", "kazania", "warszawa zbór", "telewizja chrześcijańska", "transmisja zboru"],
    featured: false
  },
  {
    title: "Holistyczny Coaching & Terapia Wolności — Paweł Murawski",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/holistyczny-coaching",
    description: "Indywidualne i rodzinne sesje rozwojowe oparte na prawdzie biblijnej: wyjście z kryzysów życiowych, pokonanie uzależnień, odbudowa poczucia własnej wartości w Chrystusie i wolność emocjonalna.",
    tags: ["holistyczny coaching", "paweł murawski", "coaching", "terapia", "kryzys", "uzależnienia", "pomoc psychologiczna", "rozwój osobisty", "wolność"],
    featured: false
  },
  {
    title: "Premier HeatFix UK — Certyfikowane Usługi Gazowe i Hydrauliczne w Londynie",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/premier-heatfix",
    description: "Oficjalny mecenas technologiczny misji Christian Culture. Certyfikowane instalacje gazowe, montaż i serwis kotłów oraz profesjonalna hydraulika na terenie Wielkiej Brytanii (Greater London).",
    tags: ["premier heatfix", "heatfix", "hydraulika uk", "gaz london", "ogrzewanie londyn", "kotły uk", "boiler repair", "mecenas misji", "polski hydraulik londyn"],
    featured: false
  },
  {
    title: "Oficjalny Sklep Christian Culture — Odzież, Koszulki, Bluzy i Akcesoria Misyjne",
    category: "Narzędzia i misja",
    url: "https://my-store-1009741.creator-spring.com",
    description: "Oficjalny chrześcijański sklep z odzieżą i gadżetami misyjnymi: koszulki z wersetami, ciepłe bluzy z kapturem, kubki, torby i akcesoria ewangelizacyjne. Cały dochód wspiera darmowe serwisy misji.",
    tags: ["sklep cc", "sklep", "odzież chrześcijańska", "koszulki z wersetami", "bluzy", "gadżety", "kubki", "creator-spring", "merch cc", "zakupy"],
    featured: true
  },
  {
    title: "Biblia do Pobrania (PDF) — Pełny Przekład Pisma Świętego (Stary i Nowy Testament)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/Biblia_Warszawska_PL.pdf",
    description: "Darmowy, kompletny plik PDF z tekstem Pisma Świętego Starego i Nowego Testamentu w przekładzie Brytyjskiego i Zagranicznego Towarzystwa Biblijnego (Biblia Warszawska). Do czytania offline i druku.",
    tags: ["biblia pdf", "biblia do pobrania", "pismo święte pdf", "darmowa biblia", "plik pdf", "stary testament", "nowy testament", "biblia warszawska", "offline"],
    featured: true
  },
  {
    title: "Biblia CC Online — Roczny Plan Czytania Pisma Świętego & Czytnik Rozdziałów",
    category: "Biblia i formacja",
    url: "https://biblia.cclite.pl",
    description: "Cyfrowa czytelnia Pisma Świętego w subdomenie biblia.cclite.pl ze zintegrowanym rocznym planem czytania Biblii, podziałem na księgi i rozdziały oraz radiem w tle.",
    tags: ["biblia cclite", "plan czytania biblii", "biblia online", "czytnik pisma", "rozdziały biblii", "roczny plan czytania", "czytanie biblii"],
    featured: false
  },
  {
    title: "Duchowny Mariusz — Wsparcie Duszpasterskie, Rozmowa Telefoniczna i SMS",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/lumina.mariusz",
    description: "Duszpasterska pomoc duchowa dla każdego w potrzebie. Możliwość bezpośredniego kontaktu telefonicznego lub SMS (+48 608 337 477), rozmowy o wierze i wspólnej modlitwy.",
    tags: ["duchowny mariusz", "duszpasterz", "ksiądz", "pastor", "modlitwa telefon", "sms z prośbą", "pomoc duchowa", "rozmowa z duszpasterzem", "wsparcie"],
    featured: true
  },
  {
    title: "Odysee CC — Oficjalny Niezależny Kanał Wideo Christian Culture",
    category: "Media i treści",
    url: "https://odysee.com/@ccn:f?r=5vAQ9rxixinBYktYocdV1k3oXnW9JgaG",
    description: "Wolne media i kopia zapasowa wszystkich materiałów wideo misji na platformie Odysee opartej na technologii blockchain LBRY: wykłady, kazania, muzyka i transmisje bez cenzury.",
    tags: ["odysee cc", "odysee", "wideo", "niezależne media", "wolne media", "filmy bez cenzury", "kanał video", "lbry"],
    featured: false
  },
  {
    title: "Brighteon CC — Alternatywny Kanał Transmisji Wideo i Wykładów",
    category: "Media i treści",
    url: "https://www.brighteon.com/channels/christianculture/home",
    description: "Oficjalny profil wideo na platformie Brighteon: audycje publicystyczne, prawda biblijna, debaty i wykłady Studia Dobrego Słowa.",
    tags: ["brighteon cc", "brighteon", "transmisje wideo", "filmy niezależne", "wykłady biblijne", "alternatywna telewizja"],
    featured: false
  },
  {
    title: "BitChute CC — Archiwum Wideo i Transmisji Chrześcijańskich",
    category: "Media i treści",
    url: "https://www.bitchute.com/channel/K81G1P2sxLxb",
    description: "Bezpieczne archiwum materiałów wideo Christian Culture na platformie BitChute chroniące treści misyjne przed usuwaniem z głównych platform technologicznych.",
    tags: ["bitchute cc", "bitchute", "wideo alternatywa", "archiwum filmów", "materiały video", "niezależne nagrania"],
    featured: false
  },
  {
    title: "WhatsApp CC — Oficjalny Kanał Komunikacji, Rozważania i Kontakt",
    category: "Społeczność & Relacje",
    url: "https://api.whatsapp.com/send?phone=48697473741",
    description: "Dołącz do oficjalnego kanału WhatsApp Christian Culture (+48 697 473 741). Odbieraj codzienne rozważania, wersety dnia, alerty o nowych transmisjach i kontaktuj się z redakcją.",
    tags: ["whatsapp cc", "whatsapp", "kanał whatsapp", "grupa whatsapp", "wiadomości na telefon", "kontakt whatsapp", "powiadomienia"],
    featured: true
  },
  {
    title: "Social Media CC — Wszystkie Oficjalne Profile Społecznościowe (Linktree)",
    category: "Społeczność & Relacje",
    url: "https://linktr.ee/christianculture",
    description: "Szybki dostęp do wszystkich profili misji w mediach społecznościowych: Facebook, Instagram, TikTok, X (Twitter), Threads, Telegram, YouTube i podcasty.",
    tags: ["social media", "linktree", "facebook", "instagram", "tiktok", "twitter", "threads", "telegram", "profile społecznościowe"],
    featured: false
  }
];

// Usuń ewentualne istniejące duplikaty wg URL
const newUrls = new Set(menuItems.map(m => m.url.toLowerCase()));
data.items = data.items.filter(item => !newUrls.has((item.url || '').toLowerCase()));

// Dodaj nowe elementy zaraz po pierwszych 12 elementach cclite
data.items.splice(12, 0, ...menuItems);

data.totalItems = data.items.length;
data.updatedAt = new Date().toISOString();

const formattedJson = JSON.stringify(data, null, 2);

fs.writeFileSync(indexPath, formattedJson, 'utf8');
console.log(`Updated ${indexPath} (totalItems: ${data.totalItems})`);

fs.writeFileSync(catalogPath, formattedJson, 'utf8');
console.log(`Updated ${catalogPath}`);

if (!process.argv.includes('--no-mirror') && fs.existsSync(path.dirname(luminaMirrorPath))) {
  fs.writeFileSync(luminaMirrorPath, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaMirrorPath}`);
}
if (!process.argv.includes('--no-mirror') && fs.existsSync(path.dirname(luminaCatalogMirror))) {
  fs.writeFileSync(luminaCatalogMirror, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaCatalogMirror}`);
}
