AI OFFICE 2.0 · v0.17.0 / HOME 17차
기존 CONTROL ↔ DISPLAY Realtime 실제 연결

조사된 기존 정상 구조:
- ai-office/config.js
- ai-office/shared/core.js
- ai-office/control/control.js
- ai-office/display/display.js
- 6자리 SESSION
- localStorage: aiOfficeSessionCode / aiOfficeDisplayCode
- Supabase Realtime Broadcast
- Presence role: control / display
- command → ACK

이번 최소 확장:
1. realtime-bridge.js 추가
   - 기존 shared/core.js의 createPresentationChannel / sendBroadcast 재사용
   - 기존 aiOfficeSessionCode 재사용
   - SAFE BRIDGE transport로 등록
2. display/display.js 핀셋 확장
   - 기존 SHOW_CONTENT 그대로 유지
   - AI_OFFICE_ACTION 명령만 추가
   - 기존 webView를 재사용해 AI OFFICE 2.0 화면 표시
3. app.js
   - displayAction 파라미터 실행
   - DISPLAY 내부 실행은 재전송하지 않아 무한루프 방지
4. Supabase SQL / TABLE / RLS / 인증 변경 없음
5. 기존 control.js 변경 없음

중요:
- 기존 v1.0.0의 config.js와 shared/core.js가 배포에 존재해야 합니다.
- 현재 정상 CONTROL/DISPLAY를 새로 만들지 않습니다.
- 먼저 기존 CONTROL과 DISPLAY가 동일 6자리 코드로 연결된 상태에서 테스트합니다.

테스트:
A. 기존 CONTROL ↔ DISPLAY 연결 확인
B. 같은 브라우저의 AI OFFICE HOME에서 메뉴 ACTION 클릭
C. DISPLAY가 AI OFFICE 화면으로 이동
D. CONTROL/DISPLAY 기존 콘텐츠 SHOW_CONTENT도 정상인지 재확인
