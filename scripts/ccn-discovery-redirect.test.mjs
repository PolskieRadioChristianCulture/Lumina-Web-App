import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../_worker.js';

test('CCN Discovery P0: ?art= query parameter redirects 301 to Clean URL', async () => {
  const req = new Request('https://polskieradio.cc/news?art=art-cbdc-prawo-niedzielne-apokalipsa-13');
  const env = { ASSETS: { fetch: async () => new Response('mock asset', { status: 200 }) } };
  const res = await worker.fetch(req, env);
  
  assert.equal(res.status, 301, 'Should return 301 redirect');
  assert.equal(res.headers.get('Location'), 'https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13');
});

test('CCN Discovery P0: /finanse?art= query parameter redirects 301 to finanse Clean URL', async () => {
  const req = new Request('https://polskieradio.cc/finanse?art=art-cbdc-prawo-niedzielne-apokalipsa-13');
  const env = { ASSETS: { fetch: async () => new Response('mock asset', { status: 200 }) } };
  const res = await worker.fetch(req, env);
  
  assert.equal(res.status, 301, 'Should return 301 redirect');
  assert.equal(res.headers.get('Location'), 'https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13');
});


import fs from 'node:fs';
import routes from '../data/ccn-article-routes.js';

test('every published section ID and slug redirects to an existing static page', async () => {
  for (const [section, entries] of Object.entries(routes)) {
    for (const [id, target] of Object.entries(entries)) {
      const response = await worker.fetch(new Request('https://polskieradio.cc/' + section + '?art=' + encodeURIComponent(id) + '&utm_source=regression'), {});
      assert.equal(response.status, 301, section + '/' + id);
      const location = new URL(response.headers.get('Location'));
      assert.equal(decodeURI(location.pathname), target);
      assert.equal(location.searchParams.get('utm_source'), 'regression');
      assert.equal(location.searchParams.has('art'), false);
      assert.ok(fs.existsSync('.' + target + '/index.html'), target);
    }
  }
});

test('unknown and malformed IDs retain the portal fallback without invented redirects', async () => {
  for (const id of ['unknown-future-article', '', '../admin', 'constructor', '__proto__']) {
    const response = await worker.fetch(new Request('https://polskieradio.cc/news?art=' + encodeURIComponent(id)), {
      ASSETS: { fetch: async () => new Response('portal fallback') }
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'portal fallback');
  }
});
