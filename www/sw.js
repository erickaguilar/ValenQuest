/**
 * ValenQuest PWA Service Worker
 * Offline-first caching engine for 100% offline play in Lumiria.
 */

const CACHE_NAME = 'valenquest-v1.9.4';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/campaign.html',
  '/math.html',
  '/reading.html',
  '/story.html',
  '/wardrobe.html',
  '/manifest.json',
  '/favicon.svg',
  '/css/tokens.css',
  '/css/base.css',
  '/css/animations.css',
  '/css/components.css',
  '/css/theme-dark.css',
  '/css/storybook.css',
  '/css/wardrobe.css',
  '/css/campaign.css',
  '/css/math.css',
  '/css/reading.css',
  '/js/app.js',
  '/js/campaign-page.js',
  '/js/math-page.js',
  '/js/reading-page.js',
  '/js/storybook.js',
  '/js/wardrobe-page.js',
  '/js/components/header.js',
  '/js/components/footer.js',
  '/js/services/audio.js',
  '/js/services/speech.js',
  '/js/services/companions.js',
  '/js/services/storage.js',
  '/js/services/pwa.js',
  '/js/services/wasm-loader.js',
  '/js/services/adventure.js',
  '/js/services/math-practice.js',
  '/js/services/reading-practice.js',
  '/js/data/levels-data.js',
  '/pkg/kidslearn_wasm.js',
  '/pkg/kidslearn_wasm_bg.wasm',
  '/assets/heroines.svg',
  '/assets/icons.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🌟 [ValenQuest SW] Pre-caching core game assets & WASM binary...');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [ValenQuest SW] Clearing deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Network failure is expected in offline mode, silently ignored
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
