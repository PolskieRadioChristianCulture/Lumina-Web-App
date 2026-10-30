import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadGeminiKeys, getActiveGeminiKey, rotateGeminiKey, getPoolStatus, executeWithGeminiFallback } from './gemini-rotator.mjs';

test('Gemini Rotator: prawidłowo parsuje klucze z pliku .env', () => {
  const tempEnv = path.join(os.tmpdir(), `test-env-${Date.now()}.env`);
  fs.writeFileSync(tempEnv, `
GEMINI_API_KEY=AIzaSy_KEY_MAIN
GEMINI_API_KEY_BACKUP_1=AIzaSy_KEY_BACKUP_1
GEMINI_API_KEY_BACKUP_2=AIzaSy_KEY_BACKUP_2
# Komentarz ignorowany
INNA_ZMIENNA=123
  `.trim());

  try {
    const keys = loadGeminiKeys(tempEnv);
    assert.equal(keys.length, 3);
    assert.equal(keys[0], 'AIzaSy_KEY_MAIN');
    assert.equal(keys[1], 'AIzaSy_KEY_BACKUP_1');
    assert.equal(keys[2], 'AIzaSy_KEY_BACKUP_2');

    const active1 = getActiveGeminiKey();
    assert.equal(active1, 'AIzaSy_KEY_MAIN');

    const rotated = rotateGeminiKey();
    assert.equal(rotated, 'AIzaSy_KEY_BACKUP_1');

    const status = getPoolStatus();
    assert.equal(status.totalKeys, 3);
    assert.equal(status.hasBackups, true);
  } finally {
    if (fs.existsSync(tempEnv)) fs.unlinkSync(tempEnv);
  }
});

test('Gemini Rotator: executeWithGeminiFallback automatycznie rotuje przy błędzie 429', async () => {
  const tempEnv = path.join(os.tmpdir(), `test-env-failover-${Date.now()}.env`);
  fs.writeFileSync(tempEnv, `
GEMINI_API_KEY=FAILING_KEY_1
GEMINI_API_KEY_BACKUP_1=WORKING_KEY_2
  `.trim());

  try {
    loadGeminiKeys(tempEnv);
    let attemptsCount = 0;

    const result = await executeWithGeminiFallback(async (key) => {
      attemptsCount++;
      if (key === 'FAILING_KEY_1') {
        const err = new Error('RESOURCE_EXHAUSTED: Quota exceeded for model');
        err.status = 429;
        throw err;
      }
      return `SUCCESS_WITH_${key}`;
    });

    assert.equal(attemptsCount, 2);
    assert.equal(result, 'SUCCESS_WITH_WORKING_KEY_2');
  } finally {
    if (fs.existsSync(tempEnv)) fs.unlinkSync(tempEnv);
  }
});
