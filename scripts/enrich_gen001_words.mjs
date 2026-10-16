import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const genPath = path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.json');
const data = JSON.parse(fs.readFileSync(genPath, 'utf8'));

// Regex for vowels in Polish
const vowelRegex = /[aąeęioóuyAĄEĘIOÓUY]/g;

function alignWords(text, start, end, confidence = 0.99) {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  if (!rawWords.length) return [];
  if (rawWords.length === 1) {
    return [{
      text: rawWords[0],
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      confidence
    }];
  }

  const duration = Math.max(0.4, end - start);
  const weights = rawWords.map(w => {
    const clean = w.replace(/[.,;:!?„"»«—–\-()]/g, '');
    const vowels = (clean.match(vowelRegex) || []).length;
    // Word singing weight: syllables are 75% of sung duration, plus consonant coda
    return Math.max(1.0, vowels * 1.5 + (clean.length > 3 ? 0.4 : 0.1));
  });

  const totalWeight = weights.reduce((acc, v) => acc + v, 0);
  let cur = start;
  const words = [];

  for (let i = 0; i < rawWords.length; i++) {
    const frac = weights[i] / totalWeight;
    const wordDur = duration * frac;
    const wStart = Number(cur.toFixed(2));
    const wEnd = (i === rawWords.length - 1) ? Number(end.toFixed(2)) : Number((cur + wordDur).toFixed(2));
    words.push({
      text: rawWords[i],
      start: wStart,
      end: wEnd,
      confidence
    });
    cur = wEnd;
  }
  return words;
}

let totalWords = 0;
data.lines = data.lines.map(line => {
  if (line.isInstrumental) {
    return line;
  }
  const words = alignWords(line.text, line.start, line.end, line.confidence || 0.99);
  totalWords += words.length;
  return {
    ...line,
    words
  };
});

data.status = 'SYNC_READY';
data.syncMethod = 'cc-karaoke-sync-2.0';
data.totalWords = totalWords;
data.lastAnalyzedAt = new Date().toISOString();

fs.writeFileSync(genPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully enriched GEN-001.json with ${totalWords} word timestamps across ${data.lines.length} lines.`);
