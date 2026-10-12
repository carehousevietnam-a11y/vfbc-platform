// src/app/api/previous-rejection/route.ts
//
// previous_rejections 서버 경유 저장 (보안: 브라우저 anon 직접 쓰기 제거용).
// - insert: 거절 이력 한 줄 생성(id는 브라우저가 만든 UUID)
// - update: 해당 id 행에 사유(reason) 또는 연결 리드(linked_lead_id)를 "한 번만" 채운다.
// 읽기·삭제는 제공하지 않는다.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERVICE_RE = /^[a-z0-9_-]{1,60}$/;
const REASON_MAX = 2000;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("invalid_json");
  }

  const action = body.action;
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) return bad("invalid_id");

  if (action === "insert") {
    const serviceType = typeof body.service_type === "string" ? body.service_type : "";
    const sourcePage = typeof body.source_page === "string" ? body.source_page : "";
    if (!SERVICE_RE.test(serviceType)) return bad("invalid_service_type");
    if (!sourcePage.startsWith("/") || sourcePage.length > 100) return bad("invalid_source_page");

    const { error } = await supabaseAdmin.from("previous_rejections").insert({
      id,
      service_type: serviceType,
      source_page: sourcePage,
      reason: null,
    });
    if (error) {
      console.error("[previous-rejection] insert failed:", error.message);
      return bad("insert_failed", 500);
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const reason = body.reason;
    const linkedLeadId = body.linked_lead_id;

    if (typeof reason === "string") {
      const trimmed = reason.trim();
      if (!trimmed || trimmed.length > REASON_MAX) return bad("invalid_reason");
      const { error } = await supabaseAdmin
        .from("previous_rejections")
        .update({ reason: trimmed })
        .eq("id", id)
        .is("reason", null);
      if (error) {
        console.error("[previous-rejection] reason update failed:", error.message);
        return bad("update_failed", 500);
      }
      return NextResponse.json({ ok: true });
    }

    if (typeof linkedLeadId === "string") {
      if (!UUID_RE.test(linkedLeadId)) return bad("invalid_lead_id");
      const { error } = await supabaseAdmin
        .from("previous_rejections")
        .update({ linked_lead_id: linkedLeadId })
        .eq("id", id)
        .is("linked_lead_id", null);
      if (error) {
        console.error("[previous-rejection] link update failed:", error.message);
        return bad("update_failed", 500);
      }
      return NextResponse.json({ ok: true });
    }

    return bad("nothing_to_update");
  }

  return bad("invalid_action");
}
