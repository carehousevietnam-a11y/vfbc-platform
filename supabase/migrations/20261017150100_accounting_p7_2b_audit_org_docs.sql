-- P7-2b: audit_log org_id for org_documents rows.

create or replace function public.accounting_audit_log_append()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_entity_id uuid;
begin
  if tg_op = 'INSERT' then
    v_entity_id := new.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_organizations' then
      v_org_id := new.id;
    elsif tg_table_name = 'accounting_org_documents' then
      v_org_id := new.org_id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (v_org_id, auth.uid(), tg_op, tg_table_name, v_entity_id, md5(new::text));
  elsif tg_op = 'UPDATE' then
    v_entity_id := new.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := new.org_id;
    elsif tg_table_name = 'accounting_org_documents' then
      v_org_id := new.org_id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash, after_hash)
    values (
      v_org_id,
      auth.uid(),
      tg_op,
      tg_table_name,
      v_entity_id,
      md5(old::text),
      md5(new::text)
    );
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
    if tg_table_name = 'accounting_transactions' then
      v_org_id := old.org_id;
    elsif tg_table_name = 'accounting_org_documents' then
      v_org_id := old.org_id;
    else
      v_org_id := null;
    end if;
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, before_hash)
    values (v_org_id, auth.uid(), tg_op, tg_table_name, v_entity_id, md5(old::text));
  end if;
  return coalesce(new, old);
end;
$$;
