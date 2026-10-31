-- P6-1: filed_manual allows draft/submitted txn only; block ledger insert; vi confirm RLS helper

create or replace function public.accounting_guard_txn_period_lock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
  v_period text;
begin
  if tg_op = 'DELETE' then
    v_org := old.org_id;
    v_period := old.period_key;
  else
    v_org := new.org_id;
    v_period := new.period_key;
  end if;

  if not public.accounting_period_filed_manual(v_org, v_period) then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    if new.status in ('draft', 'submitted') then
      return new;
    end if;
    raise exception 'accounting: period is filed_manual locked';
  end if;

  if tg_op = 'UPDATE' then
    if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
      raise exception 'accounting: period is filed_manual locked';
    end if;
    if new.status in ('draft', 'submitted', 'cancelled') then
      return new;
    end if;
    raise exception 'accounting: period is filed_manual locked';
  end if;

  raise exception 'accounting: period is filed_manual locked';
end;
$$;

create or replace function public.accounting_guard_ledger_period_lock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.accounting_period_filed_manual(new.org_id, new.period_key) then
    raise exception 'accounting: period is filed_manual locked';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_ledger_period_lock on public.accounting_ledger_entries;
create trigger accounting_trg_ledger_period_lock
  before insert on public.accounting_ledger_entries
  for each row execute function public.accounting_guard_ledger_period_lock();

-- Role/locale gate mirrored for RLS callers (RPC remains security definer).
create or replace function public.accounting_may_confirm_vi_text(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.accounting_can_use_org_data(p_org_id)
    and (
      public.accounting_org_role(p_org_id) = 'vnk_expert'
      or (
        public.accounting_org_role(p_org_id) = 'company_member'
        and exists (
          select 1
          from public.accounting_profiles p
          where p.user_id = auth.uid() and p.locale = 'vi'
        )
      )
    );
$$;

drop policy if exists accounting_i18n_vi_confirm_insert on public.accounting_i18n_texts;
create policy accounting_i18n_vi_confirm_insert
  on public.accounting_i18n_texts for insert to authenticated
  with check (
    status is distinct from 'human_verified'
    or public.accounting_may_confirm_vi_text(org_id)
  );
