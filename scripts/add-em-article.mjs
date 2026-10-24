import fs from 'fs';
import path from 'path';

const root = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const txtPath = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/upload_20261024/Kim_jestem_gdy_nikt_nie_patrzy.txt';

const rawTxt = fs.readFileSync(txtPath, 'utf8');

// Parse paragraphs
const lines = rawTxt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const contentParagraphs = [];
for (let i = 3; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('Cezary Rogowski') || line.startsWith('Christian Culture |') || line.startsWith('polskieradio.cc') || line.startsWith('Podstawa biblijna:')) {
    continue;
  }
  contentParagraphs.push(line);
}

console.log('Parsed paragraphs count:', contentParagraphs.length);

// Read articles.ts
const articlesTsPath = path.join(root, 'portals/ccn-news/src/data/articles.ts');
let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');

// Prepare new Article object
const newArticle = {
  id: "art-kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie",
  title: "Kim jestem, gdy nikt nie patrzy? Uczciwość i sumienie według Biblii",
  slug: "kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie",
  excerpt: "Kim jesteś, gdy nikt nie patrzy? Mocny chrześcijański rachunek sumienia o uczciwości, charakterze, prawdzie i łasce autorstwa Cezarego Rogowskiego w ramach eM — Motywacja Christian Culture.",
  content: contentParagraphs,
  scriptureReference: {
    verse: "1 Sm 16,7",
    text: "Pan bowiem nie patrzy na to, na co patrzy człowiek, bo człowiek patrzy na to, co jest przed oczyma, ale Pan patrzy na serce."
  },
  category: "wiara",
  categoryLabel: "Motywacja / Etyka chrześcijańska",
  author: "AUTHORS.cezary",
  publishedAt: "2026-10-24T12:00:00Z",
  dateFormatted: "24 października 2026",
  imageUrl: "/images/news/art-kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie.jpg",
  imageCaption: "Christian Culture / ilustracja wygenerowana.",
  readTimeMinutes: 7,
  isHero: true,
  isPopular: true,
  popularRank: 1,
  tags: [
    "eM",
    "motywacja",
    "mcc",
    "cezary rogowski",
    "uczciwość",
    "sumienie",
    "etyka chrześcijańska",
    "biblia",
    "charakter",
    "prawda",
    "łaska",
    "rozliczenie"
  ],
  primaryPortalUrl: "https://polskieradio.cc/eM",
  primaryPortalLabel: "eM • Motywacja Christian Culture",
  resourceLinks: [
    { label: "Portal eM Motywacja CC", url: "https://polskieradio.cc/eM" },
    { label: "Program Pokonać Goliata", url: "https://polskieradio.cc/pokonac-goliata" }
  ],
  biblicalCommentary: {
    thesis: "Prawdziwy charakter człowieka ujawnia się w wyborach podejmowanych w samotności, gdy nie ma świadków ani nagród.",
    verses: [
      { ref: "1 Sm 16,7", text: "Pan patrzy na serce." },
      { ref: "Łk 16,10", text: "Kto jest wierny w bardzo małym, ten i w wielkim jest wierny." },
      { ref: "Ps 139,23-24", text: "Zbadaj mnie, Boże, i poznaj moje serce." }
    ],
    explanation: "Chrześcijaństwo bez wewnętrznej uczciwości staje się faryzejską dekoracją. Bóg wzywa nas do integralności życia i sumienia poddanego prawdzie."
  }
};

let articleCode = JSON.stringify(newArticle, null, 2);
articleCode = articleCode.replace('"author": "AUTHORS.cezary"', '"author": AUTHORS.cezary');

const breakingNewsItem = '  "NOWY ARTYKUŁ eM (@MCC): Kim jestem, gdy nikt nie patrzy? Uczciwość i sumienie według Biblii — mocny rachunek sumienia Cezarego Rogowskiego (https://polskieradio.cc/eM)",\r\n';

const breakingMatch = articlesTs.match(/export const BREAKING_NEWS:\s*string\[\]\s*=\s*\[\r?\n/);
if (!breakingMatch) throw new Error('BREAKING_NEWS pattern not found');
const breakingIdx = breakingMatch.index + breakingMatch[0].length;
articlesTs = articlesTs.slice(0, breakingIdx) + breakingNewsItem + articlesTs.slice(breakingIdx);

const articlesMatch = articlesTs.match(/export const INITIAL_ARTICLES:\s*Article\[\]\s*=\s*\[\r?\n/);
if (!articlesMatch) throw new Error('INITIAL_ARTICLES pattern not found');
const articlesIdx = articlesMatch.index + articlesMatch[0].length;
articlesTs = articlesTs.slice(0, articlesIdx) + '  ' + articleCode + ',\r\n' + articlesTs.slice(articlesIdx);

fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
console.log('Successfully injected into articles.ts!');
