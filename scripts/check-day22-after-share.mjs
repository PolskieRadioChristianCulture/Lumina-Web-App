import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const p22 = path.join(ROOT, 'akademia/kurscodzienny/dzien-22.html');
const c22 = fs.readFileSync(p22, 'utf8');

// Print from #ccDailyShare to the end of file
const shareIdx = c22.indexOf('id="ccDailyShare"');
console.log(c22.slice(shareIdx, shareIdx + 3000));
