-- 보안 1단계: 비로그인(anon) 위험 정책 3개 제거 (2026-10-13)
-- 대상: 서류 저장소 anon 읽기 / 알림 anon 읽기 / 알림 anon 쓰기
-- 코드는 서버(supabaseAdmin)만 사용하므로 영향 없음. 실행은 Supabase SQL Editor에서 Ace가 직접.

drop policy if exists "anon read documents" on storage.objects;
drop policy if exists "anon select notifications" on public.notifications;
drop policy if exists "anon insert notifications" on public.notifications;

-- ===== 되돌리기(문제가 생길 때만 실행) =====
-- create policy "anon read documents" on storage.objects for select to anon using (bucket_id = 'documents'::text);
-- create policy "anon select notifications" on public.notifications for select to anon using (true);
-- create policy "anon insert notifications" on public.notifications for insert to anon with check (true);
