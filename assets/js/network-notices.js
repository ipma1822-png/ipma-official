(function(){
  const SUPABASE_URL='https://ojxarsfaewehwjidwgac.supabase.co';
  const SUPABASE_KEY='sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0';
  const org=String(window.NETWORK_NOTICE_ORG||'ALL').toUpperCase();
  const list=document.getElementById('networkNoticeList');
  const count=document.getElementById('networkNoticeCount');
  if(!list) return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=d=>d?new Date(d).toLocaleDateString('ko-KR'):'';
  const active=x=>!x.expires_at || new Date(x.expires_at).getTime()>=Date.now();
  async function load(){
    try{
      const q='select=id,title,content,author,category,targets,is_pinned,published_at,expires_at&is_published=eq.true&order=is_pinned.desc,published_at.desc';
      const r=await fetch(SUPABASE_URL+'/rest/v1/network_notices?'+q,{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY}});
      if(!r.ok) throw new Error(await r.text());
      const rows=(await r.json()).filter(x=>active(x)&&Array.isArray(x.targets)&&(x.targets.includes('ALL')||x.targets.includes(org)));
      if(count) count.textContent='통합공지 '+rows.length+'건';
      if(!rows.length){list.innerHTML='<div class="network-notice-empty">현재 표시할 글로벌 네트워크 공지가 없습니다.</div>';return;}
      list.innerHTML=rows.map(x=>`<article class="network-notice-card ${x.is_pinned?'is-pinned':''}"><div class="network-notice-meta"><b>${x.is_pinned?'📌 중요':'🌐 NETWORK'}</b><span>${esc(x.category||'총재 메시지')}</span><time>${fmt(x.published_at)}</time></div><h3>${esc(x.title)}</h3><p>${esc(x.content).replace(/\n/g,'<br>')}</p><footer>${esc(x.author||'전성권 총재')}</footer></article>`).join('');
    }catch(e){console.error('Network notice load error',e);list.innerHTML='<div class="network-notice-empty">통합공지 DB 연결 전입니다. 먼저 제공된 Supabase SQL을 실행해주세요.</div>';if(count)count.textContent='통합공지 연결 대기';}
  }
  load();
  setInterval(load,60000);
})();