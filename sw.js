// Gracious Love Academy - Ultra-Lightweight Offline & Fast-Cache Service Worker
const CACHE_NAME = 'gla-cache-v2027.4';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/gallery.html',
    '/team.html',
    '/calendar.html',
    '/news.html',
    '/css/style.css',
    '/js/script.js',
    '/favicon.svg',
    '/images/logo.svg',
    '/images/hero-bg.jpeg',
    '/images/about-school.jpeg',
    '/images/gallery-1.jpeg',
    '/images/gallery-2.jpeg',
    '/images/gallery-3.jpeg',
    '/images/gallery-4.jpeg',
    '/images/gallery-5.jpeg',
    '/images/gallery-6.jpeg',
    '/images/gallery-7.jpeg',
    '/images/gallery-8.jpeg',
    '/images/gallery-9.jpeg',
    '/images/gallery-10.jpeg',
    '/images/gallery-11.jpeg',
    '/images/gallery-12.jpeg',
    '/images/gallery-13.jpeg',
    '/images/gallery-14.jpeg',
    '/images/news/open-day.jpg',
    '/images/news/pp2-graduation.jpg',
    '/images/news/playground.jpg',
    '/images/news/excursion.jpg',
    '/content/settings.json',
    '/content/events/term-dates.json',
    '/content/gallery/_index.json',
    '/content/team/_index.json',
    '/content/news/_index.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS).catch(() => {
                // Ignore any individual pre-cache fetch failures
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Stale-While-Revalidate Strategy for maximum speed in poor network conditions
self.addEventListener('fetch', (event) => {
    const request = event.request;
    // Don't intercept non-GET requests or admin api calls
    if (request.method !== 'GET' || request.url.includes('/api/auth') || request.url.includes('/api/upload')) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
