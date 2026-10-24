import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const p22 = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
const c22 = fs.readFileSync(p22, 'utf8');

// Find end of article / lesson content before footer
const endArticleIdx = c22.indexOf('<!-- Filar 1:');
console.log('--- Context before share block ---');
console.log(c22.slice(endArticleIdx - 800, endArticleIdx + 200));
