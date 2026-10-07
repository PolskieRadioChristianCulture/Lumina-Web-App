import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Point at an existing compatible installation. Never install packages or access cloud accounts from this test.
const runtimeRoot = process.env.CC_AI_TEST_RUNTIME_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
test('Workers runtime: real SQLite, RPC, authentication, single-flight and restart', async t => {
  assert.ok(runtimeRoot, 'Set CC_AI_TEST_RUNTIME_ROOT to node_modules containing existing miniflare and esbuild packages.');
  const require = createRequire(path.join(runtimeRoot, 'package.json'));
  const { Miniflare, convertV4MiniflareOptions, Response: RuntimeResponse } = require('miniflare'); const { build } = require('esbuild');
  const runtimeOptions = value => convertV4MiniflareOptions ? convertV4MiniflareOptions(value) : value;
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const b64 = bytes => Buffer.from(bytes).toString('base64url');
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey); jwk.kid = 'runtime-fixture';
  async function token(claims) {
    const value = `${b64(JSON.stringify({ alg: 'RS256', kid: jwk.kid }))}.${b64(JSON.stringify(claims))}`;
    return `${value}.${b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(value)))}`;
  }
  const now = Math.floor(Date.now() / 1000);
  const id = await token({ iss: 'https://securetoken.google.com/runtime-project', aud: 'runtime-project',
    sub: 'runtime-user', iat: now, auth_time: now, exp: now + 3600 });
  const app = await token({ iss: 'https://firebaseappcheck.googleapis.com/123', aud: ['projects/123'],
    sub: 'runtime-app', iat: now, exp: now + 3600 });
  const quota = { rpd: 100, rpm: 100, tpm: 1000000, unitsPerDay: 10000, maxUnitsPerRequest: 1 };
  const registry = { version: 1, revision: 'runtime-v1', providers: [{ id: 'google-ai-studio', enabled: true,
    health: 'HEALTHY', billingAllowed: false, billingDisabled: true, pricingClass: 'FREE_QUOTA',
    verifiedUntil: new Date(Date.now() + 3600000).toISOString() }], models: [
      { id: 'runtime-model', providerId: 'google-ai-studio', capabilities: ['TRANSLATION'], allowedPrivacyClasses: ['PUBLIC'],
        fallbackPriority: 0, maxOutputTokens: 100, estimatedAdditionalCost: 0, timeoutMs: 4000, quota },
      { id: 'quota-model', providerId: 'google-ai-studio', capabilities: ['TRANSLATION'], allowedPrivacyClasses: ['PUBLIC'],
        fallbackPriority: 1, maxOutputTokens: 100, estimatedAdditionalCost: 0, timeoutMs: 4000, quota: { ...quota, rpd: 1 } },
  ] };
  const bundle = await build({ stdin: { contents: `
    import { CcAiSession, CcAiQuota } from './cloudflare/cc-ai-gateway/worker.js';
    import { handleGateway } from './lib/cc-ai-gateway/index.js';
    export { CcAiSession, CcAiQuota };
    export default { async fetch(request, env) {
      if (new URL(request.url).pathname.startsWith('/api/ai')) return handleGateway(request, env);
      const input = await request.json();
      const stub = env.CC_AI_QUOTAS.getByName(input.object);
      if (input.action === 'failure') { await stub.recordFailure(input.model, input.code); return Response.json({ok:true}); }
      return Response.json(await stub.reserve(input.model, 1, 'runtime-v1'));
    }};`, resolveDir: repo }, bundle: true, write: false, format: 'esm', platform: 'browser', external: ['cloudflare:workers'] });
  const persist = await mkdtemp(path.join(tmpdir(), 'cc-ai-runtime-')); let calls = 0;
  const compatibilityDate = process.env.CC_AI_TEST_COMPATIBILITY_DATE || '2026-09-30';
  t.diagnostic(`Local workerd compatibility date: ${compatibilityDate}`);
  const options = { name: 'cc-ai-runtime-test', modules: true, script: bundle.outputFiles[0].text, compatibilityDate,
    durableObjects: { CC_AI_SESSIONS: { className: 'CcAiSession', useSQLite: true }, CC_AI_QUOTAS: { className: 'CcAiQuota', useSQLite: true } },
    resourcePersistencePath: persist, durableObjectsPersist: persist, kvNamespaces: ['CC_AI_CACHE_KV'],
    bindings: { CC_AI_ENABLED: 'true', CC_AI_GATEWAY_ENABLED: 'true', CC_MODEL_ROUTER_ENABLED: 'true', CC_GOOGLE_FREE_AI_ENABLED: 'true',
      CC_FIREBASE_PROJECT_ID: 'runtime-project', CC_FIREBASE_PROJECT_NUMBER: '123', CC_FIREBASE_APP_ID: 'runtime-app',
      CC_GOOGLE_AI_KEY: 'runtime-fixture-credential', CC_AI_REGISTRY_JSON: JSON.stringify(registry) },
    outboundService: async req => {
      if (req.url.includes('/jwk')) return RuntimeResponse.json({ keys: [jwk] });
      if (req.url.includes(':generateContent')) {
        calls++; await new Promise(resolve => setTimeout(resolve, 50));
        return RuntimeResponse.json({ candidates: [{ content: { parts: [{ text: 'runtime OK' }] } }] });
      }
      throw new Error('Unexpected outbound request: blocked');
    },
  };
  let mf = new Miniflare(runtimeOptions(options));
  const command = async value => (await mf.dispatchFetch('https://runtime.invalid/control', {
    method: 'POST', body: JSON.stringify(value), headers: { 'Content-Type': 'application/json' } })).json();
  const complete = async () => mf.dispatchFetch('https://runtime.invalid/api/ai/complete', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${id}`, 'X-Firebase-AppCheck': app },
    body: JSON.stringify({ prompt: 'Translate runtime hello', capability: 'TRANSLATION', privacyClass: 'PUBLIC' }) });
  try {
    await t.test('five authenticated concurrent requests use one upstream call', async () => {
      const responses = await Promise.all(Array.from({ length: 5 }, complete));
      const values = await Promise.all(responses.map(async r => { const value = await r.json(); assert.equal(r.status, 200, JSON.stringify(value)); return value; }));
      assert.equal(calls, 1); assert.equal(values.filter(v => v.cacheHit).length, 4);
    });
    await t.test('atomic SQLite reservation permits only one racing request', async () => {
      const values = await Promise.all(Array.from({ length: 5 }, () => command({ object: 'race', model: 'quota-model' })));
      assert.equal(values.filter(v => v.quota).length, 1); assert.equal(values.filter(v => v.error === 'QUOTA_EXHAUSTED').length, 4);
    });
    await t.test('persistent circuit prevents repeat upstream attempts', async () => {
      await command({ action: 'failure', object: 'circuit', model: 'runtime-model', code: 'PROVIDER_UNAVAILABLE' });
      assert.equal((await command({ object: 'circuit', model: 'runtime-model' })).error, 'PROVIDER_UNAVAILABLE');
    });
    await t.test('session rate limiter rejects request 31', async () => {
      for (let i = 5; i < 30; i++) assert.equal((await complete()).status, 200);
      assert.equal((await complete()).status, 429); assert.equal(calls, 1);
    });
    await mf.dispose(); mf = new Miniflare(runtimeOptions(options));
    await t.test('quota and circuits survive a complete runtime restart', async () => {
      assert.equal((await command({ object: 'race', model: 'quota-model' })).error, 'QUOTA_EXHAUSTED');
      assert.equal((await command({ object: 'circuit', model: 'runtime-model' })).error, 'PROVIDER_UNAVAILABLE');
      assert.equal((await complete()).status, 429);
    });
  } finally {
    await mf.dispose();
    const resolved = path.resolve(persist);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('cc-ai-runtime-'));
    await rm(resolved, { recursive: true, force: true });
  }
});
