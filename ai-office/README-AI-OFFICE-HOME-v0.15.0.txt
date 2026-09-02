AI OFFICE 2.0 · v0.15.0 · HOME 15차

[이번 단계]
- GEN 음악·영상 호출 보드 추가
- 기존 미디어 URL/경로만 등록하여 중복 저장 방지
- 영상/오디오 직접 URL은 브라우저에서 수동 미리재생 가능
- 자동재생 금지(no autoplay)
- DISPLAY 준비 버튼은 기존 SAFE BRIDGE에 media payload 전달
- 실제 CONTROL/DISPLAY transport 미연결 시 내부 이벤트까지만 실행
- GEN 미디어 MENU/VOICE ACTION이 동일한 media 보드로 이동
- localStorage: ipma_ai_office_media_library_v1

[유지]
- v0.10 SAFE BRIDGE
- v0.11 예약업무
- v0.12 GEN 뉴스 브리핑
- v0.13 자료·이미지 DISPLAY
- v0.14 GEN 기사 준비

[변경하지 않음]
GMS / IDP / SPARK / Supabase / RLS / 인증 / Realtime / SESSION / 연결코드 / 기존 CONTROL·DISPLAY

[배포]
이 ZIP의 ai-office 폴더만 기존 GitHub 최상위 ai-office 폴더에 덮어쓰기.
