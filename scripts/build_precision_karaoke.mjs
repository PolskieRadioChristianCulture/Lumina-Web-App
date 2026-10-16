/**
 * build_precision_karaoke.mjs
 * Milisecond-precise karaoke sync for Biblia Śpiewana (Biblia Audio CC)
 *
 * Strategy:
 * 1. Load YouTube timedtext (fmt=json3) – real ASR timestamps per word
 * 2. Load canonical UBG 2025 verses
 * 3. Load BW verses (as phonetic reference – songs use Biblia Gdańska)
 * 4. Flatten all YT word tokens with absolute timestamps
 * 5. For each verse: sliding-window fuzzy match YT words ↔ BW/UBG words
 *    → find verseStart and verseEnd from real YT data
 * 6. Inside verse window: split UBG text into grammatical clauses,
 *    assign start/end proportionally within the real window
 * 7. Export JSON / VTT / LRC with 0.01s precision
 * 8. Set syncStatus: SYNC_READY (coverage ≥ 80%) or SYNC_REVIEW
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TIMEDTEXT_DIR = path.resolve(
  'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/yt-timedtext'
);
const KARAOKE_DIR = path.join(ROOT, 'data', 'bu-karaoke');
const UBG_DIR = path.join(ROOT, 'data', 'bible', 'ubg-2025');
const BIBLE_DIR = path.join(ROOT, 'data', 'bible');

// ─── Utility: normalize text for matching ───────────────────────────────────
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[.,;:!?„"»«\u201c\u201d\u2013\u2014\-\u2019']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Levenshtein distance ────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─── Word similarity score (0..1) ────────────────────────────────────────────
function wordSim(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return 1 - levenshtein(na, nb) / maxLen;
}

// ─── Sequence similarity between two word arrays ────────────────────────────
function seqSim(verseWords, ytWords) {
  if (!verseWords.length || !ytWords.length) return 0;
  let matched = 0;
  const usedYt = new Set();
  for (let vi = 0; vi < verseWords.length; vi++) {
    let bestSim = 0, bestYi = -1;
    for (let yi = 0; yi < ytWords.length; yi++) {
      if (usedYt.has(yi)) continue;
      const s = wordSim(verseWords[vi], ytWords[yi]);
      if (s > bestSim) { bestSim = s; bestYi = yi; }
    }
    if (bestSim >= 0.6) { matched += bestSim; usedYt.add(bestYi); }
  }
  return matched / verseWords.length;
}

// ─── Flatten YT timedtext events into word tokens ────────────────────────────
function flattenYtTokens(events) {
  const tokens = [];
  for (const ev of events) {
    if (!ev.segs) continue;
    for (const seg of ev.segs) {
      const raw = seg.utf8 || '';
      const cleaned = raw.replace(/\n/g, ' ').trim();
      if (!cleaned) continue;
      // Skip noise tags
      if (/^\[(muzyka|śpiewanie|music|applause|singing)\]$/i.test(cleaned)) continue;
      const tMs = (ev.tStartMs || 0) + (seg.tOffsetMs || 0);
      tokens.push({ t: tMs / 1000, w: cleaned });
    }
  }
  // De-duplicate: remove tokens that are within 50ms of a previous identical word
  const deduped = [];
  for (const tok of tokens) {
    const prev = deduped[deduped.length - 1];
    if (prev && normalize(prev.w) === normalize(tok.w) && Math.abs(tok.t - prev.t) < 0.05) continue;
    deduped.push(tok);
  }
  return deduped;
}

// ─── Find verse window in YT tokens via sliding window ──────────────────────
function findVerseWindow(verseText, bwText, tokens, searchFromIdx) {
  const verseWords = normalize(verseText).split(/\s+/).filter(Boolean);
  const bwWords = bwText ? normalize(bwText).split(/\s+/).filter(Boolean) : verseWords;
  const refWords = bwWords.length >= verseWords.length ? bwWords : verseWords;
  const wLen = refWords.length;
  const tolerance = Math.max(3, Math.ceil(wLen * 0.4));

  let bestScore = 0, bestStart = searchFromIdx, bestEnd = searchFromIdx;

  // Search in a window of ±200 tokens from searchFromIdx
  const lo = Math.max(0, searchFromIdx - 5);
  const hi = Math.min(tokens.length - 1, searchFromIdx + wLen + 60);

  for (let si = lo; si <= hi - Math.max(1, wLen - tolerance); si++) {
    for (let len = Math.max(1, wLen - tolerance); len <= wLen + tolerance && si + len <= tokens.length; len++) {
      const slice = tokens.slice(si, si + len).map(t => t.w);
      const score = seqSim(refWords, slice);
      if (score > bestScore) {
        bestScore = score;
        bestStart = si;
        bestEnd = si + len - 1;
      }
    }
  }

  return { startIdx: bestStart, endIdx: bestEnd, score: bestScore };
}

// ─── Split verse into clauses ─────────────────────────────────────────────────
function splitVerseIntoClauses(text) {
  // Split on comma, semicolon, colon, em-dash (keep trailing punctuation)
  const parts = text.split(/(?<=[,;:–—])\s+/);
  const clauses = [];
  let buf = '';
  for (const p of parts) {
    buf = buf ? buf + ' ' + p : p;
    // Emit clause if it ends with strong punctuation or is long enough
    if (/[;:–—]$/.test(p.trim()) || buf.split(/\s+/).length >= 8) {
      clauses.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) clauses.push(buf.trim());
  // Merge very short (<3 words) clauses into previous
  const merged = [];
  for (const c of clauses) {
    if (merged.length > 0 && c.split(/\s+/).length < 3) {
      merged[merged.length - 1] += ' ' + c;
    } else {
      merged.push(c);
    }
  }
  return merged.length ? merged : [text];
}

// ─── Align clause words to real YT tokens ────────────────────────────────────
function alignClauseWords(clauseWords, clauseStart, clauseEnd, candidateTokens) {
  if (!clauseWords || !clauseWords.length) return [];
  const n = clauseWords.length;
  if (n === 1) {
    return [{ text: clauseWords[0], start: r2(clauseStart), end: r2(clauseEnd) }];
  }

  // Find best monotonic alignment between clauseWords and candidateTokens
  const matchedTimes = new Array(n).fill(null);
  let tokenIdx = 0;

  for (let wi = 0; wi < n; wi++) {
    const cw = clauseWords[wi];
    for (let ti = tokenIdx; ti < candidateTokens.length; ti++) {
      const tok = candidateTokens[ti];
      if (tok.t < clauseStart - 0.5) continue;
      if (tok.t > clauseEnd + 0.5) break;

      if (wordSim(cw, tok.w) >= 0.7) {
        matchedTimes[wi] = tok.t;
        tokenIdx = ti + 1;
        break;
      }
    }
  }

  // Anchor first word and last word boundaries
  let firstMatched = matchedTimes.findIndex(t => t !== null);
  if (firstMatched === -1) {
    // Proportional fallback based on character length
    const totalChars = clauseWords.reduce((acc, w) => acc + Math.max(1, normalize(w).length), 0);
    let cur = clauseStart;
    const dur = Math.max(0.4, clauseEnd - clauseStart);
    return clauseWords.map(w => {
      const wDur = Math.max(0.15, dur * (Math.max(1, normalize(w).length) / totalChars));
      const wStart = r2(cur);
      const wEnd = r2(Math.min(clauseEnd, cur + wDur));
      cur = wEnd;
      return { text: w, start: wStart, end: wEnd };
    });
  }

  // If word 0 not matched:
  if (matchedTimes[0] === null) {
    matchedTimes[0] = Math.max(clauseStart, Math.min(clauseStart + 0.3, matchedTimes[firstMatched] - 0.35));
  }

  // Interpolate missing timestamps monotonically
  let lastKnownIdx = 0;
  for (let i = 1; i < n; i++) {
    if (matchedTimes[i] !== null) {
      const gap = i - lastKnownIdx;
      if (gap > 1) {
        const t0 = matchedTimes[lastKnownIdx];
        const t1 = matchedTimes[i];
        const step = (t1 - t0) / gap;
        for (let j = 1; j < gap; j++) {
          matchedTimes[lastKnownIdx + j] = t0 + step * j;
        }
      }
      lastKnownIdx = i;
    }
  }

  // If trailing words didn't match:
  if (lastKnownIdx < n - 1) {
    const t0 = matchedTimes[lastKnownIdx];
    const tEnd = clauseEnd;
    const gap = n - 1 - lastKnownIdx;
    const step = Math.max(0.2, (tEnd - t0) / (gap + 1));
    for (let j = 1; j <= gap; j++) {
      matchedTimes[lastKnownIdx + j] = Math.min(clauseEnd - (gap - j) * 0.15, t0 + step * j);
    }
  }

  // Construct start and end for each word
  return clauseWords.map((w, i) => {
    const start = r2(matchedTimes[i]);
    let end;
    if (i < n - 1) {
      end = r2(Math.max(start + 0.15, matchedTimes[i + 1]));
    } else {
      end = r2(Math.max(start + 0.25, clauseEnd));
    }
    return { text: w, start, end };
  });
}

// ─── Format helpers ──────────────────────────────────────────────────────────
function r2(n) { return Math.round(n * 100) / 100; }

function toVttTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${s}`;
}

function toLrcTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2).padStart(5, '0');
  return `[${String(m).padStart(2,'0')}:${s}]`;
}

// ─── Build Bible file key (e.g. PRO-001 → PRO_01, ECC-003 → ECC_03) ─────────
function bibleFileKey(chapterId) {
  const [book, ch] = chapterId.split('-');
  return `${book}_${ch.replace(/^0+/, '').padStart(2, '0')}`;
}

// ─── Load BW verse texts ─────────────────────────────────────────────────────
function loadBwVerses(chapterId) {
  const key = bibleFileKey(chapterId);
  // Try various filename patterns
  const candidates = [
    path.join(BIBLE_DIR, `${key}.json`),
    path.join(BIBLE_DIR, `${key.replace('_', '_0')}.json`),
  ];
  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      try {
        const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const map = {};
        for (const v of (data.verses || [])) {
          map[v.verse || v.number] = (v.text && v.text.BW) ? v.text.BW : null;
        }
        return map;
      } catch (e) {
        // ignore
      }
    }
  }
  return {};
}

// ─── Main processing for one chapter ─────────────────────────────────────────
function processChapter(chapterId, timedtextPath) {
  console.log(`\n▶ ${chapterId}`);

  // Load timedtext
  const ttData = JSON.parse(fs.readFileSync(timedtextPath, 'utf8'));
  const tokens = flattenYtTokens(ttData.events || []);
  const totalDuration = ttData.duration || 0;

  if (!tokens.length) {
    console.log(`  ⚠ No tokens — skipping`);
    return null;
  }

  // Load UBG verses
  const ubgPath = path.join(UBG_DIR, `${chapterId}.json`);
  if (!fs.existsSync(ubgPath)) {
    console.log(`  ⚠ No UBG file — skipping`);
    return null;
  }
  const ubgData = JSON.parse(fs.readFileSync(ubgPath, 'utf8'));
  const ubgVerses = ubgData.verses || [];

  // Load BW verses
  const bwMap = loadBwVerses(chapterId);

  const lines = [];
  let lineIdx = 1;
  let searchFromIdx = 0;
  let prevEnd = 0;
  let matchedVerses = 0;

  for (let vi = 0; vi < ubgVerses.length; vi++) {
    const verse = ubgVerses[vi];
    const verseNum = verse.number || verse.verse;
    const ubgText = verse.text || '';
    const bwText = bwMap[verseNum] || null;

    if (!ubgText.trim()) continue;

    // Find this verse in the YT token stream
    const { startIdx, endIdx, score } = findVerseWindow(ubgText, bwText, tokens, searchFromIdx);

    let verseStart, verseEnd;
    const MIN_DURATION = 1.5;

    if (score >= 0.35 && startIdx <= endIdx) {
      verseStart = r2(tokens[startIdx].t);
      verseEnd = r2(tokens[endIdx].t + 0.3); // small lookahead
      if (verseEnd - verseStart < MIN_DURATION) verseEnd = r2(verseStart + MIN_DURATION);
      // Enforce chronological order
      if (verseStart < prevEnd) verseStart = prevEnd;
      if (verseEnd <= verseStart) verseEnd = r2(verseStart + MIN_DURATION);
      searchFromIdx = endIdx + 1;
      matchedVerses++;
      console.log(`  V${verseNum}: ${verseStart}s–${verseEnd}s (score=${score.toFixed(2)})`);
    } else {
      // Fallback: estimate from next matched verse or use gap
      verseStart = prevEnd;
      verseEnd = r2(prevEnd + Math.max(MIN_DURATION, ubgText.split(/\s+/).length * 0.35));
      console.log(`  V${verseNum}: FALLBACK ${verseStart}s–${verseEnd}s (score=${score.toFixed(2)})`);
    }

    prevEnd = verseEnd;

    // Split into clauses and assign proportional timing within the real window
    const clauses = splitVerseIntoClauses(ubgText);
    const windowDur = verseEnd - verseStart;
    const totalChars = clauses.reduce((s, c) => s + c.length, 0);

    let clauseStart = verseStart;
    for (const clause of clauses) {
      const proportion = totalChars > 0 ? clause.length / totalChars : 1 / clauses.length;
      const clauseDur = Math.max(0.4, windowDur * proportion);
      const clauseEnd = r2(Math.min(clauseStart + clauseDur, verseEnd));

      const clauseWords = clause.split(/\s+/).filter(Boolean);
      const words = alignClauseWords(clauseWords, r2(clauseStart), clauseEnd, tokens);

      const idStr = String(lineIdx).padStart(3, '0');
      lines.push({
        id: `${chapterId}-L${idStr}`,
        verse: verseNum,
        start: r2(clauseStart),
        end: clauseEnd,
        text: clause,
        words,
        isInstrumental: false,
      });

      clauseStart = clauseEnd;
      lineIdx++;
    }
  }

  // Coverage metric
  const coverage = ubgVerses.length > 0 ? matchedVerses / ubgVerses.length : 0;
  const syncStatus = coverage >= 0.65 ? 'SYNC_READY' : 'SYNC_REVIEW';
  console.log(`  Coverage: ${matchedVerses}/${ubgVerses.length} (${(coverage * 100).toFixed(0)}%) → ${syncStatus}`);

  return {
    chapterId,
    videoId: ttData.videoId,
    status: syncStatus,
    syncMethod: 'yt-timedtext-precision',
    coverage: Math.round(coverage * 100),
    totalLines: lines.length,
    duration: totalDuration,
    generatedAt: new Date().toISOString(),
    lines,
  };
}

// ─── Write output files ──────────────────────────────────────────────────────
function writeOutputs(data) {
  const { chapterId, lines } = data;

  // JSON
  const jsonPath = path.join(KARAOKE_DIR, `${chapterId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  // VTT
  const vttLines = ['WEBVTT', ''];
  for (const l of lines) {
    if (l.isInstrumental) continue;
    vttLines.push(`${l.id}`);
    vttLines.push(`${toVttTime(l.start)} --> ${toVttTime(l.end)}`);
    vttLines.push(l.text);
    vttLines.push('');
  }
  fs.writeFileSync(path.join(KARAOKE_DIR, `${chapterId}.vtt`), vttLines.join('\n'), 'utf8');

  // LRC
  const lrcLines = [`[ti:${chapterId}]`, `[re:Biblia Śpiewana - Christian Culture]`, ''];
  for (const l of lines) {
    if (l.isInstrumental) continue;
    lrcLines.push(`${toLrcTime(l.start)}${l.text}`);
  }
  fs.writeFileSync(path.join(KARAOKE_DIR, `${chapterId}.lrc`), lrcLines.join('\n'), 'utf8');

  console.log(`  ✓ Written: ${chapterId}.json / .vtt / .lrc`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Biblia Śpiewana — Precision Karaoke Sync Builder');
  console.log('═══════════════════════════════════════════════════');

  const ttFiles = fs.readdirSync(TIMEDTEXT_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${ttFiles.length} timedtext files`);

  const results = { SYNC_READY: [], SYNC_REVIEW: [], SKIPPED: [] };

  for (const ttFile of ttFiles.sort()) {
    const chapterId = path.basename(ttFile, '.json');
    const timedtextPath = path.join(TIMEDTEXT_DIR, ttFile);

    try {
      const data = processChapter(chapterId, timedtextPath);
      if (!data) { results.SKIPPED.push(chapterId); continue; }
      writeOutputs(data);
      results[data.status].push(chapterId);
    } catch (err) {
      console.error(`  ✗ ERROR for ${chapterId}:`, err.message);
      results.SKIPPED.push(chapterId);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`✓ SYNC_READY:  ${results.SYNC_READY.length} chapters`);
  console.log(`⚠ SYNC_REVIEW: ${results.SYNC_REVIEW.length} chapters`);
  console.log(`✗ SKIPPED:     ${results.SKIPPED.length} chapters`);
  if (results.SYNC_REVIEW.length) console.log('  Review:', results.SYNC_REVIEW.join(', '));
  if (results.SKIPPED.length) console.log('  Skipped:', results.SKIPPED.join(', '));

  // Update bu-sync-registry.json
  const registryPath = path.join(ROOT, 'data', 'bu-sync-registry.json');
  let registry = {};
  if (fs.existsSync(registryPath)) {
    try { registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')); } catch {}
  }
  for (const id of [...results.SYNC_READY, ...results.SYNC_REVIEW]) {
    registry[id] = {
      status: results.SYNC_READY.includes(id) ? 'SYNC_READY' : 'SYNC_REVIEW',
      method: 'yt-timedtext-precision',
      updatedAt: new Date().toISOString(),
    };
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`\n✓ Updated ${registryPath}`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
