const CACHE_NAME = "attendify-static-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/offline", "/icons/icon-192x192.svg", "/icons/icon-512x512.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co") || e.request.method !== "GET") return;

  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/offline")));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).then((netRes) => {
        if (!netRes || netRes.status !== 200 || netRes.type !== "basic") return netRes;
        const toCache = netRes.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, toCache));
        return netRes;
      });
    })
  );
});