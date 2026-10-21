import fs from 'node:fs';
import path from 'node:path';

const zipSrcDir = 'C:/Users/czark/.gemini/antigravity/brain/db144fde-c11f-407d-ac06-6b4bec418097/unpacked_zip/POKONAC_GOLIATA_PREMIUM_2026/src';
const currentHtml = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/pokonac-goliata.html', 'utf8');
const match = currentHtml.match(/const MODULES = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not extract MODULES from kursy/pokonac-goliata.html');
  process.exit(1);
}

const modulesData = JSON.parse(match[1]);
console.log('Extracted modulesData with count:', modulesData.length);

const moduleIds = ['start', 'awareness', 'faith', 'prayer', 'scripture', 'perseverance', 'prevention', 'love', 'reward', 'master'];

const richModules = modulesData.map((m, idx) => {
  return {
    id: moduleIds[idx],
    tag: m.badge,
    title: m.title.includes('—') ? m.title.split('—')[0].replace(/\(.*?\)/g, '').trim() : m.title.replace(/\(.*?\)/g, '').trim(),
    subtitle: m.title.includes('—') ? m.title.split('—')[1].trim() : (idx === 0 ? 'Diagnoza przedstartowa' : 'Krok do wolności'),
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
console.log('Successfully written enriched course.js with full book texts!');
