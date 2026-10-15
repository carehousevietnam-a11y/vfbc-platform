-- Accounting module P1: schema, RLS, audit triggers, evidence bucket (2026-10-16)
-- Design: docs/master/ACCOUNTING_MODULE_DESIGN.md §4, §6, §8 P1
-- Does not alter existing public tables (incl. users). Apply on branch/local DB only until Ace approves prod.

-- ---------------------------------------------------------------------------
-- Helpers (security definer; read public.users.member_type — no users DDL)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_is_business_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.member_type = 'company'
  );
$$;

-- ---------------------------------------------------------------------------
-- Core tables (accounting_* neutral names; §4)
-- ---------------------------------------------------------------------------

create table if not exists public.accounting_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'ko' check (locale in ('ko', 'vi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounting_organizations (
  id uuid primary key default gen_random_uuid(),
  name_official text not null,
  name_ko_display text,
  tax_code text,
  fiscal_year_start date not null default '2026-01-01',
  vat_period text not null default 'month' check (vat_period in ('month', 'quarter')),
  accounting_regime text check (accounting_regime in ('TT99', 'TT133')),
  currency text not null default 'VND' check (currency = 'VND'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounting_org_members (
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (
    role in ('company_owner', 'company_member', 'vnk_expert', 'vnk_admin')
  ),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists accounting_org_members_user_idx
  on public.accounting_org_members (user_id);

create or replace function public.accounting_org_role(p_org_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.accounting_org_members m
  where m.org_id = p_org_id
    and m.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.accounting_can_access_org(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.accounting_is_business_member()
    and public.accounting_org_role(p_org_id) is not null;
$$;

create or replace function public.accounting_is_vnk_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.accounting_org_members m
    where m.user_id = auth.uid()
      and m.role = 'vnk_admin'
  );
$$;

create table if not exists public.accounting_counterparties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  name_original text not null,
  name_reading text,
  tax_code text,
  kind text not null check (kind in ('customer', 'supplier')),
  created_at timestamptz not null default now()
);

create index if not exists accounting_counterparties_org_idx
  on public.accounting_counterparties (org_id);

create table if not exists public.accounting_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  type text not null check (type in ('sale', 'purchase', 'expense', 'payroll')),
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'confirmed', 'cancelled')
  ),
  txn_date date not null,
  period_key text not null,
  counterparty_id uuid references public.accounting_counterparties (id),
  invoice_series text,
  invoice_no text,
  invoice_date date,
  currency text not null default 'VND',
  fx_rate numeric,
  amount_vnd numeric not null default 0,
  corrects_txn_id uuid references public.accounting_transactions (id),
  created_by uuid references auth.users (id),
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounting_transactions_org_idx
  on public.accounting_transactions (org_id, period_key);

create table if not exists public.accounting_transaction_lines (
  id uuid primary key default gen_random_uuid(),
  txn_id uuid not null references public.accounting_transactions (id) on delete cascade,
  amount_net numeric not null default 0,
  vat_rate numeric,
  vat_amount numeric,
  created_at timestamptz not null default now()
);

create index if not exists accounting_transaction_lines_txn_idx
  on public.accounting_transaction_lines (txn_id);

create table if not exists public.accounting_evidence_files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  txn_id uuid references public.accounting_transactions (id) on delete set null,
  storage_path text not null,
  sha256 text,
  mime text,
  size bigint,
  uploaded_by uuid references auth.users (id),
  uploaded_at timestamptz not null default now()
);

create index if not exists accounting_evidence_files_org_idx
  on public.accounting_evidence_files (org_id);

create table if not exists public.accounting_i18n_texts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  field text not null,
  lang text not null check (lang in ('ko', 'vi')),
  text text not null,
  status text not null default 'original' check (
    status in ('original', 'machine', 'human_verified')
  ),
  version int not null default 1,
  translated_from_version int,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists accounting_i18n_texts_lookup_idx
  on public.accounting_i18n_texts (org_id, entity_type, entity_id, field, lang, version desc);

create table if not exists public.accounting_term_glossary (
  id uuid primary key default gen_random_uuid(),
  ko text not null,
  vi text not null,
  context text,
  verified_status text not null default 'unverified',
  effective_from date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_chart_of_accounts (
  code text not null,
  name_vi text not null,
  name_ko text not null,
  regime text check (regime in ('TT99', 'TT133')),
  effective_from date not null default current_date,
  legal_source text,
  verified_status text not null default 'unverified',
  primary key (code, effective_from)
);

create table if not exists public.accounting_posting_rules (
  id uuid primary key default gen_random_uuid(),
  txn_type text not null check (txn_type in ('sale', 'purchase', 'expense', 'payroll')),
  condition jsonb not null default '{}'::jsonb,
  debit_code text not null,
  credit_code text not null,
  effective_from date not null default current_date,
  legal_source text,
  verified_status text not null default 'unverified'
);

create table if not exists public.accounting_form_versions (
  id uuid primary key default gen_random_uuid(),
  form_code text not null,
  name_vi text not null,
  name_ko text not null,
  legal_basis text,
  effective_from date not null,
  effective_to date,
  status text not null default 'pending_verification' check (
    status in ('pending_verification', 'active', 'retired', 'blocked')
  ),
  field_map jsonb not null default '{}'::jsonb,
  template_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  txn_id uuid not null references public.accounting_transactions (id) on delete restrict,
  period_key text not null,
  entry_date date not null,
  account_code text not null,
  debit numeric not null default 0,
  credit numeric not null default 0,
  posting_rule_id uuid references public.accounting_posting_rules (id),
  form_version_id uuid references public.accounting_form_versions (id),
  created_at timestamptz not null default now()
);

create index if not exists accounting_ledger_entries_org_idx
  on public.accounting_ledger_entries (org_id, period_key);

create table if not exists public.accounting_declarations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  form_code text not null,
  form_version_id uuid references public.accounting_form_versions (id),
  period_key text not null,
  status text not null default 'not_started' check (
    status in (
      'not_started',
      'drafting',
      'expert_review',
      'ready',
      'filed_manual',
      'amended'
    )
  ),
  computed jsonb not null default '{}'::jsonb,
  due_date date,
  filed_at timestamptz,
  filed_by uuid references auth.users (id),
  filing_receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounting_review_comments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  author_id uuid not null references auth.users (id),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_exports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  kind text not null,
  form_version_id uuid references public.accounting_form_versions (id),
  period_key text not null,
  file_path text not null,
  sha256 text,
  i18n_version_list jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_legal_reviews (
  id uuid primary key default gen_random_uuid(),
  review_month date not null,
  reviewer text,
  result text,
  follow_up text,
  affected_form_version_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.accounting_audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.accounting_organizations (id) on delete set null,
  actor uuid references auth.users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  before_hash text,
  after_hash text,
  at timestamptz not null default now()
);

create index if not exists accounting_audit_log_org_idx
  on public.accounting_audit_log (org_id, at desc);

create table if not exists public.accounting_deadline_rules (
  id uuid primary key default gen_random_uuid(),
  tax_type text not null,
  period_kind text not null,
  rule jsonb not null default '{}'::jsonb,
  legal_source text,
  verified_status text not null default 'unverified'
);

-- Module UI i18n catalog skeleton (ko/vi keys — no product screens in P1)
create table if not exists public.accounting_ui_catalog (
  message_key text not null,
  lang text not null check (lang in ('ko', 'vi')),
  message text not null,
  primary key (message_key, lang)
);

insert into public.accounting_ui_catalog (message_key, lang, message)
values
  ('accounting.p1.catalog_ok', 'ko', 'P1'),
  ('accounting.p1.catalog_ok', 'vi', 'P1')
on conflict (message_key, lang) do nothing;

-- ---------------------------------------------------------------------------
-- Immutability triggers
-- ---------------------------------------------------------------------------

create or replace function public.accounting_guard_confirmed_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed transaction cannot be deleted';
  end if;
  if tg_op = 'UPDATE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed transaction cannot be updated';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists accounting_trg_guard_confirmed_txn on public.accounting_transactions;
create trigger accounting_trg_guard_confirmed_txn
  before update or delete on public.accounting_transactions
  for each row execute function public.accounting_guard_confirmed_transaction();

create or replace function public.accounting_audit_log_append()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_entity_id uuid;
begin
  if tg_op = 'INSERT' then
    v_entity_id := new.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_organizations' then
      v_org_id := new.id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (v_org_id, auth.uid(), tg_op, tg_table_name, v_entity_id, md5(new::text));
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := new.org_id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash, after_hash)
    values (
      v_org_id,
      auth.uid(),
      tg_op,
      tg_table_name,
      v_entity_id,
      md5(old::text),
      md5(new::text)
    );
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := old.org_id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash)
    values (v_org_id, auth.uid(), tg_op, tg_table_name, v_entity_id, md5(old::text));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists accounting_trg_audit_transactions on public.accounting_transactions;
create trigger accounting_trg_audit_transactions
  after insert or update or delete on public.accounting_transactions
  for each row execute function public.accounting_audit_log_append();

create or replace function public.accounting_deny_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'accounting: audit_log is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_audit_update on public.accounting_audit_log;
create trigger accounting_trg_deny_audit_update
  before update on public.accounting_audit_log
  for each row execute function public.accounting_deny_audit_log_mutation();

drop trigger if exists accounting_trg_deny_audit_delete on public.accounting_audit_log;
create trigger accounting_trg_deny_audit_delete
  before delete on public.accounting_audit_log
  for each row execute function public.accounting_deny_audit_log_mutation();

-- ledger_entries / i18n_texts: no update/delete triggers (RLS only)

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.accounting_profiles enable row level security;
alter table public.accounting_organizations enable row level security;
alter table public.accounting_org_members enable row level security;
alter table public.accounting_counterparties enable row level security;
alter table public.accounting_transactions enable row level security;
alter table public.accounting_transaction_lines enable row level security;
alter table public.accounting_evidence_files enable row level security;
alter table public.accounting_i18n_texts enable row level security;
alter table public.accounting_term_glossary enable row level security;
alter table public.accounting_chart_of_accounts enable row level security;
alter table public.accounting_posting_rules enable row level security;
alter table public.accounting_form_versions enable row level security;
alter table public.accounting_ledger_entries enable row level security;
alter table public.accounting_declarations enable row level security;
alter table public.accounting_review_comments enable row level security;
alter table public.accounting_exports enable row level security;
alter table public.accounting_legal_reviews enable row level security;
alter table public.accounting_audit_log enable row level security;
alter table public.accounting_deadline_rules enable row level security;
alter table public.accounting_ui_catalog enable row level security;

-- profiles: own row, business members only
create policy accounting_profiles_select_own
  on public.accounting_profiles for select to authenticated
  using (user_id = auth.uid() and public.accounting_is_business_member());

create policy accounting_profiles_upsert_own
  on public.accounting_profiles for insert to authenticated
  with check (user_id = auth.uid() and public.accounting_is_business_member());

create policy accounting_profiles_update_own
  on public.accounting_profiles for update to authenticated
  using (user_id = auth.uid() and public.accounting_is_business_member())
  with check (user_id = auth.uid() and public.accounting_is_business_member());

-- organizations
create policy accounting_orgs_select
  on public.accounting_organizations for select to authenticated
  using (public.accounting_can_access_org(id));

create policy accounting_orgs_insert_owner
  on public.accounting_organizations for insert to authenticated
  with check (public.accounting_is_business_member());

create policy accounting_orgs_update_owner
  on public.accounting_organizations for update to authenticated
  using (public.accounting_org_role(id) = 'company_owner')
  with check (public.accounting_org_role(id) = 'company_owner');

-- org_members
create policy accounting_org_members_select
  on public.accounting_org_members for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_org_members_manage_owner
  on public.accounting_org_members for all to authenticated
  using (public.accounting_org_role(org_id) = 'company_owner')
  with check (public.accounting_org_role(org_id) = 'company_owner');

-- org-scoped tables: read if member
create policy accounting_counterparties_rw
  on public.accounting_counterparties for all to authenticated
  using (public.accounting_can_access_org(org_id))
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_transactions_select
  on public.accounting_transactions for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_transactions_insert
  on public.accounting_transactions for insert to authenticated
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_transactions_update
  on public.accounting_transactions for update to authenticated
  using (
    public.accounting_can_access_org(org_id)
    and status <> 'confirmed'
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  )
  with check (
    public.accounting_can_access_org(org_id)
    and status <> 'confirmed'
  );

create policy accounting_transactions_delete
  on public.accounting_transactions for delete to authenticated
  using (
    public.accounting_can_access_org(org_id)
    and status = 'draft'
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_transactions_confirm_owner
  on public.accounting_transactions for update to authenticated
  using (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) = 'company_owner'
    and status in ('draft', 'submitted')
  )
  with check (
    public.accounting_can_access_org(org_id)
    and status in ('submitted', 'confirmed', 'draft', 'cancelled')
  );

create policy accounting_txn_lines_select
  on public.accounting_transaction_lines for select to authenticated
  using (
    exists (
      select 1 from public.accounting_transactions t
      where t.id = txn_id and public.accounting_can_access_org(t.org_id)
    )
  );

create policy accounting_txn_lines_write
  on public.accounting_transaction_lines for all to authenticated
  using (
    exists (
      select 1 from public.accounting_transactions t
      where t.id = txn_id
        and public.accounting_can_access_org(t.org_id)
        and t.status <> 'confirmed'
        and public.accounting_org_role(t.org_id) in ('company_owner', 'company_member')
    )
  )
  with check (
    exists (
      select 1 from public.accounting_transactions t
      where t.id = txn_id
        and public.accounting_can_access_org(t.org_id)
        and t.status <> 'confirmed'
        and public.accounting_org_role(t.org_id) in ('company_owner', 'company_member')
    )
  );

create policy accounting_evidence_select
  on public.accounting_evidence_files for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_evidence_write
  on public.accounting_evidence_files for all to authenticated
  using (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  )
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_i18n_select
  on public.accounting_i18n_texts for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_i18n_insert
  on public.accounting_i18n_texts for insert to authenticated
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member', 'vnk_expert')
  );

-- ledger: insert-only for members; select for all roles incl. expert
create policy accounting_ledger_select
  on public.accounting_ledger_entries for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_ledger_insert
  on public.accounting_ledger_entries for insert to authenticated
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_declarations_rw
  on public.accounting_declarations for all to authenticated
  using (public.accounting_can_access_org(org_id))
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_review_select
  on public.accounting_review_comments for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_review_insert_expert
  on public.accounting_review_comments for insert to authenticated
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('vnk_expert', 'company_owner')
  );

create policy accounting_exports_select
  on public.accounting_exports for select to authenticated
  using (public.accounting_can_access_org(org_id));

create policy accounting_exports_insert
  on public.accounting_exports for insert to authenticated
  with check (
    public.accounting_can_access_org(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_audit_select
  on public.accounting_audit_log for select to authenticated
  using (
    org_id is not null and public.accounting_can_access_org(org_id)
  );

-- reference / catalog tables
create policy accounting_glossary_select
  on public.accounting_term_glossary for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_glossary_admin_write
  on public.accounting_term_glossary for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_coa_select
  on public.accounting_chart_of_accounts for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_coa_admin_write
  on public.accounting_chart_of_accounts for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_posting_rules_select
  on public.accounting_posting_rules for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_posting_rules_admin_write
  on public.accounting_posting_rules for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_form_versions_select
  on public.accounting_form_versions for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_form_versions_admin_write
  on public.accounting_form_versions for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_deadline_select
  on public.accounting_deadline_rules for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_deadline_admin_write
  on public.accounting_deadline_rules for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_legal_reviews_select
  on public.accounting_legal_reviews for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_legal_reviews_admin_write
  on public.accounting_legal_reviews for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

create policy accounting_ui_catalog_select
  on public.accounting_ui_catalog for select to authenticated
  using (public.accounting_is_business_member());

create policy accounting_ui_catalog_admin_write
  on public.accounting_ui_catalog for all to authenticated
  using (public.accounting_is_vnk_admin())
  with check (public.accounting_is_vnk_admin());

-- ---------------------------------------------------------------------------
-- Storage: private evidence bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'accounting_evidence',
  'accounting_evidence',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy accounting_evidence_storage_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'accounting_evidence'
    and public.accounting_can_access_org(((storage.foldername(name))[1])::uuid)
  );

create policy accounting_evidence_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'accounting_evidence'
    and public.accounting_can_access_org(((storage.foldername(name))[1])::uuid)
    and public.accounting_org_role(((storage.foldername(name))[1])::uuid)
      in ('company_owner', 'company_member')
  );

create policy accounting_evidence_storage_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'accounting_evidence'
    and public.accounting_can_access_org(((storage.foldername(name))[1])::uuid)
    and public.accounting_org_role(((storage.foldername(name))[1])::uuid)
      in ('company_owner', 'company_member')
  );

-- ---------------------------------------------------------------------------
-- Grants (LESSONS #47) — accounting_* only
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table
  public.accounting_profiles,
  public.accounting_organizations,
  public.accounting_org_members,
  public.accounting_counterparties,
  public.accounting_transactions,
  public.accounting_transaction_lines,
  public.accounting_evidence_files,
  public.accounting_i18n_texts,
  public.accounting_term_glossary,
  public.accounting_chart_of_accounts,
  public.accounting_posting_rules,
  public.accounting_form_versions,
  public.accounting_ledger_entries,
  public.accounting_declarations,
  public.accounting_review_comments,
  public.accounting_exports,
  public.accounting_legal_reviews,
  public.accounting_audit_log,
  public.accounting_deadline_rules,
  public.accounting_ui_catalog
to service_role;

grant select on public.accounting_ui_catalog to authenticated;
grant select on public.accounting_term_glossary to authenticated;
grant select on public.accounting_chart_of_accounts to authenticated;
grant select on public.accounting_posting_rules to authenticated;
grant select on public.accounting_form_versions to authenticated;
grant select on public.accounting_deadline_rules to authenticated;
grant select on public.accounting_legal_reviews to authenticated;

grant select, insert, update, delete on public.accounting_profiles to authenticated;
grant select, insert, update, delete on public.accounting_organizations to authenticated;
grant select, insert, update, delete on public.accounting_org_members to authenticated;
grant select, insert, update, delete on public.accounting_counterparties to authenticated;
grant select, insert, update, delete on public.accounting_transactions to authenticated;
grant select, insert, update, delete on public.accounting_transaction_lines to authenticated;
grant select, insert, update, delete on public.accounting_evidence_files to authenticated;
grant select, insert on public.accounting_i18n_texts to authenticated;
grant select, insert on public.accounting_ledger_entries to authenticated;
grant select, insert, update, delete on public.accounting_declarations to authenticated;
grant select, insert on public.accounting_review_comments to authenticated;
grant select, insert on public.accounting_exports to authenticated;
grant select on public.accounting_audit_log to authenticated;

grant select, insert, update, delete on public.accounting_term_glossary to authenticated;
grant select, insert, update, delete on public.accounting_chart_of_accounts to authenticated;
grant select, insert, update, delete on public.accounting_posting_rules to authenticated;
grant select, insert, update, delete on public.accounting_form_versions to authenticated;
grant select, insert, update, delete on public.accounting_deadline_rules to authenticated;
grant select, insert, update, delete on public.accounting_legal_reviews to authenticated;
grant select, insert, update, delete on public.accounting_ui_catalog to authenticated;
