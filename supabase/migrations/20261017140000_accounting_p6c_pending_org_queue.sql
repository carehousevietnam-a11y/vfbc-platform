-- P6c: vnk_expert / vnk_admin may list and resolve pending org approvals without prior org membership.

create or replace function public.accounting_is_vnk_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.accounting_org_members m
    where m.user_id = auth.uid()
      and m.role in ('vnk_expert', 'vnk_admin')
  );
$$;

alter function public.accounting_is_vnk_staff() set search_path = public, pg_temp;

create policy accounting_orgs_select_pending_staff
  on public.accounting_organizations for select to authenticated
  using (approval_status = 'pending' and public.accounting_is_vnk_staff());

create policy accounting_orgs_update_approval_staff_pending
  on public.accounting_organizations for update to authenticated
  using (approval_status = 'pending' and public.accounting_is_vnk_staff())
  with check (
    public.accounting_is_vnk_staff()
    and approval_status in ('approved', 'rejected')
  );

create policy accounting_org_members_insert_expert_self
  on public.accounting_org_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'vnk_expert'
    and public.accounting_is_vnk_staff()
    and exists (
      select 1
      from public.accounting_organizations o
      where o.id = org_id
        and o.approval_status = 'approved'
    )
  );

create policy accounting_expert_assignments_insert_expert_self
  on public.accounting_expert_assignments for insert to authenticated
  with check (
    expert_user_id = auth.uid()
    and assigned_by = auth.uid()
    and public.accounting_is_vnk_staff()
    and exists (
      select 1
      from public.accounting_organizations o
      where o.id = org_id
        and o.approval_status = 'approved'
    )
  );
