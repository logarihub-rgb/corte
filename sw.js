const C='corte-v14';
const ARQ=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ARQ.map(x=>new Request(x,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('corte-')).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin===location.origin){
  // abre do celular na hora e atualiza por trás para a próxima vez
  const K=u.origin+u.pathname;e.respondWith(caches.match(K).then(m=>{const rede=fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(K,cp))}return r}).catch(()=>m||caches.match('index.html'));if(m){e.waitUntil(rede);return m}return rede}));return}
  if(u.hostname==='cdn.jsdelivr.net'||u.hostname.endsWith('gstatic.com')||u.hostname==='fonts.googleapis.com')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(C).then(c=>c.put(e.request,cp));return x})))});
// avisos no celular: o servidor só "cutuca"; aqui buscamos o texto e mostramos
async function cfgSW(){try{const c=await caches.open('cor-cfg');const r=await c.match('cfg');return r?r.json():null}catch(e){return null}}
async function mostraAvisos(){
  const cfg=await cfgSW(),sub=await self.registration.pushManager.getSubscription();
  let L=[];
  try{if(cfg&&sub){const r=await (await fetch(cfg.api,{method:'POST',body:JSON.stringify({pin:cfg.pin,action:'aviso',p:{endpoint:sub.endpoint}})})).json();L=r.avisos||(r.aviso?[r.aviso]:[])}}catch(e){}
  if(!L.length)L=[{t:'Corte',b:'Abra o app para ver as novidades.'}];
  await Promise.all(L.map((a,i)=>self.registration.showNotification(a.t,{body:a.b,tag:'cor-'+(a.tag||i),icon:'icon-192.png',badge:'icon-192.png',data:{url:'./'}})));
}
self.addEventListener('push',e=>e.waitUntil(mostraAvisos()));
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>x.url.includes('/corte/'));return c?c.focus():self.clients.openWindow('./')}))});
