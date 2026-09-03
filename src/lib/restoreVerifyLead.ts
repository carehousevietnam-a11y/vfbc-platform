import { supabase } from "@/lib/supabase";
import {
  buildSocialContacts,
  validateLeadForm,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";
import type { MessengerKey } from "@/lib/messenger";
import {
  isLoggedInMember,
  loadMemberLeadContact,
  type MemberLeadContact,
} from "@/lib/restoreCheckLead";

export type VerifyServiceType =
  | "verify_admin"
  | "verify_real-estate"
  | "verify_fraud"
  | "verify_tax"
  | "verify_unclear";

const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company",
};

function normalizeServiceTypeKey(value: string): string {
  const key = value.trim().toLowerCase().replace(/-/g, "_");
  return SERVICE_TYPE_ALIASES[key] ?? key;
}

function isSameServiceType(
  stored: string | null | undefined,
  expected: string
): boolean {
  if (!stored) return false;
  return normalizeServiceTypeKey(stored) === normalizeServiceTypeKey(expected);
}

type MypageItem = {
  id: string;
  serviceType: string | null;
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

export type RestoredVerifyLead = {
  leadId: string;
  resultToken: string | null;
  verifyMeta: Record<string, unknown> | null;
};

export type VerifyMemberEntryState = {
  loggedIn: boolean;
  restored: RestoredVerifyLead | null;
};

/**
 * VERIFY 진입 시 회원가입 생략(로그인)과 서비스별 결과 복원을 분리한다.
 * - loggedIn: 세션 있으면 회원가입 폼 생략
 * - restored: allowRestore=true이고 현재 service_type lead가 있을 때만 복원
 */
export async function loadVerifyMemberEntryState(
  serviceType: VerifyServiceType,
  options?: { allowRestore?: boolean }
): Promise<VerifyMemberEntryState> {
  const loggedIn = await isLoggedInMember();
  const allowRestore = options?.allowRestore ?? false;
  const restored =
    loggedIn && allowRestore
      ? await restoreLatestVerifyLead(serviceType)
      : null;
  return { loggedIn, restored };
}

/**
 * 로그인 사용자의 해당 service_type 최신 VERIFY lead만 복원한다.
 */
export async function restoreLatestVerifyLead(
  serviceType: VerifyServiceType
): Promise<RestoredVerifyLead | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user?.id) return null;

  const { items } = await fetchMypagePayload(session.access_token);
  const leadItem = items.find((item) =>
    isSameServiceType(item.serviceType, serviceType)
  );
  if (!leadItem?.id) return null;
  if (!isSameServiceType(leadItem.serviceType, serviceType)) return null;

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
      .eq("action", "verify_lead")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const verifyMeta =
    activity?.meta && typeof activity.meta === "object"
      ? (activity.meta as Record<string, unknown>)
      : null;
  if (!verifyMeta) return null;

  return {
    leadId: leadItem.id,
    resultToken: typeof tokenRow?.token === "string" ? tokenRow.token : null,
    verifyMeta,
  };
}

export type InsertMemberVerifyLeadParams = {
  serviceType: VerifyServiceType;
  sourcePage: string;
  tag: string;
  verifyMeta: Record<string, unknown>;
  lang: SupportedLanguage;
  primaryMessengerKey: MessengerKey;
  secondaryMessengerKey: MessengerKey;
  /** 파일 업로드 경로 등에 leadId가 먼저 필요할 때 페이지에서 지정 */
  leadId?: string;
};

export type InsertMemberVerifyLeadResult =
  | { ok: true; leadId: string; resultToken: string | null; contact: MemberLeadContact }
  | { ok: false; reason: "no_contact" | "create_failed" };

/**
 * 로그인 회원용 — 회원가입 폼 없이 해당 service_type의 새 VERIFY lead만 생성한다.
 * crm_activities(verify_lead) 삽입은 각 페이지가 verifyMeta를 넘긴 뒤 이 함수가 처리한다.
 */
export async function insertMemberVerifyLead(
  params: InsertMemberVerifyLeadParams
): Promise<InsertMemberVerifyLeadResult> {
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

  const leadId = params.leadId ?? crypto.randomUUID();
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
    result: null,
    source_page: params.sourcePage,
  });

  if (error) {
    console.error("member verify lead insert failed:", error);
    return { ok: false, reason: "create_failed" };
  }

  await supabase.from("crm_activities").insert({
    lead_id: leadId,
    action: "verify_lead",
    tag: params.tag,
    meta: params.verifyMeta,
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
      console.error("member verify lead-submit API error:", errBody);
    }
  } catch (apiErr) {
    console.error("member verify lead-submit fetch failed:", apiErr);
  }

  return { ok: true, leadId, resultToken, contact };
}

export { isLoggedInMember, loadMemberLeadContact };
