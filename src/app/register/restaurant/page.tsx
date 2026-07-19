"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UtensilsCrossed, CheckCircle2, AlertTriangle } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

// 이전 신청 이력 — REGISTER 표준폼 공통 질문. 다른 REGISTER 카테고리 확장 시
// 동일 옵션을 그대로 사용한다.
const PREVIOUS_APPLICATION_OPTIONS = [
  "처음 신청합니다",
  "신청 준비 중입니다",
  "보완 요청을 받았습니다",
  "반려된 적이 있습니다",
] as const;

// 식당허가 기본 조건 질문 — 카테고리 전용, 다른 REGISTER로 확장 시 업종에 맞게
// 별도로 정의한다.
const OPERATION_STATUS_OPTIONS = [
  "아직 준비 단계입니다",
  "곧 오픈 예정입니다",
  "이미 운영 중입니다",
] as const;

const BUSINESS_REGISTRATION_OPTIONS = [
  "등록을 완료했습니다",
  "등록 진행 중입니다",
  "아직 등록 전입니다",
] as const;

const PREMISES_OPTIONS = [
  "임대차 계약을 완료했습니다",
  "계약을 협의 중입니다",
  "아직 확보하지 못했습니다",
] as const;

const HYGIENE_FIRE_OPTIONS = [
  "준비를 마쳤습니다",
  "준비 중입니다",
  "아직 시작하지 못했습니다",
] as const;

function ConsentDetails({
  open,
  onToggle,
  highlight,
}: {
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`mt-1 rounded-lg p-3 text-[11px] leading-relaxed transition-colors ${
        highlight ? "bg-red-50 ring-1 ring-red-200" : "bg-gray-50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left font-medium text-gray-700"
      >
        {open ? "▾" : "▸"} 자세히 보기 (베트남 법령 원문 · 한국어 번역)
      </button>

      {highlight && (
        <p className="mt-2 font-semibold text-red-700">
          베트남 개인정보보호법에 따라 동의하지 않으면 계정 생성 및 서비스
          이용(결과 확인, 상담 등)을 진행할 수 없습니다.
        </p>
      )}

      {open && (
        <div className="mt-2 space-y-3 text-gray-600">
          <div>
            <p className="font-semibold text-gray-700">🇻🇳 Việt Nam (nguyên văn)</p>
            <p>
              Theo Luật Bảo vệ dữ liệu cá nhân (Luật số 91/2025/QH15, có hiệu
              lực từ ngày 01/01/2026) và Nghị định số 356/2025/NĐ-CP hướng dẫn
              thi hành, chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn
              sau khi có sự đồng ý rõ ràng, bao gồm: họ tên, số điện thoại,
              địa chỉ, email (nếu có), ID Kakao/Zalo (nếu có), nhằm mục đích
              tư vấn, hướng dẫn đăng ký và tạo tài khoản dịch vụ tự động. Dữ
              liệu được lưu trữ đến khi bạn hủy tài khoản hoặc đạt được mục
              đích xử lý. Bạn có quyền từ chối đồng ý; tuy nhiên, việc từ
              chối có thể khiến bạn không thể sử dụng một số dịch vụ (xem kết
              quả chẩn đoán, tư vấn, v.v.).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">한국어 번역 (이용자 편의 제공용)</p>
            <p>
              본 서비스는 베트남에서 운영되며, 이용자의 개인정보는 베트남
              개인정보보호법(91/2025/QH15호, 2026년 1월 1일 시행) 및 시행령
              (356/2025/NĐ-CP호)에 따라 처리됩니다. 원문과 번역본이 다를
              경우 베트남어 원문이 우선합니다.
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>수집 항목: 이름, 전화번호, 주소, (선택) 이메일, (선택) 카카오톡/잘로 ID</li>
              <li>수집 목적: 상담·안내 및 서비스 이용을 위한 계정 자동 생성</li>
              <li>보유 기간: 회원 탈퇴 시 또는 목적 달성 시까지</li>
              <li>
                동의를 거부하실 수 있으나, 거부 시 계정 생성이 불가하여 결과
                확인·상담 등 서비스 이용이 제한될 수 있습니다.
              </li>
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
      )}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onSelect,
  columns = 3,
}: {
  options: readonly string[];
  value: string | null;
  onSelect: (v: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`mt-3 grid grid-cols-1 gap-2.5 ${
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      }`}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`flex h-14 items-center justify-center rounded-2xl border px-3 text-center text-xs font-semibold leading-snug transition-all ${
            value === opt
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-gray-100 bg-white text-gray-900 hover:-translate-y-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function RegisterRestaurantPage() {
  const [step, setStep] = useState<"questions" | "form" | "completed">("questions");

  const [previousApplicationStatus, setPreviousApplicationStatus] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<string | null>(null);
  const [businessRegistrationStatus, setBusinessRegistrationStatus] = useState<string | null>(null);
  const [premisesStatus, setPremisesStatus] = useState<string | null>(null);
  const [hygieneFireStatus, setHygieneFireStatus] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const messengers = MESSENGERS_KO;

  function handleQuestionsNext() {
    if (
      !previousApplicationStatus ||
      !operationStatus ||
      !businessRegistrationStatus ||
      !premisesStatus ||
      !hygieneFireStatus
    ) {
      setQuestionsError("모든 항목을 선택해주세요.");
      return;
    }
    setQuestionsError(null);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (fd.get("agreeTerms") !== "on") {
      setConsentOpen(true);
      setConsentHighlight(true);
      return;
    }
    setConsentHighlight(false);

    setSubmitting(true);
    setError(null);
    const leadId = crypto.randomUUID();

    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error: err } = await supabase.from("leads").insert({
      id: leadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "register_restaurant",
      result: null,
      source_page: "/register/restaurant",
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "register_lead",
      tag: "REGISTER_RESTAURANT",
      meta: {
        previous_application_status: previousApplicationStatus,
        operation_status: operationStatus,
        business_registration_status: businessRegistrationStatus,
        premises_status: premisesStatus,
        hygiene_fire_readiness: hygieneFireStatus,
      },
    });

    try {
      const res = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, name, phone, email, address }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("lead-submit API error:", errBody);
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
    }

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setEmailProvided(!!email);
    setSubmitting(false);
    setStep("completed");
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600">
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접허가받기 · 베트남 인허가전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">식당허가</h1>
        <p className="mt-1 text-sm text-gray-500">요식업 영업허가</p>

        {/* STEP1: 이전 신청 이력 + 식당허가 기본 조건 질문 */}
        {step === "questions" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <UtensilsCrossed className="text-amber-700" size={28} />
            <span className="mt-3 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              무허가 영업 시 즉시 폐쇄
            </span>

            <p className="mt-5 text-sm font-semibold text-gray-900">
              1. 이전에 식당허가를 신청하신 적이 있나요?
            </p>
            <OptionGrid
              options={PREVIOUS_APPLICATION_OPTIONS}
              value={previousApplicationStatus}
              onSelect={setPreviousApplicationStatus}
              columns={2}
            />

            <p className="mt-6 text-sm font-semibold text-gray-900">
              2. 현재 식당 운영 상태는 어떤가요?
            </p>
            <OptionGrid
              options={OPERATION_STATUS_OPTIONS}
              value={operationStatus}
              onSelect={setOperationStatus}
            />

            <p className="mt-6 text-sm font-semibold text-gray-900">
              3. 사업자·법인 등록을 하셨나요?
            </p>
            <OptionGrid
              options={BUSINESS_REGISTRATION_OPTIONS}
              value={businessRegistrationStatus}
              onSelect={setBusinessRegistrationStatus}
            />

            <p className="mt-6 text-sm font-semibold text-gray-900">
              4. 영업장(매장)을 확보하셨나요?
            </p>
            <OptionGrid
              options={PREMISES_OPTIONS}
              value={premisesStatus}
              onSelect={setPremisesStatus}
            />

            <p className="mt-6 text-sm font-semibold text-gray-900">
              5. 위생·소방 관련 준비는 어느 정도 되셨나요?
            </p>
            <OptionGrid
              options={HYGIENE_FIRE_OPTIONS}
              value={hygieneFireStatus}
              onSelect={setHygieneFireStatus}
            />

            {questionsError && <p className="mt-3 text-xs text-red-600">{questionsError}</p>}

            <button
              onClick={handleQuestionsNext}
              className="mt-6 w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              다음
            </button>
          </div>
        )}

        {/* STEP2: 개인정보 입력 + 동의 */}
        {step === "form" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <UtensilsCrossed className="text-amber-700" size={28} />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              이름·연락처만 남기면 답변하신 내용을 바탕으로 필요서류를
              안내해드리고, 예상비용은 메시지로 보내드리겠습니다.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input type="text" name="name" required placeholder="이름"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
              <input type="tel" name="phone" required placeholder="전화번호"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
              <input type="text" name="address" required placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
              <input type="email" name="email" placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="kakao_id" placeholder={`${messengers.primary.label} ID (선택)`}
                  className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
                <input type="text" name="zalo_id" placeholder={`${messengers.secondary.label} ID (선택)`}
                  className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-amber-600 focus:outline-none" />
              </div>
              <div>
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    onChange={(e) => {
                      if (e.target.checked) setConsentHighlight(false);
                    }}
                    className="mt-0.5"
                  />
                  <span>(필수) {CONSENT_SUMMARY}</span>
                </label>
                <ConsentDetails
                  open={consentOpen}
                  onToggle={() => setConsentOpen((v) => !v)}
                  highlight={consentHighlight}
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                {submitting ? "접수 중..." : "필요서류·비용 무료로 안내받기"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-400">입력하신 정보는 상담 안내 목적으로만 사용됩니다.</p>
            <button
              onClick={() => setStep("questions")}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 이전 단계로
            </button>
          </div>
        )}

        {/* STEP3: 단순 접수 완료 화면 (AI 진단 없음) */}
        {step === "completed" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={24} />
            <p className="mt-3 text-base font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는 {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              답변하신 내용을 바탕으로 담당자가 필요서류·예상 비용·일정을
              정리해 메시지로 보내드립니다.
            </p>
            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요.
              </p>
            )}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
            </div>
            <Link href="/consultation?case=register-restaurant"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
              메시지 기다리지 않고 지금 상담하기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
