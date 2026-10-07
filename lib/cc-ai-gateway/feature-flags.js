export const CC_AI_FEATURE_FLAGS = Object.freeze(Object.fromEntries([
  'CC_AI_ENABLED', 'CC_AI_GATEWAY_ENABLED', 'CC_MODEL_ROUTER_ENABLED',
  'CC_PAID_AI_ENABLED', 'CC_GOOGLE_FREE_AI_ENABLED', 'CC_GROQ_FREE_AI_ENABLED',
  'CC_CF_WORKERS_AI_ENABLED', 'CC_LOCAL_AI_ENABLED', 'CC_OPENAI_ENABLED',
  'CC_ANTHROPIC_ENABLED', 'CC_MCP_ENABLED', 'CC_A2A_ENABLED', 'CC_AGENTS_ENABLED',
  'CC_WRITE_ACTIONS_ENABLED', 'CC_AUTONOMOUS_PUBLISHING_ENABLED',
].map(key => [key, false])));
const locked = new Set(['CC_PAID_AI_ENABLED', 'CC_OPENAI_ENABLED', 'CC_ANTHROPIC_ENABLED',
  'CC_MCP_ENABLED', 'CC_A2A_ENABLED', 'CC_AGENTS_ENABLED', 'CC_WRITE_ACTIONS_ENABLED',
  'CC_AUTONOMOUS_PUBLISHING_ENABLED']);
export function flags(env) {
  return Object.fromEntries(Object.keys(CC_AI_FEATURE_FLAGS).map(key =>
    [key, !locked.has(key) && (env[key] === true || env[key] === 'true')]));
}
export function enabled(env) {
  const f = flags(env);
  return f.CC_AI_ENABLED && f.CC_AI_GATEWAY_ENABLED && f.CC_MODEL_ROUTER_ENABLED;
}
