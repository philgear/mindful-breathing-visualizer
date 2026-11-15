const CACHE_NAME = 'breathing-app-v4';

const DOCS_ASSETS = [
  './',
  './index.html',
  './styles/styles.css',
  './js/i18n.js',
  './js/breathing.js',
  './locales/en.json',
  './locales/es.json',
  './locales/fr.json',
  './locales/ja.json',
  './assets/fonts/pocketgull-regular.woff2',
  './assets/fonts/pocketgull-bold.woff2',
  './assets/fonts/pocketgull-slab-bold.woff2',
  './assets/fonts/pocketgull-mono.woff2',
  './assets/favicons/favicon-default.png',
  './assets/favicons/favicon-inhale.png',
  './assets/favicons/favicon-hold.png',
  './assets/favicons/favicon-exhale.png',
];

const DEV_WORKSPACE_ASSETS = [
  './public/index.html',
  './public/manifest.json',
  './src/styles/styles.css',
  './js/src/i18n.js',
  './js/src/breathing.js',
  './public/locales/en.json',
  './public/locales/es.json',
  './public/locales/fr.json',
  './public/locales/ja.json',
  './src/assets/fonts/pocketgull-regular.woff2',
  './src/assets/fonts/pocketgull-bold.woff2',
  './src/assets/fonts/pocketgull-slab-bold.woff2',
  './src/assets/fonts/pocketgull-mono.woff2',
  './public/assets/favicons/favicon-default.png',
  './public/assets/favicons/favicon-inhale.png',
  './public/assets/favicons/favicon-hold.png',
  './public/assets/favicons/favicon-exhale.png',
];

function getAssetsForScope() {
  const scopePath = new URL(self.registration.scope).pathname;
  if (scopePath.includes('/frontend/vanilla-js/')) {
    return DEV_WORKSPACE_ASSETS;
  }
  return DOCS_ASSETS;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        getAssetsForScope().map((url) =>
          fetch(url, { cache: 'reload' }).then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to precache ${url}: ${response.status}`);
            }
            return cache.put(url, response);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});
