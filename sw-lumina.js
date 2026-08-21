// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v3.5.1)
// High-performance caching, offline navigation & push notification sync
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v3.5.1';
const APP_SHELL_ASSETS = [
    './',
    './lumina.html',
    './lumina-tablica.html',
    './manifest-lumina.json',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './icon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
                console.warn('[SW Install] Część zasobów offline pominięta:', err);
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW Activate] Usuwanie starego cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }

    // Bypass all external APIs, Firebase, Google Fonts, CDNs, Donorbox
    if (url.origin !== self.location.origin) {
        return;
    }

    // Bypass dynamic streams, audio files, version checks, and API calls
    if (url.pathname.includes('version.json') || url.pathname.includes('.mp3') || url.pathname.includes('.m3u8') || url.pathname.includes('stream') || url.pathname.includes('live') || url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('./lumina.html') || caches.match('./index.html');
                    }
                });
            })
    );
});