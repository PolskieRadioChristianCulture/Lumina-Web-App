import { CcAiError } from './response-normalizer.js';
export async function boundedJson(request, limit = 32768) {
  if (!request.body) throw new CcAiError('INVALID_REQUEST', 400);
  const reader = request.body.getReader(); const chunks = []; let length = 0;
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break;
      length += value.length; if (length > limit) { await reader.cancel(); throw new CcAiError('INVALID_REQUEST', 413); }
      chunks.push(value); }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) { if (e instanceof CcAiError) throw e; throw new CcAiError('INVALID_REQUEST', 400); }
  finally { reader.releaseLock(); }
}
export function validateRequest(body, identity) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new CcAiError('INVALID_REQUEST', 400);
  if (body.userId !== undefined && body.userId !== identity.uid) throw new CcAiError('IDENTITY_MISMATCH', 403);
  if (body.tools || body.tool || body.actions || body.publish) throw new CcAiError('TOOLS_DISABLED', 403);
  const keys = new Set(['prompt', 'capability', 'privacyClass', 'model', 'userId', 'glossary', 'targetLanguage']);
  if (Object.keys(body).some(key => !keys.has(key)) || typeof body.prompt !== 'string' ||
      !body.prompt.trim() || body.prompt.length > 12000 ||
      !['TEXT_GENERATION', 'TRANSLATION', 'CODING', 'CLASSIFICATION', 'ROUTING'].includes(body.capability) ||
      body.privacyClass !== 'PUBLIC' || (body.glossary !== undefined && (typeof body.glossary !== 'string' || body.glossary.length > 2000)) ||
      (body.targetLanguage !== undefined && (typeof body.targetLanguage !== 'string' || body.targetLanguage.length > 80)) ||
      (body.model !== undefined && (typeof body.model !== 'string' || body.model.length > 120)))
    throw new CcAiError('INVALID_REQUEST', 400);
  if (/(ignore\s+(all\s+)?(previous\s+)?instructions|leak.{0,30}(key|secret)|dump.{0,30}(env|secret)|wypisz.{0,30}(sekret|klucz))/i.test(body.prompt))
    throw new CcAiError('SAFETY_BLOCK', 403);
  return { prompt: body.prompt, capability: body.capability, privacyClass: 'PUBLIC',
    model: body.model, glossary: body.glossary || '', targetLanguage: body.targetLanguage || '', userId: identity.uid };
}
export function sanitizeOutput(text, env) {
  for (const name of ['CC_GOOGLE_AI_KEY', 'CC_GROQ_AI_KEY', 'CC_LOCAL_AI_TOKEN']) {
    const secret = env[name];
    if (typeof secret === 'string' && secret.length >= 8 && text.includes(secret)) throw new CcAiError('SAFETY_BLOCK', 403);
  }
  if (/(AIza[\w-]{30,}|gsk_[\w]{20,}|sk-[\w-]{20,}|-----BEGIN .*PRIVATE KEY-----)/.test(text))
    throw new CcAiError('SAFETY_BLOCK', 403);
  return text;
}
