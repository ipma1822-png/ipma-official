AI OFFICE 2.0 v0.17.1 / HOME 17차 · SESSION JOIN PINPOINT

원인:
휴대폰 CONTROL의 aiOfficeSessionCode는 휴대폰 브라우저 localStorage에만 저장됩니다.
PC의 localStorage와 자동 공유되지 않으므로 PC AI OFFICE가 같은 6자리 Realtime 채널에 참가하지 못했습니다.

수정:
- PC AI OFFICE에 '기존 CONTROL 연결코드 참가' 입력 UI 추가
- 휴대폰 CONTROL에 보이는 6자리 코드를 PC에 입력
- 기존 createPresentationChannel / Broadcast / Presence / ACK 그대로 재사용
- 새 SESSION 생성 없음
- control.js / Supabase SQL / RLS / Auth 변경 없음

테스트:
1. 휴대폰 CONTROL에서 DISPLAY 연결됨 확인
2. PC AI OFFICE v0.17.1에서 같은 6자리 코드 입력
3. '기존 SESSION 연결' 클릭
4. PC 상태에 DISPLAY 연결됨 확인
5. PC에서 '오늘' ACTION 클릭
6. Galaxy Tab DISPLAY 변화 확인
