import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../_worker.js';

test('CCN Discovery P0: ?art= query parameter redirects 301 to Clean URL', async () => {
  const req = new Request('https://polskieradio.cc/news?art=art-cbdc-prawo-niedzielne-apokalipsa-13');
  const env = { ASSETS: { fetch: async () => new Response('mock asset', { status: 200 }) } };
  const res = await worker.fetch(req, env);
  
  assert.equal(res.status, 301, 'Should return 301 redirect');
  assert.equal(res.headers.get('Location'), 'https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13');
});

test('CCN Discovery P0: /finanse?art= query parameter redirects 301 to finanse Clean URL', async () => {
  const req = new Request('https://polskieradio.cc/finanse?art=art-cbdc-prawo-niedzielne-apokalipsa-13');
  const env = { ASSETS: { fetch: async () => new Response('mock asset', { status: 200 }) } };
  const res = await worker.fetch(req, env);
  
  assert.equal(res.status, 301, 'Should return 301 redirect');
  assert.equal(res.headers.get('Location'), 'https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13');
});

test('CCN Discovery P0: unknown ?art= falls back to ?art slug directly', async () => {
  const req = new Request('https://polskieradio.cc/news?art=custom-future-article-slug');
  const env = { ASSETS: { fetch: async () => new Response('mock asset', { status: 200 }) } };
  const res = await worker.fetch(req, env);
  
  assert.equal(res.status, 301, 'Should return 301 redirect');
  assert.equal(res.headers.get('Location'), 'https://polskieradio.cc/news/custom-future-article-slug');
});
