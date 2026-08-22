(() => {
  const LANGS=[
    ['ko','kr','한국어'],['en','us','English'],['zh-CN','cn','中文'],['ja','jp','日本語'],['es','es','Español'],['fr','fr','Français'],['de','de','Deutsch'],['pt','br','Português'],['it','it','Italiano'],['ru','ru','Русский'],['mn','mn','Монгол'],['vi','vn','Tiếng Việt'],['th','th','ไทย'],['id','id','Bahasa Indonesia'],['ms','my','Bahasa Melayu'],['tl','ph','Filipino'],['hi','in','हिन्दी'],['ar','sa','العربية'],['tr','tr','Türkçe'],['ne','np','नेपाली']
  ];
  const root=document.createElement('div'); root.className='ipma20-root';
  root.innerHTML=`<button class="ipma20-open" type="button" aria-label="언어 선택">🌐 <span>20 Languages</span></button><div class="ipma20-panel" hidden><div class="ipma20-head"><div><small>IPMA WORLD HEADQUARTERS</small><strong>언어를 선택하세요</strong><p>홈페이지의 글과 메뉴를 선택한 언어로 봅니다.</p></div><button class="ipma20-close" type="button">×</button></div><div class="ipma20-grid"></div><div class="ipma20-note">※ 교육 동영상의 음성·자막은 별도이며 순차적으로 다국어 지원 예정입니다.</div></div>`;
  document.body.appendChild(root);
  const panel=root.querySelector('.ipma20-panel'), grid=root.querySelector('.ipma20-grid');
  function currentCleanUrl(){const u=new URL(location.href);u.searchParams.delete('lang');return u.href;}
  function go(code){
    localStorage.setItem('ipma_language',code);
    if(code==='ko'){ location.href=currentCleanUrl(); return; }
    const target=currentCleanUrl();
    location.href='https://translate.google.com/translate?sl=ko&tl='+encodeURIComponent(code)+'&u='+encodeURIComponent(target);
  }
  LANGS.forEach(([code,flag,name])=>{const b=document.createElement('button');b.type='button';b.className='ipma20-lang';b.innerHTML=`<img src="../assets/flags/${flag}.svg" alt=""><span>${name}</span>`;b.onclick=()=>go(code);grid.appendChild(b)});
  root.querySelector('.ipma20-open').onclick=()=>{panel.hidden=false;document.body.classList.add('ipma20-lock')};
  root.querySelector('.ipma20-close').onclick=()=>{panel.hidden=true;document.body.classList.remove('ipma20-lock')};
  panel.addEventListener('click',e=>{if(e.target===panel){panel.hidden=true;document.body.classList.remove('ipma20-lock')}});
})();
