IPMA MASTER ADMIN HUB PATCH

추가/수정 파일
1) admin-hub/index.html - 관리자 본인 전용 통합 링크 허브
2) index.html - 메인 HERO에 통합 관리자 허브 버튼 추가

허브 주소
https://ipma.kr/admin-hub/

보안
- Supabase 이메일 매직링크 인증
- 허용 이메일: jeonseongkweon@gmail.com
- noindex/nofollow 적용
- Supabase Authentication > URL Configuration에서 필요하면 https://ipma.kr/admin-hub/ 를 Redirect URLs에 추가

관리자 주소가 실제로 존재하는 사이트는 직접 연결했고, 시뮬레이터/정적 사이트처럼 별도 관리자 화면이 확인되지 않은 사이트는 홈페이지 바로가기로 표시했습니다.

[보안 수정]
- 로그인 화면에 관리자 이메일을 미리 표시하지 않음
- 이메일 직접 입력 후 등록된 관리자 계정과 일치할 때만 매직링크 발송
