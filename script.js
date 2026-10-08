(() => {
  const cfg = window.GATEWAY_CONFIG || {};
  const slidesEl = document.getElementById('slides');
  const title = document.getElementById('heroTitle');
  const eyebrow = document.getElementById('heroEyebrow');
  const note = document.getElementById('heroNote');
  const now = document.getElementById('slideNow');
  const total = document.getElementById('slideTotal');
  const progress = document.getElementById('progressBar');
  const intervalMs = 7000;
  let index = 0, timer, touchX = 0;

  document.getElementById('version').textContent = `v${cfg.version || '1.0.0'}`;
  const slides = cfg.slides || [];
  total.textContent = String(slides.length).padStart(2,'0');

  slides.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = `slide${i===0?' active':''}`;
    div.style.backgroundImage = `url('${s.src}')`;
    div.setAttribute('role','img');
    div.setAttribute('aria-label', s.title || `슬라이드 ${i+1}`);
    slidesEl.appendChild(div);
  });
  const slideNodes = [...document.querySelectorAll('.slide')];

  function animateProgress(){
    progress.style.transition = 'none'; progress.style.width = '0%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{progress.style.transition=`width ${intervalMs}ms linear`;progress.style.width='100%';}));
  }
  // Public hero translations. Keep English as the readable fallback until
  // individually reviewed translations are supplied for other languages.
  const HERO_EN = [
    ['ONE NETWORK. THREE MISSIONS.','Police Martial Arts · Taekwon-Kumdo · Drone Patrol'],
    ['Martial Arts for Real-World Situations','Technique · Fitness · Mental Strength'],
    ['Control in Motion','Training · Self-Defense · Response'],
    ['A World Connected Through Education','International Seminars · Instructor Exchange'],
    ['Honoring Tradition, Shaping the Future','Taekwondo and Swordsmanship Combined'],
    ['The Path of the Sword, the Focus of Training','Precision · Discipline · Harmony'],
    ['Martial Arts for the Next Generation','Confidence · Focus · Growth'],
    ['See Further, Protect Closer','Patrol · Safety · Technology'],
    ['Connecting Operations from the Sky','Urban Areas · Mountains · Disasters'],
    ['Finding People, Protecting Lives','Search · Rescue · Disaster Response'],
    ['One Connected Global Network','Connection · Cooperation · Education'],
    ['ONE MISSION. ONE NETWORK. ONE FUTURE.','Police Martial Arts · Taekwon-Kumdo · Drone Patrol']
  ];
  function refreshHeroCopy(){
    const s=slides[index];
    if(!s) return;
    const code=localStorage.getItem('ipma_language') || 'ko';
    const copy=code==='ko' ? null : HERO_EN[index];
    eyebrow.textContent=s.eyebrow||'';
    title.textContent=copy ? copy[0] : (s.title||'');
    note.textContent=copy ? copy[1] : (s.note||'');
  }
  function show(next){
    index = (next + slides.length) % slides.length;
    slideNodes.forEach((el,i)=>el.classList.toggle('active',i===index));
    refreshHeroCopy();
    now.textContent=String(index+1).padStart(2,'0');
    animateProgress();
  }
  function play(){clearInterval(timer);timer=setInterval(()=>show(index+1),intervalMs);animateProgress();}
  document.getElementById('prevBtn').addEventListener('click',()=>{show(index-1);play()});
  document.getElementById('nextBtn').addEventListener('click',()=>{show(index+1);play()});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){show(index+1);play()} if(e.key==='ArrowLeft'){show(index-1);play()}});
  const hero=document.querySelector('.hero');
  hero.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
  hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>50){show(index+(dx<0?1:-1));play()}},{passive:true});
  play();

  document.querySelectorAll('.world-section[data-bg]').forEach(el=>el.style.setProperty('--world-bg',`url('${el.dataset.bg}')`));

  // v1.3.5: 모바일에서는 NETWORK 섹션이 화면보다 길어 threshold .35에 도달하지 못할 수 있음.
  // 카운터 데이터는 즉시 불러오고, observer는 보조 수단으로만 사용한다.
  const networkSection=document.querySelector('.network');
  const numberObserver = new IntersectionObserver(entries=>entries.forEach(ent=>{
    if(ent.isIntersecting){runCounters();numberObserver.disconnect();}
  }),{threshold:.01});
  if(networkSection) numberObserver.observe(networkSection);
  function countTo(el,target,suffix=''){
    const dur=1800,start=performance.now();
    function step(t){const p=Math.min(1,(t-start)/dur),ease=1-Math.pow(1-p,3);el.textContent=Math.floor(target*ease).toLocaleString('ko-KR')+suffix;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  }
  let countersStarted=false;
  function runCounters(){
    if(countersStarted)return;
    countersStarted=true;
    loadTopCounters();
    loadOrgDashboard();
  }
  // PC/모바일 공통: 페이지가 열리면 바로 Supabase 숫자를 요청한다.
  runCounters();
  let gmsClient=null;
  async function gmsRpc(name,args={}){
    const sb=cfg.supabase||{};
    if(!sb.url||!sb.anonKey)return {data:null,error:new Error('Supabase config missing')};
    try{
      const res=await fetch(`${sb.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:sb.anonKey,Authorization:`Bearer ${sb.anonKey}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
      const data=await res.json().catch(()=>null); if(!res.ok)throw new Error(data?.message||`HTTP ${res.status}`); return {data,error:null};
    }catch(error){return {data:null,error}}
  }
  async function loadTopCounters(){
    const {data,error}=await gmsRpc('gms_get_gateway_stats_v1',{});
    const A=statObj(data);
    const countryEl=document.querySelector('[data-counter="countries"]');
    const branchEl=document.querySelector('[data-counter="branches"]');
    const memberEl=document.querySelector('[data-counter="members"]');
    const status=document.getElementById('memberStatus');
    if(!error&&A){
      if(countryEl){countryEl.textContent='0';countTo(countryEl,Number(A.network_countries||cfg.stats?.countries||51));}
      if(branchEl){branchEl.textContent='0';countTo(branchEl,Number(A.network_branches||cfg.stats?.branches||150),'+');}
      if(memberEl){memberEl.textContent='0';countTo(memberEl,Number(A.public_members_total||0));}
      if(status)status.textContent='LIVE · SUPABASE';
      const today=document.getElementById('gatewayTodayMembers'),ga=document.getElementById('gatewayGlobalApproved'),gc=document.getElementById('gatewayGlobalCountries');
      if(today)today.textContent=Number(A.new_members_today||0).toLocaleString('ko-KR');
      if(ga)ga.textContent=Number(A.global_members_total ?? A.global_approved ?? 0).toLocaleString('ko-KR');
      if(gc)gc.textContent=Number(A.global_countries||A.network_countries||0).toLocaleString('ko-KR');
      return;
    }
    if(countryEl)countTo(countryEl,cfg.stats?.countries||51);
    if(branchEl)countTo(branchEl,cfg.stats?.branches||150,'+');
    if(memberEl){memberEl.textContent='—';}
    if(status)status.textContent='GMS 연결 확인 필요';
  }
  async function loadMembers(){
    const el=document.querySelector('[data-counter="members"]'), status=document.getElementById('memberStatus');
    const {data,error}=await gmsRpc('gms_get_public_stats',{p_organization_code:null});
    if(!error&&data){
      const count=Number(data.public_members_total||0); el.textContent='0';countTo(el,count);status.textContent='LIVE · GMS';
      const today=document.getElementById('gatewayTodayMembers'),ga=document.getElementById('gatewayGlobalApproved'),gc=document.getElementById('gatewayGlobalCountries');
      if(today)today.textContent=Number(data.new_members_today||0).toLocaleString('ko-KR');
      if(ga)ga.textContent=Number(data.global_members_total ?? data.global_approved ?? 0).toLocaleString('ko-KR');
      if(gc)gc.textContent=Number(data.global_countries||0).toLocaleString('ko-KR');
      return;
    }
    if(Number.isFinite(cfg.stats?.membersFallback)){el.textContent='0';countTo(el,cfg.stats.membersFallback);status.textContent='현재 등록 회원';}
    else {el.textContent='—';status.textContent='GMS 연결 후 자동 표시';}
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
  function countryFlag(code){
    const c=String(code||'').toLowerCase();
    return c ? `<img class="feed-flag" src="assets/flags/${escapeHtml(c)}.svg" alt="${escapeHtml(c.toUpperCase())}" onerror="this.style.display='none'">` : '<span class="feed-globe">🌐</span>';
  }
  function orgLabel(codes){
    const map={WTKF:'TAEKWONKUMDO',IPMA:'POLICE MARTIAL ARTS',IDP:'DRONE PATROL'};
    return codes.map(c=>map[c]||c).join(' · ');
  }
  function groupMemberRows(rows){
    const groups=[];
    rows.forEach(x=>{
      const stamp=new Date(x.occurred_at||0);
      const minute=Number.isNaN(stamp.getTime())?'':stamp.toISOString().slice(0,16);
      const key=[x.subject_masked||'',x.detail||'',x.country_code||'',minute].join('|');
      let g=groups.find(v=>v.key===key);
      if(!g){g={key,subject:x.subject_masked||'회원',detail:x.detail||'Global Member',country:x.country_code||'',time:x.occurred_at,orgs:[]};groups.push(g)}
      if(x.organization_code&&!g.orgs.includes(x.organization_code))g.orgs.push(x.organization_code);
    });
    return groups.slice(0,10);
  }
  async function loadGatewayMemberFeed(){
    const feed=document.getElementById('gatewayMemberFeed'); if(!feed)return;
    const {data,error}=await gmsRpc('gms_get_public_activity',{p_organization_code:null,p_limit:30});
    if(error||!Array.isArray(data)){feed.innerHTML='<span class="member-live-item">GMS 실시간 피드를 연결하는 중입니다.</span>';return}
    const groups=groupMemberRows(data.filter(x=>x.event_type==='new_member'));
    if(!groups.length){feed.innerHTML='<span class="member-live-item">새로운 회원이 승인되면 이곳에 실시간으로 표시됩니다.</span>';return}
    const itemHtml=groups.map(g=>`<span class="member-live-item">${countryFlag(g.country)}<span class="member-country">${escapeHtml((g.country||'GLOBAL').toUpperCase())}</span><b>${escapeHtml(g.subject)}</b><span class="member-joined">NEW GLOBAL MEMBER</span><span class="orgs">${escapeHtml(orgLabel(g.orgs))}</span><small>${new Date(g.time).toLocaleDateString('ko-KR')}</small></span>`).join('');
    feed.innerHTML=`<span class="member-live-set">${itemHtml}</span><span class="member-live-set" aria-hidden="true">${itemHtml}</span>`;
  }
  async function refreshGmsLive(){await Promise.all([loadMembers(),loadGatewayMemberFeed()])}
  function initGmsRealtime(){
    const sb=cfg.supabase||{}; if(!window.supabase||!sb.url||!sb.anonKey)return;
    try{
      gmsClient=window.supabase.createClient(sb.url,sb.anonKey,{auth:{persistSession:false}});
      gmsClient.channel('gateway-public-members').on('postgres_changes',{event:'INSERT',schema:'public',table:'gms_public_activity'},payload=>{
        if(payload.new?.is_public!==false){
          const board=document.getElementById('gatewayLiveBoard');
          if(board){board.classList.remove('live-flash');void board.offsetWidth;board.classList.add('live-flash')}
          refreshGmsLive(); refreshIpmaNetworkLive();
        }
      }).subscribe();
    }catch(e){console.warn('GMS realtime',e)}
  }

  function statObj(v){ return Array.isArray(v) ? (v[0]||{}) : (v||{}); }
  function statOrgTotal(s){
    s=statObj(s);
    if(s.organization_members_total!=null) return Number(s.organization_members_total||0);
    const legacy=Number(s.legacy_members||0);
    const approved=Number(s.approved_applications||0);
    return legacy+approved;
  }
  function setLiveNumber(id,value,suffix='명'){
    const el=document.getElementById(id); if(!el)return;
    el.textContent=Number(value||0).toLocaleString('ko-KR')+suffix;
  }
  async function loadOrgDashboard(){
    try{
      // v1.3.5: 조직별 4번 RPC 대신 전용 통계 RPC 1번만 호출
      // WTKF/IDP 신규 일괄등록 회원을 공개 카운터에 즉시 반영한다.
      const {data,error}=await gmsRpc('gms_get_gateway_stats_v1',{});
      if(error||!data){
        console.warn('GMS gateway stats',error);
        return;
      }
      const S=statObj(data);
      setLiveNumber('ipmaNetAll',Number(S.public_members_total||0));
      setLiveNumber('ipmaNetIPMA',Number(S.ipma_members_total||0));
      setLiveNumber('ipmaNetWTKF',Number(S.wtkf_members_total||0));
      setLiveNumber('ipmaNetIDP',Number(S.idp_members_total||0));
      setLiveNumber('ipmaNetGlobal',Number(S.global_members_total ?? S.global_approved ?? 0));
      const c=document.getElementById('ipmaNetCountries');
      if(c)c.textContent=Number(S.network_countries||cfg.stats?.countries||51).toLocaleString('ko-KR')+'개국';
    }catch(e){console.warn('GMS org dashboard',e)}
  }

  function liveFlag(code){
    const c=String(code||'').toLowerCase();
    return c ? `<img class="ipma-live3-flag" src="assets/flags/${escapeHtml(c)}.svg" alt="${escapeHtml(c.toUpperCase())}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ipma-live3-globe',textContent:'🌐'}))">` : '<span class="ipma-live3-globe">🌐</span>';
  }
  function liveDate(v){try{return new Date(v).toLocaleDateString('ko-KR',{month:'2-digit',day:'2-digit'}).replace(/\.\s*$/,'')}catch(e){return ''}}
  function renderLive3(id,rows,emptyText){
    const el=document.getElementById(id); if(!el)return;
    const list=(rows||[]).slice(0,8);
    if(!list.length){el.className='ipma-live3-track';el.innerHTML=`<div class="ipma-live3-empty">${escapeHtml(emptyText)}</div>`;return}
    const items=list.map(r=>`<div class="ipma-live3-item">${liveFlag(r.country_code)}<span class="ipma-live3-main"><span class="ipma-live3-name">${escapeHtml(r.subject_masked||'IPMA')}</span><span class="ipma-live3-detail">${escapeHtml(r.detail||r.event_type||'Activity')}</span></span><span class="ipma-live3-date">${liveDate(r.occurred_at)}</span></div>`).join('');
    el.innerHTML=items+items; el.className='ipma-live3-track is-moving';
  }
  async function loadIpmaActivities(){
    const {data,error}=await gmsRpc('gms_get_public_activity',{p_organization_code:'IPMA',p_limit:40});
    if(error||!Array.isArray(data))return;
    const members=data.filter(x=>['new_member','certificate'].includes(x.event_type));
    const branches=data.filter(x=>['new_branch','notice'].includes(x.event_type));
    const appointments=data.filter(x=>x.event_type==='appointment');
    renderLive3('ipmaLiveMembers',members,'새로운 경찰무도 회원·단증 활동이 등록되면 자동 표시됩니다.');
    renderLive3('ipmaLiveBranches',branches,'새로운 도장·지부 소식이 등록되면 자동 표시됩니다.');
    renderLive3('ipmaLiveAppointments',appointments,'새로운 임원·지도자 임명이 등록되면 자동 표시됩니다.');
  }

  async function refreshIpmaNetworkLive(){ await Promise.all([loadOrgDashboard(),loadIpmaActivities()]); }
  loadOrgDashboard(); loadIpmaActivities();

  loadGatewayMemberFeed(); initGmsRealtime();

  // v1.3.6: GLOBAL MEMBERS 카드에서 세계회원 + 기존 해외지부 회원 명단 표시
  const globalMembersDialog=document.getElementById('globalMembersDialog');
  const globalMembersCard=document.getElementById('globalMembersCard');
  async function openGlobalMembers(){
    if(!globalMembersDialog)return;
    const list=document.getElementById('globalMembersList');
    if(list)list.innerHTML='<div class="global-members-loading">세계회원 명단을 불러오는 중입니다.</div>';
    globalMembersDialog.showModal();
    const {data,error}=await gmsRpc('gms_get_global_member_directory_v2',{});
    if(error||!Array.isArray(data)){if(list)list.innerHTML='<div class="global-members-loading">세계회원 명단 연결을 확인해 주세요.</div>';return}
    const countries=new Set(data.map(x=>String(x.country||'').trim().toLowerCase()).filter(Boolean));
    const total=document.getElementById('globalMembersTotal'), country=document.getElementById('globalMembersCountries');
    if(total)total.textContent=data.length.toLocaleString('ko-KR')+'명';
    if(country)country.textContent=countries.size.toLocaleString('ko-KR')+'개국';
    if(list)list.innerHTML=data.length?data.map(x=>`<div class="global-member-row"><b>${escapeHtml(x.display_name||'Global Member')}</b><span>${escapeHtml(x.country||'-')}</span><small class="global-member-branch">${escapeHtml(x.city_branch||'GLOBAL MEMBER')}${x.branch_no?` <i class="branch-no">No.${escapeHtml(x.branch_no)}</i>`:''}</small></div>`).join(''):'<div class="global-members-loading">등록된 세계회원이 없습니다.</div>';
  }
  if(globalMembersCard){globalMembersCard.onclick=openGlobalMembers;globalMembersCard.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openGlobalMembers()}}}
  const globalMembersClose=document.getElementById('globalMembersClose');
  if(globalMembersClose)globalMembersClose.onclick=()=>globalMembersDialog?.close();

  const dialog=document.getElementById('linkDialog');
  function enterSite(key){const url=cfg.links?.[key];if(url){const u=new URL(url,location.href);u.searchParams.set('lang',currentLang);window.location.href=u.toString()}else{dialog.showModal()}}
  document.querySelectorAll('[data-enter]').forEach(btn=>btn.addEventListener('click',()=>enterSite(btn.dataset.enter)));
  document.getElementById('dialogClose').onclick=()=>dialog.close();document.getElementById('dialogOk').onclick=()=>dialog.close();


  // IPMA v1.1.0 — 20-language global navigation layer
  const LANGUAGES = [{"code": "ko", "flag": "kr", "name": "한국어"}, {"code": "en", "flag": "us", "name": "English"}, {"code": "zh", "flag": "cn", "name": "中文"}, {"code": "ja", "flag": "jp", "name": "日本語"}, {"code": "es", "flag": "es", "name": "Español"}, {"code": "fr", "flag": "fr", "name": "Français"}, {"code": "de", "flag": "de", "name": "Deutsch"}, {"code": "pt", "flag": "br", "name": "Português"}, {"code": "it", "flag": "it", "name": "Italiano"}, {"code": "ru", "flag": "ru", "name": "Русский"}, {"code": "mn", "flag": "mn", "name": "Монгол"}, {"code": "vi", "flag": "vn", "name": "Tiếng Việt"}, {"code": "th", "flag": "th", "name": "ไทย"}, {"code": "id", "flag": "id", "name": "Bahasa Indonesia"}, {"code": "ms", "flag": "my", "name": "Bahasa Melayu"}, {"code": "fil", "flag": "ph", "name": "Filipino"}, {"code": "hi", "flag": "in", "name": "हिन्दी"}, {"code": "ar", "flag": "sa", "name": "العربية"}, {"code": "tr", "flag": "tr", "name": "Türkçe"}, {"code": "ne", "flag": "np", "name": "नेपाली"}];
  const I18N = {"ko": ["경찰무도", "태권검도", "드론순찰대", "바로가기", "숫자가 말해주는 성장하는 네트워크", "규모를 설명하지 않습니다. 계속 변하는 숫자로 보여줍니다.", "기술 · 체력 · 정신력 · 현장 대응", "전통 · 정신 · 문화 · 미래세대", "첨단기술 · 감시 · 수색 · 구조 · 안전", "사이트 입장 →", "세 개의 세계, 하나의 관문"], "en": ["Police Martial Arts", "TaekwonKumdo", "Drone Patrol", "Quick Access", "A growing network shown by numbers", "We show our scale through numbers that keep changing.", "Skills · Fitness · Discipline · Field Response", "Tradition · Spirit · Culture · Future Generations", "Advanced Technology · Patrol · Search · Rescue · Safety", "ENTER SITE →", "Three worlds, one gateway"], "zh": ["警察武道", "跆拳剑道", "无人机巡逻队", "快速入口", "用数字展现不断成长的全球网络", "通过持续变化的数据展示我们的全球规模。", "技术 · 体能 · 精神 · 现场应对", "传统 · 精神 · 文化 · 未来一代", "先进技术 · 巡逻 · 搜索 · 救援 · 安全", "进入网站 →", "三个领域，一个全球门户"], "ja": ["警察武道", "テコンドー剣道", "ドローンパトロール", "クイックアクセス", "数字で見る成長するネットワーク", "変化し続ける数字で世界規模を示します。", "技術 · 体力 · 精神 · 現場対応", "伝統 · 精神 · 文化 · 次世代", "先端技術 · 監視 · 捜索 · 救助 · 安全", "サイトへ →", "三つの世界、一つのゲートウェイ"], "es": ["Artes Marciales Policiales", "TaekwonKumdo", "Patrulla de Drones", "Acceso rápido", "Una red global en crecimiento", "Mostramos nuestra escala con cifras que siguen creciendo.", "Técnica · Aptitud · Disciplina · Respuesta", "Tradición · Espíritu · Cultura · Futuro", "Tecnología · Patrulla · Búsqueda · Rescate · Seguridad", "ENTRAR →", "Tres mundos, una puerta global"], "fr": ["Arts martiaux policiers", "TaekwonKumdo", "Patrouille de drones", "Accès rapide", "Un réseau mondial en croissance", "Notre réseau mondial évolue en temps réel.", "Technique · Forme · Discipline · Intervention", "Tradition · Esprit · Culture · Avenir", "Technologie · Patrouille · Recherche · Sauvetage · Sécurité", "ENTRER →", "Trois univers, une passerelle"], "de": ["Polizei-Kampfkunst", "TaekwonKumdo", "Drohnenpatrouille", "Schnellzugriff", "Ein wachsendes globales Netzwerk", "Unser Netzwerk wächst und verbindet die Welt.", "Technik · Fitness · Disziplin · Einsatz", "Tradition · Geist · Kultur · Zukunft", "Technologie · Patrouille · Suche · Rettung · Sicherheit", "SEITE ÖFFNEN →", "Drei Welten, ein Tor"], "pt": ["Artes Marciais Policiais", "TaekwonKumdo", "Patrulha de Drones", "Acesso rápido", "Uma rede global em crescimento", "Nossa rede conecta pessoas em todo o mundo.", "Técnica · Condicionamento · Disciplina · Resposta", "Tradição · Espírito · Cultura · Futuro", "Tecnologia · Patrulha · Busca · Resgate · Segurança", "ENTRAR →", "Três mundos, um portal"], "it": ["Arti Marziali di Polizia", "TaekwonKumdo", "Pattuglia Drone", "Accesso rapido", "Una rete globale in crescita", "La nostra rete collega il mondo.", "Tecnica · Fitness · Disciplina · Risposta", "Tradizione · Spirito · Cultura · Futuro", "Tecnologia · Pattuglia · Ricerca · Soccorso · Sicurezza", "ENTRA →", "Tre mondi, un portale"], "ru": ["Полицейские боевые искусства", "Тхэквондо-кумдо", "Дрон-патруль", "Быстрый доступ", "Растущая глобальная сеть", "Наша сеть объединяет людей по всему миру.", "Техника · Подготовка · Дисциплина · Реагирование", "Традиции · Дух · Культура · Будущее", "Технологии · Патруль · Поиск · Спасение · Безопасность", "ВОЙТИ →", "Три направления, один портал"], "mn": ["Цагдаагийн тулааны урлаг","Таеквондокумдо","Дроны эргүүл","Шуурхай холбоос","Тоогоор харагдах өсөн нэмэгдэж буй сүлжээ","Бид тасралтгүй өөрчлөгдөх тоогоор цар хүрээгээ харуулдаг.","Ур чадвар · Бие бялдар · Сахилга бат · Шуурхай ажиллагаа","Уламжлал · Сэтгэлгээ · Соёл · Ирээдүй үе","Дэвшилтэт технологи · Эргүүл · Хайлт · Аврах · Аюулгүй байдал","САЙТ РУУ ОРОХ →","Гурван ертөнц, нэг гарц"], "vi": ["Võ thuật Cảnh sát", "TaekwonKumdo", "Tuần tra Drone", "Truy cập nhanh", "Mạng lưới toàn cầu đang phát triển", "Mạng lưới của chúng tôi kết nối toàn thế giới.", "Kỹ thuật · Thể lực · Kỷ luật · Ứng phó", "Truyền thống · Tinh thần · Văn hóa · Tương lai", "Công nghệ · Tuần tra · Tìm kiếm · Cứu hộ · An toàn", "VÀO TRANG →", "Ba lĩnh vực, một cổng toàn cầu"], "th": ["ศิลปะการต่อสู้ตำรวจ","เทควันคุมโด","หน่วยลาดตระเวนโดรน","ทางลัด","เครือข่ายที่เติบโตซึ่งแสดงด้วยตัวเลข","เราแสดงขนาดของเครือข่ายผ่านตัวเลขที่เปลี่ยนแปลงอย่างต่อเนื่อง","ทักษะ · สมรรถภาพ · วินัย · การตอบสนองภาคสนาม","ประเพณี · จิตวิญญาณ · วัฒนธรรม · คนรุ่นใหม่","เทคโนโลยีขั้นสูง · ลาดตระเวน · ค้นหา · กู้ภัย · ความปลอดภัย","เข้าสู่เว็บไซต์ →","สามโลก หนึ่งประตู"], "id": ["Seni Bela Diri Kepolisian","TaekwonKumdo","Patroli Drone","Akses cepat","Jaringan yang terus berkembang dalam angka","Kami menunjukkan skala melalui angka yang terus berubah.","Keterampilan · Kebugaran · Disiplin · Respons Lapangan","Tradisi · Semangat · Budaya · Generasi Masa Depan","Teknologi Canggih · Patroli · Pencarian · Penyelamatan · Keselamatan","MASUK SITUS →","Tiga dunia, satu gerbang"], "ms": ["Seni Bela Diri Polis","TaekwonKumdo","Rondaan Dron","Akses pantas","Rangkaian yang berkembang melalui angka","Kami menunjukkan skala melalui angka yang sentiasa berubah.","Kemahiran · Kecergasan · Disiplin · Tindak Balas Lapangan","Tradisi · Semangat · Budaya · Generasi Masa Depan","Teknologi Canggih · Rondaan · Carian · Menyelamat · Keselamatan","MASUK LAMAN →","Tiga dunia, satu gerbang"], "fil": ["Sining Pandigma ng Pulis","TaekwonKumdo","Patrolya ng Drone","Mabilis na access","Lumalagong network na ipinapakita sa mga bilang","Ipinapakita namin ang lawak sa pamamagitan ng patuloy na nagbabagong mga bilang.","Kasanayan · Kalakasan · Disiplina · Pagtugon sa Larangan","Tradisyon · Diwa · Kultura · Susunod na Henerasyon","Makabagong Teknolohiya · Patrolya · Paghahanap · Pagsagip · Kaligtasan","PUMASOK SA SITE →","Tatlong mundo, iisang gateway"], "hi": ["पुलिस मार्शल आर्ट्स","ताइक्वोनकुमडो","ड्रोन गश्त","त्वरित पहुँच","आँकड़ों में दिखता बढ़ता नेटवर्क","हम लगातार बदलते आँकड़ों के माध्यम से अपने नेटवर्क का विस्तार दिखाते हैं।","कौशल · फिटनेस · अनुशासन · मैदानी प्रतिक्रिया","परंपरा · भावना · संस्कृति · भावी पीढ़ियाँ","उन्नत तकनीक · गश्त · खोज · बचाव · सुरक्षा","साइट में प्रवेश →","तीन क्षेत्र, एक प्रवेशद्वार"], "ar": ["فنون القتال الشرطية","تايكون كومدو","دورية الطائرات المسيّرة","وصول سريع","شبكة متنامية تظهرها الأرقام","نُظهر حجم شبكتنا من خلال أرقام تتغير باستمرار.","المهارات · اللياقة · الانضباط · الاستجابة الميدانية","التقاليد · الروح · الثقافة · الأجيال القادمة","التقنية المتقدمة · الدورية · البحث · الإنقاذ · السلامة","دخول الموقع ←","ثلاثة مجالات، بوابة واحدة"], "tr": ["Polis Dövüş Sanatları","TaekwonKumdo","Drone Devriyesi","Hızlı erişim","Rakamlarla büyüyen bir ağ","Ölçeğimizi sürekli değişen rakamlarla gösteriyoruz.","Beceri · Kondisyon · Disiplin · Saha Müdahalesi","Gelenek · Ruh · Kültür · Gelecek Nesiller","İleri Teknoloji · Devriye · Arama · Kurtarma · Güvenlik","SİTEYE GİR →","Üç dünya, tek geçit"], "ne": ["प्रहरी मार्शल आर्ट्स","ताइक्वोनकुमडो","ड्रोन गस्ती","द्रुत पहुँच","अङ्कले देखाउने बढ्दो सञ्जाल","हामी निरन्तर बदलिने अङ्कमार्फत हाम्रो सञ्जालको विस्तार देखाउँछौँ।","सीप · तन्दुरुस्ती · अनुशासन · मैदानी प्रतिक्रिया","परम्परा · भावना · संस्कृति · भावी पुस्ता","उन्नत प्रविधि · गस्ती · खोज · उद्धार · सुरक्षा","साइटमा प्रवेश →","तीन क्षेत्र, एउटै प्रवेशद्वार"]};
  const LIVE_I18N={"ko":["전체 네트워크 공개회원","경찰무도 회원","태권검도 회원","IDP 공식 승인 대원","세계회원 승인","글로벌 네트워크 국가","※ 각 카드는 독립 지표이며 서로 합산하는 숫자가 아닙니다.","경찰무도 · 실시간 활동","지금, 경찰무도 네트워크에서 일어나고 있습니다","최근 경찰무도 회원 · 단증","신규 도장 · 지부 소식","임원 · 지도자 임명","경찰무도 최근 회원 활동을 불러오는 중입니다.","신규 도장·지부 활동을 불러오는 중입니다.","임원·지도자 임명 활동을 불러오는 중입니다."],"en":["Public network members","Police Martial Arts members","TaekwonKumdo members","Official IDP members","Approved global members","Global network countries","※ Each card is an independent metric and should not be added together.","POLICE MARTIAL ARTS · REALTIME ACTIVITY","What is happening now across the Police Martial Arts network","Recent members · certificates","New schools · branches","Executives · instructor appointments","Loading recent Police Martial Arts member activity.","Loading new school and branch activity.","Loading executive and instructor appointments."],"zh":["全网络公开会员","警察武道会员","跆拳剑道会员","IDP 正式批准队员","全球会员批准","全球网络国家","※ 各卡片为独立指标，不能相加。","警察武道 · 实时动态","警察武道网络此刻正在发生","最新会员 · 证书","新道场 · 分会消息","干部 · 指导者任命","正在加载警察武道最新会员动态。","正在加载新道场·分会动态。","正在加载干部·指导者任命动态。"],"ja":["ネットワーク公開会員","警察武道会員","テコンドー剣道会員","IDP正式承認隊員","世界会員承認","グローバルネットワーク国","※ 各カードは独立指標で、合算する数字ではありません。","警察武道 · リアルタイム活動","今、警察武道ネットワークで起きています","最新会員 · 証書","新道場 · 支部ニュース","役員 · 指導者任命","警察武道の最新会員活動を読み込み中です。","新道場・支部活動を読み込み中です。","役員・指導者任命を読み込み中です。"],"es":["Miembros públicos de la red","Miembros de Artes Marciales Policiales","Miembros de TaekwonKumdo","Miembros oficiales de IDP","Miembros globales aprobados","Países de la red global","※ Cada tarjeta es un indicador independiente y no debe sumarse con las demás.","ARTES MARCIALES POLICIALES · ACTIVIDAD EN TIEMPO REAL","Lo que está ocurriendo ahora en la red de Artes Marciales Policiales","Miembros recientes · certificados","Nuevas escuelas · filiales","Nombramientos de directivos · instructores","Cargando actividad reciente de miembros.","Cargando actividad de nuevas escuelas y filiales.","Cargando nombramientos de directivos e instructores."],"fr":["Membres publics du réseau","Membres des arts martiaux policiers","Membres TaekwonKumdo","Membres officiels IDP","Membres mondiaux approuvés","Pays du réseau mondial","※ Chaque carte est un indicateur indépendant et ne doit pas être additionnée aux autres.","ARTS MARTIAUX POLICIERS · ACTIVITÉ EN TEMPS RÉEL","Ce qui se passe actuellement dans le réseau des arts martiaux policiers","Membres récents · certificats","Nouvelles écoles · antennes","Nominations de dirigeants · instructeurs","Chargement de l’activité récente des membres.","Chargement des nouvelles écoles et antennes.","Chargement des nominations de dirigeants et instructeurs."],"de":["Öffentliche Netzwerkmitglieder","Mitglieder der Polizei-Kampfkunst","TaekwonKumdo-Mitglieder","Offiziell bestätigte IDP-Mitglieder","Bestätigte globale Mitglieder","Länder im globalen Netzwerk","※ Jede Karte ist eine eigenständige Kennzahl und wird nicht mit anderen addiert.","POLIZEI-KAMPFKUNST · ECHTZEIT-AKTIVITÄT","Was derzeit im Netzwerk der Polizei-Kampfkunst geschieht","Neue Mitglieder · Zertifikate","Neue Schulen · Zweigstellen","Ernennungen von Funktionären · Ausbildern","Aktuelle Mitgliederaktivitäten werden geladen.","Aktivitäten neuer Schulen und Zweigstellen werden geladen.","Ernennungen von Funktionären und Ausbildern werden geladen."],"pt":["Membros públicos da rede","Membros de Artes Marciais Policiais","Membros de TaekwonKumdo","Membros oficiais do IDP","Membros globais aprovados","Países da rede global","※ Cada cartão é um indicador independente e não deve ser somado aos demais.","ARTES MARCIAIS POLICIAIS · ATIVIDADE EM TEMPO REAL","O que está acontecendo agora na rede de Artes Marciais Policiais","Membros recentes · certificados","Novas escolas · filiais","Nomeações de dirigentes · instrutores","Carregando atividades recentes dos membros.","Carregando atividades de novas escolas e filiais.","Carregando nomeações de dirigentes e instrutores."],"it":["Membri pubblici della rete","Membri delle arti marziali di polizia","Membri TaekwonKumdo","Membri ufficiali IDP","Membri globali approvati","Paesi della rete globale","※ Ogni scheda è un indicatore indipendente e non va sommata alle altre.","ARTI MARZIALI DI POLIZIA · ATTIVITÀ IN TEMPO REALE","Cosa sta accadendo ora nella rete delle arti marziali di polizia","Membri recenti · certificati","Nuove scuole · sedi","Nomine di dirigenti · istruttori","Caricamento delle attività recenti dei membri.","Caricamento delle nuove scuole e sedi.","Caricamento delle nomine di dirigenti e istruttori."],"ru":["Открытые участники сети","Участники полицейских боевых искусств","Участники TaekwonKumdo","Официально утверждённые участники IDP","Утверждённые международные участники","Страны глобальной сети","※ Каждая карточка является отдельным показателем и не суммируется с другими.","ПОЛИЦЕЙСКИЕ БОЕВЫЕ ИСКУССТВА · АКТИВНОСТЬ В РЕАЛЬНОМ ВРЕМЕНИ","Что сейчас происходит в сети полицейских боевых искусств","Новые участники · сертификаты","Новые школы · филиалы","Назначения руководителей · инструкторов","Загружается последняя активность участников.","Загружается активность новых школ и филиалов.","Загружаются назначения руководителей и инструкторов."],"mn":["Сүлжээний нээлттэй гишүүд","Цагдаагийн тулааны урлагийн гишүүд","TaekwonKumdo гишүүд","IDP албан ёсны зөвшөөрөгдсөн гишүүд","Дэлхийн баталгаажсан гишүүд","Дэлхийн сүлжээний улсууд","※ Карт бүр тусдаа үзүүлэлт бөгөөд хооронд нь нэмж тооцохгүй.","ЦАГДААГИЙН ТУЛААНЫ УРЛАГ · БОДИТ ЦАГИЙН ҮЙЛ АЖИЛЛАГАА","Цагдаагийн тулааны урлагийн сүлжээнд яг одоо болж буй үйл явдал","Сүүлийн гишүүд · гэрчилгээ","Шинэ сургууль · салбар","Удирдлага · багшийн томилгоо","Сүүлийн гишүүдийн үйл ажиллагааг ачаалж байна.","Шинэ сургууль, салбарын үйл ажиллагааг ачаалж байна.","Удирдлага, багшийн томилгоог ачаалж байна."],"vi":["Thành viên công khai của mạng lưới","Thành viên Võ thuật Cảnh sát","Thành viên TaekwonKumdo","Thành viên IDP được phê duyệt chính thức","Thành viên toàn cầu được phê duyệt","Các quốc gia trong mạng lưới toàn cầu","※ Mỗi thẻ là một chỉ số độc lập và không cộng gộp với nhau.","VÕ THUẬT CẢNH SÁT · HOẠT ĐỘNG THỜI GIAN THỰC","Những gì đang diễn ra trong mạng lưới Võ thuật Cảnh sát","Thành viên mới · chứng nhận","Trường mới · chi nhánh","Bổ nhiệm lãnh đạo · huấn luyện viên","Đang tải hoạt động thành viên gần đây.","Đang tải hoạt động trường và chi nhánh mới.","Đang tải các bổ nhiệm lãnh đạo và huấn luyện viên."],"th":["สมาชิกสาธารณะของเครือข่าย","สมาชิกศิลปะการต่อสู้ตำรวจ","สมาชิก TaekwonKumdo","สมาชิก IDP ที่ได้รับการอนุมัติอย่างเป็นทางการ","สมาชิกทั่วโลกที่ได้รับการอนุมัติ","ประเทศในเครือข่ายทั่วโลก","※ การ์ดแต่ละใบเป็นตัวชี้วัดอิสระและไม่นำมารวมกัน","ศิลปะการต่อสู้ตำรวจ · กิจกรรมแบบเรียลไทม์","สิ่งที่กำลังเกิดขึ้นในเครือข่ายศิลปะการต่อสู้ตำรวจ","สมาชิกล่าสุด · ใบรับรอง","โรงเรียนใหม่ · สาขา","การแต่งตั้งผู้บริหาร · ผู้ฝึกสอน","กำลังโหลดกิจกรรมสมาชิกล่าสุด","กำลังโหลดกิจกรรมโรงเรียนและสาขาใหม่","กำลังโหลดการแต่งตั้งผู้บริหารและผู้ฝึกสอน"],"id":["Anggota publik jaringan","Anggota Seni Bela Diri Kepolisian","Anggota TaekwonKumdo","Anggota IDP resmi","Anggota global yang disetujui","Negara jaringan global","※ Setiap kartu adalah indikator independen dan tidak dijumlahkan.","SENI BELA DIRI KEPOLISIAN · AKTIVITAS REAL-TIME","Yang sedang terjadi di jaringan Seni Bela Diri Kepolisian","Anggota terbaru · sertifikat","Sekolah baru · cabang","Pengangkatan pengurus · instruktur","Memuat aktivitas anggota terbaru.","Memuat aktivitas sekolah dan cabang baru.","Memuat pengangkatan pengurus dan instruktur."],"ms":["Ahli awam rangkaian","Ahli Seni Bela Diri Polis","Ahli TaekwonKumdo","Ahli IDP rasmi","Ahli global yang diluluskan","Negara rangkaian global","※ Setiap kad ialah penunjuk bebas dan tidak dicampurkan bersama.","SENI BELA DIRI POLIS · AKTIVITI MASA NYATA","Apa yang sedang berlaku dalam rangkaian Seni Bela Diri Polis","Ahli terkini · sijil","Sekolah baharu · cawangan","Pelantikan pegawai · jurulatih","Memuatkan aktiviti ahli terkini.","Memuatkan aktiviti sekolah dan cawangan baharu.","Memuatkan pelantikan pegawai dan jurulatih."],"fil":["Mga pampublikong miyembro ng network","Mga miyembro ng Sining Pandigma ng Pulis","Mga miyembro ng TaekwonKumdo","Opisyal na aprubadong miyembro ng IDP","Aprubadong pandaigdigang miyembro","Mga bansa sa pandaigdigang network","※ Ang bawat card ay hiwalay na sukatan at hindi dapat pagsamahin.","SINING PANDIGMA NG PULIS · REAL-TIME NA AKTIBIDAD","Ang kasalukuyang nangyayari sa network ng Sining Pandigma ng Pulis","Mga bagong miyembro · sertipiko","Mga bagong paaralan · sangay","Pagtatalaga ng mga opisyal · instruktor","Nilo-load ang pinakabagong aktibidad ng mga miyembro.","Nilo-load ang aktibidad ng mga bagong paaralan at sangay.","Nilo-load ang mga pagtatalaga ng opisyal at instruktor."],"hi":["नेटवर्क के सार्वजनिक सदस्य","पुलिस मार्शल आर्ट्स सदस्य","TaekwonKumdo सदस्य","आधिकारिक रूप से स्वीकृत IDP सदस्य","स्वीकृत वैश्विक सदस्य","वैश्विक नेटवर्क के देश","※ प्रत्येक कार्ड एक स्वतंत्र संकेतक है और इन्हें आपस में जोड़ा नहीं जाता।","पुलिस मार्शल आर्ट्स · रीयल-टाइम गतिविधि","पुलिस मार्शल आर्ट्स नेटवर्क में अभी क्या हो रहा है","नए सदस्य · प्रमाणपत्र","नए स्कूल · शाखाएँ","पदाधिकारी · प्रशिक्षक नियुक्तियाँ","हाल की सदस्य गतिविधि लोड हो रही है।","नए स्कूल और शाखा गतिविधि लोड हो रही है।","पदाधिकारी और प्रशिक्षक नियुक्तियाँ लोड हो रही हैं।"],"ar":["أعضاء الشبكة المعلنون","أعضاء الفنون القتالية الشرطية","أعضاء TaekwonKumdo","أعضاء IDP المعتمدون رسميًا","الأعضاء العالميون المعتمدون","دول الشبكة العالمية","※ كل بطاقة مؤشر مستقل ولا تُجمع الأرقام معًا.","الفنون القتالية الشرطية · نشاط لحظي","ما يحدث الآن في شبكة الفنون القتالية الشرطية","أحدث الأعضاء · الشهادات","مدارس جديدة · فروع","تعيينات المسؤولين · المدربين","جارٍ تحميل أحدث نشاطات الأعضاء.","جارٍ تحميل نشاطات المدارس والفروع الجديدة.","جارٍ تحميل تعيينات المسؤولين والمدربين."],"tr":["Açık ağ üyeleri","Polis Dövüş Sanatları üyeleri","TaekwonKumdo üyeleri","Resmî onaylı IDP üyeleri","Onaylı küresel üyeler","Küresel ağ ülkeleri","※ Her kart bağımsız bir göstergedir ve rakamlar birbirine eklenmez.","POLİS DÖVÜŞ SANATLARI · GERÇEK ZAMANLI FAALİYET","Polis Dövüş Sanatları ağında şu anda neler oluyor","Yeni üyeler · sertifikalar","Yeni okullar · şubeler","Yönetici · eğitmen atamaları","Son üye faaliyetleri yükleniyor.","Yeni okul ve şube faaliyetleri yükleniyor.","Yönetici ve eğitmen atamaları yükleniyor."],"ne":["सञ्जालका सार्वजनिक सदस्य","प्रहरी मार्शल आर्ट्स सदस्य","TaekwonKumdo सदस्य","आधिकारिक रूपमा स्वीकृत IDP सदस्य","स्वीकृत विश्व सदस्य","विश्वव्यापी सञ्जालका देशहरू","※ प्रत्येक कार्ड स्वतन्त्र सूचक हो र एकअर्कासँग जोडिँदैन।","प्रहरी मार्शल आर्ट्स · वास्तविक समय गतिविधि","प्रहरी मार्शल आर्ट्स सञ्जालमा अहिले के भइरहेको छ","नयाँ सदस्य · प्रमाणपत्र","नयाँ विद्यालय · शाखा","पदाधिकारी · प्रशिक्षक नियुक्ति","हालका सदस्य गतिविधि लोड हुँदैछ।","नयाँ विद्यालय र शाखा गतिविधि लोड हुँदैछ।","पदाधिकारी र प्रशिक्षक नियुक्ति लोड हुँदैछ।"]};
    const langDialog=document.getElementById('languageDialog'), langGrid=document.getElementById('languageGrid'), langBtn=document.getElementById('langBtn'), langBtnText=document.getElementById('langBtnText');
  const queryLang=new URLSearchParams(location.search).get('lang');
  let currentLang=queryLang || localStorage.getItem('ipma_language') || (navigator.language||'ko').split('-')[0];
  if(!LANGUAGES.some(x=>x.code===currentLang)) currentLang='en';
  function applyLanguage(code){
    currentLang=code; localStorage.setItem('ipma_language',code); document.documentElement.lang=code; document.documentElement.dir=code==='ar'?'rtl':'ltr';
    const L=I18N[code]||I18N.en, meta=LANGUAGES.find(x=>x.code===code); langBtnText.textContent=meta.name;
    const nav=document.querySelectorAll('.quick-nav a'); if(nav.length>=6){nav[1].textContent=L[0];nav[2].textContent=L[1];nav[3].textContent=L[2];nav[6].textContent=L[3];nav[5].textContent=({ko:'공지사항',en:'Notices',zh:'公告',ja:'お知らせ',es:'Avisos',fr:'Annonces',de:'Mitteilungen',pt:'Avisos',it:'Avvisi',ru:'Объявления',mn:'Мэдэгдэл',vi:'Thông báo',th:'ประกาศ',id:'Pengumuman',ms:'Notis',fil:'Mga Abiso',hi:'सूचनाएँ',ar:'الإعلانات',tr:'Duyurular',ne:'सूचनाहरू'})[code]||'Notices';}
    const h=document.querySelector('.network h2'), lead=document.querySelector('.section-lead'); if(code==='ko'){h.innerHTML='<span class="network-title-line">숫자가 말해주는</span> <span class="network-title-line network-title-accent">성장하는 네트워크</span>';lead.innerHTML='<span>규모를 설명하지 않습니다.</span> <span>계속 변하는 숫자로 보여줍니다.</span>';}else{h.textContent=L[4];lead.textContent=L[5];}
    const worlds=document.querySelectorAll('.world-copy'); worlds[0].querySelector('h2').textContent=L[0]; worlds[0].querySelector('small').textContent=L[6]; worlds[1].querySelector('h2').textContent=L[1]; worlds[1].querySelector('small').textContent=L[7]; worlds[2].querySelector('h2').textContent=L[2]; worlds[2].querySelector('small').textContent=L[8]; worlds.forEach(w=>w.querySelector('button').textContent=L[9]);
    document.querySelector('.enter h2').textContent=L[10]; const gs=document.querySelectorAll('.gate-card strong'); if(gs.length===3){gs[0].textContent=L[0];gs[1].textContent=L[1];gs[2].textContent=L[2];}
    document.querySelectorAll('.language-option').forEach(x=>x.classList.toggle('active',x.dataset.lang===code));
    const N=LIVE_I18N[code]||LIVE_I18N.en;
    const keys=['allDesc','ipmaDesc','wtkfDesc','idpDesc','globalDesc','countriesDesc','note','activityKicker','activityTitle','recentMembers','branches','appointments','loadingMembers','loadingBranches','loadingAppointments'];
    document.querySelectorAll('[data-ipma-live-i18n]').forEach(el=>{const k=el.dataset.ipmaLiveI18n;const idx=keys.indexOf(k);if(idx>=0&&N[idx])el.textContent=N[idx]});
    refreshHeroCopy();

  }
  LANGUAGES.forEach(x=>{const b=document.createElement('button');b.className='language-option';b.dataset.lang=x.code;b.innerHTML=`<img src="assets/flags/${x.flag}.svg" alt=""><span><strong>${x.name}</strong><small>${x.flag.toUpperCase()}</small></span>`;b.onclick=()=>{applyLanguage(x.code);langDialog.close()};langGrid.appendChild(b)});
  langBtn.onclick=()=>langDialog.showModal(); document.getElementById('languageClose').onclick=()=>langDialog.close(); applyLanguage(currentLang);

  document.addEventListener('ipma-language-change',e=>{if(LANGUAGES.some(x=>x.code===e.detail.code))applyLanguage(e.detail.code)});

  // User-initiated, copyright-free procedural ambient sound. Muted by default.
  let audioCtx, master, nodes=[],soundOn=false;
  const soundBtn=document.getElementById('soundBtn');
  soundBtn.addEventListener('click',()=>{
    if(!audioCtx){
      audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.018;master.connect(audioCtx.destination);
      [55,82.41,110].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=f;g.gain.value=i===0?.7:.18;o.connect(g).connect(master);o.start();nodes.push(o,g)});
    }
    soundOn=!soundOn; master.gain.setTargetAtTime(soundOn?.018:0,audioCtx.currentTime,.3);soundBtn.textContent=soundOn?'SOUND ●':'SOUND ○';soundBtn.setAttribute('aria-pressed',String(soundOn));
  });
})();
