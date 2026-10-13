// src/app/api/lead-intake/route.ts
//
// 익명 접수 서버 경유(leads + crm_activities 1건). 브라우저가 DB에 직접 insert하던 것을 대체한다.
// - 서비스 키로만 DB에 쓴다. 입력은 형식·허용 목록·크기를 검증한다.
// - user_id는 클라이언트가 보낸 값을 믿지 않는다. Authorization Bearer 토큰을 서버가 검증해 얻는다.
// - 속도 제한: IP·연락처별(서버 인스턴스 단위 보조). 주 제한은 Vercel 방화벽 규칙(문서 참조).
// - 오류 응답에는 내부 정보(DB 메시지)를 넣지 않는다.
// 근거: docs/master/SECURITY_RLS_AUDIT.md

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidAddress, isValidEmail, isValidName, isValidPhone, isValidSocialId } from "@/lib/customerRegistrationValidation";
import {
  CRM_ACTION_RE,
  CRM_TAG_RE,
  MAX_BODY_BYTES,
  MAX_META_BYTES,
  RATE_PER_IP_MAX,
  RATE_PER_IP_WINDOW_MS,
  RATE_PER_PHONE_MAX,
  RATE_PER_PHONE_WINDOW_MS,
  SERVICE_TYPE_RE,
  SOURCE_PAGE_RE,
  UUID_RE,
} from "@/lib/leadIntakeRules";

const hits = new Map<string, number[]>();

function overLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  return recent.length > max;
}

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.length <= max ? v : null;

export async function POST(req: NextRequest) {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) return bad("too_large", 413);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("invalid_json");
  }

  const lead = (body.lead ?? null) as Record<string, unknown> | null;
  if (!lead || typeof lead !== "object") return bad("invalid_lead");

  const name = str(lead.name, 100);
  const phone = str(lead.phone, 40);
  const address = str(lead.address, 500);
  const emailRaw = lead.email == null || lead.email === "" ? null : str(lead.email, 200);
  const kakao = lead.kakao_id == null || lead.kakao_id === "" ? null : str(lead.kakao_id, 100);
  const zalo = lead.zalo_id == null || lead.zalo_id === "" ? null : str(lead.zalo_id, 100);
  const serviceType = str(lead.service_type, 60);
  const sourcePage = str(lead.source_page, 80);
  const result = lead.result == null ? null : str(lead.result, 200);
  const leadId = lead.id == null ? crypto.randomUUID() : str(lead.id, 36);

  if (!name || !isValidName(name)) return bad("invalid_name");
  if (!phone || !isValidPhone(phone)) return bad("invalid_phone");
  // 주소는 상담 접수에서 비어 있을 수 있어 값이 있을 때만 형식을 검사한다(기존 폼 규칙은 화면에서 이미 적용됨).
  if (address === null) return bad("invalid_address");
  if (address.trim() !== "" && !isValidAddress(address)) return bad("invalid_address");
  if (emailRaw !== null && !isValidEmail(emailRaw)) return bad("invalid_email");
  if (kakao !== null && !isValidSocialId(kakao)) return bad("invalid_kakao");
  if (zalo !== null && !isValidSocialId(zalo)) return bad("invalid_zalo");
  if (!serviceType || !SERVICE_TYPE_RE.test(serviceType)) return bad("invalid_service_type");
  if (!sourcePage || !SOURCE_PAGE_RE.test(sourcePage)) return bad("invalid_source_page");
  if (lead.result != null && result === null) return bad("invalid_result");
  if (!leadId || !UUID_RE.test(leadId)) return bad("invalid_lead_id");

  // crm 기록(선택)
  let crm: { action: string; tag: string; meta: Record<string, unknown> | null } | null = null;
  if (body.crm != null) {
    const c = body.crm as Record<string, unknown>;
    const action = str(c.action, 80);
    const tag = str(c.tag, 80);
    if (!action || !CRM_ACTION_RE.test(action)) return bad("invalid_crm_action");
    if (!tag || !CRM_TAG_RE.test(tag)) return bad("invalid_crm_tag");
    let meta: Record<string, unknown> | null = null;
    if (c.meta != null) {
      if (typeof c.meta !== "object" || Array.isArray(c.meta)) return bad("invalid_crm_meta");
      if (JSON.stringify(c.meta).length > MAX_META_BYTES) return bad("meta_too_large", 413);
      meta = c.meta as Record<string, unknown>;
    }
    crm = { action, tag, meta };
  }

  // 속도 제한
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const phoneKey = phone.replace(/\D/g, "");
  if (
    overLimit(`i:${ip}`, RATE_PER_IP_WINDOW_MS, RATE_PER_IP_MAX) ||
    overLimit(`p:${phoneKey}`, RATE_PER_PHONE_WINDOW_MS, RATE_PER_PHONE_MAX)
  ) {
    return bad("rate_limited", 429);
  }

  // 로그인 회원이면 서버가 토큰을 검증해 user_id를 얻는다(클라이언트 값은 사용하지 않음).
  let userId: string | null = null;
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ") && auth.length < 4000) {
    const { data } = await supabaseAdmin.auth.getUser(auth.slice(7));
    userId = data.user?.id ?? null;
  }

  const { error: leadErr } = await supabaseAdmin.from("leads").insert({
    id: leadId,
    name,
    phone,
    address,
    email: emailRaw,
    kakao_id: kakao,
    zalo_id: zalo,
    service_type: serviceType,
    result,
    source_page: sourcePage,
    user_id: userId,
  });
  if (leadErr) {
    console.error("[lead-intake] leads insert failed:", leadErr.code);
    return bad("insert_failed", 500);
  }

  if (crm) {
    const { error: crmErr } = await supabaseAdmin.from("crm_activities").insert({
      lead_id: leadId,
      action: crm.action,
      tag: crm.tag,
      meta: crm.meta,
    });
    if (crmErr) console.error("[lead-intake] crm insert failed:", crmErr.code);
  }

  return NextResponse.json({ ok: true, leadId });
}
