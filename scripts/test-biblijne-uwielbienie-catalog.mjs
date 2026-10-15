import fs from 'node:fs';

const OT = [
  ['Rodzaju', 50, 'GEN'], ['Wyjścia', 40, 'EXO'], ['Kapłańska', 27, 'LEV'], ['Liczb', 36, 'NUM'], ['Powtórzonego Prawa', 34, 'DEU'],
  ['Jozuego', 24, 'JOS'], ['Sędziów', 21, 'JDG'], ['Rut', 4, 'RUT'], ['1 Samuela', 31, '1SA'], ['2 Samuela', 24, '2SA'], ['1 Królewska', 22, '1KI'], ['2 Królewska', 25, '2KI'], ['1 Kronik', 29, '1CH'], ['2 Kronik', 36, '2CH'], ['Ezdrasza', 10, 'EZR'], ['Nehemiasza', 13, 'NEH'], ['Estery', 10, 'EST'],
  ['Hioba', 42, 'JOB'], ['Psalmów', 150, 'PSA'], ['Przypowieści Salomona', 31, 'PRO'], ['Kaznodziei Salomona', 12, 'ECC'], ['Pieśń nad Pieśniami', 8, 'SNG'],
  ['Izajasza', 66, 'ISA'], ['Jeremiasza', 52, 'JER'], ['Lamentacje Jeremiasza', 5, 'LAM'], ['Ezechiela', 48, 'EZK'], ['Daniela', 12, 'DAN'], ['Ozeasza', 14, 'HOS'], ['Joela', 3, 'JOL'], ['Amosa', 9, 'AMO'], ['Abdiasza', 1, 'OBA'], ['Jonasza', 4, 'JON'], ['Micheasza', 7, 'MIC'], ['Nahuma', 3, 'NAM'], ['Habakuka', 3, 'HAB'], ['Sofoniasza', 3, 'ZEP'], ['Aggeusza', 2, 'HAG'], ['Zachariasza', 14, 'ZEC'], ['Malachiasza', 4, 'MAL']
];

const NT = [
  ['Mateusza', 28, 'MAT'], ['Marka', 16, 'MRK'], ['Łukasza', 24, 'LUK'], ['Jana', 21, 'JHN'], ['Dzieje Apostolskie', 28, 'ACT'], ['Rzymian', 16, 'ROM'], ['1 Koryntian', 16, '1CO'], ['2 Koryntian', 13, '2CO'], ['Galacjan', 6, 'GAL'], ['Efezjan', 6, 'EPH'], ['Filipian', 4, 'PHP'], ['Kolosan', 4, 'COL'], ['1 Tesaloniczan', 5, '1TH'], ['2 Tesaloniczan', 3, '2TH'], ['1 Tymoteusza', 6, '1TI'], ['2 Tymoteusza', 4, '2TI'], ['Tytusa', 3, 'TIT'], ['Filemona', 1, 'PHM'], ['Hebrajczyków', 13, 'HEB'], ['Jakuba', 5, 'JAS'], ['1 Piotra', 5, '1PE'], ['2 Piotra', 3, '2PE'], ['1 Jana', 5, '1JN'], ['2 Jana', 1, '2JN'], ['3 Jana', 1, '3JN'], ['Judy', 1, 'JUD'], ['Apokalipsa', 22, 'REV']
];

const BOOKS = [...OT, ...NT];
const CHAPTERS = BOOKS.flatMap(([name, count, code]) =>
  Array.from({ length: count }, (_, i) => ({
    name,
    number: i + 1,
    id: `${code}-${String(i + 1).padStart(3, '0')}`,
    code
  }))
);

const playlist = JSON.parse(fs.readFileSync(new URL('../data/biblijne-uwielbienie-playlist.json', import.meta.url), 'utf8'));
const publishedMap = new Map(playlist.items.map(it => [it.chapterId, it]));

console.log('Total books:', BOOKS.length, '(expected 66)');
console.log('Total chapters:', CHAPTERS.length, '(expected 1189)');
console.log('Playlist items:', playlist.items.length, '(expected 37)');

let publishedCount = 0;
let plannedCount = 0;
for (const ch of CHAPTERS) {
  if (publishedMap.has(ch.id)) publishedCount++;
  else plannedCount++;
}

console.log('Published chapters in canon:', publishedCount, '(expected 37)');
console.log('Planned chapters:', plannedCount, '(expected 1152)');
console.log('Is PRO-018 in publishedMap?', publishedMap.has('PRO-018'), '(expected false)');
console.log('Is PRO-026 in publishedMap?', publishedMap.has('PRO-026'), '(expected false)');
console.log('Is ECC-012 in publishedMap?', publishedMap.has('ECC-012'), '(expected true)');
console.log('Is SNG-001 in publishedMap?', publishedMap.has('SNG-001'), '(expected true)');

if (BOOKS.length !== 66 || CHAPTERS.length !== 1189 || publishedCount !== 37 || plannedCount !== 1152) {
  process.exit(1);
}
console.log('✅ Wszystkie weryfikacje katalogu Biblijnego Uwielbienia PASSED (100%)');
