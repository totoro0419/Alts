/* Dedicated to /Alts/kanbun/; no access to other Sideworks projects. */
const CACHE="alts-kanbun-v7";
const SHELL=["./","./index.html","./install.html","./styles.css","./editorial.css","./lessons.js","./poems.js","./columns.js","./app.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon.svg"];
const ORIGIN=self.location.origin;
const SCOPE_PATH=new URL("./",self.registration.scope).pathname;
const ASSETS=new Set(SHELL.map(path=>new URL(path,self.registration.scope).pathname));
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(names=>Promise.all(
    names.filter(n=>n.startsWith("alts-kanbun-")&&n!==CACHE).map(n=>caches.delete(n))
  )).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const request=event.request, url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==ORIGIN||!url.pathname.startsWith(SCOPE_PATH))return;
  // Network-first avoids mismatched HTML/JS after an update. Offline falls back to complete local shell.
  if(request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(!response.ok)throw Error("HTTP "+response.status);
        const cache=await caches.open(CACHE);
        event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
        return response;
      }catch{
        return (await caches.match(request,{ignoreSearch:true}))
          ||(await caches.match("./index.html"))
          ||Response.error();
      }
    })());
    return;
  }
  if(!ASSETS.has(url.pathname))return;
  // For scripts, styles, manifest and icons fetch fresh whenever connected.
  // If offline, reuse the complete bundle from the last successful install/update.
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(!response.ok)throw Error("HTTP "+response.status);
      const cache=await caches.open(CACHE);
      event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
      return response;
    }catch{
      return (await caches.match(request,{ignoreSearch:true}))||Response.error();
    }
  })());
});
