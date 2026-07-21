"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  getCheckDiagnosis,
  computePermitCompanyResultTone,
  type DiagnosisResult,
  type ResultTone,
  type PermitInvestorType,
  type PermitCapital,
  type PermitOffice,
  type PermitResidentRep,
} from "@/lib/checkDiagnosis";

// 국가기업등록포털 (Cổng Thông tin quốc gia về đăng ký doanh nghiệp).
// IRC/ERC 신청 메뉴 및 관할 기관(Sở Kế hoạch và Đầu tư) 안내로 연결됨.
const PERMIT_COMPANY_OFFICIAL_URL = "https://dangkykinhdoanh.gov.vn/";

type InvestorChoice = PermitInvestorType | "local_nominee";
type Capital = PermitCapital;
type Office = PermitOffice;
type ResidentRep = PermitResidentRep;
type Result = ResultTone | null;

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

function ScoreGauge({
  score,
  tone,
}: {
  score: number;
  tone: "possible" | "conditional";
}) {
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

function DiagnosisReportCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { feasibilityScore, resultTone, estimatedDays, checklist, note } =
    diagnosis.customerView;
  const tone = resultTone === "possible" ? "possible" : "conditional";
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
        추천 분야: 기업설립
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

      <div className={`mt-3 rounded-xl ${boxBg} px-4 py-3 text-xs ${boxText}`}>{note}</div>
    </div>
  );
}

export default function PermitCompanyCheckPage() {
  const [investorChoice, setInvestorChoice] = useState<InvestorChoice | null>(null);
  const [capital, setCapital] = useState<Capital>(null);
  const [office, setOffice] = useState<Office>(null);
  const [residentRep, setResidentRep] = useState<ResidentRep>(null);
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

  const isLocalNominee = investorChoice === "local_nominee";
  const investorType: PermitInvestorType =
    investorChoice === "corporate" || investorChoice === "individual" ? investorChoice : null;
  const isCorporate = investorType === "corporate";

  const result: Result = computePermitCompanyResultTone(capital, office);
  const showResult = investorType && capital && office && residentRep;

  useEffect(() => {
    let cancelled = false;
    if (showResult) {
      getCheckDiagnosis({
        service: "permit_company",
        investorType,
        capital,
        office,
        residentRep,
      }).then((res) => {
        if (!cancelled) setDiagnosis(res);
      });
    } else {
      setDiagnosis(null);
    }
    return () => {
      cancelled = true;
    };
  }, [investorType, capital, office, residentRep, showResult]);

  // "네, 있습니다" 클릭 즉시 익명으로 저장 — 회원가입 여부와 무관하게 데이터가 남는다.
  // 삽입 Promise를 ref에 저장해두고, "다음" 클릭 시 이 Promise가 끝날 때까지
  // 기다린 뒤 사유를 업데이트한다 (빠르게 연속 클릭해도 순서가 꼬이지 않도록).
  // (check/wp/page.tsx와 동일한 패턴)
  function recordRejectionAnonymously() {
    const id = crypto.randomUUID();
    pendingRejectionInsertRef.current = supabase
      .from("previous_rejections")
      .insert({
        id,
        service_type: "permit_company",
        source_page: "/register/company",
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
    setInvestorChoice(null);
    setCapital(null);
    setOffice(null);
    setResidentRep(null);
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
        tag: "PERMIT_COMPANY",
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
      service_type: "permit_company",
      result: result,
      source_page: "/register/company",
    });

    if (error) {
      console.error(error);
      setLeadError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: newLeadId,
      action: "permit_company_diagnosis_lead",
      tag: "PERMIT_COMPANY",
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
        body: JSON.stringify({ leadId: newLeadId, name, phone, email, address }),
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
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접허가받기 · 베트남 인허가전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          법인설립 가능성 진단
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          투자자 유형에 따라 필요서류가 크게 달라집니다.
        </p>

        {/* 신규: 거절이력 질문 — check/wp/page.tsx와 동일한 패턴 */}
        {!rejectionStepDone && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              1. 이전에 다른 곳(정부기관 또는 타 대행사)에서 법인설립을
              신청하셨다가 거절·반려되신 적이 있나요?
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

        {rejectionStepDone && !investorChoice && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              2. 어떤 방식으로 투자하시나요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-1">
              {[
                { key: "corporate", label: "한국 본사(법인)가 투자", desc: "한국 법인이 베트남 법인 지분을 소유" },
                { key: "individual", label: "개인이 직접 투자", desc: "본인이 주주(소유주)로 참여" },
                { key: "local_nominee", label: "베트남 현지인 명의 활용을 고려 중", desc: "" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setInvestorChoice(opt.key as InvestorChoice)}
                  className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                >
                  <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                  {opt.desc && <p className="mt-1 text-xs text-gray-500">{opt.desc}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && isLocalNominee && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              법적 보호를 받기 어려운 방식입니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              베트남 현지인 명의를 활용한 사업 진행은 법적으로 보호받지
              못하며, 명의자와의 분쟁이나 투자금 손실로 이어진 사례가
              다수 있습니다. 대부분의 업종은 외국인 법인투자 또는 개인투자로도
              정상적으로 진행 가능하니, 먼저 그 가능성부터 확인해보시길
              권합니다.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() => setInvestorChoice(null)}
                className="h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
              >
                법인투자 · 개인투자로 다시 확인하기
              </button>
              <Link
                href="/consultation?case=permit-local-nominee-warning"
                className="flex h-12 items-center justify-center rounded-full border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
              >
                전문가와 바로 상담하기
              </Link>
            </div>
          </div>
        )}

        {rejectionStepDone && investorType && !capital && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              3.{" "}
              {isCorporate
                ? "감사보고서 또는 은행 잔고증명서가 준비되어 있나요?"
                : "투자금 이상의 개인 은행 잔고증명서가 있나요?"}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "confirmed", label: "준비되어 있음" },
                { key: "unconfirmed", label: "아직 미확정" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCapital(opt.key as Capital)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && investorType && capital && !office && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              4. 사무실 임대차 계약을 체결하셨나요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "secured", label: "체결 완료" },
                { key: "unsecured", label: "아직 미체결" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setOffice(opt.key as Office)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {rejectionStepDone && investorType && capital && office && !residentRep && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-900">
              5. 대표자(법인장)가 베트남에 상주하며 근무할 예정인가요?
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { key: "yes", label: "예, 상주 근무 예정" },
                { key: "no", label: "아니오" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setResidentRep(opt.key as ResidentRep)}
                  className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showResult && result === "possible" && !leadSubmitted && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              법인설립 진행이 가능합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              현재 자본금·사무실 준비 상태 기준으로 법인설립(IRC/ERC) 신청
              요건을 충족합니다.
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
            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "possible" && leadSubmitted && !agencyRequested && !detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              법인설립 · AI 분석 리포트
            </p>

            {diagnosis && (
              <div className="mt-3">
                <DiagnosisReportCard diagnosis={diagnosis} />
              </div>
            )}

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">법인설립에 필요한 서류</p>
              <ul className="mt-2 space-y-1">
                {isCorporate ? (
                  <>
                    <li className="text-xs text-gray-600 pl-1">· 사업자등록증명원 · 법인등기부등본</li>
                    <li className="text-xs text-gray-600 pl-1">· 본사 정관 · 이사회결의서 · 위임장(POA)</li>
                    <li className="text-xs text-gray-600 pl-1">· 감사보고서 또는 은행 잔고증명서</li>
                  </>
                ) : (
                  <>
                    <li className="text-xs text-gray-600 pl-1">· 투자자 여권 공증본</li>
                    <li className="text-xs text-gray-600 pl-1">· 위임장(POA)</li>
                    <li className="text-xs text-gray-600 pl-1">· 개인 은행 잔고증명서</li>
                  </>
                )}
                <li className="text-xs text-gray-600 pl-1">· 사무실 임대차 계약서(현지)</li>
              </ul>
              <p className="mt-2 text-[11px] text-gray-400">
                정확한 요건은 업종·상황에 따라 다를 수 있어 담당자 확인이
                필요합니다.
              </p>
            </div>

            <p className="mt-5 text-xs font-semibold text-gray-700">
              위 내용, 어떻게 진행하시겠어요?
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <a
                href={PERMIT_COMPANY_OFFICIAL_URL}
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
              국가기업등록포털(Cổng Thông tin quốc gia về đăng ký doanh nghiệp)로
              이동합니다. 접속 후 관할 성·시(Sở Kế hoạch và Đầu tư)를
              선택하시면 IRC/ERC 신청 메뉴를 찾으실 수 있습니다.
            </p>

            <button onClick={reset} className="mt-4 block text-xs text-gray-400 hover:text-gray-600">
              처음부터 다시 확인하기
            </button>
          </div>
        )}

        {showResult && result === "possible" && leadSubmitted && !agencyRequested && detailStage && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">법인설립 진행 서류 및 절차</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">
                  ① 한국에서 준비 (번역·공증·아포스티유 필요)
                </p>
                {isCorporate ? (
                  <ul className="mt-2 space-y-2">
                    <li className="text-xs text-gray-600 pl-1">
                      · 사업자등록증명원(3개월 이내) · 법인등기부등본
                    </li>
                    <li className="text-xs text-gray-600 pl-1">
                      · 본사 정관, 최근 2개년 감사보고서(설립 2년 미만 시
                      잔고증명서로 대체 가능)
                    </li>
                    <li className="text-xs text-gray-600 pl-1">
                      · 이사회결의서 · 위임장(POA) · 법정대리인 여권 사본
                    </li>
                  </ul>
                ) : (
                  <ul className="mt-2 space-y-2">
                    <li className="text-xs text-gray-600 pl-1">
                      · 여권 공증본 (유효기간 2년 6개월 이상 권장)
                    </li>
                    <li className="text-xs text-gray-600 pl-1">
                      · 개인 은행 잔고증명서 (최근 1~2주 이내 영문 발급본)
                    </li>
                    <li className="text-xs text-gray-600 pl-1">· 위임장(POA)</li>
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-gray-400">
                  베트남은 아포스티유 협약국이 아니라, 아포스티유 대신 외교부
                  영사확인 절차를 거쳐야 합니다.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">② 베트남 현지에서 준비</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-xs text-gray-600 pl-1">
                    · 사무실/공장 임대차 계약서(공증본) 및 임대인 법적 권리
                    증빙(Red Book, 건설허가서 등)
                  </li>
                  <li className="text-xs text-gray-600 pl-1">
                    · 현지 대표자(법인장) 여권 사본(공증본)
                  </li>
                  {residentRep === "yes" && (
                    <li className="text-xs text-gray-600 pl-1">
                      · 대표자 학위증명서 · 경력증명서 · 범죄경력회보서(3개월
                      이내) — 상주 근무 시 노동허가·거주증 발급용으로 필요
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">③ 설립 절차 요약</p>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  서류 준비·공증 → 임대차 계약 체결 → IRC(투자등록증)
                  신청·발급 → ERC(기업등록증) 신청·발급 → 법인 직인 제작 및
                  등록 → 직접투자자본계좌(DICA) 및 법인 주거래계좌 개설 →
                  90일 이내 자본금 납입 완료
                </p>
                <p className="mt-2 text-[11px] text-gray-400">
                  업종·조건에 따라 ERC 선진행도 가능합니다.
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
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-blue-900" />
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
              현재 자본금 또는 사무실 준비 상태만으로는 법인설립 신청이
              자동으로 진행되지 않습니다. 준비 서류를 보완하면 진행할 수 있는
              경우가 많습니다.
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              이름·연락처·주소만 남기시면 AI가 어떤 부분이 문제인지 분석한
              리포트를 바로 보여드립니다.
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
                className="w-full h-12 rounded-full bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors"
              >
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
              법인설립 · AI 분석 리포트
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
              href="/consultation?case=permit-company-conditional"
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
