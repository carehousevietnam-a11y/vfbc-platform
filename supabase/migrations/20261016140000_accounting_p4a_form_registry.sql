-- P4a: form registry seeds, deadline rules seeds, legal_reviews insert-only + audit

comment on table public.accounting_form_versions is
  'Global form registry (not org-scoped). RLS does not filter by org_id.';
comment on table public.accounting_deadline_rules is
  'Global filing deadline rules (not org-scoped). Read-only for app users.';
comment on table public.accounting_legal_reviews is
  'Global legal review log (not org-scoped). Insert-only for vnk_admin.';

create unique index if not exists accounting_form_versions_form_code_key
  on public.accounting_form_versions (form_code);

-- Authenticated users may read forms; writes remain vnk_admin-only (existing policies).
drop policy if exists accounting_form_versions_select on public.accounting_form_versions;
create policy accounting_form_versions_select
  on public.accounting_form_versions for select to authenticated
  using (auth.uid() is not null);

-- Deadline rules: read-only for authenticated (seeds via migration / service_role only).
drop policy if exists accounting_deadline_admin_write on public.accounting_deadline_rules;
revoke insert, update, delete on public.accounting_deadline_rules from authenticated;

-- legal_reviews: insert-only for vnk_admin
drop policy if exists accounting_legal_reviews_admin_write on public.accounting_legal_reviews;

create policy accounting_legal_reviews_insert
  on public.accounting_legal_reviews for insert to authenticated
  with check (public.accounting_is_vnk_admin());

revoke update, delete on public.accounting_legal_reviews from authenticated;

create or replace function public.accounting_deny_legal_reviews_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'accounting: legal_reviews is insert-only';
end;
$$;

drop trigger if exists accounting_trg_deny_legal_reviews_update on public.accounting_legal_reviews;
create trigger accounting_trg_deny_legal_reviews_update
  before update on public.accounting_legal_reviews
  for each row execute function public.accounting_deny_legal_reviews_mutation();

drop trigger if exists accounting_trg_deny_legal_reviews_delete on public.accounting_legal_reviews;
create trigger accounting_trg_deny_legal_reviews_delete
  before delete on public.accounting_legal_reviews
  for each row execute function public.accounting_deny_legal_reviews_mutation();

create or replace function public.accounting_audit_log_append_legal_review()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.accounting_audit_log (org_id, actor, action, entity, entity_id, after_hash)
    values (null, auth.uid(), tg_op, tg_table_name, new.id, md5(new::text));
  end if;
  return new;
end;
$$;

drop trigger if exists accounting_trg_audit_legal_reviews on public.accounting_legal_reviews;
create trigger accounting_trg_audit_legal_reviews
  after insert on public.accounting_legal_reviews
  for each row execute function public.accounting_audit_log_append_legal_review();

-- Form seeds (pending_verification, empty field_map, no template)
insert into public.accounting_form_versions (
  form_code, name_ko, name_vi, legal_basis, effective_from, status, field_map, template_path
)
values
  (
    '01/GTGT',
    '부가가치세 공제 방식',
    'Thuế GTGT phương pháp khấu trừ',
    'Thông tư 89/2026/TT-BTC (hiệu lực 2026-07-01); Luật Quản lý thuế 108/2025/QH15; Nghị định 252/2026/NĐ-CP',
    '2026-07-01',
    'pending_verification',
    '{}'::jsonb,
    null
  ),
  (
    '04/GTGT',
    '부가가치세 직접 방식',
    'Thuế GTGT phương pháp trực tiếp',
    'Thông tư 89/2026/TT-BTC (hiệu lực 2026-07-01); Luật Quản lý thuế 108/2025/QH15; Nghị định 252/2026/NĐ-CP',
    '2026-07-01',
    'pending_verification',
    '{}'::jsonb,
    null
  ),
  (
    '05/KK-TNCN',
    '급여 원천 소득세',
    'Thuế TNCN khấu trừ từ tiền lương',
    'Thông tư 89/2026/TT-BTC (hiệu lực 2026-07-01); Luật Quản lý thuế 108/2025/QH15; Nghị định 252/2026/NĐ-CP',
    '2026-07-01',
    'pending_verification',
    '{}'::jsonb,
    null
  ),
  (
    '05/QTT-TNCN',
    '급여 원천 소득세 연말정산',
    'Quyết toán thuế TNCN từ tiền lương',
    'Thông tư 89/2026/TT-BTC (hiệu lực 2026-07-01); Luật Quản lý thuế 108/2025/QH15; Nghị định 252/2026/NĐ-CP',
    '2026-07-01',
    'pending_verification',
    '{}'::jsonb,
    null
  ),
  (
    'CIT_UNVERIFIED',
    '법인세(서식 번호 미확인)',
    'Thuế TNDN (mã biểu chưa xác minh)',
    'Thông tư 20/2026/TT-BTC; Nghị định 320/2025/NĐ-CP',
    '2026-07-01',
    'pending_verification',
    '{}'::jsonb,
    null
  )
on conflict (form_code) do update set
  name_ko = excluded.name_ko,
  name_vi = excluded.name_vi,
  legal_basis = excluded.legal_basis,
  effective_from = excluded.effective_from,
  status = excluded.status,
  field_map = excluded.field_map,
  template_path = excluded.template_path;

-- Deadline rule seeds (verified_status unverified)
insert into public.accounting_deadline_rules (tax_type, period_kind, rule, legal_source, verified_status)
select * from (
  values
    (
      'vat',
      'monthly',
      '{"due":"month_following_day_20","note":"부가가치세 월 신고"}'::jsonb,
      'ACCOUNTING_MODULE_DESIGN §7 (2차 출처, 원문 대조 전)',
      'unverified'
    ),
    (
      'vat',
      'quarterly',
      '{"due":"first_month_next_quarter_end","note":"부가가치세 분기 신고"}'::jsonb,
      'ACCOUNTING_MODULE_DESIGN §7 (2차 출처, 원문 대조 전)',
      'unverified'
    ),
    (
      'cit',
      'quarterly_prepayment',
      '{"due":"first_month_next_quarter_day_30","note":"법인세 분기 가납"}'::jsonb,
      'ACCOUNTING_MODULE_DESIGN §7 (2차 출처, 원문 대조 전)',
      'unverified'
    ),
    (
      'cit',
      'annual',
      '{"due":"third_month_after_fy_end","note":"법인세 연간 결산·재무제표"}'::jsonb,
      'ACCOUNTING_MODULE_DESIGN §7 (2차 출처, 원문 대조 전)',
      'unverified'
    ),
    (
      'pit_withholding',
      'quarterly',
      '{"due":"first_month_next_quarter_end","note":"소득세(원천징수) 분기"}'::jsonb,
      'ACCOUNTING_MODULE_DESIGN §7 (2차 출처, 원문 대조 전)',
      'unverified'
    ),
    (
      'all',
      'holiday_shift',
      '{"rule":"next_business_day_if_holiday","legal":"Nghị định 252/2026/NĐ-CP Điều 3 khoản 7"}'::jsonb,
      'Nghị định 252/2026/NĐ-CP Điều 3 khoản 7',
      'unverified'
    )
) as v(tax_type, period_kind, rule, legal_source, verified_status)
where not exists (
  select 1
  from public.accounting_deadline_rules d
  where d.tax_type = v.tax_type and d.period_kind = v.period_kind
);
