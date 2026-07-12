import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 서비스 유형 코드 → 한국어 라벨
const SERVICE_LABEL: Record<string, string> = {
  trc: "거주증(TRC)",
  wp: "노동허가(WP)",
  tamtru: "땀주(임시거주등록)",
  "verify-real-estate": "부동산 서류 검토",
  "verify-admin": "행정 서류 검토",
  "verify-fraud": "사기 의심 서류 검토",
  "verify-tax": "세무 서류 검토",
  "verify-unclear": "불확실한 서류 검토",
};

// 진단 결과 코드 → 한국어 라벨 (헤드라인만 공개, 상세는 링크 클릭 후)
const RESULT_LABEL: Record<string, string> = {
  possible: "가능 ✅",
  conditional: "조건부 가능 ⚠️",
  impossible: "불가 ❌",
};

type SendResultEmailParams = {
  to: string;
  name: string;
  serviceType: string;
  result?: string | null;
  token: string;
};

type SendResultEmailReturn =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function sendResultEmail(
  params: SendResultEmailParams
): Promise<SendResultEmailReturn> {
  const { to, name, serviceType, result, token } = params;

  const serviceLabel = SERVICE_LABEL[serviceType] ?? "진단";
  const resultLabel = result ? RESULT_LABEL[result] ?? null : null;
  const isSelfRegistration = !resultLabel;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfbc.vercel.app";
  const resultUrl = `${siteUrl}/r?token=${token}`;

  const subject = resultLabel
    ? `[VFBC] ${name}님의 ${serviceLabel} 진단 결과: ${resultLabel}`
    : `[VFBC] ${name}님의 ${serviceLabel} 자가등록을 축하드립니다`;

  const headline = isSelfRegistration
    ? `${name}님, ${serviceLabel} 자가등록을 축하드립니다`
    : `${name}님, ${serviceLabel} 진단이 완료되었습니다`;

  const buttonLabel = isSelfRegistration ? "도움 요청하기" : "상세 결과 확인하기";

  // 자가등록 케이스와 진단 케이스 모두 동일한 후킹 문구 패턴을 사용한다
  // (v11에서 여러 차례 수정 끝에 확정된 최종 문구 — "무료"라는 단어로
  // 유료 대행 전체가 무료로 오해되지 않도록, 비용 언급으로 심리적
  // 압박감을 주지 않도록 다듬어진 버전).
  const bodyHtml = isSelfRegistration
    ? `<p style="font-size: 15px; color: #374151; margin: 0 0 8px;">스스로 잘 진행하고 계세요. 응원합니다! 🎉</p>
       <p style="font-size: 15px; font-weight: 700; color: #b45309; margin: 20px 0 8px;">기한을 놓치면 반려·재제출로 시간이 두 배로 걸릴 수 있어요</p>
       <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
         담당자가 서류부터 먼저 확인해드리고, 필요하시면 서류접수까지 대행
         처리해드립니다. 담당자가 진행 상황을 끝까지 챙겨드리며, 이름·연락처
         재입력 없이 바로 신청됩니다.
       </p>`
    : `<div style="background: #ffffff; border-radius: 16px; padding: 20px; margin: 0 0 20px; border: 1px solid #f3f4f6;">
         <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">진단 결과</p>
         <p style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">${resultLabel}</p>
       </div>
       <p style="font-size: 15px; font-weight: 700; color: #b45309; margin: 0 0 8px;">기한을 놓치면 반려·재제출로 시간이 두 배로 걸릴 수 있어요</p>
       <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
         담당자가 서류부터 먼저 확인해드리고, 필요하시면 서류접수까지 대행
         처리해드립니다. 담당자가 진행 상황을 끝까지 챙겨드리며, 이름·연락처
         재입력 없이 바로 신청됩니다.
       </p>`;

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
    <div style="height: 3px; background: #1e3a8a; margin-bottom: 24px; border-radius: 2px;"></div>
    <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px;">
      VFBC · 베트남 외국인 비즈니스센터청
    </p>
    <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.4;">
      ${headline}
    </h1>
    ${bodyHtml}
    <a href="${resultUrl}" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 9999px; text-decoration: none;">
      ${buttonLabel}
    </a>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 28px; line-height: 1.6;">
      본 메일은 VFBC 서비스 이용 중 남기신 연락처로 발송되었습니다.<br/>
      링크는 30일간 유효합니다.
    </p>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: "VFBC <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("sendResultEmail exception:", err);
    return { success: false, error: String(err) };
  }
}
