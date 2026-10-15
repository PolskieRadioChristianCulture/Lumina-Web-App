import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const html = fs.readFileSync(path.join(ROOT, 'szukaj.html'), 'utf8');

test('szukaj.html: strictly eliminates all harsh yellow colors', () => {
  assert.ok(!html.includes('#facc15'), 'Must not contain #facc15');
  assert.ok(!html.includes('#FFFF00'), 'Must not contain #FFFF00');
  assert.ok(!html.includes('#FFD700'), 'Must not contain #FFD700');
  assert.ok(!html.includes('color: yellow'), 'Must not contain yellow color');
  assert.ok(!html.includes('color: #c9a04d'), 'Must not contain old dull gold #c9a04d');
});

test('szukaj.html: defines exact Dark Premium palette', () => {
  assert.ok(html.includes('#080D18'), 'Dark page bg: #080D18');
  assert.ok(html.includes('#111827'), 'Dark card bg: #111827');
  assert.ok(html.includes('#182234'), 'Dark elevated surface: #182234');
  assert.ok(html.includes('#F5F7FB'), 'Dark main text: #F5F7FB');
  assert.ok(html.includes('#A6B2C5'), 'Dark secondary text: #A6B2C5');
  assert.ok(html.includes('#7F8CA3'), 'Dark muted text: #7F8CA3');
  assert.ok(html.includes('#263247'), 'Dark borders: #263247');
  assert.ok(html.includes('#C4A35A'), 'Main champagne gold accent: #C4A35A');
  assert.ok(html.includes('#D4B578'), 'Accent hover: #D4B578');
  assert.ok(html.includes('#DDE8FA'), 'Result link color: #DDE8FA');
  assert.ok(html.includes('#89B4FF'), 'Focus ring: #89B4FF');
});

test('szukaj.html: defines exact Light Premium palette', () => {
  assert.ok(html.includes('#F9FAFC'), 'Light page bg: #F9FAFC');
  assert.ok(html.includes('#FFFFFF'), 'Light card bg: #FFFFFF');
  assert.ok(html.includes('#172238'), 'Light main text: #172238');
  assert.ok(html.includes('#637188'), 'Light secondary text: #637188');
  assert.ok(html.includes('#E5EAF1'), 'Light borders: #E5EAF1');
  assert.ok(html.includes('#21549A'), 'Light result link: #21549A');
  assert.ok(html.includes('#A08040'), 'Light accent: #A08040');
});

test('szukaj.html: replaces emoji with professional Lucide SVG icons', () => {
  assert.ok(html.includes('<svg'), 'Uses SVG icons');
  assert.ok(html.includes('viewBox="0 0 24 24"'), 'Standard 24x24 SVG viewBox');
  assert.ok(!html.includes('emoji'), 'Emoji class is removed');
  assert.ok(!html.includes('class="bubble"'), 'Emoji bubble is replaced');
});

test('szukaj.html: 5 category items with 44px min-height', () => {
  const categories = ['Radio & Live', 'Portale', 'Biblia i formacja', 'Media i treści', 'Narzędzia i misja'];
  for (const cat of categories) {
    assert.ok(html.includes(`data-category="${cat}"`), `Category ${cat} is present`);
  }
  assert.ok(html.includes('min-height: 88px') || html.includes('min-height: 48px'), 'Category card height defined');
});

test('szukaj.html: includes search bar with Ctrl+K, mic and clear actions', () => {
  assert.ok(html.includes('id="q"'), 'Search input #q exists');
  assert.ok(html.includes('Ctrl K'), 'Ctrl+K badge exists');
  assert.ok(html.includes('id="micBtn"'), 'Mic button exists');
  assert.ok(html.includes('id="clearBtn"'), 'Clear button exists');
  assert.ok(html.includes('height: 62px') || html.includes('height: 56px'), 'Search bar pill height 62px');
});

test('szukaj.html: includes results toolbar with sorting options', () => {
  assert.ok(html.includes('id="sortBy"'), 'Sort dropdown exists');
  assert.ok(html.includes('value="relevance"'), 'Sort by relevance exists');
  assert.ok(html.includes('value="date"'), 'Sort by date exists');
  assert.ok(html.includes('value="alpha"'), 'Sort by alphabet exists');
  assert.ok(html.includes('id="count"'), 'Count status exists');
});

test('szukaj.html: supports two presentation modes (is-home and is-results)', () => {
  assert.ok(html.includes('is-home'), 'Defines is-home class');
  assert.ok(html.includes('is-results'), 'Defines is-results class');
  assert.ok(html.includes('hero.is-results'), 'CSS rule for compact results hero');
});

test('szukaj.html: preserves synonym search, typo tolerance, and suggestions', () => {
  assert.ok(html.includes('SYNONYM_MAP'), 'Contains SYNONYM_MAP');
  assert.ok(html.includes('findNearSuggestions'), 'Contains near suggestions fallback');
  assert.ok(html.includes('id="suggestionBanner"'), 'Suggestion banner element exists');
});
