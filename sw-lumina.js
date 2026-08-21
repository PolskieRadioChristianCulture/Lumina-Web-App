// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v4.1.0-stable)
// High-performance caching, offline navigation & push notification sync
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v4.1.0-stable';
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
    if (!request || request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }

    // STRICTLY allow ONLY http: and https: protocols (reject chrome-extension:, blob:, data:)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // STRICTLY bypass all third-party domains (Firebase, Firestore, Google Analytics, CDNs, Donorbox)
    if (url.origin !== self.location.origin) {
        return;
    }

    // Bypass dynamic streams, audio files, version checks, and API calls
    if (url.pathname.includes('version.json') || 
        url.pathname.endsWith('.mp3') || 
        url.pathname.endsWith('.m3u8') || 
        url.pathname.includes('stream') || 
        url.pathname.includes('live') || 
        url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache).catch(() => {});
                    }).catch(() => {});
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('./lumina.html') || caches.match('./index.html');
                    }
                }).catch(() => {});
            })
    );
});