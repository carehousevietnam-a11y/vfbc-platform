-- P6c: allow global vnk staff to change approval_status on pending orgs (not only org members).

create or replace function public.accounting_guard_org_approval_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE'
    and old.approval_status is distinct from new.approval_status
    and not public.accounting_is_vnk_reviewer(old.id)
    and not (old.approval_status = 'pending' and public.accounting_is_vnk_staff()) then
    raise exception 'accounting: only vnk_expert or vnk_admin may change approval_status';
  end if;
  return new;
end;
$$;

alter function public.accounting_guard_org_approval_status() set search_path = public, pg_temp;
