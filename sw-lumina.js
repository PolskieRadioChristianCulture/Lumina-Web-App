// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v4.0)
// High-performance caching, offline navigation & push notification sync
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v4.0';
const APP_SHELL_ASSETS = [
    './',
    './lumina.html',
    './lumina-tablica.html',
    './lumina-profile.html',
    './modlitwa.html',
    './manifest-lumina.json',
    './manifest.json',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './lumina-apple-touch-icon.png',
    './icon.png',
    './lumina_icon.jpg',
    './lumina_logo.jpg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
                console.warn('[LUMINA SW] Pre-cache non-fatal warning:', err);
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
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

    const url = new URL(request.url);

    // Don't intercept Firebase Realtime/Firestore/Auth API streaming traffic
    if (
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.pathname.startsWith('/api/')
    ) {
        return;
    }

    // 1. Navigation requests (HTML pages) -> Network first with cache fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;
                    const fallback = await caches.match('./lumina.html');
                    return fallback || new Response('Aplikacja LUMINA działa w trybie offline. Połącz się z Internetem, aby odświeżyć zawartość.', {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // 2. Static assets (images, styles, icons) -> Stale-while-revalidate
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => null);

            return cachedResponse || fetchPromise;
        })
    );
});

// Push Notifications handling
self.addEventListener('push', (event) => {
    let data = { title: 'LUMINA • Społeczność Wiary', body: 'Nowa aktywność w portalu LUMINA.' };
    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch(e) {
        if (event.data) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body || data.text,
        icon: 'lumina-icon-192.png',
        badge: 'lumina-icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || 'lumina-tablica.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || 'lumina-tablica.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes('lumina') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
