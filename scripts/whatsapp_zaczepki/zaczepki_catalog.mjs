/**
 * EkoCC — WhatsApp Zaczepki Catalog & Thematic Mapping
 * 
 * Mapowanie grup i pokoi tematycznych na WhatsApp do profili treści,
 * rekomendowanych modułów EkoCC oraz pytań aktywizujących.
 */

export const THEMATIC_ROOM_PROFILES = [
  {
    pattern: /(biblia audio|audiobook|słuchowisk|nagran|lektor)/i,
    category: "biblia_audio_produkcja",
    topic: "Biblia Audio CC — Kinowe Słuchowisko Pisma Świętego",
    keywords: ["Biblia Audio", "Księga Rodzaju", "słuchowisko", "patronat", "Słowo Boże", "dźwięk 3D"],
    recommendedUrl: "https://polskieradio.cc/biblia-audio",
    recommendedFeature: "Nowe słuchowisko Biblia Audio CC (Księga Rodzaju 1-9 on-demand)",
    sampleQuestions: [
      "Czy mieliście już okazję posłuchać pierwszych rozdziałów Księgi Rodzaju w kinowej oprawie dźwiękowej?",
      "Jak słuchanie udźwiękowionego Pisma Świętego pomaga Wam w codziennym wyciszeniu i modlitwie?",
      "Trwa produkcja kolejnych rozdziałów — co sądzicie o idei zostania patronem konkretnej księgi biblijnej?"
    ]
  },
  {
    pattern: /(reformacj|histori|luter|dziedzictw)/i,
    category: "historia_kosciola",
    topic: "CCN Historia & Dziedzictwo Wiary",
    keywords: ["reformacja", "95 tez", "Pismo Święte", "łaska", "historia", "Luter"],
    recommendedUrl: "https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517",
    recommendedFeature: "CCN Historia: Pełny tekst 95 tez Marcina Lutra z polskim przekładem",
    sampleQuestions: [
      "Czy powrót do samego Pisma (Sola Scriptura) jest dziś tak samo aktualny jak w 1517 roku?",
      "Jakie wnioski z historii Kościoła pomagają nam dziś zachować wierność czystej Ewangelii łaski?",
      "Czy czytaliście już oryginalne 95 tez Marcina Lutra w naszym nowym opracowaniu?"
    ]
  },
  {
    pattern: /(news|informacj|wiadomość|świat|polityk|redakcj)/i,
    category: "wiadomosci_i_analizy",
    topic: "CCN News — Rzetelne Wiadomości w Świetle Biblii",
    keywords: ["prawda", "fakty", "świat", "bezpieczeństwo", "roztropność", "analizy", "bez paniki"],
    recommendedUrl: "https://polskieradio.cc/news",
    recommendedFeature: "Portal CCN News & Wiarygodne Informacje bez sensacji",
    sampleQuestions: [
      "Jak zachować Boży pokój i trzeźwość myślenia w zalewie sensacyjnych i lękotwórczych nagłówków ze świata?",
      "Co według Was jest dziś największym wyzwaniem dla prawdy w mediach?",
      "Czy zapoznaliście się już z naszym najnowszym raportem o biblijnej roztropności i przygotowaniu na kryzys?"
    ]
  },
  {
    pattern: /biznes/i,
    category: "biznes_i_finanse",
    topic: "Chrześcijanin w Biznesie & Finanse",
    keywords: ["praca", "uczciwość", "odpowiedzialność", "zarządzanie", "błogosławieństwo"],
    recommendedUrl: "https://polskieradio.cc/news",
    recommendedFeature: "Portal CCN News & Etyka w Gospodarce",
    sampleQuestions: [
      "Jak dziś w codziennym biznesie udaje Wam się zachować Boży spokój i czyste zasady?",
      "Co według Was jest największym sprawdzianem wiary w relacjach z klientami lub współpracownikami?",
      "Gdzie w dzisiejszym zabieganiu znajdujecie 5 minut na wyciszenie i modlitwę przed trudną decyzją?"
    ]
  },
  {
    pattern: /(tata|mama|rodzice|dom)/i,
    category: "rodzina_i_dom",
    topic: "Chrześcijański Dom & Rodzina",
    keywords: ["dzieci", "relacje", "cyfrowy detoks", "wspólny stół", "miłość", "małżeństwo"],
    recommendedUrl: "https://polskieradio.cc/news/cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj",
    recommendedFeature: "Cyfrowy detoks w chrześcijańskim domu",
    sampleQuestions: [
      "Jaki jest Wasz sprawdzony sposób na wyłączenie telefonów i prawdziwy wspólny czas przy stole?",
      "Jak budujecie w Waszym domu atmosferę, do której dzieci chcą wracać z radością?",
      "Co najbardziej pomaga Wam w cierpliwym reagowaniu na codzienne trudności rodzicielskie?"
    ]
  },
  {
    pattern: /zdrow/i,
    category: "zdrowie_i_cialo",
    topic: "Biblijne Zasady Zdrowia",
    keywords: ["zdrowie", "odpoczynek", "sen", "ciało świątynią", "pokój", "energia"],
    recommendedUrl: "https://polskieradio.cc/player",
    recommendedFeature: "Kanał Muzyki Wyciszenia & Ambient Sleep na Radio CC",
    sampleQuestions: [
      "Pismo mówi, że ciało jest świątynią Ducha — jak dziś zadbaliście o regenerację i zdrowy odpoczynek?",
      "Czy pamiętacie dzisiaj o chwilach głębokiego oddechu i zatrzymania w Bożej obecności?",
      "Co w Waszym życiu najlepiej pomogło zredukować codzienny stres i chroniczne zmęczenie?"
    ]
  },
  {
    pattern: /(modl|moc|zwyci|pomog|stróż)/i,
    category: "modlitwa_i_wstawiennictwo",
    topic: "Modlitwa & Doświadczenia Bożej Mocy",
    keywords: ["modlitwa", "wstawiennictwo", "pokój serca", "nadzieja", "Boża obecność"],
    recommendedUrl: "https://polskieradio.cc/player",
    recommendedFeature: "Codzienne Rozważanie „Dobrze, że jesteś” & Modlitewnik",
    sampleQuestions: [
      "O co dzisiaj wspólnie podnosimy ręce w modlitwie? Kto potrzebuje Bożego umocnienia?",
      "Czy doświadczyliście w tym tygodniu małego Bożego cudu, za który warto dziś podziękować?",
      "Co przynosi Wam największy pokój, gdy wokół szaleją burze codzienności?"
    ]
  },
  {
    pattern: /(muzyk|worship|chwał)/i,
    category: "uwielbienie_i_muzyka",
    topic: "Muzyka Miłości & Chwała Panu",
    keywords: ["uwielbienie", "psalmy", "pieśni chwały", "pokój", "wdzięczność"],
    recommendedUrl: "https://polskieradio.cc/player",
    recommendedFeature: "Radio Christian Culture 24/7 & Biblia Śpiewana",
    sampleQuestions: [
      "Jaka pieśń uwielbienia towarzyszy Wam dzisiaj od samego rana?",
      "Czy muzyka chwały pomaga Wam w pracy i domowych obowiązkach?",
      "Który Psalm jest dziś najbliższy Waszemu sercu?"
    ]
  },
  {
    pattern: /(wiara|bibli|studi|słowo|kazan|teolog)/i,
    category: "studium_i_slowo",
    topic: "Budowanie Wiary & Słowo Boże",
    keywords: ["Pismo Święte", "werset dnia", "studium", "mądrość", "UBG", "poznanie"],
    recommendedUrl: "https://polskieradio.cc/akademia#kurscodzienny",
    recommendedFeature: "Akademia Biblijna CC & Interlinearna MojaBiblia",
    sampleQuestions: [
      "Jaki werset ze Słowa Bożego dał Wam w tym tygodniu najwięcej światła?",
      "Jak łączycie codzienne czytanie Pisma z praktycznymi decyzjami w ciągu dnia?",
      "Czy znacie już dzisiejszą lekcję Kursu Codziennego w Akademii CC?"
    ]
  },
  {
    pattern: /(śniadani|dzień dobry|inspir|motyw)/i,
    category: "poranna_motywacja",
    topic: "Śniadanie z Mistrzem & Inspiracja na Dziś",
    keywords: ["dzień dobry", "nowy poranek", "łaska", "nowy początek", "energia"],
    recommendedUrl: "https://polskieradio.cc/wyszukiwarka",
    recommendedFeature: "Uniwersalna Wyszukiwarka EkoCC i Polecane Dziś",
    sampleQuestions: [
      "Z jakim nastawieniem serca wkraczacie w ten dzień? Pamiętajcie, że Boże miłosierdzie odnawia się co rano!",
      "Co dzisiaj jest Waszym najważniejszym celem, który powierzacie Bogu?",
      "Kto dzisiaj usłyszy od Was dobre, umacniające słowo?"
    ]
  },
  {
    pattern: /(kobieta|mężczyzna|singiel)/i,
    category: "tozsamosc_i_relacje",
    topic: "Chrześcijański Styl Życia & Relacje",
    keywords: ["tożsamość", "wzrost", "odpowiedzialność", "czystość", "relacje"],
    recommendedUrl: "https://polskieradio.cc/player#apokalipsa",
    recommendedFeature: "Podcast Studio Dobrego Słowa & Osobowość+",
    sampleQuestions: [
      "Co jest dziś największą siłą chrześcijanina w świecie pełnym powierzchowności?",
      "Jak budować głębokie, zdrowe relacje w erze powiadomień i pośpiechu?",
      "Co pomaga Wam zachować wierność swoim wartościom, gdy nikt nie patrzy?"
    ]
  }
];

export const DEFAULT_ROOM_PROFILE = {
  category: "ogolne_inspiracje",
  topic: "Inspiracje & Społeczność Christian Culture",
  keywords: ["nadzieja", "pokój", "wspólnota", "dobro", "świadectwo"],
  recommendedUrl: "https://polskieradio.cc",
  recommendedFeature: "Główny Portal Christian Culture 24/7",
  sampleQuestions: [
    "Jak mija Wam dzisiejszy dzień? Pamiętajcie: Dobrze, że jesteście!",
    "Czy znaleźliście dziś choćby 3 minuty na chwilę wdzięczności przed Bogiem?",
    "Co możemy dziś zrobić, by komuś obok nas było odrobinę lżej i jaśniej?"
  ]
};

export function resolveRoomProfile(roomName) {
  if (!roomName) return DEFAULT_ROOM_PROFILE;
  for (const p of THEMATIC_ROOM_PROFILES) {
    if (p.pattern.test(roomName)) return p;
  }
  return DEFAULT_ROOM_PROFILE;
}
