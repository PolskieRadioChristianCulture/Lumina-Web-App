import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'data/cc-search-index.json');
const catalogPath = path.join(ROOT, 'szukaj/catalog.json');
const luminaMirrorPath = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data\\cc-search-index.json';

const rawData = fs.readFileSync(indexPath, 'utf8');
const data = JSON.parse(rawData);

data.contextGuides = data.contextGuides || {};

data.contextGuides.aplikacja = {
  keywords: [
    "aplikacja",
    "aplikacje",
    "cclite",
    "cclite.pl",
    "pwa",
    "app",
    "na telefon",
    "pobierz aplikacje",
    "instalacja",
    "mobilna",
    "smartfon",
    "android",
    "ios"
  ],
  topic: "Oficjalne Aplikacje Ekosystemu Christian Culture (cclite.pl & PWA)",
  summary: "Ekosystem Christian Culture oferuje uniwersalną aplikację webową cclite.pl (PWA), która działa natychmiast na każdym smartfonie, tablecie i komputerze bez konieczności pobierania ze sklepów. Łączy radio 24/7 z trybem samochodowym, codzienne rozważania „Dobrze, że jesteś”, wspólnotową ścianę modlitwy, czytelnię biblijną oraz asystenta wiary Miriam AI.",
  keyVerses: [
    {
      ref: "Mt 28:19-20",
      text: "Idźcie więc i nauczajcie wszystkie narody (...) A oto Ja jestem z wami przez wszystkie dni aż do skończenia świata.",
      url: "https://cclite.pl"
    },
    {
      ref: "Kol 3:16",
      text: "Słowo Chrystusa niech mieszka w was obficie ze wszelką mądrością, nauczajcie i napominajcie jedni drugich przez psalmy, hymny i pieśni duchowe.",
      url: "https://cclite.pl"
    }
  ],
  shortcuts: [
    {
      title: "cclite.pl — Aplikacja Webowa PWA (Uruchom)",
      url: "https://cclite.pl",
      icon: "📱"
    },
    {
      title: "Ściana Modlitwy w cclite.pl",
      url: "https://cclite.pl",
      icon: "🙏"
    },
    {
      title: "Aplikacja „Dobrze, że jesteś” (Android)",
      url: "https://polskieradio.cc/aplikacja",
      icon: "🕊️"
    },
    {
      title: "LUMINA Portal Społecznościowy",
      url: "https://polskieradio.cc/lumina",
      icon: "✨"
    }
  ]
};

data.contextGuides.cclite = {
  keywords: [
    "cclite",
    "cclite.pl",
    "cc lite",
    "christian culture lite"
  ],
  topic: "cclite.pl — Lekka Aplikacja PWA Ekosystemu CC",
  summary: "Oficjalna aplikacja internetowa Christian Culture (cclite.pl). Umożliwia instalację na ekranie głównym telefonu jednym kliknięciem, słuchanie radia na żywo z trybem Car Mode, czytanie rozważań, zgłaszanie intencji modlitewnych i odbieranie komunikatów na żywo.",
  keyVerses: [
    {
      ref: "Ps 119:105",
      text: "Twoje słowo jest pochodnią dla moich nóg i światłością na mojej ścieżce.",
      url: "https://cclite.pl"
    }
  ],
  shortcuts: [
    {
      title: "Uruchom cclite.pl",
      url: "https://cclite.pl",
      icon: "📱"
    },
    {
      title: "Poranne Inspiracje (cclite.pl)",
      url: "https://cclite.pl",
      icon: "🌅"
    },
    {
      title: "Ściana Modlitwy (cclite.pl)",
      url: "https://cclite.pl",
      icon: "🙏"
    }
  ]
};

const ccliteItems = [
  {
    title: "cclite.pl — Oficjalna Aplikacja Webowa Ekosystemu Christian Culture (PWA)",
    category: "Narzędzia i misja",
    url: "https://cclite.pl",
    description: "Uniwersalna, lekka progresywna aplikacja internetowa (PWA) całego ekosystemu Christian Culture. Działa natychmiast na smartfonach (Android, iOS) i komputerach bez pobierania z Google Play/App Store. Radio 24/7, rozważania biblijne, ściana modlitwy, czytelnia Pisma Świętego, asystent Miriam AI i alerty na żywo.",
    tags: [
      "cclite",
      "cclite.pl",
      "aplikacja",
      "aplikacje",
      "aplikacja webowa",
      "aplikacja mobilna",
      "app",
      "pwa",
      "christian culture lite",
      "christian culture app",
      "pobierz aplikację",
      "aplikacja na telefon",
      "ikona na pulpicie",
      "offline",
      "mobilna",
      "smartfon"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Codzienne Rozważania i Inspiracje Biblijne („Dobrze, że jesteś”)",
    category: "Biblia i formacja",
    url: "https://cclite.pl",
    description: "Dostęp do porannych i wieczornych inspiracji oraz codziennych rozważań biblijnych z cyklu „Dobrze, że jesteś” (dawniej Cuda Każdego Dnia). Zintegrowany z centralną bazą ekosystemu Mission Control (mcDb), lektorem TTS, wersetem dnia i modlitwą.",
    tags: [
      "cclite rozważania",
      "cclite inspiracje",
      "poranne inspiracje cclite",
      "cuda każdego dnia cclite",
      "dobrze że jesteś cclite",
      "słowo na dziś cclite",
      "rozważanie na dziś",
      "wieczorne inspiracje cclite",
      "cclite"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Ściana Modlitwy & Zgłaszanie Intencji Modlitewnych",
    category: "Społeczność & Relacje",
    url: "https://cclite.pl",
    description: "Wspólnotowy moduł modlitewny w cclite.pl połączony z bazą modlitewną ekosystemu polskieradio.cc/modlitwa i Mission Control. Zgłaszaj własne prośby modlitewne, módl się za braci i siostry oraz klikaj przycisk „Módl się”.",
    tags: [
      "cclite modlitwa",
      "intencje modlitewne cclite",
      "ściana modlitwy cclite",
      "prośba o modlitwę",
      "wstawiennictwo cclite",
      "pomódl się",
      "modlitwa online cclite",
      "cclite"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Radio Christian Culture & Tryb Samochodowy (Car Mode)",
    category: "Radio & Live",
    url: "https://cclite.pl",
    description: "Mobilny odtwarzacz strumieniowy Radia Christian Culture w aplikacji cclite.pl z dedykowanym poziomym trybem samochodowym (Car Mode): powiększone przyciski min. 44px, wysoki kontrast, wygaszacz ekranu i bezpieczna obsługa podczas jazdy.",
    tags: [
      "cclite radio",
      "radio samochodowe cclite",
      "car mode cclite",
      "odtwarzacz radia cclite",
      "worship na żywo cclite",
      "radio w aucie",
      "tryb samochodowy",
      "cclite"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Czytelnia Biblijna & Wyszukiwarka Wersetów",
    category: "Biblia i formacja",
    url: "https://cclite.pl",
    description: "Wbudowana w cclite.pl wyszukiwarka wersetów Pisma Świętego, czytnik całych rozdziałów biblijnych, wersety dnia oraz plany czytania Biblii online na telefonie i komputerze.",
    tags: [
      "cclite biblia",
      "czytelnia biblijna cclite",
      "wyszukiwarka wersetów cclite",
      "rozdziały biblii cclite",
      "pismo święte na telefonie",
      "werset dnia cclite",
      "cclite"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Szkoła Biblijna i Formacja Chrześcijańska",
    category: "Biblia i formacja",
    url: "https://cclite.pl",
    description: "Dostęp do multimedialnych lekcji biblijnych, studium Pisma Świętego i materiałów formacyjnych w dedykowanym panelu Szkoły Biblijnej w aplikacji cclite.pl.",
    tags: [
      "cclite szkoła biblijna",
      "lekcje biblijne cclite",
      "studium biblijne cclite",
      "kurs biblijny cclite",
      "formacja chrześcijańska",
      "cclite"
    ],
    featured: false
  },
  {
    title: "cclite.pl — Asystent Wiary Miriam AI & Czat Biblijny",
    category: "Narzędzia i misja",
    url: "https://cclite.pl",
    description: "Chrześcijański asystent AI i asystent głosowy Miriam w cclite.pl. Zadawaj pytania o wersety, wiarę, teologię biblijną i etykę chrześcijańską oparte na czystym Słowie Bożym.",
    tags: [
      "miriam ai cclite",
      "asystent biblijny cclite",
      "czat z asystentem",
      "pytania do biblii",
      "asystent głosowy cclite",
      "miriam chat",
      "cclite"
    ],
    featured: true
  },
  {
    title: "cclite.pl — Studio Wyobraźni & Kreator Pieśni (Song Creator)",
    category: "Media i treści",
    url: "https://cclite.pl",
    description: "Kreatywne moduły Imagination Studio oraz Song Creator w cclite.pl: twórz chrześcijańskie pieśni uwielbienia, teksty psalmów i aranżacje muzyczne ku chwale Bożej.",
    tags: [
      "cclite piosenki",
      "song creator cclite",
      "kreator pieśni uwielbienia",
      "studio wyobraźni cclite",
      "tworzenie muzyki chrześcijańskiej",
      "cclite"
    ],
    featured: false
  },
  {
    title: "cclite.pl — Pasek Emisyjny & Ticker Alertowy Na Żywo (TopNewsTicker)",
    category: "Radio & Live",
    url: "https://cclite.pl",
    description: "Dynamiczny pasek informacyjny w cclite.pl zsynchronizowany z sygnałem LIVE i alertami emisyjnymi ekosystemu Christian Culture z natychmiastowym wyświetlaniem komunikatów specjalnych.",
    tags: [
      "cclite news ticker",
      "pasek na żywo cclite",
      "komunikat na żywo cclite",
      "alert live cclite",
      "transmisje na żywo cclite",
      "cclite"
    ],
    featured: false
  },
  {
    title: "cclite.pl — Mecenat Ewangelizacyjny & Darowizna Wdowi Grosz",
    category: "Narzędzia i misja",
    url: "https://cclite.pl",
    description: "Bezpieczny moduł darowizn i mecenatu ewangelizacyjnego „Wdowi Grosz” w aplikacji cclite.pl. Wspieraj bezpłatne narzędzia biblijne, radio bez reklam i misję ewangelizacyjną Christian Culture.",
    tags: [
      "wdowi grosz cclite",
      "wsparcie misji cclite",
      "darowizna cclite",
      "patronat cclite",
      "pomoc misji",
      "cclite"
    ],
    featured: false
  },
  {
    title: "cclite.pl — Żywa Mapa Ekosystemu CC & Katalog Zasobów",
    category: "Narzędzia i misja",
    url: "https://cclite.pl",
    description: "Interaktywny przewodnik po wszystkich serwisach ekosystemu Christian Culture: radiu, telewizji CCTV24, portalu społecznościowym LUMINA, portalach wiedzy CCN News i akademii.",
    tags: [
      "cclite mapa",
      "mapa ekosystemu cclite",
      "zasoby christian culture cclite",
      "katalog cclite",
      "cclite"
    ],
    featured: false
  },
  {
    title: "cclite.pl — Telewizja CCTV24 Live & Transmisje Modlitewne",
    category: "Radio & Live",
    url: "https://cclite.pl",
    description: "Transmisje wideo na żywo, studio CCTV24, nabożeństwa i czuwania modlitewne dostępne bezpośrednio z poziomu aplikacji internetowej cclite.pl.",
    tags: [
      "cctv24 cclite",
      "telewizja na żywo cclite",
      "video live cclite",
      "transmisja modlitewna cclite",
      "cclite"
    ],
    featured: false
  }
];

// Usuń stare wpisy cclite, jeśli istniały
data.items = data.items.filter(item => !item.title.startsWith('cclite.pl'));

// Dodaj nowe wpisy na początek listy items
data.items.unshift(...ccliteItems);

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
