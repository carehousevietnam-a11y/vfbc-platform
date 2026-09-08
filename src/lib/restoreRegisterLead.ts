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
import { useEffect, useRef, useState } from "react";

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

/** Auth getSession hang 방지 — restore=1 경로 전용 */
const REGISTER_AUTH_TIMEOUT_MS = 3_000;
/** mypage/lead 복원 hang 방지 — restore=1 경로 전용 */
const REGISTER_RESTORE_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, ms);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

/**
 * REGISTER 진입 시 회원가입 생략(로그인)과 서비스별 결과 복원을 분리한다.
 *
 * - allowRestore=false (기본 랜딩): Auth getSession을 기다리지 않는다.
 *   Master UI가 `이전 결과를 확인하는 중…`에 고정되지 않도록 즉시 반환한다.
 *   로그인 생략은 페이지 onAuthStateChange(SIGNED_IN) 및 랜딩 continue에서 처리한다.
 * - allowRestore=true (?restore=1 / 랜딩 continue): 기존 복원을 유지하되
 *   Auth·복원이 지연·실패해도 영구 hang하지 않고 skip한다.
 */
export async function loadRegisterMemberEntryState(
  serviceType: string,
  diagnosisAction: string,
  options?: { allowRestore?: boolean }
): Promise<RegisterMemberEntryState> {
  const allowRestore = options?.allowRestore ?? false;

  if (!allowRestore) {
    return { loggedIn: false, restored: null };
  }

  const loggedIn = await withTimeout(
    isLoggedInMember(),
    REGISTER_AUTH_TIMEOUT_MS,
    false
  );
  if (!loggedIn) {
    return { loggedIn: false, restored: null };
  }

  const restored = await withTimeout(
    restoreLatestRegisterLead(serviceType, diagnosisAction),
    REGISTER_RESTORE_TIMEOUT_MS,
    null
  );
  return { loggedIn: true, restored };
}

/**
 * REGISTER 페이지 공통 진입 게이트.
 * - 기본 랜딩: pending=false로 시작해 Auth를 기다리지 않고 Master UI를 즉시 표시한다.
 * - ?restore=1: 복원 중에만 pending=true. Auth/network 지연·실패 시 skip 후 pending 해제.
 * - Strict Mode cleanup 후에도 pending이 영구 true로 남지 않도록 finally에서 항상 해제한다.
 * - 로그인 생략(skipSignup)은 getSession 없이 onAuthStateChange 세션으로 처리한다.
 */
export function useRegisterRestoreGate(
  serviceType: string,
  diagnosisAction: string,
  handlers: {
    onLoggedIn: () => void;
    onRestored: (restored: RestoredRegisterLead) => void;
  }
): boolean {
  const [pending, setPending] = useState(false);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let cancelled = false;

    async function runRestoreIfRequested() {
      const allowRestore =
        new URLSearchParams(window.location.search).get("restore") === "1";
      if (!allowRestore) return;

      setPending(true);
      try {
        const { loggedIn, restored } = await loadRegisterMemberEntryState(
          serviceType,
          diagnosisAction,
          { allowRestore: true }
        );
        if (cancelled) return;
        if (loggedIn) handlersRef.current.onLoggedIn();
        if (restored) handlersRef.current.onRestored(restored);
      } finally {
        // cancelled여도 해제 — Strict Mode 첫 mount cleanup 후 hang 방지
        setPending(false);
      }
    }

    void runRestoreIfRequested();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;
      if (!cancelled && session) handlersRef.current.onLoggedIn();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [serviceType, diagnosisAction]);

  return pending;
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
