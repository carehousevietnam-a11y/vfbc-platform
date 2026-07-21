"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle2, Paperclip, AlertTriangle, Info, ExternalLink, FileText } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getDiagnosis, getIncidentTypes, DiagnosisResult } from "@/lib/verifyDiagnosis";

const CATEGORY = "tax" as const;

const CONSENT_SUMMARY =
  "입력하신 정보로 계정이 자동 생성되며, 개인정보 수집·이용에 동의합니다.";

// "직접 검토 진행하기" 하위 선택지 — tax 카테고리 전용.
const AGENCY_OPTIONS = ["세무기관", "관세기관", "회계·신고 관련", "기타"] as const;

type Agency = (typeof AGENCY_OPTIONS)[number];

type AgencyGuidance = {
  authority: string;
  officialSite: { label: string; url: string };
  submissionSteps: string[];
  requiredDocuments: string[];
  cautions: string[];
};

const AGENCY_GUIDANCE: Record<Agency, AgencyGuidance> = {
  "세무기관": {
    authority: "세금 고지·신고 관련 사항은 관할 세무서가 담당합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관할 세무서 확인",
      "고지서·신고서 내용 확인",
      "필요 서류 준비 후 제출 또는 온라인 신고",
      "납부 또는 이의신청 기한 확인",
    ],
    requiredDocuments: [
      "사업자등록증 사본 (해당 시)",
      "세금 고지서 원본",
      "관련 증빙 자료",
    ],
    cautions: [
      "납부 기한을 넘기면 가산세가 부과될 수 있습니다.",
      "사업자번호·명의가 정확히 일치하는지 확인이 필요합니다.",
      "관할 세무서는 사업장 소재지에 따라 달라집니다.",
    ],
  },
  "관세기관": {
    authority: "수출입 관련 세금·통관 사항은 관할 관세청이 담당합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관할 세관 확인",
      "통관·관세 관련 서류 준비",
      "신고서 제출",
      "관세 납부 및 통관 완료 확인",
    ],
    requiredDocuments: [
      "수출입 신고서",
      "송장·계약서 사본",
      "관세 고지서 (해당 시)",
    ],
    cautions: [
      "통관 지연 시 추가 비용이 발생할 수 있습니다.",
      "품목 분류에 따라 관세율이 달라질 수 있습니다.",
      "서류 불일치는 통관 거부로 이어질 수 있습니다.",
    ],
  },
  "회계·신고 관련": {
    authority: "장부 작성, 세무신고 대행 등은 공인 회계사무소 또는 세무대리인이 관련될 수 있습니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "회계·세무대리인 자격 확인",
      "관련 장부 및 자료 준비",
      "신고 대행 계약 또는 검토 의뢰",
      "신고 완료 확인",
    ],
    requiredDocuments: [
      "회계장부 또는 관련 자료",
      "사업자등록증 사본",
      "기존 신고 이력 자료 (해당 시)",
    ],
    cautions: [
      "세무대리인의 자격 및 신뢰도를 사전에 확인하세요.",
      "신고 오류는 추후 가산세로 이어질 수 있습니다.",
      "정기적인 장부 관리가 세무 리스크를 줄입니다.",
    ],
  },
  "기타": {
    authority: "위 항목에 해당하지 않는 경우, 고지서 또는 관련 서류에 명시된 기관명으로 관할처를 확인하는 것이 가장 정확합니다.",
    officialSite: { label: "베트남 국가 공공서비스포털", url: "https://dichvucong.gov.vn" },
    submissionSteps: [
      "관련 서류에 명시된 발급·관할 기관 확인",
      "포털 또는 창구에서 안내하는 절차 확인",
      "요구되는 첨부서류 준비 및 제출",
      "접수증 또는 처리 예정일 확인",
    ],
    requiredDocuments: [
      "관련 고지서·신고서 사본",
      "사업자등록증 사본 (해당 시)",
      "서류 종류별로 요구되는 추가 증빙 (기관 안내 확인 필요)",
    ],
    cautions: [
      "제출·납부 기한이 있는 서류는 기한을 넘기면 불이익이 발생할 수 있습니다.",
      "사업자번호·명의가 실제 서류와 정확히 일치하는지 확인하세요.",
      "관할기관 및 절차는 지역·사안에 따라 달라질 수 있어, 정확한 확인은 해당 기관에 직접 문의하시기 바랍니다.",
    ],
  },
};

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

function levelIcon(level: "info" | "warning" | "critical") {
  if (level === "critical") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-600" />;
  if (level === "warning") return <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />;
  return <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />;
}

function riskFactorBadgeClass(level: "critical" | "high" | "caution") {
  if (level === "critical") return "bg-red-50 text-red-700 border border-red-100";
  if (level === "high") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-gray-50 text-gray-600 border border-gray-100";
}

function riskFactorLabel(level: "critical" | "high" | "caution") {
  if (level === "critical") return "치명적 위험";
  if (level === "high") return "높은 위험";
  return "주의";
}

function DiagnosisReportSection({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { report } = diagnosis;

  if (!report) {
    return (
      <>
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
        <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{diagnosis.note}</p>
      </>
    );
  }

  return (
    <>
      <p className="mt-3 text-lg font-bold text-gray-900">{diagnosis.headline}</p>

      {/* STEP10-4: 추천 분야 — AI가 분석한 분야를 고객에게 표시 (legalAreas와 별개, 법률 검토 대상 아님) */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
        추천 분야: 세무
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold text-gray-700">사건 요약</p>
        <p className="mt-1.5 whitespace-pre-line text-xs text-gray-600 leading-relaxed">
          {report.incidentSummary}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">주요 발견사항</p>
        <ul className="mt-2 space-y-2.5">
          {report.keyFindings.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
              {levelIcon(item.level)}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">VFBCAI 1차 검토 의견</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.analysisOpinion}</p>
      </div>

      {report.legalAreas.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">적용 가능성이 있는 법률 분야</p>
          <ul className="mt-2 space-y-1.5">
            {report.legalAreas.map((la) => (
              <li key={la.area} className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">{la.area}</span> — {la.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">법률 적용 가능성 설명</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
          {report.legalApplicabilityNote}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">최신 법령 확인 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.legalUpdateNotice}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">실무 행정 관행 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.practiceNotes}</p>
      </div>

      {report.riskFactors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">위험요인</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.riskFactors.map((rf, idx) => (
              <span
                key={`${rf.label}-${idx}`}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riskFactorBadgeClass(rf.level)}`}
              >
                [{riskFactorLabel(rf.level)}] {rf.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.recommendedActions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700">권장 조치</p>
          <ol className="mt-2 space-y-1.5">
            {report.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                {idx + 1}순위 {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed">
        {report.expertReviewRecommendation}
      </div>

      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{report.aiLimitationNotice}</p>
    </>
  );
}

const PREVIOUS_REVIEW_OPTIONS = [
  "처음 검토합니다",
  "검토받았지만 해결되지 않았습니다",
  "반려·보완 요청을 받았습니다",
  "잘 모르겠습니다",
] as const;

export default function VerifyTaxPage() {
  const [step, setStep] = useState<
    "incident" | "attachment" | "form" | "diagnosis" | "guidanceSelect" | "guidance" | "completed"
  >("incident");
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [previousReviewStatus, setPreviousReviewStatus] = useState<string | null>(null);
  const [previousReviewError, setPreviousReviewError] = useState<string | null>(null);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [expertRequesting, setExpertRequesting] = useState(false);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const messengers = MESSENGERS_KO;

  const incidentTypes = getIncidentTypes(CATEGORY);

  function handleIncidentNext() {
    if (!previousReviewStatus) {
      setPreviousReviewError("이전 상담·검토 이력 여부를 선택해주세요.");
      return;
    }
    setPreviousReviewError(null);
    if (!incidentType) {
      setIncidentError("사건유형을 선택해주세요.");
      return;
    }
    if (incidentDescription.trim().length === 0) {
      setIncidentError("사건 설명을 입력해주세요.");
      return;
    }
    setIncidentError(null);
    setStep("attachment");
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
      service_type: "verify_tax",
      result: null,
      source_page: "/verify/tax",
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    let fileUrl: string | null = null;
    if (attachedFile && attachedFile.size > 0) {
      const rawExt = attachedFile.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `verify-tax/${newLeadId}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, attachedFile);
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
      tag: "VERIFY_TAX",
      meta: {
        incident_type: incidentType,
        incident_description: incidentDescription.trim(),
        previous_review_status: previousReviewStatus,
        ...(fileUrl ? { file_url: fileUrl, file_name: attachedFile?.name } : {}),
      },
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
    setSubmitting(false);

    setDiagnosing(true);
    const diag = await getDiagnosis(CATEGORY, {
      fileUrl,
      fileName: attachedFile?.name || null,
      incidentType: incidentType || undefined,
      incidentDescription: incidentDescription.trim() || undefined,
    });
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
        tag: "VERIFY_TAX",
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

  const activeGuidance = selectedAgency ? AGENCY_GUIDANCE[selectedAgency] : null;

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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">세무문서 검토</h1>
        <p className="mt-1 text-sm text-gray-500">세무 통지서·신고서류 검토</p>

        {step === "incident" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />

            <p className="text-sm font-semibold text-gray-900">
              1. 이전에 다른 곳에서 검토받은 적이 있나요?
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PREVIOUS_REVIEW_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPreviousReviewStatus(opt)}
                  className={`flex h-14 items-center justify-center rounded-2xl border px-3 text-center text-xs font-semibold leading-snug transition-all ${
                    previousReviewStatus === opt
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-100 bg-white text-gray-900 hover:-translate-y-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {previousReviewError && (
              <p className="mt-2 text-xs text-red-600">{previousReviewError}</p>
            )}

            <p className="mt-6 text-sm font-semibold text-gray-900">
              2. 어떤 종류의 사건·서류인가요?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {incidentTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIncidentType(t)}
                  className={`rounded-2xl border p-3 text-xs font-semibold transition-all ${
                    incidentType === t
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-100 bg-white text-gray-900 hover:-translate-y-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-semibold text-gray-900">
              3. 무슨 일이 있었는지, 현재 가장 걱정되는 부분을 간단히 작성해주세요.
            </p>
            <textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="예: 세금 고지서를 받았는데 금액과 근거가 맞는지, 기한 내 대응 방법을 확인하고 싶습니다."
              rows={5}
              className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none resize-none"
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              입력하신 내용은 전문가 검토 시 참고 정보로만 사용되며, 여기서 자동으로
              분석·판단되지 않습니다.
            </p>

            {incidentError && <p className="mt-3 text-xs text-red-600">{incidentError}</p>}

            <button
              onClick={handleIncidentNext}
              className="mt-5 w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              다음
            </button>
          </div>
        )}

        {step === "attachment" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Paperclip className="text-gray-900" size={28} />
            <p className="mt-4 text-sm font-semibold text-gray-900">
              3. 관련 서류가 있다면 첨부해주세요
            </p>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              서류 사진이나 PDF·워드 파일을 첨부하시면 더 정확한 확인이 가능합니다.
            </p>

            <label className="mt-4 flex items-center gap-2 h-11 rounded-lg border border-dashed border-gray-300 px-4 text-sm text-gray-500 cursor-pointer hover:border-gray-900 transition-colors">
              <Paperclip size={16} className="shrink-0" />
              <span className="truncate">
                {fileName || "서류 첨부 (사진 · PDF · Word)"}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setAttachedFile(f);
                  setFileName(f?.name || null);
                }}
              />
            </label>
            <p className="mt-1.5 text-[11px] text-gray-400">
              서류가 없어도 다음 단계로 진행할 수 있으며, 나중에 카카오톡/잘로로
              보내주셔도 됩니다.
            </p>

            <button
              onClick={() => setStep("form")}
              className="mt-5 w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              다음
            </button>
            <button
              onClick={() => setStep("incident")}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 이전 단계로
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Receipt className="text-gray-900" size={28} />
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
              계좌동결 위험
            </span>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              세금 고지서·신고서는 대응 시기를 놓치면 가산세가 붙거나
              계좌가 동결될 수 있습니다. 받으신 문서, 이름·연락처만
              남기면 무료로 1차 검토해드립니다.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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
                {submitting || diagnosing ? "AI가 확인하는 중..." : "AI 분석 리포트 무료로 받기"}
              </button>
            </form>
            <button
              onClick={() => setStep("attachment")}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 이전 단계로
            </button>
          </div>
        )}

        {step === "diagnosis" && diagnosis && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-900">
              VFBCAI 1차 검토 결과
            </span>

            <DiagnosisReportSection diagnosis={diagnosis} />

            <p className="mt-5 text-xs font-semibold text-gray-700">
              위 내용, 어떻게 진행하시겠어요?
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <button
                onClick={() => setStep("guidanceSelect")}
                className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-gray-900 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                직접 검토 진행하기
              </button>
              <button
                onClick={handleExpertRequest}
                disabled={expertRequesting}
                className="h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
              >
                {expertRequesting ? "접수 중..." : "전문가 검토 진행하기"}
              </button>
            </div>
            {expertError && <p className="mt-3 text-xs text-red-600">{expertError}</p>}
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              어느 쪽을 선택해도 이미 입력하신 정보로 바로 진행되며, 다시 입력하실 필요 없습니다.
            </p>
          </div>
        )}

        {step === "guidanceSelect" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              어떤 기관·경로와 관련된 사안인가요?
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              선택하신 항목에 맞는 관할기관·공식 확인 경로·절차 안내를 보여드립니다.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {AGENCY_OPTIONS.map((agency) => (
                <button
                  key={agency}
                  onClick={() => {
                    setSelectedAgency(agency);
                    setStep("guidance");
                  }}
                  className="rounded-2xl border border-gray-100 bg-white p-4 text-left text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all"
                >
                  {agency}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("diagnosis")}
              className="mt-6 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 검토 결과로 돌아가기
            </button>
          </div>
        )}

        {step === "guidance" && activeGuidance && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {selectedAgency}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              직접 진행을 위한 참고 안내
            </p>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              아래는 일반적인 참고 정보이며, VFBCAI가 실제 신청·제출을 대신
              처리하지는 않습니다. 정확한 절차는 관할기관에서 다시 확인해주세요.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">관할기관</p>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                  {activeGuidance.authority}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">공식 확인 경로</p>
                <a
                  href={activeGuidance.officialSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline"
                >
                  {activeGuidance.officialSite.label} <ExternalLink size={12} />
                </a>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">기본 절차</p>
                <ol className="mt-2 space-y-1.5">
                  {activeGuidance.submissionSteps.map((s, idx) => (
                    <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                      {idx + 1}. {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">일반 준비서류</p>
                <ul className="mt-2 space-y-1">
                  {activeGuidance.requiredDocuments.map((d, idx) => (
                    <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                      · {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-800">주의사항</p>
                <ul className="mt-1.5 space-y-1">
                  {activeGuidance.cautions.map((c, idx) => (
                    <li key={idx} className="text-xs text-amber-800 leading-relaxed">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold text-gray-700">
              직접 진행이 부담되신다면 전문가에게 맡기실 수도 있습니다.
            </p>
            <button
              onClick={handleExpertRequest}
              disabled={expertRequesting}
              className="mt-3 w-full h-12 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {expertRequesting ? "접수 중..." : "전문가 검토 진행하기"}
            </button>
            {expertError && <p className="mt-3 text-xs text-red-600">{expertError}</p>}

            <button
              onClick={() => setStep("guidanceSelect")}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 다른 기관 선택하기
            </button>
          </div>
        )}

        {step === "completed" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex justify-center">
              <img
                src="/vfbc-seal.png"
                alt="VFBCAI 접수완료 확인 도장"
                width={160}
                height={160}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400 text-center italic">
              Vietnam Foreign Business Verification &amp; Compliance AI Center
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900 text-center">
              전문가 검토 요청이 접수되었습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              전문가가 첨부하신 세무 서류와 AI 사전진단 내용을 함께 확인한 뒤,
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
