import { CcAiError } from './response-normalizer.js';
export const PROVIDERS = Object.freeze({
  'google-ai-studio': 'CC_GOOGLE_FREE_AI_ENABLED', 'groq-cloud': 'CC_GROQ_FREE_AI_ENABLED',
  'cloudflare-workers-ai': 'CC_CF_WORKERS_AI_ENABLED', 'cc-local': 'CC_LOCAL_AI_ENABLED',
});
export function financialGuard(provider, model, estimate, now = Date.now()) {
  if (!provider || !model || model.providerId !== provider.id || !Object.hasOwn(PROVIDERS, provider.id) || provider.billingAllowed !== false ||
      provider.billingDisabled !== true || !['FREE', 'FREE_QUOTA', 'ALREADY_COVERED'].includes(provider.pricingClass) ||
      !(Date.parse(provider.verifiedUntil) > now) || model.estimatedAdditionalCost !== 0 ||
      estimate?.costUsd !== 0 || estimate?.costPln !== 0 || estimate?.isFree !== true)
    throw new CcAiError('FINANCIAL_BLOCK', 403);
}
