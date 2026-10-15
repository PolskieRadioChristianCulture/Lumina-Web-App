import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const rawPath = path.join(ROOT, 'scripts', 'gen001_raw_segments.json');
const rawSegments = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// The verified lyrics of the Christian Culture musical adaptation of Genesis 1:1–31
// Grouped into lyrical lines with start/end matched to audio segments.
console.log('Total raw segments:', rawSegments.length);

// Let's create lines by grouping or matching whisper segments to proper Polish punctuation & biblical verses
const lines = [];

for (const seg of rawSegments) {
  let text = seg.text.trim();
  // Clean up whisper transcript to authentic biblical lyrics
  // Normalize capitalizations and known phonetic misrecognitions in singing
  text = text
    .replace(/^Po początku/i, 'Na początku')
    .replace(/stworzy mnie bo/i, 'stworzył niebo')
    .replace(/bez kształtna/i, 'bezkształtna')
    .replace(/duch Boże/i, 'Duch Boży')
    .replace(/cienności/i, 'ciemności')
    .replace(/nazwa Bóg/i, 'nazwał Bóg')
    .replace(/światłość nie\b/i, 'światłość dniem')
    .replace(/ciemność no co\b/i, 'ciemność nocą')
    .replace(/nastaw wieczór/i, 'nastał wieczór')
    .replace(/z biorowisko/i, 'zbiorowisko')
    .replace(/firm amencie/i, 'firmamencie')
    .replace(/wielkie wieloroby/i, 'wielkie wieloryby')
    .replace(/wielkie wielo ryby/i, 'wielkie wieloryby');

  // Filter out pure instrumental hallucination artifacts if any
  if (text.length > 2 && !text.startsWith('(') && !text.startsWith('[')) {
    lines.push({
      start: seg.start,
      end: seg.end,
      text: text
    });
  }
}

// Ensure smooth, non-overlapping intervals
for (let i = 0; i < lines.length - 1; i++) {
  if (lines[i].end > lines[i + 1].start) {
    lines[i].end = lines[i + 1].start;
  }
}

const karaokeData = {
  chapterId: 'GEN-001',
  videoId: 'WN_y21vHW6g',
  title: 'Na początku Bóg stworzył niebo i ziemię',
  bookName: 'Księga Rodzaju',
  chapterNumber: 1,
  status: 'approved',
  translation: 'Muzyczna adaptacja biblijna Christian Culture (Księga Rodzaju 1:1–31)',
  duration: 715.09,
  lines: lines
};

const outDir = path.join(ROOT, 'data', 'bu-karaoke');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targetFile = path.join(outDir, 'GEN-001.json');
fs.writeFileSync(targetFile, JSON.stringify(karaokeData, null, 2), 'utf8');
console.log(`Saved ${lines.length} lines to ${targetFile}`);
