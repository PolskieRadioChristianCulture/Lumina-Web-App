import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../_worker.js';

const env = {
  ASSETS: {
    fetch: async (request) => new Response(`asset:${new URL(request.url).pathname}`, { status: 200 }),
  },
};

for (const path of [
  '/.github/DISPATCH_BOARD.md',
  '/.agents/skills/firebase-basics/SKILL.md',
  '/scripts/agent-matrix/.matrix_sessions/agent-01/Default/Network/Cookies',
  '/firebase_functions/index.js',
  '/cloudflare/push/README.md',
  '/index.html.bak',
  '/firebase.json',
  '/package.json',
]) {
  test(`edge blocks ${path}`, async () => {
    const response = await worker.fetch(new Request(`https://polskieradio.cc${path}`), env);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  });
}

test('edge serves public portal routes through the asset binding', async () => {
  for (const path of ['/', '/lumina', '/tablica', '/rolki', '/firebase-messaging-sw.js']) {
    const response = await worker.fetch(new Request(`https://polskieradio.cc${path}`), env);
    assert.equal(response.status, 200);
  }
});
