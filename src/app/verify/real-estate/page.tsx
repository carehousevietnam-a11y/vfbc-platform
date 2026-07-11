"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, CheckCircle2, Paperclip, AlertTriangle, Info } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getDiagnosis, DiagnosisResult } from "@/lib/verifyDiagnosis";

const CATEGORY = "real-estate" as const;

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
          서비스 이용(검토 결과 확인, 상담 등)을 진행할 수 없습니다.
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
              địa chỉ, email (nếu có), ID Kakao/Zalo (nếu có), tài liệu đính
              kèm (nếu có), nhằm mục đích tư vấn, kiểm tra tài liệu và tạo tài
              khoản dịch vụ tự động. Dữ liệu được lưu trữ đến khi bạn hủy tài
              khoản hoặc đạt được mục đích xử lý. Bạn có quyền từ chối đồng
              ý; tuy nhiên, việc từ chối có thể khiến bạn không thể sử dụng
              một số dịch vụ (xem kết quả kiểm tra, tư vấn, v.v.).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">🇰🇷 대한민국</p>
            <p>
              개인정보보호법에 근거하여 아래와 같이 개인정보 수집·이용에
              대해 안내드리며, 동의를 받습니다.
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-0.5">
              <li>수집 항목: 이름, 전화번호, 주소, (선택) 이메일, (선택) 카카오톡/잘로 ID, (선택) 첨부 서류</li>
              <li>수집 목적: 서류 검토·상담 안내 및 서비스 이용을 위한 계정 자동 생성</li>
              <li>보유 기간: 회원 탈퇴 시 또는 목적 달성 시까지</li>
              <li>
                동의를 거부하실 수 있으나, 거부 시 계정 생성이 불가하여 검토
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

function levelIcon(level: "info" | "warning" | "critical") {
  if (level === "critical") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-600" />;
  if (level === "warning") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />;
  return <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />;
}

export default function VerifyRealEstatePage() {
  const [step, setStep] = useState<"form" | "diagnosis" | "completed">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [expertRequesting, setExpertRequesting] = useState(false);
  const [expertError, setExpertError] = useState<string | null>(null);
  const messengers = MESSENGERS_KO;

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
    const file = fd.get("document") as File | null;
    const newLeadId = crypto.randomUUID();

    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error: err } = await supabase.from("leads").insert({
      id: newLeadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "verify_real-estate",
      result: null,
      source_page: "/verify/real-estate",
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    let fileUrl: string | null = null;
    if (file && file.size > 0) {
      const rawExt = file.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `verify-real-estate/${newLeadId}.${safeExt}`;

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
      lead_id: newLeadId,
      action: "verify_lead",
      tag: "VERIFY_REAL_ESTATE",
      meta: fileUrl ? { file_url: fileUrl, file_name: file?.name } : null,
    });

    try {
      const res = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: newLeadId, name, phone, email, address }),
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
    setLeadId(newLeadId);
    setFileName(file?.name || null);
    setSubmitting(false);

    setDiagnosing(true);
    const diag = await getDiagnosis(CATEGORY, { fileUrl, fileName: file?.name || null });
    setDiagnosis(diag);
    setDiagnosing(false);
    setStep("diagnosis");
  }

  async function handleExpertRequest() {
    if (!leadId) return;
    setExpertRequesting(true);
    setExpertError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "expert_review_request",
        tag: "VERIFY_REAL_ESTATE",
        meta: diagnosis ? { expert_brief: diagnosis.expertBrief } : null,
      });
      if (error) throw error;
      setStep("completed");
    } catch {
      setExpertError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setExpertRequesting(false);
    }
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">부동산 문서 검토</h1>
        <p className="mt-1 text-sm text-gray-500">임대계약서·매매계약서 리스크 검토</p>

        {step === "form" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Home className="text-gray-900" size={28} />
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
              보증금 미반환 주의
            </span>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              임대·매매 계약서에는 보증금 미반환 조항이나 불리한 특약이
              생각보다 자주 숨어 있습니다. 계약서에 서명하기 전, 지금
              확인해보세요. 서류 사진이나 PDF·워드 파일을 첨부하고
              이름·연락처만 남기면 무료로 1차 검토해드립니다.
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
              <button type="submit" disabled={submitting || diagnosing}
                className="w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {submitting || diagnosing ? "AI가 확인하는 중..." : "무료로 검토받기"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-400">
              서류가 없어도 접수 가능하며, 나중에 카카오톡/잘로로 보내주셔도 됩니다.
            </p>
          </div>
        )}

        {step === "diagnosis" && diagnosis && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-900">
              VFBC AI 사전진단
            </span>
            <p className="mt-3 text-lg font-bold text-gray-900">{diagnosis.headline}</p>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              입력하신 정보와 등록된 법령·행정자료를 기준으로 첨부하신 서류를
              1차 분석한 결과입니다.
            </p>

            <ul className="mt-4 space-y-2.5">
              {diagnosis.checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
                  {levelIcon(item.level)}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
              {diagnosis.note}
            </p>

            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed">
              간단한 내용은 무료 1차 상담으로도 확인 가능합니다. 위 항목
              중 우려되는 부분이 있거나 서류가 복잡하다면, 전문가가 직접
              서류를 검토해드립니다.
            </div>

            {expertError && <p className="mt-3 text-xs text-red-600">{expertError}</p>}
            <button
              onClick={handleExpertRequest}
              disabled={expertRequesting}
              className="mt-4 w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {expertRequesting ? "접수 중..." : "전문가 검토 요청하기 →"}
            </button>
            <p className="mt-2 text-[11px] text-gray-400">
              이미 입력하신 정보로 바로 접수되며, 다시 입력하실 필요 없습니다.
            </p>
          </div>
        )}

        {step === "completed" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={24} />
            <p className="mt-3 text-base font-bold text-gray-900">
              전문가 검토 요청이 접수되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              전문가가 첨부하신 서류와 AI 사전진단 내용을 함께 확인한 뒤,
              가입하신 이메일 또는 {messengers.primary.label}/{messengers.secondary.label}로
              결과를 안내드립니다.
            </p>
            {emailProvided && (
              <p className="mt-2 text-[11px] text-gray-400">
                메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요.
              </p>
            )}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는
              자동 생성되며, 마이페이지에서 언제든 변경하실 수
              있습니다.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
