create policy accounting_orgs_select_vnk_staff
  on public.accounting_organizations for select to authenticated
  using (public.accounting_is_vnk_staff());
