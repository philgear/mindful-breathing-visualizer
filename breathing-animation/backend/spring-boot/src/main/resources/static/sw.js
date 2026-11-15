const CACHE_NAME = 'breathing-app-v3';

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
  './assets/fonts/pocketgull-fineliner.woff2',
  './assets/fonts/pocketgull-bold.woff2',
  './assets/fonts/pocketgull-chiseltip.woff2',
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
  './src/assets/fonts/pocketgull-fineliner.woff2',
  './src/assets/fonts/pocketgull-bold.woff2',
  './src/assets/fonts/pocketgull-chiseltip.woff2',
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(getAssetsForScope()))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

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
