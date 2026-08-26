/* Lumo service worker — generated at build time with the real asset list.
   Offline-first: everything free must work in airplane mode, so the whole
   shell and bundle are precached on install rather than opportunistically. */
const CACHE = '__CACHE__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never cache third parties

  /* ignoreVary matters: a dev/preview server may send Vary: Accept-Encoding,
     and without this a precached bundle silently misses and the page loads
     blank offline. */
  const MATCH = { ignoreVary: true };

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html', MATCH)));
    return;
  }

  e.respondWith(
    caches.match(req, MATCH).then(
      (hit) =>
        hit ??
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => caches.match('./index.html', MATCH)),
    ),
  );
});
