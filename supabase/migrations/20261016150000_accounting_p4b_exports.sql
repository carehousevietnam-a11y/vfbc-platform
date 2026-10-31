-- P4b-1: export framework (ledger Excel). Private bucket, org-scoped read, insert-only exports, audit trigger.
-- accounting_exports.form_version_id is already nullable (P1); no column change.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'accounting_exports',
  'accounting_exports',
  false,
  10485760,
  array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Read only for approved org members (first path segment = org_id). Writes happen server-side (service role) only.
create policy accounting_exports_storage_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'accounting_exports'
    and public.accounting_can_use_org_data(((storage.foldername(name))[1])::uuid)
  );

create or replace function public.accounting_guard_exports_immutable()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception 'accounting: exports is insert-only';
end;
$$;

revoke execute on function public.accounting_guard_exports_immutable() from public, anon, authenticated;

drop trigger if exists accounting_trg_deny_exports_mutate on public.accounting_exports;
create trigger accounting_trg_deny_exports_mutate
  before update or delete on public.accounting_exports
  for each row execute function public.accounting_guard_exports_immutable();

drop trigger if exists accounting_trg_audit_exports on public.accounting_exports;
create trigger accounting_trg_audit_exports
  after insert on public.accounting_exports
  for each row execute function public.accounting_audit_log_append_evidence();
