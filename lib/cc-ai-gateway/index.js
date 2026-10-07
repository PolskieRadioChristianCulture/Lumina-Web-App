import { enabled, flags } from './feature-flags.js';
import { CcAiError, json, errorResponse } from './response-normalizer.js';
import { verifyIdentity } from './auth-verifier.js';
import { boundedJson, validateRequest, sanitizeOutput } from './security-guard.js';
import { loadRegistry } from './config-registry.js';
import { candidates } from './capability-router.js';
import { financialGuard } from './financial-circuit-breaker.js';
import { userRateLimit } from './quota-controller.js';
import { GoogleFreeAdapter } from './adapters/google-free-adapter.js';
import { GroqFreeAdapter } from './adapters/groq-free-adapter.js';
import { CloudflareAiAdapter } from './adapters/cloudflare-ai-adapter.js';
import { LocalWorkstationAdapter } from './adapters/local-workstation-adapter.js';
const adapters = { 'google-ai-studio': GoogleFreeAdapter, 'groq-cloud': GroqFreeAdapter,
  'cloudflare-workers-ai': CloudflareAiAdapter, 'cc-local': LocalWorkstationAdapter };
const retryable = new Set(['RATE_LIMIT', 'QUOTA_EXHAUSTED', 'QUOTA_UNKNOWN', 'PROVIDER_UNAVAILABLE',
  'TIMEOUT', 'AUTH_ERROR', 'MODEL_UNAVAILABLE', 'NETWORK_ERROR', 'UNKNOWN_PROVIDER_ERROR']);
export async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
}
async function timeout(operation, milliseconds, controller) {
  let timer;
  try { return await Promise.race([operation, new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new CcAiError('TIMEOUT')); }, milliseconds);
  })]); } finally { clearTimeout(timer); }
}
// One instance per user Durable Object; tests may inject transport, verifier and atomic storage.
export function createGateway(env, { storage, reserve, verify = verifyIdentity, fetcher = fetch,
  adapterFactory = (p, m) => new adapters[p.id](p, m, env, fetcher), emit = () => {}, recordFailure = async () => {} } = {}) {
  const inflight = new Map();
  async function generate(input, registry, requestId) {
    const routes = candidates(registry, input, flags(env)); let attempted = 0;
    for (const model of routes) {
      const provider = registry.providers.find(p => p.id === model.providerId);
      const adapter = adapterFactory(provider, model);
      // Financial failure stops the whole request, including fallback.
      financialGuard(provider, model, adapter.estimateCost(input));
      try {
        if (!reserve) throw new CcAiError('COORDINATOR_UNAVAILABLE');
        const quota = await reserve(model, new TextEncoder().encode(JSON.stringify(input)).length + 1024, registry.revision);
        const controller = new AbortController();
        const result = await timeout(adapter.execute({ ...input, requestId }, controller.signal), model.timeoutMs, controller);
        result.content.text = sanitizeOutput(result.content.text, env);
        const primaryPriority = Math.min(...registry.models.filter(m => m.capabilities.includes(input.capability) &&
          m.allowedPrivacyClasses.includes(input.privacyClass)).map(m => m.fallbackPriority));
        result.quota = quota; result.fallbackUsed = attempted > 0 || model.fallbackPriority > primaryPriority;
        result.status = result.fallbackUsed ? 'FALLBACK_SUCCESS' : 'SUCCESS';
        return result;
      } catch (error) {
        if (!(error instanceof CcAiError) || !retryable.has(error.code)) throw error;
        await recordFailure(model, error.code);
        emit({ event: 'cc_ai_fallback', provider: provider.id, model: model.id, code: error.code, requestId });
        attempted++;
      }
    }
    throw new CcAiError('SAFE_DEGRADED_MODE');
  }
  return { async fetch(request) {
    const requestId = crypto.randomUUID();
    const start = Date.now();
    try {
      if (!enabled(env)) throw new CcAiError('GATEWAY_DISABLED');
      if (new URL(request.url).pathname !== '/api/ai/complete') throw new CcAiError('NOT_FOUND', 404);
      if (request.method !== 'POST') throw new CcAiError('METHOD_NOT_ALLOWED', 405);
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new CcAiError('INVALID_REQUEST', 415);
      const identity = await verify(request, env, fetcher);
      const input = validateRequest(await boundedJson(request), identity);
      sanitizeOutput(input.prompt + input.glossary, env);
      await userRateLimit(storage);
      const registry = await loadRegistry(env);
      if (input.model) {
        const m = registry.models.find(m => m.id === input.model);
        if (!m) throw new CcAiError('FINANCIAL_BLOCK', 403);
        financialGuard(registry.providers.find(p => p.id === m.providerId), m, { costUsd: 0, costPln: 0, isFree: true });
      }
      const key = `cc-ai:v1:${await hash({ ...input, revision: registry.revision })}`;
      let cached;
      try { cached = await env.CC_AI_CACHE_KV?.get(key); } catch { /* A cache outage must not bypass quota reservation. */ }
      if (cached) {
        try {
          const value = JSON.parse(cached);
          const age = Date.now() - Date.parse(value.timestamp);
          if (!Number.isFinite(age) || age < 0 || age >= 86400000) throw 0;
          const m = registry.models.find(m => m.id === value.model);
          const p = registry.providers.find(p => p.id === value.provider);
          financialGuard(p, m, { costUsd: 0, costPln: 0, isFree: true });
          if (!candidates(registry, input, flags(env)).some(route => route.id === m.id)) throw 0;
          sanitizeOutput(value.content.text, env);
          return json({ ...value, requestId, cacheHit: true, latencyMs: Date.now() - start });
        } catch (error) { if (error instanceof CcAiError && error.code === 'FINANCIAL_BLOCK') throw error; }
      }
      const shared = inflight.has(key);
      if (!shared) {
        const operation = (async () => {
          const value = await generate(input, registry, requestId);
          try { await env.CC_AI_CACHE_KV?.put(key, JSON.stringify(value), { expirationTtl: 86400 }); } catch { /* Best effort, bounded cache. */ }
          return value;
        })();
        inflight.set(key, operation);
      }
      const operation = inflight.get(key);
      try { return json({ ...await operation, requestId, cacheHit: shared }); }
      finally { if (!shared) inflight.delete(key); }
    } catch (error) { return errorResponse(error, requestId); }
  }};
}
// Pages edge delegates enabled traffic to user-scoped coordinator; no cloud resources are created here.
export async function handleGateway(request, env) {
  const requestId = crypto.randomUUID();
  try {
    if (!enabled(env)) throw new CcAiError('GATEWAY_DISABLED');
    if (!env.CC_AI_SESSIONS) throw new CcAiError('COORDINATOR_UNAVAILABLE');
    const identity = await verifyIdentity(request, env);
    const name = await hash({ uid: identity.uid, appId: identity.appId });
    return await env.CC_AI_SESSIONS.getByName(name).fetch(request);
  } catch (error) { return errorResponse(error, requestId); }
}
