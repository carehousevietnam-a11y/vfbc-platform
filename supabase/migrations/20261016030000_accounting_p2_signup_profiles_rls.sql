-- P2 security hardening: signup profile RLS + one company_owner org per user

drop policy if exists accounting_company_signup_profiles_select_own
  on public.accounting_company_signup_profiles;

create or replace function public.accounting_can_read_company_signup_profile(p_target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.accounting_org_members viewer
    join public.accounting_org_members target
      on viewer.org_id = target.org_id
    where viewer.user_id = auth.uid()
      and viewer.role = 'company_owner'
      and target.user_id = p_target_user_id
  );
$$;

create policy accounting_company_signup_profiles_select_own
  on public.accounting_company_signup_profiles for select to authenticated
  using (auth.uid() = user_id);

create policy accounting_company_signup_profiles_select_org_owner
  on public.accounting_company_signup_profiles for select to authenticated
  using (public.accounting_can_read_company_signup_profile(user_id));

revoke insert, update, delete on public.accounting_company_signup_profiles from authenticated;
revoke insert, update, delete on public.accounting_company_signup_profiles from anon;

create unique index if not exists accounting_org_members_one_company_owner_per_user
  on public.accounting_org_members (user_id)
  where role = 'company_owner';
