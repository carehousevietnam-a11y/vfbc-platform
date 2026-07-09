"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

type Education = "university" | "college" | "highschool" | null;
type Experience = "over3" | "one-to-three" | "under1" | null;
type Job = "expert" | "technical" | "unskilled" | null;
type Result = "possible" | "conditional" | "impossible" | null;

function computeResult(edu: Education, exp: Experience, job: Job): Result {
  if (job === "unskilled") return "impossible";
  if (edu === "university") return "possible";
  if (edu === "college" && exp === "over3") return "possible";
  if (job === "technical" && exp === "over3") return "conditional";
  if (edu === "college") return "conditional";
  if (exp === "over3") return "conditional";
  return "impossible";
}

export default function WpCheckPage() {
  const [education, setEducation] = useState<Education>(null);
  const [experience, setExperience] = useState<Experience>(null);
  const [job, setJob] = useState<Job>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const messengers = MESSENGERS_KO;

  const result = computeResult(education, experience, job);
  const showResult = education && experience && job;

  function reset() {
    setEducation(null);
    setExperience(null);
    setJob(null);
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
      service_type: "wp",
      result: result,
      source_page: "/check/wp",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "wp_diagnosis_lead",
      tag: "WORK_PERMIT",
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
          노동허가 (WP) 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          학력·경력·직무 형태에 따라 노동허가 발급 가능 여부가 달라집니다.
        </p>

        {!showResult && (
          <>
            {!education && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  1. 최종 학력이 어떻게 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "university", label: "대학교 졸업 이상" },
                    { key: "college", label: "전문대 졸업" },
                    { key: "highschool", label: "고등학교 졸업 이하" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setEducation(opt.key as Education)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {education && !experience && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  2. 해당 직무 관련 경력은 얼마나 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "over3", label: "3년 이상" },
                    { key: "one-to-three", label: "1~3년" },
                    { key: "under1", label: "1년 미만" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setExperience(opt.key as Experience)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {education && experience && !job && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  3. 담당하실 직무 형태는 무엇인가요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-1">
                  {[
                    { key: "expert", label: "전문직 · 관리직", desc: "매니저, 전문가, 임원 등" },
                    { key: "technical", label: "기능직 · 기술직", desc: "특정 기술·자격이 필요한 직무" },
                    { key: "unskilled", label: "단순노무", desc: "특별한 학력·경력이 필요 없는 업무" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setJob(opt.key as Job)}
                      className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                    >
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{opt.desc}</p>
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
              노동허가 발급이 가능합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 학력·경력·직무 기준으로 노동허가(WP) 신청 요건을
              충족합니다.
            </p>
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              정확한 필요서류와 처리절차는 직무·회사 형태에 따라 달라져요.
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

        {/* 결과: 가능 — 접수 완료 */}
        {showResult && result === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는{" "}
              {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              입력하신 상황을 기준으로 정리한 상세 안내와 필요서류
              체크리스트를 잠시 후 메시지로 보내드립니다.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-blue-900" />
              {emailProvided
                ? "메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요."
                : "메시지가 오지 않으면 알려주세요 — 담당자가 직접 확인 후 연락드립니다."}
            </div>
            <Link
              href="/consultation?case=wp-application"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-blue-900 px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
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

        {/* 결과: 보완필요 — 리드폼 */}
        {showResult && result === "conditional" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              보완이 필요할 수 있습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 학력·경력만으로는 노동허가 발급이 자동으로 보장되지
              않습니다. 경력증명서·자격증 등 추가 서류로 요건을 충족시킬
              수 있는 경우가 많습니다.
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              보완 가능 여부와 정확한 조건은 상황마다 다릅니다.
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

        {/* 결과: 보완필요 — 접수 완료 */}
        {showResult && result === "conditional" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는{" "}
              {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              입력하신 상황을 전문가가 검토한 뒤, 보완 가능 여부와
              필요서류를 메시지로 정리해드립니다.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              {emailProvided
                ? "메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요."
                : "메시지가 오지 않으면 알려주세요 — 담당자가 직접 확인 후 연락드립니다."}
            </div>
            <Link
              href="/consultation?case=wp-conditional"
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
              현재 상태로는 노동허가 발급이 어렵습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              단순노무직은 원칙적으로 외국인 노동허가 대상에서 제외됩니다.
              전문직·기능직으로 직무를 변경하거나 관련 경력·자격을 보완하는
              방법을 전문가와 함께 확인해보세요.
            </p>
            <Link
              href="/consultation?case=wp-impossible"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              전문가와 다른 방법 상담하기
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
