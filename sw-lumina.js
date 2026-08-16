// ══════════════════════════════════════════════════════════════════════════
// LUMINA SERVICE WORKER (PWA Network-First High-Speed Shell)
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-v2.3-unified-icons-cache';

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
    const url = new URL(event.request.url);

    // Bypass external APIs and Firebase
    if (url.hostname.includes('firestore') || url.hostname.includes('googleapis') || url.hostname.includes('firebase') || url.hostname.includes('googletagmanager')) {
        return;
    }

    // Network-first for everything to prevent stale UI
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
