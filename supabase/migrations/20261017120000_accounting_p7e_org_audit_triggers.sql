-- P7e: audit_log for organization create and approval_status changes (existing append function; no function edits).

drop trigger if exists accounting_trg_audit_organizations_insert on public.accounting_organizations;
create trigger accounting_trg_audit_organizations_insert
  after insert on public.accounting_organizations
  for each row execute function public.accounting_audit_log_append();

drop trigger if exists accounting_trg_audit_organizations_approval on public.accounting_organizations;
create trigger accounting_trg_audit_organizations_approval
  after update of approval_status on public.accounting_organizations
  for each row
  when (old.approval_status is distinct from new.approval_status)
  execute function public.accounting_audit_log_append();
