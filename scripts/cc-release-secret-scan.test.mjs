import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanReleaseForSecrets } from './cc-release-secret-scan.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-release-scan-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('clean empty, nested, uppercase and large public text files can be scanned', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, 'data'));
  fs.writeFileSync(path.join(root, 'empty.txt'), '');
  fs.writeFileSync(path.join(root, 'data', 'catalog.JSON'), ' '.repeat(6 * 1024 * 1024));
  assert.doesNotThrow(() => scanReleaseForSecrets(root));
});

test('each existing secret class blocks a release without exposing its contents', t => {
  const root = fixture(t);
  const file = path.join(root, 'entry.js');
  for (const content of [
    '-----BEGIN PRIVATE KEY-----', '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----',
    '"refresh_token": "SYNTHETIC_MARKER"', "'client_secret': 'SYNTHETIC_MARKER'",
    'CLOUDFLARE_API_TOKEN = "SYNTHETIC_MARKER"',
  ]) {
    fs.writeFileSync(file, content);
    assert.throws(() => scanReleaseForSecrets(root), error => {
      assert.match(error.message, /wykryto sekret w entry\.js/);
      assert.ok(!error.message.includes(content));
      assert.ok(!error.message.includes('SYNTHETIC_MARKER'));
      return true;
    });
  }
});

test('a secret beyond the former 5 MB limit is still detected', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, 'data'));
  fs.writeFileSync(path.join(root, 'data', 'large.json'), ' '.repeat(6 * 1024 * 1024) + '"client_secret": "SYNTHETIC_MARKER"');
  assert.throws(() => scanReleaseForSecrets(root), /wykryto sekret w data[/\\]large\.json/);
});

test('missing directories and failed directory/file reads block approval with sanitized errors', t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'index.html'), '<html></html>');
  assert.throws(() => scanReleaseForSecrets(path.join(root, 'missing')), /nie można sprawdzić/);
  for (const method of ['readdirSync', 'readFileSync']) {
    const fileSystem = { ...fs, [method]() { throw new Error('SYNTHETIC_PRIVATE_ERROR'); } };
    assert.throws(() => scanReleaseForSecrets(root, { fileSystem }), error => {
      assert.match(error.message, /nie można sprawdzić/);
      assert.ok(!error.message.includes('SYNTHETIC_PRIVATE_ERROR'));
      return true;
    });
  }
});

test('release builder invokes the scanner and mandatory regression includes these tests', () => {
  const builder = fs.readFileSync(new URL('./build-pages-release.mjs', import.meta.url), 'utf8');
  assert.match(builder, /import \{ scanReleaseForSecrets \} from '\.\/cc-release-secret-scan\.mjs'/);
  assert.match(builder, /scanReleaseForSecrets\(resolvedOutput\)/);
  assert.doesNotMatch(builder, /stat\.size > 5 \* 1024 \* 1024/);
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts['test:cc-regression'].split(/\s+/).includes('scripts/cc-release-secret-scan.test.mjs'));
});
