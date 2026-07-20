import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 대행 신청 "완료" 이메일에만 넣는 신뢰도용 확인 도장.
// 이메일 클라이언트(Gmail, Outlook, 네이버메일 등) 대부분은 <img>로 삽입된
// SVG 파일 자체를 렌더링하지 않거나(빈 박스) 내부 필터(feTurbulence 등)가
// 깨져서 텍스트가 안 보이는 문제가 있다. 그래서 이메일 전용으로는
// 래스터 이미지(PNG)를 별도로 사용한다.
// 이 파일은 반드시 프로젝트의 `public/vfbc-seal.png` 경로에 존재해야 하며
// (별도로 전달드린 파일, 원본 1000x1000 고해상도 → 이메일에서는 176px로 축소 표시되므로
// 레티나 화면에서도 선명함), 플랫폼 화면에 쓰이는 인라인 <svg> 버전
// (check/*/page.tsx, r/page.tsx)과 디자인 컨셉만 동일하게 유지하면 된다.
// (플랫폼용 SVG도 같은 문제가 생기면 동일하게 이 PNG로 교체 권장)
function getSealUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfbc-platform.vercel.app";
  return `${siteUrl}/vfbc-seal.png`;
}

// service_type 매칭 전용 보조 함수 — 하이픈("register_fire-safety")과 언더스코어
// ("register_fire_safety") 표기가 혼재해도 같은 값으로 인식시키기 위한 것.
// 실제 화면/이메일에 노출되는 문자열 자체를 바꾸는 게 아니라,
// 딕셔너리 매칭에만 쓰는 정규화 키다. (admin/cases/page.tsx와 동일한 패턴)
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

// 서비스 유형 코드 → 한국어 라벨
// 키는 언더스코어로 통일해서 관리한다 — 실제 DB에 저장되는 service_type이
// 언더스코어 표기(verify_admin 등)로 확인되었기 때문. 하이픈 표기로 값이 들어와도
// resolveServiceLabel()이 정규화해서 매칭하므로 문제 없음.
const SERVICE_LABEL: Record<string, string> = {
  trc: "거주증(TRC)",
  wp: "노동허가(WP)",
  tamtru: "땀주(임시거주등록)",
  verify_real_estate: "부동산 서류 검토",
  verify_admin: "행정 서류 검토",
  verify_fraud: "사기 의심 서류 검토",
  verify_tax: "세무 서류 검토",
  verify_unclear: "불확실한 서류 검토",
  register_restaurant: "식당허가", // register/restaurant/page.tsx 실제 service_type 값 확인 완료
  register_cosmetics: "화장품허가", // register/cosmetics/page.tsx 실제 service_type 값 확인 완료
  register_environment: "환경허가", // register/environment/page.tsx 실제 service_type 값 확인 완료
  register_fire_safety: "소방허가", // register/fire-safety/page.tsx 실제 값은 "register_fire-safety"(하이픈) — toPrefixKey 정규화로 매칭됨
  register_hygiene: "위생허가", // register/hygiene/page.tsx 실제 service_type 값 확인 완료
  register_medical_device: "의료기기허가", // register/medical-device/page.tsx 실제 값은 "register_medical-device"(하이픈) — toPrefixKey 정규화로 매칭됨
};

function resolveServiceLabel(serviceType: string): string {
  if (SERVICE_LABEL[serviceType]) return SERVICE_LABEL[serviceType];
  const key = toPrefixKey(serviceType);
  return SERVICE_LABEL[key] ?? "진단";
}

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
  const key = toPrefixKey(serviceType);
  if (REQUIRED_DOCS[key]) return REQUIRED_DOCS[key];
  if (key.startsWith("verify")) return [{ label: "검토 대상 서류 사본" }];
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

  const serviceLabel = resolveServiceLabel(serviceType);
  const resultLabel = result ? RESULT_LABEL[result] ?? null : null;

  const isAgencyRequest = result === "agency";
  const isDiagnosis = !!resultLabel;
  // VERIFY(서류/상황 검토) 서비스 여부 — service_type이 "verify"로 시작하는 값은
  // 하이픈("verify-admin")/언더스코어("verify_admin") 표기가 혼재할 수 있으나,
  // "verify" 자체는 접두사 첫 단어라 구분자 표기와 무관하게 startsWith로 안전하게
  // 판별된다. VERIFY는 CHECK의 "셀프등록 응원" 문구, "대행 신청" 문구가 맞지 않는
  // 별개 서비스이므로 이 값으로 문구를 분기한다.
  const isVerifyService = !!serviceType && serviceType.startsWith("verify");

  const selfActionLabel = serviceType === "tamtru" ? "자가등록" : "직접신청";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfbc-platform.vercel.app";
  const resultUrl = `${siteUrl}/r?token=${token}`;

  const subject = isAgencyRequest
    ? `[VFBCAI] ${name}님의 ${serviceLabel} 대행 신청이 접수되었습니다`
    : isDiagnosis
    ? `[VFBCAI] ${name}님의 ${serviceLabel} 진단 결과: ${resultLabel}`
    : isVerifyService
    ? `[VFBCAI] ${name}님의 검토 요청이 접수되었습니다`
    : `[VFBCAI] ${name}님의 ${serviceLabel} ${selfActionLabel} 진행을 응원합니다`;

  const headline = isAgencyRequest
    ? `${name}님, ${serviceLabel} 대행 신청이 완료되었습니다`
    : isDiagnosis
    ? `${name}님, ${serviceLabel} 진단이 완료되었습니다`
    : isVerifyService
    ? `${name}님, 검토 요청이 접수되었습니다`
    : `${name}님, ${selfActionLabel} 진행을 응원합니다`;

  // VERIFY 접수 확인 단계는 아직 "자가등록/직접신청" 같은 자기결정 행동이 존재하지
  // 않으므로(단순 서류 접수 상태) 자기결정형 CTA 버튼을 노출하지 않는다.
  const buttonLabel = isAgencyRequest || isVerifyService ? null : "막히면 빨리 도움신청하기";

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
        <img src="${getSealUrl()}" width="176" height="176" alt="VFBCAI 접수완료 확인 도장" style="display:inline-block;" />
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
  } else if (isVerifyService) {
    // VERIFY(직접검토하기) 전용 문구 — CHECK의 "셀프등록 축하" 톤과 분리.
    // 아직 결과가 나오지 않은 접수 확인 단계이므로 확정적 표현을 쓰지 않는다.
    bodyHtml = `<p style="font-size: 15px; color: #374151; margin: 0 0 12px; line-height: 1.6;">
        검토 요청이 정상적으로 접수되었습니다. 제출하신 서류와 내용을 확인하고 있으며, 검토 결과가 준비되는 대로 안내드리겠습니다.
       </p>
       <p style="font-size: 13px; color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
        최종 판단은 전문가 검토를 통해 확정됩니다.
       </p>`;
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
      VFBCAI · 베트남 외국인 비즈니스센터청
    </p>
    <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.4;">
      ${headline}
    </h1>
    ${bodyHtml}
    ${buttonHtml}
    <p style="font-size: 12px; color: #9ca3af; margin-top: 28px; line-height: 1.6;">
      본 메일은 VFBCAI 서비스 이용 중 남기신 연락처로 발송되었습니다.<br/>
      링크는 30일간 유효합니다.
    </p>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: "VFBCAI <onboarding@resend.dev>",
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

// ────────────────────────────────────────────────────────────────
// STEP6: 관리자 단계변경 자동 알림 이메일
//
// sendResultEmail()은 "고객이 직접 행동(진단 완료/대행신청 제출)"한 시점에
// 트리거되지만, 이 함수는 admin/leads/[id]/page.tsx의 setProcessStage
// 서버 액션이 crm_activities에 새 단계 action을 기록한 직후(관리자가
// 진행 단계를 변경한 시점)에 호출된다. 디자인 톤(헤더 바, 배지, 도장
// 이미지)은 sendResultEmail과 동일하게 유지해 같은 브랜드로 보이게 한다.
// ────────────────────────────────────────────────────────────────

// admin/leads/[id]/page.tsx의 SETTABLE_STAGE_ACTIONS와 동일한 4개 값만
// 다룬다(관리자가 실제로 저장 버튼을 눌러 크론이 아니라 즉시 트리거하는
// 값들). 새 단계가 추가되면 이 4곳(email.ts 2개 맵 + admin 페이지
// SETTABLE_STAGE_ACTIONS + stageChange.ts STAGE_TEMPLATE)을 함께 갱신한다.
export type StageChangeAction =
  | "expert_review_request"
  | "agency_upgrade_request"
  | "process_government_submitted"
  | "process_permit_completed";

// 이메일 헤드라인과 카카오톡(추후) 문구가 동일한 표현을 쓰도록 여기서만
// 정의하고 stageChange.ts에서 그대로 import해 재사용한다.
export const STAGE_HEADLINE: Record<StageChangeAction, string> = {
  expert_review_request: "전문가 검토가 시작되었습니다",
  agency_upgrade_request: "대행 신청이 접수 확인되었습니다",
  process_government_submitted: "정부 제출이 완료되었습니다",
  process_permit_completed: "허가가 완료되었습니다",
};

const STAGE_SUBJECT_SUFFIX: Record<StageChangeAction, string> = {
  expert_review_request: "전문가 검토 시작",
  agency_upgrade_request: "대행 신청 접수 확인",
  process_government_submitted: "정부 제출 완료",
  process_permit_completed: "허가 완료",
};

// mypage/page.tsx의 EXPERT_TEAM_LABEL과 동일한 문구. 담당자 배정 컬럼이
// DB에 없어(v21 핸드오프 확인 완료) 공용 lib 대신 파일별로 고정 문구를
// 복제하는 이 프로젝트의 기존 관례를 그대로 따른다.
const EXPERT_TEAM_LABEL = "VFBCAI 법률자문팀 (Linda Kang · VNK 파트너)";

type SendStageChangeEmailParams = {
  to: string;
  name: string;
  serviceType: string;
  action: StageChangeAction;
  token: string;
  // "허가 완료" 단계에서만 사용 — admin/leads/[id]/page.tsx가 방금 업로드한
  // 결과파일(허가증) URL이 있으면 이메일에 바로 다운로드 버튼을 넣는다.
  permitFileUrl?: string | null;
};

export async function sendStageChangeEmail(
  params: SendStageChangeEmailParams
): Promise<SendResultEmailReturn> {
  const { to, name, serviceType, action, token, permitFileUrl } = params;

  const serviceLabel = resolveServiceLabel(serviceType);
  const headline = `${name}님, ${serviceLabel} ${STAGE_HEADLINE[action]}`;
  const subject = `[VFBCAI] ${name}님의 ${serviceLabel} - ${STAGE_SUBJECT_SUFFIX[action]}`;

  // mypage/page.tsx는 자체 로그인 화면이 없고 "/r?token=" 링크의 자동로그인
  // (api/auto-login)에만 의존하는 구조다(v21 핸드오프 확인 완료). 그래서
  // 이메일 버튼은 절대 "/mypage"로 직접 연결하지 않고, sendResultEmail과
  // 동일하게 항상 "/r?token=" 결과확인 링크를 거치게 한다 — 이 링크가
  // 자동 로그인 후 마이페이지로 이어진다.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vfbc-platform.vercel.app";
  const resultUrl = `${siteUrl}/r?token=${token}`;

  let bodyHtml: string;
  let buttonLabel: string | null = "마이페이지에서 진행상황 확인하기";
  let buttonUrl = resultUrl;

  switch (action) {
    case "expert_review_request":
      bodyHtml = `<p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        제출하신 내용에 대해 ${EXPERT_TEAM_LABEL}의 전문가 검토가 시작되었습니다. 검토가 완료되는 대로 다시 안내드리겠습니다.
      </p>`;
      break;
    case "agency_upgrade_request":
      bodyHtml = `<p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        대행 신청이 접수 확인되었습니다. 담당자가 서류를 확인한 뒤 카카오톡 또는 잘로(Zalo)로 예상 비용과 진행 절차를 안내드립니다.
      </p>`;
      break;
    case "process_government_submitted":
      bodyHtml = `<div style="background: #ffffff; border-radius: 16px; padding: 20px; margin: 0 0 20px; border: 1px solid #f3f4f6;">
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">담당자</p>
        <p style="font-size: 15px; font-weight: 700; color: #111827; margin: 0;">${EXPERT_TEAM_LABEL}</p>
      </div>
      <p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        관할 기관에 정부 제출이 완료되었습니다. 심사 결과가 나오는 대로 다시 안내드리겠습니다.
      </p>`;
      break;
    case "process_permit_completed":
      buttonLabel = permitFileUrl ? "허가증(결과파일) 다운로드" : "마이페이지에서 확인하기";
      buttonUrl = permitFileUrl ?? resultUrl;
      bodyHtml = `<div style="text-align: center; margin: 0 0 4px;">
        <img src="${getSealUrl()}" width="176" height="176" alt="VFBCAI 허가 완료 확인 도장" style="display:inline-block;" />
      </div>
      <p style="font-size: 10px; color: #9ca3af; font-style: italic; text-align: center; margin: 0 0 20px;">
        Vietnam Foreign Business Verification &amp; Compliance AI Center
      </p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 20px; line-height: 1.6;">
        축하드립니다! ${serviceLabel} 허가가 완료되었습니다.${
          permitFileUrl
            ? " 아래 버튼으로 허가증(결과파일)을 바로 다운로드하실 수 있습니다."
            : " 결과파일은 마이페이지에서 확인하실 수 있습니다."
        }
      </p>`;
      break;
  }

  const buttonHtml = buttonLabel
    ? `<a href="${buttonUrl}" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 9999px; text-decoration: none;">
        ${buttonLabel}
      </a>`
    : "";

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fafafa;">
    <div style="height: 3px; background: #1e3a8a; margin-bottom: 24px; border-radius: 2px;"></div>
    <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px;">
      VFBCAI · 베트남 외국인 비즈니스센터청
    </p>
    <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.4;">
      ${headline}
    </h1>
    ${bodyHtml}
    ${buttonHtml}
    <p style="font-size: 12px; color: #9ca3af; margin-top: 28px; line-height: 1.6;">
      본 메일은 VFBCAI 서비스 이용 중 남기신 연락처로 발송되었습니다.<br/>
      링크는 30일간 유효합니다.
    </p>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: "VFBCAI <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend send error (stage change):", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("sendStageChangeEmail exception:", err);
    return { success: false, error: String(err) };
  }
}
