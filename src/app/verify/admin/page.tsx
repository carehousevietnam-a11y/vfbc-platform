"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Paperclip } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

export default function VerifyAdminPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const messengers = MESSENGERS_KO;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("document") as File | null;
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
      service_type: "verify_admin",
      result: null,
      source_page: "/verify/admin",
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    let fileUrl: string | null = null;
    if (file && file.size > 0) {
      // Storage 키는 영문/숫자만 허용 — 한글·공백·특수문자 파일명은 400 에러 발생
      // 확장자만 추출해서 안전한 키로 저장, 원본 파일명은 CRM meta에 별도 기록
      const rawExt = file.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `verify-admin/${leadId}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      } else {
        console.error(uploadError);
      }
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "verify_lead",
      tag: "VERIFY_ADMIN",
      meta: fileUrl ? { file_url: fileUrl, file_name: file?.name } : null,
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
          직접검토하기 · 베트남 법률전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">행정문서 검토</h1>
        <p className="mt-1 text-sm text-gray-500">비자·거주증·노동허가 등 행정서류 사전 검토</p>

        <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <FileText className="text-gray-900" size={28} />
          <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
            잘못 제출하면 반려·재접수
          </span>

          {!submitted ? (
            <>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                서류 사진이나 PDF·워드 파일을 첨부해주세요. 이름·연락처만
                남기면 AI가 무료로 1차 검토해드립니다.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <label className="flex items-center gap-2 h-11 rounded-lg border border-dashed border-gray-300 px-4 text-sm text-gray-500 cursor-pointer hover:border-gray-900 transition-colors">
                  <Paperclip size={16} className="shrink-0" />
                  <span className="truncate">
                    {fileName || "서류 첨부 (사진 · PDF · Word)"}
                  </span>
                  <input
                    type="file"
                    name="document"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                  />
                </label>
                <input type="text" name="name" required placeholder="이름"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                <input type="tel" name="phone" required placeholder="전화번호"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                <input type="text" name="address" required placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                <input type="email" name="email" placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="kakao_id" placeholder={`${messengers.primary.label} ID (선택)`}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                  <input type="text" name="zalo_id" placeholder={`${messengers.secondary.label} ID (선택)`}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none" />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
                  {submitting ? "접수 중..." : "무료로 검토받기"}
                </button>
              </form>
              <p className="mt-3 text-[11px] text-gray-400">
                서류가 없어도 접수 가능하며, 나중에 카카오톡/잘로로 보내주셔도 됩니다.
              </p>
            </>
          ) : (
            <div className="mt-5">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <p className="mt-3 text-base font-bold text-gray-900">
                접수 완료 — {messengers.primary.label} 또는 {messengers.secondary.label}로 곧 보내드립니다
              </p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {fileName
                  ? "첨부하신 서류를 AI가 검토 중입니다. 결과가 정리되는 대로 메시지로 보내드립니다."
                  : "서류를 아직 못 보내셨다면, 곧 안내드릴 메시지에 사진으로 보내주셔도 됩니다."}
              </p>
              {emailProvided && (
                <p className="mt-2 text-[11px] text-gray-400">
                  메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요.
                </p>
              )}
              <Link href="/consultation?case=verify-admin"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                메시지 기다리지 않고 지금 상담하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
