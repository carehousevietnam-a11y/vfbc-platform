-- P7-2b: organization registration documents + in_review approval flow (local only).

alter table public.accounting_organizations
  drop constraint if exists accounting_organizations_approval_status_check;

alter table public.accounting_organizations
  add constraint accounting_organizations_approval_status_check
  check (approval_status in ('pending', 'in_review', 'approved', 'rejected'));

create table if not exists public.accounting_org_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.accounting_organizations (id) on delete cascade,
  doc_kind text not null check (doc_kind in ('business_registration', 'investment_registration')),
  storage_path text not null,
  sha256 text not null,
  mime text not null,
  size integer not null check (size > 0),
  uploaded_by uuid not null references auth.users (id),
  uploaded_at timestamptz not null default now(),
  unique (org_id, doc_kind)
);

create index if not exists accounting_org_documents_org_idx
  on public.accounting_org_documents (org_id);

create or replace function public.accounting_org_registration_open(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.accounting_organizations o
    where o.id = p_org_id
      and o.approval_status in ('pending', 'rejected')
  );
$$;

create or replace function public.accounting_can_view_org_documents(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.accounting_can_access_org(p_org_id)
    and (
      (
        public.accounting_org_role(p_org_id) = 'company_owner'
        and exists (
          select 1 from public.accounting_organizations o
          where o.id = p_org_id
            and o.approval_status in ('pending', 'rejected', 'in_review')
        )
      )
      or (
        public.accounting_is_vnk_staff()
        and exists (
          select 1 from public.accounting_organizations o
          where o.id = p_org_id
            and o.approval_status in ('in_review', 'approved', 'rejected')
        )
      )
    );
$$;

create or replace function public.accounting_can_upload_org_documents(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.accounting_org_role(p_org_id) = 'company_owner'
    and public.accounting_org_registration_open(p_org_id);
$$;

alter table public.accounting_org_documents enable row level security;

create policy accounting_org_documents_select
  on public.accounting_org_documents for select to authenticated
  using (public.accounting_can_view_org_documents(org_id));

create policy accounting_org_documents_insert
  on public.accounting_org_documents for insert to authenticated
  with check (public.accounting_can_upload_org_documents(org_id));

create policy accounting_org_documents_update
  on public.accounting_org_documents for update to authenticated
  using (public.accounting_can_upload_org_documents(org_id))
  with check (public.accounting_can_upload_org_documents(org_id));

create policy accounting_org_documents_delete
  on public.accounting_org_documents for delete to authenticated
  using (public.accounting_can_upload_org_documents(org_id));

drop policy if exists accounting_orgs_select_pending_staff on public.accounting_organizations;
create policy accounting_orgs_select_pending_staff
  on public.accounting_organizations for select to authenticated
  using (
    approval_status in ('pending', 'in_review')
    and public.accounting_is_vnk_staff()
  );

drop policy if exists accounting_orgs_update_approval_staff_pending on public.accounting_organizations;
create policy accounting_orgs_update_approval_staff_in_review
  on public.accounting_organizations for update to authenticated
  using (approval_status = 'in_review' and public.accounting_is_vnk_staff())
  with check (
    public.accounting_is_vnk_staff()
    and approval_status in ('approved', 'rejected')
  );

create or replace function public.accounting_guard_org_approval_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.approval_status is distinct from new.approval_status then
    if current_setting('accounting.allow_org_review_request', true) = old.id::text
      and old.approval_status in ('pending', 'rejected')
      and new.approval_status = 'in_review' then
      return new;
    end if;
    if public.accounting_is_vnk_staff()
      and old.approval_status = 'in_review'
      and new.approval_status in ('approved', 'rejected') then
      return new;
    end if;
    if old.approval_status = 'pending' and new.approval_status in ('approved', 'rejected') then
      raise exception 'accounting: org must be in_review before expert resolution';
    end if;
    if old.approval_status = 'pending' and new.approval_status = 'approved' then
      raise exception 'accounting: org must be in_review before approval';
    end if;
    if not public.accounting_is_vnk_reviewer(old.id)
      and not (
        public.accounting_is_vnk_staff()
        and old.approval_status = 'in_review'
        and new.approval_status in ('approved', 'rejected')
      ) then
      raise exception 'accounting: only vnk_expert or vnk_admin may change approval_status';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.accounting_org_request_review(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_role text;
  v_business int;
  v_invest int;
begin
  if auth.uid() is null then
    raise exception 'accounting: unauthenticated';
  end if;
  v_role := public.accounting_org_role(p_org_id);
  if v_role is distinct from 'company_owner' then
    raise exception 'accounting: owner only';
  end if;
  select approval_status into v_status
  from public.accounting_organizations
  where id = p_org_id;
  if v_status not in ('pending', 'rejected') then
    raise exception 'accounting: cannot request review in this status';
  end if;
  select count(*) into v_business
  from public.accounting_org_documents
  where org_id = p_org_id and doc_kind = 'business_registration';
  select count(*) into v_invest
  from public.accounting_org_documents
  where org_id = p_org_id and doc_kind = 'investment_registration';
  if v_business < 1 or v_invest < 1 then
    raise exception 'accounting: both registration documents required';
  end if;
  perform set_config('accounting.allow_org_review_request', p_org_id::text, true);
  update public.accounting_organizations
  set approval_status = 'in_review', updated_at = now()
  where id = p_org_id;
  perform set_config('accounting.allow_org_review_request', '', true);
end;
$$;

grant execute on function public.accounting_org_request_review(uuid) to authenticated;

create policy accounting_evidence_storage_org_docs_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'accounting_evidence'
    and (storage.foldername(name))[2] = 'org-docs'
    and public.accounting_can_view_org_documents(((storage.foldername(name))[1])::uuid)
  );

create policy accounting_evidence_storage_org_docs_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'accounting_evidence'
    and (storage.foldername(name))[2] = 'org-docs'
    and public.accounting_can_upload_org_documents(((storage.foldername(name))[1])::uuid)
  );

create policy accounting_evidence_storage_org_docs_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'accounting_evidence'
    and (storage.foldername(name))[2] = 'org-docs'
    and public.accounting_can_upload_org_documents(((storage.foldername(name))[1])::uuid)
  );

grant select, insert, update, delete on public.accounting_org_documents to authenticated;

drop trigger if exists accounting_trg_audit_org_documents on public.accounting_org_documents;
create trigger accounting_trg_audit_org_documents
  after insert or update or delete on public.accounting_org_documents
  for each row execute function public.accounting_audit_log_append();
