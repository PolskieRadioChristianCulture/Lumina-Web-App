// scripts/audit-daily-lessons.mjs
import fs from 'fs';
import path from 'path';

for (let d = 1; d <= 25; d++) {
  const pad = String(d).padStart(2, '0');
  const p = `akademia/kurscodzienny/dzien-${pad}.html`;
  if (!fs.existsSync(p)) {
    console.log(`Brak: ${p}`);
    continue;
  }
  const c = fs.readFileSync(p, 'utf8');
  const hasAkHeader = c.includes('class="ak-header"');
  const hasReader = c.includes('initReaderSettings');
  const hasTts = c.includes('toggleAudioLesson');
  const hasJump = c.includes('kcJumpShareBtn');
  const hasTheme = c.includes('cc-course-theme.js');
  const hasVerseCopy = c.includes('navigator.clipboard.writeText');
  const hasMasterStyles = c.includes('--kc-font-body');
  console.log(`Dzień ${d.toString().padStart(2, ' ')}: akHeader=${hasAkHeader} reader=${hasReader} tts=${hasTts} jump=${hasJump} theme=${hasTheme} verseCopy=${hasVerseCopy} masterStyles=${hasMasterStyles}`);
}
