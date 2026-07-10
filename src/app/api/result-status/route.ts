import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }

  const { data: tokenRow, error: tokenError } = await supabaseAdmin
    .from("result_tokens")
    .select("token, lead_id, user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) {
    console.error("result-status tokenError:", tokenError);
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }

  if (!tokenRow) {
    return NextResponse.json({ valid: false, reason: "not_found" });
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, name, phone, address, password_set")
    .eq("id", tokenRow.user_id)
    .maybeSingle();

  if (userError) {
    console.error("result-status userError:", userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { data: leadRow, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, address, kakao_id, zalo_id, service_type, result")
    .eq("id", tokenRow.lead_id)
    .maybeSingle();

  if (leadError) {
    console.error("result-status leadError:", leadError);
    return NextResponse.json({ error: leadError.message }, { status: 500 });
  }

  return NextResponse.json({
    valid: true,
    passwordSet: userRow?.password_set ?? false,
    leadId: tokenRow.lead_id,
    name: userRow?.name ?? leadRow?.name ?? "",
    phone: userRow?.phone ?? leadRow?.phone ?? "",
    address: userRow?.address ?? leadRow?.address ?? "",
    kakaoId: leadRow?.kakao_id ?? null,
    zaloId: leadRow?.zalo_id ?? null,
    serviceType: leadRow?.service_type ?? null,
    result: leadRow?.result ?? null,
  });
}
