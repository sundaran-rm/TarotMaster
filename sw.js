const CACHE_NAME = 'tarot-app-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== 'tarot-deck') {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // If it's a wikipedia image that missed cache for some reason, we can add it dynamically
        if (event.request.url.includes('wikipedia.org')) {
            const responseClone = networkResponse.clone();
            caches.open('tarot-deck').then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
         // Offline fallback if needed
      });
    })
  );
});
