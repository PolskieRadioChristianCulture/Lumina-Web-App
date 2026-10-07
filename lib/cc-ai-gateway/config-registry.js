import { CcAiError } from './response-normalizer.js';
export async function loadRegistry(env) {
  // No mutable global cache: every execution checks the current registry snapshot.
  const raw = env.CC_AI_REGISTRY_KV ? await env.CC_AI_REGISTRY_KV.get('registry:v1') : env.CC_AI_REGISTRY_JSON;
  if (typeof raw !== 'string' || raw.length > 100000) throw new CcAiError('REGISTRY_UNAVAILABLE');
  let value;
  try { value = JSON.parse(raw); } catch { throw new CcAiError('REGISTRY_INVALID'); }
  if (value.version !== 1 || typeof value.revision !== 'string' || !value.revision ||
      !Array.isArray(value.providers) || !Array.isArray(value.models) ||
      value.providers.length > 16 || value.models.length > 100)
    throw new CcAiError('REGISTRY_INVALID');
  const ids = new Set();
  for (const p of value.providers) {
    if (typeof p.id !== 'string' || ids.has(p.id)) throw new CcAiError('REGISTRY_INVALID');
    ids.add(p.id);
  }
  const models = new Set();
  for (const m of value.models) {
    if (typeof m.id !== 'string' || !/^[\w@./:-]{1,120}$/.test(m.id) || models.has(m.id) || !ids.has(m.providerId) ||
        !Array.isArray(m.capabilities) || !Array.isArray(m.allowedPrivacyClasses) ||
        !Number.isFinite(m.fallbackPriority) || !Number.isSafeInteger(m.maxOutputTokens) || m.maxOutputTokens < 1 ||
        m.maxOutputTokens > 4096 || !Number.isSafeInteger(m.timeoutMs) || m.timeoutMs < 1 || m.timeoutMs > 15000)
      throw new CcAiError('REGISTRY_INVALID');
    models.add(m.id);
  }
  return value;
}
