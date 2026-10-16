# 작업 인계 (HANDOFF)

새 대화나 Cursor를 시작할 때 이 문서를 먼저 읽는다. 대표가 매번 같은 설명을 붙이지 않게 하려는 문서다. 작업을 끝낼 때마다 「현재 상태」만 고쳐 쓴다(규칙은 DECISIONS·LESSONS에 있고 여기에 다시 쓰지 않는다).

## 시작할 때 읽는 순서
1. 이 문서
2. `docs/master/DECISIONS.md`의 2026-10-14 행, `docs/master/LESSONS.md` #56~#61 (전체를 읽지 않고 필요한 행만)

## 현재 상태 (마지막 갱신: 2026-10-16)
- 기업회원 가입 작업 표기는 S1(가입)이다. 설계서 P2는 거래 입력이다. P2-a 거래 입력은 `/company/accounting/transactions` (로컬 검증, 푸시 없음). P2c 거래 목록 증빙 필터(evidence=all|linked|missing)는 로컬에서 확인했고 푸시하지 않았다. 필터 베트남어는 담당자 검수 전 임시값이다.
- **P3a(장부·분개 엔진, UI 제외):** 마이그레이션 `20261016060000_accounting_p3_posting_engine.sql`, 확정 시 RPC `accounting_confirm_transaction`, 뷰 `accounting_ledger_entries_enriched`(미검증 회계제도·외화 G4 플래그). 로컬 `tsc`·`node tests/accounting/p3-posting.mjs`·P2c step0 재검증 통과. 푸시·운영 DB 미적용. 다음 P3b 장부 조회 UI.
- 저장소: `C:\vfbcai-new`, 작업 브랜치 `chore/harness-v1`, 푸시 대상 `chore/harness-v1-clean`. 운영(main) 반영은 `git push origin HEAD:main`으로 한다(빨리감기).
- main 반영 완료: d1d83d5 (이 문서 작성 시점. 이후 HANDOFF 커밋 하나가 더 있음)
- 직접 인허가 8개 서비스(식당·위생·소방·환경·화장품·의료기기·프랜차이즈·회사설립) 질문을 고객 목소리 "~합니다" 체로 재작성하고 화면 확인을 마쳤다.
- 직접 확인하기 4개(운전면허 전환·땀주·거주증·노동허가)는 질문 5(걱정·도움 방식)를 "가장 답답하고 불안한 점과 지금 상황"으로, 견적 질문을 "지금까지 누구에게 어떤 이야기를 들으셨나요"로 교체했다. 판정 엔진 입력 질문은 건드리지 않았다. 배포된 코드로 확인했고 답을 눌러 가며 보는 화면 확인은 안 했다.
- 모바일: 답변 요약 한 줄, 직접 입력 박스 여백(py-3), 선택지 설명 글자 13px, 하단 안내 문구 한 문장("확정 비용은 표시하지 않으며 공식 자료 기준으로 안내합니다.")을 모두 반영했다. 회사설립 하단 문구도 같은 문장이다.
- 미리보기: `https://vfbc-platform-git-chore-41a8aa-carehousevietnam-a11ys-projects.vercel.app/verify/<서비스>`

## 남은 일
0. **2026-10-15 추가:** `/company` 가격 섹션 아래 「내 상황」 3단계 질문 블록(`src/app/company/companyEntry.ts`, 문구 `src/lib/landings/companyEntry.ts`)과 퍼널 입구 안내(`src/app/verify/company/CompanyEntryNotice.tsx`, 주소 `?q1=&q2=&q3=`) 반영, 푸시·미리보기 확인 전. 다음: 질문 값별 퍼널 연결(A안은 MASTER 수정 승인 필요), Q3 피해→사기 확인 퍼널 적합성 확인, 원본 4단계 질문 처리 결정. 원본 랜딩 파일은 수정하지 않음.
0. **2026-10-15 상태:** `/company`·`/wp` 랜딩 미리보기 확인 완료, 운영 반영 대기. 랜딩 SEO 셋팅(`src/lib/landings/`, `/llms.txt`, sitemap, robots)은 코드 반영됨, 커밋·푸시 전. 운영 전 `NEXT_PUBLIC_SITE_URL` 확인. 사례집 테스트는 `/company` ↔ `/guide/company-setup-process-and-cost` 1:1로 시작. 사례 공개 동의(가입 화면)는 대표 결정 전이라 건드리지 않음. 기업회원은 세무·회계부터, 'rea ai' 참고 자료(주소·캡처) 수령 후 설계.
1. **랜딩페이지 붙이기(법인설립): 코드 반영 완료.** `src/app/company/`(page·CompanyLandingClient·companyLandingHtml·companyLandingScript·landing.css)와 `public/lp/company/`(에셋 경로만 lp 유지)(영상·화면 5장). 주소 `/company`, 시작 버튼 4곳 → `/register/company`(랜딩은 이 퍼널의 앞단, 퍼널 화면 자체는 그대로 둠). 다음: 노동허가 랜딩은 `src/app/wp/`(`/wp` → `/check/wp`)에 반영, 푸시·화면 확인 전. 새 랜딩 체크리스트: ①`src/app/<슬러그>/` 이식 ②`src/lib/landings/registry.ts`에 항목 추가 ③`page.tsx`는 `landingMetadata("<슬러그>")`+`<LandingJsonLd slug>` ④운영 환경변수 `NEXT_PUBLIC_SITE_URL`이 실제 도메인인지 확인(미설정 시 canonical이 vercel.app). 이후 다음 서비스 랜딩 파일을 받으면 같은 방식으로 `src/app/<서비스>`(짧은 주소)에 추가, 충돌 주소 여부 먼저 확인.
2. 직접 검토하기 5개(세무·사기·불명확 서류 등) 질문 점검은 보류. 범위를 대표가 정한다(행정·부동산은 Admin MASTER 기준이라 D9에 따라 수정하지 않음).
3. 보안(GitHub Private 전환, Vercel Firewall 요청 제한, SQL B)과 실제 폰 확인은 대표가 직접 한다.

## 파일 위치
- 공통 질문 틀: `scripts/register-voice-spec.mjs` (서비스 말만 바꿔 씀)
- 업종 질문: `scripts/<서비스>-content-spec.mjs`
- 수정 후 `node scripts/build-<서비스>-content-final.mjs --write`로 설계서(md)와 화면 데이터를 다시 만든다. 공통 틀을 고치면 8개 서비스를 모두 다시 만들어 diff를 확인한다.

## 작업 방식 (토큰 절약)
- 질문·선택지는 하나라도 어색하면 안 된다. 고객이 억지로 느끼지 않는지 소리 내어 읽고 확인한다.
- 화면 확인은 Claude가 직접 하되, 페이지 전체 글 읽기는 서비스당 한 번만 한다. 문장 점검은 스펙 파일에서 먼저 한다.
- 파일은 필요한 줄만 읽고, 출력이 긴 명령은 앞부분만 본다.
- 수정은 요청한 부분만 한다. 범위를 넓힐 때는 먼저 묻는다.
- 커밋·푸시는 대표가 PowerShell에서 한다. 접두사는 `content:` 또는 `chore:`를 쓴다(fix는 LESSONS 기록이 필요함).
- 한 시간 넘게 쉬었다면 긴 대화를 이어 가지 말고 이 문서를 읽는 새 대화로 시작한다.
- 요청은 묶어서 보낸다. 진행 중 확정·수정된 내용은 DECISIONS에 한 줄 추가한다.
