"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

// 운전면허 발급·전환 전국 통합 포털 (2025년 개편 이후 공안부 산하로 이관).
// 신청 과정에서 거주 지역(성/시)을 선택하면 관할 경찰서(CSGT)로 자동 연결됨.
const LICENSE_OFFICIAL_URL = "https://dvc-gplx.csgt.bocongan.gov.vn/";

type HasTrc = "yes" | "no" | null;
type HasLicense = "yes" | "no" | null;
type Result = "possible" | "conditional" | "impossible" | null;

function computeResult(trc: HasTrc, license: HasLicense): Result {
  if (trc === "no") return "conditional";
  if (trc === "yes" && license === "yes") return "possible";
  if (trc === "yes" && license === "no") return "impossible";
  return null;
}

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

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
        {open ? "▾" : "▸"} 자세히 보기 (베트남 · 대한민국 법령 근거)
      </button>

      {highlight && (
        <p className="mt-2 font-semibold text-red-700">
          베트남·한국 개인정보보호법에 따라 동의하지 않으면 계정 생성 및
          서비스 이용(진단 결과 확인, 상담 등)을 진행할 수 없습니다.
        </p>
      )}

      {open && (
        <div className="mt-2 space-y-3 text-gray-600">
          <div>
            <p className="font-semibold text-gray-700">🇻🇳 Việt Nam</p>
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
            <p className="font-semibold text-gray-700">🇰🇷 대한민국</p>
            <p>
              개인정보보호법에 근거하여 아래와 같이 개인정보 수집·이용에
              대해 안내드리며, 동의를 받습니다.
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>수집 항목: 이름, 전화번호, 주소, (선택) 카카오톡/잘로 ID</li>
              <li>수집 목적: 상담·진단 안내 및 서비스 이용을 위한 계정 자동 생성</li>
              <li>보유 기간: 회원 탈퇴 시 또는 목적 달성 시까지</li>
              <li>
                동의를 거부하실 수 있으나, 거부 시 계정 생성이 불가하여 진단
                결과 확인·상담 등 서비스 이용이 제한될 수 있습니다.
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

export default function DrivingLicenseCheckPage() {
  const [trc, setTrc] = useState<HasTrc>(null);
  const [license, setLicense] = useState<HasLicense>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [agencyRequested, setAgencyRequested] = useState(false);
  const [agencySaving, setAgencySaving] = useState(false);
  const [agencyError, setAgencyError] = useState<string | null>(null);
  const messengers = MESSENGERS_KO;

  const result = computeResult(trc, license);
  const showResult = trc && license;

  function reset() {
    setTrc(null);
    setLicense(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setLeadError(null);
    setConsentOpen(false);
    setConsentHighlight(false);
    setAgencyRequested(false);
    setAgencySaving(false);
    setAgencyError(null);
  }

  async function handleAgencyRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "DRIVING_LICENSE",
      });
      if (error) throw error;
      setAgencyRequested(true);
    } catch {
      setAgencyError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setAgencySaving(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (fd.get("agreeTerms") !== "on") {
      setConsentOpen(true);
      setConsentHighlight(true);
      return;
    }
    setConsentHighlight(false);

    setSubmitting(true);
    setLeadError(null);

    const leadId = crypto.randomUUID();
    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error } = await supabase.from("leads").insert({
      id: leadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "driving-license",
      result: result,
      source_page: "/check/driving-license",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "driving_license_diagnosis_lead",
      tag: "DRIVING_LICENSE",
    });

    // 계정은 이 호출 안에서 조용히, 완전히 생성/가입 완료된다.
    // (동의는 위 폼에서 이미 필수 체크박스로 받았음)
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
    setLeadId(leadId);
    setSubmitting(false);
    setLeadSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접확인하기 · 베트남 행정전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          베트남 운전면허 전환 가능성 확인
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          거주증(TRC) 보유 여부와 본국 면허 소지 여부에 따라 전환 가능
          여부가 달라집니다.
        </p>

        {!showResult && (
          <>
            {!trc && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  1. 현재 거주증(TRC)을 보유하고 계신가요?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTrc("yes")}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                  >
                    네, 있습니다
                  </button>
                  <button
                    onClick={() => setTrc("no")}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                  >
                    아니요, 없습니다
                  </button>
                </div>
              </div>
            )}

            {trc === "yes" && !license && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  2. 본국(자국)에서 발급된 운전면허를 보유하고 계신가요?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLicense("yes")}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                  >
                    네, 있습니다
                  </button>
                  <button
                    onClick={() => setLicense("no")}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                  >
                    아니요, 없습니다
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 결과: TRC 없음 — 조건부 (TRC 먼저 필요) */}
        {trc === "no" && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              거주증(TRC) 취득이 먼저 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              베트남 운전면허 전환은 거주증(TRC) 보유자만 신청할 수 있습니다.
              먼저 거주증 발급 가능 여부를 확인해보세요.
            </p>
            <Link
              href="/check/trc"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              거주증(TRC) 가능성 먼저 확인하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 가능 — 리드폼 */}
        {trc === "yes" && result === "possible" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              운전면허 전환이 가능합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              거주증과 본국 면허를 보유하고 있어 베트남 운전면허로 전환
              신청이 가능합니다.
            </p>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              * 위 결과는 입력하신 조건을 기준으로 한 1차 자가진단입니다.
              정확한 전환 가능 여부는 서류 검토 후 전문가 상담을 통해
              확정됩니다.
            </p>
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              필요서류(면허 공증·번역본 등)는 국적에 따라 달라져요.
              이름·연락처·주소만 남기면 맞춤 안내를 보내드립니다.
            </div>

            <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                name="name"
                required
                placeholder="이름"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="전화번호"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <input
                type="text"
                name="address"
                required
                placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
                className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="kakao_id"
                  placeholder={`${messengers.primary.label} ID (선택)`}
                  className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                />
                <input
                  type="text"
                  name="zalo_id"
                  placeholder={`${messengers.secondary.label} ID (선택)`}
                  className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                />
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
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? "접수 중..." : "맞춤 안내 무료로 받기"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-400">
              입력하신 정보는 상담 안내 목적으로만 사용됩니다.
            </p>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 가능 — 필요서류 안내 + 관할기관 링크 + 대행 유도 (셀프가이드 단계) */}
        {trc === "yes" && result === "possible" && leadSubmitted && !agencyRequested && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              필요서류부터 확인하세요
            </p>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                운전면허 전환에 필요한 서류
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 여권 사본 (인적사항 페이지)
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 거주증(TRC) 사본
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 본국 운전면허 원본
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 면허 베트남어 공증 번역본 (국적에 따라 상이)
                </li>
              </ul>
            </div>

            <a
              href={LICENSE_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 hover:underline"
            >
              운전면허 전국 통합 포털 바로가기 <ExternalLink size={14} />
            </a>
            <p className="mt-2 text-[11px] text-gray-400">
              성/시별 정확한 관할 경찰서(CSGT)를 찾기 위해 국가가 운영하는
              통합 시스템으로 연결됩니다. 지역만 선택하면 바로 연결됩니다.
            </p>

            <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              ⏱ 직접 신청하시는 경우, 공증 번역본 준비 실수로 반려·재제출이
              잦아 완료까지 많은 어려움을 겪으실 수 있습니다. VFBC가
              대행하면 서류 검토부터 접수까지 안전하고 빠르게 완료됩니다.
            </div>

            <p className="mt-5 text-xs text-gray-500">
              혼자 진행하기 어렵거나 서류 준비가 막막하시면, 언제든 도움을
              요청하실 수 있습니다.
            </p>
            {agencyError && (
              <p className="mt-3 text-xs text-red-600">{agencyError}</p>
            )}
            <button
              onClick={handleAgencyRequest}
              disabled={agencySaving}
              className="mt-3 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
            >
              {agencySaving ? "접수 중..." : "도움 요청하기 →"}
            </button>
            <p className="mt-2 text-[11px] text-gray-400">
              이미 입력하신 정보로 바로 접수되며, 다시 입력하실 필요 없습니다.
            </p>

            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 가능 — 대행 접수 완료 */}
        {trc === "yes" && result === "possible" && agencyRequested && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              도움 요청이 접수되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              담당자가 서류를 확인한 뒤 진행 상황을 가입하신 이메일 또는{" "}
              {messengers.primary.label}/{messengers.secondary.label}로
              안내드립니다. 별도로 상담을 신청하지 않으셔도 됩니다.
            </p>

            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                메시지가 오지 않으면 이메일도 함께 확인해주세요.
              </p>
            )}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는
              자동 생성되며, 마이페이지에서 언제든 변경하실 수
              있습니다. 거주증·노동허가·비자 등 만료 알림 서비스도
              함께 이용하실 수 있습니다.
            </div>

            <button
              onClick={reset}
              className="mt-6 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 불가 — 본국 면허 없음 */}
        {trc === "yes" && result === "impossible" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              전환이 아닌 신규 취득 절차가 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              본국 면허가 없으면 전환 신청이 불가능하며, 베트남에서 신규로
              면허를 취득해야 합니다. 절차와 소요 기간이 전환보다 훨씬
              복잡합니다.
            </p>
            <Link
              href="/consultation?case=driving-license-new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              신규 취득 절차 상담하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
