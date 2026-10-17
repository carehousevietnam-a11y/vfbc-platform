-- P10: standardized 2-layer form skeleton (G9 gate, no submit)

alter table public.accounting_form_versions
  add column if not exists form_class text not null default 'government'
  check (form_class in ('government', 'standardized'));

comment on column public.accounting_form_versions.form_class is
  'government | standardized (VIET-TAX standard forms without government form numbers)';

create table if not exists public.accounting_standardized_drafts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  form_version_id uuid not null references public.accounting_form_versions (id) on delete restrict,
  period_key text not null,
  status text not null default 'draft' check (status in ('draft', 'expert_review', 'confirmed')),
  answers jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users (id),
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounting_standardized_drafts_org_idx
  on public.accounting_standardized_drafts (org_id, period_key);

create index if not exists accounting_standardized_drafts_form_idx
  on public.accounting_standardized_drafts (form_version_id);

comment on table public.accounting_standardized_drafts is
  'VIET-TAX standardized document drafts. Free text via accounting_i18n_texts entity_type=standardized_draft.';
comment on column public.accounting_standardized_drafts.answers is
  'Choice codes only (no free text). Direct-input values stored in i18n_texts.';

create or replace function public.accounting_guard_confirmed_standardized_draft()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed standardized draft cannot be deleted';
  end if;
  if tg_op = 'UPDATE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed standardized draft cannot be updated';
  end if;
  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'confirmed'
    and public.accounting_org_role(new.org_id) is distinct from 'company_owner' then
    raise exception 'accounting: only company_owner may confirm standardized drafts';
  end if;
  if tg_op = 'UPDATE' and new.status = 'confirmed' then
    new.confirmed_by := auth.uid();
    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_confirmed_standardized_draft
  on public.accounting_standardized_drafts;
create trigger accounting_trg_guard_confirmed_standardized_draft
  before update or delete on public.accounting_standardized_drafts
  for each row execute function public.accounting_guard_confirmed_standardized_draft();

alter table public.accounting_standardized_drafts enable row level security;

create policy accounting_standardized_drafts_select
  on public.accounting_standardized_drafts for select to authenticated
  using (public.accounting_can_use_org_data(org_id));

create policy accounting_standardized_drafts_insert
  on public.accounting_standardized_drafts for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
    and created_by = auth.uid()
  );

create policy accounting_standardized_drafts_update
  on public.accounting_standardized_drafts for update to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and status <> 'confirmed'
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  )
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_standardized_drafts_delete
  on public.accounting_standardized_drafts for delete to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and status <> 'confirmed'
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

drop trigger if exists accounting_trg_audit_standardized_drafts on public.accounting_standardized_drafts;
create trigger accounting_trg_audit_standardized_drafts
  after insert or update or delete on public.accounting_standardized_drafts
  for each row execute function public.accounting_audit_log_append_org_row();

grant select, insert, update, delete on public.accounting_standardized_drafts to authenticated;
grant select, insert, update, delete on public.accounting_standardized_drafts to service_role;

-- G9 placeholder: no government form number; submit gate OFF
insert into public.accounting_form_versions (
  form_code,
  name_ko,
  name_vi,
  legal_basis,
  effective_from,
  status,
  form_class,
  feature_enabled,
  verified_status,
  field_map,
  template_path
)
select
  'VTAX_STD_G9_EXPLANATION',
  'VIET-TAX 표준 서식(검증 전)',
  'Biểu mẫu chuẩn VIET-TAX (chưa xác minh)',
  'G9 — legal required content unverified (ACCOUNTING_MODULE_DESIGN §7)',
  '2026-01-01'::date,
  'pending_verification',
  'standardized',
  false,
  'unverified',
  jsonb_build_object(
    'gates', jsonb_build_object('standardized_submit', false),
    'content_pack_id', 'G9_STANDARDIZED_PACK',
    'disclaimer', 'VIET-TAX_STANDARD_NOT_GOVERNMENT_FORM'
  ),
  null
where not exists (
  select 1 from public.accounting_form_versions f
  where f.form_code = 'VTAX_STD_G9_EXPLANATION'
    and f.form_class = 'standardized'
);
