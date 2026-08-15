// ══════════════════════════════════════════════════════════════════════════
// LUMINA SERVICE WORKER (PWA Offline Shell & High-Speed Asset Cache)
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-v2.0-cache';
const PRECACHE_ASSETS = [
    './lumina.html',
    './lumina-tablica.html',
    './lumina-profile.html',
    './lumina-db.js',
    './lumina-i18n.js',
    './lumina-app-icon.jpg',
    './lumina_icon.jpg',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './manifest-lumina.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Lumina ServiceWorker precache notice:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);

    // Network-first for Firestore and API endpoints
    if (url.hostname.includes('firestore') || url.hostname.includes('googleapis') || url.hostname.includes('firebase')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
                }
                return response;
            })
            .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./lumina.html')))
    );
});
