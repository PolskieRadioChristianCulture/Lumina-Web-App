/* Cloudflare Worker handler for Biblijne Uwielbienie Voting API.
   Integrated into _worker.js via handleBUApi(request, env).
   Supports D1 binding as env.bu_votes_db or env.BU_VOTES_DB.
   Verifies Google/Firebase ID tokens for project lumina-cc.
*/
export async function handleBUApi(request, env) {
  const path = new URL(request.url).pathname;
  const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });

  const db = env.bu_votes_db || env.BU_VOTES_DB;
  const projectId = env.FIREBASE_PROJECT_ID || 'lumina-cc';
  const assets = env.ASSETS;

  if (!db || !projectId || !assets) {
    return json({ error: 'Brak konfiguracji bazy bu_votes_db, projektu Firebase lub zasobów ASSETS.' }, 503);
  }

  try {
    const match = path.match(/^\/api\/bu\/v1\/votes\/([A-Z]{3}-\d{3})$/);

    // 1. GET ranking
    if (request.method === 'GET' && path === '/api/bu/v1/ranking') {
      const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get('limit')) || 100));
      const rows = await db.prepare('SELECT chapter_id AS chapterId, COUNT(*) AS votes FROM bu_votes GROUP BY chapter_id ORDER BY votes DESC, chapter_id ASC LIMIT ?').bind(limit).all();
      return json({ items: rows.results || [] });
    }

    // 2. GET my-votes
    if (request.method === 'GET' && path === '/api/bu/v1/my-votes') {
      const uid = await verifyFirebaseUser(request, projectId);
      const rows = await db.prepare('SELECT chapter_id FROM bu_votes WHERE user_id=? ORDER BY chapter_id').bind(uid).all();
      return json({ chapterIds: (rows.results || []).map(row => row.chapter_id) });
    }

    // 3. PUT/DELETE vote
    if (match && (request.method === 'PUT' || request.method === 'DELETE')) {
      const chapterId = match[1];
      const uid = await verifyFirebaseUser(request, projectId);

      // Only tracks confirmed on the actual published playlist can receive votes.
      const source = await assets.fetch(new URL('/data/biblijne-uwielbienie-playlist.json', request.url));
      if (!source.ok) return json({ error: 'Nie można zweryfikować rejestru opublikowanych utworów.' }, 503);
      const list = await source.json();
      if (!Array.isArray(list.items) || !list.items.some(t => t.chapterId === chapterId && /^[\w-]{11}$/.test(t.videoId || ''))) {
        return json({ error: 'Ten rozdział nie ma potwierdzonej publikacji.' }, 404);
      }

      if (request.method === 'PUT') {
        await db.prepare('INSERT OR IGNORE INTO bu_votes(chapter_id, user_id, created_at) VALUES(?, ?, ?)').bind(chapterId, uid, new Date().toISOString()).run();
      } else {
        await db.prepare('DELETE FROM bu_votes WHERE chapter_id=? AND user_id=?').bind(chapterId, uid).run();
      }

      const score = await db.prepare('SELECT COUNT(*) AS n FROM bu_votes WHERE chapter_id=?').bind(chapterId).first();
      return json({ chapterId, votes: score?.n || 0, voted: request.method === 'PUT' });
    }

    return json({ error: 'Nieznana ścieżka lub metoda.' }, 404);
  } catch (error) {
    const s = error?.status || 500;
    return json({ error: s === 401 ? 'Zaloguj się do LUMINA.' : s === 403 ? 'Brak dostępu.' : 'Błąd serwera.' }, s);
  }
}

async function verifyFirebaseUser(request, projectId) {
  const fail = (status) => { const e = new Error('Unauthorized'); e.status = status; throw e; };
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) fail(401);
  const token = header.slice(7);
  const parts = token.split('.');
  if (parts.length !== 3) fail(401);

  const decode = (s) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')));
  let head, claims;
  try {
    head = decode(parts[0]);
    claims = decode(parts[1]);
  } catch {
    fail(401);
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    head.alg !== 'RS256' ||
    !head.kid ||
    claims.aud !== projectId ||
    claims.iss !== `https://securetoken.google.com/${projectId}` ||
    typeof claims.sub !== 'string' ||
    !claims.sub ||
    claims.sub.length > 128 ||
    !Number.isFinite(claims.exp) ||
    claims.exp <= now ||
    !Number.isFinite(claims.iat) ||
    claims.iat > now + 60 ||
    !Number.isFinite(claims.auth_time) ||
    claims.auth_time > now + 60
  ) {
    fail(401);
  }

  const keysResponse = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  if (!keysResponse.ok) {
    const e = new Error('JWKS unreachable');
    e.status = 503;
    throw e;
  }
  const keys = await keysResponse.json();
  const jwk = keys.keys?.find(k => k.kid === head.kid && k.kty === 'RSA' && k.alg === 'RS256');
  if (!jwk) fail(401);

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const b64url = (x) => Uint8Array.from(atob(x.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(x.length / 4) * 4, '=')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    b64url(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!valid) fail(401);

  return claims.sub;
}
