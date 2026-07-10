import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 사용자가 절대 알 필요 없는 랜덤 비밀번호 생성 (추후 마이페이지에서 변경 가능)
function generateRandomPassword() {
  return crypto.randomBytes(16).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token: string };

    if (!token) {
      return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
    }

    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from("result_tokens")
      .select("token, user_id, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 400 });
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json({ error: "만료된 링크입니다." }, { status: 400 });
    }

    const randomPassword = generateRandomPassword();

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRow.user_id,
      { password: randomPassword }
    );

    if (authError) {
      console.error("auto-join authError:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("lead_score")
      .eq("id", tokenRow.user_id)
      .maybeSingle();

    if (fetchError) {
      console.error("auto-join fetchError:", fetchError);
    }

    const newScore = (currentUser?.lead_score ?? 0) + 10;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_set: true, lead_score: newScore })
      .eq("id", tokenRow.user_id);

    if (updateError) {
      console.error("auto-join updateError:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("result_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("auto-join route error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
