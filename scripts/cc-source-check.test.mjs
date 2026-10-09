import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { CORE_FILES, inspectSources } from './cc-source-check.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-source-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'source'), mirror = path.join(root, 'mirror');
  for (const dir of [source, mirror]) {
    fs.mkdirSync(dir);
    for (const file of CORE_FILES) {
      const target = path.join(dir, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, 'fixture\n');
    }
  }
  return { root, source, mirror };
}

test('equal files never claim production readiness or silently copy data', t => {
  const { source, mirror } = fixture(t);
  const before = fs.readdirSync(source);
  const report = inspectSources(source, mirror);
  assert.equal(report.discrepancies, 0);
  assert.equal(report.releaseReady, false);
  assert.equal(report.production.state, 'not-checked');
  assert.equal(report.sourceGit.state, 'unavailable');
  assert.deepEqual(fs.readdirSync(source), before);
  assert.equal(report.files.length, 15);
});

test('format-only differences are separated from missing and changed content', t => {
  const { source, mirror } = fixture(t);
  fs.writeFileSync(path.join(mirror, 'holos.html'), '\uFEFFfixture\r\n');
  fs.writeFileSync(path.join(mirror, 'lumina-db.js'), 'old code\n');
  fs.unlinkSync(path.join(mirror, 'akademia.html'));
  const report = inspectSources(source, mirror);
  assert.equal(report.files.find(f => f.file === 'holos.html').state, 'format-only');
  assert.equal(report.files.find(f => f.file === 'lumina-db.js').state, 'different');
  assert.equal(report.files.find(f => f.file === 'akademia.html').mirror.state, 'missing');
  assert.equal(report.discrepancies, 2);
  assert.equal(fs.readFileSync(path.join(mirror, 'lumina-db.js'), 'utf8'), 'old code\n');
});

test('fixed scope never includes secret files or file contents', t => {
  const { source, mirror } = fixture(t);
  fs.writeFileSync(path.join(source, '.env'), 'PRIVATE_FIXTURE_MARKER');
  fs.writeFileSync(path.join(source, 'serviceAccountKey.json'), 'PRIVATE_FIXTURE_MARKER');
  const output = JSON.stringify(inspectSources(source, mirror));
  assert.ok(!output.includes('PRIVATE_FIXTURE_MARKER'));
  assert.ok(!output.includes('serviceAccountKey'));
  assert.ok(!output.includes('.env'));
  assert.ok(!output.includes('fixture\\n'));
});

test('same source and mirror are rejected', t => {
  const { source } = fixture(t);
  assert.throws(() => inspectSources(source, source), /different directories/);
});

test('git commit evidence distinguishes clean and dirty without publishing', t => {
  const { source, mirror } = fixture(t);
  const git = args => execFileSync('git', args, { cwd: source, windowsHide: true, stdio: 'pipe' });
  git(['init', '-q']); git(['add', '.']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture']);
  let report = inspectSources(source, mirror);
  assert.equal(report.sourceGit.clean, true);
  assert.equal(report.sourceCommitStableDuringScan, true);
  fs.writeFileSync(path.join(source, 'holos.html'), 'changed');
  report = inspectSources(source, mirror);
  assert.equal(report.sourceGit.clean, false);
  assert.equal(report.discrepancies, 1);
  assert.equal(report.releaseReady, false);
});

test('CLI fails closed when mandatory paths are missing', () => {
  const result = spawnSync(process.execPath, ['scripts/cc-source-check.mjs'], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No changes were made/);
});

test('mandatory CC regression cannot silently omit source-integrity tests', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts['test:cc-regression'].split(/\s+/).includes('scripts/cc-source-check.test.mjs'));
});

test('CLI reports divergence with exit 2 without copying or printing contents', t => {
  const { source, mirror } = fixture(t);
  fs.writeFileSync(path.join(source, 'holos.html'), 'PRIVATE_TEST_CONTENT_NOT_FOR_OUTPUT');
  const result = spawnSync(process.execPath, ['scripts/cc-source-check.mjs', source, mirror], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.equal(report.discrepancies, 1);
  assert.equal(report.production.state, 'not-checked');
  assert.ok(!result.stdout.includes('PRIVATE_TEST_CONTENT_NOT_FOR_OUTPUT'));
  assert.equal(fs.readFileSync(path.join(mirror, 'holos.html'), 'utf8'), 'fixture\n');
});

test('directory links outside the selected root are rejected before content is read', t => {
  const { root, source, mirror } = fixture(t);
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'cc-global-auth.js'), 'OUTSIDE_TEST_MARKER');
  fs.rmSync(path.join(source, 'js'), { recursive: true, force: true });
  fs.symlinkSync(outside, path.join(source, 'js'), process.platform === 'win32' ? 'junction' : 'dir');
  const report = inspectSources(source, mirror);
  assert.equal(report.files.find(f => f.file === 'js/cc-global-auth.js').source.state, 'unsafe-link');
  assert.ok(!JSON.stringify(report).includes('OUTSIDE_TEST_MARKER'));
});
