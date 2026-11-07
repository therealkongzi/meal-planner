// Offline cache for Family Dinners. Bump VERSION when index.html changes.
// Network-first, and the network read bypasses the HTTP cache (GitHub Pages
// sends max-age, which would otherwise keep an old index.html after deploy).
// Cache Storage is only the offline fallback. Activating a new VERSION drops old caches.
const VERSION='dinners-v4';
const FILES=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'];
function fresh(url){return fetch(url,{cache:'reload',credentials:'same-origin'})}
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(FILES.map(u=>fresh(u).then(res=>{if(!res.ok)throw new Error(u);return c.put(u,res)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 const path=new URL(r.url).pathname;
 const doc=r.mode==='navigate'||r.destination==='document'||/\.(html|js|webmanifest)$/.test(path)||path.endsWith('/');
 const net=doc?fresh(r.url):fetch(r);
 e.respondWith(net.then(res=>{const copy=res.clone();caches.open(VERSION).then(c=>c.put(r,copy)).catch(()=>{});return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
