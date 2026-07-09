"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FlaskConical, CheckCircle2 } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

export default function RegisterCosmeticsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messengers = MESSENGERS_KO;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const leadId = crypto.randomUUID();

    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error: err } = await supabase.from("leads").insert({
      id: leadId,
      name,
      phone,
      address,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "register_cosmetics",
      result: null,
      source_page: "/register/cosmetics",
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
      tag: "REGISTER_COSMETICS",
    });

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setSubmitting(false);
    setSubmitted(true);
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">화장품허가</h1>
        <p className="mt-1 text-sm text-gray-500">화장품 제조·유통 허가</p>

        <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <FlaskConical className="text-amber-700" size={28} />
          <span className="mt-3 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            무허가 시 전량 회수
          </span>

          {!submitted ? (
            <>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                이름·연락처만 남기면 30초 안에 필요서류를 안내해드리고,
                예상비용은 문자로 보내드리겠습니다.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <input type="text" name="name" required placeholder="이름"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
                <input type="tel" name="phone" required placeholder="전화번호"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
                <input type="text" name="address" required placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="kakao_id" placeholder={`${messengers.primary.label} ID (선택)`}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
                  <input type="text" name="zalo_id" placeholder={`${messengers.secondary.label} ID (선택)`}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none" />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                  {submitting ? "접수 중..." : "필요서류·비용 무료로 안내받기"}
                </button>
              </form>
              <p className="mt-3 text-[11px] text-gray-400">입력하신 정보는 상담 안내 목적으로만 사용됩니다.</p>
            </>
          ) : (
            <div className="mt-5">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <p className="mt-3 text-base font-bold text-gray-900">
                접수 완료 — {messengers.primary.label} 또는 {messengers.secondary.label}로 곧 보내드립니다
              </p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                입력하신 정보를 바탕으로 필요서류·예상 비용·일정을 정리해 메시지로 보내드립니다.
              </p>
              <Link href="/consultation?case=register-cosmetics"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                메시지 기다리지 않고 지금 상담하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
