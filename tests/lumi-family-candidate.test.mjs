import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mergeFamilyCandidate } from '../scripts/build-lumi-family-candidate.mjs';
test('merged candidate excludes family from broad admin override, preserves other rules', () => {
    const base = readFileSync('firestore.rules', 'utf8');
    const family = readFileSync('tests/fixtures/lumi-family.rules', 'utf8');
    const merged = mergeFamilyCandidate(base, family);
    assert.match(merged, /topCollection != ['"]lumina_family_rooms['"]/);
    assert.doesNotMatch(merged, /match \/\{document=\*\*\} \{\s*allow read, write: if isMasterAdmin\(\);/);
    assert.equal(merged.split('service cloud.firestore').length, 2);
    assert.ok(merged.includes("'^[A-Za-z0-9_-]{20,80}$'"), 'Literal regex dollar must not interpolate source');
    assert.match(merged, /match \/lumina_family_rooms\/\{roomId\}/);
    assert.match(merged, /function isMember\(\)/);
    assert.match(merged, /match \/kids_profiles\/\{uid\}/);
    assert.equal(mergeFamilyCandidate(merged, family), merged);
    assert.throws(() => mergeFamilyCandidate(merged.replace(/topCollection != ['"]lumina_family_rooms['"]/, 'true'), family), /fallback/);
    assert.throws(() => mergeFamilyCandidate(base.replace('documents {', 'unexpected {'), family), /layout/);
});
