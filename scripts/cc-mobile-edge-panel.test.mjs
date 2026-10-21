import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Mobile Edge Panel: component file exists and exports CCMobileEdgePanel', () => {
  const compPath = path.join(ROOT, 'portals/ccn-news/src/components/CCMobileEdgePanel.tsx');
  assert.ok(fs.existsSync(compPath), 'CCMobileEdgePanel.tsx must exist');
  const code = fs.readFileSync(compPath, 'utf8');
  assert.ok(code.includes('export const CCMobileEdgePanel'), 'Must export CCMobileEdgePanel');
});

test('Mobile Edge Panel: complies with visual standards (black background, #C4A35A gold)', () => {
  const compPath = path.join(ROOT, 'portals/ccn-news/src/components/CCMobileEdgePanel.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // Width: compact edge panel
  assert.ok(code.includes('w-[70px]') || code.includes('w-[72px]'), 'Panel width must be 70-72px');

  // Background: Deep pure black #000000
  assert.ok(code.includes('#000000') || code.includes('bg-black'), 'Panel background must use deep pure black');

  // Gold accent: #C4A35A
  assert.ok(code.includes('#C4A35A'), 'Panel accents must use Christian Culture gold #C4A35A');

  // Rounded right edge 20-24px
  assert.ok(code.includes('rounded-r-'), 'Panel must have rounded right corners');
});

test('Mobile Edge Panel: compact layout fits all icons without escaping at the bottom', () => {
  const compPath = path.join(ROOT, 'portals/ccn-news/src/components/CCMobileEdgePanel.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  // Compact layout: small vertical gap and item heights
  assert.ok(code.includes('gap-[3px]') || code.includes('gap-[4px]'), 'Compact gap between items ensures all icons fit on screen');
  assert.ok(code.includes('overflow-y-auto'), 'Overflow fallback allows smooth scrolling');
});

test('Mobile Edge Panel: includes all core navigation actions from spec Section 5', () => {
  const compPath = path.join(ROOT, 'portals/ccn-news/src/components/CCMobileEdgePanel.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  const requiredIds = [
    'home',
    'radio',
    'news',
    'biblia',
    'akademia',
    'vod',
    'lumina',
    'biznes',
    'kultura',
    'biblioteka',
    'live',
    'search',
    'bookmarks',
    'info',
    'user'
  ];

  for (const id of requiredIds) {
    assert.ok(code.includes(`id: '${id}'`), `Edge Panel must contain action '${id}'`);
  }
});

test('Mobile Edge Panel: accessible semantics (role="dialog", aria-modal="true", aria-current="page")', () => {
  const compPath = path.join(ROOT, 'portals/ccn-news/src/components/CCMobileEdgePanel.tsx');
  const code = fs.readFileSync(compPath, 'utf8');

  assert.ok(code.includes('role="dialog"'), 'Panel must have role="dialog"');
  assert.ok(code.includes('aria-modal="true"'), 'Panel must declare aria-modal="true"');
  assert.ok(code.includes('aria-current'), 'Active route must have aria-current');
  assert.ok(code.includes('Escape'), 'Must handle Escape key to close');
  assert.ok(code.includes('handleTouchEnd'), 'Must handle touch swipe gestures');
});

test('Mobile Edge Panel: Header.tsx integrates single + mobile trigger button', () => {
  const headerPath = path.join(ROOT, 'portals/ccn-news/src/components/Header.tsx');
  assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
  const code = fs.readFileSync(headerPath, 'utf8');

  assert.ok(code.includes('CCMobileEdgePanel'), 'Header must import and render CCMobileEdgePanel');
  assert.ok(code.includes('edgePanelOpen'), 'Header must maintain edgePanelOpen state');
  assert.ok(code.includes('aria-controls="cc-mobile-edge-panel"'), 'Header + trigger must have aria-controls');
  assert.ok(code.includes('min-w-[44px]'), 'Header + trigger must be >= 44px');
  assert.ok(code.includes('min-h-[44px]'), 'Header + trigger must be >= 44px');
});
