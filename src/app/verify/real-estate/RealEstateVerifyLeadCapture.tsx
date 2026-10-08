"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  InfoBox,
  PrimaryButton,
  RiskGauge,
  VerifyFormFieldsSection,
  VerifyFormPageHeader,
  VerifyFormPreviewPanel,
  getVerifyFormConsentText,
  getVerifyFormPrivacyText,
} from "@/components/ui";
import { MESSENGERS_BY_LANGUAGE, type MessengerPair } from "@/lib/messenger";
import {
  LEAD_FORM_MESSAGES,
  resolveLanguage,
  validateLeadForm,
  getConsentTranslation,
  type FieldErrors,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";

function ConsentDetails({
  open,
  onToggle,
  lang = "ko",
  messengers,
}: {
  open: boolean;
  onToggle: () => void;
  lang?: SupportedLanguage;
  messengers: MessengerPair;
}) {
  const translation = getConsentTranslation(lang, messengers.primary.label, messengers.secondary.label);
  return (
    <div className="mt-1 rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left font-medium text-gray-700"
      >
        {open ? "▾" : "▸"} 자세히 보기 (베트남 법령 원문 · 번역)
      </button>
      {open ? (
        <div className="mt-2 space-y-3 text-gray-600">
          <div>
            <p className="font-semibold text-gray-700">🇻🇳 Việt Nam (nguyên văn)</p>
            <p>
              Theo Luật Bảo vệ dữ liệu cá nhân (Luật số 91/2025/QH15, có hiệu lực từ ngày 01/01/2026) và
              Nghị định số 356/2025/NĐ-CP hướng dẫn thi hành, chúng tôi thu thập và xử lý dữ liệu cá nhân của
              bạn sau khi có sự đồng ý rõ ràng, bao gồm: họ tên, số điện thoại, địa chỉ, email, và ít nhất một
              ID mạng xã hội (Kakao, WeChat, WhatsApp hoặc Zalo — bắt buộc chọn một), nhằm mục đích tư vấn,
              hướng dẫn đăng ký và tạo tài khoản dịch vụ tự động.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">{translation.heading}</p>
            <p>{translation.body}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {translation.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <Link
            href="/privacy"
            target="_blank"
            className="inline-block font-semibold text-blue-900 hover:underline"
          >
            개인정보처리방침 전문 보기 →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  riskLevel: "low" | "medium" | "high";
  submitting?: boolean;
  error?: string | null;
  fieldErrors?: FieldErrors;
  consentOpen?: boolean;
  onConsentToggle?: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

/** Admin `VerifyAdminLeadCapture`와 동일 슬롯·폼 구조 — 제출 시 verify_lead 저장 */
export default function RealEstateVerifyLeadCapture({
  riskLevel,
  submitting = false,
  error = null,
  fieldErrors = {},
  consentOpen = false,
  onConsentToggle,
  onSubmit,
}: Props) {
  const searchParams = useSearchParams();
  const lang = resolveLanguage(searchParams.get("lang"));
  const messengers = MESSENGERS_BY_LANGUAGE[lang];
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    kakao_id: "",
    zalo_id: "",
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { valid: formValuesValid, errors: liveErrors } = validateLeadForm(formValues, lang);
  const mergedErrors = { ...liveErrors, ...fieldErrors };
  const canSubmit = formValuesValid && consentChecked && !submitting;
  const isLow = riskLevel === "low";
  return (
    <div>
      <VerifyFormPageHeader />
      <VerifyFormPreviewPanel isLow={isLow} riskGauge={<RiskGauge riskLevel={riskLevel} />} />

      <VerifyFormFieldsSection lang={lang}>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            name="name"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].name.placeholder}
            onChange={(ev) => setFormValues((v) => ({ ...v, name: ev.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.name && mergedErrors.name
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.name && mergedErrors.name ? (
            <p className="-mt-2 text-xs text-red-600">{mergedErrors.name}</p>
          ) : null}
          <input
            type="tel"
            name="phone"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].phone.placeholder}
            onChange={(ev) => setFormValues((v) => ({ ...v, phone: ev.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.phone && mergedErrors.phone
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.phone && mergedErrors.phone ? (
            <p className="-mt-2 text-xs text-red-600">{mergedErrors.phone}</p>
          ) : null}
          <input
            type="text"
            name="address"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].address.placeholder}
            onChange={(ev) => setFormValues((v) => ({ ...v, address: ev.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, address: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.address && mergedErrors.address
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.address && mergedErrors.address ? (
            <p className="-mt-2 text-xs text-red-600">{mergedErrors.address}</p>
          ) : null}
          <input
            type="email"
            name="email"
            required
            placeholder={LEAD_FORM_MESSAGES[lang].email.placeholder}
            onChange={(ev) => setFormValues((v) => ({ ...v, email: ev.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={`h-11 w-full rounded-lg border px-4 text-sm focus:outline-none ${
              touched.email && mergedErrors.email
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-900"
            }`}
          />
          {touched.email && mergedErrors.email ? (
            <p className="-mt-2 text-xs text-red-600">{mergedErrors.email}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              name="kakao_id"
              placeholder={`${messengers.primary.label} ID`}
              onChange={(ev) => setFormValues((v) => ({ ...v, kakao_id: ev.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, kakao_id: true }))}
              className={`h-11 rounded-lg border px-4 text-sm focus:outline-none ${
                (touched.kakao_id || touched.zalo_id) && mergedErrors.sns
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-blue-900"
              }`}
            />
            <input
              type="text"
              name="zalo_id"
              placeholder={`${messengers.secondary.label} ID`}
              onChange={(ev) => setFormValues((v) => ({ ...v, zalo_id: ev.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, zalo_id: true }))}
              className={`h-11 rounded-lg border px-4 text-sm focus:outline-none ${
                (touched.kakao_id || touched.zalo_id) && mergedErrors.sns
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-blue-900"
              }`}
            />
          </div>
          {(touched.kakao_id || touched.zalo_id) && mergedErrors.sns ? (
            <p className="-mt-2 text-xs text-red-600">{mergedErrors.sns}</p>
          ) : null}

          <label className="flex items-start gap-2 text-[11px] text-gray-600">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={consentChecked}
              onChange={(ev) => setConsentChecked(ev.target.checked)}
              className="mt-0.5"
            />
            <span>{getVerifyFormConsentText(lang)}</span>
          </label>
          <ConsentDetails
            open={consentOpen}
            onToggle={() => onConsentToggle?.()}
            lang={lang}
            messengers={messengers}
          />
          <InfoBox className="text-[11px]">{getVerifyFormPrivacyText(lang)}</InfoBox>
          {error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}
          <PrimaryButton
            type="submit"
            variant={isLow ? "primary" : "amber"}
            disabled={!canSubmit}
            loading={submitting}
          >
            {submitting
              ? LEAD_FORM_MESSAGES[lang].submitLoadingLabel
              : lang === "ko"
                ? "AI 1차 분석 결과 보기"
                : LEAD_FORM_MESSAGES[lang].submitLabel}
          </PrimaryButton>
        </form>
      </VerifyFormFieldsSection>
    </div>
  );
}
