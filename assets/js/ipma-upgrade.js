(function(){
 const t=document.querySelector('.ipma-menu-toggle'), n=document.querySelector('.ipma-mega-nav'); if(t&&n)t.addEventListener('click',()=>n.classList.toggle('open'));
 // IPMA OFFICIAL GUIDE v1.0: add one shared menu entry without rewriting every page header.
 if(n && !n.querySelector('[data-ipma-official-guide]')){
   const prefix=(location.pathname==='/'||location.pathname.endsWith('/index.html')&&location.pathname.split('/').filter(Boolean).length===1)?'./':'../';
   const item=document.createElement('div');
   item.className='ipma-nav-item'; item.dataset.ipmaOfficialGuide='1';
   item.innerHTML='<a class="ipma-nav-main" href="'+prefix+'official-guide/">공식 Q&amp;A</a><div class="ipma-dropdown"><b>공식 질문과 답변</b><a href="'+prefix+'official-guide/">공식 Q&amp;A 센터</a><a href="'+prefix+'verification/">공식 조회</a><a href="'+prefix+'leadership/">공식 임원 안내</a><a href="'+prefix+'branches/">공식 지부 안내</a></div>';
   const verification=[...n.querySelectorAll(':scope > .ipma-nav-item')].find(el=>/조회|인증/.test(el.querySelector('.ipma-nav-main')?.textContent||''));
   n.insertBefore(item,verification||null);
 }
 // IPMA ASSOCIATION v2.4.2: restore mobile horizontal primary navigation.
 // The original mega-nav remains untouched and continues to serve the hamburger menu.
 if(n && !document.querySelector('.ipma-mobile-primary')){
   const strip=document.createElement('nav'); strip.className='ipma-mobile-primary'; strip.setAttribute('aria-label','경찰무도 모바일 주요 메뉴');
   n.querySelectorAll(':scope > .ipma-nav-item > .ipma-nav-main').forEach(a=>strip.appendChild(a.cloneNode(true)));
   const header=document.querySelector('.ipma-mega-header'); if(header) header.insertAdjacentElement('afterend',strip);
 }
 document.querySelectorAll('.ipma-nav-main').forEach(a=>a.addEventListener('click',e=>{if(innerWidth<=900){const item=a.closest('.ipma-nav-item'); if(item&&item.querySelector('.ipma-dropdown')){e.preventDefault(); item.classList.toggle('open')}}}));
 const modal=document.querySelector('.ipma-modal'), frame=document.querySelector('.ipma-modal-frame');
 document.querySelectorAll('.ipma-video-thumb').forEach(b=>b.addEventListener('click',()=>{if(!modal||!frame)return; const id=b.dataset.videoId; frame.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0" title="'+(b.dataset.videoTitle||'영상')+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; modal.classList.add('open'); document.body.style.overflow='hidden'}));
 function close(){if(!modal)return;modal.classList.remove('open');if(frame)frame.innerHTML='';document.body.style.overflow=''}
 document.querySelector('.ipma-modal-close')?.addEventListener('click',close); modal?.addEventListener('click',e=>{if(e.target===modal)close()}); document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

 // IPMA 회원가입 링크를 모든 메가메뉴의 참여·문의 영역에 자동 추가
 document.querySelectorAll('.ipma-nav-item').forEach(item=>{
   const main=item.querySelector('.ipma-nav-main');
   if(!main || !/참여|문의/.test(main.textContent)) return;
   const dd=item.querySelector('.ipma-dropdown'); if(!dd || dd.querySelector('[data-ipma-member-link]')) return;
   const prefix=(location.pathname==='/'||location.pathname.endsWith('/index.html'))?'./':'../';
   const a=document.createElement('a'); a.href=prefix+'member/'; a.textContent='IPMA 회원가입'; a.dataset.ipmaMemberLink='1';
   dd.insertBefore(a,dd.querySelector('a'));
 });
})();
