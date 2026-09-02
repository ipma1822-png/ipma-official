AI OFFICE 2.0 · v0.13.0 · HOME 13차
자료·이미지 DISPLAY SAFE RESOURCE BRIDGE

[이번 단계]
- 기존 자료/이미지의 URL 또는 경로를 AI OFFICE 호출함에 등록
- 자료명 / 종류 / 담당 AI / 기존 위치 / 메모 관리
- 선택 자료 미리보기(HTTP/HTTPS 이미지인 경우)
- DISPLAY 준비 버튼 → 기존 SAFE BRIDGE에 resource payload 전달
- GEN 이미지/자료 ACTION → 자료·이미지 DISPLAY 보드로 이동
- 실제 CONTROL/DISPLAY transport가 등록되면 같은 Bridge를 통해 전달 가능

[보호 원칙]
- 파일 자체를 AI OFFICE에 중복 저장하지 않음
- Supabase / RLS / 인증 / Realtime / SESSION / 연결코드 수정 없음
- CONTROL/DISPLAY 송수신 코드 추측·재개발 없음
- transport 미연결 시 브라우저 내부 ai-office:display-action 이벤트까지만 실행
- 기존 v0.10 SAFE BRIDGE, v0.11 예약업무, v0.12 뉴스 브리핑 유지

[배포]
ZIP의 ai-office 폴더만 기존 GitHub 최상위 ai-office 폴더에 덮어쓰기

[테스트]
1. 자료명/종류/URL 또는 기존 경로 입력
2. DISPLAY 자료 등록
3. 자료 선택 후 DISPLAY 준비 클릭
4. transport 미연결 상태에서는 “SAFE BRIDGE 내부 이벤트까지 완료”가 정상

Version: v0.13.0
