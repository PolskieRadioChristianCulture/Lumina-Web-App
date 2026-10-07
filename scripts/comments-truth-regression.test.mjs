import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

for (const file of ['js/lumina-comments-engine.js', 'lumina-db.js']) {
  const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const start = source.indexOf('const LuminaCommentsEngine = {');
  assert.notEqual(start, -1);
  const objectStart = source.indexOf('{', start);
  const end = source.indexOf('\n};', objectStart);
  const storage = new Map();
  const engine = vm.runInNewContext('(' + source.slice(objectStart, end + 2) + ')', {
    localStorage: { getItem: key => storage.get(key) ?? null }
  });
  engine.init = () => {};
  engine._sanitizeComment = comment => ({ ...comment });

  test(file + ': no fabricated dialogue, likes or comments on first visit', () => {
    assert.equal(engine.generateNaturalMissionDialogue('p1').length, 0);
    assert.equal(engine.getComments('p1').length, 0);
    assert.equal(storage.size, 0);
  });
  test(file + ': hides old fabricated comments without changing user data', () => {
    const key = engine._commentsKeyPrefix + 'p1';
    const archived = JSON.stringify([
      { id: 'real_1', text: 'Real comment', timestamp: 3 },
      { id: 'old', isMissionAuto: true, timestamp: 1 },
      { id: 'comm_p1_mission_0', timestamp: 2 },
      { id: 'real_2', text: 'Other real comment', timestamp: 4 }
    ]);
    storage.set(key, archived);
    assert.deepEqual(Array.from(engine.getComments('p1'), c => c.id), ['real_1', 'real_2']);
    assert.equal(storage.get(key), archived);
    storage.clear();
  });
  test(file + ': malformed local cache does not manufacture replacements', () => {
    storage.set(engine._commentsKeyPrefix + 'p1', '{broken');
    assert.equal(engine.getComments('p1').length, 0);
    storage.clear();
  });
}
