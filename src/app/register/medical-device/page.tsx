"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

// 베트남 공공서비스포털 (Cổng Dịch vụ công quốc gia).
// 의료기기 수입·유통허가는 보건부(Bộ Y tế) 소관으로, 이 포털에서 관할 부서를
// 선택해 안내를 받도록 연결한다. (특정 부서 URL을 직접 지정하지 않음)
// ⚠️ 배포 전 Linda 법률 검토 필요 — URL·안내 문구 확인 후 게시할 것.
const REGISTER_MEDICAL_DEVICE_OFFICIAL_URL = "https://dichvucong.gov.vn/";

type RegistrationStatus = "confirmed" | "unconfirmed" | null;
type FacilityStatus = "secured" | "unsecured" | null;
type QualityDocStatus = "ready" | "not_ready" | null;
type MedicalDeviceChoice = "not_started" | "distributing_licensed" | "distributing_unlicensed" | null;
type ResultTone = "possible" | "conditional" | null;

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

function ScoreGauge({ score, tone }: { score: number; tone: "possible" | "conditional" }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = tone === "possible" ? "#059669" : "#d97706";

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[15px] font-bold"
        style={{ color }}
      >
        {score}%
      </div>
    </div>
  );
}

// 자체 진단 로직 (checkDiagnosis.ts 미사용, 규칙 기반) — 등록상태·보관유통시설
// 확보 여부로 점수를 계산하고, 품질서류 준비상태는 체크리스트 항목으로만
// 반영한다. 법 조항·구체적 허가가능 여부는 단정하지 않고 "가능성" 톤을
// 유지한다.
type MedicalDeviceDiagnosis = {
  feasibilityScore: number;
  resultTone: "possible" | "conditional";
  checklist: { label: string; passed: boolean }[];
  note: string;
  estimatedDays: { min: number; max: number };
};

function computeMedicalDeviceDiagnosis(
  registrationStatus: RegistrationStatus,
  facilityStatus: FacilityStatus,
  qualityDocStatus: QualityDocStatus
): MedicalDeviceDiagnosis {
  const checklist = [
    { label: "사업자·법인(수입/유통업자) 등록 서류 준비", passed: registrationStatus === "confirmed" },
    { label: "보관·유통시설(창고) 확보", passed: facilityStatus === "secured" },
    { label: "제품 분류·품질서류 준비", passed: qualityDocStatus === "ready" },
  ];
  const passedCount = checklist.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checklist.length) * 100);
  const tone: "possible" | "conditional" =
    registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";
  const note =
    tone === "possible"
      ? "현재 입력 기준으로는 신청을 진행하실 수 있는 상태에 가깝습니다. 정확한 진행 가능 여부는 서류 검토 후 확정됩니다."
      : "일부 준비가 더 필요할 수 있습니다. 준비 서류를 보완하면 진행할 수 있는 경우가 많습니다.";
  return {
    feasibilityScore: score,
    resultTone: tone,
    checklist,
    note,
    estimatedDays: { min: 30, max: 60 },
  };
}

function DiagnosisReportCard({ diagnosis }: { diagnosis: MedicalDeviceDiagnosis }) {
  const { feasibilityScore, resultTone, estimatedDays, checklist, note } = diagnosis;
  const tone = resultTone;
  const toneLabel = tone === "possible" ? "가능" : "조건부 가능";
  const issueCount = checklist.filter((c) => !c.passed).length;
  const boxBg = tone === "possible" ? "bg-emerald-50" : "bg-amber-50";
  const boxText = tone === "possible" ? "text-emerald-800" : "text-amber-800";
  const badgeBg = tone === "possible" ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = tone === "possible" ? "text-emerald-700" : "text-amber-700";

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-center gap-3.5">
        <ScoreGauge score={feasibilityScore} tone={tone} />
        <div>
          <p className="text-sm font-bold text-gray-900">{toneLabel}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {issueCount > 0 ? `준비 필요한 항목 ${issueCount}건` : "준비 완료된 항목뿐입니다"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-xs ${item.passed ? "text-gray-700" : boxText}`}
          >
            <span
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                item.passed ? "bg-emerald-100 text-emerald-700" : `${badgeBg} ${badgeText}`
              }`}
            >
              {item.passed ? "✓" : "!"}
            </span>
            {item.label}
          </div>
        ))}
      </div>

      {/* STEP10-4: 추천 분야 — AI가 분석한 분야를 고객에게 표시 */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
        추천 분야: 인허가
      </div>

      {estimatedDays && (
        <div className="mt-4 rounded-xl bg-white px-4 py-2.5 text-xs text-gray-600">
          예상 처리기간{" "}
          <span className="font-bold text-gray-900">
            {estimatedDays.min}~{estimatedDays.max}일
          </span>
        </div>
      )}

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>{note}</div>
    </div>
  );
}

export default function RegisterMedicalDevicePage() {
  const [medicalDeviceChoice, setMedicalDeviceChoice] = useState<MedicalDeviceChoice>(null);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [facilityStatus, setFacilityStatus] = useState<FacilityStatus>(null);
  const [qualityDocStatus, setQualityDocStatus] = useState<QualityDocStatus>(null);

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
  const [detailStage, setDetailStage] = useState(false);

  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const selfNotifySentRef = useRef(false);

  const messengers = MESSENGERS_KO;

  const isUnlicensedDistributing = medicalDeviceChoice === "distributing_unlicensed";

  const result: ResultTone =
    registrationStatus && facilityStatus
      ? registrationStatus === "confirmed" && facilityStatus === "secured"
        ? "possible"
        : "conditional"
      : null;
  const showResult = Boolean(
    medicalDeviceChoice && !isUnlicensedDistributing && registrationStatus && facilityStatus && qualityDocStatus
  );

  // 순수 함수 기반 자체 진단이라 비동기 조회가 필요 없으므로, useEffect 없이
  // 렌더링 중 직접 계산한다.
  const diagnosis = showResult
    ? computeMedicalDeviceDiagnosis(registrationStatus, facilityStatus, qualityDocStatus)
    : null;

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — company/restaurant/cosmetics/franchise/
  // environment/fire-safety/hygiene page.tsx와 동일한 패턴
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "register_medical-device",
        source_page: "/register/medical-device",
        reason: null,
      })
      .then(({ error }) => {
        if (error) {
          console.error("previous_rejections insert failed:", error);
          return;
        }
        rejectionRecordIdRef.current = id;
      });
  }

  async function finalizeRejectionStep() {
    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    const id = rejectionRecordIdRef.current;
    if (id && rejectionReason.trim()) {
      const { error } = await supabase
        .from("previous_rejections")
        .update({ reason: rejectionReason.trim() })
        .eq("id", id);
      if (error) console.error("previous_rejections reason update failed:", error);
    }
    setRejectionStepDone(true);
  }

  function handleSelfPortalClick() {
    if (!leadId || selfNotifySentRef.current) return;
    selfNotifySentRef.current = true;
    fetch("/api/agency-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, type: "self" }),
    }).catch((err) => {
      console.error("self-notify email trigger failed:", err);
    });
  }

  function reset() {
    setMedicalDeviceChoice(null);
    setRegistrationStatus(null);
    setFacilityStatus(null);
    setQualityDocStatus(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setLeadError(null);
    setEmailProvided(false);
    setConsentOpen(false);
    setConsentHighlight(false);
    setAgencyRequested(false);
    setAgencySaving(false);
    setAgencyError(null);
    setDetailStage(false);
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
    selfNotifySentRef.current = false;
  }

  async function handleAgencyRequest() {
    if (!leadId) return;
    setAgencySaving(true);
    setAgencyError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: leadId,
        action: "agency_upgrade_request",
        tag: "REGISTER_MEDICAL_DEVICE",
      });
      if (error) throw error;

      try {
        await fetch("/api/agency-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
      } catch (emailErr) {
        console.error("agency-confirm email trigger failed:", emailErr);
      }

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

    const newLeadId = crypto.randomUUID();
    const name = String(fd.get("name") || "");
    const phone = String(fd.get("phone") || "");
    const address = String(fd.get("address") || "");
    const email = (fd.get("email") as string) || "";
    const kakaoId = (fd.get("kakao_id") as string) || null;
    const zaloId = (fd.get("zalo_id") as string) || null;

    const { error } = await supabase.from("leads").insert({
      id: newLeadId,
      name,
      phone,
      address,
      email: email || null,
      kakao_id: kakaoId,
      zalo_id: zaloId,
      service_type: "register_medical-device",
      result,
      source_page: "/register/medical-device",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "register_medical-device_diagnosis_lead",
      tag: "REGISTER_MEDICAL_DEVICE",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.feasibilityScore,
            medicalDeviceChoice,
            registrationStatus,
            facilityStatus,
            qualityDocStatus,
            previousRejection:
              previousRejection === true
                ? { rejected: true, reason: rejectionReason || null }
                : previousRejection === false
                ? { rejected: false }
                : null,
          }
        : null,
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

    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    if (rejectionRecordIdRef.current) {
      try {
        await supabase
          .from("previous_rejections")
          .update({ linked_lead_id: newLeadId })
          .eq("id", rejectionRecordIdRef.current);
      } catch (linkErr) {
        console.error("previous_rejections link failed:", linkErr);
      }
    }

    saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
    setEmailProvided(!!email);
    setLeadId(newLeadId);
    setSubmitting(false);
    setLeadSubmitted(true);
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          의료기기허가 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          현재 유통·등록 상태에 따라 필요서류가 달라집니다.
        </p>

        {/* 1. previous_rejections 확인 */}
        {!rejectionStepDone && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              1. 이전에 다른 곳(정부기관 또는 타 대행사)에서 의료기기허가(수입·
              유통허가)를 신청하셨다가 거절·반려되신 적이 있나요?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPreviousRejection(true);
                  recordRejectionAnonymously();
                }}
                className={`rounded-2xl border p-4 text-sm font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${
                  previousRejection === true
                    ? "border-amber-600 bg-amber-50 text-amber-800"
                    : "border-gray-100 bg-white text-gray-900 hover:-translate-y-0.5"
                }`}
              >
                네, 있습니다
              </button>
              <button
                onClick={() => {
                  setPreviousRejection(false);
                  setRejectionStepDone(true);
                }}
                className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
              >
                아니요
              </button>
            </div>
            {previousRejection === true && (
              <div className="mt-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="(선택) 어떤 이유로 거절되셨는지 알려주시면 더 정확히 봐드릴 수 있습니다"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-amber-600 focus:outline-none resize-none"
                />
                <button
                  onClick={finalizeRejectionStep}
                  className="mt-3 w-full h-11 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. 단계별 질문 */}
        {rejectionStepDone && !medicalDeviceChoice && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              2. 현재 의료기기를 어떻게 유통하고 계신가요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-1">
              {[
                { key: "not_started", label: "아직 유통 전입니다", desc: "허가 신청을 준비하는 단계" },
                { key: "distributing_licensed", label: "허가를 받고 정상 유통 중입니다", desc: "" },
                { key: "distributing_unlicensed", label: "허가 없이 이미 유통 중입니다", desc: "" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMedicalDeviceChoice(opt.key as MedicalDeviceChoice)}
                  className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                >
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  {opt.desc && <p className="mt-1 text-xs text-gray-500">{opt.desc}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && isUnlicensedDistributing && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              무허가 유통은 형사처벌 대상이 될 수 있습니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              허가 없이 의료기기를 유통하는 경우 형사처벌을 포함한 중대한
              법적 불이익을 받을 수 있으며, 이후 정식 허가 신청에도 영향이
              있을 수 있습니다. 가능한 빨리 허가 절차를 진행하시길
              권합니다.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() => setMedicalDeviceChoice(null)}
                className="h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                다시 선택하기
              </button>
              <Link
                href="/consultation?case=register-medical-device-unlicensed-warning"
                className="flex h-12 items-center justify-center rounded-full border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {rejectionStepDone && medicalDeviceChoice && !isUnlicensedDistributing && !registrationStatus && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              3. 사업자·법인(수입/유통업자) 등록 서류가 준비되어 있나요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "confirmed", label: "준비되어 있음" },
                { key: "unconfirmed", label: "아직 미확정" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRegistrationStatus(opt.key as RegistrationStatus)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && registrationStatus && !facilityStatus && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              4. 보관·유통시설(창고)을 확보하셨나요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "secured", label: "확보 완료" },
                { key: "unsecured", label: "아직 미확보" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFacilityStatus(opt.key as FacilityStatus)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && registrationStatus && facilityStatus && !qualityDocStatus && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              5. 제품 분류·품질서류(등록증·품질경영시스템 등)를 준비하셨나요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "ready", label: "예, 준비했습니다" },
                { key: "not_ready", label: "아직입니다" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setQualityDocStatus(opt.key as QualityDocStatus)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. 가능성 진단 결과 + 4. 개인정보 + 동의 */}
        {showResult && result === "possible" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              의료기기허가 진행이 가능합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 사업자등록·보관유통시설 준비 상태 기준으로 의료기기
              수입·유통허가 신청 요건을 충족합니다.
            </p>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              * 위 결과는 입력하신 조건을 기준으로 한 1차 자가진단입니다.
              정확한 진행 가능 여부는 서류 검토 후 전문가 상담을 통해
              확정됩니다.
            </p>
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              이름·연락처·주소만 남기시면 AI가 서류를 상세 분석한 리포트를
              바로 보여드립니다.
            </div>

            <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3">
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
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <button type="submit" disabled={submitting}
                className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                {submitting ? "접수 중..." : "AI 분석 리포트 무료로 받기"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-400">
              입력하신 정보는 상담 안내 목적으로만 사용됩니다.
            </p>
            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 5. AI 분석 리포트 + 6. 직접 진행 / 전문가 진행요청 선택 */}
        {showResult && result === "possible" && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              의료기기허가 · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">의료기기허가에 필요한 서류</p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 사업자등록증(수입/유통업자 등록증)
                  {registrationStatus === "unconfirmed" && (
                    <span className="ml-1 text-amber-700 font-semibold">(준비 필요)</span>
                  )}
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 보관·유통시설(창고) 계약서
                  {facilityStatus === "unsecured" && (
                    <span className="ml-1 text-amber-700 font-semibold">(준비 필요)</span>
                  )}
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 제품 분류·기술문서
                  {qualityDocStatus === "not_ready" && (
                    <span className="ml-1 text-amber-700 font-semibold">(준비 필요)</span>
                  )}
                </li>
                <li className="text-xs text-gray-600 pl-1">
                  · 품질경영시스템 관련 서류
                  {qualityDocStatus === "not_ready" && (
                    <span className="ml-1 text-amber-700 font-semibold">(준비 필요)</span>
                  )}
                </li>
              </ul>
              <p className="mt-2 text-[11px] text-gray-400">
                정확한 요건은 기기 등급·품목에 따라 다를 수 있어 담당자
                확인이 필요합니다.
              </p>
            </div>

            <p className="mt-5 text-xs font-semibold text-gray-700">
              위 내용, 어떻게 진행하시겠어요?
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <a
                href={REGISTER_MEDICAL_DEVICE_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSelfPortalClick}
                className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-amber-600 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                내가 직접 신청할게요 (공공서비스포털 연결) <ExternalLink size={14} />
              </a>
              <button
                onClick={() => setDetailStage(true)}
                className="h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                전문가에게 맡길게요 (전문가 진행요청)
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              어느 쪽을 선택해도 서류 체크리스트는 동일하게 제공됩니다
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              공공서비스포털(Cổng Dịch vụ công quốc gia)로 이동합니다.
              접속 후 관할 부서(보건부 소관)를 선택하시면 신청 메뉴를
              찾으실 수 있습니다.
            </p>

            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {/* 7. 진행 서류 및 절차 안내 (전문가 진행요청 선택 시) */}
        {showResult && result === "possible" && leadSubmitted && !agencyRequested && detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">의료기기허가 진행 서류 및 절차</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">① 서류 준비</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-xs text-gray-600 pl-1">
                    · 사업자등록증(수입/유통업자 등록증) 사본
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 제조사(해외 제조 시) 위임장
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 제품 기술문서 및 카탈로그
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">② 시설·품질서류 준비</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-xs text-gray-600 pl-1">
                    · 보관·유통시설(창고) 확인
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 품질경영시스템·제품 분류 서류 작성
                  </li>
                  {qualityDocStatus === "not_ready" && (
                    <li className="text-xs text-gray-600 pl-1">
                      · 품질서류가 아직 준비되지 않아, 자료 보완 후
                      재검토가 필요할 수 있습니다 — 이 부분은 전문가 진행요청 접수 시
                      담당자가 우선 확인해드립니다.
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">③ 신청 절차 요약</p>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  서류 준비 → 보관·유통시설 확정 → 의료기기 수입·유통허가
                  신청·접수 → 심사 → 허가증 발급 → 유통 개시
                </p>
                <p className="mt-2 text-[11px] text-gray-400">
                  * 위 절차는 일반적인 흐름 안내이며, 기기 등급·품목에
                  따라 순서나 요건이 달라질 수 있습니다.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm font-bold text-gray-900">
              정확하고 문제없이 빠르게 진행하시길 원한다면 반드시 전문가와
              상의하세요.
            </p>

            {agencyError && <p className="mt-3 text-xs text-red-600">{agencyError}</p>}
            <p className="mb-2 text-xs text-gray-500 leading-relaxed">
              직접 진행이 어려운 경우 전문가에게 진행을 요청할 수 있습니다.
            </p>
            <button
              onClick={handleAgencyRequest}
              disabled={agencySaving}
              className="mt-4 w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors"
            >
              {agencySaving ? "접수 중..." : "전문가 진행요청하기 →"}
            </button>
            <p className="mt-2 text-[11px] text-gray-400">
              이미 입력하신 정보로 바로 접수되며, 다시 입력하실 필요 없습니다.
            </p>

            <button
              onClick={() => setDetailStage(false)}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              ← 간단 목록으로 돌아가기
            </button>
          </div>
        )}

        {showResult && result === "possible" && agencyRequested && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex justify-center">
              <img src="/vfbc-seal.png" alt="VFBCAI 접수완료 확인 도장" width={160} height={160} />
            </div>
            <p className="mt-1 text-[10px] text-gray-400 text-center italic">
              Vietnam Foreign Business Verification &amp; Compliance AI Center
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900 text-center">
              전문가 진행요청이 접수되었습니다
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
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
              거주증·노동허가·비자 등 만료 알림 서비스도 함께 이용하실 수
              있습니다.
            </div>

            <button onClick={reset} className="mt-6 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "conditional" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-amber-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">보완이 필요할 수 있습니다</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 사업자등록 또는 보관유통시설 준비 상태만으로는 의료기기
              허가 신청이 자동으로 진행되지 않습니다. 준비 서류를 보완하면
              진행할 수 있는 경우가 많습니다.
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              이름·연락처·주소만 남기시면 AI가 어떤 부분이 문제인지 분석한
              리포트를 바로 보여드립니다.
            </div>

            <form onSubmit={handleLeadSubmit} className="mt-5 space-y-3">
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
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <button type="submit" disabled={submitting}
                className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                {submitting ? "접수 중..." : "AI 분석 리포트 무료로 받기"}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-gray-400">
              입력하신 정보는 상담 안내 목적으로만 사용됩니다.
            </p>
            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "conditional" && leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              의료기기허가 · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <p className="mt-4 text-sm font-bold text-gray-900">
              {messengers.primary.label} 또는 {messengers.secondary.label}로
              곧 상세 안내를 보내드립니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              위 리포트를 바탕으로 전문가가 검토한 뒤, 보완 가능 여부와
              필요서류를 메시지로 정리해드립니다.
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              {emailProvided
                ? "메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요."
                : "메시지가 오지 않으면 알려주세요 — 담당자가 직접 확인 후 연락드립니다."}
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
              입력하신 전화번호로 계정이 생성되었습니다. 비밀번호는 자동
              생성되며, 마이페이지에서 언제든 변경하실 수 있습니다.
              거주증·노동허가·비자 등 만료 알림 서비스도 함께 이용하실 수
              있습니다.
            </div>

            <Link
              href="/consultation?case=register-medical-device-conditional"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-600 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              메시지 기다리지 않고 지금 상담하기
            </Link>
            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
