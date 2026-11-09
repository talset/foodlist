// Service worker minimal pour rendre Foodlist installable (PWA)
// et offrir un fonctionnement hors-ligne basique.
const CACHE = 'foodlist-v1'
const PRECACHE = ['/', '/shopping']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Ne gère que les requêtes GET de navigation / même origine.
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Ne pas intercepter les routes API (toujours en réseau direct).
  if (url.pathname.startsWith('/api/')) return

  // Stratégie network-first avec repli sur le cache (utile hors-ligne).
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/'))
      )
  )
})
