import test from 'node:test';
import assert from 'node:assert/strict';
import { readFeed } from '../src/components/EcosystemNews';
const entry = { id: 'test-only', title: '<script>plain text</script>', summary: 'Test', canonicalUrl: 'https://polskieradio.cc/kuchnia', channel: 'Kuchnia', publicationDay: '2020-01-01' };
const feed = (items: unknown[]) => ({ schemaVersion: 1, visibility: 'public-editorially-reviewed', items });
test('malformed or private feed fails safely', () => {
  for (const value of [null, [], { items: [entry] }, { ...feed([entry]), visibility: 'private-local-review-only' }]) assert.deepEqual(readFeed(value), []);
});
test('public entries deduplicate and preserve text for React escaping', () => {
  assert.deepEqual(readFeed(feed([entry, entry])), [entry]);
});
test('unsafe URL, impossible date and future date cannot render', () => {
  for (const change of [{ canonicalUrl: 'javascript:alert(1)' }, { canonicalUrl: 'https://polskieradio.cc.evil.invalid/' }, { publicationDay: '2020-02-31' }, { publicationDay: '2999-01-01' }]) assert.deepEqual(readFeed(feed([{ ...entry, ...change }])), []);
});
