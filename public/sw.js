// Saans & Steps Service Worker
const CACHE_NAME = 'saans-steps-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icon.svg',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external URLs
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful API responses
        if (event.request.url.includes('/api/') || event.request.url.includes('/data/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    }).catch(() => {
      // Return offline page if available
      if (event.request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});

// Background sync for data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      fetch('/api/sync').then(() => {
        console.log('[Service Worker] Data synced');
      })
    );
  }
});

// Push notifications for optimal workout windows
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Check Saans & Steps for optimal workout windows!',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: 'optimal-window',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Saans & Steps', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app is not already open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
