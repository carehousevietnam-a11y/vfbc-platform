-- 참고용 · 실행 금지 · RLS/정책/인덱스/트리거/함수는 live_catalog_result.json 반영 전까지 미확인
-- 실제 DB와 다를 수 있음(추출 일시 2026-10-13). 방법: PostgREST OpenAPI + Storage API (읽기 전용)

CREATE TABLE public.admin_user_scopes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  category text NOT NULL,
  service_type text,
  region text,
  permission text NOT NULL DEFAULT 'view',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text,
  title text NOT NULL,
  summary text,
  body text,
  published_at timestamp with time zone,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.case_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  seq bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.case_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid,
  service_type text NOT NULL,
  category text NOT NULL,
  country text NOT NULL DEFAULT 'VN',
  province text,
  industry text,
  question text NOT NULL,
  ai_answer text NOT NULL,
  expert_review text,
  final_result text,
  case_status text NOT NULL DEFAULT 'closed',
  result_status text,
  rejection_reason text,
  processing_days integer,
  related_documents jsonb NOT NULL,
  related_laws jsonb NOT NULL,
  confidence numeric,
  pii_redaction_version text NOT NULL DEFAULT 'v2',
  needs_manual_review boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  reviewed_by text,
  reviewed_at timestamp with time zone,
  published_by text,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.crm_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  lead_id uuid,
  action text,
  tag text,
  meta jsonb
);

CREATE TABLE public.lead_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  admin_user_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
);

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text,
  phone text,
  address text,
  kakao_id text,
  zalo_id text,
  service_type text,
  result text,
  source_page text,
  status text DEFAULT 'new',
  seq_no bigint NOT NULL,
  display_id text,
  email text,
  user_id uuid
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  lead_id uuid,
  channel text,
  template text,
  status text DEFAULT 'pending',
  sent_at timestamp with time zone,
  user_id uuid,
  payload jsonb
);

CREATE TABLE public.previous_rejections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  source_page text,
  reason text,
  linked_lead_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  reminder_type text,
  target_date date NOT NULL,
  notify_days_before integer[],
  channel_preference text[],
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.result_tokens (
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid,
  user_id uuid,
  expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.users (
  id uuid NOT NULL,
  phone text NOT NULL,
  email text,
  name text,
  address text,
  kakao_id text,
  zalo_id text,
  member_type text DEFAULT 'personal',
  country_group text DEFAULT 'korea',
  language text DEFAULT 'ko',
  password_set boolean DEFAULT false,
  lead_score integer DEFAULT 0,
  lead_grade text,
  created_at timestamp with time zone DEFAULT now()
);

-- 미확인: indexes, rls, policies, triggers, functions, views (live_catalog_result.json 병합 전)
-- storage.buckets (메타만)
-- bucket documents: public=false, file_size_limit=null
