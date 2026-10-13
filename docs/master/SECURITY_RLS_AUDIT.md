# DB 보안(RLS) 점검 보고 — 2026-10-13

범위: 읽기 전용 조사(운영 DB 카탈로그 조회 + 코드 검색). DB·코드 변경 없음.
근거: supabase/live_catalog_result.json (Supabase SQL Editor 읽기 전용 조회 결과)

## 1. 현황 요약
- 13개 테이블 전부 RLS 켜짐.
- 정책이 없는 4개(case_knowledge, case_conversations, lead_assignments, admin_user_scopes)는 브라우저 접근 불가 = 안전(서버 서비스 키만 접근).
- crm_activities: 읽기/수정/삭제는 본인 소유(is_lead_owner) 한정 = 양호. 익명 insert는 퍼널 저장용 의도된 설계.
- 브라우저 코드는 공개 키(anon)를 사용 → anon 정책은 인터넷의 누구나 쓸 수 있는 권한으로 간주해야 한다.

## 2. 위험 정책 (심각도 순)
| # | 대상 | 정책 | 노출 | 코드 의존 |
|---|------|------|------|-----------|
| 1 | storage.objects (documents) | anon read documents (bucket_id만 조건) | 로그인 없이 업로드된 고객 서류 목록·내용 열람 가능 | 브라우저는 업로드·삭제만 함. 읽기는 서버 signed URL(supabaseAdmin). 단 documents/page.tsx 진단용 list() 1건 |
| 2 | leads | anon read leads (true) | 전체 상담 건(이름·연락처 등) 열람 | documents/page.tsx:715 한 곳(service_type 조회) |
| 3 | result_tokens | anon read by token (true) | 전체 결과 링크 토큰 열람 | restoreCheckLead/RegisterLead/VerifyLead.ts 3곳(token select) |
| 4 | notifications | anon select(true) + anon insert(true) | 전체 알림 열람, 가짜 알림 삽입 | 브라우저 사용 0건(서버만 insert) |
| 5 | previous_rejections | public ALL (true/true) | 누구나 읽기·삽입·수정·삭제 | check/*, register/* 페이지에서 insert·update(약 12개 파일) |
| 6 | storage.objects | anon upload documents | 누구나 documents 버킷에 파일 업로드(용량 소진·악성 파일) | verify/*, documents, mypage 업로드 |
| 7 | leads, crm_activities | anon insert (true) | 스팸·가짜 데이터 대량 삽입 | 퍼널 핵심(의도) → 서버 경유+속도 제한은 별도 과제 |

## 3. 수정 순서 제안 (승인 후 진행, 아직 적용 안 함)
1단계 — 코드 영향 없음(또는 최소):
- notifications의 anon 정책 2개 제거.
- storage "anon read documents" 제거. 영향: documents/page.tsx 진단용 list()가 빈 결과. 서버 signed URL은 서비스 키라 영향 없음. 적용 후 서류 업로드·삭제·마이페이지 서류 보기 확인 필요.
2단계 — 코드를 서버 API로 옮긴 뒤 제거:
- leads anon read: documents/page.tsx 조회를 서버 API로 이동 후 정책 제거.
- result_tokens anon read: restore*Lead.ts 3곳을 서버 API로 이동 후 정책 제거.
- previous_rejections: check/*, register/* insert·update를 서버 API(supabaseAdmin)로 이동 후 public ALL 정책 제거.
3단계 — 방어 강화:
- storage anon upload: 서버 경유 업로드(서명된 업로드 URL) 또는 경로·크기·확장자 제한 정책.
- 익명 insert 속도 제한(서버 API + rate limit).
- 서류가 이미 노출 가능했던 기간의 접근 로그 확인(Supabase 대시보드 Logs, Ace 확인).

## 4. 참고 관찰
- crm_activities.select/update를 브라우저(anon)에서 호출하는 코드가 많다. 정책상 anon은 select·update 불가이므로 비로그인 상태에서는 결과가 비어 있거나 반영되지 않을 수 있다. 의도한 동작인지 별도 확인 필요.
- 서버(API 라우트)는 이미 supabaseAdmin을 쓴다: lead-submit, mypage-data, mypage-documents 등.

## 5. 진행 기록
- 2026-10-13 1단계 적용: anon read documents / anon select notifications / anon insert notifications 제거. 공개 키(anon) 조회로 documents 목록 0개, notifications 0행 확인. 마이페이지 정상 로드 확인.
- 2026-10-13 2단계 코드 이전: previous_rejections 직접 쓰기(14개 파일)를 /api/previous-rejection(서버, 서비스 키)으로 이전. /documents 의 leads service_type 조회를 /api/lead-service-type 으로 이전. tsc 통과, 입력 검증(400) 확인.
- result_tokens: 비로그인 anon은 테이블 권한(GRANT) 자체가 없어 permission denied. 로그인(authenticated)은 정책이 없어 빈 결과. restore*Lead.ts 의 token 조회는 기존에도 null 이었음(동작 변화 없음). 정책만 정리한다.
- 남은 일: 실제 저장 1회 검증(테스트 행 생성 후 삭제) → leads anon read / previous_rejections public ALL / result_tokens anon read 정책 제거 SQL 실행.
- 2026-10-13 2단계 적용 완료: anon read leads / public full access previous_rejections / anon read by token(result_tokens) 제거. 실제 저장 검증(서버 API insert·reason 1회 채움·삭제) 통과. 공개 키(anon) 조회 결과 leads, previous_rejections, result_tokens, notifications, crm_activities, documents 버킷 모두 0건(전부 막힘).
- 주의: supabase/live_schema_snapshot.json 의 policies 는 위 변경 이전(2026-10-13 조회 시점) 값이다. 정책이 바뀐 만큼 다음 점검 때 카탈로그 조회(supabase/catalog_query.sql)를 다시 실행해 갱신한다.
- 3단계 남은 일(미착수·승인 필요): storage anon upload 제한, 익명 insert 속도 제한, 노출 기간 접근 로그 확인(Ace, Supabase Logs).
- 2026-10-13 3단계-1 적용·검증 완료: documents 버킷 파일당 20MB·PDF/JPG/PNG/DOC/DOCX 제한, anon 업로드를 verify-서비스명/UUID.확장자 경로로만 허용(정책 "anon upload verify evidence", 기존 "anon upload documents" 제거). anon 시험: 루트 경로·타 폴더·.exe·21MB 모두 거부, 정상 경로 소형 PNG 성공(테스트 파일 삭제, 잔여 0). SQL: supabase/security_phase3_storage_limits.sql
- 관찰(기존 동작, 미수정): 로그인(authenticated) 회원이 verify/* 퍼널에서 첨부를 올리면 해당 경로 권한이 없어 실패할 수 있음. 별도 확인 필요.
- 남은 일: 익명 접수 insert(leads, crm_activities) 서버 경유+속도 제한(승인 필요, 범위 큼), 노출 기간 접근 로그 확인(Ace, Supabase Logs).

## 6. 3단계-2 익명 접수 서버 경유 (진행 중, 2026-10-13)
목표: 브라우저가 leads·crm_activities에 직접 insert하던 것을 서버(서비스 키)로 옮기고 속도 제한을 건 뒤, 마지막에 익명 insert 정책을 제거한다.
- 서버 API: POST /api/lead-intake (src/app/api/lead-intake/route.ts). 허용 규칙 src/lib/leadIntakeRules.ts, 클라이언트 src/lib/leadIntakeClient.ts(submitLeadIntake).
  - 검증: 이름·연락처·주소·이메일·SNS 형식, service_type·source_page 허용 규칙, crm action·tag 형식, 본문 100KB·meta 60KB 상한.
  - user_id는 클라이언트 값을 쓰지 않고 Authorization Bearer 토큰을 서버가 검증해 얻는다.
  - 속도 제한(보조, 서버 인스턴스 단위): IP당 10분 20건, 연락처당 1시간 10건. 오류 응답에 내부 정보 없음.
  - 잘못된 요청 5종(허용 외 서비스, 허용 외 경로, 짧은 번호, 잘못된 crm 값, 빈 본문)은 모두 400으로 거부됨을 확인.
- 전환 현황(2026-10-13): 브라우저의 leads 직접 insert 39곳을 모두 서버 접수로 전환했다(consultation, /r, check 4, register 8, verify 16(admin·real-estate 포함), restoreCheck/Register/VerifyLead 3). 남은 직접 leads insert 0곳. tsc 통과.
  - 가입 폼 15개(verify)·check 4·register 8은 같은 틀을 스크립트로 일괄 변환했고, 변환 전후 diff를 확인했다. 업로드(서류)는 접수 전에 먼저 수행하도록 순서를 바꿨다(접수 한 번에 crm meta를 함께 보내기 위함). crm meta에는 기존의 socialContacts·preferredLanguage 병합이 그대로 들어간다.
  - 확인: /consultation 로그인 접수 정상, 비로그인 서버 접수(테스트 값) 200 정상, 잘못된 요청 5종 400 거부. 가입 폼 제출은 운영 Supabase에 계정을 만들므로 제출하지 않았다(LESSONS 50).
  - 브라우저 확인(Claude 직접, 2026-10-13): /verify/trc 가입 폼(이름 "TEST 삭제대상"), /verify/real-estate, /verify/admin 모두 새 서버 접수 200 정상(service_type·source_page·crm action/tag 일치, 회원은 Bearer 토큰 전달). 확인 방법: 계정을 만드는 /api/lead-submit만 가짜 응답으로 대체하고 나머지는 실제 화면 그대로 실행(LESSONS 50).
  - /check/*, /register/* 12개 화면은 next.config.ts 설정으로 /verify/* 로 넘어가 실제로 쓰이지 않는다(옛 화면, 일괄 폐기 대상). 코드는 같이 전환했으나 화면 확인 대상 아님.
  - 점검으로 생긴 테스트 접수: 상담 접수 3건(대표 계정), 이름 "TEST 삭제대상" 2건(비로그인 서버 접수·가입 폼 점검), VERIFY 접수 2건(real-estate, admin, 대표 계정). 관리자에서 확인·정리.
- 익명 insert 정책 제거 SQL: supabase/security_phase3_drop_anon_insert.sql (A leads → 확인 → B crm_activities). 남은 crm 브라우저 insert 34곳은 접수 후(로그인) 경로라 B 전에 로그인 상태 동작(전문가 요청·AI 리포트·서류 제출·메시지)을 확인한다.
- 별도 관찰(범위 밖, 승인 필요): authenticated 역할의 insert 정책 2개(authenticated_can_insert_leads, authenticated_can_insert_crm_activities)가 조건 없이 true라, 로그인한 누구나 남의 lead_id로 crm 기록을 넣을 수 있다. 서버 경유 전환이 끝났으니 소유자 조건(is_lead_owner / user_id = auth.uid())으로 좁히는 것을 다음 단계로 제안한다.
- 주 속도 제한은 Vercel 방화벽 규칙으로 건다(Ace가 Vercel 설정에서 추가): 대상 경로 /api/lead-intake, /api/lead-submit, /api/funnel-event 에 IP당 분당 건수 제한. 서버 메모리 제한은 인스턴스마다 따로 세므로 보조일 뿐이다.
