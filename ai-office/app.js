(function(){
  'use strict';
  const SEOUL_TZ='Asia/Seoul';
  const meetingDate=new Date('2026-09-04T00:00:00+09:00');
  const panels={
    briefing:{eyebrow:'MORNING BRIEFING',title:'출근 브리핑',rows:[['오늘 주요 일정','서울 전략회의 준비를 첫 PROJECT 기준으로 관리합니다.'],['이번 주 핵심','AI 사무국 HOME 구축 후 일정 → TASK → PROJECT 순으로 확장합니다.'],['기존 시스템 보호','GMS · IDP · SPARK · 인증 · Supabase · Realtime은 이번 단계에서 수정하지 않습니다.'],['AI 사무국 제안','새 기능보다 기존 시스템 연결을 우선합니다.']]},
    today:{eyebrow:'TODAY',title:'오늘',rows:[['일정 영역','기존 일정 기능 조사 후 3·4차에서 실제 데이터를 연결합니다.'],['업무 영역','TASK 데이터 구조 확정 전까지 임의 업무를 저장하지 않습니다.'],['다음 일정','2026년 9월 4일 국제드론순찰대 서울 전략회의'],['운영 원칙','화면은 준비하되 기존 시스템의 쓰기 로직은 변경하지 않습니다.']]},
    week:{eyebrow:'THIS WEEK',title:'이번 주',rows:[['핵심목표','AI 사무국 HOME 기반 확립'],['개발순서','HOME → 오늘/주간/월간 → 일정/D-Day → TASK → PROJECT'],['보호영역','인증 · Supabase · RLS · Realtime · GMS · IDP · SPARK'],['첫 적용','서울 전략회의를 실제 PROJECT 테스트 사례로 사용']]},
    month:{eyebrow:'THIS MONTH',title:'이번 달',rows:[['월간 HOME','중요 일정 · PROJECT · D-Day를 한 화면에서 보는 구조'],['데이터 원칙','기존 데이터가 있으면 재사용하고 없을 때만 최소 확장'],['연결 대상','GMS · IDP · SPARK · 콘텐츠 · 자료 · CONTROL/DISPLAY'],['현재 단계','HOME UI 기반 구축']]},
    task:{eyebrow:'TASK',title:'TASK 업무관리',rows:[['상태','다음 개발단계 후보'],['원칙','일정과 TASK는 분리하되 PROJECT에 연결'],['예정 기능','마감 · 중요도 · 완료/미완료 · 관련 프로젝트'],['주의','기존 TASK 기능 존재 여부를 먼저 확인한 뒤 개발']]},
    project:{eyebrow:'PROJECT',title:'PROJECT',rows:[['첫 PROJECT','국제드론순찰대 서울 전략회의'],['연결','목적 · 일정 · 참석자 · TASK · 자료 · 안건'],['회의 후','결정사항 · 미결사항 · 후속업무를 연결'],['주의','회원·회비·SPARK는 새로 만들지 않고 GMS에서 읽기']]},
    meeting:{eyebrow:'MEETING',title:'회의관리',rows:[['회의 전','목적 · 참석자 · 안건 · 자료 · 질문 · 결정 필요사항'],['회의 후','결정사항 · 미결사항 · 담당 · 후속업무 · 다음회의'],['연결 대상','PROJECT와 연결'],['현재 단계','UI 진입점만 준비']]},
    library:{eyebrow:'RESOURCE',title:'자료',rows:[['저장 원칙','AI 사무국에 기존 자료를 중복 저장하지 않습니다.'],['역할','검색 · 분류 · 호출 · DISPLAY 연결'],['이미지','기존 이미지 전송/표시 기능을 우선 재사용'],['현재 단계','기존 자료 저장 위치 조사 후 연결 예정']]}
  };
  function updateClock(){
    const now=new Date();
    document.getElementById('todayLabel').textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:SEOUL_TZ,month:'long',day:'numeric',weekday:'short'}).format(now);
    document.getElementById('clock').textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:SEOUL_TZ,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
    const seoulToday=new Date(new Intl.DateTimeFormat('en-CA',{timeZone:SEOUL_TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(now)+'T00:00:00+09:00');
    const days=Math.ceil((meetingDate-seoulToday)/86400000);
    document.getElementById('dday').textContent=days>0?'D-'+days:days===0?'D-DAY':'D+'+Math.abs(days);
  }
  function renderPanel(key){
    const p=panels[key]; if(!p)return;
    document.getElementById('panelEyebrow').textContent=p.eyebrow;
    document.getElementById('panelTitle').textContent=p.title;
    document.getElementById('panelBody').innerHTML=p.rows.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p><b>${r[0]}</b><small>${r[1]}</small></p></div>`).join('');
    document.querySelectorAll('.work-card').forEach(b=>b.classList.toggle('active',b.dataset.panel===key));
  }
  document.querySelectorAll('.work-card').forEach(btn=>btn.addEventListener('click',()=>renderPanel(btn.dataset.panel)));
  document.querySelectorAll('.ai-action').forEach(btn=>btn.addEventListener('click',()=>{
    const aria=btn.dataset.ai==='aria';
    document.getElementById('panelEyebrow').textContent=aria?'ARIA · AI SECRETARY':'GEN · AI SECRETARY';
    document.getElementById('panelTitle').textContent=aria?'아리아 업무영역':'젠 업무영역';
    const rows=aria
      ?[['전략·기획','조직운영과 의사결정 준비를 지원합니다.'],['일정·업무','오늘 · 주간 · 월간 · D-Day · 미완료 업무를 연결합니다.'],['PROJECT·회의','프로젝트 준비와 회의 전후 기록을 지원합니다.'],['원칙','AI는 조사·정리·추천·준비를 하고 최종 판단은 사람이 합니다.']]
      :[['뉴스','Global News24 뉴스 모니터링과 기사 준비를 지원합니다.'],['콘텐츠','기사 · 이미지 · SNS · 홍보 · 발표자료를 준비합니다.'],['미디어','영상 · 음악 등 기존 콘텐츠 호출을 지원합니다.'],['원칙','기사는 자동 발행하지 않고 사람이 최종 승인합니다.']];
    document.getElementById('panelBody').innerHTML=rows.map((r,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p><b>${r[0]}</b><small>${r[1]}</small></p></div>`).join('');
    document.getElementById('detailPanel').scrollIntoView({behavior:'smooth',block:'center'});
  }));
  updateClock(); setInterval(updateClock,30000);
})();
