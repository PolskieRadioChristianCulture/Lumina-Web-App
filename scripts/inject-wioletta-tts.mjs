import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const CHAPTERS_DIR = path.join(ROOT, 'Wioletta', 'pardon-czy-to-milosc');

let updatedCount = 0;

for (let i = 1; i <= 25; i++) {
  const filePath = path.join(CHAPTERS_DIR, `rozdzial-${i}`, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Check if already injected
  if (html.includes('wioletta-reader-tts.js')) {
    console.log(`Rozdział ${i}: already has wioletta-reader-tts.js`);
    continue;
  }

  // Inject right after wioletta-reader-data.js
  const target = '<script defer src="/js/wioletta-reader-data.js"></script>';
  const replacement = '<script defer src="/js/wioletta-reader-data.js"></script>\n<script defer src="/js/wioletta-reader-tts.js"></script>';

  if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync(filePath, html, 'utf8');
    updatedCount++;
    console.log(`Rozdział ${i}: successfully injected wioletta-reader-tts.js`);
  } else {
    console.warn(`Rozdział ${i}: target not found!`);
  }
}

console.log(`\nTotal updated chapters: ${updatedCount}/25`);
