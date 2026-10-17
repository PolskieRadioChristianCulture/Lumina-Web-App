import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('assets/bu/biblia-spiewana-live-karaoke.js', 'utf8');
function productionFunction(name, nextName) {
  const start = source.indexOf(`  function ${name}(`);
  const end = source.indexOf(`  function ${nextName}(`, start);
  assert.ok(start >= 0 && end > start, 'production function boundaries exist');
  return source.slice(start, end);
}

test('LIVE never guesses the current track from a wall-clock schedule', () => {
  const context = vm.createContext({ window: { worshipPlaylist: [{ chapterId: 'PRO-001', duration: 300 }] },
    getStreamAudio: () => null, resolveChapterFromTrack: () => null, formatChapterTitle: id => id });
  vm.runInContext(productionFunction('getCurrentBroadcastTrack', 'formatChapterTitle'), context);
  assert.equal(vm.runInContext('getCurrentBroadcastTrack().chapterId', context), null);
});

test('LIVE lyrics use audio.currentTime while paused, playing, seeking and buffering', () => {
  const audio = { currentTime: 0, paused: true };
  const nodes = Array.from({ length: 2 }, () => ({ classList: { toggle() {}, remove() {} }, setAttribute() {}, removeAttribute() {} }));
  const state = { manualChapterOverride: false, chapterId: 'PRO-001', pluginMode: 'ON', syncStatus: 'SYNC_READY',
    sync: { lines: [{ start: 0, end: 8 }, { start: 10, end: 20 }] }, syncNodes: nodes, offsetMs: 0, lastActiveIdx: -1 };
  const observed = [];
  const context = vm.createContext({ state, document: { getElementById: () => null }, window: { currentWorshipTrackOffset: 120, currentWorshipTrackSyncedAtMs: 1 },
    getStreamAudio: () => audio, getCurrentBroadcastTrack: () => ({ chapterId: 'PRO-001' }),
    evaluateVisibilityAndMinimize() {}, updateTelemetryUI() {}, centerActiveLine() {},
    updateActiveLineWords: (_node, _line, now) => observed.push(now) });
  vm.runInContext(productionFunction('tickSync', 'updateTelemetryUI'), context);
  const tick = () => vm.runInContext('tickSync()', context);
  tick(); assert.equal(observed.at(-1), 0);
  audio.paused = false; audio.currentTime = 12; tick(); assert.equal(observed.at(-1), 12);
  audio.paused = true; tick(); tick(); assert.equal(observed.at(-1), 12);
  audio.currentTime = 2; tick(); assert.equal(observed.at(-1), 2);
  assert.equal(state.lastActiveIdx, 0);
});
