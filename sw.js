// Gracious Love Academy - Ultra-Lightweight Offline & Fast-Cache Service Worker
const CACHE_NAME = 'gla-cache-v2027.6';
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
    '/images/team/faculty-team-2027.jpg',
    '/images/team/faculty-team-focus.jpg',
    '/images/gallery/excursion-nairobi-park.jpg',
    '/images/gallery/safari-walk-entrance.jpg',
    '/images/gallery/safari-walk-giraffe.jpg',
    '/images/gallery/nature-walk-boardwalk.jpg',
    '/images/gallery/excursion-teacher-pupils.jpg',
    '/images/gallery/forest-bridge-walk.jpg',
    '/images/gallery/art-painting-cbc.jpg',
    '/images/gallery/cbc-drawing-session.jpg',
    '/images/gallery/coloring-fine-motor.jpg',
    '/images/gallery/music-dance-performance.jpg',
    '/images/gallery/choir-recitation-stage.jpg',
    '/images/gallery/choir-worship-presentation.jpg',
    '/images/gallery/pp2-graduates-certificates.jpg',
    '/images/gallery/pp2-graduation-class.jpg',
    '/images/gallery/graduation-celebration-group.jpg',
    '/images/gallery/morning-assembly-uniform.jpg',
    '/images/gallery/outdoor-play-games.jpg',
    '/images/gallery/campus-lunch-snack-time.jpg',
    '/images/gallery/whole-school-assembly.jpg',
    '/images/gallery/football-sports-team.jpg',
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
