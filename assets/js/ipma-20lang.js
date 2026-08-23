(() => {
  const LANGS=[
    ['ko','kr','한국어'],['en','us','English'],['zh-CN','cn','中文'],['ja','jp','日本語'],
    ['es','es','Español'],['fr','fr','Français'],['de','de','Deutsch'],['pt','br','Português'],
    ['it','it','Italiano'],['ru','ru','Русский'],['mn','mn','Монгол'],['vi','vn','Tiếng Việt'],
    ['th','th','ไทย'],['id','id','Bahasa Indonesia'],['ms','my','Bahasa Melayu'],['tl','ph','Filipino'],
    ['hi','in','हिन्दी'],['ar','sa','العربية'],['tr','tr','Türkçe'],['ne','np','नेपाली']
  ];

  const root=document.createElement('div');
  root.className='ipma20-root';
  root.innerHTML=`<div class="ipma20-panel" hidden>
    <div class="ipma20-head">
      <div><small>IPMA WORLD HEADQUARTERS</small><strong>언어를 선택하세요</strong>
      <p>국제경찰무도연합회 홈페이지를 선택한 언어로 볼 수 있습니다.</p></div>
      <button class="ipma20-close" type="button" aria-label="닫기">×</button>
    </div>
    <div class="ipma20-grid"></div>
    <div class="ipma20-note">※ 교육 동영상의 음성·자막은 별도이며 순차적으로 다국어 지원 예정입니다.</div>
  </div>`;
  document.body.appendChild(root);

  const panel=root.querySelector('.ipma20-panel');
  const grid=root.querySelector('.ipma20-grid');

  function cleanUrl(){
    const u=new URL(location.href);
    u.searchParams.delete('lang');
    return u.href;
  }
  function translateTarget(code){
    const target=cleanUrl();
    return 'https://translate.google.com/translate?sl=ko&tl='+encodeURIComponent(code)+'&u='+encodeURIComponent(target);
  }
  function go(code){
    localStorage.setItem('ipma_language',code);
    if(code==='ko'){ location.href=cleanUrl(); return; }
    location.href=translateTarget(code);
  }

  LANGS.forEach(([code,flag,name])=>{
    const b=document.createElement('button');
    b.type='button'; b.className='ipma20-lang';
    b.innerHTML=`<img src="../assets/flags/${flag}.svg" alt=""><span>${name}</span>`;
    b.onclick=()=>go(code);
    grid.appendChild(b);
  });

  const open=()=>{panel.hidden=false;document.body.classList.add('ipma20-lock')};
  const close=()=>{panel.hidden=true;document.body.classList.remove('ipma20-lock')};

  document.querySelectorAll('.ipma20-top-open').forEach(b=>b.addEventListener('click',open));
  root.querySelector('.ipma20-close').onclick=close;
  panel.addEventListener('click',e=>{if(e.target===panel)close()});

  // ?lang=en, ?lang=zh-CN 등 직접 주소도 동작하도록 처리
  const requested=new URL(location.href).searchParams.get('lang');
  if(requested && requested!=='ko' && LANGS.some(x=>x[0]===requested)){
    // Google 번역 프록시 안에서 다시 리다이렉트하지 않도록 방지
    if(!/translate\.google\./i.test(location.hostname)){
      location.replace(translateTarget(requested));
    }
  }
})();
