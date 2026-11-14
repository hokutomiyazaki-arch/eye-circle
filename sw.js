const CACHE='eye-circle-v5';
const FILES=['./FNT512.png','./FNT512-transparent.png','./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon-32.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('eye-circle-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);if(request.method!=='GET')return;
  const remote=['https://cdn.jsdelivr.net','https://storage.googleapis.com'].includes(url.origin);
  if(remote){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(!response.ok)throw Error('取得に失敗');try{await cache.put(request,response.clone());}catch{}return response;}catch(error){const cached=await cache.match(request);if(cached)return cached;throw error;}})());return;}
  if(url.origin!==self.location.origin)return;
  // 画面（index.html）はネット優先：直した版がすぐ届くように。オフラインのときだけ控えを出す
  if(request.mode==='navigate'||url.pathname.endsWith('/index.html')){event.respondWith((async()=>{const cache=await caches.open(CACHE),key=new URL('./index.html',self.location.href).href;try{const response=await fetch(request.url,{cache:'no-cache'});if(response.ok)await cache.put(key,response.clone());return response;}catch(error){const cached=await cache.match(key);if(cached)return cached;throw error;}})());return;}
  if(url.pathname.includes('/icons/')||url.pathname.endsWith('/FNT512.png')||url.pathname.endsWith('/FNT512-transparent.png')||url.pathname.endsWith('/manifest.json'))event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;})());
});
