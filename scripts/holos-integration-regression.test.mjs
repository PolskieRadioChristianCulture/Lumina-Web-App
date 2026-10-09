import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const html = await readFile(new URL('../holos.html', import.meta.url), 'utf8');

test('all HOLOS inline executable scripts retain valid syntax', () => {
  let checked = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/src=|ld\+json/.test(match[1])) continue;
    const result = spawnSync(process.execPath, ['--input-type=' + (match[1].includes('module') ? 'module' : 'commonjs'), '--check'], {
      input: match[2], encoding: 'utf8', windowsHide: true
    });
    assert.equal(result.status, 0, result.stderr);
    checked++;
  }
  assert.ok(checked >= 3);
});

test('HOLOS exposes accessible, same-tab CC tools with touch targets', () => {
  const nav = html.match(/<nav aria-label="Narzędzia Christian Culture"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  for (const route of ['/akademia#kurscodzienny', '/mojabiblia', '/', '/tablica']) {
    assert.ok(nav.includes(`href="${route}"`));
  }
  assert.equal((nav.match(/min-height:44px/g) || []).length, 4);
  assert.equal((nav.match(/aria-hidden="true"/g) || []).length, 4);
  assert.ok(!nav.includes('target="_blank"'));
});

test('local HOLOS data never claims cloud synchronization', () => {
  const start = html.indexOf('    function updateSyncUI()');
  const end = html.indexOf('    /*', start);
  assert.ok(start >= 0 && end > start);
  for (const user of [null, { displayName: 'Test' }]) {
    const label = {};
    vm.runInNewContext(html.slice(start, end) + '\nupdateSyncUI();', {
      getCcUser: () => user,
      document: { getElementById: () => label }
    });
    assert.match(label.innerText, /lokalny/);
    assert.doesNotMatch(label.innerText, /Zsynchronizowano/);
  }
  assert.ok(!html.includes('Dane zapisywane w profilu CC ID'));
});

test('BYOK disclosure matches the existing outbound Gemini request', () => {
  assert.ok(html.includes('generativelanguage.googleapis.com'));
  assert.ok(html.includes('przekazywane do Google Gemini'));
  assert.ok(!html.includes('Nigdy nie opuszcza Twojego urządzenia'));
});
