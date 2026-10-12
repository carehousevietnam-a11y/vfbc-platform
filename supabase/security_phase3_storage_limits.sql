-- 보안 3단계-1: documents 저장소 업로드 제한 (2026-10-13)
-- 1) 버킷 제한: 파일당 20MB, PDF/JPG/PNG/DOC/DOCX 만 허용
-- 2) 비로그인(anon) 업로드는 퍼널 첨부 경로(verify-서비스명/UUID.확장자)만 허용
-- 코드 변경 없음. 실행은 Supabase SQL Editor에서 Ace가 직접.

update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
where id = 'documents';

drop policy if exists "anon upload documents" on storage.objects;

create policy "anon upload verify evidence"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'documents'
  and name ~ '^verify-[a-z0-9-]+/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,10}$'
);

-- ===== 되돌리기(문제가 생길 때만 실행) =====
-- update storage.buckets set file_size_limit = null, allowed_mime_types = null where id = 'documents';
-- drop policy if exists "anon upload verify evidence" on storage.objects;
-- create policy "anon upload documents" on storage.objects for insert to anon with check (bucket_id = 'documents'::text);
