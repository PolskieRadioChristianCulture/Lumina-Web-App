// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v3.5)
// High-performance caching, offline navigation & push notification sync
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v3.5.0';
const APP_SHELL_ASSETS = [
    './',
    './lumina.html',
    './lumina-tablica.html',
    './lumina.andrzejthiel.html',
    './lumina.cctv.html',
    './manifest-lumina.json',
    './lumina-responsive-reset.css',
    './lumina-core.js',
    './lumina-db.js',
    './lumina-pwa-installer.js',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './avatar_andrzej_thiel.jpg',
    './logo_cctv.png',
    './version.json'
];

self.addEventListener('install', (event) => {
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
    const url = new URL(request.url);

    // Don't cache version checking or live streams
    if (url.pathname.includes('version.json') || url.pathname.startsWith('/api/') || request.url.includes('stream') || request.url.includes('live')) {
        return;
    }

    if (request.method !== 'GET') return;

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
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