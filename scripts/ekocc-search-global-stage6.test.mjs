import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  handleSearchRagApi,
  generateRagAnswer,
  checkRateLimit,
  resetZeroCostState,
  getZeroCostTelemetry,
  MAX_REQUESTS_PER_MINUTE
} from '../data/cc-search-rag-service.js';

const ROOT = process.cwd();

test('Stage 6.1: wyszukiwarka declares "Globalna Wyszukiwarka Chrześcijańska" and removes "Centrum Dowodzenia"', () => {
  for (const rel of ['wyszukiwarka.html', 'wyszukiwarka/index.html']) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');

    assert.ok(
      html.includes('<title>Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska</title>'),
      `${rel} has updated <title>`
    );
    assert.ok(
      html.includes('property="og:title" content="Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska"'),
      `${rel} has updated og:title`
    );
    assert.ok(
      html.includes('name="twitter:title" content="Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska"'),
      `${rel} has updated twitter:title`
    );
    assert.ok(
      html.includes('"name": "Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska"'),
      `${rel} has updated Schema.org WebPage name`
    );
    assert.ok(
      html.includes('Globalna Wyszukiwarka Chrześcijańska: Słowo Boże, rozważania, radio, kanały, CCN i LUMINA.'),
      `${rel} has updated og:description`
    );
    assert.equal(
      /centrum dowodzenia/i.test(html),
      false,
      `${rel} must not contain "Centrum Dowodzenia"`
    );
  }

  const omniJs = fs.readFileSync(path.join(ROOT, 'components/cc-omni-search.js'), 'utf8');
  assert.ok(
    omniJs.includes("title: 'Wyszukiwarka Christian Culture — Globalna Wyszukiwarka Chrześcijańska'"),
    'cc-omni-search.js share button uses Globalna Wyszukiwarka Chrześcijańska'
  );
});

test('Stage 6.2: ZERO COST Edge Rate Limiter protects against bot floods (429 after limit)', async () => {
  resetZeroCostState();

  const customMax = 5;
  const env = { AI_ENABLED: 'false', MAX_REQUESTS_PER_MINUTE: String(customMax) };

  // Send 5 allowed requests from same IP
  for (let i = 1; i <= customMax; i++) {
    const req = new Request('https://polskieradio.cc/api/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.77'
      },
      body: JSON.stringify({ question: 'Jak osiągnąć zbawienie?' })
    });
    const res = await handleSearchRagApi(req, env);
    assert.equal(res.status, 200, `Request #${i} allowed`);
    assert.equal(res.headers.get('X-CC-Zero-Cost-Mode'), 'active');
    assert.equal(res.headers.get('X-CC-RateLimit-Remaining'), String(customMax - i));
  }

  // 6th request from same IP must be blocked with 429
  const reqBlocked = new Request('https://polskieradio.cc/api/answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '203.0.113.77'
    },
    body: JSON.stringify({ question: 'Jak osiągnąć zbawienie?' })
  });
  const resBlocked = await handleSearchRagApi(reqBlocked, env);
  assert.equal(resBlocked.status, 429, '6th request blocked by rate limiter');
  assert.equal(resBlocked.headers.get('Retry-After'), '60');
  const bodyBlocked = await resBlocked.json();
  assert.equal(bodyBlocked.error, 'rate_limit_exceeded');
  assert.equal(bodyBlocked.zeroCostGuaranteed, true);

  // Request from a different IP continues to work normally
  const reqOtherIp = new Request('https://polskieradio.cc/api/answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '198.51.100.12'
    },
    body: JSON.stringify({ question: 'J 3:16' })
  });
  const resOtherIp = await handleSearchRagApi(reqOtherIp, env);
  assert.equal(resOtherIp.status, 200, 'Different IP is unaffected');
});

test('Stage 6.3: ZERO COST Daily AI Call Cap automatically switches to deterministic synthesis at 0 PLN', async () => {
  resetZeroCostState();

  let aiInvocations = 0;
  const mockSources = [
    {
      id: 1,
      chunkId: 'rag-zbawienie-jhn-3-16',
      title: 'Ewangelia Jana 3:16 (UBG)',
      url: 'https://polskieradio.cc/wyszukiwarka?q=J+3:16',
      type: 'scripture',
      verses: ['J 3:16'],
      text: 'Tak bowiem Bóg umiłował świat, że dał swego Jednorodzonego Syna...'
    }
  ];

  const envWithCap2 = {
    AI_ENABLED: 'true',
    DAILY_AI_CALL_CAP: '2',
    AI: {
      run: async () => {
        aiInvocations += 1;
        return { response: 'Odpowiedź modelu AI w ramach darmowego limitu [1].' };
      }
    }
  };

  // Call 1 & 2 use Free Tier AI
  const r1 = await generateRagAnswer('Zbawienie', mockSources, envWithCap2);
  const r2 = await generateRagAnswer('Zbawienie', mockSources, envWithCap2);
  assert.equal(aiInvocations, 2, 'First 2 calls used Free Tier AI');
  assert.equal(r1.model, '@cf/zai-org/glm-4.7-flash');
  assert.equal(r2.model, '@cf/zai-org/glm-4.7-flash');

  // Call 3 exceeds daily cap of 2 -> must NOT call AI.run, seamlessly falls back to grounded-zero-cost-v1
  const r3 = await generateRagAnswer('Zbawienie', mockSources, envWithCap2);
  assert.equal(aiInvocations, 2, '3rd call did NOT invoke paid AI');
  assert.equal(r3.mode, 'rag');
  assert.equal(r3.model, 'grounded-zero-cost-v1');
  assert.equal(r3.zeroCostGuaranteed, true);
  assert.ok(r3.answer.includes('[1]'), 'Fallback still provides grounded UBG answer with [1]');
});

test('Stage 6.4: Health endpoint exposes full ZERO COST telemetry and readiness', async () => {
  resetZeroCostState();
  const req = new Request('https://polskieradio.cc/api/search-rag/health', { method: 'GET' });
  const res = await handleSearchRagApi(req, { AI_ENABLED: 'false' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('X-CC-Zero-Cost-Mode'), 'active');

  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.zeroCost.zeroCostGuaranteed, true);
  assert.equal(data.zeroCost.rateLimitPerMinute, MAX_REQUESTS_PER_MINUTE);
  assert.equal(data.zeroCost.fallbackMode, 'grounded-zero-cost-v1');
});
