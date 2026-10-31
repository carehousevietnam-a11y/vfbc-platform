-- P3b: posting rule tie-break (specificity + effective_from), ledger text search (unaccent)

create extension if not exists unaccent with schema extensions;

create or replace function public.accounting_posting_rule_specificity(p_condition jsonb)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p_condition = '{}'::jsonb then 0
    else (select count(*)::integer from jsonb_object_keys(p_condition))
  end;
$$;

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
  order by
    public.accounting_posting_rule_specificity(r.condition) desc,
    r.effective_from desc
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

create or replace function public.accounting_ledger_search_txn_ids(p_org_id uuid, p_query text)
returns setof uuid
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with q as (
    select trim(coalesce(p_query, '')) as raw
  ),
  folded as (
    select
      raw,
      case when raw = '' then null else '%' || extensions.unaccent(lower(raw)) || '%' end as pat
    from q
  )
  select distinct t.id
  from public.accounting_transactions t
  cross join folded f
  left join public.accounting_counterparties c on c.id = t.counterparty_id and c.org_id = t.org_id
  where t.org_id = p_org_id
    and f.raw <> ''
    and (
      c.name_original ilike '%' || f.raw || '%'
      or (f.pat is not null and extensions.unaccent(lower(coalesce(c.name_original, ''))) like f.pat)
      or exists (
        select 1
        from public.accounting_i18n_texts i
        where i.org_id = p_org_id
          and i.entity_type = 'transaction'
          and i.entity_id = t.id
          and (
            i.text ilike '%' || f.raw || '%'
            or (f.pat is not null and extensions.unaccent(lower(i.text)) like f.pat)
          )
      )
      or exists (
        select 1
        from public.accounting_chart_of_accounts coa
        where coa.code ilike '%' || f.raw || '%'
          or coa.name_ko ilike '%' || f.raw || '%'
          or coa.name_vi ilike '%' || f.raw || '%'
          or (f.pat is not null and extensions.unaccent(lower(coa.name_vi)) like f.pat)
      )
    );
$$;

grant execute on function public.accounting_ledger_search_txn_ids(uuid, text) to authenticated;
