# 퍼널 진입·진행·이탈 추적 설계서 (초안, 승인 전)

작성: 2026-10-13 · 상태: 설계만(DB·코드 변경 없음, Ace 승인 후 단계별 진행)

## 1. 질문과 결론
질문: "고객이 퍼널을 통해 쌓이는 정보도 DB로 쌓이게 설계되었는가?"
결론: **제출한 고객의 정보는 쌓인다. 제출하기 전에 나간 고객은 거의 남지 않는다.**

## 2. 현재 저장 구조 (근거: 코드 조사)
- 접수 시점에 leads 1행 + crm_activities 1행(meta에 답변)이 저장된다. VERIFY 서비스는 답변이 meta로 펼쳐져 저장되고, 2차 질문 답변은 별도 키로 직렬화되어 저장된다.
- 제출 전 저장은 사실상 한 곳뿐이다: 거절 이력(previous_rejections)이 "네, 있습니다" 클릭 즉시 저장된다(이번 보안 작업으로 서버 API 경유로 바뀜).
- 방문·단계 진입·이탈을 기록하는 분석 도구가 없다(GA·Clarity 등 코드 검색 결과 0건).
- 따라서 알 수 없는 것: 서비스별 진입 수, 단계별 도달·이탈 비율, 어느 질문에서 나가는지, 모바일/PC 차이, 제출 전환율.

## 3. 목표
1. 서비스(16개 VERIFY + check + register)별, 단계(1~4)별 진입·도달·제출 수를 센다.
2. 이탈 지점(마지막 도달 단계)을 서비스별로 본다.
3. 개인정보 없이 시작한다(1단계). 답변 내용 임시저장은 동의 방식 결정 후 별도 단계로 한다.
4. 보안 원칙 유지: 브라우저에서 DB에 직접 쓰지 않는다(서버 API 경유, RLS 켜고 정책 없음).

## 4. 설계

### 4.1 이벤트 테이블 funnel_events (추가 전용)
| 컬럼 | 설명 |
|---|---|
| id | uuid, 기본키 |
| occurred_at | 발생 시각 |
| session_id | 브라우저 세션별 임의 UUID(sessionStorage). 개인 식별 불가 |
| engine | check / verify / register / consultation |
| service | 서비스 슬러그(예: verify_trc). 페이지 경로에서 도출 |
| step | check/register: 화면 단계 1~4. verify: 그 시점까지 답한 질문 수(0=질문 화면 진입, 최대 30). 허용 범위 0~30 |
| event | view(단계 화면 진입) / submit(접수 완료) |
| lead_id | submit 이벤트에만(접수 연결). 나머지는 null |
| device | mobile / desktop |
| lang | ko / vi / zh 등 |
| entry_tab | 랜딩 탭(lookup / review / direct), 있으면 |
- 답변 내용, 이름, 연락처, IP는 저장하지 않는다.
- RLS 켜기 + 정책 없음(브라우저 접근 불가). 서버(서비스 키)만 읽고 쓴다.
- 인덱스: (service, step, occurred_at), (session_id).

### 4.2 이탈 정의 (파생값, 별도 이벤트 불필요)
- 이탈 = 세션에서 submit이 없고, 마지막 이벤트 후 30분이 지난 경우. 이탈 지점 = 그 세션의 최대 step.
- 브라우저 종료 이벤트(beforeunload)는 모바일에서 불안정하므로 쓰지 않는다. 필요하면 pagehide + sendBeacon을 보조로만 쓴다.

### 4.3 기록 방식
- 단계 화면 진입 기록: 모든 퍼널이 공용하는 VerifyStepLayout(step 1~4, engine 전달)에 한 번만 심는다. 서비스별 페이지 수정이 필요 없다(서비스는 경로로 판별).
- 접수 완료 기록: 기존 접수 성공 지점에서 lead_id와 함께 1회 전송(서비스별 한 줄, 단계적 적용).
- 전송: /api/funnel-event (서버). 실패해도 화면 동작에 영향 없음(조용히 무시).
- 서버 검증: 값 형식 제한(UUID, 허용 목록 enum), 세션당 분당 건수 제한, 같은 세션·서비스·단계 중복 무시.

### 4.4 보기 화면
- /admin/funnel (보기 전용): 서비스별 단계 도달 수, 이탈률, 일별 추이, 모바일/PC 구분, 제출 전환율.
- 기존 관리자 화면 스타일 그대로, 색 변경 없음.

### 4.5 개인정보·법적 사항
- 1단계는 익명 집계(식별 정보 없음)이므로 개인정보처리방침에 "서비스 이용 통계 수집" 문구만 추가한다. (법률 근거 확인은 별도: 베트남 개인정보 보호 관련 법령 대조 필요)
- 2단계(답변 임시저장)는 입력한 개인 정보가 포함될 수 있어 동의 문구와 보관 기간이 필요하다. 이번 설계에는 포함하지 않는다.
- 보관: 원본 180일, 이후 일별 집계만 유지(제안).

## 5. 단계별 진행안
| 단계 | 내용 | 위험 |
|---|---|---|
| P0 | 이 설계서 승인(결정 사항 4개) | 없음 |
| P1 | funnel_events 테이블(SQL은 Ace 실행) + /api/funnel-event + VerifyStepLayout 단계 진입 기록 | 낮음(실패 무시, 기존 화면 무변경) |
| P2 | 접수 완료 이벤트 연결(서비스별) | 낮음 |
| P3 | /admin/funnel 보기 화면 | 낮음 |
| P4(선택) | 답변 임시저장(동의 방식 확정 후) | 높음(개인정보) — 별도 승인 |

## 6. 위험과 대응
- 중복·봇 기록: 세션당 건수 제한, 중복 무시, 서버 형식 검증.
- 성능: 단계 진입 때만 1회 전송(키 입력마다 전송하지 않음).
- 데이터 증가: 보관 기간 정책(180일) + 일별 집계.
- 보안: 서버 경유만, RLS 정책 없음, 읽기는 관리자 서버 화면만.
- 기존 접수 흐름 영향: 기록 실패 시 무시하고 접수 로직은 건드리지 않음.

## 7. Ace 결정 필요 사항
1. 이탈 기준 시간: 30분(제안) 맞는지
2. 1단계는 답변 내용 없이 "단계 진입·접수 완료"만 기록해도 되는지
3. 답변 임시저장(P4)을 나중에 할지, 아예 하지 않을지(동의 방식 포함)
4. 원본 보관 기간 180일(제안) 맞는지

## 8. 초안 SQL (실행 금지·참고용)
```sql
create table public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  session_id uuid not null,
  engine text not null check (engine in ('check','verify','register','consultation')),
  service text not null,
  step smallint not null check (step between 0 and 30),
  event text not null check (event in ('view','submit')),
  lead_id uuid references public.leads(id) on delete set null,
  device text check (device in ('mobile','desktop')),
  lang text,
  entry_tab text
);
alter table public.funnel_events enable row level security; -- 정책 없음 = 브라우저 접근 불가
create index funnel_events_service_step_idx on public.funnel_events (service, step, occurred_at);
create index funnel_events_session_idx on public.funnel_events (session_id);
```

## 9. 구현 기록 (P1, 2026-10-13)
- 기록 지점: check(4개)·register(8개)·verify/admin은 공용 VerifyStepLayout의 단계(1~4) 진입. 나머지 VERIFY 서비스(15개)는 공용 질문 화면(MasterReviewQuotationReport)에서 "답한 질문 수"가 바뀔 때마다.
- verify/admin은 VerifyStepLayout 기록만 쓰고 질문 수 기록은 제외(의미 혼합 방지).
- funnel_events 접근 권한: 서버(service_role)에만 GRANT, anon/authenticated 없음 + RLS 정책 없음. 브라우저 직접 읽기·쓰기 막힘 검증 완료.
- P2 접수 완료(submit): 모든 접수(check/register/verify 28개 화면)가 거치는 서버 /api/lead-submit 에서 한 번만 기록한다(화면 수정 없음). 브라우저가 단계 기록 때 남긴 임의 UUID 쿠키(vfbcai_fs)로 같은 세션에 이어 붙이고, 서비스는 리드의 source_page에서 도출, lead_id만 연결한다. 중복 방지: 같은 lead_id의 submit은 1회. 쿠키가 없거나 실패해도 접수에는 영향 없음. 상담(/consultation)·/r 경로는 lead-submit을 거치지 않아 아직 제외.
- 남은 일: 첫 실제 접수로 submit 기록 확인, P3 /admin/funnel 보기 화면.
- 2026-10-13 P1 기록 확인(대표 PC에서 건수 조회): funnel_events에 단계 진입(view) 2건(verify_trc, verify_wp, 모바일·PC 각 1건) 확인. 접수 완료(submit)는 0건 — 실제 접수 1회로 lead_id 연결 확인 필요(샘플 데이터 기준).
- 2026-10-13 P3 구현: /admin/funnel (보기 전용, 서버에서 service 키로 읽기, 관리자 로그인 미들웨어로 보호). 진입 세션·접수·전환율·이탈(30분 경과)·모바일 비율, 일별 추이(한국 시간 14일), 서비스별 단계 도달 막대와 가장 많이 나간 지점. 기간 7/30/90일. 1000행 제한은 페이지 넘김으로 처리(상한 5만 행). 색 추가 없음(blue-900만). 관리자 메뉴 링크는 추가하지 않음(관리자 화면 정리 때 함께 결정).
- 2026-10-13 P2 접수 완료 기록 확인: verify_trc 질문 5개를 끝까지 진행(첨부 없음) → /admin/funnel 에 verify_trc 진입 2·접수 1·전환율 50%로 반영. 같은 세션에 이어 붙어 접수가 기록됨. (lead_id 연결 여부는 PC에서 tests/qa/_output/funnel_count.mjs 의 "submit with lead_id" 줄로 확인). 이 접수로 운영 DB에 테스트 접수 1건이 생겼다(LESSONS 49).
- 2026-10-13 P2 보강(상담 경로): /consultation 과 /r 은 브라우저가 DB에 직접 접수하고 lead-submit을 거치지 않는다. 접수(leads insert) 성공 직후 trackFunnelSubmit(src/lib/funnelTrack.ts)이 /api/funnel-event 로 submit(engine consultation, 서비스 consultation_direct / consultation_result, lead_id만)을 보낸다. 서버는 같은 lead_id의 submit 중복을 무시하고, leads FK로 없는 lead는 거부한다. 상담 경로는 질문 단계 기록이 없어 진입 대비 전환율은 의미가 없다. 접수 서버 경유 전환(보안 2번 작업) 때 서버 기록으로 옮길 수 있다.
- 2026-10-13 상담 경로 접수 기록 확인: /consultation 접수 1건 → /admin/funnel 에 consultation_direct 접수 1건 반영(단계 기록이 없는 경로라 진입 1·접수 1). /r(consultation_result)은 같은 코드 경로로 연결했으나 실제 접수로는 아직 확인하지 않음.
