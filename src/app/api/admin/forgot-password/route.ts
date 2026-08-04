// src/app/api/admin/forgot-password/route.ts
//
// [2026-08-04 Resend 기반으로 전환] Supabase Free 플랜은 Custom SMTP를
// 지원하지 않아 Supabase 자체 Recovery Email(내장 SMTP)에 더 이상
// 의존하지 않는다. 대신:
//   1) Supabase Admin API의 generateLink({ type: "recovery", ... })로
//      recovery 링크(action_link)만 "생성"한다 — 이 호출 자체는 메일을
//      보내지 않는다(Supabase 공식 문서: "Generates email links ... to be
//      sent via a custom email provider").
//   2) 생성된 링크를 프로젝트에 이미 있는 Resend API로 우리가 직접
//      발송한다(src/lib/adminAuth/adminPasswordResetEmail.ts, 기존
//      src/lib/notify/email.ts와 동일한 Resend 클라이언트/환경변수 패턴
//      재사용 — 그 파일 자체는 고객 대상 Business Logic이라 건드리지
//      않고 별도 파일로 분리).
//
// [이전 버전과의 차이] 이전에는 src/lib/adminAuth/routeClient.ts로 만든
// 세션 바인딩 클라이언트의 supabase.auth.resetPasswordForEmail()을
// 호출했다 — 이 메서드는 Supabase 내장 SMTP로 메일 발송까지 수행하므로
// Custom SMTP가 없는 Free 플랜에서는 실제 메일이 나가지 않았다.
// generateLink()는 service role 권한이 필요한 Admin API라 세션 바인딩
// 클라이언트(anon key) 대신 supabaseAdmin(service role)을 사용한다.
//
// [유지되는 것] admin_users/verifyAdminUser/findActiveAdminByEmail,
// src/app/admin/auth/callback/route.ts, src/app/api/admin/reset-password/
// route.ts는 전혀 수정하지 않았다. generateLink()가 만드는 action_link는
// 프로젝트의 PKCE flow 설정을 그대로 따라 redirectTo에 "?code=" 파라미터가
// 붙은 URL로 이어지므로, 기존 callback의 exchangeCodeForSession(code)
// 로직이 수정 없이 그대로 작동한다.
//
// 보안 원칙: 이메일이 실제 관리자 계정인지 아닌지, 메일 발송 성공/실패
// 여부와 무관하게 항상 동일한 메시지만 반환한다. 내부적으로는 admin_users에
// 존재하는 active 관리자 이메일일 때만 실제로 링크를 생성·발송해, 고객
// 계정 등 관리자가 아닌 Supabase Auth 계정에 "관리자용" 재설정 메일이
// 발송되는 것을 막는다 — 이 판단 결과는 응답에 절대 노출하지 않는다.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { findActiveAdminByEmail } from "@/lib/adminAuth/verifyAdminUser";
import { sendAdminPasswordResetEmail } from "@/lib/adminAuth/adminPasswordResetEmail";

const GENERIC_MESSAGE = {
  message: "입력한 이메일이 등록되어 있다면 비밀번호 재설정 안내를 보내드렸습니다.",
} as const;

export async function POST(req: NextRequest) {
  // 1) email 읽기
  const body = await req.json().catch(() => null);
  const rawEmail = typeof body?.email === "string" ? body.email : "";

  // 2) trim + lowercase 정규화
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "이메일을 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    // 3) active 관리자 계정인지 확인
    const adminUser = await findActiveAdminByEmail(email);

    // 4) active 관리자인 경우에만 recovery 링크를 생성하고 Resend로 발송한다.
    if (adminUser) {
      const { data, error: generateLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${req.nextUrl.origin}/admin/auth/callback`,
        },
      });

      if (generateLinkError || !data?.properties?.action_link) {
        // 링크 생성 실패도 계정 존재 여부를 드러낼 수 있으므로 로그로만
        // 남기고 응답은 그대로 동일한 안내 메시지를 유지한다.
        console.error(
          "admin forgot-password generateLink error:",
          generateLinkError
        );
      } else {
        const sendResult = await sendAdminPasswordResetEmail({
          to: email,
          actionLink: data.properties.action_link,
        });

        if (!sendResult.success) {
          console.error(
            "admin forgot-password sendAdminPasswordResetEmail error:",
            sendResult.error
          );
        }
      }
    }
  } catch (err) {
    console.error("admin forgot-password route error:", err);
  }

  // 5)~6) 관리자 존재 여부·발송 성공/실패와 무관하게 항상 동일한 메시지·200.
  return NextResponse.json(GENERIC_MESSAGE, { status: 200 });
}
