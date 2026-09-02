AI OFFICE 2.0 · v0.10.0 · HOME 10차

[목적]
기존 CONTROL ↔ DISPLAY를 재개발하지 않고 AI OFFICE 공통 ACTION과 연결할 수 있는 안전한 BRIDGE 준비.

[이번 단계 구현]
- window.AIOfficeBridge 독립 어댑터 추가
- MENU/VOICE 공통 ACTION 발생 시 ai-office:display-action CustomEvent 발생
- 기존 CONTROL/DISPLAY transport 등록용 registerTransport(sendFn) 인터페이스 준비
- BRIDGE 상태/마지막 ACTION/내부 테스트 UI 추가

[중요]
현재 제공된 IPMA ZIP에는 실제 CONTROL/DISPLAY 원본 구현이 확인되지 않아 실제 Realtime 송신 연결은 하지 않았음.
SESSION / 연결코드 / Supabase / Realtime / 기존 CONTROL / DISPLAY 수정 0건.
원본을 확보한 뒤 기존 송신 함수를 registerTransport에 연결하는 최소 연동만 진행해야 함.
