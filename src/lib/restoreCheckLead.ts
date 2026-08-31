import { supabase } from "@/lib/supabase";
import { getLeadContact } from "@/lib/leadContact";
import {
  buildSocialContacts,
  validateLeadForm,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";
import type { MessengerKey } from "@/lib/messenger";
import type { DiagnosisResult, ResultTone } from "@/lib/checkDiagnosis";

export type CheckServiceType = "wp" | "trc" | "tamtru" | "driving-license";

function isSameServiceType(
  stored: string | null | undefined,
  expected: string
): boolean {
  if (!stored) return false;
  const a = stored.trim().toLowerCase().replace(/-/g, "_");
  const b = expected.trim().toLowerCase().replace(/-/g, "_");
  return a === b;
}

export type RestoredCheckLead = {
  leadId: string;
  resultTone: ResultTone;
  resultToken: string | null;
  diagnosis: DiagnosisResult | null;
};

export type MemberLeadContact = {
  name: string;
  phone: string;
  address: string;
  email: string;
  kakao_id: string | null;
  zalo_id: string | null;
};

export type SubmitMemberCheckLeadResult =
  | { ok: true; leadId: string; resultToken: string | null }
  | { ok: false; reason: "no_contact" | "create_failed" };

const RESULT_TONES = new Set<string>(["possible", "conditional", "impossible"]);

function asResultTone(value: unknown): ResultTone | null {
  if (typeof value === "string" && RESULT_TONES.has(value)) {
    return value as ResultTone;
  }
  return null;
}

/** crm_activities.meta에 저장된 score + expertBrief만으로 DiagnosisResult 재구성. 없는 값은 만들지 않는다. */
function diagnosisFromMeta(
  resultTone: ResultTone,
  meta: unknown
): DiagnosisResult | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  if (typeof m.feasibilityScore !== "number") return null;
  const expertBrief = m.expertBrief;
  if (!expertBrief || typeof expertBrief !== "object") return null;
  const brief = expertBrief as DiagnosisResult["expertBrief"];
  if (!Array.isArray(brief.checkedItems)) return null;

  return {
    customerView: {
      feasibilityScore: m.feasibilityScore,
      resultTone,
      estimatedDays: null,
      checklist: brief.checkedItems.map((item) => ({
        label: item.label,
        passed: item.passed,
      })),
      note: "",
    },
    expertBrief: brief,
  };
}

/** mypage feasibilityScore만으로 최소 customerView 구성(체크리스트 추측 금지). */
function diagnosisFromScore(
  resultTone: ResultTone,
  feasibilityScore: number | null | undefined
): DiagnosisResult | null {
  if (typeof feasibilityScore !== "number") return null;
  return {
    customerView: {
      feasibilityScore,
      resultTone,
      estimatedDays: null,
      checklist: [],
      note: "",
    },
    expertBrief: {
      riskLevel: resultTone === "possible" ? "low" : resultTone === "conditional" ? "medium" : "high",
      checkedItems: [],
      rejectionRisks: [],
      similarCases: [],
      recommendedSteps: [],
    },
  };
}

type MypageItem = {
  id: string;
  serviceType: string | null;
  result: string | null;
  feasibilityScore: number | null;
  createdAt: string;
};

type MypagePayload = {
  items: MypageItem[];
  memberContact: {
    name: string;
    phone: string;
    address: string | null;
    email: string | null;
    kakao_id: string | null;
    zalo_id: string | null;
  } | null;
};

async function fetchMypagePayload(accessToken: string): Promise<MypagePayload> {
  const res = await fetch("/api/mypage-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) return { items: [], memberContact: null };
  const body = await res.json().catch(() => null);
  return {
    items: Array.isArray(body?.items) ? (body.items as MypageItem[]) : [],
    memberContact:
      body?.memberContact &&
      typeof body.memberContact === "object" &&
      typeof body.memberContact.name === "string" &&
      typeof body.memberContact.phone === "string"
        ? body.memberContact
        : null,
  };
}

/**
 * 로그인 여부만 본다. 결과 복원과 무관하다.
 */
export async function isLoggedInMember(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  return Boolean(sessionData.session);
}

export type CheckMemberEntryState = {
  loggedIn: boolean;
  restored: RestoredCheckLead | null;
};

/**
 * CHECK 진입 시 회원가입 생략(로그인)과 서비스별 결과 복원을 분리해서 조회한다.
 * - loggedIn: 세션 있으면 회원가입 폼 생략
 * - restored: allowRestore=true이고 현재 service_type lead가 있을 때만 복원
 */
export async function loadCheckMemberEntryState(
  serviceType: CheckServiceType,
  diagnosisAction: string,
  options?: { allowRestore?: boolean }
): Promise<CheckMemberEntryState> {
  const loggedIn = await isLoggedInMember();
  const allowRestore = options?.allowRestore ?? false;
  const restored =
    loggedIn && allowRestore
      ? await restoreLatestCheckLead(serviceType, diagnosisAction)
      : null;
  return { loggedIn, restored };
}

/**
 * 로그인 사용자의 해당 service_type 최신 lead만 복원한다.
 * 다른 service_type lead는 절대 반환하지 않는다.
 */
export async function restoreLatestCheckLead(
  serviceType: CheckServiceType,
  diagnosisAction: string
): Promise<RestoredCheckLead | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user?.id) return null;

  const { items } = await fetchMypagePayload(session.access_token);
  // mypage-data는 created_at desc — 동일 serviceType 중 첫 항목이 최신
  const leadItem = items.find((item) =>
    isSameServiceType(item.serviceType, serviceType)
  );
  if (!leadItem?.id) return null;
  if (!isSameServiceType(leadItem.serviceType, serviceType)) return null;

  const resultTone = asResultTone(leadItem.result);
  if (!resultTone) return null;

  const [{ data: tokenRow }, { data: activity }] = await Promise.all([
    supabase
      .from("result_tokens")
      .select("token")
      .eq("lead_id", leadItem.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("crm_activities")
      .select("meta")
      .eq("lead_id", leadItem.id)
      .eq("action", diagnosisAction)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const fromMeta = diagnosisFromMeta(resultTone, activity?.meta ?? null);
  const diagnosis =
    fromMeta ?? diagnosisFromScore(resultTone, leadItem.feasibilityScore);

  return {
    leadId: leadItem.id,
    resultTone,
    resultToken: typeof tokenRow?.token === "string" ? tokenRow.token : null,
    diagnosis,
  };
}

/**
 * 기존 회원 연락처 — /api/mypage-data(memberContact) 우선.
 * anon leads select에 의존하지 않는다.
 */
export async function loadMemberLeadContact(): Promise<MemberLeadContact | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token) return null;

  const { memberContact } = await fetchMypagePayload(session.access_token);
  const cached = getLeadContact();

  if (memberContact?.name && memberContact?.phone) {
    return {
      name: memberContact.name,
      phone: memberContact.phone,
      address:
        (typeof memberContact.address === "string" && memberContact.address.trim()) ||
        cached?.address ||
        "",
      email:
        (typeof memberContact.email === "string" && memberContact.email.trim()) ||
        session.user.email ||
        "",
      kakao_id:
        (typeof memberContact.kakao_id === "string" && memberContact.kakao_id) ||
        cached?.kakao_id ||
        null,
      zalo_id:
        (typeof memberContact.zalo_id === "string" && memberContact.zalo_id) ||
        cached?.zalo_id ||
        null,
    };
  }

  if (cached?.name && cached?.phone) {
    return {
      name: cached.name,
      phone: cached.phone,
      address: cached.address || "",
      email: session.user.email || "",
      kakao_id: cached.kakao_id ?? null,
      zalo_id: cached.zalo_id ?? null,
    };
  }

  return null;
}

export type SubmitMemberCheckLeadParams = {
  serviceType: CheckServiceType;
  sourcePage: string;
  result: ResultTone;
  diagnosisAction: string;
  tag: string;
  diagnosis: DiagnosisResult | null;
  previousRejection: boolean | null;
  rejectionReason: string;
  lang: SupportedLanguage;
  primaryMessengerKey: MessengerKey;
  secondaryMessengerKey: MessengerKey;
  rejectionRecordId?: string | null;
  pendingRejectionInsert?: PromiseLike<void> | null;
};

/**
 * 로그인 회원용 — 회원가입 폼 없이 해당 service_type의 새 lead만 생성하고
 * 기존 /api/lead-submit으로 user_id를 연결한다(기존 user 재사용).
 */
export async function submitMemberCheckLead(
  params: SubmitMemberCheckLeadParams
): Promise<SubmitMemberCheckLeadResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.user?.id) return { ok: false, reason: "no_contact" };

  const contact = await loadMemberLeadContact();
  if (!contact) return { ok: false, reason: "no_contact" };

  const { name, phone, address, email, kakao_id, zalo_id } = contact;
  const { valid } = validateLeadForm(
    {
      name,
      phone,
      address,
      email,
      kakao_id: kakao_id ?? "",
      zalo_id: zalo_id ?? "",
    },
    params.lang
  );
  // 연락처가 lead-submit 검증을 통과하지 못하면 "확보 불가"로 보고 폼 폴백만 허용
  if (!valid) return { ok: false, reason: "no_contact" };

  const leadId = crypto.randomUUID();

  const socialContacts = buildSocialContacts({
    kakaoValue: kakao_id,
    zaloValue: zalo_id,
    primaryKey: params.primaryMessengerKey,
    secondaryKey: params.secondaryMessengerKey,
  });

  const { error } = await supabase.from("leads").insert({
    id: leadId,
    name,
    phone,
    address,
    email: email || null,
    kakao_id,
    zalo_id,
    user_id: session.user.id,
    service_type: params.serviceType,
    result: params.result,
    source_page: params.sourcePage,
  });

  if (error) {
    console.error("member check lead insert failed:", error);
    return { ok: false, reason: "create_failed" };
  }

  await supabase.from("crm_activities").insert({
    lead_id: leadId,
    action: params.diagnosisAction,
    tag: params.tag,
    meta: params.diagnosis
      ? {
          feasibilityScore: params.diagnosis.customerView.feasibilityScore,
          expertBrief: params.diagnosis.expertBrief,
          previousRejection:
            params.previousRejection === true
              ? { rejected: true, reason: params.rejectionReason || null }
              : params.previousRejection === false
              ? { rejected: false }
              : null,
        }
      : null,
  });

  let resultToken: string | null = null;
  try {
    const { data: existingActivity } = await supabase
      .from("crm_activities")
      .select("id, meta")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingActivity?.id) {
      const existingMeta =
        existingActivity.meta && typeof existingActivity.meta === "object"
          ? existingActivity.meta
          : {};
      await supabase
        .from("crm_activities")
        .update({
          meta: {
            ...existingMeta,
            socialContacts,
            preferredLanguage: params.lang,
          },
        })
        .eq("id", existingActivity.id);
    }

    const res = await fetch("/api/lead-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        name,
        phone,
        email,
        address,
        lang: params.lang,
        kakao_id,
        zalo_id,
      }),
    });
    if (res.ok) {
      const okBody = await res.json().catch(() => null);
      if (typeof okBody?.token === "string") resultToken = okBody.token;
    } else {
      const errBody = await res.json().catch(() => null);
      console.error("member lead-submit API error:", errBody);
    }
  } catch (apiErr) {
    console.error("member lead-submit fetch failed:", apiErr);
  }

  if (params.pendingRejectionInsert) {
    await params.pendingRejectionInsert;
  }
  if (params.rejectionRecordId) {
    try {
      await supabase
        .from("previous_rejections")
        .update({ linked_lead_id: leadId })
        .eq("id", params.rejectionRecordId);
    } catch (linkErr) {
      console.error("previous_rejections link failed:", linkErr);
    }
  }

  return { ok: true, leadId, resultToken };
}

/**
 * result_tokens.token으로 브라우저 Supabase 세션을 만든다(리다이렉트 없음).
 * 최초 회원가입(/api/lead-submit) 직후 호출해, 이후 CHECK 다른 서비스에서
 * 회원가입 폼 없이 skipSignup + restore/submitMember가 동작하게 한다.
 */
export async function establishBrowserSessionFromResultToken(
  token: string
): Promise<boolean> {
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) return true;

  try {
    const res = await fetch("/api/auto-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || typeof data?.hashedToken !== "string") {
      console.error("establishBrowserSession auto-login failed:", data);
      return false;
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: data.hashedToken,
      type: "magiclink",
    });
    if (error) {
      console.error("establishBrowserSession verifyOtp failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("establishBrowserSession failed:", err);
    return false;
  }
}
