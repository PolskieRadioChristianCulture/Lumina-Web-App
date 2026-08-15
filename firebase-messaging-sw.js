// ══════════════════════════════════════════════════════════════════════════
// LUMINA FIREBASE CLOUD MESSAGING SERVICE WORKER (Background Push Notifications)
// ══════════════════════════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background Push Message received:', payload);
    const notificationTitle = payload.notification?.title || 'LUMINA • Nowa Wiadomość 💌';
    const notificationOptions = {
        body: payload.notification?.body || 'Masz nową aktywność w społeczności LUMINA.',
        icon: 'lumina-icon-192.png',
        badge: 'lumina_icon.jpg',
        data: payload.data || { url: '/lumina-tablica.html' },
        actions: [
            { action: 'open_chat', title: 'Otwórz Wiadomość 💌' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/lumina.html';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
