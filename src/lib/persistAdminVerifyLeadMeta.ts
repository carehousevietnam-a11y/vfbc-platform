import { supabase } from "@/lib/supabase";

export type PersistAdminVerifyLeadMetaResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "no_session"
        | "network_error"
        | "unauthorized"
        | "forbidden"
        | "not_found"
        | "validation_error"
        | "no_activity"
        | "update_failed";
      message: string;
      serverError?: string;
    };

type ApiErrorBody = {
  error?: string;
  reason?: string;
  message?: string;
  serverError?: string;
};

/**
 * Admin VERIFY Phase2 — server-side crm_activities.meta merge (RLS-safe).
 * Replaces client-side persistRealEstateVerifyLeadMeta for /verify/admin only.
 */
export async function persistAdminVerifyLeadMeta(
  leadId: string,
  partialMeta: Record<string, string>,
): Promise<PersistAdminVerifyLeadMetaResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return {
      ok: false,
      reason: "no_session",
      message: "로그인 세션이 없어 Phase 2 진행 상태를 저장할 수 없습니다.",
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/admin-verify-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, leadId, partialMeta }),
    });
  } catch (err) {
    console.error("[persistAdminVerifyLeadMeta] network error:", err);
    return {
      ok: false,
      reason: "network_error",
      message: "Phase 2 진행 상태 저장 요청에 실패했습니다. 네트워크 연결을 확인해 주세요.",
    };
  }

  if (res.ok) {
    return { ok: true };
  }

  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const message =
    (typeof body?.message === "string" && body.message) ||
    (typeof body?.error === "string" && body.error) ||
    `Phase 2 진행 상태 저장에 실패했습니다. (${res.status})`;
  const reasonRaw = body?.reason ?? "";
  const reason = isPersistFailureReason(reasonRaw) ? reasonRaw : mapStatusToReason(res.status);

  console.error("[persistAdminVerifyLeadMeta] failed:", {
    status: res.status,
    reason,
    message,
    serverError: body?.serverError,
    leadId,
  });

  return {
    ok: false,
    reason,
    message,
    serverError: typeof body?.serverError === "string" ? body.serverError : undefined,
  };
}

function isPersistFailureReason(
  value: string,
): value is Exclude<PersistAdminVerifyLeadMetaResult, { ok: true }>["reason"] {
  return (
    value === "no_session" ||
    value === "network_error" ||
    value === "unauthorized" ||
    value === "forbidden" ||
    value === "not_found" ||
    value === "validation_error" ||
    value === "no_activity" ||
    value === "update_failed"
  );
}

function mapStatusToReason(
  status: number,
): Exclude<PersistAdminVerifyLeadMetaResult, { ok: true }>["reason"] {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 400) return "validation_error";
  return "update_failed";
}
