// 番茄手札：網站本體照舊，只多一個 /ics，把提醒轉成 iPhone 認得的行事曆檔
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ics') {
      if (request.method === 'POST') {
        const form = await request.formData();
        const ics = String(form.get('ics') || '');
        if (!ics.startsWith('BEGIN:VCALENDAR') || ics.length > 200000) {
          return new Response('格式不正確', { status: 400 });
        }
        return new Response(ics, {
          headers: {
            'content-type': 'text/calendar; charset=utf-8',
            'content-disposition': 'inline; filename="tomato-notes.ics"',
            'cache-control': 'no-store',
          },
        });
      }
      // 讓網頁確認這個功能有沒有啟用
      return new Response('ok', { headers: { 'x-tn-ics': '1', 'cache-control': 'no-store' } });
    }
    const res = await env.ASSETS.fetch(request);
    // 圖片很少改，讓手機快取一週；網頁本體每次都檢查有沒有新版
    if (/\.(webp|png|jpg|svg)$/.test(url.pathname) && res.ok) {
      const r = new Response(res.body, res);
      r.headers.set('cache-control', 'public, max-age=604800');
      return r;
    }
    return res;
  },
};
