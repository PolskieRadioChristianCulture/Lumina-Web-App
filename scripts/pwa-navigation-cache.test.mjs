import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Execute the real worker with inert SDK/network mocks: no registration, push or user data.
async function fixture() {
  const handlers = new Map();
  const entries = new Map();
  const calls = [];
  vm.runInNewContext(await readFile('firebase-messaging-sw.js', 'utf8'), {
    URL,
    self: { location: { origin: 'https://polskieradio.cc' }, addEventListener: (name, fn) => handlers.set(name, fn) },
    importScripts() {},
    firebase: { initializeApp() {}, messaging: () => ({ onBackgroundMessage() {} }) },
    console: { log() {}, warn() {}, error() {} },
    caches: { open: async () => ({
      match: async request => { calls.push(['match', request.url]); return entries.get(request.url); },
      put: async (request, response) => entries.set(request.url, response)
    }) },
    fetch: async request => {
      calls.push(['fetch', request.url]);
      return { status: 200, type: 'basic', version: 'fresh', clone() { return this; } };
    }
  });
  return { calls, entries, dispatch(request) {
    let response;
    handlers.get('fetch')({ request, respondWith(value) { response = value; } });
    return response;
  } };
}

test('HTML navigation and documents never receive cached worker responses', async () => {
  const app = await fixture();
  for (const path of ['/lumina', '/tablica', '/rolki', '/lumina/osobowoscplus?theme=light', '/lumina-profile?u=andrzejhamera']) {
    for (const flags of [{ mode: 'navigate' }, { destination: 'document' }]) {
      assert.equal(app.dispatch({ method: 'GET', url: 'https://polskieradio.cc' + path, ...flags }), undefined);
    }
  }
  assert.equal(app.calls.length, 0);
});

test('API, external requests and writes remain outside the static cache', async () => {
  const app = await fixture();
  for (const request of [
    { method: 'GET', url: 'https://polskieradio.cc/api/status' },
    { method: 'GET', url: 'https://example.org/style.css' },
    { method: 'POST', url: 'https://polskieradio.cc/style.css' }
  ]) assert.equal(app.dispatch(request), undefined);
  assert.equal(app.calls.length, 0);
});

test('a versioned profile stylesheet cannot reuse an older query cache key', async () => {
  const app = await fixture();
  const oldUrl = 'https://polskieradio.cc/css/lumina-profile-standard.css?v=old';
  const newUrl = 'https://polskieradio.cc/css/lumina-profile-standard.css?v=20261008_profile_compact_v4';
  const previous = { version: 'old' };
  app.entries.set(oldUrl, previous);
  const response = await app.dispatch({ method: 'GET', url: newUrl, destination: 'style' });
  assert.equal(response.version, 'fresh');
  assert.deepEqual(app.calls, [['match', newUrl], ['fetch', newUrl]]);
  assert.equal(app.entries.get(oldUrl), previous);
  assert.equal(app.entries.get(newUrl).version, 'fresh');
});
