AI OFFICE 2.0 · v0.11.0 · HOME 11차

[목적]
기존 MENU/VOICE 공통 ACTION과 SAFE BRIDGE를 유지하면서 브라우저 내 예약업무 기능을 최소 확장한다.

[이번 단계 구현]
- 예약업무 등록: 업무명 / 실행일 / 시간 / 반복 / 담당 AI / ACTION
- 반복: 한 번 / 매일 / 매주 / 매월
- 활성/비활성 및 삭제
- 다음 실행 예정시간 표시
- 마지막 실행 기록 표시
- Asia/Seoul 기준 30초 간격 예약시간 감지
- 예약시간 도달 시 기존 executeOfficeAction() 공통 ACTION 실행
- 한 번 예약은 실행 후 자동 비활성
- localStorage 저장만 사용

[중요한 실행 한계]
이 버전의 예약엔진은 AI OFFICE 페이지가 열려 있는 동안에만 작동한다.
브라우저가 닫혀 있거나 기기가 절전 상태이면 백그라운드 서버 예약처럼 실행되지 않는다.
서버 기반 예약 실행은 별도 단계에서 기존 스케줄/예약 기능 존재 여부를 다시 조사한 뒤 검토한다.

[보호]
GMS / IDP / SPARK / Supabase / RLS / 인증 / Realtime / SESSION / 연결코드 / 기존 CONTROL / DISPLAY 수정 0건.
10차 SAFE BRIDGE 기능도 그대로 유지한다.
