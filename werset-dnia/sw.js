// Christian Culture — Mój Werset Dnia Service Worker
// Version: 1.0.0
const CACHE_NAME = 'werset-dnia-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for message events from client to display notifications
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || '✝ Werset Dnia — Christian Culture', {
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [150, 80, 150],
        ...options,
      })
    );
  }
});

// Handle clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            if (targetUrl !== '/' && 'navigate' in client) {
              return client.navigate(targetUrl).then((c) => c.focus());
            }
            return client.focus();
          }
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle Web Push event (if connected to a backend push service)
self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: '✝ Werset Dnia', body: event.data.text() };
    }
  }

  const title = payload.title || '✝ Słowo Boże na dziś — Christian Culture';
  const options = {
    body: payload.body || 'Zatrzymaj się na chwilę i przeczytaj dzisiejszy werset.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: {
      url: payload.url || '/',
      verseId: payload.verseId,
    },
    vibrate: [150, 80, 150],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
