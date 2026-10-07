const BLOCKED_PREFIXES = [
  '/.agents/', '/.github/', '/.firebase/', '/.gemini/', '/.vscode/', '/.wrangler/',
  '/cloudflare/', '/cloudflare-worker/', '/lib/', '/tests/', '/firebase_functions/', '/functions/', '/scratch/', '/src/',
  '/scripts/agent-matrix/.matrix_sessions/',
  '/tresci-18plus/',
];

const BLOCKED_FILES = new Set([
  '/.env', '/.env.example', '/.firebaserc', '/.gitignore', '/agents.md', '/claude.md',
  '/codex.md', '/firebase.json', '/firestore.indexes.json', '/firestore.rules', '/gemini.md',
  '/package-lock.json', '/package.json', '/playwright.config.ts', '/storage.rules',
  '/tsconfig.json', '/vite.config.ts', '/vitest.config.ts',
]);

const BLOCKED_EXTENSIONS = [
  '.bak', '.cjs', '.map', '.md', '.mjs', '.ps1', '.py', '.ts', '.vue', '.xlsx', '.yaml', '.yml',
];

function isBlocked(pathname) {
  let path;
  try {
    path = decodeURIComponent(pathname).replace(/\\/g, '/').toLowerCase();
  } catch {
    return true;
  }
  if (path.includes('\0') || path.includes('/../')) return true;
  if (BLOCKED_FILES.has(path)) return true;
  if (BLOCKED_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  return BLOCKED_EXTENSIONS.some((extension) => path.endsWith(extension));
}

// ═══════════════════════════════════════════════════════════════════════════
// KANAŁY CC — PRAWDZIWE WIADOMOŚCI NA PASKU (Strażnik Standardów, 2026-10-07)
// Wcześniej /news.json był plikiem zapisanym ręcznie 19 sierpnia 2026 i od tamtej pory
// kanały pokazywały jako „najnowsze” wiadomości sprzed 7 tygodni. Teraz serwer pobiera
// nagłówki z kanału RSS na bieżąco (pamięć podręczna 10 min). Gdy źródło nie odpowiada:
// ostatnie pobrane nagłówki (max 6 h), a potem pusta lista — nigdy stare wiadomości.
// ═══════════════════════════════════════════════════════════════════════════
const NEWS_RSS_URL = 'https://wiadomosci.wp.pl/rss.xml';
const NEWS_CACHE_KEY = 'https://polskieradio.cc/__cc_cache/news-headlines-v1';
const NEWS_FRESH_SECONDS = 600;
const NEWS_STALE_SECONDS = 6 * 3600;
const NEWS_MAX_AGE_HOURS = 48;

function decodeEntities(text) {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function cleanHeadline(text) {
  return decodeEntities(text).replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssHeadlines(xml) {
  const out = [];
  const now = Date.now();
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = m[1];
    const title = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (!title) continue;
    const pub = Date.parse((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
    if (!Number.isNaN(pub) && now - pub > NEWS_MAX_AGE_HOURS * 3600 * 1000) continue;
    const headline = cleanHeadline(title);
    if (headline && headline.length <= 220) out.push(headline);
    if (out.length >= 10) break;
  }
  return out;
}

async function serveLiveNews(ctx) {
  const cache = caches.default;
  const key = new Request(NEWS_CACHE_KEY);
  const cached = await cache.match(key);
  const cachedAt = cached ? Number(cached.headers.get('X-CC-Fetched-At') || 0) : 0;
  const age = cachedAt ? (Date.now() - cachedAt) / 1000 : Infinity;
  const respond = (body, fetchedAt, state) => new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
      'Access-Control-Allow-Origin': '*',
      'X-CC-Fetched-At': String(fetchedAt || 0),
      'X-CC-News-State': state,
    },
  });
  if (cached && age < NEWS_FRESH_SECONDS) return respond(await cached.text(), cachedAt, 'fresh');
  try {
    const rss = await fetch(NEWS_RSS_URL, { headers: { 'User-Agent': 'ChristianCulture-Ticker/1.0 (+https://polskieradio.cc)' }, cf: { cacheTtl: 300 } });
    if (!rss.ok) throw new Error('RSS ' + rss.status);
    const headlines = parseRssHeadlines(await rss.text());
    if (!headlines.length) throw new Error('RSS bez nagłówków');
    const body = JSON.stringify(headlines);
    const fetchedAt = Date.now();
    const store = new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${NEWS_STALE_SECONDS}`, 'X-CC-Fetched-At': String(fetchedAt) } });
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(cache.put(key, store)); else await cache.put(key, store);
    return respond(body, fetchedAt, 'live');
  } catch (err) {
    if (cached && age < NEWS_STALE_SECONDS) return respond(await cached.text(), cachedAt, 'stale');
    return respond('[]', 0, 'unavailable');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TREŚCI 18+ (książka „Prawda Bez Filtra”) — tylko dla zalogowanych, po
// oświadczeniu o pełnoletności. Pliki leżą w /tresci-18plus/ (publicznie
// zablokowane w isBlocked) i są wydawane wyłącznie przez /api/tresci-18/<id>
// po weryfikacji tokenu Firebase (projekt lumina-cc) po stronie serwera.
// ═══════════════════════════════════════════════════════════════════════════
const ADULT_FIREBASE_PROJECT = 'lumina-cc';
const ADULT_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ADULT_CONTENT = { 'prawda-bez-filtra-fragment': '/tresci-18plus/prawda-bez-filtra-fragment.json' };
let adultJwksCache = { keys: null, until: 0 };

function adultB64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function adultGetJwks(fetchImpl) {
  const now = Date.now();
  if (adultJwksCache.keys && adultJwksCache.until > now) return adultJwksCache.keys;
  const resp = await fetchImpl(ADULT_JWKS_URL);
  if (!resp.ok) throw new Error('jwks');
  const data = await resp.json();
  const m = /max-age=(\d+)/.exec(resp.headers.get('cache-control') || '');
  adultJwksCache = { keys: data.keys || [], until: now + (m ? Math.min(+m[1], 21600) : 3600) * 1000 };
  return adultJwksCache.keys;
}

async function verifyFirebaseIdToken(token, fetchImpl = fetch, nowSec = Math.floor(Date.now() / 1000)) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(adultB64urlToBytes(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(adultB64urlToBytes(parts[1])));
  } catch { return null; }
  if (header.alg !== 'RS256' || !header.kid) return null;
  if (payload.aud !== ADULT_FIREBASE_PROJECT) return null;
  if (payload.iss !== `https://securetoken.google.com/${ADULT_FIREBASE_PROJECT}`) return null;
  if (!payload.sub || typeof payload.sub !== 'string') return null;
  if (!(payload.exp > nowSec) || !(payload.iat <= nowSec + 300)) return null;
  const keys = await adultGetJwks(fetchImpl);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, adultB64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1]));
  return ok ? payload : null;
}

async function handleAdultContent(request, env, url, fetchImpl = fetch) {
  const json = (obj, status) => new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Vary': 'Authorization',
    },
  });
  const id = url.pathname.slice('/api/tresci-18/'.length).replace(/\/$/, '');
  const file = ADULT_CONTENT[id];
  if (!file) return json({ ok: false, error: 'not_found' }, 404);
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (request.headers.get('X-Age-Confirmed') !== '18+') return json({ ok: false, error: 'age_not_confirmed' }, 403);
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  let user = null;
  try { user = await verifyFirebaseIdToken(token, fetchImpl); } catch { user = null; }
  if (!user) return json({ ok: false, error: 'login_required' }, 401);
  const assetUrl = new URL(file, url.origin);
  const res = await env.ASSETS.fetch(new Request(assetUrl.toString()));
  if (!res.ok) return json({ ok: false, error: 'unavailable' }, 503);
  const data = await res.json();
  return json({ ok: true, ...data }, 200);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isBlocked(url.pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    if (url.pathname.startsWith('/api/tresci-18/')) {
      return handleAdultContent(request, env, url);
    }

    // AI Gateway recovery is code/test-only. No provider calls, bindings,
    // credentials or costs may be activated through the public portal.
    if (url.pathname === '/api/ai' || url.pathname.startsWith('/api/ai/')) {
      return Response.json({ success: false, error: { code: 'GATEWAY_DISABLED' } }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
      });
    }

    const p = url.pathname.toLowerCase().replace(/\/$/, '');
    let decodedP = p;
    try {
      decodedP = decodeURIComponent(url.pathname).toLowerCase().replace(/\/$/, '');
    } catch {
      decodedP = p;
    }

    if (decodedP === '/pokonaćgoliata' || decodedP === '/pokonacgoliata') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/pokonac-goliata';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/ogłoszenia' || decodedP === '/tablica-ogloszen') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ogloszenia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/ksiazki' || decodedP === '/audiobooki' || decodedP === '/ebooki') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/biblioteka';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/wychowanie' || decodedP === '/dzieci') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/edukacja';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/emocje') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/psychologia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/pieniadze') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/finanse';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    
    if (decodedP === '/ai-antychryst' || decodedP === '/ai-kontra-antychryst' || decodedP === '/si-antychryst') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/si/ai-antychryst';
      return Response.redirect(redirectUrl.toString(), 301);
    }
    if (decodedP === '/technologia' || decodedP === '/ai' || decodedP === '/sztucznainteligencja' || decodedP === '/sztuczna-inteligencja' || decodedP === '/synthetic-intelligence' || decodedP === '/superintelligence') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/si';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/misja' || decodedP === '/swiadectwa') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/misje';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/obrona-wiary') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/apologetyka';
      return Response.redirect(redirectUrl.toString(), 301);
    }
    if (decodedP === '/muzyka') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/music';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP.startsWith('/music/')) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = `${decodedP}/`;
      const res = await env.ASSETS.fetch(new Request(targetUrl, request));
      if (res.status === 404) {
        const fallbackUrl = new URL(request.url);
        fallbackUrl.pathname = '/music/';
        return env.ASSETS.fetch(new Request(fallbackUrl, request));
      }
      return res;
    }

    const THEMATIC_PORTALS = ['music', 'biblioteka', 'ogloszenia', 'ziu', 'kuchnia', 'nauka', 'historia', 'biologia', 'prawo', 'seks', 'biznes', 'kultura', 'wspolpraca', 'news', 'edukacja', 'psychologia', 'finanse', 'technologie', 'misje', 'apologetyka', 'si'];
    const portalMatch = THEMATIC_PORTALS.find(id => decodedP === `/${id}`);
    if (portalMatch) {
      const targetUrl = new URL(request.url);
      targetUrl.pathname = `/${portalMatch}/`;
      return env.ASSETS.fetch(new Request(targetUrl, request));
    }

    if (decodedP === '/zdrowie' || decodedP === '/zdrowie-i-uroda') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ziu';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/dieta' || decodedP === '/diety') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/kuchnia';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (decodedP === '/sport' || decodedP === '/aktywnosc' || decodedP === '/aktywność' || decodedP === '/ruch') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/ziu';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (p === '/aktualnosci' || p === '/aktualnosci.html' || p === '/ccn' || p === '/ccn-news' || p === '/raport' || p === '/sprawozdanie') {
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = '/news';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (p === '/ambientsleep' || p === '/ambient-sleep') {
      const ambientUrl = new URL(request.url);
      ambientUrl.pathname = '/ambientsleep';
      return env.ASSETS.fetch(new Request(ambientUrl, request));
    }

    if (p === '/akademia') {
      const akademiaUrl = new URL(request.url);
      akademiaUrl.pathname = '/akademia';
      return env.ASSETS.fetch(new Request(akademiaUrl, request));
    }


    if (p.startsWith('/akademia/') && !p.startsWith('/akademia/certyfikat')) {
      if (p.startsWith('/akademia/apokalipsa') || p.startsWith('/akademia/kurscodzienny')) {
        const resp = await env.ASSETS.fetch(request);
        if (resp.status === 404 && !url.pathname.includes('.')) {
          const fallbackUrl = new URL(request.url);
          fallbackUrl.pathname = url.pathname.replace(/\/$/, '') + '.html';
          const fallbackResp = await env.ASSETS.fetch(new Request(fallbackUrl, request));
          if (fallbackResp.status < 400) return fallbackResp;
        }
        return resp;
      }
      const target = p.replace('/akademia/', '/kursy/');
      const kursyUrl = new URL(request.url);
      kursyUrl.pathname = target;
      return env.ASSETS.fetch(new Request(kursyUrl, request));
    }


    // Studio API Endpoints
    if (url.pathname === '/api/bible/ubg/info') {
      const ubgInfoReq = new Request(new URL('/data/ubg_info.json', request.url), request);
      return env.ASSETS.fetch(ubgInfoReq);
    }

    if (url.pathname === '/api/auth/me') {
      return new Response(
        JSON.stringify({ user: null, isAdmin: false, firebaseAdminReady: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.pathname === '/api/keys/validate-gemini' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const key = (request.headers.get('x-user-gemini-key') || body.userApiKey || '').trim();
        if (!key) {
          return new Response(JSON.stringify({ error: 'Podaj klucz API Gemini.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Odpowiedz jednym słowem: "OK"' }] }] }),
          }
        );
        if (!resp.ok) {
          const errData = await resp.text();
          return new Response(JSON.stringify({ error: `Błąd weryfikacji klucza Gemini (${resp.status}): ${errData}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ success: true, model: 'gemini-2.5-flash', status: 'valid', preview: 'OK' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Błąd połączenia z API Gemini.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/elevenlabs/voices' && request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        const key = (request.headers.get('x-user-elevenlabs-key') || body.userApiKey || '').trim();
        if (!key) {
          return new Response(JSON.stringify({ error: 'Podaj klucz ElevenLabs API.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': key },
        });
        if (!resp.ok) {
          const errText = await resp.text();
          return new Response(JSON.stringify({ error: `ElevenLabs zwróciło błąd (${resp.status}): ${errText}` }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const data = await resp.json();
        return new Response(JSON.stringify({ success: true, voices: data.voices || [] }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (
      (url.pathname === '/api/drama/generate-script' ||
        url.pathname === '/api/direction/ai-direct' ||
        url.pathname === '/api/tts/synthesize') &&
      request.method === 'POST'
    ) {
      const userKey = (request.headers.get('x-user-gemini-key') || '').trim();
      if (!userKey) {
        return new Response(
          JSON.stringify({
            error: 'BYOK_KEY_REQUIRED: Do wykonania tej operacji AI wymagany jest własny klucz Gemini API. Możesz go bezpłatnie wprowadzić w menu Klucze API (prawy górny róg studia).',
            code: 'BYOK_KEY_REQUIRED',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (url.pathname === '/news.json' || url.pathname === '/api/live/news') {
      return serveLiveNews(ctx);
    }

    const assetResp = await env.ASSETS.fetch(request);
    if (assetResp.status === 404 && !url.pathname.includes('.')) {
      const dirUrl = new URL(request.url);
      dirUrl.pathname = url.pathname.replace(/\/$/, '') + '/';
      const dirResp = await env.ASSETS.fetch(new Request(dirUrl, request));
      if (dirResp.status < 400) {
        return dirResp;
      }

      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = url.pathname.replace(/\/$/, '') + '.html';
      const fallbackResp = await env.ASSETS.fetch(new Request(fallbackUrl, request));
      if (fallbackResp.status < 400) {
        return fallbackResp;
      }
    }

    return assetResp;
  },
};
