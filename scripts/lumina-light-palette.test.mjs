import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const css = await readFile(new URL('css/lumina-light-edition.css', root), 'utf8');
const contract = css.slice(css.indexOf('/* Shared light palette.'));
test('light entrypoints preserve UTF-8 and readable Polish labels', async () => {
  for (const name of await readdir(root)) {
    if (!/^lumina.*\.html$/.test(name) || name.includes('review')) continue;
    const bytes = await readFile(new URL(name, root));
    if (!bytes.includes(Buffer.from('lumina-light-edition.css'))) continue;
    const text = new TextDecoder('utf-8', {fatal:true}).decode(bytes);
    assert.ok(!text.includes('\uFFFD'), `${name}: damaged text`);
  }
});

test('homepage uses a single independence notice owned by the shared footer', async () => {
  const home = await readFile(new URL('index.html', root), 'utf8');
  const footer = await readFile(new URL('components/cc-support-footer.js', root), 'utf8');
  assert.equal((home.match(/components\/cc-support-footer\.js/g) || []).length, 1);
  assert.ok(!home.includes('Nota Niezależności'));
  assert.equal((footer.match(/Nota Prawna & Misja:/g) || []).length, 1);
});
function luminance(hex) {
  const channels = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + .05) / (dark + .05);
}

test('light surface aliases cannot retain dark CC backgrounds', () => {
  for (const token of ['bg-surface', 'cc-bg-surface', 'cc-void', 'cc-void-2', 'cc-void-trans']) {
    assert.match(contract, new RegExp(`--${token}:\\s*(?:#F[0-9A-F]{5}|rgba\\(255, 255, 255)`));
  }
  assert.match(contract, /html\[data-lumina-theme="light"\] body/);
});

test('primary gold gradients support normal-size white labels at both ends', () => {
  // Check the CSS used by multiple actual controls, not just a proposed swatch.
  const gradients = [...css.matchAll(/background:\s*linear-gradient\(135deg, (#806120)[^,]*, (#654b18)[^)]*\)/gi)];
  assert.ok(gradients.length >= 10, 'Shared action gradients must use the readable palette');
  for (const [, start, end] of gradients) {
    assert.ok(contrast('#FFFFFF', start) >= 4.5);
    assert.ok(contrast('#FFFFFF', end) >= 4.5);
  }
  for (const background of ['#FFFFFF', '#FAF8F5', '#F5F2EB']) {
    assert.ok(contrast('#655F58', background) >= 4.5, 'Secondary text must remain readable');
  }
});

test('late-mounted panels have complete light surfaces and readable native controls', () => {
  for (const component of ['lumina-share-card', 'lumina-legal-modal', 'lumina-push-toast',
    'lumina-share-preview-box', 'lumina-share-btn', 'lumina-push-dismiss', 'lumina-legal-tab-btn']) {
    assert.ok(contract.includes(`.${component}`));
  }
  assert.match(contract, /background: #FFFFFF !important/);
  assert.match(contract, /color-scheme: light/);
  assert.match(contract, /:focus-visible/);
  assert.match(contract, /scrollbar-color: #9C8762 #F5F2EB/);
});

test('all tracked light entrypoints request the current CSS version', async () => {
  let checked = 0;
  for (const name of await readdir(root)) {
    if (!/^lumina.*\.html$/.test(name) || name.includes('review')) continue;
    const html = await readFile(new URL(name, root), 'utf8');
    if (!html.includes('lumina-light-edition.css')) continue;
    assert.ok(!html.includes('lumina-light-edition.css?v=20261003_board_contrast_v7'), name);
    assert.match(html, /lumina-light-edition\.css\?v=20261004_palette_v12/, name);
    checked++;
  }
  assert.ok(checked >= 20);
});

test('Sunday appeal can adopt the light feed surface in both board renderers', async () => {
  for (const name of ['lumina-tablica.html','lumina-tablica-light.html']) {
    const html = await readFile(new URL(name, root), 'utf8');
    const article = html.match(/<article class="post-card-1x1 post-card-sunday-appeal[^>]+>/)?.[0];
    assert.ok(article, name);
    assert.ok(!article.includes('!important'), name + ': inline priority defeats theme');
    assert.ok(html.includes('class="appeal-support-copy"') && html.includes('class="appeal-transfer-copy"'), name);
  }
  assert.ok(css.includes('.post-card-sunday-appeal :is(.appeal-support-copy, .appeal-transfer-copy)'));
});

test('feed author headers and transmission footers use readable light surfaces', () => {
  for (const selector of ['.post-card-1x1 > .post-top-header','.post-card-1x1 > .post-footer-pro']) {
    const pos = css.lastIndexOf(selector);
    assert.ok(pos >= 0, selector);
    assert.match(css.slice(pos, css.indexOf('}',pos)+1), /background: #FFFFFF !important/);
  }
});
