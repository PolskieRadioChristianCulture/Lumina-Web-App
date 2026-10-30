import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMimeMessage,
  resolveSenderAccount,
  GMAIL_ACCOUNTS,
} from '../services/cc-newsletter/gmail-smtp-client.js';

test('Gmail SMTP: resolveSenderAccount wybiera radiochristianculture jako nadawcę transakcyjnego', () => {
  const { primary, fallback } = resolveSenderAccount({}, 'doi_confirm');
  assert.equal(primary.email, 'radiochristianculture@gmail.com');
  assert.equal(fallback.email, 'polskiercctv@gmail.com');
  assert.ok(primary.pass.length >= 16);
  assert.ok(fallback.pass.length >= 16);
});

test('Gmail SMTP: buildMimeMessage generuje poprawny nagłówek MIME z kodowaniem UTF-8 i Base64', () => {
  const { raw, msgId } = buildMimeMessage({
    fromEmail: 'radiochristianculture@gmail.com',
    fromName: 'Polskie Radio Christian Culture',
    toEmail: 'odbiorca@example.com',
    subject: 'Witaj w Rodzinie CC — Potwierdź swój zapis',
    text: 'Cześć! Potwierdź swój zapis.',
    html: '<p>Cześć! Potwierdź swój zapis.</p>',
    headers: {
      'List-Unsubscribe': '<https://polskieradio.cc/newsletter/unsubscribe>',
    },
  });

  assert.ok(raw.includes('From: "Polskie Radio Christian Culture" <radiochristianculture@gmail.com>'));
  assert.ok(raw.includes('To: <odbiorca@example.com>'));
  assert.ok(raw.includes('MIME-Version: 1.0'));
  assert.ok(raw.includes('List-Unsubscribe: <https://polskieradio.cc/newsletter/unsubscribe>'));
  assert.ok(raw.includes('multipart/alternative'));
  assert.ok(raw.endsWith('\r\n.\r\n'));
  assert.ok(msgId.includes('@polskieradio.cc'));
});
