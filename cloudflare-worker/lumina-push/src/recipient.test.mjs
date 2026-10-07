import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecipientTokens } from './index.js';

const env = { FIREBASE_PROJECT_ID: 'synthetic-test' };
const document = data => ({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, { stringValue: v }])) });
for (const scenario of [
  { name: 'private devices win over stale public profile', tokens: ['new-a', 'new-b', 'new-a'], expected: ['new-a', 'new-b'], reads: 0 },
  { name: 'legacy token requires matching authenticated owner', tokens: [], profile: { uid: 'bob', fcmToken: 'legacy' }, expected: ['legacy'], reads: 1 },
  { name: 'untrusted recipient slug cannot route to another user', tokens: [], profile: { uid: 'eve', fcmToken: 'foreign' }, expected: [], reads: 1 },
  { name: 'missing profile produces no fabricated recipient', tokens: [], expected: [], reads: 1 }
]) {
  test(scenario.name, async t => {
    let reads = 0;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      if (url.endsWith(':runQuery')) {
        const query = JSON.parse(options.body).structuredQuery;
        const filter = query.where.compositeFilter.filters[1].fieldFilter;
        assert.equal(filter.field.fieldPath, 'uid');
        assert.equal(filter.value.stringValue, 'bob');
        return Response.json(scenario.tokens.map(token => ({ document: document({ token }) })));
      }
      reads++;
      return scenario.profile ? Response.json(document(scenario.profile)) : new Response(null, { status: 404 });
    });
    assert.deepEqual(await getRecipientTokens('bob', 'claimed-slug', 'synthetic', env), scenario.expected);
    assert.equal(reads, scenario.reads);
  });
}
