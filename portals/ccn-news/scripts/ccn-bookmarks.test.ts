import test from 'node:test';
import assert from 'node:assert/strict';
import { readBookmarks } from '../src/lib/bookmarks';
test('malformed and legacy null bookmarks never crash the news render', () => {
  for (const value of [null, 'null', '{}', '1', 'broken']) assert.deepEqual(readBookmarks(value), []);
});
test('valid saved bookmarks survive while duplicates and invalid members are removed', () => {
  assert.deepEqual(readBookmarks('["day2",null,5,"day2","day3",""]'), ['day2','day3']);
});
