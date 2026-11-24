const C='corte-v3';
const ARQ=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ARQ.map(x=>new Request(x,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin===location.origin){
  // abre do celular na hora e atualiza por trás para a próxima vez
  const K=u.origin+u.pathname;e.respondWith(caches.match(K).then(m=>{const rede=fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(K,cp))}return r}).catch(()=>m||caches.match('index.html'));if(m){e.waitUntil(rede);return m}return rede}));return}
  if(u.hostname==='cdn.jsdelivr.net'||u.hostname.endsWith('gstatic.com')||u.hostname==='fonts.googleapis.com')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(C).then(c=>c.put(e.request,cp));return x})))});
