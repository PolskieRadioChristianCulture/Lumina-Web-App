import { BibleVerse } from "../types";

const BIBLE_JSON_URL = "https://drive.google.com/uc?export=download&id=1ZUHXB8mSjJxwTJvU0yW4hfDDLm6-DuOW";
const STORAGE_KEY = "cc_bible_ubg_flat_v7_2";

const PROXY_LIST = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest="
];

// Rozszerzona rezerwowa baza wersetów na rok 2026
const FALLBACK_VERSES: FlatVerse[] = [
  { r: "Filipian 4:13", t: "Wszystko mogę w Chrystusie, który mnie umacnia." },
  { r: "Jana 3:16", t: "Tak bowiem Bóg umiłował świat, że dał swego jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne." },
  { r: "Przysłów 3:5", t: "Zaufaj PANU z całego swego serca i nie polegaj na własnym rozumie." },
  { r: "Rzymian 8:28", t: "A wiemy, że wszystko współdziała dla dobra tych, którzy miłują Boga." },
  { r: "Jozuego 1:9", t: "Czyż ci nie nakazałem: Bądź mężny i mocny? Nie bój się ani się nie lękaj, gdyż PAN, twój Bóg, będzie z tobą wszędzie, gdziekolwiek pójdziesz." },
  { r: "Psalm 23:1", t: "PAN jest moim pasterzem, niczego mi nie braknie." },
  { r: "Izajasza 40:31", t: "Lecz ci, którzy ufają PANU, nabiorą nowych sił; wzbiją się na skrzydłach jak orły, będą biec, a się nie zmęczą, będą iść, a nie ustaną." },
  { r: "Mateusza 11:28", t: "Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek." },
  { r: "Hebrajczyków 11:1", t: "A wiara jest podstawą tego, czego się spodziewamy, i dowodem tego, czego nie widzimy." },
  { r: "1 Koryntian 13:13", t: "A teraz trwają wiara, nadzieja, miłość, te trzy; z nich zaś największa jest miłość." },
  { r: "Efezjan 2:8", t: "Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boży." },
  { r: "Psalm 119:105", t: "Twoje słowo jest pochodnią dla moich nóg i światłością na mojej ścieżce." },
  { r: "2 Tymoteusza 1:7", t: "Gdyż nie dał nam Bóg ducha bojaźni, ale mocy, miłości i zdrowego rozsądku." }
];

interface FlatVerse {
  r: string; // Reference
  t: string; // Text
}

export const BibleService = {
  privateDb: null as FlatVerse[] | null,
  isInitializing: false,

  async fetchWithTimeout(url: string, options = {}, timeout = 8000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  },

  async fetchWithProxy(url: string): Promise<Response> {
    try {
      const direct = await this.fetchWithTimeout(url, { method: 'GET' }, 4000);
      if (direct.ok) return direct;
    } catch (e) {}

    for (const proxy of PROXY_LIST) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await this.fetchWithTimeout(proxyUrl, { method: 'GET' }, 7000);
        if (response.ok) {
          // Usunięto rygorystyczne sprawdzanie nagłówka Content-Type
          // Ponieważ Google Drive często zwraca text/plain dla plików JSON
          return response;
        }
      } catch (e) {}
    }
    throw new Error("ALL_FETCH_METHODS_FAILED");
  },

  async loadDatabase(): Promise<FlatVerse[]> {
    if (this.privateDb && this.privateDb.length > 10) return this.privateDb;

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 100) {
          this.privateDb = parsed;
          return this.privateDb;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (this.isInitializing) return FALLBACK_VERSES;
    this.isInitializing = true;

    try {
      const response = await this.fetchWithProxy(BIBLE_JSON_URL);
      const data: any = await response.json();
      
      // Jeśli otrzymaliśmy HTML (strona ostrzeżenia Google), to rzucamy błąd i idziemy do catch
      if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        throw new Error("RECEIVED_HTML_INSTEAD_OF_JSON");
      }

      let flatDb: FlatVerse[] = [];

      if (Array.isArray(data)) {
        flatDb = data;
      } else {
        const books = data.books || data.b || [];
        books.forEach((book: any) => {
          const bookName = book.name || book.n || book.title || "Księga";
          const chapters = book.chapters || book.c || [];
          chapters.forEach((chapter: any) => {
            const cNum = chapter.number ?? chapter.c ?? chapter.num ?? "?";
            const verses = chapter.verses || chapter.v || [];
            verses.forEach((verse: any) => {
              const vNum = verse.number ?? verse.v ?? verse.num ?? "?";
              const verseText = verse.text || verse.t || "";
              if (verseText) {
                flatDb.push({ r: `${bookName} ${cNum}:${vNum}`, t: verseText });
              }
            });
          });
        });
      }

      if (flatDb.length > 100) {
        this.privateDb = flatDb;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.privateDb)); } catch (e) {}
        return this.privateDb;
      }
      
      throw new Error("PARSE_FAILED_OR_EMPTY");
    } catch (error) {
      console.warn("[BibleService] Could not load online DB, using internal fallback database.");
      this.privateDb = FALLBACK_VERSES;
      return FALLBACK_VERSES;
    } finally {
      this.isInitializing = false;
    }
  },

  mapToBibleVerse(flat: FlatVerse): BibleVerse {
    return {
      reference: flat.r,
      text: flat.t,
      reflection: "", 
      commentary: "",
      callToAction: "",
      blessing: "",
      prayer: "",
      application: ""
    };
  },

  async getDailyVerse(): Promise<BibleVerse> {
    const db = await this.loadDatabase();
    const now = new Date();
    const seed = (now.getFullYear() * 10000) + ((now.getMonth() + 1) * 100) + now.getDate();
    const index = seed % db.length;
    return this.mapToBibleVerse(db[index]);
  },

  async getRandomVerse(): Promise<BibleVerse> {
    const db = await this.loadDatabase();
    const index = Math.floor(Math.random() * db.length);
    return this.mapToBibleVerse(db[index]);
  }
};