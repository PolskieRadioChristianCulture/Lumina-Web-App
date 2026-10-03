import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { inspectFirebaseConfig } from './firebase-hosting-preflight.mjs';

test('inspectFirebaseConfig correctly analyzes targeted repository (polskieradio.cc)', () => {
  const currentDir = path.resolve('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc');
  const result = inspectFirebaseConfig(currentDir);

  assert.equal(result.hasFirebaseJson, true);
  assert.equal(result.hasFirebaserc, true);
  assert.ok(result.hostingConfigs.length >= 2, 'Should have multiple hosting targets');
  
  // Targets lumina and ccglobal should have target definitions
  const targets = result.hostingConfigs.map(h => h.target);
  assert.ok(targets.includes('lumina'));
  assert.ok(targets.includes('ccglobal'));
});

test('inspectFirebaseConfig identifies untargeted repository (Christian-Culture-Web-App)', () => {
  const targetDir = path.resolve('C:/Users/czark/Christian_Culture_Projekty/Christian-Culture-Web-App');
  const result = inspectFirebaseConfig(targetDir);

  assert.equal(result.hasFirebaseJson, true);
  assert.equal(result.hostingConfigs.length, 1);
  assert.equal(result.hostingConfigs[0].target, null);
  assert.equal(result.hostingConfigs[0].site, null);
  
  // Should detect vulnerability
  assert.ok(result.vulnerabilities.length > 0, 'Should detect implicit default site vulnerability');
  assert.ok(result.remediations.some(r => r.command.includes('firebase hosting:sites:create')));
});
