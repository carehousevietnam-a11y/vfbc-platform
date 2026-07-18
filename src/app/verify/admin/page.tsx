"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Paperclip, AlertTriangle, Info } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import { getDiagnosis, getIncidentTypes, DiagnosisResult } from "@/lib/verifyDiagnosis";

const CATEGORY = "admin" as const;

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

// STEP3 진단 리포트 — diagnosis.report(11개 항목)가 있으면 이걸 우선 렌더링.
// report가 없는 경우(구버전 데이터 등)를 대비해 기존 headline/checklist/note
// 렌더링은 그대로 보존해 폴백으로 사용한다.
function DiagnosisReportSection({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { report } = diagnosis;

  if (!report) {
    // 기존(v2) 방식 폴백 — headline/checklist/note만 사용
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

      {/* 1. 사건 요약 */}
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold text-gray-700">사건 요약</p>
        <p className="mt-1.5 whitespace-pre-line text-xs text-gray-600 leading-relaxed">
          {report.incidentSummary}
        </p>
      </div>

      {/* 2. 주요 발견사항 */}
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

      {/* 3. AI 분석 의견 */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">VFBCAI 1차 검토 의견</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.analysisOpinion}</p>
      </div>

      {/* 4. 적용 가능성이 있는 법률 분야 */}
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

      {/* 5. 법률 적용 가능성 설명 */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">법률 적용 가능성 설명</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
          {report.legalApplicabilityNote}
        </p>
      </div>

      {/* 6. 최신 법령 확인 필요 여부 */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">최신 법령 확인 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.legalUpdateNotice}</p>
      </div>

      {/* 7. 실무 행정 관행 안내 */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-700">실무 행정 관행 안내</p>
        <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{report.practiceNotes}</p>
      </div>

      {/* 8. 위험요인 */}
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

      {/* 9. 권장 조치 */}
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

      {/* 10. 전문가 검토 권장 */}
      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed">
        {report.expertReviewRecommendation}
      </div>

      {/* 11. AI 한계 고지 */}
      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{report.aiLimitationNotice}</p>
    </>
  );
}

export default function VerifyAdminPage() {
  // STEP1(사건정보) → STEP2(기존 서류·개인정보) → STEP3(진단) → 완료
  const [step, setStep] = useState<"incident" | "form" | "diagnosis" | "completed">("incident");
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentError, setIncidentError] = useState<string | null>(null);

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

  const incidentTypes = getIncidentTypes(CATEGORY);

  function handleIncidentNext() {
    if (!incidentType) {
      setIncidentError("사건유형을 선택해주세요.");
      return;
    }
    if (incidentDescription.trim().length < 10) {
      setIncidentError("사건 설명을 10자 이상 입력해주세요.");
      return;
    }
    setIncidentError(null);
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
      const rawExt = file.name.split(".").pop() || "";
      const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `verify-admin/${newLeadId}.${safeExt}`;

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

    // 기존에 존재하던 crm_activities(verify_lead) meta 저장 로직에
    // incident_type / incident_description만 추가 (신규 로직 아님, 기존 저장 확장)
    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "verify_lead",
      tag: "VERIFY_ADMIN",
      meta: {
        incident_type: incidentType,
        incident_description: incidentDescription.trim(),
        ...(fileUrl ? { file_url: fileUrl, file_name: file?.name } : {}),
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
    setFileName(file?.name || null);
    setSubmitting(false);

    setDiagnosing(true);
    const diag = await getDiagnosis(CATEGORY, {
      fileUrl,
      fileName: file?.name || null,
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
        tag: "VERIFY_ADMIN",
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">행정문서 검토</h1>
        <p className="mt-1 text-sm text-gray-500">비자·거주증·노동허가 등 행정서류 사전 검토</p>

        {/* STEP1: 사건 정보 (사건유형 + 사건설명) */}
        {step === "incident" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <p className="mt-4 text-sm font-semibold text-gray-900">
              1. 어떤 종류의 사건·서류인가요?
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
              2. 무슨 일이 있었는지, 현재 가장 걱정되는 부분을 간단히 작성해주세요.
            </p>
            <textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="예: 계약서에 서명하기 전인데 보증금 반환 조항이 명확한지 확인하고 싶습니다."
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

        {/* STEP2: 기존 서류 첨부 + 개인정보 폼 (기존 그대로) */}
        {step === "form" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <FileText className="text-gray-900" size={28} />
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
              잘못 제출하면 반려·재접수
            </span>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              관공서 공문서는 문구 하나만 잘못 해석해도 반려되거나 처리
              기한을 놓쳐 불이익으로 이어질 수 있습니다. 서명하거나
              제출하기 전에 AI가 먼저 확인해드립니다. 서류 사진이나 PDF·
              워드 파일을 첨부하고 이름·연락처만 남기면 무료로 1차
              검토해드립니다.
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
            <button
              onClick={() => setStep("incident")}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 이전 단계로
            </button>
          </div>
        )}

        {/* STEP3: 진단 리포트 (report 11항목 우선, 없으면 기존 방식 폴백) */}
        {step === "diagnosis" && diagnosis && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-900">
              VFBCAI 1차 검토 결과
            </span>

            <DiagnosisReportSection diagnosis={diagnosis} />

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
