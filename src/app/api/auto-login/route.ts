import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// result_tokens의 token(결과확인 링크 토큰)만으로, 비밀번호 없이도
// 브라우저에 실제 로그인 세션을 만들 수 있게 해주는 API.
// verifyOtp 방식 대신, Supabase가 공식적으로 지원하는 "action_link로 직접
// 리다이렉트" 방식을 사용한다 (브라우저가 이 링크로 이동하면 Supabase 서버가
// 세션을 만들고 다시 우리 사이트로 돌려보낸다).
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
    // 환경변수가 없으면 현재 정상 작동 중인 배포주소로 폴백.
    // env 값 끝에 "/"가 붙어 있어도 "//r?..." 형태로 중복되지 않도록 제거 후 조합.
    const rawSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://vfbc-platform.vercel.app";
    const siteUrl = rawSiteUrl.replace(/\/+$/, "");
    const redirectTo = `${siteUrl}/r?token=${encodeURIComponent(token)}&al=1`;

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("auto-login generateLink error:", linkError);
      return NextResponse.json(
        { error: "로그인 링크 발급에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      actionLink: linkData.properties.action_link,
    });
  } catch (err) {
    console.error("auto-login route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
