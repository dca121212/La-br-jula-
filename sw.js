/* Service worker de La Brujula
   Guarda en cache la app y los mapas que ya se hayan visto para que
   funcione sin conexion. Al cambiar la version se limpia la cache vieja. */
const VERSION = "brujula-v8";
const BASE = ["./", "./index.html", "./manifest.json", "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero para la app; cache primero para teselas de mapa, fuentes y Leaflet
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (/wikipedia\.org|wikimedia\.org/.test(url)) return;
  const estatico = /cartocdn|tile|fonts\.|cdnjs/.test(url);
  if (estatico) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copia = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return res;
    }).catch(() => r)));
  } else {
    e.respondWith(fetch(e.request).then(res => {
      const copia = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); return res;
    }).catch(() => caches.match(e.request)));
  }
});
