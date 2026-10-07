import { DurableObject } from 'cloudflare:workers';
import { createGateway, hash } from '../../lib/cc-ai-gateway/index.js';
import { QuotaController } from '../../lib/cc-ai-gateway/quota-controller.js';
import { loadRegistry } from '../../lib/cc-ai-gateway/config-registry.js';
import { financialGuard } from '../../lib/cc-ai-gateway/financial-circuit-breaker.js';
import { CcAiError } from '../../lib/cc-ai-gateway/response-normalizer.js';

export class CcAiSession extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.gateway = createGateway(env, { storage: ctx.storage,
      reserve: async (model, inputTokens, revision) => {
        // Account-wide pool: models must never each spend the same shared free allowance.
        const name = await hash({ provider: model.providerId });
        const result = await env.CC_AI_QUOTAS.getByName(name).reserve(model.id, inputTokens, revision);
        if (result.error) throw new CcAiError(result.error, result.error === 'RATE_LIMIT' ? 429 : 503);
        return result.quota;
      }, recordFailure: async (model, code) => {
        const name = await hash({ provider: model.providerId });
        await env.CC_AI_QUOTAS.getByName(name).recordFailure(model.id, code);
      }, emit: event => console.log(JSON.stringify(event)),
    });
  }
  fetch(request) { return this.gateway.fetch(request); }
}
export class CcAiQuota extends DurableObject {
  async recordFailure(modelId, code) {
    const registry = await loadRegistry(this.env);
    if (registry.models.some(m => m.id === modelId)) await new QuotaController(this.ctx.storage).recordFailure(modelId, code);
  }
  async reserve(modelId, inputTokens, revision) {
    try {
      if (!Number.isSafeInteger(inputTokens) || inputTokens < 1 || inputTokens > 100000) throw new CcAiError('INVALID_REQUEST');
      const registry = await loadRegistry(this.env);
      if (registry.revision !== revision) throw new CcAiError('REGISTRY_CHANGED');
      const model = registry.models.find(m => m.id === modelId);
      const provider = registry.providers.find(p => p.id === model?.providerId);
      financialGuard(provider, model, { costUsd: 0, costPln: 0, isFree: true });
      const quota = await new QuotaController(this.ctx.storage).reserve(model, inputTokens);
      return { quota };
    } catch (error) { return { error: error instanceof CcAiError ? error.code : 'COORDINATOR_UNAVAILABLE' }; }
  }
}
// No public access to coordinator RPC or raw user data.
export default { fetch() { return new Response('Not Found', { status: 404 }); } };
