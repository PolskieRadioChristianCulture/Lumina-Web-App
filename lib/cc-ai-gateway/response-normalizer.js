export class CcAiError extends Error {
  constructor(code, status = 503) { super(code); this.code = code; this.status = status; }
}
export function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex',
  }});
}
export function errorResponse(error, requestId) {
  return json({ success: false, requestId, error: {
    code: error instanceof CcAiError ? error.code : 'UNKNOWN_PROVIDER_ERROR',
    message: error instanceof CcAiError ? error.code : 'Gateway unavailable',
  }}, error instanceof CcAiError ? error.status : 503);
}
export function normalize(text, usage, request, provider, model, latencyMs) {
  if (typeof text !== 'string' || !text.trim() || text.length > 64000)
    throw new CcAiError('UNKNOWN_PROVIDER_ERROR');
  const inputTokens = Number.isSafeInteger(usage?.inputTokens) && usage.inputTokens >= 0 ? usage.inputTokens : 0;
  const outputTokens = Number.isSafeInteger(usage?.outputTokens) && usage.outputTokens >= 0 ? usage.outputTokens : 0;
  return { requestId: request.requestId, provider: provider.id, model: model.id,
    status: 'SUCCESS', content: { text }, usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
    quota: { remainingToday: 'UNKNOWN' }, latencyMs, costClass: provider.pricingClass,
    cacheHit: false, fallbackUsed: false, guardResults: {
      theologyChecked: false, bibleQuotesVerified: false, sanitized: true,
    }, timestamp: new Date().toISOString(), generatedBy: 'AI' };
}
