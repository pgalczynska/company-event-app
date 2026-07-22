const CACHE_NAME = 'forte-trip-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles/tokens.css',
  './styles/main.css',
  './js/app.js',
  './js/auth.js',
  './js/data.js',
  './js/eventList.js',
  './js/agenda.js',
  './js/myActivities.js',
  './js/info.js',
  './js/notifications.js',
  './data/agenda.json',
  './data/activities.json',
  './data/participants.json',
  './data/individualSlots.json',
  './data/settings.json',
  './assets/Forte-logo_bg-cream.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Network-first: świeże dane gdy jest zasięg, cache jako fallback offline (np. bez sygnału w hotelu).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
