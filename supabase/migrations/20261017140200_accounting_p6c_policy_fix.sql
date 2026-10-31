drop policy if exists accounting_orgs_update_approval_staff_pending on public.accounting_organizations;

create policy accounting_orgs_update_approval_staff_pending
  on public.accounting_organizations for update to authenticated
  using (approval_status = 'pending' and public.accounting_is_vnk_staff())
  with check (public.accounting_is_vnk_staff());
