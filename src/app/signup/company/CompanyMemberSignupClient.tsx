"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LEAD_FORM_MESSAGES,
  validateLeadForm,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";
import { MESSENGERS_BY_LANGUAGE } from "@/lib/messenger";
import {
  COMPANY_CATEGORY_OPTIONS,
  COMPANY_SIGNUP_CHANNEL,
  JOB_POSITION_OPTIONS,
  parseCompanySignupProfile,
  validateCompanySignupPassword,
  type CompanyCategory,
  type JobPosition,
} from "@/lib/accounting/companySignup";
import { PrimaryButton, SelectionCard, VerifyFormFieldsSection } from "@/components/ui";

const lang: SupportedLanguage = "ko";
const messengers = MESSENGERS_BY_LANGUAGE[lang];

export default function CompanyMemberSignupClient() {
  const [companyCategory, setCompanyCategory] = useState<CompanyCategory | "">("");
  const [companyCategoryOther, setCompanyCategoryOther] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobPosition, setJobPosition] = useState<JobPosition | "">("");
  const [jobPositionOther, setJobPositionOther] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [kakaoId, setKakaoId] = useState("");
  const [zaloId, setZaloId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const leadValues = useMemo(
    () => ({
      name,
      phone,
      address,
      email,
      kakao_id: kakaoId,
      zalo_id: zaloId,
    }),
    [name, phone, address, email, kakaoId, zaloId]
  );

  const { valid: leadValid } = validateLeadForm(leadValues, lang);
  const passwordOk = Object.keys(validateCompanySignupPassword(password, passwordConfirm)).length === 0;
  const profileOk = parseCompanySignupProfile({
    companyCategory,
    companyCategoryOther,
    companyName,
    jobPosition,
    jobPositionOther,
  }).ok;

  const canSubmit =
    Boolean(companyCategory && jobPosition && consent) &&
    leadValid &&
    passwordOk &&
    profileOk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/company-member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySignupChannel: COMPANY_SIGNUP_CHANNEL,
        companyCategory,
        companyCategoryOther,
        companyName,
        jobPosition,
        jobPositionOther,
        name,
        phone,
        address,
        email,
        kakao_id: kakaoId,
        zalo_id: zaloId,
        password,
        passwordConfirm,
        lang,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        typeof data.message === "string"
          ? data.message
          : "가입에 실패했습니다. 입력 내용을 확인해주세요."
      );
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-6 text-center">
          <p className="text-lg font-bold text-emerald-900">기업회원 가입이 완료되었습니다.</p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-800">
            세무·회계 작업공간은 승인 후 이용할 수 있습니다. 로그인하여 마이페이지에서 진행 상황을
            확인할 수 있습니다.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#0B2A6B] px-6 text-sm font-semibold text-white"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-8">
      <div className="flex flex-col items-center text-center">
        <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={44} height={44} />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
          VFBCAI · 기업회원
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2A6B]">기업회원 가입</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#556070]">
          베트남 사업자 세무·회계 서비스를 이용하기 위한 가입입니다. 사업자등록증 등 서류는 이후
          기능 진입 시 제출합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
            회사 정보
          </p>
          <p className="mt-1 text-[15px] font-bold text-[#0B2A6B]">회원 유형과 회사명을 선택합니다.</p>

          <p className="mt-4 text-sm font-semibold text-[#0B2A6B]">회원 유형</p>
          <div className="mt-2 space-y-2">
            {COMPANY_CATEGORY_OPTIONS.map((opt) => (
              <SelectionCard
                key={opt.value}
                selected={companyCategory === opt.value}
                onClick={() => setCompanyCategory(opt.value)}
                title={opt.label}
                tone="slate"
              />
            ))}
          </div>
          {companyCategory === "other" && (
            <input
              type="text"
              value={companyCategoryOther}
              onChange={(e) => setCompanyCategoryOther(e.target.value)}
              placeholder="회원 유형을 입력해주세요."
              className="mt-3 h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
          )}

          <label className="mt-5 block text-sm font-semibold text-[#0B2A6B]">회사명</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder='예비 창업자는 "미정"을 입력할 수 있습니다.'
            required
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
          />

          <p className="mt-5 text-sm font-semibold text-[#0B2A6B]">직위</p>
          <div className="mt-2 space-y-2">
            {JOB_POSITION_OPTIONS.map((opt) => (
              <SelectionCard
                key={opt.value}
                selected={jobPosition === opt.value}
                onClick={() => setJobPosition(opt.value)}
                title={opt.label}
                tone="slate"
              />
            ))}
          </div>
          {jobPosition === "other" && (
            <input
              type="text"
              value={jobPositionOther}
              onChange={(e) => setJobPositionOther(e.target.value)}
              placeholder="직위를 입력해주세요."
              className="mt-3 h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
          )}
        </section>

        <VerifyFormFieldsSection lang={lang}>
          <div className="mt-2 space-y-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={LEAD_FORM_MESSAGES[lang].name.placeholder}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={LEAD_FORM_MESSAGES[lang].phone.placeholder}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={LEAD_FORM_MESSAGES[lang].address.placeholder}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={LEAD_FORM_MESSAGES[lang].email.placeholder}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={kakaoId}
                onChange={(e) => setKakaoId(e.target.value)}
                placeholder={`${messengers.primary.label} ID`}
                className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <input
                type="text"
                value={zaloId}
                onChange={(e) => setZaloId(e.target.value)}
                placeholder={`${messengers.secondary.label} ID`}
                className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
            </div>
            <p className="-mt-1 text-[11px] text-gray-400">{LEAD_FORM_MESSAGES[lang].sns.required}</p>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (8자 이상)"
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
            />

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>(필수) 개인정보 수집·이용에 동의합니다.</span>
            </label>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <PrimaryButton type="submit" loading={submitting} disabled={!canSubmit}>
              {submitting ? "가입 처리 중…" : "기업회원 가입하기"}
            </PrimaryButton>
          </div>
        </VerifyFormFieldsSection>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        개인회원은 기존 검토·등록 퍼널에서 가입합니다.{" "}
        <Link href="/login" className="text-[#0B2A6B] underline-offset-2 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
