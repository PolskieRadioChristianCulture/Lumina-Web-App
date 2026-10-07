import { PROVIDERS } from './financial-circuit-breaker.js';
export function candidates(registry, request, flags) {
  return registry.models.filter(m => {
    const p = registry.providers.find(p => p.id === m.providerId);
    return p?.enabled === true && flags[PROVIDERS[p.id]] === true &&
      ['HEALTHY', 'DEGRADED', 'QUOTA_WARNING'].includes(p.health) &&
      m.capabilities.includes(request.capability) && m.allowedPrivacyClasses.includes(request.privacyClass) &&
      (!request.model || request.model === m.id);
  }).sort((a, b) => a.fallbackPriority - b.fallbackPriority);
}
