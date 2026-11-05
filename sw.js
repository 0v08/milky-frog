/* 奶蛙远征 · Service Worker
   策略：导航请求走「网络优先」保证拿到新版；静态资源走「缓存优先」保证离线可玩。
   首次只预缓存首屏必需的小文件，其余美术在首次用到时按需缓存（避免第一次打开等太久）。 */
const VERSION = 'v1.3.0';
const CACHE = 'milkyfrog-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './art/bg/village.webp',
  './art/char/hero.webp',
  './art/char/crate.webp',
  './art/char/penguin.webp',
  './audio/battle.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(PRECACHE.map(u =>
        fetch(u, { cache: 'no-cache' })
          .then(r => r.ok ? c.put(u, r) : null)
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
