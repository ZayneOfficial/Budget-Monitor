const CACHE_NAME = "budget-monitor-v2";
const APP_SHELL = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/css/style.css",
    "/js/filter.js",
    "/js/api.js",
    "/js/app.js",
    "/js/pwa.js",
    "/icons/icon.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key.startsWith("budget-monitor-") && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);
    const isAppAsset = url.origin === self.location.origin
        && (url.pathname.startsWith("/css/")
            || url.pathname.startsWith("/js/")
            || url.pathname.startsWith("/icons/")
            || url.pathname === "/manifest.webmanifest");

    if (request.method !== "GET") {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const cacheUpdate = caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, response.clone()));
                        event.waitUntil(cacheUpdate);
                    }
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match("/index.html")))
        );
        return;
    }

    if (isAppAsset || request.destination === "script") {
        event.respondWith(
            fetch(request).then(response => {
                if (response.ok || response.type === "opaque") {
                    const cacheUpdate = caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, response.clone()));
                    event.waitUntil(cacheUpdate);
                }
                return response;
            }).catch(() => caches.match(request).then(cached => {
                if (cached) {
                    return cached;
                }
                throw new Error(`No cached response available for ${request.url}`);
            }))
        );
    }
});
