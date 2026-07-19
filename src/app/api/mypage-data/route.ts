import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// 왜 새 API가 필요한가:
// - 고객 인증은 이미 존재한다 (Supabase Auth, /r 페이지의 magiclink 자동로그인 —
//   auto-login/route.ts 참고). 로그인 후 브라우저에는 실제 Supabase 세션이 생긴다.
// - 하지만 leads/crm_activities 테이블의 RLS가 사용자별로 범위가 좁혀져 있는지
//   코드만으로는 확인할 수 없다(프로젝트 관례상 "to public FOR ALL"로 생성된
//   테이블이 많음). 클라이언트에서 anon key로 직접 leads를 조회하면, RLS가
//   느슨할 경우 다른 고객의 데이터까지 노출될 위험이 있다.
// - 그래서 이 API가 브라우저의 access_token을 서버에서 supabaseAdmin.auth.getUser()로
//   직접 검증(위조 불가)한 뒤, 그 결과로 확인된 user_id로만 조회한다. 인가 판단을
//   RLS에 맡기지 않고 이 라우트 자체가 안전하게 수행한다.
// - 기존 result-status API는 1건의 리드를 token으로 조회하는 용도라 목적이 다르고,
//   로그인한 사용자의 전체 리드 목록 조회 용도로는 재사용할 수 없어 신규 생성함.

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

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = (await req.json()) as { accessToken?: string };
    if (!accessToken) {
      return NextResponse.json({ error: "로그인 정보가 없습니다." }, { status: 401 });
    }

    // access_token을 서버에서 직접 검증 — 클라이언트가 보낸 user_id를 그대로
    // 믿지 않는다(위조 방지). 이 호출이 실패하면 반드시 401을 반환한다.
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

      const hasExpertReview = actions.has("expert_review_request");
      const hasAgency = actions.has("agency_upgrade_request");
      const hasConsultation = actions.has("consultation_request");
      const hasDiagnosis = leadActivities.some(
        (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
      );

      // 실제 존재하는 action 값만으로 진행상태를 판단한다 (leads.status 등
      // 확인되지 않은 컬럼 사용 안 함).
      let status = "접수 완료";
      if (hasAgency) status = "대행 신청 접수됨";
      else if (hasExpertReview) status = "전문가 검토 요청됨";
      else if (hasConsultation) status = "상담 신청됨";
      else if (hasDiagnosis) status = "AI 진단 완료";

      // ⚠️ 안전 경계: expertBrief / expert_brief(전문가 전용 — checkedItems의
      // 사유, rejectionRisks, recommendedSteps, similarCases 등 "왜"에 해당하는
      // 내용)는 checkDiagnosis.ts/verifyDiagnosis.ts 자체 주석에 "고객에게 절대
      // 노출 금지"로 명시되어 있어 이 API는 절대 포함하지 않는다.
      // feasibilityScore(점수)는 각 진단 화면에서 이미 고객에게 직접 보여주는
      //값이라 안전하게 재사용한다.
      let feasibilityScore: number | null = null;
      for (const a of leadActivities) {
        const meta = asMeta(a.meta);
        if (typeof meta?.feasibilityScore === "number") {
          feasibilityScore = meta.feasibilityScore as number;
        }
      }

      const hasAttachment = leadActivities.some((a) => Boolean(asMeta(a.meta)?.file_url));

      const normalizedType = normalizeServiceType(lead.service_type);

      return {
        id: lead.id,
        category: getCategory(normalizedType),
        serviceLabel: getServiceLabel(normalizedType ?? lead.service_type ?? ""),
        result: lead.result,
        feasibilityScore,
        status,
        hasExpertReview,
        hasAgency,
        hasAttachment,
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
