import { CcAiError } from './response-normalizer.js';
const validLimit = n => Number.isSafeInteger(n) && n > 0;
// Runs inside one Durable Object per provider account. Never use eventually-consistent KV counters.
export class QuotaController {
  constructor(storage, now = Date.now) { this.storage = storage; this.now = now; }
  async reserve(model, inputTokens) {
    const q = model.quota;
    if (!q || !['rpd', 'rpm', 'tpm', 'unitsPerDay', 'maxUnitsPerRequest'].every(k => validLimit(q[k])))
      throw new CcAiError('QUOTA_UNKNOWN');
    const tokens = inputTokens + model.maxOutputTokens;
    return this.storage.transaction(async tx => {
      const now = this.now(); const day = Math.floor(now / 86400000); const minute = Math.floor(now / 60000);
      const circuit = await tx.get(`circuit:${model.id}`);
      if (circuit?.until > now) throw new CcAiError(circuit.code);
      const old = await tx.get('usage') || {};
      const state = { day, minute, daily: old.day === day ? old.daily || 0 : 0,
        units: old.day === day ? old.units || 0 : 0,
        requests: old.minute === minute ? old.requests || 0 : 0,
        tokens: old.minute === minute ? old.tokens || 0 : 0 };
      if (state.daily + 1 > q.rpd || state.units + q.maxUnitsPerRequest > q.unitsPerDay)
        throw new CcAiError('QUOTA_EXHAUSTED');
      if (state.requests + 1 > q.rpm || state.tokens + tokens > q.tpm) throw new CcAiError('RATE_LIMIT', 429);
      state.daily++; state.requests++; state.tokens += tokens; state.units += q.maxUnitsPerRequest;
      // Reservations are never refunded after errors or timeout: upstream work may still have happened.
      await tx.put('usage', state);
      return { remainingToday: q.rpd - state.daily, resetTimeIso: new Date((day + 1) * 86400000).toISOString() };
    });
  }
  async recordFailure(modelId, code) {
    const durations = { RATE_LIMIT: 60000, PROVIDER_UNAVAILABLE: 300000, TIMEOUT: 300000,
      AUTH_ERROR: 300000, MODEL_UNAVAILABLE: 300000, NETWORK_ERROR: 300000 };
    if (!durations[code]) return;
    await this.storage.put(`circuit:${modelId}`, { code, until: this.now() + durations[code] });
  }
}
export async function userRateLimit(storage, now = Date.now()) {
  if (!storage?.transaction) throw new CcAiError('COORDINATOR_UNAVAILABLE');
  return storage.transaction(async tx => {
    const minute = Math.floor(now / 60000); const old = await tx.get('rate') || {};
    const count = old.minute === minute ? old.count : 0;
    if (count >= 30) throw new CcAiError('RATE_LIMIT', 429);
    await tx.put('rate', { minute, count: count + 1 });
  });
}
