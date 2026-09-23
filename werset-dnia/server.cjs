var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");

// src/data/verses.ts
var BIBLE_VERSES = [
  // Psalm 23
  {
    id: "ps-23-1",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 23,
    verse: "1",
    reference: "Psalm 23:1",
    text: "Pan jest pasterzem moim, niczego mi nie braknie.",
    translation: "Biblia Warszawska",
    category: "psalm23",
    tags: ["psalm 23", "pasterz", "pokoj", "troska", "zaopatrzenie", "brak", "bezpiecze\u0144stwo", "zaufanie", "dzisiaj potrzebuj\u0119 pokoju"],
    defaultBgId: "green-pastures-psalm23",
    slug: "psalm-23-1"
  },
  {
    id: "ps-23-4",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 23,
    verse: "4",
    reference: "Psalm 23:4",
    text: "Cho\u0107bym nawet szed\u0142 ciemn\u0105 dolin\u0105, z\u0142a si\u0119 nie ul\u0119kn\u0119, bo\u015B Ty ze mn\u0105; laska Twoja i kij Tw\xF3j mnie pocieszaj\u0105.",
    translation: "Biblia Warszawska",
    category: "psalm23",
    tags: ["psalm 23", "ciemna dolina", "strach", "lek", "pocieszenie", "smutek", "obecnosc", "ochrona", "trudnosci", "jest mi ciezko"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "psalm-23-4"
  },
  // Nadzieja
  {
    id: "jer-29-11",
    book: "Ksi\u0119ga Jeremiasza",
    bookShort: "Jr",
    chapter: 29,
    verse: "11",
    reference: "Jeremiasz 29:11",
    text: "Albowiem Ja wiem, jakie my\u015Bli mam o was \u2013 m\xF3wi Pan \u2013 my\u015Bli o pokoju, a nie o niedoli, aby da\u0107 wam przysz\u0142o\u015B\u0107 i nadziej\u0119.",
    translation: "Biblia Warszawska",
    category: "nadzieja",
    tags: ["nadzieja", "przyszlosc", "pokoj", "plany", "b\xF3g", "przeznaczenie", "zaufanie", "dzisiaj potrzebuj\u0119 nadziei"],
    defaultBgId: "sunrise-hope",
    slug: "jeremiasz-29-11"
  },
  {
    id: "rz-15-13",
    book: "List do Rzymian",
    bookShort: "Rz",
    chapter: 15,
    verse: "13",
    reference: "Rzymian 15:13",
    text: "A B\xF3g nadziei niechaj was nape\u0142ni wszelk\u0105 rado\u015Bci\u0105 i pokojem w wierze, aby\u015Bcie obfitowali w nadziej\u0119 przez moc Ducha \u015Awi\u0119tego.",
    translation: "Biblia Warszawska",
    category: "nadzieja",
    tags: ["nadzieja", "radosc", "pokoj", "wiara", "duch swiety", "moc", "obfitosc", "dzisiaj potrzebuj\u0119 nadziei"],
    defaultBgId: "sunrise-hope",
    slug: "rzymian-15-13"
  },
  {
    id: "iz-40-31",
    book: "Ksi\u0119ga Izajasza",
    bookShort: "Iz",
    chapter: 40,
    verse: "31",
    reference: "Izajasz 40:31",
    text: "Lecz ci, kt\xF3rzy ufaj\u0105 Panu, nabieraj\u0105 nowej si\u0142y, wzbijaj\u0105 si\u0119 na skrzyd\u0142ach jak or\u0142y, biegn\u0105, a nie m\u0119cz\u0105 si\u0119, id\u0105, a nie ustaj\u0105.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["sila", "orly", "zmeczenie", "nadzieja", "zaufanie", "moc", "brak sil", "jest mi ciezko", "dzisiaj potrzebuj\u0119 si\u0142y"],
    defaultBgId: "mountains-strength",
    slug: "izajasz-40-31"
  },
  {
    id: "lm-3-22-23",
    book: "Lamentacje (Treny)",
    bookShort: "Lm",
    chapter: 3,
    verse: "22-23",
    reference: "Lamentacje 3:22-23",
    text: "Niewyczerpane s\u0105 \u0142aski Pana, mi\u0142osierdzie Jego nie ustaje. Nowe s\u0105 ka\u017Cdego poranka; wielka jest wierno\u015B\u0107 Twoja!",
    translation: "Biblia Warszawska",
    category: "nadzieja",
    tags: ["nadzieja", "laska", "milosierdzie", "poranek", "wiernosc", "nowy dzien", "pocieszenie", "przebaczenie"],
    defaultBgId: "sunrise-hope",
    slug: "lamentacje-3-22-23"
  },
  // Pokój
  {
    id: "j-14-27",
    book: "Ewangelia wg \u015Bw. Jana",
    bookShort: "J",
    chapter: 14,
    verse: "27",
    reference: "Jan 14:27",
    text: "Pok\xF3j zostawiam wam, M\xF3j pok\xF3j daj\u0119 wam; nie jak \u015Bwiat daje, Ja wam daj\u0119. Niech si\u0119 nie trwo\u017Cy serce wasze i niech si\u0119 nie l\u0119ka.",
    translation: "Biblia Warszawska",
    category: "pokoj",
    tags: ["pokoj", "serce", "strach", "lek", "niepokoj", "jezus", "swiat", "spokoj", "dzisiaj potrzebuj\u0119 pokoju"],
    defaultBgId: "calm-lake-peace",
    slug: "jan-14-27"
  },
  {
    id: "flp-4-6-7",
    book: "List do Filipian",
    bookShort: "Flp",
    chapter: 4,
    verse: "6-7",
    reference: "Filipian 4:6-7",
    text: "O nic si\u0119 nie martwcie, ale we wszystkim w modlitwie i b\u0142aganiu z dzi\u0119kczynieniem powierzajcie pro\u015Bby wasze Bogu. A pok\xF3j Bo\u017Cy, kt\xF3ry przewy\u017Csza wszelki rozum, strzec b\u0119dzie serc waszych.",
    translation: "Biblia Warszawska",
    category: "pokoj",
    tags: ["pokoj", "martwienie", "troski", "modlitwa", "dziekczynienie", "stres", "mysli", "dzisiaj potrzebuj\u0119 pokoju"],
    defaultBgId: "calm-lake-peace",
    slug: "filipian-4-6-7"
  },
  {
    id: "kol-3-15",
    book: "List do Kolosan",
    bookShort: "Kol",
    chapter: 3,
    verse: "15",
    reference: "Kolosan 3:15",
    text: "A w sercach waszych niech rz\u0105dzi pok\xF3j Chrystusowy, do kt\xF3rego te\u017C powo\u0142ani jeste\u015Bcie w jednym ciele; i b\u0105d\u017Acie wdzi\u0119czni.",
    translation: "Biblia Warszawska",
    category: "pokoj",
    tags: ["pokoj", "chrystus", "wdziecznosc", "serce", "jednosc", "zgoda"],
    defaultBgId: "calm-lake-peace",
    slug: "kolosan-3-15"
  },
  {
    id: "lb-6-24-26",
    book: "Ksi\u0119ga Liczb",
    bookShort: "Lb",
    chapter: 6,
    verse: "24-26",
    reference: "Liczb 6:24-26",
    text: "Niech ci b\u0142ogos\u0142awi Pan i niechaj ci\u0119 strze\u017Ce; niech rozja\u015Bni Pan oblicze swoje nad tob\u0105 i niech ci mi\u0142o\u015Bciw b\u0119dzie; niech obr\xF3ci Pan twarz swoj\u0105 ku tobie i niech ci da pok\xF3j.",
    translation: "Biblia Warszawska",
    category: "pokoj",
    tags: ["blogoslawienstwo", "pokoj", "ochrona", "laska", "twarz", "oblicze", "kaplanskie"],
    defaultBgId: "calm-lake-peace",
    slug: "liczb-6-24-26"
  },
  // Siła
  {
    id: "flp-4-13",
    book: "List do Filipian",
    bookShort: "Flp",
    chapter: 4,
    verse: "13",
    reference: "Filipian 4:13",
    text: "Wszystko mog\u0119 w Tym, kt\xF3ry mnie wzmacnia \u2013 w Chrystusie.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["sila", "chrystus", "wszystko moge", "moc", "zwyciestwo", "odwaga", "trudnosci", "dzisiaj potrzebuj\u0119 si\u0142y"],
    defaultBgId: "mountains-strength",
    slug: "filipian-4-13"
  },
  {
    id: "joz-1-9",
    book: "Ksi\u0119ga Jozuego",
    bookShort: "Joz",
    chapter: 1,
    verse: "9",
    reference: "Jozue 1:9",
    text: "Czy\u017C ci nie nakaza\u0142em: B\u0105d\u017A mocny i m\u0119\u017Cny? Nie b\xF3j si\u0119 i nie l\u0119kaj, bo Pan, B\xF3g tw\xF3j, b\u0119dzie z tob\u0105 wsz\u0119dzie, dok\u0105dkolwiek p\xF3jdziesz.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["sila", "odwaga", "strach", "lek", "mezny", "obecnosc", "droga", "dzisiaj potrzebuj\u0119 si\u0142y"],
    defaultBgId: "mountains-strength",
    slug: "jozue-1-9"
  },
  {
    id: "ps-46-2",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 46,
    verse: "2",
    reference: "Psalm 46:2",
    text: "B\xF3g jest ucieczk\u0105 i si\u0142\u0105 nasz\u0105, pomoc\u0105 w utrapieniach najpewniejsz\u0105.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["sila", "ucieczka", "pomoc", "utrapienie", "trud", "kryzys", "opoka", "schronienie"],
    defaultBgId: "mountains-strength",
    slug: "psalm-46-2"
  },
  {
    id: "2kor-12-9",
    book: "2 List do Koryntian",
    bookShort: "2Kor",
    chapter: 12,
    verse: "9",
    reference: "2 Koryntian 12:9",
    text: "I rzek\u0142 mi: Dosy\u0107 masz na \u0142asce mojej, albowiem moc moja doskonali si\u0119 w s\u0142abo\u015Bci. Najch\u0119tniej wi\u0119c chlubi\u0107 si\u0119 b\u0119d\u0119 s\u0142abo\u015Bciami, aby zamieszka\u0142a we mnie moc Chrystusowa.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["slabosc", "moc", "laska", "cierpienie", "chrystus", "choroba", "jest mi ciezko"],
    defaultBgId: "mountains-strength",
    slug: "2-koryntian-12-9"
  },
  {
    id: "iz-41-10",
    book: "Ksi\u0119ga Izajasza",
    bookShort: "Iz",
    chapter: 41,
    verse: "10",
    reference: "Izajasz 41:10",
    text: "Nie b\xF3j si\u0119, bom Ja z tob\u0105, nie l\u0119kaj si\u0119, bom Ja twoim Bogiem! Wzmocni\u0119 ci\u0119, a tak\u017Ce pomog\u0119 ci, podepr\u0119 ci\u0119 prawic\u0105 swej sprawiedliwo\u015Bci.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["strach", "lek", "pomoc", "prawica", "sila", "b\xF3g", "nie boj sie", "dzisiaj potrzebuj\u0119 si\u0142y"],
    defaultBgId: "mountains-strength",
    slug: "izajasz-41-10"
  },
  // Mądrość & Prowadzenie
  {
    id: "jkb-1-5",
    book: "List \u015Bw. Jakuba",
    bookShort: "Jk",
    chapter: 1,
    verse: "5",
    reference: "Jakub 1:5",
    text: "A je\u015Bli komu z was brak m\u0105dro\u015Bci, niech prosi Boga, kt\xF3ry daje wszystkim ch\u0119tnie i bez wypominania, a b\u0119dzie mu dana.",
    translation: "Biblia Warszawska",
    category: "madrosc",
    tags: ["madrosc", "prosba", "decyzje", "wskazowka", "rozum", "wypominanie", "dzisiaj potrzebuj\u0119 m\u0105dro\u015Bci"],
    defaultBgId: "misty-forest-wisdom",
    slug: "jakub-1-5"
  },
  {
    id: "prz-3-5-6",
    book: "Ksi\u0119ga Przys\u0142\xF3w",
    bookShort: "Prz",
    chapter: 3,
    verse: "5-6",
    reference: "Przypowie\u015Bci 3:5-6",
    text: "Zaufaj Panu z ca\u0142ego swojego serca i nie polegaj na w\u0142asnym rozumie! Pami\u0119taj o Nim na wszystkich swoich drogach, a On prostowa\u0107 b\u0119dzie twoje \u015Bcie\u017Cki.",
    translation: "Biblia Warszawska",
    category: "madrosc",
    tags: ["zaufanie", "serce", "rozum", "droga", "sciezki", "decyzje", "kierunek", "dzisiaj potrzebuj\u0119 m\u0105dro\u015Bci", "jak zaufa\u0107 bogu"],
    defaultBgId: "pathway-light-way",
    slug: "przypowiesci-3-5-6"
  },
  {
    id: "ps-119-105",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 119,
    verse: "105",
    reference: "Psalm 119:105",
    text: "S\u0142owo Twoje jest pochodni\u0105 dla n\xF3g moich i \u015Bwiat\u0142o\u015Bci\u0105 na mojej \u015Bcie\u017Cce.",
    translation: "Biblia Warszawska",
    category: "madrosc",
    tags: ["slowo boze", "swiatlo", "pochodnia", "sciezka", "droga", "kierunek", "madrosc"],
    defaultBgId: "pathway-light-way",
    slug: "psalm-119-105"
  },
  // Pocieszenie / Cierpienie / Smutek
  {
    id: "mt-11-28",
    book: "Ewangelia wg \u015Bw. Mateusza",
    bookShort: "Mt",
    chapter: 11,
    verse: "28",
    reference: "Mateusz 11:28",
    text: "P\xF3jd\u017Acie do Mnie wszyscy, kt\xF3rzy spracowani i obci\u0105\u017Ceni jeste\u015Bcie, a Ja wam dam ukojenie.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["ukojenie", "odpoczynek", "ciezar", "zmeczenie", "jest mi ciezko", "depresja", "smutek", "jezus", "dzisiaj potrzebuj\u0119 pocieszenia"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "mateusz-11-28"
  },
  {
    id: "ps-34-19",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 34,
    verse: "19",
    reference: "Psalm 34:19",
    text: "Bliski jest Pan tym, kt\xF3rych serce jest z\u0142amane, a wybawia tych, kt\xF3rzy s\u0105 skruszeni na duchu.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["zlamane serce", "smutek", "zaloba", "rozpacz", "jest mi ciezko", "bliskosc", "wybawienie", "dzisiaj potrzebuj\u0119 pocieszenia"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "psalm-34-19"
  },
  {
    id: "obj-21-4",
    book: "Objawienie \u015Bw. Jana",
    bookShort: "Obj",
    chapter: 21,
    verse: "4",
    reference: "Objawienie 21:4",
    text: "I otrze B\xF3g wszelk\u0105 \u0142z\u0119 z oczu ich, i \u015Bmierci ju\u017C nie b\u0119dzie; ani smutku, ani krzyku, ani mozo\u0142u ju\u017C nie b\u0119dzie; albowiem pierwsze rzeczy przemin\u0119\u0142y.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["lzy", "smierc", "smutek", "krzyk", "wiecznosc", "nadzieja", "niebo", "pocieszenie"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "objawienie-21-4"
  },
  {
    id: "2kor-1-3-4",
    book: "2 List do Koryntian",
    bookShort: "2Kor",
    chapter: 1,
    verse: "3-4",
    reference: "2 Koryntian 1:3-4",
    text: "B\u0142ogos\u0142awiony niech b\u0119dzie B\xF3g i Ojciec Pana naszego Jezusa Chrystusa, Ojciec mi\u0142osierdzia i B\xF3g wszelkiej pociechy, kt\xF3ry nas pociesza w ka\u017Cdym ucisku naszym.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["pociecha", "ucisk", "milosierdzie", "ojciec", "smutek", "wsparcie", "dzisiaj potrzebuj\u0119 pocieszenia"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "2-koryntian-1-3-4"
  },
  // Wiara i Zaufanie
  {
    id: "rz-8-28",
    book: "List do Rzymian",
    bookShort: "Rz",
    chapter: 8,
    verse: "28",
    reference: "Rzymian 8:28",
    text: "A wiemy, \u017Ce B\xF3g wsp\xF3\u0142dzia\u0142a we wszystkim ku dobremu z tymi, kt\xF3rzy Boga mi\u0142uj\u0105, to jest z tymi, kt\xF3rzy wed\u0142ug postanowienia Jego s\u0105 powo\u0142ani.",
    translation: "Biblia Warszawska",
    category: "wiara",
    tags: ["rzymian 8:28", "dobro", "wspoldzialanie", "wiara", "zaufanie", "plan", "przeznaczenie", "trudnosci", "dzisiaj potrzebuj\u0119 wiary"],
    defaultBgId: "pathway-light-way",
    slug: "rzymian-8-28"
  },
  {
    id: "hbr-11-1",
    book: "List do Hebrajczyk\xF3w",
    bookShort: "Hbr",
    chapter: 11,
    verse: "1",
    reference: "Hebrajczyk\xF3w 11:1",
    text: "A wiara jest pewno\u015Bci\u0105 tego, czego si\u0119 spodziewamy, prze\u015Bwiadczeniem o tym, czego nie widzimy.",
    translation: "Biblia Warszawska",
    category: "wiara",
    tags: ["wiara", "pewnosc", "nadzieja", "niewidzialne", "dowod", "ufnosc", "dzisiaj potrzebuj\u0119 wiary"],
    defaultBgId: "starry-night-sky",
    slug: "hebrajczykow-11-1"
  },
  {
    id: "ps-37-5",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 37,
    verse: "5",
    reference: "Psalm 37:5",
    text: "Powierz Panu drog\u0119 swoj\u0105, zaufaj Mu, a On wszystko dobrze uczyni!",
    translation: "Biblia Warszawska",
    category: "wiara",
    tags: ["droga", "zaufanie", "powierzenie", "przyszlosc", "jak zaufa\u0107 bogu", "dzisiaj potrzebuj\u0119 wiary"],
    defaultBgId: "pathway-light-way",
    slug: "psalm-37-5"
  },
  {
    id: "2kor-5-7",
    book: "2 List do Koryntian",
    bookShort: "2Kor",
    chapter: 5,
    verse: "7",
    reference: "2 Koryntian 5:7",
    text: "Gdy\u017C w wierze, a nie w ogl\u0105daniu pielgrzymujemy.",
    translation: "Biblia Warszawska",
    category: "wiara",
    tags: ["wiara", "pielgrzymka", "wzrok", "zaufanie", "krok wiary"],
    defaultBgId: "starry-night-sky",
    slug: "2-koryntian-5-7"
  },
  // Przebaczenie i Łaska
  {
    id: "ef-4-32",
    book: "List do Efezjan",
    bookShort: "Ef",
    chapter: 4,
    verse: "32",
    reference: "Efezjan 4:32",
    text: "B\u0105d\u017Acie jedni dla drugich uprzejmi, serdeczni, odpuszczaj\u0105c sobie nawzajem, jak i wam B\xF3g odpu\u015Bci\u0142 w Chrystusie.",
    translation: "Biblia Warszawska",
    category: "przebaczenie",
    tags: ["przebaczenie", "odpuszczenie", "uprzejmosc", "serdecznosc", "chrystus", "zranienie", "konflikt", "dzisiaj potrzebuj\u0119 przebaczenia"],
    defaultBgId: "desert-light-salvation",
    slug: "efezjan-4-32"
  },
  {
    id: "1j-1-9",
    book: "1 List \u015Bw. Jana",
    bookShort: "1J",
    chapter: 1,
    verse: "9",
    reference: "1 Jana 1:9",
    text: "Je\u015Bli wyznajemy grzechy swoje, wierny jest B\xF3g i sprawiedliwy i odpu\u015Bci nam grzechy, i oczy\u015Bci nas od wszelkiej nieprawo\u015Bci.",
    translation: "Biblia Warszawska",
    category: "przebaczenie",
    tags: ["przebaczenie", "grzech", "wyznanie", "oczyszczenie", "wiernosc", "laska", "dzisiaj potrzebuj\u0119 przebaczenia"],
    defaultBgId: "desert-light-salvation",
    slug: "1-jana-1-9"
  },
  {
    id: "ps-103-12",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 103,
    verse: "12",
    reference: "Psalm 103:12",
    text: "Jak daleko jest wsch\xF3d od zachodu, tak oddali\u0142 od nas wyst\u0119pki nasze.",
    translation: "Biblia Warszawska",
    category: "przebaczenie",
    tags: ["przebaczenie", "wschod", "zachod", "wystepki", "wolnosc", "poczucie winy", "laska"],
    defaultBgId: "sunrise-hope",
    slug: "psalm-103-12"
  },
  {
    id: "iz-1-18",
    book: "Ksi\u0119ga Izajasza",
    bookShort: "Iz",
    chapter: 1,
    verse: "18",
    reference: "Izajasz 1:18",
    text: "Chod\u017Acie i sp\xF3r ze Mn\u0105 wied\u017Acie! \u2013 m\xF3wi Pan. Cho\u0107by wasze grzechy by\u0142y jak szkar\u0142at, jak \u015Bnieg wybielej\u0105; cho\u0107by czerwone jak purpura, stan\u0105 si\u0119 bia\u0142e jak we\u0142na.",
    translation: "Biblia Warszawska",
    category: "przebaczenie",
    tags: ["przebaczenie", "grzech", "snieg", "czystosc", "nowy poczatek", "laska"],
    defaultBgId: "desert-light-salvation",
    slug: "izajasz-1-18"
  },
  // Miłość & Małżeństwo & Rodzina
  {
    id: "1kor-13-4-7",
    book: "1 List do Koryntian",
    bookShort: "1Kor",
    chapter: 13,
    verse: "4-7",
    reference: "1 Koryntian 13:4-7",
    text: "Mi\u0142o\u015B\u0107 jest cierpliwa, mi\u0142o\u015B\u0107 jest dobrotliwa; nie zazdro\u015Bci, mi\u0142o\u015B\u0107 nie jest che\u0142pliwa, nie nadyma si\u0119, nie post\u0119puje nieprzystojnie, nie szuka swego, nie unosi si\u0119, nie my\u015Bli nic z\u0142ego. Wszystko zakrywa, wszystkiemu wierzy, wszystkiego si\u0119 spodziewa, wszystko znosi.",
    translation: "Biblia Warszawska",
    category: "milosc",
    tags: ["milosc", "malzenstwo", "rodzina", "cierpliwosc", "zaufanie", "dobroc", "relacje", "1 koryntian 13"],
    defaultBgId: "golden-warmth-love",
    slug: "1-koryntian-13-4-7"
  },
  {
    id: "1j-4-18",
    book: "1 List \u015Bw. Jana",
    bookShort: "1J",
    chapter: 4,
    verse: "18",
    reference: "1 Jana 4:18",
    text: "W mi\u0142o\u015Bci nie ma boja\u017Ani, lecz doskona\u0142a mi\u0142o\u015B\u0107 usuwa boja\u017A\u0144, poniewa\u017C boja\u017A\u0144 \u0142\u0105czy si\u0119 z kar\u0105; ten za\u015B, kto si\u0119 boi, nie jest doskona\u0142y w mi\u0142o\u015Bci.",
    translation: "Biblia Warszawska",
    category: "milosc",
    tags: ["milosc", "strach", "bojazn", "lek", "pokoj", "bezpieczenstwo"],
    defaultBgId: "golden-warmth-love",
    slug: "1-jana-4-18"
  },
  {
    id: "rz-8-38-39",
    book: "List do Rzymian",
    bookShort: "Rz",
    chapter: 8,
    verse: "38-39",
    reference: "Rzymian 8:38-39",
    text: "Albowiem jestem tego pewien, \u017Ce ani \u015Bmier\u0107, ani \u017Cycie, ani anio\u0142owie, ani pot\u0119gi niebieskie, ani tera\u017Aniejszo\u015B\u0107, ani przysz\u0142o\u015B\u0107, ani moce, ani wysoko\u015B\u0107, ani g\u0142\u0119boko\u015B\u0107, ani \u017Cadne inne stworzenie nie zdo\u0142a nas od\u0142\u0105czy\u0107 od mi\u0142o\u015Bci Bo\u017Cej, kt\xF3ra jest w Chrystusie Jezusie, Panu naszym.",
    translation: "Biblia Warszawska",
    category: "milosc",
    tags: ["milosc boza", "smierc", "zycie", "pewnosc", "bezpieczenstwo", "chrystus", "oddzielenie"],
    defaultBgId: "deep-ocean-depth",
    slug: "rzymian-8-38-39"
  },
  // Zbawienie & Jezus
  {
    id: "j-3-16",
    book: "Ewangelia wg \u015Bw. Jana",
    bookShort: "J",
    chapter: 3,
    verse: "16",
    reference: "Jan 3:16",
    text: "Albowiem tak B\xF3g umi\u0142owa\u0142 \u015Bwiat, \u017Ce Syna swego jednorodzonego da\u0142, aby ka\u017Cdy, kto we\u0144 wierzy, nie zgin\u0105\u0142, ale mia\u0142 \u017Cywot wieczny.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["jan 3:16", "zbawienie", "jezus", "zycie wieczne", "milosc boza", "wiara", "krzyz"],
    defaultBgId: "light-beam-prayer",
    slug: "jan-3-16"
  },
  {
    id: "j-14-6",
    book: "Ewangelia wg \u015Bw. Jana",
    bookShort: "J",
    chapter: 14,
    verse: "6",
    reference: "Jan 14:6",
    text: "Odpowiedzia\u0142 mu Jezus: Ja jestem droga i prawda, i \u017Cywot; nikt nie przychodzi do Ojca, tylko przeze Mnie.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["jan 14:6", "droga", "prawda", "zycie", "jezus", "ojciec", "zbawienie"],
    defaultBgId: "pathway-light-way",
    slug: "jan-14-6"
  },
  {
    id: "rz-10-9",
    book: "List do Rzymian",
    bookShort: "Rz",
    chapter: 10,
    verse: "9",
    reference: "Rzymian 10:9",
    text: "Bo je\u015Bli ustami swoimi wyznasz, \u017Ce Jezus jest Panem, i uwierzysz w sercu swoim, \u017Ce B\xF3g wzbudzi\u0142 Go z martwych, zbawiony b\u0119dziesz.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["zbawienie", "wyznanie", "wiara", "zmartwychwstanie", "jezus jest panem", "serce"],
    defaultBgId: "light-beam-prayer",
    slug: "rzymian-10-9"
  },
  // Modlitwa
  {
    id: "mt-7-7",
    book: "Ewangelia wg \u015Bw. Mateusza",
    bookShort: "Mt",
    chapter: 7,
    verse: "7",
    reference: "Mateusz 7:7",
    text: "Pro\u015Bcie, a b\u0119dzie wam dane; szukajcie, a znajdziecie; ko\u0142aczcie, a otworz\u0105 wam.",
    translation: "Biblia Warszawska",
    category: "modlitwa",
    tags: ["modlitwa", "prosba", "szukanie", "odpowiedz", "drzwi", "obietnica"],
    defaultBgId: "light-beam-prayer",
    slug: "mateusz-7-7"
  },
  {
    id: "jr-33-3",
    book: "Ksi\u0119ga Jeremiasza",
    bookShort: "Jr",
    chapter: 33,
    verse: "3",
    reference: "Jeremiasz 33:3",
    text: "Wo\u0142aj do Mnie, a odpowiem ci i oznajmi\u0119 ci rzeczy wielkie i niedost\u0119pne, o kt\xF3rych nie wiesz!",
    translation: "Biblia Warszawska",
    category: "modlitwa",
    tags: ["modlitwa", "wolanie", "odpowiedz", "tajemnice", "prowadzenie", "b\xF3g"],
    defaultBgId: "light-beam-prayer",
    slug: "jeremiasz-33-3"
  },
  {
    id: "1tes-5-16-18",
    book: "1 List do Tesaloniczan",
    bookShort: "1Tes",
    chapter: 5,
    verse: "16-18",
    reference: "1 Tesaloniczan 5:16-18",
    text: "Zawsze si\u0119 radujcie. Bez przestanku si\u0119 m\xF3dlcie. Za wszystko dzi\u0119kujcie; taka jest bowiem wola Bo\u017Ca w Chrystusie Jezusie wzgl\u0119dem was.",
    translation: "Biblia Warszawska",
    category: "modlitwa",
    tags: ["modlitwa", "radosc", "wdziecznosc", "wola boza", "dziekczynienie", "codziennosc"],
    defaultBgId: "light-beam-prayer",
    slug: "1-tesaloniczan-5-16-18"
  },
  // Ochrona i Schronienie
  {
    id: "ps-91-1-2",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 91,
    verse: "1-2",
    reference: "Psalm 91:1-2",
    text: "Kto mieszka pod os\u0142on\u0105 Najwy\u017Cszego, ten w cieniu Wszechmocnego przebywa. M\xF3wi\u0119 do Pana: Ucieczko moja i twierdzo moja, Bo\u017Ce m\xF3j, kt\xF3remu ufam!",
    translation: "Biblia Warszawska",
    category: "ochrona",
    tags: ["psalm 91", "ochrona", "oslona", "cien", "twierdza", "ucieczka", "bezpieczenstwo", "strach"],
    defaultBgId: "mountains-strength",
    slug: "psalm-91-1-2"
  },
  {
    id: "ps-121-1-2",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 121,
    verse: "1-2",
    reference: "Psalm 121:1-2",
    text: "Wznosz\u0119 swe oczy ku g\xF3rom: Sk\u0105d\u017Ce nadejdzie mi pomoc? Pomoc moja jest od Pana, kt\xF3ry stworzy\u0142 niebo i ziemi\u0119.",
    translation: "Biblia Warszawska",
    category: "ochrona",
    tags: ["pomoc", "gory", "stworca", "niebo", "ziemia", "ochrona", "straznik"],
    defaultBgId: "mountains-strength",
    slug: "psalm-121-1-2"
  },
  {
    id: "prz-18-10",
    book: "Ksi\u0119ga Przys\u0142\xF3w",
    bookShort: "Prz",
    chapter: 18,
    verse: "10",
    reference: "Przypowie\u015Bci 18:10",
    text: "Imi\u0119 Pana jest wie\u017C\u0105 obronn\u0105; sprawiedliwy chroni si\u0119 do niej i jest bezpieczny.",
    translation: "Biblia Warszawska",
    category: "ochrona",
    tags: ["wieza", "obrona", "imie pana", "bezpieczenstwo", "ochrona", "sprawiedliwy"],
    defaultBgId: "mountains-strength",
    slug: "przypowiesci-18-10"
  },
  // Strach / Lęk / Pokonanie obaw
  {
    id: "ps-27-1",
    book: "Ksi\u0119ga Psalm\xF3w",
    bookShort: "Ps",
    chapter: 27,
    verse: "1",
    reference: "Psalm 27:1",
    text: "Pan \u015Bwiat\u0142o\u015Bci\u0105 moj\u0105 i zbawieniem moim: Kog\xF3\u017C ba\u0107 si\u0119 b\u0119d\u0119? Pan obron\u0105 \u017Cycia mego: Przed kim mam dr\u017Ce\u0107?",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["strach", "lek", "swiatlosc", "obrona", "odwaga", "pokonanie leku", "dzisiaj potrzebuj\u0119 si\u0142y"],
    defaultBgId: "sunrise-hope",
    slug: "psalm-27-1"
  },
  {
    id: "2tym-1-7",
    book: "2 List do Tymoteusza",
    bookShort: "2Tm",
    chapter: 1,
    verse: "7",
    reference: "2 Tymoteusza 1:7",
    text: "Albowiem nie da\u0142 nam B\xF3g ducha boja\u017Ani, lecz mocy i mi\u0142o\u015Bci, i pow\u015Bci\u0105gliwo\u015Bci.",
    translation: "Biblia Warszawska",
    category: "sila",
    tags: ["strach", "bojazn", "lek", "moc", "milosc", "trzezwosc", "odwaga"],
    defaultBgId: "mountains-strength",
    slug: "2-tymoteusza-1-7"
  },
  // Troski, Praca i Zaopatrzenie
  {
    id: "mt-6-33",
    book: "Ewangelia wg \u015Bw. Mateusza",
    bookShort: "Mt",
    chapter: 6,
    verse: "33",
    reference: "Mateusz 6:33",
    text: "Szukajcie najpierw Kr\xF3lestwa Bo\u017Cego i sprawiedliwo\u015Bci Jego, a wszystko to b\u0119dzie wam dodane.",
    translation: "Biblia Warszawska",
    category: "zaufanie",
    tags: ["krolestwo boze", "troski", "jedzenie", "odziez", "finanse", "zaopatrzenie", "priorytety"],
    defaultBgId: "pathway-light-way",
    slug: "mateusz-6-33"
  },
  {
    id: "1pt-5-7",
    book: "1 List \u015Bw. Piotra",
    bookShort: "1Pt",
    chapter: 5,
    verse: "7",
    reference: "1 Piotra 5:7",
    text: "Wszelk\u0105 trosk\u0119 swoj\u0105 z\u0142\xF3\u017Ccie na Niego, gdy\u017C On ma o was staranie.",
    translation: "Biblia Warszawska",
    category: "pokoj",
    tags: ["troska", "stres", "problemy", "opieka", "staranie", "b\xF3g dba", "jest mi ciezko"],
    defaultBgId: "calm-lake-peace",
    slug: "1-piotra-5-7"
  },
  // Zmartwychwstanie i Śmierć
  {
    id: "1kor-15-55-57",
    book: "1 List do Koryntian",
    bookShort: "1Kor",
    chapter: 15,
    verse: "55-57",
    reference: "1 Koryntian 15:55-57",
    text: "Gdzie\u017C jest, o \u015Bmierci, zwyci\u0119stwo twoje? Gdzie\u017C jest, o \u015Bmierci, \u017C\u0105d\u0142o twoje? Lecz Bogu niech b\u0119d\u0105 dzi\u0119ki, kt\xF3ry nam daje zwyci\u0119stwo przez Pana naszego Jezusa Chrystusa.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["smierc", "zmartwychwstanie", "zwyciestwo", "jezus chrystus", "nadzieja", "wiecznosc", "co biblia mowi o smierci"],
    defaultBgId: "light-beam-prayer",
    slug: "1-koryntian-15-55-57"
  },
  {
    id: "j-11-25-26",
    book: "Ewangelia wg \u015Bw. Jana",
    bookShort: "J",
    chapter: 11,
    verse: "25-26",
    reference: "Jan 11:25-26",
    text: "Rzek\u0142 jej Jezus: Ja jestem zmartwychwstanie i \u017Cywot; kto we Mnie wierzy, cho\u0107by i umar\u0142, \u017Cy\u0107 b\u0119dzie. A ka\u017Cdy, kto \u017Cyje i wierzy we Mnie, nie umrze na wieki.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["zmartwychwstanie", "zycie wieczne", "smierc", "wiara", "jezus", "nadzieja"],
    defaultBgId: "light-beam-prayer",
    slug: "jan-11-25-26"
  },
  {
    id: "rz-6-23",
    book: "List do Rzymian",
    bookShort: "Rz",
    chapter: 6,
    verse: "23",
    reference: "Rzymian 6:23",
    text: "Albowiem zap\u0142at\u0105 za grzech jest \u015Bmier\u0107, lecz darem \u0142aski Bo\u017Cej jest \u017Cywot wieczny w Chrystusie Jezusie, Panu naszym.",
    translation: "Biblia Warszawska",
    category: "zbawienie",
    tags: ["dar", "laska", "zywot wieczny", "chrystus", "grzech", "zbawienie"],
    defaultBgId: "desert-light-salvation",
    slug: "rzymian-6-23"
  },
  // Samotność i Obecność Boga
  {
    id: "mt-28-20",
    book: "Ewangelia wg \u015Bw. Mateusza",
    bookShort: "Mt",
    chapter: 28,
    verse: "20",
    reference: "Mateusz 28:20",
    text: "A oto Ja jestem z wami po wszystkie dni a\u017C do sko\u0144czenia \u015Bwiata.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["samotnosc", "obecnosc", "jezus", "wiernosc", "zawsze ze mna", "otucha"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "mateusz-28-20"
  },
  {
    id: "hbr-13-5",
    book: "List do Hebrajczyk\xF3w",
    bookShort: "Hbr",
    chapter: 13,
    verse: "5",
    reference: "Hebrajczyk\xF3w 13:5",
    text: "Sam bowiem powiedzia\u0142: Nie porzuc\u0119 ci\u0119 ani ci\u0119 nie opuszcz\u0119.",
    translation: "Biblia Warszawska",
    category: "pocieszenie",
    tags: ["samotnosc", "opuszczenie", "obietnica", "wiernosc", "b\xF3g", "nie porzuce"],
    defaultBgId: "clouds-breakthrough-comfort",
    slug: "hebrajczykow-13-5"
  },
  // Małżeństwo i Rodzina
  {
    id: "ef-5-25",
    book: "List do Efezjan",
    bookShort: "Ef",
    chapter: 5,
    verse: "25",
    reference: "Efezjan 5:25",
    text: "M\u0119\u017Cowie, mi\u0142ujcie \u017Cony swoje, jak i Chrystus umi\u0142owa\u0142 Ko\u015Bci\xF3\u0142 i wyda\u0142 za\u0144 samego siebie.",
    translation: "Biblia Warszawska",
    category: "milosc",
    tags: ["malzenstwo", "rodzina", "maz", "zona", "milosc", "ofiarnosc", "chrystus"],
    defaultBgId: "golden-warmth-love",
    slug: "efezjan-5-25"
  },
  {
    id: "kol-3-13-14",
    book: "List do Kolosan",
    bookShort: "Kol",
    chapter: 3,
    verse: "13-14",
    reference: "Kolosan 3:13-14",
    text: "Zno\u015Bcie jedni drugich i przebaczajcie sobie nawzajem, je\u015Bli kto ma pow\xF3d do skargi przeciw drugiemu: jak Pan wam darowa\u0142, tak i wy! A ponad to wszystko przyobleczcie si\u0119 w mi\u0142o\u015B\u0107, kt\xF3ra jest sp\xF3jni\u0105 doskona\u0142o\u015Bci.",
    translation: "Biblia Warszawska",
    category: "przebaczenie",
    tags: ["przebaczenie", "milosc", "spojnia", "rodzina", "relacje", "zgoda"],
    defaultBgId: "golden-warmth-love",
    slug: "kolosan-3-13-14"
  },
  // Modlitwa z wiarą
  {
    id: "mt-6-6",
    book: "Ewangelia wg \u015Bw. Mateusza",
    bookShort: "Mt",
    chapter: 6,
    verse: "6",
    reference: "Mateusz 6:6",
    text: "Ale ty, gdy si\u0119 modlisz, wejd\u017A do swej izdebki, zamknij drzwi i m\xF3dl si\u0119 do Ojca twego, kt\xF3ry jest w ukryciu; a Ojciec tw\xF3j, kt\xF3ry widzi w ukryciu, odp\u0142aci tobie.",
    translation: "Biblia Warszawska",
    category: "modlitwa",
    tags: ["modlitwa", "izdebka", "ojciec", "szczerosc", "intymnosc", "wiara"],
    defaultBgId: "light-beam-prayer",
    slug: "mateusz-6-6"
  },
  {
    id: "jkb-5-16",
    book: "List \u015Bw. Jakuba",
    bookShort: "Jk",
    chapter: 5,
    verse: "16",
    reference: "Jakub 5:16",
    text: "Wyznawajcie grzechy jedni drugim i m\xF3dlcie si\u0119 jedni za drugich, aby\u015Bcie byli uzdrowieni. Wiele mo\u017Ce usilna modlitwa sprawiedliwego.",
    translation: "Biblia Warszawska",
    category: "modlitwa",
    tags: ["modlitwa", "uzdrowienie", "sprawiedliwy", "wstawiennictwo", "moc modlitwy"],
    defaultBgId: "light-beam-prayer",
    slug: "jakub-5-16"
  }
];
function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/Ł/g, "l").trim();
}
function normalizeBiblicalQuery(text) {
  return normalizeText(text).replace(/\b(wersety?|wer|w|rozdzia[lł]y?|rozdz?|r)\b\.?/gi, " ").replace(/[:,\.\-\/]/g, " ").replace(/\s+/g, " ").trim();
}
function searchBibleVerses(query) {
  const q = normalizeText(query);
  if (!q) return [];
  const bibQ = normalizeBiblicalQuery(query);
  const refMatches = [];
  for (const item of BIBLE_VERSES) {
    let score = 0;
    const refNorm = normalizeText(item.reference);
    const bookNorm = normalizeText(item.book);
    const bookShortNorm = normalizeText(item.bookShort);
    const textNorm = normalizeText(item.text);
    const slugNorm = normalizeText(item.slug);
    const refBib = normalizeBiblicalQuery(item.reference);
    const shortBib = normalizeBiblicalQuery(`${item.bookShort} ${item.chapter} ${item.verse}`);
    const fullBib = normalizeBiblicalQuery(`${item.book} ${item.chapter} ${item.verse}`);
    const chapterBib = normalizeBiblicalQuery(`${item.reference.split(":")[0]}`);
    const shortChapterBib = normalizeBiblicalQuery(`${item.bookShort} ${item.chapter}`);
    const refBookBase = normalizeBiblicalQuery(item.reference.split(" ")[0]);
    if (bibQ === refBib || bibQ === shortBib || bibQ === fullBib || refNorm === q || slugNorm === q) {
      score += 250;
    } else if (bibQ.includes(refBib) || refBib.includes(bibQ) || (bibQ.includes(shortBib) || shortBib.includes(bibQ))) {
      score += 180;
    } else if (bibQ.startsWith(refBookBase) && bibQ.includes(String(item.chapter)) && bibQ.includes(String(item.verse))) {
      score += 170;
    } else if (refNorm.includes(q)) {
      score += 60;
    } else if (bibQ === chapterBib || bibQ === shortChapterBib) {
      score += 90;
    } else if (bibQ.includes(chapterBib) || bibQ.includes(shortChapterBib)) {
      score += 70;
    } else if (q.includes(bookNorm) || q.includes(bookShortNorm)) {
      score += 40;
    }
    for (const tag of item.tags) {
      const tagNorm = normalizeText(tag);
      if (tagNorm === q) {
        score += 50;
      } else if (tagNorm.includes(q) || q.includes(tagNorm)) {
        score += 25;
      }
    }
    const catNorm = normalizeText(item.category);
    if (catNorm === q || q.includes(catNorm)) {
      score += 35;
    }
    if (textNorm.includes(q)) {
      score += 20;
    }
    if (q.includes("ciezko") || q.includes("smut") || q.includes("depres") || q.includes("placz") || q.includes("bol")) {
      if (item.category === "pocieszenie" || item.tags.includes("jest mi ciezko")) score += 30;
    }
    if (q.includes("strach") || q.includes("lek") || q.includes("boje") || q.includes("obaw")) {
      if (item.category === "sila" || item.category === "ochrona" || item.tags.includes("strach") || item.tags.includes("lek")) score += 30;
    }
    if (q.includes("malzen") || q.includes("rodzin") || q.includes("zona") || q.includes("maz")) {
      if (item.category === "milosc" || item.tags.includes("malzenstwo")) score += 40;
    }
    if (q.includes("zauf") || q.includes("zawierzen")) {
      if (item.category === "wiara" || item.tags.includes("zaufanie")) score += 35;
    }
    if (score > 0) {
      refMatches.push({ verse: item, score });
    }
  }
  refMatches.sort((a, b) => b.score - a.score);
  return refMatches.map((m) => m.verse);
}

// src/data/topics.ts
var TOPIC_HUBS = [
  {
    slug: "nadzieja",
    name: "Nadzieja",
    h1: "Wersety z Biblii o nadziei \u2014 Bo\u017Ce obietnice na ka\u017Cdy dzie\u0144",
    metaDescription: "Odkryj biblijne wersety o nadziei, kt\xF3re podnosz\u0105 na duchu w trudnych chwilach. Przeczytaj S\u0142owo Bo\u017Ce, poznaj kontekst i tw\xF3rz estetyczne karty werset\xF3w.",
    shortAnswer: "Biblijna nadzieja to nie niepewne \u017Cyczenie, lecz niez\u0142omne zaufanie oparte na wierno\u015Bci Boga i Jego obietnicach (Jr 29:11, Rz 15:13). Pismo \u015Awi\u0119te ukazuje, \u017Ce ci, kt\xF3rzy pok\u0142adaj\u0105 nadziej\u0119 w Panu, zyskuj\u0105 odnowion\u0105 si\u0142\u0119 do pokonywania przeciwno\u015Bci (Iz 40:31).",
    biblicalContext: "W Pi\u015Bmie \u015Awi\u0119tym nadzieja (hebr. tikvah, gr. elpis) jest kotwic\u0105 duszy. Nie zale\u017Cy od okoliczno\u015Bci zewn\u0119trznych, lecz od niezmiennego charakteru Stw\xF3rcy, kt\xF3rego mi\u0142osierdzie jest nowe ka\u017Cdego poranka.",
    verseSlugs: ["jeremiasz-29-11", "rzymian-15-13", "izajasz-40-31", "lamentacje-3-22-23", "hebrajczykow-11-1"],
    relatedTopicSlugs: ["wiara", "pokoj", "sila", "pocieszenie"],
    relatedQuestionSlugs: ["jakie-wersety-mowia-o-nadziei", "jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "milosc",
    name: "Mi\u0142o\u015B\u0107",
    h1: "Co Biblia m\xF3wi o mi\u0142o\u015Bci? Kluczowe wersety i nauczanie",
    metaDescription: "Przeczytaj najpi\u0119kniejsze wersety biblijne o mi\u0142o\u015Bci Boga, ma\u0142\u017Ce\u0144skiej i bli\u017Aniego (1 Kor 13, 1 J 4). Przygotuj kart\u0119 ze S\u0142owem Bo\u017Cym z Christian Culture.",
    shortAnswer: "Biblia definiuje mi\u0142o\u015B\u0107 nie jako przelotne uczucie, lecz jako ofiarn\u0105, bezinteresown\u0105 postaw\u0119 (agape). \u0179r\xF3d\u0142em wszelkiej mi\u0142o\u015Bci jest sam B\xF3g, kt\xF3ry pos\u0142a\u0142 swego Syna (1 J 4:18, J 3:16). Hymn o mi\u0142o\u015Bci (1 Kor 13:4-7) ukazuje mi\u0142o\u015B\u0107 cierpliw\u0105, \u0142askaw\u0105 i wieczn\u0105.",
    biblicalContext: "W uj\u0119ciu biblijnym mi\u0142o\u015B\u0107 jest sp\xF3jni\u0105 doskona\u0142o\u015Bci i najwi\u0119kszym przykazaniem. Doskona\u0142a mi\u0142o\u015B\u0107 Bo\u017Ca usuwa wszelki l\u0119k i daje cz\u0142owiekowi fundament do kochania drugiego cz\u0142owieka w prawdzie.",
    verseSlugs: ["1-koryntian-13-4-7", "1-jana-4-18", "rzymian-8-38-39", "jan-3-16", "kolosan-3-13-14"],
    relatedTopicSlugs: ["rodzina", "malzenstwo", "przebaczenie", "pokoj"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-malzenstwie", "co-biblia-mowi-o-przebaczeniu"]
  },
  {
    slug: "modlitwa",
    name: "Modlitwa",
    h1: "Wersety z Biblii o modlitwie \u2014 jak rozmawia\u0107 z Bogiem z wiar\u0105",
    metaDescription: "Jak modli\u0107 si\u0119 wed\u0142ug Pisma \u015Awi\u0119tego? Przeczytaj wersety biblijne o modlitwie, dzi\u0119kczynieniu i wo\u0142aniu do Boga w potrzebie. M\xF3j Werset Dnia \u2014 Christian Culture.",
    shortAnswer: "Modlitwa w Biblii to szczery, intymny dialog stworzenia ze Stw\xF3rc\u0105. Jezus uczy\u0142 modlitwy w ukryciu przed ludzkim poklaskiem (Mt 6:6) oraz nieustannej ufno\u015Bci w proszeniu, szukaniu i ko\u0142ataniu (Mt 7:7). Pismo zach\u0119ca, by we wszystkim modli\u0107 si\u0119 z dzi\u0119kczynieniem (Flp 4:6-7, 1 Tes 5:16-18).",
    biblicalContext: "Pismo \u015Awi\u0119te nie stawia na wielom\xF3wstwo, lecz na czysto\u015B\u0107 serca. Modlitwa ma moc przemienia\u0107 perspektyw\u0119 cz\u0142owieka, przynosz\u0105c Bo\u017Cy pok\xF3j przewy\u017Cszaj\u0105cy ludzki rozum.",
    verseSlugs: ["mateusz-6-6", "mateusz-7-7", "filipian-4-6-7", "jeremiasz-33-3", "1-tesaloniczan-5-16-18", "jakub-5-16"],
    relatedTopicSlugs: ["wiara", "pokoj", "nadzieja", "sila"],
    relatedQuestionSlugs: ["jak-modlic-sie-wedlug-biblii", "jak-zaufac-bogu", "co-biblia-mowi-o-leku"]
  },
  {
    slug: "rodzina",
    name: "Rodzina",
    h1: "Wersety biblijne o rodzinie \u2014 Bo\u017Cy fundament, szacunek i zgoda",
    metaDescription: "Co Pismo \u015Awi\u0119te m\xF3wi o rodzinie, relacjach i wychowaniu? Odkryj wersety biblijne o wsparciu, mi\u0142o\u015Bci i przebaczeniu w gronie najbli\u017Cszych.",
    shortAnswer: "Biblia ukazuje rodzin\u0119 jako przestrze\u0144 wzajemnej s\u0142u\u017Cby, opieki i przekazywania wiary. S\u0142owo Bo\u017Ce zach\u0119ca domownik\xF3w do wzajemnego przebaczania, cierpliwo\u015Bci oraz \u017Cycia w mi\u0142o\u015Bci, kt\xF3ra jest sp\xF3jni\u0105 doskona\u0142o\u015Bci (Kol 3:13-14, Ef 4:32).",
    biblicalContext: "Stw\xF3rca zaplanowa\u0142 rodzin\u0119 jako bezpieczn\u0105 przysta\u0144 opart\u0105 na przymierzu i bezwarunkowym szacunku. Wzorem relacji jest mi\u0142o\u015B\u0107 Chrystusa do wsp\xF3lnoty wierz\u0105cych.",
    verseSlugs: ["kolosan-3-13-14", "efezjan-5-25", "1-koryntian-13-4-7", "efezjan-4-32", "liczb-6-24-26"],
    relatedTopicSlugs: ["malzenstwo", "milosc", "przebaczenie", "pokoj"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-malzenstwie", "co-biblia-mowi-o-przebaczeniu"]
  },
  {
    slug: "malzenstwo",
    name: "Ma\u0142\u017Ce\u0144stwo",
    h1: "Wersety z Biblii o ma\u0142\u017Ce\u0144stwie \u2014 mi\u0142o\u015B\u0107, wierno\u015B\u0107 i przymierze",
    metaDescription: "Odkryj biblijne wersety o ma\u0142\u017Ce\u0144stwie, wierno\u015Bci i budowaniu trwa\u0142ego zwi\u0105zku. Przeczytaj fragmenty Pisma \u015Awi\u0119tego i stw\xF3rz kart\u0119 wersetu z Christian Culture.",
    shortAnswer: "W uj\u0119ciu biblijnym ma\u0142\u017Ce\u0144stwo to \u015Bwi\u0119te, nierozerwalne przymierze pomi\u0119dzy kobiet\u0105 i m\u0119\u017Cczyzn\u0105 zawarte przed Bogiem. Pismo wzywa do ofiarnej mi\u0142o\u015Bci na wz\xF3r oddania Chrystusa (Ef 5:25) oraz do piel\u0119gnowania cierpliwo\u015Bci, dobroci i przebaczenia ka\u017Cdego dnia (1 Kor 13:4-7).",
    biblicalContext: "Ma\u0142\u017Ce\u0144stwo od pocz\u0105tku stworzenia odzwierciedla g\u0142\u0119bok\u0105 jedno\u015B\u0107 (\xABjedno cia\u0142o\xBB). Wierno\u015B\u0107 i po\u015Bwi\u0119cenie s\u0105 fundamentami, kt\xF3re pozwalaj\u0105 ma\u0142\u017Conkom przetrwa\u0107 ka\u017Cd\u0105 \u017Cyciow\u0105 burz\u0119.",
    verseSlugs: ["efezjan-5-25", "1-koryntian-13-4-7", "kolosan-3-13-14", "1-jana-4-18", "liczb-6-24-26"],
    relatedTopicSlugs: ["rodzina", "milosc", "przebaczenie", "wiara"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-malzenstwie", "co-biblia-mowi-o-przebaczeniu"]
  },
  {
    slug: "przebaczenie",
    name: "Przebaczenie",
    h1: "Co Biblia m\xF3wi o przebaczeniu? Wersety o \u0142asce i wolno\u015Bci serca",
    metaDescription: "Dlaczego warto przebacza\u0107 wed\u0142ug Biblii? Zobacz kluczowe wersety o odpuszczeniu win, \u0142asce Bo\u017Cej i uzdrowieniu relacji. Christian Culture \u2014 polskieradio.cc.",
    shortAnswer: "Biblia uczy, \u017Ce przebaczenie jest decyzj\u0105 woli, a nie emocj\u0105, i stanowi fundament pojednania z Bogiem i lud\u017Ami (Kol 3:13, Ef 4:32). Poniewa\u017C B\xF3g w Chrystusie darowa\u0142 nam wszelkie winy (1 J 1:9, Ps 103:12), my r\xF3wnie\u017C jeste\u015Bmy wezwani do uwalniania serca od urazy i odwetu.",
    biblicalContext: "Przebaczenie w Biblii nie oznacza bagatelizowania z\u0142a, lecz powierzenie sprawiedliwo\u015Bci Bogu. Uwalnia skrzywdzonego z wi\u0119zienia goryczy i otwiera drog\u0119 do pokoju wewn\u0119trznego.",
    verseSlugs: ["kolosan-3-13-14", "efezjan-4-32", "1-jana-1-9", "psalm-103-12", "izajasz-1-18"],
    relatedTopicSlugs: ["milosc", "pokoj", "zbawienie", "pocieszenie"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-przebaczeniu", "jak-zaufac-bogu"]
  },
  {
    slug: "lek",
    name: "L\u0119k i Strach",
    h1: "Wersety z Biblii o l\u0119ku \u2014 jak pokona\u0107 strach S\u0142owem Bo\u017Cym",
    metaDescription: "Co Biblia m\xF3wi o l\u0119ku i niepokoju? Przeczytaj koj\u0105ce wersety z Pisma \u015Awi\u0119tego o Bo\u017Cej obecno\u015Bci, pokoju i odwadze. M\xF3j Werset Dnia \u2014 Christian Culture.",
    shortAnswer: "Pismo \u015Awi\u0119te wielokrotnie przypomina: \xABNie b\xF3j si\u0119!\xBB (ponad 365 razy), wskazuj\u0105c, \u017Ce lekarstwem na l\u0119k nie jest brak zagro\u017Ce\u0144, lecz pewno\u015B\u0107 obecno\u015Bci Boga (Iz 41:10, Ps 23:4). B\xF3g nie da\u0142 nam ducha boja\u017Ani, lecz mocy, mi\u0142o\u015Bci i trze\u017Awego my\u015Blenia (2 Tm 1:7).",
    biblicalContext: "L\u0119k parali\u017Cuje zaufanie, lecz werset biblijny przypomina o Bogu, kt\xF3ry jest ucieczk\u0105 i si\u0142\u0105 w utrapieniach najpewniejsz\u0105 (Ps 46:2). Aposto\u0142 Pawe\u0142 zach\u0119ca, aby ka\u017Cdy niepok\xF3j przekszta\u0142ca\u0107 w modlitw\u0119 (Flp 4:6-7).",
    verseSlugs: ["izajasz-41-10", "2-tymoteusza-1-7", "psalm-27-1", "psalm-23-4", "filipian-4-6-7", "psalm-46-2", "jozue-1-9"],
    relatedTopicSlugs: ["pokoj", "sila", "ochrona", "wiara"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-leku", "jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "samotnosc",
    name: "Samotno\u015B\u0107",
    h1: "Wersety biblijne w samotno\u015Bci \u2014 obietnica Bo\u017Cej blisko\u015Bci",
    metaDescription: "Czujesz si\u0119 samotny lub opuszczony? Zobacz, co Biblia m\xF3wi o Bo\u017Cej wierno\u015Bci i blisko\u015Bci w trudnych chwilach. M\xF3j Werset Dnia \u2014 Christian Culture.",
    shortAnswer: "Biblia jednoznacznie zapewnia, \u017Ce w oczach Boga \u017Caden cz\u0142owiek nie jest zapomniany. Jezus obieca\u0142 swoim uczniom: \xABJa jestem z wami po wszystkie dni a\u017C do sko\u0144czenia \u015Bwiata\xBB (Mt 28:20), a B\xF3g deklaruje: \xABNie porzuc\u0119 ci\u0119 ani ci\u0119 nie opuszcz\u0119\xBB (Hbr 13:5). Bliski jest Pan tym, kt\xF3rych serce jest z\u0142amane (Ps 34:19).",
    biblicalContext: "Nawet wielcy prorocy i sam Chrystus w Ogr\xF3jcu do\u015Bwiadczali samotno\u015Bci. Jednak w samotno\u015Bci B\xF3g objawia si\u0119 jako najczulszy Przyjaciel i Pocieszyciel.",
    verseSlugs: ["mateusz-28-20", "hebrajczykow-13-5", "psalm-34-19", "psalm-23-4", "2-koryntian-1-3-4"],
    relatedTopicSlugs: ["pocieszenie", "pokoj", "nadzieja", "milosc"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-samotnosci", "jaki-werset-przeczytac-gdy-jest-mi-ciezko"]
  },
  {
    slug: "pokoj",
    name: "Pok\xF3j",
    h1: "Wersety z Biblii o pokoju \u2014 wewn\u0119trzny spok\xF3j serca w Bogu",
    metaDescription: "Poznaj wersety biblijne o pokoju Bo\u017Cym, kt\xF3ry przewy\u017Csza wszelki rozum (Flp 4:7, J 14:27). Znajd\u017A ukojenie i stw\xF3rz kart\u0119 ze S\u0142owem Bo\u017Cym z Christian Culture.",
    shortAnswer: "Biblijny pok\xF3j (hebr. shalom) to nie tylko brak wojny, lecz stan pe\u0142ni, harmonii i duchowego bezpiecze\u0144stwa w Bogu. Jezus powiedzia\u0142: \xABPok\xF3j zostawiam wam, M\xF3j pok\xF3j daj\u0119 wam; nie jak \u015Bwiat daje, Ja wam daj\u0119\xBB (J 14:27). Pok\xF3j Bo\u017Cy strze\u017Ce serc i my\u015Bli tych, kt\xF3rzy powierzaj\u0105 swe troski Stw\xF3rcy (Flp 4:6-7).",
    biblicalContext: "\u015Awiat oferuje spok\xF3j zale\u017Cny od pomy\u015Blnych okoliczno\u015Bci; Chrystus oferuje pok\xF3j, kt\xF3ry trwa nawet po\u015Br\xF3d \u017Cyciowej burzy i kryzysu.",
    verseSlugs: ["jan-14-27", "filipian-4-6-7", "kolosan-3-15", "liczb-6-24-26", "1-piotra-5-7"],
    relatedTopicSlugs: ["nadzieja", "wiara", "pocieszenie", "lek"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-leku", "jak-zaufac-bogu", "jakie-wersety-mowia-o-nadziei"]
  },
  {
    slug: "wiara",
    name: "Wiara",
    h1: "Co Biblia m\xF3wi o wierze? Kluczowe wersety o zaufaniu Bogu",
    metaDescription: "Czym jest wiara wed\u0142ug Pisma \u015Awi\u0119tego? Przeczytaj Hebrajczyk\xF3w 11:1, Przypowie\u015Bci 3:5-6, Rzymian 8:28 i odkryj moc zawierzenia S\u0142owu Bo\u017Cemu.",
    shortAnswer: "Biblia definiuje wiar\u0119 jako \xABpewno\u015B\u0107 tego, czego si\u0119 spodziewamy, prze\u015Bwiadczenie o tym, czego nie widzimy\xBB (Hbr 11:1). Prawdziwa wiara to zaufanie Bogu ca\u0142ym sercem bez polegania wy\u0142\u0105cznie na w\u0142asnym, ograniczonym rozumie (Prz 3:5-6), z wiedz\u0105, \u017Ce B\xF3g prowadzi wszystko ku dobremu (Rz 8:28).",
    biblicalContext: "Wiara rodzi si\u0119 ze s\u0142uchania S\u0142owa Bo\u017Cego. Nie jest statycznym pogl\u0105dem, lecz \u017Cyw\u0105 relacj\u0105 i chodzeniem drog\u0105 zaufania krok po kroku.",
    verseSlugs: ["hebrajczykow-11-1", "przypowiesci-3-5-6", "rzymian-8-28", "psalm-37-5", "2-koryntian-5-7"],
    relatedTopicSlugs: ["nadzieja", "pokoj", "modlitwa", "zbawienie"],
    relatedQuestionSlugs: ["jak-zaufac-bogu", "jakie-wersety-mowia-o-nadziei"]
  },
  {
    slug: "zbawienie",
    name: "Zbawienie",
    h1: "Wersety z Biblii o zbawieniu i \u0142asce \u2014 dar \u017Cycia wiecznego",
    metaDescription: "Jak otrzyma\u0107 zbawienie wed\u0142ug Biblii? Zobacz s\u0142ynne wersety: Jan 3:16, Rzymian 10:9, Rzymian 6:23. Przeczytaj i poznaj ewangeli\u0119 Jezusa Chrystusa.",
    shortAnswer: "Zbawienie w Biblii to darmowy dar Bo\u017Cej \u0142aski dost\u0119pny przez wiar\u0119 w Jezusa Chrystusa, a nie z naszych uczynk\xF3w (J 3:16, Rz 6:23). Pismo uczy: \xABje\u015Bli ustami swoimi wyznasz, \u017Ce Jezus jest Panem, i uwierzysz w sercu swoim, \u017Ce B\xF3g wzbudzi\u0142 Go z martwych, zbawiony b\u0119dziesz\xBB (Rz 10:9).",
    biblicalContext: "Zbawienie rozwi\u0105zuje fundamentalny problem ludzkiego oddzielenia od Boga przez grzech, przywracaj\u0105c synostwo Bo\u017Ce i daruj\u0105c \u017Cycie wieczne.",
    verseSlugs: ["jan-3-16", "jan-14-6", "rzymian-10-9", "rzymian-6-23", "1-koryntian-15-55-57"],
    relatedTopicSlugs: ["jezus", "wiara", "zmartwychwstanie", "nadzieja"],
    relatedQuestionSlugs: ["gdzie-jezus-mowi-o-zbawieniu", "co-biblia-mowi-o-smierci"]
  },
  {
    slug: "jezus",
    name: "Jezus Chrystus",
    h1: "Kim jest Jezus wed\u0142ug Biblii? Kluczowe wersety i s\u0142owa Chrystusa",
    metaDescription: "Przeczytaj s\u0142owa Jezusa z Ewangelii: Jan 14:6, Jan 3:16, Mateusz 11:28. Poznaj Chrystusa jako Drog\u0119, Prawd\u0119 i \u017Bycie z Christian Culture.",
    shortAnswer: "Biblia objawia Jezusa Chrystusa jako jednorodzonego Syna Bo\u017Cego, Zbawiciela \u015Bwiata oraz uciele\u015Bnienie Bo\u017Cej mi\u0142o\u015Bci i prawdy. Sam Jezus powiedzia\u0142: \xABJa jestem droga i prawda, i \u017Cywot; nikt nie przychodzi do Ojca, tylko przeze Mnie\xBB (J 14:6). Zaprasza wszystkich utrudzonych, obiecuj\u0105c ukojenie (Mt 11:28).",
    biblicalContext: "Wszystkie ksi\u0119gi Pisma \u015Awi\u0119tego skupiaj\u0105 si\u0119 na osobie i dziele Chrystusa. Jego \u017Cycie, ofiara na krzy\u017Cu i zmartwychwstanie s\u0105 centrum chrze\u015Bcija\u0144skiej wiary.",
    verseSlugs: ["jan-14-6", "jan-3-16", "mateusz-11-28", "jan-11-25-26", "mateusz-28-20", "filipian-4-13"],
    relatedTopicSlugs: ["zbawienie", "zmartwychwstanie", "milosc", "wiara"],
    relatedQuestionSlugs: ["gdzie-jezus-mowi-o-zbawieniu", "co-biblia-mowi-o-smierci"]
  },
  {
    slug: "smierc",
    name: "\u015Amier\u0107",
    h1: "Co Biblia m\xF3wi o \u015Bmierci? Wersety daj\u0105ce nadziej\u0119 w obliczu ko\u0144ca",
    metaDescription: "Co dzieje si\u0119 po \u015Bmierci wed\u0142ug Pisma \u015Awi\u0119tego? Przeczytaj wersety daj\u0105ce chrze\u015Bcija\u0144sk\u0105 nadziej\u0119 i pocieszenie w \u017Ca\u0142obie. Christian Culture \u2014 polskieradio.cc.",
    shortAnswer: "Biblia naucza, \u017Ce \u015Bmier\u0107 fizyczna nie jest ko\u0144cem istnienia, lecz przej\u015Bciem do wieczno\u015Bci. Dzi\u0119ki zmartwychwstaniu Chrystusa \u015Bmier\u0107 zosta\u0142a pokonana i utraci\u0142a swoje ostateczne \u017C\u0105d\u0142o (1 Kor 15:55-57). B\xF3g obiecuje, \u017Ce w Jego Kr\xF3lestwie otrze wszelk\u0105 \u0142z\u0119 i \u015Bmierci ju\u017C nie b\u0119dzie (Obj 21:4).",
    biblicalContext: "Chrze\u015Bcijanin nie smuci si\u0119 jak ci, kt\xF3rzy nie maj\u0105 nadziei. \u015Amier\u0107 jest snem w oczekiwaniu na chwalebne zmartwychwstanie w Chrystusie.",
    verseSlugs: ["1-koryntian-15-55-57", "jan-11-25-26", "objawienie-21-4", "rzymian-6-23", "rzymian-8-38-39"],
    relatedTopicSlugs: ["zmartwychwstanie", "zbawienie", "pocieszenie", "nadzieja"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-smierci", "gdzie-jezus-mowi-o-zbawieniu", "jaki-werset-przeczytac-gdy-jest-mi-ciezko"]
  },
  {
    slug: "zmartwychwstanie",
    name: "Zmartwychwstanie",
    h1: "Wersety z Biblii o zmartwychwstaniu \u2014 zwyci\u0119stwo nad \u015Bmierci\u0105",
    metaDescription: "Zmartwychwstanie Jezusa i obietnica nowego \u017Cycia. Zobacz kluczowe wersety biblijne (J 11:25, 1 Kor 15) i stw\xF3rz kart\u0119 wersetu w M\xF3j Werset Dnia.",
    shortAnswer: "Zmartwychwstanie Jezusa Chrystusa jest fundamentem ca\u0142ej chrze\u015Bcija\u0144skiej wiary. Jezus og\u0142osi\u0142: \xABJa jestem zmartwychwstanie i \u017Cywot; kto we Mnie wierzy, cho\u0107by i umar\u0142, \u017Cy\u0107 b\u0119dzie\xBB (J 11:25-26). Przez zmartwychwstanie B\xF3g gwarantuje wierz\u0105cym triumf nad grobem i nowe, nie\u015Bmiertelne \u017Cycie (1 Kor 15:55-57).",
    biblicalContext: "Gdyby Chrystus nie zmartwychwsta\u0142, pr\xF3\u017Cna by\u0142aby nasza wiara (1 Kor 15:14). Zmartwychwstanie to historyczny fakt i r\u0119kojmia wiecznej chwa\u0142y.",
    verseSlugs: ["jan-11-25-26", "1-koryntian-15-55-57", "rzymian-10-9", "objawienie-21-4"],
    relatedTopicSlugs: ["smierc", "jezus", "zbawienie", "nadzieja"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-smierci", "gdzie-jezus-mowi-o-zbawieniu"]
  },
  {
    slug: "sila",
    name: "Si\u0142a i Odwaga",
    h1: "Wersety biblijne o sile \u2014 Bo\u017Ca moc w ludzkiej s\u0142abo\u015Bci",
    metaDescription: "Brakuje Ci si\u0142? Przeczytaj wersety biblijne o Bo\u017Cej mocy i odwadze (Flp 4:13, Iz 40:31, Joz 1:9). Odkryj si\u0142\u0119 ze S\u0142owa Bo\u017Cego w Christian Culture.",
    shortAnswer: "Pismo \u015Awi\u0119te uczy, \u017Ce prawdziwa duchowa i psychiczna si\u0142a nie p\u0142ynie z ludzkiej pychy, lecz z oparcia si\u0119 na Bogu (Flp 4:13). B\xF3g zapewnia, \u017Ce Jego moc doskonali si\u0119 w naszej s\u0142abo\u015Bci (2 Kor 12:9), a ci, kt\xF3rzy ufaj\u0105 Panu, wzbijaj\u0105 si\u0119 na skrzyd\u0142ach jak or\u0142y (Iz 40:31).",
    biblicalContext: "Gdy cz\u0142owiek dochodzi do kresu w\u0142asnych mo\u017Cliwo\u015Bci, otwiera si\u0119 przestrze\u0144 dla \u0142aski Bo\u017Cej, kt\xF3ra podtrzymuje prawic\u0105 sprawiedliwo\u015Bci.",
    verseSlugs: ["filipian-4-13", "izajasz-40-31", "jozue-1-9", "izajasz-41-10", "2-koryntian-12-9", "psalm-46-2"],
    relatedTopicSlugs: ["nadzieja", "wiara", "pokoj", "lek"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "pocieszenie",
    name: "Pocieszenie i Ukojenie",
    h1: "Wersety z Biblii daj\u0105ce pocieszenie w cierpieniu i smutku",
    metaDescription: "Szukasz ukojenia w \u017Ca\u0142obie, smutku lub depresji? Zobacz koj\u0105ce wersety z Pisma \u015Awi\u0119tego o Bogu wszelkiej pociechy. M\xF3j Werset Dnia \u2014 Christian Culture.",
    shortAnswer: "Biblia nazywa Boga \xABOjcem mi\u0142osierdzia i Bogiem wszelkiej pociechy, kt\xF3ry nas pociesza w ka\u017Cdym ucisku naszym\xBB (2 Kor 1:3-4). Jezus zaprasza wszystkich zm\u0119czonych i obci\u0105\u017Conych, oferuj\u0105c im prawdziwe ukojenie (Mt 11:28). Bliski jest Pan tym, kt\xF3rych serce jest z\u0142amane (Ps 34:19).",
    biblicalContext: "Cierpienie nie jest dowodem opuszczenia przez Boga. Wr\u0119cz przeciwnie, w b\xF3lu Bo\u017Ca obecno\u015B\u0107 staje si\u0119 najbli\u017Csza i najbardziej czu\u0142a.",
    verseSlugs: ["mateusz-11-28", "psalm-34-19", "2-koryntian-1-3-4", "objawienie-21-4", "psalm-23-4"],
    relatedTopicSlugs: ["samotnosc", "nadzieja", "pokoj", "smierc"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "co-biblia-mowi-o-smierci"]
  },
  {
    slug: "psalm23",
    name: "Psalm 23",
    h1: "Psalm 23 \u2014 Pan jest pasterzem moim. Komentarz i wersety",
    metaDescription: "Przeczytaj ca\u0142y Psalm 23 i jego najs\u0142ynniejsze wersety (\xABPan jest pasterzem moim\xBB, \xABciemn\u0105 dolin\u0105\xBB). Przygotuj w\u0142asn\u0105 kart\u0119 z wersetem w Christian Culture.",
    shortAnswer: "Psalm 23 to jeden z najukocha\u0144szych fragment\xF3w Biblii, w kt\xF3rym kr\xF3l Dawid wyznaje bezgraniczne zaufanie do Boga jako Dobrego Pasterza. Niezale\u017Cnie od ciemnych dolin \u017Cyciowych, Bo\u017Ca obecno\u015B\u0107, laska i kij przynosz\u0105 niezachwiane pocieszenie i bezpiecze\u0144stwo.",
    biblicalContext: "Metafora pasterza w staro\u017Cytnym Izraelu oznacza\u0142a bezustann\u0105, troskliw\u0105 opiek\u0119, obron\u0119 przed drapie\u017Cnikami i prowadzenie na bezpieczne pastwiska.",
    verseSlugs: ["psalm-23-1", "psalm-23-4"],
    relatedTopicSlugs: ["pokoj", "ochrona", "zaufanie", "pocieszenie"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu", "co-biblia-mowi-o-leku"]
  }
];

// src/data/questions.ts
var BIBLE_QUESTIONS = [
  {
    slug: "co-biblia-mowi-o-leku",
    question: "Co Biblia m\xF3wi o l\u0119ku?",
    metaDescription: "Co Biblia m\xF3wi o l\u0119ku i strachu? Kr\xF3tka odpowied\u017A, biblijne dowody (Iz 41:10, Flp 4:6-7, Ps 23:4) i kontekst duchowy od Christian Culture.",
    shortAnswer: "Biblia w ponad 365 miejscach wzywa \xABNie b\xF3j si\u0119!\xBB, przypominaj\u0105c, \u017Ce \u017Ar\xF3d\u0142em odwagi nie jest brak trudno\u015Bci, lecz nieustanna obecno\u015B\u0107 Boga (Ps 23:4, Iz 41:10). Pismo uczy, \u017Ce B\xF3g nie da\u0142 nam ducha boja\u017Ani, lecz mocy, mi\u0142o\u015Bci i pow\u015Bci\u0105gliwo\u015Bci (2 Tm 1:7), a w sytuacji niepokoju zach\u0119ca, by ka\u017Cdy l\u0119k przekszta\u0142ca\u0107 w modlitw\u0119 z dzi\u0119kczynieniem (Flp 4:6-7).",
    biblicalEvidenceSummary: "B\xF3g zapewnia o swojej obecno\u015Bci w ciemnej dolinie (Ps 23:4), wzmacnia nas prawic\u0105 swej sprawiedliwo\u015Bci (Iz 41:10) i obdarza pokojem przewy\u017Cszaj\u0105cym ludzki rozum (Flp 4:7).",
    keyVerseSlugs: ["izajasz-41-10", "filipian-4-6-7", "psalm-23-4", "2-tymoteusza-1-7", "psalm-27-1", "psalm-46-2"],
    biblicalContext: "W Pi\u015Bmie \u015Awi\u0119tym l\u0119k jest naturaln\u0105 ludzk\u0105 reakcj\u0105 na krucho\u015B\u0107 i niebezpiecze\u0144stwo. Jednak biblijna odpowied\u017A nie polega na t\u0142umieniu emocji, lecz na przeniesieniu wzroku z problemu na wszechmocnego Stw\xF3rc\u0119, kt\xF3ry czuwa nad cz\u0142owiekiem.",
    relatedTopicSlugs: ["lek", "pokoj", "sila", "ochrona"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "co-biblia-mowi-o-smierci",
    question: "Co Biblia m\xF3wi o \u015Bmierci?",
    metaDescription: "Co dzieje si\u0119 po \u015Bmierci wed\u0142ug Pisma \u015Awi\u0119tego? Przeczytaj kr\xF3tk\u0105 odpowied\u017A, wersety o zmartwychwstaniu (J 11:25, 1 Kor 15:55) i chrze\u015Bcija\u0144sk\u0105 nadziej\u0119.",
    shortAnswer: "Biblia naucza, \u017Ce \u015Bmier\u0107 fizyczna nie jest ko\u0144cem ludzkiego istnienia, lecz przej\u015Bciem. Dzi\u0119ki zmartwychwstaniu Jezusa Chrystusa \u015Bmier\u0107 utraci\u0142a swoje ostateczne \u017C\u0105d\u0142o i w\u0142adz\u0119 (1 Kor 15:55-57). Ka\u017Cdy, kto \u017Cyje i wierzy w Chrystusa, ma obietnic\u0119 \u017Cycia wiecznego i zmartwychwstania w chwale (J 11:25-26, Obj 21:4).",
    biblicalEvidenceSummary: "Jezus og\u0142osi\u0142: \xABJa jestem zmartwychwstanie i \u017Cywot; kto we Mnie wierzy, cho\u0107by i umar\u0142, \u017Cy\u0107 b\u0119dzie\xBB (J 11:25). Zap\u0142at\u0105 za grzech jest \u015Bmier\u0107, lecz darem Boga jest \u017Cycie wieczne (Rz 6:23).",
    keyVerseSlugs: ["1-koryntian-15-55-57", "jan-11-25-26", "objawienie-21-4", "rzymian-6-23", "rzymian-8-38-39"],
    biblicalContext: "Dla chrze\u015Bcijanina \u015Bmier\u0107 nie jest losem beznadziejnym. Aposto\u0142 Pawe\u0142 pisze, \u017Ce nic \u2013 nawet \u015Bmier\u0107 \u2013 nie mo\u017Ce od\u0142\u0105czy\u0107 nas od mi\u0142o\u015Bci Bo\u017Cej objawionej w Chrystusie Jezusie.",
    relatedTopicSlugs: ["smierc", "zmartwychwstanie", "zbawienie", "nadzieja"],
    relatedQuestionSlugs: ["gdzie-jezus-mowi-o-zbawieniu", "jakie-wersety-mowia-o-nadziei"]
  },
  {
    slug: "jakie-wersety-mowia-o-nadziei",
    question: "Jakie wersety m\xF3wi\u0105 o nadziei?",
    metaDescription: "Jakie wersety z Biblii m\xF3wi\u0105 o nadziei? Poznaj najwa\u017Cniejsze wersety: Jr 29:11, Rz 15:13, Iz 40:31, Lm 3:22. Kr\xF3tka odpowied\u017A i kontekst w M\xF3j Werset Dnia.",
    shortAnswer: "Kluczowe wersety biblijne o nadziei to m.in. Jeremiasz 29:11 (\xABmy\u015Bli o pokoju, a nie o niedoli, aby da\u0107 wam przysz\u0142o\u015B\u0107 i nadziej\u0119\xBB), Rzymian 15:13 (\xABB\xF3g nadziei niech was nape\u0142ni wszelk\u0105 rado\u015Bci\u0105 i pokojem w wierze\xBB), Izajasz 40:31 (\xABci, co ufaj\u0105 Panu, nabieraj\u0105 nowej si\u0142y\xBB) oraz Lamentacje 3:22-23 (\xAB\u0142aski Pana nowe s\u0105 ka\u017Cdego poranka\xBB).",
    biblicalEvidenceSummary: "Pismo \u015Awi\u0119te przedstawia Bo\u017C\u0105 nadziej\u0119 jako niewzruszon\u0105 kotwic\u0119 duszy, kt\xF3ra nie zawodzi, bo mi\u0142o\u015B\u0107 Bo\u017Ca rozlana jest w naszych sercach.",
    keyVerseSlugs: ["jeremiasz-29-11", "rzymian-15-13", "izajasz-40-31", "lamentacje-3-22-23", "hebrajczykow-11-1"],
    biblicalContext: "Podczas gdy ludzkie plany mog\u0105 zawie\u015B\u0107, Bo\u017Ce obietnice trwaj\u0105 na wieki. Czytanie i rozwa\u017Canie werset\xF3w o nadziei pomaga odzyska\u0107 pok\xF3j i motywacj\u0119 do dzia\u0142ania.",
    relatedTopicSlugs: ["nadzieja", "wiara", "pokoj", "sila"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "co-biblia-mowi-o-przebaczeniu",
    question: "Co Biblia m\xF3wi o przebaczeniu?",
    metaDescription: "Co Biblia m\xF3wi o przebaczeniu win i krzywd? Dowiedz si\u0119, dlaczego warto przebacza\u0107 i jak uwolni\u0107 serce z urazy. Christian Culture \u2014 polskieradio.cc.",
    shortAnswer: "Biblia ukazuje przebaczenie jako fundamentalny warunek wolno\u015Bci serca i relacji z Bogiem. Poniewa\u017C B\xF3g w Chrystusie darowa\u0142 nam wszystkie nasze grzechy (1 J 1:9, Ps 103:12), my r\xF3wnie\u017C jeste\u015Bmy wezwani, by przebacza\u0107 naszym winowajcom bez ogranicze\u0144 (Kol 3:13, Ef 4:32). Przebaczenie uwalnia cz\u0142owieka od trucizny z\u0142o\u015Bci i nienawi\u015Bci.",
    biblicalEvidenceSummary: "\xABB\u0105d\u017Acie jedni dla drugich uprzejmi, serdeczni, odpuszczaj\u0105c sobie nawzajem, jak i wam B\xF3g odpu\u015Bci\u0142 w Chrystusie\xBB (Ef 4:32). Jak daleko jest wsch\xF3d od zachodu, tak oddala B\xF3g nasze wyst\u0119pki (Ps 103:12).",
    keyVerseSlugs: ["kolosan-3-13-14", "efezjan-4-32", "1-jana-1-9", "psalm-103-12", "izajasz-1-18"],
    biblicalContext: "Przebaczenie nie oznacza aprobaty dla niesprawiedliwo\u015Bci, lecz rezygnacj\u0119 z osobistej zemsty. Otwiera przestrze\u0144 dla Bo\u017Cego uzdrowienia i pokoju w rodzinach oraz relacjach mi\u0119dzyludzkich.",
    relatedTopicSlugs: ["przebaczenie", "milosc", "rodzina", "pokoj"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-malzenstwie", "jak-modlic-sie-wedlug-biblii"]
  },
  {
    slug: "jak-zaufac-bogu",
    question: "Jak zaufa\u0107 Bogu w trudnej sytuacji?",
    metaDescription: "Jak zaufa\u0107 Bogu, gdy wszystko idzie \u017Ale? Praktyczna i biblijna odpowied\u017A oparta na Prz 3:5-6, Rz 8:28, Ps 37:5. M\xF3j Werset Dnia \u2014 Christian Culture.",
    shortAnswer: "Zaufa\u0107 Bogu wed\u0142ug Pisma \u015Awi\u0119tego oznacza oprze\u0107 si\u0119 na Jego wierno\u015Bci i m\u0105dro\u015Bci zamiast na w\u0142asnym, ograniczonym rozumie (Prz 3:5-6). Praktyczne zaufanie polega na powierzeniu Bogu swoich dr\xF3g w codziennej modlitwie (Ps 37:5) oraz piel\u0119gnowaniu przekonania, \u017Ce On wsp\xF3\u0142dzia\u0142a we wszystkim ku dobremu dla tych, kt\xF3rzy Go mi\u0142uj\u0105 (Rz 8:28).",
    biblicalEvidenceSummary: "\xABZaufaj Panu z ca\u0142ego swojego serca i nie polegaj na w\u0142asnym rozumie! Pami\u0119taj o Nim na wszystkich swoich drogach, a On prostowa\u0107 b\u0119dzie twoje \u015Bcie\u017Cki\xBB (Prz 3:5-6).",
    keyVerseSlugs: ["przypowiesci-3-5-6", "rzymian-8-28", "psalm-37-5", "hebrajczykow-11-1", "filipian-4-6-7"],
    biblicalContext: "Zawierzenie Bogu w kryzysie to proces, kt\xF3ry dojrzewa w sercu. B\xF3g nie zawsze natychmiast zmienia okoliczno\u015Bci, lecz zawsze daje si\u0142\u0119 i pok\xF3j, by przej\u015B\u0107 przez trudno\u015Bci.",
    relatedTopicSlugs: ["wiara", "nadzieja", "pokoj", "sila"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "co-biblia-mowi-o-leku"]
  },
  {
    slug: "co-biblia-mowi-o-malzenstwie",
    question: "Co Biblia m\xF3wi o ma\u0142\u017Ce\u0144stwie?",
    metaDescription: "Co Pismo \u015Awi\u0119te m\xF3wi o ma\u0142\u017Ce\u0144stwie i mi\u0142o\u015Bci ma\u0142\u017Ce\u0144skiej? Odkryj wersety o przymierzu, jedno\u015Bci i wzajemnym oddaniu (Ef 5:25, 1 Kor 13). Christian Culture.",
    shortAnswer: "Biblia definiuje ma\u0142\u017Ce\u0144stwo jako \u015Bwi\u0119te przymierze mi\u0142o\u015Bci, wierno\u015Bci i wzajemnego oddania kobiety i m\u0119\u017Cczyzny. M\u0105\u017C i \u017Cona staj\u0105 si\u0119 \xABjednym cia\u0142em\xBB. Nowy Testament wzywa m\u0119\u017Ca do ofiarnej mi\u0142o\u015Bci na wz\xF3r Chrystusa (Ef 5:25), a oboje ma\u0142\u017Conk\xF3w do przebaczania, cierpliwo\u015Bci i piel\u0119gnowania mi\u0142o\u015Bci, kt\xF3ra jest sp\xF3jni\u0105 doskona\u0142o\u015Bci (1 Kor 13:4-7, Kol 3:13-14).",
    biblicalEvidenceSummary: "\xABM\u0119\u017Cowie, mi\u0142ujcie \u017Cony swoje, jak i Chrystus umi\u0142owa\u0142 Ko\u015Bci\xF3\u0142\xBB (Ef 5:25). Mi\u0142o\u015B\u0107 cierpliwa jest, \u0142askawa, nie zazdro\u015Bci i nigdy nie ustaje (1 Kor 13:4-7).",
    keyVerseSlugs: ["efezjan-5-25", "1-koryntian-13-4-7", "kolosan-3-13-14", "1-jana-4-18", "liczb-6-24-26"],
    biblicalContext: "Biblijna wizja ma\u0142\u017Ce\u0144stwa ukazuje je jako odblask przymierza Boga ze Swoim ludem. Fundamentem trwa\u0142ego zwi\u0105zku jest nieprzemijaj\u0105ca \u0142aska i przebaczenie.",
    relatedTopicSlugs: ["malzenstwo", "rodzina", "milosc", "przebaczenie"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-przebaczeniu"]
  },
  {
    slug: "gdzie-jezus-mowi-o-zbawieniu",
    question: "Gdzie Jezus m\xF3wi o zbawieniu?",
    metaDescription: "Gdzie w Ewangeliach Jezus naucza o zbawieniu i \u017Cyciu wiecznym? Poznaj najwa\u017Cniejsze wersety: Jan 3:16, Jan 14:6, Mateusz 11:28.",
    shortAnswer: "Jezus wielokrotnie i jednoznacznie naucza o zbawieniu w Ewangeliach. Najbardziej znanym fragmentem jest Jan 3:16 (\xABAlbowiem tak B\xF3g umi\u0142owa\u0142 \u015Bwiat, \u017Ce Syna swego jednorodzonego da\u0142...\xBB). W Jan 14:6 Jezus o\u015Bwiadcza: \xABJa jestem droga i prawda, i \u017Cywot; nikt nie przychodzi do Ojca, tylko przeze Mnie\xBB. Wzywa tak\u017Ce utrudzonych: \xABP\xF3jd\u017Acie do Mnie wszyscy, a Ja wam dam ukojenie\xBB (Mt 11:28).",
    biblicalEvidenceSummary: "Zbawienie jest darem z \u0142aski przez wiar\u0119 w Chrystusa (J 3:16, Rz 10:9). Jezus przyszed\u0142 szuka\u0107 i zbawi\u0107 to, co zgin\u0119\u0142o.",
    keyVerseSlugs: ["jan-3-16", "jan-14-6", "mateusz-11-28", "rzymian-10-9", "rzymian-6-23"],
    biblicalContext: "Zbawienie w nauczaniu Jezusa jest darmowym darem Bo\u017Cej mi\u0142o\u015Bci, kt\xF3ry cz\u0142owiek przyjmuje przez osobist\u0105 wiar\u0119 i nawr\xF3cenie serca ku Bogu.",
    relatedTopicSlugs: ["zbawienie", "jezus", "zmartwychwstanie", "wiara"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-smierci", "jakie-wersety-mowia-o-nadziei"]
  },
  {
    slug: "jaki-werset-przeczytac-gdy-jest-mi-ciezko",
    question: "Jaki werset przeczyta\u0107, gdy jest mi ci\u0119\u017Cko?",
    metaDescription: "Prze\u017Cywasz trudny dzie\u0144 lub kryzys? Przeczytaj koj\u0105ce wersety z Biblii: Psalm 23:4, Mateusz 11:28, Izajasz 40:31, 2 Koryntian 12:9.",
    shortAnswer: "Gdy prze\u017Cywasz trudny czas, b\xF3l lub kryzys si\u0142, si\u0119gnij po Psalm 23:4 (\xABCho\u0107bym nawet szed\u0142 ciemn\u0105 dolin\u0105, z\u0142a si\u0119 nie ul\u0119kn\u0119, bo\u015B Ty ze mn\u0105\xBB), s\u0142owa Jezusa z Mateusza 11:28 (\xABP\xF3jd\u017Acie do Mnie wszyscy, kt\xF3rzy spracowani i obci\u0105\u017Ceni jeste\u015Bcie\xBB), obietnic\u0119 z Izajasza 40:31 (\xABci, co ufaj\u0105 Panu, nabieraj\u0105 nowej si\u0142y\xBB) oraz 2 Koryntian 12:9 (\xABDosy\u0107 masz na \u0142asce mojej, moc moja doskonali si\u0119 w s\u0142abo\u015Bci\xBB).",
    biblicalEvidenceSummary: "\xABBliski jest Pan tym, kt\xF3rych serce jest z\u0142amane\xBB (Ps 34:19). B\xF3g jest ucieczk\u0105 i pomoc\u0105 w utrapieniach najpewniejsz\u0105 (Ps 46:2).",
    keyVerseSlugs: ["psalm-23-4", "mateusz-11-28", "izajasz-40-31", "2-koryntian-12-9", "psalm-34-19", "psalm-46-2"],
    biblicalContext: "Biblia nie unika tematu cierpienia. Ksi\u0119gi Hioba, Psalmy i listy apostolskie pokazuj\u0105, \u017Ce trudno\u015Bci s\u0105 miejscem, w kt\xF3rym cz\u0142owiek odkrywa g\u0142\u0119bi\u0119 Bo\u017Cej opieki i wierno\u015Bci.",
    relatedTopicSlugs: ["pocieszenie", "sila", "pokoj", "psalm23"],
    relatedQuestionSlugs: ["co-biblia-mowi-o-leku", "jak-zaufac-bogu", "co-biblia-mowi-o-samotnosci"]
  },
  {
    slug: "co-biblia-mowi-o-samotnosci",
    question: "Co Biblia m\xF3wi o samotno\u015Bci?",
    metaDescription: "Czujesz si\u0119 samotny i zapomniany? Zobacz, co Pismo \u015Awi\u0119te m\xF3wi o wierno\u015Bci Boga, obecno\u015Bci Jezusa i uzdrowieniu serca (Mt 28:20, Hbr 13:5, Ps 34:19).",
    shortAnswer: "Pismo \u015Awi\u0119te zapewnia, \u017Ce w oczach Stw\xF3rcy nikt nie jest anonimowy ani opuszczony. Jezus z\u0142o\u017Cy\u0142 niezmienn\u0105 obietnic\u0119: \xABA oto Ja jestem z wami po wszystkie dni a\u017C do sko\u0144czenia \u015Bwiata\xBB (Mt 28:20). Sam B\xF3g przysi\u0119ga w Hebrajczyk\xF3w 13:5: \xABNie porzuc\u0119 ci\u0119 ani ci\u0119 nie opuszcz\u0119\xBB. B\xF3g jest najbli\u017Cej w\u0142a\u015Bnie wtedy, gdy cz\u0142owiek czuje si\u0119 opuszczony przez \u015Bwiat (Ps 34:19).",
    biblicalEvidenceSummary: "Obietnice obecno\u015Bci Boga w samotno\u015Bci: Mt 28:20, Hbr 13:5, Ps 34:19, Ps 23:4, 2 Kor 1:3-4.",
    keyVerseSlugs: ["mateusz-28-20", "hebrajczykow-13-5", "psalm-34-19", "psalm-23-4", "2-koryntian-1-3-4"],
    biblicalContext: "Samotno\u015B\u0107 mo\u017Ce sta\u0107 si\u0119 \u015Bwi\u0119tym miejscem spotkania z Bogiem. Pismo zach\u0119ca, by w pustce serca wo\u0142a\u0107 do Niego, znajduj\u0105c wiecznego i niezawodnego Przyjaciela.",
    relatedTopicSlugs: ["samotnosc", "pocieszenie", "pokoj", "milosc"],
    relatedQuestionSlugs: ["jaki-werset-przeczytac-gdy-jest-mi-ciezko", "jak-zaufac-bogu"]
  },
  {
    slug: "jak-modlic-sie-wedlug-biblii",
    question: "Jak modli\u0107 si\u0119 wed\u0142ug Biblii?",
    metaDescription: "Jak w\u0142a\u015Bciwie si\u0119 modli\u0107 wed\u0142ug Pisma \u015Awi\u0119tego? Wskaz\xF3wki Jezusa (Mt 6:6, Mt 7:7), modlitwa z wiar\u0105 i dzi\u0119kczynieniem. Christian Culture \u2014 polskieradio.cc.",
    shortAnswer: "Jezus uczy modlitwy prostej, intymnej i wolnej od ob\u0142udy: \xABwejd\u017A do swej izdebki, zamknij drzwi i m\xF3dl si\u0119 do Ojca twego, kt\xF3ry jest w ukryciu\xBB (Mt 6:6). Biblia zach\u0119ca do wytrwa\u0142o\u015Bci: pro\u015Bcie, szukajcie, ko\u0142aczcie (Mt 7:7) oraz do nieustannej modlitwy z dzi\u0119kczynieniem w ka\u017Cdym \u017Cyciowym po\u0142o\u017Ceniu (1 Tes 5:16-18, Flp 4:6-7).",
    biblicalEvidenceSummary: "\xABO nic si\u0119 nie martwcie, ale we wszystkim w modlitwie i b\u0142aganiu z dzi\u0119kczynieniem powierzajcie pro\u015Bby wasze Bogu\xBB (Flp 4:6-7).",
    keyVerseSlugs: ["mateusz-6-6", "mateusz-7-7", "filipian-4-6-7", "jeremiasz-33-3", "1-tesaloniczan-5-16-18", "jakub-5-16"],
    biblicalContext: "Modlitwa nie s\u0142u\u017Cy przekonywaniu Boga do naszych zachcianek, lecz dostrajaniu ludzkiego serca do Jego \u015Bwi\u0119tej i doskona\u0142ej woli.",
    relatedTopicSlugs: ["modlitwa", "wiara", "pokoj", "nadzieja"],
    relatedQuestionSlugs: ["jak-zaufac-bogu", "co-biblia-mowi-o-leku"]
  }
];

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var geminiClient = null;
function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "moj-werset-dnia", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  const swPath = import_path.default.join(process.cwd(), "public", "sw.js");
  res.sendFile(swPath);
});
app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(`User-agent: *
Allow: /

Sitemap: https://polskieradio.cc/sitemap.xml
`);
});
app.get("/sitemap.xml", (req, res) => {
  const baseUrl = "https://polskieradio.cc";
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  for (const topic of TOPIC_HUBS) {
    xml += `
  <url>
    <loc>${baseUrl}/wersety/${topic.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }
  for (const q of BIBLE_QUESTIONS) {
    xml += `
  <url>
    <loc>${baseUrl}/pytanie/${q.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  for (const verse of BIBLE_VERSES) {
    xml += `
  <url>
    <loc>${baseUrl}/werset/${verse.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
  xml += `
</urlset>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});
app.post("/api/semantic-verse", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Brak zapytania" });
      return;
    }
    const trimmed = query.trim();
    const localMatches = searchBibleVerses(trimmed);
    if (localMatches.length > 0) {
      res.json({
        verse: localMatches[0],
        allMatches: localMatches.slice(0, 5),
        source: "local_database"
      });
      return;
    }
    const ai = getGeminiClient();
    if (ai) {
      const verseCatalog = BIBLE_VERSES.map((v) => ({
        id: v.id,
        reference: v.reference,
        category: v.category,
        tags: v.tags.slice(0, 5).join(", "),
        summary: v.text.slice(0, 90) + "..."
      }));
      const prompt = `Jeste\u015B asystentem biblijnym w portalu Christian Culture.
U\u017Cytkownik zada\u0142 pytanie \u017Cyciowe, duchowe lub emocjonalne: "${trimmed}".

Twoim zadaniem jest wybra\u0107 NAJBARDZIEJ ADEKWATNY identyfikator wersetu z poni\u017Cszej listy autentycznych werset\xF3w Pisma \u015Awi\u0119tego.
BEZWZGL\u0118DNA ZASADA: Nie wolno Ci generowa\u0107 fikcyjnych cytat\xF3w biblijnych. Wybierz wy\u0142\u0105cznie ID z podanej listy.

LISTA DOST\u0118PNYCH WERSET\xD3W:
${JSON.stringify(verseCatalog)}

Zwr\xF3\u0107 TYLKO czysty obiekt JSON bez znacznik\xF3w markdown:
{"verseId": "identyfikator-z-listy", "reason": "jedno zdanie dlaczego ten werset odpowiada na potrzeb\u0119"}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const responseText = response.text?.trim() || "";
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(cleanJson);
        const matched = BIBLE_VERSES.find((v) => v.id === parsed.verseId);
        if (matched) {
          res.json({
            verse: matched,
            source: "gemini_semantic",
            explanation: parsed.reason
          });
          return;
        }
      } catch (parseErr) {
        console.warn("Failed to parse Gemini semantic JSON, falling back", parseErr);
      }
    }
    const fallback = BIBLE_VERSES[0];
    res.json({
      verse: fallback,
      source: "fallback"
    });
  } catch (err) {
    console.error("Semantic verse error:", err);
    res.status(500).json({ error: "B\u0142\u0105d wyszukiwania semantycznego", fallback: BIBLE_VERSES[0] });
  }
});
app.post("/api/lumina/save-verse", (req, res) => {
  const { verseId, userToken } = req.body;
  if (!verseId) {
    res.status(400).json({ error: "Wymagane ID wersetu" });
    return;
  }
  res.json({
    success: true,
    message: "Werset zosta\u0142 zapisany w profilu LUMINA",
    verseId,
    timestamp: Date.now()
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`M\xF3j Werset Dnia server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
