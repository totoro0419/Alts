/* kanbun-only PWA. Every cached URL and the registration scope are inside /Alts/kanbun/. */
const CACHE="alts-kanbun-v6";
const SHELL=["./","./index.html","./styles.css","./editorial.css","./lessons.js","./poems.js","./columns.js","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon.svg"];
const SCOPE_PATH=new URL("./",self.registration.scope).pathname;
const ASSET_PATHS=new Set(SHELL.map(p=>new URL(p,self.registration.scope).pathname));

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("alts-kanbun-")&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith(SCOPE_PATH))return;
  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put("./index.html",copy)));
        }
        return response;
      }).catch(async()=>(await caches.match("./index.html"))||Response.error())
    );
    return;
  }
  if(!ASSET_PATHS.has(url.pathname))return;
  event.respondWith(
    caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));
      }
      return response;
    }))
  );
});
