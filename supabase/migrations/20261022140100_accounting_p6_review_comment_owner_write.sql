-- P6-2: company_member review comment insert read-only; resolve owner-only at app layer.

drop policy if exists accounting_review_insert on public.accounting_review_comments;

create policy accounting_review_insert
  on public.accounting_review_comments for insert to authenticated
  with check (
    public.accounting_can_use_org_data(org_id)
    and (
      (
        public.accounting_org_role(org_id) = 'vnk_expert'
        and public.accounting_expert_assigned(org_id)
      )
      or public.accounting_org_role(org_id) = 'company_owner'
    )
    and author_id = auth.uid()
  );

drop policy if exists accounting_review_resolve on public.accounting_review_comments;

create policy accounting_review_resolve
  on public.accounting_review_comments for update to authenticated
  using (
    public.accounting_can_use_org_data(org_id)
    and status = 'open'
    and public.accounting_org_role(org_id) = 'company_owner'
  )
  with check (
    status in ('open', 'resolved')
    and public.accounting_org_role(org_id) = 'company_owner'
  );
