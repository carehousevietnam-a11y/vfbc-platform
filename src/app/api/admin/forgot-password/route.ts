// src/app/api/admin/forgot-password/route.ts
//
// [2026-08-04 Resend 기반으로 전환] Supabase Free 플랜은 Custom SMTP를
// 지원하지 않아 Supabase 자체 Recovery Email(내장 SMTP)에 의존하지 않는다.
// Supabase Admin API의 generateLink({ type: "recovery" })로 recovery
// 토큰만 "생성"하고(이 호출 자체는 메일을 보내지 않는다), 우리가 직접
// Resend로 발송한다(src/lib/adminAuth/adminPasswordResetEmail.ts).
//
// ⚠️ [2026-08-04 수정 — token_hash 방식으로 전환] 이전 버전은
// `data.properties.action_link`를 그대로 메일 버튼 URL로 사용했다.
// 그러나 Supabase 공식 GitHub 이슈(supabase/auth-js #767 등)에서 확인한
// 대로 `generateLink()`는 PKCE flow를 지원하지 않아, action_link를
// 클릭했을 때 세션 정보가 "?code="가 아니라 URL 해시(#access_token=...)
// 형태로 전달된다 — 해시는 서버로 전송되지 않으므로 서버 Route Handler인
// callback이 값을 받을 수 없어 항상 실패했다(실제 배포에서 확인됨).
//
// 해결책: Supabase 공식 서버 측 검증 방식인 token_hash + verifyOtp()를
// 사용한다. action_link는 버리고, `data.properties.hashed_token`만 꺼내
// 우리가 직접 "/admin/auth/callback?token_hash=...&type=recovery" 형태의
// URL을 조립해 그 URL을 메일에 넣는다. email_otp/action_link/access_token은
// 사용하지 않는다.
//
// [유지되는 것] admin_users/verifyAdminUser/findActiveAdminByEmail,
// src/app/api/admin/reset-password/route.ts는 이번 작업에서도 전혀
// 수정하지 않았다. src/app/admin/auth/callback/route.ts는 이 토큰을 받는
// 쪽으로 함께 수정했다(별도 보고).
//
// 보안 원칙: 이메일이 실제 관리자 계정인지 아닌지, 메일 발송 성공/실패
// 여부와 무관하게 항상 동일한 메시지만 반환한다. 내부적으로는 admin_users에
// 존재하는 active 관리자 이메일일 때만 실제로 링크를 생성·발송해, 고객
// 계정 등 관리자가 아닌 Supabase Auth 계정에 "관리자용" 재설정 메일이
// 발송되는 것을 막는다 — 이 판단 결과는 응답에 절대 노출하지 않는다.
// 토큰 원문(hashed_token 전체, action_link 전체)은 로그에 남기지 않는다
// (아래 로그는 hasTokenHash boolean만 남긴다).

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

    // 4) active 관리자인 경우에만 recovery 토큰을 생성하고 Resend로 발송한다.
    if (adminUser) {
      const { data, error: generateLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${req.nextUrl.origin}/admin/reset-password`,
        },
      });

      const hashedToken = data?.properties?.hashed_token;

      // [진단 로그] 토큰 원문은 절대 남기지 않고, 존재 여부만 boolean으로 기록.
      console.log("[forgot-password] recovery link generated", {
        hasTokenHash: Boolean(hashedToken),
      });

      if (generateLinkError || !hashedToken) {
        // 링크 생성 실패도 계정 존재 여부를 드러낼 수 있으므로 로그로만
        // 남기고(토큰 없이) 응답은 그대로 동일한 안내 메시지를 유지한다.
        console.error(
          "admin forgot-password generateLink error:",
          generateLinkError
        );
      } else {
        // action_link/email_otp/access_token은 사용하지 않는다 — 우리가
        // 직접 만든 콜백 URL(token_hash + type=recovery)만 사용한다.
        const resetUrl = `${req.nextUrl.origin}/admin/auth/callback?token_hash=${encodeURIComponent(
          hashedToken
        )}&type=recovery`;

        const sendResult = await sendAdminPasswordResetEmail({
          to: email,
          resetUrl,
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
