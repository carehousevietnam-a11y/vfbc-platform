import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// [v2] 마이페이지 UI 개선(진행 타임라인/진행률/첨부파일 다운로드)을 위해
// 응답 형태를 status 문자열 1개에서 실제 action 기반 boolean 필드들로
// 세분화했다. 판단 기준(crm_activities.action)과 안전 경계(전문가 전용
// 데이터 절대 미포함)는 v1과 동일하게 유지한다.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 서비스 분류 (admin/cases/page.tsx · admin/leads/page.tsx · admin/leads/[id]/page.tsx와 동일 원칙) ──
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company",
};

function normalizeServiceType(serviceType: string | null | undefined): string | null {
  if (!serviceType) return serviceType ?? null;
  return SERVICE_TYPE_ALIASES[serviceType] ?? serviceType;
}

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CHECK_SERVICE_TYPES = ["wp", "trc", "tamtru", "driving-license"];

function getCategory(serviceType: string | null | undefined): CategoryKey {
  const normalized = normalizeServiceType(serviceType);
  if (!normalized) return "unclassified";
  if (normalized === "consultation") return "consultation";
  const prefixKey = toPrefixKey(normalized);
  if (prefixKey.startsWith("verify")) return "verify";
  if (prefixKey.startsWith("permit")) return "register";
  if (prefixKey.startsWith("register")) return "register";
  if (CHECK_SERVICE_TYPES.includes(normalized)) return "check";
  return "unclassified";
}

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
  consultation: "일반 상담문의",
  permit_company: "법인설립",
  verify_admin: "행정문서 검토",
  "verify_real-estate": "부동산 문서 검토",
  verify_fraud: "사기문서 검토",
  verify_tax: "세무문서 검토",
  verify_unclear: "불확실한 서류 검토",
  register_restaurant: "식당허가",
  register_cosmetics: "화장품허가",
  register_environment: "환경허가",
  register_fire_safety: "소방허가",
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가",
  register_franchise: "프랜차이즈 등록",
};

function getServiceLabel(serviceType: string): string {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];
  if (key.startsWith("verify")) {
    const sub = key.replace(/^verify_?/, "");
    return sub ? `검토 · ${sub}` : "검토";
  }
  if (key.startsWith("permit") || key.startsWith("register")) {
    const sub = key.replace(/^(permit|register)_?/, "");
    return sub ? `허가 · ${sub}` : "허가";
  }
  return serviceType;
}

type ActivityRow = {
  lead_id: string;
  action: string | null;
  meta: unknown;
  created_at: string;
};

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

// ── 안심도(Confidence) 판단 ──
// 전체 코드베이스에서 crm_activities.action으로 실제 저장되는 값을 전수
// 확인한 결과(2026-07 기준): agency_upgrade_request, consultation_request,
// expert_review_request, expert_memo, verify_lead, *_diagnosis_lead 뿐이다.
// "추가서류요청"·"담당자확인필요"·"반려" 등에 해당하는 action은 현재
// 존재하지 않는다. 그래서 RED_ACTIONS/YELLOW_ACTIONS는 비워둔다 — 존재하지
// 않는 action을 하드코딩해 미래 기능인 것처럼 보이게 하지 않는다.
// 나중에 그런 action이 실제로 추가되면 이 두 배열에만 채우면 자동 반영된다.
type ConfidenceLevel = "green" | "yellow" | "red";
type ConfidenceStatus = { level: ConfidenceLevel; label: string; message: string };

const RED_ACTIONS: string[] = [];
const YELLOW_ACTIONS: string[] = [];

function getConfidenceStatus(actions: string[]): ConfidenceStatus {
  if (actions.some((a) => RED_ACTIONS.includes(a))) {
    return {
      level: "red",
      label: "담당자 확인 필요",
      message: "담당자가 내용을 확인하고 있습니다. 확인 후 안내드리겠습니다.",
    };
  }
  if (actions.some((a) => YELLOW_ACTIONS.includes(a))) {
    return {
      level: "yellow",
      label: "추가 서류 확인 예정",
      message: "담당자가 필요한 서류를 확인한 후 안내드릴 예정입니다.",
    };
  }
  return {
    level: "green",
    label: "정상 진행 중",
    message: "현재 접수된 절차가 정상적으로 진행되고 있습니다.",
  };
}

// ── 진행 단계 (admin/leads/[id]/page.tsx와 동일한 action 집합·캐스케이드 원칙) ──
// expert_review_request / agency_upgrade_request는 기존 action 재사용.
// process_government_submitted / process_permit_completed는 대응하는 기존
// action이 없어 관리자 진행단계 관리 기능에서 신규로 사용하는 값이다.
type ProcessStep = { label: string; done: boolean };
type StageInfo = {
  steps: ProcessStep[];
  progressPercent: number;
  currentStepLabel: string;
};

// 상위 단계 action이 있으면 이전 단계도 완료로 표시(캐스케이드) — 관리자가
// 단계를 건너뛰고 저장해도 이전 단계가 자동으로 완료 표시되도록 한다.
function cascadeDone(rawDone: boolean[]): boolean[] {
  let lastTrueIndex = -1;
  rawDone.forEach((d, i) => {
    if (d) lastTrueIndex = i;
  });
  return rawDone.map((_, i) => i <= lastTrueIndex);
}

// 요청된 6단계 진행률 표: 1단계 17% ~ 6단계 100%.
const SIX_STEP_PERCENTS = [17, 33, 50, 67, 83, 100];

function buildStageInfo(
  category: CategoryKey,
  hasDiagnosis: boolean,
  hasExpertReview: boolean,
  hasAgency: boolean,
  hasGovernmentSubmitted: boolean,
  hasPermitCompleted: boolean
): StageInfo {
  if (category === "verify") {
    const raw = [true, hasDiagnosis, hasExpertReview, false];
    const done = cascadeDone(raw);
    const steps: ProcessStep[] = [
      { label: "접수 완료", done: done[0] },
      { label: "자체 진단 완료", done: done[1] },
      { label: "전문가 검토 요청", done: done[2] },
      { label: "전문가 안내 대기", done: done[3] },
    ];
    const doneCount = done.filter(Boolean).length;
    const idx = doneCount - 1;
    return {
      steps,
      progressPercent: Math.round((doneCount / steps.length) * 100),
      currentStepLabel: steps[idx]?.label ?? steps[0].label,
    };
  }
  if (category === "consultation") {
    const raw = [true, false];
    const done = cascadeDone(raw);
    const steps: ProcessStep[] = [
      { label: "상담 접수 완료", done: done[0] },
      { label: "담당자 확인 대기", done: done[1] },
    ];
    const doneCount = done.filter(Boolean).length;
    const idx = doneCount - 1;
    return {
      steps,
      progressPercent: Math.round((doneCount / steps.length) * 100),
      currentStepLabel: steps[idx]?.label ?? steps[0].label,
    };
  }
  // CHECK / REGISTER — 요청된 6단계 + 명시된 %표
  const raw = [true, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted];
  const done = cascadeDone(raw);
  const steps: ProcessStep[] = [
    { label: "접수 완료", done: done[0] },
    { label: "AI 진단 완료", done: done[1] },
    { label: "전문가 검토", done: done[2] },
    { label: "대행 신청", done: done[3] },
    { label: "정부 제출", done: done[4] },
    { label: "허가 완료", done: done[5] },
  ];
  const doneCount = done.filter(Boolean).length;
  const idx = doneCount - 1;
  return {
    steps,
    progressPercent: SIX_STEP_PERCENTS[idx] ?? SIX_STEP_PERCENTS[0],
    currentStepLabel: steps[idx]?.label ?? steps[0].label,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = (await req.json()) as { accessToken?: string };
    if (!accessToken) {
      return NextResponse.json({ error: "로그인 정보가 없습니다." }, { status: 401 });
    }

    // access_token을 서버에서 직접 검증 — 클라이언트가 보낸 user_id를 그대로
    // 믿지 않는다(위조 방지).
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }
    const userId = userData.user.id;

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("name, phone")
      .eq("id", userId)
      .maybeSingle();

    const { data: leadsRaw, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("mypage-data leads error:", leadsError);
      return NextResponse.json({ error: leadsError.message }, { status: 500 });
    }
    const leads = leadsRaw ?? [];
    const leadIds = leads.map((l) => l.id);

    const { data: activitiesRaw } = leadIds.length
      ? await supabaseAdmin
          .from("crm_activities")
          .select("lead_id, action, meta, created_at")
          .in("lead_id", leadIds)
          .order("created_at", { ascending: true })
      : { data: [] as ActivityRow[] };
    const activities = (activitiesRaw ?? []) as ActivityRow[];

    const items = leads.map((lead) => {
      const leadActivities = activities.filter((a) => a.lead_id === lead.id);
      const actions = new Set(leadActivities.map((a) => a.action));

      // 실제 존재하는 action 값만 사용 — leads.status 등 미확인 컬럼 사용 안 함.
      const hasDiagnosis = leadActivities.some(
        (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
      );
      const hasExpertReview = actions.has("expert_review_request");
      const hasAgency = actions.has("agency_upgrade_request");
      const hasConsultationRequest = actions.has("consultation_request");
      // 신규: 관리자 진행단계 관리 기능에서 저장하는 action (기존에 대응 action 없음)
      const hasGovernmentSubmitted = actions.has("process_government_submitted");
      const hasPermitCompleted = actions.has("process_permit_completed");

      // ⚠️ 안전 경계: expertBrief / expert_brief(전문가 전용 — checkedItems,
      // rejectionRisks, recommendedSteps, similarCases 등 AI의 "왜"에 해당하는
      // 내부 판단 근거)는 절대 포함하지 않는다. feasibilityScore(점수)는 각
      // 진단 화면에서 이미 고객에게 직접 보여주는 값이라 안전하게 재사용한다.
      let feasibilityScore: number | null = null;
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      for (const a of leadActivities) {
        const meta = asMeta(a.meta);
        if (typeof meta?.feasibilityScore === "number") {
          feasibilityScore = meta.feasibilityScore as number;
        }
        if (typeof meta?.file_url === "string") {
          fileUrl = meta.file_url as string;
          fileName = (meta.file_name as string | undefined) ?? null;
        }
      }

      const normalizedType = normalizeServiceType(lead.service_type);
      const category = getCategory(normalizedType);

      const confidence = getConfidenceStatus(
        leadActivities.map((a) => a.action).filter((a): a is string => Boolean(a))
      );

      const stage = buildStageInfo(
        category,
        hasDiagnosis,
        hasExpertReview,
        hasAgency,
        hasGovernmentSubmitted,
        hasPermitCompleted
      );

      // 향후 고객 타임라인 UI 연결을 대비해 안전하게 정리한 활동 로그.
      // action/created_at만 포함하고, 관리자 전용 메모(expert_memo)나
      // meta 원본은 포함하지 않는다(전문가 전용 데이터 노출 방지 원칙 유지).
      const STAGE_ACTIONS = new Set([
        "verify_lead",
        "expert_review_request",
        "agency_upgrade_request",
        "consultation_request",
        "process_government_submitted",
        "process_permit_completed",
      ]);
      const activityLog = leadActivities
        .filter((a) => a.action && (STAGE_ACTIONS.has(a.action) || a.action.endsWith("_diagnosis_lead")))
        .map((a) => ({ action: a.action as string, createdAt: a.created_at }));

      return {
        id: lead.id,
        category,
        serviceType: normalizedType,
        serviceLabel: getServiceLabel(normalizedType ?? lead.service_type ?? ""),
        result: lead.result,
        feasibilityScore,
        hasDiagnosis,
        hasExpertReview,
        hasAgency,
        hasConsultationRequest,
        fileUrl,
        fileName,
        confidence,
        stage,
        activityLog,
        createdAt: lead.created_at,
      };
    });

    return NextResponse.json({
      name: profile?.name ?? null,
      items,
    });
  } catch (err) {
    console.error("mypage-data route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
