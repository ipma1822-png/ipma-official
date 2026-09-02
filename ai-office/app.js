(function(){
  'use strict';
  const VERSION='0.9.0';
  const SEOUL_TZ='Asia/Seoul';
  const meetingDate=new Date('2026-09-04T00:00:00+09:00');

  const panels={
    briefing:{eyebrow:'MORNING BRIEFING',title:'출근 브리핑',foot:'오늘 · 주간 · 월간 화면에서 같은 업무 흐름을 이어봅니다.',rows:[['오늘 주요 일정','서울 전략회의 준비를 첫 PROJECT 기준으로 관리합니다.','확인'],['이번 주 핵심','AI 사무국 HOME 기반을 확립하고 일정 → TASK → PROJECT 순으로 확장합니다.','진행'],['기존 시스템 보호','GMS · IDP · SPARK · 인증 · Supabase · Realtime은 이번 단계에서 수정하지 않습니다.','보호'],['AI 사무국 제안','새 기능을 만들기 전에 기존 기능과 데이터 연결을 먼저 확인합니다.','원칙']]},
    today:{eyebrow:'TODAY',title:'오늘',foot:'오늘 화면은 일정 · 업무 · 준비사항을 한곳에 모으는 3차 업무판입니다.',rows:[['가장 중요한 일','서울 전략회의 준비','우선'],['다음 중요 일정','2026년 9월 4일 국제드론순찰대 서울 전략회의','D-DAY'],['오늘의 운영','등록된 일정/TASK 저장 기능 연결 전까지 임의 업무를 생성하지 않습니다.','안전'],['확인할 것','다음 단계에서 기존 일정 기능 존재 여부를 조사한 뒤 연결합니다.','NEXT']]},
    week:{eyebrow:'THIS WEEK',title:'이번 주',foot:'주간 화면은 핵심목표 · 마감 · 프로젝트 진행 흐름을 연결하기 위한 기반입니다.',rows:[['주간 핵심목표','AI 사무국 HOME의 업무운영 기반 확립','핵심'],['개발 흐름','오늘/주간/월간 → 일정/D-Day → TASK → PROJECT','순서'],['첫 실전 적용','서울 전략회의 준비를 PROJECT 테스트 사례로 사용','PROJECT'],['보호영역','인증 · Supabase · RLS · Realtime · GMS · IDP · SPARK','보호']]},
    month:{eyebrow:'THIS MONTH',title:'이번 달',foot:'월간 화면은 주요행사 · 프로젝트 · D-Day · 조직별 핵심업무를 연결하는 상위 보드입니다.',rows:[['월간 중심','중요 일정 · PROJECT · D-Day를 한 화면에서 확인','목표'],['첫 PROJECT','국제드론순찰대 서울 전략회의','실전'],['연결 준비','PROJECT · 회의 · 자료 · 아리아 브리핑 구조 준비','연결'],['데이터 원칙','기존 데이터가 있으면 재사용하고 없을 때만 최소 확장','원칙']]},
    schedule:{eyebrow:'SCHEDULE',title:'일정',foot:'4차 일정 화면은 현재 확인된 일정만 읽기 중심으로 표시합니다. 일정 DB 생성·수정은 하지 않습니다.',rows:[['오늘','2026년 9월 2일 · AI 사무국 일정/D-Day 기반 구축','진행'],['다음 일정','2026년 9월 4일 국제드론순찰대 서울 전략회의','중요'],['연결 원칙','일정 → D-Day → TASK → PROJECT 순으로 연결합니다.','연결'],['데이터 원칙','기존 일정 기능이 없으므로 이번 단계에서는 UI/읽기 구조만 구축합니다.','보호']]},
    dday:{eyebrow:'D-DAY',title:'D-Day',foot:'D-Day는 Asia/Seoul 날짜 기준으로 자동 계산하며 첫 실전 PROJECT 일정과 연결됩니다.',rows:[['기준 일정','국제드론순찰대 서울 전략회의','PROJECT'],['목표일','2026년 9월 4일','DATE'],['계산 기준','Asia/Seoul 자정 기준 날짜 차이','자동'],['연결 예정','향후 일정 데이터의 중요일정을 D-Day 카드에 자동 반영','NEXT']]},
    task:{eyebrow:'TASK',title:'TASK 업무관리',foot:'5차 TASK는 AI OFFICE 전용 localStorage에 저장하며 기존 Supabase/GMS에는 쓰지 않습니다.',rows:[['구조','해야 할 일 · 마감 · 중요도 · 완료/미완료','운영'],['연결','TASK마다 관련 PROJECT를 지정할 수 있습니다.','PROJECT'],['미완료','완료되지 않은 TASK는 자동 삭제하지 않습니다.','유지'],['저장','현재 브라우저의 AI OFFICE 전용 localStorage만 사용','안전']]},
    project:{eyebrow:'PROJECT',title:'PROJECT 업무관리',foot:'6차 PROJECT는 AI OFFICE 전용 localStorage에서 동작하며 기존 TASK를 프로젝트 단위로 연결합니다.',rows:[['첫 PROJECT','국제드론순찰대 서울 전략회의','실전'],['연결','목적 · 일정 · 참석자 · TASK · 자료','운영'],['프로젝트 기록','결정사항 · 미결사항 · 후속업무를 한 프로젝트에 보존','기록'],['진행률','연결 TASK의 완료율을 기준으로 자동 계산','자동']]},
    meeting:{eyebrow:'MEETING',title:'회의관리',foot:'7차 회의관리는 AI OFFICE 전용 localStorage에서 동작하며 PROJECT와 연결합니다.',rows:[['회의 전','목적 · 참석자 · 안건 · 자료 · 질문 · 결정 필요사항','준비'],['회의 후','결정사항 · 미결사항 · 담당 · 후속업무 · 다음회의','기록'],['PROJECT 연결','회의 결과를 서울 전략회의 PROJECT 기록으로 반영할 수 있습니다.','연결'],['저장','현재 브라우저의 AI OFFICE 전용 localStorage만 사용','안전']]},
    library:{eyebrow:'RESOURCE',title:'자료',foot:'기존 자료 저장 위치와 호출 방식을 먼저 확인한 뒤 AI OFFICE에서 연결합니다.',rows:[['저장 원칙','AI 사무국에 기존 자료를 중복 저장하지 않습니다.','원칙'],['역할','검색 · 분류 · 호출 · DISPLAY 연결','연결'],['이미지','기존 이미지 전송/표시 기능을 우선 재사용','재사용'],['현재 단계','기존 자료 저장 위치 조사 후 연결 예정','NEXT']]},
    aria:{eyebrow:'ARIA · AI SECRETARY',title:'아리아 업무분장',foot:'9차에서는 아리아의 메뉴와 음성 명령을 하나의 공통 ACTION으로 실행합니다.',rows:[['전략·기획','조직운영과 의사결정 준비를 지원합니다.','전략'],['일정·업무','오늘 · 주간 · 월간 · D-Day · TASK를 연결합니다.','업무'],['PROJECT·회의','프로젝트 진행과 회의 전후 기록을 브리핑합니다.','연결'],['권한 원칙','최종 판단·승인·결정·집행은 사람이 담당합니다.','보호']]},
    gen:{eyebrow:'GEN · AI SECRETARY',title:'젠 업무분장',foot:'9차에서는 젠의 메뉴와 음성 명령을 하나의 공통 ACTION으로 실행합니다. 자동 발행은 하지 않습니다.',rows:[['뉴스','주요 뉴스 모니터링과 기사 아이디어를 준비합니다.','NEWS'],['기사·콘텐츠','기사 초안 · SNS · 홍보 · 발표자료를 준비합니다.','MEDIA'],['이미지·미디어','이미지 · 영상 · 음악 등 기존 콘텐츠 호출을 준비합니다.','CONTENT'],['발행 원칙','기사 및 공식 콘텐츠 최종 발행은 사람이 승인합니다.','보호']]}
  };

  function seoulParts(date){
    const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:SEOUL_TZ,year:'numeric',month:'long',day:'numeric',weekday:'short'}).formatToParts(date);
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return {year:get('year'),month:get('month'),day:get('day'),weekday:get('weekday')};
  }

  function getSeoulYmd(date){
    return new Intl.DateTimeFormat('en-CA',{timeZone:SEOUL_TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  }

  function getWeekRangeLabel(now){
    const ymd=getSeoulYmd(now);
    const d=new Date(ymd+'T00:00:00+09:00');
    const day=d.getDay();
    const monday=new Date(d); monday.setDate(d.getDate()-(day===0?6:day-1));
    const sunday=new Date(monday); sunday.setDate(monday.getDate()+6);
    const fmt=x=>new Intl.DateTimeFormat('ko-KR',{timeZone:SEOUL_TZ,month:'numeric',day:'numeric'}).format(x);
    return `${fmt(monday)} ~ ${fmt(sunday)}`;
  }

  function updateClock(){
    const now=new Date();
    const sp=seoulParts(now);
    document.getElementById('todayLabel').textContent=`${sp.month} ${sp.day} (${sp.weekday})`;
    document.getElementById('clock').textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:SEOUL_TZ,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
    const seoulToday=new Date(getSeoulYmd(now)+'T00:00:00+09:00');
    const days=Math.ceil((meetingDate-seoulToday)/86400000);
    const dText=days>0?'D-'+days:days===0?'D-DAY':'D+'+Math.abs(days);
    document.getElementById('dday').textContent=dText;
    const dl=document.getElementById('ddayLarge'); if(dl) dl.textContent=dText;
    const ds=document.getElementById('ddayState'); if(ds) ds.textContent=days>0?`${days}일 남음 · Asia/Seoul`:days===0?'오늘 · Asia/Seoul':`${Math.abs(days)}일 지남 · Asia/Seoul`;
    document.getElementById('todayCardTitle').textContent=`${sp.month} ${sp.day}`;
    document.getElementById('weekCardTitle').textContent=getWeekRangeLabel(now);
    document.getElementById('monthCardTitle').textContent=`${sp.year} ${sp.month}`;
  }

  function currentPeriodDate(key){
    const now=new Date();
    const sp=seoulParts(now);
    if(key==='today') return `${sp.year} ${sp.month} ${sp.day} (${sp.weekday}) · Asia/Seoul`;
    if(key==='week') return `${getWeekRangeLabel(now)} · 주간 업무판`;
    if(key==='month') return `${sp.year} ${sp.month} · 월간 업무판`;
    if(key==='schedule') return `${sp.year} ${sp.month} ${sp.day} (${sp.weekday}) · 일정 보드`;
    if(key==='dday') return `목표일 2026.09.04 · Asia/Seoul`;
    return `AI OFFICE 2.0 · v${VERSION}`;
  }

  function renderPanel(key){
    const p=panels[key]; if(!p)return;
    document.getElementById('panelEyebrow').textContent=p.eyebrow;
    document.getElementById('panelTitle').textContent=p.title;
    document.getElementById('panelDate').textContent=currentPeriodDate(key);
    document.getElementById('panelBody').innerHTML=p.rows.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p><b>${r[0]}</b><small>${r[1]}</small></p><em>${r[2]||''}</em></div>`).join('');
    document.getElementById('panelFoot').textContent=`※ ${p.foot}`;
    document.querySelectorAll('.work-card').forEach(b=>b.classList.toggle('active',b.dataset.panel===key));
    document.querySelectorAll('.period-card').forEach(c=>c.classList.toggle('selected',c.dataset.jump===key));
  }

  document.querySelectorAll('.work-card').forEach(btn=>btn.addEventListener('click',()=>renderPanel(btn.dataset.panel)));
  document.querySelectorAll('.period-card').forEach(card=>card.addEventListener('click',()=>{
    renderPanel(card.dataset.jump);
    document.getElementById('detailPanel').scrollIntoView({behavior:'smooth',block:'center'});
  }));


  document.querySelectorAll('[data-panel-target]').forEach(btn=>btn.addEventListener('click',()=>{
    renderPanel(btn.dataset.panelTarget);
    document.getElementById('detailPanel').scrollIntoView({behavior:'smooth',block:'center'});
  }));

  document.querySelectorAll('.ai-action').forEach(btn=>btn.addEventListener('click',()=>{
    const aria=btn.dataset.ai==='aria';
    document.getElementById('panelEyebrow').textContent=aria?'ARIA · AI SECRETARY':'GEN · AI SECRETARY';
    document.getElementById('panelTitle').textContent=aria?'아리아 업무영역':'젠 업무영역';
    document.getElementById('panelDate').textContent=`AI OFFICE 2.0 · v${VERSION}`;
    const rows=aria
      ?[['전략·기획','조직운영과 의사결정 준비를 지원합니다.','전략'],['일정·업무','오늘 · 주간 · 월간 · D-Day · 미완료 업무를 연결합니다.','업무'],['PROJECT·회의','프로젝트 준비와 회의 전후 기록을 지원합니다.','PROJECT'],['원칙','AI는 조사·정리·추천·준비를 하고 최종 판단은 사람이 합니다.','원칙']]
      :[['뉴스','Global News24 뉴스 모니터링과 기사 준비를 지원합니다.','NEWS'],['콘텐츠','기사 · 이미지 · SNS · 홍보 · 발표자료를 준비합니다.','MEDIA'],['미디어','영상 · 음악 등 기존 콘텐츠 호출을 지원합니다.','CONTENT'],['원칙','기사는 자동 발행하지 않고 사람이 최종 승인합니다.','원칙']];
    document.getElementById('panelBody').innerHTML=rows.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p><b>${r[0]}</b><small>${r[1]}</small></p><em>${r[2]}</em></div>`).join('');
    document.getElementById('panelFoot').textContent='※ AI 사무국장은 기존 운영시스템을 대신하지 않고 업무를 읽고 연결하고 준비하는 역할입니다.';
    document.querySelectorAll('.work-card').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.period-card').forEach(c=>c.classList.remove('selected'));
    document.getElementById('detailPanel').scrollIntoView({behavior:'smooth',block:'center'});
  }));


  // ===== HOME 9차 · 공통 OFFICE ACTION 라우터 =====
  function scrollDetail(){
    const panel=document.getElementById('detailPanel');
    if(panel) panel.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function renderGenAction(action){
    const rows=genActionRows[action]||genActionRows.news;
    const names={news:'뉴스',article:'기사',content:'콘텐츠',image:'이미지',media:'미디어',library:'자료'};
    document.getElementById('panelEyebrow').textContent='GEN · ACTION';
    document.getElementById('panelTitle').textContent=names[action]||'뉴스';
    document.getElementById('panelDate').textContent=`AI OFFICE 2.0 · v${VERSION} · 9차`;
    document.getElementById('panelBody').innerHTML=rows.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p><b>${r[0]}</b><small>${r[1]}</small></p><em>${r[2]}</em></div>`).join('');
    document.getElementById('panelFoot').textContent='※ GEN ACTION은 준비·연결 단계이며 기사 자동 발행이나 외부 시스템 쓰기를 실행하지 않습니다.';
    document.querySelectorAll('.work-card').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.period-card').forEach(c=>c.classList.remove('selected'));
  }

  function executeOfficeAction(actionId,source='menu'){
    if(!actionId)return false;
    const [agent,action]=actionId.includes(':')?actionId.split(':',2):['aria',actionId];
    if(agent==='gen') renderGenAction(action);
    else renderPanel(action);
    const state=document.getElementById('voiceState');
    if(state) state.textContent=(source==='voice'?'음성 ACTION 실행':'메뉴 ACTION 실행')+' · '+actionId;
    scrollDetail();
    return true;
  }

  document.querySelectorAll('[data-ai-action]').forEach(btn=>btn.addEventListener('click',()=>executeOfficeAction('aria:'+btn.dataset.aiAction,'menu')));
  document.querySelectorAll('[data-office-action]').forEach(btn=>btn.addEventListener('click',()=>executeOfficeAction(btn.dataset.officeAction,'menu')));

  const genActionRows={
    news:[['뉴스 모니터링','주요 뉴스와 조직 관련 이슈를 정리하는 준비 영역입니다.','NEWS'],['현재 단계','외부 뉴스 자동수집은 아직 연결하지 않습니다.','안전'],['향후 연결','12차 뉴스 브리핑 단계에서 실제 데이터 연결을 검토합니다.','NEXT']],
    article:[['기사 초안','제목 · 부제 · 요약 · 본문 초안을 준비합니다.','DRAFT'],['자료조사','기사 근거와 관련자료를 정리합니다.','RESEARCH'],['발행','자동 발행하지 않고 사람의 최종 승인을 받습니다.','승인']],
    content:[['SNS','기사·행사·프로젝트 홍보문을 준비합니다.','SNS'],['발표자료','회의 및 대외 발표용 콘텐츠 준비를 지원합니다.','PRESENT'],['원칙','기존 콘텐츠 시스템을 중복 개발하지 않습니다.','REUSE']],
    image:[['이미지','기존 이미지 저장·전송·표시 구조를 우선 재사용합니다.','IMAGE'],['DISPLAY','향후 CONTROL/DISPLAY ACTION과 연결합니다.','CONNECT'],['현재 단계','9차에서는 메뉴·음성 공통 ACTION으로 호출합니다.','ACTION']],
    media:[['영상','기존 영상 콘텐츠 호출을 우선 검토합니다.','VIDEO'],['음악','브라우저 자동재생 제한을 준수합니다.','AUDIO'],['연결','14차 음악·영상 단계에서 실제 호출 구조를 검토합니다.','NEXT']],
    library:[['자료','기존 자료의 검색 · 분류 · 호출을 담당합니다.','RESOURCE'],['중복저장 금지','AI OFFICE 자체에 기존 자료를 다시 저장하지 않습니다.','REUSE'],['연결','자료 위치 조사 후 DISPLAY와 연결합니다.','CONNECT']]
  };
  document.querySelectorAll('[data-gen-action]').forEach(btn=>btn.addEventListener('click',()=>executeOfficeAction('gen:'+btn.dataset.genAction,'menu')));


  // ===== HOME 9차 · 브라우저 음성인식 → 공통 ACTION =====
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  const voiceMic=document.getElementById('voiceMic');
  const voiceSupport=document.getElementById('voiceSupport');
  const voiceState=document.getElementById('voiceState');
  const voiceTranscript=document.getElementById('voiceTranscript');
  const voiceDot=document.getElementById('voiceStateDot');
  let recognition=null;
  let voiceListening=false;

  function normalizeVoice(text){return String(text||'').toLowerCase().replace(/\s+/g,' ').trim();}
  function resolveVoiceAction(text){
    const q=normalizeVoice(text);
    const isGen=/젠|gen/.test(q);
    if(isGen){
      if(/기사/.test(q))return 'gen:article';
      if(/이미지|사진/.test(q))return 'gen:image';
      if(/영상|음악|미디어/.test(q))return 'gen:media';
      if(/자료/.test(q))return 'gen:library';
      if(/콘텐츠|홍보|sns|발표/.test(q))return 'gen:content';
      if(/뉴스|소식/.test(q))return 'gen:news';
      return 'gen:news';
    }
    if(/회의/.test(q))return 'aria:meeting';
    if(/프로젝트|서울회의|서울 회의/.test(q))return 'aria:project';
    if(/task|태스크|할 일|할일|미완료/.test(q))return 'aria:task';
    if(/d-day|디데이/.test(q))return 'aria:dday';
    if(/일정/.test(q))return 'aria:schedule';
    if(/이번 주|주간/.test(q))return 'aria:week';
    if(/이번 달|월간/.test(q))return 'aria:month';
    if(/브리핑|출근/.test(q))return 'aria:briefing';
    if(/오늘/.test(q))return 'aria:today';
    return null;
  }
  function setVoiceUi(mode,message){
    if(voiceMic)voiceMic.classList.toggle('listening',mode==='listening');
    if(voiceMic)voiceMic.setAttribute('aria-pressed',mode==='listening'?'true':'false');
    if(voiceDot)voiceDot.classList.toggle('on',mode==='listening');
    if(voiceState)voiceState.textContent=message;
  }
  if(SpeechRecognition&&voiceMic){
    recognition=new SpeechRecognition();
    recognition.lang='ko-KR';
    recognition.interimResults=false;
    recognition.continuous=false;
    recognition.maxAlternatives=1;
    if(voiceSupport)voiceSupport.textContent='음성인식 사용 가능 · 마이크 권한이 필요할 수 있습니다.';
    recognition.onstart=()=>{voiceListening=true;setVoiceUi('listening','듣고 있습니다…');if(voiceTranscript)voiceTranscript.textContent='명령을 말씀하세요.';};
    recognition.onresult=e=>{
      const text=e.results?.[0]?.[0]?.transcript||'';
      if(voiceTranscript)voiceTranscript.textContent='인식: '+text;
      const action=resolveVoiceAction(text);
      if(action){setVoiceUi('ready','명령 인식 · '+action);executeOfficeAction(action,'voice');}
      else setVoiceUi('ready','명령을 찾지 못했습니다');
    };
    recognition.onerror=e=>{setVoiceUi('ready','음성인식 오류');if(voiceTranscript)voiceTranscript.textContent=e.error==='not-allowed'?'마이크 권한을 확인해 주세요.':'다시 눌러 말씀해 주세요. ('+e.error+')';};
    recognition.onend=()=>{voiceListening=false;if(voiceMic)voiceMic.classList.remove('listening');if(voiceDot)voiceDot.classList.remove('on');};
    voiceMic.addEventListener('click',()=>{try{if(voiceListening)recognition.stop();else recognition.start();}catch(e){}});
  }else{
    if(voiceSupport)voiceSupport.textContent='이 브라우저는 Web Speech 음성인식을 지원하지 않습니다. 메뉴 ACTION은 정상 사용 가능합니다.';
    if(voiceMic){voiceMic.disabled=true;voiceMic.classList.add('unsupported');}
  }

  // ===== HOME 5차 · TASK 업무관리 (AI OFFICE 전용 localStorage) =====
  const TASK_STORAGE_KEY='ipma_ai_office_tasks_v1';
  let taskFilter='all';

  const taskSeed=[
    {id:'seed-member-plan',title:'회원등급안 준비',due:'2026-09-04',priority:'high',project:'서울 전략회의',done:false,createdAt:'2026-09-02T00:00:00+09:00'},
    {id:'seed-fee-plan',title:'회비 A/B/C안 작성',due:'2026-09-04',priority:'high',project:'서울 전략회의',done:false,createdAt:'2026-09-02T00:00:00+09:00'},
    {id:'seed-org-chart',title:'조직도 준비',due:'2026-09-04',priority:'normal',project:'서울 전략회의',done:false,createdAt:'2026-09-02T00:00:00+09:00'},
    {id:'seed-spark-vision',title:'SPARK 비전 준비',due:'2026-09-04',priority:'normal',project:'서울 전략회의',done:false,createdAt:'2026-09-02T00:00:00+09:00'},
    {id:'seed-tab-check',title:'Galaxy Tab 자료 점검',due:'2026-09-04',priority:'normal',project:'서울 전략회의',done:false,createdAt:'2026-09-02T00:00:00+09:00'}
  ];

  function loadTasks(){
    try{
      const raw=localStorage.getItem(TASK_STORAGE_KEY);
      if(!raw){ localStorage.setItem(TASK_STORAGE_KEY,JSON.stringify(taskSeed)); return [...taskSeed]; }
      const parsed=JSON.parse(raw);
      return Array.isArray(parsed)?parsed:[...taskSeed];
    }catch(e){ return [...taskSeed]; }
  }
  function saveTasks(tasks){
    try{ localStorage.setItem(TASK_STORAGE_KEY,JSON.stringify(tasks)); }catch(e){}
  }
  function esc(v){ return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function priorityLabel(v){ return v==='high'?'중요':v==='low'?'낮음':'보통'; }
  function renderTasks(){
    const list=document.getElementById('taskList'); if(!list)return;
    const tasks=loadTasks();
    const visible=tasks.filter(t=>taskFilter==='all'||(taskFilter==='done'?t.done:!t.done));
    document.getElementById('taskTotal').textContent=tasks.length;
    document.getElementById('taskOpen').textContent=tasks.filter(t=>!t.done).length;
    document.getElementById('taskDone').textContent=tasks.filter(t=>t.done).length;
    if(!visible.length){ list.innerHTML='<div class="task-empty">표시할 TASK가 없습니다.</div>'; return; }
    list.innerHTML=visible.map(t=>`<div class="task-item ${t.done?'done':''}" data-task-id="${esc(t.id)}">
      <label class="task-check"><input type="checkbox" ${t.done?'checked':''} data-task-toggle><span></span></label>
      <div class="task-copy"><b>${esc(t.title)}</b><small>${t.due?'마감 '+esc(t.due):'마감일 없음'} · ${esc(t.project||'일반')}</small></div>
      <em class="priority ${esc(t.priority||'normal')}">${priorityLabel(t.priority)}</em>
      <button type="button" class="task-delete" data-task-delete aria-label="TASK 삭제">삭제</button>
    </div>`).join('');
  }
  function addTask(data){ const tasks=loadTasks(); tasks.unshift(data); saveTasks(tasks); renderTasks(); }
  function updateTask(id,patch){ const tasks=loadTasks().map(t=>t.id===id?{...t,...patch}:t); saveTasks(tasks); renderTasks(); }
  function deleteTask(id){ const tasks=loadTasks().filter(t=>t.id!==id); saveTasks(tasks); renderTasks(); }

  const taskForm=document.getElementById('taskForm');
  if(taskForm) taskForm.addEventListener('submit',e=>{
    e.preventDefault();
    const title=document.getElementById('taskTitle').value.trim(); if(!title)return;
    addTask({id:'task-'+Date.now(),title,due:document.getElementById('taskDue').value,priority:document.getElementById('taskPriority').value,project:document.getElementById('taskProject').value,done:false,createdAt:new Date().toISOString()});
    taskForm.reset(); document.getElementById('taskPriority').value='normal'; document.getElementById('taskProject').value='서울 전략회의';
  });
  const taskList=document.getElementById('taskList');
  if(taskList) taskList.addEventListener('change',e=>{
    const row=e.target.closest('[data-task-id]'); if(row&&e.target.matches('[data-task-toggle]')) updateTask(row.dataset.taskId,{done:e.target.checked});
  });
  if(taskList) taskList.addEventListener('click',e=>{
    const row=e.target.closest('[data-task-id]'); if(row&&e.target.matches('[data-task-delete]')) deleteTask(row.dataset.taskId);
  });
  document.querySelectorAll('[data-task-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    taskFilter=btn.dataset.taskFilter; document.querySelectorAll('[data-task-filter]').forEach(x=>x.classList.toggle('active',x===btn)); renderTasks();
  }));
  renderTasks();

  // ===== HOME 6차 · PROJECT 업무관리 (AI OFFICE 전용 localStorage) =====
  const PROJECT_STORAGE_KEY='ipma_ai_office_project_seoul_v1';
  const PROJECT_RECORDS_KEY='ipma_ai_office_project_seoul_records_v1';
  const projectSeed={purpose:'국제드론순찰대의 정체성 · 조직체계 · 회원제도 · 회비 · AI 사무국 · SPARK · 향후 공동사업을 검토하고 실행 방향을 정리한다.',status:'준비',location:'서울',participants:'확정 후 입력',materials:'조직도 · 회원등급안 · 회비안 · SPARK 비전 · Galaxy Tab 자료'};
  const recordSeed={decisions:[],unresolved:[],followups:[]};

  function loadProject(){
    try{const raw=localStorage.getItem(PROJECT_STORAGE_KEY);return raw?{...projectSeed,...JSON.parse(raw)}:{...projectSeed};}catch(e){return {...projectSeed};}
  }
  function saveProject(data){try{localStorage.setItem(PROJECT_STORAGE_KEY,JSON.stringify(data));}catch(e){}}
  function loadProjectRecords(){
    try{const raw=localStorage.getItem(PROJECT_RECORDS_KEY);const parsed=raw?JSON.parse(raw):{};return {...recordSeed,...parsed};}catch(e){return {...recordSeed};}
  }
  function saveProjectRecords(data){try{localStorage.setItem(PROJECT_RECORDS_KEY,JSON.stringify(data));}catch(e){}}

  function renderProjectBasics(){
    const p=loadProject();
    const map={projectPurpose:'purpose',projectStatus:'status',projectLocation:'location',projectParticipants:'participants',projectMaterials:'materials'};
    Object.entries(map).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=p[key]||'';});
    const badge=document.getElementById('projectStatusBadge'); if(badge)badge.textContent=p.status||'준비';
  }
  function renderProjectTasks(){
    const tasks=loadTasks().filter(t=>t.project==='서울 전략회의');
    const done=tasks.filter(t=>t.done).length;
    const total=tasks.length;
    const progress=total?Math.round(done/total*100):0;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('projectTaskTotal',total);set('projectTaskDone',done);set('projectProgressText',progress+'%');
    const bar=document.getElementById('projectProgressBar'); if(bar)bar.style.width=progress+'%';
    const list=document.getElementById('projectTaskList'); if(!list)return;
    list.innerHTML=tasks.length?tasks.map(t=>`<div class="project-task-row ${t.done?'done':''}"><span>${t.done?'✓':'○'}</span><p><b>${esc(t.title)}</b><small>${t.due?'마감 '+esc(t.due):'마감일 없음'} · ${priorityLabel(t.priority)}</small></p><em>${t.done?'완료':'진행'}</em></div>`).join(''):'<div class="task-empty">연결된 TASK가 없습니다.</div>';
  }
  function renderProjectRecords(){
    const records=loadProjectRecords();
    document.querySelectorAll('[data-record-kind]').forEach(col=>{
      const kind=col.dataset.recordKind;
      const list=col.querySelector('.record-list');
      const items=Array.isArray(records[kind])?records[kind]:[];
      list.innerHTML=items.length?items.map((item,i)=>`<div class="record-item"><span>${String(i+1).padStart(2,'0')}</span><p>${esc(item.text)}</p><button type="button" data-record-delete="${i}" aria-label="삭제">삭제</button></div>`).join(''):'<div class="record-empty">아직 기록이 없습니다.</div>';
    });
  }
  const projectSave=document.getElementById('projectSave');
  if(projectSave)projectSave.addEventListener('click',()=>{
    const data={purpose:document.getElementById('projectPurpose').value.trim(),status:document.getElementById('projectStatus').value,location:document.getElementById('projectLocation').value.trim(),participants:document.getElementById('projectParticipants').value.trim(),materials:document.getElementById('projectMaterials').value.trim()};
    saveProject(data);renderProjectBasics();
    const note=document.getElementById('projectSaveNote');if(note){note.textContent='저장 완료 · AI OFFICE 전용 localStorage';setTimeout(()=>note.textContent='AI OFFICE 전용 localStorage 저장 · Supabase 쓰기 없음',1800);}
  });
  document.querySelectorAll('.record-form').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const col=form.closest('[data-record-kind]');const kind=col.dataset.recordKind;const input=form.querySelector('input');const text=input.value.trim();if(!text)return;
    const records=loadProjectRecords();records[kind]=Array.isArray(records[kind])?records[kind]:[];records[kind].push({text,createdAt:new Date().toISOString()});saveProjectRecords(records);input.value='';renderProjectRecords();
  }));
  document.querySelectorAll('.record-list').forEach(list=>list.addEventListener('click',e=>{
    const btn=e.target.closest('[data-record-delete]');if(!btn)return;const col=list.closest('[data-record-kind]');const kind=col.dataset.recordKind;const records=loadProjectRecords();const i=Number(btn.dataset.recordDelete);if(Array.isArray(records[kind]))records[kind].splice(i,1);saveProjectRecords(records);renderProjectRecords();
  }));

  // TASK 변경 시 PROJECT 진행률도 즉시 갱신
  if(taskList){taskList.addEventListener('change',()=>setTimeout(renderProjectTasks,0));taskList.addEventListener('click',()=>setTimeout(renderProjectTasks,0));}
  if(taskForm)taskForm.addEventListener('submit',()=>setTimeout(renderProjectTasks,0));
  renderProjectBasics();renderProjectTasks();renderProjectRecords();


  // ===== HOME 7차 · 회의관리 (AI OFFICE 전용 localStorage) =====
  const MEETING_STORAGE_KEY='ipma_ai_office_meeting_seoul_v1';
  const MEETING_RECORDS_KEY='ipma_ai_office_meeting_seoul_records_v1';
  const meetingSeed={date:'2026-09-04',time:'13:30',location:'서울',status:'준비',purpose:'국제드론순찰대의 정체성 · 조직체계 · 회원제도 · 회비 · AI 사무국 · SPARK · 향후 공동사업의 실행 방향을 정리한다.',participants:'확정 후 입력',materials:'조직도 · 회원등급안 · 회비안 · SPARK 비전 · Galaxy Tab 자료',nextMeetingDate:'',nextMeetingMemo:''};
  const meetingRecordSeed={
    agenda:[
      {text:'국제드론순찰대 정체성과 조직체계 검토'},
      {text:'무료회원 · 유료회원 · 회비 운영안 검토'},
      {text:'AI 사무국 · SPARK · 향후 공동사업 검토'}
    ],
    questions:[],decisionNeeds:[
      {text:'회원등급 및 회비 운영 방향'},
      {text:'임원 종류 · 권한 · 책임 · 임기 운영 방향'}
    ],decisions:[],unresolved:[],followups:[]
  };
  function loadMeeting(){try{const raw=localStorage.getItem(MEETING_STORAGE_KEY);return raw?{...meetingSeed,...JSON.parse(raw)}:{...meetingSeed};}catch(e){return {...meetingSeed};}}
  function saveMeeting(data){try{localStorage.setItem(MEETING_STORAGE_KEY,JSON.stringify(data));}catch(e){}}
  function loadMeetingRecords(){try{const raw=localStorage.getItem(MEETING_RECORDS_KEY);const parsed=raw?JSON.parse(raw):{};const out={...meetingRecordSeed,...parsed};Object.keys(meetingRecordSeed).forEach(k=>out[k]=Array.isArray(out[k])?out[k]:[]);return out;}catch(e){return JSON.parse(JSON.stringify(meetingRecordSeed));}}
  function saveMeetingRecords(data){try{localStorage.setItem(MEETING_RECORDS_KEY,JSON.stringify(data));}catch(e){}}
  function renderMeetingBasics(){
    const m=loadMeeting();
    const map={meetingDate:'date',meetingTime:'time',meetingLocation:'location',meetingStatus:'status',meetingPurpose:'purpose',meetingParticipants:'participants',meetingMaterials:'materials',nextMeetingDate:'nextMeetingDate',nextMeetingMemo:'nextMeetingMemo'};
    Object.entries(map).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=m[key]||'';});
    const badge=document.getElementById('meetingStatusBadge');if(badge)badge.textContent=m.status||'준비';
  }
  function renderMeetingRecords(){
    const records=loadMeetingRecords();
    document.querySelectorAll('[data-meeting-kind]').forEach(box=>{
      const kind=box.dataset.meetingKind;const list=box.querySelector('.meeting-item-list');const items=records[kind]||[];
      list.innerHTML=items.length?items.map((item,i)=>{
        const detail=kind==='followups'?`<small>${item.owner?'담당 '+esc(item.owner):'담당 미정'}${item.due?' · 마감 '+esc(item.due):''}</small>`:'';
        return `<div class="meeting-item"><span>${String(i+1).padStart(2,'0')}</span><p><b>${esc(item.text)}</b>${detail}</p><button type="button" data-meeting-delete="${i}">삭제</button></div>`;
      }).join(''):'<div class="meeting-empty">아직 기록이 없습니다.</div>';
    });
  }
  const meetingSave=document.getElementById('meetingSave');
  if(meetingSave)meetingSave.addEventListener('click',()=>{
    const old=loadMeeting();const data={...old,date:document.getElementById('meetingDate').value,time:document.getElementById('meetingTime').value,location:document.getElementById('meetingLocation').value.trim(),status:document.getElementById('meetingStatus').value,purpose:document.getElementById('meetingPurpose').value.trim(),participants:document.getElementById('meetingParticipants').value.trim(),materials:document.getElementById('meetingMaterials').value.trim()};
    saveMeeting(data);renderMeetingBasics();const n=document.getElementById('meetingSaveNote');if(n){n.textContent='저장 완료 · AI OFFICE 전용 localStorage';setTimeout(()=>n.textContent='AI OFFICE 전용 localStorage · Supabase 쓰기 없음',1800);}
  });
  document.querySelectorAll('.meeting-item-form').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const box=form.closest('[data-meeting-kind]');const kind=box.dataset.meetingKind;const input=form.querySelector('input');const text=input.value.trim();if(!text)return;const records=loadMeetingRecords();records[kind].push({text,createdAt:new Date().toISOString()});saveMeetingRecords(records);input.value='';renderMeetingRecords();
  }));
  document.querySelectorAll('.meeting-followup-form').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const text=form.querySelector('.followup-text').value.trim();if(!text)return;const records=loadMeetingRecords();records.followups.push({text,owner:form.querySelector('.followup-owner').value.trim(),due:form.querySelector('.followup-due').value,createdAt:new Date().toISOString()});saveMeetingRecords(records);form.reset();renderMeetingRecords();
  }));
  document.querySelectorAll('.meeting-item-list').forEach(list=>list.addEventListener('click',e=>{
    const btn=e.target.closest('[data-meeting-delete]');if(!btn)return;const box=list.closest('[data-meeting-kind]');const kind=box.dataset.meetingKind;const records=loadMeetingRecords();records[kind].splice(Number(btn.dataset.meetingDelete),1);saveMeetingRecords(records);renderMeetingRecords();
  }));
  const nextMeetingSave=document.getElementById('nextMeetingSave');
  if(nextMeetingSave)nextMeetingSave.addEventListener('click',()=>{const m=loadMeeting();m.nextMeetingDate=document.getElementById('nextMeetingDate').value;m.nextMeetingMemo=document.getElementById('nextMeetingMemo').value.trim();saveMeeting(m);nextMeetingSave.textContent='저장 완료';setTimeout(()=>nextMeetingSave.textContent='다음 회의 저장',1500);});

  const meetingSyncProject=document.getElementById('meetingSyncProject');
  if(meetingSyncProject)meetingSyncProject.addEventListener('click',()=>{
    const mr=loadMeetingRecords();const pr=loadProjectRecords();
    const merge=(target,items,mapper)=>{const existing=new Set(target.map(x=>String(x.text||'').trim()));items.forEach(item=>{const v=mapper(item);if(v.text&&!existing.has(v.text.trim())){target.push(v);existing.add(v.text.trim());}});};
    merge(pr.decisions,mr.decisions,x=>({text:x.text,source:'meeting',createdAt:x.createdAt||new Date().toISOString()}));
    merge(pr.unresolved,mr.unresolved,x=>({text:x.text,source:'meeting',createdAt:x.createdAt||new Date().toISOString()}));
    merge(pr.followups,mr.followups,x=>({text:`${x.text}${x.owner?' · 담당 '+x.owner:''}${x.due?' · 마감 '+x.due:''}`,source:'meeting',createdAt:x.createdAt||new Date().toISOString()}));
    saveProjectRecords(pr);renderProjectRecords();const note=document.getElementById('meetingSyncNote');if(note){note.textContent='PROJECT 기록 반영 완료';setTimeout(()=>note.textContent='중복 문구는 자동으로 건너뜁니다.',2000);}
  });
  renderMeetingBasics();renderMeetingRecords();

  updateClock();
  renderPanel('today');
  setInterval(updateClock,30000);
})();
