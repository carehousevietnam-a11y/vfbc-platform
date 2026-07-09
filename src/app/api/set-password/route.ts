import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, agreeTerms } = body as {
      token: string;
      password: string;
      agreeTerms: boolean;
    };

    if (!token || !password || !agreeTerms) {
      return NextResponse.json(
        { error: "토큰, 비밀번호, 약관동의가 모두 필요합니다." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
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

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRow.user_id,
      { password }
    );

    if (authError) {
      console.error("set-password authError:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("lead_score")
      .eq("id", tokenRow.user_id)
      .maybeSingle();

    if (fetchError) {
      console.error("set-password fetchError:", fetchError);
    }

    const newScore = (currentUser?.lead_score ?? 0) + 10;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_set: true, lead_score: newScore })
      .eq("id", tokenRow.user_id);

    if (updateError) {
      console.error("set-password updateError:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin
      .from("result_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("set-password route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
