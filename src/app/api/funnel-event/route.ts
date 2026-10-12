// src/app/api/funnel-event/route.ts
//
// 퍼널 단계 진입/접수 완료 익명 기록 (설계: docs/master/FUNNEL_TRACKING_DESIGN.md).
// - 개인정보·답변 내용·IP는 저장하지 않는다.
// - 브라우저는 DB에 직접 쓰지 않고 이 API로만 보낸다(서비스 키 사용, funnel_events RLS 정책 없음).
// - 형식 검증 + 세션/IP별 분당 제한(서버 인스턴스 단위, best-effort) + 동일 세션·서비스·단계 중복 무시.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERVICE_RE = /^[a-z0-9_-]{1,60}$/;
const LANG_RE = /^[a-z]{2}(-[A-Za-z]{2})?$/;
const ENGINES = new Set(["check", "verify", "register", "consultation"]);
const EVENTS = new Set(["view", "submit"]);
const DEVICES = new Set(["mobile", "desktop"]);

const PER_SESSION_PER_MIN = 30;
const PER_IP_PER_MIN = 120;
const hits = new Map<string, number[]>();

function overLimit(key: string, max: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < 60_000)) hits.delete(k);
    }
  }
  return recent.length > max;
}

const ok = () => NextResponse.json({ ok: true });
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("invalid_json");
  }

  const sessionId = typeof body.session_id === "string" ? body.session_id : "";
  const engine = typeof body.engine === "string" ? body.engine : "";
  const service = typeof body.service === "string" ? body.service : "";
  const event = typeof body.event === "string" ? body.event : "";
  const step = typeof body.step === "number" ? body.step : NaN;
  const device = typeof body.device === "string" ? body.device : null;
  const lang = typeof body.lang === "string" ? body.lang : null;
  const leadId = typeof body.lead_id === "string" ? body.lead_id : null;

  if (!UUID_RE.test(sessionId)) return bad("invalid_session");
  if (!ENGINES.has(engine)) return bad("invalid_engine");
  if (!SERVICE_RE.test(service) || !service.startsWith(`${engine}_`)) return bad("invalid_service");
  if (!EVENTS.has(event)) return bad("invalid_event");
  if (!Number.isInteger(step) || step < 0 || step > 30) return bad("invalid_step");
  if (device !== null && !DEVICES.has(device)) return bad("invalid_device");
  if (lang !== null && !LANG_RE.test(lang)) return bad("invalid_lang");
  if (leadId !== null && !UUID_RE.test(leadId)) return bad("invalid_lead_id");
  if (event === "view" && leadId !== null) return bad("lead_id_only_on_submit");

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (overLimit(`s:${sessionId}`, PER_SESSION_PER_MIN) || overLimit(`i:${ip}`, PER_IP_PER_MIN)) {
    return bad("rate_limited", 429);
  }

  // 같은 세션·서비스·단계·이벤트 중복 무시(view만; submit은 접수마다 1회 허용)
  if (event === "view") {
    const { data: dup } = await supabaseAdmin
      .from("funnel_events")
      .select("id")
      .eq("session_id", sessionId)
      .eq("service", service)
      .eq("step", step)
      .eq("event", "view")
      .limit(1);
    if (dup && dup.length > 0) return ok();
  }

  const { error } = await supabaseAdmin.from("funnel_events").insert({
    session_id: sessionId,
    engine,
    service,
    step,
    event,
    lead_id: leadId,
    device,
    lang,
  });
  if (error) {
    console.error("[funnel-event] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed", code: error.code ?? null }, { status: 500 });
  }
  return ok();
}
