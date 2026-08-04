// src/lib/adminAuth/adminPasswordResetEmail.ts
//
// [2026-08-04 Resend 기반 관리자 비밀번호 재설정 메일 발송] 신규 파일.
//
// Supabase Free 플랜은 Custom SMTP를 지원하지 않아, Supabase 자체
// Recovery Email(내장 SMTP)에 의존할 수 없다. 이 파일은 프로젝트에 이미
// 있는 Resend 발송 방식(src/lib/notify/email.ts와 동일하게
// `new Resend(process.env.RESEND_API_KEY)` + `RESEND_FROM_EMAIL` 환경변수
// 패턴)을 그대로 재사용해, Supabase Admin API로 생성한 recovery 링크를
// 우리가 직접 Resend로 발송한다.
//
// src/lib/notify/email.ts는 고객 대상 Business Logic 이메일(진단 결과,
// 단계변경 알림 등)을 담당하는 기존 파일이라 절대 수정하지 않았고, 이
// 관리자 전용 이메일도 그 파일에 추가하지 않고 완전히 분리된 파일로
// 만들었다(admin 인증 관심사를 customer Business Logic과 섞지 않기
// 위함 — 지금까지 이 프로젝트의 admin 인증 작업 전체가 따른 것과 동일한
// 원칙).

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// src/lib/notify/email.ts와 동일한 발신자 결정 방식(운영 도메인 인증 후
// RESEND_FROM_EMAIL 등록 시 그 값 사용, 미설정 시 Sandbox 발신자로 폴백).
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "VFBCAI <onboarding@resend.dev>";

type SendAdminPasswordResetEmailParams = {
  to: string;
  actionLink: string;
};

type SendAdminPasswordResetEmailReturn =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function sendAdminPasswordResetEmail(
  params: SendAdminPasswordResetEmailParams
): Promise<SendAdminPasswordResetEmailReturn> {
  const { to, actionLink } = params;

  const subject = "[VFBCAI 관리자] 비밀번호 재설정 안내";

  // src/lib/notify/email.ts의 기존 이메일들과 동일한 브랜드 헤더 바·
  // 컬러·버튼 스타일을 그대로 사용해 같은 브랜드로 보이게 했다(디자인을
  // 새로 만들지 않고 기존 톤을 그대로 재사용).
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
    <div style="height: 3px; background: #1e3a8a; margin-bottom: 24px; border-radius: 2px;"></div>
    <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px;">
      VFBCAI · 관리자
    </p>
    <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.4;">
      비밀번호 재설정 요청이 접수되었습니다
    </h1>
    <p style="font-size: 15px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
      아래 버튼을 눌러 새 비밀번호를 설정해주세요. 본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.
    </p>
    <a href="${actionLink}" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 9999px; text-decoration: none;">
      새 비밀번호 설정하기
    </a>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 28px; line-height: 1.6;">
      본 메일은 VFBCAI 관리자 비밀번호 재설정 요청에 의해 발송되었습니다.<br/>
      링크는 일정 시간이 지나면 만료됩니다.
    </p>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend send error (admin password reset):", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("sendAdminPasswordResetEmail exception:", err);
    return { success: false, error: String(err) };
  }
}
