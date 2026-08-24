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
        console.log('[sw-lumina.js] FCM Background Message received:', payload);
        const senderName = payload.data?.senderName || payload.notification?.title || 'LUMINA ✨';
        const senderAvatar = payload.data?.senderAvatar || payload.data?.avatar || './lumina_icon.jpg';
        const text = payload.data?.text || payload.notification?.body || 'Masz nową wiadomość w portalu LUMINA 🕊️';
        const urlToOpen = payload.data?.url || './lumina.html';

        const notificationTitle = payload.notification?.title || `Wiadomość od: ${senderName}`;
        const notificationOptions = {
            body: text,
            icon: senderAvatar,
            badge: './lumina_icon.jpg',
            tag: 'lumina_notif_' + (payload.data?.senderId || Date.now()),
            renotify: true,
            vibrate: [200, 100, 200],
            data: {
                url: urlToOpen,
                ...payload.data
            },
            actions: [
                { action: 'open', title: 'Otwórz LUMINA 💬' }
            ]
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch(err) {
    console.warn('[sw-lumina.js] Firebase FCM init in SW error:', err);
}

// ══════════════════════════════════════════════════════════════════════════
// LUMINA PRODUCTION PWA SERVICE WORKER (v3.6.3-optimized)
// High-performance caching, stale-while-revalidate & offline navigation
// ══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'lumina-pwa-cache-v3.6.3-20260824-r42';
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
// PUSH NOTIFICATION RECEIVER (Direct Chat & Mission Notifications)
// ══════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'LUMINA • Nowa Wiadomość ✨', body: event.data ? event.data.text() : 'Otrzymałeś nową wiadomość w portalu LUMINA.' };
    }

    const title = data.title || 'LUMINA • Społeczność Chrześcijańska';
    const options = {
        body: data.body || 'Masz nowe powiadomienie w aplikacji LUMINA.',
        icon: data.icon || './lumina-icon-192.png',
        badge: './icon.png',
        data: {
            url: data.url || './lumina.html'
        },
        vibrate: [100, 50, 100],
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || './lumina.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url.includes('lumina.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
