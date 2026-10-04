import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue, readFavorites, findTracks, addToQueue, nextInQueue, viewFromPath } from './src/musicModel.ts';
test('favorite storage is resilient to null, objects, invalid JSON and invalid identifiers', () => {
  for (const raw of [null, 'null', '{}', 'broken', 'true', '"id"']) assert.deepEqual(readFavorites(raw), []);
  assert.deepEqual(readFavorites(JSON.stringify([catalogue[0].id, catalogue[0].id, 2, 'unknown'])), [catalogue[0].id]);
});
test('search is insensitive to case and diacritics, and requires all words', () => {
  const items = [{...catalogue[0], title: 'Łaska i pokój', artist: 'Życie CC'}];
  assert.equal(findTracks(items, 'LASKA zycie', 'Wszystko').length, 1);
  assert.equal(findTracks(items, 'laska xyz', 'Wszystko').length, 0);
});
test('filters and favorites intersect', () => {
  assert.equal(findTracks(catalogue, '', 'Światowe uwielbienie', [catalogue[0].id]).length, 1);
  assert.equal(findTracks(catalogue, '', 'Nagrania CC', [catalogue[0].id]).length, 0);
  assert.equal(findTracks(catalogue, '', 'Wszystko', []).length, 0);
});
test('queue deduplicates and does not wrap at boundaries', () => {
  assert.deepEqual(addToQueue(['a'], 'a'), ['a']); assert.deepEqual(addToQueue(['a'], 'b'), ['a','b']);
  assert.equal(nextInQueue(['a','b'], 'a', 1), 'b'); assert.equal(nextInQueue(['a','b'], 'a', -1), null); assert.equal(nextInQueue(['a','b'], 'b', 1), null);
});
test('existing routes retain meaningful views on reload and back', () => {
  for (const route of ['premiery','video','top','przeboje']) assert.equal(viewFromPath('/music/'+route+'/'), 'library');
  assert.equal(viewFromPath('/music/artysci'), 'artists'); assert.equal(viewFromPath('/music/ulubione'), 'favorites'); assert.equal(viewFromPath('/music'), 'home');
});
test('catalogue has unique canonical video identities, authors, direct URLs and verification timestamps', () => {
  assert.equal(new Set(catalogue.map(x=>x.id)).size, catalogue.length);
  for (const t of catalogue) { assert.match(t.id, /^[\w-]{11}$/); assert.ok(t.title && t.artist); assert.equal(t.youtubeUrl,'https://www.youtube.com/watch?v='+t.id); assert.match(t.checkedAt, /^2026-10-03T/); }
});
