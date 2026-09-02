AI OFFICE 2.0 · v0.16.0 / HOME 16차
통합 테스트 · 운영 안정화

기준본: v0.15.0
이번 단계:
- v0.2~v0.15 누적 기능 보존
- 읽기 전용 통합 자체점검 패널 추가
- HOME / ACTION / SAFE BRIDGE / TASK / PROJECT / 회의 / 예약 / 뉴스 / 기사 / 자료·이미지 / 음악·영상 / localStorage 점검
- 기존 데이터 자동 초기화 없음
- 외부 시스템 쓰기 없음

보호 범위:
GMS / IDP / SPARK / Supabase / Auth / RLS / Realtime / SESSION / 연결코드 / CONTROL / DISPLAY 수정 없음.

주의:
자체점검의 '확인 필요'는 기능 삭제를 의미하지 않으며 DOM/함수 노출 방식 차이일 수 있습니다.
실제 CONTROL↔DISPLAY 송수신은 원본 transport 연결 전까지 SAFE BRIDGE 단계입니다.
