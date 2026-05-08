const CACHE = 'andylite-v1';
const ASSETS = ['/lite', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Para las llamadas a la API siempre va a la red
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"ok":false}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  // Para todo lo demás: cache primero, red como respaldo
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
