const CACHE='worksheet-hub-v3';
const APP_SHELL=[
  '/', '/index.html', '/manifest.webmanifest',
  '/assets/activities.css','/assets/interface.css','/assets/print.css','/assets/app-icon.svg',
  '/assets/core.js','/assets/learning-data.js','/assets/level-1.js','/assets/level-2.js','/assets/level-3.js','/assets/level-4.js','/assets/level-5.js',
  '/assets/shell.js','/assets/interface.js','/assets/progression.js','/assets/printing.js','/assets/pwa.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('worksheet-hub-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/index.html',copy));return response;}).catch(()=>caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;})));
});
