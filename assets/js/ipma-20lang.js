(() => {
  const flagsBase=new URL('../flags/', document.currentScript.src).href;
  const LANGUAGES=[{"code":"ko","flag":"kr","name":"한국어"},{"code":"en","flag":"us","name":"English"},{"code":"zh","flag":"cn","name":"中文"},{"code":"ja","flag":"jp","name":"日本語"},{"code":"es","flag":"es","name":"Español"},{"code":"fr","flag":"fr","name":"Français"},{"code":"de","flag":"de","name":"Deutsch"},{"code":"pt","flag":"br","name":"Português"},{"code":"it","flag":"it","name":"Italiano"},{"code":"ru","flag":"ru","name":"Русский"},{"code":"mn","flag":"mn","name":"Монгол"},{"code":"vi","flag":"vn","name":"Tiếng Việt"},{"code":"th","flag":"th","name":"ไทย"},{"code":"id","flag":"id","name":"Bahasa Indonesia"},{"code":"ms","flag":"my","name":"Bahasa Melayu"},{"code":"fil","flag":"ph","name":"Filipino"},{"code":"hi","flag":"in","name":"हिन्दी"},{"code":"ar","flag":"sa","name":"العربية"},{"code":"tr","flag":"tr","name":"Türkçe"},{"code":"ne","flag":"np","name":"नेपाली"}];
  const LANGS=LANGUAGES.map(x=>[x.code,x.flag,x.name]);
  const I18N={"ko":["경찰무도","태권검도","드론순찰대","바로가기","숫자가 말해주는 성장하는 네트워크","규모를 설명하지 않습니다. 계속 변하는 숫자로 보여줍니다.","기술 · 체력 · 정신력 · 현장 대응","전통 · 정신 · 문화 · 미래세대","첨단기술 · 감시 · 수색 · 구조 · 안전","사이트 입장 →","세 개의 세계, 하나의 관문"],"en":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"zh":["警察武道","跆拳剑道","无人机巡逻队","快速入口","用数字展现不断成长的全球网络","通过持续变化的数据展示我们的全球规模。","技术 · 体能 · 精神 · 现场应对","传统 · 精神 · 文化 · 未来一代","先进技术 · 巡逻 · 搜索 · 救援 · 安全","进入网站 →","三个领域，一个全球门户"],"ja":["警察武道","テコンドー剣道","ドローンパトロール","クイックアクセス","数字で見る成長するネットワーク","変化し続ける数字で世界規模を示します。","技術 · 体力 · 精神 · 現場対応","伝統 · 精神 · 文化 · 次世代","先端技術 · 監視 · 捜索 · 救助 · 安全","サイトへ →","三つの世界、一つのゲートウェイ"],"es":["Artes Marciales Policiales","TaekwonKumdo","Patrulla de Drones","Acceso rápido","Una red global en crecimiento","Mostramos nuestra escala con cifras que siguen creciendo.","Técnica · Aptitud · Disciplina · Respuesta","Tradición · Espíritu · Cultura · Futuro","Tecnología · Patrulla · Búsqueda · Rescate · Seguridad","ENTRAR →","Tres mundos, una puerta global"],"fr":["Arts martiaux policiers","TaekwonKumdo","Patrouille de drones","Accès rapide","Un réseau mondial en croissance","Notre réseau mondial évolue en temps réel.","Technique · Forme · Discipline · Intervention","Tradition · Esprit · Culture · Avenir","Technologie · Patrouille · Recherche · Sauvetage · Sécurité","ENTRER →","Trois univers, une passerelle"],"de":["Polizei-Kampfkunst","TaekwonKumdo","Drohnenpatrouille","Schnellzugriff","Ein wachsendes globales Netzwerk","Unser Netzwerk wächst und verbindet die Welt.","Technik · Fitness · Disziplin · Einsatz","Tradition · Geist · Kultur · Zukunft","Technologie · Patrouille · Suche · Rettung · Sicherheit","SEITE ÖFFNEN →","Drei Welten, ein Tor"],"pt":["Artes Marciais Policiais","TaekwonKumdo","Patrulha de Drones","Acesso rápido","Uma rede global em crescimento","Nossa rede conecta pessoas em todo o mundo.","Técnica · Condicionamento · Disciplina · Resposta","Tradição · Espírito · Cultura · Futuro","Tecnologia · Patrulha · Busca · Resgate · Segurança","ENTRAR →","Três mundos, um portal"],"it":["Arti Marziali di Polizia","TaekwonKumdo","Pattuglia Drone","Accesso rapido","Una rete globale in crescita","La nostra rete collega il mondo.","Tecnica · Fitness · Disciplina · Risposta","Tradizione · Spirito · Cultura · Futuro","Tecnologia · Pattuglia · Ricerca · Soccorso · Sicurezza","ENTRA →","Tre mondi, un portale"],"ru":["Полицейские боевые искусства","Тхэквондо-кумдо","Дрон-патруль","Быстрый доступ","Растущая глобальная сеть","Наша сеть объединяет людей по всему миру.","Техника · Подготовка · Дисциплина · Реагирование","Традиции · Дух · Культура · Будущее","Технологии · Патруль · Поиск · Спасение · Безопасность","ВОЙТИ →","Три направления, один портал"],"mn":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"vi":["Võ thuật Cảnh sát","TaekwonKumdo","Tuần tra Drone","Truy cập nhanh","Mạng lưới toàn cầu đang phát triển","Mạng lưới của chúng tôi kết nối toàn thế giới.","Kỹ thuật · Thể lực · Kỷ luật · Ứng phó","Truyền thống · Tinh thần · Văn hóa · Tương lai","Công nghệ · Tuần tra · Tìm kiếm · Cứu hộ · An toàn","VÀO TRANG →","Ba lĩnh vực, một cổng toàn cầu"],"th":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"id":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"ms":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"fil":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"hi":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"ar":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"tr":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"],"ne":["Police Martial Arts","TaekwonKumdo","Drone Patrol","Quick Access","A growing network shown by numbers","We show our scale through numbers that keep changing.","Skills · Fitness · Discipline · Field Response","Tradition · Spirit · Culture · Future Generations","Advanced Technology · Patrol · Search · Rescue · Safety","ENTER SITE →","Three worlds, one gateway"]};
  const normalize=code=>({'zh-CN':'zh',tl:'fil'}[code]||code);
  const originalText=new Map();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
    return node.parentElement.closest('script,style,textarea,input,select,.ipma20-root,#languageDialog')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
  }});
  while(walker.nextNode())originalText.set(walker.currentNode,walker.currentNode.nodeValue);
  const queryLang=new URLSearchParams(location.search).get('lang');
  let currentLang=normalize(queryLang||localStorage.getItem('ipma_language')||'ko');
  if(!LANGUAGES.some(x=>x.code===currentLang))currentLang='ko';

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

  function applyLanguage(code){
    currentLang=normalize(code);
    if(!LANGUAGES.some(x=>x.code===currentLang))currentLang='ko';
    localStorage.setItem('ipma_language',currentLang);
    document.documentElement.lang=currentLang;
    document.documentElement.dir=currentLang==='ar'?'rtl':'ltr';
    const L=I18N[currentLang]||I18N.ko;
    originalText.forEach((original,node)=>{
      if(!node.isConnected)return;
      const index=I18N.ko.indexOf(original.trim());
      if(index>=0)node.nodeValue=original.replace(original.trim(),L[index]||original.trim());
    });
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      const value=window.IPMA_I18N?.[currentLang]?.[key];
      if(typeof value==='string'){
        if(!el.dataset.ipmaOriginalText)el.dataset.ipmaOriginalText=el.textContent;
        el.textContent=currentLang==='ko'?el.dataset.ipmaOriginalText:value;
      }else if(currentLang==='ko'&&el.dataset.ipmaOriginalText)el.textContent=el.dataset.ipmaOriginalText;
    });
    const u=new URL(location.href);u.searchParams.set('lang',currentLang);history.replaceState(history.state,'',u);
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href');
      if(!href||href.startsWith('#'))return;
      const target=new URL(href,location.href);
      if(target.origin!==location.origin||/\/(?:admin[^/]*|gms-admin|member-login|ai-office|mypage)(?:\/|$)/.test(target.pathname))return;
      target.searchParams.set('lang',currentLang);a.href=target.href;
    });
    document.dispatchEvent(new CustomEvent('ipma-language-change',{detail:{code:currentLang}}));
  }
  function go(code){applyLanguage(code);close();}

  LANGS.forEach(([code,flag,name])=>{
    const b=document.createElement('button');
    b.type='button'; b.className='ipma20-lang';
    b.innerHTML=`<img src="${flagsBase}${flag}.svg" alt=""><span>${name}</span>`;
    b.onclick=()=>go(code);
    grid.appendChild(b);
  });

  const open=()=>{panel.hidden=false;document.body.classList.add('ipma20-lock')};
  const close=()=>{panel.hidden=true;document.body.classList.remove('ipma20-lock')};

  if(document.getElementById('langBtn')){
    applyLanguage(currentLang);
    document.getElementById('languageGrid')?.addEventListener('click',e=>{const option=e.target.closest('[data-lang]');if(option)applyLanguage(option.dataset.lang)});
    root.remove();return;
  }
  document.querySelectorAll('.ipma20-top-open').forEach(b=>b.addEventListener('click',open));
  root.querySelector('.ipma20-close').onclick=close;
  panel.addEventListener('click',e=>{if(e.target===panel)close()});

  applyLanguage(currentLang);
})();
