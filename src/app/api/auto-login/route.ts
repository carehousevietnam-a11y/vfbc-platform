import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// result_tokens의 token(결과확인 링크 토큰)만으로, 비밀번호 없이도
// 브라우저에 실제 로그인 세션을 만들 수 있게 해주는 매직링크 발급 API.
// - 비밀번호를 방금 설정한 경우
// - 이미 예전에 비밀번호를 설정해서 /r 링크가 곧장 결과화면으로 가는 경우
// 두 케이스 모두 이 API 하나로 처리한다.
export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string };

    if (!token) {
      return NextResponse.json({ error: "토큰이 필요합니다." }, { status: 400 });
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

    const { data: authUserData, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(tokenRow.user_id);

    if (getUserError || !authUserData?.user?.email) {
      console.error("auto-login getUserError:", getUserError);
      return NextResponse.json(
        { error: "로그인 정보를 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    const email = authUserData.user.email;

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("auto-login generateLink error:", linkError);
      return NextResponse.json(
        { error: "로그인 링크 발급에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email,
      hashedToken: linkData.properties.hashed_token,
    });
  } catch (err) {
    console.error("auto-login route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
