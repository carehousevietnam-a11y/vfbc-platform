-- P6-3a: confirm Vietnamese i18n text for transaction memo/description and review_comment body

create or replace function public.accounting_confirm_vi_i18n_text(
  p_entity_type text,
  p_entity_id uuid,
  p_field text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org uuid;
  v_role text;
  v_prev public.accounting_i18n_texts%rowtype;
  v_new uuid;
begin
  if p_entity_type = 'transaction' then
    select org_id into v_org from public.accounting_transactions where id = p_entity_id;
    if not found then
      raise exception 'accounting: entity not found';
    end if;
    if p_field not in ('memo', 'description') then
      raise exception 'accounting: invalid field';
    end if;
  elsif p_entity_type = 'review_comment' then
    select org_id into v_org from public.accounting_review_comments where id = p_entity_id;
    if not found then
      raise exception 'accounting: entity not found';
    end if;
    if p_field <> 'body' then
      raise exception 'accounting: invalid field';
    end if;
  else
    raise exception 'accounting: invalid entity_type';
  end if;

  if not public.accounting_can_use_org_data(v_org) then
    raise exception 'accounting: forbidden';
  end if;
  v_role := public.accounting_org_role(v_org);
  if not (
    v_role = 'vnk_expert'
    or (
      v_role = 'company_member'
      and exists (
        select 1 from public.accounting_profiles p
        where p.user_id = auth.uid() and p.locale = 'vi'
      )
    )
  ) then
    raise exception 'accounting: vi confirm not allowed for this role/locale';
  end if;

  select * into v_prev
  from public.accounting_i18n_texts
  where org_id = v_org
    and entity_type = p_entity_type
    and entity_id = p_entity_id
    and field = p_field
    and lang = 'vi'
  order by version desc
  limit 1;
  if not found then
    raise exception 'accounting: no vi text to confirm';
  end if;
  if v_prev.status = 'human_verified' then
    raise exception 'accounting: already human_verified';
  end if;

  perform set_config('accounting.vi_confirm', 'on', true);
  insert into public.accounting_i18n_texts (
    org_id, entity_type, entity_id, field, lang, text, status, version,
    translated_from_version, created_by
  )
  values (
    v_org, p_entity_type, p_entity_id, p_field, 'vi', v_prev.text, 'human_verified',
    v_prev.version + 1, v_prev.translated_from_version, auth.uid()
  )
  returning id into v_new;
  perform set_config('accounting.vi_confirm', 'off', true);

  insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
  values (v_org, auth.uid(), 'VI_CONFIRM', 'accounting_i18n_texts', v_new, md5(v_new::text));
  return v_new;
end;
$$;

revoke all on function public.accounting_confirm_vi_i18n_text(text, uuid, text) from public, anon;
grant execute on function public.accounting_confirm_vi_i18n_text(text, uuid, text) to authenticated;
