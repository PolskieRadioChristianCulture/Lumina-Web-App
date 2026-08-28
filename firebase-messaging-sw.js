// ══════════════════════════════════════════════════════════════════════════
// LUMINA FIREBASE CLOUD MESSAGING (Background Web Push for Closed App)
// ══════════════════════════════════════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

try {
    firebase.initializeApp({
        apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
        authDomain: "lumina-cc.firebaseapp.com",
        databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "lumina-cc",
        storageBucket: "lumina-cc.firebasestorage.app",
        messagingSenderId: "413985877183",
        appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
        measurementId: "G-6440T9VBQB"
    });

    const fcmMessaging = firebase.messaging();
    fcmMessaging.onBackgroundMessage((payload) => {
        console.log('[SW] FCM Background Message received:', payload);
        const data = payload.data || {};
        const notification = payload.notification || {};
        const type = data.type || 'general';

        const title = notification.title || data.title || 'LUMINA ✨';
        const body = notification.body || data.body || data.text || 'Masz nowe powiadomienie w portalu LUMINA.';
        const icon = notification.icon || data.icon || data.avatar || './lumina_icon.jpg';
        const image = notification.image || data.image || data.imageUrl || undefined;
        let urlToOpen = data.url || './lumina.html';

        let actions = [
            { action: 'open', title: 'Otwórz LUMINA 🕊️' }
        ];

        if (type === 'devotion' || type === 'ckd') {
            actions = [
                { action: 'read', title: '📖 Czytaj' },
                { action: 'share', title: '🕊️ Udostępnij' }
            ];
        } else if (type === 'new_profile') {
            actions = [
                { action: 'view', title: '👀 Zobacz Profil' },
                { action: 'welcome', title: '🕊️ Powitaj' }
            ];
            if (data.slug) urlToOpen = `./lumina-profile.html?u=${encodeURIComponent(data.slug)}`;
        } else if (type === 'new_post') {
            actions = [
                { action: 'read', title: '📖 Zobacz Wpis' },
                { action: 'like', title: '❤️ Polub' }
            ];
            if (data.postId) urlToOpen = `./lumina-tablica.html?postId=${encodeURIComponent(data.postId)}`;
        } else if (type === 'direct_message' || type === 'mention') {
            actions = [
                { action: 'reply', title: '💬 Odpowiedz' },
                { action: 'open', title: 'Otwórz Czat' }
            ];
            if (data.senderId) urlToOpen = `./lumina.html?openChat=${encodeURIComponent(data.senderId)}`;
        } else if (type === 'public_chat') {
            actions = [
                { action: 'open', title: '💬 Dołącz do rozmowy' }
            ];
            urlToOpen = './lumina.html?openPublicChat=1';
        }

        const tag = notification.tag || data.tag || `lumina_${type}_${Date.now()}`;
        const requireInteraction = (type === 'direct_message' || type === 'mention' || type === 'devotion' || type === 'ckd');

        const notificationOptions = {
            body: body,
            icon: icon,
            badge: './lumina_icon.jpg',
            image: image,
            tag: tag,
            renotify: true,
            vibrate: [200, 100, 200],
            requireInteraction: requireInteraction,
            data: {
                url: urlToOpen,
                type: type,
                ...data
            },
            actions: actions
        };

        return self.registration.showNotification(title, notificationOptions);
    });
} catch(err) {
    console.warn('[SW] Firebase FCM init in SW error:', err);
}

// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v3.9.1)
// High-performance caching, stale-while-revalidate & offline navigation
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v3.9.1';
const APP_SHELL_ASSETS = [
    './',
    './lumina.html',
    './lumina-tablica.html',
    './lumina-profile.html',
    './manifest-lumina.json',
    './lumina-icon-192.png',
    './lumina-icon-512.png',
    './icon.png',
    './lumina_icon.jpg'
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

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
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

    // STRICTLY allow ONLY http: and https: protocols
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

    // Static Assets (Images, Fonts, CSS) -> Stale-While-Revalidate (Instant load from Cache + background update)
    const isStaticAsset = /\.(png|jpg|jpeg|webp|svg|gif|woff2?|ttf|css)(\?.*)?$/i.test(url.pathname);

    if (isStaticAsset) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(request, networkResponse.clone()).catch(() => {});
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // HTML Navigation Pages -> Network First with Cache Fallback
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
// PUSH NOTIFICATION RECEIVER (Direct Chat, Profiles, Posts, CKD)
// ══════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = {
            notification: {
                title: 'LUMINA ✨',
                body: event.data ? event.data.text() : 'Masz nowe powiadomienie.'
            }
        };
    }

    const data = payload.data || {};
    const notification = payload.notification || {};
    const type = data.type || 'general';

    const title = notification.title || data.title || 'LUMINA • Społeczność Chrześcijańska';
    const body = notification.body || data.body || 'Otrzymałeś nową wiadomość w portalu LUMINA.';
    const icon = notification.icon || data.icon || './lumina-icon-192.png';
    const image = notification.image || data.image || data.imageUrl || undefined;
    const url = data.url || './lumina.html';

    let actions = [
        { action: 'open', title: 'Otwórz LUMINA 🕊️' }
    ];

    if (type === 'new_profile') {
        actions = [
            { action: 'view', title: '👀 Zobacz Profil' },
            { action: 'welcome', title: '🕊️ Powitaj' }
        ];
    } else if (type === 'new_post') {
        actions = [
            { action: 'read', title: '📖 Zobacz Wpis' },
            { action: 'like', title: '❤️ Polub' }
        ];
    } else if (type === 'direct_message' || type === 'mention') {
        actions = [
            { action: 'reply', title: '💬 Odpowiedz' },
            { action: 'open', title: 'Otwórz Czat' }
        ];
    }

    const options = {
        body: body,
        icon: icon,
        badge: './lumina_icon.jpg',
        image: image,
        data: {
            url: url,
            type: type,
            ...data
        },
        tag: notification.tag || data.tag || `lumina_${type}_${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: (type === 'direct_message' || type === 'mention' || type === 'devotion' || type === 'ckd'),
        actions: actions
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CLICK HANDLER — DEEP-LINKING TO PAGES & CHAT
// ══════════════════════════════════════════════════════════════════════════
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const action = event.action;
    const data = event.notification.data || {};
    let targetUrl = data.url || './lumina.html';

    if (action === 'share' && (data.devotionId || data.postId)) {
        targetUrl = `./lumina-tablica.html?share=${encodeURIComponent(data.devotionId || data.postId)}`;
    } else if (action === 'reply' && data.senderId) {
        targetUrl = `./lumina.html?openChat=${encodeURIComponent(data.senderId)}`;
    } else if (action === 'view' && data.slug) {
        targetUrl = `./lumina-profile.html?u=${encodeURIComponent(data.slug)}`;
    } else if (action === 'welcome' && data.slug) {
        targetUrl = `./lumina.html?openChat=${encodeURIComponent(data.slug)}&welcome=1`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url && 'focus' in client) {
                    if (targetUrl && 'navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
