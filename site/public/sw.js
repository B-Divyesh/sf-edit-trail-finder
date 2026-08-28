const CACHE = "edit-trail-v2";
const CORE = __EDIT_TRAIL_PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async (url) => {
      const response = await fetch(new Request(url, { cache: "reload" }));
      if (!response.ok) throw new Error(`Could not precache ${url}`);
      const headers = new Headers(response.headers);
      headers.delete("vary");
      const stableResponse = new Response(await response.arrayBuffer(), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      await cache.put(url, stableResponse);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
      return response;
    } catch {
      if (event.request.mode === "navigate") return (await caches.match("/"));
      throw new Error("Offline resource unavailable");
    }
  })());
});
