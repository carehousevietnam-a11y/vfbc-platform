import { supabase } from "@/lib/supabase";
import {
  buildSocialContacts,
  validateLeadForm,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";
import type { MessengerKey } from "@/lib/messenger";
import type { ResultTone } from "@/lib/checkDiagnosis";
import {
  isLoggedInMember,
  loadMemberLeadContact,
} from "@/lib/restoreCheckLead";

function isSameServiceType(
  stored: string | null | undefined,
  expected: string
): boolean {
  if (!stored) return false;
  const a = stored.trim().toLowerCase().replace(/-/g, "_");
  const b = expected.trim().toLowerCase().replace(/-/g, "_");
  return a === b;
}

const RESULT_TONES = new Set<string>(["possible", "conditional", "impossible"]);

function asResultTone(value: unknown): ResultTone | null {
  if (typeof value === "string" && RESULT_TONES.has(value)) {
    return value as ResultTone;
  }
  return null;
}

type MypageItem = {
  id: string;
  serviceType: string | null;
  result: string | null;
  feasibilityScore: number | null;
};

type MypagePayload = {
  items: MypageItem[];
};

async function fetchMypagePayload(accessToken: string): Promise<MypagePayload> {
  const res = await fetch("/api/mypage-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) return { items: [] };
  const body = await res.json().catch(() => null);
  return {
    items: Array.isArray(body?.items) ? (body.items as MypageItem[]) : [],
  };
}

export type RestoredRegisterLead = {
  leadId: string;
  resultTone: ResultTone;
  resultToken: string | null;
  meta: Record<string, unknown> | null;
  feasibilityScore: number | null;
};

export type RegisterMemberEntryState = {
  loggedIn: boolean;
  restored: RestoredRegisterLead | null;
};

/**
 * REGISTER 진입 시 회원가입 생략(로그인)과 서비스별 결과 복원을 분리한다.
 */
export async function loadRegisterMemberEntryState(
  serviceType: string,
  diagnosisAction: string,
  options?: { allowRestore?: boolean }
): Promise<RegisterMemberEntryState> {
  const loggedIn = await isLoggedInMember();
  const allowRestore = options?.allowRestore ?? false;
  const restored =
    loggedIn && allowRestore
      ? await restoreLatestRegisterLead(serviceType, diagnosisAction)
      : null;
  return { loggedIn, restored };
}

/**
 * 로그인 사용자의 해당 service_type 최신 REGISTER lead만 복원한다.
 */
export async function restoreLatestRegisterLead(
  serviceType: string,
  diagnosisAction: string
): Promise<RestoredRegisterLead | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user?.id) return null;

  const { items } = await fetchMypagePayload(session.access_token);
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

  const meta =
    activity?.meta && typeof activity.meta === "object"
      ? (activity.meta as Record<string, unknown>)
      : null;

  return {
    leadId: leadItem.id,
    resultTone,
    resultToken: typeof tokenRow?.token === "string" ? tokenRow.token : null,
    meta,
    feasibilityScore:
      typeof leadItem.feasibilityScore === "number"
        ? leadItem.feasibilityScore
        : typeof meta?.feasibilityScore === "number"
          ? (meta.feasibilityScore as number)
          : null,
  };
}

export type SubmitMemberRegisterLeadParams = {
  serviceType: string;
  sourcePage: string;
  result: ResultTone;
  diagnosisAction: string;
  tag: string;
  meta: Record<string, unknown> | null;
  lang: SupportedLanguage;
  primaryMessengerKey: MessengerKey;
  secondaryMessengerKey: MessengerKey;
  rejectionRecordId?: string | null;
  pendingRejectionInsert?: PromiseLike<void> | null;
};

export type SubmitMemberRegisterLeadResult =
  | { ok: true; leadId: string; resultToken: string | null }
  | { ok: false; reason: "no_contact" | "create_failed" };

/**
 * 로그인 회원용 — 회원가입 폼 없이 해당 service_type의 새 REGISTER lead만 생성한다.
 */
export async function submitMemberRegisterLead(
  params: SubmitMemberRegisterLeadParams
): Promise<SubmitMemberRegisterLeadResult> {
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
    console.error("member register lead insert failed:", error);
    return { ok: false, reason: "create_failed" };
  }

  await supabase.from("crm_activities").insert({
    lead_id: leadId,
    action: params.diagnosisAction,
    tag: params.tag,
    meta: params.meta,
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
      console.error("member register lead-submit API error:", errBody);
    }
  } catch (apiErr) {
    console.error("member register lead-submit fetch failed:", apiErr);
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

export { isLoggedInMember, loadMemberLeadContact };
