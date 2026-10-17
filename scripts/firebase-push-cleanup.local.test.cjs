const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const relPath of [
  'functions/lumina-chat-push-functions.js',
  'firebase_functions/lumina-chat-push-functions.js'
]) {
  test(`${relPath}: only confirmed unregistered device is removed, provider errors stay private`, () => {
    const code = fs.readFileSync(path.resolve(__dirname, '..', relPath), 'utf8');
    assert.match(
      code,
      /if \(errCode === 'messaging\/registration-token-not-registered'\)/,
      'Must strictly remove only registration-token-not-registered, not invalid-argument'
    );
    assert.doesNotMatch(
      code,
      /errCode\.includes\('invalid-argument'\)/,
      'Must not remove valid tokens on invalid-argument errors'
    );
  });
}
