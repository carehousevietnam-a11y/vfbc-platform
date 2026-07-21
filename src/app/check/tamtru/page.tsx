"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Home as HomeIcon,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";
import {
  getCheckDiagnosis,
  computeTamtruResultTone,
  type DiagnosisResult,
  type TamtruTiming,
} from "@/lib/checkDiagnosis";

const TAMTRU_OFFICIAL_URL = "https://evisa.gov.vn/khai-bao-tam-tru";

type Housing = "hotel" | "personal" | null;
type Timing = TamtruTiming;
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
  const passedItems = checklist.filter((c) => c.passed).map((c) => c.label);
  const metRequirementsText =
    passedItems.length > 0
      ? `${passedItems.join(", ")} 항목을 충족하셨습니다.`
      : "현재 입력하신 정보 기준으로 충족된 항목이 없습니다.";
  const processingTimeText = estimatedDays
    ? `예상 처리기간은 ${estimatedDays.min}~${estimatedDays.max}일이며, 준비 서류와 관할 기관에 따라 달라질 수 있습니다.`
    : null;
  const aiReasonSections = [
    { title: "✅ 기본 요건 충족", description: metRequirementsText },
    { title: "⚠ 확인이 필요한 사항", description: aiReasonBullets[1] },
    ...(processingTimeText
      ? [{ title: "🕒 처리기간 판단", description: processingTimeText }]
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

      {/* STEP10-8: AI 분석 근거 카드 UI 개선 — 파란 원형 AI 배지, 실제로 보이는 구분선(border-t),
          체크리스트 기반 실제 요약 문구, 분석 기준 푸터. buildAiReasonBullets()는 "확인이 필요한 사항"에만
          그대로 사용하며 함수 자체는 변경하지 않음. */}
      <div className="mt-3 rounded-2xl bg-white border-2 border-blue-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            AI
          </span>
          <p className="text-sm font-bold text-gray-900">AI 분석 근거</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          공개 법령·행정 기준·체크리스트를 종합하여 분석했습니다.
        </p>
        <div className="mt-4">
          {aiReasonSections.map((section, idx) => (
            <div
              key={section.title}
              className={idx === 0 ? "pb-4" : "border-t border-gray-200 py-4"}
            >
              <p className="text-xs font-bold text-gray-900">{section.title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600">
                {section.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-1 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
          분석 기준: 공개 법령 · 행정 기준 · 체크리스트 · 유사 사례
        </p>
      </div>

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>
        <p className="font-bold">💡 안내사항</p>
        <p className="mt-1">{note}</p>
      </div>
    </div>
  );
}

// STEP10-11: 진행 방법 선택 UI — TRC/WP 디자인 표준을 그대로 적용.
// 링크(href/onClick)·버튼 action은 기존 그대로 유지, UI(카드 구조)만 통일.
function ProcessMethodCards({
  onSelf,
  onExpert,
}: {
  onSelf: () => void;
  onExpert: () => void;
}) {
  return (
    <div>
      <p className="mt-5 text-sm font-bold text-gray-900">
        어떤 방법으로 진행하시겠습니까?
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:items-stretch">
        <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-bold text-gray-900">직접 신청</p>
          <span className="mt-1.5 w-fit rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
            ✓ 직접 신청 가능
          </span>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            정부 공식 사이트에서 바로 신청할 수 있습니다.
          </p>
          <a
            href={TAMTRU_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSelf}
            className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-full border border-blue-900 text-[13px] font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
          >
            정부 사이트로 이동 <ExternalLink size={13} />
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            ↗ 정부 공식 사이트로 이동합니다.
          </p>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-bold text-gray-900">전문가와 함께</p>
          <span className="mt-1.5 w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-800">
            ✓ 최종 확인 필요
          </span>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            전문가가 서류와 절차를 함께 확인합니다.
          </p>
          <button
            onClick={onExpert}
            className="mt-4 h-10 w-full rounded-full bg-blue-900 text-[13px] font-semibold text-white hover:bg-blue-950 transition-colors"
          >
            진행 요청하기
          </button>
          <p aria-hidden="true" className="invisible mt-2 text-center text-[11px] text-slate-500">
            ↗ 정부 공식 사이트로 이동합니다.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-gray-400 text-center">
        어떤 방법을 선택하시더라도 AI 분석 결과는 그대로 활용됩니다.
      </p>
    </div>
  );
}

export default function TamTruCheckPage() {
  const [housing, setHousing] = useState<Housing>(null);
  const [landlordIssue, setLandlordIssue] = useState<boolean | null>(null);
  const [timing, setTiming] = useState<Timing>(null);

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
  const showLegalEscalation = landlordIssue === true;
  const selfNotifySentRef = useRef(false);

  const result: Result = computeTamtruResultTone(timing);
  const showResult = housing === "personal" && landlordIssue === false && !!timing;

  // 진단 완료 시 AI 리포트(customerView + expertBrief) 계산.
  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({ service: "tamtru", timing }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [timing, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "tamtru",
        source_page: "/check/tamtru",
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
    setHousing(null);
    setLandlordIssue(null);
    setTiming(null);
    setLeadSubmitted(false);
    setLeadId(null);
    setSubmitting(false);
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
        tag: "TAMTRU",
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
      service_type: "tamtru",
      result: result,
      source_page: "/check/tamtru",
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
      action: "tamtru_diagnosis_lead",
      tag: "TAMTRU",
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
          땀주 (임시거주등록) 확인
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          숙소 형태에 따라 등록 방법이 다릅니다. 몇 가지만 확인할게요.
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

        {/* 법률 긴급 에스컬레이션 (최우선 처리) */}
        {rejectionStepDone && showLegalEscalation ? (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ShieldAlert className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              법률긴급구조센터로 바로 연결이 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              집주인이 임시거주 등록을 거부하거나 금전을 요구하는 경우, 단순
              행정 문제가 아니라 분쟁·갈취 사안으로 다뤄야 합니다. VFBCAI
              전문 변호사가 직접 확인합니다.
            </p>
            <Link
              href="/consultation?case=tamtru-landlord-dispute"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              법률긴급구조센터 상담 신청
            </Link>
            <button
              onClick={reset}
              className="mt-3 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        ) : rejectionStepDone ? (
          <>
            {/* STEP 1: 숙소 형태 */}
            {!housing && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  2. 현재 숙소 형태가 어떻게 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setHousing("hotel")}
                    className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <Building className="text-blue-900" size={22} />
                    <p className="mt-3 text-sm font-bold text-gray-900">
                      호텔 · 게스트하우스
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      숙박업소에 머무는 경우
                    </p>
                  </button>
                  <button
                    onClick={() => setHousing("personal")}
                    className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <HomeIcon className="text-blue-900" size={22} />
                    <p className="mt-3 text-sm font-bold text-gray-900">
                      개인주택 · 아파트 · 지인집
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      임대 또는 지인 거주
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* 호텔인 경우: 바로 결과 */}
            {housing === "hotel" && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  등록 의무는 숙박업소에 있습니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  호텔·게스트하우스는 법적으로 투숙객의 임시거주 등록을 직접
                  처리해야 합니다. 프론트 데스크에서 처리 여부를 확인만
                  하시면 됩니다.
                </p>
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  체크인 시 여권을 제출하지 않으셨다면, 지금 프론트에
                  문의하세요.
                </div>
                <button
                  onClick={reset}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600"
                >
                  다른 숙소 형태로 다시 확인하기
                </button>
              </div>
            )}

            {/* STEP 2: 개인주택인 경우 - 집주인 이슈 확인 */}
            {housing === "personal" && landlordIssue === null && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  3. 집주인이 등록을 거부하거나 금전을 요구하시나요?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLandlordIssue(true)}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-red-200 hover:-translate-y-0.5 transition-all"
                  >
                    네, 그렇습니다
                  </button>
                  <button
                    onClick={() => setLandlordIssue(false)}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                  >
                    아니요
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 경과일 */}
            {housing === "personal" && landlordIssue === false && !timing && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  4. 베트남에 도착(또는 숙소 이동)하신 지 얼마나 되셨나요?
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { key: "within12", label: "12시간 이내" },
                    { key: "within24", label: "12~24시간" },
                    { key: "over24", label: "24시간 초과" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setTiming(opt.key as Timing)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1번째 화면 (가입 전) — 리포트 없이 간단하게, 가입 장벽을 낮게 유지 */}
            {showResult && !leadSubmitted && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {timing === "over24" && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    신고 기한(12~24시간)이 이미 지났을 수 있습니다. 서둘러
                    등록을 진행하세요.
                  </div>
                )}
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  임시거주(땀주) 신고를 진행할 수 있습니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  이름·연락처·주소만 남기시면 AI가 신고 조건을 분석한
                  리포트와 관할 사이트를 바로 보여드립니다.
                </p>

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
                  <p className="text-[11px] text-gray-400 -mt-1">
                    주소가 있어야 관할 phường(동) 사이트를 정확히 찾아드릴
                    수 있어요.
                  </p>
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
                  {leadError && (
                    <p className="text-xs text-red-600">{leadError}</p>
                  )}
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
            {showResult && leadSubmitted && !agencyRequested && !detailStage && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  땀주(임시거주등록) · AI 분석 리포트
                </p>

                {diagnosis && (
                  <div className="mt-3">
                    <DiagnosisReportCard diagnosis={diagnosis} />
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-700">
                    땀주 신고에 필요한 서류
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs text-gray-600 pl-1">· 여권 원본 및 사본</li>
                    <li className="text-xs text-gray-600 pl-1">
                      · 임대차 계약서 (또는 집주인 확인서)
                    </li>
                    <li className="text-xs text-gray-600 pl-1">· 숙소 주소지 증빙</li>
                  </ul>
                  <p className="mt-2 text-[11px] text-gray-400">
                    정확한 요건은 관할 지역에 따라 다를 수 있어 담당자 확인이
                    필요합니다.
                  </p>
                </div>

                <ProcessMethodCards
                  onSelf={handleSelfPortalClick}
                  onExpert={() => setDetailStage(true)}
                />
                <p className="mt-2 text-[11px] text-gray-400">
                  베트남 출입국관리국 전자포털(임시거주 신고 페이지)로
                  이동합니다. 화면 안내에 따라 신고 내용을 확인하고
                  진행하시면 됩니다.
                </p>

                <button
                  onClick={reset}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}

            {/* 전문가 진행요청 상세 단계 */}
            {showResult && leadSubmitted && !agencyRequested && detailStage && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-lg font-bold text-gray-900">
                  VFBCAI 땀주 전문가 진행요청
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-900">
                  예상 비용은 문자로 보내드리겠습니다
                </p>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  여권, 임대계약서만 보내주시면 관할 사이트 신고부터 완료
                  확인까지 대신 처리해드립니다.
                </p>

                {timing === "over24" && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    신고 기한이 지났을 가능성이 높습니다. 빠른 처리가
                    필요합니다.
                  </div>
                )}

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
                  이미 입력하신 정보로 바로 접수되며, 다시 입력하실 필요
                  없습니다.
                </p>

                <button
                  onClick={() => setDetailStage(false)}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  ← 간단 목록으로 돌아가기
                </button>
              </div>
            )}

            {/* 전문가 진행요청 완료 */}
            {showResult && agencyRequested && (
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
          </>
        ) : null}
      </div>
    </main>
  );
}
