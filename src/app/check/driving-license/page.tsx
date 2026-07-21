"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  getCheckDiagnosis,
  computeLicenseResultTone,
  type DiagnosisResult,
  type LicenseTrc,
  type LicenseHasLicense,
} from "@/lib/checkDiagnosis";

// 운전면허 발급·전환 전국 통합 포털 (2025년 개편 이후 공안부 산하로 이관).
// 신청 과정에서 거주 지역(성/시)을 선택하면 관할 경찰서(CSGT)로 자동 연결됨.
const LICENSE_OFFICIAL_URL = "https://dvc-gplx.csgt.bocongan.gov.vn/";

type HasTrc = LicenseTrc;
type HasLicense = LicenseHasLicense;
type Result = "possible" | "conditional" | "impossible" | null;

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

// AI 진단 게이지 — 원형 진행률로 feasibilityScore를 표시
function ScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: "possible" | "conditional" | "impossible";
}) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color =
    tone === "possible" ? "#059669" : tone === "conditional" ? "#d97706" : "#dc2626";

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

// AI 진단 리포트 카드 — 가입 직후(2번째 화면)에만 노출. customerView만 사용, expertBrief는 여기서 절대 렌더링 안 함.
// STEP10-6: AI 판단 근거 — 새 AI 호출 없이 기존 진단 결과(점수/체크리스트/상태)만으로
// "왜 이렇게 판단했는지"를 2~3개의 짧은 문장으로 요약. DB/API/CRM 변경 없음.
function buildAiReasonBullets(
  feasibilityScore: number,
  resultTone: "possible" | "conditional" | "impossible",
  checklist: { label: string; passed: boolean }[],
  estimatedDays: { min: number; max: number } | null
): string[] {
  const toneLabel =
    resultTone === "possible" ? "가능" : resultTone === "conditional" ? "조건부 가능" : "어려움";
  const bullets: string[] = [
    `종합 판단 점수 ${feasibilityScore}%를 기준으로 '${toneLabel}' 단계로 분류했습니다.`,
  ];

  const failed = checklist.filter((c) => !c.passed);
  if (failed.length > 0) {
    const names = failed.slice(0, 2).map((c) => c.label).join(", ");
    bullets.push(
      failed.length > 2
        ? `${names} 등 ${failed.length}개 항목이 아직 충족되지 않아 점수에 반영됐습니다.`
        : `${names} 항목이 아직 충족되지 않아 점수에 반영됐습니다.`
    );
  } else {
    bullets.push("입력하신 체크리스트 항목을 모두 충족하여 감점 요인이 없었습니다.");
  }

  if (estimatedDays) {
    bullets.push(
      `예상 처리기간 ${estimatedDays.min}~${estimatedDays.max}일은 유사 사례의 통상적인 소요 기간을 기준으로 산정했습니다.`
    );
  }

  return bullets;
}

function DiagnosisReportCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { feasibilityScore, resultTone, estimatedDays, checklist, note } =
    diagnosis.customerView;
  const aiReasonBullets = buildAiReasonBullets(
    feasibilityScore,
    resultTone,
    checklist,
    estimatedDays
  );
  const aiReasonSections = [
    { title: "✅ 기본 요건 충족", description: aiReasonBullets[0] },
    { title: "⚠ 확인이 필요한 사항", description: aiReasonBullets[1] },
    ...(aiReasonBullets[2]
      ? [{ title: "🕒 처리기간 판단", description: aiReasonBullets[2] }]
      : []),
  ];
  const toneLabel =
    resultTone === "possible" ? "가능" : resultTone === "conditional" ? "조건부 가능" : "어려움";
  const issueCount = checklist.filter((c) => !c.passed).length;
  const boxBg = resultTone === "possible" ? "bg-emerald-50" : "bg-amber-50";
  const boxText = resultTone === "possible" ? "text-emerald-800" : "text-amber-800";
  const badgeBg = resultTone === "possible" ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = resultTone === "possible" ? "text-emerald-700" : "text-amber-700";

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-center gap-3.5">
        <ScoreGauge score={feasibilityScore} tone={resultTone} />
        <div>
          <p className="text-sm font-bold text-gray-900">{toneLabel}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {issueCount > 0 ? `발견된 문제 ${issueCount}건` : "확인된 문제 없음"}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400">
        입력하신 정보 기준 AI 분석 결과입니다.
      </p>

      <div className="mt-4 space-y-2">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 text-xs ${
              item.passed ? "text-gray-700" : boxText
            }`}
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
        추천 분야: 행정
      </div>

      {estimatedDays && (
        <div className="mt-4 rounded-xl bg-white px-4 py-2.5 text-xs text-gray-600">
          예상 처리기간{" "}
          <span className="font-bold text-gray-900">
            {estimatedDays.min}~{estimatedDays.max}일
          </span>
          <p className="mt-1 text-[11px] text-gray-400">
            준비 서류와 관할 기관에 따라 달라질 수 있습니다.
          </p>
        </div>
      )}

      {/* STEP10-7(최종): AI 분석 근거 — 리포트의 핵심 영역, 항목 사이 얇은 구분선으로 리포트형 레이아웃.
          buildAiReasonBullets() 로직은 그대로 사용하고, 화면 구조만 소제목+본문+구분선으로 재구성. */}
      <div className="mt-3 rounded-2xl bg-white border-2 border-blue-100 shadow-sm px-5 py-4">
        <p className="text-sm font-bold text-gray-900">🧠 AI 분석 근거</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          AI는 입력하신 정보를 공개 법령·일반 행정기준·체크리스트를 종합하여 분석했습니다.
        </p>
        <div className="mt-4 divide-y divide-gray-100">
          {aiReasonSections.map((section) => (
            <div key={section.title} className="py-3 first:pt-0 last:pb-0">
              <p className="text-xs font-bold text-gray-900">{section.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>
        <p className="font-bold">💡 안내사항</p>
        <p className="mt-1">{note}</p>
      </div>
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
  const [detailStage, setDetailStage] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [previousRejection, setPreviousRejection] = useState<boolean | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionStepDone, setRejectionStepDone] = useState(false);
  const rejectionRecordIdRef = useRef<string | null>(null);
  const pendingRejectionInsertRef = useRef<PromiseLike<void> | null>(null);
  const messengers = MESSENGERS_KO;
  const selfNotifySentRef = useRef(false);

  const result: Result = computeLicenseResultTone(trc, license);
  const showResult = trc === "yes" && !!license;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "license", trc, license }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [trc, license, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "driving-license",
        source_page: "/check/driving-license",
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

  // 사유를 입력하고 "다음"을 누른 시점에 — 저장이 아직 끝나지 않았으면 먼저 기다린 뒤 —
  // 사유를 업데이트하고 다음 질문으로 진행.
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

  // 관할 포털 링크(직접 등록) 클릭 시점에 응원 이메일을 한 번만 보낸다.
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
    setTrc(null);
    setLicense(null);
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
    setDiagnosis(null);
    setPreviousRejection(null);
    setRejectionReason("");
    setRejectionStepDone(false);
    rejectionRecordIdRef.current = null;
    pendingRejectionInsertRef.current = null;
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

    // expertBrief(전문가용 상세 진단)를 meta에 저장 — 향후 어드민 화면에서 활용
    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "driving_license_diagnosis_lead",
      tag: "DRIVING_LICENSE",
      meta: diagnosis
        ? {
            feasibilityScore: diagnosis.customerView.feasibilityScore,
            expertBrief: diagnosis.expertBrief,
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
        body: JSON.stringify({ leadId, name, phone, email, address }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("lead-submit API error:", errBody);
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
    }

    // 익명으로 미리 저장해둔 거절 이력 기록이 있으면 이번 리드와 연결
    // (저장이 아직 진행 중일 수 있으므로 먼저 기다린다)
    if (pendingRejectionInsertRef.current) {
      await pendingRejectionInsertRef.current;
    }
    if (rejectionRecordIdRef.current) {
      try {
        await supabase
          .from("previous_rejections")
          .update({ linked_lead_id: leadId })
          .eq("id", rejectionRecordIdRef.current);
      } catch (linkErr) {
        console.error("previous_rejections link failed:", linkErr);
      }
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

        {!rejectionStepDone && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              1. 이전에 다른 곳(정부기관 또는 타 대행사)에서 신청하셨다가
              거절·반려되신 적이 있나요?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPreviousRejection(true);
                  recordRejectionAnonymously();
                }}
                className={`rounded-2xl border p-4 text-sm font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${
                  previousRejection === true
                    ? "border-blue-900 bg-blue-50 text-blue-900"
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
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-900 focus:outline-none resize-none"
                />
                <button
                  onClick={finalizeRejectionStep}
                  className="mt-3 w-full h-11 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {rejectionStepDone && !trc && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              2. 현재 거주증(TRC)을 보유하고 계신가요?
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
              3. 본국(자국)에서 발급된 운전면허를 보유하고 계신가요?
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

        {/* 1번째 화면 (가입 전) — 리포트 없이 간단하게, 가입 장벽을 낮게 유지 */}
        {showResult && result === "possible" && !leadSubmitted && (
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
              이름·연락처·주소만 남기시면 AI가 서류를 상세 분석한 리포트를
              바로 보여드립니다.
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
                {submitting ? "접수 중..." : "AI 분석 리포트 무료로 받기"}
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

        {/* 2번째 화면 (가입 직후) — AI 리포트 + 직접등록/전문가 진행요청 선택 */}
        {showResult && result === "possible" && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              운전면허 전환 · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                운전면허 전환에 필요한 서류
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 여권 사본 (인적사항 페이지)
                </li>
                <li className="text-xs text-gray-600 pl-1">· 거주증(TRC) 사본</li>
                <li className="text-xs text-gray-600 pl-1">· 본국 운전면허 원본</li>
                <li className="text-xs text-gray-600 pl-1">
                  · 면허 베트남어 공증 번역본 (국적에 따라 상이)
                </li>
              </ul>
              <p className="mt-2 text-[11px] text-gray-400">
                정확한 요건은 국적·지역에 따라 다를 수 있어 담당자 확인이
                필요합니다.
              </p>
            </div>

            <p className="mt-5 text-xs font-semibold text-gray-700">
              위 내용, 어떻게 진행하시겠어요?
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <a
                href={LICENSE_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSelfPortalClick}
                className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-blue-900 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
              >
                내가 직접 등록할게요 (공식 사이트 연결) <ExternalLink size={14} />
              </a>
              <button
                onClick={() => setDetailStage(true)}
                className="h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
              >
                전문가 진행 요청하기
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              어느 쪽을 선택해도 서류 체크리스트는 동일하게 제공됩니다
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              성/시별 정확한 관할 경찰서(CSGT)를 찾기 위해 국가가 운영하는
              통합 시스템으로 연결됩니다. 지역만 선택하면 바로 연결됩니다.
            </p>

            <button
              onClick={reset}
              className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "possible" && leadSubmitted && !agencyRequested && detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              운전면허 전환 진행 서류 및 절차
            </p>

            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              ⏱ 직접 신청하시는 경우, 지역마다 요구서류와 절차가 조금씩
              달라 정확한 정보를 찾기 어렵고, 공증 번역본 준비 실수로
              반려·재제출이 잦아 시간이 예상보다 오래 걸릴 수 있습니다.
              혹시 걱정되시거나 자신이 없으시다면, 언제든 편하게 도움을
              요청하세요.
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                운전면허 전환에 필요한 서류
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 pl-1">
                  · 여권 사본 (인적사항 페이지)
                </li>
                <li className="text-xs text-gray-600 pl-1">· 거주증(TRC) 사본</li>
                <li className="text-xs text-gray-600 pl-1">· 본국 운전면허 원본</li>
                <li className="text-xs text-gray-600 pl-1">
                  · 면허 베트남어 공증 번역본 (국적에 따라 상이)
                </li>
              </ul>
            </div>

            <p className="mt-4 text-sm font-bold text-gray-900">
              정확하고 문제없이 빠르게 진행하시길 원한다면 반드시 전문가와
              상의하세요.
            </p>

            {agencyError && (
              <p className="mt-3 text-xs text-red-600">{agencyError}</p>
            )}
            <p className="mb-2 text-xs text-gray-500 leading-relaxed">
              직접 진행이 어려운 경우 전문가에게 진행을 요청할 수 있습니다.
            </p>
            <button
              onClick={handleAgencyRequest}
              disabled={agencySaving}
              className="mt-4 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
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
