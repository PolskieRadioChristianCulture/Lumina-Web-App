import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { handleBUApi } from '../lib/bu-voting-worker.js';

const ROOT = process.cwd();

test('BU Karaoke & TOP 100: 1. Istnienie i integralność plików modułu', () => {
  const feScript = path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js');
  const beWorker = path.join(ROOT, 'lib', 'bu-voting-worker.js');
  const htmlFile = path.join(ROOT, 'biblijne-uwielbienie.html');
  const workerFile = path.join(ROOT, '_worker.js');
  const wranglerFile = path.join(ROOT, 'wrangler.toml');

  assert.ok(fs.existsSync(feScript), 'assets/bu/karaoke-top100.js musi istnieć');
  assert.ok(fs.existsSync(beWorker), 'lib/bu-voting-worker.js musi istnieć');
  assert.ok(fs.existsSync(htmlFile), 'biblijne-uwielbienie.html musi istnieć');
  assert.ok(fs.existsSync(workerFile), '_worker.js musi istnieć');
  assert.ok(fs.existsSync(wranglerFile), 'wrangler.toml musi istnieć');
});

test('BU Karaoke & TOP 100: 2. Konfiguracja D1 i zmiennych środowiskowych w wrangler.toml', () => {
  const content = fs.readFileSync(path.join(ROOT, 'wrangler.toml'), 'utf8');

  assert.ok(content.includes('bu_votes_db'), 'Musi zawierać binding bu_votes_db');
  assert.ok(content.includes('bu-votes-db'), 'Musi zawierać nazwę bazy bu-votes-db');
  assert.ok(content.includes('c31208a3-4580-4a97-a7d2-4782b009b754'), 'Musi zawierać prawidłowe ID bazy D1');
  assert.ok(content.includes('FIREBASE_PROJECT_ID = "lumina-cc"'), 'Musi definiować projekt Firebase lumina-cc');
});

test('BU Karaoke & TOP 100: 3. Bezpieczna integracja w _worker.js (bez nadpisywania)', () => {
  const content = fs.readFileSync(path.join(ROOT, '_worker.js'), 'utf8');

  assert.ok(content.includes("import { handleBUApi } from './lib/bu-voting-worker.js';"), 'Musi importować handleBUApi');
  assert.ok(content.includes("url.pathname.startsWith('/api/bu/v1/')"), 'Musi obsługiwać ścieżkę /api/bu/v1/');
  assert.ok(content.includes("return handleBUApi(request, env);"), 'Musi delegować zapytania do handleBUApi');

  // Sprawdzenie, czy lib/ jest chronione w isBlocked
  assert.ok(content.includes("'/lib/'"), '/lib/ musi pozostać zablokowane publicznie w isBlocked');
});

test('BU Karaoke & TOP 100: 4. Podpięcie skryptu i tokena LUMINA w biblijne-uwielbienie.html', () => {
  const content = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');

  assert.ok(/<script\s+src="\/assets\/bu\/karaoke-top100\.js(\?[^"]*)?"\s+defer><\/script>/.test(content), 'Musi dołączać skrypt karaoke-top100.js z defer');
  assert.ok(content.includes('window.CC_BU_GET_ID_TOKEN'), 'Musi definiować funkcję pobierania tokena CC_BU_GET_ID_TOKEN');
  assert.ok(content.includes('/lumina-db.js'), 'Musi wspierać pobieranie tożsamości z lumina-db.js');
});

test('BU Karaoke & TOP 100: 5. Poprawność pliku synchronizacji GEN-001 (Karaoke)', () => {
  const karaokePath = path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.json');
  assert.ok(fs.existsSync(karaokePath), 'data/bu-karaoke/GEN-001.json musi istnieć');

  const data = JSON.parse(fs.readFileSync(karaokePath, 'utf8'));
  assert.equal(data.chapterId, 'GEN-001');
  assert.equal(data.videoId, 'WN_y21vHW6g');
  assert.ok(data.status === 'SYNC_READY' || data.status === 'approved', 'Status musi być SYNC_READY lub approved');
  assert.ok(data.translation.includes('UBG-2025') || data.translation.includes('Christian Culture'), 'Musi podawać tłumaczenie lub adaptację');
  assert.ok(Array.isArray(data.lines), 'lines musi być tablicą');
  assert.ok(data.lines.length >= 30, 'Musi zawierać przynajmniej 30 zsynchronizowanych wersów');

  // Sprawdzenie istnienia formatów WebVTT i LRC
  assert.ok(fs.existsSync(path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.vtt')), 'GEN-001.vtt musi istnieć');
  assert.ok(fs.existsSync(path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.lrc')), 'GEN-001.lrc musi istnieć');

  // Sprawdzenie kolejności chronologicznej i poprawności znaczników czasu
  let prevTime = 0;
  for (const line of data.lines) {
    assert.ok(Number.isFinite(line.start), 'start musi być liczbą');
    assert.ok(Number.isFinite(line.end), 'end musi być liczbą');
    assert.ok(line.end >= line.start, 'end musi być >= start');
    assert.ok(line.start >= prevTime - 0.5, 'wersy muszą być ułożone chronologicznie');
    assert.ok(typeof line.text === 'string' && line.text.length > 0, 'wers musi mieć tekst');
    prevTime = line.start;
  }
});

test('BU Karaoke & TOP 100: 6. Testy jednostkowe API backendu (bu-voting-worker.js)', async () => {
  // Mock D1 Database
  const mockDb = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async all() {
              if (sql.includes('SELECT chapter_id AS chapterId, COUNT(*) AS votes')) {
                return { results: [{ chapterId: 'GEN-001', votes: 12 }] };
              }
              if (sql.includes('SELECT chapter_id FROM bu_votes WHERE user_id=?')) {
                return { results: [{ chapter_id: 'GEN-001' }] };
              }
              return { results: [] };
            },
            async first() {
              return { n: 12 };
            },
            async run() {
              return { success: true };
            }
          };
        }
      };
    }
  };

  const mockEnv = {
    bu_votes_db: mockDb,
    FIREBASE_PROJECT_ID: 'lumina-cc',
    ASSETS: {
      fetch: async () => new Response(JSON.stringify({ items: [{ chapterId: 'GEN-001', videoId: 'WN_y21vHW6g' }] }))
    }
  };

  // Test 1: GET /api/bu/v1/ranking
  const reqRanking = new Request('https://polskieradio.cc/api/bu/v1/ranking?limit=10', { method: 'GET' });
  const resRanking = await handleBUApi(reqRanking, mockEnv);
  assert.equal(resRanking.status, 200);
  const dataRanking = await resRanking.json();
  assert.ok(Array.isArray(dataRanking.items));
  assert.equal(dataRanking.items[0].chapterId, 'GEN-001');
  assert.equal(dataRanking.items[0].votes, 12);

  // Test 2: GET /api/bu/v1/my-votes bez nagłówka Authorization -> 401
  const reqMyVotesNoAuth = new Request('https://polskieradio.cc/api/bu/v1/my-votes', { method: 'GET' });
  const resMyVotesNoAuth = await handleBUApi(reqMyVotesNoAuth, mockEnv);
  assert.equal(resMyVotesNoAuth.status, 401);

  // Test 3: PUT /api/bu/v1/votes/GEN-001 bez tokena -> 401
  const reqVoteNoAuth = new Request('https://polskieradio.cc/api/bu/v1/votes/GEN-001', { method: 'PUT' });
  const resVoteNoAuth = await handleBUApi(reqVoteNoAuth, mockEnv);
  assert.equal(resVoteNoAuth.status, 401);

  // Test 4: Nieznana ścieżka -> 404
  const req404 = new Request('https://polskieradio.cc/api/bu/v1/unknown', { method: 'GET' });
  const res404 = await handleBUApi(req404, mockEnv);
  assert.equal(res404.status, 404);
});

test('BU Karaoke & TOP 100: 7. Kompletność importu całej Biblii UBG 2025 (66 ksiąg, 1189 rozdziałów)', () => {
  const bibleDir = path.join(ROOT, 'data', 'bible', 'ubg-2025');
  assert.ok(fs.existsSync(bibleDir), 'Katalog data/bible/ubg-2025 musi istnieć');

  const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
  assert.equal(files.length, 1189, 'Musi być dokładnie 1189 plików rozdziałów w data/bible/ubg-2025/');

  const manifestPath = path.join(bibleDir, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json musi istnieć');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.totalBooks, 66, 'Musi być dokładnie 66 ksiąg');
  assert.equal(manifest.totalChapters, 1189, 'Musi być dokładnie 1189 rozdziałów');
  assert.equal(manifest.totalVerses, 31102, 'Musi być dokładnie 31102 wersety');
  assert.equal(manifest.chapters.length, 1189, 'Tablica chapters w manifest.json musi mieć 1189 wpisów');
});

test('BU Karaoke & TOP 100: 8. Integralność wersetów kluczowych rozdziałów (GEN-001, PRO-001, ECC-012, LEV-001, REV-022)', () => {
  const checkList = [
    { id: 'GEN-001', book: 'Księga Rodzaju', ch: 1, minVerses: 31, v1Start: 'Na początku Bóg stworzył niebo i ziemię.' },
    { id: 'PRO-001', book: 'Przypowieści Salomona', ch: 1, minVerses: 33, v1Start: 'Przysłowia Salomona' },
    { id: 'ECC-012', book: 'Księga Kaznodziei', ch: 12, minVerses: 14, v1Start: 'Pamiętaj więc o swoim Stwórcy' },
    { id: 'LEV-001', book: 'Księga Kapłańska', ch: 1, minVerses: 17, v1Start: 'I PAN zawołał do Mojżesza' },
    { id: 'PSA-023', book: 'Księga Psalmów', ch: 23, minVerses: 6, v1Start: 'PAN jest moim pasterzem' },
    { id: 'REV-022', book: 'Apokalipsa św. Jana', ch: 22, minVerses: 21, v1Start: 'I pokazał mi czystą rzekę' }
  ];

  for (const c of checkList) {
    const p = path.join(ROOT, 'data', 'bible', 'ubg-2025', `${c.id}.json`);
    assert.ok(fs.existsSync(p), `Plik ${c.id}.json musi istnieć`);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.equal(data.chapterId, c.id);
    assert.equal(data.book, c.book);
    assert.equal(data.chapter, c.ch);
    assert.equal(data.translation, 'UBG-2025');
    assert.ok(data.copyright.includes('Fundacja Wrota Nadziei'), 'Musi zawierać notę o prawach autorskich');
    assert.ok(data.copyright.includes('CC BY-ND 4.0'), 'Musi zawierać informację o licencji CC BY-ND 4.0');
    assert.ok(Array.isArray(data.verses), 'verses musi być tablicą');
    assert.ok(data.verses.length >= c.minVerses, `Liczba wersetów musi być >= ${c.minVerses}`);

    // Sprawdzenie sekwencji 1..N
    data.verses.forEach((v, idx) => {
      assert.equal(v.number, idx + 1, `Werset ${v.number} powinien mieć indeks ${idx + 1}`);
      assert.ok(typeof v.text === 'string' && v.text.trim().length > 0, `Werset ${v.number} nie może być pusty`);
    });

    assert.ok(data.verses[0].text.startsWith(c.v1Start), `Werset 1 ${c.id} musi zaczynać się od "${c.v1Start}"`);
  }
});

test('BU Karaoke & TOP 100: 9. Obecność kontenerów hero-karaoke-lines i sceny HERO w biblijne-uwielbienie.html', () => {
  const html = fs.readFileSync(path.join(ROOT, 'biblijne-uwielbienie.html'), 'utf8');

  assert.ok(html.includes('id="hero-karaoke-stage"'), 'Musi zawierać kontener hero-karaoke-stage');
  assert.ok(html.includes('id="hero-karaoke-lines"'), 'Musi zawierać kontener hero-karaoke-lines');
  assert.ok(html.includes('tab-mode-reading'), 'Musi zawierać przycisk Trybu A (Czytaj i śpiewaj)');
  assert.ok(html.includes('tab-mode-sync'), 'Musi zawierać przycisk Trybu B (Karaoke zsynchronizowane)');
  assert.ok(html.includes('hero-book-select'), 'Musi zawierać selektor ksiąg Biblii');
  assert.ok(html.includes('hero-chapter-select'), 'Musi zawierać selektor rozdziałów Biblii');
  assert.ok(html.includes('btn-player-karaoke'), 'Master player musi mieć przycisk Tekst Biblii & Karaoke');
  assert.ok(html.includes('chapter-lyrics-trigger-btn'), 'Karty rozdziałów w bibliotece muszą mieć przycisk Tekst');
});

test('BU Karaoke & TOP 100: 10. Architektura skryptu assets/bu/karaoke-top100.js (Zero Atrap, Tryb A i B, Brak pustego ekranu)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'bu', 'karaoke-top100.js'), 'utf8');

  assert.ok(js.includes('loadChapterLyrics'), 'Musi implementować funkcję loadChapterLyrics');
  assert.ok(js.includes('startChapterKaraoke'), 'Musi implementować funkcję startChapterKaraoke');
  assert.ok(js.includes('voteCurrentTrack'), 'Musi implementować bezpośrednie oddawanie głosu voteCurrentTrack bez okna');
  assert.ok(js.includes('togglePlayerKaraoke'), 'Musi implementować przełączanie karaoke na tapecie HERO togglePlayerKaraoke bez okna');
  assert.ok(js.includes('/data/bible/ubg-2025/'), 'Musi odpytywać ścieżkę /data/bible/ubg-2025/');
  assert.ok(js.includes('/data/bu-karaoke/'), 'Musi odpytywać ścieżkę /data/bu-karaoke/');
  assert.ok(js.includes('data-mode'), 'Musi ustawiać atrybut data-mode na kontenerze');
  assert.ok(js.includes('reading'), 'Musi obsługiwać tryb reading');
  assert.ok(js.includes('synchronized'), 'Musi obsługiwać tryb synchronized');
  assert.ok(js.includes('adjustFontSize'), 'Musi udostępniać regulację wielkości liter');
  assert.ok(js.includes('toggleFullscreen'), 'Musi udostępniać tryb pełnoekranowy');
  assert.ok(js.includes('CC BY-ND 4.0'), 'Musi zawierać notę licencyjną CC BY-ND 4.0');
});

test('BU Karaoke & TOP 100: 11. Auto Karaoke Sync Engine, Rejestr i Panel Karaoke Studio', () => {
  // 1. Skrypt silnika ASR i forced alignment
  const enginePath = path.join(ROOT, 'scripts', 'bu_auto_karaoke_engine.py');
  assert.ok(fs.existsSync(enginePath), 'scripts/bu_auto_karaoke_engine.py musi istnieć');
  const enginePy = fs.readFileSync(enginePath, 'utf8');
  assert.ok(enginePy.includes('find_best_verse_span'), 'Musi implementować precyzyjne dopasowanie słów wersetu');
  assert.ok(enginePy.includes('export_webvtt'), 'Musi implementować eksport WebVTT');
  assert.ok(enginePy.includes('export_lrc'), 'Musi implementować eksport LRC');
  assert.ok(enginePy.includes('SYNC_READY') && enginePy.includes('SYNC_REVIEW'), 'Musi klasyfikować statusy synchronizacji');

  // 2. Centralny rejestr
  const registryPath = path.join(ROOT, 'data', 'bu-sync-registry.json');
  assert.ok(fs.existsSync(registryPath), 'data/bu-sync-registry.json musi istnieć');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  assert.equal(registry.schemaVersion, 1);
  assert.equal(registry.totalCatalogSongs, 38);
  assert.ok(registry.summary.syncReady >= 1, 'Musi mieć przynajmniej 1 utwór SYNC_READY');
  assert.ok(Array.isArray(registry.items) && registry.items.length === 38);

  // 3. Panel administracyjny Karaoke Sync Studio
  const studioPath = path.join(ROOT, 'karaoke-studio.html');
  assert.ok(fs.existsSync(studioPath), 'karaoke-studio.html musi istnieć');
  const studioHtml = fs.readFileSync(studioPath, 'utf8');
  assert.ok(studioHtml.includes('Karaoke Sync Studio'), 'Musi zawierać tytuł panelu');
  assert.ok(studioHtml.includes('kpi-grid'), 'Musi zawierać kafelki KPI');
  assert.ok(studioHtml.includes('song-table'), 'Musi zawierać tabelę utworów');
  assert.ok(studioHtml.includes('inspector-panel'), 'Musi zawierać studio inspekcji osi czasu');
});

test('BU Karaoke & TOP 100: 12. Czystość kanoniczna UBG 2025 (0 słów spoza Biblii) i synchronizacja wszystkich 38 opublikowanych utworów', () => {
  const playlist = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'biblijne-uwielbienie-playlist.json'), 'utf8'));
  assert.equal(playlist.items.length, 38, 'Playlista musi zawierać 38 opublikowanych utworów');

  for (const item of playlist.items) {
    const chId = item.chapterId;
    const syncPath = path.join(ROOT, 'data', 'bu-karaoke', `${chId}.json`);
    const vttPath = path.join(ROOT, 'data', 'bu-karaoke', `${chId}.vtt`);
    const lrcPath = path.join(ROOT, 'data', 'bu-karaoke', `${chId}.lrc`);
    const biblePath = path.join(ROOT, 'data', 'bible', 'ubg-2025', `${chId}.json`);

    assert.ok(fs.existsSync(syncPath), `Brak pliku karaoke JSON dla ${chId}`);
    assert.ok(fs.existsSync(vttPath), `Brak pliku karaoke VTT dla ${chId}`);
    assert.ok(fs.existsSync(lrcPath), `Brak pliku karaoke LRC dla ${chId}`);

    const syncData = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));

    assert.equal(syncData.status, 'SYNC_READY', `${chId} musi mieć status SYNC_READY`);
    assert.ok(Array.isArray(syncData.lines) && syncData.lines.length >= 30, `${chId} musi mieć linie karaoke`);

    const byVerse = new Map();
    for (const line of syncData.lines) {
      assert.ok(Number.isInteger(line.verse) && line.verse >= 1, `Każda linia w ${chId} musi należeć do wersetu biblijnego`);
      assert.ok(!line.text.includes('Wstawka muzyczna'), `${chId} nie może zawierać pozabiblijnych wstawek`);
      if (!byVerse.has(line.verse)) byVerse.set(line.verse, []);
      byVerse.get(line.verse).push(line.text);
    }

    for (const v of bibleData.verses) {
      const reconstructed = (byVerse.get(v.number) || []).join(' ');
      const canonical = v.text.trim().replace(/\s+/g, ' ');
      assert.equal(reconstructed, canonical, `Niezgodność ze Słowem Bożym UBG 2025 w ${chId} w.${v.number}`);
    }
  }
});

