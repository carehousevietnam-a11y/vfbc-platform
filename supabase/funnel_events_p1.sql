-- 퍼널 추적 P1: funnel_events 테이블 생성 (2026-10-13)
-- RLS 켜고 정책을 만들지 않는다 = 브라우저(anon/로그인) 접근 불가, 서버(서비스 키)만 읽고 쓴다.
-- 설계: docs/master/FUNNEL_TRACKING_DESIGN.md. 실행은 Supabase SQL Editor에서 Ace가 직접.

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  session_id uuid not null,
  engine text not null check (engine in ('check','verify','register','consultation')),
  service text not null,
  step smallint not null check (step between 0 and 30), -- check/register: 화면 단계 1~4, verify: 답한 질문 수 0~30
  event text not null check (event in ('view','submit')),
  lead_id uuid references public.leads(id) on delete set null,
  device text check (device in ('mobile','desktop')),
  lang text,
  entry_tab text
);

alter table public.funnel_events enable row level security;

create index if not exists funnel_events_service_step_idx on public.funnel_events (service, step, occurred_at);
create index if not exists funnel_events_session_idx on public.funnel_events (session_id);

-- 이 프로젝트는 새 테이블에 서버(service_role) 권한을 자동 부여하지 않는다 → 명시 필요(LESSONS #47)
grant select, insert, update, delete on public.funnel_events to service_role;

-- ===== 되돌리기(문제가 생길 때만 실행) =====
-- drop table if exists public.funnel_events;
