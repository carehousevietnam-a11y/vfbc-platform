"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  MessageCircle,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

type Nationality = "korea" | "china" | "japan" | "other" | null;
type Visa = "invest" | "work" | "tourist" | "other" | null;
type Role = "legal-rep" | "manager" | "staff" | null;
type Company = "fdi" | "local" | "unregistered" | null;
type Result = "possible" | "conditional" | "impossible" | null;

function computeResult(visa: Visa, role: Role, company: Company): Result {
  if (company === "unregistered") return "impossible";
  if (visa === "tourist" && role !== "legal-rep") return "conditional";
  if (visa === "invest" || visa === "work") return "possible";
  if (visa === "other") return "conditional";
  return null;
}

export default function TrcCheckPage() {
  const [nationality, setNationality] = useState<Nationality>(null);
  const [visa, setVisa] = useState<Visa>(null);
  const [role, setRole] = useState<Role>(null);
  const [company, setCompany] = useState<Company>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const messengers = MESSENGERS_KO;

  const result = computeResult(visa, role, company);
  const showResult = nationality && visa && role && company;

  function reset() {
    setNationality(null);
    setVisa(null);
    setRole(null);
    setCompany(null);
    setLeadSubmitted(false);
    setLeadError(null);
    setEmailProvided(false);
  }

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setLeadError(null);

    const fd = new FormData(e.currentTarget);
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
      service_type: "trc",
      result: result,
      source_page: "/check/trc",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "trc_diagnosis_lead",
      tag: "TRC",
    });

    // 계정 자동생성 + result_token 발급 (실패해도 리드 접수 자체는 이미 완료된 상태이므로 화면은 정상 진행)
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
          거주증 (TRC) 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          국적·비자·직책·회사 형태에 따라 거주증 발급 가능 여부가 달라집니다.
        </p>

        {!showResult && (
          <>
            {!nationality && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  1. 국적이 어떻게 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "korea", label: "대한민국" },
                    { key: "china", label: "중국" },
                    { key: "japan", label: "일본" },
                    { key: "other", label: "기타 국가" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setNationality(opt.key as Nationality)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {nationality && !visa && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  2. 현재 어떤 비자를 소지하고 있나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "invest", label: "투자비자 (DT)", desc: "출자·투자 목적" },
                    { key: "work", label: "노동허가부 비자 (LD)", desc: "노동허가 취득 완료" },
                    { key: "tourist", label: "관광·단기비자 (DL 등)", desc: "단기 체류 목적" },
                    { key: "other", label: "기타 비자", desc: "위 항목에 없는 경우" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setVisa(opt.key as Visa)}
                      className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                    >
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {nationality && visa && !role && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  3. 회사 내 직책이 어떻게 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "legal-rep", label: "법인장 · 법정대표자" },
                    { key: "manager", label: "매니저 · 관리직" },
                    { key: "staff", label: "일반 직원" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setRole(opt.key as Role)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {nationality && visa && role && !company && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  4. 소속 회사의 법인 형태는 무엇인가요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "fdi", label: "외국인투자법인 (FDI)" },
                    { key: "local", label: "현지 법인" },
                    { key: "unregistered", label: "아직 미등록 · 준비 중" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setCompany(opt.key as Company)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 결과: 가능 — 리드폼 */}
        {showResult && result === "possible" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              거주증 발급이 가능합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 비자·직책·회사 형태 기준으로 거주증(TRC) 신청 요건을
              충족합니다.
            </p>
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              정확한 필요서류와 처리절차는 회사 형태·직책에 따라 달라져요.
              이름·연락처·주소만 남기면 맞춤 서류 체크리스트를 무료로
              보내드립니다.
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
              {leadError && (
                <p className="text-xs text-red-600">{leadError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? "접수 중..." : "맞춤 서류 체크리스트 무료로 받기"}
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

        {/* 결과: 가능 — 접수 완료, 카톡/잘로로 안내서류+신청링크 발송 */}
        {showResult && result === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는{" "}
              {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              입력하신 주소·상황을 기준으로 정리한 상세 안내와 필요서류
              체크리스트를 잠시 후 메시지로 보내드립니다. 신청을 원하시면
              그 메시지 안의 링크로 바로 진행하실 수 있어요.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              {emailProvided
                ? "메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요."
                : "메시지가 오지 않으면 알려주세요 — 담당자가 직접 확인 후 연락드립니다."}
            </div>
            <Link
              href="/consultation?case=trc-application"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-900 px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
            >
              <FileText size={15} /> 메시지 기다리지 않고 지금 상담하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 조건부 가능 — 리드폼 */}
        {showResult && result === "conditional" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              조건에 따라 가능할 수 있습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 비자 유형이나 직책만으로는 거주증 발급이 자동으로
              보장되지 않습니다.
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              비자 전환 가능 여부와 정확한 조건은 상황마다 다릅니다.
              이름·연락처·주소만 남기면 전문가가 직접 확인해드려요.
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
              {leadError && (
                <p className="text-xs text-red-600">{leadError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? "접수 중..." : "전문가 확인 요청하기"}
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

        {/* 결과: 조건부 가능 — 접수 완료, 카톡/잘로 안내 */}
        {showResult && result === "conditional" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는{" "}
              {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              입력하신 상황을 전문가가 검토한 뒤, 비자 전환·거주증 발급
              가능 여부와 필요서류를 메시지로 정리해드립니다.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              {emailProvided
                ? "메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요."
                : "메시지가 오지 않으면 알려주세요 — 담당자가 직접 확인 후 연락드립니다."}
            </div>
            <Link
              href="/consultation?case=trc-conditional"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              메시지 기다리지 않고 지금 상담하기
            </Link>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 결과: 불가 */}
        {showResult && result === "impossible" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <XCircle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              현재 상태로는 거주증 발급이 어렵습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              법인이 아직 등록되지 않은 상태에서는 거주증 신청 자체가
              불가능합니다. 먼저 법인설립(IRC/ERC) 절차를 진행해야 합니다.
            </p>
            <Link
              href="/register/company"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              법인설립 절차 확인하기
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
