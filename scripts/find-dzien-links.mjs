import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const p22 = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
const c22 = fs.readFileSync(p22, 'utf8');

// Find all occurrences of dzien-21 and dzien-23
let pos = 0;
while (true) {
  const i = c22.indexOf('dzien-', pos);
  if (i === -1) break;
  console.log(`Match at ${i}:`, c22.slice(i, i + 35));
  pos = i + 6;
}
