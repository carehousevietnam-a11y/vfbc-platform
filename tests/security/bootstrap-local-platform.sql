-- Harness-only: local Supabase without platform tables (not applied in production migrations).

create sequence if not exists public.leads_seq_no_seq;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  phone text,
  address text,
  kakao_id text,
  zalo_id text,
  service_type text,
  result text,
  source_page text,
  status text default 'new',
  seq_no bigint not null default nextval('public.leads_seq_no_seq'),
  display_id text,
  email text,
  user_id uuid references auth.users (id) on delete set null
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references public.leads (id) on delete cascade,
  action text,
  tag text,
  meta jsonb
);

grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.crm_activities to service_role;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
