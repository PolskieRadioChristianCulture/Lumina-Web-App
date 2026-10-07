import { CcAiError } from './response-normalizer.js';
const decode = value => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), c => c.charCodeAt(0));
};
export async function verifyJwt(token, { audience, issuer, jwksUrl, subject }, fetcher = fetch) {
  try {
    if (!audience || !issuer || typeof token !== 'string' || token.length > 16000) throw 0;
    const parts = token.split('.');
    if (parts.length !== 3) throw 0;
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const now = Date.now() / 1000;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || claims.iss !== issuer ||
        !(claims.aud === audience || (Array.isArray(claims.aud) && claims.aud.includes(audience))) ||
        !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now ||
        (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now)) ||
        typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128 ||
        (subject && !subject(claims))) throw 0;
    const result = await fetcher(jwksUrl, { signal: AbortSignal.timeout(4000), redirect: 'manual' });
    if (!result.ok) throw 0;
    const keys = (await result.json()).keys;
    const jwk = keys?.find(k => k.kid === header.kid && k.kty === 'RSA');
    if (!jwk) throw 0;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(parts.slice(0, 2).join('.')))) throw 0;
    return claims;
  } catch { throw new CcAiError('INVALID_TOKEN', 403); }
}
export async function verifyIdentity(request, env, fetcher = fetch) {
  const match = /^Bearer ([^\s]+)$/.exec(request.headers.get('Authorization') || '');
  if (!match) throw new CcAiError('AUTH_REQUIRED', 401);
  const project = env.CC_FIREBASE_PROJECT_ID;
  const claims = await verifyJwt(match[1], { audience: project,
    issuer: `https://securetoken.google.com/${project}`,
    jwksUrl: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    subject: c => Number.isFinite(c.auth_time) && c.auth_time <= Date.now() / 1000,
  }, fetcher);
  let appIds;
  try { appIds = env.CC_FIREBASE_APP_IDS_JSON === undefined ? [env.CC_FIREBASE_APP_ID] : JSON.parse(env.CC_FIREBASE_APP_IDS_JSON); }
  catch { throw new CcAiError('AUTH_CONFIG_MISSING'); }
  if (!env.CC_FIREBASE_PROJECT_NUMBER || !Array.isArray(appIds) || !appIds.length || appIds.length > 10 ||
      appIds.some(id => typeof id !== 'string' || !id || id.length > 128)) throw new CcAiError('AUTH_CONFIG_MISSING');
  const app = await verifyJwt(request.headers.get('X-Firebase-AppCheck'), {
    audience: `projects/${env.CC_FIREBASE_PROJECT_NUMBER}`,
    issuer: `https://firebaseappcheck.googleapis.com/${env.CC_FIREBASE_PROJECT_NUMBER}`,
    jwksUrl: 'https://firebaseappcheck.googleapis.com/v1/jwks',
    subject: c => appIds.includes(c.sub),
  }, fetcher);
  return { uid: claims.sub, appId: app.sub };
}
