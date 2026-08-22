(function(){
 const ROOT=document.querySelector('[data-gms-public]');
 if(!ROOT||typeof supabase==='undefined')return;
 const org=(ROOT.dataset.org||'IPMA').toUpperCase();
 const db=supabase.createClient('https://ojxarsfaewehwjidwgac.supabase.co','sb_publishable_ZoAZrV5rDmYDLxhXlnEXCw_lPqJfin0');
 const $=id=>document.getElementById(id);
 const n=v=>Number(v||0).toLocaleString('ko-KR');
 const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
 const label=t=>({new_member:'신규회원',new_branch:'신규지부',appointment:'임원임명',certificate:'단증발급',notice:'소식'}[t]||'소식');
 async function load(){
   const [sr,ar]=await Promise.all([
     db.rpc('gms_get_public_stats',{p_organization_code:org}),
     db.rpc('gms_get_public_activity',{p_organization_code:org,p_limit:12})
   ]);
   if(!sr.error&&sr.data){
     $('gmsLegacy')&&($('gmsLegacy').textContent=n(sr.data.legacy_members));
     $('gmsApproved')&&($('gmsApproved').textContent=n(sr.data.approved_applications));
     $('gmsActivity30')&&($('gmsActivity30').textContent=n(sr.data.activity_30d));
     $('gmsOnlineTotal')&&($('gmsOnlineTotal').textContent=n(sr.data.online_members_total));
   }
   const feed=$('gmsPublicFeed');
   if(feed){
     if(ar.error){feed.innerHTML='<span>통합 활동피드 DB 설정 후 자동 표시됩니다.</span>';return}
     const a=ar.data||[];
     feed.innerHTML=a.length?a.map(x=>`<span class="gms-feed-item"><b>${label(x.event_type)}</b> ${esc(x.subject_masked||'')} ${esc(x.detail||'')} <small>${new Date(x.occurred_at).toLocaleDateString('ko-KR')}</small></span>`).join(''):'<span class="gms-feed-item">새로운 활동 소식이 등록되면 이곳에 자동으로 표시됩니다.</span>';
   }
 }
 load().catch(()=>{});
})();
