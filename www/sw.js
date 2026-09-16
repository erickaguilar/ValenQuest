/**
 * ValenQuest PWA Service Worker (sw.js)
 * Estrategia Híbrida: Precache exclusivo del shell núcleo (Core)
 * y Runtime Caching con Stale-While-Revalidate para el resto de páginas y módulos.
 */

const CACHE_VERSION = 'v2.1.0';
const CORE_CACHE_NAME = `valenquest-core-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `valenquest-runtime-${CACHE_VERSION}`;

// Shell Núcleo Estricto (Solo lo indispensable para arrancar offline el Salón Principal)
const CORE_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/css/tokens.css',
  '/css/base.css',
  '/css/animations.css',
  '/css/components.css',
  '/css/theme-dark.css',
  '/js/app.js',
  '/js/components/header.js',
  '/js/components/footer.js',
  '/js/services/icons.js',
  '/js/services/theme.js',
  '/js/services/audio.js',
  '/js/services/speech.js',
  '/js/services/companions.js',
  '/js/services/storage.js',
  '/js/services/pwa.js',
  '/js/services/adventure.js',
  '/js/services/math-practice.js',
  '/js/services/reading-practice.js',
  '/js/controllers/portal-controller.js',
  '/data/cosmetics.json',
  '/data/game-modules.json',
  '/assets/icons.svg',
  '/assets/heroines.svg',
  '/assets/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then((cache) => {
      console.log('🌟 [ValenQuest SW] Pre-caching Core Shell assets...');
      return cache.addAll(CORE_PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CORE_CACHE_NAME, RUNTIME_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!currentCaches.includes(cache)) {
            console.log('🧹 [ValenQuest SW] Clearing deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    // 1. Intentar primero en el caché (Core o Runtime previo)
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // En segundo plano revalida para mantener frescura
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const targetCache = CORE_PRECACHE_URLS.includes(url.pathname) ? CORE_CACHE_NAME : RUNTIME_CACHE_NAME;
              caches.open(targetCache).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // 2. Runtime Caching (Stale-While-Revalidate para páginas secundarias y módulos)
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback al Salón Principal si falla la red en una navegación offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });
    })
  );
});
