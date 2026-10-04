import test from 'node:test';
import assert from 'node:assert/strict';
import { adapt, SOURCES, mergeQueue, buildPublishingProjection } from './ccn-ecosystem-import.mjs';
import { digest, prepareStaticRelease } from './ccn-static-release.mjs';
import { verifyStagedRelease } from './ccn-verify-staged-release.mjs';
const now = '2026-10-03T10:00:00Z';
function fixture() {
  const candidate = adapt(SOURCES[0], { lessons: [{ title: 'Test study', calendarMonth: '2026-10', lessonMonthNumber: 2, publicationDate: '2026-10-02', mainIdea: 'Test only', author: 'Verified author fixture' }] })[0];
  const queue = mergeQueue({ schemaVersion: 1, items: [] }, [candidate], now);
  Object.assign(queue.items[0], { state: 'approved', approvedBy: 'TEST ONLY', approvedAt: now, rightsStatus: 'approved', authorStatus: 'editorially-verified', sourceDateVerified: true, publishAt: now, privateEmail: 'private@example.invalid' });
  const item = buildPublishingProjection(queue, now).items[0];
  return { queue, review: { schemaVersion: 1, items: [{ id: item.id, sha256: digest(item) }] } };
}
test('reviewed due item projects only approved public fields', () => {
  const { queue, review } = fixture();
  const result = prepareStaticRelease(queue, review, now);
  assert.equal(result.items.length, 1);
  assert.deepEqual(Object.keys(result.items[0]), ['id','title','summary','canonicalUrl','channel','publicationDay','author','type']);
  assert.ok(!JSON.stringify(result).includes('TEST ONLY'));
  assert.ok(!JSON.stringify(result).includes('privateEmail'));
});
test('no release selection means no publication', () => {
  const { queue } = fixture();
  assert.equal(prepareStaticRelease(queue, { schemaVersion: 1, items: [] }, now).items.length, 0);
});
test('changed item invalidates reviewed release hash', () => {
  const { queue, review } = fixture(); queue.items[0].title = 'changed';
  assert.throws(() => prepareStaticRelease(queue, review, now));
});
test('unapproved or future material cannot enter release', () => {
  for (const change of [{ state: 'needs-review' }, { publishAt: '2026-10-04T10:00:00Z' }, { rightsStatus: 'requires-review' }]) {
    const { queue, review } = fixture(); Object.assign(queue.items[0], change);
    assert.throws(() => prepareStaticRelease(queue, review, now));
  }
});
test('duplicate selection fails rather than duplicating public items', () => {
  const { queue, review } = fixture(); review.items.push(review.items[0]);
  assert.throws(() => prepareStaticRelease(queue, review, now));
});
test('previous staged release fails after withdrawal or changes; public bylines survive', () => {
  const {queue, review}=fixture();
  queue.items[0].author='Verified editorial author';
  const item=buildPublishingProjection(queue,now).items[0];review.items=[{id:item.id,sha256:digest(item)}];
  const feed=prepareStaticRelease(queue,review,now);
  assert.equal(feed.items[0].author,'Verified editorial author');
  assert.equal(verifyStagedRelease(queue,review,feed,now),1);
  queue.items[0].state='withdrawn';
  assert.throws(()=>verifyStagedRelease(queue,review,feed,now));
});
