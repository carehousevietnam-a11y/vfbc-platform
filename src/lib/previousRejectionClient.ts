// src/lib/previousRejectionClient.ts
//
// previous_rejections 는 브라우저(anon)에서 직접 쓰지 않고 /api/previous-rejection 으로만 저장한다.
// 반환 형태는 기존 supabase 호출과 같게({ error }) 맞춰 호출부 변경을 최소화한다.

type RejectionResult = { error: Error | null };

async function post(payload: Record<string, unknown>): Promise<RejectionResult> {
  try {
    const res = await fetch("/api/previous-rejection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { error: new Error(`previous_rejection_${res.status}`) };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error("previous_rejection_network") };
  }
}

export function insertPreviousRejection(row: {
  id: string;
  service_type: string;
  source_page: string;
  reason?: null;
}): Promise<RejectionResult> {
  return post({
    action: "insert",
    id: row.id,
    service_type: row.service_type,
    source_page: row.source_page,
  });
}

export function updatePreviousRejection(
  id: string,
  patch: { reason?: string; linked_lead_id?: string }
): Promise<RejectionResult> {
  return post({ action: "update", id, ...patch });
}
