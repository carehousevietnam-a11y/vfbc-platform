-- Platform audit_log (서버 작업·보안 정리용). accounting_audit_log 와 분리.
-- 브라우저 접근 불가: RLS 켜고 정책 없음 + service_role GRANT (LESSONS #47).

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  job_id text not null,
  action text not null,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists audit_log_action_at_idx on public.audit_log (action, at desc);

alter table public.audit_log enable row level security;

grant select, insert on public.audit_log to service_role;
