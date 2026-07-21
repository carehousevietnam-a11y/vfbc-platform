// src/lib/aiCaseContext.ts
//
// STEP7: AI Case Manager가 답변할 때 참고하는 "고객 안전 데이터"만 골라
// 만드는 서버 전용 헬퍼. 반드시 서버(API route)에서만 import한다 — service
// role key를 쓰는 supabaseAdmin을 포함하므로 "use client" 파일에서 절대
// import하면 안 된다.
//
// ⚠️ 절대 경계: api/mypage-data/route.ts가 지키는 것과 완전히 동일한 안전
// 경계를 그대로 따른다. expertBrief / expert_brief / checkedItems /
// rejectionRisks / recommendedSteps / similarCases, visibleToCustomer가
// true가 아닌 메모, 다른 고객의 데이터는 이 파일 어디에서도 조회·조합하지
// 않는다. (checkDiagnosis.ts / verifyDiagnosis.ts 구조 확인 완료 — 이 값들은
// 전부 expertBrief 객체 내부에만 존재하고, 이 파일은 그 객체를 아예 select하지
// 않는다.)
//
// api/mypage-data/route.ts의 로직을 그대로 재사용하지 않고 이 파일에
// 필요한 범위만 복제한 이유: 그 route는 "로그인한 고객의 전체 신청 목록"을
// 위한 것이고, 이 파일은 "단일 leadId + 소유권 재검증"이 목적이라 책임이
// 다르다. 이 프로젝트는 공용 lib로 억지로 묶기보다 파일별 복제를 선호하는
// 기존 관례(email.ts의 EXPERT_TEAM_LABEL 등)를 따른다.

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── admin/leads/[id]/page.tsx, api/mypage-data/route.ts와 동일한 정규화 원칙 ──
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

// mypage/page.tsx의 ESTIMATED_DAYS와 동일한 값(화면 표시용 참고자료를
// AI 답변에도 그대로 재사용 — 새 수치를 만들지 않음).
const ESTIMATED_DAYS: Record<string, string> = {
  wp: "30~60 영업일",
  trc: "15~45 영업일",
  tamtru: "1~3 영업일",
  "driving-license": "7~15 영업일",
  permit_company: "20~55 영업일",
  register_restaurant: "15~30 영업일",
  register_cosmetics: "20~40 영업일",
  register_environment: "25~50 영업일",
  register_fire_safety: "10~25 영업일",
  register_hygiene: "10~20 영업일",
  register_medical_device: "30~60 영업일",
  register_franchise: "20~45 영업일",
};
const VERIFY_ESTIMATE = "2~5 영업일 (전문가 확인 기준)";
const CONSULTATION_ESTIMATE = "1~2 영업일 (담당자 확인 기준)";

function getEstimate(category: CategoryKey, serviceType: string | null): string {
  if (category === "verify") return VERIFY_ESTIMATE;
  if (category === "consultation") return CONSULTATION_ESTIMATE;
  if (serviceType && ESTIMATED_DAYS[serviceType]) return ESTIMATED_DAYS[serviceType];
  return "담당자 확인 후 안내";
}

const EXPERT_TEAM_LABEL = "VFBCAI 법률자문팀 (Linda Kang · VNK 파트너)";

type ActivityRow = { action: string | null; meta: unknown; created_at: string };

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

// mypage-data와 동일한 6단계 진행률 표
const SIX_STEP_PERCENTS = [17, 33, 50, 67, 83, 100];

type ProcessStep = { label: string; done: boolean };

function cascadeDone(rawDone: boolean[]): boolean[] {
  let lastTrueIndex = -1;
  rawDone.forEach((d, i) => {
    if (d) lastTrueIndex = i;
  });
  return rawDone.map((_, i) => i <= lastTrueIndex);
}

function buildStage(
  category: CategoryKey,
  hasDiagnosis: boolean,
  hasExpertReview: boolean,
  hasAgency: boolean,
  hasGovernmentSubmitted: boolean,
  hasPermitCompleted: boolean
): { steps: ProcessStep[]; progressPercent: number; currentStepLabel: string } {
  if (category === "verify") {
    const done = cascadeDone([true, hasDiagnosis, hasExpertReview, false]);
    const steps: ProcessStep[] = [
      { label: "접수 완료", done: done[0] },
      { label: "자체 진단 완료", done: done[1] },
      { label: "전문가 검토 요청", done: done[2] },
      { label: "전문가 안내 대기", done: done[3] },
    ];
    const doneCount = done.filter(Boolean).length;
    return {
      steps,
      progressPercent: Math.round((doneCount / steps.length) * 100),
      currentStepLabel: steps[doneCount - 1]?.label ?? steps[0].label,
    };
  }
  if (category === "consultation") {
    const done = cascadeDone([true, false]);
    const steps: ProcessStep[] = [
      { label: "상담 접수 완료", done: done[0] },
      { label: "담당자 확인 대기", done: done[1] },
    ];
    const doneCount = done.filter(Boolean).length;
    return {
      steps,
      progressPercent: Math.round((doneCount / steps.length) * 100),
      currentStepLabel: steps[doneCount - 1]?.label ?? steps[0].label,
    };
  }
  const done = cascadeDone([
    true,
    hasDiagnosis,
    hasExpertReview,
    hasAgency,
    hasGovernmentSubmitted,
    hasPermitCompleted,
  ]);
  const steps: ProcessStep[] = [
    { label: "접수 완료", done: done[0] },
    { label: "AI 진단 완료", done: done[1] },
    { label: "전문가 검토", done: done[2] },
    { label: "전문가 진행요청", done: done[3] },
    { label: "정부 제출", done: done[4] },
    { label: "허가 완료", done: done[5] },
  ];
  const doneCount = done.filter(Boolean).length;
  return {
    steps,
    progressPercent: SIX_STEP_PERCENTS[doneCount - 1] ?? SIX_STEP_PERCENTS[0],
    currentStepLabel: steps[doneCount - 1]?.label ?? steps[0].label,
  };
}

export type OwnershipResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403 | 404; error: string };

// access_token 검증 + leadId가 실제로 이 사용자 소유인지 재검증.
// 클라이언트가 보낸 leadId를 그대로 믿지 않고 여기서 다시 확인한다
// (다른 고객의 leadId로 바꿔치기 접근 차단).
export async function verifyOwnedLead(
  accessToken: string | undefined,
  leadId: string | undefined
): Promise<OwnershipResult> {
  if (!accessToken) {
    return { ok: false, status: 401, error: "로그인 정보가 없습니다." };
  }
  if (!leadId) {
    return { ok: false, status: 404, error: "신청 건을 찾을 수 없습니다." };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return { ok: false, status: 401, error: "로그인이 만료되었습니다. 다시 로그인해주세요." };
  }
  const userId = userData.user.id;

  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (leadError || !lead) {
    // 존재하지 않는 leadId와 "다른 사람 소유"인 leadId를 굳이 구분해서
    // 응답하지 않는다(둘 다 404로 통일 — 존재 여부 자체를 유추 못 하게 함).
    return { ok: false, status: 404, error: "신청 건을 찾을 수 없습니다." };
  }

  return { ok: true, userId };
}

export type CaseContext = {
  serviceLabel: string;
  category: CategoryKey;
  resultLabel: string | null;
  feasibilityScore: number | null;
  currentStepLabel: string;
  nextStepLabel: string;
  progressPercent: number;
  steps: ProcessStep[];
  activityLog: { label: string; createdAt: string }[];
  governmentSubmittedAt: string | null;
  permitCompletedAt: string | null;
  hasPermitFile: boolean;
  estimatedDays: string;
  expertTeamLabel: string;
  publicNotes: { memo: string; createdAt: string }[];
  confidenceLevel: "green" | "yellow" | "red";
  confidenceMessage: string;
};

// mypage/page.tsx의 nextStepLabel과 동일한 로직 — 아직 완료되지 않은 첫
// 단계를 "다음 단계"로 안내한다.
function nextStepLabel(steps: ProcessStep[]): string {
  const firstPending = steps.find((s) => !s.done);
  if (!firstPending) return "안내 대기";
  return firstPending.label + " 예정";
}

// api/mypage-data/route.ts의 안심도(Confidence) 판단과 동일한 원칙 —
// 전체 코드베이스에 실제 존재하는 crm_activities.action을 전수 확인한
// 결과(2026-07 기준) "추가서류요청"·"반려" 등에 해당하는 action은 아직
// 없다. 그래서 RED_ACTIONS/YELLOW_ACTIONS는 비워둔다 — 존재하지 않는
// action을 하드코딩해 없는 기능("추가 서류 필요")이 있는 것처럼 AI가
// 답변하게 하지 않기 위함이다. 나중에 그런 action이 실제로 추가되면 이
// 두 배열에만 채우면 AI 답변에도 자동 반영된다.
const RED_ACTIONS: string[] = [];
const YELLOW_ACTIONS: string[] = [];

function getConfidence(actions: string[]): { level: "green" | "yellow" | "red"; message: string } {
  if (actions.some((a) => RED_ACTIONS.includes(a))) {
    return { level: "red", message: "담당자가 내용을 확인하고 있습니다. 확인 후 안내드리겠습니다." };
  }
  if (actions.some((a) => YELLOW_ACTIONS.includes(a))) {
    return { level: "yellow", message: "담당자가 필요한 서류를 확인한 후 안내드릴 예정입니다." };
  }
  return { level: "green", message: "현재 등록된 추가 서류 요청은 없습니다." };
}

const RESULT_LABELS: Record<string, string> = {
  possible: "가능",
  conditional: "조건부 가능",
  impossible: "어려움",
};

// leadId 소유권이 이미 검증된 뒤에만 호출한다(verifyOwnedLead를 먼저 통과).
export async function buildCaseContext(leadId: string): Promise<CaseContext | null> {
  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, service_type, result, created_at")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError || !lead) return null;

  const { data: activitiesRaw } = await supabaseAdmin
    .from("crm_activities")
    .select("action, meta, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  const activities = (activitiesRaw ?? []) as ActivityRow[];
  const actions = new Set(activities.map((a) => a.action));

  const hasDiagnosis = activities.some(
    (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
  );
  const hasExpertReview = actions.has("expert_review_request");
  const hasAgency = actions.has("agency_upgrade_request");
  const hasGovernmentSubmitted = actions.has("process_government_submitted");
  const hasPermitCompleted = actions.has("process_permit_completed");

  // ⚠️ feasibilityScore만 뽑는다 — 같은 meta 안에 있을 수 있는 expertBrief류는
  // 절대 꺼내지 않는다(애초에 아래에서 접근하는 필드가 feasibilityScore 뿐).
  let feasibilityScore: number | null = null;
  for (const a of activities) {
    if (a.action === "process_permit_completed") continue;
    const meta = asMeta(a.meta);
    if (typeof meta?.feasibilityScore === "number") {
      feasibilityScore = meta.feasibilityScore as number;
    }
  }

  const governmentSubmittedActivity = activities.find((a) => a.action === "process_government_submitted");
  const permitCompletedActivity = activities.find((a) => a.action === "process_permit_completed");
  const permitMeta = asMeta(permitCompletedActivity?.meta);

  // 고객 공개 메모 — visibleToCustomer === true인 것만
  const publicNotes = activities
    .filter((a) => a.action === "expert_memo" && asMeta(a.meta)?.visibleToCustomer === true)
    .map((a) => ({ memo: (asMeta(a.meta)?.memo as string | undefined) ?? "", createdAt: a.created_at }))
    .filter((n) => n.memo.trim().length > 0);

  const normalizedType = normalizeServiceType(lead.service_type);
  const category = getCategory(normalizedType);
  const stage = buildStage(
    category,
    hasDiagnosis,
    hasExpertReview,
    hasAgency,
    hasGovernmentSubmitted,
    hasPermitCompleted
  );

  const STAGE_ACTIONS = new Set([
    "verify_lead",
    "expert_review_request",
    "agency_upgrade_request",
    "consultation_request",
    "process_government_submitted",
    "process_permit_completed",
  ]);
  function getActivityLabel(action: string): string {
    if (action === "verify_lead" || action.endsWith("_diagnosis_lead")) return "AI 검토 완료";
    if (action === "expert_review_request") return "전문가 검토 시작";
    if (action === "agency_upgrade_request") return "전문가 진행요청 접수";
    if (action === "consultation_request") return "상담 신청 접수";
    if (action === "process_government_submitted") return "정부 제출 완료";
    if (action === "process_permit_completed") return "허가 완료";
    return "진행 업데이트";
  }
  const activityLog = activities
    .filter((a) => a.action && (STAGE_ACTIONS.has(a.action) || a.action.endsWith("_diagnosis_lead")))
    .map((a) => ({ label: getActivityLabel(a.action as string), createdAt: a.created_at }));

  const confidence = getConfidence(
    activities.map((a) => a.action).filter((a): a is string => Boolean(a))
  );

  return {
    serviceLabel: getServiceLabel(normalizedType ?? lead.service_type ?? ""),
    category,
    resultLabel: lead.result ? RESULT_LABELS[lead.result] ?? null : null,
    feasibilityScore,
    currentStepLabel: stage.currentStepLabel,
    nextStepLabel: nextStepLabel(stage.steps),
    progressPercent: stage.progressPercent,
    steps: stage.steps,
    activityLog,
    governmentSubmittedAt: governmentSubmittedActivity?.created_at ?? null,
    permitCompletedAt: permitCompletedActivity?.created_at ?? null,
    hasPermitFile: typeof permitMeta?.file_url === "string",
    estimatedDays: getEstimate(category, normalizedType),
    expertTeamLabel: EXPERT_TEAM_LABEL,
    publicNotes,
    confidenceLevel: confidence.level,
    confidenceMessage: confidence.message,
  };
}

// 모델이 "전문가 판단이 필요하다"고 스스로 표시할 때 답변 맨 끝에 붙이도록
// 시스템 프롬프트에서 지시하는 토큰. api/ai-chat/route.ts가 이 토큰을
// 감지해서 UI에 [전문가 상담 요청] 버튼을 띄우고, 사용자에게 보여줄 텍스트
// 에서는 잘라낸다.
export const NEEDS_EXPERT_TOKEN = "[NEEDS_EXPERT]";

// 시스템 프롬프트가 확정적 법률판단을 하면 안 되는 상황을 모델이 놓치는
// 경우를 대비한 보조 신호 — 고객 메시지에 이 키워드가 있으면 모델 응답과
// 무관하게 needsExpert를 true로 강제한다(OR 조건, 이중 안전장치).
const ESCALATION_KEYWORDS = [
  "소송",
  "고소",
  "고발",
  "항소",
  "계약 해석",
  "분쟁",
  "투자금 회수",
  "형사",
  "세무 법률",
  "행정처분",
  "행정 처분",
  "담당자와 이야기",
  "담당자와 상담",
  "전문가와 상담",
  "변호사",
];

export function matchesEscalationKeyword(userMessage: string): boolean {
  return ESCALATION_KEYWORDS.some((kw) => userMessage.includes(kw));
}

export function buildSystemPrompt(context: CaseContext): string {
  const safeContext = {
    서비스: context.serviceLabel,
    분류: context.category,
    AI_1차_예측_결과: context.resultLabel,
    AI_허가_가능성_점수: context.feasibilityScore,
    현재_진행_단계: context.currentStepLabel,
    다음_단계: context.nextStepLabel,
    진행률_퍼센트: context.progressPercent,
    전체_단계: context.steps.map((s) => ({ 단계: s.label, 완료여부: s.done })),
    처리_이력: context.activityLog.map((a) => ({ 항목: a.label, 일시: a.createdAt })),
    정부_제출일: context.governmentSubmittedAt,
    허가_완료일: context.permitCompletedAt,
    허가증_결과파일_존재여부: context.hasPermitFile,
    일반적인_예상_소요기간_참고용: context.estimatedDays,
    담당_전문가: context.expertTeamLabel,
    담당자가_고객에게_공개한_메모: context.publicNotes.map((n) => ({ 내용: n.memo, 일시: n.createdAt })),
    추가서류_안심도: context.confidenceLevel,
    추가서류_상태_설명: context.confidenceMessage,
  };

  return `당신은 VFBCAI AI Case Manager입니다.

역할:
- 당신은 단순 질문 응답 챗봇이 아니라, 고객의 사건을 관리하는 개인 케이스 매니저입니다.
- 답변 전에 항상 아래 [고객 사건 정보]의 서비스·진행 단계·진행률·정부 제출 여부·타임라인·담당 전문가·고객 공개 메모를 먼저 확인한 뒤 답합니다.
- 질문에 사실만 답하는 데 그치지 않고, "고객이 지금 가장 필요한 행동"이 무엇인지(예: 기다리면 되는지, 추가로 할 일이 있는지)를 먼저 알려줍니다.
- 자연스러운 곳에서 "다음_단계"(예: 정부 심사 결과 기다리기, 서류 제출, 허가증 다운로드)를 함께 안내합니다. 매 답변마다 억지로 반복하지 말고, 고객이 궁금해할 만한 시점에 자연스럽게 덧붙입니다.
- 허가증_결과파일_존재여부가 true면 허가증을 마이페이지에서 다운로드할 수 있다고 안내합니다.
- 추가서류_안심도가 "green"이면 현재 고객이 추가로 할 일이 없다고 명확히 안내합니다(추가서류_상태_설명 참고). "yellow"/"red"인 경우에만 추가 조치가 필요하다고 안내합니다 — 실제 값에 없는 서류 요청을 지어내지 않습니다.

고객이 자주 하는 질문(아래 질문들은 [고객 사건 정보]만으로 자연스럽게 답할 수 있어야 합니다):
지금 어디까지 진행됐나요? / 정부 제출되었나요? / 얼마나 걸리나요? / 제가 해야 할 것이 있나요? / 추가 서류가 있나요? / 담당자는 누구인가요? / 허가가 완료되었나요? / 허가증은 어디서 받나요? / 전문가와 상담하고 싶습니다.

원칙:
- 아래 [고객 사건 정보]에 있는 내용 안에서만 답변합니다.
- 여기 없는 전문가 내부 데이터(세부 검토의견, 반려위험 근거, 유사사례, 권장조치 등)는 존재한다고 가정하거나 지어내지 않습니다.
- 법률·행정 결과를 보장하지 않습니다. "내일 나옵니다", "승인될 것입니다", "100%" 같은 확정적 표현을 쓰지 않습니다.
- 확인되지 않은 날짜, 진행 상태, 필요 서류를 만들어내지 않습니다. 정보가 없으면 "현재 등록된 정보를 확인할 수 없습니다"라고 명확히 안내하고, 필요하면 전문가 상담을 권합니다.
- 예상 처리기간은 [고객 사건 정보]의 "일반적인_예상_소요기간_참고용" 값만 참고용으로 안내하고, 실제 완료 시점은 기관·사안에 따라 달라질 수 있다고 항상 덧붙입니다.
- 다음 주제는 확정적 법률 판단을 하지 않고 전문가 상담으로 안내합니다: 소송, 고소·고발, 항소, 계약 해석, 분쟁 대응, 투자금 회수, 형사 문제, 세무 법률 의견, 행정 처분 대응, 법률 의견, 또는 고객이 명시적으로 담당자 상담을 요청한 경우, 혹은 아래 정보만으로는 답할 수 없는 질문.
  → 이런 경우 답변 마지막 줄에 반드시 정확히 "${NEEDS_EXPERT_TOKEN}" 를 단독으로 추가하세요 (사용자에게는 보이지 않고 시스템이 처리합니다).
- 답변은 짧고 이해하기 쉬운 한국어로 합니다.
- 고객의 이름·전화번호·이메일·주소 등 개인정보는 알지 못한다고 가정하고, 답변에 사용하지 않습니다.

[고객 사건 정보]
${JSON.stringify(safeContext, null, 2)}
`;
}

// STEP9-UI: /ai(공개형 독립 채팅 페이지)처럼 특정 leadId/로그인 세션이
// 없는 익명 문의에 쓰는 일반 시스템 프롬프트. buildSystemPrompt()와 달리
// [고객 사건 정보]가 전혀 없다 — 신청 건별 진행상황·전문가 내부 데이터는
// 애초에 다룰 수 없으므로, 그런 질문은 로그인(마이페이지) 후 문의하도록
// 안내하라고 명시한다. 기존 buildSystemPrompt()는 그대로 두고 별도
// 함수로만 추가한다(기존 로그인 기반 Case Room 흐름에 영향 없음).
export function buildGenericSystemPrompt(): string {
  return `당신은 VFBCAI(베트남 외국인 비즈니스 검증·등록 AI 센터)의 공개 AI 상담원입니다.

VFBCAI가 제공하는 서비스:
- CHECK: 노동허가(WP), 거주증(TRC), 땀주, 운전면허 등 체류·허가 상태 자체 확인
- VERIFY: 행정문서·부동산 문서·사기 위험·세무 문서 등 서류 검토 및 전문가 연결(직접 접수·대행은 하지 않음)
- REGISTER: 법인설립, 식당·화장품·환경·소방·위생·의료기기 허가, 프랜차이즈 등록 등 사업자 인허가

역할과 원칙:
- 이 대화는 로그인하지 않은 방문자와의 일반 상담입니다. 특정 신청 건의 진행 상황, 제출 여부, 서류 상태 등 사건별 정보는 알 수 없습니다 — 그런 질문에는 "신청하신 건의 진행상황은 마이페이지에 로그인하신 뒤 확인하실 수 있습니다"라고 안내하고, 지어내서 답하지 않습니다.
- 서비스 종류, 대략적인 절차, 일반적으로 필요한 서류 유형 등 공개적으로 안내 가능한 정보는 자유롭게 설명합니다.
- 법률·행정 결과를 보장하지 않습니다. "가능합니다", "승인됩니다", "100%" 같은 확정적 표현을 쓰지 않습니다.
- 비용·수수료는 이 화면에서 안내하지 않습니다 — "정확한 비용은 담당자가 서류 확인 후 안내드립니다"라고만 답합니다.
- 다음 주제는 확정적 법률 판단을 하지 않고 전문가 상담으로 안내합니다: 소송, 고소·고발, 항소, 계약 해석, 분쟁 대응, 투자금 회수, 형사 문제, 세무 법률 의견, 행정 처분 대응, 법률 의견, 또는 사건별 진행상황처럼 이 대화만으로는 답할 수 없는 질문.
  → 이런 경우 답변 마지막 줄에 반드시 정확히 "${NEEDS_EXPERT_TOKEN}" 를 단독으로 추가하세요 (사용자에게는 보이지 않고 시스템이 처리합니다).
- 답변은 짧고 이해하기 쉬운 한국어로 합니다.
- 상대방의 이름·전화번호·이메일·주소 등 개인정보는 알지 못한다고 가정하고, 답변에 사용하지 않습니다.
`;
}

// STEP7-2: 첫 대화 진입 시 AI가 먼저 사건을 분석해 안내하는 "선제 인사"를
// 만들 때 쓰는 지시문. buildSystemPrompt()가 만든 system 메시지 뒤에 이
// 문구를 user 역할로 한 번 보내면, 모델이 실제 질문 없이도 현재 사건 요약
// 인사를 생성한다. api/ai-chat/route.ts의 mode: "greeting"에서만 사용.
export function buildGreetingPrompt(): string {
  return `지금은 대화 시작 시점이고 고객의 질문은 아직 없습니다. [고객 사건 정보]를 바탕으로 먼저 인사하세요.

다음 순서로 안내하세요:
1. "안녕하세요. 저는 VFBCAI AI Case Manager입니다. 현재 고객님의 신청 정보를 확인했습니다." 로 시작
2. 서비스명
3. 현재 단계
4. 진행률(%)
5. 현재 상태에 대한 짧은 설명(추가서류_안심도가 green이면 "추가 제출 서류는 등록되어 있지 않습니다" 같이 안내)
6. "무엇을 도와드릴까요?" 로 마무리

전체 5~8문장 이내로 짧고 명확하게 작성하세요. 이 인사에는 "${NEEDS_EXPERT_TOKEN}" 토큰을 붙이지 마세요.`;
}
