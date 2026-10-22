-- P6a: expert assignments, review comments, filed_manual gates (2026-10-16)

-- ---------------------------------------------------------------------------
-- Expert assignments (vnk_admin write; vnk_expert reads own rows only)
-- ---------------------------------------------------------------------------

create table if not exists public.accounting_expert_assignments (
  id uuid primary key default gen_random_uuid(),
  expert_user_id uuid not null references auth.users (id) on delete cascade,
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (expert_user_id, org_id)
);

create index if not exists accounting_expert_assignments_expert_idx
  on public.accounting_expert_assignments (expert_user_id);

alter table public.accounting_expert_assignments enable row level security;

create policy accounting_expert_assignments_select
  on public.accounting_expert_assignments for select to authenticated
  using (
    public.accounting_is_vnk_admin()
    or expert_user_id = auth.uid()
  );

create policy accounting_expert_assignments_insert_admin
  on public.accounting_expert_assignments for insert to authenticated
  with check (public.accounting_is_vnk_admin() and assigned_by = auth.uid());

create policy accounting_expert_assignments_delete_admin
  on public.accounting_expert_assignments for delete to authenticated
  using (public.accounting_is_vnk_admin());

revoke update on public.accounting_expert_assignments from authenticated;

grant select, insert, delete on public.accounting_expert_assignments to authenticated;

create or replace function public.accounting_expert_assigned(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.accounting_expert_assignments a
    where a.org_id = p_org_id
      and a.expert_user_id = auth.uid()
  );
$$;

create or replace function public.accounting_can_use_org_data(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.accounting_can_access_org(p_org_id)
    and public.accounting_org_approved(p_org_id)
    and (
      public.accounting_org_role(p_org_id) is distinct from 'vnk_expert'
      or public.accounting_expert_assigned(p_org_id)
    );
$$;

-- ---------------------------------------------------------------------------
-- review_comments: kind + target_type constraints
-- ---------------------------------------------------------------------------

alter table public.accounting_review_comments
  add column if not exists kind text not null default 'comment'
    check (kind in ('comment', 'correction_request'));

alter table public.accounting_review_comments
  drop constraint if exists accounting_review_comments_target_type_check;

alter table public.accounting_review_comments
  add constraint accounting_review_comments_target_type_check check (
    target_type in ('declaration', 'transaction', 'adjustment')
  );

drop policy if exists accounting_review_insert_expert on public.accounting_review_comments;

create policy accounting_review_insert
  on public.accounting_review_comments for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and (
      (
        public.accounting_org_role(org_id) = 'vnk_expert'
        and public.accounting_expert_assigned(org_id)
      )
      or public.accounting_org_role(org_id) in ('company_owner', 'company_member')
    )
    and author_id = auth.uid()
  );

create policy accounting_review_resolve
  on public.accounting_review_comments for update to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and status = 'open'
    and (
      author_id = auth.uid()
      or public.accounting_org_role(org_id) = 'company_owner'
    )
  )
  with check (
    status in ('open', 'resolved')
    and (
      author_id = auth.uid()
      or public.accounting_org_role(org_id) = 'company_owner'
    )
  );

-- ---------------------------------------------------------------------------
-- Period lock: transactions (insert/update/delete), declarations.computed
-- ---------------------------------------------------------------------------

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
  if public.accounting_period_filed_manual(v_org, v_period) then
    raise exception 'accounting: period is filed_manual locked';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists accounting_trg_txn_period_lock on public.accounting_transactions;
create trigger accounting_trg_txn_period_lock
  before insert or update or delete on public.accounting_transactions
  for each row execute function public.accounting_guard_txn_period_lock();

create or replace function public.accounting_guard_declaration_computed_lock()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.computed is distinct from new.computed
    and public.accounting_period_filed_manual(new.org_id, new.period_key) then
    raise exception 'accounting: cannot change computed in filed_manual period';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_declaration_computed_lock on public.accounting_declarations;
create trigger accounting_trg_declaration_computed_lock
  before update on public.accounting_declarations
  for each row execute function public.accounting_guard_declaration_computed_lock();

create or replace function public.accounting_guard_declaration_adjustment_period()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period text;
begin
  select d.period_key into v_period
  from public.accounting_declarations d
  where d.id = new.declaration_id;
  if public.accounting_period_filed_manual(new.org_id, v_period) then
    raise exception 'accounting: period is filed_manual locked';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_declaration_adjustment_insert
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_guard_declaration_adjustment_insert
  before insert on public.accounting_declaration_adjustments
  for each row execute function public.accounting_guard_declaration_adjustment_insert();

drop trigger if exists accounting_trg_guard_declaration_adjustment_period
  on public.accounting_declaration_adjustments;
create trigger accounting_trg_guard_declaration_adjustment_period
  before insert on public.accounting_declaration_adjustments
  for each row execute function public.accounting_guard_declaration_adjustment_period();

-- ---------------------------------------------------------------------------
-- expert_review → filed_manual (vnk_expert only; required fields)
-- ---------------------------------------------------------------------------

create or replace function public.accounting_guard_declaration_filed_manual()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status = 'filed_manual' then
    if old.status is distinct from 'expert_review' then
      raise exception 'accounting: filed_manual only from expert_review';
    end if;
    if public.accounting_org_role(new.org_id) is distinct from 'vnk_expert' then
      raise exception 'accounting: only vnk_expert may record filing';
    end if;
    if new.portal_form_basis is null then
      raise exception 'accounting: portal_form_basis required for filing';
    end if;
    if new.filed_at is null then
      raise exception 'accounting: filed_at required for filing';
    end if;
    if new.filing_receipt_path is null or btrim(new.filing_receipt_path) = '' then
      raise exception 'accounting: filing_receipt_path required for filing';
    end if;
    new.filed_by := auth.uid();
  end if;
  if tg_op = 'UPDATE'
    and old.status = 'filed_manual'
    and (
      old.computed is distinct from new.computed
      or old.period_key is distinct from new.period_key
      or old.form_code is distinct from new.form_code
    ) then
    raise exception 'accounting: filed_manual declaration is locked';
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_guard_declaration_filed_manual on public.accounting_declarations;
create trigger accounting_trg_guard_declaration_filed_manual
  before update on public.accounting_declarations
  for each row execute function public.accounting_guard_declaration_filed_manual();

-- vnk_expert may update declarations for assigned orgs (filing + read paths)
drop policy if exists accounting_declarations_rw on public.accounting_declarations;

create policy accounting_declarations_select
  on public.accounting_declarations for select to authenticated
  using (public.accounting_can_use_org_data(org_id));

create policy accounting_declarations_write_company
  on public.accounting_declarations for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_declarations_update_company
  on public.accounting_declarations for update to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
    and status is distinct from 'filed_manual'
  )
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

create policy accounting_declarations_update_expert
  on public.accounting_declarations for update to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) = 'vnk_expert'
    and public.accounting_expert_assigned(org_id)
  )
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) = 'vnk_expert'
    and public.accounting_expert_assigned(org_id)
  );

-- ---------------------------------------------------------------------------
-- Audit triggers
-- ---------------------------------------------------------------------------

create or replace function public.accounting_audit_log_append_org_row()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (new.org_id, auth.uid(), tg_op, tg_table_name, new.id, md5(new::text));
  elsif tg_op = 'UPDATE' then
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash, after_hash)
    values (
      new.org_id,
      auth.uid(),
      tg_op,
      tg_table_name,
      new.id,
      md5(old::text),
      md5(new::text)
    );
  elsif tg_op = 'DELETE' then
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash)
    values (old.org_id, auth.uid(), tg_op, tg_table_name, old.id, md5(old::text));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists accounting_trg_audit_expert_assignments on public.accounting_expert_assignments;
create trigger accounting_trg_audit_expert_assignments
  after insert or delete on public.accounting_expert_assignments
  for each row execute function public.accounting_audit_log_append_org_row();

drop trigger if exists accounting_trg_audit_review_comments on public.accounting_review_comments;
create trigger accounting_trg_audit_review_comments
  after insert or update on public.accounting_review_comments
  for each row execute function public.accounting_audit_log_append_org_row();

drop trigger if exists accounting_trg_audit_declarations on public.accounting_declarations;
create trigger accounting_trg_audit_declarations
  after insert or update on public.accounting_declarations
  for each row execute function public.accounting_audit_log_append_org_row();
