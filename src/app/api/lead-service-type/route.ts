// src/app/api/lead-service-type/route.ts
//
// /documents 에서 service 쿼리가 빠졌을 때 lead의 service_type만 돌려준다.
// (브라우저 anon 의 leads 읽기 정책 제거용. service_type 외 어떤 컬럼도 반환하지 않는다.)

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("leadId") ?? "";
  if (!UUID_RE.test(leadId)) {
    return NextResponse.json({ serviceType: null }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("service_type")
    .eq("id", leadId)
    .maybeSingle();
  if (error) {
    console.error("[lead-service-type] lookup failed:", error.message);
    return NextResponse.json({ serviceType: null }, { status: 500 });
  }
  return NextResponse.json({
    serviceType: typeof data?.service_type === "string" ? data.service_type : null,
  });
}
