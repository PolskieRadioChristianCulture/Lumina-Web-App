import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('CC Karaoke Sync 2.0: 1. GEN-001.json zawiera pełną synchronizację słowo-po-słowie (words[])', () => {
  const p = path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.json');
  assert.ok(fs.existsSync(p), 'Plik GEN-001.json musi istnieć');

  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  assert.equal(data.chapterId, 'GEN-001');
  assert.equal(data.status, 'SYNC_READY');
  assert.ok(Array.isArray(data.lines) && data.lines.length >= 100);

  let totalWords = 0;
  for (const line of data.lines) {
    if (line.isInstrumental) continue;

    assert.ok(Array.isArray(line.words), `Linia ${line.id} musi zawierać tablicę words[]`);
    assert.ok(line.words.length > 0, `Linia ${line.id} musi mieć przynajmniej 1 słowo`);

    let prevEnd = line.start;
    for (const w of line.words) {
      assert.ok(typeof w.text === 'string' && w.text.length > 0, 'Słowo musi mieć tekst');
      assert.ok(Number.isFinite(w.start), 'start słowa musi być liczbą');
      assert.ok(Number.isFinite(w.end), 'end słowa musi być liczbą');
      assert.ok(w.end >= w.start, `end (${w.end}) musi być >= start (${w.start}) dla słowa "${w.text}"`);
      assert.ok(w.start >= line.start - 0.05, `start słowa (${w.start}) nie może wyprzedzać linii (${line.start})`);
      assert.ok(w.end <= line.end + 0.05, `end słowa (${w.end}) nie może przekraczać linii (${line.end})`);
      totalWords++;
    }
  }

  assert.ok(totalWords >= 500, `GEN-001 musi mieć co najmniej 500 znaczników słów (znaleziono: ${totalWords})`);
});

test('CC Karaoke Sync 2.0: 2. Wszystkie 38 utworów katalogu posiadają per-word timestamps', () => {
  const playlist = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'biblijne-uwielbienie-playlist.json'), 'utf8'));
  assert.equal(playlist.items.length, 38);

  for (const item of playlist.items) {
    const chId = item.chapterId;
    const p = path.join(ROOT, 'data', 'bu-karaoke', `${chId}.json`);
    assert.ok(fs.existsSync(p), `Brak pliku karaoke dla ${chId}`);

    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(data.status, 'SYNC_READY');

    const vocalLines = data.lines.filter(l => !l.isInstrumental);
    const withWords = vocalLines.filter(l => Array.isArray(l.words) && l.words.length > 0);
    assert.ok(withWords.length / vocalLines.length >= 0.95, `${chId} musi mieć co najmniej 95% linii z timestampami słów`);
  }
});

test('CC Karaoke Sync 2.0: 3. Silnik assets/bu/karaoke-top100.js obsługuje tryby [Linijki] i [Słowa] oraz korektę przesunięcia (Offset)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');

  assert.ok(js.includes('hero-karaoke-sync-toolbar'), 'Musi zawierać pasek hero-karaoke-sync-toolbar');
  assert.ok(js.includes('setDisplayMode'), 'Musi implementować setDisplayMode');
  assert.ok(js.includes('adjustOffset'), 'Musi implementować adjustOffset');
  assert.ok(js.includes('resetOffset'), 'Musi implementować resetOffset');
  assert.ok(js.includes('getSavedOffset'), 'Musi implementować pobieranie zapisanego offsetu per utwór');
  assert.ok(js.includes('is-uncertain'), 'Musi obsługiwać oznaczanie niepewnych słów (confidence < 0.7)');
  assert.ok(js.includes('bu-offset-val-badge'), 'Musi zawierać licznik bu-offset-val-badge');
  assert.ok(js.includes('bu-display-lines-btn'), 'Musi zawierać przełącznik trybu Linijki');
  assert.ok(js.includes('bu-display-words-btn'), 'Musi zawierać przełącznik trybu Słowa');
});
