-- P3: posting_rules engine, ledger_entries confirm flow, period lock, correction branch (2026-10-16)
-- Design: docs/master/ACCOUNTING_MODULE_DESIGN.md §4, §7 G3/G5, §8 P3

alter table public.accounting_organizations
  add column if not exists ledger_correction_method text not null default 'reverse_entry',
  add column if not exists ledger_correction_method_verified_status text not null default 'unverified';

alter table public.accounting_organizations
  drop constraint if exists accounting_organizations_ledger_correction_method_check;

alter table public.accounting_organizations
  add constraint accounting_organizations_ledger_correction_method_check check (
    ledger_correction_method in ('reverse_entry', 'supplementary_entry', 'red_ink')
  );

-- ---------------------------------------------------------------------------
-- Ledger immutability (insert-only)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_guard_ledger_immutable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception 'accounting: ledger_entries is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_ledger_mutate on public.accounting_ledger_entries;
create trigger accounting_trg_deny_ledger_mutate
  before update or delete on public.accounting_ledger_entries
  for each row execute function public.accounting_guard_ledger_immutable();

revoke update, delete on public.accounting_ledger_entries from authenticated;
grant select, insert on public.accounting_ledger_entries to authenticated;

create or replace function public.accounting_audit_log_append_ledger()
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

drop trigger if exists accounting_trg_audit_ledger on public.accounting_ledger_entries;
create trigger accounting_trg_audit_ledger
  after insert on public.accounting_ledger_entries
  for each row execute function public.accounting_audit_log_append_ledger();

-- Test-only account codes (TEST-*): fail second leg to verify confirm rollback
create or replace function public.accounting_ledger_test_fail_hook()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.account_code = 'TEST-THROW-FAIL' then
    raise exception 'accounting: test ledger insert fail';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_ledger_test_fail on public.accounting_ledger_entries;
create trigger accounting_trg_ledger_test_fail
  before insert on public.accounting_ledger_entries
  for each row execute function public.accounting_ledger_test_fail_hook();

-- ---------------------------------------------------------------------------
-- Posting rule match (data-driven; empty condition matches any line)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_posting_rule_matches(
  p_condition jsonb,
  p_line_vat_rate numeric
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select p_condition = '{}'::jsonb
    or (
      (not p_condition ? 'vat_rate' or (p_condition->>'vat_rate')::numeric is not distinct from p_line_vat_rate)
      and (p_condition - 'vat_rate') = '{}'::jsonb
    );
$$;

create or replace function public.accounting_period_filed_manual(p_org_id uuid, p_period_key text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.accounting_declarations d
    where d.org_id = p_org_id
      and d.period_key = p_period_key
      and d.status = 'filed_manual'
  );
$$;

create or replace function public.accounting_ledger_txn_balanced(p_txn_id uuid)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce(sum(debit), 0) = coalesce(sum(credit), 0)
    and coalesce(sum(debit), 0) > 0
  from public.accounting_ledger_entries
  where txn_id = p_txn_id;
$$;

create or replace function public.accounting_assert_ledger_balanced(p_txn_id uuid)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if not public.accounting_ledger_txn_balanced(p_txn_id) then
    raise exception 'accounting: ledger debit/credit imbalance for txn %', p_txn_id
      using errcode = 'P0001';
  end if;
end;
$$;

-- Require balanced ledger before status becomes confirmed (blocks bypassing RPC)
create or replace function public.accounting_guard_confirmed_transaction()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed transaction cannot be deleted';
  end if;
  if tg_op = 'UPDATE' and old.status = 'confirmed' then
    raise exception 'accounting: confirmed transaction cannot be updated';
  end if;
  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'confirmed'
    and public.accounting_org_role(new.org_id) is distinct from 'company_owner' then
    raise exception 'accounting: only company_owner may confirm transactions';
  end if;
  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'confirmed' then
    if public.accounting_period_filed_manual(new.org_id, new.period_key) then
      raise exception 'accounting: period is filed_manual locked';
    end if;
    if not public.accounting_ledger_txn_balanced(new.id) then
      raise exception 'accounting: cannot confirm without balanced ledger_entries';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- Confirm + posting (single transaction)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_confirm_transaction(p_txn_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_txn public.accounting_transactions%rowtype;
  v_rule public.accounting_posting_rules%rowtype;
  v_amount numeric;
  v_method text;
  v_line_vat numeric;
  v_entry public.accounting_ledger_entries%rowtype;
begin
  select * into v_txn from public.accounting_transactions where id = p_txn_id;
  if not found then
    raise exception 'accounting: transaction not found';
  end if;

  if not public.accounting_can_use_org_data(v_txn.org_id) then
    raise exception 'accounting: forbidden';
  end if;
  if public.accounting_org_role(v_txn.org_id) is distinct from 'company_owner' then
    raise exception 'accounting: only company_owner may confirm';
  end if;
  if v_txn.status = 'confirmed' then
    raise exception 'accounting: already confirmed';
  end if;
  if v_txn.status not in ('draft', 'submitted') then
    raise exception 'accounting: invalid status for confirm';
  end if;
  if public.accounting_period_filed_manual(v_txn.org_id, v_txn.period_key) then
    raise exception 'accounting: period is filed_manual locked';
  end if;
  if exists (select 1 from public.accounting_ledger_entries le where le.txn_id = p_txn_id) then
    raise exception 'accounting: ledger already exists for transaction';
  end if;

  v_amount := v_txn.amount_vnd;
  if v_amount is null or v_amount <= 0 then
    raise exception 'accounting: amount_vnd invalid';
  end if;

  select tl.vat_rate into v_line_vat
  from public.accounting_transaction_lines tl
  where tl.txn_id = p_txn_id
  order by tl.created_at
  limit 1;

  select r.* into v_rule
  from public.accounting_posting_rules r
  where r.txn_type = v_txn.type
    and r.effective_from <= v_txn.txn_date
    and public.accounting_posting_rule_matches(r.condition, v_line_vat)
  order by r.effective_from desc
  limit 1;

  if not found then
    raise exception 'accounting: posting rule missing'
      using errcode = 'P0001';
  end if;

  select o.ledger_correction_method into v_method
  from public.accounting_organizations o
  where o.id = v_txn.org_id;

  if v_txn.corrects_txn_id is not null then
    if v_method = 'reverse_entry' then
      for v_entry in
        select *
        from public.accounting_ledger_entries
        where txn_id = v_txn.corrects_txn_id
          and org_id = v_txn.org_id
      loop
        insert into public.accounting_ledger_entries (
          org_id,
          txn_id,
          period_key,
          entry_date,
          account_code,
          debit,
          credit,
          posting_rule_id
        )
        values (
          v_txn.org_id,
          p_txn_id,
          v_txn.period_key,
          v_txn.txn_date,
          v_entry.account_code,
          v_entry.credit,
          v_entry.debit,
          v_entry.posting_rule_id
        );
      end loop;
    else
      raise exception 'accounting: correction_method not supported yet';
    end if;
  end if;

  insert into public.accounting_ledger_entries (
    org_id,
    txn_id,
    period_key,
    entry_date,
    account_code,
    debit,
    credit,
    posting_rule_id
  )
  values (
    v_txn.org_id,
    p_txn_id,
    v_txn.period_key,
    v_txn.txn_date,
    v_rule.debit_code,
    v_amount,
    0,
    v_rule.id
  );

  insert into public.accounting_ledger_entries (
    org_id,
    txn_id,
    period_key,
    entry_date,
    account_code,
    debit,
    credit,
    posting_rule_id
  )
  values (
    v_txn.org_id,
    p_txn_id,
    v_txn.period_key,
    v_txn.txn_date,
    v_rule.credit_code,
    0,
    v_amount,
    v_rule.id
  );

  perform public.accounting_assert_ledger_balanced(p_txn_id);

  update public.accounting_transactions
  set status = 'confirmed'
  where id = p_txn_id;

  insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id)
  values (v_txn.org_id, auth.uid(), 'CONFIRM', 'accounting_transactions', p_txn_id);
end;
$$;

revoke all on function public.accounting_confirm_transaction(uuid) from public;
revoke all on function public.accounting_confirm_transaction(uuid) from anon;
grant execute on function public.accounting_confirm_transaction(uuid) to authenticated;

-- View: unverified accounting basis flag for P3b UI / export
create or replace view public.accounting_ledger_entries_enriched
with (security_invoker = true)
as
select
  le.*,
  (
    coalesce(pr.verified_status, 'unverified') = 'unverified'
    or exists (
      select 1
      from public.accounting_chart_of_accounts coa
      where coa.code = le.account_code
        and coa.verified_status = 'unverified'
    )
  ) as uses_unverified_accounting_basis,
  (v_txn.currency is distinct from 'VND') as fx_conversion_unverified
from public.accounting_ledger_entries le
join public.accounting_transactions v_txn on v_txn.id = le.txn_id
left join public.accounting_posting_rules pr on pr.id = le.posting_rule_id;

grant select on public.accounting_ledger_entries_enriched to authenticated;
