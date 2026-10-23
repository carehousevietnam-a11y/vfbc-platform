-- Align minimal local public.users (accounting_prereq) with signup/lead-submit profile fields.

alter table public.users add column if not exists phone text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists name text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists kakao_id text;
alter table public.users add column if not exists zalo_id text;
alter table public.users add column if not exists password_set boolean default false;
