// ══════════════════════════════════════════════════════════════════════════
// LUMINA SERVICE WORKER - DIRECT NETWORK FLUSH
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-v3.0-flush-' + Date.now();

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // Direct network pass-through to ensure instant live updates
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
