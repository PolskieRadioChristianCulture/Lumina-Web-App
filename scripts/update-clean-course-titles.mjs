import fs from 'node:fs';
import path from 'node:path';

const courseJsPath = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/src/course.js';
const content = fs.readFileSync(courseJsPath, 'utf8');

const match = content.match(/export const modules = (\[[\s\S]*?\]);\s*export const STORAGE_KEY/);
if (!match) {
  console.error('Could not extract modules from course.js');
  process.exit(1);
}

const modules = JSON.parse(match[1]);

const cleanTitles = [
  { title: 'Twoja Dolina Terebintu', subtitle: 'Diagnoza przedstartowa' },
  { title: 'Świadomość', subtitle: 'Od deformacji do reformacji' },
  { title: 'Wiara i zaufanie', subtitle: 'Życie w systemie DZIŚ' },
  { title: 'Modlitwa i post', subtitle: 'Reset bodźców i dialog serca' },
  { title: 'Słowo Boże', subtitle: 'Przebudowa tożsamości' },
  { title: 'Wytrwałość', subtitle: 'Uświęcenie charakteru' },
  { title: 'Zapobieganie', subtitle: 'Okulary Jezusa' },
  { title: 'Miłość i Boża troska', subtitle: 'Styl życia Agape' },
  { title: 'Nagroda', subtitle: 'Perspektywa Wieczności' },
  { title: 'Odporność w kryzysie', subtitle: 'Karta Kontrolna Zwycięzcy' }
];

modules.forEach((m, idx) => {
  m.title = cleanTitles[idx].title;
  m.subtitle = cleanTitles[idx].subtitle;
});

const updatedContent = `// Źródło: „Pokonać Goliata. Jak zwyciężać własne słabości” (Cezary Rogowski, wydanie 2026)
// Pełna autorska integracja: 10 etapów (moduł wstępny + 8 kroków z książki + moduł mistrzowski)
export const modules = ${JSON.stringify(modules, null, 2)};

export const STORAGE_KEY = 'cc-pokonac-goliata-premium-v1';
export const LEGACY_STORAGE_KEY = 'cc_pokonac_goliata_worksheet_v1';
export const BACKUP_STORAGE_KEY = 'cc_pokonac_goliata_worksheet_v1_backup';
`;

fs.writeFileSync(courseJsPath, updatedContent, 'utf8');
console.log('Successfully updated course.js directly with refined clean titles!');
