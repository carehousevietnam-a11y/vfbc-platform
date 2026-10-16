새 Cursor 창은 이 파일만 읽는다. 전체 기록은 LESSONS.md.

1 · 화면·브라우저 확인 없이 완료 보고하지 않는다.
2 · UI 기준은 행정과 세금 둘 다로 잡는다.
3 · PDF 추출에서 같은 문단이 두 번 나오면 실패로 본다.
4 · 고객 화면·PDF에 내부 용어(Cursor, URL 등)를 넣지 않는다.
5 · 테스트에 질문 수를 숫자로 고정하지 않고 문서 값과 비교한다.
6 · 문서의 질문 번호 범위가 실제 질문 수와 맞는지 확인한다.
7 · 한 축(위험·판단 요소)은 한 질문에서만 묻는다.
9 · 개발 서버 전에 환경 파일 존재를 확인한다(내용은 출력하지 않는다).
10 · 공통 파일은 추가만 하고 삭제 줄이 있으면 커밋을 막는다.
11 · 작업 전 폴더·브랜치·최근 커밋을 확인한다(C:\vfbcai-new).
14 · 운영 DB 연결 dev에서 저장·가입 단계를 눌러 기록을 남기지 않는다.
15 · 질문·선택지는 QUESTION_STANDARD 2중 구조를 따른다.
16 · 새 VERIFY 서비스는 공용 API 허용 목록(admin-verify-meta)에 추가한다.
17 · 기준은 STANDARDS.md 단일 출처; 변경은 ACE-APPROVED 후만.
19 · 빈말·반복을 빼고 정보 밀도를 유지한다(2층 구조는 줄이지 않는다).
21 · 선택지 4~5개+직접 입력(5 초과 금지); A14는 2층과 충돌하지 않는다.
22 · 둘째 정보는 첫째와 별개·자연스러운 연결; A15 외국인 눈높이.
23 · 화면 확인 전 Cursor 폴더·브랜치·커밋·dev 포트를 확인한다.
24 · 콘텐츠 직후 content-final 점검; 금지어(반드시·무조건·100%) 금지.
25 · 조문 번호는 원문 대조한 것만; 미대조는 본문에 쓰지 않는다.
26 · PDF 기준 비교는 매 실행마다 바뀌는 날짜 등은 제외한다.
27 · 새 서비스는 VERIFY 견적서 화면·MASTER 카드 목록·1번 질문 카드를 확인한다.
30 · "자동 검사 켬" 보고 전 grep·의도적 실패로 검사 존재를 확인한다.
31 · 새 서비스는 verify_trc 등 참조 grep 후 추가하고 즉시 tsc 한다.
40 · VM에서는 git write 금지; 읽기만 하고 커밋은 대표 PC에서 한다.
41 · 색 통일은 장식만; 위험도·완료·긴급 의미 색은 제외한다.
42 · 375px에서 고정 min-width·9px 글자 금지; 단계·배지는 11px+.
44 · QA 전 페이지 자동 접수·저장 여부를 코드로 확인한다(/consultation 등).
45 · Supabase .in()은 ~100개 묶음·range 페이지; 1000행 상한을 의심한다.
46 · anon RLS에 조건 없는 true 읽기를 만들지 않는다; SECURITY_RLS_AUDIT 갱신.
47 · 새 테이블 SQL에 service_role GRANT를 포함하고 API 저장 1회 확인한다.
49 · 퍼널 끝까지 점검은 테스트 접수가 생김을 알리고 승인 후; 첨부·반려 이력 금지.
50 · 가입 폼 제출(lead-submit) 점검 금지; lead-intake는 TEST 삭제대상만.
57 · 질문은 고객 사무실 말(~합니다); 비용·견적·위임 소망 질문 금지.
58 · 서비스 명사 뒤 조사는 받침(eulReul 등); 공통 틀 수정 시 8종 재빌드.
59 · 선택지 둘째 줄 전제는 첫 줄에 먼저 쓴다; 소리 내어 읽어 확인한다.
60 · 모바일 요약은 고른 답만; CTA는 nbsp로 줄바꿈 방지; 600px 이하 확인.
61 · 질문 문장에 특정 선택지 상태를 전제하지 않는다.
63 · 회계 DB 테스트는 로컬만(ACCOUNTING_TEST_LOCAL·supabase start); 운영 마이그레이션 금지.
64 · .env.local은 BOM 없는 UTF-8; 스크립트는 BOM 제거 읽기.
65 · 로컬 DB는 accounting_prereq_public_users로 users 없을 때만 bootstrap.
66 · company member_type은 company-member-signup API만; lead-submit은 personal만.
67 · 회계 SECURITY DEFINER는 search_path 고정·PUBLIC/anon EXECUTE 회수.
68 · confirmed 거래 UI 수정 금지; 사용자 UPDATE/DELETE는 0건·값 유지로 검증.
72 · 증빙 필터 linked/missing는 evidence_files 1건 기준(배지와 동일); 허용값 외 400.
73 · 거래 목록 증빙 필터 베트남어는 임시값; 담당자 검수 전 변경 금지.
74 · 스토리지 격리는 HTTP 코드만 보지 않고 목록 건수·다운로드 400으로 판정한다.
75 · 확정은 accounting_confirm_transaction RPC 한 트랜잭션(분개+확정).
76 · 비VND는 fx_rate로 confirm 허용; G4는 enriched·UI 미검증 표시.
77 · confirm RPC는 transactionEntry; postingRulesEngine은 조회 전용.
78 · posting_rules는 specificity 후 effective_from desc로 tie-break.
79 · 장부 hydration 판정은 data-cursor-ref 없는 브라우저(Chrome); suppressHydrationWarning 금지.
80 · 하단 탭 4개 화면 없을 때 빈 탭을 넣지 않는다.
82 · 저장 세션 만료는 격리 실패가 아니다; 재로그인한다.
83 · 회계 Playwright는 sb-*-auth-token·제목 waitFor; member form UPDATE는 행 변경으로 판정.
86 · 회계 브라우저·시드는 p3c-local-next.mjs만; .env.local 운영 URL 금지.
87 · isolation 확정은 seedTestPostingRule+confirm RPC; vnk_expert는 p3-posting.
88 · 3020 500·EADDRINUSE는 p3c-local-next·.next 삭제; webpack ENOENT는 LESSONS 88.
89 · 하단 탭 4개는 P5·홈·더보기 미션에서 한 번에; P3c/P4a에 빈 탭 금지.
90 · LESSONS·STANDARDS는 대표 확인 후에만 ACE-APPROVED 커밋.
91 · P5a 전에 G2_VAT_FORM_PACK.md를 커밋한다; 없으면 §5 수식을 만들지 않는다.
92 · G2 Pack은 Claude 작성본(v2.1+)만 field_map·엔진 근거로 쓴다; Cursor 초안 Pack은 사용하지 않는다.
93 · 로컬 harness용 부트스트랩 SQL은 운영 `supabase/migrations`에 두지 않는다(RLS 없는 테이블 생성 위험).
105 · vnk_staff org 승인 UPDATE 후 SELECT RLS가 막히면 staff용 org SELECT 정책을 추가한다(p6c-org-approval).
106 · P5c 회계 layout·tsc 전 `.next/dev/types` 삭제; 거래 URL 필터는 Suspense로 감싼다.
107 · P5c 홈 Playwright는 `home-schedule`·`home-recent` waitFor 후 검사한다.
108 · P7-1 퍼널: isolation은 `npx tsx tests/accounting/isolation.mjs`; 3020은 `p3c-local-next`·`.next` 삭제; Expert CTA는 hydrate 후 세션 분기.
