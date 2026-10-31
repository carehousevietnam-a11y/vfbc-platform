-- VIET TAX: org-level mini intake after company workspace approval (one row per org).

create table if not exists public.accounting_org_workspace_intake (
  org_id uuid primary key references public.accounting_organizations (id) on delete cascade,
  report_intent text not null check (
    report_intent in ('vat', 'corp_tax', 'invoices', 'undecided', 'custom')
  ),
  report_intent_custom text,
  period_granularity text not null check (period_granularity in ('month', 'quarter', 'year')),
  period_key text not null,
  vi_understanding text not null check (
    vi_understanding in ('read_self', 'interpreter', 'ai_translate', 'hard', 'custom')
  ),
  vi_understanding_custom text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  constraint accounting_workspace_intake_custom_chk check (
    (report_intent <> 'custom' or coalesce(trim(report_intent_custom), '') <> '')
    and (vi_understanding <> 'custom' or coalesce(trim(vi_understanding_custom), '') <> '')
  )
);

alter table public.accounting_org_workspace_intake enable row level security;

alter table public.accounting_org_workspace_intake
  drop constraint if exists accounting_workspace_intake_period_key_chk;

alter table public.accounting_org_workspace_intake
  add constraint accounting_workspace_intake_period_key_chk check (
    (
      period_granularity = 'month'
      and period_key ~ '^\d{4}-(0[1-9]|1[0-2])$'
    )
    or (
      period_granularity = 'quarter'
      and period_key ~ '^\d{4}-Q[1-4]$'
    )
    or (period_granularity = 'year' and period_key ~ '^\d{4}$')
  );

drop policy if exists accounting_workspace_intake_select on public.accounting_org_workspace_intake;
drop policy if exists accounting_workspace_intake_insert on public.accounting_org_workspace_intake;

create policy accounting_workspace_intake_select
  on public.accounting_org_workspace_intake for select to authenticated
  using (public.accounting_can_use_org_data(org_id));

create policy accounting_workspace_intake_insert
  on public.accounting_org_workspace_intake for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
    and created_by = auth.uid()
  );

revoke update, delete on public.accounting_org_workspace_intake from authenticated;
revoke update, delete on public.accounting_org_workspace_intake from anon;

grant select, insert on public.accounting_org_workspace_intake to authenticated;
grant select, insert, update, delete on public.accounting_org_workspace_intake to service_role;

create or replace function public.accounting_deny_workspace_intake_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'accounting: workspace_intake is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_workspace_intake_update on public.accounting_org_workspace_intake;
create trigger accounting_trg_deny_workspace_intake_update
  before update or delete on public.accounting_org_workspace_intake
  for each row execute function public.accounting_deny_workspace_intake_mutation();

-- audit_log append for workspace intake
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
    if tg_table_name = 'accounting_org_workspace_intake' then
      v_org_id := new.org_id;
      v_entity_id := new.org_id;
    elsif tg_table_name = 'accounting_transactions' then
      v_entity_id := new.id;
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_organizations' then
      v_entity_id := new.id;
      v_org_id := new.id;
    elsif tg_table_name = 'accounting_org_documents' then
      v_entity_id := new.id;
      v_org_id := new.org_id;
    else
      v_entity_id := new.id;
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (v_org_id, auth.uid(), tg_op, tg_table_name, v_entity_id, md5(new::text));
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_org_documents' then
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_org_workspace_intake' then
      v_org_id := new.org_id;
      v_entity_id := new.org_id;
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
    elsif tg_table_name = 'accounting_org_documents' then
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

drop trigger if exists accounting_trg_audit_workspace_intake on public.accounting_org_workspace_intake;
create trigger accounting_trg_audit_workspace_intake
  after insert on public.accounting_org_workspace_intake
  for each row execute function public.accounting_audit_log_append();
