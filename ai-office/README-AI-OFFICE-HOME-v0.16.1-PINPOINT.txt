AI OFFICE 2.0 · v0.16.1 / HOME 16차 · PINPOINT PATCH

원인:
- executeOfficeAction()은 기존부터 VOICE / MENU / 예약업무가 함께 사용하고 있었음.
- 그러나 함수가 IIFE 내부에 있어 v0.16.0 자체점검의 전역 검사에서만 '확인 필요'로 표시됨.

수정:
1) 기존 executeOfficeAction 로직은 변경하지 않음.
2) window.executeOfficeAction = executeOfficeAction 로 안전하게 공개.
3) 자체점검은 window.executeOfficeAction 존재 여부만 확인.
4) 내부 VERSION 및 HTML meta/cache-buster의 이전 버전 잔여값을 v0.16.1로 정리.
5) HOME 16차 및 기존 기능/데이터 구조 유지.

수정하지 않음:
GMS / IDP / SPARK / Supabase / Auth / RLS / Realtime /
SESSION / 연결코드 / CONTROL / DISPLAY / TASK / PROJECT /
회의 / 예약데이터 / 뉴스 / 기사 / 자료 / 미디어 로직.

예상 자체점검:
12항목 중 12항목 정상.
