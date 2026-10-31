-- Accounting P2: company member signup profile (no public.users DDL)
-- Design: docs/master/ACCOUNTING_MODULE_DESIGN.md — Ace P2 scope 2026-10-16

create table if not exists public.accounting_company_signup_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  company_category text not null check (
    company_category in ('operating', 'prospective', 'branch', 'other')
  ),
  company_category_other text,
  company_name text not null,
  job_position text not null check (
    job_position in ('ceo', 'executive', 'finance', 'staff', 'other')
  ),
  job_position_other text,
  created_at timestamptz not null default now(),
  constraint accounting_company_signup_category_other_chk check (
    company_category <> 'other'
    or (company_category_other is not null and length(trim(company_category_other)) > 0)
  ),
  constraint accounting_company_signup_position_other_chk check (
    job_position <> 'other'
    or (job_position_other is not null and length(trim(job_position_other)) > 0)
  )
);

alter table public.accounting_company_signup_profiles enable row level security;

create policy accounting_company_signup_profiles_select_own
  on public.accounting_company_signup_profiles for select to authenticated
  using (auth.uid() = user_id);

grant select on public.accounting_company_signup_profiles to authenticated;
grant select, insert, update, delete on public.accounting_company_signup_profiles to service_role;
