/* 奶蛙远征 · Service Worker
   策略：导航请求走「网络优先」保证拿到新版；静态资源走「缓存优先」保证离线可玩。 */
const VERSION = 'v1.0.0';
const CACHE = 'milkyfrog-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './art/bg/village.webp',
  './art/bg/forest.webp',
  './art/bg/mountain.webp',
  './art/bg/bridge.webp',
  './art/bg/courtyard.webp',
  './art/bg/hall.webp',
  './art/bg/throne.webp',
  './art/bg/cover.webp',
  './art/char/hero.webp',
  './art/char/hero-poster.webp',
  './art/char/princess.webp',
  './art/char/princess-laugh.webp',
  './art/char/boss.webp',
  './art/char/boss-p2.webp',
  './art/char/boss-laugh.webp',
  './art/char/captain.webp',
  './art/char/captain-p2.webp',
  './art/char/general.webp',
  './art/char/general-p2.webp',
  './art/char/marshal.webp',
  './art/char/marshal-p2.webp',
  './art/char/penguin.webp',
  './art/char/penguin-rage.webp',
  './art/char/jester.webp',
  './art/char/mimic.webp',
  './art/char/hammer.webp',
  './art/char/shield.webp',
  './art/char/bell.webp',
  './art/char/scribe.webp',
  './art/char/dog.webp',
  './art/char/bomber.webp',
  './art/char/chaser.webp',
  './art/char/shooter.webp',
  './art/char/crate.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {}))
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
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      });
    })
  );
});
