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

  assert.ok(content.includes('<script src="/assets/bu/karaoke-top100.js" defer></script>'), 'Musi dołączać skrypt karaoke-top100.js z defer');
  assert.ok(content.includes('window.CC_BU_GET_ID_TOKEN'), 'Musi definiować funkcję pobierania tokena CC_BU_GET_ID_TOKEN');
  assert.ok(content.includes('/lumina-db.js'), 'Musi wspierać pobieranie tożsamości z lumina-db.js');
});

test('BU Karaoke & TOP 100: 5. Poprawność pliku synchronizacji GEN-001 (Karaoke)', () => {
  const karaokePath = path.join(ROOT, 'data', 'bu-karaoke', 'GEN-001.json');
  assert.ok(fs.existsSync(karaokePath), 'data/bu-karaoke/GEN-001.json musi istnieć');

  const data = JSON.parse(fs.readFileSync(karaokePath, 'utf8'));
  assert.equal(data.chapterId, 'GEN-001');
  assert.equal(data.videoId, 'WN_y21vHW6g');
  assert.equal(data.status, 'approved');
  assert.ok(data.translation.includes('Christian Culture'), 'Musi podawać właściwą autorską adaptację');
  assert.ok(Array.isArray(data.lines), 'lines musi być tablicą');
  assert.ok(data.lines.length >= 30, 'Musi zawierać przynajmniej 30 zsynchronizowanych wersów');

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
