import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const p22 = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
const c22 = fs.readFileSync(p22, 'utf8');

// Read from 10000 to 14000 to see header/nav/jump
console.log('--- Context around line 11349 ---');
console.log(c22.slice(10500, 13000));
