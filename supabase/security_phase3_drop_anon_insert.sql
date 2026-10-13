-- 보안 3단계-2: 익명(anon) insert 정책 제거 (실행은 Supabase SQL Editor에서 Ace가 직접)
-- 전제: 브라우저의 leads 직접 insert 39곳이 모두 서버 접수(/api/lead-intake)로 전환됨(2026-10-13).
-- 서버는 서비스 키(service_role)로 쓰므로 RLS 정책의 영향을 받지 않는다.

-- ===== 단계 A: leads 익명 insert 제거 (먼저 실행) =====
drop policy if exists "leads_anon_insert" on public.leads;

-- A 적용 후 확인할 것(비로그인 상태에서 접수가 끝까지 되는지):
--  1) /verify/trc 등 VERIFY 서비스 가입 폼 접수  2) /check/wp  3) /register/restaurant
--  4) /consultation (수동 폼)  5) /r 전문가 진행요청
--  하나라도 실패하면 아래 되돌리기 A를 실행한다.

-- ===== 단계 B: crm_activities 익명 insert 제거 (A 확인 후, 별도 실행) =====
-- 남은 브라우저 crm insert 34곳은 접수 후(로그인 상태) 경로: 전문가 요청, AI 리포트 요청,
-- 서류 제출(documents), 메시지(caseMessages), 마이페이지. 아래 확인 후 실행한다.
--  - 로그인 상태에서 전문가 요청 / AI 리포트 요청 / 서류 업로드 / 마이페이지 메시지 보내기
-- drop policy if exists "allow anon insert crm" on public.crm_activities;
-- drop policy if exists "anon insert crm_activities" on public.crm_activities;

-- ===== 되돌리기(문제가 생길 때만 실행) =====
-- A: create policy "leads_anon_insert" on public.leads for insert to anon with check (true);
-- B: create policy "allow anon insert crm" on public.crm_activities for insert to anon with check (true);
--    create policy "anon insert crm_activities" on public.crm_activities for insert to anon with check (true);
