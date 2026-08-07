-- STEP21-3 — AI Case Intelligence SQL 무결성 강화 (운영 최종본)
--
-- ⚠️ 실행 전 반드시 아래 두 확인 쿼리를 먼저 따로 실행해서 결과를 확인하세요.
--
--   -- (1) 기존 테이블 존재 여부
--   select table_name
--   from information_schema.tables
--   where table_schema='public' and table_name in ('case_conversations','case_knowledge');
--
--   -- (2) leads.id 실제 타입
--   select column_name, data_type, udt_name
--   from information_schema.columns
--   where table_schema='public' and table_name='leads' and column_name='id';
--
-- [STEP21-3에서 STEP21-2 대비 바뀐 것]
--   1) case_status/result_status 규칙 강화:
--        ongoing → result_status는 반드시 NULL
--        closed  → result_status는 반드시 NOT NULL
--      (이전에는 ongoing이어도 result_status가 남아있는 게 허용됐다 — 잘못된 상태)
--   2) 세 핵심 제약(status consistency / publish consistency / lead_id unique)은
--      더 이상 "위반 데이터 있으면 NOTICE만 남기고 건너뛰기"를 하지 않는다.
--      위반이 발견되면 그 즉시 RAISE EXCEPTION으로 마이그레이션 전체를
--      중단한다(트랜잭션이 통째로 롤백됨 — 부분 적용 없음). 데이터를
--      자동으로 고치거나 지우거나 병합하지 않는다.
--   3) constraint 존재 확인을 conname(이름)만으로 하지 않고, 반드시
--      conrelid='public.case_knowledge'::regclass로 테이블까지 확인한다.
--   4) 게시(publish) 조건 강화: case_status='closed'뿐 아니라
--      reviewed_at/reviewed_by/published_at/published_by가 전부 NOT NULL이고
--      needs_manual_review=false여야만 is_published=true를 허용한다(DB CHECK).
--
-- 이 파일은 자동 실행되지 않습니다. Supabase Dashboard → SQL Editor에서
-- 직접 실행해주세요. leads/users/crm_activities 등 기존 테이블은 이
-- 스크립트 어디에서도 ALTER하지 않습니다. Application Code는 이번
-- STEP에서 전혀 수정하지 않았습니다(SQL만 변경).

do $$
declare
  v_lead_id_type    text;
  v_conv_exists     boolean;
  v_know_exists     boolean;
  v_conv_rows       bigint := 0;
  v_know_rows       bigint := 0;
  v_dup_lead_groups bigint := 0;
  v_bad_consistency bigint := 0;
  v_bad_publish     bigint := 0;
begin
  -- ── 0. leads.id 타입 감지 (추측하지 않음) ──
  select data_type into v_lead_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'leads' and column_name = 'id';

  if v_lead_id_type is null then
    raise exception '[STEP21-3] public.leads.id 컬럼을 찾을 수 없습니다 — 마이그레이션을 중단합니다.';
  end if;
  raise notice '[STEP21-3] Detected public.leads.id type: %', v_lead_id_type;

  -- ── 1. 기존 테이블 존재 여부 + 데이터 건수 확인 ──
  select exists(
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'case_conversations'
  ) into v_conv_exists;

  select exists(
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'case_knowledge'
  ) into v_know_exists;

  if v_conv_exists then
    execute 'select count(*) from case_conversations' into v_conv_rows;
  end if;
  if v_know_exists then
    execute 'select count(*) from case_knowledge' into v_know_rows;
  end if;

  raise notice '[STEP21-3] case_conversations: exists=%, rows=%', v_conv_exists, v_conv_rows;
  raise notice '[STEP21-3] case_knowledge: exists=%, rows=%', v_know_exists, v_know_rows;

  -- ============================================================
  -- case_conversations (STEP21-2와 동일 — 이번 스텝의 무결성 강화 대상 아님)
  -- ============================================================
  if not v_conv_exists or v_conv_rows = 0 then
    if v_conv_exists then
      raise notice '[STEP21-3] case_conversations: 데이터 없음 — DROP 후 재생성';
      execute 'drop table case_conversations';
    else
      raise notice '[STEP21-3] case_conversations: 신규 생성';
    end if;

    execute format($f$
      create table case_conversations (
        id uuid primary key default gen_random_uuid(),
        lead_id %1$s not null references leads(id) on delete cascade,
        role text not null check (role in ('user', 'assistant')),
        content text not null,
        seq bigint generated always as identity,
        created_at timestamptz not null default now()
      )
    $f$, v_lead_id_type);
  else
    raise notice '[STEP21-3] case_conversations: 데이터 %건 존재 — ALTER 마이그레이션 적용', v_conv_rows;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_conversations' and column_name = 'seq'
    ) then
      execute 'alter table case_conversations add column seq bigint generated always as identity';
      raise notice '[STEP21-3] case_conversations.seq 추가 완료(기존 행은 Postgres가 자동으로 순번 채움)';
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_conversations'
        and column_name = 'conversation_index' and is_nullable = 'NO'
    ) then
      execute 'alter table case_conversations alter column conversation_index drop not null';
      raise notice '[STEP21-3] case_conversations.conversation_index NOT NULL 해제(컬럼/값 보존)';
    end if;
  end if;

  -- ============================================================
  -- case_knowledge
  -- ============================================================
  if not v_know_exists or v_know_rows = 0 then
    -- A) 없음, B) 있지만 비어 있음 → 안전하게 (재)생성. 데이터가 없으므로
    --    새 무결성 규칙을 CREATE TABLE에 바로 박아 넣어도 위반 데이터가
    --    있을 수 없다 — 검증 없이 바로 최종 스키마로 만든다.
    if v_know_exists then
      raise notice '[STEP21-3] case_knowledge: 데이터 없음 — DROP 후 재생성';
      execute 'drop table case_knowledge';
    else
      raise notice '[STEP21-3] case_knowledge: 신규 생성';
    end if;

    execute format($f$
      create table case_knowledge (
        id uuid primary key default gen_random_uuid(),
        lead_id %1$s references leads(id) on delete set null,

        service_type text not null,
        category text not null check (category in ('check', 'verify', 'register', 'consultation', 'unclassified')),
        country text not null default 'VN',
        province text,
        industry text,

        question text not null,
        ai_answer text not null,
        expert_review text,
        final_result text,

        case_status text not null default 'closed' check (case_status in ('ongoing', 'closed')),
        result_status text check (
          result_status in ('success', 'rejected', 'withdrawn', 'success_after_supplement')
        ),
        -- [STEP21-3] 강화된 규칙: ongoing이면 result_status는 반드시 NULL,
        -- closed면 반드시 NOT NULL(둘 중 하나만 허용하던 이전 규칙보다 엄격).
        constraint case_knowledge_status_consistency check (
          (case_status = 'ongoing' and result_status is null) or
          (case_status = 'closed' and result_status is not null)
        ),

        rejection_reason text,
        processing_days integer,

        related_documents jsonb not null default '[]'::jsonb,
        related_laws jsonb not null default '[]'::jsonb,

        confidence numeric,

        pii_redaction_version text not null default 'v2',
        needs_manual_review boolean not null default true,
        is_published boolean not null default false,
        reviewed_by text,
        reviewed_at timestamptz,
        published_by text,
        published_at timestamptz,

        -- [STEP21-3] 게시 조건 강화: case_status=closed뿐 아니라 검토·게시
        -- 이력 4개 필드가 전부 채워져 있고 needs_manual_review=false여야만
        -- is_published=true를 허용한다.
        constraint case_knowledge_publish_consistency check (
          (is_published = false) or (
            case_status = 'closed'
            and needs_manual_review = false
            and reviewed_at is not null
            and reviewed_by is not null
            and published_at is not null
            and published_by is not null
          )
        ),

        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),

        constraint case_knowledge_lead_id_unique unique (lead_id)
      )
    $f$, v_lead_id_type);
  else
    -- C) 데이터 있음 → ALTER로만 업그레이드, DROP 금지.
    -- [STEP21-3] 세 핵심 제약(상태 일관성/게시 일관성/lead_id 유일성)은
    -- 위반 데이터가 있으면 더 이상 건너뛰지 않는다 — 즉시 RAISE EXCEPTION으로
    -- 전체 마이그레이션을 중단한다(이 DO 블록·이 스크립트 전체가 하나의
    -- 트랜잭션이므로, 예외가 발생하면 이번 실행에서 이미 적용된 다른 변경도
    -- 함께 롤백된다 — 부분 적용 없이 항상 "전부 성공" 아니면 "전부 취소").
    raise notice '[STEP21-3] case_knowledge: 데이터 %건 존재 — ALTER 마이그레이션 적용', v_know_rows;

    -- 1) case_status 컬럼 추가 (없을 때만)
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_knowledge' and column_name = 'case_status'
    ) then
      execute $c$ alter table case_knowledge add column case_status text not null default 'closed' $c$;
      raise notice '[STEP21-3] case_knowledge.case_status 추가 완료(기존 행 전부 기본값 closed)';
    end if;

    -- 2) 레거시 in_supplement 재분류(정보 이동, 삭제 아님) — STEP21-2와 동일.
    --    이 단계에서 case_status='ongoing', result_status=null로 맞춰지므로
    --    아래 5번의 강화된 일관성 검사를 통과하는 데도 도움이 된다.
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_knowledge' and column_name = 'result_status'
    ) then
      execute $u$
        update case_knowledge
        set case_status = 'ongoing', result_status = null
        where result_status = 'in_supplement'
      $u$;
      raise notice '[STEP21-3] result_status=in_supplement 행 재분류 완료(case_status=ongoing으로 이동)';
    end if;

    -- 3) published_by / published_at 컬럼 추가 (없을 때만)
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_knowledge' and column_name = 'published_by'
    ) then
      execute 'alter table case_knowledge add column published_by text';
    end if;
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'case_knowledge' and column_name = 'published_at'
    ) then
      execute 'alter table case_knowledge add column published_at timestamptz';
    end if;

    -- 4) result_status CHECK 제약 재생성(in_supplement 제거) — public.case_knowledge에
    --    속한 것인지 conrelid로 확인 후 처리.
    if exists (
      select 1 from pg_constraint
      where conname = 'case_knowledge_result_status_check'
        and conrelid = 'public.case_knowledge'::regclass
    ) then
      execute 'alter table case_knowledge drop constraint case_knowledge_result_status_check';
    end if;
    execute $k$
      alter table case_knowledge add constraint case_knowledge_result_status_check
      check (result_status in ('success', 'rejected', 'withdrawn', 'success_after_supplement'))
    $k$;

    -- 5) [STEP21-3 핵심] status-consistency — 강화된 규칙(ongoing→NULL 필수,
    --    closed→NOT NULL 필수) 위반 검사. 위반 시 자동 수정/삭제 없이
    --    즉시 예외를 던져 마이그레이션을 중단한다(운영자가 직접 데이터를
    --    확인해야 함 — 예외 메시지에 확인용 쿼리를 그대로 포함시켰다).
    select count(*) into v_bad_consistency
    from case_knowledge
    where not (
      (case_status = 'ongoing' and result_status is null) or
      (case_status = 'closed' and result_status is not null)
    );

    if v_bad_consistency > 0 then
      raise exception '[STEP21-3] case_status/result_status 무결성 위반 %건 발견 — Migration을 중단합니다(자동 수정하지 않음). 아래 쿼리로 직접 확인 후 데이터를 정리하고 이 스크립트를 다시 실행해주세요: select id, lead_id, case_status, result_status from case_knowledge where not ((case_status = ''ongoing'' and result_status is null) or (case_status = ''closed'' and result_status is not null));', v_bad_consistency;
    end if;

    if exists (
      select 1 from pg_constraint
      where conname = 'case_knowledge_status_consistency'
        and conrelid = 'public.case_knowledge'::regclass
    ) then
      execute 'alter table case_knowledge drop constraint case_knowledge_status_consistency';
    end if;
    execute $k$
      alter table case_knowledge add constraint case_knowledge_status_consistency
      check (
        (case_status = 'ongoing' and result_status is null) or
        (case_status = 'closed' and result_status is not null)
      )
    $k$;
    raise notice '[STEP21-3] case_knowledge_status_consistency 제약 생성 완료';

    -- 6) [STEP21-3 핵심] publish-consistency — 강화된 규칙(검토·게시 이력
    --    4개 필드 + needs_manual_review=false + case_status=closed) 위반
    --    검사. 위반 시 즉시 예외.
    select count(*) into v_bad_publish
    from case_knowledge
    where is_published = true
      and not (
        case_status = 'closed'
        and needs_manual_review = false
        and reviewed_at is not null
        and reviewed_by is not null
        and published_at is not null
        and published_by is not null
      );

    if v_bad_publish > 0 then
      raise exception '[STEP21-3] is_published=true인데 게시 조건(검토 완료·검토자/게시자 기록)을 만족하지 않는 행 %건 발견 — Migration을 중단합니다(자동 수정하지 않음). 아래 쿼리로 확인 후 정리하고 재실행해주세요: select id, lead_id, case_status, needs_manual_review, reviewed_at, reviewed_by, published_at, published_by from case_knowledge where is_published = true and not (case_status = ''closed'' and needs_manual_review = false and reviewed_at is not null and reviewed_by is not null and published_at is not null and published_by is not null);', v_bad_publish;
    end if;

    if exists (
      select 1 from pg_constraint
      where conname = 'case_knowledge_publish_requires_closed'
        and conrelid = 'public.case_knowledge'::regclass
    ) then
      execute 'alter table case_knowledge drop constraint case_knowledge_publish_requires_closed';
    end if;
    if exists (
      select 1 from pg_constraint
      where conname = 'case_knowledge_publish_consistency'
        and conrelid = 'public.case_knowledge'::regclass
    ) then
      execute 'alter table case_knowledge drop constraint case_knowledge_publish_consistency';
    end if;
    execute $k$
      alter table case_knowledge add constraint case_knowledge_publish_consistency
      check (
        (is_published = false) or (
          case_status = 'closed'
          and needs_manual_review = false
          and reviewed_at is not null
          and reviewed_by is not null
          and published_at is not null
          and published_by is not null
        )
      )
    $k$;
    raise notice '[STEP21-3] case_knowledge_publish_consistency 제약 생성 완료';

    -- 7) [STEP21-3 핵심] lead_id UNIQUE — 중복 발견 시 즉시 예외(자동
    --    삭제/병합 절대 하지 않음).
    select count(*) into v_dup_lead_groups
    from (
      select lead_id from case_knowledge
      where lead_id is not null
      group by lead_id having count(*) > 1
    ) dup;

    if v_dup_lead_groups > 0 then
      raise exception '[STEP21-3] 중복 lead_id 그룹 %건 발견 — Migration을 중단합니다(자동 삭제/병합하지 않음). 아래 쿼리로 어느 행을 남길지 직접 결정한 뒤 정리하고 재실행해주세요: select lead_id, count(*), array_agg(id order by created_at desc) as row_ids from case_knowledge where lead_id is not null group by lead_id having count(*) > 1;', v_dup_lead_groups;
    end if;

    if not exists (
      select 1 from pg_constraint
      where conname = 'case_knowledge_lead_id_unique'
        and conrelid = 'public.case_knowledge'::regclass
    ) then
      execute 'alter table case_knowledge add constraint case_knowledge_lead_id_unique unique (lead_id)';
      raise notice '[STEP21-3] case_knowledge_lead_id_unique 제약 생성 완료';
    end if;
  end if;
end $$;

-- ============================================================
-- 인덱스 (항상 IF NOT EXISTS — 두 분기 모두에서 안전하게 재실행 가능)
-- ============================================================
create index if not exists idx_case_conversations_lead_id_seq
  on case_conversations (lead_id, seq);

create index if not exists idx_case_knowledge_service_type on case_knowledge (service_type);
create index if not exists idx_case_knowledge_category on case_knowledge (category);
create index if not exists idx_case_knowledge_result_status on case_knowledge (result_status);
create index if not exists idx_case_knowledge_case_status on case_knowledge (case_status);
create index if not exists idx_case_knowledge_published on case_knowledge (is_published) where is_published = true;

-- ============================================================
-- updated_at 자동 갱신 트리거 (항상 재생성 — 멱등)
-- ============================================================
create or replace function case_knowledge_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_case_knowledge_updated_at on case_knowledge;
create trigger trg_case_knowledge_updated_at
  before update on case_knowledge
  for each row
  execute function case_knowledge_set_updated_at();

-- ============================================================
-- 접근 권한 — anon/authenticated 완전 차단, service role만 허용 (항상 재실행 안전)
-- ============================================================
alter table case_conversations enable row level security;
revoke all on case_conversations from anon, authenticated;

alter table case_knowledge enable row level security;
revoke all on case_knowledge from anon, authenticated;
-- 의도적으로 policy를 만들지 않음 = RLS가 모든 접근을 기본 차단한다.
-- service role(src/lib/supabaseAdmin.ts)만 RLS를 우회해 접근 가능.

comment on table case_conversations is
  'STEP21/21-1/21-2/21-3: AI 채팅 원문 append-only 로그. seq(identity)로 경쟁조건 없이 정렬한다. service role 전용.';
comment on table case_knowledge is
  'STEP21~21-3: 익명화된 사례 지식. lead_id UNIQUE(사건당 1건). case_status(ongoing/closed)와 result_status는 서로 엄격히 연동된다. is_published=true는 검토·게시 이력이 전부 기록된 closed 사건만 가능(publish_consistency).';

-- ============================================================
-- 향후 확장 메모 (이번 STEP에서는 추가하지 않음)
-- ============================================================
-- pgvector 확장이 필요한 embedding vector(1536) 컬럼은, 실제로 임베딩을
-- 생성하는 파이프라인이 준비된 다음 단계에서 별도 마이그레이션으로
-- 추가하는 것을 권장합니다.
