const CACHE = 'quran-tracker-v9';
const FILES = ['./index.html','./css/style.css','./js/firebase.js','./js/data.js','./js/app.js','./js/planner.js','./js/hifdh.js','./js/features.js','./js/reports.js'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))) });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => e.respondWith(
  fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request))
));
