import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 대행 신청 "완료" 이메일에만 넣는 신뢰도용 확인 도장. 실제 SVG를 base64로
// 인코딩해 <img>로 삽입한다 (이메일 클라이언트는 인라인 <svg> 태그를
// 지원하지 않는 경우가 많아 img 방식을 사용).
const SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="none" stroke="#d4af37" stroke-width="1"/><circle cx="100" cy="100" r="90" fill="#7a1d2e" stroke="#d4af37" stroke-width="2"/><circle cx="100" cy="100" r="78" fill="none" stroke="#d4af37" stroke-width="1"/><circle cx="100" cy="78" r="2.5" fill="#d4af37"/><circle cx="122" cy="100" r="2.5" fill="#d4af37"/><circle cx="100" cy="122" r="2.5" fill="#d4af37"/><circle cx="78" cy="100" r="2.5" fill="#d4af37"/><text x="100" y="90" text-anchor="middle" font-size="24" font-weight="800" fill="#d4af37" font-family="Georgia, serif">VFBC</text><text x="100" y="110" text-anchor="middle" font-size="12" font-weight="600" fill="#f3e2b3" font-family="sans-serif">AI 검증완료</text><text x="100" y="126" text-anchor="middle" font-size="8" fill="#d4af37" letter-spacing="2" font-family="sans-serif">CONFIRMED</text></svg>`;
const SEAL_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(SEAL_SVG).toString(
  "base64"
)}`;

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

type DocItem = { label: string; tip?: string };

// 서비스 유형별 1차 필요서류 체크리스트 (대행신청 완료 이메일 전용, WP 이외)
// 화면(src/app/r/page.tsx, check/*/page.tsx)의 단순 목록과 동일하게 유지할 것
const REQUIRED_DOCS: Record<string, DocItem[]> = {
  tamtru: [
    { label: "여권 사본" },
    { label: "임대차 계약서 (또는 집주인 확인서)" },
    { label: "숙소 주소지 증빙" },
  ],
  trc: [
    { label: "여권 사본" },
    { label: "비자 사본" },
    { label: "재직증명서 또는 사업자등록증" },
    { label: "임대차 계약서" },
  ],
};
const DEFAULT_DOCS: DocItem[] = [{ label: "여권 사본" }, { label: "관련 증빙서류" }];

function getDocs(serviceType: string): DocItem[] {
  if (REQUIRED_DOCS[serviceType]) return REQUIRED_DOCS[serviceType];
  if (serviceType?.startsWith("verify-")) return [{ label: "검토 대상 서류 사본" }];
  return DEFAULT_DOCS;
}

// WP 전용 3단계 상세 가이드 — src/app/check/wp/page.tsx의 detailStage 화면,
// src/app/r/page.tsx의 wp 분기와 동일한 내용으로 유지할 것 (한쪽 수정 시 세 곳 다 반영)
const WP_DETAILED_GUIDE_HTML = `
  <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;margin:0 0 12px;">
    <p style="font-size:12px;font-weight:600;color:#374151;margin:0 0 8px;">① 한국에서 준비 (번역공증·영사인증 필요)</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 범죄경력증명서 — 발급 6개월 이내, 공증사무소 → 외교부 영사확인 → 주한 베트남대사관 인증 순으로 진행</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 학위증명서(졸업증명서) — 신청 직책과 전공이 일치할수록 승인율이 높습니다</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0;line-height:1.6;">· 경력증명서 — 관련 분야 3년 이상(기술직 5년 이상), 전 직장 직인·업무·근무기간 명시 필수</p>
    <p style="font-size:11px;color:#9ca3af;margin:8px 0 0;">베트남은 아포스티유 협약국이 아니라, 아포스티유 대신 외교부 영사확인 절차를 거쳐야 합니다.</p>
  </div>
  <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;margin:0 0 12px;">
    <p style="font-size:12px;font-weight:600;color:#374151;margin:0 0 8px;">② 베트남 현지에서 준비 (번역공증 불필요)</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 여권 원본 및 공증 사본 — 유효기간 6개월 이상(2년 이상 권장), 현지 공증사무소에서 전 페이지 사본 공증</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 건강진단서 — 지정병원 발급 시 번역공증 불필요 (유효기간 6개월)</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 증명사진 2~4매 — 4×6cm, 흰 배경, 최근 6개월 이내 촬영본</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0;line-height:1.6;">· 임시거주지 확인서 — 집주인·호텔을 통해 관할 공안에 신고된 거주 확인서</p>
  </div>
  <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;margin:0 0 20px;">
    <p style="font-size:12px;font-weight:600;color:#374151;margin:0 0 8px;">③ 초청 법인(회사)에서 준비</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 사업자등록증(ERC) 사본 공증</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 외국인 채용수요 승인서 — 신청 최소 30일 전 인민위원회 또는 노동부 승인 필요 (가장 까다로운 단계)</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0 0 4px;line-height:1.6;">· 노동허가 신청서(Form 11/PLI) — 회사 직인 날인</p>
    <p style="font-size:11.5px;color:#6b7280;margin:0;line-height:1.6;">· 근로계약서 초안 또는 파견명령서 — 주재원은 한국 본사 파견명령서(영사인증)가 요구될 수 있음</p>
  </div>
`;

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

  const isAgencyRequest = result === "agency";
  const isDiagnosis = !!resultLabel;

  const selfActionLabel = serviceType === "tamtru" ? "자가등록" : "직접신청";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfbc.vercel.app";
  const resultUrl = `${siteUrl}/r?token=${token}`;

  const subject = isAgencyRequest
    ? `[VFBC] ${name}님의 ${serviceLabel} 대행 신청이 접수되었습니다`
    : isDiagnosis
    ? `[VFBC] ${name}님의 ${serviceLabel} 진단 결과: ${resultLabel}`
    : `[VFBC] ${name}님의 ${serviceLabel} ${selfActionLabel} 진행을 응원합니다`;

  const headline = isAgencyRequest
    ? `${name}님, ${serviceLabel} 대행 신청이 완료되었습니다`
    : isDiagnosis
    ? `${name}님, ${serviceLabel} 진단이 완료되었습니다`
    : `${name}님, ${selfActionLabel} 진행을 응원합니다`;

  const buttonLabel = isAgencyRequest ? null : "막히면 빨리 도움신청하기";

  const HOOK_TEXT =
    "혼자 시도하다가 기한을 놓치거나 잘못된 서류기입으로 반려·재제출로 시간이 두 배로 걸리거나 접수 자체가 안될 수도 있어요.";

  const docsHtmlSimple = (docs: DocItem[]) => `
       <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 0 0 20px;">
         <p style="font-size: 12px; font-weight: 600; color: #374151; margin: 0 0 10px;">미리 준비해두시면 좋은 서류</p>
         ${docs
           .map(
             (d) => `
           <div style="margin: 0 0 10px;">
             <p style="font-size: 12px; font-weight: 600; color: #374151; margin: 0;">· ${d.label}</p>
             ${
               d.tip
                 ? `<p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 12px; line-height: 1.5;">${d.tip}</p>`
                 : ""
             }
           </div>`
           )
           .join("")}
         <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0;">정확한 요건은 상황에 따라 다를 수 있어 담당자 확인이 필요합니다.</p>
       </div>`;

  let bodyHtml: string;

  if (isAgencyRequest) {
    const docsSection =
      serviceType === "wp" ? WP_DETAILED_GUIDE_HTML : docsHtmlSimple(getDocs(serviceType));
    bodyHtml = `<div style="text-align: center; margin: 0 0 4px;">
        <img src="${SEAL_DATA_URI}" width="108" height="108" alt="VFBC AI 접수완료" />
      </div>
      <p style="font-size: 10px; color: #9ca3af; font-style: italic; text-align: center; margin: 0 0 20px;">
        Vietnam Foreign Business Verification &amp; Compliance AI Center
      </p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        담당자가 서류를 확인한 뒤 카카오톡 또는 잘로(Zalo)로 예상 비용과 진행 절차를 안내드립니다. 별도로 상담을 신청하지 않으셔도 됩니다.
      </p>
      ${docsSection}`;
  } else if (isDiagnosis) {
    bodyHtml = `<div style="background: #ffffff; border-radius: 16px; padding: 20px; margin: 0 0 20px; border: 1px solid #f3f4f6;">
         <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">진단 결과</p>
         <p style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">${resultLabel}</p>
       </div>
       <p style="font-size: 15px; font-weight: 700; color: #b45309; margin: 0 0 24px; line-height: 1.6;">${HOOK_TEXT}</p>`;
  } else {
    bodyHtml = `<p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        베트남어로 된 서류와 낯선 행정 절차, 혼자 진행하시기 쉽지 않으셨을 텐데 여기까지 잘 오셨습니다. 앞으로도 끝까지 응원할게요! 🎉
       </p>
       <p style="font-size: 15px; font-weight: 700; color: #b45309; margin: 0 0 24px; line-height: 1.6;">${HOOK_TEXT}</p>`;
  }

  const buttonHtml = buttonLabel
    ? `<a href="${resultUrl}" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 9999px; text-decoration: none;">
      ${buttonLabel}
    </a>`
    : "";

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
    ${buttonHtml}
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
