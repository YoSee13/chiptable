/* App-shell cache: the app opens instantly and works offline; game data syncs through Firestore's own offline cache. */
const CACHE = "chiptable-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png"];
const _OLD = ["./", "index.html", "styles.css", "js/config.js", "js/sound.js", "js/settle.js", "js/store.js", "js/app.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/__/")) return;
  // network first so updates land right away; fall back to cache when offline
  e.respondWith(
    fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
