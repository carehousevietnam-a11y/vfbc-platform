-- P2-b: evidence insert-only, bucket limits, audit; P2-a hardening: search_path public, pg_temp on definer helpers.

alter table public.accounting_evidence_files
  add column if not exists display_name text;

-- search_path hardening (existing bodies unchanged)
alter function public.accounting_is_business_member() set search_path = public, pg_temp;
alter function public.accounting_org_role(uuid) set search_path = public, pg_temp;
alter function public.accounting_can_access_org(uuid) set search_path = public, pg_temp;
alter function public.accounting_org_approved(uuid) set search_path = public, pg_temp;
alter function public.accounting_can_use_org_data(uuid) set search_path = public, pg_temp;
alter function public.accounting_is_vnk_reviewer(uuid) set search_path = public, pg_temp;
alter function public.accounting_is_vnk_admin() set search_path = public, pg_temp;
alter function public.accounting_guard_confirmed_transaction() set search_path = public, pg_temp;
alter function public.accounting_audit_log_append() set search_path = public, pg_temp;
alter function public.accounting_guard_org_approval_status() set search_path = public, pg_temp;
alter function public.accounting_can_read_company_signup_profile(uuid) set search_path = public, pg_temp;
alter function public.accounting_stamp_transaction_actor() set search_path = public, pg_temp;

create or replace function public.accounting_guard_evidence_immutable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception 'accounting: evidence_files is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_evidence_mutate on public.accounting_evidence_files;
create trigger accounting_trg_deny_evidence_mutate
  before update or delete on public.accounting_evidence_files
  for each row execute function public.accounting_guard_evidence_immutable();

create or replace function public.accounting_audit_log_append_evidence()
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

drop trigger if exists accounting_trg_audit_evidence on public.accounting_evidence_files;
create trigger accounting_trg_audit_evidence
  after insert on public.accounting_evidence_files
  for each row execute function public.accounting_audit_log_append_evidence();

drop policy if exists accounting_evidence_write on public.accounting_evidence_files;
create policy accounting_evidence_insert
  on public.accounting_evidence_files for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and public.accounting_org_role(org_id) in ('company_owner', 'company_member')
  );

revoke update, delete on public.accounting_evidence_files from authenticated;
grant select, insert on public.accounting_evidence_files to authenticated;

update storage.buckets
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'accounting_evidence';

drop policy if exists accounting_evidence_storage_delete on storage.objects;
