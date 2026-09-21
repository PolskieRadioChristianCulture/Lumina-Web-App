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
    if (url.pathname === '/studio' || url.pathname === '/studio/' || url.pathname.startsWith('/studio/')) {
      const studioUrl = new URL(request.url);
      studioUrl.pathname = '/studio.html';
      return env.ASSETS.fetch(new Request(studioUrl, request));
    }
    return env.ASSETS.fetch(request);
  },
};
