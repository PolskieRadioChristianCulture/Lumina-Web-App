import fs from 'node:fs';
import path from 'node:path';

const zipSrcDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/src';
const currentHtml = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html', 'utf8');
const match = currentHtml.match(/const MODULES = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not extract MODULES');
  process.exit(1);
}

const modulesData = JSON.parse(match[1]);

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

const moduleIds = ['start', 'awareness', 'faith', 'prayer', 'scripture', 'perseverance', 'prevention', 'love', 'reward', 'master'];

const richModules = modulesData.map((m, idx) => {
  return {
    id: moduleIds[idx],
    tag: m.badge,
    title: cleanTitles[idx].title,
    subtitle: cleanTitles[idx].subtitle,
    verse: m.scripture,
    duration: 15 + (idx % 3) * 5,
    motto: m.motto,
    bible: m.theology,
    psychology: m.psychology,
    practice: m.questions.map((q, i) => `${i + 1}. ${q.label}`).join('\n\n'),
    prayer: m.declaration,
    prompt: m.questions[0]?.label || 'Twoje osobiste refleksje i decyzje...',
    questions: m.questions,
    quiz: m.quiz
  };
});

const courseJsContent = `// Źródło: „Pokonać Goliata. Jak zwyciężać własne słabości” (Cezary Rogowski, wydanie 2026)
// Pełna autorska integracja: 10 etapów (moduł wstępny + 8 kroków z książki + moduł mistrzowski)
export const modules = ${JSON.stringify(richModules, null, 2)};

export const STORAGE_KEY = 'cc-pokonac-goliata-premium-v1';
export const LEGACY_STORAGE_KEY = 'cc_pokonac_goliata_worksheet_v1';
export const BACKUP_STORAGE_KEY = 'cc_pokonac_goliata_worksheet_v1_backup';
`;

fs.writeFileSync(path.join(zipSrcDir, 'course.js'), courseJsContent, 'utf8');
console.log('Successfully updated course.js with clean titles and rich book content!');
