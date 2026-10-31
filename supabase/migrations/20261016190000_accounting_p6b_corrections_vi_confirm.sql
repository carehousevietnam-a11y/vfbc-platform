-- P6b: correction approval (new txn + reverse entries), Vietnamese confirm, review_comment hardening,
-- expert receipt upload. Does not modify earlier migrations.

-- ---------------------------------------------------------------------------
-- review_comments: correction payload + insert/update guards
-- ---------------------------------------------------------------------------

alter table public.accounting_review_comments
  add column if not exists correction_payload jsonb;

create or replace function public.accounting_guard_review_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_txn public.accounting_transactions%rowtype;
begin
  if new.target_type = 'transaction' then
    select * into v_txn from public.accounting_transactions where id = new.target_id;
    if not found or v_txn.org_id <> new.org_id then
      raise exception 'accounting: comment target transaction not in org';
    end if;
    if new.kind = 'correction_request' then
      if v_txn.status <> 'confirmed' then
        raise exception 'accounting: correction request needs a confirmed transaction';
      end if;
      if new.correction_payload is null
        or coalesce((new.correction_payload ->> 'amount_vnd')::numeric, 0) <= 0 then
        raise exception 'accounting: correction request requires amount_vnd > 0';
      end if;
    end if;
  elsif new.target_type = 'declaration' then
    if not exists (
      select 1 from public.accounting_declarations d
      where d.id = new.target_id and d.org_id = new.org_id
    ) then
      raise exception 'accounting: comment target declaration not in org';
    end if;
  end if;
  if new.status <> 'open' then
    raise exception 'accounting: new comment must be open';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_review_comment_insert on public.accounting_review_comments;
create trigger accounting_trg_review_comment_insert
  before insert on public.accounting_review_comments
  for each row execute function public.accounting_guard_review_comment_insert();

create or replace function public.accounting_guard_review_comment_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.org_id is distinct from old.org_id
    or new.target_type is distinct from old.target_type
    or new.target_id is distinct from old.target_id
    or new.author_id is distinct from old.author_id
    or new.kind is distinct from old.kind
    or new.correction_payload is distinct from old.correction_payload
    or new.created_at is distinct from old.created_at then
    raise exception 'accounting: review comment fields are immutable except status';
  end if;
  if old.status = 'resolved' and new.status is distinct from old.status then
    raise exception 'accounting: resolved comment cannot reopen';
  end if;
  if new.status = 'resolved' and old.status = 'open'
    and old.kind = 'correction_request'
    and old.target_type = 'transaction'
    and coalesce(current_setting('accounting.correction_flow', true), '') <> 'on' then
    raise exception 'accounting: transaction correction request resolves only via approve/reject';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_review_comment_update on public.accounting_review_comments;
create trigger accounting_trg_review_comment_update
  before update on public.accounting_review_comments
  for each row execute function public.accounting_guard_review_comment_update();

-- ---------------------------------------------------------------------------
-- i18n_texts: human_verified only through accounting_confirm_vi_text
-- ---------------------------------------------------------------------------

create or replace function public.accounting_guard_i18n_human_verified()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'human_verified'
    and auth.uid() is not null
    and coalesce(current_setting('accounting.vi_confirm', true), '') <> 'on' then
    raise exception 'accounting: human_verified only via accounting_confirm_vi_text';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_i18n_human_verified on public.accounting_i18n_texts;
create trigger accounting_trg_i18n_human_verified
  before insert on public.accounting_i18n_texts
  for each row execute function public.accounting_guard_i18n_human_verified();

-- ---------------------------------------------------------------------------
-- Correction approve / reject (company_owner only, single transaction)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_approve_correction(p_comment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  c public.accounting_review_comments%rowtype;
  o public.accounting_transactions%rowtype;
  v_new uuid;
  v_amount numeric;
begin
  select * into c from public.accounting_review_comments where id = p_comment_id for update;
  if not found then
    raise exception 'accounting: correction request not found';
  end if;
  if c.kind <> 'correction_request' or c.target_type <> 'transaction' then
    raise exception 'accounting: not a transaction correction request';
  end if;
  if not public.accounting_can_use_org_data(c.org_id) then
    raise exception 'accounting: forbidden';
  end if;
  if public.accounting_org_role(c.org_id) is distinct from 'company_owner' then
    raise exception 'accounting: only company_owner may approve correction';
  end if;
  if c.status <> 'open' then
    raise exception 'accounting: correction request already resolved';
  end if;

  select * into o from public.accounting_transactions
  where id = c.target_id and org_id = c.org_id;
  if not found or o.status <> 'confirmed' then
    raise exception 'accounting: original transaction must be confirmed';
  end if;
  if public.accounting_period_filed_manual(o.org_id, o.period_key) then
    raise exception 'accounting: period is filed_manual locked - amended procedure required';
  end if;
  if exists (
    select 1 from public.accounting_transactions t
    where t.corrects_txn_id = o.id and t.status <> 'cancelled'
  ) then
    raise exception 'accounting: transaction already corrected';
  end if;
  v_amount := (c.correction_payload ->> 'amount_vnd')::numeric;
  if v_amount is null or v_amount <= 0 then
    raise exception 'accounting: correction amount invalid';
  end if;

  insert into public.accounting_transactions (
    org_id, type, status, txn_date, period_key, counterparty_id,
    invoice_series, invoice_no, invoice_date, currency, fx_rate,
    amount_vnd, corrects_txn_id, created_by
  )
  values (
    o.org_id, o.type, 'draft', o.txn_date, o.period_key, o.counterparty_id,
    o.invoice_series, o.invoice_no, o.invoice_date, o.currency, o.fx_rate,
    v_amount, o.id, auth.uid()
  )
  returning id into v_new;

  insert into public.accounting_transaction_lines (txn_id, amount_net, vat_rate, vat_amount)
  select
    v_new,
    round(l.amount_net * v_amount / nullif(o.amount_vnd, 0)),
    l.vat_rate,
    round(coalesce(l.vat_amount, 0) * v_amount / nullif(o.amount_vnd, 0))
  from public.accounting_transaction_lines l
  where l.txn_id = o.id;

  perform public.accounting_confirm_transaction(v_new);

  perform set_config('accounting.correction_flow', 'on', true);
  update public.accounting_review_comments set status = 'resolved' where id = c.id;
  perform set_config('accounting.correction_flow', 'off', true);

  insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id)
  values (c.org_id, auth.uid(), 'CORRECTION_APPROVE', 'accounting_review_comments', c.id);

  return v_new;
end;
$$;

create or replace function public.accounting_reject_correction(
  p_comment_id uuid,
  p_reason text,
  p_lang text default 'ko'
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  c public.accounting_review_comments%rowtype;
begin
  select * into c from public.accounting_review_comments where id = p_comment_id for update;
  if not found then
    raise exception 'accounting: correction request not found';
  end if;
  if c.kind <> 'correction_request' or c.target_type <> 'transaction' then
    raise exception 'accounting: not a transaction correction request';
  end if;
  if not public.accounting_can_use_org_data(c.org_id) then
    raise exception 'accounting: forbidden';
  end if;
  if public.accounting_org_role(c.org_id) is distinct from 'company_owner' then
    raise exception 'accounting: only company_owner may reject correction';
  end if;
  if c.status <> 'open' then
    raise exception 'accounting: correction request already resolved';
  end if;
  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'accounting: rejection reason required';
  end if;
  if p_lang not in ('ko', 'vi') then
    raise exception 'accounting: invalid lang';
  end if;

  insert into public.accounting_i18n_texts (
    org_id, entity_type, entity_id, field, lang, text, status, version, created_by
  )
  values (c.org_id, 'review_comment', c.id, 'reject_reason', p_lang, btrim(p_reason), 'original', 1, auth.uid());

  perform set_config('accounting.correction_flow', 'on', true);
  update public.accounting_review_comments set status = 'resolved' where id = c.id;
  perform set_config('accounting.correction_flow', 'off', true);

  insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id)
  values (c.org_id, auth.uid(), 'CORRECTION_REJECT', 'accounting_review_comments', c.id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Vietnamese confirm (insert-only new version, status=human_verified)
-- Allowed: company_member with profiles.locale='vi' (design §3), or assigned vnk_expert.
-- ---------------------------------------------------------------------------

create or replace function public.accounting_confirm_vi_text(p_txn_id uuid, p_field text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_txn public.accounting_transactions%rowtype;
  v_role text;
  v_prev public.accounting_i18n_texts%rowtype;
  v_new uuid;
begin
  select * into v_txn from public.accounting_transactions where id = p_txn_id;
  if not found then
    raise exception 'accounting: transaction not found';
  end if;
  if not public.accounting_can_use_org_data(v_txn.org_id) then
    raise exception 'accounting: forbidden';
  end if;
  v_role := public.accounting_org_role(v_txn.org_id);
  if not (
    v_role = 'vnk_expert'
    or (
      v_role = 'company_member'
      and exists (
        select 1 from public.accounting_profiles p
        where p.user_id = auth.uid() and p.locale = 'vi'
      )
    )
  ) then
    raise exception 'accounting: vi confirm not allowed for this role/locale';
  end if;
  if p_field not in ('memo', 'description') then
    raise exception 'accounting: invalid field';
  end if;

  select * into v_prev
  from public.accounting_i18n_texts
  where org_id = v_txn.org_id
    and entity_type = 'transaction'
    and entity_id = p_txn_id
    and field = p_field
    and lang = 'vi'
  order by version desc
  limit 1;
  if not found then
    raise exception 'accounting: no vi text to confirm';
  end if;
  if v_prev.status = 'human_verified' then
    raise exception 'accounting: already human_verified';
  end if;

  perform set_config('accounting.vi_confirm', 'on', true);
  insert into public.accounting_i18n_texts (
    org_id, entity_type, entity_id, field, lang, text, status, version,
    translated_from_version, created_by
  )
  values (
    v_txn.org_id, 'transaction', p_txn_id, p_field, 'vi', v_prev.text, 'human_verified',
    v_prev.version + 1, v_prev.translated_from_version, auth.uid()
  )
  returning id into v_new;
  perform set_config('accounting.vi_confirm', 'off', true);

  insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
  values (v_txn.org_id, auth.uid(), 'VI_CONFIRM', 'accounting_i18n_texts', v_new, md5(v_new::text));
  return v_new;
end;
$$;

revoke all on function public.accounting_approve_correction(uuid) from public, anon;
revoke all on function public.accounting_reject_correction(uuid, text, text) from public, anon;
revoke all on function public.accounting_confirm_vi_text(uuid, text) from public, anon;
grant execute on function public.accounting_approve_correction(uuid) to authenticated;
grant execute on function public.accounting_reject_correction(uuid, text, text) to authenticated;
grant execute on function public.accounting_confirm_vi_text(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Assigned vnk_expert may upload filing receipts under {org_id}/filing/ (P6a defect fix)
-- ---------------------------------------------------------------------------

create policy accounting_expert_filing_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'accounting_evidence'
    and (storage.foldername(name))[2] = 'filing'
    and public.accounting_can_use_org_data(((storage.foldername(name))[1])::uuid)
    and public.accounting_org_role(((storage.foldername(name))[1])::uuid) = 'vnk_expert'
  );
