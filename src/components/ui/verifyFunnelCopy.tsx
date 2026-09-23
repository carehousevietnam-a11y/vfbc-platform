import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SupportedLanguage } from "@/lib/customerRegistrationValidation";
import { LEAD_FORM_MESSAGES } from "@/lib/customerRegistrationValidation";
import NoticeCard from "./NoticeCard";
import { cn } from "@/lib/cn";

const VERIFY_FORM_KO = {
  consentSummary:
    "분석 결과 저장·안내를 위해 개인정보 수집·이용에 동의합니다. 제출 시 계정이 자동 생성됩니다.",
  privacyNoticeLine:
    "입력하신 정보는 분석 결과 저장·안내 목적으로만 사용됩니다.",
  fieldsIntro:
    "분석 결과를 저장하고 안내를 받기 위해 필요한 정보입니다.",
  fieldsHint:
    "이름·연락처·주소·이메일과 메신저 ID를 입력해주세요.",
} as const;

export const VERIFY_FORM_STEP_SHELL =
  "mx-auto w-full max-w-[640px] sm:max-w-[680px]";

/** PC(sm+) 2차 회원가입 — 테두리·보조텍스트 선명도 (Mobile 미적용) */
const VERIFY_FORM_PC_CRISP_FIELDS =
  "sm:border-[#E2E8F0] sm:[&_input]:border-[#CBD5E1] sm:[&_label]:text-[#556070] sm:[&_p.-mt-1]:text-[#556070] sm:[&_.text-xs]:text-[#556070] sm:[&_.mt-2.space-y-3]:text-[#556070] sm:[&_button.mt-3.block]:text-[#556070] sm:[&_button.font-medium]:text-gray-800";

/** 2차 폼 — FunnelPageHeader 설명선명도 (font-size 유지) */
export const VERIFY_FORM_FUNNEL_HEADER_DESC =
  "break-keep text-[12.5px] leading-[1.55] text-[#475569] [overflow-wrap:normal]";

export function getVerifyFormFunnelHeaderAlignProps(
  landingDone: boolean,
  step: string,
  skipSignup: boolean,
): {
  className?: string;
  descriptionClassName?: string;
  verifyEyebrowClassName?: string;
} {
  if (!landingDone || step !== "form" || skipSignup) return {};
  return {
    className: VERIFY_FORM_STEP_SHELL,
    descriptionClassName: VERIFY_FORM_FUNNEL_HEADER_DESC,
    verifyEyebrowClassName: "text-[#475569]",
  };
}

export function getVerifyFormConsentText(lang: SupportedLanguage): string {
  return lang === "ko" ? VERIFY_FORM_KO.consentSummary : LEAD_FORM_MESSAGES[lang].consentSummary;
}

export function getVerifyFormPrivacyText(lang: SupportedLanguage): string {
  return lang === "ko" ? VERIFY_FORM_KO.privacyNoticeLine : LEAD_FORM_MESSAGES[lang].privacyNoticeLine;
}

/** Form step — 2차 회원가입 상단 후킹 */
export function VerifyFormPageHeader() {
  return (
    <div className={cn(VERIFY_FORM_STEP_SHELL, "mt-6 sm:mt-7")}>
      <h2 className="break-keep text-[19px] font-bold leading-snug tracking-tight text-[#0B2A6B] sm:text-[20px]">
        내 상황이 달라지면, 검토 결과도 달라집니다.
      </h2>
    </div>
  );
}

/** Form step — 제출 전 미리 확인 패널 (previewDiagnosis 기반) */
export function VerifyFormPreviewPanel({
  isLow,
  riskGauge,
}: {
  isLow: boolean;
  riskGauge: ReactNode;
}) {
  return (
    <div
      className={cn(
        VERIFY_FORM_STEP_SHELL,
        "mt-3 rounded-2xl border bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-5 sm:py-4",
        isLow ? "border-gray-100 sm:border-[#E2E8F0]" : "border-amber-100 sm:border-amber-200",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
        미리 확인
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2.5">
            {isLow ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={22} aria-hidden />
            ) : (
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={22} aria-hidden />
            )}
            <p className="break-keep text-[15px] font-bold leading-snug text-gray-900 sm:text-[16px]">
              {isLow ? "우선 확인할 위험 신호가 낮습니다" : "우선 확인할 위험 신호가 있습니다"}
            </p>
          </div>

          <p className="mt-1.5 break-keep pl-[34px] text-[13px] leading-[1.5] text-[#475569] sm:text-[13.5px] sm:text-[#334155] [overflow-wrap:normal]">
            {isLow
              ? "입력하신 사건유형·설명을 바탕으로 미리 확인한 결과, 우선 대응이 필요한 치명적 위험요인은 보이지 않습니다."
              : "입력하신 사건유형·설명을 바탕으로 미리 확인한 결과, 반려·손해로 이어질 수 있는 위험요인이 있어 서류 확인이 필요합니다."}
          </p>
        </div>

        <div className="shrink-0 self-center">{riskGauge}</div>
      </div>

      <p className="mt-2.5 break-keep text-[11.5px] leading-[1.5] text-[#64748B] sm:text-[12px] sm:text-[#556070] [overflow-wrap:normal]">
        * 입력 정보 기준 미리 확인입니다. 아래 정보를 제출하시면 정리된{" "}
        <span className="whitespace-nowrap">AI 1차 분석 결과</span>를 확인할 수 있습니다.
      </p>

      <div className="mt-2.5">
        <NoticeCard tone={isLow ? "success" : "warning"} className="[&_.opacity-90]:opacity-100">
          연락 정보를 입력하시면 입력하신 내용을 바탕으로 AI 1차 분석 결과를 확인할 수
          있습니다.
        </NoticeCard>
      </div>
    </div>
  );
}

/** Form step — 개인정보 입력 카드 래퍼 */
export function VerifyFormFieldsSection({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        VERIFY_FORM_STEP_SHELL,
        "mt-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-5 sm:py-5",
        VERIFY_FORM_PC_CRISP_FIELDS,
      )}
    >
      <VerifyFormFieldsIntro lang={lang} />
      {children}
    </div>
  );
}

/** Form step — 개인정보 입력 섹션 소개 */
export function VerifyFormFieldsIntro({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className="border-b border-[#EEF2F6] pb-3 sm:border-[#E2E8F0]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B] sm:text-[#556070]">
        결과 확인을 위한 정보
      </p>
      <p className="mt-1 break-keep text-[14px] font-bold leading-snug text-[#0B2A6B] sm:text-[15px]">
        {lang === "ko" ? VERIFY_FORM_KO.fieldsIntro : "Information needed to save and deliver your results"}
      </p>
      {lang === "ko" ? (
        <p className="mt-1 break-keep text-[12.5px] leading-[1.5] text-[#556070] sm:text-[13px] sm:text-[#475569] [overflow-wrap:normal]">
          {VERIFY_FORM_KO.fieldsHint}
        </p>
      ) : null}
    </div>
  );
}

/** Diagnosis step — 입력 상황과 결과 연결 (legacy — prefer VerifyDiagnosisHeader) */
export function VerifyDiagnosisContextLine() {
  return (
    <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
      방금 입력하신 상황을 바탕으로 정리한{" "}
      <span className="whitespace-nowrap">AI 1차 분석 결과</span>입니다.
    </p>
  );
}

/** Diagnosis header — 서비스명 → AI 1차 분석 → 설명 */
export function VerifyDiagnosisHeader({ serviceName }: { serviceName: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        {serviceName}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[#2563EB]">AI 1차 분석</p>
      <p className="mt-1.5 break-keep text-[13px] leading-[1.55] text-[#556070] [overflow-wrap:normal]">
        방금 입력하신 상황을 바탕으로 정리한 결과입니다.
      </p>
    </div>
  );
}

/** Diagnosis — 1차 분석 → AI Review → 전체 리포트 연결 */
export function VerifyDiagnosisPipelineHint() {
  return (
    <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
      <p className="break-keep text-[11px] leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
        <span className="font-medium text-[#94A3B8]">지금</span>
        <span className="mx-1 text-[#CBD5E1]">·</span>
        <span className="font-medium text-[#0B2A6B]">AI 1차 분석</span>
        <span className="mx-2 text-[#CBD5E1]">→</span>
        <span className="font-medium text-[#94A3B8]">다음</span>
        <span className="mx-1 text-[#CBD5E1]">·</span>
        <span className="font-medium text-[#0B2A6B]">AI Review</span>
        <span className="mx-2 text-[#CBD5E1]">→</span>
        <span className="font-medium text-[#94A3B8]">최종</span>
        <span className="mx-1 text-[#CBD5E1]">·</span>
        <span className="font-medium text-[#0B2A6B]">전체 리포트</span>
      </p>
    </div>
  );
}

export const VERIFY_DIAGNOSIS_LIMIT_NOTICE =
  "실제 서류와 관련 자료를 확인해야 더 정확하게 판단할 수 있습니다.";

export const VERIFY_RISK_FACTOR_CARD_CAPTION =
  "자료 제출 후 더 정확하게 확인할 수 있습니다.";

export const VERIFY_DIAGNOSIS_NEXT_TITLE = "더 정확하게 확인하려면";

export const VERIFY_DIAGNOSIS_NEXT_SUBTITLE =
  "자료를 반영하면 AI Review를 거쳐 전체 리포트로 이어집니다.";

export const VERIFY_AI_REVIEW_CARD_DESC =
  "자료를 제출하면 실제 서류까지 반영해 AI Review를 진행합니다.";

export const VERIFY_EXPERT_CARD_DESC =
  "AI 1차 분석과 제출 자료를 전문가가 함께 확인합니다.";

export const VERIFY_DIRECT_CARD_DESC =
  "관할기관·공식 확인 경로를 따라 직접 진행할 수 있습니다.";

export const VERIFY_AI_REVIEW_CTA_FOOTNOTE =
  "자료 제출 → AI Review → 전체 리포트 순으로 진행됩니다.";

export const VERIFY_EXPERT_CTA_FOOTNOTE =
  "AI 1차 분석 + 제출 자료 → 전문가 검토로 이어집니다.";

export const VERIFY_EXPERT_GUIDANCE_DESC =
  "전문가가 첨부하신 서류와 AI 1차 분석 내용을 함께 확인한 뒤 결과를 안내드립니다.";
