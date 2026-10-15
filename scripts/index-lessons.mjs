import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'data/cc-search-index.json');
const catalogPath = path.join(ROOT, 'szukaj/catalog.json');
const luminaMirrorPath = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data\\cc-search-index.json';
const luminaCatalogMirror = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\szukaj\\catalog.json';

const rawData = fs.readFileSync(indexPath, 'utf8');
const data = JSON.parse(rawData);

// 1. Lekcje Kursu Codziennego "Z Biblią za Pan Brat"
const dailyLessons = [
  {
    title: "Z Biblią za Pan Brat — Dzień 15 (Lekcja 15 na dziś): Bóg Dotrzymuje Obietnicy (Narodziny Izaaka, Rdz 20–21)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-15",
    description: "Kurs Codzienny Pisma Świętego — Dzień 15 (Lekcja 15 na dziś, 15 października 2026). Gdy ludzkie możliwości się kończą, Boża wierność pozostaje — Rdz 20:1–21:34. Narodziny Izaaka, przymierze z Abrahamem i triumf Bożej obietnicy.",
    tags: [
      "lekcja 15", "lekcja 15 na dziś", "lekcja na dziś", "dzień 15", "dzien 15",
      "rozważanie 15", "rozważanie na dziś", "słowo na dziś", "narodziny izaaka",
      "rdz 20", "rdz 21", "obietnica boża", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "15 października 2026", "dzisiaj", "dziś"
    ],
    featured: true
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 14 (Lekcja 14): Boża Sprawiedliwość i Ocalenie (Rdz 18–19)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-14",
    description: "Kurs Codzienny Pisma Świętego — Dzień 14 (Lekcja 14). Sąd nad Sodomą, wstawiennictwo Abrahama i Boże miłosierdzie nad sprawiedliwym Lotem — Rdz 18–19.",
    tags: [
      "lekcja 14", "dzień 14", "dzien 14", "rozważanie 14", "słowo na dziś",
      "sodoma", "abraham", "wstawiennictwo", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 3 (Lekcja 3): Protoewangelia — Pierwsza Obietnica Zbawiciela (Rdz 3:15)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-03",
    description: "Kurs Codzienny Pisma Świętego — Dzień 3 (Lekcja 3). Upadek pierwszych ludzi i natychmiastowa odpowiedź Bożej miłości — Protoewangelia w Rdz 3:15: zapowiedź zwycięstwa Potomka Niewiasty nad wężem.",
    tags: [
      "lekcja 3", "dzień 3", "dzien 3", "rozważanie 3", "protoewangelia",
      "rdz 3:15", "obietnica zbawiciela", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  }
];

// 2. Fundamentalny Kurs Biblijny 28 Kroków (Lekcje 1–28 z katalogu kursy/)
const fundamentalLessons = [
  { num: 1, title: "Lekcja 1: Pismo Święte — Źródło Prawdy i Boże Objawienie", file: "01-pismo-swiete.html", tags: ["lekcja 1", "pismo święte", "natchnienie biblii"] },
  { num: 2, title: "Lekcja 2: Trójca — Jedność i Wieczna Wspólnota Boga", file: "02-trojca.html", tags: ["lekcja 2", "trójca", "bóg w trzech osobach"] },
  { num: 3, title: "Lekcja 3: Bóg Ojciec — Suwerenny Stwórca i Miłujący Ojciec", file: "03-bog-ojciec.html", tags: ["lekcja 3", "bóg ojciec", "miłość ojca"] },
  { num: 4, title: "Lekcja 4: Bóg Syn — Wcielenie, Bóstwo i Zbawiciel Świata", file: "04-bog-syn.html", tags: ["lekcja 4", "jezus chrystus", "bóg syn"] },
  { num: 5, title: "Lekcja 5: Bóg Duch Święty — Pocieszyciel, Nauczyciel i Moc Przemiany", file: "05-bog-duch-swiety.html", tags: ["lekcja 5", "duch święty", "pocieszyciel"] },
  { num: 6, title: "Lekcja 6: Stworzenie — Geneza Wszechświata i Godność Człowieka", file: "06-stworzenie.html", tags: ["lekcja 6", "stworzenie", "geneza"] },
  { num: 7, title: "Lekcja 7: Natura Ludzka — Obraz Boga, Upadek i Potrzeba Zbawienia", file: "07-natura-ludzka.html", tags: ["lekcja 7", "natura ludzka", "obraz boży"] },
  { num: 8, title: "Lekcja 8: Wielki Bój — Kosmiczny Konflikt między Dobrem a Złem", file: "08-wielki-boj.html", tags: ["lekcja 8", "wielki bój", "kosmiczny konflikt"] },
  { num: 9, title: "Lekcja 9: Życie, Śmierć i Zmartwychwstanie Chrystusa — Serce Ewangelii", file: "09-zycie-smierc-i-zmartwychwstanie-chrystusa.html", tags: ["lekcja 9", "krzyż", "zmartwychwstanie jezusa"] },
  { num: 10, title: "Lekcja 10: Doświadczenie Zbawienia — Łaska, Wiara i Nowe Narodzenie", file: "10-doswiadczenie-zbawienia.html", tags: ["lekcja 10", "zbawienie z łaski", "nowe narodzenie"] },
  { num: 11, title: "Lekcja 11: Wzrastanie w Chrystusie — Zwycięstwo nad Ciemnością i Uświęcenie", file: "11-wzrastanie-w-chrystusie.html", tags: ["lekcja 11", "wzrastanie w wierze", "uświęcenie"] },
  { num: 12, title: "Lekcja 12: Kościół Boży — Ciało Chrystusa i Wspólnota Wiary", file: "12-kosciol-bozy.html", tags: ["lekcja 12", "kościół boży", "wspólnota"] },
  { num: 13, title: "Lekcja 13: Ostatek i Jego Misja — Wierność w Dniach Ostatnich", file: "13-ostatek-i-jego-misja.html", tags: ["lekcja 13", "ostatek", "misja na dni ostatnie"] },
  { num: 14, title: "Lekcja 14: Jedność Ciała Chrystusa — Miłość Ponad Podziałami", file: "14-jednosc-ciala-chrystusa.html", tags: ["lekcja 14", "jedność", "ciało chrystusa"] },
  { num: 15, title: "Lekcja 15: Chrzest Święty — Przymierze z Chrystusem, Śmierć dla Grzechu i Nowe Życie", file: "15-chrzest.html", tags: ["lekcja 15", "chrzest", "chrzest święty", "zanurzenie", "przymierze", "nowe życie", "28 kroków", "akademia"] },
  { num: 16, title: "Lekcja 16: Wieczerza Pańska — Pamiątka Ofiary, Obmycie Nóg i Społeczność", file: "16-wieczerza-panska.html", tags: ["lekcja 16", "wieczerza pańska", "komunia", "obmycie nóg"] },
  { num: 17, title: "Lekcja 17: Dary i Posługi Duchowe — Wyposażenie do Służby Bliźnim", file: "17-dary-i-poslugi-duchowe.html", tags: ["lekcja 17", "dary duchowe", "służba"] },
  { num: 18, title: "Lekcja 18: Dar Proroctwa — Świadectwo Jezusa w Historii Kościoła", file: "18-dar-proroctwa.html", tags: ["lekcja 18", "proroctwo", "świadectwo jezusa"] },
  { num: 19, title: "Lekcja 19: Prawo Boże — Niezmienny Dekalog i Wyraz Bożej Miłości", file: "19-prawo-boze.html", tags: ["lekcja 19", "prawo boże", "dekalog", "10 przykazań"] },
  { num: 20, title: "Lekcja 20: Szabat — Dzień Odpoczynku, Pamiątka Stworzenia i Znak Przymierza", file: "20-szabat.html", tags: ["lekcja 20", "szabat", "dzień odpoczynku", "sobota"] },
  { num: 21, title: "Lekcja 21: Szafarstwo — Wierność w Zarządzaniu Czasem, Ciałem i Dobrami", file: "21-szafarstwo.html", tags: ["lekcja 21", "szafarstwo", "zarządzanie dobrami", "dziesięcina"] },
  { num: 22, title: "Lekcja 22: Chrześcijańskie Zachowanie — Czystość Serca, Ubiór i Styl Życia", file: "22-chrzescijanskie-zachowanie.html", tags: ["lekcja 22", "styl życia", "czystość serca"] },
  { num: 23, title: "Lekcja 23: Małżeństwo i Rodzina — Boży Wzór Przymierza i Wychowania", file: "23-malzenstwo-i-rodzina.html", tags: ["lekcja 23", "małżeństwo", "rodzina", "świętość przymierza"] },
  { num: 24, title: "Lekcja 24: Służba Chrystusa w Niebiańskiej Świątyni — Arykapłan i Orędownik", file: "24-sluzba-chrystusa-w-niebianskiej-swiatyni.html", tags: ["lekcja 24", "świątynia niebiańska", "arcykapłan", "orędownik"] },
  { num: 25, title: "Lekcja 25: Powtórne Przyjście Chrystusa — Błogosławiona Nadzieja Chrześcijan", file: "25-powtorne-przyjscie-chrystusa.html", tags: ["lekcja 25", "paruzja", "powtórne przyjście", "nadzieja"] },
  { num: 26, title: "Lekcja 26: Śmierć i Zmartwychwstanie — Stan Umarłych i Zwycięstwo Życia", file: "26-smierc-i-zmartwychwstanie.html", tags: ["lekcja 26", "śmierć", "stan umarłych", "zmartwychwstanie"] },
  { num: 27, title: "Lekcja 27: Tysiąclecie i Koniec Grzechu — Sąd Ostateczny i Nowy Początek", file: "27-tysiaclecie-i-koniec-grzechu.html", tags: ["lekcja 27", "millennium", "tysiąclecie", "sąd ostateczny"] },
  { num: 28, title: "Lekcja 28: Nowa Ziemia — Wieczność w Obecności Boga i Brak Cierpienia", file: "28-nowa-ziemia.html", tags: ["lekcja 28", "nowa ziemia", "nowe jeruzalem", "wieczność"] }
].map(item => ({
  title: `Kurs 28 Kroków — ${item.title}`,
  category: "Biblia i formacja",
  url: `https://polskieradio.cc/kursy/${item.file}`,
  description: `Fundamentalne studium biblijne Akademii Christian Culture — ${item.title}. Analiza wersetów, kody Stronga, pytania sprawdzające i zastosowanie w życiu wiary.`,
  tags: [...item.tags, "28 kroków", "kurs biblijny", "akademia biblijna", "lekcje biblijne", "nauka pisma"],
  featured: item.num === 15 || item.num === 1 || item.num === 20
}));

const allNewItems = [...dailyLessons, ...fundamentalLessons];
const newUrls = new Set(allNewItems.map(i => i.url.toLowerCase()));

// Usuń stare duplikaty wg URL jeśli istniały
data.items = data.items.filter(item => !newUrls.has((item.url || '').toLowerCase()));

// Wstaw nowe lekcje na początek sekcji edukacyjnej (po cclite)
data.items.splice(12, 0, ...allNewItems);

data.totalItems = data.items.length;
data.updatedAt = new Date().toISOString();

const formattedJson = JSON.stringify(data, null, 2);

fs.writeFileSync(indexPath, formattedJson, 'utf8');
console.log(`Updated ${indexPath} (totalItems: ${data.totalItems})`);

fs.writeFileSync(catalogPath, formattedJson, 'utf8');
console.log(`Updated ${catalogPath}`);

if (fs.existsSync(path.dirname(luminaMirrorPath))) {
  fs.writeFileSync(luminaMirrorPath, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaMirrorPath}`);
}
if (fs.existsSync(path.dirname(luminaCatalogMirror))) {
  fs.writeFileSync(luminaCatalogMirror, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaCatalogMirror}`);
}
