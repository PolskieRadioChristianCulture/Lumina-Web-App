// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v3.6.3-stable)
// High-performance caching, offline navigation & push notification sync
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v3.6.3-20260823-r4';
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

    // Bypass dynamic streams, audio files, scripts, version checks, playlists and API calls
    if (url.pathname.includes('version.json') || 
        url.pathname.endsWith('.json') ||
        url.pathname.endsWith('app.js') ||
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

// ══════════════════════════════════════════════════════════════════════════
// ANDROID / PWA SYSTEM DRAWER NOTIFICATIONS (Belka Powiadomień jak FB / YT)
// ══════════════════════════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data = { body: event.data.text() };
        }
    }
    const senderName = data.senderName || data.title || 'Społeczność LUMINA';
    const senderAvatar = data.senderAvatar || data.avatar || './avatar_cezary_official.jpg';
    const text = data.text || data.body || 'Masz nową wiadomość w portalu LUMINA 🕊️';
    const type = data.type || 'chat';

    const notificationTitle = `LUMINA • Masz wiadomość od ${senderName}`;
    const notificationOptions = {
        body: text,
        icon: senderAvatar,
        badge: './lumina-icon-192.png',
        tag: 'lumina_chat_' + (data.senderId || 'all'),
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: data || { url: './lumina.html', type: type, senderName: senderName, senderAvatar: senderAvatar },
        actions: [
            { action: 'open_chat', title: '💬 Odpowiedz' },
            { action: 'dismiss', title: '✕ Zamknij' }
        ]
    };

    if (data.image) {
        notificationOptions.image = data.image;
    }

    event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }

    const chatData = event.notification.data || {};
    const targetUrl = chatData.url || './lumina.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    client.postMessage({
                        type: 'OPEN_LUMINA_CHAT',
                        chatData: chatData
                    });
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});