-- P5a: 01/GTGT draft schema, adjustments, form seeds, feature flags

-- organizations: VAT method settings
alter table public.accounting_organizations
  add column if not exists vat_method text check (vat_method in ('deduction', 'direct')),
  add column if not exists vat_method_basis text check (
    vat_method_basis in (
      'revenue_ge_1bn',
      'voluntary',
      'new_company_estimated',
      'below_1bn_direct'
    )
  ),
  add column if not exists method_locked_until date;

comment on column public.accounting_organizations.vat_method is
  'GTGT deduction vs direct; write vnk_expert/vnk_admin only';
comment on column public.accounting_organizations.vat_method_basis is
  'Basis for vat_method; unverified until G2 gate';

create or replace function public.accounting_guard_org_vat_settings()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' then
    if (old.vat_method is distinct from new.vat_method
        or old.vat_method_basis is distinct from new.vat_method_basis
        or old.method_locked_until is distinct from new.method_locked_until)
      and not exists (
        select 1
        from public.accounting_org_members m
        where m.org_id = new.id
          and m.user_id = auth.uid()
          and m.role in ('vnk_expert', 'vnk_admin')
      ) then
      raise exception 'accounting: only vnk_expert or vnk_admin may change vat_method settings';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_org_vat_settings on public.accounting_organizations;
create trigger accounting_trg_guard_org_vat_settings
  before update on public.accounting_organizations
  for each row execute function public.accounting_guard_org_vat_settings();

-- declarations: portal basis (expert write)
alter table public.accounting_declarations
  add column if not exists portal_form_basis text check (portal_form_basis in ('TT89', 'TT80'));

create or replace function public.accounting_guard_declaration_portal_basis()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.portal_form_basis is distinct from new.portal_form_basis then
    if not exists (
      select 1
      from public.accounting_org_members m
      where m.org_id = new.org_id
        and m.user_id = auth.uid()
        and m.role = 'vnk_expert'
    ) then
      raise exception 'accounting: only vnk_expert may change portal_form_basis';
    end if;
  end if;
  if tg_op = 'INSERT' and new.portal_form_basis is not null then
    if not exists (
      select 1
      from public.accounting_org_members m
      where m.org_id = new.org_id
        and m.user_id = auth.uid()
        and m.role = 'vnk_expert'
    ) then
      raise exception 'accounting: only vnk_expert may set portal_form_basis on insert';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_declaration_portal_basis on public.accounting_declarations;
create trigger accounting_trg_guard_declaration_portal_basis
  before insert or update on public.accounting_declarations
  for each row execute function public.accounting_guard_declaration_portal_basis();

-- form_versions: portal basis, feature flag, verified_status
alter table public.accounting_form_versions
  add column if not exists portal_form_basis text check (portal_form_basis in ('TT89', 'TT80')),
  add column if not exists feature_enabled boolean not null default false,
  add column if not exists verified_status text not null default 'unverified';

drop index if exists accounting_form_versions_form_code_key;
drop index if exists accounting_form_versions_code_basis_key;

delete from public.accounting_form_versions
where form_code in ('01/GTGT', '04/GTGT')
  and portal_form_basis is null;

create unique index if not exists accounting_form_versions_code_basis_key
  on public.accounting_form_versions (form_code, portal_form_basis);

-- declaration_adjustments (insert-only)
create table if not exists public.accounting_declaration_adjustments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  declaration_id uuid not null references public.accounting_declarations (id) on delete cascade,
  field_code text not null,
  amount bigint not null,
  reason_code text,
  expert_note text,
  legal_basis text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  constraint accounting_adj_field_code_check check (
    field_code in ('32a', '32b', '34a', '37', '38', '42')
  )
);

create index if not exists accounting_declaration_adjustments_decl_idx
  on public.accounting_declaration_adjustments (declaration_id);

alter table public.accounting_declaration_adjustments enable row level security;

create policy accounting_declaration_adjustments_select
  on public.accounting_declaration_adjustments for select to authenticated
  using (public.accounting_can_use_org_data(org_id));

create policy accounting_declaration_adjustments_insert_expert
  on public.accounting_declaration_adjustments for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) = 'vnk_expert'
  );

revoke update, delete on public.accounting_declaration_adjustments from authenticated;

create or replace function public.accounting_deny_declaration_adjustments_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'accounting: declaration_adjustments is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_declaration_adjustments_update
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_deny_declaration_adjustments_update
  before update on public.accounting_declaration_adjustments
  for each row execute function public.accounting_deny_declaration_adjustments_mutation();

drop trigger if exists accounting_trg_deny_declaration_adjustments_delete
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_deny_declaration_adjustments_delete
  before delete on public.accounting_declaration_adjustments
  for each row execute function public.accounting_deny_declaration_adjustments_mutation();

create or replace function public.accounting_guard_declaration_adjustment_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  decl_status text;
begin
  select d.status into decl_status
  from public.accounting_declarations d
  where d.id = new.declaration_id
    and d.org_id = new.org_id;
  if decl_status = 'filed_manual' then
    raise exception 'accounting: cannot adjust filed_manual declaration';
  end if;
  if new.field_code in ('37', '38') and (new.reason_code is null or btrim(new.reason_code) = '') then
    raise exception 'accounting: reason_code required for field %', new.field_code;
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_declaration_adjustment_insert
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_guard_declaration_adjustment_insert
  before insert on public.accounting_declaration_adjustments
  for each row execute function public.accounting_guard_declaration_adjustment_insert();

create or replace function public.accounting_audit_log_append_declaration_adjustment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (new.org_id, auth.uid(), tg_op, tg_table_name, new.id, md5(new::text));
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_audit_declaration_adjustments
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_audit_declaration_adjustments
  after insert on public.accounting_declaration_adjustments
  for each row execute function public.accounting_audit_log_append_declaration_adjustment();

grant select, insert on public.accounting_declaration_adjustments to authenticated;

-- Form seeds (G2 pack §4–§5)
update public.accounting_form_versions
set status = 'retired', feature_enabled = false
where form_code in ('01/GTGT', '04/GTGT')
  and portal_form_basis is null;

insert into public.accounting_form_versions (
  form_code, name_ko, name_vi, legal_basis, effective_from, status,
  portal_form_basis, feature_enabled, verified_status, field_map, template_path
)
values
  (
    '01/GTGT',
    '부가가치세 공제 방식 (TT89)',
    'Thuế GTGT phương pháp khấu trừ (TT89)',
    'Thông tư 89/2026/TT-BTC',
    '2026-07-01',
    'pending_verification',
    'TT89',
    true,
    'unverified',
    '{"pack":"G2_VAT_FORM_PACK.md","section":"5"}'::jsonb,
    null
  ),
  (
    '01/GTGT',
    '부가가치세 공제 방식 (TT80)',
    'Thuế GTGT phương pháp khấu trừ (TT80)',
    'Thông tư 80/2021/TT-BTC',
    '2026-07-01',
    'blocked',
    'TT80',
    false,
    'unverified',
    '{}'::jsonb,
    null
  ),
  (
    '04/GTGT',
    '부가가치세 직접 방식 (TT89)',
    'Thuế GTGT phương pháp trực tiếp (TT89)',
    'Thông tư 89/2026/TT-BTC',
    '2026-07-01',
    'blocked',
    'TT89',
    false,
    'unverified',
    '{}'::jsonb,
    null
  )
on conflict (form_code, portal_form_basis) do update set
  status = excluded.status,
  feature_enabled = excluded.feature_enabled,
  verified_status = excluded.verified_status,
  field_map = excluded.field_map;

-- Deadline rules already seeded in P4a; ensure verified_status visible
update public.accounting_deadline_rules
set verified_status = 'unverified'
where tax_type = 'vat';
