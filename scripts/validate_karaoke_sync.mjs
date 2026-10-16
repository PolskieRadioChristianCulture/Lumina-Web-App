import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const genPath = path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.json');
const data = JSON.parse(fs.readFileSync(genPath, 'utf8'));

console.log('=== WALIDACJA JAKOŚCI SYNCHRONIZACJI CC KARAOKE SYNC 2.0 (GEN-001) ===');

let totalWords = 0;
let timingGaps = [];
let wordDurations = [];
let onsetDeltas = [];

for (const line of data.lines) {
  if (line.isInstrumental || !line.words) continue;

  for (let i = 0; i < line.words.length; i++) {
    const w = line.words[i];
    const dur = w.end - w.start;
    wordDurations.push(dur);
    totalWords++;

    if (i > 0) {
      const prevW = line.words[i - 1];
      const gap = w.start - prevW.end;
      timingGaps.push(Math.abs(gap));
      onsetDeltas.push(w.start - prevW.start);
    }
  }
}

wordDurations.sort((a, b) => a - b);
timingGaps.sort((a, b) => a - b);

const medianDur = wordDurations[Math.floor(wordDurations.length / 2)];
const medianGap = timingGaps[Math.floor(timingGaps.length / 2)];
const maxGap = Math.max(...timingGaps);
const wordsUnderThreshold = timingGaps.filter(g => g <= 0.25).length;
const complianceRatio = ((wordsUnderThreshold / timingGaps.length) * 100).toFixed(1);

console.log(`- Przetworzonych linii:      ${data.lines.length}`);
console.log(`- Zsynchronizowanych słów:   ${totalWords}`);
console.log(`- Mediana czasu trwania:     ${(medianDur * 1000).toFixed(0)} ms`);
console.log(`- Mediana odstępu (gap):     ${(medianGap * 1000).toFixed(1)} ms`);
console.log(`- Zgodność z limitem 250ms:  ${complianceRatio}%`);
console.log(`- Status synchronizacji:     ${data.status}`);
console.log('========================================================================');

if (complianceRatio < 95) {
  console.error('BŁĄD: Zgodność poniżej progu 95%!');
  process.exit(1);
} else {
  console.log('SUKCES: Wszystkie kryteria odbioru CC Karaoke Sync 2.0 spełnione!');
}
