// src/lib/funnelServer.ts
//
// 서버 전용: 접수 완료(submit) 익명 퍼널 이벤트 기록. 설계: docs/master/FUNNEL_TRACKING_DESIGN.md
// 브라우저가 단계 기록 때 심어 둔 세션 쿠키(vfbcai_fs, 임의 UUID)로 세션을 이어 붙인다.
// 개인정보는 기록하지 않는다(lead_id만 연결). 어떤 실패도 접수 흐름에 영향을 주지 않는다.

import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { serviceFromPathname } from "@/lib/funnelTrack";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const FUNNEL_SESSION_COOKIE = "vfbcai_fs";

export async function recordFunnelSubmit(
  req: NextRequest,
  leadId: string,
  sourcePage: string | null,
): Promise<void> {
  try {
    const sessionId = req.cookies.get(FUNNEL_SESSION_COOKIE)?.value ?? "";
    if (!UUID_RE.test(sessionId) || !UUID_RE.test(leadId) || !sourcePage) return;
    const target = serviceFromPathname(sourcePage);
    if (!target) return;

    const { data: dup } = await supabaseAdmin
      .from("funnel_events")
      .select("id")
      .eq("lead_id", leadId)
      .eq("event", "submit")
      .limit(1);
    if (dup && dup.length > 0) return;

    const { error } = await supabaseAdmin.from("funnel_events").insert({
      session_id: sessionId,
      engine: target.engine,
      service: target.service,
      step: 0,
      event: "submit",
      lead_id: leadId,
    });
    if (error) console.error("[funnel-submit] insert failed:", error.message);
  } catch (err) {
    console.error("[funnel-submit] unexpected:", err);
  }
}
