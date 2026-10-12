# DB 스키마 비교 (코드 vs 실제 DB)

추출 일시: 2026-10-13 · 방법: PostgREST OpenAPI + Storage API (RLS/인덱스 등 일부 미확인)

## 요약

- **Storage `documents` 버킷 공개 여부**: 비공개
- **코드에는 있는데 DB(OpenAPI 노출)에 없음**: Postgres `documents` 테이블 없음 (아래 집계 참고)
- **DB에만 있음(코드 미사용 목록 외)**: admin_user_scopes, announcements, reminders
- **RLS 꺼진 테이블**: 미확인 (`supabase/catalog_query.sql` 실행·`live_catalog_result.json` 병합 전)
- **crm_activities.meta**: 타입 `jsonb` (퍼널 답변 등 JSON 저장). 인덱스: 미확인
- **documents 호출 집계 (src, 2026-10-13)**: `storage.from("documents")` **33건** / PostgREST `.from("documents")` 테이블 호출 **0건** (`.from("documents")`는 줄바꿈된 `storage.from` 체인만 해당)

## 테이블 비교

| 테이블/버킷 | 코드 사용 횟수 | DB 존재(OpenAPI) | RLS | 정책 수 | 비고 |
|---|---:|---|---|---:|---|
| admin_users | 13 | 예 | 미확인 | 미확인 | |
| case_conversations | 2 | 예 | 미확인 | 미확인 | |
| case_knowledge | 7 | 예 | 미확인 | 미확인 | |
| crm_activities | 178 | 예 | 미확인 | 미확인 | |
| lead_assignments | 4 | 예 | 미확인 | 미확인 | |
| leads | 62 | 예 | 미확인 | 미확인 | |
| notifications | 7 | 예 | 미확인 | 미확인 | |
| previous_rejections | 43 | 예 | 미확인 | 미확인 | |
| result_tokens | 17 | 예 | 미확인 | 미확인 | |
| users | 13 | 예 | 미확인 | 미확인 | |
| storage:documents | 33 | 예(버킷) | 미확인 | 미확인 | Postgres 테이블 아님 · Storage 버킷(비공개). 코드의 `.from("documents")` 호출은 전부 `storage.from` 체인 |
| documents (Postgres) | 0 | 아니오 | — | — | 테이블 호출 없음 |
| admin_user_scopes | 0 | 예 | 미확인 | 미확인 | 코드 미사용 |
| announcements | 0 | 예 | 미확인 | 미확인 | 코드 미사용 |
| reminders | 0 | 예 | 미확인 | 미확인 | 코드 미사용 |

## 보안 핵심 미확인 사항

고객 화면 클라이언트 페이지들이 anon 키로 `leads`, `crm_activities`에 직접 insert함 → 두 테이블의 RLS 켜짐 여부와 정책이 가장 중요한 미확인 항목.

`"use client"` 파일에서 `leads` 또는 `crm_activities`에 `.insert(` 를 호출하는 파일: **33개** (서버 API·`lib/*` 복원 헬퍼 등은 제외).
