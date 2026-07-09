"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

type HasTrc = "yes" | "no" | null;
type HasLicense = "yes" | "no" | null;
type Result = "possible" | "conditional" | "impossible" | null;

function computeResult(trc: HasTrc, license: HasLicense): Result {
  if (trc === "no") return "conditional";
  if (trc === "yes" && license === "yes") return "possible";
  if (trc === "yes" && license === "no") return "impossible";
  return null;
}

export default function DrivingLicenseCheckPage() {
  const [trc, setTrc] = useState<HasTrc>(null);
  const [license, setLicense] = useState<HasLicense>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const messengers = MESSENGERS_KO;

  const result = computeResult(trc, license);
  const showResult = trc && license;

  function reset() {
    setTrc(null);
    setLicense(null);
    setLeadSubmitted(false);
    setLeadError(null);
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
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error } = await supabase.from("leads").insert({
      id: leadId,
      name,
      phone,
      address,
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

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
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
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? "접수 중..." : "맞춤 안내 무료로 받기"}
              </button>
            </form>
            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {trc === "yes" && result === "possible" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              접수 완료 — {messengers.primary.label} 또는{" "}
              {messengers.secondary.label}로 곧 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              필요서류 체크리스트와 전환 절차를 메시지로 보내드립니다.
            </p>
            <Link
              href="/consultation?case=driving-license"
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
