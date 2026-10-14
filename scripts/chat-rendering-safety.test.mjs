import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const pages = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
];

const sources = await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')]));

test('message timestamps are HTML-escaped in every active chat renderer', () => {
  for (const [file, source] of sources) {
    assert.match(source, /function formatChatTime\(msg\)/, `${file} keeps the dateStr fallback formatter`);
    assert.doesNotMatch(
      source,
      /\$\{\s*(?:time|readTime|delivTime)\s*\}/,
      `${file} must not interpolate a potentially attacker-controlled timestamp directly into HTML`,
    );
    assert.match(source, /\$\{escapeHtml\(time\)\}/, `${file} escapes rendered chat timestamps`);
  }
});

test('reaction keys and chat identifiers are escaped in generated reaction HTML', () => {
  for (const [file, source] of sources) {
    const reactionBlock = source.match(/function buildMessageReactionsHtml\(msg, type, chatId, myId\) \{[\s\S]*?\n        \}/)?.[0];
    assert.ok(reactionBlock, `${file} has the expected reaction renderer`);
    assert.doesNotMatch(
      reactionBlock,
      /\$\{\s*(?:type|chatId|emojiKey)\s*\}/,
      `${file} must not interpolate untrusted reaction data into HTML or inline JavaScript`,
    );
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(chatId\)\}/, `${file} escapes the reaction chat identifier`);
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(emojiKey\)\}/, `${file} escapes the reaction key in inline JavaScript`);
    assert.match(reactionBlock, /\$\{escapeHtml\(emojiKey\)\}/, `${file} escapes the displayed reaction key`);
  }
});
