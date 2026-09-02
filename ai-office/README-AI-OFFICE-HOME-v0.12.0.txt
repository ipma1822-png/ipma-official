AI OFFICE 2.0 · v0.12.0 · HOME 12차

[목적]
GEN의 뉴스 ACTION을 실제 뉴스 브리핑 보드로 확장한다.

[이번 단계 구현]
- 확인한 뉴스 항목 직접 등록: 제목 / 분야 / 중요도 / 출처 / 한줄 요약
- 긴급 / 중요 / 일반 우선순위
- 중요도 및 등록시간 기준 정렬
- 최대 5건 오늘의 GEN 브리핑 자동 구성
- 전체 / 긴급 / 중요 / 일반 필터
- 항목 삭제
- 브리핑 마지막 정리시간 기록
- GEN 뉴스 MENU / VOICE / 예약 ACTION과 기존 공통 ACTION 유지
- localStorage 저장만 사용

[현재 단계의 한계]
외부 뉴스 API 또는 웹 자동수집은 연결하지 않았다.
확인되지 않은 뉴스를 자동 생성하지 않는다.
기사 자동 발행을 하지 않는다.
브라우저를 바꾸거나 localStorage를 삭제하면 뉴스함 데이터는 공유/보존되지 않는다.

[보호]
GMS / IDP / SPARK / Supabase / RLS / 인증 / Realtime / SESSION / 연결코드 / 기존 CONTROL / DISPLAY 수정 0건.
10차 SAFE BRIDGE와 11차 예약업무를 그대로 유지한다.
