const CACHE="alts-kanbun-v5";
const ASSETS=["./","./index.html","./styles.css","./editorial.css","./lessons.js","./poems.js","./columns.js","./app.js"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("alts-kanbun-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||!request.url.startsWith(self.registration.scope))return;
 event.respondWith(fetch(request).then(response=>{
   if(response&&response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
   return response;
 }).catch(async()=>{
   const match=await caches.match(request,{ignoreSearch:true});
   if(match)return match;
   if(request.mode==="navigate")return caches.match("./index.html");
   return Response.error();
 }));
});
