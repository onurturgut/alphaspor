/* Increment this version when changing the offline page or precached assets. */
const CACHE = "alfa-pwa-v2";
const OFFLINE = "/offline.html";
const ASSETS = [OFFLINE, "/media/logo.webp", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("alfa-pwa-") && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Never cache API responses, admin pages, form submissions or Next RSC payloads.
  if (request.method !== "GET" || url.origin !== self.location.origin ||
      /^\/(admin|api)(\/|$)/.test(url.pathname) || request.headers.has("RSC")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        return await fetch(request, { signal: controller.signal });
      } catch {
        return (await caches.match(OFFLINE)) ?? Response.error();
      } finally {
        clearTimeout(timeout);
      }
    })());
  } else if (!url.search && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
