/* Cloudflare Worker module. Integrate into the EXISTING Worker; not a replacement.
 * Required adapters verify existing LUMINA sessions and trusted payment evidence.
 * Missing adapters fail closed. Browser requests can NEVER confirm a donation.
 */
const sources = new Set(['patronite', 'youtube', 'bank', 'blik', 'revolut', 'zrzutka']);
const origin = 'https://polskieradio.cc';
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
function normalizeName(value) {
  return String(value || '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>]/g, '').trim().slice(0, 60);
}
function validEvent(event) {
  return event && sources.has(event.source) && ['sourceEventId', 'supporterUid', 'evidenceRef'].every(key => typeof event[key] === 'string' && event[key].trim() && event[key].length <= 200);
}

// Call ONLY from a server-side importer after cryptographic/provider validation,
// or verified owner review. Never expose this as an unprotected web endpoint.
export async function recordVerifiedSupport(env, event, adapter) {
  if (!env.CC_SUPPORT_DB || !validEvent(event) || typeof adapter?.verifySupportEvidence !== 'function') throw new Error('Verified evidence adapter required');
  const proof = await adapter.verifySupportEvidence(event);
  if (!proof || proof.verified !== true || proof.source !== event.source || proof.sourceEventId !== event.sourceEventId || proof.supporterUid !== event.supporterUid || typeof proof.verifiedBy !== 'string' || !proof.verifiedBy.trim()) throw new Error('Support evidence not confirmed');
  // INSERT OR IGNORE makes repeat webhook/import deliveries idempotent.
  return env.CC_SUPPORT_DB.prepare('INSERT OR IGNORE INTO cc_verified_support (source,source_event_id,supporter_uid,evidence_ref,confirmed_by,confirmed_at) VALUES (?,?,?,?,?,?)').bind(event.source,event.sourceEventId,event.supporterUid,event.evidenceRef,proof.verifiedBy,new Date().toISOString()).run();
}

export async function revokeVerifiedSupport(env, source, sourceEventId) {
  if (!sources.has(source) || typeof sourceEventId !== 'string') throw new Error('Invalid event');
  return env.CC_SUPPORT_DB.prepare('UPDATE cc_verified_support SET revoked=1 WHERE source=? AND source_event_id=?').bind(source,sourceEventId).run();
}

export async function handleSupportApi(request, env, adapter) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/cc-support/')) return null;
  if (!env.CC_SUPPORT_DB) return json({error:'Integration unavailable'},503);
  try {
    if (url.pathname === '/api/cc-support/thanks' && request.method === 'GET') {
      const result = await env.CC_SUPPORT_DB.prepare(`SELECT p.public_name,p.consent,p.anonymous_consent,s.source,MAX(s.confirmed_at) AS recent
        FROM cc_verified_support s JOIN cc_support_preferences p ON p.uid=s.supporter_uid
        WHERE s.revoked=0 AND ((p.consent=1 AND p.public_name<>'') OR p.anonymous_consent=1)
        GROUP BY p.uid,s.source ORDER BY recent DESC LIMIT 50`).all();
      const labels = {patronite:'patronat w Patronite',youtube:'wsparcie na YouTube',bank:'dar misyjny',blik:'dar misyjny',revolut:'dar misyjny',zrzutka:'wsparcie zbiórki'};
      const items = [];
      const seen = new Set();
      for (const row of result.results || []) {
        const name = normalizeName(row.public_name);
        if (!labels[row.source]) continue;
        const anonymousLabels = {patronite:'Dziękujemy anonimowym patronom z Patronite.',youtube:'Dziękujemy anonimowym wspierającym na YouTube.',bank:'Dziękujemy anonimowym darczyńcom misji.',blik:'Dziękujemy anonimowym darczyńcom misji.',revolut:'Dziękujemy anonimowym darczyńcom misji.',zrzutka:'Dziękujemy anonimowym wspierającym zbiórki.'};
        if (row.anonymous_consent !== 1 && !name) continue;
        const text = row.anonymous_consent === 1 ? anonymousLabels[row.source] : 'Dziękujemy: ' + name + ' — ' + labels[row.source] + '.';
        if (!seen.has(text)) { seen.add(text); items.push({text}); }
      }
      // Return no uid, email, bank details, amounts, or evidence identifiers.
      return json({items});
    }
    if (typeof adapter?.verifySession !== 'function') return json({error:'LUMINA session adapter unavailable'},503);
    // Adapter must validate issuer, audience, signature and expiry of tokens,
    // or server-managed session cookies. Never trust an email sent by the client.
    const session = await adapter.verifySession(request);
    if (!session || typeof session.uid !== 'string' || !session.uid.trim()) return json({authenticated:false},401);
    if (url.pathname === '/api/cc-support/session' && request.method === 'GET') {
      if (typeof adapter.createCsrfToken !== 'function') return json({error:'Session integration incomplete'},503);
      const preference = await env.CC_SUPPORT_DB.prepare('SELECT public_name,consent,anonymous_consent FROM cc_support_preferences WHERE uid=?').bind(session.uid).first();
      return json({authenticated:true,publicName:preference?.public_name || '',consent:preference?.consent===1,anonymousConsent:preference?.anonymous_consent===1,csrfToken:await adapter.createCsrfToken(session)});
    }
    if (url.pathname === '/api/cc-support/consent' && request.method === 'PUT') {
      if (request.headers.get('Origin') !== origin || !request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Invalid origin or content type'},403);
      if (typeof adapter.verifyCsrfToken !== 'function' || await adapter.verifyCsrfToken(session,request.headers.get('X-CC-CSRF')) !== true) return json({error:'Invalid CSRF token'},403);
      if (Number(request.headers.get('Content-Length') || 0) > 4096) return json({error:'Payload too large'},413);
      const raw = await request.text();
      if (raw.length > 4096) return json({error:'Payload too large'},413);
      let body;
      try { body=JSON.parse(raw); } catch { return json({error:'Invalid JSON'},400); }
      if (!body || typeof body.consent !== 'boolean' || typeof body.anonymousConsent !== 'boolean' || (body.consent && body.anonymousConsent)) return json({error:'Invalid consent'},400);
      const name = normalizeName(body.publicName);
      if (body.consent && !name) return json({error:'Public name required'},400);
      await env.CC_SUPPORT_DB.prepare(`INSERT INTO cc_support_preferences (uid,public_name,consent,anonymous_consent,consent_updated_at) VALUES (?,?,?,?,?)
        ON CONFLICT(uid) DO UPDATE SET public_name=excluded.public_name,consent=excluded.consent,anonymous_consent=excluded.anonymous_consent,consent_updated_at=excluded.consent_updated_at`).bind(session.uid,body.consent?name:'',body.consent?1:0,body.anonymousConsent?1:0,new Date().toISOString()).run();
      return json({saved:true});
    }
    return json({error:'Not found'},404);
  } catch { return json({error:'Service temporarily unavailable'},503); }
}
