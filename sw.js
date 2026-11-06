/* 毛孩聲音收藏館 · offline support（v2026.11.05-14）
   網頁本體：有網路時先抓最新版，失敗才用暫存；任何情況都會回傳一個頁面，不會讓瀏覽器卡在錯誤畫面。
   字型與圖示：先用暫存，背景再更新。你的錄音不經過這裡，一直只存在裝置的資料庫。 */
const VER='psa-2026.11.06-3';
const CORE=['./','./index.html','./manifest.webmanifest','./favicon.png','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const offlinePage=()=>new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>毛孩聲音收藏館</title><body style="font-family:sans-serif;background:#F5F3EE;color:#302F2B;padding:40px 24px;line-height:1.8"><h1 style="font-size:22px">暫時連不上網站</h1><p>請確認網路連線後重新整理。你的收藏都還在這台裝置裡，不會因此消失。</p><p><a href="./" style="color:#2E5E50">重新整理</a></p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    // 有網路時完全交給瀏覽器自己載入，不攔截；只有離線時才用暫存的網頁。
    if(self.navigator&&self.navigator.onLine!==false)return;
    e.respondWith(caches.match('./index.html').then(m=>m||caches.match('./')).then(m=>m||offlinePage()));return}
  const same=u.origin===location.origin,font=/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  e.respondWith((async()=>{const m=await caches.match(r);const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp)).catch(()=>{})}return res});
    if(m){net.catch(()=>{});return m}try{return await net}catch{return new Response('',{status:504})}})());
});
