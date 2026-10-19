/* Social Recall: only this app's pages/assets and caches may be controlled. */
const PROJECT_CACHE_PREFIX = 'sideworks:social-recall:';
const CACHE_NAME = PROJECT_CACHE_PREFIX + 'offline-v6';
const ROOT = new URL(self.registration.scope);
const CORE_FILES = [
  './', './index.html', './install.html', './note.html', './manifest.webmanifest', './assets/app.css', './assets/note.css',
  './assets/app.js', './assets/pwa.js', './assets/data.json', './assets/note-app.js', './assets/note-data.json',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png', './assets/icons/apple-touch-icon.png'
];
const CORE_URLS = new Set(CORE_FILES.map(path => new URL(path, ROOT).href));
const OFFLINE_PAGE = new URL('./index.html', ROOT).href;
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([...CORE_URLS]))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(PROJECT_CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const isNavigation = request.mode === 'navigate';
  if (!isNavigation && !CORE_URLS.has(url.origin + url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const keepPage = url.pathname === new URL('./install.html', ROOT).pathname || url.pathname === new URL('./note.html', ROOT).pathname;
    const key = isNavigation && !keepPage ? OFFLINE_PAGE : new URL(url.pathname, ROOT.origin).href;
    try {
      const fresh = await fetch(request);
      if (!fresh.ok) throw new Error('HTTP ' + fresh.status);
      await cache.put(key, fresh.clone());
      return fresh;
    } catch (error) {
      const saved = await cache.match(key);
      if (saved) return saved;
      throw error;
    }
  })());
});
