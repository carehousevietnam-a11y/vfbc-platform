-- P2-a: revoke anon/public execute on signup-profile reader; stamp txn actors from auth.uid().
-- Does not apply to production until Ace approves.

revoke all on function public.accounting_can_read_company_signup_profile(uuid) from public;
revoke all on function public.accounting_can_read_company_signup_profile(uuid) from anon;
grant execute on function public.accounting_can_read_company_signup_profile(uuid) to authenticated;

create or replace function public.accounting_stamp_transaction_actor()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
  else
    new.created_by := old.created_by;
    new.org_id := old.org_id;
  end if;
  if new.status = 'confirmed'
    and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    new.confirmed_by := auth.uid();
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.accounting_stamp_transaction_actor() from public;
revoke all on function public.accounting_stamp_transaction_actor() from anon;
revoke all on function public.accounting_stamp_transaction_actor() from authenticated;

drop trigger if exists accounting_trg_stamp_txn_actor on public.accounting_transactions;
create trigger accounting_trg_stamp_txn_actor
  before insert or update on public.accounting_transactions
  for each row execute function public.accounting_stamp_transaction_actor();
