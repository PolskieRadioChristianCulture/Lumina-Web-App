import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const p22 = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
const c22 = fs.readFileSync(p22, 'utf8');

// Find navigation buttons at bottom
const idx = c22.lastIndexOf('dzien-21');
console.log('Last dzien-21 context:\n', c22.slice(idx - 200, idx + 500));
