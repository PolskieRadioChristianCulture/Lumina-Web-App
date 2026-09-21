const BLOCKED_PREFIXES = [
  '/.agents/', '/.github/', '/.firebase/', '/.gemini/', '/.vscode/', '/.wrangler/',
  '/cloudflare/', '/firebase_functions/', '/functions/', '/scratch/', '/src/',
  '/scripts/agent-matrix/.matrix_sessions/',
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

export default {
  async fetch(request, env) {
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

    return env.ASSETS.fetch(request);
  },
};
