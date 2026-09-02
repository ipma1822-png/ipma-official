(function(){
  'use strict';
  const VERSION='0.4.0';
  const SEOUL_TZ='Asia/Seoul';
  const meetingDate=new Date('2026-09-04T00:00:00+09:00');

  const panels={
    briefing:{eyebrow:'MORNING BRIEFING',title:'출근 브리핑',foot:'오늘 · 주간 · 월간 화면에서 같은 업무 흐름을 이어봅니다.',rows:[['오늘 주요 일정','서울 전략회의 준비를 첫 PROJECT 기준으로 관리합니다.','확인'],['이번 주 핵심','AI 사무국 HOME 기반을 확립하고 일정 → TASK → PROJECT 순으로 확장합니다.','진행'],['기존 시스템 보호','GMS · IDP · SPARK · 인증 · Supabase · Realtime은 이번 단계에서 수정하지 않습니다.','보호'],['AI 사무국 제안','새 기능을 만들기 전에 기존 기능과 데이터 연결을 먼저 확인합니다.','원칙']]},
    today:{eyebrow:'TODAY',title:'오늘',foot:'오늘 화면은 일정 · 업무 · 준비사항을 한곳에 모으는 3차 업무판입니다.',rows:[['가장 중요한 일','서울 전략회의 준비','우선'],['다음 중요 일정','2026년 9월 4일 국제드론순찰대 서울 전략회의','D-DAY'],['오늘의 운영','등록된 일정/TASK 저장 기능 연결 전까지 임의 업무를 생성하지 않습니다.','안전'],['확인할 것','다음 단계에서 기존 일정 기능 존재 여부를 조사한 뒤 연결합니다.','NEXT']]},
    week:{eyebrow:'THIS WEEK',title:'이번 주',foot:'주간 화면은 핵심목표 · 마감 · 프로젝트 진행 흐름을 연결하기 위한 기반입니다.',rows:[['주간 핵심목표','AI 사무국 HOME의 업무운영 기반 확립','핵심'],['개발 흐름','오늘/주간/월간 → 일정/D-Day → TASK → PROJECT','순서'],['첫 실전 적용','서울 전략회의 준비를 PROJECT 테스트 사례로 사용','PROJECT'],['보호영역','인증 · Supabase · RLS · Realtime · GMS · IDP · SPARK','보호']]},
    month:{eyebrow:'THIS MONTH',title:'이번 달',foot:'월간 화면은 주요행사 · 프로젝트 · D-Day · 조직별 핵심업무를 연결하는 상위 보드입니다.',rows:[['월간 중심','중요 일정 · PROJECT · D-Day를 한 화면에서 확인','목표'],['첫 PROJECT','국제드론순찰대 서울 전략회의','실전'],['연결 준비','PROJECT · 회의 · 자료 · 아리아 브리핑 구조 준비','연결'],['데이터 원칙','기존 데이터가 있으면 재사용하고 없을 때만 최소 확장','원칙']]},
    schedule:{eyebrow:'SCHEDULE',title:'일정',foot:'4차 일정 화면은 현재 확인된 일정만 읽기 중심으로 표시합니다. 일정 DB 생성·수정은 하지 않습니다.',rows:[['오늘','2026년 9월 2일 · AI 사무국 일정/D-Day 기반 구축','진행'],['다음 일정','2026년 9월 4일 국제드론순찰대 서울 전략회의','중요'],['연결 원칙','일정 → D-Day → TASK → PROJECT 순으로 연결합니다.','연결'],['데이터 원칙','기존 일정 기능이 없으므로 이번 단계에서는 UI/읽기 구조만 구축합니다.','보호']]},
    dday:{eyebrow:'D-DAY',title:'D-Day',foot:'D-Day는 Asia/Seoul 날짜 기준으로 자동 계산하며 첫 실전 PROJECT 일정과 연결됩니다.',rows:[['기준 일정','국제드론순찰대 서울 전략회의','PROJECT'],['목표일','2026년 9월 4일','DATE'],['계산 기준','Asia/Seoul 자정 기준 날짜 차이','자동'],['연결 예정','향후 일정 데이터의 중요일정을 D-Day 카드에 자동 반영','NEXT']]},
    task:{eyebrow:'TASK',title:'TASK 업무관리',foot:'TASK는 5차 예정 기능입니다. 먼저 기존 기능 존재 여부를 확인합니다.',rows:[['상태','다음 개발단계 후보','NEXT'],['원칙','일정과 TASK는 구분하되 PROJECT에 연결','설계'],['예정 기능','마감 · 중요도 · 완료/미완료 · 관련 프로젝트','예정'],['주의','기존 TASK 기능 존재 여부를 먼저 확인한 뒤 개발','보호']]},
    project:{eyebrow:'PROJECT',title:'PROJECT',foot:'PROJECT는 6차 예정 기능이며 서울 전략회의를 첫 실전 사례로 사용합니다.',rows:[['첫 PROJECT','국제드론순찰대 서울 전략회의','실전'],['연결','목적 · 일정 · 참석자 · TASK · 자료 · 안건','설계'],['회의 후','결정사항 · 미결사항 · 후속업무를 연결','후속'],['주의','회원·회비·SPARK는 새로 만들지 않고 GMS에서 읽기','보호']]},
    meeting:{eyebrow:'MEETING',title:'회의관리',foot:'회의관리는 PROJECT와 연결하며 독립된 회원·조직 기능을 만들지 않습니다.',rows:[['회의 전','목적 · 참석자 · 안건 · 자료 · 질문 · 결정 필요사항','준비'],['회의 후','결정사항 · 미결사항 · 담당 · 후속업무 · 다음회의','기록'],['연결 대상','PROJECT와 연결','연결'],['현재 단계','UI 진입점만 준비','준비']]},
    library:{eyebrow:'RESOURCE',title:'자료',foot:'기존 자료 저장 위치와 호출 방식을 먼저 확인한 뒤 AI OFFICE에서 연결합니다.',rows:[['저장 원칙','AI 사무국에 기존 자료를 중복 저장하지 않습니다.','원칙'],['역할','검색 · 분류 · 호출 · DISPLAY 연결','연결'],['이미지','기존 이미지 전송/표시 기능을 우선 재사용','재사용'],['현재 단계','기존 자료 저장 위치 조사 후 연결 예정','NEXT']]}
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

  updateClock();
  renderPanel('today');
  setInterval(updateClock,30000);
})();
