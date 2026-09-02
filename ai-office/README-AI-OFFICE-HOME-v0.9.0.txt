AI OFFICE 2.0 · v0.9.0 · HOME 9차

이번 단계: 음성 + 메뉴 ACTION 통합

- 음성과 버튼이 동일한 executeOfficeAction() 공통 라우터 사용
- ARIA 음성: 오늘 / 일정 / D-Day / TASK / PROJECT / 회의 / 주간 / 월간 / 출근 브리핑
- GEN 음성: 뉴스 / 기사 / 콘텐츠 / 이미지 / 미디어 / 자료
- 예: “아리아 오늘 일정 보여줘”, “아리아 서울회의 보여줘”, “젠 오늘 뉴스 보여줘”
- Web Speech API 지원 브라우저에서만 음성인식 작동
- 미지원 브라우저에서는 메뉴 ACTION 그대로 사용 가능
- 음성 ACTION은 화면 호출까지만 수행하며 Supabase 쓰기·회원승인·회비변경·기사 자동발행 없음
- GMS / IDP / SPARK / Supabase / Auth / RLS / Realtime / CONTROL / DISPLAY 수정 없음
- 기존 TASK / PROJECT / MEETING localStorage 구조 유지

배포: 저장소 최상위의 기존 ai-office 폴더에 이 폴더 내용을 덮어업로드합니다.
